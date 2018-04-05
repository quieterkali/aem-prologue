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

    ns.history.actions.fd.TableAction = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.TableAction, ns.history.actions.fd.DefaultAction);

    /** Implements Granite.author.history.Action#undo
     * States is the state of the Cell prior to Splitting.
     * Paths are the paths of all the cells after Splitting.
     * @param cfg
     */
    ns.history.actions.fd.TableAction.prototype.undo = function (cfg) {
        var self = this,
            params = {};
        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
        var isDeleted = CQ.shared.HTTP.post(self.path, null, params);
        if (CQ.shared.HTTP.isOk(isDeleted)) {
            params = _.extend({}, {
                ":operation" : "import",
                ":contentType" : "json",
                ":replace" : true,
                ":content" : JSON.stringify(self.createParams.oldState),
                ":replaceProperties" : true
            });
            CQ.shared.HTTP.post(self.path, null, params);
            var editableParentPath = self.path.substring(0, self.path.lastIndexOf("/"));
            window.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editableParentPath);
        }

        self.onEditableReady(cfg);
    };

    /** Implements Granite.author.history.Action#redo
     * States is the state of the Cell prior to Splitting.
     * Paths are the paths of all the cells after Splitting.
     * @param cfg
     */
    ns.history.actions.fd.TableAction.prototype.redo = function (cfg) {
        var self = this,
            params = {};
        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
        var isDeleted = CQ.shared.HTTP.post(self.path, null, params);
        if (CQ.shared.HTTP.isOk(isDeleted)) {
            params = _.extend({}, {
                ":operation" : "import",
                ":contentType" : "json",
                ":replace" : true,
                ":content" : JSON.stringify(self.createParams.newState),
                ":replaceProperties" : true
            });
            CQ.shared.HTTP.post(self.path, null, params);
            var editableParentPath = self.path.substring(0, self.path.lastIndexOf("/"));
            window.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editableParentPath);
        }

        self.onEditableReady(cfg);
    };

    // register action
    ns.history.actions.Registry.register("TableAction", ns.history.actions.fd.TableAction);

}(jQuery, Granite.author, jQuery(document), this));
