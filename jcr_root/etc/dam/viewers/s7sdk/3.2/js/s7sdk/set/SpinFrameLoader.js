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
(function(a){a.Util.require("s7sdk.set.SpinFrame");if(!a.SpinFrameLoader){a.SpinFrameLoader=function(b){this.delay=(null==b)?100:b;this.spinFrames=new Array();this.queue=new Array(a.SpinFrame.MAX_PRIORITY);for(var c=0;c<a.SpinFrame.MAX_PRIORITY;c++){this.queue[c]=[]}this.toLoad=1;this.timer=setInterval(a.Util.wrapContext(this.onProcess,this),this.delay);this.loading=0};a.SpinFrameLoader.prototype.load=function(b){if(b.view!=null){return}this.queue[b.priority-1].push(b)};a.SpinFrameLoader.prototype.reducePriority=function(){var b=this.toLoad;while(b-->0){this.queue[0]=this.queue.shift().concat(this.queue[0]);this.queue.push([])}};a.SpinFrameLoader.prototype.queueLength=function(){var c=0,b=0;for(;b<this.queue.length;b++){c+=this.queue[b].length}return c};a.SpinFrameLoader.prototype.onProcess=function(){var e,c=0,b,f;for(b=a.SpinFrame.MAX_PRIORITY-1;b>=0&&c<=this.toLoad;b--){f=this.queue[b];while(c<=this.toLoad&&f.length>0){e=f.shift();if(!e.loaded&&!e.isDisposed){e.loadFrame();var d=this;if(!e.view.loadResetImage){e.view.viewParent.onReadyToDislpay=function(){d.loading--}}else{e.view.onResetImageLoaded=a.Util.wrapContext(this.onResetImageLoaded,this)}this.loading++;c++}}}};a.SpinFrameLoader.prototype.onResetImageLoaded=function(){this.loading--};a.SpinFrameLoader.prototype.dispose=function(){if(this.timer){clearInterval(this.timer);this.timer=null}this.spinFrames=null;for(var b=a.SpinFrame.MAX_PRIORITY-1;b>=0;b--){var d,e;e=this.queue[b];while(e.length>0){d=e.shift();var c=this;if(d.view&&d.view.viewParent){d.view.viewParent.onReadyToDislpay=null;d.view.onResetImageLoaded=null}d.dispose();d=null}}this.queue=null}}})(s7getCurrentNameSpace());