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

(function (guidelib, author) {

    var _superInsertCondition = author.edit.ToolbarActions.INSERT.condition;
    author.edit.ToolbarActions.INSERT.condition = function (editable) {
        return _superInsertCondition(editable) && !guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(editable);
    };

    var _superDeleteCondition = author.edit.ToolbarActions.DELETE.condition;
    author.edit.ToolbarActions.DELETE.condition = function (editable) {
        // Delete action will not be present on any children of table except non-header rows
        // For header row, delete action is not present so this condition won't come into picture
        return _superDeleteCondition(editable) && !(guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(editable) && !guidelib.author.AuthorUtils.GuideTableEdit.isTableRow(editable));
    };
})(guidelib, Granite.author);
