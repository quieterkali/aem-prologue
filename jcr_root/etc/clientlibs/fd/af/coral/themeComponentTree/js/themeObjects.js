/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
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

(function ($, author, theme, window, undefined) {

    var GuideStylableObjects = theme.stylableObjects = function () {
    };

    GuideStylableObjects.initializeStylableObjectsTree = function () {
        this.JSONdata = JSON.parse(theme.stylableObjectsJson);
        var dataModel = new theme.themeObjectsTreeDataModel({
            JSONdata : this.JSONdata
        });
        var renderer = new theme.FormObjectsTreeRenderer({
            treeContainerId : "theme-objectHierarchy"
        });
        GuideStylableObjects.stylableObjectsTreeComponent = new author.ui.TreeComponent({
            dataModel : dataModel,
            renderer : renderer,
            searchKeys : ["label"]
        });
        GuideStylableObjects.stylableObjectsTreeComponent.setup();
    };

    GuideStylableObjects.teardownStylableObjectsTree = function () {
        GuideStylableObjects.stylableObjectsTreeComponent.teardown();
    };

}(jQuery, Granite.author, window.guidelib.touchlib.theme, this));
