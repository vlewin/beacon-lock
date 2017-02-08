const NobleDevice = require('noble-device')
const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 2222 })
let socket = null

wss.on('connection', (ws) => {
  console.info('websocket connection open')

  if (ws.readyState === ws.OPEN) {
    socket = ws

    socket.send(JSON.stringify({
      msg1: 'yo, im msg 1'
    }))

    ws.on('message', function (event) {
      var data = JSON.parse(event)
      if (data.event === 'calibrationn_start') {
        console.log('start calibration')
      } else if (data.event === 'disconneted') {

      } else {
        console.warn('Unknown event', data)
      }
    })
  }
})

const NAME = 'R2'

// then create your thing with the object pattern
var YourThing = function (peripheral) {
  // call nobles super constructor
  NobleDevice.call(this, peripheral)

  // setup or do anything else your module needs here
}

// tell Noble about the service uuid(s) your peripheral advertises (optional)
// YourThing.SCAN_UUIDS = [YOUR_THING_SERVICE_UUID]

// and/or specify method to check peripheral (optional)
YourThing.is = function (peripheral) {
  console.log(peripheral)
  return (peripheral.advertisement.localName === 'MLE-15')
}

// inherit noble device
NobleDevice.Util.inherits(YourThing, NobleDevice)

// you can mixin other existing service classes here too,
// noble device provides battery and device information,
// add the ones your device provides
NobleDevice.Util.mixin(YourThing, NobleDevice.BatteryService)
NobleDevice.Util.mixin(YourThing, NobleDevice.DeviceInformationService)

var id = '<your devices id>'
YourThing.discoverById(function (yourThingInstance) {
  // you can be notified of disconnects
  yourThingInstance.on('disconnect', function () {
    console.log('we got disconnected! :( ')
  })

  // you'll need to call connect and set up
  yourThingInstance.connectAndSetUp(function (error) {
    console.log('were connected!')
  })
})
