/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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
(function (guidetouchlib, Granite) {

    /**
     * Constants which is to be used across all layers in touch authoring
     * are defined here
     */
    guidetouchlib.constants = {
        AF_PREFIX_PATH : "/content/forms/af/",
        AEM_CONTENT_WRAPPER_ID : "ContentFrame",
        AEM_EDITOR_PANEL_CLASS : "editor-panel",
        GUIDE_TABLE_HEADER_RESOURCE_TYPE : "fd/af/components/tableHeader",
        GUIDE_TABLE_ROW_RESOURCE_TYPE : "fd/af/components/tableRow",
        GUIDE_TABLE_RESOURCE_TYPE : "fd/af/components/table",
        FORM_DATA_MODEL_TYPE_XFA : "xdp",
        FORM_DATA_MODEL_TYPE_XSD : "xsd",
        FORM_DATA_MODEL_TYPE_DD : "dd",
        FORM_DATA_MODEL_TYPE_LETTER : "letter",
        FORM_DATA_REFS : ["xdpRef", "xsdRef", "ddRef", "letterRef"],
        FORM_EDITOR_NAME : Granite.I18n.get("Form Editor"),
        THEME_EDITOR_NAME : Granite.I18n.get("Theme Editor"),
        TEMPLATE_EDITOR_NAME : Granite.I18n.get("Template Editor"),
        EDITOR_TITLE_SEPARATOR : " : ",
        ROOT_PANEL_TYPE : "fd/af/components/rootPanel",
        TOOLBAR_TYPE : "fd/af/components/toolbar",
        GUIDECONTAINER_WRAPPER_TYPE : "fd/af/components/guideContainerWrapper",
        GUIDECONTAINER_TYPE : "fd/af/components/guideContainer",
        PANEL_TYPE : "fd/af/components/panel",
        HIGHLIGHT_BORDER_WIDTH : 2,
        LEGACY_AF_SPEC_VERSION : "1.0",
        FD_VERSION : "fd:version",
        FD_TARGET_VERSION : "fd:targetVersion",
        LEGACY_CHECK : "legacyCheck",
        PANEL_CLASS_ARRAY : ["gridFluidLayout", "accordion", "wizard", "tabbedPanelLayout", "verticalTabbedPanelLayout"],
        PANEL_COMPONENT_PATH : "fd/af/components/panel",
        LAST_FOCUS_ITEM_ID : "guide.lastFocusItemId"
    };

    guidetouchlib.constants.coralclass = {
        CORAL_FORM_FIELD : ".coral-Form-field",
        CORAL_RICH_TEXT : ".coral-RichText",
        CORAL_SELECTLIST : ".coral-SelectList",
        CORAL_SELECTLIST_SUBLIST : ".coral-SelectList-sublist",
        CORAL_BUTTON : ".coral-Button",
        CORAL_BUTTON_QUIET : "coral-Button--quiet",
        CORAL_MULTIFIELD_REMOVE : ".coral-Multifield-remove",
        CORAL_TABPANEL_NAVIGATION : ".coral-TabPanel-navigation",
        CORAL_TABPANEL : ".sidepanel-tab",
        CORAL_COLORINPUT_PROPERTIES_SUBVIEW : ".coral-ColorInput-propertiesSubview"
    };

}(window.guidelib.touchlib, window.Granite));
