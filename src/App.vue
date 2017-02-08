<template>
  <div id="app">
    <div class="flex-container" v-if="!connected">
      <no-backend-service></no-backend-service>
    </div>

    <div class="flex-container" v-if="connected && !peripheralConnected">
      <no-peripherial></no-peripherial>
    </div>

    <div class="flex-container" v-if="connected && peripheralConnected && !calibrated">
      <calibration></calibration>
    </div>

    <div class="container" v-if="connected && peripheralConnected && calibrated">
      <svg class="radar" width="100%" height="100%" viewbox="0 0 100 100" data-pct="100">
        <circle class="lock" cx="50" cy="50" r="20" v-bind:stroke="color" fill="transparent" />
        <circle class="signal" cx="50" cy="50" v-bind:r="signalRadius" fill="#555"  />
        <text class="text" x="50%" y="45%" dy=".3em" fill="#555" font-size="0.37rem">
          {{ status }}
        </text>
        <text class="text" x="50%" y="55%" dy=".3em" fill="#555" font-size="0.25rem">
          <template v-if="message">
            {{ message }}
          </template>
          <template v-else>
            RSSI: {{ rssi }}
          </template>
        </text>
      </svg>

      <div class="info">
        <p>
          <label>ESTIMATED DISTANCE</label>
          <br>
          <h2>{{ dist }} m</h2>
        </p>

        <p>
          <label>LOCK RADIUS</label>
          <br>
          <h2>{{ lockRadius }}</h2>
          <input type="range" v-model="lockRadius" min="0" max="100" step="10">
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import NoBackendService from './components/NoBackendService.vue'
  import NoPeripherial from './components/NoPeripherial.vue'
  import Calibration from './components/Calibration.vue'
  import { ws } from './main.js'

  export default {
    name: 'App',
    components: {
      NoBackendService,
      NoPeripherial,
      Calibration
    },

    data () {
      return {
        connected: false,
        peripheralConnected: false,
        peripheralName: null,
        calibrated: true,
        rssi: 0,
        dist: 'N/A',
        delay: 5,
        message: null,
        lockTimeout: null,
        lockCountDown: null,
        lockRadius: 45,
        status: 'unlocked'
      }
    },

    created () {
      this.connect()
    },

    mounted () {
    },

    computed: {
      text: function () {
        return this.signal > this.lockRadius ? 'LOCKED' : 'UNLOCKED'
      },

      color: function () {
        return this.signal > this.lockRadius ? '#ff5252' : '#42b983'
      },

      signal: function () {
        return this.rssi * -1
      },

      signalRadius: function () {
        return this.signal / 2
      },

      radius: function () {
        return this.lockRadius / 2
      },

      locked: function () {
        return this.status === 'locked'
      },

      unlocked: function () {
        return this.status === 'unlocked'
      }
    },

    watch: {
      rssi: function (val) {
        console.log('Status: ', this.status, 'signal', this.signal, 'lockRadius', this.lockRadius)
        if (this.unlocked && (this.signal >= this.lockRadius)) {
          this.lock()
        } else if (this.locked && (this.signal < this.lockRadius)) {
          console.info('Beacon nearby - Unlock and clear timeout and countdown')
          this.reset()
        }
      }
    },

    methods: {
      lock () {
        const _this = this

        this.status = 'locking'
        this.delay = 5
        this.countdown()

        this.lockTimeout = setTimeout(function () {
          console.log('Lock my Mac')
          _this.status = 'locked'
        }, 5000)
      },

      countdown () {
        this.delay -= 1

        if (this.delay > 0) {
          this.message = ' in ' + this.delay
          this.lockCountDown = setTimeout(this.countdown, 1000)
        } else {
          this.message = 'NOW'
          console.log('Time is out')
        }
      },

      reset () {
        this.status = 'unlocked'
        this.message = null

        clearTimeout(this.lockTimeout)
        clearTimeout(this.lockCountDown)
      },

      connect () {
        const _this = this

        ws.onopen = function () {
          _this.connected = true
          // ws.send("Message to send");
          // console.log("Message is sent...");
        }

        ws.onmessage = function (event) {
          var data = JSON.parse(event.data)
          if (data.event === 'connected') {
            console.info('peripheral', data.name, 'connected')
            _this.peripheralName = data.name
            _this.peripheralConnected = true
          } else if (data.event === 'data') {
            _this.peripheralConnected = true
            // console.log(data.timestamp, 'name', data.name, 'RSSI:', data.rssi, 'DIST:', data.dist)
            _this.rssi = data.rssi
            _this.dist = data.dist
          } else if (data.event === 'disconneted') {
            console.info('peripheral', data.name, 'disconneted')
            _this.peripheralName = data.name
            _this.peripheralConnected = false
          } else {
            console.warn('Unknown event', data)
          }
        }

        ws.onclose = function (e) {
          _this.connected = false

          console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason)
          setTimeout(function () {
            _this.connect()
          }, 1000)
        }

        ws.onerror = function (err) {
          console.error('Socket encountered error: ', err.message, 'Closing socket')
          ws.close()
        }
      }
    }
  }
</script>
