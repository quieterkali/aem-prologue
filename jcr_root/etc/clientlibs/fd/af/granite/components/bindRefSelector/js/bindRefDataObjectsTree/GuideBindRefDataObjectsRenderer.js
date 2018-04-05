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
        handleItemSelect = function (event) {
            _superHandleItemSelect.call(this, event);
            guidetouchlib.components.bindRef.bindRefDataObjects.selectedItemBindRef = $(event.currentTarget).attr("data-bindref");
        },

        newNodeAddedToTree = function (node, element) {
            node.id = CQ.shared.XSS.getXSSValue(node.id);
            element.attr("data-bindref", node.id);
            guidetouchlib.ObjectsTreeUtils.addIconForComponents(node, element);
        };

    var GuideBindRefDataObjectsTreeRenderer = guidetouchlib.components.bindRef.BindRefDataObjectsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect
    });

}(jQuery, Granite.author, window.guidelib.touchlib, this));
