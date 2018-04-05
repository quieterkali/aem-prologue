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

;(function (_, $, style, channel, undefined) {

    style.keys = style.keys || {};

    var keysMapping = {
        "alt+return.CQ-style-keys-layers" :               function () { style.openProperties(); },
        "ctrl+alt+w.CQ-style-keys-layers" :               function () { style.closeProperties(); },
        "cmd+alt+w.CQ-style-keys-layers" :                function () { style.closeProperties(); },
        "cmd+s.CQ-guides-keys-layers" :                   function () { style.saveProperties(); },
        "ctrl+s.CQ-guides-keys-layers" :                  function () { style.saveProperties(); },
        "ctrl+z.CQ-guides-keys-layers" :                  function () { style.undo(); },
        "cmd+z.CQ-guides-keys-layers" :                   function () { style.undo(); },
        "ctrl+shift+z.CQ-guides-keys-layers" :            function () { style.redo(); },
        "cmd+shift+z.CQ-guides-keys-layers" :             function () { style.redo(); },
        "ctrl+y.CQ-guides-keys-layers" :                  function () { style.redo(); },
        "cmd+y.CQ-guides-keys-layers" :                   function () { style.redo(); }
    };

    style.registerKeyboardHotkeys = function () {
        style.keys.EditorFrame = new CUI.Keys(document.documentElement, {
            // create new instance of keys without any filter (CUI.keys filters input elements)
            stopPropagation : true,
            preventDefault : true,
            filter : function () {return true;}
        });

        /**
        * Listeners in content frame
        */
        style.keys.ContentFrame = new CUI.Keys(Granite.author.ContentFrame.getDocument()[0].documentElement, {
            stopPropagation : true,
            preventDefault : true,
            filter : function () {return true;}
        });
        style.keys.EditorFrame.on(keysMapping);
        style.keys.ContentFrame.on(keysMapping);
    };

    style.unregisterKeyboardHotkeys = function () {
        if (style.keys) {
            if (style.keys.EditorFrame) {
                style.keys.EditorFrame.off(".CQ-style-keys-layers");
            }
            if (style.keys.ContentFrame) {
                style.keys.ContentFrame.off(".CQ-style-keys-layers");
            }
        }
    };

    style.undo = function () {
        style.utils.history.Manager.undo();
    };

    style.redo = function () {
        style.utils.history.Manager.redo();
    };

    style.saveProperties = function () {
        style.utils.propertySheetSaved();
    };

    style.openProperties = function () {
        var $overlaySelector = $(style.constants.OVERLAY_SELECTOR_ID);
        var $editButton = $overlaySelector.find(style.constants.OVERLAY_EDIT_BUTTON_CLASS);
        if ($editButton.length) {
            $editButton.click();
        }
    };

    style.closeProperties = function () {
        $(style.constants.STYLE_LAYER_CANCEL_BUTTON).click();
    };

}(window._, $, window.guidelib.touchlib.style, jQuery(document)));
