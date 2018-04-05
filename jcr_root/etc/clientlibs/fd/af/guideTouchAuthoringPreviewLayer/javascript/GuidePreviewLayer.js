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

(function ($, author, guidetouchlib, channel, window, undefined) {

    // Since we need to override the existing preview layer of AEM in touch authoring
    // Hence, keeping the name same as AEM Touch preview Layer
    var name = "Preview", // public layer name
        guidePreviewLayerConstants = guidetouchlib.previewLayer.constants;

    /**
     *
     * @constructor
     */
    var guidePreviewLayer = function () {
        // Call super constructor
        guidePreviewLayer.super_.constructor.apply(this, [name]);
    };

    // set preview layer as prototype for inheritance
    author.util.inherits(guidePreviewLayer, author.PreviewLayer);

    // expose to namespace (in case to provide further inheritance)
    guidetouchlib.previewLayer.GuidePreviewLayer = guidePreviewLayer;

}(jQuery, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
