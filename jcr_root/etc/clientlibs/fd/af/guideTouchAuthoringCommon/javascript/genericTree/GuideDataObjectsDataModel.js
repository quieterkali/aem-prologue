// jscs:disable requireDotNotation
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
;(function ($, author, guidetouchlib, undefined) {

    /*  Changing the type which used to come with data objects to editable type which is used in touch authoring
    *   Not changing the logic at server side to avoid any regression for classic authoring
    * */

    var dataType_to_editableType_map = {
        guideAdModuleGroup : "fd/adaddon/components/guideAdModuleGroup",
        guideButton : "fd/af/components/guidebutton",
        guideContainerNode : "fd/af/components/guideContainer",
        guideChart : "fd/af/components/guidechart",
        guideCheckBox : "fd/af/components/guidecheckbox",
        guideDatePicker : "fd/af/components/guidedatepicker",
        guideDropDownList : "fd/af/components/guidedropdownlist",
        guideFileUpload : "fd/af/components/guidefileupload",
        guideImage : "fd/af/components/guideimage",
        guideNumericBox : "fd/af/components/guidenumericbox",
        guidePasswordBox : "fd/af/components/guidepasswordbox",
        guidePanel : "fd/af/components/panel",
        guideRadioButton : "fd/af/components/guideradiobutton",
        guideTextBox : "fd/af/components/guidetextbox",
        guideTable : "fd/af/components/table",
        guideTableRow : "fd/af/components/tableRow",
        guideTermsAndConditions : "fd/af/components/guidetermsandconditions",
        guideTextDraw : "fd/af/components/guidetextdraw",
        guideScribble : "fd/af/components/guidescribble",
        rootPanelNode : "fd/af/components/rootPanel",
        guideFragment : "fd/af/components/panelAsFragment",
        guideSwitch : "fd/af/components/guideswitch",
        guideTelephone : "fd/af/components/guidetelephone",
        guideDateInput : "fd/af/components/guidedateinput",
        guideAdobeSignBlock : "fd/afaddon/components/adobeSignBlock"
    };

    var parseData = function (data) {
        this.loadedJSONdata = data[Object.keys(data)];
        return this.processJSONData(this.loadedJSONdata, "");
    },

    GuideDataObjectsTreeDataModel = guidetouchlib.dataObjectsTree.DataObjectsTreeDataModel = author.util.extendClass(author.ui.TreeDataModel, {
        parseData : parseData
    });

    GuideDataObjectsTreeDataModel.prototype.manipulateProperties = function (node) {
        var guideProperty = {},
            nonGuidePropertyRegex = "guide:",
            textIsRich = "textIsRich";
        for (var jsonProperty in node) {
            if ((jsonProperty.match(nonGuidePropertyRegex))) {
                delete node[jsonProperty];
            } else if (jsonProperty == textIsRich) {
                if (node[textIsRich]) {
                    // If rich text is set true, convert XFA Specific Rich Text to HTML Text
                    var value = node["_value"];
                    // decode the encoded html string
                    value = $('<div/>').html(value).text();
                    // Remove the body tag from the html
                    node["_value"] = $('<div/>').html(value).html();
                }
            }
        }
    };

    GuideDataObjectsTreeDataModel.prototype.processJSONData = function (jsonModel, xpathtype) {
        if (!jsonModel || !jsonModel.name) {
            return null;
        }
        var node = {};
        this.manipulateProperties(jsonModel);
        node.id = jsonModel.bindRef;

        if (jsonModel.path) {
            node.path = jsonModel.path;
        }

        node.xpathtype = xpathtype;

        node.type = jsonModel.type ? jsonModel.type : jsonModel.guideNodeClass ? jsonModel.guideNodeClass : '';
        node.type = dataType_to_editableType_map[node.type];

        node.label = jsonModel["jcr:title"] ? jsonModel["jcr:title"] : jsonModel.name;

        if (jsonModel.items) { // Composite element
            node.items = [];
            var that = this;
            _.each(_.keys(jsonModel.items), function (key) {
                if (_.isObject(jsonModel["items"][key]) && jsonModel.items.hasOwnProperty(key) && typeof jsonModel["items"][key]["name"] !== 'undefined') {
                    node.items.push(that.processJSONData(jsonModel["items"][key], xpathtype + ".items." + key));
                }
            });
        }
        return node;
    };

    GuideDataObjectsTreeDataModel.prototype.getJSONData = function () {
        return this.loadedJSONdata;
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
