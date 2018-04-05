// jscs:disable requireDotNotation
/**
 * In Classic and touch authoring, the contract of edit config listeners is same.
 * But the only difference is the frame(editor/content) in which the listeners should reside into.
 * This file should contain all the edit config listeners that one needs in touch authoring.
 * Please Note, this file is loaded in content frame, hence the closure window object is referenced accordingly.
 */
(function (window, guidelib, author, channel, $) {

    var guideTouchLib = window.guidelib.touchlib,
        editConfigListeners = window.guidelib.author.editConfigListeners,
        guideTouchLibConstants = guideTouchLib.constants,
        afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        dialogUtils = guideTouchLib.editLayer.dialogUtils,
        authorUtils = guidelib.author.AuthorUtils,
        coralClassConstants = guideTouchLibConstants.coralclass,
        addedComponentPath,
        layoutComponentType = [
            "fd/af/layouts/gridFluidLayout",
            "fd/af/layouts/toolbar/defaultToolbarLayout",
            "fd/af/layouts/toolbar/mobileFixedToolbarLayout",
            "fd/adaddon/layouts/moduleGroupItems"
        ];

    /**
     * To get any editable please use this
     * @returns {*}
     * @private
     */
    window.guidelib.author.editConfigListeners._getEditable = function (path) {
        return author.editables.find(path)[0];
    };

    window.guidelib.author.editConfigListeners._getEditables = function (path) {
        return author.ContentFrame.getEditables(path);
    };

    /**
     * Refresh of editable should be done using this function
     * No direct invocation of API should be done, based on the type of authoring this
     * method would get overridden
     * @param editable
     */
    window.guidelib.author.editConfigListeners._refreshEditable = function (editable, callback) {
        editable.refresh().done(function () {
            if (editable
                && ((editable.path === afWindow.$(window.guidelib.author.AuthorUtils.ROOT_PANEL_SELECTOR).data("path"))
                || (editable.path === afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")))) {
                /* Refresh Guide is being Called ...*/
                $(window).trigger("guideDomModified", [window.guidelib.author.AuthorUtils._getEditableDom(editable)]);
                guideTouchLib.utils.refreshOverlay();
                $(window).trigger("guideRefreshDone");
                if (callback) {
                    callback();
                }
            }
            //Check if dialog path available.
            var pathOfCurrentDialogEditable = author.DialogFrame.pathOfCurrentDialogEditable;
            if (pathOfCurrentDialogEditable) {
                var editableArray = author.editables.find(pathOfCurrentDialogEditable);
                /*
                 *   Check if path is a valid path corresponding to a editable . For eg.
                 *   when editable moved to another panel the path becomes invalid . In that case
                 *   simply clear dialog.
                 *   In case if the editable dom is not present in the document, remove its dialog from side panel
                 */
                if (!editableArray || !editableArray.length) {
                    author.DialogFrame.clearDialog();
                    return;
                }
                //reposition placeholder overlay Button.
                guideTouchLib.utils.removeCurrentPlaceholderOverlay(author.DialogFrame.pathOfCurrentDialogEditable);
                guideTouchLib.utils.createPlaceholderOverlay(author.DialogFrame.pathOfCurrentDialogEditable, false);
            }
            if (addedComponentPath) {
                guideTouchLib.editLayer.Interactions.onOverlayClick({
                    editable : Granite.author.editables.find(addedComponentPath)[0]
                });
                addedComponentPath = undefined;
            }
        });
    };

    /**
     * @todo: Have to change this API later, if any issues
     * @param guideRefreshPath
     */
    window.guidelib.author.editConfigListeners.refreshGuide = function (guideRefreshPath) {
        var guideRefreshComponent = editConfigListeners._getEditable(guideRefreshPath);
        editConfigListeners._refreshEditable(guideRefreshComponent);
    };

    editConfigListeners.refreshParent = function (editable) {
        var parentPanel = author.editables.getParent(editable),
            authorUtils = guidelib.author.AuthorUtils,
            checkIfEditableIsLayoutType = function (editable) {
                return _.filter(layoutComponentType, function (editableType) {
                    // check if we get layout directly
                    var bIsEditableOfGivenType = guideTouchLib.utils.isEditableOfGivenType(editable, editableType);
                    // if layout node not present, check for any layout's which have been customized
                    if (!bIsEditableOfGivenType && editable.path != null && editable.path.length > 0) {
                        // check for the "items" name at the end of the given type to know if this is layout
                        bIsEditableOfGivenType = editable.path.lastIndexOf(authorUtils.ITEMS_NODE) !== -1
                            && editable.path.lastIndexOf(authorUtils.ITEMS_NODE) === editable.path.length - authorUtils.ITEMS_NODE.length;
                    }
                    return bIsEditableOfGivenType;
                }).length > 0;
            };
        if (typeof parentPanel === 'object' && !_.isEmpty(parentPanel)) {
            if (checkIfEditableIsLayoutType(parentPanel)) {
                parentPanel = author.editables.getParent(parentPanel);
            }
            if (parentPanel) {
                if (parentPanel.path === afWindow.$(window.guidelib.author.AuthorUtils.ROOT_PANEL_SELECTOR).data("path")) {
                    editConfigListeners.REFRESH_GUIDE();
                } else {
                    editConfigListeners._refreshEditable(parentPanel);
                }
            }
        }
    };

    editConfigListeners.REFRESH_FORM = function () {
        var editable = Granite.author.editables.find(afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path"))[0];
        if (editable) {
            //wait shown in touch authoring when guide container refreshed.
            _showWait();
            // This is called afterEdit of guideContainer.
            // In case guideContainer uses a different guideContainer via
            // useExistingAF feature, then the path pointed by the div
            // will not have a corresponding editable.
            editConfigListeners._refreshEditable(editable, _hideWait);
        }
    };

    editConfigListeners.MAKE_SIGN_DEPENDENT_AF = function () {
        var guidePath = guidelib.author.AuthorUtils.getGuideContainerPath(),
            data = {
                ":operation" : "import",
                ":contentType" : "json",
                ":replaceProperties" : true
            };
        data[":content"] = JSON.stringify({
            "_useSignedPdf" : true,
            "signerInfo" : {
                "firstSignerFormFiller" : true
            }
        });
        $.ajax({
            url : Granite.HTTP.externalize(guidePath),
            type : "POST",
            cache : false,
            data : data
        });
        editConfigListeners.GUIDE_AFTER_INSERT.apply(this);
    };

    editConfigListeners.GUIDE_AFTER_INSERT = function () {
        addedComponentPath = this.path;
        editConfigListeners.refreshParent(this);
    };

    editConfigListeners.GUIDE_AFTER_MOVE = function () {
        // If inside touch Authoring then dont do anything here. We will use touch specific listeners to refresh the html
    };

    /* This is to refresh the tree node in case of any modification in the child node*/
    editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED = function (node) {
        if (typeof node === 'object' && !_.isEmpty(node)) {
            if (node.type === "fd/af/layouts/gridFluidLayout" || node.type === "fd/af/layouts/toolbar/defaultToolbarLayout") {
                node = author.editables.getParent(node);
            }
            if (node) {
                // check if initialized by asking the edit layer itself
                if (guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
                    guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree(node.path);
                }
            }
        }
    };

    /**
     * Gives the dom element associated with the editable passed
     * @param editable
     */
    window.guidelib.author.AuthorUtils._getEditableDom = function (editable) {
        // Return the dom object and not jquery object
        if (editable.dom) {
            return editable.dom[0];
        }
    };

    window.guidelib.author.AuthorUtils._getAdPreviewPopOverWrapper = function () {
        var overLayWrapper = "#OverlayWrapper";
        return overLayWrapper;
    };

    //get dialog fields method overriden for touch ui and coral3
    guidelib.author.AuthorUtils._getDialogFields = function (panelData) {

        var title = $('[name="jcr:title"]')[0].value,
            panelName = $('[name="name"]')[0].value;

        if (panelName.search(/[ @#$%]/) > 0) {
            $('[name="name"]').attr("invalid", "");
            return false;
        }

        panelData['jcr:title'] = title;
        panelData['name'] = panelName;
        panelData['jcr:description'] = $('[name="jcr:description"]')[0].value;
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

        return (title.length > 0);
    };

    //sendData method overriden for touch ui and coral3
    guidelib.author.AuthorUtils._sendData = function (panelData, panelPath) {
        var newPanelName = panelData['name'],
            options = {
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

        var newPanelPath = panelPath + "/items/" + newPanelName;
        $CQ.ajax({
            type : "POST",
            url : Granite.HTTP.externalize(newPanelPath),
            data : options,
            async : false
        }).done(function (resp) {
                var guidePanelType = "fd/af/components/panel",
                    historyStep = author.history.util.Utils.beginStep(),
                    historyAction = new author.history.actions.fd.InsertChildPanel(newPanelPath, panelPath,
                        guidePanelType, panelData);
                historyStep.addAction(historyAction);
                historyStep.commit();
                editConfigListeners.REFRESH_GUIDE();
                // update the objects tree with this change
                editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(editConfigListeners._getEditable(panelPath));
            });

    };

    // Method to add save panel as fragment dialog
    guidelib.author.editConfigListeners.getFragmentCreationDialog = function (panelPath) {
        var dlg = new dialogUtils.GuideIndependentDialog("/mnt/override/libs/fd/af/components/panel/cq:fragmentCreationDialog.html",
            guidelib.author.editConfigListeners.createFragmentOnReady, panelPath);
        // for independent dialogs use this API, dont use openIndependentDialog of dialogFrame
        guideTouchLib.utils.openIndependentDialog(dlg);
        $("div[data-path='" + panelPath + "']").data("panelpath", panelPath);
        $("div[data-path='" + panelPath + "']").attr("data-panelpath", panelPath);
    };

    /**
     * Fetch Configure Sign Dialog
     */
    guidelib.author.editConfigListeners.getConfigureSignDialog = function () {
        var guideContainerPath = guidelib.author.AuthorUtils.getGuideContainerPath(),
            dlg = new dialogUtils.GuideIndependentDialog("/mnt/override/libs/fd/af/components/guideContainer/cq:configureSignDialog.html",
                guidelib.author.editConfigListeners.configureSignOnReady, guideContainerPath);
        guideTouchLib.utils.openIndependentDialog(dlg);
    };

    /**
     *  Replace Handler for Adaptive Form Components.
     *  This handler changes one form field type to another form field type.
     *  @todo: Replace should show only components that are compatible.
     *  @todo: Replace behavior should override common properties and delete other properties
     *  @override
     */
    guidelib.author.editConfigListeners.replaceGuideComponent = function () {
        // To support edit bar, added a tweak to set the current selected item
        // There cannot be a use case to  select multiple edit bar
        var editable = editConfigListeners._getEditable(this.path);
        editConfigListeners.replaceComponent.apply(editable, arguments);
    };

    /**
     * Replace an existing component to another type of component.
     * @returns {*}
     * @private
     */
    guidelib.author.editConfigListeners.replaceComponent = function () {
        var AuthorUtils = guidelib.author.AuthorUtils,
            isChildOfTable = AuthorUtils.GuideTableEdit.isChildOfTable(this),
            parentTablePath = null,
            parentTableEditable = null,
            $searchComponent = null,
            $clearButton = null;
        // defines replace dialog
        // Note: This code is copied from INSERT Dialog of AEM Touch UI
        // We use the same styles here, ony thing we override is "OK" listener, and title of the dialog
        // if this is a child of table, then get the parent editable of table, since cell's parent is not editable by default
        if (isChildOfTable) {
            // calling parent since table would point to table tag, but we need the table wrapper
            var $table = afWindow.$(AuthorUtils._getEditableDom(this)).closest("table").parent();
            // get the parent path
            parentTablePath = $table.attr("data-editpath");
            // use the path to get the editable since we use the allowed components defined in panel
            if (parentTablePath != null) {
                parentTableEditable = author.editables.getParent(editConfigListeners._getEditable(parentTablePath));
            }
        }

        var components = author.components.allowedComponents,
            parent = parentTableEditable != null ? parentTableEditable : author.editables.getParent(this),
            allowedComponents = author.components.computeAllowedComponents(parent, author.pageDesign),
            itemContainer;

        // in case of XFA based adaptive form, only compatible replace is allowed
        // in compatible replace component can be replaced with
        // 1. its super type or sub type (Super type will not be guidefield but one below that in type hierarchy)
        // 2. a type or super type or sub type of component defined in author.replaceComponentTable (see GuideReplaceComponentMap.js)
        var typeHierarchy = author.components.find({resourceType : this.type})[0].componentConfig.cellNames,
            editableType = this.getResourceTypeName(),
            editableSuperType = typeHierarchy[typeHierarchy.length - 2], // super type is one below guidefield in type hierarchy
            authoringConfigJson = window._afAuthorHook._getAfWindow().$(".guideContainerWrapperNode").data("guideAuthoringconfigjson"),
            compatibleReplace = authoringConfigJson.xdpRef != undefined; // if XFA based adaptive form

        var modal = $(
            '<div class="coral-Modal ReplaceComponentDialog">' +
                '<div class="coral-Modal-header">' +
                '<h2 class="coral-Modal-title coral-Heading coral-Heading--2">' + Granite.I18n.get('Replace Component') + '</h2>' +
                '<button type="button" class="coral-MinimalButton coral-Modal-closeButton" title="' + Granite.I18n.get('Close') + '" data-dismiss="modal">' +
                '<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon "></i>' +
                '</button>' +
                '</div>' +
                '<div class="coral-Modal-body ReplaceComponentDialog-components">' +
                '<coral-search class="ReplaceComponentDialog-search" placeholder="' + Granite.I18n.get("Enter Keyword") + '"></coral-search>' +
                '<ul class="coral-SelectList is-visible is-inline ReplaceComponentDialog-list" data-init="selectlist">' +
                '</div>' +
                '</div>').appendTo(document.body);

        itemContainer = modal.find(coralClassConstants.CORAL_SELECTLIST);
        $searchComponent = modal.find('.ReplaceComponentDialog-search');
        $clearButton = $searchComponent.find('button, .coral-Icon--close');

        var filterComponent = function (allowedComponents) {
            var groups = {},
                keyword = $searchComponent[0].value,
                regExp = null;

            // rebuild the itemContainer entries
            itemContainer.empty();

            if (keyword !== undefined && keyword !== null) {
                keyword = keyword.trim();
            } else {
                keyword = "";
            }

            if (keyword.length > 0) {
                regExp = new RegExp(".*" + keyword + ".*", "i");
            }

            components.forEach(function (c) {
                var cfg = c.componentConfig,
                    g,
                    componentType = cfg.cellNames[0],
                    componentSuperType = cfg.cellNames[cfg.cellNames.length - 2],  // super type is one below guidefield in type hierarchy
                    performReplace = true;

                if (keyword.length > 0) {
                    var isKeywordFound = regExp.test(Granite.I18n.getVar(cfg.title));
                }

                if (!(keyword.length > 0) || isKeywordFound) {
                    if (compatibleReplace) {
                        // perform replace as per comments above
                        if (editableType != componentType
                            && (cfg.cellNames.indexOf(editableSuperType) > -1
                            || guidelib.touchlib.replaceComponentTable.hasOwnProperty(editableSuperType)
                            && guidelib.touchlib.replaceComponentTable[editableSuperType].indexOf(componentSuperType) != -1)) {
                            performReplace = true;
                        } else {
                            performReplace = false;
                        }
                    }

                    if (performReplace) {
                        if (allowedComponents.indexOf(c.componentConfig.path) > -1 || allowedComponents.indexOf("group:" + c.getGroup()) > -1) {
                            g = c.getGroup();

                            groups[g] = groups[g] || $('<li class="coral-SelectList-item coral-SelectList-item--optgroup">' +
                                '<span class="coral-SelectList-groupHeader">' + Granite.I18n.getVar(g) + '</span>' +
                                '<ul class="coral-SelectList-sublist">' +
                                '</ul>' +
                                '</li>');

                            $('<button/>', {
                                'type' : 'button',
                                'class' : 'coral-MinimalButton coral-SelectList-item coral-SelectList-item--option ReplaceComponentDialog-component js-ReplaceComponentDialog-component',
                                'text' : Granite.I18n.getVar(cfg.title),
                                'data-path' : cfg.path
                            }).appendTo(groups[g].find(coralClassConstants.CORAL_SELECTLIST_SUBLIST));
                        }
                    }
                }
            });

            Object.keys(groups).forEach(function (g) {
                itemContainer.append(groups[g]);
            });
        };

        var modalWidget = new CUI.Modal({
            element : modal
        }), editable = this;

        var bindEventToReplaceComponentDialog = function (allowedComponents, editable) {
            $searchComponent.off("keydown.replaceComponent.coral-search");
            $searchComponent.on("keydown.replaceComponent.coral-search", $.debounce(150, function (event) {
                filterComponent(allowedComponents);
            }));

            $clearButton.off("click.replaceComponent.clearButton");
            $clearButton.on("click.replaceComponent.clearButton", function () {
                if ($searchComponent[0].value.trim().length) {
                    $searchComponent[0].value = "";
                    filterComponent(allowedComponents);
                }
            });

            modal.on('click', '.js-ReplaceComponentDialog-component', function (ev) {
                var component = author.components.find($(ev.currentTarget).attr('data-path'));
                if (component.length > 0) {
                    author.persistence.replaceParagraph(component[0], editable);
                    var historyEnabled = author.history.Manager.isEnabled(),
                        historyConfig = author.history.Manager,
                        historyStep = author.history.util.Utils.beginStep(),
                        historyAction = new author.history.actions.fd.Replace(editable.path, editable.path, editable.type, {
                            "editable" : editable,
                            "newComponent" : component[0].getResourceType(),
                            "oldComponent" : editable.type});
                    historyStep.addAction(historyAction);
                    historyStep.commit();
                }
                modalWidget.hide();
            });
        };

        filterComponent(allowedComponents);
        bindEventToReplaceComponentDialog(allowedComponents, editable);
    };

    var deleteItemsNode = function (editable) {
        // let's check if editable is of composite container type like
        // file upload and terms and conditions
        if (guideTouchLib.utils._isCompositeFormObject(editable.type)) {
            // create a promise object wrt to the items node present inside editable
            return (
                new author.persistence.PostRequest()
                    .deleteItemsNode(editable)
                    .send()
                );
        } else {
            // return a resolved promise object for program continuation
            return $.Deferred().resolve();
        }
    };

    /**
     * Checks for composite component like terms and conditions
     * and file upload component, and deletes it
     *
     * @param config
     * @param editable
     */
    author.persistence.PostRequest.prototype.deleteItemsNode = function (editable) {
        // create params to delete the items node present inside composite field node
        return (
            this
                .setURL(editable.path + "/items")
                .setParam("_charset_", "utf-8")
                .setParam(":operation", "delete")
            );
    };

    /**
     * Replace an existing component
     * @param {Object} component The component that has to be instantiated
     * @param {Object} [editable] editable which has to be replaced
     * @return {$.Deferred} A deferred object that will be resolved when the request is completed.
     */
    author.persistence.replaceParagraph = function (component, editable) {
        var args = arguments;

        channel.trigger("cq-persistence-before-replace", args);

        return (
            deleteItemsNode(editable)
                .done(function () {
                    sendReplaceParagraph({
                        resourceType : component.getResourceType(),
                        configParams : component.getConfigParams(),
                        extraParams : component.getExtraParams(),
                        templatePath : component.getTemplatePath()
                    }, editable)
                        .done(function () {
                            // refresh the parent panel
                            editConfigListeners.REFRESH_PARENT_PANEL.apply(editable);
                            // refresh editable
                            editable.refresh().done(function () {
                                // check if properties panel is open
                                if (author.DialogFrame.currentDialog && author.DialogFrame.currentDialog.editable.path == editable.path) {
                                    // clear dialog
                                    author.DialogFrame.clearDialog();
                                    // open dialog
                                    author.DialogFrame.openDialog(new author.edit.Dialog(editable));
                                }
                            });
                            // update the form object hierarchy
                            // update the form object hierarchy by checking if initialized
                            if (guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
                                guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree(editable.path);
                            }
                            channel.trigger("cq-persistence-after-replace", args);
                        })
                        .fail(function () {
                            author.ui.helpers.notify({
                                content : Granite.I18n.get("Paragraph replace operation failed."),
                                type : ns.ui.helpers.NOTIFICATION_TYPES.ERROR
                            });
                        });
                })
            );
    };

    /**
     * Send a request to replace an existing component
     * @param {String} config.resourceType The resource type of the new paragraph.
     * @param {Object} [config.configParams] The config parameters to be set upon the new paragraph's creation.
     * @param {Object} [config.extraParams] The extra parameters (would override other params) to be set upon the new paragraph's creation.
     * @param  {String} [config.templatePath] The path to the template definition that should be used.
     * @param {Object} [editable] editable to replace
     * @return {$.Deferred} A deferred object that will be resolved when the request is completed.
     */
    var sendReplaceParagraph = function (config, editable) {
        return (
            new author.persistence.PostRequest()
                .prepareReplaceParagraph(config, editable)
                .send()
            );
    };

    /**
     * Prepare a request to replace an existing component
     * @param  {String} config.resourceType The resource type of the new paragraph.
     * @param  {Object} [config.configParams] The config parameters to be set upon the new paragraph's creation.
     * @param  {Object} [config.extraParams] The extra parameters (would override other params) to be set upon the new paragraph's creation.
     * @param  {String} [config.templatePath] The path to the template definition that should be used.
     * @param  {String} [editable] The path to the editable which has to be replaced
     * @return {Object} The current object
     */
    author.persistence.PostRequest.prototype.prepareReplaceParagraph = function (config, editable) {
        // apply component properties over editable
        if (config.templatePath) {
            var comTemplatePath = Granite.HTTP.externalize(config.templatePath),
                comData = CQ.shared.HTTP.eval(comTemplatePath + ".infinity.json"); // get component default json
            editableJson = CQ.shared.HTTP.eval(editable.path + ".infinity.json"); // get editable json
            comGuideNodeClass = comData.guideNodeClass; // guideNodeClass has to be written in editable so preserve it

            // delete those properties of component which are already present in editable
            for (p in comData) {
                if (editableJson.hasOwnProperty(p)) {
                    delete comData[p];
                }
            }

            // restore guideNodeClass and sling:resourceType of component so that gets written in editable
            comData["guideNodeClass"] = comGuideNodeClass;
            comData["sling:resourceType"] = config.resourceType;
            this.setParam(":content", JSON.stringify(comData));    // write component properties
        }

        // overwrite editable properties with component properties so that data is not lost while replace operation
        return (
            this
                .setURL(editable.path)
                .setParam("_charset_", "utf-8")
                .setParams(config.configParams)
                .setParams(config.extraParams)
                .setParam(":operation", "import")
                .setParam(":contentType", "json")
                .setParam(":replace", true)
                .setParam(":replaceProperties", true)
            );
    };

    guidelib.author.editConfigListeners.createFragmentOnReady = function (panelPath) {
        $(".cq-dialog").data("panelpath", panelPath);
        if (guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOnLoad) {
            guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOnLoad();
        }
    };

    //Method to handle add child panel for root panel
    window.guidelib.author.editConfigListeners._addPanel = function (editablePath) {
        window.guidelib.author.editConfigListeners.addChildPanel(editablePath);
    };

    //Method to handle add child panel cq:dialog using coral3
    window.guidelib.author.editConfigListeners.addChildPanel = function (panelPath) {
        var dlg = new dialogUtils.GuideIndependentDialog("/mnt/override/libs/fd/af/components/panel/cq:addChildPanel.html",
            guidelib.author.editConfigListeners.addChildPanelOnReady, {panelPath : panelPath});
        guideTouchLib.utils.openIndependentDialog(dlg);
        // todo: have to remove this
        $("div[data-path='" + panelPath + "']").attr("data-parentpanelpath", panelPath);

    };

    //Method to handle add child panel on ready.
    guidelib.author.editConfigListeners.addChildPanelOnReady = function (panelPaths) {
        /*
         if(guidelib.touchlib.editLayer.dialogEventHandlers.addPanelHandler) {
         guidelib.touchlib.editLayer.dialogEventHandlers.addPanelHandler();
         }*/
    };

    //Method to handle add panel, submit event registeration
    guidelib.touchlib.editLayer.dialogEventHandlers.addPanelHandler = function () {
        var path = $("div[data-parentpanelpath]").data('parentpanelpath');
        $("div[data-parentpanelpath]").removeAttr("data-parentpanelpath");

        if (path) {
            //Binding event handler for click event of addPanelOk dialog button
            $(".cq-dialog:not('.guide-dialog') .cq-dialog-submit").on("click", {panelPath : path}, guidelib.touchlib.editLayer.dialogEventHandlers.addPanel);
        }

    };

    //Method to handle add panel action using coral3 dialog
    guidelib.touchlib.editLayer.dialogEventHandlers.addPanel = function (event) {
        var panelData = {},
            panelPath = event.data.panelPath,
            AuthorUtils = guidelib.author.AuthorUtils;

        //To prevent event propogation for touch dialog submit
        event.preventDefault();

        if (AuthorUtils._getDialogFields(panelData)) {
            AuthorUtils._sendData(panelData, panelPath);
        } else {
            $('.guideIndependentDialog input[name="jcr:title"]')[0].trigger("change");
            return false;
        }

        $(".cq-dialog:not('.guide-dialog') .cq-dialog-submit").off("click", guidelib.touchlib.editLayer.dialogEventHandlers.addPanel);
        guideTouchLib.utils.closeIndependentDialog();

    };

    //Method to handle add toolbar for panel using coral3 dialog
    window.guidelib.author.editConfigListeners.toolbar.addPanelToolbar = function (path) {

        //For panel toolbar addition
        var editable = {
            "path" : path
        };
        window.guidelib.author.editConfigListeners.toolbar.addToolbar(editable);

    };

    //Method to handle add toolbar for panel, root panel and form using coral3 dialog
    window.guidelib.author.editConfigListeners.toolbar.addToolbar = function (editable) {
        var AuthorUtils = guidelib.author.AuthorUtils;
        var editablePath;

        //To check toolbar is already present or not
        if (!window.guidelib.author.editConfigListeners._getEditable(editable.path + "/toolbar")) {
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
                url : editable.path + "/toolbar",
                data : options,
                async : false
            }).done(function (resp) {
                    // To update the objects tree with this change
                    editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(editConfigListeners._getEditable(editable.path));

                    var guideToolbar = "fd/af/components/toolbar",
                        historyStep = author.history.util.Utils.beginStep(),
                        historyAction = new author.history.actions.fd.AddToolbar(editable.path + "/toolbar", editable.path,
                            guideToolbar, options);
                    historyStep.addAction(historyAction);
                    historyStep.commit();

                    if (editable.path === afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")) {
                        window.guidelib.author.editConfigListeners.REFRESH_FORM.apply(editable);
                    } else {
                        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                    }
                });
        }

    };

    //This function opens the authoring of a fragment in a new tab in touch ui mode
    window.guidelib.author.editConfigListeners.openFragmentAuthoring = function (panelPath) {
        var url = Granite.HTTP.externalize("/editor.html" + panelPath.substr(0, panelPath.indexOf("/jcr")) + ".html");
        window.open(url);
    };

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
    window.guidelib.author.editConfigListeners.embedFragment = function (fragRef, currentPanelPath, bindRef) {
        //Removing Stale Dialog
        $("#embedFragmentDialog").remove();
        //Creating new coral3 based dialog for embed action
        var dialog = new Coral.Dialog().set({
            id : 'embedFragmentDialog',
            header : {
                innerHTML : Granite.I18n.get('Embed Fragment')
            },
            content : {
                innerHTML : Granite.I18n.get("Do you want to embed the fragment?")
            },
            footer : {
                innerHTML : '<button id="embedFragmentYes" is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Yes') +
                    '</button> <button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('No') + '</button>'
            },
            closable : "on"
        });
        document.body.appendChild(dialog);

        //Binding event handler for click event of addPanelOk dialog button
        $("#embedFragmentYes").on("click", function () {
            window.guidelib.author.editConfigListeners.embedFragmentHandler(fragRef, currentPanelPath, bindRef);
            var guidePanel = "fd/af/components/panel",
                historyStep = author.history.util.Utils.beginStep(),
                historyAction = new author.history.actions.fd.EmbedFragment(currentPanelPath, currentPanelPath, guidePanel, {
                    "fragRef" : fragRef, "bindRef" : bindRef});
            historyStep.addAction(historyAction);
            historyStep.commit();
        });

        $('#embedFragmentDialog')[0].show();

    };

    window.guidelib.author.editConfigListeners.embedFragmentHandler = function (fragRef, currentPanelPath, bindRef) {
        // by default get rootPanel's children
        var pathToHit = fragRef + "/items",
            isBinded = false,
            containerResource,
            options,
            containerPath,
            fragmentModelRoot,
            FRAGMENT_MODEL_ROOT_CONSTANT = "fragmentModelRoot",
            rootPanel,
            itemsOfRootPanel,
            success = false;

        //Remove lazy flag from Current Panel
        authorUtils.HTTP.post(currentPanelPath, {"optimizeRenderPerformance@Delete" : "false"}).done(function () {
            options = {
                ":operation" : "delete"
            };
            // delete "items" if present
            $CQ.ajax({
                type : "POST",
                url : Granite.HTTP.externalize(currentPanelPath + "/items"),
                data : options,
                async : false
            }).done(function (resp) {
                    // copy items from fragment to destination panel as is
                    options = {
                        ":dest" : currentPanelPath + "/items",
                        ":operation" : "copy"
                    };
                    $CQ.ajax({
                        type : "POST",
                        url : Granite.HTTP.externalize(pathToHit),
                        data : options,
                        async : false
                    }).done(function (resp) {
                            var params = {};
                            params["fragRef" + "@Delete"] = null;
                            params["_charset_"] = "utf-8";
                            $CQ.ajax({
                                type : "POST",
                                url : Granite.HTTP.externalize(currentPanelPath),
                                data : params,
                                async : false
                            }).done(function (resp) {
                                    if (bindRef && bindRef.length > 0) {
                                        // get the container path
                                        containerPath = fragRef.substr(0, fragRef.length - "rootPanel".length - 1);
                                        containerResource = $CQ.ajax({
                                            type : "GET",
                                            url : Granite.HTTP.externalize(containerPath + ".infinity.json"),
                                            async : false
                                        }).responseText;
                                        containerResource = JSON.parse(containerResource);
                                        fragmentModelRoot = containerResource[FRAGMENT_MODEL_ROOT_CONSTANT];
                                        rootPanel = containerResource.rootPanel;
                                        itemsOfRootPanel = rootPanel.items;
                                        _.each(itemsOfRootPanel, function (value, key) {
                                            if (typeof value === "object") {
                                                authorUtils.manipulateBindRefForEmbed(value, fragmentModelRoot, bindRef);
                                            }
                                        });
                                        // If replace:true is there then it will replace all the contents including the images that were there in the panel.
                                        options = {
                                            ":content" : JSON.stringify(itemsOfRootPanel),
                                            ":contentType" : "json",
                                            ":operation" : "import",
                                            ":replaceProperties" : true
                                        };
                                        $CQ.ajax({
                                            type : "POST",
                                            url : Granite.HTTP.externalize(currentPanelPath + "/items"),
                                            data : options,
                                            async : false
                                        }).done(function (resp) {
                                                success = true;
                                            });
                                    } else {
                                        success = true;
                                    }
                                    if (success) {
                                        window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                                        // update the objects tree with this change
                                        editConfigListeners.GUIDE_AFTER_CHILD_INSERT.apply(editConfigListeners._getEditable(currentPanelPath));
                                    }
                                });
                        });
                });
        });
    };

    //Get Som Expression handler method
    window.guidelib.author.editConfigListeners.getSOM = function (editable) {
        authorUtils.HTTP.get(editable.path + ".af.somprovider").success(function (resp) {
            var localisedSomExpressionMessage = CQ.I18n.getMessage('SOM Expression '),
                localizedWaringMessageForSomExpression = CQ.I18n.getMessage("A SOM expression is based on the position of the component. It changes if a component is moved.");
            $('#getSomDialog').remove();
            //Creating new coral3 based dialog for embed action
            var dialog = new Coral.Dialog().set({
                id : 'getSomDialog',
                header : {
                    innerHTML : localisedSomExpressionMessage
                },
                content : {
                    innerHTML : resp + '<br/> <br/>' + "<strong>*</strong>" + localizedWaringMessageForSomExpression
                },
                footer : {
                },
                closable : "on"
            });
            document.body.appendChild(dialog);

            $('#getSomDialog')[0].show();
            window.guidelib.touchlib.utils.copyToClipboard(resp);

        }).error(function (resp) {
                return false;
            });
        return true;
    };

    /*
     Simple recursive function to correct "bindRef" of the components getting embedded
     */
    window.guidelib.author.editConfigListeners.manipulateBindRefForEmbed = function (guideTypeJson, fragmentModelRoot, bindRef) {
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

        if (guideTypeJson["items"]) {
            $.each(guideTypeJson["items"], function (key, value) {
                if (typeof value == "object") {
                    AuthorUtils.manipulateBindRefForEmbed(value, fragmentModelRoot, bindRef);
                }
            });
        }
    };

    window.guidelib.author.editConfigListeners.toolbar = _.extend(window.guidelib.author.editConfigListeners.toolbar, {
        editToolbar : function () {
            var editable = window.guidelib.author.editConfigListeners._getEditable(this.path);
            author.DialogFrame.openDialog(new author.edit.Dialog(editable));
        },
        /*
         While deleting the toolbar, the children elements inside the toolbar were not getting deleted.
         So changing the deleteToolbar function behaviour
         i.e before executing DELETE, selecting the Children element of toolbar as well which needs to be delete.
         */
        deleteToolbar : function () {
            //Removing Stale Dialog
            $("#deleteToolbarDialog").remove();
            var dialog = new Coral.Dialog().set({
                id : 'deleteToolbarDialog',
                header : {
                    innerHTML : CQ.I18n.getMessage("Delete Toolbar")
                },
                content : {
                    innerHTML : CQ.I18n.getMessage("Do you want to delete the toolbar?")
                },
                footer : {
                    innerHTML : '<button id="deleteToolbar" is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Yes') +
                        '</button> <button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('No') + '</button>'
                },
                closable : "on"
            });
            document.body.appendChild(dialog);
            dialog.show();

            dialog.on('click', '#deleteToolbar', function () {
                var toolbar = Granite.author.selection.getAllSelected()[0],
                    params = {};

                authorUtils.HTTP.get(toolbar.path + ".infinity.json").done(function (responseText) {
                    params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
                    params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
                    var response = CQ.shared.HTTP.post(toolbar.path, null, params);

                    if (CQ.shared.HTTP.isOk(response)) {
                        var parentEditable = author.editables.getParent(window.guidelib.author.editConfigListeners._getEditable(toolbar.path));

                        // Need to remove the editable from author.store because item was deleted through
                        // custom POST call. This is required to clear the dialog too.
                        Granite.author.editables.remove(window.guidelib.author.editConfigListeners._getEditable(toolbar.path), true);
                        var historyStep = author.history.util.Utils.beginStep(),
                            historyAction = new author.history.actions.fd.DeleteToolbar(toolbar.path, toolbar.path,
                                toolbar.type, {"state" : responseText});
                        historyStep.addAction(historyAction);
                        historyStep.commit();
                        // if deletion successful update the first selected item with row span or colspan
                        if (parentEditable.path === afWindow.$(window.guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path")) {
                            window.guidelib.author.editConfigListeners.REFRESH_FORM();
                        } else {
                            window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                        }

                        if (guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
                            guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree(parentEditable.path);
                        }
                    }
                });
                dialog.hide();
            });
        }
    });

    window.guidelib.author.editConfigListeners.splitTableCell = function () {
        // this here refers to editable of table cell
        // check if is table cell as a safe check
        var currentSelectionItems = author.selection.getAllSelected(),
            editable = _.isArray(currentSelectionItems) ? currentSelectionItems[0] : null,
            $tableCell = editable ? afWindow.$(editable.dom).closest("td") : null,
            $tableRow = $tableCell ? $tableCell.closest("tr") : null,
            rowEditPath = $tableRow ? $tableRow.attr("data-editpath") : null,
            colSpan = $tableCell ? (+$tableCell.attr("colspan")) : 0,
            selectedItemsLength = currentSelectionItems.length,
            bSplitSuccessful = true,
            response = null,
            params = {},
            nodePathArray = [],
            nodeJsonArray = [];

        // todo: check if the selected item lie in the same column or same row, only then allow to merge else throw an error
        // check if there are selected items
        if (currentSelectionItems && editable) {
            // if the selected items are only one alert, select two or more cells to merge
            if (selectedItemsLength > 1 || colSpan === 1) {
                //Removing Stale Dialog
                $("#splitTableCellDialog").remove();
                // Show msg of invalid selection
                var dialog = new Coral.Dialog().set({
                    id : 'splitTableCellDialog',
                    header : {
                        innerHTML : CQ.I18n.getMessage("Invalid Selection")
                    },
                    content : {
                        innerHTML : CQ.I18n.getMessage("Select a merged cell to split")
                    },
                    footer : {
                        innerHTML : '<button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Ok') + '</button>'
                    },
                    closable : "on",
                    variant : "error"
                });
                document.body.appendChild(dialog);
                dialog.show();
            } else if (currentSelectionItems.length == 1) {
                if (colSpan > 1) {
                    //Saving paths and states for Clipboard options
                    nodePathArray.push(editable.path);
                    authorUtils.HTTP.get(editable.path + ".json").done(function (responseText) {
                        nodeJsonArray.push(responseText);
                    });

                    // Reset params first
                    params = {};
                    // Lets update the current cell path with colspan 1
                    params[":content"] = JSON.stringify(authorUtils.GuideTableEdit.COLSPAN_ONE_TEMPLATE);
                    // Now extend the params object to create a new object
                    params = _.extend(params, {
                        ":operation" : "import",
                        ":contentType" : "json",
                        ":replace" : true,
                        ":replaceProperties" : true
                    });
                    response = CQ.shared.HTTP.post(editable.path, null, params);
                    // Once the colspan is updated lets add new items now
                    if (CQ.shared.HTTP.isOk(response)) {
                        var orderParams = {},
                            numOfItems = colSpan - 1,
                            newCellPath = null,
                            cellName = null,
                            afterCellName = editable.path.substring(editable.path.lastIndexOf('/') + 1),
                            colIndex = $tableCell.index();
                        for (var i = 0; i < numOfItems && bSplitSuccessful; i++) {
                            cellName = authorUtils.GuideTableEdit.CONSTANT_TABLE.TABLE_CELL_NAME_PREFIX + new Date().getTime();
                            newCellPath = rowEditPath + "/items/" + cellName;
                            nodePathArray.push(newCellPath);
                            // Now create an object at this path
                            // First create a node and let the sling post node creation algorithm decide the name
                            params[":content"] = JSON.stringify(authorUtils.GuideTableEdit.ROW_ITEM_TEMPLATE);
                            response = CQ.shared.HTTP.post(newCellPath, null, params);
                            if (CQ.shared.HTTP.isOk(response)) {
                                orderParams[Granite.Sling.ORDER] = authorUtils.INSERT_AFTER + " " + afterCellName;
                                response = CQ.shared.HTTP.post(newCellPath, null, orderParams);
                                if (CQ.shared.HTTP.isOk(response)) {
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
                            var historyStep = author.history.util.Utils.beginStep(),
                                historyAction = new author.history.actions.fd.SplitTableCell(editable.path, editable.path,
                                    editable.type, {"paths" : nodePathArray, "states" : nodeJsonArray});
                            historyStep.addAction(historyAction);
                            historyStep.commit();
                            // if deletion successful update the first selected item with row span or colspan
                            editConfigListeners.REFRESH_GUIDE();
                            currentSelectionItems = null;
                        }
                    }
                }
            }
        }
    };

    window.guidelib.author.editConfigListeners.mergeTableCell = function () {
        // this here refers to editable of table cell
        // check if is table cell as a safe check
        var currentSelectionItems = author.selection.getAllSelected(),
            selectedItemsLength = currentSelectionItems.length,
            bDeleteSuccessful = false,
            nColSpanCount = 0,
            nCellsDeleted = 0,
            bMergeSuccessful = false,
            firstSelectedItemPath = null,
            $firstSelectedItem = null,
            response = null,
            params = {},
            nodePathArray = [],
            nodeJsonArray = [];
        // Initialize the params
        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;

        // check if there are selected items
        if (currentSelectionItems) {
            // if the selected items are only one alert, select two or more cells to merge
            if (selectedItemsLength === 1) {
                //Removing Stale Dialog
                $("#mergeTableCellDialog").remove();
                // Show msg of invalid selection
                var dialog = new Coral.Dialog().set({
                    id : "mergeTableCellDialog",
                    header : {
                        innerHTML : CQ.I18n.getMessage("Invalid Selection")
                    },
                    content : {
                        innerHTML : CQ.I18n.getMessage("Select two or more cells to merge")
                    },
                    footer : {
                        innerHTML : '<button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Ok') + '</button>'
                    },
                    closable : "on",
                    variant : "error"
                });
                document.body.appendChild(dialog);
                dialog.show();
            } else if (selectedItemsLength > 1) {
                // check if valid selection
                var validationState = authorUtils.GuideTableEdit._checkIfValidSelection(currentSelectionItems),
                    $tableCell = null;
                if (validationState === authorUtils.GuideTableEdit.SELECTION_CONSTANT.WITHIN_ROW) {
                    _.each(currentSelectionItems, function (item, index) {
                        //Saving paths and states for Clipboard options
                        nodePathArray.push(item.path);
                        authorUtils.HTTP.get(item.path + ".json").done(function (responseText) {
                            nodeJsonArray[index] = responseText;
                        });

                        $tableCell = afWindow.$(item.dom).closest("td");
                        nColSpanCount += (+$tableCell.attr("colspan"));
                        if (index === 0) {
                            firstSelectedItemPath = item.path;
                            $firstSelectedItem = afWindow.$(item.dom).closest("td");
                        } else {
                            // delete the component present at item.path using CQ.shared.HTTP.post
                            response = CQ.shared.HTTP.post(item.path, null, params);
                            if (CQ.shared.HTTP.isOk(response)) {
                                bDeleteSuccessful = true;
                                nCellsDeleted++;
                                // Need to remove the editable from author.store because item was deleted through
                                // custom POST call. This is required to clear the dialog too.
                                Granite.author.editables.remove(window.guidelib.author.editConfigListeners._getEditable(item.path), true);
                            } else {
                                bDeleteSuccessful = false;
                            }
                        }
                    });
                    if (bDeleteSuccessful && nCellsDeleted >= 1) {
                        // Now update property of the first selected item with rowspan or colspan
                        if (validationState === authorUtils.GuideTableEdit.SELECTION_CONSTANT.WITHIN_ROW) {
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
                        if (CQ.shared.HTTP.isOk(response)) {
                            bMergeSuccessful = true;
                        } else {
                            bMergeSuccessful = false;
                        }
                    }
                } else {
                    //Removing Stale Dialog
                    $("#mergeTableCellDialog").remove();
                    // Show msg of invalid selection
                    var dialog = new Coral.Dialog().set({
                        id : "mergeTableCellDialog",
                        header : {
                            innerHTML : CQ.I18n.getMessage("Invalid Selection")
                        },
                        content : {
                            innerHTML : CQ.I18n.getMessage("Select two or more consecutive cells within same row to merge. Merge of cells present in header row is not supported.")
                        },
                        footer : {
                            innerHTML : '<button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Ok') + '</button>'
                        },
                        closable : "on",
                        variant : "error"
                    });
                    document.body.appendChild(dialog);
                    dialog.show();
                }
            }
            if (bMergeSuccessful) {
                var firstEditable = currentSelectionItems[0],
                    historyStep = author.history.util.Utils.beginStep(),
                    historyAction = new author.history.actions.fd.MergeTableCell(firstEditable.path, firstEditable.path,
                        firstEditable.type, {"paths" : nodePathArray, "states" : nodeJsonArray});
                historyStep.addAction(historyAction);
                historyStep.commit();
                // if deletion successful update the first selected item with row span or colspan
                editConfigListeners.REFRESH_GUIDE();
                currentSelectionItems = null;
            }
        }
    };

    window.guidelib.author.editConfigListeners.addCol = function (editable) {
        var editableTable = editable,
            editablePath, oldEditableJSON,
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit;
        while (editableTable.getParentResourceType() !== GuideTableEdit.RESOURCE_TYPE_TABLE) {
            editableTable = author.editables.getParent(editableTable);
        }
        editablePath = editableTable.getParentPath();
        guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
            oldEditableJSON = responseText;
            var isColumnAdded = GuideTableEdit.addColHandler(editable);
            if (isColumnAdded) {
                guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
                    var author = Granite.author,
                        historyStep = author.history.util.Utils.beginStep(),
                        historyAction = new author.history.actions.fd.TableAction(editablePath, editablePath,
                            GuideTableEdit.RESOURCE_TYPE_TABLE, {"oldState" : oldEditableJSON, "newState" : responseText});
                    historyStep.addAction(historyAction);
                    historyStep.commit();
                });
            }
        });
    };

    window.guidelib.author.editConfigListeners.addRow = function (editable) {
        var editableTable = editable,
            editablePath, oldEditableJSON,
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit;
        while (editableTable.getParentResourceType() !== GuideTableEdit.RESOURCE_TYPE_TABLE) {
            editableTable = author.editables.getParent(editableTable);
        }
        editablePath = editableTable.getParentPath();
        guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
            oldEditableJSON = responseText;
            var isRowAdded = GuideTableEdit.addRowHandler(editable);
            if (isRowAdded) {
                guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
                    var author = Granite.author,
                        historyStep = author.history.util.Utils.beginStep(),
                        historyAction = new author.history.actions.fd.TableAction(editablePath, editablePath,
                            GuideTableEdit.RESOURCE_TYPE_TABLE, {"oldState" : oldEditableJSON, "newState" : responseText});
                    historyStep.addAction(historyAction);
                    historyStep.commit();
                });
            }
        });
    };

    window.guidelib.author.editConfigListeners.moveRowUp = function (editable) {
        var GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit,
            isMoveSuccess = GuideTableEdit.moveRowUpHandler(editable);
        if (isMoveSuccess) {
            var author = Granite.author,
                historyStep = author.history.util.Utils.beginStep(),
                historyAction = new author.history.actions.fd.TableMoveRowUp(editable.path,
                    editable.path, GuideTableEdit.RESOURCE_TYPE_TABLE_ROW);
            historyStep.addAction(historyAction);
            historyStep.commit();
        }
    };

    window.guidelib.author.editConfigListeners.moveRowDown = function (editable) {
        var GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit,
            isMoveSuccess = GuideTableEdit.moveRowDownHandler(editable);
        if (isMoveSuccess) {
            var author = Granite.author,
                historyStep = author.history.util.Utils.beginStep(),
                historyAction = new author.history.actions.fd.TableMoveRowDown(editable.path,
                    editable.path, GuideTableEdit.RESOURCE_TYPE_TABLE_ROW);
            historyStep.addAction(historyAction);
            historyStep.commit();
        }
    };

    window.guidelib.author.editConfigListeners.deleteRow = function (editable) {
        //Removing Stale Dialog
        $("#deleteRowDialog").remove();
        var dialog = new Coral.Dialog().set({
            id : 'deleteRowDialog',
            header : {
                innerHTML : CQ.I18n.getMessage("Delete Row")
            },
            content : {
                innerHTML : CQ.I18n.getMessage("Do you want to delete the selected row?")
            },
            footer : {
                innerHTML : '<button id="deleteRow" is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Yes') +
                    '</button> <button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('No') + '</button>'
            },
            closable : "on"
        });
        document.body.appendChild(dialog);
        dialog.show();

        dialog.on('click', '#deleteRow', function () {
            var params = {},
                response,
                editableTable = editable,
                editablePath,
                oldEditableJSON,
                GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit;
            while (editableTable.getParentResourceType() !== GuideTableEdit.RESOURCE_TYPE_TABLE) {
                editableTable = author.editables.getParent(editableTable);
            }
            editablePath = editableTable.getParentPath();
            guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
                oldEditableJSON = responseText;
                params[CQ.Sling.STATUS] = CQ.Sling.STATUS_BROWSER;
                params[CQ.Sling.OPERATION] = CQ.Sling.OPERATION_DELETE;
                response = CQ.shared.HTTP.post(editable.path, null, params);
                if (CQ.shared.HTTP.isOk(response)) {
                    guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
                        var author = Granite.author,
                            historyStep = author.history.util.Utils.beginStep(),
                            historyAction = new author.history.actions.fd.TableAction(editablePath, editablePath,
                                GuideTableEdit.RESOURCE_TYPE_TABLE_ROW, {"oldState" : oldEditableJSON, "newState" : responseText});
                        historyStep.addAction(historyAction);
                        historyStep.commit();
                    });
                    GuideTableEdit.refreshTable(editable.path);
                    // need to remove the editable from author.store because item was deleted through
                    // custom POST call. This is required to clear the dialog too.
                    Granite.author.editables.remove(window.guidelib.author.editConfigListeners._getEditable(editable.path), true);
                }
                dialog.hide();
            });
        });
    };

    window.guidelib.author.editConfigListeners.getTableColIndex = function (editable) {
        return $(editable.dom ? editable.dom.parent() : editable.element.dom).index();
    };

    window.guidelib.author.editConfigListeners.deleteCol = function (editable) {
        var editableTable = editable,
            editablePath,
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit;
        while (editableTable.getParentResourceType() !== GuideTableEdit.RESOURCE_TYPE_TABLE) {
            editableTable = author.editables.getParent(editableTable);
        }
        editablePath = editableTable.getParentPath();
        guidelib.author.AuthorUtils.HTTP.get(editablePath + ".infinity.json").done(function (responseText) {
            var historyOfTable = {
                "path" : editablePath,
                "oldState" : responseText
            };
            GuideTableEdit.deleteColHandler(editable, undefined, historyOfTable);
        });
    };

    window.guidelib.author.editConfigListeners.deleteColumnHandler = function (rowPathMap, editColPath, historyOfTable) {
        var cellPath = null,
            isColumnItemDeleted = false,
            params = {},
            GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit,
            response = null;

        //Removing Stale Dialog
        $("#deleteColumnDialog").remove();
        var dialog = new Coral.Dialog().set({
            id : 'deleteColumnDialog',
            header : {
                innerHTML : CQ.I18n.getMessage("Delete Column")
            },
            content : {
                innerHTML : CQ.I18n.getMessage("Do you want to delete the selected column?")
            },
            footer : {
                innerHTML : '<button id="deleteColumn" is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('Yes') +
                    '</button> <button is="coral-button" variant="primary" coral-close>' + CQ.I18n.getMessage('No') + '</button>'
            },
            closable : "on"
        });
        document.body.appendChild(dialog);
        dialog.show();

        dialog.on('click', '#deleteColumn', function () {
            var cellPath = null,
                isColumnItemDeleted = false,
                params = {},
                response = null;
            // Walk through the row path array and create a table item
            _.each(rowPathMap, function (rowMap) {
                if (rowMap.colSpan == 1) {
                    cellPath = rowMap.path;
                    params = {};
                    params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
                    params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
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
                var path = historyOfTable.path;
                guidelib.author.AuthorUtils.HTTP.get(path + ".infinity.json").done(function (responseText) {
                    var author = Granite.author,
                        historyStep = author.history.util.Utils.beginStep(),
                        historyAction = new author.history.actions.fd.TableAction(path, path,
                            GuideTableEdit.RESOURCE_TYPE_TABLE, {
                                "oldState" : historyOfTable.oldState,
                                "newState" : responseText
                            });
                    historyStep.addAction(historyAction);
                    historyStep.commit();
                });
                GuideTableEdit.refreshTable(editColPath);
                // need to remove the editable from author.store because item was deleted through
                // custom POST call. This is required to clear the dialog too.
                Granite.author.editables.remove(window.guidelib.author.editConfigListeners._getEditable(editColPath), true);
            }

            dialog.hide();
        });

    };
    var _superHasActionsAvailable = author.Editable.prototype.hasActionsAvailable;
    /**
     * Returns true if some actions are available on the editable
     */
    author.Editable.prototype.hasActionsAvailable = function () {
        // check if the config is black listed, if yes, then return false
        if (guidelib.touchlib.utils._checkIfEditableBlackListed(this)) {
            return false;
        } else {
            return _superHasActionsAvailable.apply(this);
        }
    };

    var _superEditableGetDisplayableName = author.edit.actions.getEditableDisplayableName;
    /**
     * Returns title of the editable to be used while displaying the parent hierarchy
     */
    author.edit.actions.getEditableDisplayableName = function (editable) {
        // Get the name of the element from the dom using the inspectable property
        // todo: this should invoke also in case of adaptive form
        // The immediate children of inspectable should have data-guide-authoringconfigjson
        var guideAuthoringComponentJson = $(editable.dom).children("[data-guide-authoringconfigjson]").eq(0).data("guide-authoringconfigjson");
        // if there is no title in json, then let's fallback and ask AEM for the editable title
        return guideAuthoringComponentJson ? guideAuthoringComponentJson.title : _superEditableGetDisplayableName.apply(this, [editable]);
    };

    var _superOverlayRender = author.edit.Overlay.prototype.render;
    /**
     * Renders overlay for an editable. Changing super class' logic in case of editable is a table row or header.
     */
    author.edit.Overlay.prototype.render = function (editable, container) {
        // If editable is a table row or header, its dom should be the same as in content layer.
        // Due to limitation, a cq tag is not placed correctly with tr or thead tags, due to that dom for table row is miscalculated to be equal to that of table.
        // Correcting the editable dom so that overlay can understand it and render the overlay corresponding to that.
        // In case of refresh, we would not need to update the dom as it would already been taken care of during first time setup
        if ((editable.type === guideTouchLibConstants.GUIDE_TABLE_HEADER_RESOURCE_TYPE || editable.type === guideTouchLibConstants.GUIDE_TABLE_ROW_RESOURCE_TYPE)
            && editable.dom.data("editpath") != editable.path) {
            editable.dom = editable.dom.find('[data-editPath="' + editable.path + '"]');
        }
        return _superOverlayRender.apply(this, [editable, container]);
    };

    var _superGetChildren = author.editables.getChildren,
        //wait shown in touch authoring when guide refreshed.
        _showWait = function () {
            var wrapperElement = $("#ContentWrapper").get(0);
            Granite.author.ui.helpers.wait(wrapperElement);
        },
        //wait hidden in touch authoring when guide refreshed.
        _hideWait = function () {
            Granite.author.ui.helpers.clearWait();
        };
    author.editables.getChildren = function (editable, all) {
        var path = editable.path.replace("\*", "\\*");
        if (guidelib.touchlib.utils._isTableFormObject(editable.type)) {
            var result = [],
            // All the children or only the direct descendant
                scope = all ? '.+' : '/[^/]+$',
                search = {
                    path : new RegExp('^' + path + '/items' + scope)
                };

            if (search.path) {
                $.each(author.editables, function (i, e) {
                    // path searching
                    if (search.path.test(e.path)) {
                        result.push(e);
                    }
                });
            }
            return result;
        } else {
            return _superGetChildren.apply(this, [editable, all]);
        }
    };

})(window.parent._afAuthorHook ? window.parent._afAuthorHook._getEditorWindow() : window, guidelib, Granite.author, jQuery(document), $);
