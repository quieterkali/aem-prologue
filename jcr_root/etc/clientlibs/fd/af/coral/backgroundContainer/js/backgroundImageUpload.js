/*************************************************************************
*
* ADOBE CONFIDENTIAL
* __________________
*
*  Copyright 2016 Adobe Systems Incorporated
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
// We have used style-prefix in class selectors to avoid
// conflicts with the imageUpload script of formauthoring.
//TODO: for now we have used a prefix to differentiate any conflicts in both scripts.
;(function ($, style, undefined) {

    /*
     * Required for working of the uploadFile Component.
     */

    var triggerImageUploadInitialiseEvent = function () {
            var ev = {
                type : "fdImageUpload-contentLoaded",
                $imageUploadComponent : $(".style-fdImageUploadGroup")
            };
            $(document).trigger(ev);
        },
        /*
         *  Function to execute on file uploaded.
         */
        onFileUploadHandler = function (ev) {
            var fileUploadValue = ev.target.value,
                currentFileName = fileUploadValue.substring(fileUploadValue.lastIndexOf('\\') + 1, fileUploadValue.length),
                fileUploadComponent = ev.originalEvent.target,
                $fileUploadComponent = $(fileUploadComponent),
                $imageUploadComponent = $(fileUploadComponent).parent(),
                currentFileFolder =  style.vars.styleAssetsPrefixPath + "/" + style.vars.styleAssetsRelativePath,
                currentFileLocation = style.vars.styleAssetsRelativePath + "/" + currentFileName,
                $imageUploadHiddenInput = $imageUploadComponent.find(".style-imageUploadHiddenInput");
            fileUploadComponent.action = CQ.shared.HTTP.externalize(currentFileFolder);
            fileUploadComponent.name = currentFileName;
        },
        /*
         * Trigger the change event after file is uploaded so that url
         * given in "background" property is available.
         */

        afterFileUploadHandler = function (ev) {
            var fileUploadValue = ev.target.value,
                currentFileName = fileUploadValue.substring(fileUploadValue.lastIndexOf('\\') + 1, fileUploadValue.length),
                fileUploadComponent = ev.originalEvent.target,
                $fileUploadComponent = $(fileUploadComponent),
                $imageUploadComponent = $(fileUploadComponent).parent(),
                $imageUploadHiddenInput = $imageUploadComponent.find(".style-imageUploadHiddenInput"),
                currentFileLocation = style.vars.styleAssetsRelativePath + "/" + currentFileName;
            $imageUploadHiddenInput.adaptTo("foundation-field").setValue(currentFileLocation);
            $imageUploadHiddenInput.trigger("change");
        },
        /*
         * Set value of hidden input field.
         */

        assetBrowserChangeHandler = function (ev) {
            var $imageUploadComponent = $(ev.target).closest(".style-fdImageUploadGroup"),
                $imageUploadHiddenInput = $imageUploadComponent.find(".style-imageUploadHiddenInput"),
                assetBrowserValue = ev.target.value;
            $imageUploadHiddenInput.adaptTo("foundation-field").setValue(assetBrowserValue);
            $imageUploadHiddenInput.trigger("change");
        },

        /*
         * Set empty value on hidden input field.
         */
        cancelPreviewHandler = function (ev) {
            var $imageUploadComponent = $(ev.target).closest(".style-fdImageUploadGroup"),
                $imageUploadHiddenInput = $imageUploadComponent.find(".style-imageUploadHiddenInput");
            $imageUploadHiddenInput.adaptTo("foundation-field").setValue("");
            $imageUploadHiddenInput.trigger("change");
        },
        registerEvents = function () {
            $(document).on("coral-fileupload:fileadded", onFileUploadHandler);
            $(document).on("coral-fileupload:loadend", afterFileUploadHandler);
            $(".style-fdImageUploadGroup").find(".style-fdImageAssetBrowser").find("[data-assetBrowserProperty = 'assetBrowserHiddenInput']").on("change", assetBrowserChangeHandler);
            $(".style-fdImageUploadGroup").find(".style-fdImageCancelButton").on("click", cancelPreviewHandler);
        },

        imageUploadInit = function () {
            triggerImageUploadInitialiseEvent();
            registerEvents();
        };

    $(document).on("style-propertysheet-created", imageUploadInit);
}(jQuery, window.guidelib.touchlib.style));
