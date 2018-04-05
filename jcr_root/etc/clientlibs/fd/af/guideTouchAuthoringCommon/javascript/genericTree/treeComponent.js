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

    /**
     * Tree Component to be used in editor
     * @constructor
     * dataModel : A data Source Object which needs to provide the data to this component
     * renderer: An object which will render the tree element and define user interactions
     * searchKeys: An optional array of keys to be used for searching in the tree
     */
    var AuthorTreeComponent = author.ui.TreeComponent = function (options) {
        this.dataModel = options.dataModel;
        this.renderer = options.renderer;
        if (options.searchKeys) {
            this.searchKeys = options.searchKeys;
        } else {
            this.searchKeys = ["label"];
        }
    };

    AuthorTreeComponent.prototype.setup = function () {
        this.renderer.setup({
            searchHandler : this.searchHandler,
            context : this
        });

        this.dataModel.setup({
            successHandler : this.successHandler,
            errorHandler : this.errorHandler,
            context : this
        });
        this.pendingRequests = [];
    };

    AuthorTreeComponent.prototype.teardown = function () {
        this.dataModel.teardown();
        this.renderer.teardown();
        this.pendingRequests = [];
    };

    AuthorTreeComponent.prototype.renderChildNodes = function (node, parent) {

        var childNodes = this.dataModel.getChildren(node);
        if (childNodes && childNodes.length) {
            for (var i = 0; i < childNodes.length; i++) {
                var element = this.renderer.addNodeToTree(childNodes[i], parent);
                this.renderChildNodes(childNodes[i], element);
            }
        }
    };

    /* This function is to get all the nodes in the tree matching with the search string(value) */
    AuthorTreeComponent.prototype.searchTreeNode = function (node, value) {
        value = value.toLowerCase();
        var isMatched = false;
        this.searchKeys.forEach(function (key) {
            var prop = node[key];
            if (prop && typeof prop === "string") {
                prop = prop.toLowerCase();
                if (prop.indexOf(value) > -1) {
                    isMatched = true;
                }
            }
        });
        if (isMatched) {
            this.searchResults.push(node.id);
        }
        var childNodes = this.dataModel.getChildren(node);
        if (childNodes && childNodes.length) {
            for (var i = 0; i < childNodes.length; i++) {
                this.searchTreeNode(childNodes[i], value);
            }
        }
    };

    AuthorTreeComponent.prototype.handlePendingRequests = function (data) {
        if (!!this.pendingRequests.length) {
            var request = this.pendingRequests.shift();
            if (request.action === "Refresh") {
                this.refreshNodeFromURL(request.node, request.key, request.url);
            }
        }
    };

    AuthorTreeComponent.prototype.successHandler = function (data) {
        if (!this.isRefreshing) {
            var element = this.renderer.addNodeToTree(this.dataModel.getRoot());
            this.renderChildNodes(this.dataModel.getRoot(), element);
        } else { // Tree is being refreshed
            var element = this.renderer.getNodeDOMElement(this.nodeToBeRefreshed, this.refreshKey);
            this.renderer.refreshNodeHTML(data, element);
            this.renderer.deleteChildNodes(this.nodeToBeRefreshed, this.refreshKey);
            this.renderChildNodes(data, element);
            this.isRefreshing = false;
            this.handlePendingRequests();
        }

        this.renderer.dom.trigger("treeReadyEvent");
    };

    AuthorTreeComponent.prototype.errorHandler = function () {
        this.renderer.errorHandler();
    };

    AuthorTreeComponent.prototype.searchHandler = function (value) {
        this.searchResults = [];
        this.searchTreeNode(this.dataModel.getRoot(), value);
        return this.searchResults;
    };

    /* To update the tree node data with a given URL*/
    AuthorTreeComponent.prototype.refreshNodeFromURL = function (node, key, sourceURL) {
        if (!this.isRefreshing && sourceURL) {
            this.nodeToBeRefreshed = node;
            this.isRefreshing = true;
            this.refreshKey = key;
            this.renderer.resetSearchField();
            this.dataModel.refreshNodeFromURL(node, key, sourceURL);
        } else {// tree Is already being refreshed - Add the request in a queue to be processed later
            this.pendingRequests.push({
                action : "Refresh",
                node : node,
                key : key,
                url : sourceURL
            });
        }
    };

}(jQuery, Granite.author, jQuery(document), this));
