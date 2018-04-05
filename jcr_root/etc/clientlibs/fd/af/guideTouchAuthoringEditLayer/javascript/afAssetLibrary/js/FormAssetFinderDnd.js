/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2015 Adobe Systems Incorporated
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

    var registryname = 'Adaptive Forms', // must match with corresponding string in asset finder
        isAfAuthoring = (function () {
            var urlRe = new RegExp("/(?:editor\\.html|cf#)/content/(?:forms/af|dam/formsanddocuments)/");
            return urlRe.test(window.location.pathname);
        }());

    /**
     *
     * @constructor
     */
    var FormDnD = function () {
        // Call super constructor
        FormDnD.super_.constructor.apply(this, [arguments]);
    };

    // set edit layer as prototype for inheritance
    author.util.inherits(FormDnD, author.ui.ComponentDragAndDrop);

    //Overriding handle drop method for adaptive form fragment
    FormDnD.prototype.handleDrop = function (event) {
        var formRef = event.origin.getAttribute("data-formRef"),
            options,
            components = author.components.find($(event.origin).attr('data-path')),
            editableNeighbor = event.currentDropTarget.targetEditable,
            insertBehavior = event.currentDropTarget.insertBehavior;

        if (isAfAuthoring) {
            options = {
                "./fragRef" : formRef,
                "./formType" : "adaptiveForm",
                "./isForm" : true
            };
        } else {
            options = {
                "./formRef" : formRef
            };
        }

        if (components.length > 0) {
            var oldParams = components[0].getExtraParams();
            components[0].setExtraParams(options);
            author.editableHelper.doInsert(components[0], insertBehavior, editableNeighbor);
            components[0].setExtraParams(oldParams);
        }
    };

    // register the controller at the dispatcher
    author.ui.dropController.register(registryname, new FormDnD());

}(jQuery, Granite.author, jQuery(document), this));
