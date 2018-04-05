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
(function(b){b.pkg("s7sdk.favorites");b.Util.require("s7sdk.common.Button");b.Util.require("s7sdk.event.Event");if(!b.favorites.FavoritesButton){b.favorites.FavoritesButton=function FavoritesButton(c,e,d){b.Logger.log(b.Logger.CONFIG,"s7sdk.favorites.FavoritesButton constructor - containerId: %0, settings: %1 , compId: %2",c,e,d);arguments.callee.superclass.apply(this,[d,c,null,0,0,"s7favoritesbutton",e]);this.obj.favoritesButtonObj=this;var f=!!arguments[3];if(!f){return new b.common.ButtonControl(this)}else{return this}};b.Class.inherits("s7sdk.favorites.FavoritesButton","s7sdk.common.Button");b.favorites.FavoritesButton.prototype.symbols={TOOLTIP:"Favorites"};b.favorites.FavoritesButton.addDefaultCSS=function(g,f,i,k,j){var d=b.Util.css.createCssRuleText;var e=b.Util.css.createCssImgUrlText;k=(typeof k==="string")?k:"";var h="";if(i){h+=i[0]?d(f+"[state='up']",{"background-image":e(i[0])}):"";h+=i[1]?d(f+"[state='over']",{"background-image":e(i[1])}):"";h+=i[2]?d(f+"[state='down']",{"background-image":e(i[2])}):"";h+=i[3]?d(f+"[state='disabled']",{"background-image":e(i[3])}):""}h+=k;var c=d(f,{width:"28px",height:"28px","background-size":"contain","background-repeat":"no-repeat","background-position":"center","-webkit-touch-callout":"none","-webkit-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","user-select":"none","-webkit-tap-highlight-color":"rgba(0,0,0,0)"})+h;if(j){return c}else{b.Util.css.addDefaultCSS(c,g)}};b.FavoritesButton=b.favorites.FavoritesButton}if(!b.favorites.AddFavoriteButton){b.favorites.AddFavoriteButton=function AddFavoriteButton(d,g,f){b.Logger.log(b.Logger.CONFIG,"s7sdk.favorites.AddFavoriteButton constructor - containerId: %0, settings: %1 , compId: %2",d,g,f);var c=document.getElementById(d);if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){d=c.s7base.getPanelId()}f=(typeof f=="string"&&f.length)?f:"AddFavorite_"+b.Util.createUniqueId();var i=!!arguments[3];arguments.callee.superclass.apply(this,[f,d,0,0,"s7addfavoritebutton",g]);var h=this;var e=false;this.ontouchHandler=function(j){e=true};this.addEventListener("touchstart",this.ontouchHandler,false);this.onclickHandler=function(j){if(!(b.browser.supportsTouch())||(j instanceof MouseEvent)||e){if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){c.s7base.onFavoritesClick()}h.btnClick()}e=false};this.addEventListener("click",this.onclickHandler,false);if(!i){return new b.common.ButtonControl(this)}else{return this}};b.Class.inherits("s7sdk.favorites.AddFavoriteButton","s7sdk.common.TwoStateButton");b.favorites.AddFavoriteButton.prototype.symbols={TOOLTIP_SELECTED:"Disable Adding Favorite",TOOLTIP_UNSELECTED:"Enable Adding Favorite"};b.favorites.AddFavoriteButton.prototype.btnClick=function(){var c=new b.event.FavoritesEvent(b.event.FavoritesEvent.NOTF_ADD_FAVORITE,true);b.Event.dispatch(this.obj,c,false)};b.AddFavoriteButton=b.favorites.AddFavoriteButton;(function a(){var e=b.Util.css.createCssRuleText;var d=b.Util.css.createCssImgUrlText;var c=e(".s7addfavoritebutton[selected='true'][state='up']",{"background-image":d("addfavorite_up.png")})+e(".s7addfavoritebutton[selected='true'][state='over']",{"background-image":d("addfavorite_over.png")})+e(".s7addfavoritebutton[selected='true'][state='down']",{"background-image":d("addfavorite_down.png")})+e(".s7addfavoritebutton[selected='true'][state='disabled']",{"background-image":d("addfavorite_disabled.png")})+e(".s7addfavoritebutton[selected='false'][state='up']",{"background-image":d("addfavorite_over.png")})+e(".s7addfavoritebutton[selected='false'][state='over']",{"background-image":d("addfavorite_over.png")})+e(".s7addfavoritebutton[selected='false'][state='down']",{"background-image":d("addfavorite_over.png")})+e(".s7addfavoritebutton[selected='false'][state='disabled']",{"background-image":d("addfavorite_disabled.png")});b.favorites.FavoritesButton.addDefaultCSS("AddFavoriteButton",".s7addfavoritebutton",[],c)})()}if(!b.favorites.RemoveFavoriteButton){b.favorites.RemoveFavoriteButton=function RemoveFavoriteButton(d,g,f){b.Logger.log(b.Logger.CONFIG,"s7sdk.favorites.RemoveFavoriteButton constructor - containerId: %0, settings: %1 , compId: %2",d,g,f);var c=document.getElementById(d);if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){d=c.s7base.getPanelId()}f=(typeof f=="string"&&f.length)?f:"RemoveFavorite_"+b.Util.createUniqueId();var i=!!arguments[3];arguments.callee.superclass.apply(this,[f,d,0,0,"s7removefavoritebutton",g]);var h=this;var e=false;this.ontouchHandler=function(j){e=true};this.addEventListener("touchstart",this.ontouchHandler,false);this.onclickHandler=function(j){if(!(b.browser.supportsTouch())||(j instanceof MouseEvent)||e){if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){c.s7base.onFavoritesClick()}h.btnClick()}e=false};this.addEventListener("click",this.onclickHandler,false);if(!i){return new b.common.ButtonControl(this)}else{return this}};b.Class.inherits("s7sdk.favorites.RemoveFavoriteButton","s7sdk.common.TwoStateButton");b.favorites.RemoveFavoriteButton.prototype.symbols={TOOLTIP_SELECTED:"Disable Removing Favorite",TOOLTIP_UNSELECTED:"Enable Removing Favorite"};b.favorites.RemoveFavoriteButton.prototype.btnClick=function(){var c=new b.event.FavoritesEvent(b.event.FavoritesEvent.NOTF_REMOVE_FAVORITE,true);b.Event.dispatch(this.obj,c,false)};b.RemoveFavoriteButton=b.favorites.RemoveFavoriteButton;(function a(){var e=b.Util.css.createCssRuleText;var d=b.Util.css.createCssImgUrlText;var c=e(".s7removefavoritebutton[selected='true'][state='up']",{"background-image":d("removefavorite_up.png")})+e(".s7removefavoritebutton[selected='true'][state='over']",{"background-image":d("removefavorite_over.png")})+e(".s7removefavoritebutton[selected='true'][state='down']",{"background-image":d("removefavorite_down.png")})+e(".s7removefavoritebutton[selected='true'][state='disabled']",{"background-image":d("removefavorite_disabled.png")})+e(".s7removefavoritebutton[selected='false'][state='up']",{"background-image":d("removefavorite_over.png")})+e(".s7removefavoritebutton[selected='false'][state='over']",{"background-image":d("removefavorite_over.png")})+e(".s7removefavoritebutton[selected='false'][state='down']",{"background-image":d("removefavorite_over.png")})+e(".s7removefavoritebutton[selected='false'][state='disabled']",{"background-image":d("removefavorite_disabled.png")});b.favorites.FavoritesButton.addDefaultCSS("RemoveFavoriteButton",".s7removefavoritebutton",[],c)})()}if(!b.favorites.ViewAllFavoriteButton){b.favorites.ViewAllFavoriteButton=function ViewAllFavoriteButton(d,g,f){b.Logger.log(b.Logger.CONFIG,"s7sdk.favorites.ViewAllFavoriteButton constructor - containerId: %0, settings: %1 , compId: %2",d,g,f);var c=document.getElementById(d);if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){d=c.s7base.getPanelId()}f=(typeof f=="string"&&f.length)?f:"ViewAllFavorite_"+b.Util.createUniqueId();var i=!!arguments[3];arguments.callee.superclass.apply(this,[f,d,0,0,"s7viewallfavoritebutton",g]);var h=this;var e=false;this.ontouchHandler=function(j){e=true};this.addEventListener("touchstart",this.ontouchHandler,false);this.onclickHandler=function(j){if(!(b.browser.supportsTouch())||(j instanceof MouseEvent)||e){if(c&&(c.s7base instanceof b.favorites.FavoritesMenu)){c.s7base.onFavoritesClick()}h.btnClick()}e=false};this.addEventListener("click",this.onclickHandler,false);if(!i){return new b.common.ButtonControl(this)}else{return this}};b.Class.inherits("s7sdk.favorites.ViewAllFavoriteButton","s7sdk.common.TwoStateButton");b.favorites.ViewAllFavoriteButton.prototype.symbols={TOOLTIP_SELECTED:"Hide All Favorites",TOOLTIP_UNSELECTED:"View All Favorites"};b.favorites.ViewAllFavoriteButton.prototype.btnClick=function(){var c=new b.event.FavoritesEvent(b.event.FavoritesEvent.NOTF_VIEW_ALL_FAVORITES,true);b.Event.dispatch(this.obj,c,false)};b.ViewAllFavoriteButton=b.favorites.ViewAllFavoriteButton;(function a(){var e=b.Util.css.createCssRuleText;var d=b.Util.css.createCssImgUrlText;var c=e(".s7viewallfavoritebutton[selected='true'][state='up']",{"background-image":d("viewallfavorites_up.png")})+e(".s7viewallfavoritebutton[selected='true'][state='over']",{"background-image":d("viewallfavorites_over.png")})+e(".s7viewallfavoritebutton[selected='true'][state='down']",{"background-image":d("viewallfavorites_down.png")})+e(".s7viewallfavoritebutton[selected='true'][state='disabled']",{"background-image":d("viewallfavorites_disabled.png")})+e(".s7viewallfavoritebutton[selected='false'][state='up']",{"background-image":d("viewallfavorites_up.png")})+e(".s7viewallfavoritebutton[selected='false'][state='over']",{"background-image":d("viewallfavorites_over.png")})+e(".s7viewallfavoritebutton[selected='false'][state='down']",{"background-image":d("viewallfavorites_down.png")})+e(".s7viewallfavoritebutton[selected='false'][state='disabled']",{"background-image":d("viewallfavorites_disabled.png")});b.favorites.FavoritesButton.addDefaultCSS("ViewAllFavoriteButton",".s7viewallfavoritebutton",[],c)})()}if(!b.favorites.FavoritesMenuControl){b.favorites.FavoritesMenuControl=function(c){arguments.callee.superclass.apply(this,[c,b.favorites.FavoritesMenuControl.NS,c.constructor,b.favorites.FavoritesMenu.RESTRICTED_STYLES])};b.favorites.FavoritesMenuControl.NS="s7sdk.favorites.FavoritesMenuControl";b.favorites.FavoritesMenuControl.prototype.rebuild=function(f){if(this.component){var e=this.component.favoritesMenuPanel.childNodes;var c=[];if(e&&(e.length!=0)){for(var d=0;d<e.length;d++){c.push(e[d])}}this.superproto.rebuild.apply(this,[f]);if(c.length!=0){for(var d=0;d<c.length;d++){this.component.favoritesMenuPanel.appendChild(c[d])}}}};b.favorites.FavoritesMenuControl.prototype.getFavoritesButton=function(){return this.component.favoritesButton}}b.Class.inherits(b.favorites.FavoritesMenuControl.NS,"s7sdk.ControlComponent");if(!b.favorites.FavoritesMenu){b.favorites.FavoritesMenu=function FavoritesMenu(c,e,d){var f=!!arguments[3];d=(typeof d=="string"&&d.length)?d:"FavoritesMenu_"+b.Util.createUniqueId();b.Logger.log(b.Logger.CONFIG,"s7sdk.favorites.FavoritesMenu constructor - container: %0, settings: %1 , compId: %2",c,e,d);arguments.callee.superclass.apply(this,[d,c,"div","s7favoritesmenu",e,!f]);this.isTouch=b.browser.device.name!="desktop";this.stepSize=50;this.duration=300;this.delaytohide=2000;this.waitToHide=-1;this.state=0;this.lastMouse={x:-1000000,y:-1000000};this.container=this.getParent();this.wid=parseInt(b.Util.css.getCss("s7favoritesmenu","width",d,null,this.container));this.hei=parseInt(b.Util.css.getCss("s7favoritesmenu","height",d,null,this.container));this.items=[];this.createComponent();if(!f){return new b.favorites.FavoritesMenuControl(this)}else{return this}};b.Class.inherits("s7sdk.favorites.FavoritesMenu","s7sdk.UIComponent");b.favorites.FavoritesMenu.prototype.modifiers={bearing:{params:["bearing"],defaults:["left"],ranges:[["up","left","right","down","fit-vertical","fit-lateral"]]}};b.favorites.FavoritesMenu.prototype.symbols={TOOLTIP:"Favorites"};b.favorites.FavoritesMenu.RESTRICTED_STYLES={s7favoritesmenu:["width","height"]};b.favorites.FavoritesMenu.prototype.createComponent=function(){this.createElement();this.attachToContainer();this.favoritesButton=new b.favorites.FavoritesButton(this.id,this.settings,this.id+"_favoritesButton",true);this.favoritesButton.obj.style.position="absolute";if(isNaN(this.wid)||this.wid==0||isNaN(this.hei)||this.hei==0){this.wid=parseInt(b.Util.css.getCss("s7favoritesbutton","width",this.favoritesButton.obj.id,null,this.obj));this.hei=parseInt(b.Util.css.getCss("s7favoritesbutton","height",this.favoritesButton.obj.id,null,this.obj))}this.getTopContainer();var c=this;this.animate=setInterval(function(){c.enterFrame()},this.stepSize);this.favoritesButton.addEventListener("click",function(f){c.onFavoritesClick()},false);this.favoritesContainer=document.createElement("div");this.favoritesContainer.style.overflow="hidden";this.favoritesContainer.style.position="absolute";this.favoritesContainer.style.top="0px";this.favoritesContainer.style.left="0px";this.favoritesContainer.style.visibility="hidden";this.favoritesContainer.style.fontSize="0px";this.favoritesContainer.style.letterSpacing="0px";this.favoritesContainer.style.wordSpacing="0px";this.obj.insertBefore(this.favoritesContainer,this.favoritesButton.obj);this.favoritesMenuPanel=document.createElement("div");this.favoritesMenuPanel.id=this.id+"_favCtnr";this.favoritesMenuPanel.className="s7favoritesmenupanel";this.favoritesMenuPanel.style.position="relative";this.favoritesMenuPanel.style.display="inline-block";this.favoritesContainer.appendChild(this.favoritesMenuPanel);this.resize(this.wid,this.hei);if(this.isTouch){return}this.favoritesButton.addEventListener("mouseover",function(f){c.isOver=true;c.onFavoritesOver()},false);this.favoritesButton.addEventListener("mouseout",function(f){c.isOver=false;c.onFavoritesOut()},false);this.favoritesButton.addEventListener("focus",function(f){c.isOver=true;c.onFavoritesOver()},false);this.favoritesButton.addEventListener("blur",function(f){c.isOver=false;c.onFavoritesOut()},false);this.winMouseMoveHandler=function(f){f=f||window.event;c.lastMouse={x:b.Util.getEventPos(f).x,y:b.Util.getEventPos(f).y}};this.winMouseOutHandler=function(f){f=f||window.event;c.lastMouse={x:-1000000,y:-1000000}};var d=b.browser.name=="ie"?document:window;b.Event.addDOMListener(d,"mouseout",this.winMouseOutHandler,true);b.Event.addDOMListener(d,"mousemove",this.winMouseMoveHandler,true)};b.favorites.FavoritesMenu.prototype.getSize=function(){return{width:this.wid,height:this.hei}};b.favorites.FavoritesMenu.prototype.getPanelId=function(){return this.favoritesMenuPanel.id};b.favorites.FavoritesMenu.prototype.onFavoritesOut=function(){this.waitToHide=this.delaytohide};b.favorites.FavoritesMenu.prototype.onFavoritesOver=function(){this.show()};b.favorites.FavoritesMenu.prototype.checkMouse=function(){var e=b.Util.getObjPos(this.favoritesContainer);var d=this.lastMouse.x-e.x;var c=this.lastMouse.y-e.y;return(d>0&&d<this.favoritesContainer.offsetWidth&&c>0&&c<this.favoritesContainer.offsetHeight)};b.favorites.FavoritesMenu.prototype.onFavoritesClick=function(){if(!(this.state==0||this.state==3)){return}if(!this.isOver){this.show()}else{this.hide()}this.isOver=!this.isOver;this.waitToHide=-1};b.favorites.FavoritesMenu.prototype.initAnimate=function(){this.step=0;this.shiftSize=this.favoritesMenuPanel.offsetHeight;this.stepDuration=Math.ceil(this.shiftSize/(this.duration/this.stepSize));b.Util.css.setCSSAttributeSelector(this.favoritesMenuPanel,"state","start")};b.favorites.FavoritesMenu.prototype.getTopContainer=function(){var e=document.body;var c=this.obj;while(c!=null){c=c.parentNode;if(c!=null){if(typeof(c.s7base)=="object"&&b.common&&b.common.Container&&(c.s7base instanceof b.common.Container)){e=c;break}if(c==document.body){break}var d=b.Util.getStyle(c,"overflow");if(d=="hidden"){e=c;break}}}this.anchorObj=e};b.favorites.FavoritesMenu.prototype.getAnchorDimension=function(){var d;var c;this.dim=new b.Rectangle(0,0,0,0);if(this.anchorObj==document.body){if(typeof window.innerWidth!="undefined"){this.dim.width=window.innerWidth;this.dim.height=window.innerHeight}else{if(typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0){this.dim.width=document.documentElement.clientWidth;this.dim.height=document.documentElement.clientHeight}else{this.dim.width=document.getElementsByTagName("body")[0].clientWidth;this.dim.height=document.getElementsByTagName("body")[0].clientHeight}}}else{this.dim.width=this.anchorObj.clientWidth;this.dim.height=this.anchorObj.clientHeight;var e=b.Util.getObjPos(this.anchorObj);this.dim.x=e.x;this.dim.y=e.y}};b.favorites.FavoritesMenu.prototype.checkRoll=function(p,g){switch(this.bearing){case"up":return"U";case"left":return"L";case"right":return"R";case"down":return"D"}var n=true;var d=true;var o=true;var l=true;var i=true;var e=true;var h=true;var j=true;var f=true;var c=true;var m=true;var k=true;if(p.x-g.offsetHeight<this.dim.x){n=false}if(p.x+p.offsetWidth-g.offsetHeight<this.dim.x){d=false;o=false}else{if(p.y-g.offsetWidth<this.dim.y){d=false}if(p.y+p.offsetHeight+g.offsetWidth>this.dim.y+this.dim.height){o=false}}if(p.x+p.offsetWidth+g.offsetHeight>this.dim.x+this.dim.width){l=false}if(p.x+g.offsetHeight>this.dim.x+this.dim.width){i=false;e=false}else{if(p.y-g.offsetWidth<this.dim.y){i=false}if(p.y+p.offsetHeight+g.offsetWidth>this.dim.y+this.dim.height){e=false}}if(p.y-g.offsetHeight<this.dim.y){h=false}if(p.y+p.offsetHeight-g.offsetHeight<this.dim.y){j=false;f=false}else{if(p.x-g.offsetWidth<this.dim.x){j=false}if(p.x+p.offsetWidth+g.offsetWidth>this.dim.x+this.dim.width){f=false}}if(p.y+p.offsetHeight+g.offsetHeight>this.dim.y+this.dim.height){c=false}if(p.y+g.offsetHeight>this.dim.y+this.dim.height){m=false;k=false}else{if(p.x-g.offsetWidth<this.dim.x){m=false}if(p.x+p.offsetWidth+g.offsetWidth>this.dim.x+this.dim.width){k=false}}if(this.bearing=="fit-vertical"){if(c){return"D"}else{if(e){return"RD"}else{if(o){return"LD"}}}if(h){return"U"}else{if(i){return"RU"}else{if(d){return"LU"}}}return"B"}else{if(l){return"R"}else{if(k){return"DR"}else{if(f){return"UR"}}}if(n){return"L"}else{if(m){return"DL"}else{if(j){return"UL"}}}return"R"}};b.favorites.FavoritesMenu.prototype.show=function(){if(this.state!=0){return}this.favoritesContainer.style.left="0px";this.favoritesContainer.style.top="0px";this.favoritesContainer.style.width="";this.favoritesMenuPanel.style.left="0px";this.favoritesMenuPanel.style.display="";this.favoritesMenuPanel.style.top="0px";this.updateDisplayStyle("");var d=b.Util.getObjPos(this.favoritesContainer);d.offsetWidth=this.favoritesContainer.offsetWidth;d.offsetHeight=this.favoritesContainer.offsetHeight;var f=b.Util.getObjPos(this.favoritesButton.obj);f.offsetWidth=this.favoritesButton.obj.offsetWidth;f.offsetHeight=this.favoritesButton.obj.offsetHeight;this.shiftPos={x:f.x-d.x,y:f.y-d.y};this.getAnchorDimension();this.dir=this.checkRoll(f,d);this.initAnimate();this.isShowig=true;var e;this.shiftSize_A=this.shiftSize;switch(this.dir){case"L":this.favoritesContainer.style.left=-this.shiftSize+"px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesMenuPanel.style.left=this.shiftSize+"px";e=true;this.dir_bearing=true;break;case"LU":this.favoritesContainer.style.left=-this.shiftSize+f.offsetWidth+"px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesContainer.style.top=-f.offsetHeight+"px";this.favoritesMenuPanel.style.left=this.shiftSize+"px";e=true;break;case"LD":this.favoritesContainer.style.left=-this.shiftSize+f.offsetWidth+"px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesContainer.style.top=f.offsetHeight+"px";this.favoritesMenuPanel.style.left=this.shiftSize+"px";e=true;break;case"R":this.favoritesContainer.style.left=f.offsetWidth+"px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesMenuPanel.style.left=-this.shiftSize+"px";e=true;break;case"RU":this.favoritesContainer.style.left="0px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesContainer.style.top=-f.offsetHeight+"px";this.favoritesMenuPanel.style.left=-this.shiftSize+"px";e=true;break;case"RD":this.favoritesContainer.style.left="0px";this.favoritesContainer.style.width=this.shiftSize+"px";this.favoritesContainer.style.top=f.offsetHeight+"px";this.favoritesMenuPanel.style.left=-this.shiftSize+"px";e=true;break;case"U":this.favoritesContainer.style.left="0px";this.favoritesContainer.style.top=-this.shiftSize+"px";this.favoritesMenuPanel.style.top=this.shiftSize+"px";e=false;break;case"UL":this.favoritesContainer.style.left=-f.offsetWidth+"px";this.favoritesContainer.style.top=-this.shiftSize+f.offsetHeight+"px";this.favoritesMenuPanel.style.top=this.shiftSize+"px";e=false;break;case"UR":this.favoritesContainer.style.left=f.offsetWidth+"px";this.favoritesContainer.style.top=-this.shiftSize+f.offsetHeight+"px";this.favoritesMenuPanel.style.top=this.shiftSize+"px";e=false;break;case"D":this.favoritesContainer.style.left="0px";this.favoritesContainer.style.top=f.offsetHeight+"px";this.favoritesMenuPanel.style.top=-this.shiftSize+"px";e=false;break;case"DL":this.favoritesContainer.style.left=-f.offsetWidth+"px";this.favoritesContainer.style.top="0px";this.favoritesMenuPanel.style.top=-this.shiftSize+"px";e=false;break;case"DR":this.favoritesContainer.style.left=f.offsetWidth+"px";this.favoritesContainer.style.top="0px";this.favoritesMenuPanel.style.top=-this.shiftSize+"px";e=false;break}this.favoritesContainer.style.visibility="";if(e){if(b.browser.name==="ie"&&b.browser.version.major==7){this.updateDisplayStyle("inline")}else{this.updateDisplayStyle("inline-block")}}else{if(b.browser.name==="ie"&&b.browser.version.major==8){this.updateDisplayStyle("block")}else{var c=b.Util.css.getCss("s7favoritesmenu","position",this.obj.id,null,this.container);if(c=="relative"||c=="static"){this.updateDisplayStyle("block")}}}this.favoritesContainer.style.left=parseInt(this.favoritesContainer.style.left)+this.shiftPos.x+"px";this.favoritesContainer.style.top=parseInt(this.favoritesContainer.style.top)+this.shiftPos.y+"px";this.state=1};b.favorites.FavoritesMenu.prototype.hide=function(){this.step=0;this.stepDuration=Math.ceil(this.shiftSize_A/(this.duration/this.stepSize));this.isShowig=false;this.favoritesContainer.style.overflow="hidden"};b.favorites.FavoritesMenu.prototype.hidePanel=function(){if(this.state==0){return}this.isOver=false;this.state=2;this.hide()};b.favorites.FavoritesMenu.prototype.updateDisplayStyle=function(d){var e=this.favoritesMenuPanel.childNodes;for(var c=0;c<e.length;c++){if(b.Util.getStyle(e[c],"display")=="none"){continue}if(e[c].style.display!=d){e[c].style.display=d;e[c].style.zoom=1}}};b.favorites.FavoritesMenu.prototype.enterFrame=function(){switch(this.state){case 0:break;case 1:this.slideStep();break;case 2:this.slideStep();break;case 3:if(!this.isOver){if(!this.isTouch){if(this.checkMouse()){return}}this.waitToHide-=this.stepSize;if(this.waitToHide<0){this.hide();b.Util.css.setCSSAttributeSelector(this.favoritesMenuPanel,"state","start");this.state=2}}break}};b.favorites.FavoritesMenu.prototype.slideStep=function(){var d=new Date().getTime();if(this.step==0){this.sttime=d}var c=(this.isShowig?this.shiftSize_A-this.stepDuration*this.step:this.stepDuration*this.step);c=c<0?0:c;c=c>this.shiftSize_A?this.shiftSize_A:c;switch(this.dir){case"L":case"LU":case"LD":this.favoritesMenuPanel.style.left=c+"px";break;case"R":case"RU":case"RD":this.favoritesMenuPanel.style.left=-c+"px";break;case"U":case"UL":case"UR":this.favoritesMenuPanel.style.top=c+"px";break;case"D":case"DL":case"DR":this.favoritesMenuPanel.style.top=-c+"px";break}if((this.stepDuration*this.step>this.shiftSize_A)&&(c==0||c==this.shiftSize_A)){this.step=0;if(this.state==2){this.favoritesContainer.style.width="0px";this.favoritesContainer.style.visibility="hidden";this.favoritesContainer.style.left="0px";this.favoritesMenuPanel.style.left="0px";this.favoritesMenuPanel.style.top="0px";this.favoritesContainer.style.width="auto";this.favoritesContainer.style.overflow="hidden";this.state=0;b.Util.css.setCSSAttributeSelector(this.favoritesMenuPanel,"state","")}else{this.favoritesContainer.style.overflow="visible";this.waitToHide=this.delaytohide;this.state=3;b.Util.css.setCSSAttributeSelector(this.favoritesMenuPanel,"state","")}}this.step++};b.favorites.FavoritesMenu.prototype.resize=function(f,d){b.Logger.log(b.Logger.FINE,"FavoritesMenu.resize %0: %1x%2",this.id,f,d);this.favoritesContainer.style.width="0px";this.favoritesContainer.style.visibility="hidden";this.favoritesContainer.style.left="0px";this.favoritesMenuPanel.style.left="0px";this.favoritesMenuPanel.style.top="0px";this.favoritesContainer.style.width="auto";this.favoritesContainer.style.overflow="hidden";this.state=0;this.wid=f;this.hei=d;this.obj.style.width=f+"px";this.obj.style.height=d+"px";this.favoritesButton.resize(f,d);var g=this.favoritesMenuPanel.childNodes;for(var e=0;e<g.length;e++){var c=g[e];if(c.button){c.button.resize(f,d)}}};b.favorites.FavoritesMenu.prototype.getWidth=function(){return this.wid};b.favorites.FavoritesMenu.prototype.getHeight=function(){return this.hei};b.favorites.FavoritesMenu.prototype.activate=function(){this.favoritesButton.activate()};b.favorites.FavoritesMenu.prototype.deactivate=function(){this.favoritesButton.deactivate()};b.favorites.FavoritesMenu.prototype.cleanUp=function(){var c=b.browser.name=="ie"?document:window;b.Event.removeDOMListener(c,"mouseout",this.winMouseOutHandler,true);b.Event.removeDOMListener(c,"mousemove",this.winMouseMoveHandler,true);this.winMouseMoveHandler=null;this.winMouseOutHandler=null;if(this.animate){clearInterval(this.animate);this.animate=null}b.Util.removeTags(this.obj);this.obj.style.cssText=""};b.favorites.FavoritesMenu.prototype.dispose=function(){this.cleanUp();if(this.obj){if(this.obj.parentElement){this.obj.parentElement.removeChild(this.obj)}}};b.favorites.FavoritesMenu.prototype.setModifier=function(c){throw new Error("Trying to use setModifier on the Core class (FavoritesMenu) is unsupported! Please refer to SDK documentation on using setModifier.")};b.favorites.FavoritesMenu.prototype.setCSS=function(e,d,c){if(this.isRestrictedCSSProperty(b.favorites.FavoritesMenu.RESTRICTED_STYLES,d)){throw new Error("You cannot set "+e+" : "+d+" CSS property for this component ")}else{this.superclass.superclass.prototype.setCSS.apply(this,[e,d,c])}};b.FavoritesMenu=b.favorites.FavoritesMenu;(function a(){var f=b.Util.css.createCssRuleText;var e=b.Util.css.createCssImgUrlText;var c=f(".s7favoritesmenu",{width:"28px",height:"28px","-webkit-transform":"translateZ(0px)"})+f(".s7favoritesmenu .s7favoritesbutton",{"background-color":"#e7e7e7"})+f(".s7favoritesmenu .s7favoritesmenupanel[state='start']",{"-webkit-transform":"translateZ(0px)"})+f(".s7favoritesmenu .s7favoritesmenupanel",{"font-size":"0px","letter-spacing":"0px","word-spacing":"0px","background-color":"#e7e7e7"});var d=b.favorites.FavoritesButton.addDefaultCSS("",".s7favoritesmenu .s7favoritesbutton",["favoritesmenu_up.png","favoritesmenu_over.png","favoritesmenu_down.png","favoritesmenu_disabled.png"],null,true);c=d+c;b.Util.css.addDefaultCSS(c,"FavoritesMenu")})()}})(s7getCurrentNameSpace());