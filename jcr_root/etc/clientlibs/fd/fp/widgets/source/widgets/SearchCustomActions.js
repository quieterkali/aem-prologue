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
CQ.formsearch.SearchCustomActions = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
* @private
* @type CQ.Ext.form.TextField
*/
hiddenField: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
caption: null,

name: null,

//icon: null,
//
//jsFile: null,

jsFunction: null,

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
    CQ.formsearch.SearchCustomActions.superclass.constructor.call(this, config);
},

//overriding CQ.Ext.Component#initComponent
initComponent: function () {
    CQ.formsearch.SearchCustomActions.superclass.initComponent.call(this);

    // Hidden field
    this.hiddenField = new CQ.Ext.form.Hidden({name: this.name});
    this.add(this.hiddenField);

    // Name text
    this.caption  = new CQ.Ext.form.TextField({
        width: "250px",
        fieldLabel: "Caption",
        maxLength: 30,
        maxLengthText: "A maximum of 30 characters is allowed for the caption.",
        allowBlank: false,
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
        }
    });
    this.add(this.caption);

    // Name text
    this.name  = new CQ.Ext.form.TextField({
        width: "250px",
        fieldLabel: "Name",
        maxLength: 20,
        maxLengthText: "A maximum of 20 characters is allowed for the name.",
        allowBlank: false,
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
        }
    });
    this.add(this.name);

    // FileName
//    this.jsFile = new CQ.html5.form.SmartFile({
//        "fieldLabel": "JS File:",
//        "allowBlank": true,
//        "hideLabel": false,
//        "ddAccept": "unknown",
//        "ddGroups": "[media]",
//        "fileNameParameter": "./fileName",
//        "fileReferenceParameter": "./fileReference",
//        "name": "./jsFile",
//        "uploadUrl": "/tmp/upload/*"
//    });
//    this.add(this.jsFile);

//    this.add(this.jsFile);
//    // FileName
//    this.jsFile = new CQ.Ext.form.FileUploadField({
//        fieldLabel: "Javascript File",
//        xtype: "fileuploadfield",
//        listeners: {
//            change: {
//                scope: this,
//                fn: this.updateHidden
//            }
//        }
//    });
//    this.add(this.jsFile);

    // Image
//    this.icon  = new CQ.form.SmartImage({
//        fieldLabel: "Icon",
//        autoUploadDelay: 1,
//        ddGroups: ["media"],
//        fileNameParameter: "./image/fileName",
//        fileReferenceParameter: "./image/fileReference",
//        mapParameter: "./image/imageMap",
//        name: "./image/file",
//        requestSuffix: "/image.img.png",
//        rotateParameter: "./image/imageRotate",
//        sizeLimit: "100",
//        title: "Image",
//        xtype: "xtype",
//        listeners: {
//            change: {
//                scope: this,
//                fn: this.updateHidden
//            }
//        }
//    });
//    this.add(this.icon);

    // Image
    this.jsFunction  = new CQ.Ext.form.TextArea({
        fieldLabel: "Javascript function",
        xtype: "textarea",
        width: "250px",
        allowBlank: true,
        listeners: {
            change: {
                scope: this,
                fn: this.updateHidden
            }
        }
    });
    this.add(this.jsFunction);
},

processInit: function (path, record) {
    this.name.processInit(path, record);
},

setValue: function (value) {
    var action = JSON.parse(value);
    this.caption.setValue(action.caption);
    this.name.setValue(action.name);
//    this.icon.setValue(action.icon);
//    this.jsFile.setValue(action.jsFile);
    this.jsFunction.setValue(action.jsFunction);
    this.hiddenField.setValue(value);
},

getValue: function () {
    return this.getRawValue();
},

getRawValue: function () {
    var action = {
        "caption": this.caption.getValue()
        ,"name": this.name.getValue()
//        ,"icon": this.icon.getValue()
//        ,"jsFile": this.jsFile.getValue()
        ,"jsFunction": this.jsFunction.getValue()
    };

    return JSON.stringify(action);
},
    
beforeAddNewPredicate: function (list, component, index) {
    alert(index);
    //this.updateHidden();
},
    
updateHidden: function () {
    this.hiddenField.setValue(this.getValue());
}

});

CQ.Ext.reg("formsearchcustomactions", CQ.formsearch.SearchCustomActions);