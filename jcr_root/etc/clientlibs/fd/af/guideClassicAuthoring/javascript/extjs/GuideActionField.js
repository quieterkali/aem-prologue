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
 * @class CQ.form.ShowHideField
 * @extends CQ.form.CompositeField
 * The CQ.form.ShowHideField is a composite field which represents show/hide rules.
 */
CQ.form.GuideActionField = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor : function (config) {
        if (!config.actionData) {
            this.actionData = config.actionData = {};
        }
        this.availableActions = config.availableActions;
        this.actionDeleteHandler = config.actionDeleteHandler;
        this.actionReorderHandler = config.actionReorderHandler;
        var guideActionField = this;

        var configDefaults = {
            xtype : "compositefield",
            layout : "hbox",
            bodyBorder : false,
            fieldLabel : "",
            style : "padding-top:10px",
            items : [
                {
                    xtype : "selection",
                    type : "select",
                    itemId : "guideActionSelection",
                    width : 280,
                    options : this.availableActions,
                    name : "actionType",
                    style : "padding-right:10",
                    listeners : {
                        selectionchanged : function () {
                            guideActionField.actionData = {};
                            if (this.getValue()) {
                                var _value = this.getValue();
                                for (var i = 0; i < guideActionField.availableActions.length; i++) {
                                    if (guideActionField.availableActions[i].value == _value) {
                                        var selectedAction = guideActionField.availableActions[i];
                                        if (selectedAction.templatePath) {
                                            guideActionField.actionData =
                                                JSON.parse(CQ.utils.HTTP.get(selectedAction.templatePath + ".infinity.json").responseText);
                                        } else {
                                            guideActionField.actionData = {};
                                        }
                                        guideActionField.actionData["name"] = selectedAction.name;
                                        guideActionField.actionData[CQ.form.GuideActionField.LAYOUT_PROPERTY_PATH] = _value;
                                        if (selectedAction["sling:resourceSuperType"]) {
                                            guideActionField.actionData["sling:resourceSuperType"] = selectedAction["sling:resourceSuperType"];
                                        }
                                        break;
                                    }
                                }
//                                guideActionField.editActionData();     TODO: comment out for now
                            } else {
                                guideActionField.updateEditConfigTextButton();
                            }
                            CQ.WCM.getSidekick().previewReload = true;
                        }
                    }
                },
                {
                    "xtype" : "button",
                    "iconCls" : "guides-action-up",
                    "template" : new CQ.Ext.Template('<span style="padding-left:6px, padding-right:6px"><button class="x-btn" type="{0}"></button></span>'),
                    "handler" : function () {
                        if (guideActionField.actionReorderHandler) {
                            guideActionField.actionReorderHandler(guideActionField, true);
                        }
                    }
                },
                {
                    "xtype" : "button",
                    "iconCls" : "guides-action-down",
                    "template" : new CQ.Ext.Template('<span style="padding-left:6px, padding-right:6px"><button class="x-btn" type="{0}"></button></span>'),
                    "handler" : function () {
                        if (guideActionField.actionReorderHandler) {
                            guideActionField.actionReorderHandler(guideActionField, false);
                        }
                    }
                },
                {
                    xtype : "button",
                    iconCls : "guides-action-remove",
                    template : new CQ.Ext.Template('<span style="padding-top:5px, padding-left:6px, padding-right:6px"><button class="x-btn" type="{0}"></button></span>'),
                    scope : this,
                    handler : function () {
                        guideActionField.deleteAction();
                    }
                }
            ]
        };
        CQ.Util.applyDefaults(config, configDefaults);
        CQ.form.GuideActionField.superclass.constructor.call(this, config);
        this._updateValue();
    },

    _updateValue : function () {
        var selectionField = this.find("itemId", "guideActionSelection")[0];
        selectionField.setValue(this.actionData[CQ.form.GuideActionField.LAYOUT_PROPERTY_PATH]);
    },

    updateEditConfigTextButton : function () {
        var editConfigTextButton = this.find("itemId", "editConfigTextButton")[0];
        if (this.getActionType()) {
            editConfigTextButton.show();
        } else {
            editConfigTextButton.hide();
        }
    },

    getActionType : function () {
        var field = this.find("name", "actionType")[0];
        return field.getValue();
    },

    getActionData : function () {
        return this.actionData;
    },

    deleteAction : function () {
        if (this.actionDeleteHandler) {
            this.actionDeleteHandler(this);
        }
    }
});
CQ.form.GuideActionField.LAYOUT_PROPERTY_PATH = "sling:resourceType";
CQ.Ext.reg('guideaction', CQ.form.GuideActionField);
