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

(function (expeditor) {
    var machine_generated_script_prefix = "/**\n",
        machine_generated_script_suffix = "\n * This is a machine-generated code for the rule.\n" +
            " * If you modify it in the code editor, you will not be able to view and edit the rule in the visual editor.\n" +
            " */\n\n";
    var BaseTransformer = expeditor.rb.BaseTransformer = expeditor.Class.extend({

        CODE_EDITOR_MODE : 0,
        MERGE_MODE : 1,

        init : function () {
            this.reset();
            this.bAddCopyRightHeader = true;
            this.mode = this.CODE_EDITOR_MODE;
            this.copyrightMessage = "";
        },

        setContext : function (ctx) {
            this.ctx = ctx;
        },

        setMode : function (mode) {
            if (mode === this.CODE_EDITOR_MODE || mode === this.MERGE_MODE) {
                this.mode = mode;
            }
        },

        setAddCopyrightHeader : function (bAddCopyrightHeader) {
            this.bAddCopyRightHeader = bAddCopyrightHeader;
        },

        setCopyrightMessage : function (message) {
            this.copyrightMessage = message;
        },

        getCopyrightHeader : function () {
            return machine_generated_script_prefix + this.copyrightMessage + machine_generated_script_suffix;
        },

        write : function (str) {
            if (str != null) {
                this.script += str;
            }
            return this;
        },

        writeLn : function (str) {
            this.write(str);
            this.write("\n");
            return this;
        },

        getScript : function () {
            return {
                content : this.script
            };
        },

        newScript : function () {
            if (this.bAddCopyRightHeader) {
                this.script = this.getCopyrightHeader();
            }
            return this;
        },

        reset : function () {
            this.script = "";
            this.bAddCopyRightHeader = true;
        }
    });
})(expeditor);
(function (expeditor) {
    var ToJsTransformer = expeditor.rb.ToJsTransformer = expeditor.rb.BaseTransformer.extend({
        enterROOT : function (model) {
            this.reset();
            this.newScript();
        },

        exitSTATEMENT : function (model) {
            this.writeLn();
        },

        exitBLOCK_STATEMENT : function (model) {
            this.writeLn(";");
        },

        enterIF_STATEMENT : function (model) {
            this.write("if (");
            model.items[0].accept(this);
            this.write(") {").writeLn();
            model.items[2].accept(this);
            this.writeLn("}");
            return true;
        },

        enterSET_VALUE_STATEMENT : function (model) {
            model.items[0].accept(this);
            this.write(" = ");
            model.items[2].accept(this);
            return true;
        },

        enterBINARY_EXPRESSION : function (model) {
            this.write(" ( ");
            if (this._handleUnaryOperators(model)) {
                return true;
            }
        },

        exitBINARY_EXPRESSION : function (model) {
            var operator = model.get(1).getChoiceModel().nodeName;
            if (operator == 'CONTAINS') {
                this.write(") > -1");
            }
            if (operator == 'STARTS_WITH') {
                this.write(")) != null");
            }
            if (operator == 'ENDS_WITH') {
                this.write('+ "$")) != null');
            }

            this.write(" ) ");
        },

        enterSTARTS_WITH : function (model) {
            this.write('.match(new RegExp("^"+');
        },

        enterHAS_SELECTED : function (model) {
            this.write('.value.split(",").indexOf(');
        },

        enterIS_TRUE : function (model) {
            this.write(" === true ");
        },

        enterIS_FALSE : function (model) {
            this.write(" === false ");
        },

        exitSTARTS_WITH : function (model) {
            
        },

        enterENDS_WITH : function (model) {
            this.write('.match(new RegExp(');
        },

        exitENDS_WITH : function (model) {
            
        },

        enterSTRING_LITERAL : function (model) {
            this.write('"' + model.getValue() + '"');
        },

        enterNUMERIC_LITERAL : function (model) {
            this.write(model.getValue());
        },

        enterDATE_LITERAL : function (model) {
            this.write('"' + model.getValue() + '"');
        },

        enterVARIABLE : function (model) {
            this.write(model.getValue());
        },

        enterPLUS : function (model) {
            this.write(" + ");
        },

        enterMINUS : function (model) {
            this.write(" - ");
        },

        enterDIVIDE : function (model) {
            this.write(" / ");
        },

        enterMULTIPLY : function (model) {
            this.write(" * ");
        },

        enterLESS_THAN : function () {
            this.write(" < ");
        },

        enterGREATER_THAN : function () {
            this.write(" > ");
        },

        enterEQUALS_TO : function () {
            this.write(" == ");
        },

        enterNOT_EQUALS_TO : function () {
            this.write(" !== ");
        },

        enterAND : function () {
            this.write(" && ");
        },

        enterOR : function () {
            this.write(" || ");
        },

        enterCONTAINS : function () {
            this.write('.indexOf(');
        },

        enterTrue : function () {
            this.write("true");
        },

        enterFalse : function () {
            this.write("false");
        },

        enterPRIMITIVE_VARIABLE : function (model) {
            var val = model.getValue();
            this.write(val.id);
            if (expeditor.Utils.isPrimitive(val.type)) {
                this.write(".value");
            }
        },

        exitPRIMITIVE_VARIABLE : function () {

        },

        _handleUnaryOperators : function (model) {
            var operator = expeditor.Utils.getOrElse(model.get(1), "choiceModel.nodeName", null);
            if (operator === 'IS_EMPTY') {
                this.write(' ([null,""].indexOf(');
                model.get(0).accept(this);
                this.write(") > -1) ");
                return true;
            }
            if (operator === 'IS_NOT_EMPTY') {
                this.write(' ([null,""].indexOf(');
                model.get(0).accept(this);
                this.write(") === -1) ");
                return true;
            }

            if (operator === 'IS_TRUE' || operator == 'IS_FALSE') {
                model.get(0).accept(this);
                model.get(1).accept(this);
                return true;
            }
        },

        _writeDate : function (model) {
            var expModel = model;
            if (model instanceof expeditor.model.ChoiceModel) {
                expModel = expeditor.Utils.getOrElse(model, "choiceModel", null);
            }
            var type = null;
            if (expModel instanceof expeditor.model.TerminalModel) {
                type = expModel.getValue().type;
            }
            this.write("new Date(");
            model.accept(this);
            
            if (type && !expeditor.Utils.isPrimitive(type)) {
                this.write(".value");
            }
            this.write(")");
        },

        _handleDateOperators : function (model) {
            var operator = expeditor.Utils.getOrElse(model.get(1), "choiceModel.nodeName", null);
            if (operator === "IS_BEFORE") {
                this._writeDate(model.get(0));
                this.write("<");
                this._writeDate(model.get(2));
                return true;
            }

            if (operator === "IS_AFTER") {
                this._writeDate(model.get(0));
                this.write(">");
                this._writeDate(model.get(2));
                return true;
            }
        },
        enterCOMPARISON_EXPRESSION : function (model) {
            return this._handleDateOperators(model) || this._handleUnaryOperators(model);
        },

        exitCOMPARISON_EXPRESSION : function (model) {
            if (model.get(1) && model.get(1).getChoiceModel()) {
                if (model.get(1).getChoiceModel().nodeName == 'CONTAINS') {
                    this.write(") > -1");
                }
                if (model.get(1).getChoiceModel().nodeName == 'STARTS_WITH') {
                    this.write(")) != null");
                }
                if (model.get(1).getChoiceModel().nodeName == 'ENDS_WITH') {
                    this.write('+ "$")) != null');
                }
                if (model.get(1).getChoiceModel().nodeName == 'HAS_SELECTED') {
                    this.write(") > -1");
                }
            }
        },

        enterCONDITION : function (model) {
            if (model.nested) {
                this.write(" ( ");
            }
        },

        exitCONDITION : function (model) {
            if (model.nested) {
                this.write(" ) ");
            }
        },

        exitBOOLEAN_BINARY_EXPRESSION : function (model) {
            if (model.get(1) && model.get(1).getChoiceModel()) {
                if (model.get(1).getChoiceModel().nodeName == 'CONTAINS') {
                    this.write(") > -1");
                }
                if (model.get(1).getChoiceModel().nodeName == 'STARTS_WITH') {
                    this.write(")) != null");
                }
                if (model.get(1).getChoiceModel().nodeName == 'ENDS_WITH') {
                    this.write('+ "$")) != null');
                }
            }
        },

        enterCOMPONENT : function (model) {
            this.write(model.getValue());
        },

        enterMEMBER_EXPRESSION : function (model) {
            model.items[2].accept(this);
            this.write(".");
            model.items[0].accept(this);
            return true;
        },

        enterPROPERTY_LIST : function (model) {
            this.write(model.getValue());
        },

        enterFUNCTION_CALL : function (model) {
            var funcDef = model.getFunctionName(),
                impl = funcDef.impl,
                self = this;
            
            impl.replace(/\$([\d]+)|./g, function (match, n1, offset) {
                if (n1 && n1.length > 0) {
                    var num = +n1;
                    if (num === 0) {
                        self.write(funcDef.id);
                    } else {
                        model.getParameter(num - 1).accept(self);
                    }
                } else {
                    self.write(match);
                }
            });
        }

    });
})(expeditor);
(function (expeditor) {
    var ToSummaryTransformer = expeditor.ToSummaryTransformer = expeditor.rb.BaseTransformer.extend({

        HTML_MODE : 0,
        PLAIN_TEXT_MODE : 1,

        init : function (ctx) {
            this._super.apply(this, arguments);
            this.ctx = ctx;
            this.programCalls = 0;
            this.mode = this.HTML_MODE;
            this.scriptContext = {};
        },

        setMode : function (mode) {
            if (mode === this.HTML_MODE || mode === this.PLAIN_TEXT_MODE) {
                this.mode = mode;
            }
        },

        newScript : function () {
            this.script = "";
            this.scriptContext = {};
            return this;
        },

        _currentScriptContext : function () {
            return this.scriptContext;
        },

        enterROOT : function (model) {
            this.newScript();
            this._currentScriptContext().index = this.programCalls;
            this._currentScriptContext().isvalid = model.getIsValid();
            this._currentScriptContext().enabled = model.getIsEnabled();
        },

        exitROOT : function (model) {
            this.programCalls++;
            this._currentScriptContext().content = this.script;
        },

        enterSTATEMENT : function (model) {
            this._currentScriptContext().title = Granite.I18n.get("Rule") + " " + this.programCalls;
            if (this.mode === this.HTML_MODE) {
                this.write('<span>');
            }
        },

        enterSCRIPTMODEL : function (model) {
            this.newScript();
            if (model.script) {
                var stmt = '<div>';
                stmt += '<code class="summary-script"><pre>' + model.script.content + "</pre></code>";
                this.write(stmt);
                this.write('</div>');
                this._currentScriptContext().content = this.script;
                this._currentScriptContext().field = model.script.field;
                this._currentScriptContext().eventName = model.script.event;
                this._currentScriptContext().index = this.programCalls;
                this._currentScriptContext().isvalid = model.getIsValid();
                this._currentScriptContext().enabled = model.getIsEnabled();
                this._currentScriptContext().isScript = true;
                this.programCalls++;
            }
        },

        IF_STATEMENT : function (model) {
            this.writeStatement(Granite.I18n.get("IF"));
        },

        exitSTATEMENT : function (model) {
            if (this.mode === this.HTML_MODE) {
                this.write("</span>");
            }
        },

        enterTHEN : function (model) {
            this.writeBreak();
            this.writeStatement(" " + Granite.I18n.get("THEN") + " ");
            this.writeBreak();
        },

        enterSET_VALUE_STATEMENT : function (model) {
            this.writeNormal(" " + Granite.I18n.get("Set value of") + " ");
        },

        enterCOMPARISON_EXPRESSION : function (model) {
            this.writeNormal(" " + Granite.I18n.get("("));
        },

        exitCOMPARISON_EXPRESSION : function (model) {
            this.writeNormal(Granite.I18n.get(")") + " ");
        },

        
        enterTo : function (model) {
            this.writeNormal(" " + Granite.I18n.get("to", null, "Prefixed by: Set value to VARIABLE") + " ");
        },

        
        enterto : function (model) {
            this.writeNormal(" " + Granite.I18n.get("to", null, "Prefixed by: Set value to VARIABLE") + " ");
        },

        enterNUMERIC_LITERAL : function (model) {
            this.writeLiteral(model.getValue());
        },

        enterDATE_LITERAL : function (model) {
            this.writeLiteral(model.getValue());
        },

        enterFalse : function () {
            this.writeLiteral(" " + Granite.I18n.get("FALSE") + " ");
        },

        enterTrue : function () {
            this.writeLiteral(" " + Granite.I18n.get("TRUE") + " ");
        },

        _writeVariable : function (model) {
            var valObj = model.getValue();
            if (valObj && valObj.id) {
                var scope = this.ctx.getScope();
                var variable = scope.findVarById(valObj.id);
                if (variable === null) {
                    this._writeTag("span", [
                        {
                            name : "class",
                            value : "undefined-variable"
                        },
                        {
                            name : "title",
                            value : Granite.I18n.get("Reference Error : The $$ field with SOM ID $$ is undefined as it has been renamed or removed.").replace("$$", valObj.displayName).replace("$$", valObj.id)
                        }
                    ], valObj.displayName || valObj.name);
                    this._currentScriptContext().isvalid = false;
                } else {
                    variable = variable.element;
                    var varDN = variable.getDisplayName();
                    this.writeVariable(varDN);
                }
            }
        },

        
        _writeTag : function (tagName, attrs, text) {
            if (this.mode === this.HTML_MODE) {
                this.write("<" + tagName + " ");
                attrs.forEach(function (attr) {
                    this.write(attr.name + ' = "' + attr.value + '" ');
                }, this);
                this.write(">");
            }
            this.write(text);
            if (this.mode === this.HTML_MODE) {
                this.write("</" + tagName + ">");
            }
        },

        enterCOMPONENT : function (model) {
            this._writeVariable(model);
        },

        enterPRIMITIVE_VARIABLE : function (model) {
            this._writeVariable(model);
        },

        enterVARIABLE : function (model) {
            this.writeVariable(model.getId());
        },

        enterBINARY_EXPRESSION : function (model) {
            this.writeNormal(" " + Granite.I18n.get("("));
        },

        exitBINARY_EXPRESSION : function (model) {
            this.writeNormal(Granite.I18n.get(")") + " ");
        },

        enterCONDITION : function (model) {
            if (model.nested) {
                this.writeNormal(" " + Granite.I18n.get("("));
            }
        },

        exitCONDITION : function (model) {
            if (model.nested) {
                this.writeNormal(Granite.I18n.get(")") + " ");
            }
        },

        enterSTRING_LITERAL : function (model) {
            this.writeLiteral(model.getValue());
        },

        enterCONTAINS : function (model) {
            this.writeNormal(" " + Granite.I18n.get("contains") + " ");
        },

        enterEQUALS_TO : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is equal to") + " ");
        },

        enterNOT_EQUALS_TO : function (model) {
            this.writeOperator(" " + Granite.I18n.get("≠") + " ");
        },

        enterPLUS : function (model) {
            this.writeOperator(" " + Granite.I18n.get("+") + " ");
        },

        enterMINUS : function (model) {
            this.writeOperator(" " + Granite.I18n.get("-") + " ");
        },

        enterMULTIPLY : function (model) {
            this.writeOperator(" " + Granite.I18n.get("×") + " ");
        },

        enterDIVIDE : function (model) {
            this.writeOperator(" " + Granite.I18n.get("÷") + " ");
        },

        enterLESS_THAN : function (model) {
            this.writeOperator(" " + Granite.I18n.get("<") + " ");
        },

        enterGREATER_THAN : function (model) {
            this.writeOperator(" " + Granite.I18n.get(">") + " ");
        },

        enterSTARTS_WITH : function (model) {
            this.writeNormal(" " + Granite.I18n.get("starts with") + " ");
        },

        enterENDS_WITH : function (model) {
            this.writeNormal(" " + Granite.I18n.get("ends with") + " ");
        },

        enterIS_EMPTY : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is empty"));
        },

        enterIS_NOT_EMPTY : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is not empty"));
        },

        enterHAS_SELECTED : function (model) {
            this.writeNormal(" " + Granite.I18n.get("has selected") + " ");
        },

        enterIS_TRUE : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is true") + " ");
        },

        enterIS_BEFORE : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is before") + " ");
        },

        enterIS_AFTER : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is after") + " ");
        },

        enterIS_FALSE : function (model) {
            this.writeNormal(" " + Granite.I18n.get("is false") + " ");
        },

        enterOR : function (model) {
            this.writeBreak();
            this.writeLogicalOperator(" " + Granite.I18n.get("OR") + " ");
            this.writeBreak();
        },

        enterAND : function (model) {
            this.writeBreak();
            this.writeLogicalOperator(" " + Granite.I18n.get("AND") + " ");
            this.writeBreak();
        },

        writeKeyword : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-keyword">' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeOperator : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-operator" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeLiteral : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-literal" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeVariable : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-variable" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeNormal : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-normal" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeLogicalOperator : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-logical-operator" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeStatement : function (str) {
            if (this.mode === this.HTML_MODE) {
                this.write('<span class="summary-statement" >' + str + '</span>');
            } else {
                this.write(str);
            }
        },

        writeBreak : function () {
            if (this.mode === this.HTML_MODE) {
                this.write("<br class='summary-break' />");
            }
        },

        enterOf : function () {
            this.writeNormal(" " + Granite.I18n.get("of") + " ");
        },

        enterPROPERTY_LIST : function (model) {
            this.writeVariable(model.getValue());
            this.writeNormal(" " + Granite.I18n.get("property of") + " ");
        },

        enterWSDL_STATEMENT : function (model) {

            var val = model.getValue();
            if (val && val.wsdlInfo) {
                
                if (val.wsdlInfo.wsdlEndPoint) {
                    this.writeNormal(" " + Granite.I18n.get("Invoke Webservice:") + " ");
                    if (val.wsdlInfo.webServiceTitle == null) {
                        this.writeLiteral(val.wsdlInfo.wsdlEndPoint + " ");
                        this.writeBreak();
                        this.writeNormal(Granite.I18n.get("Operation:") + " ");
                        this.writeLiteral(val.wsdlInfo.operationName);
                    } else {
                        
                        this.writeLiteral(val.wsdlInfo.webServiceTitle);
                    }
                } else {
                    this.writeNormal(" " + Granite.I18n.get("Invoke Service:") + " ");
                    this.writeLiteral(val.wsdlInfo.operationTitle || val.wsdlInfo.operationName);
                    this.writeBreak();
                    this.writeNormal(Granite.I18n.get("of FormDataModel:") + " ");
                    this.writeLiteral(val.wsdlInfo.formDataModelId + " ");
                }
            }
        },

        exitWSDL_STATEMENT : function (model) {
        },

        enterFUNCTION_CALL : function (model) {
            var funcDef = model.getFunctionName();
            if (funcDef && funcDef.displayName) {
                this.writeNormal(" (" + Granite.I18n.get("Output of Function") + " " + funcDef.displayName + ") ");
            }
        },

        getScript : function () {
            return {
                content : this._currentScriptContext().content,
                title : this._currentScriptContext().title,
                index : this._currentScriptContext().index,
                isvalid : this._currentScriptContext().isvalid,
                eventName : this._currentScriptContext().eventName,
                enabled : this._currentScriptContext().enabled,
                isScript : this._currentScriptContext().isScript
            };
        }
    });
})(expeditor);
(function (expeditor) {
    var VariableDefinition = expeditor.rb.VariableDefinition = expeditor.Class.extend({
        init : function (id, displayName, type, displayPath, isDuplicate, name, options, parent) {
            this.id = id;
            this.displayName = displayName;
            this.type = type;
            this.displayPath = displayPath;
            this._isDuplicate = isDuplicate;
            this.name = name;
            this.props = {};
            this.props.options = options;
            this.parent = parent;
        },

        getId : function () {
            return this.id;
        },

        getDisplayName : function () {
            return this.displayName;
        },

        getType : function () {
            return this.type;
        },

        toJson : function () {
            return {
                id : this.id,
                displayName : this.displayName,
                type : this.type,
                isDuplicate : this._isDuplicate,
                displayPath : this.displayPath,
                name : this.name,
                parent : this.parent
            };
        },

        getDisplayPath : function () {
            return this.displayPath;
        },

        isDuplicate : function () {
            return this._isDuplicate;
        },
        getProps : function () {
            return this.props;
        },
        setProps : function (props) {
            this.props = props;
        }

    });
})(expeditor);
(function (expeditor) {
    var FunctionDefinition = expeditor.rb.FunctionDefinition = expeditor.rb.VariableDefinition.extend({
        init : function (id, displayName, returnType, args, impl, name) {
            this._super.call(this, id, displayName, returnType, "", false, name);
            this.args = args || [];
            this.impl = impl;
        },

        getArgs : function () {
            return this.args;
        },

        getImpl : function () {
            return this.impl;
        },

        toJson : function () {
            var obj = this._super.apply(this, arguments);
            obj.args = this.args;
            obj.impl = this.impl;
            return obj;
        }
    });
})(expeditor);
 (function ($, expeditor) {
    
    expeditor.WSDL = expeditor.WSDL || {};
    var WSDLOperations = expeditor.WSDL.getAllOperations = function (WSDLPath, successHandler, faultHandler) {
        var afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window;
        var guidePath = afWindow.$(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
        var resourcePath = guidePath + ".af.dermis";
        var externalizedResourcePath = Granite.HTTP.externalize(resourcePath);
        $.ajax({
            type : 'GET',
            url : externalizedResourcePath,
            data : {functionToExecute : 'getAllOperations',
                    wsdlEndPoint : WSDLPath
                },
            success : successHandler,
            error : faultHandler
        });
    };
})(jQuery, expeditor);
(function (expeditor) {
    var RBScope = expeditor.rb.RBScope = expeditor.Class.extend({
        
        init : function (config) {
            this.clearVars();
            var _config = config || {};
            var functionStorage = _config.funcStorage || "expeditor.rb.MapStorage";
            var varStorage = _config.varStorage || "expeditor.rb.MapStorage";
            var storageClass = expeditor.Utils.getOrElse(window, varStorage, expeditor.rb.MapStorage);
            this.varsById = new storageClass();
            storageClass = expeditor.Utils.getOrElse(window, functionStorage, expeditor.rb.MapStorage);
            this.funcById = new storageClass();
            this.funcsByType = {};
            this.types = {};
            if (config) {
                this.addVars(config.vars);
                this.addFunctions(config.funcs);
                this.addTypes(config.types);
            }
        },

        clearVars : function () {
            if (this.varsById) {
                this.varsById.clear();
            }
            this.varsByType = {};
        },

        addVars : function (vars) {
            if (vars) {
                for (var varId in vars) {
                    var def = vars[varId];
                    if (def !== null) {
                        this.defineVariable(new expeditor.rb.VariableDefinition(varId, def.displayName, def.type,
                            def.displayPath, def.isDuplicate, def.name, def.options, def.parent));
                    }
                }
            }
        },

        addFunctions : function (funcs) {
            if (funcs) {
                for (var funcId in funcs) {
                    var def = funcs[funcId];
                    this.defineFunction(new expeditor.rb.FunctionDefinition(funcId, def.displayName, def.type,
                        def.args, def.impl, def.name));
                }
            }
        },

        addTypes : function (types) {
            if (types) {
                for (var typeId in types) {
                    var def = types[typeId];
                    var newDef = {};
                    var newVars = {};
                    if (def.inherits) {
                        var parentType = this.types[def.inherits];
                        var parentFields = parentType.vars;
                        newVars = $.extend(true, newVars, parentType.vars);
                    }
                    newVars = $.extend(true, newVars, def.vars);
                    newDef.inherits = def.inherits;
                    newDef.vars = newVars;
                    this.types[typeId] = newDef;
                }
            }
        },

        _defineVarOrFunc : function (variable, varOrFunc) {
            var idStore = this._getIdStore(varOrFunc);
            var typeStore = this._getTypeStore(varOrFunc);
            var id = variable.getId();
            var type = variable.getType();
            if (!id || !type) {
                throw new Error("Error Defining " + variable + " id and type are required");
            }
            idStore.addElement(id, variable);
            var types = type.split("|").forEach(function (varType) {
                var trimmedType = varType.trim();
                (typeStore[trimmedType] = typeStore[trimmedType] || []).push(variable);
            }, this);
        },

        defineVariable : function (variable) {
            this._defineVarOrFunc(variable, "var");
        },

        defineFunction : function (func) {
            this._defineVarOrFunc(func, "func");
        },

        _getIdStore : function (varOrFunc) {
            return varOrFunc === "var" ? this.varsById : this.funcById;
        },

        _getTypeStore : function (varOrFunc) {
            return varOrFunc === "var" ? this.varsByType : this.funcsByType;
        },

        _getAll : function (varOrFunc) {
            var store = this._getIdStore(varOrFunc);
            return store.getAll();
        },

        _getAllFunctions : function () {
            return this._getAll("func");
        },

        _getAllVars : function () {
            return this._getAll("var");
        },

        findByType : function (types, varOrFunc) {
            if (types.length == 0) {
                return [];
            }
            var typeStore = this._getTypeStore(varOrFunc);
            var typesArray = types.split("|");
            if (typesArray.indexOf("ANY") > -1) {
                return this._getAll(varOrFunc);
            } else {
                var idsAdded = {}, returnVars = [], i = 0;
                for (; i < typesArray.length; i++) {
                    var type = typesArray[i].trim(),
                        variables = typeStore[type],
                        j = 0;
                    if (variables instanceof Array) {
                        for (; j < variables.length; j++) {
                            var variable = variables[j];
                            if (typeof idsAdded[variable.getId()] === "undefined") {
                                returnVars.push(variable);
                            }
                        }
                    }
                }
                return returnVars;
            }
        },

        findVarByType : function (types) {
            return this.findByType(types, "var");
        },

        findFunctionsByType : function (types) {
            return this.findByType(types, "func");
        },

        findVarById : function (id) {
            return this.varsById.get(id);
        },

        findFunctionById : function (id) {
            return this.funcById.get(id);
        },

        findById : function (id, varOrFunc) {
            var store = this._getIdStore(varOrFunc);
            return store.get(id);
        },

        getAllTypes : function () {
            return this.types;
        },

        findUniqueVarId : function (id) {
            return this.varsById.getUniqueId(id);
        }
    });
})(expeditor);
(function () {
    var Storage = expeditor.rb.MapStorage = expeditor.Class.extend({

        init : function () {
            this.store = {};
        },

        
        addElement : function (id, element) {
            this.store[id] = element;
        },

        
        get : function (id) {
            if (this.store[id]) {
                return {
                    foundId : id,
                    element : this.store[id]
                };
            }
            return null;
        },

        
        getUniqueId : function (id) {
            return id;
        },

        
        clear : function () {
            this.store = {};
        },

        
        getAll : function () {
            var result = [];
            for (var key in this.store) {
                if (this.store.hasOwnProperty(key)) {
                    result.push(this.store[key]);
                }
            }
            return result;
        }
    });
}());
(function () {
    expeditor.rb.DefaultRulesConfig = {
        STATEMENTS : 'STATEMENT+',
        STATEMENT : '',
        BLOCK_STATEMENTS : {
            rule : 'BLOCK_STATEMENT+',
            extras : {
                view : {
                    buttonText : 'Add Statement'
                }
            }
        },
        BLOCK_STATEMENT : {
            rule : "",
            extras : {
                component : {
                    selectedItem : false
                },
                view : {
                    placeholder : 'Select Action'
                }
            }
        },
        IF_STATEMENT : {
            rule : 'CONDITION THEN BLOCK_STATEMENTS',
            choiceName : 'When'
        },
        CONDITION : {
            rule : 'COMPARISON_EXPRESSION | BOOLEAN_BINARY_EXPRESSION',
            choiceName : 'When',
            component : 'expeditor.component.ExpressionComponent',
            view : 'expeditor.view.ConditionView',
            model : 'expeditor.model.ConditionModel',
            extras : {
                component : {
                    dataType : 'BOOLEAN',
                    extension : "BOOLEAN_BINARY_EXPRESSION"
                },
                view : {
                    inline : true,
                    placeholder : 'Select a Condition',
                    extension : "BOOLEAN_BINARY_EXPRESSION",
                    deleteOption : true
                }
            }
        },
        "COMPARISON_EXPRESSION" : {
            rule : "EXPRESSION OPERATOR EXPRESSION",
            component : 'expeditor.component.BinaryExpressionComponent',
            extras : {
                component : {
                    dataType : 'BOOLEAN',
                    operandTypes : ['STRING|NUMBER|RADIO BUTTON|DROP DOWN|CHECK BOX|BOOLEAN|DATE', 'STRING|NUMBER|DATE'],
                    enableMetaPropSync : true
                }
            },
            choiceName : 'Condition'
        },
        "BOOLEAN_BINARY_EXPRESSION" : {
            rule : 'CONDITION OPERATOR CONDITION',
            component : 'expeditor.component.BinaryExpressionComponent',
            view : 'expeditor.view.AndOrExpressionView',
            extras : {
                component : {
                    dataType : "BOOLEAN",
                    "childConfig" : {
                        "1" : {
                            extras : {
                                component : {
                                    filter : ['IS_EMPTY','IS_NOT_EMPTY','HAS_SELECTED','IS_TRUE','IS_FALSE']
                                }
                            }
                        }
                    }
                }
            }
        },
        SET_VALUE_STATEMENT : {
            rule : 'PRIMITIVE_VARIABLE to EXPRESSION',
            choiceName : 'Set Value of',
            view : 'expeditor.view.DoubleView',
            component : 'expeditor.component.SetValueComponent',
            extras : {
                dataType : 'ANY'
            }
        },
        EXPRESSION : {
            rule : 'COMPONENT | STRING_LITERAL | NUMERIC_LITERAL | BINARY_EXPRESSION | FUNCTION_CALL | MEMBER_EXPRESSION | DATE_LITERAL',
            component : 'expeditor.component.ExpressionComponent',
            view : 'expeditor.view.ExpressionView',
            extras : {
                component : {
                    selectedItem : false,
                    dataType : 'ANY'
                },
                view : {
                    placeholder : 'Select Option',
                    inline : true,
                    composite : ['COMPONENT','STRING_LITERAL','NUMERIC_LITERAL', 'FUNCTION_CALL', 'DATE_LITERAL']
                }
            }
        },
        PROPERTY_LIST : {
            component : 'expeditor.component.PropertyListComponent',
            view : 'expeditor.view.VariableView',
            extras : {
                component : {
                    dataType : 'ANY'
                },
                view : {
                    placeholder : 'Tap here to select a property'
                }
            }
        },
        MEMBER_EXPRESSION : {
            rule : 'PROPERTY_LIST of COMPONENT',
            choiceName : 'Object Property',
            component : 'expeditor.component.MemberExpressionComponent',
            view : 'expeditor.view.MemberExpressionView'
        },
        FUNCTION_CALL : {
            rule : "FUNCTION",
            choiceName : "Function Output",
            component : 'expeditor.component.FunctionComponent',
            view : 'expeditor.view.FunctionView',
            model : 'expeditor.model.FunctionModel',
            extras : {
                component : {
                    dataType : 'ANY'
                }
            }
        },
        PARAMETER : {
            rule : 'COMPONENT | STRING_LITERAL | NUMERIC_LITERAL | DATE_LITERAL',
            component : 'expeditor.component.ExpressionComponent',
            view : 'expeditor.view.ExpressionView',
            extras : {
                component : {
                    selectedItem : true,
                    dataType : 'STRING | NUMBER | BOOLEAN | DATE'
                },
                view : {
                    placeholder : 'Select option',
                    inline : true,
                    composite : ['COMPONENT','STRING_LITERAL','NUMERIC_LITERAL','DATE_LITERAL']
                }
            }
        },
        STRING_LITERAL : {
            extras : {
                component : {
                    dataType : 'STRING'
                },
                view : {
                    type : "Input",
                    placeholder : "Enter a String"
                }
            },
            choiceName : 'String'
        },
        NUMERIC_LITERAL : {
            extras : {
                component : {
                    dataType : 'NUMBER'
                },
                view : {
                    type : "Input",
                    inputType : "number",
                    placeholder : "Enter a Number"
                }
            },
            choiceName : 'Number'
        },
        DATE_LITERAL : {
            extras : {
                component : {
                    dataType : 'DATE'
                },
                view : {
                    type : "Input",
                    placeholder : "Select a Date"
                }
            },
            choiceName : 'Date'
        },
        BOOLEAN_LITERAL : {
            rule : "True | False",
            extras : {
                component : {
                    dataType : 'BOOLEAN'
                },
                view : {
                    hideChild : true,
                    renderOptionList : true
                }
            },
            choiceName : 'Boolean'
        },
        COMPONENT : {
            rule : "VARIABLE",
            extras : {
                component : {
                    dataType : 'ANY'
                }
            },
            choiceName : 'Form Object'
        },
        PRIMITIVE_VARIABLE : {
            rule : "VARIABLE",
            extras : {
                component : {
                    dataType : 'STRING | NUMBER | BOOLEAN | DATE'
                }
            },
            choiceName : 'Component'
        },
        "PANEL" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "PANEL"
                }
            }
        },
        BUTTON : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "BUTTON"
                }
            }
        },
        "DROPDOWN" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "DROPDOWN|LIST"
                }
            }
        },
        BINARY_EXPRESSION : {
            rule : 'EXPRESSION OPERATOR EXPRESSION',
            component : 'expeditor.component.BinaryExpressionComponent',
            view : 'expeditor.view.BinaryExpressionView',
            choiceName : 'Mathematical Expression',
            extras : {
                component : {
                    dataType : 'STRING|NUMBER'
                }
            }
        },
        OPERATOR : {
            component : 'expeditor.component.OperatorSelectorComponent',
            view : 'expeditor.view.ChoiceView',
            extras : {
                component : {
                    selectedItem : false,
                    childType : 'Operator'
                },
                view : {
                    inline : true,
                    placeholder : 'Select Operator'
                }
            }
        },
        PLUS : {
            choiceName : "plus",
            extras : {
                operatorType : [
                    ['NUMBER', 'NUMBER', 'NUMBER'],
                    ['STRING', 'STRING|NUMBER', 'STRING'],
                    ['STRING', 'STRING', 'STRING|NUMBER']
                ],
                view : {
                    cssClass : 'coral-Icon coral-Icon--add coral-Icon--sizeXS',
                    placeholder : 'plus'
                }
            }
        },
        MINUS : {
            choiceName : "minus",
            extras : {
                operatorType : [
                    ['NUMBER', 'NUMBER|STRING', 'NUMBER|STRING']
                ],
                view : {
                    cssClass : 'coral-Icon coral-Icon--minus coral-Icon--sizeXS',
                    placeholder : 'minus'
                }
            }
        },
        MULTIPLY : {
            choiceName : "multiplied by",
            extras : {
                operatorType : [
                    ['NUMBER', 'NUMBER|STRING', 'NUMBER|STRING']
                ],
                view : {
                    cssClass : 'coral-Icon coral-Icon--close coral-Icon--sizeXS',
                    placeholder : 'multiplied by'
                }
            }
        },
        DIVIDE : {
            choiceName : "divided by",
            extras : {
                operatorType : [
                    ['NUMBER', 'NUMBER|STRING', 'NUMBER|STRING']
                ],
                view : {
                    cssClass : 'coral-Icon coral-Icon--divide coral-Icon--sizeXS',
                    placeholder : 'divided by'
                }
            }
        },
        LESS_THAN : {
            choiceName : "is less than",
            extras : {
                operatorType : [
                    ['BOOLEAN', 'NUMBER', 'NUMBER']
                ],
                view : {
                    
                    placeholder : 'is less than'
                }
            }
        },
        GREATER_THAN : {
            choiceName : "is greater than",
            extras : {
                operatorType : [
                    ['BOOLEAN', 'NUMBER', 'NUMBER']
                ],
                view : {
                    
                    placeholder : 'is greater than'
                }
            }
        },
        EQUALS_TO : {
            choiceName : 'is equal to',
            extras : {
                operatorType : [
                    ['BOOLEAN', 'NUMBER', 'NUMBER'],
                    ['BOOLEAN', 'STRING', 'STRING'],
                    ['BOOLEAN', 'DATE', 'DATE']
                ],
                view : {
                    placeholder : 'is equal to'
                }
            }
        },
        NOT_EQUALS_TO : {
            choiceName : 'is not equal to',
            extras : {
                operatorType : [
                    ['BOOLEAN', 'NUMBER', 'NUMBER'],
                    ['BOOLEAN', 'STRING', 'STRING'],
                    ['BOOLEAN', 'DATE', 'DATE']
                ],
                view : {
                    placeholder : 'is not equal to'
                }
            }
        },
        CONTAINS : {
            choiceName : 'contains',
            extras : {
                operatorType : [
                    ['BOOLEAN', 'STRING', 'STRING']
                ],
                view : {
                    placeholder : 'contains'
                }
            }
        },
        STARTS_WITH : {
            choiceName : 'starts with',
            extras : {
                operatorType : [
                    ['BOOLEAN', 'STRING', 'STRING']
                ],
                view : {
                    placeholder : 'starts with'
                }
            }
        },
        ENDS_WITH : {
            choiceName : 'ends with',
            extras : {
                operatorType : [
                    ['BOOLEAN', 'STRING', 'STRING']
                ],
                view : {
                    placeholder : 'ends with'
                }
            }
        },
        AND : {
            choiceName : 'And',
            extras : {
                view : {
                    type : 'Text',
                    cssClass : 'coral-Heading coral-Heading--6',
                    placeholder : 'AND'
                },
                operatorType : [
                    ['BOOLEAN', 'BOOLEAN', 'BOOLEAN']
                ]
            }
        },
        OR : {
            choiceName : 'Or',
            extras : {
                view : {
                    type : 'Text',
                    cssClass : 'coral-Heading coral-Heading--6',
                    placeholder : 'OR'
                },
                operatorType : [
                    ['BOOLEAN', 'BOOLEAN', 'BOOLEAN']
                ]
            }
        },
        IS_TRUE : {
            choiceName : 'is true',
            extras : {
               view : {
                   type : 'Text',
                   cssClass : 'coral-Heading coral-Heading--6',
                   placeholder : 'Is True'
               },
               operatorType : [
                   ['BOOLEAN','BOOLEAN']
               ]
           }

        },
        IS_FALSE : {
            choiceName : 'is false',
            extras : {
               view : {
                   type : 'Text',
                   cssClass : 'coral-Heading coral-Heading--6',
                   placeholder : 'Is False'
               },
               operatorType : [
                   ['BOOLEAN','BOOLEAN']
               ]
           }

        },
        IS_EMPTY : {
            choiceName : 'is empty',
            extras : {
               view : {
                   type : 'Text',
                   cssClass : 'coral-Heading coral-Heading--6',
                   placeholder : 'Is Empty'
               },
               operatorType : [
                   ['BOOLEAN','STRING'],
                   ['BOOLEAN','NUMBER'],
                   ['BOOLEAN', 'DATE']
               ]
           }

        },
        IS_NOT_EMPTY : {
            choiceName : 'is not empty',
            extras : {
               view : {
                   type : 'Text',
                   cssClass : 'coral-Heading coral-Heading--6',
                   placeholder : 'Is Not Empty'
               },
               operatorType : [
                   ['BOOLEAN','STRING'],
                   ['BOOLEAN','NUMBER'],
                   ['BOOLEAN', 'DATE']
               ]
           }

        },

        "IS_BEFORE" : {
            choiceName : "is before",
            extras : {
                operatorType : [
                    ['BOOLEAN', 'DATE', 'DATE']
                ],
                view : {
                    placeholder : 'is before'
                }
            }
        },

        "IS_AFTER" : {
            choiceName : "is after",
            extras : {
                operatorType : [
                    ['BOOLEAN', 'DATE', 'DATE']
                ],
                view : {
                    placeholder : 'is after'
                }
            }
        },

        HAS_SELECTED : {
            choiceName : 'has selected',
            extras : {
               view : {
                   type : 'Text',
                   cssClass : 'coral-Heading coral-Heading--6',
                   placeholder : 'Has Selected'
               },
               operatorType : [
                   ['BOOLEAN','RADIO BUTTON','STRING'],
                   ['BOOLEAN','CHECK BOX','STRING'],
                   ['BOOLEAN','DROP DOWN','STRING']
               ]
           }

        },
        ROOT : "STATEMENTS"
    };
}());
(function () {
    var DefaultRulesConfig = expeditor.rb.DefaultRulesConfig;

    var operatorList = ["PLUS", "MINUS", "MULTIPLY", "DIVIDE", "LESS_THAN", "GREATER_THAN", "EQUALS_TO", "NOT_EQUALS_TO",
        "CONTAINS", "STARTS_WITH", "ENDS_WITH", "AND", "OR","HAS_SELECTED","IS_NOT_EMPTY","IS_EMPTY","IS_TRUE","IS_FALSE","IS_BEFORE","IS_AFTER"];

    var RuleBuilderConfigurator = expeditor.EventTarget.extend({
        init : function (options) {
            this.config = {};
            this.ruleReference = {};
            this.userGrammar = {};
            this.enableRule('ROOT');
        },

        getDefaultOperators : function () {
            return operatorList.slice(0);
        },

        addChangeListener : function (ruleName, changeListener) {
            var config = this.config[ruleName];
            if (config) {
                var extras = config.extras = config.extras || {};
                extras.component = extras.component || {};
                extras.component.changelistener = changeListener;
                if (typeof config === 'object') {
                    config.extras = extras;
                } else if (typeof config === 'string') {
                    this.config[ruleName] = {rule : config, extras : extras};
                }
            }
            return this;
        },

        addGrammar : function (grammar) {
            var key;
            this.userGrammar = $.extend(this.userGrammar, grammar);
            for (key in grammar) {
                if (grammar.hasOwnProperty(key)) {
                    if (this.config.hasOwnProperty(key)) {
                        this.config[key] = null;
                    }
                    this.enableRule(key);
                }
            }
            return this;
        },

        enableIfStatement : function () {
            this.enableRule("IF_STATEMENT");
            return this;
        },

        addStatement : function (statementName, enableForIfBlock) {
            this.enableRule(statementName);
            this.addChoice('STATEMENT', statementName);
            if (enableForIfBlock === true) {
                this.addChoice("BLOCK_STATEMENT", statementName);
            }
            return this;
        },

        enableOperator : function (operatorName) {
            if (this.config.hasOwnProperty("OPERATOR")) {
                this.enableRule(operatorName);
                this.addChoice("OPERATOR", operatorName);
            }
            return this;
        },

        
        enableRule : function (ruleName) {
            if (ruleName instanceof Array) {
                ruleName.forEach(function (rule) {
                    this.enableRule(rule);
                }, this);
                return this;
            }
            if (this.config[ruleName] != null) {
                return this;
            }
            var definedRule, ruleStr = "";
            if (this.userGrammar.hasOwnProperty(ruleName)) {
                definedRule = this.userGrammar[ruleName];
            } else if (DefaultRulesConfig.hasOwnProperty(ruleName)) {
                definedRule = DefaultRulesConfig[ruleName];
            } else {
                return this;
            }
            if (typeof definedRule === "object") {
                this.config[ruleName] = $.extend({}, definedRule);
                ruleStr = definedRule.rule;
            } else {
                this.config[ruleName] = definedRule;
                ruleStr = definedRule;
            }
            expeditor.Utils.getChildRules(ruleStr).forEach(function (childRuleName) {
                this.ruleReference[childRuleName] = this.ruleReference[childRuleName] || [];
                this.ruleReference[childRuleName].push(ruleName);
                this.enableRule(childRuleName);
            }, this);
            return this;
        },

        addChoice : function (parentRuleName, childRuleName) {
            if (parentRuleName == null || childRuleName == null) {
                return this;
            }
            if (this.config.hasOwnProperty(parentRuleName)) {
                var parentRule = this.config[parentRuleName];
                var isParentRuleObj = typeof parentRule === "object";
                parentRule = isParentRuleObj ? parentRule.rule || "" : parentRule;
                var existingRules = parentRule.split("|").map(function (r) {
                    return r.trim();
                });
                if (!(childRuleName instanceof Array)) {
                    childRuleName = [childRuleName];
                }
                childRuleName = childRuleName.filter(function (rule) {
                    return rule.length !== 0 && existingRules.indexOf(rule) === -1;
                });
                var childRule = childRuleName.join(" | ").trim();
                if (childRule.length == 0) {
                    return this;
                }
                parentRule += " | " + childRule;
                if (isParentRuleObj) {
                    this.config[parentRuleName].rule = parentRule;
                } else {
                    this.config[parentRuleName] = parentRule;
                }
                childRuleName.forEach(function (childRule) {
                    if (this.config.hasOwnProperty(childRule)) {
                        this.ruleReference[childRule] = this.ruleReference[childRule] || [];
                        this.ruleReference[childRule].push(parentRuleName);
                    }
                }, this);
            } else {
                if (console) {
                    console.log("Adding a choice " + childRuleName + " to an undefined rule " + parentRuleName);
                }
            }
            return this;
        },

        removeRule : function (ruleName) {
            return this;
        },

        getConfig : function () {
            var config = this.config;
            this.ruleReference = null;
            this.config = null;
            return config;
        }
    });

    expeditor.rb.RuleBuilderConfigurator = RuleBuilderConfigurator;
}());
