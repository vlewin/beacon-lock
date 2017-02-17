<template>
  <div id="calibration">
    <div class="device">
      <img src="../assets/images/macbook.svg" />
    </div>

    <div class="content">
      <div class="content-top">
        <div class="grey-text">
          POSITION YOUR BEACON IN THE 'UNLOCK' ZONE
          <!-- NOW MOVE TO 'LOCK' ZONE AND STAY THERE FOR 5 SECONDS -->
        </div>
        <div v-if="running">
          <h3>CALIBRATING ...</h3>
          <h2>CURRENT RSSI: {{ rssi }} <br /> AVG RSSI {{ average }}</h2>
        </div>

        <div v-if="calibrated">
          <h3>RECOMMENDED LOCK RADIUS</h3>
          <h2>{{ radius }}</h2>
        </div>
      </div>
      <div class="content-bottom">
        <div v-if="running" class="beacon" v-on:click="stop">WAIT ...</div>
        <div v-else class="beacon" v-on:click="start">START</div>

        <a href="#" class="beacon" v-on:click.stop.prevent="lock">LOCK</div>

      </div>
    </div>

  </div>

</template>


<script>
  import { ws } from '../main.js'

  export default {
    name: 'Calibration',
    data () {
      return {
        socket: null,
        running: false,
        values: [],
        rssi: 0,
        accuracy: null,
        radius: null
      }
    },

    created () {
      // this.connect()
    },

    mounted () {
    },

    computed: {
      calibrated() {
        return this.$store.state.calibrated
      },

      average: function() {
        if(this.values.length) {
          return Math.round(this.values.reduce(function(prev, next) { return prev + next  }) / this.values.length)
        }

        return 'N/A'
      },

      text: function () {
        return this.signal > this.lockRadius ? 'LOCKED' : 'UNLOCKED'
      }
    },

    watch: {
      rssi: function (val) {
        console.log('RSSI: ', this.rssi, 'accuracy', this.accuracy)
      }
    },

    methods: {
      start() {
        const _this = this
        this.running = true
        this.$store.dispatch('setCalibrated', false)

        let interval = setInterval(function() {
          _this.rssi = _this.$store.state.rssi
          _this.accuracy = _this.$store.state.accuracy
          _this.values.push(_this.rssi)
        }, 500)

        setTimeout(function() {
          clearInterval(interval)
          _this.stop()
        }, 5000)

      },

      stop() {
        let _this = this

        this.running = false
        this.radius = this.average + -10
        this.values = []

        this.$store.dispatch('setRadius', this.radius)
        this.$store.dispatch('setCalibrated', true)
        this.redirect()
      },

      redirect() {
        let _this = this
        setTimeout(function() {
          _this.$router.push('lock')
        }, 3000)
      },

      lock() {
        this.$store.dispatch('lock')
      }
    }
  }
</script>
