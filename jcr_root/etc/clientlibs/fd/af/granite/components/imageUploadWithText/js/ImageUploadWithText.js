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

// jscs:disable requireDotNotation
;(function ($, _, ns, channel, window, document, undefined) {
    "use strict";

    var _fileUploadWidgetWithTextClass_ = "coral-multifield-item-content .fdImageUploadWithText",
        _fileUploadWidgetTextFieldClass_ = "coral-multifield-item-content .fdImageUploadTextField",
        _fileUploadWidgetFileUploadClass_ = "coral-multifield-item-content .fdImageUploadWithText coral-fileupload",
        _fileUploadWidgetAssetBrowserClass_ = "coral-multifield-item-content .fdImageUploadWithText .fdImageUploadWithTextAssetBrowser",
        _fileUploadWidgetWithTextIconClass_ = "coral-multifield-item-content .fdImageUploadWithText .fdImageUploadWithTextIcon",
        _FileUploadSelector_ = "coral-fileupload",
        _AssetBrowserSelector_ = ".fdImageUploadWithTextAssetBrowser",
        _IconSelector_ = ".fdImageUploadWithTextIcon",
        _ImageUploadWithTextContainer_ = ".fdImageUploadWithText",
        _fileUploadWidgetInputClass_ = "coral3-FileUpload-input",
        _ImageUploadWithTextWrapperClass_ = ".imageUploadWithTextWrapperClass coral-multifield",
        coralClassConstants = window.guidelib.touchlib.constants.coralclass;

    /**
     *
     * @param widget
     * @param resourceURL
     * @constructor
     */
    var FileUploadField = function (widget, resourceURL) {
        this.widget = widget;
        this.resourceURL = resourceURL;
        this._bindEvents();
    },

    _hideCoralPopOver = function ($popOver) {
        $popOver.hide();
    },

    /**
     * Preview File uploaded as icons
     * @param fileUrl
     * @private
     */
    _previewFile = function ($element, fileUrl) {
        // set the background image of coral icon
        $element.find("coral-icon").css({
            "background-image" : 'url("' + Granite.HTTP.externalize(fileUrl) + '")',
            "background-size" : "cover"
        }).removeClass("coral-Icon--image").addClass("previewIcon"); // remove the upload icon if present
    };
    /**
     *
     * @private
     */
    FileUploadField.prototype._bindEvents = function () {
        var self = this,
            imageUploadContainer = self.widget.closest(_ImageUploadWithTextContainer_),
            $container = self.widget.closest(_ImageUploadWithTextWrapperClass_);

        // when autoStart is set to false, we have to explicitly handle the file added option
        //File Upload component autostart false handling
        self.widget.on('coral-fileupload:fileadded', function (e) {
            // get the item attribute
            var that = this,
                fileName = that.value.replace(/^.*\\/, ""),
                item = this._getQueueItemByFilename(fileName),
                // touch ui is HTML5, hence using file reader API here
                reader = new FileReader();
            // Reset the URL attribute if file is added
            $(e.target).removeAttr("data-url");

            reader.onload = function (event) {
                // here event.target is file reader and result contains base64 encoded image data
                var fileUrl = event.target.result,
                    $icon = imageUploadContainer.find(_IconSelector_);
                _previewFile($icon, fileUrl);
                // hide the popover
                _hideCoralPopOver($icon.data("popOver"));
            };

            function errorHandler(event) {
                switch (event.target.error.code) {
                    case event.target.error.NOT_FOUND_ERR:
                        if (console) {
                            console.log('File Not Found!');
                        }
                        break;
                    case event.target.error.NOT_READABLE_ERR:
                        if (console) {
                            console.log('File is not readable');
                        }
                        break;
                    case event.target.error.ABORT_ERR:
                        break; // noop
                    default:
                        if (console) {
                            console.log('An error occurred reading this file.');
                        }
                }
            }

            reader.onerror = errorHandler;
            // adding fallback by finding the input, since we are using private variable here
            // in case of image uploadwithtext every file input can support only one attachment at a time
            reader.readAsDataURL(item._originalFile || $(e.target).find("." + _fileUploadWidgetInputClass_)[0].files[0]);

        });

        self.widget.on("fdCollectFileUrls", function (event) {
            //$(event.target).trigger("fdFileUpload");
            var obj = $(event.target).data("fileUploadObject");
            if (obj.fileUrl != null) {
                var imageFileUploadUrls = $container.data("imageFileUploadUrls");
                imageFileUploadUrls.push(obj.fileUrl);
                $container.data("imageFileUploadUrls", imageFileUploadUrls);
                $(event.target).closest(_ImageUploadWithTextContainer_).data("imageUrl", obj.fileUrl);
                $(event.target).closest(_ImageUploadWithTextContainer_).data("imageType", "fileUpload");
            }
        });

        // check if file url present
        if (self.widget.attr("data-url") != null) {
            var initialSetOfFiles =  $container.data("initialSetOfFiles") || [];
            initialSetOfFiles.push(self.widget.attr("data-url"));
            $container.data("initialSetOfFiles", initialSetOfFiles);
            var $imageContainer = self.widget.closest(_ImageUploadWithTextContainer_);
            // set the file URl and set it to preview
            self.fileUrl = self.widget.attr("data-url");
            _previewFile(imageUploadContainer.find(_IconSelector_), self.fileUrl);
            // updating the file url at container so that it is used during submission
            $imageContainer.data("imageUrl", self.fileUrl);
            $imageContainer.data("imageType", "fileUpload");
        }
    };

    function _checkForFileUploadAndInitialize($container) {
        var $arr = $container.find(_fileUploadWidgetWithTextClass_).length > 0
            ? $container.find(_fileUploadWidgetWithTextClass_)
            :  $container;
        $arr.each(function () {
            var $element = $(this);
            var widget = $element.find("coral-fileupload").eq(0),
                $parent = widget.closest(_ImageUploadWithTextWrapperClass_);

            if (widget && widget.data("fileUploadObject") == null) {
                var fileCount = $parent.data("fileCount"),
                    initialFileName = $parent.data("initialFileName");
                $parent.data("fileCount", ++fileCount);
                if (initialFileName == null) {
                    initialFileName = widget.attr("name");
                    $parent.data("initialFileName", initialFileName);
                }
                // filename would always have "-" prefix
                widget.attr("name", initialFileName + "-" + fileCount);
                var resourceURL = $element.parents("form.cq-dialog").attr("action");
                widget.data("fileUploadObject", new FileUploadField(widget, resourceURL));
            }
        });
    }

    function _checkForMultiFieldRemoveAndInitialize($container) {
        var $multiField = $container.closest(_ImageUploadWithTextWrapperClass_);
        $container.each(function () {
            var $element = $(this);
            var widget = $element.find(coralClassConstants.CORAL_MULTIFIELD_REMOVE).eq(0);
            if (widget && widget.data("initialized") == null) {
                widget.data("initialized", true);
                widget.on("click", function (event) {
                    var $content = $(event.target).closest(coralClassConstants.CORAL_BUTTON).siblings("coral-multifield-item-content"),
                        fileUrl = $content.find(_FileUploadSelector_).attr("data-url"),
                        initialSetOfFiles = $multiField.data("initialSetOfFiles") || [];
                    if (fileUrl != null) {
                        initialSetOfFiles.push(fileUrl);
                        $multiField.data("initialSetOfFiles", initialSetOfFiles);
                    }
                });
            }
        });
    }

    function _checkForTextFieldAndInitialize($container) {
        var $arr = $container.find(_fileUploadWidgetWithTextClass_).length > 0
                ? $container.find(_fileUploadWidgetWithTextClass_)
                :  $container,
            $parent = $container.closest(_ImageUploadWithTextWrapperClass_);
        $arr.each(function () {
            var $element = $(this);
            var widget = $element.find(".fdImageUploadTextField").eq(0);
            if (widget && widget.data("initialized") == null) {
                widget.data("initialized", true);
                widget.off("fdCollectText");
                widget.on("fdCollectText", function (event) {
                    var textFieldValues =  $parent.data("textFieldValues");
                    textFieldValues.push($(event.target).find("input").eq(0).val());
                    $parent.data("textFieldValues", textFieldValues);

                });
            }
        });
    }

    function _checkForAssetBrowserAndInitialize($container) {
        var $arr = $container.find(_fileUploadWidgetWithTextClass_).length > 0
            ? $container.find(_fileUploadWidgetWithTextClass_)
            :  $container;
        $arr.each(function () {
            var $element = $(this),
                widget = $element.find(_AssetBrowserSelector_).eq(0);
            if (widget && widget.data("initialized") == null) {
                widget.data("initialized", true);
                // initialize the asset browser here
                widget.find("[type='text']").on("change", function (e) {
                    var $imageUploadContainer = $(e.target).closest(_ImageUploadWithTextContainer_);
                    $imageUploadContainer.data("imageType", "assetBrowser");
                    var assetBrowserValue = $(e.target).val(),
                        externalizedXssFreeValue = CQ.shared.HTTP.externalize(CQ.shared.XSS.getXSSValue(assetBrowserValue));
                    $imageUploadContainer.data("imageUrl", externalizedXssFreeValue);
                    _previewFile($imageUploadContainer.find(_IconSelector_), externalizedXssFreeValue);
                });
            }

            // check if file url present
            if (widget.attr("data-url") != null) {
                // set the file URl and set it to preview
                var fileUrl = widget.attr("data-url"),
                    $imageContainer = widget.closest(_ImageUploadWithTextContainer_);
                _previewFile($imageContainer.find(_IconSelector_), fileUrl);
                // set the data attribute on widget
                $imageContainer.data("imageUrl", fileUrl);
                $imageContainer.data("imageType", "assetBrowser");
            }
        });
    }

    function _checkForImageUploadTextIconAndInitialize($container) {
        var $arr = $container.find(_fileUploadWidgetWithTextClass_).length > 0
                ? $container.find(_fileUploadWidgetWithTextClass_)
                :  $container,
            createPopOver = function ($child) {
                var $popover = $('<div class="fdImageUploadWithTextList"></div>'),
                    $iconButton = $child.closest(_IconSelector_),
                    $fileUploadButton = $iconButton.siblings(_FileUploadSelector_).removeClass("afHidden"),
                    $assetBrowserButton = $iconButton.siblings(_AssetBrowserSelector_).removeClass("afHidden"),
                    i = 0,
                    length = 2, // since there are two ways to upload a file
                    $actionItem = null,
                    // create the list
                    $actionList = $('<ul class="coral-List coral-List--minimal"></ul>');

                // create the action item
                $actionItem = $('<li class="coral-List-item"></li>').append($assetBrowserButton);
                $actionList.append($actionItem);
                // create the action item
                $actionItem = $('<li class="coral-List-item"></li>').append($fileUploadButton);
                $actionList.append($actionItem);

                //Append the action buttons into the popover
                $popover.append($actionList);
                return $popover;
            };
        $arr.each(function () {
            var $element = $(this),
                widget = $element.find(_IconSelector_).eq(0);
            if (widget && widget.data("initialized") == null) {
                widget.data("initialized", true);
                widget.on("click", function (e) {
                    var $popover = null,
                        $coralPopover = widget.data("popOver");
                    /** use the existing pop over on subsequent clicks **/
                    if ($coralPopover == null) {
                        $popover = createPopOver(widget);
                        $coralPopover = new CUI.Popover({
                            element : $popover.insertAfter(widget),
                            pointAt : widget
                        });
                        // done to initialize the asset browser structure
                        $popover.trigger('foundation-contentloaded');
                        widget.data("popOver", $coralPopover);
                    }
                    $coralPopover.show();
                });

            }
        });
    }

    /**
     * This functions submits the options to the multi field widget
     * at the specified content path
     * @private
     */
    function _submitOptionsToMultiField($component) {
        // get the name of property to which we have to store the current values
        var propertyName = $component.attr("data-granite-coral-multifield-name"),
            typeHintPropertyName = propertyName + "@TypeHint",
            fileReferencePropertyName = "fileReference@Delete",
            textFieldValues = $component.data("textFieldValues"),
            imageFileUploadUrls = $component.data("imageFileUploadUrls"),
            imageUrls = $component.data("imageUrls"),
            valueOfProperty = [],
            params = {};
        // generate options map saveValue=DisplayValue
        // if the file is uploaded then we store the relative path for that
        // starting with "." . Eg- "./file-1"
        _.each(textFieldValues, function (item, index) {
            if (item != null && imageUrls[index] != null) {
                var relPath = imageUrls[index];
                if (imageUrls[index].indexOf("/content/forms") === 0) {
                    relPath = "." + imageUrls[index].substr(imageUrls[index].lastIndexOf("/"));
                }
                valueOfProperty.push(item + "=" + relPath);
            }
        });
        params[propertyName] = valueOfProperty;
        // please note this cannot be avoided since the legacy code is pushing
        // entire content of form to server(fileReference is input type hidden and is always getting pushed to server
        // on form submit), hence this is done to delete the same, as we store it in options property as an array
        params[fileReferencePropertyName] = "deletedValue";
        params[typeHintPropertyName] = "String[]";
        params["_charset_"] = "utf-8";
        params[":replaceProperties"] = true;
        params[":replace"] = true;
        var $fileUploads = $component.find(_ImageUploadWithTextContainer_).filter(function () {
                return $(this).data("imageType") == "fileUpload";
            }).find(_FileUploadSelector_),
            updateProperty = function (params, contentPath) {// now persist this property in server in the given content path
                $.ajax({
                    url : Granite.HTTP.externalize(contentPath),
                    data : params,
                    type : "POST",
                    datatype : "json",
                    async : true
                }).done(function (data) {
                        // data submitted successfully
                        // refresh the editable since images and options are uploaded asynchronously
                        // this is done to reflect the changes in authoring
                        if (ns.author && ns.author.editables) {
                            var editPath = contentPath.replace("_jcr_content", "jcr:content");
                            // remove the context path, reason we ask HTML for the URL and that URL has context path
                            // Please note: for widget html is source of truth
                            editPath = Granite.HTTP.internalize(editPath);
                            ns.author.editables.find(editPath)[0].refresh();
                        }
                    });
            };
        // case: if there are file uploads from file system, upload them first and then
        // update the editable
        // if there are no files from file system and only from asset browser
        // then update the property and refresh the editable
        // when the execution comes here, all files are already uploaded
        if (imageFileUploadUrls.length > 0 || imageUrls.length > 0) {
            var  obj = $component.find("coral-fileupload").eq(0).data("fileUploadObject");
            updateProperty(params, obj.resourceURL);
        } else {
            // reset options property in case of complete deletion
            // if no files are present, delete any existing options present from server
            var propName = propertyName + "@Delete",
                param1 = {};
            param1[propName] = "deletedValue";
            param1[fileReferencePropertyName] = "deletedValue";
            updateProperty(param1);
        }
    }

    function _deleteNonExistingFilesFromServer(currentFiles, initialFiles) {
        var d = new $.Deferred();
        // check if initial set of files is non empty
        if (initialFiles.length > 0) {
            // get the difference of two arrays
            var filesToBeDeleted = _.difference(initialFiles, currentFiles),
                _deleteSingleFile = function (item) {
                    return $.ajax({
                        url  : Granite.HTTP.externalize(item),
                        data : {
                                ':operation' : 'delete'
                            },
                        type : "POST",
                        datatype : "json",
                        async : true
                    });
                },
                current = 0,
                totalToBeDeleted =  filesToBeDeleted.length,
                _deleteMultipleFile = function (index) {
                    if (index < totalToBeDeleted) {
                        _deleteSingleFile(filesToBeDeleted[index]).done(function () {
                            current++;
                            _deleteMultipleFile(current);
                        });
                    } else {
                        d.resolve();
                    }
                };

            _deleteMultipleFile(current);
        } else {
            d.resolve();
        }

        return d.promise();
    }

    function _collectFileUrls($container) {
        var imageUrls = $container.data("imageUrls") || [];
        // walk through asset browser and file upload and collect URL of file uploaded
        $container.find(_fileUploadWidgetWithTextClass_).each(function () {
            if ($(this).data("imageType") != null && $(this).data("imageUrl") != null) {
                // do not store context path on server, that can always change
                // internaize to get path without context path.
                imageUrls.push(Granite.HTTP.internalize($(this).data("imageUrl")));
            }
        });
        $container.data("imageUrls", imageUrls);
    }

    /**
     * Please note this is written for authoring to WYSIWYG.
     * The method if required should be changed later. Uploading multiple files together results in sling exception.
     * Hence ensuring that files are uploaded one by one
     * @type {*}
     */
    function _uploadSingleFile($elem) {
        var d = new $.Deferred(),
            that = $elem.get(0);
        // check if file has not been uploaded and if there is some file attached
        if ($elem.attr("data-url") == null && that.value != null && that.value.length  > 0) {
            $elem.off('coral-fileupload:load');
            // once file is uploaded, set the data-url attribute in the widget
            $elem.on('coral-fileupload:load', function (e) {
                var obj = $elem.data("fileUploadObject"),
                    fileUrl = obj.resourceURL + $(e.target).attr("name").substring(1);
                // since name of the file is of the form "./name", we remove the first dot
                // from the string before setting the file url
                $(e.target).attr("data-url", fileUrl);
                // since name of the file is of the form "./name", we remove the first dot
                // from the string before setting the file url
                obj.fileUrl = fileUrl;
                d.resolve();
            });
            // These parameters are for saving the image under a nt:file node.
            // If this parameter is not added to the request, then a nt:resource node is created for the image.
            var attrName = that.name + "@TypeHint",
                attrValue = "nt:file";
            that.parameters.push({name : attrName, value : attrValue});
            var fileName = that.value.replace(/^.*\\/, "");
            // todo: get the upload
            that.upload(fileName);
        } else {
            d.resolve();
        }
        return d.promise();
    }

    function _uploadAllFiles(event) {
        var d = new $.Deferred(),
            self = $(event.target),
            $arr = self.find("coral-fileupload"),
            count = $arr.length,
            current = 0,
            uploadCurrentFile = function (index) {
                if (index < count) {
                    _uploadSingleFile($arr.eq(index)).then(function () {
                        current++;
                        uploadCurrentFile(current);
                    });
                } else {
                    d.resolve();
                }
            };
        uploadCurrentFile(current);

        return d.promise();
    }

    function _postFileUploadOperations() {
        // here self is a jquery object
        var self = this,
            initialSetOfFiles = self.data("initialSetOfFiles"),
            imageFileUploadUrls = self.data("imageFileUploadUrls");
        self.find("coral-fileupload").trigger("fdCollectFileUrls");
        self.find(".fdImageUploadTextField").trigger("fdCollectText");
        // delete non existing files
        _deleteNonExistingFilesFromServer(imageFileUploadUrls, initialSetOfFiles).then(function () {
            // Once the files are uploaded, create property in content structure for current option
            // create option map [saveValue=ImagePath]
            _collectFileUrls(self);
            // Check the final list of file Urls
            _submitOptionsToMultiField(self);
        });

    }

    function _submitImageUploadWithText(event) {
        var self = $(event.target);
        // reset the state variables
        self.data("textFieldValues", []);
        self.data("imageFileUploadUrls", []);
        self.data("imageUrls", []);
        _uploadAllFiles.apply(this, [event]).then($.proxy(_postFileUploadOperations, self));

    }

    function _initializeComponentForSubmitProcess($container) {

        // only if not initialized for submit, we initialize it
        if ($container.data("initializedForSubmit") == null) {
            $container.data("initializedForSubmit", true);
            $container.on("fdSubmitProcessing", _submitImageUploadWithText);
        }
    }

    // when a dialog shows up, initialize the fileupload field
    $(document).on("foundation-contentloaded", function (event) {
        var $container = $(event.target);

        if ($container.hasClass("cq-dialog")) {
            // also, let's check for multi-field
            // this if for prefill scenario where data is already there on server
            var $coralMultiField = $(".imageUploadWithTextWrapperClass").find("coral-multifield");
            $coralMultiField.data("fileCount", 0);
            $coralMultiField.data("initialSetOfFiles", []);
            $container.find(_fileUploadWidgetWithTextClass_).each(function () {
                // in case of prefill, this code would hit
                _checkForFileUploadAndInitialize($(this));
                // Initialize the text field present inside image upload
                _checkForTextFieldAndInitialize($(this));
                // check for asset browser and initialize
                _checkForAssetBrowserAndInitialize($(this));
                // check for multi-field delete button and initialize
                _checkForMultiFieldRemoveAndInitialize($(this).closest("coral-multifield-item"));
                // check for icon and initialize, this should be done at last
                _checkForImageUploadTextIconAndInitialize($(this));
            });

            // added setTimeout to ensure that the html has been loaded before the function
            // gets called. "Change" event does not ensure whether the html has been loaded or not.
            $(".imageUploadWithTextWrapperClass").find("coral-multifield")
                .on("change", function (event) {
                    setTimeout(function () {
                        var self = $(event.target);
                        if (self.is("coral-multifield")) {
                            // Please Note: since we don't have itemadded event for multi-field
                            // While we add second item, this code ensures that the earlier field is not initialized
                            // check if there is file upload with text class present
                            _checkForFileUploadAndInitialize(self);
                            // Initialize the text field present inside image upload
                            _checkForTextFieldAndInitialize(self);
                            // check for asset browser and initialize
                            _checkForAssetBrowserAndInitialize(self);
                            // check for multi-field delete button and initialize
                            _checkForMultiFieldRemoveAndInitialize(self.find("coral-multifield-item"));
                            // check for icon and initialize, this should be done at last
                            _checkForImageUploadTextIconAndInitialize(self);

                        }
                    });
                });

            // initialize the composite field field containing image and text for post processing
            _initializeComponentForSubmitProcess($coralMultiField);
        }
    });

}(jQuery, _, Granite, jQuery(document), this, document));
