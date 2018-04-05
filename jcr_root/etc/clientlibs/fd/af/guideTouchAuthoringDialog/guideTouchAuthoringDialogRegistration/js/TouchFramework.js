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
(function ($, ns, document, guidetouchlib, window, undefined) {

    var utils = guidetouchlib.editLayer.dialogUtils;

    /**
     * On load of dialog to perform any operation use this
     * Ideally, one should write af.listener.onload in content node, and the framework would automatically invoke it
     * @param e
     */
    function onGuideDialogLoad(e) {
        var $dialog;
        if (e.target != null && ($(e.target).hasClass("guide-dialog") || $(e.target).hasClass("cq-dialog") || $(e.target).hasClass("cq-Dialog"))) {
            if ($(e.target).hasClass("cq-Dialog")) {
                $dialog = $(e.target).find("form.cq-dialog");
            } else {
                $dialog = $(e.target);
            }
            //Get the current dialog
            var currentDialog = utils.getCurrentDialog($dialog);

            if (currentDialog != null) {
                //Register Coral 3 dynamic events
                //Calling framework based function to register dynamic functions
                utils.registerGenericDynamicEvents($dialog, currentDialog.editable.type);

                if (currentDialog.editable.type != "independentDialog" && currentDialog.editable.type != "subDialog") {
                    //Function to handle colspan show/hide for resposive layout container
                    utils.handleColspan(currentDialog);

                    //Function to handle dorColspan show/hide for dor column layout of parent panel
                    utils.handleDoRColspan(currentDialog);

                    //Trigger coral-component:attached event for first time load and adjust popover
                    utils.performInitialDialogModifications(currentDialog.editable.type);
                }
            }
        }
    }

    /**
     * Initializes a new deferred object and returns it
     * This API also takes care of reset of the deferred object
     * @param bResetDeferredObject {!boolean} boolean indicating if reset of deferred object is desired
     * @param resetCallback {?function} callback to invoke on reset of deferred object
     * @param doneCallback {?function} callback to invoke once deferred object is resolved
     * @returns {!Object} Create a new deferred object
     * @private
     */
    guidetouchlib._initDeferredObject = function (bResetDeferredObject, resetCallback, doneCallback) {
        var deferred = null,
            attachCallbacks = function () {
                deferred.promise().done(function (e) {
                    if (typeof doneCallback === 'function') {
                        doneCallback.apply(this, [e]);
                    }
                    if (bResetDeferredObject) {
                        var defObject = initialize();
                        if (typeof resetCallback === 'function') {
                            resetCallback.apply(this, [defObject]);
                        }
                    }
                });
            },
            initialize = function () {
                deferred = $.Deferred();
                attachCallbacks();
                return deferred;
            };
        return initialize();
    };

    // This deferred object is created for foundationContentLoaded event
    guidetouchlib._deferredFoundationContentLoadedEvent = guidetouchlib._initDeferredObject(true, function (deferredObject) {
        guidetouchlib._deferredFoundationContentLoadedEvent = deferredObject;
    }, onGuideDialogLoad);

    /**
     * Listener when any Coral Dialog HTML element gets injected
     */
    $(document).on("foundation-contentloaded", function (e) {
        // If AF dialog gets injected, lets check it and resolve it
        if ($(e.target).hasClass("guide-dialog") || $(e.target).hasClass("cq-dialog") || $(e.target).hasClass("cq-Dialog")) {
            // there can be a use-case when a sub dialog is rendered inside a dialog
            // in such cases since the deferred object is already resolved
            // let's create another deferred object and resolve it for sub dialog's listeners to get registered
            if (guidetouchlib._deferredFoundationContentLoadedEvent.state() === "resolved") {
                guidetouchlib._initDeferredObject(false, null, onGuideDialogLoad).resolve(e);
            }
            // lets resolve the global deferred object
            guidetouchlib._deferredFoundationContentLoadedEvent.resolve(e);
        }
    });

}(jQuery, Granite.author, document, window.guidelib.touchlib, this));
