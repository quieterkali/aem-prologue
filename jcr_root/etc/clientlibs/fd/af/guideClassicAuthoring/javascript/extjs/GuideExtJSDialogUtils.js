/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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

(function ($, guidelib, _) {

    var customOption = {
            qtip : "",
            text : "Custom",
            value : "custom"
        },

        GuideUtil = guidelib.util.GuideUtil,
        CHART_TYPE = GuideUtil.chartType,

        GuideExtJSDialogUtils = guidelib.author.GuideExtJSDialogUtils = {
            isWizardLayoutMap : [],
            patternSelectedListener : function (patternType) {
                return function (field, value) {
                    var dialog = field.findParentByType("dialog"),
                        patternField,
                        checkBoxValidateSameAsDisplay,
                        checkBoxEditSameAsDisplay,
                        ind = -1;
                    if (dialog && field.getValue() !== "custom") {
                        patternField = dialog.getField(patternType);
                        checkBoxValidateSameAsDisplay = dialog.getField("./displayIsSameAsValidate");
                        checkBoxEditSameAsDisplay = dialog.getField("./isEditSameAsDisplayPattern");
                        if (patternField) {
                            patternField.setValue(value);
                        }
                        field.options.forEach(function (item, index) {
                            if (item.value === "custom") {
                                ind = index;
                            }
                        });
                        if (ind !== -1) {
                            field.options.splice(ind, 1);
                            field.setOptions(field.options);
                        }
                        // to ensure that the values of edit pattern and validation pattern
                        // get updated when display pattern is changed for cases when their values are expected
                        // to be same as display
                        if (patternType === "./displayPictureClause" && checkBoxValidateSameAsDisplay && checkBoxValidateSameAsDisplay.getValue().length === 1) {
                            GuideExtJSDialogUtils.makeDisplayAndValidatePatternSame.apply(this, [checkBoxValidateSameAsDisplay]);
                        }
                        if (patternType === "./displayPictureClause" && checkBoxEditSameAsDisplay && checkBoxEditSameAsDisplay.getValue().length === 1) {
                            GuideExtJSDialogUtils.makeDisplayAndEditPatternSame.apply(this, [checkBoxEditSameAsDisplay]);
                        }
                    }
                };
            },

            _disableFieldAndSetValue : function (field, value, cond) {
                if (field) {
                    field.setDisabled(cond);
                    if (cond === true) {
                        field.setValue(value);
                    }
                }
            },

            makeDisplayAndValidatePatternSame : function (field) {
                if (field) {
                    GuideExtJSDialogUtils.alterEditOrValidatePattern.apply(this, [field,"./validatePictureClause"]);
                }
            },

            makeDisplayAndEditPatternSame : function (field) {
                if (field) {
                    GuideExtJSDialogUtils.alterEditOrValidatePattern.apply(this, [field,"./editPictureClause"]);
                }
            },
            /**
             * Makes the path relative if absolute
             * @param value
             * @returns {*}
             */
            sanitizePath : function (value) {
                var LENGTH_OF_APPS_OR_LIBS = 6;
                if (_.isString(value) && value.indexOf("/") === 0) {
                    return value.substring(LENGTH_OF_APPS_OR_LIBS);
                }
                return value;
            },

            alterEditOrValidatePattern : function (field, fieldName) {
                var dialog = field.findParentByType('dialog'),
                    fieldSet = field.findParentByType('fieldset', true),
                    editOrValidatePatternField,
                    displayPatternField,
                    patternTypeField,
                    value,
                    fieldState = field.getValue().length !== 0;
                if (dialog) {
                    editOrValidatePatternField = dialog.getField(fieldName);
                    displayPatternField = dialog.getField("./displayPictureClause");
                    value = displayPatternField.getValue();
                    GuideExtJSDialogUtils._disableFieldAndSetValue.apply(this,
                        [editOrValidatePatternField, value, fieldState]);
                    GuideExtJSDialogUtils.loadPatternType.apply(this, [editOrValidatePatternField, 1]);
                    if (fieldSet) {
                        patternTypeField = fieldSet.findByType("selection");
                        if (patternTypeField.length === 2) {
                            patternTypeField[1].setDisabled(fieldState);
                        }
                    }

                }
            },

            /**
             * selecting the edit pattern type and disabling the field if the pattern
             * should be same as display pattern
             */
            loadEditPatternType : function (field) {
                var dialog = field.findParentByType("dialog"),
                    checkBoxField = dialog ? dialog.getField("./isEditSameAsDisplayPattern") : null;
                GuideExtJSDialogUtils.loadPatternType.apply(this, [field, 1]);
                if (checkBoxField && checkBoxField.getValue().length === 1) {
                    GuideExtJSDialogUtils.makeDisplayAndEditPatternSame.apply(this, [checkBoxField]);
                }
            },

            handleSubmitRESTEndpointPost : function () {
                var dialog = this.findParentByType('dialog'),
                    checkbox = dialog.getField('./enableRestEndpointPost'),
                    urlfield = dialog.getField('./restEndpointPostUrl');
                if (urlfield && checkbox) {
                    if (_.isEqual(["true"], checkbox.getValue())) {
                        urlfield.show();
                    } else {
                        urlfield.setValue(null);
                        urlfield.hide();
                    }
                }
            },

            // This function is executed when the beforeHide event of dialog is triggered and it refreshes the component.
            // beforeHide is triggered when cancel button is clicked or close mark is clicked.
            beforeHideHandler : function () {
                if (this.previewButtonClicked) {
                    this.previewButtonClicked = false;
                    this.responseScope.refreshSelf();
                }
            },

            // this function finds the widget div for the given component.
            findWidgetDiv : function (elementDivObject) {
                var widgetTypes = [".guideCheckBoxGroupItems", ".guide-fu-attach-button", ".guide-tnc-content", "textarea" , ".guideRadioButtonGroupItems", "input", "select", "button"];
                for (var i = 0; i < widgetTypes.length; i++) {
                    if (elementDivObject.find(widgetTypes[i]).length > 0) {
                        return elementDivObject.find(widgetTypes[i]);
                    }
                }
            },

            //This function is triggered on preview button click in styling tab for panels.
            //It applies the inline style properties on all the parts of the panel.
            handlePreviewOfInlineStylesForPanels : function () {
                var dialog = this.findParentByType('dialog'),
                    $elementDiv = $(dialog.responseScope.element.dom),
                    $panel = $elementDiv.find(".guidePanelNode").eq(0),
                    $panelDescription = $elementDiv.find('.guidePanelDescription').eq(0),
                    $questionMark = $elementDiv.find(".guideHelpQuestionMark").eq(0),
                    map = {
                        "Panel" : $panel,
                        "PanelDescription" : $panelDescription,
                        "QuestionMark" : $questionMark
                    };

                // previewButtonClicked is the flag required to determine whether the component needs to be refreshed on
                // cancel button click or close mark clicked. the component is refreshed only if preview button was clicked
                // by the author.
                dialog.previewButtonClicked = true;

                _.each(map, function ($el, part) {
                    var field = dialog.getField(part);
                    if (field != null) {
                        if (part === "QuestionMark") {
                            this.previewQuestionMarkStyleProperties(dialog, field, $el);
                        } else {
                            this.applyStyleProperties(dialog, field, $el);
                        }
                    }
                }, guidelib.author.GuideExtJSDialogUtils);

            },

            //this function is triggered on preview button click in styling tab.
            //it applies the inline style properties on all the parts of the component.
            handlePreviewOfInlineStyles : function () {
                var dialog = this.findParentByType('dialog'),
                    $elementDiv = $(dialog.responseScope.element.dom),
                    $field ,
                    $caption,
                    $widget = GuideExtJSDialogUtils.findWidgetDiv($elementDiv),
                    $questionMark = $elementDiv.find(".guideHelpQuestionMark"),
                    $longDescription = $elementDiv.find(".guideFieldDescription.long"),
                    $shortDescription = $elementDiv.find(".guideFieldDescription.short"),
                    classAppliedOnField,
                    componentMap,
                    keyValues;

                //all components field div have class guideFieldNode except image , separator , verify, summary and table component.
                _.find([".guideFieldNode", "img" , " .verify_outer_div", ".summary_component_div", ".guideSeparator"],
                    function (cssClass) {
                        $field = $elementDiv.find(cssClass);
                        return $field.length > 0;
                    });

                //all components caption div has guideFieldLabel class.
                $caption = $elementDiv.find(".guideFieldLabel");

                // previewButtonClicked is the flag required to determine whether the component needs to be refreshed on
                // cancel button click or close mark clicked. the component is refreshed only if preview button was clicked
                // by the author.
                dialog.previewButtonClicked = true;
                componentMap = {
                    "Field" : $field,
                    "Widget" : $widget,
                    "Caption" : $caption,
                    "QuestionMark" : $questionMark,
                    "ShortDescription" : $shortDescription,
                    "LongDescription" : $longDescription
                };

                _.each(componentMap, function ($el, part) {
                    var field = dialog.getField(part);
                    if (field != null && $el && $el.length > 0) {
                        if (part === "QuestionMark") {
                            guidelib.author.GuideExtJSDialogUtils.previewQuestionMarkStyleProperties(dialog, field, $el);
                        } else {
                            guidelib.author.GuideExtJSDialogUtils.applyStyleProperties(dialog, field, $el);
                        }
                    }
                });
            },

            // this function applies style properties given by the author for preview. It is used for all the parts except question mark.
            applyStyleProperties : function (dialog, field, $fieldPart) {
                if ($fieldPart && $fieldPart.length > 0) {
                    $fieldPart.attr("style", "");
                    var partInlineStyles = field.getValue();
                    // partInlineStyles is an array. ex- ["background-color:blue"].
                    // We need partInlineStyles in form of an object to apply it directly as css properties.
                    // To convert this array into object we stringify partInlineStyles and then parse it.
                    partInlineStyles = JSON.stringify(partInlineStyles);
                    partInlineStyles = partInlineStyles.replace(']', '}');
                    partInlineStyles = partInlineStyles.replace('[', '{');
                    partInlineStyles = partInlineStyles.replace(/:/g, '":"');
                    partInlineStyles = JSON.parse(partInlineStyles);
                    $fieldPart.css(partInlineStyles);
                }
            },

            // This function applies style properties to question mark part for preview.
            previewQuestionMarkStyleProperties : function (dialog, field, $questionMark) {
                if ($questionMark && $questionMark.length > 0) {
                    var partInlineStyles = field.getValue(),
                        questionMarkStyleTagContent,
                        questionMarkStyleTagNewContent;
                    partInlineStyles = partInlineStyles.toString();
                    partInlineStyles = partInlineStyles.replace(/,/g, ';');
                    // The style tag will be present only when the author provides style properties
                    // for question mark from the dialog. Otherwise the style tag wont be present
                    // and for preview feature, we would have to introduce the style tag.
                    if ($questionMark.find("style").length > 0) {
                        questionMarkStyleTagContent = $questionMark.find("style").text();
                        questionMarkStyleTagNewContent = questionMarkStyleTagContent.substr(0, questionMarkStyleTagContent.indexOf('{') + 1);
                        questionMarkStyleTagNewContent = questionMarkStyleTagNewContent + partInlineStyles;
                        questionMarkStyleTagNewContent = questionMarkStyleTagNewContent + questionMarkStyleTagContent.substr(questionMarkStyleTagContent.indexOf('}'), questionMarkStyleTagContent.length);
                        $questionMark.find("style").text(questionMarkStyleTagNewContent);
                    } else {
                        var panelDesc = "";
                        if ($questionMark.parent(".guidePanelDescription").length > 0) {
                            panelDesc = ' .guidePanelDescription';
                        }
                        var id = window.guidelib.author.AuthorUtils.getHtmlId(dialog.path),
                            $styleEl = $("<style/>"),
                            questionClass = '#' + id + panelDesc + ' > [data-guide-longDescription]:before {' + partInlineStyles + '}';
                        $styleEl.append(questionClass);
                        $styleEl.appendTo($questionMark);
                    }
                }
            },

            disableEnableTnCApprovalOption : function (field, newValue, oldValue) {
                var dialog = field.findParentByType('dialog'),
                    tmpField = dialog.getField('./showApprovalOption');
                if (oldValue) {
                    tmpField.setValue(true);
                    tmpField.disable();
                } else {
                    tmpField.setValue(true);
                    tmpField.enable();
                }
            },

            disableEnableTnCLinkContent : function (field, newValue, oldValue) {
                var dialog = field.findParentByType('dialog'),
                    tmpField = dialog.getField('./linkText'),
                    contentField = dialog.getField('./tncTextContent');
                if (oldValue) {
                    tmpField.show();
                    contentField.hide();
                } else {
                    tmpField.hide();
                    contentField.show();
                }
            },

            loadPatternType : function (field, selectionIndex) {
                var dialog = field.findParentByType("dialog"),
                    fieldSet = field.findParentByType('fieldset', true),
                    patternTypeField,
                    ind = -1;
                if (fieldSet) {
                    patternTypeField = fieldSet.findByType("selection");
                    patternTypeField = patternTypeField.length ? patternTypeField[selectionIndex]
                        : null;
                    if (patternTypeField) {
                        patternTypeField.options.forEach(function (item, index) {
                            if (item.value === "custom") {
                                ind = index;
                            }
                        });
                        patternTypeField.setValue(field.getValue());
                        if (patternTypeField.getValue() !== field.getValue()) {
                            if (ind === -1) {
                                patternTypeField.options.push(customOption);
                                patternTypeField.setOptions(patternTypeField.options);
                            }
                            patternTypeField.setValue("custom");
                        } else {
                            if (ind !== -1) {
                                patternTypeField.options.splice(ind, 1);
                                patternTypeField.setOptions(patternTypeField.options);
                            }
                        }
                    }
                }
            },

            loadDisplayPatternType : function (field) {
                var dialog = field.findParentByType("dialog"),
                    checkBoxField = dialog ? dialog.getField("./displayIsSameAsValidate") : null;
                GuideExtJSDialogUtils.loadPatternType.apply(this, [field, 0]);
                if (checkBoxField && checkBoxField.getValue().length === 1) {
                    GuideExtJSDialogUtils.makeDisplayAndValidatePatternSame.apply(this, [checkBoxField]);
                }
            },

            loadValidatePatternType : function (field, initial) {
                var dialog = field.findParentByType("dialog"),
                    checkBoxField = dialog.getField("./displayIsSameAsValidate");
                if (initial && checkBoxField && checkBoxField.getValue().length === 1) {
                    GuideExtJSDialogUtils.makeDisplayAndValidatePatternSame.apply(this, [checkBoxField]);
                } else {
                    GuideExtJSDialogUtils.loadPatternType.apply(this, [field, 1]);
                }
            },

            loadSubmitOptions : function (field, guideDataModel) {
                var dialog = field.findParentByType('dialog');
                var submitActionSelect = dialog.getField('./actionType');
                if (typeof field.getValue() !== 'undefined' && field.getValue() !== null && field.getValue() !== '') {
                    submitActionSelect.changeOptions(guideDataModel, true);
                }
            },

            enableFormPortalSubmit : function (field) {
                var dialog = field.findParentByType('dialog'),
                    enablePortalSubmit = dialog.getField('./enablePortalSubmit');
                if (enablePortalSubmit) {
                    // Check for portal submit, if its already the intended action, there is no need of resubmitting it
                    // to portal, hence this checkbox should be set to false and hidden
                    if (field.getValue() === "/libs/fd/fp/components/actions/portalsubmit") {
                        enablePortalSubmit.setValue(false);
                        enablePortalSubmit.hide();
                    } else {
                        enablePortalSubmit.show();
                    }
                }
            },

            loadAFSourceTab : function () {
                var dialog, tabPanel, existingAfField, afPathField, thankYouTab, submitTab;
                dialog = field.findParentByType('dialog');
                tabPanel = field.findParentByType('tabpanel');
                existingAfField = dialog.getField('./useExistingAF');
                afPathField = dialog.getField('./guideRef');
                thankYouTab = tabPanel.getComponent("thankYouTab");
                submitTab = tabPanel.getComponent("submitActionsTab");
                if (!existingAfField.value) {
                    existingAfField.setValue(true);
                    afPathField.show();
                    thankYouTab.disable();
                    submitTab.disable();
                } else {
                    afPathField.hide();
                    existingAfField.setValue(false);
                    thankYouTab.enable();
                    submitTab.enable();
                }

            },

            disableMultiSelection : function (field) {
                var dialog = field.findParentByType('dialog'),
                    multiSelectCheckBox = dialog.getField('./multiSelect'),
                    authoringConfigJson = $(".guideContainerWrapperNode").data("guideAuthoringconfigjson");
                if (authoringConfigJson.xdpRef && field.getValue() !== '') {
                    multiSelectCheckBox.disable();
                }
            },

            AFSourceSelectionListener : function (field, oldValue, newValue) {
                var dialog, tabPanel, existingAfField, afPathField, thankYouTab, submitTab;
                dialog = field.findParentByType('dialog');
                tabPanel = field.findParentByType('tabpanel');
                existingAfField  = dialog.getField('./useExistingAF');
                afPathField = dialog.getField('./guideRef');
                thankYouTab = tabPanel.getComponent("thankYouTab");
                submitTab = tabPanel.getComponent("submitActionsTab");
                if (newValue) {
                    existingAfField.setValue(true);
                    afPathField.show();
                    thankYouTab.disable();
                    submitTab.disable();
                } else {
                    afPathField.hide();
                    afPathField.setValue("");
                    existingAfField.setValue(false);
                    thankYouTab.enable();
                    submitTab.enable();
                }
            },

            bindRefField : {
                bindRefFlag : false,
                setBindRefFlag : function (bindRef) {
                    GuideExtJSDialogUtils.bindRefField.bindRefFlag = bindRef;
                },

                disableBindRefField : function (field) {
                    if (!GuideExtJSDialogUtils.bindRefField.bindRefFlag) {
                        field.disable();
                    }
                }
            },

            scribbleAspectRatio : {
                toggleFieldDisplay : function (field) {
                    var dialog,bindRefField,aspectRatioField;
                    dialog = field.findParentByType('dialog');
                    bindRefValue = dialog.getField('./bindRef').getValue();
                    aspectRatioField = dialog.getField('./aspectRatio');
                    /* checking for xfa fields since if its' binded to non-xfa fields we don't
                       have to disable the aspect ratio.  */
                    if (bindRefValue.indexOf('xfa') > -1) {
                        aspectRatioField.disable();
                        if (field.getValue().toString().length == 0) {
                            field.hide();
                        }
                    } else {
                        if (field.getValue().toString().length > 0) {
                            aspectRatioField.disable();
                        } else {
                            aspectRatioField.enable();
                            field.hide();
                        }
                    }
                }
            },

            verifyInteractiveField : {
                interactiveFlag : false,
                setInteractiveFlag : function (isValidDOR) {
                    GuideExtJSDialogUtils.verifyInteractiveField.interactiveFlag = isValidDOR;
                },

                handleInteractiveOption : function (field) {
                    if (!GuideExtJSDialogUtils.verifyInteractiveField.interactiveFlag) {
                        field.disable();
                    }
                }
            },

            //colspan option is available in dialog for panels and fields only if there parent Panel has gridFluidLayout
            handleColspan : function () {
                var dialog = this.findParentByType("dialog"),
                       panelId = guidelib.author.AuthorUtils.getHtmlId(dialog.path),
                       parentPanelId = guidelib.author.AuthorUtils.getParentId(panelId),
                       $parentPanel = $("#" + parentPanelId);
                if ($parentPanel.length > 0) {
                    var authoringConfig = $parentPanel.data("guideAuthoringconfigjson");
                    if (authoringConfig && authoringConfig.nonNavigable && authoringConfig.nonNavigable === true) {
                        this.show();
                        return;
                    }
                }
                this.hide();
            },

            setNewColspan : function (context, newValue) {
                var dialog = context.findParentByType("dialog"),
                    nodeId = guidelib.author.AuthorUtils.getHtmlId(dialog.path),
                    $node = $("#" + nodeId);
                $node.attr("data-newcolspan", newValue);
            },

            changeFracAndLeadDigitFieldsOnLoad : function (field) {
                var value = field.value;
                if (value != decimal) {
                    var dialog = field.findParentByType('dialog');
                    dialog.getField('./leadDigits').hide();
                    dialog.getField('./fracDigits').hide();
                }
            },

            changeFracAndLeadDigitFieldsOnFieldChange : function (field, value) {
                var dialog = field.findParentByType('dialog');
                if (value == 'decimal') {
                    dialog.getField('./leadDigits').show();
                    dialog.getField('./fracDigits').show();
                } else {
                    dialog.getField('./leadDigits').hide();
                    dialog.getField('./fracDigits').hide();
                }
            },

            showHideCompletion : function (field) {
                var dialog =  field.findParentByType('dialog'),
                    scriptArea = GuideExtJSDialogUtils.findScriptAreaInDialog(dialog, './completionExp');
                // checking if the layout selected is a wizard layout
                if (scriptArea != null) {
                    if (guidelib.author.GuideExtJSDialogUtils.isWizardLayoutMap.indexOf(field.getValue()) > -1) {
                        scriptArea.show();
                    } else {
                        scriptArea.hide();
                    }
                }
            },

            // finding the field in the xtype
            findScriptAreaInDialog : function (dialog, fieldName) {
                return (_.find(dialog.find("name", fieldName), function (val) {
                    return val.xtype == "guideMultiLineScriptArea" ;
                }));
            },

            //to populate the layout options gridFluidLayout/wizard/accordian in the dropdown
            loadPanelLayoutOptions : function () {
                var optionsJson = [];
                $.ajax({
                     type : "GET",
                     url : CQ.HTTP.externalize("/libs/fd/af/components/info.json?type=layout&layoutType=fd/af/layouts/panel"),
                     dataType : "json",
                     async : false
                 }).done(function (data) {
                     var index = 0;
                     data.forEach(function (obj) {
                         //--mapping /layout/sling:resourceType value to true/false if its' wizard Layout
                         if (obj.guideNavigatorTab === "wizard-tab") {
                             guidelib.author.GuideExtJSDialogUtils.isWizardLayoutMap[index++] = obj.value;
                         }
                     });
                     optionsJson = data;
                 });
                return optionsJson;
            },

            /*
             * TODO: Should go to eligibility exp
             * Show eligibility expression if lazy loading is enabled
             */
            calculateEligibilityExpVisibility : function (field) {
                var dialog =  field.findParentByType('dialog');
                if (field.getValue() === "yes") {
                    dialog.getField('./eligibilityExp').show();
                } else {
                    dialog.getField('./eligibilityExp').hide();
                }

            },
            /**
             * Shows or hides any Field with give fieldName based on condition
             * @param field
             * @param fieldName
             * @param showCondition
             */
            showOrHideFieldBasedOnCondition : function (field, fieldName, showCondition) {
                var dialog =  field.findParentByType('dialog');
                if (showCondition) {
                    dialog.getField(fieldName).show();
                } else {
                    var  fieldNameModel = dialog.getField(fieldName);
                    fieldNameModel.setValue("");
                    fieldNameModel.hide();
                }

            },

            /**
             * Assuming that this function is only called for fields that store path values
             * This function would setValue of a path to relative value if an absolute value is present
             * @param field
             */
            sanitizeFieldPath : function (field) {
                var valueforThisfield, PATH_LENGHT_FOR_APPS_OR_LIBS = 6;
                // this second agrument
                // stores the json data
                // so using the same for getting data
                try {
                    // the ninja way of getting the value for this field :(
                    valueforThisfield = arguments[1].get(this.name);
                    if (_.isString(valueforThisfield) && valueforThisfield.indexOf("/") === 0) {
                        // remove /apps or /libs
                        valueforThisfield = valueforThisfield.substring(PATH_LENGHT_FOR_APPS_OR_LIBS);
                        // remove the LAYOUT.jsp at the end ( the prevoius value was /libs/fd/af/bla/bla.jsp)
                        // current value is fd/af/bla
                        valueforThisfield = valueforThisfield.substring(0, valueforThisfield.lastIndexOf("/"));
                        field.setValue(valueforThisfield);
                    }

                } catch (exception) {
                    if (console) {
                        console.warn(exception);
                    }
                }

            },

            setDefaultStorePath : function (field) {
                var storePath = field.getValue();
                var dialog = this.findParentByType('dialog');
                if (typeof(storePath) == 'undefined' || storePath.length == 0) {
                    var pagePath = dialog.path;
                    var pageIndex = pagePath.indexOf("jcr:content/guideContainer");
                    var pos = pagePath.indexOf('/', 1);
                    var path = pagePath.substring(0, pos + 1) + "usergenerated/content" + pagePath.substring(pos, pageIndex - 1) + "/*";
                    field.setValue(path);
                }
            },

            addListenersBeforeSubmitForDialog : function () {
                var dialog = this.findParentByType('dialog');
                dialog.on('beforesubmit', function () {
                    guidelib.author.GuideExtJSDialogUtils.storeMultiLineScriptValues.apply(this, arguments);
                });
            },

            storeMultiLineScriptValues : function () {
                this.findByType("guideMultiLineScriptArea").forEach(function (obj) {
                    obj.saveValue();
                });
            },

            //function to handle change of chart type selection
            handleChartTypeSelection : function () {
                var currentSelection = this.getValue(),
                    dialog = this.findParentByType('dialog'),
                    innerRadius = dialog.getField('./innerRadius'),
                    lineColor = dialog.getField('./lineColor'),
                    pointColor = dialog.getField('./pointColor'),
                    areaColor = dialog.getField('./areaColor'),
                    tooltipHtml = dialog.getField('./tooltipHtml'),
                    xAxisTitle = dialog.getField('./xAxisTitle'),
                    yAxisTitle = dialog.getField('./yAxisTitle'),
                    legends = dialog.findById('legends'),
                    legendNote = dialog.findById('legendsNoteLabel'),
                    tooltipNote = dialog.findById('tooltipNoteLabel');
                innerRadius.hide();
                lineColor.hide();
                pointColor.hide();
                areaColor.hide();
                if (currentSelection === CHART_TYPE.DONUT) {
                    innerRadius.show();
                } else if (currentSelection === CHART_TYPE.LINE) {
                    lineColor.show();
                } else if (currentSelection === CHART_TYPE.POINT) {
                    pointColor.show();
                } else if (currentSelection === CHART_TYPE.LINE_POINT) {
                    lineColor.show();
                    pointColor.show();
                } else if (currentSelection === CHART_TYPE.AREA) {
                    lineColor.show();
                    areaColor.show();
                }

                if (GuideUtil.isChartLegendApplicable(currentSelection)) {
                    legends.show();
                    legendNote.hide();
                } else {
                    legends.hide();
                    legendNote.show();
                }

                if (GuideUtil.isChartTooltipApplicable(currentSelection)) {
                    tooltipHtml.show();
                    tooltipNote.hide();
                } else {
                    tooltipHtml.hide();
                    tooltipNote.show();
                }

                if (GuideUtil.isChartAxisTitleApplicable(currentSelection)) {
                    xAxisTitle.show();
                    yAxisTitle.show();
                } else {
                    xAxisTitle.hide();
                    yAxisTitle.hide();
                }
            },

            //function to handle x/y axis use function selection
            handleUseFunction : function (args) {
                var currentSelection = this.getValue(),
                    dialog = this.findParentByType('dialog'),
                    reducerX = dialog.getField('./reducerXFunction'),
                    reducerY = dialog.getField('./reducerYFunction');
                if (args[0] === 'X' && currentSelection !== 'none') {
                    reducerY.setValue('none');
                } else if (args[0] === 'Y' && currentSelection !== 'none') {
                    reducerX.setValue('none');
                }
            },

            //function to handle x/y axis use function selection on load
            handleUseFunctionLoad : function (args) {
                var dialog = this.findParentByType('dialog'),
                    reducerX = dialog.getField('./reducerXFunction'),
                    reducerY = dialog.getField('./reducerYFunction');
                if (args[0] === 'X' && reducerX.getValue() !== 'none') {
                    reducerY.setValue('none');
                } else if (args[0] === 'Y' && reducerY.getValue() !== 'none') {
                    reducerX.setValue('none');
                }
            },

            //function to show xsdRef Field or xdpRef Field based on the selected form model value
            handleFormModelChange : function () {
                var dialog = this.findParentByType("dialog"),
                    xsdRefField = dialog.getField("xsdRef"),
                    xdpRefField = dialog.getField("xdpRef"),
                    currentSelection = this.getValue();
                if (currentSelection.length > 0 && currentSelection == "formtemplates") {
                    xdpRefField.show();
                    xsdRefField.hide();
                } else if (currentSelection.length > 0 && currentSelection == "xmlschema") {
                    xsdRefField.show();
                    xdpRefField.hide();
                } else {
                    xsdRefField.hide();
                    xdpRefField.hide();
                }
            },

            //function to show/ hide advanced legend options
            handleLegendSelection : function () {
                var currentSelection = this.getValue(),
                    dialog = this.findParentByType('dialog'),
                    legendPosition = dialog.getField('./legendPosition');
                legendPosition.hide();
                if (currentSelection.length > 0 && currentSelection[0] === 'true') {
                    legendPosition.show();
                }
            },

            // function to be called on load of metadata selector radio button in autosave, submit actions tab as well as save button's script tab
            onLoadMetadataSourceRadio : function () {
                var dialog = this.findParentByType("dialog"),
                    metadata = dialog.getField(this.metadatafieldname),
                    selector  = dialog.getField(this.name);
                // On first load, to maintain backward compatibility if author had already filled metadata (in such cases selector's value would not be set at all), we need to set selector's value as "local"
                if (selector == '' || selector.value === 'local') {
                    metadata.show();
                    selector.setValue('local');
                }else {
                    metadata.hide();
                    selector.setValue('global');
                }
            },

            // callback on change of metadata selector radio button in autosave, submit actions tab as well as save button's script tab
            handleMetadataSourceSelection : function (field, value) {
                var dialog = field.findParentByType("dialog"),
                    metadata = dialog.getField(field.metadatafieldname),
                    selector  = dialog.getField(field.name);
                if (value === 'local') {
                    metadata.show();
                }else {
                    metadata.hide();
                }
                selector.setValue(value);
            }
        };
}(jQuery, guidelib, _));
