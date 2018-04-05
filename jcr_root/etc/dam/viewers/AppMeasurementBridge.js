/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
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

/**
 * Create the AppMeasurementBridge object that will instantiate AppMeasurement
 * Analytics support.  (Video Heartbeat library is instantiated when calling setVideoPlayer).
 * Values passed through params:
 * sdkNamespace: the namespace used to reference the SDK.  If Unspecified it defaults to "s7viewers".
 * company: equivalent to rootId in SPS, not used in AOD/AEM.
 * config2: name of the Analytics preset.
 * isRoot: ImageServing root (used to acquire Analytics data).  Default is "/is/image".
 * debugAnalytics: boolean (true or false) to control AppMeasurement built in console logging.
 * contentUrl: path to Viewer package.  Required when the HTML is outside the Viewer package.
 *
 * @param params List of parameters passed to the sdk.
 * @constructor
 */
var AppMeasurementBridge = function(params) {
    this.userdata = {};

    this.viewerType = 0;
    this.assetName = "";

    this.videoEventQueue = [];
    this.customEventQueue = [];

    if (params && params.hasOwnProperty("sdkNamespace")) {
        this.s7sdk = window[params.sdkNamespace].s7sdk;
    } else {
        this.s7sdk = s7viewers.s7sdk; // s7viewers is the default namespace
    }

    var preset = "";
    if (params && params.hasOwnProperty("company")) {
        preset += params.company;
        preset += "/";
    }
    if (params && params.hasOwnProperty("config2")) {
        preset += params["config2"];
    }

    var isRoot;
    if (params && params.hasOwnProperty("isRoot")) {
        isRoot = params.isRoot;
    }
    if (isRoot == null || isRoot.length < 1) {
        isRoot = "/is/image";
    }

    if (params && params.hasOwnProperty("contentUrl")) {
        this.contentUrl = params["contentUrl"];
    } else {
        this.contentUrl = "";
    }

    var companyPresetUrl = isRoot;  // this will be either server relative or absolute
    companyPresetUrl += "/" + preset + "?req=userdata,json";
    if (companyPresetUrl[0] == "/") {
        var svr = location.protocol + "//" + location.host;
        companyPresetUrl = svr + companyPresetUrl;
    }
    this.companyPresetUrl = companyPresetUrl;

    if (params && params.hasOwnProperty("debugAnalytics")) {
        this.debugAnalytics = params.debugAnalytics;
    } else {
        this.debugAnalytics = false;
    }

};

/**
 * Instantiate Custom variable based tracking.
 * @private
 */
AppMeasurementBridge.prototype.init = function() {
    this.appMeasurement = new AppMeasurement();

    this.viewerType = 0;
    this.assetName = "";

    var appMeasurement = this.appMeasurement;
    var userdata = this.userdata;

    appMeasurement.account = userdata["reportSuite"];
    appMeasurement.visitor = this.getMarketingCloudOrgId(userdata);
    appMeasurement.visitor.trackingServer = userdata["trackingServer"];

    /************************** CONFIG SECTION **************************/
    /* You may add or alter any code config here. */
    appMeasurement.charSet="UTF-8";
    /* Conversion Config */
    appMeasurement.currencyCode="USD";

    /* Link Tracking Config */
    appMeasurement.trackDownloadLinks=true;
    appMeasurement.trackExternalLinks=true;
    appMeasurement.trackInlineStats=true;
    appMeasurement.linkDownloadFileTypes="exe,zip,wav,mp3,mov,mpg,avi,wmv,doc,pdf,xls";
    appMeasurement.linkInternalFilters="javascript:,.";
    appMeasurement.linkLeaveQueryString=false;
    appMeasurement.linkTrackVars="None";
    appMeasurement.linkTrackEvents="None";

    appMeasurement.visitorNamespace=userdata["trackingNamespace"];
    appMeasurement.trackingServer=userdata["trackingServer"];

    while (this.customEventQueue.length > 0) {
        var eventData = this.customEventQueue.shift();
        this.customTrack(eventData.eventType, eventData.params);
    }
};

/**
 * Instantiate Heartbeat video tracking.
 * @private
 */
