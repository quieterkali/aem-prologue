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
        adaptiveFormAPI = '/libs/fd/af/components/info.json',
        name = "Adaptive Form Fragments"; // must match with corresponding string in DnD

    /**
     * simple "template" function to render adaptive form fragment in the assetfinder
     * @param  {String} data for the adaptive form fragemet
     * @return {String} markup for the adaptive from fragment
     */
    function adaptiveFormFragmentTemplate(data) {
        var resourceType = CQ.shared.XSS.getXSSValue(data['sling:resourceType']),
            imageSrc = CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(data.image)),
            assetName = CQ.shared.XSS.getXSSValue(data.name),
            path = CQ.shared.XSS.getXSSValue(data.path);
        return '<article class="card-asset cq-draggable" draggable="true"  data-resourceType="' + resourceType + '" data-fragRef="' + path +
            '" data-type="' + name + '" data-group="Adaptive Form">' +
            '<i class="select"></i>' +
            '<i class="move"></i>' +
            '<div class="card" >' +
                '<span class="image">' +
                    '<img class="show-grid cq-dd-image" src="' + imageSrc + '" alt="cover">' +
                '</span>' +
            '</div>' +
            '<div class="cq-cft-participant-title">' +
                '<h4>' + assetName + '</h4>' +
            '</div>' +
            '<div class="cq-cft-participant-separator"></div>' +
        '</article>';

    }

    /**
     * Load assets from the Adaptive Form Fragment Library.
     * @todo, The HTML has to brought from server
     *
     * @param query {String} search query
     * @param lowerLimit {Number} lower bound for paging
     * @param upperLimit {Number} upper bound for paging
     * @returns {jQuery.Promise}
     */
    self.loadAssets  = function (query, lowerLimit, upperLimit) {
        var that = this,
            def = $.Deferred(),
        // not using query passed by framework, since we have our framework as of today
        // todo: this has to be changed later
            data = guidetouchlib.utils.getSearchStringAndFilters();

        $.getJSON(Granite.HTTP.externalize(adaptiveFormAPI), {
            format : "json",
            type : "fragfinder",
            start : lowerLimit,
            limit : upperLimit,
            query : data.query,
            assetType : data.assetType
        }).done(function (data) {

            var output = '';
            if (data != null) {
                for (var i = 0; i < data.fragRefs.length; i++) {
                    output += adaptiveFormFragmentTemplate(data.fragRefs[i]);
                }
            }
            def.resolve(output);
        });

        return def.promise();
    };

    //Only register adaptive form fragments assets if adaptive from page is active
    // register adaptive from fragment as a asset tab
    author.ui.assetFinder.register(name, self);

}(jQuery, Granite.author, jQuery(document), window.guidelib.touchlib, this));
