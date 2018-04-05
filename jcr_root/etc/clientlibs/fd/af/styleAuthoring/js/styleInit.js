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

;(function (_, $, style, undefined) {

    var styleConstants = style.constants,
        styleVars = style.vars || {},
        uirestrictions = styleVars.uirestrictions;

    $(document).off("cq-contentframe-layout-change.style.fd.breakpointChange").on("cq-contentframe-layout-change.style.fd.breakpointChange", function (e) {
        if (style.utils.breakpointChange && style.vars.json && style.vars.json.breakpoints) {
            style.utils.breakpointChange(e);
        }
    });

    _updateFontListStyling = function () {
        var fontFamilyItems = $("[data-csspropertyname='font-family']").parent().find(".coral-SelectList-item");
        _.each(fontFamilyItems, function (item) {
            if ($(item).data('value') !== '') {
                var itemLabel = item.textContent;
                if (itemLabel.indexOf('<span') == -1) {
                    $(item).html('<span style=\"font-family:' + $(item).data('value') + ';\">' + itemLabel + '</span>');
                }
            }
        });
    };

    $(document).off("style-propertysheet-created.style.fd.initialization").on("style-propertysheet-created.style.fd.initialization", function () {
        /*
         *   To fit the tooltip in the sidepanel.
         *  TODO : remove once granite expose collision property of popover in field.
         */
        var styleAssetLib = style.assetLibrary;
        style.setTooltipCollisionProperty();
        //update the lint configuration after property sheet is loaded
        style.updateLintConfiguration();
        _updateFontListStyling();
    });

    $(document).off("cq-contentframe-layout-change.style.fd.MediaEmulator").on("cq-contentframe-layout-change.style.fd.MediaEmulator", function (e) {
        try {
            //TODO: Need to review the original code in core editor and fix the same
            //it is needed to support device specific media queries
            Granite.author.ContentFrame.contentWindow.Granite.author.MediaEmulator.prototype.applyDevice = function (device) {};
        } catch (e) {
        }
    });

    $(document).off("click.style.coral.popovers").on("click.style.coral.popovers", function (event) {
        var saveButtonSelector = "#" + styleConstants.STYLE_SAVE_BUTTON_ID,
            saveButton = $(saveButtonSelector).get(0);
        if (!($(event.target).closest(saveButtonSelector).get(0) == saveButton)) {
            style.utils.closePopoverIfAny(event);
        }
    });

    style.initializeVars = function () {
        styleVars.currentComponent = undefined;
        styleVars.currentSelector = undefined;
        styleVars.currentState = "default";
        styleVars.ussCSSImportant = false;
        styleVars.currentBreakpoint = Granite.author.responsive.getCurrentBreakpoint();
        styleVars.isPropertySheetChanged = false;
        styleVars.propertySheetMap = {};
        styleVars.json = {};
        styleVars.jsonPostHandler = {};
        styleVars.mapping = {};
    };

    style.setTooltipCollisionProperty = function () {
        $(styleConstants.AFTER_PSEUDO_ELEMENT_WRAPPER_SELECTOR).find("coral-tooltip").prop("collision", "fit");
        $(styleConstants.BEFORE_PSEUDO_ELEMENT_WRAPPER_SELECTOR).find("coral-tooltip").prop("collision", "fit");
        $(styleConstants.CSS_OVERIDE_WRAPPER_SELECTOR).find("coral-tooltip").prop("collision", "fit");
    };

    style.registerViewCSSHandler = function () {
        $("#viewGeneratedCSS").off("click.style.cssView").on("click.style.cssView", function () {
            style.utils.showGeneratedCSS();
        });
    };

    style.updateLintConfiguration = function () {
        if (window.CSSLint && !style.vars.lintConfiguration) {
            style.vars.lintConfiguration = CSSLint.getRules().filter(function (obj) {
                return obj.id == "errors";
            });
            CSSLint.clearRules();
            _.each(style.vars.lintConfiguration, function (rule) {
                CSSLint.addRule(rule);
            });
        }
    };

    style.registerViewCompleteCSSHandler = function () {
        $(".viewThemeCSS").on("click.style.cssView", function () {
             style.utils.showCompleteCSS();
         });
    };

    style.registerEditRawCSSHandler = function () {
        $(".editRawCSS").on("click.style.cssView", function () {
            style.utils.editRawCSS();
        });
    };

    style.registerErrorSimulationEvents = function () {
        $(styleConstants.SIMULATE_ERROR_SELECTOR).on("change.style.propertysheet.simulation", function (event) {
            if (style.utils.getContentWindow()) {
                if (event.target.checked) {
                    if (style.utils.isSuccessSimulationEnviorment()) {
                        style.utils.startStopSuccessSimulation(false);
                    }
                    style.utils.startStopErrorSimulation(true);
                } else {
                    style.utils.startStopErrorSimulation(false);
                }
            }
        });
        $(styleConstants.SIMULATE_SUCCESS_SELECTOR).on("change.style.propertysheet.simulation", function (event) {
            if (style.utils.getContentWindow()) {
                if (event.target.checked) {
                    if (style.utils.isErrorSimulationEnviorment()) {
                        style.utils.startStopErrorSimulation(false);
                    }
                    style.utils.startStopSuccessSimulation(true);
                } else {
                    style.utils.startStopSuccessSimulation(false);
                }
            }
        });
    };

}(window._, $, window.guidelib.touchlib.style));
