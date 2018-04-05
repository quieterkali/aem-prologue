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

;(function ($, author, guidetouchlib, window, undefined) {

    var guideBindRefConstants = guidetouchlib.components.bindRef.constants,
        guideTouchLibDataObjectsTree = guidetouchlib.dataObjectsTree,
        GuideBindRefDataObjects = guidetouchlib.components.bindRef.bindRefDataObjects = {};

    GuideBindRefDataObjects.initializeBindRefDataObjectsTree = function () {

        if (typeof guideTouchLibDataObjectsTree.guideModelLoadUrl != 'undefined') {

            var dataModel = new guideTouchLibDataObjectsTree.DataObjectsTreeDataModel({
                dataSourceURL : guideTouchLibDataObjectsTree.guideModelLoadUrl
            });
            GuideBindRefDataObjects.dataModel = dataModel;
            var renderer = new guidetouchlib.components.bindRef.BindRefDataObjectsTreeRenderer({
                treeContainerId : guideBindRefConstants.SIDE_PANEL_BINDREF_TREE_CONTAINER_ID
            });
            GuideBindRefDataObjects.bindRefDataObjectsTreeComponent = new author.ui.TreeComponent({
                dataModel : dataModel,
                renderer : renderer
            });
            GuideBindRefDataObjects.bindRefDataObjectsTreeComponent.setup();

            $("#" + guideBindRefConstants.SIDE_PANEL_BINDREF_TREE_CONTAINER_ID).off("treeReadyEvent");
            $("#" + guideBindRefConstants.SIDE_PANEL_BINDREF_TREE_CONTAINER_ID).on("treeReadyEvent", setFocusBasedOnBindRef);
        } else {
            $("#" + guideBindRefConstants.SIDE_PANEL_BINDREF_TREE_CONTAINER_ID).empty();
            $("#" + guideBindRefConstants.SIDE_PANEL_BINDREF_TREE_CONTAINER_ID).append("<div class = 'empty-message'>" +
            Granite.I18n.getMessage("There is no data model related to this form.") + "</div>");
        }
    };

    GuideBindRefDataObjects.teardownBindRefDataObjectsTree = function () {
        if (GuideBindRefDataObjects.bindRefDataObjectsTreeComponent) {
            GuideBindRefDataObjects.bindRefDataObjectsTreeComponent.teardown();
        }
    };

    var setFocusBasedOnBindRef = function (renderer) {

        var bindRefValue = $('.bindRefSelector').find('.bindRefTextField').adaptTo("foundation-field").getValue();

        if (typeof bindRefValue != 'undefined') {
            GuideBindRefDataObjects.bindRefDataObjectsTreeComponent.renderer.setFocusOnItem(bindRefValue);
            GuideBindRefDataObjects.bindRefDataObjectsTreeComponent.renderer.markNodeSelected(bindRefValue);
            guidetouchlib.components.bindRef.bindRefDataObjects.selectedItemBindRef = bindRefValue;
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
