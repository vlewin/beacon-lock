export default function WebSocketPlugin (socket) {
  console.log('got socket', socket)
  return store, socket => {
    socket.onopen('data', data => {
      console.log('onopen', data)
      store.commit('receiveData', data)
    })

    socket.onmessage('data', data => {
      store.commit('receiveData', data)
    })

    socket.onclose('data', data => {
      store.commit('receiveData', data)
    })

    socket.onerror('data', data => {
      store.commit('receiveData', data)
    })

    store.subscribe(mutation => {
      if (mutation.type === 'UPDATE_DATA') {
        socket.emit('update', mutation.payload)
      }
    })
  }
}
