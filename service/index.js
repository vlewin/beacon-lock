const noble = require('noble') // noble library
const Helpers = require('./helpers')

var myPeripheral

// const PERIPHERAL_NAME = 'BeaconLock00001'
const PERIPHERAL_NAME = 'Minew_00001'
const TX_POWER = 20
const SCAN_WINDOW = 1000
const SAMPLING_RATE = 250
const DEBUG = false

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 2222 })

let samples = { rssi: [], dist: [] }
let scanInterval = null
let samplingInterval = null
let socket = null
let rssiValues = []
let distanceValues = []

wss.on('connection', (ws) => {
  console.info('websocket connection open')

  if (ws.readyState === ws.OPEN) {
    socket = ws
    //  socket.send(JSON.stringify({ event: 'ready' }))

    ws.on('message', function (event) {
      var data = JSON.parse(event)
      if (data.event === 'calibrationn_start') {
        console.log('start calibration')
      } else if (data.event === 'disconneted') {
        console.log('disconneted')
      } else if (data.action === 'lock') {
        console.log('LOCK NOW!')
        var exec = require('child_process').exec
        var cmd = 'say "Your Mac is locked!"'
        exec(cmd, function (error, stdout, stderr) {
          console.log(error, stdout, stderr)
        })

        cmd = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'
        exec(cmd, function (error, stdout, stderr) {
          console.log(error, stdout, stderr)
        })
      } else {
        console.warn('Unknown event', data)
      }
    })
  }
})

// FIXME: Move to helpers
console.debug = function (args) {
  if (DEBUG) {
    console.log(args)
  }
}

// here we start scanning. we check if Bluetooth is on
noble.on('stateChange', scan)

function scan (state) {
  if (state === 'poweredOn') {
    noble.startScanning()
    console.log('Started scanning')
  } else {
    noble.stopScanning()
    console.log('Is Bluetooth on?')
  }
}

noble.on('discover', discoverPeripherals)

function discoverPeripherals (peripheral) {
  // here we check if this is the peripheral we want
  const name = peripheral.advertisement.localName ? peripheral.advertisement.localName.trim() : 'Unknown beacon'

  if (name === PERIPHERAL_NAME) {
    console.log('Found my device', PERIPHERAL_NAME)

    sendEvent({ event: 'connected', name: PERIPHERAL_NAME })

    // Stop scanning for other devices
    noble.stopScanning()

    // Save peripheral  to a variable
    myPeripheral = peripheral

    // Connect to peripheral
    peripheral.connect(explorePeripheral)
  } else {
    console.log('Found different device:', name, 'with UUID ', peripheral.uuid)
  }
};

function explorePeripheral (error) {
  if (error) {
    console.error(error)
    return false
  }

  console.log('Connected to ' + myPeripheral.advertisement.localName)
  // eslint-disable

  clearInterval(scanInterval)
  scanInterval = setInterval(function () {
    clearInterval(samplingInterval)

    samplingInterval = setInterval(function () {
      updateRSSI()
    }, SAMPLING_RATE)

    // console.log('Scann completed - calculate AVG of RSSI and distance')
    if (samples.rssi.length && samples.dist.length) {
      calculateAVG()
    } else {
      console.log('WARN: Nor RSSI data!')
    }
  }, SCAN_WINDOW)

  // setInterval(updateRSSI, 250);

  // when disconnected, run this function
  myPeripheral.on('disconnect', disconnectPeripheral)
};

function updateRSSI () {
  myPeripheral.updateRssi(function (error, rssi) {
    if (error) {
      console.log(error)
      return false
    }

    // rssi are always negative values
    if (rssi < 0) {
      const timestamp = new Date()
      const distance = Helpers.getDistance(rssi, TX_POWER)
      // const proximity = Helpers.getProximity(rssi, TX_POWER)
      // const range = Helpers.getRange(rssi, TX_POWER)
      console.log(timestamp, 'here is my RSSI: ' + rssi, 'distance', parseInt(distance), 'cm')
      samples.rssi.push(rssi)
      samples.dist.push(distance)
    }
  })
}

function disconnectPeripheral () {
  console.log('peripheral disconneted')
  sendEvent({ event: 'disconneted', name: PERIPHERAL_NAME })

  clearInterval(scanInterval)
  clearInterval(samplingInterval)

  // restart scan
  noble.startScanning()
}

function calculateAVG () {
  const timestamp = new Date()
  const avgRssi = Helpers.avg(samples.rssi)
  const avgDist = Helpers.avg(samples.dist) / 100

  console.log(timestamp, 'AVG RSSI: ' + avgRssi, 'AVG distance', avgDist, 'm')
  var event = {
    event: 'data',
    timestamp: timestamp,
    name: PERIPHERAL_NAME,
    rssi: avgRssi,
    dist: avgDist
  }

  // NOTE: Reset samples
  samples = { rssi: [], dist: [] }
  sendEvent(event)
}

function sendEvent (event) {
  if (socket) {
    socket.send(JSON.stringify(event))
  }
}
