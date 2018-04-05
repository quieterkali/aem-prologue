/**
 * @package guidelib.model.DataNode
 * @version 0.0.1
 */

(function ($, _, guideBridge, guidelib, formBridge, xfalib) {
    var getOrElse = xfalib.ut.XfaUtil.prototype.getOrElse;

    var LiveJsonUtils = guidelib.model.LiveJsonUtils = guidelib.model.LiveDataUtils.extend({

        initialize : function () {
            LiveJsonUtils._super.initialize.call(this);
            this._liveDataDoc = null;
        },

        initLiveData : function (prefillDataStr) {
            LiveJsonUtils._super.initLiveData.apply(this, arguments);
            prefillDataStr = prefillDataStr || getOrElse(guidelib.runtime, "guideContext.guidePrefillJson", null);

            if (_.isString(prefillDataStr)) {
                var prefillDataDoc = JSON.parse(prefillDataStr);

                if (this._isNonNaked(prefillDataDoc)) {
                    // non naked json, assuming full hierarchy afdata/afbounddata/data
                    this._liveDataDoc = prefillDataDoc;
                    this._boundDataRoot = this._getElement(this._liveDataDoc.afData, this.constants.BOUND_DATA_XPATH);
                    this._unboundDataRoot = this._getElement(this._liveDataDoc.afData, this.constants.UNBOUND_DATA_XPATH);

                } else {
                    // naked json start from prefill data root
                    this._boundDataRoot = prefillDataDoc;
                    this._unboundDataRoot = JSON.parse(this.constants.UNBOUND_JSON_SKELETON)[this.constants.UNBOUND_TAG];  // need this for unbound data fill across lazy
                    this._liveDataDoc = prefillDataDoc;
                }
            } else {
                // init default skeleton for no prefill cases
                this._liveDataDoc = JSON.parse(this.constants.SKELETON_JSON);
                this._boundDataRoot = this._getElement(this._liveDataDoc.afData, this.constants.BOUND_DATA_XPATH);
                this._unboundDataRoot = this._getElement(this._liveDataDoc.afData, this.constants.UNBOUND_DATA_XPATH);
            }
        },

        /*
         * This API gets the element w.r.t to the node.
         * Eg - path is a/b/c, then it converts the path to a.b.c and then searches for c.
         */
        _getElement : function (node, path, options) {
            if (!(node instanceof Object)) {
                return null;
            }

            if (_.isEmpty(path) || !_.isString(path)) {
                return node;
            }
            options = options || {};
            var index = options.index;
            var convertedPath = path.split('/').join('.');
            if (!(_.isUndefined(index) || _.isNull(index))) {
                convertedPath = convertedPath + "." + index;
            }
            return getOrElse(node, convertedPath, null);
        },

        /**
         * This function checks if the data contains naked or non naked json
         * @returns {boolean}
         * @private
         * @memberof LiveJsonUtils
         * @param prefillData
         */
        _isNonNaked : function (prefillData) {
            prefillData = prefillData || this.getLiveDataDoc();
            if (prefillData) {
                return prefillData.hasOwnProperty("afData");
            } else {
                return false;
            }
        },

        isLiveDataInitialized : function () {
            return (this.getLiveDataDoc() instanceof Object);
        },

        getLiveDataStr : function () {
            if (this.isLiveDataInitialized()) {
                return JSON.stringify(this.getLiveDataDoc());
            } else {
                return '';
            }
        },

        /*
         * This API will remove the spaces,"\" from the path.
         * It will return an array after splitting the path.
         * Eg - for a/0/b/c, it will return ["a/0","b","c"]
         */
        _sanitizedXpathParts : function (path) {
            var pathParts = (path || '').replace(/^\//, '').replace(/\s+/g, '');
            pathParts = this._splitForIndex(pathParts);

            return _.filter(pathParts, function (xpathPart) {
                return this._getNameAndIndex(xpathPart) !== null;
            }, this);
        },

        _splitForIndex : function (path) {
            var pathArray = [];
            var pathParts = path.split('/');
            for (var i = 0; i < pathParts.length; i++) {
                var str = pathParts[i];
                if ((i + 1) < pathParts.length && !isNaN(pathParts[i + 1]) && !_.isEmpty(pathParts[i + 1])) {
                    str = str + "/" + pathParts[i + 1];
                    i = i + 1;
                }
                pathArray.push(str);
            }
            return pathArray;
        },

        /**
         * Returns the index associated with the pathPart.
         * Eg - if pathPart is 'a/1', then it returns {name : a, index : 1}
         * @param pathPart
         * @returns {*}
         * @private
         */
        _getNameAndIndex : function (pathPart) {
            if (pathPart) {
                var elName = pathPart.match(/^([^\s\/]+)(?:\/(\d+))?$/);  // match the whole string
                if (elName !== null) {
                    return {
                        name : elName[1],
                        index : elName[2] ? parseInt(elName[2]) : -1
                        // -1 index for depicting non repeatable element
                    };
                }
            }
            return null;
        },

        _cmpXpathParts : function (indexedName, templateName) {
            if (indexedName && templateName) {
                var match1 = this._getNameAndIndex(indexedName),
                    match2 = this._getNameAndIndex(templateName);
                return !_.isEmpty(match1 && match2)
                    && match1.name === match2.name
                    && (match2.index === -1 || match1.index === match2.index);
            }
            return false;
        },

        /**
         * This function gets or creates the node if its not there. The node can be any valid JSON Value
         * null, string, object, array, number, boolean.
         * @param schemaPath
         * @param dataSection
         * @param createMissingNodes
         * @param lastNodeValue
         * @returns {*}
         */
        getContextNode : function (schemaPath, dataSection, createMissingNodes, lastNodeValue) {
            var contextNode,
                baseContextNode,
                basePath = "",
                pathParts = this._sanitizedXpathParts(schemaPath);
            if (dataSection == this.constants.BOUND_TAG) {
                baseContextNode = this._boundDataRoot;
                if (this._isNonNaked(this._liveDataDoc)) {
                    basePath = "afData/" + this.constants.BOUND_DATA_XPATH + "/";
                }
            } else if (dataSection === this.constants.UNBOUND_TAG) {
                baseContextNode = this._unboundDataRoot;
                if (this._isNonNaked(this._liveDataDoc)) {
                    basePath = "afData/" + this.constants.UNBOUND_DATA_XPATH + "/";
                }
            }
            if (!_.isEmpty(pathParts)) {
                var path = (basePath + pathParts.join('/'));

                // return baseContextNode for naked json. path can be "" only for naked json.
                if (path == "" && !this._isNonNaked(this._liveDataDoc)) {
                    return baseContextNode;
                }

                contextNode = this._getElement(this._liveDataDoc, path);
                if (!contextNode && createMissingNodes) {
                    contextNode = this._createElements(baseContextNode, pathParts, lastNodeValue);
                }
            } else {
                contextNode = baseContextNode;
            }
            return contextNode;
        },

        /**
         * This function creates the node at the path.
         *
         * @param contextNode
         * @param pathParts
         * @returns {*}
         * @private
         * @param lastNodeValue
         */
        _createElements : function (contextNode, pathParts, lastNodeValue) {
            if (!(contextNode instanceof Object)) {
                return null;
            }

            if (_.isEmpty(pathParts)) {
                return contextNode;
            }

            // recurse and create one level of tags at a time
            contextNode = this._createRepeatedElements(contextNode, pathParts, lastNodeValue);
            return contextNode;
        },

        // it will always return the parent node after checking the last token
        _createRepeatedElements : function (contextNode, pathParts, lastNodeValue) {
            var childContextNode = contextNode,
                xpathPart = this._getNameAndIndex(pathParts[0]),
                elemName = xpathPart.name,
                index = xpathPart.index || 0,
                i,
                isLastToken = (pathParts.length == 1),
                elementNode = contextNode[elemName];
            // -1 signifies non repeating element
            if (index === -1) {
                if (elementNode == null) {
                    childContextNode = this._createChildElement(contextNode, elemName, isLastToken, lastNodeValue);
                } else {
                    childContextNode = elementNode;
                }
                // if its the last token, then stop recursion here and return the created node
                if (isLastToken) {
                    return childContextNode;
                }
            } else {
                if (elementNode != null) {
                    var numOfChildren = elementNode.length;
                    if (numOfChildren < index + 1) {
                        // create immediate 'extra' children
                        for (i = numOfChildren; i < index + 1; ++i) {
                            childContextNode = {};
                            contextNode[elemName].push(childContextNode);
                        }
                    } else {
                        childContextNode = elementNode[index];
                    }
                } else {
                    contextNode[elemName] = [];
                    for (i = 0; i < index + 1; ++i) {
                        childContextNode = {};
                        contextNode[elemName].push(childContextNode);
                    }
                }
            }
            // recursively create descendants
            return this._createElements(childContextNode, pathParts.slice(1), lastNodeValue);
        },

        _createChildElement : function (parentElement, elemName, isLastToken, nodeValue) {
            if (parentElement instanceof Object) {
                if (isLastToken) {
                    parentElement[elemName] = nodeValue;
                } else {
                    parentElement[elemName] = {};
                }
                return parentElement[elemName];
            }
        },

        isIndexedPath : function (xpath) {
            return (xpath || "").match(this.constants.INDEXED_XPATH_PAT_JSON) !== null;
        },

        /**
         * This function sets the value of the field in the live data document.
         * @param xpath
         * @param xmlSection
         * @private
         * @param createMissingNodes
         * @param value
         */
        setDataValue : function (xpath, xmlSection, createMissingNodes, value) {
            var lastSlash = xpath.lastIndexOf("/"),
                parentPath = xpath.substring(0, lastSlash),
                name = xpath.substring(lastSlash + 1),
                parent = this.getContextNode(parentPath, xmlSection, createMissingNodes, {});
            if (parent instanceof Object) {
                parent[name] = value;
            }
        },

        /**
         * This function sets the value in the model from the live data document.
         * @param node
         * @param field
         * @private
         */
        getDataValue : function (xpath, xmlSection) {
            var lastSlash = xpath.lastIndexOf("/"),
                parentPath = xpath.substring(0, lastSlash),
                name = xpath.substring(lastSlash + 1),
                parent = this.getContextNode(parentPath, xmlSection, false);
            if (parent instanceof Object) {
                return parent[name] === undefined ? null : parent[name];
            }
            return null;
        },

        addIndexToPath : function (path, index) {
            if (path.match(/\/\d+$/) === null) { // only add repeat index if it doesn't already end in one
                path += '/' + (index);
            } else {
                this.logger().debug("AF", "Tried to add index to already indexed JSON path :" + path);
            }
            return path;
        },

        hasChildNodes : function (node) {
            return !_.isEmpty(node);
        },

        removeChild : function (parentNode, targetNodeName, index) {
            parentNode[targetNodeName].splice(index, 1);
        },

        insertNode : function (parentNode, childNodeName, index) {
            if (parentNode[childNodeName] == null) {
                parentNode[childNodeName] = [];
            }
            for (var i = 0; i < index; i++) {
                if (parentNode[childNodeName][i] == null) {
                    parentNode[childNodeName][i] = {};
                }
            }
            parentNode[childNodeName].splice(index, 0, {});
            return parentNode[childNodeName][index];
        },

        getDataInstances : function (dataContext, dataNodeName) {
            return this.getContextNode(dataContext.indexedXpath, dataContext.xmlSec);
        },

        _convertModelIndexToDataIndex : function (index) {
            if (index < 0) {
                return 0;
            }
            return index;
        },

        getParentRef : function (path) {
            return path.replace(/\/[^\/]+(?:\/\d+)?$/, "");
        }

    });

}($, _, window.guideBridge, window.guidelib, window.formBridge, window.xfalib));
