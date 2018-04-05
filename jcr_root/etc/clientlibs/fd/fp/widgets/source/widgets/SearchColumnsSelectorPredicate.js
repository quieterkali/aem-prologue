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
CQ.formsearch.SearchColumnsSelectorPredicate = CQ.Ext.extend(CQ.form.CompositeField, {

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
* @type CQ.Ext.form.Selection
*/
columnType: null,

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
    CQ.formsearch.SearchColumnsSelectorPredicate.superclass.constructor.call(this, config);
},

//overriding CQ.Ext.Component#initComponent
initComponent: function () {
    CQ.formsearch.SearchColumnsSelectorPredicate.superclass.initComponent.call(this);

    // Hidden field
    this.hiddenField = new CQ.Ext.form.Hidden({name: this.name});
    this.add(this.hiddenField);

    // Link URL
    this.columnType = new CQ.form.Selection({
        fieldLabel: "Column",
        allowBlank: false,
        type: "select",
        xtype: "selection",
        defaultValue: "name",
        width: 250,
        options: [
            {value: "name",text: "Name",qtip: "Name of form"},
            {value: "title",text: "Title",qtip: "Title of form"},
            {value: "description",text: "Description",qtip: "Description of form"},
            {value: "author",text: "Author",qtip: "Author of form"},
            {value: "assetType",text: "Asset Type",qtip: "Type of asset"}
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
    this.add(this.columnType);

    // Link text
    this.captionText = new CQ.Ext.form.TextField({
        width: 250,
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
},

processInit: function (path, record) {
    this.captionText.processInit(path, record);
    this.columnType.processInit(path, record);
},

setValue: function (value) {
    var link = JSON.parse(value);
    this.captionText.setValue(link.captionText);
    this.columnType.setValue(link.columnType);
    this.hiddenField.setValue(value);
},

getValue: function () {
    return this.getRawValue();
},

getRawValue: function () {
    var column = {
        "columnType": this.columnType.getValue(),
        "captionText": this.captionText.getValue()
    };

    return JSON.stringify(column);
},
    
beforeAddNewPredicate: function (list, component, index) {
    //alert(index);
    //this.updateHidden();
},
    
updateCaptionLabels: function (box, value) {
    var parrent = box.findParentByType('formsearchcolumnsselectorpredicate');
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
                case "name":
                {
                    this.setLabelCaption(text, "Name");
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
                case "assetType":
                {
                    this.setLabelCaption(text, "Asset Type");
                    break;
                }
            }
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
                || existingValue == "Name" 
                || existingValue=="Author" 
                || existingValue=="Description"
                || existingValue=="Asset Type")
            {
                text.setValue(value);
            }
        }
    }
    this.updateHidden();
},

updateHidden: function () {
    this.hiddenField.setValue(this.getValue());
}

});

CQ.Ext.reg("formsearchcolumnsselectorpredicate", CQ.formsearch.SearchColumnsSelectorPredicate);