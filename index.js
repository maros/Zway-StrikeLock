/*** StrikeLock Z-Way HA module *******************************************

Version: 1.01
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
    this.lockDevHidden      = false;
    this.sensorDev          = undefined;
    this.lockDev            = undefined;
    this.langFile           = undefined;
    this.devices            = ['lock','sensor'];
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
    
    // Create vdev
    self.vDev = self.controller.devices.create({
        deviceId: "StrikeLock_" + self.id,
        defaults: {
            metrics: {
                title: self.langFile.m_title,
                level: 'close',
                icon: self.iconPath+'/icon.png'
            }
        },
        overlay: {
            deviceType: 'doorlock'
        },
        handler: function(command,args) {
            if (self.lockDev !== null) {
                if (command === 'update') {
                    self.lockDev.performCommand('update');
                    self.sensorDev.performCommand('update');
                    self.updateState();
                } else if (command === 'close' || command === 'open') {
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
    
    // Find, hide & bind devices
    var ok = true;
    _.each(self.devices,function(type) {
        var deviceId = self.config[type];
        var vDev = self.controller.devices.get(deviceId);
        if (vDev === null) {
            ok = false;
            console.error('[StrikeLock] Missing '+type+' device '+deviceId);
            return;
        }
        
        if (self.config[type+'Hide']
            && vDev.get('visibility') !== false) {
            self[type+'DevHidden'] = true;
            vDev.set({'visibility': false});
        }
        
        vDev.on('change:metrics:level',self.callback);
        self[type+'Dev'] = vDev;
    });
    
    if (ok) {
        self.callback();
    }
};

StrikeLock.prototype.stop = function () {
    var self = this;
    
    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }
    
    // Find, show & unbind devices
    _.each(self.devices,function(type) {
        var vDev = self.controller.devices.get(self.config[type]);
        
        if (vDev === null) {
            return;
        }
        
        if (self[type+'DevHidden'] === true) {
            self[type+'DevHidden'] = false;
            vDev.set({'visibility': true});
        }
        
        vDev.off('change:metrics:level',self.callback);
        self[type+'Dev'] = vDev;
    });
    
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