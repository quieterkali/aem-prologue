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

    // GUIDE TAB CLASS DEFINITION
    // ====================

    var GuideTab = function (element) {
            this.element = $(element);
        },
        editWindow = window.parent,
        old = $.fn.guidetab;

    GuideTab.prototype.show = function () {
        var $this    = this.element,
            tabType =  $this.data("guide-toggle"),
            $ul      = $this.closest('ul:not(.dropdown-menu)'),
            id       = $this.attr("data-guide-id"),
            tabEnable = (tabType === "tab" || tabType === "accordion-tab"),
            parentPanel    = $this.parents("[id='" + id + "_guide-item']"),
            editPath = null,
            notFirstTime = parentPanel.hasClass("active"),
            $li,
            guideNode;

        if (!id) {
            $li      = $this.parent('li');
            tabEnable = tabEnable || $li.hasClass("stepped");
            id = $li.attr("id") || $li.attr("data-guide-id");
            if (id) {
                id = id.substring(0, id.length - guidelib.util.GuideUtil.GUIDE_ITEM_NAV_SUFFIX.length);
            }
        }

        if (id && tabEnable) {
            if (window.guideBridge) {
                guideNode = window.guideBridge._resolveId(id);
                if (guideNode) {
                    window.guideBridge.setFocus(guideNode.somExpression);
                }
            }
            // for touch authoring, we have AuthorUtils in parent, this is a special handling done for touch authoring
            // todo: have to change this
            else if (window.parent._afAuthorHook && window.parent.guidelib.author.AuthorUtils) {
                //Checking CQ.WCM.getMode() is returning inconsistent results with cf#. So this fallback implementation.
                window.parent.guidelib.author.AuthorUtils.setAuthoringFocus(id, window.document); //Use alternate API in authoring for setFocus
            } else if (guidelib.author.AuthorUtils) {
                // In classic authoring do as usual
                guidelib.author.AuthorUtils.setAuthoringFocus(id, window.document); //Use alternate API in authoring for setFocus
            }
            if (tabType === "accordion-tab") {
                parentPanel.toggleClass("active", !notFirstTime);
            }
        } else if (tabEnable) {
            //TODO: JIRA ISSUE
            if (console && console.log) {
                console.log("could not execute setFocus for:" + id);
            }
        }
    };

    // GUIDE TAB PLUGIN DEFINITION
    // =====================

    $.fn.guidetab = function (option) {
        return this.each(function () {
            var $this = $(this),
                instance  = $this.data('guidetab');

            if (!instance) {
                $this.data('guidetab', (instance = new GuideTab(this)));
            }
            if (typeof option === 'string') {
                instance[option]();
            }
        });
    };

    $.fn.guidetab.Constructor = GuideTab();

    // TAB NO CONFLICT
    // ===============

    $.fn.guidetab.noConflict = function () {
        $.fn.guidetab = old;
        return this;
    };

    // TAB DATA-API
    // ============

    $(window.document).on('click.guidetab.data-api', '[data-guide-toggle$="tab"]',
        function (e) {
            e.preventDefault();
            $(this).guidetab('show');
        }).on('keydown.guidetab.data-api', '[data-guide-toggle$="tab"]',
        function (e) {
            if (e.which === 32) {
                e.preventDefault();
                $(this).guidetab('show');
            }
        });

}(window, $, guidelib));

