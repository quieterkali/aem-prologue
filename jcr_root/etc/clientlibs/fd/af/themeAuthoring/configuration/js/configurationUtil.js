/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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
;(function (_, $, themeConfig, undefined) {
    var themeConfigUtils = themeConfig.utils,
        themeConfigUI = themeConfig.ui,
        themeConfigVars = themeConfig.vars,
        themeConfigConstants = themeConfig.constants;

    themeConfigUtils.setConfiguration = function (callback) {
        var themePath = themeConfigVars.themePath;

        $.ajax({
            url : Granite.HTTP.externalize("/libs/fd/af/themes/gui/content/serviceMapper/setConfiguration.html"),
            type : "POST",
            cache : false,
            data : {
                "themePath" : themePath,
                "configJson" : JSON.stringify(themeConfigVars.configJson)
            },
            success : function (response) {
                if (callback) {
                    callback();
                }

            },
            error : function (response) {
                if (console) {
                    console.log("Error: " + response);
                }
            }
        });
    };

    themeConfigUtils.initializeVars = function () {
        themeConfigVars.themePath = getThemePath();
        themeConfigVars.configJson = {};
    };

    /*
     * Utility method to retrieve the configuration information required to pre-fill the configuration dialog.
     */
    themeConfigUtils.getConfiguration = function (callback) {
        var urlPath = themeConfigVars.themePath;
        $.ajax({
            url : Granite.HTTP.externalize("/libs/fd/af/themes/gui/content/serviceMapper/getConfiguration.html"),
            type : "GET",
            async : false,
            cache : false,
            data : {"themePath" : urlPath},
            success : function (response) {
                themeConfigVars.configJson = JSON.parse(response.trim());
                if (callback) {
                    callback();
                }
            },
            error : function (response) {
                if (console) {
                    console.log("Error: " + response);
                }
            }
        });
    };

    var getThemePath = function () {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            sParam = "item",
            themePath = "";
        _.each(sURLVariables, function (sURLVariable) {
            sParameterName = sURLVariable.split('=');
            if (sParameterName[0] === sParam) {
                themePath = sParameterName[1];
                return;
            }
        });
        return themePath;
    };
}(window._, $, window.themeConfig));
