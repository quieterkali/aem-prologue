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

    /* Utils related to Save / Cancel action on property sheet */

    /**
     * Utility method to set the dirty flag
     */
    styleUtils.setPropertySheetDirtyFlag = function () {
        style.vars.isPropertySheetChanged = true;
        styleUtils.history.Manager.setOperationActive(true);
        $("#themeConfigDialogColumn input, #themeConfigDialogColumn button").prop('disabled', true);
        if ($(".styleSidePanelHeader .styleSaveButton")) {
            $(".styleSidePanelHeader .styleSaveButton").get(0).disabled = false;
        }
    };

    /**
     * Utility method to clear the dirty flag
     */
    styleUtils.clearPropertySheetDirtyFlag = function () {
        style.vars.isPropertySheetChanged = false;
        styleUtils.history.Manager.setOperationActive(false);
        $("#themeConfigDialogColumn input, #themeConfigDialogColumn button").prop('disabled', false);
        if ($(".styleSidePanelHeader .styleSaveButton")) {
            $(".styleSidePanelHeader .styleSaveButton").get(0).disabled = true;
        }
    };

    /**
     * Utility method to set the breakpoint label in property sheet
     */
    styleUtils.setBreakPointInfoHeaderLabel = function () {
        var $styleBreakPointInfoHeader = $(".styleBreakPointInfoHeader");
        var currentBreakpoint = style.vars.currentBreakpoint;
        var breakPointJson = style.vars.json.breakpoints[currentBreakpoint];
        var breakPointMaxValue = breakPointJson.width;
        var styleBreakPointInfoHeaderLabel = $styleBreakPointInfoHeader.find("coral-anchorbutton-label");
        var currentBreakPointName = breakPointJson.title;
        var labelText = (breakPointJson.id == "default" ? (CQ.I18n.get("Desktop")) : (CQ.I18n.get(currentBreakPointName) + " | " + breakPointMaxValue + "px"));
        styleBreakPointInfoHeaderLabel.text(labelText);
    };

    /**
     * Utility method to initialize the breakpoint information
     */
    styleUtils.initializeBreakpointInfo = function () {
        var json = style.vars.json;
        var breakpoints = Granite.author.responsive.getBreakpoints();
        json.breakpoints = json.breakpoints || {};
        if (!json.breakpoints["default"]) {
            var defaultBreakpoint = {};
            defaultBreakpoint = {};
            defaultBreakpoint.id = "default";
            defaultBreakpoint.title = "Default";
            defaultBreakpoint.width = -1;
            json.breakpoints["default"] = defaultBreakpoint;
        }
        var breakpointNameList = Object.keys(breakpoints);
        for (var i = 0; i < breakpointNameList.length; i++) {
            var breakpointName = breakpointNameList[i];
            if (!json.breakpoints[breakpointName]) {
                var customBreakpoint = {};
                customBreakpoint.id = breakpointName;
                customBreakpoint.title = breakpoints[breakpointName].title;
                customBreakpoint.width = breakpoints[breakpointName].width;
                json.breakpoints[breakpointName] = customBreakpoint;
            }
        }
    };

    /**
     * Utility method to handle breakpoint change event
     */
    styleUtils.breakpointChange = function (e) {
        //save the form data
        if (style.vars.currentBreakpoint != Granite.author.responsive.getCurrentBreakpoint()) {
            style.vars.currentBreakpoint = Granite.author.responsive.getCurrentBreakpoint();
            if ($('#style-propertysheet').is(':visible')) {
                //This time is taken to show property sheet change.
                // Timeout increased from 100 to 200 so that breakpoint works in IE
                styleUtils.triggerWaitEvent($(stylePropertySheetContainerSelector), 300);
                style.ui.populatePropertySheet();
                //update the field values for current target
            }
        }
        if (styleUtils.isThemeEditor()) {
            style.overlay.repositionOverlay(style.vars.currentSelectedOverlayTarget, true);
        }
    };

    /**
     * Utility method to load the default property sheet
     */
    styleUtils.loadDefaultPropertySheet = function () {
        jQuery.ajax({
            url : Granite.HTTP.externalize("/mnt/overlay/fd/af/components/stylePropertySheet/common.html"),
            type : "GET",
            data : {
                "themePath" : styleUtils.getThemePath() + "/jcr:content"
            }
        }).done(function (data) {
            style.vars.propertySheetMap["/mnt/overlay/fd/af/components/stylePropertySheet/common"] = data;
            $("#style-propertysheet").html(data);
            var isFirstPropertySheetLoaded = (style.vars.currentPropertySheet ? false : true);
            style.vars.currentPropertySheet = "/mnt/overlay/fd/af/components/stylePropertySheet/common";
            $(document).trigger("foundation-contentloaded");
            Coral.commons.ready($("#style-propertysheet").get(0), function () {
                style.ui.preprocessPropertySheet(isFirstPropertySheetLoaded);
                style.ui.resetAssetLibraryWidgets();
            });
        });
    };

    /**
     * Utility method to trigger wait event for showing loading icon
     * @param $wrapperElement Element on which the div is added
     * @param waitParam Parameter containing delay information
     */
    styleUtils.triggerWaitEvent = function ($wrapperElement, waitParam) {
        var event = {
            type : "initiateWait",
            wrapperElement : $wrapperElement
        };
        if (typeof waitParam === "number") {
            event.waitTime = waitParam;
        } else if (typeof waitParam === "string") {
            event.hideEvent = waitParam;
        }
        //if nothing is specified it will fallback to time=300ms.
        $(document).trigger(event);
    };

    /**
     * Utility method to get the Json data
     * @param options Json containing selector, component, breakpoint, state and propertyType and property information
     * @returns Style Json data
     */
    styleUtils.getJSonData = function (options) {
        var componentNode = style.vars.json.components;
        options.currentComponent = (options.currentComponent == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : options.currentComponent);
        selectorObjectString = options.currentComponent + "." + options.currentSelector + "." + options.currentBreakpoint + "#" + options.currentState;
        if (options.propertyType === "uiProperties") {
            selectorObjectString += "#ui";
            properties = window.expeditor.Utils.getOrElse(componentNode, selectorObjectString, {});
        } else if (options.propertyType === "maskedProperties") {
            selectorObjectString += "#mask";
            properties = window.expeditor.Utils.getOrElse(componentNode, selectorObjectString, []);
        } else if (options.propertyType === "cssProperties") {
            properties = window.expeditor.Utils.getOrElse(componentNode, selectorObjectString, {});
        }
        if (options.property === "*") {
            return properties;
        } else {
            if (properties) {
                var property = _.filter(properties, function (value) {
                    return value.startsWith(options.property + ":");
                });
                var propItem = property[0];
                if (propItem) {
                    return propItem.substring(propItem.indexOf(":") + 1);
                }
            }
        }
    };

    /**
     * Utility method to set a property in theme Json
     * @param currObject The object on which the property is to be set
     * @param propertyString The dot seperated path to the string
     * @param value The value to be set
     */
    styleUtils.setAndCreateProperty = function (currObject, propertyString, value) {
        var propChain = (propertyString || "").split(".");
        var ref = currObject,
            parentPropString = "";
        $.each(propChain, function (index, prop) {
            if (index < (propChain.length - 1)) {
                if (!ref[prop]) {
                    //second last level is json object
                    if (index < (propChain.length - 2)) {
                        ref[prop] = {};
                        ref[prop]["jcr:primaryType"] = "nt:unstructured";
                    //last level is an array containing the properties
                    } else {
                        ref[prop] = [];
                    }
                }
                parentPropString = prop;
                ref = ref[prop];
            } else {
                (parentPropString.substring(parentPropString.lastIndexOf("#") + 1) == styleConstants.MASK_PROPERTY_NAME ? styleUtils.setMaskProperty(ref, prop, value) : styleUtils.setCssUiProperty(ref, prop, value));
            }
        });
    };

    /**
     * Mask a Property.
     * @param {Object} maskedPropertiesList - the Mask property list.
     * @param {string} property - Property which needs to be masked.
     * @param {boolean} doMask - Boolean to mask or unmask a property.
     */
    styleUtils.setMaskProperty = function (maskList, property, doMask) {
        if (maskList) {
            if (doMask && maskList.indexOf(property) == -1) {
                maskList.push(property);
            } else if (maskList.indexOf(property) != -1) {
                maskList.splice(maskList.indexOf(property), 1);
            }
        }
    };

    /**
     * Set Css Ui property in json.
     * @param {Object} propertyList - the property list .
     * @param {string} property - Property which needs to be added or deleted.
     * @param {boolean} value - value of the property.
     */
    styleUtils.setCssUiProperty = function (propertyList, property, value) {
        if (propertyList) {
            if (property === "*") {
                propertyList = value;
            } else {
                var propIndex = _.findIndex(propertyList, function (propValue) {
                    return (propValue.startsWith(property + ":"));
                });
                if (propIndex != -1) {
                    propertyList.splice(propIndex, 1);
                }
                if (!_.isEmpty(value)) {
                    if (_.isObject(value)) {
                        value = JSON.stringify(value);
                    }
                    propertyList.push(property + ":" + value);
                }
            }
        }
    };

    /**
     * Utility method to set the Json data
     * @param options Json containing selector, component, breakpoint, state and propertyType and property information
     */
    styleUtils.setJSonData = function (options) {
        var jsonRef = (options.json ? options.json : style.vars.json.components),
            value;
        if (options.operation == styleConstants.MASK_OPERATION || options.operation == styleConstants.UNMASK_OPERATION) {
            var propertyString = options.currentComponent + "." +
                                    options.currentSelector + "." +
                                    options.currentBreakpoint + "#" + options.currentState +
                                    "#" + styleConstants.MASK_PROPERTY_NAME + "." +
                                    options.propertyName;
            value = (options.operation == styleConstants.MASK_OPERATION ? true : false);
        } else {
            options.currentComponent = (options.currentComponent == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : options.currentComponent);
            var propertyString = options.currentComponent + "." +
                                    options.currentSelector + "." +
                                    options.currentBreakpoint + "#" + options.currentState +
                                    (options.propertyType === "uiProperties" ? "#ui" : "") + "." +
                                    options.propertyName;
            value = options.value;
        }
        styleUtils.setAndCreateProperty(jsonRef, propertyString, value);
    };

    /**
     * Utility method to update the selector list in property sheet
     * @param stateElementSelector selector string to find the drop-down for states
     * @param component The component for which the state list is required
     * @param selector The selector for which the state list is required
     */
    styleUtils.updateStateList = function (stateElementSelector, component, selector) {
        var $stateName = $(stateElementSelector),
            elStateName = $stateName.get(0);

        //set the states available for the object
        var oldStateItems = elStateName.items.getAll();
        for (var j = 0; j < oldStateItems.length; j++) {
            elStateName.items.remove(oldStateItems[j]);
        }
        var defaultObj = {};
        defaultObj.value = "default";
        defaultObj.content = {};
        defaultObj.content.innerHTML = CQ.I18n.get("Default");
        elStateName.items.add(defaultObj);
        var newStatesObj = styleUtils.getSelectorMetaData(component, selector, "states");
        if (newStatesObj) {
            elStateName.disabled = false;
            var stateNames = Object.keys(newStatesObj);
            for (var i = 0; i < stateNames.length; i++) {
                var obj = {};
                obj.value = stateNames[i];
                obj.content = {};
                obj.content.innerHTML = CQ.I18n.get(newStatesObj[stateNames[i]].name);
                elStateName.items.add(obj);
            }
        } else {
            elStateName.disabled = true;
        }
    };

    /**
     * Utility method to prefix a class to the given cssSelector (all , separated selectors need to have the prefix)
     */
    styleUtils.generateSelectorString = function (className, cssSelector, makeDescendantSelector) {
        var selectorString = "";
        var selectorArray = cssSelector.split(',');
        for (var i = 0; i < selectorArray.length; i++) {
            if (i != 0) {
                selectorString += ",";
            }
            if (makeDescendantSelector) {
                selectorString += "." + className + " " + selectorArray[i];
            } else {
                selectorString += "." + className + selectorArray[i];
            }
        }
        return selectorString;
    };

    /**
     * Wraps the css string in Style Tag.Id is required for the style tag.
     * @param {String} cssString String which is to be wrapped in styleTag.
     * @param {String} styleTagId Id for the style tag which is generated.
     * @return {String}
     */
    styleUtils.wrapInStyleTag = function (cssString, styleTagId) {
        if (styleTagId) {
            return '<style id="' + styleTagId + '">' + cssString + "</style>";
        } else if (console) {
            console.log("styleTagId not given!!");
        }
    };

    /**
     * generate raw css from the json.
     * @param {Object} json json which contains raw css.
     * @return {String}
     */
    styleUtils.generateRawCss = function (json) {
        if (!json) {
            json = style.vars.json;
        }
        var rawCss = "";
        rawCss += "\n/***************************************************";
        rawCss += "\n Raw CSS";
        rawCss += "\n***************************************************/";
        if (json.rawCss) {
            rawCss += "\n" + json.rawCss;
            rawCss += "\n";
        }
        return window.expeditor.Utils.encodeScriptableTags(rawCss);
    };

    /**
     * Generate the cssString for all the components.
     * @param {Boolean} isCssGenerationWithStyleTag Flag used to wrap cssString in style tags.
     * @param {Object} json Json Object used to generate css String.
     * @return {String}
     */
    styleUtils.generateCssString = function (isCssGenerationWithStyleTag, json, styleAssetsPrefixPath) {
        var cssString = "";
        if (!json) {
            json = style.vars.json;
        }
        var componentsObject = json.components;
        //iterating over all components and generate CSS String.
        _.each(componentsObject, function (value, componentName) {
            if (!componentName.startsWith('jcr:')) {
                var component = componentsObject[componentName];
                //iterating over all selectors and generating cssString
                _.each(component, function (selectorJson, selectorName) {
                    //TODO: add a better check..
                    if (!selectorName.startsWith('jcr:') && !(selectorName === "component")) {
                        var selectorCssString = styleUtils.generateSelectorCssString(componentName, selectorName, selectorJson, styleAssetsPrefixPath);
                        //returns cssString wrapped in styleTag.
                        if (isCssGenerationWithStyleTag) {
                            var styleTagId = componentName.replace(/\//g, "_") + "_" + selectorName.replace(/\//g, "_") + "_";
                            cssString += styleUtils.wrapInStyleTag(selectorCssString, styleTagId);
                        } else {
                            cssString += selectorCssString;
                        }
                    }
                });
            }
        });
        //Support for raw Css.
        if (json.rawCss) {
            var rawCss = styleUtils.generateRawCss();
            if (!isCssGenerationWithStyleTag) {
                cssString += rawCss;
            }
            cssString += "\n";
        }
        return cssString;
    };

    /**
     * Generate CssString for a particular selector of a component.
     * The heirarchy is Component => Selector => Breakpoint => States => Css.
     * @param {String} componentName Name of the selector's component.
     * @param {String} selectorName Name of the selector whose css is generated.
     * @param {Object} json Json Object used to generate css String.
     * @return {String}
     */
    styleUtils.generateSelectorCssString = function (componentName, selectorName, selectorJson, styleAssetsPrefixPath) {
        var arr = [],
            cssString = "\n/* " + componentName + ":" + selectorName + "*/";
        if (!selectorJson) {
            selectorJson = style.vars.json.components[componentName][selectorName];
        }
        var breakpoints = _.groupBy(_.keys(selectorJson)
                    .filter(function (key) {
                        return (key.indexOf("#") > 0 && !(key.endsWith("#ui")));
                    }), function (item) {
                        if (item.indexOf("#") > 0 && !(item.endsWith("#ui"))) {
                            return item.substring(0, item.indexOf("#"));
                        } else {
                            return "_IGNORE_";
                        }
                    });
        if (breakpoints["default"]) {
            cssString += styleUtils.generateBreakpointCSS(componentName, selectorName, selectorJson, breakpoints["default"], "default", styleAssetsPrefixPath);
        }
        var sortedBreakpoints = _.sortBy(style.vars.json.breakpoints, 'max');
        sortedBreakpoints.reverse();
        _.each(sortedBreakpoints, function (breakpoint) {
            if (breakpoint.id !== "default" && _.contains(_.keys(breakpoints), breakpoint.id)) {
                cssString += styleUtils.generateBreakpointCSS(componentName, selectorName, selectorJson, breakpoints[breakpoint.id], breakpoint.id, styleAssetsPrefixPath);
            }
        });
        return window.expeditor.Utils.encodeScriptableTags(cssString);
    };

    _addValuetoLibrary = function (value) {
        style.vars.library = style.vars.library || {};
        style.vars.library.icons = style.vars.library.icons || {};
        style.vars.library.colors = style.vars.library.colors || {};
        var colors = value.match(/(#(?:[\da-f]{3}){1,2}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\)|rgba\((?:\d{1,3},\s*){3}\d*\.?\d+\)|hsl\(\d{1,3}(?:,\s*\d{1,3}%){2}\)|hsla\(\d{1,3}(?:,\s*\d{1,3}%){2},\s*\d*\.?\d+\))/gi);
        if (colors) {
            _.each(colors, function (color) {
                style.vars.library.colors[color] = color;
            });
        }
        var icons = value.match(/url\(.*?\)/ig);
        if (icons) {
            _.each(icons, function (icon) {
                var url = icon.match(/url\s*\(\s*['"]?(.+?)['"]?\s*\)/);
                if (url && url[1]) {
                    style.vars.library.icons[icon] = url[1];
                }
            });
        }
    };

    /**
     * Utility method to generate the CSS for a breakpoint
     */
    styleUtils.generateBreakpointCSS = function (componentName, selectorName, selectorJson, key, breakpoint, styleAssetsPrefixPath) {
        var cssString = "",
            hasStyles = false;
        _.each(key, function (combString) {
            var combStringArray = combString.split("#"),
                combStringArrayLength = combStringArray.length,
                maskCombString = combString + "#mask",
                extras = {};
            if (combStringArray[combStringArrayLength - 1] != "mask") {
                var stateName = combStringArray[1],
                    selectorString,
                    maskedPropertiesList = selectorJson[maskCombString] || [];
                if (stateName == "default") {
                    selectorString = styleUtils.getSelectorMetaData(componentName, selectorName, "cssSelector");
                } else {
                    selectorString = styleUtils.getStateMetaData(componentName, selectorName, stateName, "cssSelector");
                }
                if (breakpoint !== "default") {
                    breakpointMaxValue = style.vars.json.breakpoints[breakpoint].width;
                    cssString +=  "\n@media (max-width : " + breakpointMaxValue + "px){\n";
                }
                cssString += "\n" + selectorString + "{\n";
                _.each(selectorJson[combString], function (property) {
                    hasStyles = true;
                    var key = property.substring(0, property.indexOf(':')),
                        value = property.substring(property.indexOf(':') + 1);
                    value = styleUtils.preprocessProperty({
                        key : key,
                        value : value,
                        componentName : componentName,
                        selectorName : selectorName,
                        breakpointName : breakpoint,
                        stateName : stateName
                    });
                    value = styleUtils.prependContextRoot(styleUtils.convertRelativeToAbsoluteUrl(value, styleAssetsPrefixPath));
                    if (styleExtraCssPropertiesArray.indexOf(key) === -1) {
                        var propertyValueCssString = key + ":" + value + ";\n";
                        if (maskedPropertiesList.indexOf(key) != -1) {
                            propertyValueCssString = styleUtils.makeCssComment(propertyValueCssString);
                        }
                        cssString += propertyValueCssString;
                    } else {
                        extras[key] = value;
                    }
                });
                cssString += getCSSOverrideString(componentName, selectorName, selectorJson, key, breakpoint, extras, styleAssetsPrefixPath, maskedPropertiesList);
                cssString += "}\n";
                cssString += getAdditionalCSS(componentName, selectorName, selectorJson, key, breakpoint, extras, selectorString, styleAssetsPrefixPath, maskedPropertiesList);

                if (breakpoint !== "default") {
                    cssString +=  "\n}\n" ;
                }
            }
        });
        if (hasStyles) {
            return cssString;
        } else {
            return "";
        }
    };

    /**
     *  Utility method to get the CSS override string
     */
    var getCSSOverrideString = function (componentName, selectorName, selectorJson, key, breakpoint, extras, styleAssetsPrefixPath, maskedPropertiesList) {
        var cssOverrideString = "";
        //CssString from the cssOverride textArea.
        if (extras.cssOverride) {
            cssOverrideString +=  "/* CSS Override */\n";
            var result = extras.cssOverride;
            result = styleUtils.prependContextRoot(styleUtils.convertRelativeToAbsoluteUrl(extras.cssOverride, styleAssetsPrefixPath));
            if (maskedPropertiesList && maskedPropertiesList.indexOf("cssOverride") != -1) {
                result = "";
            }
            cssOverrideString += result + "\n";
        }
        return cssOverrideString;
    };

    /**
     *  Utility method to get the addon CSS string
     */
    var getAdditionalCSS = function (componentName, selectorName, selectorJson, key, breakpoint, extras, selectorString, styleAssetsPrefixPath, maskedPropertiesList) {

        var extraCssString = "";
        //CssString from the beforePseudo Element textArea.
        //outside the block of 'selector-string' adding additional CSS (::before, ::after and addonCss) for the given breakpoint
        if (extras.beforePseudoElement) {
            extraCssString +=  "\n/* ::before Pseudo Element Selector */\n";
            extraCssString += styleUtils.getPseudoElementSelector(selectorString, "::before ");
            var result = extras.beforePseudoElement;
            result = styleUtils.prependContextRoot(styleUtils.convertRelativeToAbsoluteUrl(extras.beforePseudoElement, styleAssetsPrefixPath));
            if (maskedPropertiesList && maskedPropertiesList.indexOf("beforePseudoElement") != -1) {
                result = "";
            }
            extraCssString += "{\n" + result + "\n}\n";
        }
        //CssString from the after Pseudo Element textarea.
        if (extras.afterPseudoElement) {
            extraCssString +=  "\n/* ::after Pseudo Element Selector */\n";
            extraCssString += styleUtils.getPseudoElementSelector(selectorString, "::after ");
            var result = extras.afterPseudoElement;
            result = styleUtils.prependContextRoot(styleUtils.convertRelativeToAbsoluteUrl(extras.afterPseudoElement));
            if (maskedPropertiesList && maskedPropertiesList.indexOf("afterPseudoElement") != -1) {
                result = "";
            }
            extraCssString += "{\n" + result + "\n}\n";
        }
        //CssString for the post-handler elements.
        if (extras.addonCss) {
            var addonJson;
            try {
                addonJson = JSON.parse(extras.addonCss);
            } catch (e) {
                if (console) {
                    console.log("Unable to parse addonCss: " + extras.addonCss);
                }
            }
            var tempStr = "\n/* Additional auto-generated CSS */ \n";
            if (addonJson && addonJson.selectors) {
                _.each(addonJson.selectors, function (value, selector) {
                    var selectorObj = addonJson.selectors[selector],
                        selectorString = selectorObj.cssSelector;
                    //cssTemp class available in inline editor
                    if (style.vars.cssTempClass) {
                        selectorString = styleUtils
                            .generateSelectorString(style.vars.cssTempClass, selectorString, false);
                    }
                    tempStr += selectorString + " {\n";
                    var properties = selectorObj.properties;
                    var propertyKeys = Object.keys(properties);
                    _.each(propertyKeys, function (property) {
                        tempStr += "\t" + property + ":" + properties[property] + ";\n";
                    });
                    tempStr += "}\n";
                });
            }
            extraCssString += tempStr;
            extraCssString += "\n";
        }
        return extraCssString;
    };

    /**
     *  prepend context root to the url (having absolute path) to avoid 404 problem
     *  while running with contextpath option
     */
    styleUtils.prependContextRoot = function (urlString) {
        if (urlString && urlString.indexOf('url(') > -1) {
            var ctxRoot =  Granite.HTTP.getContextPath();
            var urlWithCtxRoot = urlString;

            return urlWithCtxRoot
                .replace(/url\(\s*\//gi, "url(" + ctxRoot + "/")
                .replace(/url\(\s*'\//gi, "url('" + ctxRoot + "/")
                .replace(/url\(\s*"\//gi, "url(\"" + ctxRoot + "/");
        } else {
            return urlString;
        }
    };

    /**
     *  Utility method to convert relative Url to Absolute
     */
    styleUtils.convertRelativeToAbsoluteUrl = function (urlString, styleAssetsPrefixPath) {
        if (urlString && urlString.indexOf('url(') > -1) {
            var updatedUrlString = urlString.replace(/(\burl\(\s*['"]?)(.*?)(\s*['"]?\))/gi, function (word, prefix, path, suffix) {
                absolutePath = styleUtils.makePathAbsolute(path, styleAssetsPrefixPath);
                return prefix + absolutePath + suffix;
            });
        }
        if (updatedUrlString) {
            return updatedUrlString;
        }else {
            return urlString;
        }
    };

    /**
     *  Utility method to check if Path is relative or absolute
     */
    styleUtils.isAbsolutePath = function (path) {
        //check for empty string.
        if (!path || path == "") {
            return true;
        }
        if (styleUtils.isImagePathBase64Encoded(path)) {
            return true;
        }
        var absolutePathRegex = /^[a-z]+?:?\/\/.*|^\/.*/i;
        if (path.match(absolutePathRegex)) {
            return true;
        }
        return false;
    };

    /**
     *  Utility method to check if Path is encode as base 64.
     */
    styleUtils.isImagePathBase64Encoded = function (path) {
        if (path && path.indexOf("data:image") != -1) {
            return true;
        }
        return false;
    };

    /**
     *  Utility method to make absolute Path to Relative.
     */
    styleUtils.makePathAbsolute = function (path, styleAssetsPrefixPath) {
        if (styleUtils.isAbsolutePath(path)) {
            return path;
        }
        var prefixPath = styleAssetsPrefixPath ? styleAssetsPrefixPath : style.vars.styleAssetsPrefixPath;
        return prefixPath + "/" + path;
    };

    /**
     *  Utility method to get the pseudo selector for a selector string.
     */
    styleUtils.getPseudoElementSelector = function (selectorString, pseudoElementString) {
        return selectorString.split(',').reduce(function (prev, curr) {
            return prev + curr + pseudoElementString + ",";
        }, "").replace(/.$/, "");
    };

    styleUtils.clearPropertySheetBackupJson = function () {
        style.vars.propertySheetBackupJson = undefined;
    };

    styleUtils.takePropertySheetBackup = function (json, currentComponent, currentSelector) {
        styleUtils.clearPropertySheetBackupJson();
        selectorObjectString = "components." + currentComponent + "." + currentSelector;
        selectorJson = window.expeditor.Utils.getOrElse(json, selectorObjectString, undefined);
        if (selectorJson) {
            style.vars.propertySheetBackupJson = JSON.parse(JSON.stringify(json.components[currentComponent][currentSelector]));
        }
    };

    styleUtils.registerUndoRedoEvents = function () {
        $(document).off("style-action-redo.style.fd.undoRedo").on("style-action-redo.style.fd.undoRedo", function (event, data) {
            styleUtils.restorePropertySheetUndoRedoData(data, false);
            style.ui.populatePropertySheet();
        });

        $(document).off("style-action-undo.style.fd.undoRedo").on("style-action-undo.style.fd.undoRedo", function (event, data) {
            styleUtils.restorePropertySheetUndoRedoData(data, true);
            style.ui.populatePropertySheet();
        });
    };

    styleUtils.isEmptyPropertySheetBackupJson = function () {
        if (style.vars.propertySheetBackupJson) {
            return false;
        }
        return true;
    };

    styleUtils.restorePropertySheetBackupJson = function (json, currentComponent, currentSelector) {
        if (!styleUtils.isEmptyPropertySheetBackupJson()) {
            //clone
            json.components[currentComponent][currentSelector] = JSON.parse(JSON.stringify(style.vars.propertySheetBackupJson));
        } else {
            selectorObjectString = "components." + currentComponent + "." + currentSelector;
            if (window.expeditor.Utils.getOrElse(json, selectorObjectString, undefined)) {
                delete json.components[currentComponent][currentSelector];
            }
        }
        styleUtils.propertySheetUpdated();
    };

    styleUtils.alertComponentSwitchDisabled = function () {
        //validation error message takes priority over selector change
        //need to refactor to use a common structure for messaging
        if (!style.vars.uirestrictions.blockForValidation) {
            $(".styleSelectorChangeAlert").removeClass('hideAlertComponentChange').fadeTo(600, 1).delay(3000).fadeTo(600, 0, function () {
                $(this).addClass("hideAlertComponentChange");
            });
        }
    };

    styleUtils.alertValidationError = function () {
        $(".styleValidationAlert").removeClass('hideAlertComponentChange').fadeTo(600, 1).delay(3000).fadeTo(600, 0, function () {
            $(this).addClass("hideAlertComponentChange");
        });
    };

    //hide property Sheet Container.
    styleUtils.hidePropertySheetContainer = function () {
        $(stylePropertySheetContainerSelector).attr("hidden", "");
    };

    //show property Sheet Container
    styleUtils.showPropertySheetContainer = function () {
        $(stylePropertySheetContainerSelector).removeAttr("hidden");
    };

    styleUtils.getGeneratedCSS = function (json) {
        var cssString = "";
        if (json) {
            var wrapperJson = {};
            wrapperJson.components = {};
            wrapperJson.components[style.vars.currentComponent] = {};
            wrapperJson.components[style.vars.currentComponent][style.vars.currentSelector] = json;
            cssString = styleUtils.generateCssString(false, wrapperJson);
        }
        return cssString;
    };

    styleUtils.showGeneratedCSS = function () {
        var json;
        selectorObjectString = style.vars.currentComponent + "." + style.vars.currentSelector;
        json = window.expeditor.Utils.getOrElse(style.vars.json.components, selectorObjectString, undefined);
        var cssString = styleUtils.getGeneratedCSS(json);

        var dialog = document.querySelector('#generatedCSSDialog');
        if (dialog) {
            dialog.remove();
        }
        dialog = new Coral.Dialog().set({
            id : 'generatedCSSDialog',
            header : {
                innerHTML : style.utils.getSelectorMetaData(style.vars.currentComponent, style.vars.currentSelector, "name") + Granite.I18n.get(' CSS')
            },
            content : {
                innerHTML : '<textarea class=\'generateCSSPre\' style="visibility:hidden">' + cssString + '</textarea>'
            },
            footer : {
                innerHTML : '<button is="coral-button" variant="primary" coral-close>' + Granite.I18n.get('Close') + '</button>'
            }
        });
        document.body.appendChild(dialog);
        dialog.closable = Coral.Dialog.closable.ON;
        dialog.backdrop = Coral.Dialog.backdrop.STATIC;
        dialog.show();
        dialog.on("coral-overlay:open", _updateCodeStylingPartial);
    };

    _updateCodeStylingPartial = function () {
        CodeMirror.fromTextArea($("#generatedCSSDialog .generateCSSPre").get(0), _getEditorOptions(true));
    };

    _getEditorOptions = function (readOnly) {
        return _.extend({}, CodeMirror.defaults, {
            readOnly : readOnly,
            styleActiveLine : !readOnly,
            lineNumbers : true,
            extraKeys : {
                "Ctrl-F" : "find",
                "Alt-F" : "findPersistent",
                "Ctrl-G" : "findPersistent",
                "Ctrl-Shift-G" : "findPersistent",
                "Ctrl-Space" : "autocomplete"
            },
            foldGutter : true,
            gutters : ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
            lint : true,
            lineWrapping : true,
            autoCloseBrackets : true,
            continueComments : true,
            matchBrackets : true
        });
    };

    _makeFullScreen = function (fsButtonId, fsExitButtonId) {
        var fsButtonId = "#rawCSSFullScreen",
            fsExitButtonId = "#rawCSSFullScreenExit",
            dialogId = 'rawCSSDialog',
            availableHeight = $(window).height() - 100,
            availableWidth = $(window).width() - 50;
        if ($(event.target).parent("button").attr("id") === "viewCSSFullScreen") {
            fsButtonId = "#viewCSSFullScreen";
            fsExitButtonId = "#viewCSSFullScreenExit";
            dialogId = 'generatedCompleteCSSDialog';
        }
        document.getElementById(dialogId).fullscreen = true;
        $(fsExitButtonId).show();
        $(fsButtonId).hide();
        $("#" + dialogId + " .CodeMirror").addClass("maximized");
        $("#" + dialogId + " .CodeMirror").get(0).CodeMirror.setSize(availableWidth, availableHeight);
    };

    _fullScreenExit = function (fsButtonId, fsExitButtonId) {
        var fsButtonId = "#rawCSSFullScreen",
            fsExitButtonId = "#rawCSSFullScreenExit",
            dialogId = 'rawCSSDialog',
            availableHeight = $(window).height() - 100,
            availableWidth = $(window).width() - 50;
        if ($(event.target).parent("button").attr("id") === "viewCSSFullScreenExit") {
            fsButtonId = "#viewCSSFullScreen";
            fsExitButtonId = "#viewCSSFullScreenExit";
            dialogId = 'generatedCompleteCSSDialog';
        }
        document.getElementById(dialogId).fullscreen = false;
        $(fsExitButtonId).hide();
        $(fsButtonId).show();
        $("#" + dialogId + " .CodeMirror").removeClass("maximized");
        $("#" + dialogId + " .CodeMirror").get(0).CodeMirror.setSize(750, 300);
    };
    styleUtils.showCompleteCSS = function () {
        var cssString = "";
        /*fist Boolean Parameter = useCssImportant which is false.
        *second Boolean parameter = isCssGenerationWithStyleTag css is generated without style tag as we are showing in the popover.
        */
        cssString = styleUtils.generateCssString(false, style.vars.json);

        var dialog = document.querySelector('#generatedCompleteCSSDialog'),
            maximizeButton = '<button is="coral-button" size="S" icon="fullScreen" id="viewCSSFullScreen" variant="quiet">',
            minimizeButton = '<button is="coral-button" size="S" icon="fullScreenExit" id="viewCSSFullScreenExit" variant="quiet">',
            closeButton = '<button is="coral-button" size="S" icon="close" id="viewCSSCloseButton" variant="quiet" coral-close>';
        if (dialog) {
            dialog.remove();
        }
        dialog = new Coral.Dialog().set({
            id : 'generatedCompleteCSSDialog',
            header : {
                innerHTML : Granite.I18n.get('Theme CSS') + '<div class="viewCssActions">' + maximizeButton + minimizeButton + closeButton + '</div>'
            },
            content : {
                innerHTML : '<textarea class=\'generateCSSPre\' style="visibility:hidden">' + cssString + '</textarea>'
            }
        });
        document.body.appendChild(dialog);
        dialog.closable = Coral.Dialog.closable.OFF;
        dialog.backdrop = Coral.Dialog.backdrop.STATIC;
        dialog.show();
        dialog.on("coral-overlay:open", _updateCodeStylingComplete);
        $("#viewCSSFullScreen").on("click", _makeFullScreen);
        $("#viewCSSFullScreenExit").on("click", _fullScreenExit);
    };

    _updateCodeStylingComplete = function () {
        CodeMirror.fromTextArea($("#generatedCompleteCSSDialog").find(".generateCSSPre")[0], _getEditorOptions(true));
    };

    styleUtils.editRawCSS = function () {
        if (!style.vars.uirestrictions.blockRawCSSEdit) {
            var cssString = style.vars.json.rawCss || "",
                dialog = document.getElementById('rawCSSDialog'),
                maximizeButton = '<button is="coral-button" size="S" icon="fullScreen" id="rawCSSFullScreen" variant="quiet">',
                minimizeButton = '<button is="coral-button" size="S" icon="fullScreenExit" id="rawCSSFullScreenExit" variant="quiet">',
                closeButton = '<button is="coral-button" size="S" icon="close" id="rawCSSCloseButton" variant="quiet" coral-close>',
                saveButton = '<button is="coral-button" disabled size="S" icon="check" id="rawCSSSaveButton" variant="quiet" coral-save>';
            if (dialog) {
                dialog.remove();
            }

            dialog = new Coral.Dialog().set({
                id : 'rawCSSDialog',
                header : {
                    innerHTML : Granite.I18n.get('Raw CSS') + '<div class="rawCssActions">' + maximizeButton + minimizeButton + closeButton + saveButton + "</div>"
                },
                content : {
                    innerHTML : '<textarea class=\'generateCSSPre\' style="visibility:hidden">' + cssString + '</textarea>'
                }
            });
            document.body.appendChild(dialog);
            dialog.closable = Coral.Dialog.closable.OFF;
            dialog.backdrop = Coral.Dialog.backdrop.STATIC;
            dialog.show();
            dialog.on("coral-overlay:open", _updateCodeStylingRawCSS);
            $("#rawCSSFullScreen").on("click", _makeFullScreen);
            $("#rawCSSFullScreenExit").on("click", _fullScreenExit);
        }
    };

    _updateCodeStylingRawCSS = function () {
        style.vars.rawCSSEdit = CodeMirror.fromTextArea($("#rawCSSDialog .generateCSSPre").get(0) , _getEditorOptions(false));
        style.vars.rawCSSEdit.on("change", _enableSaveButton);
        $("#rawCSSSaveButton").on("click.style.cssView", styleUtils.saveRawCSS);
    };

    _enableSaveButton = function (changeObj) {
        $("#rawCSSSaveButton").removeAttr("disabled");
    };

    styleUtils.closePopoverIfAny = function (event) {

        /* This is to ignore the clicks on coralUI 2 modals. This code will need to be changed on migrating the modals to coralUI 3 */
        if (event && event.target && ($(event.target).is(".coral-Modal,.coral-Modal-backdrop")
            || $(event.target).parents(".coral-Modal,.coral-Modal-backdrop").length > 0)) {
            return;
        }

        var openPopovers = $(".style-propertySheetContainer coral-popover.is-open, .style-propertySheetContainer coral-overlay.is-open");
        var openLeafPopovers = [];
        // Loop over all open overlays/popovers present in the property sheet.
        for (var i = 0; i < openPopovers.length; i++) {
            if (event && event.target
                && ($(event.target) === $(openPopovers[i])
                || $(event.target).closest(styleOpenPopoversSelector).length != 0)) {
                /* This is the case when user either clicks on top of a popover/overlay or on an element that is a child of the popover/overlay.
                 In this case we do not want to close this popover/overlay so continue without any action.
                 */
                continue;
            }
            if ($(openPopovers[i]).find(styleOpenPopoversSelector).length == 0) {
                // Store all leaf level popovers/overlay in an array
                openLeafPopovers.push(openPopovers[i]);
            }
        }
        // Close all leaf level popovers/overlays
        for (var j = 0; j < openLeafPopovers.length; j++) {
            //close popover only if it does not have any validation issue
            if ($(openLeafPopovers[j]).find('[invalid]').length == 0) {
                openLeafPopovers[j].open = false;
            }
        }
    };

    styleUtils.closeAllOpenPopovers = function () {
        var openPopovers = $(".style-propertySheetContainer coral-popover.is-open, .style-propertySheetContainer coral-overlay.is-open");
        for (var j = 0; j < openPopovers.length; j++) {
            openPopovers[j].open = false;
        }
    };

    //if specificity of 1 is higher than 2
    styleUtils.isSpecificityHigher = function (specificity1, specificity2) {
        for (var i = 0; i < 3; i++) {
            if (specificity1[i] > specificity2[i]) {
                return true;
            } else if (specificity1[i] < specificity2[i]) {
                return false;
            }
        }
        return false;
    };

    styleUtils.getContentFrame = function () {
        return document.getElementById('ContentFrame');
    };

    styleUtils.getContentWindow = function () {
        if (styleUtils.getContentFrame()) {
            return styleUtils.getContentFrame().contentWindow;
        }
        return null;
    };

    /**
     *  Method to simulate success state in the form.
     *  @param {Boolean} start - To start success simulation.
     */
    styleUtils.startStopSuccessSimulation = function (start) {
        if (start) {
            $(styleConstants.SIMULATE_SUCCESS_SELECTOR).prop('checked', true);
            styleUtils.getContentWindow().$("[data-hasvalidation]").addClass("validation-success");
        } else {
            $(styleConstants.SIMULATE_SUCCESS_SELECTOR).prop('checked', false);
            styleUtils.getContentWindow().$("[data-hasvalidation]").removeClass("validation-success");
        }
    };

    /**
     *  Method to simulate error state in the form.
     *  @param {Boolean} start - To start error simulation.
     */
    styleUtils.startStopErrorSimulation = function (start) {
        if (start) {
            $(styleConstants.SIMULATE_ERROR_SELECTOR).prop('checked', true);
            styleUtils.getContentWindow().$("[data-hasvalidation]").addClass("validation-failure");
        } else {
            $(styleConstants.SIMULATE_ERROR_SELECTOR).prop('checked', false);
            styleUtils.getContentWindow().$("[data-hasvalidation]").removeClass("validation-failure");
        }
    };

    /**
     *  Method to verify if form components are in error state.
     */
    styleUtils.isErrorSimulationEnviorment = function () {
        return $(styleConstants.SIMULATE_ERROR_SELECTOR).prop('checked');
    };

    /**
     *  Method to verify if form components are in success state.
     */
    styleUtils.isSuccessSimulationEnviorment = function () {
        return $(styleConstants.SIMULATE_SUCCESS_SELECTOR).prop('checked');
    };

    styleUtils.getPropertyValue = function (array, propertyName) {
        var propertyString;
        _.each(array, function (value) {
            if (value.startsWith(propertyName + ":")) {
                propertyString = value.substring(value.indexOf(":") + 1);
            }
        });
        return propertyString;
    };

    styleUtils.arrayHasProperty = function (array, propertyName) {
        var hasProperty = false;
        _.each(array, function (value) {
            if (value.startsWith(propertyName + ":")) {
                hasProperty = true;
            }
        });
        return hasProperty;
    };

    /*
     *   METHODS OVERRIDDEN BY THEME AND INLINE
     */

    styleUtils.getSelectorMetaData = function (component, selector, prop) {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override getSelectorMetaData function");
        }
    };

    styleUtils.getStateMetaData = function (component, selector, state, prop) {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override getStateMetaData function");
        }
    };

    styleUtils.propertySheetUpdated = function () {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override propertySheetUpdated function");
        }
    };

    styleUtils.propertySheetSaved = function () {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override propertySheetSaved function");
        }
    };

    styleUtils.processSelectorUpdated = function () {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override processSelectorUpdated function");
        }
    };

    styleUtils.getLastModifiedTime = function () {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override getLastModifiedTime function");
        }
    };

    styleUtils.saveRawCSS = function () {
        // Override this function in theme and inline style layer
        if (console) {
            console.log("Please Override saveRawCSS function");
        }
    };

    /**
     * Mask or unMask a Property.
     * @param {Object} masking Options - object containing component,selector,state,breakpoint,
     *                                   operation(mask or unmask),value,json.
     */
    styleUtils.maskUnmaskProperty = function (maskingOptions) {
        var options = {},
            component = maskingOptions.currentComponent,
            selector = maskingOptions.currentSelector,
            state = maskingOptions.currentState,
            breakpoint = maskingOptions.currentBreakpoint,
            property = maskingOptions.propertyName,
            propertyType = maskingOptions.propertyType,
            operation = maskingOptions.operation.toLowerCase();
        if (component == style.vars.currentComponent && selector == style.vars.currentSelector && breakpoint == style.vars.currentBreakpoint && state == style.vars.currentState) {
            var $propertyElement;
            if (propertyType == "cssProperties") {
                $propertyElement = $("[data-csspropertyname = " + property + "]");
            } else if (propertyType == "uiProperties") {
                $propertyElement = $("[data-uipropertyname = " + property + "]");
            }
            var propertySheetMaskButtonSelector = "." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS,
                $button = $propertyElement.siblings(propertySheetMaskButtonSelector),
                button = $button.get(0);
            if (button) {
                if (operation == styleConstants.MASK_OPERATION) {
                    style.ui.updateMaskIcons($button, true);
                } else {
                    style.ui.updateMaskIcons($button, false);
                }
            }
        }
        styleUtils.updateStyle(maskingOptions);
    };

    /**
     * Update style in json and generate new css for updated selector.
     * @param {Object} masking Options - object containing component,selector,state,breakpoint,
     *                                   value,json.
     */
    styleUtils.updateStyle = function (options) {
        var component = options.currentComponent || style.vars.currentComponent,
            selector = options.currentSelector || style.vars.currentSelector;
        styleUtils.setJSonData(options);
        if (style.vars.jsonPostHandler[component]) {
            jsonPostHandler = style.vars.jsonPostHandler[component][selector];
            if (jsonPostHandler) {
                eval(jsonPostHandler);
            }
        }
        styleUtils.setPropertySheetDirtyFlag();
        if (!style.vars.isCssGenerationInitiated) {
            style.vars.isCssGenerationInitiated = true;
            setTimeout(function () {
                styleUtils.propertySheetUpdated();
                style.vars.isCssGenerationInitiated = undefined;
            }, 0);
        }
    };

    /**
     * get value if property is masked return empty string else return value present in json.
     * @param {Object} masking Options - object containing component,selector,state,breakpoint,
     *                                   operation(mask or unmask),value,json.
     */
    styleUtils.getOriginalValue = function (options) {
        var maskedPropertiesList = styleUtils.getMaskPropertiesList(options),
            property = options.property;
        if (maskedPropertiesList.indexOf(property) != -1) {
            return "";
        } else {
            var component = options.currentComponent || style.vars.currentComponent,
                selector = options.currentSelector || style.vars.currentSelector,
                breakpoint = options.currentBreakpoint || style.vars.currentBreakpoint,
                state = options.currentState || style.vars.currentState,
                json = options.json || style.vars.json.components,
                propertyType = options.propertyType,
                propertyTypeSelector = (propertyType == "uiProperties" ? "#ui" : ""),
                propertyString = component + "." +
                                selector + "." +
                                breakpoint + "#" + state +
                                propertyTypeSelector;
            propertyList = window.expeditor.Utils.getOrElse(json, propertyString, []);
            return styleUtils.getPropertyValue(propertyList, property);
        }
    };

    /**
     * Make a css Comment.
     * @param {String} cssString - css String which needs to be commented.
     */
    styleUtils.makeCssComment = function (cssString) {
        return "/*\n" + cssString + "*/";
    };

    /**
     * Get List of properties which are masked.
     * @param {Object} options - object containing component,selector,state,breakpoint,
     *                           operation(mask or unmask),value,json.
     */
    styleUtils.getMaskPropertiesList = function (options) {
        var component = options.currentComponent || style.vars.currentComponent,
            selector = options.currentSelector || style.vars.currentSelector,
            breakpoint = options.currentBreakpoint || style.vars.currentBreakpoint,
            state = options.currentState || style.vars.currentState,
            json = options.json || style.vars.json.components,
            maskedPropertyString = component + "." +
                                    selector + "." +
                                    breakpoint + "#" + state +
                                    "#" + styleConstants.MASK_PROPERTY_NAME;
        maskedPropertiesList = window.expeditor.Utils.getOrElse(json, maskedPropertyString, []);
        return maskedPropertiesList;
    };

    /**
     * set Asset library vars like saved style json and asset lib path etc
     * kept in them namespace as asset path different for inline and theme.
     * and similarly asset library json will get populated differently.
     */
    styleUtils.setAssetLibraryVars = function () {
        styleAssetLibManager.init();
        styleUtils.setAssetLibraryPath();
        styleAssetLibManager.load();
        styleUtils.setAssetLibraryTheme();
        styleUtils.setAssetLibraryDefaultStyles();
        styleUtils.setAssetLibrarySavedStylesJson();
    };

    /**
     * set Asset Library default styles.
     * TODO: do for icons as well.
     */
    styleUtils.setAssetLibraryDefaultStyles = function () {
        var json = styleAssetLibVars.defaultStylesJson = {};
        json[styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME] = [];
        json[styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME] = [];
        styleAssetLibUtils.setAssetLibraryColorsDefaultStyles();
    };

    /**
     * setting assetLibraryTheme path.
     */
    styleUtils.setAssetLibraryTheme = function () {
        var styleAssetLib = style.assetLibrary = style.assetLibrary || {},
            styleAssetLibVars = styleAssetLib.vars || {};
        styleAssetLibVars.themePath = styleUtils.getThemePath();
    };

    /**
     * return authoring config json of the form.
     */
    styleUtils.getAuthoringConfigJson = function () {
        return $(styleUtils.getContentFrame()).contents().find(".guideContainerWrapperNode").data("guide-authoringconfigjson");
    };

    /**
     *  get current stored path of image.
     */
    styleUtils.getCurrentImagePath = function (path) {
        if (style.vars.preProcessPropertiesJson
            && style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY]
            && style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY][styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY]
            && style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY][styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY][path]) {
            path = style.vars.preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY][styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY][path][styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY];
        }
        return path;
    };

    /**
     *  if current editor is form editor
     */
    styleUtils.isStyleEditor = function () {
        return (styleUtils.getCurrentEditorName() == styleConstants.STYLE_EDITOR_NAME) ? true : false;
    };

    /**
     *  if current editor is form editor
     */
    styleUtils.isThemeEditor = function () {
        return (styleUtils.getCurrentEditorName() == styleConstants.THEME_EDITOR_NAME) ? true : false;
    };

    /**
     * preprocess some opertation before saving property sheet.
     */
    styleUtils.preSaveProcessor = function (preSavePostHandler, errorHandler) {
        styleUtils.preSaveProcessBackgroundProperty(preSavePostHandler, errorHandler);
    };

    styleUtils.preSaveProcessBackgroundProperty = function (preSavePostHandler, errorHandler) {
        var json = style.vars.json,
            currentComponent = style.vars.currentComponent,
            currentSelector = style.vars.currentSelector,
            preProcessPropertiesJson = style.vars.preProcessPropertiesJson || {},
            preProcessBackgroundPropertyJson = preProcessPropertiesJson[styleConstants.CSS_BACKGROUND_PROPERTY] || {},
            preProcessBackgroundPropertyDataJson = preProcessBackgroundPropertyJson[styleConstants.PREPROCESS_PROPERTIES_JSON_DATA_PROPERTY] || {},
            preProcessSuccessful = true,
            deferredObjects = [];
        if (json && json.components && json.components[currentComponent] && json.components[currentComponent][currentSelector]
            && !_.isEmpty(preProcessBackgroundPropertyDataJson)) {
            json = json.components[currentComponent][currentSelector];
            _.each(json, function (propertiesList, propertyType) {
                if (propertyType && propertyType.indexOf("#ui") != -1) {
                    _.each(propertiesList, function (uiProperty) {
                        var data = styleUtils.extractPropertyValue(uiProperty),
                            key = data.property,
                            value = data.value;
                        if (key == styleConstants.UI_BACKGROUND_PROPERTY) {
                            var imageList = JSON.parse(value);
                            imageList = imageList.itemList;
                            _.each(imageList, function (imageProperties) {
                                var imageSrc = imageProperties[styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME],
                                    deferredObject = styleUtils.processImage(preProcessBackgroundPropertyDataJson, imageSrc);
                                if (!_.isEmpty(deferredObject)) {
                                    deferredObjects.push(deferredObject);
                                }
                            });
                        }
                    });
                }
            });
        }
        $.when.apply($, deferredObjects).then(function () {
            preSavePostHandler();
        }, errorHandler);
    };

    /**
     *  process image present preprocessproperties json.
     */
    styleUtils.processImage = function (preProcessBackgroundPropertyDataJson, imageSrc) {
        if (preProcessBackgroundPropertyDataJson && preProcessBackgroundPropertyDataJson[imageSrc]) {
            var json = preProcessBackgroundPropertyDataJson[imageSrc],
                currentPath = json[styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY];
            if (styleUtils.isImagePathBase64Encoded(currentPath)) {
                return styleUtils.processEncodedImage(preProcessBackgroundPropertyDataJson, imageSrc);
            } else {
                return styleUtils.processImageOnServer(preProcessBackgroundPropertyDataJson, imageSrc);
            }
        }
    };

    /**
     * upload image to local asset folder.
     */
    styleUtils.processEncodedImage = function (preProcessBackgroundPropertyDataJson, imageSrc) {
        if (preProcessBackgroundPropertyDataJson && preProcessBackgroundPropertyDataJson[imageSrc]) {
            var properties = preProcessBackgroundPropertyDataJson[imageSrc],
                base64Url = properties[styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY],
                imageName = imageSrc.substring(imageSrc.lastIndexOf("/") + 1),
                uploadLocation = imageSrc.substring(0, imageSrc.lastIndexOf("/")),
                uploadUrl = Granite.HTTP.externalize(styleUtils.makePathAbsolute(uploadLocation)),
                imageBlob = styleUtils.dataURItoBlob(base64Url),
                formData = new FormData();
            formData.append(imageName, imageBlob);
            return $.ajax({
                type : 'POST',
                url : uploadUrl,
                data : formData,
                processData : false,
                contentType : false
            });
        }
    };

    /**
     * copy images present on server to current location.
     */
    styleUtils.processImageOnServer = function (preProcessBackgroundPropertyDataJson, imageSrc) {
        if (preProcessBackgroundPropertyDataJson && preProcessBackgroundPropertyDataJson[imageSrc]) {
            var properties = preProcessBackgroundPropertyDataJson[imageSrc],
                fromUrl = properties[styleConstants.BACKGROUND_ABSOLUTE_URL_PROPERTY],
                imageName = fromUrl.substring(fromUrl.lastIndexOf("/") + 1),
                toUrl = style.vars.styleAssetsPrefixPath + "/" + style.vars.styleAssetsRelativePath,
                operation = imageName + "@CopyFrom",
                data = {};
            data[operation] = fromUrl;
            return $.ajax({
                url : toUrl,
                type : "POST",
                data : data
            });
        }
        return {};
    };

    /**
     * extract property value from key value pair.
     */
    styleUtils.extractPropertyValue = function (keyValuePair) {
        var property = keyValuePair.substring(0, keyValuePair.indexOf(":")),
            value = keyValuePair.substring(keyValuePair.indexOf(":") + 1),
            result = {};
        result.property = property;
        result.value = value;
        return result;
    };

    /**
     *  return promise object from reading image file.
     */
    styleUtils.readImageFile = function (file) {
        var reader = new FileReader(),
            deferred = $.Deferred();

        reader.onload = function (event) {
            deferred.resolve(event.target.result);
        };

        reader.onerror = function () {
            deferred.reject(this);
        };
        reader.readAsDataURL(file);
        return deferred.promise();
    };

    /**
     * read image from the server.
     */
    styleUtils.readImageFromServer = function (url) {
        var xhr = new XMLHttpRequest(),
            deferred = $.Deferred();
        xhr.open('GET', Granite.HTTP.externalize(url), true);
        xhr.responseType = 'blob';

        xhr.onload = function (e) {
            if (this.status == 200) {
                // get binary data as a response
                deferred.resolve(this.response);
            } else {
                deferred.reject(this);
            }
        };
        xhr.onerror = function () {
            deferred.reject(this);
        };
        xhr.send();
        return deferred.promise();
    };

    /**
     * convert base64 to blob;
     */
    styleUtils.dataURItoBlob = function (dataURI) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]),
            // separate out the mime component
            mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],
            // write the bytes of the string to an ArrayBuffer
            ab = new ArrayBuffer(byteString.length),
            ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        // write the ArrayBuffer to a blob, and you're done
        var bb = new Blob([ab], {type : mimeString});
        return bb;
    };

    /**
     * alert server error.
     */
    styleUtils.getAlertServerErrorFn = function (message, messageHeading) {
        return function () {
            var notificationInfo = {};
            messageHeading = messageHeading || styleConstants.DEFAULT_ERROR_MESSAGE_HEADING_LOC;
            message = message || styleConstants.DEFAULT_ERROR_MESSAGE_LOC;
            notificationInfo.content = CQ.I18n.get(message);
            notificationInfo.heading = CQ.I18n.get(messageHeading);
            notificationInfo.closable = false;
            notificationInfo.type = Granite.author.ui.helpers.PROMPT_TYPES.ERROR;
            Granite.author.notifications.notify(notificationInfo);
        };
    };
    styleUtils.getMsDropDown = function (selectItem) {
        return $(selectItem).msDropDown().data("dd");
    };

}(window._, $, window.guidelib.touchlib.style));
