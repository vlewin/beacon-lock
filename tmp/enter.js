/*
  Continously scans for peripherals and prints out message when they enter/exit

    In range criteria:      RSSI < threshold
    Out of range criteria:  lastSeen > grace period

  based on code provided by: Mattias Ask (http://www.dittlof.com)
*/

var noble = require('noble')
var exec = require('child_process').exec

var RSSI_THRESHOLD = -65
var EXIT_GRACE_PERIOD = 10000 // milliseconds

var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
var MINEW = '8163e8da48a2445bbe3090692274ff7e'
var XIAOMI = '0f69e91c6cf742e58bdbf04050e8caf3'
var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var DEVICES = [MINEW, XIAOMI]
// var CMD = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

var inRange = []


console.debug = function() {
  if(process.env.DEBUG) {
    console.log.apply(console, arguments);
  }
}

function sysinfo() {
  var used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Total system memory: ${Math.round(used * 100) / 100} MB`);
}

function say (message, callback) {
  callback()
  exec(`say -v Tom "${message}"`, () => {
    // callback()
  })

  // callback()

}

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true)
  } else {
    noble.stopScanning()
  }
})

noble.on('discover', discovery)

function discovery(peripheral) {
  if (DEVICES.includes(peripheral.uuid)) {
    // console.log('*** Discovered', peripheral.advertisement.localName)
    var id = peripheral.id
    var name = peripheral.advertisement.localName.trim().split('_')[0]
    var rssi = peripheral.rssi
    var entered = !inRange[id]
    const now = new Date().toLocaleTimeString()



    // console.debug(`[${rssi}] ??? ${now}: seen`)

    if (rssi < RSSI_THRESHOLD) {
      console.debug(`[${now}](${rssi}): OUT OF RANGE`)
      // ignore
      return
    }

    if (!inRange[id]) {

      var message = `NodeJs: ${name} entered`
      say(message, () => {
        console.log(`[${now}](${rssi}): >> ${message}`)
      })
    }

    inRange[id] = { name: name, rssi: rssi, lastSeen: Date.now() }
    console.debug(`[${now}](${rssi}): IN RANGE`)
    sysinfo()
  }
}

setInterval(function () {
  for (var id in inRange) {
    peripheral = inRange[id]
    var name = peripheral.name
    var rssi = peripheral.rssi
    const lastSeen = peripheral.lastSeen
    const leavesAt = lastSeen + EXIT_GRACE_PERIOD
    const time = new Date()
    const now = time.toLocaleTimeString()
    const diff = (time - new Date(lastSeen)) / 1000


    if (time.getTime() > leavesAt) {
      var message = `NodeJs: ${name} exited`

      say(message, () => {
        console.log(`[${now}](${rssi}): << ${message}`)
      })

      // exec(`say -v Tom "${message}"`, function () {
      //   console.log(new Date(), '<<<', message)
      // })

      delete inRange[id]

      // NOTE: Debug stop
      // process.exit()
    } else {
      console.debug(`[${now}](${rssi}): SEEN ${diff} s ago`)
    }
  }
}, EXIT_GRACE_PERIOD/2)
