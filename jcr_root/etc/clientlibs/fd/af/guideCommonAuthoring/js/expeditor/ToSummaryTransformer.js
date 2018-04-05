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
(function (guidelib) {
    var ExpressionEditorUtil = guidelib.author.ExpressionEditorUtil,
        RuntimeUtil = guidelib.RuntimeUtil,
        undefinedFieldDisplayName =  Granite.I18n.get("Unknown Field"),
        ToSummaryTransformer = guidelib.author.ToSummaryTransformer = expeditor.ToSummaryTransformer.extend({
        init : function (ctx) {
            this._super.apply(this, arguments);
        },

        _getFieldModel : function (condition) {
            if (condition.choiceModel.nodeName == "EVENT_AND_COMPARISON") {
                return condition.choiceModel.items[0];
            } else {
                return this._getFieldModel(condition.choiceModel.items[0]);
            }
        },

        enterEVENT_SCRIPTS : function (model) {
            var condition = model.items[0];
            var conditionEvent = RuntimeUtil.getEventFromCondition(condition);
            this.writeStatement(" " + Granite.I18n.get("WHEN") + " ");
            this.writeBreak();
            if (conditionEvent) {
                this._currentScriptContext().eventName = RuntimeUtil.eventToEventName[conditionEvent];
            } else {
                this._currentScriptContext().eventName = "Value Commit";
                var field = this._getFieldModel(condition);
                field.accept(this);
                this.writeNormal(" " + Granite.I18n.get("is changed") + " ");
                this.writeBreak();
                this.writeLogicalOperator(" " + Granite.I18n.get("AND") + " ");
                this.writeBreak();
            }
            condition.accept(this);
            this.writeBreak();
            this.writeKeyword(" " + Granite.I18n.get("THEN") + " ");
            this.writeBreak();
            model.items[2].accept(this);
            return true;
        },

        enterEVENT_AND_COMPARISON : function (model) {
            var field = model.items[0].getValue().id;
            this._currentScriptContext().field = field;
            var operator = expeditor.Utils.getOrElse(model.items[1], 'choiceModel.nodeName', null);
            if (operator && RuntimeUtil.eventToEventName.hasOwnProperty(operator)) {
                model.items[0].accept(this);
                this.writeNormal(" " + operator + " ");
                return true;
            }
            this.writeNormal(" (");
            if (ExpressionEditorUtil.unaryOperators.hasOwnProperty(operator)) {
                model.items[0].accept(this);
                model.items[1].accept(this);
                return true;
            }
        },

        exitEVENT_AND_COMPARISON : function (model) {
            var operator = expeditor.Utils.getOrElse(model.items[1], 'choiceModel.nodeName', null);
            if (!(operator && RuntimeUtil.eventToEventName.hasOwnProperty(operator))) {
                this.writeNormal(") ");
            }
        },

        _getDisplayName : function (id) {
            var scope = this.ctx.getScope();
            var variable = scope.findVarById(id);
            if (variable == null) {
                return undefinedFieldDisplayName;
            }
            var varDN = variable.element.getDisplayName();
            return varDN;
        },

        enterBLOCK_STATEMENT : function (model) {
        },

        exitBLOCK_STATEMENT : function (model) {
            this.writeBreak();
        },

        enterEVENT_CONDITION : function (model) {
            if (model.nested) {
                this.writeNormal(" (");
            }
        },

        exitEVENT_CONDITION : function (model) {
            if (model.nested) {
                this.writeNormal(") ");
            }
        },

        enterPRIMITIVE_EXPRESSION : function (model) {
        },

        enterAFCOMPONENT : function (model) {
            this._writeVariable(model);
        },

        enterCOMPONENT : function (model) {
            this._writeVariable(model);
        },

        enterEVENT : function (model) {
            this.writeKeyword(model.getChoiceModel().nodeName);
        },

        enterThen : function () {
            this.writeBreak();
            this.writeStatement(" " + Granite.I18n.get("THEN") + " ");
            this.writeBreak();
        },

        enterHIDE_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Hide") + " ");
        },

        enterSHOW_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Show") + " ");
        },

        enterVALUE_FIELD : function (model) {
            this._writeVariable(model);
        },

        enterCONDITIONORALWAYS : function (model) {
            if (model.getChoiceModel()) {
                this.writeBreak();
                this.writeKeyword(" " + Granite.I18n.get("WHEN") + " ");
                this.writeBreak();
            }
        },

        exitCONDITIONORALWAYS : function (model) {
            if (model.getChoiceModel()) {
                this.writeBreak();
            }
        },

        enterENABLE_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Enable") + " ");
        },

        enterDISABLE_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Disable") + " ");
        },

        enterACCESS_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Enable";
            this.writeStatement(" " + Granite.I18n.get("ENABLE") + " ");
            this.writeBreak();
        },

        exitACCESS_EXPRESSION : function (model) {
            var condition = model.items[2];
            if (condition.choiceModel) {
                this._enterELSE();
                this._enterDONOTHING_OR_ELSE(model.items[4]);
            }
        },

        enterDISABLE_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Disable";
            this.writeStatement(" " + Granite.I18n.get("DISABLE") + " ");
            this.writeBreak();
        },

        exitDISABLE_EXPRESSION : function (model) {
            var condition = model.items[2];
            if (condition.choiceModel) {
                this._enterELSE();
                this._enterDONOTHING_OR_ELSE(model.items[4]);
            }
        },

        enterCALC_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Calculate";
            this.writeStatement(" " + Granite.I18n.get("SET VALUE OF") + " ");
            this.writeBreak();
        },

        enterCLEAR_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Calculate";
            this.writeStatement(" " + Granite.I18n.get("CLEAR VALUE OF") + " ");
            this.writeBreak();
        },

        enterVALUE_COMMIT_EXPRESSION : function (model) {
            this.writeStatement(" " + Granite.I18n.get("WHEN VALUE OF") + " ");
            this.writeBreak();
        },

        enterSUMMARY_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Summary";
            this.writeStatement(" " + Granite.I18n.get("SET SUMMARY OF") + " ");
            this.writeBreak();
        },

        enterNAVIGABLE_PANEL : function (model) {
            this._writeVariable(model);
        },

        enterREPEATABLE_PANEL : function (model) {
            this._writeVariable(model);
        },

        enterCOMPLETION_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Completion";
            this.writeStatement(" " + Granite.I18n.get("SET COMPLETE") + " ");
            this.writeBreak();
        },

        enterVALIDATE_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Validate";
            this.writeStatement(" " + Granite.I18n.get("VALIDATE") + " ");
            this.writeBreak();
        },

        enterVISIBLE_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Hide";
            this.writeStatement(" " + Granite.I18n.get("HIDE") + " ");
            this.writeBreak();
        },

        _enterELSE : function (model) {
            this.writeKeyword(" " + Granite.I18n.get("ELSE") + " ");
            this.writeBreak();
        },

        _enterDONOTHING_OR_ELSE : function (model) {
            this.writeNormal(Granite.I18n.getVar(model.choiceModel.nodeName));
        },

        exitVISIBLE_EXPRESSION : function (model) {
            var condition = model.items[2];
            if (condition.choiceModel) {
                this._enterELSE();
                this._enterDONOTHING_OR_ELSE(model.items[4]);
            }
        },

        enterSHOW_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Show";
            this.writeStatement(" " + Granite.I18n.get("SHOW") + " ");
            this.writeBreak();
        },

        exitSHOW_EXPRESSION : function (model) {
            var condition = model.items[2];
            if (condition.choiceModel) {
                this._enterELSE();
                this._enterDONOTHING_OR_ELSE(model.items[4]);
            }
        },

        enterUsing : function (model) {
            this.writeBreak();
            this.writeNormal(" " + Granite.I18n.get("using") + " ");
        },

        enterExpression : function (model) {
            this.writeNormal(" " + Granite.I18n.get("expression") + " ");
            this.writeBreak();
        },

        enterDROPDOWN : function (model) {
            this.enterAFCOMPONENT(model);
        },

        enterOPTIONS_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[0].getValue().id;
            this._currentScriptContext().eventName = "Options";
            this.writeStatement(" " + Granite.I18n.get("SET OPTIONS OF") + " ");
            this.writeBreak();
        },

        enterNAVIGATION_EXPRESSION : function (model) {
            this._currentScriptContext().field = model.items[1].getValue().id;
            this._currentScriptContext().eventName = "Navigation";
            this.writeStatement(" " + Granite.I18n.get("ON NAVIGATION CHANGE") + " ");
            this.writeBreak();
        },

        enterTOOLBAR_BUTTON_OPTIONS : function (model) {
            var option = model.choiceModel.nodeName;
            this.writeKeyword(option + " ");
        },

        enterTOOLBAR_BUTTON : function (model) {
            this.enterAFCOMPONENT(model);
        },

        enterSET_PROPERTY : function (model) {
            this.writeNormal(Granite.I18n.get(" Set "));
            model.items[0].accept(this);
            model.items[1].accept(this);
            if (model.items[2].choiceModel.nodeName == "COMPARISON_EXPRESSION") {
                this.writeLiteral(" " + Granite.I18n.get("TRUE") + " ");
                this.writeKeyword(" " + Granite.I18n.get("WHEN") + " ");
            }
            model.items[2].accept(this);
            return true;
        },

        enterCLEAR_VALUE_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Clear value of") + " ");
        },

        enterSAVE_FORM : function (model) {
            this.writeNormal(Granite.I18n.get("Save Form"));
        },

        enterSUBMIT_FORM : function (model) {
            this.writeNormal(Granite.I18n.get("Submit Form"));
        },

        enterRESET_FORM : function (model) {
            this.writeNormal(Granite.I18n.get("Reset Form"));
        },

        enterVALIDATE_FORM : function (model) {
            this.writeNormal(Granite.I18n.get("Validate Form"));
        },

        enterREPEATABLE_COMPONENT : function (model) {
            this.enterCOMPONENT(model);
        },

        enterSET_FOCUS : function (model) {
            this.writeNormal(Granite.I18n.get("Set Focus to") + " ");
        },

        enterADD_INSTANCE : function (model) {
            this.writeNormal(Granite.I18n.get("Add Instance of") + " ");
        },

        enterREMOVE_INSTANCE : function (model) {
            this.writeNormal(Granite.I18n.get("Remove Instance of") + " ");
        },

        enterWSDL_OPTIONS_EXPRESSION : function (model) {
            this.writeNormal(Granite.I18n.get(" Webservice Output: "));
            var val = model.getValue();
            if (val && val.wsdlInfo) {
                //Different summary statement for normal and preconfigured WSDL
                if (val.wsdlInfo.webServiceTitle == null) {
                    this.writeLiteral(val.wsdlInfo.wsdlEndPoint + " ");
                    this.writeBreak();
                    this.writeNormal(Granite.I18n.get("Operation: "));
                    this.writeLiteral(val.wsdlInfo.operationName);
                } else {
                    //Preconfigured WSDL statement just shows the jcr:title for the service
                    this.writeLiteral(val.wsdlInfo.webServiceTitle);
                }
            }
        },

        enterWSDL_VALUE_EXPRESSION : function (model) {
            this.enterWSDL_OPTIONS_EXPRESSION(model);
        },
        getScript : function () {
            var scriptCtx = this._currentScriptContext();
            var scriptObj = this._super.apply(this, arguments);
            var fieldName = scriptCtx.field ? this._getDisplayName(scriptCtx.field) : undefinedFieldDisplayName;
            return $.extend(scriptObj, {
                title : (fieldName + " - " + Granite.I18n.getVar(scriptCtx.eventName))
            });
        }
    });
})(guidelib);
