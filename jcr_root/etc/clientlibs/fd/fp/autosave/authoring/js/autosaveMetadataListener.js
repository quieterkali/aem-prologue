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

(function ($) {
    FD = window.FD || {};
    FD.FP = FD.FP || {};

    FD.FP.onLoadAutosaveMetadataHandler = function () {
        var dialog = this.findParentByType("dialog"),
            metadata = dialog.getField(this.name),
            selector = dialog.getField(this.metadataSelectorfieldname);
        // On first load, to maintain backward compatibility if author had already filled metadata (in such cases selector's value would not be set at all), we need to set selector's value as "local"
        if (selector == '' || selector.value === 'local') {
            metadata.show();
            selector.setValue('local');
        } else {
            metadata.hide();
            selector.setValue('global');
        }
    }
})(jQuery, guidelib, _);