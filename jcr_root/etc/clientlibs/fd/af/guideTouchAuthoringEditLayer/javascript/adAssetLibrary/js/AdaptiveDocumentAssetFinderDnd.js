/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 ******************************************************************************/
(function ($, author, channel, window, undefined) {

    var name = 'Adaptive Documents';  // must match with corresponding string in asset finder

    /**
     *
     * @constructor
     */
    var DocumentDnD = function () {
        // Call super constructor
        DocumentDnD.super_.constructor.apply(this, [arguments]);
    };

    // set edit layer as prototype for inheritance
    author.util.inherits(DocumentDnD, author.ui.ComponentDragAndDrop);

    //Overriding handle drop method for adaptive form fragment
    DocumentDnD.prototype.handleDrop = function (event) {
        var formRef = event.origin.getAttribute("data-formRef"),
            options,
            components = author.components.find($(event.origin).attr('data-path')),
            editableNeighbor = event.currentDropTarget.targetEditable,
            insertBehavior = event.currentDropTarget.insertBehavior,
            options = {
                "./formRef" : formRef,
                "./formType" : "adaptiveDocument"
            };

        if (components.length > 0) {
            var oldParams = components[0].getExtraParams();
            components[0].setExtraParams(options);
            author.editableHelper.doInsert(components[0], insertBehavior, editableNeighbor);
            components[0].setExtraParams(oldParams);
        }
    };

    // register the controller at the dispatcher
    author.ui.dropController.register(name, new DocumentDnD());

}(jQuery, Granite.author, jQuery(document), this));
