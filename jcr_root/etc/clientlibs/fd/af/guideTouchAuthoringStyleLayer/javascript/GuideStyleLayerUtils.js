/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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

;(function ($, _, author, guidetouchlib, style, undefined) {

    var guideStyleLayerConstants = guidetouchlib.styleLayer.constants,
        guideStyleConstants = guidetouchlib.style.constants,
        guideStyleLayer = guidetouchlib.styleLayer,
        guideCommonStyle = guidetouchlib.style,
        guideStyleVars = guideCommonStyle.vars,
        guideStyleLayerVars = guideStyleLayer.vars,
        guideStyleLayerUtils = guideStyleLayer.utils = guideStyleLayer.utils || {},
        styleUtils = style.utils,
        styleAssetLib = style.assetLibrary,
        styleAssetLibVars = styleAssetLib.vars,
        styleAssetLibUtils = styleAssetLib.utils,
        styleConstants = style.constants,
        authoringConstants = guidetouchlib.constants;
    /* Process the whole stylable configs JSON to be used later for each component type*/
    var processJSON = function (component, data, path) {
        var outputData = {}, items;
        component = (component === "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
        guideStyleVars.mapping[component] = guideStyleVars.mapping[component] || {};
        if (path) {
            outputData.label = data["jcr:title"];
            outputData.name = data["jcr:title"];
            outputData.path = path;
            outputData.id = data.id ? data.id : path;
            if (data.id) {
                guideStyleVars.mapping[component][data.id] = path;
            }
            outputData.cssSelector = data.cssSelector;
            outputData.propertySheet = data.propertySheet;
            window.guidelib.touchlib.style.utils.addJsonPostHandler(component, outputData.id, data.jsonPostHandler);
        } else {
            outputData.label = "";
            outputData.path = "";
            data = data["cq:styleConfig"];
            path = "";
            outputData.id = data.id ? data.id : path;
        }
        items = data.items;
        if (items) {
            outputData.items = {};
            for (var key in items) {
                if (items[key]["jcr:title"]) {
                    outputData.items[key] = processJSON(component, items[key], path ? path + "/" + key : key);
                }
            }
        }
        if (data.states) {
            var states = data.states;
            outputData.states = {};
            for (var key in states) {
                if (states[key]["jcr:title"]) {
                    outputData.states[key] = processJSON(component, states[key], path ? path + "/" + key : key);
                }
            }
        }

        return outputData;
    };

    var parseJSON = function (data) {
        var outputData = {};
        for (var key in data) {
            outputData[key] = processJSON(key, data[key]);
        }
        return outputData;
    };

    /* One time call to this function will get all the stylable configs for the page*/
    guideStyleLayerUtils.getStylableConfigJSON = function () {
        var doc = window._afAuthorHook._getAfWindow().document,
            contentPageUrl = author.ContentFrame.contentURL,
            contentPagePath = contentPageUrl.substring(0, contentPageUrl.lastIndexOf(".html")),
            contentPageComponentPath = contentPagePath + "/jcr:content",
            sourceURL = contentPageComponentPath + ".inline.styleconfig";

        $.ajax({
            url : sourceURL,
            success : function (result) {
                guideStyleVars.stylableConfigsJson = parseJSON(JSON.parse(result));
                //handle get guideContainerWrapper in JSON

                if (guideStyleVars.stylableConfigsJson && guideStyleVars.stylableConfigsJson['fd/af/components/guideContainerWrapper']) {
                    guideStyleVars.stylableConfigsJson['fd/af/components/guideContainer'] = guideStyleVars.stylableConfigsJson['fd/af/components/guideContainerWrapper'];
                    delete guideStyleVars.stylableConfigsJson['fd/af/components/guideContainerWrapper'];
                }
                guideStyleLayer.overlays.setupOverlays();
            },
            failure : function (result) {
                if (console) {
                    console.log("Error: Unable to retrieve style config: " + result);
                }
            }
        });
    };

    getMetaData = function (component, selector, property, state) {
        if (!(component && selector && property)) {
            return;
        }
        var json = guidetouchlib.style.vars.stylableConfigsJson[component];
        //if ID based on selector, get path to the selector
        if (guideStyleVars.mapping[component][selector]) {
            selector = guideStyleVars.mapping[component][selector];
        }

        var selectors = selector.split("/");
        var i = 0;
        for (i = 0; i < selectors.length; i++) {
            if (json && json.items) {
                json = json.items[selectors[i]];
            }
        }
        if (json && json.states && state) {
            json = json.states[state];
        }
        if (json) {
            if (property === "cssSelector") {
                return styleUtils.generateSelectorString(guideStyleVars.cssTempClass, json[property], true);
            } else if (property === "cssSelectorWithoutClass") {
                return json.cssSelector;
            } else {
                return json[property];
            }
        }
    };

    /* Overriding the default implementation of the common Style Utils*/
    /* To get the given property value of the current selector */
    guideCommonStyle.utils.getSelectorMetaData = function (component, selector, property) {
        return getMetaData(component, selector, property);
    };

    /* Overriding the default implementation of the common Style Utils*/
    guideCommonStyle.utils.getStateMetaData = function (component, selector, state, property) {
        return getMetaData(component, selector, property, state);
    };

    /* This function bind events on the tree items to show/hide edit icons on the elements*/
    guideStyleLayerUtils.bindFocusEvents = function (event) {
        var $treeObjectsElement = $(event.currentTarget).find(".sidepanel-tree-item:not(.toplevel-element)"),
            objectEditIconHideClass = "styleEditIconHide",
            sidePanelTreeItemDivSelector = ".sidepanel-tree-item-div",
            objectEditIconSelector = ".styleEditIcon";
        $treeObjectsElement.on("focusin", function (ev) {
            ev.stopPropagation();
            var $focussedElement = $(ev.target),
                $focussedElementEditIcon = $focussedElement.children(sidePanelTreeItemDivSelector).children(objectEditIconSelector),
                $focussedElementParents = $focussedElement.parent().closest(".sidepanel-tree-item:not(.toplevel-element)"),
                $focussedElementParentsEditIcon = $focussedElementParents.children(sidePanelTreeItemDivSelector).children(objectEditIconSelector);
            $focussedElementEditIcon.removeClass(objectEditIconHideClass);
            $focussedElementParentsEditIcon.removeClass(objectEditIconHideClass);
        });
        $treeObjectsElement.on("focusout", function (ev) {
            ev.stopPropagation();
            var $focussedElement = $(ev.target),
                $focussedElementEditIcon = $focussedElement.children(sidePanelTreeItemDivSelector).children(objectEditIconSelector),
                $focussedElementParents = $focussedElement.parent().closest(".sidepanel-tree-item:not(.toplevel-element)"),
                $focussedElementParentsEditIcon = $focussedElementParents.children(sidePanelTreeItemDivSelector).children(objectEditIconSelector);
            $focussedElementEditIcon.addClass(objectEditIconHideClass);
            $focussedElementParentsEditIcon.addClass(objectEditIconHideClass);
        });
    };

    /* This is to initialize the JSON with a similar structure of theme*/
    guideStyleLayerUtils.initializeJSON = function () {
        guideStyleVars.json = {};
        guideStyleVars.json.components = {};
        guideCommonStyle.utils.initializeBreakpointInfo();
    };

    guideStyleLayerUtils.showFormObjectsTree = function () {
        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_OBJECTS_CONTAINER_ID).show(); // show the form objects tree
        $("#" + guideStyleLayerConstants.GUIDE_STYLABLE_CONFIG_CONTAINER_ID).hide();   // hide the stylable Configs tree
        styleUtils.hidePropertySheetContainer();  // hide the Property Sheet
    };

    guideStyleLayerUtils.showStylableConfigsTree = function () {
        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_OBJECTS_CONTAINER_ID).hide(); // hide the form objects tree
        $("#" + guideStyleLayerConstants.GUIDE_STYLABLE_CONFIG_CONTAINER_ID).show();   // show the stylable Configs tree
        styleUtils.hidePropertySheetContainer();  // hide the Property Sheet
    };

    guideStyleLayerUtils.showPropertySheetPanel = function () {
        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_OBJECTS_CONTAINER_ID).hide(); // hide the form objects tree
        $("#" + guideStyleLayerConstants.GUIDE_STYLABLE_CONFIG_CONTAINER_ID).hide();   // hide the stylable Configs tree
        styleUtils.showPropertySheetContainer();  // Show the Property Sheet
    };

    guideStyleLayerUtils.getJson = function () {
        return guideStyleVars.json;
    };

    guideStyleLayerUtils.getTimeStamp = function () {
        return new Date().getTime();
    };

    /* Overriding the default implementation of the common Style Utils*/
    guideCommonStyle.utils.propertySheetUpdated = function () {
        guideStyleLayerUtils.applyCSSOnForm();
    };

    /* Overriding the default implementation of the common Style Utils*/
    guideCommonStyle.utils.propertySheetSaved = function () {
        if (!style.vars.isPropertySheetChanged) {
            return ;
        }
        var $styleAlertSelectorChange = $(guideStyleLayerConstants.GUIDE_STYLE_SELECTOR_CHANGE_ALERT);
        $styleAlertSelectorChange.stop(true, true).addClass("hideAlertComponentChange").css("opacity", "0");
        if (!guideStyleVars.uirestrictions.blockPropertySheetSave) {
            styleUtils.closeAllOpenPopovers();
            styleUtils.preSaveProcessor(styleUtils.preSavePostHandler);
        }
    };

    /**
     * Applying css on form.
     * @param {Object} cssGenerationParams.
     * cssGenerationParams contains parameters which are require for cssGenerationOperation at client/server side and redo/undo.
     * it contains old json, newJson, css class,component, editablePath.
     */

    guideStyleLayerUtils.applyCSSOnForm = function (cssGenerationParams) {
        // TODO  -- remove the old style tag and insert a new one
        var editable = cssGenerationParams ? window.guidelib.author.editConfigListeners._getEditable(cssGenerationParams.editablePath) : guideStyleVars.currentEditable,
            cssClass = cssGenerationParams ? cssGenerationParams.editableCssClass : guideStyleVars.cssClass,
            json = cssGenerationParams ? cssGenerationParams.newStyleJson : guideStyleVars.json,
            styleAssetsPrefixPath = cssGenerationParams ? cssGenerationParams.styleAssetsPrefixPath : guideStyleVars.styleAssetsPrefixPath;
        editable.dom.removeClass(cssClass);  // Remove the original CSS class
        editable.dom.removeClass(guideStyleVars.cssTempClass);  // Remove the temp class applied on this component
        guideStyleVars.cssTempClass = "guide-" + guideStyleLayerUtils.getTimeStamp();   // Temp Class to be used for client side temp changes
        editable.dom.addClass(guideStyleVars.cssTempClass);  // Add this new tempo class on this component
        var css = guideCommonStyle.utils.generateCssString(false, json, styleAssetsPrefixPath);
        editable.dom.children(".guideTempStyleTag").remove();
        editable.dom.append("<style class='guideTempStyleTag'>" + css + "</style>");
    };

    /* Overriding the default implementation of the common Style Utils*/
    /* Update the property sheet with the new JSON of this components selector*/
    guideCommonStyle.utils.processSelectorUpdated = function () {
        /* Get this components JSON from the server*/
        guideStyleLayerUtils.updateCssGenerationParams(true);
        guideCommonStyle.utils.updateStateList("#" + guideStyleLayerConstants.GUIDE_STYLE_PROPERTIES_STATE_NAME_ID, guideStyleVars.currentComponent, guideStyleVars.currentSelector);
        guideCommonStyle.ui.populatePropertySheet();
        styleUtils.takePropertySheetBackup(guideStyleVars.json, guideStyleVars.currentComponent, guideStyleVars.currentSelector);
    };

    /**
     * get component name of the editable.
     */
    guideStyleLayerUtils.getEditableComponent = function (editable) {
        var component = editable.type;
        return (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
    };

    // Adding history step.
    guideStyleLayerUtils.addHistoryStep = function (options) {
        styleUtils.history.Manager.addStep({
            "editablePath" : options.editablePath,
            "component" : options.component,
            "selector" : options.currentSelector,
            "undoJson" : options.undoJson,
            "redoJson" : options.redoJson
        });
    };

    /**
     * Save style properties at the server.
     * @param {Object} cssGenerationParams parameter containing json, cssClass and editablePath.
     * @param {function} callback to be called after saving style properties.
     */

    guideStyleLayerUtils.saveStyleProperties = function (cssGenerationParams, callback) {
        var styleData = {},
            dataValue = {},
            cssClass,
            component,
            editable,
            componentJson;
        if (cssGenerationParams) {
            cssClass = cssGenerationParams.editableCssClass;
            component = cssGenerationParams.component;
            editable = window.guidelib.author.editConfigListeners._getEditable(cssGenerationParams.editablePath);
            componentJson = cssGenerationParams.newStyleJson;
        } else {
            cssClass = guideStyleVars.cssClass;
            component = guideStyleVars.currentComponent;
            editable = guideStyleVars.currentEditable;
            componentJson = guideStyleVars.json;
        }
        guideStyleVars.cssTempClass = cssClass;
        /* Saving the generated CSS at the component node*/
        styleData["jcr:primaryType"] = "nt:unstructured";
        styleData[guideStyleLayerConstants.GUIDE_STYLE_NODE_NAME] = componentJson.components[component];
        styleData[guideStyleVars.cssPropertyName] = cssClass;
        dataValue._charset_ = "utf-8";
        dataValue.formPath = Granite.HTTP.getPath(Granite.author.ContentFrame.contentURL);
        dataValue[":contentType"] = "json";
        if (styleData[guideStyleLayerConstants.GUIDE_STYLE_NODE_NAME] && !(_.isEmpty(styleData[guideStyleLayerConstants.GUIDE_STYLE_NODE_NAME]))) {
            dataValue[":content"] = JSON.stringify(styleData);
        }
        dataValue[":operation"] = "af:saveStyleOperation";
        dataValue[":replaceProperties"] = "true";
        $CQ.ajax({
            type : "POST",
            url : CQ.shared.HTTP.externalize(editable.path),
            data : dataValue,
            async : false,
            success : function (response) {
                if (guideStyleVars.isOldJsonFormat) {
                    params = {};
                    params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
                    params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;
                    CQ.shared.HTTP.post(editable.path + "/styleProperties", null, params);
                }
                if (callback) {
                    callback();
                }
            },
            error : function (response) {
                if (console) {
                    console.log("Unable to save the style configuration: " + response);
                }
            }
        });
    };

    /**
     * get Editables object from its path.
     */
    guideStyleLayerUtils.getEditableFromPath = function (path) {
        return window.guidelib.author.editConfigListeners._getEditable(path);
    };

    guideStyleLayerUtils.cancelStyleProperties = function () {
        guideStyleLayerUtils.updateJSON(guideStyleVars.propertySheetBackupJson);
        guideCommonStyle.utils.clearPropertySheetDirtyFlag();
        guideStyleVars.currentSelectedOverlayTarget = undefined;
        guideStyleLayer.overlays.hideSelectorOverlays();
        guideStyleLayer.overlays.removeActiveSelectorOverlays();
        if (guideStyleVars.json.components[guideStyleVars.currentComponent]) {
            guideStyleLayerUtils.applyCSSOnForm();
        }
        guideStyleVars.currentSelector = "";
        styleUtils.clearPreprocessPropertiesJson();
        styleAssetLibUtils.clearCurrentStyles();
    };

    /* Overriding the default implementation of the common Style Utils*/
    guideCommonStyle.utils.getLastModifiedTime = function () {
        //TODO
    };

    guideStyleLayerUtils.updateJSON = function (json) {
        if (json) {
            if (!guideStyleVars.json.components[guideStyleVars.currentComponent]) {
                guideStyleVars.json.components[guideStyleVars.currentComponent] = {};
            }
            guideStyleVars.json.components[guideStyleVars.currentComponent][guideStyleVars.currentSelector] = json;
        } else {
            if (guideStyleVars.json.components[guideStyleVars.currentComponent]) {
                delete guideStyleVars.json.components[guideStyleVars.currentComponent][guideStyleVars.currentSelector];
            }
        }
    };

    /**
     * Save style properties at the server.
     * @param {Object} data parameter json containing old json,new json, currentEditablePath.
     * @param {function} isUndo if is undo operation.
     */
    styleUtils.restorePropertySheetUndoRedoData = function (data, isUndo) {
        var selector = data.selector,
            editablePath = data.editablePath,
            component = data.component,
            editable = window.guidelib.author.editConfigListeners._getEditable(editablePath),
            editablePath = editable.path,
            cssGenerationParams = {},
            prop = CQ.shared.HTTP.eval(editablePath + ".json"),
            cssClass = prop[guideStyleVars.cssPropertyName],
            componentObjectString = "components." + component;
        component = (component == "fd/af/components/guideContainerWrapper" ? "fd/af/components/guideContainer" : component);
        if (!cssClass) {
            cssClass = "guide-" + guideStyleLayer.utils.getTimeStamp();
        }
        cssGenerationParams.editablePath = editablePath;
        cssGenerationParams.component = component;
        cssGenerationParams.styleAssetsPrefixPath = editablePath;
        cssGenerationParams.styleAssetsRelativePath = guideStyleConstants.ASSETS_LOCATION;
        cssGenerationParams.editableCssClass = cssClass;
        if (component && editable) {
            newJson = {};
            newJson.components = {};
            if (isUndo) {
                if (data.undoJson) {
                    newJson.components[component] = JSON.parse(JSON.stringify(data.undoJson));
                } else {
                    newJson.components[component] = {};
                }
            } else {
                if (data.redoJson) {
                    newJson.components[component] = JSON.parse(JSON.stringify(data.redoJson));
                } else {
                    newJson.components[component] = {};
                }
            }
            cssGenerationParams.newStyleJson = newJson;
        }
        guideStyleLayerUtils.saveStyleProperties(cssGenerationParams);
        guideStyleLayerUtils.applyCSSOnForm(cssGenerationParams);
        guideStyleLayerUtils.takeBackupAndUpdatePropertySheet(cssGenerationParams);
        styleUtils.history.Manager.setOperationActive(false);
    };

    /* Overriding the default implementation of the common Style Utils*/
    guideCommonStyle.utils.getLeftRailHeaderText = function () {
        return Granite.author.edit.actions.getEditableDisplayableName(guideStyleVars.currentEditable) + " - " +
            guideCommonStyle.utils.getSelectorMetaData(guideStyleVars.currentComponent, guideStyleVars.currentSelector, "name");
    };

    /**
     * copy stylable editable information.
     * @param {Object} editable parameter containing json, cssClass and editablePath.
     * @param {string} component to be called after saving style properties.
     */
    guideStyleLayerUtils.copyEditableStyle = function (editable, component) {
        guideStyleLayerVars.copiedEditable = editable;
        guideStyleLayerVars.copiedComponent = component;
        guideStyleLayer.utils.enterCopyMode();
    };

    /**
     * exit the copy mode from style layer by reverting the ui changes
     * which were done when copy action is done.
     */
    guideStyleLayer.utils.exitCopyMode = function () {
        if (_.isEmpty(guideStyleLayerVars.copiedComponent)) {
            return ;
        }
        guideStyleLayerVars.isCopyModeEnabled = false;
        guideStyleLayer.overlays.showSelectorOverlays();
        $(styleUtils.getContentFrame()).contents().find("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTED_CLASS).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTED_CLASS);
        $(styleUtils.getContentFrame()).contents().find("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTABLE_CLASS).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTABLE_CLASS);
        $(styleUtils.getContentFrame()).contents().find("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPIED_EDITABLE_CLASS).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPIED_EDITABLE_CLASS);
        $(styleUtils.getContentFrame()).contents().find("body").removeClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COPY_MODE_CLASS);
        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_OVERLAY_CLASS);
        guideStyleVars.currentComponentOverlayTarget = guideStyleLayer.utils.getEditableComponentOverlayDom(guideStyleLayerVars.copiedEditable);
        guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
        guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_SELECTOR_DATA_ATTRIBUTE);
        $(styleUtils.getContentFrame()).contents().find("." + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE).removeClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE);
    };

    /**
     * Check if the editable has component type as the copied editable.
     */
    guideStyleLayerUtils.isEditablePastable = function (editable) {
        var component = editable.type;
        if (component == guideStyleLayerVars.copiedComponent) {
            //Special Handling for Panels: For panel we only show those panel which have same layout as the copied panel.
            if (guideStyleLayerVars.copiedComponent.toLowerCase() ==  authoringConstants.PANEL_COMPONENT_PATH) {
                if (guideStyleLayerUtils.getPanelType(guideStyleLayerVars.copiedEditable.path) ==
                    guideStyleLayerUtils.getPanelType(editable.path)) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;
    };

    /**
     * paste editables styles.
     * @param {Object} toEditable the editable on which style need to be copied.
     * @param {Object} toComponent the component on which style need to be copied.
     */
    guideStyleLayerUtils.pasteEditableStyle = function (toEditable, toComponent) {
        var options = {
            editablePath : toEditable.path,
            component : toComponent,
            operation : 'copy'
        };
        //first parameter is set to update style params.Second parameter is for options for generating cssGenerationsParams.
        var cssGenerationParams = guideStyleLayerUtils.updateCssGenerationParams(false, options);
        //to prevent multiple paste on same object.
        if (_.isEqual(cssGenerationParams.oldStyleJson, cssGenerationParams.newStyleJson)) {
            return ;
        }
        var operation = "af:copyStyleOperation";
        $.ajax({
            type : 'POST',
            url : CQ.shared.HTTP.externalize(toEditable.path),
            async : true,
            data : {
                ':operation' : operation,
                'fromEditablePath' : CQ.shared.HTTP.externalize(guideStyleLayerVars.copiedEditable.path),
                'cssClass' : cssGenerationParams.editableCssClass
            },
            success : function () {
                _pasteEditableCallback(cssGenerationParams);
            }
        });
    };

    /**
     * update cssGeneration Params object.
     * @param {Boolean} isSettingGloabalParams to set the global params for css generation.
     * @param {Object} options which are used to make cssGeneration params like editablePath, component etc.
     */
    guideStyleLayerUtils.updateCssGenerationParams = function (isSettingGlobalParams, options) {
        var json,
            cssGenerationParams = {},
            editablePath = options ? options.editablePath : guideStyleVars.currentEditable.path,
            component = options ? options.component : guideStyleVars.currentComponent,
            oldFullJson = CQ.shared.HTTP.eval(editablePath + ".3.json"),
            cssClass = oldFullJson[guideStyleVars.cssPropertyName],
            fullJson,
            oldJson = oldFullJson.style;
        if (!cssClass) {
            cssClass = "guide-" + guideStyleLayer.utils.getTimeStamp();
        }
        if (oldJson) {
            _updateJsonSelectorToIds(oldJson, component);
        } else {
            oldJson = {};
        }
        if (options && options.operation && options.operation.toLowerCase() == 'copy') {
            fullJson = CQ.shared.HTTP.eval(guideStyleLayerVars.copiedEditable.path + ".3.json");
            json = fullJson.style;
        } else if (options && options.operation && options.operation.toLowerCase() == 'clear') {
            json = undefined;
        }else {
            if (cssClass) {
                fullJson = CQ.shared.HTTP.eval(editablePath + ".3.json");
                json = fullJson.style;
            }
        }
        if (json) {
            _updateJsonSelectorToIds(json, component);
        } else {
            json = {};
        }
        if (isSettingGlobalParams) {
            guideStyleVars.styleAssetsPrefixPath = editablePath;
            guideStyleVars.styleAssetsRelativePath = guideStyleConstants.ASSETS_LOCATION;
            guideStyleVars.json.components[component] = json;
            guideStyleVars.cssClass = cssClass;
            return;
        } else {
            cssGenerationParams.editablePath = editablePath;
            cssGenerationParams.component = component;
            cssGenerationParams.styleAssetsPrefixPath = editablePath;
            cssGenerationParams.styleAssetsRelativePath = guideStyleConstants.ASSETS_LOCATION;
            cssGenerationParams.editableCssClass = cssClass;
            cssGenerationParams.newStyleJson = {};
            cssGenerationParams.newStyleJson.components = {};
            cssGenerationParams.newStyleJson.components[component] = json;
            cssGenerationParams.oldStyleJson = {};
            cssGenerationParams.oldStyleJson.components = {};
            cssGenerationParams.oldStyleJson.components[component] = oldJson;
            return cssGenerationParams;
        }
    };

    /**
     * Save style properties at the server.
     * @param {Object} json the json to be updated.
     * @param {String} current component.
     */
    var _updateJsonSelectorToIds = function (json, component) {
        _.each(json, function (selector, selectorString) {
            if (selectorString !== "jcr:primaryType") {
                var componentMapping = guideStyleVars.mapping[component];
                if (componentMapping) {
                    if (!componentMapping[selectorString]) {
                        //not an ID, has to be path - update to ID
                        _.each(componentMapping, function (value, selectorId) {
                            if (selectorString === value) {
                                json[selectorId] = json[selectorString];
                                delete json[selectorString];
                            }
                        });
                    }
                }
            }
        });
    };
    /**
     * Clear editable style.
     * @param {Object} editable the editable which needs to be cleared.
     * @param {String} component the component which needs to be cleared.
     */
    guideStyleLayerUtils.clearEditableStyle = function (editable, component) {
        var options = {
            editablePath : editable.path,
            component : component,
            operation : 'clear'
        };
        var cssGenerationParams = guideStyleLayerUtils.updateCssGenerationParams(false, options);
        guideStyleLayerUtils.updateStyleAndApplyCssOnForm(cssGenerationParams);
        //first parameter is set to update style params.Second parameter is for options for generating cssGenerationsParams.
    };

    /**
     * update server, take propertysheetbackup, update propertsheet and add undo/redo step.
     * @param {Object} cssGenerationParams the object containing parameters for css Generation.
     */
    guideStyleLayerUtils.updateStyleAndApplyCssOnForm = function (cssGenerationParams) {
        //to prevent multiple clear on same object.
        if (_.isEqual(cssGenerationParams.oldStyleJson, cssGenerationParams.newStyleJson)) {
            return ;
        }
        var componentObjectString = "components." + cssGenerationParams.component,
            oldJson = JSON.parse(JSON.stringify(cssGenerationParams.oldStyleJson)),
            newJson = JSON.parse(JSON.stringify(cssGenerationParams.newStyleJson)),
            component = cssGenerationParams.component,
            editablePath = cssGenerationParams.editablePath;
        guideStyleLayerUtils.saveStyleProperties(cssGenerationParams);
        guideStyleLayerUtils.applyCSSOnForm(cssGenerationParams);
        var historyStepOptions = {
            "editablePath" : editablePath,
            "component" : component,
            "undoJson" : oldJson.components[component],
            "redoJson" : newJson.components[component]
        };
        guideStyleLayerUtils.addHistoryStep(historyStepOptions);
        guideStyleLayerUtils.takeBackupAndUpdatePropertySheet(cssGenerationParams);
    };

    /**
     * take propertysheetbackup and update propertsheet.
     * @param {Object} cssGenerationParams the object containing parameters for css Generation.
     */

    guideStyleLayerUtils.takeBackupAndUpdatePropertySheet = function (cssGenerationParams) {
        if (guideStyleVars.currentEditable && (guideStyleVars.currentEditable.path == cssGenerationParams.editablePath)) {
            guideStyleVars.json.components = JSON.parse(JSON.stringify(cssGenerationParams.newStyleJson));
            if (guideStyleVars.currentSelector && guideStyleVars.currentSelector != "") {
                var selectorObjectString = "components." + guideStyleVars.currentComponent + "." + guideStyleVars.currentSelector,
                    selectorJson = window.expeditor.Utils.getOrElse(cssGenerationParams.newStyleJson, selectorObjectString, {});
                styleUtils.takePropertySheetBackup(selectorJson, cssGenerationParams.component, cssGenerationParams.currentSelector);
                guideCommonStyle.ui.populatePropertySheet();
            }
        }
    };

    /**
     * simulate the copy mode when the copy button is clicked.
     */
    guideStyleLayerUtils.enterCopyMode = function () {
        guideStyleVars.currentEditable = undefined;
        guideStyleVars.currentComponent = undefined;
        guideStyleVars.currentSelector = undefined;
        guideStyleLayerVars.isCopyModeEnabled = true;
        guideStyleLayer.overlays.hideSelectorOverlays();
        guideStyleLayerUtils.showFormObjectsTree();
        guideStyleLayer.overlays.removeActiveSelectorOverlays();
        var copiedEditableDom = guideStyleLayerUtils.getEditableComponentOverlayDom(guideStyleLayerVars.copiedEditable),
            $copiedEditableDom = $(copiedEditableDom),
            $pastableEditables = guideStyleLayerUtils.getPastableEditablesDom(),
            $pastableEditable;
        $pastableEditables.addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTABLE_CLASS);
        $copiedEditableDom.addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPIED_EDITABLE_CLASS);
        $copiedEditableDom.addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_IS_PASTED_CLASS);
        $("#" + guideStyleLayerConstants.GUIDE_STYLE_LAYER_COMPONENT_OVERLAY_ID).addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_OVERLAY_CLASS);
        _.find($pastableEditables, function (pastableEditable) {
            if (pastableEditable.innerHTML != copiedEditableDom.innerHTML) {
                $pastableEditable = $(pastableEditable);
                return true;
            }
        });
        if (_.isEmpty($pastableEditable)) {
            $pastableEditable = $copiedEditableDom;
        }
        $pastableEditable.addClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_COPY_MODE_CURRENT_OVERLAY_EDITABLE);
        guideStyleVars.currentComponentOverlayTarget = $pastableEditable.get(0);
        $(styleUtils.getContentFrame()).contents().find("body").addClass(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COPY_MODE_CLASS);
        guideCommonStyle.overlay.repositionOverlay(guideStyleLayer.constants.GUIDE_STYLE_LAYER_COMPONENT_DATA_ATTRIBUTE);
    };

    /**
     * get the dom of the editables which have same component type as the copied editable.
     */
    guideStyleLayerUtils.getPastableEditablesDom = function () {
        var $pastableEditablesDom = $(guideCommonStyle.utils.getContentFrame()).contents().find("[data-stylable-component='" + guideStyleLayerVars.copiedComponent + "']");
        $pastableEditablesDom.filter(function () {
            var editable = guideStyleLayerUtils.getEditableFromPath($(this).data("stylable-path"));
            if (guideStyleLayerUtils.isEditablePastable(editable)) {
                return true;
            };
        });
        return $pastableEditablesDom;
    };

    /*
     * Set the asset library asset path.
     */
    styleUtils.setAssetLibraryPath = function () {
        var assetLibraryPath = "",
            authConfigJson,
            themePath = "",
            authConfigJson =  styleUtils.getAuthoringConfigJson();
        if (!_.isEmpty(authConfigJson)) {
            themePath = authConfigJson[guideStyleConstants.THEME_PATH_PROPERTY_NAME];
        }
        if (!_.isEmpty(themePath)) {
            assetLibraryPath = themePath + "/" + guideStyleConstants.JCR_CONTENT_NODE_NAME +
                               guideStyleConstants.ASSET_LIBRARY_THEME_RELATIVE_PATH;
        }
        styleAssetLibVars.assetLibraryPath = assetLibraryPath;
    };

    styleUtils.initializeAssetLibrary = function () {
        styleUtils.setAssetLibraryVars();
    };

    /*
     * Set the asset library Saved style json.
     */
    styleUtils.setAssetLibrarySavedStylesJson = function () {
        var json = {};
        if (_.isEmpty(styleAssetLibVars.assetLibraryPath)) {
            _initializeSavedStyleJson(json);
            return;
        }
        var url = Granite.HTTP.externalize(styleAssetLibVars.assetLibraryPath + ".infinity.json");
        $.ajax({
            url : url,
            type : "GET",
            async : true,
            cache : false,
            success : function (response) {
                json = response;
                _initializeSavedStyleJson(json);
            },
            error : function (response) {
                _initializeSavedStyleJson(json);
            }
        });
    };

    /**
     * return current editor name.
     */
    styleUtils.getCurrentEditorName = function () {
        return styleConstants.STYLE_EDITOR_NAME;
    };

    /**
     * Get current theme Path.
     * @return {String} themePath path of the current theme.
     */
    styleUtils.getThemePath = function () {
        var authConfigJson = styleUtils.getAuthoringConfigJson();
        return authConfigJson.themePath;
    };

    /**
     * Get current theme clientlib Path.
     * @return {String} themePath path of the current theme.
     */
    styleUtils.getThemeClientlibPath = function () {
        var authConfigJson = styleUtils.getAuthoringConfigJson();
        return authConfigJson[styleConstants.THEME_CLIENTLIB_PATH_PROPERTY];
    };

    /**
     * This is post handler function to be executed after preSave operation for all
     * properties are completed.
     * preSaveOperation for background -- saving images to server etc.
     */
    styleUtils.preSavePostHandler = function () {
        styleAssetLibUtils.updateRecentlyUsedStyles()
        .then(function () {
            var oldJson,
                newJson,
                selectorBackupJson,
                componentObjectString = "components." + guideStyleVars.currentComponent,
                selectorObjectString = "components." + guideStyleVars.currentComponent + "." + guideStyleVars.currentSelector;
            guideStyleLayer.utils.saveStyleProperties();
            guideCommonStyle.utils.clearPropertySheetDirtyFlag();
            if (guideStyleVars.propertySheetBackupJson) {
                selectorBackupJson = JSON.parse(JSON.stringify(guideStyleVars.propertySheetBackupJson));
            }
            oldJson = {};
            oldJson.components = {};
            oldJson.components[guideStyleVars.currentComponent] = JSON.parse(JSON.stringify(window.expeditor.Utils.getOrElse(guideStyleVars.json, componentObjectString, {})));
            oldJson.components[guideStyleVars.currentComponent][guideStyleVars.currentSelector] = selectorBackupJson;
            styleUtils.takePropertySheetBackup(guideStyleVars.json, guideStyleVars.currentComponent, guideStyleVars.currentSelector);

            if (guideStyleVars.propertySheetBackupJson) {
                newJson = {};
                newJson.components = {};
                newJson.components[guideStyleVars.currentComponent] = JSON.parse(JSON.stringify(window.expeditor.Utils.getOrElse(guideStyleVars.json, componentObjectString, {})));
            }
            var options = {
                "editablePath" : guideStyleVars.currentEditable.path,
                "component" : guideStyleVars.currentComponent,
                "selector" : guideStyleVars.currentSelector,
                "undoJson" : oldJson.components[guideStyleVars.currentComponent],
                "redoJson" : newJson.components[guideStyleVars.currentComponent]
            };
            guideStyleLayer.utils.addHistoryStep(options);
            style.ui.resetAssetLibraryWidgets();
            styleUtils.clearPreprocessPropertiesJson();
        });
    };

    /**
     * get Editables dom on which overlay is drawn.
     */
    guideStyleLayerUtils.getEditableComponentOverlayDom = function (editable) {
        return $(editable.dom).find("[data-stylable-selector]").get(0);
    };

    guideStyleLayerUtils.tearDownPropertySheet = function () {
        if (style.vars.propertySheetMap) {
            style.vars.propertySheetMap[style.vars.currentPropertySheet] = undefined;
        }
        style.vars.currentPropertySheet = undefined;
        $(guideStyleConstants.PROPERTY_SHEET_SELECTOR).empty();
    };

    /**
     * get panel type of the panel.
     */
    guideStyleLayerUtils.getPanelType = function (editablePath) {
        var editable = window.guidelib.author.editConfigListeners._getEditable(editablePath),
            panelType;
        if (!(editable.type == authoringConstants.PANEL_COMPONENT_PATH)) {
            return ;
        }
        classArray = editable.dom.find("[data-guide-authoringconfigjson]").children("div").attr("class").split(" ");
        _.find(authoringConstants.PANEL_CLASS_ARRAY, function (panelClass) {
            if (classArray.indexOf(panelClass) > -1) {
                panelType = panelClass;
                return true;
            }
        });
        return panelType;
    };

    var _pasteEditableCallback = function (cssGenerationParams) {
        guideStyleLayerUtils.updateStyleAndApplyCssOnForm(cssGenerationParams);
    },

    /**
     * Initialize saved style json.
     */
    _initializeSavedStyleJson = function (json) {
        _convertThemeRelativePathToFormRelative(json);
        styleAssetLibVars.savedStylesJson = styleAssetLibUtils.generateSavedStyleList(json);
        styleAssetLib.utils.assetLibraryInit();
    },

    /**
     * The paths in saved style json are relative to theme so these are converted relative
     * to form to use them directly in form editor.
     */
    _convertThemeRelativePathToFormRelative = function (json) {
        var imageNode = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME;
        if (!_.isEmpty(json) && json[imageNode]) {
            var imagesJson = json[imageNode];
            _.each(imagesJson, function (nodeItem, key) {
                if (key != styleConstants.JCR_PRIMARY_TYPE) {
                    var uiPropertiesList = nodeItem[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
                        newUiPropertiesList = [];
                    _.each(uiPropertiesList, function (keyValuePair) {
                        var data = styleUtils.extractPropertyValue(keyValuePair),
                            uiProperty = data.property,
                            value = data.value;
                        if (uiProperty == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                            if (!styleUtils.isAbsolutePath(value)) {
                                value = value.split("/");
                                value = value[value.length - 2] + "/" + value[value.length - 1];
                            }
                        }
                        keyValuePair = uiProperty + ":" + value;
                        newUiPropertiesList.push(keyValuePair);
                    });
                    nodeItem[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME] = newUiPropertiesList;
                }
            });
        }
    };
}(jQuery, window._, window.Granite.author, window.guidelib.touchlib, window.guidelib.touchlib.style));
