var noble = require('noble')   // noble library

var myPeripheral

const PERIPHERAL_NAME = 'R2'
const TX_POWER = 20
const SCAN_WINDOW = 2000
const SAMPLING_RATE = 250
const DEBUG = false

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 2222 })

let socket = null

wss.on('connection', (ws) => {
  console.info('websocket connection open')

  if (ws.readyState === ws.OPEN) {
    socket = ws
    //  socket.send(JSON.stringify({ event: 'ready' }))
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
    console.log('Found a different device:', name, 'with UUID ', peripheral.uuid)
  }
};

function explorePeripheral (error) {
  if (error) {
    console.error(error)
    return false
  }

  console.log('Connected to ' + myPeripheral.advertisement.localName)
  var scanInterval = null
  let rssiValues = []
  let distanceValues = []

  // console log signal strengh every second
  setInterval(function () {
    console.debug('New scan - clear scanInterval and re-init values')
    clearInterval(scanInterval)

    scanInterval = setInterval(function () {
      updateRSSI(rssiValues, distanceValues)
    }, SAMPLING_RATE)

    console.debug('Scann completed - calculate AVG of RSSI and distance')
    calculateAVG(rssiValues, distanceValues)

    console.debug('Clear RSSI and distance vales')
    rssiValues = []
    distanceValues = []
  }, SCAN_WINDOW)

  // setInterval(updateRSSI, 250);

  // when disconnected, run this function
  myPeripheral.on('disconnect', disconnectPeripheral)
};

function updateRSSI (rssiValues, distanceValues) {
  myPeripheral.updateRssi(function (error, rssi) {
    if (error) {
      console.log(error)
      return false
    }

    // rssi are always negative values
    if (rssi < 0) {
      const timestamp = new Date()
      const distance = getDistance(TX_POWER, rssi)

      console.log(timestamp, 'here is my RSSI: ' + rssi, 'distance', parseInt(distance), 'cm')
      rssiValues.push(rssi)
      distanceValues.push(distance)
    }
  })
}

function disconnectPeripheral () {
  console.log('peripheral disconneted')
  sendEvent({ event: 'disconneted', name: PERIPHERAL_NAME })

  // stop calling updateRSSI
  clearInterval(updateRSSI)

  // restart scan
  noble.startScanning()
}

// MATH HELPERS
function avg (values) {
  if (values.length) {
    const sum = values.reduce(function (previous, current) {
      current += previous
    })

    return parseInt(sum / values.length)
  }
}

function getDistance (txPower, rssi) {
  const noice = 2 // in free space
  var d = Math.pow(10, (txPower - rssi) / (10 * noice))
  // console.log('D:', d, 'at RSSI:', rssi, 'with TxPower', txPower)
  return d / 100
}

function calculateAVG (rssiValues, distanceValues) {
  const timestamp = new Date()
  const avgRssi = avg(rssiValues)
  const avgDist = avg(distanceValues) / 100

  console.log(timestamp, 'AVG RSSI: ' + avgRssi, 'AVG distance', avgDist, 'm')
  var event = {
    event: 'data',
    timestamp: timestamp,
    name: PERIPHERAL_NAME,
    rssi: avgRssi,
    dist: avgDist
  }

  sendEvent(event)
}

function sendEvent (event) {
  if (socket) {
    socket.send(JSON.stringify(event))
  }
}
