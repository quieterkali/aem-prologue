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
    var EventAndOperatorSelectorComponent = guidelib.author.EventAndOperatorSelectorComponent = expeditor.component.OperatorSelectorComponent.extend({
        filter : function (types) {
            this._super.apply(this, arguments);
            this._filterBasedOnEventType();
        },
        _filterBasedOnEventType : function () {
            var enclosingNodeName;
            if (this.parent && this.parent.parent  && this.parent.parent.parent) {
                enclosingNodeName  = this.parent.parent.parent.nodeName;
            }
            if (enclosingNodeName) {
                var isExtended = enclosingNodeName != 'EVENT_SCRIPTS';
                var newOperatorNames = this.operatorNames.filter(function (op) {
                    return !(isExtended && op in RuntimeUtil.eventToEventName);
                });
                if (newOperatorNames.length != this.operatorNames.length) {
                    var self = this;
                    var newOperators = [];
                    var newOpts = newOperatorNames.map(function (child) {
                        var config = self.ctx.getConfig(child);
                        var operatorTypes = config.extras.operatorType;
                        newOperators = newOperators.concat(operatorTypes);
                        var choice = config.choiceName || child;
                        return {
                            value : child,
                            label : choice
                        };
                    });
                    this.operators = newOperators;
                    this.operatorNames = newOperatorNames;
                    this.view.setOptions(newOpts);
                }
            }
        },
        render : function () {
            this._filterBasedOnEventType();
            return this._super.apply(this, arguments);
        }
    });
})(guidelib);
