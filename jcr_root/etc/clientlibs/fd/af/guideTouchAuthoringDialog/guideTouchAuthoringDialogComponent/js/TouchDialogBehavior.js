// jscs:disable requireDotNotation
/*
 * ADOBE CONFIDENTIAL
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
 */
(function ($, ns, document, guidetouchlib, formsManager, undefined) {

    var dialogUtils = guidetouchlib.editLayer.dialogUtils,
        guideEditLayerConstants = guidetouchlib.editLayer.dialogUtils.constants,
        authorUtils = guidelib.author.AuthorUtils,
        LAYOUT_COMPLETION_EXPRESSION = "completionExpReq",
        LAYOUT_PROPERTY_DIALOG_FIELD_MAP = {
            "guidenavigatortab" : "./layout/guideNavigatorTab",
            "nonnavigable" : "./layout/nonNavigable",
            "enablelayoutoptimization" : "./layout/enableLayoutOptimization"
        };
    // initialize the layout map with dynamic key
    LAYOUT_PROPERTY_DIALOG_FIELD_MAP[LAYOUT_COMPLETION_EXPRESSION] = "./" + LAYOUT_COMPLETION_EXPRESSION;

    //Function to show hide colspan based on responsive container or table/nonresponsive container
    guidetouchlib.editLayer.dialogUtils.handleColspan = function (currentDialog) {
        var panelId = authorUtils.getHtmlId(currentDialog.editable.path),
            parentPanelId = authorUtils.getParentId(panelId),
            $parentPanel = window._afAuthorHook._getAfWindow().$("#" + parentPanelId);

        if ($parentPanel.length > 0) {
            var authoringConfig = $parentPanel.data("guideAuthoringconfigjson");
            if (authoringConfig && authoringConfig.nonNavigable && authoringConfig.nonNavigable === true) {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './colspan'), 'div');
                return;
            }
        }
        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './colspan'), 'div');
    };

    guidetouchlib.editLayer.dialogUtils.showHideAutofillFieldKeyword = function (elementType) {

        var enableAutocompleteCheckbox = dialogUtils.selectElement("coral-checkbox", './autocomplete')[0];
        if (enableAutocompleteCheckbox !== null && enableAutocompleteCheckbox.checked === true) {
            if (elementType === "select") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './autofillFieldKeyword'), 'div');
            } else if (elementType === "autocomplete") {
                var $element = $("[name='./autofillFieldKeyword']").closest(".coral-Form-fieldwrapper");
                dialogUtils.showGraniteComponent($element, 'div');
            }
        } else {
            if (elementType === "select") {
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './autofillFieldKeyword'), 'div');
            } else if (elementType === "autocomplete") {
                var $element = $("[name='./autofillFieldKeyword']").closest(".coral-Form-fieldwrapper");
                dialogUtils.hideGraniteComponent($element, 'div');
            }
        }
    };

    //Function to show hide dorColspan based on column layout of parent panel
    guidetouchlib.editLayer.dialogUtils.handleDoRColspan = function (currentDialog) {
        var panelId = authorUtils.getHtmlId(currentDialog.editable.path),
            parentPanelId = authorUtils.getParentId(panelId),
            $parentPanel = window._afAuthorHook._getAfWindow().$("#" + parentPanelId);

        if ($parentPanel.length > 0) {
            var authoringConfig = $parentPanel.data("guideAuthoringconfigjson");
            if (authoringConfig && authoringConfig.dorLayoutType && authoringConfig.dorLayoutType === "columnar") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './dorColspan'), 'div');
                return;
            }
        }
        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './dorColspan'), 'div');
    };

    //Function to handle change event pattern list
    guidetouchlib.editLayer.dialogUtils.changePatternList = function (patternType, isOnChange) {
        var patternTypeSelect = '',
            patternTypeClause = '',
            patternTypeValue = '',
            validateSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './displayIsSameAsValidate')[0],
            editSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './isEditSameAsDisplayPattern')[0];

        if (patternType == guideEditLayerConstants.DISPLAY_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.DISPLAY_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.DISPLAY_PATTERN_TYPE_CLAUSE;
        } else if (patternType == guideEditLayerConstants.VALIDIATION_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_CLAUSE;
        } else if (patternType == guideEditLayerConstants.EDIT_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.EDIT_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.EDIT_PATTERN_TYPE_CLAUSE;
        }

        patternTypeValue = dialogUtils.selectElement("coral-select", patternTypeSelect)[0].selectedItem.innerHTML;
        switch (patternTypeValue) {
            case "Select"     :
            case "No Pattern" :
                dialogUtils.selectElement("input", patternTypeClause).closest("div").hide();
                break;
            default           :
                dialogUtils.selectElement("input", patternTypeClause).closest("div").show();

        }

        if (dialogUtils.selectElement("coral-select", patternTypeSelect)[0].value != "custom") {
            dialogUtils.selectElement("input", patternTypeClause)[0].value = dialogUtils.selectElement("coral-select", patternTypeSelect)[0].value;
        }
        if (validateSameAsDisplayCheckBox != null && validateSameAsDisplayCheckBox.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayValPatternChange();
        }
        if (editSameAsDisplayCheckBox != null && editSameAsDisplayCheckBox.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayEditPatternChange();
        }
    };

    guidetouchlib.editLayer.dialogUtils.changePatternText = function (patternType) {
        var patternTypeSelect = '',
            patternTypeClause = '',
            patternTypeSelectVal = '',
            patternTypeClauseVal = '',
            itemFound = false,
            validateSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './displayIsSameAsValidate')[0],
            editSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './isEditSameAsDisplayPattern')[0],
            customOption = {
                value : "custom",
                content : {
                    innerHTML : "Custom"
                }
            };

        if (patternType == guideEditLayerConstants.DISPLAY_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.DISPLAY_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.DISPLAY_PATTERN_TYPE_CLAUSE;
        } else if (patternType == guideEditLayerConstants.VALIDIATION_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_CLAUSE;
        } else if (patternType == guideEditLayerConstants.EDIT_PATTERN) {
            patternTypeSelect = guideEditLayerConstants.EDIT_PATTERN_TYPE_SELECT;
            patternTypeClause = guideEditLayerConstants.EDIT_PATTERN_TYPE_CLAUSE;
        }
        patternTypeClauseVal = dialogUtils.selectElement("input", patternTypeClause)[0].value;
        patternTypeSelectVal = dialogUtils.selectElement("coral-select", patternTypeSelect)[0].value;
        if (patternTypeClauseVal != patternTypeSelectVal) {
            dialogUtils.selectElement("coral-select", patternTypeSelect)[0].items.getAll().forEach(function (item) {
                if (item.value == patternTypeClauseVal) {
                    item.selected = true;
                    itemFound = true;
                }
            });
            if (!itemFound) {
                if (dialogUtils.selectElement("coral-select", patternTypeSelect)[0].items.last().value != "custom") {
                    dialogUtils.selectElement("coral-select", patternTypeSelect)[0].items.add(customOption);
                }
                dialogUtils.selectElement("coral-select", patternTypeSelect)[0].value = "custom";
            }
        }

        if (validateSameAsDisplayCheckBox != null && validateSameAsDisplayCheckBox.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayValPatternChange();
        }
        if (editSameAsDisplayCheckBox != null && editSameAsDisplayCheckBox.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayEditPatternChange();
        }
    };

    //Function to handle dynamic behaviour based on same as display pattern for validation
    guidetouchlib.editLayer.dialogUtils.sameAsDisplayValPatternChange = function () {
        var validateSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './displayIsSameAsValidate'),
            validateSameAsDisplayCheckBoxElement = validateSameAsDisplayCheckBox[validateSameAsDisplayCheckBox.length - 1],
            valPatternTypeSelect = dialogUtils.selectElement("coral-select", guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_SELECT),
            valPatternTypeClause = dialogUtils.selectElement("input", guideEditLayerConstants.VALIDIATION_PATTERN_TYPE_CLAUSE),
            displayPatternTypeClause = dialogUtils.selectElement("input", guideEditLayerConstants.DISPLAY_PATTERN_TYPE_CLAUSE),
            displayPatternTypeSelect = dialogUtils.selectElement("coral-select", guideEditLayerConstants.DISPLAY_PATTERN_TYPE_SELECT);

        valPatternTypeSelect.attr("disabled", false);
        valPatternTypeClause.attr("disabled", false);

        if (validateSameAsDisplayCheckBoxElement != null && validateSameAsDisplayCheckBoxElement.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayPattern(displayPatternTypeSelect, displayPatternTypeClause, valPatternTypeSelect, valPatternTypeClause);
        }
    };

    //Function to handle dynamic behaviour based on same as display pattern for edit
    guidetouchlib.editLayer.dialogUtils.sameAsDisplayEditPatternChange = function () {
        var editSameAsDisplayCheckBox = dialogUtils.selectElement("coral-checkbox", './isEditSameAsDisplayPattern'),
            editSameAsDisplayCheckBoxElement = editSameAsDisplayCheckBox[editSameAsDisplayCheckBox.length - 1],
            editPatternTypeSelect = dialogUtils.selectElement("coral-select", guideEditLayerConstants.EDIT_PATTERN_TYPE_SELECT),
            editPatternTypeClause = dialogUtils.selectElement("input", guideEditLayerConstants.EDIT_PATTERN_TYPE_CLAUSE),
            displayPatternTypeClause = dialogUtils.selectElement("input", guideEditLayerConstants.DISPLAY_PATTERN_TYPE_CLAUSE),
            displayPatternTypeSelect = dialogUtils.selectElement("coral-select", guideEditLayerConstants.DISPLAY_PATTERN_TYPE_SELECT);

        editPatternTypeSelect.attr("disabled", false);
        editPatternTypeClause.attr("disabled", false);
        if (editSameAsDisplayCheckBoxElement != null && editSameAsDisplayCheckBoxElement.checked == true) {
            guidetouchlib.editLayer.dialogUtils.sameAsDisplayPattern(displayPatternTypeSelect, displayPatternTypeClause, editPatternTypeSelect, editPatternTypeClause);
        }
    };

    guidetouchlib.editLayer.dialogUtils.sameAsDisplayPattern = function (displayPatternTypeSelect, displayPatternTypeClause, currentPattenSelect, currentPatternClause) {
        currentPattenSelect.attr("disabled", true);
        currentPatternClause.attr("disabled", true);
        currentPatternClause[0].value = displayPatternTypeClause[0].value;

        if (displayPatternTypeSelect[0].value == "custom") {
            var customOption = {
                value : "custom",
                content : {
                    innerHTML : "Custom"
                }
            };
            if (currentPattenSelect[0].items.last().value != "custom") {
                currentPattenSelect[0].items.add(customOption);
            }
            currentPattenSelect[0].value = "custom";
        } else {
            currentPattenSelect[0].value = displayPatternTypeSelect[0].value;
        }
    };

    guidetouchlib.editLayer.dialogUtils.setDefaultTextBoxValue = function () {
        var allowRichTextValue = dialogUtils.selectElement("coral-checkbox", "./allowRichText"),
            valueField = dialogUtils.selectElement("input", "./_value"),
            placeHolderField = dialogUtils.selectElement("input", "./placeholderText"),
            richTextValueField, plainTextValueField;

        if (valueField.hasClass("plainTextValue")) {
            plainTextValueField = valueField;
            richTextValueField = dialogUtils.selectElement("input", "./_richTextValue@Delete");
        } else {
            richTextValueField = valueField;
            plainTextValueField = dialogUtils.selectElement("input", "./_plainTextValue@Delete");
        }

        var $richTextContainer = richTextValueField.parent('div.richtext-container'),
            $richTextLabel = $richTextContainer.siblings('label');
        if (allowRichTextValue[0].checked) {
            dialogUtils.showGraniteComponent($richTextLabel, 'div');
            dialogUtils.showGraniteComponent($richTextContainer, 'div');
            var $richTextDiv = $richTextContainer.find(".coral-RichText-editable");
            $richTextDiv.empty().append(valueField[0].value);
            richTextValueField[0].value = valueField[0].value;
            plainTextValueField[0].name = "./_plainTextValue@Delete";
            richTextValueField[0].name = "./_value";
            dialogUtils.hideGraniteComponent(plainTextValueField, 'div');
            // hide placeholder text for rich text component
            dialogUtils.hideGraniteComponent(placeHolderField, 'div');
        } else {
            dialogUtils.showGraniteComponent(plainTextValueField, 'div');
            plainTextValueField[0].value = valueField[0].value;
            plainTextValueField[0].name = "./_value";
            richTextValueField[0].name = "./_richTextValue@Delete";
            dialogUtils.hideGraniteComponent($richTextLabel, 'div');
            dialogUtils.hideGraniteComponent($richTextContainer, 'div');
            // show placeholder text when rich text is not enabled
            dialogUtils.showGraniteComponent(placeHolderField, 'div');
        }
    };

    //Function to implement dynamic behavior in chart type on change
    guidetouchlib.editLayer.dialogUtils.chartTypeOnChange = function () {

        //var chartTypeList=$("coral-select[name='./chartType']");
        var chartTypeList = dialogUtils.selectElement("coral-select", "./chartType"),
            chartTypeElement = chartTypeList[chartTypeList.length - 1];

        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-numberinput", "./innerRadius"), 'div');

        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './lineColor'), 'div');
        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './pointColor'), 'div');
        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './areaColor'), 'div');

        dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './xAxisTitle'), 'div');
        dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './yAxisTitle'), 'div');

        //Show hide the inner radius based on chart type.
        if (chartTypeElement != null && chartTypeElement.selectedItem != null) {
            if (chartTypeElement.selectedItem.value == "donut") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-numberinput", './innerRadius'), 'div');
                //$("coral-numberinput[data-touchuiinnerradius='touchUIInnerRadius']").closest('div').removeAttr("hidden");
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './xAxisTitle'), 'div');
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './yAxisTitle'), 'div');
            } else if (chartTypeElement.selectedItem.value == "pie") {
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './xAxisTitle'), 'div');
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './yAxisTitle'), 'div');
            } else if (chartTypeElement.selectedItem.value == "line") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './lineColor'), 'div');
            } else if (chartTypeElement.selectedItem.value == "linepoint") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './lineColor'), 'div');
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './pointColor'), 'div');
            } else if (chartTypeElement.selectedItem.value == "point") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './pointColor'), 'div');
            } else if (chartTypeElement.selectedItem.value == "area") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './lineColor'), 'div');
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './areaColor'), 'div');
            }
        }

        //Dynamic show/hide of legends options
        if (chartTypeElement.selectedItem.value == "line" || chartTypeElement.selectedItem.value == "linepoint" || chartTypeElement.selectedItem.value == "point" || chartTypeElement.selectedItem.value == "area") {
            $("span[data-aflegendNoteLabel='afLegendNoteLabel']").removeAttr("hidden");
            $("section[data-aflegendfieldsset='afLegendFieldSet']").hide();
        } else {
            $("span[data-aflegendNoteLabel='afLegendNoteLabel']").attr("hidden", "");
            $("section[data-aflegendfieldsset='afLegendFieldSet']").show();
        }

        //Dynamic show/hide of tooltip options
        if (chartTypeElement.selectedItem.value == "line" || chartTypeElement.selectedItem.value == "area") {
            $("span[data-aftooltipnotelabel='afTooltipNoteLabel']").removeAttr("hidden");
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './tooltipHtml'), 'div');
            dialogUtils.selectElement("input", './tooltipHtml').parent('div').parent('div').attr("hidden", "");

        } else {
            $("span[data-aftooltipnotelabel='afTooltipNoteLabel']").attr("hidden", "");
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './tooltipHtml'), 'div');
            dialogUtils.selectElement("input", './tooltipHtml').parent('div').parent('div').removeAttr("hidden");
        }

    };
    //Function to handle dynamic behaviour based on chart checkbox change for x axis
    guidetouchlib.editLayer.dialogUtils.checkBoxOnXChange = function () {

        var chartCheckBox = dialogUtils.selectElement("coral-checkbox", './useXFunction'),
            chartCheckBoxElement = chartCheckBox[chartCheckBox.length - 1];

        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './reducerXFunct'), 'div');
        dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-checkbox", './useYFunction'), 'div');

        //Show hide the select x func based on chart type.
        if (chartCheckBoxElement != null && chartCheckBoxElement.checked == true) {
            //$("[data-touchuiinnerradius='touchUIInnerRadius']").closest('div').removeClass("touchUIHidden");
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './reducerXFunct'), 'div');
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-checkbox", './useYFunction'), 'div');
        }

    };

    //Function to handle dynamic behaviour based on chart checkbox change for y axis
    guidetouchlib.editLayer.dialogUtils.checkBoxOnYChange = function () {

        var chartCheckBox = dialogUtils.selectElement("coral-checkbox", './useYFunction'),
            chartCheckBoxElement = chartCheckBox[chartCheckBox.length - 1];

        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './reducerYFunct'), 'div');
        dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-checkbox", './useXFunction'), 'div');

        //Show hide the select y func based on chart type.
        if (chartCheckBoxElement != null && chartCheckBoxElement.checked == true) {

            dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './reducerYFunct'), 'div');
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-checkbox", './useXFunction'), 'div');
        }

    };

    //Function to handle dynamic behaviour based on show legend checkbox for chart component
    guidetouchlib.editLayer.dialogUtils.legendCheckBoxChange = function () {
        var legendCheckBox = dialogUtils.selectElement("coral-checkbox", './showLegends'),
            legendCheckBoxElement = legendCheckBox[legendCheckBox.length - 1];

        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './legendPosition'), 'div');

        //Show hide chart legend position based on show legends checkbox
        if (legendCheckBoxElement != null && legendCheckBoxElement.checked == true) {

            dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './legendPosition'), 'div');

        }

    };

    //Dynamic handling of numeric box
    guidetouchlib.editLayer.dialogUtils.numericDataTypeOnChange = function () {
        var dataTypeList = dialogUtils.selectElement("coral-select", './dataType'),
            dataTypeElement = dataTypeList[dataTypeList.length - 1];

        dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-numberinput", './leadDigits'), 'div');
        dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-numberinput", './fracDigits'), 'div');

        //Show hide the frac digit based on data type element
        if (dataTypeElement != null && dataTypeElement.selectedItem != null && (dataTypeElement.selectedItem.value == "integer" || dataTypeElement.selectedItem.value == "")) {
            // lead digits is visible for all numeric date types but for integer , we rename lead digits to Total Digits.
            var totalDigitsLabel = CQ.I18n.getMessage("Maximum Number of Digits");
            dialogUtils.selectElement("coral-numberinput", './leadDigits').siblings("label").text(totalDigitsLabel);
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-numberinput", './fracDigits'), 'div');
        } else {
            var leadDigitsLabel = CQ.I18n.getMessage("Lead digits");
            dialogUtils.selectElement("coral-numberinput", './leadDigits').siblings("label").text(leadDigitsLabel);
        }

    };

    /**
     * Show the dor bind ref selector when dor submission is enabled
     */
    guidetouchlib.editLayer.dialogUtils.showDorBindRefSelector = function () {
        var enableDORSubmission = dialogUtils.selectElement("coral-checkbox", './enableDoRSubmission'),
            enableDORSubmissionCheckBoxElement = enableDORSubmission[enableDORSubmission.length - 1],
            $dorBindRefSelector = dialogUtils.selectElement("input", './bindRef'),
            parentBindRefSelector = "span.bindRefSelector";
        // ensuring the event is triggered only once, since the widget is going into inconsistent state
        // due to multiple event firing
        if (!$(enableDORSubmissionCheckBoxElement).data("eventTriggered")) {
            // trigger the content loaded event for bind ref to initialize itself
            $(document).trigger("fdBindRef-contentLoaded");
            $(enableDORSubmissionCheckBoxElement).data("eventTriggered", true);
        }
        if (enableDORSubmissionCheckBoxElement != null && enableDORSubmissionCheckBoxElement.checked == true) {
            $dorBindRefSelector.parent(parentBindRefSelector).parent().show();
        } else {
            $dorBindRefSelector.parent(parentBindRefSelector).parent().hide();
        }
    };

    //Function to handle dynamic behaviour based show popup for terms and conditions
    guidetouchlib.editLayer.dialogUtils.showPopupOnChange = function () {
        var showPopupCheckBox = dialogUtils.selectElement("coral-checkbox", './showAsPopUp'),
            showPopupCheckBoxElement = showPopupCheckBox[showPopupCheckBox.length - 1];

        dialogUtils.selectElement("coral-checkbox", './showApprovalOption').attr("disabled", false);

        //Disable the Approval option based on show popup checkbox
        if (showPopupCheckBoxElement != null && showPopupCheckBoxElement.checked == true) {

            dialogUtils.selectElement("coral-checkbox", './showApprovalOption').attr("checked", "true").attr("disabled", true);

        }
    };

    //Function to handle dynamic behaviour of show link in terms and condition component
    guidetouchlib.editLayer.dialogUtils.showTermsLinkOnChange = function () {
        var termsLinkCheckBox = dialogUtils.selectElement("coral-checkbox", './showLink'),
            termsLinkCheckBoxElement = termsLinkCheckBox[termsLinkCheckBox.length - 1];

        dialogUtils.showGraniteComponent(dialogUtils.selectElement("textarea", './tncTextContent'), 'div');
        dialogUtils.hideGraniteComponent($("coral-multifield[data-touchuitermslinktext='touchUITermsLinkText']"), 'div');

        //Show hide content for terms and conditions based on checkbox
        if (termsLinkCheckBoxElement != null && termsLinkCheckBoxElement.checked == true) {

            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("textarea", './tncTextContent'), 'div');
            dialogUtils.showGraniteComponent($("coral-multifield[data-touchuitermslinktext='touchUITermsLinkText']"), 'div');
        }
    };

    //Function to handle dynamic behaviour of adaptive form based on use existing Adaptive form checkbox
    guidetouchlib.editLayer.dialogUtils.useExistingAFOnChange = function () {
        var useExistingAFCheckBox = dialogUtils.selectElement("coral-checkbox", './useExistingAF'),
            useExistingAFCheckBoxElement = useExistingAFCheckBox[useExistingAFCheckBox.length - 1];

        //$("span[data-touchuithankyoupage='touchUIThankYouPage']").disabled=false;
        dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './redirect'), 'div');
        dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './guideRef'), 'div');

        //Accordion doesnot have any name, so using data attribute
        dialogUtils.showGraniteComponent($("div[data-touchuiformsubmitaction='touchUIFormSubmitAction']"), 'coral-accordion-item');

        //Disable the thankyou page element and submit actions accordion based on useExistingAF checkbox
        if (useExistingAFCheckBoxElement != null && useExistingAFCheckBoxElement.checked == true) {

            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("input", './redirect'), 'div');
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("input", './guideRef'), 'div');

            dialogUtils.hideGraniteComponent($("div[data-touchuiformsubmitaction='touchUIFormSubmitAction']"), 'coral-accordion-item');
        }
    };

    //Function to handle default value of date picker based on current date by default checkbox
    guidetouchlib.editLayer.dialogUtils.defaultToCurrentDateOnChange = function () {
        var currentDateCheckbox = dialogUtils.selectElement("coral-checkbox", "./defaultToCurrentDate"),
            valueField = dialogUtils.selectElement("input", "./_value");
        if (currentDateCheckbox[0].checked) {
            valueField.val("");
            valueField.hide();
        } else {
            valueField.show();
        }
    };

    //Show/Hide the lazy loading option in panel based on fragRef
    guidelib.touchlib.editLayer.dialogUtils.showHideLazyLoadOption = function () {
        var fragRef = dialogUtils.selectElement("input", './fragRef');

        //Show/hide lazy load checkbox based on fragRef is filled or not
        if (fragRef[0].value == "" || fragRef[0].value == undefined) {
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-checkbox", './optimizeRenderPerformance'), 'div');
        } else {
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-checkbox", './optimizeRenderPerformance'), 'div');
        }
    };

    // Show or hide dorNumCols drop down depending on layout selected
    guidelib.touchlib.editLayer.dialogUtils.showHideDoRLayoutOptions = function () {
        var dorLayoutType = dialogUtils.selectElement("coral-select", './layout/dorLayoutType')[0];

        if (dorLayoutType.value === "tabular") {
            dialogUtils.selectElement("coral-select", './layout/dorNumCols')[0].value += '@Delete';
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-select", './layout/dorNumCols'), 'div');
        } else if (dorLayoutType.value === "columnar") {
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-select", './layout/dorNumCols'), 'div');
        }
    };

    guidelib.touchlib.editLayer.dialogUtils.renderSubDialog = function (actionType) {
        var select = '',
            actionPath = '',
            fieldSetName = '',
            selectBox,
            doc = window._afAuthorHook._getAfWindow().document,
            guidePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path"),
            selectedElement,
            selectedElementValue,
            dialogPath,
            subDialogResponse,
            subDialogContent,
            afWindow,
            $fieldSet,
            $fieldSetWrapper;
        if (actionType === guideEditLayerConstants.SUBMIT_ACTION) {
            selectBox = guideEditLayerConstants.SUBMIT_ACTION_TYPE_SELECT;
            fieldSetName = guideEditLayerConstants.SUBMIT_ACTION_FIELD_SET;
        } else if (actionType === guideEditLayerConstants.AUTO_SAVE_ACTION) {
            selectBox = guideEditLayerConstants.AUTO_SAVE_STRATEGY_TYPE_SELECT;
            fieldSetName = guideEditLayerConstants.AUTO_SAVE_STRATEGY_FIELD_SET;
        } else if (actionType === guideEditLayerConstants.CAPTCHA_SERVICE) {
            guidePath = $(doc).find('div.afCaptchaField').data("path");
            selectBox = guideEditLayerConstants.CAPTCHA_SERVICE_TYPE_SELECT;
            fieldSetName = guideEditLayerConstants.CAPTCHA_SERVICE_CONFIGURATION_FIELD_SET;
        }
        $fieldSet = $("[data-touchuiformactionset='" + fieldSetName + "']");
        $fieldSet.empty();
        $fieldSetWrapper = $fieldSet.parent("div.borderFieldSetWrapper");
        afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window;

        selectedElement = dialogUtils.selectElement("coral-select", selectBox);
        if (actionType === guideEditLayerConstants.CAPTCHA_SERVICE) {
            selectedElementValue = selectedElement.find('coral-select-item[value="' + selectedElement[0].value + '"]').data('captcha-path');
        } else {
            selectedElementValue = selectedElement[0].value;
        }

        dialogPath = selectedElementValue + "/cq:dialog.html";

        $($(selectedElement.find('coral-select-item[data-deprecated="true"]')).filter(function () {
            return $(this).prop('selected') === false;
        })).remove();

        /* if dialogPath is not absolute then use overlay
         TODO Ideally it should be using /mnt/override because it is a touch dialog but override needs absolute path
         and this approach of getting absolute path gives console errors. We need to think for a better option to get the absolute path of these actions and then
         use /mnt/override here.  Also need to check the backword compatibility issues after override support.
         */
        if (dialogPath.indexOf("/") !== 0) {
            dialogPath = "/mnt/overlay/" + dialogPath;
        }
        actionPath = dialogPath + guidePath;
        subDialogResponse = CQ.shared.HTTP.get(actionPath);
        if (CQ.shared.HTTP.isOk(subDialogResponse)) {
            var parser = $(window).adaptTo("foundation-util-htmlparser"),
                html = subDialogResponse.body;
            parser.parse(html, true).then(function (dialogHtml) {
                var $subDialogContent = $(dialogHtml).find('div.cq-dialog-content');
                $subDialogContent.addClass("guide-dialog");
                if (_.isEmpty($subDialogContent)) {
                    $fieldSetWrapper.hide();//hide config
                } else {
                    $fieldSetWrapper.show();//Show config
                    $fieldSet.append($subDialogContent);
                    $subDialogContent.trigger('foundation-contentloaded');
                }
            });
        } else {
            $fieldSetWrapper.hide();
        }

        if (fieldSetName == guideEditLayerConstants.AUTO_SAVE_STRATEGY_FIELD_SET) {
            guidelib.touchlib.editLayer.dialogUtils.showHideAutosaveConfig();
        }
    };

    guidelib.touchlib.editLayer.dialogEventHandlers.setDefaultStorePath = function () {
        var storePathField = dialogUtils.selectElement("input", "./storePath")[0],
            storePath = storePathField.value,
            doc = window._afAuthorHook._getAfWindow().document,
            pagePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
        if (typeof(storePath) == 'undefined' || storePath.length == 0) {
            var pageIndex = pagePath.indexOf("jcr:content/guideContainer");
            var pos = pagePath.indexOf('/', 1);
            var path = pagePath.substring(0, pos + 1) + "usergenerated/content" + pagePath.substring(pos, pageIndex - 1) + "/*";
            storePathField.value = path;
        }
    };

    guidelib.touchlib.editLayer.dialogUtils.handleSubmitRESTEndpointPost = function () {
        var enableRestEndpointCheckbox = dialogUtils.selectElement("coral-checkbox", "./enableRestEndpointPost"),
            enableRestEndpointCheckboxElement = enableRestEndpointCheckbox[enableRestEndpointCheckbox.length - 1],
            restEndPointUrlTextbox = dialogUtils.selectElement("input", './restEndpointPostUrl')[0];
        if (enableRestEndpointCheckboxElement != null && enableRestEndpointCheckboxElement.checked == true) {
            dialogUtils.showGraniteComponent(restEndPointUrlTextbox, 'div');
        } else {
            dialogUtils.hideGraniteComponent(restEndPointUrlTextbox, 'div');
        }
    };

    guidelib.touchlib.editLayer.dialogEventHandlers.onLoadGuideContainerDialogHideFields = function () {
        var xsdRefField = dialogUtils.selectElement("input", "./xsdRef")[0],
            xdpRefField = dialogUtils.selectElement("input", "./xdpRef")[0];
        dialogUtils.hideGraniteComponent(xsdRefField, 'div');
        dialogUtils.hideGraniteComponent(xdpRefField, 'div');
    };

    guidelib.touchlib.editLayer.dialogEventHandlers.onClickReportButton = function () {
        var storePathField = dialogUtils.selectElement("input", "./storePath")[0],
            storePath = storePathField.value,
            url,
            doc = window._afAuthorHook._getAfWindow().document,
            pagePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
        url = CQ.shared.HTTP.externalize(pagePath + ".af.bulkeditor.jsp?storePath=" + storePath);

        var w = CQ.shared.Util.open(url, null, "FormReport");
        w.focus();
    };

    guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOnLoad = function () {
        var panelPath = $("div[data-panelpath]").data("panelpath");
        $("[data-panelpath]").removeData("panelpath").removeAttr("data-panelpath");
        if (panelPath) {
            var title,
                name,
                panelJson,
                bindRefOfPanel,
                authoringConfigJson,
                formModelField = dialogUtils.selectElement("coral-select", "formModel")[0],
                fragmentModelRootField = dialogUtils.selectElement("coral-select", "fragmentModelRoot")[0],
                titleField = dialogUtils.selectElement("input", "title")[0],
                nameField = dialogUtils.selectElement("input", "name")[0],
                formModelDefaultValue = "none",
                fragmentModelRootDefaultValue = "No Model Root",
                xsdRefFieldValue,
                schemaRefFieldValue,
                xdpRefFieldValue,
                xdpRefField = dialogUtils.selectElement("input", "xdpRef")[0],
                xsdRefField = dialogUtils.selectElement("input", "xsdRef")[0],
                schemaRefField = dialogUtils.selectElement("input", "schemaRef")[0],
                FORMTEMPLATES = "formtemplates",
                XMLSCHEMA = "xmlschema",
                JSONSCHEMA = "jsonschema",
                FORMDATAMODEL = "formdatamodel",
                fragmentModelRootValue,
                complexTypeOfElement,
                fragmentModelRootFieldFirstOption,
                fragmentModelRootFieldSecondOption;

            dialogUtils.hideGraniteComponent(xdpRefField, 'div');
            dialogUtils.hideGraniteComponent(xsdRefField, 'div');
            dialogUtils.hideGraniteComponent(schemaRefField, 'div');
            dialogUtils.hideGraniteComponent(fragmentModelRootField, 'div');

            panelJson = CQ.shared.HTTP.eval(encodeURI(panelPath + ".infinity.json"));
            title = panelJson["jcr:title"] || panelJson["name"];
            name = panelJson["name"];
            bindRefOfPanel = panelJson["bindRef"];
            formModelField.value = formModelDefaultValue;

            var defaultFragmentModelRootOption = {
                value : fragmentModelRootDefaultValue,
                content : {
                    innerHTML : fragmentModelRootDefaultValue
                }
            };
            fragmentModelRootField.items.add(defaultFragmentModelRootOption);
            fragmentModelRootField.value = fragmentModelRootDefaultValue;
            titleField.value = title;
            nameField.value = name;

            authoringConfigJson = window._afAuthorHook._getAfWindow().$(".guideContainerWrapperNode").data("guideAuthoringconfigjson");
            if (authoringConfigJson.xsdRef) {
                xsdRefFieldValue = authoringConfigJson.xsdRef;
            } else if (authoringConfigJson.xdpRef) {
                xdpRefFieldValue = authoringConfigJson.xdpRef;
            } else if (authoringConfigJson.schemaRef) {
                schemaRefFieldValue = authoringConfigJson.schemaRef;
            }

            if (xdpRefFieldValue && xdpRefFieldValue.length > 0) {
                xdpRefField.value = xdpRefFieldValue;
                formModelField.value = FORMTEMPLATES;

                fragmentModelRootFieldFirstOption = {
                    value : bindRefOfPanel,
                    content : {
                        innerHTML : bindRefOfPanel
                    }
                };
                fragmentModelRootFieldSecondOption = {
                    value : "xfa[0].form[0]",
                    content : {
                        innerHTML : "xfa[0].form[0]"
                    }
                };
                fragmentModelRootField.items.clear();
                fragmentModelRootField.items.add(fragmentModelRootFieldFirstOption);
                fragmentModelRootField.items.add(fragmentModelRootFieldSecondOption);
                fragmentModelRootValue = bindRefOfPanel || "xfa[0].form[0]";
                fragmentModelRootField.value = fragmentModelRootValue;
                dialogUtils.showGraniteComponent(xdpRefField, 'div');
            } else if (!_.isEmpty(xsdRefFieldValue) || !_.isEmpty(schemaRefFieldValue)) {
                dialogUtils.showGraniteComponent(fragmentModelRootField, 'div');
                var schemaRef = authoringConfigJson.xsdRef || authoringConfigJson.schemaRef;
                var schemaType = authoringConfigJson.schemaType;
                if (bindRefOfPanel) {
                    complexTypeOfElement = guidelib.author.AuthorUtils.findTypeOfElementFromXsd(panelJson, panelPath, schemaRef, bindRefOfPanel, schemaType);
                }
                fragmentModelRootFieldFirstOption = {
                    value : "/",
                    content : {
                        innerHTML : "/"
                    }
                };

                fragmentModelRootValue = "/";
                fragmentModelRootField.items.clear();
                fragmentModelRootField.items.add(fragmentModelRootFieldFirstOption);
                if (!_.isEmpty(complexTypeOfElement)) {
                    fragmentModelRootFieldSecondOption = {
                        value : complexTypeOfElement,
                        content : {
                            innerHTML : complexTypeOfElement
                        }
                    };
                    fragmentModelRootField.items.add(fragmentModelRootFieldSecondOption);
                }
                fragmentModelRootField.value = fragmentModelRootValue;
                if (schemaType && schemaType == "jsonschema") {
                    schemaRefField.value = schemaRefFieldValue;
                    formModelField.value = JSONSCHEMA;
                    dialogUtils.showGraniteComponent(schemaRefField, 'div');
                } else if (schemaType && schemaType == "formdatamodel") {
                    schemaRefField.value = schemaRefFieldValue;
                    formModelField.value = FORMDATAMODEL;
                    dialogUtils.showGraniteComponent(schemaRefField, 'div');
                } else {
                    xsdRefField.value = xsdRefFieldValue;
                    formModelField.value = XMLSCHEMA;
                    dialogUtils.showGraniteComponent(xsdRefField, 'div');
                }
            }
            formModelField.disabled = "true";
            $(".cq-dialog:not('.guide-dialog') .cq-dialog-submit").on("click", {panelPath : panelPath}, guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOk);
        }
    };

    guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOk = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var panelPath = event.data.panelPath;
        if (panelPath) {
            var title,
                name,
                panelJson = CQ.shared.HTTP.eval(encodeURI(panelPath + ".infinity.json")),
                bindRefOfPanel,
                authoringConfigJson,
                formModelField = dialogUtils.selectElement("coral-select", "formModel")[0],
                fragmentModelRootField = dialogUtils.selectElement("coral-select", "fragmentModelRoot")[0],
                titleField = dialogUtils.selectElement("input", "title")[0],
                nameField = dialogUtils.selectElement("input", "name")[0],
                tagsField = dialogUtils.selectElement("input", "tags")[0],
                xdpRefField = dialogUtils.selectElement("input", "xdpRef")[0],
                xsdRefField = dialogUtils.selectElement("input", "xsdRef")[0],
                schemaRefField = dialogUtils.selectElement("input", "schemaRef")[0],
                descriptionField = dialogUtils.selectElement("input", "description")[0],
                targetPathField = dialogUtils.selectElement("input", "targetPath")[0];

            bindRefOfPanel = panelJson["bindRef"];
            if (!$(nameField).hasClass("is-invalid")) {
                var metadataProperties = {
                    "description" : descriptionField.value,
                    "title" : titleField.value,
                    "cq:tags" : tagsField.value,
                    "formmodel" : formModelField.value,
                    "xdpRef" : xdpRefField.value,
                    "xsdRef" : xsdRefField.value,
                    "schemaRef" : schemaRefField.value
                };

                // model root property is not sent to the server in case of  no form model.
                if (formModelField.value != "none" || fragmentModelRootField.value != "No Model Root") {
                    metadataProperties.fragmentModelRoot = fragmentModelRootField.value;
                }

                if (fragmentModelRootField.value !== "/" && (!_.isEmpty(schemaRefField.value) || !_.isEmpty(xsdRefField.value))) {
                    guidelib.author.AuthorUtils.manipulateBindRefForFragment(panelJson, fragmentModelRootField.value, bindRefOfPanel);
                }

                var options = {
                    metadataProperties : JSON.stringify(metadataProperties),
                    panelPath : panelPath,
                    panelJson : JSON.stringify(panelJson),
                    name : nameField.value,
                    targetPath : targetPathField.value,
                    responseHandler : function (responseData) {
                        if (responseData.code === "AEM-FMG-900-002") {
                            var headerMessage = CQ.I18n.getMessage("Fragment with same name already exists"),
                                contentMessage = CQ.I18n.getMessage("A fragment with this name already exists. Please enter a different name and retry.");
                            var dialog = new Coral.Dialog().set({
                                header : {
                                    innerHTML : headerMessage
                                },
                                content : {
                                    innerHTML : contentMessage
                                },
                                footer : {
                                    innerHTML : '<button is="coral-button" variant="primary" coral-close>Ok</button> <button is="coral-button" variant="primary" coral-close>Cancel</button>'
                                },
                                closable : "on"
                            });
                            document.body.appendChild(dialog);
                            dialog.show();
                        } else if (responseData.fragmentPath != null && responseData.fragmentPath.length > 0) {
                            $(".cq-dialog:not('.guide-dialog') .cq-dialog-submit").off("click", guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOk);
                            guidetouchlib.utils.closeIndependentDialog();
                            guidelib.author.AuthorUtils.deletePanelAndAddFragRef(panelPath, responseData.fragmentPath);

                            var historyStep = Granite.author.history.util.Utils.beginStep(),
                                historyAction = new Granite.author.history.actions.fd.SaveAsFragment(panelPath, panelPath, "fd/af/components/panel", {
                                    "fragRef" : responseData.fragmentPath
                                });
                            historyStep.addAction(historyAction);
                            historyStep.commit();

                            // Call the parent node listener as the child has been modified.
                            var editable = window.guidelib.author.editConfigListeners._getEditable(panelPath);
                            window.guidelib.author.editConfigListeners.GUIDE_AFTER_CHILD_MODIFIED(ns.editables.getParent(editable));
                        } else {
                            var contentMessage = CQ.I18n.getMessage("Fragment Creation Failed. Please Retry");
                            var dialog = new Coral.Dialog().set({
                                content : {
                                    innerHTML : contentMessage
                                },
                                footer : {
                                    innerHTML : '<button is="coral-button" variant="primary" coral-close>Ok</button> <button is="coral-button" variant="primary" coral-close>Cancel</button>'
                                },
                                closable : "on"
                            });
                            document.body.appendChild(dialog);
                            dialog.show();
                            $(".cq-dialog:not('.guide-dialog') .cq-dialog-submit").off("click", guidelib.touchlib.editLayer.dialogEventHandlers.createFragmentOk);
                            guidetouchlib.utils.closeIndependentDialog();
                        }
                    }
                };

                if (formsManager != null && formsManager.FragmentCreation != null && formsManager.FragmentCreation.createFragmentFromPanel != null) {
                    formsManager.FragmentCreation.createFragmentFromPanel(options);
                }
            } else {
                var headerMessage = CQ.I18n.getMessage("Invalid Name"),
                    contentMessage = CQ.I18n.getMessage("Please enter a valid value in Name Field and retry.");
                var dialog = new Coral.Dialog().set({
                    header : {
                        innerHTML : headerMessage
                    },
                    content : {
                        innerHTML : contentMessage
                    },
                    footer : {
                        innerHTML : '<button is="coral-button" variant="primary" coral-close>Ok</button> <button is="coral-button" variant="primary" coral-close>Cancel</button>'
                    },
                    closable : "on"
                });
                document.body.appendChild(dialog);
                dialog.show();
            }
        }
    };

    //Function to handle dynamic behaviour of mandatory checkbox
    /*guidetouchlib.editLayer.dialogUtils.toggleMandatoryMessage = function () {
        var mandatoryCheckBox = dialogUtils.selectElement("coral-checkbox", './mandatory'),
        mandatoryCheckBoxElement = mandatoryCheckBox[mandatoryCheckBox.length - 1];

        //Show hide mandatory message
        if (mandatoryCheckBoxElement != null && mandatoryCheckBoxElement.checked == true) {
            dialogUtils.showGraniteComponent(dialogUtils.selectElement("textarea", './mandatoryMessage'), 'div');
        } else {
            dialogUtils.hideGraniteComponent(dialogUtils.selectElement("textarea", './mandatoryMessage'), 'div');
        }
    };*/

    //Function to handle dynamic behaviour of sign Service change scribble / adobe sign
    guidetouchlib.editLayer.dialogUtils.signServiceChange = function () {
        var signingServicesList = dialogUtils.selectElement("coral-select", './signingService'),
            guideTouchLibConstants = guidetouchlib.constants,
            signingServiceElement = signingServicesList[signingServicesList.length - 1],
            legacyCheck = dialogUtils.selectElement("coral-checkbox", guideTouchLibConstants.LEGACY_CHECK)[0],
            cloudConfigElement = dialogUtils.selectElement("coral-select", './cq:cloudserviceconfigs'),
            signingServiceElementVal;
        if (signingServiceElement != null && signingServiceElement.selectedItem != null) {
            signingServiceElementVal = signingServiceElement.selectedItem.value;
        }
        if (signingServiceElementVal === "scribble") {
            legacyCheck.hidden = true;
            dialogUtils.hideGraniteComponent(cloudConfigElement, 'div');
        } else {
            legacyCheck.hidden = false;
            guidetouchlib.editLayer.dialogUtils.legacyCheckLoad();
        }
    };

    // Function to handle legacy check change
    guidetouchlib.editLayer.dialogUtils.legacyCheckChange = function () {
        var guideTouchLibConstants = guidetouchlib.constants,
            legacyCheck = dialogUtils.selectElement("coral-checkbox", guideTouchLibConstants.LEGACY_CHECK)[0],
            targetVersion = dialogUtils.selectElement("input", './' + guideTouchLibConstants.FD_TARGET_VERSION)[0],
            cloudConfigElement = dialogUtils.selectElement("coral-select", './cq:cloudserviceconfigs');
        if (legacyCheck.checked) {
            targetVersion.value = "1.0";
            dialogUtils.showGraniteComponent(cloudConfigElement, 'div');
        } else {
            targetVersion.value = "1.1";
            dialogUtils.hideGraniteComponent(cloudConfigElement, 'div');
        }
    };

    // Function to handle legacy check load
    guidetouchlib.editLayer.dialogUtils.legacyCheckLoad = function () {
        var guideTouchLibConstants = guidetouchlib.constants,
            legacyCheck = dialogUtils.selectElement("coral-checkbox", guideTouchLibConstants.LEGACY_CHECK)[0],
            targetVersion = dialogUtils.selectElement("input", './' + guideTouchLibConstants.FD_TARGET_VERSION)[0],
            cloudConfigElement = dialogUtils.selectElement("coral-select", './cq:cloudserviceconfigs'),
            signingServiceElement = dialogUtils.selectElement("coral-select", './signingService')[0],
            signingServiceElementVal;
        if (signingServiceElement != null && signingServiceElement.selectedItem != null) {
            signingServiceElementVal = signingServiceElement.selectedItem.value;
        }
        targetVersion.hidden = true;
        if (targetVersion.value === "1.1") {
            legacyCheck.checked = false;
            dialogUtils.hideGraniteComponent(cloudConfigElement, 'div');
        } else {
            legacyCheck.checked = true;
            dialogUtils.showGraniteComponent(cloudConfigElement, 'div');
        }
        if (signingServiceElementVal === "scribble") {
            dialogUtils.hideGraniteComponent(cloudConfigElement, 'div');
        }
    };

    //Function to handle dynamic behaviour of 'Layout' element in Panel component.
    guidetouchlib.editLayer.dialogUtils.layoutOnChange = function (eventType) {
        var layoutList = dialogUtils.selectElement("coral-select", './layout/sling:resourceType'),
            layoutElement = layoutList[layoutList.length - 1],
            selectedItem = layoutElement != null && layoutElement.selectedItem,
            setLayoutSpecificProperty = function (propertyName, dialogFieldSelector, newValue) {
                // setting starts with to "true" since name/dialogFieldSelector can also change dynamically with "@Delete" at end
                // also we don't need type hint, hence setting last param to true
                // remove type hint since it is of no use here
                var $dialogField = dialogUtils.selectElement("input", dialogFieldSelector, true, true),
                    oldDialogFieldValue = $dialogField.length > 0 ? $dialogField[0].value : null,
                    // first check if present as data attribute, if not fallback to newValue
                    newDialogFieldValue = ($(selectedItem).length > 0 ? ($(selectedItem).data(propertyName) || newValue) : null);
                // if new value is boolean, convert it to string
                if (typeof newDialogFieldValue === "boolean") {
                    newDialogFieldValue = newDialogFieldValue.toString();
                }
                if (oldDialogFieldValue && newDialogFieldValue == null) {
                    // delete the property
                    var name = $dialogField.attr("name") + "@Delete";
                    $dialogField.attr("name", name);
                } else if (newDialogFieldValue) {
                    $dialogField[0].value = newDialogFieldValue;
                }
            };

        if (selectedItem != null) {
            // get the type of navigator tab
            // configuration dependent to make it more generic
            // if anyone creates something similar to wizard layout, guidenavigatortab would always be "wizard-tab"
            var navigatorTabValue = $(selectedItem).data("guidenavigatortab"),
                $noOfColumns = $("[name='./layout/columns']").closest(".coral-Form-fieldwrapper");
            //Show hide the 'Number of Columns' based on Layout element
            if (selectedItem.value == "fd/af/layouts/gridFluidLayout") {
                dialogUtils.showGraniteComponent($noOfColumns, 'div');
            } else {
                dialogUtils.hideGraniteComponent($noOfColumns, 'div');
            }
            // Show "Run Validation on Step Completion Event" only for wizard layout.
            if (navigatorTabValue === "wizard-tab") {
                dialogUtils.showGraniteComponent(dialogUtils.selectElement("coral-checkbox", './validateOnStepCompletion'), 'div');
            } else {
                dialogUtils.hideGraniteComponent(dialogUtils.selectElement("coral-checkbox", './validateOnStepCompletion'), 'div');
            }
            // only on change update the layout specific property
            if (eventType === "change") {
                // check if the selected item has all the layout specific data attributes
                _.each(LAYOUT_PROPERTY_DIALOG_FIELD_MAP, function (value, key) {
                    var selector = null;
                    // on load or change, update the properties which get derived on layout change
                    if (key === LAYOUT_COMPLETION_EXPRESSION) {
                        setLayoutSpecificProperty(key, value, navigatorTabValue === "wizard-tab");
                    } else {
                        setLayoutSpecificProperty(key, value);
                    }
                });
            }
        }
    };

    //Function to handle dynamic behaviour of 'Function' element of X and Y-Axis in Chart component.
    guidetouchlib.editLayer.dialogUtils.functionOnChange = function (functionParentType) {
        if (functionParentType === "xAxisFunction") {
            var functionDropdownList = dialogUtils.selectElement("coral-select", './reducerYFunction'),
                functionElement = functionDropdownList[functionDropdownList.length - 1];

        } else {//yAxisFunction
            var functionDropdownList = dialogUtils.selectElement("coral-select", './reducerXFunction'),
                functionElement = functionDropdownList[functionDropdownList.length - 1];
        }

        //Change other dropdown value to None.
        if (functionElement != null) {
            functionElement.value = "none";
        }
    };

    guidetouchlib.editLayer.dialogUtils.showHideAutosaveConfig = function () {
        var enableAutoSaveCheckbox = dialogUtils.selectElement("coral-checkbox", './enableAutoSave')[0];

        if (enableAutoSaveCheckbox != null && enableAutoSaveCheckbox.checked == true) {
            $(enableAutoSaveCheckbox).nextAll().show();
        } else {
            $(enableAutoSaveCheckbox).nextAll().hide();
        }
    };

    //Function to handle dynamic behaviour of recaptcha cloud configuration service list
    guidetouchlib.editLayer.dialogUtils.loadRecaptchaSiteKey = function () {
        var configElement, selectedSiteKey, siteKeyHiddenElement;

        configElement = dialogUtils.selectElement("coral-select", './rcCloudServicePath');
        selectedSiteKey = configElement.find('coral-select-item[value="' + configElement[0].value + '"]').data('site.key');
        siteKeyHiddenElement = dialogUtils.selectElement("input", './rcSitekey');

        siteKeyHiddenElement[0].value = selectedSiteKey;
    };

    guidetouchlib.editLayer.dialogUtils.enableDisableAsyncSubmission = function () {
        var enableAsyncSubmissionCheckbox = dialogUtils.selectElement("coral-checkbox", './enableAsyncSubmission')[0],
            thankYouOption = dialogUtils.selectElement("coral-radio", './thankYouOption'),
            tyMessage = dialogUtils.selectElement("input", './thankYouMessage'), tyPage = dialogUtils.selectElement("input", './redirect');

        if (enableAsyncSubmissionCheckbox != null && enableAsyncSubmissionCheckbox.checked == true) {
            thankYouOption.parent('div').parent('div').show();
            guidetouchlib.editLayer.dialogUtils.thankYouOptionChange();
        } else {
            thankYouOption.parent('div').parent('div').hide();
            dialogUtils.showGraniteComponent(tyPage, 'div');
            tyMessage.parent('div').parent('div').hide();
        }
    };

    //Dynamic handling of thank you option
    guidetouchlib.editLayer.dialogUtils.thankYouOptionChange = function () {
        var thankYouOptionType = dialogUtils.selectElement("coral-radio", './thankYouOption'), isTYMessageSelected = false,
            tyMessage = dialogUtils.selectElement("input", './thankYouMessage'), tyPage = dialogUtils.selectElement("input", './redirect');
        Coral.commons.ready(thankYouOptionType, function () {
            thankYouOptionType.each(function (i, obj) {
                if (obj.checked && obj.value === "message") {
                    isTYMessageSelected = true;
                }
            });
            if (isTYMessageSelected) {
                tyMessage.parent('div').parent('div').show();
                dialogUtils.hideGraniteComponent(tyPage, 'div');
            } else {
                dialogUtils.showGraniteComponent(tyPage, 'div');
                tyMessage.parent('div').parent('div').hide();
            }
        });
    };

    guidetouchlib.editLayer.dialogUtils.requiredFieldOnChange = function () {
        /* If the required field property is checked then checkboxes for hiding and disabling the component should be disabled as a component cannot be
         hidden/disabled and mandatory at the same time. */
        var visibleProperty = $(guideEditLayerConstants.HIDE_FIELD_PROPERTY_SELECTOR)[0],
            enabledProperty = $(guideEditLayerConstants.DISABLE_FIELD_PROPERTY_SELECTOR)[0],
            mandatoryProperty = $(guideEditLayerConstants.REQUIRED_FIELD_PROPERTY_SELECTOR)[0];
        if (visibleProperty && mandatoryProperty) {
            visibleProperty.checked = visibleProperty.checked && !(mandatoryProperty.checked);
        }
        if (enabledProperty && mandatoryProperty) {
            enabledProperty.checked = enabledProperty.checked && !(mandatoryProperty.checked);
        }
        if (visibleProperty && enabledProperty && mandatoryProperty) {
            visibleProperty.disabled = enabledProperty.disabled = mandatoryProperty.checked;
        }
    };

    /* Need to prevent saving of default values of enabled and visible property if value
     * not already defined on node structure to prevent syncing these defaults in syncXFAProps.*/
    guidetouchlib.editLayer.dialogUtils.enableVisibleOnLoad = function (propertyName) {
        var authoringConfigJson = dialogUtils.getCurrentAuthoringConfigJson();
        if (!authoringConfigJson.hasOwnProperty(propertyName)) {
            $("input[name='./" + propertyName + "@UseDefaultWhenMissing']").attr("disabled", true);
        }
    };

    guidetouchlib.editLayer.dialogUtils.enableVisibleOnChange = function (propertyName) {
        var authoringConfigJson = dialogUtils.getCurrentAuthoringConfigJson();
        if (authoringConfigJson.hasOwnProperty(propertyName)) {
            $("input[name='./" + propertyName + "@UseDefaultWhenMissing']").attr("disabled", false);
        }
    };

    guidetouchlib.editLayer.dialogUtils.showHideCustomText = function () {
        var assistPriorityDropdown = dialogUtils.selectElement("coral-select", './assistPriority'),
            customTextElement = dialogUtils.selectElement("textarea", './custom');

        if (_.isEmpty(customTextElement)) {
            customTextElement = $("coral-multifield[data-wrapper-class='custom-text-wrapper']");
        }
        //Show hide custom text area/multifield
        if (assistPriorityDropdown != null && assistPriorityDropdown[0] && assistPriorityDropdown[0].value === "custom") {
            dialogUtils.showGraniteComponent(customTextElement, 'div');
        } else {
            dialogUtils.hideGraniteComponent(customTextElement, 'div');
        }
    };

}(jQuery, Granite.author, document, window.guidelib.touchlib, window.Form));
