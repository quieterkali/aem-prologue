
(function ($, expeditor, guidelib) {
    var  wsdl_param = '<div class="wsdl-param"></div>',
         wsdl_param_div = '<div class="wsdl-param-title"></div>',
         selectOutputString = Granite.I18n.get("Select Output");
    var WSDLOptionsView = guidelib.author.WSDLOptionsView = expeditor.view.WSDLView.extend({

        setOutputVariables : function (outputVariables) {
            this.outputVariables = outputVariables;
        },

        _updatePlaceHolders : function () {
            var self = this;
            this.selectOptions.forEach(function (select) {
                select.placeholder = selectOutputString;
                var variable = select.dataset.variableName;
                var defaultValue = expeditor.Utils.getOrElse(self.outputVariables, variable + ".defaultValue", null);
                if (defaultValue && defaultValue.variable) {
                    var isSelected = select.selectedItem !== null;
                    var isDefaultSelected = expeditor.Utils.getOrElse(self._getSelectByVariableName(defaultValue.variable), "selectedItem", null);
                    if (!isSelected && isDefaultSelected) {
                        select.placeholder = Granite.I18n.getVar(defaultValue.placeholder);
                    }
                }
            });
        },

        _getSelectByVariableName : function (name) {
            if (this.selectOptions) {
                return this.selectOptions.find(function (select) {
                    return select.dataset.variableName == name;
                });
            }
        },

        _valueSelectChangeHandler : function (e) {
            var value = e.target.value;
            this._updatePlaceHolders();
            this.trigger('change', {action : 'ValueSelect',selectedVariable : value,
                variableName : e.target.dataset.variableName});
        },

        /**
         * Renders output view for WSDL View
         * used in options expressions
         * Allows user to select display value
         * and saved value for drop down lists
         */
        renderOutputView : function (dataObject, outputModel) {
            var self = this;

            this.selectOptions = [];
            for (var variable in this.outputVariables) {
                var valueSelect = new Coral.Select().set({
                    placeholder : selectOutputString
                });
                valueSelect.dataset.variableName = variable;
                valueSelect.onclick = $.proxy(this.onOperationButtonClick, this);
                valueSelect.on('change', $.proxy(this._valueSelectChangeHandler, this));
                this.selectOptions.push(valueSelect);
            }

            for (var key in dataObject) {
                if (dataObject.hasOwnProperty(key)) {
                    var selectLabel = dataObject[key];
                    this.selectOptions.forEach(function (select) {
                        var item = select.items.add({
                            value : key,
                            innerHTML : selectLabel
                        });
                        item.selected = ((outputModel && key == outputModel[select.dataset.variableName]));
                    });
                }
            }

            this.selectOptions.forEach(function (select) {
                var paramTitle = $(wsdl_param_div);
                var title = self.outputVariables[select.dataset.variableName].choiceName;
                paramTitle.append(Granite.I18n.getVar(title));
                var param = $(wsdl_param);
                param.append(paramTitle);
                param.append(select);
                self.outputList.append(param);
            });
            this._updatePlaceHolders();
        }
    });
})(jQuery, expeditor, guidelib);

