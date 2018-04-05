/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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


$(function ($) {
    // $doc.ready for jquery 1.8 causing issues for IE so
    // doing widget initialization on connect
 window.formBridge.connect(function () {
     var method = {
         init: function () {
             var $plugFileWidgetDom = $('[data-filewidget="true"]'),
                 options,
                 $fileWidget,
                 $inputWidget,
                 $buttonWidget,
                 $listWidget,
                 widgetName,
                 multiSelect = true,
                 optionsToWidget;
                 options = $plugFileWidgetDom.data("options") || {};
                 options.buttonText = options.buttonText || "Attach";
                 options.accept = options.accept || "audio/*, video/*, image/*, text/*, .pdf" ;
                 $fileWidget = $("<div></div>").addClass("guideFieldWidget").addClass("fileUpload").attr("style","")
                                               .attr("title", xfalib.locale.Strings["Attach"]);

                 $inputWidget = $("<input/>").attr("id", "fileUpload_widget").attr("name", "fileUpload")
                     .attr("type","file")
                     .attr("style", "")
                     .attr("accept",options.accept)
                     .attr("tabindex", "-1")
                     .attr("capture","");

                 $buttonWidget = $("<button/>").addClass("button-default").addClass("button-medium")
                     .addClass("guide-fu-attach-button")
                     .attr("type", "file")
                     .html(options.buttonText);

                 $listWidget= $('<ul></ul>').addClass("guide-fu-fileItemList");
                 $fileWidget.append($inputWidget).append($buttonWidget).append($listWidget);
                 $fileWidget.appendTo($plugFileWidgetDom);
                 widgetName = options.widgetName || "fileUpload";
                 // multiSelect is expected to be boolean by widget
                 // And the profile node passes it as string
                 // and widget.jsp passes the same as boolean
                 //  options.multiSelect can be "true" ,  "false"
                 // or can be true ,  false
                 // or it can be undefined (when initializing  multiSelect  to true defines default behaviour )
                 if(_.isBoolean(options.multiSelect)) {
                     multiSelect = options.multiSelect;
                 } else if (_.isString(options.multiSelect)) {
                     multiSelect = options.multiSelect.toLowerCase() === 'true';
                 }
                 optionsToWidget =   {
                     buttonText  : options.buttonText || "Attach",
                     multiSelect :  multiSelect,
                     fileSizeLimit : options.fileSizeLimit || "2",
                     buttonClass : options.buttonClass || "button.guide-fu-attach-button",
                     fileItemListClass : options.fileItemListClass|| "ul.guide-fu-fileItemList",
                     iframeContainer: options.iframeContainer || "body#formBody",
                     showComment :  options.showComment || false,
                     _uuidGenerator: function () { return formBridge._getUUID.apply(this); },
                     value: options.value || xfalib.runtime.fileAttachment ,
                     _filePath: options._filePath || "/tmp/fd/xfaforns",
                     widgetName: "fileUpload",
                     _getUrl: options._getUrl || formBridge._getUrl(""),
                     disablePreview: options.disablePreview || false,
                     uploaderPluginName: "adobeFileUploader"



                 };
                 var widget = $fileWidget[widgetName](optionsToWidget);
                 xfalib.runtime.fileUploadWidget = widget.data(widgetName) || widget.data("xfaWidget-" + widgetName);
             }
     };
     method.init();
 });
});