AppMeasurementBridge.prototype.initVideo = function() {
    var self = this;
    function VideoPlayerPluginDelegate() {}
    VideoPlayerPluginDelegate.prototype.getVideoInfo = function() {
        var videoInfo = new ADB.va.plugins.videoplayer.VideoInfo();
        videoInfo.id = self.videoAsset;
        videoInfo.name = self.videoAsset; // a nicer name is not available (trim path off?)
        videoInfo.length = self.videoDuration;
        videoInfo.streamType =  ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD;
        videoInfo.playerName = self.playerName;
        videoInfo.playhead = this.getCurrentPlayhead(); // e.g. 115 (obtained from the video player)
        return videoInfo;
    };
    VideoPlayerPluginDelegate.prototype.getAdBreakInfo = function() {
        return null;
    };
    VideoPlayerPluginDelegate.prototype.getAdInfo = function() {
        return null;
    };
    VideoPlayerPluginDelegate.prototype.getChapterInfo = function() {
        return null;
    };
    VideoPlayerPluginDelegate.prototype.getQoSInfo = function() {
        return null;
    };
    VideoPlayerPluginDelegate.prototype.getCurrentPlayhead = function () {
        if (self._videoPlayer) {
            var e = self._videoPlayer.videoElement;
            var currentTime = 0;
            if (e && e.hasOwnProperty("currentTime") && isFinite(e.currentTime)) {
                currentTime = e.currentTime;
            } else {
                currentTime = self._videoPlayer.getCurrentTime();
            }
            if (isNaN(currentTime)) {
                return 0; // in case _videoPlayer.getCurrentTime() returns nan
            }

            // S7-3268:  decimal points occasionally are lost
            // causing reporting to be exponentially wrong.
            return Math.round(currentTime / 1000);
        }
        return 0;
    };

    // Video Player plugin
    var vpPluginDelegate = new VideoPlayerPluginDelegate();
    this.videoPlayerPlugin = new ADB.va.plugins.videoplayer.VideoPlayerPlugin(vpPluginDelegate);
    var vpPluginConfig = new ADB.va.plugins.videoplayer.VideoPlayerPluginConfig();
    vpPluginConfig.debugLogging = this.debugAnalytics;
    this.videoPlayerPlugin.configure(vpPluginConfig);

    /*** Set up an AppMeasurement instance for Heartbeat tracking. ***/
    this.appMeasurementHeartbeat = new AppMeasurement();
    this.appMeasurementHeartbeat.account = this.userdata["reportSuite"];

    // add marketingCloudOrgId support
    this.marketingCloudOrgId = this.getMarketingCloudOrgId(this.userdata);

    var trackingServer = this.userdata["trackingServer"];
    // use marketingCloudServer to engage CNAME servers
    this.appMeasurementHeartbeat.visitor = Visitor.getInstance(this.marketingCloudOrgId, {
        trackingServer: trackingServer,
        //trackingServerSecure: trackingServer,
        marketingCloudServer: trackingServer,
        //marketingCloudServerSecure: trackingServer
    });

    this.appMeasurementHeartbeat.visitorID = "s7video";
    this.appMeasurementHeartbeat.charSet="UTF-8";

    this.appMeasurementHeartbeat.visitorNamespace=this.userdata["trackingNamespace"];
    this.appMeasurementHeartbeat.trackingServer=this.userdata["trackingServer"];

    this.appMeasurementHeartbeat.loadModule("Media");
    this.appMeasurementHeartbeat.Media.trackUsingContextData = true;
    this.appMeasurementHeartbeat.Media.contextDataMapping = null;
    this.appMeasurementHeartbeat.Media.channel = window.location.hostname;

    // Heartbeat setup
    var aaPlugin = new ADB.va.plugins.aa.AdobeAnalyticsPlugin(this.appMeasurementHeartbeat);
    var aaPluginConfig = new ADB.va.plugins.aa.AdobeAnalyticsPluginConfig();
    aaPluginConfig.channel = window.location.hostname;
    aaPluginConfig.debugLogging = this.debugAnalytics;
    aaPlugin.configure(aaPluginConfig);

    // Adobe Heartbeat plugin
    var ahPlugin = new ADB.va.plugins.ah.AdobeHeartbeatPlugin(this.appMeasurementHeartbeat);
    var ahPluginConfig =
        new ADB.va.plugins.ah.AdobeHeartbeatPluginConfig(document.location.protocol + "//aem.hb.omtrdc.net", "aem");
    ahPluginConfig.ovp = null;
    ahPluginConfig.sdk = null;
    ahPluginConfig.ssl = document.location.protocol.indexOf("https") == 0;
    ahPluginConfig.jobId ="sc_va";  // todo: is this still required?
    ahPluginConfig.playerName = this.playerName;
    ahPluginConfig.debugLogging = this.debugAnalytics;
    ahPlugin.configure(ahPluginConfig);

    // Heartbeat
    var plugins = [this.videoPlayerPlugin, aaPlugin, ahPlugin];
    var heartbeatDelegate = new ADB.va.HeartbeatDelegate();
    this.heartbeat = new ADB.va.Heartbeat(heartbeatDelegate, plugins);
    var heartbeatConfig = new ADB.va.HeartbeatConfig();
    heartbeatConfig.debugLogging = this.debugAnalytics;
    this.heartbeat.configure(heartbeatConfig);

    this.isOpened = false;
    this.isLoaded = false;
    this.videoAsset = null;

    // In case the VideoPlayer has emitted the LOAD UserEvent before
    // the VideoHeartbeat library has loaded, call trackVideoLoadOnce()
    // again.
    this.trackVideoLoadOnce(false);

    // handle any other queued events
    while (this.videoEventQueue.length > 0) {
        var eventData = this.videoEventQueue.shift();
        this.videoTrack(eventData.eventType, eventData.params);
    }
};

