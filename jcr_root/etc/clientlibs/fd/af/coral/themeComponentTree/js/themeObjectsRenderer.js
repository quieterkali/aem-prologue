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
;(function ($, author, theme, window, undefined) {

    var _superHandleItemSelect = author.ui.TreeRenderer.prototype.handleItemSelect,
    /*
    * override
    */
    newNodeAddedToTree = function (node, element) {
        if (node.editable == "true") {
            var coralIconElement = "<coral-icon class='coral-Icon--edit coral-Icon coral-Icon--sizeXS'></coral-icon>";
            $coralIconElement = $(coralIconElement).attr("size", "XS")
            .attr("data-themecomponentname", node.component)
            .attr("data-themeselectorname", node.selector)
            .attr("handle", "icon")
            .addClass("coral-Icon--edit coral-Icon themeObjectEditIcon themeObjectEditIconHide coral-Icon--sizeXS");
            element.find(".sidepanel-tree-item-div").append($coralIconElement);
            element.addClass("themeEditableObject");
            element.attr("tabIndex", "1"); //To enable focus on item.
        }
    },
    /*
     * override
     *
     */
     handleItemSelect = function (event) {
         _superHandleItemSelect.call(this, event);
         event.stopPropagation();
         var item = $(event.currentTarget);
         author.ui.TreeRenderer.prototype.expandCollapseItem(item);
     },
     /*
     * override
     *
     */
     selectCurrentNodeKeyboardNav = function () {
         var $item = this.currentSelectedNode;
         this.deselectAllItems();
         $item.addClass('is-selected');
     };

    GuideFormObjectsTreeRenderer = theme.FormObjectsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect,
        selectCurrentNodeKeyboardNav : selectCurrentNodeKeyboardNav
    });
}(jQuery, Granite.author, window.guidelib.touchlib.theme, this));
