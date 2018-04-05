/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
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
 * ***********************************************************************
 */

;(function ($, style, undefined) {
    var constants = style.constants,
        isSettingLabelInitiated;
    var toggleLockClickHandler = function (ev) {
            var $lock = $(ev.currentTarget),
                lock = $lock.get(0),
                $lockAdapter = $lock.adaptTo("foundation-field"),
                $popover = $lock.closest('coral-popover');
            if ($lockAdapter.getValue() == constants.LINK_ON) {
                $lockAdapter.setValue(constants.LINK_OFF);
                setPopoverLabel($popover);
            } else {
                $lockAdapter.setValue(constants.LINK_ON);
                //TODO This is done for code resuse but needs to set value explicitly once lock is on.
                $lock.closest(".symmetricFieldLockContainer")
                     .siblings(".symmetricFieldLeftContentWrapper")
                     .children(".symmetricFieldLeftContent.symmetricFieldTopContent")
                     .change();
            }
        },
        toggleContentChangeHandler = function (ev) {
            if (isSettingLabelInitiated) {
                return ;
            }
            isSettingLabelInitiated = true;
            var currentVal = ev.target.value,
                $popover = $(this).parents("coral-popover"),
                $lock = $popover.find("[data-theme-symmetric='themeToggleLock']");
            if ($lock.length) {
                var lock = $lock.get(0);
                if (lock.icon == constants.LINK_ON) {
                    var items = $popover.find("[data-theme-symmetric='toggleContent']");
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].value !== currentVal) {
                            items[i].value = currentVal;
                            $(items[i]).change();
                        }
                    }
                }
            }
            setPopoverLabel($popover);
            isSettingLabelInitiated = undefined;
        },
        setPopoverLabel = function ($popover) {
            var adapter = $popover.adaptTo("foundation-field"),
                value = adapter.getValue();
            adapter.setValue(value);
            $popover.trigger("foundation-field-change");
        },
        registerEventHandlers = function () {
        $("[data-theme-symmetric='themeToggleLock']").on('click', toggleLockClickHandler);
        $("[data-theme-symmetric='toggleContent']").on('change', toggleContentChangeHandler);
    },
    symmetricFieldInit = function () {
        registerEventHandlers();
    };
    $(document).on('style-propertysheet-created', symmetricFieldInit);
}(jQuery, window.guidelib.touchlib.style));
