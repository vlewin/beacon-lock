/*
  Continously scans for peripherals and prints out message when they enter/exit

    In range criteria:      RSSI < threshold
    Out of range criteria:  lastSeen > grace period

  based on code provided by: Mattias Ask (http://www.dittlof.com)
*/
var noble = require('noble')
var RSSI_THRESHOLD = -60
var MLE15 = '897208eb18994db4a18a53d1f4a46b50'
var D15 = 'bc0cd8f62e2e4616a6b9fb2d53e6b83a'
var D152 = '8163e8da48a2445bbe3090692274ff7e'
var R2 = '2ee79432a6e14235bfb583ce370c1b8c'
var DEVICES = [D15, D152]

noble.on('discover', function (peripheral) {
  var uuid = peripheral.uuid

  if (DEVICES.includes(uuid)) {
    var name = peripheral.advertisement.localName ? peripheral.advertisement.localName.trim().replace('-00001', '') : 'Unknown'
    var rssi = peripheral.rssi

    console.log('---', new Date().toTimeString(), name, uuid, rssi)
  } else {
    return
  }
})

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true)
  } else {
    noble.stopScanning()
  }
})
