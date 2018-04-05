/*!************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
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
var s7riCallbacks = s7riCallbacks || [];
var s7riErrCallbacks = s7riErrCallbacks || [];

if (typeof s7responsiveImage == "undefined"){

/*------------------json-----------------*/

function s7RIJSONResponse(inArg, inId) {
	for (var i = 0; i < s7riCallbacks.length; i ++) {
		if (s7riCallbacks[i] != null){
			if (s7riCallbacks[i].id == parseInt(inId)){
				if (s7riCallbacks[i].callback){
					s7riCallbacks[i].callback(inArg);
				}
				delete s7riCallbacks[i];
			}
		}
	}
}

function s7jsonError(inArg, inId) {
	var alertErr = true;
	for (var i = 0; i < s7riErrCallbacks.length; i ++) {
		if (s7riErrCallbacks[i] != null){
			if (s7riErrCallbacks[i].id == parseInt(inId)){
				if (s7riErrCallbacks[i].callback){
					s7riErrCallbacks[i].callback(inArg);
				}
				delete s7riErrCallbacks[i];
				alertErr = false;
			}
		}
	}
	if (alertErr){
		if(typeof window.console != "undefined"){
			window.console.log(inArg.message);
		}
	}
}

//////////////////////////////
/*
function s7responsiveImage(<inImageElem>), where
inImageElem (Object) - existing IMG element on the page which should be made "responsive"
*/
function s7responsiveImage(inImageElem){
///////////////////////////////////////////////////////////////////
	/*------------------json-----------------*/
	function sjGetResponse(inReq, inImg, inCallback, inErrCallback) {
		var urljson = "";
		var tempi = inImg.indexOf("?");
		if(tempi >= 0){
			urljson = inImg + '&' + inReq;
		}else{
			urljson = inImg + '?' + inReq;
		}
		var id = sjHashCode(urljson);
		urljson += '&id=' + id+"&handler=s7RIJSONResponse";
		if (typeof inCallback != 'undefined'){
			s7riCallbacks.push({callback:inCallback,id:id});
		}
		if (typeof inErrCallback != 'undefined'){
			s7riErrCallbacks.push({callback:inErrCallback,id:id});
		}
		var oScript = document.getElementById('sjScript_'+id);
		if (oScript) {
			document.getElementsByTagName("head")[0].removeChild(oScript);
			oScript = null;
		}
		oScript = document.createElement('script');
		oScript.type = 'text/javascript';
		oScript.id= 'sjScript_'+id;
		oScript.src= urljson;
		if (typeof oScript!="undefined"){
			document.getElementsByTagName("head")[0].appendChild(oScript);
		}
	}


	function sjHashCode(d) {//unix style
		if (!d || d=="") return 1;
		var h=0,g=0;
		for (var i=d.length-1;i>=0;i--) {
			var c=parseInt(d.charCodeAt(i));
			h=((h << 6) & 0xfffffff) + c + (c << 14);
			if ((g=h & 0xfe00000)!=0) h=(h ^ (g >> 21));
		}
		return h;
	}

	/* end json*/

	function devPixelRatio() {
		var retVal = 1;
		if (window.devicePixelRatio) {
			retVal = window.devicePixelRatio;
		} else if (screen.deviceXDPI) {
			retVal = window.screen.deviceXDPI / window.screen.logicalXDPI;
		} else if ("matchMedia" in window && window.matchMedia) {
			if (window.matchMedia("(min-resolution: 2dppx)").matches || win.matchMedia("(min-resolution: 192dpi)").matches) {
				retVal = 2;
			} else if (window.matchMedia("(min-resolution: 1.5dppx)").matches || window.matchMedia("(min-resolution: 144dpi)").matches) {
				retVal = 1.5;
			}
		} 
		return retVal;
	};

	function updateZoomFactor() {
		var orientation = "landscape";
		var zoom = 1;
		if (typeof (window.orientation) != "undefined") {
			orientation = ((screen.width/screen.height) > 1) ? "landscape":"portrait";
			zoom = document.documentElement.clientWidth / window.innerWidth;
			return {zoom:zoom,orient:orientation};
		}else{
			if(document.documentElement.clientWidth > document.documentElement.clientHeight){ 
				orientation = "landscape";
			} else { 
				orientation = "portrait";
			}
			return {zoom:1,orient:orientation};
		}
	};


	//Function for Array.sort() numbers (numerically and ascending):
	function compareNumbers(a, b) {
		return a - b;
	}
	//Function for Array.sort() numbers (numerically and descending):
	function compareNumbersDesc(a, b) {
		return b - a;
	}

	//Function for Array.sort() breakpoints (by breakpoints.width and ascending):
	function compareBreakpoints(a, b) {
		return parseInt(a.width, 10) - parseInt(b.width, 10);
	}

///////////////////////////////////////////////////////////////////
	var testimg = inImageElem;
	if (!testimg){
		return;
	}
	var testimgSrc = testimg.getAttribute("src") || "";
	var dataSrc = testimg.getAttribute("data-src") || "";

	testimgSrc = (testimgSrc == "") ? (dataSrc != "") ? dataSrc : "" : testimgSrc;
	dataSrc = (dataSrc == "") ? (testimgSrc != "") ? testimgSrc : "" : dataSrc;
	if ((testimgSrc == "") && (dataSrc == "")){
		return;
	}	

	var oldW = 0;
	var oldTestImgWidth = 0;
	var newW = -1;
	var maxBreakpoints = 0;
	var minBreakpoints = 0;
	var maxBreakpointsIsCommands = "";
	var minBreakpointsIsCommands = "";
	var newIsCommands = "";
	var pixelRation = devPixelRatio();
	var scalemode = testimg.getAttribute("data-scalemode") || "upscale";
	
/**
*	data-breakpoints="<width>[:<IS_commands>][,<width>[:<IS_commands>]]"
*	{{<IS_commands>=(<IS_command>|<image_preset>)[&(<IS_command>|<image_preset>)]
*
*	, where
*	<width> is defined just like before
*
*	<IS_command> is an Image Serving command. Command should be specified as is, with the only condition: 
*	all occurrences of comma "," in command value should be replaced with "%2C".
*	IS "View" commands (as stated in IS documentation) are not supported.
*	Of course, any characters which are not allowed in HTML attribute value should be also escaped according to HTML rules.
*	<image_preset> is the name of the SPS Image Preset, wrapped in "$". 
*	For now we support only Image Presets which do not have size explicitly defined.
*
*	Example:
*	data-breakpoints="100:opcolorize=0xff0000,200:$MyPreset$,300:crop=100%2C200%2C300%2C400,400:op_blur=20&$MyOtherPreset$"
**/
	var arrBp = testimg.getAttribute("data-breakpoints");
	var breakpoints = (arrBp && arrBp.split(",").length > 0 ) ? arrBp.split(",") : null;
	if(breakpoints){
		for(var i = 0; i < breakpoints.length; i++ ){
			var data = breakpoints[i].split(":");
			if (data.length > 1){
				breakpoints[i] = {width:data[0]*pixelRation,isCommands:data[1]};
			}else{
				breakpoints[i] = {width:data[0]*pixelRation,isCommands:""};
			}
		}
	}
	if(breakpoints){
		for(var i = 0; i < breakpoints.length; i++ ){
			breakpoints[i].width = parseInt(breakpoints[i].width, 10);
			if (breakpoints[i].width >= maxBreakpoints) {
				maxBreakpoints = breakpoints[i].width;
				maxBreakpointsIsCommands = breakpoints[i].isCommands;
			}
			if (breakpoints[i].width <= minBreakpoints) {
				minBreakpoints = breakpoints[i].width;
				minBreakpointsIsCommands = breakpoints[i].isCommands;
			}
		}
		breakpoints.sort(compareBreakpoints);
	}
	

	var initialization = false;
    var ua = navigator.userAgent.toLowerCase(); 
	var isIE = ua.indexOf('msie'); 
	var ver = parseFloat(navigator.appVersion); 

	sjGetResponse(
		'req=props,json&scl=1',
		dataSrc,
		function(inArg) {
			initialization = true;
			testimg.style.width = "100%";
			testimg.maxWidth = parseInt(inArg["image.width"]);
			testimg.style.width = testimg.offsetWidth >= testimg.maxWidth? testimg.maxWidth+"px": "100%";
		},
		function(inArg) {
			if(typeof window.console != "undefined"){
				window.console.log('failed loading req=set for image [' + inURL + ']: ' + inArg.message);
			}
		}
	);

	
	function winResized(){
		if (!testimg || !testimg.parentNode || testimg.parentNode.nodeType === 11){
			if (tmr){
				clearInterval(tmr);
				tmr = null;
			} 
			return;
		}
		if (!initialization || !testimg.offsetWidth || testimg.offsetWidth <= 0){
			return;
		}
		newW = Math.round(testimg.offsetWidth*updateZoomFactor().zoom*devPixelRatio());
		if (breakpoints){
			for(var i = 0; i < breakpoints.length; i++ ){
				if (newW <= breakpoints[i].width && newW <= maxBreakpoints){
					newW = breakpoints[i].width;
					newIsCommands = breakpoints[i].isCommands
					break;
				}else if (newW >= maxBreakpoints){
					newW = maxBreakpoints;
					newIsCommands = maxBreakpointsIsCommands
					break;
				}
			}
		}
		if ((newW != oldW) || (oldTestImgWidth != testimg.offsetWidth)){
			var tmpOldW = newW;
			var tmpOldTestImgWidth = testimg.offsetWidth;
			var newImage = new Image();
			newImage.onload = function(){
				oldW = tmpOldW;
				oldTestImgWidth = tmpOldTestImgWidth;
				testimg.src = newImage.src;

				var ratio = newImage.width / newImage.height;

				testimg.style.width = testimg.offsetWidth >= testimg.maxWidth? testimg.maxWidth+"px": "100%";
				if ((isIE != -1) && (ver < 9)){
							testimg.style.height = testimg.offsetWidth / ratio+"px";
				}
			};

			newImage.onerror = function(){
				newImage.src = testimg.src;
			};

			newImage.onabort = function(){
			};
			
			//max "width" must be smaller original picture size 
			newW = Math.min(parseInt(testimg.maxWidth),newW);
			newImage.src = dataSrc + ((dataSrc.indexOf("?") == -1) ? "?" : "&") + "wid=" + newW+((newIsCommands !="") ? "&"+newIsCommands : "");
		}
	};

	var tmr = setInterval(winResized,500);
};

}

