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

$(document).ready(function() {
    "use strict";

    $(document).on("click", "a[data-pre-confirm-dialog]", function() {
        var that = this;
        var confirmModalDiv = $(this).data("pre-confirm-dialog");
        if (confirmModalDiv && confirmModalDiv.length !== 0) {
            var confirmModal = new CUI.Modal({
                element: confirmModalDiv,
                type: "notice"
            });

            $(confirmModalDiv + " .coral-Button--primary").off();
            $(confirmModalDiv + " .coral-Button--primary").on("click", function(evt) {
                evt.preventDefault();
                confirmModal.hide();
                window.location.href = $(that).attr("href");
            });
        }
        return false;
    });
});
