/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2016 Adobe Systems Incorporated
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

(function ($, author, guidetouchlib, undefined) {

    var ADOBESIGN_NS = guidetouchlib.adobesign = guidetouchlib.adobesign || {},
        DIALOG_UTILS = guidetouchlib.editLayer.dialogUtils,
        SIGN_FIELD_AUTOCOMPLETE_SELECTOR = 'coral-autocomplete.signFieldAutocomplete',
        SIGN_BLOCK_AUTOCOMPLETE_SELECTOR = 'coral-autocomplete.signBlockAutocomplete',
        SIDE_PANEL_SIGNER_SELECTOR = '.js-SidePanel-content--signer',
        SIDE_PANEL_TITLE = '.signerSidePanelTitle',
        SIDE_PANEL_SIGNER_SELECTOR_PATH = "/libs/fd/af/authoring/content/signerConfigSidePanel.html",
        SIDE_PANEL_SIGNER_SUBMIT_SELECTOR = '.signerSidePanelSubmit',
        SIDE_PANEL_SIGNER_CANCEL_SELECTOR = '.signerSidePanelCancel',
        SIDE_PANEL_EDIT_SELECTOR = ".js-SidePanel-content--edit",
        ENABLE_ADOBE_SIGN = 'coral-checkbox[name="./_useSignedPdf"]',
        FIRST_SIGNER_TABLE = '.firstSignerTable',
        SIGNER_TABLE = '.signerTable',
        SIGNER_NAME = '.signerName',
        EDIT_BUTTON = '.signerEditButton',
        DRAG_BUTTON = '.signerDragButton',
        DELETE_BUTTON = '.signerDeleteButton',
        ADD_BUTTON = '.signerAddButton',
        SIGNER_ROW = '.signerRow',
        SIGNER = '.signer',
        SIGN_FIELD = '.signField',
        FIRST_SIGNER_FORM_FILLER = 'coral-radio[name="firstSignerFormFiller"]',
        FORM_FILLER_CHECK = 'coral-checkbox[name="./signerInfo/firstSignerFormFiller"]',
        WORKFLOW_TYPE = 'coral-select[name="./signerInfo/workflowType"]',
        SIGNER_NUMBER = 'coral-numberinput[name="signerNumber"]',
        DELETE_SIGN = '[name="sign@Delete"]',
        DELETE_FIELD = '.deleteField',
        SIGNER_PREFIX = './signerInfo/signer',
        SIGN_FIELD_PREFIX = '/signField',
        DELETE = '@Delete',
        FIELD_NAME = '/name',
        FIELD_SOM = '/som',
        SIGN_FIELD_NAME_SELECTOR = '.signFieldName',
        SIGN_FIELD_SOM_SELECTOR = '.signFieldSom',
        SIGNATURE_CONFIG = '.signatureConfiguration',
        NAME_ATTR = '[name="',
        SIGNER_TITLE = '/signerTitle',
        SIGNER_EMAIL_SOURCE = '/emailSource',
        SIGNER_EMAIL = '/email',
        SIGNER_SECURITY = '/securityOption',
        SIGNER_COUNTRY_SOURCE = '/countryCodeSource',
        SIGNER_COUNTRY = '/countryCode',
        SIGNER_PHONE_SOURCE = '/phoneSource',
        SIGNER_PHONE = '/phone',
        ATTR_POST = '"]',
        NAME_ATTR_ENDS_WITH = '[name$="',
        NAME = 'name',
        VALUE = 'value';

    DIALOG_UTILS.closeSignerSidePanel = function () {
        $(SIDE_PANEL_SIGNER_SELECTOR).hide();
        $(SIDE_PANEL_EDIT_SELECTOR).show();
    };

    DIALOG_UTILS.saveSignerSidePanel = function () {
        var signerConfig = {},
            $signerSidePanel = $(SIDE_PANEL_SIGNER_SELECTOR),
            formFillerYes = $signerSidePanel.find(FIRST_SIGNER_FORM_FILLER)[0],
            signerNumber = $signerSidePanel.find(SIGNER_NUMBER)[0].value,
            emailAF = $signerSidePanel.find('coral-autocomplete[name="emailField"]')[0].value,
            email = $signerSidePanel.find('[name="email"]')[0].value,
            countryCodeAF = $signerSidePanel.find('coral-autocomplete[name="countryCodeField"]')[0].value,
            countryCode = $signerSidePanel.find('[name="countryCode"]')[0].value,
            phoneAF = $signerSidePanel.find('coral-autocomplete[name="phoneField"]')[0].value,
            phone = $signerSidePanel.find('[name="phone"]')[0].value,
            signFields = $signerSidePanel.find('coral-autocomplete[name="signFields"]')[0].values,
            $signerRow,
            fields = [];

        signerConfig.signerTitle = $signerSidePanel.find('[name="signerTitle"]')[0].value;
        signerConfig.emailSource = $signerSidePanel.find('coral-select[name="emailSource"]')[0].value;
        signerConfig.securityOption = $signerSidePanel.find('coral-select[name="securityOption"]')[0].value;
        signerConfig.countryCodeSource = $signerSidePanel.find('coral-select[name="countryCodeSource"]')[0].value;
        signerConfig.phoneSource = $signerSidePanel.find('coral-select[name="phoneSource"]')[0].value;

        if (signerNumber == 0) {
            $signerRow = $(FIRST_SIGNER_TABLE).find(SIGNER_ROW);
            $(FORM_FILLER_CHECK)[0].checked = formFillerYes.checked;
        } else {
            $signerRow = $($(SIGNER_TABLE).find(SIGNER_ROW)[signerNumber - 1]);
        }

        $signerRow.find(SIGNER_NAME).value = signerConfig.signerTitle;
        if (signerConfig.emailSource === 'form') {
            signerConfig.email = emailAF;
        } else if (signerConfig.emailSource === 'typed') {
            signerConfig.email = email;
        } else {
            signerConfig.email = "";
        }

        if (signerConfig.countryCodeSource === 'form') {
            signerConfig.countryCode = countryCodeAF;
        } else if (signerConfig.countryCodeSource === 'typed') {
            signerConfig.countryCode = countryCode;
        }

        if (signerConfig.phoneSource === 'form') {
            signerConfig.phone = phoneAF;
        } else if (signerConfig.phoneSource === 'typed') {
            signerConfig.phone = phone;
        }

        DIALOG_UTILS.updateSigner($signerRow, signerConfig);
        if (signFields && signFields.length > 0) {
            _.each(signFields, function (signField, index) {
                fields.push(JSON.parse(signField));
            });
        }
        DIALOG_UTILS.loadSignFields($signerRow, fields);
        DIALOG_UTILS.closeSignerSidePanel();
        DIALOG_UTILS.fireSignerChange();
    };

    DIALOG_UTILS.loadSignerConfig = function (event) {
        var $signerRow = $(this).parents(SIGNER_ROW),
            registerEvents = false;
        // first time html is going to be fetched
        if ($(SIDE_PANEL_SIGNER_SELECTOR).length === 0) {
            registerEvents = true;
        }
        event.stopPropagation();
        author.ui.SidePanel.loadContent({
            selector : SIDE_PANEL_SIGNER_SELECTOR,
            path : SIDE_PANEL_SIGNER_SELECTOR_PATH
        }).then(function () {
            var $signerSidePanel = $(SIDE_PANEL_SIGNER_SELECTOR);

            //  author.ui.SidePanel.close(true);
            author.ui.SidePanel.showContent(SIDE_PANEL_SIGNER_SELECTOR);

            // Make sure the sidepanel is open
            author.ui.SidePanel.open(true);

            $signerSidePanel.show();

            if (registerEvents) {
                Coral.commons.ready(SIDE_PANEL_SIGNER_SELECTOR, function () {
                    DIALOG_UTILS.initializeSignerPanel($signerSidePanel);
                    /* Initialize the signer configuration*/
                    DIALOG_UTILS.initializeSignerInformation($signerRow, $signerSidePanel);
                });
            } else {
                /* Initialize the signer configuration*/
                DIALOG_UTILS.initializeSignerInformation($signerRow, $signerSidePanel);
            }
        });
    };

    DIALOG_UTILS.initializeSignerInformation = function ($source, $destination) {
        var signerNumber = $source.find(SIGNER_NUMBER)[0].value,
            $formFiller = $destination.find(FIRST_SIGNER_FORM_FILLER),
            titleField = $destination.find('[name="signerTitle"]')[0],
            signerNumberField = $destination.find(SIGNER_NUMBER)[0],
            emailSourceField = $destination.find('coral-select[name="emailSource"]')[0],
            emailAFField = $destination.find('coral-autocomplete[name="emailField"]')[0],
            emailField = $destination.find('[name="email"]')[0],
            securityOptionField = $destination.find('coral-select[name="securityOption"]')[0],
            countryCodeSourceField = $destination.find('coral-select[name="countryCodeSource"]')[0],
            countryCodeAFField = $destination.find('coral-autocomplete[name="countryCodeField"]')[0],
            countryCodeField = $destination.find('[name="countryCode"]')[0],
            phoneSourceField = $destination.find('coral-select[name="phoneSource"]')[0],
            phoneAFField = $destination.find('coral-autocomplete[name="phoneField"]')[0],
            phoneField = $destination.find('[name="phone"]')[0],
            signFields = $destination.find('coral-autocomplete[name="signFields"]')[0],
            formFiller = $(FORM_FILLER_CHECK)[0].checked,
            title = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_TITLE + ATTR_POST)[0].value,
            emailSource = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_EMAIL_SOURCE + ATTR_POST)[0].value,
            email = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_EMAIL + ATTR_POST)[0].value,
            securityOption = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_SECURITY + ATTR_POST)[0].value,
            countryCodeSource = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_COUNTRY_SOURCE + ATTR_POST)[0].value,
            countryCode = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_COUNTRY + ATTR_POST)[0].value,
            phoneSource = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_PHONE_SOURCE + ATTR_POST)[0].value,
            phone = $source.find(NAME_ATTR_ENDS_WITH + SIGNER_PHONE + ATTR_POST)[0].value,
            $signFields = $source.find(SIGN_FIELD);

        DIALOG_UTILS.populateAfFieldAutocomplete($destination.find('.afFieldAutocomplete'),
            ADOBESIGN_NS.config.afFields);

        titleField.value = title;

        signerNumberField.value = signerNumber;
        if (signerNumber != 0) {
            // option yes
            $formFiller[0].checked = false;
            $formFiller[0].disabled = true;
            // option no
            $formFiller[1].checked = true;
            $formFiller[1].disabled = true;
        } else {
            if (formFiller) {
                $formFiller[0].checked = true;
                $formFiller[1].checked = false;
            } else {
                $formFiller[0].checked = false;
                $formFiller[1].checked = true;
            }
            $formFiller[0].disabled = false;
            $formFiller[1].disabled = false;
        }

        DIALOG_UTILS.firstSignerFormFillerChange({matchedTarget : $formFiller[0]});

        DIALOG_UTILS.setSelected(emailSourceField, emailSource);
        DIALOG_UTILS.sourceChange({matchedTarget : emailSourceField});
        DIALOG_UTILS.removeAllSelections(emailAFField);
        if (emailSource === 'form') {
            DIALOG_UTILS.setSelected(emailAFField, email);
            DIALOG_UTILS.afFieldAutocompleteChange({matchedTarget : emailAFField});
        } else if (emailSource === 'typed') {
            emailField.value = email;
        }

        DIALOG_UTILS.setSelected(securityOptionField, securityOption);
        DIALOG_UTILS.showHidePhoneFields({matchedTarget : securityOptionField});

        DIALOG_UTILS.setSelected(countryCodeSourceField, countryCodeSource);
        DIALOG_UTILS.sourceChange({matchedTarget : countryCodeSourceField});
        DIALOG_UTILS.removeAllSelections(countryCodeAFField);
        if (countryCodeSource === 'form') {
            DIALOG_UTILS.setSelected(countryCodeAFField, countryCode);
            DIALOG_UTILS.afFieldAutocompleteChange({matchedTarget : countryCodeAFField});
        } else if (countryCodeSource === 'typed') {
            countryCodeField.value = countryCode;
        }

        DIALOG_UTILS.setSelected(phoneSourceField, phoneSource);
        DIALOG_UTILS.sourceChange({matchedTarget : phoneSourceField});
        DIALOG_UTILS.removeAllSelections(phoneAFField);
        if (phoneSource === 'form') {
            DIALOG_UTILS.setSelected(phoneAFField, phone);
            DIALOG_UTILS.afFieldAutocompleteChange({matchedTarget : phoneAFField});
        } else if (phoneSource === 'typed') {
            phoneField.value = phone;
        }

        if (ADOBESIGN_NS.config.fetchSignFields) {
            var selectedItems = [];
            if ($signFields.length > 0) {
                _.each($signFields, function (signField) {
                    var $field = $(signField),
                        field_name = $field.find(SIGN_FIELD_NAME_SELECTOR)[0].value,
                        field_som = $field.find(SIGN_FIELD_SOM_SELECTOR)[0].value;
                    selectedItems.push(JSON.stringify({som : field_som, name : field_name}));
                });
            }
            if (ADOBESIGN_NS.config.adobeSignFields && ADOBESIGN_NS.config.adobeSignFields.length > 0) {
                DIALOG_UTILS.addSignFieldAutocompleteItems(ADOBESIGN_NS.config.adobeSignFields, selectedItems);
            }
        }
    };

    DIALOG_UTILS.workflowTypeChange = function (event) {
        var $signatureConfiguration = $(SIGNATURE_CONFIG),
            workflowType = $signatureConfiguration.find(WORKFLOW_TYPE)[0];
        if (workflowType.value === 'PARALLEL') {
            $signatureConfiguration.addClass('parallelSigning');
        } else {
            $signatureConfiguration.removeClass('parallelSigning');
        }
    };

    DIALOG_UTILS.enableAdobeSignChanged = function (event) {
        var $signatureConfiguration = $(SIGNATURE_CONFIG),
            enableAdobeSignField = $(ENABLE_ADOBE_SIGN)[0],
            signConfigField = $signatureConfiguration.find('coral-select[name="./signerInfo/signConfigPath"]')[0],
            workflowTypeField = $signatureConfiguration.find(WORKFLOW_TYPE)[0],
            submitActionType = DIALOG_UTILS.selectElement("coral-select", './actionType')[0],
            $firstSignerTable,
            $row;
        if (enableAdobeSignField.checked) {
            $signatureConfiguration.removeClass('signDisabled');
            signConfigField.required = true;
            workflowTypeField.required = true;
            $firstSignerTable = $(FIRST_SIGNER_TABLE);
            // add first signer if not already there
            if ($firstSignerTable.find(SIGNER_ROW).length === 0) {
                $row = $(ADOBESIGN_NS.signerRowTemplate);
                $firstSignerTable.find("tbody").append($row);
                $row.find(EDIT_BUTTON)[0].on('click', DIALOG_UTILS.loadSignerConfig);
                DIALOG_UTILS.loadFirstSigner();
            }
            if (!(typeof $(submitActionType.selectedItem).data('submitservice') === 'string')) {
                submitActionType.invalid = true;
            } else {
                submitActionType.invalid = false;
            }
            _.each(submitActionType.items.getAll(), function (item) {
                if (!(typeof $(item).data('submitservice') === 'string')) {
                    item.disabled = true;
                }
            });
        } else {
            $signatureConfiguration.addClass('signDisabled');
            signConfigField.required = false;
            workflowTypeField.required = false;
            submitActionType.invalid = false;
            _.each(submitActionType.items.getAll(), function (item) {
                item.disabled = false;
            });
        }
        DIALOG_UTILS.renderSubDialog("submitAction");
    };

    DIALOG_UTILS.loadSignerTable = function () {
        var enableAdobeSignField = $(ENABLE_ADOBE_SIGN)[0],
            $firstSignerTable = $(FIRST_SIGNER_TABLE),
            $firstSignerRow = $firstSignerTable.find(SIGNER_ROW).first(),
            signerDragButton = $firstSignerRow.find(DRAG_BUTTON)[0],
            signerName = $firstSignerRow.find(SIGNER_NAME)[0],
            editButton = $firstSignerRow.find(EDIT_BUTTON)[0],
            $signerTable = $(SIGNER_TABLE),
            signField = $(SIGN_FIELD)[0],
            deleteSign = $(DELETE_SIGN)[0],
            workflowType = $(WORKFLOW_TYPE)[0];
        signerName.setAttribute('variant', 'quiet');
        signerName.setAttribute('readOnly', true);
        signerDragButton.setAttribute('coral-table-roworder', true);
        ADOBESIGN_NS.signerRowTemplate = $firstSignerRow[0].outerHTML;
        ADOBESIGN_NS.signFieldTemplate = signField.outerHTML;
        ADOBESIGN_NS.deleteSignTemplate = deleteSign.outerHTML;
        DIALOG_UTILS.workflowTypeChange();
        DIALOG_UTILS.enableAdobeSignChanged();
        workflowType.on('change', DIALOG_UTILS.workflowTypeChange);
        enableAdobeSignField.on('change', DIALOG_UTILS.enableAdobeSignChanged);
        editButton.on('click', DIALOG_UTILS.loadSignerConfig);
        $signerTable.on('coral-table:roworder', DIALOG_UTILS.rowReorder);
        DIALOG_UTILS.loadSignerInfo();
    };

    DIALOG_UTILS.rowReorder = function () {
        window.setTimeout(function () {
            DIALOG_UTILS.updateSignerIndexes();
            DIALOG_UTILS.fireSignerChange();
        }, 1);
    };

    DIALOG_UTILS.setDefaultFirstSignerTitle = function () {
        var $firstSigner = $(FIRST_SIGNER_TABLE).find(SIGNER_ROW),
            signerTitle = CQ.I18n.get("Signer One");
        if ($firstSigner.length > 0) {
            $firstSigner.find(SIGNER_NAME)[0].value = signerTitle;
            $firstSigner.find(NAME_ATTR_ENDS_WITH + SIGNER_TITLE + ATTR_POST)[0].value = signerTitle;
        }
    };

    DIALOG_UTILS.loadSignerRows = function () {
        var signerInfo = ADOBESIGN_NS.config.signerInfo,
            signers;
        if (signerInfo) {
            signers = DIALOG_UTILS.getMemberObjects(signerInfo);
            // signer count minus one, as first signer is mandatory
            ADOBESIGN_NS.signerInitialCount = signers.length - 1;
            if (ADOBESIGN_NS.signerInitialCount < 0) {
                DIALOG_UTILS.loadFirstSigner();
            }
            if (ADOBESIGN_NS.signerInitialCount >= 0) {
                DIALOG_UTILS.loadFirstSigner(signers[0]);
            }
            if (ADOBESIGN_NS.signerInitialCount >= 1) {
                for (var i = 1; i <= ADOBESIGN_NS.signerInitialCount; i++) {
                    DIALOG_UTILS.addSigner(function (signerConfig) {
                        DIALOG_UTILS.loadSigner(this, signerConfig);
                    }, [signers[i]]);
                }
            }
        } else {
            DIALOG_UTILS.loadFirstSigner();
        }
    };

    DIALOG_UTILS.loadSigner = function ($el, signerConfig) {
        var signFields = [];
        signFields = DIALOG_UTILS.getMemberObjects(signerConfig);
        DIALOG_UTILS.updateSigner($el, signerConfig);
        DIALOG_UTILS.loadSignFields($el.find(SIGNER), signFields);
    };

    DIALOG_UTILS.loadFirstSigner = function (signerConfig) {
        var $firstSignerRow = $(FIRST_SIGNER_TABLE).find(SIGNER_ROW).first(),
            signFields;
        if ($firstSignerRow.length !== 0) {
            DIALOG_UTILS.updateSignerIndex($firstSignerRow, 0, 0);
            if (signerConfig) {
                signFields = DIALOG_UTILS.getMemberObjects(signerConfig);
                DIALOG_UTILS.updateSigner($firstSignerRow, signerConfig);
                DIALOG_UTILS.loadSignFields($firstSignerRow.find(SIGNER), signFields);
            } else {
                DIALOG_UTILS.setDefaultFirstSignerTitle();
            }
        }
    };

    DIALOG_UTILS.updateSignerIndexes = function (signFieldCount) {
        var $signerRows = $(SIGNER_TABLE).find(SIGNER_ROW);
        if ($signerRows.length > 0) {
            _.each($signerRows, function (signerRow, index) {
                DIALOG_UTILS.updateSignerIndex($(signerRow), index + 1, signFieldCount);
            });
        }
    };

    DIALOG_UTILS.updateSignerIndex = function ($el, signerIndex, signFieldCount) {
        var elSignFieldCount = ADOBESIGN_NS.signFieldCount,
            signerNumberField = $el.find(SIGNER_NUMBER)[0],
            signerNumber = signerNumberField.value,
            originalPrefix = NAME_ATTR + SIGNER_PREFIX + signerNumber,
            prefix = SIGNER_PREFIX + signerIndex,
            $signFieldNames = $el.find(SIGN_FIELD_NAME_SELECTOR),
            $signFieldSoms = $el.find(SIGN_FIELD_SOM_SELECTOR),
            $deleteSignFields = $el.find(DELETE_FIELD);
        $el.find(originalPrefix + SIGNER_TITLE + ATTR_POST).attr(NAME, prefix + SIGNER_TITLE);
        $el.find(originalPrefix + SIGNER_EMAIL_SOURCE + ATTR_POST).attr(NAME, prefix + SIGNER_EMAIL_SOURCE);
        $el.find(originalPrefix + SIGNER_EMAIL + ATTR_POST).attr(NAME, prefix + SIGNER_EMAIL);
        $el.find(originalPrefix + SIGNER_SECURITY + ATTR_POST).attr(NAME, prefix + SIGNER_SECURITY);
        $el.find(originalPrefix + SIGNER_COUNTRY_SOURCE + ATTR_POST).attr(NAME, prefix + SIGNER_COUNTRY_SOURCE);
        $el.find(originalPrefix + SIGNER_COUNTRY + ATTR_POST).attr(NAME, prefix + SIGNER_COUNTRY);
        $el.find(originalPrefix + SIGNER_PHONE_SOURCE + ATTR_POST).attr(NAME, prefix + SIGNER_PHONE_SOURCE);
        $el.find(originalPrefix + SIGNER_PHONE + ATTR_POST).attr(NAME, prefix + SIGNER_PHONE);

        DIALOG_UTILS.updateFieldIndexes($signFieldNames, signerIndex, signerNumber);
        DIALOG_UTILS.updateFieldIndexes($signFieldSoms, signerIndex, signerNumber);
        DIALOG_UTILS.updateFieldIndexes($deleteSignFields, signerIndex, signerNumber);

        if (signFieldCount > elSignFieldCount && signFieldCount > $signFieldNames.length) {
            // add input delete fields for extra sign fields
            var num = elSignFieldCount > $signFieldNames.length ? elSignFieldCount : $signFieldNames.length;
            for (var i = num; i < signFieldCount; i++) {
                var fieldName = SIGNER_PREFIX + signerIndex + SIGN_FIELD_PREFIX + i + DELETE,
                    $field = $(ADOBESIGN_NS.deleteSignTemplate);
                $field.attr(NAME, fieldName);
                $el.append($field);
            }
        }

        signerNumberField.value = signerIndex;
    };

    DIALOG_UTILS.updateFieldIndexes = function ($fields, index, oldIndex) {
        if ($fields.length > 0) {
            _.each($fields, function (field) {
                DIALOG_UTILS.updateFieldIndex($(field), index, oldIndex);
            });
        }
    };

    DIALOG_UTILS.updateFieldIndex = function ($field, index, oldIndex) {
        var name = $field.attr(NAME);
        name = name.replace(oldIndex, index);
        $field.attr(NAME, name);
    };

    DIALOG_UTILS.updateSigner = function ($el, signerConfig) {
        var signerIndex = $el.find(SIGNER_NUMBER)[0].value,
            prefix = NAME_ATTR + SIGNER_PREFIX + signerIndex,
            $email = $el.find(prefix + SIGNER_EMAIL + ATTR_POST);
        $el.find(SIGNER_NAME)[0].value = signerConfig.signerTitle;
        $el.find(prefix + SIGNER_TITLE + ATTR_POST)[0].value = signerConfig.signerTitle;
        $el.find(prefix + SIGNER_EMAIL_SOURCE + ATTR_POST)[0].value = signerConfig.emailSource;
        $email[0].value = signerConfig.email;
        $el.find(prefix + SIGNER_SECURITY + ATTR_POST)[0].value = signerConfig.securityOption;
        $el.find(prefix + SIGNER_COUNTRY_SOURCE + ATTR_POST)[0].value = signerConfig.countryCodeSource;
        $el.find(prefix + SIGNER_COUNTRY + ATTR_POST)[0].value = signerConfig.countryCode;
        $el.find(prefix + SIGNER_PHONE_SOURCE + ATTR_POST)[0].value = signerConfig.phoneSource;
        $el.find(prefix + SIGNER_PHONE + ATTR_POST)[0].value = signerConfig.phone;
        $email.trigger('change');
    };

    DIALOG_UTILS.updateSignFields = function ($el, signFields) {
        var signFieldCount = signFields.length,
            signerIndex = $el.find(SIGNER_NUMBER)[0].value,
            initialSignFieldCount = ADOBESIGN_NS.signFieldCount,
            fieldNamePre = SIGNER_PREFIX + signerIndex + SIGN_FIELD_PREFIX,
            $removedSignFields = $el.find(SIGN_FIELD);
        if (signFieldCount > 0) {
            _.each(signFields, function (signField, index) {
                var fieldName = fieldNamePre + index,
                    signFieldName = fieldName + FIELD_NAME,
                    signFieldSom = fieldName + FIELD_SOM,
                    $signField,
                    $field;
                if ($el.find(NAME_ATTR + fieldName + DELETE + ATTR_POST).length > 0) {
                    // remove the delete input field if there
                    $el.find(NAME_ATTR + fieldName + DELETE + ATTR_POST).remove();
                }
                if ($el.find(NAME_ATTR + signFieldName + ATTR_POST).length === 0) {
                    // add the sign field if not already present
                    $signField = $(ADOBESIGN_NS.signFieldTemplate);
                    $signField.find(SIGN_FIELD_NAME_SELECTOR).attr(NAME, signFieldName);
                    $signField.find(SIGN_FIELD_SOM_SELECTOR).attr(NAME, signFieldSom);
                    $el.append($signField);
                } else {
                    // unassign old field
                    DIALOG_UTILS.setSignFieldStatus($el.find(NAME_ATTR + signFieldName + ATTR_POST).parents(SIGN_FIELD),
                        false);
                }
                $field = $el.find(NAME_ATTR + signFieldName + ATTR_POST).parents(SIGN_FIELD);
                $field.find(NAME_ATTR + signFieldName + ATTR_POST).attr(VALUE, signField.name);
                $field.find(NAME_ATTR + signFieldSom + ATTR_POST).attr(VALUE, signField.som);
                // assign new field
                DIALOG_UTILS.setSignFieldStatus($field, true);
            });
        }

        if (($removedSignFields.length > 0) && (signFieldCount < $removedSignFields.length)) {
            // remove extra sign fields
            for (var i = signFieldCount; i < $removedSignFields.length; i++) {
                var $field = $($removedSignFields[i]);
                DIALOG_UTILS.setSignFieldStatus($field, false);
                $field.remove();
            }
        }

        if (initialSignFieldCount > signFieldCount) {
            // add delete input field, for the fields which no longer are there
            for (var i = signFieldCount; i < initialSignFieldCount; i++) {
                var fieldName = fieldNamePre + i,
                    $field;
                if ($el.find(NAME_ATTR + fieldName + DELETE + ATTR_POST).length === 0) {
                    $field = $(ADOBESIGN_NS.deleteSignTemplate);
                    $field.attr(NAME, fieldName + DELETE);
                    $el.append($field);
                }
            }
        }
    };

    DIALOG_UTILS.setSignFieldStatus = function ($signField, status) {
        var name = $signField.find(SIGN_FIELD_NAME_SELECTOR)[0].value,
            som = $signField.find(SIGN_FIELD_SOM_SELECTOR)[0].value;
        if (ADOBESIGN_NS.config.adobeSignFields && ADOBESIGN_NS.config.adobeSignFields.length > 0) {
            _.each(ADOBESIGN_NS.config.adobeSignFields, function (field) {
                if (field.name === name && field.som === som) {
                    field.assigned = status;
                }
            });
        }
    };

    DIALOG_UTILS.loadSignFields = function ($el, signFields) {
        var signFieldCount = signFields.length;
        if (!(ADOBESIGN_NS.signFieldCount) || (ADOBESIGN_NS.signFieldCount && ADOBESIGN_NS.signFieldCount < signFieldCount)) {
            ADOBESIGN_NS.signFieldCount = signFieldCount;
        }
        DIALOG_UTILS.updateSignFields($el, signFields);
    };

    DIALOG_UTILS.getMemberObjects = function (info) {
        var objs = [];
        if (info) {
            _.each(_.keys(info), function (name) {
                if (info[name] && typeof info[name] === 'object') {
                    objs.push(info[name]);
                }
            });
        }
        return objs;
    };

    DIALOG_UTILS.fireSignerChange = function () {
        $(DELETE_SIGN).trigger('change');
    };

    DIALOG_UTILS.deleteSigner = function (event) {
        var $row = $(this).parents(SIGNER_ROW),
            signFieldCount = ADOBESIGN_NS.signFieldCount,
            $signerRows,
            $signFields,
            $signatureConfiguration = $(SIGNATURE_CONFIG);
        //release its sign fields for assignment
        $signFields = $row.find(SIGN_FIELD);
        if ($signFields.length > 0) {
            _.each($signFields, function (signField) {
                DIALOG_UTILS.setSignFieldStatus($(signField), false);
            });
        }
        // remove the signer row
        $row.remove();
        // update indexes of all the signers
        DIALOG_UTILS.updateSignerIndexes(signFieldCount);

        $signerRows = $(SIGNER_TABLE).find(SIGNER_ROW);
        // add input delete field for extra signers
        if (ADOBESIGN_NS.signerInitialCount > $signerRows.length) {
            for (var i = $signerRows.length; i < ADOBESIGN_NS.signerInitialCount; i++) {
                var numDelete = (i + 1) + DELETE,
                    fieldName = SIGNER_PREFIX + numDelete,
                    $field;
                // don't add if already exist
                if ($signatureConfiguration.find(NAME_ATTR + SIGNER_PREFIX + numDelete + ATTR_POST).length === 0) {
                    $field = $(ADOBESIGN_NS.deleteSignTemplate);
                    $field.attr(NAME, fieldName);
                    $signatureConfiguration.append($field);
                }
            }
        }
        DIALOG_UTILS.fireSignerChange();
    };

    DIALOG_UTILS.addSigner = function (callback, args) {
        var $signerTable = $(SIGNER_TABLE),
            $row = $(ADOBESIGN_NS.signerRowTemplate),
            $signatureConfiguration = $(SIGNATURE_CONFIG),
            $deleteSigner,
            index;
        $signerTable.find("tbody").append($row);
        Coral.commons.ready($row[0], function () {
            $row.find(EDIT_BUTTON)[0].on('click', DIALOG_UTILS.loadSignerConfig);
            $row.find(DELETE_BUTTON)[0].on('click', DIALOG_UTILS.deleteSigner);
            index = $signerTable.find(SIGNER_ROW).index($row) + 1;
            DIALOG_UTILS.updateSignerIndex($row, index, 0);
            $deleteSigner = $signatureConfiguration.find(NAME_ATTR + SIGNER_PREFIX + index + ATTR_POST);
            // remove any input delete field for this signer
            if ($deleteSigner.length > 0) {
                $deleteSigner.remove();
            }
            if (callback) {
                callback.apply($row, args);
            }
        });
        return $row;
    };

    DIALOG_UTILS.loadAddSigner = function () {
        var $addSigner = $(ADD_BUTTON);
        $addSigner.on('click', function (event) {
            DIALOG_UTILS.addSigner();
            DIALOG_UTILS.fireSignerChange();
        });
    };

    DIALOG_UTILS.loadSignerInfo = function () {
        var guideContainerPath = guidelib.author.AuthorUtils.getGuideContainerPath();
        $.ajax({
            type : "GET",
            url : CQ.shared.HTTP.externalize(guideContainerPath + ".treejson"),
            data : {
                path : guideContainerPath
            }
        }).done(function (guideJson) {
            if (guideJson) {
                var signerInfo = guideJson.signerInfo,
                    enableAdobeSign = guideJson.enableAdobeSign,
                    fields,
                    afFields = [],
                    adobeSignBlocks = [],
                    adobeSignFields = [],
                    fetchSignFields = true,
                    refineObj = {
                        'all' : [],
                        'duplicate' : [],
                        'signFieldAll' : [],
                        'signFieldDuplicate' : []
                    };
                if (guideJson.rootPanel) {
                    if (guideJson.xdpRef || guideJson.dorType === 'select') {
                        fetchSignFields = false;
                    }
                    fields = DIALOG_UTILS.getFields({
                        'itemJson' : guideJson.rootPanel,
                        'pathPrefix' : "",
                        'refineObj' : refineObj,
                        'fetchSignFields' : fetchSignFields
                    });
                    _.each(fields, function (field) {
                        if (field.adobeSignField) {
                            if (_.contains(refineObj.signFieldDuplicate, field.innerHTML)) {
                                field.innerHTML = field.innerHTML + ' (' + field.displayPath + ')';
                            }
                            adobeSignFields.push(field);
                        } else {
                            if (_.contains(refineObj.duplicate, field.innerHTML)) {
                                field.innerHTML = field.innerHTML + ' (' + field.displayPath + ')';
                            }
                            if (field.adobeSignBlock) {
                                adobeSignBlocks.push(field);
                            } else {
                                afFields.push(field);
                            }
                        }
                    });
                    ADOBESIGN_NS.config =
                        {
                            guideContainerPath : guideContainerPath,
                            enableAdobeSign : enableAdobeSign,
                            signerInfo : signerInfo,
                            adobeSignBlocks : adobeSignBlocks,
                            adobeSignFields : adobeSignFields,
                            afFields : afFields,
                            fetchSignFields : fetchSignFields
                        };
                    DIALOG_UTILS.loadSignerRows();
                }
            }
        });
    };

    DIALOG_UTILS.getFields = function (data) {
        var itemJson = data.itemJson,
            pathPrefix = data.pathPrefix,
            refineObj = data.refineObj,
            fetchSignFields = data.fetchSignFields,
            fields = [],
            name = itemJson.displayName ? itemJson.displayName : itemJson.name,
            displayPath = pathPrefix + '/' + name,
            typeDescriptor = itemJson.typeDescriptor,
            handleDuplicates = function (fieldName, path) {
                if (_.contains(refineObj.all, fieldName)) {
                    refineObj.duplicate.push(fieldName);
                    fieldName = fieldName + ' (' + path + ')';
                } else {
                    refineObj.all.push(fieldName);
                }
                return fieldName;
            },
            handleSignFieldDuplicates = function (signFieldName, path) {
                if (_.contains(refineObj.signFieldAll, signFieldName)) {
                    refineObj.signFieldDuplicate.push(signFieldName);
                    signFieldName = signFieldName + ' (' + path + ')';
                } else {
                    refineObj.signFieldAll.push(signFieldName);
                }
                return signFieldName;
            };
        // no adobe sign fields will be added for signer association in XDP based AF
        if (itemJson.items) {
            _.each(itemJson.items, function (item) {
                fields.push.apply(fields, DIALOG_UTILS.getFields({
                    'itemJson' : item,
                    'pathPrefix' : displayPath,
                    'refineObj' : refineObj,
                    'fetchSignFields' : fetchSignFields
                }));
            });
        } else if (typeDescriptor === 'guideTelephone' || (typeDescriptor && typeDescriptor.indexOf("STRING") !== -1) || (typeDescriptor && typeDescriptor.indexOf("NUMBER") !== -1)) {
            name = handleDuplicates(name, displayPath);
            fields.push({
                innerHTML : name,
                value : itemJson.SOM,
                displayPath : displayPath
            });
        } else if (fetchSignFields && (typeDescriptor && typeDescriptor.indexOf("STATIC TEXT") !== -1)
            && itemJson.adobeSignFields && itemJson.adobeSignFields.length > 0) {
            name = handleDuplicates(name, displayPath);
            var blockFields = [],
                adobeSignBlock = {
                    innerHTML : name,
                    value : itemJson.SOM,
                    displayPath : displayPath,
                    fields : blockFields,
                    adobeSignBlock : true
                };
            _.each(itemJson.adobeSignFields, function (adobeSignFieldName) {
                var signDisplayPath = displayPath + "/" + adobeSignFieldName,
                    name = handleSignFieldDuplicates(adobeSignFieldName, signDisplayPath),
                    field = {
                        innerHTML : name,
                        value : JSON.stringify({som : itemJson.SOM, name : adobeSignFieldName}),
                        displayPath : signDisplayPath,
                        som : itemJson.SOM,
                        name : adobeSignFieldName,
                        assigned : false,
                        adobeSignField : true
                    };
                blockFields.push(field);
                fields.push(field);
            });
            fields.push(adobeSignBlock);
        }
        return fields;
    };

    DIALOG_UTILS.enableDisableSubmit = function () {
        var $dialog = $('.configureSignDialog'),
            submitButton = $dialog.find('.cq-dialog-submit')[0],
            shouldDisableSubmit = false,
            $requiredFields = $dialog.find('[required]').not('coral-taglist, .coral-Autocomplete-input, [hidden]');
        _.each($requiredFields, function (requiredField) {
            if (!requiredField.value) {
                shouldDisableSubmit = true;
                return;
            }
        });
        submitButton.disabled = shouldDisableSubmit;
    };

    DIALOG_UTILS.removeAllSelections = function (selectField) {
        _.each(selectField.items.getAll(), function (item) {
            item.selected = false;
        });
        selectField.clear();
    };

    DIALOG_UTILS.setSelected = function (selectField, value) {
        _.each(selectField.items.getAll(), function (item) {
            if (item.value === value) {
                item.selected = true;
            }
        });
    };

    DIALOG_UTILS.getSelectedFieldItems = function (signFieldAutoComplete) {
        var fieldItem,
            fieldItems = [];
        _.each(signFieldAutoComplete.items.getAll(), function (item) {
            if (item.selected) {
                fieldItem = {};
                fieldItem.innerHTML = item.innerHTML;
                fieldItem.value = item.value;
                fieldItems.push(fieldItem);
            }
        });
        return fieldItems;
    };

    DIALOG_UTILS.showHidePhoneFields = function (event) {
        var securityOption = event.matchedTarget,
            $fields = $(securityOption).parent().nextAll().slice(0, -2),
            countryCode = $fields.find('input[name="countryCode"]')[0],
            countryCodeField = $fields.find('coral-autocomplete[name="countryCodeField"]')[0],
            phone = $fields.find('input[name="phone"]')[0],
            phoneField = $fields.find('coral-autocomplete[name="phoneField"]')[0],
            countryCodeSource = $fields.find('coral-select[name="countryCodeSource"]')[0],
            phoneSource = $fields.find('coral-select[name="phoneSource"]')[0];
        if (securityOption.value === 'PHONE') {
            $fields.removeClass('adobeSignHide');
            countryCodeSource.trigger('change');
            phoneSource.trigger('change');
        } else {
            $fields.addClass('adobeSignHide');
            countryCode.required = false;
            countryCodeField.required = false;
            phone.required = false;
            phoneField.required = false;
        }
    };

    DIALOG_UTILS.addSignFieldAutocompleteItems = function (fieldItems, selectedItems) {
        var signFieldAutocomplete;
        if (fieldItems && fieldItems.length > 0) {
            signFieldAutocomplete = $(SIGN_FIELD_AUTOCOMPLETE_SELECTOR)[0];
            signFieldAutocomplete.off('change', DIALOG_UTILS.populateSignBlockAutocomplete);
            signFieldAutocomplete.items.clear();
            _.each(fieldItems, function (fieldItem) {
                var isSelectedItem = false,
                    signFieldItem;
                if (selectedItems) {
                    for (var i = 0; i < selectedItems.length; i++) {
                        if (fieldItem.value === selectedItems[i]) {
                            isSelectedItem = true;
                            // remove it from the selected item list
                            selectedItems.splice(i, 1);
                            break;
                        }
                    }
                }
                if (isSelectedItem || !fieldItem.assigned) {
                    signFieldItem = new Coral.Autocomplete.Item();
                    signFieldItem.innerHTML = fieldItem.innerHTML;
                    signFieldItem.value = fieldItem.value;
                    signFieldAutocomplete.items.add(signFieldItem);
                    if (isSelectedItem) {
                        signFieldItem.selected = true;
                    }
                }
            });
            DIALOG_UTILS.populateSignBlockAutocomplete();
            signFieldAutocomplete.on('change', DIALOG_UTILS.populateSignBlockAutocomplete);
        }
    };

    DIALOG_UTILS.populateSignBlockAutocomplete = function () {
        var signBlockAutocomplete = $(SIGN_BLOCK_AUTOCOMPLETE_SELECTOR)[0],
            signFieldAutocomplete = $(SIGN_FIELD_AUTOCOMPLETE_SELECTOR)[0],
            blockSoms = [];
        signBlockAutocomplete.off('change', DIALOG_UTILS.signBlockChange);
        _.each(signFieldAutocomplete.items.getAll(), function (item) {
            if (!item.selected) {
                blockSoms.push(JSON.parse(item.value).som);
            }
        });
        signBlockAutocomplete.items.clear();
        if (blockSoms && blockSoms.length > 0) {
            blockSoms = blockSoms.filter(function (item, i, somArray) {
                return somArray.indexOf(item) === i;
            });
        }
        _.each(ADOBESIGN_NS.config.adobeSignBlocks, function (signBlock) {
            var blockItem;
            for (var i = 0; i < blockSoms.length; i++) {
                if (signBlock.value === blockSoms[i]) {
                    blockItem = new Coral.Autocomplete.Item();
                    blockItem.innerHTML = signBlock.innerHTML;
                    blockItem.value = signBlock.value;
                    signBlockAutocomplete.items.add(blockItem);
                    break;
                }
            }
        });
        signBlockAutocomplete.on('change', DIALOG_UTILS.signBlockChange);
    };

    DIALOG_UTILS.signBlockChange = function (event) {
        var signBlockAutocomplete = event.matchedTarget,
            signBlockSom = signBlockAutocomplete.value,
            signBlocks = ADOBESIGN_NS.config.adobeSignBlocks,
            signBlocksLength = signBlocks.length,
            signFieldAutocomplete = $(SIGN_FIELD_AUTOCOMPLETE_SELECTOR)[0],
            signBlock;
        for (var i = 0; i < signBlocksLength; i++) {
            if (signBlocks[i].value === signBlockSom) {
                signBlock = signBlocks[i];
                break;
            }
        }
        if (signBlock) {
            signFieldAutocomplete.off('change', DIALOG_UTILS.populateSignBlockAutocomplete);
            _.each(signBlock.fields, function (field) {
                DIALOG_UTILS.setSelected(signFieldAutocomplete, field.value);
            });
            signBlockAutocomplete.off('change', DIALOG_UTILS.signBlockChange);
            DIALOG_UTILS.populateSignBlockAutocomplete();
            signBlockAutocomplete.on('change', DIALOG_UTILS.signBlockChange);
            signFieldAutocomplete.on('change', DIALOG_UTILS.populateSignBlockAutocomplete);
        }
    };

    DIALOG_UTILS.firstSignerFormFillerChange = function (event) {
        var firstSignerFormFiller = event.matchedTarget,
            shouldRemove,
            profileSelectItem,
            $sourceSelect = $(firstSignerFormFiller).parents(SIDE_PANEL_SIGNER_SELECTOR).find('coral-select[name="emailSource"]');
        if ((firstSignerFormFiller.value === 'true' && firstSignerFormFiller.checked) || (firstSignerFormFiller.value === 'false' && !firstSignerFormFiller.checked)) {
            shouldRemove = false;
        } else {
            shouldRemove = true;
        }
        //TODO: Once Country code and phone number 'pick from user profile' is closed, that will also be part of $sourceSelect
        profileSelectItem = $sourceSelect.find('coral-select-item[value="userProfile"]')[0];
        if (profileSelectItem.selected) {
            DIALOG_UTILS.setSelected($sourceSelect[0], 'form');
            $sourceSelect[0].trigger('change');
        }
        _.each($sourceSelect.find('[value="userProfile"]'), function (selectItem) {
            selectItem.disabled = shouldRemove;
            selectItem.hidden = shouldRemove;
        });
    };

    DIALOG_UTILS.sourceChange = function (event) {
        var sourceSelect = event.matchedTarget,
            $parentWrapper = $(sourceSelect).parents('.coral-Form-fieldwrapper'),
            typedVal = $parentWrapper.next().find('input')[0],
            afFieldVal = $parentWrapper.next().next().find('.afFieldAutocomplete')[0],
            value = sourceSelect.value;
        if (value === 'form') {
            DIALOG_UTILS.showDependentField(afFieldVal);
            DIALOG_UTILS.afFieldAutocompleteChange({matchedTarget : afFieldVal});
            DIALOG_UTILS.hideDependentField(typedVal);
        } else if (value == 'typed') {
            DIALOG_UTILS.showDependentField(typedVal);
            DIALOG_UTILS.hideDependentField(afFieldVal);
        } else if (value === 'userProfile') {
            DIALOG_UTILS.hideDependentField(typedVal);
            DIALOG_UTILS.hideDependentField(afFieldVal);
        }
    };

    DIALOG_UTILS.hideDependentField = function (field) {
        field.required = false;
        field.value = "";
        field.hidden = true;
    };

    DIALOG_UTILS.showDependentField = function (field) {
        field.hidden = false;
        field.required = true;
    };

    DIALOG_UTILS.afFieldAutocompleteChange = function (event) {
        var afFieldAutocomplete = event.matchedTarget,
            $inputGroup = $(afFieldAutocomplete).find('.coral-Autocomplete-inputGroup');
        if (afFieldAutocomplete.value) {
            $inputGroup.hide();
        } else {
            $inputGroup.show();
        }
    };

    DIALOG_UTILS.initializeSignerPanel = function ($signerSidePanel) {
        var headerTitleField = $signerSidePanel.find(SIDE_PANEL_TITLE)[0];
        headerTitleField.variant = 'quiet';
        headerTitleField.readOnly = true;

        if (!ADOBESIGN_NS.config.fetchSignFields) {
            $signerSidePanel.addClass('hideSignFields');
        }

        $signerSidePanel
            .find(SIDE_PANEL_SIGNER_SUBMIT_SELECTOR)
            .off("click")
            .on("click", DIALOG_UTILS.saveSignerSidePanel);

        $signerSidePanel
            .find(SIDE_PANEL_SIGNER_CANCEL_SELECTOR)
            .off("click")
            .on("click", DIALOG_UTILS.closeSignerSidePanel);

        _.each($signerSidePanel.find('.infoSource'), function (source) {
            source.off('change', DIALOG_UTILS.sourceChange);
            source.on('change', DIALOG_UTILS.sourceChange);
        });

        _.each($signerSidePanel.find('coral-select[name="securityOption"]'), function (securityOption) {
            securityOption.off('change', DIALOG_UTILS.showHidePhoneFields);
            securityOption.on('change', DIALOG_UTILS.showHidePhoneFields);
        });

        _.each($signerSidePanel.find('coral-radio[name="firstSignerFormFiller"]'), function (source) {
            source.off('change', DIALOG_UTILS.firstSignerFormFillerChange);
            source.on('change', DIALOG_UTILS.firstSignerFormFillerChange);
        });

        _.each($signerSidePanel.find('.afFieldAutocomplete'), function (afFieldAutocomplete) {
            afFieldAutocomplete.off('change', DIALOG_UTILS.afFieldAutocompleteChange);
            afFieldAutocomplete.on('change', DIALOG_UTILS.afFieldAutocompleteChange);
        });
    };

    DIALOG_UTILS.populateAfFieldAutocomplete = function ($afFieldAutocomplete, afFields) {
        $afFieldAutocomplete[0].items.clear();
        if (afFields && afFields.length > 0 && $afFieldAutocomplete && $afFieldAutocomplete.length > 0) {
            _.each($afFieldAutocomplete, function (afFieldAutocomplete) {
                afFieldAutocomplete.items.clear();
                _.each(afFields, function (afField) {
                    afFieldAutocomplete.items.add({innerHTML : afField.innerHTML, value : afField.value});
                });
            });
        }
    };

}(jQuery, Granite.author, window.guidelib.touchlib));
