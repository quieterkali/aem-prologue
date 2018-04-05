// jscs:disable requireDotNotation
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

(function ($, _) {
    Function.prototype.bind = Function.prototype.bind || function (ctx) {
            var that = this;
            return function () {
                that.call(ctx, arguments);
            };
        };

    var nValidationContext = 0,
        /**
         * flag to check if adaptive forms is online or not
         * @type {boolean}
         */
        checkAFOffline = false,
        sValidationContext = "";

    /**
     * Class representing the result of {@link GuideBridge} API. This class provides API to access the result of the
     * GuideBridge API and retrieve any error messages the API has thrown.
     * @class GuideResultObject
     * @docStatus review 2016-05-03
     * @since 6.0
     */
    var GuideResultObject = function () {
        var _message = [];
        var _errorCode = [];
        var _somExpression = [];
        /**
         * The value of this property is true if the API succeeded, otherwise false. The
         * {@link GuideResultObject#getNextMessage|getNextMessage} API can be used to retrieve the error messages in
         * case the value of this property is false.
         * @summary whether the API succeeded or failed.
         *
         * @type {boolean}
         * @member errors
         * @memberof GuideResultObject
         * @instance
         * @readonly
         * @since 6.0
         */
        this.errors = false;
        /**
         * The type of the data is specific to the API and documentation of that API provides more details about the
         * data
         * @summary data returned by GuideBridge API
         *
         * @member {*} data
         * @memberof GuideResultObject
         * @instance
         * @readonly
         * @since 6.0
         */
        this.data;

        /**
         * API to add a message in the GuideResultObject
         * @private
         * @memberof GuideResultObject
         * @instance
         * @since 6.0
         */
        this.addMessage = function (code, msg, som) {
            this.errors = true;
            _message.push(msg);
            _somExpression.push(som);
            _errorCode.push(code);
        };

        /**
         * Error Message returned by GuideBridge API
         * @typedef {object} GuideResultObject~ErrorMessage
         * @property {number} code Error Code
         * @property {?string} somExpression Som Expression of the GuideNode the error is related to. It can be null if
         * error is not related to a GuideNode. For example, server failure when submitting the form.
         * @property {string} message User friendly message for the error.
         * @see GuideNode#somExpression
         */
        /**
         * When a GuideBridge API fails, it throws an error message. This is indicated by the
         * {@link GuideResultObject#errors|errors} property. To get the errors, one has to call this API. The API can throw
         * multiple errors and the user has to call this API until it returns null indicating no more errors.
         * @summary Returns the error message thrown by the GuideBridge API.
         * @function getNextMessage
         * @memberof GuideResultObject
         * @instance
         * @return {GuideResultObject~ErrorMessage} object containing the error message
         * @since 6.0
         */
        this.getNextMessage = function () {
            if (_errorCode.length == 0) {
                return null;
            }
            return {
                code : _errorCode.pop(),
                somExpression : _somExpression.pop(),
                message : _message.pop()
            };
        };
    };

    var GUIDE_BRIDGE_VERSION = "1.0";
    /*
     * Callback to accept result of asynchronous GuideBridge APIs.
     * @callback GuideBridge~AsyncAPIResultCallback
     * @param {GuideResultObject} guideResultObject object containing the result of the API
     */
    /*
     * Signature of the input to be passed to GuideBridge asynchronous APIs
     * @typedef {object} GuideBridge~AsyncAPIInput
     * @property {GuideBridge~AsyncAPIResultCallback} [success] callback which receives the result of the API in case of
     * success. The argument this callback will recieve will have its {@link GuideResultObject#errors|errors} property
     * as false.
     * @property {GuideBridge~AsyncAPIResultCallback} [error] callback which receives the result of the API in case of
     * failure. The argument this callback will recieve will have its {@link GuideResultObject#errors|errors} property
     * as true.
     * @param {object} [context] _this_ object inside the _success_ and _error_ callback will point to this
     * object
     */
    /**
     * GuideBridge provides an interface using which, wrapper html (page hosting/embedding adaptive forms) or external
     * window scripts like Parent window javascript (in case form is embedded in an iframe), can communicate with
     * current Adaptive Form and manipulate or query it's current state.
     *
     * Some of the use cases for using this API
     * * Submit Adaptive Form from a custom button present outside the Form.
     * * Get current Adaptive Form state and save it in local storage for restoring it later on.
     * * Plugging in custom widgets.
     * * Manipulate the Adaptive Form component properties, like value, visibility from outside the Form
     * * Listen to bridge events and send data to Analytics server for reporting
     *
     * ### Accessing the Instance of GuideBridge
     * To access the GuideBridge APIs, one needs to get hold of an instance of GuideBridge. The object is
     * available on the window after the GuideBridge script is loaded. One can directly access it by using
     * `window.guideBridge`. But
     * that requires the user script is written after the GuideBridge script is loaded. In certain cases, a user might
     * not be
     * aware of when their script gets loaded, in those cases the recommended approach is to listen to the
     * {@link GuideBridge.event:bridgeInitializeStart|bridgeInitializeStart} event which provides an instance of
     * GuideBridge object.
     *```
     * window.addEventListener("bridgeInitializeStart", function(evnt) {
     *      // get hold of the guideBridge object
     *      var gb = evnt.detail.guideBridge;
     * })
     * ```
     *
     * **Or**, if you are sure that your script will execute after GuideBridge Script is loaded, then you can directly
     * use `window.guideBridge`. In cases like your script is present at the bottom of the page or you are executing on
     * jquery dom ready event.
     * ```
     *    $(function () {
     *          // one can directly access guideBridge object here.
     *          window.guideBridge.connect(function () {
     *              //call guideBridge APIs
     *          })
     *    })
     * ```
     *
     * <a name="wait-form-ready"></a>
     * ### Wait for Form to get ready
     * After getting the GuideBridge object one needs to wait for the Form to get initialized. This can be done by
     * providing a callback to the {@link GuideBridge#connect|connect} API
     * ```
     * guideBridge.connect(function (){
     *    //this callback will be called after adaptive form is initialized
     *    // do your custom processing
     * })
     * ```
     *
     * _**Note:** There is no link between Dom ready events and the connect API. If one wants to access the HTML DOM
     * from inside the connect callback, the recommended approach is to listen on the jQuery
     * [ready](https://api.jquery.com/ready/) event or the native
     * [DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded) event. Similarly if one
     * wants to access GuideBridge APIs one needs to wait for the connect callback to get fired._
     *
     * <a name="guidebridge-api-usage"></a>
     * ### Using the GuideBridge API
     * APIs are provided for external applications to connect with Adaptive Form and FormDom. The APIs can be
     * loosely divided into two categories, **synchronous** and **asynchronous**.
     *
     * The synchronous getter API returns a {@link GuideResultObject} which represents the result of the API whereas
     * each setter API throws an exception in case of error(s) and it is the responsibility of the API to catch those
     * exceptions. The {@link GuideResultObject} either contains error or the return value of the API and provides easy
     * mechanism to access each of them.
     *
     * ```
     * var result = guideBridge.hideGlobalToolbar()
     * if (result.errors) {
     *     console.error("Unable to hide toolbar");
     *     var msg = guideResultObject.getNextMessage();
     *     while (msg != null) {
     *         console.error(msg.message);
     *         msg = guideResultObject.getNextMessage();
     *    }
     * } else {
     *      console.log("toolbar hidden successfully");
     * }
     * ```
     *
     * Each asynchronous API provides callback mechanism to return the result of the API. Each API takes a Javascript
     * Object having success and error handlers. The success and error handlers receive {@link GuideResultObject} as input.
     * In the success callback, the arguments {@link GuideResultObject#data|data} property is set to the return value
     * of the API, while in the error callback the {@link GuideResultObject#errors|errors} property is set to _true_.
     * Some APIs might need extra input and that will be defined by the API
     * ```
     * guideBridge.getData({
     *     success : function (guideResultObject) {
     *          console.log("data received" + guideResultObject.data);
     *     }
     *     error : function (guideResultObject) {
     *          console.error("API Failed");
     *          var msg = guideResultObject.getNextMessage();
     *          while (msg != null) {
     *              console.error(msg.message);
     *              msg = guideResultObject.getNextMessage();
     *          }
     *     }
     * });
     * ```
     * _**Note:** Some APIs do not follow the above norm and it is mentioned in the documentation of that API_
     *
     * <a name="guidebridge-events"></a>
     * ### GuideBridge Events
     *
     * GuideBridge API triggers a set of events to notify the current action a user has taken. Developers can listen on
     * that event using the {@link GuideBridge#on|on} API and perform some tasks. For example a developer can listen on
     * {@link GuideBridge.event:elementFocusChanged|elementFocusChanged} and capture for how long a user spends time
     * on that field. All the events triggered by GuideBridge are mentioned below.
     *
     * GuideBridge provides an event object which contains extra information about the event. For
     * example _elementFocusChanged_ event provides information about the previous field that was in focus and the
     * current field that came to focus.
     *
     * The {@link GuideBridge#on|on} API takes a {@link GuideBridge~GuideBridgeEventCallback|GuideBridgeEventCallback}
     * as input. The callback is passed two arguments, event and payload where the extra information is passed in the
     * payload argument. The documentation of each event lists the values of different properties of the payload
     * object.
     *
     * ```
     * guideBridge.on(eventName, function (event, payload) {
     *      // access payload properties
     *      ...
     * })
     * ```
     *
     * @class GuideBridge
     * @docStatus review 2016-05-03
     * @since 6.0
     */
    var GuideBridge = function () {
        this._$target = null;
        this._guide = null;
        this._guideView = null;
        this._version = GUIDE_BRIDGE_VERSION;
        this._guideInitHandler = {};
        $(window).bind("guideModelInitialized", this._guideModelInitialized.bind(this));
        $(window).bind("guideInitialized", this._guideInitialized.bind(this));
        $(window).bind("guideInitializationError", this._guideError);
        this.userConfig = {};
        // set the host name whether it is client or server, by default it is client
        this.hostName = "client";
    };

    var _formInstanceUUID;
    var GUIDE_TEMP_STORAGE_PATH = "/tmp/fd/af",
        FM_DAM_ROOT = "/content/dam/formsanddocuments/",
        FM_AF_ROOT  = "/content/forms/af/",
        LOCAL_METADATA_SELECTOR = "local";
    var createUUIDStorage  = function (uuid) {
        var successFlag = true;
        // this is  done so that when one clicks
        // the disabled link anyhow
        // you will not be able to
        // send request
        // More over if hack this too then we
        // have a check to prevent formation of
        // UUID folder at server side too ;)
        if (guideBridge._disablePreview()) {
            return false;
        }
        $.ajax({
            url : guideBridge._getGuidePathUrl(".fd.tempstorageprovider.jsp"),
            type : "POST",
            async : false,
            data : {"uuidPath" : GUIDE_TEMP_STORAGE_PATH + "/" + uuid},
            error : function (message) {
                guideBridge._guide.logger().log(message);
                successFlag = false;
            }
        });
        return successFlag;
    };

    var defaultErrorHandler = function (obj) {
        if (typeof(console) == "undefined") {
            return;
        }
        var d = obj.getNextMessage();
        while (d) {
            this._guide.logger().log(d.message);
            d = obj.getNextMessage();
        }
    };

    /**
     *
     * Default function to check Validations errors after getting the data from the
     * server with getDataXML call.
     * @private
     */
    var defaultValidationChecker = function (validations, obj) {
        if (validations && validations.length > 0) {
            for (var i = 0; i < validations.length; i++) {
                obj.addMessage(0, validations[i], "");
            }
            return false;
        }
        return true;
    };

    function getOrElse() {
        return xfalib.ut.XfaUtil.prototype.getOrElse.apply(null, arguments);
    }

    $.extend(GuideBridge.prototype, {

        /**
         * Dispatched when the instance of GuideBridge is available. The GuideBridge object
         * will be passed to the listener and further communication can be done using that object.
         *
         * _**Note :** bridgeInitializeStart event is dispatched at window_
         *
         * @summary Notifies when the instance of GuideBridge is available.
         *
         * @event bridgeInitializeStart
         * @property {Object} detail an object containing guideBridge
         * @property {GuideBridge} detail.guideBridge GuideBridge Instance
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * window.addEventListener("bridgeInitializeStart", function(evnt) {
         *      // get hold of the guideBridge object
         *      var gb = evnt.detail.guideBridge;
         *      //wait for the completion of adaptive forms
         *      gb.connect(function (){
         *         //this function will be called after adaptive form is initialized
         *      })
         * })
         */
        GUIDE_BRIDGE_INITIALIZE_START : "bridgeInitializeStart",

        /**
         * @summary Dispatched when the initialization of Adaptive Form is complete.
         *
         * @name  bridgeInitializeComplete
         * @event
         * @property {object} payload payload passed to the event listener
         * @property {object} payload.target instance of GuideBridge object
         * @memberof GuideBridge
         * @deprecated since 6.3 this event is deprecated. Please use {@link GuideBridge#connect|connect} API
         * @since 6.0
         * @example
         * guideBridge.on("bridgeInitializeComplete" , function(event, payload) {
         *      var gb = payload.target;
         *      assert(gb === guideBridge)
         * }
         */
        GUIDE_BRIDGE_INITIALIZE_COMPLETE : "bridgeInitializeComplete",

        /**
         * @summary Dispatched when visibility of any Adaptive Form component(Panel or Field) changes.
         * @name elementVisibleChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Scriptable} payload.target Adaptive Form component whose {@link Scriptable#visible|visible} property has
         * changed.
         * @property {boolean} payload.oldText old value of the visible property
         * @property {boolean} payload.newText new value of the visible property
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * guideBridge.on("elementVisibleChanged" , function(event, payload) {
         *      var component = payload.target; // scripting model of the component whose visibility has changed
         *      var newValue = payload.newText;
         *      if (newValue) {
         *          console.log(component.name + " is visible now";
         *      } else {
         *          console.log(component.name + " is hidden now";
         *      }
         * }
         *
         */
        GUIDE_ELEMENT_VISIBLE_CHANGED : "elementVisibleChanged",

        /**
         * @summary Dispatched when any Adaptive Form component is enabled/disabled, i.e.
         * {@link Scriptable#enabled|enabled} property of a component changes.
         * @name elementEnableChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Scriptable} payload.target component whose {@link Scriptable#enabled|enabled} property has changed
         * @property {boolean} payload.oldText old value of the enabled property
         * @property {boolean} payload.newText new value of the enabled property
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * guideBridge.on("elementEnableChanged" , function(event, payload) {
         *      var component = payload.target; // scripting model of the component whose enabled property has changed
         *      var newValue = payload.newText;
         *      if (newValue) {
         *          console.log(component.name + " is enabled now";
         *      } else {
         *          console.log(component.name + " is disabled now";
         *      }
         * }
         */
        GUIDE_ELEMENT_ENABLE_CHANGED : "elementEnableChanged",

        /**
         * @summary Dispatched when value of any Field changes.
         * @name elementValueChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Field} payload.target Field whose {@link Field#value|value} has changed
         * @property {string|number} payload.oldText old value of the Field
         * @property {string|number} payload.newText new value of the Field
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * guideBridge.on("elementValueChanged" , function(event, payload) {
         *      var component = payload.target; // Field whose value has changed
         *      console.log("Value of component " + component.name + " was " + payload.oldText);
         *      console.log("Value of component " + component.name + " is " + payload.newText);
         * }
         */
        GUIDE_ELEMENT_VALUE_CHANGED : "elementValueChanged",

        /**
         * In layouts like Wizard or Tabbed layout, when a user navigates from one tab to another, this event is
         * triggered
         * @summary Event to notify that the user has navigated from one Panel to another.
         *
         * @name elementNavigationChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Panel} payload.target Panel to which the user moved to
         * @property {string} payload.prevText SomExpression of the panel from which user moved
         * @property {string} payload.newText SomExpression of the panel to which user moved
         * @memberof GuideBridge
         * @see GuideNode#somExpression
         * @since 6.0
         * @example
         * guideBridge.on("elementNavigationChanged" , function(event, payload) {
         *      var component = payload.target;
         *      console.log("old panel's SOM Expression: " + payload.oldText);
         *      console.log("new panel's SOM Expression: " + payload.newText);
         * }
         */
        GUIDE_ELEMENT_NAVIGATION_CHANGED : "elementNavigationChanged",

        /**
         * @summary Dispatched whenever a Field/Panel gets Focus
         * @name elementFocusChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Panel|Field} payload.target new focused component
         * @property {string} oldText SOM Expression of  component  that was previously in focus or null
         * @property {string} newText SOM Expression of the component that is currently in focus or null
         * @memberof GuideBridge
         * @see GuideNode#somExpression
         * @see {@link GuideBridge#setFocus|setFocus API}
         * @since 6.0
         * @example
         * guideBridge.on("elementFocusChanged" , function(event, payload) {
         *      var component = payload.target;
         *      console.log("old elements's SOM Expression: " + payload.oldText);
         *      console.log("new elements's SOM Expression: " + payload.newText);
         * }
         */
        GUIDE_ELEMENT_FOCUS_CHANGED : "elementFocusChanged",

        /**
         * @summary Dispatched when a user looks at the help description of any Adaptive Form component(Panel or field)
         * @name elementHelpShown
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Panel|Field} payload.target component whose help is being shown
         * @property {string} payload._property what kind of help is being shown. The value can be
         * * shortDescription (if Short Description becomes visible)
         * * longDescription (if Long Description becomes visible)
         * @property {string} payload.prevText empty string
         * @property {object} payload.newText object containing the help content
         * @property {string} payload.newText.help help content of the component
         * @memberof GuideBridge
         * @since 6.0
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/authoring-in-field-help.html|Help Description in Adaptive Form}
         * @example
         * guideBridge.on("elementHelpShown" , function(event, payload) {
         *      var component = payload.target;
         *      console.log("component whose help is shown " + payload.target.name);
         *      console.log("Help shown: " + payload._property);
         *      console.log("Help Content: " + payload.newText.help);
         * }
         */
        GUIDE_ELEMENT_HELP_SHOWN : "elementHelpShown",

        /**
         * @summary Dispatched when validity of a Field changes.
         * @name elementValidationStatusChanged
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Field} payload.target Field which either became valid/invalid
         * @property {boolean} payload.prevText old validation status
         * @property {boolean} payload.newText new validation status
         * @memberof GuideBridge
         * @see Field#validate
         * @see Field#validationState
         * @since 6.0
         * @example
         * guideBridge.on("elementValidationStatusChanged" , function(event, payload) {
         *      var component = payload.target;
         *      if (payload.prevText) {
         *          console.log("component became invalid" );
         *      } else {
         *         console.log("component became valid" );
         *      }
         * }
         */
        GUIDE_ELEMENT_VALIDATION_STATUS_CHANGED : "elementValidationStatusChanged",

        /**
         * Developers must not modify the Form Fields inside the listener. This is mostly use to update the UI outside
         * the Form or capture some data for analytics. If you want to modify form field value on the click of a button
         * please use the [Click Expression](https://helpx.adobe.com/aem-forms/6-1/adaptive-form-expressions.html#main-pars_header_6)
         * provided in the Forms Authoring.
         *
         * @summary Dispatched when a Button component is clicked.
         *
         * @name elementButtonClicked
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {Button} payload.target Button which was clicked
         * @memberof GuideBridge
         * @since 6.0
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/adaptive-form-expressions.html#main-pars_header_6|Click Expression in Buttons}
         * @example
         * guideBridge.on("elementButtonClicked" , function(event, payload) {
         *      var component = payload.target; // Button which wass clicked
         *      console.log("Button which was clicked " + component.name);
         * }
         */
        GUIDE_ELEMENT_BUTTON_CLICKED : "elementButtonClicked",

        /**
         * Whenever the full form validations are run via the {@link GuideBridge#validate|validate} API, this event is triggered.
         * @summary Dispatched when the validation of all the Adaptive Form fields are completed.
         *
         * @name validationComplete
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {GuideContainerNode} payload.target root Node of the Adaptive Form
         * @property {boolean} payload.prevText result of running the validation. true if validations are successful,
         * false otherwise
         * @property {Field~ValidationError[]} payload.newText List of objects containing error messages.
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * guideBridge.on("validationComplete" , function(event, payload) {
         *      if (payload.prevText) {
         *          console.log("validation success");
         *      } else {
         *          console.log("validation failure");
         *          if (payload.newText.length) {
         *              payload.newText.forEach(function (error) {
         *                 console.log("validation failed for " + error.som + " with message " + error.errorText);
         *              })
         *          }
         *      }
         * }
         */
        GUIDE_VALIDATION_COMPLETE : "validationComplete",

        /**
         * Adaptive Form can be configured to be saved automatically at regular intervals. This can be controlled
         * dynamically based on the values filled in the Form. Authors can write custom scripts which can enable/disable
         * auto save functionality dynamically
         * @summary Dispatched when auto save gets enabled in the Form
         * @name guideAutoSaveStart
         * @event
         * @property {object} payload payload containing more information about the event
         * @property {GuideContainerNode} payload.target root Node of the Adaptive Form
         * @memberof GuideBridge
         * @since 6.1
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/auto-save-an-adaptive-form.html|Auto Save an Adaptive Form}
         * @example
         * guideBridge.on("guideAutoSaveStart" , function(event, payload) {
         *      console.log("Forms is now being saved as draft automatically");
         * }
         */
        GUIDE_AUTO_SAVE_START : "guideAutoSaveStart",

        /**
         * Users can add some pre submit code in the listener to this event.
         * @summary Dispatched when the user clicks on the submit button
         * @name submitStart
         * @event
         * @memberof GuideBridge
         * @since 6.0
         * @example
         * guideBridge.on("submitStart" , function(event) {
         *    // do some pre submit processing
         * }
         */
        GUIDE_SUBMIT_START : "submitStart",
        GUIDE_PATH : "guidePath",
        GUIDE_NAME : "guideName",
        GUIDE_DESC : "guideDesc",
        GUIDE_TYPE : "guideType",

        /**
         * @summary Dispatched when an Adaptive Form fragment is lazily loaded successfully
         * @name elementLazyLoaded
         * @property {object} payload payload containing more information about the event
         * @property {Panel} payload.target Adaptive Form Fragment which is lazily loaded
         * @event
         * @memberof GuideBridge
         * @since 6.1 FP1
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/lazy-loading-adaptive-forms.html|Lazy Loading Adaptive Form}
         * @example
         * guideBridge.on("elementLazyLoaded" , function(event, payload) {
         *      var component = payload.target;
         *      console.log("Panel " + component.name + " loaded");
         * }
         */
        GUIDE_ELEMENT_LAZY_LOADED : "elementLazyLoaded",

        /**
         * All GuideBridge APIs (except {@link GuideBridge#connect|connect}) require Adaptive Form to be initialized.
         * Checking the return value of this API is not necessary if guideBridge API is called only after the
         * <a href="#wait-form-ready">Form is initialized</a>
         * @summary Whether the Adaptive Form has been initialized or not
         *
         * @method
         * @memberof GuideBridge
         * @returns {boolean} true if the Adaptive Form is ready for interaction, false otherwise
         * @since 6.0
         * @instance
         */
        isConnected : function () {
            if (this._guide) {
                return true;
            }
            return false;
        },

        /**
         * Specify a callback function which is called/notified when Adaptive Form gets initialized. After Adaptive
         * Form is initialized GuideBridge is ready for interaction and one can call any API.
         *
         * The callback can also be registered after the Form gets initialized. In that case, the callback will be
         * called immediately.
         *
         * @summary Register a callback to be executed when the Adaptive Form gets initialized
         * @param handler {function} function that would be called when guideBridge is ready for interaction. The
         * signature of the callback should be
         * ```
         * function() {
         *     // app specific code here
         * }
         * ```
         * @param {object} [context] _this_ object in the callback function will point to context
         * @since 6.0
         * @instance
         * @method
         * @memberof GuideBridge
         * @example
         * guideBridge.connect(function() {
         *    console.log("Hurrah! Guide Bridge Activated");
         * })
         */
        connect : function (handler, context) {
            context = context || guideBridge;
            if (this.isConnected()) {
                // handle exceptions gracefully since it executes in our thread
                try {
                    handler.call(context);
                } catch (exception) {
                    // guide model should be initialized in bridge in connect, still adding a null check
                    if (this._guide) {
                        this._guide.logger().log(exception);
                    }
                }
            } else {
                this._guideInitHandler.handler = this._guideInitHandler.handler || [];
                this._guideInitHandler.handler.push(handler);
                this._guideInitHandler.context = this._guideInitHandler.context || [];
                this._guideInitHandler.context.push(context);
            }
        },

        _guideModelInitialized : function (e) {
            this._guide = e.guide;
        },

        /*
         *
         * Handler for guideInitialized event which is fired by Adaptive Form library after Adaptive Form Dom is initialized
         *
         * @private
         */
        _guideInitialized : function (e) {
            if (this._guideInitHandler.handler) {
                for (var i = 0; i < this._guideInitHandler.handler.length; i++) {
                    try {
                        this._guideInitHandler.handler[i].call(this._guideInitHandler.context[i]);
                    } catch (exception) {
                        // guide model should be initialized in bridge in connect, still adding a null check
                        if (this._guide) {
                            this._guide.logger().log(exception);
                        }
                    }
                }
            }
            window.guideBridge.trigger("bridgeInitializeComplete",
                guidelib.event.GuideModelEvent.createEvent(
                    "bridgeInitializeComplete",
                    guideBridge
                )
            );
        },
        _setGuideView : function (guideView) {
            this._guideView = guideView;
        },
        _guideError : function (e) {
            this._guide.logger().debug("AF", e);
        },
        _checkGuide : function (obj) {
            if (!this._guide) {
                obj.addMessage(1, "Guide Dom not Initialized", "");
                return false;
            }
            return true;
        },
        /**
         * @summary returns the version of GuideBridge library
         * @returns {string} the version of the GuideBridge library
         * @method getBridgeVersion
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        getBridgeVersion : function () {
            return this._version;
        },

        /**
         * Callback to execute when bridgeInitializeStart is triggered.
         * @callback GuideBridge~postExternalCallback
         * @param {string} name constant string `bridgeInitializeStart`
         * @param {object} data object containing the GuideBridge instance
         * @param {GuideBridge} data.guideBridge instance of GuideBridge
         * @since 6.0
         * @deprecated since 6.3 this callback is deprecated. One must do the handling in
         * {@link GuideBridge.events:bridgeInitializeStart} event
         * @memberof GuideBridge
         * @see GuideBridge#registerConfig
         * @see GuideBridge~postExternalMessageConfig
         */
        /**
         * @typedef {object} GuideBridge~postExternalMessageConfig
         * @property {GuideBridge~postExternalCallback} postExternalHandler callback to be executed when GuideBridge
         * instance is available
         * @since 6.0
         * @deprecated since 6.3 this configuration is deprecated. One must do the handling in
         * {@link GuideBridge.events:bridgeInitializeStart} event
         * @memberof GuideBridge
         * @see GuideBridge#registerConfig
         */
        /**
         * @typedef {object} GuideBridge~submitConfig
         * @property {HTMLFormElement} form During submission Adaptive Form creates a new HTMLFormElement and puts all the
         * value in that Form. One can provide an existing HTMLFormElement that will be reused for submitting the Form. The
         * action and method property of the Form element will be ignored.
         * @property {boolean} useAjax submit the form via a XMLHttpRequest rather than using a HTMLFormElement
         * instance is available
         * @property {function} submitSuccessHandler success Handler to be called post submission. This option is ignored
         * if _useAjax_ is set to false
         * @since 6.0
         * @memberof GuideBridge
         * @see GuideBridge#registerConfig
         */
        /**
         * Adaptive Form uses some default named configurations to provide its default behaviour. This configurations
         * can be modified by providing a new configuration.
         *
         * The API accepts the name of the configuration and updated configuration. Based on value of the new
         * configuration the behaviour of the Form gets changed.
         * Currently supported configurations are:
         * #### postExternalMessageConfig
         *
         * <div class="deprecated"><span class="deprecated-heading">Deprecated :</span><span> since 6.2 this
         * configuration is deprecated. Use the {@link GuideBridge.events:bridgeInitializeStart} event to do the same
         * handling</span>
         * </div>
         * In case Adaptive Form is embedded inside an iframe, this configuration allows developers to provide
         * GuideBridge Instance to parent or child windows.
         *
         * By default, GuideBridge instance is only available to the current window and to the parent window if it
         * doesn't violate the cross-origin policy. Now there may be a case when this doesn't solves the problem, then
         * one can take advantage of this configuration to extend this functionality.
         *
         * For the signature of the configuration see
         * {@link GuideBridge~postExternalMessageConfig|postExternalMessageConfig}
         * ##### Example
         * To provide the GuideBridge instance to a child window
         * ```
         * window.on("bridgeInitializeStart", function (evnt) {
         *      var gb = evnt.detail.guideBridge;
         *      gb.registerConfig("postExternalMessageConfig", {
         *          "postExternalHandler" : function(data) {
         *              // assume we have a child window with an id 'childWindowId'
         *              var childWindow = document.getElementById("#childWindowId").contentWindow;
         *              var tmpEvent = document.createEvent("CustomEvent");
         *              tmpEvent.initCustomEvent(data.name, true, true, data.data);
         *              childWindow.dispatchEvent(tmpEvent);
         *          }
         *      });
         * });
         * ```
         * #### widgetConfig
         * The configuration is used to modify the appearance of a specific Field. Adaptive Form allows developers to
         * [create custom widgets](http://helpx.adobe.com/aem-forms/6-1/custom-appearance-widget-adaptive-form.html) and
         * use them in their Forms.
         *
         * The signature of the config is
         * ```
         * { "<component-identifier> : "<widget-name>"}
         * ```
         * where `<component-identifier>` can be either the name or classname of Adaptive Form Field,
         * while widget name is the name of the jQuery Widget.
         *
         * #### submitConfig
         * To modify the default submit behaviour one can provide this configuration. The signature of the config is
         * defined {@link GuideBridge~submitConfig|below}
         * ```
         * guideBridge.registerConfig("submitConfig", {"useAjax" : true});
         * ```
         * @summary Registers user/portal specific configurations to GuideBridge
         * @returns {GuideResultObject} {@link GuideResultObject} with {@link GuideResultObject#data|data} having the
         * old configuration against the same _key_
         *
         * @param key {string} configuration name. one of the following
         * * postExternalMessageConfig
         * * widgetConfig
         * * submitConfig
         * @param {widgetConfig|GuideBridge~submitConfig|GuideBridge~postExternalMessageConfig} [config] configuration object for the configuration
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         */
        registerConfig : function (key, config) {
            var obj = new GuideResultObject();
            obj.data = this.userConfig[key];
            this.userConfig[key] = config;
            obj.completed = true;
            return obj;
        },

        customContextProperty : function (property, value) {
            var customPropertyMap = getOrElse(guidelib, "runtime.guideContext.customPropertyMap", {});
            if (_.isUndefined(value)) {
                if (_.isObject(property)) {
                    _.extend(customPropertyMap, property);
                    guidelib.runtime.guideContext.customPropertyMap = customPropertyMap;
                } else {
                    return customPropertyMap[property];
                }
            } else {
                var oldValue = customPropertyMap[property];
                customPropertyMap[property] = value;
                guidelib.runtime.guideContext.customPropertyMap = customPropertyMap;
                return oldValue;
            }
        },

        getNavigablePanel : function (somExpression) {
            return this._guideView.getSomOnNavigableAncestor(somExpression);
        },

        /**
         * Sets the value of a property for a set of {@link GuideNode} to a different value. Property must be a valid
         * writable property for that Node
         *
         * Each entry in _somList_ should have a corresponding entry in the _valueList_. Mismatch in the length of these
         * two arguments will make the function do nothing
         * @summary Modify a property for a set of Nodes
         * @method setProperty
         * @param {string[]} somList an array having someExpression for the nodes. Invalid SomExpressions and
         * the corresponding value in the _valueList_ are ignored.
         * @param {string} propertyName name of the property which has to be modified
         * @param {Array.<*>} valueList an array containing value of the _propertyName_ for each element in _somList_
         *
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         * @see GuideNode#somExpression
         * @example <caption>Modifying the value of a set of fields</caption>
         * guideBridge.setProperty(["SOM_OF_FIELD_1", "SOM_OF_FIELD_2"...... "SOM_OF_FIELD_N"]
         *                          "value"
         *                          [VALUE_1, VALUE_2 .... VALUE_N]);
         * @example <caption>Hiding a single field</caption>
         * guideBridge.setProperty(["SOM_OF_FIELD_1"]
         *                          "visibility"
         *                          [false]);
         */
        setProperty : function (somList, propertyName, valueList) {
            if (!propertyName) {
                return;
            }
            if (!_.isArray(somList) || !_.isArray(valueList)) {
                return;
            }
            if (somList.length !== valueList.length) {
                return;
            }
            var gb = this;
            _.each(somList, function (som, index) {
                var node = gb.resolveNode(som);
                if (node) {
                    node[propertyName] = valueList[index];
                } else {
                    gb._guide.logger().log("som not valid:" + som);
                }
            });
            if (!this._guide._currentContext) {
                this._guide.runPendingExpressions();
            }
        },

        /**
         * Used to retrieve the Form data as XML. The API gets the data xml synchronously/asynchronously based on the
         * _async_ option and invokes the success/error handlers passed in the arguments upon completion.
         *
         * In the success callback the {@link GuideResultObject#data|data} parameter contains the xml string.
         *
         * The success and error handlers receive {@link GuideResultObject} as input.
         * @summary Return Form data as XML.
         *
         * @param {object} options input to the getDataXML API
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object
         * @param {boolean} [options.async=true] whether to make the server call asynchronously or not. If false, the
         * browser will wait for the server to return the XML and then execute the success or error callbacks object
         * @see <a href="#guidebridge-api-usage" >GuideBridge API Usage</a>
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @example
         * guideBridge.getDataXML({
         *     success : function (guideResultObject) {
         *          console.log("xml data received" + guideResultObject.data);
         *     }
         *     error : function (guideResultObject) {
         *          console.error("API Failed");
         *          var msg = guideResultObject.getNextMessage();
         *          while (msg != null) {
         *              console.error(msg.message);
         *              msg = guideResultObject.getNextMessage();
         *          }
         *     }
         * });
         *
         * @deprecated since 6.3 this API is deprecated. Use getData API instead.
         * @param options
         */
        getDataXML : function (options) {
            guideBridge.getData(options);
        },

        /**
         * Used to retrieve the Form data as XML or JSON depending on the Schema Type. Only for JSON Schema based Forms
         * and Form Data Model based forms, the data will be in JSON format while for others, the data will be in XML format.
         * The API gets the data synchronously/asynchronously based on the
         * _async_ option and invokes the success/error handlers passed in the arguments upon completion.
         *
         * In the success callback the {@link GuideResultObject#data|data} parameter contains the data string.
         *
         * The success and error handlers receive {@link GuideResultObject} as input.
         * @summary Return Form data as XML or JSON depending on the Schema Type.
         *
         * @param {object} options input to the getData API
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object
         * @param {boolean} [options.async=true] whether to make the server call asynchronously or not. If false, the
         * browser will wait for the server to return the data (XML or JSON) and then execute the success or error callbacks object
         * @see <a href="#guidebridge-api-usage" >GuideBridge API Usage</a>
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @example
         * guideBridge.getData({
         *     success : function (guideResultObject) {
         *          console.log("data received" + guideResultObject.data);
         *     }
         *     error : function (guideResultObject) {
         *          console.error("API Failed");
         *          var msg = guideResultObject.getNextMessage();
         *          while (msg != null) {
         *              console.error(msg.message);
         *              msg = guideResultObject.getNextMessage();
         *          }
         *     }
         * });
         */
        getData : function (options) {
            options = options || {};

            /* Earlier this API would support boundData for getting data tro be merged in PDF. Now that flag has been renamed to dorData
             *  Earlier, boundData flag now maps to boundData for backward compatibility.
             * */
            options.dorData = options.boundData;

            var resultObject = new GuideResultObject();
            if (!options.guideState && !this._checkGuide(resultObject)) {
                options.error.call(options.context, resultObject);
                return;
            }

            this._submitInternal({
                success : function (data) {
                    var resultJson = data || {};
                    resultObject.completed = true;
                    if (options.dorData) {
                        resultObject.data = resultJson["dorDataXml"];
                    } else {
                        resultObject.data = resultJson["data"];
                    }
                    if (_.isFunction(options.success)) {
                        options.success.call(options.context, resultObject);
                    }
                },
                error : function (xhr, txtStatus, errorThrown) {
                    var msg = "Error in getData API";
                    resultObject.completed = false;
                    resultObject.addMessage(2, msg, "");
                    if (_.isFunction(options.error)) {
                        options.error.call(options.context, resultObject);
                    }
                },
                guideState : options.guideState,
                async : options.async,
                fileUploadPath : options.fileUploadPath,
                excludeFormState : options.excludeFormState || false});
        },

        /**
         * @summary Hides all the submit buttons present in the Adaptive Form
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors|errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideSubmitButtons : function () {
            return this._hideElements("guideButton", "submit");
        },

        /**
         * This API is designed to evaluate the expression entered by the author.
         * This API is given only to enable Auto Save meta information use case.
         * @returns value obtained after executing the expression.
         * @method
         * @private
         * @memberof GuideBridge
         * @deprecated since 6.3 this API is deprecated
         */
        _evaluateExpression : function (expression) {
            if (this._guide) {
                var compiledExpression = this._guide._compileExpression(expression, null);
                return compiledExpression.apply(this);
            }
        },

        /**
         * Adaptive Form can be configured to save draft automatically. This property indicates whether Adaptive Form is
         * configured to save draft automatically or not.
         *
         * Enabling auto save doesn't mean that AF will create the draft when the Form is loaded. Based on the result of
         * **Auto save start expression** the draft will be created. Once the expression returns true, drafts will be
         * saved at regular interval or at specific events as configured.
         *
         * @summary Whether autoSave is enabled for this Adaptive Form or not
         * @returns {boolean} true if auto save is enabled otherwise false.
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.1 FP1
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/auto-save-an-adaptive-form.html|Saving an adaptive Form}
         */
        getAutoSaveEnabledStatus : function () {
            return window.guideBridge._guide.enableAutoSave;
        },

        /**
         * This API indicates that auto save is enabled and draft is being saved at the configured location.
         * @summary Whether Adaptive Form data is being saved as draft or not.
         * @returns {Boolean} whether autoSave has started.
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.1 FP1
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/auto-save-an-adaptive-form.html|Saving an adaptive Form}
         **/
        hasAutoSaveStarted : function () {
            return this._guide && this._guide.enableAutoSave && this._guide.autoSaveStart;
        },

        /**
         * @summary the autoSaveinfo that is stored at the guideContainer.
         * @returns {object} object contains the additional meta information stored along with form data
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.1 FP1
         * @deprecated since 6.3
         */
        getAutoSaveInfo : function () {
            return this._guide.autoSaveInfo;
        },

        /**
         * The API is used to provide extra information to be saved in Final data XML. It can also be used to retrieve
         * that information.
         *
         * If _value_ is null then the value of the _property_ is returned
         * @summary store or retrieve submission related information
         * @param {string} property name of the property against which to save the value or retrieve the value of
         * property
         * @param {string} [value] value to save.
         * @returns {*} old value of the property
         * @method
         * @since 6.1 FP1
         * @memberof GuideBridge
         * @instance
         * @deprecated since 6.3
         */
        afSubmissionInfo : function (property, value) {
            var afSubmissionInfo = guidelib.runtime.guideContext.afSubmissionInfo || {};
            if (_.isUndefined(value)) {
                return afSubmissionInfo[property];
            } else {
                var oldValue = afSubmissionInfo[property];
                afSubmissionInfo[property] = value;
                guidelib.runtime.guideContext.afSubmissionInfo = afSubmissionInfo;
                return oldValue;
            }
        },

        /**
         * @summary this API returns the globalMetaInfo stored in global context (in globalMetaInfo tab).
         * @returns {object}
         * @method
         * @memberof GuideBridge
         * @instance
         * @deprecated since 6.3
         */
        getGlobalMetaInfo : function () {
            return this._guide.globalMetaInfo;
        },

        /**
         * @summary this API returns the metadata configured for submission. Value depends on the selection of metadata
         * type, local or global.
         * @returns {Object}
         * @method
         * @since 6.1 FP1
         * @memberof GuideBridge
         * @instance
         * @deprecated since 6.3
         */
        getSubmissionMetadataInfo : function () {
            if (this._guide.submissionMetaInfo && this._guide.submissionMetaInfo.metadataselector === LOCAL_METADATA_SELECTOR) {
                // In order to maintain backward compatibility, this piece of code will always be here.
                // For the cases where metadata selection is being configured for submit actions
                return getOrElse(this._guide, "submissionMetaInfo.metadata", null);
            } else {
                //From 6.2 onwards, we are asking author to provide metadata only at one place, which is global to whole form
                // In case, metadataselector's value is "global" or not configured at all, this block will get executed
                return getOrElse(this._guide, "globalMetaInfo.metadata", null);
            }
        },

        /**
         * @summary returns the globalMetaInfo object after all the computation. This object will be set in guideContext for submission
         * @returns {object} In a format {"key 1": computation result of registered expression, "key 2":...}
         * @method
         * @since 6.1 FP1
         * @memberof GuideBridge
         * @instance
         * @example
         * {
         *   "key 1": computation result of registered expression,
         *   ...
         * }
         * @deprecated since 6.3
         */
        getComputedSubmissionMetadata : function () {
            var computedMetadata = {},
                metadata = this.getSubmissionMetadataInfo();
            if (metadata) {
                if (_.isObject(metadata)) {
                    for (var key in metadata) {
                        try {
                            var currentMetadata = JSON.parse(metadata[key]);
                            computedMetadata[currentMetadata["key"]] = this._guide._compileExpression(currentMetadata["value"])();
                        } catch (exception) {
                            if (this._guide) {
                                this._guide.logger().log(exception);
                            }
                        }
                    }
                } else if (_.isString(metadata)) {
                    try {
                        var currentMetadata = JSON.parse(metadata);
                        computedMetadata[currentMetadata["key"]] = this._guide._compileExpression(currentMetadata["value"])();
                    } catch (exception) {
                        if (this._guide) {
                            this._guide.logger().log(exception);
                        }
                    }
                }
            }
            return computedMetadata;
        },

        /**
         * The API enables auto save in Adaptive Form
         * @summary  enable auto save in Adaptive Form.
         * @param value {boolean} true to enable auto save otherwise false.
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.1 FP1
         * @see {@link GuideBridge#getAutoSaveEnabledStatus|getAutoSaveEnabledStatus}
         * @see {@link https://helpx.adobe.com/aem-forms/6-1/auto-save-an-adaptive-form.html|Auto Save an Adaptive Form}
         */
        setEnabledAutoSave : function (value) {
            this._guide.enableAutoSave = value;
        },

        /**
         * @summary Hides all the file attachment listing buttons present in the Adaptive Form
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideFileAttachmentListingButtons : function () {
            return this._hideElements("guideListFileAttachmentButton");
        },

        /**
         * @todo: Function can change as per usecase, it can behave as a wrapper
         * where it can use the configuration provided through registerConfig and invoke any callback if required
         *
         * @returns {boolean} boolean indicating whether Adaptive Form is offline
         * @private
         */
        isOffline : function () {
            return checkAFOffline;
        },

        /**
         * function to set the status of Adaptive Form (online or offline)
         * @type {boolean}
         * @private
         */
        setIsOffline : function (value) {
            checkAFOffline = value ;
        },

        /**
         * @summary Hide all the File Attachment component present in the Adaptive Form
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideFileAttachments : function () {
            return this._hideElements("guideFileUpload");
        },

        /**
         * @summary Hides the global toolbar of the Adaptive Form.
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideGlobalToolbar : function () {
            var resultObject = new GuideResultObject(),
                $toolbar;

            // If guide dom not initialized, return
            if (!this._checkGuide(resultObject)) {
                return resultObject;
            }

            if (guidelib.runtime.guide.toolbar) {
                $toolbar = this._getGuideDomElement(guidelib.runtime.guide.toolbar.somExpression);
                if ($toolbar && $toolbar.length > 0) {
                    $toolbar.hide();
                }
            }

            resultObject.completed = true;
            return resultObject;
        },

        /*
         *
         * This API is designed to return all the toolbar buttons present in the Adaptive Form(except submit, save, reset and file attachment listing)
         *
         * @returns {GuideResultObject} data contains an array of all the tool bar buttons available(except submit, save, reset and file attachment listing)
         * Each element of data property is an object holding model and html property.
         * The html string does not contain any script tags, this is to avoid crosss site scripting attacks
         */
        /*
         getToolbarButtons : function(){
         var resultObject = new GuideResultObject(),
         resultData = [],
         $elem = null;
         // If guide dom not initialized, return
         if (!this._checkGuide(resultObject)) {
         return resultObject;
         }
         resultObject.completed = true;
         this.visit(function(node){
         // Check if this node is a guide button and if it resides inside a guideToolBar
         if(node.className === "guideButton" && node.parent.className === "guideToolbar"){
         if(node.type !== "submit" && node.type !== "save" && node.type !== "fileattachmentlisting" && node.type !== "next" && node.type !=="prev") {
         $elem =  this._getGuideDomElement(node.somExpression);
         // Remove the script tag from the $html, we don't support execution of Adaptive Form Scripts in parent or other domain
         // This is to avoid cross site scripting attacks
         $elem.find("script").remove();
         resultData.push({
         "model" : node,
         "html"  : $elem.html()
         });
         }
         }
         });
         resultObject.data = resultData;
         return resultObject;
         }, */

        /**
         * @summary Hides all the save buttons present in the Adaptive Form
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideSaveButtons : function () {
            return this._hideElements("guideButton", "save");
        },

        /**
         * @summary Hides all the reset buttons present in the Adaptive Form
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.3
         */
        hideResetButtons : function () {
            return this._hideElements("guideButton", "reset");
        },

        /**
         * The API can be used to retrieve the value of a specific property for a list of AF components. If the property
         * doesn't exists for a component then the corresponding value in the resulting array will be null.
         *
         * The {@link GuideResultObject#data|data} element of the return object will be an array containing the values
         * of the _property_ for each component in the list of components
         *
         * The API fails if the Form is not initiailzed
         *
         * **_Note:_** If a somExpression provided doesn't points to a valid {@link GuideNode} null is returned for
         * that element and an error message is added in the returned object
         * @summary returns the value of a specific property for a set of Adaptive Form Components
         *
         * @param {object} options input object containing the propertyName and the list of components
         * @param {string} options.propertyName name of the property whose value has to be returned
         * @param {string[]} options.somExpression list of somExpression of the components for which the value is to be
         * returned.
         *
         * @returns {GuideResultObject} The {@link GuideResultObject#data|data} member of the object contains the property
         * values
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @deprecated since 6.3
         * @see GuideNode#somExpression
         * @example
         * var result = guideBridge.getElementProperty({
         *    propertyName: "value",
         *   somExpression: ["somExpression1", "somExpression2"]
         * });
         * if (result.errors) {
         *      console.log("some som expressions were invalid");
         *      var err = result.getNextMessage();
         *     while(err != null) {
         *          //err.somExpression will point to the invalid somExpression in the Field.
         *          console.log(err.message);
         *     }
         * }
         * for(var i = 0; i< result.data.length; i++) {
         *      console.log(result.data[i]);
         * }
         */
        getElementProperty : function (options) {
            var somExpressions = options.somExpressions;
            var propertyName = options.propertyName;
            var resultObject = new GuideResultObject();
            if (!this._checkGuide(resultObject)) {
                return resultObject;
            }
            resultObject.data = [];
            for (var i = 0; i < somExpressions.length; i++) {
                var element = this.resolveNode(somExpressions[i]);
                if (element == null) {
                    resultObject.addMessage(0, "No element " + somExpressions[i] + " exists", somExpressions[i]);
                    resultObject.data.push(null);
                } else {
                    resultObject.completed = true;
                    resultObject.data.push(element[propertyName]);
                }
            }
            return resultObject;
        },

        _getGuideDomElement : function (somExpression, option) {
            if (this._guideView) {
                return this._guideView._getGuideDomElement(somExpression, option);
            } else {
                return null;
            }
        },

        getTempPath : function () {
            return "/tmp/fd/af/" + this._getUUID();
        },

        /**
         * File Attachment object
         * @typedef {object} GuideBridge~FileAttachementObject
         * @property {string} name name of the uploaded File
         * @property {string} path path of the uploaded File
         * @memberof GuideBridge
         * @since 6.0
         */
        /**
         * Success callback that is called from {@link GuideBridge#getFileAttachmentsInfo} with the list of File
         * Attachments
         * @callback GuideBridge~FileAttachmentInfoHandler
         * @param {GuideBridge~FileAttachementObject[]} fileAttachementList list of file attachement objects uploaded
         * in the Form
         */
        /**
         * The API provides a list containing File Names and File URLS for the Files Attached by the user using the
         * File Attachment component. The API is a asynchronous API and takes success handler which is called with
         * the list of File Names and URLs.
         *
         * @param {object} options Object containing the callback which will be invoked with the result of this API
         * @param {function} options.success success callback which will be invoked. The signature of the callback should
         * match the signature of {@link GuideBridge~FileAttachmentInfoHandler|FileAttachmentInfoHandler}
         * @param {object} [options.context] _this_ parameter in the success handler will point to this object
         *
         * @example  <caption>Example usage of the getFileAttachmentsInfo API</caption>
         * guideBridge.getFileAttachmentsInfo({
         *        success:function(list) {
         *             for(var i = 0; i< list.length; i++) {
         *                  console.log(list[i].name + " "+ list[i].path);
         *             }
         *        }
         * });
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         */
        getFileAttachmentsInfo : function (options) {
            var fileAttachmentsList = [],
                list;

            this._getFileAttachmentsList(fileAttachmentsList);
            function collectFileUrls(event) {
                list = [];
                //TODO: need to modularize collectFileUrs()
                // here this is the context of the function who calls it
                _.each(this.attachments, function (att) {
                    list.push({name : att.split("/")[1], path : this.fileUrl + "/" + att});
                }, this);
                if (this.options.success) {
                    this.options.success.call(this.options.context, list);
                }
            }

            this._getGuideAttachments(fileAttachmentsList, this.getTempPath(), collectFileUrls, options);
        },

        /**
         *
         * @param fileAttachmentsList File Attachments Models in the form
         * @param fileUploadPath server url where to upload the file
         * @param {function} callback callback if files are uploaded, the callback will be passed an object having the following
         *        syntax
         *        {
         *           attachments : array containing the file names,
         *           fileUrl : array containing the file urls,
         *           fileAttachmentsList : fileAttachmentsList,
         *           options : options object passed to this function,
         *           obj : value of obj key passed in the options object
         *        }
         * @param options options to be passed to the callback
         * @private
         * @memberof GuideBridge
         * @since 6.0
         */
        _getGuideAttachments : function (fileAttachmentsList, fileUploadPath, callback, options) {

            var fileDoms = [],
                fileNames = [],
                fileUrl = null,
                didSubmit = false,
                contextRoot = this._getContextRoot(),
                fileNameDomMap;

            // In the case of draft, url comes with context root. Need to remove it so that correct
            // value gets stored in model
            if (contextRoot) {
                if (fileUploadPath.indexOf(contextRoot) === 0) {
                    fileUploadPath = fileUploadPath.substring(contextRoot.length);
                }
            }
            // File attachment list is an array containing the list of file attachments
            if (fileAttachmentsList.length > 0) {
                fileNameDomMap = this._juiceOutNameAndFileDomMap(fileAttachmentsList);
                fileDoms = fileNameDomMap.fileDom;
                fileNames = fileNameDomMap.fileName;
                if (fileDoms.length > 0) {
                    // since there can be a dom element which is null, in case of draft reload, get the first
                    // non null file dom
                    var firstNonNullFileDom = _.indexOf(fileDoms, _.find(fileDoms, function (item) {
                        return item !== null;
                    }));
                    // fileUploadPath doesn't contain the context path and hence we need to to pass the baseURL
                    // FileUploader takes a _getUrl option which is baseUrl/contextPath
                    if (firstNonNullFileDom !== -1) {
                        uploaderPluginName = guideBridge.userConfig.uploaderPluginName || "adobeFileUploader";
                        fileUrl = fileDoms[firstNonNullFileDom][uploaderPluginName]("uploadFile", {
                            'fileName' : fileNames,
                            'fileDom' : fileDoms,
                            'fileUploadPath' : fileUploadPath,
                            'multiple' : true,
                            _getUrl : guideBridge._getUrl("")
                        });

                        // The file url returned by file upload widget can contain context root.
                        // Remove it so that correct value gets stored in model.
                        if (contextRoot) {
                            if (fileUrl.indexOf(contextRoot) === 0) {
                                fileUrl = fileUrl.substring(contextRoot.length);
                            }
                        }

                        fileDoms[firstNonNullFileDom].one("adobeFileUploader.multipleFileUploaded",
                            $.proxy(callback,  {
                                "attachments" : fileNames,
                                "fileUrl" : fileUrl,
                                "fileAttachmentsList" : fileAttachmentsList,
                                "options" : options
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
                    "attachments" : fileNames,
                    "fileUrl" : fileUrl,
                    "fileAttachmentsList" : fileAttachmentsList,
                    "options" : options
                });
            }
        },
        /**
         * Iterates over all the components in the Adaptive Form and invokes its {@link GuideNode#visit|visit} method
         * passing the _callback_ to the API.
         *
         * @summary Traverse all the components in the Adaptive Form and invoke callback function for each of the
         * component
         * @param {function} callback Function to be called for every Adaptive Form Component present
         * in the Form. The signature of the callback matches the signature of
         * {@link GuideNode~VisitorCallback|VisitorCallback}
         * @param {object} [context=window] _this_ object in the callback will point to this object
         *
         * @example <caption>Creating a list of all components having name <i>testName</i></caption>
         * var myList = []
         * guideBridge.visit(function(cmp) {
         *     if(cmp.name === "testName") {
         *          myList.push[cmp];
         *     }
         * }};
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         */
        visit : function (callback, context) {
            this._guide.visit(callback, context || window);
        },

        /**
         *
         * Hides the elements of the specified class name.
         * In case of guideButton, it checks for type too, if no type is specified in "guideButton", then that button
         * cannot be made hidden
         *
         * @param className String representing the classname of the node
         * @param type [optional] type will be used only if the classname is "guideButton"
         * @private
         */
        _hideElements : function (className, type) {
            var resultObject = new GuideResultObject();
            // If guide dom not initialized, return
            if (!this._checkGuide(resultObject)) {
                return resultObject;
            }
            resultObject.completed = true;
            this.visit(function (node) {
                // if the class name is guide button only the use the type
                if (node.className === "guideButton") {
                    if (node.type === type) {
                        node.visible = false;
                    }
                } else {
                    // else just compare the classname and hide it
                    if (node.className === className) {
                        node.visible = false;
                    }
                }
            });
            return resultObject;
        },

        /**
         * In Adaptive Form there is a summary component to show the summary of submission. This API hides the parent
         * panel of the summary component. If the component is not present inside the Form, this operation doesn't do
         * anything
         * @summary Hides the panel that contains the summary component.
         *
         * @returns {GuideResultObject} the data property of GuideResultObject would be undefined. The API will fail if
         * the Form is not initialized which would be indicated by the {@link GuideResultObject#errors} property.
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        hideSummaryPanel : function () {
            var resultObject = new GuideResultObject();
            // If guide dom not initialized, return
            if (!this._checkGuide(resultObject)) {
                return resultObject;
            }
            resultObject.completed = true;
            this.visit(function (node) {
                if (node.className === "guideNode" && node.jsonModel['sling:resourceType'] === "fd/afaddon/components/summary") {
                    node.panel.visible = false;
                }
            });
            return resultObject;
        },

        _getFileAttachmentsList : function (fileAttachmentsList) {
            if (_.isUndefined(fileAttachmentsList)) {
                fileAttachmentsList = [];
            }
            this.visit(function (node) {
                if (node.className === "guideFileUpload") {
                    fileAttachmentsList.push(node);
                }
            });
            return fileAttachmentsList;
        },

        /**
         * @summary the captchaData which will be submitted to server for validation purposes.
         * @param captchaModel
         * @returns {object} object contains the captchaData which includes captcha service provider name, its SOM exp and
         * data coming from OOTB/third-party captcha widget.
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.3
         */
        _getCaptchaData : function (captchaModel) {
            if (captchaModel) {
                return {
                    serviceType : captchaModel.captchaService,
                    somExpression : captchaModel.somExpression,
                    validationMessage : captchaModel.validateExpMessage,
                    mandatoryMessage : captchaModel.mandatoryMessage,
                    data : captchaModel.value
                };
            }
            return {};
        },

        /**
         * This function returns the additional action Field information that is required during submit.
         *
         * @returns {object} object having the action Field information.
         * @memberof GuideBridge
         */
        _getAdditionalSubmitInfo : function () {
            var additionalSubmitInfo = {},
                actionFieldDiv = $("#actionField");
            var thankYouPage = this._getThankYouPageFromConfig();
            if (typeof thankYouPage === "string") {
                document.getElementById(":redirect").value = thankYouPage;
            }
            var actionFields = actionFieldDiv.find('input')
                .each(function () {
                    additionalSubmitInfo[$(this).attr("name")] = $(this).val();
                    if ($(this).attr("name") == "_guideValueMap" && $(this).val() == "yes") {
                        var guideKeyValue = {};
                        window.guideBridge._guide._collectValues(guideKeyValue);
                        additionalSubmitInfo['_guideValuesMap'] = JSON.stringify(guideKeyValue);
                    }
                });
            return additionalSubmitInfo;
        },

        /**
         * Gets the guideDom based on whether reducedJSON option is true or not.
         * If reducedJSON is true, only the white-listed properties are included.
         *
         * @returns {object} guideDom
         * @memberof GuideBridge
         */

        _getGuideDom : function (options) {
            var guideDom;
            if (options.reducedJSON) {
                guideDom = guideBridge._guide._getReducedJSON();
            } else {
                guideDom = guideBridge._guide.jsonModel;
            }
            return guideDom;
        },

        /**
         * Creates the guideState and the liveXml.
         *
         * @param options {object} options should contain a GuideResultObject [{obj:"<GuideResultObject type>"}]
         * @memberof GuideBridge
         * Steps performed by the function -
         * 1) creates the xfaState
         * 2) creates the guideState that consists of guideDom, guideContext and additionalSubmitInfo
         * 3) creates guideLiveData
         * 4) adds xfaState and guideLiveData to the guideState
         *
         * @private
         */
        _createGuideStateAndLiveXml : function (options) {
            var obj = new GuideResultObject();
            // add the guideResultObject to options so that it can be passed to the success handler
            options.obj = obj;

            if (!this._checkGuide(obj)) {
                return;
            }

            obj.data = {};
            var xfaState = null;
            if (this._isXfaGuide() && this._isValidXFAGuide()) {
                var xfaResultObject = null;
                if (options.reducedJSON) {
                    //If reduceJson is asked, then xfaState should also be reduced by passing the diff and bSubmit flag to true
                    xfaResultObject = window.formBridge.getFormState(true, true);
                } else {
                    xfaResultObject = window.formBridge.getFormState();
                }
                if (xfaResultObject.errors) {
                    guideBridge._guide.logger().log("Error in getting Xfa State:" + JSON.stringify(xfaResultObject.getNextMessage()));
                    alert(guidelib.util.getLocalizedMessage("AF", guidelib.i18n.LogMessages["AEM-AF-901-001"]));
                }
                xfaState = xfaResultObject.data;
            }

            var guideDom = guideBridge._getGuideDom(options);

            //adding additionalSubmitInfo in the guideState.
            //additionalSubmitInfo contains the information about action fields.
            var additionalSubmitInfo = guideBridge._getAdditionalSubmitInfo();

            var guideState = {
                guideDom : guideDom,
                //save renderContext in guide state to enable deferred submit even if guide is not open
                guideContext : guidelib.runtime.guideContext,
                additionalSubmitInfo : additionalSubmitInfo
            };

            if (guideBridge._guide.allLazyChildren.length > 0) {
                guidelib.internal.liveDataUtils.updateLiveData();
                var listOfDirtyPanels = guidelib.internal.GuideDirtyMarkerAndVisitor.flattenDirtyPanelMapToCSV();
                if (listOfDirtyPanels.length > 0) {
                    this.afSubmissionInfo("afDraft", JSON.stringify(listOfDirtyPanels));
                }
                // save live xml & xfa state as xml for restoration of lazy model on 'restore'
                guideState.guideLiveData = guidelib.internal.liveDataUtils.getLiveDataStr();
                if (this._isXfaGuide() && this._isValidXFAGuide()) {
                    function saveXfaXml(xfaResultObj) {
                        if (!xfaResultObj.errors && xfaResultObj.completed) {
                            xfaState.currentContext = {'data' : xfaResultObj.data};
                        }
                    }

                    formBridge.getDataXML({"success" : saveXfaXml}); // currently xfa restore relies on formBridge.getDataXML being sync
                }
            }
            obj.data.guideState = guideState;
            if (xfaState) {
                obj.data.guideState.xfaState = xfaState;
            }

        },

        /**
         * Adaptive Form stores its state in the form of JSON. The JSON contains the state of all the Adaptive Form
         * components, their values, visibility and other properties. The Files attached in the component are uploaded
         * onto the server and their paths are returned in the JSON state except in certain conditions mentioned below.
         * The API is an asynchronous call which calls the success and error handlers with the data.
         *
         * In the below mentioned scenarios the file will not be uploaded
         * * User doesn't have **write permissions** on the _fileUploadPath_ provided
         * * The _fileUploadPath_ property doesn't point to a node of type _**sling:Folder**_
         *
         * @summary Retrieve the current state of Adaptive Form as json string
         * @param {object} options Input object containing the callbacks that will be invoked
         * to provide the result of the API
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success.
         * {@link GuideResultObject#errors|errors} property as false.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object
         * @param {string} [options.fileUploadPath] controls whether the files in the File Attachment component have to be
         * uploaded or not. If _fileUploadPath_ is non null, only then file gets uploaded and the model's value is
         * updated with the file url
         *
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         */
        getGuideState : function (options) {

            var fileAttachmentsList = [];

            // walk through the model to get the list of file attachment components
            // do this only and only if login!= anonymous
            if (!guideBridge._disablePreview()) {
                this._getFileAttachmentsList(fileAttachmentsList);
            }

            if (!guidelib.runtime.progressive && guideBridge.isGuideLoaded(true)) {
                this.customContextProperty("lastFocusItem", this._guideView.getSomOnNavigableAncestor(this._guideView._previousFocusItemSom));
                this.afSubmissionInfo("lastFocusItem", this._guideView.getSomOnNavigableAncestor(this._guideView._previousFocusItemSom));
            }

            // Let's add all the submission info
            // Add the computed meta data field
            this.afSubmissionInfo("computedMetaInfo", guideBridge.getComputedSubmissionMetadata());
            this.afSubmissionInfo("excludeFromDoR", guideBridge._guide._getExcludeFromDorMap());

            // Add signers to af submission info
            this.afSubmissionInfo("signers", guideBridge._guide._getSigners());

            // Walk through the list of file Attachment components
            // and update the value of every item
            // Get the list of file Attachments
            if (options.fileUploadPath && !guideBridge._disablePreview()) {
                this._getGuideAttachments(fileAttachmentsList, options.fileUploadPath, window.guideBridge._collectFileUrls, options);
            } else {
                this._createGuideStateAndLiveXml(options);
                if (options.success) {
                    options.success.call(options.context, options.obj);
                }
            }

        },

        /**
         * Validates the Adaptive Form or it's specific panel and return the validation status. The API also moves
         * focus to first invalid element
         * @summary validate the entire Form or a component in Adaptive Form
         * @param  {Field~ValidationError[]} errorList Input must be an empty array. The array will be filled with list
         * of Adaptive Form Components that failed validation.
         * @param  {string} [somExpression] SOM Expression of the Guide Node for which validation should be triggered.
         * If not provided, it would validate the entire Adaptive Form
         * @param {boolean} [setFocus=true] If true, set focus to the first invalid element.
         * @returns {boolean} true if the component/form was valid, false otherwise
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @see Field#validate
         * @see Panel#validate
         */
        validate : function (errorList, somExpression, setFocus) {
            var guideNode = null,
                isFocusEnabled = _.isUndefined(setFocus) ? true : setFocus,
                ec = guidelib.util.ErrorConstants,
                validationContext;
            //  get Json of all the dirty , non visited (templateJson missing from cache)
            if (this._guide.allLazyChildren.length > 0) {
                this._guide.guideLazyUtil.putDirtyToTemplateCacheIfMissing();
            }
            if (somExpression) {
                guideNode = this.resolveNode(somExpression);
                // how to know if the panel is navigable from the model. We do not bring the nonNavigable property ?
                if (guideNode instanceof guidelib.model.GuidePanel) {
                    validationContext = ec.CONTEXT_NAVIGATION;
                }
            } else {
                guideNode = this._guide;
                validationContext = ec.CONTEXT_SUBMISSION;
            }
            this.setValidationContext(validationContext);
            var status = false;
            if (!errorList) {
                errorList = [];
            }
            status = guideNode.validate(errorList);

            try {
                // there can be errors in the user script, hence handling the exception gracefully, and resetting the global error state properly
                this._guide._triggerOnBridge("validationComplete", this._guide, status, "", errorList);
                if (!status && isFocusEnabled) {
                    var errorSom = errorList[0]["som"];

                    guideBridge._guide.on(guidelib.event.GuideModelEvent.LAZY_LOADED, function () {
                        var errorField = guideBridge.resolveNode(errorSom);
                        if (errorField) {
                            errorField.validate();
                        }
                    }, {});

                    this.setFocus(errorSom);

                    guideBridge._guide.off(guidelib.event.GuideModelEvent.LAZY_LOADED);
                }

            } catch (exception) {
                this._guide.logger().log(exception);
            } finally {
                // since the errors have been published reset the state back to normal
                //guidelib.runtime.errorManager.setGlobalError(false);
                this.unsetValidationContext(validationContext);
                return status;
            }

        },

        // todo: submit behaviour should make sure that if the value of file upload
        /**
         * Adaptive Form can be restore in three ways
         * * by passing the JSON data obtained from {@link GuideBridge#getGuideState}. This can be done by setting
         * _**data**_ property .
         * * by passing a URL pointing to a resource that returns JSON/XML data that should be used. This can be done by setting
         * _**dataRef**_ property. The data can be obtained by calling the
         * {@link GuideBridge#getData|getData} API.
         * * by passing a URL pointing to a resource that returns JSON data obtained from {@link GuideBridge#getGuideState}.
         * This can be done by setting _**guideStatePathRef**_ property .
         *
         * When restoring from dataRef, only values and other properties, that are dependant on value, are restored. For
         * example, If a Field was hidden based on the click of a Button then
         * when restoring from data XML/JSON the Field will not remain hidden.
         *
         * **NOTE:** The _data_, _dataRef_ and _guideStatePathRef_ must not be null simultaneously and only one property
         * must be specified. Specifying more than one can lead to undesired results.
         * @summary restore/prepopulate the state of Adaptive Form from an earlier saved state
         * @param {object} options object containing the callbacks to be invoked on
         * success/failure and data from where to restore the object.
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success
         * {@link GuideResultObject#errors|errors} property as false.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object.
         * @param {object} [options.data] It must be the value of the {@link GuideResultObject#data|data} property passed to
         * the _success_ handler of {@link GuideBridge#getGuideState|getGuideState} API.
         * @param {string} [options.dataRef] URL pointing to the data XML/JSON.
         * @param {string} [options.guideStatePathRef] URL pointing to the JSON state of Adaptive Form.
         *
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @example <caption>Restoring from JSON data</caption>
         * var jsonData;
         * guideBridge.getGuideState({
         *      success : function (guideResultObj) {
         *          jsonData = guideResultObj.data;
         *      },
         *      error : function (guideResultObj) {
         *          // log error
         *      }
         * });
         *
         * // after some time or on click of a button or reloading the page
         * guideBridge.restoreGuideState({
         *      guideState : jsonData.guideState,
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         *
         * @example <caption>Restoring from data XML/JSON</caption>
         * guideBridge.getData({
         *      success : function (guideResultObj) {
         *          var data = guideResultObj.data;
         *          //post the data to a server that saves it at say http://abc.com/my/data.xml
         *          //or http://abc.com/my/data.json
         *      },
         *      error : function (guideResultObj) {
         *          // log the errors
         *      }
         * });
         *
         * // after some time or on click of a button or reloading the page
         * guideBridge.restoreGuideState({
         *      dataRef : "http://abc.com/my/data.xml",
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         *
         * @example <caption>Restoring from URL to a JSON</caption>
         * guideBridge.getGuideState({
         *      success : function (guideResultObj) {
         *          var json = guideResultObj.data;
         *          //post the JSON to a server that saves it at say http://abc.com/my/data.json
         *      },
         *      error : function (guideResultObj) {
         *          // log the errors
         *      }
         * });
         *
         * // after some time or on click of a button or reloading the page
         * guideBridge.restoreGuideState({
         *      guideStatePathRef : "http://abc.com/my/data.json",
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         **/
        restoreGuideState : function (options) {
            var parameters,
                path;
            if (options && options.dataRef) {
                parameters = {"dataRef" : options.dataRef};
            } else if (options && options.guideStatePathRef) {
                parameters = {"guideStatePathRef" : options.guideStatePathRef};
            }
            // if parameters have DataRef or guideStatePathRef, a recursive call is made to restoreGuideState.
            if (parameters) {
                path = window.guideBridge.getGuidePath();
                path = path + ".guidejson";
                $.ajax({
                    url : path,
                    type : "GET",
                    async : false,
                    cache : false,
                    data : parameters,
                    success : function (response) {
                        //case where section information exist in guideState
                        if (response.guideState && response.guideState.guideContext
                            && response.guideState.guideContext.customPropertyMap
                            && response.guideState.guideContext.customPropertyMap.sections
                            && response.guideState.guideContext.customPropertyMap.sections.length > 0) {
                            // todo: add safe check for string vs array
                            window.guideBridge.customContextProperty.sections = response.guideState.guideContext.customPropertyMap.sections;
                        }
                        //passing the options again, but with DataRef or guideStatePathRef removed from it.
                        window.guideBridge.restoreGuideState(_.extend(
                            {},
                            options,
                            {
                                guideState : response.guideState,
                                dataRef : undefined,
                                guideStatePathRef : undefined
                            }
                        ));
                        if (guidelib.runtime.progressive) {
                            // Initialize the progressive
                            // We are not directly playing json on the model, since may be the json of entire progressive is not brought upfront
                            // Only in case of static service, we bring the entire json, hence creating model if not present
                            guidelib.runtime.progressive._initializeSectionModelAndPlayJson(window.guideBridge.customContextProperty.sections);

                            // Now render the last section
                            guidelib.runtime.progressive.renderLastSection();
                        }
                    },
                    error : function (response) {
                        window.guideBridge._guide.logger().log("Error: " + response);
                    }
                });
                return;
            }

            /*
             * We have to merge the runtime guideContext with the guideContext passed in the guideState
             * so that no custom properties that were set in the guideState.guideContext are ignored.
             */
            guidelib.runtime.guideContext = guidelib.runtime.guideContext || {};
            _.extend(guidelib.runtime.guideContext, options.guideState.guideContext);

            if (!this._guide) {
                this.storage = {};
                this.storage.guideState = options.guideState;
                //NOCHECKMARX - This is error callback to be provided by the user of this API.
                this.storage.error = options.error;
                this.storage.success = options.success;
                this.storage.context = options.context;
            } else {
                this._playGuideJson(options);
                // Trigger the event
                // If guide has restore state, call sync guide node to html
                // Case 1: If this is called before view gets initialized, there would be no listener present, hence nothing would happen
                // Case 2: If it is called after view gets initialized(using restore guide state in mobile workspace), then the model would sync to view
                // using this event
                // If view is initialized, which means a listener would to MODEL_REFRESH would be set, hence just trigger the event for execution
                if (this._guideView) {
                    this._guide._triggerEvent(guidelib.event.GuideModelEvent.MODEL_REFRESH, "jsonModel", null, null);
                }
            }

        },

        /**
         * Adaptive Form can set data in three ways:
         * * by passing the JSON data obtained from {@link GuideBridge#getGuideState}. This can be done by setting
         * _**data**_ property .
         * * by passing a URL pointing to a resource that returns data JSON/XML that should be used. This can be done by setting
         * _**dataRef**_ property. The data can be obtained by calling the
         * {@link GuideBridge#getData|getData} API.
         * * by passing a URL pointing to a resource that returns JSON data obtained from {@link GuideBridge#getGuideState}.
         * This can be done by setting _**guideStatePathRef**_ property .
         *
         * When setting data from dataRef, only values and other properties, that are dependant on value, are set. For
         * example, If a Field was hidden based on the click of a Button in the data passed then
         * when setting data from XML/JSON the Field will not remain hidden.
         *
         * **NOTE:** The _data_, _dataRef_ and _guideStatePathRef_ must not be null simultaneously and only one property
         * must be specified. Specifying more than one can lead to undesired results.
         * @summary Populate the Adaptive Form from the data.
         * @param {object} options object containing the callbacks to be invoked on
         * success/failure and data from where to restore the object.
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success
         * {@link GuideResultObject#errors|errors} property as false.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object.
         * @param {object} [options.data] It must be the value of the {@link GuideResultObject#data|data} property passed to
         * the _success_ handler of {@link GuideBridge#getGuideState|getGuideState} API.
         * @param {string} [options.dataRef] URL pointing to the data JSON/XML.
         * @param {string} [options.guideStatePathRef] URL pointing to the JSON state of Adaptive Form.
         *
         * @method
         * @memberof GuideBridge
         * @since 6.3
         * @instance
         * @example <caption>Setting data from JSON data</caption>
         * var jsonData;
         * guideBridge.getGuideState({
         *      success : function (guideResultObj) {
         *          jsonData = guideResultObj.data;
         *      },
         *      error : function (guideResultObj) {
         *       // log the errors
         *      }
         * });
         *
         * guideBridge.setData({
         *      guideState : jsonData,
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         *
         * @example <caption>Setting data from XML/JSON</caption>
         * guideBridge.getData({
         *      success : function (guideResultObj) {
         *          var data = guideResultObj.data;
         *          //post the XML/JSON to a server that saves it at say http://abc.com/my/data.xml
         *          //or http://abc.com/my/data.json
         *      },
         *      error : function (guideResultObj) {
         *          // log the errors
         *      }
         * });
         *
         * guideBridge.setData({
         *      dataRef : "http://abc.com/my/data.xml",
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         *
         * @example <caption>Setting data from URL to a JSON</caption>
         * guideBridge.getGuideState({
         *      success : function (guideResultObj) {
         *          var json = guideResultObj.data;
         *          //post the JSON to a server that saves it at say http://abc.com/my/data.json
         *      },
         *      error : function (guideResultObj) {
         *          // log the errors
         *      }
         * });
         *
         * guideBridge.setData({
         *      guideStatePathRef : "http://abc.com/my/data.json",
         *      error : function (guideResultObject) {
         *          // log the errors
         *      }
         * })
         **/
        setData : function (options) {
            guideBridge.restoreGuideState(options);
        },

        /*
         * @private
         */
        _getStorage : function () {
            var storage = null;
            if (this.storage) {
                // Get the storage
                storage = this.storage;
                this.storage = null;
            }
            return storage;
        },

        getGuideContext : function () {
            var obj = new GuideResultObject();
            obj.data = jQuery.extend(true, {}, (window.guidelib ? window.guidelib.runtime.guideContext : null));
            return obj;
        },

        _getContextRoot : function () {
            return this.userConfig["contextPath"];
        },

        _updateAjaxUrl : function (baseUrl) {
            if (this.hostName === "server") {
                $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                    // 'Rebase' the URL if required.
                    var thisUrl = options.url;
                    if ((thisUrl.lastIndexOf('http://', 0) !== 0) && (thisUrl.lastIndexOf('https://', 0) !== 0)) {
                        // thisUrl is relative.
                        // thisUrl may or may not begin with slash
                        // encoding taken care by the ajax call
                        if (thisUrl.indexOf("/") === 0) {
                            // if begins with slash
                            thisUrl = baseUrl + thisUrl;
                        } else {
                            thisUrl = baseUrl + "/" + thisUrl;
                        }
                        options.url = thisUrl;
                    }
                });
            }
        },

        _getUrl : function (url) {
            var baseUrl = this.userConfig["baseUrl"],
                contextPath = this.userConfig["contextPath"];
            if (baseUrl) {
                return baseUrl + url;
            } else if (contextPath && contextPath !== "/" && url.indexOf(contextPath) !== 0 && (url.length === 0 || url.indexOf("/") === 0)) {
                //if url does not have contextPath and starts with /, pre-pend contextPath
                // Also url.length check because I need to pass "" to getUrl and get context path
                return contextPath + url;
            }
            return url;
        },

        _getGuidePathUrl : function (urlSuffix, guidePath) {
            // guidePath here refers to the path got from json state of guide
            // we use this path, if there is no guidePath set in guidelib.runtime.guideContext, cases where guide is not initialized but
            // guideBridge is present
            var path = guidePath || this.getGuidePath(),
                url = path + (urlSuffix || "");
            return this._getUrl(url);
        },

        getGuidePath : function () {
            var guideContext = this.getGuideContext().data;
            if (guideContext && guideContext.hasOwnProperty("guidePath")) {
                return guideContext["guidePath"];
            }
            return null;
        },

        /**
         * @summary Given a somExpression, return the {@link GuideNode} having the same somExpression.
         * @param {string} somExpression somExpression of the Adaptive Form component
         * @returns {GuideNode} GuideNode matching the som expression or null if not found
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @see GuideNode#somExpression
         */
        resolveNode : function (somExpression) {
            return this._guide.resolveNode(somExpression);
        },
        /*
         * Internal API. Should be used carefully.
         */
        _resolveId : function (id) {
            var node = this._guide._modelTemplateCacheStore.getModel(id);
            return node;
        },

        /**
         * Invokes {@link Field#resetData} API for all the Fields inside the Form to reset their values to default
         * @summary Reset the values of all the Fields to their default values.
         *
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        reset : function () {
            if (window.xfalib && window.xfalib.runtime && window.xfalib.runtime.xfa) {
                var xfa = window.xfalib.runtime.xfa;
                xfa.host.resetData();
            }
            this._guide.resetData();

            if (guidelib.internal.liveDataUtils.isLiveDataInitialized()) {
                guidelib.internal.liveDataUtils.updateLiveData();
            }

            var guideDirtyMarkerAndVisitor = guidelib.internal.GuideDirtyMarkerAndVisitor;
            guideDirtyMarkerAndVisitor.visitMap = guideDirtyMarkerAndVisitor._createMapFromFromList(this._guide.allLazyChildren, 0);
        },

        _getPreviousFocus : function () {
            return this._guideView._previousFocusItemSom;
        },

        /**
         * Returns the somExpression of the current {@link Panel} or current {@link Field} in Focus. The API can also
         * be used to get the somExpression of the Navigable Panel that contains the current Element in Focus.
         *
         * @summary return the somExpression of the {@link Panel} or {@link Field} that is currently in focus
         * @param {object} options configuration to be passed to the API to get the desired result
         * @param {?string} [options.focusOption] Currently the following value of this option are supported
         * * `navigablePanel`: if one wants to get the somExpression of the Navigable Panel
         * @returns {string} somExpression of Adaptive Form component representing the field or panel.
         * @method
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         * @see {GuideNode#somExpression}
         * @example
         * guideBridge.getFocus({"focusOption": "navigablePanel"})
         */
        getFocus : function (options) {
            var focusOption;
            if (_.isUndefined(options)) {
                return this._guideView.currentFocusItemSom;
            }
            if ((focusOption = getOrElse(options, "focusOption", null)) === "navigablePanel") {
                return this._guideView._lastFocussedPanelForNonActionFields;
            }
            this._guide.logger().log("Invalid Focus option.", focusOption);
        },

        /**
         * The API is equivalent to calling
         * `guideBridge.setFocus(options.somExpression, options.focusOption, options.runCompletionScript)`
         * @summary An alternate signature to the {@link GuideBridge#setFocus|setFocus} API
         * @method setFocus
         * @memberof GuideBridge
         * @instance
         * @since 6.1 FP1
         * @param {object} options options passed to the API
         * @param {string} options.somExpression somExpression to set the focus to
         * @param {string} options.focusOption item inside the Panel to focus to
         * @param {string} options.runCompletionScript whether to run the completion script or not.
         * @return {boolean} true if the focus was set successfully otherwise false.
         */

        /**
         * In Adaptive Form one can focus a Field/Panel. Setting focus on a Panel means setting focus to its first
         * child. This can be controlled using the _focusOption_ provided in this API.
         *
         * The API provides two mechanism to focus a Field/Panel.
         * * **Direct** : By providing the somExpression of the Field/Panel. If the somExpression of Panel is provided,
         * then based on the focusOption one of its child (or their child) is set to Focus
         * * **Indirect** : By providing an item's relative position inside a Panel, first or last item inside of a
         * Panel, sibling of current focussed Item of a Panel, etc. If the item is a Panel then the First Item of
         * that Panel (if that is again a Panel, this process continues until a Field is found) is activated.
         *
         * The first way is trivial, by providing the _somExpression_ of a {@link Field} to the API, the focus will be
         * set to the Field.
         *
         * If that Field is inside a Panel that is not currently open because of tabbed/wizard navigation, then that tab
         * would be opened and focus would be set to the Field/Panel.
         *
         * The API can also execute the
         * [completion expression](https://helpx.adobe.com/aem-forms/6-1/adaptive-form-expressions.html#main-pars_header_8)
         * of the current Panel and only if the expression returns true set focus to the required element.
         *
         * **Note:**
         * * If _focusOption_ is either of nextItemDeep or prevItemDeep then _somExpression_ parameter must not be
         * passed. Otherwise the API will throw an exception
         * * If _somExpression_ points to a {@link Field} and _focusOption_ is not _nextItemDeep_ or _prevItemDeep_ then
         * _focusOption_ is ignored.
         *
         * @summary Sets focus to a {@link Field} or {@link Panel}
         * @param {?string} somExpression SOM Expression of the Adaptive Form Field or Panel which has to be activated.
         * @param {string} [focusOption=firstItem] The option provides the mechanism to focus onto an sibling of the
         * current active item.
         * * **_firstItem_** - Focuses to the first focusable item of the Panel whose _SOM Expression_ is provided
         * * **_lastItem_** - Focuses to the last focusable item of the Panel whose _SOM Expression_ is provided
         *
         * If either the _firstItem_ or _lastItem_ is a Panel, then the _firstItem_ of that Panel (until a Field is
         * found) is set to Focus.
         *
         * * **_nextItem_** - Next sibling component of the current active Item of the Panel whose _somExpression_ is
         * provided. It is equivalent to the result of `panel.navigationContext.nextItem` API.
         * * **prevItem** - Previous sibling component of the current active Item of the Panel show _somExpression_ is
         * provided. It is equivalent to the result of `panel.navigationContext.prevItem` API.
         *
         * * **_nextItemDeep_** - Focus is set to the next Navigable Panel of root Panel in DFS Order
         * * **_prevItemDeep_** - Focus is set to the next Navigable Panel of root Panel in DFS Order
         * @param {boolean} [runCompletionScript=false] indicating whether to execute the completion expression or not.
         * @returns {boolean} true if the focus was set to requested field successfully otherwise false
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @example
         * setFocus(somExpression); // Focus is set to the specified somExpression.
         * setFocus(this.panel.somExpression,'nextItem',true); // Focus is set to next item in the Panel.
         * setFocus(null,'nextItemDeep',true); // Focus is set to next navigable Panel in rootPanel
         */
        setFocus : function (somExpression, focusOption, runCompletionScript) {
            var options,
                focusDone,
                originalSkipFieldFocus;
            if (_.isObject(somExpression)) {
                options = somExpression;
            } else {
                options = {somExpression : somExpression, focusOption : focusOption, runCompletionScript : runCompletionScript};
            }
            try {
                originalSkipFieldFocus = this._guideView.skipFieldFocus;
                /**
                 * Setting of this._guideView.skipFieldFocus was added for issue LC-3911361
                 * Here we set a skipFieldFocus property for gudeContainerView, which prevents
                 * actual 'input' / widget focus. This was done to prevent opening of keyboard or dropdown spinner
                 * or date picker.. in case of swipe and use of deep navigators in mobile view of Adaptive Form.
                 */
                this._guideView.skipFieldFocus = options.skipFieldFocus;
                focusDone = this._guideView.setFocus(options);
            } finally {
                this._guideView.skipFieldFocus = originalSkipFieldFocus; //moving back to original state
            }
            //TODO: need a more common place to do that.
            if (!this._guide._currentContext) {
                this._guide.runPendingExpressions();
            }
            return focusDone;
        },

        /*
         * Get the download link of signed document set by signing service.
         * @return: url from where the signed document can be accessed, empty in case its not set by signing service.
         */
        getSignedDocDownloadLink : function () {
            var url = "";
            if (!_.isUndefined(FD)
                && !_.isUndefined(FD.AFaddon)
                && !_.isUndefined(FD.AFaddon.Signing)
                && !_.isUndefined(FD.AFaddon.Signing.signedDocDownloadLink)) {
                url = FD.AFaddon.Signing.signedDocDownloadLink;
            }
            return url;
        },

        /*
         If true is passed to the function then it checks for model and view both,
         if false or no parameter is passed, then it checks the model only.
         */
        isGuideLoaded : function (complete) {
            if (complete) {
                return !_.isEmpty(window.guideBridge._guide && window.guideBridge._guideView);
            }
            return !_.isEmpty(window.guideBridge._guide);
        },

        _doInternalSubmit : function (options) {
            if (options.excludeFormState) {
                var submissionInfo = options.guideState.data.guideState.guideContext.afSubmissionInfo;
                if (submissionInfo && submissionInfo.hasOwnProperty('lastFocusItem')) {
                    submissionInfo.lastFocusItem = undefined;
                }
            }
            // Make a clone of options so that original options are not modified.
            // Remove additionalSubmitInfo from the guideState so that no extra information
            // is sent to the server.
            var clonedGuideState = JSON.parse(JSON.stringify(options.guideState));
            if (!_.isEmpty(clonedGuideState.data.guideState.additionalSubmitInfo)) {
                clonedGuideState.data.guideState.additionalSubmitInfo = {};
            }
            var guideState = clonedGuideState,
                strContent = this.getMultipartData({
                    guideState : JSON.stringify(guideState.data),
                    _charset_ : "UTF-8"}),
            // check if guide state is present, if yes get guide path from guide state
            // Specifically written for mobile workspace to getDataXML from current json state
                guidePath = ((guideState && guideState.data) ? guideState.data.guideState.guideContext.guidePath : null);

            $.ajax({
                url : this._getGuidePathUrl(".af.internalsubmit.jsp", guidePath),
                type : "POST",
                async : options.async || false,
                contentType : "multipart/form-data; charset=UTF-8; boundary=" + strContent[0],
                data : strContent[1],
                success : options.success,
                error : options.error
            });
        },

        _submitInternal : function (options) {
            var self = this;
            options = options || {};
            if (!options.guideState) {
                this.getGuideState({
                    "diff" : "diff",
                    "fileUploadPath" : options.fileUploadPath,
                    "success" : function (guideState) {
                        self._doInternalSubmit({
                            guideState : guideState,
                            success : options.success,
                            error : options.error,
                            async : options.async,
                            excludeFormState : options.excludeFormState
                        });
                    },
                    "error" : options.error,
                    reducedJSON : true
                });
            } else {
                this._doInternalSubmit({
                    guideState : options.guideState,
                    success : options.success,
                    error : options.error,
                    async : options.async,
                    excludeFormState : options.excludeFormState
                });
            }
        },

        getMultipartData : function (data) {
            //Start multipart formatting
            var initBoundary = this.randomString();
            var strBoundary = "--" + initBoundary;
            var strMultipartBody = "";
            var strCRLF = "\r\n";

            //Create multipart for each element of the form
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var value = _.isObject(data[key]) ? JSON.stringify(data[key]) : data[key];
                    strMultipartBody +=
                        strBoundary +
                        strCRLF +
                        "Content-Disposition: form-data; name=\"" + key + "\"" +
                        strCRLF +
                        strCRLF +
                        value +
                        strCRLF;
                }
            }
            //End the body by delimiting it
            strMultipartBody += strBoundary + "--" + strCRLF;
            //Return boundary without -- and the multipart content
            return [initBoundary,strMultipartBody];
        },

        randomString : function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
            return randomstring;
        },

        /*
         * Get the file Attachment map that contains a mapping of som expression vs path when files have been uploaded
         * and som expression vs name when the files have not yet been uploaded .
         * @return: map of som expression and paths.
         * @private
         */
        getFileAttachmentMap : function () {
            var fileAttachmentMap = {},
                fileAttachmentsList = [];
            window.guideBridge._getFileAttachmentsList(fileAttachmentsList);
            for (var i = 0; i < fileAttachmentsList.length; i++) {
                node = fileAttachmentsList[i];
                fileAttachmentMap[node.somExpression] = node.fileAttachment.value;
            }
            return fileAttachmentMap;
        },

        /*
         * sets the value of the file attachment component based on the map that is passed.
         * @private
         */
        putFileAttachmentMap : function (fileAttachmentMap) {
            _.each(fileAttachmentMap, function (value, som) {
                var node = guideBridge.resolveNode(som);
                node.fileAttachment.value = value;
            });
        },

        doAjaxSubmit : function (actionUrl, submitData, options) {
            var _options = options || {},
                asyncSubmit = _options.async === false ? false : true,
                strContent = this.getMultipartData(submitData);
            $.ajax({
                url : actionUrl,
                type : "POST",
                traditional : true,
                async : asyncSubmit,
                contentType : "multipart/form-data; charset=UTF-8; boundary=" + strContent[0],
                data : strContent[1],
                success : function (data) {
                    var guideResultObject = new GuideResultObject();
                    guideResultObject.data = data;
                    guideResultObject.completed = true;
                    if (guidelib.util.GuideUtil) {
                        guidelib.util.GuideUtil.showGuideLoading(false);
                    }
                    if (_.isFunction(_options.success)) {
                        _options.success.call(_options.context, guideResultObject);
                    } else {
                        if (data.hasOwnProperty("signingURL")) {
                            // Adobe sign : FormFiller enabled case.
                            window.location.href = data.signingURL;
                        } else {
                            var payload = {};
                            if (data.hasOwnProperty(guideBridge.KEY_AF_SUCCESS_PAYLOAD)) {
                                try {
                                    payload = JSON.parse(data[guideBridge.KEY_AF_SUCCESS_PAYLOAD]);
                                    payload.data = guidelib.internal.afdata;
                                    var schemaType = guidelib.runtime.guideContext.schemaType;
                                    if (!schemaType) {
                                        //TODO define a constant for schema Type.
                                        schemaType = "xmlschema";
                                    }
                                    payload.contentType = schemaType;
                                } catch (e) {
                                    guideBridge._guide.logger().log("Error while parsing AF Success Payload: " + e);
                                }
                            }
                            guideBridge._guide.executeExpression("submitSuccess", payload); // Executing Rule Editor code for submit success.
                        }
                    }
                },
                error : function (data) {
                    var guideResultObject = new GuideResultObject();
                    guideResultObject.data = data;
                    guideResultObject.completed = false;
                    guideResultObject.addMessage(2, "Error in Async Submit", "");
                    if (guidelib.util.GuideUtil) {
                        guidelib.util.GuideUtil.showGuideLoading(false);
                    }
                    if (_.isFunction(_options.error)) {
                        _options.error.call(_options.context, guideResultObject);
                    } else {
                        var errorPayload = {};
                        try {
                            errorPayload = JSON.parse(data.responseText);
                        } catch (e) {
                            guideBridge._guide.logger().log("Error while parsing errorPayload." + e);
                        }
                        guideBridge._guide.executeExpression("submitError", errorPayload); //Executing Rule Editor code for submitError
                    }
                }
            });
        },

        KEY_AF_SUCCESS_PAYLOAD : "afSuccessPayload",

        handleUpload : function () {
            self = this.self;
            this.submitData['_guideAttachments'] = this.attachments.toString();
            _.each(this.attachments, function (att) {
                this.submitData["_guideFileAttachment." + att] = this.submitData['fileUrl'] + "/" + att;
            }, this);
            delete this.submitData['fileUrl'];
            self.doAjaxSubmit(this.actionUrl, this.submitData, this.options);
        },

        _handleSubmitError : function (data) {
            switch (data.status) {
                case 502:
                    alert(guidelib.util.GuideUtil.getLocalizedMessage("AF", guidelib.i18n.LogMessages["AEM-AF-901-003"]));
                    break;
                default:
                    alert(guidelib.util.GuideUtil.getLocalizedMessage("AF", guidelib.i18n.LogMessages["AEM-AF-901-004"]));
                    break;
            }
            if (guidelib.util.GuideUtil) {
                guidelib.util.GuideUtil.showGuideLoading(false)
                    .removeAllMessages();
            }
        },

        updateSubmitData : function (fileAttachmentsList, submitData, fileList) {
            var fileCount = 0,
                attachments = [],
                name;
            if (fileList.length === 0 && fileAttachmentsList.length > 0 && !guideBridge._disablePreview()) {
                _.each(fileAttachmentsList, function (fileUploadComponentId, index) {
                    var currentCount = 0;
                    var componentInModel = window.guideBridge._resolveId(fileUploadComponentId);
                    var fileNameList = componentInModel["fileAttachment"].value;
                    if (fileNameList) {
                        var fileNames = fileNameList.split("\n");
                        _.each(fileNames, function (fileUrl, index) {
                            name = componentInModel.name + "/" + fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                            if (name) {
                                attachments[fileCount++] = name;
                                submitData["_guideFileAttachment." + name] = fileUrl;
                            }
                        }, this);
                    }
                }, this);
                submitData['_guideAttachments'] = attachments;
            } else if (fileList.length > 0) {
                _.each(fileList, function (file, index) {
                    name = guideBridge._getRelativeFilePath(file);
                    attachments[fileCount++] = name;
                    submitData["_guideFileAttachment." + name] = file;
                }, this);
                submitData['_guideAttachments'] = attachments;
            }
        },

        _collectFileUrls : function (event) {
            var list = [],
                fileUploadError = false;

            _.each(this.attachments, function (att) {
                // check if att is a url and hence push it directly to list
                if (_.isString(att) && att.match(/\//g).length > 1) {
                    list.push(att);
                } else {
                    list.push(this.fileUrl + "/" + att);
                }
            }, this);

            var index = 0;
            for (var i = 0; i < list.length;) {
                var object = this.fileAttachmentsList[index++]["fileAttachment"],
                    value = [];

                if (object.parent.fileList) {
                    for (var j = 0; j < object.parent.fileList.length; j++) {
                        var isFileListObject = (_.isObject(object.parent.fileList[j]) && object.parent.fileList[j].val().length > 0),
                            isFileListString = (_.isString(object.parent.fileList[j]) && object.parent.fileList[j].length > 0);
                        if (isFileListObject || isFileListString) {
                            value.push(list[i++]);
                        }
                    }
                    object.value = value.join("\n");
                }
            }
            var submitOptions = this.options.ajaxSubmitObject;
            if (submitOptions && submitOptions.ajaxSubmitDataHandler) {
                submitOptions.ajaxSubmitDataHandler.call(this.options.context, submitOptions.fileAttachmentsList, submitOptions.submitData, list);
                window.guideBridge.doAjaxSubmit(submitOptions.actionUrl, submitOptions.submitData, this.options);
            } else if (this.options.success) {
                //create the guideState now as the model has been updated with the latest values.
                //do this only during getGuideState and not on ajax submit
                guideBridge._createGuideStateAndLiveXml(this.options);
                this.options.success.call(this.options.context, this.options.obj);
            }

        },

        // This function extracts the form name from the guideContainerPath.
        _getFormName : function (guidePath) {
            var formName = "";
            if (guidePath) {
                var index = guidePath.indexOf("/jcr:content/guideContainer");
                guidePath = guidePath.substring(0, index);
                formName = guidePath.substring(guidePath.lastIndexOf("/") + 1);
            }
            return formName;
        },

        // This function creates a UUID that is used for ajax submit
        _getUUIDForAjaxSubmit : function () {
            var uuidSuffix = Math.floor((Math.random() * 10000) + 1),
                uuidCurrentTime = new Date().getTime(),
                successFlag = true;
            var guidePath = window.guideBridge.getGuidePath();
            this._formInstanceUUID = window.guideBridge._getFormName(guidePath) +  uuidCurrentTime + uuidSuffix;
            successFlag = createUUIDStorage(this._formInstanceUUID);
            if (successFlag) {
                return this._formInstanceUUID;
            } else {
                return null;
            }
        },

        /**
         * returns the form element to be used for submission in case of non-ajax
         * submit.
         * The function looks in the submitConfig for a form and if not present,
         * creates a new form
         * @returns {object} jQuery object for form element
         * @private
         */
        _getFormForSubmission : function () {
            var submitConfig = this.userConfig.submitConfig || {},
                form = submitConfig.form || $("<form method='post' enctype='multipart/form-data'/>").appendTo($("body"));
            return $(form);
        },

        _getThankYouPageFromConfig : function () {
            var submitConfig = this.userConfig.submitConfig || {};
            return submitConfig.thankyouPage;
        },

        /**
         * Validate and submits the data of the Adaptive Form to the pre-configured submit action.
         *
         * The success handler provided in the argument is executed only if the Adaptive Form is configured to use AJAX
         * for submission using {@link GuideBridge#registerConfig|registerConfig} API
         * @summary submits the Adaptive Form
         * @param {object} options options to control the behaviour of submit API.
         * @param {string} [options.submissionSelector] url selector governs the submission behaviour at server
         * Default value is "submit", other options are "agreement", "signSubmit"
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success.
         * {@link GuideResultObject#errors|errors} property as false.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object
         * @param {boolean} [options.validate=true] whether to validate the form before submission or not
         * @method
         * @memberof GuideBridge
         * @since 6.0
         * @instance
         * @example <caption>Submitting the form without validation</caption>
         * guideBridge.submit({
         *    validate: false,
         *    error : function (guideResultObject) {//log message}
         * });
         * @example <caption>Submitting the form and showing a success message</caption>
         * guideBridge.registerConfig("submitConfig" : {"useAjax" : true});
         * guideBridge.submit({
         *   validate: false,
         *   error : function (guideResultObject) {//log message}
         *   success : function (guideResultObject) {alert("data submitted successfully")
         * });
         */
        submit : function (options) {
            var self = this;
            var guideContextFromOptions,
                runtimeGuideContext = guidelib.runtime.guideContext;
            if (getOrElse(options, "guideState", "")) {
                guideContextFromOptions = options.guideState.data.guideState.guideContext;
            }
            var localGuideContext = guideContextFromOptions || runtimeGuideContext;
            // to submit guideContainerForm  which will be stopped so that autocomplete values can be remembered
            $(".guideContainerFormSubmitButton").click();
            function submitError(data) {
                if (options && options.error) {
                    options.error.call(options.context || this, data);
                } else {
                    $.proxy(guideBridge._handleSubmitError(data), guideBridge);
                }
            }
            function submitSuccess(data) {
                var isAjaxSubmit = false;

                if (options) {
                    isAjaxSubmit = options.success ? true : false;
                }
                options = options || {};
                options.success = options.success || (self.userConfig.submitConfig || {}).submitSuccessHandler;
                isAjaxSubmit = isAjaxSubmit || (self.userConfig.submitConfig || {useAjax : false}).useAjax || guideBridge._guide.enableAsyncSubmission;
                var submitData = {};

                if (this.isGuideLoaded()) {
                    var guideCaptchaList = [];
                    this.visit(function (node) {
                        if (node.className === "guideCaptcha") {
                            guideCaptchaList.push(node);
                        }
                    });
                    var captchaModel = guideCaptchaList[0];
                    if (captchaModel) {
                        var captchaData = window.guideBridge._getCaptchaData(captchaModel);
                        submitData['captchaData'] = captchaData;
                    }
                }

                // check if guide state is present, if yes get guide path from guide state
                var guidePath = getOrElse(options, "guideState.data.guideState.guideContext.guidePath", ""),
                    guideContainerPath = guidePath || window.guideBridge.getGuidePath(),
                    aemFormComponentPath = this.userConfig.submitConfig ? this.userConfig.submitConfig.aemFormComponentPath : "",
                    submissionSelector = options.submissionSelector || "submit",
                    actionUrl = window.guideBridge._getGuidePathUrl(".af." + submissionSelector + ".jsp", guideContainerPath);

                submitData['guideContainerPath'] = guideContainerPath;
                submitData['aemFormComponentPath'] = aemFormComponentPath;
                submitData['_asyncSubmit'] = isAjaxSubmit;
                submitData['_charset_'] = "UTF-8";
                var customPropMap = localGuideContext.customPropertyMap || {};
                // need to remove lastFocusItem from being sent as a different property
                // as it being sent in xml and with afSubmissionInfo as well.
                var whiteListedProperties = ["lastFocusItem"];
                for (var prop in customPropMap) {
                    if (customPropMap.hasOwnProperty(prop) && whiteListedProperties.indexOf(prop) < 0) {
                        submitData[prop] = customPropMap[prop];
                    }
                }
                // todo: Have to remove the excludeFromDor map from the submission info, is this required ?
                submitData['afSubmissionInfo'] = guidelib.runtime.guideContext.afSubmissionInfo || {};
                var resultJson = data,
                    guideJson,
                    data,
                    fileAttachmentsList,
                    attachments = [],
                    fileCount = 0;
                if (resultJson.hasOwnProperty("guideValue")) {
                    guideJson = resultJson.guideValue;
                } else {
                    guideJson = {};
                    var visitedMap = {};
                    this.visit(function (node) {
                        if (!node.bindRef && !visitedMap[node.somExpression]) {
                            if (node instanceof guidelib.model.Field && node.value) {
                                visitedMap[node.somExpression] = true;
                                guideJson[node.getAttribute("name")] = node.value;
                            } else if (node instanceof guidelib.model.GuideCompositeField) {
                                var obj = guideJson[node.getAttribute("name")] = {};
                                _.each(node.items, function (childNode, index) {
                                    visitedMap[childNode.somExpression] = true;
                                    if (childNode.value) {
                                        obj[childNode.getAttribute("name")] = childNode.value;
                                    }
                                }, this);
                            }
                        }
                    });
                    visitedMap = null;
                }
                if (resultJson.hasOwnProperty("data")) {
                    data = resultJson["data"];
                }

                if (resultJson.hasOwnProperty("fileAttachmentsList")) {
                    fileAttachmentsList = resultJson["fileAttachmentsList"];
                }

                for (var key in guideJson) {
                    if (guideJson.hasOwnProperty(key)) {
                        submitData[key] = guideJson[key];
                    }
                }

                if (data) {
                    submitData['jcr:data'] = data;
                    submitData['jcr:data@TypeHint'] = "Binary";
                    guidelib.internal.afdata = data;
                }
                if (!_.isUndefined(options.fileAttachmentMap)) {
                    submitData.fileAttachmentMap = options.fileAttachmentMap;
                } else {
                    //send the fileAttachmentMap through submitdata to restore submission attachments for read only viewing
                    var fileAttachmentMap = {},
                        fileAttachmentsList = [];
                    window.guideBridge._getFileAttachmentsList(fileAttachmentsList);
                    for (var i = 0; i < fileAttachmentsList.length; i++) {
                        node = fileAttachmentsList[i];
                        if (!_.isUndefined(node.value) && node.value.length > 0) {
                            var attachmentList = node.value.split("\n");
                            for (var j = 0; j < attachmentList.length; j++) {
                                attachmentList[j] = node.name + "/" + attachmentList[j];
                            }
                            fileAttachmentMap[node.somExpression] = attachmentList.join('\n');
                        }
                    }
                    submitData.fileAttachmentMap = JSON.stringify(fileAttachmentMap);
                }
                // read the additional innformation from the guideState if it is passed in options
                // otherwise get the additional information from the DOM
                var additionalSubmitInfo = {};
                if (options.guideState && options.guideState.data.guideState.additionalSubmitInfo) {
                    additionalSubmitInfo = options.guideState.data.guideState.additionalSubmitInfo;
                } else {
                    additionalSubmitInfo = guideBridge._getAdditionalSubmitInfo();
                }
                // append additionalSubmitInfo to the submitData
                $.extend(true, submitData, additionalSubmitInfo);

                if (isAjaxSubmit && isAjaxSubmit === true) {
                    // if the fileAttachmentMap is passed in the options, then we don't need to upload the files as the map contains the uploaded path only.
                    // we just update the submitData with the attachment information
                    if (options.fileAttachmentMap) {
                        var attachmentMap = JSON.parse(options.fileAttachmentMap);
                        var keys = _.keys(attachmentMap);
                        for (var i = 0; i < keys.length; i++) {
                            if (attachmentMap[keys[i]]) {
                                var fileNames = attachmentMap[keys[i]].split("\n");
                                for (var j = 0; j < fileNames.length; j++) {
                                    var name = guideBridge._getRelativeFilePath(fileNames[j]);
                                    attachments[fileCount++] = name;
                                    submitData["_guideFileAttachment." + name] = fileNames[j];
                                }
                            }
                        }
                        submitData['_guideAttachments'] = attachments;
                        self.doAjaxSubmit(actionUrl, submitData, options);
                    } else {
                        var attachedFilesList = [];
                        var currentCount = 0;
                        // need to check if the guide is loaded, as it is not available for mobile workspace app usecase
                        if (guideBridge.isGuideLoaded()) {
                            window.guideBridge._getFileAttachmentsList(attachedFilesList);
                        }
                        _.each(attachedFilesList, function (object) {
                            var fileNameList = object["fileAttachment"].value;
                            if (fileNameList) {
                                currentCount++;
                            }
                        });
                        // If a file has been attached and isAjaxSubmit is true, then a UUID is generated and
                        // the files are uploaded at temp storage path.
                        // The submit data is updated with the attached files and then
                        // doAjaxSubmit is called.
                        if (currentCount > 0) {
                            var uuid = window.guideBridge._getUUIDForAjaxSubmit();
                            if (uuid) {
                                path = GUIDE_TEMP_STORAGE_PATH + "/" + uuid;
                                options.ajaxSubmitObject = {
                                    "fileAttachmentsList" : fileAttachmentsList,
                                    "submitData" : submitData,
                                    "actionUrl" : actionUrl,
                                    "ajaxSubmitDataHandler" : window.guideBridge.updateSubmitData
                                };
                                window.guideBridge._getGuideAttachments(attachedFilesList, path, window.guideBridge._collectFileUrls, options);
                            }
                        } else {
                            self.doAjaxSubmit(actionUrl, submitData, options);
                        }
                    }
                } else {
                    var $form = self._getFormForSubmission();
                    $form.attr('action', actionUrl);

                    for (var fields in submitData) {
                        if (submitData.hasOwnProperty(fields)) {
                            var value = submitData[fields];
                            $("<input>").attr("type", "hidden")
                                .attr("name", fields)
                                .val(_.isObject(value) ? JSON.stringify(value) : value)
                                .appendTo($form);
                        }
                    }
                    /*
                     * This means we did not do any preprocessing
                     * for file attachments so fileAttachment list won't be present
                     * so posting DOM for the files.
                     * */
                    var attachmentNameDomMap = guideBridge._getFileNameFileDomMap(),
                        fileNameList = [],
                        _guideAttachments = "";
                    // A string containing the names of all the files that are attached is stored in the variable _guideAttachments.
                    // For all the files that have been uploaded already and don't have a dom element are
                    // added to $form with prefix "_guideFileAttachment."
                    if (attachmentNameDomMap && attachmentNameDomMap.fileDom) {
                        fileNameList = attachmentNameDomMap.fileName;
                        _.each(attachmentNameDomMap.fileDom, function (file, index) {
                            if (file) {
                                file.attr("name", fileNameList[index])
                                    .attr("class", "hidden")
                                    .appendTo($form);
                                _guideAttachments += fileNameList[index] + ",";
                            } else {
                                if (fileNameList[index]) {
                                    var name = guideBridge._getRelativeFilePath(fileNameList[index]);
                                    $("<input>").attr("type", "hidden")
                                        .attr("name", "_guideFileAttachment." + name)
                                        .attr("value", fileNameList[index])
                                        .appendTo($form);
                                    _guideAttachments += name + ",";
                                }
                            }
                        });
                    }
                    $("<input>").attr("type", "hidden")
                        .attr("name", "_guideAttachments")
                        .attr("value", _guideAttachments)
                        .appendTo($form);

                    $form.submit();
                }
            }
            if (guidelib.util.GuideUtil) {
                guidelib.util.GuideUtil.showGuideLoading(true).showMessages(guidelib.i18n.strings.validatingForm);
            }
            // since validate is synchronous call, putting this in timeout
            // so that html changes can be displa
            setTimeout(function () {
                // update the snapshot just before validating
                // so that we get true state of play before loading panels
                if (guideBridge.isGuideLoaded() && guideBridge._guide.allLazyChildren.length > 0) {
                    guidelib.internal.liveDataUtils.updateLiveData();
                }
                var isValid = false;
                try {
                    isValid = self._performConditionalValidation(options);
                } catch (e) {
                    isValid = false;
                } finally {
                    if (guidelib.util.GuideUtil) {
                        guidelib.util.GuideUtil.removeAllMessages();
                    }
                }
                if (isValid) {
                    if (guidelib.util.GuideUtil) {
                        var msg = guidelib.i18n.strings.submittingForm;
                        if (options && options.submissionSelector === 'agreement') {
                            msg = guidelib.i18n.strings.generatingSignAgreement;
                        }
                        guidelib.util.GuideUtil.showMessages(msg);
                    }
                    // Trigger submitStart before calling internal submit.
                    if (guideBridge.isGuideLoaded()) {
                        self._guide._triggerOnBridge("submitStart", "", "", "", "");
                    }
                    var excludeFormState = true;
                    if (options && options.hasOwnProperty("excludeFormState")) {
                        excludeFormState = options.excludeFormState;
                    }
                    try {
                        var guideState = getOrElse(options, "guideState", null);
                        self._submitInternal({
                            guideState : guideState,
                            success : function () {
                                try {
                                    submitSuccess.apply(self, arguments);
                                } catch (e) {
                                    if (guidelib.util.GuideUtil) {
                                        guidelib.util.GuideUtil.showGuideLoading(false)
                                            .removeAllMessages();
                                    }
                                }
                            },
                            error : function () {
                                try {
                                    submitError.apply(self, arguments);
                                } catch (e) {
                                    //ignoring the error
                                } finally {
                                    if (guidelib.util.GuideUtil) {
                                        guidelib.util.GuideUtil.showGuideLoading(false)
                                            .removeAllMessages();
                                    }
                                }
                            },
                            async : true,
                            excludeFormState : excludeFormState
                        });
                    } catch (e) {
                        if (guidelib.util.GuideUtil) {
                            guidelib.util.GuideUtil.showGuideLoading(false)
                                .removeAllMessages();
                        }
                    }
                } else {
                    if (guidelib.util.GuideUtil) {
                        guidelib.util.GuideUtil.showGuideLoading(false)
                            .removeAllMessages();
                    }
                    return;
                }
            }, 1);
        },

        ERROR_CAUSED_BY : {
            CAPTCHA_VALIDATION : "CAPTCHA_VALIDATION",
            SERVER_SIDE_VALIDATION : "SERVER_SIDE_VALIDATION",
            FORM_SUBMISSION : "FORM_SUBMISSION",
            AGREEMENT_CREATION : "AGREEMENT_CREATION"
        },

        /* Handle the server side validation failure in case of submission fails.
         * This function handles Captcha validation as well as server side validation.
         */
        _handleServerValidationError : function (errorJson) {
            var self = this;
            if (errorJson) {
                if (errorJson.errorCausedBy && errorJson.errorCausedBy === this.ERROR_CAUSED_BY.CAPTCHA_VALIDATION) {
                    var errors = errorJson.errors,
                        firstFocusableSom = errors[0].somExpression;
                    _.each(errors, function (object, i) {
                        var somExpression = object.somExpression,
                            errorMessage = object.errorMessage,
                            guideCaptcha;
                        /*Setting focus to load captcha's view.
                         This is required when panel's children get loaded later.
                         Setting focus ensures that view is loaded properly so that model can throw
                         'guide.errorChanged' event and view can listen the same.
                         */
                        self.setFocus(somExpression);
                        guideCaptcha = self.resolveNode(somExpression);
                        if (guideCaptcha) {
                            guideCaptcha.showCaptchaError(errorMessage);
                        }
                    });
                    //Setting focus to the first captcha element.
                    self.setFocus(firstFocusableSom);
                } else if (errorJson.errorCausedBy && errorJson.errorCausedBy === this.ERROR_CAUSED_BY.FORM_SUBMISSION
                        || errorJson.errorCausedBy === this.ERROR_CAUSED_BY.AGREEMENT_CREATION) {
                    var error = errorJson.errors[0],
                        errorMessage = error.errorMessage;
                    $.proxy(guideBridge._handleSubmitError({
                        "status" : "500"
                    }), guideBridge);
                } else {
                    //Everything else is "SERVER_SIDE_VALIDATION". Calling this as it was being called.
                    var errorList = [];
                    window.guideBridge.validate(errorList, null, true);
                }
            }
        },

        SELECTOR_FORM_CONTAINER : "#guideContainerForm",

        THANK_YOU_OPTION : {
            PAGE : "page",
            MESSAGE : "message"
        },
        /*
        *  default Submit Success Handler.
        *  This function handles the Thank You Page/Message
        */
        _defaultSubmitSuccessHandler : function (successPayload) {
            if (successPayload) {
                if (successPayload.thankYouOption === this.THANK_YOU_OPTION.MESSAGE) {
                    $(this.SELECTOR_FORM_CONTAINER).replaceWith("<div class='tyMessage'>" + successPayload.thankYouContent + "</div>");
                } else if (successPayload.thankYouOption === this.THANK_YOU_OPTION.PAGE) {
                    window.location.href = successPayload.thankYouContent;
                }
            }
        },

        // This function gets the relative path of the file.
        // Suppose the component Name is attachment and the file name is a.jpg,
        // then it will return "attachment/a.jpg" as the path
        _getRelativeFilePath : function (fileName) {
            var splitPath = fileName.split("/");
            return splitPath[splitPath.length - 2] + "/" + splitPath[splitPath.length - 1];
        },

        // We do not need to validate if options.validate = false.
        // This function makes sure that validations are not performed when validate flag is false.
        // Validation is performed in all the other cases.
        _performConditionalValidation : function (options) {
            if (getOrElse(options, "validate", true)) {
                return guideBridge.validate(null, null, true, false);
            }
            return true;
        },

        /**
         * This API returns the HTML content of another Adaptive Form and optionally load the Form inside an HTML
         * element
         *
         * The {@link GuideResultObject#data|data} property of the result passed to success handler will contain the HTML of
         * the Form
         * @summary load an Adaptive Form given its path
         * @param {object} options object to pass to the API
         * @param {function} [options.success] callback which receives the result of the API
         * in case of success.
         * {@link GuideResultObject#errors|errors} property as false.
         * @param {function} [options.error] callback which receives the result of the API in
         * case of failure.
         * {@link GuideResultObject#errors|errors} property as true.
         * @param {object} [options.context] _this_ object inside the _success_ and _error_ callback will point to this
         * object
         * @param {string} options.path Path of the Adaptive Form whose HTML is required. If sever is running at a
         * context path, this parameter must have the context path
         * @param {string} [options.dataRef] URL of the resource that returns the XML. The protocol of the URL must
         * match the supported URL protocols
         * @param {string} [options.containerSelector] jquery Selector of the HTML element where to insert the HTML
         * of the form.
         * @method
         * @memberof GuideBridge
         * @since 6.1 FP1
         * @instance
         * @example
         * guideBridge.loadAdaptiveForm({
         *      success : function (guideResultObj) {console.log("html is " + guideResultObj.data)},
         *      error : function (guideResultObj) { //log errors},
         *      dataRef : "http://url/of/the/dataRef",
         *      path : "/contextpath/content/dam/formsanddocuments/form1"
         * })
         * @see {@link https://api.jquery.com/category/selectors/|jQuery selectors}
         * @see <a href="#guidebridge-api-usage" >GuideBridge API Usage</a>
         */
        loadAdaptiveForm : function (options) {
            if (options && options.path) {
                // Let's covert the adaptive form asset path or af path
                var path = options.path.replace(FM_DAM_ROOT, FM_AF_ROOT);
                path += "/jcr:content/guideContainer.html";
                $.ajax({
                    url  : path ,
                    type : "GET",
                    data : {
                        // lets set the wcmmode to disabled
                        wcmmode : "disabled",
                        // Set the data reference
                        "dataRef" : options.dataRef
                    },
                    async : false,
                    success : function (data) {
                        // Get the container selector and do a replaceWith HTML
                        // not using jquery since jquery create a separate array objects for script, link etc
                        if (options.containerSelector) {
                            //NOCHECKMARX - data is coming from serverside preventing Reflective XSS All Clients.
                            $(options.containerSelector).html(data);
                        }
                        var guideResultObject = new GuideResultObject();
                        // data would here be html
                        guideResultObject.data = data;
                        guideResultObject.completed = true;
                        if (options.success && _.isFunction(options.success)) {
                            options.success.call(options.context, guideResultObject);
                        }
                    },
                    error : function (data) {
                        var guideResultObject = new GuideResultObject();
                        // data is an object containing xhr request, status and error
                        guideResultObject.data = data;
                        guideResultObject.completed = false;
                        guideResultObject.addMessage(2, "Error in getting HTML of Adaptive Form: " + options.path, "");
                        if (options.error && _.isFunction(options.error)) {
                            options.error.call(options.context, guideResultObject);
                        }
                    }
                });
            } else {
                if (typeof(console) !== "undefined") {
                    console.log("Path of Adaptive Form not specified to loadAdaptiveForm API");
                }
            }
        },

        /**
         * Unloads the Form loaded using the {@link GuideBridge#loadAdaptiveForm|loadAdaptiveForm} API
         * @summary Unloads an adaptive Form from the browser, removing all the existing event listeners, data, html.
         * @param containerSelector jQuery Selector of the container, which contains the HTML of the Adaptive Form
         * @method
         * @memberof GuideBridge
         * @since 6.1 FP1
         * @instance
         * @see {@link https://api.jquery.com/category/selectors/|jQuery selectors}
         */
        unloadAdaptiveForm : function (containerSelector) {
            // Let's clear all intervals
            // Never make intervals, which are not cleared
            if (window.guidelib && window.guidelib.intervals) {
                // check for null safe
                window.clearInterval(window.guidelib.intervals.intId);
            }
            // Remove all the child present in the container
            $(containerSelector).children().remove();
            // Clean the date picker html
            // todo: clean other HTML which we add outside Adaptive Form
            $('body').find(".datePickerTarget").remove();

            // todo: what are the even listeners to clean ?
            $(window).off("guideModelInitialized");
            $(window).off("guideInitialized");
            $(window).off("guideInitializationError");
            // todo: What if there is an existing load, scroll or resize listener already present in page ?
            $(window).off("load scroll resize");
            $(window).off("keydown.guides");

            $('.guideContainerWrapperNode').off("swiperight");
            $('.guideContainerWrapperNode').off("swipeleft");

            // Remove all delegated event listeners
            $(document).off('click.guidetab.data-api');
            $(document).off('click.guideAddRemove.data-api');

            // Remove date picker event listeners
            $(window).off("touchstart.datetimepicker mousedown.datetimepicker");

            if (window.guidelib) {
                // Start cleaning data
                window.guidelib.runtime = {
                    guide : null,
                    af : null, // not sure if making it null would impact, since this namespace hold's public functions
                    guideContext : null,
                    _private : {},
                    errorManager : null
                };

                window.guidelib.internal = {
                    liveModel : null,
                    liveDataUtils : null,
                    GuideDirtyMarkerAndVisitor : null
                };
            }

            if (window.guideBridge) {
                // Unload all guideBridge references
                window.guideBridge._guide  = null;
                window.guideBridge._guideView  = null;
                window.guideBridge._$target  = null;
                window.guideBridge._guideDoc = null;
            }
            if (window.xfalib) {
                // We always load ut for logger
                window.xfalib.ut = null;
            }
            // If form bridge exist's call form bridge to destroy form
            if (window.formBridge) {
                window.formBridge.destroyForm();
            }
            // Clear any jquery cache, this should avoid memory leak
            if (window.jQuery) {
                // note: repeatable template marker div was held by jquery fragment
                // Before converting the HTML string to a DOM subtree, there is a lot of process involved
                // To make the process faster there is a "fragment cache" that saves the processed string as DOM nodes
                // Let's clean the fragment cache
                window.jQuery.fragments = {};
            }

            if (window.guidelib && window.guidelib.model) {
                // Clean accessible objects
                window.guidelib.model.GuideNode.guideUtil = null;
            }

            // Lets clean all guidelib object's at first level
            // Let's hope there are no closure objects created or any reference of objects inside guidelib
            _.each(window.guidelib, function (obj, key) {
                // "util", "event", "model", "view", "runtime", "author", "log", "i18n", "guideReplaced" get's cleaned here
                window.guidelib[key] = undefined;
            });

            if ($) {
                // Lets clean all jquery plugin's created
                //window.$.Widget = undefined;
                //window.$.widget = undefined;
                $.xfaWidget = undefined;
                // May be required if we want to unload the entire page.
                // window.$.fn = undefined;
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
            }
        },

        /**
         * Disables all the fields and global toolbar
         * @private
         */
        _disableForm : function () {
            var rootPanel = guideBridge.resolveNode("guide[0].guide1[0].guideRootPanel[0]"),
                globalToolbar = guideBridge.resolveNode("guide[0].guide1[0].toolbar[0]");

            // The following API disables the loaded fields
            rootPanel.disableAllFields();
            // The following API disables the form toolbar
            if (globalToolbar) {
                globalToolbar.disableAllFields();
            }
        },

        /**
         * @summary Disables the adaptive form.
         * @method
         * @memberof GuideBridge
         * @since 6.3
         */
        disableForm : function () {
            guideBridge._disableForm();
            //Listening on guideBridge for "elementLazyLoaded" event to disable lazily loaded fields
            guideBridge.on("elementLazyLoaded", guideBridge._disableForm);
        },

        _playGuideJson : function (options) {
            this._guide.setGuideState(guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MERGE_PROGRESS);
            /*
             * no need to check here since merged json will not have xfaState if
             * xdp is invalid
             */
            if (this._isXfaGuide() && options.guideState.xfaState && options.guideState.xfaState.xfaDom) {
                var that = this;
                window.formBridge.restoreFormState({
                    formState : options.guideState.xfaState,
                    context : this,
                    //NOCHECKMARX - This is error callback to be provided by the user of this API.
                    error : options.error || defaultErrorHandler,
                    success : function () {
                        that._playNonXfaJson(options);
                    }
                });
            } else {
                this._playNonXfaJson(options);
            }
        },

        _playNonXfaJson : function (options) {
            // try to  get xml-s from restore state 1st as they will be more relevant than the prefill state
            var xmlStr = getOrElse(options, "guideState.guideLiveData", null)
                    || getOrElse(options, "guideState.guidePrefillXml", null),
                xfaXmlStr = getOrElse(options, "guideState.xfaState.currentContext.data", null)
                    || JSON.parse(getOrElse(options, "guideState.xfaState.xfaRenderContext", "{}")).data;
            if (guideBridge._guide.allLazyChildren.length > 0 && (xmlStr || xfaXmlStr)) {
                guidelib.internal.liveDataUtils.initLiveData(xmlStr, xfaXmlStr,
                    _.isString(this._guide.xdpRef), _.isString(this._guide.xsdRef),
                    this._guide.getAttribute("xsdRootElement"));
                guidelib.internal.liveModel.prefillCrossFragFields();
                guidelib.internal.liveDataUtils.dropXfaXml();
            }

            // If the restore state is not stored in local storage,then use it from the json passed from the server
            if (options.guideState.guideDom) {
                this._guide.playJson(options.guideState.guideDom);
            }
            if (options.guideState.unboundDataMap && options.guideState.unboundDataMap.data) {
                this.visit(function (node) {
                    if ((node instanceof guidelib.model.Field || node instanceof guidelib.model.GuideCompositeField)
                        && !node.getAttribute("bindRef") && options.guideState.unboundDataMap.data[node.name]) {
                        var nodeValue = options.guideState.unboundDataMap.data[node.name];
                        //If the xml had empty tag, an empty object will come in the map, so set to null.
                        if (_.isObject(nodeValue) && _.isEmpty(nodeValue)) {
                            node._setGuideValue(null);
                        } else {
                            node._setGuideValue(nodeValue);
                        }

                        if (node.className === "guideRadioButton") {
                            node.prevOnItem = node.getSelectedIndex(node.jsonModel._value);
                        }
                    }
                });
            }
            this._guide.setGuideState(guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MERGE_COMPLETE);
            this._guide.prepare();

            if (options.success) {
                options.success.call(this);
            }
        },

        _postExternalMessage : function (message) {
            if (this.userConfig["postExternalMessageConfig"] && _.isFunction(this.userConfig["postExternalMessageConfig"]["postExternalHandler"])) {
                var externalHandler = this.userConfig["postExternalMessageConfig"]["postExternalHandler"];
                externalHandler(message);
            }
        },

        _isXfaGuide : function () {
            if (this._guide.xdpRef) {
                return true;
            } else {
                return false;
            }
        },
        _readRuntimeLocale : function (runtimeLocale) {
            return this.customContextProperty("runtimeLocale", runtimeLocale);

        },

        /*
         * checks whether xdp present in Adaptive Form is valid or not
         * This is verified by checking the xdpRef property in guideContext
         */
        _isValidXFAGuide : function () {
            return !_.isUndefined(guidelib.runtime.guideContext.xdpRef);
        },

        _isEditDesignMode : function () {
            if (window.CQ && window.CQ.WCM && (window.CQ.WCM.isEditMode() || window.CQ.WCM.isDesignMode())) {
                return true;
            } else {
                return false;
            }
        },

        /**
         *
         * This function does following:
         * a) On first call, it creates the uuid storage and returns the UUID
         * b) On subsequent calls, it just returns the uuid
         * c) if uuid is not created then it returns null
         *
         * @private
         */
        _getUUID : function () {
            if (this._formInstanceUUID) {
                return this._formInstanceUUID;
            }
            //Generate the UUID for the form instance on client side
            var successFlag = true;
            this._formInstanceUUID = guideBridge._produceUUID();
            successFlag = createUUIDStorage(this._formInstanceUUID);
            if (successFlag) {
                return this._formInstanceUUID;
            } else {
                return null;
            }
        },

        /**
         * This will produce new UUID
         * @returns {string}
         * @private
         */
        _produceUUID : function () {
            var uuid = $('div.guideContainerWrapperNode').data("tmproot"),
                uuidSuffix = Math.floor((Math.random() * 10000) + 1),
                uuidCurrentTime = new Date().getTime();
            return uuid + "_" + uuidCurrentTime + uuidSuffix;
        },

        /**
         * Signature of the callback for the GuideBridgeEvent Listener. It must be passed as handler in the
         * {@link GuideBridge#on|on} API.
         * @callback GuideBridge~GuideBridgeEventCallback
         * @param {jQuery.Event} event jQuery Event Object with target property being the instance of GuideBridge
         * @param {Object} payload Payload containing extra information in the API
         * @see {@link http://api.jquery.com/category/events/event-object/|jQuery.Event}
         * @since 6.0
         */
        /**
         * The API can be used to add an event listener for events triggered by GuideBridge object
         *
         * @summary add a listener on a GuideBridge Event.
         * @param eventName {string} name of the event for which listener has to be added. It must be one of the
         * following events
         * * bridgeInitializeComplete
         * * elementEnableChanged
         * * elementFocusChanged
         * * elementHelpShown
         * * elementLazyLoaded
         * * elementNavigationChanged
         * * elementValidationStatusChanged
         * * elementValueChanged
         * * elementVisibleChanged:
         * * guideAutoSaveStart
         * * submitStart
         * * validationComplete
         * @param {function} handler callback to be invoked whenever the event is triggered. The signature of the
         * callback is {@link GuideBridge~GuideBridgeEventCallback|GuideBridgeEventCallback}
         * @param {object} [context] The _this_ object in the _handler_ will point to _context_
         *
         * @method on
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */
        on : function (eventName, handler, context) {
            this._$target.on(eventName, handler, context);
        },

        /**
         * Unregister the event registered using the {@link GuideBridge#on|on} function
         *
         * @param eventName {string} name of the event to un-register.
         * @param [selector] {string} selector which should match the one originally passed to guideBridge's on() while registering handlers
         * @param [handler] {function} handler which needs to un-registered. If not provided all the event listeners
         * will be unregistered
         *
         * @method off
         * @memberof GuideBridge
         * @instance
         * @since 6.0
         */

        off : function (eventName, selector, handler) {
            this._$target.off(eventName, selector, handler);
        },

        /**
         * Internal API
         * @param extraParamerts
         * @param eventName
         * @private
         */
        trigger : function (eventName, extraParamerts) {
            this._$target.trigger(eventName, extraParamerts);
        },

        /**
         * This will  return information
         * weather the the file attachment preview
         * needs to be enabled or not
         * @private
         * */
        _disablePreview :  function () {
            if (guidelib.runtime && guidelib.runtime.guideContext) {
                return guidelib.runtime.guideContext.disablePreview;
            }
        },
        /**
         * If the name of the file attachments have to be made unique then the
         * vaule of this function would be true else false
         * @returns {*}
         * @private
         */
        _makeFileNameUnique :  function () {
            if (guidelib.runtime && guidelib.runtime.guideContext) {
                return guidelib.runtime.guideContext.makeFileNameUnique;
            }
        },
        /*this function is used to mince out
         * file attachmenemts name and dom in case of
         * anonymous user
         * */
        _getFileNameFileDomMap : function () {
            var fileAttachmentsList = [];
            this._getFileAttachmentsList(fileAttachmentsList);
            if (fileAttachmentsList.length > 0) {
                return this._juiceOutNameAndFileDomMap(fileAttachmentsList);
            }

        },

        /**
         * Returns the file attachment name and dom (input type=file) element
         * @param fileAttachmentsList object list of file attachment models
         * @returns {{fileName: Array, fileDom: Array}}
         * @private
         */
        _juiceOutNameAndFileDomMap : function (fileAttachmentsList) {
            var fileDoms = [],
                fullFileNames = [],
                fileCount = 0;
            _.each(fileAttachmentsList, function (fileAttachmentModel, index) {
                var fileName = fileAttachmentModel["fileAttachment"].value,
                    fileAttachmentModelValue = fileAttachmentModel.value,
                    fileNameList = guideBridge._makeFileNameUnique() && fileName && fileName[0] !== '/' ? fileAttachmentModelValue : fileName;
                if (fileNameList) {
                    var fileNames = fileNameList.split("\n");
                    var fileList = $.extend(true, [], fileAttachmentModel.fileList);
                    _.each(fileList, function (file, index) {
                        var nameOfFile = fileNames[index],
                            completeNameOfFile = null;
                        if (nameOfFile != null && file != null) {
                            //file can be null when you click save two times continuously without change in
                            //Adaptive Form context
                            completeNameOfFile = fileAttachmentModel.name + "/" + nameOfFile;
                            // case: if there is a file dom
                            if (!_.isString(file)) {
                                // Check if the value exist in the file, this is done because in IE9 and IE10 the list
                                // will have an extra empty dom
                                if ($(file).val().length > 0) {
                                    $(file).attr('name', completeNameOfFile);
                                    fullFileNames[fileCount] = completeNameOfFile;
                                    fileDoms[fileCount++] = $(file);
                                }
                            } else {
                                // since there is no file dom in case of draft reload, make it null
                                fullFileNames[fileCount] = file;
                                fileDoms[fileCount++] = null;
                            }
                        }
                    }, this);
                }
            }, this);
            return {
                "fileName" : fullFileNames,
                "fileDom" : fileDoms
            };
        },

        setValidationContext : function (context) {
            var ec = guidelib.util.ErrorConstants;
            if (typeof ec[context] === "number") {
                var nContext = ec[context];
                if (nValidationContext < nContext) {
                    nValidationContext = nContext;
                    sValidationContext = context;
                }
            }
        },

        unsetValidationContext : function (context) {
            if (context === sValidationContext) {
                nValidationContext = 0;
                sValidationContext = "";
            }
        },

        getValidationContext : function () {
            return sValidationContext;
        },

        /**
         * @summary Enable/Disable the swipe gesture for navigation on touch devices.
         * @param swiptLeft boolean flag to enable(true)/disable(false) the swipe left gesture to perform next item navigation
         * @param swipeRight boolean flag to enable(true)/disable(false) the swipe right gesture to perform previous item navigation
         * @method
         * @memberof GuideBridge
         * @since 6.3
         */
        enableSwipeGesture : function (swiptLeft, swipeRight) {
            $guideWrapperNode = $('.guideContainerWrapperNode');
            $guideWrapperNode.off('swipeleft', window.guideBridge._performItemDeepNavigationNext);
            $guideWrapperNode.off('swiperight', window.guideBridge._performItemDeepNavigationPrevious);
            if (swiptLeft) {
                $guideWrapperNode.on('swipeleft', window.guideBridge._performItemDeepNavigationNext);
            }
            if (swipeRight) {
                $guideWrapperNode.on('swiperight', window.guideBridge._performItemDeepNavigationPrevious);
            }
        },

        /**
         * Enable the next item navigation (deep) using swipe left gesture
         * @private
         */
        _performItemDeepNavigationNext : function () {
            window.guideBridge.setFocus({
                somExpression : null,
                focusOption : 'nextItemDeep',
                runCompletionScript : true,
                skipFieldFocus : true
            });
        },

        /**
         * Enable the previous item navigation (deep) using swipe right gesture
         * @private
         */
        _performItemDeepNavigationPrevious : function () {
            window.guideBridge.setFocus({
                somExpression : null,
                focusOption : 'prevItemDeep',
                runCompletionScript : true,
                skipFieldFocus : true
            });
        },

        /**
         * Update the model popup that appears at click of file attachment listing button
         * This function is currently run of the clickExp of fileAttachmentListingButton
         * @param node
         * @private
         */
        _updateFileListing : function (node) {
            var somExpression = node.somExpression,
                viewOfListingButton = guideBridge._guideView.getView(somExpression);
            viewOfListingButton._clearFileListing();
            guideBridge.visit($.proxy(viewOfListingButton._updateFileListing, viewOfListingButton));

        }
    });

    window.guideBridge = new GuideBridge();
    window.guideBridge._$target = $(window.guideBridge);

    try {
        var evnt = document.createEvent("CustomEvent");
        evnt.initCustomEvent("bridgeInitializeStart", true, true, {"guideBridge" : window.guideBridge});
        window.dispatchEvent(evnt);
    } catch (exception) {
        // written for env rhino to execute(for server side validation)
        // todo: once env rhino implements CustomEvent and initCustomEvent remove this
        // this._guide.logger().log(exception);
    }

    if (!window.guideBridge.userConfig["postExternalMessageConfig"]) {
        if (window !== window.parent) {
            try {
                window.parent.document.getElementById(window.name);
                //We are here means no cross domain issue. So if user has not defined custom postExternalMessageConfig and
                // then we'll create one which would just send event on parent.
                window.guideBridge.registerConfig("postExternalMessageConfig", {
                    "postExternalHandler" : function (message) {
                        try {
                            var tmpEvent = document.createEvent("CustomEvent");
                            tmpEvent.initCustomEvent(message.name, true, true, message.data);
                            window.parent.dispatchEvent(tmpEvent);
                        } catch (exception) {
                            // written for env rhino to execute
                            //this._guide.logger().log(exception);
                        }
                    }
                });
            } catch (e) {
                //ignore the error
            }
        }
    }

    window.guideBridge._postExternalMessage({
        name : "bridgeInitializeStart",
        data : {
            "guideBridge" : window.guideBridge
        }
    });
})($, _);
