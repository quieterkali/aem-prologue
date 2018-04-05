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

;(function ($, author, guidetouchlib, style, undefined) {

    var guideStyleLayerConstants = guidetouchlib.styleLayer.constants,
        guideStyleLayer = guidetouchlib.styleLayer,
        guideStyleLayerVars = guideStyleLayer.vars,
        guideCommonStyle = guidetouchlib.style,
        guideStyleVars = guideCommonStyle.vars,
        styleAssetLib = style.assetLibrary,
        guideStyleLayerUI = guideStyleLayer.ui = guideStyleLayer.ui || {},
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetUtils = styleAssetLib.utils,
        styleAssetLibUI = styleAssetLib.ui,
        styleAssetLibHistory = styleAssetLib.history,
        styleAssetLibManager = styleAssetLibHistory.manager;

    guideStyleLayerUI.handleEditActionOnTree = function (selector) {
        guideStyleLayer.overlays.repositionActiveOverlays();
        /* Update the property sheet with this new selection change*/
        guideCommonStyle.utils.updateSelector();
    };

    guideStyleLayerUI.handleClickOnContent = function (target) {
        //The component overlay needs to be created before selector overlay as overlap resolving logic is written in component overlay creation.
        guideStyleLayerUI.moveCreateOverlay(target, guideStyleLayerConstants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
        if (!guideStyleLayerVars.isCopyModeEnabled) {
            guideStyleLayerUI.moveCreateOverlay(target, guideStyleLayerConstants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE);
        }
    };

    /**
     * Move component and selector overlay based on content clicked.
     * @param {Object} target - target object on which overlay is drawn.
     * @param {Object} dataAttribute - data Attribute selector or component which governs which overlay is drawn.
     */
    guideStyleLayerUI.moveCreateOverlay = function (target, dataAttribute) {
        var $target = $(target),
            dataAttribute,
            isComponentOverlay,
            isSelectorOverlay;
        if (dataAttribute == guideStyleLayerConstants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE) {
            isSelectorOverlay = true;
        } else {
            isComponentOverlay = true;
        }
        if (isSelectorOverlay && (!target || ($target == guideStyleVars.currentSelectedOverlayTarget))) {
            return;
        } else if (isComponentOverlay && (!target || ($target == guideStyleVars.currentSelectedOverlayTarget))) {
            return;
        }
        if ($target.data(dataAttribute)) {
            /* A new selection is made */
            /*TODO need to check if the changes are pending then need to save them */
            if (isSelectorOverlay) {
                guideStyleVars.currentSelectedOverlayTarget = target;
            } else if (isComponentOverlay) {
                if (guideStyleLayerVars.isCopyModeEnabled) {
                    var editable = guideStyleLayer.utils.getEditableFromPath($(target).data("stylable-path"));
                    if (!guideStyleLayer.utils.isEditablePastable(editable)) {
                        return;
                    }
                    $(guideCommonStyle.utils.getContentFrame()).contents().find("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE);
                    $(target).addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE);
                }
                guideStyleVars.currentComponentOverlayTarget = target;
            }
            guideCommonStyle.overlay.repositionOverlay(dataAttribute);
        } else {
            guideStyleLayerUI.moveCreateOverlay(target.parentNode, dataAttribute);
        }
    };

    guideStyleLayerUI.handleEditActionOnContent = function () {
        guideStyleLayer.utils.exitCopyMode();
        if (guideStyleVars.isPropertySheetChanged) {
            guideCommonStyle.utils.alertComponentSwitchDisabled();
            return;
        }
        var $target = $(guideStyleVars.currentSelectedOverlayTarget);
        guideStyleLayer.overlays.removeActiveSelectorOverlays();
        guideStyleVars.currentEditable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path"));
        guideStyleVars.currentComponent = guideStyleVars.currentEditable.type;
        guideStyleVars.currentComponent = (guideStyleVars.currentComponent == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : guideStyleVars.currentComponent);
        guideStyleVars.currentSelector = $target.data("stylable-selector");
        // Initialize the stylable configs tree of this component
        guidetouchlib.styleLayer.stylableConfigs.initializeStylableConfigsTree(guideStyleVars.currentEditable, guideStyleVars.currentComponent);
        guideStyleLayer.utils.showPropertySheetPanel();
        guideStyleLayer.overlays.repositionActiveOverlays();
        /* Update the property sheet with this new selection change*/
        guideCommonStyle.utils.updateSelector();
        style.ui.resetAssetLibraryWidgets();
    };

    /**
     * Toolbar copy action handler in component mode.
     */

    guideStyleLayerUI.componentModeHandleCopyActionOnContent = function () {
        if (guideStyleVars.isPropertySheetChanged) {
            guideCommonStyle.utils.alertComponentSwitchDisabled();
            return;
        }
        var $target = $(guideStyleVars.currentComponentOverlayTarget),
            editable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path")),
            component = editable.type;
        component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
        guideStyleLayer.utils.copyEditableStyle(editable, component);
    };

    /**
     * Toolbar Paste action handler in component mode.
     */

    guideStyleLayerUI.componentModeHandlePasteActionOnContent = function (e) {
        if (guideStyleVars.isPropertySheetChanged) {
            guideCommonStyle.utils.alertComponentSwitchDisabled();
            return;
        }
        var $target = $(guideStyleVars.currentComponentOverlayTarget);
        editable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path"));
        component = editable.type;
        component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
        $target.addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_IS_PASTED_CLASS);
        guideCommonStyle.overlay.repositionOverlay(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
        guideStyleLayer.utils.pasteEditableStyle(editable, component);
    };

    /**
     * Toolbar clear action handler in component mode.
     */

    guideStyleLayerUI.componentModeHandleClearActionOnContent = function () {
        if (guideStyleVars.isPropertySheetChanged) {
            guideCommonStyle.utils.alertComponentSwitchDisabled();
            return;
        }
        var $target = $(guideStyleVars.currentComponentOverlayTarget);
        editable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path"));
        component = editable.type;
        component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
        guideStyleLayer.utils.clearEditableStyle(editable, component);
    };

    /**
     * Toolbar cancel action which exits copy mode.
     */
    guideStyleLayerUI.componentModeHandleCancelActionOnContent = function () {
        if (guideStyleVars.isPropertySheetChanged) {
            guideCommonStyle.utils.alertComponentSwitchDisabled();
            return;
        }
        var $styleAlertCopyModeChange = $("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_ENABLED_ALERT_MESSAGE_CLASS);
        $styleAlertCopyModeChange.stop(true, true).addClass(style.constants.HIDE_ALERT_CLASS).css("opacity", "0");
        guideStyleLayer.utils.exitCopyMode();
    };

    guideStyleLayerUI.getParentSelector = function () {
        var $target = $(guideStyleVars.currentSelectedOverlayTarget),
        selectorString = $target.data("stylable-path"),
        currentEditable = window.guidelib.author.editConfigListeners._getEditable(selectorString),
        currentComponent = currentEditable.type,
        selectorPath = $target.data("stylable-selector");
        currentComponent = (currentComponent == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : currentComponent);
        if (guideStyleVars.mapping[currentComponent] && guideStyleVars.mapping[currentComponent][selectorPath]) {
            selectorPath = guideStyleVars.mapping[currentComponent][selectorPath];
        }
        if (selectorPath.lastIndexOf('/') !== -1) {
            var newSelector = selectorPath.substring(0, selectorPath.lastIndexOf('/')),
                currentComponentMap = guideStyleVars.mapping[currentComponent];
            i;
            //convert back to ID based selector
            if (currentComponentMap) {
                var keys = Object.keys(currentComponentMap);
                for (i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (currentComponentMap[key] === newSelector) {
                        return key;
                    }
                }
            }
            return newSelector;
        }
    };

    guideStyleLayerUI.handleParentActionOnContent = function () {
        var $target = $(guideStyleVars.currentSelectedOverlayTarget),
            selector = $target.data("stylable-selector"),
            newSelector = guideStyleLayerUI.getParentSelector(selector);
        if (newSelector) {
            var editable = window.guidelib.author.editConfigListeners._getEditable($target.data("stylable-path")),
                component = (editable.type == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : editable.type),
                cssSelector = guideCommonStyle.utils.getSelectorMetaData(component, newSelector, "cssSelectorWithoutClass"),
                $selector = editable.dom.find(cssSelector);
            guideStyleVars.currentSelectedOverlayTarget = $selector;
            guideCommonStyle.overlay.repositionOverlay(guideStyleLayerConstants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE);
        }
    };

    guideStyleLayerUI.registerEventHandlers = function () {
        guideStyleLayerUI.registerSidePanelHeaderEvents();
        guideStyleLayerUI.registerContentPanelEvents();
        guideCommonStyle.ui.registerPropertyChangeHandler();
        guideStyleLayerUI.registerPropertySheetCreatedHandler();
    };

    guideStyleLayerUI.registerPropertySheetCreatedHandler = function () {
        $(document).off("style-propertysheet-created.formAuthoring.styleLayer.propertySheetCreateHandler")
                   .on("style-propertysheet-created.formAuthoring.styleLayer.propertySheetCreateHandler", function (e) {
            guideStyleLayerUI.propertySheetCreatedHandler(e);
        });
    };

    guideStyleLayerUI.propertySheetCreatedHandler = function (e) {
        if (e.isFirstPropertySheetLoaded || styleAssetLibVars.themePath != styleUtils.getThemePath()) {
            style.utils.initializeAssetLibrary();
        } else {
            style.assetLibrary.utils.assetLibraryInit();
        }
    };

    guideStyleLayerUI.registerContentPanelEvents = function () {
        $(window._afAuthorHook._getAfWindow().document).click(function (event) {
            event.preventDefault();
            guideStyleLayerUI.handleClickOnContent(event.target);
        });
    };

    guideStyleLayerUI.registerSidePanelHeaderEvents = function () {
        var $styleSheetCancelButton = $("#" + guideStyleLayerConstants.GUIDE_STYLE_PROPERTIES_CANCEL_BUTTON_ID),
            $styleSheetSaveButton = $("#" + guideStyleLayerConstants.GUIDE_STYLE_PROPERTIES_SAVE_BUTTON_ID);

        $styleSheetSaveButton.on("click", function () {
            guideStyleLayerUI.styleSheetSaveHandler();
        });

        $styleSheetCancelButton.on("click", function () {
            guideStyleLayer.utils.cancelStyleProperties();
            guideStyleLayer.utils.showStylableConfigsTree();
        });

        $("#" + guideStyleLayerConstants.GUIDE_STYLE_CONFIG_BACK_BUTTON_ID).on("click", function (e) {
            guideStyleLayer.utils.showFormObjectsTree();
            guideStyleVars.currentComponent = "";
            guideStyleVars.currentEditable = undefined;
        });

        $("#" + guideStyleLayerConstants.GUIDE_STYLE_PROPERTIES_STATE_NAME_ID).on("change", function (event) {
            guideStyleVars.currentState = event.target.value;
            /* Update the property sheet with this new selection change*/
            guideCommonStyle.ui.populatePropertySheet();
        });

        $(".guideStyleLayerSidePanelCopyCancelButton").on("click", function () {
            guideStyleLayer.utils.exitCopyMode();
        });
    };
    guideStyleLayerUI.styleSheetSaveHandler = function () {
        guideCommonStyle.utils.propertySheetSaved();
    };

    /**
     * This function handles hide/show of overlays when tab switched.
     */
    guideStyleLayer.ui.contentFrameLayoutChangeHandler = function (e) {
        if (guideStyleVars.currentComponentOverlayTarget && guideStyleLayerVars.isCopyModeEnabled) {
            var $target = $(guideStyleVars.currentComponentOverlayTarget);
            if ($target.is(":visible")) {
                $('#' + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).removeClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_HIDE_COMPONENT_OVERLAY_CLASS);
                guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
            } else {
                $('#' + guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_HIDE_COMPONENT_OVERLAY_CLASS);
            }
        } else {
            if (guideStyleVars.currentComponentOverlayTarget) {
                guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
            }
            if (guideStyleVars.currentSelectedOverlayTarget) {
                guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE);
            }
        }
    };

}(jQuery, window.Granite.author, window.guidelib.touchlib, window.guidelib.touchlib.style));
