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
        themeConfigConstants = themeConfig.constants,
        init = function () {
            themeConfigUtils.initializeVars();
            themeConfigUtils.getConfiguration(themeConfigUI.onConfigPageLoaded);
            themeConfigUI.registerEvents();
            //setFormTarget();
        },
        setFormTarget = function () {
            // removing the target as we are doing custom submission.
            // and retaining submission mechanism to get the ui effects
            // like success drawer from top.
            //Removed the call : It causes a POST to CQ root: '/'
            //$(themeConfigConstants.CONFIGURATION_FORM_SELECTOR).attr("action", "/");
        };

    $(document).ready(function () {
        Coral.commons.ready($(themeConfigConstants.CONFIGURATION_FORM_SELECTOR).get(0), init);
    });
}(window._, $, window.themeConfig));
