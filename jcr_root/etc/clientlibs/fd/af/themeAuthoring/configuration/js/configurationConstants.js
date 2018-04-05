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
    themeConfig.constants = {
        TYPEKIT_CONFIG : ".fdtheme-typekitConfig",
        DEFAULT_CONFIGURED_FORM : "/libs/fd/af/themes/default",
        CONFIGURATION_FORM_SELECTOR : "#adaptiveForms-themes-properties-form",
        BASE_CLIENTLIB_CONFIGURATION_SELECTOR : "#fdtheme-id-baseClientlib",
        FORM_PATH_CONFIGURATION_INPUT_SELECTOR : "#fdtheme-id-formPath input",
        FORM_PATH_CONFIGURATION_RESET_BUTTON_SELECTOR : "#fdtheme-id-resetFormPath",
        SAVE_BUTTON_SELECTOR : '#shell-propertiespage-saveactivator'
    };
}(window._, $, window.themeConfig));
