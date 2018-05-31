var noble = require('noble')

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    //
    // Once the BLE radio has been powered on, it is possible
    // to begin scanning for services. Pass an empty array to
    // scan for all services (uses more time and power).
    //
    console.log('scanning...')
    noble.startScanning()
  } else {
    console.log('stopScanning')

    noble.stopScanning()
  }
})

// https://www.bluetooth.com/specifications/gatt/services
// const serviceNames = {
//   '1804': 'TxPower',
//   'ffe0': 'Temperature',
//   '1802': 'Immediate Alert',
//   '180f': 'Battery Service'
// }

noble.on('discover', function (peripheral) {
  if (peripheral.id === 'bc0cd8f62e2e4616a6b9fb2d53e6b83a') {
    console.log('found peripheral:', peripheral.advertisement.localName.trim())

    peripheral.connect(function (error) {
      if (error) return
      console.log(new Date().toTimeString(), '- connected to peripheral: ' + peripheral.uuid)

      peripheral.discoverServices(['180f'], function (error, services) {
        if (error) return

        console.log('discovered device information service')
        services[0].discoverCharacteristics([], function (error, characteristics) {
          if (error) return

          characteristics[0].read(function (error, data) {
            if (error) return

            // data is a buffer
            const value = new String(data.toString('hex'))
            console.log('Battery value: ', parseInt(value, 16), '%', data.toString('hex') + data.toString('utf8'))
          })
        })
      })

      var timer = 0
      var interval = setInterval(function () {
        console.log('Connected', timer, 'seconds')
        peripheral.updateRssi(function (error, rssi) {
          if (error) console.log(error)
          console.log('RSSI value', rssi)
        })
        timer += 1
      }, 1000)

      peripheral.on('disconnect', function () {
        console.log(new Date().toTimeString(), 'Minew beacon D15 -> disconnected!')
        clearInterval(interval)
        process.exit(0)
      })
    })
  }
})
