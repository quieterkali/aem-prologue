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
        themeConfigConstants = themeConfig.constants,
        themeConfigFields = [
            {
                "selector" : themeConfigConstants.BASE_CLIENTLIB_CONFIGURATION_SELECTOR,
                "varName" : "baseClientlibCategory",
                "default" : ""
            },
            {
                "selector" : themeConfigConstants.FORM_PATH_CONFIGURATION_INPUT_SELECTOR,
                "varName" : "configuredFormPath",
                "default" : themeConfigConstants.DEFAULT_CONFIGURED_FORM
            },
            {
                "selector" : themeConfigConstants.TYPEKIT_CONFIG,
                "varName" : "webFontConfiguration",
                "default" : ""
            }
        ];
    themeConfigUI.registerEvents = function () {
        $(themeConfigConstants.SAVE_BUTTON_SELECTOR).on("click", themeConfigUI.onConfigSubmit);
    };

    themeConfigUI.onConfigSubmit = function (e) {
        e.preventDefault();
        e.stopPropagation();
        _.forEach(themeConfigFields, function (configuration) {
            var configField = $(configuration.selector);
            if (configField.length > 0) {
                themeConfigVars.configJson[configuration.varName] = configField[0].value;
            }
        });
        themeConfigUtils.setConfiguration(postSubmitCallback);
    };

    themeConfigUI.onConfigPageLoaded = function (e) {
        var $formPath = $(themeConfigConstants.FORM_PATH_CONFIGURATION_INPUT_SELECTOR),
            $formPathReset = $(themeConfigConstants.FORM_PATH_CONFIGURATION_RESET_BUTTON_SELECTOR);
        _.forEach(themeConfigFields, function (configuration) {
            var configField = $(configuration.selector);
            if (configField.length > 0) {
                configField[0].value = themeConfigVars.configJson[configuration.varName] || configuration["default"];
            }
        });
        $formPathReset.on("click.theme.config", function (event) {
            $formPath[0].value = themeConfigConstants.DEFAULT_CONFIGURED_FORM;
        });
    };

    /*Selects the item from list which has value = itemValue*/
    themeConfigUI.selectItem = function (list, itemValue) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].value == itemValue) {
                list[i].selected = true;
                return;
            }
        }
    };

    var postSubmitCallback = function () {
        $(themeConfigConstants.CONFIGURATION_FORM_SELECTOR).submit();
    };

}(window._, $, window.themeConfig));
