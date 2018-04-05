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
 * The <code>CQ.formsearch.LensContainer</code> class provides an abstract container
 * for lenses.
 * @class CQ.formsearch.LensContainer
 * @extends CQ.Ext.Panel
 */
//todo: extend CQ.formsearch.Lens?
CQ.formsearch.LensContainer = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        CQ.formsearch.LensContainer.superclass.constructor.call(this, config);
    },

    /**
     * Loads the given data into the active lens.
     * @param {Object} data
     */
    loadData: function(data) {
    },

    /**
     * Returns the selected items of the active lens.
     * @return {Object/Array} The selected items (typically a CQ.Ext.data.Record)
     */
    getSelection: function() {
    },

    /**
     * Returns the active lens.
     * @return {CQ.formsearch.Lens} The active lens
     */
    getCurrentLens: function() {
    }

});