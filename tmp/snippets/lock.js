// /System/Library/CoreServices/Menu\ Extras/User.menu/Contents/Resources/CGSession -suspend

// CHECK SESSION
// osascript -e 'tell application "System Events"' -e 'get running of screen saver preferences'  -e 'end tell'

// var cmd = 'osascript -e \"tell application \\"System Events\\" to keystroke \\"password\\" \"';
//
// exec(cmd, function(error, stdout, stderr) {
//   command output is in stdout
//   console.log(error, stdout, stderr)
// });

var exec = require('child_process').exec
var cmd = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend'

exec(cmd, function (error, stdout, stderr) {
  console.log(error, stdout, stderr)
})
