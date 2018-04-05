/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
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
 * ***********************************************************************
 */

(function ($, style) {
    style.autocomplete = style.autocomplete || {};
    $(document).on("style-propertysheet-created", function () {

        $('.cssTextArea').on('keydown', function (e) {
            if (e.ctrlKey && e.which == 32) {
                $(this).textcomplete('trigger');
                return false;
            }
        });

        $('.cssTextArea').textcomplete([
      {
          match : /\B:\s*(\w*)$/,
          search : function (term, callback) {
                words = style.autocomplete.cssJson[style.autocomplete.currentCssOverridesProperty].values;
                callback($.map(words, function (word) {
                    return word.indexOf(term) === 0 ? word : null;
                }));
            },
          index : 1,
          replace : function (word) {
                return ": " + word + ';\n';
            }
      },

       { // properties
            words : style.autocomplete.cssProperties,
            match : /((-?[_a-zA-Z]+[_a-zA-Z0-9-]*))$/,
            search : function (term, callback) {
                callback($.map(this.words, function (word) {
                    return word.indexOf(term) === 0 ? word : null;
                }));
            },
            index : 1,
            replace : function (word) {
                style.autocomplete.currentCssOverridesProperty = word;
                return word + ': ';
            },
            context : function (text) { return text.toLowerCase().trim(); }

        }
    ], {
        onKeydown : function (e, commands) {
            if (e.ctrlKey && e.keyCode === 74) { // CTRL-J
                return commands.KEY_ENTER;
            }
        },
        maxCount : 2000,
        zIndex : '9999',
        className : 'cssAutoCompletePopover'
    });

    });
}(jQuery, window.guidelib.touchlib.style));
