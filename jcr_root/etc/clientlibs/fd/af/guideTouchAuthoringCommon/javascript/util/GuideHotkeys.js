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
(function (guidetouchlib, author, channel) {

    guidetouchlib.keys = guidetouchlib.keys || {};

    var keysMapping = {
        "ctrl+alt+return.CQ-guides-keys-layers" :          function () { guidetouchlib.editRule(); },
        "cmd+alt+return.CQ-guides-keys-layers" :           function () { guidetouchlib.editRule(); },
        "alt+return.CQ-guides-keys-layers" :               function () { guidetouchlib.openProperties(); },
        "ctrl+alt+w.CQ-guides-keys-layers" :               function () { guidetouchlib.closeProperties(); },
        "cmd+alt+w.CQ-guides-keys-layers" :                function () { guidetouchlib.closeProperties(); },
        "cmd+s.CQ-guides-keys-layers" :                    function () { guidetouchlib.saveProperties(); },
        "ctrl+s.CQ-guides-keys-layers" :                   function () { guidetouchlib.saveProperties(); },
        "ctrl+z.CQ-guides-keys-layers" :                   function () { guidetouchlib.undo(); },
        "cmd+z.CQ-guides-keys-layers" :                    function () { guidetouchlib.undo(); },
        "ctrl+shift+z.CQ-guides-keys-layers" :             function () { guidetouchlib.redo(); },
        "cmd+shift+z.CQ-guides-keys-layers" :              function () { guidetouchlib.redo(); },
        "ctrl+y.CQ-guides-keys-layers" :                   function () { guidetouchlib.redo(); },
        "cmd+y.CQ-guides-keys-layers" :                    function () { guidetouchlib.redo(); },
        "cmd+backspace.CQ-guides-keys-layers" :            function () { guidetouchlib.deleteComponent(); },
        "ctrl+backspace.CQ-guides-keys-layers" :           function () { guidetouchlib.deleteComponent(); },
        "cmd+delete.CQ-guides-keys-layers" :               function () { guidetouchlib.deleteComponent(); },
        "ctrl+delete.CQ-guides-keys-layers" :              function () { guidetouchlib.deleteComponent(); }
    };

    guidetouchlib.utils.registerKeyboardHotkeys = function () {
        guidetouchlib.keys.EditorFrame = new CUI.Keys(document.documentElement, {
            // create new instance of keys without any filter (CUI.keys filters input elements)
            stopPropagation : true,
            preventDefault : true,
            filter : function () {return true;}
        });
        guidetouchlib.keys.EditorFrame.on(keysMapping);
    };

    guidetouchlib.utils.unregisterKeyboardHotkeys = function () {
        guidetouchlib.keys.EditorFrame.off(".CQ-guides-keys-layers");
    };

    guidetouchlib.undo = function () {
        if (!Granite.author.DialogFrame.bIsCurrentDialogDirty) {
            $(guidetouchlib.editLayer.constants.UNDO_BUTTON_SELECTOR).click();
        }
    };

    guidetouchlib.redo = function () {
        if (!Granite.author.DialogFrame.bIsCurrentDialogDirty) {
            $(guidetouchlib.editLayer.constants.REDO_BUTTON_SELECTOR).click();
        }
    };

    guidetouchlib.saveProperties = function () {
        var $currentFocusItem = $(guidetouchlib.editLayer.constants.SIDE_PANEL_EDIT_SELECTOR).find(':focus'),
            $sidePanelDialog = $(guidetouchlib.editLayer.constants.SIDE_PANEL_EDIT_SELECTOR).find(guidetouchlib.editLayer.constants.SIDEPANEL_DIALOG_SUBMIT_BUTTON_SELECTOR);
        //Setting focus on Submit and then reverting back to previously focused item after saving.
        // Else, focus out makes the dialog dirty.
        if ($currentFocusItem) {
            $sidePanelDialog.focus();
        }
        $sidePanelDialog.click();
        if ($currentFocusItem) {
            $currentFocusItem.focus();
        }
    };

    guidetouchlib.editRule = function () {
        var $editableToolbar = $(guidetouchlib.editLayer.constants.EDITABLE_TOOLBAR_ID);
        if ($editableToolbar.length) {
            $editableToolbar.find(guidetouchlib.editLayer.constants.RULE_EDITOR_BUTTON_SELECTOR).click();
        }
    };

    guidetouchlib.openProperties = function () {
        var $editableToolbar = $(guidetouchlib.editLayer.constants.EDITABLE_TOOLBAR_ID);
        if ($editableToolbar.length) {
            var $edit_button = $editableToolbar.find(guidetouchlib.editLayer.constants.CONFUGURE_BUTTON_SELECTOR);
            var $toolbar_edit_button = $editableToolbar.find(guidetouchlib.editLayer.constants.TOOLBAR_CONFUGURE_BUTTON_SELECTOR);
            if ($edit_button.length) {
                $edit_button.click();
            } else if ($toolbar_edit_button.length) { //toolbar edit button has different data-action
                $toolbar_edit_button.click();
            }
        }
    };

    guidetouchlib.closeProperties = function () {
        $(guidetouchlib.editLayer.constants.SIDE_PANEL_EDIT_SELECTOR).find(guidetouchlib.editLayer.constants.SIDEPANEL_DIALOG_CANCEL_BUTTON_SELECTOR).click();
    };

    guidetouchlib.deleteComponent = function () {
        var $editableToolbar = $(guidetouchlib.editLayer.constants.EDITABLE_TOOLBAR_ID);
        if ($editableToolbar.length) {
            var $deleteButton = $editableToolbar.find(guidetouchlib.editLayer.constants.DELETE_BUTTON_SELECTOR);
            var $toolbarDeleteButton = $editableToolbar.find(guidetouchlib.editLayer.constants.TOOLBAR_DELETE_BUTTON_SELECTOR);
            if ($deleteButton.length) {
                $deleteButton.click();
            } else if ($toolbarDeleteButton.length) { //toolbar delete button has different data-action
                $toolbarDeleteButton.click();
            }
        }
    };

    guidetouchlib.focusInputElement = function ($targetDom) {
        if ($targetDom.length === 0) {
            return;
        }
        $targetInput = $targetDom.find("input").eq(0);
        if ($targetInput.length) {
            $targetInput.focus();
        }
    };

    guidetouchlib.currentSelectedTab = function ($targetElement) {
        var $guideSidePanelObject = $targetElement.find("#guideSidePanelObjects");
        if ($guideSidePanelObject.length) { //content tab is opened with either Form Objects or Data Model Objects Tab
            var $selectedObjectsContainer = $guideSidePanelObject.find("coral-panel.is-selected");
            return $selectedObjectsContainer;
        }
        return $targetElement;
    };

}(window.guidelib.touchlib, window.Granite.author, jQuery(document)));
