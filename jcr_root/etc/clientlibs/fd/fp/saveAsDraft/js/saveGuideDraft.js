/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2014 Adobe Systems Incorporated
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
 *
 */
(function ($, _) {
    window.FD = window.FD || {};
    FD.FP = FD.FP || {};

    FD.FP.AF = {
        /***
         * Saves the draft of adaptive forms
         @param options: {object} options can consist of following
         * <ul>
         *     <li> isAutoSaveTriggered: {boolean} Indicates if the auto save is triggered or not   </li>
         *     <li> metadataToSave: {object} The meta data to save with draft </li>
         *     <li> enableAnonymous: {boolean} indicating whether you want to have anonymous save or not.</li>
         *     <li> success: {function}  Handler executed in case when the draft is successfully saved</li>
         *     <li> error: {function}  Handler  executed in case of draft failure</li>
         *     <li> context {object}  The context with which the success or error handler needs to be executed</li>
         * </ul>
         * @private
         */
        _handleDraftSave: function (options) {
            var isAutoSaveTriggered = options.isAutoSaveTriggered,
                metadataToSave = options.metadataToSave,
                enableAnonymous = options.enableAnonymous,
                guidePath = window.guideBridge.getGuideContext().data[window.guideBridge.GUIDE_PATH],
                draftID = window.guideBridge.customContextProperty("draftID"),
                customContextProperty = xfalib.ut.Class.prototype.getOrElse(window.guidelib.runtime.guideContext.customPropertyMap,{}),
                errorObj,
                dataXML,
                node,
                fileAttachmentsList = [],
                fileAttachmentMap = {};

            $("#draftID").attr("value", draftID);
            var currentNodePath = $("#saveButtonPath").data("savebuttonpath") || guidePath,
                contextPath = window.guideBridge._getUrl(currentNodePath),
                fileUploadPath = contextPath + ".fp.attach.jsp/" + draftID;

            if(customContextProperty == null) {
                customContextProperty = {};
            };

            var paramObj = {
                "success": function (result) {
                    window.guideBridge.trigger(
                        "saveStarted",
                        window.guidelib.event.GuideModelEvent.createEvent("saveStarted")
                    );
                    dataXML = result.data;
                    //it can be json, fdm, xsd, xdp or nothing.
                    var guide = guideBridge.resolveNode("guide[0].guide1[0]");
                    var schemaType = guide.getAttribute("schemaType");
					//keep it default as xml
                    var dataType = "XML";
                    if(!_.isUndefined(schemaType)) {
                        if(schemaType == "jsonschema" || schemaType == "formdatamodel") {
                            dataType = "JSON";
                        } else {
                            dataType = "XML";
                        }
                    }
                    /*
                     * file attachment map will be used for restoring the attachment for xml based adaptive forms
                     * as this information is not available in dataXML,sending it seperately
                     */
                    window.guideBridge._getFileAttachmentsList(fileAttachmentsList);
                    for (var i = 0; i < fileAttachmentsList.length; i++) {
                        node = fileAttachmentsList[i];
                        //CQ-100843 : do not put entries for widgets in which no file is attached
                        if(!_.isEmpty(node.fileAttachment.value)) {
                            fileAttachmentMap[node.somExpression] = node.fileAttachment.value;
                        }
                    }
                    var urlForDraft = contextPath + ".fp.draft.json?func=saveDraft";
                    var data = {
                        'formPath': guidePath,
                        'formData': dataXML,
                        'draftID': draftID,
                        'formType': "af",
                        '_charset_': "UTF-8",
                        'enableAnonymousSave': enableAnonymous,
                        'dataType': dataType,  //dataType for defining the type of formdata for backward compatibility
                        'fileAttachmentMap': JSON.stringify(fileAttachmentMap),
                        'customContextProperty' : JSON.stringify(customContextProperty)
                    };
                    if (metadataToSave) {
                        for (var key in metadataToSave) {
                            if (metadataToSave.hasOwnProperty(key)) {
                                data[key] = metadataToSave[key];
                            }
                        }
                    }
                    var allowedMetadata = [];
                    for (key in data) {
                        if (key !== 'formData') {
                            allowedMetadata.push(key);
                        }
                    }
                    data["fpAllowedMetadata"] = allowedMetadata.toString();

                    $.ajax({
                        type: "POST",
                        url: urlForDraft,
                        async: true,
                        cache: false,
                        mimeType: "multipart/form-data",
                        data: data,
                        success: function (result) {
                            if (!isAutoSaveTriggered) {
                                $(".__FP_Saved_Message").show();
                                $(".__FP_Saved_Message").fadeOut(1600, "linear");
                            }
                            window.guideBridge.trigger(
                                "saveCompleted",
                                window.guidelib.event.GuideModelEvent.createEvent("saveCompleted")
                            );
                            if (!_.isUndefined(options.success)) {
                                options.success.call(options.context || this);
                            }
                        },
                        error: function (result) {
                            if (!isAutoSaveTriggered) {
                                if (result.status == "503") {
                                    alert(guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-008"]));
                                } else {
                                    alert(guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-009"]));
                                }
                            }
                            if (!_.isUndefined(options.error)) {
                                options.error.call(options.context || this);
                            }
                        }
                    });
                },
                "error": function (result) {
                    errorObj = result;
                    if (errorObj != null) {
                        console.log(guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-009"]));
                        return 0;
                    }
                },
                "fileUploadPath": fileUploadPath
            };
            window.guideBridge.getData(paramObj);
        },

        _handleDraftSaveWrapper: function (options) {
            if (typeof window.guideBridge.customContextProperty("draftID") === "undefined" || window.guideBridge.customContextProperty("draftID") == null) {
                $.ajax({
                    method: "GET",
                    url: Granite.HTTP.externalize("/content/forms/portal/draftandsubmission.fp.draft.json?func=getUid"),
                    dataType: "json"
                }).done(function (response) {
                    var draftID = response.id;
                    window.guideBridge.customContextProperty("draftID", draftID + "_af");
                    FD.FP.AF._handleDraftSave(options);
                }).fail(function (errorObj) {
                    alert(guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-009"]));
                    return 0;
                });
            } else {
                FD.FP.AF._handleDraftSave(options);
            }
        }
    };

    /**
     * Save draft of the current adaptive form loaded
     * @param saveBtnConfig {object} Optional parameter for providing
     * @param options {object} Optional parameter options can consist of following -
     *  <ul>
     *     <li> success: {function}  Handler executed in case when the draft is successfully saved</li>
     *     <li> error: {function}  Handler  executed in case of draft failure</li>
     *     <li> context {object}  The context with which the success or error handler needs to be executed</li>
     * </ul>
     *
     */
        // To maintain backward compatibility, keeping this function on window
        // This method will be used for click expression of save button
        // saveBtnConfig  kept as it is for backward compatiablity metadata to the save button
    handleDraftSave = function (saveBtnConfig, options) {
        var metadataToSave = {}, enableAnonymous = false, fpMetadata = null, metadata = null;
        if (saveBtnConfig) {
            var metadataselector = saveBtnConfig.getAttribute('metadataselector');
            if (metadataselector && metadataselector === 'local') {
                fpMetadata = saveBtnConfig.getAttribute("fpmetadata");
            } else {
                var metaInfo = window.guideBridge.getGlobalMetaInfo();
                fpMetadata = metaInfo && metaInfo.hasOwnProperty("metadata") ? metaInfo['metadata'] : null;
            }
            if (fpMetadata) {
                if (typeof fpMetadata === 'object') {
                    for (var index in fpMetadata) {
                        var currentMetadata = JSON.parse(fpMetadata[index]);
                        metadataToSave[currentMetadata["key"]] = window.guideBridge._guide._compileExpression(currentMetadata["value"])();
                    }
                } else if (typeof fpMetadata === 'string') {
                    var currentMetadata = JSON.parse(fpMetadata);
                    metadataToSave[currentMetadata["key"]] = window.guideBridge._guide._compileExpression(currentMetadata["value"])();
                }
            }
            if (saveBtnConfig.getAttribute("enableAnonymous")) {
                enableAnonymous = saveBtnConfig.getAttribute("enableAnonymous");
            }
        }
        if (_.isUndefined(options)) {
            options = {}
        }
        options.metadataToSave = metadataToSave;
        options.enableAnonymous = enableAnonymous;
        options.isAutoSaveTriggered = false;
        window.FD.FP.AF._handleDraftSaveWrapper(options);
    }
})(jQuery, _);
