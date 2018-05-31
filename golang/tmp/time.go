package main

import (
  "fmt"
  "time"
  "strings"
)


func main() {
  start := time.Now()
  fmt.Printf("START: %s\n", start.Format("15:04:05"))

  fmt.Printf("SLEEP: 2s\n")
  time.Sleep(2 * time.Second)

  end := time.Now()
  fmt.Printf("END: %s\n", end.Format("15:04:05"))

  fmt.Printf("Ellapsed: %s\n", time.Since(start).Round(time.Second))

  name := strings.Split("Minew_0001", "_")[0]
  fmt.Printf("Name: %s\n", name)


  // ping := func() { fmt.Println("#") }
  // stop := schedule(ping, 5*time.Millisecond)
  // time.Sleep(25 * time.Millisecond)
  // stop <- true
  // time.Sleep(25 * time.Millisecond)
  // fmt.Println("Done")
}