AppMeasurementBridge.prototype.dispose = function() {
    if (this.appMeasurement) {
        // AppMeasurement does not have a dispose or destroy API.
        this.appMeasurement = null;
    }
    if (this.heartbeat) {
        this.heartbeat.destroy();
        this.heartbeat = null;
        this.appMeasurementHeartbeat = null;

        this.isOpened = false;
        this.videoAsset = null;
    }
};

/**
 * For Custom Variable based Analytics only, given the varToken value, return the
 * correct value for an eVar or Prop.  This may be extracted from the params list, or it
 * may be extracted from the AppMeasurementBridge object depending on the value being requested.
 *
 * @param varToken The string used as an parameter name.
 * @param params Parameters to test against for specific variable.
 * @returns {String} Correct value for the variable in varToken.
 * @private
 */
AppMeasurementBridge.prototype.lookupVar = function(varToken, params) {
    //var rollover_keyProc = (rolloverInfo==undefined?this.findProductParam(params[1]):rolloverInfo);
    var rollover_keyProc = this.findProductParam(params[1]);
    if (varToken == "frame") {
        return this.viewerFrame;
    } else if (varToken == "viewerPage") {
        return this.appMeasurement.pageName;
    } else if (varToken == "pageLabel") {
        return this.appMeasurement.pageName;
    } else if (varToken == "viewerId") {
        return this.viewerType;
    } else if (varToken == "href") { // 5.0
        return params[1];
    } else if (varToken == "rollover_keyRaw") { //5.1
        return params[1];
    } else if (varToken == "rollover_key") { // 5.0
        return rollover_keyProc;
    } else if (varToken == "rollover_keyProc") { // 5.1
        return rollover_keyProc;
    } else if (varToken == "item") { // for v.0 support
        return rollover_keyProc;
    } else if (varToken == "asset") {
        return this.assetName;
    } else if (varToken == "subAsset") {
        return params[1];
    } else if (varToken == "progress") {
        return params[1];
    } else if (varToken == "timeStamp") {
        return params[1];
    } /*else if (varToken == "count") {
     return "('' + s.internalCounter)";
     }*/ else if (varToken == "action") {
        return params[1];
    } else if (varToken == "searchTerm") {
        return params[1];
    } else if (varToken == "lastFrame") {
        return this.lastFrame;
    } else if (varToken == "targetId") {
        return params[1];
    } else if (varToken == "label") {
        return params[2];
    }
    return "("+varToken+"==undefined?'':" + varToken + ")";
};


