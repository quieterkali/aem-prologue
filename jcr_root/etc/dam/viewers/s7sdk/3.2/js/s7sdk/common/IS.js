/*!************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2011 Adobe Systems Incorporated
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
**************************************************************************/
(function(b){b.Util.require("s7sdk.common.Data");if(!b.Callback){b.Callback=function a(h,g,f,e){this.onSuccess=h;this.onError=g;this.context=f;this.status=e};b.Callback.prototype.cleanUp=function d(){this.onSuccess=b.Callback.noop;this.onError=b.Callback.noop;this.context=b.Callback.noop};b.Callback.pending={};b.Callback.noop=function c(){}}if(!b.IS){b.IS=function(){this.callback=null;this.lastReqId=null};b.IS.STATUS_SUCCESS="success";b.IS.STATUS_ERROR="error";b.IS.STATUS_PENDING="pending";b.IS.STATUS_CANCELLED="cancelled";b.IS.prototype.getHttpReq=function(i,k,g,e){var j=this.lastReqId=this.getHashCode(i);var f=i+"&id="+j+"&handler="+b.namespacePrefix+"s7sdkJSONResponse";b.Callback.pending[j]=b.Callback.pending[j]||[];this.callback=new b.Callback(k,g,e,b.IS.STATUS_PENDING);b.Callback.pending[j].push(this.callback);var h=b.Util.byId("s7req_"+j);if(h){}h=document.createElement("script");h.setAttribute("id","s7req_"+j);h.setAttribute("type","text/javascript");h.setAttribute("language","javascript");h.setAttribute("src",f);if(b.browser.name==="ie"){b.Util.async(function(){b.Util.byFirstTag("head").appendChild(h)},this)}else{b.Util.byFirstTag("head").appendChild(h)}};b.IS.prototype.cancelHttpReq=function(){if((this.callback!=null)&&(this.callback.status==b.IS.STATUS_PENDING)){this.callback.status=b.IS.STATUS_CANCELLED;this.callback.cleanUp()}};b.IS.prototype.getStatus=function(){return this.callback.status};b.IS.prototype.getHashCode=function(k){if(!k||k==""){return 1}var f=0,j=0;for(var e=k.length-1;e>=0;e--){var l=parseInt(k.charCodeAt(e));f=((f<<6)&268435455)+l+(l<<14);if((j=f&266338304)!=0){f=(f^(j>>21))}}return f}}})(s7getCurrentNameSpace());