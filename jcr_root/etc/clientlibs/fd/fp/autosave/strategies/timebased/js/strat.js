/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
/**
 * Created by arvmohan on 02-02-2015.
 * Strategy to auto save based on pre-configured time interval
 */

(function (){
    var connectWithBridge  = function(){
        window.guideBridge.connect(function () {
            var isReadOnlyFormat = window.FD && FD.FP && (FD.FP.readOnlyFormat === true);
            if (!isReadOnlyFormat) {
                if (window.guideBridge.hasAutoSaveStarted()) {
                    triggerAutoSave();
                } else {
                    window.guideBridge.on("guideAutoSaveStart", function () {
                        triggerAutoSave();
                    });
                }
            }
        });
    };

    var triggerAutoSave = function(){
        var autoSaveInfo = getAutoSaveInfoWrapper();

        var enableAnonymous = autoSaveInfo["enableAnonymous"],
            //get the event on which save will occur
            fpWhen = autoSaveInfo["fpWhen"];

        if(fpWhen) {
            //get the additional metadata out of guide container node
            var timeInterval = parseInt(fpWhen) * 1000,
                callSave = function(){
                    //Need to update autoSave information whenever auto save is triggered
                    //This assumes that auto save trigger event and config to allow anonymous auto save won't change after guideBridge is initialized
                    autoSaveInfo = getAutoSaveInfoWrapper();
                    var metadata = autoSaveInfo["metadata"];
                        if(!FD.FP.isAnonymous || enableAnonymous) {
                            var options = {isAutoSaveTriggered: true,  metadataToSave: metadata, enableAnonymous: enableAnonymous};
                            window.FD.FP.AF._handleDraftSaveWrapper(options);
                        }
                };

            //call save method
            callSave();
            var setTime = setInterval(function(){ callSave()}, timeInterval);
        }

    };

    var getAutoSaveInfoWrapper = function(){
        var enableAnonymous = false,
            metadata = {},
            autoSaveInfo = window.guideBridge.getAutoSaveInfo(),
            fpWhen,
            result,
            fpMetadata,
            metadataselector;
        if (autoSaveInfo) {
            if (autoSaveInfo.hasOwnProperty("autoSaveInterval")) {
                fpWhen = autoSaveInfo["autoSaveInterval"];
            }

            if (autoSaveInfo.hasOwnProperty("metadataselector")) {
               metadataselector = autoSaveInfo["metadataselector"];
            }
            if(metadataselector && metadataselector === 'global') {
                var metaInfo = window.guideBridge.getGlobalMetaInfo();
                fpMetadata = metaInfo && metaInfo.hasOwnProperty("metadata") ? metaInfo['metadata'] : null;
            } else {
                fpMetadata = autoSaveInfo['fpmetadata'];
            }

            if (autoSaveInfo.hasOwnProperty("enableAnonymous")) {
                enableAnonymous = autoSaveInfo["enableAnonymous"];
            }

            if(fpMetadata) {
                if(typeof fpMetadata === 'object') {
                    for (var index in fpMetadata) {
                        var currentMetadata = JSON.parse(fpMetadata[index]);
                        metadata[currentMetadata["key"]] = window.guideBridge._guide._compileExpression(currentMetadata["value"])();
                    }
                } else if(typeof fpMetadata === 'string'){
                    var currentMetadata = JSON.parse(fpMetadata);
                    metadata[currentMetadata["key"]] = window.guideBridge._guide._compileExpression(currentMetadata["value"])();
                }
            }

        }
        result = {"metadata": metadata, "enableAnonymous": enableAnonymous, "fpWhen": fpWhen};
        return result;
    };

    if(!window.guideBridge){
        window.addEventListener("bridgeInitializeStart", function() {
            connectWithBridge();
        });
    } else {
        connectWithBridge();
    }

})();