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

;(function ($, undefined) {
    var waitTime,    //Time for which wait component needs to be shown.
        $overallWaitElement,    //The complete wait element div + coral-wait.
        hideEvent,    //The event on which wait component hides.
        //TODO needs to be shifted to a seperate namespace.
        INITIATE_WAIT_FALLBACK_TIME = 300;   //When nor event neither time is provided wait component will be shown for this time.
    $(document).on("initiateWait" , function (e) {
        if (!$('.initiateWaitWrapperDiv').length) {
            var wait = new Coral.Wait(),
                $wait = $(wait),
                wrapperDiv = "<div class = 'initiateWaitWrapperDiv'></div>",
                $wrapperDiv = $(wrapperDiv);
            $overallWaitElement = $(wrapperDiv).append($wait);
            wait.centered = true;
            wait.size = "L";
            $('body').append($overallWaitElement);
            $overallWaitElement.addClass("initiateWaitWrapperDiv");
        } else {
            $overallWaitElement = $('.initiateWaitWrapperDiv');
        }
        var $wrapperElement = e.wrapperElement ? e.wrapperElement : $("body"),
            divHeight = $wrapperElement.height(),
            divWidth = $wrapperElement.width(),
            divTop = $wrapperElement.offset().top,
            divLeft = $wrapperElement.offset().left;
        $overallWaitElement.show();
        $overallWaitElement.height(divHeight).width(divWidth);
        $overallWaitElement.offset({
            top : divTop,
            left : divLeft
        });
        if (!e.hideEvent) {
            waitTime = e.waitTime ? e.waitTime : INITIATE_WAIT_FALLBACK_TIME;
        } else {
            hideEvent = e.hideEvent;
            $(document).one(hideEvent, function () {
                $overallWaitElement.hide();
            });
        }
        if (waitTime) {
            setTimeout(function () {
                $overallWaitElement.hide();
            }, waitTime);
        }
    });
}(jQuery));
