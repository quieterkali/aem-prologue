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

    var registry = $(window).adaptTo("foundation-registry"),
        styleConstants = style.constants,
        coralSelector = "[data-uipropertyname='shadowContainer']";

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector,
        adapter : function (el) {
            var $uiPropertyField = $(el);
            var $shadowContainer = $uiPropertyField.parent();

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
                    populateUI($shadowContainer, processedJson);
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
    function isEmpty(value) {
        if (value === null || value.trim() === "" || parseFloat(value) === 0) {
            return true;
        }
        return false;
    }

    function spliceEmptyEntries(localJson) {

        if (localJson.itemList) {
            for (var i = 0; i < localJson.itemList.length; i++) {
                /*
                 * Shadow entry removed from table if all entries empty.
                */
                var listItem = localJson.itemList[i],
                    isShadowHorizontalEmpty = isEmpty(listItem.shadowHorizontal),
                    isShadowVerticalEmpty = isEmpty(listItem.shadowVertical),
                    isShadowBlurEmpty = isEmpty(listItem.shadowBlur),
                    isShadowSpreadEmpty = isEmpty(listItem.shadowSpread);
                if (isShadowHorizontalEmpty && isShadowVerticalEmpty && isShadowBlurEmpty && isShadowSpreadEmpty) {
                    localJson.itemList.splice(i, 1);
                } else {
                    /*
                     * shadow horizontal and shadow vertical
                     * default values.
                    */
                    if (isShadowHorizontalEmpty) {
                        listItem.shadowHorizontal = "0px";
                    }
                    if (isShadowVerticalEmpty) {
                        listItem.shadowVertical = "0px";
                    }
                }
            }
        }

        return localJson;
    };

    function populateUI($shadowContainer, localJson) {

        var uiListItems = $shadowContainer.find("[data-mvfield-elementtype='listItem']");
        var uiListSize = uiListItems.size();
        var jsonArraySize = (localJson.itemList ? localJson.itemList.length : 0);
        var jsonItem;
        var i,j;

        if (uiListSize < jsonArraySize) {
            // Case : New item needs to be populated on UI
            for (i = uiListSize; i < jsonArraySize; i++) {
                jsonItem = localJson.itemList[i];
                var shadowItemHtml = "<tr is='coral-table-row' class='foundation-collection-item' itemprop='item' itemscope data-mvfield-elementtype='listItem' data-id=" + jsonItem["id"] + ">" +
                "<td is='coral-table-cell'><coral-icon title='Reorder' icon='dragHandle' size='S' class='hideCoralIcon' coral-table-roworder></coral-icon></td>" +
                "<td is='coral-table-cell'><button is='coral-button' type='button' variant='quiet' icon='" + styleConstants.MASK_ON_ICON + "' class='" + styleConstants.MASK_OFF_CLASS + " " + styleConstants.MULTI_VALUE_FIELD_MASK_BUTTON_CLASS + "' iconsize='XS' data-mvfield-elementtype='button-maskItem'></button></td>" +
                "<td is='coral-table-cell'><div id='style-shadowThumbnail'></div></td>" +
                "<td is='coral-table-cell'><coral-icon title='Edit' class='hideCoralIcon' icon='edit' size='XS' data-mvfield-elementtype='button-editItem'></coral-icon></td>" +
                "<td is='coral-table-cell'><coral-icon title='Remove' class='hideCoralIcon' icon='delete' size='XS' data-mvfield-elementtype='button-deleteItem'></coral-icon></td></tr>";

                var boxShadowValue = getCssPropertyValue(jsonItem);
                // The following manipulation is done only to be able to show the shadow in the list item on the UI.
                // This will not be the actual value that persists.
                if (boxShadowValue.indexOf("inset") == -1) {
                    boxShadowValue = boxShadowValue + " inset";
                }
                var $shadowItem = $(shadowItemHtml),
                    $shadowItemMaskButton = $shadowItem.find("[data-mvfield-elementtype='button-maskItem']");
                if (jsonItem.isMasked == true) {
                    style.ui.updateMaskIcons($shadowItemMaskButton, true);
                } else {
                    style.ui.updateMaskIcons($shadowItemMaskButton, false);
                }
                $shadowItem.find("#style-shadowThumbnail").css("box-shadow", boxShadowValue);

                $shadowItem.find("[data-mvfield-elementtype='button-editItem']").on("click", theme.mvField.listItemClickHandler);
                $shadowItem.find("[data-mvfield-elementtype='button-deleteItem']").on("click", theme.mvField.itemDeleteClickHandler);
                $shadowItem.find("[data-mvfield-elementtype='button-maskItem']").on('click', theme.mvField.itemMaskClickHandler);
                $(".style-shadowTable").find("tbody").append($shadowItem);
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
                var boxShadowValue = getCssPropertyValue(jsonItem);
                // The following manipulation is done only to be able to show the shadow in the list item on the UI.
                // This will not be the actual value that persists.
                if (boxShadowValue.indexOf("inset") == -1) {
                    boxShadowValue = boxShadowValue + " inset";
                }
                $(uiListItems[i]).find("#style-shadowThumbnail").css("box-shadow", boxShadowValue);
            }
        }
    };

    /**
     * This method transforms shadow json value to shadow css property value
     * @param listItem
     * @param bgColor
     * @returns {string}
     */
    function getCssPropertyValue(listItem) {

        var propertyElement = "";
        if (listItem.shadowHorizontal && listItem.shadowHorizontal != ""
            && listItem.shadowVertical && listItem.shadowVertical != "") {

            var shadowBlur = listItem.shadowBlur || "";
            var shadowSpread = listItem.shadowSpread || "";
            var shadowColor = listItem.shadowColor || "";
            var shadowPosition = listItem.shadowPosition || "";
            propertyElement = listItem.shadowHorizontal + " " + listItem.shadowVertical + " " + shadowBlur + " " + shadowSpread + " " + shadowColor + " " + shadowPosition;

        }
        return propertyElement.trim();
    };

    /*
        This event will be caught whenever the value of shadow Json is changed.
        This shadow json is stored on a hidden input field with data attr set as 'shadowContainer'
     */
    $(document).on("style-propertysheet-created" , function () {

        /*
           Setting the default values on shadow popover.
           This will set default values only when user clicks on 'Add' button.
           User can change these values here(on this popover) and while clicking on pencil icon(for update) as well.
        */
        $(".style-addshadowbutton").click(function () {

            var $h = $("input[data-mvfield-elementproperty='shadowHorizontal']");
            $h.adaptTo("foundation-field").setValue("0px");
            $h.change();

            var $v = $("input[data-mvfield-elementproperty='shadowVertical']");
            $v.adaptTo("foundation-field").setValue("1px");
            $v.change();

            var $b = $("input[data-mvfield-elementproperty='shadowBlur']");
            $b.adaptTo("foundation-field").setValue("10px");
            $b.change();

            var $s = $("input[data-mvfield-elementproperty='shadowSpread']");
            $s.adaptTo("foundation-field").setValue("0px");
            $s.change();

            var $color = $("coral-colorinput[data-mvfield-elementproperty='shadowColor']");
            $color.adaptTo("foundation-field").setValue("rgba(0,0,0,0.3)");
            $color.change();

            var $i = $("input[data-csspropertyname='box-shadow']");
            $i.adaptTo("foundation-field").setValue("0px 1px 10px 0px rgba(0,0,0,0.3)");
            $i.change();

        });

        $(coralSelector).on("change", function (e) {

            var shadowPropertyValue = "";

            var localJson = JSON.parse($(e.target).adaptTo("foundation-field").getValue() || "{}");
            if (localJson.itemList) {
                for (var i = 0; i < localJson.itemList.length; i++) {
                    var listItem = localJson.itemList[i];
                    if (listItem.isMasked != true) {
                        if (!_.isEmpty(shadowPropertyValue)) {
                            shadowPropertyValue = shadowPropertyValue + ",";
                        }
                        shadowPropertyValue = shadowPropertyValue + getCssPropertyValue(listItem);
                    }
                }
            }
            var cssPropertyField = $("[data-csspropertyname='box-shadow']");
            cssPropertyField.adaptTo("foundation-field").setValue(shadowPropertyValue);
            $(e.target).trigger("foundation-field-change");
            cssPropertyField.trigger("foundation-field-change");
        });
    });

}(window.jQuery, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
