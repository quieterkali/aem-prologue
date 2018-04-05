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

    ns.history.actions.fd.TableMoveRowDown = function (path, insertPath, componentType, createParams) {
        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }
        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);
    };

    ns.util.inherits(ns.history.actions.fd.TableMoveRowDown, ns.history.actions.fd.DefaultAction);

    /** Implements Granite.author.history.Action#undo
     * Move the specified row down.
     * @param cfg
     */
    ns.history.actions.fd.TableMoveRowDown.prototype.undo = function (cfg) {
        var self = this,
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit,
            editable = window.guidelib.author.editConfigListeners._getEditable(self.path);
        GuideTableEdit.moveRowUpHandler(editable);
        window.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(self.path);

        self.onEditableReady(cfg);
    };

    /** Implements Granite.author.history.Action#redo
     * Move the specified row up.
     * @param cfg
     */
    ns.history.actions.fd.TableMoveRowDown.prototype.redo = function (cfg) {
        var self = this,
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit,
            editable = window.guidelib.author.editConfigListeners._getEditable(self.path);
        GuideTableEdit.moveRowDownHandler(editable);
        window.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(self.path);

        self.onEditableReady(cfg);
    };

    // register action
    ns.history.actions.Registry.register("TableMoveRowDown", ns.history.actions.fd.TableMoveRowDown);

}(jQuery, Granite.author, jQuery(document), this));
