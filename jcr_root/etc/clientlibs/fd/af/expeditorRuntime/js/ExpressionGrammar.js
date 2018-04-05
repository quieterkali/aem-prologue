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

    guidelib.author.changelisteners = {
        Expression : {
            onVALUE_FIELDChange : function (variable) {
                var model = variable.getModel().getValue(),
                    varType = variable.getTypes();
                if (typeof model === "object" && model != null) {
                    varType = model.type;
                }
                var primitiveType = expeditor.Utils.filterPrimitiveTypes(varType);
                var expression = this.getChildOfType("EXPRESSION");
                expression.setTypes(primitiveType);
                var operator = this.getChildOfType("OPERATOR");
                if (operator) {
                    operator.filter(['BOOLEAN', primitiveType]);
                }
            }
        }
    };

    guidelib.author.Grammar = {
        "EVENT_SCRIPTS" : {
            "rule" : "EVENT_CONDITION Then BLOCK_STATEMENTS",
            "choiceName" : "When",
            "extras" : {
                "view" : {
                    "breaks" : [0, 1,2]
                }
            }
        },
        EVENT_CONDITION : {
            rule : 'EVENT_AND_COMPARISON | BINARY_EVENT_CONDITION',
            component : 'guidelib.author.EventConditionExpressionComponent',
            view : 'expeditor.view.ConditionView',
            model : 'expeditor.model.ConditionModel',
            extras : {
                component : {
                    dataType : 'BOOLEAN',
                    extension : 'BINARY_EVENT_CONDITION'
                },
                view : {
                    inline : true,
                    placeholder : 'Select a Condition',
                    extension : 'BINARY_EVENT_CONDITION',
                    deleteOption : true
                }
            }

        },
        BINARY_EVENT_CONDITION : {
            rule : 'EVENT_CONDITION OPERATOR EVENT_CONDITION',
            component : "guidelib.author.BinaryEventConditionComponent",
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
        PRIMITIVE_EXPRESSION : {
            rule : 'STRING_LITERAL | NUMERIC_LITERAL | DATE_LITERAL',
            component : 'guidelib.author.EventConditionExpressionComponent',
            extras : {
                component : {
                    dataType : "STRING|NUMBER|DATE",
                    selectedItem : false
                },
                view : {
                    inline : true
                }
            }
        },
        "EVENT_AND_COMPARISON" : {
            "rule" : 'COMPONENT EVENT_AND_COMPARISON_OPERATOR PRIMITIVE_EXPRESSION',
            "component" : "guidelib.author.EventConditionBinaryExpressionComponent",
            extras : {
               "component" : {
                   "dataType" : "BOOLEAN",
                   "readOnly" : 0,
                   "enableMetaPropSync" : true
               },
               "view" : {
                   inline : true
               }
           }
        },
        CONDITIONORALWAYS : {
            rule : 'COMPARISON_EXPRESSION | BOOLEAN_BINARY_EXPRESSION',
            choiceName : 'When',
            component : 'guidelib.author.ConditionOrAlwaysComponent',
            view : 'expeditor.view.ConditionView',
            extras : {
                component : {
                    dataType : 'BOOLEAN',
                    extension : "BOOLEAN_BINARY_EXPRESSION",
                    selectedItem : false
                },
                view : {
                    inline : true,
                    placeholder : 'Select a Condition',
                    extension : "BOOLEAN_BINARY_EXPRESSION",
                    selectedItem : false,
                    deleteOption : true
                }
            }
        },

        "CALC_EXPRESSION" : {
            "rule" : "VALUE_FIELD to EXPRESSION When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Set Value of",
            "extras" : {
                "view" : {
                    "breaks" : [3,4]
                },
                "component" : {
                    "readOnly" : 0,
                    "changelistener" : "guidelib.author.changelisteners.Expression",
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [3],
                    "childConfig" : {
                        "2" : {
                            extras : {
                                component : {
                                    renderCondition : {
                                        "WSDL_VALUE_EXPRESSION" : true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "CLEAR_EXPRESSION" : {
            "rule" : "VALUE_FIELD When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Clear Value of",
            "extras" : {
                "view" : {
                    "breaks" : [1,2,3]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1,3,4]
                }
            }
        },
        "VALUE_FIELD" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "STRING|NUMBER|DATE"
                }
            }
        },
        "AFCOMPONENT" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "AFCOMPONENT"
                }
            }
        },
        "NAVIGABLE_PANEL" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "NAVIGABLE_PANEL"
                }
            }
        },
        "TOOLBAR_BUTTON" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "TOOLBAR_BUTTON"
                }
            }
        },
        "REPEATABLE_PANEL" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "REPEATABLE_PANEL"
                }
            }
        },
        "REPEATABLE_COMPONENT" : {
            "rule" : "VARIABLE",
            "extras" : {
                "component" : {
                    "dataType" : "PANEL|TABLE ROW"
                }
            }
        },
        "VISIBLE_EXPRESSION" : {
            "rule" : "AFCOMPONENT When CONDITIONORALWAYS Else DONOTHING_OR_SHOW",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Hide",
            "extras" : {
                "view" : {
                    "breaks" : [1,2,3]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1,3,4]
                }
            }
        },
        "DONOTHING_OR_SHOW" : {
            "rule" : "Show | No action",
            "extras" : {
                "view" : {
                    "inline" : true
                }
            }
        },
        "DONOTHING_OR_HIDE" : {
            "rule" : "Hide | No action",
            "extras" : {
                "view" : {
                    "inline" : true
                }
            }
        },
        "DONOTHING_OR_ENABLE" : {
            "rule" : "Enable | No action",
            "extras" : {
                "view" : {
                    "inline" : true
                }
            }
        },
        "DONOTHING_OR_DISABLE" : {
            "rule" : "Disable | No action",
            "extras" : {
                "view" : {
                    "inline" : true
                }
            }
        },
        "SHOW_EXPRESSION" : {
            "rule" : "AFCOMPONENT When CONDITIONORALWAYS Else DONOTHING_OR_HIDE",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Show",
            "extras" : {
                "view" : {
                    "breaks" : [1,2,3]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1,3,4]
                }
            }
        },
        "ACCESS_EXPRESSION" : {
            "rule" : "AFCOMPONENT When CONDITIONORALWAYS Else DONOTHING_OR_DISABLE",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Enable",
            "extras" : {
                "view" : {
                    "breaks" : [1,2,3]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1,3,4],
                    "childConfig" : {
                        "0" : {
                            extras : {
                                component : {
                                    dataType : 'FIELD|FILE ATTACHMENT|PASSWORD FIELD|TERMS AND CONDITIONS|BUTTON|' +
                                        'SCRIBBLE FIELD'
                                }
                            }
                        }
                    }
                }
            }
        },
        "DISABLE_EXPRESSION" : {
            "rule" : "AFCOMPONENT When CONDITIONORALWAYS Else DONOTHING_OR_ENABLE",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Disable",
            "extras" : {
                "view" : {
                    "breaks" : [1,2,3]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1,3,4],
                    "childConfig" : {
                        "0" : {
                            extras : {
                                component : {
                                    dataType : 'FIELD|FILE ATTACHMENT|PASSWORD FIELD|TERMS AND CONDITIONS|BUTTON|' +
                                        'SCRIBBLE FIELD'
                                }
                            }
                        }
                    }
                }
            }
        },
        "VALIDATE_EXPRESSION" : {
            "rule" : "AFCOMPONENT Using Expression CONDITION",
            "choiceName" : "Validate",
            "extras" : {
                "view" : {
                    "breaks" : [1,3]
                },
                "component" : {
                    "readOnly" : 0
                }
            }
        },
        "Using" : {
            extras : {
                component : {
                    validate : false
                },
                view : {
                    placeholder : 'Using Expression'
                }
            }
        },
        "Expression" : {
            extras : {
                component : {
                    validate : false
                },
                view : {
                    placeholder : ''
                }
            }
        },
        "COMPLETION_EXPRESSION" : {
            "rule" : "NAVIGABLE_PANEL When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Set Complete",
            "extras" : {
                "view" : {
                    "breaks" : [1,2]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [1]
                }
            }
        },
        "SUMMARY_EXPRESSION" : {
            "rule" : "REPEATABLE_PANEL to EXPRESSION When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Set Summary of",
            "extras" : {
                "view" : {
                    "breaks" : [3,4]
                },
                "component" : {
                    "readOnly" : 0,
                    "changelistener" : "guidelib.author.changelisteners.Expression",
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [3],
                    "childConfig" : {
                        "2" : {
                            "extras" : {
                                "component" : {
                                    "dataType" : "STRING|NUMBER"
                                }
                            }
                        }
                    }
                }
            }
        },

        "EVENT_AND_COMPARISON_OPERATOR" : {
            "rule" : "EQUALS_TO | NOT_EQUALS_TO | LESS_THAN | GREATER_THAN | STARTS_WITH | ENDS_WITH | CONTAINS | IS_EMPTY | IS_NOT_EMPTY | HAS_SELECTED | IS_BEFORE | IS_AFTER",
            "component" : 'guidelib.author.EventAndOperatorSelectorComponent',
            "extras" : {
                "component" : {
                    selectedItem : false
                },
                "view" : {
                    "inline" : true,
                    placeholder : 'Select State'
                }
            }
        },
        "WSDL_OPTIONS_EXPRESSION" : {
            component : 'guidelib.author.WSDLOptionsComponent',
            model : 'expeditor.model.TerminalModel',
            "view" : "guidelib.author.WSDLOptionsView",
            "choiceName" : "Service Output",
            extras : {
                component : {
                    outputValues : {
                        "displayValue" : {
                            choiceName : "Display Value",
                            defaultValue : {
                                variable : "saveValue",
                                placeholder : "Same as Save Value"
                            }
                        },
                        "saveValue" : {
                            choiceName : "Save Value"
                        }
                    },
                    validateValues : ["saveValue"]
                }
            }
        },
        "OPTIONS_LIST" : {
            "rule" : "FUNCTION_CALL | WSDL_OPTIONS_EXPRESSION",
            "component" : "expeditor.component.ExpressionComponent",
            "view" : "expeditor.view.ExpressionView",
            extras : {
                component : {
                    selectedItem : false,
                    dataType : 'OPTIONS'
                },
                view : {
                    placeholder : 'Select Option',
                    inline : true,
                    composite : ['FUNCTION_CALL','WSDL']
                }
            }
        },
        "OPTIONS_EXPRESSION" : {
            "rule" : "AFCOMPONENT to OPTIONS_LIST When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "Set Options of",
            "extras" : {
                "view" : {
                    "breaks" : [3,4]
                },
                "component" : {
                    "readOnly" : 0,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [3],
                    "childConfig" : {
                        "0" : {
                            extras : {
                                component : {
                                    dataType : 'DROP DOWN'
                                }
                            }
                        },
                        "2" : {
                            extras : {
                                component : {
                                    dataType : 'OPTIONS'
                                }
                            }
                        }
                    }
                }
            }
        },

        "TOOLBAR_BUTTON_OPTIONS" : {
            "rule" : "Hide|Show|Enable|Disable",
            "extras" : {
                "view" : {
                    "hideChild" : true
                }
            }
        },
        "NAVIGATION_EXPRESSION" : {
            "rule" : "TOOLBAR_BUTTON_OPTIONS TOOLBAR_BUTTON When CONDITIONORALWAYS",
            "component" : "guidelib.author.ConditionOrElseComponent",
            "choiceName" : "On Navigation",
            "extras" : {
                "view" : {
                    "breaks" : [2,3]
                },
                "component" : {
                    "readOnly" : 1,
                    "conditionExpression" : "CONDITIONORALWAYS",
                    "showIfCondition" : [2]
                }
            }
        },
        "is clicked" : {
            "choiceName" : "is clicked",
            extras : {
                operatorType : [
                    ['BOOLEAN', 'BUTTON']
                ]
            }
        },
        "is initialized" : {
            "choiceName" : "is initialized",
            extras : {
               operatorType : [
                    ['BOOLEAN', 'ANY']
               ]
           }
        },
        "is changed" : {
            "choiceName" : "is changed",
            extras : {
                operatorType : [
                    ['BOOLEAN','FIELD']
                ]
            }
        },

        "STATEMENT" : {
            "rule" : "EVENT_SCRIPTS",
            "component" : "expeditor.component.ChoiceComponent",
            "view" : "expeditor.view.ChoiceView",
            "model" : "expeditor.model.ChoiceModel"
        },
        "HIDE_STATEMENT" : {
            "rule" : "AFCOMPONENT",
            "choiceName" : "Hide"
        },
        "SHOW_STATEMENT" : {
            "rule" : "AFCOMPONENT",
            "choiceName" : "Show"
        },
        "ENABLE_STATEMENT" : {
            "rule" : "AFCOMPONENT",
            "choiceName" : "Enable",
            "extras" : {
                "component" : {
                    "childConfig" : {
                        "0" : {
                            extras : {
                                component : {
                                    dataType : 'FIELD|FILE ATTACHMENT|PASSWORD FIELD|TERMS AND CONDITIONS|BUTTON|' +
                                        'SCRIBBLE FIELD|PANEL'
                                }
                            }
                        }
                    }
                }
            }
        },
        "DISABLE_STATEMENT" : {
            "rule" : "AFCOMPONENT",
            "choiceName" : "Disable",
            "extras" : {
                "component" : {
                    "childConfig" : {
                        "0" : {
                            extras : {
                                component : {
                                    dataType : 'FIELD|FILE ATTACHMENT|PASSWORD FIELD|TERMS AND CONDITIONS|BUTTON|' +
                                        'SCRIBBLE FIELD|PANEL'
                                }
                            }
                        }
                    }
                }
            }
        },

        "CLEAR_VALUE_STATEMENT" : {
            "rule" : "VALUE_FIELD",
            "choiceName" : "Clear Value of"
        },

        EXTENDED_COMPARISON_EXPRESSION : {
            rule : "EXPRESSION OPERATOR EXPRESSION",
            component : 'expeditor.component.BinaryExpressionComponent',
            view : 'expeditor.view.MemberExpressionView',
            extras : {
                component : {
                    dataType : 'BOOLEAN',
                    operandTypes : ['STRING|NUMBER', 'STRING|NUMBER']
                }
            },
            choiceName : 'Condition'
        },
        EXTENDED_EXPRESSION : {
            rule : 'COMPONENT | STRING_LITERAL | BOOLEAN_LITERAL | EXTENDED_COMPARISON_EXPRESSION | NUMERIC_LITERAL | BINARY_EXPRESSION | FUNCTION_CALL | MEMBER_EXPRESSION',
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
                    composite : ['COMPONENT','BOOLEAN_LITERAL','STRING_LITERAL','NUMERIC_LITERAL', 'FUNCTION_CALL']
                }
            }
        },
        "SET_PROPERTY" : {
            rule : 'MEMBER_EXPRESSION to EXTENDED_EXPRESSION',
            choiceName : 'Set Property',
            component : 'expeditor.component.SetValueComponent',
            extras : {
                component : {
                    childConfig : {
                        "0" : {
                            extras : {
                                component : {
                                    propertyFilter : {
                                        attrs : {
                                            "readOnly" : "false"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        "WSDL_VALUE_EXPRESSION" : {
            component : 'guidelib.author.WSDLOptionsComponent',
            model : 'expeditor.model.TerminalModel',
            "view" : "guidelib.author.WSDLOptionsView",
            "choiceName" : "Web Service Output",
            extras : {
                component : {
                    outputValues : {
                        "value" : {
                            choiceName : "Value"
                        }
                    },
                    validateValues : ["value"],
                    renderCondition : false
                }
            }
        },
        "BLOCK_STATEMENT" : {
            "rule" : "HIDE_STATEMENT | SHOW_STATEMENT | ENABLE_STATEMENT | DISABLE_STATEMENT | " +
                "SET_VALUE_STATEMENT | WSDL_STATEMENT | SET_PROPERTY | CLEAR_VALUE_STATEMENT | SET_FOCUS | " +
                "SAVE_FORM | SUBMIT_FORM | RESET_FORM | VALIDATE_FORM | ADD_INSTANCE | REMOVE_INSTANCE | FUNCTION_CALL ",
            "extras" : {
                "component" : {
                    "selectedItem" : false
                },
                "view" : {
                    "bindShowDefault" : false,
                    "defaultPlaceholderInline" : true,
                    "hideOptions" : true,
                    "placeholder" : 'Select Action'
                }
            }
        },
        "SET_FOCUS" : {
            rule : "to AFCOMPONENT",
            choiceName : "Set Focus"
        },
        "SAVE_FORM" : {
            rule : "",
            choiceName : "Save Form"
        },
        "SUBMIT_FORM" : {
            rule : "",
            choiceName : "Submit Form"
        },
        "RESET_FORM" : {
            rule : "",
            choiceName : "Reset Form"
        },
        "VALIDATE_FORM" : {
            rule : "",
            choiceName : "Validate Form"
        },
        "ADD_INSTANCE" : {
            rule : "of REPEATABLE_COMPONENT",
            choiceName : "Add Instance"
        },
        "REMOVE_INSTANCE" : {
            rule : "of REPEATABLE_COMPONENT",
            choiceName : "Remove Instance"
        },
        "WSDL_STATEMENT" : {
            component : 'expeditor.component.WSDLComponent',
            model : 'expeditor.model.TerminalModel',
            view : 'expeditor.view.WSDLView',
            "choiceName" : "Invoke Service"
        },
        "ROOT" : {
            rule : "STATEMENT",
            component : 'expeditor.component.RootComponent',
            model : 'guidelib.author.AFRootModel'
        }
    };
}());
