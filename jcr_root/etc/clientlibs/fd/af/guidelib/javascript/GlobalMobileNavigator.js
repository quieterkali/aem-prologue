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
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

$(function ($) {

    /* handle swipe*/
    var setSwipeGestureState = function () {
        var swipeEnabled = !window.guideBridge._guide.getAttribute("disableSwipeGesture");
        window.guideBridge.enableSwipeGesture(swipeEnabled, swipeEnabled);
    };
    window.guideBridge.connect(setSwipeGestureState, this);

    /*show scroll indication on mobile devices*/
    var scrollIndicator = function () {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            $('[data-guide-scroll-indicator]').removeClass('mobileScrollIndicator');
        } else if ($(window).scrollTop() < $(document).height() - $(window).height()) {
            $('[data-guide-scroll-indicator]').addClass('mobileScrollIndicator');
        }
    };

    //this should be changed back to $(document).ready(scrollIndicator) instead of windows onload,
    //once jquery version is bumped
    $(window).on('load scroll resize', scrollIndicator);
    window.guideBridge.on('elementNavigationChanged', scrollIndicator);
});
