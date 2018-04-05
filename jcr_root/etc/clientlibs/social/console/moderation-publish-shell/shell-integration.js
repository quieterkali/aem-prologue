/*
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
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/*
 * location: /etc/clientlibs/social/console/moderation-publish-shell/shell-integration.js
 * category: [cq.social.console.moderation-publish-shell]
 */
(function($) {
    "use strict";

    $(function() {
        // Disable the "Adobe Experience Manager" button while performing moderation functions on Publish.
        $("a.coral-Shell-homeAnchor").css('cursor', 'default').click(function(e) {
            e.preventDefault();
            return false;
        });
    });
})($);
