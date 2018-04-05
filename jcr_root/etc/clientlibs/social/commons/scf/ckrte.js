/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
 */
(function(Backbone, $CQ, _, Handlebars) {
    "use strict";

    var CKRte = function(element, config, model, view) {
        var rteConfig = {};
        rteConfig = _.extend(config, rteConfig);
        rteConfig = _.extend(this.config, rteConfig);
        var el = element.get()[0];
        if (_.isUndefined(window.CKEDITOR)) {
            SCF.log.error("Rich text editor requested but unable to find CKEDITOR please include client library category: \"%s\" or disable RTE", "ckeditor");
            return;
        }
        this.$el = element;
        var height = this.$el.data("editorheight");
        var uploadUrl = SCF.config.urlRoot + model.get("id") + SCF.constants.URL_EXT;
        var modelConfigAttachmentAllowed = model.get("configuration");
        modelConfigAttachmentAllowed = modelConfigAttachmentAllowed && modelConfigAttachmentAllowed.isAttachmentAllowed;


        if (rteConfig.extraPlugins === undefined) {
            rteConfig.extraPlugins = (window.CKEDITOR.config.extraPlugins) ? window.CKEDITOR.config.extraPlugins +
                "," : undefined;
        }

        var toolbarArr = rteConfig.toolbar[0].items;
        var index;
        // Add oEmbed plugin by default for Blogs Articles and Calendar Events
        if (model.get("resourceType") === "social/journal/components/hbs/journal" ||
            model.get("resourceType") === "social/calendar/components/hbs/calendar" ||
            model.get("resourceType") === "social/ideation/components/hbs/ideation" ||
            model.get("resourceType") === "social/ideation/components/hbs/idea" ||
            (model.get("resourceType") === "social/calendar/components/hbs/event" ||
                model.get("resourceType") === "social/journal/components/hbs/entry_topic") &&
            element[0].dataset.rteType !== 'comment') {

            // Add the oembed Icon to toolbar
            index = toolbarArr.indexOf("oembed");
            if (index === -1) {
                rteConfig.toolbar[0].items.push("oembed");
            }

            if (rteConfig.extraPlugins === undefined) {
                rteConfig.extraPlugins = "oembed";
            } else if (rteConfig.extraPlugins.length > 0 && rteConfig.extraPlugins.indexOf("oembed") === -1) {
                rteConfig.extraPlugins = rteConfig.extraPlugins.concat(",oembed");
            }
        } else { // Need to remove the oembed plugin for the Blog Comment
            index = toolbarArr.indexOf("oembed");
            if (index > 0) {
                toolbarArr.splice(index, 1);
            }
        }

        if (modelConfigAttachmentAllowed) {
            rteConfig.filebrowserUploadUrl = uploadUrl;
            rteConfig.uploadUrl = uploadUrl;

            // Add the Image Icon to toolbar
            index = toolbarArr.indexOf("Image");
            if (index === -1) {
                rteConfig.toolbar[0].items.push("Image");
            }

            if (rteConfig.extraPlugins === undefined) {
                rteConfig.extraPlugins = "image2,uploadimage";
            } else if (rteConfig.extraPlugins.length > 0 && rteConfig.extraPlugins.indexOf("image2,uploadimage") === -1) {
                rteConfig.extraPlugins = rteConfig.extraPlugins.concat(",image2,uploadimage");
            }
        } else {
            // Add the Image Icon to toolbar
            index = toolbarArr.indexOf("Image");
            if (index === -1) {
                rteConfig.toolbar[0].items.push("Image");
            }

            if (rteConfig.extraPlugins === undefined) {
                rteConfig.extraPlugins = "image2";
            } else if (rteConfig.extraPlugins.length > 0 && rteConfig.extraPlugins.indexOf("image2") === -1) {
                rteConfig.extraPlugins = rteConfig.extraPlugins.concat(",image2");
            }
        }

        var domElementName = $CQ(el).attr("name");
        if (_.isEmpty(domElementName)) {
            var modelId = model.get("id");
            var idx = modelId.lastIndexOf("/");
            modelId = modelId.slice(idx + 1);
            var attribName = $CQ(el).data("attrib");
            modelId = attribName + "-" + modelId;
            $CQ(el).attr("name", modelId);
            domElementName = modelId;
        }
        var resizeEnabled = this.$el.data("editorresize");
        if (resizeEnabled) {
            rteConfig.resize_enabled = true;
        }

        if (_.isNumber(height)) {
            rteConfig.height = height;
        }

        if (!window.CKEDITOR.instances[domElementName]) {
            this.editor = window.CKEDITOR.replace(el, rteConfig);
        } else {
            if (this.editor === undefined) {
                this.editor = window.CKEDITOR.instances[domElementName];
            }
        }
        /*if (_.isNumber(height)) {
            delete this.config.height;
        }
        if (resizeEnabled) {
            delete this.config.resize_enabled;
        }*/
        this.model = model;
        if (modelConfigAttachmentAllowed) {
            this.editor.on("fileUploadRequest", this.attachFileFromDragAndDrop);
            this.editor.on("fileUploadResponse", this.handleFileUploadResponse);
            this.changeImagePluginDialog();
        }
    };

    CKRte.prototype.destroy = function() {
        if (this.editor) {
            try {
                if (this.editor.filter && this.editor.window && this.editor.window.getFrame()) {
                    this.editor.destroy(true);
                    this.editor.removeAllListeners();
                } else {
                    this.editor.removeAllListeners();
                    window.CKEDITOR.remove(this.editor);
                    window.CKEDITOR.fire("instanceDestroyed", null, this.editor);
                }
            } catch (e) {
                SCF.log.error("Couldn't destroy editor: %o", e);
            }
        }
        delete this.editor;
        return;
    };


    CKRte.prototype.getFileIFrameFromDialog = function(definition) {
        var dialogDefinition = definition;
        var contents = dialogDefinition.contents;
        for (var i = 0; i < contents.length; i++) {
            var contentObject = contents[i];
            var contentObjectId = contentObject.id;
            // Code specific to image plugin. They have give the ID as Upload
            if (contentObjectId == "Upload") {
                var elements = contentObject.elements;
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j];
                    var elementId = element.id;
                    if (elementId == "uploadButton") {
                        // set the custom Function
                        element.onClick = this.setCustomFileButtonClick;
                        element["for"] = ["Upload", "file"];
                    }
                    if (elementId == "upload") {
                        element.id = "file";
                    }
                }
            }
        }
    };

    CKRte.prototype.setCustomFileButtonClick = function(evt) {
        var target = evt.sender["for"];
        var dialog = evt.data.dialog;
        var fileElement = dialog.getContentElement(target[0], target[1]);
        var fileIframe = $CQ("#" + fileElement.domId + " iframe");
        //set additional parameters for the upload to happen
        var fileIframeForm = fileIframe.contents().find("form");
        var success = _.bind(function(response) {
            var location = response.response.url;
            location = CQ.shared.HTTP.encodePath(location);
            dialog.getContentElement("info", "src").setValue(location);
            dialog.selectPage("info");
            if ($CQ(".cke_dialog_ui_input_text").length !== 0) {
                $CQ(".cke_dialog_ui_input_text").focus();
            }
        }, this);
        var error = _.bind(function(response) {
            SCF.log.error("Failed to upload file" + response);
        }, this);
        var postData;
        var formFiles = fileIframeForm.find("input:file");
        var files = formFiles[0].files;
        var hasAttachment = (typeof files != "undefined");
        if (hasAttachment) {
            // Create a formdata object and add the files
            var url = fileIframeForm.attr("action");
            CKRte.prototype.attachFile.call(this, files, url, success, error);
        }
        evt.stop();
        return false;
    };

    CKRte.prototype.handleFileUploadResponse = function(evt) {
        evt.stop();
        var data = evt.data;
        var xhr = data.fileLoader.xhr;
        var response = xhr.responseText;
        response = JSON.parse(response);
        if (xhr.status == 200) {
            data.uploaded = 1;
            data.url = CQ.shared.HTTP.encodePath(response.response.url);
            data.name = response.response.properties.name;
        }
    };

    CKRte.prototype.attachFileFromDragAndDrop = function(evt) {
        var fileLoader = evt.data.fileLoader;
        var xhr = fileLoader.xhr;
        var postData;
        if (window.FormData) {
            postData = new FormData();
        }
        if (postData) {
            postData.append("file", fileLoader.file);
            postData.append("id", "nobot");
            postData.append(":operation", "social:uploadImage");
            postData.append("_charset_", "UTF-8");
            xhr.open("POST", fileLoader.uploadUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.withCredentials = true;
            xhr.send(postData);
        }
        evt.stop();
    };

    CKRte.prototype.attachFile = function(files, url, success, error) {
        var postData;
        if (window.FormData) {
            postData = new FormData();
        }
        if (postData) {
            $CQ.each(files, function(key, value) {
                postData.append("file", value);
            });
            postData.append("id", "nobot");
            postData.append(":operation", "social:uploadImage");
            postData.append("_charset_", "UTF-8");
            $CQ.ajax(url, {
                dataType: "json",
                type: "POST",
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
                data: postData,
                "success": success,
                "error": error
            });
        }
    };
    CKRte.prototype.changeImagePluginDialog = function() {
        // List of things being done
        // Get the dialog defintion of the image2 plugin
        // Setting a custom onClick function to the file input button in the dialog
        // Getting the iframe that loads the server response after an image is uploaded
        // Set addition params specific to upload operation
        // Add an onload event listener to the iframe
        // The iframe onload event listener updates the field that has image URL
        if (!CKRte.isImageDialogDefinitionChanged) {
            CKRte.isImageDialogDefinitionChanged = true;
            var that = this;
            window.CKEDITOR.on("dialogDefinition", function(ev) {
                var dialogName = ev.data.name;
                if (dialogName == "image2") {
                    that.getFileIFrameFromDialog(ev.data.definition);
                }
            });
        }
    };

    CKRte.prototype.config = {
        toolbar: [{
            name: "basicstyles",
            items: ["Bold", "Italic", "Underline", "NumberedList", "BulletedList", "Outdent", "Indent", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", "TextColor"]
        }],
        autoParagraph: false,
        autoUpdateElement: false,
        removePlugins: "elementspath",
        resize_enabled: false
    };
    CKRte.prototype.setValue = function(val) {
        this.editor.setData(val);
    };
    CKRte.prototype.getValue = function() {
        return this.editor.getData();
    };
    CKRte.prototype.focus = function() {
        return this.editor.focus();
    };

    CKRte.isImageDialogDefinitionChanged = false;

    SCF.registerFieldType("ckeditor", CKRte);
    SCF.registerFieldType("rte", CKRte);
})(Backbone, $CQ, _, Handlebars);
