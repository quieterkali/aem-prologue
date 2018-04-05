// jscs:disable requireDotNotation
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

/**
 * @package guidelib.util.GuideUtil
 * @version 0.0.1
 *
 * Created with IntelliJ IDEA.
 * User: bsirivel
 * Date: 29/11/13
 * Time: 2:52 PM
 * To change this template use File | Settings | File Templates.
 */
(function (window, $, guidelib, _) {
    var guideLoadingDiv = null,
        gd = function () {
            if (guideLoadingDiv == null) {
                guideLoadingDiv = $("#loadingPage");
            }
            return guideLoadingDiv;
        };
    var GuideUtil = guidelib.util.GuideUtil = {
        GUIDE_ITEM_CONTAINER_SUFFIX : "_guide-item-container",
        DATA_GUIDE_ITEM_CONTAINER : "data-guide-item-container",
        GUIDE_ITEM_NAV_CONTAINER_SUFFIX : "_guide-item-nav-container",
        GUIDE_ITEM_SUFFIX : "_guide-item",
        DATA_GUIDE_ITEM : "data-guide-item",
        GUIDE_ITEM_NAV_SUFFIX : "_guide-item-nav",
        GUIDE_NODE_ID_SUFFIX : "__",
        GUIDE_VIEW_BIND_ATTR : "data-guide-view-bind",
        GUIDE_LAYOUT_CLASS : ".guideLayout",
        GUIDE_WIZARD_LAYOUT : "guideWizardLayout",
        GUIDE_TABBED_PANEL_LAYOUT : "guideTabbedPanelLayout",
        GUIDE_VERTICAL_TABBED_PANEL_LAYOUT : "guideVerticalTabbedPanelLayout",
        DATA_LAYOUT_ITEM_INDEX : "data-layout-item-index",
        SCRIBBLE_RESIZE_TIME_INTERVAL : 1000,       //--to set time-interval for setTimeout
        MANDATORY_TEST : "nullTest", // string to signify the reason for failed test being mandatory
        FORMAT_TEST : "formatTest", // string to signify the reason for failed test being validate picture clause test
        SCRIPT_TEST : "scriptTest", // string to signify the reason for failed test being validate script test
        MAXIMUM_VALUE_TEST : "maximumValueTest", // string to signify the reason for failed test being maximum value test
        MINIMUM_VALUE_TEST : "minimumValueTest", // string to signify the reason for failed test being minimum value test
        TOTAL_DIGITS_TEST : "totalDigitTest", // string to signify the reason for failed test being total digit test
        MINIMUM_LENGTH_TEST : "minimumLengthTest", // string to signify the reason for failed test being minimum length test
        LENGTH_TEST : "totalLengthTest", // string to signify the reason for failed test being total length test
        FM_DAM_ROOT : "/content/dam/formsanddocuments/",
        FM_AF_ROOT : "/content/forms/af/",
        GUIDE_CONTAINER_FORM_CLASS : "#guideContainerForm",
        GUIDE_CONTAINER_THEME_CLASS : "#guideContainerTheme",
        EVENT_PROPERTY_MAPPING : {
            "Calculate" : "calcExp",
            "Visibility" : "visibleExp",
            "Initialize" : "initScript",
            "Click" : "clickExp",
            "Value Commit" : "valueCommitScript",
            "Enabled" : "enabledExp",
            "Validate" : "validateExp",
            "Completion" : "completionExp",
            "Summary" : "summaryExp",
            "Options" : "optionsExp",
            "Navigation" : "navigationChangeExp"
        },

        /**
         * Types of chart available
         */
        chartType : {
            LINE : "line",
            POINT : "point",
            LINE_POINT : "linepoint",
            AREA : "area",
            BAR : "bar",
            COLUMN : "column",
            PIE : "pie",
            DONUT : "donut"
        },

        xfaExprMap : {
            "clickExp" : "click",
            "enabledExp" : null,
            "visibleExp" : null
        },

        _globalUniqueId : (new Date()).getTime(),

        generateUID : function () {
            return "GUID" + (++this._globalUniqueId);
        },

        getId : function (myid) {
            return "#" + myid.replace(/(:|\.|\[|\])/g, "\\$1");
        },
        /**
         * Utility method to compare version
         * @param version1
         * @param version2
         */
        compareVersion : function (version1, version2) {
            if (!_.isEmpty(version1) && !_.isEmpty(version2)) {
                var ver1Array = version1.split("."),
                    ver2Array = version2.split("."),
                    ver1MajorVersion,
                    ver1MinorVersion,
                    ver2MajorVersion,
                    ver2MinorVersion;
                // check if array length is 2 to validate the version value
                if (ver1Array.length === 2 && ver2Array.length === 2) {
                    ver1MajorVersion = parseInt(ver1Array[0], 10);
                    ver1MinorVersion = parseInt(ver1Array[1], 10);
                    ver2MajorVersion = parseInt(ver2Array[0], 10);
                    ver2MinorVersion = parseInt(ver2Array[1], 10);
                    // do the comparison
                    return (ver1MajorVersion == ver2MajorVersion)
                        ? ver1MinorVersion - ver2MinorVersion
                        : ver1MajorVersion - ver2MajorVersion;
                }
            }
        },

        guideSomToId : function (som) {
            //Note: If you change the som versus id logic than make sure you also take care of GuideBridge.setFocus and
            //AuthoringUtils.setAuthoringFocus which unfortunately based on this specially(AuthoringUtils.setAuthoringFocus).
            if (som) {
                return ("" + som).replace(/\./g, "-");
            }
            return null;
        },

        /**
         * Returns whether the chart type supports legends or not.
         * Legend is not available for Line / Point / Line and Point / Area chart types.
         * @param chartType
         * @returns {boolean}
         */
        isChartLegendApplicable : function (chartType) {
            return !(chartType === GuideUtil.chartType.LINE || chartType === GuideUtil.chartType.POINT
                || chartType === GuideUtil.chartType.LINE_POINT || chartType === GuideUtil.chartType.AREA);
        },

        /**
         * Returns whether the chart type supports tooltip or not.
         * Tooltip is not available for Line / Area chart types.
         * @param chartType
         * @returns {boolean}
         */
        isChartTooltipApplicable : function (chartType) {
            return !(chartType === GuideUtil.chartType.LINE || chartType === GuideUtil.chartType.AREA);
        },

        /**
         * Returns whether the chart type supports Axis title or not.
         * Axis Title is not available for Pie / Area chart types.
         * @param chartType
         * @returns {boolean}
         */
        isChartAxisTitleApplicable : function (chartType) {
            return !(chartType === GuideUtil.chartType.PIE || chartType === GuideUtil.chartType.DONUT);
        },

        modelElSelector : function (id) {
            var modelSelector = '[' + GuideUtil.GUIDE_VIEW_BIND_ATTR + ']';
            if (id) {
                modelSelector = '[' + GuideUtil.GUIDE_VIEW_BIND_ATTR + '="' + id + '"]';
            }
            return modelSelector;
        },

        /**
         * Checks if the given child model is part of sub tree of container model.
         * @param {?Object} container   container model
         * @param {?Object} child       child model
         * @returns {boolean} true, if child belongs to sub tree of container, false otherwise
         */
        isChildPartOfContainer : function (container, child) {
            if (child != null && container != null) {
                return child.somExpression.lastIndexOf(container.somExpression, 0) === 0;
            }
            return false;
        },

        relativeSom : function (relativeTo, fullSom) {
            if (!relativeTo || !fullSom) {
                return fullSom;
            } else {
                if (fullSom.indexOf("guide[0].") == 0) {
                    fullSom = fullSom.substring(9);
                }
                if (relativeTo.indexOf("guide[0].") == 0) {
                    relativeTo = relativeTo.substring(9);
                }

                if (fullSom.indexOf(relativeTo) == 0) {
                    return fullSom.substring(relativeTo.length + 1);
                } else {
                    return fullSom;
                }
            }
        },

        evalSom : function (som, obj) {
            if (som && obj) {
                return som.split('.').reduce(
                    function (obj, i) {
                        return obj[i];
                    },
                    obj
                );
            } else {
                return null;
            }
        },

        itemContainerSelector : function (id) {
            return "#" + id + GuideUtil.GUIDE_ITEM_CONTAINER_SUFFIX;
        },

        alternateItemContainerSelector : function (id) {
            return "[" + GuideUtil.DATA_GUIDE_ITEM_CONTAINER + "=" + (id + GuideUtil.GUIDE_ITEM_CONTAINER_SUFFIX) + "]";
        },

        itemNavContainerSelector : function (id) {
            var navContainerId = id + GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX;
            return ("#" + navContainerId + ", [data-guide-id=" + navContainerId + "]");
        },

        checkIfTableRow : function (model) {
            return model && model instanceof guidelib.model.GuideTableRow;
        },

        itemSelector : function (id, model) {
            if (GuideUtil.checkIfTableRow(model)) {
                return "[" + GuideUtil.DATA_GUIDE_ITEM + "=" + id + GuideUtil.GUIDE_ITEM_SUFFIX + "]";
            } else {
                return "#" + id + GuideUtil.GUIDE_ITEM_SUFFIX;
            }
        },

        itemNavSelector : function (id) {
            var navId = id + GuideUtil.GUIDE_ITEM_NAV_SUFFIX;
            return ("#" + navId + ", [data-guide-id=" + navId + "]");
        },

        summarySelector : function (id) {
            return ".guideSummary[data-guide-id='" + id + "']";
        },

        propSelector : function (prop, id) {
            return "[data-guide-prop=" + prop + "][data-guide-id='" + id + "']";
        },

        getLocalizedMessage : function (category, message, snippets) {
            var resolvedMessage = message;
            if (snippets) {
                //resolve message with snippet
                resolvedMessage = resolvedMessage.replace(/{(\d+)}/g, function (match, number) {
                    return typeof snippets[number] != 'undefined'
                        ? snippets[number]
                        : match;
                });
            }
            var text = "";
            if (category) {
                text += " [" + category + "]";
            }
            text += "  " + resolvedMessage + "\r\n";
            return text;
        },

        elIdWithoutNodeIdSuffix : function (id) {
            var nodeIdSuffix = GuideUtil.GUIDE_NODE_ID_SUFFIX;
            if (id && (id.indexOf(GuideUtil.GUIDE_NODE_ID_SUFFIX) == (id.length - nodeIdSuffix.length))) {
                id = id.substring(0, (id.length - nodeIdSuffix.length)); // remove id suffix
                return id;
            } else {
                return "";
            }
        },

        loadCSS : function (filename) {
            if (!filename) {
                return;
            }
            //Needs to be loaded in both authoring and runtime so not using ClientLibraryManager. Need better way to do that
            var file = window.document.createElement("link");
            file.setAttribute("rel", "stylesheet");
            file.setAttribute("type", "text/css");
            file.setAttribute("href", filename);

            if (typeof file !== "undefined") {
                window.document.getElementsByTagName("head")[0].appendChild(file);
            }
        },
        /**
         * This API sets focus on first element of the Table Row.  First element can consists of add,edit,delete control and a field.
         * This API auto computes the presence of these elements and set's focus on the field.
         * @param $row HTML element of the row to be created
         * @memberof GuideUtil
         * @since 6.3
         * @private
         */
        setFocusOnFirstItemOfTableRow : function ($row) {
            var $editControl = $row.find(".guideTableRuntimeEditControl"),
                id = null,
                bIsEditControlMadeVisible = false,
                model = null;
            // Setting focus on field, since td is not focusable
            if ($editControl.length > 0) {
                $editControl.each(function () {
                    if ($(this).is(":visible")) {
                        // Only one edit control can be visible
                        // we dont support two
                        bIsEditControlMadeVisible = true;
                        $editControl.eq(0).focus();
                    }
                });
            }
            if (!bIsEditControlMadeVisible) {
                // Find the field and use guidebridge to set focus on the first field
                id = $row.find("td:first-child").find(".guideFieldNode").data("guideViewBind");
                model = (id != null) ? guideBridge._resolveId(id) : null;
                if (model != null) {
                    guideBridge.setFocus(model.somExpression);
                }
            }
        },

        // selector points to wrapper div since it has a unique id
        adjustElementHeight : function (selector, isPopUp) {
            if (!isPopUp) {
                var self = $("#" + selector).find(".guideFieldWidget"),
                    maxHeight,
                    clientHeight = self.css("height"),
                    childrenTotalHeight = 0,
                    parentHeight = 0,
                    $child = null,
                    clone = self.clone()[0],
                    $clonedChild = null;

                // Create a dummy element to get the height
                $(clone).css({
                    'visibility' : 'hidden',
                    'max-height' : self.css("max-height"),
                    'top' : '-2000px',
                    'left' : '-2000px',
                    'position' : 'absolute',
                    'height' : (clientHeight !== "0px") ? clientHeight : "auto"
                }).appendTo('body');
                parentHeight = $(clone).height();
                // Walk through the children and adjust their height
                self.children().each(function (index) {
                    $clonedChild = $(clone).children().eq(index);
                    if ($clonedChild.height() >= parentHeight && ($child === null)) {
                        $child = $(this);
                    } else {
                        childrenTotalHeight += $clonedChild.height();
                    }
                });
                if ($child && (parentHeight - childrenTotalHeight) > 0) {
                    $child.height((parentHeight - childrenTotalHeight) + "px");
                } else if (parentHeight - childrenTotalHeight <= 0) {
                    self.children().first().css("height", "auto");
                }
                $(clone).remove();
            } else {
                var modalBody = $("#" + selector).find(".guide-modal-body"),
                    guideTnCContent = $("#" + selector).find(".guide-tnc-content"),
                    paddingTop = modalBody.innerHeight() - modalBody.height();
                // Adjust the max height of the modal body equal to window's height
                // in case of pop up enabled
                modalBody.css("max-height", $(window).height());
                // Since modal-body can have a padding, calculate the total padding
                // Subtract the padding and set max-height for tnc content
                guideTnCContent.css("max-height", $(window).height() - paddingTop);

            }
        },

        _resizeScribbleField : function () {
            var self = $('.guidescribble').find('.guideFieldWidget'),
                that = this;
            _.each(self, function (fieldWidget, index) {
                guidelib.util.GuideUtil._computeHeightAndWidthForScribble(fieldWidget);
            });
        },

        _computeHeightAndWidthForScribble : function (fieldWidget) {
            var fieldWidthInPx,
                fieldHeightInPx,
                ratio;
            fieldWidget = $(fieldWidget);
            fieldWidthInPx = fieldWidget.innerWidth();
            ratio = fieldWidget.data('guideAspectRatio');
            fieldHeightInPx = fieldWidthInPx / ratio;
            fieldHeightInPx = (fieldHeightInPx < 34) ? 34 : fieldHeightInPx;
            fieldWidget.css('height', fieldHeightInPx + "px");
            fieldWidget.find("img").css('height', fieldHeightInPx + "px");
        },

        updateContainer : function (path, data) {
            $.ajax({
                url : path,
                type : "POST",
                data : {"wcmmode" : "disabled", "data" : data, "targetMode" : "true"},
                sync : true,
                success : function (result) {
                    if (!window.guidelib.guideReplaced) {
                        //NOCHECKMARX - result is coming from server side preventing Reflective XSS All Clients.
                        var $result = $(result);
                        $(GuideUtil.GUIDE_CONTAINER_FORM_CLASS).replaceWith($result.filter(GuideUtil.GUIDE_CONTAINER_FORM_CLASS));
                        $(GuideUtil.GUIDE_CONTAINER_THEME_CLASS).replaceWith($result.filter(GuideUtil.GUIDE_CONTAINER_THEME_CLASS));
                    }
                },
                error : function (error) {
                    if (window.console) {
                        window.console.log(error);
                    }
                }
            });
        },

        fetchDataXml : function (initialGuideJsonData) {
            var data = "", initialGuideMergedJson;
            if (initialGuideJsonData) {
                initialGuideMergedJson = JSON.parse(initialGuideJsonData["guidemergedjson"] || "null");
            }
            if (initialGuideMergedJson) {
                data = initialGuideMergedJson.guideState.completeDataXML;
            }
            return data;
        },

        detectContextPath : function () {
            var SCRIPT_URL_REGEXP = /^(?:http|https):\/\/[^\/]+(\/.*)\/(?:etc(\/.*)*\/clientlibs|libs(\/.*)*\/clientlibs|apps(\/.*)*\/clientlibs).*\.js(\?.*)?$/;
            var contextPath, scripts, result;
            try {
                if (window.CQURLInfo) {
                    contextPath = window.CQURLInfo.contextPath || "";
                } else {
                    scripts = window.document.getElementsByTagName("script");
                    for (var i = 0; i < scripts.length; i++) {
                        // in IE the first script is not the expected widgets js: loop
                        // until it is found
                        result = SCRIPT_URL_REGEXP.exec(scripts[i].src);
                        if (result) {
                            contextPath = result[1];
                            return contextPath;
                        }
                    }
                    contextPath = "";
                    return contextPath;
                }
            } catch (e) {
                if (window.console) {
                    window.console.log(error);
                }
            }
        },

        /**
         * Util for getting HTML Id
         * @param myid
         * @returns {*}
         * @private
         */
        _getId : function (myid) {
            return guidelib.util.GuideUtil.getId(myid);
        },

        initializeHelp : function () {
            var shortVisible, getId;
            shortVisible = false;
            getId = GuideUtil._getId;

            // Note: Using delegated event here to fix issue LC-3911686
            // This is done because we have to add this listener every time a new repeatable instance is created
            // Which means initialize help should be called everytime after add instance and the selector written below
            // should be made more generic. This has to be done later, else it may impact performance of AF
            $(window.document).on("click", "[data-guide-longDescription]", function () {
                var index, longDescId, shortDescId, fieldId, longVisible, longDescDiv, shortDescDiv, fieldModel, fieldView;
                longDescId = $(this).data('guide-longdescription');
                index = longDescId.indexOf('_guideFieldLongDescription');
                if (index === -1) {
                    index = longDescId.indexOf('_guidePanelLongDescription');
                }
                fieldId = $(this).data('guide-longdescription').substring(0, index);
                shortDescId = fieldId + '_guideFieldShortDescription';
                /* get the divs*/
                longDescDiv = $(getId(longDescId));
                shortDescDiv = $(getId(shortDescId));
                longDescDiv.toggle();
                longVisible = longDescDiv.is(':visible');
                fieldModel = window.guideBridge._resolveId(fieldId);
                fieldView = window.guideBridge._guideView.getView(fieldModel.somExpression);
                /*hiding shortDesc since longDesc is visible */
                if (longVisible) {
                    shortDescDiv.hide();
                } else {
                    if (fieldView != null) {
                        fieldView.setActive(null, true);
                    }
                    if ($(this).data('guide-alwaysshow')) {
                        shortDescDiv.show();
                    }
                }

                fieldView.visibleHelpElement = longVisible ? "longDescription" : shortDescDiv.is(":visible") ? "shortDescription" : "none";

                fieldModel._triggerOnBridge("elementHelpShown", fieldModel, fieldView.visibleHelpElement, "", {
                    help : $(fieldModel[fieldView.visibleHelpElement]).html()
                });
            });

            GuideUtil._initializeShortDescription();
        },
        _initializeShortDescription : function ($html) {
            if (_.isUndefined($html)) {
                $html = window.document;
            }
            var getId = GuideUtil._getId,
                tooltipContent = function (element) {
                    var longVisible, alwaysShow, guideFieldNode, elem;
                    guideFieldNode = $(element).parents('.guideFieldNode').eq(0);
                    longVisible = $(getId(guideFieldNode.attr('id') + '_guideFieldLongDescription')).is(':visible');
                    alwaysShow = $(guideFieldNode.find('[data-guide-longDescription]')).data('guide-alwaysshow');
                    elem = guideFieldNode.find('.short');
                    if (elem !== undefined && elem !== null && !longVisible && !alwaysShow) {
                        return elem.html();
                    }
                    return '';
                };

            var $guideFieldWidget = $('.guideFieldWidget', $html);
            if (_.isFunction($.prototype.tooltip) && $guideFieldWidget.length > 0) {
                $guideFieldWidget.tooltip({
                    title : function () {
                        var button = $(this).find('button'),
                            checkbox = $(this).parents('.guideCheckBoxItem').eq(0),
                            radiobutton = $(this).parents('.guideRadioButtonItem').eq(0);
                        if (!(button !== undefined && button.length > 0) && !(checkbox !== undefined && checkbox.length > 0) && !(radiobutton !== undefined && radiobutton.length > 0)) {
                            return tooltipContent(this);
                        }
                        return '';
                    },
                    placement : 'bottom',
                    container : '.guideContainerWrapperNode',
                    html : true
                });
            }

            var $guideButtonAndCheckBox = $('button, .guideRadioButtonItem, .guideCheckBoxItem', $html);
            if (_.isFunction($.prototype.tooltip) && $guideButtonAndCheckBox.length > 0) {
                $guideButtonAndCheckBox.tooltip({
                    title : function () {
                        return tooltipContent(this);
                    },
                    placement : 'bottom',
                    container : '.guideContainerWrapperNode',
                    html : true
                });

            }
        },
        isIphoneOrIpad : function () {
            var IS_IPAD = window.navigator.userAgent.match(/iPad/i) !== null,
                IS_IPHONE = (window.navigator.userAgent.match(/iPhone/i) !== null)
                    || (window.navigator.userAgent.match(/iPod/i) !== null);
            return IS_IPAD || IS_IPHONE;
        },

        commonPrefixLen : function (str1, str2) {
            if (_.isString(str1) && _.isString(str2)) {
                var i,
                    length = Math.min(str1.length, str2.length);

                for (i = 0; i < length; ++i) {
                    if (str1.charAt(i) !== str2.charAt(i)) {
                        break;
                    }
                }
                return i;
            }
            return 0;
        },

        /**
         * Returns true if the bindref is an xpath ending with and attribute
         */
        isAttributeBound : function (bindRef) {
            return _.isString(bindRef) && bindRef.split('/@').length === 2;
        },

        /**
         * Returns the hops to rootPanel
         * @param node
         * @returns {number}
         * @private
         */
        _countHopsToRootPanel : function (node) {
            var count = 0;
            while (node && node.parent) {
                count = count + 1;
                if (node.parent.className === "rootPanelNode") {
                    return count;
                }
                node = node.parent;
            }
        },

        /**
         * Check if ancestor is reference
         * @param model
         * @returns {boolean}
         * @private
         */
        _checkIfAncestorIsALazyReference : function (model) {
            // Walk through the parent hierarchy
            var par = model.parent;
            while (par && !(par instanceof guidelib.model.GuideContainerNode)) {
                if (par._lazyReference) {
                    return true;
                }
                par = par.parent;
            }
            return false;
        },

        /**
         * Check if supplied template jason is in lazy state.
         * @param templateJson
         * @returns {boolean}
         * @private
         */
        isLazyJson : function (templateJson) {
            if (_.isUndefined(templateJson) || _.isEmpty(templateJson.items)) {
                return true;
            }
            return false;
        },

        showGuideLoading : function (bShow) {
            if (bShow) {
                gd().addClass("guideLoading");
            } else {
                gd().attr("class", "");
            }
            return this;
        },

        removeAllMessages : function () {
            gd().empty().removeClass("guideMessage");
            return this;
        },

        showMessages : function (bMessages) {
            if (!_.isArray(bMessages)) {
                bMessages = [bMessages];
            }
            var $messages = bMessages.map(function (bMessage) {
                return $("<h1></h1>").text(bMessage);
            });
            gd().empty().addClass("guideMessage").append($messages);
            return this;
        },

        /**
         * returns the node value from the prefillXML
         * @param prefillXML
         * @returns {String}
         * @private
         */
        fetchXMLNodeValue : function (prefillXML, targetNode) {
            if (!_.isUndefined(prefillXML)) {
                var XMLModel = $.parseXML(prefillXML);
                if (XMLModel && targetNode) {
                    var elements = XMLModel.getElementsByTagName(targetNode);
                    if (elements && elements.length > 0) {
                        var element = elements[0];
                    }
                    if (!_.isUndefined(element)) {
                        return element.textContent;
                    }
                }
            }
        },

        /**
         * returns the value of the object at a specified path in prefillJson.
         * @param prefillJson
         * @param targetPath
         * @private
         */
        _fetchJSONNodeValue : function (prefillJson, targetPath) {
            if (!_.isUndefined(prefillJson)) {
                var JSONObject = JSON.parse(prefillJson);
                if (JSONObject && targetPath) {
                    return xfalib.ut.XfaUtil.prototype.getOrElse(JSONObject, "afData." + targetPath, undefined);
                }
            }
        }
    };
})(window, $, guidelib, window._);
