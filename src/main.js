import Vue from 'vue'
import App from './App.vue'

require('./assets/styles/application.css')
require('./assets/styles/helpers.css')
require('./assets/styles/no-connection.css')
require('./assets/styles/calibration.css')

/* eslint-disable no-new */
// new Vue({
//   el: 'app',
//   components: { App }
// })

export const ws = new WebSocket('ws://localhost:2222')

new Vue({
  render: h => h(App)
}).$mount('app')
