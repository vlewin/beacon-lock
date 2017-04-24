/*
  Continously scans for peripherals and prints out message when they enter/exit

    In range criteria:      RSSI < threshold
    Out of range criteria:  lastSeen > grace period

  based on code provided by: Mattias Ask (http://www.dittlof.com)
*/
var noble = require('noble')
var exec = require('child_process').exec

var RSSI_THRESHOLD = -65
var EXIT_GRACE_PERIOD = 5000 // milliseconds
var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
var D152 = '8163e8da48a2445bbe3090692274ff7e'

var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var DEVICES = [MLE15, D15, D152]
// var CMD = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

var inRange = []

function say (message, callback) {
  exec(`say -v Tom "${message}"`, function () {
    callback()
  })
}

noble.on('discover', function (peripheral) {
  if (DEVICES.includes(peripheral.uuid)) {
    if (peripheral.rssi < RSSI_THRESHOLD) {
      // ignore
      return
    }

    var id = peripheral.id
    var name = peripheral.advertisement.localName.trim()
    var rssi = peripheral.rssi
    var entered = !inRange[id]

    if (entered) {
      inRange[id] = {
        peripheral: peripheral
      }

      var message = `iBeacon ${name} entered the room, with signal strength ${rssi}`

      console.log('"' + name + '" entered (RSSI ' + rssi + ') ' + new Date())
      say(message, function () {
        console.log('"' + name + '" entered (RSSI ' + rssi + ') ' + new Date())
      })

      // messages.forEach(function (message) {
      //   say(message, function () {
      //     console.log('remove', message, 'and next')
      //     messages.splice(messages.indexOf(message), 1)
      //     say(message)
      //   })
      // })

      // exec(`say -v Tom "${message}"`, function () {
      //   console.log('"' + name + '" entered (RSSI ' + rssi + ') ' + new Date())
      //   messages.splice(messages.indexOf(message), 1)
      // })

      // messages.forEach(function (message) {
      //   setTimeout(function () {
      //     exec(`say -v Tom "${message}"`, function () {
      //       console.log('"' + name + '" entered (RSSI ' + rssi + ') ' + new Date())
      //       messages.splice(messages.indexOf(message), 1)
      //     })
      //   }, 1000)
      // })
    } else {
      // console.log('Update lastSeen', name, new Date(inRange[id].lastSeen), peripheral.rssi)
      inRange[id].lastSeen = Date.now()
    }
  }
})

setInterval(function () {
  for (var id in inRange) {
    if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[id].peripheral
      var id = peripheral.id
      var name = peripheral.advertisement.localName
      var rssi = peripheral.rssi

      var message = `iBeacon ${name} exited the room, with signal strength ${rssi}`
      exec(`say -v Tom "${message}"`, function () {
        console.log('"' + peripheral.advertisement.localName + '" exited (RSSI ' + peripheral.rssi + ') ' + new Date())
      })

      delete inRange[id]
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
