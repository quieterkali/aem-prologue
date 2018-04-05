/*******************************************************************************
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
 *
 ******************************************************************************/

;
(function ($, _, channel, ns, document, guidelib, guidetouchlib, undefined) {
    var dorDialog = new ns.ui.Dialog(guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef);

    $(guidetouchlib.editLayer.constants.DOR_SIDE_PANEL_EDIT_PROPERTIES_TAB_SELECTOR).on("click", function loadPropertiesDialog() {
        // check if there are any errors in error tab
        var isSyncRequired = guidetouchlib.initializers.initializeErrorManager.isSyncRequired();
        if (isSyncRequired) {
            // open errors tab
            $("coral-tab[title='" + Granite.I18n.get("Errors") + "']").trigger('click');
            return false;
        } else {
            // open dialog to load content
            ns.DialogFrame.openDialog(function getDialog() {
                var editable = {
                    path : ns.ContentFrame.getContentPath().replace(Granite.HTTP.getContextPath(), "") + guidetouchlib.editLayer.dialogUtils.constants.PRINT_NODE_RELATIVE_PATH,
                    type : guidetouchlib.editLayer.dialogUtils.constants.DOR_PROPERTIES_COMPONENT_RELATIVE_PATH
                };
                dorDialog.editable = editable;
                return dorDialog;
            }());
        }
    });
}(jQuery, _, jQuery(document), Granite.author, document, window.guidelib, window.guidelib.touchlib, this));

