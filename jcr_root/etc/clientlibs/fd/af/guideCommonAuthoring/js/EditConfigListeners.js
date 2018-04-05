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

/**
 * @todo:
 * CQ.WCM.getEditable, CQ.wcm.componentList won't work in touch authoring,
 * have to fix this later
 */
(function (window, $, guidelib, formsManager) {
    var currentSelectionItems = [],
        afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        AuthorUtils = window.guidelib.author.AuthorUtils,
        editConfigListeners = window.guidelib.author.editConfigListeners = {

            /*
             Simple function to open the dialog for creating fragment from a panel.

             @brief Gets the dialog and displays it with the
             values populated by reading authoringConfigJson and panelJson.

             It performs 2 steps -
             1 - It creates assetJson which consists of metaData properties captured in the dialog,
             panelJson and panelPath and sends this assetJson for creating a fragment
             2 - If fragment is created successfully, it calls deletePanelAndAddFragRef
             otherwise it shows an error to the author.
             */
            // fragmentModelRoot field is hidden by default. It is made visible only for xsd based AF. Its options are
            // the complexType of the element and "/". If the author selects complexType, then only the
            // bindRefs are manipulated.
            getFragmentCreationDialog : function (panelPath) {
                var dialogConfig = CQ.WCM.getDialogConfig("/libs/fd/af/components/panel/fragmentCreationDialog"),
                    dialog = CQ.WCM.getDialog(dialogConfig),
                    formModelField = dialog.getField("formModel"),
                    fragmentModelRootField = dialog.getField("fragmentModelRoot"),
                    titleField = dialog.getField("title"),
                    nameField = dialog.getField("name"),
                    panelJson,
                    authoringConfigJson,
                    xdpRefFieldValue,
                    name,
                    title,
                    fragmentModelRootValue,
                    xsdRefFieldValue,
                    complexTypeOfElement,
                    bindRefOfPanel;

                //retrieve JSON of panel
                panelJson = CQ.HTTP.eval(panelPath + ".infinity.json");
                title = panelJson["jcr:title"] || panelJson["name"];
                name = panelJson["name"];
                bindRefOfPanel = panelJson["bindRef"];

                var formModelDefaultValue = "none",
                    fragmentModelRootDefaultValue = "No Model Root";

                formModelField.setValue(formModelDefaultValue);
                fragmentModelRootField.setOptions([
                    {text : fragmentModelRootDefaultValue, value : fragmentModelRootDefaultValue}
                ]);
                fragmentModelRootField.setValue(fragmentModelRootDefaultValue);
                titleField.setValue(title);
                nameField.setValue(name);

                authoringConfigJson = $(".guideContainerWrapperNode").data("guideAuthoringconfigjson");
                if (authoringConfigJson.xsdRef) {
                    xsdRefFieldValue = authoringConfigJson.xsdRef;
                } else if (authoringConfigJson.xdpRef) {
                    xdpRefFieldValue = authoringConfigJson.xdpRef;
                }

                dialog.show();

                var xdpRefField = dialog.getField("xdpRef"),
                    xsdRefField = dialog.getField("xsdRef"),
                    FORMTEMPLATES = "formtemplates",
                    XMLSCHEMA = "xmlschema";

                if (xdpRefFieldValue && xdpRefFieldValue.length > 0) {
                    xdpRefField.setValue(xdpRefFieldValue);
                    formModelField.setValue(FORMTEMPLATES);
                    fragmentModelRootField.setOptions([
                        {text : bindRefOfPanel, value : bindRefOfPanel},
                        {text : "xfa[0].form[0]", value : "xfa[0].form[0]"}
                    ]);
                    fragmentModelRootValue = bindRefOfPanel || "xfa[0].form[0]";
                    fragmentModelRootField.setValue(fragmentModelRootValue);
                    xdpRefField.show();
                } else if (xsdRefFieldValue && xsdRefFieldValue.length > 0) {
                    fragmentModelRootField.show();
                    if (bindRefOfPanel) {
                        complexTypeOfElement = AuthorUtils.findTypeOfElementFromXsd(panelJson, panelPath, authoringConfigJson.xsdRef, bindRefOfPanel);
                    }
                    xsdRefField.setValue(xsdRefFieldValue);
                    formModelField.setValue(XMLSCHEMA);
                    fragmentModelRootField.setOptions([
                        {text : complexTypeOfElement, value : complexTypeOfElement},
                        {text : "/", value : "/"}
                    ]);
                    fragmentModelRootValue = "/";
                    fragmentModelRootField.setValue(fragmentModelRootValue);
                    xsdRefField.show();
                }

                var metadataProperties = {},
                    assetJson = {},
                    options = {};

                formModelField.disable();

                dialog.ok = function () {
                    if (nameField.validate()) {
                        var metadataProperties = {
                            "description" : dialog.getField("description").getValue(),
                            "title" : titleField.getValue(),
                            "cq:tags" : dialog.getField("tags").getValue(),
                            "formmodel" : formModelField.getValue(),
                            "fragmentModelRoot" : fragmentModelRootField.getValue(),
                            "xdpRef" : dialog.getField("xdpRef").getValue(),
                            "xsdRef" : dialog.getField("xsdRef").getValue()
                        };

                        if (fragmentModelRootField.getValue() !== "/" && xsdRefFieldValue) {
                            AuthorUtils.manipulateBindRefForFragment(panelJson, fragmentModelRootField.getValue(), bindRefOfPanel);
                        }

                        var options = {
                            metadataProperties : JSON.stringify(metadataProperties),
                            panelPath : panelPath,
                            panelJson : JSON.stringify(panelJson),
                            name : nameField.getValue(),
                            targetPath : dialog.getField("targetPath").getValue(),
                            responseHandler : function (responseData) {
                                if (responseData.code === "AEM-FMG-900-002") {
                                    CQ.Ext.Msg.alert(
                                        CQ.I18n.getMessage("Fragment with same name already exists"),
                                        CQ.I18n.getMessage("A fragment with this name already exists. Please enter a different name and retry."),
                                        this
                                    );
                                } else if (responseData.fragmentPath != null && responseData.fragmentPath.length > 0) {
                                    guidelib.author.AuthorUtils.deletePanelAndAddFragRef(panelPath, responseData.fragmentPath);
                                    dialog.hide();
                                } else {
                                    CQ.Ext.Msg.alert(
                                        CQ.I18n.getMessage("Fragment Creation Failed. Please Retry"),
                                        this
                                    );
                                    dialog.hide();
                                }
                            }
                        };

                        if (formsManager != null && formsManager.FragmentCreation != null && formsManager.FragmentCreation.createFragmentFromPanel != null) {
                            formsManager.FragmentCreation.createFragmentFromPanel(options);
                        }
                    } else {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Invalid Name"),
                            CQ.I18n.getMessage("Please enter a valid value in Name Field and retry."), this);
                    }
                };
            },
            addPanel : function () {
                editConfigListeners._addPanel(this.path);
            },

            /*
             Simple function to add a child panel.
             * @param path    Path of the parent panel to which the new panel is to be added
             */
            addChildPanel : function (path) {
                AuthorUtils._addPanel(path);
            },

            /*
             This function opens the authoring of a fragment in a new tab.
             */
            openFragmentAuthoring : function (panelPath) {
                var url = CQ.HTTP.externalize("/cf#" + panelPath.substr(0, panelPath.indexOf("/jcr")) + ".html");
                window.open(url);
            },

            _sendData : function (panelData, panelPath) {
                var newPanelName = panelData['name'];
                var options = {
                    ":content" : JSON.stringify(panelData),
                    ":operation" : "import",
                    ":contentType" : "json",
                    ":replace" : true,
                    ":replaceProperties" : true
                };

                // if name doesnt exists, create one by creating a time stamp
                if (newPanelName.length == 0) {
                    newPanelName = "panel" + new Date().getTime();
                }

                var htmlID = AuthorUtils.getHtmlId(panelPath + "/items/" + newPanelName);
                guidelib.author.instances.lastFocusItemId = htmlID;

                $CQ.ajax({
                    type : "POST",
                    url : panelPath + "/items/" + newPanelName,
                    data : options,
                    async : false
                }).done(function (resp) {
                        editConfigListeners.REFRESH_GUIDE();
                    });
            },

            /**
             * Fills the value in the panelData object on click of Save in Dialog
             * @param {object}
             */

            _getDialogFields : function (object, event, panelData) {

                var dialog = object.findParentByType('dialog');//find dialog

                var v1 = dialog.getField("jcr:title").getValue();

                var panelName = dialog.getField("name").getValue();

                if (panelName.search(/[ @#$%]/) > 0) {
                    return false;
                }

                panelData['jcr:title'] = v1;

                panelData['name'] = panelName;

                panelData['jcr:description'] = dialog.getField("jcr:description").getValue();

                panelData['sling:resourceType'] = "fd/af/components/panel";
                panelData['guideNodeClass'] = "guidePanel";
                panelData["items"] = {"jcr:primaryType" : "nt:unstructured"};
                //Ideally this should be picked via template.
                panelData["layout"] = {
                    "columns" : "1",
                    "sling:resourceType" : "fd/af/layouts/gridFluidLayout",
                    "jcr:primaryType" : "nt:unstructured",
                    "toolbarPosition" : "Bottom"
                };
                return (v1.length > 0);
            },

            _addPanel : function (panelPath) {
                var panelData = {};

                var dialog = new CQ.Dialog({
                    'width' : 600,
                    'modal' : true,
                    'resize' : false,
                    'title' : CQ.I18n.getMessage('Panel properties dialog'),
                    'beforeclose' : function (panel) {
                        var a = panel.getField('jcr:title').value;
                        return false;
                    },
                    'items' : {
                        'xtype' : 'tabpanel',
                        'items' : [
                            {
                                'xtype' : 'panel',
                                'title' : CQ.I18n.getMessage('Panel properties'),
                                'hideMode' : 'offsets',
                                'items' : [
                                    {
                                        'xtype' : 'textfield',
                                        'allowBlank' : false,
                                        'fieldLabel' : CQ.I18n.getMessage("Title"),
                                        'name' : "jcr:title",
                                        'fieldDescription' : CQ.I18n.getMessage("Enter title for the panel")
                                    },
                                    {
                                        'xtype' : 'textfield',
                                        'fieldLabel' : CQ.I18n.getMessage("Description"),
                                        'name' : "jcr:description",
                                        'fieldDescription' : CQ.I18n.getMessage("Enter description for the panel")
                                    },

                                    {
                                        'xtype' : 'textfield',
                                        'fieldLabel' : CQ.I18n.getMessage('Name'),
                                        'name' : "name",
                                        'regex' : /^[^ @#$%]+$/,
                                        'regexText' : CQ.I18n.getMessage("Element name should only contain characters or numbers"),
                                        'fieldDescription' : CQ.I18n.getMessage("Enter name for the panel")
                                    }

                                ]
                            }
                        ]
                    },
                    'buttons' : [
                        {
                            'text' : CQ.I18n.getMessage('Ok'),
                            'handler' : function () {
                                if (editConfigListeners._getDialogFields(arguments[0], arguments[1], panelData)) {
                                    this.close();
                                    editConfigListeners._sendData(panelData, panelPath);
                                } else {
                                    // Show color in all valid fields by checking them
                                    CQ.Ext.Msg.show({
                                        title : CQ.I18n.getMessage('Validation failed'),
                                        msg : CQ.I18n.getMessage('Verify the values of the marked fields.'),
                                        buttons : CQ.Ext.Msg.OK,
                                        icon : CQ.Ext.Msg.ERROR
                                    });

                                }
                            }
                        },
                        {
                            'text' : CQ.I18n.getMessage('Cancel'),
                            'handler' : function () {
                                this.hide();
                            }
                        }
                    ]});
                dialog.show();
            },

            toolbar : {
                editToolbar : function () {
                    var that = this;
                    var afterEditFn = function () {
                        // todo: this should be different in touch authoring
                        editConfigListeners._refreshEditable(that);
                    };
                    var toolbar = new CQ.GuideToolbarEditor({afterEditFn : afterEditFn});
                    toolbar.loadContent(this.path);
                },

                deleteToolbar : function () {
                    var toolBarPath = this.path;
                    var toolbarEditable = editConfigListeners._getEditable(toolBarPath);
                    toolbarEditable.actions.push(CQ.wcm.EditBase.DELETE);
                    toolbarEditable.removeParagraph();
                },

                /*
                 Simple function to add a toolbar by passing path of the panel
                 * @param path    Path of the panel whose toolbar is to be added
                 */
                addPanelToolbar : function (path) {
                    AuthorUtils.toolbar._addToolbar(path);
                },

                addToolbar : function () {
                    if (!editConfigListeners._getEditable(this.path + "/toolbar")) {
                        var toolbarJson = {};
                        toolbarJson['jcr:title'] = "Toolbar";
                        toolbarJson['name'] = "toolbar";
                        toolbarJson["css"] = "";
                        toolbarJson['sling:resourceType'] = "fd/af/components/toolbar";
                        toolbarJson['guideNodeClass'] = "guideToolbar";
                        toolbarJson["items"] = {"jcr:primaryType" : "nt:unstructured"};
                        toolbarJson["layout"] = {
                            "sling:resourceType" : "fd/af/layouts/toolbar/defaultToolbarLayout",
                            "jcr:primaryType" : "nt:unstructured"
                        };
                        var options = {
                            ":content" : JSON.stringify(toolbarJson),
                            ":operation" : "import",
                            ":contentType" : "json",
                            ":replace" : true,
                            ":replaceProperties" : true
                        };
                        var that = this;
                        $CQ.ajax({
                            type : "POST",
                            url : that.path + "/toolbar",
                            data : options,
                            async : false
                        }).done(function (resp) {
                                var guideContainerPath = afWindow.$(AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
                                if (that.path === guideContainerPath) {
                                    editConfigListeners.refreshGuide(guideContainerPath);
                                } else {
                                    editConfigListeners.REFRESH_GUIDE();
                                }
                            });
                    }
                }
            },

            moveRowUp : function (editable) {
                guidelib.author.AuthorUtils.GuideTableEdit.moveRowUpHandler(editable);
            },
            moveRowDown : function (editable) {
                guidelib.author.AuthorUtils.GuideTableEdit.moveRowDownHandler(editable);
            },
            addCol : function (editable, $controlColCell) {
                guidelib.author.AuthorUtils.GuideTableEdit.addColHandler(editable, $controlColCell);
            },
            addRow : function (editable) {
                guidelib.author.AuthorUtils.GuideTableEdit.addRowHandler(editable);
            },
            deleteRow : function (contentPath) {
                var response = null;
                CQ.Ext.Msg.confirm(
                    CQ.I18n.getMessage("Delete Row"),
                    CQ.I18n.getMessage("Do you really want to delete the selected row ?"),
                    function (btnId) {
                        if (btnId == "yes") {
                            var params = {};
                            params[CQ.Sling.STATUS] = CQ.Sling.STATUS_BROWSER;
                            params[CQ.Sling.OPERATION] = CQ.Sling.OPERATION_DELETE;
                            response = CQ.shared.HTTP.post(contentPath, null, params);
                            if (CQ.shared.HTTP.isOk(response)) {
                                guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(contentPath);
                            }
                        }
                    }, this);
            },
            getTableColIndex : function (editable, $controlColCell) {
                return $controlColCell.index();
            },
            deleteCol : function (editable, $controlColCell) {
                guidelib.author.AuthorUtils.GuideTableEdit.deleteColHandler(editable, $controlColCell);
            },
            deleteColumnHandler : function (rowPathMap, editColPath) {
                var cellPath = null,
                    isColumnItemDeleted = false,
                    params = {},
                    response = null;
                CQ.Ext.Msg.confirm(
                    CQ.I18n.getMessage("Delete Column"),
                    CQ.I18n.getMessage("Do you want to delete the selected column?"),
                    function (btnId) {
                        if (btnId == "yes") {
                            // Walk through the row path array and create a table item
                            _.each(rowPathMap, function (rowMap) {
                                if (rowMap.colSpan == 1) {
                                    cellPath = rowMap.path;
                                    params = {};
                                    params[CQ.Sling.STATUS] = CQ.Sling.STATUS_BROWSER;
                                    params[CQ.Sling.OPERATION] = CQ.Sling.OPERATION_DELETE;
                                    response = CQ.shared.HTTP.post(cellPath, null, params);
                                    isColumnItemDeleted = CQ.shared.HTTP.isOk(response);
                                } else {
                                    params = {
                                        "colspan" : parseInt(rowMap.colSpan) - 1,
                                        ":replaceProperties" : true
                                    };
                                    // just update the colspan on server
                                    response = CQ.shared.HTTP.post(rowMap.path, null, params);
                                    isColumnItemDeleted = CQ.shared.HTTP.isOk(response);
                                }
                            });
                            if (isColumnItemDeleted) {
                                guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editColPath);
                            }
                        }
                    }, this);
            },
            getSOM : function () {
                var that = this,
                    $somContainer = afWindow.$("#somContainer", AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                if ($somContainer.length !== 0) {
                    $somContainer.empty();
                }
                $CQ.ajax({
                    type : "GET",
                    url : this.path + ".af.somprovider",
                    async : false
                }).success(function (resp) {
                        var $somPopover,
                            localisedSomExpressionMessage = CQ.I18n.getMessage('SOM Expression '),
                            localizedWaringMessageForSomExpression = CQ.I18n.getMessage("A SOM expression is based on the position of the component. It changes if a component is moved.");

                        if (afWindow.$("#somPopover", AuthorUtils.GUIDE_CONTAINER_SELECTOR).length === 0) {
                            $somPopover = afWindow.$('<div></div>').addClass("guide-som-popover").attr("id", "somPopover");
                            var closeSom = function () {
                                    afWindow.$(this).parent().parent().hide();
                                    return false;
                                },
                                $somCloseButton = afWindow.$('<button></button>').addClass("close guide-som-popover-close").attr("id", "somPopupClose").click(closeSom).append("×"),
                                $somTitle = afWindow.$('<h3></h3>').addClass("guide-som-popover-title").append(localisedSomExpressionMessage).append($somCloseButton);
                            $somContainer = afWindow.$('<div></div>').addClass("guide-som-popover-content").attr("id", "somContainer");
                            $somPopover.append($somTitle).append($somContainer);
                            $somPopover.appendTo(AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        }
                        $somContainer = afWindow.$('#somContainer', AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        $somPopover = afWindow.$('#somPopover', AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        var $elem = that.element ? afWindow.$(that.element.dom) : afWindow.$(that.dom),
                            offset = $elem.offset(),
                            som = resp + '<br/> <br/>' +
                                "<strong>*</strong>" + localizedWaringMessageForSomExpression;
                        if (som.localeCompare($somContainer.html())) {
                            $somPopover.css({display : 'none'});
                        }
                        $somContainer.html(som);
                        $somPopover.css({top : offset.top, left : offset.left});
                        $somPopover.toggle("slow");
                        return true;
                    }).error(function (resp) {
                        return false;
                    });
                return true;
            },
            /*
             @brief First check if the fragment was binded
             If binded then -
             a. get container instead of rootPanel's children
             b.  we need to manipulate the
             bindRef of every child node of fragment
             c. Remove fragRef and bindRef from fragment panel

             */
            // A confirmation message is displayed to the author before embedding a fragment.
            // If the author presses OK , then the fragment is embedded
            // and if the author presses cancel button the no action is taken.
            embedFragment : function (fragRef, currentPanelPath, bindRef) {

                CQ.Ext.Msg.confirm(
                    CQ.I18n.getMessage("Embed Fragment"),
                    CQ.I18n.getMessage("Do you want to embed the fragment?"),
                    function (btnId) {

                        if (btnId == "yes") {
                            // by default get rootPanel's children
                            var pathToHit = fragRef + "/items",
                                isBinded = false,
                                rootPanelChildrenOrContainerResource,
                                options,
                                fragmentModelRoot,
                                FRAGMENT_MODEL_ROOT_CONSTANT = "fragmentModelRoot",
                                rootPanel,
                                itemsOfRootPanel;
                            if (bindRef && bindRef.length > 0) {
                                // get container
                                pathToHit = fragRef.substr(0, fragRef.length - "rootPanel".length);
                                isBinded = true;
                            }
                            //Remove lazy flag from Current Panel
                            $CQ.ajax({
                                type : "POST",
                                url : CQ.HTTP.externalize(currentPanelPath),
                                data : {"optimizeRenderPerformance@Delete" : "false"},
                                async : false
                            });

                            rootPanelChildrenOrContainerResource = $CQ.ajax({
                                type : "GET",
                                url : CQ.HTTP.externalize(pathToHit + ".infinity.json"),
                                async : false
                            }).responseText;
                            rootPanelChildrenOrContainerResource = JSON.parse(rootPanelChildrenOrContainerResource);
                            if (isBinded) {
                                // Case when we asked for container json
                                fragmentModelRoot = rootPanelChildrenOrContainerResource[FRAGMENT_MODEL_ROOT_CONSTANT];
                                rootPanel = rootPanelChildrenOrContainerResource["rootPanel"];
                                itemsOfRootPanel = rootPanel["items"];
                                $.each(itemsOfRootPanel, function (key, value) {
                                    if (typeof value === "object") {
                                        AuthorUtils.manipulateBindRefForEmbed(value, fragmentModelRoot, bindRef);
                                    }
                                });

                            } else {
                                // case when  asked for items of root panel
                                itemsOfRootPanel = rootPanelChildrenOrContainerResource;
                            }
                            options = {
                                ":operation" : "delete"
                            };
                            // delete "items" if present
                            $CQ.ajax({
                                type : "POST",
                                url : CQ.HTTP.externalize(currentPanelPath + "/items"),
                                data : options,
                                async : false
                            }).done(function (resp) {
                                    // post items
                                    options = {
                                        ":content" : JSON.stringify(itemsOfRootPanel),
                                        ":operation" : "import",
                                        ":contentType" : "json",
                                        ":replace" : true,
                                        ":replaceProperties" : true
                                    };
                                    $CQ.ajax({
                                        type : "POST",
                                        url : CQ.HTTP.externalize(currentPanelPath + "/items"),
                                        data : options,
                                        async : false
                                    }).done(function (resp) {
                                            var params = {};
                                            params["fragRef" + "@Delete"] = null;
                                            params["_charset_"] = "utf-8";
                                            $CQ.ajax({
                                                type : "POST",
                                                url : CQ.HTTP.externalize(currentPanelPath),
                                                data : params,
                                                async : false
                                            }).done(function (resp) {
                                                    window.REFRESH_GUIDE();
                                                });
                                        });
                                });

                        }
                    }, this);

            },

            /*
             Simple recursive function to correct "bindRef" of the components getting embedded
             */
            manipulateBindRefForEmbed : function (guideTypeJson, fragmentModelRoot, bindRef) {
                if (guideTypeJson["bindRef"] === bindRef) {
                    guideTypeJson["bindRef"] = undefined;
                    if (guideTypeJson["maxOccur"]) {
                        guideTypeJson["maxOccur"] = 1;
                    }
                    if (guideTypeJson["minOccur"]) {
                        guideTypeJson["minOccur"] = 1;
                    }
                }

                // if guideTypeJson["bindRef"] is equal to fragmentModelRoot, then guideTypeJson["bindRef"] is set equal to bindRef + substring after fragmentModelRoot.
                // if guideTypeJson["bindRef"] does not start with fragmentModelRoot + '/' , then guideTypeJson["bindRef"] is not manipulated.
                // if guideTypeJson["bindRef"] does not start with fragmentModelRoot + '.' , then guideTypeJson["bindRef"] is not manipulated.
                if (guideTypeJson["bindRef"] === fragmentModelRoot) {
                    guideTypeJson["bindRef"] = bindRef + guideTypeJson["bindRef"].substr(fragmentModelRoot.length);
                } else if (guideTypeJson["bindRef"] && !_.isUndefined(fragmentModelRoot) && fragmentModelRoot.indexOf('/') === 0 && guideTypeJson["bindRef"].indexOf(fragmentModelRoot + '/') !== 0) {
                    guideTypeJson["bindRef"] = guideTypeJson["bindRef"];
                } else if (guideTypeJson["bindRef"] && !_.isUndefined(fragmentModelRoot) && fragmentModelRoot.indexOf('xfa[0]') === 0 && guideTypeJson["bindRef"].indexOf(fragmentModelRoot + '.') !== 0) {
                    guideTypeJson["bindRef"] = guideTypeJson["bindRef"];
                } else if (guideTypeJson["bindRef"]) {
                    guideTypeJson["bindRef"] = bindRef + guideTypeJson["bindRef"].substr(fragmentModelRoot.length);
                }

                if (guideTypeJson["items"]) {
                    $.each(guideTypeJson["items"], function (key, value) {
                        if (typeof value == "object") {
                            AuthorUtils.manipulateBindRefForEmbed(value, fragmentModelRoot, bindRef);
                        }
                    });
                }
            },

            /**
             *
             * @returns {*}
             * @private
             */
            _getReplaceDialog : function () {
                currentSelectionItems = (currentSelectionItems || []).concat(CQ.WCM.getSelectedItems());
                var isChildOfTable = AuthorUtils.GuideTableEdit.isChildOfTable(this),
                    cl = CQ.WCM.getComponentList(this.path),
                // Pass editable of root panel since root panel would define the allowed components for Adaptive Form
                // Doing this since this would refer to cell and cell's parent would not define the allowed components
                    parentTablePath = null,
                    parentTableEditable = null,
                // defines replace dialog
                // Note: This code is copied from NEW Dialog of CQ
                // We use the same styles here, ony thing we override is "OK" listener, mask and title of the dialog
                    panel = new CQ.Ext.Panel({
                        "border" : false,
                        "autoScroll" : true,
                        "layout" : "accordion",
                        "cls" : "cq-sidekick-buttons"
                    }),
                    config = {
                        "jcr:primaryType" : "cq:Dialog",
                        "title" : CQ.I18n.getMessage("Replace Component"),
                        "items" : panel,
                        "width" : CQ.themes.wcm.EditBase.INSERT_DIALOG_WIDTH,
                        "cls" : "cq-insertdialog " + this.getClsPath("cq-insertdialog")
                    },
                    dlg = CQ.WCM.getDialog(config, "insertdialog-" + this.path);
                // if this is a child of table, then get the parent editable of table, since cell's parent is not editable by default
                if (isChildOfTable) {
                    // calling parent since table would point to table tag, but we need the table wrapper
                    var $table = afWindow.$(this.element.dom).closest("table").parent();
                    // get the parent path
                    parentTablePath = $table.attr("data-editpath");
                    // use the path to get the editable since we use the allowed components defined in panel
                    if (parentTablePath != null) {
                        parentTableEditable = Granite.author.editables.getParent(editConfigListeners._getEditable(parentTablePath));
                    }
                }
                var that = this;
                // done so that the button 'Ok' is made visible
                if (parentTableEditable !== null) {
                    parentTableEditable.dialogs[CQ.wcm.EditBase.INSERT] = dlg;
                    dlg.ok = function () {
                        editConfigListeners.submitReplaceDialog.apply(parentTableEditable, [dlg, this]);
                    };
                } else {
                    this.dialogs[CQ.wcm.EditBase.INSERT] = dlg;
                    dlg.ok = function () {
                        editConfigListeners.submitReplaceDialog.apply(that, [dlg, that]);
                    };
                }

                dlg.buttons[0].disable();
                if (parentTableEditable !== null) {
                    CQ.wcm.ComponentList.loadPanel(cl, panel, parentTableEditable, false);
                } else {
                    CQ.wcm.ComponentList.loadPanel(cl, panel, this, true);
                }
                return dlg;

            },

            /**
             *
             * @param definition Defines the definition of component which is to be replaced
             * Definition gives template path and resource type of the node to be added
             */
            replaceComponent : function (definition) {
                // Get the data of the component selected from the template path
                var url = CQ.HTTP.externalize(definition.templatePath),
                    cmpData = CQ.HTTP.eval(url + ".infinity.json"),
                    formatCmpData = null,
                    response = null,
                    bReplaceSuccessful = false,
                    params = null;
                if (cmpData) {
                    formatCmpData = _.extend({}, CQ.utils.Util.formatData(cmpData), {
                        "sling:resourceType" : definition.resourceType
                    });
                    params = {
                        ":content" : JSON.stringify(formatCmpData),
                        ":operation" : "import",
                        ":contentType" : "json",
                        ":replace" : true,
                        ":replaceProperties" : true
                    };

                    if (currentSelectionItems && currentSelectionItems.length > 0) {
                        _.each(currentSelectionItems, function (item) {
                            // Replace the component present at item.path using CQ.shared.HTTP.post
                            response = CQ.shared.HTTP.post(item.path, null, params);
                            if (CQ.utils.HTTP.isOk(response)) {
                                bReplaceSuccessful = true;
                            } else {
                                bReplaceSuccessful = false;
                            }
                        });
                    }
                    if (bReplaceSuccessful) {
                        editConfigListeners.REFRESH_GUIDE();
                        // Reset the list of current selection items
                        currentSelectionItems = [];
                    }
                }
            },

            /**
             * This function handles the submission of replace dialog showed
             * and builds the definition of the node selected in the replace dialog
             *
             * @param dialog            Dialog is similar to what we do in new, but changed the mask and title of the dialog
             * @param currentEditable   Editable against which replace has been invoked
             */
            submitReplaceDialog : function (dialog, currentEditable) {
                // this refers to table's parent editable
                var replaceDialogMask = new CQ.Ext.LoadMask(this.dialogs[CQ.wcm.EditBase.INSERT].getEl(), {
                    "msg" : CQ.I18n.getMessage("Replacing component")
                });

                // Show the mask before replacing
                replaceDialogMask.show();

                var that = this;
                var definition = this.insertComponentRecord.data;
                definition.insertBehavior = this.insertBehavior;
                window.setTimeout(function () {
                    editConfigListeners.replaceComponent.apply(currentEditable, [definition]);
                    dialog.hide();
                    replaceDialogMask.hide();
                }, 1);
            },
            /**
             *  Replace Handler for Adaptive Form Components
             *  this here defines the editable
             */
            replaceGuideComponent : function () {
                // To support edit bar, added a tweak to set the current selected item
                // There cannot be a use case to  select multiple edit bar
                var editable = editConfigListeners._getEditable(this.path);
                if (editable instanceof CQ.wcm.EditBar) {
                    // In case of edit bar, we do not get the list of current selection items
                    currentSelectionItems.push(editable);
                }
                var dialog = editConfigListeners._getReplaceDialog.apply(this, arguments);
                dialog.show();
            },

            mergeTableCell : function () {
                // this here refers to editable of table cell
                // check if is table cell as a safe check
                var currentSelectionItems = CQ.WCM.getSelectedItems(),
                    selectedItemsLength = currentSelectionItems.length,
                    isChildOfTable = AuthorUtils.GuideTableEdit.isChildOfTable(this),
                    bDeleteSuccessful = false,
                    nColSpanCount = 0,
                    nCellsDeleted = 0,
                    bMergeSuccessful = false,
                    firstSelectedItemPath = null,
                    $firstSelectedItem = null,
                    response = null,
                    params = {};
                // Initialize the params
                params[CQ.Sling.STATUS] = CQ.Sling.STATUS_BROWSER;
                params[CQ.Sling.OPERATION] = CQ.Sling.OPERATION_DELETE;

                // todo: check if the selected item lie in the same column or same row, only then allow to merge else throw an error
                // check if there are selected items
                if (currentSelectionItems) {
                    // if the selected items are only one alert, select two or more cells to merge
                    if (selectedItemsLength === 1) {
                        // Show msg of invalid selection
                        CQ.Ext.Msg.show({
                            title : CQ.I18n.getMessage('Invalid Selection'),
                            msg : CQ.I18n.getMessage('Select two or more cells to merge'),
                            buttons : CQ.Ext.Msg.OK,
                            icon : CQ.Ext.Msg.ERROR
                        });
                    } else if (currentSelectionItems.length > 1) {
                        // check if valid selection
                        var validationState = AuthorUtils.GuideTableEdit._checkIfValidSelection(currentSelectionItems),
                            $tableCell = null;
                        if (validationState === AuthorUtils.GuideTableEdit.SELECTION_CONSTANT.WITHIN_ROW) {
                            _.each(currentSelectionItems, function (item, index) {
                                $tableCell = afWindow.$(item.element.dom).closest("td");
                                nColSpanCount += (+$tableCell.attr("colspan"));
                                if (index === 0) {
                                    firstSelectedItemPath = item.path;
                                    $firstSelectedItem = afWindow.$(item.element.dom).closest("td");
                                } else {
                                    // delete the component present at item.path using CQ.shared.HTTP.post
                                    response = CQ.shared.HTTP.post(item.path, null, params);
                                    if (CQ.utils.HTTP.isOk(response)) {
                                        bDeleteSuccessful = true;
                                        nCellsDeleted++;
                                    } else {
                                        bDeleteSuccessful = false;
                                    }
                                }
                            });
                            if (bDeleteSuccessful && nCellsDeleted >= 1) {
                                // Now update property of the first selected item with rowspan or colspan
                                if (validationState === AuthorUtils.GuideTableEdit.SELECTION_CONSTANT.WITHIN_ROW) {
                                    // update with colspan
                                    params = {
                                        "colspan" : parseInt(nColSpanCount)
                                    };
                                } else {
                                    // update with rowspan
                                    params = {
                                        "rowspan" : parseInt($firstSelectedItem.attr("rowspan")) + nCellsDeleted
                                    };
                                }
                                // delete the component present at item.path using CQ.shared.HTTP.post
                                response = CQ.shared.HTTP.post(firstSelectedItemPath, null, params);
                                if (CQ.utils.HTTP.isOk(response)) {
                                    bMergeSuccessful = true;
                                } else {
                                    bMergeSuccessful = false;
                                }
                            }
                        } else {
                            // Show msg of invalid selection
                            CQ.Ext.Msg.show({
                                title : CQ.I18n.getMessage('Invalid Selection'),
                                msg : CQ.I18n.getMessage('Select two or more consecutive cells within same row to merge. Merge of cells present in header row is not supported.'),
                                buttons : CQ.Ext.Msg.OK,
                                icon : CQ.Ext.Msg.ERROR
                            });
                        }
                    }
                    if (bMergeSuccessful) {
                        // if deletion successful update the first selected item with row span or colspan
                        editConfigListeners.REFRESH_GUIDE();
                        currentSelectionItems = null;
                    }
                }
            },

            splitTableCell : function () {
                // this here refers to editable of table cell
                // check if is table cell as a safe check
                var currentSelectionItems = CQ.WCM.getSelectedItems(),
                    editable = _.isArray(currentSelectionItems) ? currentSelectionItems[0] : null,
                    $tableCell = editable ? afWindow.$(editable.element.dom).closest("td") : null,
                    $tableRow = $tableCell ? $tableCell.closest("tr") : null,
                    rowEditPath = $tableRow ? $tableRow.attr("data-editpath") : null,
                    colSpan = $tableCell ? (+$tableCell.attr("colspan")) : 0,
                    selectedItemsLength = currentSelectionItems.length,
                    isChildOfTable = AuthorUtils.GuideTableEdit.isChildOfTable(this),
                    bSplitSuccessful = true,
                    firstSelectedItemPath = null,
                    $firstSelectedItem = null,
                    response = null,
                    params = {};

                // todo: check if the selected item lie in the same column or same row, only then allow to merge else throw an error
                // check if there are selected items
                if (currentSelectionItems && editable) {
                    // if the selected items are only one alert, select two or more cells to merge
                    if (selectedItemsLength > 1 || colSpan === 1) {
                        // Show msg of invalid selection
                        CQ.Ext.Msg.show({
                            title : CQ.I18n.getMessage('Invalid Selection'),
                            msg : CQ.I18n.getMessage('Select a merged cell to split'),
                            buttons : CQ.Ext.Msg.OK,
                            icon : CQ.Ext.Msg.ERROR
                        });
                    } else if (currentSelectionItems.length == 1) {
                        if (colSpan > 1) {
                            // Reset params first
                            params = {};
                            // Lets update the current cell path with colspan 1
                            params[":content"] = JSON.stringify(AuthorUtils.GuideTableEdit.COLSPAN_ONE_TEMPLATE);
                            // Now extend the params object to create a new object
                            params = _.extend(params, {
                                ":operation" : "import",
                                ":contentType" : "json",
                                ":replace" : true,
                                ":replaceProperties" : true
                            });
                            response = CQ.shared.HTTP.post(editable.path, null, params);
                            // Once the colspan is updated lets add new items now
                            if (CQ.utils.HTTP.isOk(response)) {
                                var orderParams = {},
                                    numOfItems = colSpan - 1,
                                    newCellPath = null,
                                    cellName = null,
                                    afterCellName = editable.path.substring(editable.path.lastIndexOf('/') + 1),
                                    colIndex = $tableCell.index();
                                for (var i = 0; i < numOfItems && bSplitSuccessful; i++) {
                                    cellName = AuthorUtils.GuideTableEdit.CONSTANT_TABLE.TABLE_CELL_NAME_PREFIX + new Date().getTime();
                                    newCellPath = rowEditPath + "/items/" + AuthorUtils.GuideTableEdit.CONSTANT_TABLE.TABLE_CELL_NAME_PREFIX + new Date().getTime();
                                    // Now create an object at this path
                                    // First create a node and let the sling post node creation algorithm decide the name
                                    params[":content"] = JSON.stringify(AuthorUtils.GuideTableEdit.ROW_ITEM_TEMPLATE);
                                    response = CQ.shared.HTTP.post(newCellPath, null, params);
                                    if (CQ.utils.HTTP.isOk(response)) {
                                        orderParams[CQ.Sling.ORDER] = CQ.wcm.EditBase.INSERT_AFTER + " " + afterCellName;
                                        response = CQ.shared.HTTP.post(newCellPath, null, orderParams);
                                        if (CQ.utils.HTTP.isOk(response)) {
                                            afterCellName = cellName;
                                            bSplitSuccessful = true;
                                        } else {
                                            bSplitSuccessful = false;
                                        }
                                    } else {
                                        bSplitSuccessful = false;
                                    }
                                }
                                // check if valid split
                                if (bSplitSuccessful) {
                                    // if deletion successful update the first selected item with row span or colspan
                                    editConfigListeners.REFRESH_GUIDE();
                                    currentSelectionItems = null;
                                }
                            }
                        }
                    }
                }

            },

            /**
             * To get any editable please use the
             * @returns {*}
             * @private
             */
            _getEditable : function (path) {
                return CQ.WCM.getEditable(path);
            },

            _getEditables : function (path) {
                return CQ.WCM.getContentWindow().CQ.WCM.getEditables(path);
            },
            /**
             * Refresh of editable should be done using this function
             * No direct invocation of API should be done, based on the type of authoring this
             * method would get overridden
             * @param editable
             */
            _refreshEditable : function (editable) {
                editable.refreshSelf();
            },

            refreshGuide : function (guideRefreshPath) {
                var guideRefreshComponent = editConfigListeners._getEditable(guideRefreshPath);
                if (AuthorUtils.lockOnRefreshCycle && AuthorUtils.someMorePendingRefreshRequests) {
                    return;
                }
                setTimeout(function () {
                    if (AuthorUtils.toEnterSetTimeOut) {
                        return;
                    }
                    if (AuthorUtils.lockOnRefreshCycle) {
                        AuthorUtils.someMorePendingRefreshRequests = true;
                        return;
                    }
                    AuthorUtils.lockOnRefreshCycle = true;
                    editConfigListeners._refreshEditable(guideRefreshComponent);
                    // toEnterSetTimeOut is used to avoid a race condition
                    //Suppose  2nd refresh event is reaches the if condition on lock to queue the event when I have just assigned the lock to 1st evnet and yet
                    //not started guideRefreshComponent.refreshSelf();
                    // So ignoring this kind of events
                    AuthorUtils.toEnterSetTimeOut = true;
                    setTimeout(function () {
                        $(window).trigger("guideDomModified", [AuthorUtils._getEditableDom(guideRefreshComponent)]);
                        AuthorUtils.lockOnRefreshCycle = false;
                        // Any more refresh events - Bring it on
                        AuthorUtils.toEnterSetTimeOut = false;
                        if (AuthorUtils.someMorePendingRefreshRequests) {
                            AuthorUtils.someMorePendingRefreshRequests = false;
                            editConfigListeners.refreshGuide(guideRefreshPath);
                        }
                        $(window).trigger("guideRefreshDone");
                    }, 5);
                }, 5);
            },

            showExpressionEditor : function () {
                guidelib.author.ExpressionEditorUtil.showExpressionEditor.apply(this, arguments);
            },

            launchExpressionEditor : function () {
                var editable = this;
                afWindow.$(AuthorUtils._getEditableDom(editable))
                    .find('.open-rule-editor')
                    .on('click', function () {
                        guidelib.author.ExpressionEditorUtil.showExpressionEditor.apply(editable);
                    });
            },

            /* this function is to refresh the parent node HTML*/
            refreshParent : function (editable) {
                var parentPanel = Granite.author.editables.getParent(editable);
                if (typeof parentPanel === 'object' && !_.isEmpty(parentPanel)) {
                    parentPanel = Granite.author.editables.getParent(parentPanel);
                    if (parentPanel) {
                        editConfigListeners._refreshEditable(parentPanel);
                    }
                }
            }
        };

    /*
     * The state variable to track whether component added is a Guide
     * component
     *
     * WE NEED TO GET RID OF THIS STATE VARIABLE.
     */
    var guideComponentAdded = false;

    editConfigListeners.REFRESH_GUIDE = function (fullRefresh) {
        var guideRefreshPath = afWindow.$(AuthorUtils.ROOT_PANEL_SELECTOR).data("path");
        editConfigListeners.refreshGuide(guideRefreshPath);
    };

    editConfigListeners.REFRESH_FORM = function () {
        editConfigListeners._refreshEditable(this);
    };

    editConfigListeners.GUIDE_AFTER_INSERT = function () {
        guideComponentAdded = true;
        editConfigListeners.REFRESH_GUIDE(this);
    };

    /* This is called when a field is moved, We need to call refresh_guide here in classic.
     But in touch other touch specific listeners are used to update the HTML in a more efficient way
     */
    editConfigListeners.GUIDE_AFTER_MOVE = function () {
        editConfigListeners.REFRESH_GUIDE(this);
    };

    editConfigListeners.REFRESH_PARENT_PANEL = function () {
        //this here is the field. first getParent() changes the context to the first parent i.e. items node and the next getParent() changes the context to parent panel containing the field.
        //this is done to get CQ's edit rollover for the parent panel.
        if (guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(this)) {
            guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(this.path);
        } else {
            //this ensures that refresh of parent panel only happens
            //when required, eg, Colspan else it just refreshes self
            var nodeId = guidelib.author.AuthorUtils.getHtmlId(this.path),
                $el = afWindow.$("#" + nodeId),
            // in touch authoring, after delete listener assumes the dom is removed, hence getting dom from editable
                $node = $el.length > 0 ? $(AuthorUtils._getEditableDom(this)).find("#" + nodeId) : null,
                authoringConfig = $node != null ? $node.data("guideAuthoringconfigjson") : null,
                oldColspan = authoringConfig != null ? authoringConfig.colspan : "",
                newColspan = $node != null ? $node.data("newcolspan") : "";
            /* newColspan:
             * Sets to the new value when changed.
             * Sets to 1 if No value, i.e. "", is passed.
             * Sets to old value if remains unchanged
             * because there's no change event fired, hence null.
             */
            /* In Touch Authoring the editable is already refreshed before call to this function.
             Hence the below logic of checking colspan does not work*/
            if (Granite && Granite.author) {
                editConfigListeners.refreshParent(this);
                return;
            }

            if (!_.isNumber(newColspan)) {
                if (_.isEqual("", newColspan)) {
                    newColspan = 1;
                } else {
                    newColspan = oldColspan;
                }
            }

            if (newColspan !== oldColspan) {
                editConfigListeners.refreshParent(this);
            } else {
                // If element not deleted, only then call refresh editable on it
                if ($el.length > 0) {
                    editConfigListeners._refreshEditable(this);
                }
            }
        }
    };

    editConfigListeners.REFRESH_PANEL_WITH_SCRIBBLE = function () {
        editConfigListeners.REFRESH_PARENT_PANEL.apply(this);
        window.setTimeout(afWindow.guidelib.util.GuideUtil._resizeScribbleField, afWindow.guidelib.util.GuideUtil.SCRIBBLE_RESIZE_TIME_INTERVAL);
    };

    /*
     * In case of cq components guide refresh should not be called.
     * It shouldn't be called for guide components as well but since
     * we were doing it till now, continuing the legacy.
     *
     * Now checking whether GUIDE_AFTER_CHILD_INSERT was called after
     * adding a guide component and then only calling refresh guide
     *
     * WE NEED TO RECTIFY THIS SITUATION ASAP.
     */
    editConfigListeners.GUIDE_AFTER_CHILD_INSERT = function (thisEdit, childPath) {
        if (guideComponentAdded === true) {
            //REFRESH_GUIDE();  Removing this as REFRESH_GUIDE is already being called from GUIDE_AFTER_INSERT of the component added
            guideComponentAdded = false;
            // in touch authoring, childPath is undefined, hence fall back to thisEdit.path if child path not present
            guidelib.author.instances.lastFocusItemId = AuthorUtils.getHtmlId(childPath ? childPath : thisEdit.path);
        }
        editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED(this);
    };

    /* These are new listeners added in touch Authoring. Adding them here in common file so that nothing breaks if they are added in classic also in future.
     * We will use these listeners to update the objects hierarchy in touch authoring*/

    editConfigListeners.GUIDE_AFTER_CHILD_EDIT = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED(this);
    };

    editConfigListeners.GUIDE_AFTER_CHILD_MOVE = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED(this);
        editConfigListeners.refreshParent(thisEdit);
    };

    editConfigListeners.GUIDE_AFTER_CHILD_DELETE = function (thisEdit) {
        editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED(this);
    };

    /* This is to refresh the tree node in case of any modification in the child node*/
    editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED = function (node) {
        // This will not be called in classic. Will override this in Touch to refresh Forms Object Tree
    };

    editConfigListeners.GUIDE_AFTER_DELETE = function () {
        editConfigListeners.REFRESH_GUIDE();
    };

    editConfigListeners.GUIDE_CHILD_INSERT = function (thisEdit, childPath) {
        editConfigListeners.GUIDE_AFTER_CHILD_INSERT(thisEdit, childPath);
    };

    editConfigListeners.updateToolbarAllowedComponents = function (cell, allowed, componentList) {
        // allowed here is not passed by reference
        if (allowed != null) {
            var ajaxPayload = {
                url : Granite.HTTP.externalize("/libs/fd/af/components/info.json?type=action"),
                type : "GET",
                datatype : "json",
                async : false
            };
            $.ajax(ajaxPayload).done(function (data) {
                // we only allow components that are returned by the server
                allowed.length = 0;
                if (data != null && allowed != null) {
                    for (var i = 0; i < data.length; i++) {
                        allowed.push(data[i]['path']);
                    }
                }
            });
        }
    };

    editConfigListeners.updateComponentList = function (cell, allowed, componentList) {
        if (allowed instanceof Array && allowed.indexOf('group:Adaptive Form') == -1) {
            allowed.push('group:Adaptive Form');
        }
    };

})(window.parent._afAuthorHook ? window.parent._afAuthorHook._getEditorWindow() : window, $, guidelib, window.Form);
