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

(function (guidetouchlib, guideStyleLayer, window) {

    /**
     * Constants for guide style layer access
     * @type {Object}
     */
    guideStyleLayer.constants = {
        GUIDE_STYLE_SIDE_PANEL : "js-SidePanel-content--style",
        GUIDE_STYLE_SIDE_PANEL_PATH : "/libs/fd/af/content/editors/form/jcr:content/sidepanels/style.html",
        GUIDE_STYLE_SIDE_PANEL_SELECTOR : ".js-SidePanel-content--style",
        GUIDE_STYLE_LAYER_OBJECTS_ID : "guideStyleLayerObjects",
        GUIDE_STYLE_LAYER_OBJECTS_CONTAINER_ID : "guideStyleLayerObjectsContainer",
        GUIDE_STYLABLE_CONFIG_CONTAINER_ID : "guideStylableConfigContainer",
        GUIDE_STYLABLE_CONFIG_ID : "guideStylableConfigs",
        GUIDE_STYLE_CONFIG_BACK_BUTTON_ID : "guideStyleConfigBackButton",
        GUIDE_STYLE_PROPERTIES_SAVE_BUTTON_ID : "styleSaveButton",
        GUIDE_STYLE_PROPERTIES_CANCEL_BUTTON_ID : "styleCancelButton",
        GUIDE_STYLE_PROPERTIES_STATE_NAME_ID : "style-stateName",
        GUIDE_STYLE_PROPERTIES_STATE_CONTAINER_ID : "style-statescontainer",
        GUIDE_STYLE_BREAKPOINT_INFO_HEADER : "styleBreakPointInfoHeader",
        GUIDE_STYLE_SELECTOR_CHANGE_ALERT : "styleSelectorChangeAlert",
        GUIDE_STYLE_VALIDATION_ALERT : "styleValidationAlert",
        GUIDE_STYLE_SIDE_PANEL_HEADER : "styleSidePanelHeader",
        GUIDE_STYLE_STYLE_CONFIGS_TITLE : "sidepanel-tab-configs-title",
        GUIDE_STYLE_PROPERTY_NAME : "styleProperties",
        GUIDE_STYLE_LAYER_UNDO : guidetouchlib.style.constants.UNDO_CLASS,
        GUIDE_STYLE_LAYER_REDO : guidetouchlib.style.constants.REDO_CLASS,
        GUIDE_STYLE_NODE_NAME : "style",
        GUIDE_STYLE_COMPONENT_MODE : "componentMode",
        GUIDE_STYLE_SELECTOR_MODE : "selectorMode",
        GUIDE_STYLE_COPY_MODE : "componentMode",
        GUIDE_STYLE_MODE_SWITCH_SELECTOR : ".mode-select",
        GUIDE_STYLE_LAYER_OBJECT_CONTAINER_ID : "guideStyleLayerObjectsContainer",
        GUIDE_STYLE_LAYER_COPY_MODE_NODE_CLASS : "copyModeNode",
        GUIDE_STYLE_LAYER_PASTE_BUTTON_CLASS : "stylePasteIcon",
        GUIDE_STYLE_LAYER_COPY_MODE_LEAF_NODE_CLASS : "copyModeLeafNode",
        GUIDE_STYLE_LAYER_COPY_MODE_CLASS : "copyMode",
        GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE : "stylable-selector",
        GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE : "stylable-component",
        GUIDE_STYLE_LAYER_HIDDEN_CLASS : "afHidden",
        GUIDE_STYLE_LAYER_COPY_CANCEL_BUTTON_CLASS : "guideStyleLayerSidePanelCopyCancelButton",
        GUIDE_STYLE_LAYER_IS_PASTED_CLASS : "isEditablePasted",
        GUIDE_STYLE_LAYER_IS_PASTABLE_CLASS : "isPastable",
        GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE : "copyModeCurrentEditable",
        GUIDE_STYLE_LAYER_COPY_MODE_ENABLED_ALERT_MESSAGE_CLASS : "styleCopyModeSwitchAlert",
        GUIDE_STYLE_LAYER_OVERLAY_BUTTON_COPY_TITLE : CQ.I18n.get("COPY STYLE"),
        GUIDE_STYLE_LAYER_OVERLAY_BUTTON_CLEAR_TITLE : CQ.I18n.get("CLEAR STYLE"),
        GUIDE_STYLE_LAYER_OVERLAY_BUTTON_PASTE_TITLE : CQ.I18n.get("APPLY STYLE"),
        GUIDE_STYLE_LAYER_OVERLAY_BUTTON_CLASS : "af-overlay-component-button",
        GUIDE_STYLE_LAYER_OVERLAY_CANCEL_BUTTON_CLASS : "af-overlay-component-cancel",
        GUIDE_STYLE_LAYER_OVERLAY_CLEAR_BUTTON_CLASS : "af-overlay-component-clear",
        GUIDE_STYLE_LAYER_OVERLAY_COPY_BUTTON_CLASS : "af-overlay-component-copy",
        GUIDE_STYLE_LAYER_OVERLAY_PASTE_BUTTON_CLASS : "af-overlay-component-paste",
        GUIDE_STYLE_LAYER_SINGLE_OVERLAY_BUTTON_CLASS : "af-overlay-component-button-single",
        GUIDE_STYLE_LAYER_OVERLAY_HIDDEN_BUTTON_CLASS : "af-overlay-component-button-hidden",
        GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID : "af-overlay-component",
        GUIDE_STYLE_LAYER_SELECTOR_OVERLAY_ID : "af-overlay-selector",
        GUIDE_STYLE_LAYER_HIDE_COMPONENT_OVERLAY_CLASS : "af-overlay-component-hide",
        GUIDE_STYLE_LAYER_COPIED_EDITABLE_CLASS : "isCopiedEditable",
        GUIDE_STYLE_LAYER_COPY_MODE_OVERLAY_CLASS : "copyModeOverlay"
    };

}(window.guidelib.touchlib, window.guidelib.touchlib.styleLayer, this));
