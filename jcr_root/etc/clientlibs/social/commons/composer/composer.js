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
(function(CQ, $CQ) {
    CQ.soco = CQ.soco || {};
    CQ.soco.commons = CQ.soco.commons || {};
    CQ.soco.commons.composer = CQ.soco.commons.composer || {};

    CQ.soco.commons.composer.getFileInfo = function(form_div, fileInputId) {
        var textArea = $CQ(form_div).find("textarea.comment-text");
        var info = $CQ(form_div).find("#info")[0];
        var fileInput = $CQ(form_div).find("#" + fileInputId)[0];
        var file = fileInput.files[0];
        var toTextAreaMsg = "";
        if (file === undefined) {
            return;
        }
        if ('name' in file) {
            toTextAreaMsg += "[img]" + file.name + "[/img]";
        }
        if ('size' in file) {
            if (file.size > maxFileSize) {
                info.innerHTML = CQ.I18n.getMessage("File too big");
                fileInput.value = "";
                return;
            }
        }
        textArea.val(textArea.val() + toTextAreaMsg);
    };

    CQ.soco.commons.composer.urlFile = function(form_div) {
        var textArea = $CQ(form_div).find("textarea.comment-text");
        var text = '[img]' + $CQ(form_div).find("#furl").val() + '[/img]';
        textArea.val(textArea.val() + text);
        $CQ(form_div).find('#fupload_div').hide();
    };

    CQ.soco.commons.composer.addFileField = function(form_div) {
        var fileFieldCount = $CQ(form_div).find('input[name="file"]').size();
        fileFieldCount++;
        if (fileFieldCount > 10) {
            return;
        }
        var f = document.createElement("input");
        f.type = "file";
        f.name = "file";
        f.size = 60;
        f.id = 'fileInput' + fileFieldCount;
        f.accept = "image/*";

        f.onchange = function() {
            CQ.soco.commons.composer.getFileInfo(form_div, 'fileInput' + fileFieldCount);
        };

        p = $CQ(form_div).find("#attachments_fields")[0];
        p.appendChild(document.createElement("br"));
        p.appendChild(f);
    };

    CQ.soco.commons.composer.activateTab = function(form_div, pageId) {
        var tabCtrl = $CQ(form_div).find('#tabCtrl');
        var pageToActivate = $CQ(form_div).find('#' + pageId)[0];
        tabCtrl.children().css('display', 'none');
        pageToActivate.style.display = 'block';
    };
})(CQ, $CQ);
