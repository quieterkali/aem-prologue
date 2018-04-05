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

;(function ($, author, channel, window, undefined) {
    /*
    * An optional dataSourceURL to be used to fetch the data from
    * */
    var AuthorTreeDataModel = author.ui.TreeDataModel = function (options) {
        if (options.dataSourceURL) {
            this.dataSourceURL = options.dataSourceURL;
        }
        if (options.JSONdata) {
            this.JSONdata = options.JSONdata;
        }
    };
    /*
    * successhandler: Callback is called once the data is ready. Will also be called when the data is refreshed
    * errorHandler: Callback is called if it fails to load the data
    * componentContext: A pointer to the tree Component object, to be used to call the callbacks
    * */
    AuthorTreeDataModel.prototype.setup = function (options) {
        this.errorHandler = options.errorHandler;
        this.successHandler = options.successHandler;
        this.componentContext = options.context;
        if (this.dataSourceURL) {
            this.getDataFromURL(this.dataSourceURL);
        } else if (this.JSONdata) {
            this.JSONdata = this.parseData(this.JSONdata);
            this.successHandler.apply(this.componentContext, [this.JSONdata]);
        }
    };

    AuthorTreeDataModel.prototype.teardown = function () {
        if (this.JSONdata) {
            this.dataSourceURL = null;
            this.JSONdata = null;
            this.dataReady = false;
        }
    };

    /* Every DataModel object should have this function. It will be used by the tree component to get the data*/
    AuthorTreeDataModel.prototype.getRoot = function () {
        if (this.JSONdata) {
            return this.JSONdata;
        } else {
            return author.editables.getRoot();
        }
    };

    /* Every DataModel object should have this function. It will be used by the tree component to get the data*/
    AuthorTreeDataModel.prototype.getChildren = function (node) {
        if (this.JSONdata) {
            var items = node.items;
            if (items instanceof Array) {
                return node.items;
            } else {
                var children = [];
                for (i in items) {
                    if (items.hasOwnProperty(i)) {
                        children.push(items[i]);
                    }
                }
                return children;
            }
        } else {
            return author.editables.getChildren(node);  // Getting inspectable's children
        }
    };

    /*To fetch the data from a URL*/
    AuthorTreeDataModel.prototype.getDataFromURL = function (dataSourceURL) {
        if (dataSourceURL) {
            var that = this;
            $.ajax({
                url : Granite.HTTP.externalize(dataSourceURL),
                type : "GET"
            }).success(function (data) {
                var value = [];
                data = that.parseData(data);
                value.push(data);
                if (that.isRefreshing) {
                    var result = that.refreshNodeWithData(that.nodeToBeRefreshed, that.getRoot(), data);
                    if (result) {
                        that.JSONdata = data; // Root node is being refreshed
                    }
                    that.isRefreshing = false;
                } else {
                    that.JSONdata = data;
                }
                that.successHandler.apply(that.componentContext, value);
            }).error(function (error) {
                if (error !== null) {
                    that.errorHandler.apply(that.componentContext);
                }
            });
        }
    };

    /* To update the tree Node with a new URL*/
    AuthorTreeDataModel.prototype.refreshNodeFromURL = function (node, refreshKey, dataSourceURL) {
        this.isRefreshing = true;
        this.refreshKey = refreshKey;
        this.nodeToBeRefreshed = node;
        this.getDataFromURL(dataSourceURL);
    };

    /*This function search the node in the oldData and replace the subtree with the newData*/
    AuthorTreeDataModel.prototype.refreshNodeWithData = function (node, olddata, newdata) {
        if (node == olddata[this.refreshKey]) {
            return true;
        }
        var childNodes = this.getChildren(olddata);
        if (childNodes && childNodes.length) {
            for (var i = 0; i < childNodes.length; i++) {
                if (this.refreshNodeWithData(node, childNodes[i], newdata)) {
                    childNodes[i] = newdata;
                }
            }
        }
        return false;
    };

    /*This function is called after the data is fetched from URL. This function can be override for any manipulation on the data fetched from URL*/
    AuthorTreeDataModel.prototype.parseData = function (data) {
        // Parse the data once it is loaded. This function can be override to do any manipulations on the data
        return data;
    };

    /* This function return the node (subtree) once the node is found in the tree*/
    AuthorTreeDataModel.prototype.searchNode = function (node, key, data) {
        if (node == data[key]) {
            return data;
        } else {
            var childNodes = this.getChildren(data);
            if (childNodes && childNodes.length) {
                for (var i = 0; i < childNodes.length; i++) {
                    var result;
                    if (result = this.searchNode(node, key, childNodes[i])) {
                        return result;
                    }
                }
            }
        }
        return null;
    };

}(jQuery, Granite.author, jQuery(document), this));
