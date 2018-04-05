/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function (_, $, style) {
    var styleAssetLib = style.assetLibrary = style.assetLibrary,
        styleAssetLibUtils = styleAssetLib.utils = styleAssetLib.utils,
        styleConstants = style.constants,
        styleVars = style.vars,
        styleUtils = style.utils,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetUtils = styleAssetLib.utils = styleAssetLib.utils,
        styleAssetLibUI = styleAssetLib.ui = styleAssetLib.ui,
        styleAssetLibHistory = styleAssetLib.history,
        styleAssetLibManager = styleAssetLibHistory.manager;

    /**
     * initialize asset library manager.Sets maximum number of recent styles saved.
     * initialize lawn chair.
     * @param {Object} cfg - Object containing number of maximum steps.
     */
    styleAssetLibManager.init = function (cfg) {
        styleAssetLibManager.config = {};
        styleAssetLibManager.data = [];
        styleAssetLibManager.activeStep = -1;
        styleAssetLibManager.config.maxRecentStylesSaved = (cfg ? cfg.maxRecentStylesSaved : 10);
        styleAssetLibManager.persistence = styleUtils.history.clientsidePersistence.createLawnchair();
    };

    /**
     * Save recent style json in the local storage.
     * Recent style is saved across all forms and themes.
     * @param {Object} recentlyUsedStylesJson - Recent styles json.
     */
    styleAssetLibManager.save = function (recentlyUsedStylesJson) {
        if (!styleAssetLibVars.isRecentStyleSaveInitiated) {
            styleAssetLibVars.isRecentStyleSaveInitiated = true;
            setTimeout(function () {
                styleAssetLibVars.isRecentStyleSaveInitiated = false;
                var key = styleConstants.ASSET_LIBRARY_PERSISTENCE_MAP_KEY,
                    value = styleConstants.ASSET_LIBRARY_PERSISTENCE_MAP_VALUE,
                    options = {
                        key : key
                    };
                options[value] = recentlyUsedStylesJson;
                styleAssetLibManager.persistence.save(options);
            }, 0);
        }
    };

    /**
     * Load recent used styles from local storage to memory.
     */
    styleAssetLibManager.load = function () {
        var value = styleConstants.ASSET_LIBRARY_PERSISTENCE_MAP_VALUE,
            key = styleConstants.ASSET_LIBRARY_PERSISTENCE_MAP_KEY,
            recentlyUsedStylesJson = {};
        styleAssetLibManager.persistence.get(key, function (data) {
            var recentlyUsedStylesJson = {};
            if (data && data[value]) {
                recentlyUsedStylesJson = data[value];
            }
            styleAssetLibVars.recentlyUsedStylesJson = recentlyUsedStylesJson;
            styleAssetUtils.populateRecentlyUsedStyles();
        });
    };

}(window._, $, window.guidelib.touchlib.style));
