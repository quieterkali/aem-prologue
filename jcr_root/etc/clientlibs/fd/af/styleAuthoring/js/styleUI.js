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
    var styleUtils = style.utils,
        styleConstants = style.constants,
        styleVars = style.vars = style.vars || {},
        styleUI = style.ui = style.ui || {},
        stylePropertySheetContainerSelector = "#" + styleConstants.STYLE_PROPERTY_SHEET_CONTAINER;

    styleUI.clearPropertySheet = function () {
        //First clear the property sheet by resetting all the values
        //TODO: Ideally the form should adaptTo foundation-form and call reset
        var properties = $("[data-csspropertyname],[data-uipropertyname]");
        for (var i = 0; i < properties.length; i++) {
            var value = "";
            $(properties[i]).adaptTo("foundation-field").setValue(value);
            properties[i].invalid = false;
        }
    };

    styleUI._internalAddPropertyToJson = function (propertyString, json) {
        if (propertyString.indexOf(':') > 0) {
            var key = propertyString.substring(0, propertyString.indexOf(':')),
                value = propertyString.substring(propertyString.indexOf(':') + 1);
            json[key] = value;
        }
    };

    /**
     * populate property sheet with css and ui properties.
     * @param {Object} cssPropertiesList list of css properties.
     * @param {Object} uiPropertiesList list of ui properties.
     * @param {Object} maskedPropertiesList list of properties which are masked.
     * @param {Function} callbackFn A function to be executed after setting properties on the widget like trigger change event.
     */
    styleUI._internalPopulatePropertySheet = function (cssPropertiesList, uiPropertiesList, maskedPropertiesList, callbackFn) {
        var cssProperties = {},
            uiProperties = {};
        _.each(cssPropertiesList, function (item) {
            styleUI._internalAddPropertyToJson(item, cssProperties);
        });
        _.each(uiPropertiesList, function (item) {
            styleUI._internalAddPropertyToJson(item, uiProperties);
        });
        if (cssProperties) {
            var keys = Object.keys(cssProperties),
                i,
                key,
                $element,
                value;
            for (i = 0; i < keys.length; i++) {
                try {
                    key = keys[i];
                    $element = $("[data-csspropertyname='" + key + "']");

                    if ($element && $element.length > 0) {
                        value = cssProperties[key];
                        $element.adaptTo("foundation-field").setValue(value);
                        styleUI.updateMaskButton(key, $element, maskedPropertiesList);
                        if ($element[0]._validateInputValue) {
                            $element[0]._validateInputValue();
                        }
                        style.validateCSSProperty($element.get(0));
                        if (callbackFn) {
                            callbackFn($element);
                        }
                    }
                }catch (e) {
                    if (console) {
                        console.log("Unable to set property " + key + " for to UI - " + e.message);
                    }
                }
            }
        }
        if (uiProperties) {
            keys = Object.keys(uiProperties);
            for (i = 0; i < keys.length; i++) {
                try {
                    key = keys[i];
                    $element = $("[data-uipropertyname='" + key + "']");
                    if ($element && $element.length > 0) {
                        value = uiProperties[key];
                        $element.adaptTo("foundation-field").setValue(value);
                        styleUI.updateMaskButton(key, $element, maskedPropertiesList);
                        if (callbackFn) {
                            callbackFn($element);
                        }
                    } else {
                        //if uiProperty field is not there then search for cssProperty field
                        $element = $("[data-csspropertyname='" + key + "']");
                        if ($element && $element.length > 0) {
                            value = uiProperties[key];
                            $element.adaptTo("foundation-field").setValue(value);
                            styleUI.updateMaskButton(key, $element, maskedPropertiesList);
                            if (callbackFn) {
                                callbackFn($element);
                            }
                        }
                    }
                }catch (e) {
                    if (console) {
                        console.log("Unable to set property " + key + " for to UI - " + e.message);
                    }
                }
            }
        }
    };

    styleUI.populatePropertySheet = function () {
        styleVars.currentBreakpoint = Granite.author.responsive.getCurrentBreakpoint();
        styleUtils.setBreakPointInfoHeaderLabel();
        styleUI.unMaskButtons(); //unMask All Mask Buttons in Property Sheet
        if (!(styleVars.json && styleVars.currentBreakpoint && styleVars.currentComponent && styleVars.currentSelector && styleVars.currentState)) {
            return;
        }

        var options = {
                currentBreakpoint : styleVars.currentBreakpoint,
                currentComponent : styleVars.currentComponent,
                currentSelector : styleVars.currentSelector,
                currentState : styleVars.currentState,
                propertyType : "cssProperties",
                property : "*"
            },
            cssProperties,
            uiProperties;
        cssProperties  = styleUtils.getJSonData(options);
        options.propertyType = "uiProperties";
        uiProperties  = styleUtils.getJSonData(options);
        options.propertyType = "maskedProperties";
        maskedProperties = styleUtils.getJSonData(options);
        styleUI.clearPropertySheet();
        style.ui._internalPopulatePropertySheet(cssProperties, uiProperties, maskedProperties);
        //unblock all operations when property sheet is changed
        style.ui.unblockUIForValidations();
        $(document).trigger("style-propertysheet-updated");
    };

    /*
     * unMask All Mask Buttons in Property Sheet.
     */

    styleUI.unMaskButtons = function () {
        var maskButtonSelector = "." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS,
            $maskButtons = $(maskButtonSelector);
        _.each($maskButtons, function (element) {
            $(element).addClass(styleConstants.MASK_OFF_CLASS);
            $(element).removeClass(styleConstants.MASK_ON_CLASS);
        });
    };

    styleUI.registerPropertyChangeHandler = function () {
        $("[data-csspropertyname]").on("foundation-field-change", {
            selectorNodeString : "cssProperties",
            selection : "csspropertyname"
        }, styleUI.propertyChangeHandler);

        $("[data-uipropertyname]").on("foundation-field-change", {
                selectorNodeString : "uiProperties",
                selection : "uipropertyname"
            }, styleUI.propertyChangeHandler
        );

    };

    /* This will be triggered when a property is changed in the property sheet*/
    styleUI.propertyChangeHandler = function (event) {
        if (event.currentTarget === event.target) {
            var selectorNodeString = event.data.selectorNodeString,
                selection = event.data.selection,
                value = $(event.target).adaptTo("foundation-field").getValue(),
                dataElement = $(event.target).closest("[data-" + selection + "]"),
                propertyName = dataElement.data(selection),
                options = {
                    currentBreakpoint : styleVars.currentBreakpoint,
                    currentComponent : styleVars.currentComponent,
                    currentSelector : styleVars.currentSelector,
                    currentState : styleVars.currentState,
                    propertyType : selectorNodeString,
                    propertyName : propertyName,
                    value : value
                },
                jsonPostHandler;
            if (_.isEmpty(styleVars.currentComponent) || _.isEmpty(styleVars.currentSelector)) {
                return;
            }
            styleUtils.updateStyle(options);
        }
    };

    /*
     * Append mask button near label in the property sheet.
     */
    style.ui.appendMaskIcon = function () {
        var stylePropertySheetCssPropertySelector = "." + styleConstants.PROPERTY_SHEET_CSS_PROPERTY_CLASS;
        $.each($(stylePropertySheetCssPropertySelector), function (key, item) {
            var maskButtonIcon = styleConstants.MASK_ON_ICON,
                button = new Coral.Button().set({
                    variant : "quiet",
                    icon : maskButtonIcon,
                    iconSize : "XS",
                    type : "button"
                });
            $(button).addClass(styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS);
            $(button).addClass(styleConstants.MASK_OFF_CLASS);
            $(item).prepend(button);
        });
    };

    /**
     * Registering Mask Unmask Button click.
     */
    style.ui.registerMaskButtonClickHandler = function () {
        var stylePropertySheetMaskButtonClass = "." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS;
        $(stylePropertySheetMaskButtonClass).on("click", style.ui.stylePropertySheetMaskButtonClickHandler);
    };

    /**
     * Handling Mask Unmask Button click.
     */
    style.ui.stylePropertySheetMaskButtonClickHandler = function (e) {
        e.stopPropagation();
        var button = e.currentTarget,
            $button = $(button),
            component = styleVars.currentComponent,
            selector = styleVars.currentSelector,
            state = styleVars.currentState,
            breakpoint = styleVars.currentBreakpoint,
            stylePropertySheetCssPropertySelector = "." + styleConstants.PROPERTY_SHEET_CSS_PROPERTY_CLASS,
            $cssPropertiesObjects = $button.closest(stylePropertySheetCssPropertySelector).find("[data-csspropertyname]"),
            $uiPropertiesObjects = $button.closest(stylePropertySheetCssPropertySelector).find("[data-uipropertyname]"),
            json = style.vars.json.components,
            operation = ($button.hasClass(styleConstants.MASK_ON_CLASS) == true ? styleConstants.UNMASK_OPERATION : styleConstants.MASK_OPERATION),
            options = {
                currentComponent : component,
                currentSelector : selector,
                currentState : state,
                currentBreakpoint : breakpoint,
                operation : operation,
                json : json
            },
            maskedPropertiesList = [];
        _.each($cssPropertiesObjects, function (element) {
            var listElement = {
                property : $(element).attr("data-csspropertyname"),
                propertyType : "cssProperties",
                value : $(element).adaptTo("foundation-field").getValue()
            };
            maskedPropertiesList.push(listElement);
        });
        _.each($uiPropertiesObjects, function (element) {
            var listElement = {
                property : $(element).attr("data-uipropertyname"),
                propertyType : "uiProperties",
                value : $(element).adaptTo("foundation-field").getValue()
            };
            maskedPropertiesList.push(listElement);
        });
        _.each(maskedPropertiesList, function (listObject) {
            options.propertyName = listObject.property;
            options.propertyType = listObject.propertyType;
            options.value = listObject.value;
            styleUtils.maskUnmaskProperty(options);
        });
    };

    /* Selector is changed , load the new property sheet if required and populate it*/
    styleUtils.updateSelector = function () {
        //TODO: the parameter name change needs to be done, and this code needs to be modularized
        var leftRailHeaderText = styleUtils.getLeftRailHeaderText();
        var $leftRail = $("[data-styleobjectname=themeLeftRail]");
        var $leftRailHeader = $leftRail.find("coral-anchorbutton-label");
        $leftRailHeader.text(CQ.I18n.get(leftRailHeaderText));
        var newPropertySheet = styleUtils.getSelectorMetaData(styleVars.currentComponent, styleVars.currentSelector, "propertySheet");
        if (!newPropertySheet) {
            // If not present in the selector then Set the default property Sheet
            newPropertySheet = styleConstants.DEFAULT_PROPERTY_SHEET_PATH;
        }
        if (styleVars.currentPropertySheet == newPropertySheet) {
            styleUtils.triggerWaitEvent($(stylePropertySheetContainerSelector), 300);
            styleUtils.processSelectorUpdated();
        } else {
            var isFirstPropertySheetLoaded = (style.vars.currentPropertySheet ? false : true);
            styleVars.currentPropertySheet = newPropertySheet;
            if (styleVars.propertySheetMap[styleVars.currentPropertySheet]) {
                styleUtils.triggerWaitEvent($(stylePropertySheetContainerSelector), 300);
                $("#style-propertysheet").html(styleVars.propertySheetMap[styleVars.currentPropertySheet]);
                $(document).trigger("foundation-contentloaded");
                styleUtils.processSelectorUpdated();
            } else {
                styleUtils.triggerWaitEvent($(stylePropertySheetContainerSelector), "hideWait");
                jQuery.ajax({
                        url : Granite.HTTP.externalize(styleVars.currentPropertySheet + ".html"),
                        data : {name : styleVars.currentSelector,
                                themePath : styleUtils.getThemePath() + "/jcr:content"},
                        async : true,
                        type : "GET"
                    }).done(function (data) {
                        styleVars.currentBreakpoint = Granite.author.responsive.getCurrentBreakpoint();
                        styleVars.propertySheetMap[styleVars.currentPropertySheet] = data;
                        $("#style-propertysheet").html(data);
                        $(document).trigger("foundation-contentloaded");
                        Coral.commons.ready($("#style-propertysheet").get(0), function () {
                            styleUI.preprocessPropertySheet(isFirstPropertySheetLoaded);
                            styleUtils.processSelectorUpdated();
                            styleUI.resetAssetLibraryWidgets();
                        });
                        $(document).trigger("hideWait");
                    }).fail(function (data) {
                        if (console) {
                            console.log("[DEBUG]: " + "Property Sheet not found.");
                        }
                    });
            }
        }
    };

    /**
     * Updating Mask Button Icons.
     * @param {string} propertyName - the property to be masked.
     * @param {string} $element - Element which needs to be masked.
     * @param {Object} maskedPropertiesList - List of properties which are masked.
     */
    styleUI.updateMaskButton = function (propertyName, $element, maskedPropertiesList) {
        if ($element && !_.isEmpty($element) && propertyName) {
            maskedProperties = maskedProperties || [];
            var elementMaskButton = $element.closest("." + styleConstants.PROPERTY_SHEET_CSS_PROPERTY_CLASS).find("." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS).get(0),
                $elementMaskButton = $(elementMaskButton);
            if (elementMaskButton) {
                if (maskedPropertiesList && maskedPropertiesList.indexOf(propertyName) != -1) {
                    styleUI.updateMaskIcons($elementMaskButton, true);
                } else {
                    styleUI.updateMaskIcons($elementMaskButton, false);
                }
            }
        }
    };

    styleUI.updateMaskIcons = function ($maskButton, isMasked) {
        if (isMasked) {
            $maskButton.removeClass(styleConstants.MASK_OFF_CLASS).addClass(styleConstants.MASK_ON_CLASS);
        } else {
            $maskButton.removeClass(styleConstants.MASK_ON_CLASS).addClass(styleConstants.MASK_OFF_CLASS);
        }
    };

    styleUI.preprocessPropertySheet = function (isFirstPropertySheetLoaded) {
        var styleAssetLib = style.assetLibrary;
        styleUI.appendMaskIcon(); //appending mask icons to default property sheet.
        styleUI.registerMaskButtonClickHandler();
        styleUI.registerPropertyChangeHandler();
        $(document).trigger({
            type : "style-propertysheet-created",
            isFirstPropertySheetLoaded : isFirstPropertySheetLoaded
        });
    };

    /**
     * reset values of asset library widgets like textStyleselect to select etc.
     */
    styleUI.resetAssetLibraryWidgets = function () {
        //set select to no value;
        if (!_.isEmpty($(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR))) {
            styleUtils.getMsDropDown($(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR).get(0)).set("selectedIndex", 0);
        }
        if (!_.isEmpty($(styleConstants.TEXT_STYLE_SAVE_BUTTON_SELECTOR))) {
            $(styleConstants.TEXT_STYLE_SAVE_BUTTON_SELECTOR).get(0).set("disabled", true);
        }
        if (!_.isEmpty($(styleConstants.TEXT_STYLE_SAVE_INPUT_SELECTOR))) {
            $(styleConstants.TEXT_STYLE_SAVE_INPUT_SELECTOR).get(0).set("value", (CQ.I18n.get(styleUtils.getLeftRailHeaderText())));
        }
    };
}(window._, $, window.guidelib.touchlib.style));
