package main

import (
  "os"
	"os/signal"
  "os/exec"
	"syscall"
  "fmt"
  "log"
  "time"
  "strings"
  // "flag"
  // "runtime"

  "github.com/pkg/errors"
  "golang.org/x/net/context"

  "github.com/currantlabs/ble"
  "github.com/currantlabs/ble/darwin"
  // "github.com/currantlabs/ble/examples/lib/dev"
  "github.com/pbnjay/memory"
)

const RSSI_THRESHOLD int = -85 // min RSSI value
const EXIT_GRACE_PERIOD int = 10 // Time in seconds after beacon is marked as out-of-range if RSSI value is bigger than threshold
const SCAN_DURATION = 48*time.Hour
const ALLOW_DUPLICATE = true

var inRange = make(map[ble.Addr]map[string]interface{})
var isScanning bool = false


// NOTE: Main programm
func main() {
  // FIXME: Move to signalHandler
  channel := make(chan os.Signal, 1)
  signal.Notify(channel, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT)

  go func() {
    signal := <-channel
    fmt.Printf("RECEIVED SIGNAL: %v", signal)
    fmt.Printf("[%s]: Agent terminated\n", time.Now().Format("15:04:05"))
    os.Exit(1)
  }()

  setDefaultDevice()

  // FIXME: move to SetInterval() and call exitHandler periodically
  interval := time.Duration(EXIT_GRACE_PERIOD/2)
  ticker := time.NewTicker(interval * time.Second)
  quit := make(chan struct{})

  go func() {
      for {
         select {
          case <- ticker.C:
            // NOTE: Check if beacon is still in rang
            exitHandler(inRange, quit)

          case <- quit:
              ticker.Stop()
              return
          }
      }
   }()

   scan()
}

func setDefaultDevice() {
  device, err := darwin.NewDevice()
  if err != nil {
    log.Fatalf("Can't register new device : %s", err)
  }

  ble.SetDefaultDevice(device)
}

func scan() {
  log.SetOutput(os.Stdout)

  // NOTE: Scan for specified durantion, or until interrupted by user.
  log.Printf("Scanning for %s...\n", SCAN_DURATION)
  ctx := ble.WithSigHandler(context.WithTimeout(context.Background(), SCAN_DURATION))
  errorHandler(ble.Scan(ctx, ALLOW_DUPLICATE, enterHandler, nil))
}

// func signalHandler(channel chan os.Signal) {
//   go func() {
//     s := <-channel
//     log.Printf("RECEIVED SIGNAL: %v", s)
//     log.Printf("Agent terminated\n")
//     os.Exit(1)
//   }()
// }

func enterHandler(a ble.Advertisement) {
  log.SetOutput(os.Stdout)
  isScanning = true
  uuid := a.Address()
  name := strings.Split(a.LocalName(), "_")[0]
  rssi := a.RSSI()
  now := time.Now()

  // FIXME: Switch to [].includes(uuid)
  if len(name) > 0 && name == "Minew" {
    if rssi < RSSI_THRESHOLD {
      log.Printf("[%d]: OUT OF RANGE\n", rssi)

      return
    }

    _, ok := inRange[uuid]

    if !ok {
      message := fmt.Sprintf("iBeacon: %s entered", name)
      go say(message)
      log.Printf("[%d]: >> %s\n", rssi, message)
    } else {
      // log.Printf("%s entered, with signal strength %d\n", a.LocalName(), a.RSSI())
    }

    inRange[uuid] = map[string]interface{}{ "name": name, "rssi": rssi, "updated_at": now }
    log.Printf("[%d]: IN RANGE\n", rssi)

    // go memoryUsage()

  }
}

