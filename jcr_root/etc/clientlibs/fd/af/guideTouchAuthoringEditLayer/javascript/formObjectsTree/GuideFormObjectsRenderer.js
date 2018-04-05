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
        _superRefreshNodeHTML = author.ui.TreeRenderer.prototype.refreshNodeHTML,
/*
* override
* */
        newNodeAddedToTree = function (node, element) {
            var xssNodeType = CQ.shared.XSS.getXSSValue(node.type),
                xssNodePath = CQ.shared.XSS.getXSSValue(node.path);

            element.attr("data-path", xssNodePath);
            element.attr("data-type", xssNodeType);

            if (node.fragRef) {
                element.children('div').addClass('is-fragment');
            }
            if (!element.hasClass('toplevel-element')) {
                element.children('div').addClass("cq-draggable");
                element.children('div').attr("data-type", "GuideFormObject");
            }
            guidetouchlib.ObjectsTreeUtils.addIconForComponents(node, element);
        },

    /*
     * override
     * This callback is to remove any custom class etc added before
     * and to add new class etc to this element based on new node
     * as this element is being refreshed.
     * */
        refreshNodeHTML = function (node, element) {
            _superRefreshNodeHTML.call(this, node, element);
            element.children('div').removeClass('is-fragment');
            element.find('.tree-item-coral-icon').remove();
            newNodeAddedToTree(node, element);
        },

    /*
     * override
     * */
        handleItemSelect = function (event) {
        _superHandleItemSelect.call(this, event);
        var item = $(event.currentTarget);
        var fieldPath = item.data("path"),
            guideContainer = "/" + window.guidelib.author.AuthorUtils.getGuideContainerName(),
            somid;

        /*To check if the top level form is selected, field path should end at /guideContainer */
        if (fieldPath.indexOf(guideContainer, fieldPath.length - guideContainer.length)  != -1) {
            /* Just append the '/' at the end to get the correct value from getHtmlId for this */
            somid = window.guidelib.author.AuthorUtils.getHtmlId(fieldPath + "/");
        } else {
            somid = window.guidelib.author.AuthorUtils.getHtmlId(fieldPath);
        }

        var editable = window.guidelib.author.editConfigListeners._getEditable(fieldPath);

        this.selectionFromTree = true;

        var toolbar = guidetouchlib.utils.insideToolbar(editable);
        if (toolbar) {
            /* In case of toolbar setfocus on the parent*/
            var parentPath = author.editables.getParent(toolbar).path;
            if (parentPath === window._afAuthorHook._getAfWindow().$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")) {
                parentPath = parentPath + "/";
            }
            var parentid = window.guidelib.author.AuthorUtils.getHtmlId(parentPath);
            guidetouchlib.utils.setFocusOnParentInsideAFWindow(somid, parentid);
        } else {
            /* Set the focus on the item which is clicked*/
            guidetouchlib.utils.setFocusInsideAFWindow(somid);
        }
        // Invoke the overlay click interactions
        guidetouchlib.editLayer.Interactions.onOverlayClick({
            editable : editable
        });
        this.currentSelectedNode.focus();       //moving the focus back to the editor layer
    };

    var GuideFormObjectsTreeRenderer = guidetouchlib.editLayer.FormObjectsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect,
        refreshNodeHTML : refreshNodeHTML
    });

    GuideFormObjectsTreeRenderer.prototype.setDropTarget = function ($item, cssClass) {
        if (this.$dropTarget !== $item) {
            if (this.$dropTarget) {
                removeHighlightingClass(this.$dropTarget);
            }
            this.$dropTarget = $item;
            this.$dropTarget.addClass(cssClass);
        }
    };

    GuideFormObjectsTreeRenderer.prototype.resetDropTarget = function () {
        if (this.$dropTarget) {
            removeHighlightingClass(this.$dropTarget);
            this.$dropTarget = null;
            this.dropLocation = null;
            this.editableNeighbour = null;
        }
    };

    function removeHighlightingClass($dropTarget) {
        $dropTarget.removeClass("topBorder");
        $dropTarget.removeClass("bottomBorder");
        $dropTarget.removeClass("highlightDiv");
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
