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
    FD.FP     = FD.FP || {};

    FD.FP.Link = {
        onRenderTypeChange : function(field){
            var dialog, renderType, htmlProfile, pdfProfile, assetType;
            dialog = field.findParentByType('dialog');
            renderType = field.getValue();
            htmlProfile = dialog.getField('./htmlprofile');
            pdfProfile = dialog.getField('./pdfprofile');
            assetType = dialog.getField('./assetType').getValue();
            if(assetType === "Form") {
                if (renderType === "HTML") {
                    htmlProfile.show();
                    pdfProfile.hide();
                } else if (renderType === "PDF") {
                    htmlProfile.hide();
                    pdfProfile.show();
                } else {
                    htmlProfile.show();
                    pdfProfile.show();
                }
            }
        },

        onAssetTypeChange : function(field){
            var dialog, renderType, htmlProfile, pdfProfile, submitUrl, assetType;
            dialog = field.findParentByType('dialog');
            assetType = field.getValue();
            htmlProfile = dialog.getField('./htmlprofile');
            pdfProfile = dialog.getField('./pdfprofile');
            renderType = dialog.getField('./renderType');
            submitUrl = dialog.getField('./submitURL');
            if(assetType === "Document"){
                htmlProfile.hide();
                pdfProfile.hide();
                renderType.hide();
                submitUrl.hide();
            } else {
                htmlProfile.show();
                pdfProfile.show();
                renderType.show();
                submitUrl.show();
            }
        },

        campaignTextFieldValidation : function(dlg){
            var submit = true;
            var fpmetadata = dlg.getField('./fpmetadata')[0];
            if(fpmetadata) {
                var textfields = fpmetadata.findByType('textfield');
                for(var i=0; i < textfields.length; i++) {
                    if(textfields[i].fieldLabel == 'Key') {
                        if(textfields[i].getValue().trim() == '') {
                            textfields[i]. markInvalid("Mandatory to fill key");
                            submit = false;
                        }
                    }
                }
            }
            return submit;
        },

        onLinkTypeChange: function(field){
            var dialog, document, customLink, linkType;
            linkType = field.getValue();
            dialog   = field.findParentByType('dialog');
            document = dialog.getField('./assetPath');
            customLink = dialog.getField('./linkurl');
            if(linkType == "Adaptive Document"){
                document.show();
                customLink.hide();
            } else {
                document.hide();
                customLink.show();
            }
        }

    }

})();