/*!************************************************************************
*
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
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
(function(b){b.pkg("s7sdk.set");b.Util.require("s7sdk.event.Event");b.Util.require("s7sdk.set.ThumbnailGridView");if(!b.set.InteractiveThumbnailGridViewControl){b.set.InteractiveThumbnailGridViewControl=function(c){arguments.callee.superclass.apply(this,[c,b.set.InteractiveThumbnailGridViewControl.NS,c.constructor,b.set.InteractiveThumbnailGridView.RESTRICTED_STYLES])};b.set.InteractiveThumbnailGridViewControl.NS="s7sdk.set.InteractiveThumbnailGridViewControl";b.set.InteractiveThumbnailGridViewControl.prototype.rebuild=function(f){if(this.component){var d=this.component.interactiveDataProperties;var e=this.component.interactiveData;var c=this.component.globalMediaSet;this.superproto.rebuild.apply(this,[f]);this.component.setMediaSet(c);this.component.setInteractiveData(e,d)}}}b.Class.inherits(b.set.InteractiveThumbnailGridViewControl.NS,"s7sdk.ControlComponent");if(!b.set.InteractiveThumbnailGridView){b.set.InteractiveThumbnailGridView=function InteractiveThumbnailGridView(c,f,e){var i=!!arguments[3];e=(typeof e=="string"&&e.length)?e:"InteractiveThumbnailGridView_"+b.Util.createUniqueId();b.Logger.log(b.Logger.CONFIG,"s7sdk.set.InteractiveThumbnailGridView constructor - container: %0, settings: %1 , compId: %2",c,f,e);arguments.callee.superclass.apply(this,[e,c,"div","s7interactivethumbnailgridview",f,!i]);var d=this;this.interactiveDataProperties=null;this.interactiveData=null;this.globalMediaSet=null;this.createElement();this.attachToContainer();this.innerThumbnailGridView=new b.ThumbnailGridView(e,f,e+"_thumbnailgridview",true);this.innerThumbnailGridView.serverUrl=this.serverUrl;this.innerThumbnailGridView.iscommand=this.iscommand;this.innerThumbnailGridView.maxloadradius=this.maxloadradius;this.innerThumbnailGridView.textPos=this.textPos;this.innerThumbnailGridView.enableDragging=this.enableDragging;this.innerThumbnailGridView.direction=this.direction;this.innerThumbnailGridView.fmt=this.fmt;this.innerThumbnailGridView.align=this.align;this.innerThumbnailGridView.scrollbar=this.scrollbar;var h=parseInt(b.Util.css.getCss("s7interactivethumbnailgridview","width",e,null,this.getParent()));var j=parseInt(b.Util.css.getCss("s7interactivethumbnailgridview","height",e,null,this.getParent()));this.resize(h,j);var g=this;this.swatchSelectedHandler=function(l){b.Logger.log(b.Logger.FINE,"Swatch[%0] selected",l.s7event.frame);var k=g.innerThumbnailGridView.currentSwatch_;setTimeout(function(){d.interactiveClickHandler(l,k)},100)};this.innerThumbnailGridView.addEventListener(b.event.AssetEvent.SWATCH_SELECTED_EVENT,this.swatchSelectedHandler);if(!i){return new b.set.InteractiveThumbnailGridViewControl(this)}else{return this}};b.Class.inherits("s7sdk.set.InteractiveThumbnailGridView","s7sdk.UIComponent");b.set.InteractiveThumbnailGridView.prototype.modifiers={serverUrl:{params:["isRootPath"],defaults:["/is/image/"]},iscommand:{params:["value"],defaults:[""],parseParams:false},maxloadradius:{params:["value"],defaults:[1],ranges:["-1:"]},textPos:{params:["textpos"],defaults:["bottom"],ranges:[["bottom","top","left","right","tooltip","none"]]},fmt:{params:["format"],defaults:["jpg"],ranges:[["jpg","jpeg","png","png-alpha","gif","gif-alpha"]]},direction:{params:["direction"],defaults:["auto"],ranges:[["auto","left","right"]]},enableDragging:{params:["enabled","overdragvalue"],defaults:[true,0.5],ranges:[,"0:1"]},scrollbar:{params:["enabled"],defaults:[true]},align:{params:["align"],defaults:["center"],ranges:[["left","center","right"]]}};b.set.InteractiveThumbnailGridView.RESTRICTED_STYLES={s7interactivethumbnailgridview:["width","height"],"s7interactivethumbnailgridview s7swatches s7thumb":["width","height"],"s7interactivethumbnailgridview s7swatches s7thumbcell":["margin-left","margin-right","margin-top","margin-bottom"],"s7interactivethumbnailgridview s7swatches s7label":["font-family","font-size","font-style"]};b.set.InteractiveThumbnailGridView.prototype.setCSS=function(e,d,c){if(this.isRestrictedCSSProperty(b.set.InteractiveThumbnailGridView.RESTRICTED_STYLES,d)){throw new Error("You cannot set "+e+" : "+d+" CSS property for this component ")}else{this.superproto.setCSS.apply(this,[e,d,c])}};b.set.InteractiveThumbnailGridView.prototype.setModifier=function(c){throw new Error("Trying to use setModifier on the Core class (InteractiveThumbnailGridView) is unsupported! Please refer to SDK documentation on using setModifier.")};b.set.InteractiveThumbnailGridView.prototype.setMediaSet=function(c){b.Logger.log(b.Logger.FINE,"s7sdk.set.InteractiveThumbnailGridView.setMediaSet - mediaSet: %0, type: %1",c,c?c.type:"");this.globalMediaSet=c};b.set.InteractiveThumbnailGridView.prototype.cleanUp=function(){this.innerThumbnailGridView.cleanUp();b.Util.removeTags(this.obj);this.obj.style.cssText=""};b.set.InteractiveThumbnailGridView.prototype.dispose=function(){this.globalMediaSet=null;this.interactiveDataProperties=null;this.interactiveData=null;this.innerThumbnailGridView.removeEventListener(b.event.AssetEvent.SWATCH_SELECTED_EVENT,this.swatchSelectedHandler);this.cleanUp();if(this.obj){if(this.obj.parentElement){this.obj.parentElement.removeChild(this.obj)}}};b.set.InteractiveThumbnailGridView.prototype.setInteractiveData=function(c,d){b.Logger.log(b.Logger.CONFIG,"InteractiveThumbnailGridView.setInteractiveData: %0, properties: %1",c,d);this.interactiveDataProperties=d;this.interactiveData=c;this.applyInteractiveData(c,d)};b.set.InteractiveThumbnailGridView.prototype.applyInteractiveData=function(d,e){b.Logger.log(b.Logger.CONFIG,"InteractiveThumbnailGridView.applyInteractiveData: %0, properties: %1",d,e);if(d){var c=this.createInteractiveMediaSet(d);if(c){this.innerThumbnailGridView.setMediaSet(c);this.build();return}}};b.set.InteractiveThumbnailGridView.prototype.build=function(){this.attachToContainer();this.innerThumbnailGridView.resize(this.totalWidth_,this.totalHeight_)};b.set.InteractiveThumbnailGridView.prototype.getInteractiveData=function(){return this.interactiveData};b.set.InteractiveThumbnailGridView.prototype.getInteractiveDataProperties=function(){return this.interactiveDataProperties};b.set.InteractiveThumbnailGridView.prototype.createInteractiveMediaSet=function(l){if(!l){return null}function c(k,i){if(k&&k instanceof Object){return k[i]}return null}var p=new b.MediaSetDesc();var j;var m="wid="+this.innerThumbnailGridView.tmbSize.width+"&hei="+this.innerThumbnailGridView.tmbSize.height;for(var g=0;g<l.length;g++){var o=l[g];var d=c(c(o,"swatches"),"item");if(d){if(b.Util.isArray(d)){for(var f=0;f<d.length;f+=1){var n=d[f];b.Logger.log(b.Logger.FINE,"swatches[%0][%1]: %2",g,f,n.s.l);var h=b.set.InteractiveThumbnailGridView.parseSwatch(n,j,m);var e=new b.ImageDesc(this.globalMediaSet,b.ItemDescType.IMG,n.s.n,h,n.dx,n.dy,j,n.s.isDefault,n.s.mod,n.s.pmod,n.s.l,null,null,null,true,false,true);p.items.push(e)}}}}return p};b.set.InteractiveThumbnailGridView.prototype.getWidth=function(){return this.totalWidth_};b.set.InteractiveThumbnailGridView.prototype.getHeight=function(){return this.totalHeight_};b.set.InteractiveThumbnailGridView.prototype.resize=function(c,d){b.Logger.log(b.Logger.FINE,"s7sdk.set.InteractiveSwatches.resize - width: %0, height: %1",c,d);this.totalWidth_=c;this.totalHeight_=d;this.obj.style.width=c+"px";this.obj.style.height=d+"px";this.build();b.UIComponent.prototype.resize.apply(this,[c,d])};b.set.InteractiveThumbnailGridView.prototype.addEventListener=function(e,d,c){b.Logger.log(b.Logger.FINE,"s7sdk.set.InteractiveThumbnailGridView.addEventListener - type: %0, handler: %1, useCapture: %2",e,d.toString().substring(0,d.toString().indexOf("(")),c);this.superproto.addEventListener.apply(this,[e,d,c])};b.set.InteractiveThumbnailGridView.prototype.interactiveClickHandler=function(d,n){d.preventDefault();d.stopPropagation();var o=n.item;if(!o){b.Logger.log(b.Logger.WARNING,"Invalid swatch item");return}b.Logger.log(b.Logger.FINE,"InteractiveThumbnailGridView click handler: href=%0, target=%1",o.href,o.target);if(o.href&&o.href.length>0){var k=o.href.toLowerCase();if(k.indexOf("quickview:")==0){var c=new Object();var r=o.href;var p=/^QUICKVIEW:(.+)$/gi;var h=p.exec(r);var g=(h!=null&&h.length==2?h[1]:"");var q=g.split("&");for(var f=0;f<q.length;f++){var e=q[f].split("=");if(e.length>1){c[e[0]]=decodeURIComponent(q[f].split("=")[1])}}var m=new b.event.InteractiveSwatchesEvent(b.event.InteractiveSwatchesEvent.SWATCH_QUICKVIEW_ACTIVATED,o.href,c,false);this.dispatchEvent(m)}else{if(k.indexOf("javascript:")==0){b.Logger.log(b.Logger.INFO,"Javascript is disabled")}else{var m=new b.event.InteractiveSwatchesEvent(b.event.InteractiveSwatchesEvent.SWATCH_URL_ACTIVATED,o.href,null,false);this.dispatchEvent(m);this.evaluateWebLink_(o.href,o.target)}}}else{}var l=this.getHREF(n.item);var j=new b.event.UserEvent(b.event.UserEvent.INTERACTIVE_THUMBNAIL_GRID_VIEW_SWATCH,[l],true);this.dispatchEvent(j);this.innerThumbnailGridView.selectSwatch(-1)};b.set.InteractiveThumbnailGridView.prototype.getHREF=function(c){if(c.href&&c.href.length){return c.href}return""};b.set.InteractiveThumbnailGridView.prototype.evaluateWebLink_=function(c,d){window.open(c,d||"_self")};b.set.InteractiveThumbnailGridView.parseSwatch=function(d,c,e){if(d.s&&d.s.n!=undefined){name=d.s.n;if(e&&e.length>0){name+=(name.indexOf("?")==-1)?"?":"&";name+=e}return new b.InteractiveSwatchDesc(name,d.s.c,d.s.l,c,d.s.mod,d.s.pmod,d.s.href,d.s.target)}return null};b.InteractiveThumbnailGridView=b.set.InteractiveThumbnailGridView;(function a(){var i=b.Util.css.createCssRuleText;var f=b.Util.css.createCssImgUrlText;var g=b.browser&&b.browser.name=="ie"&&b.browser.version.major<=8;var e=b.browser&&b.browser.name=="ie"&&b.browser.version.major>=10;var c=i(".s7interactivethumbnailgridview",{"background-color":g?"rgb(224, 224, 224)":"rgba(100, 100, 100, 0.2)",position:"absolute","user-select":"none","-ms-user-select":"none","-moz-user-select":"-moz-none","-webkit-user-select":"none","-webkit-tap-highlight-color":"rgba(0,0,0,0)","-ms-touch-action":e?"none":"","touch-action":e?"none":"",width:"500px",height:"250px"})+i(".s7interactivethumbnailgridview .s7thumbcell",{margin:"5px"})+i(".s7interactivethumbnailgridview .s7thumb",{border:"1px solid transparent",width:"75px",height:"75px"})+i(".s7interactivethumbnailgridview .s7thumb[state='selected']",{border:"1px solid #FFFFFF"})+i(".s7interactivethumbnailgridview .s7label",{"font-family":"Helvetica, sans-serif","font-size":"12px"});var h={display:"block",width:"20px",height:"20px"};var d=i(".s7interactivethumbnailgridview .s7scrollbar",{"background-color":g?"rgb(224, 224, 224)":"rgba(100, 100, 100, 0.2)",position:"absolute",top:"0px",bottom:"0px",right:"0px",width:"22px"})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollthumb",{width:"20px",position:"absolute",backgroundRepeat:"no-repeat",backgroundPosition:"center",height:"30px"})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollthumb[state='up']",{"background-image":f("scrollbar_thumb_up.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollthumb[state='over']",{"background-image":f("scrollbar_thumb_over.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollthumb[state='down']",{"background-image":f("scrollbar_thumb_down.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollthumb[state='disabled']",{"background-image":f("scrollbar_thumb_disabled.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolltrack",{width:"20px","background-color":"#cbcbcb"})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollupbutton",h)+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollupbutton[state='up']",{"background-image":f("scroll_up_up.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollupbutton[state='over']",{"background-image":f("scroll_up_over.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollupbutton[state='down']",{"background-image":f("scroll_up_down.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrollupbutton[state='disabled']",{"background-image":f("scroll_up_disabled.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolldownbutton",h)+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolldownbutton[state='up']",{"background-image":f("scroll_down_up.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolldownbutton[state='over']",{"background-image":f("scroll_down_over.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolldownbutton[state='down']",{"background-image":f("scroll_down_down.png")})+i(".s7interactivethumbnailgridview .s7scrollbar .s7scrolldownbutton[state='disabled']",{"background-image":f("scroll_down_disabled.png")});b.Util.css.addDefaultCSS(c+d,"InteractiveThumbnailGridView")})()}})(s7getCurrentNameSpace());