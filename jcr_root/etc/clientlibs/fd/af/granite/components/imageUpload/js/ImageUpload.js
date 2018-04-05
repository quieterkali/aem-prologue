// jscs:disable requireDotNotation
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
;(function ($, ns, undefined) {

    var FILE_UPLOAD_INPUT_CLASS = "coral3-FileUpload-input",
        updateProperties = function (params, path) {// now persist this property in server in the given content path
            var editPath = path.replace("_jcr_content", "jcr:content");
            return $.ajax({
                url : Granite.HTTP.externalize(path),
                data : params,
                type : "POST",
                datatype : "json",
                async : true
            });
        },
        refreshEditable = function (path) {
            // data submitted successfully
            // refresh the editable since images and options are uploaded asynchronously
            // this is done to reflect the changes in authoring
            var editPath = path.replace("_jcr_content", "jcr:content");
            // remove the context path, reason we ask HTML for the URL and that URL has context path
            // Please note: for widget html is source of truth
            editPath = editPath.replace(Granite.HTTP.getContextPath(), "");
            if (ns.author && ns.author.DialogFrame.currentDialog && !ns.author.DialogFrame.currentDialog.resourceType && ns.author.editables) {
                ns.author.editables.find(editPath)[0].refresh();
            }
        },
        resolveDeferred = function (deferred) {
            if (deferred != null && typeof deferred != "undefined") {
                // resolve deferred object for next upload request in queue
                deferred.resolve();
            }
        };
    //Method to handle image upload Component post processing - cleanup and upload
    var imageUploadPostProcessing = function ($imageUploadComponent, param) {
        var imageType =  $imageUploadComponent.data("imageType"),
            contentPath = $imageUploadComponent.find("coral-fileupload").attr("action"),
            fileReferenceProperty = $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']").attr("name").replace("./", ""),
            fileReferenceValue = $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']").val(),
            updateRequestParams = {};

        updateRequestParams[fileReferenceProperty + "@Delete"] = "deletedValue";
        updateRequestParams["fileName@Delete"] = "deletedValue";
        updateRequestParams["file@Delete"] = "deletedValue";
        if (imageType == "imageUpload") {
            //Triggering the file upload event for uploading file in case of autostart false
            $imageUploadComponent.find(".fdImageFileUpload").trigger("fdFileUpload", param);
        } else if (imageType == "assetBrowser") {
            updateRequestParams[fileReferenceProperty] = fileReferenceValue;
            updateRequestParams["fileName"] = $imageUploadComponent.data("fileName");
            // please note this is used on server for rendition
            // update file name of asset browser to server
            updateProperties(updateRequestParams, contentPath).done(function (data) {
                refreshEditable(contentPath);
                resolveDeferred(param.deferred);
            });
        } else if (imageType == "none") {
            // imageType == "none" signifies that "cancel" action has been clicked for removing image.
            updateProperties(updateRequestParams, contentPath).done(function (data) {
                refreshEditable(contentPath);
                resolveDeferred(param.deferred);
            });
        } else {
            // If no changes is done in image upload component, imageType will be undefined.
            // So not doing anything in case imageType is not one of the "none", "assetBrowser", "imageUpload".
        }
    };

    var showImagePreview = function ($imageUploadComponent) {
        $imageUploadComponent.find(".fdImageUploadTable").show();
    };

    var hideImagePreview = function ($imageUploadComponent) {
        $imageUploadComponent.find(".fdImageUploadTable").hide();
    };

    var processImageUploadComponent = function ($imageUploadComponent) {
        var imageSource = $imageUploadComponent.find(".fdUploadImage").attr("src");
        //Dynamic handling of change event of asset browser and file upload
        $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']").on("change", function (e) {
            $imageUploadComponent.data("imageType", "assetBrowser");
            showImagePreview($imageUploadComponent);
            var assetBrowserValue = $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']")[0].value,
                fileName = assetBrowserValue.substring(assetBrowserValue.lastIndexOf('/') + 1, assetBrowserValue.length);
            $imageUploadComponent.data("fileName", fileName);
            $imageUploadComponent.data("imageType", "assetBrowser");
            $imageUploadComponent.find(".fdUploadImage").attr("src", CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(assetBrowserValue)));
            $imageUploadComponent.find(".fdImageName").empty();

            $imageUploadComponent.find(".fdImageName").append(fileName);
        });

        $imageUploadComponent.find(".fdImageFileUpload").on("change", function (e) {
            var fileName = $imageUploadComponent.find(".fdImageFileUpload").attr("name").replace('./', '');
            $imageUploadComponent.data("imageType", "imageUpload");
            showImagePreview($imageUploadComponent);
            $imageUploadComponent.data("fileName", fileName);
            $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']")[0].value = "";
        });

        if (imageSource == '' || imageSource == null) {
            hideImagePreview($imageUploadComponent);
        }

        //Cancel Preview Button handling
        $imageUploadComponent.find(".fdImageCancelButton").on("click", function (e) {
            $imageUploadComponent.find(".fdUploadImage").attr("src", "");
            hideImagePreview($imageUploadComponent);
            $imageUploadComponent.find(".fdImageAssetBrowser").find("[type='text']")[0].value = "";
            $imageUploadComponent.data("imageType", "none");
            $imageUploadComponent.data("fileName", null);
        });

        //File Upload component autostart false handling
        $imageUploadComponent.find(".fdImageFileUpload").on('coral-fileupload:fileadded', function (e) {
            var that = this,
                fileName = that.value.replace(/^.*\\/, ""),
                contentPath = $imageUploadComponent.find("coral-fileupload").attr("action"),
                item = this._getQueueItemByFilename(fileName),
                reader = new FileReader();

            // These parameters are for saving the image under a nt:file node.
            // If this parameter is not added to the request, then a nt:resource node is created for the image.
            var attrName = this.name + "@TypeHint",
            attrValue = "nt:file";
            this.parameters.push({name : attrName, value : attrValue});

            // delete fileReference, fileName and file before updating with new values
            this.parameters.push({name : "./fileReference@Delete", value : "deletedValue"});
            this.parameters.push({name : "./fileName@Delete", value : "deletedValue"});
            this.parameters.push({name : "./file@Delete", value : "deletedValue"});
            this.parameters.push({name : "./fileName", value : fileName});

            reader.onload = function (event) {
                fileUrl = event.target.result;
                //Update Preview image
                //TODO seperate js files for both image upload componenet in theme and inline.
                $imageUploadComponent.find(".fdUploadImage").attr("src", CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(fileUrl)));
            };
            // adding fallback by finding the input, since we are using private variable here
            reader.readAsDataURL(item._originalFile || $(e.target).find("." + FILE_UPLOAD_INPUT_CLASS)[0].files[0]);

            $imageUploadComponent.find(".fdImageFileUpload").off("fdFileUpload");
            $imageUploadComponent.find(".fdImageFileUpload").on("fdFileUpload", function (e, param) {
                var paramObj = param;
                that.upload(fileName);

                $imageUploadComponent.find(".fdImageFileUpload").off('coral-fileupload:load');
                // once file is uploaded, set the data-url attribute in the widget
                $imageUploadComponent.find(".fdImageFileUpload").on('coral-fileupload:load', function (e) {
                    resolveDeferred(paramObj.deferred);
                    // in case of theme editor there is no context path, hence don't do anything
                    // in case of theme editor, we use the component with autoStart true, hence coral-fileupload:load
                    // event is thrown on click of upload button, adding a safe check for this
                    if (contentPath != null) {
                        // since name of the file is of the form "./name", we remove the first dot
                        // from the string before setting the file url
                        var url = contentPath + $(e.target).attr("name").substring(1);
                        $(e.target).attr("data-url", url);
                        // this ensures that the editable is refreshed after file gets uploaded
                        // please note this is used on server for rendition
                        refreshEditable(contentPath);
                    }

                });
            });
            $imageUploadComponent.find(".fdImageName").empty();
            $imageUploadComponent.find(".fdImageName").append(fileName);

        });

        $imageUploadComponent.find(".fdImageCancelButton").on("click", function (e) {
            $imageUploadComponent.find(".fdImageCancelButton").trigger("change");
        });

        //Post processing handling for image upload component
        $imageUploadComponent.off("fdSubmitProcessing");
        $imageUploadComponent.on("fdSubmitProcessing", function (e, param) {
            imageUploadPostProcessing($(e.target), param);
        });
    };

    $(document).on("fdImageUpload-contentLoaded", function (e) {
        processImageUploadComponent(e.$imageUploadComponent);
    });

    $(document).on("foundation-contentloaded", function (e) {
        if (($(e.target).hasClass("cq-dialog") || ($(e.target).hasClass("guide-dialog"))) && $(e.target).find(".fdImageUploadGroup").length > 0) {
            $.each($(e.target).find('.fdImageUploadGroup'), function (index, value) {
                processImageUploadComponent($(value));
            });
        }
    });
}(jQuery, window.Granite, this));
