/**
 * @package guidelib.model.DataNode
 * @version 0.0.1
 */

(function ($, _, guideBridge, guidelib, formBridge, xfalib) {
    var isXdp, isXsd, isNone;

    var LiveXmlUtils = guidelib.model.LiveXmlUtils = guidelib.model.LiveDataUtils.extend({

        initialize : function () {
            LiveXmlUtils._super.initialize.call(this);

            if (_.isUndefined(document.evaluate)) {
                wgxpath.install();
            }
            this._liveDataDoc = null;
        },

        initLiveData : function (prefillXmlStr, xfaPrefillXmlStr, isXdp, isXsd, xsdRootElement) {
            LiveXmlUtils._super.initLiveData.apply(this, arguments);
            isXdp = isXdp || false;
            isXsd = isXsd || false;
            isNone = !(isXdp || isXsd);
            this.xsdRootElement = xsdRootElement;
            // init default skeleton for no pefill cases
            this._liveDataDoc = $.parseXML(this.constants.SKELETON_XML);
            this._boundDataRoot = this._getElement(this._liveDataDoc.documentElement, this.constants.BOUND_DATA_XPATH);
            this._unboundDataRoot = this._getElement(this._liveDataDoc.documentElement, this.constants.UNBOUND_DATA_XPATH);

            if (_.isString(prefillXmlStr)) {
                var prefillXmlDoc = $.parseXML(prefillXmlStr);

                // find data root
                if (this._isNonNaked(prefillXmlDoc)) {
                    // non naked xml, assuming full hierarchy afdata/afbounddata/data

                    var prefillBoundDataRoot,
                        prefillUnBoundDataRoot,
                        newDataNode;

                    if (!isXdp) { //capture bound data from prefill, for both none(may contain bound form/frag) and xsd
                        prefillBoundDataRoot = this._getElement(prefillXmlDoc.documentElement, this.constants.BOUND_DATA_XPATH);
                        if (null == prefillBoundDataRoot) {
                            prefillBoundDataRoot = this._getElement(prefillXmlDoc.documentElement, this.constants.BOUND_TAG +
                                                                        "/" + guideBridge._guide.jsonModel.xsdRootElement);
                        }
                        if (prefillBoundDataRoot) {
                            newDataNode = this._liveDataDoc.importNode(prefillBoundDataRoot, true);
                            this._boundDataRoot.parentNode.replaceChild(newDataNode, this._boundDataRoot);
                            this._boundDataRoot = newDataNode;
                        }
                    }

                    prefillUnBoundDataRoot = this._getElement(prefillXmlDoc.documentElement, this.constants.UNBOUND_DATA_XPATH);
                    if (prefillUnBoundDataRoot) {
                        newDataNode = this._liveDataDoc.importNode(prefillUnBoundDataRoot, true);
                        this._unboundDataRoot.parentNode.replaceChild(newDataNode, this._unboundDataRoot);
                        this._unboundDataRoot = newDataNode;
                    }

                } else {
                    // naked xml start from prefill data root

                    if (isNone) {
                        this._unboundDataRoot = prefillXmlDoc.documentElement;
                        this._boundDataRoot = null;
                    } else {
                        if (isXsd) {
                            this._boundDataRoot = prefillXmlDoc.documentElement;
                        }

                        var unBoundXmlDoc = $.parseXML(this.constants.UNBOUND_SKELETON);
                        this._unboundDataRoot = unBoundXmlDoc.documentElement;  // need this for unbound data fill across lazy
                    }
                    this._liveDataDoc = prefillXmlDoc;
                }
            }

            if (isXdp) { // don't need the bound data sec, model is always loaded & server will fill during submission
                if (_.isString(xfaPrefillXmlStr) && xfaPrefillXmlStr.length > 0) {
                    this._xfaDataRoot = xfalib.ut.XMLUtils.getXFARootFormElementFromXML($.parseXML(xfaPrefillXmlStr));
                }
                this._boundDataRoot.parentNode.parentNode.removeChild(this._boundDataRoot.parentNode);
                this._boundDataRoot = null;
            }
        },

        isLiveDataInitialized : function () {
            return (this.getLiveDataDoc() instanceof Node);
        },

        getLiveDataStr : function () {
            if (this.isLiveDataInitialized()) {
                return (new XMLSerializer()).serializeToString(this.getLiveDataDoc());
            } else {
                return '';
            }
        },

        _ignoreXpathRoot : function (xpathRoot) {
            return this.xsdRootElement === this.constants.UNKNOWN_XSD_ROOT_ELEMENT
                || this.xsdRootElement === xpathRoot;
        },

        /**
         * will return the apt node, in the AF xml, based on the xml context passed in.
         * Will create nodes if it doesn't exist and createMissingNodes is passed as true
         * @param schemaPath
         * @param dataSection
         * @param createMissingNodes
         * @returns {*}
         * @memberof LiveXmlUtils
         */
        getContextNode : function (schemaPath, dataSection, createMissingNodes) {
            var contextNode,
                baseContextNode,
                xpathParts = this._sanitizedXpathParts(schemaPath);
            if (dataSection === this.constants.BOUND_TAG) {
                baseContextNode = this._boundDataRoot;
            } else if (dataSection === this.constants.UNBOUND_TAG) {
                baseContextNode = this._unboundDataRoot;
            } else if (dataSection === this.constants.XFA_TAG) {
                baseContextNode = this._xfaDataRoot;
            }
            if (!_.isEmpty(xpathParts)) {
                if (dataSection === this.constants.BOUND_TAG) {
                    if (this._ignoreXpathRoot(xpathParts[0])) {
                        xpathParts = xpathParts.slice(1);   // discard xsd schema root
                        if (xpathParts.length === 0) {
                            return baseContextNode;
                        }
                    }
                }

                contextNode = this._getElement(baseContextNode, xpathParts.join('/'));

                if (!contextNode && createMissingNodes) {
                    contextNode = this._createElements(baseContextNode, xpathParts);
                }
            } else if (_.isEmpty(schemaPath)) {
                contextNode = baseContextNode;
            }
            return contextNode;
        },

        addIndexToPath : function (path, index) {
            if (path.match(/\[\d+\]$/) === null) { // only add repeat index if it doesn't already end in one
                path += '[' + (index + 1) + ']'; // indices in xpath 1 based}
            } else {
                this.logger().debug("AF", "Tried to add index to already indexed xpath :" + path);
            }
            return path;
        },

        getDataInstances : function (dataContext, dataNodeName) {
            var node = this.getContextNode(dataContext.indexedXpath, dataContext.xmlSec);
            if (node != null) {
                return _.filter(node.parentNode.childNodes, function (child) {
                    return (child instanceof Element) && child.nodeName === dataNodeName;
                }, this);
            }
            return null;
        },

        _findLastDataNode : function (parentContextNode, dataNodeName) {
            var xmlUtils = xfalib.ut.XMLUtils,
                iterator = xmlUtils.evaluateXPath(dataNodeName, parentContextNode, null, null, null),
                result = xmlUtils.iteratorToArray(iterator);
            if (result.length > 0) {
                return result[result.length - 1];
            }
            return null;
        },

        hasChildNodes : function (node) {
            return node.hasChildNodes();
        },

        removeChild : function (parentNode, targetNodeName, index) {
            var childNode = this._getElement(parentNode, targetNodeName + "[" + (index + 1) + "]", null);
            if (childNode) {
                parentNode.removeChild(childNode);
            }
        },

        insertNode : function (parentNode, childNodeName, index) {
            var childNode = this._getElement(parentNode, childNodeName + "[" + (index + 1) + "]", null),
                node = parentNode.ownerDocument.createElement(childNodeName);
            if (childNode) {
                parentNode.insertBefore(node, childNode);
            } else {
                var lastNode = this._findLastDataNode(parentNode, childNodeName);
                if (lastNode && lastNode.nextSibling) {
                    parentNode.insertBefore(node, lastNode.nextSibling);
                } else {
                    parentNode.appendChild(node);
                }
            }
            return node;
        },

        /**
         * Form an xpath part returns the index as well as the tagName.
         * Index returned is 0 if not present
         * @param xpathName
         * @returns {*}
         * @private
         * @memberof LiveXmlUtils
         */
        _getNameAndIndex : function (xpathPart) {
            if (xpathPart) {
                var elName = xpathPart.match(/^([^[\s\/]+)(?:\[(\d+)\])?$/);  // match the whole string
                if (elName !== null) {
                    return {
                        name : elName[1],
                        index : elName[2] ? parseInt(elName[2]) : 0
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
                    && (match2.index === 0 || match1.index === match2.index);
            }
            return false;
        },

        /**
         * Will split an xpath string into an array containing one xml element/node per part
         * This expects only the simple xpath syntax allowed in bindRefs of xsd bound fields
         * of the form /a/b/c/@d
         * @param xpath
         * @returns {*|Array.<T>|list}
         * @private
         * @memberof LiveXmlUtils
         */
        _sanitizedXpathParts : function (xpath) {
            var xpathParts = (xpath || '').replace(/^\//, '').replace(/\s+/g, '').split('/');

            if (_.last(xpathParts) === "text()") { // ignore "/text()" appended to bindRef for SimpleType schema element
                xpathParts.splice(-1, 1); // drop last element
            }

            return _.filter(xpathParts, function (xpathPart) {
                return this._getNameAndIndex(xpathPart) !== null;
            }, this);
        },

        /**
         * returns true if the xpath uses indices
         * @param xpath
         * @returns {boolean}
         * @memberof LiveXmlUtils
         */
        isIndexedPath : function (xpath) {
            return (xpath || "").match(this.constants.INDEXED_XPATH_PAT) !== null;
        },

        _createElements : function (contextNode, xpathParts) {
            if (!(contextNode instanceof Node)) {
                return null;
            }

            if (_.isEmpty(xpathParts)) {
                return contextNode;
            }

            if (xpathParts[0][0] === '@') { // xpath parts having '@' as 1st char must be and attr
                var attrName = xpathParts[0].slice(1);
                // in bindrefs attributes are the last xpath part, so no need to recurse
                contextNode = this._createAttributeNode(contextNode, attrName);
            } else {
                // recurse and create one level of tags at a time
                contextNode = this._createRepeatedElements(contextNode, xpathParts);
            }

            return contextNode;
        },

        /**
         * This will update the xml with the required tags,
         * and return the context node matching the xpath query.
         * Further if xml has lesser number of tags than the index in each part,
         * it'll fill those gaps with empty tags.
         * @param contextNode node beneath which tags are to be created
         * @param xpathParts
         * @returns {*}
         * @private
         * @memberof LiveXmlUtils
         */
        _createRepeatedElements : function (contextNode, xpathParts) {
            var childContextNode = contextNode,
                xpathPart = this._getNameAndIndex(xpathParts[0]),
                elemName = xpathPart.name,
                index = xpathPart.index || 1,
                i,
                children = _.filter(contextNode.childNodes, function (child) {
                    return (child instanceof Element) && child.nodeName === elemName;
                });

            if (children.length < index) {
                // create immediate 'extra' children
                for (i = children.length; i < index; ++i) {
                    childContextNode = this._createChildElement(contextNode, elemName);
                }
            } else {
                childContextNode = children[index - 1]; // indices are 1 based in xml
            }
            // recursively create descendants
            return this._createElements(childContextNode, xpathParts.slice(1));
        },

        _createChildElement : function (parentElement, elemName) {
            if (parentElement instanceof Element) {
                var childElem = parentElement.ownerDocument.createElement(elemName);
                parentElement.appendChild(childElem);
                return childElem;
            }
        },

        _createAttributeNode : function (parentElement, attrName) {
            if (parentElement instanceof Element) {
                var attrNode = parentElement.ownerDocument.createAttribute(attrName);
                parentElement.setAttributeNode(attrNode);
                return attrNode;
            }
        },

        /**
         * finds xml node/element based on current context node and xpath
         * @param node
         * @param xpath
         * @param options
         * @returns {*}
         * @private
         * @memberof LiveXmlUtils
         */
        _getElement : function (node, xpath, options) {
            if (!(node instanceof Node)) {
                return null;
            }

            if (_.isEmpty(xpath) || !_.isString(xpath)) {
                return node;
            }
            options = options || {};
            var nsResolver = options.nsResolver;
            var index = options.index;
            // in IE singleNodeValue maybe null for attribute queries,
            // so find parent element of attribute, and then explicitly check for attribute node's presence

            var xpathParts = xpath.split('/@'),
                checkAttr = false,
                attributeName;

            if (xpathParts.length > 2) { // more than 1 attr unsupported
                xfalib.ut.XfaUtil.prototype.getLogger().error("BindRefs must be Xpaths ending in atmost one attribute"); // TODO localize
                return null;
            } else if (xpathParts.length === 2) {
                xpath = xpathParts[0]; // find parent el and seek attribute there
                attributeName = xpathParts[1]; // attr can only be in the last part
                checkAttr = true;
            }
            if (!(_.isUndefined(index) || _.isNull(index))) {
                xpath = xpath + "[" + index + "]";
            }
            var result = xfalib.ut.XMLUtils.evaluateXPath(xpath, node, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null),
                el;

            if (result.resultType === XPathResult.FIRST_ORDERED_NODE_TYPE) {
                el = result.singleNodeValue;
                if (el instanceof Node) {
                    if (!checkAttr) {
                        return el;
                    } else if (el.hasAttribute(attributeName)) {
                        el = el.getAttributeNode(attributeName);
                        if (el instanceof Node) {
                            return el;
                        }
                    }
                }
            }
        },

        /**
         * This function checks if the document was naked or non naked xml
         * @param doc
         * @returns {boolean}
         * @private
         * @memberof LiveXmlUtils
         */
        _isNonNaked : function (doc) {
            doc = doc || this.getLiveDataDoc();
            if (doc) {
                return doc.documentElement.tagName === this.constants.AF_ROOT_TAG;
            } else {
                return false;
            }
        },

        /**
         * Converts the xml info of the draft part to map and returns
         * @param xmlString
         * @private
         * @memberof LiveXmlUtils
         */
        convertSubmissionInfoToMap : function (xmlString) {
            if (_.isUndefined(xmlString)) {
                return;
            }
            var livePrefillXmlDoc = $.parseXML(xmlString),
                draftDoc = this._getElement(livePrefillXmlDoc.documentElement, this.constants.AF_DRAFT_TAG),
                map = {};
            // if there was no information about lazy children in xml (fresh render with prefill)
            if (_.isUndefined(draftDoc) || draftDoc.childNodes.length === 0) {
                return;
            }
            _.each(draftDoc.firstChild.textContent.replace(/\"/g, "").split(","), function (templateId) {
                // mark dirty
                map[templateId] = 0;
            });
            return map;
        },

        setDataValue : function (xpath, xmlSection, createMissingNodes, value) {
            var node = this.getContextNode(xpath, xmlSection, createMissingNodes);
            if (node instanceof Node) {
                node.textContent = value;
            }
        },

        getDataValue : function (xpath, xmlSection) {
            var node = this.getContextNode(xpath, xmlSection, false);
            if (node instanceof Node) {
                return node.textContent || null;
            }
            return undefined;
        },

        _convertModelIndexToDataIndex : function (index) {
            if (index < 0) {
                return 1;
            }
            return index + 1;
        },

        getParentRef : function (path) {
            return path.substring(0, path.lastIndexOf("/"));
        }
    });

}($, _, window.guideBridge, window.guidelib, window.formBridge, window.xfalib));
