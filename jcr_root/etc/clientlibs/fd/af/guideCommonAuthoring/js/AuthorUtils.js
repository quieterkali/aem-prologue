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

(function (window, $, guidelib) {
    var currentSelectionItems = [],
        afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        /**
         * @todo: This file has to be cleaned, most of the edit config listeners
         * have been moved to EditConfigListeners.js file
         */
            objectTypeToIconMap = {
            "fd/af/components/guideradiobutton" : "target",
            "fd/af/components/guidedropdownlist" : "dropdown",
            "fd/af/components/guidechart" : "graphDonut",
            "fd/af/components/guidecheckbox" : "select",
            "fd/af/components/guidefileupload" : "attach",
            "fd/af/components/guidetextbox" : "aBC",
            "fd/af/components/guidebutton" : "button",
            "fd/af/components/guidedatepicker" : "viewBiWeek",
            "fd/af/components/guideimage" : "image",
            "fd/af/components/guidenumericbox" : "123",
            "fd/af/components/guideemail" : "email",
            "fd/af/components/guidepasswordbox" : "key",
            "fd/af/components/guidetermsandconditions" : "stamp",
            "fd/af/components/guidetextdraw" : "text",
            "fd/af/components/guideheader" : "railTop",
            "fd/af/components/guidefooter" : "railBottom",
            "fd/af/components/guidetelephone" : "devicePhone",
            "fd/af/components/table" : "collection",
            "fd/afaddon/components/adobeSignBlock" : "adobeSign",
            "fd/afaddon/components/esign" : "annotate",
            "fd/afaddon/components/summary" : "textBulleted",
            "fd/afaddon/components/verify" : "trendInspect",
            "fd/af/components/guideseparator" : "separator",
            "fd/af/components/actions/reset" : "revert",
            "fd/af/components/actions/previtemnav" : "chevronLeft",
            "fd/af/components/actions/nextitemnav" : "chevronRight",
            "fd/fp/components/actions/saveGuideDraft" : "save",
            "fd/af/components/actions/submit" : "publish",
            "fd/af/components/guideswitch" : "switch",
            "fd/af/components/tableRow" : "tableSelectRow",
            "fd/af/components/tableHeader" : "tableSelectRow",
            "fd/af/components/rootPanel" : "panel",
            "fd/af/components/panel" : "panel",
            "fd/af/components/guideContainer" : "form",
            "fd/af/components/guideFragmentContainer" : "breakdown",
            "fd/af/components/guideContainerWrapper" : "form",
            "fd/af/components/guidescribble" : "scribble",
            "fd/adaddon/components/guideAdModule" : "documentFragment",
            "fd/adaddon/components/guideAdModuleGroup" : "documentFragmentGroup",
            "fd/adaddon/components/guideDocumentContainer" : "fileTxt",
            "fd/af/components/toolbar" : "actions",
            "fd/af/components/panelAsFragment" : "breakdown",
            "fd/af/components/guidenumericstepper" : "chevronUpDown",
            "fd/af/components/guideimagechoice" : "imageCheck",
            "fd/af/components/guidedateinput" : "dateInput",
            "fd/af/components/actions/fileattachmentlisting" : "textBulletedAttach",
            "fd/af/components/guideCaptcha" : "shield",
            "fd/af/components/afFormTitle" : "text",
            "fd/af/components/guideformtitle" : "text"
        },
        AuthorUtils = guidelib.author.AuthorUtils = {
            GUIDE_CONTAINER_SELECTOR : 'div.guideContainerWrapperNode',
            ROOT_PANEL_SELECTOR : ".guideRootPanel",
            ITEMS_NODE : "items",
            INSERT_AFTER : "after",
            INSERT_BEFORE : "before",
            INSERT_LAST : "",

            toolbar : {
                /*
                 Simple function to add a toolbar. No parameters required.
                 */
                addToolbar : function () {
                    AuthorUtils.toolbar._addToolbar(this.path);
                },

                _addToolbar : function (path) {
                    if (!CQ.WCM.getEditable(path + "/toolbar")) {
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
                        $CQ.ajax({
                            type : "POST",
                            url : path + "/toolbar",
                            data : options,
                            async : false
                        }).done(function (resp) {
                                var guideContainerPath = AuthorUtils.getGuideContainerPath();
                                if (path === guideContainerPath) {
                                    AuthorUtils.refreshGuide(guideContainerPath);
                                } else {
                                    window.REFRESH_GUIDE();
                                }
                            });
                    }
                }
            },
            lockOnRefreshCycle : false,
            someMorePendingRefreshRequests : false,
            toEnterSetTimeOut : false,
            FM_DAM_ROOT : "/content/dam/formsanddocuments/",
            FM_AF_ROOT : "/content/forms/af/",

            /**
             * This enum has to be in sync with com.adobe.aemds.guide.utils.GuideConstants.GUIDE_ASSETS.
             */
            GUIDE_ASSETS : {
                THEME : "theme",
                XDP_TEMPLATE : "xdpTemplate",
                META_TEMPLATE : "metaTemplate",
                SCHEMA : "schema"
            },

            // todo: as of now, this is not used anywhere
            tnc : {
                handleCheck : function (field, newValue, oldValue) {
                    var dialog = field.findParentByType('dialog'),
                        tmpField = dialog.getField('./linkText');
                    if (newValue) {
                        tmpField.show();
                    } else {
                        tmpField.hide();
                    }
                }
            },

            getSOM : function () {
                var that = this,
                    $somContainer = $("#somContainer", AuthorUtils.GUIDE_CONTAINER_SELECTOR);
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

                        if ($("#somPopover", AuthorUtils.GUIDE_CONTAINER_SELECTOR).length === 0) {
                            $somPopover = $('<div></div>').addClass("guide-som-popover").attr("id", "somPopover");
                            var closeSom = function () {
                                    $(this).parent().parent().hide();
                                    return false;
                                },
                                $somCloseButton = $('<button></button>').addClass("close guide-som-popover-close").attr("id", "somPopupClose").click(closeSom).append("�"),
                                $somTitle = $('<h3></h3>').addClass("guide-som-popover-title").append(localisedSomExpressionMessage).append($somCloseButton);
                            $somContainer = $('<div></div>').addClass("guide-som-popover-content").attr("id", "somContainer");
                            $somPopover.append($somTitle).append($somContainer);
                            $somPopover.appendTo(AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        }
                        $somContainer = $('#somContainer', AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        $somPopover = $('#somPopover', AuthorUtils.GUIDE_CONTAINER_SELECTOR);
                        var offset = $(that.element.dom).offset(),
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

            /**
             * Returns the coral icon as per the form object resource type
             * @param resourceType
             */
            getIconFromResourceType : function (resourceType) {
                if (objectTypeToIconMap.hasOwnProperty(resourceType)) {
                    return objectTypeToIconMap[resourceType];
                }
                return "starburst";
            },

            HTTP : {
                get : function (path) {
                    var externalizedPath = Granite.HTTP.externalize(path);
                    return $.ajax({
                        type : "GET",
                        url : externalizedPath
                    });
                },

                post : function (path, data) {
                    var externalizedPath = Granite.HTTP.externalize(path);
                    return $.ajax({
                        type : "POST",
                        url : externalizedPath,
                        data : data
                    });
                }
            },

            _getUrl : function (editComponent, nodeKeyName) {
                var url = editComponent.getParentPath() + "/";
                return url = url + nodeKeyName + new Date().getTime();
            },

            _getOrderParams : function (insertedBeforeEBName, isPanelDroppedToTable) {
                var orderParams = {};
                orderParams[Granite.Sling.ORDER] = this.INSERT_LAST;
                if (insertedBeforeEBName != "*") {
                    orderParams[Granite.Sling.ORDER] = ((isPanelDroppedToTable ? this.INSERT_AFTER : this.INSERT_BEFORE) + " " + insertedBeforeEBName);
                }
                if (insertedBeforeEBName != "*"
                    && (orderParams[Granite.Sling.ORDER] == this.INSERT_BEFORE
                    || orderParams[Granite.Sling.ORDER] == this.INSERT_AFTER)) {
                    orderParams[Granite.Sling.ORDER] += " " + insertedBeforeEBName;
                }
                return orderParams;
            },

            _convertPanelToTable : function (contentObject) {
                contentObject.guideNodeClass = "guideTableRow";
                contentObject["sling:resourceType"] = "fd/af/components/tableRow";
                // If layout property present use it, else create a new one
                contentObject.layout = contentObject.layout || {};
                contentObject.layout["sling:resourceType"] = "fd/af/layouts/table/rowLayout";
                // Since instead of replacing the table row we add a new row always
                // Making sure that the name giving to this row is always unique and we don't honor the name from data model
                // This is done only while adding panel from data model as row into table
                contentObject.name = ((contentObject.name || contentObject.title || "Row") + new Date().getTime());
            },

            _addTableCellSpecificProp : function (tableItem) {
                // In table we don't show title
                tableItem["hideTitle"] = true;
            },

            /**
             * This function is used to check if the content dropped on to a table cell
             * is a container, container here means not composite field, but panel, table or table row
             * In future if we add more containers, this function has to be changed.
             * Also, it is invoked only in the case where the item is dropped onto a table cell
             * @param contentObject
             * @private
             */
            _isContainer : function (jsonModel) {
                // In table we don't show title
                return jsonModel.guideNodeClass === "guidePanel" || jsonModel.guideNodeClass === "guideTableRow" || jsonModel.guideNodeClass === "guideTable";
            },

            /**
             * This API converts DAM asset path to adaptive forms page's container path e.g. if the path was /content/dam/formsanddocument/bla/jcr:content
             * the return vaule will be /content/forms/af/bla/jcr:content/guideContainer
             * @param fragRef
             * @returns {string}
             */
            convertFMAssetPathToContainerPath : function (fragRef) {
                var fragRef = fragRef.replace(AuthorUtils.FM_DAM_ROOT, AuthorUtils.FM_AF_ROOT);
                return fragRef + "/jcr:content/guideContainer/rootPanel";
            },

            /**
             * This function returns the path of the resource for which
             *  absolute or relative path is given
             * @param path
             */
            _getResourcePath : function (path) {
                // path is absolute
                if (path.indexOf("/") === 0) {
                    return path;
                }
                var searchPaths = ["/apps/", "/libs/"];
                // find /apps or /libs and prepend to the current releative path
                return _.find(searchPaths, function (element, index) {
                    var response = CQ.shared.HTTP.get(element + path);
                    return CQ.shared.HTTP.isOk(response) && response.responseText && response.responseText.length > 0;
                }) + path;
            },

            /**
             * to select the appropriate edit pattern for datepicker
             * @private
             */
            _selectPatternForEdit : function () {
                var fn = guidelib.author.GuideExtJSDialogUtils.patternSelectedListener('./editPictureClause');
                if (_.isFunction(fn)) {
                    fn.apply(this, arguments);
                }
            },

            _setFormDataModelType : function (containerJson) {
                var dataModelType = _.chain(containerJson)
                    .pick(guidelib.touchlib.constants.FORM_DATA_REFS)
                    .keys()
                    .value()
                    .join()
                    .replace(/Ref$/, "");

                guidelib.author.formInfo.dataModelType = dataModelType;
            },

            inlineStylingConstants : {
                HELP : 'Help',
                FIELD : 'Field',
                PANEL : 'Panel',
                PANELDESCRIPTION : 'PanelDescription',
                WIDGET : 'Widget',
                CAPTION : 'Caption',
                QUESTIONMARK : 'QuestionMark',
                SHORTDESCRIPTION : 'ShortDescription',
                LONGDESCRIPTION : 'LongDescription'
            },

            setDialogConfigForStyleEditor : function () {
                var dialog = this.findParentByType('dialog');
                dialog.on('beforesubmit', guidelib.author.AuthorUtils.storeGuideInlineStyleValues);
                dialog.on('loadcontent', guidelib.author.AuthorUtils.loadComponentStyleProperties);
                dialog.find('title', 'Styling')[0].on('show', guidelib.author.AuthorUtils.loadComponentStyleProperties);
                return true;
            },

            loadComponentStyleProperties : function () {
                var dialog = this,
                    panel = dialog.find('name', 'guideStyle'),
                    inlineStylesTitleToNameMap = {
                        "Separator" : "Field",
                        "Text" : "Field",
                        "Image" : "Field",
                        "Button" : "Widget"
                    },
                    panelComponents;
                if (panel[0] && panel[0].items) {
                    panelComponents = panel[0].items.items;
                }
                if (panelComponents && panelComponents.length > 0) {
                    for (var i = 0; i < panelComponents.length; i++) {
                        var title = inlineStylesTitleToNameMap[panelComponents[i].title] || panelComponents[i].title;
                        if (title !== guidelib.author.AuthorUtils.inlineStylingConstants.HELP) {
                            var multiField = panelComponents[i].find('name', title);
                            guidelib.author.AuthorUtils.loadEachPartProperties.apply(multiField[0], [title]);
                        } else {
                            panelComponents[i].show();
                            var helpPanelParts = panelComponents[i].items.items;
                            for (var j = 0; j < helpPanelParts.length; j++) {
                                var helpPanelPartStyleField = helpPanelParts[j].find('xtype', 'multifield');
                                guidelib.author.AuthorUtils.loadEachPartProperties.apply(helpPanelPartStyleField[0], [helpPanelPartStyleField[0].name]);
                            }
                        }
                    }
                    //this is to change the focus to the first panel,i.e. Field, after loading values of all the panels
                    panelComponents[0].show();
                }
            },

            loadEachPartProperties : function (title) {
                var dialog = this.findParentByType('dialog'),
                    inlineStyles = dialog.getField('./inlineStyles'),
                    properties;
                if (inlineStyles) {
                    properties = inlineStyles.getValue();
                }

                var component = this;
                component.findParentByType('panel').show();
                component.show();
                if (properties && properties.length > 0) {
                    if (component) {
                        _.each(properties, function (property) {
                            if (property.substring(0, property.indexOf("{")) === title) {
                                var componentProperties = property.substring(property.indexOf("{") + 1, property.indexOf("}"));
                                if (componentProperties.length > 0) {
                                    var parts = componentProperties.split(',');
                                    component.setValue(parts);
                                }
                            }
                        }, properties);
                    }
                }
            },

            storeGuideInlineStyleValues : function () {
                var inlineStyles = this.getField("./inlineStyles"),
                    properties = [],
                    field = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.FIELD),
                    panel = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.PANEL),
                    panelDescription = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.PANELDESCRIPTION),
                    widget = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.WIDGET),
                    caption = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.CAPTION),
                    questionMark = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.QUESTIONMARK),
                    shortDescription = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.SHORTDESCRIPTION),
                    longDescription = this.getField(guidelib.author.AuthorUtils.inlineStylingConstants.LONGDESCRIPTION),
                    parts = [field, panel, panelDescription, widget, caption, questionMark, shortDescription, longDescription];

                for (var i = 0; i < parts.length; i++) {
                    if (parts[i]) {
                        var partProperties = parts[i].getValue();
                        if (partProperties.length > 0) {
                            partProperties = parts[i].name + '{' + partProperties + '}';
                            parts[i].setValue("");
                            properties.push(partProperties);
                        }
                    }
                }
                inlineStyles.setValue(properties);
            },

            addPanel : function () {
                AuthorUtils._addPanel(this.path);
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
                                        'regex' : /^[a-zA-Z0-9 _\\-]+$/,
                                        'regexText' : CQ.I18n.getMessage("Element title should only contain characters, numbers, whitespace,  _ or -"),

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
                                        'regex' : /^[a-zA-Z0-9_\\-]+$/,
                                        'regexText' : CQ.I18n.getMessage("Element name should only contain characters, numbers, _ or -"),
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
                                if (AuthorUtils._getDialogFields(arguments[0], arguments[1], panelData)) {
                                    this.close();
                                    AuthorUtils._sendData(panelData, panelPath);
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

            /**
             * NOTE: If the ID generation logic is changed in NodStructureUtils, it has to be changed here as well
             */
            getHtmlId : function (path) {
                var guideContainer = AuthorUtils.getGuideContainerName(),
                    guideContainerSubString = "/" + guideContainer + "/";
                var id = guideContainer + "-" + path.substring(path.indexOf(guideContainerSubString) + guideContainerSubString.length);
                while (id.indexOf("/items/") !== -1) {
                    id = id.replace("/items/", "-");
                }
                while (id.indexOf("/") !== -1) {
                    id = id.replace("/", "-");
                }
                while (id.indexOf("\\.") !== -1) {
                    id = id.replace("\\.", "-");
                }

                id = id + "__";
                return id;
            },

            getParentId : function (id) {
                var index = null,
                    parentId = null;
                if (id) {
                    id = id.trim();
                    index = id.lastIndexOf('-');
                    if (index > 0) {
                        parentId = id.substr(0, index) + "__";
                        return parentId;
                    }
                }
                return null;
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

                var htmlID = this.getHtmlId(panelPath + "/items/" + newPanelName);
                guidelib.author.instances.lastFocusItemId = htmlID;

                $CQ.ajax({
                    type : "POST",
                    url : panelPath + "/items/" + newPanelName,
                    data : options,
                    async : false
                }).done(function (resp) {
                        window.REFRESH_GUIDE();
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

            /**
             * This function finds the definition of the element present at the end of the xpath.
             *
             * @returns type               returns the type of the element
             * @param panelJson            json of the panel which is being converted to a fragment
             * @param panelPath            path of the panel which is being converted to a fragment
             * @param schemaRef            xsdRef of the adaptive form
             * @param bindRef              bindRef of the panel
             * @param schemaType           type of schema
             */

            // It takes the bindRef(eg-/a/b/c) and
            // Traverses the schema ,finds the type of c(which becomes the fragmentModelRoot for the new fragment) and returns it.

            findTypeOfElementFromXsd : function (panelJson, panelPath, schemaRef, bindRef, schemaType) {
                var complexTypeGetterUrl = panelPath + ".definitionGetter",
                    path = bindRef.substr(bindRef.indexOf('/') + 1),
                    fragmentModelRoot = null,
                    RELATIVE_PATH_TO_SCHEMA_ASSET = "/jcr:content/renditions/original",
                    FM_DAM_ROOT = "/content/dam/formsanddocuments/",
                    complexType = "",
                    COMPLEX_TYPE_STRING_TO_IGNORE = "complex type";

                if (schemaRef.indexOf("/assets/xsdRef.xsd") >= 0 || schemaRef.indexOf("/assets/schemaRef.json") >= 0) {
                    var guideContainerLength = 14,
                        guideContainerPath = panelPath.substr(0, panelPath.indexOf("guideContainer") + guideContainerLength);
                    schemaRef = guideContainerPath + schemaRef;
                } else if (schemaRef.indexOf(FM_DAM_ROOT) >= 0) {
                    schemaRef = schemaRef + RELATIVE_PATH_TO_SCHEMA_ASSET;
                }

                var options = {
                    "schemaRef" : schemaRef,
                    "rootName" : path.substring(0, path.indexOf('/')),
                    "path" : path,
                    "schemaType" : schemaType
                };

                $CQ.ajax({
                    type : "GET",
                    url : CQ.shared.HTTP.externalize(complexTypeGetterUrl),
                    data : options,
                    async : false
                }).done(function (data) {
                    complexType = data.type;
                });

                if (complexType !== null) {
                    if (schemaType && (schemaType == "jsonschema") || (schemaType == "formdatamodel")) {
                        fragmentModelRoot = '/' + complexType;
                        fragmentModelRoot = fragmentModelRoot.trim();
                    } else {
                        fragmentModelRoot = '/' + complexType.substr(0, complexType.lastIndexOf(COMPLEX_TYPE_STRING_TO_IGNORE));
                        fragmentModelRoot = fragmentModelRoot.trim();
                        bindRef = panelJson["bindRef"];
                        panelJson["bindRef"] = fragmentModelRoot;
                    }
                }

                return fragmentModelRoot;
            },

            /*
             Simple recursive function to correct "bindRef" of the components of the panel which is being converted into a fragment
             */
            manipulateBindRefForFragment : function (guideTypeJson, fragmentModelRoot, bindRef) {

                if (guideTypeJson["bindRef"] === bindRef) {
                    guideTypeJson["bindRef"] = fragmentModelRoot;
                    if (guideTypeJson["maxOccur"]) {
                        guideTypeJson["maxOccur"] = 1;
                    }
                    if (guideTypeJson["minOccur"]) {
                        guideTypeJson["minOccur"] = 1;
                    }
                }

                if (guideTypeJson["bindRef"] && (guideTypeJson["bindRef"].indexOf(bindRef + '/') === 0)) {
                    var lengthOfBindRef = bindRef.length;
                    guideTypeJson["bindRef"] = fragmentModelRoot + guideTypeJson["bindRef"].substr(lengthOfBindRef);
                }

                if (guideTypeJson["items"]) {
                    $.each(guideTypeJson["items"], function (key, value) {
                        if (typeof value == "object" && value !== null) {
                            AuthorUtils.manipulateBindRefForFragment(value, fragmentModelRoot, bindRef);
                        }
                    });
                }
            },

            // This function deletes the items node from the panel that is converted into a fragment and adds the fragRef property
            // to the panel node.
            deletePanelAndAddFragRef : function (panelPath, FragRef) {
                var options = {
                    ":operation" : "delete"
                };
                //delete items
                $CQ.ajax({
                    type : "POST",
                    url : CQ.shared.HTTP.externalize(panelPath + "/items"),
                    data : options,
                    async : false
                }).done(function (resp) {
                        // post fragRef property
                        var params = {};
                        params["fragRef"] = FragRef;
                        $CQ.ajax({
                            type : "POST",
                            url : CQ.shared.HTTP.externalize(panelPath),
                            data : params,
                            async : false
                        }).done(function (resp) {
                                window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                            });
                    });
            },

            /*
             This function opens the authoring of a fragment in a new tab.
             */
            openFragmentAuthoring : function (panelPath) {
                var url = CQ.HTTP.externalize("/cf#" + panelPath.substr(0, panelPath.indexOf("/jcr")) + ".html");
                window.open(url);
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
                } else if (guideTypeJson["bindRef"] && fragmentModelRoot.indexOf('/') === 0 && guideTypeJson["bindRef"].indexOf(fragmentModelRoot + '/') !== 0) {
                    guideTypeJson["bindRef"] = guideTypeJson["bindRef"];
                } else if (guideTypeJson["bindRef"] && fragmentModelRoot.indexOf('xfa[0]') === 0 && guideTypeJson["bindRef"].indexOf(fragmentModelRoot + '.') !== 0) {
                    guideTypeJson["bindRef"] = guideTypeJson["bindRef"];
                } else if (guideTypeJson["bindRef"]) {
                    guideTypeJson["bindRef"] = bindRef + guideTypeJson["bindRef"].substr(fragmentModelRoot.length);
                }

                // if the JSON contains a "nt:file" type object, then we delete it
                // from the JSON since it can't be posted
                _.each(guideTypeJson, function (value, key) {
                    if (_.isObject(value) && key !== "items") {
                        if (value["jcr:primaryType"] === "nt:file" || value["jcr:primaryType"] === "nt:resource") {
                            guideTypeJson[key] = {};
                        }
                    }
                });

                if (guideTypeJson["items"]) {
                    $.each(guideTypeJson["items"], function (key, value) {
                        if (typeof value == "object") {
                            AuthorUtils.manipulateBindRefForEmbed(value, fragmentModelRoot, bindRef);
                        }
                    });
                }
            },

            setAuthoringFocus : function (focusId, doc) {
                //Note: We are using this universal strategy of navigable structures based on _guide-item and _guide-itm-nav
                //If you change this, please also modify GuidePanelView and AuthoringInit.js accordingly.

                //based on assumption that parent id would be subset of child id since these are based on paths
                if (typeof doc === 'undefined') {
                    doc = window.document; // to take care classic UI
                }
                var guideUtil = afWindow.guidelib.util.GuideUtil;
                var nodeIdSuffix = guideUtil.GUIDE_NODE_ID_SUFFIX;
                focusId = guideUtil.elIdWithoutNodeIdSuffix(focusId);
                var nodePathTokens = ("" + focusId).split("-");
                var processedId = focusId;
                _.reduce(nodePathTokens, function (processedToken, currentNodeToken) {
                    var currentNodeFullToken = currentNodeToken;
                    var currentNodeId = currentNodeToken + nodeIdSuffix;
                    if (processedToken) {
                        var processedNodeId = processedToken + nodeIdSuffix;
                        currentNodeFullToken = processedToken + "-" + currentNodeToken;
                        currentNodeId = currentNodeFullToken + nodeIdSuffix;
                        var itemNavContainer = guideUtil.itemNavContainerSelector(processedNodeId);
                        var itemContainer = guideUtil.itemContainerSelector(processedNodeId);
                        //TODO: below code assume GUIDE_ITEM would be direct children of GUIDE_ITEM_CONTAINER which may not always be true
                        $(doc).find(itemNavContainer).children('[id$="' + guideUtil.GUIDE_ITEM_NAV_SUFFIX + '"]').removeClass("active");
                        $(doc).find(itemContainer).children('[id$="' + guideUtil.GUIDE_ITEM_SUFFIX + '"]').removeClass("active");
                    }
                    //Activate current item
                    var currentItemNavSelector = guideUtil.itemNavSelector(currentNodeId);
                    var currentItemSelector = guideUtil.itemSelector(currentNodeId);
                    $(doc).find(currentItemNavSelector).addClass("active");
                    $(doc).find(currentItemSelector).addClass("active");
                    processedId = currentNodeId;
                    return currentNodeFullToken;
                }, "", this);

                if (processedId) {
                    $(doc).find("#" + processedId)
                        .find('[id$="' + guideUtil.GUIDE_ITEM_CONTAINER_SUFFIX + '"]')
                        .find('[id$="' + guideUtil.GUIDE_ITEM_SUFFIX + '"]')
                        .each(function () {
                            //TODO: Needs to make it more performant
                            var $this = $(this);
                            var thisItemId = $this.attr("id");
                            var nodeId = thisItemId.substring(0, thisItemId.length - guideUtil.GUIDE_ITEM_SUFFIX);
                            var thisItemNavSelector = guideUtil.itemNavSelector(nodeId);
                            //See if there is a previous sibling which is a guide item
                            if ($this.prev("[id$=" + guideUtil.GUIDE_ITEM_SUFFIX + "]").length === 0) {
                                $this.addClass("active");
                                $(doc).find(thisItemNavSelector).addClass("active");
                            } else {
                                $this.removeClass("active");
                                $(doc).find(thisItemNavSelector).removeClass("active");
                            }
                        });
                }
                // to provide time for css classes to be added before resize computations are taking place.
                setTimeout(guideUtil._resizeScribbleField, guideUtil.SCRIBBLE_RESIZE_TIME_INTERVAL);
            },

            refreshGuide : function (guideRefreshPath) {
                var guideRefreshComponent = CQ.WCM.getEditable(guideRefreshPath);
                if (window.guidelib.author.AuthorUtils.lockOnRefreshCycle && window.guidelib.author.AuthorUtils.someMorePendingRefreshRequests) {
                    return;
                }
                setTimeout(function () {
                    if (window.guidelib.author.AuthorUtils.toEnterSetTimeOut) {
                        return;
                    }
                    if (window.guidelib.author.AuthorUtils.lockOnRefreshCycle) {
                        window.guidelib.author.AuthorUtils.someMorePendingRefreshRequests = true;
                        return;
                    }

                    window.guidelib.author.AuthorUtils.lockOnRefreshCycle = true;
                    guideRefreshComponent.refreshSelf();
                    // toEnterSetTimeOut is used to avoid a race condition
                    //Suppose  2nd refresh event is reaches the if condition on lock to queue the event when I have just assigned the lock to 1st evnet and yet
                    //not started guideRefreshComponent.refreshSelf();
                    // So ignoring this kind of events
                    window.guidelib.author.AuthorUtils.toEnterSetTimeOut = true;
                    setTimeout(function () {
                        $(window).trigger("guideDomModified", [guideRefreshComponent.element.dom]);
                        window.guidelib.author.AuthorUtils.lockOnRefreshCycle = false;
                        // Any more refresh events - Bring it on
                        window.guidelib.author.AuthorUtils.toEnterSetTimeOut = false;
                        if (window.guidelib.author.AuthorUtils.someMorePendingRefreshRequests) {
                            window.guidelib.author.AuthorUtils.someMorePendingRefreshRequests = false;
                            window.guidelib.author.AuthorUtils.refreshGuide(guideRefreshPath);
                        }
                        $(window).trigger("guideRefreshDone");
                    }, 5);
                }, 5);
            },

            disableImagePanel : function (field) {
                if (field.getValue() != '') {
                    var dialog = field.findParentByType('dialog');
                    var smartImage = dialog.findByType('html5smartimage')[0];
                    smartImage.disable();
                }
            },

            syncGuide : function () {
                var guidePath = AuthorUtils.getGuideContainerPath(),
                    syncServlet = guidePath + ".af.sync.jsp";
                $.ajax({
                    type : "POST",
                    url : syncServlet,
                    async : true
                }).done(function (resp) {
                        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                    });
            },

            syncGuideBranding : function () {
                var guidePath = AuthorUtils.getGuideContainerPath(),
                    syncServlet = guidePath + ".af.branding.sync.jsp";
                $.ajax({
                    type : "POST",
                    url : syncServlet,
                    async : true
                }).done(function (resp) {
                        // clear sync message
                        guidelib.touchlib.initializers.initializeErrorManager._setAddGuideSyncMessage(false);
                        guidelib.touchlib.initializers.initializeErrorManager._setErrorMessage("");
                        guidelib.touchlib.initializers.initializeErrorManager.destroy();
                        guidelib.author.statusBar.hideStatusBar();
                    });
            },

            getGuideContainerPath : function () {
                return afWindow.$(AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
            },

            getGuideContainerName : function () {
                return AuthorUtils.getGuideContainerPath().substring(AuthorUtils.getGuideContainerPath().lastIndexOf("/") + 1);
            },

            _getEditableDom : function (editable) {
                return editable.el.dom;
            },

            _getAdPreviewPopOverWrapper : function () {
                return AuthorUtils.GUIDE_CONTAINER_SELECTOR;
            },

            showRuleEditor : function (show) {
                if (!_.isUndefined(show)) {
                    this._showRuleEditor = show;
                }
                return this._showRuleEditor;
            }

        };

    /*
     *   guideRefreshDone event is triggered when the guiderefresh is complete. This will scroll the window to the last element added.
     *   TODO can we also do the stuff done in "guideDomModified" here and remove "guideDomModified" event
     */
    $(window).on("guideRefreshDone", function () {
        if (!_.isEmpty(guidelib.author.instances.lastFocusItemId)) {
            var offset = afWindow.$("#" + guidelib.author.instances.lastFocusItemId).offset();
            /* Scrolling window horizontally and vertically to the offset of the last added item. i.e.(offset.left, offset.top)
             * Subtracting window.outerHeight/3 in the vertical direction so that the field does not hide behind the header and appears somewhere in the middle of the screen*/
            if (offset) {
                afWindow.scrollTo(offset.left, offset.top - window.outerHeight / 3);
            }
        }
    });

})(window, window.jQuery, guidelib);
