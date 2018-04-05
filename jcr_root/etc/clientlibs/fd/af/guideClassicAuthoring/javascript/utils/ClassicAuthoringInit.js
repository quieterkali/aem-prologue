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
(function (window, $, guidelib) {
    var topWindow = window.CQ.WCM.getTopWindow();
    $(function () {
        guidelib.author.ClassicAuthorUtils.loadContentFinderTree("guideDataModel", "guideDataModelTabLoaded");
    });

    //Force reload/page refresh on preview click via sidekick.previewReload once sidekick is ready
    $(function () {
        if (CQ && CQ.undo && CQ.undo.UndoManager && _.isFunction(CQ.undo.UndoManager.setEnabled)) {
            CQ.undo.UndoManager.setEnabled(false);
            if (_.isObject(console) && _.isFunction(console.info)) {
                console.info("Disabled undo operations");
            }
        } else {
            if (_.isObject(console) && _.isFunction(console.info)) {
                console.info("Unable to disable undo operations");
            }
        }
        if (topWindow.CQ.WCM.isSidekickReady()) {
            topWindow.CQ.WCM.getSidekick().previewReload = true;
        } else {
            topWindow.CQ.WCM.on("sidekickready", function (sidekick) {
                sidekick.previewReload = true;
            });
        }
    });

})(window, window.jQuery, guidelib);
