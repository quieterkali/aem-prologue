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
(function ($, author, channel, window, undefined) {

    var name = 'Adaptive Document Fragments'; // must match with corresponding string in asset finder

    /**
     *
     * @constructor
     */
    var GuideDocumentFragmentDnD = function () {
        // Call super constructor
        GuideDocumentFragmentDnD.super_.constructor.apply(this, [arguments]);
    };

    // set edit layer as prototype for inheritance
    author.util.inherits(GuideDocumentFragmentDnD, author.ui.ComponentDragAndDrop);

    //Overriding handle drop method for adaptive form fragment
    GuideDocumentFragmentDnD.prototype.handleDrop = function (event) {
        var docFragRef = $(event.origin).attr("data-assetRef"),
            options = {
                "./assetRef" : docFragRef
            },
            searchParams = {
                resourceType : $(event.origin).attr('data-resourceType')
            },
            components = author.components.find(searchParams),
            editableNeighbor = event.currentDropTarget.targetEditable,
            insertBehavior = event.currentDropTarget.insertBehavior,
            oldParams = components[0].getExtraParams();

        //Setting extra params property for adaptive form fragment
        components[0].setExtraParams(options);

        if (components.length > 0) {
            author.editableHelper.doInsert(components[0], insertBehavior, editableNeighbor);
        }
        //resetting extra params property for adaptive form fragment
        components[0].setExtraParams(oldParams);
    };

    // register the controller at the dispatcher
    author.ui.dropController.register(name, new GuideDocumentFragmentDnD());

}(jQuery, Granite.author, jQuery(document), this));
