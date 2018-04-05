// jscs:disable requireDotNotation
/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

;(function (undefined) {

    window["Coral"] = window["Coral"] || {};
    window["Coral"]["templates"] = window["Coral"]["templates"] || {};
    window["Coral"]["templates"]["NumericSpinner"] = window["Coral"]["templates"]["NumericSpinner"] || {};
    window["Coral"]["templates"]["NumericSpinner"]["base"] = (function anonymous(data_0) {
        var frag = document.createDocumentFragment();
        var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
        data = data_0;

        data.uid = Coral.commons.getUID();

        data_0 = data;
        var el1 = document.createTextNode("\n");
        frag.appendChild(el1);
        var el2 = document.createElement("span");
        el2.className += " coral-InputGroup-button";
        el2.setAttribute("role", "presentation");
        var el3 = document.createTextNode("\n  ");
        el2.appendChild(el3);
        var el11 = this["stepUp"] = document.createElement("button", "coral-button");
        el11.setAttribute("type", "button");
        el11.setAttribute("is", "coral-button");
        el11.setAttribute("handle", "stepUp");
        el11.setAttribute("title", "Increment");
        el11.setAttribute("aria-label", "Increment");
        el11.setAttribute("icon", "chevronUp");
        el11.setAttribute("iconsize", "XS");
        el11.setAttribute("tabindex", "-1");
        el11.setAttribute("aria-controls", data_0["uid"]);
        el2.appendChild(el11);
        var el4 = this["stepDown"] = document.createElement("button", "coral-button");
        el4.setAttribute("type", "button");
        el4.setAttribute("is", "coral-button");
        el4.setAttribute("handle", "stepDown");
        el4.setAttribute("title", "Decrement");
        el4.setAttribute("aria-label", "Decrement");
        el4.setAttribute("icon", "chevronDown");
        el4.setAttribute("iconsize", "XS");
        el4.setAttribute("tabindex", "-1");
        el4.setAttribute("aria-controls", data_0["uid"]);
        el2.appendChild(el4);
        var el5 = document.createTextNode("\n");
        el2.appendChild(el5);
        frag.appendChild(el2);
        var el6 = document.createTextNode("\n");
        frag.appendChild(el6);
        var el7 = this["input"] = document.createElement("input", "coral-textfield");
        this["$" + "input"] = $(el7);
        el7.setAttribute("is", "coral-textfield");
        el7.setAttribute("handle", "$input");
        el7.setAttribute("type", "text");
        el7.className += " coral-InputGroup-input";
        el7.id = data_0["uid"];
        frag.appendChild(el7);
        var el8 = document.createTextNode("\n");
        frag.appendChild(el8);
        return frag;
    });

    Coral.register(/** @lends Coral.NumericSpinner# */ {
        /**
         @class Coral.NumericSpinner
         @classdesc A NumericSpinner component
         @extends Coral.NumberInput
         @htmltag coral-numericspinner
         */
        name : 'NumericSpinner',
        tagName : 'coral-numericspinner',
        className : 'coral-InputGroup',
        extend : Coral.NumberInput,

        properties : {
            // JSDoc inherited
            'value' : {
                override : true,
                transform : function (value) {
                    return value ? String(value) : '';
                },
                get : function () {
                    var elemVal = this._elements.input.value;
                    //TODO: floating point comparison doesn't always work - need to update this code..
                    if (elemVal && elemVal == parseFloat(elemVal)) {
                        this._elements.input.value = elemVal + this.suffix;
                        return this._elements.input.value;
                    } else {
                        return this._elements.input.value;
                    }
                },
                set : function (value) {
                    // sets the value immediately so it is picked up in form submits
                    this._elements.input.value = value;
                    this._queueSync('value', 'invalid', 'disabled');
                },
                sync : function () {
                    // @a11y: aria-valuetext is used so that VoiceOver does not announce a percentage
                    this._elements.input.setAttribute('aria-valuenow', this.value);
                    this._elements.input.setAttribute('aria-valuetext', this.value);
                }
            },

            /**
             The value returned as a Number. Value is <code>NaN</code> if conversion to Number is not possible.

             @type {Number}
             @default NaN
             @memberof Coral.NumericSpinner#
             */
            'valueAsNumber' : {
                override : true,
                attribute : null,
                transform : function (value) {
                    value = value.trim();
                    value = parseFloat(value);
                    return value;
                },
                get : function () {
                    var value1 = this.value;
                    value1 = value1.trim();
                    value1 = parseFloat(value1);
                    return value1;
                },
                set : function (value) {
                    // sets the value immediately so it is picked up in form submits
                    this._elements.input.value = value;

                    this._queueSync('value', 'invalid', 'disabled');
                }
            },

            /**
             The suffix returned as a String. Eg px, em etc..

             @type {String}
             @default ''
             @memberof Coral.NumericSpinner#
             */
            'suffix' : {
                get : function () {
                    return this._suffix;
                }
            }
        },

        /**
         Increments the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
         considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
         */
        stepUp : function () {
            // uses the Number representation since it simplifies the calculations
            var value = this.valueAsNumber;
            var currSuffix = this._getCurrentSuffixValue();
            if (currSuffix == "") {
                currSuffix = this.suffix;
            }
            if (isNaN(value)) {
                this.value = (this.max !== null ? Math.min(this.step, this.max) : this.step) + currSuffix;
            } else {
                this.value = (this.max !== null ? Math.min(value + this.step, this.max) : value + this.step) + currSuffix;
            }
        },

        /**
         Decrements the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
         considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
         */
        stepDown : function () {
            // uses the Number representation since it simplifies the calculations
            var value = this.valueAsNumber;
            var currSuffix = this._getCurrentSuffixValue();
            if (currSuffix == "") {
                currSuffix = this.suffix;
            }
            if (isNaN(value)) {
                this.value = (this.min !== null ? Math.max(-this.step, this.min) : -this.step) + currSuffix;
            } else {
                this.value = (this.min !== null ? Math.max(value - this.step, this.min) : value - this.step) + currSuffix;
            }
        },

        _getCurrentSuffixValue : function () {
            var currVal = this.value;
            var numValue = this.valueAsNumber;
            return currVal.substring(numValue.toString().length);
        },

        /**
         Checks if the current NumberSpinner is valid or not. This is done by checking that the current value is between the
         provided <code>min</code> and <code>max</code> values. This check is only performed on user interaction.
         Numeric, Empty, "auto", "inherit" and "initial" are valid values.
         @ignore
         */
        _validateInputValue : function () {
            this.invalid = false;
        },

        /**
         Sets the correct state of the buttons based on <code>disabled</code>, <code>min</code>, <code>max</code> and
         <code>readOnly</code> properties.

         @ignore
         */
        _setButtonState : function () {
            this._elements.stepUp.disabled = this.disabled || (this.max !== null && this.valueAsNumber >= this.max) || this.readOnly;
            this._elements.stepDown.disabled = this.disabled || (this.min !== null && this.valueAsNumber <= this.min) || this.readOnly;
        },

        /**
         Handles the home key press. If a max has been set, the value will be modified to match it, otherwise the key is
         ignored.

         @ignore
         */
        _onKeyHome : function (event) {
            event.preventDefault();

            // stops interaction if the numberinput is disabled or readonly
            if (this.disabled || this.readOnly) {
                return;
            }

            // sets the max value only if it exists
            if (this.max !== null) {
                // stores the old value before setting the max
                var oldValue = this.value;

                this.value = this.max + this.suffix;

                // checks if we need to trigger a change event
                this._triggerChange(this.value, oldValue);
            }
        },

        /**
         Handles the end key press. If a min has been set, the value will be modified to match it, otherwise the key is
         ignored.

         @ignore
         */
        _onKeyEnd : function (event) {
            event.preventDefault();

            // stops interaction if the numberinput is disabled or readonly
            if (this.disabled || this.readOnly) {
                return;
            }

            // sets the min value only if it exists
            if (this.min !== null) {
                // stores the old value before setting the min
                var oldValue = this.value;

                this.value = this.min + this.suffix;

                // checks if we need to trigger a change event
                this._triggerChange(this.value, oldValue);
            }
        },

        /**
         Overrides the method from formField to be able to add validation after the user has changed the value.

         @private
         */
        _onInputChange : function (event) {
            // stops the current event
            event.stopPropagation();

            // we only do this on user interaction
            this._validateInputValue();

            // we force the sync of the value property to update the aria values
            this._queueSync('value');

            // we always trigger a change since it came from user interaction
            this.trigger('change');
        },

        /**
        * Overrides the method polyfill added for ie in base implementation which blocks non numeric characters
        * as we need characters for suffix.
        */
        _onInputKeyPress : function (event) {
            //do nothing
        },

        /** @ignore */
        _render : function () {
            // clean up
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            this.appendChild(Coral.templates.NumericSpinner.base.call(this._elements));
        }
    });
}());
