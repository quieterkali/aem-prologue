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

    ns.history.actions.fd.InsertChildPanel = function (path, componentType, insertPath, createParams) {

        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }

        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, insertPath, componentType, createParams);

    };

    ns.util.inherits(ns.history.actions.fd.InsertChildPanel, ns.history.actions.fd.DefaultAction);

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.InsertChildPanel.prototype.redo = function (cfg) {
        var self = this,
          editableNeighbors = ns.editables.find(this.insertPath),
          editableNeighbor = null,
          insertBehavior = ns.persistence.PARAGRAPH_ORDER.before,
          components = ns.components.find({"resourceType" : this.componentType}),
          component = null;

        if (editableNeighbors.length !== 0) {
            editableNeighbor = editableNeighbors[0];
        }
        if (components.length !== 0) {
            component = components[0];

            // Add create parameters as extra parameters
            if (component.componentConfig && component.componentConfig.config) {
                component.setExtraParams(self.createParams);
            }
        }

        if (!editableNeighbor && !component) {
          // TODO - error handling
        } else {
            //insert the panel..
            var AuthorUtils = guidelib.author.AuthorUtils;
            AuthorUtils._sendData(self.createParams, self.insertPath);
            self.onEditableReady(cfg);
        }
    };

    // implements Granite.author.history.Action#addToSelection
    ns.history.actions.fd.InsertChildPanel.prototype.addToSelection = function (selection, isUndo) {
        try {
            if (!isUndo) {
                selection.push(this.getEditable());
            }
        } catch (e) {
            // ignore
        }
    };

    // register action
    ns.history.actions.Registry.register("InsertChildPanel", ns.history.actions.fd.InsertChildPanel);

}(jQuery, Granite.author, jQuery(document), this));