/**
 * Find the asset value within the query fragment.
 * Only used for some image map processing with Custom Variable Analytics.
 * @param query The query value from an url associated with a hover or click event.
 * @returns {String} Returns the most likely product or sku value in the url.
 * @private
 */
AppMeasurementBridge.prototype.findProductParam = function(query) {
    if (!query) return "";

    var dQuery;
    try {
        dQuery = decodeURIComponent(query);
    } catch (e) {
        dQuery = query;
    }
    var lQuery = dQuery.toLowerCase();

    var params = ["rolloverkey", "rollover_key", "p", "productkey", "pid"];
    for (var n in params) {
        if (!params.hasOwnProperty(n)) continue;
        var m1 = lQuery.indexOf(params[n]+'=');
        if (m1 == undefined || m1 == -1) continue;
        m1 += params[n].length + 1;

        var m2 = lQuery.indexOf("&", m1);
        lQuery = lQuery.replace("');void(0);");
        return (m2 > m1) ? dQuery.substring(m1, m2) : dQuery.substr(m1);
    }
    return "";
};

/**
 * Internal tracking handler for user defined tracking configuration.
 *
 * @ignore
 * @param eventType
 * @param params
 */
AppMeasurementBridge.prototype.customTrack = function(eventType, params) {
    this.appMeasurement.clearVars();

    if (eventType == "SWATCH") eventType = "PAGE";
    if (eventType == "SPIN") eventType = "PAGE";
    if (eventType == "TARG") eventType = "TARGET";
    if (eventType == "RELOAD") eventType = "SWAP";

    // Preprocess event data
    if (eventType == "LOAD") {
        this.lastFrame = this.viewerFrame = "";
        if (params.length > 1) {
            this.viewerType = params[1];
            var assetPos = 6;   // S7SDK asset position
            if (params.length >= assetPos) {
                this.assetName = params[assetPos]+'';
            }
        }
    } else if (eventType == "PAGE") {
        this.pageName = params[2];
        this.lastFrame = this.viewerFrame;
        this.viewerFrame = params[1];
    } else if (eventType == "SWAP") {
        this.lastFrame = this.viewerFrame;
        this.viewerFrame = params[1];
        if (params.length >= 2) {
            this.assetName = params[2];
        }
    }


    if (this.userdata.hasOwnProperty(eventType)){
        var vars = getVars(eventType, this.userdata);
        var linkTrackVars = '';
        for (var name in vars) {
            if (!vars.hasOwnProperty(name)) continue;
            this.appMeasurement[name] = this.lookupVar(vars[name], params);
            if (linkTrackVars.length > 0) linkTrackVars += ",";
            linkTrackVars += vars[name];
        }
        if (linkTrackVars.length == 0) linkTrackVars = 'None';
        this.appMeasurement.linkTrackVars = linkTrackVars;

        if (eventType == "LOAD") {
            this.appMeasurement.t();
        } else {
            this.appMeasurement.tl(this, 'o', eventType);
        }
    }

    function getVars(eventType, userdata) {
        var pairs;
        var vars = {};
        pairs = userdata[eventType].split('|');
        for (var pair in pairs) {
            if (pairs.hasOwnProperty(pair)) {
                var splitPair = pairs[pair].split(':', 2);
                if (splitPair.length == 2) {
                    vars[splitPair[0]] = splitPair[1];
                }
            }
        }
        return vars;
    }

};


/**
 * Internal tracking handler for video Heartbeat tracking.
 *
 * @ignore
 * @param eventType
 * @param params
 */
