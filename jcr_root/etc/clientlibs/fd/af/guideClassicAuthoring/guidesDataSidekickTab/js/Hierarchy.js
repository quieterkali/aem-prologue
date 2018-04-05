// jscs:disable requireDotNotation
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

(function ($) {
    /**
     * Describes class of objects passed to treeView as parameter
     * contains reference to json object and few utility method currently
     */
    function TreeViewParam(jsonObject) {
        this.json = jsonObject;
    }
    $.extend(TreeViewParam.prototype, {
        isLeafNode : function (node) {
                           return _.isUndefined(node.items);
                       },
        getNodeName : function (node) {
                           return node["jcr:title"];
                       },
        manipulateProperties : function (node) {
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
                       },
        getNodeSubtype : function (node) {
                           if (node["guide:xsdType"] === "element") {
                               return "element";
                           }
                           return "attribute";
                       }
    });

    var DataModelHierarchy = {
        getJson : function (str, type, params) {
            var formModel = null;
            $.ajax({
                    url : str,
                    async : false,
                    data : params
                }).done(function (data) {
                    formModel = data;
                });

            return formModel;
        },

        initDataConnection : function (form, type, params) {
            var model = this.getJson(form, type, params);
            this.options = new TreeViewParam(model[Object.keys(model)]);
            return model !== null;
        },
        show : function (id, form, type, options, params) {
            if (this.initDataConnection(form, type, params)) {
                $.extend(this.options, options || {cfInstance : "guideDataModel"});
                $("#" + id).treeView(this.options);
            }

        }
    };
    window.guideContentFinderLib = {ModelHierarchy : DataModelHierarchy};
})($CQ);
