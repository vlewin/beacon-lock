import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    on: false,
    connected: false,
    locked: false,
    socket: null,
    reconnectInterval: null,
    calibrated: false,
    radius: -65,
    rssi: 0,
    accuracy: 0,
    proximity: 'N/A'
  },

  actions: {
    connect: ({ commit, dispatch }) => {
      console.log('ACTIONS: connect')
      const socket = new WebSocket('ws://localhost:2222')

      commit('SET_SOCKET', socket)

      socket.onopen = () => {
        // this.socket.send("Message to send");
        console.log('Socket open')
        commit('ON')
        router.push('/')
      }

      socket.onmessage = (event) => {
        var data = JSON.parse(event.data)
        if (data.event === 'connected') {
          console.info('peripheral', data.name, 'connected')
          commit('CONNECTED')
          router.push('/lock')
        } else if (data.event === 'disconnected') {
          console.info('peripheral', data.name, 'disconnected')
          commit('DISCONNECTED')
          router.push('/')
        } else if (data.event === 'data') {
          // console.log(JSON.stringify(data))
          // commit('CONNECTED')
          commit('SET_RSSI', data.rssi)
          commit('SET_ACCURACY', data.accuracy)
          commit('SET_PROXIMITY', data.proximity)
        } else {
          console.warn('Unknown event', data)
        }
      }

      socket.onerror = () => {
        console.log('Socket closed')
        commit('OFF')
        commit('DISCONNECTED')

        router.push('/')

        setTimeout(function () {
          dispatch('connect')
        }, 3000)
      }

      socket.onclose = () => {
        console.log('Socket closed')
        commit('OFF')
        commit('DISCONNECTED')

        router.push('/')

        console.log('reconnect in 3 seconds')
        setTimeout(function () {
          dispatch('connect')
        }, 3000)
      }
    },

    lock ({ commit, state }, locked) {
      state.socket.send('lock')

      commit('SET_LOCKED', true)
    },

    setCalibrated ({ commit }, value) {
      console.log('calibrated', value)

      commit('SET_CALIBRATED', value)
    },

    setRadius ({ commit }, radius) {
      console.log('radius', radius)
      commit('SET_RADIUS', radius)
    }
  },

  mutations: {
    ON: (state) => {
      console.info('Mutation: ON')
      Vue.set(state, 'on', true)
    },

    OFF: (state) => {
      console.info('Mutation: OFF')
      Vue.set(state, 'on', false)
    },

    CONNECTED: (state) => {
      Vue.set(state, 'connected', true)
    },

    DISCONNECTED: (state) => {
      Vue.set(state, 'connected', false)
    },

    SET_SOCKET: (state, socket) => {
      Vue.set(state, 'socket', socket)
    },

    RESET_SOCKET: (state) => {
      Vue.set(state, 'socket', null)
    },

    SET_LOCKED: (state, value) => {
      Vue.set(state, 'locked', true)
    },

    SET_CALIBRATED: (state, value) => {
      Vue.set(state, 'calibrated', value)
    },

    // RESET_CALIBRATED: (state) => {
    //   Vue.set(state, 'calibrated', false)
    // },

    SET_RADIUS: (state, value) => {
      Vue.set(state, 'radius', value)
    },

    RESET_RADIUS: (state) => {
      Vue.set(state, 'radius', null)
    },

    SET_RSSI: (state, rssi) => {
      Vue.set(state, 'rssi', rssi)
    },

    SET_ACCURACY: (state, accuracy) => {
      Vue.set(state, 'accuracy', accuracy)
    },

    SET_PROXIMITY: (state, proximity) => {
      Vue.set(state, 'proximity', proximity)
    }
  },

  getters: {
    // // items that should be currently displayed.
    // // this Array may not be fully fetched.
    // activeItems (state, getters) {
    //   return getters.activeIds.map(id => state.items[id]).filter(_ => _)
    // }
  }
})

export default store
