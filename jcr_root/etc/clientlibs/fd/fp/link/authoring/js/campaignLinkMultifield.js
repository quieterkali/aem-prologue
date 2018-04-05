/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

CQ.wcm.FPCampaignMultiField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    hiddenField: null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    propertyField: null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    valueField: null,

    /**
     * @private
     * @type CQ.form.Select
     */
    typeField: null,

    /**
     * @private
     * @type CQ.form.Select
     */
    campaignField: null,

    constructor: function (config) {
        config = config || { };
        var defaults = {
            "border": true,
            "layout": "form"
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.wcm.FPCampaignMultiField.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent: function () {
        CQ.wcm.FPCampaignMultiField.superclass.initComponent.call(this);

        this.propertyField = new CQ.Ext.form.TextField({
            listeners: {
                change: {
                    scope: this,
                    fn: this.updateHidden
                }
            },
            allowBlank: false,
            fieldLabel: "Key",
            regex: /^[a-zA-Z0-9-_^\s]+$/,
            regexText: 'Only alphanumeric characters, "_" and "-" are allowed'
        });
        this.add(this.propertyField);

        this.typeField = new CQ.form.Selection({
            type:"select",
            fieldLabel: "Type of parameter",
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: this.loadValueField
                },
                change: {
                    scope:this,
                    fn: this.loadValueField
                }
            },
            options: this.paramTypeProvider()
        });
        this.add(this.typeField);

        this.campaignField = new CQ.form.Selection({
            type:"select",
            fieldLabel: "Adobe Campaign Schema",
            hidden: true,
            value: "Adobe Campaign",
            listeners: {
                selectionchanged: {
                    scope:this,
                    fn: function(){
                        this.updateValueFromCampaign();
                        this.updateHidden();
                    }
                },
                loadcontent: {
                    scope: this,
                    fn: function(){
                        this.loadValueField();
                    }
                }
            },
            options: this.campaignOptionsProvider()
        });
        this.add(this.campaignField);

        this.valueField = new CQ.Ext.form.TextField({
            fieldLabel: "Value of parameter",
            listeners: {
                change: {
                    scope: this,
                    fn: this.updateHidden
                }
            }
        });
        this.add(this.valueField);

        this.hiddenField = new CQ.Ext.form.TextField({
            hidden: true,
            name: this.name
        });
        this.add(this.hiddenField);
    },

    // overriding CQ.form.CompositeField#processPath
    processPath: function (path) {
        this.propertyField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord: function (record, path) {
        this.propertyField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function (value) {
        var keyValPair = JSON.parse(value);
        this.propertyField.setValue(keyValPair.key);
        this.valueField.setValue(keyValPair.value);
        this.typeField.setValue(keyValPair.type);
        this.campaignField.setValue(keyValPair.campaign);
        this.hiddenField.setValue(value);
        this.loadValueField();
    },

    validateProperty: function(){
        this.updateHidden();
    },

    updateHidden: function() {
        var dialog = this.findParentByType('dialog');
        if(dialog.getField("./clickExp")){
            window.FD.FP.SaveConfigChangeListener(this);
        }
        this.hiddenField.setValue(this.getValue());
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function () {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue: function () {
        if (!this.propertyField) {
            return null;
        }
        var keyValPair = {
            "key": this.propertyField.getValue(),
            "value": this.valueField.getValue(),
            "type": this.typeField.getValue(),
            "campaign": this.campaignField.getValue()
        };

        return JSON.stringify(keyValPair);
    },

    paramTypeProvider: function(){
        return[{
            text:"Expression",
            value:"expression"
        },{
            text:"Adobe Campaign Schema",
            value:"campaign"
        }];
    },

    campaignOptionsProvider: function(){
        return CQ.mcm.Campaign.Utils.getVariables();
    },

    loadValueField: function(){
        var type = this.typeField.getValue();
        if(type == "campaign"){
            this.campaignField.show();
            this.valueField.disable();
        } else {
            if(this.valueField.disabled){
                this.valueField.setValue();
            }
            this.campaignField.hide();
            this.valueField.enable();
        }
    },
    updateValueFromCampaign: function(){
        var campaignSchema = this.campaignField.getValue();
        this.valueField.setValue(campaignSchema);
    }

});

// register xtype
CQ.Ext.reg('campaignlinkmultifield', CQ.wcm.FPCampaignMultiField);
