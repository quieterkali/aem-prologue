/**
 ADOBE CONFIDENTIAL

 Copyright 2014 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

(function ($) {
    window.FD = window.FD || {};
    FD.FP     = FD.FP || {};
    FD.FP.Util = FD.FP.Util || {};

    FD.FP.Util = {
        currentLocale : "en",

        localeDictionary : null,

        setLocale : function(locale){
            this.currentLocale = locale;
            this.setLocaleDictionary(locale);
        },

        getLocale : function (){
            return this.currentLocale;
        },

        setLocaleDictionary : function (locale){
            if(this.localeDictionary == null){
                this.localeDictionary = CQ.I18n.getDictionary(locale);
            }
        },

        getLocalizedValue : function (message){
            return this.localeDictionary[message] || message;
        }
    }
})(jQuery);