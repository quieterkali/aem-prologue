/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2016 Adobe Systems Incorporated
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
        coralSelector = "[data-uipropertyname='fontFamilyFieldContainer']",
        adapter,
        $mvFieldContainer,
        cssFieldSelector = "[data-csspropertyname='font-family']";

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector,
        adapter : function (el) {
            var $uiPropertyField = $(el);
            var $fontFamilyContainer = $uiPropertyField.parent();

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
                    var processedJson = JSON.parse(value || "{}"),
                        value = "";
                    if (!_.isEmpty(processedJson) && !_.isEmpty(processedJson.itemList)) {
                        value = JSON.stringify(processedJson);
                    }
                    el.value = value;
                    populateUI($fontFamilyContainer, processedJson);
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
    };

    function updateFontList(json) {
        var listItems = json.itemList;
        var i, k, fontString = "";
        for (i = 0; i < listItems.length; i++) {
            var font = listItems[i].fontFamily;
            if (!listItems[i].isMasked) {
                if (!_.isEmpty(fontString)) {
                    fontString += ",";
                }
                fontString += font;
            }
        }
        $(cssFieldSelector).adaptTo("foundation-field").setValue(fontString);
        $(cssFieldSelector).change();
    };

    function itemDeleteClickHandler(event) {
        var itemRow = $(event.currentTarget).parents("[data-mvfield-elementtype='listItem']"),
            index = itemRow[0].rowIndex - 1,
            localJson = JSON.parse(adapter.getValue()),
            listItem = localJson.itemList.splice(index, 1);
        updateFontList(localJson);
        adapter.setValue(JSON.stringify(localJson));
        $mvFieldContainer.trigger("change");
    };

    function itemMaskClickHandler(event) {
        var button = event.currentTarget,
            $button = $(button),
            itemRow = $(event.currentTarget).parents("[data-mvfield-elementtype='listItem']"),
            index = itemRow[0].rowIndex - 1,
            localJson = JSON.parse(adapter.getValue()),
            item = localJson.itemList[index];
        if ($button.hasClass(styleConstants.MASK_ON_CLASS)) {
            style.ui.updateMaskIcons($button, false);
        } else {
            style.ui.updateMaskIcons($button, true);
        }
        item.isMasked = ($button.hasClass(styleConstants.MASK_ON_CLASS) ? true : false);
        adapter.setValue(JSON.stringify(localJson));
        updateFontList(localJson);
        $mvFieldContainer.trigger("change");
    };

    function populateUI($fontFamilyContainer, localJson) {
        var uiListItems = $fontFamilyContainer.find("[data-mvfield-elementtype='listItem']"),
            uiListSize = uiListItems.size(),
            jsonArraySize = (localJson.itemList ? localJson.itemList.length : 0),
            jsonItem,
            i,j;

        if (uiListSize < jsonArraySize) {
            // Case : New item needs to be populated on UI
            for (i = uiListSize; i < jsonArraySize; i++) {
                jsonItem = localJson.itemList[i];
                var fontFamilyItemHtml = "<tr is='coral-table-row' class='foundation-collection-item' itemprop='item' itemscope data-mvfield-elementtype='listItem' data-id=" + jsonItem.id + ">" +
                        "<td is='coral-table-cell'><coral-icon title='Reorder' icon='dragHandle' size='S' class='hideCoralIcon' coral-table-roworder></coral-icon></td>" +
                        "<td is='coral-table-cell'><button is='coral-button' type='button' variant='quiet' icon='" + styleConstants.MASK_ON_ICON +  "' class='" + styleConstants.MASK_OFF_CLASS + " " + styleConstants.MULTI_VALUE_FIELD_MASK_BUTTON_CLASS + "' iconsize='XS' data-mvfield-elementtype='button-maskItem'></button></td>" +
                        "<td is='coral-table-cell'><div id='fontFamilyName'></div></td>" +
                        "<td is='coral-table-cell'><coral-icon title='Remove' class='hideCoralIcon' icon='delete' size='XS' data-mvfield-elementtype='button-deleteItem'></coral-icon></td></tr>",
                    $fontFamilyItem = $(fontFamilyItemHtml),
                    fontFamilyValue = getCssPropertyValue(jsonItem),
                    fontFamilyName = getCssPropertyName(jsonItem),
                    $fontFamilyNameDiv = $fontFamilyItem.find("#fontFamilyName"),
                    $fontFamilyItemMaskButton = $fontFamilyItem.find("[data-mvfield-elementtype='button-maskItem']");
                if (jsonItem.isMasked == true) {
                    style.ui.updateMaskIcons($fontFamilyItemMaskButton, true);
                } else {
                    style.ui.updateMaskIcons($fontFamilyItemMaskButton, false);
                }
                $fontFamilyNameDiv.css("font-family", fontFamilyValue);
                $fontFamilyNameDiv.html(CQ.shared.XSS.getXSSValue(fontFamilyName ? fontFamilyName : fontFamilyValue));
                $fontFamilyItem.find("[data-mvfield-elementtype='button-deleteItem']").on("click", itemDeleteClickHandler);
                $fontFamilyItem.find("[data-mvfield-elementtype='button-maskItem']").on('click', itemMaskClickHandler);
                $(".style-fontFamilyTable").find("tbody").append($fontFamilyItem);
            }
        } else if (uiListSize > jsonArraySize) {
            // Case : An existing item needs to be deleted from the UI
            for (i = 0; i < uiListSize; i++) {
                var $uiListItem = $(uiListItems[i]),
                    isPresent = false;
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
            var fontFamilyValue,
                fontFamilyName;
            for (i = 0; i < jsonArraySize; i++) {
                jsonItem = localJson.itemList[i];
                fontFamilyValue = getCssPropertyValue(jsonItem);
                fontFamilyName = getCssPropertyName(jsonItem);
                $(uiListItems[i]).attr("data-id", jsonItem.id);
                $(uiListItems[i]).find("#fontFamilyName").html(CQ.shared.XSS.getXSSValue(fontFamilyName ? fontFamilyName : fontFamilyValue));
                $(uiListItems[i]).find("#fontFamilyName").css("font-family", fontFamilyValue);
            }
        }
    };

    /**
     * This method transforms shadow json value to shadow css property value
     * @param listItem
     * @param fontFamily
     * @returns {string}
     */
    function getCssPropertyValue(listItem) {
        var propertyElement = listItem.fontFamily;
        return propertyElement.trim();
    };

    /**
     * This method transforms shadow json value to shadow css property value
     * @param listItem
     * @returns {string} fontName
     */
    function getCssPropertyName(listItem) {
        if (listItem.fontName) {
            var propertyElement = listItem.fontName;
            return propertyElement.trim();
        }
        return null;
    }

    /*
     This event will be caught whenever the value of shadow Json is changed.
     This shadow json is stored on a hidden input field with data attr set as 'shadowContainer'
     */
    $(document).on("style-propertysheet-created" , function () {
        $("[data-mvfieldFont-inputField='fontFamily']").on("foundation-field-change", function (e) {
            var value = $(e.target).adaptTo("foundation-field").getValue();
            if (value && e.value !== "") {
                addListItemInJson(value, true);
            }
        });
        $("[data-mvfieldFont-inputField='fontFamily'] .js-coral-Autocomplete-textfield").on("keydown", function (e) {
            if (e.keyCode === 13) {
                var value = $(e.target).adaptTo("foundation-field").getValue();
                if (value && e.value !== "") {
                    addListItemInJson(value, false);
                }
            }
        });
        adapter =  $(coralSelector).adaptTo("foundation-field");
        $mvFieldContainer = $(coralSelector);
    });

    $(document).on("style-propertysheet-updated" , function () {
        updateFontToList();
    });

    var updateFontToList = function () {
        var propertyName = "fontFamily",
            value = adapter.getValue(),
            processedJson = JSON.parse(value || "{}");
        var cssValue = $(cssFieldSelector).get(0).value;
        if ((cssValue || cssValue !== "") && !processedJson.itemList) {
            //case of value filled from old widget - handle backward compatibility
            var listItem = {};
            listItem.id = "fontFamily." + (new Date).getTime();
            listItem[propertyName] = cssValue;
            processedJson.itemList = [];
            processedJson.itemList.push(listItem);
            adapter.setValue(JSON.stringify(processedJson));
        }
    };

    var addListItemInJson = function (propertyValue, strict) {
        var property = "fontFamily",
            localJson = JSON.parse(adapter.getValue() || "{}"),
            listItem = {},
            propertyName;
        if (strict) {
            var selectListItems = $(coralSelector).parent().find(".coral-SelectList-item"),
                i, found = false;
            for (i = 0; i < selectListItems.length; i++) {
                if (propertyValue === $(selectListItems.get(i)).data('value')) {
                    found = true;
                    propertyName = $(selectListItems.get(i)).text();
                    break;
                }
                /* Checking for font text as well for backward compatibility if font in the list doesn't have data-value attribute*/
                else if (propertyValue === $(selectListItems.get(i)).text()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return;
            }
        }
        listItem.id = "fontFamily." + (new Date).getTime();
        listItem[property] = propertyValue;
        if (propertyName) {
            listItem.fontName = propertyName;
        }
        localJson.itemList = localJson.itemList || [];
        localJson.itemList.push(listItem);
        updateFontList(localJson);
        if (localJson.length != 0) {
            adapter.setValue(JSON.stringify(localJson));
            $mvFieldContainer.trigger("change");
        }
        //Note: class would change on movement to Coral3 - can then move to tag
        $("[data-mvfieldfont-inputfield='fontFamily'] .js-coral-Autocomplete-textfield").get(0).clear();
    };

    var listItemsReorderHandler = function (event) {
        var rowItem = event.originalEvent.detail.row,
            localJson = JSON.parse(adapter.getValue()),
            listItems = localJson.itemList,
            newIndex = listItems.length - 1,
            i, k, oldIndex;
        if (event.detail.before) {
            newIndex = _.findIndex(listItems, {id : event.detail.before.dataset.id});
        }
        for (i = 0; listItems.length > i; i++) {
            if (listItems[i].id === $(rowItem).data("id")) {
                oldIndex = i;
                break;
            }
        }
        if (newIndex >= listItems.length) {
            k = newIndex - listItems.length;
            while ((k--) + 1) {
                listItems.push(undefined);
            }
        }
        listItems.splice(newIndex, 0, listItems.splice(oldIndex, 1)[0]);
        updateFontList(localJson);
        adapter.setValue(JSON.stringify(localJson));
        $mvFieldContainer.trigger("change");
    };

    $(document).on("coral-table:roworder", "[data-mvfieldFont-elementtype='table']", listItemsReorderHandler);

}(window.jQuery, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
