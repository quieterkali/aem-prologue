/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
 * All Rights Reserved.
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
 *
 */

/**
 * The <code>CQ.formsearch.Lens</code> class provides an abstract lens.
 * @class CQ.formsearch.Lens
 * @extends CQ.Ext.Panel
 * @constructor
 * @param {Object} config The config object
 */
CQ.formsearch.SearchOptionsPredicate = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
* @private
* @type CQ.Ext.form.TextField
*/
hiddenField: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
captionText: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
defaultFilter: null,

/**
* @private
* @type CQ.Ext.form.Selection
*/
preducateType: null,

/**
* @private
* @type CQ.Ext.form.Selection
*/
statusFilter: null,

/**
* @private
* @type CQ.Ext.form.CheckBox
*/
enabled: null,

/**
* @private
* @type CQ.Ext.form.FormPanel
*/
formPanel: null,

constructor: function (config) {
    config = config || {};
    var defaults = {
        "border": true,
        "layout": "form"
    };
    config = CQ.Util.applyDefaults(config, defaults);
    CQ.formsearch.SearchOptionsPredicate.superclass.constructor.call(this, config);
},

//overriding CQ.Ext.Component#initComponent
initComponent: function () {
    CQ.formsearch.SearchOptionsPredicate.superclass.initComponent.call(this);

    // Hidden field
    this.hiddenField = new CQ.Ext.form.Hidden({name: this.name});
    this.add(this.hiddenField);

    // Link URL
    this.preducateType = new CQ.form.Selection({
        fieldLabel: "Type",
        allowBlank: false,
        type: "select",
        xtype: "selection",
        defaultValue: "title",
        width: "250px",
        options: [
            {value: "title",text: "Title",qtip: "Title of form"},
            {value: "author",text: "Author",qtip: "Author of form"},
            {value: "description",text: "Description",qtip: "Description of form"}
        ],
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
            ,dialogclose: {
                scope: this,
                fn: this.updateHidden
            }
//            ,beforeadd: {
//                scope: this,
//                fn: this.beforeAddNewPredicate
//            }
            ,selectionchanged: 
            {
                scope: this,
                fn: this.updateCaptionLabels
            }
        }
    });
    this.add(this.preducateType);

    // Caption text
    this.captionText = new CQ.Ext.form.TextField({
        width: "250px",
        fieldLabel: "Label",
        maxLength: 30,
        maxLengthText: "A maximum of 30 characters is allowed for the Caption Label.",
        allowBlank: true,
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
        }
    });
    this.add(this.captionText);

    // Default filter text
    this.defaultFilter = new CQ.Ext.form.TextField({
        width: 250,
        fieldLabel: "Default Filter",
        emptyText: "Default filter value",
        allowBlank: true,
        hidden  : true,
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
        }
    });
    this.add(this.defaultFilter);

    this.statusFilter = new CQ.form.Selection({
        fieldLabel: "Status",
        allowBlank: false,
        type: "select",
        xtype: "selection",
        defaultValue: "active",
        width: "85px",
        //hidden: true,
        options: [
            {value: "active", text: "Active", qtip: "Active"},
            {value: "all", text: "All", qtip: "All"}
        ],
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
            ,dialogclose: {
                scope: this,
                fn: this.updateHidden
            }
            ,selectionchanged: {
                scope: this
                ,fn: this.updateHidden
            }
        }
    });
    this.statusFilter.setValue("active");
    this.statusFilter.hide();
    this.add(this.statusFilter);

    // Link enabled
    this.enabled = new CQ.Ext.form.Checkbox({
        boxLabel: "Hide",
        listeners: {
            change: {
                scope: this
                ,fn: this.updateHidden
            },
            check: {
                scope: this
                ,fn: this.showHideDefaultFilter
            }
        }
    });
    this.add(this.enabled);
},

processInit: function (path, record) {
    this.captionText.processInit(path, record);
    this.preducateType.processInit(path, record);
    this.enabled.processInit(path, record);
    this.defaultFilter.processInit(path, record);
    this.statusFilter.processInit(path, record);
},

setValue: function (value) {
    var link = JSON.parse(value);
    this.captionText.setValue(link.captionText);
    this.defaultFilter.setValue(link.defaultFilter);
    this.preducateType.setValue(link.preducateType);
    this.enabled.setValue(link.enabled);
    this.statusFilter.setValue(link.statusFilter);
    this.hiddenField.setValue(value);
},

getValue: function () {
    return this.getRawValue();
},

getRawValue: function () {
    var link = {
        "preducateType": this.preducateType.getValue(),
        "statusFilter": this.statusFilter.getValue(),
        "captionText": this.captionText.getValue(),
        "defaultFilter": this.defaultFilter.getValue(),
        "enabled": this.enabled.getValue()
    };

    return JSON.stringify(link);
},
    
beforeAddNewPredicate: function (list, component, index) {
    alert(index);
    //this.updateHidden();
},
    
updateCaptionLabels: function (box, value) {
    var parrent = box.findParentByType('formsearchoptionspredicate');
    if(parrent)
	{
		var elems = parrent.findByType('textfield');
		var text = elems[1];
		if(text){
            switch(value){
                case "title":
                {
                    this.setLabelCaption(text, "Title");
                    break;
                }
                case "author":
                {
                    this.setLabelCaption(text, "Author");
                    break;
                }
                case "description":
                {
                    this.setLabelCaption(text, "Description");
                    break;
                }
            }
            //this.showHideDefaultFilter(box, "");
		}
	}
},
    
setLabelCaption: function (text, value) {
    if(text.getValue()==""){
        text.setValue(value);
    } else {
        var existingValue = text.getValue();
        if(value != existingValue){
            if(
                existingValue=="Title"
                || existingValue=="Author" 
                || existingValue=="Description"){
                text.setValue(value);					
            }
        }
    }
    this.updateHidden();
},

updateHidden: function () {
    this.hiddenField.setValue(this.getValue());
},

showHideDefaultFilter: function (box, value) {
    var parrent = box.findParentByType('formsearchoptionspredicate');
    if(parrent)
    {
        var checkBoxes      = parrent.findByType('checkbox');

        var selectionTypes  = parrent.findByType('selection');
        var elems           = parrent.findByType('textfield');

        var checkBoxesBox   = checkBoxes[0];
        var defaultTextBox  = elems[2];
        var selectedTypeBox = selectionTypes[0];
        var statusDefaultFilterBox = selectionTypes[1];

        if(defaultTextBox && selectedTypeBox && checkBoxesBox){
            if(checkBoxesBox.getValue()){
                if(selectedTypeBox.getValue()=='status')
                {
                    defaultTextBox.hide();
                    statusDefaultFilterBox.show();
                    //Setting the width here as by default width of a hidden field is set to 0.
                    // Displaying it again shows 0 width only.
                    statusDefaultFilterBox.setWidth(85);
                }
                else
                {
                    statusDefaultFilterBox.hide();
                    defaultTextBox.show();
                }
            }
            else
            {
                defaultTextBox.hide();
                statusDefaultFilterBox.hide();
            }
        }
    }

    this.updateHidden();
}
});

CQ.Ext.reg("formsearchoptionspredicate", CQ.formsearch.SearchOptionsPredicate);
