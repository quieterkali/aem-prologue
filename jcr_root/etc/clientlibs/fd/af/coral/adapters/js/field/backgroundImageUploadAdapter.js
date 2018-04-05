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
    var styleUtils = style.utils;
    var coralSelector = ".style-imageUploadHiddenInput";

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector,
        adapter : function (el) {
            var $fileUploadHiddenInput = $(el);

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
                    el.value = value;
                    setThumbnailImage(el);
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

    /*
    *  Set the thumbnail image.
    *
    */
    setThumbnailImage = function (fileUploadHiddenInput) {
        var $fileUploadHiddenInput = $(fileUploadHiddenInput),
            $fileUploadComponent = $fileUploadHiddenInput.parent(),
            $fileUploadPreviewTable = $fileUploadComponent.find(".style-fdImageUploadTable"),
            fileNameWithPath = fileUploadHiddenInput.value;
        $fileUploadComponent.find(".style-fdImageName").empty();
        $fileUploadComponent.find(".style-fdImageName").append(fileNameWithPath.substring(fileNameWithPath.lastIndexOf('/') + 1, fileNameWithPath.length));
        var currentFilePath = style.utils.getCurrentImagePath(fileNameWithPath);
        if (styleUtils.isImagePathBase64Encoded(currentFilePath)) {
            currentFilePath = CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(currentFilePath));
        } else {
            currentFilePath = CQ.shared.HTTP.externalize(styleUtils.makePathAbsolute(currentFilePath));
        }
        $fileUploadComponent.find(".style-fdUploadImage").attr("src", currentFilePath);
        if (!currentFilePath || currentFilePath == "") {
            $fileUploadPreviewTable.hide();
        } else {
            $fileUploadPreviewTable.show();
        }
        return;
    };

    /*
        This event will be caught whenever the value of background Json is changed.
        This background json is stored on a hidden input field with data attr set as 'background-color'
     */
    $(document).on("style-propertysheet-created" , function () {
        $(coralSelector).on("change", function (e) {
            $(e.target).trigger("foundation-field-change");
        });
    });

}(window.jQuery, window.guidelib.touchlib.theme, window.guidelib.touchlib.style));
