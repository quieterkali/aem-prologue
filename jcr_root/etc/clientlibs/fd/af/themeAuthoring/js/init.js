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

;(function (_, $, theme, style, undefined) {

    var styleVars = style.vars,
        styleUtils = style.utils,
        themeUtils = theme.utils,
        touchlibConstants = guidelib.touchlib.constants,
        styleAssetLib = style.assetLibrary,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetLibUtils = styleAssetLib.utils,
        init = function () {
            Granite.author.ui.helpers.wait();
            styleVars.themeName = $('[data-theme-name]').data('theme-name');
            themeUtils.addAdditionalStyles();
            style.initializeVars();
            themeUtils.initializeThemeVars();
            themeUtils.initializeObjectTree();
            $('.editor-GlobalBar-pageTitle').hide();
        };

    init();

    //initialize the theme when the editor is loaded
    $(document).on('cq-editor-loaded', function () {
        $('.editor-GlobalBar-pageTitle').html(CQ.shared.XSS.getXSSValue(styleVars.themeName)).show();
        theme.initialize();
    });

    $(document).on('style-propertysheet-created', function (e) {
        styleUtils.initializeAssetLibrary(e.isFirstPropertySheetLoaded);
    });

    //this is a workaround - needed to handle the custom form option in theme editor
    $(document).on("cq-page-info-loaded", function (event) {
        Granite.author.page = Granite.author.page || {};
        Granite.author.pageInfo = event.pageInfo;
    });

    //TODO: These variable need to be renamed to be more readable + move selectors to constants
    var $leftRail = $("[data-styleobjectname=themeLeftRail]");
    var $sidePanelHeader = $(".styleSidePanelHeader");
    var $leftRailHeader = $leftRail.find("coral-anchorbutton-label");
    var $styleCancelButton = $sidePanelHeader.find(".styleCancelButton");
    var $styleSaveButton = $sidePanelHeader.find(".styleSaveButton");
    var $styleBreakPointInfoHeader = $(".styleBreakPointInfoHeader");
    var $themeAlertSelectorChange = $(".styleSelectorChangeAlert");

    //TODO: The show hide is too complicated, ideally only parent DIV should be shown and hidden
    $styleCancelButton.on("click.style.propertysheet.actions", function () {
        $themeAlertSelectorChange.stop(true, true).addClass("hideAlertComponentChange").css("opacity", "0");
        if (styleVars.isPropertySheetChanged) {
            styleUtils.restorePropertySheetBackupJson(styleVars.json, styleVars.currentComponent, styleVars.currentSelector);
        }
        styleUtils.clearPropertySheetBackupJson();
        $("." + theme.constants.OBJECT_HIERARCHY_CONTAINER_CLASS).show();
        styleUtils.hidePropertySheetContainer();
        theme.utils.highlightStylableElements(styleVars.currentComponent, styleVars.currentSelector);
        styleVars.currentSelector = "";
        styleVars.currentComponent = "";
        style.utils.clearPropertySheetDirtyFlag();
        var $overlaySelectedButton = $(".overlay-active.af-overlay-selector-button.af-overlay-selector");
        if ($overlaySelectedButton) {
            $overlaySelectedButton.removeClass('overlay-active');
        }
        styleUtils.clearPreprocessPropertiesJson();
        styleAssetLibUtils.clearCurrentStyles();
    });

    $styleSaveButton.on("click.style.propertysheet.actions", function () {
        styleUtils.propertySheetSaved();
    });

    //avoid the default submit (this also blocks submit on pressing enter key)
    $("#themeEditorForm").on("submit.style.propertysheet.actions",
        function (e) {
            e.preventDefault();
        }
    );

}(window._, $, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
