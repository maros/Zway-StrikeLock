/*** StrikeLock Z-Way HA module *******************************************

Version: 1.00
(c) Z-Wave.Me, 2015
-----------------------------------------------------------------------------
Author: Maroš Kollár <maros@k-1.com>
Description:
    StrikeLock module supports the combination of lock and binary door sensor

******************************************************************************/

function StrikeLock (id, controller) {
    // Call superconstructor first (AutomationModule)
    StrikeLock.super_.call(this, id, controller);
    
    this.vDev               = undefined;
    this.sensorDevHidden    = false;
    this.sensorDev          = undefined;
    this.lockDev            = undefined;
    this.langFile           = undefined;
    this.iconPath           = '/ZAutomation/api/v1/load/modulemedia/'+this.constructor.name;
}

inherits(StrikeLock, AutomationModule);

_module = StrikeLock;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

StrikeLock.prototype.init = function (config) {
    StrikeLock.super_.prototype.init.call(this, config);
    
    var self = this;
    
    self.langFile = self.controller.loadModuleLang(self.constructor.name);
    var devieType, deviceLevel;
    if (self.config.disableLock) {
        devieType = 'sensorBinary';
        deviceLevel = 'close';
    } else {
        devieType = 'doorlock';
        deviceLevel = 'off';
    }
    
    // Create vdev
    self.vDev = self.controller.devices.create({
        deviceId: "StrikeLock_" + this.id + "_" + devieType,
        defaults: {
            metrics: {
                probeTitle: '',
                title: self.langFile.m_title,
                level: deviceLevel,
                icon: self.iconPath+'/icon.png'
            }
        },
        overlay: {
            deviceType: devieType
        },
        handler: function(command,args) {
            if (self.lockDev !== null) {
                if (command === 'update') {
                    self.lockDev.performCommand('update');
                    self.updateState();
                } else if (self.config.disableLock === false
                    && (command === 'close' || command === 'open')) {
                    console.error('[StrikeLock] Got command '+command);
                    self.lockDev.performCommand(command);
                }
            }
        },
        moduleId: self.id
    });

    setTimeout(_.bind(self.initCallback,self),15000);
};

StrikeLock.prototype.initCallback = function() {
    var self = this;
    
    self.callback   = _.bind(self.updateState,self);
    self.lockDev    = self.controller.devices.get(self.config.lock);
    self.sensorDev  = self.controller.devices.get(self.config.sensor);
    
    if (self.sensorDev === null) {
        console.error('[StrikeLock] Missing sensor device '+self.config.sensor);
        return;
    }
    if (self.lockDev === null) {
        console.error('[StrikeLock] Missing lock device '+self.config.lock);
        return;
    }
    
    if (self.config.hideSensor
        && self.sensorDev.get('visibility')) {
        self.sensorDevHidden = true;
        self.sensorDev.set({'visibility': false});
    }
    
    self.lockDev.set({'visibility': false});
    
    self.lockDev.on('change:metrics:level',self.callback);
    self.sensorDev.on('change:metrics:level',self.callback);
    
    self.callback();
};

StrikeLock.prototype.stop = function () {
    var self = this;
    
    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }
    
    if (self.sensorDev) {
        self.sensorDev.off('change:metrics:level',self.callback);
        if (self.sensorDevHidden) {
            self.sensorDev.set({'visibility': true});
        }
    }
    
    if (self.lockDev) {
        self.lockDev.off('change:metrics:level',self.callback);
        self.lockDev.set({'visibility': true});
    }
    
    self.callback = undefined;
    
    StrikeLock.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

StrikeLock.prototype.updateState = function (event) {
    var self = this;
    
    console.log('[StrikeLock] Got update');
    var lockLevel       = self.lockDev.get('metrics:level');
    var sensorLevel     = self.sensorDev.get('metrics:level');
    var lockIcon        = (lockLevel === 'close') ? 'lock':'unlock';
    var sensorIcon      = (sensorLevel === 'off') ? 'close':'open';
    
    if (self.vDev.get('deviceType') === 'doorlock') {
        self.vDev.set('metrics:level',lockLevel);
    } else {
        self.vDev.set('metrics:level',sensorLevel);
    }
    self.vDev.set('metrics:lockLevel',lockLevel);
    self.vDev.set('metrics:sensorLevel',sensorLevel);
    self.vDev.set('metrics:icon',self.iconPath+'/icon_'+sensorIcon+'_'+lockIcon+'.png');

};