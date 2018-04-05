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

;(function ($, theme) {

    theme.bgComponent = theme.bgComponent || {};
    var adapter;
    var state = "CLEAN";
    var isAddStarted = false;
    var updateIndex;
    var popovertype;

    var addImageButtonClickHandler = function (event) {
        $(".style-imagepopover").data("mvfield-elementid", "");
        showHideTargetImageContainer();
        enableDisableOptionalImageFields();
    };

    var addGradientButtonClickHandler = function (event) {

        showHideTargetGradientContainer();
    };

    var showHideTargetImageContainer = function (event) {
        var select = $(".style-imagePositionSizeSelect");
        for (var i = 0; i < select.length; i++) {
            var selectedValue = select[i].value;
            var $targetContainer = $($(select[i]).data("mvfield-elementtarget"));
            $targetContainer.toggle(selectedValue === "custom");
        }
    };

    var enableDisableOptionalImageFields = function (event) {
        var setDisabled = false;
        var $uploadImageField = $("#style-useasset");
        var uploadImageFieldAdapter = $uploadImageField.adaptTo("foundation-field");
        if (uploadImageFieldAdapter.getValue() == null || uploadImageFieldAdapter.getValue() == "") {
            setDisabled = true;
        }

        var $popover = $uploadImageField.closest("[data-mvfield-elementtype='popover']");
        var popoverFields = $popover.find("[data-mvfield-elementtype='popoverField']");
        for (var i = 0; i < popoverFields.length; i++) {
            if (popoverFields[i] != $uploadImageField[0]) {
                var fieldAdapter = $(popoverFields[i]).adaptTo("foundation-field");
                fieldAdapter.setDisabled(setDisabled);
            }
        }
    };

    var reverseButtonClickHandler = function (event) {
        var color1 = $(event.currentTarget).parent().find("[data-mvfield-elementproperty='color1']");
        var color2 = $(event.currentTarget).parent().find("[data-mvfield-elementproperty='color2']");
        var color1Adapter = color1.adaptTo("foundation-field");
        var color2Adapter = color2.adaptTo("foundation-field");

        var temp = color1Adapter.getValue();
        color1Adapter.setValue(color2Adapter.getValue());
        color2Adapter.setValue(temp);

        $(color1).trigger("change");
        $(color2).trigger("change");
    };

    theme.bgComponent.listItemClickHandler = function (event) {
        theme.mvField.listItemClickHandler(event);
        var itemRow = $(event.currentTarget).parents("[data-mvfield-elementtype='listItem']");
        var id = itemRow.data("id");
        var type = itemRow.data("id").split(".")[0];
        if (type === "image") {
            $(".style-imagepopover").data("mvfield-elementid", id);
            showHideTargetImageContainer();
            enableDisableOptionalImageFields();
        } else if (type === "gradient") {
            showHideTargetGradientContainer();
        }
    };

    var showHideTargetGradientContainer = function (event) {
        var selectedValue = $("[data-mvfield-elementproperty='gradientType']")[0].value;
        $("#style-radialGradientContainer").toggle(selectedValue == "radial");
        $("#style-linearGradientContainer").toggle(selectedValue == "linear");
    };

    var closePopover = function (event) {
        $(event.target).closest("[data-mvfield-elementtype='popover']")[0].hide();
    };

    var registerEvents = function () {
        $(".style-reversebutton").on("click", reverseButtonClickHandler);
        $(".style-addImagebutton").on("click", addImageButtonClickHandler);
        $(".style-addGradientbutton").on("click", addGradientButtonClickHandler);
        $("[data-mvfield-elementtarget]").on("change", showHideTargetImageContainer);
        $("[data-mvfield-elementproperty='gradientType']").on("change", showHideTargetGradientContainer);
        $("#style-useasset").on("change", enableDisableOptionalImageFields);
        $(".style-closebutton").on("click", closePopover);
    };

    $(document).on("style-propertysheet-created", registerEvents);

}(jQuery, window.guidelib.touchlib.theme));
