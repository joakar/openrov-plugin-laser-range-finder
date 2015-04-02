This is a Laser range plugin for OpenROV Cockpit.

NOTE! You must edit rangefinder.js to calibrate the laser range and camera centers

Tested with Release 2.5.1


###install
* Drop openrov-plugin-laser-range-finder folder in ```/opt/openrov/cockpit/src/plugins```
* Restart OpenROV ```/etc/init.d/openrov restart```
* You can enable/disable the plugin at ```settings > Plugins to enable/disable > Laser Range Finder```

Because of cross origin policy in Chrome you need to disable websecurity by open Google Chrome with these args
* OSX: ```open -a Google \ Chrome --args -disable-web-security```
* Windows: ```chrome.exe --disable-web-security```
* Linux: ```google-chrome --disable-web-security```

