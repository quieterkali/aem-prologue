// jscs:disable requireDotNotation
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
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
;(function ($, ns, channel, window, undefined) {
    "use strict";

    ns.history.actions.fd.SplitTableCell = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.SplitTableCell, ns.history.actions.fd.DefaultAction);

    /** Implements Granite.author.history.Action#undo
     * States is the state of the Cell prior to Splitting.
     * Paths are the paths of all the cells after Splitting.
     * @param cfg
     */
    ns.history.actions.fd.SplitTableCell.prototype.undo = function (cfg) {
        var self = this,
            params = {};

        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
        _.each(self.createParams.paths, function (item, index) {
            if (index == 0) {
                CQ.shared.HTTP.post(item, null, self.createParams.states[index]);
            } else {
                CQ.shared.HTTP.post(item, null, params);
            }
        });
        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();

        self.onEditableReady(cfg);
    };

    /** Implements Granite.author.history.Action#redo
     * States is the state of the Cell prior to Splitting.
     * Paths are the paths of all the cells after Splitting.
     * @param cfg
     */
    ns.history.actions.fd.SplitTableCell.prototype.redo = function (cfg) {
        var self = this,
            authorUtils = window.guidelib.author.AuthorUtils,
            params = {},
            positionParam = {},
            afterCellName;

        //Params needed for new cell
        params[":content"] = JSON.stringify(authorUtils.GuideTableEdit.ROW_ITEM_TEMPLATE);
        // Now extend the params object to create a new object
        params = _.extend(params, {
            ":operation" : "import",
            ":contentType" : "json",
            ":replace" : true,
            ":replaceProperties" : true
        });
        _.each(self.createParams.paths, function (item, index) {
            if (index == 0) {
                var itemState = $.extend(true, {}, self.createParams.states[index]);
                itemState["colspan"] = itemState["colspan"] - 1;
                CQ.shared.HTTP.post(item, null, itemState);
            } else {
                afterCellName = afterCellName.substring(afterCellName.lastIndexOf('/') + 1);
                var response = CQ.shared.HTTP.post(item, null, params);
                if (CQ.shared.HTTP.isOk(response)) {
                    positionParam[Granite.Sling.ORDER] = authorUtils.INSERT_AFTER + " " + afterCellName;
                    CQ.shared.HTTP.post(item, null, positionParam);
                }
            }
            afterCellName = item;
        });
        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();

        self.onEditableReady(cfg);
    };

    // register action
    ns.history.actions.Registry.register("SplitTableCell", ns.history.actions.fd.SplitTableCell);

}(jQuery, Granite.author, jQuery(document), this));
