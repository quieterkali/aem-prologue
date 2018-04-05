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

    ns.history.actions.fd.EmbedFragment = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.EmbedFragment, ns.history.actions.fd.DefaultAction);

    // implements Granite.author.history.Action#undo
    ns.history.actions.fd.EmbedFragment.prototype.undo = function (cfg) {
        var self = this,
            fragRef = self.createParams.fragRef;
        fragRef = fragRef.substring(0, fragRef.indexOf("/jcr:content"));

        guidelib.author.AuthorUtils.deletePanelAndAddFragRef(self.path, fragRef);
        self.onEditableReady(cfg);
    };

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.EmbedFragment.prototype.redo = function (cfg) {
        var self = this;

        window.guidelib.author.editConfigListeners.embedFragmentHandler(self.createParams.fragRef, self.path, self.createParams.bindRef);
        self.onEditableReady(cfg);
    };

    // register action
    ns.history.actions.Registry.register("EmbedFragment", ns.history.actions.fd.EmbedFragment);

}(jQuery, Granite.author, jQuery(document), this));
