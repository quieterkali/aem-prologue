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

;
(function ($, _, channel, ns, document, guidelib, guidetouchlib, undefined) {
    "use strict";
    var guideEditLayerDialogConstants = guidetouchlib.editLayer.dialogUtils.constants,
        guideEditLayerConstants = guidetouchlib.editLayer.constants,
        coralClassConstants = guidetouchlib.constants.coralclass,
        touchAuthoringAlertSelector = "." + guideEditLayerDialogConstants.TOUCH_AUTHORING_ALERT_CLASS,
        $sidePanelDialogContainer = null,
        dialogSubmitButtonDisableClass = 'disableAfTouchDialogSubmitButton',
        dialogSubmitButtonEnableClass = 'enableAfTouchDialogSubmitButton',
        dialogSubmitButtonIconDisableClass = 'disableAfCoralIconCheck',
        dialogSubmitButtonIconEnableClass = 'enableAfCoralIconCheck',
        mostRecentlyUsedProperty = null,

        getSidePanelDialogContainer = function () {
            var sidePanelSelector = guideEditLayerDialogConstants.TOUCH_SIDE_PANEL_SELECTOR;
            if (ns.DialogFrame.currentDialog && ns.DialogFrame.currentDialog.resourceType === guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef.resourceType) {
                sidePanelSelector = guideEditLayerDialogConstants.DOR_TOUCH_SIDE_PANEL_SELECTOR;
            }

            return $(sidePanelSelector);
        },

        getSidePanelEditableTabSelector = function () {
            var sidePanelEditableTabSelector = guideEditLayerConstants.SIDE_PANEL_EDIT_PROPERTIES_TAB_SELECTOR;
            if (ns.DialogFrame.currentDialog && ns.DialogFrame.currentDialog.resourceType === guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef.resourceType) {
                sidePanelEditableTabSelector = guideEditLayerConstants.DOR_SIDE_PANEL_EDIT_PROPERTIES_TAB_SELECTOR;
            }

            return sidePanelEditableTabSelector;
        },

    //Enable Submit Button whenever some field changed in the dialog.
        setCurrentDialogDirty = function () {
            if (!ns.DialogFrame.bIsCurrentDialogDirty) {
                ns.DialogFrame.bIsCurrentDialogDirty = true;
                var $sidePanelDialogContainer = getSidePanelDialogContainer(),
                    $dialogHeader = $sidePanelDialogContainer.find(".cq-dialog-header"),
                    $dialogSubmitButton = $dialogHeader.find('.cq-dialog-submit'),
                    $dialogSubmitButtonIcon = $dialogSubmitButton.find("i");
                $dialogSubmitButton.removeClass(dialogSubmitButtonDisableClass)
                    .addClass(dialogSubmitButtonEnableClass)
                    .removeAttr("disabled"); //disable the disable state of button.
                $dialogSubmitButtonIcon.removeClass(dialogSubmitButtonIconDisableClass)
                    .addClass(dialogSubmitButtonIconEnableClass);
            }
        },

    //Disable Submit Button whenever dialog is same as the server copy.
        unSetCurrentDialogDirty = function () {
            ns.DialogFrame.bIsCurrentDialogDirty = false;
            var $sidePanelDialogContainer = getSidePanelDialogContainer(),
                $dialogHeader = $sidePanelDialogContainer.find(".cq-dialog-header"),
                $dialogSubmitButton = $dialogHeader.find('.cq-dialog-submit'),
                $dialogSubmitButtonIcon = $dialogSubmitButton.find("i");
            $dialogSubmitButton.removeClass(dialogSubmitButtonEnableClass)
                .addClass(dialogSubmitButtonDisableClass)
                .attr("disabled", ""); //enable the disable state of button.
            $dialogSubmitButtonIcon.removeClass(dialogSubmitButtonIconEnableClass)
                .addClass(dialogSubmitButtonIconDisableClass);
        },

    // check for any changes
        checkForAnyChangesInDialog = function ($dialog) {
            // Detect if any change on the coral form field elements
            // In case of change we show the cross and cancel button
            $dialog.find("input,select,textarea,button,coral-fileupload," + coralClassConstants.CORAL_RICH_TEXT).each(function () {
                getSidePanelDialogContainer().on("change input paste selected", this, function () {
                    setCurrentDialogDirty();
                });
            });

            //Detecting on change event for all coral form fields to show cancel, submit button
            $dialog.find(coralClassConstants.CORAL_FORM_FIELD).filter(function () {
                $(this).on("change", function () {
                    setCurrentDialogDirty();
                });
            });

        };

    ns.DialogFrame.showHideDialogHeaderContents = function (bShowDialogWarning) {
        // Check if side panel is closed is yes then open it
        if (!ns.ui.SidePanel.isOpened()) {
            // Open the side panel
            ns.ui.SidePanel.open();
        }
        $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find(getSidePanelEditableTabSelector()).click();

        // Add the coral content
        var dialogSaveNotice = ('<coral-alert variant="warning" class="' + guideEditLayerDialogConstants.TOUCH_AUTHORING_ALERT_CLASS + ' ' + guideEditLayerDialogConstants.TOUCH_AUTHORING_HIDE_ALERT_CLASS + '  coral3-Alert coral3-Alert--warning coral3-Alert--small guidePropertiesAlert">' +
                '<coral-alert-content class="coral3-Alert-content">' + Granite.I18n.get(guideEditLayerDialogConstants.PROPERTIES_WARNING_MESSAGE) + '</coral-alert-content>' +
                '</coral-alert>'),
            $sidePanelDialogContainer = getSidePanelDialogContainer(),
            $dialogHeader = $sidePanelDialogContainer.find(".cq-dialog-header");
        if ($dialogHeader.find("coral-alert").length === 0) {
            $dialogHeader.append($(dialogSaveNotice));
        }
        if (bShowDialogWarning) {
            var touchAuthoringHideAlertClass = guideEditLayerDialogConstants.TOUCH_AUTHORING_HIDE_ALERT_CLASS;
            $(touchAuthoringAlertSelector).removeClass(touchAuthoringHideAlertClass).fadeTo(600, 1).delay(3000).fadeTo(600, 0, function () {
                $(this).addClass(touchAuthoringHideAlertClass);
            });
        }
    };

    var dialogFrameLoaders = _.extend(ns.DialogFrame.loader, {
            /**
             * Defines the side panel loader of properties dialog for forms editor
             * @param src
             * @param currentDialog
             *
             * @todo: Fix the horizontal scroll bar issue due to width computation
             */
            sidePanel : function (src, currentDialog) {
                // Client Config is source of truth, never rely on "server configs" in case of dialog
                // hence using the getConfig method here
                var cfg = currentDialog.getConfig(),
                    loadingMode = cfg && cfg.loadingMode;
                // There are some dialogs in this loader which we do not honor
                // as of today this loader is used only in forms/template editor
                // These dialogs are the one which are not associated with any editable like page properties dialog
                // and Classic Dialogs
                if (ns.DialogFrame.currentDialog.editable == null || loadingMode === "inline") {
                    // in case of no editable associated with dialog, lets fallback to the auto loader
                    // for example: Page Properties dialog
                    /* loading mode "inline" check is to handle cases where there is no touch UI Dialogs available */
                    ns.DialogFrame.loader[loadingMode](src, currentDialog);
                } else {
                    // if the device is an ipad, let's launch it to new page mode
                    if (!ns.device.isDesktop() || ns.device.isIpad) {
                        this.newpage(src, currentDialog);
                        return;
                    }

                    // Check if side panel opened, is yes, don't do anything
                    if (!ns.ui.SidePanel.isOpened()) {
                        // Open the side panel
                        ns.ui.SidePanel.open();
                    }
                    // set the focus to the "properties" tab
                    $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find(getSidePanelEditableTabSelector()).click();
                    // Block the history
                    ns.history.Manager.setBlocked(true);
                    // todo: ASK XD and clean this line of code later
                    $(window).trigger('loading-show');
                    $.ajax({
                        url : src,
                        type : "get",
                        data : currentDialog.getRequestData()
                    }).always(function () {
                            $(window).trigger('loading-hide');
                        }).done(function (html) {
                            // Fetch the dialog html
                            var parser = $(window).adaptTo("foundation-util-htmlparser");
                            parser.parse(html, true).then(function (dialogHtml) {
                                var $dialog = $(dialogHtml).find('form.cq-dialog');
                                prepareSidePanel($dialog);
                                unSetCurrentDialogDirty();
                            });
                        });
                }
            }
        }),

    //Method to handle close of dialog
        closeDialogHandler = function (isPanelChanged) {
            guidetouchlib.utils.removeCurrentPlaceholderOverlay(ns.DialogFrame.pathOfCurrentDialogEditable);
            ns.DialogFrame.clearDialog();
        },

    //Method to handle preperation of side panel contents
        prepareSidePanel = function ($dialog) {
            var $sidePanelDialogContainer = getSidePanelDialogContainer(),
                $dialogHeader = $dialog.find(".cq-dialog-header");

            if (ns.DialogFrame.currentDialog.resourceType == null) {
                //remove current placeholder Overlay.
                guidetouchlib.utils.removeCurrentPlaceholderOverlay(ns.DialogFrame.pathOfCurrentDialogEditable);
                //update the path of current Dialog Editable.
                ns.DialogFrame.pathOfCurrentDialogEditable = ns.DialogFrame.currentDialog.editable.path;
                //Add placeholder overlay for new editable
                guidetouchlib.utils.createPlaceholderOverlay(ns.DialogFrame.pathOfCurrentDialogEditable, true);

                var currentDialogEditable = ns.editables.find(ns.DialogFrame.pathOfCurrentDialogEditable)[0],
                    currentDialogEditableName = Granite.author.edit.actions.getEditableDisplayableName(currentDialogEditable),
                    editableHeadingHtml = "<h3 class='coral-Heading coral-Heading--3 currentDialogEditableHeading'>" + CQ.I18n.getVar(currentDialogEditableName) + "</h3>";

                $dialogHeader.after(editableHeadingHtml);
            }

            savePropertySheetState(); // Save the property state as last open property, before emptying the container.
            // Empty the current dialog container
            $sidePanelDialogContainer.empty();
            // lets remove the full screen class and add guide dialog specific class
            //todo: remove cq-dialog for now, since focus on dialog listener depends on this
            $dialog.removeClass("cq-dialog-fullscreen");
            $dialog.addClass("guide-dialog");
            $dialog.addClass("coral-Form--vertical");

            checkForAnyChangesInDialog($dialog);
            $dialogHeader.find(guideEditLayerDialogConstants.HELP_CLASS_SELECTOR).addClass('afHidden');
            $dialogHeader.find('.cq-dialog-cancel').addClass('afTouchDialogCancelButton');
            $dialogHeader.find('button.afTouchDialogCancelButton>coral-icon').addClass('afCoralIconClose');
            $dialog.appendTo($sidePanelDialogContainer);
            $dialog.find("coral-tab").eq(0).attr("selected", "");
            $dialog.find("coral-panel").eq(0).attr("selected", "");

            // todo: have to think of a better method ?
            // Trigger the coral content loaded event
            $dialog.trigger('foundation-contentloaded');
            // note: no need to trigger the dialog-ready event as not required for side panel loader
            // if there are tabs inside side panel it should have sidepanel-tab as a classname hence adding it
            // this dependency is added, since the side panel core library has a dependency on this class
            // note: this code has to be removed later, once it is fixed in core editor
            var $dialogTabs = $dialog.find(coralClassConstants.CORAL_TABPANEL_NAVIGATION + " a");
            if ($dialogTabs.length > 0) {
                $dialogTabs.each(function () {
                    var $tabPanel = $(this).closest(coralClassConstants.CORAL_TABPANEL),
                        $tab = $tabPanel.find("#" + $(this).attr('aria-controls'));
                    $tab.addClass("sidepanel-tab-guideProperties");
                });
            }
            loadPropertySheetState();
        },

        /* Method to save the state of the property sheet i.e the property that is open when a dialog is closed or when a new dialog is opened. */
        savePropertySheetState = function () {
            var $propertySheet =  getSidePanelDialogContainer().find(guideEditLayerDialogConstants.PROPERTYSHEET_SELECTOR);
            if ($propertySheet.length != 0 && $propertySheet[0].selectedItem) {
                mostRecentlyUsedProperty = $propertySheet[0].selectedItem.label.textContent;
            }
        },

        /*  Method to load the state of the property sheet i.e the property that was open in the previous dialog.  */
        loadPropertySheetState = function () {
            var $propertySheet = getSidePanelDialogContainer().find(guideEditLayerDialogConstants.PROPERTYSHEET_SELECTOR);
            if ($propertySheet.length != 0) {
                var properties = $propertySheet[0].items.getAll();
                properties.forEach(function (element, index, array) {
                    if (element.label && element.label.textContent) {
                        if (element.label.textContent === mostRecentlyUsedProperty) {
                            element.selected = true;
                        }
                    }
                });
            }
        };

    var _superOpenDialog = ns.DialogFrame.openDialog;
    ns.DialogFrame.openDialog = function (dialog) {
        var isDesignDialog = ns.design ? dialog instanceof ns.design.Dialog : false,
            oldLoadingMode,
            retVal;
        // if open is clicked on same dialog again, don't do anything
        if (ns.DialogFrame.currentDialog && ns.DialogFrame.currentDialog.editable && dialog.editable && (dialog.editable.path == ns.DialogFrame.currentDialog.editable.path)) {
            return;
        }
        if (this.dialogMode === "sidePanel" && !isDesignDialog) {
            // since we open only those dialogs which have editable in side panel
            if (dialog.editable != null) {
                // if loading mode is side panel, only then open the properties dialog of side panel
                $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find(getSidePanelEditableTabSelector()).click();
            }
            // Check if current dialog is dirty, if yes
            if (!!this.currentDialog) {
                if (this.bIsCurrentDialogDirty) {
                    ns.DialogFrame.showHideDialogHeaderContents(this.currentDialog, true, true);
                } else {
                    // reset the current dialog, since the dialog is not dirty
                    // lets invoke the next dialog
                    this.currentDialog = null;
                }
            }
        }
        // we support undo only for dialogs which have editable(not for page dialog's for example)
        // todo: have to add support for other dialogs
        if (dialog.editable && dialog.resourceType == null) {
            ns.DialogFrame.oldDialogJson = CQ.shared.HTTP.get(dialog.editable.path + ".json").responseText;
        }
        // note: adding check here is not permitted, it has to be approved
        if (isDesignDialog) {
            oldLoadingMode = ns.DialogFrame.dialogMode;
            // let's use the default loading mode for design dialog
            // this is done to support mixed mode of dialogs in template editor
            ns.DialogFrame.dialogMode = null;
        }
        retVal = _superOpenDialog.apply(this, [dialog]);
        if (isDesignDialog) {
            // reset the loading mode back
            ns.DialogFrame.dialogMode = oldLoadingMode;
        }
        return retVal;
    };

    /*
     * Function to add initial empty content in the dialog panel
     */
    ns.DialogFrame.addEmptyDialogMessage = function () {
        var $sidePanelDialogContainer = getSidePanelDialogContainer();
        var messageForGuidePropertiesDialog = "<div class='empty-message' >" + Granite.I18n.get("Press") +
            '<coral-icon icon="wrench" size="XS"></coral-icon>' +
            Granite.I18n.get("on a component's action bar to see its properties.") + "</div>",
            messageForDoRPropertiesDialog = "<div class='empty-message' >" + Granite.I18n.get("Press") +
                '<coral-icon icon="filePDF" size="XS"></coral-icon>' +
                Granite.I18n.get("to configure document of record.") + "</div>",
            message = messageForGuidePropertiesDialog;

        if (ns.DialogFrame.currentDialog && ns.DialogFrame.currentDialog.resourceType === guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef.resourceType) {
            message = messageForDoRPropertiesDialog;
        }

        $sidePanelDialogContainer.empty();
        $sidePanelDialogContainer.append(message);
    };

    /*  Function which clears all fields when dialog closes either by
     *  close button or component moved in different panel.
     */
    ns.DialogFrame.clearDialog = function () {
        //Using origional dialog to replace modified dialog on click of cancel/close button
        var $touchAuthoringAlertComponentChange = $(touchAuthoringAlertSelector);
        //This is done to remove alert as submit is clicked.Css Property opacity is explicitly used as fadeTo end with opacity 1.
        $touchAuthoringAlertComponentChange.stop(true, true).addClass(guideEditLayerDialogConstants.TOUCH_AUTHORING_HIDE_ALERT_CLASS).css("opacity", "0");
        var $sidePanelDialogContainer = getSidePanelDialogContainer();
        $sidePanelDialogContainer.empty();
        unSetCurrentDialogDirty();
        ns.DialogFrame.addEmptyDialogMessage();
        ns.DialogFrame.currentDialog = null;
        ns.DialogFrame.pathOfCurrentDialogEditable = null;
    };

    /**
     * Overriding the onSuccess of Dialog
     * @type {Function}
     * @private
     * @todo: This override has to be removed, ideally, all AF dialogs should have their own success handler
     */
    var _superDialogSuccess = ns.edit.Dialog.prototype.onSuccess;
    ns.edit.Dialog.prototype.onSuccess = function (currentDialog, currentFloatingDialog) {
        guidetouchlib.utils.onDialogSuccess(currentDialog, currentFloatingDialog);
    };

    /**
     * Utility API to perform some set of operations once the dialog is saved.
     * This is used across form editors(which include template)
     * @param currentDialog             Path of current dialog
     * @param currentFloatingDialog     Path of current floating dialog if any
     */
    guidetouchlib.utils.onDialogSuccess = function (currentDialog, currentFloatingDialog) {
        if (ns.DialogFrame.pathOfCurrentDialogEditable) {
            var editable = ns.editables.find(ns.DialogFrame.pathOfCurrentDialogEditable)[0];
            if (editable) {
                var self = this;
                var properties = {};

                if (currentFloatingDialog) {
                    var propertiesArray = currentFloatingDialog.serializeArray();

                    propertiesArray.forEach(function (propertyNameValue) {
                        properties[propertyNameValue.name] = propertyNameValue.value;
                    });
                } else {
                    // CQ-75906: not fully impl. for compatibility dialogs
                }

                // CQ-75906: "cq-persistence-before-update" not impl. yet
                channel.trigger("cq-persistence-after-update", [editable, properties]);

                // refresh the editable and recreate its overlay
                editable.refresh().done(function () {
                    ns.selection.select(editable);
                    // todo: this has to be removed later
                    // if editable is guide container, in that case refresh is called multiple times
                    editable.afterEdit();
                    /* update the title of the dialog because that might have changed now*/
                    getSidePanelDialogContainer().find(".currentDialogEditableHeading")[0].innerHTML =
                        ns.edit.actions.getEditableDisplayableName(editable);

                    var editableParent = ns.editables.getParent(editable);
                    editableParent && editableParent.afterChildEdit(editable);
                });
                // reset the dirty state
                unSetCurrentDialogDirty();
                //Registering undo for editing dialog.
                ns.DialogFrame.undoAction(editable);
            } else {
                ns.DialogFrame.clearDialog();
            }
        } else if (ns.DialogFrame.currentDialog && ns.DialogFrame.currentDialog.resourceType === guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef.resourceType) {
            unSetCurrentDialogDirty();
        }
    };

    /* This will be called after the dialog form is submitted*/
    //channel.on('dialog-success.dialogframe', handleDialogSuccess);
    channel.off("foundation-form-submitted");
    channel.on("foundation-form-submitted", "form.foundation-form.cq-dialog", function (e, status, xhr) {
        var $touchAuthoringAlertComponentChange = $(touchAuthoringAlertSelector),
            $dialog = $(e.target).closest(".guide-dialog");
        //This is done to remove alert as submit is clicked.Css Property opacity is explicitly used as fadeTo end with opacity 1.
        $touchAuthoringAlertComponentChange.stop(true, true).addClass(guideEditLayerDialogConstants.TOUCH_AUTHORING_HIDE_ALERT_CLASS).css("opacity", "0");
        if (status === true) {
            channel.trigger("dialog-success");
            // Custom granite component selector for post process of submit
            // this should be done after refresh of editable else, the async call would result in browser errors
            // say, we delete a file, then on submit editable may get refreshed after file is deleted but before updating the
            // options
            var CUSTOM_GRANITE_COMPONENT_SELECTORS = [
                ".fdImageUploadGroup"
            ];
            _.each(CUSTOM_GRANITE_COMPONENT_SELECTORS, function (item) {
                var items = $dialog.find(item),
                    length = items.length,
                    deferredItems = [],
                    // handler for firing fdSubmitProcessing event for image upload
                    // pass deferred object for firing next upload request in queue
                    // upon resolving passed deferred object next upload request is fired
                    triggerHandler = function (i, deferredObj) {
                        if (i < length) {
                            $(items[i]).trigger("fdSubmitProcessing", {'deferred' : deferredObj});
                        }
                    };

                // create deferred objects for upload requests
                for (var i = 0; i < length; i++) {
                    deferredItems[i] = $.Deferred();
                }

                // sequential firing of upload request
                // upload request is fired only if previous request has been completed
                for (var i = 0; i < length; i++) {
                    deferredItems[i].done(function (index) {
                        return function () {
                            triggerHandler(index, deferredItems[index + 1]);
                        };
                    }(i));
                }

                // fire first upload request
                if (length > 0) {
                    deferredItems[0].resolve();
                }
            });
            $dialog.find(".imageUploadWithTextWrapperClass").find("coral-multifield").trigger("fdSubmitProcessing");
            //Trigger Image Upload component post processing
            $('.fdImageUploadGroup').trigger("fdImageUploadPostProcessing");
        } else {
            $(document).trigger("dialog-fail", xhr);
        }
    });

    /**
     * Registering for undo action on Edit dialog action.
     * @param editable The dialog of the respective dialog.
     */
    ns.DialogFrame.undoAction = function (editable) {
        var editablePath = editable.path,
            oldDialogJson = ns.DialogFrame.oldDialogJson,
            newDialogJson = CQ.shared.HTTP.get(editablePath + ".json").responseText;
        var p = {};
        p[Granite.Sling.ORDER] = guidelib.author.AuthorUtils.INSERT_AFTER + " ";
        if (newDialogJson && oldDialogJson) {
            var historyEnabled = ns.history.Manager.isEnabled(),
                historyConfig = ns.history.Manager,
                historyStep = ns.history.util.Utils.beginStep(),
                historyAction = new ns.history.actions.fd.EditDialog(editablePath, editablePath, editable.type, {
                    "path" : editablePath,
                    "oldDialogJson" : JSON.parse(oldDialogJson),
                    "newDialogJson" : JSON.parse(newDialogJson)});
            historyStep.addAction(historyAction);
            historyStep.commit();
        }
    };

    $(document).on("click", ".cq-dialog-cancel", function (e) {
        if ($(e.target).closest(".cq-dialog").hasClass("guide-dialog")) {
            savePropertySheetState();    // Save the property state before closing the dialog.
            e.preventDefault();
            e.stopImmediatePropagation();
            // reset the dirty state
            closeDialogHandler();
        } else {
            // Case of independent dialog
        }
    });

}(jQuery, _, jQuery(document), Granite.author, document, window.guidelib, window.guidelib.touchlib, this));
