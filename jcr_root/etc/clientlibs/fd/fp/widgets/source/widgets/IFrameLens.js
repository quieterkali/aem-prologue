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
 * The <code>CQ.formsearch.IFrameLens</code> class provides a lens that uses an
 * iFrame.
 * @class CQ.formsearch.IFrameLens
 * @extends CQ.formsearch.Lens
 * @private (not documented, currently no working sample exists)
 */
CQ.formsearch.IFrameLens = CQ.Ext.extend(CQ.formsearch.Lens, {


    /**
     * @cfg {Object} storeConfig
     */
    // private
    storeConfig: null,


    iframe: null,

    /**
     * Creates a new <code>CQ.formsearch.IFrameLens</code> instance.
     *
     * Example:
     * <pre><code>
    //todo
});
       </pre></code>
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        var id = config.id ? config.id : CQ.Util.createId();
        config = CQ.Util.applyDefaults(config, {
            "renderTo": CQ.Util.ROOT_ID,
            "id": id,
            "html": '<iframe src="' + (config.url ? config.url : CQ.Ext.SSL_SECURE_URL) + '"' +
                    ' id="' + id + '_iframe" ' +
                    ' style="width:100%;height:100%;overflow:auto;border:none;' +
                    ' border="0" frameborder="0"></iframe>'
        });

        CQ.formsearch.IFrameLens.superclass.constructor.call(this, config);
    },

    getIFrame: function() {
        if (!this.iframe) {
            this.iframe = document.getElementById(this.id + "_iframe");
        }
        return this.iframe;
    },

    loadData: function(data) {
        var f = this.getIFrame();
        var url = this.url;
        for (var i = 0; i < data.hits.length; i++) {
            url = CQ.utils.HTTP.addParameter(url, "path", data.hits[i].path);
        }
        f.src = url;
    },

    getSelection: function() {
        var f = this.getIFrame();
        try {
            return f.contentWindow.getSelection();
        }
        catch (e) {
            return [];
        }
    }

});


CQ.Ext.reg("formsearchiframelens", CQ.formsearch.IFrameLens);
