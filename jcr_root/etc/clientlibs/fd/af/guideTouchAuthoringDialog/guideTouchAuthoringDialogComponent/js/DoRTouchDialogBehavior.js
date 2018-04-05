/*******************************************************************************
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
 *
 ******************************************************************************/

;(function ($, ns, document, guidetouchlib, formsManager, undefined) {
    var doc = window._afAuthorHook._getAfWindow().document,
        authoringConfigJson = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("guide-authoringconfigjson"),
        dorType = authoringConfigJson.dorType;

    if (dorType !== "generate") {
        return;
    }

    var styleApplied = false,
        thumbnail = $("<img/>")[0],
        dialogUtils = guidetouchlib.editLayer.dialogUtils;

    thumbnail.id = "dor-template-thumbnail";
    $(thumbnail).addClass("dor-thumbnail");
    $(thumbnail).on('error', function () {
        $(this).hide();
    });

    guidetouchlib.editLayer.dialogUtils.styleTemplateSelection = function () {
        // check style has been already applied or not
        if (styleApplied) {
            return;
        }

        // style has to be applied only once so keeping track of it through styleApplied variable
        var template = dialogUtils.selectElement("coral-select", "template", false, true);

        $.each($(template.closest('div')).find('coral-selectlist-item'), function (index, item) {
            if (index > 1) {
                item.innerHTML = '<span class="path"><span>' + item.value + '</span></span>' + '<br/>' + item.textContent;
            }
        });

        // style has been applied; make styleApplied true
        styleApplied = true;
    };

    // called when template is selected through template selection control
    guidetouchlib.editLayer.dialogUtils.changeTemplateSelection = function () {
        var template = dialogUtils.selectElement("coral-select", "template", false, true)[0],
            metaTemplate = dialogUtils.selectElement("input[type='text']", "./metaTemplateRef")[0];

        if (template.value === "") {
            metaTemplate.value = '';
            $(metaTemplate).change(); // trigger change event
            metaTemplate.closest('div').hidden = false;
            return;
        } else {
            metaTemplate.value = template.value;
            $(metaTemplate).change(); // trigger change event
            metaTemplate.closest('div').hidden = true;
        }
    };

    // called when meta template is loaded for first time
    guidetouchlib.editLayer.dialogUtils.loadMetaTemplate = function () {
        var template = dialogUtils.selectElement("coral-select", "template", false, true)[0],
            metaTemplate = dialogUtils.selectElement("input[type='text']", "./metaTemplateRef")[0],
            items = template.items.getAll();

        dialogUtils.showDoRTemplateThumbnail();

        for (var i = 0; i < items.length; i++) {
            if (metaTemplate.value === items[i].value && items[i].value !== "") {
                template.value = metaTemplate.value;
                metaTemplate.closest('div').hidden = true;
                return;
            }
        }

        template.value = "";
        metaTemplate.closest('div').hidden = false;
    };

    // called when actual meta template is changed
    guidetouchlib.editLayer.dialogUtils.changeMetaTemplate = function () {
        var template = dialogUtils.selectElement("coral-select", "template", false, true)[0],
            metaTemplate = dialogUtils.selectElement("input[type='text']", "./metaTemplateRef")[0],
            items = template.items.getAll();

        for (var i = 0; i < items.length; i++) {
            if (metaTemplate.value === items[i].value && items[i].value !== "") {
                template.value = metaTemplate.value;
                metaTemplate.closest('div').hidden = true;
                break;
            }
        }

        dialogUtils.loadMasterPageContents();
        dialogUtils.showDoRTemplateThumbnail();
    };

    guidetouchlib.editLayer.dialogUtils.showOrHideContent = function () {
        var masterPageContentContainer = $(guidetouchlib.editLayer.dialogUtils.constants.DOR_MASTER_PAGE_CONTENT_SELECTOR)[0];
        if (0 === masterPageContentContainer.childElementCount
            || (1 === masterPageContentContainer.childElementCount
            && masterPageContentContainer.children.namedItem('./branding@Delete') !== null)) {
            $(masterPageContentContainer).hide();
            // hide label of fieldset
            masterPageContentContainer.previousElementSibling.hidden = true;
        } else {
            $(masterPageContentContainer).show();
            // show label of fieldset
            masterPageContentContainer.previousElementSibling.hidden = false;
        }
    };

    guidetouchlib.editLayer.dialogUtils.showDoRTemplateThumbnail = function () {
        var template = dialogUtils.selectElement("input[type='text']", "./metaTemplateRef")[0].value,
            thumbnailPath = Granite.HTTP.getContextPath() + template + "/jcr:content/renditions/cq5dam.web.1280.1280.jpeg";

        $("#dor-template-preview").append(thumbnail);

        if (template !== '') {
            $("#dor-template-thumbnail").show();
            $("#dor-template-thumbnail")[0].src = thumbnailPath;
        } else {
            $("#dor-template-thumbnail").hide();
        }
    };

    guidetouchlib.editLayer.dialogUtils.loadMasterPageContents = function () {
        var template = dialogUtils.selectElement("input[type='text']", "./metaTemplateRef")[0].value,
            masterPageContentContainer = $(guidetouchlib.editLayer.dialogUtils.constants.DOR_MASTER_PAGE_CONTENT_SELECTOR),
            configPropertiesContainer = $(guidetouchlib.editLayer.dialogUtils.constants.DOR_CONFIG_PROPERTIES_SELECTOR),
            doc = window._afAuthorHook._getAfWindow().document,
            guidePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path"),
            src = "/mnt/override/libs/" +
                guidetouchlib.editLayer.dialogUtils.constants.DOR_PROPERTIES_COMPONENT_RELATIVE_PATH +
                "/cq:dialog.html" +
                "?adaptiveForm=" + encodeURIComponent(guidePath) +
                "&metaTemplateRef=" + encodeURIComponent(template);

        ns.history.Manager.setBlocked(true);
        $(window).trigger('loading-show');
        $.ajax({
            url : src,
            type : "get"
        }).always(function () {
            $(window).trigger('loading-hide');
        }).done(function (html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");
            parser.parse(html, true).then(function (containerHTML) {
                var deleteBrandingNode = '<input type="hidden" name="./branding@Delete" />',
                    masterPageContent = $($(containerHTML).find(guidetouchlib.editLayer.dialogUtils.constants.DOR_MASTER_PAGE_CONTENT_SELECTOR)),
                    configProperties = $($(containerHTML).find(guidetouchlib.editLayer.dialogUtils.constants.DOR_CONFIG_PROPERTIES_SELECTOR));

                $(deleteBrandingNode).appendTo(masterPageContent);
                masterPageContent.addClass("guide-dialog");
                masterPageContentContainer.replaceWith(masterPageContent);
                configPropertiesContainer.replaceWith(configProperties);
                $(masterPageContent.parents("form")[0]).trigger('foundation-contentloaded');
            });
        });
    };

    guidetouchlib.editLayer.dialogUtils.changeSelectOptionSeparator = function () {
        var selectOptionSeparator = dialogUtils.selectElement("coral-select", 'selectOptionSeparator', true)[0],
            optionSeparator = dialogUtils.selectElement("input[type='text']", './optionSeparator', true)[0];

        if (selectOptionSeparator.items.last().value === selectOptionSeparator.value) {
            var items = selectOptionSeparator.items.getAll();
            for (var i = 0; i < items.length - 1; i++) {
                if (items[i].value === optionSeparator.value) {
                    optionSeparator.value = '';
                    break;
                }
            }
            // show other option separator
            optionSeparator.parentElement.hidden = false;
        } else {
            // hide other option separator
            optionSeparator.value = selectOptionSeparator.value;
            optionSeparator.parentElement.hidden = true;
        }
    };

    guidetouchlib.editLayer.dialogUtils.loadOrChangeOptionSeparator = function () {
        var selectOptionSeparator = dialogUtils.selectElement("coral-select", 'selectOptionSeparator', true)[0],
            optionSeparator = dialogUtils.selectElement("input[type='text']", './optionSeparator', true)[0];

        var items = selectOptionSeparator.items.getAll();
        for (var i = 0; i < items.length - 1; i++) {
            if (items[i].value === optionSeparator.value) {
                selectOptionSeparator.value = optionSeparator.value;
                // hide other option separator
                optionSeparator.parentElement.hidden = true;
                return;
            }
        }

        // show other option separator
        selectOptionSeparator.value = selectOptionSeparator.items.last().value;
        optionSeparator.parentElement.hidden = false;
    };

    guidetouchlib.editLayer.dialogUtils.showOrHideBrandingComponent = function (selectionComponentName) {
        var selectionComponent = dialogUtils.selectElement("coral-select", selectionComponentName, false, true)[0],
            brandingComponentName = $(selectionComponent).data("brandingComponent"),
            type = $(selectionComponent).data("type"),
            inputType = "",
            brandingComponent;

        if (type === "Image") {
            inputType = "coral-fileupload";
            brandingComponentName = brandingComponentName.replace("./", "").replace("/value", "");
            brandingComponent = $($(inputType + "[action$='" + brandingComponentName + "']")[0]).parent()[0];
        } else if (type === "StaticText") {
            inputType = "textarea";
            brandingComponent = dialogUtils.selectElement(inputType, brandingComponentName, true, true)[0];
            // get actual branding component name from component itself
            brandingComponentName = $(brandingComponent).attr("name");
        }

        if (selectionComponent.value == null || selectionComponent.value.length === 0 || !selectionComponent.value.trim()) {
            $(brandingComponent).removeAttr("hidden");
            if (brandingComponentName.length != 0 && brandingComponentName.includes("@Delete") === true) {
                brandingComponentName = brandingComponentName.replace("@Delete", "");
                $(brandingComponent).attr("name", brandingComponentName);
            }
        } else {
            $(brandingComponent).attr("hidden", "");
            if (brandingComponentName.length != 0 && brandingComponentName.includes("@Delete") === false) {
                brandingComponentName += "@Delete";
                $(brandingComponent).attr("name", brandingComponentName);
            }
        }
    };

    guidelib.touchlib.editLayer.dialogUtils.initPreviewDoR = function () {
        var dorTemplatePath = authoringConfigJson.dorTemplateRef,
            pathParts, template, contentRoot, url;

        if (dorTemplatePath == undefined || dorTemplatePath == null || dorTemplatePath === '') {
            return;
        }

        pathParts = dorTemplatePath.split('/');
        template = pathParts.splice(-1, 1)[0];
        contentRoot = 'crx://' + pathParts.join('/');
        url = '/content/xfaforms/profiles/default.print.pdf' +
            '?contentRoot=' + encodeURIComponent(contentRoot) +
            '&template=' + encodeURIComponent(template);

        openInNewTab = function () {
            $("#dor-template-preview-link").attr("href", Granite.HTTP.externalize(url)).attr("target", "_blank")[0].click();
        };

        $("#preview-dor").on("click.preview-dor", openInNewTab);
    }();
}(jQuery, Granite.author, document, window.guidelib.touchlib, window.Form));
