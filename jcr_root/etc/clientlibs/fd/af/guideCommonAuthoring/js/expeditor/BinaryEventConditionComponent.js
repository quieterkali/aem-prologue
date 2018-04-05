/*
 * **********************************************************************
 *  ADOBE CONFIDENTIAL
 *  __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 *  **********************************************************************
 */
(function (guidelib) {
    var RuntimeUtil = guidelib.RuntimeUtil;
    var BinaryEventConditionComponent = guidelib.author.BinaryEventConditionComponent = expeditor.component.BinaryExpressionComponent.extend({
        onChildChange : function () {
            this._super.apply(this, arguments);
            this._filterOperatorBasedOnEvent();
        },

        /* Removes 'OR' option from OPERATOR of BINARY_EVENT_CONDITION, if either of the EVENT_CONDITION is event based.*/
        _filterOperatorBasedOnEvent : function () {
            var condition1Event = RuntimeUtil.getEventFromCondition(this.model.items[0]);
            var condition2Event = RuntimeUtil.getEventFromCondition(this.model.items[2]);
            if (condition1Event || condition2Event) {
                var operatorsList = ['OR'];
                var operatorComponent = this.childComponents[1];
                if (operatorComponent) {
                    operatorComponent.removeOperators(operatorsList);
                }
            }
        }
    });
})(guidelib);
