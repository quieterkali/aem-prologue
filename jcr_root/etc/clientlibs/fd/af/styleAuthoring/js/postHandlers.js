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
        styleUtils = style.utils;

    /*
     *   POST HANDLERS FOR STYLING
     */
    styleUtils.addJsonPostHandler = function (component, selector, jsonPostHandler) {
        if (!style.vars.jsonPostHandler[component]) {
            style.vars.jsonPostHandler[component] = {};
        }
        style.vars.jsonPostHandler[component][selector] = jsonPostHandler;
    };

    //Tooltip
    styleUtils.tooltipPostHandler = function (cssSelector, options) {
        if (options.propertyName === 'background') {
            //fetch background-color value
            var getJsonOptions = {
                    currentBreakpoint : options.currentBreakpoint,
                    currentComponent : options.currentComponent,
                    currentSelector : options.currentSelector,
                    currentState : options.currentState,
                    propertyType : "uiProperties",
                    property : "backgroundColor"
                },
                value = styleUtils.getOriginalValue(getJsonOptions);
            options.propertyType = "cssProperties";
            options.propertyName = "addonCss";
            options.operation = "";
            options.value =  {};
            if (value != "") {
                //adding the addonCss
                options.value.selectors = options.value.selectors || {};
                options.value.selectors.tip = options.value.selectors.tip || {};
                options.value.selectors.tip.cssSelector = ".guideContainerWrapperNode .tooltip.bottom .tooltip-arrow";
                options.value.selectors.tip.properties = options.value.selectors.tip.properties || {};
                options.value.selectors.tip.properties["border-bottom-color"] = value;
            }
            styleUtils.setJSonData(options);
        }
    };

    //Button
    styleUtils.buttonPostHandler = function (cssSelector, options) {
        var propertyList = ['width', 'max-width', 'min-width', 'float', 'display', 'position', 'top', 'bottom', 'left', 'right'];
        if (_.contains(propertyList, options.propertyName)) {
            styleUtils.widgetLabelPostHandler(cssSelector, options);
            var getJsonOptions = {
                currentBreakpoint : options.currentBreakpoint,
                currentComponent : options.currentComponent,
                currentSelector : options.currentSelector,
                currentState : options.currentState,
                propertyType : "uiProperties",
                property : "width"
            };
            //If button width is set, then button should have 100% of parent width
            var value = styleUtils.getOriginalValue(getJsonOptions);
            if (value && value != "") {
                getJsonOptions = {
                    currentBreakpoint : options.currentBreakpoint,
                    currentComponent : options.currentComponent,
                    currentSelector : options.currentSelector,
                    currentState : options.currentState,
                    propertyType : "cssProperties",
                    property : "addonCss"
                };
                options.value = options.value || {};
                options.value.selectors = options.value.selectors || {};
                options.value.selectors.button = options.value.selectors.button || {};
                options.value.selectors.button.cssSelector = cssSelector + " button";
                options.value.selectors.button.properties = options.value.selectors.button.properties || {};
                options.value.selectors.button.properties.width = "100%";

                //adding the addonCss
                options.propertyType = "cssProperties";
                options.propertyName = "addonCss";
                options.operation = "";
                styleUtils.setJSonData(options);
            }
        }
    };

    //Label
    styleUtils.widgetLabelPostHandler = function (cssSelector, options) {
        var uiJson,
            cssJson,
            value,
            getJsonOptions,
            propertyList = ['width', 'max-width', 'min-width', 'float', 'display', 'position', 'top', 'bottom', 'left', 'right'];

        if (_.contains(propertyList, options.propertyName)) {
            options.operation = "";
            options.json = style.vars.json.components;
            var maskedPropertiesList = styleUtils.getMaskPropertiesList(options);
            value  = options.value;
            //For max and min width both parent and the selector should have this property set
            if (options.propertyName !== 'min-width' && options.propertyName !== 'max-width') {

                //removing the propertyName as cssProperty
                options.value = '';
                styleUtils.setJSonData(options);

                //adding the propertyName as uiProperty
                options.value = value;
                options.propertyType = "uiProperties";
                styleUtils.setJSonData(options);
            }

            getJsonOptions = {
                currentBreakpoint : options.currentBreakpoint,
                currentComponent : options.currentComponent,
                currentSelector : options.currentSelector,
                currentState : options.currentState,
                propertyType : "uiProperties",
                property : "*"
            };
            uiJson = styleUtils.getJSonData(getJsonOptions);

            getJsonOptions = {
                currentBreakpoint : options.currentBreakpoint,
                currentComponent : options.currentComponent,
                currentSelector : options.currentSelector,
                currentState : options.currentState,
                propertyType : "cssProperties",
                property : "*"
            };
            cssJson = styleUtils.getJSonData(getJsonOptions);

            //adding the addonCss
            options.propertyType = "cssProperties";
            options.propertyName = "addonCss";

            options.value = {};
            options.value.selectors = options.value.selectors || {};
            options.value.selectors.parent = options.value.selectors.parent || {};
            options.value.selectors.parent.cssSelector = cssSelector;
            options.value.selectors.parent.properties = options.value.selectors.parent.properties || {};
            getJsonOptions = {
                currentBreakpoint : options.currentBreakpoint,
                currentComponent : options.currentComponent,
                currentSelector : options.currentSelector,
                currentState : options.currentState,
                json : options.json,
                property : "",
                propertyType : ""
            };
            _.each(propertyList, function (property) {
                if (property === 'min-width' || property === 'max-width') {
                    if (styleUtils.arrayHasProperty(cssJson, property)) {
                        getJsonOptions.propertyType = "cssProperties";
                        getJsonOptions.property = property;
                        if (styleUtils.getOriginalValue(getJsonOptions) && styleUtils.getOriginalValue(getJsonOptions) != "") {
                            options.value.selectors.parent.properties[property] = styleUtils.getOriginalValue(getJsonOptions);
                        }
                    }
                } else {
                    if (styleUtils.arrayHasProperty(uiJson, property)) {
                        getJsonOptions.propertyType = "uiProperties";
                        getJsonOptions.property = property;
                        if (styleUtils.getOriginalValue(getJsonOptions) && styleUtils.getOriginalValue(getJsonOptions) != "") {
                            options.value.selectors.parent.properties[property] = styleUtils.getOriginalValue(getJsonOptions);
                        }
                    }
                }
            });
            if (_.isEmpty(options.value.selectors.parent.properties)) {
                options.value = {};
            }
            styleUtils.setJSonData(options);
        }
    };

    //wizard navigators
    styleUtils.wizardNavigationTitlePostHandler = function (cssSelector, options) {
        var propertyList = ['width', 'max-width', 'min-width'];
        if (_.contains(propertyList, options.propertyName)) {
            styleUtils.widgetLabelPostHandler(cssSelector, options);
            var getJsonOptions = {
                currentBreakpoint : options.currentBreakpoint,
                currentComponent : options.currentComponent,
                currentSelector : options.currentSelector,
                currentState : options.currentState,
                propertyType : "uiProperties",
                property : "width"
            };
            //If button width is set, then button should have 100% of parent width
            var value = styleUtils.getOriginalValue(getJsonOptions);
            if (value && value != "") {
                getJsonOptions = {
                    currentBreakpoint : options.currentBreakpoint,
                    currentComponent : options.currentComponent,
                    currentSelector : options.currentSelector,
                    currentState : options.currentState,
                    propertyType : "cssProperties",
                    property : "addonCss"
                };
                options.value = options.value || {};
                options.value.selectors = options.value.selectors || {};
                options.value.selectors.title = options.value.selectors.title || {};
                options.value.selectors.title.cssSelector = cssSelector + " > a";
                options.value.selectors.title.properties = options.value.selectors.title.properties || {};
                options.value.selectors.title.properties.width = "100%";

                //adding the addonCss
                options.propertyType = "cssProperties";
                options.propertyName = "addonCss";
                options.operation = "";
                styleUtils.setJSonData(options);
            }
        }
    };

}(window._, $, window.guidelib.touchlib.style));
