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

;(function (_, $, theme, style) {

    var styleConstants = style.constants,
        styleUtils = style.utils,
        styleVars = style.vars,
        themeConstants = theme.constants,
        themeUtils = theme.utils,
        styleAssetLib = style.assetLibrary,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetLibUtils = styleAssetLib.utils,
        themeVars = theme.vars;

    styleUtils.getSelectorMetaData = function (component, selector, property) {
        if (!(component && selector && property)) {
            return;
        }
        componentObj = theme.mappings.components[component];
        if (!componentObj && theme.componentMappings[component]) {
            component = theme.componentMappings[component];
            componentObj = theme.mappings.components[component];
        }
        if (componentObj) {
            selectorObj = componentObj[selector];
            if (!selectorObj) {
                selector = theme.selectorMappings[component][selector];
                if (selector) {
                    selectorObj = theme.mappings.components[component][selector];
                } else if (console) {
                    console.log("Unable to get data: " + component + ":" + selector + ":" + property);
                    return;
                }
            }
            return selectorObj[property];
        }
    };

    styleUtils.getStateMetaData = function (component, selector, state, property) {
        componentObj = theme.mappings.components[component];
        if (componentObj) {
            selectorObj = componentObj[selector];
            if (selectorObj) {
                statesObj = selectorObj.states[state];
                if (statesObj) {
                    return statesObj[property];
                }
            }
        }
    };

    /*
     * Set the asset library asset path.
     */
    styleUtils.setAssetLibraryPath = function () {
        styleAssetLibVars.assetLibraryPath = Granite.author.ContentFrame.contentURL + styleConstants.ASSET_LIBRARY_THEME_RELATIVE_PATH || "";
    };

    /*
     * Set the asset library Saved style json.
     */
    styleUtils.setAssetLibrarySavedStylesJson = function () {
        styleAssetLibVars.savedStylesJson = styleAssetLibUtils.generateSavedStyleList(styleVars.json[styleConstants.ASSET_LIBRARY_NODE_NAME] || {});
    };

    themeUtils.getJson = function () {
        if (!styleVars.json || !styleVars.json.breakpoints) {
            themeUtils.initializeJSON();
        }
        return styleVars.json;
    };
    /*
     * Initialise assets path
     */
    themeUtils.initializeAssetsPath = function () {
        var currentThemeClientlibsPath = $(".theme-metadata-properties").attr("data-theme-clientlibs-path");
        var currentThemeAssetsPath = currentThemeClientlibsPath + "/" + styleConstants.ASSETS_LOCATION;
        styleVars.styleAssetsPrefixPath = currentThemeAssetsPath;
        styleVars.styleAssetsRelativePath = themeConstants.ASSETS_RELATIVE_PATH;
    };

    themeUtils.getContentFrame = function () {
        return document.getElementById('ContentFrame');
    };

    themeUtils.getContentWindow = function () {
        if (themeUtils.getContentFrame()) {
            return themeUtils.getContentFrame().contentWindow;
        }
        return null;
    };

    styleUtils.propertySheetUpdated = function () {
        themeUtils.updateSelectorStyle(styleVars.currentComponent, styleVars.currentSelector);
    };

    styleUtils.propertySheetSaved = function () {
        if (!style.vars.isPropertySheetChanged) {
            return ;
        }
        var $themeAlertSelectorChange = $(".styleSelectorChangeAlert");
        $themeAlertSelectorChange.stop(true, true).addClass("hideAlertComponentChange").css("opacity", "0");
        if (!styleVars.uirestrictions.blockPropertySheetSave) {
            styleUtils.closeAllOpenPopovers();
            styleUtils.preSaveProcessor(styleUtils.preSavePostHandler, styleUtils.getAlertServerErrorFn(theme.constants.SAVE_THEME_ERROR_MESSAGE));
        }
    };

    //get current selector display name.
    styleUtils.getLeftRailHeaderText = function () {
        return styleUtils.getSelectorMetaData(styleVars.currentComponent, styleVars.currentSelector, "name");
    };

    styleUtils.saveRawCSS = function () {
        var rawCss = styleVars.rawCSSEdit.getValue(),
            lintResult = CSSLint.verify(rawCss, {});
        if (lintResult.messages.length > 0) {
            if (console) {
                console.log("[Validation Error] Refer to Theme CSS for validation error details.");
            }
        }
        styleVars.json.rawCss = rawCss;
        themeUtils.saveRawCSS(themeUtils.applyThemeToAF);
        $("#rawCSSSaveButton").attr("disabled", "true");
    };

    /**
     * utility method to apply raw css update to the form used for preview.
     *
     */
    themeUtils.updateRawCssStyle = function () {
        // calling applyThemeToAf with params isAllSelectorCssGeneration = false, isRawCssChanged = true.
        _updateStyleTags(false, true);
    };

    /**
     * utility method to apply complete form css update to the form used for preview.
     */
    themeUtils.applyThemeToAF = function () {
        // calling applyThemeToAf with params isAllSelectorCssGeneration = true, isRawCssChanged = false.
        _updateStyleTags(true, false);
    };

    /**
     * utility method to apply selector css update to the form used for preview.
     */
    themeUtils.updateSelectorStyle = function (component, selector) {
        // calling applyThemeToAf with params isAllSelectorCssGeneration = false, isRawCssChanged = false.
        _updateStyleTags(false, false, component, selector);
    };

    /**
     * injects raw css in the rawCss style tag.
     */
    themeUtils.injectRawCss = function () {
        var rawCss = styleUtils.generateRawCss();
        $(themeUtils.getContentFrame()).contents().find("#" + styleConstants.RAW_CSS_ID).html(rawCss);
    };

    /**
     * Private method to apply the theme to the form used for preview.
     * @param {boolean} isAllSelectorCssGeneration wheather to generate css for all selectors.
     * @param {boolean} isRawCssChanged  wheather to generate css for raw css.
     * @example <caption>Updating full style of contentArea</caption>
     * _updateStyleTags(true, false);
     * @example <caption>Updating raw css style of content area.</caption>
     * _updateStyleTags(false, true);
     * @example <caption>Updating a particular selector style of content area.</caption>
     * _updateStyleTags(false, false);
     */
    var _updateStyleTags = function (isAllSelectorCssGeneration, isRawCssChanged, component, selector) {
        var $contentFrame = $(themeUtils.getContentFrame()).contents(),
            $themeIntegrationElement = $contentFrame.find('#themeIntegrationElement');
        if (isAllSelectorCssGeneration) {
            $themeIntegrationElement.html(styleUtils.generateCssString(true));
            if (styleVars.json.rawCss) {
                themeUtils.injectRawCss();
            }
        } else if (isRawCssChanged) {
            //raw css style tag will always be present.
            themeUtils.injectRawCss();
        } else {
            var currentComponent,
                currentSelector,
                currentSelectorId,
                cssString;
            if (component && selector) {
                currentComponent = component;
                currentSelector = selector;
            } else {
                currentComponent = styleVars.currentComponent;
                currentSelector = styleVars.currentSelector;
            }
            currentSelectorId = currentComponent.replace(/\//g, "_") + "_" + currentSelector.replace(/\//g, "_") + "_";
            cssString = styleUtils.generateSelectorCssString(currentComponent, currentSelector);
            if ($themeIntegrationElement.children('#' + currentSelectorId).length) {
                $themeIntegrationElement.children('#' + currentSelectorId).html(cssString);
            } else {
                var selectorStyleTag = styleUtils.wrapInStyleTag(cssString, currentSelectorId);
                //this is done to make sure raw css style tag is at the last among all style tags.
                $themeIntegrationElement.append(selectorStyleTag);
            }
        }
        if (style.overlay.repositionOverlay) {
            style.overlay.repositionOverlay(styleVars.currentSelectedOverlayTarget, true);
        }
    };

    var getOverlayStyling = function () {
        var cssStyle = "<style id='overlayFieldsHighlight'>\n.overlayFieldsHighlight{\n" +
            "outline: 2px solid #46C8DC;" +
            "outline-offset: 1px;" +
            "\n}\n</style>";

        return cssStyle;
    };
    /*
     * Utility method to retrieve the Theme definition JSON from the server.
     */
    themeUtils.migrateTheme = function (callback) {
        var urlPath = $("[data-theme-path]").data("theme-path");
        $.ajax({
            url : Granite.HTTP.externalize("/libs/fd/foundation/gui/content/migration/startmigration.assets.json" + urlPath),
            type : "POST",
            async : false,
            cache : false,
            data : {
                "operation" : "migrate"
            },
            success : function (response) {
                if (callback) {
                    callback(theme);
                }
            },
            error : function (response) {
                if (console) {
                    console.log("Error: " + response);
                }
            }
        });
    };

    /*
     * Utility method to retrieve the Theme definition JSON from the server.
     */
    themeUtils.getThemeJson = function () {
        var pathSuffix = "/renditions/theme-json/jcr:content.infinity.json";
        $.ajax({
            url : Granite.HTTP.externalize(Granite.author.ContentFrame.contentURL + pathSuffix),
            type : "GET",
            async : false,
            cache : false,
            success : function (response) {
                styleVars.json = response;
                themeVars.themeComponentsList = Object.keys(styleVars.json.components);
                if (styleVars.json.rawCss && styleVars.json.rawCss["jcr:primaryType"] === "nt:file") {
                    themeUtils.getRawCss();
                } else {
                    styleUtils.initializeBreakpointInfo();
                }
                styleUtils.initializeAssetLibrary(true);
            },
            error : function (response) {
                if (console) {
                    console.log("Error: " + response);
                }
            }
        });
    };

    /*
     * Utility method to retrieve the Theme definition JSON from the server.
     */
    themeUtils.getRawCss = function () {
        var pathSuffix = "/renditions/theme-json/jcr:content/rawCss/jcr:content/jcr:data";
        $.ajax({
            url : Granite.HTTP.externalize(Granite.author.ContentFrame.contentURL + pathSuffix),
            type : "GET",
            async : false,
            cache : false,
            success : function (response) {
                styleVars.json.rawCss = response;
                styleUtils.initializeBreakpointInfo();
            },
            error : function (response) {
                if (console) {
                    console.log("Debug: " + response);
                }
            }
        });
    };

    /*
     * Utility method to get new ID from old ID/path.
     */
    themeUtils.getUpdatedID = function (componentName, oldID) {
        var updatedID = oldID;
        var components = guidelib.touchlib.theme.mappings.components;
        if (components[componentName]) {
            if (components[componentName][oldID]) {
                return updatedID;
            }
            _.each(components[componentName], function (selector, selectorName) {
                if (selector.path === oldID) {
                    updatedID = selectorName;
                }
            });
        }
        return updatedID;
    };

    /*
     * Utility method to save the the current state of Theme JSon to the server.
     */
    themeUtils.saveAFTheme = function (callback, component, selector) {
        var url;
        if (!component && !selector) {
            component = styleVars.currentComponent;
            selector = styleVars.currentSelector;
        }
        var pathSuffix = "/renditions/theme-json/jcr:content/components/",
            contentData = styleVars.json.components[component][selector],
            dataValue = {
                "themePath" : Granite.HTTP.internalize(Granite.author.ContentFrame.contentURL),
                "_charset_" : "utf-8",
                ":operation" : "af:saveStyleOperation",
                ":contentType" : "json",
                ":replaceProperties" : "true"
            };
        // This check is written to handle custom components as they wont be present on the basic theme node.
        if (!_.contains(themeVars.themeComponentsList, component)) {
            var contentJson = {},
                componentPath,
                newComponentCallback = function () {
                    themeVars.themeComponentsList.push(component);
                };
            url = Granite.HTTP.externalize(Granite.author.ContentFrame.contentURL +
                            pathSuffix +
                            component);
            // loop needs to be written as map is reverse with key containing the path and value containing id.
            _.find(theme.componentMappings, function (value, key) {
                if (value == component) {
                    componentPath = key;
                    return true;
                }
            });
            contentJson.component = componentPath;
            if (contentData) {
                contentJson[selector] = contentData;
            }
            dataValue[":content"] = JSON.stringify(contentJson);
        } else {
            url = Granite.HTTP.externalize(Granite.author.ContentFrame.contentURL +
                                  pathSuffix +
                                  component +
                                  "/" + selector);
            if (contentData) {
                dataValue[":content"] = JSON.stringify(contentData);
            }
        }
        $.ajax({
            url : url,
            type : "POST",
            cache : false,
            data : dataValue,
            success : function (response) {
                if (callback) {
                    callback();
                }
                if (newComponentCallback) {
                    newComponentCallback();
                }
            },
            error : styleUtils.getAlertServerErrorFn(themeConstants.SAVE_THEME_ERROR_MESSAGE)
        });
    };

    themeUtils.saveRawCSS = function (callback) {
        if (styleVars.json.rawCss) {
            var urlPath = Granite.HTTP.getPath($(themeUtils.getContentFrame()).attr("src")),
                pathSuffix = "/renditions/theme-json/jcr:content";
            $.ajax({
                url : Granite.HTTP.externalize(Granite.author.ContentFrame.contentURL + pathSuffix),
                type : "POST",
                cache : false,
                data : {
                    "themePath" : Granite.author.ContentFrame.contentURL,
                    "_charset_" : "utf-8",
                    ":operation" : "af:saveStyleOperation",
                    ":replaceProperties" : "true",
                    ":contentType" : "json",
                    ":content" : '{"rawCss":{"jcr:content":{"jcr:primaryType":"nt:resource","jcr:data":' +
                            JSON.stringify(styleVars.json.rawCss) +
                            '}, "jcr:primaryType":"nt:file"}}}'
                },
                success : function (response) {
                    if (callback) {
                        callback();
                    }
                },
                error : function (response) {
                    var notificationInfo = {};
                    notificationInfo.content = CQ.I18n.getMessage("Unable to save the theme to the server.");
                    notificationInfo.heading = CQ.I18n.getMessage("Unexpected Exception");
                    notificationInfo.closable = false;
                    notificationInfo.type = Granite.author.ui.helpers.PROMPT_TYPES.ERROR;
                    Granite.author.notifications.notify(notificationInfo);
                }
            });
        }
    };

    themeUtils.initializeJSON = function () {
        if (!styleVars.json) {
            styleVars.json = {};
        }
    };

    styleUtils.getLastModifiedTime = function () {
        if (styleVars.json) {
            return styleVars.json.lastModifiedTime;
        }
    };

    themeUtils.highlightStylableElements = function (oldComponent, oldSelector, newComponent, newSelector) {
        var $contentFrameContents = $(themeUtils.getContentFrame()).contents();
        var oldSelector = styleUtils.getSelectorMetaData(oldComponent, oldSelector, "cssSelector");
        var newSelector = styleUtils.getSelectorMetaData(newComponent, newSelector, "cssSelector");
        if (oldSelector != newSelector) {
            if (oldSelector) {
                $contentFrameContents.find(oldSelector).removeClass("overlayFieldsHighlight");
            }
            if (newSelector) {
                $contentFrameContents.find(newSelector).addClass("overlayFieldsHighlight");
            }
        }
    };

    themeUtils.focusStyllableElement = function (component, selector) {
        var $contentFrameContents = $(themeUtils.getContentFrame()).contents(),
            cssSelector = styleUtils.getSelectorMetaData(component, selector, "cssSelector"),
            $selectedElement = $contentFrameContents.find(cssSelector);
        if ($selectedElement.length) {
            $selectedElement = $selectedElement.eq(0);
            style.overlay.repositionOverlay($selectedElement.get(0));
            var $selectedElementComponent = $selectedElement.closest("[id^='guideContainer'][id$='__']");
            if ($selectedElementComponent.length) {
                var selectedElementComponentId = $selectedElementComponent.attr("id"),
                    afwindow = window._afAuthorHook._getAfWindow();
                window.guidelib.author.AuthorUtils.setAuthoringFocus(selectedElementComponentId, afwindow.document);
                var $widget = $selectedElementComponent.find("input,select,textarea,button");
                if ($widget.length) {
                    $widget = $widget.eq(0);
                    $widget.focus();
                } else {
                    afwindow.$("#" + selectedElementComponentId).focus();
                }
            } else {
                return;
            }
        }
    };

    themeUtils.registerClickAction = function () {
        $('.themeObjectEditIcon').on('click.theme.objectstree', function (ev) {
            ev.stopImmediatePropagation();
            var componentName = $(ev.target).data("themecomponentname");
            var selectorName = $(ev.target).data("themeselectorname");
            //hiding elements
            $("." + themeConstants.OBJECT_HIERARCHY_CONTAINER_CLASS).hide();
            //displaying elements
            styleUtils.showPropertySheetContainer();
            if (componentName != styleVars.currentComponent || selectorName != styleVars.currentSelector) {
                themeUtils.highlightStylableElements(styleVars.currentComponent, styleVars.currentSelector, componentName, selectorName);
                themeUtils.focusStyllableElement(componentName, selectorName);
                styleVars.currentComponent = componentName;
                styleVars.currentSelector = selectorName;
                styleUtils.updateSelector();
            }
            styleUtils.takePropertySheetBackup(styleVars.json, styleVars.currentComponent, styleVars.currentSelector);
            style.ui.resetAssetLibraryWidgets();
        });
    };

    themeUtils.initializeObjectTree = function () {
        var contentWindow = themeUtils.getContentWindow(),
            pagePath = $('[data-theme-form-path]').data('theme-form-path'),
            ajaxUrl = Granite.HTTP.externalize(pagePath + "/jcr:content.theme.styleconfig");
        $.ajax({
            url : ajaxUrl,
            success : function (result) {
                theme.stylableObjectsJson = result;
                theme.stylableObjects.initializeStylableObjectsTree();
                styleVars.metaInfoLoaded = true;
                theme.initializeOnCompleteLoad();

                $(".sidepanel-tree-expand-buttton").click();
            },
            failure : function (result) {
                if (console) {
                    console.log("Error: Unable to retrieve style config: " + result);
                }
            }
        });
    };

    themeUtils.onOverlaySelection = function (component, selector) {
        $("." + themeConstants.OBJECT_HIERARCHY_CONTAINER_CLASS).hide();
        styleUtils.showPropertySheetContainer();
        if (component != styleVars.currentComponent || selector != styleVars.currentSelector) {
            themeUtils.highlightStylableElements(styleVars.currentComponent, styleVars.currentSelector, component, selector);
            styleVars.currentComponent = component;
            styleVars.currentSelector = selector;
            styleUtils.updateSelector();
            styleUtils.takePropertySheetBackup(styleVars.json, styleVars.currentComponent, styleVars.currentSelector);
        }
        style.ui.resetAssetLibraryWidgets();
    };

    styleUtils.restorePropertySheetUndoRedoData = function (data, isUndo) {
        var component = data.component;
        var selector = data.selector;
        if (component && selector && data) {
            if (isUndo) {
                if (data.undoJson) {
                    styleVars.json.components[component][selector] = data.undoJson;
                } else {
                    delete styleVars.json.components[component][selector];
                }
            } else {
                if (data.redoJson) {
                    styleVars.json.components[component][selector] = data.redoJson;
                } else {
                    delete styleVars.json.components[component][selector];
                }
            }

        }
        themeUtils.updateSelectorStyle(component, selector);
        themeUtils.saveAFTheme(styleUtils.history.Manager.updatePersistence, component, selector);
    };

    /**
     * initialize asset library. It is different for inline and theme so kept in style namespace
     * but implemented differently.
     * A boolean is kept to ensure both property sheet and themejson is loaded .
     */
    styleUtils.initializeAssetLibrary = function (isFirstPropertySheetLoaded) {
        if (isFirstPropertySheetLoaded) {
            if (style.assetLibrary.canPopulateAssetLibrary) {
                styleUtils.setAssetLibraryVars();
                styleAssetLib.utils.assetLibraryInit();
            } else {
                style.assetLibrary.canPopulateAssetLibrary = true;
            }
        } else {
            styleAssetLib.utils.assetLibraryInit();
        }
    };

    /*
     * Save theme JSon in case the dirty flag is set. This is called when user interacts with the propertysheet and saves.
     * The theme is saved without check for dirty flag in case of Redo/Undo
     */
    themeUtils.saveThemeIfModified = function () {
        var cssString = styleUtils.generateSelectorCssString(styleVars.currentComponent, styleVars.currentSelector);
        lintResult = CSSLint.verify(cssString, {});
        if (lintResult.messages.length > 0) {
            if (console) {
                console.log("[Validation Error] Refer to Theme CSS for validation error details.");
            }
        }
        if (styleVars.isPropertySheetChanged) {
            styleVars.oldJson = undefined;
            if (styleVars.propertySheetBackupJson) {
                styleVars.oldJson = JSON.parse(JSON.stringify(styleVars.propertySheetBackupJson));
            }
            styleUtils.takePropertySheetBackup(styleVars.json, styleVars.currentComponent, styleVars.currentSelector);
            styleVars.newJson = undefined;
            if (styleVars.propertySheetBackupJson) {
                styleVars.newJson = JSON.parse(JSON.stringify(styleVars.propertySheetBackupJson));
            }
            theme.utils.saveAFTheme(postSaveHandler);
        } else {
            styleUtils.clearPropertySheetDirtyFlag();
        }
    };

    /**
     * Adding additional styles required in theme editor.
     */
    themeUtils.addAdditionalStyles = function () {
        //css for the removal of padding introduced in authoring by editor framework.
        var additionalStyleString =  "<style id='additionalStyles'>\n" +
                                     ".cq-Editable-dom--container, .aem-GridColumn.cq-Editable-dom--container {\npadding : 0px;\n}\n</style>";
        $(themeUtils.getContentFrame()).find("#overlayFieldsHighlight").after(additionalStyleString);
    };

    /**
     * Function to get the theme path in theme editor
     * TODO : this will changed once form manager add theme path attribute in themeeditor..
     */
    styleUtils.getThemePath = function () {
        return $(themeConstants.THEME_PATH_SELECTOR).attr(themeConstants.THEME_PATH_DATA_ATTRIBUTE);
    };

    /**
     * return current editor name.
     */
    styleUtils.getCurrentEditorName = function () {
        return styleConstants.THEME_EDITOR_NAME;
    };

    styleUtils.preSavePostHandler = function () {
        styleAssetLibUtils.updateRecentlyUsedStyles()
        .then(function () {
            theme.utils.saveThemeIfModified();
            style.ui.resetAssetLibraryWidgets();
            styleUtils.clearPreprocessPropertiesJson();
        }, styleUtils.getAlertServerErrorFn(themeConstants.SAVE_THEME_ERROR_MESSAGE));
    };
    var postSaveHandler = function () {
        // setting variable to know style is updated
        styleVars.isStyleUpdated = true;
        styleUtils.clearPropertySheetDirtyFlag();
        styleUtils.history.Manager.addStep({
            "component" : styleVars.currentComponent,
            "selector" : styleVars.currentSelector,
            "undoJson" : styleVars.oldJson,
            "redoJson" : styleVars.newJson
        });
    };

    themeUtils.initializeThemeVars = function () {
        themeVars.themeComponentsList = []; // List containing components whose styling are present in current theme.
    };

}(window._, $, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
