/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

(function ($) {
    $.uaMatch = function( ua ) {
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
            /(msie) ([\w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) || [];
        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
        };
    };
    // Not clobbering any existing $.browser
    if ( !$.browser ) {
        var
            matched = $.uaMatch( navigator.userAgent ),
            browser = {};
        if ( matched.browser ) {
            browser[ matched.browser ] = true;
            browser.version = matched.version;
        }
        // Chrome is Webkit, but Webkit is also Safari.
        if ( browser.chrome ) {
            browser.webkit = true;
        } else if ( browser.webkit ) {
            browser.safari = true;
        }
        $.browser = browser;
    }
})($);
/*************************************************************************
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
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/


/**
 * @package xfalib.ut.Class
 */
(function(_, xfalib){

    xfalib.ns = xfalib.ns || function (namespaceString) {
        var parts = namespaceString.split('.'),
            parent = window,
            currentPart = '';

        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }

        return parent;
    };

    var Class = xfalib.ut.Class = function(options) {
        this.options = _.extend({}, this.options, options);
        if(!this.options.jsonModel)
            this.options.jsonModel = {};
        //For perf reason, we are setting jsonModel as direct property instead of using property descriptor
        this.jsonModel = this.options.jsonModel;
        this.initialize.apply(this, arguments);
    };

    _.extend(Class.prototype, {
        initialize : function(){
        },

        xfaUtil :function(){
          return xfalib.ut.XfaUtil.prototype;
        },

        copyArray : function(src,dst,options) {
            var keepReference = this.getOrElse(options, "keepReference", true);
            if(src instanceof Array)
            {
                for (var i = 0;i<src.length;i++)
                {
                    var obj;
                    if(src[i] instanceof Array)
                    {
                        obj = this._createDestination(dst, i, keepReference, []);
                        this.copyArray(src[i],obj,options);
                    }
                    else if(typeof src[i] == "object")
                    {
                        obj = this._createDestination(dst, i, keepReference, {});
                        this.copyObject(src[i],obj,options);
                    } else {
                        obj = src[i];
                    }
                    dst[i] = obj;
                }
                if(dst.length > src.length){
                    dst.splice(src.length, (dst.length - src.length));  //Remove ths rest of the extra destination items
                }
            }
        },

        /**
         *
         * @param src
         * @param dst
         * @param options e.g. {keepReference: true, exceptions:["htmlId"], transformMaps: {"dataId", function(src, options){ return src "33"+src; }}}
         */
        copyObject : function(src,dst,options) {
            var keepReference = this.getOrElse(options, "keepReference", true);
            var exceptions = this.getOrElse(options, "exceptions", []);
            var transformMaps = this.getOrElse(options, "transformMaps", {});
            if(typeof src == "object") {
                for (var child in src) {
                    if(exceptions.indexOf(child) == -1) {
                        if(src[child] instanceof Array) {
                            dst[child] = this._createDestination(dst, child, keepReference, []);
                            this.copyArray(src[child],dst[child],options);
                        }
                        else if(typeof src[child] == "object" && src[child] != null) {
                            dst[child] = this._createDestination(dst, child, keepReference, {});
                            this.copyObject(src[child],dst[child],options);
                        }
                        else{
                            if(!_.isUndefined(transformMaps[child])){
                                dst[child] = transformMaps[child](src[child], options, src);
                            }
                            else
                                dst[child] = src[child];
                        }
                    }
                }
            }
        },

        _createDestination : function(obj, property, keepReference, defaultValue) {
            if(!keepReference)
                return defaultValue;
            else if(_.isObject(obj) && !obj.hasOwnProperty(property))
                return defaultValue;
            else
                return obj[property] || defaultValue ;  //Would handle both, Array and objects
        },

        /**
         * will replace functions in the object with noop function based on a predicate function's result.
         * If no predicate is passed all functions will be disabled.
         * Warning once disabled object cant be re-enabled.
         *
         * sample predicate to disable all 'public' functions : function (funcName) { return funcName[0] != '_'}
         *
         * @param predicate
         * @private
         */
        _disableFunctions: function (predicate) {
            var noop = function () {},
                disableAll = !_.isFunction(predicate);

            _.each(_.functions(this), function (funcName) {
                if (disableAll || predicate(funcName)) {
                    this[funcName] = noop;
                }
            }, this);
        },

        /**
         * getOrElse can take multiple arguments.
         * arg1(obj): base Object
         * arg2: string representing property chain where properties are concatenated via dot
         * arg3: default value
         **/

        getOrElse : function(obj){
            var currObject = obj;
            if(arguments.length < 2)
                return currObject;
            else if(arguments.length == 2) {
                if(!_.isUndefined(currObject)){
                    return currObject;
                } else {
                    return _.clone(arguments[1]);
                }
            }
            else {
                var propChain = (arguments[1] || "").split(".");
                var defaultValue = arguments[2];
                _.each(propChain, function(prop){
                    if(_.isObject(currObject))
                        currObject = currObject[prop];
                    else
                        currObject = undefined;
                }, this);

                if(!_.isUndefined(currObject))
                    return currObject;
                else {
                    return _.clone(defaultValue) ; //May have to do deep clone in future. TODO: support for conditional clone
                }
            }
        },

        jqId: function (id) {
            return xfalib.ut.XfaUtil.prototype.jqId(id);
        },

        logger : function(){
            return this.xfaUtil().getLogger();
        },

        validateInput : function(param, dataType,fallback){
        	if(typeof param !== "undefined" && param !== null) {
        		switch(dataType) {
        		case "string":
        			param = param+"";
        			break;
        		case "object":
        			if(typeof param !== "object")
        				param = fallback;
        			break;
        	    case "integer":
                    param = parseInt(param);
                    if(isNaN(param))
                        param = fallback;
                    break;
               case "measurement":
                     break;
        		default:
        			if(dataType instanceof Array) {
                        if(!~dataType.indexOf(param))
                            param = fallback
                    }
        		}
        	}
        	return param;
        }

    });

    _.extend(Class, {
        defineProps : function(propsMap){
            _.each(propsMap, function(propDesc, propName){
                //Check property can be resolved using resolveNode
                if(propDesc.resolve) {
                    //Check whether prototype owns the object resolveProperties
                    if(!this.prototype.hasOwnProperty("resolveProperties")) {
                        //check whether prototype inherits the object resolveProperties
                        if(this.prototype.resolveProperties) {
                            //clone the object since we do not want to modify parent's prototype
                            this.prototype.resolveProperties = _.clone(this.prototype.resolveProperties);
                        }
                        else
                            this.prototype.resolveProperties = [];
                    }
                    this.prototype.resolveProperties.push(propName)
                }
                Object.defineProperty(this.prototype, propName, propDesc);

            }, this);
        },
        extend : function(props){
            var child = inherits(this, props);
            child.extend = this.extend;
            return child;
        },
        addMixins : function(mixinBakers){
            if(!_.isArray(mixinBakers)){
                mixinBakers = [mixinBakers];
            }
            _.each(mixinBakers, function(mixinBaker){
                if(mixinBaker.normalProperties){
                    _.extend(this.prototype, mixinBaker.normalProperties);
                }
                if(mixinBaker.propertyDescriptors){
                    this.defineProps(mixinBaker.propertyDescriptors);
                }
            }, this);
        }
    });

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function(){};

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    function inherits(parent, protoProps, staticProps) {
        var child;
        var _super = parent.prototype;
        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child._super = parent.prototype;
        child._superClass = parent;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) { //_.extend(child.prototype, protoProps);
            // Copy the properties over onto the new prototype
            for (var name in protoProps) {
                if(name == "_defaults"){
                    protoProps[name] = _.extend({}, _super[name], protoProps[name]);
                }
                child.prototype[name] = protoProps[name];
            }
        }


        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };
})(_, window.xfalib);
/**
 * Created by vdua on 2/18/2015.
 */
