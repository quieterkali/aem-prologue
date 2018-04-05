/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
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
 */

(function ($, author, theme, window, undefined) {
    $(document).on("cq-editor-loaded", function () {
        var $themeObjectElement = $(".themeEditableObject:not(.toplevel-element)"),
            hideThemeObjectEditIconClass = "themeObjectEditIconHide",
            sidePanelTreeItemDivSelector = ".sidepanel-tree-item-div",
            themeObjectEditIconSelector = ".themeObjectEditIcon";
        $themeObjectElement.on("focusin", function (ev) {
            ev.stopPropagation();
            var $focussedElement = $(ev.target),
                $focussedElementEditIcon = $focussedElement.children(sidePanelTreeItemDivSelector).children(themeObjectEditIconSelector),
                $focussedElementParents = $focussedElement.parent().closest(".themeEditableObject:not(.toplevel-element)"),
                $focussedElementParentsEditIcon = $focussedElementParents.children(sidePanelTreeItemDivSelector).children(themeObjectEditIconSelector);
            $focussedElementEditIcon.removeClass(hideThemeObjectEditIconClass);
            $focussedElementParentsEditIcon.removeClass(hideThemeObjectEditIconClass);
        });
        $themeObjectElement.on("focusout", function (ev) {
            ev.stopPropagation();
            var $focussedElement = $(ev.target),
                $focussedElementEditIcon = $focussedElement.children(sidePanelTreeItemDivSelector).children(themeObjectEditIconSelector),
                $focussedElementParents = $focussedElement.parent().closest(".themeEditableObject:not(.toplevel-element)"),
                $focussedElementParentsEditIcon = $focussedElementParents.children(sidePanelTreeItemDivSelector).children(themeObjectEditIconSelector);
            $focussedElementEditIcon.addClass(hideThemeObjectEditIconClass);
            $focussedElementParentsEditIcon.addClass(hideThemeObjectEditIconClass);
        });
    });
}(jQuery, Granite.author, window.guidelib.touchlib.theme, this));
