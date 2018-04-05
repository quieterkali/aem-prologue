(function ($, _) {

    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    /**
     * Extending the widget from abstract widget since the default date widget has nothing in common with
     * this widget
     */
    var dateInputWidget = $.widget("xfaWidget.dateInputWidget", $.xfaWidget.abstractWidget, {

        _widgetName : "dateInputWidget",

        /**
         * get Field Order based on the format provided
         * @private
         * @param dateFormat
         * @return {*}
         */
        _getFieldOrder : function (dateFormat) {
            var self = this;
            return ['M', 'D', 'Y']
                // get the index of M, D, Y in dateFormat
                .map(function (val) {
                    return {
                        value : val,
                        index : dateFormat.indexOf(val)
                    };
                })
                // sort based on the index of M, D, Y in dateFormat
                .sort(function (a, b) {
                    return a.index - b.index;
                })
                // keep the value only and strip the index
                .map(function (obj) {
                    return obj.value;
                });
        },

        /**
         * Returns options for individual comb field given the placeholder text and number of digits that comb Field
         * can take as input
         * @private
         * @param placeholder placeholder text for the comb field
         * @param numDigits number of digits that the field can take as input
         * @return {{commitEvent: XFA_EXIT_EVENT,
         * zero: string,
          * dataType: string,
          * placeholder: string,
          * combCells: number}}
         */
        _getCombFieldOptions : function (placeholder, numDigits) {
            return {
                commitEvent : xfaUtil.XFA_EXIT_EVENT,
                zero : this.options.zero,
                dataType : "integer",
                placeholder : placeholder,
                combCells : numDigits || 2
            };
        },
        /**
         * Utility function to return the dateControl object given the index of the Day/Month/Year field based
         * on the format.
         * if format is dd/mm/yyyy, and index is 0, this function will return the day Control object
         * @param index
         * @returns {null}
         * @private
         */
        _getCombFieldControl : function (index) {
            if (this.combFieldControls) {
                var combFieldType = this.combFieldOrder[index];
                return this.combFieldControls[combFieldType];
            }
            return null;
        },

        /**
         * Initialize comb fields
         * @private
         */
        _initializeCombFields : function () {
            var // individual field options
                combFieldOptions = {
                    D : this._getCombFieldOptions(this.options.placeholderDay),
                    M : this._getCombFieldOptions(this.options.placeholderMonth),
                    Y : this._getCombFieldOptions(this.options.placeholderYear, 4)
                },
                self = this;

            this.separator = this.options.dateFormat.match(/^date\{.*([^mdy]).*\}$/i)[1];
            /*
             * not using the value attribute of numeric input since utilizing only copy/paste properties
             * would be necessary. Should not rely on xfa widget for any other value related handling
             * Keeping all information pertaining to date in a single object
             */
            this.combFieldControls = {
                D : {
                    'cssClass' : "comb-form-group-day",
                    'regex' : /^(?:0?[1-9]|1[0-9]|2[0-9]|3[01])$/,
                    'placeholder' : this.options.placeholderDay,
                    'label' : this.options.labelDay
                },
                M : {
                    'cssClass' : "comb-form-group-month",
                    'regex' : /^(?:0?[1-9]|1[012])$/,
                    'placeholder' : this.options.placeholderMonth,
                    'label' : this.options.labelMonth
                },
                Y : {
                    'cssClass' : "comb-form-group-year",
                    'regex' : /^[0-9]{4}$/,
                    'placeholder' : this.options.placeholderYear,
                    'label' : this.options.labelYear
                }
            };

            this.element.find("[data-dateInput-wrapper]").each(function (index) {
                $(this).addClass("comb-datefield");
                var input = $(this).find("input"),
                    combFieldType = self.combFieldOrder[index],
                    combField = self._getCombFieldControl(index),
                    widget_id = combField.cssClass + new Date().getTime(),
                    inputLabel;
                if (!self.options.hideLabels) {
                    inputLabel = $(this).children("[data-dateInput-label]");
                    if (inputLabel.length == 0) {
                        inputLabel = $(document.createElement("label")).attr("data-dateInput-label");
                        input.before(inputLabel);
                    }
                    inputLabel.text(combField.label)
                        .attr('for', widget_id)
                        .addClass("showTitle");
                    input.attr('id', widget_id);
                }
                input.addClass(combField.cssClass);
                if (!_.isUndefined($.xfaWidget.numericInput)) {
                    combField.numericInputWidget = input.numericInput(combFieldOptions[combFieldType])
                        .data('xfaWidget-numericInput');
                    input.css("position", "relative");
                    combField.value = null;
                    //Handle exit event thrown by the widget
                    $(this).on(xfaUtil.XFA_EXIT_EVENT, function (evnt) {
                        if (!self._isCombFieldValid(combFieldType)) {
                            combField.numericInputWidget.option("value", combField.value);
                        } else if (self._isValidDate(combFieldType)) {
                            self.options.value = self.getCommitValue();
                            self.element.trigger(xfaUtil.XFA_CHANGE_EVENT);
                            self.element.trigger(xfaUtil.XFA_EXIT_EVENT);
                            combField.value = combField.numericInputWidget.option("value");
                            combField.numericInputWidget.option("displayValue", combField.value);
                        } else {
                            combField.value = combField.numericInputWidget.option("value");
                            combField.numericInputWidget.option("displayValue", combField.value);
                            // don't propagate the EXIT_EVENT of numeric input
                            evnt.stopPropagation();
                        }
                    }).on(xfaUtil.XFA_CHANGE_EVENT, function (evnt) {
                        // don't propogate Numeric Input's change event
                        evnt.stopPropagation();
                    });
                }
            });
        },

        /**
         * Concatenates the values in the comb Fields in order of the format declared in the options
         * @private
         */
        _getConcatenatedValue : function () {
            var self = this;
            return this.combFieldOrder.reduce(function (prevValue, combFieldType) {
                var currValue = self.combFieldControls[combFieldType].numericInputWidget.option("value");
                return _.isEmpty(currValue) ? prevValue : prevValue + self.separator + currValue;
            }, "").substr(1);
        },

        /**
         * checks whether the value in the comb field specified by its type is valid or not.
         * @param combFieldType comb Field Type (M,D,Y) that has changed.
         * @returns {boolean}
         * @private
         */
        _isCombFieldValid : function (combFieldType) {
            var combField = this.combFieldControls[combFieldType],
                combFieldValue = combField.numericInputWidget.option("value");
            return _.isEmpty(combFieldValue) || combField.regex.test(combFieldValue);
        },

        /**
         * concatenate the comb field values to construct a proper value.
         *
         * @private
         */
        _isValidDate : function () {
            var concatenatedDate = this._getConcatenatedValue(),
                isoDate = "";
            // empty value is a perfect value
            if (concatenatedDate.length == 0) {
                return true;
            }

            isoDate = this._parseDate(concatenatedDate);
            return !_.isUndefined(isoDate);
        },

        // parsing the date to pass into ISO Format
        _parseDate : function (value) {
            var parsedValue;
            if (_.isEmpty(value)) {
                return "";
            } else {
                try {
                    parsedValue = xfalib.ut.PictureFmt.parseDate(value, this.options.dateFormat);
                    return parsedValue;
                } catch (e) {
                    window.guideBridge._guide.logger().log("Error while parsing date " + e);
                }
            }
        },

        /**
         * Render the date Field assuming the HTML element provided has the correct hierarchical structure
         */
        render : function () {
            this.combFieldOrder = this._getFieldOrder(this.options.dateFormat);
            this._initializeCombFields();
            // returning the first input element so that focus happens on this element
            return this.element.find("input").eq(0);
        },

        /**
         * returns the value to be commited to the Adaptive Form Script Engine
         * @returns {*}
         */
        getCommitValue : function () {
            var isoDate = this._parseDate(this._getConcatenatedValue());
            return _.isUndefined(isoDate) ? "" : isoDate;
        },

        /*
         * returns a map containing handlers for various widget options. The handler associated with an option is
         * called when that option changes.
         */
        getOptionsMap : function () {
            var parentOptionsMap = $.xfaWidget.abstractWidget.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "value" : function (value) {
                    /*
                     * When the value of the field, changes this function will be called. The value will always be
                     * in the ISO Format i.e. YYYY-MM-DD
                     */
                    if (!_.isEmpty(value)) {
                        var self = this,
                            separator = value.match(/[^0-9]/i),
                            splitDateValue = value.split(separator);
                        ["Y", "M", "D"].forEach(function (type, index) {
                            var combField = self.combFieldControls[type];
                            combField.value = splitDateValue[index];
                            combField.numericInputWidget.option("value", splitDateValue[index]);
                            combField.numericInputWidget.option("displayValue", splitDateValue[index]);
                        });
                    } else {
                        _.each(this.combFieldControls, function (combField) {
                            combField.value = "";
                            combField.numericInputWidget.option("value", "");
                            combField.numericInputWidget.option("displayValue", "");
                        });
                    }
                },
                "access" : function (value) {
                    _.each(this.combFieldControls, function (combField) {
                        combField.value = "";
                        combField.numericInputWidget.option("access", value);
                    });
                }
            });
        },

        /**
         * Returns a mapping of events triggered by this widget with the XFA events. Since we are triggering the events
         * by ourselves, we need to specify the mapping here. Also we do not need to define showValue/showDisplayValue
         * since those are called by the abstract widget if you specify a mapping.
         * @returns {{valueChange.dateInput: *[]}}
         */
        getEventMap : function () {
            return {};
        }
    });
}($, _));
