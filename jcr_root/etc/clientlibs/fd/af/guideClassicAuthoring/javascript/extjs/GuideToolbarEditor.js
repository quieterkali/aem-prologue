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

CQ.GuideToolbarEditor = CQ.Ext.extend(CQ.Dialog, {

    componentName : "",

    componentLabel : "",

    okHandler : function () {
        $CQ.ajax({
            type : "POST",
            url : this.toolbarPath,
            data : this._prepareData(this.getToolbarData()),
            async : false
        });
    },

    cancelHandler : function () {},

    constructor : function (config) {
        if (config.afterEditFn) {
            this.afterEditFn = config.afterEditFn;
        }
        if (!config.okHandler) {
            config.okHandler = this.okHandler;
        }
        if (!config.cancelHandler) {
            config.cancelHandler = this.cancelHandler;
        }
        this.toolbarPath = null;
        this.availableActions = CQ.HTTP.eval(CQ.HTTP.externalize("/libs/fd/af/components/info.json?type=action"));
        var configDefaults = {
            closable : true,
            closeAction : "close",
            width : 615,
            modal : true,
            "title" : CQ.I18n.getMessage("Toolbar"),

            "items" : {
                "title" : "dialog",
                "xtype" : "tabpanel",
                "items" : [
                    {
                        "title" : CQ.I18n.getMessage("Toolbar"),
                        "xtype" : "panel",
                        layout : "form",
                        "items" : [
                            {
                                "fieldLabel" : CQ.I18n.getMessage("Layout"),
                                name : "./layout/sling:resourceType",
                                options : CQ.HTTP.externalize("/libs/fd/af/components/info.json?type=layout&layoutType=fd/af/layouts/toolbar"),
                                selected : "fd/af/layouts/toolbar/defaultToolbarLayout",
                                xtype : "selection",
                                type : "select",
                                validateOnBlur : "true",
                                hideLabel : false,
                                grow : "false",
                                anchor : "80%",
                                itemId : "layoutType"
                            },
                            {
                                xtype : "textfield",
                                "fieldLabel" : CQ.I18n.getMessage("CSS class"),
                                name : "./css",
                                itemId : "css",
                                anchor : "80%"
                            },
                            {
                                xtype : "panel",
                                name : "actionsPanel",
                                border : true,
                                bodyBorder : false,
                                bodyStyle : "padding: 6px",
                                items : [
                                    {
                                        xtype : "toolbar",
                                        //cls: "cq-multifield-toolbar",
                                        items : [
                                            {
                                                xtype : "label",
                                                text : CQ.I18n.getMessage("Add Action Buttons"),
                                                style : "padding-left:6px; padding-right:20px; padding-top:5px;font-size:14"
                                            },
                                            "->",
                                            {
                                                xtype : "textbutton",
                                                text : CQ.I18n.getMessage("Add Action"),
                                                style : "padding-right:6px",
                                                scope : this,
                                                handler : function () {
                                                    this.addAction();
                                                }
                                            },
                                            {
                                                xtype : "button",
                                                iconCls : "guides-action-add",
                                                template : new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                                                scope : this,
                                                handler : function () {
                                                    this.addAction();
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "buttons" : [
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ],

            "listeners" : {
                loadcontent : function (guideToolbarEditor, records, path) {
                    guideToolbarEditor._loadContent(records);
                }
            }
        };
        CQ.Util.applyDefaults(config, configDefaults);
        CQ.GuideToolbarEditor.superclass.constructor.call(this, config);
        this.show();
    },

    addAction : function (actionData, index) {
        var that = this;
        var config = {
            actionData : actionData,
            availableActions : this.availableActions,
            actionDeleteHandler : function (action) {
                var actionsPanel = action.findParentByType("panel");
                actionsPanel.remove(action.getId());
            },

            actionReorderHandler : function (action, moveUp) {
                var actionsPanel = action.findParentByType("panel");
                var actionIndex = actionsPanel.items.indexOf(action);
                var actionData = action.actionData;
                if (moveUp && actionIndex > 0) {
                    actionsPanel.remove(action.getId());
                    that.addAction(actionData, actionIndex - 1);
                } else if (!moveUp && actionIndex < actionsPanel.items.getCount() - 1) {
                    actionsPanel.remove(action.getId());
                    that.addAction(actionData, actionIndex + 1);
                }
            }

        };
        var newField = new CQ.form.GuideActionField(config);

        var actionsPanel = this.find("name", "actionsPanel")[0];
        var insertionIndex = (index != undefined) ? index : actionsPanel.items.getCount();  // insert before add button
        actionsPanel.insert(insertionIndex, newField);
        this.doLayout();
    },

    /**
     * Compiles a javascript expression from the current rule condition-set.
     * @private
     */
    getToolbarData : function () {
        var toolbarData = this.initialToolbarData || {"jcr:primaryType" : "nt:unstructured", "name" : "toolbar", "sling:resourceType" : "libs/fd/af/components/toolbar"};
        var actionItems = {"jcr:primaryType" : "nt:unstructured"};
        var actionNameCount = {};
        var actionFields = this.find("name", "actionsPanel")[0].items;
        for (var i = 0; i < actionFields.getCount(); i++) {
            var actionField = actionFields.itemAt(i);
            if (actionField.getActionType == undefined) {
                continue;   // One of the "+ Add Action..." line elements.
            }
            var actionType = actionFields.itemAt(i).getActionType();
            if (actionType) {
                var actionData = actionFields.itemAt(i).getActionData();
                actionNameCount[actionData.name] = actionNameCount[actionData.name] || 0;
                if (actionNameCount[actionData.name] == 0) {
                    actionItems[actionData.name] = actionData;
                }else {
                    actionItems[actionData.name + "_" + actionNameCount[actionData.name]] = actionData;
                }
                ++actionNameCount[actionData.name];
            }
        }
        toolbarData.items = actionItems;
        toolbarData.css = this.find("itemId", "css")[0].getValue();
        toolbarData.layout = toolbarData.layout || {"jcr:primaryType" : "nt:unstructured"};
        toolbarData.layout[CQ.GuideToolbarEditor.LAYOUT_PROPERTY_PATH] = this.find("itemId", "layoutType")[0].getValue();
        return toolbarData;
    },

    _encodeData : function (dataJson, prefix) {
        var encodedData = {};
        _.each(dataJson, function (value, key) {
            if (_.isObject(value)) {
                var childMap = this._encodeData(value, prefix + "/" + key);
                _.extend(encodedData, childMap);
            } else {
                encodedData[prefix + "/" + key] = value;
            }
        }, this);
        return encodedData;
    },

    _prepareData : function (toolbarData) {
        var options = {
            ":content" : JSON.stringify(toolbarData),
            ":operation" : "import",
            ":contentType" : "json",
            ":replace" : true,
            ":replaceProperties" : true
        };
        return options;
    },

    loadContent : function (path) {
        if (typeof path == 'string' || path instanceof String) {
            this.toolbarPath = path;
        }
        CQ.GuideToolbarEditor.superclass.loadContent.call(this, path);
    },

    _loadContent : function (records) {
        this.initialToolbarData = records[0].data;
        var actions = {};
        if (this.initialToolbarData && this.initialToolbarData.items) {
            actions = this.initialToolbarData.items;
        }

        //
        _.each(actions, function (value, key) {
            if (_.isObject(value)) {
                this.addAction(value);
            }
        }, this);
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
                this.okHandler();
                this[this.closeAction]();
                if (this.afterEditFn) {
                    this.afterEditFn.call();
                }
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
CQ.GuideToolbarEditor.LAYOUT_PROPERTY_PATH = "sling:resourceType";
CQ.Ext.reg("guidetoolbareditor", CQ.GuideToolbarEditor);
