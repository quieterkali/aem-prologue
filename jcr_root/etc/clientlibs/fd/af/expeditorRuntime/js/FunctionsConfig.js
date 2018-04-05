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

    /* Change event listener for Contextual filtering of child fields based on the Panel/tableRow selected or vice-versa */
    guidelib.author.parameterChangeListener = function (parameters, index) {
        if (parameters && parameters.length > 1) {
            if (index == 0) {
                /* Filter second argument form objects list to show only Child fields */
                var panelId = expeditor.Utils.getOrElse(parameters, "0.childComponent.model.value.id", null);
                var fieldComponent = parameters[1].getChildOfType("COMPONENT");
                if (fieldComponent && typeof fieldComponent.setFilter === "function") {
                    var filter = function (variable) {
                        return !panelId || variable.parent == panelId;
                    };
                    fieldComponent.setFilter.apply(fieldComponent, [filter]);
                }
            } else {
                /* Filter first argument form objects list to show only Parent panel/tableRow */
                var fieldVal = expeditor.Utils.getOrElse(parameters, "1.childComponent.model.value", null);
                var panelComponent = parameters[0].getChildOfType("COMPONENT");
                if (panelComponent && typeof panelComponent.setFilter === "function") {
                    var filter = function (variable) {
                        return !fieldVal || variable.id == fieldVal.parent;
                    };
                    panelComponent.setFilter.apply(panelComponent, [filter]);
                }
            }
        }
    };
    guidelib.author.FunctionsConfig = {
        json : [
            {
                id : "af.sum",
                type : "NUMBER",
                displayName : Granite.I18n.get("Sum"),
                args : [
                    {
                        name : 'panel',
                        type : 'PANEL|TABLE ROW',
                        description : Granite.I18n.get('Select a repeatable Panel or Table Row'),
                        parameterChangeListener : "guidelib.author.parameterChangeListener"
                    },
                    {
                        name : 'field',
                        type : 'NUMBER FIELD',
                        description : Granite.I18n.get('Select a Numeric Field inside Panel'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    }
                ],
                impl : "$0($1.instanceManager.instances, $2.name)",
                description : Granite.I18n.get("Returns the sum of values in the numeric fields of a repeatable panel")
            },
            {
                id : "af.min",
                type : "NUMBER",
                displayName : Granite.I18n.get("Min"),
                args : [
                    {
                        name : 'panel',
                        type : 'PANEL|TABLE ROW',
                        description : Granite.I18n.get('Select a repeatable panel or table row'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    },
                    {
                        name : 'field',
                        type : 'NUMBER FIELD',
                        description : Granite.I18n.get('Select a Numeric Field inside Panel'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    }
                ],
                impl : "$0($1.instanceManager.instances, $2.name).value",
                description : Granite.I18n.get("Returns the minimum value in the numeric fields of a repeatable panel")
            },
            {
                id : "af.max",
                type : "NUMBER",
                displayName : Granite.I18n.get("Max"),
                args : [
                    {
                        name : 'panel',
                        type : 'PANEL|TABLE ROW',
                        description : Granite.I18n.get('Select a repeatable Panel or Table Row'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    },
                    {
                        name : 'field',
                        type : 'NUMBER FIELD',
                        description : Granite.I18n.get('Select a Numeric Field inside Panel'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    }
                ],
                impl : "$0($1.instanceManager.instances, $2.name).value",
                description : Granite.I18n.get("Returns the maximum value in the numeric fields of a repeatable Panel")
            },
            {
                id : "af.avg",
                type : "NUMBER",
                displayName : Granite.I18n.get("Average"),
                args : [
                    {
                        name : 'panel',
                        type : 'PANEL|TABLE ROW',
                        description : Granite.I18n.get('Select a repeatable Panel or Table Row'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    },
                    {
                        name : 'field',
                        type : 'NUMBER FIELD',
                        description : Granite.I18n.get('Select a Numeric Field inside Panel'),
                        onParameterChange : "guidelib.author.parameterChangeListener"
                    }
                ],
                impl : "$0($1.instanceManager.instances, $2.name)",
                description : Granite.I18n.get("Returns the average value or the arithmetic mean of values in the numeric fields of a repeatable panel")
            },
            {
                id : "af.count",
                type : "NUMBER",
                displayName : Granite.I18n.get("Count"),
                args : [
                    {
                        name : 'panel',
                        type : 'PANEL|TABLE ROW',
                        description : Granite.I18n.get('Select a repeatable Panel or Table Row')
                    }
                ],
                impl : "($1.instanceManager.instances.length)",
                description : Granite.I18n.get("Returns the number of instances of a repeatable panel")
            },
            {
                id : 'guideBridge.validate',
                type : 'BOOLEAN',
                displayName : Granite.I18n.get('Validate Form'),
                args : [],
                impl : '$0()',
                description : Granite.I18n.get('Validates the Form')

            },
            {
                id : 'getCurrentDate',
                type : 'DATE',
                displayName : Granite.I18n.get('Get Current Date'),
                args : [],
                impl : '(new Date().toISOString().slice(0,10))',
                description : Granite.I18n.get('Returns current date')

            },
            {
                id : 'convertToString',
                type : 'STRING',
                displayName : Granite.I18n.get('Convert To String'),
                args : [
                    {
                        name : 'field',
                        type : 'NUMBER|BOOLEAN',
                        description : Granite.I18n.get("Expression to be converted")
                    }
                ],
                impl : "(($1).toString(10))",
                description : Granite.I18n.get("Converts the passed parameter to String")
            },
            {
                id : 'convertToNumber',
                type : 'NUMBER',
                displayName : Granite.I18n.get('Convert To Number'),
                args : [
                    {
                        name : 'field',
                        type : 'STRING|BOOLEAN',
                        description : Granite.I18n.get("Expression to be converted")
                    }
                ],
                impl : "(Number($1,10))",
                description : Granite.I18n.get("Converts the passed parameter to Number")
            }
        ],
        searchKey : "displayName",
        displayProps : ["displayName", "description"]
    };

})(guidelib);
