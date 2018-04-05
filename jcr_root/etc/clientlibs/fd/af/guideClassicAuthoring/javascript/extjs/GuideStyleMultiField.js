/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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

CQ.wcm.GuideStyleMultiField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    propertyField : null,

    /**
     * @private
     * @type CQ.Ext.form.TextField
     */
    valueField : null,

    constructor : function (config) {
        config = config || {};
        var defaults = {
            "border" : false,
            "layout" : "table",
            "columns" : 2,
            "autoWidth" : true,
            "cssAttributes" : ["border-style", "border-width", "border-color", "border-radius", "padding", "margin",
                "color", "text-align", "font-size", "font-weight", "font-family", "line-height", "background-color"]
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.wcm.GuideStyleMultiField.superclass.constructor.call(this, config);
    },

    // overriding CQ.Ext.Component#initComponent
    initComponent : function () {
        CQ.wcm.GuideStyleMultiField.superclass.initComponent.call(this);

        var cssAttributes = this.cssAttributes;
        //converting the attributes to array of array
        if (cssAttributes != null) {
            cssAttributes = _.map(cssAttributes, function (cssAttribute) {
                //trimming the attribute since there are spaces in dialog.xml
                return [cssAttribute.replace(/^\s+|\s+$/g, "")];
            });
        }
        this.propertyField = new CQ.Ext.form.ComboBox({
            typeAhead : true,
            triggerAction : 'all',
            mode : 'local',
            store : new CQ.Ext.data.ArrayStore({
                id : 0,
                fields : [
                    'property'
                ],
                data : cssAttributes
            }),
            valueField : 'property',
            displayField : 'property'
        });
        this.add(this.propertyField);

        this.valueField = new CQ.Ext.form.TextField();
        this.add(this.valueField);
    },

    // overriding CQ.form.CompositeField#processPath
    processPath : function (path) {
        this.propertyField.processPath(path);
    },

    // overriding CQ.form.CompositeField#processRecord
    processRecord : function (record, path) {
        this.propertyField.processRecord(record, path);
    },

    // overriding CQ.form.CompositeField#setValue
    setValue : function (value) {
        //this regular expression separates the value provided at the first occurence of ':' . Eg- if value = "image:url:"http://www..." ",
        //this expression splits the value into 2 parts- "image" and " url:"http://www..." "
        var parts = value.split(/:(.+)?/);
        this.propertyField.setValue(parts[0]);
        this.valueField.setValue(parts[1]);
    },

    // overriding CQ.form.CompositeField#getValue
    getValue : function () {
        return this.getRawValue();
    },

    // overriding CQ.form.CompositeField#getRawValue
    getRawValue : function () {
        if (!this.propertyField) {
            return null;
        }
        return this.propertyField.getValue() + ":" +
            this.valueField.getValue();

    }
});

// register xtype
CQ.Ext.reg('guidestylemultifield', CQ.wcm.GuideStyleMultiField);
