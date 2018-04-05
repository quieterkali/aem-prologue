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
;(function ($, ns, channel, window, undefined) {
    "use strict";

    ns.history.actions.fd.Replace = function (path, insertPath, componentType, createParams) {

        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }

        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, componentType, insertPath, createParams);

    };

    ns.util.inherits(ns.history.actions.fd.Replace, ns.history.actions.fd.DefaultAction);

    // implements Granite.author.history.Action#undo
    ns.history.actions.fd.Replace.prototype.undo = function (cfg) {
        var self = this,
            editable = self.getEditable(),
            editableToolbarShowing = (editable === ns.selection.getCurrentActive()),
            newComp = ns.components.find({"resourceType" : this.createParams.newComponent})[0],
            oldComp = ns.components.find({"resourceType" : this.createParams.oldComponent})[0];

        if (editableToolbarShowing) {
            ns.selection.deselectAll();
            ns.selection.deactivateCurrent();
            ns.EditorFrame.editableToolbar.close();
        }

        ns.persistence.replaceParagraph(oldComp, editable);
        cfg.step.notifyActionCompleted(self, true);
        ns.editableHelper.cleanUp();
    };

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.Replace.prototype.redo = function (cfg) {
        var self = this,
          insertBehavior = ns.persistence.PARAGRAPH_ORDER.before,
          components = ns.components.find({"resourceType" : this.componentType}),
          component = null,
          editable = self.getEditable(),
          newComp = ns.components.find({"resourceType" : this.createParams.newComponent})[0],
          oldComp = ns.components.find({"resourceType" : this.createParams.oldComponent})[0];

        if (components.length !== 0) {
            component = components[0];

            // Add create parameters as extra parameters
            if (component.componentConfig && component.componentConfig.config) {
                component.setExtraParams(self.createParams);
            }
        }

        if (!component) {
          // TODO - error handling
        } else {
            ns.persistence.replaceParagraph(newComp, editable);
            self.onEditableReady(cfg);
        }
    };

    // register action
    ns.history.actions.Registry.register("Replace", ns.history.actions.fd.Replace);

}(jQuery, Granite.author, jQuery(document), this));
