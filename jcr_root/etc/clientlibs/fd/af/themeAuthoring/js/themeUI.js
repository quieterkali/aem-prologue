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

    var themeConstants = theme.constants,
        styleUtils = style.utils,
        styleVars = style.vars,
        themeUtils = theme.utils,
        uirestrictions = styleVars.uirestrictions,
        stylePropertySheetContainerSelector = "#" + style.constants.STYLE_PROPERTY_SHEET_CONTAINER,
        styleAssetLib = style.assetLibrary || {},
        styleAssetLibVars = styleAssetLib.vars = styleAssetLib.vars || {},
        styleAssetLibUtils = styleAssetLib.utils || {},
        hideShowContentNode = function () {
            var $themeContentNode = $(".themeContent").closest("div");
            var cssSelector = styleUtils.getSelectorMetaData(styleVars.currentComponent, styleVars.currentSelector, "cssSelector");
            if (cssSelector && (cssSelector.indexOf(":before") > -1 || cssSelector.indexOf(":after") > -1)) {
                $themeContentNode.hide();
            } else {
                $themeContentNode.show();
            }
        };

    styleUtils.processSelectorUpdated = function () {
        hideShowContentNode();
        styleUtils.updateStateList("#style-stateName", styleVars.currentComponent, styleVars.currentSelector);
        styleVars.currentState = "default";
        style.ui.populatePropertySheet();
    };

    var removeClientlibStyleTag = function () {
        /* This function removes the style tag that is already present in the AF that is loaded in the content frame.
         So that only the css generated on runtime is applied to this AF */
        if (themeUtils.getContentFrame()) {
            var $iframe =  $(themeUtils.getContentFrame());
            $("#fdtheme-id-clientlibs link", $iframe.contents()).last().remove();
        }
    };

    theme.initializeOnCompleteLoad = function () {
        if (styleVars.pageLoaded == true && styleVars.metaInfoLoaded == true) {
            themeUtils.applyThemeToAF();
            removeClientlibStyleTag();
            theme.registerOverlay(theme.mappings, $(themeUtils.getContentFrame()).contents());
            themeUtils.registerClickAction();
            Granite.author.ui.helpers.clearWait();
        }
    };

    theme.initialize = function () {
        theme.setThemeTitle();
        //TODO: More cleanup should be possible for preview!!!
        if (Granite.author.layerManager.getCurrentLayerName() === "Theme Edit" || Granite.author.layerManager.getCurrentLayerName() == null) {
            var contentWindow = themeUtils.getContentWindow();
            themeUtils.initializeAssetsPath();
            guidelib.touchlib.utils.initializeWidgets(contentWindow.$('[data-af-widgetname]'), contentWindow.$);
            // this initializes the table component, specifically written to support mobile layouts in theme editor
            guidelib.touchlib.utils.initializeTable(contentWindow.$('.guideTableNode > table'), contentWindow.$);
            //move to promise
            var themeVersion = $("[data-theme-fd-version]").data("theme-fd-version");
            if (themeVersion && themeVersion === "1.0") {
                themeUtils.migrateTheme();
            }
            themeUtils.getThemeJson();
            styleVars.pageLoaded = true;
            theme.initializeOnCompleteLoad();
            style.registerKeyboardHotkeys();
            var themePath = Granite.HTTP.getPath($(themeUtils.getContentFrame()).attr("src"));
            //Register Redo/Undo
            styleUtils.history.Manager.init(undefined, themePath);
            styleUtils.registerUndoRedoEvents();
            styleUtils.loadDefaultPropertySheet();
            style.registerViewCSSHandler();
            style.registerViewCompleteCSSHandler();
            style.registerEditRawCSSHandler();
            guidelib.author.AuthorUtils.setAuthoringFocus(themeUtils.getContentWindow().$(themeConstants.ROOT_PANEL_SELECTOR).attr("id"),
                themeUtils.getContentWindow().document);
            style.registerErrorSimulationEvents();
        }
    };

    theme.setThemeTitle = function () {
        document.title = guidelib.touchlib.constants.THEME_EDITOR_NAME +
            guidelib.touchlib.constants.EDITOR_TITLE_SEPARATOR +
            styleVars.themeName;
    };

    $("#style-stateName").on("change.style.propertysheet.state", function (event) {
        if (!uirestrictions.blockStateChange) {
            styleVars.currentState = event.target.value;
            style.ui.populatePropertySheet();
        }
    });

}(window._, $, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
