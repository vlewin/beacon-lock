<template>
  <div id="error">
    ON {{ on }}
    CONNECTED {{ connected }}
    <div id="no-backend-service" v-if="!on">
      <div class="centeredPromptIcon">
        <div class="icon fa fa-frown-o"></div>
      </div>
      <div class="centeredPromptLabel">Connection to backend service is lost!</div>
      <div class="centeredPromptDetails">
        Ensure bluetooth <i class="fa fa-bluetooth"></i> is on.
        Try to retart the 'beacon-lock' app.
      </div>
    </div>

    <div id="no-peripheral" v-if="on && !connected">
      <div class="centeredPromptIcon">
        <div class="icon fa fa-spin fa-circle-o-notch" aria-hidden="true"></div>
      </div>
      <div class="centeredPromptLabel">Looking for peripheral ...</div>
      <div class="centeredPromptDetails">
        Ensure bluetooth <i class="fa fa-bluetooth"></i> and device <i class="fa fa-tag" aria-hidden="true"></i> is on.
        <!-- <a href="https://github.com/vlewin/beacon-lock/issues">Let me know!</a> -->
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ErrorPage',
    components: {
      // NoBackendService,
      // NoPeripherial
    },

    data () {
      return {
        socket: null
      }
    },

    computed: {
      on: function () {
        return this.$store.state.on
      },

      off: function () {
        return !this.$store.state.on
      },

      connected: function () {
        return this.$store.state.connected
      },

      disconnected: function () {
        return !this.$store.state.connected
      }
    },

    watch: {
      connected: function (val) {
        if (this.on && this.connected) {
          this.$router.push('lock')
        }
      }
    }
  }
</script>
