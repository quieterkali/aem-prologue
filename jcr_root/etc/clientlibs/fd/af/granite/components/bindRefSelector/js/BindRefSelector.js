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

    //Method to handle bindRefSelector change event
    var openBindRefSelectorTree = function ($bindRefSelectorComponent) {
        var guideBindRefDataObjects = guidetouchlib.components.bindRef.bindRefDataObjects,
            guideBindRefConstants = guidetouchlib.components.bindRef.constants,
            sidePanelBindRefSelector = guideBindRefConstants.SIDE_PANEL_BINDREF_SELECTOR,
            sidePanelEditSelector = guideBindRefConstants.SIDE_PANEL_EDIT_SELECTOR,
            sidePanelBindRefPath = guideBindRefConstants.SIDE_PANEL_BINDREF_SELECTOR_PATH,
            submitButtonSelector = guideBindRefConstants.SIDE_PANEL_BINDREF_SUBMIT_SELECTOR,
            cancelButtonSelector = guideBindRefConstants.SIDE_PANEL_BINDREF_CANCEL_SELECTOR,
            $bindRefTextFieldSelector;

        $bindRefSelectorComponent.find(".bindRefSelectorButton").on("click", function (e) {
            $bindRefTextFieldSelector = $(e.target).closest('.bindRefSelector').find('.bindRefTextField');

            author.ui.SidePanel.loadContent({
                selector : sidePanelBindRefSelector,
                path : sidePanelBindRefPath
            }).then(function () {

                //  author.ui.SidePanel.close(true);
                author.ui.SidePanel.showContent(sidePanelBindRefSelector);

                /* Initialize the bind ref data objects tree*/
                guideBindRefDataObjects.initializeBindRefDataObjectsTree();

                // Make sure the sidepanel is open
                author.ui.SidePanel.open(true);

                $(sidePanelBindRefSelector).show();

                $(submitButtonSelector).off("click");
                $(submitButtonSelector).on("click", function (e) {
                    $bindRefTextFieldSelector[0].value = guideBindRefDataObjects.selectedItemBindRef;
                    $bindRefTextFieldSelector.trigger('change');

                    guideBindRefDataObjects.teardownBindRefDataObjectsTree();
                    $(sidePanelBindRefSelector).hide();
                    $(sidePanelEditSelector).show();
                });

                $(cancelButtonSelector).off("click");
                $(cancelButtonSelector).on("click", function (e) {
                    guideBindRefDataObjects.teardownBindRefDataObjectsTree();
                    $(sidePanelBindRefSelector).hide();
                    $(sidePanelEditSelector).show();
                });
            });
        });

    };

    $(document).on("fdBindRef-contentLoaded", function (e) {
        openBindRefSelectorTree($(e.target).find('.bindRefSelector'));
    });

    $(document).on("foundation-contentloaded", function (e) {

        if ($(e.target).hasClass("cq-dialog") && $(e.target).find('.bindRefSelector')) {

            openBindRefSelectorTree($(e.target).find('.bindRefSelector'));
        }
    });
}(jQuery, Granite.author, window.guidelib.touchlib, this));
