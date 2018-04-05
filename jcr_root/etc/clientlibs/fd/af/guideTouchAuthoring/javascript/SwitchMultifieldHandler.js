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

;(function ($, _, window, document) {
    "use strict";

    function _validateItemCount(parent) {
        var $addButton = $(parent).find("button[coral-multifield-add]"),
            len = $(parent)[0].items.length;
        if (len < 2) {
            $addButton.show();
        } else {
            $addButton.hide();
        }
    }

    // When a dialog shows up, initialize the switch options field.
    $(document).on("foundation-contentloaded", function (event) {
        var $container = $(event.target),
            multiField = $container.find("coral-multifield[data-id=guideSwitchOptions]");

        //If multifield of Switch option exists and Dialog is open.
        if (multiField.length > 0 && $container.hasClass("cq-dialog")) {
            _validateItemCount(multiField);

            $(multiField).on("change", function (event) {
                _validateItemCount(multiField);
            });
        }
    });

}(jQuery, _, this, document));
