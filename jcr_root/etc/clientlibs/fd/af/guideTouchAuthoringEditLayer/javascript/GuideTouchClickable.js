/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 ******************************************************************************/

(function ($, _, author, guidetouchlib, channel, window, undefined) {
    // initialize the MouseEvent polyfill for IE 11
    if (typeof MouseEvent !== "function") {
        (function () {
            window.MouseEvent = function (eventType, eventData) {
                eventData = eventData || {};
                var event = document.createEvent("MouseEvents");
                event.initMouseEvent(
                    eventType,
                    // bubbles and cancellable should be boolean
                    (typeof eventData.bubbles == "undefined") ? true : !!eventData.bubbles,
                    (typeof eventData.cancelable == "undefined") ? false : !!eventData.cancelable,
                    eventData.view || window,
                    eventData.detail || 0,
                    eventData.screenX || 0,
                    eventData.screenY || 0,
                    eventData.clientX || 0,
                    eventData.clientY || 0,
                    !!eventData.ctrlKey,
                    !!eventData.altKey,
                    !!eventData.shiftKey,
                    !!eventData.metaKey,
                    eventData.button || 0,
                    eventData.relatedTarget || null
                );
                return event;
            };
        })();
    }
    var index = 0,
        overlayWrapperSelector = '#OverlayWrapper',
        Clickable = function ($dom) {
            this.$dom = $dom;
            index++;
            this.id = "clickable-" + index;
            this.$elem = $('<div></div>')
                .addClass("clickable-overlay")
                .attr("id", this.id)
                .appendTo($(overlayWrapperSelector));
            this.$dom.attr("data-clickable-id", this.id);
            this.reposition();
            this.attachListeners();
        },
        ClickableManager,
        clickableManager,
        makeClickables;
    Clickable.prototype.attachListeners = function () {
        var self = this;
        this.$elem.on("click", function (evnt) {
            var newEvnt = new MouseEvent(evnt.type, evnt);
            self.$dom[0].dispatchEvent(newEvnt);
            evnt.stopPropagation();
        });
    };

    Clickable.prototype.reposition = function () {
        var rect = this.$dom[0].getBoundingClientRect();
        this.$elem.css({
            top : rect.top + "px",
            left : rect.left + "px",
            width : rect.width + "px",
            height : rect.height + "px"
        });
    };

    Clickable.prototype.show = function () {
        this.$elem.show();
    };

    Clickable.prototype.hide = function () {
        this.$elem.hide();
    };

    Clickable.prototype.remove = function () {
        this.$elem.off().remove();
    };

    Clickable.prototype.destroy = function () {
        this.$elem.off().remove();
        this.$dom.removeAttr("data-clickable-id");
    };

    ClickableManager = function () {
        this.clickables = {};
    };

    ClickableManager.prototype.setUp = function () {
        this.clickables = {};
    };

    ClickableManager.prototype.show = function () {
        this.clickables.forEach(function (clickable) {
            clickable.show();
        });
    };

    ClickableManager.prototype.hide = function () {
        this.clickables.forEach(function (clickable) {
            clickable.hide();
        });
    };

    ClickableManager.prototype.push = function (clickable) {
        this.clickables[clickable.id] = clickable;
    };

    ClickableManager.prototype.get = function (id) {
        return this.clickables[id];
    };

    ClickableManager.prototype.remove = function (id) {
        // todo: sometimes the id is null due to leak, adding a safe check for now
        if (this.clickables[id] != null) {
            this.clickables[id].remove();
        }
        this.clickables[id] = null;
    };

    ClickableManager.prototype.getIds = function (id) {
        return this.clickables != null ? Object.keys(this.clickables) : [];
    };

    ClickableManager.prototype.destroy = function (id) {
        var that = this;
        _.each(this.getIds(), function (id) {
            if (that.clickables[id] != null) {
                that.clickables[id].destroy();
            }
        });
        this.clickables = null;

    };

    makeClickables = function ($elem) {
        var repositioned = {},
            clickableId,
            clickable;
        $elem.each(function () {
            clickableId = $(this).attr("data-clickable-id");
            if (clickableId) {
                clickable = clickableManager.get(clickableId);
                if (clickable) {
                    clickable.reposition();
                }
            } else {
                clickable = new Clickable($(this));
                clickableManager.push(clickable);
            }
            if (clickable) {
                repositioned[clickable.id] = true;
            }
        });
        _.each(clickableManager.clickables, function (clickable, clickableId) {
            if (!repositioned[clickableId]) {
                clickableManager.remove(clickableId);
            }
        });
    };

    function _supportClickOfLinksInTouch() {
        clickableManager = new ClickableManager();
        channel.on("cq-overlays-repositioned.clickables", function () {
            var w = $("iframe")[0].contentWindow;
            requestAnimationFrame(function () {
                if (w && w.$) {
                    makeClickables(w.$('a,[data-clickable]'));
                }
            });
        });
    }

    // lets tell the edit layer to initialize this on setup and tear it during switch of layers
    guidetouchlib.initializers.supportClickOfLinksInTouch = {
        setUp : function () {
            _supportClickOfLinksInTouch();
        },

        destroy : function () {
            clickableManager.destroy();
            channel.off("cq-overlays-repositioned.clickables");
        }
    };
}(jQuery, _, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
