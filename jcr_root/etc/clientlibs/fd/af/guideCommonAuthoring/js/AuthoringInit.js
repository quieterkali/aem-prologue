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

(function (window, channel, guidelib, guideTouchLib) {
    var LAST_FOCUS_ITEM_ID = "guide.lastFocusItemId";
    //After GUIDE_REFRESH, take author back to last focus item
    var onContentFrameLoad = function () {
        var afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
            $ = afWindow.jQuery;

        // Retain context on switching back from some other layer (like Preview).
        guidelib.author.instances.lastFocusItemId =
            window.sessionStorage.getItem(LAST_FOCUS_ITEM_ID)
            || $(guidelib.author.AuthorUtils.ROOT_PANEL_SELECTOR).attr("id");

        // Clear the sessionStorage variable guide.lastFocusItemID to focus on root panel if page refreshed.
        window.sessionStorage.removeItem(LAST_FOCUS_ITEM_ID);

        $(afWindow.document).on("click", function (e) {
            var guideUtil = afWindow.guidelib.util.GuideUtil;
            var lastFocusId = null;
            var $lastClickItem = $(e.target).closest('[id$="' + guideUtil.GUIDE_ITEM_NAV_SUFFIX + '"]');
            var lastClickItemId = $lastClickItem.attr("id");
            if ($lastClickItem.length > 0) {
                lastFocusId = lastClickItemId.substring(0, lastClickItemId.indexOf(guideUtil.GUIDE_ITEM_NAV_SUFFIX));
            } else {
                $lastClickItem = $(e.target).closest('[id$="' + guideUtil.GUIDE_ITEM_SUFFIX + '"]');
                lastClickItemId = $lastClickItem.attr("id");
                if ($lastClickItem.length > 0) {
                    lastFocusId = lastClickItemId.substring(0, lastClickItemId.indexOf(guideUtil.GUIDE_ITEM_SUFFIX));
                }
            }

            if (lastFocusId) {
                guidelib.author.instances.lastFocusItemId = lastFocusId;
            }
        });

        window.$(window).on("guideDomModified", function () {
            if (guidelib.author.instances.lastFocusItemId) {
                guidelib.author.AuthorUtils.setAuthoringFocus(guidelib.author.instances.lastFocusItemId, afWindow.document);
            } else {
                //Else Set the focus on the first leaf of root panel
                guidelib.author.AuthorUtils.setAuthoringFocus($(guidelib.author.AuthorUtils.ROOT_PANEL_SELECTOR).attr("id"), afWindow.document);
            }
        });
        guidelib.author.AuthorUtils.setAuthoringFocus(guidelib.author.instances.lastFocusItemId, afWindow.document);
    };

    if (window._afAuthorHook) {
        /**
         * To clean/setUp authoring specific things, add your listeners to
         * this namespace, it would automatically get cleaned up
         * @type {{setUp: Function, destroy: Function}}
         */
        guideTouchLib.initializers.onContentFrameLoad = {
            setUp : function () {
                onContentFrameLoad();
            },

            destroy : function () {
                window.$(window).off("guideDomModified");
            }
        };
    } else {
        $(function () {
            onContentFrameLoad();
        });
    }
})(window, jQuery(document), guidelib, window.guidelib.touchlib);

