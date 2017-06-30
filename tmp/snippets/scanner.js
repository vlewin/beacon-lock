/*
  Continously scans for peripherals and prints out message when they enter/exit
  In range criteria:      RSSI < threshold
  Out of range criteria:  lastSeen > grace period

*/

var noble = require('noble')
var exec = require('child_process').exec

var RSSI_THRESHOLD = -65
var EXIT_GRACE_PERIOD = 5000 // milliseconds
var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
var MINEW = '8163e8da48a2445bbe3090692274ff7e'
var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var DEVICES = [MINEW, D15]
var NAMES = {
  '8163e8da48a2445bbe3090692274ff7e': 'Valeria',
  'bc0cd8f62e2e4616a6b9fb2d53e6b83a': 'Vlad'
}
// var CMD = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

var inRange = []

function say (message, callback) {
  exec(`say -v Tom "${message}"`, function () {
    callback()
  })
}

noble.on('discover', function (peripheral) {
  var uuid = peripheral.uuid
  var name = peripheral.advertisement.localName ? peripheral.advertisement.localName.trim().replace('-00001', '') : 'Unknown'
  var rssi = peripheral.rssi

  if (DEVICES.includes(peripheral.uuid)) {
    if (peripheral.rssi < RSSI_THRESHOLD) {
      // ignore
      console.log('---- OUT OF RANGE:', name, rssi)
      return
    }

    var entered = !inRange[uuid]

    if (entered) {
      inRange[uuid] = {
        peripheral: peripheral
      }

      console.log('>>>> "' + name + '" entered (RSSI ' + rssi + ') ' + new Date())
      var message = `${NAMES[uuid]}, I am glad to see you again`
      say(`Hello ${message}`, function () {})
    } else {
      var timestamp = Date.now()
      inRange[uuid].lastSeen = timestamp

      console.log('Update lastSeen', name, new Date(inRange[uuid].lastSeen).toTimeString(), peripheral.rssi)
    }
  }
})

setInterval(function () {
  for (var uuid in inRange) {
    if (inRange[uuid].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[uuid].peripheral
      var name = peripheral.advertisement.localName ? peripheral.advertisement.localName.trim().replace('-00001', '') : 'Unknown'
      var rssi = peripheral.rssi

      console.log('<<<< "' + name + '" exited (RSSI ' + rssi + ') ' + new Date())
      var message = `${NAMES[uuid]}, see you!`
      say(`Goodbye ${message}`, function () {})
      delete inRange[uuid]
    }
  }
}, EXIT_GRACE_PERIOD / 2)

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true)
  } else {
    noble.stopScanning()
  }
})
