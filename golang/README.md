https://medium.com/@AkyunaAkish/setting-up-a-golang-development-environment-mac-os-x-d58e5a7ea24f

http://sourabhbajaj.com/mac-setup/Go/README.html

Mac OS Launch deamon/agent
https://ieftimov.com/create-manage-macos-launchd-agents-golang

launchctl unload/load ~/Library/LaunchAgents/com.example.app.plist

launchctl start/stop ~/Library/LaunchAgents/com.example.app.plist


launchctl load com.beacon.lock.app.plist
launchctl unload com.beacon.lock.app.plist
launchctl list | grep beacon

tail -f /tmp/beacon-log.log
GOOS=darwin GOARCH=amd64 CGO_ENABLED=1 go build -o beacon-lock


# Advanced Smoothing Approach of RSSI and LQI for Indoor Localization System
http://journals.sagepub.com/doi/full/10.1155/2015/195297

# Kalman.js
https://www.wouterbulten.nl/blog/tech/kalman-filters-explained-removing-noise-from-rssi-signals/
https://www.wouterbulten.nl/blog/tech/lightweight-javascript-library-for-noise-filtering/
