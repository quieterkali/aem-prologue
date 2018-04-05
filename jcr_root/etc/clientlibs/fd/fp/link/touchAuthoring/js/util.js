
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


(function($, channel){
    var onAssetTypeChange = function(){
       var dialog, renderType, htmlProfile, pdfProfile, submitUrl, assetType;
        assetType = $('[name="./assetType"]').val();
        htmlProfile =$('div[class=coral-Form-fieldwrapper]:has([name="./htmlprofile"])');
        pdfProfile = $('div[class=coral-Form-fieldwrapper]:has([name="./pdfprofile"])');
        renderType = $('div[class=coral-Form-fieldwrapper]:has([name="./renderType"])');
        submitUrl = $('div[class=coral-Form-fieldwrapper]:has([name="./submitURL"])');
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
    };

    var onRenderTypeChange = function(){
        var dialog, renderType, htmlProfile, pdfProfile, assetType;
        assetType = $('[name="./assetType"]').val();
        renderType = $('[name="./renderType"]').val();
        htmlProfile =$('div[class=coral-Form-fieldwrapper]:has([name="./htmlprofile"])');
        pdfProfile = $('div[class=coral-Form-fieldwrapper]:has([name="./pdfprofile"])');
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
    };

  channel.on("foundation-contentloaded", function(e) {
    //on init this will initialized the dialog fields accordingly
    onAssetTypeChange();
    onRenderTypeChange();
    channel.on("change",'[name="./assetType"]',onAssetTypeChange);
    channel.on("change",'[name="./renderType"]',onRenderTypeChange);
   });

})(Granite.$, jQuery(document));
