/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
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
 **************************************************************************/

;(function ($, author, guidelib, guidetouchlib, channel, window, undefined) {

    var _superOnOverlayClick = author.edit.Interactions.onOverlayClick,
        _superOnOverlayFastDblClick = author.edit.Interactions.onOverlayFastDblClick,
        guideEditLayerConstants = guidetouchlib.editLayer.constants,
        dorOverlay = guidetouchlib.editLayer.dorOverlay;

    function onOverlayClick(event) {
        var bIsBlackListed = guidetouchlib.utils._checkIfEditableBlackListed(event.editable),
            noEditableDialogType = "foundation/components/parsys/new",
            editable = event.editable,
            fieldPath = event.editable.path;

        if (bIsBlackListed) {
            // Set the layout editable as active, this will be used for double click
            editable.overlay.setActive(true);
            // if black listed then get the parent(since this points to the items node)\
            editable = author.editables.getParent(event.editable);
        }

        // reinialize the event object to the new editable created
        event.editable = editable;
        // Call super onOverlayClick
        _superOnOverlayClick.apply(this, [event]);

        // Opening the dialog when the user click on an element
        guidetouchlib.editLayer.editLayerFormObjects.updateSelectionOnEditableClick(editable);

        //Error specific logic.
        if (event.editable.dom.find(".alert_indicator.guideinvalid_indicator").length == 1) {
            $("#sidepanel-guide-errors ul>li.active").removeClass("active");
            $("#sidepanel-guide-errors li[data-guide-path='" + fieldPath + "']").addClass("active");
        } else {
            $("#sidepanel-guide-errors ul>li.active").removeClass("active");
        }
        // for now commenting this code, if needed uncomment in future
        /*else if($("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_PROPERTIES_ID).hasClass( "is-active" )) {
            // check if the editable is not a parsys, only then open the dialog on click of overlay
            if(editable.config.type !== noEditableDialogType) {
                // call the dialog frame
                author.DialogFrame.openDialog(new author.edit.Dialog(editable));
            }
        } */
        if (author.DialogFrame.pathOfCurrentDialogEditable) {
            //Remove the placeholder overlay over the editable.
            if (author.selection.active.path == author.DialogFrame.pathOfCurrentDialogEditable) {
                guidetouchlib.utils.removeCurrentPlaceholderOverlay(author.DialogFrame.pathOfCurrentDialogEditable);
            } else {
                guidetouchlib.utils.createPlaceholderOverlay(author.DialogFrame.pathOfCurrentDialogEditable, false);
            }
        }
    };

    function onOverlayFastDblClick(event) {
        var bIsBlackListed = guidetouchlib.utils._checkIfEditableBlackListed(event.editable),
            // if black listed then get the parent(since this points to the items node)
            editable = bIsBlackListed ? author.editables.getParent(event.editable) : event.editable;
        event.editable = editable;
        // Call super onOverlayFastDblClick
        _superOnOverlayFastDblClick.apply(this, [event]);
    }

    /**
     * Default handlers for interaction with overlays. Those handlers are processed by the selection module, which listens to
     * the cq-overlay events (sent from the overlay manager)
     *
     * @const
     * @property {function} onOverlayHover          -   The handler that gets executed when an overlay is hovered.
     * @property {function} onOverlayClick          -   The handler that gets executed when an overlay is clicked
     */
    guidetouchlib.editLayer.Interactions = $.extend({}, author.edit.Interactions, {// TODO interactionS
        /**
         * @fires cq-interaction-blur or cq-interaction-focus
         */
        onOverlayClick :         onOverlayClick,

        onOverlayFastDblClick :  onOverlayFastDblClick

    });

    $(channel).on("cq-sidepanel-tab-switched", function (e) {
        if (e.tabName === 'sidepanel-tab-dorProperties' && Granite.author.layerManager.getCurrentLayer() === 'Edit') {
            dorOverlay.style.height = $("#ContentWrapper").get(0).style.height;
            dorOverlay.open = true;
        } else {
            dorOverlay.open = false;
        }
    });

    $(channel).on("cq-layer-activated", function (e) {
        if (e.layer !== 'Edit') {
            dorOverlay.open = false;
        }
    });
}(jQuery, window.Granite.author, window.guidelib, window.guidelib.touchlib, jQuery(document), this));
