<template>
  <div id="calibration">
    <div class="">
      <!-- {{ devices }} -->
      <!-- <img src="../assets/images/macbook.svg" /> -->
      <!-- <div v-for="device in Object.keys(devices)">
        {{ device }} - {{ devices[device].values}}
      </div> -->
      <svg width="100%" height="100%" viewBox="0 0 400 100">
        <g v-for="(device, index) in Object.keys(devices)">
          <text v-bind:x="index*200" v-bind:y="0" font-family="Verdana" font-size="10">
            {{ device }}
          </text>

          <!-- {{ devices[device].values.join(' ') }} -->
          <!-- <line x1="20" y1="50" x2="500" v-bind:y2="50" stroke-width="1" stroke="grey"/> -->
          <rect
            v-for="(value, index) in devices[device].values"
            :x="index*3+20"
            :y="value"
            :width="z"
            :height="z"
            v-bind:fill="devices[device].color">
          </rect>
          <!-- <polyline v-bind:points="devices[device].values.join(' ').split(' ').map(function(s) { return parseInt(s); })" v-bind:stroke="devices[device].color" fill="transparent" stroke-width="1"/> -->
        </g>

        <g v-for="(value, index) in [10,20,30,40,50,60,70,80,90,100]">
          <text v-bind:x="0" v-bind:y="value" font-family="Verdana" font-size="5">
            {{ value }}
          </text>
          <line x1="20" y1="50" x2="500" v-bind:y2="50" stroke-width="1" stroke="grey"/>
        </g>
      </svg>
    </div>

    <div class="content">
      <div class="content-bottom">
        <div v-if="running" class="beacon" v-on:click="stop">STOP</div>
        <div v-else class="beacon" v-on:click="start">START</div>
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
        devices: {
          // 'Minew': { color: 'red', values: [] },
          'nut': { color: 'green', values: [] }
          // 'MiniBeacon_10423': { color: 'blue', values: [] }
        },
        values: [],
        rssi: 0,
        accuracy: null,
        radius: null,
        z: 2
      }
    },

    created () {
      // this.connect()
    },

    mounted () {
    },

    computed: {
      average: function () {
        if (this.values.length) {
          return Math.round(this.values.reduce(function (prev, next) { return prev + next }) / this.values.length)
        }

        return 'N/A'
      },

      event () {
        return this.$store.state.event
      }
    },

    watch: {
      rssi: function (val) {
        console.log('RSSI: ', this.rssi, 'accuracy', this.accuracy)
      }
    },

    methods: {
      start () {
        const _this = this
        this.running = true
        this.$store.dispatch('setCalibrated', false)

        const interval = setInterval(function () {
          if (_this.event) {
            _this.devices[_this.event.name].values.push(_this.event.rssi * -1)
          }

          // _this.rssi = _this.$store.state.rssi
          // _this.accuracy = _this.$store.state.accuracy
          // _this.values.push(_this.rssi * -1)
        }, 300)

        setTimeout(function () {
          clearInterval(interval)
          _this.stop()
        }, 60000)
      },

      stop () {
        const _this = this

        this.running = false
        this.radius = this.average + -10
        this.values = []

        this.$store.dispatch('setRadius', this.radius)
        this.$store.dispatch('setCalibrated', true)
      }
    }
  }
</script>

<style>
  /*g rect { fill: red; }*/
</style>
