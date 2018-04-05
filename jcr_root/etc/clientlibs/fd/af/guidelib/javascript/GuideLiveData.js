/**
 * @package guidelib.model.DataNode
 * @version 0.0.1
 */

(function ($, _, guideBridge, guidelib, formBridge, xfalib) {

    var LiveDataUtils = guidelib.model.LiveDataUtils = xfalib.ut.Class.extend({

        constants : {
            SKELETON_XML : '<afData><afUnboundData><data/></afUnboundData><afBoundData><data xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/"/></afBoundData></afData>',
            SKELETON_JSON : '{"afData":{"afUnboundData":{"data":{}},"afBoundData":{"data":{}}}}',
            UNBOUND_SKELETON : '<unBound></unBound>',
            UNBOUND_JSON_SKELETON : '{"afUnboundData":{}}',
            INDEXED_XPATH_PAT : new RegExp(/\/[^\/]+\[\d+\]/),
            INDEXED_XPATH_PAT_JSON : new RegExp(/\/[^\/]+\/\d+/),
            XFA_DATA_NODE_ATTR_NAME : "xfa:dataNode",
            XFA_DATA_NODE_ATTR_VALUE : "dataGroup",
            UNKNOWN_XSD_ROOT_ELEMENT : "?",
            AF_ROOT_TAG : "afData",
            BOUND_TAG : "afBoundData",
            UNBOUND_TAG : "afUnboundData",
            XFA_TAG : "xfa",
            DATA_TAG : "data",
            BOUND_DATA_XPATH : "afBoundData/data",
            UNBOUND_DATA_XPATH : "afUnboundData/data",
            AF_DRAFT_TAG : "afSubmissionInfo/afDraft"
        },

        initialize : function () {
            LiveDataUtils._super.initialize.call(this);
            this._boundDataRoot = null;
            this._unboundDataRoot = null;
            this._xfaDataRoot = null;
        },

        dropXfaXml : function () {
            this._xfaDataRoot = null;
        },

        // only called from test framework
        destroy : function () {
            this._liveDataDoc = null;
            this._boundDataRoot = null;
            this._unboundDataRoot = null;
            this._xfaDataRoot = null;
        },

        initLiveData : function (prefillDataStr, xfaPrefillDataStr) {
        },

        isLiveDataInitialized : function () {
        },

        getLiveDataStr : function () {
        },

        getLiveDataDoc : function () {
            return this._liveDataDoc;
        },

        _isNonNaked : function () {
        },

        _getNameAndIndex : function (xpathPart) {
        },

        isIndexedPath : function (xpath) {
        },

        _createElements : function (contextNode, xpathParts) {
        },

        _createRepeatedElements : function (contextNode, xpathParts) {
        },

        _createChildElement : function (parentElement, elemName) {
        },

        _createAttributeNode : function (parentElement, attrName) {
        },

        getContextNode : function (schemaPath, dataSection, createMissingNodes, lastNodeValue) {
        },

        addIndexToPath : function (path, index) {
        },

        _getElement : function (node, xpath, options) {},

        hasChildNodes : function (node) {
        },

        /**
         * Removes a child node from its parent
         * @param parentNode {Node} Parent Node from which to remove the child node
         * @param targetNode {String} Node name of the child to remove
         * @param index Index of the child node to remove
         */
        removeChild : function (parentNode, targetNodeName, index) {
        },

        insertNode : function (parentNode, childNodeName, index) {
        },

        _getDataContext : function (model, bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            var bindRef = model.bindRef,
                xmlSec,
                indexedXpath;

            if (model._isXfaNode()) {
                xmlSec = guidelib.internal.liveDataUtils.constants.XFA_TAG;
                indexedXpath = xfalib.ut.XMLUtils.dataSom2xpath(model.dataSom);
            } else if (_.isEmpty(bindRef)) {
                xmlSec = guidelib.internal.liveDataUtils.constants.UNBOUND_TAG;
                indexedXpath = unBound_indexedXpathSoFar + '/' + model.getAttribute("name").replace(/\s+/g, '');
                // use attr 'name' here, as schema might have an elem called 'name'
            } else {
                xmlSec = guidelib.internal.liveDataUtils.constants.BOUND_TAG;

                var xpathMatch = guidelib.internal.liveDataUtils.getMatchingXpathHierarchy(bound_indexedXpathSoFar, bindRef);
                if (xpathMatch.isCrossHierarchy) {
                    indexedXpath = bindRef;
                } else {
                    indexedXpath = bound_indexedXpathSoFar;
                    if (!_.isEmpty(xpathMatch.suffixParts)) {
                        indexedXpath += '/' + xpathMatch.suffixParts.join('/');
                    }
                }
            }

            return {
                'xmlSec' : xmlSec,
                'indexedXpath' : indexedXpath
            };
        },

        /**
         * return true if both xpath parts have same element name and indices
         * absence of index in the templateName is ignored
         * @param indexedName
         * @param templateName
         * @returns {boolean}
         * @private
         * @memberof LiveDataUtils
         */
        _cmpXpathParts : function (indexedName, templateName) {
          },

        /**
         * get a partition of the matching xpath part hierarchy
         * the matching parts have same element names and agreeable indices
         * @param parentXpath
         * @param currentXpath
         * @returns {{prefixParts: Array, suffixParts: (*|Array.<T>|list), isCrossHierarchy: boolean}}
         * @memberof LiveDataUtils
         */
        getMatchingXpathHierarchy : function (parentXpath, currentXpath) {
            var isCrossHierarchy = false,
                prefixParts = [],
                suffixParts = this._sanitizedXpathParts(currentXpath);

            _.find(this._sanitizedXpathParts(parentXpath), function (parentPart) {
                if (this._cmpXpathParts(parentPart, suffixParts[0])) {
                    prefixParts.push(parentPart);
                    suffixParts.shift();
                } else {
                    isCrossHierarchy = true;
                    return true;
                }
            }, this);

            return {
                'prefixParts' : prefixParts,
                'suffixParts' : suffixParts,
                'isCrossHierarchy' : isCrossHierarchy
            };
        },

        _getXpathContext : function (targetPanel) {
            var boundXpath = '',
                unBoundXpath = '',
                ancestors = [],
                panel = targetPanel.parent;

            while (panel instanceof guidelib.model.GuidePanel) {
                if (panel._preserveLazyValue()) {
                    ancestors.unshift(panel);
                }
                panel = panel.parent;
            }

            _.each(ancestors, function (ancestor) {
                var xmlContext = ancestor._syncModelAndData(boundXpath, unBoundXpath);
                boundXpath = xmlContext.bound;
                unBoundXpath = xmlContext.unBound;
            });

            return {
                'bound' : boundXpath,
                'unBound' : unBoundXpath
            };
        },

        _applyOnLiveData : function (action, targetPanel) {
            if (_.isString(targetPanel)) {
                targetPanel = guideBridge.resolveNode(targetPanel);
            }

            if (targetPanel instanceof guidelib.model.GuidePanel) {
                var indexedXpathsFromRoot = guidelib.internal.liveDataUtils._getXpathContext(targetPanel);
                targetPanel[action](indexedXpathsFromRoot.bound, indexedXpathsFromRoot.unBound);
            } else {
                guideBridge._guide.rootPanel[action]('', '');
            }
        },

        /**
         * will capture the currently loaded model hierarchy in a xml doc to be referred to later by lazily loaded panels
         * @private
         * @memberof LiveDataUtils
         */
        updateLiveData : function (targetPanel) {
            this._applyOnLiveData('_updateLiveData', targetPanel);
        },

        /**
         * will replay the model hierarchy from the live xml, for the supplied panel
         * @param targetPanel
         * @private
         * @memberof LiveDataUtils
         */
        playLiveData : function (targetPanel) {
            this._applyOnLiveData('_playLiveData', targetPanel);
        },

        /**
         * Converts the xml info of the draft part to map and returns
         * @param xmlString
         * @private
         * @memberof LiveDataUtils
         */
        convertSubmissionInfoToMap : function (xmlString) {
        },

        addDataNodeInfo : function (contextNode) {
        },

        /**
         * Set the value of the node referred by xpath in the bounded/unbounded
         * section as specified by section. This optionally creates the data nodes
         * if they are not present
         * @param xpath
         * @param section
         * @param createMissingNodes
         * @param value
         */
        setDataValue : function (xpath, section, createMissingNodes, value) {
        },

        /**
         * Returns the value of the node referred by xpath in the bounded/unbounded
         * section as specified by section. It returns undefined if the node doesn't
         * exist
         * @param xpath
         * @param section
         */
        getDataValue : function (xpath, section) {
        },

        _convertModelIndexToDataIndex : function (index) {
        },

        getParentRef : function (path) {
        },

        /**
         * returns the parent data node for the context specified by dataNodeContext
         * @param dataNodeContext {object} containing xpath and section
         * @param createIfMissing
         * @returns {*}
         * @param parentNodeValue
         */
        getParentDataNode : function (dataNodeContext, createIfMissing, parentNodeValue) {
            var parentRef = this.getParentRef(dataNodeContext.indexedXpath),
                parentNode;
            if (_.isEmpty(parentRef)) {
                parentNode = this.getContextNode("", dataNodeContext.xmlSec, false);
            } else {
                parentNode = this.getContextNode(parentRef, dataNodeContext.xmlSec, createIfMissing, parentNodeValue);
            }
            return parentNode;
        }

    });

}($, _, window.guideBridge, window.guidelib, window.formBridge, window.xfalib));
