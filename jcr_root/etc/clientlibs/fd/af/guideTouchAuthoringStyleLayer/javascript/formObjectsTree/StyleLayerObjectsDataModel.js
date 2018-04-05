/*
 * ADOBE CONFIDENTIAL
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
 */
;(function ($, author, guidetouchlib, window, undefined) {
    /*
     * override
     * */
    var _superParseData = guidetouchlib.editLayer.FormObjectsTreeDataModel.prototype.parseData,

        parseData = function (data) {
            data = _superParseData.call(this, data);
            /* Wrappping the Data in a root Node*/
            var newData = {"label" : "", "id" : "StylableComponents","type" : "", "items" : {}};
            newData.items.stylableComponents = data;
            return newData;
        };

    guidetouchlib.styleLayer.FormObjectsTreeDataModel = author.util.extendClass(guidetouchlib.editLayer.FormObjectsTreeDataModel, {
        parseData : parseData
    });

}(jQuery, Granite.author, window.guidelib.touchlib, this));
