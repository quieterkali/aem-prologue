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
    var RuntimeUtil = guidelib.RuntimeUtil;
    var EventConditionBinaryExpressionComponent = guidelib.author.EventConditionBinaryExpressionComponent = expeditor.component.BinaryExpressionComponent.extend({
        init : function () {
                this._super.apply(this, arguments);
                this._updateRHSVisibility();
            },
        onChildChange : function (e) {
                var currentOperandNumber = e.target.index;
                if (currentOperandNumber !== 2 || this._updateRHSVisibility()) {
                    this._super.apply(this, arguments);
                }
            },
        isEventSelected : function () {
                var operatorComponent = this.childComponents[1];
                if (operatorComponent && operatorComponent.getModel() && operatorComponent.getModel().choiceModel) {
                    var model = operatorComponent.getModel().choiceModel;
                    return (!!guidelib.RuntimeUtil.eventToEventName[model.nodeName]);
                }
                return false;
            },
        isNoneSelected : function () {
                var operatorComponent = this.childComponents[1];
                if (operatorComponent && operatorComponent.getModel() && !operatorComponent.getModel().choiceModel) {
                    return true;
                }
                return false;
            },
        _updateRHSVisibility : function () {
                if (this.childComponents[2] && typeof(this.childComponents[2].hide) == "function") {
                    if (this.isNoneSelected()) {
                        this.childComponents[2].hide(true);
                        return false;
                    }
                }
                return true;
            },

        render : function () {
                this._updateRHSVisibility();
                return this._super.apply(this, arguments);
            },

        hasNonEventOperators : function () {
                var operatorNames = this.childComponents[1].operatorNames;
                for (op in operatorNames) {
                    var operator = operatorNames[op];
                    if (!(RuntimeUtil.eventToEventName.hasOwnProperty(operator))) {
                        return true;
                    }
                }
                return false;
            }

    });
})(guidelib);
