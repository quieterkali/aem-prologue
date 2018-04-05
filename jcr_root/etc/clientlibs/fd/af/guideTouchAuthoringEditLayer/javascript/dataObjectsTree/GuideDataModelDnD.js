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

(function ($, author, guidetouchlib, undefined) {
    /*
     * override
     * */
    var handleDrop = function (event) {
        guidetouchlib.editLayer.editLayerDataObjects.handleDataDrop(event);
        return false;
    },
/*
 * override
 * */
 isInsertAllowed = function (event) {
            return true;
        };

    guidetouchlib.editLayer.GuideDataModelDragAndDrop = author.util.extendClass(author.ui.ComponentDragAndDrop, {
        isInsertAllowed : isInsertAllowed,
        handleDrop : handleDrop
    });

    // register the controller at the dispatcher
    author.ui.dropController.register('GuideDataModel', new  guidetouchlib.editLayer.GuideDataModelDragAndDrop());

}(jQuery, Granite.author, window.guidelib.touchlib, this));
