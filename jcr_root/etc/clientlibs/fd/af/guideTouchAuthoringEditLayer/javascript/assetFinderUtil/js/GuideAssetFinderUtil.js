// jscs:disable requireDotNotation
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
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
 */
(function ($, author, channel, guidetouchlib, window, undefined) {

    guidetouchlib.utils.getSearchStringAndFilters = function () {
        // get the side panel asset wrapper div
        var $sidePanel = author.ui.SidePanel.$el,
            selectedFilters = author.ui.assetFinder.TagList.getSelectedTags(),
            $sidePanelAsset = $sidePanel.find(".sidepanel-tab-assets"),
            $search  = $sidePanelAsset.find('#assetsearch'),
            assetType = "",
            searchString = "";
        if ($search.length && $search[0].value.length) {
            searchString = $search[0].value.trim();
        }

        if (selectedFilters["assetType"]) {
            $.map(selectedFilters["assetType"], function (value, key) {
                assetType = assetType.concat(key);
                assetType = assetType.concat(",");
            });
            if (assetType.length > 0) {
                assetType = assetType.substring(0, assetType.lastIndexOf(","));
            }
        }

        return {
            query : searchString,
            assetType : assetType
        };
    };

}(jQuery, Granite.author, jQuery(document), window.guidelib.touchlib, this));
