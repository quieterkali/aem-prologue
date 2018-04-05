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

CQ.Communities = CQ.Communities || {};
CQ.Communities.Enablement = CQ.Communities.Enablement || {};
CQ.Communities.Enablement.Utils = CQ.Communities.Enablement.Utils || {};
CQ.Communities.Enablement.Utils.i18n = CQ.Communities.Enablement.Utils.i18n || {};

(function(EnablementUtils) {
    "use strict";

    function getNormalizedFileSize(size) {
        var normalizer = 1024;
        size = parseInt(size, 10);
        if (size === 0) {
            return "";
        }
        if (size < normalizer) {
            return (Math.round(size * 100) / 100) + " bytes";
        }
        size /= normalizer;
        if (size < normalizer) {
            return (Math.round(size * 100) / 100) + " KB";
        }
        size /= normalizer;
        if (size < normalizer) {
            return (Math.round(size * 100) / 100) + " MB";
        }
        size /= normalizer;
        if (size < normalizer) {
            return (Math.round(size * 100) / 100) + " GB";
        }
    }

    function humanizeDuration(seconds) {
        var i18n = EnablementUtils.i18n;

        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);
        var time = "";
        var unit = "";

        if (hours !== 0) {
            time = hours + ":";
            unit = i18n.get("hr");
        }
        if (minutes !== 0 || time !== "") {
            minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes);
            time += minutes + ":";
            if (unit === "") {
                unit = i18n.get("min");
            }
        }
        if (time === "") {
            time = seconds;
            if (unit === "") {
                unit = i18n.get("sec");
            }
        } else {
            time += (seconds < 10) ? "0" + seconds : String(seconds);
        }
        return time + " " + unit;
    }

    function serializeForm(jformObj) {
        var formObj = {};
        var inputs = jformObj.serializeArray();
        $.each(inputs, function(i, input) {
            if (typeof formObj[input.name] === "undefined") {
                formObj[input.name] = input.value;
            } else if (typeof formObj[input.name] === "string") {
                formObj[input.name] = [formObj[input.name], input.value];
            } else {
                formObj[input.name].push(input.value);
            }
        });
        return formObj;
    }

    function parseSlingPostServletResponse(responseText) {
        var output = {};
        try {
            var xmlDoc = $.parseXML(responseText);
            var $xml = $(xmlDoc);
            try {
                output.statusCode = $("body > h1", $xml).html().toLowerCase();
            } catch (ex) {
                output.statusCode = $("body > h1", $xml)[0].textContent.toLowerCase();
            }
            $("body > table > tbody > tr", $xml).each(function() {
                var $tr = $(this);
                var txt;
                try {
                    txt = $("td", $tr).first().html().toLowerCase();
                } catch (ex) {
                    txt = $("td", $tr).first()[0].textContent.toLowerCase();
                }
                var val = $("td", $tr).last().text();
                if (txt === "changelog") {
                    var startIdx = val.indexOf("\"");
                    var nextIdx = val.indexOf("\"", startIdx + 1);
                    val = val.substring(startIdx + 1, nextIdx);
                } else if (txt === "location") {
                    val = val; // No Operation needed
                }
                output[txt] = val;
            });
        } catch (ex) {}
        return output;
    }

    function getErrorCodeDesc(errorCode, i18n) {
        return i18n.get("errCode-" + errorCode);
    }

    function getSuffixUrl(path, extension) {
        var idx = path.indexOf(extension);
        var suffix = path.substring(idx + extension.length);
        return suffix;
    }

    function getCurrPageUrlDetails() {
        var urlComponents = {
            urlPath: "",
            queryStr: "",
            suffix: ""
        };

        var currPageHref = window.location.href;
        var currPageUrl = window.location.pathname;
        urlComponents.urlPath = currPageUrl.substring(0, currPageUrl.indexOf(".html") + ".html".length);
        var idx = currPageHref.indexOf("?");
        if (idx !== -1) {
            urlComponents.queryStr = currPageHref.substring(currPageHref.indexOf("?"));
        }

        urlComponents.suffix = currPageUrl.substring(currPageUrl.indexOf(".html") + ".html".length);
        return urlComponents;
    }

    function encoderPathForUrl(path) {
        var pathComponents = path.split("/");
        for (var i = 0; i < pathComponents.length; i++) {
            pathComponents[i] = encodeURIComponent(pathComponents[i]);
        }

        return pathComponents.join("/");
    }

    function contains(str, chars) {
        for (var i = 0; i < chars.length; i++) {
            if (str.indexOf(chars[i]) > -1) {
                return true;
            }
        }
        return false;
    }

    function serializeExistingFoundationCardLayout($div) {
        var isInternal = $div.data("foundation-layout-card.internal.init");
        if (isInternal) {

            var noOfGrids = $div.children().length;
            var elemsinEachGrid = $div.children().eq(0).children().length;
            var elems = [];
            for (var i = 0; i < elemsinEachGrid; i++) {
                for (var j = 0; j < noOfGrids; j++) {
                    var elem = $div.children().eq(j).children().eq(i);
                    if (elem !== undefined) {
                        elems.push(elem);
                    }
                }
            }
            $div.append(elems);
            $div.children("div[class^='grid-']").each(function() {
                $(this).remove();
            });
            /*
            $div.removeData("cardView");
            $div.removeData("cuigridlayout");
            $div.removeData(
                "foundation.adapters.internal.adapters.foundationSelections::" +
                ".foundationLayoutCard.foundationCollection"
            );
            $div.removeData("foundationLayoutCard.internal.init");
            $div.removeData("foundationLayoutCard.internal.modeChangeHandler");
            */
            if (!$div.hasClass("list")) {
                $div.data("cuigridlayout").destroy();
            }
            $div.removeData();
            $div.off();
        }
    }

    function restructureFoundationCardLayout($div, foundationModeGrp) {
        $div.attr("data-foundation-layout", "{'name': 'foundation-layout-card'}");
        $div.data("foundationLayout", {
            "name": "foundation-layout-card"
        });
        $div.data("foundationModeGroup", foundationModeGrp);
        $(document).trigger("foundation-contentloaded");

        var $container = $div.closest(".foundation-collection-container");
        if ($container.hasClass("list")) {
            $container.removeClass("card").addClass("list");
            $div.removeClass("grid").addClass("list");
        }
    }

    EnablementUtils.getNormalizedFileSize = getNormalizedFileSize;
    EnablementUtils.humanizeDuration = humanizeDuration;
    EnablementUtils.serializeForm = serializeForm;
    EnablementUtils.parseSlingPostServletResponse = parseSlingPostServletResponse;
    EnablementUtils.getErrorCodeDesc = getErrorCodeDesc;
    EnablementUtils.getSuffixUrl = getSuffixUrl;
    EnablementUtils.getCurrPageUrlDetails = getCurrPageUrlDetails;
    EnablementUtils.encoderPathForUrl = encoderPathForUrl;
    EnablementUtils.contains = contains;
    EnablementUtils.serializeExistingFoundationCardLayout = serializeExistingFoundationCardLayout;
    EnablementUtils.restructureFoundationCardLayout = restructureFoundationCardLayout;
})(CQ.Communities.Enablement.Utils);

$(document).ready(function() {
    "use strict";

    function showBackButton() {
        var flag = $(".endor-BreadcrumbBar .endor-Crumbs-item").toArray().some(function(item) {
            var el = $(item);
            if (el.hasClass("endor-Crumbs-item--unavailable") || el.attr("href") === "/") {
                return false;
            }
            return true;
        });

        return flag;
    }

    if (!showBackButton()) {
        $(".js-endor-BlackBar-back").css("display", "none");
    }
});
