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

    ns.history.actions.fd.EditDialog = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.EditDialog, ns.history.actions.fd.DefaultAction);

    // implements Granite.author.history.Action#undo
    ns.history.actions.fd.EditDialog.prototype.undo = function (cfg) {
        var self = this,
            dialogParams = self.createParams,
            options,
            afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window;

        options = ns.history.actions.fd.EditDialog.mergeJson(dialogParams.oldDialogJson, dialogParams.newDialogJson);
        CQ.shared.HTTP.post(dialogParams.path, null, options);

        ns.DialogFrame.clearDialog();
        //@TODO Move this code to Utils
        if (dialogParams.path === afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")) {
            window.guidelib.author.editConfigListeners.REFRESH_FORM();
        } else {
            window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
        }

        self.onEditableReady(cfg);
    };

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.EditDialog.prototype.redo = function (cfg) {
        var self = this,
            dialogParams = self.createParams,
            options,
            afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window;

        options = ns.history.actions.fd.EditDialog.mergeJson(dialogParams.newDialogJson, dialogParams.oldDialogJson);
        CQ.shared.HTTP.post(dialogParams.path, null, options);

        ns.DialogFrame.clearDialog();
        if (dialogParams.path === afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")) {
            window.guidelib.author.editConfigListeners.REFRESH_FORM();
        } else {
            window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
        }

        self.onEditableReady(cfg);
    };

    ns.history.actions.fd.EditDialog.mergeJson = function (oldJson, newJson) {
        for (var key in newJson) {
            if (newJson.hasOwnProperty(key)) {
                if (_.isUndefined(oldJson[key])) {
                    oldJson[key + "@Delete"] = null;
                }
            }
        }
        return oldJson;
    };

    // register action
    ns.history.actions.Registry.register("EditDialog", ns.history.actions.fd.EditDialog);

}(jQuery, Granite.author, jQuery(document), this));