(function (_, xfalib) {
    var XMLUtils = {
        dataSom2xpath: function (dataSom) {
            var xpath = "";

            if (!_.isEmpty(dataSom)) {
                // any dot preceded by ], takes care of dot-s in name,
                // and remove constant prefix "xfa[0].datasets[0].data[0]" and form root name, then join using '/'
                _.each(dataSom.split(/\]\./).slice(4),
                    function (part) {
                        var openBracketPos = part.lastIndexOf('[');
                        xpath += part.substring(0, openBracketPos + 1) +
                            (parseInt(part.substring(openBracketPos + 1)) + 1) + // increment index by 1 for xpath query
                            "]/";
                    });

                if (_.isEmpty(xpath)) {
                    xpath = dataSom;
                } else if (xpath[xpath.length - 1] === '/') {
                    xpath = xpath.slice(0, -1);
                }
            }

            return xpath;
        },

        /**
         * Converts an xPathResult of type iterator to an array
         * @param xPathResult
         * @returns {Array}
         */
        iteratorToArray: function (xPathResult) {
            var result = [];
            var node = xPathResult.iterateNext();
            while (node != null) {
                result.push(node);
                node = xPathResult.iterateNext();
            }
            return result;
        },
        /**
         * Wrapper API for document.evaluate to provide cross-browser support.
         * @param xpath
         * @param node
         * @param nsResolver
         * @param resultType
         * @param result
         * @returns {Object|*}
         */
        evaluateXPath: function (xpath, node, nsResolver, resultType, result) {
            try {
                if(_.isEmpty(xpath) || !_.isString(xpath) || !(node instanceof Node)) {
                    return null;
                }

                if (_.isUndefined(document.evaluate)) {
                    wgxpath.install();
                }
                var documentToSearch = node instanceof Document ? node : node.ownerDocument,
                    documentToEval = documentToSearch.evaluate ? documentToSearch : document;
                xpath = this.sanitizeXPath(xpath);

                return documentToEval.evaluate(xpath, node, nsResolver, resultType, result);

            } catch (exception) {
                xfalib.ut.XfaUtil.prototype.getLogger().error("Could not evaluate xpath: " + xpath  + exception);

            }

        },
         /**
         *Removes all [*] other than ['numeric'] from xpath
         *@param xpath
         *@returns xpath after removing "[*]"
         */
         sanitizeXPath: function(xpath) {
             var xpathArray=xpath.split("/"),
                 resultXpath = _.map(xpathArray, function (path) {
                 return path.replace(/\[(.*\D+.*)\]|\[\]/g,"");
             }).join("/");
             return resultXpath;
         },

        /**
         * Creates all the Elements (if they don't exist) in the xpath leading to the node being searched for in the
         * xpath relative to the element. Optionally creates the node as well if bParentsOnly is false
         * @param xpath
         * @param element
         * @param bParentsOnly whether to create only the parents or the node as well
         * @returns node that is being represented by the xpath relative to the element.
         */
        createElementsFromXPath: function (xpath, element, bParentsOnly) {
            if (xpath != null || element != null) {
                var parts = xpath.split("/"),
                    actualParts = bParentsOnly ? _.initial(parts) : parts,
                    el = element;
                _.each(actualParts, function (part, index) {
                    var som = part.match(/^([^[]+)(\[(\d+)\])?/),
                        childEl;
                    if (som == null) {
                        xfalib.ut.XfaUtil.prototype.getLogger().error("Unsupported expression in Bindref " + part);
                        return null;
                    }
                    //only the last element can be attribute
                    childEl = this.findOrCreateElement(part, el, index === actualParts.length - 1);
                    el = childEl;
                }, this);
                return el;
            }
            return null;
        },

        /**
         * Form an xpath part returns the index as well as the tagName. Index can be * as well
         * @param xpathName
         * @returns {*}
         * @private
         */
        _getElementNameAndIndexFromXPathPart: function (xpathName) {
            var som  =  xpathName.match(/^([^[]+)(?:\[(\d+|\*)\])?/);
            if (som !== null) {
                return {
                    name: som[1],
                    index: som[2] || 0
                };
            }
            return null;
        },

        /**
         * create an element with the tagName elementName for the ownerDocument of element.
         * @param elementName
         * @param element
         * @returns {HTMLElement}
         */
        createElement: function (elementName, element) {
            var el = element.ownerDocument.createElement(elementName);
            return el;
        },

        /**
         * Searches for the nodeXpath relative to element. If it doesn't exists creates it and returns the node
         * @param element
         * @param nodeXpath
         * @param bAttribute if true then check for attribute otherwise not.
         * @returns {Node|*}
         */
        findOrCreateElement: function (nodeXpath, element, bAttribute) {
            try {
                if (element == null) {
                    return null;
                }
                var result = this.evaluateXPath(nodeXpath, element, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null),
                    el = result.iterateNext(),
                    res;
                if (el == null) {
                    res = this._getElementNameAndIndexFromXPathPart(nodeXpath);
                    if (res != null) {
                        if (bAttribute && res.name.match(/^@/)) {
                            var attrName = res.name.replace(/^@/, "");
                            el = element.ownerDocument.createAttribute(attrName);
                            element.setAttributeNode(el);
                        } else {
                            el = element.ownerDocument.createElement(res.name);
                            element.appendChild(el);
                        }
                    }
                }
                return el;

            } catch (exception) {
                xfalib.ut.XfaUtil.prototype.getLogger().error("Following exception "
                    +  "occurred while executing findOrCreateElement " + exception);
            }

        },

        /**
         * Returns the Root Form Elment from the xmlDocumentElement
         * @param xmlDocumentElement It can be a document or Element. If the root element is xdp element, it returns
         *        the grand grand child of that element. otherwise the root element is returned. The root
         *        Element can be either the element itself or documentElement of the element.
         */
        getXFARootFormElementFromXML: function (xmlDocumentElement) {
            var isElement = xmlDocumentElement instanceof Element,
                docElemName = isElement ? xmlDocumentElement.nodeName : xmlDocumentElement.documentElement.nodeName,
                rootElement = isElement ? xmlDocumentElement : xmlDocumentElement.documentElement,
                nodeList;

            if ("xdp:xdp" === docElemName || "xdp" === docElemName) {
                if (xfalib.ut.XfaUtil.prototype.isIE()) {
                    //IE doesn't support evaluating namespace elements
                    var datasets = rootElement.firstElementChild,
                        data = datasets.firstElementChild;
                    rootElement = data.firstElementChild;
                } else {
                    // assumption is that the xml will be of format <xdp><datasets><data><form1>
                    // TODO: change first * to xfa:datasets
                    nodeList = this.evaluateXPath("*/xfa:data/*", rootElement, formBridge.nsResolver,
                                            XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    rootElement = nodeList.iterateNext();
                }
            }
            return rootElement;
        },

        /**
         * Returns an object containing the prefix and namespaces present in the rootElement. For default namespace the
         * prefix is "_default"
         * @param rootElement {Element} xml element which has to be looked for namespaces
         * @returns {object} object whose keys are the prefix and values are the namespace
         */
        getNamespaces: function (rootElement) {
            var namespaces = {
                "_default" : null
            };
            _.each(rootElement.attributes, function (attr) {
                var name = attr.name,
                    parsedAttrName = name.match(/^xmlns(?:\:(.*))?/),
                    isNamespace = parsedAttrName != null,
                    namespaceName = isNamespace ? parsedAttrName[1] || "_default" : null;
                if (namespaceName) {
                    namespaces[namespaceName] = attr.value;
                }
            });
            return namespaces;
        },

        /**
         * Returns a namespace resolver given a element. The nsResolver returns the namespace given a prefix by
         * using the namespaces mentioned in the element.
         * @param rootElement element from which to create the nsResolver
         * @returns {function} the function returns the namespace given a prefix.
         */
        getNsResolver: function (rootElement) {
            var namespaces = this.getNamespaces(rootElement),
                nsResolver = (function (namespaces) {
                    return function (nsPrefix) {
                        var namespace = formBridge.nsResolver(nsPrefix) || namespaces[nsPrefix];
                        return namespace;
                    };
                }(namespaces));
            return nsResolver;
        },

        /**
         * Removes default namespaces from xml, basically the namespace defined as xmlns="some namespace". The
         * side-effect of the API is it removes the string "xmlns='some namespace'" from any attribute value as well.
         * @param xml {string}
         * @returns {string}
         */
        removeDefaultNamespace: function (xml) {
            var stringRegex = "(\\s+)" + // any number of spaces
                             "(xmlns=" + // then xmlns=
                            "('[^']*'|\"[^\"]*\"))" + // then value in single quotes ('[^']') or
                                                    //                 double quotes ("[^"]")
                            "(?=[^<>]*>)",  // followed by closing tag (implies attribute) and before another
                                           // opening tag(implies text)
                regex = new RegExp(stringRegex, "g");
            return xml.replace(regex, "$1");
        }
    };
    xfalib.ut.XMLUtils = XMLUtils;
}(_, xfalib));
/**
 * @package xfalib.ut.Logger
 * @import xfalib.ut.Class
 */

(function(_, xfalib, $){
    var categoryAcronyms = {
                            "a": "xfa",
                            "b": "xfaView",
                            "c": "xfaPerf"
        },
        loggerTypes = ["off", "console", "server", "consoleServer"];
    var Logger = xfalib.ut.Logger = xfalib.ut.Class.extend({

//      Count of log messages so far.
        LOG_COUNT : {
            level : {
                "FATAL" : 0,
                "ERROR" : 0,
                "WARN" : 0,
                "INFO" : 0,
                "DEBUG" : 0,
                "TRACE" : 0,
                "ALL" : 0
            },
            category : {
                "xfa" : 0,
                "xfaView" : 0,
                "xfaPerf" : 0,
                "Unknown" : 0
           }
        },

        /**
         * Log level to turn logging off (default).
         * @static
         * @final
         * @type Number
         */
        OFF : 0,

        /**
         * Log level for fatal error messages.
         * @static
         * @final
         * @type Number
         */
        FATAL : 1,

        /**
         * Log level for error messages.
         * @static
         * @type Number
         * @final
         */
        ERROR : 2,

        /**
         * Log level for warning messages.
         * @static
         * @type Number
         * @final
         */
        WARN : 3,

        /**
         * Log level for info messages.
         * @static
         * @type Number
         * @final
         */
        INFO : 4,

        /**
         * Log level for debug messages.
         * @static
         * @type Number
         * @final
         */
        DEBUG : 5,

        /**
         * Log level for trace messages.
         * @static
         * @type Number
         * @final
         */
        TRACE : 6,

        /**
         * Log level for all messages.
         * @static
         * @type Number
         * @final
         */
        ALL : 7,


        logLevelNames : ["OFF", "FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE", "ALL"],

        initialize : function(){
            var str = "",
                that =this;
            Logger._super.initialize.call(this);
            this.logs = {};
            this.logMessages = "";
            this.logServiceProxy = this.options.logServiceProxy;
            this.contextPath = this.options.contextPath;
            this.renderContext =  this.options.renderContext;
            if(this.jsonModel.logConfigString) {
                _.extend(this.jsonModel, this.parse(this.jsonModel.logConfigString));
            }
            _.each(this.jsonModel.category, function(category) {
                that.LOG_COUNT.category[category] = 0;
            })
        },

        /**
         * parses a log config string of the form <0,1,2,3>-<category string><level integer>-<category string><level integer>..
         * and returns an a config object that logger uses. The function is a private and not to be called outside
         * this function
         *
         * category can not contain numbers and only valid characters are a-zA-Z
         * level can be any integer.
         *
         * category string is converted into actual category for the logger by using default categoryAcronyms
         * [a : xfa, b: xfaView, c: xfaPerf} and the categoryAcronyms passed to the options while instantiating the
         * object. If not found in both the acronyms then the value category string is used as actual category
         *
         * For example for the input string 1-a9-b9-c9 return object is
         * {on: true, category: [xfa,xfaView, xfaPerf], level: [9, 9, 9], type: console}
         *
         * For the input string 1-a9-b9-c9-d9-e11 with options.categoryAcronyms {a:a, d:AF} return object is
         * {on: true, category: [xfa,xfaView, xfaPerf, AF, e], level: [9, 9, 9, 9, 11], type: console}
         */
        parse : function(configString) {
            var arr = configString.split("-"),
                logType = _.first(arr),
                logConfig = _.rest(arr),
                res = {
                    on: logType === "0" ? "false": "true",
                    category: [],
                    level:[],
                    type:loggerTypes[parseInt(logType)]
                };
           _.each(logConfig, function(item, index) {
                var config = item.match(/^([A-Za-z]+)(\d+)$/),
                    category;
                if (config && config.length === 3) {
                    category = this.getOrElse(categoryAcronyms, config[1],
                                    this.getOrElse(this.jsonModel, "categoryAcronyms." + config[1], config[1]));
                    res.category.push(category);
                    res.level.push(parseInt(config[2]));
                } else {
                    //calling this because logger is not initialized as of now
                    this.consoleHandler(this.resolveMessage(xfalib.locale.LogMessages["ALC-FRM-901-020"],
                                                    [item, configString]))
                }
            }, this);
            return res;
        },

        /*
         *
         */
        resolveMessage : function(message, snippets) {
            snippets = snippets || [];
            return message.replace(/{(\d+)}/g, function(match, number) {
                return typeof snippets[number] != 'undefined'
                    ? snippets[number]
                    : match
                    ;
            });
        },

        /**
         * Writes a message to the console.
         * @private
         * @param {Number} level The log level
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         * @return The log message
         * @type String
         */
        log : function(category, level, message, snippets) {
            var d= new Date();
            var day = d.getDate();
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var mili = d.getMilliseconds();
            var sec = d.getSeconds();
            var min = d.getMinutes();
            var hour = d.getHours();
            var date = day + "." + month + "." + year +" " + hour + ":" + min + ":" + sec + ":" + mili;
            if(this.jsonModel && this.jsonModel.category) {
                for(var i = 0; i<this.jsonModel.category.length; i++) {
                    if (level != 0 && this.jsonModel.level[i] >= level && this.jsonModel.category[i] == category && this.jsonModel.on == "true") {

                        var resolvedMessage = message;
                        if(snippets){
                            //resolve message with snippet
                            resolvedMessage = this.resolveMessage(message, snippets);
                        }

                        var text = "";
                        text += date ;
                        text += " *" + this.logLevelNames[level] + "*";
                        text += " [" +  category + "]" ;
                        text += "  " + resolvedMessage + "\r\n" ;
                        this.logMessages += text ;
                        if(this.jsonModel.type == "console" || this.jsonModel.type == "consoleServer" ) {
                            ++this.LOG_COUNT.category[category || 'Unknown'];
                            ++this.LOG_COUNT.level[this.logLevelNames[parseInt(level) < 8? level:7]];
                            this.consoleHandler(text, level);
                        }
                    }
                }
            }
        },

        consoleHandler : function(text, level){
            if(typeof console != "undefined") {
                var levelName = typeof this.logLevelNames[level] === "string"
                    ? this.logLevelNames[level].toLowerCase()
                    : "log",
                    logFunction = console.log;
                if (typeof console[levelName] === "function") {
                    logFunction = console[levelName]
                }
                logFunction.call(console, "\n\n\n" + text);
                try {
                    n.test
                } catch(exception) {
                    if(exception.stack) {
                        logFunction.call(console, exception.stack.replace("ReferenceError: n is not defined", ""))
                    }
                }
            }

        },

        /*
         *  Helper function to ger submit service proxy url
         */
        _getLogServiceProxyUrl: function() {
            var logServiceProxyUrl = "";
            if(this.logServiceProxy)
                logServiceProxyUrl += this.logServiceProxy;
            else //finally hard code it
                logServiceProxyUrl += ((this.contextPath && this.contextPath != "/") ? this.contextPath : "") + "/content/xfaforms/profiles/default.log.html";
            return logServiceProxyUrl;
        },

        _invokeAtServer: function(options) {
            var localSubmitUrl =  this._getLogServiceProxyUrl();
            var params = {
                    async: true,
                    url: localSubmitUrl,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    data: options
                };
            $.ajax(params);
        },

        isServerLoggingEnabled : function(){
            if((this.jsonModel.on == "true") && (this.jsonModel.type == "server" || this.jsonModel.type == "consoleServer"))
                return true;
            else
                return false;
        },

        serverHandler :function() {
            var options = {'logMessages' : this.logMessages, 'renderContext' : this.renderContext};
            this._invokeAtServer(options);
            this.logMessages = "" ;
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #FATAL} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        fatal : function(category, message, snippets) {
            this.log(category, this.FATAL, message, snippets);
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #ERROR} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        error : function(category, message, snippets) {
            this.log(category, this.ERROR, message, snippets);
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #WARN} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        warn : function(category, message, snippets) {
            this.log(category, this.WARN, message, snippets);
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #INFO} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        info : function(category, message, snippets) {
            this.log(category, this.INFO, message, snippets);
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #DEBUG} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        debug : function(category, message, snippets) {
            this.log(category, this.DEBUG, message, snippets);
        },

        /**
         * Writes a message to the console if log level is set to
         * {@link #TRACE} or higher.
         * @static
         * @param {String} message The log message
         * @param {String/String[]} snippets (optional) The texts replacing
         *        <code>{n}</code>
         */
        trace :  function(category, message, snippets) {
            this.log(category, this.TRACE, message, snippets);
        },

        isLogEnabled : function(category, level) {
            if(this.jsonModel.on == "true") {
                var pos = this.jsonModel.category.indexOf(category) ;
                if(this.jsonModel.level[pos] >= level)
                    return true;
            }
            return false;
        }

    });
})(_, xfalib, $);
/**
 * @package xfalib.ut.EventClass
 * @import xfalib.ut.Class
 */
(function(_, xfalib){
    // Regular expression used to split event strings
    // Regular expression used to split event strings
    var eventSplitter = /\s+/;

    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback functions
    // to an event; trigger`-ing an event fires all callbacks in succession.
    //
    var EventClass = xfalib.ut.EventClass =  xfalib.ut.Class.extend({

        // Bind one or more space separated events, `events`, to a `listener`
        // object. The object should implement `handleEvent` function which will be
        // called on event dispatch
        on: function(event, listener, context) {

            var calls, list,retVal = true;
            var fnCallback = _.isFunction(listener) ? listener : null;
            if (!listener || (!listener["handleEvent"] && !fnCallback)) return false;

            calls = this._callbacks || (this._callbacks = {});

            list = calls[event] || (calls[event] = []);
            if(fnCallback){
                context = context || this;
                var found = _.find(list, function(callback){
                    return (callback.fn == fnCallback && callback.context == context);
                }, this);
                if(found)
                    return false;
                else {
                    list.push({"fn" : fnCallback, "context": context});
                }
            }
            else{
                if(~list.indexOf(listener))
                    return false;
                else
                    list.push(listener);
            }

            return  true;
        },

        // Remove one or many callbacks. If `listener` is null, removes all listener for the
        // event. If `events` is null, removes all bound callbacks for all events.
        off: function(events, listener, context) {
            var event, calls, node;

            // No events, or removing *all* events.
            if (!(calls = this._callbacks)) return;
            if (!(events || listener)) {
                delete this._callbacks;
                return this;
            }

            var fnCallback = _.isFunction(listener) ? listener : null;
            // Loop through the listed events and contexts and remove the required ones.
            events = events ? events.split(eventSplitter) : _.keys(calls);
            while (event = events.shift()) {
                node = calls[event];
                calls[event] = _.filter(calls[event],function(elem) {
                    if(typeof(listener) !== "undefined"){
                        if(fnCallback && elem.fn == fnCallback && elem.context == context)
                            return false;
                        else if(!fnCallback && listener === elem)
                            return false;
                    }
                    else{
                        return false;
                    }
                    return true;
                });
                if(!calls[event].length)
                    delete calls[event];
            }

            return this;
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` except the first
        trigger: function(events) {
            var event, calls, rest;
            if (!(calls = this._callbacks)) return this;
            events = events.split(eventSplitter);
            var payLoad = _.rest(arguments);
            while (event = events.shift()) {
                _.each(calls[event],function(callback) {
                    if(callback.fn && callback.context){
                        callback.fn.apply(callback.context, payLoad);
                    }
                    else if (_.isFunction(callback.handleEvent)){
                        callback.handleEvent.apply(callback, payLoad);
                    }
                });
            }

            return this;
        }

    });


})(_, xfalib);


(function (_, $, xfalib) {
    var XfaUtil = xfalib.ut.XfaUtil = function () {
        },
        registeredLocaleProperties = null,
        timeoutListenerAttached = false,
        timeouts = [],
        attachClearTimeoutListener = function (timeout) {
            timeouts.push(timeout);
            if (timeoutListenerAttached === false) {
                $(window).one("destroy.xfa", function () {
                    _.each(timeouts, function (_timeout) {
                        clearTimeout(_timeout);
                    });
                    timeouts = [];
                    timeoutListenerAttached = false;
                });
                timeoutListenerAttached = true;
            }
        };
    _.extend(XfaUtil.prototype, {
        _globalUniqueId: (new Date()).getTime(),
        logger: null,

        formScaleFactor: 1,      // used to appropriately scale the form when contained inside an iframe

        getOrElse: xfalib.ut.Class.prototype.getOrElse,
        //map of event names between XTG and Mobile Form
        //Mobile Form uses different names for some the event and let's fix those names before sending them to XTG.
        _xtgEventName: {
            "$formready": "ready",
            "$layoutready": "ready"
        },

        generateUID: function () {
            return "UID" + (++XfaUtil.prototype._globalUniqueId);
        },

        matchJsonType: function (jsonModel, _class) {   //TODO: handle getOrElse
            return (jsonModel && _class && XfaUtil.prototype.getOrElse(jsonModel._class, "").toLowerCase() == ("" + _class).toLowerCase());
        },

        $data: function (elem, name, data) {
            if (!$.data(elem, "_xfaInitialized")) {
                //Initialized data- attributes parse for once using this call.
                // Next onward don't use this. Instead use $.data which is cheap/
                $(elem).data();
                $.data(elem, "_xfaInitialized", true); //Mark the element to say that data has been initialized.
            }
            return $.data(elem, name, data);
        },

        /*
         * alternative to jQuery.css which sets style properties directly through element.style. This is much faster then
         * corresponding jQuery.css alternative.
         *
         * Warning: this only supports standard css property names and does not do any pre-processing of name and value.
         * So calling this, make sure the style names are compatible.
         */
        $css: function (elem, stylesObj) {
            // Exclude the following css properties to add px. copied from jquery.cssNumber to add hyphenated style names
            var cssNumber = {
                "fillOpacity": true,
                "fill-opacity": true,
                "fontWeight": true,
                "font-weight": true,
                "lineHeight": true,
                "line-height": true,
                "zIndex": true,
                "z-index": true,
                "opacity": true,
                "orphans": true,
                "widows": true,
                "zoom": true
            };

            for (var prop in stylesObj) {
                var value = stylesObj[prop];
                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if (_.isNumber(value) && !cssNumber[ prop ]) {
                    value += "px";
                }
                elem.style[prop] = value;
            }
        },

        isTableHF: function (iChildNode) {
            //model can be a Node object or simply a json
            var assistJson = _.find(iChildNode.children, function (jChild) {
                return jChild._class == "assist";
            }, this);
            var childRole = (assistJson || {}).role;
            if (childRole == "TH" || childRole == "TF")
                return true;
            else
                return false;
        },

        getUiOneOfChildTag: function (uiParent) {
            var uiEl = _.find(uiParent.children, function (child) {
                return child._class == "ui";
            });
            if (!uiEl)
                return undefined;
            var uiOneOfChildMap = xfalib.runtime.xfa._templateSchema._getOneOfChild("ui");
            var uiOneOfChild = _.find(uiEl.children, function (child) {
                return uiOneOfChildMap[child._class] == true;
            });
            if (!uiOneOfChild)
                return undefined;
            return uiOneOfChild._class;
        },

        //TODO: this should be removed. One of the worst function.
        dIndexOf: function (searchArray, item2Find) {
            var ind = -1;
            _.find(searchArray, function (item, index) {
                return item == item2Find && (ind = index)
            });
            return ind;
        },

        splitStringByWidth: function (value, width, refEl) {
            var i = value.length , expectedWidth;
            do {
                expectedWidth = xfalib.view.util.TextMetrics.measureExtent(value.slice(0, i), {"refEl": refEl, maxWidth: -1}).width;
                i--;
            } while (expectedWidth > width)
            if (i != value.length - 1)
                return value.slice(0, i + 1);
            return value;
        },

        isRepeatabeEl: function (elTag) {
            if (elTag == "subform" || elTag == "subformSet")
                return true;
            else
                return false;
        },

        /**
         * @function
         * stripOrCall(toStrip, diffFunc, fArgs)
         * @description
         * common utility function to handle final submission payload stripping
         * @param {bool} toStrip : flag to signify whether to optimize jsonModelDiff size, by stripping off unnecessary properties
         * @param {function} diffFunc : callback func. call in case submit is not on
         * @param {Array} fArgs : arguments to be passed to the diff func.
         * @returns {object} object containing the jsonDiff
         */
        // should ALWAYS be called with a flag signifying if a submission is in progress,
        // and a callback function to compute the json to be sent back during submission, usually an apt '_computeJsonDiff'
        stripOrCall: function (toStrip, diffFunc, fArgs) {
            if (toStrip) {
                return {
                    "changed": false,
                    "jsonDifference": {}
                };
            }
            else if (_.isFunction(diffFunc)) {
                return diffFunc.apply(this, fArgs);
            }
        },

        /**
         * @function
         * partialStripOrCall(stripLvl, diffFunc, fArgs)
         * @description
         * common utility function to handle final submission payload stripping or for output of getFormState.
         * @param {int} diff_level : flag to signify whether to optimize jsonModelDiff size, by stripping off unnecessary properties
         *                        must be 0,1, or 2, as with "diff_level" param of _computeJsonDiff.
         * @param {function} diffFunc : callback func. call in case submit is not on
         * @returns {object} object containing the jsonDiff
         */
        partialStripOrCall: function (diff_level, diffFunc) {
            var diffObj = diffFunc.call(this, diff_level);

            if (!diffObj.changed) {
                if(diff_level === 1) {
                    diffObj = {
                        "changed": true,
                        "jsonDifference": {
                            "_class": this.jsonModel._class,
                            "name": this.jsonModel.name
                        }
                    };
                } else {
                    diffObj.jsonDifference = {};  // don't need stuff for other cases
                }
            }

            return diffObj;
        },

        /**
         * @function
         * stripObject(obj, exceptionNames)
         * @description
         * Utility function to strip unnecessary properties from an object
         * @param {object} obj : the object to strip
         * @param {Array} exceptionNames : array holding names of important properties to preserve
         * @returns {boolean} : true if this obj, or any of it's descendant is returned un-stripped
         */
        stripObject: function (obj, exceptionNames) {
            if (_.isEmpty(obj) || !_.isObject(obj)) {
                return true;
            } else {
                var dontStrip = false;
                _.each(_.keys(obj), function (propName) {
                    var keepProp = false;
                    if (!_.contains(exceptionNames, propName)) {
                        if (_.isArray(obj[propName])) {
                            _.each(obj[propName], function (arrElem) {
                                var isUnStripped = XfaUtil.prototype.stripObject(arrElem, exceptionNames);
                                keepProp = keepProp || isUnStripped;
                            });
                        } else if (_.isObject(obj[propName])) {
                            keepProp = XfaUtil.prototype.stripObject(obj[propName], exceptionNames);
                        }

                        if (!keepProp) {
                            delete obj[propName];
                        } else {
                            dontStrip = true;
                        }
                    } else {
                        dontStrip = true;
                    }
                });
                return dontStrip;
            }
        },

        computeDomJsonDiff: function (domNode) {
            var changed = true;
            if (domNode.hasOwnProperty("_modelChanged")) {
                changed = domNode._modelChanged;
            }
            var jsonDiff = {};
            if (changed) {
                this.copyObject(domNode.jsonModel, jsonDiff, {"exceptions": ["children", "{default}", "extras"]});
            } else {
                jsonDiff = {_class: domNode.className};
            }
            if (!changed && domNode.jsonModel.hasOwnProperty("name")) {
                jsonDiff.name = domNode.jsonModel.name;
            }
            return {
                "changed": changed,
                jsonDifference: jsonDiff
            };
        },

        getLogger: function () {
            return XfaUtil.prototype.logger || XfaUtil.prototype.getOrElse(xfalib, "runtime.xfa.Logger", null);
        },

        getErrorManager: function () {
            return XfaUtil.prototype.getOrElse(xfalib, "runtime.xfa.ErrorManager", null);
        },

        XFA_CLICK_EVENT: "xfaclick",
        XFA_EXIT_EVENT: "xfaexit",
        XFA_ENTER_EVENT: "xfaenter",
        XFA_CHANGE_EVENT: "xfachange",
        XFA_PREOPEN_EVENT: "xfapreopen",

        btwn: function (val, a, b) {
            return val > a && val < b;
        },

        // function to detect if Browser is chrome / safari (webkit)
        isWebkit: function () {
            return  !!$.browser.webkit || /webkit/.test(navigator.userAgent.toLowerCase()) || !!window.chrome || !!$.browser.chrome || /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()) || !!$.browser.safari || !!window.webkitURL ||
                ( /safari/.test(navigator.userAgent.toLowerCase()) &&
                    /apple computer/.test(navigator.vendor.toLowerCase()) );

            // TODO : find a better way to do this as $.browser is deprecated and
            // userAgent may be spoofed
        },

        clearTimeoutOnDestroy: function (timeout) {
            attachClearTimeoutListener(timeout);
        },

        // function to detect if Browser is  safari
        isSafari: function () {
            return ( /safari/.test(navigator.userAgent.toLowerCase()) &&
                    /apple computer/.test(navigator.vendor.toLowerCase()) );
        },

        getLocaleStrings: function () {
            return xfalib.locale.Strings;
        },

        getLogMessages: function () {
            return xfalib.locale.LogMessages;
        },

        /*
         * This function should not be added in the prototype of any Object
         * as in the case of other functions
         */
        registerLocaleProperties: function (props) {
            registeredLocaleProperties = props;
        },

        /*
         * This function should not be added in the prototype of any Object
         * as in the case of other functions
         */
        getDefaultLocaleProperty: function (property) {
            var localeProps = registeredLocaleProperties || this.getOrElse(xfalib, "script.Xfa._defaultLocale", null);
            return this.getOrElse(localeProps, property, null);
        },

        /**
         * Encodes <script> and </script> with &lt;script&gt; and &lt;/script&gt;
         * Does same with img, video and audio tags also.
         * These tags are being removed since scripts can be run through
         * <img onerror="script" /> (same for audio and video).
         */
        encodeScriptableTags: function (str) {
            var index;
            if (_.isString(str)) {
                return str.replace(/<(\/?)(script[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(img[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(video[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(audio[^<>]*)>/gi, '&lt;$1$2&gt;')
            }
        },

        /**
         *
         * @param id : a string representing an HTML element id.
         *
         * return after applying an escaping '\' before each # . : [ ]
         */
        jqId: function(id) {
            return "#" + id.replace(/(#|:|\.|\[|\])/g, "\\$1");
        },

        _triggerOnBridge: function (eventName, target, property, oldVal, newVal) {
            var evnt = xfalib.script.XfaModelEvent.createEvent(eventName, target,
                property, oldVal, newVal);
            if(formBridge){
                window.formBridge.trigger(eventName, evnt);
            }
        },

        /*
         * pads the passed in String str by pre-pending padChars to convert it to a string of given width.
         * If string length is already greater that equal to given width, original string is returned.
         */
        padString : function (str, width, padChar) {
            padChar = padChar || '0';
            str = str + '';
            return str.length >= width ? str : new Array(width - str.length + 1).join(padChar) + str;
        },

        /**
         * returns true if the browser is IE otherwise false
         * @returns {boolean}
         */
        isIE: function () {
            return $.browser.msie || (navigator.appName === "Netscape" && navigator.userAgent.match(/Trident\//))
        },

        /**
         * returns false if other browser
         * if ie tries to return browser version (non falsy)
         * @returns {*}
         */

        detectIE: function () {
            // 1st try jq
            if($.browser.msie) {
                if($.browser.version && parseInt($.browser.version, 10)) {
                    return parseInt($.browser.version, 10);
                }
            }

            var ua = window.navigator.userAgent;

            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

            // IE 12 / Spartan
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

            // Edge (IE 12+)
            // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        },
        /**
         * returns true if the browser is chrome otherwise false
         * @returns {boolean}
         */
        detectChrome : function () {
            return (!!window.chrome || !!$.browser.chrome || /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()));
        },

        /**
        * @param {String} val: value to be verified
        * @returns {boolean}
        * returns true if the provided string contains DOM element
        */
        isHTML: function(val) {
            //check whether string contains tags, so that $val does not contain result of the val used as selector
            // eg: val = "a" will return result for $(val) which is not required
            if(val && /<[a-z][\s\S]*>/.test(val)) {
                try {
                    var $val = $(val);
                    return $val.length > 0;
                } catch (exception) {
                    // if jquery throws exception that means string is not a proper HTML
                    return false;
                }
            } else {
                return false;
            }
        }
    });

    //Special handling for IE.
    if ($.browser.msie || $.browser.mozilla) {
        XfaUtil.prototype.$css = function (elem, stylesObj) {
            $(elem).css(stylesObj);
        }
    }
})(_, $, xfalib);
/*************************************************************************
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



(function (_, $, xfalib) {
    xfalib.ut.Utilities = {

        isIE11: function () {
            return !!navigator.userAgent.match(/Trident.*rv\:11\./);
        },

        checkMinMozillaVersion: function (version) {
            return (!this.isIE11() && $.browser.mozilla && parseInt($.browser.version) >= version);
        },

        getObjectFromKeyValueStringList: function (list) {
            var key, value, object = {}, tempArray;
            _.each(list, function (keyValuePair, index) {
                tempArray = keyValuePair.split("=");
                if (tempArray && tempArray.length > 1) {
                    object[tempArray[0]] = tempArray[1];
                }
            });
            return object;
        },

        _getNameWithoutMarker: function (fileName) {
            var markerIndex = fileName.indexOf("__afAttachment__");
            if (markerIndex !== -1) {
                fileName = fileName.substring(markerIndex + "__afAttachment__".length, fileName.length);
            }
            return fileName;
        }
    };
})(_, $, xfalib);
/**
 * @package xfalib.ut.Scanner
 * @fileOverview helper class to scan over a string.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel:{_str: String}}
 */

(function(_,xfalib){
    var Scanner = xfalib.ut.Scanner = xfalib.ut.Class.extend({

        initialize: function() {
            this._pos = 0;
        },

        isEOF : function(){
            return (this.jsonModel._str.length <= this._pos);
        },

        peek : function(){
            return (this.isEOF()) ? null : this.jsonModel._str.charAt(this._pos);
        },

        optionalConsumeChar : function(aChar){
            if(this.jsonModel._str.charAt(this._pos) == aChar){
                this._pos++;
                return aChar;
            }else{
                return null;
            }
        },

        /**
         * Gets next char ignore quoted string.
         *    |
         *   abc returns c.
         *     |
         *   abc'de'f returns f.
         * @param aChar
         */
        getNCharIQS : function(){
            this._pos++;
            if(this.jsonModel._str.length <= this._pos){
                var current = this.jsonModel._str.charAt(this._pos);
                if(current != '\''){
                    return current;
                }else{
                    if(moveNextExpectedChar('\'')){
                        return this.jsonModel._str.charAt(this._pos);
                    }
                }
            }
            return null;
        },

        moveNextExpectedChar : function(aChar){
            this._pos++;// currently point to '
            while(this._pos< this.jsonModel._str.length && this.jsonModel._str.charAt(this._pos) != aChar){
                this._pos++;
            }
            return this._pos < this.jsonModel._str.length;
        },

        readInteger : function(len){
            if(this.pos+len >this.jsonModel._str.length){
                return null;
            }
            var integer = xfalib.ut.PictureUtils.parseIntExact(this.jsonModel._str,this._pos,len);
            this._pos+=len;
            return integer;
        }
    });

    Scanner.lookupNext = function(pat, patPos, filter){
        var patLen = pat.length;
        if(patPos >= patLen){
            return null;
        }

        var token = {};
        token.startPos = patPos;

        var firstChar = pat.charAt(patPos);
        var patValid = false;
        //
        if (firstChar == '\''){
            for (var i = patPos+1; i < patLen;i++ ){
                var chr = pat.charAt(i);
                if(chr =='\''){
                    token.type=1;
                    token.len = i - patPos + 1;
                    patValid = true;
                    break;
                }
            }

        }else if( ('a' <= firstChar && firstChar <= 'z' || 'A' <= firstChar && firstChar <= 'Z') || filter.call(null, firstChar)){
            var endPos = patLen;//end is exclusive
            for (var i = 1; patPos+i < patLen;i++ ){
                if(pat.charAt(patPos+i)!=firstChar){
                    endPos = patPos+i;
                    break;
                }
            }
            token.type=2;
            token.len = endPos - patPos;
            token.patChar = firstChar;
            token.patPos = patPos;
            patValid = true;
        }else{
            if (firstChar == '?' || firstChar == '+' || firstChar == '*') {
                token.type=3;
                token.len = 1;
            }else{
                token.type=4;
                token.len = 1;
            }
            patValid = true;
        }
        if(patValid){
            return token;
        }else{
            throw "Picture is invalid.";
        }
    }
})(_,xfalib);


/**
 * @package xfalib.ut.PictureFmt
 * @fileOverview The file defines methods to parse and format data
 * according to XFA picture patterns.
 * @version 0.0.1
 */
(function(_,xfalib) {

    var PictureFmt = xfalib.ut.PictureFmt = function() {};
    PictureFmt.DatePicturePattern =  /^date(?:\([a-zA-Z]*_[a-zA-Z]*\))?\{([\w\W]*?)\}$/;
    PictureFmt.TimePicturePattern =  /^time(?:\([a-zA-Z]*_[a-zA-Z]*\))?\{([\w\W]*?)\}$/;
    PictureFmt.TextPicturePattern =  /^text\{([\w\W]*?)\}$/;
    PictureFmt.NumPicturePattern =  /^num\{([\w\W]*?)\}$/;

    /**
     * Parses a given data source according to the given picture.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {object}
     */
    PictureFmt.parse  = function(sSource, sPicture,sLocale){
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});

        var match = PictureFmt.DatePicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.parseDate(sSource, match[1]);
        }
        match = PictureFmt.TimePicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.parseTime(sSource, match[1]);
        }
        match = PictureFmt.TextPicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.parseText(sSource, match[1]);
        }
        match = PictureFmt.NumPicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.parseNumeric(sSource, match[1]);
        }
        throw "Invalid picture clause "+sPicture;
    };

    /**
     * Formats a given data source according to the given picture.
     * @param date {object}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.format  = function(sSource, sPicture, sLocale,bRelaxed,bFormatNumberFromasDefaultPC){
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});

        var match = PictureFmt.DatePicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.formatDate(sSource, match[1]);
        }
        match = PictureFmt.TimePicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.formatTime(sSource, match[1]);
        }
        match = PictureFmt.TextPicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.formatText(sSource, match[1],bRelaxed);
        }
        match = PictureFmt.NumPicturePattern.exec(sPicture);
        if(match && match[1]){
            return PictureEngine.formatNumeric(sSource, match[1],sLocale,bRelaxed,bFormatNumberFromasDefaultPC);
        }
            throw "Invalid picture clause "+sPicture;
    };

    /**
     * Checks if a given data source is formatted according to the given picture.
     * @param date {object}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {boolean}
     */
    PictureFmt.formatTest = function (sSource, sPicture, sLocale, bRelaxed, bFormatNumberFromasDefaultPC) {
        var formattedData;
        try {
            formattedData = PictureFmt.format(sSource, sPicture, sLocale, bRelaxed, bFormatNumberFromasDefaultPC);
        }catch(e) {
            return false;
        }

        if(!_.isString(formattedData)) {
            return false;
        } else {
            var parsedData;
            try {
                parsedData = PictureFmt.parse(formattedData, sPicture, sLocale);
            } catch (e) {
                return false;
            }
            if(!_.isString(parsedData) && parsedData !== formattedData) {
                return false;
            }
        }
        return true;
    };

    /**
     * Parses a given data source according to the given date picture
     * under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.parseDate  = function(sSource, sPicture,sLocale){
        var picRegexp = PictureFmt.DatePicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.parseDate(sSource, match[1]);
        }else{
            return PictureEngine.parseDate(sSource, sPicture);
        }
    };


    /**
     * Formats a given data source according to the given date picture
     * * under the given sLocale.
     * @param date {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.formatDate  = function(date, sPicture, sLocale){
        var picRegexp =  PictureFmt.DatePicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.formatDate(date, match[1]);
        }else{
            return PictureEngine.formatDate(date, sPicture);
        }
    };

    /**
     * Parses a given data source according to the given date picture
     * under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {date}
     */
    PictureFmt.parseTime  = function(sSource, sPicture,sLocale){
        var picRegexp = PictureFmt.TimePicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.parseTime(sSource, match[1]);
        }else{
            return PictureEngine.parseTime(sSource, sPicture);
        }
        return null;
    };


    /**
     * Formats a given data source according to the given date picture
     * * under the given sLocale.
     * @param date {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.formatTime  = function(date, sPicture, sLocale){
        var picRegexp =  PictureFmt.TimePicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.formatTime(date, match[1]);
        }else{
            return PictureEngine.formatTime(date, sPicture);
        }
    };

    /**
     * Parses a given data source according to the given text picture
     * under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.parseText  = function(sSource, sPicture,sLocale){
        var picRegexp = PictureFmt.TextPicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.parseText(sSource, match[1]);
        }else{
            return PictureEngine.parseText(sSource, sPicture);
        }
    };

    /**
     * Formats a given data source according to the given text picture
     *  under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.formatText  = function(sSource, sPicture, sLocale,bRelaxed){
        var picRegexp =  PictureFmt.TextPicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.formatText(sSource, match[1],bRelaxed);
        }else{
            return PictureEngine.formatText(sSource, sPicture,bRelaxed);
        }
        return null;
    };

    /**
     * Parses a given data source according to the given numeric picture
     * under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.parseNumeric  = function(sSource, sPicture,sLocale){
        var picRegexp = PictureFmt.NumPicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.parseNumeric(sSource, match[1]);
        }else{
            return PictureEngine.parseNumeric(sSource, sPicture);
        }
        return null;
    };

    /**
     * Formats a given data source according to the given numeric picture
     *  under the given sLocale.
     * @param sSource {string}
     * @param sPicture {string}
     * @param sLocale {string}
     * @returns {string}
     */
    PictureFmt.formatNumeric  = function(sSource, sPicture, sLocale){
        var picRegexp =  PictureFmt.NumPicturePattern;
        var match = picRegexp.exec(sPicture);
        var PictureEngine = new xfalib.ut.PictureEngine({jsonModel:{locale:sLocale}});
        if(match && match[1]){
            return PictureEngine.formatNumeric(sSource, match[1]);
        }else{
            return PictureEngine.formatNumeric(sSource, sPicture);
        }
    };




    /**
     * Parses a given data source according to the given datetime picture
     * under the given sLocale.
     * @param sSource {string}
     *            the source data.
     * @param sPicture {string}
     *            the datetime picture.
     * @param sDateMask {string}
     *            the date sub-picture.
     * @param sTimeMask {string}
     *            the time sub-picture.
     * @param sLocale
     *            the locale name.
     *
     */
    PictureFmt.parseDateTime  = function(sSource, sPicture, sDateMask, sTimeMask, sLocale){

    };
    /**
     * Formats a given data source according to the given datetime picture
     * under the given locale.
     *
     * @param sSource {string}
     *            the source data.
     * @param sPicture {string}
     *            the datetime picture.
     * @param sDateMask {string}
     *            the date sub-picture.
     * @param sTimeMask {string}
     *            the time sub-picture.
     * @param sLocale {string}
     *            the locale name.
     */
    PictureFmt.formatDateTime  = function(sSource, sPicture, sDateMask, sTimeMask, sLocale){

    };

})(_,xfalib);
/**
 * @package xfalib.ut.PictureUtils
 * @fileOverview The file defines static utilities methods.
 * @version 0.0.1
 */

(function(_,xfalib){
    var PictureUtils = xfalib.ut.PictureUtils = function() {}

    PictureUtils.padding = function(number, digits, isFw, zero){
        var leading = ["0","00","000","0000"];
        var numStr = leading[digits-1] + number;
        return numStr.slice(- digits);
    };

    PictureUtils.parseIntAggressive = function(dateString, startPos,len){
        var result = new Object();
        var parsedNum = 0; //The number value parsed from dateString
        var parsedLen = -1; //How many chars parsed according to this pattern;
        for(var idx=0; idx<len && (startPos + idx) < dateString.length; idx++){
            var chr = dateString.charAt(startPos + idx);
            if(chr >='0' && chr <='9'){
                parsedNum = parsedNum *10 + (chr- '0');
            }else{
                parsedLen = idx;
                break;
            }
        }
        if(parsedLen == -1) {
            parsedLen = len;
        }
        result.value = parsedNum;
        result.len = parsedLen;
        return result;
    };

    PictureUtils.parseIntExact = function(dateString, startPos,len){
        var result = 0;
        PictureUtils.assert(startPos+ len <= dateString.length, "mismatch");
        for(var idx=0; idx<len ; idx++){
            var chr = dateString.charAt(startPos + idx);
            if(chr >='0' && chr <='9'){
                result = result *10 + (chr- '0');
            }else{
                throw "unexpected currentChar in PictureUtils.parseInt";
            }
        }
        return result;
    };

    PictureUtils.isDigit = function(chr){
        return /[0-9]/.test(chr) ;
    };

    PictureUtils.inString = function(chr,aString){
        return (aString.indexOf(chr) >=0) ;
    };


    var regExpIsLetter = /[\u0041-\u005a\u0061-\u007a\u00aa-\u00aa\u00b5-\u00b5\u00ba-\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u0236\u0250-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ee-\u02ee\u037a-\u037a\u0386-\u0386\u0388-\u038a\u038c-\u038c\u038e-\u03a1\u03a3-\u03ce\u03d0-\u03f5\u03f7-\u03fb\u0400-\u0481\u048a-\u04ce\u04d0-\u04f5\u04f8-\u04f9\u0500-\u050f\u0531-\u0556\u0559-\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0621-\u063a\u0640-\u064a\u066e-\u066f\u0671-\u06d3\u06d5-\u06d5\u06e5-\u06e6\u06ee-\u06ef\u06fa-\u06fc\u06ff-\u06ff\u0710-\u0710\u0712-\u072f\u074d-\u074f\u0780-\u07a5\u07b1-\u07b1\u0904-\u0939\u093d-\u093d\u0950-\u0950\u0958-\u0961\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2-\u09b2\u09b6-\u09b9\u09bd-\u09bd\u09dc-\u09dd\u09df-\u09e1\u09f0-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e-\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd-\u0abd\u0ad0-\u0ad0\u0ae0-\u0ae1\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d-\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b71-\u0b71\u0b83-\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c-\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb5\u0bb7-\u0bb9\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c60-\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd-\u0cbd\u0cde-\u0cde\u0ce0-\u0ce1\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d60-\u0d61\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd-\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e81-\u0e82\u0e84-\u0e84\u0e87-\u0e88\u0e8a-\u0e8a\u0e8d-\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5-\u0ea5\u0ea7-\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd-\u0ebd\u0ec0-\u0ec4\u0ec6-\u0ec6\u0edc-\u0edd\u0f00-\u0f00\u0f40-\u0f47\u0f49-\u0f6a\u0f88-\u0f8b\u1000-\u1021\u1023-\u1027\u1029-\u102a\u1050-\u1055\u10a0-\u10c5\u10d0-\u10f8\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1206\u1208-\u1246\u1248-\u1248\u124a-\u124d\u1250-\u1256\u1258-\u1258\u125a-\u125d\u1260-\u1286\u1288-\u1288\u128a-\u128d\u1290-\u12ae\u12b0-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0-\u12c0\u12c2-\u12c5\u12c8-\u12ce\u12d0-\u12d6\u12d8-\u12ee\u12f0-\u130e\u1310-\u1310\u1312-\u1315\u1318-\u131e\u1320-\u1346\u1348-\u135a\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7-\u17d7\u17dc-\u17dc\u1820-\u1877\u1880-\u18a8\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1d00-\u1d6b\u1e00-\u1e9b\u1ea0-\u1ef9\u1f00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59-\u1f59\u1f5b-\u1f5b\u1f5d-\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe-\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071-\u2071\u207f-\u207f\u2102-\u2102\u2107-\u2107\u210a-\u2113\u2115-\u2115\u2119-\u211d\u2124-\u2124\u2126-\u2126\u2128-\u2128\u212a-\u212d\u212f-\u2131\u2133-\u2139\u213d-\u213f\u2145-\u2149\u3005-\u3006\u3031-\u3035\u303b-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312c\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fa5\ua000-\ua48c\uac00-\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e-\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/

    /**
     * TODO Implement method equivalent to Character.isLetter.
     */
    PictureUtils.isLetter = function(chr){
        return regExpIsLetter.test(chr);
    };

    PictureUtils.isLetterOrDigit = function(chr){
        return this.isLetter(chr) || this.isDigit(chr);
    };

    /**
     * Scan this string for the first character in the given set. Similar to
     * strcspn().
     *
     * @param src{String}
     *            the string to scan
     * @param sSkip{String}
     *            the characters to scan for
     * @param nOffset{number}
     *            the position where to start the scan. Default = 0.
     * @return The position, relative to nOffset, for the first character found
     *         in the given set
     */
    PictureUtils.skipUntil = function(srcStr, sSkip, nOffset) {
        var nCharsSkipped = nOffset;

        // starting at the offset position, scan the characters in this string
        // until it matches one of the characters in the given set.
        while (nCharsSkipped < srcStr.length) {
            var i = nCharsSkipped;
            if (sSkip.indexOf(srcStr.charAt(i++)) >= 0)
                break;
            nCharsSkipped = i;
        }

        return nCharsSkipped - nOffset;
    };

    PictureUtils.matchString = function(str, startPos, target){
        if(startPos + target.length > str.length){
            return false;
        }else{
            for(var idx = 0; idx<target.length; idx++){
                if(target.charAt(idx) != str.charAt(startPos + idx)) return false;
            }
            return true;
        }
    };

    PictureUtils.assert = function(condition, message){
        if(!condition){
            throw message;
        }
    };

    PictureUtils.getLocaleObject = function(locale,property) {
        if(locale !== null && xfalib.runtime.xfa) {
            return xfalib.runtime.xfa._getLocaleSymbols(locale, property);
        } else {
            return xfalib.ut.XfaUtil.prototype.getDefaultLocaleProperty(property)
        }
    }

    PictureUtils.getHashOfLocaleObject = function(locale,property) {
          if(!PictureUtils.getHashOfLocaleObject[locale+"_"+property]) {
              var hashObj = {};
              _.each(PictureUtils.getLocaleObject(locale,property), function(val) {
                  var sVal = (val+"").toLowerCase();
                  var hash = 0;
                  for(var i =0;i<sVal.length;i++) {
                      hash+=(i+1)*sVal.charCodeAt(i)
                  }
                  hashObj[hash] = hashObj[hash] || [];
                  hashObj[hash].push(sVal);
              })
              PictureUtils.getHashOfLocaleObject[locale+"_"+property] = hashObj;
          }
          return PictureUtils.getHashOfLocaleObject[locale+"_"+property]
    }

    PictureUtils.convertNumberToLocale = function(locale,number) {
        var zero = PictureUtils.getLocaleObject(locale,"numberSymbols.zero");
        var zeroCode = zero.charCodeAt(0);
        number += "";
        var newNumber = [];
        for(var i = 0;i < number.length;i++) {
            newNumber.push(String.fromCharCode(zeroCode + parseInt(number.charAt(i))));
        }
        return newNumber.join("");
    }

    PictureUtils.parsePictureClause = function (clause){
        if(clause === null || clause === undefined) {
            return [];
        }
        var insidePattern = false,
            insideQuote=false,
            insideLocale = false,
            locale = "",
            type = "",
            pattern = "",
            flag = false,
            currentChar = "",
            result = [],
            matchType = /^num$|^text$|^date$/,
            matchLocale = /^[a-zA-Z]*_[a-zA-Z]*$/,
            i = 0,
            bracketOpenCount = 0;
        for(;i<clause.length;i++) {
            currentChar = clause.charAt(i);
            if(insideQuote && currentChar !== "'") {
                pattern += currentChar;
                continue;
            }
            switch(currentChar) {
               case "'":
                   if(!insidePattern) {
                       // ' is not allowed except insidePattern
                       return null;
                   }
                   insideQuote = !insideQuote;
                   pattern += currentChar;
                   break;
               case "{":
                    if(insidePattern || insideLocale || type === "") {
                        // { is not allowed insidePattern or insideLocale
                        return null;
                    }
                   insidePattern = true;
                    break;
                case "}":
                    if(!insidePattern || (insideLocale && pattern === "") || type === "") {
                        // { is allowed only insidePattern and not insideLocale
                        return null;
                    } else {
                        bracketOpenCount = 0;
                        insidePattern = false;
                        if(matchType.exec(type) === null) {
                            return null;
                        }
                        if(locale !== "" && matchLocale.exec(locale) === null) {
                            return null;
                        }
                        result.push({
                            category: type,
                            mask: pattern,
                            locale: locale
                        })
                    }
                    break;
                case "|":
                    if(type === "" || insidePattern || insideLocale) {
                        return null;
                    } else {
                        type = pattern = locale = "";
                        insidePattern = insideLocale = false;
                    }
                    break;
                case "(" :
                    if(type === "" || bracketOpenCount === 1) {
                        // ( is not allowed inside Locale
                        return null;
                    } else {
                        if(!insidePattern) {
                            insideLocale = true;
                        } else {
                            pattern += currentChar;
                        }
                        bracketOpenCount++;
                    }
                    break;
                case ")" :
                    if((!insideLocale && !insidePattern) || bracketOpenCount === 0) {
                        return null;
                    } else {
                        if(insidePattern) {
                            pattern += currentChar;
                        }
                        insideLocale = false;
                        bracketOpenCount--;
                    }
                    break;
                default:
                    if(insidePattern) {
                        pattern += currentChar;
                    } else if(insideLocale) {
                        locale += currentChar;
                    } else if(type !== "" && (pattern !== "" || locale !== "")){
                        return null;
                    } else {
                        type += currentChar;
                    }
                    break;
           }
       }
       if(insidePattern || insideLocale || insideQuote || bracketOpenCount !== 0) {
           return null;
       }
       return result;
    }

})(_,xfalib);

/**
 * @package xfalib.ut.VisitorBase
 * @import xfalib.ut.Class
 * @fileOverview Base class for visitor
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String}}
 */

(function(_,xfalib) {
    var VisitorBase = xfalib.ut.VisitorBase = xfalib.ut.Class.extend({
        consume : function(token){
            switch (token.type)
            {
                case 1:
                    this.consumeStringLiteral(token);
                    break;
                case 2:
                    this.consumeSubPattern(token);
                    break;
                case 3:
                    this.consumeStringWildCard(token);
                    break;
                case 4:
                    this.consumeCharLiteral(token);
                    break;
            }
        },
        acceptPatternChar : function(chr){
            return false;
        },
        getPicture : function(){
            return this.jsonModel._sPicture;
        },
        abstractMethod : function(){
            throw "Not implemented";
        },
        consumeStringWildCard : this.abstractMethod,
        consumeStringLiteral: this.abstractMethod,
        consumeCharLiteral: this.abstractMethod,
        consumeSubPattern: this.abstractMethod,
        getResult: this.abstractMethod
    });
})(_,xfalib);

/**
 * @package xfalib.ut.NumPictureDesc
 * @import xfalib.ut.Class
 * @fileOverview Pre-process Numeric Picture.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String}}
 */

(function(_,xfalib){
    var NumPictureDesc = xfalib.ut.NumPictureDesc = xfalib.ut.Class.extend({

        initialize: function() {
            this.hasRadix = false;
            this.hasExpon = false;
            this.hasSign = false;
            this.hasPercent = false;
            this.fracDigit = 0;
            this.intDigit = 0;

            this._mbLeftParenSeen = false;
            this._mbRightParenSeen = false;
            this._compactPattern();
            this._xlatePattern();
            NumPictureDesc._super.initialize.call(this);
        },
        
        getPicture : function(){
            return this.jsonModel._sPicture;
        },

        _match2Char : function (char1, char2, idx){
            if(idx+1 < this.jsonModel._sPicture.length){
                return (this.jsonModel._sPicture.charAt(idx) ==char1 && this.jsonModel._sPicture.charAt(idx+1) ==char2);
            }else{
                return false;
            }
        },

        _xlatePattern : function(){
            var patPos = 0;
            for(var token = xfalib.ut.Scanner.lookupNext(this.jsonModel._sPicture, patPos, this._acceptPatternChar); token != null;  ){
                this._consume(token);
                patPos = patPos + token.len;
                token = xfalib.ut.Scanner.lookupNext(this.jsonModel._sPicture, patPos, this._acceptPatternChar);
            }
        },
        
        _compactPattern : function(){
            var buf = new Array();
            for(var index =0, len = this.jsonModel._sPicture.length; index <len; index++){
                if(this._match2Char('D','B',index)){
                    buf.push('D');
                    index++;
                }else if(this._match2Char('d','b',index)){
                    buf.push('d');
                    index++;
                }else if(this._match2Char('C','R',index)){
                    buf.push('C');
                    index++;
                }else if(this._match2Char('c','r',index)){
                    buf.push('c');
                    index++;
                }else{
                    buf.push(this.jsonModel._sPicture.charAt(index));
                }
            }
            this.jsonModel._sPicture = buf.join("");
        },

        _acceptPatternChar : function(chr){
            return xfalib.ut.PictureUtils.inString(chr, "(%$,.)89BCDERSVZbcdrsvzt");
        },

        _consume : function(token){
            if(token.type == 2){
                this._subConsume(token.patChar, token.len);
            }// else not a pattern
        },

        _subConsume : function(chr, chrCnt){
            switch (chr) {
                case'E' :
                    if (chrCnt > 1 || this.hasExpon || (this.fracDigit + this.intDigit)==0)
                        throw "Illegal Numeric Picture: more than one Expon";
                    this.hasExpon = true;
                    break;
                case '(':
                    if (chrCnt > 1 || this._mbLeftParenSeen	|| this.fracDigit + this.intDigit >0 )
                        throw "Illegal Numeric Picture:  ()";
                    this._mbLeftParenSeen = true;
                    break;

                case ')':
                    if (chrCnt > 1 || ! this._mbLeftParenSeen || this._mbRightParenSeen)
                        throw "Illegal Numeric Picture:  ()";
                    this._mbRightParenSeen = true;
                    if(this.fracDigit + this.intDigit >0) this.hasSign = true;
                    break;
                case 'S':
                case 's':
                case 'C': //CR
                case 'c': //cr
                case 'D': //DB
                case 'd': //db
                    this.hasSign = true;
                    break;
                case '%' :
                    this.hasPercent = true;
                    break;
                case '.':
                case 'V':
                case 'v':
                    if (chrCnt > 1 || this.hasRadix)
                        throw "Illegal Numeric Picture: too many vV.";
                    this.hasRadix = true;
                    this._mbFracStartSeen = true;
                    break;
                case '8' :
                case '9' :
                case 'Z':
                case 'z':
                    if (this.hasRadix){
                        this.fracDigit += chrCnt;
                    } else{
                        this.intDigit += chrCnt;
                    }
                    break;
            }
        },

        parseNumberInfo : function(msText){
            var text=msText,
                num = Number(text),
                negative = false
            if(num < 0){
                negative = true;
                num = -num;
                text = text.replace("-","");
            }
            if(this.hasPercent){
                num *= 100;
                text = ""+num;
            }
            var shift = 0;
            if(this.hasExpon){
                var threshold = Math.pow(10,this.intDigit);
                if(num < threshold){
                    while(num*10 < threshold) {
                        num *= 10;
                        shift--;
                    }
                }else{
                    while(num > threshold){
                        num /= 10;
                        shift++;
                    }
                }
                text = num+"";
            }
            var radixPos = text.indexOf(".", 0),
                fractionDigit = radixPos<0 ? 0 : text.length - radixPos - 1

            if(this.fracDigit < fractionDigit) {
                num = num.toFixed(this.fracDigit);
                text = num +""
            }

            if(text.indexOf("0") == 0 && msText.indexOf("0") != 0) {
                text = text.substring(1);
            }

            radixPos = text.indexOf(".", 0)
            var integerDigit = radixPos < 0 ? text.length : radixPos,
                offset = this.intDigit - integerDigit

            if(offset <0 ){
                throw "Exit: most significant " + offset +" digit lost";
            }
            return {
                "integerDigit" : integerDigit,
                "radixPos" : radixPos ,
                "fractionDigit" :  radixPos<0 ? 0 : text.length - radixPos - 1,
                "msText" : text,
                "shift" : shift,
                "isNegative" : negative,
                "padding" :offset
            };
        }
    });

    NumPictureDesc.gsDB = "DB";
    NumPictureDesc.gsCR = "CR";
    NumPictureDesc.gsE = "E";
    NumPictureDesc.gsDSP = "  ";
    NumPictureDesc.gsSSP = " ";

})(_,xfalib);











    /**
 * @package xfalib.ut.TimeInfo
 * @import xfalib.ut.Class
 * @fileOverview A wrapper class for date related information.
 * @version 0.0.1
 */

/**
 * @constructor
 */
(function(_,xfalib){
    var TimeInfo = xfalib.ut.TimeInfo = xfalib.ut.Class.extend({

        initialize: function() {
            this.mHourOfMeriDiem = -1;
            this.mHourOfDay = -1;
            this.mMinuteOfHour = -1;
            this.mSecondOfMinute = -1;
            this.mThousandthOfSecond = -1;
        },

        getISOTime : function(){
            var timeStr = "";
            if(this.mThousandthOfSecond>0){
                timeStr = "-" + this.formatNum(this.mThousandthOfSecond,3);
            }
            if(this.mSecondOfMinute>0 || timeStr!=""){
                timeStr = this.formatNum(this.mSecondOfMinute,2)+timeStr;
                timeStr = ":"+timeStr;
            }
            if(this.mMinuteOfHour>0 || timeStr!=""){
                timeStr = this.formatNum(this.mMinuteOfHour,2)+timeStr;
                timeStr = ":"+timeStr;
            }
            timeStr = this.formatNum(this.mHourOfDay,2) + timeStr;

            return timeStr;
        },

        formatNum : function(num, digits){
            if(num<0){
                num = 0;
            }
            return xfalib.ut.PictureUtils.padding(num, digits);
        },

        getDate : function(){
            var date = new Date();
            this.setTime(date);
            return date;
        },

        setTime : function(date){
            date.setHours(this.mHourOfDay);
            date.setMinutes(this.mMinuteOfHour);
            date.setSeconds(this.mSecondOfMinute);
            date.setMilliseconds(this.mThousandthOfSecond);
        }
    });

    /**
     *
     * <p>Valid ISO8601/XFA time strings are in any one
     * of the following time patterns:
     * <ul>
     * <li> HH[MM[SS[.FFF][z]]]
     * <li> HH[MM[SS[.FFF][+HH[MM]]]]
     * <li> HH[MM[SS[.FFF][-HH[MM]]]]
     * <li> HH[:MM[:SS[.FFF][z]]]
     * <li> HH[:MM[:SS[.FFF][+HH[:MM]]]]
     * <li> HH[:MM[:SS[.FFF][-HH[:MM]]]]
     * </ul>
     */
    TimeInfo.Parse = function(isoDateStr, locale){
        var scanner = new xfalib.ut.Scanner({jsonModel:{_str:isoDateStr}});
        var hours = scanner.readInteger(2);
        var minitues = -1;
        if(!scanner.isEOF()){
            scanner.optionalConsumeChar(':');
            minitues = scanner.readInteger(2);
        }
        var seconds = -1;
        if(!scanner.isEOF()){
            scanner.optionalConsumeChar(':');
            seconds = scanner.readInteger(2);
        }
        var milliseconds = -1;
        if(!scanner.isEOF()){
            scanner.optionalConsumeChar('-');
            milliseconds = scanner.readInteger(3);
        }
        //TODO timezone
        var info = new xfalib.ut.TimeInfo();
       TimeInfo.setPropertyIfNotNull(info,hours,"mHourOfDay");
       TimeInfo.setPropertyIfNotNull(info,minitues,"mMinuteOfHour");
       TimeInfo.setPropertyIfNotNull(info,seconds,"mSecondOfMinute");
       TimeInfo.setPropertyIfNotNull(info,milliseconds,"mThousandthOfSecond");
        return info;
    };

    /**
     *
     * static method
     */
    TimeInfo.setPropertyIfNotNull = function(object, value, proName){
        if(value!=null){
            var d = Number(value);
            if(!isNaN(d)){
                object[proName] = d;
            }
        }
    };

})(_,xfalib);
/**
 * @package xfalib.ut.DateInfo
 * @import xfalib.ut.Class
 * @fileOverview A wrapper class for date related information.
 * @version 0.0.1
 */

/**
 * @constructor
 */

(function(_,xfalib) {
    var DateInfo = xfalib.ut.DateInfo = xfalib.ut.Class.extend({

        initialize: function(options) {
            if (options && !options.isParsingCall ) { // skip setting internal values when called while parsing date formats
                this.date = new Date();
                this._year = this.date.getFullYear();
                this._month = this.date.getMonth() + 1;
                this._day = this.date.getDay();
            }
            DateInfo._super.initialize.call(this);
        },

        formatNum : function(num, digits){
            if(num<0)
                num = 0;
            return xfalib.ut.PictureUtils.padding(num, digits);
        },

        getDate : function(){
            return this.date;
        },
        setDate : function() {
          this.date = new Date(this._year,this._month-1,this._day)
        },
        getISODate : function(){
            var isoDate = [];

            isoDate.push(this.formatNum(this._year, 4));
            isoDate.push("-");
            isoDate.push(this.formatNum(this._month, 2));
            isoDate.push("-");
            isoDate.push(this.formatNum(this._day, 2));

            return isoDate.join("");
        },

        year : function(y) {
            if(y && y > 0 && y < 9999)
                this._year = y;
            else
                throw "undefined year";
        },

        month : function(m) {
            if(m && m>0 && m < 13) {
               this._month = m;
            }
            else
                throw "Invalid month " + m;
        },

        _leapYear : function() {
            var year = this._year;
            return year % 400 == 0 || (year % 100 != 0 && year % 4 == 0);
        },

        _maxDate : function(m) {
              if(this._leapYear() && m == 2)
                 return 29;
              else return DateInfo.dates[m-1];
        },

        day : function(d) {
            if(d && d > 0 && d <= this._maxDate(this._month || 0))
                this._day = d;
            else
                throw "Invalid Date "+ d + " for the month "+(this._month);
        },

        validate : function(y, m, d) {
                this.year(y);
                this.month(m);
                this.day(d);
        }
    });

    DateInfo.ParseIsoString = function(isoDateStr, locale){
        var isoDateRegexp = /^(\d{4})(?:-?(\d{1,2})(?:-?(\d{1,2}))?)?$/;
        var match = isoDateRegexp.exec(isoDateStr);
        if(match && match.length === 4){
            var dateInfo = new DateInfo();
            try {
                dateInfo.year(Number(match[1]));
                dateInfo.month(Number(match[2]));
                dateInfo.day(Number(match[3]));
                dateInfo.setDate();
            } catch(e) {
                return null;
            }
            return dateInfo;
        }
        return null;
    };

    DateInfo.Parse = function(dateStr, locale){
        locale = locale || "en_US";
        var patterns = xfalib.ut.PictureUtils.getLocaleObject(locale,"datePatterns"),
            isoDate = this.ParseIsoString(dateStr, locale);
        if(!_.isEmpty(isoDate)) {
            return isoDate;  // in case edit pattern is present, it'll be parsed by the widget during input and return an iso date string.
        }
        _.find(patterns, function(pattern) {
              try {
                  isoDate = xfalib.ut.PictureFmt.parseDate(dateStr,pattern,locale);
                  return true;
              } catch(exception) {
                  return false;
              }
        });
        isoDate = isoDate || dateStr;
        return DateInfo.ParseIsoString(isoDate);
    };

    DateInfo.dates = [31,28,31,30,31,30,31,31,30,31,30,31];
    DateInfo.daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
})(_,xfalib);
/**
 * @package xfalib.ut.PictureEngine
 * @import xfalib.ut.Scanner
 * @fileOverview The file is a facade to assembly all components together.
 * @version 0.0.1
 */
(function(_,xfalib) {

    var PictureEngine = xfalib.ut.PictureEngine = xfalib.ut.Class.extend({

        _lookupNext: xfalib.ut.Scanner.lookupNext,

        MAX_XFA_PREC	: 8,		// Max no. of fractional digits in XFA.
        MAX_DBL_DIG	:18,		// Max no. of significant digits in a double.
        MAX_INT_DIG	:10,		// Max no. of significant digits in an integer.
        MAX_DBL_WIDTH	:15,		// Max width before precision loss in a double.
        INTEGRAL_FMT :  0,
        DECIMAL_FMT : 1,
        CURRENCY_FMT : 2,
        PERCENT_FMT : 3,

        parseDate : function(sSource, sPicture, locale){
            return this._acceptVisitor(new xfalib.ut.DateParsingVisitor({jsonModel:{_sPicture:sPicture,_dataString:sSource,_locale:this.jsonModel.locale}}));
        },

        formatDate : function(dDate, sPicture){
            var dateInfo = xfalib.ut.DateInfo.Parse(dDate, this.jsonModel.locale);
            if(dateInfo == null){
                return null;
            }else{
                return this._acceptVisitor(new xfalib.ut.DateFormattingVisitor({jsonModel:{_sPicture:sPicture,_dateInfo:dateInfo,_locale:this.jsonModel.locale}}));
            }
        },

        parseTime : function(sSource, sPicture){
            return this._acceptVisitor(new xfalib.ut.TimeParsingVisitor({jsonModel:{_sPicture:sPicture,_dataString:sSource}}));
        },

        formatTime : function(dDate, sPicture){
            var timeInfo = xfalib.ut.TimeInfo.Parse(dDate, this.jsonModel.locale);
            if(timeInfo == null){
                return null;
            }else{
                return this._acceptVisitor(new xfalib.ut.TimeFormattingVisitor({jsonModel:{_sPicture:sPicture,_timeInfo:timeInfo}}));
            }
        },

        parseText : function(sSource, sPicture){
            return this._acceptVisitor(new xfalib.ut.TextParsingVisitor({jsonModel:{_sPicture:sPicture,_dataString:sSource}}));
        },

        formatText : function(sSource, sPicture,bRelaxed){
            return this._acceptVisitor(new xfalib.ut.TextFormattingVisitor({jsonModel:{_sPicture:sPicture,_text:sSource,relaxed:bRelaxed}}));
        },

        parseNumeric : function(sSource, sPicture){
            var visitor = new xfalib.ut.NumParsingVisitor({jsonModel:{_sPicture:sPicture,_dataString:sSource,_locale:this.jsonModel.locale}}); // TODO : Is locale required
            visitor.parse();
            return visitor.getResult();
        },

       formatNumeric : function(sSource, sPicture,locale,bRelaxed,bFormatNumberFromasDefaultPC){

             var sFormatPicture =sPicture;
             if( bRelaxed && bFormatNumberFromasDefaultPC){
                 sFormatPicture = this.getNumberFormat(sPicture,1, {formatOption: "WITH_GROUPINGS",
                                      "precision"  : this.getNumberPrecision(sSource),
                                    "width"      : sSource.length
                                   });
             }
             return this._acceptVisitor(new xfalib.ut.NumFormattingVisitor({jsonModel:{_sPicture:sFormatPicture,_locale:this.jsonModel.locale},text:sSource}));
        },

        _acceptVisitor : function(visitor){
            this._scanPattern(visitor);
            return visitor.getResult();
        },

        _scanPattern : function(visitor){
            var patPos = 0;
            var sPicture = visitor.getPicture();
            for(var token = this._lookupNext(sPicture, patPos, visitor.acceptPatternChar); token != null;  ){
                visitor.consume(token);
                patPos = patPos + token.len;
                token = this._lookupNext(sPicture, patPos, visitor.acceptPatternChar);
            }
        },

       /**
          * Removes n bytes from this string starting at position nOffset.
         *
          * @param nOffset - start position for the remove
          * @param nLength - the number of characters to remove
          * @return This string
          */

         _swallow : function(sString , nOffset, nLenToSwallow)
         {
             if(_.isEmpty(sString) || nLenToSwallow ==0){
                 return sString;
             }

             if( (nOffset + nLenToSwallow)> sString.length ) {
                 nLenToSwallow = (nOffset + nLenToSwallow) - sString.length;
             }
            var subStr = sString.substr(0,nOffset) + sString.substr(offset + nLenToSwallow);

             return subStr
         },
         /**
         * Replace some portion of one string with another String.
          * @param sString - the String where it has to be replaced.
          * @param sReplacement - the replacement string.
          * @param nOffset - start position for the replacement. Default value = 0.
          * @param nCutLength - the number of bytes to remove from the
          * original string.
          */

         _replaceAll : function(sString ,sReplacement , nOffset ,nCutlength) {
             return sString.substr(0,nOffset) + sReplacement  + sString.substr(nOffset + nCutlength)
         },

         //----------------------------------------------------------------------
         // SkipOver
         //
         // Scan this string for the first byte of the character not in the given set.
         // Similar to strspn().
         //----------------------------------------------------------------------
         _skipOver : function(fromString,sSkip, nOffset)
         {
             // starting at the offset position, scan the characters in this string
             // until it does not match any of the characters in the given set.
            var nCharsSkipped = nOffset;
             var i = 0;
             while (nCharsSkipped < fromString.length)
             {
                 i = nCharsSkipped;
                 if (sSkip.indexOf(fromString[i]) ==-1) {
                     break;
                 }
                 i++;
                 nCharsSkipped = i;
             }

             return nCharsSkipped - nOffset;
         },

         /*
          * Get the numeric format in the given style.
          * @param style in the range of values 0-2,
          * where (0 = integral, 1 = decimal, 2 = currency).
          * @param option in the set of format options:
          */
         getNumberFormat : function(format , style, option)
        {
             if (style < this.INTEGRAL_FMT || this.PERCENT_FMT < style) {
                 style = this.DECIMAL_FMT;
             }

             var sFormat = format;

             //
             // Use any alternate part because they handle negative values.
             //
             var  nBar = 0;
             if ((nBar = sFormat.indexOf('|')) != -1) {
                 sFormat = this._swallow(sFormat, 0, nBar + 1);
             }
             //
             // Determine position of radix (or anything like it)
             // and the replicating part of the pattern, i.e., from
             // the separator to this radix.
            //
             var nDot;
             if ( (nDot = sFormat.indexOf('.')) == -1) {
                 if ((nDot = sFormat.indexOf('v')) == -1) {
                     if ((nDot = sFormat.indexOf('V')) == -1) {
                         if ((nDot = sFormat.indexOf('E')) == -1) {
                             if ((nDot = sFormat.indexOf(' ')) == -1) {
                                 if ((nDot = sFormat.indexOf('%')) == -1) {
                                     nDot = sFormat.length;
                                 }
                             }
                         }
                     }
                 }
             }
             if (nDot) {
                 if (this._skipOver(sFormat,"89zZ", nDot - 1) != 1) {
                     nDot = sFormat.length;
                 }
             }
             var sZZZ;
             var nZed;
             if ( (nZed = sFormat.indexOf("z,")) != -1) {
                 //
                 // Watson 1230768.  Handle locales, like India, that have
                 // pictures with more than one grouping symbol.
                //
                 var nSep = nDot;
                 var nComma;
                 if ((nComma = sFormat.indexOf(',', nZed + 2)) !=-1) {
                    nSep = nComma;
                 }
                 if (nSep > nZed + 2) {
                     sZZZ = Array(nSep - nZed).join('z');
                 }
                 else {
                     sZZZ = Array(1).join('z');
                 }
             }
             else {
                nZed = 0;
             }
             //
             // If non-integral styles Then determine width and precision.
             //
             var nPrec = 0;
             var nWidth = this.MAX_INT_DIG;
             if (style != this.INTEGRAL_FMT) {
                 nPrec = option.precision; // (option >> 8) & 0xff;
                 var trim = ((nPrec & 0x80) == 0);
                 nPrec &= 0x7f;
                 if (nPrec == 0x7f) {
                     nPrec = this._skipOver(sFormat, "89zZ", nDot + 1);
                 }
                 if ((option.width) != undefined) {
                     nWidth = option.width;
                 }
                 else {
                     nWidth = this.MAX_DBL_DIG;
                 }
                 //
                 // Fix for Watson 1229423.  If the locale's format contains
                 // any sign pictures Then widen accordingly.  Also widen if
                 // precision of locale's picture format is greater than requested.
                 //
                 if (sFormat.indexOf('s')!=-1) {
                     nWidth += 1;
                 }
                 if (sFormat.indexOf('(')!=-1) {
                     nWidth += 1;
                 }
                 if (sFormat.indexOf(')') !=-1) {
                     nWidth += 1;
                 }
                var nFmtPrec = this._skipOver(sFormat,"89zZ", nDot + 1);
                 if (0 < nPrec && nPrec < nFmtPrec) {
                     nWidth += nFmtPrec - nPrec;
                 }

                 //
                 // Pare down the precision if the width is big enough to yield
                 // IEEE 754 64-bit double precision errors, which appears to be
                 // anything over 14 significant digits.
                 //
                 if (trim && nPrec > 0 && nWidth > nPrec) {
                     //
                     // Fix for Watson 1211481.  If the given precision is less
                     // than what the locale's format dictates then widen the given
                     // width.
                    //
                     if (nPrec <= sFormat.length - 1 - nDot) {
                         nWidth += sFormat.length - 1 - nDot - nPrec;
                     }
                     for (var i = nWidth - 1; i > this.MAX_DBL_WIDTH; i--) {
                         //
                         // Never pare down the precision below what the locale's
                         // format dictates.
                         //
                         if (nPrec <= sFormat.length - 1 - nDot)
                            break;
                         nPrec--;
                     }
                 }
             }
             //Watson 1483675 - If the locale's format contains
             // a dollar sign or a space then widen accordingly.
             if (style == this.CURRENCY_FMT) {
                 if (sFormat.indexOf('$')!=-1) {
                     nWidth++;
                 }

                 if (sFormat.indexOf(' ')!=-1) {
                     nWidth += 1;
                }
             }

             //
             // If percent style was wanted Then truncate after the percent character.
             //
             if (style == this.PERCENT_FMT) {
                 var nTrim = this._skipOver(sFormat,"89zZ", nDot + 1);
                 sFormat = this._replaceAll(sFormat,"",nTrim,0)
                 //sFormat.Replace(jfString::EmptyString(), nDot + 1, nTrim);

                 //Watson 1483675 - If the locale's format contains
                 // a percent sign then widen accordingly.
                 if (sFormat.indexOf('%')!=-1) {
                     nWidth++;
                 }
             }
             //
             // Else if integral style was wanted Then truncate at the radix character.
             //
             //
             // If integral style was wanted Then truncate at the radix character.
             //
             else if (style == this.INTEGRAL_FMT || nPrec == 0){// && option.formatOption == "WITHOUT_RADIX") {
                 var nTrim = this._skipOver(sFormat,"89zZ", nDot + 1);
                 sFormat = this._replaceAll(sFormat,"",nDot,nTrim+1);
             }
             //
             // Otherwise for decimal and currency styles Do
             // replace fractional 'z' pictures with '8's to requested precision,
             //
             else if (option.formatOption == "WITH_EIGHTS") {
                 var nEight = nDot + 1;
                 while ((nEight =sFormat.indexOf('z'))!=-1) {
                     this._replaceAll(sFormat, '8', nEight,'8'.length);
                 }
                 while (sFormat.Length() - nDot <= nPrec) {
                     sFormat = this._replaceAll(sFormat, "8", nDot + 1, 0);
                 }
             }
             //
             // Or replace fractional '9' pictures with 'z's to requested precision
             // Watson 1322850 - add option to keep nines, previously this function
             // would force frac. digits to be either z's or 8's with no option for 9's.
             //
             else if ((option.formatOption) == "WITH_ZEDS" && !((option.formatOption) == "KEEP_NINES")) {
                 var nNine = nDot + 1;
                 while ((nNine = sFormat.indexOf('9'))!=-1) {
                     this._replaceAll(sFormat, 'z', nNine,1);
                 }
                 while (sFormat.Length() - nDot <= nPrec) {
                     this._replaceAll(sFormat, "z", nDot + 1, 0);
                 }
             }
             //
             // Replicate section from separator to radix to requested width.
             //
             if (!sZZZ) {
                 sZZZ = "z";
             }
            else if ((option.formatOption) == "WITHOUT_GROUPINGS" ) {
                 //
                 // Watson 1230768.  Handle locales, like India, that have
                 // pictures with more than one grouping symbol.
                 //
                 var nComma = nZed + 1 ;
                 this._replaceAll(sFormat, 'z' ,nComma,1);
                 while ( nComma!= -1 && (nComma < nDot)) {
                     nComma = sFormat.indexOf(',');
                     sFormat = this._replaceAll(sFormat,'z',nComma,1);
                 }
             }
             else if ((option.formatOption == "WITH_GROUPINGS")) {
                 sZZZ = this._replaceAll(sZZZ,',',0,1);
                 nWidth += (nWidth + sZZZ.length) / sZZZ.length;
             }
             while (sFormat.length < nWidth) {
                 sFormat = this._replaceAll(sFormat, sZZZ, nZed + 1, 0);
             }
             return sFormat;
         },

         /**
          * Get the decimal precision of the given numeric string.
          * @return the decimal precision or 0 for integral values.
          */
         getNumberPrecision: function(sVal)
         {
             var nRadix = 0;
             var i = -1;
             // Reason for not using the commented line. We are always storing the value in model with . as decimal separator
             // Passing field locale/ browser locale would lead to precision width being zero for non-english locales where
             // decimal separater may be different.
             // var rIndex = xfalib.ut.PictureUtils.getLocaleObject(this.jsonModel.locale,"numberSymbols").decimal;
             // so hardcoding . for now
             var rIndex = ".";
             if( (nRadix = sVal.indexOf(rIndex))!=-1)
             {
                     for(; nRadix <=sVal.length ;nRadix++) {
                         i++;
                     }

                 return i;
             }
             return 0;
          }
    })
})(_,xfalib);
/**
 * @package xfalib.ut.FormattingVisitorBase
 * @import xfalib.ut.VisitorBase
 * @fileOverview Base class for visitor
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String]}
 */

(function(_,xfalib) {
    var FormattingVisitorBase = xfalib.ut.FormattingVisitorBase = xfalib.ut.VisitorBase.extend({

        initialize: function() {
            this._buffer = []; //TODO: ASK Ren where does this _buffer comes from
            FormattingVisitorBase._super.initialize.call(this);
        },

        consumeStringWildCard : function(token){
            //'?' '*' '+
            this._buffer.push(" ");
        },

        consumeStringLiteral : function(token){
            this._buffer.push(this.jsonModel._sPicture.substr(token.startPos+1,token.len-2));
        },

        consumeCharLiteral : function(token){
            this._buffer.push(""+ this.jsonModel._sPicture.charAt(token.startPos));
        }
    })

})(_,xfalib);
/**
 * @package xfalib.ut.ParsingVisitorBase
 * @import xfalib.ut.VisitorBase
 * @fileOverview Base class for visitor
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String,_dataString: String}}
 */

(function(_,xfalib){
    var ParsingVisitorBase = xfalib.ut.ParsingVisitorBase = xfalib.ut.VisitorBase.extend({

        initialize: function() {
            this._strLen = this.jsonModel._dataString.length;
            this._strPos = 0;
            ParsingVisitorBase._super.initialize.call(this);
        },

        consumeStringWildCard : function(token){
            if (chr == '?') {
                if (this._strPos < this._strLen)//&& Character.isDefined(str.charAt(strPos))
                    this._strPos += 1;
            } else if (chr == '+') {
                if (this._strPos >= this._strLen)// || ! Character.isWhitespace(str.charAt(strPos)))
                    throw "Mismatch";
                this._strPos += 1;
                while (this._strPos < this._strLen)// && Character.isWhitespace(str.charAt(strPos)))
                    this._strPos += 1;
            } else if (chr == '*') {
                while (this._strPos < this._strLen)// && Character.isWhitespace(str.charAt(strPos)))
                    this._strPos += 1;
            }

        },

        consumeStringLiteral : function(token){
            for(var offset=0; offset<token.len-2 ;offset++){ //-2, heading and trailing quote
                if(this.jsonModel._sPicture.charAt(token.startPos+offset+1) != this.jsonModel._dataString.charAt(this._strPos+offset)){
                    throw ("Mismatch" + this.jsonModel._sPicture.substr(token.startPos, token.len));
                }
            }
            this._strPos += token.len-2;

        },

        consumeCharLiteral : function(token){
            if(this.jsonModel._sPicture.charAt(token.startPos) == this.jsonModel._dataString.charAt(this._strPos)){
                this._strPos += 1;
            }else{
                throw "Mismatch";
            }
        }
    })
})(_,xfalib);

/**
 * @package xfalib.ut.DateFormattingVisitor
 * @import xfalib.ut.FormattingVisitorBase
 * @fileOverview The file provides formating logic on date pattern characters.
 * @version 0.0.1
 */


/**
 * @constructor
 * @param object {jsonModel: {_sPicture:String,_dateInfo: xfalib.ut.DateInfo}}
 */

(function(_,xfalib) {
    var PictureUtils =  xfalib.ut.PictureUtils;
    var DateFormattingVisitor = xfalib.ut.DateFormattingVisitor = xfalib.ut.FormattingVisitorBase.extend({

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;

            switch (chr) {
                case 'D':
                    var dayOfMonth=this.jsonModel._dateInfo.date.getDate();
                    switch(chrCnt){
                        case 1:
                            break;
                        case 2:
                            dayOfMonth = PictureUtils.padding(dayOfMonth,2);
                            break;
                    }
                    this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,dayOfMonth));
                    break;
                case 'J':

                    //this._mDayOfYear;
                    break;
                case 'M':
                    var monthOfYear = this.jsonModel._dateInfo.date.getMonth();
                    switch(chrCnt){
                        case 1:
                            this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,monthOfYear+1));
                            break;
                        case 2:
                            this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,PictureUtils.padding(monthOfYear+1,2)));
                            break;
                        case 3:
                            var monthNames = PictureUtils.getLocaleObject(this.jsonModel._locale,"calendarSymbols.abbrmonthNames");
                            this._buffer.push(monthNames[monthOfYear]);
                            break;
                        case 4:
                            var monthNames = PictureUtils.getLocaleObject(this.jsonModel._locale,"calendarSymbols.monthNames");
                            this._buffer.push(monthNames[monthOfYear]);
                            break;
                    }

                    break;
                case 'E':
                    var dayOfWeek = this.jsonModel._dateInfo.date.getDay();
                    var dayNames;
                    switch(chrCnt) {
                        case 1:
                            this._buffer.push(dayOfWeek);
                            break;
                        case 3:
                            dayNames =  PictureUtils.getLocaleObject(this.jsonModel._locale,"calendarSymbols.abbrdayNames");
                            this._buffer.push(dayNames[dayOfWeek]);
                            break;
                        case 4:
                            dayNames =   PictureUtils.getLocaleObject(this.jsonModel._locale,"calendarSymbols.dayNames");
                            this._buffer.push(dayNames[dayOfWeek]);
                            break;
                        default:
                            throw "unsupported Picture Clause ";
                    }
                    break;
                case 'e':
                    break;
                case 'G':
                    break;
                case 'Y':

                    var yearOfEra = this.jsonModel._dateInfo.date.getFullYear()
                    switch(chrCnt){
                        case 2:
                            if(yearOfEra>2029 || yearOfEra < 1930){
                                throw "unsupported " + yearOfEra + " by pattern YY";
                            }
                            yearOfEra = PictureUtils.padding(yearOfEra % 100, 2);
                            break;
                        case 4:
                            yearOfEra = PictureUtils.padding(yearOfEra, 4); // 2 digit(0000-9999)
                            break;
                    }
                    this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,yearOfEra));
                    break;
                case 'w':
                    break;
                case 'W':
                    break;
                default: throw "Unsupported pattern";
            }

        },
        /**
         *
         * @override
         */
        getResult : function(){
            return this._buffer.join("");
        }

    });
})(_,xfalib);


/**
 * @package xfalib.ut.TextFormattingVisitor
 * @import xfalib.ut.FormattingVisitorBase
 * @fileOverview Formats a string according to Text Picture.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object { jsonModel:{_sPicture: String, _text: String}}
 */
(function(_,xfalib){
    var TextFormattingVisitor = xfalib.ut.TextFormattingVisitor = xfalib.ut.FormattingVisitorBase.extend({

        initialize: function() {
            this._textPos = 0;
            this._relaxed = typeof this.jsonModel.relaxed === "undefined" ? true: this.jsonModel.relaxed;
            TextFormattingVisitor._super.initialize.call(this);
        },

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;
            for(var index = 0; index < chrCnt && (!this._relaxed || this._textPos < this.jsonModel._text.length); index++){
                switch (chr) {
                    case '9': // Numeric
                        var cUni = this.jsonModel._text.charAt(this._textPos++);
                        if(!xfalib.ut.PictureUtils.isDigit(cUni)){
                            throw "TextFormatting: not a digit as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'A': // Alphebetic
                        var cUni = this.jsonModel._text.charAt(this._textPos++);
                        if(!xfalib.ut.PictureUtils.isLetter(cUni)){
                            throw "TextFormatting: not a character as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'O': // Alphanumeric
                    case '0':
                        var cUni = this.jsonModel._text.charAt(this._textPos++);
                        // cUni === "" is a hack for LC-6152
                        // To prevent extra loop[one more time than the length of the string] for which cUni was ""
                        // which was neither a letter nor a digit
                        // so we were getting textformatting error
                        //which caused email id validation to fail for chars less than picture clause
                        if(!(cUni ==="" || xfalib.ut.PictureUtils.isLetter(cUni) || xfalib.ut.PictureUtils.isDigit(cUni))){
                            throw "TextFormatting: not a character or digit as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'X':
                        var cUni = this.jsonModel._text.charAt(this._textPos++);
                        this._buffer.push(cUni);
                        break;
                    case 't':
                        this._buffer.push("\t");
                        break;
                    default: this._buffer.push(chr);
                }
            }

        },

        /**
         *
         * @override
         */
        getResult : function(){
            if(this._textPos < this.jsonModel._text.length)
                throw "TextFormatting: picture clause smaller than input Text";
            return this._buffer.join("");
        },

        /**
         *
         * @override
         */
        acceptPatternChar : function(chr){
            return xfalib.ut.PictureUtils.inString(chr, "9AO0Xt");
        },

        consumeCharLiteral : function(token){
         this._buffer.push(""+ this.jsonModel._sPicture.charAt(token.startPos));
         // LC-3869 : forward the text pointer after literal is present and matched with the picture.
         if(this.jsonModel._sPicture.charAt(token.startPos) == this.jsonModel._text.charAt(token.startPos))
             this._textPos++;
        }
    })

})(_,xfalib);


/**
 * @package xfalib.ut.TextFormattingVisitor
 * @import xfalib.ut.FormattingVisitorBase
 * @fileOverview The file provides formating logic on date pattern characters.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param object {jsonModel: {_sPicture:String,_timeInfo: xfalib.ut.TimeInfo}}
 */

(function(_,xfalib){
    var TimeFormattingVisitor = xfalib.ut.TimeFormattingVisitor=  xfalib.ut.FormattingVisitorBase.extend({

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;

            switch (chr) {
                case 'H':
                case 'K':
                    var hourOfDay = this.jsonModel._timeInfo.mHourOfDay;
                    if(chr=='K'){
                        hourOfDay += 1;
                    }
                    switch(chrCnt){
                        case 1:
                            this._buffer.push(hourOfDay);
                            break;
                        case 2:
                            this._buffer.push(xfalib.ut.PictureUtils.padding(hourOfDay,2));
                            break;
                    }
                    break;

                case 'M':
                    var minuteOfHour = this.jsonModel._timeInfo.mMinuteOfHour;
                    switch(chrCnt){
                        case 1:
                            this._buffer.push(minuteOfHour);
                            break;
                        case 2:
                            this._buffer.push(xfalib.ut.PictureUtils.padding(minuteOfHour,2));
                            break;
                    }

                    break;
                case 'S':
                    var secondOfMinute = this.jsonModel._timeInfo.mSecondOfMinute;
                    switch(chrCnt){
                        case 1:
                            this._buffer.push(secondOfMinute);
                            break;
                        case 2:
                            this._buffer.push(xfalib.ut.PictureUtils.padding(secondOfMinute,2));
                            break;
                    }
                    break;
                case 'F':
                    var Milliseconds =this.jsonModel._timeInfo.mThousandthOfSecond;
                    this._buffer.push(xfalib.ut.PictureUtils.padding(Milliseconds,3));
                    break;

                default: throw "Unsupported pattern";
            };

        },

        /**
         *
         * @override
         */
        getResult : function(){
            return this._buffer.join("");
        }

    });

})(_,xfalib);


/**
 * @package xfalib.ut.NumFormattingVisitor
 * @import xfalib.ut.FormattingVisitorBase
 * @fileOverview Formats a string according to Text Picture.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object { jsonModel:{_sPicture: String}, text: String}
 */

(function(_,xfalib){
    var PictureUtils =  xfalib.ut.PictureUtils;
    var NumFormattingVisitor = xfalib.ut.NumFormattingVisitor = xfalib.ut.FormattingVisitorBase.extend({

        initialize: function(options) {
            NumFormattingVisitor._super.initialize.call(this);
            this._textPos = 0;

            //boolean value used for internal state track
            this._mbDigitAddedToOutput = false; // at least one digit has been added to output
            this._mbSignAddedToOutput = false;
            this._nScannedPatternDigit = 0; //how many digit(98Zz) characters scanned in pattern, reset to 0 after '.Vv'
            this._mbRadixSeen = false;

            this._pictureDesc = new xfalib.ut.NumPictureDesc({jsonModel:{_sPicture:this.jsonModel._sPicture}});
            this.jsonModel._sPicture= this._pictureDesc.getPicture();
            this._numberInfo = this._pictureDesc.parseNumberInfo(options.text);

            this._mbNegative = this._numberInfo.isNegative;
            this._msText = this._numberInfo.msText;
            this._leadingPadding = this._numberInfo.padding;
            //
            this._mNumberSymbols = xfalib.ut.PictureUtils.getLocaleObject(this.jsonModel._locale,"numberSymbols");
            this._mCurrencySymbols = xfalib.ut.PictureUtils.getLocaleObject(this.jsonModel._locale,"currencySymbols");
        },

        _checkAndAddDecimalPoint: function(fw) {
            if(this._mAddRadix) {
                this._buffer.push(this._fmtStr(this._mNumberSymbols.decimal, fw));
                this._mAddRadix = false;
            }
        },

        consumeSubPattern : function(token){
            var chr = token.patChar,
                chrCnt = token.len;
            switch (chr) {
                case '9':
                case '8':
                case 'Z': // Digit or space if zero.
                case 'z':// Digit or nothing if zero.
                    if(!this._mbSignAddedToOutput)
                        this._ensureSignIsAdded();
                    while (chrCnt-- > 0 ) {
                        if(!this._mbRadixSeen){
                            if(this._leadingPadding > this._nScannedPatternDigit++){
                                var placeHolder = null;
                                if(this._mbDigitAddedToOutput){
                                    placeHolder = this._mNumberSymbols.zero;
                                }else{
                                    if(chr == '9' || chr =='8') {
                                        placeHolder = this._mNumberSymbols.zero;
                                        this._mbDigitAddedToOutput = true;
                                    }else if(chr == 'Z'){
                                        placeHolder = " ";
                                    }
                                }
                                if(placeHolder){
                                    this._buffer.push(this._matchChr(placeHolder));
                                }
                            }else {
                                var cValue = this._msText.charAt(this._textPos++);
                                this._ensureCharIsDigit(cValue);
                                this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,cValue));
                                this._mbDigitAddedToOutput = true;
                            }
                        }else{  //handling fractional part
                            if(this._nScannedPatternDigit++  < this._numberInfo.fractionDigit ){
                                var cValue = this._msText.charAt(this._textPos++);
                                this._ensureCharIsDigit(cValue);
                                this._checkAndAddDecimalPoint();
                                this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,cValue));
                                this._mbDigitAddedToOutput = true;
                            }else{
                                if(chr == '9'|| chr =='Z') {
                                    this._checkAndAddDecimalPoint();
                                    this._buffer.push(this._matchChr(this._mNumberSymbols.zero));
                                } else if(chr == '8') {
                                    var cValue = this._msText.charAt(this._textPos++);
                                    if(cValue != '' && this._ensureCharIsDigit(cValue)) {
                                        this._checkAndAddDecimalPoint();
                                        this._buffer.push(PictureUtils.convertNumberToLocale(this.jsonModel._locale,cValue));
                                        this._mbDigitAddedToOutput = true;
                                    }
                                }
                            }
                        }

                    }

                    break;
                case 'E': // Exponent.
                    this._buffer.push('E');
                    this._buffer.push("" + this._numberInfo.shift);
                    break;
                case 'C': // CR symbol if negative and spaces if positive.
                    this._buffer.push((this._mbNegative) ? xfalib.ut.NumPictureDesc.gsCR : xfalib.ut.NumPictureDesc.gsDSP);
                    break;
                case 'c': // CR symbol if negative and nothing if positive.
                    if (this._mbNegative){
                        this._buffer.push(xfalib.ut.NumPictureDesc.gsCR);
                    }
                    break;
                case 'D': // DB symbol if negative and spaces if positive.
                    this._buffer.push((this._mbNegative) ? xfalib.ut.NumPictureDesc.gsDB : xfalib.ut.NumPictureDesc.gsDSP);
                    break;
                case 'd': // DB symbol if negative and nothing if positive.
                    if (this._mbNegative){
                        this._buffer.push(xfalib.ut.NumPictureDesc.gsDB);
                    }
                    break;
                case 'S': // Minus sign if negative and a space if positive.
                case 's':
                    if (this._mbNegative){
                        this._buffer.push(this._fmtStr(	this._mNumberSymbols.minus));
                    }else{
                        if('S' == chr){
                            this._buffer.push(this._matchChr(' '));
                        }
                    }
                    break;
                case 'V': // Implied decimal sign if parsing.
                case '.':
                case 'v': // Implied decimal sign.
                    if (this._textPos < this._msText.length && this._msText.charAt(this._textPos) == '.'){
                        this._textPos++; //consume a '.'
                    }
                    if (chr == 'V' || chr == '.'){
                        this._mAddRadix = true;
                        //this._buffer.push(this._fmtStr(this._mNumberSymbols.decimal, ));
                    }
                    this._mbRadixSeen = true;
                    this._nScannedPatternDigit = 0;
                    break;

                case 0xFF0C: // Fullwidth ','.
                case ',': // Grouping separator.
                    while (chrCnt-- > 0) {
                        if (this._mbDigitAddedToOutput){
                            this._buffer.push(this._fmtStr(	this._mNumberSymbols.grouping ));
                        }
                        this._mbCommaSeen = true;
                    }
                    break;
                case 0xFF04: // Fullwidth '$'.
                case '$': // Currency name or symbol.
                    while (chrCnt-- > 0) {
                        this._buffer.push(this._fmtStr(	this._mCurrencySymbols.symbol ));
                    }
                    break;
                case 0xFF05: // Fullwidth '%'.
                case '%': // Percent symbol.
                    while (chrCnt-- > 0) {
                        this._buffer.push(this._fmtStr(	this._mNumberSymbols.percent));
                    }
                    break;
                case 0xFF08: // Fullwidth '('.
                case 0xFF09: // Fullwidth ')'.
                case '(': // Left parenthesis.
                case ')': // Right parenthesis.
                    this._buffer.push(this._matchChr((this._mbNegative) ? chr : ' '));
                    break;
                default:
            }
        },

        _ensureCharIsDigit : function(cValue){
            if ('0' > cValue || cValue > '9'){
                throw "Nuberic Formatting: not a digit as expected " + cValue;
            }
        },


        _fmtStr : function(str){
            return str;
        },

        _matchStr : function(str){
            return str;
        },

        _matchChr : function(str){
            return str;
        },

        _ensureSignIsAdded : function(){
            if (this._mbNegative && ! this._mbDigitAddedToOutput && ! this._pictureDesc.hasSign) {
                this._buffer.push(this._mNumberSymbols.minus);
                this._mbSignAddedToOutput = true;
            }
        },

        /**
         *
         * @override
         */
        getResult : function(){
            return this._buffer.join("");
        },

        /**
         *
         * @override
         */
        acceptPatternChar : function(chr){
            return xfalib.ut.PictureUtils.inString(chr, "(%$,.)89BCDERSVZbcdrsvzt");
        }

    });

})(_,xfalib);


/**
 * @package xfalib.ut.TimeParsingVisitor
 * @import xfalib.ut.ParsingVisitorBase
 * @fileOverview The file provides parsing/formating logic on date pattern characters.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String, _dataString: String]}
 */

(function(_,xfalib){
    var TimeParsingVisitor = xfalib.ut.TimeParsingVisitor = xfalib.ut.ParsingVisitorBase.extend({

        initialize: function() {
            this._timeInfo = new xfalib.ut.TimeInfo();
            TimeParsingVisitor._super.initialize.call(this);
        },

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;
            var curPos = this._strPos;
            var scannedChar = chrCnt;
            this._assert(curPos+chrCnt <=this.jsonModel._dataString.length, "Mismatch");

            switch (chr) {
                case 'h':
                    if(this._timeInfo.mHourOfMeriDiem != -1 || this._timeInfo.mHourOfDay != -1){
                        throw "ambiguity time string";
                    }
                    var hourOfMeriDiem=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(1-12)
                            hourOfMeriDiem = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            hourOfMeriDiem = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(1-12)
                            break;
                    }

                    this._timeInfo.mHourOfMeriDiem = hourOfMeriDiem -1;
                    this._assert(this._timeInfo.mHourOfMeriDiem>=0 && this._timeInfo.mHourOfMeriDiem<=11, "Invalid Hour Of MeriDiem value.");
                    break;

                case 'k':
                    if(this._timeInfo.mHourOfMeriDiem != -1 || this._timeInfo.mHourOfDay != -1){
                        throw "ambiguity time string";
                    }
                    var hourOfMeriDiem=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-11)
                            hourOfMeriDiem = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            hourOfMeriDiem = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-11)
                            break;
                    }

                    this._timeInfo.mHourOfMeriDiem = hourOfMeriDiem;
                    this._assert(this._timeInfo.mHourOfMeriDiem>=0 && this._timeInfo.mHourOfMeriDiem<=11, "Invalid hour of meriDiem value.");
                    break;

                case 'H':
                    if(this._timeInfo.mHourOfMeriDiem != -1 || this._timeInfo.mHourOfDay != -1){
                        throw "ambiguity time string";
                    }
                    var hourOfDay=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-23)
                            hourOfDay = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            hourOfDay = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-23)
                            break;
                    }

                    this._timeInfo.mHourOfDay = hourOfDay;
                    this._assert(this._timeInfo.mHourOfDay>=0 && this._timeInfo.mHourOfDay<=23, "Invalid hour of day value.");
                    break;

                case 'K':
                    if(this._timeInfo.mHourOfMeriDiem != -1 || this._timeInfo.mHourOfDay != -1){
                        throw "ambiguity time string";
                    }
                    var hourOfDay=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-23)
                            hourOfDay = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            hourOfDay = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-23)
                            break;
                    }

                    this._timeInfo.mHourOfDay = hourOfDay - 1;
                    this._assert(this._timeInfo.mHourOfDay>=0 && this._timeInfo.mHourOfDay<=23, "Invalid hour of day value.");
                    break;
                case 'M':
                    if(this._timeInfo.mMinuteOfHour != -1){
                        throw "ambiguity time string";
                    }
                    var minuteOfHour=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-59)
                            minuteOfHour = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            minuteOfHour = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-59)
                            break;
                    }

                    this._timeInfo.mMinuteOfHour = minuteOfHour;
                    this._assert(this._timeInfo.mMinuteOfHour>=0 && this._timeInfo.mMinuteOfHour<=59, "Invalid minute of hour.");
                    break;
                case 'S':
                    if(this._timeInfo.mSecondOfMinute != -1){
                        throw "ambiguity time string";
                    }
                    var secondOfMinute=-1;
                    switch(chrCnt){
                        case 1:
                            var parsed = this.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-59)
                            secondOfMinute = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            secondOfMinute = this.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(0-59)
                            break;
                    }

                    this._timeInfo.mSecondOfMinute = secondOfMinute;
                    this._assert(this._timeInfo.mSecondOfMinute>=0 && this._timeInfo.mSecondOfMinute<=59, "Invalid second of minute.");
                    break;
                case 'F':

                    this._assert(chrCnt==3, "Invalid pattern F.");
                    thousandthOfSecond = this.parseIntExact(this.jsonModel._dataString, curPos, 3);

                    this._timeInfo.mThousandthOfSecond = thousandthOfSecond;
                    this._assert(this._timeInfo.mThousandthOfSecond>=0 && this._timeInfo.mThousandthOfSecond<=999, "Invalid thousand of second.");
                    break;

                default: throw "Unsupported pattern";
            }

            this._strPos += scannedChar;
        },

        parseIntAggressive : xfalib.ut.PictureUtils.parseIntAggressive,

        parseIntExact : xfalib.ut.PictureUtils.parseIntExact,

        getResult : function(){
            return this._timeInfo.getISOTime();
        },

        getTimeInfo : function(){
            return this._timeInfo;
        },

        _assert : function(condition, message){
            if(!condition){
                throw message;
            }
        }
    });
})(_,xfalib);



/**
 * @package xfalib.ut.TextParsingVisitor
 * @import xfalib.ut.ParsingVisitorBase
 *
 * @fileOverview Parses a string according to Text Picture.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String, _dataString: String]}
 */
(function(_,xfalib){
    var TextParsingVisitor = xfalib.ut.TextParsingVisitor = xfalib.ut.ParsingVisitorBase.extend({

        initialize: function() {
            TextParsingVisitor._super.initialize.call(this);
            this._buffer = [];
        },

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;
            for(var index = 0; index < chrCnt; index++){
                switch (chr) {
                    case '9': // Numeric
                        var cUni = this.jsonModel._dataString.charAt(this._strPos++);
                        if(!xfalib.ut.PictureUtils.isDigit(cUni)){
                            throw "TextParsing: not a digit as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'A': // Alphebetic
                        var cUni = this.jsonModel._dataString.charAt(this._strPos++);
                        if(!xfalib.ut.PictureUtils.isLetter(cUni)){
                            throw "TextParsing: not a character as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'O': // Alphanumeric
                    case '0':
                        var cUni = this.jsonModel._dataString.charAt(this._strPos++);
                        if(!xfalib.ut.PictureUtils.isLetterOrDigit(cUni)){
                            throw "TextParsing: not a character or digit as expected";
                        }
                        this._buffer.push(cUni);
                        break;
                    case 'X':
                        var cUni = this.jsonModel._dataString.charAt(this._strPos++);
                        this._buffer.push(cUni);
                        break;
                    case 't':
                        if(this.jsonModel._dataString.charAt(this._strPos++)=="\t"){
                            this._buffer.push("\t");
                        }else{
                            throw "TextParsing: not a Tab as expected";
                        }
                        break;
                    default:
                        if(this.jsonModel._dataString.charAt(this._strPos++)== chr){
                            this._buffer.push(chr);
                        }else{
                            throw "TextParsing: not '" + chr+"' as expected";
                        }
                }
            }

        },
        /**
         *
         * @override
         */
        getResult : function(){
            if(this._strPos < this.jsonModel._dataString.length)
                throw "TextParsing: picture clause smaller than input Text";
            return this._buffer.join("");
        },
        /**
         *
         * @override
         */
        acceptPatternChar : function(chr){
            return xfalib.ut.PictureUtils.inString(chr, "9AO0Xt");
        }

    });
})(_,xfalib);


/**
 * @package xfalib.ut.NumParsingVisitor
 * @import xfalib.ut.ParsingVisitorBase
 * @fileOverview Parses a string according to Text Picture.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String,_dataString: String}}
 */

(function(_,xfalib){
    var NumParsingVisitor = xfalib.ut.NumParsingVisitor = xfalib.ut.ParsingVisitorBase.extend({

        initialize: function(options) {
            this._pictureDesc = new xfalib.ut.NumPictureDesc({jsonModel:{_sPicture:this.jsonModel._sPicture}});
            this.jsonModel._sPicture = this._pictureDesc.getPicture();
            this._buffer = [];
            this._strPos = 0;
            this._hasRadix = false;
            this._mbNegative = false;
            this._mbDigitSeen = false; // at least one digit has been added to output
            this._mbSignSeen = false;
            this._mBacktrack = null;
            this._hasPercent = false;
            this._mbExponSeen = false;

            this._mNumberSymbols = xfalib.ut.PictureUtils.getLocaleObject(this.options._locale,"numberSymbols");
            this._mCurrencySymbols = xfalib.ut.PictureUtils.getLocaleObject(this.options._locale,"currencySymbols");
        },

        _lookupNext : xfalib.ut.Scanner.lookupNext,

        parse : function(){
            var patPos = 0;
            while(true){
                try{
                    for(var token = this._lookupNext(this.jsonModel._sPicture, patPos, this.acceptPatternChar); token != null;  ){
                        this.consume(token);
                        patPos = patPos + token.len;
                        token = this._lookupNext(this.jsonModel._sPicture, patPos, this.acceptPatternChar);
                    }
                }catch(e){
                    //mismatch, try again!
                    if(this._mBacktrack){
                        patPos = this._mBacktrack.patPos;
                        this._buffer.length = 0;
                        this._strPos = this._mBacktrack.strPos;
                        this._mbDigitSeen = false;
                        this._mBacktrack = null;
                        continue;
                    }
                }
                break;
            }
        },
        consumeSubPattern : function(token){

            var chr = token.patChar;
            var chrCnt = token.len;
            var fw = false;
            switch (chr) {
                case '9':
                case '8':
                case 'Z': // Digit or space if zero.
                case 'z':// Digit or nothing if zero.
                    while (chrCnt-- > 0 ) {
                        if(!this._mbDigitSeen){
                            var cUni = this.jsonModel._dataString.charAt(this._strPos);
                            if(cUni == '-'){
                                this._mbNegative = true;
                                cUni = this.jsonModel._dataString.charAt(++this._strPos);
                            }
                            if(chr== '9' || chr == '8'){
                                if(!xfalib.ut.PictureUtils.isDigit(cUni)){
                                    throw "TextParsing: not a digit as expected";
                                }
                                this._buffer.push(cUni);
                                this._mbDigitSeen =true;
                            }else if(chr =='Z'){
                                if(xfalib.ut.PictureUtils.isDigit(cUni)){
                                    this._buffer.push(cUni);
                                    this._mbDigitSeen =true;
                                }else if(cUni != ' '){
                                    throw "TextParsing: not a digit or space as expected";
                                }
                            }else {
                                // has to be 'z', eagerly try to match a digit, if a mismatch is latterly found, backtrack
                                if(xfalib.ut.PictureUtils.isDigit(cUni)){
                                    this._buffer.push(cUni);
                                    this._mbDigitSeen =true;
                                    this._mBacktrack = {
                                        "patPos" : token.patPos + token.len - chrCnt, //new position from next char after 'z'
                                        "strPos" : this._strPos
                                    };
                                }else {
                                    throw "TextParsing: not a digit or space as expected";
                                }
                            }
                            ++this._strPos;
                        }else{
                            var cUni = this.jsonModel._dataString.charAt(this._strPos);
                            if(xfalib.ut.PictureUtils.isDigit(cUni)){
                                this._buffer.push(cUni);
                                ++this._strPos;
                            }else{
                                if(chr !='z'){
                                    throw "TextParsing: not a digit as expected";
                                }else{
                                    ++this._strPos;
                                }
                            }
                        }
                    }

                    break;
                case 'V' :
                case 'v' :
                case '.' :
                    if(this._matchStr(this._mNumberSymbols.decimal)){
                        this._hasRadix = true;
                        this._buffer.push('.');
                        this._mbDigitSeen =true;
                    }else{
                        throw "TextParsing: not a radix as expected";
                    }
                    break;
                case 'E': // Exponent.
                    if(this._matchStr('E')){
                        this._buffer.push('E');
                        if(this._matchStr('+')){
                            //
                        }else if(this._matchStr('-')){
                            this.jsonModel._buffer.push('-');
                        }
                        var strLen = this.jsonModel._dataString.length;
                        while(this._strPos < strLen &&
                            xfalib.ut.PictureUtils.isDigit(this.jsonModel._dataString.charAt(this._strPos))){
                            this._buffer.push(this.jsonModel._dataString.charAt(this._strPos++));
                        }
                    }
                    break;

                case 'C': // CR symbol if negative and spaces if positive.
                    if(this._matchStr(xfalib.ut.NumPictureDesc.gsCR)){
                        this._mbNegative = true;
                    }else if(!this._matchStr(xfalib.ut.NumPictureDesc.gsDSP)){
                        throw "TextParsing: not a CR as expected";
                    }
                    break;
                case 'c': // CR symbol if negative and nothing if positive.
                    if(this._matchStr(xfalib.ut.NumPictureDesc.gsCR)){
                        this._mbNegative = true;
                    }
                    break;
                case 'D': // DB symbol if negative and spaces if positive.
                    if(this._matchStr(xfalib.ut.NumPictureDesc.gsDB)){
                        this._mbNegative = true;
                    }else if(!this._matchStr(xfalib.ut.NumPictureDesc.gsDSP)){
                        throw "TextParsing: not a CR as expected";
                    }
                    break;
                case 'd': // DB symbol if negative and nothing if positive.
                    if(this._matchStr(xfalib.ut.NumPictureDesc.gsDB)){
                        this._mbNegative = true;
                    }
                    break;
                case 'S': // Minus sign if negative and a space if positive.
                    if(this._matchStr(this._mNumberSymbols.negative,fw)){
                        this._mbNegative = true;
                    }else if(!this._matchStr(" ")){
                        throw "TextParsing: not a CR as expected";
                    }
                    break;
                case 's':
                    if(this._matchStr(this._mNumberSymbols.negative,fw)){
                        this._mbNegative = true;
                    }
                    break;
                case 0xFF0C: // Fullwidth ','.
                case ',': // Grouping separator.
                    while (chrCnt-- > 0) {
                        if(!this._matchStr(this._mNumberSymbols.grouping, fw)){
                            throw "TextParsing: not a grouping symbol as expected";
                        }
                    }
                    break;
                case 0xFF04: // Fullwidth '$'.
                case '$': // Currency name or symbol.
                    while (chrCnt-- > 0) {
                        if(!this._matchStr(this._mCurrencySymbols.symbol, fw)){
                            throw "TextParsing: not a grouping symbol as expected";
                        }
                    }
                    break;
                case 0xFF05: // Fullwidth '%'.
                case '%': // Percent symbol.
                    while (chrCnt-- > 0) {
                        if(!this._matchStr(this._mNumberSymbols.percent, fw)){
                            throw "TextParsing: not a grouping symbol as expected";
                        }
                    }
                    this._hasPercent = true;
                    break;
                case 0xFF08: // Fullwidth '('.
                case 0xFF09: // Fullwidth ')'.
                case '(': // Left parenthesis.
                case ')': // Right parenthesis.
                    if(this._matchStr(chr,fw)){
                        this._mbNegative = true;
                    }else if(!this._matchStr(" ")){
                        throw "TextParsing: not parentesis as expected";
                    }
                    break;
                case 't': // tab.
                    while (chrCnt-- > 0) this._matchStr('\t',fw);
            }
        },
        getResult : function(){
            var stringNum =  this._buffer.join("");
            if(this._hasPercent) {
                var buf = new Array();
                stringNum = Number(stringNum).toString();
                var dot = stringNum.indexOf('.');

                var pos = dot-2;
                if(pos ==0) buf.push("0");
                else if(pos ==-1) buf.push("0.0");
                else if(pos ==-3) pos = stringNum.length - 2;
                for(var index=0;index < stringNum.length; index++){
                    if(index == pos){
                        buf.push(".");
                    }
                    if(index != dot){
                        buf.push(stringNum.charAt(index));
                    }
                }
                stringNum = buf.join("");
            }
            var number = Number(stringNum);
            if(this._mbNegative) number = -number;
            return number.toString();
        },

        _matchStr : function(target){
            if(xfalib.ut.PictureUtils.matchString(this.jsonModel._dataString, this._strPos, target)){
                this._strPos+= target.length;
                return true;
            }else{
                return false;
            }
        },

        /**
         *
         * @override
         */
        acceptPatternChar : function(chr){
            return xfalib.ut.PictureUtils.inString(chr, "(%$,.)89BCDERSVZbcdrsvzt");
        }
    });
})(_,xfalib);
/**
 * @package xfalib.ut.DateParsingVisitor
 * @import xfalib.ut.ParsingVisitorBase
 * @fileOverview The file provides parsing/formating logic on date pattern characters.
 * @version 0.0.1
 */

/**
 * @constructor
 * @param Object {jsonModel: {_sPicture: String, _dataString: String]}
 */

(function(_,xfalib) {
    var DateParsingVisitor = xfalib.ut.DateParsingVisitor = xfalib.ut.ParsingVisitorBase.extend({

        initialize: function() {
            this._dateInfo = new xfalib.ut.DateInfo({isParsingCall : true});
            this._dayOfMonth = this._monthOfYear = this._yearOfEra = null; // used to validate date once all sub patterns are consumed
            DateParsingVisitor._super.initialize.call(this);
        },

        consumeSubPattern : function(token){
            var chr = token.patChar;
            var chrCnt = token.len;
            var curPos = this._strPos;
            var scannedChar = chrCnt;

            //TODO: need to remove this assert.
            this._assert(curPos+chrCnt <=this.jsonModel._dataString.length, "Mismatch");

            switch (chr) {
                case 'D':
                    switch(chrCnt){
                        case 1:
                            var parsed = xfalib.ut.PictureUtils.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(1-31)
                            this._dayOfMonth = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            this._dayOfMonth = xfalib.ut.PictureUtils.parseIntExact(this.jsonModel._dataString, curPos, 2); // 1-2 digit(1-31)
                            break;
                    }
                    this._assert(this._dayOfMonth <= 31 && this._dayOfMonth >0, "Invalid date string1");
                    break;
                case 'J':

                    //this._mDayOfYear;
                    break;
                case 'M':
                    var symbol = "";
                    switch(chrCnt){
                        case 1:
                            var parsed = xfalib.ut.PictureUtils.parseIntAggressive(this.jsonModel._dataString, curPos, 2); // 1-2 digit(1-12)
                            this._monthOfYear = parsed.value;
                            scannedChar = parsed.len;
                            break;
                        case 2:
                            this._monthOfYear = xfalib.ut.PictureUtils.parseIntExact(this.jsonModel._dataString, curPos, 2); // 2 digit(01-12)
                            break;
                        case 3:
                            symbol = "calendarSymbols.abbrmonthNames";
                            break;
                        case 4:
                            symbol = "calendarSymbols.monthNames"
                            break;

                    }
                    if(symbol) {
                        var hashObj = xfalib.ut.PictureUtils.getHashOfLocaleObject(this.jsonModel._locale,symbol),
                            str = this.jsonModel._dataString.toLowerCase(),
                            hash = 0,
                            curStr = ""
                        scannedChar = 0;
                        while(curPos+scannedChar < str.length) {
                            hash += (scannedChar+1)*str.charCodeAt(curPos+scannedChar)
                            curStr+= str.charAt(curPos+scannedChar);
                            scannedChar++;
                            if(hashObj[hash] && hashObj[hash].indexOf(curStr) > -1 ) break;
                        }
                        var monthNames = _.map(xfalib.ut.PictureUtils.getLocaleObject(this.jsonModel._locale, symbol), function (str) {
                            return str.toLowerCase();
                        });
                        this._monthOfYear = monthNames.indexOf(curStr) + 1; // months are from 1 to 12
                    }
                    //TODO: remove this assert
                    this._assert(this._monthOfYear <= 12 && this._monthOfYear >0, "Invalid date string2");
                    break;
                case 'E':
                    var symbol = ""
                    switch(chrCnt) {
                        case 1:
                            scannedChar = 1;
                            break;
                        case 3:
                            symbol = "calendarSymbols.abbrdayNames";
                            break;
                        case 4:
                            symbol = "calendarSymbols.dayNames"
                            break;
                        default:
                            throw "unsupported Picture Clause ";
                    }
                    if(symbol) {
                        var hashObj = xfalib.ut.PictureUtils.getHashOfLocaleObject(this.jsonModel._locale,symbol);
                        scannedChar = 0;
                        var str = this.jsonModel._dataString.toLowerCase();
                        var hash = 0;
                        var curStr = "";
                        while(curPos+scannedChar < str.length) {
                            hash += (scannedChar+1)*str.charCodeAt(curPos+scannedChar)
                            curStr+= str.charAt(curPos+scannedChar);
                            scannedChar++;
                            if(hashObj[hash] && hashObj[hash].indexOf(curStr) > -1) break;
                        }
                    }
                    break;

                case 'e':
                    break;
                case 'G':
                    break;
                case 'Y':

                    switch(chrCnt){
                        case 2:
                            this._yearOfEra = xfalib.ut.PictureUtils.parseIntExact(this.jsonModel._dataString, curPos, 2); // 2 digit(00-99)
                            this._yearOfEra+=2000;
                            if(this._yearOfEra >= 2029){
                                this._yearOfEra -=100;
                            }
                            break;
                        case 4:
                            this._yearOfEra = xfalib.ut.PictureUtils.parseIntExact(this.jsonModel._dataString, curPos, 4); // 2 digit(0000-9999)
                            break;
                    }

                    this._assert(this._yearOfEra < 9999 && this._yearOfEra >=0, "Invalid date string3");
                    break;
                case 'w':
                    break;
                case 'W':
                    break;
                default: throw "Unsupported pattern";
            }

            if(this._yearOfEra && this._monthOfYear && this._dayOfMonth){
                this._dateInfo.validate(this._yearOfEra, this._monthOfYear, this._dayOfMonth);
            }

            this._strPos += scannedChar;
        },

        getDate : function(){
            return this._dateInfo.date;
        },

        getResult: function(){
            if (this._strPos < this.jsonModel._dataString.length) {
                throw "DateParsing: picture clause smaller than input Date";
            }
            return this._dateInfo.getISODate();
        },

        _assert : function(condition, message){
            if(!condition){
                throw message;
            }
        }
    });
})(_,xfalib);

/*************************************************************************
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



(function(_, $, xfalib){

    var LocalizationUtil = xfalib.ut.LocalizationUtil = xfalib.ut.Class.extend({

        getLocalizedMessage: function(category, message, snippets){
            var resolvedMessage = message;
            if(snippets){
                //resolve message with snippet
                resolvedMessage = resolvedMessage.replace(/{(\d+)}/g, function(match, number) {
                    return typeof snippets[number] != 'undefined'
                        ? snippets[number]
                        : match
                        ;
                });
            }
            var text = "";
            if (category) {
                text += " [" + category + "]";
            }
            text += "  " + resolvedMessage + "\r\n" ;
            return text;
        }

    });
})(_, $, xfalib);

