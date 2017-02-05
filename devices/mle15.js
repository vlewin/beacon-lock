var noble = require('noble');   //noble library

var myPeripheral;

const PERIPHERAL_NAME = "MLE-15";
const TX_POWER = 20
const SCAN_WINDOW = 2000
const SAMPLING_RATE = 250
const DEBUG = false

const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 2222 });

let socket = null

wss.on("connection", (ws) => {
   console.info("websocket connection open");

   if (ws.readyState === ws.OPEN) {
     socket = ws
     socket.send(JSON.stringify({ event: 'ready' }))
   }
});

// FIXME: Move to helpers
console.debug = function(arguments) {
  if(DEBUG) {
    console.log(arguments)
  }
}

// here we start scanning. we check if Bluetooth is on
noble.on('stateChange', scan);

function scan(state){
  if (state === 'poweredOn') {
    noble.startScanning();
    console.log("Started scanning");
  } else {
    noble.stopScanning();
    console.log("Is Bluetooth on?");
  }
}

noble.on('discover', discoverPeripherals);


function discoverPeripherals(peripheral) {
  //here we check if this is the peripheral we want
  let name = peripheral.advertisement.localName ? peripheral.advertisement.localName.trim() : 'Unknown beacon'

  if (name === PERIPHERAL_NAME){
    console.log("Found my device", PERIPHERAL_NAME);

    // Stop scanning for other devices
    noble.stopScanning();

	  // Save peripheral  to a variable
    myPeripheral = peripheral;

    // Connect to peripheral
    peripheral.connect(explorePeripheral);
  } else{
    console.log("Found a different device:", name, "with UUID ", peripheral.uuid);
  }
};

function explorePeripheral(error) {
  console.log("Connected to " + myPeripheral.advertisement.localName);
  var scanInterval = null
  let avg_rssi = null
  let avg_dist = null
  let rssi_values = []
  let distance_values = []

  //console log signal strengh every second
  var scanWindow = setInterval(function() {
    console.debug('New scan - clear scanInterval and re-init values')
    clearInterval(scanInterval)

    scanInterval = setInterval(function() {
      updateRSSI(rssi_values, distance_values)
    }, SAMPLING_RATE)

    console.debug('Scann completed - calculate AVG of RSSI and distance')
    calculateAVG(rssi_values, distance_values)

    console.debug('Clear RSSI and distance vales')
    rssi_values = []
    distance_values = []
  }, SCAN_WINDOW)


  // setInterval(updateRSSI, 250);

  //when disconnected, run this function
  myPeripheral.on('disconnect', disconnectPeripheral);

};

function updateRSSI(rssi_values, distance_values){
  myPeripheral.updateRssi(function(error, rssi){
    //rssi are always negative values
    if(rssi < 0) {
      let timestamp = new Date()
      let distance = getDistance(TX_POWER, rssi)

      console.log(timestamp, "here is my RSSI: " + rssi, 'distance', parseInt(distance), 'cm');
      rssi_values.push(rssi)
      distance_values.push(distance)
    }
  });

}

function disconnectPeripheral(){
      console.log('peripheral disconneted');

      //stop calling updateRSSI
      clearInterval(updateRSSI);

      //restart scan
      noble.startScanning();
}

// MATH HELPERS
function avg(values){
  if(values.length) {
    let sum = values.reduce((previous, current) => current += previous);
    return parseInt(sum / values.length);
  }
}

function getDistance(txPower, rssi) {
  let noice = 2 // in free space
  var d = Math.pow(10, (txPower - rssi) / (10 * 2));
  // console.log('D:', d, 'at RSSI:', rssi, 'with TxPower', txPower)
  return d / 100
}

function calculateAVG(rssi_values, distance_values) {
  let timestamp = new Date()
  avg_rssi = avg(rssi_values)
  avg_dist = avg(distance_values) / 100

  console.log(timestamp, "AVG RSSI: " + avg_rssi, 'AVG distance',  avg_dist, 'm');

  if(socket) {
    socket.send(JSON.stringify({
      event: 'data',
      timestamp: timestamp,
      name: PERIPHERAL_NAME,
      rssi: avg_rssi,
      dist: avg_dist
    }))
  }
}

function distanceUnit(avg_dist) {
  return ((avg_dist / 100) > 1) ? 'm' : 'cm'
}
