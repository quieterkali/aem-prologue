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
    var ConditionOrElseComponent = guidelib.author.ConditionOrElseComponent = expeditor.component.SequenceComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.conditionExpression = expeditor.Utils.getOrElse(config, "conditionExpression", null);
            var showIfCondition = expeditor.Utils.getOrElse(config, "showIfCondition", [-1]);
            if (!(showIfCondition instanceof Array)) {
                showIfCondition = [showIfCondition];
            }
            this.showIfCondition = showIfCondition.slice();
            expeditor.Utils.syncMetaProps(this);
        },

        _toggleStatements : function (hide) {
            var showIfCondition = this.showIfCondition.slice(),
                nextChild = showIfCondition.shift();
            while (nextChild) {
                var content = this.view.cellsContent[nextChild];
                if (content) {
                    if (hide) {
                        content.hide();
                    } else {
                        content.show();
                    }
                }
                nextChild = showIfCondition.shift();
            }
        },

        onChildChange : function (e) {
            this._super.apply(this, arguments);
            if (e.target && e.target.nodeName === this.conditionExpression) {
                var choiceModel = expeditor.Utils.getOrElse(e, "target.model.choiceModel", null);
                this._toggleStatements(choiceModel == null);
            }
            expeditor.Utils.syncMetaProps(this);
        },

        render : function () {
            var rendered = this._super.apply(this, arguments);
            var child = this.getChildOfType(this.conditionExpression),
                choiceModel = expeditor.Utils.getOrElse(child, "model.choiceModel", null);
            this._toggleStatements(choiceModel == null);
            return rendered;
        }
    });
})(guidelib);
