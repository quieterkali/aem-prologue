/*************************************************************************
*
* ADOBE CONFIDENTIAL
* __________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
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
**************************************************************************/

;(function ($, style, undefined) {

    var constants = style.constants;

    var $popover, // Container Popover which opens up on button click.
        $popoverTarget, //button which opens popover on its click.
        $shadowPosition, //position of the shadow i.e. inside or outside
        $horizontalShadow, //The position of the horizontal shadow. Negative values are allowed
        $verticalShadow, //The position of the vertical shadow. Negative values are allowed
        $blur,  //The blur distance of the shadow.
        $spread, //The size of shadow.
        $color, ////The color of the shadow.
        $boxShadowTextField; //Hidden textfield containing the concatenated value
    /**
    * Method evalutating the concatenated value of box-shadow.
    **/
    var evaluateAndSet = function () {
            var position = $shadowPosition.adaptTo("foundation-field").getValue();
            if (position == "outside") {
                position = "";
            }
            //The position of the horizontal shadow. Negative values are allowed
            var horizontalOffset = $horizontalShadow.adaptTo("foundation-field").getValue().trim(" ").replace(" ", ""),
            //The position of the vertical shadow. Negative values are allowed
                verticalOffset = $verticalShadow.adaptTo("foundation-field").getValue().trim(" ").replace(" ", ""),
            //The blur distance
                blur = $blur.adaptTo("foundation-field").getValue().trim(" ").replace(" ", ""),
            //The size of shadow.
                spread = $spread.adaptTo("foundation-field").getValue().trim(" ").replace(" ", ""),
            //The color of the shadow. The default value is black.
                color = $color.adaptTo("foundation-field").getValue().trim(" ").replace(" ", ""),
            //The final value.
                value = position + " " + horizontalOffset + " " + verticalOffset + " " + blur + " " + spread + " " + color;
            $boxShadowTextField.adaptTo("foundation-field").setValue(value);
            $boxShadowTextField.trigger("foundation-field-change");
        },

        /**
         * Method setting target button icon and label on mouse leave.
         **/

        mouseLeaveHandler = function (event) {
            $(this).text("");
            $(this).get(0).icon = constants.CHEVRON_DOWN;
        },

        /**
         * Method setting target button icon and label on mouse enter.
         **/

        mouseEnterHandler = function (event) {
            $(this).text("Add");
            $(this).get(0).icon = "add";
        },

        /**
         * Method registering event on value change of any field and evaluatig
         * the concatenated box-shadow value;
         **/

        registerEvents = function (event) {
            $shadowPosition.on("foundation-field-change", evaluateAndSet);
            $horizontalShadow.on("foundation-field-change", evaluateAndSet);
            $verticalShadow.on("foundation-field-change", evaluateAndSet);
            $blur.on("foundation-field-change", evaluateAndSet);
            $spread.on("foundation-field-change", evaluateAndSet);
            $color.on("foundation-field-change", evaluateAndSet);
            $popoverTarget.on("mouseleave", mouseLeaveHandler);
            $popoverTarget.on("mouseenter", mouseEnterHandler);

        },

        /**
         * Initial function on shadow popover creation;
         **/

        shadowPopoverInit = function () {
            $popover = $("#shadow");
            $popoverTarget = $popover.siblings("button");
            $shadowPosition = $popover.find(".themeShadowPosition");
            $horizontalShadow = $popover.find(".shadowHorizontal");
            $verticalShadow = $popover.find(".shadowVertical");
            $blur = $popover.find(".shadowBlur");
            $spread = $popover.find(".shadowSpread");
            $color = $popover.find(".shadowColor");
            $boxShadowTextField = $popover.find(".boxShadow");
            registerEvents();
        };

    $(document).on("style-propertysheet-created", shadowPopoverInit);

}(jQuery, window.guidelib.touchlib.style));
