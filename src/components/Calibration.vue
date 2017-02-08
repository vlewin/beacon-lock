<template>
  <div id="calibration">
    <div class="device">
      <img src="../assets/images/macbook.svg" />
    </div>

    <div class="content">
      <div class="content-top">
        <div class="grey-text">
          POSITION YOUR BEACON IN THE 'UNLOCK' ZONE
        </div>
        <div>
          <h2>CALIBRATING ...</h2>
          <h4>CURRENT RSSI: {{ rssi }} <br /> AVG {{ average }}</h4>
        </div>
      </div>
      <div class="content-bottom">
        <div v-if="running" class="beacon" v-on:click="stop">STOP</div>
        <div v-else="running" class="beacon" v-on:click="start">START</div>
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
        running: false,
        values: [],
        rssi: 0,
        distance: null,
      }
    },

    created () {
      // this.connect()
    },

    mounted () {
    },

    computed: {
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
        console.log('RSSI: ', this.rssi, 'distance', this.distance)
      }
    },

    methods: {
      start() {
        const _this = this
        this.running = true

        ws.send(JSON.stringify({ event: 'calibrationn_start' }));

        ws.onmessage = function (event) {
          var data = JSON.parse(event.data)
          if (data.event === 'connected') {
            console.info('peripheral', data.name, 'connected')
          } else if (data.event === 'data') {
            console.log(data)
            _this.rssi = data.rssi
            _this.values.push(_this.rssi)
          } else if (data.event === 'disconneted') {
            console.info('peripheral', data.name, 'disconneted')
          } else {
            console.warn('Unknown event', data)
          }
        }
      },

      stop() {
        this.running = false
        ws.close()
      }
    }
  }
</script>
