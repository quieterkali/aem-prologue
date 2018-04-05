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
            var styleLayerConstants = guidetouchlib.styleLayer.constants;
            if (!element.hasClass('toplevel-element')) {
                /**
                 * Adding icons in the form object tree.
                 */
                var editIconButton = new Coral.Button().set({
                    icon : "edit",
                    iconSize : "XS",
                    variant : "quiet"
                });
                $editIconButton = $(editIconButton).addClass("styleLayerSidePanelIcon styleEditIcon styleLayerSidePanelIconHide"),
                $treeElement = element.find(".sidepanel-tree-item-div");
                $treeElement.append($editIconButton);
                element.find('.styleEditIcon').on('click', handleEditIconClick);
                // xss safe
                node.path = CQ.shared.XSS.getXSSValue(node.path);

                element.attr("data-path", node.path);
                if (node.fragRef) {
                    element.children('div').addClass('is-fragment');
                }
                guidetouchlib.ObjectsTreeUtils.addIconForComponents(node, element);

            }
        },

        handleEditIconClick = function (event) {
            var guideStyleLayerVars = guidetouchlib.styleLayer.vars,
                guideStyleLayerConstants = guidetouchlib.styleLayer.constants,
                style = window.guidelib.touchlib.style,
                styleUtils = style.utils,
                styleConstants = style.constants;
            event.stopPropagation();
            if (guideStyleLayerVars.isCopyModeEnabled) {
                var $styleAlertCopyModeChange = $("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_ENABLED_ALERT_MESSAGE_CLASS);
                $styleAlertCopyModeChange.removeClass(styleConstants.HIDE_ALERT_CLASS).fadeTo(600, 1).delay(3000).fadeTo(600, 0, function () {
                    $styleAlertCopyModeChange.addClass(styleConstants.HIDE_ALERT_CLASS);
                });
                return;
            }
            var options = getCurrentEditableAndComponent(event);
            var editable = options.editable,
                component = options.component;
            // Initialize the stylable configs tree of this component
            var isStylable = guidetouchlib.styleLayer.stylableConfigs.initializeStylableConfigsTree(editable, component);

            if (isStylable) {
                guidetouchlib.style.vars.currentEditable = editable;
                guidetouchlib.style.vars.currentComponent = component;
                guidetouchlib.styleLayer.utils.showStylableConfigsTree();
            }
        },

        getCurrentEditableAndComponent = function (event) {
            var item = $(event.currentTarget).closest('.sidepanel-tree-item'),
                fieldPath = item.data("path"),
                editable = window.guidelib.author.editConfigListeners._getEditable(fieldPath),
                component = editable.type;
            component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
            var options = {};
            options.editable = editable;
            options.component = component;
            return options;
        },

        /*
         * override
         *
         */
        handleItemSelect = function (event) {
            var item = $(event.currentTarget);

            _superHandleItemSelect.call(this, event);
            if (!item.hasClass('toplevel-element') && !item.hasClass('firstLevel-element')) {
                var fieldPath = item.data("path"),
                    somid = window.guidelib.author.AuthorUtils.getHtmlId(fieldPath);

                /* Set the focus on the item which is clicked*/
                guidetouchlib.utils.setFocusInsideAFWindow(somid);
                this.currentSelectedNode.focus();     //moving the focus back to the editor layer
                var currentEditable = window.guidelib.author.editConfigListeners._getEditable(this.currentSelectedNode.data("path"));
                var stylableTarget = currentEditable.dom.find("[data-stylable-selector]").eq(0).get(0);
                if (stylableTarget) {
                    guidetouchlib.styleLayer.ui.handleClickOnContent(stylableTarget);
                } else {
                    guidetouchlib.styleLayer.overlays.hideSelectorOverlays();
                }
            }
        };
    guidetouchlib.styleLayer.FormObjectsTreeRenderer = author.util.extendClass(author.ui.TreeRenderer, {
        newNodeAddedToTree : newNodeAddedToTree,
        handleItemSelect : handleItemSelect
    });

}(jQuery, Granite.author, window.guidelib.touchlib, this));
