/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
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
 *
 */
    pdfSupported = function(){
        var ok = false;
        if (getBrowserName() == "ie") {
            if (window.ActiveXObject) {
                // check for presence of newer object
                try {
                    var oAcro7 = new ActiveXObject('AcroPDF.PDF.1');
                    if (oAcro7) {
                        ok = true;
                    }
                } catch (e) {
                }

                // iterate through version and attempt to create object
                for (x = 1; x < 10; x++) {
                    try {
                        var oAcro = eval("new ActiveXObject('PDF.PdfCtrl." + x + "');");
                        if (oAcro) {
                            ok = true;
                        }
                    } catch (e) {
                    }
                }

                // check if you can create a generic acrobat document
                try {
                    var p = new ActiveXObject('AcroExch.Document');
                    if (p) {
                        ok = true;
                    }
                } catch (e) {
                }

            }
        } else {
            if (navigator.plugins.length > 0) {
                for (var i=0;i<navigator.plugins.length;i++){
                    if (navigator.plugins[i].name.indexOf("Adobe Acrobat")>=0){
                        ok=true;
                    }
                }
            }
        }

        return ok;
    }


    getBrowserName = function () {
        return this.name = this.name || function() {
            var userAgent = navigator ? navigator.userAgent.toLowerCase() : "other";
            if(userAgent.indexOf("chrome") > -1)        return "chrome";
            else if(userAgent.indexOf("safari") > -1)   return "safari";
            else if(userAgent.indexOf("msie") > -1)     return "ie";
            else if(userAgent.indexOf("firefox") > -1)  return "firefox";
            return userAgent;
        }();
    }

    chromePluginInstalled = function(){
        var ok=false;
        if (navigator.userAgent.indexOf('Chrome') != -1){
            if (parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome') + 7).split(' ')[0]) >= 15){
                for (var i=0;i<navigator.plugins.length;i++){
                    if (navigator.plugins[i].name.indexOf("Adobe Acrobat")>=0){
                        ok=true;
                    }
                }
                return ok;
            }
        }
        return ok;
    }

