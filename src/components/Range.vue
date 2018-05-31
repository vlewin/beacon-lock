<template>
  <div id="">
    <div class="container">
      <svg width="100%" height="90%" viewBox="0 -30 100 150">
        <circle class="radius" cx="50" cy="50" v-bind:r="range" stroke="#666" stroke-dasharray="2" stroke-width="0.25" fill="transparent" />
        <circle class="signal" cx="50" cy="50" v-bind:r="signal" v-bind:fill="color"  />
        <text class="text" x="50%" y="33%" dy=".3em" fill="#555" font-size="0.37rem">
          RSSI: {{ signal }}
          <br />
          STATUS: {{ status }}
        </text>
      </svg>
      <button v-on:click="lock">LOCK</button>
    </div>
  </div>
</template>


<script>
  export default {
    name: 'Calibration',
    data () {
      return {
        range: 70
      }
    },

    created () {
      // this.connect()
    },

    mounted () {
    },

    computed: {
      color () {
        return this.signal > this.range ? '#ff5252' : '#42b983'
      },

      signal () {
        return this.$store.state.rssi * -1
      },

      status () {
        return this.$store.state.status
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
      lock () {
        console.log('lock action')
        this.$store.dispatch('lock')
      }
    }
  }
</script>

<style>
  #range {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    display: block;
  }
  /*g rect { fill: red; }*/
</style>
