var noble = require('noble')

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 2222 })
// const PERIPHERAL_NAME = 'BeaconLock00001'
const PERIPHERAL_NAME = 'MLE-15'

// NOTE: MLE-15: 897208eb18994db4a18a53d1f4a46b50
// NOTE: BeaconLock: bc0cd8f62e2e4616a6b9fb2d53e6b83a
const UUID = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
const TXPOWER = -48

let socket = null
let interval = null
let connected = false

console.log('noble')

wss.on('connection', (ws) => {
  console.info('websocket connection open')

  if (ws.readyState === ws.OPEN) {
    socket = ws
    noble.startScanning([], false)
  }

  console.log(ws.readyState)

  // var id = setInterval(function () {
  //   ws.send(JSON.stringify(process.memoryUsage()), function () { /* ignore errors */ })
  // }, 100)

  ws.on('close', function () {
    console.log('WS Closed: Clear interval', interval)
    socket = null
    clearInterval(interval)
    noble.startScanning()
  })
})

noble.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state)

  if (state === 'poweredOn') {
    console.log('Bluetooth ON')
    // noble.startScanning()
  } else {
    console.log('Bluetooth OFF')
    noble.stopScanning()
  }
})

// noble.on('scanStart', function () {
//   console.log('on -> scanStart')
// })
//
// noble.on('scanStop', function () {
//   console.log('on -> scanStop')
// })

noble.on('discover', function (peripheral) {
  console.log('on -> discover: ')
  console.log('Found', peripheral.uuid, peripheral.advertisement.localName)
  if (peripheral.uuid === UUID) {
  // if (peripheral.uuid === 'bc0cd8f62e2e4616a6b9fb2d53e6b83a') {
    console.log('Found', peripheral)
    // noble.stopScanning()
    peripheral.connect()
  }

  peripheral.on('connect', function () {
    console.log('on -> connect')
    // const _this = this

    console.log('Device connected?', connected)

    if (socket) {
      socket.send(JSON.stringify({
        event: 'connected',
        name: PERIPHERAL_NAME
      }))
    }
    // const index = 0
    // if (!connected) {
    //   interval = setInterval(function () {
    //     console.log('Index', index)
    //     index += 1
    //   }, 1000)
    // }

    var rssiValues = []
    const timeout = null

    if (!connected) {
      interval = setInterval(function () {
        peripheral.updateRssi(function (err, rssi) {
          if (err) {
            clearInterval(interval)
          }
          rssiValues.push(rssi)
        })
      }, 500)
    }

    connected = true
  })

  peripheral.on('disconnect', function () {
    console.log('on -> disconnect')
    connected = false

    if (socket) {
      socket.send(JSON.stringify({
        event: 'disconnected',
        name: PERIPHERAL_NAME
      }))
    }

    console.log('Device disconnect: Clear interval', interval)
    clearInterval(interval)

    // peripheral.connect()
    setTimeout(function () {
      peripheral.connect()
      // noble.startScanning()
    }, 100)
  })

  peripheral.on('rssiUpdate', function (rssi) {
    console.log(new Date(), 'on -> RSSI update ' + rssi)
    if (rssi < 1) {
      const accuracy = Math.pow(12.0, 1.5 * ((rssi / TXPOWER) - 1))
      console.log(accuracy)

      var proximity = null

      if (accuracy < 0) {
        proximity = 'unknown'
      } else if (accuracy < 0.5) {
        proximity = 'immediate'
      } else if (accuracy < 4.0) {
        proximity = 'near'
      } else {
        proximity = 'far'
      }

      if (socket) {
        socket.send(JSON.stringify({
          event: 'data',
          timestamp: new Date(),
          name: PERIPHERAL_NAME,
          rssi: rssi,
          accuracy: accuracy,
          proximity: proximity
        }))
      }
    } else {
      console.error('RSSI value must be negative')
    }

    // this.discoverServices();
    // peripheral.disconnect();
  })

  // peripheral.connect()
})
