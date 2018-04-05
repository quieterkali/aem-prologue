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

    ns.history.actions.fd.MergeTableCell = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.MergeTableCell, ns.history.actions.fd.DefaultAction);

    /** Implements Granite.author.history.Action#undo
     * States is the state of the Cell prior to Merging.
     * Paths are the paths of all the cells before Merging.
     * @param cfg
     */
    ns.history.actions.fd.MergeTableCell.prototype.undo = function (cfg) {
        var self = this,
            cellName;

        _.each(self.createParams.states, function (item, index) {
            var item = $.extend(true, {}, item);
            if (index == 0) {
                //If colspan isn't present then adding explicitly in MergeTableCell.
                item["colspan"] = item["colspan"] || 1;
            } else {
                cellName = cellName.substring(cellName.lastIndexOf('/') + 1);
                item[Granite.Sling.ORDER] = window.guidelib.author.AuthorUtils.INSERT_AFTER + " " + cellName;
            }
            cellName = self.createParams.paths[index];
            CQ.shared.HTTP.post(cellName, null, item);
        });
        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();

        self.onEditableReady(cfg);
    };

    /** Implements Granite.author.history.Action#redo
     * States is the state of the Cell prior to Merging.
     * Paths are the paths of all the cells before Merging.
     * @param cfg
     */
    ns.history.actions.fd.MergeTableCell.prototype.redo = function (cfg) {
        var self = this,
            params = {},
            colspan = 0,
            firstTableCell = $.extend(true, {}, self.createParams.states[0]);
        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;

        _.each(self.createParams.states, function (item, index) {
            colspan += (parseInt(item["colspan"]) || 1);
            if (index != 0) {
                CQ.shared.HTTP.post(self.createParams.paths[index], null, params);
            }
        });
        firstTableCell["colspan"] = colspan;
        CQ.shared.HTTP.post(self.createParams.paths[0], null, firstTableCell);

        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();

        self.onEditableReady(cfg);
    };

    // register action
    ns.history.actions.Registry.register("MergeTableCell", ns.history.actions.fd.MergeTableCell);

}(jQuery, Granite.author, jQuery(document), this));
