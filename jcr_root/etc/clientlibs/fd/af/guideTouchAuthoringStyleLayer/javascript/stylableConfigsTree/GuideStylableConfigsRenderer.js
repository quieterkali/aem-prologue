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

    var _superHandleItemSelect = author.ui.TreeRenderer.prototype.handleItemSelect,
    /*
     * override
     * */
        newNodeAddedToTree = function (node, element) {
            if (!element.hasClass('toplevel-element')) {
                // xss safe
                node.id = CQ.shared.XSS.getXSSValue(node.id);
                var coralIconElement = "<coral-icon class='coral-Icon--edit styleEditIcon styleLayerSidePanelIconHide styleLayerSidePanelIcon'></coral-icon>",
                    $coralIconElement = $(coralIconElement).attr("size", "XS").attr("data-selector", node.id);
                element.find(".sidepanel-tree-item-div").append($coralIconElement);
                element.find('.styleEditIcon').on('click', handleEditIconClick);
            }
        },
        handleEditIconClick = function (event) {
            guidetouchlib.styleLayer.utils.showPropertySheetPanel();
            guidetouchlib.style.vars.currentSelector = $(event.currentTarget).data('selector');
            guidetouchlib.styleLayer.ui.handleEditActionOnTree();
            guidetouchlib.style.ui.resetAssetLibraryWidgets();
        },
        handleItemSelect = function (event) {
            var item = $(event.currentTarget);
            _superHandleItemSelect.call(this, event);
            var stylableTarget = guidetouchlib.style.vars.currentEditable.dom.find("[data-stylable-selector='" + this.currentSelectedNode.data("elementid") + "']").eq(0).get(0);
            if (stylableTarget) {
                guidetouchlib.styleLayer.ui.handleClickOnContent(stylableTarget);
            } else {
                guidetouchlib.styleLayer.overlays.hideSelectorOverlays();
            }
        };

    guidetouchlib.styleLayer.StylableConfigsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect
    });

}(jQuery, Granite.author, window.guidelib.touchlib, this));