func exitHandler(peripherals map[ble.Addr]map[string]interface {}, quit chan struct{}) {

  if !isScanning {
    log.SetOutput(os.Stderr)
    log.Printf("Exit and restart since scan is not running: %v\n", isScanning)

    // FIXME: Close and call main????
    // close(quit)
    // main()

    // Or os.Exit(1)
    os.Exit(1)
  }

  now := time.Now()
  log.SetOutput(os.Stdout)

  for id, peripheral := range peripherals {
    name := peripheral["name"]
    rssi := peripheral["rssi"]

    leavesAt := peripheral["updated_at"].(time.Time).Add(time.Duration(EXIT_GRACE_PERIOD) * time.Second)
    elapsed := now.Sub(peripheral["updated_at"].(time.Time)).Round(time.Second)

    // fmt.Printf("   [%s] UPDATED: %s, LEAVES: %s\n", now.Format("15:04:05"), peripheral["updated_at"].(time.Time).Format("15:04:05"), leavesAt.Format("15:04:05"))
    // fmt.Printf("   DIFF: %s\n", elapsed)

    if now.Unix() > leavesAt.Unix() {
      message := fmt.Sprintf("Golang: %s exited", name)

      go say(message)
      log.Printf("[%d]: << %s\n", rssi, message)

      delete(peripherals, id);

      // NOTE: DEBUG exit
      // close(quit)
      // os.Exit(3)

    } else {
      log.Printf("[%d]: SEEN (%s) ago\n", rssi, elapsed)
    }
  }

  isScanning = false
}

func errorHandler(err error) {
  log.SetOutput(os.Stderr)

  log.Printf("errorHandler\n")

  switch errors.Cause(err) {
  case nil:
  case context.DeadlineExceeded:
    log.Printf("done\n")
  case context.Canceled:
    log.Printf("canceled\n")
  default:
    log.Fatalf(err.Error())
  }

  os.Exit(1)
}

func say(message string) {
  exec.Command("say", "-v", "Susan", message).Run()
}

func memoryUsage() {
  log.Printf("Total system memory: %d MB\n", memory.TotalMemory() / 1024 / 1024 / 1024)

  // var m runtime.MemStats
  // runtime.ReadMemStats(&m)
  // // For info on each, see: https://golang.org/pkg/runtime/#MemStats
  // fmt.Printf("Alloc = %v MiB", m.Alloc / 1024 / 1024)
  // fmt.Printf("\tTotalAlloc = %v MiB", m.TotalAlloc / 1024 / 1024)
  // fmt.Printf("\tSys = %v MiB", m.Sys / 1024 / 1024)
  // fmt.Printf("\tNumGC = %v\n", m.NumGC)
  //
  // fmt.Printf("CPU: %d\n", runtime.NumCP)
}


// func schedule(what func(), delay time.Duration) chan bool {
//   stop := make(chan bool)
//
//   go func() {
//     for {
//       what()
//       select {
//       case <-time.After(delay):
//       case <-stop:
//         return
//       }
//     }
//   }()
//
//   return stop
// }


// func setInterval(someFunc func(), milliseconds int, async bool) chan bool {
//
//   // How often to fire the passed in function
//   // in milliseconds
//   interval := time.Duration(milliseconds) * time.Millisecond
//
//   // Setup the ticket and the channel to signal
//   // the ending of the interval
//   ticker := time.NewTicker(interval)
//   clear := make(chan bool)
//
//   // Put the selection in a go routine
//   // so that the for loop is none blocking
//   go func() {
//     for {
//         select {
//         case <-ticker.C:
//             if async {
//               // This won't block
//               go someFunc()
//             } else {
//               // This will block
//               someFunc()
//             }
//         case <-clear:
//             ticker.Stop()
//             return
//         }
//     }
//   }()
//
//   // We return the channel so we can pass in
//   // a value to it to clear the interval
//   return clear
// }


// func advHandler(a ble.Advertisement) {
//   if a.Connectable() {
//     fmt.Printf("[%s] C %3d:", a.Address(), a.RSSI())
//   } else {
//     fmt.Printf("[%s] N %3d:", a.Address(), a.RSSI())
//   }
//
//   comma := ""
//   if len(a.LocalName()) > 0 {
//     fmt.Printf(" Name: %s", a.LocalName())
//     comma = ","
//   }
//
//   if len(a.Services()) > 0 {
//     fmt.Printf("%s Svcs: %v", comma, a.Services())
//     comma = ","
//   }
//
//   if len(a.ManufacturerData()) > 0 {
//     fmt.Printf("%s MD: %X", comma, a.ManufacturerData())
//   }
//
//   fmt.Printf("\n")
// }


// ping := func() { fmt.Println("#") }
// stop := schedule(ping, 5*time.Millisecond)
// time.Sleep(25 * time.Millisecond)
// stop <- true
// time.Sleep(25 * time.Millisecond)
// fmt.Println("Done")
