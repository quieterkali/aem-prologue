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

(function ($, channel) {
    channel.on("change", ".keyvalpairtext input[type!=hidden]", function (e) {
        var role = $(e.target).data("role"),
            hiddenField = $(e.target).parent().find("input[type='hidden']")[0];

        var hiddenFieldValue = hiddenField.value && hiddenField.value.trim().length ? $.parseJSON(hiddenField.value) : $.parseJSON('{"key":"", "value": ""}');
        if (role && role === "key") {
            hiddenFieldValue.key = e.target.value;
        } else if (role && role === "value") {
            hiddenFieldValue.value = e.target.value;
        }
        $(e.target).parent().find("input[type='hidden']")[0].value = JSON.stringify(hiddenFieldValue);
    });
}(jQuery, jQuery(document)));
