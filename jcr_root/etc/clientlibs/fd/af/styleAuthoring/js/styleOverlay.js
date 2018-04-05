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

;(function (_, $, style, undefined) {

    var styleConstants = style.constants,
        styleOverlay = style.overlay = style.overlay || {},
        OVERLAY_BORDER_GAP = 3, //(2px border width + 1px outline offset),
        OVERLAY_BORDER_WIDTH = 2,
        OVERLAY_SCREEN_CORNER_GAP = 2,
        OVERLAY_ACTIONBAR_HEIGHT = 40;

    /**
     * Draw overlay on the component or selector.
     * @param {Object} $overlaySelector - overlay jquery element.
     * @param {Object} selectionText - action bar of overlay which contains buttons to be clicked.
     * @param {Object} $target - Target Element on which overlay needs to be drawn.
     * @param {Object} elements - elements object containing data top, right, left, bottom border and actionButtons of overlay.
     * @param {Object} drawOverlayButtonFn - Function which governs how to position the action bar of overlay.
     */
    styleOverlay.drawOverlay = function ($overlaySelector, selectionText, $target, elements, drawOverlayButtonFn) {
        var clientRectObj = $target[0].getBoundingClientRect(),
            targetOffset = jQuery.extend(true, {}, clientRectObj),
            targetHeight = targetOffset.height,
            targetWidth  = targetOffset.width,
            targetOffsetLeft = targetOffset.left,
			targetOffsetButtonTop = targetOffset.top,
            targetOffsetBorderTop = targetOffset.top,
            maxHeight = $(Granite.author.ContentFrame.contentWindow).height(),
            maxWidth = $(Granite.author.ContentFrame.contentWindow).width();
        if (selectionText) {
            elements.actionButtons.html(selectionText);
        }

        //if target height is same  or more as screen - overlay needs to be shown inside the screen
        if (targetHeight >= maxHeight) {
            targetHeight = maxHeight - 2 * (OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP);
            targetOffset.height = targetHeight;
        }
        if (targetWidth >= maxWidth) {
            targetWidth = maxWidth - 2 * (OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP);
            targetOffset.width = targetWidth;
        }
        if (targetOffset.left < 2 * (OVERLAY_BORDER_GAP)) {
            targetOffsetLeft +=  2 * (OVERLAY_BORDER_GAP);
            targetOffset.left = targetOffsetLeft;
        }
        if (targetOffset.top < 2 * (OVERLAY_BORDER_GAP) + OVERLAY_SCREEN_CORNER_GAP) {
            targetOffsetBorderTop = 2 * (OVERLAY_BORDER_GAP) + OVERLAY_SCREEN_CORNER_GAP;
        }
        drawOverlayButtonFn(elements, targetOffset);
        elements.top.css({
            left :  (targetOffsetLeft - OVERLAY_BORDER_WIDTH * 2),
            top :   (targetOffsetBorderTop - OVERLAY_BORDER_WIDTH * 2),
            width : (targetWidth + 2 * OVERLAY_BORDER_GAP)
        });
        elements.bottom.css({
            top :   (targetOffsetBorderTop + targetHeight + OVERLAY_BORDER_WIDTH / 2),
            left :  (targetOffsetLeft  - OVERLAY_BORDER_WIDTH * 2),
            width : (targetWidth +  2 * OVERLAY_BORDER_GAP)
        });
        elements.left.css({
            left :   (targetOffsetLeft - OVERLAY_BORDER_WIDTH * 2),
            top :    (targetOffsetBorderTop  - OVERLAY_BORDER_WIDTH * 2),
            height : (targetHeight +  2 * OVERLAY_BORDER_GAP)
        });
        elements.right.css({
            left :   (targetOffsetLeft + targetWidth + OVERLAY_BORDER_WIDTH / 2),
            top :    (targetOffsetBorderTop  - OVERLAY_BORDER_WIDTH * 2),
            height : (targetHeight +  2 * OVERLAY_BORDER_GAP)
        });
    };

    /**
     * Function which governs the logic to repostion selector overlay.
     * @param {Object} elements - elements object containing data top, right, left, bottom border and actionButtons of overlay.
     * @param {Object} targetOffset - Offset object which contains position information of target element on which overlay is positioned.
     */
    styleOverlay.drawSelectorOverlayButtons = function (elements, targetOffset) {
        //adjusting the action bar if it goes outside the screen from the right
        setTimeout(function () {
            //adjusting the action bar if it goes outside the screen from the right
            var actionBarWidth = elements.actionButtons.width(),
                targetOffsetLeft = targetOffset.left,
                targetButtonOffsetLeft = targetOffsetLeft,
                maxWidth = $(Granite.author.ContentFrame.contentWindow).width(),
                maxHeight = $(Granite.author.ContentFrame.contentWindow).height(),
                targetWidth = targetOffset.width,
                targetHeight = targetOffset.height,
                targetOffsetButtonTop = targetOffset.top,
                actionBarOffset = {};
            //if target height is same  or more as screen - overlay needs to be shown inside the screen
            if ((targetOffsetLeft + actionBarWidth) > maxWidth) {
                targetButtonOffsetLeft = targetButtonOffsetLeft + targetWidth - actionBarWidth - (OVERLAY_BORDER_GAP * 2) - OVERLAY_SCREEN_CORNER_GAP;
            }
            //special handling of top as it contains the action bar which needs to be adjusted separately
            if (targetOffset.top < (OVERLAY_ACTIONBAR_HEIGHT +  OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP)) {
                targetOffsetButtonTop += (OVERLAY_ACTIONBAR_HEIGHT +  OVERLAY_BORDER_GAP + OVERLAY_SCREEN_CORNER_GAP);
            }
            actionBarOffset.top = targetOffsetButtonTop - OVERLAY_ACTIONBAR_HEIGHT - OVERLAY_BORDER_WIDTH * 2;
            actionBarOffset.left = targetButtonOffsetLeft - OVERLAY_BORDER_WIDTH * 2;
            actionBarOffset.width = actionBarWidth;
            actionBarOffset.height = OVERLAY_ACTIONBAR_HEIGHT;
            if (styleOverlay.isActionBarColliding(actionBarOffset)) {
                //This code hits in case of inline editor only where we have 2 overlays copy paste and selector.
                actionBarOffset.top = targetOffset.top + targetHeight + OVERLAY_BORDER_WIDTH * 2;
            }
            //after all the adjustments, set the inline CSS values to elements
            elements.actionButtons.css({
                left : actionBarOffset.left,
                top : actionBarOffset.top
            });
        }, 0);
    };

    /*Override*/
    styleOverlay.repositionOverlay = function (target, val) {
    };

    /*Override*/
    styleOverlay.isActionBarColliding = function () {
    };

}(window._, $, window.guidelib.touchlib.style));
