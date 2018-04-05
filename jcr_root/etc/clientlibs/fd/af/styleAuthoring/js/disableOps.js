/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

;(function (_, $, style, undefined) {

    style.vars.uirestrictions = {
        blockForValidation : false,
        blockStateChange : false,
        blockPropertySheetSave : false,
        blockRawCSSEdit : false,
        blockAccordionClick : false,
        blockBreakpointClick : false
    };

    var styleUtils = style.utils,
        styleConstants = style.constants,
        styleVars = style.vars = style.vars || {},
        styleUI = style.ui = style.ui || {},
        stylePropertySheetContainerSelector = "#" + styleConstants.STYLE_PROPERTY_SHEET_CONTAINER,
        guidetouchlib = window.guidelib.touchlib,
        guideEditLayerDialogConstants = guidetouchlib.editLayer.dialogUtils.constants,
        uirestrictions = styleVars.uirestrictions;

    /* ================= LIST OF UI RESTRICTIONS AND APIs to enable/disable ================= */

    //state dropdown
    styleUI.blockStateChange = function () {
        uirestrictions.blockStateChange = true;
        $("#style-statescontainer").addClass("disablePointerEvents");
    };

    styleUI.unblockStateChange = function () {
        uirestrictions.blockStateChange = false;
        $("#style-statescontainer").removeClass("disablePointerEvents");
    };

    //property sheet save
    styleUI.blockPropertySheetSave = function () {
        uirestrictions.blockPropertySheetSave = true;
    };

    styleUI.unblockPropertySheetSave = function () {
        uirestrictions.blockPropertySheetSave = false;
    };

    //open raw css
    styleUI.blockRawCSSEdit = function () {
        uirestrictions.blockRawCSSEdit = true;
    };

    styleUI.unblockRawCSSEdit = function () {
        uirestrictions.blockRawCSSEdit = false;
    };

    //disable accordion click
    styleUI.blockAccordionClick = function () {
        uirestrictions.blockAccordionClick = true;
        _.each($("#style-propertysheet .coral3-Accordion-header"), function (item) {
            item.disabled = true;
        });
        _.each($("#style-propertysheet [data-style-more-less-button]"), function (item) {
            item.disabled = true;
        });
    };

    styleUI.unblockAccordionClick = function () {
        uirestrictions.blockAccordionClick = false;
        _.each($("#style-propertysheet .coral3-Accordion-header"), function (item) {
            item.disabled = false;
        });
        _.each($("#style-propertysheet [data-style-more-less-button]"), function (item) {
            item.disabled = false;
        });
    };

    //disable breakpoint click
    styleUI.blockBreakpointClick = function () {
        uirestrictions.blockBreakpointClick = true;
        $(".editor-EmulatorBar").addClass("disablePointerEvents");
    };

    styleUI.unblockBreakpointClick = function () {
        uirestrictions.blockBreakpointClick = false;
        $(".editor-EmulatorBar").removeClass("disablePointerEvents");
    };

    //disable field click
    styleUI.blockFieldClick = function () {
        uirestrictions.blockFieldClick = true;
        $(".coral-Form-fieldwrapper").addClass("disablePointerEvents");
        $(".coral-Form-fieldwrapper [invalid]").parents(".coral-Form-fieldwrapper").removeClass("disablePointerEvents");
    };

    styleUI.unblockFieldClick = function () {
        uirestrictions.blockFieldClick = false;
        $(".coral-Form-fieldwrapper").removeClass("disablePointerEvents");
    };

    //Operations for validation issues
    styleUI.blockUIForValidations = function () {
        uirestrictions.blockForValidation = true;
        styleUI.blockStateChange();
        styleUI.blockRawCSSEdit();
        styleUI.blockPropertySheetSave();
        styleUI.blockAccordionClick();
        styleUI.blockBreakpointClick();
        styleUI.blockFieldClick();
        styleUI.displayPropertySheetWarningMessage();
        styleUI.blockMaskButtonClick();
    };

    styleUI.unblockUIForValidations = function () {
        if (uirestrictions.blockForValidation) {
            uirestrictions.blockForValidation = false;
            styleUI.unblockStateChange();
            styleUI.unblockRawCSSEdit();
            styleUI.unblockPropertySheetSave();
            styleUI.unblockAccordionClick();
            styleUI.unblockBreakpointClick();
            styleUI.unblockFieldClick();
            styleUI.unblockMaskButtonClick();
        }
    };

    /*
     * block click of mask button.
     */
    styleUI.blockMaskButtonClick = function () {
        var blockClass = "disablePointerEvents";
        $(".stylePropertySheetMaskButton").addClass(blockClass);
        $('[data-mvfield-elementtype="button-maskItem"]').addClass(blockClass);
    };

    /*
     * unblock click of mask button.
     */
    styleUI.unblockMaskButtonClick = function () {
        var blockClass = "disablePointerEvents";
        $(".stylePropertySheetMaskButton").removeClass(blockClass);
        $('[data-mvfield-elementtype="button-maskItem"]').removeClass(blockClass);
    };

    /**
     * Common utility to display the error message on property sheet
     * @param message
     */
    styleUI.displayPropertySheetWarningMessage = function () {
        styleUtils.alertValidationError();
    };

}(window._, $, window.guidelib.touchlib.style));
