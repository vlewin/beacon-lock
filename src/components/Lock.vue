<template>
  <div id="lock">
    <div class="container">
      <svg class="radar" width="100%" height="100%" viewBox="0 0 100 100">
        <circle class="lock" cx="50" cy="50" v-bind:r="lockRadius" stroke="#666" stroke-dasharray="2" stroke-width="0.25" fill="transparent" />

        <circle class="lock" cx="50" cy="50" r="20" v-bind:stroke="color" stroke-width="0.75" fill="transparent" />
        <circle class="signal" cx="50" cy="50" v-bind:r="signal" fill="#555"  />
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
          <label>ACCURACY (ESTIMATED)</label>
          <h2>{{ accuracy.toFixed(2) }}m ({{ proximity }})</h2>
        </p>

        <p>
          <label>LOCK RADIUS</label>
          <br>
          <h2>
            {{ lockRadius }}
            <input type="range" v-model="lockRadius" min="20" max="100" step="10">
          </h2>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Lock',
    data () {
      return {
        dist: 'N/A',
        delay: 5,
        message: null,
        lockTimeout: null,
        lockCountDown: null,
        status: 'unlocked'
      }
    },

    created () {
      // this.$store.dispatch('connect')
    },

    mounted () {
    },

    computed: {
      text: function () {
        return this.signal >= this.lockRadius ? 'LOCKED' : 'UNLOCKED'
      },

      color: function () {
        return this.signal >= this.lockRadius ? '#ff5252' : '#42b983'
      },

      accuracy: function () {
        return this.$store.state.accuracy
      },

      proximity: function () {
        return this.$store.state.proximity
      },

      rssi: function () {
        return this.$store.state.rssi
      },

      signal: function () {
        return this.$store.state.rssi * -1
      },

      lockRadius() {
        console.log(this.$store.state.radius)
        return this.$store.state.radius * -1
      },

      signalRadius: function () {
        return this.signal
      },

      visibleRadius: function () {
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
      signal: function (val) {
        // console.log('Status: ', this.status, 'signal', this.signal, 'lockRadius', this.lockRadius)
        if (this.unlocked && (this.signal >= this.lockRadius)) {
          this.lock()
        } else if (!this.unlocked && (this.signal < this.lockRadius)) {
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
          _this.$store.dispatch('lock')
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
      }
    }
  }
</script>
