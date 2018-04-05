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
(function ($, ns, guidetouchlib, channel, window, undefined) {
    var getFormPath = function (contentPath) {
            return contentPath.replace(Granite.HTTP.getContextPath(), "");
        },

        options = {
            getPath : function () {
                return "/mnt/override/libs/" +
                    guidetouchlib.editLayer.dialogUtils.constants.DOR_PROPERTIES_COMPONENT_RELATIVE_PATH +
                    "/cq:dialog.html" + getFormPath(ns.ContentFrame.getContentPath()) +
                    guidetouchlib.editLayer.dialogUtils.constants.PRINT_NODE_RELATIVE_PATH;
            }
        };

    var dorPropertiesDialogConfig = function () {
        return {
            src : options.getPath() + '?resourceType=' + encodeURIComponent(guidetouchlib.editLayer.dialogUtils.constants.DOR_PROPERTIES_COMPONENT_RELATIVE_PATH),
            isFloating : false,
            loadingMode : "sidePanel",
            layout : "auto"
        };
    };

    var dorPropertiesDialogDef =  {
        getConfig : function getConfig() {
            return dorPropertiesDialogConfig();
        },

        getRequestedData : function getRequestedData() {
            return {
                resourceType : guidetouchlib.editLayer.dialogUtils.constants.DOR_PROPERTIES_COMPONENT_RELATIVE_PATH
            };
        },

        onOpen : ns.DialogFrame.openDialog,

        onReady : function onReady() {

        },

        onFocus : function onFocus() {

        },

        onSuccess : guidetouchlib.utils.onDialogSuccess,

        onClose : ns.DialogFrame.clearDialog,

        resourceType : "fd/af/authoring/components/dor/dorProperties"
    };

    guidetouchlib.editLayer.dialogUtils.dorPropertiesDialogDef = dorPropertiesDialogDef;
}(jQuery, Granite.author, window.guidelib.touchlib, jQuery(document), this));

