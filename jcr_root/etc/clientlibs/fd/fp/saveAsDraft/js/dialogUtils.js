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

(function(){
    window.FD = window.FD || {};
    FD.FP = FD.FP || {};
    FD.FP.SaveConfigChangeListener = function(field){
        var dialog, hasClickExpChanged, clickExp;
        dialog = field instanceof CQ.Dialog ? field : field.findParentByType('dialog');
        clickExp = dialog.getField('./clickExp');
        hasClickExpChanged = dialog.getField('./hasClickExpChanged');
        if(hasClickExpChanged){
            var value = hasClickExpChanged.getValue();
            var clickExpVal = clickExp.getValue();
            if((!value || value != 'true') && (clickExpVal === "handleDraftSave()")){
                clickExp.setValue('handleDraftSave(this)');
                hasClickExpChanged.setValue('true');
            }
        }
    }
})();
