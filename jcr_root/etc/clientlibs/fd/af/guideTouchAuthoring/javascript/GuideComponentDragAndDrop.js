/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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
(function (window, $, channel, author, guidetouchlib) {

    var previousTargetPanel = null,
        _superHandleDrop = author.ui.ComponentDragAndDrop.prototype.handleDrop,
        _superHandleDragEnd = author.ui.ComponentDragAndDrop.prototype.handleDragEnd;

    //overriding the componetns handleDrop function so that we can remove the highlighting class from the panel if present
    author.ui.ComponentDragAndDrop.prototype.handleDrop = function (event) {
        _superHandleDrop.apply(this, [event]);
        if (previousTargetPanel) {
            removePanelHighlightClass();
        }
    };

    //overriding the componetns handleDragEnd function so that we can remove the highlighting class from the panel if present
    author.ui.ComponentDragAndDrop.prototype.handleDragEnd = function (event) {
        _superHandleDragEnd.apply(this, [event]);
        if (previousTargetPanel) {
            removePanelHighlightClass();
        }
    };

    //overriding the componetns handleDrag function so that can enhance the drop zone panel when components are being dropped
    author.ui.ComponentDragAndDrop.prototype.handleDrag = function (event) {

        var dropzoneElement = event.originalTarget,
        $dropzoneElement = $(dropzoneElement),
        targetEditable = null,
        targetPanel = null,
        targetPanelNameTemplate = '<div class="targetPanelTitle" >{{title}}</div>',
        ancestorPanelNameTemplate = '<div class="ancestorPanelTitle" >{{title}}</div>',
        templateSettings =  {interpolate : /\{\{(.+?)\}\}/g};

        if ($dropzoneElement.attr('data-path')) {
            targetEditable = author.store.find($dropzoneElement.attr('data-path'))[0];
        }
        //only need to consider if targetEditable is defined
        if (targetEditable) {
            targetPanel = getTargetPanel(targetEditable);
            if (!targetPanel) {
                return;
            }
            // if previous and current target panel are same we dont need to do anything
            if ((previousTargetPanel !== null && previousTargetPanel === targetPanel.path) || ($(event.target).data("path") === $dropzoneElement.data("path"))) {
                return;
            }
            if (previousTargetPanel && previousTargetPanel !== targetPanel.path) {
                var previousEditable = author.store.find(previousTargetPanel)[0];
                unhighlightPanel(previousEditable);
            }
            previousTargetPanel = targetPanel.path;
            highlightAncestorPanel(targetPanel, ancestorPanelNameTemplate, templateSettings);
            highlightTargetPanel(targetPanel, targetPanelNameTemplate, templateSettings);
        } else if ($dropzoneElement.is(".clickable-overlay")) {
            return;
        } else {
            if (previousTargetPanel) {
                unhighlightPanel(previousTargetPanel);
                previousTargetPanel = null;
            }
        }
    };

    function removePanelHighlightClass() {
        unhighlightPanel(previousTargetPanel);
        previousTargetPanel = null;
    };

    //return the target panel which needs to be highlighted while dropping component
    function getTargetPanel(currentEditable) {

        while (currentEditable && !guidetouchlib.utils.isContainer(currentEditable)) {
            currentEditable = currentEditable.getParent();
        }
        return currentEditable;
    };

    //adds the title of the panel to the editable so that it can be easily distinguished while dropping component
    function addPanelNameToEditable(currentEditable, template, templateSettings) {

        var panelNameDom = null,
            title = author.edit.actions.getEditableDisplayableName(currentEditable),
            currentEditableDom = currentEditable.overlay.dom,
            currentEditableOffset = $(currentEditableDom).offset(),
            panelNameOffset = null;

        if (!($(currentEditableDom).prev().hasClass("targetPanelTitle") || $(currentEditableDom).prev().hasClass("ancestorPanelTitle"))) {
            title = title ? title : currentEditable.name;
            panelNameDom = $(_.template(template, {title : title}, templateSettings));
            $(panelNameDom[0]).insertBefore(currentEditableDom);
            panelNameOffset = $(panelNameDom[0]).offset();
            panelNameDom.css({
                top : currentEditableOffset.top - panelNameOffset.top - panelNameDom[0].offsetHeight + "px",
                left : currentEditableOffset.left - panelNameOffset.left  + "px"
            });
        }
    };

    //highlights the ancestor of the current target panel to easily distinguish it
    function highlightAncestorPanel(currentEditable, template, templateSettings) {

        var currentEditableType = null,
            currentEditableDom = null;
        currentEditable = currentEditable.getParent();

        while (currentEditable) {
            currentEditableType = currentEditable.type;
            if (guidetouchlib.utils.isContainer(currentEditable)) {
                currentEditableDom = currentEditable.overlay.dom;
                currentEditableDom.addClass('highlightAncestorPanel');
                addPanelNameToEditable(currentEditable, template, templateSettings);
            }
            currentEditable = currentEditable.getParent();
        }
    };

    //highlights current target panel while dropping component
    function highlightTargetPanel(targetPanel, template, templateSettings) {

        var targetPanelDom = targetPanel.overlay.dom,
        panelNameDom = null;
        targetPanelDom.addClass('highlightTargetPanel');
        addPanelNameToEditable(targetPanel, template, templateSettings);
    };

    //removes the highlighting class of the panel and also the title
    function unhighlightPanel(EditablePath) {

        var currentEditable = author.store.find(EditablePath)[0],
            currentEditableType = null,
            currentEditableDom = null;

        while (currentEditable) {
            currentEditableType = currentEditable.type;
            if (guidetouchlib.utils.isContainer(currentEditable)) {
                currentEditableDom = currentEditable.overlay.dom;
                currentEditableDom.removeClass('highlightTargetPanel');
                currentEditableDom.removeClass('highlightAncestorPanel');
                if (($(currentEditableDom).prev().hasClass("targetPanelTitle") || $(currentEditableDom).prev().hasClass("ancestorPanelTitle"))) {
                    $(currentEditableDom).prev().remove();
                }
            }
            currentEditable = currentEditable.getParent();
        }
    };

}(window, $, jQuery(document), Granite.author, guidelib.touchlib));
