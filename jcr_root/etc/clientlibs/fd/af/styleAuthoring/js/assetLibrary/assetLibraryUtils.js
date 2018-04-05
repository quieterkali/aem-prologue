/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function (_, $, style) {
    var styleAssetLib = style.assetLibrary,
        styleAssetLibUtils = styleAssetLib.utils,
        styleConstants = style.constants,
        styleVars = style.vars,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetLibUI = styleAssetLib.ui,
        styleAssetLibHistory = styleAssetLib.history,
        styleAssetLibManager = styleAssetLibHistory.manager,
        styleUtils = style.utils || {};
    /**
     * Initialize asset library like population asset library and registering events.
     */
    styleAssetLibUtils.assetLibraryInit = function () {
        styleAssetLibUI.initAssetLibraryUI();
        styleAssetLibUtils.populateAssetLibrary();
        styleAssetLibUI.registerAssetLibraryEventHandlers();
    };

    /**
     * Populate asset library Widgets with the saved styles.
     */
    styleAssetLibUtils.populateAssetLibrary = function () {
        styleAssetLibUtils.populateSavedStyles();
        styleAssetLibUtils.populateDefaultStyles();
    };

    /**
     * Populate asset library widgets with the recent used styles.
     */
    styleAssetLibUtils.populateRecentlyUsedStyles = function () {
        styleAssetLibUtils.populateRecentlyUsedTextStyles();
        styleAssetLibUtils.populateRecentlyUsedColors();
        styleAssetLibUtils.populateRecentlyUsedImageStyles();
    };

    /**
     * Populate asset library with the default styles.
     */
    styleAssetLibUtils.populateDefaultStyles = function () {
        styleAssetLibUtils.populateDefaultColors();
    };

    /**
     * populate recently used image styles.
     */
    styleAssetLibUtils.populateRecentlyUsedImageStyles = function () {
        var json = styleAssetLibVars.recentlyUsedStylesJson,
            imageStylesListString = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            imageStylesList = window.expeditor.Utils.getOrElse(json, imageStylesListString, []);
        styleAssetLibUI.addStyleUI(imageStylesList, styleAssetLibUI.addRecentlyUsedImageStyleUI);
    };

    /**
     * populate default colors.
     */
    styleAssetLibUtils.populateDefaultColors = function () {
        var json = styleAssetLibVars.defaultStylesJson,
            colorListString = styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME,
            colorsList = window.expeditor.Utils.getOrElse(json, colorListString, []);
        styleAssetLibUI.addStyleUI(colorsList, styleAssetLibUI.addDefaultColorsUI);
    };

    /**
     * populate select widget with the recent used text styles.
     */
    styleAssetLibUtils.populateRecentlyUsedTextStyles = function () {
        var json = styleAssetLibVars.recentlyUsedStylesJson,
            textStylesListString = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            textStylesList = window.expeditor.Utils.getOrElse(json, textStylesListString, []);
        styleAssetLibUI.addStyleUI(textStylesList, styleAssetLibUI.addRecentlyUsedTextStyleUI);
    };

    /**
     * populate color pickers with the recent used colors.
     */
    styleAssetLibUtils.populateRecentlyUsedColors = function () {
        var json = styleAssetLibVars.recentlyUsedStylesJson,
            colorListString = styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME,
            colorList = window.expeditor.Utils.getOrElse(json, colorListString, []);
        styleAssetLibUI.addStyleUI(colorList, styleAssetLibUI.addRecentlyUsedColorUI);
    };

    /**
     * population of widgets to populate saved text styles.
     */
    styleAssetLibUtils.populateSavedStyles = function () {
        styleAssetLibUtils.populateSavedTextStyles();
        styleAssetLibUtils.populateSavedImages();
        styleAssetLibUtils.populateSavedColors();
    };

    /**
     * populate saved colors accordion.
     */
    styleAssetLibUtils.populateSavedColors = function () {
        var json = styleAssetLibVars.savedStylesJson,
            colorListString = styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME,
            colorList = window.expeditor.Utils.getOrElse(json, colorListString, []);
        styleAssetLibUI.addStyleUI(colorList, styleAssetLibUI.addSavedColorsUI);
    };

    /**
     * populate select with the saved text styles.
     */
    styleAssetLibUtils.populateSavedTextStyles = function () {
        var json = styleAssetLibVars.savedStylesJson,
            textStylesListString = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            textStyles = window.expeditor.Utils.getOrElse(json, textStylesListString, []);
        styleAssetLibUI.addStyleUI(textStyles, styleAssetLibUI.addSavedTextStyleUI);
    };

    /**
     * populate select with the saved images.
     */
    styleAssetLibUtils.populateSavedImages = function () {
        var json = styleAssetLibVars.savedStylesJson,
            imagesListString = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            imageList = window.expeditor.Utils.getOrElse(json, imagesListString, []);
        styleAssetLibUI.addStyleUI(imageList, styleAssetLibUI.addSavedImageStyleUI, styleAssetLibUtils.preprocessSavedImageValue);
    };

    /**
     * Save text style .
     * @param {String} id - Id of the text style.
     * @param {String} title - Name of the text style.
     * @param {Array} cssPropertiesList - List of css Properties.
     * @param {Array} uiPropertiesList - List of ui Properties.
     */
    styleAssetLibUtils.saveTextStyle = function (id, title, cssPropertiesList, uiPropertiesList) {
        var styleType = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            styleId = id,
            textStyleJson = styleAssetLibUtils._createStyleJson(styleId, title, cssPropertiesList, uiPropertiesList),
            textStyleSaveButton = $(styleConstants.TEXT_STYLE_SAVE_BUTTON_SELECTOR).get(0),
            $textStylesSelect = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR),
            textStylesSelect = $textStylesSelect.get(0);
        if (_.isEmpty(textStyleJson[styleId][styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME]) || _.isEmpty(textStyleJson[styleId][styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME].trim())) {
            return;
        }
        styleAssetLibUtils.saveStyle(styleType, textStyleJson, styleAssetLibUtils.checkTextStylesEqualFn, styleAssetLibUI.addSavedTextStyleUI, styleAssetLibUI.removeRecentlyUsedTextStyleUI);
        textStyleSaveButton.set("disabled", "true");
        styleUtils.getMsDropDown(textStylesSelect).set("selectedIndex", 1);
    };

    /**
     * Save color.
     * @param {String} id - Id of the color.
     * @param {String} title - Name of the color.
     * @param {Array} cssPropertiesList - List of css Properties.
     * @param {Array} uiPropertiesList - List of ui Properties.
     */
    styleAssetLibUtils.saveColor = function (id, title, cssPropertiesList, uiPropertiesList, $colorInput) {
        var styleType = styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME,
            styleId = id,
            colorJson = styleAssetLibUtils._createStyleJson(styleId, title, cssPropertiesList, uiPropertiesList),
            colorInputSaveButton = $colorInput.find("." + styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS).get(0);
        styleAssetLibUtils.saveStyle(styleType, colorJson, styleAssetLibUtils.checkColorsEqualFn, styleAssetLibUI.addSavedColorsUI, styleAssetLibUI.removeRecentlyUsedColorsUI);
        colorInputSaveButton.set("disabled", "true");
    };

    /**
     * Save image style .
     * @param {String} id - Id of the image style.
     * @param {String} title - Name of the image style.
     * @param {Array} cssPropertiesList - List of css Properties.
     * @param {Array} uiPropertiesList - List of ui Properties.
     */
    styleAssetLibUtils.saveImageStyle = function (id, title, cssPropertiesList, uiPropertiesList) {
        var styleType = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            styleId = id,
            imageJson = styleAssetLibUtils._createStyleJson(styleId, title, cssPropertiesList, uiPropertiesList),
            imageSaveButton = $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR).get(0),
            imageSrc = styleAssetLibUtils._extractImageSrc(uiPropertiesList),
            preProcessPropertiesJson = styleVars.preProcessPropertiesJson || {},
            preProcessBackgroundPropertiesJson = preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY] || {},
            preProcessBackgroundPropertiesDataJson = preProcessBackgroundPropertiesJson[styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY] || {},
            deferredObject = $.Deferred(),
            $imagesSelect = $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR),
            imagesSelect = $imagesSelect.get(0);
        if (_.isEmpty(imageJson[styleId][styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME]) || _.isEmpty(imageJson[styleId][styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME].trim())) {
            return;
        }
        // If image is recently used one upload it to server before saving it.
        if (!_.isEmpty(preProcessBackgroundPropertiesDataJson[imageSrc])) {
            var promiseObject = styleUtils.processEncodedImage(preProcessBackgroundPropertiesDataJson, imageSrc);
            if (!_.isEmpty(promiseObject)) {
                promiseObject.then(function () {
                    delete preProcessBackgroundPropertiesDataJson[imageSrc];
                    deferredObject.resolve();
                });
            }
        } else {
            deferredObject.resolve();
        }
        deferredObject.then(function () {
            styleAssetLibUtils.saveStyle(styleType, imageJson, styleAssetLibUtils.checkImageStylesEqualFn, styleAssetLibUI.addSavedImageStyleUI, styleAssetLibUI.removeRecentlyUsedImageStyleUI, styleAssetLibUtils.preprocessSavedImageValue);
            imageSaveButton.set("disabled", "true");
            styleUtils.getMsDropDown(imagesSelect).set("selectedIndex", 1);
        });
    };

    /**
     * Save style .
     * @param {String} styleType - Type of the style.
     * @param {Json} styleJson - Json of the style.
     */
    styleAssetLibUtils.saveStyle = function (styleType, styleJson, checkStylesEqualFn, addUIFn, removeUIFn, preprocessorFn) {
        var json = styleAssetLibVars.savedStylesJson = styleAssetLibVars.savedStylesJson || {},
            styleId = Object.keys(json)[0],
            savedTextStylesList = [],
            recentlyUsedStylesList = styleAssetLibVars.recentlyUsedStylesJson[styleType],
            savedStylesList = styleAssetLibVars.savedStylesJson[styleType],
            indexInRecentUsedList = styleAssetLibUtils.styleIndexInList(styleJson, recentlyUsedStylesList, checkStylesEqualFn),
            indexInSaveStyleList = styleAssetLibUtils.styleIndexInList(styleJson, savedStylesList, checkStylesEqualFn);
        if (indexInSaveStyleList > -1) {
            return ;
        }
        if (!json[styleType]) {
            json[styleType] = {};
        }
        savedStylesList = json[styleType] = json[styleType] || [];
        savedStylesList.push(styleJson);
        styleAssetLibUtils.saveStyleOnServer(styleType, styleJson);
        if (addUIFn) {
            addUIFn(styleJson, preprocessorFn);
        }

        //If recent Used Style is saved directly remove recent used style from the list to prevent duplicate entries.
        if (indexInRecentUsedList > -1) {
            styleAssetLibUtils.removeRecentlyUsedStyle(recentlyUsedStylesList, indexInRecentUsedList, removeUIFn);
        }
    };

    /**
     * Save style on the server.
     * @param {String} styleType - Type of the style.
     * @param {Json} json - Json of the style.
     * node Structure
     * assetLibrary |
     *              |- textStyles.
     *              |- colors.
     *              |- images.
     */
    styleAssetLibUtils.saveStyleOnServer = function (styleType, json) {
        var styleId = Object.keys(json)[0],
            url = Granite.HTTP.externalize(styleAssetLibVars.assetLibraryPath + "/" + styleType + "/" + styleId),
            jcrNodeProperty = styleConstants.JCR_PRIMARY_TYPE,
            jcrNodeValue = styleConstants.JCR_NODE_TYPE_NTUNSTRUCTURED,
            cssPropertiesNodeType = uiPropertiesNodeType = "String[]",
            data;
        data = JSON.parse(JSON.stringify(json[styleId]));
        data[jcrNodeProperty] = jcrNodeValue;
        data["cssProperties@TypeHint"] = cssPropertiesNodeType;
        data["uiProperties@TypeHint"] = uiPropertiesNodeType;
        $.ajax({
            url : url,
            type : "POST",
            data : data
        });
    };

    /**
     * Remove Style From server.
     */
    styleAssetLibUtils.removeStyleOnServer = function (styleType, styleId) {
        var url = Granite.HTTP.externalize(styleAssetLibVars.assetLibraryPath + "/" + styleType + "/" + styleId),
            deleteOperation = "delete",
            data = {};
        data[":operation"] = deleteOperation;
        return $.ajax({
            url : url,
            type : "POST",
            data : data
        });
    };

    /**
     * Get recent used style.
     */
    styleAssetLibUtils.getRecentlyUsedStylesJson = function () {
        return styleAssetLibManager.load();
    };

    /**
     * Update recent used styles with the recent values in property sheet
     */
    styleAssetLibUtils.updateRecentlyUsedStyles = function () {
        styleAssetLibUtils.updateRecentlyUsedTextStyles();
        styleAssetLibUtils.updateRecentlyUsedColors();
        var recentlyUsedPromise = styleAssetLibUtils.updateRecentlyUsedImageStyles();
        styleAssetLibUtils.clearCurrentStyles();
        return recentlyUsedPromise;
    };

    /**
     * Update recent used image styles.
     */
    styleAssetLibUtils.updateRecentlyUsedImageStyles = function () {
        var json = styleAssetLibVars.currentImageStyles,
            deferredObjects = [],
            retDeferredObject = $.Deferred();
        if (!_.isEmpty(json)) {
            _.each(json, function (properties, key) {
                var imageStyleJson = {};
                _.each(properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME], function (keyValuePair) {
                    var data = styleUtils.extractPropertyValue(keyValuePair),
                        property = data.property,
                        value = data.value;
                    if (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                        var deferredObject = styleAssetLibUtils.setRecentlyUsedImage(value, properties);
                        if (!_.isEmpty(deferredObject)) {
                            deferredObjects.push(deferredObject);
                        }
                    }
                });
            });
        }
        $.when.apply($, deferredObjects).then(function () {
            retDeferredObject.resolve();
        },
        function () {
            retDeferredObject.reject();
        });
        return retDeferredObject.promise();
    };

    /**
     * set Recently used image styles.
     */
    styleAssetLibUtils.setRecentlyUsedImage = function (path, properties) {
        var imageName = path.substring(path.lastIndexOf("/") + 1),
            imageJson = {},
            promiseObject = {},
            uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
        properties[styleConstants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY] = imageName;
        if (!styleUtils.isAbsolutePath(path)) {
            var absolutePath = styleUtils.makePathAbsolute(path, styleVars.styleAssetsPrefixPath),
                deferred = $.Deferred();
            styleUtils.readImageFromServer(absolutePath)
                .then(function (file) {
                    return styleUtils.readImageFile(file);
                })
                .then(function (base64EncodedPath) {
                    var newPropertiesList = [],
                        id = new Date().getTime();
                    _.each(uiPropertiesList, function (keyValuePair) {
                        var data = styleUtils.extractPropertyValue(keyValuePair),
                            property = data.property,
                            value = data.value;
                        if (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                            keyValuePair = property + ":" + base64EncodedPath;
                        }
                        newPropertiesList.push(keyValuePair);
                    });
                    properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME] = newPropertiesList;
                    imageJson[id] = properties;
                    return imageJson;
                })
                .then(function (imageJson) {
                    return styleAssetLibUtils.saveRecentlyUsedStyle(styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME, imageJson, styleAssetLibUtils.checkImageStylesEqualFn, styleAssetLibUI.addRecentlyUsedImageStyleUI, styleAssetLibUI.removeRecentlyUsedImageStyleUI);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise();
        } else {
            var id = new Date().getTime();
            imageJson[id] = properties;
            styleAssetLibUtils.saveRecentlyUsedStyle(styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME, imageJson, styleAssetLibUtils.checkImageStylesEqualFn, styleAssetLibUI.addRecentlyUsedImageStyleUI, styleAssetLibUI.removeRecentlyUsedImageStyleUI);
            return {};
        }
    };

    /**
     * Update recent used text styles with the values in the text accordion.
     */
    styleAssetLibUtils.updateRecentlyUsedTextStyles = function () {
        if (styleAssetLibVars.isTextAccordionDirty) {
            var recentStylesJson = styleAssetLibVars.recentlyUsedStylesJson = styleAssetLibVars.recentlyUsedStylesJson || {},
                textStylesList = recentStylesJson[styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME] = recentStylesJson[styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME] || [],
                properties = styleAssetLibUI.getCurrentTextStyles(),
                id = new Date().getTime(),
                textStyleJson = styleAssetLibUtils._createStyleJson(id, styleConstants.RECENT_USED_TEXT_STYLE_DEFAULT_TITLE, properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME], properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]);
            styleAssetLibUtils.saveRecentlyUsedStyle(styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME, textStyleJson, styleAssetLibUtils.checkTextStylesEqualFn, styleAssetLibUI.addRecentlyUsedTextStyleUI, styleAssetLibUI.removeRecentlyUsedTextStyleUI);
        }
    };

    /**
     * update recent used colors with the colors present in the color-picker.
     */
    styleAssetLibUtils.updateRecentlyUsedColors = function () {
        var recentStylesJson = styleAssetLibVars.recentlyUsedStylesJson = styleAssetLibVars.recentlyUsedStylesJson || {},
            recentUsedColorsList = recentStylesJson[styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME] = recentStylesJson[styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME] || [],
            currentUsedColorsList = styleAssetLibUI.getCurrentUsedColorsList();
        _.each(currentUsedColorsList, function (color) {
            var id = new Date().getTime(),
                colorJson = styleAssetLibUtils._createStyleJson(id, styleConstants.RECENT_USED_COLOR_DEFAULT_TITLE, color[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]),
                $colorInputWidgetList = $(styleConstants.PROPERTY_SHEET_SELECTOR).find(styleConstants.COLOR_INPUT_SELECTOR);
            _.each($colorInputWidgetList, function (colorInputWidget) {
                styleAssetLibUtils.saveRecentlyUsedStyle(styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME, colorJson, styleAssetLibUtils.checkColorsEqualFn, styleAssetLibUI.addRecentlyUsedColorUI, styleAssetLibUI.removeRecentlyUsedColorsUI);
            });
        });
    };

    /**
     * generic function to save recent used style.checks if style already present rearrange the style.
     * else if size exceeds remove the oldest style and push the recent
     * @param {Array} stylesList current recent used style list.
     * @param {Array} stylesList current recent used style list.
     * @param {Object} styleJson recent used style json to be added.
     * @param {Function} checkStylesEqualFn function to check the style equality.
     * @param {Function} addUiFunction Function to add object to the ui
     * @param {Function} removeUIFunction Function to remove object from the ui.
     */
    styleAssetLibUtils.saveRecentlyUsedStyle = function (styleType, styleJson, checkStylesEqualFn, addUIFn, removeUIFn) {
        var recentlyUsedStylesList = styleAssetLibVars.recentlyUsedStylesJson[styleType] = styleAssetLibVars.recentlyUsedStylesJson[styleType] || [],
            savedStylesList = styleAssetLibVars.savedStylesJson[styleType] = styleAssetLibVars.savedStylesJson[styleType] || [],
            defaultStylesList = styleAssetLibVars.defaultStylesJson[styleType] =  styleAssetLibVars.defaultStylesJson[styleType] || [],
            isAlreadyPresent = false;
        //if saved style is same as recent used style dont do anything.
        if (styleAssetLibUtils.styleIndexInList(styleJson, savedStylesList, checkStylesEqualFn) > -1 || styleAssetLibUtils.styleIndexInList(styleJson, defaultStylesList, checkStylesEqualFn) > -1) {
            return;
        }
        _.find(recentlyUsedStylesList, function (currentStyleJson, index) {
            if (checkStylesEqualFn(currentStyleJson, styleJson)) {
                styleAssetLibUtils.removeRecentlyUsedStyle(recentlyUsedStylesList, index, removeUIFn);
                styleAssetLibUtils.addRecentlyUsedStyle(recentlyUsedStylesList, currentStyleJson, addUIFn);
                isAlreadyPresent = true;
                return true;
            }
        });
        if (isAlreadyPresent) {
            return ;
        }
        if (recentlyUsedStylesList.length == styleAssetLibManager.config.maxRecentStylesSaved) {
            styleAssetLibUtils.removeRecentlyUsedStyle(recentlyUsedStylesList, 0, removeUIFn);
        }
        styleAssetLibUtils.addRecentlyUsedStyle(recentlyUsedStylesList, styleJson, addUIFn);
    };

    /**
     * Add recent used style to the json.
     * @param {Array} stylesList list of current recent styles.
     * @param {Object} styleJson Object of recent style to be added.
     * @param {Function} addUiCallback add recent style to the ui.
     */
    styleAssetLibUtils.addRecentlyUsedStyle = function (stylesList, styleJson, addUICallback) {
        if (stylesList && !_.isEmpty(styleJson)) {
            stylesList.push(styleJson);
            if (addUICallback) {
                addUICallback(styleJson);
            }
            styleAssetLibManager.save(styleAssetLibVars.recentlyUsedStylesJson);
        }
    };

    /**
     * Remove recent used style to the json.
     * @param {Array} stylesList list of current recent styles.
     * @param {Object} styleJson Object of recent style to be added.
     * @param {Function} removeUiCallback remove recent style to the ui.
     */
    styleAssetLibUtils.removeRecentlyUsedStyle = function (stylesList, index, removeUICallback) {
        if (stylesList && (index < stylesList.length)) {
            var currentStyleJson = stylesList[index];
            stylesList.splice(index, 1);
            if (removeUICallback) {
                removeUICallback(currentStyleJson);
            }
            styleAssetLibManager.save(styleAssetLibVars.recentlyUsedStylesJson);
        }
    };

    /**
     * Remove recent used style to the json.
     * @param {String} styleNodeName name of the style node.
     * @param {Object} styleJson Object of saved style to be added.
     * @param {Function} removeUiCallback remove saved style from the ui.
     */
    styleAssetLibUtils.removeSavedStyle = function (styleNodeName, currentStyleJson, removeUICallback) {
        var json = styleAssetLibVars.savedStylesJson || {},
            savedStylesList = json[styleNodeName] || {},
            currentStyleProperties = styleAssetLibUtils._extractProperties(currentStyleJson),
            currentStyleIndex,
            deferredObject = {},
            promiseObject = {};
        if (!_.isEmpty(savedStylesList)) {
            _.find(savedStylesList, function (savedStyleJson, index) {
                var properties = styleAssetLibUtils._extractProperties(savedStyleJson);
                if (currentStyleProperties.id == properties.id) {
                    currentStyleIndex = index;
                    return true;
                }
            });
            if (currentStyleIndex > -1) {
                deferredObject = $.Deferred();
                styleAssetLibUtils.removeStyleOnServer(styleNodeName, currentStyleProperties.id).then(function () {
                    // this is done as multiple async operation might change list so finding index again is required.
                    _.find(savedStylesList, function (savedStyleJson, index) {
                        var properties = styleAssetLibUtils._extractProperties(savedStyleJson);
                        if (currentStyleProperties.id == properties.id) {
                            currentStyleIndex = index;
                            return true;
                        }
                    });
                    savedStylesList.splice(currentStyleIndex, 1);
                    if (removeUICallback) {
                        removeUICallback(currentStyleJson);
                    }
                    deferredObject.resolve();
                }, styleUtils.getAlertServerErrorFn(styleConstants.ASSET_LIBRARY_DELETE_ERROR_MESSAGE));
                promiseObject = deferredObject.promise();
            }
        }
        return promiseObject;
    };

    /**
     * Create style json with the parameters.
     * @param {String} id id of the style.
     * @param {String} title name of the style.
     * @param {Array} cssPropertiesList list of the css properties.
     * @param {Array} uiProperitesList list of the ui properties.
     */
    styleAssetLibUtils._createStyleJson = function (id, title, cssPropertiesList, uiPropertiesList) {
        var json = {},
            titleKey = styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME,
            cssPropertiesKey = styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME,
            uiPropertiesKey = styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME;
        json[id] = {};
        json[id][titleKey] = title;
        json[id][cssPropertiesKey] = cssPropertiesList;
        json[id][uiPropertiesKey] = uiPropertiesList;
        return json;
    };

    /**
     * search style in the style list.
     * @param {String} stylesId id of the style.
     * @param {String} styleNodeName Style Type.
     * @return {Object} styleAsset found asset.
     */
    styleAssetLibUtils.searchStyle = function (styleId, styleNodeName) {
        var savedStylesList = [],
            recentlyUsedStylesList = [],
            styleAsset = {};
        if (styleAssetLibVars.savedStylesJson) {
            savedStylesList = styleAssetLibVars.savedStylesJson[styleNodeName] || [];
        }
        if (styleAssetLibVars.recentlyUsedStylesJson) {
            recentlyUsedStylesList = styleAssetLibVars.recentlyUsedStylesJson[styleNodeName] || [];
        }
        var stylesList = savedStylesList.concat(recentlyUsedStylesList);
        _.find(stylesList, function (styleItem) {
            if (styleId == Object.keys(styleItem)[0]) {
                styleAsset = styleItem;
                return true;
            }
        });
        return styleAsset;
    };

    /**
     * we get style as json object but we convert to list to keep it similar with recent style.
     * @param {Object} json object of the saved style.
     * @return {Object} json updated json with the text-style.
     */
    //do it for background and color as well.
    styleAssetLibUtils.generateSavedStyleList = function (json) {
        var textStylesNode = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            colorsNode = styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME,
            imageNode = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            nodeList = [textStylesNode, colorsNode, imageNode];
        json = json || {};
        _.each(nodeList, function (nodeItem) {
            json[nodeItem] = json[nodeItem] || {};
            json[nodeItem] = _convertJsonToList(json[nodeItem]);
        });
        delete json[styleConstants.JCR_PRIMARY_TYPE];
        return json;
    };

    /**
     * check if two text style equal.
     * @param {Object} style1 first text style to be compared.
     * @param {Object} style2 second text style to be compared.
     */
    styleAssetLibUtils.checkTextStylesEqualFn = function (style1, style2) {
        if (!style1 && !style2) {
            return true;
        } else if (!style1 && style2) {
            return false;
        } else if (style1 && !style2) {
            return false;
        } else {
            var key1 = Object.keys(style1)[0],
                key2 = Object.keys(style2)[0];
            return _.isEqual(styleAssetLibUtils._convertPropertiesListToJson(style1[key1][styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]), styleAssetLibUtils._convertPropertiesListToJson(style2[key2][styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]))
                   && _.isEqual(styleAssetLibUtils._convertPropertiesListToJson(style1[key1][styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]), styleAssetLibUtils._convertPropertiesListToJson(style2[key2][styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]));
        }
    };

    /**
     * check if two image styles equal.
     * @param {Object} style1 first text style to be compared.
     * @param {Object} style2 second text style to be compared.
     */
    styleAssetLibUtils.checkImageStylesEqualFn = function (style1, style2) {
        if (!style1 && !style2) {
            return true;
        } else if (!style1 && style2) {
            return false;
        } else if (style1 && !style2) {
            return false;
        } else {
            var key1 = Object.keys(style1)[0],
                key2 = Object.keys(style2)[0],
                style1Json = styleAssetLibUtils._convertPropertiesListToJson(style1[key1][styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]),
                style2Json = styleAssetLibUtils._convertPropertiesListToJson(style2[key2][styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]);
            if (styleUtils.isImagePathBase64Encoded(style1Json[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME]) || styleUtils.isImagePathBase64Encoded(style2Json[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME])) {
                var image1Name = _getImageName(style1Json, style1),
                    image2Name = _getImageName(style2Json, style2);
                delete style1Json[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME];
                delete style2Json[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME];
                style1Json[styleConstants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY] = image1Name;
                style2Json[styleConstants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY] = image2Name;
            }
            return _.isEqual(style1Json, style2Json);
        }
    };

    /**
     * check if two color style equal.
     * @param {Object} style1 first color style to be compared.
     * @param {Object} style2 second color style to be compared.
     */
    styleAssetLibUtils.checkColorsEqualFn = function (style1, style2) {
        if (!style1 && !style2) {
            return true;
        } else if (!style1 && style2) {
            return false;
        } else if (style1 && !style2) {
            return false;
        } else {
            var key1 = Object.keys(style1)[0],
                key2 = Object.keys(style2)[0];
            return _.isEqual(styleAssetLibUtils._convertPropertiesListToJson(style1[key1][styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]), styleAssetLibUtils._convertPropertiesListToJson(style2[key2][styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]));
        }
    };

    /**
     * convert a json object with keys to a list.
     * @param {Object} styleJson json object to be checked if present in list.
     * @param {Array} stylesList list of objects to be searched in.
     * @param {function} compareFn function to compare objects.
     */
    styleAssetLibUtils.styleIndexInList = function (styleJson, stylesList, compareFn) {
        var index = -1;
        _.find(stylesList, function (currentStyleJson, i) {
            if (compareFn(styleJson, currentStyleJson)) {
                index = i;
                return true;
            }
        });
        return index;
    };

    /**
     * set Asset Library default colors.
     */
    styleAssetLibUtils.setAssetLibraryColorsDefaultStyles = function () {
        //TODO: Currently We are picking default colors from first colorpicker as all colorPickers are same.Need to move to all default colors.
        $defaultColorWidgets = $("#style-propertysheet coral-colorinput").eq(0).find("div[handle='defaultPalette'] coral-colorinput-item").toArray().reverse();
        _.each($defaultColorWidgets, function (defaultColorWidget) {
            var id = new Date().getTime(),
                value = defaultColorWidget.value,
                backgroundColorKeyValuePair = "background-color:" + value,
                cssProperties = [];
            cssProperties.push(backgroundColorKeyValuePair);
            colorJson = styleAssetLibUtils._createStyleJson(id, styleConstants.ASSET_LIBRARY_DEFAULT_COLOR_TITLE, cssProperties);
            styleAssetLibVars.defaultStylesJson[styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME].push(colorJson);
        });
    };

    /**
     * clearing current colors list.
     */
    styleAssetLibUtils.clearCurrentStyles = function () {
        styleAssetLibVars.currentUsedColors = []; // reset current Colors list.
        styleAssetLibVars.currentImageStyles = {};
        styleAssetLibVars.isTextAccordionDirty = false;
    };

    /**
     * use saved image style preprocessor.
     */
    styleAssetLibUtils.useSavedImageStylePreProcessor = function (properties) {
        //if form editor put absolute entry in temp property json.
        if (!_.isEmpty(properties)) {
            var path = styleAssetLibUtils._getImageAssetPath(properties);
            if (styleUtils.isStyleEditor() && !styleUtils.isAbsolutePath(path) && styleUtils.getThemeClientlibPath()) {
                var data = {},
                    imageName = path.substr(path.lastIndexOf("/") + 1);
                data.key = path;
                data.value = {};
                data.value[styleConstants.BACKGROUND_TYPE_PROPERTY] = styleConstants.BACKGROUND_SAVED_ASSET_TYPE_VALUE;
                data.value[styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY] = styleUtils.getThemeClientlibPath() + "/" + styleConstants.ASSETS_LOCATION + "/" + imageName;
                styleUtils.addPreprocessBackgroundProperty(data);
            }
        }
    };

    /**
     * use saved image style preprocessor.
     */
    styleAssetLibUtils.useRecentlyUsedImageStylePreProcessor = function (properties) {
        var newUiPropertiesList = [];
        if (properties && properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]) {
            var uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
            _.each(uiPropertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    property = data.property,
                    value = data.value;
                if (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                    if (styleUtils.isImagePathBase64Encoded(value)) {
                        var imageName = properties[styleConstants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY],
                            imageRelativePath = styleVars.styleAssetsRelativePath + "/" + imageName;
                        data.key = imageRelativePath;
                        data.value = {};
                        data.value[styleConstants.BACKGROUND_TYPE_PROPERTY] = styleConstants.BACKGROUND_RECENTLY_USED_ASSET_TYPE_VALUE;
                        data.value[styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY] = value;
                        styleUtils.addPreprocessBackgroundProperty(data);
                        keyValuePair = property + ":" + imageRelativePath;
                    }
                }
                newUiPropertiesList.push(keyValuePair);
            });
        }
        properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME] = newUiPropertiesList;
        return properties;
    };

    /**
     * preprocess saved image value.
     */
    styleAssetLibUtils.preprocessSavedImageValue = function (path) {
        if (styleUtils.isStyleEditor() && !styleUtils.isAbsolutePath(path) && styleUtils.getThemeClientlibPath()) {
            return styleUtils.getThemeClientlibPath() + "/" + path;
        }
        return path;
    };

    /**
     * get image asset path of the image used.
     */
    styleAssetLibUtils._getImageAssetPath = function (properties) {
        var uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
            path = "";
        _.find(uiPropertiesList, function (keyValuePair) {
            var data = styleUtils.extractPropertyValue(keyValuePair),
                key = data.property,
                value = data.value;
            if (key == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                path = value;
                return true;
            }
        });
        return path;
    };

    /**
     * convert list of proertyvalue string to json.
     */
    styleAssetLibUtils._convertPropertiesListToJson = function (propertiesList) {
        var json = {};
        if (!_.isEmpty(propertiesList)) {
            _.each(propertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    property = data.property,
                    value = data.value;
                json[property] = value;
            });
        }
        return json;
    };

    /**
     * extract properties from a style object like id, title etc.
     * @param {Object} styleObjectJson - Json Object of the style.
     */
    styleAssetLibUtils._extractProperties = function (styleObjectJson) {
        var properties = {};
        properties.id = key = Object.keys(styleObjectJson)[0];
        _.each(styleObjectJson[key], function (value, key) {
            properties[key] = value;
        });
        return properties;
    };

    /**
     * extract image src from properties.
     */
    styleAssetLibUtils._extractImageSrc = function (uiPropertiesList) {
        var imageSrc = "";
        _.find(uiPropertiesList, function (keyValuePair) {
            var data = styleUtils.extractPropertyValue(keyValuePair),
                property = data.property,
                value = data.value;
            if (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                imageSrc = value;
                return true;
            }
        });
        return imageSrc;
    };

    styleAssetLibUtils.createSwatch = function (color) {
        var colorInputSwatch = new Coral.Button().set({
            icon : "check",
            iconSize : "XS"
        });
        $(colorInputSwatch).css("background-color", color)
                           .addClass(styleConstants.COLOR_INPUT_CUSTOM_SWATCH_CLASS)
                           .attr("value", color)
                           .attr("type", "button");
        if (_.isEmpty(color)) {
            $(colorInputSwatch).addClass(styleConstants.COLOR_INPUT_CUSTOM_NO_COLOR_SWATCH_CLASS);
        }

        return colorInputSwatch;
    };

    styleAssetLibUtils.getSwatchColor = function ($colorSwatch) {
        return $colorSwatch.attr("value");
    };

    /**
     * convert a json object with keys to a list.
     * @param {Object} json json object to be converted
     */
    var _convertJsonToList = function (json) {
        var list = [];
        _.each(json, function (value, key) {
            if (key != styleConstants.JCR_PRIMARY_TYPE) {
                var item = {};
                item[key] = value;
                list.push(item);
            }
        });
        return list;
    },

    /**
     * retrieve image name from the propertiesJson.
     */
    _getImageName = function (propertiesJson, styleJson) {
        var imageSrc = propertiesJson[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME],
            imageName = "";
        if (styleUtils.isAbsolutePath(imageSrc)) {
            if (styleUtils.isImagePathBase64Encoded(imageSrc)) {
                var key = Object.keys(styleJson)[0];
                imageName = styleJson[key][styleConstants.ASSET_LIBRARY_IMAGE_NAME_PROPERTY];
            } else {
                imageName = imageSrc;
            }
        } else {
            imageName = imageSrc.substring(imageSrc.lastIndexOf("/") + 1);
        }
        return imageName;
    };
}(window._, $, window.guidelib.touchlib.style));
