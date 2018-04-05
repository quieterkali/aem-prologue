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

(function ($, author, guidetouchlib, undefined) {

    var guideEditLayerConstants = guidetouchlib.editLayer.constants,
        guideTouchLibDataObjectsTree = guidetouchlib.dataObjectsTree,
        GuideEditLayerDataObjects = guidetouchlib.editLayer.editLayerDataObjects = function () {
        };

    GuideEditLayerDataObjects.initializeDataObjectsTree = function () {

        var doc = window._afAuthorHook._getAfWindow().document;
        self.path = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");

        var guidePath = self.path.substring(0, self.path.indexOf("/jcr:content/")) + ".3.json";
        /* To check which type of data model is to be loaded*/
        $.ajax({
            url : guidePath,
            type : "GET"
        }).success(function (pageJson) {
            if (pageJson && pageJson["jcr:content"] && pageJson["jcr:content"]["guideContainer"]) {
                var containerJson = pageJson["jcr:content"]["guideContainer"];

                guidelib.author.AuthorUtils._setFormDataModelType(containerJson);

                // check for schemaRef as FDM and jsonschema will have this property at container
                if (containerJson["xdpRef"] || containerJson["xsdRef"] || containerJson["ddRef"] || containerJson["letterRef"] || containerJson["schemaRef"]) {
                    self.dataModelType = (containerJson["xdpRef"]) ? "xfa"
                        : (containerJson["ddRef"]) ? "dd"
                        : (containerJson["letterRef"]) ? "letter"
                        : (containerJson["schemaType"] && containerJson["schemaType"] === "formdatamodel") ? "fdm"
                        : (containerJson["schemaType"] && containerJson["schemaType"] === "jsonschema") ? "json"
                        : "xsd";
                    guideTouchLibDataObjectsTree.guideModelLoadUrl = self.path + ((self.dataModelType === "xfa") ? ".xfajson"
                        : (self.dataModelType === "dd") ? ".ddjson"
                        : (self.dataModelType === "letter") ? ".lettermodeljson"
                        : (self.dataModelType === "fdm") ? ".fdmschema"
                        : (self.dataModelType === "json") ? ".jsonschema"
                        : ".xsdjson");

                    var dataModel = new guideTouchLibDataObjectsTree.DataObjectsTreeDataModel({
                        dataSourceURL : guideTouchLibDataObjectsTree.guideModelLoadUrl
                    });
                    var renderer = new guidetouchlib.editLayer.DataObjectsTreeRenderer(
                        {
                            treeContainerId : guideEditLayerConstants.GUIDE_SIDE_PANEL_DATAOBJECTS_CONTAINER_ID
                        });
                    GuideEditLayerDataObjects.editLayerDataObjectsTreeComponent = new author.ui.TreeComponent({
                        dataModel : dataModel,
                        renderer : renderer
                    });
                    GuideEditLayerDataObjects.editLayerDataObjectsTreeComponent.setup();

                    window.guidelib.author.statusBar.init("#guide_statusbar", false);
                    window.guidelib.author.statusBar.addMessage("");
                } else {
                    $("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_DATAOBJECTS_CONTAINER_ID).empty();
                    $("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_DATAOBJECTS_CONTAINER_ID).append("<div class = 'empty-message'>" +
                    Granite.I18n.getMessage("There is no data model related to this form.") + "</div>");
                }
            }
        }).error(function () {
        });
    };

    GuideEditLayerDataObjects.teardownDataObjectsTree = function () {
        if (GuideEditLayerDataObjects.editLayerDataObjectsTreeComponent) {
            GuideEditLayerDataObjects.editLayerDataObjectsTreeComponent.teardown();
        }
    };

    var getOrElse = function (object, propertyString, defaultValue) {
            var propChain = (propertyString || "").split(".");
            var currObject = object;
            $.each(propChain, function (index, prop) {
                if ($.isPlainObject(currObject)) {
                    currObject = currObject[prop];
                } else {
                    currObject = undefined;
                }
            });

            if (currObject === undefined) {
                return defaultValue;
            } else {
                return currObject;
            }
        },

        restrainChildDragIfParentRepeatable = function (xpathType, $element, dataTreeJsonObject) {
            var pathToParent = xpathType.substring(0, xpathType.lastIndexOf(".items")),
                parentJsonObject = null;
            while (pathToParent) {
                parentJsonObject = getOrElse(
                    dataTreeJsonObject,
                    pathToParent,
                    ""
                );
                if (getOrElse(parentJsonObject, "minOccur", 1) !== 1 || getOrElse(parentJsonObject, "maxOccur", 1) !== 1) {
                    $element.removeClass("cg-draggable");
                    break;
                }
                pathToParent = xpathType.substring(0, pathToParent.lastIndexOf(".items"));
            }
        };

    GuideEditLayerDataObjects.handleDataDrop = function (event) {
        var editComponent =  event.currentDropTarget.targetEditable,
            insertBehavior = event.currentDropTarget.insertBehavior,
            isChildOfTable = guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(editComponent),
            insertedBeforeEBName = null,
            isPanelDroppedOnTableCell = false,
            nodeKeyName = null,
            url = null,
            isDropAllowed = true,
            orderParams = {},
            authorUtils = guidelib.author.AuthorUtils;
        var xpathType = event.dragTarget.dataset.xpathtype.substring(1);
        var nodeKeyNameIndex = xpathType.lastIndexOf(".") + 1;
        if (nodeKeyNameIndex == -1) {
            nodeKeyNameIndex = 0;
        }
        // get content finder instance
        //          var cfInstance = window[data.cfInstance];
        var contentObject = getOrElse(
                this.editLayerDataObjectsTreeComponent.dataModel.getJSONData(),
                xpathType,
                ""
            ),
        // cloning it since we do conversion in case of table
        // Suppose a valid panel is dropped on to table, then we convert the JSON
        // Now if the same panel is dropped outside, we many not want it to be a table row, hence cloning it so that the original
        // object remains intact
            clonedContentObject = $.extend(true, {}, contentObject);

        if (_.isEmpty(clonedContentObject)) {
            clonedContentObject = this.editLayerDataObjectsTreeComponent.dataModel.getJSONData();
        }
        nodeKeyName = xpathType.substring(nodeKeyNameIndex, xpathType.length);
        insertedBeforeEBName = editComponent.path.substring(editComponent.path.lastIndexOf('/') + 1);
        if (insertedBeforeEBName != "*") {
            orderParams[Granite.Sling.ORDER] = insertBehavior + " " + insertedBeforeEBName;
        }
        url = authorUtils._getUrl(editComponent, nodeKeyName);
        // In case of table we do separate calculation
        if (isChildOfTable) {
            var $tableRow = $(editComponent.dom).closest("tr"),
            // very critical: is this right ? we check for number of cells in header always, no concept of colspan checking
                numOfCells = $(editComponent.dom).closest("table").find("th:not('.tableControlElement')").length,
                rowIndex = $tableRow.index(),
                that = this,
                numOfItemsInJson = 0;
            // Check if content object is a container
            if (authorUtils._isContainer(clonedContentObject)) {
                isPanelDroppedOnTableCell = true;
                _.each(clonedContentObject.items, function (item, index) {
                    if (_.isObject(item) && !authorUtils._isContainer(item)) {
                        authorUtils._addTableCellSpecificProp(item);
                        // Increment the count of items
                        numOfItemsInJson++;
                    }
                    // we dont support panel inside panel
                    // Since we
                    if (authorUtils._isContainer(item)) {
                        // we dont support drop of panel inside panel into table row
                        isDropAllowed = false;
                    }
                });
                if (isDropAllowed) {
                    authorUtils._convertPanelToTable(clonedContentObject);
                }
            }
            if (isPanelDroppedOnTableCell) {
                if (isDropAllowed) {
                    // If items in json are less than actual cells present in the table row
                    // then we add template cell's
                    if (numOfCells >= numOfItemsInJson) {
                        var count = numOfCells - numOfItemsInJson;
                        for (var i = 0; i < count; i++) {
                            // since we are adding hence +1 to rowIndex is cruicial
                            clonedContentObject.items["tableItem" + (rowIndex + 1) + count] = authorUtils.GuideTableEdit.CELL_TEMPLATE;
                        }
                        editComponent = author.editables.getParent(editComponent);
                        // Now to get the name of the row, just navigate one level up since the edit component points to field
                        insertedBeforeEBName = editComponent.path.substring(editComponent.path.lastIndexOf('/') + 1);
                        orderParams = authorUtils._getOrderParams(insertedBeforeEBName, true);
                        // here edit component refers to table row, hence to go to table, we have to navigate two level's up
                        url = authorUtils._getUrl(editComponent, nodeKeyName);
                        isChildOfTable = false;
                    } else {
                        // we done allow drop if items in json are more than existing items present in table row
                        isDropAllowed = false;
                        // todo: Think of better string here ?

                        var dialog = new Coral.Dialog().set({
                            header : {
                                innerHTML : CQ.I18n.getMessage("Drop Not Allowed")
                            },
                            content : {
                                innerHTML : CQ.I18n.getMessage("Container has more items than items present in current table row. Please add more columns and retry")
                            },
                            footer : {
                                innerHTML : '<button is="coral-button" variant="primary" coral-close>Ok</button> <button is="coral-button" variant="primary" coral-close>Cancel</button>'
                            },
                            closable : "on",
                            variant : "error"
                        });
                        document.body.appendChild(dialog);
                        dialog.show();
                    }
                } else {
                    // Lets log a warning to user now
                    // Show msg of no support for panel inside panel to end user
                    var dialog = new Coral.Dialog().set({
                        header : {
                            innerHTML : CQ.I18n.getMessage("Drop Not Allowed")
                        },
                        content : {
                            innerHTML : CQ.I18n.getMessage("Dropped container is nested. This is not supported")
                        },
                        footer : {
                            innerHTML : '<button is="coral-button" variant="primary" coral-close>Ok</button> <button is="coral-button" variant="primary" coral-close>Cancel</button>'
                        },
                        closable : "on",
                        variant : "error"
                    });
                    document.body.appendChild(dialog);
                    dialog.show();
                }
            }
        }  else {
            insertedBeforeEBName = editComponent.path.substring(editComponent.path.lastIndexOf('/') + 1);
            orderParams = authorUtils._getOrderParams(insertedBeforeEBName);
            url = authorUtils._getUrl(editComponent, nodeKeyName);
        }

        if (isDropAllowed) {
            window.setTimeout(function () {
                $.ajax({
                    type : "POST",
                    url : isChildOfTable ? editComponent.path : url,
                    data : _.extend({
                        ":operation" : "import",
                        ":contentType" : "json",
                        ":content" : JSON.stringify(clonedContentObject),
                        ":replace" : true,
                        ":replaceProperties" : true,
                        "_charset_" : "utf-8"
                    }),
                    async : false
                }).done(function () {
                        // In case of table field replace, we need to replace, there is no concept of order
                        // but in case of panel added inside table cell, we add it after the dropped row
                        if (isChildOfTable) {
                            window.guidelib.author.editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(author.editables.getParent(editComponent), [editComponent]);
                        } else {
                            //For some reason, :operation = import and :order are not working in single call, so making that sequential
                            $.ajax({
                                type : "POST",
                                url : url,
                                data : orderParams,
                                async : false
                            }).done(function () {
                                    window.guidelib.author.editConfigListeners.GUIDE_AFTER_INSERT.apply(editComponent);
                                    window.guidelib.author.editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(author.editables.getParent(editComponent), [editComponent]);
                                }
                            );
                        }
                    }
                );
            }, 1);
        }
        return this;
    };

}(jQuery, Granite.author, window.guidelib.touchlib, this));
