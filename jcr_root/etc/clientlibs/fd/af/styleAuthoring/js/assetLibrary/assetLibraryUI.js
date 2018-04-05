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

(function (_, $, style) {
    var authoringConstants = window.guidelib.touchlib.constants,
        styleAssetLib = style.assetLibrary,
        styleAssetLibUtils = styleAssetLib.utils,
        styleAssetLibUI = styleAssetLib.ui,
        styleConstants = style.constants,
        styleVars = style.vars,
        styleUtils = style.utils,
        styleUI = style.ui,
        styleAssetLibVars = styleAssetLib.vars;
    /**
     * Add saved text style to the the ui.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.addSavedTextStyleUI = function (textStyleJson) {
        var $selectComponent = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR),
            selectComponent = $selectComponent.get(0),
            textStyleNodeName = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            savedTextStyles = styleAssetLibVars.savedStylesJson[textStyleNodeName],
            $savedStyleGroup = $selectComponent.find("optgroup[label='" + styleConstants.ASSET_LIBRARY_SAVED_STYLE_LABEL + "']"),
            $savedStyleOptionList = $savedStyleGroup.find("option");
        if (_.isEmpty(savedTextStyles) || _.isEmpty($savedStyleOptionList)) {
            index = $savedStyleGroup.get(0);
        } else {
            index = 1;
        }
        _addToSelect(selectComponent, textStyleJson, _createTextStyleSelectItem, index);
        styleAssetLibUI.addTextStyleToManagementTable(textStyleJson);
    };

    /**
     * Add recently used text style to the the ui.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.addRecentlyUsedTextStyleUI = function (textStyleJson) {
        var $selectComponent = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR),
            selectComponent = $selectComponent.get(0),
            textStyleNodeName = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
            recentlyUsedTextStyles = styleAssetLibVars.recentlyUsedStylesJson[textStyleNodeName],
            savedTextStyles = styleAssetLibVars.savedStylesJson[textStyleNodeName],
            $recentlyUsedStyleGroup = $selectComponent.find("optgroup[label='" + styleConstants.ASSET_LIBRARY_RECENTLY_USED_STYLE_LABEL + "']"),
            $recentlyUsedStyleOptionList = $recentlyUsedStyleGroup.find("option");
        if (_.isEmpty(recentlyUsedTextStyles) || _.isEmpty($recentlyUsedStyleOptionList)) {
            index = $recentlyUsedStyleGroup.get(0);
        } else {
            index = savedTextStyles.length + 1;
        }
        _addToSelect(selectComponent, textStyleJson, _createTextStyleSelectItem, index);
    };

    /**
     * Add recently used image style to the the ui.
     * @param {Object} imageStyleJson - Object containing image style properties.
     */
    styleAssetLibUI.addRecentlyUsedImageStyleUI = function (imageStyleJson) {
        var $selectComponent = $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR),
            selectComponent = $selectComponent.get(0),
            imageNodeName = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            recentlyUsedImages = styleAssetLibVars.recentlyUsedStylesJson[imageNodeName],
            savedImages = styleAssetLibVars.savedStylesJson[imageNodeName],
            $recentlyUsedStyleGroup = $selectComponent.find("optgroup[label='" + styleConstants.ASSET_LIBRARY_RECENTLY_USED_STYLE_LABEL + "']"),
            $recentlyUsedStyleOptionList = $recentlyUsedStyleGroup.find("option");
        if (_.isEmpty(recentlyUsedImages) || _.isEmpty($recentlyUsedStyleOptionList)) {
            index = $recentlyUsedStyleGroup.get(0);
        } else {
            index = savedImages.length + 1;
        }
        _addToSelect(selectComponent, imageStyleJson, _createImageStyleSelectItem, index);
    };

    /**
     * Add saved image style to the the ui.
     * @param {Object} imageStyleJson - Object containing image style properties.
     */
    styleAssetLibUI.addSavedImageStyleUI = function (imageStyleJson, preProcessorFn) {
        var $selectComponent = $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR),
            selectComponent = $selectComponent.get(0),
            imageNodeName = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
            savedImages = styleAssetLibVars.savedStylesJson[imageNodeName],
            $savedStyleGroup = $selectComponent.find("optgroup[label='" + styleConstants.ASSET_LIBRARY_SAVED_STYLE_LABEL + "']"),
            $savedStyleOptionList = $savedStyleGroup.find("option");
        if (_.isEmpty(savedImages) || _.isEmpty($savedStyleOptionList)) {
            index = $savedStyleGroup.get(0);
        } else {
            index = 1;
        }
        _addToSelect(selectComponent, imageStyleJson, _createImageStyleSelectItem, index, preProcessorFn);
        styleAssetLibUI.addImageStyleToManagementTable(imageStyleJson);
    };

    /**
     * Add image style to the select box.
     * @param {Object} imageStyle - Object containing text style properties.
     * @return {Object} coral-select-item added to the select box.
     */
    styleAssetLibUI.addImageStyleToSelect = function (imageStyle, preProcessorFn) {
        var selectComponent = $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR).get(0);
    };

    //TODO Move to coral table apis.
    /**
     * Add text style row to the management table.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.addTextStyleToManagementTable = function (textStyleJson) {
        var textStyleTableSelector = styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_TABLE_SELECTOR,
            $textStyleTable = $(textStyleTableSelector),
            textStyleTable = $textStyleTable.get(0);
        if (textStyleTable) {
            var properties = styleAssetLibUtils._extractProperties(textStyleJson),
                id = properties.id,
                cssPropertiesList = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME],
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                textStyleTitleHTML = '<span style="',
                propertyValues = "";
            _.each(cssPropertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    property = data.property,
                    value = data.value;
                if (key != "line-height") {
                    textStyleTitleHTML += property + ":" + value + ";";
                }
                if (!_.isEmpty(propertyValues) && !_.isEmpty(value)) {
                    propertyValues += ", " + value;
                } else if (!_.isEmpty(value)) {
                    propertyValues += value;
                }
            });
            textStyleTitleHTML += '" class="assetLibraryTextStyleTitle" title="' + CQ.I18n.get(title) + '">' + CQ.I18n.get(title) + '</span>';
            var rowHTML = '<tr is="coral-table-row" data-id=' + id + '><td is="coral-table-cell"> <coral-checkbox coral-table-rowselect></coral-checkbox></td><td is="coral-table-cell">' + textStyleTitleHTML + '</td>' +
                           '<td is="coral-table-cell" title="' + propertyValues + '">' + propertyValues + '</td>' +
                           '</tr>';
            $textStyleTable.find("tbody").append(rowHTML);
        }
    };

    //TODO Move to coral table apis.
    /**
     * Add color to the management table.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.addColorToManagementTable = function (colorJson) {
        var colorManagementTableSelector = styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_TABLE_SELECTOR,
            $colorManagementTable = $(colorManagementTableSelector),
            colorManagementTable = $colorManagementTable.get(0);
        if (colorManagementTable) {
            var properties = styleAssetLibUtils._extractProperties(colorJson),
                id = properties.id,
                cssPropertiesList = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME],
                propertyValues = "",
                colorValue = "";
            _.each(cssPropertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    property = data.property,
                    value = data.value;
                if (property == styleConstants.ASSET_LIBRARY_COLOR_VALUE_PROPERTY) {
                    colorValue = value;
                }
                if (!_.isEmpty(propertyValues) && !_.isEmpty(value)) {
                    propertyValues += ", " + value;
                } else if (!_.isEmpty(value)) {
                    propertyValues += value;
                }
            });
            var colorPreview = styleAssetLibUtils.createSwatch(colorValue);
            colorPreview.disabled = true;
            var rowHTML = '<tr is="coral-table-row" data-id=' + id + '><td is="coral-table-cell"> <coral-checkbox coral-table-rowselect></coral-checkbox></td>' +
                      '<td is="coral-table-cell">' + colorPreview.outerHTML + '</td>' +
                      '<td is="coral-table-cell">' + propertyValues + '</td>' +
                      '</tr>';
            $(colorPreview).css("background-color", colorValue);
            $colorManagementTable.find("tbody").append(rowHTML);
        }
    };

    //TODO Move to coral table apis.
    /**
     * Add image style row to the management table.
     * @param {Object} imageStyle - Object containing image style properties.
     */
    styleAssetLibUI.addImageStyleToManagementTable = function (imageStyleJson) {
        var imageStyleTableSelector = styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_TABLE_SELECTOR,
            $imageStyleTable = $(imageStyleTableSelector),
            imageStyleTable = $imageStyleTable.get(0);
        if (imageStyleTable) {
            var properties = styleAssetLibUtils._extractProperties(imageStyleJson),
                id = properties.id,
                uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
                imageTitle = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                imageSrc = "",
                propertyValues = "";
            _.each(uiPropertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    property = data.property,
                    value = data.value;
                if (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME) {
                    imageSrc = styleUtils.makePathAbsolute(value, styleVars.styleAssetsPrefixPath);
                }
                if (!_.isEmpty(propertyValues) && !_.isEmpty(value)) {
                    propertyValues += ", " + (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME ? value.substring(value.lastIndexOf("/") + 1) : value);
                } else if (!_.isEmpty(value)) {
                    propertyValues += (property == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME ? value.substring(value.lastIndexOf("/") + 1) : value);
                }
            });
            var imagePreview = '<img src= "' + CQ.shared.HTTP.externalize(imageSrc) +  '" class = "assetLibraryManagementImagePreviewImageTag">',
                rowHTML = '<tr is="coral-table-row" data-id=' + id + '><td is="coral-table-cell"> <coral-checkbox coral-table-rowselect></coral-checkbox></td>' +
                          '<td is="coral-table-cell">' + imagePreview + '</td>' +
                          '<td is="coral-table-cell" title="' + CQ.I18n.get(imageTitle) + '">' + CQ.I18n.get(imageTitle) + '</td>' +
                          '<td is="coral-table-cell" title="' + propertyValues + '">' + propertyValues + '</td>' +
                          '</tr>';
            $imageStyleTable.find("tbody").append(rowHTML);
        }
    };

    /**
     * Remove saved text style from the ui.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.removeSavedTextStyleUI = function (textStyleJson) {
        styleAssetLibUI.removeTextStyleFromSelect(textStyleJson);
        styleAssetLibUI.removeTextStyleFromManagementTable(textStyleJson);
    };

    /**
     * Remove saved color from the ui.
     * @param {Object} color - Object containing color properties.
     */
    styleAssetLibUI.removeSavedColorUI = function (colorJson) {
        _removeFromColorInputAccordion(colorJson, styleConstants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_CLASS);
        styleAssetLibUI.removeColorFromManagementTable(colorJson);
    };

    /**
     * Remove saved image style from the ui.
     * @param {Object} imageStyleJson - Object containing image style properties.
     */
    styleAssetLibUI.removeSavedImageStyleUI = function (imageStyleJson) {
        styleAssetLibUI.removeImageStyleFromSelect(imageStyleJson);
        styleAssetLibUI.removeImageStyleFromManagementTable(imageStyleJson);
    };

    /**
     * Remove recently used image style from the ui.
     * @param {Object} imageStyle - Object containing image style properties.
     */
    styleAssetLibUI.removeRecentlyUsedImageStyleUI = function (imageStyleJson) {
        styleAssetLibUI.removeImageStyleFromSelect(imageStyleJson);
    };

    /**
     * Remove recently used text style from the ui.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.removeRecentlyUsedTextStyleUI = function (textStyleJson) {
        styleAssetLibUI.removeTextStyleFromSelect(textStyleJson);
    };

    /**
     * Remove image entry from the select box.
     * @param {Object} image - Object containing image properties.
     * @return {Object} coral-select-item added to the select box.
     */
    styleAssetLibUI.removeImageStyleFromSelect = function (imageStyleJson) {
        var properties = styleAssetLibUtils._extractProperties(imageStyleJson),
            value = properties.id,
            $imageStylesSelect = $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR),
            imageStylesSelect = $imageStylesSelect.get(0),
            selectListElement = $imageStylesSelect.find("option[value='" + value + "']").get(0);
        if (selectListElement) {
            var index = selectListElement.index;
            styleUtils.getMsDropDown(imageStylesSelect).remove(index);
        }
    };

    /**
     * Remove image style from the management ui.
     * @param {Object} imageStyleJson - Object containing image style properties.
     */
    styleAssetLibUI.removeImageStyleFromManagementTable = function (imageStyleJson) {
        var $imageStyleAssetManagementTable = $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_TABLE_SELECTOR);
        styleAssetLibUI.removeRowFromManagementTable($imageStyleAssetManagementTable, imageStyleJson);
    };

    /**
     * Remove text style from the select ui.
     * @param {Object} textStyle - Object containing text style properties.
     */
    styleAssetLibUI.removeTextStyleFromSelect = function (textStyleJson) {
        var properties = styleAssetLibUtils._extractProperties(textStyleJson),
            value = properties.id,
            $textStylesSelect = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR),
            textStylesSelect = $textStylesSelect.get(0),
            selectListElement = $textStylesSelect.find("option[value='" + value + "']").get(0);
        if (selectListElement) {
            var index = selectListElement.index;
            styleUtils.getMsDropDown(textStylesSelect).remove(index);
        }
    };

    /**
     * Remove text style from the management ui.
     * @param {Object} textStyleJson - Object containing text style properties.
     */
    styleAssetLibUI.removeTextStyleFromManagementTable = function (textStyleJson) {
        var $textStyleAssetManagementTable = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_TABLE_SELECTOR);
        styleAssetLibUI.removeRowFromManagementTable($textStyleAssetManagementTable, textStyleJson);
    };

    /**
     * Remove color from the management ui.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.removeColorFromManagementTable = function (colorJson) {
        var $colorAssetManagementTable = $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_TABLE_SELECTOR);
        styleAssetLibUI.removeRowFromManagementTable($colorAssetManagementTable, colorJson);
    };

    /**
     *  remove row from the management table.
     * @param {Object} $styleAssetManagementTable - Jquery Object of style asset management table.
     * @param {Object} styleJson - Object containing style properties.
     */
    styleAssetLibUI.removeRowFromManagementTable = function ($styleAssetManagementTable, styleJson) {
        var properties = styleAssetLibUtils._extractProperties(styleJson),
            id = properties.id,
            styleAssetManagementTable = $styleAssetManagementTable.get(0),
            rowSelector = "tr [data-id = '" + id + "']",
            styleRow = $styleAssetManagementTable.find(rowSelector).get(0);
        if (styleRow) {
            styleAssetManagementTable.items.remove(styleRow);
        }
    };

    /**
     * Add color to the all the color-pickers.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.addRecentlyUsedColorUI = function (colorJson) {
        _addToColorInputAccordion(colorJson, styleConstants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_CLASS);
    };

    /**
     * Add color to the saved accordion of all the color-pickers.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.addSavedColorsUI = function (colorJson) {
        _addToColorInputAccordion(colorJson, styleConstants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_CLASS);
        styleAssetLibUI.addColorToManagementTable(colorJson);
    };

    /**
     * Add color to the default accordion of all the color-pickers.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.addDefaultColorsUI = function (colorJson) {
        _addToColorInputAccordion(colorJson, styleConstants.ASSET_LIBRARY_DEFAULT_COLORS_ACCORDION_CLASS);
        styleAssetLibUI.addColorToManagementTable(colorJson);
    };

    /**
     * Remove color from all the color-pickers.
     * @param {Object} colorJson - Object containing color properties.
     */
    styleAssetLibUI.removeRecentlyUsedColorsUI = function (colorJson) {
        _removeFromColorInputAccordion(colorJson, styleConstants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_CLASS);
    };

    /**
     * Register event handler of widgets related to asset library.
     */
    styleAssetLibUI.registerAssetLibraryEventHandlers = function () {
        // save text style on overlay close.
        $(styleConstants.TEXT_STYLE_SAVE_POPOVER_SELECTOR).on("coral-overlay:beforeclose.style.assetlibrary", styleAssetLibUI.textStylesSavePopoverCloseHandler);
        // save text style after overlay open.
        $(styleConstants.TEXT_STYLE_SAVE_POPOVER_SELECTOR).on("coral-overlay:open.style.assetlibrary", styleAssetLibUI.textStylesSavePopoverAfterOpenHandler);
        // Populate property sheet on selecting text style.
        $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR).on("change.style.assetlibrary", styleAssetLibUI.textStylesSelectChangeHandler);
        //text accordion change handler.
        $(styleConstants.TEXT_ACCORDION_SELECTOR).on("change.style.assetlibrary.style.assetlibrary", styleAssetLibUI.textAccordionChangeHandler);
        //colorPicker Update Colors.
        $("#style-propertysheet coral-colorinput coral-overlay").on("coral-overlay:beforeclose.style.assetlibrary", styleAssetLibUI.colorInputChangeHandler);
        // save background image on overlay close.
        $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_POPOVER_SELECTOR).on("coral-overlay:beforeclose.style.assetlibrary", styleAssetLibUI.assetLibraryImagesSavePopoverCloseHandler);
        // setting default image title before saving background image asset.
        $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_POPOVER_SELECTOR).on("coral-overlay:beforeopen.style.assetlibrary", styleAssetLibUI.assetLibraryImagesSavePopoverOpenHandler);
        //reset asset library images select on a background property change.
        $(styleConstants.BACKGROUND_POPOVER_FIELDS_SELECTOR).on("change.style.assetlibrary", styleAssetLibUI.imagePropertyChangeHandler);
        //populate background popover on asset library image selection.
        $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR).on("change.style.assetlibrary", styleAssetLibUI.assetLibraryImagesSelectChangeHandler);
        //background popover close handler.
        $(styleConstants.BACKGROUND_POPOVER_FIELDS_SELECTOR).on("change.style.assetlibrary", styleAssetLibUI.imagesPopoverFieldChangeHandler);
        //image popover close handler.
        $(styleConstants.IMAGE_POPOVER_SELECTOR).on("coral-overlay:beforeclose.style.assetlibrary", styleAssetLibUI.imagesPopoverCloseHandler);
        // images popover after open handler
        $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_POPOVER_SELECTOR).on("coral-overlay:open.style.assetlibrary", styleAssetLibUI.assetLibraryImagesSavePopoverAfterOpenHandler);
        //image popover open handler.
        $(styleConstants.IMAGE_POPOVER_SELECTOR).on("coral-overlay:beforeopen.style.assetlibrary", styleAssetLibUI.imagesPopoverOpenHandler);
        //mange asset library button click handler.
        $(styleConstants.MANAGE_ASSET_LIBRARY_BUTTON).on("click.style.assetlibrary", styleAssetLibUI.showAssetLibraryManagementDialog);
        //color input swatch click handler.
        $(styleConstants.COLOR_INPUT_TAG).on("click.style.assetlibrary", "." + styleConstants.COLOR_INPUT_CUSTOM_SWATCH_CLASS, styleAssetLibUI.colorInputSwatchClickHandler);
        //color input Save Button Click Handler.
        $("." + styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS).on("click.style.assetlibrary", styleAssetLibUI.colorInputSaveButtonClickHandler);
        //colorInput Slider Change Handler
        $(styleConstants.COLOR_INPUT_SLIDER_TAG).on("change.style.assetlibrary", styleAssetLibUI.colorInputSliderChangeHandler);
    };

    /**
     * Register event handler of asset library management dialog.
     */
    styleAssetLibUI.registerAssetLibraryManagementEventHandlers = function () {
        //text table change handler.
        $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_TABLE_SELECTOR).on("coral-table:change.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.textStyleManagementTableChangeHandler);
        //delete selected text styles in the table.
        $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_DELETE_BUTTON).on("click.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.textStyleManagementDeleteButtonClickHandler);
        //delete selected image styles in the table.
        $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_DELETE_BUTTON).on("click.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.imageStyleManagementDeleteButtonClickHandler);
        //image table change handler.
        $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_TABLE_SELECTOR).on("coral-table:change.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.imageStyleManagementTableChangeHandler);
        //delete selected color in the table.
        $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_DELETE_BUTTON).on("click.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.colorManagementDeleteButtonClickHandler);
        //color table change handler.
        $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_TABLE_SELECTOR).on("coral-table:change.style.assetlibrary.assetlibrarymanagement", styleAssetLibUI.colorManagementTableChangeHandler);
    };

    /**
     * images popover open handler.
     */
    styleAssetLibUI.assetLibraryImagesSavePopoverAfterOpenHandler = function () {
        $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_INPUT_SELECTOR).focus();
    };

    styleAssetLibUI.textStylesSavePopoverAfterOpenHandler = function () {
        $(styleConstants.TEXT_STYLE_SAVE_INPUT_SELECTOR).focus();
    };

    /**
     * text style popover open handler.
     */
    styleAssetLibUI.assetLibraryTextStyleSavePopoverAfterOpenHandler = function () {
        $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SAVE_INPUT_SELECTOR).focus();
    };

    /**
     * delete saved text style.
     */
    styleAssetLibUI.textStyleManagementDeleteButtonClickHandler = function (e) {
        var $textStyleManagementTable = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_TABLE_SELECTOR),
            $textStyleManagementDeleteButton = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_DELETE_BUTTON);
        styleAssetLibUI.managementTableDeleteClickHandler($textStyleManagementTable, $textStyleManagementDeleteButton, styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME, styleAssetLibUI.removeSavedTextStyleUI);
    };

    /**
     * delete saved color.
     */
    styleAssetLibUI.colorManagementDeleteButtonClickHandler = function () {
        var $colorManagementTable = $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_TABLE_SELECTOR),
            $colorManagementDeleteButton = $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_DELETE_BUTTON);
        styleAssetLibUI.managementTableDeleteClickHandler($colorManagementTable, $colorManagementDeleteButton, styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME, styleAssetLibUI.removeSavedColorUI);
    };

    /**
     * delete saved image style.
     */
    styleAssetLibUI.imageStyleManagementDeleteButtonClickHandler = function (e) {
        var $imageStyleManagementTable = $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_TABLE_SELECTOR),
            $imageStyleManagementDeleteButton = $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_DELETE_BUTTON);
        styleAssetLibUI.managementTableDeleteClickHandler($imageStyleManagementTable, $imageStyleManagementDeleteButton, styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME, styleAssetLibUI.removeSavedImageStyleUI);
    };

    /**
     * delete saved style form management table.
     */
    styleAssetLibUI.managementTableDeleteClickHandler = function ($styleManagementTable, $styleManagementDeleteButton, styleType, removeSaveStyleUIFn) {
        var styleManagementTable = $styleManagementTable.get(0),
            selectedItems = styleManagementTable.selectedItems,
            deferredObjectsList = [];
        _.each(selectedItems, function (selectedRow) {
            var styleId = $(selectedRow).data("id"),
                styleJson = {};
            styleJson[styleId] = {};
            var deferredObject = styleAssetLibUtils.removeSavedStyle(styleType, styleJson, removeSaveStyleUIFn);
            if (!_.isEmpty(deferredObject)) {
                deferredObjectsList.push(deferredObject);
            }
        });
        $.when.apply($, deferredObjectsList).then(function () {
            $styleManagementDeleteButton.get(0).disabled = true;
            _.each(selectedItems, function (selectedRow) {
                styleManagementTable.items.remove(selectedRow);
            });
        }, styleUtils.getAlertServerErrorFn(styleConstants.ASSET_LIBRARY_DELETE_ERROR_MESSAGE));
    };

    /**
     * text style management table change handler.
     */
    styleAssetLibUI.textStyleManagementTableChangeHandler = function (e) {
        var textStyleManagementTable = e.currentTarget,
            textStyleManagementTableDeleteButton = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_MANAGEMENT_DELETE_BUTTON).get(0);
        styleAssetLibUI.managementTableChangeHandler(textStyleManagementTable, textStyleManagementTableDeleteButton);
    };

    /**
     * color management table change handler.
     */
    styleAssetLibUI.colorManagementTableChangeHandler = function (e) {
        var colorManagementTable = e.currentTarget,
            colorManagementTableDeleteButton = $(styleConstants.ASSET_LIBRARY_COLOR_MANAGEMENT_DELETE_BUTTON).get(0);
        styleAssetLibUI.managementTableChangeHandler(colorManagementTable, colorManagementTableDeleteButton);
    };

    /**
     * image style management table change handler.
     */
    styleAssetLibUI.imageStyleManagementTableChangeHandler = function (e) {
        var imageStyleManagementTable = e.currentTarget,
            imageStyleManagementTableDeleteButton = $(styleConstants.ASSET_LIBRARY_IMAGE_STYLE_MANAGEMENT_DELETE_BUTTON).get(0);
        styleAssetLibUI.managementTableChangeHandler(imageStyleManagementTable, imageStyleManagementTableDeleteButton);
    };

    /**
     * management Table change handler.
     */
    styleAssetLibUI.managementTableChangeHandler = function (managementTable, deleteButton) {
        if (_.isEmpty(managementTable.selectedItems)) {
            deleteButton.disabled = true;
        } else {
            deleteButton.disabled = false;
        }
    };

    /**
     * delete image from current images.
     */
    styleAssetLibUI.backgroundDeleteButtonClickHandler = function (e) {
        var id = $(e.target).closest("[data-id]").data("id");
        if (id && styleAssetLibVars.currentImageStyles && styleAssetLibVars.currentImageStyles[id]) {
            delete styleAssetLibVars.currentImageStyles[id];
        }
    };

    /**
     * reset image asset select and disable save button.
     */
    styleAssetLibUI.imagesPopoverOpenHandler = function (e) {
        if (e.target == e.currentTarget) {
            $(".assetLibraryImagesSelect").get(0).value = styleConstants.NO_ASSET_VALUE;
            $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR).get(0).disabled = true;
        }
    };

    /**
     * set current images when popover
     */
    styleAssetLibUI.imagesPopoverCloseHandler = function (e) {
        if (e.target == e.currentTarget) {
            var $popover = $(e.target),
                id = $popover.data(styleConstants.POPOVER_ID_DATA_ATTRIBUTE);
            if (!_.isEmpty(id) && styleAssetLibVars.currentImageStyles && styleAssetLibVars.currentImageStyles[id]) {
                var imageSrc = $popover.find("[data-mvfield-elementproperty='imageSrc']").get(0).value;
                if (!_.isEmpty(imageSrc)) {
                    var properties = styleAssetLibUI.getCurrentImageProperties();
                    properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME] = styleConstants.ASSET_LIBRARY_RECENTLY_USED_IMAGE_STYLE_TITLE;
                    styleAssetLibVars.currentImageStyles[id] = properties;
                } else {
                    delete styleAssetLibVars.currentImageStyles[id];
                }
            };
        }
    };

    /**
     * on change mark that field dirty.
     */
    styleAssetLibUI.imagesPopoverFieldChangeHandler = function (e) {
        var id = $(e.target).closest(styleConstants.IMAGE_POPOVER_SELECTOR).data(styleConstants.POPOVER_ID_DATA_ATTRIBUTE);
        styleAssetLibVars.currentImageStyles = styleAssetLibVars.currentImageStyles || {};
        styleAssetLibVars.currentImageStyles[id] = {};
    };

    /**
     * Save current colors.
     */
    styleAssetLibUI.colorInputChangeHandler = function (e) {
        var colorInput = e.target.closest("coral-colorinput"),
            value = colorInput.value;
        styleAssetLibVars.currentUsedColors = styleAssetLibVars.currentUsedColors || [];
        if (styleAssetLibVars.currentUsedColors.indexOf(value) > -1) {
            styleAssetLibVars.currentUsedColors.splice(styleAssetLibVars.currentUsedColors.indexOf(value), 1);
        }
        styleAssetLibVars.currentUsedColors.push(value);
    };

    /**
     * Color inuput save button click handler.
     */
    styleAssetLibUI.colorInputSaveButtonClickHandler = function (e) {
        var colorInputSaveButton = e.target,
            $colorInputSaveButton = $(colorInputSaveButton),
            colorTitle = styleConstants.ASSET_LIBRARY_SAVED_COLORS_TITLE,
            colorId = new Date().getTime().toString(),
            cssPropertiesList = [],
            uiPropertiesList = [],
            properties = {},
            $colorInput = $colorInputSaveButton.closest(styleConstants.COLOR_INPUT_TAG);
        properties = styleAssetLibUI.getColorStyles($colorInput);
        cssPropertiesList = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME];
        uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
        var colorJson = styleAssetLibUtils._createStyleJson(colorId, colorTitle, cssPropertiesList, uiPropertiesList);
        styleAssetLibUtils.saveColor(colorId, colorTitle, cssPropertiesList, uiPropertiesList, $colorInput);
    };

    /**
     * Save current properties of text accordion on saving text-style.
     */
    styleAssetLibUI.textStylesSavePopoverCloseHandler = function () {
        var $textStyleInput = $(styleConstants.TEXT_STYLE_SAVE_INPUT_SELECTOR),
            textStyleInput = $textStyleInput.get(0),
            textStyleTitle = $textStyleInput.adaptTo("foundation-field").getValue(),
            textStyleId = new Date().getTime().toString(),
            cssPropertiesList = [],
            uiPropertiesList = [],
            properties = {};
        textStyleInput.value = CQ.I18n.get(styleUtils.getLeftRailHeaderText());
        if (_.isEmpty(textStyleTitle) || _.isEmpty(textStyleTitle.trim())) {
            return ;
        }
        properties = styleAssetLibUI.getCurrentTextStyles();
        cssPropertiesList = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME];
        uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
        var textStyleJson = styleAssetLibUtils._createStyleJson(textStyleId, textStyleTitle, cssPropertiesList, uiPropertiesList);
        styleAssetLibUtils.saveTextStyle(textStyleId, textStyleTitle, cssPropertiesList, uiPropertiesList);
    };

    /**
     * set image title before saving.
     */
    styleAssetLibUI.assetLibraryImagesSavePopoverOpenHandler  = function (e) {
        $(e.target).find(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_INPUT_SELECTOR).get(0).value = $(".style-fdImageName").text();
    };

    /**
     * Save asset Library images.
     */
    styleAssetLibUI.assetLibraryImagesSavePopoverCloseHandler = function (e) {
        var $imageSaveInput = $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_INPUT_SELECTOR),
            imageSaveInput = $imageSaveInput.get(0),
            imageTitle = imageSaveInput.value,
            imageId = new Date().getTime().toString(),
            cssPropertiesList = [],
            uiPropertiesList = [],
            properties = {};
        if (_.isEmpty(imageTitle) || _.isEmpty(imageTitle.trim())) {
            return ;
        }
        properties = styleAssetLibUI.getCurrentImageProperties(cssPropertiesList, uiPropertiesList);
        uiPropertiesList = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
        var imageJson = styleAssetLibUtils._createStyleJson(imageId, imageTitle, cssPropertiesList, uiPropertiesList);
        styleAssetLibUtils.saveImageStyle(imageId, imageTitle, cssPropertiesList, uiPropertiesList);
    };

    /**
     * Populate text accordion based on text style selected.
     * @param {Object} e event of select box change.
     */
    styleAssetLibUI.textStylesSelectChangeHandler = function (e) {
        if (e.target.value != styleConstants.NO_ASSET_VALUE) {
            var textStyleSelect = e.target,
                $textStyleSelect = $(textStyleSelect),
                textStyleSaveButton = $(styleConstants.TEXT_STYLE_SAVE_BUTTON_SELECTOR).get(0),
                textStyleId = e.target.value,
                textStyleNodeName = styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME,
                textStyleJson = styleAssetLibUtils.searchStyle(textStyleId, textStyleNodeName),
                properties = styleAssetLibUtils._extractProperties(textStyleJson),
                id = properties.id,
                cssProperties = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME],
                cssText = _makeCssText(cssProperties),
                uiProperties = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME];
            if (styleAssetLibUtils.styleIndexInList(textStyleJson, styleAssetLibVars.recentlyUsedStylesJson[textStyleNodeName], styleAssetLibUtils.checkTextStylesEqualFn) > -1) {
                textStyleSaveButton.set("disabled", false);
            } else {
                textStyleSaveButton.set("disabled", true);
            }
            styleUI.clearTextAccordion();
            //empty list is masked properties list.It is empty as we unmask all properties once we select a text-style.
            styleUI._internalPopulatePropertySheet(cssProperties, uiProperties, [], _triggerFoundationFieldChange);
        }
    };

    /**
     * Color Input Slider Change Handler.
     */
    styleAssetLibUI.colorInputSliderChangeHandler = function (e) {
        var slider = e.target,
            $slider = $(slider),
            $colorInput = $slider.closest(styleConstants.COLOR_INPUT_TAG),
            $colorInputSaveButton = $colorInput.find("." + styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS);
        $colorInputSaveButton.get(0).set("disabled", false);
        $colorInput.find("." + styleConstants.COLOR_INPUT_CUSTOM_SWATCH_CLASS + "[checked]").removeAttr("checked");
    };

    /**
     * Image asset select handler.
     * @param {Object} e event of select box change.
     */
    styleAssetLibUI.assetLibraryImagesSelectChangeHandler = function (e) {
        if (e.target.value != styleConstants.NO_ASSET_VALUE) {
            var imageSelect = e.target,
                imageSaveButton = $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR).get(0),
                imageId = e.target.value,
                imageNodeName = styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME,
                imageJson = styleAssetLibUtils.searchStyle(imageId, imageNodeName),
                properties = styleAssetLibUtils._extractProperties(imageJson),
                id = properties.id,
                cssProperties = properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME],
                uiProperties = properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME];
            if (styleAssetLibUtils.styleIndexInList(imageJson, styleAssetLibVars.recentlyUsedStylesJson[imageNodeName], styleAssetLibUtils.checkTextStylesEqualFn) > -1) {
                properties = styleAssetLibUtils.useRecentlyUsedImageStylePreProcessor(properties);
                imageSaveButton.set("disabled", false);
            } else {
                styleAssetLibUtils.useSavedImageStylePreProcessor(properties);
                imageSaveButton.set("disabled", true);
            }
            styleUI.clearBackgroundPopover();
            styleUI.populateBackgroundPopover(properties);
        }
    };

    /**
     * colorinput swatch click handler.
     */
    styleAssetLibUI.colorInputSwatchClickHandler = function (e) {
        if (e.currentTarget.className.indexOf(styleConstants.COLOR_INPUT_CUSTOM_SWATCH_CLASS) > -1) {
            var colorInputSwatch = e.currentTarget,
                $colorInputSwatch = $(colorInputSwatch),
                colorValue = styleAssetLibUtils.getSwatchColor($colorInputSwatch),
                $colorInput = $(colorInputSwatch).closest(styleConstants.COLOR_INPUT_TAG);
            $colorInput.find("." + styleConstants.COLOR_INPUT_CUSTOM_SWATCH_CLASS + "[checked]").removeAttr("checked");
            $(colorInputSwatch).attr("checked", "");
            if ($(colorInputSwatch).closest("coral-accordion-item").is(".colorInputRecentlyUsedColorsAccordion")) {
                $colorInput.find("." + styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS)
                           .get(0).disabled = false;
            } else {
                $colorInput.find("." + styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS)
                           .get(0).disabled = true;
            }
            $colorInput.get(0).value = colorValue;
            $colorInput.trigger("change");
        }
    };

    /**
     * populate background popover with the asset properties.
     * @param {Object} e event of select box change.
     */
    styleUI.populateBackgroundPopover = function (propertiesObject) {
        if (propertiesObject && propertiesObject[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME]) {
            var uiPropertiesList = propertiesObject[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME];
            _.each(uiPropertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    key = data.property,
                    value = data.value,
                    $popoverField = $(".style-imagepopover [data-mvfield-elementproperty='" + key + "']"),
                    popoverField = $popoverField.get(0);
                $popoverField.adaptTo("foundation-field").setValue(value);
                $popoverField.trigger({
                    type : "change",
                    isAssetLibraryImageSelect : true
                });
            });
        }
    };

    /**
     * text Accordion properties change handler.
     * @param {Object} e event of select box change.
     */
    styleAssetLibUI.textAccordionChangeHandler = function (e) {
        var changedWidget = e.target,
            $changedWidget = $(changedWidget),
            propertyName = $changedWidget.data(styleConstants.CSS_PROPERTY_DATA_PROPERTY);
        if (!_.isEmpty(propertyName)) {
            styleUtils.getMsDropDown($(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR).get(0)).set("selectedIndex", 0);
            $(styleConstants.TEXT_STYLE_SAVE_BUTTON_SELECTOR).get(0).set("disabled", false);
            styleAssetLibVars.isTextAccordionDirty = true;
        } else if ($changedWidget.is(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR)) {
            styleAssetLibVars.isTextAccordionDirty = true;
        }
    };

    /**
     * image Property Change Handler.
     * @param {Object} e event of select box change.
     */
    styleAssetLibUI.imagePropertyChangeHandler = function (e) {
        if (e.isAssetLibraryImageSelect) {
            return ;
        }
        var changedWidget = e.target,
            $changedWidget = $(changedWidget),
            propertyName = $changedWidget.data("mvfield-elementproperty"),
            value = changedWidget.value;
        $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR).get(0).value = styleConstants.NO_ASSET_VALUE;
        if (propertyName == styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME && _.isEmpty(value)) {
            $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR).get(0).set("disabled", true);
        } else {
            $(styleConstants.ASSET_LIBRARY_IMAGES_SAVE_BUTTON_SELECTOR).get(0).set("disabled", false);
        }
    };

    /**
     * Clear text accordion.
     */
    styleUI.clearTextAccordion = function () {
        var $textAccordion = $(styleConstants.TEXT_ACCORDION_SELECTOR);
        _.each($textAccordion.find("[data-cssPropertyName],[data-uiPropertyName]"), function (element) {
            var $element = $(element),
                triggerEvent = "foundation-field-change";
            _clearElementValue($element, triggerEvent);
            _unMaskElementProperty($element);
        });
    };

    /**
     * Clear background popover.
     */
    styleUI.clearBackgroundPopover = function () {
        var $backgroundPopoverFields = $(styleConstants.BACKGROUND_POPOVER_FIELDS_SELECTOR);
        _.each($backgroundPopoverFields, function (backgroundPopoverField) {
            var $element = $(backgroundPopoverField),
                triggerEvent = {
                    type : "change",
                    isAssetLibraryImageSelect : true
                };
            _clearElementValue($element, triggerEvent);
        });
    };

    /**
     * Generic function to add style to respective ui.It simply calls the ui callback of
     * of the assets.
     * @param {Array} styleList - List of styles to be added to the ui.
     * @param {function} uiPopulationCallback - population ui function corresponding to the asset.
     */
    styleAssetLibUI.addStyleUI = function (styleList, uiPopulationCallback, preprocessorFn) {
        _.each(styleList, function (styleJson) {
            uiPopulationCallback(styleJson, preprocessorFn);
        });
    };

    /**
     * Get text accordion properties in a asset type object.
     * @return {Object} current text accordion properties in a text-style-asset format object.
     */
    styleAssetLibUI.getCurrentTextStyles = function () {
        var properties = {},
            cssPropertiesList = [],
            uiPropertiesList = [],
            $textStylesSelect = $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR),
            $propertiesWidgetList = $(styleConstants.TEXT_ACCORDION_SELECTOR).find("[data-csspropertyname],[data-uipropertyname]"),
            textStylesSelect = $textStylesSelect.get(0),
            options = {
                currentComponent : styleVars.currentComponent,
                currentSelector : styleVars.currentSelector,
                currentBreakpoint : styleVars.currentBreakpoint,
                currentState : styleVars.currentState
            };
        _.each($propertiesWidgetList, function (propertyWidget) {
            var $propertyWidget = $(propertyWidget),
                isCssProperty = (_.isEmpty($propertyWidget.attr("data-csspropertyname")) ? false : true),
                key = (isCssProperty ? $propertyWidget.attr("data-csspropertyname") : $propertyWidget.attr("data-uiPropertyName")),
                value,
                keyValuePair = "";
            options.property = key;
            options.propertyType = (isCssProperty ? "" : "uiProperties");
            value = styleUtils.getOriginalValue(options);
            if (!_.isEmpty(value)) {
                keyValuePair += key + ":" + value;
                (isCssProperty ? cssPropertiesList.push(keyValuePair) : uiPropertiesList.push(keyValuePair));
            }
        });
        properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME] = cssPropertiesList;
        properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME] = uiPropertiesList;
        return properties;
    };

    /**
     * Get current colorpicker color styles.
     * @param {Object} $colorInput - colorInput whose styles are asked.
     * @return {Object} current text accordion properties in a text-style-asset format object.
     */
    styleAssetLibUI.getColorStyles = function ($colorInput) {
        var value = $colorInput.get(0).value,
            color = {},
            propertyValuePair = "background-color:" + (value);
        color[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME] = [];
        color[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME].push(propertyValuePair);
        return color;
    };

    /**
     *  get Current Image Properties.
     */
    styleAssetLibUI.getCurrentImageProperties = function () {
        var $imagePopoverFields = $(styleConstants.BACKGROUND_POPOVER_FIELDS_SELECTOR),
            properties = {},
            uiProperties = [],
            imageSrcKey = styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME;
        _.each($imagePopoverFields, function (imagePopoverField) {
            var $imagePopoverField = $(imagePopoverField),
                key = $(imagePopoverField).data("mvfield-elementproperty"),
                value = imagePopoverField.value,
                keyValuePair;
            keyValuePair = key + ":" + value;
            if (!_.isEmpty(value)) {
                uiProperties.push(keyValuePair);
            }
        });
        properties[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME] = uiProperties;
        properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME] = [];
        return properties;
    };

    /**
     * Get current used colors list.
     * @return {Array} List of current used colors.
     */
    styleAssetLibUI.getCurrentUsedColorsList = function () {
        var currentUsedColors = styleAssetLibVars.currentUsedColors,
            colorsList = [];
        _.each(currentUsedColors, function (value) {
            if (!_.isEmpty(value)) {
                var color = {},
                    propertyValuePair = "background-color:" + (value);
                color[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME] = [];
                color[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME].push(propertyValuePair);
                colorsList.push(color);
            }
        });
        return colorsList;
    };

    /**
     * show asset library management dialog.
     */
    styleAssetLibUI.showAssetLibraryManagementDialog = function () {
        if (styleVars.isPropertySheetChanged) {
            styleUtils.alertComponentSwitchDisabled();
            return;
        }
        var dialog = $(".assetLibraryManagementDialog").get(0);
        if (!dialog) {
            var url = styleConstants.ASSET_LIBRARY_MANAGEMENT_DIALOG_PATH + ".html";
            $.ajax({
                url : Granite.HTTP.externalize(url),
                type : "GET",
                dataType : 'HTML',
                success : function (data) {
                    dialog = $.parseHTML(data)[0];
                    document.body.appendChild(dialog);
                    Coral.commons.ready(dialog, function () {
                        styleAssetLibUI.populateAssetLibraryManagementDialog();
                        styleAssetLibUI.registerAssetLibraryManagementEventHandlers();
                        dialog.show();
                    });
                }
            });
        } else {
            dialog.show();
        }
    };

    /**
     * populate asset library management dialog with current saved assets.
     */
    styleAssetLibUI.populateAssetLibraryManagementDialog = function () {
        styleAssetLibUI.populateAssetLibraryManagementDialogTextStyles();
        styleAssetLibUI.populateAssetLibraryManagementDialogImagesStyles();
        styleAssetLibUI.populateAssetLibraryManagementDialogColors();
    };

    /**
     * populate asset library management dialog with current saved text styles.
     */
    styleAssetLibUI.populateAssetLibraryManagementDialogTextStyles = function () {
        var savedStyleJson = styleAssetLibVars.savedStylesJson || {},
            savedTextStyles = savedStyleJson[styleConstants.ASSET_LIBRARY_TEXT_STYLES_NODE_NAME];
        _.each(savedTextStyles, function (savedTextStyle) {
            styleAssetLibUI.addTextStyleToManagementTable(savedTextStyle);
        });
    };

    /**
     * initialize asset library ui.
     */
    styleAssetLibUI.initAssetLibraryUI = function () {
        _initColorInput();
        $(styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_SELECTOR).msDropDown();
        $(styleConstants.ASSET_LIBRARY_IMAGES_SELECT_SELECTOR).msDropDown();
    };

    /**
     * populate asset library management dialog with current saved image styles.
     */
    styleAssetLibUI.populateAssetLibraryManagementDialogImagesStyles = function () {
        var savedStyleJson = styleAssetLibVars.savedStylesJson || {},
            savedImagesStylesList = savedStyleJson[styleConstants.ASSET_LIBRARY_IMAGES_NODE_NAME];
        _.each(savedImagesStylesList, function (savedImageStyles) {
            styleAssetLibUI.addImageStyleToManagementTable(savedImageStyles);
        });
    };

    /**
     * populate asset library management dialog with current saved colors.
     */
    styleAssetLibUI.populateAssetLibraryManagementDialogColors = function () {
        var savedStyleJson = styleAssetLibVars.savedStylesJson || {},
            savedColorsList = savedStyleJson[styleConstants.ASSET_LIBRARY_COLORS_NODE_NAME];
        _.each(savedColorsList, function (savedColor) {
            styleAssetLibUI.addColorToManagementTable(savedColor);
        });
    };

    /**
     * text accordion population callback.
     */
    var _triggerFoundationFieldChange = function ($element) {
            $element.trigger("foundation-field-change");
        },

        /**
         * clear element value.
         */
        _clearElementValue = function ($element, triggerEvent) {
            $element.adaptTo("foundation-field").setValue("");
            $element.trigger(triggerEvent);
        },

        /**
         * unmask element of property sheet.
         * @param {Object} $element - element to be unmasked in property sheet.
         */
        _unMaskElementProperty = function ($element) {
            var isCssProperty = ($element.attr("data-csspropertyname") ? true : false),
                propertyName = (isCssProperty ? $element.attr("data-csspropertyname") : $element.attr("data-uipropertyname")),
                propertyType = (isCssProperty ? "cssProperties" : "uiProperties"),
                options = {
                    currentComponent : styleVars.currentComponent,
                    currentSelector : styleVars.currentSelector,
                    currentBreakpoint : styleVars.currentBreakpoint,
                    currentState : styleVars.currentState,
                    operation : styleConstants.UNMASK_OPERATION,
                    propertyName : propertyName,
                    propertyType : propertyType
                };
            styleUtils.maskUnmaskProperty(options);
        },

        /**
         * extract background color value.
         * @param {Array} propertiesList - Properties:Value list.
         */
        _extractBackgroundColorValue = function (propertiesList) {
            var value = "";
            _.find(propertiesList, function (keyValuePair) {
                var data = styleUtils.extractPropertyValue(keyValuePair),
                    currentKey = data.property,
                    currentValue = data.value;
                if (currentKey == "background-color") {
                    value = currentValue;
                    return true;
                }
            });
            return value;
        },

        _addToSelect = function (selectComponent, styleObject, createSelectItemFn, index, preprocessorFn) {
            var properties = styleAssetLibUtils._extractProperties(styleObject),
                value = properties.id,
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                isDefaultValue = value == styleConstants.NO_ASSET_VALUE
                                 && title == styleConstants.ASSET_LIBRARY_TEXT_STYLE_SELECT_DEFAULT_TITLE,
                isValid = isDefaultValue
                          || (!_.isEmpty(value) && !_.isEmpty(title));

            if (isValid) {
                var listItem = createSelectItemFn(properties, preprocessorFn);
                return styleUtils.getMsDropDown(selectComponent).add(listItem, index);
            };
        },
        _createTextStyleSelectItem = function (propertyObject) {
            var selectItemJson = {},
                cssPropertiesList = propertyObject[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME],
                title = propertyObject[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                id = propertyObject.id;
            selectItemJson.value = id;
            selectItemJson.text = CQ.I18n.get(title);
            if (cssPropertiesList) {
                var style = _makeCssText(cssPropertiesList);
                selectItemJson.style = style;
            }
            return selectItemJson;
        },
        _createImageStyleSelectItem = function (propertyObject, preprocessorFn) {
            var uiPropertiesList = propertyObject[styleConstants.ASSET_LIBRARY_UI_PROPERTIES_NODE_PROPERTY_NAME],
                title = propertyObject[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                id = propertyObject.id,
                imageSrcKey = styleConstants.ASSET_LIBRARY_IMAGES_SOURCE_PROPERTY_NAME,
                selectItemJson = {},
                imgSrcValue;
            if (!_.isEmpty(uiPropertiesList)) {
                _.find(uiPropertiesList, function (keyValuePair) {
                    var data = styleUtils.extractPropertyValue(keyValuePair),
                        key = data.property,
                        value = data.value;
                    if (key == imageSrcKey) {
                        if (preprocessorFn) {
                            value = preprocessorFn(value);
                        }
                        imgSrcValue = CQ.shared.HTTP.externalize(styleUtils.makePathAbsolute(value, styleVars.styleAssetsPrefixPath));
                        return true;
                    }
                });
                if (imgSrcValue) {
                    selectItemJson.value = id;
                    selectItemJson.text = CQ.I18n.get(title);
                    selectItemJson.image = imgSrcValue;
                }
            }
            return selectItemJson;
        },
        /**
         * Add colors to accordion in the color input.
         */
        _addToColorInputAccordion = function (colorJson, accordionClass) {
            var properties = styleAssetLibUtils._extractProperties(colorJson),
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                id = properties.id,
                value = _extractBackgroundColorValue(properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]),
                $colorInputWidgetList = $(styleConstants.PROPERTY_SHEET_SELECTOR).find(styleConstants.COLOR_INPUT_SELECTOR),
                accordionSelector = "." + accordionClass;
            _.each($colorInputWidgetList, function (colorInputWidget) {
                var content = $(colorInputWidget).find(accordionSelector + " coral-accordion-item-content").get(0),
                    colorInputSwatch = styleAssetLibUtils.createSwatch(value);
                $(colorInputSwatch).attr(styleConstants.ASSET_LIBRARY_COLORS_ID_ATTRIBUTE, id);
                $(content).prepend(colorInputSwatch);
                $(colorInputWidget).find(accordionSelector).get(0).set({
                    content : content
                });
            });
        },
        _removeFromColorInputAccordion = function (colorJson, accordionClass) {
            var properties = styleAssetLibUtils._extractProperties(colorJson),
                title = properties[styleConstants.ASSET_LIBRARY_TITLE_PROPERTY_NAME],
                id = properties.id,
                value = _extractBackgroundColorValue(properties[styleConstants.ASSET_LIBRARY_CSS_PROPERTIES_NODE_PROPERTY_NAME]),
                $colorInputWidgetList = $(styleConstants.PROPERTY_SHEET_SELECTOR).find(styleConstants.COLOR_INPUT_SELECTOR),
                accordionSelector = "." + accordionClass;
            _.each($colorInputWidgetList, function (colorInputWidget) {
                var $content = $(colorInputWidget).find(accordionSelector + " coral-accordion-item-content");
                $content.find("[" + styleConstants.ASSET_LIBRARY_COLORS_ID_ATTRIBUTE + "=" + id + "]").remove();
            });
        },
        _initColorInput = function () {
            var accordion = new Coral.Accordion().set({
                variant : "quiet"
            });
            $(accordion.items.add({
                label : {
                    innerHTML : styleConstants.ASSET_LIBRARY_DEFAULT_COLORS_ACCORDION_TITLE
                },
                disabled :  false
            })).addClass(styleConstants.ASSET_LIBRARY_DEFAULT_COLORS_ACCORDION_CLASS);
            $(accordion.items.add({
                label : {
                    innerHTML : styleConstants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_TITLE
                },
                disabled : false
            })).addClass(styleConstants.ASSET_LIBRARY_SAVED_COLORS_ACCORDION_CLASS);
            $(accordion.items.add({
                label : {
                    innerHTML : styleConstants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_TITLE
                },
                disabled : false
            })).addClass(styleConstants.ASSET_LIBRARY_RECENTLY_USED_COLORS_ACCORDION_CLASS);
            $("coral-colorinput").find("coral-overlay").append(accordion);
            $colorInputPropertiesSubviewList = $(authoringConstants.coralclass.CORAL_COLORINPUT_PROPERTIES_SUBVIEW);
            _.each($colorInputPropertiesSubviewList, function (colorInputPropertiesSubview) {
                var button = new Coral.Button().set({
                    icon : "add",
                    iconSize : "XS",
                    disabled : true
                });
                $(button).addClass(styleConstants.ASSET_LIBRARY_COLOR_INPUT_SAVE_BUTTON_CLASS);
                $(colorInputPropertiesSubview).prepend(button);
            });
        },
        _makeCssText = function (cssPropertiesList) {
            var style = "";
            _.each(cssPropertiesList, function (property) {
                var key = property.substring(0, property.indexOf(':')),
                    val = property.substring(property.indexOf(':') + 1);
                if (key != "line-height") {
                    style += key + ":" + val + ";";
                }
            });
            return style;
        };
}(window._, $, window.guidelib.touchlib.style));
