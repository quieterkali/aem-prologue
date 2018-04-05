/**
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2011 Adobe Systems Incorporated
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
 *
 */

/**
 * A helper class providing a set of form related utilities.
 * @static
 * @singleton
 * @class CQ.shared.Form
 */
CQ.shared.Form = function() {

    /**
     * Returns an associative array mapping ids to label nodes.
     * @private
     * @return {Object} For instance:
     *      {
     *          id1: labelNode1,
     *          id2: labelNode2,
     *          ...
     *      }
     */
    var getDocumentLabelMap = function() {
        var contentFrame = parent.frames["ContentFrame"],
        doc = contentFrame !== undefined ? contentFrame.contentDocument : document;

        var labelMap = new Object();
        var labelNodes = doc.getElementsByTagName("label");
        for (var i = 0; i < labelNodes.length; i++) {
            var forId = labelNodes[i].htmlFor;  // buggy IE can't handle getAttribute("for")
            if (forId) {
                labelMap[forId] = labelNodes[i];
            }
        }
        return labelMap;
    };

    /**
     * Given a <label> node (perhaps one containing <input> or <select> children), return the text
     * content (excluding any <input> or <select> content).
     * @private
     * @return {String} The text content of all non-<input> and non-<select> descendants.
     */
    var getLabelNodeTextContent = function(node) {
        var text = "";
        var walkTree = function(node) {
            if (node.nodeType == 3) { // text node
                text += node.nodeValue;
            }
            if (node.nodeName.toLowerCase() == "select"
                || node.nodeName.toLowerCase() == "input"
                || node.nodeName.toLowerCase() == "textarea"
                || node.nodeName.toLowerCase() == "button") {
                // don't walk into fields if they're children of the label
                return;
            }
            for (var i = 0; node.childNodes && i < node.childNodes.length; i++) {
                walkTree(node.childNodes[i]);
            }
        };
        walkTree(node);
        return text;
    };

    /**
     * Given an indexed id, return the id for the parent section (the id with the index stripped off).
     * @private
     */
    var getSectionIdForIndexedId = function(id) {
        return id.replace(/-\d+$/, "");
    };

    /**
     * <p>Return the label text (as a <code>String</code>) for a particular <code>id</code>.  When a label
     * can't be found, return the id itself as a fall-back.</p>
     * <p>Note: Public callers can ignore the <code>documentLabelMap</code> parameter (it's used internally
     * as a caching mechanism).</p>
     * @param {String} id The id which the target <code>&lt;label&gt;</code> refers to.
     * @return {String} The label text.
     */
    var getLabelForId = function(id, documentLabelMap) {
        if (!documentLabelMap) {
            documentLabelMap = getDocumentLabelMap();
        }

        if (documentLabelMap[id]) {
            return getLabelNodeTextContent(documentLabelMap[id]);
        }
        return null;
    };

    /**
     * Locate the default values for the given node. Supported nodes
     * include, <code>input</code>, <code>textarea</code>, <code>option</code>.
     *
     * @private
     * @param {HTMLElement} node The element which to locate the default value for.
     * @return {String} the default value for the given node.
     */
    var getDefaultValue = function(node) {
        var defaultValue;
        var nodeName = node.nodeName.toLowerCase();
        var nodeType = hasAttribute(node, "type") ? node.getAttribute("type") : undefined;

        if (nodeName == "input") {
            if (nodeType == "radio" || nodeType == "checkbox") {
                if (hasAttribute(node, "checked")) {
                    defaultValue = node.getAttribute("value");
                }
            } else if (node.type == "text") {
                defaultValue = node.defaultValue;
                // support elements like hidden, reset, submit
            } else {
                defaultValue = node.value;
            }
        } else if (nodeName == "textarea") {
            defaultValue = node.value;
        } else if (nodeName == "option" && hasAttribute(node, "selected")) {
            defaultValue = node.getAttribute("value");
        }

        return defaultValue;
    };

    /**
     * Helper function to get around IE7 not supporting hasAttribute.
     * @private
     * @param {HTMLElement} el the html element
     * @param {String} attr the attribute to test for.
     */
    var hasAttribute = function(el, attr) {
        if (el == null) {
            return false;
        }

        // IE8 issue with attributes being not null but empty string
        return ($CQ(el).attr(attr) != undefined);
    };

    return {

        /**
         * Searches an array for an object with a particular property of a particular value.
         * @return {Object} the first object which matches, or null if no objects match.
         */
        searchArray: function(arr, testProperty, testValue) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][testProperty] && arr[i][testProperty] == testValue) {
                    return arr[i];
                }
            }
            return null;
        },

        /**
         * <p>Return the label text for an <code>&lt;input&gt;</code> or <code>&lt;select&gt;</code>.  When a
         * label can't be found, the element's name attribute is used as a fall-back.</p>
         * <p>Note: Public callers can ignore the <code>documentLabelMap</code> parameter (it's used internally
         * as a caching mechanism).</p>
         * @param {HTMLElement} fieldNode The <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code> or
         * <code>&lt;textArea&gt;</code> node.
         * @return {String} The label text.
         */
        getLabelForField: function(fieldNode, documentLabelMap) {
            if (!documentLabelMap) {
                documentLabelMap = getDocumentLabelMap();
            }

            var id = fieldNode.getAttribute("id");
            if (id && documentLabelMap[id]) {
                return getLabelNodeTextContent(documentLabelMap[id]);
            }

            var parent = fieldNode.parentNode;
            while (parent) {
                if (parent.nodeName.toLowerCase() == "label") {
                    return getLabelNodeTextContent(parent);
                }
                parent = parent.parentNode;
            }

            // No label found; we'll have to live with the name:
            return fieldNode.getAttribute("name");
        },

        /**
         * Get a list of fields in the document.
         * @return {Array} Each object in the array represents a field.  Each field contains:
         * <div class="mdetail-params"><ul)
         *   <li><code>text</code> : String<div class="sub-desc">The label to display (usually the field's caption).</div></li>
         *   <li><code>value</code> : String<div class="sub-desc">The name of the field.</div></li>
         *   <li><code>enumeration</code> : Array|null<div class="sub-desc">For enumerated fields, a nested array of text/value pairs.</div></li>
         * </ul></div>
         */
        getFields: function() {
            var contentFrame = parent.frames["ContentFrame"],
                doc = contentFrame !== undefined ? contentFrame.contentDocument : document,
                documentLabelMap = getDocumentLabelMap();

            var fields = [];

            var visitNamedNode = function(node, inLocalNode, selector) {
                var name = node.getAttribute("name");
                var nodeType = node.nodeName.toLowerCase();
                var field;

                if (nodeType == "input" || nodeType == "textarea") {
                    var controlType = hasAttribute(node, "type") ? node.getAttribute("type").toLowerCase() : "text";
                    if (controlType == "button" || controlType == "submit" || controlType == "reset") {
                        return;
                    }

                    // Fetch (or create) the field record:
                    //
                    field = CQ.shared.Form.searchArray(fields, "value", name);
                    if (!field) {
                        fields.push({
                            "text": CQ.shared.Form.getLabelForField(node, documentLabelMap),
                            "value": name,      // for Selection.setOptions()
                            "name": name,       // for everyone else
                            "enumeration": undefined,
                            "local": inLocalNode,
                            "selector": selector,
                            "type": nodeType,
                            "defaultValue": getDefaultValue(node),
                            "node": node
                        });
                        field = fields[fields.length-1];
                    }

                    // See if we're an enumeration.  Note that Sidekick-authored checkboxes are always
                    // enumerations, even when they appear singly.
                    //
                    if (controlType == "radio" || (field.local && controlType == "checkbox")) {
                        if (!field.enumeration) {
                            // This is the first one we've found of this group; promote the label to the
                            // section label
                            var inputId = node.getAttribute("id");
                            if (inputId) {
                                var sectionId = getSectionIdForIndexedId(inputId);
                                var sectionLabel = getLabelForId(sectionId, documentLabelMap);
                                field.text = (sectionLabel ? sectionLabel : name);
                            } else {
                                field.text = name;
                            }
                            field.enumeration = [];
                        }
                        field.enumeration.push({
                            "text": CQ.shared.Form.getLabelForField(node, documentLabelMap),
                            "value": node.getAttribute("value"),
                            "defaultValue": getDefaultValue(node),
                            "node": node
                        });
                    }
                } else if (nodeType == "select") {
                    // Create the field record:
                    //
                    fields.push({
                        "text": CQ.shared.Form.getLabelForField(node, documentLabelMap),
                        "value": name,              // for Selection.setOptions()
                        "name": name,               // for everyone else
                        "enumeration": [],
                        "local": inLocalNode,
                        "type": nodeType,
                        "defaultValue": undefined,  // defaultValues are on the options, not select element
                        "node": node
                    });
                    field = fields[fields.length-1];

                    // Add the options to the field's enumeration:
                    //
                    var optionNodes = node.getElementsByTagName("option");
                    for (var i = 0; i < optionNodes.length; i++) {
                        field.enumeration.push({
                            "text": optionNodes[i].innerHTML,
                            "value": optionNodes[i].getAttribute("value"),
                            "defaultValue": getDefaultValue(optionNodes[i]),
                            "node": optionNodes[i]
                        });
                    }
                }
            };

            var walkTree = function(node, inLocalNode, selector) {
                if (node.nodeName.toLowerCase() == "div" && $CQ(node).children('.form_row').length > 0) {
                    inLocalNode = true;
                    selector = $CQ(node).attr('class').replace(/\s/g,'\.');
                }

                if (node.getAttribute && node.getAttribute("name")) {
                    visitNamedNode(node, inLocalNode, selector);
                }

                for (var i = 0; node.childNodes && i < node.childNodes.length; i++) {
                    var child = node.childNodes[i];
                    if (child.nodeType == 1) { // if element
                        walkTree(child, inLocalNode, selector);
                    }
                }
            };

            walkTree(doc, false, undefined);
            return fields;
        }
    }
}();
