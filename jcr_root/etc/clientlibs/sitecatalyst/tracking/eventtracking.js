/**
 * Stores the 'data' object into the appropriate properties of the 'eventdata'
 * client side store.
 * 
 * @param {Object}
 *            Data object.
 * @private
 */
CQ_Analytics.storeData = function(data) {
    
    var findMappingFor = function(prop,value) {
        for (var i=0; i< CQ_Analytics.Sitecatalyst.frameworkMappings.length; i++) {
            var m = CQ_Analytics.Sitecatalyst.frameworkMappings[i];
            if (m[prop] === value) {
                return m;
            }
        }
        return null;
    }
    
    var stripValue = function(value) {
        if (typeof value === 'string') {
            return value.replace(/[,;=\|]/g,"");
        }
        return value;
    }
    
    for (var j in data) {
        //handle generic data
        if (j !== "product") {
            var idx = j.indexOf(".");
            var storeName = (idx > 0) ? j.substr(0,idx-1) : undefined;
            var key = (idx > 0) ? j.substr(idx) : j;

            CQ_Analytics.DataProvider.setItem("eventdata", key, data[j]);
        // handle product data
        } else {
            var productProperties = ["category","sku","quantity","price","events","evars"];
            var products = CQ_Analytics.DataProvider.getItem("eventdata", "products").split(",");
            products = (products[0] == "") ? new Array() : products; 

            var productData = (data[j] instanceof Array)
                       ? data[j] 
                       : [data[j]];
                
            for (var prod = 0; prod < productData.length; prod++) {
                var p = productData[prod];
                var product = new Array(6);
                for (var k in p) {
                    var idx = productProperties.indexOf(k);
                    if (idx > -1) {
                        if (idx < 4) {
                            product[idx] = stripValue(p[k]);
                        } else {
                            var multival = []; 
                            for(var l in p[k]) {
                                var propPath = "eventdata." + j + "." + k + "." + l;
                                var cm = findMappingFor("cqVar", propPath);
                                if (cm) {
                                    multival.push(cm.scVar + "=" + stripValue(p[k][l]));
                                    //add to events store like normal event
                                    var events = CQ_Analytics.DataProvider.getItem("eventdata", "events").split("\u2026");
                                    if (events.indexOf(cm.cqVar) < 0) {
                                        events.push(cm.cqVar.replace(/.+\./,""));
                                        CQ_Analytics.DataProvider.setItem("eventdata", "events", events.join("\u2026"));
                                    }
                                }
                            }
                            product[idx] = multival.join("|"); 
                        }
                    }
                }
                products.push(product.join(";"));
            }
            CQ_Analytics.DataProvider.setItem("eventdata", "products", products.join(","));
        }
    }
};

/**
 * Records a user interaction in the a ClientContext store (by default
 * EventDataManager) to be picked up by the used analytics solution for further
 * processing.
 * 
 * @param {Object}
 *            options Tracking options.
 * 
 * <p>
 * Generic options properties.
 * </p>
 * @param {String}/{Array}
 *            options.event Tracking event name or Array of Strings for multiple 
 *            event names.
 * @param {Object}
 *            options.values Tracking values.
 * @param {Boolean}
 *            options.collect Flag which indicates if event and values should be
 *            collected (optional).
 * @param {Object}
 *            options.options Options object holding analytics specific options
 *            (optional).
 * <p>
 * By default when using SiteCatalyst following <code>options.options</code>
 * are supported.
 * </p>
 * @param {Element} 
 *            options.options.obj Custom link DOM element
 * @param {String}
 *            options.options.defaultLinkType Custom link type, either 
 *            'd' (download), 'e' (exit) or 'o' (custom). Default is 'o'.
 * @param {String}
 *            options.options.linkName Custom link element name. 
 *            Default is same as <code>name</code>.
 * @param {Object}
 *            options.options.variableOverrides Variable overrides.
 *            Default is <code>null</code>.
 * @param {Function}
 *            options.options.doneAction Function callback executed after the 
 *            s.tl() call. Default is <code>null</code>.
 *            
 * @return {Array} An array holding the options.event and options.values if
 *         <code>options.collect</code> is <code>true</code>, otherwise
 *         nothing is returned.
 * @since 5.5
 */
CQ_Analytics.record = function(options) {
    
    if (options.collect) {
        return [options.event, options.values]; 
    } else {  
        if (options.event) { 
            options.options = options.options || { };
            //execute callbacks before data is set
            try {
                CQ_Analytics.recordBeforeCallbacks.sort(function(a, b){
                    return a.rank-b.rank;
                });
                for(var callback in CQ_Analytics.recordBeforeCallbacks) {
                    if (CQ_Analytics.recordBeforeCallbacks[callback].func.call(this, options)) {
                        return;
                    }
                }
            } catch(err) {
                //nothing to do 
            }
            
            CQ_Analytics.DataProvider.reset("eventdata");
            
            var eventData = options.event;
            if (typeof options.event !== 'string') {
                eventData = options.event.join('\u2026');
            }
            
            CQ_Analytics.DataProvider.setItem("eventdata", "events", eventData);
            
            if (options.values) {
                CQ_Analytics.storeData(options.values);
            }
            
            //execute callbacks after data was set
            try {
               CQ_Analytics.recordAfterCallbacks.sort(function(a, b){
                   return a.rank-b.rank;
               });
               for(var callback in CQ_Analytics.recordAfterCallbacks) {
                    if (CQ_Analytics.recordAfterCallbacks[callback].func.call(this, options)) {
                        return;
                    }
                }
            } catch(err) {
                //nothing to do 
            }
        }
    }
};

/**
 * @private
 */
CQ_Analytics.recordBeforeCallbacks = [];

/**
 * @private
 */
CQ_Analytics.recordAfterCallbacks = []; 

/**
 * Registers a callback handler which is called before data in ClientContext
 * store was set.
 * 
 * @param {Function}
 *            Callback function. Parameter passed to the callback is the
 *            <code>options</code> object from the record method.
 * @param {Integer}
 *            Execution rank.
 */
CQ_Analytics.registerBeforeCallback = function(callback, rank) {
    CQ_Analytics.recordBeforeCallbacks.push({rank: rank, func: callback});
};

/**
 * Registers a callback handler which is called after data in ClientContext
 * store was set.
 * 
 * @param {Function}
 *            Callback function. Parameter passed to the callback is the
 *            <code>options</code> object from the record method.
 * @param {Integer}
 *            Execution rank.
 */
CQ_Analytics.registerAfterCallback = function(callback, rank) {
    CQ_Analytics.recordAfterCallbacks.push({rank: rank, func: callback});
};
