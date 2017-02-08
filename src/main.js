import Vue from 'vue'
import App from './App.vue'

require('./assets/styles/application.css')
/* eslint-disable no-new */
// new Vue({
//   el: 'app',
//   components: { App }
// })

new Vue({
  render: h => h(App)
}).$mount('app')
