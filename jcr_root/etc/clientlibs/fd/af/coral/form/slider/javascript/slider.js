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

;(function ($) {

    var $body = $('body');
    $body.on('change', '.af-custom-slider', function (ev) {
        var $target = $(ev.target),
            normalizer = $target.attr("normalizer"),
            value = $target.adaptTo("foundation-field").getValue() / normalizer,
            suffix = $target.attr("suffix"),
            $sliderInput = $target.siblings(".af-custom-edit-on-click"),
            sliderInputValue = $sliderInput.adaptTo('foundation-field').getValue(),
            sliderInputNumberValue = parseFloat(sliderInputValue.trim()),
            userTypedSuffix = sliderInputNumberValue ? sliderInputValue.substr(sliderInputNumberValue.toString().length) : sliderInputValue;
        if (!suffix) {
            suffix = "";
        }
        if (userTypedSuffix) {
            $sliderInput.adaptTo('foundation-field').setValue(value + userTypedSuffix);
        } else {
            $sliderInput.adaptTo('foundation-field').setValue(value + suffix);
        }
        $sliderInput.trigger('change');
    });

    $body.on('focusout', '.af-custom-edit-on-click', function (ev) {
        var $target = $(ev.target),
            $slider = $target.siblings(".af-custom-slider"),
            normalizer = $slider.attr("normalizer"),
            suffix = $slider.attr("suffix"),
            value = $target.get(0).value.trim(),
            numberValue = parseFloat(value),
            userTypedSuffix = numberValue ? value.substr(numberValue.toString().length) : value;
        if (userTypedSuffix) {
            value = value.replace(userTypedSuffix, '');
        }
        if (!userTypedSuffix && value) {
            $target.adaptTo("foundation-field").setValue(value + suffix);
            $target.trigger('change');
        } else {
            $slider.adaptTo("foundation-field").setValue(value * normalizer);
        }
    });
}(jQuery));
