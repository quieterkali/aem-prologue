/*******************************************************************************
 * ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   Copyright 2013 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and are protected by all applicable intellectual property
 *  laws, including trade secret and copyright laws.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 ******************************************************************************/

(function ($) {
    function handleScroll(event) {
        var pagingManager = window.formBridge ? window.formBridge.pagingManager() : null;
        var scrollTop = $(window).scrollTop();
        var winHeight = window.innerHeight ? window.innerHeight : $(window).height();
        var winBtmPos = scrollTop + winHeight;
        var $bodyEl = $("#formBody");
        /*We also need to take bodyScaleFactor into account in order to compare it with window height.*/
        var bodyBottom = $bodyEl.height() * xfalib.ut.XfaUtil.prototype.formScaleFactor + $bodyEl.offset().top;
        if (bodyBottom < winBtmPos + 50) {
            if (pagingManager && pagingManager.hasMorePages()) {
                $('#loadingpage').children(":not(a.pageloadnow)").css("visibility", "visible");
                xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(setTimeout(renderNextPage, 5)); //workaround for IPAD to show intermediate load icon
            }
        }
    }

    function handleFooterLogic() {
        var pagingManager = window.formBridge ? window.formBridge.pagingManager() : null;
        if (pagingManager == null) return;
        if (!pagingManager.hasMorePages()) {
            $('#loadingpage').css({display: "none"});
            $(window).off("scroll.xfaview");
            $('#nomorepages').css({display: "inline-block"});
        } else if (pagingManager.hasMorePages()) {
            $('#loadingpage').children(":not(a.pageloadnow)").css({visibility: "hidden"});
        }
    }

    function renderNextPage(initialLoad) {
        var pagingManager = window.formBridge ? window.formBridge.pagingManager() : null;
        if (!initialLoad && pagingManager) {
            pagingManager.renderNextPage();
        }
        handleFooterLogic();
        $(formBridge).trigger("xfaNextPageRendered");
    }

    window.renderNextPage = renderNextPage;
    window.handleFooterLogic = handleFooterLogic;
    window.handleScroll = handleScroll;
})($);

