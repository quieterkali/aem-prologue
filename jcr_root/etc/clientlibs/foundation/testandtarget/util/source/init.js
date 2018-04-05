if (!window.CQ_Analytics) {
    window.CQ_Analytics = {};
}

// TODO is there a better way?
if (typeof CQ_Analytics.TestTarget !== 'undefined') {
    var oldTandT = CQ_Analytics.TestTarget;
}

CQ_Analytics.TestTarget = new function() {


    /**
     * Extracts the possible mbox parameters from an object, by looking for entry similar to
     *
     * {
     *   'name'  : 'mbox'
     *   'value' : '...'
     * }
     *
     * @param {Object} the object to inspect for mbox parameters
     */
    function extractMboxParameters(obj, parent) {

        if (!obj) {
            return;
        }

        // see http://stackoverflow.com/a/120280/112671, we want to skip traversal of DOM elements
        if ('nodeType' in obj) {
            return;
        }

        var key, value, parentKey, parentEntry;

        if (obj.hasOwnProperty('name') && obj.hasOwnProperty('value')) {
            for (parentItem in parent) {
                var parentEntry = parent[parentItem];
                if (typeof parentEntry === 'object') {
                    if (parentEntry.hasOwnProperty('name') && parentEntry['name'] == 'mbox') {
                        return parent;
                    }
                }
            }
            return parent;
        }

        for (key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            var newObj = obj[key];
            if (typeof newObj === 'object') {
                var extracted = extractMboxParameters(newObj, obj);
                if (extracted) {
                    return extracted;
                }
            }
        }

    }

    function isEditOrPreview() {
        var $COOKIE = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
            var tmp = c.match(/([^=]+)=(.*)/);
            if (tmp) re[tmp[1]] = unescape(tmp[2]);
            return re;
        }, {});

        return (typeof $COOKIE["wcmmode"] == "undefined"
                    || $COOKIE["wcmmode"] == "preview"
                    || $COOKIE["wcmmode"] == "edit");
    }

    function getCookieObject() {
        var $COOKIE = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
            var tmp = c.match(/([^=]+)=(.*)/);
            if (tmp) re[tmp[1]] = unescape(tmp[2]);
            return re;
        }, {});

        return $COOKIE;
    }

    function pullContent(path) {
        // if possible, force WCM mode as disabled to prevent edit decorations from being applied
        var wcmmode = CQ.shared.HTTP.getParameter(document.location.href, 'wcmmode');
        if (typeof CQ.WCM !== 'undefined') {
            wcmmode = "disabled";
        }
        if (wcmmode && wcmmode.length > 0) {
            path = CQ.shared.HTTP.addParameter(path, 'wcmmode', wcmmode);
        }

        // pull in the content
        var output = CQ.shared.HTTP.get(path);
        var isOk = (output && output.status && output.status == 200);
        var hasBody = (output && output.body && output.body.length > 0);

        if (isOk && hasBody) {
            return output;
        } else {
            if (console) console.log("Could not pull resource. Response[status:{},body:{}]", output.status, output.body);
            return null;
        }
    }

    /**
     * Creates editables for the DEFAULT offer.
     * This is called when the default offer is loaded in Touch UI
     * (mboxOfferDefault#onLoad())
     * @param container HTML node from which to read the "cq" nodes (tipically this is the default div of the mbox)
     */
    function createEditablesForDefault(container) {
        if (container.parentNode) {
            var editableNodesArray = container.parentNode.getElementsByTagName("cq"),
            // the "target" editable is the last one in this array, as getElementsByTagName
            // always returns the nodes in the order that they appear in the document
            // (regardless of depth)
                editableNode = editableNodesArray[editableNodesArray.length - 1];

            // pull the default content from the repo
            var defaultContent = pullContent(editableNode.getAttribute("data-path") + ".default.html");
            if (defaultContent !== null) {
                // put the new content in the DOM
                var scriptWrapper = document.createElement("div");
                scriptWrapper.innerHTML = defaultContent.body;
                container.parentNode.replaceChild(scriptWrapper, container);
                // run the scripts that we may have in the new content
                var scripts = container.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    eval(scripts[i].text);
                }
            }
        }
    }

    function pullContent(path, mboxName) {
        // if possible, force WCM mode as disabled to prevent edit decorations from being applied
        path = CQ.shared.HTTP.addParameter(path, 'wcmmode', 'disabled');

        var url = document.location.pathname,
            proxyUrl = url;
        if (url.indexOf(".html") !== -1) {
            proxyUrl = url.substring(0, url.lastIndexOf(".")) + ".targetoffer.html";
            proxyUrl += path;
        }

        // pull in the content
        var output = CQ.shared.HTTP.get(proxyUrl);
        var isOk = (output && output.status && output.status == 200);
        var hasBody = (output && output.body && output.body.length > 0);

        var _mboxId = 0;
        if (isOk && hasBody) {

            var outputWritten = false,
                _mboxId = 0;

            if (mboxName === "undefined") {

                var caller = arguments.callee.caller;
                // try and the detect the caller parameters by inspecting the caller stack
                while (caller) {
                    if (caller.arguments.length > 0) {
                        var mboxParameters = extractMboxParameters(caller.arguments[0]);
                        if (!mboxParameters) {
                            continue;
                        }
                        var i, entry;
                        for (i = 0; i < mboxParameters.length; i++) {
                            entry = mboxParameters[i];
                            if ('name' in entry && 'value' in entry) {
                                if (entry['name'] === 'mbox') {
                                    mboxName = entry['value'];
                                } else if (entry['name'] === 'mboxId') {
                                    _mboxId = entry['value'];
                                }
                            }
                        }
                    }
                    caller = caller.arguments.callee.caller;
                }
            } else {
                _mboxId = mboxFactoryDefault.get(mboxName).getId();
            }
            var target = document.getElementById("mboxImported-default-" + mboxName + "-" + _mboxId);

            if (!target && _mboxId == 0) {
                // try with the next mboxId if no target found
                target = document.getElementById("mboxImported-default-" + mboxName + "-" + (_mboxId + 1));
            }


            // if a target is found, process
            if (target) {
                // empty the target div first.
                while (target.firstChild) {
                    target.removeChild(target.firstChild);
                }

                // look for the wrapper div which tracks clicks
                var childDivs = target.getElementsByTagName('div');
                if (childDivs.length == 1) {
                    target = childDivs[0];
                }

                var scriptwrapper = document.createElement('div');
                scriptwrapper.innerHTML = output.body;
                target.appendChild(scriptwrapper);
                var scripts = target.getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    eval(scripts[i].text);
                }

                outputWritten = true;

                var parentElement = target.parentElement;
                if (parentElement) {
                    var event = document.createEvent("CustomEvent");
                    event.initEvent("target-dom-loaded", true, false);
                    event.mboxName = mboxName;
                    parentElement.dispatchEvent(event);
                }
            }

            // CQ-15679 - fallback in case we don't find a target div
            if (!outputWritten) {
                document.write(output.body);
            }
        } else {
            if (console) console.log("Could not pull resource. Response[status:{},body:{}]", output.status, output.body);
        }
    }

    /**
     * Appends the default ambit to the specified {@code path}.
     * The function assumes the brand on the 3rd segment of the path 
     * (i.e /content/campaigns/brand).
     * 
     * @param {String} path Resource path
     */
    function appendAmbitSegment(path) {
        return path.replace(/(\/content\/campaigns\/.*?)\/(.*)/, "$1/master/$2");
    }

    return {

        lateMboxArrivalTimeouts: {},

        /**
         * A simple object that holds the path to the default content for all the mboxes to the page.
         */
        defaults: {},

        isDebugMode: false,

        debug: function(message) {
            if (this.isDebugMode) {
                console.log(message);
            }
        },


        /**
         * Initialises the Adobe Target integration
         *
         * It reads the clientcode from either the clientcode parameter (deprecated) or from
         * the CQ_Analytics.TestTarget.clientCode variable (preferred).
         *
         * @param {String} clientcode the optional client code
         */
        init: function(clientcode) {

            if (window.CQ_Analytics
                && window.CQ_Analytics.TestTarget.clientCode) {
                clientcode = CQ_Analytics.TestTarget.clientCode;
            } else {
                CQ_Analytics.TestTarget.clientCode = clientcode;
            }

            if (clientcode) {

                // this diverges from the standard T&T mbox, but client-side simulation breaks if we don't do this
                // the reason is that T&T will set and 'mboxSession' cookie when mboxXDomain == true, which we
                // can't override

                if (this.isInSimulationMode()) {
                    mboxFactories.each(function(mboxFactoryName) {
                        var mboxFactory = mboxFactories.get(mboxFactoryName);
                        mboxFactory.getUrlBuilder().addParameter("mboxXDomain", "disabled");
                    });
                }


                if (mboxGetPageParameter("mboxDebug") != null
                    || mboxFactoryDefault.getCookieManager().getCookie("debug") != null) {
                    setTimeout(
                        function() {
                            if (typeof mboxDebugLoaded == 'undefined') {
                                alert('Could not load the remote debug.\nPlease check your connection to Adobe Target servers');
                            }
                        }, 60 * 60);
                    document.write('<'
                        + 'scr'
                        + 'ipt language="Javascript1.2" src='
                        + '"http://admin4.testandtarget.omniture.com/admin/mbox/mbox_debug.jsp?mboxServerHost='
                        + server + '&clientCode=' + clientcode + '"><'
                        + '\/scr' + 'ipt>');
                }


                mboxVizTargetUrl = function(_) {
                    if (!mboxFactoryDefault.isEnabled()) {
                        return;
                    }

                    var v = mboxFactoryDefault.getUrlBuilder().clone();
                    v.setBasePath('/m2/' + clientcode + '/viztarget');

                    v.addParameter('mbox', _);
                    v.addParameter('mboxId', 0);
                    v.addParameter('mboxCount',
                        mboxFactoryDefault.getMboxes().length() + 1);

                    var pb = new Date();
                    v.addParameter('mboxTime', pb.getTime() -
                        (pb.getTimezoneOffset() * 60000));

                    v.addParameter('mboxPage', mboxGenerateId());

                    var c = mboxShiftArray(arguments);
                    if (c && c.length > 0) {
                        v.addParameters(c);
                    }

                    v.addParameter('mboxDOMLoaded', mboxFactoryDefault.isDomLoaded());

                    mboxFactoryDefault.setVisitorIdParameters(v);

                    return v.buildUrl();
                };
            }

            /**
             * Removes the default div from this mbox
             *
             * <p>This function is useful when the DOM on the page changes to prevent the cached DOM element from being
             * a disconnected from the actual document.</p>
             */
                // TNT-16921
            mbox.prototype.clearDefaultDiv = function() {
                if (typeof this.relocateDefaultDiv !== "undefined") {
                    this.relocateDefaultDiv();
                } else {
                    // fallback to the minified version
                    this.Sb=null;
                }

            };
        },

        /**
         * Fetches the resource from provided path and writes the
         * response to the document or the mbox Element if
         *
         * <ul>
         * <li>response status code is 200</li>
         * <li>response has a body with length > 0</li>
         * </ul>
         *
         * Uses a synchronous call for requesting the resource. If a WCM mode is defined this
         * call forces the resource to be rendered with WCM mode disabled.
         *
         * @static
         * @param {String} path Path to document/node to request.
         * @param {String} mboxName The name of the mbox that issued the request
         * @param {String} version API version indicator
         */
        pull: function(path, mboxName, version) {

            // if version parameter omitted, assume path without ambit segment
            if (typeof version === 'undefined') {
                path = appendAmbitSegment(path);
            }

            pullContent(path, mboxName);
        },

        /**
         * Triggers an update of all the registered mboxes
         *
         * <p>Delays the update requests based on the <tt>delay</tt> parameter so that multiple update requests
         * are clumped together.</p>
         *
         * @param delay {Integer} the delay in milliseconds to apply to the reload, defaults to 500
         */
        triggerUpdate: function(delay) {

            if (typeof delay == "undefined")
                delay = 500;

            if (!CQ_Analytics.TestTarget.reloadRequested) {
                CQ_Analytics.TestTarget.reloadRequested = true;
                setTimeout(function() {
                    CQ_Analytics.TestTarget.forceMboxUpdate();
                    CQ_Analytics.TestTarget.reloadRequested = false;
                }, delay);
            }
        },

        registerMboxUpdateCalls: function() {
            if (typeof window.CQ_Analytics !== "undefined"
                && window.CQ_Analytics.TestTarget.mappings) {
                CQ_Analytics.TestTarget.debug("[Target][init] Registering Mbox update calls");
                CQ_TestTarget = {};
                var mappedProperties = CQ_Analytics.TestTarget.getMappedProperties();

                if (mappedProperties.length > 0) {
                    CQ_Analytics.TestTarget.registerContextHubListeners();
                    CQ_Analytics.TestTarget.registerListeners();
                } else {
                    if (typeof ClientContext !== "undefined" && ClientContext.get("campaign")) {
                        var campaignStore = ClientContext.get("campaign");
                        if (campaignStore && campaignStore.isCampaignSelected()) {
                            return;
                        }
                    }
                    CQ_Analytics.TestTarget.callMboxUpdate();
                }
            }
        },

        /**
         * Leverages both ClientContext and ContextHub to fetch the value of a variable
         * @param keypath
         */
        getContextVariable: function(keypath) {
            var value        = undefined,
                contextValue = undefined;
            if (window.ContextHub) {
                contextValue = ContextHub.get(keypath);
            } else {
                contextValue = CQ_Analytics.ClientContext.get(keypath);
            }
            if (contextValue) {
                if (Array.isArray(contextValue)) {
                    value = contextValue.join(",");
                } else if (typeof contextValue !== "object") {
                    value = contextValue;
                }
            }
            return value;
        },

        maxProfileParams: 200,

         callMboxUpdate: function() {
            if (window.CQ_Analytics
                && window.CQ_Analytics.mboxes) {
                for (var i = 0; i < CQ_Analytics.mboxes.length; i++) {
                    var updateArgs = [CQ_Analytics.mboxes[i].name];
                    var profileParams = 0;
                    if (!CQ_Analytics.mboxes[i].defined) {
                        var callParameters = [CQ_Analytics.mboxes[i].id,CQ_Analytics.mboxes[i].name];
                        mboxDefine.apply(undefined, callParameters.concat(CQ_Analytics.mboxes[i].staticParameters));
                        CQ_Analytics.mboxes[i].defined = true;
                    }
                    for (var j = 0; j < CQ_Analytics.mboxes[i].mappings.length; j++) {
                        var profileprefix = "";
                        var param = CQ_Analytics.mboxes[i].mappings[j].param;
                        var keypath = '/' + CQ_Analytics.mboxes[i].mappings[j].ccKey.replace('.', '/');
                        if (CQ_Analytics.mboxes[i].isProfile.indexOf(param) > -1) {
                            if (CQ_Analytics.TestTarget.maxProfileParams > 0 && ++profileParams > CQ_Analytics.TestTarget.maxProfileParams) {
                                mboxUpdate.apply(this, updateArgs);
                                updateArgs = [CQ_Analytics.mboxes[i].name];
                                profileParams = 0;
                            }
                            /* we should always apply the prefix, to prevent parameter name collisions */
                            /*if (!param.match(/^profile\..*$/)) {*/
                            profileprefix = "profile.";
                            /*}*/
                        }
                        updateArgs.push(profileprefix + param + "=" + CQ_Analytics.DataProvider.replaceVariables(CQ_Analytics.TestTarget.getContextVariable(keypath)));
                    }

                    if (CQ_Analytics.mboxes[i].includeResolvedSegments && CQ_Analytics.SegmentMgr) {
                        var resolvedSegments = CQ_Analytics.SegmentMgr.getResolved();
                        if (resolvedSegments.length > 0) {
                            updateArgs.push('profile._cq_.resolvedSegments=|' + CQ_Analytics.SegmentMgr.getResolved().join('|') + '|');
                        }
                    }
                    /* space out the first call, which is probably the global mbox, by 100 ms,
                     * to give T&T time to process the profile and use it in the next update calls
                     */
                    var that = this;
                    (function(args) {
                        setTimeout(function() {
                            mboxUpdate.apply(that, args)
                        }, (i > 0 ? 100 : 0));
                    })(updateArgs);
                }
            }
        },

        /**
         * Returns an Array of session store names used in
         * CQ_Analytics.mboxes mappings. Returns empty Array if none
         * found.
         */
        getMappedSessionstores: function() {
            var storenames = [];
            if (window.CQ_Analytics
                && window.CQ_Analytics.mboxes) {
                for (var i = 0; i < CQ_Analytics.mboxes.length; i++) {
                    for (var j = 0; j < CQ_Analytics.mboxes[i].mappings.length; j++) {
                        var mapping = CQ_Analytics.mboxes[i].mappings[j].ccKey;
                        var tmp = mapping.split(".");
                        var storename = tmp[0];
                        var key = tmp[1];
                        if ($CQ.inArray(storename, storenames) < 0) {
                            storenames.push(storename);
                        }
                    }
                }
            }
            return storenames;
        },

        /**
         * Returns an Array of property names used in
         * CQ_Analytics.mboxes mappings. Returns empty Array if none
         * found.
         */
        getMappedProperties: function() {
            var properties = [];
            if (window.CQ_Analytics
                && window.CQ_Analytics.TestTarget
                && window.CQ_Analytics.TestTarget.mappings) {
                for (var mappedProp in window.CQ_Analytics.TestTarget.mappings) {
                    properties.push(mappedProp);
                }
            }
            return properties;
        },

        /**
         * Returns true if the mbox calls are to me made in simulation mode ( WCM preview and edit modes )
         */
        isInSimulationMode: function() {
            // use CQ.WCM when available
            if (typeof CQ != "undefined") {
                if (CQ.WCM && CQ.utils && CQ.utils.WCM) {
                    return CQ.WCM.isPreviewMode() || CQ.utils.WCM.isEditMode();
                }
            }
            // fallback to reading the cookies directly
            return isEditOrPreview();
        },

        /**
         * Forces an mbox update if either of CQ.WCM.isPreviewMode() or CQ.utils.WCM.isEditMode() is true.
         */
        forceMboxUpdate: function() {
            if (typeof mboxFactoryDefault == 'undefined') return;

            if (this.isInSimulationMode()) {
                if (typeof ClientContext !== "undefined") {
                    var campaignStore = ClientContext.get("campaign");
                    if (campaignStore && campaignStore.isCampaignSelected()) {
                        return;
                    }
                }
                CQ_Analytics.TestTarget.callMboxUpdate();
            }
        },

        registeredCHListeners: {},

        registerContextHubListeners: function() {
            if (!window.ContextHub) {
                return;
            }

            var mappedProperties = CQ_Analytics.TestTarget.getMappedProperties();
            var listenKeys = [];

            for (var mappingIdx = 0 ; mappingIdx < mappedProperties.length ; mappingIdx++) {
                var mappedProperty = mappedProperties[mappingIdx];
                var storeName = mappedProperty.split(".")[0];
                var listenKey = "/" + mappedProperty.replace(".", "/");

                // check if store is in CH
                var contextHubStore = ContextHub.get(storeName);

                if (contextHubStore
                     && !CQ_Analytics.TestTarget.registeredCHListeners[storeName]) {
                    CQ_Analytics.TestTarget.registeredCHListeners[storeName] = true;
                    listenKeys.push(listenKey);

                    CQ_Analytics.TestTarget.debug("[Target][CH] - Listening for updates on " + listenKey + " CH");
                }
            }

            if (listenKeys.length > 0) {
                // bind to context hub to listen for property updates
                ContextHub.bind(listenKeys,
                    function successHandler(data) {
                        CQ_Analytics.TestTarget.debug("[Target][CH][registerContextHubListeners] All properties available, triggering update!");
                        CQ_Analytics.TestTarget.callMboxUpdate();
                        CQ_TestTarget.usedStoresLoaded = true;
                    },
                    function defaultHandler(data) {
                        CQ_Analytics.TestTarget.debug("[Target][CH][registerContextHubListeners] Not all properties available, triggering update!");
                        CQ_Analytics.TestTarget.callMboxUpdate();
                }, 500);
            }
        },

        registerListeners: function() {
            if (typeof CQ_Analytics.CCM === "undefined") {
                return;
            }
            var stores = CQ_Analytics.CCM.getStores();

            var defaultUpdate = function() {
                CQ_Analytics.TestTarget.debug("[Target][CC] - Triggering default update!");
                CQ_Analytics.TestTarget.triggerUpdate();
            };

            var defaultUpdateTimerId = setTimeout(defaultUpdate, 1000);

            var clientContextUpdateListener = function(event, property) {
                var currentStore = this;
                // check if this is already handled by the ContextHub hooks
                if (CQ_Analytics.TestTarget.registeredCHListeners[currentStore.getName()]) {
                    // unregister listener, store updates are handled through CH
                    CQ_Analytics.TestTarget.debug("[Target][CC] - CH hook already detected for store " + currentStore.getName() + " un-binding listener!");
                    currentStore.removeListener("update", clientContextUpdateListener);
                    return;
                }

                // avoid the surferstore getting mouse position updates
                if (typeof property == 'undefined' ||
                    ( property && property.match && property.match("^mouse") != "mouse")) {

                    CQ_Analytics.TestTarget.debug("[Target][CC] - Triggering update for store " + currentStore.getName());
                    CQ_Analytics.TestTarget.triggerUpdate();
                    clearTimeout(defaultUpdateTimerId);
                }
            };

            var listenCHKeys = [];

            var mappedProperties = CQ_Analytics.TestTarget.getMappedProperties();

            for (var mappingIdx = 0 ; mappingIdx < mappedProperties.length ; mappingIdx++) {
                var mappedProperty = mappedProperties[mappingIdx];
                var storeName = mappedProperty.split(".")[0];
                var listenKey = "/" + mappedProperty.replace(".", "/");
                var store = stores[storeName];

                if (window.ContextHub
                    && ContextHub.get(storeName)
                    && !CQ_Analytics.TestTarget.registeredCHListeners[storeName]) {

                    listenCHKeys.push(listenKey);

                    CQ_Analytics.TestTarget.registeredCHListeners[storeName] = true;
                    CQ_Analytics.TestTarget.debug("[Target][CH] - Listening for updates on " + listenKey + " property");
                    continue;
                }

                if (CQ_Analytics.TestTarget.registeredCHListeners[storeName]) {
                    CQ_Analytics.TestTarget.debug("[Target][CC] - CH already bound for store " + storeName + ", not binding ClientContext listener!");
                    continue;
                }

                // completely ignore the mouse store since it's never useful for T&T
                if (storeName != "mouseposition" && store && store.addListener) {
                    CQ_Analytics.TestTarget.debug("[Target][CC] - Binding ClientContext listener for store " + storeName);
                    store.addListener("update", clientContextUpdateListener);
                }
            }

            if (listenCHKeys.length > 0) {
                // bind to context hub to listen for property updates
                ContextHub.bind(listenCHKeys,
                    function successHandler(data) {
                        CQ_Analytics.TestTarget.debug("[Target][CH][registerListeners] All properties available, triggering update!");
                        CQ_Analytics.TestTarget.triggerUpdate();
                        clearTimeout(defaultUpdateTimerId);
                    },
                    function defaultHandler(data) {
                        CQ_Analytics.TestTarget.debug("[Target][CH][registerListeners] Not all properties available, triggering update!");
                        CQ_Analytics.TestTarget.triggerUpdate();
                        clearTimeout(defaultUpdateTimerId);
                    }, 500);
            }
        },

        ignoredUpdates: {},

        ignoreNextUpdate: function(mboxName) {
            CQ_Analytics.TestTarget.ignoredUpdates[mboxName] = true;
        },

        /**
         * Adds a new mboxDefinition to the CQ_Analytics.mboxes array
         *
         * <p>Removes any mbox definition with the same mbox id prior to adding the passed
         * mboxDefinition.</p>
         *
         * @return {Boolean} true if an mbox was replaced, false otherwise
         */
        addMbox: function(mboxDefinition) {
            var replaced = false,
                alreadyDefined = false;

            if (!CQ_Analytics.mboxes) {
                CQ_Analytics.mboxes = [];
            }
            for (var i = 0; i < CQ_Analytics.mboxes.length; i++) {

                var mbox = CQ_Analytics.mboxes[i];
                //  cleanup existing mbox
                if (mbox.id == mboxDefinition.id) {
                    CQ_Analytics.mboxes.splice(i, 1);
                    replaced = true;
                    alreadyDefined = mbox.defined;
                    break;
                }
            }
            mboxDefinition.defined = alreadyDefined;
            CQ_Analytics.mboxes.push(mboxDefinition);

            CQ_Analytics.TestTarget.addMappings(mboxDefinition.mappings);

            return replaced;
        },

        addMappings: function(mappingsJsonArray) {
            if (!CQ_Analytics.TestTarget.mappings) {
                CQ_Analytics.TestTarget.mappings = [];
            }

            for (var idx = 0 ; idx < mappingsJsonArray.length ; idx++) {
                var mapKey = mappingsJsonArray[idx]["ccKey"];
                if (!CQ_Analytics.TestTarget.mappings[mapKey]) {
                    CQ_Analytics.TestTarget.mappings[mapKey] = {};
                }
            }
        },

        /**
         * Hides the default content for an mbox
         */
        hideDefaultMboxContent: function(mboxId) {
            $CQ('#' + mboxId).find('div').css('visibility', 'hidden');
        },

        /**
         * Shows the default content for an mbox
         */
        showDefaultMboxContent: function(mboxId, mboxName) {
            var defaultContent = $CQ('#' + mboxId);

            // defaultContent no longer present -> mbox has loaded 
            if (!defaultContent.length)
                return;

            //need to define the mbox now, if it's not already defined

            CQ_Analytics.mboxes.map(function(m) {
                if (m.name === mboxName && !m.defined) {
                    var callParameters = [m.id,m.name];
                    mboxDefine.apply(undefined, callParameters.concat(m.staticParameters));
                    m.defined = true;
                }
            });

            mboxFactoryDefault.get(mboxName).show(new mboxOfferDefault());
            CQ_Analytics.TestTarget.ignoreNextUpdate(mboxName);
        },

        ignoreLateMboxArrival: function(mboxId, mboxName, timeout) {
            this.clearLateMboxArrivalTimeout(mboxId);

            var that = this;
            this.lateMboxArrivalTimeouts[mboxId] = setTimeout(function() {
                that.showDefaultMboxContent(mboxId, mboxName);
                that.clearLateMboxArrivalTimeout(mboxId);
            }, timeout);
        },

        clearLateMboxArrivalTimeout: function(mboxId) {
            if (this.lateMboxArrivalTimeouts[mboxId]) {
                clearTimeout(this.lateMboxArrivalTimeouts[mboxId]);
                delete this.lateMboxArrivalTimeouts[mboxId];
            }
        },

        /**
         * Signals that the default offer was received from Target.
         * This function is called by the Target offer itself.
         * @param mboxName
         */
        signalDefaultOffer: function(mboxName) {
            if (typeof this.defaults[mboxName] === 'undefined') {
                if (console) { console.log("The default offer path was not found in the internal map for mbox " + mboxName)}
                return;
            }

            var defaultContentPath = this.defaults[mboxName],
                _mboxId = mboxFactoryDefault.get(mboxName).getId();

            pullContent(defaultContentPath, mboxName);
        }
    }
};

// restore previous attributes
if (typeof oldTandT !== 'undefined') {
    for (var prop in oldTandT) {
        CQ_Analytics.TestTarget[prop] = oldTandT[prop];
    }
}