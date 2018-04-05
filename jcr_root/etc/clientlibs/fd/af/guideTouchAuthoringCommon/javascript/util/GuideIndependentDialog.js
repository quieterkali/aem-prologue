
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

/**
 * GuideIndependentDialog
 * @extends Granite.author.ui.Dialog
 * If a dialog is put at some random place, unassociated with any editable element (a component), this class would help launching that dialog
 */
(function ($, ns, guidetouchlib, channel, window, undefined) {
    /**
     * @param src Source path of the dialog
     * @param success On success (Ok button) press
     * @constructor
     */
    guidetouchlib.editLayer.dialogUtils.GuideIndependentDialog = function (src, onReady, args) {
        // let's externalize the source dialog url
        this._src = Granite.HTTP.externalize(src);
        this._onReady = onReady;
        this._arguments = args;
    };

    /**
     * @inherits Granite.author.ui.Dialog
     */
    ns.util.inherits(guidetouchlib.editLayer.dialogUtils.GuideIndependentDialog, ns.ui.Dialog);

    /**
     * We need
     * @returns {{src: *, loadingMode: string, layout: string}}
     */
    guidetouchlib.editLayer.dialogUtils.GuideIndependentDialog.prototype.getConfig = function () {
        return {
            src : this._src,
            loadingMode : 'auto',
            layout : 'auto'
        };
    };

    guidetouchlib.editLayer.dialogUtils.GuideIndependentDialog.prototype.onReady = function () {
        if (this._onReady) {
            var dlg = this;
            try {
                dlg._onReady.call(this, dlg._arguments);
            } catch (error) {
                if (window.console) {
                    console.log(error);
                }
            }
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib, jQuery(document), this));
