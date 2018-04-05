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
(function ($) {
    var ExpressionEditorUtil = guidelib.author.ExpressionEditorUtil,
        RuntimeUtil = guidelib.RuntimeUtil,
        customTransformer = guidelib.author.AFTransformer = expeditor.rb.ToJsTransformer.extend({
        reset : function () {
            this.script = "";
            this.currentEvent = {
                name : null,
                field : null,
                model : null
            };
        },

        writeTab : function () {
            this.write(RuntimeUtil.SCRIPT_INDENT);
        },

        _getRelativeName : function (id, relativeTo) {
            var scope = this.ctx && typeof this.ctx.getScope === "function" ? this.ctx.getScope() : null;
            return RuntimeUtil.getRelativeName(id, relativeTo, scope);
        },

        enterSTATEMENT : function (model) {
            this.currentEvent.model = {
                nodeName : model.choiceModel.nodeName
            };
        },

        enterSCRIPTMODEL : function (model) {
            this.reset();
            this.newScript();
            if (model.script) {
                this.currentEvent.field = model.script.field;
                this.currentEvent.name = model.script.event;
                this.currentEvent.model = {
                    nodeName : model.nodeName,
                    version : model.version
                };
                this.script = model.script.content;
            }
        },

        enterEVENT_SCRIPTS : function (model) {
            var condition = model.items[0];
            var conditionEvent = RuntimeUtil.getEventFromCondition(condition) || RuntimeUtil.DEFAULT_EVENT;
            this.currentEvent.name = RuntimeUtil.eventToEventName[conditionEvent];
            if (!RuntimeUtil.isConditionOnlyAnEvent(condition)) {
                this.currentEvent.hasCondition  = true;
                this.write("if (");
                condition.accept(this);
                this.writeLn(") {");
                model.items[2].accept(this);
                this.write("}");
                return true;
            } else {
                this.currentEvent.hasCondition = false;
            }
        },

        enterEVENT_AND_COMPARISON : function (model) {
            var field = model.items[0].getValue().id;
            this.currentEvent.field = field;
            var operatorModel = model.items[1];
            var operator = expeditor.Utils.getOrElse(operatorModel, 'choiceModel.nodeName', null);

            if (operator) {
                if (!RuntimeUtil.eventToEventName.hasOwnProperty(operator)) {
                    if (operator == "IS_NOT_EMPTY") {
                        this.write('( this.value !== null && this.value !== "" )');
                    } else if (operator == "IS_EMPTY") {
                        this.write('( this.value === null || this.value === "" )');
                    } else if (operator == "IS_BEFORE" || operator == "IS_AFTER") {
                        this._handleDateOperators(model);
                    } else if (operator == "HAS_SELECTED") {
                        this._handleHasSelected(model);
                    }else {
                        this.enterVALUE_FIELD(model.items[0]);
                        model.items[1].accept(this);
                        model.items[2].accept(this);
                    }
                } else if (this.currentEvent.hasCondition) {
                    this.write("(true)");
                }
            }
            if (operator == 'CONTAINS') {
                this.write(") > -1");
            }
            if (operator == 'STARTS_WITH') {
                this.write(")) != null");
            }
            if (operator == 'ENDS_WITH') {
                this.write('+ "$")) != null');
            }

            if (operator == 'HAS_SELECTED') {
                this.write(") > -1");
            }
            return true;
        },

        enterBINARY_EVENT_CONDITION : function (model) {
            this.write(" ( ");
        },

        exitBINARY_EVENT_CONDITION : function (model) {
            this.write(" ) ");
        },

        /**
         * Returns the transformed script(s) having the following signature
         * {
         *   field : <field name>,
         *   event : <event name>,
         *   content : <transformed script content>
         * }
         * @returns {{field: null, event: null, model: null, content: string}}
         */
        getScript : function () {
            return {
                field : this.currentEvent.field,
                event : this.currentEvent.name,
                model : this.currentEvent.model,
                content : this.script
            };
        },

        enterCOMPONENT : function (model) {
            var val = model.getValue();
            if (val) {
                var shortName = this._getRelativeName(val.id, this.currentEvent.field);
                this.write(shortName);
                if (expeditor.Utils.isPrimitive(val.type)) {
                    this.write(".value");
                }
            }
        },

        enterVALUE_FIELD : function (model) {
            var val = model.getValue();
            if (val) {
                var shortName = this._getRelativeName(val.id, this.currentEvent.field);
                this.write(shortName + ".value");
            }
        },

        enterAFCOMPONENT : function (model) {
            var val = model.getValue();
            if (val) {
                var shortName = this._getRelativeName(val.id, this.currentEvent.field);
                this.write(shortName);
            }
        },

        enterTOOLBAR_BUTTON : function (model) {
            var val = model.getValue();
            if (val) {
                var shortName = this._getRelativeName(val.id, this.currentEvent.field);
                this.write(shortName);
            }
        },

        enterEVENT : function (model) {
            var event = model.choiceModel.nodeName;
            if (event === "is clicked") {
                this.currentEvent.name = "Click";
            } else {
                this.currentEvent.name = "Initialize";
            }
        },

        enterBLOCK_STATEMENT : function (model) {
            if (this.currentEvent.hasCondition) {
                this.writeTab();
            }
        },

        exitBLOCK_STATEMENT : function (model) {
            return this._super.apply(this, arguments);
        },

        exitHIDE_STATEMENT : function (model) {
            this.write(".visible = false");
        },

        exitSHOW_STATEMENT : function (model) {
            this.write(".visible = true");
        },

        exitENABLE_STATEMENT : function (model) {
            this.write(".enabled = true");
        },

        exitDISABLE_STATEMENT : function (model) {
            this.write(".enabled = false");
        },

        _writeCondition : function (model, statementFn) {
            var always = model == null;
            if (!always) {
                this.write("if (");
                model.accept(this);
                this.writeLn(") {");
            }
            if (typeof statementFn === 'function') {
                statementFn.call();
            }
            if (!always) {
                this.writeLn("");
                this.writeLn("}");
            }
        },

        enterCALC_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Calculate";
            var self = this;
            this._writeCondition(model.items[4].choiceModel, function () {
                if (self.mode === self.MERGE_MODE && model.items[2].choiceModel.nodeName != "WSDL_VALUE_EXPRESSION") {
                    self.write(self.currentEvent.name + " = ");
                }
                model.items[2].accept(self);
                self.writeLn(";");
            });
            return true;
        },

        enterCLEAR_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Calculate";
            var self = this,
                script = "null;";
            this._writeCondition(model.items[2].choiceModel, function () {
                if (self.mode === self.MERGE_MODE) {
                    self.write(self.currentEvent.name + " = ");
                }
                self.writeLn(script);
            });
            return true;
        },

        enterVALUE_COMMIT_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Value Commit";
            this.write("if (");
            this.write("this.value");
            model.items[1].choiceModel.accept(this);
            model.items[2].choiceModel.accept(this);
            this.writeLn(") {");
            model.items[4].accept(this);
            this.writeLn("");
            this.writeLn("}");
            return true;
        },

        enterSUMMARY_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Summary";
            var self = this;
            this._writeCondition(model.items[4].choiceModel, function () {
                model.items[2].accept(self);
            });
            return true;
        },

        enterEXPRESSION : function (model) {
            this.needsValue = true;
        },

        exitEXPRESSION : function (model) {
            this.needsValue = false;
        },

        enterSTRING_LITERAL : function (model) {
            return this._super.apply(this, arguments);
        },

        enterNUMERIC_LITERAL : function (model) {
            return this._super.apply(this, arguments);
        },

        enterDATE_LITERAL : function (model) {
            return this._super.apply(this, arguments);
        },

        enterBINARY_EXPRESSION : function (model) {
            return this._super.apply(this, arguments);
        },

        exitBINARY_EXPRESSION : function (model) {
            return this._super.apply(this, arguments);
        },

        /**
         * Write a If Else Condition with condition being the conditionModel and value being the code inside the
         * if block. If value is instance of Model, that will be transformed into a script otherwise the value
         * will be written as string
         * @param conditionModel condition for the if block
         * @param value {String|BaseModel}
         * @param elseModel {String}
         * @member AFTransformer
         * @private
         */
        _writeIfElseCondition : function (conditionModel, value, elseModel) {
            var always =  conditionModel.choiceModel === null;
            if (!always) {
                this.write("if (");
                conditionModel.accept(this);
                this.writeLn(") {");
            }
            if (typeof value === "string") {
                if (!always) {
                    this.writeTab();
                }
                this.writeLn(value);
            } else if (value instanceof expeditor.model.BaseModel) {
                value.accept(this);
            }
            if (!always) {
                if (typeof elseModel === "string") {
                    this.writeLn(" } else {");
                    this.writeTab();
                    this.writeLn(elseModel);
                }
                this.write("}");
            }
        },

        enterCONDITIONORALWAYS : function (model) {
            if (!model.choiceModel) {
                this.write("true");
            }
        },

        enterVISIBLE_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Visibility";
            var script = "false;", elseScript = "true;";
            if (this.mode === this.MERGE_MODE) {
                script = this.currentEvent.name + " = false;";
                elseScript = this.currentEvent.name + " = " + elseScript;
            }
            var elseClause = model.items[4].choiceModel.nodeName === "Show" ? elseScript : null;
            this._writeIfElseCondition(model.items[2], script, elseClause);
            return true;
        },

        enterSHOW_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Visibility";
            var script = "true;", elseScript = "false;";
            if (this.mode === this.MERGE_MODE) {
                script = this.currentEvent.name + " = true;";
                elseScript = this.currentEvent.name + " = " + elseScript;
            }
            var elseClause = model.items[4].choiceModel.nodeName === "Hide" ? elseScript : null;
            this._writeIfElseCondition(model.items[2], script, elseClause);
            return true;
        },

        enterACCESS_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Enabled";
            var script = "true;", elseScript = "false;";
            if (this.mode === this.MERGE_MODE) {
                script = this.currentEvent.name + " = true;";
                elseScript = this.currentEvent.name + " = " + elseScript;
            }
            var elseClause = model.items[4].choiceModel.nodeName === "Disable" ? elseScript : null;
            this._writeIfElseCondition(model.items[2], script, elseClause);
            return true;
        },

        enterDISABLE_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Enabled";
            var script = "false;", elseScript = "true;";
            if (this.mode === this.MERGE_MODE) {
                script = this.currentEvent.name + " = false;";
                elseScript = this.currentEvent.name + " = " + elseScript;
            }
            var elseClause = model.items[4].choiceModel.nodeName === "Enable" ? elseScript : null;
            this._writeIfElseCondition(model.items[2], script, elseClause);
            return true;
        },

        enterVALIDATE_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Validate";
            model.items[3].accept(this);
            this.writeLn(";");
            return true;
        },

        _handleHasSelected : function (model) {
            var operator = expeditor.Utils.getOrElse(model.get(1), "choiceModel.nodeName", null);
            if (operator == "HAS_SELECTED") {
                var lhs = model.get(0);
                var lhsType = "";
                if (lhs instanceof expeditor.model.ChoiceModel) {
                    lhs = lhs.choiceModel;
                }
                if (lhs instanceof expeditor.model.TerminalModel) {
                    if (lhs.getValue()) {
                        lhsType = lhs.getValue().type || lhsType;
                    }
                }
                var isDropDown = lhsType.split("|").indexOf("DROP DOWN") > -1;
                lhs.accept(this);
                this.write(".value.split(" + (isDropDown ? "'\\n'" : "','") + ").indexOf(");
                model.get(2).accept(this);
                return true;
            }
        },

        enterHAS_SELECTED : function () {
            // override default implementation
        },

        enterCOMPARISON_EXPRESSION : function (model) {
            return this._super.apply(this, arguments)
                || this._handleHasSelected(model);
        },

        enterCOMPLETION_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Completion";
            model.items[2].accept(this);
            this.writeLn(";");
            return true;
        },

        enterOPTIONS_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[0].getValue().id;
            this.currentEvent.name = "Options";
            var self = this;
            this._writeCondition(model.items[4].choiceModel, function () {
                model.items[2].accept(self);
            });
            return true;
        },

        enterNAVIGATION_EXPRESSION : function (model) {
            this.currentEvent.field = model.items[1].getValue().id;
            this.currentEvent.name = "Navigation";
            var self = this;
            this._writeCondition(model.items[3].choiceModel, function () {
                model.items[1].accept(self);
                var event = model.items[0].choiceModel.nodeName;
                if (event === 'Hide') {
                    self.write(".visible = false;");
                } else if (event === 'Show') {
                    self.write(".visible = true;");
                } else if (event === 'Enable') {
                    self.write(".enabled = true;");
                } else if (event === 'Disable') {
                    self.write(".enabled = false;");
                }
            });
            return true;
        },
        /**
         *  Method to generate a indented string representation of json object
         */
        _stringify : function (indentation, varName, jsonObj, quote) {
            var out = "var " + varName + " = " + JSON.stringify(jsonObj, null, RuntimeUtil.SCRIPT_INDENT.length);
            return out.split('\n').map(function (line) {
                return indentation + line;
            }).join('\n');
        },

        enterWSDL_OPTIONS_EXPRESSION : function (model) {
            var val = model.getValue();

            if (val == null) {
                return;
            }

            var indent = this.currentEvent.hasCondition ? RuntimeUtil.SCRIPT_INDENT : "";
            this._writeWsdlInfo(val, indent);

            /* inputs */
            this._writeWsdlInput(val, indent);
            var savedValue = val.outputModel.saveValue;
            var displayValue = val.outputModel.displayValue;

            if (savedValue && !displayValue) {
                displayValue = savedValue;
            }

            this.writeLn(indent + "var outputs={");
            this.writeLn(indent + RuntimeUtil.SCRIPT_INDENT + "savedValue:'" + savedValue + "',");
            this.writeLn(indent + RuntimeUtil.SCRIPT_INDENT + "displayedValue:'" + displayValue + "',");
            this.writeLn(indent + RuntimeUtil.SCRIPT_INDENT + "field:this");
            this.writeLn(indent + "};");

            this.write(indent + "guidelib.dataIntegrationUtils.setOptionsFromService(operationInfo, inputs, outputs);");
        },

        enterWSDL_VALUE_EXPRESSION : function (model) {
            var val = model.getValue();
            if (val == null) {
                return;
            }
            var indent = this.currentEvent.hasCondition ? RuntimeUtil.SCRIPT_INDENT : "";
            this._writeWsdlInfo(val, indent);

            /* inputs */
            this._writeWsdlInput(val, indent);
            var value = val.outputModel.value;

            this.writeLn(indent + "var outputs={");
            this.writeLn(indent + RuntimeUtil.SCRIPT_INDENT + "value:'" + value + "',");
            this.writeLn(indent + RuntimeUtil.SCRIPT_INDENT + "field:this");
            this.writeLn(indent + "};");

            this.write(indent + "guidelib.dataIntegrationUtils.setValueFromService(operationInfo, inputs, outputs);");
        },

        _writeWsdlInfo : function (val, indent) {
            /* wsdlInfo */
            var wsdlInfoString = this._stringify(indent, "operationInfo", val.wsdlInfo);
            if (wsdlInfoString && wsdlInfoString.length > indent.length) {
                wsdlInfoString = wsdlInfoString.substring(indent.length);
            }
            this.writeLn(wsdlInfoString + ";");
        },
        _writeWsdlInput : function (val, indent) {

            if (val.inputModel) {
                this.writeLn(indent + "var inputs = {");
                var inputString = "";

                // k: form field id, v: WSDL parameter
                var context = this;
                $.each(val.inputModel, function (k, v) {
                    if (v !== "" && v.choice) {
                        var valueToBeWritten = "";
                        if (typeof v.choice.value  === "object") {
                            var fieldId = expeditor.Utils.getOrElse(v, "choice.value.id", null);
                            if (fieldId !== null) {
                                valueToBeWritten = context._getRelativeName(v.choice.value.id,
                                    context.currentEvent.field);
                            }
                        } else {
                            valueToBeWritten = '"' + v.choice.value + '"';
                        }

                        if (valueToBeWritten !== "") {
                            inputString += indent + RuntimeUtil.SCRIPT_INDENT +
                                           '"' + k + '" : ' + valueToBeWritten + ",\n";
                        }
                    }
                });
                if (inputString.length > 1) {
                    this.writeLn(inputString.substring(0, inputString.length - 2));
                }
                this.write(indent + "}");

            } else {
                this.write(indent + "var inputs = {}");
            }
            this.writeLn(";");
        },
        enterWSDL_STATEMENT : function (model) {
            var val = model.getValue();
            if (val == null) {
                return;
            }
            var indent = this.currentEvent.hasCondition ? RuntimeUtil.SCRIPT_INDENT : "";

            this._writeWsdlInfo(val, indent);

            /* inputs */
            this._writeWsdlInput(val, indent);

            /* output */
            if (val.outputModel) {
                this.writeLn(indent + "var outputs = {");
                var outputString = "";
                // k: form field id, v: WSDL parameter
                var context = this;
                $.each(val.outputModel, function (k, v) {
                    if (v !== "") {
                        var fieldId = expeditor.Utils.getOrElse(v, "value.id", null);
                        if (fieldId !== null) {
                            var relativeName = context._getRelativeName(v.value.id, context.currentEvent.field);
                            outputString += indent + RuntimeUtil.SCRIPT_INDENT +  '"' +
                                            k + '" : ' + relativeName + ",\n";
                        }
                    }
                });
                if (outputString.length > 1) {
                    this.writeLn(outputString.substring(0, outputString.length - 2));
                }
                this.write(indent + "}");
            } else {
                this.write(indent + "var outputs = {}");
            }
            this.writeLn(";");

            // function invocation
            this.write(indent + "guidelib.dataIntegrationUtils.executeOperation(operationInfo, inputs, outputs);");
        },

        exitWSDL_STATEMENT : function (model) {

        },

        enterSET_PROPERTY : function (model) {
            model.items[0].accept(this);
            this.write(" = ");
            model.items[1].accept(this);
            model.items[2].accept(this);
            return true;
        },

        exitCLEAR_VALUE_STATEMENT : function (model) {
            this.write(" = null");
        },

        enterSAVE_FORM : function (model) {
            this.write("handleDraftSave(this)");
        },

        enterSUBMIT_FORM : function (model) {
            this.write("guideBridge.submit()");
        },

        enterRESET_FORM : function (model) {
            this.write("guideBridge.reset()");
        },

        enterVALIDATE_FORM : function (model) {
            this.write("guideBridge.validate()");
        },

        enterSET_FOCUS : function (model) {
            this.write("guideBridge.setFocus(");
        },

        exitSET_FOCUS : function (model) {
            this.write(".somExpression)");
        },

        enterADD_INSTANCE : function (model) {
            this.enterCOMPONENT(model.items[1]);
            this.write(".instanceManager.addInstance()");
        },

        enterREMOVE_INSTANCE : function (model) {
            var component = model.items[1];
            this.enterCOMPONENT(component);
            this.write(".instanceManager.removeInstance(");
            this.enterCOMPONENT(component);
            this.write(".instanceIndex)");
        },

        enterPRIMITIVE_VARIABLE : function (model) {
            var val = model.getValue();
            if (val) {
                this.write(this._getRelativeName(val.id, this.currentEvent.field));
                if (expeditor.Utils.isPrimitive(val.type)) {
                    this.write(".value");
                }
            }
        }
    });
}(jQuery));