AppMeasurementBridge.prototype.videoTrack = function(eventType, params) {
    if (eventType == "LOAD") {
        // the LOAD event is sent before the Analytics libraries are completely
        // loaded.  Only local functions are available.
        if (params.length > 2) {
            this.playerName = params[2];
        } else {
            this.playerName = window.location.pathname.split('/').pop();
            this.playerName = this.playerName.split('.')[0];
        }
    } else if (eventType == "METADATA") {
        if (params[1] == "DURATION") {
            var newVideo = decodeURIComponent(this._videoPlayer.getAsset());
            this.videoDuration = paramToSeconds(params[2]);
            if (this.videoDuration > 0) {
                if (newVideo != this.videoAsset) {
                    this.videoAsset = newVideo;
                    if (this._videoPlayer.autoplay) {
                        this.isOpened = true;
                        this.trackVideoLoadOnce(true);
                    }
                }
                if (this.pendingPlay) {
                    this.videoPlayerPlugin.trackPlay();
                    this.pendingPlay = false;
                }
            }
        } else if (params[1] == "SEEK") {
            this.videoPlayerPlugin.trackSeekStart();
            this.videoPlayerPlugin.trackSeekComplete();
        }

    } else if (eventType == "SWAP") {
        if (this.isOpened) {
            this.isOpened = false;
            this.videoPlayerPlugin.trackVideoUnload();
            this.isLoaded = false;
        }

        // Video tracking is driven by METADATA events, not LOAD and SWAP
        // so there is no other notification required.  (Next asset may not
        // be a video).

    } else if (eventType == "PLAY") {
        if (!this.isOpened) {
            if (!this.videoDuration || isNaN(this.videoDuration)) {
                if (this._videoPlayer && this._videoPlayer.getDuration) {
                    this.videoDuration = Math.round(this._videoPlayer.getDuration()/1000);
                }
            }
            if (this.videoDuration && !isNaN(this.videoDuration)) {
                this.videoAsset = decodeURIComponent(this._videoPlayer.getAsset());
                this.trackVideoLoadOnce(true);
                this.isOpened = true;
                this.videoPlayerPlugin.trackPlay();
            } else {
                this.pendingPlay = true;
            }
        } else if (!this.isPlaying) { // pause condition
            this.isPlaying = true;
            this.videoPlayerPlugin.trackPlay();
        }
    } else if (eventType == "STOP") {
        if (this.isOpened) {
            this.isOpened = false;
            this.videoPlayerPlugin.trackPause();
        }
        this.videoPlayerPlugin.trackComplete();
        this.videoPlayerPlugin.trackVideoUnload();
        this.isLoaded = false;
        this.pendingPlay = false;
        this.isPlaying = false;
    } else if (eventType == "PAUSE" || eventType == "STALLED") {
        if (this.isOpened) {
            this.videoPlayerPlugin.trackPause();
        }
        this.pendingPlay = false;
        this.isPlaying = false;
    }

    // params come in as milliseconds
    function paramToSeconds(p) {
        if (null == p) {
            return 0;
        }
        var n = parseInt(p);
        if (isNaN(n)) {
            return 0;
        }
        return Math.round(n/1000);
    }
};

/**
 * Tracking the load event requires data that is available at different times during the
 * viewer loading process.  trackVideoLoadOnce will only send the load event when all the
 * correct data elements are available.
 * @param force {Boolean} If force is true, send the load event without duration data.
 */
AppMeasurementBridge.prototype.trackVideoLoadOnce = function(force) {
    if (!force) {
        if (!this.videoDuration || isNaN(this.videoDuration)) {
            return;
        }
    }
    if (!this.userdata.hasOwnProperty("trackingServer")) {
        // tracking is not configured
        return;
    }
    if (!this.videoAsset) {
        return; // maybe worth logging
    }

    if (!this.appMeasurementHeartbeat) {
        return;
    }

    if (!this.isLoaded || (this.loadedVideoAsset != this.videoAsset)) {
        this.appMeasurementHeartbeat.Media.playerName = this.playerName;

        this.videoPlayerPlugin.trackVideoLoad();
        this.isLoaded = true;
        this.loadedVideoAsset = this.videoAsset;
    }
};

/**
 *  Send tracking data to tracking server.
 *
 *  This function can be passed to TrackingManager.setCallback as the parameters
 *  are the same.  The only parameter used by AppMeasurementBridge is eventInfo which
 *  contains a comma separated list of event data.  The first element in the list is
 *  the event type (such as "LOAD" or "PLAY").  The AppMeasurementBridge.track function
 *  then passes the data to Adobe Analytics servers.
 *
 * @param instName {String} Container component name.  Not used.
 * @param compClass {String} Component CSS class name. Not used.
 * @param timeStamp {String} Event timestamp.  Not used.
 * @param objID {String} Component id.  Not used.
 * @param eventInfo {String} Comma separated ordered list of event data.
 */
