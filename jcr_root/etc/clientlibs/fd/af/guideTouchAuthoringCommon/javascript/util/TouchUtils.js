// jscs:disable requireDotNotation
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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

    var BLACK_LISTED_EDITABLE_TYPE = ["fd/af/layouts/gridFluidLayout"],
        BLACK_LISTED_EDITABLE_CSP_TYPE = ["gridFluidLayout"],
        guideTouchLibConstants = guidetouchlib.constants,
    // Adding any composite type in AF should result in change over here
        COMPOSITE_FORM_OBJECTS = ["fd/af/components/guidefileupload", "fd/af/components/guidetermsandconditions"],
        TABLE_FORM_OBJECTS = [guideTouchLibConstants.GUIDE_TABLE_RESOURCE_TYPE,
            guideTouchLibConstants.GUIDE_TABLE_HEADER_RESOURCE_TYPE,
            guideTouchLibConstants.GUIDE_TABLE_ROW_RESOURCE_TYPE];

    /*
     * check if it is IE browser.
     */
    guidetouchlib.utils.isIE = function () {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {  //if Internet Explorer return true
            return true;
        } else {                 // If another browser, return false
            return false;
        }
    };

    guidetouchlib.utils._updateQueryStringParameter = function (uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    };

    /**
     * Utility method to check if page is an adaptive form
     * @todo: This has to be removed once the touch team fixes this issue
     */
    guidetouchlib.utils._isPageAdaptiveForm = function () {
        // asking author first, sometimes author is not initialized, hence using the current window locaton path
        var path = guidetouchlib._currentPagePath || window.location.pathname;
        // Check the page configuration from author
        if (path.indexOf(guidetouchlib.constants.AF_PREFIX_PATH) !== -1) {
            return true;
        } else {
            return false;
        }
    };
    guidetouchlib.utils._refreshAdaptiveForm = function (bEditMode) {
        var url = window._afAuthorHook._getAfWindow().location.href;
        url = guidetouchlib.utils._updateQueryStringParameter(url, "editmode", bEditMode.toString());
        window._afAuthorHook._getAfWindow().location.href = url;
    };

    guidetouchlib.utils._checkIfEditableBlackListed = function (editable) {
        return typeof _.find(BLACK_LISTED_EDITABLE_TYPE, function (blackListEditableType) {
            return blackListEditableType === editable.config.type;
        }) !== "undefined" || typeof _.find(BLACK_LISTED_EDITABLE_CSP_TYPE, function (blackListEditableCspType) {
            var searchExpr = editable.config.csp;
            if (searchExpr != null) {
                return (searchExpr.lastIndexOf(blackListEditableCspType) !== -1) && (searchExpr.lastIndexOf(blackListEditableCspType) === searchExpr.length - blackListEditableCspType.length);
            } else {
                return false;
            }
        }) !== "undefined";
    };

    guidetouchlib.utils._updateEditorWindowAboutAFChange = function (bDeSelectEditables) {
        // generally de select editables is set true when switching tabs in case of navigable layouts present in AF
        if (bDeSelectEditables) {
            // Now let's de-active all the current selection
            author.selection.deselectAll();
            // De activate  the current
            author.selection.deactivateCurrent();
            // Let's remove the is-hover class on editables
            // todo: this has to be change, have to relook at the selection module and toolbar position
            $("#OverlayWrapper").find("*").removeClass("is-hover");
        }
        // Let's reposition the overlay since there are changes in content frame
        // let trigger the content frame layout change event
        channel.trigger("cq-contentframe-layout-change");
        //window.parent.Granite.author.overlayManager.reposition(true);
    };

    /**
     * Function to copy value to clipboard
     * As of today it is used to copy som expression
     * @todo: Have to add check to make this work in Safari ?
     * @param value
     */
    guidetouchlib.utils.copyToClipboard = function (value) {
        var $temp = $("<input>");
        $('body').append($temp);
        // lets use the select dom API, select() of jquery has been overridden by CORAL widgets
        $temp.val(value)[0].select();
        document.execCommand("copy");
        $temp.remove();
    };

    guidetouchlib.utils.openIndependentDialog = function (dialog) {
        var cfg = dialog.getConfig();
        author.DialogFrame.loader["auto"](cfg.src, dialog);
        // todo: get the dialog handler and set focus to first tab
    };

    guidetouchlib.utils.closeIndependentDialog = function () {
        $(".cq-dialog:not('.guide-dialog') .cq-dialog-cancel").click();
    };

    guidetouchlib.utils.setFocusOnWidget = function (id) {
        Granite.author.overlayManager.reposition(true);
        var afwindow = window._afAuthorHook._getAfWindow();
        var widget = afwindow.$("#" + id).find("input,select,textarea,button")[0];

        if (widget) {
            widget.focus();
        } else {
            afwindow.$("#" + id).focus();
        }
    };

    guidetouchlib.utils.setFocusInsideAFWindow = function (id) {
        var afwindow = window._afAuthorHook._getAfWindow();
        guidelib.author.AuthorUtils.setAuthoringFocus(id, afwindow.document);
        guidetouchlib.utils.setFocusOnWidget(id);
    };

    /* This function calles setAuthoringFocus for the parentid and set focus on id
     * We used to set focus on toolbar and toolbar buttons
     * */
    guidetouchlib.utils.setFocusOnParentInsideAFWindow = function (id, parentid) {
        var afwindow = window._afAuthorHook._getAfWindow();
        guidelib.author.AuthorUtils.setAuthoringFocus(parentid, afwindow.document);
        guidetouchlib.utils.setFocusOnWidget(id);
    };

    guidetouchlib.utils.insideToolbar = function (editable) {
        if (editable.type === 'fd/af/components/toolbar') {
            return editable;
        } else if (author.editables.getParent(editable)) {
            var parent = author.editables.getParent(editable); // items node
            if (parent) {
                parent = author.editables.getParent(parent);
            }
            if (parent && parent.type === "fd/af/components/toolbar") {
                return parent;
            }
        }
    };

    guidetouchlib.utils._setUpFormEditor = function () {
        // On set-up initialize the AF authoring specific things
        // All the AF Listeners are present in guidelib.touchlib.initializers
        _.each(_.keys(guidetouchlib.initializers), function (key) {
            // call the setUp method here
            if (key != null) {
                var setUp = guidetouchlib.initializers[key].setUp;
                if (_.isFunction(setUp)) {
                    // pass the current edit layer as context to setup method
                    setUp.apply(this);
                }
            }
        });
    };

    guidetouchlib.utils._destroyFormEditor = function () {
        // Destroy the authoring specific things
        // All the AF Listeners are present in guidelib.touchlib.initializers
        _.each(_.keys(guidetouchlib.initializers), function (key) {
            // call the setUp method here
            if (key != null) {
                var destroy = guidetouchlib.initializers[key].destroy;
                // pass the current edit layer as context to setup method
                if (_.isFunction(destroy)) {
                    destroy.apply(this);
                }
            }
        });
    };

    guidetouchlib.utils.refreshOverlay = function () {
        Granite.author.overlayManager.teardown();
        Granite.author.overlayManager.setup();
        Granite.author.overlayManager.reposition(true);
    };

    //remove the current placeholder overlay.
    guidetouchlib.utils.removeCurrentPlaceholderOverlay = function (pathOfCurrentDialogEditable) {
        if (pathOfCurrentDialogEditable) {
            var guideEditConfigListeners = window.guidelib.author.editConfigListeners,
                guideEditLayerConstants = guidetouchlib.editLayer.constants,
                guideEditLayerDialogConstants = guidetouchlib.editLayer.dialogUtils.constants,
                $editable = author.editables.find(pathOfCurrentDialogEditable),
                $sidePanelDialogContainer = $(guideEditLayerDialogConstants.TOUCH_SIDE_PANEL_SELECTOR),
                $editableOverlay = $editable[0].overlay.dom,
                $currentPlaceholderOverlayButton = $editableOverlay.find(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_SELECTOR);
            $editableOverlay.removeClass(guideEditLayerConstants.PLACEHOLDER_OVERLAY_CLASS);
            $currentPlaceholderOverlayButton.remove();
        }
    };

    //Put the placeholder overlay over the editable.
    //isThisCurrentEditable flag tells if the configure action is just called for the editable and this would hide action bar. A button with blue background and white icon is shown for it
    //If this function is called after clicking any other overlay, isThisCurrentEditable would be false and for this case, the placeholder overlay's background needs to be set faded.
    guidetouchlib.utils.createPlaceholderOverlay = function (pathOfCurrentDialogEditable, isThisCurrentEditable) {
        if (pathOfCurrentDialogEditable) {
            var guideEditConfigListeners = window.guidelib.author.editConfigListeners,
                guideEditLayerConstants = guidetouchlib.editLayer.constants,
                guideEditLayerDialogConstants = guidetouchlib.editLayer.dialogUtils.constants,
                $editable = author.editables.find(pathOfCurrentDialogEditable),
                $sidePanelDialogContainer = $(guideEditLayerDialogConstants.TOUCH_SIDE_PANEL_SELECTOR),
                $editableOverlay = $editable[0].overlay.dom;
            if (!$editableOverlay.find(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_SELECTOR).length) {
                $editableOverlay.addClass(guideEditLayerConstants.PLACEHOLDER_OVERLAY_CLASS);
                var $placeholderOverlayButton = $(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_HTML),
                    $placeholderOverlay = $(guideEditLayerConstants.PLACEHOLDER_OVERLAY_SELECTOR),
                    placeholderOverlayButtonBottomPosition = $placeholderOverlay.offset().top,
                    placeholderOverlayButtonLeftPosition = $placeholderOverlay.offset().left;
                $editableOverlay.append($placeholderOverlayButton);
                var placeholderOverlayButtonHeight = $placeholderOverlayButton.outerHeight();
                $placeholderOverlayButton.offset(
                    {
                        top : placeholderOverlayButtonBottomPosition - placeholderOverlayButtonHeight,
                        left : placeholderOverlayButtonLeftPosition
                    }
                );
            }

            //Either overlay button would have been created in previous IF block or it would have been already present.
            // Adding .placeholderOverlayButton-current class dynamically based on the flag passed to this method.
            if ($editableOverlay.find(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_SELECTOR).length) {
                if (isThisCurrentEditable) {
                    $editableOverlay.find(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_SELECTOR).addClass(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_CURRENT_CLASS);
                } else {
                    $editableOverlay.find(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_SELECTOR).removeClass(guideEditLayerConstants.PLACEHOLDER_OVERLAY_BUTTON_CURRENT_CLASS);
                }
            }
        }
    };

    /**
     * When changing the WCMMode, the page has to be refreshed
     */
    channel.on("editor-frame-mode-changed", function (e) {
        window.location.reload();
        guidetouchlib._isReloadCalled = true;
    });

    guidetouchlib.utils._isCompositeFormObject = function (formObjectType) {
        return COMPOSITE_FORM_OBJECTS.indexOf(formObjectType) !== -1;
    };

    guidetouchlib.utils._isTableFormObject = function (formObjectType) {
        return TABLE_FORM_OBJECTS.indexOf(formObjectType) !== -1;
    };

    /**
     * Checks whether the provided editable is panel or rootPanel or toolbar.
     */
    guidetouchlib.utils.isContainer = function (editable) {
        if (guidetouchlib.utils.isEditableOfGivenType(editable, guidetouchlib.constants.PANEL_TYPE)
            || guidetouchlib.utils.isEditableOfGivenType(editable, guidetouchlib.constants.TOOLBAR_TYPE)
            || guidetouchlib.utils.isEditableOfGivenType(editable, guidetouchlib.constants.ROOT_PANEL_TYPE)) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Checks whether the given editable can be inserted in the toolbar
     */
    guidetouchlib.utils.isToolbarInsertionAllowed = function (toolbarEditable, editable) {
        var allowedComponents = author.components.computeAllowedComponents(toolbarEditable, author.pageDesign),
            component = author.components.find({resourceType : editable.type})[0],
            componentAbsolutePath = component.getPath(),
            componentRelativePath = componentAbsolutePath.replace(/^\/[a-z]+\//, ""),
            componentGroup = "group:" + component.getGroup();

        if (allowedComponents.indexOf(componentAbsolutePath) > -1
            || allowedComponents.indexOf(componentRelativePath) > -1
            || allowedComponents.indexOf(componentGroup) > -1) {
            return true;
        }
        return false;
    };

    /**
     * Checks whether the editable is of the given type
     */
    guidetouchlib.utils.isEditableOfGivenType = function (editable, editableType) {
        var tempArray = editableType.split("/"),
            editableCspType = tempArray[tempArray.length - 1],
            searchExpr = editable.config.csp,
            isEditableofGivenType = false;

        if (editable.config.type === editableType) {
            isEditableofGivenType = true;
        }
        if (searchExpr != null) {
            isEditableofGivenType = (searchExpr.lastIndexOf(editableCspType) !== -1) && (searchExpr.lastIndexOf(editableCspType) === searchExpr.length - editableCspType.length);
        }
        return isEditableofGivenType;
    };

}(window.guidelib.touchlib, window.Granite.author, jQuery(document)));
