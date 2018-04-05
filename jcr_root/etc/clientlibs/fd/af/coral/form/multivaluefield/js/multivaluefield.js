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
//TODO remove dependency from theme namespace.
;(function ($, theme, style) {

    var styleConstants = style.constants;
    theme.mvField = theme.mvField || {};
    var adapter;
    var state = "CLEAN";
    var isAddStarted = false;
    var popovertype;
    var updateIndex;
    var $mvFieldContainer;

    var addButtonClickHandler = function (event) {

        state = "ADD";
        var popoverClass = $(event.currentTarget).data("popover-target");
        var $popover = $(popoverClass);
        popovertype = $popover.data("mvfield-popovertype");
        initialize($popover);
        populatePopoverValuesAndUI($popover);
        if ($popover[0].interaction != "on") {
            $popover[0].show();
        }
    };

    var populatePopoverValuesAndUI = function ($popover, listItem) {

        var popoverFields = $popover.find("[data-mvfield-elementtype='popoverField']");
        for (var i = 0; i < popoverFields.length; i++) {
            $popoverField = $(popoverFields[i]);
            var fieldProperty = $popoverField.data("mvfield-elementproperty");
            var value = "";
            if (listItem && listItem.hasOwnProperty(fieldProperty)) {
                value = listItem[fieldProperty];
            }
            var fieldAdapter = $popoverField.adaptTo("foundation-field");
            if (fieldAdapter) {
                fieldAdapter.setValue(value);
            }
        }
    };

    var addUpdateListItemInJson = function (event) {

        var propertyName = $(event.target).data("mvfield-elementproperty") || ($(event.target).parents("[data-mvfield-elementtype='popoverField']").data("mvfield-elementproperty")),
            propertyValue = event.target.value || "",
            // add the hidden text box in the popover containing the id of the element.
            $popover = $(event.target).closest('[data-mvfield-elementtype="popover"]');

        var localJson = JSON.parse(adapter.getValue() || "{}");
        if (state == "ADD") {
            var listItem = null;
            if (isAddStarted && localJson.itemList && localJson.itemList.length > 0) {
                listItem = localJson.itemList[localJson.itemList.length - 1];
                listItem[propertyName] = propertyValue;
            } else {
                listItem = {};
                listItem.id = popovertype + "." + (new Date).getTime();
                listItem[propertyName] = propertyValue;
                localJson.itemList = localJson.itemList || [];
                localJson.itemList.push(listItem);
                isAddStarted = true;
                $popover.data('mvfield-elementid', listItem.id);
            }
        } else if (state == "UPDATE") {
            listItem = localJson.itemList[updateIndex];
            listItem[propertyName] = propertyValue;
        }

        if (localJson.length != 0) {
            var $uiPropertyField = $mvFieldContainer.find("[data-uipropertyname]");
            $uiPropertyField.val(JSON.stringify(localJson));
            $uiPropertyField.trigger("change");
        }
    };

    var listItemsReorderHandler = function (event) {
        initialize($(event.target));

        var rowItem = event.originalEvent.detail.row;
        var newIndex = rowItem.rowIndex - 1;
        var localJson = JSON.parse(adapter.getValue());
        var listItems = localJson.itemList;
        var i, k, oldIndex;
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

        var $uiPropertyField =  $mvFieldContainer.find("[data-uipropertyname]");
        $uiPropertyField.val(JSON.stringify(localJson));
        $uiPropertyField.trigger("change");
    };

    theme.mvField.listItemClickHandler = function (event) {
        state = "UPDATE";
        var itemRow = $(event.currentTarget).parents("[data-mvfield-elementtype='listItem']");
        updateIndex = itemRow[0].rowIndex - 1;

        //retrieve popover
        var type = itemRow.data("id").split(".")[0];
        var popoverObj = document.querySelector("[data-mvfield-popovertype=" + type + "]");

        //initialize context specific variables
        popovertype = $(popoverObj).data("mvfield-popovertype");
        initialize($(popoverObj));

        //retrieve jsonarray item for updateIndex to populate popover values
        var listItem = JSON.parse(adapter.getValue()).itemList[updateIndex];
        populatePopoverValuesAndUI($(popoverObj), listItem);

        //showPopover
        if (popoverObj.interaction != "on") {
            popoverObj.show();
        }
    };

    theme.mvField.itemDeleteClickHandler = function (event) {
        style.assetLibrary.ui.backgroundDeleteButtonClickHandler(event);
        var itemRow = $(event.currentTarget).parents("[data-mvfield-elementtype='listItem']");
        var index = itemRow[0].rowIndex - 1;

        initialize(itemRow);
        var localJson = JSON.parse(adapter.getValue());
        var listItem = localJson.itemList.splice(index, 1);
        if (_.isEmpty(localJson) || _.isEmpty(localJson.itemList)) {
            localJson = {};
        }
        adapter.setValue(JSON.stringify(localJson));
        $mvFieldContainer.find("[data-uipropertyname]").trigger("change");
    };

    theme.mvField.itemMaskClickHandler = function (event) {
        var button = event.currentTarget,
            $button = $(button),
            itemRow = $(event.currentTarget).closest("[data-mvfield-elementtype='listItem']"),
            index = itemRow[0].rowIndex - 1;
        initialize(itemRow);
        var localJson = JSON.parse(adapter.getValue()),
            item = localJson.itemList[index];
        if ($button.hasClass(styleConstants.MASK_ON_CLASS)) {
            style.ui.updateMaskIcons($button, false);
        } else {
            style.ui.updateMaskIcons($button, true);
        }
        item.isMasked = ($(button).hasClass(styleConstants.MASK_ON_CLASS) == true ? true : false);
        adapter.setValue(JSON.stringify(localJson));
        $mvFieldContainer.find("[data-uipropertyname]").trigger("change");
    };

    var popoverCloseHandler = function (event) {

        if ($(event.target).data("mvfield-elementtype") === "popover") {
            state = "CLEAN";
            isAddStarted = false;
            adapter.setValue(adapter.getValue() || "");
        }
    };

    var registerEvents = function () {

        $("[data-popover-target]").on("click", addButtonClickHandler);
        $(document).on("coral-overlay:close", "[data-mvfield-elementtype='popover']", popoverCloseHandler);
        $(document).on("coral-table:roworder", "[data-mvfield-elementtype='table']", listItemsReorderHandler);
        $("[data-mvfield-elementtype='popoverField']").on("change", addUpdateListItemInJson);
    };

    var initialize = function ($element) {
        $mvFieldContainer = $element.closest(".style-multivalueFieldContainer");
        var uiPropertyElement = $mvFieldContainer.find("[data-uipropertyname]");
        if (uiPropertyElement) {
            adapter = uiPropertyElement.adaptTo("foundation-field");
        }
    };

    $(document).on("style-propertysheet-created", registerEvents);

}(jQuery, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
