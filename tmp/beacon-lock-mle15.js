var noble = require('noble')

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 2222 })

// const PERIPHERAL_NAME = 'BeaconLock00001'
const PERIPHERAL_NAME = 'MLE-15'

// NOTE: MLE-15: 897208eb18994db4a18a53d1f4a46b50
// NOTE: BeaconLock: bc0cd8f62e2e4616a6b9fb2d53e6b83a
const UUID = '897208eb18994db4a18a53d1f4a46b50'
const TXPOWER = -50

let beacon = null
let socket = null
let interval = null
let connected = false

function connect () {
  wss.on('connection', (ws) => {
    console.info('WS: Connection OPEN')

    if (ws.readyState === ws.OPEN) {
      socket = ws

      if (connected) {
        console.info('-- Device connected', connected)

        socket.send(JSON.stringify({
          event: 'connected',
          name: PERIPHERAL_NAME
        }))
      } else {
        console.info('-- Start scanning')
        noble.startScanning()
      }
    }

    // var id = setInterval(function () {
    //   ws.send(JSON.stringify(process.memoryUsage()), function () { /* ignore errors */ })
    // }, 100)

    ws.on('message', function (action) {
      if (action === 'lock') {
        console.log('LOCK MY MAC')
        lock()
      }
    })

    ws.on('close', function () {
      console.log('WS: Connection CLOSED')

      reset()

      console.log('-- Reconnect in 1 second')
      setTimeout(function () {
        console.log('--- Auto reconnect')
        // FIXME: Reconnect not working properly
        // connect()
      }, 500)

      // console.log('-- Start scanning ???')
      // noble.startScanning()
    })
  })
}

function reset () {
  console.log('-- Clear interval')
  clearInterval(interval)

  if (beacon) {
    console.log('-- Disconnect beacon', beacon.uuid)
    beacon.disconnect()
  } else {
    console.log('-- WARN: no beacon connected ???')
  }

  console.log('-- Reset flags: beacon, socket and interval')
  socket = interval = beacon = null
}

function lock () {
  reset()
  var exec = require('child_process').exec
  var cmd = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

  setTimeout(function () {
    exec(cmd, function (error, stdout, stderr) {
      console.log(error, stdout, stderr)
    })
  }, 2000)
}

noble.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state)

  if (state === 'poweredOn') {
    console.log('Bluetooth ON')
    connect()
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
  console.log('on -> discover: ', peripheral.uuid)
  // console.log('Found', peripheral.uuid, peripheral.advertisement.localName)
  if (peripheral.uuid === UUID) {
  // if (peripheral.uuid === 'bc0cd8f62e2e4616a6b9fb2d53e6b83a') {
    console.log('--- Connect', peripheral.uuid, peripheral.advertisement.localName)
    peripheral.connect()
    noble.stopScanning()
  }

  peripheral.on('connect', function () {
    console.log('on -> connect')
    // const _this = this
    beacon = peripheral

    console.log('Device connected?', connected, beacon.uuid)

    if (socket) {
      console.log('--- Send connected event')
      socket.send(JSON.stringify({
        event: 'connected',
        name: PERIPHERAL_NAME
      }))
    } else {
      console.log('WARN: No socket, wait ...')
    }
    // const index = 0
    // if (!connected) {
    //   interval = setInterval(function () {
    //     console.log('Index', index)
    //     index += 1
    //   }, 1000)
    // }

    var rssiValues = []

    if (!connected) {
      interval = setInterval(function () {
        peripheral.updateRssi()

        // peripheral.updateRssi(function (err, rssi) {
        //   if (err) {
        //     clearInterval(interval)
        //   } else {
        //     rssiValues.push(rssi)
        //   }
        // })
      }, 500)
    }

    connected = true
  })

  peripheral.on('disconnect', function () {
    console.log('on -> disconnect')
    connected = false

    if (socket) {
      console.log('-- Send disconnect event')

      socket.send(JSON.stringify({
        event: 'disconnected',
        name: PERIPHERAL_NAME
      }))
    } else {
      console.log('WARN: No socket ???')
    }

    console.log('-- Peripheral auto reconnect in 1 second')
    setTimeout(function () {
      // peripheral.connect()
      // noble.startScanning()
    }, 1000)
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
