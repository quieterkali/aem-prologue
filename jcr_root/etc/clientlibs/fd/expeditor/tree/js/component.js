/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/


(function (expeditor) {

    var defaults = {
        objectPanel : '#formObjectsPanel',
        objectTree : '#formObjectsTree',
        searchPanel : '#formObjectsSearchPanel',
        searchKey : ["displayName", "type", "name"]
    };

    var TreeComponent = expeditor.component.TreeComponent = expeditor.EventTarget.extend({

        init : function (treeConfig, expressionEditor) {
            var _options = $.extend({}, defaults, treeConfig);
            if (typeof _options.getObjectIcon === 'function') {
                this.getObjectIcon = _options.getObjectIcon;
            }
            if (typeof _options.skipChildren === 'function') {
                this.skipChildren = _options.skipChildren;
            } else {
                this.skipChildren = function (node) { return false; };
            }
            this.expressionEditor = expressionEditor;
            this.model = this._createModel(_options);
            this.view = this._createView(_options);
            this.view.bind('search', this.search, this);
        },

        setConfig : function (options) {
            this.view.setConfig(options);
        },

        _createModel : function (options) {
            return new expeditor.model.TreeModel({
                url : options.url,
                json : options.json,
                transformer : options.transformer
            });
        },

        setModelJson : function (options) {
            this.model = this._createModel(options);
            this.rendered = false;
        },

        _createView : function (options) {
            return new expeditor.view.TreeView(options, this.expressionEditor);
        },

        _renderTreeNode : function (node, parent, isParentCollection) {
            if (node) {
                isParentCollection = (isParentCollection === true);
                
                if (!isParentCollection) {
                    var icon;
                    if (this.getObjectIcon) {
                        icon = this.getObjectIcon(node);
                    }
                    var nodeObj = {
                        id : node.id,
                        name : node.name,
                        displayName : node.displayName,
                        type : node.type,
                        path : node.path,
                        status : node.status,
                        icon : icon
                    };
                    parent = this.view.addNodeToTree(nodeObj, parent);
                }
                if (!this.skipChildren(node)) {
                    if (node.item) {
                        this._renderTreeNode(node.item, parent, true);
                    } else if (node.items) {
                        var length = node.items.length;
                        for (var i = 0; i < length; i++) {
                            this._renderTreeNode(node.items[i], parent);
                        }
                    }
                }
                if (node.toolbar) {
                    this._renderTreeNode(node.toolbar, parent);
                }
            }
        },

        render : function () {
            if (this.rendering || this.rendered == true) {
                return;
            }
            this.rendering = true;
            var that = this;
            that.view.render();
            this.model.load({
                success : function (root) {
                    this.view.empty();
                    this._renderTreeNode(root);
                    this.view.addListeners();
                    this.trigger("modelloaded", this.model);
                    this.rendering = false;
                    this.rendered = true;
                },
                error : function () {
                    alert("error loading data");
                    this.rendering = false;
                },
                context : this
            });
        },

        setModel : function (model) {
            this.model = model;
        },

        search : function (e, data) {
            if (data.searchBy) {
                var matchedItems = this.model.searchElements(data.searchBy, data.key);
                this.view.filterNodesById(matchedItems);
            }
        }
    });
})(expeditor);

(function (expeditor) {

    var TreeListComponent = expeditor.component.TreeListComponent = expeditor.component.TreeComponent.extend({

        init : function (treeConfig, expressionEditor) {
            this._super.apply(this, arguments);
            this.displayProps = treeConfig.displayProps || ["displayName", "type"];
        },

        _createModel : function (options) {
            return new expeditor.model.TreeListModel({
                url : options.url,
                json : options.json,
                transformer : options.transformer
            });
        },

        _createView : function (options) {
            return new expeditor.view.TreeListView(options, this.expressionEditor);
        },

        _renderTreeNode : function (node, parent, isParentCollection) {
            if (node.items) {
                var length = node.items.length;
                for (var i = 0; i < length; i++) {
                    parent = this.view.addNodeToTree(node.items[i], parent, this.displayProps);
                }
            }
        }
    });
})(expeditor);
