<template>
  <div id="app">
    <router-view></router-view>

    <router-link to="/calibration">Calibration</router-link>

    <router-link to="/lock">Lock</router-link>

  </div>
</template>

<script>
  import NoBackendService from './components/NoBackendService.vue'
  import NoPeripherial from './components/NoPeripherial.vue'
  import Calibration from './components/Calibration.vue'
  // import { ws } from './main.js'

  export default {
    name: 'App',
    // components: {
    //   NoBackendService,
    //   NoPeripherial,
    //   Calibration
    // },

    data () {
      return {

      }
    },

    created () {
      this.$store.dispatch('connect')
    },

    mounted () {
      // console.log(this.$store)
    },

    computed: {
      connected() {
        return this.$store.state.connected
      }
    },

    watch: {
      // rssi: function (val) {
      //   console.log('Status: ', this.status, 'signal', this.signal, 'lockRadius', this.lockRadius)
      //   if (this.unlocked && (this.signal >= this.lockRadius)) {
      //     this.lock()
      //   } else if (!this.unlocked && (this.signal < this.lockRadius)) {
      //     console.info('Beacon nearby - Unlock and clear timeout and countdown')
      //     this.reset()
      //   }
      // }
    }
  }
</script>
