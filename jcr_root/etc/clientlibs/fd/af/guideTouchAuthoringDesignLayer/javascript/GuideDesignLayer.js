/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
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
 * ***********************************************************************
 */

(function ($, author, guidetouchlib, channel, window, undefined) {

    var setUp = function () {
            // reset the dialog loading mode to null so that we honor the dialog's configuration loading mode
            author.DialogFrame.dialogMode = null;
            author.design.Layer.prototype.setUp.apply(this, [arguments]);
            guidetouchlib.initializers.onContentFrameLoad.setUp();
            guidetouchlib.utils._setUpFormEditor();
        },
        tearDown = function () {
            guidetouchlib.initializers.onContentFrameLoad.destroy();
            if (author.design.Layer.prototype.tearDown) {
                author.design.Layer.prototype.tearDown.apply(this, [arguments]);
            }
        };

    /**
     * @class The Guide Design Layer class
     * @extends author.design.Layer
     */
    var guideDesignLayer = author.util.extendClass(author.design.Layer, {
        setUp : setUp,
        /**
         * @override
         */
        tearDown : tearDown
    });

    // expose to namespace (in case to provide further inheritance)
    guidetouchlib.designLayer.GuideDesignLayer = guideDesignLayer;

}(jQuery, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
