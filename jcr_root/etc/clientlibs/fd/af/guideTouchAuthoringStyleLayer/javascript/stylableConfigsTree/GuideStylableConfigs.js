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
        GuideStylableConfigs = guidetouchlib.styleLayer.stylableConfigs = {};

    GuideStylableConfigs.initializeStylableConfigsTree = function (editable, component) {
        /* First remove the earlier tree Structure if it was already created */
        if (GuideStylableConfigs.stylableConfigsTreeComponent) {
            GuideStylableConfigs.stylableConfigsTreeComponent.teardown();
        }

        var JSONdata = guidetouchlib.style.vars.stylableConfigsJson[component];
        if (JSONdata) {

            var dataModel = new author.ui.TreeDataModel({
             JSONdata : JSONdata
         });
            var renderer  = new guidetouchlib.styleLayer.StylableConfigsTreeRenderer({
                treeContainerId : guideStyleLayerConstants.GUIDE_STYLABLE_CONFIG_ID,
                notAllCollapsable : true,
                notSearchable : true
            });
            GuideStylableConfigs.stylableConfigsTreeComponent = new author.ui.TreeComponent({
                dataModel : dataModel,
                renderer : renderer
            });
            $("#" + guideStyleLayerConstants.GUIDE_STYLABLE_CONFIG_ID).on("treeReadyEvent", guidetouchlib.styleLayer.utils.bindFocusEvents);

            GuideStylableConfigs.stylableConfigsTreeComponent.setup();
            // Update the title of Configs Tree with the Editable's Title
            $("#" + guideStyleLayerConstants.GUIDE_STYLE_STYLE_CONFIGS_TITLE)[0].innerHTML =
                Granite.author.edit.actions.getEditableDisplayableName(editable);
            return true;
        } else {
            return false;  // This editable is not stylable
        }
    };

    GuideStylableConfigs.teardownStylableConfigsTree = function () {
        if (GuideStylableConfigs.stylableConfigsTreeComponent) {
            GuideStylableConfigs.stylableConfigsTreeComponent.teardown();
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
