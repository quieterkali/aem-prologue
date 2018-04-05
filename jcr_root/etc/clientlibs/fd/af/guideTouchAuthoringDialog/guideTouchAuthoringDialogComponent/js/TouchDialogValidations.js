/*
 * ADOBE CONFIDENTIAL
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
 */
(function ($, undefined, guideEditLayer) {

    var elementNameRegex = /^[\w\-]+$/,  // word char [A-Za-z0-9_] and '-'
        DIALOG_UTILS = guideEditLayer.dialogUtils;

    // Validator for name field. Please use node-name-validation where we are creating a node with name using this field
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        //Need to add this selector as granite:data node.
        selector : "[data-node-name-validation]",
        validate : function (el) {
            var name = el.value;

            if (!elementNameRegex.test(name)) {
                return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.NAME_VALIDATION_MESSAGE);
            }
        }
    });

    // Validator for signer
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        //Need to add this selector as granite:data node.
        selector : "[data-node-signer-validation]",
        validate : function (el) {
            if (guidelib.touchlib.editLayer.dialogUtils.selectElement("coral-checkbox", './_useSignedPdf')[0].checked) {
                var $signerContainer = $(el).parents('.signer'),
                    $signerDetailsContainer = $signerContainer.closest('.signerDetails'),
                    $signerRow = $signerContainer.closest('tr'),
                    email = el,
                    emailSource = $signerContainer.find('.signerEmailSource')[0],
                    security = $signerContainer.find('.signerSecurity')[0],
                    countryCode = $signerContainer.find('.signerCountryCode')[0],
                    phone = $signerContainer.find('.signerPhone')[0],
                    signerNumber = $signerContainer.find('[name="signerNumber"]')[0],
                    tooltip,
                    errorIcon,
                    msg;

                if (!(emailSource.value === "userProfile" || email.value) || (security.value === 'PHONE' && !(countryCode.value && phone.value))) {
                    msg = Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.SIGNER_VALIDATION_MESSAGE);
                    $signerRow.addClass('signerError');
                    errorIcon = new Coral.Icon().set({
                        icon : "alert",
                        size : "S",
                        variant : 'error'
                    });
                    errorIcon.setAttribute('signer-error-icon', signerNumber.value);
                    $signerDetailsContainer.prepend(errorIcon);
                    tooltip = new Coral.Tooltip().set({
                        content : {
                            innerHTML : msg
                        },
                        variant : 'error',
                        target : '[signer-error-icon="' + signerNumber.value + '"]',
                        placement : 'left',
                        interaction : 'on'
                    });
                    $signerDetailsContainer.append(tooltip);
                    return msg;
                } else {
                    $signerRow.removeClass('signerError');
                    $signerDetailsContainer.find('coral-tooltip').remove();
                    $signerDetailsContainer.find('[signer-error-icon]').remove();
                }
            }
        }
    });

    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        //Need to add this selector as granite:data node.
        selector : "[data-submit-action-validation]",
        validate : function (el) {
            var selectedItem = el.selectedItem,
                enableAdobeSignCheckbox = DIALOG_UTILS.selectElement("coral-checkbox", './_useSignedPdf')[0];
            if (enableAdobeSignCheckbox.checked && !(typeof $(selectedItem).data('submitservice') === 'string')) {
                el.invalid = true;
                return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.SUBMIT_ACTION_VALIDATION_MESSAGE);
            } else {
                el.invalid = false;
            }
        }
    });

    // Validator for bind ref field.
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-node-bindref-validation]",
        validate : function (el) {
            var regex = /^\S*$/,
                bindref = el.value;

            if (!regex.test(bindref)) {
                return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.BINDREF_VALIDATION_MESSAGE);
            }
        }
    });

    // Validator for bind ref field.
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-bindref-datamodel-type]",
        validate : function (el) {
            var entityType = $(el).attr("data-bindref-datamodel-type"),
                bindref = el.value,
                xpathtype = bindref ? bindref.replace("/", "items.") : null,
                xpathtype = xpathtype ? xpathtype.replace(/\//g, ".items.") : null,
                getOrElse = window.expeditor.Utils.getOrElse,
                dataModel = getOrElse(guidelib.touchlib, "components.bindRef.bindRefDataObjects.dataModel.loadedJSONdata", null);

            if (dataModel && xpathtype) {
                var node = getOrElse(dataModel, xpathtype, null);
                if (entityType === "panel" && node && node.guideNodeClass !== "guidePanel") {
                    return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.DATAMODEL_VALIDATION_MESSAGE);
                } else if (entityType === "field") {
                    if (node && node.guideNodeClass === "guidePanel") {
                        return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.FIELD_VALIDATION_MESSAGE);
                    }
                }
            }
        }
    });

    // validate at least 2 fields present in radio button group
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-radio-option-validation]",
        validate : function (el) {
            var optionsCount = el.items.length;
            if (optionsCount < 2) {
                return Granite.I18n.getMessage(guideEditLayer.dialogUtils.constants.RADIO_BUTTON_VALIDATION_MESSAGE);
            }
            return "";
        }
    });

    // Validator for thickness field.
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-node-thickness-validation] input",
        validate : function (el) {
            var regex = /^[^ @#$%-]+[1-9]*$/,
                thickness = el.value;

            if (!regex.test(thickness)) {
                return "";
            }
        }
    });

    // Validator for max occurance
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-node-maxoccurance-validation] input",
        validate : function (el) {
            var regex = /^[^ @#$%]+[1-9]*$/,
                maxOccurance = el.value;

            if (!regex.test(maxOccurance)) {
                return "";
            }
        }
    });

    // Validator for panel name
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-panel-name-validation]",
        validate : function (el) {
            var name = el.value;

            if (name && !elementNameRegex.test(name)) {
                return Granite.I18n.getMessage("Panel Name is Invalid");
            }
        }
    });

    // Validator for mandatory fields
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[required]",
        validate : function (el) {
            var functionality = el.value;

            if (functionality == '') {
                return Granite.I18n.getMessage("This field is required");
            }
        }
    });

    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector : "[data-blank-value-validation]",
        validate : function (el) {
            var value = el.value;

            if (value == '') {
                return Granite.I18n.getMessage("Verify the values of the marked fields");
            }
        }
    });

}(jQuery, this, window.guidelib.touchlib.editLayer));
