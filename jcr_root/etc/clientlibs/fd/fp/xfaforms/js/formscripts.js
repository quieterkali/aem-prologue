/**
 ADOBE CONFIDENTIAL

 Copyright 2014 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

(function ($) {
    window.FD = window.FD || {};
    FD.FP     = FD.FP || {};
    FD.FP.MF = FD.FP.MF || {};
    FD.FP.MF = {
        saveMFDraft : function(){
            var draftID = window.formBridge.customContextProperty("mfDraftId"),
                fileList = "",
                formPath = window.xfalib.runtime.renderContext.contentRoot.substring(6) + "/" +window.xfalib.runtime.renderContext.template,
                formName = window.xfalib.runtime.renderContext.template,
                formData =  null,
                urlForDraft = window.formBridge._getUrl(formPath) + "/jcr:content.fp.draft.json?func=saveDraft",
                profile = xfalib.runtime.customPropertyMap.profile,
                submitUrl = xfalib.runtime.customPropertyMap.submitUrl,
                instanceId = window.formBridge.customContextProperty("instanceId");

            var fileUploadPath = window.formBridge._getUrl(formPath) + "/jcr:content.fp.attach.jsp/" + draftID,
                showDraftStatus = function(message,id){
                                      $("#"+id).text(message).show().fadeOut(1600,"linear");
                                  };

            var obj = {
                "success":function(result){
                    window.formBridge.trigger(
                        "saveStarted",
                        window.xfalib.script.XfaModelEvent.createEvent ("saveStarted")
                    );
                    formData = result.data;
                    var data = {
                        'formName'  : formName,
                        'formPath'  : formPath,
                        'formData'  : formData,
                        'draftID'   : draftID,
                        'formType'  : "mf",
                        '_charset_' : "UTF-8",
                        'profile'   : profile,
                        'submitUrl' : submitUrl,
                        'fileList'  : fileList
                    },
                    allowedMetadata = [];

                    if(instanceId){
                        data["instanceId"] = instanceId;
                    }
                    for(key in data){
                        if(key !== 'formData') {
                            allowedMetadata.push(key);
                        }
                    }
                    data["fpAllowedMetadata"] = allowedMetadata.toString();
                    $.ajax({
                        type:"POST",
                        url: urlForDraft,
                        async: true,
                        cache: false,
                        data: data,
                        success: function (result) {
							if(result && result.draftID){
								window.formBridge.trigger(
									"saveCompleted",
									window.xfalib.script.XfaModelEvent.createEvent ("saveCompleted")
								);
								showDraftStatus(xfalib.locale.Strings.SavedSuccessfully, "fpDraftStatus");
								window.formBridge.customContextProperty("mfDraftId",result.draftID);
							} else {
							    showDraftStatus(xfalib.locale.Strings.UnableToSave,"fpDraftStatus");
							}
                        },
                        error : function (result) {
                            showDraftStatus(xfalib.locale.Strings.UnableToSave,"fpDraftStatus");
                        }
                    });
                },
                "error":function(result){
                    showDraftStatus(xfalib.locale.Strings.UnableToSave,"fpDraftStatus");
                }
            };
            var fileUploadObj = {
                "success":function(result){
                    $.each(result, function(index, res) {
                        fileList += res.path + "\n";
                    });
                    //to remove last '\n' from list
                    fileList = fileList.replace(/\n$/, "");
                    window.formBridge.getDataXML(obj);
                },
                "error":function(result){

                },
                "fileUploadPath":fileUploadPath
            };
            window.formBridge.getFileAttachmentsInfo(fileUploadObj);
        },

        _saveMFDraftWrapper: function () {
            if (typeof window.formBridge.customContextProperty("mfDraftId") === "undefined" || window.formBridge.customContextProperty("mfDraftId") == null) {
                $.ajax({
                    method: "GET",
                    url: Granite.HTTP.externalize("/content/forms/portal/draftandsubmission.fp.draft.json?func=getUid"),
                    dataType: "json"
                }).done(function (response) {
                    var draftID = response.id;
                    window.formBridge.customContextProperty("mfDraftId", draftID + "_mf");
                    FD.FP.MF.saveMFDraft();
                }).fail(function (errorObj) {
                    $("#fpDraftStatus").text(xfalib.locale.Strings.UnableToSave).show().fadeOut(1600,"linear");
                    return 0;
                });
            } else {
                FD.FP.MF.saveMFDraft();
            }
        }
    };

    $(document).ready(function(){
        $("#toolbarsavebtn").click(function(){
            window.FD.FP.MF._saveMFDraftWrapper();
        })
    });
})(jQuery);