AppMeasurementBridge.prototype.track = function(objID, compClass, instName, timeStamp, eventInfo) {
    var eventValues = eventInfo.split(',');
    var eventType = eventValues[0].toString();

    var params = [];
    var paramsRaw = eventInfo.split(",");
    for (var param in paramsRaw) {
        if (paramsRaw.hasOwnProperty(param)) {
            params.push(decodeURIComponent(paramsRaw[param])+'');
        }
    }

    // Heartbeat tracking
    if (this.appMeasurementHeartbeat || eventType == "LOAD") {
        this.videoTrack(eventType, params);
    } else {
        this.videoEventQueue.push({eventType: eventType, params: params});
    }

    // Legacy user defined tracking
    if (this.appMeasurement) {
        this.customTrack(eventType, params);
    } else {
        // for now only queue load events
        if (eventType == "LOAD") {
            this.customEventQueue.push({eventType: eventType, params: params});
        }
    }

};
/**
 * Connects the VideoPlayer component to the AppMeasurement Heartbeat tracking
 * system.
 * @param videoPlayer VideoPlayer component to be tracked.
 */
AppMeasurementBridge.prototype.setVideoPlayer = function(videoPlayer) {
    var self = this;
    var heartbeatCalled = false;

    this._videoPlayer = videoPlayer;

    // do these need to be loaded sequentially?
    // IF legacy Analytics is employed - this needs to move to the ctor
    this.loadScript(this.contentUrl + "../../AppMeasurement/VisitorAPI.js", baseLoadCallback);
    this.loadScript(this.contentUrl + "../../AppMeasurement/AppMeasurement.js", baseLoadCallback);
    this.loadScript(this.contentUrl + "../../AppMeasurement/AppMeasurement_Module_Media.js", baseLoadCallback);

    function baseLoadCallback() {
        if (typeof Visitor != "undefined"
            && typeof AppMeasurement != "undefined"
            && typeof AppMeasurement_Module_Media != "undefined"
            && !heartbeatCalled) {
            heartbeatCalled = true;
            self.loadScript(self.contentUrl + "../../AppMeasurement/VideoHeartbeat.min.js", callback);
        }
    }

    function callback() {
        var req = new self.s7sdk.IS();
        req.getHttpReq(self.companyPresetUrl, function(rsp, viewObj) {
            viewObj.userdata = rsp;
            viewObj.initVideo();
        }, function(rsp){
            // do nothing
        }, self);
    }
};


/**
 *  Load a script and call a function afterwards.  Used for VideoHeartbeat library,
 *  but should work with other libraries if need be.
 *  @param url          Url for library to be loaded.
 *  @param callback     Function to call after library is loaded.
 */
AppMeasurementBridge.prototype.loadScript = function(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

    script.onreadystatechange = function() {
        if (script.readyState == "loaded") {
            //head.appendChild(script);
        } else if (script.readyState == "complete") {
            callback();
        }
    };
    script.onload = callback;


    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
};


/**
 * Determine default Marketing Cloud Org ID to use based on the tracking server, in case
 * the value is not provided from provisioning yet (in the case of existing clients).
 * Note:  Visitor ctor will add @AdobeOrg to the string passed in, so it is not necessary here.
 *
 * @param userdata Contents of Analytics preset
 * @return MarketingCloudOrgId
 */
AppMeasurementBridge.prototype.getMarketingCloudOrgId = function(userdata) {
    if (userdata.hasOwnProperty("marketingCloudOrgId")) {
        return this.userdata["marketingCloudOrgId"];
    } else if (userdata["trackingServer"].indexOf("aemvideoap") === 0) {
        return "07909374573FA2A77F000101";
    } else if (userdata["trackingServer"].indexOf("aemvideoeu") === 0) {
        return "10FFE86B573FA1A57F000101";
    } else {
        // default to aemvideodal - NA
        return "0FC4E86B573F99CC7F000101";
    }
};

/**
 * Old interface with existing s7 tracking systems (should go away in 2.6 sdk).
 * @param eventInfo
 * @param rolloverInfo
 * @ignore
 */
function s7track(eventInfo, rolloverInfo) {
    if (!this.bridge) {
        this.bridge = new AppMeasurementBridge();
    }
    this.bridge.track(eventInfo);
}


