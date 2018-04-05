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

    Granite.author.history.actions.fd = Granite.author.history.actions.fd || {};
    /**
     * Granite.author.history.actions.fd.DefaultAction
     * @extends Granite.author.history.actions.AbstractParagraphAction
     * @private
     * This {@link Granite.author.history.Action} represents the inserting of a child panel.
     * @constructor
     * Creates a new AbstractAction action.
     * @param {String} path The path of the paragraph that was inserted
     * @param {String} insertPath The path of the editable (parent panel) that was used for inserting
     * @param {String} componentType The component type
     * @param {Object} createParams The parameters that were used to insert the paragraph
     */
    ns.history.actions.fd.DefaultAction = function (path, componentType, insertPath, createParams) {

        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }

        // Call super constructor
        ns.history.actions.AbstractParagraphAction.call(this, path, componentType);

        /**
         * The path of the editable that is used for inserting the paragraph again (on redo)
         * @private
         * @type String
         */
        this.insertPath = insertPath;

        /**
         * The path of the editable that is used for inserting the paragraph again (on redo)
         * @private
         * @type String
         */
        this.componentType = componentType;

        /**
         * Flag that determines if the editable at the insert path is currently deleted
         * @private
         * @type Boolean
         */
        this.isInsertPathDeleted = false;

        /**
         * The parameters that were used to insert the paragraph
         * @type Object
         * @private
         */
        this.createParams = (createParams) ? createParams : {};

        /**
         * Flag that determines if the editable that was copied (if copied) has since been deleted
         */
        this.isCopyFromPathDeleted = false;
    };

    ns.util.inherits(ns.history.actions.fd.DefaultAction, ns.history.actions.AbstractParagraphAction);

    // overrides Granite.author.history.actions.AbstractAction#initializePathRewriting
    ns.history.actions.fd.DefaultAction.prototype.initializePathRewriting = function () {
        channel.on('cq-history-paragraph-id-changed', this.onParagraphIdChanged.bind(this));
    };

    /**
     * @private
     */
    ns.history.actions.fd.DefaultAction.prototype.onParagraphIdChanged = function (event, data) {
        if (data) {
            if (this.path == data.oldPath) { // id change affects action's path
                if (data.deleted) {
                    this.isPathDeleted = true;
                } else if (this.isPathDeleted || data.moved) {
                    this.path = data.newPath;
                    this.isPathDeleted = false;
                }
            }
            if (this.createParams["./@CopyFrom"] == data.oldPath) {
                if (data.deleted) {
                    this.isCopyFromPathDeleted = true;
                } else if (this.isCopyFromPathDeleted || data.moved) {
                    this.createParams["./@CopyFrom"] = data.newPath;
                    this.isCopyFromPathDeleted = false;
                }
            }
            if (this.insertPath == data.oldPath) { // id change affects action's insert path
                if (data.deleted) {
                    this.isInsertPathDeleted = true;
                } else if (this.isInsertPathDeleted || data.moved) {
                    this.insertPath = data.newPath;
                    this.isInsertPathDeleted = false;
                }
            }
        }
    };

    /**
     * @private
     */
    ns.history.actions.fd.DefaultAction.prototype.onEditableReady = function (cfg) {
        var self = this;
        cfg.step.notifyActionCompleted(this, true);
    };

    // implements Granite.author.history.Action#undo
    ns.history.actions.fd.DefaultAction.prototype.undo = function (cfg) {
        var self = this,
            editable = self.getEditable(),
            editableToolbarShowing = (editable === ns.selection.getCurrentActive());

        if (editableToolbarShowing) {
            ns.selection.deselectAll();
            ns.selection.deactivateCurrent();
            ns.EditorFrame.editableToolbar.close();
        }

        ns.editableHelper.doDelete([editable], {"preventAddHistory" : true}).done(function () {
            var mappedId = {
                "oldPath" : self.path,
                "newPath" : null,
                "deleted" : true
            };

            channel.trigger('cq-history-paragraph-id-changed', mappedId);
            cfg.step.executeConfig.idMap[self.path] = mappedId;
            cfg.step.notifyActionCompleted(self, true);
        });
        ns.editableHelper.cleanUp();
    };

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.DefaultAction.prototype.redo = function (cfg) {
        //Needs to be implemented by the individual action.
        if (console) {
            console.log("Default Action does not provide a redo implementation. Extend and provide an implementation.");
        }
    };

    // implements Granite.author.history.Action#addToSelection
    ns.history.actions.fd.DefaultAction.prototype.addToSelection = function (selection, isUndo) {
        try {
            if (!isUndo) {
                selection.push(this.getEditable());
            }
        } catch (e) {
            // ignore
        }
    };

    // implements Granite.author.history.actions.AbstractAction#serializeSpecifc
    ns.history.actions.fd.DefaultAction.prototype.serializeSpecific = function () {
        return {
            "ip" : this.insertPath,
            "iipd" : this.isInsertPathDeleted,
            "cp" : this.createParams,
            "icfpd" : this.isCopyFromPathDeleted
        };
    };

    // implements Granite.author.history.actions.AbstractAction#deserializeSpecifc
    ns.history.actions.fd.DefaultAction.prototype.deserializeSpecific = function (obj) {
        this.insertPath = obj.ip;
        this.isInsertPathDeleted = obj.iipd;
        this.createParams = obj.cp;
        this.isCopyFromPathDeleted = obj.icfpd;
    };

    // register action
    ns.history.actions.Registry.register("DefaultFDAction", ns.history.actions.fd.DefaultAction);

}(jQuery, Granite.author, jQuery(document), this));
