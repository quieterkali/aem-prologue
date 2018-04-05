/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
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
 */
;(function ($, author, guidetouchlib, undefined) {

    var getID = function (path) {
           return path.substring(path.lastIndexOf('/') + 1, path.length);
       };
    /*
     * override
     * */

    var parseData = function (data) {
        if (this.isRefreshing) {
            var root = this.getRoot();
            if (root.path == data.path) {
                data.items = [data.rootPanel];
                data.rootPanel = null;
                return this.processJSONData(data, "");
            } else {
                var result = this.searchNode(data.path, "path", this.JSONdata),
                    baseId = result.id.substring(0, result.id.lastIndexOf(getID(data.path)));
                return this.processJSONData(data, baseId);
            }
        } else {
            data.items = [data.rootPanel];
            data.rootPanel = null;
            return this.processJSONData(data, "");
        }
    },
/*
 * override
 * */
 getChildren = function (node) {
            if (node.fragRef) {
                return null;
            } else {
                return GuideFormObjectsTreeDataModel.super_.getChildren.call(this, node);
            }
        },

        GuideFormObjectsTreeDataModel = guidetouchlib.editLayer.FormObjectsTreeDataModel = author.util.extendClass(author.ui.TreeDataModel, {
        parseData : parseData,
        getChildren : getChildren
    });

    GuideFormObjectsTreeDataModel.prototype.processJSONData = function (jsonModel, baseid) {
        if (!jsonModel) {
            return null;
        }
        var node = {};

        node.id = baseid + getID(jsonModel.path);

        if (jsonModel.path) {
            node.path = jsonModel.path;
        }

        node.type = jsonModel.type ? jsonModel.type : jsonModel.guideNodeClass ? jsonModel.guideNodeClass : '';

        node.name = jsonModel.name;

        node.label = jsonModel.displayName == null ? node.name : jsonModel.displayName;

        node.type = node.type.split("|")[0].trim(); // we show the first type in the Tree

        if (jsonModel.fragRef) {
            node.fragRef = jsonModel.fragRef;
            /* Custom mapping to map it to a custom icon for fragment*/
            node.type = "fd/af/components/panelAsFragment";
        }

        if (jsonModel.items && !guidetouchlib.utils._isCompositeFormObject(jsonModel.type)) { // Container element
            var items = jsonModel.items;
            var i;
            node.items = [];
            if (items instanceof Array) {
                for (i = 0; i < items.length; i++) {
                    //push item only when its defined
                    if (items[i]) {
                        node.items.push(this.processJSONData(items[i], node.id + "."));
                    }
                }
            } else if (items instanceof Object) {
                for (i in items) {
                    if (items[i].type) {
                        node.items.push(this.processJSONData(items[i], node.id + "."));
                    }
                }
            }
        }
        if (jsonModel.toolbar) {
            node.items.push(this.processJSONData(jsonModel.toolbar, node.id + "."));
        }

        return node;
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
