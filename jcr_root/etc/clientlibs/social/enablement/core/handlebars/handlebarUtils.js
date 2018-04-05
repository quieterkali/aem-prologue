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
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 *************************************************************************/
/* HandleBar utils
 */

(function(Handlebars, Enablement) {
    "use strict";

    var EnablementUtils = Enablement.Utils;
    Handlebars.registerHelper("ifCond", function(v1, operator, v2, options) {
        // TODO: How can we reduce cyclomatic complexity of this function?
        /*jshint -W074*/ // avoid W074: "This function's cyclomatic complexity is too high. ({a})"

        switch (operator) {
            case "==":
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case "===":
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case "<":
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case "<=":
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case ">":
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case ">=":
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case "&&":
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case "||":
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            case "!=":
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    Handlebars.registerHelper("relativeTime", function(epochdate) {
        return moment(epochdate).fromNow();
    });

    Handlebars.registerHelper("view", function(viewname) {
        var model = this;
        var viewCls = new Enablement[viewname](); // TODO ???? I've added '()'
        viewCls.model = model;
        return new Handlebars.SafeString(viewCls.render());

    });

    Handlebars.registerHelper("appendAttributeToCurrentUrl", function(param, value) {
        var seperator = (window.location.href.indexOf("?") === -1) ? "?" : "&";
        return new Handlebars.SafeString(window.location.href + seperator + param + "=" + value);

    });

    Handlebars.registerHelper("totalSize", function(arr, propName) {
        var total = 0;
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                total += parseInt(arr[i][propName], 10);
            }
        }
        return EnablementUtils.getNormalizedFileSize(total);
    });

    Handlebars.registerHelper("humanizeDuration", function(seconds) {
        return EnablementUtils.humanizeDuration(seconds);
    });

    Handlebars.registerHelper("humanizeDurationinMillis", function(milliSeconds) {
        return EnablementUtils.humanizeDuration(Math.floor(milliSeconds / 1000));
    });

    Handlebars.registerHelper("i18nGet", function(key) {
        return EnablementUtils.i18n.get(key);
    });
})(Handlebars, CQ.Communities.Enablement);
