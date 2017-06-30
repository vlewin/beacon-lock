// MATH HELPERS
function avg (values) {
  if (values.length) {
    const sum = values.reduce(function (prev, next) { return prev + next })
    return parseInt(sum / values.length)
  }
}

function getRange (rssi, txPower) {
  var ratioDb = txPower - rssi
  var ratioLinear = Math.pow(10, ratioDb / 10)

  var r = Math.sqrt(ratioLinear)
  return r
}

function getProximity (rssi, txPower) {
  const accuracy = Math.pow(12.0, 1.5 * ((rssi / txPower) - 1))
  const range = getRange(rssi, txPower)
  console.log(accuracy)
  // console.log(range)
  var proximity = null

  if (accuracy < 0) {
    proximity = 'unknown'
  } else if (accuracy < 0.5) {
    console.log('immediate')
    proximity = 'immediate'
  } else if (accuracy < 2.0) {
    console.log('near')
    proximity = 'near'
  } else {
    console.log('far')
    proximity = 'far'
  }

  return proximity
}

function getDistance (rssi, txPower) {
  const noice = 2 // in free space
  var d = Math.pow(10, (txPower - rssi) / (10 * noice))
  // console.log('D:', d, 'at RSSI:', rssi, 'with TxPower', txPower)
  return d / 100
}

module.exports = {
  avg,
  getProximity,
  getRange,
  getDistance
}
