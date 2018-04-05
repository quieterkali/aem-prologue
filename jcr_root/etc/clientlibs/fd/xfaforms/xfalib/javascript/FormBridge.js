/*******************************************************************************
 * ADOBE CONFIDENTIAL
 *   ___________________
 *
 *    Copyright 2013 Adobe Systems Incorporated
 *    All Rights Reserved.
 *
 *   NOTICE:  All information contained herein is, and remains
 *   the property of Adobe Systems Incorporated and its suppliers,
 *   if any.  The intellectual and technical concepts contained
 *   herein are proprietary to Adobe Systems Incorporated and its
 *   suppliers and are protected by all applicable intellectual property
 *   laws, including trade secret and copyright laws.
 *   Dissemination of this information or reproduction of this material
 *   is strictly forbidden unless prior written permission is obtained
 *   from Adobe Systems Incorporated.
 ******************************************************************************/


;(function ($) {
    /*
     * Form Bridge API
     * The API provides a method for external applications to connect with Xfa and formDom. The APIs are divided into two categories, synchronous and asynchronous.
     *
     * All the APIs that are internal to us must go into FormBridgeInternal.js and not here
     *
     * Each Synchronous getter API returns a XFAResultObject which represents the result of the API whereas each setter API throws an exception in case of error and
     * it is the responsibility of the API to catch those exceptions. The XFAResultObject either contains error or the return value of the API and provides easy
     * mechanism to access each of them.
     *
     * Each Asynchronous API provides callback mechanism to return the result of the API. Each API takes a Javascript Object containing error, success Handlers and a
     * context in which to invoke those functions. The syntax of the object is
     * { error: errorHandlerFunc,
     *   success: successHandlerFunc,
     *   context: ObjectContext
     * }
     * The signature of the functions is
     * function(XFAResultObject) {
     *
     *  }
     * Each of the functions is passed a XFAResultObject containing either the data of the operation or the errors.
     *
     */

    Function.prototype.bind = Function.prototype.bind || function (ctx) {
        var that = this;
        return function () {
            that.call(ctx, arguments);
        }
    };

    /* public interface XFAResultObject
     public string[] message          // error messages
     public string[] somExpression    // somExpressions that caused the errors
     public string[] errorCode        // internal
     public bool errors               // whether the result object has errors or not
     public Object data               // data returned by the function

     public getNextMessage            // returns a message Object {code,somExpression,message} or null if no error message is present
     */
    var XFAResultObject = function() {
        var _message = [],
            _errorCode = [],
            _somExpression = [];
        this.errors = false;

        this.addMessage = function (code, msg, som) {
            this.errors = true;
            _message.push(msg);
            _somExpression.push(som);
            _errorCode.push(code);
        };

        this.getNextMessage = function () {
            if (_errorCode.length == 0)
                return null;
            return {
                code: _errorCode.pop(),
                somExpression: _somExpression.pop(),
                message: _message.pop()
            };
        };
    };

    var FORM_BRIDGE_VERSION = "6.0.44";
    var FormBridge = function () {
        this._xfa = null;
        this._version = FORM_BRIDGE_VERSION;
        this._xfaInitHandler = {};
        this._$target = null;
        this.isAnalyticsEnabled = false;
        $(window).bind("XfaInitialized", this._xfaInitialized.bind(this));
        $(window).bind("XfaInitializationError", this._xfaError);
        this._formDoc = window.document;
        this.userConfig = {};
        // indicates if ajax call is executed in client or server
        // note: this should not be modified in client
        this.ajaxCallMode = "client";
        this._PROFILE_RESOURCE_PATH = "/content/xfaforms/profiles/default";
    };

    /*
     * Default error handler for functions in case none is provided by the caller
     * TODO : make the string localized and call the xfa Logger
     */
    var defaultErrorHandler = function (obj) {
        if (typeof(console) == "undefined")
            return;
        var d = null;
        while (d = obj.getNextMessage())
            console.error(d.message);
    };

    var _isFirstTempStorageCreationPending = false,
        TEMP_STORAGE_PATH = "/tmp/fd/xfaforms";
    var createUUIDStorage  = function(uuid){
        if(!formBridge._isLoginAnonymous()) {
            var successFlag = true;
            $.ajax({
            url: formBridge._getPathUrl(".fd.tempstorageprovider.jsp"),
                type: "POST",
                async: false,
                data: {"uuidPath": TEMP_STORAGE_PATH + "/" + uuid},
                error : function (message) {
                    successFlag = false;
                }
            });
            return successFlag;
        }

    };

    /*
     * Default function to check Validations errors after getting the data from the
     * server with getDataXML call.
     */
    var defaultValidationChecker = function (validations, obj) {
        if (validations && validations.length > 0) {
            for (var i = 0; i < validations.length; i++)
                obj.addMessage(0, validations[i], "");
            return false;
        }
        return true;
    };

    $.extend(FormBridge.prototype, {
        /*
         * Returns whether Form Dom is initialized or not.
         */
        isConnected: function () {
            return !!this._xfa;
        },
        /*
         * @public
         * Specify a function to execute after making a connection with FormBridge
         * handler: handler to execute
         * context: variable 'this' will refer to context in the handler.
         */
        connect: function (handler, context) {
            context = context || formBridge;
            if (this.isConnected())
                handler.call(context);
            else {
                this._xfaInitHandler.handler = this._xfaInitHandler.handler || [];
                this._xfaInitHandler.handler.push(handler);
                this._xfaInitHandler.context = this._xfaInitHandler.context || [];
                this._xfaInitHandler.context.push(context);
            }
        },
        /*
         * @private
         * Handler for XfaInitialized event which is fired by XFA library after Form Dom is initialized
         */
        _xfaInitialized: function (e) {
            this._xfa = xfalib.runtime.xfa;
            var obj = new XFAResultObject();
            if (this.storage) {
                if (this.storage.formState) {
                    this._xfa.host.playJson(JSON.parse(this.storage.formState.xfaDom));
                    this.storage.success.call(this.storage.context);
                    this.storage = null;
                } else if (this.storage.success) {
                    this.storage.success.call(this.storage.context);
                }
                if (this.xmlStorage && this.xmlStorage.xmlDocument) {
                    try {
                        this._xfa.Logger.debug("xfa", "Restoring Data XML after initiailzation");
                        this._xfa.host.playDataXml(this.xmlStorage.xmlDocument);
                        if(this.xmlStorage.success) {
                            this.xmlStorage.success.call(this.xmlStorage.context, obj);
                        }
                    } catch(e) {
                        if(this.xmlStorage.error) {
                            obj.addMessage(2, "Unexpected Exception: Unable to play Data XML " + e, null);
                            this.xmlStorage.error.call(this.xmlStorage.context, obj);
                        }
                    }
                } else if (this.xmlStorage && this.xmlStorage.success) {
                    this.xmlStorage.success.call(this.xmlStorage.context, obj);
                }
                this.xmlStorage = null;
            }
            if (this._xfaInitHandler.handler) {
                for (var i = 0; i < this._xfaInitHandler.handler.length; i++) {
                    this._xfaInitHandler.handler[i].call(this._xfaInitHandler.context[i]);
                }
                this._xfaInitHandler = {};
            }
        },

        /*
         * @public
         * Specify a function to decide whether the analytics will be enabled or disabled
         * public Boolean isAnalyticsEnabled: this argument determines whether the analytics will be enabled or not
         */
        enableAnalytics: function(state){
            this.isAnalyticsEnabled = state;
        },

        _xfaError: function (e) {
            this._xfa = window.xfa;
            var obj = new XFAResultObject();
            // since there is xfa init error, why should we call playJson
            if (this.storage.formState) {
                this._xfa.host.playJson(JSON.parse(this.storage.formState.xfaDom));
                this.storage = null;
            } else {
                if (this.storage.error)
                    this.storage.error.call(this.storage.context, e.message);
            }
            if (this.xmlStorage.error) {
                obj.addMessage(2, e.message, null);
                this.xmlStorage.error.call(this.xmlStorage.context, obj);
            }
        },

        _getResultObject: function() {
            return new XFAResultObject();
        },

        _checkXfa: function (obj) {
            if (!this._xfa) {
                obj.addMessage(1, "Xfa Dom not Initialized", "");
                return false;
            }
            return true;
        },
        /*
         * returns the version of library
         */
        getBridgeVersion: function () {
            return this._version;
        },

        /*
         * Registers user/portal specific configurations to FormBridge.
         * Currently supported configurations are:
         * {widgetConfig : {selector: jqWidgetName}}
         * {pagingConfig : {pagingEnabled: true}}
         * {LoggerConfig : {{"on":"true", "category":"xfa", "level":"5", "type":"console"}}
         * {postExternalMessageConfig : {postExternalHandler: fn}}
         * {contextPath : contextPath}
         * {viewportWidth : <1000>}
         * e.g.: formBridge.registerConfig("widgetConfig", {".imagefield" : "sigImageField"});
         *
         * returns a XFAResultObject. Old config against same key is stored in obj.data[0]
         */
        registerConfig: function (key, config) {
            var obj = new XFAResultObject();
            obj.data = this.userConfig[key];
            this.userConfig[key] = config;
            obj.completed = true;
            return obj;
        },


        /*
         * Returns the pagingManager handle for the current xfa view.
         * Should be called after FormBridge is in connected mode else paginManager handle would be null
         */
        pagingManager: function () {
            if (this._xfa && this._xfa.host)
                return this._xfa.host.pagingManager;
            else
                return null;
        },

        /*
         * hide the fields whose som is provided in the fieldArray
         * fieldArray: array of somExpressions
         */
        hideFields: function (fieldArray) {
            this.setFieldProperties(fieldArray, "presence", "invisible");
        },
        /*
         * Make the fields, whose som is provided in the fieldArray, visible
         * fieldArray: array of somExpressions
         */
        showFields: function (fieldArray) {
            this.setFieldProperties(fieldArray, "presence", "visible");
        },
        /*
         * set the value of the field. Throws an exception if the somExpression is incorrect
         * field: somExpressions of the field
         */
        setFieldValue: function (field, value) {
            this.setFieldProperties(field, "rawValue", value);
        },
        /*
         * get the value of the fields, whose som is provided in the fieldArray
         * fieldArray: array of somExpressions
         *
         * returns a XFAResultObject. The result is stored in obj.data[0]
         */
        getFieldValue: function (field) {
            return this.getFieldProperties(field, "rawValue");
        },
        /*
         * set the property of the fields, whose som is provided in the fieldArray, with the values provided
         * fieldArray: array of somExpressions
         * prop: property to set
         * values: array of values.
         */
        setFieldProperties: function (fieldArray, prop, values) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                throw obj.getNextMessage().message;

            if (!_.isArray(fieldArray)) {
                fieldArray = [fieldArray];
            }

            if (!_.isArray(values)){
                values = [values];
            }

            for (var i = 0; i < fieldArray.length; i++) {
                var field = this._xfa.resolveNode(fieldArray[i]);
                if (field == null)
                    throw "No field " + fieldArray[i] + " exists"
                else {
                    obj.completed = true;
                    field[prop] = values[i] || values[0];
                }
            }
            // change made to re-evaluate floating field text in draw
            if(prop && prop === "rawValue" && this._xfa.moContextNodes.length == 0) {
                this._xfa.runCalcAndValidate();
            }
        },
        /*
         * get the property value of the fields, whose som is provided in the fieldArray
         * fieldArray: array of somExpressions
         * prop: property to get
         *
         * returns a XFAResultObject whose data member is the array of returned values. If a
         * somExpression provided doesn't exists null is returned for that element in the data
         */
        getFieldProperties: function (fieldArray, prop) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                return obj;

            if (!_.isArray(fieldArray)) {
                fieldArray = [fieldArray];
            }

            obj.data = [];
            for (var i = 0; i < fieldArray.length; i++) {
                var field = this._xfa.resolveNode(fieldArray[i]);
                if (field == null) {
                    obj.addMessage(0, "No field " + fieldArray[i] + " exists", fieldArray[i])
                    obj.data.push(null);
                }
                else {
                    obj.completed = true;
                    obj.data.push(field[prop]);
                }
            }
            return obj;
        },
        hideSubmitButtons: function () {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                throw obj.getNextMessage().message;
            this._xfa._hideSubmitButtons();
        },
        _getPathUrl: function (urlSuffix) {
            var url = this._PROFILE_RESOURCE_PATH + (urlSuffix || "");
            return this._getUrl(url);
        },

        _getFileWidgetIfPresent: function () {
            return xfalib.runtime.fileUploadWidget;

        },
        _getFileListFromFileWidget:  function () {
            var fileWidget = this._getFileWidgetIfPresent();
            if(fileWidget) {
                return fileWidget._getFileList();
            }
            return null;
        },
        _getCommitValueFromFileWidget: function () {
            var fileWidget = this._getFileWidgetIfPresent();
            if(fileWidget) {
                return fileWidget.getCommitValue();
            }
            return null;
        },

        /**
         *
         * @param optimize{boolean} flag to turn optimization on; if false, entire jsonModel is returned,
         * else diff of initial and current model returned.
         * @param optimize_level{0,1 or 2} : determines the aggressiveness level of size optimizations used
         *  0: returns all properties which changed between initial and current model.
         *  1: jsonModelDiff with access & presence, must be repayable via playJson on calling restoreFormState. but to keep diff sz to min.
         *      remove unplayed items from the diff. Also to maintain hierarchy must have all instance managers, and unbinded fields.
         *  2: minimal jsonModelDiff with only hierarchy skeleton and class, name and 'value's preserved for transfer during submit.
         *
         * @returns {XFAResultObject}
         * returns the string representation of the XFA Form DOM and includes all the XFA packets
         * returns a XFAResultObject whose 'data' member is the formState
         */
        getFormState: function (optimize, optimize_level) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj)) {
                return obj;
            }
            var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);
            //To maintain backward compatibility
            if (behaviorConfig.isOn('disableLeanSubmit') || behaviorConfig.isOn('mfDisableLeanSubmit')) {
                optimize_level = 0;
            }
            var xfaDom = optimize === true ? this._xfa._computeJsonDiff(optimize_level).jsonDifference
                                           : this._xfa.jsonModel;

            xfaDom.isComplete = !optimize;

            //add the information required from DOM during submit in the form state
            var formAttributesData = {},
                formElement = $("#lcforms_xfaform_container")[0];
            if(formElement){
                _.each(formElement.attributes,function(attrib){
                    formAttributesData[attrib.name] = attrib.value;
                });
            }

            var additionalSubmitInformation = {
                "formAttributesData": formAttributesData,
                "userConfig": formBridge.userConfig
            };

            var xfaDomString = JSON.stringify(xfaDom);
            obj.data = {
                xfaDom: xfaDomString,
                //save renderContext in form state to enable deferred submit even if form is not open
                renderContext: xfalib.runtime.renderContext,
                customPropertyMap: xfalib.runtime.customPropertyMap,
                additionalSubmitInformation: additionalSubmitInformation
            };
            return obj;
        },
        /*
         * sets the field on focus whose somExpression is provided
         *
         * throws an exception in case of error.
         */
        setFocus: function (som) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                throw obj.getNextMessage().message;
            var node = this._xfa.resolveNode(som);
            if (node == null) {
                throw "No field " + som + " exists ";
            }
            else {
                this._xfa.host._setFocus(som);
            }
        },

        /*
         *  Helper function to ger submit service proxy url
         */
        _getSubmitServiceProxyUrl: function () {
            var submitServiceProxyConfig = this.userConfig["submitServiceProxyConfig"],
                submitServiceProxyUrl = "",
                contextPath = this.userConfig["contextPath"];
            if (submitServiceProxyConfig && submitServiceProxyConfig["submitServiceProxy"]) {
                submitServiceProxyUrl += submitServiceProxyConfig["submitServiceProxy"];
            }
            else {
                //finally hard code it
                submitServiceProxyUrl += ((contextPath && contextPath !== "/") ? contextPath : "") + "/content/xfaforms/profiles/default.submit.html";
            }
            return submitServiceProxyUrl;
        },

        /*
         * remote invocation ----
         * This method post form dom to LCFormsService and run the success handlers
         * It accepts the object with following params:
         * {
         *  url: '',
         *  type: '',
         *  contentType: '',
         *  data: '',
         *  success: '',
         *  error: ''
         *  }
         *  The called can choose to override one of more parameters of $.ajax API of JQuery
         */

        _invokeAtServer: function (options) {
            options = options || {};
            var submitServiceProxyUrl = this._getSubmitServiceProxyUrl(),
                isServerAjaxCallMode = this.ajaxCallMode === "server";

            if (options.data && !options.data["_charset_"]) {
                options.data["_charset_"] = "UTF-8"; //to let sling know data encoding
            }

            if(isServerAjaxCallMode){
                var mergedFormDom = "";
                // Done to fix: LC-9204
                // Not invoking HTTP request instead making use of server session
                try {
                    mergedFormDom = getMergedFormDomFromRhino(options.data);
                } catch(exception){
                    xfalib.runtime.xfa.Logger.error("xfa", exception.message);
                }
                // If success handler is present, invoke it, context is provided by the caller
                if(_.isFunction(options.success) && mergedFormDom) {
                    options.success(JSON.parse(mergedFormDom));
                }
            } else {
                var strContent = this.getMultipartData(options.data);  // TODO : maybe use the browser's FormData object, and handle IE as we are doing now
                options.data = strContent[1];
                var params = _.extend({
                        beforeSend: formBridge.uiFreeze,
                        complete: formBridge.uiUnFreeze,
                        async: false,
                        url: submitServiceProxyUrl,
                        type: 'POST',
                        processData: false,
                        cache: false,
                        contentType: "multipart/form-data; charset=UTF-8; boundary=" + strContent[0]
                    },
                    options);

                $.ajax(params);
            }
        },

        /**
         *
         * This function does following:
         * a) On first call, it creates the uuid storage and returns the UUID
         * b) On subsequent calls, it just returns the uuid
         * c) if uuid is not created then it returns null
         *
         */
        _getUUID: function () {
            if(this._formInstanceUUID) {
                return this._formInstanceUUID;
            }
            //Generate the UUID for the form instance on client side
            var uuid = $('body#formBody').data("tmproot"),
                uuidSuffix = Math.floor((Math.random() * 10000) + 1),
                uuidCurrentTime = new Date().getTime(),
                successFlag = true;
            this._formInstanceUUID = uuid + "_" + uuidCurrentTime + uuidSuffix;
            successFlag = createUUIDStorage(this._formInstanceUUID);
            if(successFlag){
                return this._formInstanceUUID;
            } else {
                return null;
            }
        },
        _getUrl: function (url) {
            //url provided can contain the hostname and port too, in that case return the url as it is
            if (url.indexOf("http:") == 0 || url.indexOf("https:") == 0) {
                return url;
            }
            var baseUrl = this.userConfig["baseUrl"],
                contextPath = this.userConfig["contextPath"];
            if (baseUrl) {
                return baseUrl + url;
            }
            else if (contextPath && contextPath!== "/" && url.indexOf(contextPath)!== 0 &&(url.length ===0 || url.indexOf("/") === 0)){
                //if url does not have contextPath and starts with /, pre-pend contextPath
                // Also url.length check because I need to pass "" to getUrl and get context path
                return contextPath + url;
            }
            return url;
        },
        getFileAttachmentsInfo: function (options) {
            var fileAttachmentsList = [],
                list;


            function collectFileUrls(event) {
                list = [];
                //TODO: need to modularize collectFileUrs()
                // here this is the context of the function who calls it
                _.each(this.attachments, function (att) {
                    //this.fileUrl is null when no file is uploaded. att contains path - "fileupload/™a.jpg" if not uploaded
                    // if att starts with "/", this means that the attachment has already been uploaded.
                    if(!_.isEmpty(this.fileUrl) && att.indexOf("/")!=0 ) {
                        list.push({name: att.split("/")[1], path: this.fileUrl + "/" + att});
                    } else {
                        list.push({name: att.substring(att.lastIndexOf("/")+1), path: att});
                    }
                }, this);
                if (this.options.success) {
                    this.options.success.call(this.options.context, list);
                }
            }

            this._getAttachments(fileAttachmentsList, options.fileUploadPath || this.getTempPath(), collectFileUrls, options);

        },

        _getAttachments: function (fileAttachmentDomElement, fileUploadPath, callback, options) {

            var allFiles = [],
                attachments = [],
                fileUrl = null,
                fileCount = 0,
                didSubmit = false,
                contextRoot = this._getContextRoot(),
                FILE_COMPONENT_NAME = "fileupload";

            /*
             * In the case of draft, url comes with context root. Need to remove it so that correct value gets stored in model
             */
            if (contextRoot) {
                if (fileUploadPath.indexOf(contextRoot) === 0) {
                    fileUploadPath = fileUploadPath.substring(contextRoot.length);
                }
            }

            var currentCount = 0;
            var fileNameList = formBridge._getCommitValueFromFileWidget();

            if (fileNameList.length > 0) {
                var fileNames = fileNameList;
                var fileList = $.extend(true, [], formBridge._getFileListFromFileWidget());
                _.each(fileList, function (file, index) {
                    var nameOfFile = fileNames[index],
                        completeNameOfFile = null;
                    if (nameOfFile != null && file != null) { //file can be null when you click save two times continuously without change in guide context
                        completeNameOfFile = FILE_COMPONENT_NAME + "/" + nameOfFile;
                        // case: if there is a file dome
                        if (!_.isString(file)) {
                            // Check if the value exist in the file, this is done because in IE9 and IE10 the list will
                            // have an extra empty dom
                            if ($(file).val().length > 0) {
                                $(file).attr('name', completeNameOfFile);
                                attachments[fileCount] = completeNameOfFile;
                                allFiles[fileCount++] = $(file);
                            }
                        } else {
                            // since there is no file dom in case of draft usecase, make it null
                            attachments[fileCount] = file;
                            allFiles[fileCount++] = null;
                        }
                    }
                }, this);


                if (allFiles.length > 0) {

                    // since there can be a dom element which is null, in case of draft usecase
                    // get the first non null file dom
                    var firstNonNullFileDom = _.indexOf(allFiles, _.find(allFiles, function (item) {
                        return item !== null;
                    }));
                    var uploaderPluginName = formBridge.userConfig.uploaderPluginName || "adobeFileUploader";
                    if (firstNonNullFileDom !== -1) {
                        fileUrl = allFiles[firstNonNullFileDom][uploaderPluginName]("uploadFile", {
                            'fileName': attachments,
                            'fileDom': allFiles,
                            'fileUploadPath': fileUploadPath,
                            'multiple': true,
                            '_uuidGenerator': function () { return formBridge._getUUID.apply(this); },
                            _getUrl: formBridge._getUrl("")
                        });

                        /*The file url returned by file upload widget can contain context root. Remove it so that correct value gets stored in model.*/
                        if (contextRoot) {
                            if (fileUrl.indexOf(contextRoot) === 0) {
                                fileUrl = fileUrl.substring(contextRoot.length);
                            }
                        }

                        allFiles[firstNonNullFileDom].one("adobeFileUploader.multipleFileUploaded", $.proxy(callback,
                            {
                                "attachments": attachments,
                                "fileUrl": fileUrl,
                                "options": options,
                                "_uuidGenerator": function () { return formBridge._getUUID.apply(this); }
                            })
                        );
                        didSubmit = true;
                    }
                }

            }

            if (!didSubmit) {
                // if there are no files attached, still call the callback to submit the json contents
                // if there is only one file attachment component with no files, in this case else is important
                callback.apply({
                    "attachments": attachments,
                    "fileUrl": fileUrl,
                    "options": options
                });

            }

        },
        _isFileAttachmentEnabled: function () {
            return xfalib.runtime.renderContext.mfAllowAttachments === 'true';
        },
        _isLoginAnonymous: function (value) {
            var flag;
                if(xfalib.runtime) {
                    flag = xfalib.runtime._isAnonymous;
                    if(_.isUndefined(value)) {
                        return flag;
                    }
                    xfalib.runtime._isAnonymous = value;
                    return flag;
                }
        },

        _getContextRoot: function() {
            return this.userConfig["contextPath"];
        },

        getTempPath: function() {
            return "/tmp/fd/xfaforms/" + this._getUUID();
        },
        _getFileNamePathMap: function(valueList) {
            var fileWidget = this._getFileWidgetIfPresent();
            if(fileWidget) {
                return fileWidget._getFileNamePathMap(valueList);
            }
            return {};
        },






        getMultipartData: function (data) {
            //Start multipart formatting
            var initBoundary = this.randomString();
            var strBoundary = "--" + initBoundary;
            var strMultipartBody = "";
            var strCRLF = "\r\n";

            //Create multipart for each element of the form
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var value = typeof data[key] == "string" ? data[key] : JSON.stringify(data[key]);
                    strMultipartBody +=
                        strBoundary
                        + strCRLF
                        + "Content-Disposition: form-data; name=\"" + key + "\""
                        + strCRLF
                        + strCRLF
                        + value
                        + strCRLF;
                }
            }
            //End the body by delimiting it
            strMultipartBody += strBoundary + "--" + strCRLF;
            //Return boundary without -- and the multipart content
            return [initBoundary, strMultipartBody];
        },

        randomString: function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomString = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomString += chars.substring(rnum, rnum + 1);
            }
            return randomString;
        },

        /*
         * returns the input data in XML Form. The call is asynchronous and recieves the following options apart from the default
         * ones provided earlier
         *      validationChecker //function to call for checking validation errors received from server
         *                          The signature for the functions is
         *                              function(validations)
         *                              {
         *                                  // validations is an array of error strings.
         *                              }
         *      formState       // The state of the XFA Form, if saved by the user, otherwise the current one
         */
        getDataXML: function (options) {
            options = options || {};
            var obj = new XFAResultObject();
            if (!options.formState && !this._checkXfa(obj)) {
                options.error.call(options.context, obj);
                return;
            }
            if(!options.formState && xfalib.ut.XfaUtil.prototype.getOrElse(xfalib.runtime, "customPropertyMap.xmlOnClient", "0") === "1") {
                try {
                    var xml = this.generateDataXML();
                    obj.data = xml;
                    if (options.success) {
                        options.success.call(options.context, obj);
                    }
                } catch(exception) {
                    var msg = "Unable to generate xml on client. Use Server option to generate the xml. " + exception;
                    this._xfa.Logger.error("xfa", msg);
                    obj.completed = false;
                    obj.addMessage(2, msg, "");
                    if(options.error) {
                        options.error.apply(options.context, [obj]);
                    }
                }
                return;
            }
            var formState = options.formState || this.getFormState(true, 2).data;
            //clone the object to avoid polluting the old copy
            var params = _.extend({formDom: formState.xfaDom, requestDataXml : "true"}, formState.renderContext);
            this._invokeAtServer({
                data: params,
                dataType: 'text',
                success: function (result) {
                    obj.completed = true;
                    if (!result) {
                        obj.addMessage(0, "There was an error in getting data xml", "");
                        options.error.call(options.context, obj);
                        return;
                    }
                    obj.data = result;
                    if (options.validationChecker) {
                        if (!options.validationChecker.call(options.context, result.validationErrors)) {
                            options.error.call(options.context, obj);
                            return;
                        }
                    }
                    if (options.success)
                        options.success.call(options.context, obj,formState);
                },
                error: function (xhr, txtStatus, errorThrown) {
                    var msg = formBridge._getDataXMLError(xhr, txtStatus, errorThrown);
                    obj.completed = false;
                    obj.addMessage(2, msg, "");
                    if (options.error) {
                        options.error.call(options.context, obj);
                    }
                    if (formBridge._xfa) {
                        formBridge._xfa.host.messageBox(msg);
                    }
                }
            });
        },

        _getDataXMLError: function (xhr, txtStatus, errorThrown) {
            var msg;
            switch (xhr.status) {
                case 0:
                    msg = xfalib.locale.LogMessages["ALC-FRM-901-008"];
                    if(this._xfa) {
                        this._xfa.Logger.error("xfa", msg + " " + xhr.statusText);
                    }
                    break;
                default:
                    msg = xfalib.locale.LogMessages["ALC-FRM-901-016"];
                    if(this._xfa) {
                        this._xfa.Logger.error("xfa", msg + " " + xhr.statusText);
                    }
                    break;
            }
            return msg;

        },

        _identifyConnectionError: function (xhr, txtStatus) {
            var msg = "";
            switch (xhr.status) {
                case 0:
                    msg = xfalib.locale.LogMessages["ALC-FRM-901-008"];
                    if(this._xfa) {
                        this._xfa.Logger.error("xfa", msg + " " + xhr.statusText);
                    }
                    break;
                case 404:
                    msg = xfalib.locale.LogMessages["ALC-FRM-901-008"];
                    if(this._xfa) {
                        this._xfa.Logger.error("xfa", msg + " " + xhr.statusText);
                    }
                    break;
            }
            return msg;


        },

        _getAllowAttachmentsFromFormState: function (formState) {
            return formState.renderContext.mfAllowAttachments === 'true';
        },

        /**
         * @public
         * This performs an ajax submit to a url.
         * This API creates a form data object and submits this object.
         * @param options
         */
        doAjaxSubmit: function(options){

            if(window.FormData){

                var psuedoForm = $("<form>"),
                    formState = options.formState || this.getFormState(true, 2).data,
                    submitServiceProxyConfig = formState.additionalSubmitInformation.userConfig["submitServiceProxyConfig"],
                    action = options.action || this._getSubmitServiceProxyUrl();

                _.each(formState.additionalSubmitInformation.formAttributesData, function (value, key) {
                    psuedoForm.attr(key, value);
                }, this);

                psuedoForm.attr("action", action);
                var $charSetField = $("<input>").attr({"type": "hidden", "name": "_charset_", "value": "UTF-8"});
                $(psuedoForm).append($charSetField);

                _.each(submitServiceProxyConfig, function (fieldValue, fieldName) {
                    var newField = $("<input>").attr("type", "hidden")
                        .attr("name", fieldName)
                        .val(fieldValue);
                    $(psuedoForm).append($(newField));
                });

                //clone the object to avoid polluting the old copy
                var params = _.extend({}, formState.customPropertyMap, {formDom: formState.xfaDom}, formState.renderContext);

                for (var param in params) {
                    if (params.hasOwnProperty(param)) {
                        newField = $("<input>").attr("type", "hidden")
                            .attr("name", param)
                            .val(params[param]);

                        $(psuedoForm).append($(newField));
                    }
                }

                var fileAttachmentEnabled = formBridge._getAllowAttachmentsFromFormState(formState);
                if (fileAttachmentEnabled) {
                    if (options.fileAttachmentMap) {
                        var fileAttachmentMapInput = $("<input>").attr("type", "hidden")
                            .attr("name", "fileAttachmentMap")
                            .val(JSON.stringify(options.fileAttachmentMap));
                        $(psuedoForm).append($(fileAttachmentMapInput));
                    } else {
                        var fileAttachmentMap = formBridge._getFileNamePathMap(),
                            fileAttachmentInputs = formBridge._getFileListFromFileWidget(),
                            fileAttachmentMapInput;

                        _.each(formBridge._getCommitValueFromFileWidget(), function (nameOfFile, index) {
                            if (_.isObject(fileAttachmentInputs[index]) && _.isString(nameOfFile) && !nameOfFile.match(/\//g)) {
                                fileAttachmentInputs[index].attr("name", nameOfFile);
                                if (!fileAttachmentMap[nameOfFile]) {
                                    fileAttachmentMap[nameOfFile] = "";
                                    $(psuedoForm).append(fileAttachmentInputs[index]);
                                }
                            }
                        });
                        fileAttachmentMapInput = $("<input>").attr("type", "hidden")
                            .attr("name", "fileAttachmentMap")
                            .val(JSON.stringify(fileAttachmentMap));
                        $(psuedoForm).append($(fileAttachmentMapInput));
                    }
                }
                //the XFAResultObject that will be passed to the success and error handler
                var obj = new XFAResultObject();

                var fd = new FormData(psuedoForm[0]);
                //set contentType to false to prevent jquery from setting it to default value
                //Setting processData to false to prevent jQuery from automatically transforming the data into a query string
                // set dataType to "text" to retrieve the xml as string.
                // The ajax call returns dataXml that is passed inside XFAResultObject.
                $.ajax({
                    url: formBridge._getUrl(action),
                    data: fd,
                    processData: false,
                    dataType:'text',
                    contentType: false,
                    type: 'POST',
                    success: function (result) {
                        obj.completed = true;
                        if (!result) {
                            obj.addMessage(0, "There was an error in submitting the form", "");
                            options.error.call(options.context, obj);
                            return;
                        }
                        obj.data = result;
                        if (options.validationChecker) {
                            if (!options.validationChecker.call(options.context, result.validationErrors)) {
                                options.error.call(options.context, obj);
                                return;
                            }
                        }
                        if (options.success) {
                            options.success.call(options.context, obj);
                        }
                    },
                    error: function (xhr, txtStatus, errorThrown) {
                        var msg = formBridge._getDataXMLError(xhr, txtStatus, errorThrown);
                        obj.completed = false;
                        obj.addMessage(2, msg, "");
                        if (options.error) {
                            options.error.call(options.context, obj);
                        }
                        if (formBridge._xfa) {
                            formBridge._xfa.host.messageBox(msg);
                        }
                    }
                });

            } else {
                options.error.call(options.context);
            }
        },

        /*
         * submits the form data to a url provided in Config or Form Template
         * The API calls getDataXML, checks validation errors and either submits the data itself
         * or passes the data to the success handler provided by the caller
         *
         */
        submitForm: function (options) {
            options = options || {};
			options.error = options.error || defaultErrorHandler;
            options.context = options.context || formBridge;
            options.validationChecker = options.validationChecker || defaultValidationChecker;
            //formBridge.keyValuePairSubmission = true;

            this.uiFreeze();   // Bug: LC-6068 To show cursor in wait state and also freezing the ui by marking root subform access as readOnly.
            var originalSuccess = options.success;
            var originalError = options.error || defaultErrorHandler;
            var originalContext = options.context;
            var that = this;

            options.error = (function () {
                return function () {
                    that.uiUnFreeze();  // Bug: LC-6068 To restore cursor from wait state and also restoring the ui by marking root subform access as its old access.
                    if (originalError) {
                        originalError.apply(originalContext, arguments);
                    }
                };
            })();
            var obj = new XFAResultObject();

            if (this._xfa && this._xfa.host._validate() == false) {
                obj.addMessage(0, "client side validations failed", "xfa"); //TODO: handlesomExpression passing
                options.error.call(options.context, obj);
                return;
            } else {
                xfalib.ut.XfaUtil.prototype._triggerOnBridge("submitStart", this, "submit");
            }
            if (options.success /*|| formBridge.keyValuePairSubmission*/) {
                /*var defaultSuccessHandler = function(obj) {
                 var formState = options.formState || this.getFormState().data;
                 //clone the object to avoid polluting the old copy
                 var params = _.extend({formDom: formState.xfaDom}, formState.renderContext);

                 for(var p in params) {
                 var field = $("<input>").attr("type", "hidden").attr("name",p).val(params[p]);
                 $("#lcforms_xfaform_container").append($(field));
                 }
                 var dataField = $("<input>").attr("type", "hidden").attr("name","data").val(obj.data);
                 $("#lcforms_xfaform_container").append($(dataField));

                 var submitServiceProxyConfig = this.userConfig["submitServiceProxyConfig"];
                 var submitUrl = options.action || submitServiceProxyConfig.submitUrl;
                 $("#lcforms_xfaform_container").attr("action", submitUrl);
                 $("#lcforms_xfaform_container").submit();
                 }
                 options.success = options.success || defaultSuccessHandler*/
                //Submit from form bridge api

                options.success = (function () {
                    return function () {
                        that.uiUnFreeze();  // Bug: LC-6068 To restore cursor from wait state and also restoring the ui by marking root subform access as its old access.
                        if (originalSuccess) {
                            originalSuccess.apply(originalContext, arguments);
                        }
                    };

                })();
                formBridge.doAjaxSubmit(options);
            }
            else {
                //Always submit form state to submitServiceProxy and then the proxy will in-turn submit the data xml to the submitUrl on behalf of MobileForm
                //create a psuedo form element and do submission
                var cont = true;
                var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);
                //To maintain backward compatibility
                if (!behaviorConfig.isOn('disableHeadRequest') && !behaviorConfig.isOn('mfDisableHeadRequest')) {
                    $.ajax({
                        async: false,
                        url: this._getSubmitServiceProxyUrl(),
                        type: 'HEAD',
                        complete: function (xhr, txtStatus) {
                            var msg = formBridge._identifyConnectionError(xhr, txtStatus);
                            if (msg) {
                                obj.completed = false;
                                obj.addMessage(2, msg, "");
                                if (options.error) {
                                    options.error.call(options.context, obj);
                                }
                                if (formBridge._xfa) {
                                    formBridge._xfa.host.messageBox(msg);
                                }
                                cont = false
                            }
                        }
                    });
                }

                if (cont) {
                    var action = this._getSubmitServiceProxyUrl();

                    var submitServiceProxyConfig = this.userConfig["submitServiceProxyConfig"];
                    var version = new xfalib.ut.Version(this.userConfig["behaviorConfig"]);

                    //use two step submission if we are dealing with older profiles
                    var useTwoStepSubmission = !(submitServiceProxyConfig);

                    if (version.isPreviousOrSame(version.ES4))
                        useTwoStepSubmission = true;

                    //for backward compatibility --- to ensure we keep on supporting ES4 profiles
                    if (useTwoStepSubmission) {
                        //this means ES4 or old profiles
                        action = options.action || $("#lcforms_xfaform_container").attr("action") || action;
                    }

                    var psuedoForm = $("<form>");

                    var formState = options.formState || this.getFormState(true, 2).data;

                    //add the additionalInformation
                    _.each(formState.additionalSubmitInformation.formAttributesData,function(value,key){
                        psuedoForm.attr(key, value);
                    },this);

                    //override action
                    psuedoForm.attr("action", action);

                    //Add _charset_ to let sling know that it should decode in UTF-8
                    var $charSetField = $("<input>").attr("type", "hidden").attr("name", "_charset_").val("UTF-8");
                    $(psuedoForm).append($charSetField);

                    behaviorConfig = this.userConfig["behaviorConfig"];

                    if (!useTwoStepSubmission) {
                        //add supporting fields to psuedo form
                        submitServiceProxyConfig.submitUrl = options.action || submitServiceProxyConfig.submitUrl;
                        for (var fieldName in submitServiceProxyConfig) {
                            if (submitServiceProxyConfig[fieldName]) {
                                var newField = $("<input>").attr("type", "hidden")
                                    .attr("name", fieldName)
                                    .val(submitServiceProxyConfig[fieldName]);

                                $(psuedoForm).append($(newField));
                            }
                        }
                        var fileAttachmentEnabled = formBridge._isFileAttachmentEnabled();
                        if (!fileAttachmentEnabled) {

                            //clone the object to avoid polluting the old copy
                            var params = _.extend({}, formState.customPropertyMap, {formDom: formState.xfaDom}, formState.renderContext);

                            for (var param in params) {
                                if (params[param]) {
                                    var newField = $("<input>").attr("type", "hidden")
                                        .attr("name", param)
                                        .val(params[param]);

                                    $(psuedoForm).append($(newField));
                                }
                            }

                            //for IE as you cannot submit a form without attaching it to document.
                            $("#lcforms_xfaform_container").append($(psuedoForm));
                            $(psuedoForm).submit();

                        }
                        else {

                            var fileAttachmentMap = formBridge._getFileNamePathMap(),
                                fileAttachmentInputs = formBridge._getFileListFromFileWidget(),
                                fileAttachmentMapInput ;
                            //clone the object to avoid polluting the old copy
                            params = _.extend({}, formState.customPropertyMap, {formDom: formState.xfaDom}, formState.renderContext);

                            for (param in params) {
                                if (params[param]) {
                                    var newField = $("<input>").attr("type", "hidden")
                                        .attr("name", param)
                                        .val(params[param]);

                                    $(psuedoForm).append($(newField));
                                }
                            }
                            _.each(formBridge._getCommitValueFromFileWidget(), function (nameOfFile, index) {
                                if( _.isObject(fileAttachmentInputs[index]) && _.isString(nameOfFile) && !nameOfFile.match(/\//g)) {
                                    fileAttachmentInputs[index].attr("name", nameOfFile);
                                    if(!fileAttachmentMap[nameOfFile]) {
                                        fileAttachmentMap[nameOfFile] ="";
                                        $(psuedoForm).append(fileAttachmentInputs[index]);
                                    }
                                }
                            });
                            fileAttachmentMapInput =  $("<input>").attr("type", "hidden")
                                .attr("name", "fileAttachmentMap")
                                .val(JSON.stringify(fileAttachmentMap));
                            $(psuedoForm).append($(fileAttachmentMapInput));

                            //for IE as you cannot submit a form without attaching it to document.
                            $("#lcforms_xfaform_container").append($(psuedoForm));
                            $(psuedoForm).submit();

                        }

                    } else {
                        //for older or ES4 profiles ---
                        //get data and then submit that data
                        var self = this;
                        this.getDataXML({
                            error: options.error,
                            success: function (obj,formState) {
                                var formState = formState || options.formState || self.getFormState(true, 2).data;
                                //give precedence to the data coming from server.
                                var params = _.extend({}, formState.customPropertyMap, formState.renderContext, {data: obj.data});

                                for (var param in params) {
                                    if (params[param]) {
                                        var newField = $("<input>").attr("type", "hidden")
                                            .attr("name", param)
                                            .val(params[param]);
                                        $(psuedoForm).append($(newField));
                                    }
                                }
                                //for IE as you cannot submit a form without attaching it to document.
                                $("#lcforms_xfaform_container").append($(psuedoForm));
                                $(psuedoForm).submit();
                            },
                            context: options.context,
                            formState: options.formState
                        });
                    }
                }
            }
            //if submit is successful, we navigate to another page so no need to call uiUnFreeze.
        },

        uiFreeze: function () {
            var $xfa_ui_freeze = $('#lcforms_xfaform_container > #xfa_ui_freeze');
            if ($xfa_ui_freeze.length > 0) {
                $xfa_ui_freeze.show()
            } else {
                $('#lcforms_xfaform_container').append('<div id="xfa_ui_freeze"></div>');
            }
        },

        uiUnFreeze: function () {
            $('#lcforms_xfaform_container > #xfa_ui_freeze').hide();
        },

        /**
         * Get all the fields in the form.
         * @param filter filter function to tell which fields to return. The
         *               function will be passed each field in the form and if
         *               it returns true the field will be returned otherwise not.
         *               **Doesn't return Master Page Fields**
         *               **Renders all pages in the process**
         * @return {Array}
         */
        getAllFields: function (filter) {
            var allFields = [];
            for (var page = 0; page < this._xfa.layout.pageCount(); page++) {
                var pageFields = this._xfa.layout.pageContent(page, "field");
                for (var i = 0; i < pageFields.length; i++) {
                    var field = pageFields.item(i);
                    if (_.isUndefined(filter) || _.isNull(filter) || filter.apply(window, [field]) === true) {
                        allFields.push(field);
                    }
                }
            }
            return allFields;
        },

        /**
         * Get the current field in focus.
         * @return {*}
         */
        getFocus: function () {
            if (this._xfa.host.getFocus) {
                var obj = this._xfa.host.getFocus();
                if (obj)
                    return this._xfa.host.getFocus().somExpression;
                return null;
            }
            else
                return "unsupported";
        },

        /*
         * Validate the form.
         * Run client side validations.
         *
         *
         */
        validateForm: function (options) {
            options = options || {};
            options.error = options.error || defaultErrorHandler;
            options.context = options.context || this;
            var valMessages = [];
            var validationsValue = this._xfa.host._validate({
                valMessages: valMessages
            });

            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                throw obj.getNextMessage().message;

            if (validationsValue == false) {
                obj.addMessage(0, "client side validations failed", "xfa");
                _.each(
                    _.filter(valMessages, function (msg) {
                        return msg.severity === "error"
                    }),
                    function (msg) {
                       obj.addMessage(1, msg.message, msg.ref)
                    }
                );
                options.error.call(options.context, obj);
            }
            else if (options.success)
                options.success.call(options.context, obj);

            return validationsValue;
        },
        //--checking for browser compatibility
        _isBrowserCompatible: function () {
            var isWin = false;
            var isMac = false;
            var isiPad = false;
            var isAndroid = false;
            var isWebKit = false;
            if (navigator.appVersion.indexOf("Win") != -1)
                isWin = true;
            else if (navigator.appVersion.indexOf("Mac") != -1)
                isMac = true;
            else if (navigator.userAgent.match(/iPad/i) != null)
                isiPad = true;
            else if (navigator.userAgent.toLowerCase().indexOf("android") > -1)
                isAndroid = true;
            if (navigator.userAgent.toLowerCase().indexOf("webkit") > -1)
                isWebKit = true;

            var browserVersion = parseInt($.browser.version, 10);
            if (isWin && ($.browser.msie && (browserVersion == 6 || browserVersion == 7 || browserVersion == 8)))
                return false;
            else if (isWin && (isWebKit || $.browser.mozilla || ($.browser.msie && (browserVersion == 9 || browserVersion == 10)))) {
                return true;
            }
            else if ((isMac || isiPad || isAndroid) && isWebKit) {
                return true;
            }
            else {
                return false;
            }
        },
        /*
         * Restores the Form State to a previous state. This is a Asynchronous call and recieves a formState from the
         * caller. The state will be applied and success or error handlers will be called after the operation is
         * completed.
         */
        restoreFormState: function (options) {
            if (window.atob && options.base64FormState !== undefined) {
                // Decode base 64 encoded string to form the form DOM object.
                var utftext = atob(options.base64FormState);
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;
                while ( i < utftext.length ) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    }
                    else if((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i+1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    }
                    else {
                        c2 = utftext.charCodeAt(i+1);
                        c3 = utftext.charCodeAt(i+2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                utftext = string;
                var formDom = JSON.parse(utftext);
                options.formState = formDom;
            }

            /*
             * We have to merge the runtime renderContext with the renderContext of the formState passed
             * so that no custom properties that were set in the context(present in the form state) are ignored.
             */
            xfalib.runtime.renderContext = xfalib.runtime.renderContext || {};
            _.extend(xfalib.runtime.renderContext, options.formState.renderContext);
            if (!this._xfa) {
                this.storage = {};
                this.storage.formState = options.formState;
                this.storage.error = options.error;
                this.storage.success = options.success;
                this.storage.context = options.context;
            } else {
                this._xfa.host.playJson(JSON.parse(options.formState.xfaDom));
                this.customContextProperty(options.formState.customPropertyMap);
                if(_.isFunction(options.success)) {
                    options.success.call(this);
                }
            }
        },
        customContextProperty: function(property,value) {
            var customPropertyMap = xfalib.runtime.customPropertyMap || {};
            if(_.isUndefined(value)) {
                if(_.isObject(property)) {
                    _.extend(customPropertyMap, property);
                    xfalib.runtime.customPropertyMap=customPropertyMap;
                } else {
                return customPropertyMap[property];
                }
            } else {
                var oldValue = customPropertyMap[property];
                customPropertyMap[property]=encodeURIComponent(value);
                xfalib.runtime.customPropertyMap=customPropertyMap;
                return oldValue;
            }
        },
        /*
         * @private
         */
        _getStorage: function () {
            var s = null;
            if (this.storage) {
                var s = this.storage.formState
                this.storage.formState = null;
            }
            return s;
        },

        _getXmlStorage: function () {
            var s = null;
            if (this.xmlStorage) {
                var s = this.xmlStorage.xmlDocument;
                this.xmlStorage.xmlDocument = null;
            }
            return s;
        },

        /*
         * @private
         */
        _getHTMLElement: function (somExpression, full) {
            var obj = this._getHTMLElementInternal(somExpression, full,this._formDoc);
            return obj;
        },

        _getHTMLElementInternal: function(somExpression, full,referenceDocument){
            somExpression = full === true ? somExpression : "xfa[0].form[0]." + somExpression;
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj))
                return obj;
            var elem = this._xfa.resolveNode(somExpression);
            if (_.isEmpty(elem)){
                obj.addMessage(0, somExpression + " not found", somExpression);
            } else {
                var elemId = xfalib.ut.XfaUtil.prototype.jqId(elem.htmlId);
                $(elemId, referenceDocument).children();
                switch (elem.className) {
                    case "instanceManager":
                        obj.addMessage(0, "No HTML Element exists for instanceManagers", somExpression);
                        break;
                    case "subform":
                        obj.data = {elem: $(elemId, referenceDocument)[0]}
                        break;
                    case "field":
                        var data = $(elemId, referenceDocument);
                        var child = data.children();

                        obj.data = {
                            elem: data[0],
                            caption: child[0],
                            widget: { elem: child[1],
                                child: $("input,select", child[1])[0]
                            }
                        };
                        if (!obj.data.widget) {
                            obj.data.widget = {
                                elem: child[0],
                                child: $("input,select", child[0]) [0]
                            }
                        }
                        break;
                    default:
                        obj.data = {elem: $(elemId, referenceDocument)[0]};
                        break;
                }
            }
            return obj;
        },

        _postExternalMessage: function (message) {
            if (this.userConfig["postExternalMessageConfig"] && _.isFunction(this.userConfig["postExternalMessageConfig"]["postExternalHandler"])) {
                var externalHandler = this.userConfig["postExternalMessageConfig"]["postExternalHandler"];
                externalHandler(message);
            }
        },

        scaleForm: function (viewportWidth) {
            if (viewportWidth) {
                this.userConfig["viewportWidth"] = viewportWidth;
                window.xfaViewRegistry.scaleForm();
            }
        },

        /**
         * This function hides the toolbar where required.
         * @memberof FormBridge
         */
        hideToolbar: function(){
          $(".toolbarheader").hide();
        },

        /**
         * Used to Register an event listener for specific Form Bridge Event.
         * @param eventName {string} name of the event for which listener has to be added. It must be one of the events
         * mentioned in the documentation.
         * @param handler {function} event listener which is called when the event is triggered.
         * @param [context] {object} context is used as the <i>this</i> object inside handler function
         */

        on: function (eventName, handler, context) {
            this._$target.on(eventName, handler, context);
        },


        /**
         * Unregister the event registered using the {@link FormBridge.on|on} function
         *
         * @param eventName {string} name of the event to un-register.
         * @param [selector] {string} selector which should match the one originally passed to FormBridge's on() while registering handlers
         * @param [handler] {function} handler which needs to un-registered. If not provided all the event listeners
         * will be unregistered
         */

        off: function (eventName, selector, handler) {
            this._$target.off(eventName, selector, handler);
        },

        /**
         * Internal API
         *
         * @private
         */

        trigger: function (eventName, extraParamerts) {
            if(this.isAnalyticsEnabled) {
                this._$target.trigger(eventName, extraParamerts);
            }
        },

        /**
         * constructs the dataSomMap and returns that. If a valid object is provided as the first argument then it
         * modifies and adds entries in that map only, otherwise constructs a new map.
         * @param map {object}
         * @returns {XFAResultObject} with the data parameter as the dataSomMap
         */
        getDataSomMap: function (map) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj)) {
                return obj;
            }
            var _map = map;
            if(!_.isObject(map)) {
                _map = {};
            }
            _map = this._xfa.form._getDataSomMap(_map);
            obj.data = _map;
            return obj;
        },

        /**
         * Updates the field values with the values provided in the map. If map is not an object, returns an error.
         * @param map {object}
         * @return {XFAResultObject} with the data parameter as null.
         */
        restoreDataSomMap: function (map) {
            var obj = new XFAResultObject();
            if (!this._checkXfa(obj)) {
                return obj;
            }
            if(!_.isObject(map)) {
                obj.addMessage(0, "Invalid Argument passed. First argument has to be an object", null);
                return obj;
            }
            this._xfa.form._restoreDataSomMap(map);
            obj.data = null;
            return obj;
        },

        /**
         * Namespace resolver needed for xpath resolution. We need to add more namepsaces
         * @param prefix
         * @returns {*|null}
         */
        nsResolver : function (prefix) {
            var ns = {
                'xfa' : 'http://www.xfa.org/schema/xfa-data/1.0/',
                'xdp' : 'http://ns.adobe.com/xdp/'
            };
            return ns[prefix] || null;
        },

        /**
         * merges the Form with the xmlDocument provided
         * @param options {object} with the folllowing syntax
         *  {
         *   xmlDocument
         *   success: function() {}
         *   error: function(xfaResultObject) {}
         *   context:
         *  }
         * @return {XFAResultObject} with the data parameter as null.
         */
        playDataXML: function(options) {
            if (!this._xfa) {
                this.xmlStorage = {};
                this.xmlStorage.xmlDocument = options.xmlDocument;
                this.xmlStorage.error = options.error || defaultErrorHandler;
                this.xmlStorage.success = options.success;
                this.xmlStorage.context = options.context;
            } else {
                var obj = new XFAResultObject(),
                    options = options || {},
                    error = options.error || defaultErrorHandler,
                    success = options.success,
                    xmlDocument = options.xmlDocument,
                    rootElement;
                if(xmlDocument == null) {
                    obj.addMessage(0, "Invalid Argument Error. XML Document is not defined", null);
                    error.apply(options.context, [obj]);
                    return;
                }
                if(_.isString(xmlDocument)) {
                    this._xfa.Logger.info("xfa", "xmlDocument is of type string. converting it to document");
                    try {
                        xmlDocument = $.parseXML(xmlDocument);
                    } catch(e) {
                        obj.addMessage(2, "Unable to parse Data XML " + e, null);
                        error.apply(options.context, [obj]);
                        return;
                    }
                }
                if(!(xmlDocument instanceof Document) && !(xmlDocument instanceof Element)) {
                    obj.addMessage(1, "Invalid Argument Error. XML Document is not an instance of Document or Element", null);
                    error.apply(options.context, [obj]);
                    return;
                }
                try {
                    this._xfa.host.playDataXml(xmlDocument);
                } catch(e) {
                    obj.addMessage(2, "Unexpected Exception: Unable to play Data XML " + e, null);
                    error.apply(options.context, [obj]);
                }
                if(success) {
                    success.apply(options.context,[obj]);
                }
            }
        },

        /**
         * Returns Data XML of the Form. If dataXML is passed, it is merged with
         * the Data XML.
         * @returns {string|Node} If dataXML input is String, it returns string, otherwise
         *                        dataXML is updated and returned
         *                        Returns null in case it fails to generate data xml.
         * @param bGenerateXDPRoot whether to generate the xdp root if it doesn't exists
         * @param dataXML {Element|Document|String} If dataXML passed is document or Element, it updates that and
         * returns it. In case of string a new string is returned.
         */
        generateDataXML: function (dataXML, bGenerateXDPRoot) {
            if(_.isUndefined(document.evaluate)) {
                // need to do it here since XPathResult is also undefined in IE
                wgxpath.install();
            }
            try {
                var prefillXML = dataXML || xfalib.runtime.renderContext.data,
                    rootSubform = this._xfa.form._getRootSubform(),
                    bAddXDPRoot = !(bGenerateXDPRoot === false),
                    impl, xmlDoc, xdpElement, datasets, data, rootNode, xPathResult, newXmlDoc;
                if (prefillXML == null) {
                    impl    = document.implementation;
                    xmlDoc  = impl.createDocument ('http://ns.adobe.com/xdp/', 'xdp:xdp', null);
                    datasets = xmlDoc.createElementNS("http://www.xfa.org/schema/xfa-data/1.0/", "xfa:datasets");
                    data = xmlDoc.createElement("xfa:data");
                    rootNode = xmlDoc.createElement(rootSubform.getAttribute("name"));
                    data.appendChild(rootNode);
                    datasets.appendChild(data);
                    xmlDoc.documentElement.appendChild(datasets);
                } else {
                    xmlDoc = prefillXML;
                    if(_.isString(xmlDoc)) {
                        this._xfa.Logger.info("xfa", "xmlDocument is of type string. converting it to document")
                        xmlDoc = $.parseXML(xmlDoc);
                    }
                    rootNode = xfalib.ut.XMLUtils.getXFARootFormElementFromXML(xmlDoc);
                    var xmlDocElement = xmlDoc instanceof Element ? xmlDoc : xmlDoc.documentElement;
                    if (bAddXDPRoot && xmlDocElement.nodeName !== "xdp:xdp") {
                        impl    = document.implementation;
                        xmlDoc  = impl.createDocument ('http://ns.adobe.com/xdp/', 'xdp:xdp', null);
                        datasets = xmlDoc.createElementNS("http://www.xfa.org/schema/xfa-data/1.0/", "xfa:datasets");
                        data = xmlDoc.createElement("xfa:data");
                        rootNode = xmlDoc.importNode(rootNode, true);
                        data.appendChild(rootNode);
                        datasets.appendChild(data);
                        xmlDoc.documentElement.appendChild(datasets);
                    }
                }
                rootSubform.generateDataXML(rootNode, rootNode);
                if(prefillXML == null || _.isString(prefillXML)) {
                    return new XMLSerializer().serializeToString(xmlDoc.documentElement);
                } else {
                    return xmlDoc;
                }
            } catch(e) {
                this._xfa.Logger.error("xfa", "Error in Generating Data XML on Client " + e);
                return null;
            }
        },

        /**
         * Destroy Mobile Form so that another form can be rendered. if bFull parameter
         * is passed as true, then all the scripts are destroyed as well.
         * @param bFull
         */
        destroyForm: function (bFull) {
            $("#mfstyle").remove();
            var oldMap = xfalib.runtime.customPropertyMap;
            // In adaptive form, we never use the view layer of mobile forms, hence adding null check
            if(xfaViewRegistry != null) {
                xfaViewRegistry.rootSubformView = null;
                xfaViewRegistry.clearTemplateCache();
                xfaViewRegistry.resetLayoutManager();
            }
            xfalib.runtime = {
                xfa: null,
                app: null,
                Document: null,
                form: null,
                renderContext: null,
                _private: {},
                customPropertyMap: oldMap
            };
            if(xfalib.runtime.console) {
                xfalib.runtime.console = undefined;
            }
            this._xfa = null;
            xfalib.script.Xfa.Instance = null;
            $(window).trigger("destroy.xfa");
            $(window).off(".xfa");
            if(bFull === true) {
                $(window).off();
                $("body").empty();
                //this is added by FileAttachment. It should have been
                // a namespace event
                $(document).off("mousedown");
                _.each(xfalib, function (obj, key) {
                   xfalib[key] = undefined;
                });
                xfalib = null;
                wgxpath = undefined;
                FormCalc = undefined;
                // In adaptive form, we never use the view layer of mobile forms, hence adding null check
                if(xfaViewRegistry != null) {
                    xfaViewRegistry.destroy();
                    xfaViewRegistry = undefined;
                }
                $.Widget = undefined;
                $.widget = undefined;
                $.xfaWidget = undefined;
                $.fn = undefined;
                $.prototype.abstractWidget = undefined;
                $.prototype.adobeDateTimePicker = undefined;
                $.prototype.adobeFileAttachment = undefined;
                $.prototype.adobeFileUploader = undefined;
                $.prototype.dateTimeEdit = undefined;
                $.prototype.dropDownList = undefined;
                $.prototype.defaultWidget = undefined;
                $.prototype.fileUpload = undefined;
                $.prototype.imageField = undefined;
                $.prototype.listBox = undefined;
                $.prototype.nwkListBox = undefined;
                $.prototype.numericInput = undefined;
                $.prototype.signatureField = undefined;
                $.prototype.ScribbleImageField = undefined;
                $.prototype.textField = undefined;
                $.prototype.xfaButton = undefined;
                $.prototype.XfaCheckBox = undefined;
                $.expr = undefined;
                window.formBridge = undefined;
                FormBridge = undefined;
                window.renderNextPage = undefined;
                window.handleFooterLogic = undefined;
                window.handleScroll = undefined;
                optionsFromProfileNode = undefined;
                options = undefined;
                FD = undefined;
                window._ = undefined;
                $plugFileWidgetDom = undefined;
            }
        }
    });

    window.formBridge = new FormBridge();
    window.formBridge._$target = $(window.formBridge);
    try {
        var evnt = document.createEvent("CustomEvent");
        evnt.initCustomEvent("FormBridgeInitialized", true, true, {"formBridge": window.formBridge});
        window.dispatchEvent(evnt);
    }

    catch (exception) {
        // written for env rhino to execute(for server side validation)
    }

    if (!window.formBridge.userConfig["postExternalMessageConfig"]) {
        if (window !== window.parent) {
            try {
                window.parent.document.getElementById(window.name);
                //We are here means no cross domain issue. So if user has not defined custom postExternalMessageConfig and
                // then we'll create one which would just send event on parent.
                window.formBridge.registerConfig("postExternalMessageConfig", {
                    "postExternalHandler": function (message) {
                        var tmpEvent = document.createEvent("CustomEvent");
                        tmpEvent.initCustomEvent(message.name, true, true, message.data);
                        window.parent.dispatchEvent(tmpEvent);
                    }
                });
            } catch (e) {
                //ignore the error
            }
        }
    }
    window.formBridge._postExternalMessage({
        name: "FormBridgeInitialized",
        data: {
            "formBridge": window.formBridge
        }
    });
})($);
