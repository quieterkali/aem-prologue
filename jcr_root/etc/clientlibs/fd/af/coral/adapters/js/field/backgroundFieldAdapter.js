// jscs:disable requireDotNotation
/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
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
 * ***********************************************************************
 */

;(function ($, theme, style) {

    var registry = $(window).adaptTo("foundation-registry");

    var styleUtils = style.utils,
        styleConstants = style.constants;

    var coralSelector = "[data-uipropertyname='backgroundContainer']";

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector,
        adapter : function (el) {
            var $uiPropertyField = $(el);
            var $bgContainer = $uiPropertyField.parent();

            return {
                getName : function () {
                    return el.name;
                },
                isDisabled : function () {
                    return el.disabled;
                },
                setDisabled : function (disabled) {
                    el.disabled = disabled;
                },
                isInvalid : function () {
                    return el.invalid;
                },
                setInvalid : function (invalid) {
                    el.invalid = invalid;
                },
                isRequired : function () {
                    if ($(el).is("input, textarea")) {
                        return el.getAttribute("aria-required") === "true";
                    } else {
                        return el.required;
                    }
                },
                setRequired : function (required) {
                    if ($(el).is("input, textarea")) {
                        el.setAttribute("aria-required", !!required ? "true" : "false");
                    } else {
                        el.required = required;
                    }
                },
                getValue : function () {
                    return el.value;
                },
                setValue : function (value) {
                    var processedJson = spliceEmptyEntries(JSON.parse(value || "{}")),
                        value = "";
                    if (!_.isEmpty(processedJson) && !_.isEmpty(processedJson.itemList)) {
                        value = JSON.stringify(processedJson);
                    }
                    el.value = value;
                    populateUI($bgContainer, processedJson);
                },
                getValues : function () {
                    if ("values" in el) {
                        return el.values;
                    } else {
                        return [el.value];
                    }
                },
                setValues : function (values) {
                    if ("values" in el) {
                        el.values = values;
                    } else {
                        el.value = values[0];
                    }
                },
                reset : function () {
                    setValue("");
                }
            };
        }
    });

    function spliceEmptyEntries(localJson) {

        if (localJson.itemList) {
            for (var i = 0; i < localJson.itemList.length; i++) {
                var listItem = localJson.itemList[i];
                if ((listItem["id"].indexOf("image") != -1
                    && (listItem["imageSrc"] == null || listItem["imageSrc"] == ""))
                    || (listItem["id"].indexOf("gradient") != -1
                    && (listItem["color1"] == null || listItem["color2"] == null
                    || listItem["color1"] == "" || listItem["color2"] == ""))) {
                    localJson.itemList.splice(i, 1);
                }
            }
        }

        return localJson;
    };

    function populateUI($bgContainer, localJson) {

        var uiListItems = $bgContainer.find("[data-mvfield-elementtype='listItem']");
        var uiListSize = uiListItems.size();
        var jsonArraySize = (localJson.itemList ? localJson.itemList.length : 0);
        var jsonItem;
        var i,j;

        if (uiListSize < jsonArraySize) {
            // Case : New item needs to be populated on UI
            for (i = uiListSize; i < jsonArraySize; i++) {
                jsonItem = localJson.itemList[i];
                var bgItemHtml = "<tr is='coral-table-row' class='foundation-collection-item' itemprop='item' itemscope data-mvfield-elementtype='listItem' data-id=" + jsonItem["id"] + ">" +
                "<td is='coral-table-cell'><coral-icon title='Reorder' icon='dragHandle' size='S' class='hideCoralIcon' coral-table-roworder></coral-icon></td>" +
                "<td is='coral-table-cell'><button is='coral-button' variant='quiet' type='button' icon = '" + styleConstants.MASK_ON_ICON + "' class='" + styleConstants.MASK_OFF_CLASS + " " + styleConstants.MULTI_VALUE_FIELD_MASK_BUTTON_CLASS + "' iconsize='XS' data-mvfield-elementtype='button-maskItem'></button></td>" +
                "<td is='coral-table-cell'><div id='style-bgThumbnail'></div></td>" +
                "<td is='coral-table-cell'><coral-icon title='Edit' class='hideCoralIcon' icon='edit' size='XS' data-mvfield-elementtype='button-editItem'></coral-icon></td>" +
                "<td is='coral-table-cell'><coral-icon title='Remove' class='hideCoralIcon' icon='delete' size='XS' data-mvfield-elementtype='button-deleteItem'></coral-icon></td></tr>";

                var $bgItem = $(bgItemHtml),
                    $bgItemMaskButton = $bgItem.find("[data-mvfield-elementtype='button-maskItem']");
                if (jsonItem["isMasked"] == true) {
                    style.ui.updateMaskIcons($bgItemMaskButton, true);
                } else {
                    style.ui.updateMaskIcons($bgItemMaskButton, false);
                }
                if (jsonItem["id"].indexOf("image") != -1) {
                    $bgItem.find("#style-bgThumbnail").css("background-image", "url('" +  CQ.shared.HTTP.externalize(styleUtils.makePathAbsolute(styleUtils.getCurrentImagePath(jsonItem.imageSrc))) + "')");
                } else {
                    $bgItem.find("#style-bgThumbnail").css("background", getCssPropertyValue(jsonItem));
                }

                $bgItem.find("[data-mvfield-elementtype='button-editItem']").on("click", theme.bgComponent.listItemClickHandler);
                $bgItem.find("[data-mvfield-elementtype='button-deleteItem']").on("click", theme.mvField.itemDeleteClickHandler);
                $bgItem.find("[data-mvfield-elementtype='button-maskItem']").on('click', theme.mvField.itemMaskClickHandler);
                $(".style-backgroundTable").find("tbody").append($bgItem);
            }
        } else if (uiListSize > jsonArraySize) {
            // Case : An existing item needs to be deleted from the UI
            for (i = 0; i < uiListSize; i++) {
                var $uiListItem = $(uiListItems[i]);
                var isPresent = false;
                for (j = 0; j < jsonArraySize; j++) {
                    if ($uiListItem.data("id") === (localJson.itemList[j].id)) {
                        isPresent = true;
                        break;
                    }
                }
                if (!isPresent) {
                    $uiListItem.remove();
                }
            }
        } else {
            // Case : Items need to be updated
            for (i = 0; i < jsonArraySize; i++) {
                jsonItem = localJson.itemList[i];

                $(uiListItems[i]).attr("data-id", jsonItem.id);
                if (jsonItem["id"].indexOf("image") != -1) {
                    // If there is an entry in preProcessProperties json corresponding to url then retrieve the absolute url.
                    $(uiListItems[i]).find("#style-bgThumbnail").css("background-image", "url('" +  CQ.shared.HTTP.externalize(styleUtils.makePathAbsolute(styleUtils.getCurrentImagePath(jsonItem.imageSrc))) + "')");
                } else {
                    $(uiListItems[i]).find("#style-bgThumbnail").css("background", getCssPropertyValue(jsonItem));
                }
            }
        }
    };

    /**
     * This method transforms background json value to background css property value, based on the type of item provided (Image/Gradient)
     * @param listItem
     * @param bgColor
     * @returns {string}
     */
    function getCssPropertyValue(listItem, bgColor) {

        var propertyElement = "";
        if (listItem["id"].indexOf("image") != -1 && listItem["imageSrc"] && listItem["imageSrc"] != "") {
            var position = listItem["position"] || "left top";
            if (listItem["position"] === "custom") {
                position = (listItem["x-position"] || "0%") + " " + (listItem["y-position"] || "0%");
            }
            var size = listItem["size"] || "";
            if (listItem["size"] === "custom") {
                size = listItem["width"] + " " + listItem["height"];
            }
            if (size != "") {
                position = position + " / " + size;
            }
            propertyElement = "url(" + CQ.shared.HTTP.internalize(listItem.imageSrc) + ")" + " " + position + " " + (listItem.tiling || "") + " " + (listItem.scrolling || "") + " " + (bgColor || "");

        } else if (listItem["id"].indexOf("gradient") != -1
            && listItem["color1"] && listItem["color2"]) {
            if (listItem.gradientType === "radial") {
                var position = (listItem['x-position'] || "50%") + " " + (listItem['y-position'] || "50%");
                propertyElement = "radial-gradient(" + (listItem.radius || "farthest-corner") + " at " + position + "," + listItem.color1 + "," + listItem.color2 + ")";
            } else if (listItem.gradientType === "linear" || !listItem.gradientType) {
                propertyElement = "linear-gradient(" + (listItem.angle || "180deg") + "," + listItem.color1 + "," + listItem.color2 + ")";
            }
        }
        return propertyElement.trim();
    };

    /*
        This event will be caught whenever the value of background Json is changed.
        This background json is stored on a hidden input field with data attr set as 'background-color'
     */
    $(document).on("style-propertysheet-created" , function () {
        $(coralSelector).on("change", function (e) {
            var $backgroundContainerElement = $(e.target), //Multiple Images or gradient Popover Combined Input Field.
                $backgroundColorElement = $backgroundContainerElement.closest(".style-background").find("[data-uipropertyname='backgroundColor']"); //background-color element.
            setBackgroundCssProperty($backgroundColorElement, $backgroundContainerElement);
            $backgroundContainerElement.trigger("foundation-field-change");
        });
        $("[data-uipropertyname=backgroundColor]").on("foundation-field-change", function (e) {
            var $backgroundColorElement = $(e.target), //background-color element.
                $backgroundContainerElement = $backgroundColorElement.closest(".style-background").find("[data-uipropertyname='backgroundContainer']");
            setBackgroundCssProperty($backgroundColorElement, $backgroundContainerElement);
        });
        var $bgColorMaskButton = $("[data-uipropertyname=backgroundColor]").siblings("." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS);
        $bgColorMaskButton.on("click", function (e) {
            var bgColorMaskButton = e.target,
                $bgColorMaskButton = $(bgColorMaskButton),
                $backgroundContainerElement = $bgColorMaskButton.closest(".style-background").find("[data-uipropertyname='backgroundContainer']"),
                $backgroundColorElement = $backgroundContainerElement.closest(".style-background").find("[data-uipropertyname='backgroundColor']");
            setBackgroundCssProperty($backgroundColorElement, $backgroundContainerElement);
        });

        var setBackgroundCssProperty = function ($backgroundColorElement, $backgroundContainerElement) {
            var bgColorMaskButtonSelector = "." + styleConstants.PROPERTY_SHEET_MASK_BUTTON_CLASS,
                $bgColorMaskButton = $backgroundColorElement.siblings(bgColorMaskButtonSelector),
                bgColor = $backgroundColorElement.adaptTo("foundation-field").getValue(), //background-color value.
                localJson = JSON.parse($backgroundContainerElement.adaptTo("foundation-field").getValue() || "{}"), //Multiple Images or gradient Popover Combined value.
                backgroundPropertyValue = "", //computed Background Property Value.
                $cssPropertyField = $backgroundContainerElement.closest(".style-multivalueFieldContainer").find("[data-csspropertyname='background']");
            if (localJson.itemList) {
                for (var i = 0; i < localJson.itemList.length; i++) {
                    var listItem = localJson.itemList[i];
                    if (listItem.isMasked != true) {
                        if (!_.isEmpty(backgroundPropertyValue)) {
                            backgroundPropertyValue = backgroundPropertyValue + ",";
                        }
                        backgroundPropertyValue = backgroundPropertyValue + getCssPropertyValue(listItem);
                    }
                }
            }
            if (!$bgColorMaskButton.hasClass(styleConstants.MASK_ON_CLASS)) {
                if (localJson.itemList && localJson.itemList.length > 0 && bgColor != "" && backgroundPropertyValue != "") {
                    backgroundPropertyValue = backgroundPropertyValue + "," + bgColor;
                } else if (bgColor != "") {
                    backgroundPropertyValue = bgColor;
                }
            }
            $cssPropertyField.adaptTo("foundation-field").setValue(backgroundPropertyValue);
            $cssPropertyField.trigger("foundation-field-change");
        };
    });

}(window.jQuery, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
