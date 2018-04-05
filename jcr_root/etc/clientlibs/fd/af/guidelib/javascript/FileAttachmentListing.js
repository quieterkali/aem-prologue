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

/**
 * Created with IntelliJ IDEA.
 * User: rismehta
 * Date: 1/15/14
 * Time: 5:49 PM
 * To change this template use File | Settings | File Templates.
 */

/*anonymous function to handle show of file list view */
(function ($, guidelib) {

    // Was causing problem in IE9
    // hence have added timeout to ensure that once button is rendered, event handler is registered
    // todo: may have to think of better namespace ?
    guidelib.intervals = guidelib.intervals || {};
    guidelib.intervals.intId = setInterval(function () {
        if ($("div.fileattachmentlisting button[data-guide-fileListing]").length > 0) {
            clearInterval(guidelib.intervals.intId);
            $("div.fileattachmentlisting button[data-guide-fileListing]").click(function () {
                // added because in mobile devices it was causing problem of backdrop
                $("#fileAttachment").appendTo('body');
                $("#fileAttachment").modal("show");
            });
        }
    }, 1000);
}($, guidelib));
