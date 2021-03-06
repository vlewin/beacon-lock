import Vue from 'vue'
import VueRouter from 'vue-router'
import ErrorPage from './components/ErrorPage.vue'
import Calibration from './components/Calibration.vue'
import Lock from './components/Lock.vue'
import Radar from './components/Radar.vue'
import Range from './components/Range.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  // mode: 'history',
  routes: [
    { path: '/', component: ErrorPage },
    { path: '/lock', component: Lock },
    { path: '/radar', component: Radar },
    { path: '/range', component: Range },
    { path: '/calibration', component: Calibration },
    { path: '*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
