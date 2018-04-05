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
 * The <code>CQ.formsearch.Util</code> contains utilities for a globally set
 * {@link CQ.formsearch.QueryBuilder Query Builder} and {@link CQ.formsearch.Lens lenses}.
 * @static
 * @class CQ.formsearch.Util                      
 */
CQ.formsearch.Util = function() {

    /**
     * The global {@link CQ.formsearch.QueryBuilder Query Builder}.
     * @type CQ.formsearch.QueryBuilder
     */
    var queryBuilder = null;

    /**
     * An optional container to hold multiple lenses (e.g. a {@link CQ.formsearch.LensDeck lens deck}).
     * @type CQ.formsearch.LensContainer
     */
    var lensContainer = null;
    
    /**
     * The unique lens or the active lens of {@link #lensContainer}.
     * @type CQ.formsearch.Lens
     */
    var lens = null;
    
    /**
     * The action to execute on double click on a result.
     * @type Function
     */
    var dblClickAction = function(){};

    return {
        /**
         * Sets the Query Builder.
         * @param {CQ.formsearch.QueryBuilder} qBuilder The Query Builder
         */
        setQueryBuilder: function(qBuilder) {
            queryBuilder = qBuilder;
        },

        /**
         * Returns the Query Builder.
         * @return {CQ.formsearch.QueryBuilder} The Query Builder
         */
        getQueryBuilder: function() {
            return queryBuilder;
        },

        /**
         * Sets the lens container.
         * @param {CQ.formsearch.LensContainer} container The lens container
         */
        setLensContainer: function(container) {
            lensContainer = container;
        },
        
        /**
         * Returns the lens container or <code>null</code> if no container is set.
         * @return {CQ.formsearch.LensContainer} The lens container
         */
        getLensContainer: function() {
            return lensContainer;
        },
        
        /**
         * Returns the active lens of the lens container or the solely lens.
         * @return {CQ.formsearch.LensContainer/CQ.formsearch.Lens}
         */
        getLens: function() {
            if (lensContainer) {
                return lensContainer.getCurrentLens();
            }
            else {
                return lens;
            }
        },
        
        /**
         * Adds a lens to the lens container or - if no container is defined -
         * sets the solely lens.
         * @param {CQ.formsearch.Lens} le The lens
         * @param {String} name The name of the lens (optional for a solely lens but required for lens containers)
         * @param {Object} buttonConfig The config object of the button (optional for a solely lens but required for lens containers)
         */
        addLens: function(le, name, buttonConfig) {
            if (lensContainer) {
                lensContainer.add(le, name, buttonConfig);
            }
            else {
                lens = le;
            }
        },

        setSelectedLens: function(id) {
            if(lensContainer){
                lensContainer.setActiveItem(id);
            }
        },

        /**
         * Passes the given data to the lens container or - if no
         * containter is defined - to the solely lens.
         * @param {Object} data
         */
        loadData: function(data) {
            if (lensContainer) {
                lensContainer.loadData(data);
            }
            else if (lens) {
                lens.loadData(data);
                lens.doLayout();
            }
        },

        /**
         * Returns the selection of the active lens.
         * @return {Object/Array} The selected items (typically a CQ.Ext.data.Record)
         */
        getSelection: function() {
            return this.getLens().getSelection();
        },
        

        /**
         * Returns the paths of the selected items
         * @return {Array} The selected paths
         */
        getSelectedPaths: function() {
            var s = this.getSelection();
            var paths = [];
            for (var i = 0; i < s.length; i++) {
                paths.push(s[i]["path"]);
            }
            return paths;
        },
        
       
        setDblClickAction: function(func) {
            dblClickAction = func;
        },

        resultDblClick: function() {
            if (dblClickAction) {
                dblClickAction(arguments);
            }
        }
    };
}();