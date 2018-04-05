/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
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
 * The <code>CQ.formsearch.Lens</code> class provides an abstract lens.
 * @class CQ.formsearch.Lens
 * @extends CQ.Ext.Panel
 * @constructor
 * @param {Object} config The config object
 */
CQ.formsearch.Lens = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @cfg {String} text
     * The text of the lens as used in certain {@link LensContainer containers}
     * e.g. for the button of a {@link LensDeck#tabTip}
     * @private
     */
    // (tabTip seems not to work for LensDeck)
    text: "",

    constructor: function(config) {
        CQ.formsearch.Lens.superclass.constructor.call(this, config);
    },

    /**
     * Loads the given data
     * @param {Object} data
     */
    loadData: function(data) {
    },

    /**
     * Returns the selected items
     * @return {Array} The selected items
     */
    getSelection: function() {
    }

});

CQ.Ext.reg("formsearchlens", CQ.formsearch.Lens);
