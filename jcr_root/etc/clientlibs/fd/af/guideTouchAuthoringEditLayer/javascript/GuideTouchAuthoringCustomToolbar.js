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
/*
 This action toolbar is to perform actions on form components
 check this file for the implementation of this toolbar
 /libs/cq/gui/components/authoring/clientlibs/editor/js/ui/ui.Toolbar.js
 */
;
(function ($, ns, guidetouchlib, channel, window, undefined) {
    guidetouchlib.editToolbar = {};
    var _toShowInPopoverActionBar = [];

    guidetouchlib.editToolbar = function () {
        guidetouchlib.editToolbar.super_.constructor.apply(this, arguments);
    };

    /**
     * @type {Object} - Object default actions for the editables
     */
    guidetouchlib.editToolbar.defaultActions = ns.edit.Toolbar.defaultActions;

    ns.util.inherits(guidetouchlib.editToolbar, ns.edit.Toolbar);

    guidetouchlib.editToolbar.prototype.init = function () {
        //_toShowInPopoverActionBar =[];
        return guidetouchlib.editToolbar.super_.init.call(this);
    };

    guidetouchlib.editToolbar.prototype.init = function () {
        //_toShowInPopoverActionBar =[];
        return guidetouchlib.editToolbar.super_.init.call(this);
    };

    // create the pop over element filled in with non icon actions
    guidetouchlib.editLayer.dialogUtils.createNonIconActionsPopOver = function (actions) {
        // create popover
        var popover = new Coral.Popover().set({
            alignAt : Coral.Overlay.align.LEFT_BOTTOM,
            alignMy : Coral.Overlay.align.LEFT_TOP,
            content : {
                innerHTML : ''
            },
            open : true
        });
        popover.on("coral-overlay:close", function () {
            $(popover).remove();
        });
        $(popover).addClass("coral--dark").attr("id", "afMoreActionsPopover");
        // append more actions to the pop over content
        (function () {
            var i = 0,
                length = actions.length,
                $actionList;

            // create the list
            $actionList = $('<coral-list class="coral-List--minimal"></coral-list>');

            // iterate over each action
            for (; i < length; i++) {
                // wrapping the action inside coral-list-item-content since coral-buttonlist
                // expects items to be wrapped with this tag
                var $actionItemContent = $("<coral-list-item/>").html(actions[i]);
                $actionList.append($actionItemContent);
            }

            //Append the action buttons into the popover
            $actionList.appendTo(popover.content);
        }());

        return $(popover);
    };

    // display the pop over element (init widget + position it + show it)
    //If target is already been clicked which would have added "is-selected" class to it.
    guidetouchlib.editLayer.dialogUtils.displayNonIconActionsPopOver = function ($popover, target) {
        if (target) {
            new CUI.Popover({
                element : $popover.insertAfter(target),
                pointAt : target
            }).show();
        }
    };

    function hideTitleExists(editable) {
        var authoringConfigJson = editable.dom.find("[data-guide-authoringconfigjson]").data("guide-authoringconfigjson");
        if (authoringConfigJson.hideTitle) {
            return true;
        }
        return false;
    }

    /* Sets the 'for' attribute on comoponent label to empty string("") before starting inplace editing,
     so that focus does not move out of editing if text cursor is moved by clicking somewhere on the text*/
    function modifyLabelBeforeInplaceEdit(editable) {
        var guideFieldLabel = editable.dom.find(".guideFieldLabel");
        if (guideFieldLabel.length > 0) {
            var label = guideFieldLabel.find("label");
            if (label.length > 0) {
                label[0].htmlFor = "";
            }
            guideFieldLabel.keydown(function (e) {
                if (e.key === "Enter" || e.which == 13) {
                    e.preventDefault();
                    this.blur();
                }
            });
        }
    }

    /**
     * @override
     */
    guidetouchlib.editToolbar.prototype.appendButton = function (editable, name, action) {

        if (name == "EDIT") {
            modifyLabelBeforeInplaceEdit(editable);
            if (hideTitleExists(editable) && editable.type !== "fd/afaddon/components/adobeSignBlock") {
                return; // Do not append Edit button (for inplace editing of title) if title is hidden.
            }
        }
        var button,
            localizedActionText = (action && action.text) ? CQ.I18n.get(action.text) : '';

        // stop in case a existing condition is invalid
        if (action.condition && !action.condition(editable)) {
            return;
        }

        // add button only if a handler is existing
        if (action.handler) {
            button = new Coral.Button().set({
                variant : 'quiet',
                title : localizedActionText,
                type : 'button'
            });

            button.setAttribute('data-action', name);
            button.setAttribute('data-path', editable.path);
            button.classList.add('cq-editable-action');
            button.classList.add('afActionCustomFont');
            button.classList.add('afMoreAction');

            /* Adding icons for custom actions here to avoid console errors in classic */
            if (!action.icon) {
                if (action.text === 'Edit') {
                    action.icon = 'coral-Icon--wrench';
                } else if (action.text === "Delete") {
                    action.icon = 'coral-Icon--delete';
                } else if (action.text === 'Edit Rules') {
                    action.icon = 'coral-Icon--bidRule';
                }
            }

            if (action.icon) {
                var icon = ns.ui.coralCompatibility.getIconAttribute(action.icon);
                button.setAttribute('icon', icon);
            } else {
                button.label.textContent = localizedActionText;
                button.classList.add('cq-EditableToolbar-text');
            }

            var button = button.$;

            // enable customizable rendering
            if (action.render) {
                action.render(button, editable).appendTo(this.dom);
            } else {
                if (action.icon) {
                    button.appendTo(this.dom);
                } else {
                    if (action.text != '' && action.text != undefined) {
                        _toShowInPopoverActionBar.push(button);
                    }
                }

            }

            button.on("click", function (e) {
                $('#afMoreActionsPopover').hide();
                $('.cq-select-parent.coral-Popover').hide();
            });
            this._currentButtons[name] = button;
        }

        return button;
    };

    var _superEditToolbarRender = ns.edit.Toolbar.prototype.render;
    /**
     * @override
     */
    guidetouchlib.editToolbar.prototype.render = function (editable) {
        _toShowInPopoverActionBar = [];
        _superEditToolbarRender.apply(this, [editable]);
        var button,
            localizedMore = CQ.I18n.get('More');

        if (_toShowInPopoverActionBar.length > 0) {
            button = new Coral.Button().set({
                variant : 'quiet',
                title : localizedMore,
                type : 'button'
            });

            button.setAttribute('data-action', 'nonIconAction');
            button.setAttribute('data-path', editable.path);
            button.classList.add('cq-editable-action');
            button.classList.add('afCustomMoreActionsTouchButton');

            var icon = ns.ui.coralCompatibility.getIconAttribute('more');
            button.setAttribute('icon', icon);

            // appendButton the more button to the toolbar
            this.dom[0].appendChild(button);
        }
        return this;
    };

    guidetouchlib.editToolbar.editFunction = function (editable, param, target) {
        var $popOver = $("#afMoreActionsPopover");
        //note: Not used coral API here as an open popover is already marked for close
        //and API would always return false
        if (!$popOver.is(".is-open")) {
            var $popover = guidetouchlib.editLayer.dialogUtils.createNonIconActionsPopOver(_toShowInPopoverActionBar);
            guidetouchlib.editLayer.dialogUtils.displayNonIconActionsPopOver($popover, target);
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib, jQuery(document), this));
