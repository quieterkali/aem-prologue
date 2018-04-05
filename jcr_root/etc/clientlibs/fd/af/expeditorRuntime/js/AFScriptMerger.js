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
(function () {
    var RuntimeUtil = guidelib.RuntimeUtil;
    /**
     * Returns a new script by appending the content of newScriptObj into the existing script content.
     * Modifies the content of the newScriptObj for different Events. Uses the eventVariableMap to store
     * the information of any variables created for modifying the current script
     * @param existingScriptObj
     * @param newScriptObj
     * @param eventVariableMap
     * @returns {string}
     */
    var appendScript = function (existingScriptObj, newScriptObj, eventVariableMap) {
        return existingScriptObj.content + "\n" + modifyRuleScript(newScriptObj, eventVariableMap);
    };

    /**
     *  Warps script in a try catch block,
     *  after adding indentation to each
     *  line of the script
     */
    var _wrapInTryCatch = function (script) {
        var wrappedScript =  "try {\n" +
                 script.split("\n").map(function (line) {
                     return RuntimeUtil.SCRIPT_INDENT + line;
                 }).join('\n') + "\n" +
               "} catch (e) {\n" +
               RuntimeUtil.SCRIPT_INDENT + "/*log here */\n" +
               "}\n";
        return wrappedScript;
    };
    /**
     * Modifies the ScriptObj to merge it with all the other rules for the event of the script. Creates variables
     * needed to store the result of the rule and stores the information in eventVariableMap
     * @param scriptObj
     * @param eventVariableMap
     * @returns {*}
     */
    var modifyRuleScript = function (scriptObj, eventVariableMap) {
        if (expeditor.Utils.getOrElse(scriptObj, "model.nodeName", null) === "SCRIPTMODEL") {
            var defaultValueScript = "";
            if (expeditor.Utils.getOrElse(scriptObj, "model.version", null) === 0) {
                if (booleanValueEvents.indexOf(scriptObj.event) > -1) {
                    defaultValueScript = "false;\n";
                } else {
                    defaultValueScript = "null;\n";
                }
            }
            var evalScript = RuntimeUtil.putScriptContentInEval(defaultValueScript + scriptObj.content);

            if (_variableAssignmentRequired(scriptObj.event)) {
                evalScript = _getVariableName(scriptObj.event, eventVariableMap) + " = " + evalScript;
            }
            if (singleVariableEvents.indexOf(scriptObj.event) > -1) {
                evalScript = scriptObj.event + " = " + evalScript;
            }
            return _wrapInTryCatch(evalScript + ";\n");
        } else {
            if (_variableAssignmentRequired(scriptObj.event)) {
                return _wrapInTryCatch(_getVariableName(scriptObj.event, eventVariableMap) + " = " + scriptObj.content);
            }
            return _wrapInTryCatch(scriptObj.content);
        }
    };

    /**
     * Whether the rule of the script to be stored in a variable
     * @param evntName
     * @returns {boolean}
     * @private
     */
    var _variableAssignmentRequired = function (evntName) {
        return specialEvents.indexOf(evntName) > -1;
    };
    /**
     * Creates a Variable for the event and store its information in the eventVarMap for generating future variables
     * with unique name
     * @param eventName
     * @param eventVarMap
     * @returns {string}
     * @private
     */
    var _getVariableName = function (eventName, eventVarMap) {
        eventVarMap[eventName] = eventVarMap[eventName] || 0;
        eventVarMap[eventName] = eventVarMap[eventName] + 1;
        return eventName + "_" + eventVarMap[eventName];
    };
    /**
     * Events that require variableAssignment and Merge with || operator
     * @type {string[]}
     */
    var specialEvents = ["Validate", "Completion"],
        booleanValueEvents = ["Visibility", "Enabled", "Validate", "Completion"],
        singleVariableEvents = ["Visibility", "Enabled", "Calculate"],
        expressionProp = {
            "Visibility" : "visible",
            "Enabled" : "enabled",
            "Calculate" : "value"
        };

    var afScriptMerger = guidelib.author.scriptMerger = {
        /**
         * Each element Script Array is of the type
         * {
         *   field : <field_name>
         *   event : <event>
         *   modelName : <modelName>
         *   content : <script_content>
         * }
         * @param scriptArray
         */
        mergeScript : function (scriptArray) {
            this.fields = {};
            this.eventMap = {};
            scriptArray.forEach(function (script) {
                var field = script.field,
                    name = script.event;
                this.fields[field] = this.fields[field] || {};
                this.fields[field][name] = this.fields[field][name] || {content : ""};
                this.eventMap[field] = this.eventMap[field] || {};
                this.fields[field][name].content = appendScript(this.fields[field][name], script, this.eventMap[field]);
            }, this);
            _.each(this.fields, function (field, fieldName) {
                var eventVars = this.eventMap[fieldName];
                specialEvents.forEach(function (eventName) {
                    if (field[eventName]) {
                        var varDefs = new Array(eventVars[eventName]),
                            returnStatement = new Array(eventVars[eventName]);
                        var varName, comma = ", ", OR = " || ";
                        for (var i = 1; i <= eventVars[eventName]; i++) {
                            varName = eventName + "_" + i;
                            varDefs[i - 1] = varName;
                            returnStatement[i - 1] = varName;
                        }
                        varDefs = "var " + varDefs.join(comma) + ";\n";
                        returnStatement = returnStatement.join(OR) + ";";
                        field[eventName].content = varDefs + field[eventName].content + "\n" + returnStatement;
                    }
                });
                singleVariableEvents.forEach(function (eventName) {
                    if (field[eventName]) {
                        var varDefs = "var " + eventName + ";\n",
                            returnStatement = "if (" + eventName + " === undefined) {\n" +
                                RuntimeUtil.SCRIPT_INDENT + "this." + expressionProp[eventName] + ";\n" +
                                "}\n else {\n" +
                                RuntimeUtil.SCRIPT_INDENT + eventName + ";\n" +
                                "}";
                        field[eventName].content = varDefs + field[eventName].content + "\n" + returnStatement;
                    }
                });
            }, this);
            return this.fields;
        }
    };
}());
