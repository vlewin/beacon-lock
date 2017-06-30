var exec = require('child_process').exec
var cmd = 'say "Hello"'

exec(cmd, function (error, stdout, stderr) {
  console.log(error, stdout, stderr)
})
