var noble = require('noble')
var exec = require('child_process').exec

const WebSocket = require('ws')
const WEBSOCKET = new WebSocket.Server({ perMessageDeflate: false, port: 2222 })

var RSSI_THRESHOLD = -90
var EXIT_GRACE_PERIOD = 40000 // milliseconds
var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'b66ac17b36094d64a544dfb3431b0bb9'
var D15N = '8163e8da48a2445bbe3090692274ff7e'
var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var DEVICES = [D15, D15N]
// var CMD = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

var socket = null
var connected = false
var inRange = []

function say (message, callback) {
  exec(`say -v Tom "${message}"`, function () {
    callback()
  })
}

function send (event) {
  if (socket && socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(event))
  } else {
    console.log('socket closed')
  }
}

function connect (callback) {
  WEBSOCKET.on('connection', function connection (ws) {
    console.log('WS: connection OPEN')
    socket = ws

    if (!connected) {
      noble.startScanning([], true)
    } else {
      console.log('Scanning')
    }

    connected = true
  })

  WEBSOCKET.on('message', function (action) {
    if (action === 'lock') {
      console.log('LOCK MY MAC')
    // lock()
    }
  })

  WEBSOCKET.on('close', function () {
    console.log('WS: Connection CLOSED')
    connected = false
  })
}

noble.on('discover', function (peripheral) {
  if (DEVICES.includes(peripheral.uuid)) {
    var id = peripheral.id
    var name = peripheral.advertisement.localName.replace('00001', '')
    var rssi = peripheral.rssi

    console.log(new Date().toTimeString(), '-----', peripheral.uuid, peripheral.rssi, RSSI_THRESHOLD)
    send({ event: 'data', name: name, rssi: rssi, accuracy: 0, proximity: '' })

    // var id = peripheral.id
    // var name = peripheral.advertisement.localName.replace('00001', '')
    // var rssi = peripheral.rssi
    // var entered = !inRange[id]
    //
    // if (entered) {
    //   inRange[id] = { peripheral: peripheral }
    //
    //   console.log(new Date().toTimeString(), '>>>>>', name, 'entered (RSSI', rssi, ') ')
    //   send({ event: 'entered', name: 'D15' })
    //
    //   // var message = `iBeacon ${name} entered the room, with signal strength ${rssi}`
    //   // say(message)^
    // } else {
    //   inRange[id].lastSeen = Date.now()
    //   console.log(new Date(inRange[id].lastSeen).toTimeString(), 'Update lastSeen', name, peripheral.rssi)
    //
    //   send({ event: 'data', name: name, rssi: rssi, accuracy: 0, proximity: '' })
    // }
  }
})

// setInterval(function () {
//   for (var id in inRange) {
//     if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
//       var peripheral = inRange[id].peripheral
//       var name = peripheral.advertisement.localName.replace('00001', '')
//       var rssi = peripheral.rssi
//
//       console.log(new Date().toTimeString(), '<<<<<', name, 'exited (RSSI', rssi, ') ')
//       send({ event: 'exited', name: 'D15' })
//
//       // var message = `iBeacon ${name} exited the room, with signal strength ${rssi}`
//       // exec(`say -v Tom "${message}"`, function () {
//       // })
//
//       delete inRange[id]
//     }
//   }
// }, RSSI_THRESHOLD / 2)

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    connect()
    // noble.startScanning([], true)
  } else {
    noble.stopScanning()
  }
})
