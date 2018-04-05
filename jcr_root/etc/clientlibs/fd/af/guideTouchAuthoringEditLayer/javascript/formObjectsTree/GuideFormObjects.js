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

(function ($, author, guidetouchlib, undefined) {

    var guideEditLayerConstants = guidetouchlib.editLayer.constants,
    GuideEditLayerFormObjects = guidetouchlib.editLayer.editLayerFormObjects = function () {
    };

    GuideEditLayerFormObjects.initializeFormObjectsTree = function () {
    var doc = window._afAuthorHook._getAfWindow().document;
    this.guidePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
    this.sourceURL = this.guidePath + ".treejson" + "?path=" + this.guidePath; //Provide path to get whole JSON of AF

    var dataModel = new guidetouchlib.editLayer.FormObjectsTreeDataModel({
        dataSourceURL : this.sourceURL
    });
    var renderer  = new guidetouchlib.editLayer.FormObjectsTreeRenderer(
        {
            treeContainerId : guideEditLayerConstants.GUIDE_SIDE_PANEL_FORMOBJECTS_CONTAINER_ID
        });
    GuideEditLayerFormObjects.editLayerFormObjectsTreeComponent = new author.ui.TreeComponent({
        dataModel : dataModel,
        renderer : renderer
    });
    GuideEditLayerFormObjects.editLayerFormObjectsTreeComponent.setup();

};

    GuideEditLayerFormObjects.teardownFormObjectsTree = function () {
        GuideEditLayerFormObjects.editLayerFormObjectsTreeComponent.teardown();
    };
    /**
     * Returns if the form hierarchy has been initialized
     * @returns {boolean}
     */
    GuideEditLayerFormObjects.isInitialized = function () {
        // note: we have tightly used this in places without actual initialization of editLayerFormObjectsTreeComponent object
        // for example: we initialise this on setUp of edit layer but we use it in dialog
        // now for example, there is no edit layer but dialog can be used independently, hence this would be break.
        // Ideally, operations related to editable should be delegated via the edit layer and not directly
        return this.editLayerFormObjectsTreeComponent != null;
    };

    GuideEditLayerFormObjects.refreshFormObjectsTree = function (node) {
        if (_.isUndefined(node)) {
            node = this.guidePath; // Refresh the complete tree
        }
        /* Refresh the Parent node if this node not found in the tree, helps in case of layout nodes being refreshed*/
        if (!this.editLayerFormObjectsTreeComponent.dataModel.searchNode(node, "path", this.editLayerFormObjectsTreeComponent.dataModel.JSONdata)) {
            node = node.substr(0, node.lastIndexOf("/"));
        }
        var sourceURL = this.guidePath + ".treejson" + "?path=" + node;
        this.editLayerFormObjectsTreeComponent.refreshNodeFromURL(node, "path", sourceURL);
    };

    GuideEditLayerFormObjects.updateSelectionOnEditableClick = function (editable) {
        var editables = author.selection.getAllSelected();
        this.editLayerFormObjectsTreeComponent.renderer.deselectAllItems();

        for (var i = 0; i < editables.length; i++) {
            this.editLayerFormObjectsTreeComponent.renderer.markNodeSelected(editables[i].path, "path");
        }
        if (this.editLayerFormObjectsTreeComponent.renderer.selectionFromTree) {
            this.editLayerFormObjectsTreeComponent.renderer.selectionFromTree = false;
        } else {
            this.editLayerFormObjectsTreeComponent.renderer.setFocusOnItem(editable.path, "path");
        }

    };

    GuideEditLayerFormObjects.setDropTarget = function (item, cssClass) {
        this.editLayerFormObjectsTreeComponent.renderer.setDropTarget(item, cssClass);
    };

    GuideEditLayerFormObjects.resetDropTarget = function () {
        this.editLayerFormObjectsTreeComponent.renderer.resetDropTarget();
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
