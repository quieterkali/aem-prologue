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
;(function ($, author, guidetouchlib, undefined) {

    var _superHandleItemSelect = author.ui.TreeRenderer.prototype.handleItemSelect,
    /*
     * override
     * */
        handleItemSelect = function (event) {
            _superHandleItemSelect.call(this, event);
            var item = $(event.currentTarget);
            var xfaSom = item.data("xdp-som"),
                selector = "div[data-xdp-som='" + xfaSom + "']",
                afwindow = window._afAuthorHook._getAfWindow(),
                id = afwindow.$(selector).data("guide-id");
            if (id) {
                var fieldPath = afwindow.$("#" + id).data("path"); // for panels
                if (!fieldPath) {
                    fieldPath = afwindow.$("#" + id).children(".dataGuideFieldAttributes").data("guide-fieldpath");
                }

                guidetouchlib.utils.setFocusInsideAFWindow(id);

                if (fieldPath) {
                    var editable = window.guidelib.author.editConfigListeners._getEditable(fieldPath);
                    guidetouchlib.editLayer.Interactions.onOverlayClick({
                        editable : editable
                    });
                }
            }
        },

        newNodeAddedToTree = function (node, element) {
            var xssElementId = CQ.shared.XSS.getXSSValue(element.data("elementid")),
                xssXPathType = CQ.shared.XSS.getXSSValue(node.xpathtype);

            element.children('div').addClass("cq-draggable");
            element.children('div').attr("data-type", "GuideDataModel");
            element.attr("data-xdp-som", xssElementId);
            element.children('div').attr("data-xpathtype", xssXPathType);
            element.children('div').append("<div class='markDataObjectUsed'/>");
            guidetouchlib.ObjectsTreeUtils.addIconForComponents(node, element);
        };

    var GuideDataObjectsTreeRenderer = guidetouchlib.editLayer.DataObjectsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect
    });

}(jQuery, Granite.author, window.guidelib.touchlib, this));
