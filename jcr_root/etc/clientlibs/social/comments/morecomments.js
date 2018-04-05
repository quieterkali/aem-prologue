/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
 * location: /etc/clientlibs/social/commons/comments
 * category: [cq.social.edit_comments]
 */
(function(CQ, $CQ) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.commons = CQ.soco.commons || {};
    CQ.soco.commons.comments = CQ.soco.commons.comments || {};
    CQ.soco.commons.comments.editAttachments = CQ.soco.commons.comments.editAttachments || {};
    var localEvents = {};
    localEvents.CLEAR = "lcl.cq.soco.events.clear";

    //Method called from /libs/social/commons/components/form/editattachments/editAttachments.jsp
    CQ.soco.commons.comments.editAttachments.deleteAttachments = function(selector, paramName, paramValue) {
        //$CQ(selector).hide(); //Should be disabled css
        if ($CQ(selector + '-cancel').is(':visible') && paramName) {
            return;
        }
        var form = $CQ(selector).closest("form")[0];
        var inputElementId = $CQ(selector).attr('id') + "-inputElementId";
        if (form) {
            if ($CQ(selector + '-delete').hasClass('disabled-link') && !paramName) {
                $CQ('#' + inputElementId).remove();
                $CQ(selector + '-delete').removeClass('disabled-link').unbind('click');
                $CQ(selector + '-download').removeClass('disabled-link').unbind('click');
            } else {
                $CQ('<input>').attr({
                    type: 'hidden',
                    name: paramName,
                    id: inputElementId,
                    value: paramValue
                }).appendTo(form);
                $CQ(selector + '-delete').addClass('disabled-link').click(function(e) {
                    e.preventDefault();
                    return false;
                });
                $CQ(selector + '-download').addClass('disabled-link').click(function(e) {
                    e.preventDefault();
                    return false;
                });
            }
        }
        $CQ(selector + '-cancel').toggle();
    };
})(CQ, $CQ);
