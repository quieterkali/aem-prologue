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
    /*
    *   Style editors (Theme & Inline) specific constants
    *
    */
;(function (window, _, $, constants, undefined) {
    constants.FIELD_PLACEHOLDER = CQ.I18n.get("Set");  //Empty Text Placeholder
    constants.EMDASH = "\u2014";
    constants.LINK_OFF = "linkOff";     //icon for link open
    constants.LINK_ON = "link";         // icon for link
    constants.LINK_ON_TITLE = CQ.I18n.get("Edit simultaneously"); // title for linkOn
    constants.LINK_OFF_TITLE = CQ.I18n.get("Edit individually"); // title for linkOff
    constants.CHEVRON_DOWN = "chevronDown"; //icon for chevron Down
    constants.DEFAULT_PROPERTY_SHEET_PATH = "/mnt/overlay/fd/af/components/stylePropertySheet/common"; //default property sheet
    constants.STYLE_PROPERTY_SHEET_CONTAINER = "style-propertySheetContainer";
    constants.ASSETS_LOCATION = "assets"; // assets folder name.
    constants.CSS_OVERIDE_WRAPPER_SELECTOR = ".cssOverridesWrapper"; //cssOverridesWrapper Element Selector
    constants.BEFORE_PSEUDO_ELEMENT_WRAPPER_SELECTOR = ".beforePseudoElementWrapper"; //beforePseudoWrapper Element Selector
    constants.AFTER_PSEUDO_ELEMENT_WRAPPER_SELECTOR = ".afterPseudoElementWrapper";  //afterPseudoWrapper Element Selector
    constants.HIDDEN_CLASS = "hide";
    constants.UNDO_CLASS = "styleUndo"; //undo button class.
    constants.REDO_CLASS = "styleRedo"; //redo button class.
    constants.RAW_CSS_ID = "styleRawCss"; //id for raw css Style Tag.
    constants.SIMULATE_SUCCESS_SELECTOR = ".simulateSuccess"; // selector for the simulate success switch.
    constants.SIMULATE_ERROR_SELECTOR = ".simulateError"; // selector for the simulate error switch.
    constants.VALIDATION_ERROR_MESSAGE = "Validation error needs to be resolved before navigating away.";
    constants.PROPERTY_SHEET_MASK_BUTTON_CLASS = "stylePropertySheetMaskButton"; // Property Sheet Mask Button Class.
    constants.PROPERTY_SHEET_CSS_PROPERTY_CLASS = "propertySheetCssProperty"; // Properties visisble on property sheet class.
    constants.SYMMETRIC_BUTTON_CLASS = "symmetricFieldButton"; // symmetric field button class.
    constants.MASK_ON_ICON = "viewOn"; // Icon of mask on button.
    constants.MASK_ON_CLASS = "maskOn"; // class when masked.
    constants.MASK_OFF_CLASS = "maskOff"; // class when masked.
    constants.MASK_OPERATION = "mask"; // Operation Name for mask.
    constants.UNMASK_OPERATION = "unmask"; // Operation Name for unmask.
    constants.MASK_PROPERTY_NAME = "mask"; // mask node property name extension for storing mask list.
    constants.SEARCHBOX_CLASS_SELECTOR = ".sidepanel-tree-searchField";
    constants.OVERLAY_SELECTOR_ID = "#af-overlay-selector";
    constants.OVERLAY_EDIT_BUTTON_CLASS = ".af-overlay-selector-edit:visible";
    constants.OVERLAY_PARENT_BUTTON_CLASS = ".af-overlay-selector-parent:visible";
    constants.STYLE_LAYER_CANCEL_BUTTON = "#styleCancelButton";
    constants.SIDE_PANEL_STYLE_SELECTOR = "#guideStyleLayerSidePanel";
    constants.MULTI_VALUE_FIELD_MASK_BUTTON_CLASS = "style-multifield-item-mask";
    constants.ASSET_LIBRARY_NODE_NAME = "assetLibrary";
    constants.JCR_PRIMARY_TYPE = "jcr:primaryType";
    constants.JCR_NODE_TYPE_NTUNSTRUCTURED = "nt:unstructured";
    constants.TEXT_STYLE_SAVE_BUTTON_SELECTOR = ".textStylesSaveButton";
    constants.TEXT_STYLE_SAVE_POPOVER_SELECTOR = ".textStylesSavePopover";
    constants.TEXT_ACCORDION_SELECTOR = ".stylePropertySheetText";
    constants.PROPERTY_SHEET_SELECTOR = "#style-propertysheet";
    constants.COLOR_INPUT_SELECTOR = "coral-colorinput";
    constants.TEXT_STYLE_SAVE_INPUT_SELECTOR = ".textStylesSaveInput";
    constants.JCR_CONTENT_NODE_NAME = "jcr:content";
    constants.NO_ASSET_VALUE = "none";
    constants.CSS_PROPERTY_DATA_PROPERTY = "csspropertyname";
    constants.TEXT_STYLE_SAVE_INPUT_DEFAULT_VALUE = CQ.I18n.get("Responsive Panel Title");
    constants.RECENT_USED_TEXT_STYLE_DEFAULT_TITLE = CQ.I18n.get("Recently used text style");
    constants.RECENT_USED_COLOR_DEFAULT_TITLE = CQ.I18n.get("Recently Used Color");
    constants.COLORPICKER_DEFAULT_COLOR_INPUT_ITEM_SELECTOR = "div[handle='defaultPalette'] coral-colorinput-item";
    constants.DEFAULT_ERROR_MESSAGE_HEADING_LOC = CQ.I18n.get("Unexpected Exception");
    constants.DEFAULT_ERROR_MESSAGE_LOC = CQ.I18n.get("There is some error at the server.");
    constants.GUIDE_CONTAINER_RELATIVE_PATH = "jcr:content/guideContainer";
    constants.THEME_PATH_PROPERTY_NAME = "themePath";
    constants.BACKGROUND_POPOVER_FIELDS_SELECTOR = ".style-imagepopover [data-mvfield-elementtype='popoverField']";
    constants.IMAGE_POPOVER_SELECTOR = ".style-imagepopover";
    constants.POPOVER_ID_DATA_ATTRIBUTE = "mvfield-elementid";
    constants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY = "data";
    constants.ASSET_LIBRARY_DELETE_ERROR_MESSAGE = CQ.I18n.get("Unable to delete asset from the server");
    constants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR = ".assetLibraryImagesSelect";
    constants.ASSET_LIBRARY_MANAGEMENT_DIALOG_PATH = "/mnt/overlay/fd/af/content/editors/theme/jcr:content/content/items/content/assetLibraryManagementDialog";
    constants.ASSET_LIBRARY_MANAGEMENT_DIALOG_CLASS = "assetLibraryManagementDialog";
    constants.ASSET_LIBRARY_IMAGES_SAVE_POPOVER_SELECTOR = ".assetLibraryImagesSavePopover";
    constants.ASSET_LIBRARY_IMAGES_SAVE_INPUT_SELECTOR = ".assetLibraryImagesSaveInput";
    constants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR = ".assetLibraryImagesSaveButton";
    constants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME = "textStyles";
    constants.ASSET_LIBRARY_COLORS_NODE_NAME = "colors";
    constants.ASSET_LIBRARY_IMAGES_NODE_NAME = "images";
    constants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME = "imageSrc";
    constants.ASSET_LIBRARY_COLORS_NODE_NAME = "colors";
    constants.ASSET_LIBRARY_PERSISTENCE_MAP_KEY = "af_AssetLibrary";
    constants.ASSET_LIBRARY_PERSISTENCE_MAP_VALUE = "recentlyUsedStyles";
    constants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME = "cssProperties";
    constants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME = "uiProperties";
    constants.ASSET_LIBRARY_TITLE_PROPERTY_NAME = "jcr:title";
    constants.ASSET_LIBRARY_THEME_RELATIVE_PATH = "/renditions/theme-json/jcr:content/assetLibrary";
    constants.ASSET_LIBRARY_TEXT_STYLE_SELECT_DEFAULT_TITLE = CQ.I18n.get("Select");
    constants.ASSET_LIBRARY_DEFAULT_COLORS_TITLE = "Default Color";
    constants.ASSET_LIBRARY_SAVED_COLORS_TITLE = "Saved Color";
    constants.ASSET_LIBRARY_DEFAULT_COLORS_ACCORDION_TITLE = CQ.I18n.get("Default Colors");
    constants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_TITLE = CQ.I18n.get("Saved Colors");
    constants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_TITLE = CQ.I18n.get("Recently Used Colors");
    constants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY = "imageName";
    constants.ASSET_LIBRARY_RECENTLY_USED_IMAGE_STYLE_TITLE = CQ.I18n.get("Recently used image style");
    constants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_TABLE_SELECTOR = ".textStyleManagementTable";
    constants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR = ".assetLibraryTextStylesSelect";
    constants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_TABLE_SELECTOR = ".imageStyleManagementTable";
    constants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_DELETE_BUTTON = ".assetLibraryManagementTextStyleDeleteButton";
    constants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_DELETE_BUTTON = ".assetLibraryManagementImageStyleDeleteButton";
    constants.ASSET_LIBRARY_COLOR_MANAGEMENT_DELETE_BUTTON = ".assetLibraryManagementColorsDeleteButton";
    constants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_CLASS = "colorInputRecentlyUsedColorsAccordion";
    constants.ASSET_LIBRARY_DEFAULT_COLORS_ACCORDION_CLASS = "colorInputDefaultColorsAccordion";
    constants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_CLASS = "colorInputSavedColorsAccordion";
    constants.ASSET_LIBRARY_COLORS_ID_ATTRIBUTE = "colorId";
    constants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS = "assetLibraryColorSaveButton";
    constants.ASSET_LIBRARY_COLOR_MANAGEMENT_TABLE_SELECTOR = ".colorsManagementTable";
    constants.ASSET_LIBRARY_COLOR_VALUE_PROPERTY = "background-color";
    constants.COLOR_INPUT_CUSTOM_SWATCH_CLASS = "styleCustomColorSwatch";
    constants.COLOR_INPUT_SWATCH_TAG = "coral-colorinput-swatch";
    constants.COLOR_INPUT_CUSTOM_NO_COLOR_SWATCH_CLASS = "styleCustomNoColorSwatch";
    constants.COLOR_INPUT_TAG = "coral-colorinput";
    constants.CSS_BACKGROUND_PROPERTY = "background";
    constants.UI_BACKGROUND_PROPERTY = "backgroundContainer";
    constants.BACKGROUND_UPLOAD_TYPE_VALUE = "upload";
    constants.BACKGROUND_SAVED_ASSET_TYPE_VALUE = "savedImageStyle";
    constants.BACKGROUND_RECENTLY_USED_ASSET_TYPE_VALUE = "recentlyUsedImageStyle";
    constants.BACKGROUND_ABSOLUTE_URL_PROPERTY = "absoluteUrl";
    constants.BACKGROUND_TYPE_PROPERTY = "type";
    constants.THEME_CLIENTLIB_PATH_PROPERTY = "themeClientlibPath";
    constants.THEME_EDITOR_NAME = "Theme";
    constants.STYLE_EDITOR_NAME = "Style";
    constants.BACKGROUND_DELETE_BUTTON_SELECTOR = ".style-backgroundTable [data-mvfield-elementtype='button-deleteItem']";
    constants.MANAGE_ASSET_LIBRARY_BUTTON = ".editor-PageInfo-action.manageAssetLibrary";
    constants.STYLE_SAVE_BUTTON_ID = "styleSaveButton";
    constants.COLOR_INPUT_SLIDER_TAG = "coral-colorinput-slider";
    constants.SELECTOR_OVERLAY_ACTION_BUTTON_SELECTOR = '#af-overlay-selector-text';
    constants.SELECTOR_OVERLAY_TOP_SELECTOR = '.af-overlay-selector-top';
    constants.SELECTOR_OVERLAY_LEFT_SELECTOR = '.af-overlay-selector-left';
    constants.SELECTOR_OVERLAY_RIGHT_SELECTOR = '.af-overlay-selector-right';
    constants.SELECTOR_OVERLAY_BOTTOM_SELECTOR = '.af-overlay-selector-bottom';
    constants.COMPONENT_OVERLAY_ACTION_BUTTON_SELECTOR = '#af-overlay-component-text';
    constants.COMPONENT_OVERLAY_TOP_SELECTOR = '.af-overlay-component-top';
    constants.COMPONENT_OVERLAY_LEFT_SELECTOR = '.af-overlay-component-left';
    constants.COMPONENT_OVERLAY_RIGHT_SELECTOR = '.af-overlay-component-right';
    constants.COMPONENT_OVERLAY_BOTTOM_SELECTOR = '.af-overlay-component-bottom';
    constants.HIDE_ALERT_CLASS = "hideAlertComponentChange";
    constants.ASSET_LIBRARY_RECENTLY_USED_STYLE_LABEL = "Recently Used Style";
    constants.ASSET_LIBRARY_SAVED_STYLE_LABEL = "Saved Style";
}(this, window._, $, window.guidelib.touchlib.style.constants));
