/*************************************************************************
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
 **************************************************************************/
(function (window, $, guidelib) {

    var editConfigListeners = window.guidelib.author.editConfigListeners;
    /**
     * For old forms created before 6.2, the edit listeners would
     * sit inside windows namespace in case of custom components created. The listeners registered below
     * are done to handle backward compatibility. No edit config listeners
     * are to be added to the list written below post 6.2
     */

    window.REFRESH_GUIDE = function (fullRefresh) {
        editConfigListeners.REFRESH_GUIDE.apply(this, [fullRefresh]);
    };

    window.REFRESH_FORM = function () {
        editConfigListeners.REFRESH_FORM.apply(this);
    };

    window.GUIDE_AFTER_INSERT = function () {
        editConfigListeners.GUIDE_AFTER_INSERT.apply(this);
    };

    window.GUIDE_AFTER_MOVE = function () {
        editConfigListeners.GUIDE_AFTER_MOVE.apply(this);
    };

    window.REFRESH_PARENT_PANEL = function () {
        editConfigListeners.REFRESH_PARENT_PANEL.apply(this);
    };

    window.REFRESH_PANEL_WITH_SCRIBBLE = function () {
        editConfigListeners.REFRESH_PANEL_WITH_SCRIBBLE.apply(this);
    };

    window.GUIDE_AFTER_CHILD_INSERT = function (thisEdit, childPath) {
        editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(this, [thisEdit, childPath]);
    };

    window.GUIDE_AFTER_CHILD_EDIT = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_EDIT.apply(this, [thisEdit]);
    };

    window.GUIDE_AFTER_CHILD_MOVE = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_MOVE.apply(this, [thisEdit]);
    };

    window.GUIDE_AFTER_CHILD_DELETE = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_DELETE.apply(this, [thisEdit]);
    };

    window.GUIDE_AFTER_CHILD_MODIFIED = function (node) {
        editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED.apply(this, [node]);
    };

    window.GUIDE_AFTER_DELETE = function () {
        editConfigListeners.GUIDE_AFTER_DELETE.apply(this);
    };

    window.GUIDE_CHILD_INSERT = function (thisEdit, childPath) {
        editConfigListeners.GUIDE_CHILD_INSERT.apply(this, [thisEdit, childPath]);
    };

    window.updateToolbarAllowedComponents = function (cell, allowed, componentList) {
        editConfigListeners.updateToolbarAllowedComponents.apply(this, [cell, allowed, componentList]);
    };

    window.updateComponentList = function (cell, allowed, componentList) {
        editConfigListeners.updateComponentList.apply(this, [cell, allowed, componentList]);
    };

})(window.parent._afAuthorHook ? window.parent._afAuthorHook._getEditorWindow() : window, $, guidelib);
