// jscs:disable requireDotNotation
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
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
 **************************************************************************/

;(function ($, author, guidetouchlib, channel, window, undefined) {

    var guideStyleLayer = guidetouchlib.styleLayer,
        guideCommonStyle = guidetouchlib.style,
        guideStyleVars = guideCommonStyle.vars,
        guideStyleLayerVars = guideStyleLayer.vars,
        OVERLAY_BORDER_GAP = 3, //(2px border width + 1px outline offset),
        OVERLAY_BORDER_WIDTH = 2,
        OVERLAY_SCREEN_CORNER_GAP = 2,
        OVERLAY_ACTIONBAR_HEIGHT = 40;
    guideStyleLayer.overlays = guideStyleLayer.overlays || {};

    /* This function will parse the content frame and insert the style attributes in the stylable components*/
    guideStyleLayer.overlays.setupOverlays = function () {
        for (var i = 0; i < author.editables.length; i++) {
            var component = author.editables[i].type;
            component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
            if (guideStyleVars.stylableConfigsJson[component]) {
                guideStyleLayer.overlays._insertSelectorStyleAttributes(author.editables[i], guideStyleVars.stylableConfigsJson[component]);
                //Adding editable attributes in the overlay dom element.
                guideStyleLayer.overlays._insertComponentStyleAttributes(author.editables[i], guideStyleVars.stylableConfigsJson[component]);
            }
        }
    };

    /**
     * Insert component editable attributes in dom.
     */

    guideStyleLayer.overlays._insertSelectorStyleAttributes = function (editable, styleConfig, selector) {
        if (styleConfig) {
            if (selector && styleConfig["cssSelector"]) {
                var stylables = editable.dom.find(styleConfig["cssSelector"]),
                    cssSelectorProperty = "cssSelectorWithoutClass";
                for (var i = 0; i < stylables.length; i++) {
                    var $stylable = $(stylables[i]),
                        newCssSelector = guideCommonStyle.utils.getSelectorMetaData(guideStyleLayer.utils.getEditableComponent(editable), selector, cssSelectorProperty),
                        currentEditablePath = $stylable.attr("data-stylable-path"),
                        currentEditable = window.guidelib.author.editConfigListeners._getEditable(currentEditablePath ? currentEditablePath : ""),
                        currentComponent = currentEditable ? guideStyleLayer.utils.getEditableComponent(currentEditable) : undefined,
                        currentSelector = $stylable.attr("data-stylable-selector"),
                        currentCssSelector = guideCommonStyle.utils.getSelectorMetaData(currentComponent, currentSelector, cssSelectorProperty);
                    /* If there are more than one selector available for the element then choose the more specific selector*/
                    //TODO The second condition needs to be evaluated. Written very early and makes no sense as of now.
                    if (!$stylable.attr("data-stylable-selector")
                        || $stylable.attr("data-stylable-path") != editable.path
                        || (currentCssSelector && guideCommonStyle.utils.isSpecificityHigher(cssExplain(newCssSelector).specificity,
                                    cssExplain(currentCssSelector).specificity))) {
                        $stylable.attr("data-stylable-selector", selector); // Insert the selector name
                    }
                    //if new editable path is more exampple a/b/c whereas older one is a/b then we assign that selector to
                    //more specific one as selector grandparent might be a/b but its immeditate parent is a/b/c.
                    if (!$stylable.attr("data-stylable-path") || (editable.path.length > $stylable.attr("data-stylable-path").length)) {
                        $stylable.attr("data-stylable-path", editable.path);  // Insert the component's path
                    }
                };
            }
            var items = styleConfig["items"];
            for (var key in items) {
                if (items[key]["name"]) {
                    guideStyleLayer.overlays._insertSelectorStyleAttributes(editable, items[key], items[key]["id"]);
                }
            }
        }
    };

    /**
     * Insert component editable attributes in dom.
     */
    guideStyleLayer.overlays._insertComponentStyleAttributes = function (editable, styleConfig, selector) {
        if (styleConfig) {
            var component = guideStyleLayer.utils.getEditableComponent(editable),
                overlay = guideStyleLayer.utils.getEditableComponentOverlayDom(editable),
                $overlay = $(overlay);
            $overlay.attr("data-stylable-component", component);
        }
    };

    /* This function will parse the content frame and insert the style attributes in the stylable components*/
    guideStyleLayer.overlays.tearDownOverlays = function () {
        guideStyleLayer.overlays.removeActiveSelectorOverlays();
        for (var i = 0; i < author.editables.length; i++) {
            if (guideStyleVars.stylableConfigsJson && guideStyleVars.stylableConfigsJson[author.editables[i].type]) {
                guideStyleLayer.overlays._removeStyleAttributes(author.editables[i], guideStyleVars.stylableConfigsJson[author.editables[i].type]);
                guideStyleLayer.overlays._removeComponentStyleAttributes(author.editables[i], guideStyleVars.stylableConfigsJson[author.editables[i].type]);
            }
        }
    };

    guideStyleLayer.overlays._removeStyleAttributes = function (editable, styleConfig, selector) {
        if (styleConfig) {
            if (selector && styleConfig["cssSelector"]) {
                editable.dom.find(styleConfig["cssSelector"]).removeAttr("data-stylable-selector");  // delete the selector name
                editable.dom.find(styleConfig["cssSelector"]).removeAttr("data-stylable-path");  // Delete the component's path
            }
            var items = styleConfig["items"];
            for (var key in items) {
                if (items[key]["name"]) {
                    guideStyleLayer.overlays._removeStyleAttributes(editable, items[key], items[key]["id"]);
                }
            }
        }
    };
    /**
     * Remove component editable attributes in dom.
     */
    guideStyleLayer.overlays._removeComponentStyleAttributes = function (editable, styleConfig, selector) {
        if (styleConfig) {
            $(guideStyleLayer.utils.getEditableComponentOverlayDom(editable)).removeAttr("data-stylable-component");
        }
    };

    guideCommonStyle.overlay.repositionOverlay = function (dataAttribute) {
        if (dataAttribute ==  guideStyleLayer.constants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE && guideStyleVars.currentSelectedOverlayTarget) {
            var selectionText = '<button class="af-overlay-selector-button af-overlay-selector-edit" is="coral-button" icon="edit" iconsize="S"> </button>' +
                '<button class="af-overlay-selector-button af-overlay-selector-parent" is="coral-button" icon="selectContainer" iconsize="S"> </button>',
                $overlaySelector = $('body').find('#af-overlay-selector'),
                elements = {
                    actionButtons : $overlaySelector.find(guideCommonStyle.constants.SELECTOR_OVERLAY_ACTION_BUTTON_SELECTOR),
                    top : $overlaySelector.find(guideCommonStyle.constants.SELECTOR_OVERLAY_TOP_SELECTOR),
                    left : $overlaySelector.find(guideCommonStyle.constants.SELECTOR_OVERLAY_LEFT_SELECTOR),
                    right : $overlaySelector.find(guideCommonStyle.constants.SELECTOR_OVERLAY_RIGHT_SELECTOR),
                    bottom : $overlaySelector.find(guideCommonStyle.constants.SELECTOR_OVERLAY_BOTTOM_SELECTOR)
                };
            guideStyleLayer.overlays.showSelectorOverlays();
            guideCommonStyle.overlay.drawOverlay($overlaySelector, selectionText, $(guideStyleVars.currentSelectedOverlayTarget), elements, guideCommonStyle.overlay.drawSelectorOverlayButtons);
            if (guideStyleLayer.ui.getParentSelector()) {
                $(".af-overlay-selector-parent").removeClass('af-overlay-selector-parent-hidden');
            } else {
                $(".af-overlay-selector-parent").addClass('af-overlay-selector-parent-hidden');
            }
            if (guideStyleLayer.ui.getParentSelector()) {
                $(".af-overlay-selector-parent").removeClass('af-overlay-selector-parent-hidden');
            } else {
                $(".af-overlay-selector-parent").addClass('af-overlay-selector-parent-hidden');
            }
        } else if (dataAttribute == guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE && guideStyleVars.currentComponentOverlayTarget) {
            var $target = $(guideStyleVars.currentComponentOverlayTarget),
                $selectionText,
                editable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path")),
                component = editable.type,
                $overlaySelector = $('body').find('#' + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID),
                elements = {
                    actionButtons : $overlaySelector.find(guideCommonStyle.constants.COMPONENT_OVERLAY_ACTION_BUTTON_SELECTOR),
                    top : $overlaySelector.find(guideCommonStyle.constants.COMPONENT_OVERLAY_TOP_SELECTOR),
                    left : $overlaySelector.find(guideCommonStyle.constants.COMPONENT_OVERLAY_LEFT_SELECTOR),
                    right : $overlaySelector.find(guideCommonStyle.constants.COMPONENT_OVERLAY_RIGHT_SELECTOR),
                    bottom : $overlaySelector.find(guideCommonStyle.constants.COMPONENT_OVERLAY_BOTTOM_SELECTOR)
                },
                hiddenOverlayComponentClass = guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS,
                $copyButton = $("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_COPY_BUTTON_CLASS),
                $pasteButton = $("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_PASTE_BUTTON_CLASS),
                $clearButton = $("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_CLEAR_BUTTON_CLASS),
                $cancelButton = $("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_CANCEL_BUTTON_CLASS);
            guideStyleLayer.overlays.hideComponentOverlayButton($copyButton);
            guideStyleLayer.overlays.hideComponentOverlayButton($clearButton);
            guideStyleLayer.overlays.showComponentOverlayButton($cancelButton);
            if (guideStyleLayerVars.isCopyModeEnabled) {
                if (!$target.is("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_IS_PASTED_CLASS)) {
                    $cancelButton.removeClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_SINGLE_OVERLAY_BUTTON_CLASS);
                    guideStyleLayer.overlays.showComponentOverlayButton($pasteButton);
                } else {
                    guideStyleLayer.overlays.hideComponentOverlayButton($pasteButton);
                    $cancelButton.addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_SINGLE_OVERLAY_BUTTON_CLASS);
                }
            } else {
                guideStyleLayer.overlays.showComponentOverlayButton($copyButton);
                guideStyleLayer.overlays.showComponentOverlayButton($clearButton);
                guideStyleLayer.overlays.hideComponentOverlayButton($cancelButton);
                guideStyleLayer.overlays.hideComponentOverlayButton($pasteButton);
            }
            guideStyleLayer.overlays.showComponentOverlays();
            /*  selection text is given undefined as we dont need to reappend the buttons as they are constant in case
             *  of component as copy,paste,clear,cancel are constant operation unlike selector where
             *  buttons might represent selector names thus being variable.
             */
            guideCommonStyle.overlay.drawOverlay($overlaySelector, undefined, $target, elements, guideStyleLayer.overlays.drawComponentOverlayButtons);
        }
    };

    /** This will highlight all the selectors which will be affected by the current property sheet changes*/
    guideStyleLayer.overlays.repositionActiveOverlays = function () {
        var cssSelector = guideCommonStyle.utils.getSelectorMetaData(guideStyleVars.currentComponent, guideStyleVars.currentSelector, "cssSelectorWithoutClass");
        if (cssSelector) {
            var $selector = guideStyleVars.currentEditable.dom.find(cssSelector);
            if ($selector.length) {
                $selector.addClass('overlayFieldsHighlight');
            }
        }
    };

    /** This will remove highlight ing from all the active selectors */
    guideStyleLayer.overlays.removeActiveSelectorOverlays = function () {
        var cssSelector = guideCommonStyle.utils.getSelectorMetaData(guideStyleVars.currentComponent, guideStyleVars.currentSelector, "cssSelectorWithoutClass");
        if (cssSelector) {
            var $selector = guideStyleVars.currentEditable.dom.find(cssSelector);
            if ($selector.length) {
                $selector.removeClass('overlayFieldsHighlight');
            }
        }
    };

    /**
     *  Hide the component overlay button.
     */
    guideStyleLayer.overlays.hideComponentOverlayButton = function ($button) {
        $button.addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS);
    };

    /**
     *  Show the component overlay button.
     */
    guideStyleLayer.overlays.showComponentOverlayButton = function ($button) {
        $button.removeClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS);
    };

    /**
     *  Hide the selector overlay.
     */
    guideStyleLayer.overlays.hideSelectorOverlays = function () {
        $('#af-overlay-selector').hide();
    };

    /**
     *  Show the selector overlay.
     */
    guideStyleLayer.overlays.showSelectorOverlays = function () {
        $('#af-overlay-selector').show();
    };

    /**
     *  Show the component overlay.
     */
    guideStyleLayer.overlays.showComponentOverlays = function () {
        $('#' + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).show();
    };

    /**
     *  Hide the component overlay.
     */
    guideStyleLayer.overlays.hideComponentOverlays = function () {
        $('#' + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).hide();
    };

    /* Add Overlays div in the editor frame*/
    guideStyleLayer.overlays.initializeStyleOverlays = function () {
        $("#ContentWrapper").append(
            "<div id='af-overlay-selector'>" +
            " <div id='af-overlay-selector-text'></div>" +
            " <div class='af-overlay-selector-top'></div>" +
            " <div class='af-overlay-selector-left'></div>" +
            " <div class='af-overlay-selector-right'></div>" +
            " <div class='af-overlay-selector-bottom'></div>" +
            "</div>");
        guideStyleLayer.overlays.initializeComponentOverlays();
        var copyModeStyle = '.copyMode::after {content: "";position: absolute;top: 0;left: 0;' +
                            'background: white;opacity: .7;width: 100%;height: 100%;pointer-events: none;}\n' +
                            '.copyMode .isPastable:not(.isCopiedEditable) {z-index: 9999;opacity: 1;position: relative;}\n' +
                            '.copyMode .isPastable:not(.copyModeCurrentEditable):not(.isCopiedEditable) {outline: 1px dotted rgba(49, 109, 200, .6);}\n' +
                            '.copyMode .isPastable:not(.copyModeCurrentEditable):not(.isCopiedEditable):hover {outline: 1px solid rgba(49, 109, 200, 1);}\n' +
                            '.copyMode .isCopiedEditable:not(.copyModeCurrentEditable) {outline: 1px solid #316dc8;}\n';
        /* Adding this style tab in the content frame to highlight active selectors*/
        $(document.getElementById('ContentFrame')).contents().find('body').append("<style class='activeFieldsOverlays'>" +
        "\n.overlayFieldsHighlight{" +
        "outline: 2px solid #46C8DC;" +
        "outline-offset: 1px;" +
        "}\n" +
        //css for the removal of padding introduced in authoring by editor framework.
        ".cq-Editable-dom--container, .aem-GridColumn.cq-Editable-dom--container {" +
        "  padding : 0px;" +
        "}" +
        copyModeStyle +
        "</style>");
        guideStyleLayer.overlays.registerEventHandlers();
    };

    /**
     *  Initialize the component overlay and its action buttons.
     */
    guideStyleLayer.overlays.initializeComponentOverlays = function () {
        var componentOverlayString = "<div id='" + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID + "'>" +
                                     " <div id='af-overlay-component-text'></div>" +
                                     " <div class='af-overlay-component-top'></div>" +
                                     " <div class='af-overlay-component-left'></div>" +
                                     " <div class='af-overlay-component-right'></div>" +
                                     " <div class='af-overlay-component-bottom'></div>" +
                                     "</div>",
            tempDivElement = document.createElement('div'),
            componentOverlayElement = $(tempDivElement).append(componentOverlayString).get(0).firstChild,
            $componentOverlayElement = $(componentOverlayElement),
            clearButtonTitle = guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_BUTTON_CLEAR_TITLE,
            clearButton = new Coral.Button().set({
                label : {
                    innerHTML : clearButtonTitle
                }
            }),
            $clearButton = $(clearButton).addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_CLEAR_BUTTON_CLASS),
            copyButtonTitle = guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_BUTTON_COPY_TITLE,
            copyButton = new Coral.Button().set({
                label : {
                    innerHTML : copyButtonTitle
                }
            }),
            $copyButton =  $(copyButton).addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_COPY_BUTTON_CLASS),
            cancelButton = new Coral.Button().set({
                icon : "close",
                iconSize : "XS"
            }),
            $cancelButton = $(cancelButton).addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_CANCEL_BUTTON_CLASS),
            pasteButtonTitle = guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_BUTTON_PASTE_TITLE,
            pasteButton = new Coral.Button().set({
                label : {
                    innerHTML : pasteButtonTitle
                },
                variant : "primary"
            }),
            $pasteButton = $(pasteButton).addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_PASTE_BUTTON_CLASS),
            $selectionText = $clearButton;
        $selectionText = $selectionText.add($copyButton)
                                       .add($cancelButton)
                                       .add($pasteButton);
        $selectionText.addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS)
                      .addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_BUTTON_CLASS);
        $componentOverlayElement.find("#af-overlay-component-text").html($selectionText);
        $("#ContentWrapper").append($componentOverlayElement);
    };

    /**
     *  register overlay events.
     */
    guideStyleLayer.overlays.registerEventHandlers = function () {
        $("#af-overlay-selector-text").on('click', '.af-overlay-selector-edit', function (e) { guideStyleLayer.ui.handleEditActionOnContent(e);});
        $("#af-overlay-selector-text").on('click', '.af-overlay-selector-parent', function (e) { guideStyleLayer.ui.handleParentActionOnContent(e);});
        $(".af-overlay-component-paste").on('click', function (e) { guideStyleLayer.ui.componentModeHandlePasteActionOnContent(e);});
        $(".af-overlay-component-copy").on('click', function (e) { guideStyleLayer.ui.componentModeHandleCopyActionOnContent(e);});
        $(".af-overlay-component-clear").on('click', function (e) { guideStyleLayer.ui.componentModeHandleClearActionOnContent(e);});
        $(".af-overlay-component-cancel").on('click', function (e) { guideStyleLayer.ui.componentModeHandleCancelActionOnContent(e);});
        $(document).off("cq-contentframe-layout-change.formAuthoring.styleLayer.overlay").on("cq-contentframe-layout-change.formAuthoring.styleLayer.overlay", guideStyleLayer.ui.contentFrameLayoutChangeHandler);
    };

    /* Remove Overlays div in the editor frame*/
    guideStyleLayer.overlays.removeStyleOverlays = function () {
        $(document.getElementById('ContentFrame')).contents().find('.activeFieldsOverlays').remove();

        $("#ContentWrapper").find("#af-overlay-selector").remove();
    };

    /* Remove Overlays div in the editor frame*/
    guideStyleLayer.overlays.removeComponentOverlays = function () {
        $("#ContentWrapper").find("#" + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).remove();
    };

    /**
     * Function which governs the logic to repostion component overlay.
     * @param {Object} elements - elements object containing data top, right, left, bottom border and actionButtons of overlay.
     * @param {Object} targetOffset - Offset object which contains position information of target element on which overlay is positioned.
     */
    guideStyleLayer.overlays.drawComponentOverlayButtons = function (elements, targetOffset) {
        //adjusting the action bar if it goes outside the screen from the right
        setTimeout(function () {
            var targetOffsetLeft = targetOffset.left,
                targetButtonOffsetLeft = targetOffsetLeft,
                targetOffsetButtonTop = targetOffset.top,
                targetWidth = targetOffset.width,
                $actionBarButtons = elements.actionButtons.find("." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_BUTTON_CLASS + ":not(." + guideStyleLayer.constants.GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS + ")"),
                actionBarWidth = 0;
            //special handling of top as it contains the action bar which needs to be adjusted separately
            _.each($actionBarButtons, function (actionButton) {
                actionBarWidth += $(actionButton).outerWidth();
            });
            if (targetOffset.top < (OVERLAY_ACTIONBAR_HEIGHT +  OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP)) {
                targetOffsetButtonTop += (OVERLAY_ACTIONBAR_HEIGHT +  OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP);
            }
            //after all the adjustments, set the inline CSS values to elements
            elements.actionButtons.css({
                left :  (targetButtonOffsetLeft + OVERLAY_BORDER_WIDTH + targetWidth - actionBarWidth),
                top :   (targetOffsetButtonTop - OVERLAY_ACTIONBAR_HEIGHT - OVERLAY_BORDER_WIDTH * 2)
            });
        }, 0);
    };

    /**
     * Check if style overlay overlaps with copy paste overlay.
     */
    guideCommonStyle.overlay.isActionBarColliding = function (selectorActionBarOffset) {
        var $copyPasteActionBar = $("#af-overlay-component-text");
        if (!_.isEmpty($copyPasteActionBar) && !_.isEmpty(selectorActionBarOffset)) {
            //This position api is used as all the calculation are done relative to iframe and we share common parent with iframe and both iframe and parent have same size.
            var copyPasteActionBarOffset = $copyPasteActionBar.position(),
                selectorActionBarBottom = selectorActionBarOffset.top + selectorActionBarOffset.height,
                selectorActionBarRight = selectorActionBarOffset.left + selectorActionBarOffset.width,
                copyPasteActionBarBottom = copyPasteActionBarOffset.top + $copyPasteActionBar.height,
                copyPasteActionBarRight = copyPasteActionBarOffset.left + $copyPasteActionBar.width;
            if (selectorActionBarBottom < copyPasteActionBarOffset.top || selectorActionBarOffset.top > copyPasteActionBarBottom || selectorActionBarRight < copyPasteActionBarOffset.left
                || selectorActionBarOffset.left > copyPasteActionBarRight) {
                return false;
            }
            return true;
        }
        return false;
    };

}(jQuery, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
