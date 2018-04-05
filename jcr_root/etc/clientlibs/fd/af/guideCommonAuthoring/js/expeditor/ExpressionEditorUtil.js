// jscs:disable requireDotNotation
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
(function (window, $, guidelib, formsManager) {
    var AuthorUtils = guidelib.author.AuthorUtils,
        RuntimeUtil = guidelib.RuntimeUtil,
        afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        FrameStyles = {},
        _currentFieldName = "",
        _currentElementPath,
        afExpressionEditor = null,
        _currentTreeJson = null,
        afTransformer,
        functionsConfig,
        webServicesConfig,
        expEditorVisible = false,
        scriptAuthoringAllowed = false,
        expEditorTourUrl = "/libs/fd/af/content/editors/form/ruleeditortour/content.html",
        RuleEditorDataAccessUtil = guidelib.author.RuleEditorDataAccessUtil,
        GUIDE_PROPERTY_PROVIDER_PATH = "/libs/fd/af/components/info.json";
    var ExpressionEditorUtil = guidelib.author.ExpressionEditorUtil = {

        defaultMode : expeditor.ExpressionEditor.VISUAL_EDITOR,

        eventChangeListener : {
            onSTATEMENTChange : function (statement) {
                guidelib.author.ExpressionEditorUtil.updateExpressionEditorEventType(afExpressionEditor, _currentFieldName, statement.model);
            },

            onEVENT_CONDITIONChange : function (condition) {
                guidelib.author.ExpressionEditorUtil.updateExpressionEditorEventType(afExpressionEditor, _currentFieldName, condition.model);
            }
        },

        /* indentation used in generated script, four spaces */

        unaryOperators : {
            "IS_EMPTY" : true,
            "IS_NOT_EMPTY" : true
        },

        ruleToEventMap : {
            CALC_EXPRESSION : {
                name : Granite.I18n.get('Calculate'),
                description : Granite.I18n.get('Calculate Expression: Computes the value of $$ when the value of fields used in the expression is changed.')
            },
            CLEAR_EXPRESSION : {
                name : Granite.I18n.get('Calculate'),
                description : Granite.I18n.get('Calculate Expression: Computes the value of $$ when the value of fields used in the expression is changed.')
            },
            VISIBLE_EXPRESSION : {
                name : Granite.I18n.get('Visibility'),
                description : Granite.I18n.get('Visibility Expression: Controls the visibility of $$ and is triggered when the value of fields used in the expression is changed.')
            },
            SHOW_EXPRESSION : {
                name : Granite.I18n.get('Visibility'),
                description : Granite.I18n.get('Visibility Expression: Controls the visibility of $$ and is triggered when the value of fields used in the expression is changed.')
            },
            ACCESS_EXPRESSION : {
                name : Granite.I18n.get('Enabled'),
                description : Granite.I18n.get('Access Expression: Enables or Disables $$ and is triggered when the value of fields used in the expression is changed.')
            },
            DISABLE_EXPRESSION : {
                name : Granite.I18n.get('Enabled'),
                description : Granite.I18n.get('Access Expression: Enables or Disables $$ and is triggered when the value of fields used in the expression is changed.')
            },
            VALIDATE_EXPRESSION : {
                name : Granite.I18n.get('Validate'),
                description : Granite.I18n.get('Validate Expression: Validates the value of $$ using the given expression and is triggered when its value is changed')
            },
            NAVIGATION_EXPRESSION : {
                name : Granite.I18n.get('Navigation'),
                description : Granite.I18n.get('Navigation Expression: Executed when the panel is navigated')
            },
            COMPLETION_EXPRESSION : {
                name : Granite.I18n.get('Completion'),
                description : Granite.I18n.get('Completion Expression: Prevents user from going to next step of wizard unless the condition is valid')
            },
            SUMMARY_EXPRESSION : {
                name : Granite.I18n.get('Summary'),
                description : Granite.I18n.get('Summary Expression: Sets summary of the panel $$ dynamically')
            },
            OPTIONS_EXPRESSION : {
                name : Granite.I18n.get('Options'),
                description : Granite.I18n.get('Options Expression: Set the options of dropdown $$ dynamically')
            },
            "is changed" : {
                name : Granite.I18n.get('Value Commit'),
                description : Granite.I18n.get('Value Commit Script: Executed when the value of $$ is changed from UI')
            },
            "is initialized" : {
                name : Granite.I18n.get('Initialize'),
                description : Granite.I18n.get('Initialization Script: Executed when $$ is initialized')
            },
            "is clicked" : {
                name : Granite.I18n.get('Click'),
                description : Granite.I18n.get('Click Expression: Executed when $$ is clicked')
            },
            "submitSuccess" : {
                name : Granite.I18n.get('Successful Submission'),
                description : Granite.I18n.get('Successful Submission Script: Executed when $$ submission is successful.')
            },
            "submitError" : {
                name : Granite.I18n.get('Error in Submission'),
                description : Granite.I18n.get('Error in Submission Script: Executed when $$ submission has errors.')
            }
        },

        isValueCommit : function (condition) {
            if (expeditor.Utils.getOrElse(condition, "choiceModel.nodeName", null) == "EVENT_AND_COMPARISON") {
                var event_and_comparison = condition.choiceModel;
                if (event_and_comparison) {
                    var operatorModel = event_and_comparison.items[1];
                    var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);
                    if (operator && ExpressionEditorUtil.eventToEventName.hasOwnProperty(operator)) {
                        return false;
                    }
                }
            }
            return true;
        },

        updateExpressionEditorEventType : function (expEditor, fieldName, model) {
            var rule = this.getEventNameAndDescription(model);
            if (rule && expEditor) {
                expEditor.updateInfoBar(rule.description.replace(/\$\$/g, fieldName));
                expEditor._updateRuleName(fieldName + " - " + rule.name);
            }
        },

        /**
         * Returns the rule type and description
         * @param statementModel
         */
        getEventNameAndDescription : function (statementModel) {
            var nodeName = expeditor.Utils.getOrElse(statementModel, "choiceModel.nodeName", null);
            if (nodeName) {
                if (ExpressionEditorUtil.ruleToEventMap.hasOwnProperty(nodeName)) {
                    return ExpressionEditorUtil.ruleToEventMap[nodeName];
                } if (nodeName === 'EVENT_SCRIPTS') {
                    statementModel = statementModel.choiceModel.items[0];
                    nodeName = expeditor.Utils.getOrElse(statementModel, "choiceModel.nodeName", null);
                }
                if (nodeName === 'EVENT_AND_COMPARISON') {
                    var event_and_comparison = statementModel.choiceModel;
                    if (event_and_comparison) {
                        var operatorModel = event_and_comparison.items[1];
                        var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);
                        if (operator && ExpressionEditorUtil.ruleToEventMap.hasOwnProperty(operator)) {
                            return ExpressionEditorUtil.ruleToEventMap[operator];
                        } else {
                            return ExpressionEditorUtil.ruleToEventMap["is changed"];
                        }
                    }
                } else if (nodeName === 'BINARY_EVENT_CONDITION') {
                    var event = RuntimeUtil.getEventFromCondition(statementModel);
                    if (event) {
                        return ExpressionEditorUtil.ruleToEventMap[event];
                    } else {
                        return ExpressionEditorUtil.ruleToEventMap["is changed"];
                    }
                }
            }
            return null;
        },

        /* Return generated script for Functions used in Expression Editor */
        _getFunctionScriptToInsert : function (functionObj) {
            if (functionObj) {
                return functionObj.impl.replace(/\$([\d]+)|./g, function (match, n1) {
                    if (n1 && n1.length > 0) {
                        var num = +n1;
                        if (num === 0) {
                            return functionObj.id;
                        } else {
                            return functionObj.args[num - 1].name;
                        }
                    } else {
                        return match;
                    }
                });
            }
        },

        /**
         * When user drag/drops or dbl clicks tree node in code editor
         * given the node id this function returns the script to paste
         * into code editor
         * @param elementId
         * @param element Current element
         * @param afExpressionEditor Expression Editor instance
         */
        getScriptToInsert : function (elementId, element, afExpressionEditor) {
            var scope = afExpressionEditor.getContext().getScope(),
                comp = scope.findVarById(elementId);
            if (comp == null) {
                comp = scope.findFunctionById(elementId);
                return ExpressionEditorUtil._getFunctionScriptToInsert(comp.element);
            } else {
                return RuntimeUtil.getRelativeName(elementId, element.id,
                    scope);
            }
        },

        /* Code editor hinting function to suggest Form Objects/Functions based on Title also.*/
        _getExpressionEditorHints : function (cm, objectMap) {
            var inner = CodeMirror.hint.javascript(cm, cm.options.hintOptions) || {from : cm.getCursor(), to : cm.getCursor(), list : []};
            var cur = cm.getCursor(), token = cm.getTokenAt(cur);
            var textToSearch = token.string.toLowerCase();
            if (token.type === "variable") {
                /* Search for display name  within Form objects and Functions*/
                _.each(objectMap, function (item) {
                    var displayName = item.displayName ? item.displayName.toLowerCase() : "";
                    if (displayName.indexOf(textToSearch) == 0) {
                        inner.list.push({
                            text : item.relativeName,
                            displayText : item.displayName
                        });
                        var index = inner.list.indexOf(item.relativeName);
                        if (index > -1) {
                            inner.list.splice(index, 1);
                        }
                    }
                });
            }
            return inner;
        },

        /**
         *  Defines global variables and hinting function for Code Editor based on the List of Form Objects
         *  and Functions, so they are shown as suggestions while using Code Editor
         * @param model Form Objects json model
         * @param element Current Element for which Rule Editor is launched
         * @param afExpressionEditor instance of ExpressionEditor
         */
        setExpressionEditorVariableSuggestions : function (model, element, scope) {
            var typeToValueMap = {
                "BOOLEAN" : true,
                "NUMBER" : 0,
                "STRING" : "",
                "LIST" : [],
                "FUNCTION" : new Function()
            };

            var flatModel = model.getFlatModel();
            var elementIdToObjectMap = {};
            var globalScope = {};
            /* Hardcoding the available guideBridge/Panel/Field functions for now.
             Going forward, can derive public functions using JS docs as in case of  Custom Functions */
            globalScope.guideBridge = {
                reset : typeToValueMap.FUNCTION,
                submit : typeToValueMap.FUNCTION,
                validate : typeToValueMap.FUNCTION,
                setFocus : typeToValueMap.FUNCTION,
                visit : typeToValueMap.FUNCTION
            };
            var objectByType = {
                PANEL : {
                    instanceManager : {
                        addInstance :  typeToValueMap.FUNCTION,
                        removeInstance : typeToValueMap.FUNCTION,
                        insertInstance : typeToValueMap.NUMBER},
                    instanceIndex : typeToValueMap.NUMBER,
                    validate :  typeToValueMap.FUNCTION,
                    resetData :  typeToValueMap.FUNCTION
                },
                FIELD : {
                    validate :  typeToValueMap.FUNCTION,
                    resetData :  typeToValueMap.FUNCTION
                }
            };
            var types = scope.getAllTypes();
            var root = model.root;
            _.each(flatModel, function (variable, id) {
                if (id !== root.id) {
                    var relativeName = RuntimeUtil.getRelativeName(id, element.id, scope);
                    elementIdToObjectMap[id] = {
                        relativeName : relativeName,
                        displayName : variable.displayName
                    };
                    var object = {};
                    _.each(variable.type.split("|"), function (type) {
                        if (types.hasOwnProperty(type)) {
                            object = $.extend(object, objectByType[type]);
                            _.each(types[type].vars, function (varObj, varId) {
                                if (varObj) {
                                    object[varId] = typeToValueMap[varObj.type] || "";
                                }
                            });
                        }
                    });
                    globalScope[relativeName] = object;
                }
            }, this);

            globalScope.$event = {
                name : typeToValueMap.STRING,
                target : elementIdToObjectMap[element.id],
                data : {}
            };
            var self = this;
            var functionJson = guidelib.author.FunctionsConfig.json;
            _.each(functionJson, function (func) {
                var funcText = self._getFunctionScriptToInsert(func);
                if (func.impl.indexOf("$0") == 0) {
                    globalScope[func.id] = typeToValueMap.FUNCTION;
                }
                elementIdToObjectMap[func.id] = {
                    relativeName : funcText,
                    displayName : func.displayName
                };
            });
            function extractNode(node, object) {
                var obj = object;
                if (node) {
                    if (elementIdToObjectMap[node.id]) {
                        var relativeName = elementIdToObjectMap[node.id].relativeName;
                        obj = object[relativeName] || {};
                    }
                    if (node.hasOwnProperty("items")) {
                        _.each(node.items, function (item) {
                            if (item) {
                                obj[item.name] = extractNode(item, object);
                            }
                        });
                    }
                    if (node.toolbar) {
                        obj[node.toolbar.name] = extractNode(node.toolbar, object);
                    }
                }
                return obj;
            }
            if (root) {
                extractNode(root, globalScope);
            }
            return {
                globalScope : globalScope,
                hint : function (cm) {
                    return self._getExpressionEditorHints(cm, elementIdToObjectMap);
                }
            };
        },

        /**
         * Set the default mode for creating Rules through Rule Editor
         * @param mode {int} One of the constants expeditor.ExpressionEditor.VISUAL_EDITOR or
         *                   expeditor.ExpressionEditor.CODE_EDITOR
         * @return undefined
         * @since 6.1 FP1
         */
        setRuleEditorDefaultMode : function (mode) {
            if (mode === expeditor.ExpressionEditor.VISUAL_EDITOR
                || mode === expeditor.ExpressionEditor.CODE_EDITOR) {
                this.defaultMode = mode;
            }
        },

        /**
	     * set or get whether script authoring
	     * is allowed or not
         */
        allowScriptAuthoring : function (allow) {
            if (!_.isUndefined(allow)) {
                this.scriptAuthoringAllowed = allow;
            }
            return this.scriptAuthoringAllowed;
        },

        /**
         * Changes the iframe css on launching the expression editor so that it is
         * takes up the full screen(Hiding the overflow of iframe on launching the
         * expression editor to prevent two scroll-bars from appearing on screen).
         * Also disables the used Theme clientlibs to prevent overriding of ruleeditor styling
         *
         * @param show (true/false)
         */
        showOrHideExpEditorInFullScene : function (show) {
            if (expEditorVisible === show) {
                return;
            }
            if (parent !== window && parent.document) {
                var frame = parent.document.getElementById("cq-cf-frame-ct");
                var themeCssLinks = $("#fdtheme-id-clientlibs link");
                if (show) {
                    if (frame && frame.style) {
                        FrameStyles.position = frame.style.position;
                        FrameStyles.zIndex = frame.style.zIndex;
                        FrameStyles.left = frame.style.left;
                        frame.style.position = "fixed";
                        frame.style.zIndex = "10000";
                        frame.style.left = '0';
                    } else if (frame) {
                        frame.setAttribute("style", "position: fixed; z-index: 10000; left: 0;");
                    }
                    if (document.body) {
                        if (document.body.style && FrameStyles) {
                            FrameStyles.overflow = document.body.style.overflow;
                            document.body.style.overflow = "hidden";
                        } else {
                            document.body.setAttribute("style", "overflow: hidden");
                        }
                    }
                    /**
                     * Disabling theme css to prevent overwriting of rule-editor styling
                     */
                    themeCssLinks.prop('disabled', true);
                } else {
                    if (frame && frame.style) {
                        frame.style.left = FrameStyles.left;
                        frame.style.position = FrameStyles.position;
                        frame.style.zIndex = FrameStyles.zIndex;
                    } else if (frame) {
                        frame.removeAttribute("style");
                    }
                    if (document.body) {
                        if (document.body.style && FrameStyles) {
                            document.body.style.overflow = FrameStyles.overflow;
                        } else {
                            document.body.removeAttribute("style");
                        }
                    }
                    themeCssLinks.prop('disabled', false);
                }
            }
            if (!show) {
                _currentElementPath = null;
            }
            expEditorVisible = show;
            $("#af-expression-editor").toggle(show);
        },

        launchExpressionEditorHelp : function (forceLoading) {
            $(document).trigger($.Event("cq-preload-tour", {
                forceLoading : forceLoading,
                tourUrl : expEditorTourUrl
            }));
            $(document).trigger("cq-show-tour");
        },

        /**
         * Returns the coral icon from the node
         * @param node
         */
        getIconFromObjectType : function (node) {
            if (node.isFragment) {
                return AuthorUtils.getIconFromResourceType("fd/af/components/panelAsFragment");
            } else {
                return AuthorUtils.getIconFromResourceType(node.resourceType);
            }
        },
        _fetchDataFromServer : function (path) {
            return $.when(RuleEditorDataAccessUtil.cachedFetchFunctionsConfig(),
                          RuleEditorDataAccessUtil.cachedFetchWebServicesConfig(),
                          RuleEditorDataAccessUtil.fetchFieldData(path),
                          RuleEditorDataAccessUtil.fetchTreeJson()
                   );
        },
        _createEventHandlers : function (afTransformer, path, nodeProperties, element) {
            return {
                saveHandler : $.proxy(function (currentModel) {
                                    if (currentModel) {
                                        ExpressionEditorUtil._saveModelScriptAndEvent(currentModel, afTransformer);
                                    }
                                    ExpressionEditorUtil._saveScript(path, nodeProperties);
                                }),
                onTreeModelLoad : function (model) {
                                    if (model) {
                                        var flatModel = model.getFlatModel();
                                        var displayName = "", name = "";
                                        if (flatModel[element.id]) {
                                            displayName = flatModel[element.id].displayName;
                                            name = flatModel[element.id].displayName + ' - When';
                                        }
                                        this.updateTitle(displayName, name);
                                        var suggestions = guidelib.author.ExpressionEditorUtil.setExpressionEditorVariableSuggestions(model, element, this.getContext().getScope());
                                        this.setCodeEditorHintOptions(suggestions);
                                    }
                                },
                getDragData : function (elementId) {
                                    var mode = afExpressionEditor.getMode();
                                    if (mode == expeditor.ExpressionEditor.VISUAL_EDITOR) {
                                        return elementId;
                                    } else {
                                        return ExpressionEditorUtil.getScriptToInsert(elementId, element, afExpressionEditor);
                                    }
                                },
                dblClickHandler : function (elementId) {
                                    var mode = afExpressionEditor.getMode();
                                    if (mode == expeditor.ExpressionEditor.CODE_EDITOR) {
                                        var scriptToInsert = ExpressionEditorUtil.getScriptToInsert(elementId,
                                            element, afExpressionEditor);
                                        afExpressionEditor.writeScript(scriptToInsert);
                                    }
                                },
                onFieldSwitch : {
                                    typesNotAllowed : ['GUIDETOOLBAR', 'GUIDEADMODULE', 'GUIDEADMODULEGROUP', 'GUIDESEPARATOR', 'VERIFY', 'GUIDECAPTCHA'],
                                    handler : ExpressionEditorUtil.showExpressionEditor
                                }
            };
        },

        _createAndLaunchExpressionEditor : function (nodeProperties, element, options, treeJson, path, expJson) {
            var closeHandler = function () {
                 ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
             };
            _currentFieldName = element.displayName;
            options.elementType = element && element.type ? element.type.split("|") : [];
            var eventsAndExpressions = guidelib.RuntimeUtil._getEventsAndExpressionList(nodeProperties.guideNodeClass, options),
                config = guidelib.RuntimeUtil.createConfig(eventsAndExpressions, treeJson, path);
            if (!afTransformer) {
                afTransformer = new guidelib.author.AFTransformer();
            }
            var eventHandlers = ExpressionEditorUtil._createEventHandlers(afTransformer, path, nodeProperties, element);
            if (afExpressionEditor != null) {
                afExpressionEditor.setConfig(config);
                afExpressionEditor.setTreeConfig({
                            json : treeJson
                        });
                afExpressionEditor.updateCodeEditorToolbar({
                            event : {
                                options : eventsAndExpressions.afEventNames
                            },
                            field : {
                                value : element.id
                            }
                        });
                afExpressionEditor.updateHandlers({
                            saveHandler : eventHandlers.saveHandler,
                            onTreeModelLoad : eventHandlers.onTreeModelLoad,
                            treeConfig : {
                                dragDataHandler : eventHandlers.getDragData,
                                dblClickHandler : eventHandlers.dblClickHandler
                            },
                            navigationTreeConfig : {
                                onfieldSwitch : eventHandlers.onFieldSwitch
                            },
                            functionsConfig : {
                                dragDataHandler : eventHandlers.getDragData
                            }
                        });
                ExpressionEditorUtil._showExpressionEditorInternal(afExpressionEditor, expJson, path, false);
                return true;
            }
            functionsConfig.dragDataHandler = eventHandlers.getDragData;
            afExpressionEditor = new expeditor.ExpressionEditor({
                        config : config,
                        enableCodeEditor : ExpressionEditorUtil.allowScriptAuthoring(),
                        variableStorage : "guidelib.author.TrieStorage",
                        treeConfig : {
                            json : treeJson,
                            defaultTypes : ['FORM'],
                            getObjectIcon : ExpressionEditorUtil.getIconFromObjectType,
                            dragDataHandler : eventHandlers.getDragData,
                            dblClickHandler : eventHandlers.dblClickHandler
                        },
                        navigationTreeConfig : {
                            json : treeJson,
                            defaultTypes : ['FORM'],
                            getObjectIcon : ExpressionEditorUtil.getIconFromObjectType,
                            onfieldSwitch : eventHandlers.onFieldSwitch,
                            skipChildren : function (node) {
                                return !!node.isFragment;
                            }
                        },
                        defaultMode : guidelib.author.ExpressionEditorUtil.defaultMode,
                        useLocalStorageForDefaultMode : "af.ruleeditor.defaultmode",
                        typesConfig : guidelib.author.TypesConfig,
                        functionsConfig : functionsConfig,
                        webServicesConfig : webServicesConfig,
                        saveHandler : eventHandlers.saveHandler,
                        closeHandler : closeHandler,
                        launchHelpHandler : ExpressionEditorUtil.launchExpressionEditorHelp,
                        onTreeModelLoad : eventHandlers.onTreeModelLoad,
                        editableRoot : 'STATEMENT',
                        summaryTransformer : guidelib.author.ToSummaryTransformer,
                        transformer : afTransformer,
                        codeEditorConfig : {
                            toolbar : {
                                event : {
                                    type : "dropdown",
                                    title : Granite.I18n.get("Event"),
                                    options : eventsAndExpressions.afEventNames,
                                    onChange : {
                                        listener : function (ce) {
                                            var fieldId = ce.getValue("script.field"),
                                                eventName = ce.getValue("script.event"),
                                                field = afExpressionEditor.getContext().getScope()
                                                    .findVarById(fieldId).element,
                                                description = guidelib.author.ExpressionEditorUtil
                                                    .eventDescription[eventName],
                                                hintOption = guidelib.author.ExpressionEditorUtil
                                                    .eventHintOptions[eventName] || {};
                                            afExpressionEditor.updateInfoBar(description.replace(/\$\$/g,
                                                field.displayName));
                                            ce.hintOptions.globalScope.$event.data = hintOption;
                                        },
                                        context : window
                                    }
                                },
                                field : {
                                    type : "hidden",
                                    value : element.id
                                }
                            },
                            disabled : !ExpressionEditorUtil.allowScriptAuthoring()
                        }
                    });
            ExpressionEditorUtil._showExpressionEditorInternal(afExpressionEditor, expJson, path, true);
            return true;
        },
        _showCustomRuleEditorGroupPermissionsDialog : function () {
            var message = '<p>' + Granite.I18n.get("You do not have permission to edit rules. Contact Administrator to obtain the permission.") + '</p>',
                                    footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Ok') + '</button>';
            expeditor.Utils.launchCustomModal("warning", Granite.I18n.get("Access Denied"), message, footer, $('#exp-main-container'));
            afWindow.guidelib.util.GuideUtil.showGuideLoading(false);
            ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
        },
        _showMigrationConfirmationDialog : function (callback) {
            var message = '<p>' + Granite.I18n.get("Some rules for this component will be converted to script. Do you want to convert and migrate?") + '</p>',
                        footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Cancel') + '</button>' +
                                '<button id="close-migrate-button" is="coral-button" variant="primary" coral-close>' + Granite.I18n.get('Migrate') + '</button>';

            expeditor.Utils.launchCustomModal("warning", Granite.I18n.get("Migration Required"), message, footer, $('#exp-main-container'));
            $("#close-migrate-button").one('click', function () {
                        callback();
                    });
            $("#expeditor-modaltemplate")[0].on('coral-overlay:close', function (ev) {
                   ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
                   afWindow.guidelib.util.GuideUtil.showGuideLoading(false);
               });
        },
        _showInsufficientPermissionsDialog : function () {
            var message = '<p>' + Granite.I18n.get("You do not have the permission to migrate rules for this component, as rules of this component include scripts. Contact the Administrator to obtain the permissions.") + '</p>',
                                    footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Ok') + '</button>';
            expeditor.Utils.launchCustomModal("warning", Granite.I18n.get("Access Denied"), message, footer, $('#exp-main-container'));
            afWindow.guidelib.util.GuideUtil.showGuideLoading(false);
            ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
        },
        _hasScriptsToBeMigrated : function (nodeProperties) {
            if (!nodeProperties.expJson) { // if expJson is not defined, then node must have script properties
                return true;
            }
            var expJsonObj = JSON.parse(nodeProperties.expJson);
            return _.some(expJsonObj.items, function (obj) {
                return obj.nodeName == 'SCRIPTMODEL';
            });
        },
        _callMigrationUtility : function (componentPath, successCb) {
            var componentMigrationRequest = RuleEditorDataAccessUtil.migrateComponent(componentPath);
            var fieldDataRequest = componentMigrationRequest.then(function (data) {
                                       return RuleEditorDataAccessUtil.fetchFieldData(componentPath);
                                   });
            fieldDataRequest.then(function (props) {
                successCb(props[RuntimeUtil.RULES_NODE], props[RuntimeUtil.SCRIPTS_NODE]);
            }).fail(function () {
                var message = Granite.I18n.get("Failed to migrate component");
                expeditor.Utils.launchCustomModal("error", Granite.I18n.get("Operation Failed"), message, null,
                $('#exp-main-container'));
                afWindow.guidelib.util.GuideUtil.showGuideLoading(false);
                ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
            });

        },
        _handleLazyMigration : function (nodePath, nodeProperties, element, migrationSuccessCb) {
            if (!RuntimeUtil.isMigrationRequired(nodeProperties)) {
                migrationSuccessCb(nodeProperties[RuntimeUtil.RULES_NODE], nodeProperties[RuntimeUtil.SCRIPTS_NODE]);
            } else if (RuntimeUtil.hasOrderConflict(nodeProperties)) {
                ExpressionEditorUtil._showMigrationConfirmationDialog(function () {
                    ExpressionEditorUtil._callMigrationUtility(nodePath, migrationSuccessCb);
                });
            } else {
                ExpressionEditorUtil._callMigrationUtility(nodePath, migrationSuccessCb);
            }
        },
        _onDataFetch : function (customFunctionConfig, webServices, nodeProperties, treeJson) {
            var path = _currentElementPath;
            webServicesConfig = webServices;
            var _expressionJSON,
                EventPropertyMapping = afWindow.guidelib.util.GuideUtil.EVENT_PROPERTY_MAPPING,
                options = {
                    completionExpReq : false,
                    summaryExpVisible : false
                };

            // preprocess functions config
            if (_.isUndefined(functionsConfig)) {
                functionsConfig = guidelib.author.FunctionsConfig;
                if (expeditor.Utils.getOrElse(customFunctionConfig, "customFunction", null) != null) {
                    functionsConfig["json"] = functionsConfig["json"].concat(customFunctionConfig["customFunction"]);
                }
            }

            if (nodeProperties.completionExpReq != null) {
                nodeProperties.completionExpReq = nodeProperties.completionExpReq;
            }
            options.summaryExpVisible = (nodeProperties.summaryExpVisible === 'yes');

            // process treeJson

            if (typeof treeJson === 'string') {
                treeJson = JSON.parse(treeJson);
            }
            treeJson.items = [treeJson.rootPanel, treeJson.toolbar];
            treeJson.rootPanel = null;
            treeJson.toolbar = null;
            _currentTreeJson = treeJson;

            var element = guidelib.RuntimeUtil._getElement(path, treeJson),
                           scriptContent, model, items;

            ExpressionEditorUtil._handleLazyMigration(path, nodeProperties, element, function (rules, scripts) {
                _expressionJSON = RuntimeUtil._getExpJson(rules, scripts);
                ExpressionEditorUtil._createAndLaunchExpressionEditor(nodeProperties, element, options, _currentTreeJson, path, _expressionJSON);
            });

        },
        _showExpressionEditorInternal : function (afExpressionEditor, _expressionJSON, path, displayHelpContent) {
            afWindow.guidelib.util.GuideUtil.showMessages("Preparing Rules for listing...");
            setTimeout(function () {
                        afExpressionEditor.show(_expressionJSON);
                        afExpressionEditor.highlightSummaryTreeNode(path);
                        afWindow.guidelib.util.GuideUtil.showGuideLoading(false)
                            .removeAllMessages();
                        ExpressionEditorUtil.showOrHideExpEditorInFullScene(true);
                        if (displayHelpContent) {
                            ExpressionEditorUtil.launchExpressionEditorHelp();
                        }
                    }, 10);
        },
        showExpressionEditor : function (path) {
            if (!guidelib.author.AuthorUtils.showRuleEditor()) {
                ExpressionEditorUtil._showCustomRuleEditorGroupPermissionsDialog();
                return;
            }
            if (typeof path !== 'string') {
                path = this.path;
            }

            if (_currentElementPath && _currentElementPath == path) {
                return;
            }
            _currentElementPath = path;
            var closeHandler = function () {
                ExpressionEditorUtil.showOrHideExpEditorInFullScene(false);
            };

            var _expressionJSON,nodeProperties;
            options = {
                completionExpReq : false,
                summaryExpVisible : false
            };
            afWindow.guidelib.util.GuideUtil.showGuideLoading(true)
                           .showMessages(Granite.I18n.get("Getting rules..."));

            ExpressionEditorUtil._fetchDataFromServer(path)
            .then($.proxy(ExpressionEditorUtil._onDataFetch, this))
            .fail(function (e) {
                console.error("Error in retrieving Expression or Form Objects JSON");
            });

        },

        /**
         *
         * @param model : current rule json
         * @param transformer
         * @private saves the current model generated script and event name in the json
         */
        _saveModelScriptAndEvent : function (model, transformer) {
            if (model instanceof guidelib.author.AFRootModel && transformer) {
                transformer.setMode(afTransformer.CODE_EDITOR_MODE);
                transformer.setAddCopyrightHeader(true);
                model.accept(transformer);
                var script = transformer.getScript();
                model.setScript(script.content);
                model.setEventName(script.event);
            }
        },

        _trimEmptyRules : function (rulesAndScript) {
            function pickerFn(arr) {
                return _.isArray(arr) && arr.length > 0;
            }
            var obj = {};
            obj[RuntimeUtil.RULES_NODE] = _.pick(rulesAndScript[RuntimeUtil.RULES_NODE], pickerFn);
            if (ExpressionEditorUtil.allowScriptAuthoring()) {
                obj[RuntimeUtil.SCRIPTS_NODE] = _.pick(rulesAndScript[RuntimeUtil.SCRIPTS_NODE], pickerFn);
            }
            return obj;
        },

        _preparePostData : function (expJson, nodeProperties) {
            var postData = {
                "_charset_" : "UTF-8",
                ":operation" : "import",
                ":replace" : true,
                ":contentType" : "json"
            };

            var modelsByEvent = RuntimeUtil._groupModelsByEvents(expJson.items);

            var rulesAndScript = RuntimeUtil._splitRulesAndScripts(modelsByEvent);
            var trimmedRulesAndScripts = ExpressionEditorUtil._trimEmptyRules(rulesAndScript);
            var stringifiedModels = RuntimeUtil._stringifyEachModel(trimmedRulesAndScripts);
            postData[":content"] = JSON.stringify(stringifiedModels);
            return postData;
        },

        _deleteLegacyProperties : function (path, nodeProperties) {
            //delete script properties
            var EventPropertyMapping = RuntimeUtil.EVENT_PROPERTY_MAPPING;
            var properties = {"_charset_" : "UTF-8"}; // Sling charset param
            for (var evnt in EventPropertyMapping) {
                if (EventPropertyMapping.hasOwnProperty(evnt)) {
                    var propertyName = EventPropertyMapping[evnt];
                    if (nodeProperties[propertyName]) {
                        properties[propertyName + "@Delete"] = "";
                    }
                }
            }
            if (typeof(nodeProperties.expJson) == "string") {
                properties["expJson@Delete"] = "";
            }
            if (Object.keys(properties).length > 1) {
                return $.ajax({
                    url : path,
                    data : properties,
                    method : 'post'
                });
            } else {
                return $.Deferred();
            }
        },

        _saveScript : function (path, nodeProperties) {
            var EventPropertyMapping = afWindow.guidelib.util.GuideUtil.EVENT_PROPERTY_MAPPING;

            var json = afExpressionEditor.getJson();

            var postData = this._preparePostData(json, nodeProperties);
            $.ajax({url : path,data : postData, method : "post"})
             .then(function () {
                 return ExpressionEditorUtil._deleteLegacyProperties(path, nodeProperties);
             }).then(function () {
                                    if (console) {
                                        console.log("script saved successfully");
                                    }
                                    afExpressionEditor.updateHandlers({
                                        saveHandler : function (currentModel) {
                                            if (currentModel) {
                                                ExpressionEditorUtil._saveModelScriptAndEvent(currentModel, afTransformer);
                                            }
                                            ExpressionEditorUtil._saveScript(path, nodeProperties);
                                        }
                                    });
                                })
                                .fail(function () {
                                    if (console) {
                                        console.error("Operation Failed: Unable to complete the last operation");
                                    }
                                    var message = Granite.I18n.get("Unable to complete the last operation");
                                    expeditor.Utils.launchCustomModal("error", Granite.I18n.get("Operation Failed"), message, null,
                                    $('#exp-main-container'));
                                });
        }
    };

    ExpressionEditorUtil.eventDescription = (function () {
        var result = {};
        _.each(ExpressionEditorUtil.ruleToEventMap, function (rule_description, rule_name) {
            result[rule_description.name] = rule_description.description;
        });
        return result;
    }());

    /**
    *
    * This map is used to show hint options for $event.data object in code editor for a given event.
    * To show hint option for an event, add to this map.
    * Default would be an empty object.
    */
    ExpressionEditorUtil.eventHintOptions = {
        "Successful Submission" : {
            thankYouOption : "",
            thankYouContent : "",
            contentType : "",
            data : ""
        },
        "Error in Submission" : {
            errorCausedBy : "",
            errors : []
        }
    };
})(window.parent._afAuthorHook ? window.parent._afAuthorHook._getEditorWindow() : window, $, guidelib, window.Form);
