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
    var styleConstants = style.constants;
    var styleUtils = style.utils;
    style.shadowPopover = style.shadowPopover || {};
    style.shadowPopover.getShadowPopoverValue = function ($popover) {
        var position = $popover.find(".themeShadowPosition").get(0).value;
        if (position == "outside") {
            position = "";
        }
        var horizontalOffset = "",
            verticalOffset = "",
            blur = "",
            spread = "",
            color = "";
        if ($popover.find(".shadowHorizontal").adaptTo("foundation-field").getValue()) {
            horizontalOffset = $popover.find(".shadowHorizontal").adaptTo("foundation-field").getValue().trim(" ").replace(" ", "");
        }
        if ($popover.find(".shadowVertical").adaptTo("foundation-field").getValue()) {
            verticalOffset = $popover.find(".shadowVertical").adaptTo("foundation-field").getValue().trim(" ").replace(" ", "");
        }
        if ($popover.find(".shadowBlur").adaptTo("foundation-field").getValue()) {
            blur = $popover.find(".shadowBlur").adaptTo("foundation-field").getValue().trim(" ").replace(" ", "");
        }
        if ($popover.find(".shadowSpread").adaptTo("foundation-field").getValue()) {
            spread = $popover.find(".shadowSpread").adaptTo("foundation-field").getValue().trim(" ").replace(" ", "");
        }
        if ($popover.find(".shadowColor").adaptTo("foundation-field").getValue()) {
            color = $popover.find(".shadowColor").adaptTo("foundation-field").getValue().trim(" ").replace(" ", "");
        }
        return position + " " +  horizontalOffset + " " + verticalOffset + " " + blur + " " + spread + " " + color;
    };

    style.shadowPopover.setButtonLabel = function ($popover, value) {
        var symmetricButtonSelector = "." + styleConstants.SYMMETRIC_BUTTON_CLASS,
            $button = $popover.siblings(symmetricButtonSelector);
        if (!value) {
            value = styleConstants.FIELD_PLACEHOLDER;
        }
        $button.find("coral-button-label").text(value);
    };

    style.shadowPopover.getButtonLabelWithLock = function ($popover) {
        var $button = $popover.siblings("button"),
            $lock = $popover.find(".themeToggleLock"),
            lock = $lock.get(0),
            buttonText = "",
            hasNext = false;
        if (lock.icon == styleConstants.LINK_OFF) {
            var topLeftContent = $popover.find(".symmetricFieldLeftContent.symmetricFieldTopContent").get(0).value;
            var topRightContent = $popover.find(".symmetricFieldRightContent.symmetricFieldTopContent").get(0).value;
            var bottomLeftContent = $popover.find(".symmetricFieldLeftContent.symmetricFieldBottomContent").get(0).value;
            var bottomRightContent = $popover.find(".symmetricFieldRightContent.symmetricFieldBottomContent").get(0).value;
            if (!topLeftContent || !topLeftContent.trim()) {
                topLeftContent = styleConstants.EMDASH;
            }
            if (!topRightContent || !topRightContent.trim()) {
                topRightContent = styleConstants.EMDASH;
            }
            if (!bottomLeftContent || !bottomLeftContent.trim()) {
                bottomLeftContent = styleConstants.EMDASH;
            }
            if (!bottomRightContent || !bottomRightContent.trim()) {
                bottomRightContent = styleConstants.EMDASH;
            }
            buttonText = topLeftContent + ", " + topRightContent + ", " + bottomLeftContent + ", " + bottomRightContent;
            if (buttonText == "\u2014, \u2014, \u2014, \u2014") {
                buttonText = styleConstants.FIELD_PLACEHOLDER;
            }
        } else {
            buttonText = $popover.find("[data-theme-symmetric='toggleContent']").get(0).value;
            if (!buttonText || !buttonText.trim()) {
                buttonText = styleConstants.FIELD_PLACEHOLDER;
            }
        }
        return buttonText;
    };

    style.shadowPopover.getButtonLabelWithPosition = function ($popover) {
        var $button = $popover.siblings("button"),
            buttonText = $popover.find("[data-csspropertyname='position']").get(0).value;
        return buttonText;
    };

}(jQuery, window.guidelib.touchlib.style));
