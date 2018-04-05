(function ($) {
    $.widget("xfaWidget.guideSwitch", $.xfaWidget.XfaCheckBox, {
        _widgetName : "guideSwitch",

        options : {
            value : null,
            state : -1,
            states : 2,
            values : []
        },

        checkedState : false,

        render : function () {
            var $control = $.xfaWidget.XfaCheckBox.prototype.render.apply(this, arguments),
                option = {
                    checkedLabel : this.options.checkedLabel,
                    uncheckedLabel : this.options.uncheckedLabel
                },
                isChecked = this.options.state == "0" ? true : false;
            //Adding checked property for Prefill.
            $control.prop("checked", isChecked);
            /**
             * If the plugin is compatible with jQuery 2.1.4 (loaded by AF Runtime) and is loaded along with
             * this file in the same clientlib, then $.<plugin_name> will point to the correct plugin
             * If the plugin is not compatible with jQuery 2.1.4 and is loaded in the <head> section along with a
             * different version of jQuery, then you should use window.$.<plugin_name> or if you have namespaced jQuery
             * use that.
             *
             * Returning the jquery element provided by the widget factory. The returned value will be available as
             * this.$userControl in other functions
             *
             */
            $control = $.switchbutton.switchbutton(option, $control).element;

            return $control;
        },
        getOptionsMap : function () {
            return $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this, arguments);
        },

        getEventMap : function () {
            var parentOptionsMap = $.xfaWidget.XfaCheckBox.prototype.getEventMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "change" : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                "click" : xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT
            });
        }
    });
})($);
