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

/**
 * If any bugs are found in the env rhino 1.2 release version
 * and if there is a fix available. All the fixes should be present here.
 * Please Note: This file should not be loaded in client, it should always
 * be loaded in server.
 *
 */
(function () {
    /**
     * Creating dummy alert method so that if any XFA or Guide Script has it
     * validation of Adaptive form in server side succeeds.
     * @param {msg} Message to be alerted
     */
    Envjs.alert = function (msg) {};

    /*DocumentEvent.prototype.createEvent = function(eventType) {
       var Clazz = this.__EventMap__[eventType];
       if (Clazz) {
           return new Clazz();
       }
       // custom event is not supported in env js
       // making sure if any one else(third party(fm or fp)) have written it, we don't throw an exception
       // done to make the code maintainable
       // throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
    }; */

    /**
     * Add XMLHttpRequest Level 2 onload and onerror callbacks
     */

    function defaultOnReadyStateHandler() {
         if (this.readyState == XMLHttpRequest.DONE) {
             if (this.status >= 200 && this.status < 300) {
                 if (typeof(this.onload) == "function") {
                     this.onload();
                 }
             } else {
                 if (typeof(this.onerror) == "function") {
                     this.onerror();
                 }
             }
         }
     }

    Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", {

        set : function (callbackHandler) {
             var self = this;

             this.__privateOnReadyStateChangeHandler__ = function () {
                 try {
                     //bound to xhr instance to work properly
                     defaultOnReadyStateHandler.call(self);
                 } catch (e) {
                     // ignore any error in default handler
                     console.log(e.message);
                 }
                 //must be bound to current context, not to xhr instance.
                 if (typeof(callbackHandler) == "function") {
                     callbackHandler.call(this);
                 }
             };
         },

        get : function () {
             return this.__privateOnReadyStateChangeHandler__ || defaultOnReadyStateHandler.bind(this);
         }

    });

}());
