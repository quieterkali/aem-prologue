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

    function highlightFields() {
        $(".widget:not(.buttonfieldwidget,.submitfieldwidget)")
            .toggleClass("widgetBackGroundColorHighlight", xfalib.globals.highlight);
        $(".widget[data-mandatory='true'],.exclgroup[data-mandatory='true']")
            .toggleClass("widgetMandatoryBorder", xfalib.globals.highlight);
    }

    function _getToolbarWidth() {
        var _tbwidth = document.body.clientWidth;
        if (window.formBridge && window.formBridge.userConfig["viewportWidth"]) {
            _tbwidth = window.formBridge.userConfig["viewportWidth"];
        }
        $(".page").each(function (i, obj) {
            var extent = {};
            var tmpWidth = parseInt($(this).width());
            if (tmpWidth > _tbwidth)
                _tbwidth = tmpWidth;
        });
        return _tbwidth - 2;
    }

    function _setToolbarWidth() {
        var extent = {};
        extent["width"] = _getToolbarWidth();
        $(".toolbarheader").css(extent);
        $(".pagingfooter").css(extent);
        $(".toolbarheader").css("left", "0px");
        $(".toolbarheader").css("right", "0px");
    }

    //show toolbar button based on logger.
    window.formBridge.connect(
        function () {
            $("#loadingPage").hide();
            if (xfalib.runtime.xfa.Logger.isServerLoggingEnabled()) {
                $("#toolbarloggerbtn").css({display: "inline-block"});
                //register click handler to send logs
                $("#toolbarloggerbtn").click(function () {
                    xfalib.runtime.xfa.Logger.serverHandler();
                });
            }
        }
    );

    $(window).one('xfaFirstPgLayoutComplete', function() {
        $("#loadingPage").hide();
        $(".loadingBody").removeClass("loadingBody");
    });

    //register when document is ready
    $(function ($) {

        var toolBarInit = function () {
            _setToolbarWidth();
            highlightFields();

            $(window).on('resize', _setToolbarWidth); // Bug#3670394 : changed $('body') to $(window)
            $(formBridge).on('xfaFormScale', _setToolbarWidth); // rescale the toolbar
            try {
                window.parent.addEventListener('orientationchange', function () {
                    window.xfaViewRegistry.scaleForm();
                });
            }
            catch (e) {
                xfalib.runtime.xfa.Logger.error("xfa", "could not register orientationchange listener");
            }

            $(formBridge).on("xfaNextPageRendered xfaLayoutComplete", highlightFields);

            $('#toolbarhighlight').on('click', function () {
                xfalib.globals.highlight = !xfalib.globals.highlight;
                highlightFields();
            });
        };
        //Bug#3605558: iPad doesn't give the width values instantaneously, hence putting a time out since we need
        // width of the pages rendered.
        setTimeout(function () {
            if (!xfalib.runtime.xfa)  //Bug#3670373: In IE, doc.ready is called too early for some forms, so xfalib.runtime.xfa is undefined
                $(window).one('xfaFirstPgLayoutComplete', toolBarInit);
            else
                toolBarInit();
        }, 100);


    });
})($);

