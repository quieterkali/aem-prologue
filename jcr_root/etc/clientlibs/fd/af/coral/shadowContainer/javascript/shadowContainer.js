/*************************************************************************
*
* ADOBE CONFIDENTIAL
* __________________
*
*  Copyright 2015 Adobe Systems Incorporated
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

;(function ($, style, undefined) {

    var	closePopover = function (event) {
            $(event.target).closest("[data-mvfield-elementtype='popover']")[0].hide();
        },

        registerEvents = function () {
            $(".style-closebutton").on("click", closePopover);
        };

    $(document).on("style-propertysheet-created", registerEvents);

}(jQuery, window.guidelib.touchlib.style));
