/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
/**
 *  Extends root model  to save generated script and event name of script
 *  this is currently not used anywhere but can be used in future when
 *  we can't parse the model but still be able to generate the merged script.
 */
(function (expeditor, guidelib) {
    var AFRootModel = guidelib.author.AFRootModel = expeditor.model.RootModel.extend({
        init : function (nodeName, ctx) {
            this._super.apply(this, arguments);
            this.script = "";
            this.eventName = "";
        },

        fromJson : function (jsonObj) {
            this._super.apply(this, arguments);
            this.script = jsonObj.script;
            this.eventName = jsonObj.eventName;
            return this;
        },

        toJson : function () {
            var obj = this._super.apply(this, arguments);
            obj.script = this.script;
            obj.eventName = this.eventName;
            return obj;
        },

        setScript : function (script) {
            this.script = script;
        },

        getScript : function () {
            return this.script;
        },

        setEventName : function (eventName) {
            this.eventName = eventName;
        },

        getEventName : function () {
            return this.eventName;
        }

    });
})(expeditor, guidelib);
