(function ($, channel, ns, parentWindow) {
    $(parentWindow.document).on('cq-layer-activated', function (ev) {
    if (typeof MouseEvent !== "function") {
        (function (){
            parentWindow.MouseEvent = function (eventType, eventData){
                eventData = eventData || {};
                var event = document.createEvent("MouseEvents");
                event.initMouseEvent(
                    eventType,
                    // bubbles and cancellable should be boolean
                    (typeof eventData.bubbles == "undefined") ? true : !!eventData.bubbles,
                    (typeof eventData.cancelable == "undefined") ? false : !!eventData.cancelable,
                    eventData.view || parentWindow,
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
            }
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
            this.$dom.attr("data-fp-clickable-id", this.id);
            this.reposition();
            this.attachListeners();
        },
        ClickableManager,
        clickableManager,
        makeClickables;
    Clickable.prototype.attachListeners = function () {
        var self = this;
        this.$elem.on("click mouseover mouseenter mouseleave", function (evnt) {
            var newEvnt = new parentWindow.MouseEvent(evnt.type, evnt);
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
        this.$dom.removeAttr("data-fp-clickable-id");
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
        if(this.clickables[id] != null){
            this.clickables[id].remove();
        }
        this.clickables[id] = null;
    };

    ClickableManager.prototype.getIds = function (id) {
        return this.clickables != null ? Object.keys(this.clickables) : [];
    };

    ClickableManager.prototype.destroy = function (id) {
        var that = this;
        _.each(this.getIds(), function(id){
            if(that.clickables[id] != null){
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
            clickableId = $(this).attr("data-fp-clickable-id");
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

    function _supportClickOfLinksInTouch(){
        clickableManager = new ClickableManager();
        $(parentWindow.document).on("cq-overlays-repositioned.clickables", function () {
            var w = $("iframe")[0].contentWindow;
            parentWindow.requestAnimationFrame(function () {
                if (w && w.$) {
                    makeClickables(w.$('[data-fp-clickable]'));
                }
            });
            parentWindow.$('.clickable-overlay').css('position','absolute').css('cursor', 'pointer').css('z-index', '500');
        });
    }
    _supportClickOfLinksInTouch();
  });
})(window.parent.jQuery, jQuery(window.parent.document), Granite.author, window.parent);