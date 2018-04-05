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

    $.fn.replaceText = function() {
        var replaceNSStr = "replace-ns";
        var dataReplaceNSStr = "data-" + replaceNSStr;
        $(this).each(function() {
            $(this).on("keyup", function() {
                var replaceNS = $(this).data(replaceNSStr);
                var replaceNSVal = $(this).val();
                $("[" + dataReplaceNSStr + "=" + replaceNS + "]").each(function() {
                    var replaceVal = replaceNSVal;
                    var placeHolderText = $(this).data("placeholder-txt");
                    if (replaceVal === "" && placeHolderText) {
                        replaceVal = i18n.get(placeHolderText);
                    }

                    replaceVal = CQ.shared.XSS.getXSSValue(replaceVal);
                    if ($(this).prop("tagName") === "input") {
                        $(this).val(replaceVal);
                    } else {
                        $(this).html(replaceVal);
                    }
                });
            });
        });
    };
}($, CQ.I18n));
