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

/**
 * Guide Numeric Stepper Widget
 */

(function ($) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    /*
     * Extending from the numericInput widget to prevent alphabetic characters on key press
     */
    $.widget("xfaWidget.numericStepper", $.xfaWidget.numericInput, {
        /*
         * Name of the widget. This is used as the css class for the wrapper div
         */
        _widgetName : "numericStepper",

        /**
         * Renders the jquery ui spinner and returns that as the user control
         * @returns {*}
         */
        render : function () {
            var $userControl = $.xfaWidget.numericInput.prototype.render.apply(this, arguments);
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
            return $.ui.spinner(this.options, $userControl).element;
        },

        getOptionsMap : function () {
            var parentOptionsMap = $.xfaWidget.numericInput.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "access" : function (val) {
                    switch (val) {
                        case "open":
                            this.$userControl.spinner("enable");
                            break;
                        case "readOnly":
                            this.$userControl.spinner("disable");
                            break;
                    }
                },
                "value" : function (val) {
                    this.$userControl.spinner("value", val);
                },
                "displayValue" : function (val) {
                    // do nothing. We are not controlling display value in this widget
                }
            });
        },

        getCommitValue : function () {
            return this.$userControl.spinner("value");
        },

        /**
         * This function is called when the user focuses on the field. Since we do not change the value of the field
         * on focus and display, we keep these two functions empty
         */
        showValue : function () {

        },

        showDisplayValue : function () {

        },

        /**
         * Returns a mapping of events that are triggered by spinner to XFA Events
         */
        getEventMap : function () {
            var eventMap = $.xfaWidget.numericInput.prototype.getEventMap.apply(this, arguments);
            return $.extend({}, eventMap, {
                "spinstop" : xfaUtil.XFA_EXIT_EVENT,
                "change" : xfaUtil.XFA_CHANGE_EVENT,
                "onKeyInput.numericInput" : null
            });
        }
    });
}($));
