/*
  Continously scans for peripherals and prints out message when they enter/exit

    In range criteria:      RSSI < threshold
    Out of range criteria:  lastSeen > grace period

  based on code provided by: Mattias Ask (http://www.dittlof.com)
*/
var noble = require('noble')
var exec = require('child_process').exec

var RSSI_THRESHOLD = -80
var EXIT_GRACE_PERIOD = 10000 // milliseconds
var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
var D15N = '8163e8da48a2445bbe3090692274ff7e'
var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var NUT = 'd557f5c9bfc341abb689f48dbd9476ac'
var PET = '0f69e91c6cf742e58bdbf04050e8caf3'
var DEVICES = [D15, D15N, NUT, PET]
// var CMD = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

var inRange = []

function say (message, callback) {
  exec(`say -v Tom "${message}"`, function () {
    callback()
  })
}

noble.on('discover', function (peripheral) {
  if (DEVICES.includes(peripheral.uuid)) {
    var id = peripheral.id
    var name = peripheral.advertisement.localName.replace('00001', '')
    var rssi = peripheral.rssi

    if (peripheral.rssi < RSSI_THRESHOLD) {
      // ignore
      console.log(new Date().toTimeString(), '-----', peripheral.rssi, RSSI_THRESHOLD)
      return
    } else {
      var entered = !inRange[id]

      if (entered) {
        inRange[id] = {
          peripheral: peripheral
        }

        console.log(new Date().toTimeString(), '>>>>>', name, 'entered (RSSI', rssi, ') ')

        // var message = `iBeacon ${name} entered the room, with signal strength ${rssi}`
        // say(message)
      } else {
        inRange[id].lastSeen = Date.now()
        console.log(new Date(inRange[id].lastSeen).toTimeString(), 'Update lastSeen', name, peripheral.rssi)
      }
    }
  }
})

setInterval(function () {
  for (var id in inRange) {
    if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[id].peripheral
      var name = peripheral.advertisement.localName.replace('00001', '')
      var rssi = peripheral.rssi

      console.log(new Date().toTimeString(), '<<<<<', name, 'exited (RSSI', rssi, ') ')

      // var message = `iBeacon ${name} exited the room, with signal strength ${rssi}`
      // exec(`say -v Tom "${message}"`, function () {
      // })

      delete inRange[id]
    }
  }
}, RSSI_THRESHOLD)

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true)
  } else {
    noble.stopScanning()
  }
})
