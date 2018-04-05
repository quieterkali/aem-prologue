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
    var EventConditionExpressionComponent = guidelib.author.EventConditionExpressionComponent = expeditor.component.ExpressionComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            if (this.view.isExtensionVisible) {
                this.view.isExtensionVisible = false;
            }
        },

        onChildChange : function () {
            if (this.nodeName == "EVENT_CONDITION") {
                var conditionEvent = RuntimeUtil.getEventFromCondition(this.model);
                var eventConditionChild = expeditor.Utils.getOrElse(this.model, "choiceModel.nodeName", null);
                if (eventConditionChild == "EVENT_AND_COMPARISON" && !(this.childComponents[0].hasNonEventOperators())) {
                    if (typeof this.view.disableExtension === "function") {
                        this.view.disableExtension();
                    }
                } else if (this.parent.nodeName !== this.extension) {
                    if (typeof this.view.enableExtension === "function") {
                        this.view.enableExtension();
                    }
                }
            }
            this._super.apply(this, arguments);
        },

        selectFirstItem : function () {
            if (this.nodeName != 'PRIMITIVE_EXPRESSION') {
                this._super.apply(this, arguments);
            }
        },

        render : function () {
            var rendered = this._super.apply(this, arguments);
            if (typeof this.view._toggleDeleteOption === 'function') {
                this.view._toggleDeleteOption(false);
            }
            return rendered;
        }

    });
})(guidelib);
