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


(function (expeditor, $) {
    var identity = function (data) {
        return data;
    };
    var defaults = {
        propSelector : function (jsonModel) {
                var result = {};
                for (var prop in jsonModel) {
                    if (jsonModel.hasOwnProperty(prop) && prop !== "items") {
                        result[prop] = jsonModel[prop];
                    }
                }
                return result;
            }
    };
    var TreeModel = expeditor.model.TreeModel = expeditor.EventTarget.extend({

        init : function (options) {
            this.options = $.extend({}, defaults, options);
            this.root = {};
            this.flatModel = {};
            if (this.options.url == null && this.options.json == null) {
                throw "No JSON provided to render the Tree";
            }
            this._isLoaded = this.options.url == null;
            this.options.transform = typeof this.options.transform == "function" ? this.options.transform : identity;
        },
        _parseJSON : function (jsonModel) {
            var treeProcessor = new expeditor.TreeProcessor(jsonModel,this.options.propSelector);
            this.root = treeProcessor.getRoot();
            this.flatModel = treeProcessor.getFlatModel();
        },
        load : function (options) {
            var _options = options || {},
                success = typeof _options.success === "function" ? _options.success : null,
                error = typeof _options.error === "function" ? _options.error : null,
                context = _options.context || window;
            if (this._isLoaded === true) {
                this._parseJSON(this.options.json);

                if (success !== null) {
                    success.apply(context, [this.root]);
                }
            } else {
                var that = this;
                $.ajax({
                    url : this.options.url
                }).success(function (data) {
                    that.options.json = that.options.transform(data);
                    this._parseJSON(that.options.json);
                    that._isLoaded = true;
                    if (success !== null) {
                        success.apply(context, [that.root]);
                    }
                }).error(function () {
                    if (error !== null) {
                        error.apply(context, arguments);
                    }
                });
            }
        },

        getFlatModel : function () {
            return this.flatModel;
        },

        searchElements : function (searchKey, element) {
            if (!(searchKey instanceof Array)) {
                searchKey = [searchKey];
            }
            var matchedElements = [],
                self = this;
            element = element.toLowerCase();
            for (var id in this.flatModel) {
                if (this.flatModel.hasOwnProperty(id)) {
                    var isMatched = false;
                    searchKey.forEach(function (key) {
                        var prop = self.flatModel[id][key];
                        if (prop && typeof prop === "string") {
                            prop = prop.split("|")[0];
                            prop = prop.toLowerCase();
                            if (prop.indexOf(element) > -1) {
                                isMatched = true;
                            }
                        }
                    });
                    if (isMatched) {
                        matchedElements.push(id);
                    }
                }
            }
            return matchedElements;
        }
    });
})(expeditor, jQuery);

(function (expeditor, $) {

    var TreeListModel = expeditor.model.TreeListModel = expeditor.model.TreeModel.extend({
        _parseJSON : function (jsonModel, displayPath, isParentCollection) {
            if (!jsonModel) {
                return null;
            }
            if (!(jsonModel instanceof Array)) {
                jsonModel = [jsonModel];
            }
            var nodes = {items : []};
            jsonModel.forEach(function (fnModel) {
                var node = this.options.propSelector(fnModel);
                var type = fnModel.type ? fnModel.type.toUpperCase() : '';
                node.type = type.trim();
                nodes.items.push(node);
                this.flatModel[node.id] = node;
            }, this);
            this.root = nodes;
            return nodes;
        }
    });
})(expeditor, jQuery);

