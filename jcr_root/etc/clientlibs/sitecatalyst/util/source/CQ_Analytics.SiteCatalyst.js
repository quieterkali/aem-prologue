CQ_Analytics.Sitecatalyst = {

    /**
     * @public
     */
    events: [],

    /**
     * @public
     */
    trackVars: [],

    /**
     * @public
     */
    settings: [],

    /**
     * Checks if the 'eventdata' store already has the specified 'event' set.
     * 
     * @static
     * @public
     * @param {String} event Event name
     */
    hasEvent: function(event) {
        if (CQ_Analytics.DataProvider.hasStore("eventdata")) {
            var a = CQ_Analytics.DataProvider.getItem("eventdata", "events").split("\u2026");
            var i = a.length;
            while (i--) {
                if (a[i] === event) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Sets eVar
     * 
     * @static
     * @public
     * @param {Object} mapping Mapping object
     */
    setEvar: function(mapping) {
        var evar = mapping.scVar;
        var value = mapping.cqVar;
        //Generic product data uses prefixed eVars, merchandise data uses product object.
        var isProduct = evar.match(/^product\./) || value.match(/product\./);
        
        // set up direct references to datastores for use in expressions
        var stores = CQ_Analytics.DataProvider.getStores();
        for (var store in stores) {
            try {
                eval("var " + store + " = stores[store].data;");
            } catch(e) {}
        }
        
        if (this.hasEvent(value.replace(/.+\./, ""))) {
            if (this.events.indexOf(evar) < 0) {
                this.events.push(evar);
                this.updateLinkTrackEvents();
            }
        } else {
            if (value == '') return;
            try {    
                if (isProduct) {
                    if (!evar.match(/^eVar\d+/)) {
                        s["products"] = eval("eventdata.products");
                        if (this.trackVars.indexOf("products") < 0) {
                            this.trackVars.push("products");
                        }
                    }
                } else {
                    // evaluate expression using direct references to stores
                    var tmpEvar = CQ_Analytics.DataProvider.replaceVariables(eval(value));
                    if (typeof(tmpEvar) !== "undefined") {
                        //Analytics API 1.4 changed the evars IDs from eVar to evar, but the s object still needs to be populated with eVar
                        var eVar = evar.replace('evar', 'eVar');
                        s[eVar] = tmpEvar;
                        if (this.trackVars.indexOf(eVar) < 0) {
                            this.trackVars.push(eVar);
                        }
                    }
                }
            } catch(e) {
                console.log("Could not set " + evar + ": " + e);
            }
        }
    },

    /**
     * Sets 'linkTrackEvents'
     * 
     * @static
     * @public
     */
    updateLinkTrackEvents: function() {
        s.events = this.events.join(",");
        s.linkTrackEvents = s.events;
    },

    /**
     * Sets 'linkTrackVars'
     * 
     * @static
     * @public
     */
    updateLinkTrackVars: function() {
        s.linkTrackVars = this.trackVars.join(",");
    },

    /**
     * Deletes trackVars.
     * 
     * @static
     * @public
     * @param {Boolean} saved 
     *                  Indicator if tracksVars should be saved before deletion
     */
    eraseTrackVars: function(saved) {
        for (var i = 0; i < this.trackVars.length; i++) {
            var evar = this.trackVars[i];
            if (evar !== 'events') {
                if (saved)
                    saved[evar] = s[evar];
                delete s[evar];
            }
        }
        this.trackVars = [];
    },

    /**
     * Saves eVar's.
     * 
     * @static
     * @public
     */
    saveEvars: function() {
        var saved = {
            events: this.events,
            trackVars: this.trackVars,
            linkTrackVars: s.linkTrackVars,
            linkTrackEvents: s.linkTrackEvents
        };
        //clear events cache
        this.events = [];
        this.eraseTrackVars(saved);
        this.settings.push(saved);
    },

    /**
     * Restores eVar's.
     * 
     * @static
     * @public
     */
    restoreEvars: function() {
        var former = this.settings.pop();
        this.events = former.events;
        delete former.events;
        this.trackVars = former.trackVars;
        delete former.trackVars;
        this.updateLinkTrackEvents();
        this.eraseTrackVars();
        for (var prop in former) {
            s[prop] = former[prop];
        }
    },

    /**
     * Stops tracking temporarily to bypass automatic link tracking.
     * 
     * @static
     */
    stopTrackingTemporarily: function() {
        var old_s = {
            trackDownloadLinks: s.trackDownloadLinks,
            trackExternalLinks: s.trackExternalLinks
        };
        s.trackDownloadLinks = false;
        s.trackExternalLinks = false;
        setTimeout(function(){
            for (var prop in old_s) {
                s[prop] = old_s[prop];
            }
        }, 200);
    },

    /**
     * 
     * @static
     * @param {Object} options
     */
    trackLink: function(options) {
        var obj = options.options.obj;
        var el = (obj && obj.href) ? obj : true,
                  name = (obj && obj.name) ? obj.name : "",
                  defaultLinkType = options.options.defaultLinkType || "o",
                  linkType = (el && el.href && s.lt) ? s.lt(el.href) : "";
        var variableOverrides = options.options.variableOverrides || null;
        var doneAction = options.options.doneAction || null;
        
        if (linkType === "") {
            linkType = defaultLinkType;
        }
        
        // make sure the s.tl goes through even if there's no link name
        name = name || options.options.linkName || "default-link-name";
        
        var s_code = s.tl(el, linkType, name, variableOverrides, doneAction);
        if (s_code) {
            document.write(s_code);
        }
        this.stopTrackingTemporarily();
    },

    /**
     * 
     * @static
     * @public
     * @param {Object} obj
     */
    customTrack: function(obj) {
        var events = obj.getAttribute('adhocevents') || "";
        var evars = obj.getAttribute('adhocevars') || "";
        if (events || evars) {
            // set up direct references to datastores for use in expressions
            var stores = CQ_Analytics.DataProvider.getStores();
            for (var store in stores)
                try {
                    eval("var " + store + " = stores[store].data;");
                } catch(e) {}
            // evaluate evars using direct references to stores
            try {
                eval("evars = {" + evars + "}");
            } catch(e) {}
            CQ_Analytics.Sitecatalyst.saveEvars();
            try {
                var linkTrackVars = [];
                if (events.length > 0) {
                    s.linkTrackEvents = s.events = events;
                    linkTrackVars.push('events');
                }
                for (var key in evars) {
                    linkTrackVars.push(key);
                    var value = "'" + escape(evars[key]) + "'";
                    this.setEvar({'scVar':key, 'cqVar':value});
                }
                if (linkTrackVars.length > 0) {
                    s.linkTrackVars = linkTrackVars.join(',');
                }
                this.trackLink({options: { obj: obj }});
            } finally {
                CQ_Analytics.Sitecatalyst.restoreEvars();
            }
        }
    },

    /**
     * Collects 'data-track' attributes from the documents elements and maps
     * them to CQ_Analytics.record function calls. For backwards
     * compatibility the 'record' attribute is processed as well. In case of
     * the record attribute the old record method is called with the collect
     * flag set to <code>true</code> collecting all record attributes on a
     * page.
     * 
     * @static
     * @param {Boolean}
     *            forceCollect Forces collect option (optional). Default is
     *            <code>true</code>.
     */
    collect: function(forceCollect) {
        var elements = document.getElementsByTagName("*");
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].getAttribute("data-tracking")) {
                this.processDataAttribute(elements[i].getAttribute("data-tracking"), forceCollect);
            } else 
            /* keep for backwards compatibility */
            if (elements[i].getAttribute("record")) {
                this.processRecordAttribute(elements[i].getAttribute("record"), forceCollect);     
            }
        }
    },

    /**
     * Process DOM 'record' attribute and store event and data to the
     * 'eventdata' store.
     * 
     * @static
     * @param {String} attribute
     *            DOM attribute value.
     * @param {Boolean} forceCollect
     *            Indicator to force collection. Default is true.
     */
    processRecordAttribute: function(attribute, forceCollect) {
        try {
            if(forceCollect === undefined) {
                forceCollect = true;
            }
            var result = eval("record(" + attribute + "," + forceCollect + ")");
            if (result) {
                this.storeTrackingData(result);
            }
         } catch (err) {
             if (window.console) {
                 window.console.error(err.message);
             }
        }
    },   

    /**
     * Process DOM 'data-track' attribute and store event and data to the
     * 'eventdata' store.
     * 
     * @static
     * @param {String}
     *            DOM attribute value.
     * @param {Boolean} forceCollect
     *            Indicator to force collection. Default is true.
     */
    processDataAttribute: function(attribute, forceCollect) {
        try {
            var json = eval("("+ attribute +")");
            if (forceCollect) {
                json["collect"] = true;
            }
            var result = CQ_Analytics.record(json);
            if (result) {
                this.storeTrackingData(result);
            }
        } catch (err) {
            if (window.console) {
                window.console.error(err.message);
            }
        }
     },
     
    /**
     * Collects the tracking data and stores it into the 'eventdata' store.
     * 
     * @static
     * @param {Array}
     *            Array holding the tracking data.
     */
     storeTrackingData: function(trackingdata) {
         if (CQ_Analytics.DataProvider.hasStore("eventdata")) {
             var eventsData = CQ_Analytics.DataProvider.getItem("eventdata", "events");
             var evnts = this.toObj(eventsData.split("\u2026"));
             var event = trackingdata[0];
             evnts[event] = event;
             var data = trackingdata[1];
             
             CQ_Analytics.storeData(data);
             CQ_Analytics.DataProvider.setItem("eventdata", "events", this.toArr(evnts).join("\u2026"));
         } else {
             if (window.console) {
                 window.console.error("EventData Store is missing, unable to set data for analytics.");
             }
         }
     },
     
     /**
      * Transforms the specified obj to an Array of property values.
      * 
      * @static
      * @private
      * @return {Array} Array containing objects property values
      */
     toArr: function(obj) {
         var arr = [];
         for (property in obj) {
             arr.push(obj[property]);
         }
         return arr;
     },
     
     /**
      * Transforms the specified arr to an object.
      * 
      * @static
      * @private
      * @return {Object} Object containing the arr values
      */
     toObj: function(arr) {
         var o = {};
         for (var i=0; i<arr.length; i++) {
             var key = arr[i];
             o[key] = key;
         }
         return o;
     }

};