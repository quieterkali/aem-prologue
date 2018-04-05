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

(function (window, $, guidelib) {
    guidelib.util.GuideUtil.showHideNavScroll = function () {
        var scrollControls = $('[data-guide-nav-scroll]');
        if (scrollControls !== undefined && scrollControls !== null) {
            _.each(scrollControls, function (scrollControl) {
                var $scrollControl = $(scrollControl),
                    isModuleScroller,
                    listArray;
                isModuleScroller = $scrollControl.hasClass('adTabScroller');
                if (isModuleScroller) {
                    listArray = $scrollControl.parent().find('.adTabbedItemTitleContainer');
                } else {
                    // using query selector all here, since sizzle of jquery is manipulating dom
                    // which is causing infinite loop due to dom mutation observer set in parent frame in touch ui
                    listArray = $scrollControl.parent()[0].querySelectorAll('[id*="' + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX + '"]');
                }
                if (listArray !== undefined && listArray !== null && listArray[0] !== undefined && listArray[0] !== null) {
                    //Don't expect element.offsetWidth to get the same value in all browsers, same issue was faced for TnC in IE.
                    if (listArray[0].scrollWidth <= listArray[0].offsetWidth) {
                        $scrollControl.addClass('hide-tab-scroll');
                    } else {
                        $scrollControl.removeClass('hide-tab-scroll');
                    }
                }
            });
        }
    };

    guidelib.util.GuideUtil.navScroll = function (itemNavContainerDiv, scrollDirection, scrollStep, navSelector) {
        var $itemNavContainerDiv = $(itemNavContainerDiv),
            itemNavs,
            scrollWidth = 0,
            maxScroll,
            currWidth,
            currPos;
        if (!(scrollStep)) {
            scrollStep = 1;
        }
        if ($itemNavContainerDiv !== undefined && $itemNavContainerDiv !== null) {
            itemNavs = $itemNavContainerDiv.find(navSelector);
            if (itemNavs.length > 0) {
                maxScroll = Math.ceil(itemNavContainerDiv.scrollWidth - itemNavContainerDiv.offsetWidth);
                if ($itemNavContainerDiv.data("guideNavScrollPos") === undefined) {
                    $itemNavContainerDiv.attr("data-guide-nav-scroll-pos", 0);
                }
                var navPos = $itemNavContainerDiv.data("guideNavScrollPos");
                if ('left' === scrollDirection) {
                    if (navPos - scrollStep >= 0) {
                        navPos = navPos - scrollStep;
                    }
                } else if ('right' === scrollDirection) {
                    if (navPos + scrollStep < itemNavs.length) {
                        navPos = navPos + scrollStep;
                    }
                }
                _.each(itemNavs, function (item, pos) {
                    if (pos < navPos) {
                        scrollWidth += $(item).outerWidth(true);
                    }
                });
                if (scrollWidth > maxScroll) {
                    currWidth = 0;
                    _.each(itemNavs, function (item, pos) {
                        if (pos <= navPos && currWidth <= maxScroll) {
                            currPos = pos;
                            currWidth += $(item).outerWidth(true);
                        }
                    });
                    navPos = currPos;
                    scrollWidth = currWidth;
                }
                $itemNavContainerDiv.data("guideNavScrollPos", navPos);
                $itemNavContainerDiv.scrollLeft(scrollWidth);
            }
        }
    };
})(window, $, guidelib);

/*handle scrolling of navigator*/
$(function ($) {
    $('body').on('click', '[data-guide-nav-scroll]', function () {
        var scrollDirection = $(this).data("guideNavScroll"),
            isModuleScroller = $(this).hasClass('adTabScroller'),
            listArray;
        if (isModuleScroller) {
            listArray = $(this).parent().find('.adTabbedItemTitleContainer');
        } else {
            listArray = $(this).parent().find('[id*="' + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX + '"]');
        }
        if (!_.isUndefined(listArray) && !_.isNull(listArray) && listArray.length > 0) {
            if (isModuleScroller) {
                guidelib.util.GuideUtil.navScroll(listArray[0], scrollDirection, 0, '.adTabbedItemTitle');
            } else {
                guidelib.util.GuideUtil.navScroll(listArray[0], scrollDirection, 0, '[id*="' + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_SUFFIX + '"]:not(.hidden)');
            }
        }
    });

    //this should be changed back to $(document).ready(showHideNavScroll) instead of windows onload,
    //once jquery version is bumped
    $(window).on('load resize', guidelib.util.GuideUtil.showHideNavScroll);

});
