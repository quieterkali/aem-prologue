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

    var CSS_SELECTOR = "[data-csspropertyname]";
    style.validateCSSProperty = function (target, isFocusOutOperation) {
        var value = target.value,
            isValid,
            allValid = true,
            invalidItem = undefined,
            $dataField = $(target).parents(".coral-Form-fieldwrapper").find("[data-csspropertyname]"),
            value,
            propertyName,
            dummyCss;
        if ($dataField.length > 0) {
            _.each($dataField, function (fieldItem) {
                isValid = true;
                value = $(fieldItem).adaptTo("foundation-field").getValue();
                propertyName = $(fieldItem).data("csspropertyname");
                dummyCss = ".__test__ {" + propertyName + ":" + value + ";}";
                if (value != null && value.trim() != "") {
                    if (propertyName === "cssOverride" || propertyName === "beforePseudoElement" || propertyName === "afterPseudoElement") {
                        dummyCss = ".__test__ {" + value + "}";
                    }
                    var lintResult = CSSLint.verify(dummyCss);
                    if (lintResult.messages.length > 0) {
                        isValid = false;
                    }
                    if (isValid && $(fieldItem).is("coral-numericspinner, coral-numericspinner .coral-Textfield")) {
                        var fieldValue = value.trim().toLowerCase(),
                            numValue = valueAsNumber(fieldValue);
                        isValid = !(isNaN(numValue) || (numValue !== '' && (fieldItem.max !== null && fieldItem.max !== "" && numValue > fieldItem.max || fieldItem.min !== null && fieldItem.min !== "" && numValue < fieldItem.min)));

                        //allow auto/initial/inherit as value
                        //allow calc expressions
                        if (fieldValue == "auto"
                            || fieldValue == "initial"
                            || fieldValue == "inherit"
                            || fieldValue.match(/^calc\s*\(.+\)$/)) {
                            isValid = true;
                        }
                    }
                }
                if (isValid) {
                    $(fieldItem).removeAttr('invalid');
                    $(fieldItem).find("input").removeAttr('invalid');
                } else {
                    $(fieldItem).attr('invalid', 'true');
                    $(fieldItem).find("input").attr('invalid', 'true');
                    if (!invalidItem) {
                        //focus on first invalid item
                        invalidItem = fieldItem;
                    }
                    allValid = false;
                }
            });
            if (allValid) {
                style.ui.unblockUIForValidations();
            } else {
                invalidItem.focus();
                if (isFocusOutOperation) {
                    style.ui.blockUIForValidations();
                }
            }
        }
    };

    var registerCSSValidationHandler = function () {
        $(CSS_SELECTOR).on("change.style.propertysheet.validation focusout.style.propertysheet.validation", function (event) {
            style.validateCSSProperty(event.target, event.type === "focusout");
        });
    },
    valueAsNumber = function (value) {
        var value1 = value;
        value1 = value1.trim();
        value1 = parseFloat(value1);
        return value1;
    };
    $(document).off("style-propertysheet-created.style.fd.validation").on("style-propertysheet-created.style.fd.validation", registerCSSValidationHandler);

}(window._, $, window.guidelib.touchlib.style));
