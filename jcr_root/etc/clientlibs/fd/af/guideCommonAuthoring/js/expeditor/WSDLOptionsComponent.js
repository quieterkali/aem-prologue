// jscs:disable requireDotNotation
/**
 * @package com.adobe.expeditor.component.WSDLComponent
 * @import com.adobe.expeditor.component.TerminalComponent
 */
(function ($, expeditor, guidelib) {
    var WSDLOptionsComponent = guidelib.author.WSDLOptionsComponent = expeditor.component.WSDLComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.outputVariables = expeditor.Utils.getOrElse(config, "outputValues", []);
            this.valuesToValidate = expeditor.Utils.getOrElse(config, "validateValues", []);
            this.view.setOutputVariables(this.outputVariables);
        },

        onViewValueSelectAction : function (e, data) {
            if (this.localModel.outputModel == null) {
                this.localModel.outputModel = {};
            }
            this.localModel.outputModel[data.variableName] = data.selectedVariable;
        },

        _renderOutputViewFromModel : function (outputModel) {
            // create data obj
            var dataObj = {};
            for (var k in outputModel) {
                if (outputModel.hasOwnProperty(k)) {
                    dataObj[outputModel[k]] = outputModel[k];
                }
            }
            this.view.renderOutputView(dataObj, outputModel);
        },

        _updateOutputView : function (webServiceParam, resultObj) {
            var dataObj = {};
            for (var outputIndex = 0; resultObj.output && outputIndex < resultObj.output.length; outputIndex++) {
                var webServiceIndex = webServiceParam.output.indexOf(resultObj.output[outputIndex]);
                var outputTitle = resultObj.output[outputIndex];
                if (webServiceIndex !== -1) {
                    if (!_.isUndefined(webServiceParam.outputModel)) {
                        outputTitle = expeditor.Utils.getOrElse(webServiceParam.outputModel[webServiceIndex], "jcr:title", outputTitle);

                    }
                }
                dataObj[resultObj.output[outputIndex]] = outputTitle;
            }
            var outputModel = expeditor.Utils.getOrElse(this, "model.outputModel", null);
            this.view.renderOutputView(dataObj, outputModel);
        },
        isValid : function () {
            if (!this._super.apply(this, arguments)) {
                return false;
            }
            var self = this;
            if (this.valuesToValidate) {
                return this.valuesToValidate.every(function (value) {
                    return (expeditor.Utils.getOrElse(self.model.getValue(), "outputModel." + value, null) != null);
                });
            }
            return true;
        }
    });

})(jQuery, expeditor, guidelib);
