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
 * The <code>CQ.formsearch.DataViewLens</code> class provides a lens that uses a
 * DataView to display results.
 * @class CQ.formsearch.DataViewLens
 * @extends CQ.formsearch.Lens
 */
CQ.formsearch.DataViewLens = CQ.Ext.extend(CQ.formsearch.Lens, {


    /**
     * @cfg {Object} storeConfig
     * The config object for the {@link CQ.Ext.DataView#store store} of the data view.
     */
    storeConfig: null,


    initComponent: function() {
        CQ.formsearch.DataViewLens.superclass.initComponent.call(this);

        try {
            this.dataView = this.findByType("dataview")[0];
        }
        catch (e) {}
    },

    storeValue: [
                        "assetType", "name", "id", "path", "title", "description", "author", "tags", "formUrl", "pdfUrl",
                        "extendedProperties", "references", "images", "status", "creationDate", "lastModifiedDate", "pdfStyle",
                        "htmlStyle", "guideUrl","guideStyle","downloadUrl","downloadStyle"
                    ],

    /**
     * Creates a new <code>CQ.formsearch.DataViewLens</code> instance.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        var storeObject = {};
        for(var i=0; i<this.storeValue.length;i++)
			storeObject[this.storeValue[i]] = 1;
        var effCutPoints = reqCutPoints.split(",");
        for(var i=0; i<effCutPoints.length; i++){
			if(!(effCutPoints[i] in storeObject))
                storeObject[effCutPoints[i]] = 1;
            else 
                storeObject[effCutPoints[i]]++;
        }
        this.storeValue = Object.keys(storeObject);

        if (!config.store) {
            // use default store
            var storeConfig = CQ.Util.applyDefaults(config.storeConfig, {
                "reader": new CQ.Ext.data.JsonReader({
                    "fields": this.storeValue,
                    "id": "id"
                }),
                "baseParams": {
                    "_charset_": "utf-8"
                },
                "listeners": {
                    "load": function(store, records, options) {
                        store.records = records;
                    }
                }
            });
        }

    // todo: move mosaic/dam specific config to mosaic lens resp. DamDataViewLens
        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "border": false,
            "items": {
                "xtype": "dataview",
                "cls": "cq-cft-dataview",
                "loadingText": CQ.I18n.getMessage("Loading content..."),
                "multiSelect": true,
                "singleSelect": true,
                "overClass": "x-view-over",
                "emptyText": CQ.I18n.getMessage("No forms available"),
                "autoHeight": true,
                "tpl":
                    '<tpl for=".">' +
                        '<div class="boxes">' +
                            '<img src="../../../libs/fd/fp/widgets/themes/default/widgets/images/cube.png" width="" height="" alt="">' +
                            '<h3 class="">{[values.name]}</h3>' +
                            '<p class="">{[values.description]}</p>' +
                            '<div class="boxes-icon-cont">' +
                                '<div class="op-dow">' +
                                    '<a href="#" class="open mr30"></a>' +
                                    '<a href="#" class="download"></a>' +
                                '</div>' +
                                '<a href="#" class="boxes-arrow-link"></a>' +
                                '<ul class="boxes-hidden-block">' +
                                    '<li class="">' +
                                        '<div class="link-l-r-cont">' +
                                            '<a href="" class="link-l"></a>' +
                                            '<a href="" class="link-r"></a>' +
                                        '</div>' +
                                    '</li>' +
                                    '<li class=""><a href="#" class="use-icon redact"></a></li>' +
                                    '<li class=""><a href="#" class="use-icon insert"></a></li>' +
                                    '<li class=""><a href="#" class="use-icon trash"></a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</tpl>',
                "itemSelector": ".item",
                "store": new CQ.Ext.data.GroupingStore(storeConfig),
                "prepareData": function(data) {
//                    var meta = data["jcr:content"]["metadata"];
//                    data.meta = meta;
//                    data.name = "";
//                    data.title = "";
//                    data.shortTitle = "";
//                    data.shortPath = "";
//
//                    try {
//                        var mod = data["jcr:content"]["renditions"]["cq5dam.thumbnail.48.48.png"]["jcr:content"]["jcr:lastModified"];
//                        data.ck = new Date(mod).getTime();
//                    }
//                    catch(e) {}
//                    data.id = this.id;
//
//                    data.path = data["jcr:path"];
//                    try {
//                        data.name = data.path.substring(data.path.lastIndexOf("/") + 1);
//                        data.shortPath = data.path.substring(0, data.path.lastIndexOf("/") + 1);
//                        var ellipsis = "";
//                        while (data.shortPath.length > 28) {
//                            if (data.shortPath.indexOf("/") == data.shortPath.lastIndexOf("/")) break;
//                            data.shortPath = data.shortPath.substring(data.shortPath.indexOf("/") + 1);
//                            ellipsis = ".../";
//                        }
//                        data.shortPath = ellipsis + data.shortPath;
//
//                        if (meta["dc:title"]) {
//                            var t = meta["dc:title"];
//                            if (t instanceof Array) data.title = t[0];
//                            else data.title = t;
//                        }
//                        else {
//                            data.title = data.name;
//                        }
//                        data.shortTitle = CQ.Ext.util.Format.ellipsis(data.title, 25);
//                    }
//                    catch (e) {console.log(e);}
//
//                    data.path = CQ.HTTP.encodePath(data.path);
//
//                    try {
//                        encode values for HTML output in JS
//                        data.name = data.name.replace(/"/g, "&quot;").replace(/'/g,"&#39");
//                        data.title = data.title.replace(/"/g, "&quot;").replace(/'/g,"&#39");
//                        data.shortTitle = data.shortTitle.replace(/"/g, "&quot;").replace(/'/g,"&#39");
//                        data.shortPath = data.shortPath.replace(/"/g, "&quot;").replace(/'/g,"&#39");
//                    }
//                    catch (e) {console.log(e);}
//
//                    try {
//                        var md = meta["dam:ModificationDate"];
//                        var mdParsed = null;
//                        if (md) {
//                            mdParsed = new Date(md);
//                            if (isNaN(mdParsed)) {
//                                mdParsed = Date.parseDate(md, "c");
//                            }
//                        }
//                        if (mdParsed && !isNaN(mdParsed)) data.modificationDate = mdParsed;
//                    }
//                    catch (e) {console.log(e);}
//
//                    try {
//                        var cd = meta["dam:CreationDate"];
//                        var cdParsed = null;
//                        if (cd) {
//                            cdParsed = new Date(cd);
//                            if (isNaN(cdParsed)) {
//                                cdParsed = Date.parseDate(data.creationDate, "c");
//                            }
//                        }
//                        else {
//                            cdParsed = new Date(data["jcr:created"]);
//                        }
//                        if (cdParsed && !isNaN(cdParsed)) data.creationDate = cdParsed;
//                    }
//                    catch (e) {console.log(e);}
//
//                    data.imageDimensions = "";
//                    if (meta["tiff:ImageWidth"] && meta["tiff:ImageLength"]) {
//                        data.imageDimensions = meta["tiff:ImageWidth"] + " &times; " + meta["tiff:ImageLength"];
//                    }
                    return data;
                }
//                "listeners": {
//                    "dblclick": function() {
//                        CQ.formsearch.Util.assetDblClick();
//                    }
//                }
            }
        });

        CQ.formsearch.DataViewLens.superclass.constructor.call(this, config);
    },


   loadData: function(data) {
        if (this.dataView) {
            this.dataView.store.loadData(data);
        }
    },

   getSelection: function() {
        try {
            var r = this.dataView.getSelectedRecords();
            var s = [];
            for (var i = 0; i < r.length; i++) {
                s.push(r[i].json);
            }
            return s;
        }
        catch (e) {
            return [];
        }
   }
});


CQ.Ext.reg("formsearchdataviewlens", CQ.formsearch.DataViewLens);
