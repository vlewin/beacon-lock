import Vue from 'vue'
import App from './App.vue'

import store from './store'
import router from './router'

require('./assets/styles/application.css')
require('./assets/styles/helpers.css')
require('./assets/styles/no-connection.css')
require('./assets/styles/calibration.css')

/* eslint-disable no-new */
// new Vue({
//   el: 'app',
//   components: { App }
// })

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('app')
