/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
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
 */
;(function ($, author, theme, window, undefined) {
    /*
     * override
     **/
    var parseData = function (data) {
        theme.mappings = {"components" : {}};
        theme.componentMappings = {};
        theme.selectorMappings = {};
        var outputData = {"label" : "Stylable Components", "id" : "themeStylableComponents", "items" : {}};
        for (var component in data) {
            var componentName = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component),
                styleConfig = data[component]["cq:themeConfig"];
            if (!styleConfig) {
                styleConfig = data[component]["cq:styleConfig"];
            }
            if (styleConfig) {
                var componentId = styleConfig.componentId,
                styleConfigItems = styleConfig.items;
                theme.mappings.components[componentId] = {};
                theme.componentMappings[component] = componentId;
                for (var styleConfigItem in styleConfigItems) {
                    if (styleConfigItem.indexOf("jcr:") != 0) {
                        var styleConfigItemPrefix = component + "/cq:themeConfig/items/" + styleConfigItem,
                            path =  styleConfigItem,
                            id = styleConfigItems[styleConfigItem].id;
                        if (!id && styleConfigItems[styleConfigItem].cssSelector) {
                            if (console) {
                                console.log("ItemID not found for top level path: " + path);
                            }
                            id = styleConfigItem;
                        }
                        outputData.items[styleConfigItemPrefix] = getStyleConfigObject(styleConfigItems[styleConfigItem], id, componentId, path);
                    }
                }
            }
        }
        return outputData;
    },

    getStyleConfigObject = function (data, id, key, path) {
        if (theme.mappings.components[key][id]) {
            var existingEntry = theme.mappings.components[key][id].cssSelector,
                upcomingEntry = data.cssSelector;
            if (existingEntry !== upcomingEntry && console) {
                console.log('Duplicate entry found for id: ' + id + " [" + existingEntry + " / " + upcomingEntry + "]");
            }
        }
        if (data.cssSelector) {
            theme.selectorMappings[key] = theme.selectorMappings[key] || {};
            theme.selectorMappings[key][path] = id;
            theme.mappings.components[key][id] = {};
            theme.mappings.components[key][id].path = path;
            theme.mappings.components[key][id].name = data.longTitle ? data.longTitle : data["jcr:title"];
            theme.mappings.components[key][id].propertySheet = data.propertySheet;
            theme.mappings.components[key][id].cssSelector = data.cssSelector;
            window.guidelib.touchlib.style.utils.addJsonPostHandler(key, id, data.jsonPostHandler);
            if (data.secondarySelectors) {
                theme.mappings.components[key][id].secondarySelectors = data.secondarySelectors;
            }
            if (data.states) {
                theme.mappings.components[key][id].states = {};
                for (var key1 in data.states) {
                    if (key1.indexOf("jcr:") != 0) {
                        theme.mappings.components[key][id].states[key1] = {};
                        theme.mappings.components[key][id].states[key1].cssSelector = data.states[key1].cssSelector;
                        theme.mappings.components[key][id].states[key1].name = data.states[key1]["jcr:title"];
                        theme.mappings.components[key][id].states[key1].cssGenerationOrder = data.states[key1].cssGenerationOrder ? data.states[key1].cssGenerationOrder : 1000;
                    }
                }
            }
        }
        var outputData = {};
        outputData.label = data["jcr:title"];
        outputData.id = key + "_" + id;
        outputData.component = key;
        outputData.selector = id; //unique selector id which identified the html selector within the component
        if (data.cssSelector) { //the CSS selector string
            outputData.editable = "true";
        }
        if (data.items) {
            var items = data.items;
            outputData.items = {};
            for (var key2 in items) {
                if (key2.indexOf("jcr:") != 0) {
                    var itemPath = path + "/" + key2,
                        itemId = items[key2].id;
                    if (!itemId) {
                        if (console && items[key2].cssSelector) {
                            console.log("ItemID not found for path: " + itemPath);
                        }
                        itemId = itemPath;
                    }
                    outputData.items[itemId] = getStyleConfigObject(items[key2], itemId, key, itemPath);
                }
            }
        }
        return outputData;
    },

    jsonConcat = function (o1, o2) {
        for (var key in o2) {
            if (key.indexOf("jcr:") != 0) {
                o1[key] = o2[key];
            }
        }
        return o1;
    },

    GuideFormObjectsTreeDataModel = theme.themeObjectsTreeDataModel = author.util.extendClass(author.ui.TreeDataModel, {
        parseData : parseData
    });

}(jQuery, Granite.author, window.guidelib.touchlib.theme, this));
