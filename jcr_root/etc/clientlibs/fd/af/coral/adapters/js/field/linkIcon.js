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
    var coralSelector = [".themeToggleLock"];

    registry.register("foundation.adapters", {
        type : "foundation-field",
        selector : coralSelector.join(","),
        adapter : function (el) {
            var field = $(el);
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
                    return el.icon;
                },
                setValue : function (value) {
                    if (!value) {
                        value = constants.LINK_ON;
                    }
                    if (value == constants.LINK_ON) {
                        el.title = constants.LINK_ON_TITLE;
                    } else {
                        el.title = constants.LINK_OFF_TITLE;
                    }
                    el.icon = value;
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

    $(document).on("click", ".themeToggleLock", function (e) {
        $(this).trigger("foundation-field-change");
    });

})(window, Granite.$, window.guidelib.touchlib.style);
