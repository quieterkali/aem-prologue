// jscs:disable requireDotNotation
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
 * Created with IntelliJ IDEA.
 * User: vist
 * Date: 12/11/13
 * Time: 4:07 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @class CQ.wcm.GuideActionTypeSelection
 * @extends CQ.form.Selection
 * The GuideActionTypeSelection is a specific {@link CQ.form.Selection} to select
 * the action of the guide component. After the value has
 * been changed the content of the Action Configuration tab is adjusted.
 * @constructor
 * Creates a new GuideActionTypeSelection.
 * @param {Object} config The config object
 * @private
 */
CQ.wcm.GuideActionTypeSelection = CQ.Ext.extend(CQ.form.Selection, {

    /**
     * @cfg {String} tabId
     * The id of the tab to add the guide action fields to.
     */
    tabId : null,

    /**
     * @cfg {String} workflowId
     * The id of the workflow selector widget, that's
     * only enabled for actions that use workflow
     */
    workflowId : null,

    /**
     * Loaded data
     */
    loadedData : null,

    storedValue : null,

    defaults : {
        type : "select",
        tabId : "guide_action_config_panel",
        workflowId : "cq5_form_action_workflow_id"
    },

    defaultValue : "fd/fp/components/actions/portalsubmit",

    defaultOptions : {type : "submitAction",
           guideDataModel : "basic"},

    constructor : function (config) {
        var JsonOptions = this.getActionOptions();
        _.extend(this.defaults, {options : JsonOptions});
        CQ.Util.applyDefaults(config, this.defaults);
        CQ.wcm.GuideActionTypeSelection.superclass.constructor.call(this, config);
        this.tabId = config.tabId;
        this.workflowId = config.workflowId;
        this.addListener(CQ.form.Selection.EVENT_SELECTION_CHANGED, function (component, value) {
            this.notifyChange(value, false);
        });
    },

    initComponent : function () {
        CQ.wcm.GuideActionTypeSelection.superclass.initComponent.call(this);
    },

    /**
     * Value changed - update config tab and enable workflow selection widget
     */
    notifyChange : function (value, loadWidgets) {
        var dialog = this.findParentByType("dialog");
        var configTab = dialog.find("componentId", this.tabId)[0];
        if (configTab != null) {
            configTab.items.each(function (item, index, length) {
                // this should fix the issues related to
                // multi select fields in action  configuration where
                // we were not able to close the dialog on
                // emptying any mandatory field and changing submit action
                //CQ-21517
                item.disable();
                configTab.remove(item);
            }, this);
            configTab.doLayout();

            var dialogPath;
            if (!window.progressive) {
                dialogPath = guidelib.author.AuthorUtils._getResourcePath(value + "/dialog.infinity.json");
            } else {
                dialogPath = value + "/dialog.infinity.json";
            }
            response = CQ.utils.HTTP.get(dialogPath);
            var noItems = true;
            var needWorkflow = false;
            if (CQ.HTTP.isOk(response)) {
                var items = CQ.utils.Util.formatData(CQ.Util.eval(response));
                for (var i in items) {
                    if (!items[i] || (typeof items[i] == "string") || (typeof items[i] == "boolean")) {
                        continue;
                    }
                    var wi = configTab.add(items[i]);
                    configTab.doLayout();
                    noItems = false;
                    wi.processRecord(this.loadedData);
                }
                configTab.doLayout();
                needWorkflow = items && items.usesWorkflow;
            }
            if (noItems) {
                configTab.add({
                    "xtype" : "static",
                    "italic" : true,
                    "small" : true,
                    "style" : "color:gray;",
                    "text" : CQ.I18n.getMessage("No additional configuration options are available.")
                });
                configTab.doLayout();
            }

            if (this.workflowId) {
                // Disable workflow widget unless action needs it
                var workflowWidget = this.findParentByType("dialog").find("componentId", this.workflowId)[0];
                if (workflowWidget) {
                    workflowWidget.setDisabled(!needWorkflow);
                }
            }

        }
    },

    /**
     * Overwrite handling to get all loaded values
     */
    processRecord : function (record, path) {
        this.loadedData = record;
        CQ.wcm.GuideActionTypeSelection.superclass.processRecord.call(this, record, path);
    },

    /*
     * used to get the old value which can be lost if option is not present.
     */
    getStoredValue : function () {
        return this.storedValue;
    },

    /**
     * Overwrite handling of the initial case where value is not set yet.
     */
    setValue : function (value) {
        if (typeof value == "undefined" || value === null) {
            value = this.defaultValue;
        }
        /*
        * Set oldValue because if an xfa submit action is selected, it is not already available in options, so value is set to ""
        * Storing whatever value is present, so that we dont lose it when superclass setvalue is called.
        */
        if (!window.progressive) {
            value = guidelib.author.GuideExtJSDialogUtils.sanitizePath(value);
        }
        this.storedValue = value;
        CQ.wcm.GuideActionTypeSelection.superclass.setValue.call(this, value);
        this.notifyChange(value, true);
    },

    /**
     * Constructing options from SubmitAction from the guidesubmittype component.
     */
    getActionOptions : function () {
        var optionsJson = [];
        $.ajax({
            type : "GET",
            url : CQ.HTTP.externalize("/libs/fd/af/components/info.json"),
            dataType : "json",
            data : this.defaultOptions,
            async : false
        }).done(function (data) {
                optionsJson = data;
            });
        return optionsJson;
    },

    /**
     * Changing options of SubmitAction depending on the DataModelType.
     * @param modelType: DataModel supported.
     * @param show: True or false. Tells whether DataModel is selected or removed.
     */
    changeOptions : function (modelType, show) {
        this.setOptions([]);
        var optionsJson = [];
        var getOptions = this.defaultOptions;
        if (show) {
            getOptions["guideDataModel"] = modelType;
        }
        $.ajax({
            type : "GET",
            url : CQ.HTTP.externalize("/libs/fd/af/components/info.json"),
            dataType : "json",
            data : getOptions,
            async : false
        }).done(function (data) {
                optionsJson = data;
            });
        this.setOptions(optionsJson);
        this.setValue(this.getStoredValue());
    }
});

CQ.Ext.reg("guideactiontypeselection", CQ.wcm.GuideActionTypeSelection);
