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

(function ($) {

    // GUIDE ADD REMOVE CLASS DEFINITION
    // ====================

    var GuideAddRemove = function (element) {
        this.element = $(element);
    };

    GuideAddRemove.prototype.add = function () {
        $this = this.element;
        var id = $this.attr("data-guide-id"),
            nextPanel;

        if (id) {
            if (window.guideBridge) {
                var guidePanel = window.guideBridge._resolveId(id);
                if (guidePanel) {
                    nextPanel = guidePanel.instanceManager.insertInstance(guidePanel.instanceIndex + 1);
                    if (nextPanel) {
                        window.guideBridge.setFocus(nextPanel.somExpression, "firstItem");
                    }
                }
            } else {
                console.log("could not add new instance" + id);
            }
        }
    };

    GuideAddRemove.prototype.remove = function () {
        $this = this.element;
        var id       = $this.attr("data-guide-id");

        if (id) {
            if (window.guideBridge) {
                var guidePanel = window.guideBridge._resolveId(id);
                if (guidePanel) {
                    guidePanel.instanceManager.removeInstance(guidePanel.instanceIndex);
                }
            } else {
                console.log("could not remove instance");
            }
        }
    };

    // GUIDE ADD REMOVE PLUGIN DEFINITION
    // =====================

    var old = $.fn.guideAddRemove;

    $.fn.guideAddRemove = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('guideAddRemove');

            if (!data) {
                $this.data('guideAddRemove', (data = new GuideAddRemove(this)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.guideAddRemove.Constructor = GuideAddRemove();

    // ADD REMOVE NO CONFLICT
    // ===============

    $.fn.guideAddRemove.noConflict = function () {
        $.fn.guideAddRemove = old;
        return this;
    };

    // ADD REMOVE DATA-API
    // ============

    $(document).on('click.guideAddRemove.data-api keypress.guideAddRemove.data-api', '[data-guide-addremove="add"]', function (e) {
        // Fallback on keyIdentifier and keyCode as key is not supported by Safari
        var isEnterKeyPressed = (e.key || e.keyIdentifier) == "Enter" || e.keyCode == 13;
        if (e.type == "keypress" && !isEnterKeyPressed) {
            return;
        }
        e.preventDefault();
        //This is required for setting the focus on the new panel. Otherwise the focus remains on the previous panel.
        e.stopImmediatePropagation();
        $(this).guideAddRemove('add');
    }).on('click.guideAddRemove.data-api keypress.guideAddRemove.data-api', '[data-guide-addremove="remove"]', function (e) {
            // Fallback on keyIdentifier and keyCode as key is not supported by Safari
            var isEnterKeyPressed = (e.key || e.keyIdentifier) == "Enter" || e.keyCode == 13;
            if (e.type == "keypress" && !isEnterKeyPressed) {
                return;
            }
            e.preventDefault();
            $(this).guideAddRemove('remove');
        });

}($));
