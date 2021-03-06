/*
  ADOBE CONFIDENTIAL

  Copyright 2015 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function (window, $, style, undefined) {

    var constants = style.constants;
    var registry = $(window).adaptTo("foundation-registry");
    var coralSelector = [".toggleablePopover"];

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector.join(","),
        adapter : function (el) {
            var $popover = $(el),
                $lock = $popover.find(".themeToggleLock"),
                $button = $popover.siblings(".symmetricFieldButton"),
                isLockPresent = false;
            if ($lock.length) {
                var lock = $lock.get(0),
                isLockPresent = true;
            }

            return {
                getName : function () {
                    return el.name;
                },
                isDisabled : function () {
                    return el.disabled;
                },
                setDisabled : function (disabled) {
                    el.disabled = disabled;
                    field.nextAll("input[type=hidden][name^='" + el.name + "@']").prop("disabled", disabled);
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
                    var callbackString = $popover.attr("getterfunction");
                    if (callbackString) {
                        callbackString.slice("window.".length);
                        var callback = window.expeditor.Utils.getOrElse(window, callbackString, {});
                        var buttonText = callback.call(null, $popover);
                        if (!buttonText) {
                            buttonText = constants.FIELD_PLACEHOLDER;
                        }
                        return buttonText;
                    }
                },
                setValue : function (value) {
                    var callbackString = $popover.attr("setterfunction");
                    if (callbackString) {
                        callbackString.slice("window.".length);
                        var callback = window.expeditor.Utils.getOrElse(window, callbackString, {});
                        callback.call(null, $popover, value);
                    }
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
                }
            };
        }
    });
})(window, Granite.$, window.guidelib.touchlib.style);
