# Zway-StrikeLock

An electric Strike is an access control device used to lock and release doors.
Electric Strikes are installed in or on the doorframe and work in conjunction
with mechanical door locks, on the principle of electronically controlling the
rotation of the keeper. This app combines the control of a strike lock with a
door sensor information and allows to add further functionality.

# Configuration

## lock

Lock device

## disableLock

Disable original lock device in UI.

## sensor

Binary door sensor

## hideSensor

Hide original binary sensor in UI.

# Virtual Devices

This module creates a virtual device that displays/controls the state of the
door.

Additionally metrics:lockLevel indicates the state of lock, whereas
metrics:sensorLevel indicates the state of the door.

# Events

No events are emitted.

# Installation

The prefered way of installing this module is via the "Zwave.me App Store"
available in 2.2.0 and higher. For stable module releases no access token is 
required.

For developers and users of older Zway versions installation via git is 
recommended.

```shell
cd /opt/z-way-server/automation/userModules
git clone https://github.com/maros/Zway-StrikeLock.git StrikeLock --branch latest
```

To update or install a specific version
```shell
cd /opt/z-way-server/automation/userModules/StrikeLock
git fetch --tags
# For latest released version
git checkout tags/latest
# For a specific version
git checkout tags/1.02
# For development version
git checkout -b master --track origin/master
```

# License

(c) 2016 - Z-Wave Europe GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
