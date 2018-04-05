/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
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

    var self = {},
        adaptiveDocFragmentAPI = '/libs/fd/adaddon/extensions/contentfinder/cmassets.json',
        name = 'Adaptive Document Fragments'; // must match with corresponding string in DnD

    /**
     * simple "template" function to render adaptive Document fragment in the assetfinder
     * @param  {String} data for the adaptive form fragemet
     * @return {String} markup for the adaptive from fragment
     */
    function adaptiveDocumentFragmentTemplate(data) {
        var xssAssetName = CQ.shared.XSS.getXSSValue(data.name),
            xssPath = CQ.shared.XSS.getXSSValue(data.path);

        return '<article class="card-asset cq-draggable" draggable="true" data-resourceType="fd/adaddon/components/guideAdModule"' + ' data-assetRef="' + xssPath +
            '" data-type="' + name + '" data-group="Adaptive Form">' +
            '<i class="select"></i>' +
            '<i class="move"></i>' +
            '<div class="card" >' +
            '<span class="image">' +
            '<img class="show-grid cq-dd-image" src="' + Granite.HTTP.externalize(CQ.shared.XSS.getXSSValue(data.thumbnail_path, true)) + '" alt="' + xssAssetName + '">' +
            '</span>' +
            '</div>' +
            '<div class="cq-cft-participant-title">' +
                '<h4>' + xssAssetName + '</h4>' +
            '</div>' +
            '<div class="cq-cft-participant-separator"></div>' +
            '</article>';

    }

    /**
     * Load assets from the Adaptive Document Fragment Library.
     *
     * @param query {String} search query
     * @param lowerLimit {Number} lower bound for paging
     * @param upperLimit {Number} upper bound for paging
     * @returns {jQuery.Promise}
     */
    self.loadAssets = function (query, lowerLimit, upperLimit) {
        var that = this,
            def = $.Deferred(),
            // not using query passed by framework, since we have our framework as of today
            // todo: this has to be changed later
            data = guidetouchlib.utils.getSearchStringAndFilters();

        $.getJSON(Granite.HTTP.externalize(adaptiveDocFragmentAPI), {
            format : "json",
            assetType : data.assetType,
            start : lowerLimit,
            limit : upperLimit,
            guidePath : CQ.shared.HTTP.getPath(author.ContentFrame.currentLocation()),
            query : data.query
        }).done(function (data) {
                var output = '';

                if (data != null) {
                    for (var i = 0; i < data.hits.length; i++) {
                        output += adaptiveDocumentFragmentTemplate(data.hits[i]);
                    }
                }

                def.resolve(output);
            });

        return def.promise();
    };

    //Only register adaptive document fragments assets if adaptive from page is active
    // register adaptive from fragment as a asset tab
    author.ui.assetFinder.register(name, self);

}(jQuery, Granite.author, jQuery(document), window.guidelib.touchlib, this));
