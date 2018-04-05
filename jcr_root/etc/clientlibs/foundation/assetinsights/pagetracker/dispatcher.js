/**
 * While Pagetracker Core can be used AS-IS without any modifications, customers already using Adobe Analytics on their webpage
 * for tracking events other than Asset Insights (e.g., page-view events) can consider
 * the implementation below as a reference for integration.
 *
 * Reference implementation is scoped inside <code>assetAnalytics</code> object
 *
 * Pagetracker implements two call backs (registered in asset-embed-code)
 *  <code>assetAnalytics.core.assetLoaded</code>:
 *              called when 'load' event is dispatched for the asset-DOM-element
 *  <code>assetAnalytics.core.assetClicked</code>:
 *              called when 'click' event is dispatched for the asset-DOM-element
 *              this is relevant only when the asset-DOM-element has an anchor (<a>) tag
 *              as parent with a valid, external 'href' attribute
 *
 * Finally, Pagetracker implements an initialization function as
 *  <code>assetAnalytics.dispatcher.init</code>:
 *              called to initialize the Pagetracker component.
 *              This MUST be invoked before any of the asset-insights-events (Impressions and/or Clicks) are generated from
 *              the webpage
 * <code>assetAnalytics.dispatcher.init</code> optionally accepts an AppMeasurement object - if provided, it does not attempt to create
 * a new instance of AppMeasurement object.
 */

var AssetAnalytics = function() {
    this.attrTrackable = 'trackable';
    this.defaultTrackable = false;
    this.attrAssetID = 'aem-asset-id';
    this.assetImpressionPollInterval = 2000;
    this.charsLimitForGET = 1800; // bytes
    this.debug = false;
};

AssetAnalytics.prototype = function () {
    var log = function(msg) {
        if ((typeof _satellite !== "undefined") && _satellite.hasOwnProperty('notify')) {
            _satellite.notify(msg);
        } else if (this.hasOwnProperty('debug') && !!this.debug) {
            console.log('ASSET ANALYTICS: ' + msg);
        }
    };

    return {
        log : log
    };
}();

if (!window.assetAnalytics)
    window.assetAnalytics = new AssetAnalytics();

var AssetAnalyticsDispatcher = function () {
    this.s = '';
};

AssetAnalyticsDispatcher.prototype = function () {
    // context-data property names
    var cdProps = {
        assetSrc:'a.assets.source',
        assetIdList:'a.assets.idlist',
        assetClickedId:'a.assets.clickedid'
    },

    /**
     * This function is used to intialize Pagetracker component
     *
     * @param reportSuite  RSID to which tracking-calls are to be reported
     * @param trackingServer  Tracking Server for sending tracking-calls
     * @param visitorNamespace  Visitor Namespace to be specified in tracking-calls
     * @param sObject  existing AppMeasurement object reference.
     *                 If unspecified, Pagetracker Core shall create its own AppMeasurement object
     *                 If specified, <code>reportSuite</code>, <code>trackingServer</code>
     *                 and <code>visitorNamespace</code> are ignored
     * @param assetIdImpressionListVariable  listVar to put comma-separated-list of Asset IDs for
     *                                       Asset Impression Events in tracking-call, e.g. 'listVar1'
     * @param assetIdClickVariable  eVar to put Asset ID for Asset Click Events in, e.g. 'eVar3'
     * @param assetImpressionSucessEvent  event to include in tracking-calls for Asset Impression Events, e.g. 'event8'
     * @param assetClickSucessEvent  event to include in tracking-calls for Asset Click Events, e.g. 'event7'
     *
     * NOTE: Please make sure that conversion-variables and success-events specified below have been initialized
     *       in the RSID appropriately
     */
    init = function(reportSuite, trackingServer, visitorNamespace,
                    assetIdImpressionListVariable, assetIdClickVariable,
                    assetImpressionSucessEvent, assetClickSucessEvent, sObject) {
        if (!sObject) {
            this.s = new AppMeasurement();
            this.s.account = reportSuite;
            this.s.trackingServer = trackingServer;
            this.s.visitorNamespace = visitorNamespace;
            this.s.trackInlineStats = true;
            this.s.trackExternalLinks = false;
            this.s.linkInternalFilters = 'javascript:'; //optional: add your internal domain here
            this.s.linkLeaveQueryString = false;
            this.s.forcedLinkTrackingTimeout = 3000;
            this.s.clearVars();
        }
        else
            this.s = sObject;
    },

    setAssetSrcContextData = function (sObj) {
        if (!sObj.linkTrackVars || !(~sObj.linkTrackVars.indexOf('contextData.' + cdProps.assetSrc))) {
            sObj.contextData[cdProps.assetSrc] = 'AEM';
            sObj.linkTrackVars += ',' + 'contextData.' + cdProps.assetSrc;
        }
    },

    clearContextData = function(sObj, log) {
        var sObjCD = sObj.contextData;
        for (var prop in cdProps) {
            if (sObjCD.hasOwnProperty(cdProps[prop])) {
                delete sObjCD[cdProps[prop]];
            }
        }
        if (sObj.linkTrackVars) {
            var replaceRegex;
            for (var prop in cdProps) {
                replaceRegex = new RegExp('contextData.' + cdProps[prop], 'g');
                sObj.linkTrackVars = sObj.linkTrackVars.replace(replaceRegex, '');
            }
            replaceRegex = new RegExp(',{2,}', 'g');
            sObj.linkTrackVars = sObj.linkTrackVars.replace(replaceRegex, ',');
        }
        if (!!log && typeof log === 'function') {
            log('cleared AEM asset RMVVARs from s.contextData');
        }
    },

    trackAssetImpression = function(assetList) {
        if(this.s) {
            setAssetSrcContextData(this.s);
            this.s.contextData[cdProps.assetIdList] = assetList;
            this.s.linkTrackVars += ',' + 'contextData.' + cdProps.assetIdList;
        }
    },

    trackAssetClick = function(assetId, domObj) {
        if(this.s) {
            this.s.Util.cookieWrite(cdProps.assetClickedId, assetId);
            assetAnalytics.log('assetAnalytics.dispatcher.trackAssetClick wrote to cookie');
        }
    },

    updateAppMeasurementWithAssetClickedId = function() {
        if(this.s) {
            var assetId = this.s.Util.cookieRead(cdProps.assetClickedId);
            if (!!assetId) {
                setAssetSrcContextData(this.s);
                assetAnalytics.log('assetAnalytics.dispatcher.updateAppMeasurementWithAssetClickedId read from cookie');
                this.s.Util.cookieWrite(cdProps.assetClickedId, '');
                this.s.contextData[cdProps.assetClickedId] = assetId;
                this.s.linkTrackVars += ',' +'contextData.' + cdProps.assetClickedId;
            }
        }
    };

    return {
        init : init,
        clearContextData : clearContextData,
        trackAssetImpression : trackAssetImpression,
        trackAssetClick : trackAssetClick,
        updateAppMeasurementWithAssetClickedId : updateAppMeasurementWithAssetClickedId
    };
}();

if (!window.assetAnalytics.dispatcher)
    window.assetAnalytics.dispatcher = new AssetAnalyticsDispatcher();


