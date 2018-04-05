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

/*handle click of default next and previous navigator for PDC*/
$(function ($) {
    window.guideBridge.connect(function () {
        //this function will be called after adaptive form is initialized
        var progressive = window.guideBridge.progressive;
        /**
         * Add listener to navigate across section for custom layout
         */
        $(document).on('click', 'button[data-guide-progressive-nav]', $.proxy(progressive.navigateSection, progressive));
    });

});
