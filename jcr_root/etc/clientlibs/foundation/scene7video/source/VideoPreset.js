/*
 * Copyright 1997-2008 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
CQ.scene7 = CQ.scene7 || {};

CQ.scene7.videoPreset = {};

CQ.scene7.videoPreset.presetResponse =  new Array();

CQ.scene7.videoPreset.init = function(cloudName){
    if (cloudName != "" && !CQ.scene7.videoPreset.presetResponse[cloudName]) {
        var resourcePath = '/etc/cloudservices/scene7/' + cloudName + '/';
        var response = CQ.HTTP.get(resourcePath + 'jcr:content.presets.viewer.json');
        if (CQ.shared.HTTP.isOk(response)) {
            CQ.scene7.videoPreset.presetResponse[cloudName] = CQ.shared.Util.eval(response);
        }
    }
};
/**
 * @class CQ.scene7.videoPreset.VideoPresetSelection
 * @extends CQ.form.Selection
 * The VideoPresetSelection supports Scene7 Video preset selection
 */
CQ.scene7.videoPreset.VideoPresetSelection = CQ.Ext.extend(CQ.form.Selection, {

    constructor: function(config) {

        var videoPresets = new Array();
        videoPresets.push({ value:'',
            text: 'No Preset' });

        var cloudName = "";
        if (config.cloudName) {
            cloudName = config.cloudName;
        }
        
        // check if the presets for the neded company have to be loaded
        if (!CQ.scene7.videoPreset.presetResponse[cloudName]) {
            // load the presets for this company
            CQ.scene7.videoPreset.init(cloudName);
        }
        
        this.store = new CQ.Ext.data.JsonStore({
            autoLoad: false,
            data: CQ.scene7.videoPreset.presetResponse[cloudName],
            fields: [
                'name','config', 'settings', 'type'
            ],
            listeners: {
                'load': function(store, records, options) {
                    store.each(function(record) {
                        var settings = record.get('settings');
                        var vt = settings.vt;
                        var vtype = record.get('type');
                        //Only add AS3 video viewer preset
                        if(vt === 'VideoVirtual' && vtype === 'SDKViewer'){
                            var name = record.get('name');
                            var config = record.get('config');
                            var option = {value:config,
                                text: name}
                            videoPresets.push(option);
                        }
                    });
                }
            }
        });

        config = CQ.Util.applyDefaults(config, {
            type: 'select',
            options: videoPresets
        });

        CQ.scene7.videoPreset.VideoPresetSelection.superclass.constructor.call(this,config);
    }
});

/**
 * @class CQ.scene7.videoPreset.UniversalVideoPresetSelection
 * @extends CQ.form.Selection
 * The UniversalVideoPresetSelection supports Scene7 Universal Video preset selection
 */
CQ.scene7.videoPreset.UniversalVideoPresetSelection = CQ.Ext.extend(CQ.form.Selection, {

    constructor: function(config) {

        var videoPresets = new Array();
        videoPresets.push({ value:'',
            text: 'No Preset' });

        var cloudName = "";
        if (config.cloudName) {
            cloudName = config.cloudName;
        }
        
        // check if the presets for the neded company have to be loaded
        if (!CQ.scene7.videoPreset.presetResponse[cloudName]) {
            // load the presets for this company
            CQ.scene7.videoPreset.init(cloudName);
        }
        
        this.store = new CQ.Ext.data.JsonStore({
            autoLoad: false,
            data: CQ.scene7.videoPreset.presetResponse[cloudName],
            fields: [
                'name','config', 'settings', 'type'
            ],
            listeners: {
                'load': function(store, records, options) {
                    store.each(function(record) {
                        var settings = record.get('settings');
                        var vt = settings.vt;
                        var vtype = record.get('type');
                        //Only add AS3 video viewer preset
                        if(vt === 'VideoVirtual' && vtype === 'UniversalViewer'){
                            var name = record.get('name');
                            var config = record.get('config');
                            var option = {value:config,
                                text: name}
                            videoPresets.push(option);
                        }
                    });
                }
            }
        });

        config = CQ.Util.applyDefaults(config, {
            type: 'select',
            options: videoPresets
        });

        CQ.scene7.videoPreset.UniversalVideoPresetSelection.superclass.constructor.call(this,config);
    }
});



CQ.Ext.reg('s7videopreset', CQ.scene7.videoPreset.VideoPresetSelection);
CQ.Ext.reg('s7universalvideopreset', CQ.scene7.videoPreset.UniversalVideoPresetSelection);