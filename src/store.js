import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    socket: null,
    on: false,
    reconnectInterval: null,
    connected: false,
    rssi: 0,
    accuracy: 0,
    proximity: 'N/A'
  },

  actions: {
    connect: () => {
      console.log('ACTIONS: connect')
      const socket = new WebSocket('ws://localhost:2222')

      store.commit('SET_SOCKET', socket)

      socket.onopen = () => {
        // this.socket.send("Message to send");
        console.log('Socket open')
        store.commit('ON')
        router.push('/')
      }

      socket.onmessage = (event) => {
        var data = JSON.parse(event.data)
        if (data.event === 'connected') {
          console.info('peripheral', data.name, 'connected')
          store.commit('CONNECTED')
          router.push({ path: '/lock' })
        } else if (data.event === 'disconnected') {
          console.info('peripheral', data.name, 'disconnected')
          store.commit('DISCONNECTED')
          router.push({ path: '/' })
        } else if (data.event === 'data') {
          // console.log(JSON.stringify(data))
          // store.commit('CONNECTED')
          store.commit('SET_RSSI', data.rssi)
          store.commit('SET_ACCURACY', data.accuracy)
          store.commit('SET_PROXIMITY', data.proximity)
        } else if (data.event === 'test') {
          // _this.peripheralName = data.name
          // _this.peripheralConnected = false
        } else {
          console.warn('Unknown event', data)
        }
      }

      socket.onerror = () => {
        console.log('Socket closed')
        store.commit('OFF')
        store.commit('DISCONNECTED')

        router.push({ path: '/' })

        setTimeout(function () {
          store.dispatch('connect')
        }, 3000)
      }

      socket.onclose = () => {
        console.log('Socket closed')
        store.commit('OFF')
        store.commit('DISCONNECTED')

        router.push({ path: '/' })

        setTimeout(function () {
          store.dispatch('connect')
        }, 3000)
      }
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
