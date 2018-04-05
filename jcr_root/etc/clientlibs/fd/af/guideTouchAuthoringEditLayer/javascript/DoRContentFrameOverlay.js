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

;(function ($, author, guidelib, guidetouchlib, channel, window, undefined) {
    var dorOverlay = new Coral.Overlay(),
        icon = new Coral.Icon(),
        button = new Coral.Button();

    $(dorOverlay).addClass("dor-overlay");

    $(icon).addClass("dor-overlay-icon");
    icon.size = "XXL";
    icon.icon = "adobeDocumentCloud";

    $(button).addClass("dor-preview-button");
    button.set({"label" : {innerHTML : Granite.I18n.get("Generate Preview")},
        "variant" : "primary",
        "id" : "preview-dor"});

    dorOverlay.appendChild(icon);
    dorOverlay.appendChild(button);

    $(dorOverlay).appendTo($("#ContentScrollView"));

    guidetouchlib.editLayer.dorOverlay = dorOverlay;
}(jQuery, window.Granite.author, window.guidelib, window.guidelib.touchlib, jQuery(document), this));
