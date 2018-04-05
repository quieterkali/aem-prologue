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
 * Making classic edit config listeners to point to touch authoring listeners by moving it to parent layer.
 * The current classic listeners causing issue are,
 * guidelib.author.AuthorUtils.getSOM
 * guidelib.author.AuthorUtils.replaceGuideComponent
 * guidelib.author.AuthorUtils.GuideTableEdit.mergeTableCell
 * guidelib.author.AuthorUtils.GuideTableEdit.splitTableCell
 */
(function (window, guidelib, $) {
    /*var namespace = {
        author: {}
    };
    window.guidelib = window.guidelib || namespace;
    // Adding a getter for AuthorUtils
    Object.defineProperty(window.guidelib.author, "AuthorUtils", {
        get : function(){
            return window._afAuthorHook._getAfNameSpace().author.AuthorUtils;
        }
    });*/

    //guidelib.util and guidelib.view is set in editor frame from content frame.
    // These 2 classes are required for inline preview of adaptive document.

    //Adding a getter for guidelib.util
    Object.defineProperty(guidelib, "util", {
        get : function () {
            return window._afAuthorHook._getAfNameSpace().util;
        }
    });

    // Adding a getter for guidelib.view
    Object.defineProperty(guidelib, "view", {
        get : function () {
            return window._afAuthorHook._getAfNameSpace().view;
        }
    });

})(window, window.guidelib, $);
