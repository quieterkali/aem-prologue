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

;(function (_, $, style, undefined) {

    var styleConstants = style.constants,
        styleUtils = style.utils,
        stylePropertySheetContainerSelector = "#" + styleConstants.STYLE_PROPERTY_SHEET_CONTAINER,
        styleAssetLib = style.assetLibrary,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetLibUtils = styleAssetLib.utils,
        styleAssetLibHistory = styleAssetLib.history = styleAssetLib.history,
        styleAssetLibManager = styleAssetLib.history.manager,
        styleOpenPopoversSelector = "coral-popover.is-open, coral-overlay.is-open",
        styleExtraCssPropertiesArray = ["cssOverride", "beforePseudoElement", "afterPseudoElement", "addonCss"];

    /**
     * preprocess a property before generating css
     */
    styleUtils.preprocessProperty = function (data) {
        var key = data.key,
            value = data.value;
        if (key == styleConstants.CSS_BACKGROUND_PROPERTY) {
            value = styleUtils.preprocessBackgroundProperty(data);
        }
        return value;
    };

    /**
     * preprocess a background property before generating css
     */
    styleUtils.preprocessBackgroundProperty = function (data) {
        var cssValue = data.value,
            backgroundUiValue;
        if (style.vars.preProcessPropertiesJson
            && style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY]) {
            var component = data.componentName,
                selector = data.selectorName,
                state = data.stateName,
                breakpoint = data.breakpointName,
                json = style.vars.json,
                preProcessBackgroundPropertyJson = style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY][styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY];
            if (json && json.components && json.components[component] && json.components[component][selector]) {
                json = json.components[component][selector];
                var cssPropertiesString = breakpoint + "#" + state,
                    uiPropertiesString = cssPropertiesString + "#ui";
                if (json[uiPropertiesString] && json[cssPropertiesString]) {
                    var uiPropertiesList = json[uiPropertiesString];
                    _.find(uiPropertiesList, function (keyValuePair) {
                        var data = styleUtils.extractPropertyValue(keyValuePair),
                            key = data.property,
                            value = data.value;
                        if (key == styleConstants.UI_BACKGROUND_PROPERTY) {
                            backgroundUiValue = value;
                            return true;
                        }
                    });
                    if (backgroundUiValue) {
                        var list = JSON.parse(backgroundUiValue || "{}");
                        _.each(list.itemList, function (imageProp) {
                            var src = imageProp[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME],
                                savedUrl = "url(" + src + ")";
                            if (preProcessBackgroundPropertyJson[src]) {
                                var currentUrl = "url(" + styleUtils.getCurrentImagePath(src) + ")";
                                cssValue = cssValue.replace(savedUrl, currentUrl);
                            }
                        });
                    }
                }
            }
        }
        return cssValue;
    };

    /**
     *  clear preProcess Properties json.
     */
    styleUtils.clearPreprocessPropertiesJson = function () {
        style.vars.preProcessPropertiesJson = {};
    };

    /**
     * add preprocess background property
     */
    styleUtils.addPreprocessBackgroundProperty = function (data) {
        var preProcessPropertiesJson = style.vars.preProcessPropertiesJson = style.vars.preProcessPropertiesJson || {},
            preProcessBackgroundPropertiesJson = preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY] = preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY] || {},
            preProcessBackgroundPropertiesJsonData = preProcessBackgroundPropertiesJson[styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY] = preProcessBackgroundPropertiesJson[styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY] || {};
        if (data && data.key && data.value) {
            preProcessBackgroundPropertiesJsonData[data.key] = data.value;
        }
    };
}(window._, $, window.guidelib.touchlib.style));
