/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
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
 ******************************************************************************/

(function (guidelib) {

    var RuntimeUtil = guidelib.RuntimeUtil = {
        SCRIPTS_NODE : "fd:scripts",
        RULES_NODE : "fd:rules",
        SECURE_EVENT_PROPERTY_MAPPING : {
            "Calculate" : "fd:calc",
            "Visibility" : "fd:visible",
            "Initialize" : "fd:init",
            "Click" : "fd:click",
            "Value Commit" : "fd:valueCommit",
            "Enabled" : "fd:enabled",
            "Validate" : "fd:validate",
            "Completion" : "fd:completion",
            "Summary" : "fd:summary",
            "Options" : "fd:options",
            "Navigation" : "fd:navigationChange",
            "Successful Submission" : "fd:submitSuccess",
            "Error in Submission" : "fd:submitError"
        },

        EVENT_PROPERTY_MAPPING : {
            "Calculate" : "calcExp",
            "Visibility" : "visibleExp",
            "Initialize" : "initScript",
            "Click" : "clickExp",
            "Value Commit" : "valueCommitScript",
            "Enabled" : "enabledExp",
            "Validate" : "validateExp",
            "Completion" : "completionExp",
            "Summary" : "summaryExp",
            "Options" : "optionsExp",
            "Navigation" : "navigationChangeExp",
            "Successful Submission" : "submitSuccess",
            "Error in Submission" : "submitError"
        },
        _scriptPropertiesToExpJson : function (nodeProperties, id) {
            var items = [];
            _.each(RuntimeUtil.EVENT_PROPERTY_MAPPING, function (eventPropertyName, eventName) {
                scriptContent = nodeProperties[eventPropertyName];
                if (typeof scriptContent !== "undefined") {
                    var model = {
                        nodeName : "SCRIPTMODEL",
                        script : {
                            field : id,
                            event : eventName,
                            content : scriptContent
                        },
                        // marking it as old version
                        version : 0
                    };
                    items.push(model);
                }
            });
            if (items.length > 0) {
                return {
                    nodeName : "RULES",
                    items : items
                };
            }
        },

        /**
         * This function handles a unique case during migration
         * where for a given event a script object occurs before rule object
         * in which case all rules after first script object are converted to
         * script objects
         */
        _migrateSingleEventRulesAndScripts : function (rules, id) {
            var hasScriptAppeared = false;
            return rules.map(function (model) {
                if (hasScriptAppeared) {
                    if (model.nodeName != 'SCRIPTMODEL') {
                        return {
                            nodeName : 'SCRIPTMODEL',
                            script : {
                                field : id,
                                event : model.eventName,
                                content : model.script
                            }
                        };
                    } else {
                        return model;
                    }
                } else {
                    if (model.nodeName == 'SCRIPTMODEL') {
                        hasScriptAppeared = true;
                    }
                    return model;
                }
            });
        },

        /**
         * determines when migration is required
         * migration is required only if any of the legacy
         * properties are found
         */
        isMigrationRequired : function (nodeProperties) {
            var legacyProperties = RuntimeUtil.EVENT_PROPERTY_MAPPING;
            var isAnyScriptPropertyPresent = _.some(Object.keys(legacyProperties), function (key) {
                return typeof(nodeProperties[legacyProperties[key]]) != "undefined";
            });
            return isAnyScriptPropertyPresent || typeof(nodeProperties.expJson) != "undefined" ;
        },

        /**
         *  Given rules and scripts grouped by events
         *  separates rules and script
         */
        _splitRulesAndScripts : function (rulesAndScripts) {

            var obj = {};

            obj[RuntimeUtil.RULES_NODE] = _.mapValues(rulesAndScripts, function (models) {
                return models.filter(function (model) {
                    return model.nodeName != 'SCRIPTMODEL';
                });
            });

            obj[RuntimeUtil.SCRIPTS_NODE] = _.mapValues(rulesAndScripts, function (models) {
                return models.filter(function (model) {
                    return model.nodeName == 'SCRIPTMODEL';
                });
            });

            return obj;

        },
        /**
         * takes an array of rule json models and
         * groups them by events
         * input : [
         *     {nodeName:'ROOT',eventName:'Calculate', items:...},
         *     {nodeName:'SCRIPTMODEL',script:{event:'Value Commit',content:"..."}},
         *     {nodeName:'ROOT',eventName:'Value Commit', items:...}
         * ]
         * output:
         * {
         *    calc:[{nodeName:'ROOT',eventName:'Calculate', items:...}]
         *    valueCommit:[{nodeName:'SCRIPTMODEL',script:{event:'Value Commit',content:"..."}},
         *    {nodeName:'ROOT',eventName:'Value Commit', items:...}]
         * }
         */
        _groupModelsByEvents : function (modelsJson) {
            return _.groupBy(modelsJson, function (modelJson) {
                var eventName = modelJson.nodeName == 'SCRIPTMODEL' ? modelJson.script.event : modelJson.eventName;
                return RuntimeUtil.SECURE_EVENT_PROPERTY_MAPPING[eventName];
            });
        },
        /**
         *  Returns true if for any event a visual rule is found after script
         *  Called from server
         */
        hasOrderConflict : function (nodeProperties) {
            var expJson = nodeProperties.expJson;
            if (!expJson) { // with no expJson we cannot have an order conflict
                return false;
            }
            var expJsonObj = JSON.parse(expJson);
            var rules = expJsonObj.items || [];
            var modelsByEvents = RuntimeUtil._groupModelsByEvents(rules);
            var orderConflictFound = _.some(_.values(modelsByEvents), function (rulesForAnEvent) {
                var hasScriptAppeared = false;
                var conflict = false;
                _.each(rulesForAnEvent, function (model) {
                      if (model.nodeName == 'SCRIPTMODEL') {
                          hasScriptAppeared = true;
                      } else if (hasScriptAppeared) {
                          conflict = true;
                      }
                  });
                return conflict;
            });

            return orderConflictFound;
        },
        /**
         * Can be called from server to migrate component to new format
         */
        migrateComponent : function (nodeProperties, id) {
            var expJson = nodeProperties.expJson;
            if (!expJson) {
                expJson = RuntimeUtil._scriptPropertiesToExpJson(nodeProperties, id);
            } else {
                expJson = JSON.parse(expJson);
            }
            var modelsByEvents = RuntimeUtil._groupModelsByEvents(expJson.items);
            var migratedModels = _.mapValues(modelsByEvents, function (models) {
                return RuntimeUtil._migrateSingleEventRulesAndScripts(models, id);
            });
            var rulesAndScripts = RuntimeUtil._splitRulesAndScripts(migratedModels);
            return RuntimeUtil._stringifyEachModel(rulesAndScripts);
        },
        _mergeGroupedValues : function (rules) {
            var events = Object.keys(rules);
            var allRules = events.map(function (e) {
                return rules[e];
            });
            return [].concat.apply([], allRules);
        },
        _stringifyEachModel : function (rulesAndScript) {
            return _.mapValues(rulesAndScript, function (rulesOrScripts) {
                return _.mapValues(rulesOrScripts, function (models) {
                    models = _.isArray(models) ? models : [];
                    return models.map(function (model) {
                        return JSON.stringify(model);
                    });
                });
            });
        },
        _parseEachModel : function (models) {
            return models.map(function (model) {
                return JSON.parse(model);
            });
        },
        _getExpJson : function (rules, scripts) {
            var validKeys = _.values(RuntimeUtil.SECURE_EVENT_PROPERTY_MAPPING);
            var rules = _.pick(rules || {}, validKeys);
            var scripts = _.pick(scripts || {}, validKeys);
            if (Object.keys(rules).length > 0 || Object.keys(scripts).length > 0) {
                var mergedRules = RuntimeUtil._mergeGroupedValues(rules);
                mergedRules = RuntimeUtil._parseEachModel(mergedRules);
                // filter rules and scripts and discard any script objects
                var filteredRules = mergedRules.filter(function (model) {
                    return model.nodeName != 'SCRIPTMODEL';
                });
                var mergedScripts = RuntimeUtil._mergeGroupedValues(scripts);
                mergedScripts = RuntimeUtil._parseEachModel(mergedScripts);

                var allRulesAndScripts = filteredRules.concat(mergedScripts);
                return {
                    nodeName : "RULES",
                    items : allRulesAndScripts
                };

            }

            return {
                nodeName : "RULES",
                items : []
            };
        },

        jsonToScripts : function (fieldData, treeJson, path, guideNodeClass, rules, scripts) {
            if (typeof treeJson == "string") {
                treeJson = JSON.parse(treeJson);
            }
            treeJson.items = [treeJson.rootPanel];
            treeJson.rootPanel = null;
            var expJson = RuntimeUtil._getExpJson(rules, scripts, true);
            var element = this._getElement(path, treeJson);
            var options = {
                completionExpReq : fieldData.completionExpReq,
                summaryExpVisible : fieldData.summaryExpVisible === 'yes',
                elementType : element && element.type ? element.type.split("|") : []
            };
            var eventsAndExpressions = this._getEventsAndExpressionList(guideNodeClass, options);
            var config = this.createConfig(eventsAndExpressions, treeJson, path);
            var eeContext = this.createContext(config, treeJson, guidelib.author.TypesConfig);

            var transformer = new guidelib.author.AFTransformer();
            transformer.setContext(eeContext);

            var listModel = new expeditor.model.ListModel('RULES', eeContext);
            listModel = listModel.fromJson(expJson);

            var scripts = guidelib.author.scriptMerger.mergeScript(expeditor.Utils.listModelToScript(listModel, transformer));
            var events = scripts[Object.keys(scripts)[0]];

            var properties = {};
            _.each(events, function (script, evntName) {
                properties[guidelib.RuntimeUtil.EVENT_PROPERTY_MAPPING[evntName]] = script.content;
            });
            return properties;
        },

        createContext : function (config, treeJson, typesConfig) {
            var eeContext = new expeditor.ExpEditorContext(config, null, {});
            var rbScope = new expeditor.rb.RBScope({
                varStorage : "guidelib.author.TrieStorage"
            });
            var treeProcessor = new expeditor.TreeProcessor(treeJson);
            var flatModel = treeProcessor.getFlatModel();
            rbScope.addVars(flatModel);
            rbScope.addTypes(typesConfig || {});
            eeContext.setScope(rbScope);

            return eeContext;
        },
        createConfig : function (eventsAndExpressions, treeJson, path) {
            var configurator = new expeditor.rb.RuleBuilderConfigurator(),
                config = configurator.addGrammar(guidelib.author.Grammar)
                .addStatement(eventsAndExpressions.statements)
                .addChoice("EVENT_AND_COMPARISON_OPERATOR", eventsAndExpressions.events)
                .addChoice("EXPRESSION", "WSDL_VALUE_EXPRESSION")
                .enableOperator(configurator.getDefaultOperators())
                .enableRule("PARAMETER")
                .addChangeListener('ROOT', 'guidelib.author.ExpressionEditorUtil.eventChangeListener')
                .addChangeListener('EVENT_SCRIPTS', 'guidelib.author.ExpressionEditorUtil.eventChangeListener')
                .getConfig();
            eventsAndExpressions.expressions = ["EVENT_AND_COMPARISON"];
            config = this._appendCurrentFieldJsonInExpressionGrammar(path,
                eventsAndExpressions,
                config, treeJson);
            return config;
        },
        /**
         * Returns the element with the given path in the JSON
         * @param path
         * @param json
         * @returns {*}
         * @private
         */
        _getElement : function (path, json) {
            if (json.path == path) {
                return json;
            }
            if (json.items) {
                var returnJson = null;
                _.find(json.items, function (item, index) {
                    returnJson = this._getElement(path, item);
                    return returnJson != null;
                }, this);
                if (returnJson) {
                    return returnJson;
                }
            }
            if (json.toolbar) {
                return this._getElement(path, json.toolbar);
            }
        },
        _appendCurrentFieldJsonInExpressionGrammar : function (path, eventsAndExpressions, grammar, treeJson) {
            var element = this._getElement(path, treeJson),
                variable = {
                    "value" : {
                        "id" : element.id,
                        "type" : element.type,
                        "name" : element.name
                    }
                },
                jsonModel = {
                    "VALUE_FIELD" : {
                        "value" : {
                            "id" : element.id,
                            "type" : expeditor.Utils.filterPrimitiveTypes(element.type),
                            "name" : element.name
                        }
                    },
                    "AFCOMPONENT" : variable,
                    "NAVIGABLE_PANEL" : variable,
                    "REPEATABLE_PANEL" : variable,
                    "COMPONENT" : variable,
                    "DROPDOWN" : variable,
                    "TOOLBAR_BUTTON" : variable
                };
            eventsAndExpressions.statements.forEach(function (statement) {
                grammar[statement].jsonModel = jsonModel;
            });
            eventsAndExpressions.expressions.forEach(function (expression) {
                grammar[expression].jsonModel = jsonModel;
            });

            return grammar;
        },
        /**
         * Return event list from an editable. Currently it is hard coded, but would have been best to get it from
         * server. Need to figure out a way for doing that.
         * @param editable
         * @param options
         * @private
         */
        _getEventsAndExpressionList : function (guideNodeClass, options) {
            var statements = [
                    "CALC_EXPRESSION", "CLEAR_EXPRESSION", "VISIBLE_EXPRESSION", "SHOW_EXPRESSION", "EVENT_SCRIPTS",
                    "ACCESS_EXPRESSION", "DISABLE_EXPRESSION", "VALIDATE_EXPRESSION"
                ],
                events = ["is initialized", "is changed"],
                afEventNames = ["Initialize", "Calculate", "Enabled", "Validate", "Value Commit", "Visibility"];
            if (guideNodeClass === "guideTermsAndConditions" || guideNodeClass === "guideFileUpload") {
                afEventNames.splice(afEventNames.indexOf("Calculate"), 1);
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
            } else if (guideNodeClass === "guideCompositeFieldItem") {
                //Remove all statements except Validate Expression
                statements.splice(0, statements.indexOf("VALIDATE_EXPRESSION"));
            } else if (guideNodeClass === "guideButton") {
                events.unshift("is clicked");
                events.splice(events.indexOf("is changed"), 1);
                afEventNames = ["Initialize", "Click", "Enabled", "Visibility"];
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
                if (options.elementType.indexOf("TOOLBAR_BUTTON") > -1) {
                    afEventNames.push("Navigation");
                }
            } else if (guideNodeClass === "guideDropDownList") {
                afEventNames.push("Options");
                statements.push('OPTIONS_EXPRESSION');
            } else if (guideNodeClass === "guideImage" || guideNodeClass === "guideTextDraw" || guideNodeClass === "guideAdobeSignBlock") {
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("EVENT_SCRIPTS"), 1);
                statements.splice(statements.indexOf("ACCESS_EXPRESSION"), 1);
                statements.splice(statements.indexOf("DISABLE_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
                events.splice(events.indexOf("is changed"), 1);
                afEventNames = ["Initialize", "Visibility"];
            } else if (guideNodeClass === "guideScribble") {
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
                afEventNames = ["Initialize", "Enabled", "Visibility"];
            } else if (guideNodeClass === "guideChart" || options.elementType.indexOf("TABLE") > -1 || options.elementType.indexOf("TABLE ROW") > -1) {
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("EVENT_SCRIPTS"), 1);
                statements.splice(statements.indexOf("DISABLE_EXPRESSION"), 1);
                statements.splice(statements.indexOf("ACCESS_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALUE_COMMIT_EXPRESSION"), 1);
                events.splice(events.indexOf("is changed"), 1);
                afEventNames = ["Visibility"];
            } else if (guideNodeClass === "guidePanel" || guideNodeClass === "rootPanelNode") {
                // Using x-panel class since for panels the Edit Rules
                // option is present on the Edit bar
                statements.splice(statements.indexOf("CALC_EXPRESSION"), 1);
                statements.splice(statements.indexOf("CLEAR_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALIDATE_EXPRESSION"), 1);
                statements.splice(statements.indexOf("VALUE_COMMIT_EXPRESSION"), 1);
                statements.splice(statements.indexOf("ACCESS_EXPRESSION"), 1);
                statements.splice(statements.indexOf("DISABLE_EXPRESSION"), 1);
                afEventNames = ["Initialize"];
                if (options) {
                    if (options.completionExpReq === true) {
                        afEventNames.push("Completion");
                    }
                    if (options.summaryExpVisible === true) {
                        statements.push("SUMMARY_EXPRESSION");
                        afEventNames.push("Summary");
                    }
                }
                if (guideNodeClass !== "rootPanelNode") {
                    afEventNames.push("Visibility");
                } else {
                    statements.splice(statements.indexOf("VISIBLE_EXPRESSION"), 1);
                    statements.splice(statements.indexOf("SHOW_EXPRESSION"), 1);
                }
                events.splice(events.indexOf("is changed"), 1);
            } else if (guideNodeClass === "guideContainerNode") {
                //No events for Visual Editor.
                events = [];
                statements = [];
                //Only AF Events for Code Editor.
                afEventNames = ["Successful Submission", "Error in Submission"];
            }
            return {
                statements : statements,
                events : events,
                afEventNames : afEventNames
            };
        },
        /*
         * Fixes SOM Expression by correctly putting indices (0) where not present.
         *
         */
        _fixSomExpression : function (som) {
            if (typeof som === "string") {
                if (som.length === 0) {
                    return som;
                }
                return som.replace(/\.|$/g, function (match, offset, str) {
                    var prevCharacter = str[offset - 1];
                    if (prevCharacter !== "]" && prevCharacter !== "\\") {
                        return "[0]" + match;
                    }
                    return match;
                });

            }
            return som;
        },

        _removeIndexFromSom : function (som) {
            if (typeof som === "string") {
                return som.replace(/\[[0-9]+\]/g, "");
            }
            return som;
        },

        getRelativeName : function (id, relativeTo, scope) {
            if (id === relativeTo) {
                return "this";
            }
            if (id.indexOf(".") === -1) {
                // case it is guide, otherwise this case will never occur
                return this._getRuntimeId(id);
            }
            if (scope !== null) {
                var def = scope.findVarById(id);
                if (def === null) {
                    return this._getRuntimeId(id);
                } else {
                    if (def.foundId !== id) {
                        id = def.foundId;
                    }
                }
                id = scope.findUniqueVarId(id);
            }
            // if id contains an index like [1] or [10], remove them
            if (id.match(/\[[1-9][0-9]*\]/)) {
                id = this._fixSomExpression(id);
                if (console) {
                    console.warn("Same named siblings are not supported");
                }
                var id1 = this._removeIndexFromSom(id);
                // this is not supported, but if it happens we need to add zeros
                return this._getRuntimeId(id1);
            } else if (scope === null) {
                // it should never happen though
                var currentFieldIdArray = relativeTo.split("."),
                    bMisMatch = false,
                    shortName = id.split(".").filter(function (item, index) {
                        var bMisMatchId = bMisMatch || (bMisMatch = currentFieldIdArray[index] !== item);
                        return bMisMatchId;
                    }).join(".");
                if (shortName.length === 0) {
                    id = id.substring(id.lastIndexOf(".") + 1);
                }
            }
            return this._getRuntimeId(id);
        },

        /**
         * As JS doesn't understand variable with hyphen in it. So, encapsulating it to an resolveNode.
         * ResolveNode takes this relative name as input and returns relevant forms component.
         * @param id
         * @returns id Id in resolve
         * @private
         */
        _getRuntimeId : function (id) {
            if (id.indexOf("-") > -1) {
                id = "guideBridge.resolveNode(\"" + id + "\")";
            }
            return id;
        },

        isValueCommit : function (condition) {
            if (expeditor.Utils.getOrElse(condition, "choiceModel.nodeName", null) == "EVENT_AND_COMPARISON") {
                var event_and_comparison = condition.choiceModel;
                if (event_and_comparison) {
                    var operatorModel = event_and_comparison.items[1];
                    var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);
                    if (operator && guidelib.RuntimeUtil.eventToEventName.hasOwnProperty(operator)) {
                        return false;
                    }
                }
            }
            return true;
        },

        /* Checks if the condition is only an event. */
        isConditionOnlyAnEvent : function (condition) {
            if (expeditor.Utils.getOrElse(condition, "choiceModel.nodeName", null) == "EVENT_AND_COMPARISON") {
                var event_and_comparison = condition.choiceModel;
                if (event_and_comparison) {
                    var operatorModel = event_and_comparison.items[1];
                    var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);
                    if (operator && guidelib.RuntimeUtil.eventToEventName.hasOwnProperty(operator)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /* Returns the event if any is present in condition model. Returns null otherwise */
        getEventFromCondition : function (conditionModel) {
            if (expeditor.Utils.getOrElse(conditionModel, "nodeName", null) != "EVENT_CONDITION") {
                return null;
            }
            if (expeditor.Utils.getOrElse(conditionModel, "choiceModel.nodeName", null) == "EVENT_AND_COMPARISON") {
                var event_and_comparison = conditionModel.choiceModel;
                if (event_and_comparison) {
                    var operatorModel = event_and_comparison.items[1];
                    var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);
                    if (RuntimeUtil.eventToEventName.hasOwnProperty(operator)) {
                        return operator;
                    }
                    return null;
                }
            } else if (expeditor.Utils.getOrElse(conditionModel, "choiceModel.nodeName", null) == "BINARY_EVENT_CONDITION") {
                var binaryEventCondition = expeditor.Utils.getOrElse(conditionModel, "choiceModel", null);
                if (binaryEventCondition) {
                    var condition1Event = this.getEventFromCondition(binaryEventCondition.items[0]);
                    var condition2Event = this.getEventFromCondition(binaryEventCondition.items[2]);
                    return condition1Event || condition2Event;
                }
            }
        },

        /**
         * escapes the scriptContent and encloses it an eval. Returns the final string
         * @param scriptContent scriptContent to escape and put inside eval
         * @returns {string} returns the scriptContent embedded inside eval
         */
        putScriptContentInEval : function (scriptContent) {
            return 'eval("' + scriptContent.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")
                .replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '")';
        },

        eventToEventName : {
            "is initialized" : "Initialize",
            "is clicked" : "Click",
            "is changed" : "Value Commit"
        },

        DEFAULT_EVENT : "is changed",

        SCRIPT_INDENT : "    "

    };
})(guidelib);
