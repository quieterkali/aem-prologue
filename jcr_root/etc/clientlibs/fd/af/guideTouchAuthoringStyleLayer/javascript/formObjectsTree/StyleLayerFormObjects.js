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

(function ($, author, guidetouchlib, window, undefined) {

    var guideStyleLayerConstants = guidetouchlib.styleLayer.constants,
    GuideStyleLayerFormObjects = guidetouchlib.styleLayer.styleLayerFormObjects = {};

    GuideStyleLayerFormObjects.initializeStyleLayerObjectsTree = function () {
        var doc = window._afAuthorHook._getAfWindow().document;
        this.guidePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
        this.sourceURL = this.guidePath + ".treejson" + "?path=" + this.guidePath; //Provide path to get whole JSON of AF

        var dataModel = new guidetouchlib.styleLayer.FormObjectsTreeDataModel({
        dataSourceURL : this.sourceURL
    });
        var renderer  = new guidetouchlib.styleLayer.FormObjectsTreeRenderer({
            treeContainerId : guideStyleLayerConstants.GUIDE_STYLE_LAYER_OBJECTS_ID
        });
        GuideStyleLayerFormObjects.styleLayerFormObjectsTreeComponent = new author.ui.TreeComponent({
        dataModel : dataModel,
        renderer : renderer
    });
        GuideStyleLayerFormObjects.styleLayerFormObjectsTreeComponent.setup();

        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_OBJECTS_ID).on("treeReadyEvent", guidetouchlib.styleLayer.utils.bindFocusEvents);

        guidetouchlib.styleLayer.utils.showFormObjectsTree();
    };

    GuideStyleLayerFormObjects.teardownStyleLayerObjectsTree = function () {
        if (GuideStyleLayerFormObjects.styleLayerFormObjectsTreeComponent) {
            GuideStyleLayerFormObjects.styleLayerFormObjectsTreeComponent.teardown();
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
