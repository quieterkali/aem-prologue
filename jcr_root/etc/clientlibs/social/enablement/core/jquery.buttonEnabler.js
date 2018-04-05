/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 *************************************************************************/

(function($, i18n) {
    "use strict";

    $.fn.buttonEnabler = function() {
        var buttonEnablerStr = "enabler-form";
        var operation = function($button, $form) {
            var isValid = true;
            $("input[aria-required=true], textarea[aria-required=true]", $form).each(function() {
                var validator = $(this).data("validator");
                if (validator && !validator.getValidity().isValid()) {
                    isValid = false;
                } else if (!validator) {
                    if (/^[ ]*$/.test($(this).val())) {
                        isValid = false;
                    }
                }
            });

            // No lists are marked required
            isValid = isValid && ($("[list-required=true]").length === 0);

            if (isValid) {
                $button.removeAttr("disabled");
                $button.removeAttr("title");
            } else {
                $button.attr("disabled", "disabled");
                $button.attr("title", i18n.get("Please fill all mandatory fields marked with * "));
            }
        };

        // Check if required searchable drop down list has non zero elements
        var operationSearchableListRequired = function($button, event) {
            var length = event.selectedItemTarget.children().length;

            if (length > 0) {
                $(event.target).attr("list-required", "false");
            } else {
                $(event.target).attr("list-required", "true");
            }
        };

        $(this).each(function() {
            var that = this;
            var $form = $($(this).data(buttonEnablerStr));
            $("input[aria-required=true], textarea[aria-required=true]", $form).on("keyup",
                function() {
                    operation($(that), $form);
                });

            $(document).on("removable-item-list-modify", function(e) {
                operationSearchableListRequired($(that), e);
                operation($(that), $form);
            });

            operation($(that), $form);
        });
    };
}($, CQ.I18n));
