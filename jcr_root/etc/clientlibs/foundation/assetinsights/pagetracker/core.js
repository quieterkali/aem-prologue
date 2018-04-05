
if (!window.assetAnalytics)
    window.assetAnalytics = new AssetAnalytics();

var AssetAnalyticsCore = function() {
    this.assetImpressionList = [];
    this.loadTimeoutVar = '';
};

AssetAnalyticsCore.prototype = function () {
    var getContainedAsset = function(el) {
            //tracking images right now
            if (el.tagName === 'IMG') {
                return el;
            } else {
                return el.getElementsByTagName('IMG')[0];
            }
    },

    isTrackable = function(el) {
        var trackVal;
        if (el && el.hasAttribute('data-'+assetAnalytics.attrAssetID) &&
            (el.getAttribute('data-'+assetAnalytics.attrAssetID).trim().length > 0)) {
            if ((trackVal = el.getAttribute('data-'+assetAnalytics.attrTrackable))) {
                assetAnalytics.log('assetAnalytics.core.isTrackable returns trackVal: ' + trackVal.toLowerCase());
                return (trackVal.toLowerCase() === 'true');
            }
        } else {
            assetAnalytics.log('assetAnalytics.core.isTrackable returns ' + false);
            return false;
        }
        assetAnalytics.log('assetAnalytics.core.isTrackable returns defaultTrackable: ' + assetAnalytics.defaultTrackable);
        return assetAnalytics.defaultTrackable;
    },

    getHREFedAnchor = function(el) {
        if (el.hasAttribute('href')) {
            if (el.getAttribute('href')[0] !== '#') {
                return el;
            }
        }
        return;
    },

    hasClickthrough = function (el) {
        if (getHREFedAnchor(el)) {
            return true;
        }
        return false;
    },

    getAssetId = function(el) {
        return getContainedAsset(el).getAttribute('data-'+assetAnalytics.attrAssetID);
    },

    processAssetClicked = function(el) {
        if (true == isTrackable(getContainedAsset(el)) && hasClickthrough(el)) {
            sendAssetClickthrough(el);
            return false;
        }
        return true;
    },

    processAssetLoaded = function(el) {
        assetAnalytics.log('assetAnalytics.core.processAssetLoaded with #assets=' + this.assetImpressionList.length);
        if (true == isTrackable(el)) {
            this.assetImpressionList.push(getAssetId(el));
        }
    },

    sendAssetClickthrough = function(el) {
        var id = getAssetId(el);
        assetAnalytics.dispatcher.trackAssetClick(id, el);
    },

    sendAssetImpressions = function() {
        assetAnalytics.log('assetAnalytics.core.sendAssetImpressions with #assets=' + this.assetImpressionList.length);
        while (this.assetImpressionList.length > 0) {
            var idList = '';
            for (i in this.assetImpressionList) {
                var allProcessed = true;
                var idStr = this.assetImpressionList[i] + ',';
                if ((idList.length + idStr.length) > assetAnalytics.charsLimitForGET) {
                    this.assetImpressionList.splice(0, i);
                    allProcessed = false;
                    break;
                } else {
                    idList += idStr;
                }
            }
            idList = idList.slice(0, -1);
            assetAnalytics.log('Added assets:' + idList);
            assetAnalytics.dispatcher.trackAssetImpression(idList);

            if (true === allProcessed) {
                this.assetImpressionList = [];
            }
        }
    },

    assetClicked = function (el) {
        assetAnalytics.log('assetAnalytics.core.assetClicked called');
        return processAssetClicked(el);
    },

    assetLoaded = function (el) {
        assetAnalytics.log('assetAnalytics.core.assetLoaded called');
        // aggregate asset-load events in 'assetImpressionList'
        processAssetLoaded.call(this, el);
        if (this.assetImpressionList.length < (assetAnalytics.charsLimitForGET/(getAssetId(el).length + 1))) {
            window.clearTimeout(this.loadTimeoutVar);
        } else {
            assetAnalytics.log('pending-asset-load charlimit reached - not clearing installed timeout');
        }
        // install time-out call-back to dispatch aggregated Insight Events
        /**
         * This makes the actual tracking call to Adobe Analytics
         * Since Asset Impression and Click events DO NOT correlate with Page View, an <code>s.tl()</code> call is made instead
         * of <code>s.t()</code>
         */
        this.loadTimeoutVar = window.setTimeout(function() {
                                if (window.assetAnalytics.core.assetImpressionList.length > 0) {
                                    window.assetAnalytics.core.optimizedAssetInsights();
                                    window.assetAnalytics.dispatcher.s.tl(true, 'o', 'Asset Insight Event', null, 'navigate');
                                    window.assetAnalytics.dispatcher.clearContextData(assetAnalytics.dispatcher.s, assetAnalytics.log);
                                }
                            }, assetAnalytics.assetImpressionPollInterval);
    },

    optimizedAssetInsights = function() {
        if (assetAnalytics.dispatcher.s && !assetAnalytics.dispatcher.s.abort) {
            assetAnalytics.dispatcher.clearContextData(assetAnalytics.dispatcher.s, assetAnalytics.log);
            assetAnalytics.dispatcher.updateAppMeasurementWithAssetClickedId();
            assetAnalytics.core.sendAssetImpressions();
        }
    },

    updateContextData = function () {
        if (assetAnalytics.dispatcher.s && !assetAnalytics.dispatcher.s.abort) {
            if ((typeof assetAnalytics.dispatcher.s.linkType !== "undefined") && ('e' == assetAnalytics.dispatcher.s.linkType))
                assetAnalytics.dispatcher.clearContextData(assetAnalytics.dispatcher.s, assetAnalytics.log);
        }
    };

    return {
        hasClickthrough : hasClickthrough,
        sendAssetImpressions : sendAssetImpressions,
        assetClicked : assetClicked,
        assetLoaded : assetLoaded,
        optimizedAssetInsights : optimizedAssetInsights,
        updateContextData : updateContextData
    };
}();

if (!window.assetAnalytics.core)
    window.assetAnalytics.core = new AssetAnalyticsCore();
