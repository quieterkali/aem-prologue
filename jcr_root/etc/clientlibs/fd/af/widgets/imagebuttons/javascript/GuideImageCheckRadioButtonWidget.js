/**
 * @package guidelib.view.widgets.GuideImageCheckButtonWidget
 * @version 0.0.1
 *
 * Adobe Guide Image Radio Widget Plugin
 */

(function ($) {
    /*
     * Extending from the default Widget XfaCheckBox
     */
    $.widget("xfaWidget.imageCheckRadioButtonWidget", $.xfaWidget.XfaCheckBox, {
        /*
         * Name of the widget. This is used as the css class for the wrapper div
         */
        _widgetName : "imageCheckRadioButtonWidget",

        /*
         * returns a map containing handlers for various widget options. The handler associated with an option is
         * called when that option changes.
         */
        getOptionsMap : function () {
            var parentOptionsMap = $.xfaWidget.XfaCheckBox.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "displayValue" : function (val) {
                    /*
                     * When the displayValue of the field, changes this function will be called. Since displayValue
                     * is same as value, we could have written the handler for value option
                     */
                    parentOptionsMap.displayValue.apply(this, arguments);
                    // since the widget can be used both for Radio Button/Check Button, adding handling for the same
                    var rbParent = this.$userControl.parents('.guideRadioButtonItem, .guideCheckBoxItem');
                    if (rbParent) {
                        rbParent.toggleClass('imageCheckButtonChecked', this.checkedState);
                    }
                    if (this.$userControl.attr('disabled') === 'disabled') {
                        rbParent.addClass('imageCheckButtonDisabled');
                    }
                }
            });
        }
    });
}($));
