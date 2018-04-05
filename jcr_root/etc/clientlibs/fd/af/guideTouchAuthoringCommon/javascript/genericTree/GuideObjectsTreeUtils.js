/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
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
 */
;(function ($, author, guidetouchlib, undefined) {

    guidetouchlib.ObjectsTreeUtils = guidetouchlib.ObjectsTreeUtils || {};

    guidetouchlib.ObjectsTreeUtils.addIconForComponents = function (node, element) {
        var icon = window.guidelib.author.AuthorUtils.getIconFromResourceType(node.type);

        $iconElement = $("<coral-icon class='tree-item-coral-icon'></coral-icon>")
            .attr("size", "S")
            .attr("icon", icon);
        element.find(".sidepanel-tree-item-button").after($iconElement);
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
