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
(function (guidetouchlib, author, channel, $) {
    var expEditorId = "af-expression-editor",
        expEditorClass = "coral--light",
        guideExpEditor = guidetouchlib.expEditor = {

            destroy : function () {
                // todo: is any other cleaning required
                // Let's clean the exp editor html on destroy
                $("#" + expEditorId).remove();
            }
        };

}(window.guidelib.touchlib, window.Granite.author, jQuery(document), window.Granite.$));
