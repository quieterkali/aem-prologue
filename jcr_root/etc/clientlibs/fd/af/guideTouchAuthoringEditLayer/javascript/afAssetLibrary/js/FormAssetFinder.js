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
(function ($, author, channel, window, undefined) {

    var self = {},
        afAssetsEndPoint = '/libs/fd/af/components/info.json?type=guide',
        registryName = 'Adaptive Forms', // must match with corresponding string in DnD
        isAfAuthoring = (function () {
            var urlRe = new RegExp("/(?:editor\\.html|cf#)/content/(?:forms/af|dam/formsanddocuments)/");
            return urlRe.test(window.location.pathname);
        }()),
        isAppsAuthoring = (function () {
            var urlRe = new RegExp("/(?:editor\\.html|cf#)/content/(?:phonegap|mobileapps)");
            return urlRe.test(window.location.pathname);
        }()),
        data_group = '"General" ',
        allAssetType = "&assetType=none,schema,xfa,formdatamodel";

    if (isAfAuthoring) {
        afAssetsEndPoint += "&requiredComponentType=panel" + allAssetType;
        data_group = '"Adaptive Form" ';
    } else if (isAppsAuthoring) {
        afAssetsEndPoint += "&requiredComponentType=aemappsform" + allAssetType;
        data_group = '"PhoneGap" ';
    } else {
        afAssetsEndPoint += allAssetType;
    }

    /**
     * simple "template" function to render adaptive form in the assetfinder
     * @param  {String} data for the adaptive form
     * @return {String} markup for the adaptive from
     */
    function formTemplate(data) {
        var xssComponentPath = CQ.shared.XSS.getXSSValue(data['component-path']),
            xssPath = CQ.shared.XSS.getXSSValue(data.path),
            xssImage = CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(data.image)),
            xssAssetName = CQ.shared.XSS.getXSSValue(data.name);

        if (!_.isEmpty(window.guidelib) && guidelib.author.formInfo.dataModelType === guidelib.touchlib.constants.FORM_DATA_MODEL_TYPE_XFA) {
            return "";
        }

        return '<article class="card-asset cq-draggable" ' +
                        'draggable="true" ' +
                        'data-path="' + xssComponentPath + '"' +
                        'data-group=' + data_group +
                        'data-formRef="' + xssPath + '"' +
                        'data-type="' + registryName + '">' +
                '<i class="select"></i>' +
                '<i class="move"></i>' +
                '<div class="card" >' +
                    '<span class="image">' +
                        '<img class="show-grid cq-dd-image" src="' + xssImage + '" alt="cover">' +
                    '</span>' +
                '</div>' +
                '<div class="cq-cft-participant-title">' +
                    '<h4>' + xssAssetName + '</h4>' +
                '</div>' +
                '<div class="cq-cft-participant-separator"></div>' +
            '</article>';
    }

    /**
     * Load assets from the Adaptive Form Fragment Library.
     *
     * @param query {String} search query
     * @param lowerLimit {Number} lower bound for paging
     * @param upperLimit {Number} upper bound for paging
     * @returns {jQuery.Promise}
     */
    self.loadAssets = function (query, lowerLimit, upperLimit) {

        var def = $.Deferred();
        //To remove extra space added by asset finder for last word search
        query = query.trim();

        $.getJSON(Granite.HTTP.externalize(afAssetsEndPoint), {
            format : "json",
            query : query
        }).done(function (data) {
            var output = '', i;

            if (data != null) {
                for (i = 0; i < data.fragRefs.length; i++) {
                    output += formTemplate(data.fragRefs[i]);
                }
            }
            def.resolve(output);
        });

        return def.promise();
    };

    self.abort = function () {

    };

    author.ui.assetFinder.register(registryName, self);

}(jQuery, Granite.author, jQuery(document), this));
