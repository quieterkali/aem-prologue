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
 * @version 0.0.1
 * This file provides hook to support common authoring utils of adaptive form
 * to render both in classic and touch authoring.
 * In case of touch authoring, Granite.author is present in parent window but we need guide content to be in child window,
 * this file serves this purpose
 */

(function (window) {
    // todo: Creating object under window should be made conditional, since this file would load even in sites ?

    // creating af author hook class
    window._afAuthorHook = window._afAuthorHook || {};

    /**
     * To get the af window
     * @private
     */
    window._afAuthorHook._getAfWindow = function () {
        return ((window.Granite && window.Granite.author) ? window.Granite.author.ContentFrame.contentWindow : window);
    };

    /**
     * To get the editor window to register event listeners
     * @private
     */
    window._afAuthorHook._getEditorWindow = function () {
        return window;
    };

    /**
     * To get the af name space
     * @private
     */
    window._afAuthorHook._getAfNameSpace = function () {
        return window._afAuthorHook._getAfWindow().guidelib;
    };

    /**
     * To get the af jquery loaded during authoring
     * @private
     */
    window._afAuthorHook._getAfJquery = function () {
        return window._afAuthorHook._getAfWindow().jQuery;
    };

    /**
     * To get the af underscore library cached
     * @private
     */
    window._afAuthorHook._getAfUnderscore = function () {
        return window._afAuthorHook._getAfWindow()._;
    };

})(window);
