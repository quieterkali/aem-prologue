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

/**
 * @class CQ.ShowGuideActionEditor
 * @extends CQ.Dialog
 * The ShowGuideActionEditor is a dialog for editing Show/Hide Rules.
 */
CQ.ShowGuideActionEditor = CQ.Ext.extend(CQ.Dialog, {

    okHandler : function (expression) {},

    cancelHandler : function () {},

    constructor : function (config) {
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }
        if (!config.cancelHandler) {
            config.cancelHandler = this.cancelHandler;
        }
        if (!config.actionData) {
            this.actionData = config.actionData = {};
        }
        var configDefaults = {
            closable : true,
            closeAction : "close",
            width : 515,
            modal : true,
            title : "Edit Action Configurations",
            buttonAlign : "left",
            path : "",
            "buttons" : [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ]
        };
        CQ.Util.applyDefaults(config, configDefaults);
        CQ.ShowGuideActionEditor.superclass.constructor.call(this, config);
        var store = this._createStore(this.actionData);
        this.loadContent(store);
        this.show();
    },

    _createStore : function (actionData) {
        var rootData = actionData;
        var fields = [];
        for (var propName in rootData) {
            if (rootData.hasOwnProperty(propName)) {
                fields.push({name : propName, mapping : propName});
            }
        }
        var reader = new CQ.Ext.data.ArrayReader(null, CQ.data.SlingRecord.create(fields));

        var store = new CQ.Ext.data.ArrayStore({
            // store configs
            autoDestroy : true,
            results : 1,
            fields : fields,
            storeId : 'myStore',
            idProperty : 'name',
            proxy : new CQ.Ext.data.MemoryProxy([rootData]) ,
            reader : reader
        });
        store.reader = reader;
        store.loadData([rootData]);
        return store;
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getOkConfig : function () {
        return {
            text : this.okText,
            cls : "cq-btn-ok",
            handler : function (button) {
                // scope: "this" is a dialog instance
                if (this.form.isValid()) {
                    this.form.items.each(function (field) {
                        // clear fields with emptyText so emptyText is not submitted
                        if (field.emptyText && field.el && field.el.dom && field.el.dom.value == field.emptyText) {
                            field.setRawValue("");
                        }
                        if (field.getValue()) {
                            var name = field.getName();
                            if (name && name.indexOf("./") == 0) {
                                name = name.substring(2);
                            }
                            if (name && name.substring(0, 1) != ":" && name != "_charset_") {
                                this.actionData[name] = field.getValue();
                            }
                        }
                    }, this);
                } else {
                    CQ.Ext.Msg.show({
                        title : CQ.I18n.getMessage('Validation failed'),
                        msg : CQ.I18n.getMessage('Verify the values of the marked fields.'),
                        buttons : CQ.Ext.Msg.OK,
                        icon : CQ.Ext.Msg.ERROR
                    });
                }
                this[this.closeAction]();
                this.okHandler(this.actionData);
            }
        };
    },

    /**
     * Returns the config for the default cancel button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getCancelConfig : function () {
        return {
            text : this.cancelText,
            cls : "cq-btn-cancel",
            handler : function (button) {
                // scope: "this" is a dialog instance
                this[this.closeAction]();
                this.cancelHandler();
            }
        };
    }

});
