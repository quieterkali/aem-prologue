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

;(function (window, _, $, style, theme) {

    var themeUtils = theme.utils,
        styleUtils = style.utils,
        styleVars = style.vars;

    _addSelectorInfo = function (mappings, $contents) {
        var components = Object.keys(mappings.components);
        _.each(components, function (component) {
            var selectors = mappings.components[component];
            _.each(selectors, function (selector, key) {
                var selectorString = selector.cssSelector,
                    elements = $contents.find(selectorString);
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j],
                        curSelectorValue = $(element).data("theme-selector");
                    curComponentValue = $(element).data("theme-component");
                    if (curSelectorValue) {
                        var oldSelectorString = mappings.components[curComponentValue][curSelectorValue].cssSelector,
                            oldSpecificity = cssExplain(oldSelectorString).specificity,
                            newSpecificity = cssExplain(selectorString).specificity;
                        if (styleUtils.isSpecificityHigher(newSpecificity, oldSpecificity)) {
                            $(element).data("theme-selector", key);
                            $(element).data("theme-component", component);
                        }
                    } else {
                        $(element).data("theme-selector", key);
                        $(element).data("theme-component", component);
                    }
                }
            });
        });
    };

    var _handleOverlaySelectorButtonClick = function (event) {
        var target = event.target;
        if (!$(".js-editor-SidePanel-toggle").is(".is-selected")) {
            $(".js-editor-SidePanel-toggle").click();
        }
        if (target.classList.contains('overlay-active')) {
            return;
        }
        if (target.id == 'af-overlay-selector-parent' || target.id == 'af-overlay-selector-parent-icon') {
            style.overlay.repositionOverlay(styleVars.currentOverlayNode.parentNode);
            return;
        }
        if (styleVars.isPropertySheetChanged) {
            styleUtils.alertComponentSwitchDisabled();
            return;
        }
        $(target).parent().find("[data-target-selector]").removeClass('overlay-active');
        $(target).addClass('overlay-active');
        theme.utils.onOverlaySelection($(target).data('target-component'), $(target).data('target-selector'));
        styleVars.currentSelectedOverlayTarget = target;
    };

    var _addOverlayDiv = function (mappings) {
        //$(themeUtils.getContentFrame()).contents().find("body").append(
        $("#ContentWrapper").append(
        //$("body").append(
            "<div id='af-overlay-selector'>" +
            " <div id='af-overlay-selector-text'></div>" +
            " <div class='af-overlay-selector-top'></div>" +
            " <div class='af-overlay-selector-left'></div>" +
            " <div class='af-overlay-selector-right'></div>" +
            " <div class='af-overlay-selector-bottom'></div>" +
            "</div>");

        $("#af-overlay-selector-text").on('click.style.overlay', '.af-overlay-selector-button', function (event) {_handleOverlaySelectorButtonClick(event);});

        $(themeUtils.getContentFrame()).contents().click(function (event) {
            styleUtils.closePopoverIfAny();
            if (Granite.author.layerManager.getCurrentLayerName() == "Theme Edit") {
                event.preventDefault();
                style.overlay.repositionOverlay(event.target);
            }
        });

        $(themeUtils.getContentFrame()).resize(function () {
            if (styleVars.currentSelectedOverlayTarget) {
                style.overlay.repositionOverlay(styleVars.currentSelectedOverlayTarget, true);
            }
        });
    };

    $(document).on("cq-layer-activated", function (event) {
        //var $contentFrameContents = $(themeUtils.getContentFrame()).contents(),
        var $contentFrameContents = $('body'),
            $overlayElement = $contentFrameContents.find('#af-overlay-selector');
        if (event.layer == "Theme Edit") {
            if (!Granite.author.theme.reloadRequested) {
                $overlayElement.show();
                $contentFrameContents.find("[data-theme-component='" + styleVars.currentComponent + "'][data-theme-selector='" + styleVars.currentSelector + "']").addClass("overlayFieldsHighlight");
                if (styleVars.currentOverlayNode) {
                    style.overlay.repositionOverlay(styleVars.currentOverlayNode);
                }
                Granite.author.OverlayWrapper.hide();
            }
        } else {
            $overlayElement.hide();
            $contentFrameContents.find("[data-theme-component='" + styleVars.currentComponent + "'][data-theme-selector='" + styleVars.currentSelector + "']").removeClass("overlayFieldsHighlight");
        }
    });

    style.overlay.repositionOverlay = function (target, force) {
        if (!target) {
            return;
        }
        if (!force && target == styleVars.currentSelectedOverlayTarget || target.tagName === 'HTML') {
            return;
        }
        var $overlaySelector = $('body').find('#af-overlay-selector'),
            elements = {
                actionButtons : $overlaySelector.find(style.constants.SELECTOR_OVERLAY_ACTION_BUTTON_SELECTOR),
                top : $overlaySelector.find(style.constants.SELECTOR_OVERLAY_TOP_SELECTOR),
                left : $overlaySelector.find(style.constants.SELECTOR_OVERLAY_LEFT_SELECTOR),
                right : $overlaySelector.find(style.constants.SELECTOR_OVERLAY_RIGHT_SELECTOR),
                bottom : $overlaySelector.find(style.constants.SELECTOR_OVERLAY_BOTTOM_SELECTOR)
            };
        if (!force) {
            styleVars.currentSelectedOverlayTarget = target;
            var selectionText = "",
                selectors = [],
                selectionList = [],
                $target = $(target),
                selectorsString = $target.data('theme-selector'),
                componentsString = $target.data('theme-component');
            if (selectorsString) {
                selectionText = theme.utils.buildSelectionText(selectorsString, componentsString, $(target));
                selectionList = theme.utils.buildSelectionList(selectorsString, componentsString);
            }
            if (!selectorsString && target.parentNode) {
                return style.overlay.repositionOverlay(target.parentNode);
            }
            style.overlay.drawOverlay($overlaySelector, selectionText, $target, elements, style.overlay.drawSelectorOverlayButtons);
            if (target != styleVars.currentOverlayNode) {
                styleVars.currentOverlayNode = target;
                $(window).trigger("guideOverlaySelectionChange", selectionList, target);
            }
            return ;
        } else if (force) {
            var selectionText = "",
                selectors = [],
                selectionList = [],
                $target = $(styleVars.currentOverlayNode),
                selectorsString = $target.data('theme-selector'),
                componentsString = $target.data('theme-component');
            if (selectorsString) {
                selectionText = theme.utils.buildSelectionText(selectorsString, componentsString, $(target));
                selectionList = theme.utils.buildSelectionList(selectorsString, componentsString);
                style.overlay.drawOverlay($overlaySelector, selectionText, $target, elements, style.overlay.drawSelectorOverlayButtons);
                return;
            }
            return ;
        }
    };

    theme.registerOverlay = function (mappings, $contentFrameContents) {
        _addSelectorInfo(mappings, $contentFrameContents);
        _addOverlayDiv(mappings);
    };

    theme.utils.buildSelectionText = function (selector, component, $target) {
        var selectionText;
        var name = styleUtils.getSelectorMetaData(component, selector, "name");
        if (styleVars.currentSelector == selector && styleVars.currentComponent == component) {
            selectionText = "<button data-target-component='" + component + "' data-target-selector='" + selector + "' class='overlay-active af-overlay-selector-button af-overlay-selector' type='button'>" + name + "</button>";
        } else {
            selectionText = "<button data-target-component='" + component + "' data-target-selector='" + selector + "' class='af-overlay-selector-button af-overlay-selector' type='button'>" + name + "</button>";
        }
        var secondarySelectorsList = styleUtils.getSelectorMetaData(component, selector, "secondarySelectors");
        if (secondarySelectorsList) {
            var secondarySelectors = secondarySelectorsList.split(",");
            _.each(secondarySelectors, function (obj) {
                var indexOfColon = obj.indexOf(":"),
                    secondaryComponent = obj.substring(0, indexOfColon),
                    secondarySelector = obj.substring(indexOfColon + 1),
                    secondaryCssSelector = styleUtils.getSelectorMetaData(secondaryComponent, secondarySelector, "cssSelector"),
                    secondaryName;
                if ($target.is(secondaryCssSelector)) {
                    secondaryName = styleUtils.getSelectorMetaData(secondaryComponent, secondarySelector, "name");
                    if (styleVars.currentSelector == secondarySelector && styleVars.currentComponent == secondaryComponent) {
                        selectionText += "<button data-target-component='" + secondaryComponent + "' data-target-selector='" + secondarySelector + "' class='overlay-active af-overlay-selector-button af-overlay-selector' type='button'>" + secondaryName + "</button>";
                    } else {
                        selectionText += "<button data-target-component='" + secondaryComponent + "' data-target-selector='" + secondarySelector + "' class='af-overlay-selector-button af-overlay-selector' type='button'>" + secondaryName + "</button>";
                    }
                }
            });
        }
        selectionText += "<button class='af-overlay-selector-button af-overlay-selector-parent' id='af-overlay-selector-parent' type='button'><coral-icon id='af-overlay-selector-parent-icon' icon='selectContainer' size='S'></coral-icon></button>";
        return selectionText;
    };

    theme.utils.buildSelectionList = function (selectorsString, componentsString) {
        var selectionList = [],
            selectors = selectorsString.split(","),
            components = componentsString.split(",");
        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i],
                component = components[i];
            selectionList.push({"selector" : selector,"component" : component});

        }
        return selectionList;
    };

}(this, window._, $, window.guidelib.touchlib.style, window.guidelib.touchlib.theme));
