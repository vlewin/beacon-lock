const WebSocket = require('ws')
const WEBSOCKET = new WebSocket.Server({ perMessageDeflate: false, port: 2222 })

function connect (callback) {
  console.log(WEBSOCKET)
  WEBSOCKET.on('connection', function connection (ws) {
    console.log('WS: connection OPEN')
    socket = ws

    ws.on('message', function (data) {
      console.log('MESSAGE:', data)
      //
      // if (data.action === 'lock') {
      //   console.log('LOCK MY MAC')
      // } else if (data.action === 'SET_RSSI_THRESHOLD') {
      //   console.log('Value', data)
      // }
    })
  })

  WEBSOCKET.on('close', function () {
    console.log('WS: Connection CLOSED')
  })
}

connect()
