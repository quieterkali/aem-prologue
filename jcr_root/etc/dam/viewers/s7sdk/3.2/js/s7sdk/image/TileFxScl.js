/*!************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
(function(a){a.Util.require("s7sdk.common.Geometry");a.Util.require("s7sdk.event.Event");if(!a.TileFxScl){a.TileFxScl=function(d,c,b){this.image=new Image();this.tileAddress=d;this.image.loaded=false;this.fmt=(typeof b=="string")?b:"jpg";this.transparent=((this.fmt.indexOf("png")!=-1||this.fmt.indexOf("gif")!=-1)&&(this.fmt.indexOf("-alpha")>0))?true:false;this.image.style.display="none";if(c!=null){this.loadTile(c)}};a.TileFxScl.TILE_SIZE=256;a.TileFxScl.TILE_LOADED="tileLoaded";a.TileFxScl.prototype.loadTile=function(b){a.Logger.log(a.Logger.FINER,"s7sdk.TileFxScl.loadTile - tileAddress.x: %0, tileAddress.y: %1",this.tileAddress.x(),this.tileAddress.y());var c=b+"&req=tile&rect="+this.tileAddress.x()*a.TileFxScl.TILE_SIZE+","+this.tileAddress.y()*a.TileFxScl.TILE_SIZE+","+this.tileAddress.w+","+this.tileAddress.h;c+="&fmt="+this.fmt;this.image.onload=this.onLoadImage;this.image.onerror=this.onErrorImage;this.image.onabort=this.onErrorImage;this.image.src=c};a.TileFxScl.prototype.onLoadImage=function(b){this.loaded=true;this.style.display="block";a.Event.dispatch(this,a.Event.TILE_LOADED,true)};a.TileFxScl.prototype.onErrorImage=function(b){a.Event.dispatch(this,a.Event.TILE_FAILED,true)};a.TileFxScl.prototype.getImage=function(){return this.image};a.TileFxScl.prototype.setUrl=function(b){this.loadTile(b)}}})(s7getCurrentNameSpace());