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


(function (_, guidelib, xfalib) {
    var DataNode = guidelib.model.DataNode = xfalib.ut.Class.extend({
        initialize : function () {
            this.linkedFields = [];
            this.isUpdateInProgress = false;
        },

        addField : function (model) {
            if (!_.isEmpty(model) && !_.contains(this.linkedFields, model)) {
                this.linkedFields.push(model);
                model.on(guidelib.event.GuideModelEvent.VALUE_CHANGED, this);
            }
        },

        removeField : function (model) {
            if (!_.isEmpty(model)) {
                model.off(guidelib.event.GuideModelEvent.VALUE_CHANGED, this);
                this.linkedFields = _.without(this.linkedFields, model);
            }
        },

        getFieldModels : function () {
            return _.filter(this.linkedFields, function (field) {
                return (field instanceof guidelib.model.Field);
            });
        },

        handleEvent : function (event) {
            switch (event.name) {
            case guidelib.event.GuideModelEvent.VALUE_CHANGED:
                if (!_.contains(['guideButton', 'guideTextDraw', 'guideAdobeSignBlock'], event.target.className)) {
                    this.updateLinkedFieldsValue(event);
                }
                break;
            default:
                event.target.logger().warn("AF", "Unexpected Event type on Data Node", event);
            }
        },

        updateLinkedFieldsValue : function (event) {
            if (this.isUpdateInProgress) {
                return;
            }

            this.isUpdateInProgress = true;
            var newValue = event.target._getValue();

            try {
                _.each(this.linkedFields, function (field) {
                    if (field !== event.target) {
                        field.value = newValue;
                    }
                }, this);
            } catch (ex) {
                event.target.logger().error("AF", "Unable to set Linked Field value" + ex);
            } finally {
                this.isUpdateInProgress = false;
            }
        }
    });

}(_, guidelib, xfalib));

(function (_, guidelib) {
    var guideSchema = {},
        convertor = {
            "visible" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue === "visible";
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue === true ? "visible" : "hidden";
                }
            },
            "enabled" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue === "open";
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue === true ? "open" : "readOnly";
                }
            },
            "assistPriority" : {
                "xfaToGuide" : function (xfaValue) {
                    return {
                        "custom" : "custom",
                        "toolTip" : "shortDescription",
                        "caption" : "label",
                        "name" : "name"
                    }[xfaValue];
                },
                "guideToXfa" : function (guideValue) {
                    return {
                        "custom" : "custom",
                        "shortDescription" : "toolTip",
                        "title" : "caption",
                        "name" : "name"
                    }[guideValue];
                }
            },
            "mandatory" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue === "error";
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue === true ? "error" : "disabled";
                }
            },
            "multiLine" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue == 1;
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue === true ? 1 : 0;
                }
            },
            
            
            "options" : {
                "xfaToGuide" : function (xfaValue) {
                    var items = [];
                    if (xfaValue) {
                        var bndNode = this.bindNode;
                        _.each(xfaValue, function (item, index, list) {
                            items.push(bndNode.getSaveItem(index) + "=" + bndNode.getDisplayItem(index));
                        });
                    }
                    return items;
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue;
                }
            },
            "multiSelect" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue === "multiSelect";
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue === true ? "multiSelect" : "userControl";
                }
            },
            "calcExp" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue !== null && xfaValue !== "" ? null : undefined;
                },
                "guideToXfa" : function (guideValue) {
                    return guideValue !== null && guideValue !== "" ? null : undefined;
                }
            },
            "dataType" : {
                "xfaToGuide" : function (xfaValue) {
                    return xfaValue;
                },
                "guideToXfa" : function (guideValue) {
                    return undefined;
                }
            }
        };
    convertor.validateExp = convertor.visibleExp =
                          convertor.enabledExp =
                          convertor.clickExp =
                          convertor.calcExp;

    guidelib.model.GuideSchema = xfalib.ut.Class.extend({

        GuideStateConstants : {
            
            GUIDE_STATE_MODEL_CREATION : 0,
            
            GUIDE_STATE_MODEL_CREATED : 1,
            
            GUIDE_STATE_MERGE_PROGRESS : 2,
            
            GUIDE_STATE_MERGE_COMPLETE : 3,
            
            GUIDE_STATE_MODEL_COMPLETE : 4
        },

        initialize : function () {
            
            this.addSchema('guideNode',
                [
                    ["name", "string", null],
                    ["id", "string", null],
                    ["jcr:title", "string", null],
                    ["jcr:description", "string", null],
                    ["css", "string", ""],
                    ["fd:targetVersion", "float", 1.0]
                ]);

            this.addSchema("scriptable",
                [
                    ["visibleExp", "string", null],
                    ["enabledExp", "string", null],
                    ["visible", "boolean", true, "presence"],
                    ["enabled", "boolean", true, "access"],
                    ["assistPriority", "string", null, "assist.speak.priority"],
                    ["custom", "string", null, "assist.speak.value"],
                    ["shortDescription", "string", null, "assist.toolTip.value"],
                    ["longDescription", "string", null]
                ],
                'guideNode');

            this.addSchema("guideInstanceManager", [], "guideNode");

            this.addSchema("esign", [], "guideNode");

            this.addSchema("verify", [], "guideNode");

            this.addSchema("guideItemsContainer", [], "scriptable");

            this.addSchema("guideImage", [], "scriptable");

            this.addSchema("guideContainerNode",
            [
                ["disableSwipeGesture", "boolean", false]
            ],
            "guideItemsContainer");

            this.addSchema("guidePanel",
                [
                  ["validateOnStepCompletion","boolean",false]
                ],
                "guideItemsContainer");

            this.addSchema("rootPanelNode", [], "guidePanel");

            this.addSchema("guideTable", [], "guidePanel");

            this.addSchema("guideTableRow", [], "guidePanel");

            this.addSchema("guideToolbar", [], "guideItemsContainer");

            this.addSchema("guideCompositeField", [], "guideItemsContainer");

            this.addSchema("guideFileUpload",
                [
                    ["multiSelection", "boolean", false],
                    ["buttonText", "string", null],
                    ["fileSizeLimit", "integer", 2],
                    ["showComment", "boolean", false]
                ],
                "guideCompositeField");

            
            
            this.addSchema("guideField",
                [
                    ["jcr:title", "string", null, "caption.value.oneOfChild.value","Guide"],
                    ["calcExp", "string", null, "calculate.script.value", "Guide"],
                    ["validateExp", "string", null, "validate.script.value", "Guide"],
                    ["_value", "string", null, "rawValue"],
                    ["displayPictureClause", "string", null, "format.picture.value"],
                    ["validatePictureClause", "string", null, "validate.picture.value"],
                    ["mandatory", "boolean", false, "validate.nullTest"],
                    ["mandatoryMessage", "string", guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-005"]),
                        "mandatoryMessage"],
                    ["validateExpMessage", "string", guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-006"]),
                        "validationMessage","Guide"],
                    ["validatePictureClauseMessage", "string", guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-007"]),
                        "formatMessage"],
                    ["validationState", "boolean", false], 
                    ["width", "string", null],
                    ["height", "string", null]
                ],
                "scriptable");

            this.addSchema("guideTextBox",
                [
                    ["multiLine", "boolean", false, "ui.textEdit.multiLine"],
                    ["maxChars", "integer", 0, "value.text.maxChars"],
                    ["minLength", "integer", null],
                    ["length", "integer", null]
                ],
                "guideField");

            this.addSchema("guideCaptcha", [], "guideField");

            this.addSchema("guideTelephone", [], "guideField");

            this.addSchema("guideNumericBox",
                [
                    ["dataType", "string", "decimal", "value.oneOfChild.className"],
                    ["leadDigits", "integer", -1, "value.decimal.leadDigits"],
                    ["fracDigits", "integer", 2, "value.decimal.fracDigits"],
                    ["maximum", "integer", null],
                    ["minimum", "integer", null],
                    ["exclusiveMaximum", "boolean", null],
                    ["exclusiveMinimum", "boolean", null]
                ],
                "guideField");

            this.addSchema("guidePasswordBox", [], "guideField");

            this.addSchema("guideRadioButton", [], "guideField");

            this.addSchema("guideCheckBox", [], "guideField");

            this.addSchema("guideSwitch", [], "guideCheckBox");

            this.addSchema("guideScribble", [], "guideField");

            this.addSchema("guideDatePicker",
                [
                    ["maximum", "string", null],
                    ["minimum", "string", null],
                    ["exclusiveMaximum", "boolean", null],
                    ["exclusiveMinimum", "boolean", null]
                ], "guideField");

            this.addSchema("guideButton", [], "guideField");

            this.addSchema("guideListFileAttachmentButton", [], "guideButton");

            this.addSchema("guideTextDraw", [], "guideField");

            this.addSchema("guideAdobeSignBlock", [], "guideField");

            this.addSchema("guideCompositeFieldItem", [], "guideField");

            this.addSchema("guideDropDownList",
                [
                    ["title", "string", "DropDown"],
                    ["multiSelect", "boolean", false, "ui.oneOfChild.open"],
                    ["optionsExp", "string", null],
                    ["options", "object", null, "items"]
                ],
                "guideField");

            this.addSchema("guideTermsAndConditions",
                [
                    ["showLink", "boolean", false],
                    ["showAsPopUp", "boolean", false],
                    ["clickStatus", "string", null]
                ],
                "guideCompositeField");

            this.addSchema("guideChart", [
                ["height", "integer", 300],
                ["width", "integer", 100],
                ["data", "object", null],
                ["xAxisTitle", "string", null],
                ["yAxisTitle", "string", null],
                ["chartType", "string", "linepoint"],
                ["repeatableItem", "string", null],
                ["xExp", "string", null],
                ["reducerXFunction", "string", "none"],
                ["yExp", "string", null],
                ["reducerYFunction", "string", "none"],
                ["innerRadius", "integer", 0],
                ["lineColor", "string", "#000000"],
                ["pointColor", "string", "#000000"],
                ["areaColor", "string", "#000000"],
                ["tooltipHtml", "string", "<p>${x}(${y})</p>"],
                ["showLegends", "boolean", false],
                ["legendPosition", "string", "right"]
            ], "scriptable");

            this.addSchema("guideAdModule", [["_value", "string", null]], "scriptable");
            this.addSchema("guideAdModuleGroup", [["_value", "string", null]], "scriptable");
        },

        addSchema : function (elementName, attrArray, superElement) {
            var el = {};
            if (typeof superElement === "object") {
                _.extend(el, superElement);
            } else if (typeof superElement === "string" && guideSchema[superElement]) {
                _.extend(el, guideSchema[superElement]);
            }
            this.addAttributes(el, attrArray);
            guideSchema[elementName] = el;
        },

        addAttributes : function (element, attrArray) {
            _.each(attrArray, function (elem) {
                element[elem[0]] = {
                    "type" : elem[1],
                    "default" : elem[2],
                    "xfaProp" : elem[3],
                    "priority" : elem[4]
                };
            });
        },

        getAttributeProps : function (element, attribute) {
            try {
                return guideSchema[element][attribute] || {};
            } catch (e) {
                this.logger().error("AF", "schema has no element " + element);
            }
        },
        getAttributes : function (element) {
            return guideSchema[element];
        },

        getTypedValue : function (type, value) {
            if (value === null || value === undefined) {
                return value;
            }
            if (type instanceof Array) {
                return value;
            }
            switch (type) {
                case "string":
                    return value + "";
                case "integer":
                    return parseInt(value);
                case "boolean":
                    return value === true || value === "true" ? true : false;
                case "float":
                    return parseFloat(value);
                default :
                    return value;
            }
        },

        getConvertor : function (attr) {
            return convertor[attr];
        }
    });

}(_, guidelib));

(function (_, guidelib) {
    guidelib.model.mixin.AddDependencyMgmt = {
        normalProperties : {
            _addDependant : function (oNode, expressionType) {
                var dependantConf = this._findDependant(oNode);
                if (!dependantConf) {
                    dependantConf = {dependant : oNode, events : []};
                    this.dependants.push(dependantConf);
                }

                if (dependantConf.events.indexOf(expressionType) < 0) {
                    dependantConf.events.push(expressionType);
                    oNode.on(guidelib.event.GuideModelEvent.OBJECT_DESTROYED, this._handleDependentDestroyed, this);
                }
            },

            _notifyDependants : function () {
                _.each(this.dependants, function (dependantConf) {
                    this._guide().queueExpressions(dependantConf.dependant, dependantConf.events);
                }, this);
            },

            _removeDependant : function (oNode) {
                oNode.off(guidelib.event.GuideModelEvent.OBJECT_DESTROYED, this._handleDependentDestroyed, this);
                var dependantConf = this._findDependant(oNode);
                this.dependants = _.without(this.dependants, dependantConf);
            },

            _findDependant : function (oNode) {
                return _.find(this.dependants, function (conf) { return (conf.dependant === oNode); });
            },

            _handleDependentDestroyed : function (event) {
                this._removeDependant(event.target);
            }
        }
    };
})(_, guidelib);


(function ($, _, guidelib) {
    var GuideViewRegistry = guidelib.view.GuideViewRegistry = xfalib.ut.Class.extend({

        
        _findWidget : function (config, name, className) {
            var result = _.find(config, function (widgetName, identifier) {
                return name === identifier;
            });
            if (result === undefined) {
                result = _.find(config, function (widgetName, identifier) {
                    return className === identifier;
                });
            }
            return result;
        },

        
        _findWidgetNameFromCSS : function (cssClasses) {
            var result = null;
            if (_.isString(cssClasses)) {
                _.find(cssClasses.split(" "),
                    function (cssClass, index) {
                        var match = cssClass.match(/^widget_([\w\W]+)$/);
                        if (match && match.length === 2) {
                            result = match[1];
                            return true;
                        }
                        return false;
                    });
            }
            return result;
        },

        createView : function (element, parentView) {
            var $element = $(element);
            var options = {
                    'element' : $element.get(0),
                    'widgetName' : $element.data("guideViewWidget"),
                    'parentView' : parentView
                };
            var guideViewBind = $element.data("guideViewBind");
            var model = window.guideBridge._resolveId(guideViewBind);
            
            
            if (model) {
                options.model = model;
                var clsName = model.className;
                var nodeClass = clsName.charAt(0).toUpperCase() + clsName.substr(1) + "View";
                var viewClass = guidelib.view[nodeClass],
                    widgetConfig = window.guideBridge.userConfig.widgetConfig;
                if (model instanceof guidelib.model.Field) {
                    options.widgetName = this._findWidgetNameFromCSS(model.cssClassName)
                        || this._findWidget(widgetConfig, model.name, model.className);
                }
                if (!viewClass && model instanceof guidelib.model.GuideContainerNode) {
                    viewClass = guidelib.view.GuideContainerView;
                }
                if (!viewClass && model instanceof guidelib.model.Field) {
                    viewClass = guidelib.view.GuideFieldView;
                }
                if (!viewClass && model instanceof guidelib.model.GuidePanel) {
                    viewClass = guidelib.view.GuidePanelView;
                }
                if (!viewClass && model instanceof guidelib.model.GuideItemsContainer) {
                    viewClass = guidelib.view.GuideItemsView;
                }
                if (!viewClass) {
                    viewClass = guidelib.view.GuideBaseView;
                }
                
                var bindView = new viewClass(options);
                return bindView;
            }
        }
    });

})($, _, guidelib);

(function (_, guidelib) {
    guidelib.model.mixin.AddNavigationContext = {
        propertyDescriptors : {
            "navigationContext" : {
                get : function () {
                    if (!this._navigationContext) {
                        this._navigationContext = new guidelib.model.util.GuideNavigationContext({
                            currentItem : null,
                            parentPanel : this.panel
                        });
                    }
                    return this._navigationContext;
                }
            }
        }
    };
})(_, guidelib);


(function (guidelib, $) {
    var ErrorConstants = guidelib.util.ErrorConstants = {
        DATA_ATTRIBUTE_ERROR_ITEM : "data-af-global-error-item",
        DATA_ATTRIBUTE_DISPLAY_ON : "data-af-global-errors-display-on",
        DATA_ATTRIBUTE_ERROR_TEXT_CONTAINER : "data-af-global-error-text",
        DATA_ATTRIBUTE_ERROR_CONTAINER : "data-af-global-errors",
        DATA_ATTRIBUTE_SOM : "data-af-som",
        CONTEXT_SUBMISSION : "form",
        CONTEXT_NAVIGATION : "panel",
        CONTEXT_FIELD : "field" 

    };
    ErrorConstants[ErrorConstants.CONTEXT_SUBMISSION] = 4;
    ErrorConstants[ErrorConstants.CONTEXT_NAVIGATION] = 2;
    ErrorConstants[ErrorConstants.CONTEXT_FIELD] = 1;

    var GlobalErrorContainer = function ($el, options) {
        this.$container = $el;
        var $items = $el.find("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_ITEM + "]").first(),
            displayOnAttribute = $el.attr(ErrorConstants.DATA_ATTRIBUTE_DISPLAY_ON) || "";
        this.displayOn = 0;
        this.errorCount = 0;
        this.$container.addClass("no-validation-errors");
        _.each(displayOnAttribute.split(","), function (displayOn) {
            var val = ErrorConstants[displayOn] || 0;
            this.displayOn += val;
        }, this);
        this.$item = $items.eq(0).clone();
        $items.remove();
    };
    _.extend(GlobalErrorContainer.prototype, {
        
        showError : function (msg, context, fieldSom) {
            var nContext,
            $el  = this.$container.find('[' + ErrorConstants.DATA_ATTRIBUTE_SOM + '="' + fieldSom + '"]');;
            if ($el.length > 0) {
                $el.find("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_TEXT_CONTAINER + "]")
                    .addBack("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_TEXT_CONTAINER + "]")
                    .text(msg);
            } else {
                if (typeof ErrorConstants[context] !== "number") {
                    return;
                }
                nContext = ErrorConstants[context];
                if ((nContext & this.displayOn) === nContext) {
                    if (this.errorCount === 0) {
                        this.$container.removeClass("no-validation-errors");
                    }
                    this.errorCount++;
                    this.$item.clone()
                        .find("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_TEXT_CONTAINER + "]")
                        .addBack("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_TEXT_CONTAINER + "]")
                        .text(msg)
                        .click(function (evnt) {
                            guideBridge.setFocus(fieldSom);
                        })
                        .end()
                        .end()
                        .attr(ErrorConstants.DATA_ATTRIBUTE_SOM, fieldSom)
                        .appendTo(this.$container);
                }
            }
        },
        hideError : function (fieldSom) {
            var $err = this.$container.find('[' + ErrorConstants.DATA_ATTRIBUTE_SOM + '="' + fieldSom + '"]');
            if ($err.length > 0) {
                $err.remove();
                this.errorCount--;
            }
            if (this.errorCount === 0) {
                this.$container.addClass("no-validation-errors");
            }
        }
    });

    $.fn.globalErrorContainer = function (options) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this),
                obj = $this.data("global-error-container");
            if (obj === undefined) {
                obj = new GlobalErrorContainer($this, $.extend({}, typeof options === "object" && options));
                $this.data("global-error-container", obj);
            }
            if (typeof options === "string" && typeof obj[options] === "function") {
                obj[options].apply(obj, [].splice.apply(args, [1]));
            }
        });
    };
}(guidelib, $));



(function (guidelib, $) {

    var ErrorConstants = guidelib.util.ErrorConstants,
        $GlobalErrorContainer;
    var GuideErrorManager = guidelib.util.GuideErrorManager = xfalib.ut.Class.extend({

        _defaultErrorMessage : "There is an error in this field !",

        initialize : function () {
            GuideErrorManager._super.initialize.apply(arguments);
            $GlobalErrorContainer = $("[" + ErrorConstants.DATA_ATTRIBUTE_ERROR_CONTAINER + "]").globalErrorContainer();
        },

        
        
        markError : function (msg, wrapper, fieldSom, context, type) {
            var errorDiv;
            
            if (_.isUndefined(msg)) {
                msg = this._defaultErrorMessage;
            }

            msg = msg.trim();

            $GlobalErrorContainer.globalErrorContainer("showError", msg, context, fieldSom);

            
            if (wrapper) {
                if (wrapper.length >= 1) {
                    errorDiv = wrapper.find(".guideFieldError");
                    if (errorDiv.length < 1) {
                        $("<div class='guideFieldError'></div>").appendTo(wrapper).text(msg);
                    } else {
                        errorDiv.text(msg);
                        var roleAttr = errorDiv.attr('role');
                        if (roleAttr != undefined || roleAttr !== false) {
                            errorDiv.attr('role', 'alert');
                        }
                        errorDiv.show();
                    }

                }
            }
        },

        unMarkError : function (wrapper, fieldSom) {
            
            wrapper.find(".guideFieldError").hide();
            wrapper.find(".guideFieldError").text("");
            $GlobalErrorContainer.globalErrorContainer("hideError", fieldSom);
        }
    });
})(guidelib, $);

(function ($, guidelib) {
    var GuideBaseView = guidelib.view.GuideBaseView = xfalib.ut.Class.extend({
        guideUtil : guidelib.util.GuideUtil,
        _triggerOnBridge : function (eventName, target, property, oldVal, newVal) {
            var evnt = guidelib.event.GuideModelEvent.createEvent(eventName, target,
                                                    property, oldVal, newVal);
            window.guideBridge.trigger(eventName, evnt);
        },

        initialize : function () {
            GuideBaseView._super.initialize.call(this);
            this.$element = $(this.options.element);
            this.id = this.$element.attr("id");
            this._model = this.options.model;
            this.parentView = this.options.parentView;
            this.$element.data("guideView", this);
            this._$item = null;
            this._$itemNav = null;
            
            if (this._model && this._model != null) {
                this._model.on(guidelib.event.GuideModelEvent.MODEL_CHANGED, this.handleModelChanged, this);
            }
            this._syncPending = true; 
            this._visibleHelpElement = "none";
        },

        postInitialize : function () {
        },

        _unloadView : function () {
            
            this._model.off(guidelib.event.GuideModelEvent.MODEL_CHANGED, this.handleModelChanged, this);
            
            this.$element = null;
            this.$widget = null;
            this._model = null;
            this._$item = null;
            this._$itemNav = null;
            this.parentView = null;
        },

        handleVisibleChanged : function (event) {
            
            
            if (!event.newText) {
                this.$item.addClass("hidden");
                this.$itemNav.addClass("hidden");
                if (this.parentView.currentActiveItemView == this) {
                    this.parentView.setActive("nextItem");
                }
            }   else {
                
                this.$item.removeClass("hidden");
                this.$itemNav.removeClass("hidden");
            }
        },

        handleModelChanged : function (event) {
            switch (event._property) {
                case "viewVisited":
                    if (event.newText) {
                        this.$item.addClass("stepped");
                        this.$itemNav.addClass("stepped");
                    }else {
                        this.$item.removeClass("stepped");
                        this.$itemNav.removeClass("stepped");
                    }
                    break;

                case "visible":
                    this.handleVisibleChanged(event);
                    break;
            }
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            if (focus && (this._model.className === "guideNode" || this._model.forceElementFocusChange)) {
                if (this.$element !== null && typeof this.$element.focus === "function") {
                    
                    this.$element.focus();
                }
                
                this._guideView.currentFocusItemSom = this._model.somExpression;
            }
            return true;
        },

        focusable : function () {
            return this._model.visible;
        },

        _find : function (selector) {
            return this._guideView.$element.find(selector);
        },

        _syncGuideNodeToHtml : function (deepSync) {
            this._syncPending = false;
            
            
            this.handleVisibleChanged(guidelib.event.GuideModelEvent.createEvent(
                guidelib.event.GuideModelEvent.MODEL_CHANGED,
                this,
                "visible",
                this._model.visible,
                this._model.visible
            ));
        },

        _updateIds : function ($el, oldId, newId) {
            if (oldId == newId) {
                return;
            }
            
            var idSelector = "#" + oldId,
                modelBindSelector = this.guideUtil.modelElSelector(oldId),
                attrSelector = '[id^="' + oldId + '"]',
                longDescriptionSelector = '[data-guide-longDescription^="' + oldId + '"]',
                labelSelector = 'label[for^="' + oldId + '"]',
                targetIdSelector = "[data-guide-id^='" + oldId + "']",
                $elById = $el.find(idSelector).addBack(idSelector),
                selectorAttrObject  = {
                    "id" : attrSelector ,
                    "for" : labelSelector,
                    "data-guide-longDescription" : longDescriptionSelector,
                    "data-guide-id" : targetIdSelector
                };
            
            
            
            if ($elById.attr(guidelib.util.GuideUtil.DATA_GUIDE_ITEM_CONTAINER) !== undefined) {
                $elById.attr(guidelib.util.GuideUtil.DATA_GUIDE_ITEM_CONTAINER, newId + guidelib.util.GuideUtil.GUIDE_ITEM_CONTAINER_SUFFIX);
            }
            
            if ($elById.attr(guidelib.util.GuideUtil.DATA_GUIDE_ITEM) !== undefined) {
                $elById.attr(guidelib.util.GuideUtil.DATA_GUIDE_ITEM, newId + guidelib.util.GuideUtil.GUIDE_ITEM_SUFFIX);
            }
            $elById.attr("id", newId);
            $el.find(modelBindSelector).addBack(modelBindSelector).attr(this.guideUtil.GUIDE_VIEW_BIND_ATTR, newId);
            
            _.each(_.keys(selectorAttrObject), function (item, index) {
                var selector = selectorAttrObject[item];
                $el.find(selector).addBack(selector).each(function () {
                    
                    var $this = $(this),
                        prevId = $this.attr(item),
                        nextId = newId + prevId.substring(oldId.length);
                    $this.attr(item, nextId);
                });
            }, this);
        },

        getSiblingItemView : function (siblingType) {
            if (this.parentView instanceof guidelib.view.GuidePanelView) {
                var siblingItem = this.parentView._model.navigationContext.getItemForNav(siblingType);
                if (siblingItem) {
                    return this.parentView.getQualifiedNamedView(siblingItem._escapeQualifiedName());
                }
            }
            return null;
        }
    });

    GuideBaseView.defineProps({
        _guideView : {
            get : function () {
                return window.guideBridge._guideView;
            }
        },

        _guide : {
            get : function () {
                return window.guideBridge._guide;
            }
        },

        $item : {
            get : function () {
                if (!this._$item || this._$item.length == 0) {
                    var itemSelector = this.guideUtil.itemSelector(this._model.id, this._model);
                    this._$item = this._find(itemSelector);
                    
                    
                    if (this._$item && this._$item.length == 0) {
                        return this.$element;
                    }
                }
                return this._$item;
            }
        },

        $itemNav : {
            get : function () {
                if (!this._$itemNav) {
                    var itemNavSelector = this.guideUtil.itemNavSelector(this._model.id);
                    this._$itemNav = this._find(itemNavSelector);
                }
                return this._$itemNav;
            }
        },
        visibleHelpElement :  {
            get : function () {
                return this._visibleHelpElement;
            },
            set : function (helpType) {
                this._visibleHelpElement = helpType;
            }
        },

        isItem : {
            get : function () {
                return this._model._isItem;
            }
        },

        qualifiedName : {
            get : function () {
                return this._model._escapeQualifiedName();
            }
        }

    });
}($, guidelib));


(function ($, guidelib) {
    var GuideChartView = guidelib.view.GuideChartView = guidelib.view.GuideBaseView.extend({

        initialize : function () {
            GuideChartView._super.initialize.call(this);
            var chartView = this;
            $(window).on("resize orientationchange", function () {
                chartView.renderChart.apply(chartView);
            });
        },

        postInitialize : function () {
            this._syncGuideNodeToHtml(true);
        },

        handleModelChanged : function (event) {
            switch (event._property) {
                case "data":
                case "chartType":
                    this.renderChart();
                    break;

                case "visible":
                    this.handleVisibleChanged(event);
                    break;
            }
        },

        handleVisibleChanged : function (event) {
            
            
            if (!event.newText) {
                
                this.$element.addClass("hidden");
                if (this.parentView.currentActiveItemView == this) {
                    this.parentView.setActive("nextItem");
                }
            }   else {
                
                this.$element.removeClass("hidden");
            }
        },

        _generateChart : function () {
            var $chartElement = this.$element,
                chartModel = this._model,
                $plottedChart = $chartElement.find('.dv-chart-container'),
                isChartVisible = $chartElement.width() > 0 ? true : false,
                chart;
            
            
            if ((isChartVisible || $plottedChart.length == 0) && chartModel.repeatableItem) {
                try {
                    
                    $plottedChart.remove();
                    chart = guidelib.chartUtils.constructChart(chartModel, $chartElement);
                    if (chart) {
                        chart.render();
                    }
                } catch (exception) {
                    this.logger().error("AF Chart view", "Error while rendering chart " + exception);
                }
            }
        },

        renderChart : function () {
            if (this._model.data) {
                var chartView = this;
                window.requestAnimationFrame(function () {
                    chartView._generateChart.apply(chartView);
                });
            }
        },

        _syncGuideNodeToHtml : function (deepSync) {
            this.renderChart();
            guidelib.view.GuideChartView._super._syncGuideNodeToHtml.call(this, deepSync);
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            guidelib.view.GuideChartView._super.setActive.call(this, activeItemToken, focus, muteScripts);
            if (focus) {
                if (this.$element) {
                    this.$element.focus();
                }
                this._guideView.currentFocusItemSom = this._model.somExpression;
            }
            return true;
        }
    });
}($, guidelib));

(function ($, guidelib) {

    var xfaUtil = xfalib.ut.XfaUtil.prototype,
        GuideFieldView = guidelib.view.GuideFieldView = guidelib.view.GuideBaseView.extend({
            _defaultWidgetName : "defaultWidget",

            
            autofillFieldKeywordToName  : {
                "name" : "name",
                "given-name" : "fname",
                "additional-name" : "mname",
                "family-name" : "lname",
                "email" : "email",
                "street-address" : "address",
                "address-line1" : "address",
                "address-line2" : "address",
                "address-level1" : "state",
                "address-level2" : "city",
                "postal-code" : "zip",
                "country" : "country",
                "tel" : "phone",
                "cc-name" : "ccname",
                "cc-number" : "cardnumber",
                "cc-csc" : "cvc",
                "cc-exp-month" : "ccmonth",
                "cc-exp-year" : "ccyear",
                "cc-exp" : "exp-date",
                "cc-type" : "card-type"
            },

            initialize : function () {
                GuideFieldView._super.initialize.call(this);
                this._initializeWidget();
                this._defineModelEvents();
                this._markMandatory();
                this._updateEmptyStatus();
                this.oldValue = null;
            },

            postInitialize : function () {
                this._syncGuideNodeToHtml(true);
            },

            createWidgetOptions : function () {
                return {
                    name : this._model.getAttribute("autocomplete") ? this.autofillFieldKeywordToName[this._model.getAttribute("autofillFieldKeyword")] : this._model.id + "_jqName",
                    value : this._model.value,
                    displayValue : this._model.formattedValue,
                    commitEvent : this.getCommitEvent(),
                    access : this._model.enabled ? "open" : "readOnly",
                    screenReaderText : this._model._getScreenReaderText()
                };
            },

            getCommitEvent : function () {
                return xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT;
            },

            getWidgetName : function () {
                var $elem = this.$widget.find('[data-af-widgetname]').addBack('[data-af-widgetname]'),
                    widgetName = "";
                
                if ($elem.length > 0) {
                    widgetName = $elem.attr("data-af-widgetname");
                    if (widgetName == "") {
                        this.logger().warn("AF", "widget name is not specified for field " + this._model.somExpression +
                            ", falling back to other widget");
                    }
                }
                return widgetName || this.options.widgetName || this._defaultWidgetName;
            },

            _unloadView : function () {
                if (this._model) {
                    this._model.off(guidelib.event.GuideModelEvent.VALUE_CHANGED, this.handleValueChanged, this);
                    this._model.off(guidelib.event.GuideModelEvent.ERROR_CHANGED, this.handleErrorChanged, this);
                    this._model.off(guidelib.event.GuideModelEvent.ERROR_RESET, this.handleErrorReset, this);
                }
                
                this.jqwidget = null;
                GuideFieldView._super._unloadView.apply(this, arguments);
            },

            _initializeWidget : function () {
                if (this.$element.find('div.guideFieldWidget').length) {
                    this.$widget = this.$element.find('div.guideFieldWidget');
                } else {
                    this.$widget = null;
                }

                
                if (this.$widget) {
                    $(this.$widget).on(this.getCommitEvent(), $.proxy(this.handleCommit, this))
                        .on(xfaUtil.XFA_CLICK_EVENT, $.proxy(this.handleClick, this))
                        .on(xfaUtil.XFA_EXIT_EVENT, $.proxy(this.handleFocusOut, this))
                        .on(xfaUtil.XFA_ENTER_EVENT, $.proxy(this.handleEnter, this));
                }
            },

            _defineModelEvents : function () {
                if (this._model) {
                    
                    
                    this._model.on(guidelib.event.GuideModelEvent.VALUE_CHANGED, this.handleValueChanged, this);
                    
                    this._model.on(guidelib.event.GuideModelEvent.ERROR_CHANGED, this.handleErrorChanged, this);
                    this._model.on(guidelib.event.GuideModelEvent.ERROR_RESET, this.handleErrorReset, this);

                }
            },

            _syncGuideNodeToHtml : function (deepSync) {
                GuideFieldView._super._syncGuideNodeToHtml.apply(this, arguments);
                if (this._model) {
                    this.handleModelChanged(guidelib.event.GuideModelEvent.createEvent(
                        guidelib.event.GuideModelEvent.MODEL_CHANGED,
                        this,
                        "visible",
                        this._model.visible,
                        this._model.visible
                    ));
                    this.$element.attr("data-disabled", !this._model.enabled + "");
                }
                if (this.$widget) {
                    var widgetOptions = this.createWidgetOptions();
                    if (!this.jqwidget) {
                        this.createWidget(this.getWidgetName(), widgetOptions);
                    } else {
                        this.setWidgetOptions(widgetOptions);
                    }
                }
                
                if (this._model.forceErrorShow && this._model._errorText) {
                    this.handleErrorChanged({prevText : this._model.validationState, newText : this._model._errorText});
                }
            },

            setWidgetOptions : function (widgetOptions) {
                this.jqwidget.option(widgetOptions);

            },

            
            _markMandatory : function () {
                if (this._model.mandatory && this.$element) {
                    this.$element.attr("data-mandatory", "true");
                } else {
                    this.$element.removeAttr("data-mandatory");
                    
                    if (this._model._failedTest === this.guideUtil.MANDATORY_TEST) {
                        guidelib.runtime.errorManager.unMarkError(this.$element, this._model.somExpression);
                    }
                }
            },

            
            _updateEmptyStatus : function (event) {
                var val = event ? event.newText : this._model.value;
                if (val == null || typeof val === 'string' && val.length == 0) {
                    this.$element.removeClass("af-field-filled").addClass("af-field-empty");
                } else {
                    this.$element.removeClass("af-field-empty").addClass("af-field-filled");
                }
            },

            handleValueChanged : function (event) {
                switch (event._property) {
                case "value":
                    this.jqwidget.option("value", event.prevText);
                    this.jqwidget.option("displayValue", event.newText);
                    break;
                }
                this._updateEmptyStatus(event);
            },

            handleErrorChanged : function (event) {
                var value = event.prevText,
                    errorMessage = event.newText;
                if (value === true) {
                    guidelib.runtime.errorManager.unMarkError(this.$element, this._model.somExpression);
                    this.$element.addClass("validation-success").removeClass("validation-failure");
                    this.updateWidgetOption("isValid", true);
                } else {
                    guidelib.runtime.errorManager.markError(errorMessage, this.$element, this._model.somExpression,
                        guideBridge.getValidationContext());
                    this.$element.addClass("validation-failure").removeClass("validation-success");
                    this.updateWidgetOption("isValid", false);
                }
            },

            handleErrorReset : function (event) {
                guidelib.runtime.errorManager.unMarkError(this.$element, this._model.somExpression);
                this.$element.removeClass("validation-failure").removeClass("validation-success");
                this.updateWidgetOption("isValid", undefined);
            },

            handleCommit : function () {
                if (this._model.enabled) {
                    this.commitValue(this.jqwidget.option("value"));
                }
            },

            handleClick : function (event) {
                window.guideBridge.clickedOnWindow = false;
            },

            handleFocusOut : function (event) {
                var gb = window.guideBridge;

                if (this.getCommitEvent() !== xfaUtil.XFA_EXIT_EVENT) {
                    this._model.executeExpression("exit");
                }
                if (gb && gb.clickedOnWindow) {
                    this._guideView.currentFocusItemSom = null;
                }
                gb.clickedOnWindow = false;
                if (!(this._model.className === 'guideRadioButton'  || this._model.className === 'guideCheckBox' || this._model.className === 'guideButton')) {
                    this._triggerOnBridge("elementFocusOut", "", "", "", "");
                }
                
                if ((this.oldValue !== this._model.value) && this._model._errorText) {
                    this.handleErrorChanged({prevText : this._model.validationState, newText : this._model._errorText});
                }
                this.$element.removeClass('guideActiveField');
            },

            handleModelChanged : function (event) {
                switch (event._property) {
                    case "enabled":
                        
                        
                        var prop = event.newText ? "open" : "readOnly";
                        if (this.jqwidget) {
                            this.jqwidget.option("access", prop);
                        }
                        this.$element.attr("data-disabled", !event.newText + "");
                        break;
                    case "mandatory":
                        
                        this._markMandatory();
                        break;
                    case "validateExpMessage":
                        var newText = event.jsonModel.newText;
                        this._changeValidationMessage(newText);
                        break;
                    case "jcr:title":
                        
                        var newText = event.jsonModel.newText;
                        this._changeTitle(newText);
                        break;
                    default:
                        GuideFieldView._super.handleModelChanged.apply(this, arguments);
                }
            },

            
            _changeTitle : function (newText) {
                var $field = $("#" + this.id),
                    $guideFieldLabelDiv = $field.children(".guideFieldLabel"),
                    $labelDiv = $guideFieldLabelDiv.children("label");
                if ($labelDiv) {
                    $labelDiv.html(newText);
                }
            },

            
            _changeValidationMessage : function (newText) {
                var $fieldNode = $("#" + this.id),
                    $errorDiv = $fieldNode.children(".guideFieldError");
                $errorDiv.html(newText);
            },

            
            commitValue : function (value) {
                this._model.value = value;
                var _version = this._model._guide().version;
                if (!(_version.isOn(_version.Flags.RUN_VALUE_COMMMIT_ON_SCRIPT_CHANGE))) {
                    this._model.executeExpression("valueCommitScript");
                }
                
                
                if (this.getCommitEvent() === xfaUtil.XFA_CHANGE_EVENT) {
                    this._model.executeExpression("change");
                } else {
                    this._model.executeExpression("exit");
                }
            },

            
            tempXfaFixes : function () {
                
                
                
                if (this.$element) {
                    this.$element.find("input").css("position", "relative");
                }
                this.handleAccessibility();
            },

            handleAccessibility : function () {
                
                if (this._model.mandatory) {
                    this.$widget.find("input,textarea,select,button").attr("aria-required", true);
                }
                if (this._model._getScreenReaderText() === this._model._getToolTip()) {
                    this.$element.find("input,textarea,select,button").removeAttr("aria-label");
                    this.$element.find("input,textarea,select,button").attr("aria-labelledby", this._model.id + "_guideFieldShortDescription");
                }
                if (this._model.longDescription) {
                    this.$element.find("input,textarea,select,button").attr("aria-describedby", this._model.id + "_guideFieldLongDescription");
                }
            },

            
            _getWidgetInitialOptions : function ($widget) {
                var $elem = $widget.find('[data-af-widgetname]').addBack('[data-af-widgetname]');
                if ($elem.length > 0) {
                    this.logger().info("AF", "Getting widget options for " + this._model.somExpression);
                    var optionsMap = $elem.data('af-widgetoptions') || {};
                    _.each($elem[0].attributes, function (attr) {
                        var nm = attr.name.match(/data-af-widgetoption-([^-]+)$/);
                        if (nm != null && nm.length > 1) {
                            this.logger().info("AF", "adding option " + nm[1] + " with value " + " ");
                            optionsMap[nm[1]] = attr.value;
                        }
                    }, this);
                    return optionsMap;
                }
                return {};
            },

            _newWidget : function (widgetname, options, $widgetElem) {
                var jqwidget = null,
                    fixesRequired = widgetname == this._defaultWidgetName;
                try {
                    
                    $widgetElem[widgetname](options);
                    
                    
                    jqwidget = $widgetElem.data(widgetname) || $widgetElem.data('xfaWidget-' + widgetname);
                } catch (e) {
                    this.logger().error("AF", "widget " + widgetname + " doesn't exists. Falling back to default widget");
                    fixesRequired = true;
                    jqwidget = $widgetElem[this._defaultWidgetName](options).data('xfaWidget-' + widgetname);
                }
                
                if (fixesRequired) {
                    this.tempXfaFixes();
                }
                return jqwidget;
            },

            createWidget : function (widgetname, options) {
                var initialOptions = this._getWidgetInitialOptions(this.$widget);
                var _options = $.extend({}, options, initialOptions);
                this.jqwidget = this._newWidget(widgetname, _options, this.$widget);
            },

            handleEnter : function () {
                this._guideView.currentFocusItemSom = this._model.somExpression;
                var gb = window.guideBridge;
                if (gb) {
                    gb.clickedOnWindow = false;
                }
                if (!(this._model.className === 'guideRadioButton' || this._model.className === 'guideCheckBox' || this._model.className === 'guideButton')) {
                    this._triggerOnBridge("elementFocus", "", "", "", "");
                }
                this.oldValue = this._model.value;
                this.$element.addClass('guideActiveField');
            },

            handleChange : function () {

            },

            setActive : function (activeItemToken, focus, muteScripts) {
                GuideFieldView._super.setActive.call(this, activeItemToken, focus, muteScripts);
                if (focus) {
                    
                    if (!this._guideView.skipFieldFocus && this.jqwidget && this.jqwidget.focus) {
                        this.jqwidget.focus();
                    }
                    this._guideView.currentFocusItemSom = this._model.somExpression;
                }
                return true;
            },

            updateWidgetOption : function (optionName, optionValue) {
                
                if (this.jqwidget) {
                    this.jqwidget.option(optionName, optionValue);
                }
            }

        });
}($, guidelib));


(function ($, guidelib) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype,
        GuideCompositeFieldView = guidelib.view.GuideCompositeFieldView = guidelib.view.GuideFieldView.extend({
            _defaultWidgetName : "defaultField",

            
            getModelNameOptionsMap : function () {
                return {};
            },

            initialize : function () {
                GuideCompositeFieldView._super.initialize.call(this);
                this._defineChildModelEvents();
            },

            _unloadView : function () {
                var _self = this;
                if (this.getModelNameOptionsMap()) {
                    _.each(this.getModelNameOptionsMap(), function (value, modelName) {
                        var obj = _self._model[modelName];
                        
                        obj.off(guidelib.event.GuideModelEvent.VALUE_CHANGED, _self.handleValueChanged, _self);
                        if (obj.mandatory || obj.validateExp) {
                            obj.off(guidelib.event.GuideModelEvent.ERROR_CHANGED, _self.handleErrorChanged, _self);
                            obj.off(guidelib.event.GuideModelEvent.ERROR_RESET, _self.handleErrorReset, _self);
                        }
                    });

                }
                GuideCompositeFieldView._super._unloadView.call(_self);
            },

            _defineChildModelEvents : function () {
                var _self = this;
                if (this.getModelNameOptionsMap()) {
                    _.each(this.getModelNameOptionsMap(), function (value, modelName) {
                        var obj = _self._model[modelName];
                        
                        obj.on(guidelib.event.GuideModelEvent.VALUE_CHANGED, _self.handleValueChanged, _self);
                        
                        
                        if (obj.mandatory || obj.validateExp) {
                            obj.on(guidelib.event.GuideModelEvent.ERROR_CHANGED, _self.handleErrorChanged, _self);
                            obj.on(guidelib.event.GuideModelEvent.ERROR_RESET, _self.handleErrorReset, _self);
                        }
                    });

                }
            },

            handleCommit : function () {
                var _self = this;
                if (!_.isEmpty(this.getModelNameOptionsMap())) {
                    _.each(this.getModelNameOptionsMap(), function (value, modelName) {
                        var obj = _self._model[modelName];
                        if (!_.isUndefined(obj)) {
                            var val = _self.jqwidget.option(value);
                            if (_.isArray(val)) {
                                val = val.join("\n");
                            }
                            obj.value = val;
                        }
                    });
                } else {
                    this._model.value = this.jqwidget.option("value");
                }
                this._model.executeExpression("valueCommitScript");
                this.execCommitExpression();
            },

            handleValueChanged : function (event) {
                
                
                switch (event._property) {
                    case "value":
                        var map = this.getModelNameOptionsMap();
                        this.jqwidget.option(map[event.target.name], event.prevText);
                        break;
                }
            },

            execCommitExpression : function () {
                
                if (this.getCommitEvent() == xfaUtil.XFA_CHANGE_EVENT) {
                    this._model.executeExpression("change");
                } else {
                    this._model.executeExpression("exit");
                }
            }
        });
}($, guidelib));

(function ($, guidelib) {
    var GuideTermsAndConditionsView = guidelib.view.GuideTermsAndConditionsView = guidelib.view.GuideCompositeFieldView.extend({
        _defaultWidgetName : "tnc",

        getModelNameOptionsMap : function () {
            var map = GuideTermsAndConditionsView._super.getModelNameOptionsMap.apply(this, arguments);
            return $.extend({}, map, {
                "reviewDocument" : "value",
                "reviewStatus" : "reviewStatus"
            });
        },

        createWidgetOptions : function () {
            var options = GuideTermsAndConditionsView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                textAreaClass : ".guide-tnc-content",
                checkBoxClass : ".guide-tnc-checkbox",
                linkClass     : ".guide-tnc-link",
                checkBoxDisableClass : ".guide-tnc-checkbox-disabled",
                checkBoxReviewedClass : ".guide-tnc-checkbox-reviewed",
                showLink      :  this._model.showLink,
                showAsPopUp   :  this._model.showAsPopUp,
                value : this._model.reviewDocument.value,
                reviewStatus : this._model.reviewStatus.value,
                clickStatus  : this._model.clickStatus
            });
        },

        
        tempXfaFixes : function () {
            
            
            
            if (this.$widget) {
                this.$widget.css("position", "relative");
            }

        },

        handleCommit : function (event) {
            
            this._model.clickStatus = this.jqwidget.option("clickStatus");
            
            GuideTermsAndConditionsView._super.handleCommit.apply(this, arguments);
        },

        handleModelChanged : function (event) {
            
            
            switch (event._property) {
                case "clickStatus":
                    this.jqwidget.option("clickStatus", event.prevText);
                    break;
                default:
                    GuideTermsAndConditionsView._super.handleModelChanged.apply(this, arguments);
                    break;
            }
        },

        getCommitEvent : function () {
            return xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT;
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideFileUploadView = guidelib.view.GuideFileUploadView = guidelib.view.GuideCompositeFieldView.extend({
        _defaultWidgetName : "fileUpload",

        getModelNameOptionsMap : function () {
            var map = GuideFileUploadView._super.getModelNameOptionsMap.apply(this, arguments);
            return $.extend({}, map, {
                "fileAttachment" : "value",
                "comment" : "comment"
            });
        },

        createWidgetOptions : function () {
            var options = GuideFileUploadView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                fileList : this._model.fileList,
                buttonText  : this._model.buttonText,
                multiSelect : this._model.multiSelection,
                fileSizeLimit : this._model.fileSizeLimit,
                buttonClass : "button.guide-fu-attach-button",
                fileItemListClass : "ul.guide-fu-fileItemList",
                iframeContainer : "div.guideContainerWrapperNode",
                showComment :  this._model.showComment,
                value : this._model.fileAttachment.value,
                comment : this._model.comment.value,
                _uuidGenerator : function () { return guideBridge._getUUID.apply(this); },
                _filePath : "/tmp/fd/af",
                _getUrl : guideBridge._getUrl(""),
                disablePreview : guideBridge._disablePreview(),
                uploaderPluginName : guideBridge.userConfig.uploaderPluginName || "adobeFileUploader"
            });
        },

        handleCommit : function () {
            
            
            
            this._model.fileList = this.jqwidget.option("fileList");
            GuideFileUploadView._super.handleCommit.apply(this, arguments);
        },

        handleModelChanged : function (event) {
            switch (event._property) {
                case "fileList":
                    this.jqwidget.option("fileList", event.prevText);
                    break;
                default:
                    GuideFileUploadView._super.handleModelChanged.apply(this, arguments);
                    break;
            }
        },

        handleAccessibility : function () {
            
            
            var isBrowserIE9OrIE10 = ($.browser.msie && ($.browser.version === '9.0' || $.browser.version === '10.0'));
            if (isBrowserIE9OrIE10) {
                if (this._model.mandatory) {
                    this.$widget.attr("aria-required", true);
                }
                if (this._model._getScreenReaderText() === this._model._getToolTip()) {
                    this.$widget.removeAttr("aria-label");
                    this.$widget.attr("aria-labelledby", this._model.id + "_guideFieldShortDescription");
                }
                if (this._model.longDescription) {
                    this.$widget.attr("aria-describedby", this._model.id + "_guideFieldLongDescription");
                }
            } else {
                GuideFileUploadView._super.handleAccessibility.apply(this, arguments);
            }
        },

        
        
        tempXfaFixes : function () {
            
            this.handleAccessibility();
        },

        getCommitEvent : function () {
            return xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT;
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideButtonView = guidelib.view.GuideButtonView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "xfaButton",

        handleClick : function (event) {
            this._triggerOnBridge("elementButtonClicked", this._model, "click", "", "");
            this._model.executeExpression("clickExp");
            GuideButtonView._super.handleClick.call(this);
        },

        _changeTitle : function (newText) {
            var $fieldTitleSpan = $("#" + this.id + "_widget");
            var $buttonLabel = $fieldTitleSpan.children("[data-guide-button-label]");
            $buttonLabel.html(newText);
        },

        tempXfaFixes : function () {
            
            
            
            if (this.$element) {
                this.$element.find("button").css("position", "relative");
            }
            this.handleAccessibility();
        }

    });
}($, guidelib));

(function ($, guidelib) {
    var fileInputIdCounter = 0;
    var GuideListFileAttachmentButtonView = guidelib.view.GuideListFileAttachmentButtonView = guidelib.view.GuideButtonView.extend({
        
        _clearFileListing : function () {
            $('#fileAttachment .modal-list', window.document).children().remove();
            _.each(this._fileListViews, function (childView) {
                childView._unloadView();
            }, this);
            this._fileListViews = [];
            fileInputIdCounter = 0;
        },
        _updateFileListing : function (fileAttachmentModel) {
            if (fileAttachmentModel.className == "guideFileUpload") {
                var $htmlTemplate = this._guideView.$element.find("#" + fileAttachmentModel.id),
                    inputFileSelector = "#" + fileAttachmentModel.id + "_widget",
                
                
                
                
                
                    $cloneHtmlTemplate = $htmlTemplate.clone();
                
                $cloneHtmlTemplate.find(inputFileSelector).attr("id", fileAttachmentModel.id + "_widget" + (++fileInputIdCounter));
                this._addSuffixToHelpIds($cloneHtmlTemplate, fileInputIdCounter);
                var $fluidDesign = $('<div/>').addClass("row").append('<div class="col-md-12"></div>');
                $('#fileAttachment .modal-list', window.document).append($cloneHtmlTemplate.appendTo($fluidDesign));
                var view = guidelib.view.GuideViewRegistry.prototype.createView($cloneHtmlTemplate, this);
                this._fileListViews.push(view);
                view.postInitialize();

            }
        },
        _addSuffixToHelpIds : function ($html, suffix) {
            var $questionMarkElement = $html.find("[data-guide-longDescription]"),
                $shortHelpElement;
            if ($questionMarkElement.length > 0) {
                var idForLongHelp = $questionMarkElement.attr("data-guide-longDescription"),
                    $longHelpElement = $(".guideFieldDescription.long", $html);
                idForLongHelp = idForLongHelp + suffix;
                $longHelpElement.attr("id", idForLongHelp);
                $questionMarkElement.attr("data-guide-longDescription", idForLongHelp);
            }
            

        },

        
        _markFileListing : function () {
            if (this.$element) {
                this.$element.find("button").attr("data-guide-fileListing", true);
            }
        },

        initialize : function () {
            GuideListFileAttachmentButtonView._super.initialize.apply(this, arguments);
            this._markFileListing();
            
            
            this._fileListViews = [];
        }
    });
}($, guidelib));


(function ($, guidelib) {
    var GuideTextDrawView = guidelib.view.GuideTextDrawView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "abstractWidget",

        initialize : function () {
            guidelib.view.GuideFieldView._super.initialize.call(this);
            if (this.$element && this.$element.length > 0) {
                $(this.$element)
                    .on("focus.guideTextDraw", $.proxy(this.handleEnter, this))
                    .on("click.guideTextDraw", $.proxy(this.handleClick, this));
            }
        },

        handleValueChanged : function (event) {
            switch (event._property) {
                case "value":
                    this.$element.html(event.newText);
                    break;
            }
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            guidelib.view.GuideFieldView._super.setActive.call(this, activeItemToken, focus, muteScripts);
            if (focus) {
                if (this.$element) {
                    this.$element.focus();
                }
                this._guideView.currentFocusItemSom = this._model.somExpression;
            }
            return true;
        }
    });
}($, guidelib));




(function ($, guidelib) {
    var GuideAdobeSignBlockView = guidelib.view.GuideAdobeSignBlockView = guidelib.view.GuideTextDrawView.extend({
    });
}($, guidelib));

(function ($, guidelib) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype,
        GuideDropDownListView = guidelib.view.GuideDropDownListView = guidelib.view.GuideFieldView.extend({

            _defaultWidgetName : "dropDownList",

            initialize : function () {
                GuideDropDownListView._super.initialize.apply(this, arguments);
                if (this._model.multiSelect) {
                    this._defaultWidgetName = "listBox";
                }
            },

            _valueToArray : function (value) {
                var valueArray;
                if (value !== null && !_.isUndefined(value)) {
                    if (_.isString(value)) {
                        valueArray = value.split("\n");
                    } else if (_.isNumber(value)) {
                        valueArray = [value.toString()];
                    }
                } else {
                    valueArray = [null];
                }
                return valueArray;
            },

            createWidgetOptions : function () {
                var options = GuideDropDownListView._super.createWidgetOptions.apply(this, arguments);
                
                
                return $.extend({}, options, {
                    multiSelect : this._model.multiSelect,
                    editable : false,
                    items : this._getItemsArray(),
                    value : this._valueToArray(this._model.value),
                    placeholder : this._model.placeholderText
                });
            },

            
            handleCommit : function () {
                var val = this.jqwidget.option("value");
                if (_.isArray(val)) {
                    val = val.join("\n");
                }
                
                this.commitValue(val);
            },

            
            commitValue : function (value) {
                var oldValue = this._model.value;
                this._model.value = value;
                
                
                
                var _version = this._model._guide().version;
                if (!(_version.isOn(_version.Flags.RUN_VALUE_COMMMIT_ON_SCRIPT_CHANGE))) {
                    this._model.executeExpression("valueCommitScript");
                }
                if (this.getCommitEvent() === xfaUtil.XFA_CHANGE_EVENT) {
                    
                    
                    
                    
                    
                    this._model.executeExpression("change", {
                        "prevText" : oldValue,
                        "newText" : this._model.value
                    });
                } else {
                    
                    this._model.executeExpression("exit");
                }
            },

            handleValueChanged : function (event) {
                this.jqwidget.option("value", this._valueToArray(event.prevText));
                this.jqwidget.option("displayValue", this._valueToArray(event.newText));
                this._updateEmptyStatus(event);
            },

            getCommitEvent : function () {
                return xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT;
            },

            _getItemsArray : function () {
                var items = [], items1 = this._model.items;
                if (_.isArray(items1)) {
                    _.each(items1, function (val, index) {
                        
                        
                        var temp = val.split('='),
                            obj = {
                                "save" : temp[0],
                                "display" : temp[1] || temp[0]
                            };
                        items.push(obj);
                    }, this);
                }
                return items;
            },

            handleModelChanged : function (event) {
                if (event._property === "addItem") {
                    this._handleAddItem(event);
                }
                if (event._property === "clearItems") {
                    this._handleClearItems(event);
                }
                if (event._property === "deleteItem") {
                    this._handleDeleteItem(event);
                } else {
                    GuideDropDownListView._super.handleModelChanged.apply(this, arguments);
                }
            },

            _handleAddItem : function (event) {
                var itemValues = {
                    sDisplayVal : event.newText,
                    sSaveVal : event.prevText
                };
                this.jqwidget.addItem(itemValues);
            },

            _handleClearItems : function (event) {
                this.jqwidget.clearItems();
            },

            _handleDeleteItem : function (event) {
                this.jqwidget.deleteItem(event.newText);
            },

            handleItemsChanged : function (event) {
                var items = this._getItemsArray(event.newText);
                this.jqwidget.option("items", items);
                this.jqwidget.option("value", this._valueToArray(this._model.jsonModel._value));
                this.jqwidget.option("displayValue", this._valueToArray(this._model.formattedValue));
            },

            _defineModelEvents : function () {
                GuideDropDownListView._super._defineModelEvents.apply(this, arguments);
                if (this._model) {
                    
                    this._model.on(guidelib.event.GuideModelEvent.ITEMS_CHANGED, this.handleItemsChanged, this);
                }
            },

            
            tempXfaFixes : function () {
                
                
                if (this.$element) {
                    if (!this._model.multiSelect) {
                        this.$element.find("select")
                            .css("position", "relative")
                            .attr("id", this._model.id + "_widget");
                    } else {
                        
                        if (this._model.height) {
                            this.$element.find("ol").css("max-height", "none");
                        }
                        this.$element.find("ol")
                            .css("position", "relative")
                            .attr("id", this._model.id + "_widget");
                    }
                }
                this.handleAccessibility();
            }
        });

}($, guidelib));



(function ($, guidelib) {
    var GuideNumericBoxView = guidelib.view.GuideNumericBoxView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "numericInput",
        createWidgetOptions : function () {
            var options = GuideNumericBoxView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                dataType : this._model.dataType,
                leadDigits : this._model.leadDigits,
                fracDigits : this._model.fracDigits,
                
                zero : guidelib.i18n.numberSymbols.zero,
                decimal : guidelib.i18n.numberSymbols.decimal,
                commitEvent : this.getCommitEvent(),
                placeholder : this._model.placeholderText
            });
        }
    });

}($, guidelib));

(function ($, guidelib) {
    var GuideCheckBoxView = guidelib.view.GuideCheckBoxView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "XfaCheckBox",

        initialize : function () {
            GuideCheckBoxView._super.initialize.apply(this, arguments);
            var self = this;
            this.$element
                .find(".guideWidgetLabel")
                .each(function (index, item) {
                    $(item).click(
                        (function (index) {
                            return function () {
                                
                                if (self._model.enabled) {
                                    self.jqwidget[self.getJQWidgetIdentifier(index)].click();
                                }
                            };
                        }(index))
                    );
                });
        },

        getJQWidgetIdentifier : function (index) {
            return index;
        },

        createWidgetOptions : function () {
            var options = GuideCheckBoxView._super.createWidgetOptions.apply(this, arguments);

            return $.extend({}, options, {
                states : 2
            });
        },

        getCommitEvent : function () {
            return xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT;
        },

        getStateFromValue : function (value, items) {
            if (value === null) {
                return 1;
            }
            if ((value + "").split(',').indexOf(items[0] + "") !== -1) {
                return 0;
            }
            return 1;
        },

        getOnOffValueFromModelValue : function (val, items) {
            return items[this.getStateFromValue(val, items)];
        },

        handleValueChanged : function (event) {
            _.each(this.jqwidget, function (jqwidget, index) {
                var setVal = this.getOnOffValueFromModelValue(event.prevText, jqwidget.option("values"));
                jqwidget.option("value", setVal);
                jqwidget.option("displayValue", setVal);
            }, this);
            this.$widget.find("[checked!=checked]").parents(".guideCheckBoxItem").removeClass('guideItemSelected');
            this.$widget.find("[checked=checked]").parents(".guideCheckBoxItem").addClass('guideItemSelected');
        },

        handleCommit : function () {
            var temp = "";
            _.each(this.jqwidget, function (jqwidget, index) {
                var items = jqwidget.option("values");
                if (jqwidget.option("state") === 0) {
                    
                    temp = temp + items[0] + ",";
                }
            }, this);
            temp = temp.substring(0, temp.length - 1);
            this.commitValue(temp);
        },

        handleEnabledChanged : function (event) {
            
            if (!this.$element.hasClass("dontSyncEnabled")) {
                var prop = event.newText ? "open" : "readOnly";
                _.each(this.jqwidget, function (jqwidget) {
                    jqwidget.option("access", prop);
                });
            }
        },

        handleModelChanged : function (evnt) {
            switch (evnt._property) {
            case "enabled":
                this.handleEnabledChanged(evnt);
                break;
            default:
                GuideCheckBoxView._super.handleModelChanged.apply(this, arguments);
            }
        },

        setWidgetOptions : function (options) {
            var index = 0;
            _.each(this.jqwidget, function (jqwidget, id) {
                this._initOrUpdateWidget(id, this._getOptions(options, index++));
            }, this);
        },

        _getOptions : function (options, index) {
            var items = this._model.getOnOffValues(index),
                val = this.getOnOffValueFromModelValue(this._model.value, items),
                optionsCopy = _.extend(options, {
                    value : val,
                    displayValue : val,
                    values : items,
                    state : this.getStateFromValue(this._model.value, items),
                    screenReaderText : this._model._getScreenReaderText(index)
                });
            return optionsCopy;
        },

        _initOrUpdateWidget : function (id, options, widgetname, $widget, initialOptions) {
            if (this.jqwidget[id]) {
                this.jqwidget[id].option(options);
            } else {
                var _options = $.extend({}, options, initialOptions);
                this.jqwidget[id] = this._newWidget(widgetname, _options, $widget);
            }
            this.$widget.find("[checked!=checked]").parents(".guideCheckBoxItem").removeClass('guideItemSelected');
            this.$widget.find("[checked=checked]").parents(".guideCheckBoxItem").addClass('guideItemSelected');
        },

        initializeJqWidget : function () {
            this.jqwidget = [];
        },

        createWidget : function (widgetname, options) {
            var self = this;
            this.initializeJqWidget();
            this.$widget.each(function (index, widget) {
                self._initOrUpdateWidget(self.getJQWidgetIdentifier(index),
                    self._getOptions(options, index),
                    widgetname,
                    $(widget),
                    self._getWidgetInitialOptions($(widget)));
            });
            this.tempXfaFixes();
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            guidelib.view.GuideFieldView._super.setActive.call(this, activeItemToken, focus, muteScripts);
            if (focus) {
                if (this.jqwidget && this.jqwidget[this.getJQWidgetIdentifier(0)]) {
                    this.jqwidget[this.getJQWidgetIdentifier(0)].focus();
                }
                this._guideView.currentFocusItemSom = this._model.somExpression;
            }
            return true;
        },

        updateWidgetOption : function (optionName, optionValue) {
            _.each(this.jqwidget, function (jqwidget, index) {
                if (optionName == "isValid") {
                    jqwidget.option(optionName, optionValue);
                }
            }, this);
        },

        handleAccessibility : function () {
            GuideCheckBoxView._super.handleAccessibility.apply(this, arguments);
            var elementId = this.$element.attr("id"),
                $label = this.$element.find(".guideFieldLabel label"),
                labelId =  $label.get(0).id;
            this.$element.attr("role", "group");
            this.$element.attr("aria-labelledby", labelId);
        }

    });
}($, guidelib));


(function ($, guidelib) {
    var GuideRadioButtonView = guidelib.view.GuideRadioButtonView = guidelib.view.GuideCheckBoxView.extend({

        _defaultWidgetName : "XfaCheckBox",

        _prevOnWidget : null,

        getJQWidgetIdentifier : function (index) {
            return this._model.getItemIdentifier(index);
        },

        handleValueChanged : function (event) {
            var somExpression = event.prevText;
            this.jqwidget[somExpression].option("value", event.newText);
            this.jqwidget[somExpression].option("displayValue", event.newText);
            if (event.newText === null) {
                this._prevOnWidget = null;
            } else {
                this._prevOnWidget = this.jqwidget[somExpression];
            }
            this.$widget.find("[checked!=checked]").parents(".guideRadioButtonItem").removeClass('guideItemSelected');
            this.$widget.find("[checked=checked]").parents(".guideRadioButtonItem").addClass('guideItemSelected');
            this._updateEmptyStatus();
        },

        handleCommit : function () {
            var jqwidgettochange = _.find(this.jqwidget, function (jqwidget) {
                    return jqwidget.option("state") === 0 && jqwidget !== this._prevOnWidget;
                }, this);
            this.commitValue(jqwidgettochange.option("value"));
            this._prevOnWidget = jqwidgettochange;
        },

        _initOrUpdateWidget : function (id, options, widgetname, widget) {
            GuideRadioButtonView._super._initOrUpdateWidget.apply(this, arguments);
            if (options.state === 0) {
                this._prevOnWidget = this.jqwidget[id];
            }
            this.$widget.find("[checked!=checked]").parents(".guideRadioButtonItem").removeClass('guideItemSelected');
            this.$widget.find("[checked=checked]").parents(".guideRadioButtonItem").addClass('guideItemSelected');
        },

        initializeJqWidget : function () {
            this.jqwidget = {};
            
            
            
            this.$widget.find("[checked]").removeAttr("checked");
            this.$widget.find("[checked=checked]").removeAttr("checked"); 

        },

        handleAccessibility : function () {
            GuideRadioButtonView._super.handleAccessibility.apply(this, arguments);
            this.$element.attr("role", "radiogroup");
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideSwitchView = guidelib.view.GuideSwitchView = guidelib.view.GuideCheckBoxView.extend({
        _defaultWidgetName : "guideSwitch",

        createWidgetOptions : function () {
            var options = GuideSwitchView._super.createWidgetOptions.apply(this, arguments),
                items = this._model.jsonModel.options, checkedLabel, uncheckedLabel;
            
            if (Array.isArray(items) && items.length > 0) {
                checkedLabel = items[0];
            } else if (!_.isUndefined(items) && items.length > 0) {
                checkedLabel = items;
            } else {
                checkedLabel = " ";
            }
            if (Array.isArray(items) && items.length > 1) {
                uncheckedLabel = items[1];
            } else {
                uncheckedLabel = "    ";
            }
            return $.extend({}, options, {
                checkedLabel : checkedLabel.substring(checkedLabel.indexOf("=") + 1),
                uncheckedLabel : uncheckedLabel.substring(uncheckedLabel.indexOf("=") + 1)
            });
        },

        handleValueChanged : function (event) {
            GuideSwitchView._super.handleValueChanged.apply(this, arguments);
            
            var jqwidget = this.jqwidget[0],
                jqwidgetOptions = jqwidget.options;
            if (jqwidgetOptions.values[jqwidgetOptions.state] !== jqwidgetOptions.value) {
                var userControl = jqwidget.$userControl;
                var checked = (jqwidgetOptions.value === jqwidgetOptions.values[0] ? true : false);
                userControl.prop("checked", checked);
                userControl.parent().toggleClass('ui-state-active', checked);
                userControl.change();
            }
        },

        handleCommit : function () {
            var jqwidget = this.jqwidget[0],
                items = jqwidget.option("values"),
                state = jqwidget.option("state");
            this.commitValue(items[state]);
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideTelephoneView = guidelib.view.GuideTelephoneView = guidelib.view.GuideFieldView.extend({
        
        _defaultWidgetName : "telephoneWidget",

        createWidgetOptions : function () {
            var options = GuideTelephoneView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                placeholder : this._model.placeholderText
            });
        }

    });
}($, guidelib));


(function ($, guidelib) {
    var GuideTextBoxView = guidelib.view.GuideTextBoxView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "textField",

        initialize : function () {
            GuideTextBoxView._super.initialize.apply(this, arguments);
            if (this._model.allowRichText) {
                this._defaultWidgetName = "richTextField";
            }
        },

        createWidgetOptions : function () {
            var options = GuideTextBoxView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                multiLine : this._model.multiLine,
                maxChars : this._model.maxChars,
                allowRichText : this._model.allowRichText,
                placeholder : this._model.placeholderText
            });
        },

        
        
        
        tempXfaFixes : function () {
            if (this._model.jsonModel.multiLine) {
                this.$element.find("textarea").css("position", "relative");
                this.handleAccessibility();
            } else {
                GuideTextBoxView._super.tempXfaFixes.apply(this);
            }
        },

        handleAccessibility : function () {
            GuideTextBoxView._super.handleAccessibility.apply(this);
            if (this._model.jsonModel.multiLine) {
                this.$element.find("textarea").attr("aria-multiLine", true);
            }
        }
    });
}($, guidelib));


(function ($, guidelib) {
    var GuidePasswordBoxView = guidelib.view.GuidePasswordBoxView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "defaultWidget",

        createWidgetOptions : function () {
            var options = GuidePasswordBoxView._super.createWidgetOptions.apply(this, arguments);

            return $.extend({}, options, {
                 placeholder : this._model.placeholderText
             });
        }
    });
}($, guidelib));


(function ($, guidelib) {
    var GuideScribbleView = guidelib.view.GuideScribbleView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "ScribbleImageField",

        createWidgetOptions : function () {
            var options = GuideScribbleView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                commitProperty : "src",
                geoLocMandatoryOnIpad : "false",
                aspectRatio : this._valueOfAspectRatioToBeUsed()
            });
        },

        _valueOfAspectRatioToBeUsed : function () {
            var aspectRatio ;
            if (this._model.jsonModel.aspectRatio) {
                aspectRatio = this._model.jsonModel.aspectRatio;
            } else {
                
                if (!this._presenceOfHeight()) {
                    aspectRatio = "6.8888";
                }
            }
            return aspectRatio ;
        },

        _presenceOfHeight : function () {
            return (this._model.jsonModel.hasOwnProperty('height') && this._model.jsonModel.height.toString().length > 0);
        },

        postInitialize : function () {
            GuideScribbleView._super.postInitialize.call(this);
            var that = this;
            
            if (!this._presenceOfHeight()) {
                setTimeout(function () {guidelib.util.GuideUtil._computeHeightAndWidthForScribble(that.$widget);}, guidelib.util.GuideUtil.SCRIBBLE_RESIZE_TIME_INTERVAL);
                $(window).off("resize", guidelib.util.GuideUtil._resizeScribbleField);
                $(window).on("resize", guidelib.util.GuideUtil._resizeScribbleField);
            }
        },

        handleAccessibility : function () {
            
            if (this._model.mandatory) {
                this.$widget.find("img").attr("aria-required", true);
            }
            if (this._model._getScreenReaderText() === this._model._getToolTip()) {
                this.$element.find("img").removeAttr("aria-label");
                this.$element.find("img").attr("aria-labelledby", this._model.id + "_guideFieldShortDescription");
            } else if (this._model._getAssistPriority() === "none") {
                this.$element.find("img").attr("aria-label", " ");
            }
            if (this._model.longDescription) {
                this.$element.find("img").attr("aria-describedby", this._model.id + "_guideFieldLongDescription");
            }
        },

        
        tempXfaFixes : function () {
            if (this.$widget) {
                this.$widget.css("position", "relative").find("img").css("position", "relative");
            }
            this.handleAccessibility();
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideDatePickerView = guidelib.view.GuideDatePickerView = guidelib.view.GuideFieldView.extend({
        _defaultWidgetName : "dateTimeEdit",

        createWidgetOptions : function () {
            var options = GuideDatePickerView._super.createWidgetOptions.apply(this, arguments),
                useNativeWidget = (this._model.displayPictureClause === null && this._model.editPictureClause == null);

            return $.extend({}, options, {
                days : guidelib.i18n.calendarSymbols.abbrdayNames,
                months : guidelib.i18n.calendarSymbols.monthNames,
                zero : guidelib.i18n.numberSymbols.zero,
                clearText : xfalib.locale.Strings.clearText,
                useNativeWidget : useNativeWidget,
                showCalendarIcon : true,
                editPattern : this._model.editPictureClause,
                placeholder : this._model.placeholderText,
                allowNonIsoValue : true
            });
        },

        
        tempXfaFixes : function () {
            GuideDatePickerView._super.tempXfaFixes.apply(this, arguments);
            
            if (this.$widget) {
                this.$widget.children("not:input[type=date]").height("100%"); 
            }
        },

        handleAccessibility : function () {
            GuideDatePickerView._super.handleAccessibility.apply(this, arguments);
            this.$widget.children("div[tabIndex]").removeAttr("tabIndex");
        }
    });
}($, guidelib));

(function ($, guidelib) {
    var GuideCaptchaView = guidelib.view.GuideCaptchaView = guidelib.view.GuideFieldView.extend({
        
        _defaultWidgetName : "afcaptcha",

        initialize : function () {
            GuideCaptchaView._super.initialize.apply(this, arguments);
            if (this._model.captchaWidget) {
                
                this._defaultWidgetName = this._model.captchaWidget;
            }
        },

        _initializeWidget : function () {
            GuideCaptchaView._super._initializeWidget.apply(this, arguments);
            if (this.$widget.length > 0) {
                this.$widget.on("tokenChange.captcha", $.proxy(this.handleTokenChange, this));
            }
        },

        handleTokenChange : function (event) {
            this._model.value = event.token;
        },

        createWidgetOptions : function () {
            var options = GuideCaptchaView._super.createWidgetOptions.apply(this, arguments);
            return $.extend({}, options, {
                "captchaConfigData" : this.options.model.jsonModel
            });
        },

        handleErrorChanged : function (event) {
                var value = event.prevText,
                    errorMessage = event.newText;
                if (value === false) {
                    guidelib.runtime.errorManager.markError(errorMessage, this.$element, this._model.somExpression,
                    guideBridge.getValidationContext());
                    this.$element.addClass("validation-failure");
                } else {
                    this.$element.removeClass("validation-failure");
                }
            }
    });
}($, guidelib));


(function ($, guidelib) {
    var GuideAdModuleView = guidelib.view.GuideAdModuleView = guidelib.view.GuideBaseView.extend({

        initialize : function () {
            GuideAdModuleView._super.initialize.call(this);
            if (this._model) {
                
                this._model.on(guidelib.event.GuideModelEvent.VALUE_CHANGED, this.handleValueChanged, this);
            }
            this.oldValue = null;
        },

        postInitialize : function () {
            this._syncGuideNodeToHtml(true);
        },

        handleValueChanged : function (event) {
            switch (event._property) {
                case "value":
                    this.$element.html(event.newText);
                    break;
            }
        },

        handleVisibleChanged : function (event) {
            
            
            if (!event.newText) {
                
                this.$element.addClass("hidden");
                if (this.parentView.currentActiveItemView == this) {
                    this.parentView.setActive("nextItem");
                }
            }   else {
                
                this.$element.removeClass("hidden");
            }
        },

        handleModelChanged : function (event) {
            GuideAdModuleView._super.handleModelChanged.apply(this, arguments);
        },
        _syncGuideNodeToHtml : function (deepSync) {
            this.$element
                .html(this._model.value)
                .find('img')
                .attr('src', function (idx, val) {
                    return Granite.HTTP.externalize(val);
                });

            if (this._model.layoutConfigs) {
                var options = {
                                $element : this.$element,
                                layoutConfigs : this._model.layoutConfigs
                            };
                guidelib.util.AdUtil.applyLayouts(options);
            }
            if (this._model) {
                this.handleModelChanged(guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.MODEL_CHANGED,
                    this,
                    "visible",
                    this._model.visible,
                    this._model.visible
                ));
            }
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            guidelib.view.GuideFieldView._super.setActive.call(this, activeItemToken, focus, muteScripts);
            if (focus) {
                if (this.$element) {
                    this.$element.focus();
                }
                this._guideView.currentFocusItemSom = this._model.somExpression;
            }
            return true;
        }
    });
}($, guidelib));




(function ($, guidelib) {
    var GuideAdModuleGroupView = guidelib.view.GuideAdModuleGroupView = guidelib.view.GuideAdModuleView.extend({
    });
}($, guidelib));

(function ($, _, guidelib) {
    var GuideItemsView = guidelib.view.GuideItemsView = guidelib.view.GuideBaseView.extend({
        initialize : function () {
            GuideItemsView._super.initialize.call(this);
            this.childViews = [];
        },

        
        _unloadView : function () {
            if (this._model._selfOrAncestorIsLazyReference) {
                var fragmentPlaceHolderSelector = "#" + this.id,
                    ind;
                
                $(fragmentPlaceHolderSelector).children().remove();
                
                var queueForLazyItems = this._guideView._queueViewForLazyItems;
                
                if ((ind = _.indexOf(queueForLazyItems, this)) !== -1) {
                    queueForLazyItems[ind] = undefined;
                }
                _.each(this.childViews, function (view) {

                    view._unloadView();
                }, this);
                
                this.childViews = [];
                
                this._currentActiveItemView = null;
                
                this._guideView._domTemplateCacheStore.removeDomElement("#" + this._model.templateId);
                
                this._guideView._reInitializeGuideContainerDom();
            }
        },
        postInitialize : function () {
            this.childViews = _.reduce(this._model.children, function (childViews, childModel) {
                var childView = this._createNonRepeatChildView(childModel);
                if (childView) {
                    childViews.push(childView);
                }
                return childViews;
            }, [], this);
            
            this._syncGuideNodeToHtml(false);
        },

        _createNonRepeatChildView : function (childModel) {
            

            
            
            var childElSelector = this.guideUtil.modelElSelector(childModel.id);
            var $childEl = this.$element.find(childElSelector);
            if (!$childEl.length) {
                $childEl = this.$element.find(this.guideUtil.modelElSelector(childModel.templateId));
                this._updateIds($childEl, childModel.templateId, childModel.id);
            }
            if ($childEl.length) {
                var childView = guidelib.view.GuideViewRegistry.prototype.createView($childEl, this);
                childView.postInitialize();
                return childView;
            }
            return null;
        },

        _syncGuideNodeToHtml : function (deepSync) {
            if (deepSync) {
                _.each(this.childViews, function (childView) {
                    childView._syncGuideNodeToHtml(true);
                }, this);
            }
            GuideItemsView._super._syncGuideNodeToHtml.call(this, deepSync);
        },

        _findChildView : function (childModel) {
            var view = _.find(this.childViews, function (childView) {
                return childView._model == childModel;
            }, this);
            return view;
        }
    });

    GuideItemsView.defineProps({
        itemsView : {
            get : function () {
                var views = _.filter(this.childViews, function (childView) {
                    return childView.isItem;
                }, this);
                return views;
            }
        }
    });
}($, _, guidelib));




(function ($, _, guidelib, guideBridge) {

    var GuideProgressiveSectionView = guidelib.view.GuideProgressiveSectionView = guidelib.view.GuideItemsView.extend({

        initialize : function () {
            GuideProgressiveSectionView._super.initialize.call(this);
            
            if (this._model && this._model != null) {
                
                
                
                
                
                this._model.off(guidelib.event.GuideModelEvent.NAVIGATE_SECTION);
                this._model.on(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, this.handleNavigateSection, this);
            }
            
            
        },

        
        handleNavigateSection : function (event) {
            
            var progressive = guidelib.runtime.progressive,
                that = this,
                model = this._model,
                part = null;
            if (event.newText === "next") {
                model.currentActivePart++;
            } else if (event.newText === "prev") {
                model.currentActivePart--;
            }
            _.each(model._parts, function (item, index) {
                if (index == model.currentActivePart) {
                    _.each(item, function (model, id) {
                        
                        
                        
                        if (progressive.isFieldVisible(model)) {
                            progressive.markFieldVisible(window.guideBridge._getGuideDomElement(model.somExpression).parent());
                        } else {
                            progressive.markFieldHidden(window.guideBridge._getGuideDomElement(model.somExpression).parent());
                        }
                    });
                } else {
                    _.each(item, function (model, id) {
                        
                        progressive.markFieldHidden(window.guideBridge._getGuideDomElement(model.somExpression).parent());
                    });
                }
            });
            
            if (((model.currentActivePart + 1) !== 1) || model._parts.length !== 1) {
                
                
                if (model._parts.length > 0) {
                    this._updateSectionTitle();
                }
            }
        },

        
        _updateSectionTitle : function () {
            var progressive = guidelib.runtime.progressive,
                $sectionTitle = this.$element.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_TITLE_SELECTOR),
                sectionTitle = this._model.sectionTitle,
                newSectionTile = sectionTitle + " (" + (this._model.currentActivePart + 1) + "/" + this._model._parts.length + ")";
            $sectionTitle.html(newSectionTile);
        },

        postInitialize : function () {
            var that = this,
                $childEls,
                item,
                id = null;
            
            if (this.$element && this.$element != null) {
                $childEls = this.$element.find(".progressiveSectionField");
                $childEls.each(function (index, childEl) {
                    
                    
                    item = $(childEl).children("div")[0];
                    
                    id = $(item).attr("id");
                    
                    
                    
                    var childView = guidelib.view.GuideViewRegistry.prototype.createView(item, that);
                    childView.postInitialize();
                    that.childViews.push(childView);
                    that.childViewsToId = that.childViewsToId || {};
                    that.childViewsToId[id] = childView;
                });
                
                this._calculatePartsOfSection();
            }
        },

        _getPdcSizeConfiguration : function () {
            return window.guideBridge.userConfig["progressive.pdcSize"];
        },

        _calculatePartsOfSection : function () {
            var userConfig = window.guideBridge.userConfig,
                progressive = guidelib.runtime.progressive,
                $pdc = this.$element.parents(progressive.PROGRESSIVE_CONSTANTS.PDC_SELECTOR); 
            
            
            if (this._getPdcSizeConfiguration()) {
                if (this._getPdcSizeConfiguration() && this._getPdcSizeConfiguration().height) {
                    $pdc.height(this._getPdcSizeConfiguration().height);
                }
                if (this._getPdcSizeConfiguration() && this._getPdcSizeConfiguration().width) {
                    $pdc.width(this._getPdcSizeConfiguration().width);
                }

            }
            
            if (userConfig && userConfig["calculatePartsOfSectionConfig"] && _.isFunction(userConfig["calculatePartsOfSectionConfig"]["calculatePartsOfSectionHandler"])) {
                var externalHandler = userConfig["calculatePartsOfSectionConfig"]["calculatePartsOfSectionHandler"],
                    
                    sectionParts = externalHandler(this._model);
                this._updatePartsFromArray(sectionParts);
            } else {
                var $sectionFieldContainer = this.$element.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_FIELD_CONTAINER_SELECTOR), 
                    pdcInnerHeight = $pdc.innerHeight(), 
                    pdcTitleHeight = $pdc.find(progressive.PROGRESSIVE_CONSTANTS.PDC_TITLE_SELECTOR).outerHeight(), 
                    pdcControlHeight = $pdc.find("[" + progressive.PROGRESSIVE_CONSTANTS.PDC_CONTROLS + "]").outerHeight(), 
                    sectionTitleHeight = this.$element.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_TITLE_SELECTOR).outerHeight(), 
                    sectionFieldContainerHeight,
                    $sectionRepeatableControls = $pdc.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_REPEATABLE_CONTROLS_SELECTOR),
                    repeatableControlsHeight = $sectionRepeatableControls.outerHeight() ? $sectionRepeatableControls.outerHeight() + progressive.heightBuffer : 0,
                    repeatableTitleHeight = $(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_TITLE_CONTAINER_SELECTOR).outerHeight() || 0, 
                    availablePanelHeight,
                    availableFields = this.$element.find(".progressiveSectionField"),
                    currentActiveFields = $sectionFieldContainer.find('.progressiveSectionField.pdcCurrentPanelField'), 
                    consumeHeight,
                    that = this,
                    currentPart = 0,
                    id,
                    offsetDivs = $pdc.find("[" + progressive.PROGRESSIVE_CONSTANTS.PDC_OFFSET_SELECTOR + "]"),
                    hasAtleastOne = false,
                    trunkRest = false; 
                $sectionFieldContainer.css('max-height', ''); 
                sectionFieldContainerHeight = $sectionFieldContainer.height(); 
                
                
                
                
                availablePanelHeight = pdcInnerHeight; 
                _.each(offsetDivs, function (offsetDiv) {
                        availablePanelHeight -= $(offsetDiv).outerHeight();
                    });
                availablePanelHeight -= guidelib.runtime.progressive.heightBuffer;
                
                $sectionFieldContainer.css('max-height', availablePanelHeight + 'px');
                consumeHeight = availablePanelHeight; 

                
                if (sectionFieldContainerHeight > availablePanelHeight) {
                    
                    for (var i = 0; i < availableFields.length; i++) { 
                        var $currentField = $(availableFields[i]),
                            currentFieldHeight = $currentField.outerHeight() + guidelib.runtime.progressive.fieldHeightBuffer;
                        if (currentFieldHeight <= consumeHeight && !trunkRest) {
                            consumeHeight = consumeHeight - currentFieldHeight;
                            hasAtleastOne = true;
                            
                            
                            
                            
                            id = $currentField.children("div").first().attr("id");
                            this._updateParts(currentPart, id);
                        } else if (!hasAtleastOne) {
                            
                            id = $currentField.children("div").first().attr("id");
                            this._updateParts(currentPart, id);
                            hasAtleastOne = true;
                            trunkRest = true;
                        } else {
                            
                            consumeHeight = availablePanelHeight;
                            currentPart++;
                            i--;
                        }
                    }
                } else {
                    
                    $.each(availableFields, function (index) {
                            
                            
                            that._updateParts(currentPart, $(this).children("div").first().attr("id"));
                        });
                }
            }
        },

        
        _updatePartsFromArray : function (sectionParts) {
            if (_.isArray(sectionParts)) {
                _.each(sectionParts, function (part, currentPart) {
                    if (_.isArray(part)) {
                        _.each(part, function (item, index) {
                            
                            this._updateParts(currentPart, item.id);
                        });
                    }
                });
            }
        },

        _updateParts : function (currentPart, id) {
            
            
            this._model._parts[currentPart] = this._model._parts[currentPart] || {} ;
            this._model._parts[currentPart][id] = this._model._getChildModelFromId(id);
        },

        focusable : function () {
            
            return false;
        },

        setActive : function (activeItemToken, focus, muteScripts) {
            
            return true;
        },

        handleChildChanged : function (event) {
            
        },

        handleModelChanged : function (event) {
            
        },

        handleVisibleChanged : function (event) {
            
        },

        handleAccessibility : function () {
            
        },

        getSiblingItemView : function (siblingType) {
            
            return null;
        },

        getQualifiedNamedView : function (qName) {
            
            var view = _.find(this.childViews, function (childView) {
                return (childView._model._escapeQualifiedName() == qName);
            }, this);
            return view;
        }
    });
    GuideProgressiveSectionView.defineProps({
        $item : {
            get : function () {
                
                return null;
            }
        },

        $itemNav : {
            get : function () {
                
                return null;
            }
        },

        isItem : {
            get : function () {
                
                return false;
            }
        },

        qualifiedName : {
            get : function () {
                
                return null;
            }
        }
    });
}($, _, guidelib, window.guideBridge));




(function ($, _, guidelib) {
    var GuideProgressiveRepeatableSectionView = guidelib.view.GuideProgressiveRepeatableSectionView = guidelib.view.GuideProgressiveSectionView.extend({
        initialize : function () {
            GuideProgressiveRepeatableSectionView._super.initialize.call(this);
            
            this._$summary = null;
            if (this._model && this._model != null) {
                
                if (this._model && this._model.instance) {
                    this._model.instance.off(guidelib.event.GuideModelEvent.MODEL_CHANGED, this.handleModelChanged, this);
                    this._model.instance.on(guidelib.event.GuideModelEvent.MODEL_CHANGED, this.handleModelChanged, this);
                }
                this._summarySelector = this.guideUtil.summarySelector(this._model.instance.id);
            }
        },

        postInitialize : function () {
            GuideProgressiveRepeatableSectionView._super.postInitialize.call(this);
            this.handleSummaryChanged();
        },

        

        
        _updateSectionTitle : function () {
            
            
        },

        
        handleRepeatableProgressivePanel : function () {
            
            this._updateIds(this.$element, this._model.repeatablePanelId, this._model.instance.id);
            this.childViews = [];
            
            _.each(this._model.children, function (childModel) {
                    var cTemplateId = childModel.templateId,
                        childId = childModel.id,
                        $childItem = this.$element.find('#' + cTemplateId), 
                        view = null,
                        $childEl;
                    if (!$childItem.length) {
                        return;
                    }
                    
                    
                    
                    this._updateIds(this.$element, cTemplateId, childId);
                }, this
            );
        },

        handleNavigateSection : function (event) {
            GuideProgressiveRepeatableSectionView._super.handleNavigateSection.apply(this, arguments);

        },

        
        _calculatePartsOfSection : function () {
            var userConfig = window.guideBridge.userConfig;
            
            if (userConfig && userConfig["calculatePartsOfSectionConfig"] && _.isFunction(userConfig["calculatePartsOfSectionConfig"]["calculatePartsOfSectionHandler"])) {
                var externalHandler = userConfig["calculatePartsOfSectionConfig"]["calculatePartsOfSectionHandler"],
                
                    sectionParts = externalHandler(this._model);
                this._updatePartsFromArray(sectionParts);
            } else {
                var progressive = guidelib.runtime.progressive,
                    $pdc = $(progressive.PROGRESSIVE_CONSTANTS.PDC_SELECTOR), 
                    $sectionRepeatableControls = $pdc.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_REPEATABLE_CONTROLS_SELECTOR);
                
                $sectionRepeatableControls.find(".hidden").removeClass("hidden");
                var $sectionFieldContainer = this.$element.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_FIELD_CONTAINER_SELECTOR), 
                    pdcOuterHeight = $pdc.outerHeight(), 
                    pdcTitleHeight = $pdc.find(progressive.PROGRESSIVE_CONSTANTS.PDC_TITLE_SELECTOR).outerHeight(), 
                    
                    
                    repeatableControlsHeight = $sectionRepeatableControls.outerHeight(true) ? $sectionRepeatableControls.outerHeight(true) + progressive.heightBuffer : 0,
                    repeatableTitleHeight = this.$element.find(progressive.PROGRESSIVE_CONSTANTS.PDC_SECTION_TITLE_CONTAINER_SELECTOR).outerHeight(true) || 0, 
                    availableFields = this.$element.find(".progressiveSectionField"),
                    id,
                    currentPart = 0,
                    availablePanelHeight;
                
                $sectionRepeatableControls.find("[data-guide-repeatable='back']").addClass("hidden");
                $sectionRepeatableControls.outerHeight(true) ? $sectionRepeatableControls.outerHeight(true) + progressive.heightBuffer : 0,
                
                
                availablePanelHeight = pdcOuterHeight - pdcTitleHeight - repeatableTitleHeight - 1.5 * guidelib.runtime.progressive.heightBuffer;
                
                $sectionFieldContainer.css('max-height', availablePanelHeight + 'px');
                $sectionFieldContainer.css('overflow', 'auto');
                for (var i = 0; i < availableFields.length; i++) { 
                    var $currentField = $(availableFields[i]);
                    
                    
                    id = $currentField.children("div").first().attr("id");
                    this._updateParts(currentPart, id);
                }
            }
        },

        handleSummaryChanged : function () {
            
            if (this.$summary.length > 0) {
                var panelModel = this._model.instance;
                
                if (panelModel == null) {
                    panelModel = window.guideBridge._resolveId("im_" + this._model.repeatablePanelId).instances[0];
                }
                if (panelModel.summary) {
                    this.$summary.text(panelModel.summary);
                } else {
                    var title = panelModel.title || panelModel.name;
                    if (this._model.instanceIndex && panelModel.repeatable) {
                        title += " " + this._model.instanceIndex;
                    }
                    this.$summary.text(title);
                }
            }
        },

        handleModelChanged : function (event) {
            switch (event._property) {
                case "summary":
                    this.handleSummaryChanged();
                    break;
                default:
                    GuideProgressiveRepeatableSectionView._super.handleModelChanged.apply(this, arguments);
            }
        }
    });

    GuideProgressiveRepeatableSectionView.defineProps({
        $summary : {
            get : function () {
                if (!this._$summary) {
                    this._$summary = this._find(this._summarySelector);
                }
                return this._$summary;
            }
        }
    });
}($, _, guidelib));


(function ($, _, guidelib) {

    var GuidePanelView = guidelib.view.GuidePanelView = guidelib.view.GuideItemsView.extend({
        initialize : function () {
            GuidePanelView._super.initialize.call(this);
            this._currentActiveItemView = null;
            this._$itemsContainer = null;
            this._$itemsNavContainer = null;
            this._$summary = null;
            this._$title = null;
            
            this._childInitializeWaiting = true;
            
            this._model.on(guidelib.event.GuideModelEvent.CHILD_CHANGED, this.handleChildChanged, this);
            this._summarySelector = this.guideUtil.summarySelector(this._model.id);
            this._titleSelector = this.guideUtil.propSelector("title", this._model.id);
        },

        addRemoveTemplateMarker : function () {
            
            _.each(this._model.children, function (childModel) {
                if (childModel instanceof guidelib.model.GuideInstanceManager) {
                    
                    var imId = childModel.id,
                        instanceId = (childModel._instances[0] || {}).id || childModel.instanceTemplateId,
                        gTemplateMarker = '<div id="' + imId + '" style="display: none" data-guide-template-marker="true"/>',
                        instanceItem = this.guideUtil.itemSelector(instanceId, childModel),
                        navItem = this.guideUtil.itemNavSelector(instanceId);
                    this.$itemsContainer.find(instanceItem).before(gTemplateMarker);
                    this.$itemsNavContainer.find(navItem).before(gTemplateMarker);
                    if (childModel._instances && childModel._instances.length === 0) { 
                        $(navItem).remove(); 
                        $(instanceItem).remove(); 
                    }

                }
            }, this);

        },

        postInitialize : function () {

            
            
            
            this.handleSummaryChanged();
            this.handleTitleChanged();
            if (this._model.repeatable) {
                this._toggleAddRemoveButtons();
            }
            if (!this.parentView._model.enableLayoutOptimization) {
                
                this._postInitializeChildren();
            } else {
                
                
                
                
                
                
                this.handleVisibleChanged(guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.MODEL_CHANGED,
                    this,
                    "visible",
                    this._model.visible,
                    this._model.visible
                ));
            }
            
            
            
            
            
            this.addRemoveTemplateMarker();
        },

        _postInitializeChildren : function () {
            this._childInitializeWaiting = false;
            this._syncGuideNodeToHtml(true);
            this.handleAccessibility();
            
            
            
            if (this.parentView.$itemsNavContainer && this.parentView.$itemsNavContainer.filter(":not(.tab-navigators-mobile)").length === 0) {
                this.setActive("firstItem", false, true);
            }
        },

        _syncGuideNodeToHtml : function (deepSync) {
            if (this._childInitializeWaiting) {
                return;
            }
            
            
            
            
            
            
            

            var that = this;
            var htmlTemplateCache = this._guideView._domTemplateCacheStore;
            var oldIdToItemsViews = {};
            var oldIdToNonItemsViews = {};
            var newIdToChildViews = {};

            
            _.each(this.childViews, function (childView) {
                if (childView.isItem) {
                    oldIdToItemsViews[childView.id] = childView;
                } else {
                    oldIdToNonItemsViews[childView.id] = childView;
                }
            }, this);

            _.each(this._model.items, function (childModel) {
                    var cTemplateId = childModel.templateId;
                    var childId = childModel.id,
                        $childItem = null,
                        $childItemNav = null;
                    
                    
                    $childItem = this._find(this.guideUtil.itemSelector(childId, childModel));
                    $childItemNav = this._find(this.guideUtil.itemNavSelector(childId));

                    if (!$childItem.length && !newIdToChildViews[cTemplateId]) {
                        
                        
                        $childItem = this.$itemsContainer.find(this.guideUtil.itemSelector(cTemplateId, childModel));
                        $childItemNav = this.$itemsNavContainer.find(this.guideUtil.itemNavSelector(cTemplateId));
                    }
                    if (!$childItem.length) {
                        
                        $childItem = htmlTemplateCache.cloneDomElement(this.guideUtil.itemSelector(cTemplateId, childModel));
                        $childItemNav = htmlTemplateCache.cloneDomElement(this.guideUtil.itemNavSelector(cTemplateId));
                        if (!$childItem.length) {
                            this.logger().error("AF", "Html template could not be found. cTemplateId:" + cTemplateId + ", som:" + childModel.somExpression);
                            return;
                        }
                    }
                    this._updateIds($childItem, cTemplateId, childId);
                    this._updateIds($childItemNav, cTemplateId, childId);
                    
                    
                    $childItem.attr("data-guide-parent-id", this._model.id);
                    $childItemNav.attr("data-guide-parent-id", this._model.id);
                    var view = null;
                    if (oldIdToItemsViews.hasOwnProperty(childId)) {
                        view = oldIdToItemsViews[childId];
                        if (view instanceof guidelib.view.GuidePanelView && view._model.instanceManager.repeatable) {
                            
                            this._fixChildDom(view);
                        }
                        if (deepSync) {
                            view._syncGuideNodeToHtml(deepSync);
                        } 
                    } else {
                        var $childEl = this._find("#" + childId);
                        if ($childEl.length) {
                            view = this._createChild($childEl);
                        } else {
                            $childEl = $childItem.find("#" + childId).addBack("#" + childId);
                            if ($childEl.length) {
                                view = this._createChild($childEl, $childItem, $childItemNav);
                            } else {
                                this.logger().debug("AF", "Skip creating view. could not find el for id:" + childId);
                            }
                        }
                        if (this._model.repeatable) {
                            guidelib.util.GuideUtil._initializeShortDescription($childEl);
                        }
                    }
                    if (view) {
                        newIdToChildViews[childId] = view;
                    }
                }, this
            );

            
            this.$itemsContainer.find('[data-guide-parent-id="' + that._model.id + '"]').each(function () {
                var $this = $(this);
                var thisId = $this.attr("id");
                
                if (thisId.indexOf(that.guideUtil.GUIDE_ITEM_SUFFIX) === -1) {
                    thisId = $this.attr(that.guideUtil.DATA_GUIDE_ITEM);
                }
                var childId = thisId.substring(0, thisId.length - that.guideUtil.GUIDE_ITEM_SUFFIX.length);
                if (!newIdToChildViews.hasOwnProperty(childId) && !window.guideBridge._resolveId(childId)) {
                    that.logger().log("guideView", 5, "removing element as no corresponding form dom node found. id:" + thisId + ", parent id:" + that.id);
                    $this.remove();
                    that._find(that.guideUtil.itemNavSelector(childId)).remove();
                }
            });

            this.childViews = [];
            _.each(this._model.children, function (childModel) {
                var childIsItem = childModel._isItem;
                var childId = childModel.id;
                if (childIsItem && newIdToChildViews.hasOwnProperty(childId)) {
                    
                    this.childViews.push(newIdToChildViews[childId]);
                } else if (!childIsItem) {
                    var nonItemChildView = null;
                    if (oldIdToNonItemsViews.hasOwnProperty(childId)) {
                        nonItemChildView = oldIdToNonItemsViews[childId];
                    } else {
                        nonItemChildView = this._createNonRepeatChildView(childModel);
                    }
                    if (nonItemChildView) {
                        if (deepSync) {
                            nonItemChildView._syncGuideNodeToHtml(deepSync);
                        }
                        this.childViews.push(nonItemChildView);
                    }
                }
            }, this);
            
            guidelib.view.GuideBaseView.prototype._syncGuideNodeToHtml.apply(this, arguments);   
        },

        _createChild : function ($childEl, $item, $itemNav) {
            var view = guidelib.view.GuideViewRegistry.prototype.createView($childEl, this);
            this._fixChildDom(view, $item, $itemNav);
            view.postInitialize();
            return view;
        },

        _fixChildDom : function (view, $item, $itemNav) {
            
            
            
            var newChild = view._model;
            if (!(newChild instanceof guidelib.model.GuidePanel) || !newChild.repeatable) {
                return;
            }
            var $childItem = $item || view.$item;
            var $childItemNav = $itemNav || view.$itemNav;
            var children = this._model.children;
            var insertAfterId = (newChild.instanceIndex > 0) ? children[children.indexOf(newChild) - 1].id : null;
            
            var insertAfterItemSelector = insertAfterId ? this.guideUtil.itemSelector(insertAfterId, newChild) : "#" + newChild.instanceManager.id;
            var insertAfterNavSelector = insertAfterId ? this.guideUtil.itemNavSelector(insertAfterId) : "#" + newChild.instanceManager.id;
            var that = this;
            
            
            this.$itemsContainer.each(function (index) {
                var insertEl = $childItem.get(index) || $childItem.get(0),
                    $insertAfterItem = $(this).find(insertAfterItemSelector);
                
                if ($insertAfterItem.length == 0) {
                    insertAfterItemSelector = "[data-guide-template-marker=" + newChild.instanceManager.id + "]";
                    $insertAfterItem = $(this).find(insertAfterItemSelector);
                }
                
                if ($insertAfterItem.get(0) !== insertEl) {
                    
                    
                    $insertAfterItem.after($(insertEl));
                }
            });
            
            
            
            this.$itemsNavContainer.each(function (index) {
                var insertNavEl = $childItemNav.get(index) || $childItemNav.get(0);
                $(this).find(insertAfterNavSelector).after($(insertNavEl));
            });
        },

        handleChildChanged : function (event) {
            if (event._property == "childRemoved") {
                var $elementRemoved = this.$element.find("#" + event.prevText.id),
                    index = $elementRemoved.index();
            }
            
            this._syncGuideNodeToHtml(true);
            this.childViews.forEach(function (childView) {
                if (childView._model.repeatable) {
                    childView._toggleAddRemoveButtons();
                }
            });
            if (event._property == "childRemoved") {
                
                
                this.$element.trigger("panelRemoved.af", [$elementRemoved, index]);
                if (this.currentActiveItemView && event.prevText == this.currentActiveItemView._model) {
                    
                    this._currentActiveItemView = null;
                    this.setActive("nextItem");
                }
            }
            if (event._property == "childAdded") {
                var childAdded = event.newText;
                
                
                this.$element.trigger("panelAdded.af", [this.$element.find("#" + childAdded.id)]);
            }
        },

        handleSummaryChanged : function () {
            if (this.$summary.length > 0) {
                if (this._model.summary) {
                    this.$summary.text(this._model.summary);
                } else {
                    var title = this._model.title;
                    if (this._model.instanceIndex && this._model.repeatable) {
                        title += " " + this._model.instanceIndex;
                    }
                    this.$summary.text(title);
                }
            }
        },

        handleTitleChanged : function () {
            if (this.$title.length > 0) {
                this.$title.text(this._model.title);
            }
        },

        handleModelChanged : function (event) {
            switch (event._property) {
                case "summary":
                    this.handleSummaryChanged();
                    break;
                case "title":
                    this.handleTitleChanged();
                    break;
                default:
                    GuidePanelView._super.handleModelChanged.apply(this, arguments);
            }
        },

        
        _embedHtml : function (referredHtml, uniquePrefix) {
            var bIsSuccess = false;
            if (referredHtml) {

                
                

                var parentIdSelector = "#" + this.id,
                
                    re = /<div .*?>/,
                
                    openingDiv = referredHtml.match(re),
                    parentUniquePrefix = this.id.substring(0, this.id.indexOf("__" + this._model.templateId));
                
                referredHtml = referredHtml.substring(openingDiv[0].length, referredHtml.lastIndexOf("</div>"));
                $(parentIdSelector).html(referredHtml);
                
                this._guideView._domTemplateCacheStore.putDomElement("#" + this._model.templateId, $(parentIdSelector).clone());
                
                
                if (this._model.repeatable || this._model._ancestorRepeatable) {
                    var that = this;
                    $(parentIdSelector).find('[id^="guideContainer"]').each(function (i, el) {
                        var $el = $(el),
                            id = el.id;
                        if (id.indexOf(that._model.templateId + "_") != 0) {
                            
                            $el.attr('id', uniquePrefix + "__" + $el.attr('id'));
                        } else if (parentUniquePrefix) {
                            $el.attr('id', parentUniquePrefix + "__" + id);
                        }
                    });
                }

                
                
                
                bIsSuccess = true;
            }
            return bIsSuccess;
        },

        _createReferredView : function () {
            
            this._postInitializeChildren();
        },

        
        setActive : function (activeItemToken, focus, muteScripts) {
            
            
            
            if (this._model._lazyReference) {
                
                
                
                
                

                if (_.isUndefined(this._viewCreationInProgress) && _.isUndefined(this._itemsLoaded)
                    && this._guideView._currentActiveItemView !== this) {
                    
                    guidelib.internal.liveDataUtils.updateLiveData();
                    
                    this._guideView._clearInactiveLazyViews(this);

                    
                    this._viewCreationInProgress = true;
                    var path = this._model["jsonModel"]["jcr:path"],
                        externalizedPath;
                    
                    externalizedPath = guideBridge._getGuidePathUrl(".jsonhtmlemitter", path);
                    this._fetchFromAjaxCall(externalizedPath);
                    
                    

                }
            }

            var currentActiveItemQName = this.getOrElse(this.currentActiveItemView, "qualifiedName", null);
            
            activeItemToken = activeItemToken || currentActiveItemQName || "firstItem";
            if (activeItemToken != currentActiveItemQName) {
                var newActiveItemModel = this._model.navigationContext.getItemForNav(activeItemToken);
                if (!newActiveItemModel) {
                    this.logger().log("AF", "activeItemToken not found:" + activeItemToken + ",currentActiveItem:" +
                        currentActiveItemQName + ":" + this._model.somExpression);
                    return false;
                }
                var newActiveItemView = this.getQualifiedNamedView(newActiveItemModel._escapeQualifiedName());
                if (!muteScripts && this._model.completionExpReq && this.currentActiveItemView && this.currentActiveItemView.focusable() && (this.childViews.indexOf(newActiveItemView) > this.childViews.indexOf(this.currentActiveItemView))) {
                    var completed = true;
                    if (this._model.getAttribute("validateOnStepCompletion")) {
                        completed = window.guideBridge.validate([], this._model.panel.navigationContext.currentItem.somExpression);
                    }
                    
                    completed = completed && this._model.executeExpression("completionExp");
                    if (!completed) {
                        return false;
                    } else if (this.currentActiveItemView) {
                        this.currentActiveItemView.$item.addClass("completed");
                        this.currentActiveItemView.$itemNav.addClass("completed");
                    }
                }
                this.currentActiveItemView = newActiveItemView;
                
                
                
                
                
            }
            if (this.currentActiveItemView) {
                this.currentActiveItemView.setActive(null, focus, muteScripts);
            }
            return true;
        },
        
        _clearInactiveLazyViews : function (that) {
            _.each(this.childViews, function (item) {
                if (item && item._model.className === "guidePanel" && item._ancestorHasNavigableLayout) {
                    if (item._itemsLoaded && !that._isSelfOrAncestor(item) && !item._hasEffectiveActiveClass()
                        && item._model._lazyReference) {
                        item._model._unloadLazyReferenceModel();
                        item._unloadView();
                        item._itemsLoaded = undefined;
                    } else {
                        item._clearInactiveLazyViews(that);
                    }
                }
            }, this);
        },
        
        _isSelfOrAncestor : function (panelView) {

            var selfOrParentView = this;
            while (!_.isUndefined(selfOrParentView) && selfOrParentView._model.className !== "rootPanelNode") {
                if (panelView === selfOrParentView) {
                    return true;
                }
                selfOrParentView = selfOrParentView.parentView;
            }
            return false;
        },
        
        _hasEffectiveActiveClass : function () {
            var hierarchy = this;
            while (!_.isUndefined(hierarchy) && this._model.className !== "rootPanelNode") {
                if (hierarchy.$item.hasClass("active")) {
                    hierarchy = hierarchy.parentView;
                } else {
                    return false;
                }
            }
            return true;
        },

        handleAccessibility : function () {
            var role, screenReaderText;
            screenReaderText = this._model._getScreenReaderText();
            role = this._model._getRole();
            if (screenReaderText) {
                this.$itemNav.attr("aria-label", screenReaderText);
            }
            this.$itemNav.find('a').attr("tabindex", 0);
        },

        getQualifiedNamedView : function (qName) {
            var view = _.find(this.childViews, function (childView) {
                return (childView._model._escapeQualifiedName() == qName);
            }, this);
            return view;
        },

        _fetchFromAjaxCall : function (externalizedPath) {
            $("#loadingPage").addClass("guideLoading");
            var that = this;
            $.ajax({
                url : externalizedPath,
                type : "GET",
                data : {
                    "wcmmode" : "disabled",
                    "guidePath" : guideBridge.getGuidePath(),
                    templateId : that._model.templateId
                },
                async : false, 
                success : function (jsonHtml) {
                    var uniquePrefix;
                    
                    
                    
                    if (that._model.repeatable || that._model._ancestorRepeatable) {
                        uniquePrefix = that.guideUtil.generateUID();
                    }
                    if (that._embedHtml(jsonHtml["html"], uniquePrefix)) {
                        that._model._ajaxCallDone = true;

                        
                        
                        
                        var referredJson = JSON.parse(jsonHtml["json"])["items"];
                        that._model._embedJson(referredJson, uniquePrefix);
                        
                        var guideDirtyMarkerAndVisitor = guidelib.internal.GuideDirtyMarkerAndVisitor;
                        guideDirtyMarkerAndVisitor._updateCountOrInsert(guideDirtyMarkerAndVisitor.visitMap, that._model.templateId);

                        
                        guidelib.internal.liveDataUtils.playLiveData(that._model);
                        
                        that._model.prepare();
                        
                        
                        
                        that._createReferredView();
                        
                        

                        that._viewCreationInProgress = undefined;
                        that._itemsLoaded = true;

                        
                        
                        
                    }

                },
                error : function () {
                    that.logger().error("AF", "Failed to fetch HTML and JSON for :" + externalizedPath);
                },
                complete : function () {
                    $("#loadingPage").removeClass("guideLoading");
                    guideBridge._guide.trigger(guidelib.event.GuideModelEvent.LAZY_LOADED);
                    
                    that._model._triggerOnBridge("elementLazyLoaded", that._model);
                }
            });

        },

        _toggleAddRemoveButtons : function () {
            var panelModel = this._model,
                instanceManager = panelModel.instanceManager;
            $('[data-guide-id="' + panelModel.id + '"][data-guide-addremove="remove"]').toggleClass("hidden", instanceManager.instanceCount == instanceManager.minOccur);
            $('[data-guide-id="' + panelModel.id + '"][data-guide-addremove="add"]').toggleClass("hidden", instanceManager.instanceCount == instanceManager.maxOccur);
        }
    });

    GuidePanelView.defineProps({
        hasNavigableLayout : {
            get : function () {
                return this.$itemsNavContainer.length > 0;
            }
        },
        $itemsContainer : {
            get : function () {
                
                if (this._model._selfOrAncestorIsLazyReference || !this._$itemsContainer || this._$itemsContainer.length === 0) {
                    this._$itemsContainer = this._find(this.guideUtil.itemContainerSelector(this._model.id));
                    
                    if (this._$itemsContainer.length === 0) {
                        this._$itemsContainer = this._find(this.guideUtil.alternateItemContainerSelector(this._model.id));
                    }
                }
                return this._$itemsContainer;
            }
        },
        $itemsNavContainer : {
            get : function () {
                if (this._model._selfOrAncestorIsLazyReference || !this._$itemsNavContainer || this._$itemsNavContainer.length === 0) {
                    this._$itemsNavContainer = this._find(this.guideUtil.itemNavContainerSelector(this._model.id));
                }
                return this._$itemsNavContainer;
            }
        },
        $summary : {
            get : function () {
                if (!this._$summary) {
                    this._$summary = this._find(this._summarySelector);
                }
                return this._$summary;
            }
        },
        $title : {
            get : function () {
                if (!this._$title) {
                    this._$title = this._find(this._titleSelector);
                }
                return this._$title;
            }
        },
        currentActiveItemView : {
            get : function () {
                return this._currentActiveItemView;
            },
            set : function (value) {
                if (value != this._currentActiveItemView) {
                    if (this._currentActiveItemView) {
                        
                        this._currentActiveItemView._model.viewVisited = true;
                    }
                    if (!value) {
                        var itemModel = this._model.navigationContext.firstItem;
                        if (itemModel) {
                            value = this.getQualifiedNamedView(itemModel._escapeQualifiedName());
                        }
                    }
                    this._currentActiveItemView = value;
                    
                    this._model.navigationContext.currentItem = (this._currentActiveItemView || {})._model;
                    _.each(this.childViews, function (childView) {
                        if (childView == this._currentActiveItemView) {
                            childView.$item.addClass("active");
                            childView.$itemNav.addClass("active");
                            childView.$itemNav.attr("aria-selected", true);
                            childView.$itemNav.attr("aria-disabled", false);
                            childView.$itemNav.removeClass("wizard-tab-disabled");
                        } else {
                            childView.$item.removeClass("active");
                            childView.$itemNav.removeClass("active");
                            childView.$itemNav.attr("aria-selected", false);
                        }
                    }, this);
                    
                    
                    
                    
                    if (this._currentActiveItemView instanceof guidelib.view.GuidePanelView && this._currentActiveItemView._childInitializeWaiting) {
                        this._currentActiveItemView._postInitializeChildren();
                    }

                    if (true && _.isUndefined(this._model._ajaxCallDone)) {
                        
                        
                        var model = this._model;
                        
                        while (model && !(model instanceof guidelib.model.RootPanelNode)) {
                            if (model.toolbar) {
                                model.toolbar.execNavigationChangeExpression();
                            }
                            model = model.parent;
                        }
                        
                        if (model && model.toolbar && model instanceof  guidelib.model.RootPanelNode) {
                            model.toolbar.execNavigationChangeExpression();
                        }
                    }
                }
            }
        },
        
        _ancestorHasNavigableLayout : {
            get : function () {
                var parentView = this.parentView;
                while (parentView) {
                    if (parentView.$itemsNavContainer && parentView.$itemsNavContainer.length > 0) {
                        return true;
                    }
                    parentView = parentView.parentView;
                }
                return false;
            }
        }
    });
}($, _, guidelib));


(function ($, guidelib) {
    var GuideTableRowView = guidelib.view.GuideTableRowView = guidelib.view.GuidePanelView.extend({

        handleChildChanged : function (event) {
            
        }

    });
}($, guidelib));


(function ($, _, guidelib) {

    var cloneCounter = 0;

    var tableMobileLayoutConstants = {
        COLLAPSIBLE_COLUMNS : "collapsibleColumns",
        HEADERS_LEFT : "headersLeft",
        COLLAPSIBLE_COLUMNS_CONTROL_ROW_SELECTOR : "tr.child",
        RUNTIME_TABLE_CONTROL : "guideTableRuntimeControls",
        RUNTIME_TABLE_RIGHT_CONTROL : "guideTableRuntimeRightControls",
        RUNTIME_TABLE_LEFT_CONTROL : "guideTableRuntimeLeftControls",
        RUNTIME_TABLE_ADD_CONTROL : "guideTableRuntimeAddControl",
        RUNTIME_TABLE_DELETE_CONTROL : "guideTableRuntimeDeleteControl",
        RUNTIME_TABLE_EDIT_CONTROL : "guideTableRuntimeEditControl"
    };

    var GuideTableView = guidelib.view.GuideTableView = guidelib.view.GuidePanelView.extend({

        
        TABLE_WIDTH_BUFFER : 23,
        
        _getPluginOptions : function () {
            var defaultOptions  = {
                "bAutoWidth" : this.bAutoWidth
            }, columnWidthArray = null,
                sum = 0,
                sWidthArray = null,
                numOfTableCol = this.$tableElement.find("th").length;

            if (this.bAutoWidth === false) {
                columnWidthArray = this._model.columnWidth.split(",");
                if (columnWidthArray.length === numOfTableCol) {
                    
                    _.each(columnWidthArray, function (item) {
                        sum += parseInt(item, 10);
                    });
                    
                    sWidthArray = _.map(columnWidthArray, function (item) {
                        return {
                            "pWidth" : Math.floor((item * 100) / sum)
                        };
                    });
                }
                
                defaultOptions = _.extend({}, defaultOptions, {
                    aWidthPercentage : sWidthArray,
                    aWidth : columnWidthArray
                });
            }
            return defaultOptions;

        },

        
        setAutoWidth : function () {
            if (this._model.columnWidth && this._model.columnWidth.length > 0) {
                this.bAutoWidth = false;
            }  else {
                this.bAutoWidth = true;
            }
        },

        
        createView : function (id) {
            var $htmlTemplate = this._guideView._domTemplateCacheStore.cloneDomElement("#" + id),
                formElemSelector = "#" + id + "_widget",
                counter = ++cloneCounter;
            if ($htmlTemplate.length == 0) {
                
                $htmlTemplate = this.$element.find("#" + id).clone();
            }
            
            $htmlTemplate.find(formElemSelector).attr("id", id + "_widget" + counter);

            var view = guidelib.view.GuideViewRegistry.prototype.createView($htmlTemplate, this);
            view.postInitialize();
            return $htmlTemplate;
        },

        initializeTableColumnWidth : function (pluginOptions) {
            
            if (this.bAutoWidth == false && this._model.mobileLayout === tableMobileLayoutConstants.HEADERS_LEFT) {
                
                
                this.$tableElement.css("table-layout", "fixed");
                var widthArray = pluginOptions["aWidthPercentage"],
                    numOfTableCol = this.$tableElement.find("th").length;
                if (widthArray.length == numOfTableCol) {
                    
                    this.$tableElement.find("th").each(function (index) {
                        $(this).width(widthArray[index]["pWidth"] + "%");
                    });
                }
            }
        },

        
        initialize : function () {
            GuideTableView._super.initialize.apply(this, arguments);
            
            this.$tableElement = this.$element.find("> table");
            
            this.setAutoWidth();
            
            var widgetOptions = this._getPluginOptions(),
                that = this;
            
            this.initializeTableColumnWidth(widgetOptions);
            this._fixTableControls(true);
            if (this._model.mobileLayout ===  tableMobileLayoutConstants.COLLAPSIBLE_COLUMNS) {
                widgetOptions = _.extend({}, widgetOptions, {
                    
                    bControlRowHiddenCells : false,

                    
                    bDisableControlRowCells : true,
                    
                    viewCallback : $.proxy(this.createView, this),
                    
                    tableRuntimeEditControlClass : tableMobileLayoutConstants.RUNTIME_TABLE_EDIT_CONTROL,
                    
                    fixTableControls : $.proxy(this._fixTableControls, this)
                });
                
                this.jqwidget = this.$tableElement.responsiveTablePlugin(widgetOptions).data("responsiveTablePlugin");
            }  else {
                
                $(window).on("resize orientationchange", function (event) {
                    that._fixTableControls(event);
                });
            }
        },

        handleVisibleChanged : function (event) {
            GuideTableView._super.handleVisibleChanged.apply(this, arguments);
            
            this.handleTableShown();
        },

        handleTableShown : function () {
            if (this._model.mobileLayout ===  tableMobileLayoutConstants.COLLAPSIBLE_COLUMNS) {
                
                this.jqwidget._initializeColumnVisibility();
                
                if (this.jqwidget.isColumnHidden()) {
                    
                    this.$tableElement.find(".guideFieldNode").addClass("dontSyncEnabled");
                    
                    this.$tableElement.find("input, select, textarea, button").attr("disabled", "disabled");
                }
            }
        },

        _resetTableCellWidth : function () {
            var that = this,
                index,
                componentWidth;
            
            this.$tableElement.find("." + tableMobileLayoutConstants.RUNTIME_TABLE_CONTROL).each(function () {
                
                if ($(this).hasClass(tableMobileLayoutConstants.RUNTIME_TABLE_RIGHT_CONTROL)) {
                    var $component = $(this).prev(),
                        $td = $(this).parent(),
                        $control = $(this);
                    
                    
                    if ($(this).is(":visible")) {
                        
                        $component.css("display", "inline-block");
                        $component.css("float", "left");
                        componentWidth = $td.width() - $control.outerWidth() - that.TABLE_WIDTH_BUFFER;
                        var percentage = ((componentWidth / $td.width()) * 100);
                        
                        
                        $component.width(percentage + "%");
                    } else {
                        
                        
                        $component.css("display", "block");
                        $component.css("float", "none");
                        $component.width($td.width());
                    }
                } else if ($(this).hasClass(tableMobileLayoutConstants.RUNTIME_TABLE_LEFT_CONTROL)) {
                    
                    if ($(this).is(":visible")) {
                        $(this).next().css("display", "inline-block");
                        componentWidth = $(this).parent().width() - $(this).outerWidth() - that.TABLE_WIDTH_BUFFER;
                        var percentage = ((componentWidth / $(this).parent().width()) * 100);
                        $(this).next().width(percentage + "%");
                    } else {
                        
                        $(this).next().css("display", "block");
                    }
                }
            });
        },

        _fixTableControls : function (event) {
            
            
            
            if ((this._model.mobileLayout ===  tableMobileLayoutConstants.COLLAPSIBLE_COLUMNS) && (this.jqwidget)) {
                
                if (this.jqwidget.isColumnHidden()) {
                    
                    this.$tableElement.find("tr:not(.child)").find(".guideFieldNode").addClass("dontSyncEnabled");
                    
                    this.$tableElement.find("tr:not(.child)").find("input, select, textarea, button").attr("disabled", "disabled");
                } else {
                    
                    this.$tableElement.find(".guideFieldNode").removeClass("dontSyncEnabled");
                    
                    this.$tableElement.find("input, select, textarea, button").removeAttr("disabled");
                }
            }
            
            
            if (event) {
                this._resetTableCellWidth();
            }
        },

        
        _fixChildDom : function (view, $item, $itemNav) {
            GuideTableView._super._fixChildDom.apply(this, arguments);
            
            
            if (this._model.mobileLayout ===  tableMobileLayoutConstants.COLLAPSIBLE_COLUMNS) {
                
                this.jqwidget._fixControlRows();
            }
            
            this._fixTableControls();
            
            this._resetTableCellWidth();
        },

        _postInitializeChildren : function () {
            
            GuideTableView._super._postInitializeChildren.call(this);
            
            
            
            
            
            if (this._model.mobileLayout ===  tableMobileLayoutConstants.COLLAPSIBLE_COLUMNS) {
                
                this.handleTableShown();
            }
            
            
            else if (this._model.mobileLayout === tableMobileLayoutConstants.HEADERS_LEFT) {
                this._fixTableCellForHeaderLeftLayout();
            }
            this._resetTableCellWidth();
        },

        _fixTableCellForHeaderLeftLayout : function () {
            var that = this;
            this.$tableElement.find("tr td").each(function () {
                
                
                var headerId = $(this).attr("headers").split(" ")[0],
                    
                    $firstHeader = that.$tableElement.find("#" + headerId);
                $(this).attr("guide-data-header", $.trim($firstHeader.text()));
            });
        },

        
        handleChildChanged : function (event) {
            GuideTableView._super.handleChildChanged.apply(this, arguments);
            
            
            if (this._model.mobileLayout === tableMobileLayoutConstants.HEADERS_LEFT) {
                this._fixTableCellForHeaderLeftLayout();
            }
            if (event._property == "childAdded") {
                this._resetTableCellWidth();
            }
        },

        addRemoveTemplateMarker : function () {
            
            _.each(this._model.children, function (childModel) {
                if (childModel instanceof guidelib.model.GuideInstanceManager) {
                    
                    var imId = childModel.id,
                        instanceId = (childModel._instances[0] || {}).id || childModel.instanceTemplateId,
                        gTemplateMarker = null,
                        
                        instanceItem = this.guideUtil.itemSelector(instanceId, childModel._instances[0]),
                        navItem = this.guideUtil.itemNavSelector(instanceId),
                        $instanceItem = this.$itemsContainer.find(instanceItem);
                    if ($instanceItem.is("tr")) {
                        $instanceItem.attr("data-guide-template-marker", imId);
                    }
                    
                    
                    
                    
                    
                }
            }, this);
        }
    });
}($, _, guidelib));

(function ($, guidelib, _) {
    var GuideContainerView = guidelib.view.GuideContainerView =  guidelib.view.GuideItemsView.extend({
        initialize : function () {
            this._queueViewForLazyItems = [];
            
            window.guideBridge._guideView = this;
            var $htmlTemplateDom =  $(this.options.element).clone();
            this._domTemplateCacheStore =
                new guidelib.view.util.DomTemplateCacheStore({$htmlTemplateDom : $htmlTemplateDom});
            this._lastFocussedPanelForNonActionFields = null;
            GuideContainerView._super.initialize.call(this);
            this._currentFocusItemSom = null;
            
            
            this._previousFocusItemSom = "FIRST_TIME";
            $(window).on("keydown.guides", $.proxy(this.hotKeys, this));
            this.postInitialize();
            this._model.on(guidelib.event.GuideModelEvent.MODEL_REFRESH, function (evnt) {
                switch (evnt._property) {
                case "jsonModel":
                    this._syncGuideNodeToHtml(true);
                    break;
                default:
                    this._model.logger().error("unexpected event property " + evnt._property);
                }
            }, this);
        },

        _reInitializeGuideContainerDom : function () {
            var $guideContainerDom = $('div.guideContainerWrapperNode');
            this.$element = $guideContainerDom;
        },

        setFocus : function (somExp, focusOpt, runNavScr) {
            var options,
                focusOption,
                runNavScript,
                somExpression,
                muteScripts;
            if (_.isObject(somExp)) {
                options = somExp;
                somExpression = options.somExpression;
                focusOption = options.focusOption;
                runNavScript = options.runCompletionScript;
            } else {
                somExpression = somExp;
                focusOption = focusOpt;
                runNavScript = runNavScr;
            }
            muteScripts = !runNavScript;
            if (focusOption == "nextItemDeep" || focusOption == "prevItemDeep") {
                
                if (somExpression) {
                    this.logger().warn("AF", "somExpression is currently not supported for deepNavigation:" + somExpression + ":" + focusOption);
                    return false;
                }
                var existingFocusNavItem = this.getSomOnNavigableAncestor(this._lastFocussedPanelForNonActionFields);
                var existingNavView = this.getView(existingFocusNavItem);
                var siblingNavName = (focusOption == "nextItemDeep") ? "nextItem" : "prevItem";
                
                while (existingNavView && (existingNavView.parentView != this) && !existingNavView.getSiblingItemView(siblingNavName)) {
                    var navigableParentItem = this.getSomOnNavigableAncestor(existingNavView.parentView._model.somExpression);
                    existingNavView = this.getView(navigableParentItem);
                }
                if (existingNavView && existingNavView.parentView != this && existingNavView.getSiblingItemView(siblingNavName)) {
                    var madeActive = existingNavView.parentView.setActive(siblingNavName, false, muteScripts); 
                    if (!madeActive) {
                        this.logger().log("AF", "could not setActive for the deepNav:" + existingNavView._model.somExpression);
                        return false;
                    }
                    
                    var deepChildNav = (siblingNavName == "nextItem") ? "firstItem" : "lastItem";
                    var currentActiveChildView = existingNavView.parentView.currentActiveItemView;
                    while (currentActiveChildView) {
                        currentActiveChildView.setActive(deepChildNav, !currentActiveChildView.currentActiveItemView, true); 
                        currentActiveChildView = currentActiveChildView.currentActiveItemView;
                    }
                    return true;
                } else {
                    this.logger().warn("AF", "could not locate view for given somExpression:" + somExpression + ":" + focusOption);
                    return false;
                }
            }

            if (!somExpression) {
                
                somExpression = this.guideModel.rootPanel.somExpression;
            }
            var currentView = this.rootPanelView;
            
            
            if (currentView) {
                var relativeSom = this.guideUtil.relativeSom(this.guideModel.rootPanel.somExpression, somExpression);
                if (relativeSom) {
                    var somTokens = relativeSom.split(".");
                    var error =
                        _.find(somTokens, function (qName) {
                            currentView.setActive(qName, false, muteScripts);
                            if (currentView instanceof guidelib.view.GuidePanelView && (currentView.currentActiveItemView == null || currentView.currentActiveItemView.qualifiedName != qName)) {
                                this.logger().log("AF", "could not find token:" + qName + ", som:" + somExpression);
                                return true; 
                            } else {
                                currentView = currentView.currentActiveItemView;
                            }
                        }, this);
                    if (error) {
                        return false;
                    }
                }
            } else {
                
                var $element = this._getGuideDomElement(somExpression);
                
                
                if ($element && $element.length > 0) {
                    
                    
                    currentView = $element.data("guideView");
                }
            }

            if (currentView) {
                return currentView.setActive(focusOption, true, muteScripts);
            } else {
                return false;
            }
        },

        _getGuideDomElement : function (somExpression, option) {
            var nav = "", res, node, nodeElSelector;
            if (somExpression && typeof somExpression === 'string') {
                node = this.guideModel.resolveNode(somExpression);
                if (!node) {
                    return;
                }
                nodeElSelector = "#" + node.id;
                if (option === "nav") {
                    nodeElSelector = this.guideUtil.itemNavSelector(node.id);
                }
                res = this.$element.find(nodeElSelector);
                return res;
            }
        },

        getView : function (somExpression) {
            if (!somExpression) {
                return null;
            }
            var $focusEl = this._getGuideDomElement(somExpression),
                view = null,
                ancestorView = null;
            if ($focusEl && $focusEl.length > 0) {
                if (!$focusEl.data("guideView")) {
                    var rootPanelSom = this.guideModel.rootPanel.somExpression;
                    var relativeSom = guidelib.util.GuideUtil.relativeSom(rootPanelSom, somExpression) || "";
                    
                    _.reduce(relativeSom.split("."), function (currentSom, somToken) {
                        currentSom = currentSom ? currentSom + "." + somToken : somToken;
                        ancestorView = this.getView(currentSom);
                        if (ancestorView instanceof guidelib.view.GuidePanelView && ancestorView._childInitializeWaiting) {
                            ancestorView._postInitializeChildren();
                        }
                        return currentSom;
                    }, rootPanelSom, this);
                }
                view = $focusEl.data("guideView");
                if (view instanceof guidelib.view.GuidePanelView && view._childInitializeWaiting) {
                    view._postInitializeChildren();
                }

                return view;
            }
            return null;
        },

        hotKeys : function (evnt) {
            var handled = false, currentFocusItemSom;

            switch (evnt.keyCode) {
            case 37: 
                if (evnt.altKey) {
                    window.guideBridge.setFocus(null, 'prevItemDeep', true);
                    handled = true;
                }
                break;
            case 39: 
                if (evnt.altKey) {
                    window.guideBridge.setFocus(null, 'nextItemDeep', true);
                    handled = true;
                }
                break;
            case 82: 
                if (evnt.altKey) {
                    window.guideBridge.reset();
                    handled = true;
                }
                break;
            case 83: 
                if (evnt.altKey) {
                    window.guideBridge.submit();
                    handled = true;
                }
                break;
            }
            if (handled) {
                evnt.preventDefault();
            }
        },

        getSomOnNavigableAncestor : function (somExpression) {
            if (!somExpression || somExpression === "") {
                return null;
            }

            var index, parentView, parentSom, isNavigable;
            index = somExpression.lastIndexOf(".");

            if (index !== -1) {
                parentSom = somExpression.substring(0, index);
                parentView = this.getView(parentSom);
                if (parentView) {
                    isNavigable = parentView.hasNavigableLayout;
                }
                if (isNavigable) {  
                    return somExpression;
                }
                return this.getSomOnNavigableAncestor(parentSom);
            }
            
            return this.guideModel.rootPanel.somExpression;
        },

        __printSyncPending : function () {
            
            _.each(this.childViews, function (childView) {
                if (childView._syncPending) {
                    this.logger().error("AF", childView._model.somExpression);
                } else {
                    GuideContainerView.prototype.__printSyncPending.call(childView);
                }
            }, this);
        },
        
        _clearInactiveLazyViews : function (that) {
            _.each(this.childViews, function (item) {
                if (item._model.className === "rootPanelNode") {
                    item._clearInactiveLazyViews(that);
                }
            });
        }

    });

    GuideContainerView.defineProps({
        guideModel : {
            get : function () {
                return this._model;
            }
        },

        rootPanelView : {
            get : function () {
                return this._findChildView(this.guideModel.rootPanel);
            }
        },

        currentFocusItemSom : {
            get : function () {
                return this._currentFocusItemSom;
            },
            set : function (newSom) {
                if (this._currentFocusItemSom !== newSom) {
                    var oldValue = this._currentFocusItemSom;
                    if (oldValue) {
                        this._previousFocusItemSom = oldValue;
                    }
                    this._currentFocusItemSom = newSom;
                    
                    if (!guidelib.runtime.progressive && newSom != null && this._model.resolveNode(newSom).parent.className !== "guideToolbar") {
                        this._lastFocussedPanelForNonActionFields = this.getSomOnNavigableAncestor(this._currentFocusItemSom);
                        
                        
                        this._model._currentNavigablePanelSom =  this._lastFocussedPanelForNonActionFields;
                    }
                    if (newSom) {
                        this._triggerOnBridge("elementFocusChanged", this._model.resolveNode(newSom), "focus", this._previousFocusItemSom, newSom);
                        if (this._previousFocusItemSom && !guidelib.runtime.progressive) {
                            var getPreviousItemNavigableSom = this.getSomOnNavigableAncestor(this._previousFocusItemSom),
                                getCurrentItemNavigableSom = this.getSomOnNavigableAncestor(newSom);
                            if (getCurrentItemNavigableSom !== getPreviousItemNavigableSom) {
                                this._triggerOnBridge("elementNavigationChanged", this._model.resolveNode(getCurrentItemNavigableSom),
                                    "navigate", getPreviousItemNavigableSom, getCurrentItemNavigableSom);
                            }
                        }
                    }
                }
            }
        },

        skipFieldFocus : {
            
            get : function () {
                return this._skipFieldFocus;
            },
            
            set : function (newVal) {
                this._skipFieldFocus = newVal;
            }
        }
    });
}($, guidelib, _));

(function ($, guidelib) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype,
        GuideImageView = guidelib.view.GuideImageView = guidelib.view.GuideBaseView.extend({
            initialize : function () {
                GuideImageView._super.initialize.call(this);
                if (this._model.value != null) {
                    var srcString = "data:image/*;base64," + this._model.value;
                    this.$element.children('img').attr('src', srcString);
                }
            },

            postInitialize : function () {
                this._syncGuideNodeToHtml();
            },

            setActive : function (activeItemToken, focus, muteScripts) {
                guidelib.view.GuideFieldView._super.setActive.call(this, activeItemToken, focus, muteScripts);
                if (focus) {
                    if (this.$element) {
                        this.$element.focus();
                    }
                    this._guideView.currentFocusItemSom = this._model.somExpression;
                }
                return true;
            }

        });
}($, guidelib));


(function ($) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    $.widget("xfaWidget.imageCheckButtonWidget", $.xfaWidget.XfaCheckBox, {

        _widgetName : "imageCheckButtonWidget",

        getOptionsMap : function () {
            var parentOptionsMap = $.xfaWidget.XfaCheckBox.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "displayValue" : function (val) {
                    parentOptionsMap.displayValue.apply(this, arguments);
                    var rbParent = this.$userControl.parents('.guideRadioButtonItem, .guideCheckBoxItem');
                    if (rbParent) {
                        rbParent.toggleClass('imageCheckButtonChecked', this.checkedState);
                    }
                    if (this.$userControl.attr('disabled') === 'disabled') {
                        rbParent.addClass('imageCheckButtonDisabled');
                    }
                }
            });
        }
    });
})($);


(function (guidelib, $) {

    var GuideLazyUtil = guidelib.util.GuideLazyUtil = xfalib.ut.Class.extend({
        
        putDirtyToTemplateCacheIfMissing : function (guideDirtyMarkerAndVisitor) {
            var guideDirtyMarker = guideDirtyMarkerAndVisitor || guidelib.internal.GuideDirtyMarkerAndVisitor,
                listOfDirtyChildren = guideDirtyMarker._flattenDirtyPanelToList();
            this._getAllDirtyJsonTemplateInCache(listOfDirtyChildren);
        },
        

        _getAllDirtyJsonTemplateInCache : function (listOfTemplateIds) {
            var modelTemplateCache = window.guideBridge._guide._modelTemplateCacheStore,
                toGetFromServer = this._generateListOfCacheMissFromTemplateJson(listOfTemplateIds),
                toInsertToTemplateCache;
            if (toGetFromServer.length > 0) {
                toInsertToTemplateCache = this._getPiggyBankedJsonModel(toGetFromServer);
            }
            _.each(toInsertToTemplateCache, function (jsonModelString) {
                var template = JSON.parse(jsonModelString);
                modelTemplateCache._putLazyTemplate(template);
            });

        },

        
        _generateListOfCacheMissFromTemplateJson : function (listOfTemplateIds) {
            var templateCache = window.guideBridge._guide._modelTemplateCacheStore,
                cacheMiss = [];
            _.each(listOfTemplateIds, function (templateID) {
                var templateJson = templateCache._getTemplate(templateID, true);
                if (guidelib.util.GuideUtil.isLazyJson(templateJson)) {
                    cacheMiss.push(templateID);
                }
            });
            return cacheMiss;
        },
        
        _getPiggyBankedJsonModel : function (list) {
            var guidePath = window.guideBridge.getGuidePath(),
                externalizedPath = window.guideBridge._getGuidePathUrl(".piggybankjson", guidePath),
                piggyBankedJson;
            if (list.length > 0) {
                $.ajax({
                    url : externalizedPath,
                    type : "GET",
                    data : {
                        "wcmmode" : "disabled",
                        "guidePath" : guidePath,
                        listOfTemplateIds : JSON.stringify(list)
                    },
                    async : false, 
                    success : function (response) {
                        piggyBankedJson = JSON.parse(response.json);
                    },
                    error : function (error) {
                        this._guide().logger().log(error);
                    }
                });
            }

            return piggyBankedJson;
        }

    });
})(guidelib, $);

(function (_, guidelib) {

    
    var GuideProgressiveSection = guidelib.model.GuideProgressiveSection = xfalib.ut.EventClass.extend({
        msClassName : "guideProgressiveSection",

        initialize : function () {
            
            this.jsonModel = this.options.jsonModel;
            this.instanceIndex = this.options.instanceIndex;
            this.instance = this.options.instance;
            
            
            this.parent = this.options.parent;

            
            this._currActivePart = 0;

            this.className = this.jsonModel.guideNodeClass || this.msClassName;
            
            this._parts = [];
            
            this.initializeChildren();

        },

        _getChildModelFromId : function (id) {
            return this.childIdToModel[id];
        },

        initializeChildren : function () {
            var that = this,
                
                fields = this.jsonModel.fields;
            this.children = this.children || [];
            this.childIdToModel = this.childIdToModel || {};

            
            _.each(fields, function (item) {
                var model = guideBridge._resolveId(item.id);
                that.children.push(model);
                that.childIdToModel[item.id] = model;
            });
        },

        setFocus : function () {
            
            this._triggerEvent(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, "navigateWithinSection",
                null, null);
        },

        _triggerEvent : function (event, propName, prevText, newText) {
            guidelib.model.GuideNode.prototype._triggerEvent.apply(this, arguments);
        },

        playJson : function (pJsonModel) {
            
            
            this.jsonModel = _.extend({}, pJsonModel);
        }

    });

    GuideProgressiveSection.defineProps({
        sectionId : {
            get : function () {
                return this.jsonModel.id;
            }
        },

        
        activePart : {
            get : function () {
                return this._parts[this._currActivePart];
            }
        },

        isLastPart : {
            get : function () {
                return (this._currActivePart === (this._parts.length - 1));
            }
        },

        isFirstPart : {
            get : function () {
                return this._currActivePart === 0;
            }
        },

        
        currentActivePart : {
            
            
            set : function (activePartIndex) {
                this._currActivePart = activePartIndex;
            },

            get : function () {
                return this._currActivePart;
            }
        },

        sectionTitle : {
            get : function () {
                return this.jsonModel.title;
            }
        },

        
        sectionName : {
            get : function () {
                return this.jsonModel.name;
            }
        },

        sectionFields : {
            get : function () {
                return this.jsonModel.fields;
            }
        },

        
        fetchedFromService : {

            get : function () {
                return this.jsonModel.fetchedFromService === "true";
            }
        },

        repeatablePanelPath : {
            get : function () {
                return this.jsonModel.repeatablePanelPath;
            }
        },

        repeatablePanelId : {
            get : function () {
                return this.jsonModel.repeatablePanelId;
            }
        }

    });
})(_, guidelib);


(function (_, guidelib) {

    var currActivePart = 0;

    
    var GuideProgressiveRepeatableSectionManager = guidelib.model.GuideProgressiveRepeatableSectionManager = guidelib.model.GuideProgressiveSection.extend({
        msClassName : "guideProgressiveRepeatableSectionManager",

        initialize : function () {
            GuideProgressiveRepeatableSectionManager._super.initialize.apply(this, arguments);
            this.isRepeatable = true;
            this._instances =  this._instances || [];
            
            this._initializeRepeatability();

        },

        _getSectionFromPanelId : function (panel) {
            return _.find(this._instances, function (item) {
                return item.instance.id === panel.id;
            });
        },

        insertInstance : function (index) {
            
            
            var insertedInstance = this.instanceManager.insertInstance(index),
                section;
            
            if (insertedInstance != null) {
                section = this._getSection(insertedInstance);
                if (section != null) {
                    
                    this._instances.splice(index, 0, section);
                    
                    guidelib.runtime.progressive.addRepeatable(section);
                }
            }
        },

        removeInstance : function (panel) {
            var id = panel.id,
                index = panel.instanceIndex;
            
            if (index > -1
                && this.instanceManager.instanceCount > this.instanceManager.minOccur
                && index < this.instanceManager.instanceCount) {
                
                this.instanceManager.removeInstance(index);
                
                this._instances.splice(index, 1);
                
                guidelib.runtime.progressive.deleteRepeatable(id);
            }
        },

        
        _getSection : function (panel) {
            var section = null,
                clonedJson = {},
                id = panel.id,
                templateId = panel.templateId,
                uniquePrefix = null;
            if (id !== templateId) {
                
                
                uniquePrefix = id.substring(0, id.indexOf(templateId) - 2);
                
                this.copyObject(this.jsonModel, clonedJson,
                        {
                            transformMaps : {
                                "id" : function (srcValue, options, parentObj) {
                                    
                                    
                                    if (parentObj.guideNodeClass && parentObj.guideNodeClass.indexOf("Progressive") !== -1) {
                                        return srcValue;
                                    } else {
                                        
                                        return uniquePrefix + "__" + srcValue;
                                    }
                                }
                            }
                        }
                    );
            } else {
                clonedJson = _.extend({}, this.jsonModel);
            }
            if (panel != null) {
                section = new guidelib.model.GuideProgressiveSection({
                    "jsonModel" : clonedJson,
                    "instanceIndex" : panel.instanceIndex,
                    "parent" : this,
                    "instance" : this.instanceManager.instances[panel.instanceIndex]
                });
            }
            return section;
        },

        _initializeRepeatability : function () {
            var model = guideBridge._resolveId(this.repeatablePanelId), 
                oneActive = true,  
                that = this,
                childView;
            
            this.activeInstanceIndex = 0;

            
            
            
            
            if (model == null) {
                
                this.instanceManager = guideBridge._resolveId("im_" + this.repeatablePanelId);
            } else {
                this.instanceManager = model.instanceManager;
            }
            
            if (this.instanceManager != null && this.instanceManager.instances && this.instanceManager.instances.length > 0) {
                
                _.each(this.instanceManager.instances, function (modelInstance) {
                    
                    that._instances.push(that._getSection(modelInstance));
                });
            }
        },

        _getChildModelFromId : function (id) {
            return this.childIdToModel[id];
        },

        initializeChildren : function () {
            var that = this;
            this.children = this.children || [];
            this.childIdToModel = this.childIdToModel || {};
            
            _.each(this.jsonModel.fields, function (item) {
                var model = guideBridge._resolveId(item.id);
                that.children.push(model);
                that.childIdToModel[item.id] = model;
            });
        },

        setFocus : function () {
            
            this._triggerEvent(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, "navigateWithinSection",
                null, null);
        },

        playJson : function (pJsonModel) {
            
            
            this.jsonModel = _.extend({}, pJsonModel);
        }
    });
    GuideProgressiveRepeatableSectionManager.defineProps({
        activeInstance : {
            set : function (panelId) {
                this.activeInstanceIndex = guideBridge._resolveId(panelId).instanceIndex;
            },

            get : function () {
                return this._instances[this.activeInstanceIndex];
            }
        }

    });

})(_, guidelib);


(function ($, guidelib) {
    var ModelTemplateCacheStore = guidelib.model.util.ModelTemplateCacheStore = xfalib.ut.Class.extend({
        initialize : function () {
            ModelTemplateCacheStore._super.initialize.apply(this);
            this._modelIdCache = {};
            this._templateIdCache = {};
            
            
            
            
            this._lazyTemplateIdCache = {};
            var guideJson = JSON.parse(JSON.stringify(this.options.modelTemplateJson));
            this._putTemplate(guideJson);
        },

        
        putModel : function (model) {
            if (model.id) {
                var modelId = model.id;
                this._modelIdCache[modelId] = model;
                if (model.children) {
                    _.each(model.children, function (child) {
                        this.putModel(child);
                    }, this);
                }
            } else {
                this.logger().log("no Id found for model" + model.getAttribute("name"));
            }
        },

        
        removeModel : function (id) {
            if (this._modelIdCache.hasOwnProperty(id)) {
                delete this._modelIdCache[id];
            }
        },

        getModel : function (id) {
            if (this._modelIdCache.hasOwnProperty(id)) {
                return this._modelIdCache[id];
            }
        },

        
        _putTemplate : function (jsonTemplate) {
            if (jsonTemplate.templateId && jsonTemplate.guideNodeClass) {
                this._templateIdCache[jsonTemplate.templateId] = jsonTemplate;
            }
            _.each(jsonTemplate, function (childTemplate, key) {
                if (_.isObject(childTemplate)) {
                    this._putTemplate(childTemplate);
                }
            }, this);
        },

        
        _putLazyTemplate : function (lazyTemplateJson) {
            if (lazyTemplateJson.templateId && lazyTemplateJson.guideNodeClass) {
                this._lazyTemplateIdCache[lazyTemplateJson.templateId] = lazyTemplateJson;
            }
        },

        cloneJsonTemplate : function (templateId) {
            if (this._templateIdCache[templateId]) {
                var template = this._templateIdCache[templateId];
                return JSON.parse(JSON.stringify(template)); 
            }
        },
        
        _getTemplate : function (templateId, lookupLazyStore) {
            var template = this._templateIdCache[templateId];
            
            
            
            if (lookupLazyStore && guidelib.util.GuideUtil.isLazyJson(template)) {
                template = this._lazyTemplateIdCache[templateId];
            }

            if (!_.isUndefined(template)) {
                return JSON.parse(JSON.stringify(template));

            }
        }
    });

    ModelTemplateCacheStore.defineProps({
    });
}($, guidelib));

(function (_, $) {
    "use strict";

    
    var isBrowserIE = xfalib.ut.XfaUtil.prototype.detectIE();

    var _defaults = {
        'showLink' : false,
        'scrollMode' : 'vertical',
        textAreaClass : ".guide-tnc-content",
        checkBoxClass : ".guide-tnc-checkbox",
        checkBoxDisableClass : ".guide-tnc-checkbox-disabled",
        checkBoxReviewedClass : ".guide-tnc-checkbox-reviewed",
        linkClass     : ".guide-tnc-link",
        documentVisitedClass : ".guide-tnc-document-visited",
        documentUnVisitedClass : ".guide-tnc-document-unvisited"
    };

    var _reviewStatusMap = {
        REVIEWED : "reviewed",
        UNREVIEWD : "unreviewed",
        AGREE : "agree"
    };

    var AfTnc = function (element, options) {
        this.options = options;
        this.$element = $(element);

        
        this.enters = this.leaves = 0;
        this.inside = false;

        
        this.reviewdoc = this.status = _reviewStatusMap.UNREVIEWD;

        
        this.$elementCheckBox = this.$element.find(this.options.checkBoxClass || _defaults.checkBoxClass);
        
        this.$elementTextArea = $(this.textArea());
        
        this.$elementLink =  $(this.link());

        this.isTextContentVisible = false;

        if (this.options.showLink) {
            
            this.$elementLink.find('a').click($.proxy(this.handleReviewStatusChange, this));
        } else {
            if (this.hasScrollBar(this.$elementTextArea.get(0))) {
                
                
                this.$elementTextArea.parent().scroll($.proxy(this.handleReviewStatusChange, this));
            } else {
                
                if (this.$elementTextArea.css('display') !== 'none') {
                    this.status = _reviewStatusMap.REVIEWED;
                    this.isTextContentVisible = true;
                    
                    if (!this.options.showAsPopUp) {
                        this.enableCheckBox();
                    }
                    this.reviewDoc = this.$elementTextArea.text();
                }
            }
        }

        
        if (this.options.showAsPopUp) {
            var unvisitedClass = this.options.documentUnVisitedClass || _defaults.documentUnVisitedClass,
                visitedClass = this.options.documentVisitedClass || _defaults.documentVisitedClass;
            var _self = this,
                dialogId = this.$elementCheckBox.find('a')
                .keydown(function (e) {
                    if (e.keyCode === 13 || e.which == 13 || e.charCode === 32) {
                        $(this).click();
                        return false;
                    }
                })
                .click(function (event) {
                    if ($(this).hasClass(unvisitedClass.substring(1))) {
                        $(this).toggleClass(visitedClass.substring(1) + " " + unvisitedClass.substring(1));
                    }
                    
                    
                    if (isBrowserIE || _self.isTextContentVisible) {
                        _self.enableCheckBox();
                    }
                }).attr("href");
            
            $(dialogId).on('hidden.bs.modal', function (e) {
                _self.$elementCheckBox.find('input').focus();
            });
        } else {
            
            this._updateScreenReaderText();
        }

        
        this.$elementCheckBox.find('input').change($.proxy(this.handleCheckBoxChange, this));
    };

    AfTnc.prototype = {

        clear : function () {
            this.$element.val('');
        },

        destroy : function () {
            this.$element.val('');
            this.$element.empty();
        },

        _updateScreenReaderText : function () {
            if (!this.options.showAsPopUp) {
                var _self = this;
                
                this.$element.find(".guide-tnc-sr-only").each(function (i, obj) {
                    $(this).html(_self.options.screenReaderText);
                });
            }
        },

        _restoreClickState : function (value) {
            if (this.options.showLink) {
                var arr = value.split("\n"),
                    linkState = [];
                
                _.each(arr, function (linkText, index) {
                    
                    linkState.push(_.last(linkText.split('=')));
                });
                var unvisitedClass = this.options.documentUnVisitedClass || _defaults.documentUnVisitedClass,
                    visitedClass = this.options.documentVisitedClass || _defaults.documentVisitedClass;
                this.$elementLink.find('a').each(function (index) {
                    $(this).data("clicked", linkState[index]);
                    if (linkState[index] === "1") {
                        $(this).addClass(visitedClass.substring(1));
                    } else {
                        $(this).addClass(unvisitedClass.substring(1));
                    }
                });
            }
        },

        value : function (value) {
            if (value) {
                
                if (this.options.showLink) {
                    this._restoreClickState(value);
                }
                this.reviewDoc = value;
            } else {
                return this.reviewDoc;
            }

        },

        reviewStatus : function (value) {
            var val = this.getClickState();
            if (!_.isUndefined(value)) {
                if (value == "true") {
                    this.enableCheckBox();
                    this.$elementCheckBox.find('input').attr("checked", "checked");
                }
                
                
                this.approvalStatus = value;
            } else {
                if (this.status == _reviewStatusMap.REVIEWED || this.status == _reviewStatusMap.UNREVIEWD) {
                    return null;
                } else if (this.status == _reviewStatusMap.AGREE) {
                    return true;
                }
            }
        },

        clickStatus : function (value) {
            if (value) {
                if (value === _reviewStatusMap.REVIEWED) {
                    var arr = this.getClickState();
                    if (_.isArray(arr) && arr.length > 0) {
                        arr = arr.join("\n");
                        this._restoreClickState(arr);
                    }
                    this.enableCheckBox();
                }
                this.status = value;
            } else {
                return this.status;
            }
        },

        showLink : function (value) {
            if (value !== undefined) {
                this.options.showLink = value;
            } else {
                return this.options.showLink;
            }
        },

        access : function (value) {
            this.accessOption = value;
            if (value == "readOnly") {
                this.disableCheckBox();
                if (this.options.showLink) {
                    this.$elementLink.find('a').each(function (index, elem) {
                        $(elem).css('pointer-events', 'none');
                        
                        $(elem).attr('disabled', 'disabled');
                    });
                }
            } else if (value == "open") {
                
                
                if ((this.status == _reviewStatusMap.REVIEWED || this.status == _reviewStatusMap.AGREE) && !this.options.showAsPopUp) {
                    this.enableCheckBox();
                }
                if (this.options.showLink) {
                    this.$element.find('a').each(function (index, elem) {
                        $(elem).css('pointer-events', '');
                        $(elem).removeAttr('disabled');
                    });
                }
            }
        },

        link : function () {
            return this.$element.find(this.options.linkClass || _defaults.linkClass);
        },

        textArea : function () {
            return this.$element.find(this.options.textAreaClass || _defaults.textAreaClass);
        },

        getClickState : function () {
            if (this.options.showLink) {
                var arr = [];
                this.$elementLink.find('a').each(function (index) {
                    arr.push({
                        'displayText' : $(this).text(),
                        'linkText' : $(this).attr('href'),
                        'clicked' : $(this).data("clicked")
                    });
                });
                return arr;
            }
        },

        enableCheckBox : function () {
            if (this.accessOption !== "readOnly") {
                this.$elementCheckBox.find('input').removeAttr("disabled");
                this.$elementCheckBox.removeClass(this.options.checkBoxDisableClass.substring(1));
            }
        },

        disableCheckBox : function () {
            this.$elementCheckBox.find('input').attr('disabled', 'disabled');
            this.$elementCheckBox.addClass(this.options.checkBoxDisableClass.substring(1));
        },

        handleReviewStatusChange : function (event) {
            var arr = [],
                visitedClass = this.options.documentVisitedClass || _defaults.documentVisitedClass;
            if (this.options.showLink) {
                this.status = _reviewStatusMap.REVIEWED;
                
                $(event.target).data("clicked", 1);
                $(event.target).addClass(visitedClass.substring(1));
                this.linkStateMap = this.getClickState();
                _.each(this.linkStateMap, function (element, index) {
                    if (!element.clicked) {
                        this.status = _reviewStatusMap.UNREVIEWD;
                    }
                    
                    arr.push(element.displayText + "=" + element.linkText + "=" + (_.isUndefined(element.clicked) ? "0" : "1"));
                }, this);
                if (arr.length > 0) {
                    this.reviewDoc = arr.join("\n");
                }

                if (this.status == _reviewStatusMap.REVIEWED) {
                    this.enableCheckBox();
                }

                
                this.$element.trigger('reviewComplete.tnc');

            } else {
                
                var position = this.getScroll(this.$elementTextArea.get(0)),
                    xy = position[this.options.scrollMode == 'vertical' ? 'y' : 'x'],
                    min = this.getScrollSize(this.$elementTextArea.get(0)).y - this.getSize(this.$elementTextArea.get(0)).y, 
                    max = 0;

                
                this.reviewDoc = this.$elementTextArea.text();

                
                if (xy >= min && (max == 0 || xy <= max)) {
                    
                    if (!this.inside) {
                        
                        this.inside = true;
                        this.enters++;
                        
                        this.status = _reviewStatusMap.REVIEWED;
                        this.enableCheckBox();
                        
                        this.$element.trigger('reviewComplete.tnc', [position,this.enters,event]);

                    }
                }
                
                else if (this.inside) {
                    this.inside = false;
                    this.leaves++;

                }
            }

        },

        handleCheckBoxChange : function (event) {
            if ($(event.target).is(':checked')) {
                this.status = _reviewStatusMap.AGREE;
                this.$elementCheckBox.addClass(this.options.checkBoxReviewedClass.substring(1));
            } else {
                this.status = _reviewStatusMap.UNREVIEWD;
                this.$elementCheckBox.removeClass(this.options.checkBoxReviewedClass.substring(1));
            }
            this.$element.trigger('checkboxStateChange.tnc');
        },

        getScrollSize : function (elem) {
            return {x : elem.scrollWidth, y : elem.scrollHeight};
        },

        getScroll : function (elem) {
            return {x : elem.scrollLeft, y : elem.scrollTop};
        },

        getSize : function (elem) {
            return {x : elem.offsetWidth, y : elem.offsetHeight};
        },

        _getScrollParams : function ($a, self) {
            var elem = $a[0],
                
                
                height = this.options.showAsPopUp ? "0px" : self.parent().css("height");

            
            $(elem).css({
                'top' : '-2000px',
                'left' : '-2000px',
                'max-height' : self.css("max-height"),
                'height' : (height !== "0px") ? height : "auto",
                'overflow' : 'auto',
                'position' : 'absolute'
            }).appendTo('body');

            return {
                'scrollHeight' : elem.scrollHeight,
                
                'clientHeight' : $(elem).outerHeight(),
                'scrollWidth'  : elem.scrollWidth,
                
                'clientWidth'  : $(elem).outerWidth()
            };
        },

        hasScrollBar : function (div) {
            
            
            var clone = $(div).clone(),
                res = this._getScrollParams(clone, $(div));
            clone.remove();
            
            if (isBrowserIE) {
                
                return ((res.scrollHeight - 2) > res.clientHeight) || ((res.scrollWidth - 2) > res.clientWidth);
            } else {
                return res.scrollHeight > res.clientHeight || res.scrollWidth > res.clientWidth;
            }
        }
    };

    $.fn.afTnc = function (option, value) {
        var get = '',
            element = this.each(function () {

                var $this = $(this),
                    data = $this.data('AfTnc'),
                    options = $.extend({}, _defaults, typeof option === 'object' && option);

                
                if (!data) {
                    $this.data('AfTnc', (data = new AfTnc(this, options)));
                }

                
                if (typeof option === 'string') {
                    get = data[option](value);
                }
            });

        if (typeof get !== undefined) {
            return get;
        } else {
            return element;
        }
    };

})(_, $);

(function ($) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    $.widget("xfaWidget.tnc", $.xfaWidget.abstractWidget, {

        _widgetName : "tnc",
        _superPrototype : $.xfaWidget.abstractWidget.prototype,
        getOptionsMap : function () {
            var parentOptionsMap = this._superPrototype.getOptionsMap.apply(this, arguments),
                newMap = $.extend({}, parentOptionsMap, $.extend({}, this.options, {
                    "value" : function (value) {
                        this.$userControl.afTnc("value", value);
                    },
                    "reviewStatus" : function (value) {
                        this.$userControl.afTnc("reviewStatus", value);
                    },

                    "clickStatus" : function (value) {
                        this.$userControl.afTnc("clickStatus", value);
                    },
                    
                    "access" : function (value) {
                        this.$userControl.afTnc("access", value);
                    }
                }));
            return newMap;
        },

        _getReviewStatus : function () {
            return $(this.element).afTnc("reviewStatus");
        },

        _getClickStatus : function () {
            return $(this.element).afTnc("clickStatus");
        },

        getEventMap : function () {
            var parentEventMap = this._superPrototype.getEventMap.apply(this, arguments),
                newMap = $.extend({}, parentEventMap,
                    {
                        "change" : null,
                        "reviewComplete.tnc" : xfaUtil.XFA_CHANGE_EVENT,
                        "checkboxStateChange.tnc" : xfaUtil.XFA_CHANGE_EVENT
                    });
            return newMap;
        },
        render : function () {
            this._superPrototype.render.apply(this, arguments);
            $(this.element).afTnc(this.getOptionsMap());
            return $(this.element);
        },
        showDisplayValue : function () {
            
        },
        showValue : function () {
            
        },
        getCommitValue : function () {
            this.options.reviewStatus = this._getReviewStatus();
            this.options.clickStatus = this._getClickStatus();
            return $(this.element).afTnc("value");
        }
    });
})($);


(function ($, _, guidelib) {

    
    var getPanelsWithNumericFields = function (panels, fieldName) {
            if (_.isUndefined(panels) || panels === null) {
                return [];
            }
            if (!_.isArray(panels)) {
                panels = [panels];
            }
            return _.filter(panels, function (panel) {
                return panel instanceof guidelib.model.GuidePanel
                    && panel[fieldName] instanceof guidelib.model.GuideNumericBox;
            });
        },
        
        sum = function (numPanels, fieldName) {
            return _.reduce(numPanels,
                function (memo, currentItem) {
                    var curValue = parseFloat(currentItem.getOrElse(currentItem, fieldName + ".value", 0));
                    if (isNaN(curValue)) {
                        curValue = 0;
                    }
                    return memo + curValue;
                }, 0);
        };

    
    guidelib.runtime.af.sum = function (panels, fieldName) {
        return sum(getPanelsWithNumericFields(panels, fieldName), fieldName);
    };

    
    guidelib.runtime.af.avg = function (panels, fieldName) {
        var n_panels = getPanelsWithNumericFields(panels, fieldName),
            total = sum(n_panels, fieldName);
        if (n_panels.length === 0) {
            return 0;
        }
        return total / n_panels.length;
    };

    
    guidelib.runtime.af.max = function (panels, fieldName) {
        var panel = _.max(getPanelsWithNumericFields(panels, fieldName), function (panel) {
            return panel.getOrElse(panel, fieldName + ".value", Number.NEGATIVE_INFINITY);
        });
        if (panel instanceof guidelib.model.GuidePanel) {
            return panel[fieldName];
        }
        return null;
    };

    
    guidelib.runtime.af.min = function (panels, fieldName) {
        var panel =  _.min(getPanelsWithNumericFields(panels, fieldName), function (panel) {
            return panel.getOrElse(panel, fieldName + ".value", Number.POSITIVE_INFINITY);
        });
        if (panel instanceof guidelib.model.GuidePanel) {
            return panel[fieldName];
        }
        return null;
    };

}($, _, guidelib));

(function (_, guidelib) {

    
    var GuideModelEvent = guidelib.event.GuideModelEvent = xfalib.ut.Class.extend({
        msClassName : "guideModelEvent"
    });

    GuideModelEvent.defineProps({
        
        "prevText" : {
            get : function () {
                return this.jsonModel.prevText;
            }
        },
        
        "newText" : {
            get : function () {
                return this.jsonModel.newText;
            }
        },
        
        "name" : {
            get : function () {
                return this.jsonModel.name;
            }
        },
        "keyDown" : {
            get : function () {
                return this.jsonModel.keyDown;
            }
        },
        "modifier" : {
            get : function () {
                return this.jsonModel.modifier;
            }
        },
        
        "target" : {
            get : function () {
                return this.jsonModel.target;
            }
        },
        "shift" : {
            get : function () {
                return this.jsonModel.shift;
            }
        },
        "change" : {
            get : function () {
                return this.jsonModel.change;
            },
            set : function (value) {
                this.jsonModel.change = value;
            }
        },
        
        "_property" : {
            get : function () {
                return this.jsonModel._property;
            }
        }
    });

    GuideModelEvent.createEvent = function (nm, tgt, prop, oldVal, newVal) {
        var evnt = {
            name : nm,
            target : tgt,
            _property : prop,
            prevText : oldVal,
            newText : newVal
        };
        return new GuideModelEvent({"jsonModel" : evnt});
    };

    GuideModelEvent.MODEL_REFRESH = "guide.modelRefresh";
    GuideModelEvent.CHILD_CHANGED = "guide.childChanged";
    GuideModelEvent.MODEL_CHANGED = "guide.modelChanged";
    GuideModelEvent.VALUE_CHANGED = "guide.valueChanged";
    GuideModelEvent.ERROR_CHANGED = "guide.errorChanged";
    GuideModelEvent.ERROR_RESET = "guide.errorReset";
    GuideModelEvent.VISIBLE_CHANGED = "guide.visibleChanged";
    GuideModelEvent.ENABLED_CHANGED = "guide.enabledChanged";
    GuideModelEvent.ITEMS_CHANGED   = "guide.itemsChanged";
    GuideModelEvent.OBJECT_DESTROYED = "guide.objectDestroyed";
    GuideModelEvent.NAVIGATE_SECTION = "guide.navigateSection";
    GuideModelEvent.LAZY_LOADED = "guide.lazyLoaded";
}(_, guidelib));

(function (_, guidelib) {
    
    var AddMinMaxValidation = guidelib.model.mixin.AddMinMaxValidation = {
        normalProperties : {

            _runMaximumValueTest : function () {
                if (this.exclusiveMaximum) {
                    return this.value < this.maximum;
                } else {
                    return this.value <= this.maximum;
                }
            },

            _runMinimumValueTest : function () {
                if (this.exclusiveMinimum) {
                    return this.value > this.minimum;
                } else {
                    return this.value >= this.minimum;
                }
            },

            
            _minMaxValidation : function (value, obj) {
                if (value && obj.validFlag) {

                    if (this.maximum) {
                        obj.validFlag = this._runMaximumValueTest();
                        if (!obj.validFlag) {
                            this._errorText = this.exclusiveMaximum ? this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.exclusiveMaxValErrorMessage, [this.maximum]) :
                                this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.maxValErrorMessage, [this.maximum]);
                            this._failedTest = this.guideUtil.MAXIMUM_VALUE_TEST;
                        }
                    }

                    if (obj.validFlag && this.minimum !== null) {
                        obj.validFlag = this._runMinimumValueTest();
                        if (!obj.validFlag) {
                            this._errorText = this.exclusiveMinimum ? this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.exclusiveMinValErrorMessage, [this.minimum]) :
                                this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.minValErrorMessage, [this.minimum]);
                            this._failedTest = this.guideUtil.MINIMUM_VALUE_TEST;
                        }
                    }
                }
            }

        },
        propertyDescriptors : {
            
            maximum : {
                get : function () {
                    return this.getAttribute("maximum");
                }
            },

            
            minimum : {
                get : function () {
                    return this.getAttribute("minimum");
                }
            },

            
            exclusiveMaximum : {
                get : function () {
                    return this.getAttribute("exclusiveMaximum");
                }
            },

            
            exclusiveMinimum : {
                get : function () {
                    return this.getAttribute("exclusiveMinimum");
                }
            }

        }
    };

}(_, guidelib));

(function ($, guidelib) {
    var DomTemplateCacheStore = guidelib.view.util.DomTemplateCacheStore = xfalib.ut.Class.extend({
        cloneDomElement : function (htmlId) {
            return this.$htmlTemplateDom.find(htmlId).clone();
        },

        putDomElement : function (parentIdSelector, $child) {
            
            this.$htmlTemplateDom.find(parentIdSelector).eq(0).append($child);
        },

        removeDomElement : function (parentIdSelector) {
            
            this.$htmlTemplateDom.find(parentIdSelector).children().remove();
        }
    });

    DomTemplateCacheStore.defineProps({
        $htmlTemplateDom : {
            get : function () {
                return this.options.$htmlTemplateDom;
            }
        }
    });
}($, guidelib));

(function (_, guidelib) {

    
    var GuideProgressiveCompletionSection = guidelib.model.GuideProgressiveCompletionSection = guidelib.model.GuideProgressiveSection.extend({
        msClassName : "guideProgressiveCompletionSection"

    });

    GuideProgressiveCompletionSection.defineProps({
        sectionId : {
            get : function () {
                return this.jsonModel.id;
            }
        },

        sectionTitle : {
            get : function () {
                return this.jsonModel.completionTitle;
            }
        },

        completionScript : {
            get : function () {
                return this.jsonModel.completionScript;
            }
        },

        completionBeforeMessage : {
            get : function () {
                return this.jsonModel.completionBeforeMessage;
            }
        },

        completionAfterMessage : {
            get : function () {
                return this.jsonModel.completionAfterMessage;
            }
        },

        completionSuccessScript : {
            get : function () {
                return this.jsonModel.completionSuccessScript;
            }
        },

        completionFailureScript : {
            get : function () {
                return this.jsonModel.completionFailureScript;
            }
        }

    });
})(_, guidelib);


(function (_, guidelib) {
    guidelib.model.mixin.ValidationsDisabled = {
        normalProperties : {
            setParentValidationsDisabled : function (bParentValidationsDisabled) {
                var oldValidationsDisabled = this.validationsDisabled,
                    newValidationsDisabled;
                this._bParentValidationsDisabled = bParentValidationsDisabled;
                newValidationsDisabled = this.validationsDisabled;
                this.handleChildValidationsDisabled(newValidationsDisabled, oldValidationsDisabled);
            },

            handleChildValidationsDisabled : function (newValidationsDisabled, oldValidationsDisabled) {
                if (newValidationsDisabled !== oldValidationsDisabled) {
                    if (this instanceof guidelib.model.Field) {
                        if (newValidationsDisabled === true) {
                            if (this.validationState === false) {
                                this._errorText = "";
                                this.validationState = true;
                                this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_CHANGED,
                                    "validationStatus", this.validationState, this._errorText);
                            }
                        }
                    }
                    _.each(this._children, function (child) {
                        if (child instanceof guidelib.model.Field || child instanceof guidelib.model.GuideItemsContainer) {
                            child.setParentValidationsDisabled(newValidationsDisabled);
                        }
                    });
                }
            }
        },
        propertyDescriptors : {
            validationsDisabled : {
                get : function () {
                    return this._bParentValidationsDisabled || this._validationsDisabled;
                },
                set : function (bValidationsDisabled) {
                    var oldValidationsDisabled = this.validationsDisabled,
                        newValidationsDisabled;
                    this._validationsDisabled = bValidationsDisabled;
                    newValidationsDisabled = this.validationsDisabled;
                    this.handleChildValidationsDisabled(newValidationsDisabled, oldValidationsDisabled);
                }
            }
        }
    };

}(_, guidelib));

(function (_, guidelib) {
    
    var GuideNavigationContext = guidelib.model.util.GuideNavigationContext = xfalib.ut.Class.extend({
        msClassName : "guideNavigationContext",
        initialize : function () {
            GuideNavigationContext._super.initialize.call(this);
            this._currentItem = this.options.currentItem;
            this._parentPanel = this.options.parentPanel;
            this.guideUtil = guidelib.util.GuideUtil;
        },

        getQualifiedNamedItem : function (qName) {
            var navItems = this._getNavigableItems();
            var qItem = _.find(navItems, function (item) {
                return (item._escapeQualifiedName() == qName);
            }, this);
            return qItem;
        },

        getItemForNav : function (navToken) {
            if (navToken == "prevItem" || navToken == "nextItem" || navToken == "firstItem" || navToken == "lastItem") {
                return this[navToken];
            } else {
                return this.getQualifiedNamedItem(navToken);
            }
        },

        
        _isNavigableItem : function (item) {
            return item.visible;
        },

        
        _isNavigablePanel : function (item) {
            if (item && item instanceof guidelib.model.GuidePanel) {
                return item.visible && item.isNavigable;
            }
        },

        _getNavigableItems : function () {
            var navItems = _.filter(this._parentPanel.items, function (item) {
                return this._isNavigableItem(item);
            }, this);
            return navItems;
        },
        
        _getNavigableDescendant : function (navigableAncestor) {
            
            
            if (navigableAncestor && navigableAncestor != this._parentPanel) {
                var currentItem = navigableAncestor.parent._navigationContext.currentItem,
                    deepItem = null;
                while (currentItem instanceof guidelib.model.GuidePanel) {
                    deepItem = currentItem;
                    currentItem = currentItem._navigationContext.currentItem;
                }
                return deepItem;
            }
            return null;
        },

        
        _getSomOnNavigableAncestor : function (somExpression) {
            if (_.isEmpty(somExpression)) {
                return null;
            }

            var index = somExpression.lastIndexOf("."),
                parentModel,
                parentSom,
                isNavigable,
                guideModel = this._parentPanel._guide();

            if (index !== -1) {
                parentSom = somExpression.substring(0, index);
                parentModel = guideModel.resolveNode(parentSom);
                if (parentModel) {
                    isNavigable = this._isNavigablePanel(parentModel);
                }
                if (isNavigable) {  
                    return somExpression;
                }
                return this._getSomOnNavigableAncestor(parentSom);
            }
            
            return guideModel.rootPanel.somExpression;
        },

        
        _getNavigableAncestor : function (navOrder) {
            
            
            
            var guideModel = this._parentPanel._guide(),
                navigableAncestorSom = this._getSomOnNavigableAncestor(guideModel._currentNavigablePanelSom),
                navigableAncestorItem = guideModel.resolveNode(navigableAncestorSom);
            
            while (navigableAncestorItem
                && navigableAncestorItem != this._parentPanel && !navigableAncestorItem.parent._navigationContext[navOrder]
                && this.guideUtil.isChildPartOfContainer(this._parentPanel, navigableAncestorItem)) {
                
                var navigableParentItemSom = this._getSomOnNavigableAncestor(navigableAncestorItem.parent.somExpression);
                navigableAncestorItem = guideModel.resolveNode(navigableParentItemSom);
            }
            return navigableAncestorItem;
        },

        _getNakedThis : function () {
            return this;
        }
    });

    GuideNavigationContext.defineProps({
        
        currentItem : {
            get : function () {
                if (this._currentItem) {
                    return this._currentItem;
                } else {
                    return this.firstItem;
                }
            },
            set : function (value) {
                this._currentItem = value;
            }
        },
        
        prevItem : {
            get : function () {
                var navItems = this._getNavigableItems();
                var item = this.currentItem;
                if (navItems.indexOf(item) > 0) {
                    return navItems[navItems.indexOf(item) - 1];
                } else {
                    return null;
                }
            }
        },
        
        nextItem : {
            get : function () {
                var navItems = this._getNavigableItems();
                var item = this.currentItem;
                if (navItems.indexOf(item) < (navItems.length - 1)) {
                    return navItems[navItems.indexOf(item) + 1];
                } else {
                    return null;
                }
            }
        },
        
        nextNavigablePanel : {
            get : function () {
                var navigableAncestor = this._getNavigableAncestor("nextItem"),
                
                    navigableDescendant = this._getNavigableDescendant(navigableAncestor);
                return navigableDescendant;
            }
        },

        
        prevNavigablePanel : {
            get : function () {
                var navigableAncestor = this._getNavigableAncestor("prevItem"),
                
                    navigableDescendant = this._getNavigableDescendant(navigableAncestor);
                return navigableDescendant;
            }
        },

        
        firstItem : {
            get : function () {
                var navItems = this._getNavigableItems();
                return navItems[0] || null;
            }
        },
        
        lastItem : {
            get : function () {
                var navItems = this._getNavigableItems();
                if (navItems.length) {
                    return navItems[navItems.length - 1];
                } else {
                    return null;
                }
            }
        },
        
        hasNextItem : {
            get : function () {
                return this.nextItem != null;
            }
        },
        
        hasPrevItem : {
            get : function () {
                return this.prevItem != null;
            }
        },

        
        hasNextNavigablePanel : {
            get : function () {
                return this.nextNavigablePanel != null;
            }
        },

        
        hasPrevNavigablePanel : {
            get : function () {
                return this.prevNavigablePanel != null;
            }
        },

        
        isFirstItem : {
            get : function () {
                return this.currentItem == this.firstItem;
            }
        },
        
        isLastItem : {
            get : function () {
                return this.currentItem == this.lastItem;
            }
        }
    });

})(_, guidelib);

(function (_, $) {

    var Responsive = {
        breakpoints : [],
        controlRowDefaults : {}
    },
    isPad = navigator.userAgent.match(/iPad/i) !== null,
    isIphone = (navigator.userAgent.match(/iPhone/i) !== null) || (navigator.userAgent.match(/iPod/i) !== null),
    isIphoneOrIpad = isPad || isIphone;
    
    Responsive.breakpoints = [
        {
            name : 'desktop',
            width : Infinity
        },
        {
            name : 'tablet-landscape',
            width : 1024
        },
        {
            name : 'tablet-potrait',
            width : 768
        },
        {
            name : 'mobile-landscape',
            width : 480
        },
        {
            name : 'mobile-potrait',
            width : 320
        }
    ];

    
    Responsive.controlRowDefaults = {
        
        breakpoints : Responsive.breakpoints,

        
        controlRowDetails : {
            renderer : function (tablePlugin, row) {
                var cells = null;
                if (tablePlugin.options.bControlRowHiddenCells) {
                    cells = row.$tableRowElement.find("td:hidden");
                } else {
                    cells = row.$tableRowElement.find("td");
                    
                    if (tablePlugin.options.bDisableControlRowCells) {
                        
                        row.$tableRowElement.find("input, select, textarea, button").attr("disabled", "disabled");
                    }
                }
                var data = cells.map(function (index, cell) {
                    var $cell = $(cell),
                        header = tablePlugin.header($cell),
                        $clickedTableRow = row.$tableRowElement,
                        cellIdx = null,
                        cellData = null;
                    cellIdx = {
                        
                        row : $clickedTableRow.index(),
                        column : $cell.index()
                    };

                    cellData = tablePlugin._getCellData(cellIdx);
                    return $("<li/>").attr("data-rtp-index", cellIdx.column).addClass("clearfix").append(
                        $("<div/>").addClass("rtp-title").text($.trim(header.text()))
                    ).append(
                        $("<div/>").addClass("rtp-data").append(cellData)
                    );
                });

                return $('<ul data-rtp-index="' + row.index + '"/>').append(data.get());
            },

            target : 0,

            type : 'inline'
        }
    };
    
    var ResponsiveTablePlugin = function (element, options) {
        this.options = options;
        this.$element = $(element);
        this.columns = [];
    };

    
    var TableColumn = function ($tableElement, colIdx, bIsResize) {
        var $colHeaderElement = $tableElement.find("th").eq(colIdx);
        
        this.minWidth =  (bIsResize ? (parseInt($colHeaderElement.css("min-width"), 10)) : $colHeaderElement.outerWidth());
        this.header = $colHeaderElement;
        this.colIndex = colIdx;
        this.$tableElement = $tableElement;
    };

    
    TableColumn.prototype = {
        
        cells : function () {
            
            var headerValue = this.header.attr("id");
            return this.$tableElement.find("tr td").filter(function () {
                var id = $(this).attr("headers");
                if (id) {
                    if (id.indexOf(headerValue) > -1) {
                        return $(this);
                    }
                }
            });
        },
        
        visible : function (bFlag) {
            var cells = this.cells();
            this.isVisible = bFlag;
            if (bFlag ===  true) {
                cells.show();
                this.header.show();
            } else {
                this.header.hide();
                
                var headers = this.header.prevAll().filter(":visible"),
                    headerLen = headers.length;
                
                $.each(cells, function () {
                    if (!$(this).data("shown")) {
                        $(this).hide();
                    }
                    var colSpan = $(this).data("colspan") || $(this).attr("colspan");
                    
                    if (colSpan > 1) {
                        var totalColSpan = 0;
                        $(this).prevAll().each(function () {
                            totalColSpan += (+($(this).data("colspan") || $(this).attr("colspan")));
                        });
                        
                        if (totalColSpan == 0) {
                            $(this).show();
                            $(this).data("shown", true);
                            
                            if ($(this).data("colspan") == null) {
                                $(this).data("colspan", $(this).attr("colspan"));
                            }
                            $(this).attr("colspan", headerLen);
                        }
                        
                        else if (totalColSpan < headerLen) {
                            $(this).show();
                            $(this).data("shown", true);
                            if ($(this).data("colspan") == null) {
                                $(this).data("colspan", $(this).attr("colspan"));
                            }
                            $(this).attr("colspan", (headerLen - totalColSpan));
                        }
                    }
                });
            }
        }
    };

    
    var TableRow = function ($tableRowElement) {
        this.$tableRowElement = $tableRowElement;
        this.index = $tableRowElement.index();
        
        this.child = {
            $element : null,
            isShown : false
        };
        $tableRowElement.data("tableRow", this);
    };

    TableRow.prototype = {

        updateChild : function (info, colSpan) {
            
            if (this.child.$element && this.child.$element.length > 0) {
                this.child.$element.empty();
                this.child.$element.append($("<td/>").addClass(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_CLASS).attr("colspan", colSpan).append($(info)));
            } else if (this.$tableRowElement.next(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_SELECTOR).length > 0) {
                this.child.$element = this.$tableRowElement.next();
                this.child.$element.append($("<td/>").addClass(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_CLASS).attr("colspan", colSpan).append($(info)));
            } else {
                
                this.child.$element = $("<tr/>").addClass(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_CLASS).append($("<td/>").addClass(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_CLASS).attr("colspan", colSpan).append($(info)));
                
                this.$tableRowElement.after(this.child.$element);
            }

        },

        showChild : function () {
            
            this.child.$element.get(0).style.display = "";
            this.child.isShown = true;
        },

        hideChild : function () {
            this.child.$element.hide();
            this.child.isShown = false;
        }
    };

    ResponsiveTablePlugin.prototype = {
        
        _getCellData : function (index) {
            
            var tableRow = this.$element.find("tbody tr").eq(index.row),
                tableCell =   tableRow.find("td").eq(index.column);
            
            if (this.options.viewCallback) {
                
                var id = tableCell.find(ResponsiveTablePlugin.prototype.defaults.GUIDE_ID_SELECTOR).attr("id");
                
                return this.options.viewCallback(id);
            } else {
                return tableCell.html();
            }
        },

        
        header : function (cell) {
            
            
            var id = cell.attr("headers").split(" ")[0];
            
            return this.$element.find("#" + id);
        },

        initializeColumns : function (bIsResize) {
            var columns = [];
            
            
            
            this.colLength = this.$element.find("th").length;
            for (var colIdx = 0; colIdx < this.colLength; colIdx++) {
                
                
                columns.push(new TableColumn(this.$element, colIdx, bIsResize));
            }
            return columns;
        },

        
        _initializeColumnWidth : function () {
            
            
            
            var display = this._getColumnsVisibility(),
                
                visibleColumns = _.filter(display, function (item) {
                    return item == true;
                }).length,
                $allTableHeaders = this.$element.find("th"),
                $tableHeader = null,
                width = null,
                sum = 0;
            if (!this.options.bAutoWidth) {
                
                
                for (var i = 0; i < visibleColumns; i++) {
                    sum += parseInt(this.options.aWidth[i], 10);
                }
            } else {
                sum = visibleColumns;
            }

            if (display.length == this.colLength) {
                for (var i = 0; i < visibleColumns; i++) {
                    if (this.options.aWidth) {
                        
                        width = ((Math.floor((this.options.aWidth[i] * 100) / sum)) + "%");
                    } else {
                        width = ((Math.floor((1 * 100) / sum)) + "%");
                    }
                    $tableHeader = $allTableHeaders.eq(i);
                    
                    
                    $tableHeader[0].style.width = width;
                }
            }
        },

        _constructor : function () {
            var that = this;
            
            this.controlRow = $.extend(true, {}, Responsive.controlRowDefaults);
            this.columns = this.initializeColumns();
            
            $(window).on("resize orientationchange", function (event) {
                that._initializeColumnVisibility(event);
            });

            
            
            this.controlRow.breakpoints.sort(function (a, b) {
                return a.width < b.width ? 1 :
                    a.width > b.width ? -1 : 0;
            });
            this._initializeColumnVisibility();
            
            this._controlRowInitialization();
        },

        _initializeColumnVisibility : function (event) {
            var that = this;
            
            if (event) {
                
                
                this.$element.find("td").each(function () {
                    $(this).removeData("shown");
                    
                    if ($(this).data("colspan") != null) {
                        
                        $(this).attr("colspan", $(this).data("colspan"));
                    }
                });
                
                
                
                this.columns = this.initializeColumns(event);
            }
            
            
            
            
            this._initializeColumnWidth();
            this.display = this._resize();
            
            
            this.$element.find("tbody tr:not(.child)").each(function () {
                if ($(this).next(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_SELECTOR).length == 0) {
                    $(this).after($("<tr></tr>").addClass(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_CLASS).hide());
                }
            });

            
            var details = this.controlRow.controlRowDetails;
            
            if (details.type) {
                
                this._controlRowVisibility(event);
                
                
                this.$element.on(ResponsiveTablePlugin.prototype.defaults.EVENT_COLUMN_VISIBILITY, function () {
                    that._controlRowVisibility();
                });

                this.$element.addClass('rtp-' + details.type);
            }
            
            if (this.options.fixTableControls) {
                
                
                
                if (_.isUndefined(event) || event.type === "orientationchange" || (event.type === "resize" && !isIphoneOrIpad)) {
                    
                    this.options.fixTableControls(event);
                }
            }
        },

        
        _fixControlRows : function () {
            this.$element.find(ResponsiveTablePlugin.prototype.defaults.CONTROL_ROW_SELECTOR).remove();
        },

        
        isColumnHidden : function () {
            return this.bColumnHidden || false;
        },

        
        _rearrangeTableRuntimeControls : function (lastVisibleColumn, event) {
            
            
            var $runtimeAddControls = this.$element.find(".guideTableRuntimeControls .guideTableRuntimeAddControl"),
                runtimeControlIndex = 0,
                that = this,
                index = null;
            $runtimeAddControls.each(function () {
                
                if ($(this).is(":visible")) {
                    runtimeControlIndex = $(this).closest("td").index();
                    return false;
                }
            });
            
            if ((runtimeControlIndex <= lastVisibleColumn)) {
                
                
                $runtimeAddControls.each(function () {
                    
                    
                    var $runtimeControl = $(this).closest(".guideTableRuntimeControls"),
                        $runtimeControlTableRow = $(this).closest("tr");
                    if ($runtimeControl.hasClass("guideTableRuntimeRightControls")) {
                        
                        $runtimeControl.appendTo($runtimeControlTableRow.find("td").eq(lastVisibleColumn));
                        if (runtimeControlIndex !== lastVisibleColumn) {
                            var $component = $runtimeControl.prev();
                            $component.css("display", "block");
                            $component.css("float", "none");
                        }
                    }

                });
            }
        },

        
        _controlRowVisibility : function (event) {
            var that = this,
                
                hiddenColumns = _.filter(this.columns, function (element) {
                    return (element.isVisible) !== true;
                }),
                lastVisibleColumn = this.columns.length - hiddenColumns.length;
            
            
            this._rearrangeTableRuntimeControls(lastVisibleColumn - 1, event);
            
            if (hiddenColumns && hiddenColumns.length > 0) {
                
                this.$element.addClass('collapsed');
                
            this.bColumnHidden = true;            } else {
                
                this.$element.removeClass('collapsed');
                
                this.bColumnHidden = false;
            }
        },

        
        _controlRowInitialization : function () {
            var that    = this;
            var details = this.controlRow.controlRowDetails;

            
            if (details.type === 'inline') {
                
                details.target = ("." +  (this.options.tableRuntimeEditControlClass || "tableRuntimeEditControl"));
            }

            
            
            
            var target   = details.target;
            var selector = typeof target === 'string' ? target : 'td';

            
            this.$element.on('click keypress', selector, function (e) {
                
                
                if ((e.type == "keypress" && e.keyCode == 13) || e.type == "click") {
                    
                    if (!that.$element.hasClass('collapsed')) {
                        return;
                    }
                    
                    var $row = $(this).closest('tr'),
                        rowData = $row.data("tableRow"),
                        row = rowData;
                    
                    
                    
                    if (row == null || row.child.$element.parent().length === 0) {
                        row = new TableRow($row);
                        $row.data("tableRow", row);
                    }
                    if (row.child.isShown) {
                        row.hideChild();
                        row.$tableRowElement.removeClass('parent');
                    } else {
                        var info = that.controlRow.controlRowDetails.renderer(that, row);
                        row.updateChild(info, that.colLength);
                        row.showChild();
                        row.$tableRowElement.addClass('parent');
                        
                        row.child.$element.find("input, select, textarea, button").eq(0).focus();
                    }
                }
            });
        },

        
        _resize : function () {
            var width = $(window).width();
            var breakpoints = this.controlRow.breakpoints;
            var breakpoint = breakpoints[0].name;

            
            for (var i = breakpoints.length - 1 ; i >= 0 ; i--) {
                if (width <= breakpoints[i].width) {
                    breakpoint = breakpoints[i].name;
                    break;
                }
            }

            
            var display = this._getColumnsVisibility(breakpoint);

            _.each(this.columns, function (item, index) {
                item.visible(display[index]);
            });

            return display;
        },

        
        _getColumnsVisibility : function (breakpoint) {
            var columns = this.columns,
                i,
                len = this.$element.find("th"),
                display = [];

            
            var widthAvailable = this.$element.parent().outerWidth();
            var usedWidth = widthAvailable;

            
            
            display = _.map(columns, function (item) {
                usedWidth -= item.minWidth;
                return ((usedWidth < 0) ? false : true);
            });

            
            display[0] = true;
            return display;
        }

    };

    $.fn.responsiveTablePlugin = function (option, value) {
        var get = '',
            element = this.each(function () {
                
                if ($(this).is('table') === true) {
                    var $this = $(this),
                        data = $this.data('responsiveTablePlugin'),
                        options = $.extend({}, ResponsiveTablePlugin.prototype.defaults, typeof option === 'object' && option);

                    
                    if (!data) {
                        $this.data('responsiveTablePlugin', (data = new ResponsiveTablePlugin(this, options)));
                        data._constructor();
                    }

                    
                    if (typeof option === 'string') {
                        get = data[option](value);
                    }
                }
            });

        if (get != "") {
            return get;
        } else {
            return element;
        }
    };

    ResponsiveTablePlugin.prototype.defaults = {
        
        EVENT_COLUMN_VISIBILITY : "responsiveTablePlugin.columnVisibility",
        GUIDE_ID_SELECTOR : "div[data-guide-view-bind]",
        CONTROL_ROW_CLASS : "child",
        CONTROL_ROW_SELECTOR : "tr.child"
    };

})(_, $);


(function (_, $, guidelib) {
    var getOrElse = xfalib.ut.XfaUtil.prototype.getOrElse;

    
    guidelib.model._createXfaAndGuideModel = function (guideJson, xfaJson) {
        var configString = window.AF_log_config === undefined ? "0-a9"
                : "1-" + window.AF_log_config,
            guide;

        xfalib.ut.XfaUtil.prototype.registerLocaleProperties(guidelib.i18n);
        
        start = new Date().getTime();
        if (xfaJson) {
            window.formBridge.registerConfig("contextPath", window.guideBridge.userConfig["contextPath"]);
            window.formBridge.registerConfig("LoggerConfig", {
                "logConfigString" : configString,
                "categoryAcronyms" : {"d" : "AF"}
            });
            xfalib.script.XfaModelRegistry.prototype.createModel(xfaJson);

            
            new xfalib.acrobat.Acrobat();
        } else {
            xfalib.ut.XfaUtil.prototype.logger = new xfalib.ut.Logger({
                "jsonModel" : {
                    "logConfigString" : configString,
                    "categoryAcronyms" : {"d" : "AF"}
                }
            });
        }
        guide = guidelib.model.GuideModelRegistry.prototype.createModel(guideJson);
        return guide;

    };

    
    guidelib.model._getGuideJsonWithSyncXfaProps = function (guideJson, xfaJson) {
        
        var guide = guidelib.model._createXfaAndGuideModel(guideJson, xfaJson);
        
        guide.syncXFAProps();

        
        return {
            "guidejson" : JSON.stringify(guideJson),
            "xfajson" : JSON.stringify(xfaJson)
        };
    };

    guidelib.model._prepareGuide = function (guidemergedjson, guide) {
        var hasRestoreState = false,
            guideJson = null,
            localStorage = null;
        
        if (window.guideBridge !== undefined) {
            localStorage = window.guideBridge._getStorage();
            
            
            if (localStorage && localStorage.guideState) {
                guideJson = localStorage.guideState;
                if (guideJson) {
                    hasRestoreState = true;
                    window.guideBridge.restoreGuideState(localStorage); 
                }
            }
        }

        
        
        if (!hasRestoreState && guidemergedjson && !_.isEmpty(guidemergedjson.guideState)) {
            window.guideBridge.restoreGuideState(guidemergedjson); 
        } else {
            
            guide.prepare();
        }
        
        var obj = guideBridge.customContextProperty("fileAttachmentMap");
        if (!_.isUndefined(obj)) {
            try {
                var fileAttachmentMap = JSON.parse(obj);
            } catch (e) {
                if (e.stack && guideBridge._guide) {
                    guideBridge._guide.logger().error(e.stack);
                }
            }
        }
        
        if (!_.isUndefined(fileAttachmentMap)) {
            _.each(fileAttachmentMap, function (fieldValue, fieldName) {
                var node = guideBridge.resolveNode(fieldName);
                if (node) {
                    node.fileAttachment.value = fieldValue;
                    if (!_.isEmpty(fieldValue)) {
                        node._fileList = fieldValue.split("\n");
                    }
                } else {
                    if (guideBridge._guide) {
                        guideBridge._guide.logger().log("som not valid:" + fieldName);
                    }
                }
            });
        }
        guide.setGuideState(guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MODEL_COMPLETE);
    };

    guidelib.model._prepareGuideContext = function (guideContext, guidemergedjson, guide) {
        
        if (guidemergedjson && guidemergedjson.guideState && guidemergedjson.guideState.guidePrefillXml) {
            guideContext.guidePrefillXml = guidemergedjson.guideState.guidePrefillXml;
        }
        if (guidemergedjson && guidemergedjson.guideState && guidemergedjson.guideState.guidePrefillJson) {
            guideContext.guidePrefillJson = guidemergedjson.guideState.guidePrefillJson;
        }

        
        var draftContextCustomPropertyMap = guide.getOrElse(guidemergedjson, "guideState.guideContext.customPropertyMap", null);
        if (draftContextCustomPropertyMap) {
            guideContext.customPropertyMap = guideContext.customPropertyMap || {};
            _.extend(guideContext.customPropertyMap, draftContextCustomPropertyMap);
        }
        
        guidelib.runtime.guideContext = guidelib.runtime.guideContext || {};
        _.extend(guidelib.runtime.guideContext, guideContext);
        guide.version = new guidelib.util.Version({
            scriptingBehaviourVersion : guideContext.scriptingBehaviourVersion
        });
    };

    guidelib.model._prepareXfa = function (xfaJson, xfaRenderContext, guidemergedjson, guide) {
        if (xfaJson && xfalib.runtime.xfa) {
            
            xfalib.runtime.renderContext = xfaRenderContext;
            var mergedXfaRenderContext = guide.getOrElse(guidemergedjson, "guideState.xfaState.xfaRenderContext", null);
            if (mergedXfaRenderContext != null) {
                
                xfalib.runtime.renderContext = JSON.parse(mergedXfaRenderContext);
            }
            xfalib.runtime.xfa.form._initialize(true);
            $(window).trigger("XfaInitialized");
        }
    };

    guidelib.model._createXfaAndGuideModelAndPrepareContext = function (guideJson, xfaJson, guideContext, guidemergedjson, guide, xfaRenderContext) {
        
        guide = guidelib.model._createXfaAndGuideModel(guideJson, xfaJson);
        
        guide.setGuideState(guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MODEL_CREATED);
        
        guidelib.model._prepareGuideContext(guideContext, guidemergedjson, guide);
        
        guidelib.model._prepareXfa(xfaJson, xfaRenderContext, guidemergedjson, guide);
        
        return guide;
    };

    guidelib.model.fireOnContainerDomElementReady = function (guideJsonData) {
        var  guideJson = JSON.parse(guideJsonData["guidejson"] || "null"),
            guideContext = JSON.parse(guideJsonData["guidecontext"] || "null"),
            guidemergedjson = JSON.parse(guideJsonData["guidemergedjson"] || "null"),
            xfaJson = JSON.parse(guideJsonData["xfajson"] || "null"),
            xfaRenderContext = JSON.parse(guideJsonData["xfarendercontext"] || "null"),
            lastFocusItem,
            guide;
        
        if (guideContext.schemaType === "formmodelschema" || guideContext.schemaType === "jsonschema") {
            guidelib.internal.liveDataUtils = new guidelib.model.LiveJsonUtils();
        } else {
            guidelib.internal.liveDataUtils = new guidelib.model.LiveXmlUtils();
        }

        if (window.guideBridge.hostName == "server") {

            
            guidelib.internal.liveModel._disableFunctions();
            guidelib.internal.liveDataUtils._disableFunctions();

            if (window.formBridge) {
                
                
                
                window.formBridge.ajaxCallMode = "server";
            }
            
            guide = guidelib.model._createXfaAndGuideModelAndPrepareContext(guideJson, xfaJson, guideContext, guidemergedjson, guide, xfaRenderContext);
            window.guideBridge._guide = guide;
            
            guidelib.model._prepareGuide(guidemergedjson, guide);
        } else {
            guidelib.internal.liveModel.createDataNodes(guideJson.repeatBindRef);
            if (guideJson.allLazyChildren.length > 0) {
                guidelib.internal.liveModel.createCrossFragFields(guideJson.guideGlobalLazyField);
                guidelib.model._initGuideDirtyMarkerAndVisitor(guideJson, guidemergedjson);
            }

            window.guideBridge._postExternalMessage({name : "_formdomstart"});
            try {
                var $guideContainerDom = $('div.guideContainerWrapperNode');
                
                guide = guidelib.model._createXfaAndGuideModelAndPrepareContext(guideJson, xfaJson, guideContext, guidemergedjson, guide, xfaRenderContext);
                
                $(window).trigger({type : "guideModelInitialized", guide : guide});
                
                guidelib.model._prepareGuide(guidemergedjson, guide);
                if (!guidelib.internal.liveDataUtils.isLiveDataInitialized()
                    && guideBridge._guide.allLazyChildren.length > 0) {
                    guidelib.internal.liveDataUtils.initLiveData(null, null,
                        _.isString(guideBridge._guide.xdpRef), _.isString(guideBridge._guide.xsdRef),
                        guideBridge._guide.getAttribute("xsdRootElement"));
                }
                window.guideBridge._postExternalMessage({name : "_layoutstart"});

                var guideContainerView = new guidelib.view.GuideContainerView({element : $guideContainerDom, model : guide});
                
                
                window.guideBridge._setGuideView(guideContainerView);
                guidelib.util.GuideUtil.initializeHelp();

                
                guidelib.util.AdUtil.applyDescriptionPlugin();

                window.guideBridge._postExternalMessage({name : "_layoutend"});
                $(window).on("mousedown.guidebridge", function () {
                    window.guideBridge.clickedOnWindow = true;
                });

                
                
                
                if (guidelib.runtime.guideContext) {
                    lastFocusItem = guidelib.util.GuideUtil.fetchXMLNodeValue(guidelib.runtime.guideContext.guidePrefillXml, "lastFocusItem");
                }
                
                if (_.isUndefined(lastFocusItem)) {
                    lastFocusItem = guidelib.util.GuideUtil._fetchJSONNodeValue(guidelib.runtime.guideContext.guidePrefillJson, "afSubmissionInfo.lastFocusItem");
                }
                
                if (_.isUndefined(lastFocusItem)) {
                    lastFocusItem = window.guideBridge.customContextProperty("lastFocusItem");
                }
                
                if (lastFocusItem && !guidelib.runtime.progressive) {
                    window.guideBridge.setFocus(lastFocusItem); 
                } else {
                    window.guideBridge.setFocus(); 
                }
                $(window).trigger({type : "guideInitialized", guide : guide});
            } catch (e) {
                
                if (e.stack) {
                    console.error(e.stack);
                }
            }
        }

        
        
        
        if (xfalib.ut.XfaUtil.prototype.isSafari() && !xfalib.ut.TouchUtil.TOUCH_ENABLED) {
            $('#guideContainerForm').addClass('macSafariForm');
        }
        
        $("#guideContainerForm").submit(function (evnt) {
            evnt.preventDefault();
        });
    };
    guidelib.model._initGuideDirtyMarkerAndVisitor = function (guideJson, guidemergedjson) {
        
        
        
        var guideDirtyMarkerAndVisitor = guidelib.internal.GuideDirtyMarkerAndVisitor,
            partialDirtyVisitMap,
            afDraft;
        if (!_.isEmpty(guidemergedjson)) {
            var getOrElse = xfalib.ut.XfaUtil.prototype.getOrElse,
                xmlString = getOrElse(guidemergedjson, "guideState.guideLiveData", undefined)
                    || getOrElse(guidemergedjson, "guideState.guidePrefillXml", undefined);
            partialDirtyVisitMap = guidelib.internal.liveDataUtils.convertSubmissionInfoToMap(xmlString);
            if ((afDraft = getOrElse(guidemergedjson, "guideState.guideContext.afSubmissionInfo.afDraft", undefined))) {
                
                guideDirtyMarkerAndVisitor.visitMap = guideDirtyMarkerAndVisitor._createMapFromFromList(
                    afDraft.replace(/\"/g, "").split(","), 0);
                guideDirtyMarkerAndVisitor.visitMap = guideDirtyMarkerAndVisitor.addToExistingMapIfNotFound(
                    guideJson.allLazyChildren, guideDirtyMarkerAndVisitor.visitMap, 1);

            } else if (!_.isUndefined(partialDirtyVisitMap)) {
                
                guideDirtyMarkerAndVisitor.visitMap =
                    guideDirtyMarkerAndVisitor.addToExistingMapIfNotFound(guideJson.allLazyChildren, partialDirtyVisitMap, 1);

            }
        } else {
            
            guideDirtyMarkerAndVisitor.visitMap = guideDirtyMarkerAndVisitor._createMapFromFromList(guideJson.allLazyChildren, 0);
        }
    };
})(_, $, window.guidelib);


(function ($, _, guidelib) {

    
    
    guidelib.runtime.af.reduce = function (panels, fieldName, iterator, memo, context) {
        if (!_.isArray(panels)) {
            panels = [panels];
        }
        return _.reduce(panels, function (memo, panel) {
            if (panel instanceof guidelib.model.GuidePanel && !_.isUndefined(panel[fieldName])) {
                if (_.isFunction(iterator)) {
                    return iterator.apply(context, [memo, panel, panel[fieldName]]);
                }
            }
            return memo;
        }, memo);
    };

    
    
    guidelib.runtime.af.filter = function (panels, fieldName, predicate, context) {
        if (!_.isArray(panels)) {
            panels = [panels];
        }
        return _.map(
            _.filter(panels, function (panel) {
                if (panel instanceof guidelib.model.GuidePanel && !_.isUndefined(panel[fieldName])) {
                    if (_.isFunction(predicate)) {
                        return predicate.apply(context, [panel, panel[fieldName]]);
                    }
                    return false;
                }
            }),
            function (panel) {
                return panel[fieldName];
            }
        );
    };
    
    guidelib.runtime.af.formatDateToISOString = function (dateObject) {
        var day, month, year;
        if (!_.isUndefined(dateObject) && _.isObject(dateObject)) {
            day = dateObject.getDate().toString();
            
            month = (dateObject.getMonth() + 1).toString();
            year = dateObject.getFullYear().toString();
            if (month.length === 1) {
                month = "0" + month.toString();
            }
            
            return year + "-" + month + "-" + day;

        }
    };
}($, _, guidelib));




(function (guidelib, $) {

    var VERSION_AEM_61 = "AEM6.1",
        VERSION_AEM_62 = "AEM6.2",
        flagsStatus = {},
        getMinorMajor = function (version) {
            var match = version.match(/AEM(\d+)(?:\.(\d+))?/);
            if (match == null) {
                return null;
            }
            return {
                major : match[1],
                minor : match[2] === undefined ? "0" : match[2]
            };
        },
        compareNumbers = function (num1, num2) {
            return (num1 - num2);
        },
        compareVersions = function (version1, version2) {
            if (typeof version1 !== "string" || typeof version2 !== "string") {
                throw "Comparing Invalid Versions";
            }
            var v1 = getMinorMajor(version1),
                v2 = getMinorMajor(version2);
            if (v1 == null || v2 == null) {
                throw "Comparing Invalid Versions";
            }
            var c = compareNumbers(+v1.major, +v2.major);
            return c !== 0 ? c : compareNumbers(+v1.minor, +v2.minor);
        },
        Version = guidelib.util.Version = xfalib.ut.Class.extend({
            initialize : function (options) {
                flagsStatus = {};
                var compat = options.scriptingBehaviourVersion;
                if (compat === "None") {
                    compat = this.current();
                }
                this.scriptingBehaviourVersion = compat || VERSION_AEM_62;
                var majorMinor = getMinorMajor(this.scriptingBehaviourVersion);
                if (majorMinor == null) {
                    throw "Invalid Version number";
                }
                this.major = majorMinor.major;
                this.minor = majorMinor.minor;
            },

            current : function () {
                return VERSION_AEM_62;
            },

            compatibleVersion : function () {
                return this.scriptingBehaviourVersion;
            },

            isPrevious : function (version) {
                return compareVersions(this.scriptingBehaviourVersion, version) < 0;
            },

            isPreviousOrSame : function (version) {
                var c = compareVersions(this.scriptingBehaviourVersion, version);
                return c < 0 || c == 0;
            },

            isAfter : function (version) {
                return compareVersions(this.scriptingBehaviourVersion, version) > 0;
            },

            isAfterOrSame : function (version) {
                var c = compareVersions(this.scriptingBehaviourVersion, version);
                return c > 0 || c == 0;
            },

            isSame : function (version) {
                return compareVersions(this.scriptingBehaviourVersion, version) == 0;
            },

            isOn : function (flag) {
                switch (flag) {
                    case this.Flags.RUN_VALUE_COMMMIT_ON_SCRIPT_CHANGE:
                        if (flagsStatus[flag] == undefined) {
                            flagsStatus[flag] = this.isAfter(this.AEM_61);
                        }
                        return flagsStatus[flag];
                }
                throw "Invalid Flag";
            }
        });

    Version.prototype.Flags = {};
    Object.defineProperties(Version.prototype.Flags, {
        RUN_VALUE_COMMMIT_ON_SCRIPT_CHANGE : {
            value : "manageValueCommit",
            writable : false
        }
    });
    Version.defineProps({
        AEM_61 : {
            value : VERSION_AEM_61,
            writable : false
        },

        AEM_62 : {
            value : VERSION_AEM_62,
            writable : false
        }
    });
}(guidelib, $));

(function (_, guidelib) {
    var orderGetAttribute = {
        "Guide" : "XFA",
        "XFA" : "Guide"
    },
    
    newlyAddedProperties = ["enabled", "visible"];
    
    var GuideNode = guidelib.model.GuideNode = xfalib.ut.EventClass.extend({
        msClassName : "guideNode",
        guideUtil : guidelib.util.GuideUtil,

        initialize : function () {
            
            
            this.className = this.jsonModel.guideNodeClass || this.msClassName;
            this.parent = null;
            this._isItem = false;
            this._index = 0;
        },

        _postInitialize : function () {
            
        },

        _triggerOnBridge : function (eventName, target, property, oldVal, newVal) {
            if (window.guideBridge) {
                window.guideBridge.trigger(eventName,
                    guidelib.event.GuideModelEvent.createEvent(eventName, target, property,
                                                           oldVal, newVal));
            }
        },

        validate : function (errorList) {

        },

        
        
        _getXFAOptionStringFromGuideItems : function (guideItems) {
            var optionsStr = "", indexOfSeparator = 0;
            if (!_.isEmpty(guideItems) && !_.isArray(guideItems)) {
                guideItems = [guideItems];
            }
            _.each(guideItems, function (item, index, list) {
                indexOfSeparator = item.indexOf('=');
                
                
                if (indexOfSeparator > -1) {
                    optionsStr += item.substring(indexOfSeparator + 1) + "," + item.substring(0, indexOfSeparator);
                } else {
                    optionsStr += item + "," + item;
                }
                if (index < guideItems.length - 1) {
                    optionsStr += ",";
                }
            });
            return optionsStr;
        },

        _compareXFAItemsWithGuideItems : function (xfaItems, guideItems) {
            var match = true;
            if (xfaItems.length !== guideItems.length) {
                match = false;
            }
            if (match) {
                var bndNode = this.bindNode;
                _.each(guideItems, function (item, index, list) {
                    if (item.indexOf('=') > -1) {
                        if ((bndNode.getSaveItem(index) + "=" + bndNode.getDisplayItem(index)) == item) {
                            match = false;
                        }
                    } else {
                        if ((bndNode.getSaveItem(index) + "=" + bndNode.getDisplayItem(index)) == (item + "=" + item)) {
                            match = false;
                        }
                    }
                });
            }
            return match;
        },

        
        syncXFAProps : function () {
            if (this.bindNode) {
                _.each(this._guide()._guideSchema.getAttributes(this.className),
                    function (attr, attrName) {
                        var xfaProp = attr.xfaProp,
                            propChain = (xfaProp || "").split("."),
                            xfaAttr = propChain.length > 0 ? propChain[propChain.length - 1]
                                                           : undefined;
                        
                        
                        
                        
                        
                        
                        if (!xfaAttr || (newlyAddedProperties.indexOf(attrName) != -1 && _.isUndefined(this.jsonModel[attrName]))) {
                            return;
                        }
                        var objChain = propChain.splice(0, propChain.length - 1),
                            obj = _.reduce(objChain,
                                function (obj, prop) {
                                    if (_.isObject(obj)) {
                                        return obj[prop];
                                    }
                                    return undefined;
                                }, this.bindNode),
                            val = this.getGuideProp(attrName, attr),
                            convertor = this._guide()._guideSchema.getConvertor(attrName),
                            cVal = convertor ? convertor.guideToXfa.apply(this, [val]) : val,
                            xfaVal;
                        try {
                            if (obj) {
                                xfaVal = obj[xfaAttr];
                                if (cVal !== undefined) {
                                    if (xfaAttr === "items") {
                                        var match = this._compareXFAItemsWithGuideItems(obj, cVal);
                                        var SET_ITEMS_INSERT_MODE_PAIR = 2;
                                        if (!match) {
                                            var optionsStr = this._getXFAOptionStringFromGuideItems(cVal);
                                            if (optionsStr !== "") {
                                                obj.setItems(optionsStr, SET_ITEMS_INSERT_MODE_PAIR);
                                            } else {
                                                obj.clearItems();
                                            }
                                        }
                                    } else if (cVal !== xfaVal) {
                                        obj[xfaAttr] = cVal;
                                    }
                                }
                            }
                        } catch (e) {
                            this.logger().error("AF", "setting {0}(guide {1}) for {2} is not supported in xfa",
                                [xfaProp, attrName, this.bindNode.somExpression]);
                            if (e.stack) {
                                this.logger().error("AF", e.stack);
                            }
                        }
                    }, this);
            }
        },

        
        prepare : function () {

        },

        
        nakedChildReferences : function (nIndex, obj) {
            return;
        },

        
        getNaked : function (nIndex, container, scope) {
            var nodeName = this.getAttribute("name"),
                oldReference = container._private["_" + nodeName + "_"],
                canOverride = (container._isOverriden && !container._isOverriden["_" + nodeName + "_"]),
                isGlobalFieldRef = this.isGlobal && container === guidelib.runtime 
                    && (container[nodeName] instanceof guidelib.model.AbstractField);

            if ((scope && scope._nameArray[nodeName] === 1) || (nIndex === this.index)) {
                if (oldReference === null || oldReference === undefined || canOverride || isGlobalFieldRef) {
                    this._guide()._createGetterSetter(container, nodeName, this);
                    if (canOverride === true) {
                        container._isOverriden["_" + nodeName + "_"] = true;
                    }
                }
            }
        },

        _getReducedJSON : function () {
            var whitelistedProperties = ["name", "templateId", "_value", "guideNodeClass"],
                reducedJsonObject = {};
            guidelib.model.util.CommonUtils.prototype.returnMinimalJSON(whitelistedProperties, reducedJsonObject, this);
            return reducedJsonObject;
        },

        _getNakedThis : function () {
            return this;
        },

        _xfa : function () {
            if (window.xfalib) {
                return window.xfalib.runtime.xfa;
            }
            return null;
        },

        _guide : function () {
            if (window.guidelib.runtime.guide) {
                return window.guidelib.runtime.guide;
            }
            return null;
        },

        
        playJson : function (pJsonModel) {

        },

        
        
        visit : function (callback, context) {
            callback.apply(context, [this]);
        },

        _collectValues : function (keyValue) {

        },

        _setParentAccess : function (value) {
            
        },

        _unloadModel : function () {
            this.trigger(guidelib.event.GuideModelEvent.OBJECT_DESTROYED,
                guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.OBJECT_DESTROYED,
                    this,
                    "destroy",
                    null,
                    this
                )
            );
            this._guide()._modelTemplateCacheStore.removeModel(this.id);
            this.off();

            if (_.isObject(guidelib.runtime[this.name]) && (guidelib.runtime[this.name] === this || guidelib.runtime[this.name].somExpression === this.somExpression)) {
                guidelib.runtime[this.name] = undefined;
                if (_.isObject(guidelib.runtime._private['_' + this.name + '_'])) {
                    guidelib.runtime._private['_' + this.name + '_'] = undefined;
                }
            }
        },

        _triggerEvent : function (event, propName, prevText, newText) {
            this.trigger(event,
                guidelib.event.GuideModelEvent.createEvent(event, this, propName,
                                                           prevText, newText));
        },

        
        setAttribute : function (value, attrName) {
            if (this.jsonModel[attrName] !== value) { 
                var oldValue = this.jsonModel[attrName];
                this.jsonModel[attrName] = value;
                this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, attrName, oldValue, value);
            }
        },

        _getSomExpression : function () {
            if (this.parent == null) {
                return "guide[0]." + this._escapeQualifiedName();
            } else {
                return this.parent.somExpression + "." + this._escapeQualifiedName();
            }
        },

        _escapeQualifiedName : function () {
            var name = this.getAttribute("name");
            var index = this._index;
            var qname = name + "[" + index + "]";
            return qname.replace(/\./, "\\.");
        },

        
        getGuideProp : function (attrName, attr) {
            var val = this.getOrElse(this.jsonModel, attrName, attr["default"]);
            if (val === undefined) {
                return undefined;
            }
            return this._guide()._guideSchema.getTypedValue(attr.type, val);
        },

        
        getXFAProp : function (attrName, attr) {
            var xfaName = attr.xfaProp,
                convertor = this._guide()._guideSchema.getConvertor(attrName),
                val;
            if (this.bindNode && xfaName !== undefined) {
                val = this.bindNode.getOrElse(this.bindNode, xfaName, undefined);
                if (convertor) {
                    val = convertor.xfaToGuide.apply(this, [val]);
                }
                if (val !== undefined) {
                    return val;
                }
            }
            return undefined;
        },

        
        getAttribute : function (attrName) {
            var attr = this._guide()._guideSchema.getAttributeProps(this.className, attrName),
                priority = attr.priority || (attr.xfaProp !== undefined ? "XFA" : "Guide"), 
                                                  
                val = this["get" + priority + "Prop"].apply(this, [attrName, attr]); 
            
            if (val === undefined) {
                
                val = this["get" + orderGetAttribute[priority] + "Prop"].apply(this, [attrName, attr]);
            }
            return val;
        },

        
        resetData : function () {

        }
    });

    GuideNode.defineProps({

        
        "name" : {
            get : function () {
                return (this.getAttribute("name") || "").replace(/\s+/g, '');
            }
        },

        "templateId" : {
            get : function () {
                return this.getAttribute("templateId");
            }
        },

        
        "id" : {
            get : function () {
                return this.getAttribute("id") || this.templateId;
            }
        },

        
        somExpression : {
            get : function () {
                return this._getSomExpression();
            }
        },

        
        "title" : {
            get : function () {
                return this.getAttribute("jcr:title");
            }
        },

        
        "nonLocalizedTitle" : {
            get : function () {
                return this.getAttribute("nonLocalizedTitle");
            }
        },

        
        panel : {
            get : function () {
                return this.parent.panel;
            }
        },

        viewVisited : {
            get : function () {
                return this.getAttribute("viewVisited");
            },
            set : function (visit) {
                this.setAttribute(visit, "viewVisited");
            }
        },

        
        index : {
            get : function () {
                return this._index;
            }
        },

        
        visible : {
            get : function () {
                return true;
            },
            set : function (value) {
                
            }
        },

        
        enabled : {
            get : function () {
                return true;
            },
            set : function (value) {
                
            }
        },

        enableLayoutOptimization : {
            get : function () {
                return false;
            }
        },

        jcrPath : {
            get : function () {
                return this.jsonModel["jcr:path"];
            }
        },

        
        targetVersion : {
            get : function () {
                return this.getAttribute("fd:targetVersion");
            }
        }
    });
}(_, guidelib));

(function (_, guidelib, $) {
    var Verify = guidelib.model.Verify = guidelib.model.GuideNode.extend({
        msClassName : "verify",

        initialize : function () {
            Verify._super.initialize.call(this);
            this.validationStatus = true;
        },

        validate : function (errorList) {
            

            var iframeFormBridge = null, validationStatus = true;

            if (this.jsonModel.interactive !== undefined && this.jsonModel.interactive === "true") {
                
                
                
                
                
                if (guideBridge.hostName === "client") {
                    iframeFormBridge = $('#verifiable_form').get(0).contentWindow.formBridge;
                }
                
                
                if (iframeFormBridge !== undefined && iframeFormBridge !== null) {
                    validationStatus = iframeFormBridge.validateForm();
                    if (!validationStatus) {
                        errorList.push({som : this.somExpression, errorText : "XFA validation errors."});
                    }
                    this.validationStatus = validationStatus;
                }
            }

            return validationStatus;
        }
    });
    Verify.defineProps({
        forceElementFocusChange : {
            get : function () {
                return true;
            }
        }
    });
})(_, guidelib, $);

(function (_, guidelib) {
    var Esign = guidelib.model.Esign = guidelib.model.GuideNode.extend({
        msClassName : "esign",

        initialize : function () {
            Esign._super.initialize.call(this);
            this.validationStatus = true;
        },

        validate : function (errorList) {
            
            
            var validationStatus =  true;
            if (FD.AFaddon.Signing !== undefined && FD.AFaddon.Signing !== null) {
                validationStatus = FD.AFaddon.Signing.isDocumentSigned(this.jsonModel.signingService);
                if (!validationStatus) {
                    errorList.push({som : this.somExpression, errorText : "Signing not complete."});
                }
            }

            this.validationStatus = validationStatus;
            return validationStatus;
        }
    });
    Esign.defineProps({
        forceElementFocusChange : {
            get : function () {
                return true;
            }
        }
    });
})(_, guidelib);




(function (_, guidelib) {
    var AbstractField = guidelib.model.AbstractField = guidelib.model.GuideNode.extend({
        msClassName : "abstractField",

        initialize : function () {
            this._name = this.options.name || "";
            this._bindRef = this.options.bindRef || "";
            this._dataSom = this._isXfaNode() ? this.options.dataSom : "";
            this.dependants = [];
            
            this._depdendantIds = [];
        },

        _getValue : function () {
            return this.jsonModel._value;
        },

        _setValue : function (value) {
            this.jsonModel._value = value;
        },

        resetData : function () {
            return guidelib.model.Field.prototype.resetData.call(this);
        },

        _isXfaNode : function () {
            return this.bindRef.indexOf("xfa[0].form[0].") === 0;
        },

        getAttribute : function (attrName) {
            var attrValue;
            switch (attrName) {
                case "name":
                    attrValue = this.name;
                    break;
                case "bindRef":
                    attrValue = this.bindRef;
                    break;
                default:
                    attrValue = null;
                    break;
            }
            return attrValue;
        }
    });

    AbstractField.defineProps({
        somExpression : {
            get : function () {
                return "";
            }
        },
        name : {
            get : function () {
                return (this._name || "").replace(/\s+/g, '');
            }
        },
        bindRef : {
            get : function () {
                return (this._bindRef || "").replace(/\s+/g, '');
            }
        },

        dataSom : {
            get : function () {
                return this._dataSom;
            }
        },

        value : {
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.managedExp && context.contextNode && context.expression) {
                    this._addDependant(context.contextNode, context.expression);
                    
                    this._depdendantIds.push(context.contextNode.id);
                }
                return this.jsonModel._value;
            },
            set : function (newValue) {
                if (this.jsonModel._value !== newValue) {
                    this.jsonModel._value = newValue;
                    
                    var guideDirtyMarkerAndVisitor = guidelib.internal.GuideDirtyMarkerAndVisitor,
                        visitMap = guideDirtyMarkerAndVisitor.visitMap,
                        listOfDependents = this._depdendantIds;
                    guideDirtyMarkerAndVisitor._findAndMarkDirty(visitMap, listOfDependents);
                    this._notifyDependants();
                }
            }
        }
    });

    AbstractField.addMixins([
        guidelib.model.mixin.AddDependencyMgmt
    ]);
}(_, guidelib));



(function (_, guidelib) {
    
    var GuideInstanceManager = guidelib.model.GuideInstanceManager = guidelib.model.GuideNode.extend({
        msClassName : "guideInstanceManager",
        initialize : function () {
            GuideInstanceManager._super.initialize.call(this);
            this._instances = [];
            this.dependants = [];
            this.deafen = false; 
            this._bindPending = true;
        },

        _postInitializeBinding : function () {
            
            
            
            if (!this._bindPending) {
                return;
            } else {
                this._bindPending = false; 
            }
            
            
            
            
            
            
            var instance = this._instances[this.instanceCount - 1];
            if (!instance) {
                this.logger().log("There was no instance found for InstanceManager at postInitialize:" + this.somExpression);
            }
            if (instance.bindNode && instance.bindNode.instanceManager) {
                this.bindNode = instance.bindNode.instanceManager;
                this.bindNode.parent.on(xfalib.script.XfaModelEvent.CHILD_ADDED, this);
                this.bindNode.parent.on(xfalib.script.XfaModelEvent.CHILD_REMOVED, this);
            }
        },

        _unloadModel : function () {
            var instance = this._instances[this.instanceCount - 1];

            if (instance.bindNode && instance.bindNode.instanceManager) { 
                this.bindNode.parent.off(xfalib.script.XfaModelEvent.CHILD_ADDED, this);
                this.bindNode.parent.off(xfalib.script.XfaModelEvent.CHILD_REMOVED, this);
            }

            GuideInstanceManager._super._unloadModel.call(this);
        },

        
        handleEvent : function (event) {
            if (!this.deafen && event instanceof xfalib.script.XfaModelEvent) {
                switch (event.name) {
                    case xfalib.script.XfaModelEvent.CHILD_ADDED:
                        var addedInstance = event.newText;
                        if (addedInstance.instanceManager == this.bindNode) {
                            this._insertInstance(addedInstance.instanceIndex, addedInstance);
                        }
                        break;
                    case xfalib.script.XfaModelEvent.CHILD_REMOVED:
                        var removedInstance = event.prevText;
                        if (removedInstance.instanceManager == this.bindNode) {
                            this._removeInstance(removedInstance.instanceIndex, false);
                        }
                        break;
                    case xfalib.script.XfaModelEvent.CHILD_MOVED:
                        this.logger().log("CHILD_REMOVED should never be dispatched. It's achieved via ad and remove child.");
                        break;
                    default:
                        
                        break;
                }
            }
        },

        _instanceTemplate : function () {
            return this._guide()._modelTemplateCacheStore.cloneJsonTemplate(this.jsonModel.instanceTemplateId);
        },

        
        addInstance : function (addedXfaInstance) {
            return this._insertInstance(undefined, addedXfaInstance);
        },

        _manageChild : function (oCreatedChild, nIndex) {
            oCreatedChild._instanceManager = this;
            if (nIndex === undefined) {
                this._instances.push(oCreatedChild);
            } else {
                this._instances.splice(nIndex, 0, oCreatedChild);
            }
        },

        
        _insertInstance : function (nIndex, addedXfaInstance) {
            if ((+this.maxOccur >= 0) && (+this.maxOccur == this.instanceCount)) {
                return null;
            }
            
            if (nIndex !== undefined && nIndex > +this.maxOccur && +this.maxOccur > -1) {
                return null;
            }

            var addedBindNode = addedXfaInstance;
            if (!addedXfaInstance && this.bindNode) {
                this.deafen = true;
                try {
                    
                    addedBindNode = this.bindNode.insertInstance(nIndex);
                }
                finally {
                    this.deafen = false;
                }
            }
            var template = this._instanceTemplate();
            
            
            
            var clonedJson = {};
            var uniquePrefix = this.guideUtil.generateUID();
            this.copyObject(template, clonedJson,
                {
                    transformMaps : {
                        "id" : function (srcValue, options, parentObj) {
                            return uniquePrefix + "__" + parentObj.templateId;
                        }
                    }
                }
            );
            var options = addedBindNode ? {bindNode : addedBindNode} : null;
            var oChildAdded = guidelib.model.GuideModelRegistry.prototype.createModel(clonedJson, options);
            if (oChildAdded != null) {
                
                
                
                this._manageChild(oChildAdded, nIndex);
                var oParentContainer = this.parent;
                if (oParentContainer != null) {
                    if (this._instances.length > 0) {
                        
                        
                        
                        
                        nIndex = nIndex !== undefined ? nIndex : this._instances.length - 1 ;
                        
                        var lastInstanceIndex = oParentContainer._children.indexOf(this._instances[nIndex - 1]);
                        oParentContainer._addChildAt(oChildAdded, lastInstanceIndex + 1);
                    } else {
                        
                        
                        
                        
                        oParentContainer._addChildAt(oChildAdded, oParentContainer._children.indexOf(this) + 1);
                    }
                    var guideStateConstants = guidelib.model.GuideSchema.prototype.GuideStateConstants;
                    var dataUtils = guidelib.internal.liveDataUtils;
                    if (this._isDataNodeUpdateRequired(oChildAdded)) {
                        var parentNode = dataUtils.getParentDataNode(this._getDataContext(oChildAdded), true, {});
                        var index = dataUtils._convertModelIndexToDataIndex(oChildAdded.instanceIndex);
                        var node = dataUtils._getElement(parentNode, oChildAdded._getDataNodeName(), {index : index});
                        
                        
                        if (!node || (node && !(oChildAdded.instanceIndex == this._instances.length - 1))) {
                            var dataNode = dataUtils.insertNode(parentNode, oChildAdded._getDataNodeName(), oChildAdded.instanceIndex);
                            if (!dataNode) {
                                this.logger().warn("AF", "Unable to store the data of the element");
                            }
                        }
                    }
                }
                this._execExpressions(nIndex);
                return oChildAdded;
            } else {
                this.logger().log("guide", "insertInstance could not create child" + this.jsonModel.instanceTemplateId);
            }
            return null;
        },

        
        insertInstance : function (nIndex) {
            return this._insertInstance(nIndex);
        },

        
        removeInstance : function (index) {
            this._removeInstance(index, true);
        },

        
        _removeInstance : function (index, removeXfaInstance) {
            
            if (this.instanceCount == 0 || this.minOccur >= this.instanceCount) {
                return;
            }

            if (index >= +this.instanceCount) {
                return;
            }

            if (removeXfaInstance && this.bindNode) {
                this.deafen = true;
                try {
                    this.bindNode.removeInstance(index);
                }
                finally {
                    this.deafen = false;
                }
            }
            
            
            
            var oChild =  this._instances[index];
            var dataUtils = guidelib.internal.liveDataUtils;
            if (this._isDataNodeUpdateRequired(oChild)) {
                var parentNode = dataUtils.getParentDataNode(this._getDataContext(oChild));
                dataUtils.removeChild(parentNode, oChild._getDataNodeName(), oChild.instanceIndex);
            }
            this._instances.splice(index, 1);
            var parent = oChild.parent;
            parent._removeChild(oChild);
            this._execExpressions(index);
        },

        _isDataNodeUpdateRequired : function (child) {
            var guideStateConstants = guidelib.model.GuideSchema.prototype.GuideStateConstants,
                guide = guideBridge._guide;
            return guide && guide.getGuideState() === guideStateConstants.GUIDE_STATE_MODEL_COMPLETE
                && child._hasLazyDescendant;
        },

        _getDataContext : function (model) {
            var dataUtils = guidelib.internal.liveDataUtils,
                elementContext = dataUtils._getXpathContext(model),
                xmlContext = dataUtils._getDataContext(model, elementContext.bound,
                    elementContext.unBound),
                xpath = xmlContext.indexedXpath;
            xpath = dataUtils.addIndexToPath(xpath, model.instanceIndex);
            return {
                indexedXpath : xpath,
                xmlSec : xmlContext.xmlSec
            };
        },

        _getInstanceName : function () {
            return this.jsonModel.instanceName;
        },

        _instanceIsTableRow : function () {
            
            return this._instanceTemplate()["guideNodeClass"] === "guideTableRow";
        },

        
        _execExpressions : function (modifiedIndex) {
            try {
                
                this._notifyDependants();
                
                
                for (var i = modifiedIndex; i < this.instances.length; i++) {
                    this.instances[i]._notifyDependants();
                }
                
                this._guide().runPendingExpressions();
            } catch (ex) {
                this.logger().error("guide", ex.message);
            }
        }

    });
    GuideInstanceManager.defineProps({
        
        minOccur : {
            get : function () {
                var isTableRow = this._instanceIsTableRow();
                
                if (isTableRow) {
                    return ((+this.jsonModel.minOccur) || 1);
                } else {
                    return this.getOrElse(this.jsonModel.minOccur, 1);
                }
            }
        },

        
        maxOccur : {
            get : function () {
                return this.getOrElse(this.jsonModel.maxOccur, 1);
            }
        },

        initialOccur : {
            get : function () {
                return this.getOrElse(this.jsonModel.initialOccur, 1);
            }
        },

        
        instanceTemplateId : {
            get : function () {
                return this.jsonModel.instanceTemplateId;
            }
        },

        
        instanceCount : {
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.managedExp) {
                    
                    this._addDependant(context.contextNode, context.expression);
                }
                return this._instances.length ;
            }
        },

        
        repeatable : {
            get : function () {
                return (this.minOccur != 1 || this.maxOccur != 1);
            }
        },
        
        instances : {
            
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.managedExp) {
                    
                    this._addDependant(context.contextNode, context.expression);
                }
                return (this._instances || []).slice(0);
            }
        }
    });

    GuideInstanceManager.addMixins([
        guidelib.model.mixin.AddDependencyMgmt
    ]);
})(_, guidelib);


(function (_, xfalib, guidelib) {
    var expressionContent = "with(this) {" +
                        "\n\t with(guidelib.runtime) {" +
                        "\n\t\t var _guide_result = this[${affectedProp}] = eval(\"${expression}\");" +
                        "\n\t\t return _guide_result ;" +
                        "\n\t }" +
                        "\n};",
        scriptContent = "with(this) {" +
                        "\n\t with(guidelib.runtime) {" +
                        "\n\t var result = eval(\"${expression}\");" +
                        "\n\t\t return result; " +
                        "\n\t }" +
                        "\n}";
    
    var Scriptable = guidelib.model.Scriptable = guidelib.model.GuideNode.extend({
        msClassName : "scriptable",

        initialize : function () {
            Scriptable._super.initialize.call(this);
            
            this.className = this.jsonModel.guideNodeClass || this.msClassName;
            this._compiledExpressions = {};
            this._compiledScripts = {};
            this.mActiveEvents = [];
            this.dependants = [];
            
            if (this.initScript) {
                this._isInitScriptExecuted = false;
            }
            this._collectExpressions();
        },

        _postInitialize : function () {
            
            if (this._isXfaNode()) {
                this.bindNode = this.options.bindNode || this._getBindNode();
                if (this.bindNode) {
                    this.bindNode.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
                }
            }
            
            this._parentAccess = this.getOrElse(this, "parent.enabled", true);
        },

        _unloadModel : function () {
            if (this._isXfaNode && this._isXfaNode()) {
                if (this.bindNode) {
                    this.bindNode.off(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
                }
            }

            Scriptable._super._unloadModel.call(this);
        },

        _collectExpressions : function () {
            if (this.visibleExp) {
                this._compiledExpressions["visibleExp"] = this._compileExpression(this.visibleExp, "visible");
            }
            if (this.enabledExp) {
                this._compiledExpressions["enabledExp"] = this._compileExpression(this.enabledExp, "enabled");
            }
            
            if (this.initScript) {
                this._compiledScripts.initScript = this._compileExpression(this.initScript, null);
            }
        },

        _compileExpression : function (expression, affectedProp) {
            if (expression) {
                try {
                    
                    var content = affectedProp ? expressionContent.replace(/\${affectedProp}/g, '"' + affectedProp + '"')
                                                                  .replace(/\${expression}/g, expression.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/(?:\r\n|\r|\n)/g, " "))
                                               : scriptContent.replace(/\${expression}/g,
                                                                        expression.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/(?:\r\n|\r|\n)/g, " "));

                    return new Function(content);
                } catch (exception) {
                    this.logger().error("AF", "Error in compiling expression:" + expression);
                }
            }
            return null;
        },

        _isXfaNode : function () {
            return (this._xfa() && this.getOrElse(this, "jsonModel.bindRef", "").indexOf("xfa[0].form[0].") === 0);
        },

        _xfa : function () {
            return this.getOrElse(window, "xfalib.runtime.xfa", null);
        },

        prepare : function () {
            Scriptable._super.prepare.apply(this);
            
            
            
            
            
            if (this.initScript && !this._isInitScriptExecuted) {
                this.executeExpression("initScript");
                this._isInitScriptExecuted = true;
            }
            var expressionTypes = _.keys(this._compiledExpressions);
            this._guide().queueExpressions(this, expressionTypes);
        },

        
        handleEvent : function (evnt) {
            if (evnt instanceof xfalib.script.XfaModelEvent) {  
                switch (evnt.name) {
                    case xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED:
                        this._handleXfaModelChanged(evnt);
                        break;
                    default:
                    
                }
            } else if (evnt instanceof guidelib.event.GuideModelEvent) {
                this.handleGuideEvent(evnt);
            }
        },

        handleGuideEvent : function (evnt) {
        },

        
        executeExpression : function (eventName, detail) {
            if (this._isXfaNode() && this.bindNode instanceof xfalib.script.EventContainerNode) {
                if (guidelib.util.GuideUtil.xfaExprMap[eventName] !== null) {
                    this.bindNode.execEvent(guidelib.util.GuideUtil.xfaExprMap[eventName] || eventName, detail);
                }
            }
            if (_.isUndefined(this._compiledExpressions[eventName]) && _.isUndefined(this._compiledScripts[eventName])) {
                if (!this._guide()._currentContext) {
                    this._guide().runPendingExpressions();
                } else {
                    this.logger().log("AF", "executeExpression called withing from another executeExpression. Should NEVER happen ");
                }
                return true;
            }

            if (this.mActiveEvents[eventName]) {
                return;
            }
            this.mActiveEvents[eventName] = true;
            var managedExp = this._compiledExpressions[eventName] ? true : false;
            this._guide()._currentContext = {contextNode : this, expression : eventName, managedExp : managedExp};

            this._setExpressionContext(this, this.index);
            var $event = {
                name : eventName,
                target : this,
                data : detail
            };
            guidelib.runtime.$event = $event;
            var expResult = this._expressionHandler(eventName);
            this.mActiveEvents[eventName] = false;
            this._guide()._currentContext = null;
            guidelib.runtime.$event = null;
            this._guide().runPendingExpressions();
            return expResult;
        },

        _setExpressionContext : function (startNode, currentIndex) {
            
            var currentSom = this.somExpression;
            function somCommonPrefixLen(field) {
                return guidelib.util.GuideUtil.commonPrefixLen(currentSom, field.somExpression);
            }

            _.each(guidelib.internal.liveModel.getCrossFragmentFields(), function (fields, name) {
                var loadedFields,
                    nearestField;

                
                loadedFields = guidelib.internal.liveModel.getAllFieldModels(_.keys(fields));

                
                if (!_.isEmpty(loadedFields)) {
                    nearestField = _.max(loadedFields, somCommonPrefixLen);
                }

                
                
                this._guide()._createGetterSetter(guidelib.runtime, name, nearestField || fields[_.keys(fields)[0]]);
            }, this);

            
            guidelib.runtime._isOverriden = {};
            while (startNode) {
                startNode.nakedChildReferences(currentIndex, guidelib.runtime);
                currentIndex = startNode.index;
                startNode = startNode.parent;
            }
        },

        _expressionHandler : function (expressionName) {
            var expFn, returnValue;
            if (this._compiledExpressions[expressionName]) {
                expFn = this._compiledExpressions[expressionName];
                try {
                    returnValue = expFn.apply(this);
                } catch (exception) {
                    
                    this.logger().error("AF", "Error in compiling expression:" + this.name + ":" + expressionName + ":" + exception.stack);
                }
            } else if (this._compiledScripts[expressionName]) {
                expFn = this._compiledScripts[expressionName];
                try {
                    return expFn.apply(this);
                } catch (scriptException) {
                    
                    this.logger().error("AF", "Error in compiling expression:" + this.name + ":" + expressionName + ":" + scriptException.stack);
                }
            }
            return returnValue;
        },

        _handleXfaModelChanged : function (event) {
            if (event._property == "presence") {
                
                var newText = !(event.newText != "visible");
                this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, "visible", event.prevText, newText);
            } else if (event._property == "access") {
                this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                    guidelib.event.GuideModelEvent.createEvent(
                        guidelib.event.GuideModelEvent.MODEL_CHANGED,
                        this,
                        "enabled",
                        event.prevText == "open",
                        event.newText == "open"
                    )
                );
            }
        },

        _getScreenReaderText : function (index) {
            var screenReaderText, assistPriority = this._getAssistPriority();
            if (assistPriority == "custom") {
                screenReaderText = this._getCustomAssist(index) || this._getToolTip(index) || this._getCaption(index) || this._getName(index);
            } else if (assistPriority == "shortDescription") {
                screenReaderText = this._getToolTip(index) || this._getCaption(index) || this._getName(index);
            } else if (assistPriority == "label") {
                screenReaderText = this._getCaption(index) || this._getName(index);
            } else if (assistPriority == "name") {
                screenReaderText = this._getName(index);
            }
            return screenReaderText;
        },

        _getAssistPriority : function () {
            
            return this.getAttribute("assistPriority") || "custom";
        },

        _getCustomAssist : function () {
            var customAssist;
            if (this.bindNode && this.bindNode.assist && this.bindNode.assist.speak && this.bindNode.assist.speak.value) {
                customAssist = this.bindNode.assist.speak.value;
            } else if (this.jsonModel.custom) {
                customAssist = this.jsonModel.custom;
            }
            return customAssist;
        },

        _getToolTip : function () {
            return this.shortDescription;
        },

        _getCaption : function () {
            return this.getAttribute("jcr:title");
        },

        _getName : function (index) {
            return this.getAttribute("name");
        },

        _getBindNode : function () {
            var bindRef = this.getAttribute("bindRef");
            if (!bindRef) {
                return null;
            }
            var bindNode = null;
            var bindParent = this.parent ? this.parent._bindParent() : null;
            if (bindParent) {
                var bindParentRef = bindParent.getAttribute("bindRef");
                if (bindRef.substring(0, bindParentRef.length) == bindParentRef) {
                    
                    
                    var relativeBindRef = bindRef.substring(bindParentRef.length + 1); 
                    bindNode = bindParent.bindNode.resolveNode(relativeBindRef);
                }
            }
            if (!bindNode && this._isXfaNode()) {
                bindNode = this._xfa().resolveNode(bindRef);
            }
            return bindNode;
        },

        _bindParent : function () {
            if (this.bindNode) {
                return this;
            } else if (this.parent) {
                return this.parent._bindParent();
            }
            return null;
        },

        
        _getEnabled : function () {
            if (this.bindNode) {
                return this.bindNode.access == "open";
            } else {
                return this.getAttribute("enabled") && this._parentAccess;
            }
        },

        
        _setEnabled : function (value) {
            if (!this.bindNode) {
                if (this.getAttribute("enabled") !== value) {
                    var oldEnabled = this.getAttribute("enabled");
                    this.setAttribute(value, "enabled");
                    this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                        guidelib.event.GuideModelEvent.createEvent(
                            guidelib.event.GuideModelEvent.MODEL_CHANGED,
                            this,
                            "enabled",
                            oldEnabled,
                            this.jsonModel.enabled
                        )
                    );
                    this._triggerOnBridge("elementEnableChanged", this, "enablement", oldEnabled, this.jsonModel.enabled);
                }

            } else {
                var convertor = this._guide()._guideSchema.getConvertor("enabled");
                if (convertor) {
                    this.bindNode.access =  convertor.guideToXfa.apply(this, [value]);
                }
            }
        },

        
        _setParentAccess : function (value) {
            var oldValue = this._parentAccess;
            this._parentAccess = value;
            this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.MODEL_CHANGED,
                    this,
                    "enabled",
                    oldValue,
                    this.enabled
                )
            );
        }

    });

    Scriptable.defineProps({
        
        shortDescription : {
            get : function () {
               return this.getAttribute("shortDescription");
           }
        },

        
        longDescription : {
            get : function () {
                return this.getAttribute("longDescription");
            }
        },

        visibleExp : {
            get : function () {
                return this.getAttribute("visibleExp");
            }
        },

        initScript : {
            get : function () {
                return this.jsonModel.initScript;
            }
        },

        enabledExp : {
            get : function () {
                return this.getAttribute("enabledExp");
            }
        },

        
        visible : {
            get : function () {
                return this.getAttribute("visible");
            },

            set : function (value) {
                if (!this.bindNode) {
                    if (this.getAttribute("visible") !== value) {
                        var oldVisible = this.getAttribute("visible"),
                            dorExclusionFlag;
                        this.setAttribute(value, "visible");
                        
                        
                        if (this.getAttribute("dorExclusion") !== null) {
                            if ((this._guide().getAttribute("excludeFromDoRIfHidden") === "true") 
                                || (this._guide().print
                                && this._guide().print["excludeFromDoRIfHidden"] === "true")) {
                                dorExclusionFlag = !value;
                                
                                
                                this.dorExclusion = dorExclusionFlag;
                            }
                        }
                        this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                            guidelib.event.GuideModelEvent.createEvent(
                                guidelib.event.GuideModelEvent.MODEL_CHANGED,
                                this,
                                "visible",
                                oldVisible,
                                this.jsonModel.visible
                            )
                        );
                        this._triggerOnBridge("elementVisibleChanged", this, "visible", oldVisible, this.jsonModel.visible);

                    }
                } else {
                    if (value == true) {
                        this.bindNode.presence = "visible";
                    } else {
                        this.bindNode.presence = "hidden";
                    }
                }
            }
        },

        
        dorExclusion : {
            get : function () {
                
                if (this.jsonModel.dorExclusion != null) {
                    if (_.isString(this.jsonModel.dorExclusion)) {
                        
                        return this.jsonModel.dorExclusion === "true";
                    } else {
                        return this.jsonModel.dorExclusion;
                    }
                }
                
                else if ((this._guide().getAttribute("excludeFromDoRIfHidden") === "true") 
                    || (this._guide().print
                    && this._guide().print["excludeFromDoRIfHidden"] === "true")) {
                    return !this.visible;
                } else {
                    
                    return false;
                }
            },

            set : function (value) {
                
                
                
                var somExpr = this.somExpression;
                somExpr = somExpr.substring(this._guide().somExpression.length + 1);
                this._guide()._addToExcludeFromDorMap(somExpr, value);
                this.jsonModel.dorExclusion = value;
            }
        },

        
        enabled : {
            get : function () {
                return this._getEnabled();
            },

            set : function (value) {
                
                this._setEnabled(!!value);
            }
        },

        
        bindRef : {
            get : function () {
                return (this.getAttribute("bindRef") || "").replace(/\s+/g, '');
            }
        },

        
        isXsd : {
            
            get : function () {
                return _.isString(guideBridge._guide.xsdRef) && !_.isEmpty(this.bindRef) && this.bindRef[0] === '/';
            }
        }
    });
})(_, window.xfalib, guidelib);

(function (_, guidelib) {

    
    var Field = guidelib.model.Field = guidelib.model.Scriptable.extend({
        msClassName : "field",
        
        _runValidation : true,
        initialize : function () {
            Field._super.initialize.call(this);
            this.jsonModel["{default}"] = this.getOrElse(this.jsonModel, "{default}", this.jsonModel._value);
            this.isValid = true;
            this.forceErrorShow = false;
            
            this._bParentValidationsDisabled = false;
            
            this._validationsDisabled = false;
            
            this._failedTest = null;

            
            this._errorText = "";

            var effectiveBindRef = this.bindRef || this.getAttribute("name");
            if (this.isGlobal || guidelib.internal.liveModel.isLive(effectiveBindRef)) {
                guidelib.internal.liveModel.add(effectiveBindRef, this);
            }
        },

        _unloadModel : function () {
            var effectiveBindRef = this.bindRef || this.getAttribute("name");
            if (this.isGlobal || guidelib.internal.liveModel.isLive(effectiveBindRef)) {
                guidelib.internal.liveModel.remove(effectiveBindRef, this);
            }
            Field._super._unloadModel.call(this);
        },

        _collectExpressions : function () {
            Field._super._collectExpressions.apply(this);
            if (this.calcExp) {
                this._compiledExpressions.calcExp = this._compileExpression(this.calcExp, "value");
            }
            if (this.validateExp) {
                
                this._compiledScripts.validateExp = this._compileExpression(this.validateExp, null);
            }
            if (this.valueCommitScript) {
                
                
                this._compiledScripts.valueCommitScript = this._compileExpression(this.valueCommitScript, null);
            }
            
            this._compiledScripts.validateAllExp = this._compileExpression("this._runTests()", null);
        },

        _handleXfaModelChanged : function (event) {
            if (event._property === "rawValue") {
                this._triggerEvent(guidelib.event.GuideModelEvent.VALUE_CHANGED, "value",
                    event.prevText, event.newText);
            } else if (event._property == "ClearError" || event._property == "ValidationState") {
                
                this._guide().queueExpressions(this, ["validateAllExp"]);
            } else {
                Field._super._handleXfaModelChanged.call(this, event);
            }
        },

        
        
        validate : function (errorList) {
            
            if (!this.visible) {
                return true;
            }
            if (_.isUndefined(errorList)) {
                errorList = [];
            }
            var status = true;
            this._runTests(true);
            if (this._errorText) {
                errorList.push({
                    som : this.somExpression,
                    errorText : this._errorText
                });
                status = false;
            }
            return status;
        },

        _getTypedValue : function (value) {
            if (this.checkIfNull(value)) {
                return null;
            }
            return value + "";
        },

        _getFormattedValue : function (value) {
            if (_.isUndefined(value) || value === null || value === "") {
                return null;
            }

            var picture = this.jsonModel.displayPictureClause;
            
            if (picture) {
                try {
                    
                    var formattedValue = xfalib.ut.PictureFmt.format(value + "", picture, null, true);
                    
                    return formattedValue != null && formattedValue !== "" ? formattedValue : value;
                } catch (exception) {
                    
                }
            }
            return value;
        },

        _getValue : function () {
            if (this.bindNode) {
                return this.bindNode.rawValue;
            }
            return this._getTypedValue(this.jsonModel._value);
        },

        _triggerDisplayFormatChange : function () {
            var currValue = this._getValue();
            this._triggerEvent(guidelib.event.GuideModelEvent.VALUE_CHANGED, "value",
                currValue, this._getFormattedValue(currValue));
        },

        
        checkIfNull : function (value) {
            return value == null || value === ""; 
        },

        
        isEmpty : function () {
            return this.checkIfNull(this.value);
        },

        _setXFAValue : function (value) {
            this.bindNode.rawValue = value;
        },

        
        _setXFAMandatory : function (value) {
            
            
            var convertor = this._guide()._guideSchema.getConvertor("mandatory");
            if (convertor) {
                
                
                this.bindNode.validate.nullTest = convertor.guideToXfa.apply(this, [!!value]);
            }
        },

        _setGuideValue : function (value) {
            this.jsonModel._value = (value === undefined || value === null) ? null : value;
        },

        _runMandatoryTest : function () {
            var currValue = this._getValue(),
                isNull = this.checkIfNull(currValue);
            return !isNull;
        },

        _runValidatePictureTest : function () {
            var value = this._getValue(),
                validateFlag = true,
                regex;
            if (!this.checkIfNull(value) && this.validatePictureClause) {
                
                try {
                    value = xfalib.ut.PictureFmt.format(value + "", this.validatePictureClause, null, false);
                } catch (exception) {
                    
                    this.logger().log("AF", exception);
                    
                    if (exception.indexOf("Invalid picture clause") !== -1) {
                        value = undefined;
                    } else {
                        value = null;
                    }
                }
            }
            if (_.isUndefined(value)) {
                try {
                    
                    regex = new RegExp(this.validatePictureClause);
                    if (regex) {
                        validateFlag = regex.test(this._getValue());
                    }
                } catch (exception) {
                    
                    this.logger().error("AF", "Invalid Regular Expression" + exception);
                    validateFlag = false;
                }
            } else if (value === null) {
                validateFlag = false;
            }

            return validateFlag;
        },

        
        _runTests : function (forceRun) {
            
            var validFlag = true,
                prevErrorText = this._errorText,
                prevValidationState = this.validationState,
                obj = {
                    'validFlag' : validFlag,
                    'forceRun' : forceRun
                };

            if (this.validationsDisabled === true) {
                
                
                return true;
            }

            this._runValidations(obj);
            validFlag = obj.validFlag;

            if (validFlag) {
                this._errorText = "";
                this.validationState = true;
                
                this._failedTest = null;
            } else {
                this.validationState = false;
            }
            
            if ((prevErrorText !== this._errorText) || (prevValidationState !== this.validationState) || forceRun) {
                
                if (forceRun) {
                    this.forceErrorShow = true;
                }
                this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_CHANGED,
                    "validationStatus", this.validationState, this._errorText);
            }

            return this.validationState;
        },

        playJson : function (pJsonModel) {
            this.jsonModel._value = pJsonModel._value;
        },

        
        _runValidations : function (obj) {
            var isRegex = false,
                INVALID_PICTURE_CLAUSE_LIST = ["date.default{}", "date.short{}", "date.medium{}",
                    "date.long{}", "date.full{}", "num.percent{}", "num.decimal{}", "num.currency{}"];
            if (this.bindNode) {
                if (this.validatePictureClause && (this.value || this.value === 0)) {
                    
                    
                    try {
                        xfalib.ut.PictureFmt.format(this.value + "", this.validatePictureClause, null, false);
                    } catch (exception) {
                        if (INVALID_PICTURE_CLAUSE_LIST.indexOf(this.validatePictureClause) >= 0) {
                            isRegex = false;
                        } else if (exception.indexOf("Invalid picture clause") !== -1) {
                            isRegex = true;
                        }
                    }
                }
                if (isRegex) {
                    try {
                        
                        var regex = new RegExp(this.validatePictureClause);
                        if (regex) {
                            obj.validFlag = regex.test(this._getValue());
                        }
                    } catch (exception) {
                        this.logger().error("AF", "Error in running regular expression" + exception);
                        obj.validFlag = false;
                    }
                    if (!obj.validFlag) {
                        this.bindNode._setErrorData("formatTest", this.getOrElse(this.bindNode.validate.formatTest, this.bindNode._defaults.validate.formatTest), this.bindNode.formatMessage);
                        this._errorText = this.bindNode._errorText;
                        xfalib.ut.XfaUtil.prototype._triggerOnBridge("elementValidationStatusChanged", this.bindNode, "validationStatus", false, true);
                        this.bindNode.execEvent("validationState");
                    }
                } else {
                    if (obj.forceRun) {
                        this.bindNode.execValidate();
                    }
                    this._errorText = this.bindNode._errorText;
                    if (this._errorText) {
                        obj.validFlag = false;
                    }
                }
                
                this._failedTest = this.bindNode._mFailedValTest;
            } else {
                
                if (this.mandatory) {
                    obj.validFlag = this._runMandatoryTest();
                    if (!obj.validFlag) {
                        this._errorText = this.mandatoryMessage;
                        this._failedTest = this.guideUtil.MANDATORY_TEST;
                    }
                }
                if (obj.validFlag && this.validatePictureClause && !this.checkIfNull(this.value)) {
                    obj.validFlag = this._runValidatePictureTest();
                    if (!obj.validFlag) {
                        this._errorText = this.validatePictureClauseMessage;
                        this._failedTest = this.guideUtil.FORMAT_TEST;
                    }
                }
            }

            if (obj.validFlag && this.validateExp) {
                obj.validFlag = this.executeExpression("validateExp");
                if (!obj.validFlag) {
                    this._errorText = this.validateExpMessage;
                    this._failedTest = this.guideUtil.SCRIPT_TEST;
                }
            }
        },

        _collectValues : function (keyValue) {
            
            keyValue[this.name] = this.value;
        },

        
        resetData : function () {
            this._runValidation = false;
            this.value = this.jsonModel["{default}"];
            this._runValidation = true;
            
            this._errorText = "";
            this.validationState = true;
            this._failedTest = null;
            this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_RESET,
                "validationStatus", this.validationState, this._errorText);
        },

        _preserveLazyValue : function () {
            return !(_.contains(['guideButton', 'guideTextDraw', 'guideAdobeSignBlock'], this.className) || this._isXfaNode());
        },

        
        _updateLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            if (this._preserveLazyValue()) {
                var dataUtils = guidelib.internal.liveDataUtils,
                    dataContext = dataUtils._getDataContext(this, bound_indexedXpathSoFar,
                        unBound_indexedXpathSoFar);
                dataUtils.setDataValue(dataContext.indexedXpath, dataContext.xmlSec,
                    !this.isEmpty(), this.isEmpty() ? "" : this.value);
            }
        },

        
        _playLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            if (this._preserveLazyValue()) {
                var dataUtils = guidelib.internal.liveDataUtils,
                    dataContext = dataUtils._getDataContext(this, bound_indexedXpathSoFar,
                        unBound_indexedXpathSoFar);
                var value = dataUtils.getDataValue(dataContext.indexedXpath,
                    dataContext.xmlSec);
                if (value != undefined) {
                    this.value = value;
                }
            }
        },

        
        _allowEmptyValueString : function () {
            return false;
        }

    });

    Field.defineProps({
        calcExp : {
            get : function () {
                return this.getAttribute("calcExp");
            }
        },

        
        isGlobal : {
            get : function () {
                return this.getAttribute('isGlobal') === "true";
            }
        },

        
        title : {
            get : function () {
                return this.getAttribute("jcr:title");
            },
            set : function (title) {
                this.setAttribute(title, "jcr:title");
            }
        },

        valueCommitScript : {
            get : function () {
                return this.getAttribute("valueCommitScript");
            }
        },

        validateExp : {
            get : function () {
                return this.getAttribute("validateExp");
            }
        },

        
        placeholderText : {
            get : function () {
                return this.getAttribute("placeholderText");
            }
        },

        
        value : {
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.managedExp
                    
                    && !(context.contextNode === this
                    && context.expression === "calcExp")) {
                    
                    this._addDependant(context.contextNode, context.expression);
                }
                return this._getValue();
            },
            set : function (newValue) {
                var oldValue = this._getValue(),
                    newTypedValue = this._getTypedValue(newValue),
                    _guide = this._guide();
                
                if (this._allowEmptyValueString() && newValue === "") {
                    newTypedValue = "";
                }

                
                if (newTypedValue !== undefined && (newTypedValue !== oldValue)) {
                    if (this.bindNode) {
                        this._setXFAValue(newTypedValue);
                    } else if (this.jsonModel._value !== newValue) {
                        this._setGuideValue(newTypedValue);
                    }
                    if (_guide.version.isOn(_guide.version.Flags.RUN_VALUE_COMMMIT_ON_SCRIPT_CHANGE)) {
                        var context = _guide._currentContext,
                            contextNode = this.getOrElse(context, "contextNode", null),
                            contextExpression = this.getOrElse(context, "expression", null);
                        if (!context || contextNode != this || contextExpression != "valueCommitScript") {
                            
                            _guide.queueExpressions(this, ["valueCommitScript"]);
                        }
                    }
                    
                    this._notifyDependants();
                    
                    if (this._runValidation) {
                        _guide.queueExpressions(this, ["validateAllExp"]);
                    }
                    this._triggerOnBridge("elementValueChanged", this, "value", oldValue, newTypedValue);
                    
                    
                    if (!this.bindNode || (this.bindNode && this.getAttribute("html5Type") !== undefined)) {
                        this._triggerDisplayFormatChange();
                    }
                }
            }
        },

        
        formattedValue : {
            get : function () {
                var value;
                if (this.bindNode) {
                    value = this.bindNode.formattedValue;
                } else {
                    value = this._getFormattedValue(this._getValue());
                }
                return value;
            }
        },

        
        displayPictureClause : {
            get : function () {
                return this.getAttribute("displayPictureClause");
            }
        },

        
        validatePictureClause : {
            get : function () {
                if (this.jsonModel.displayIsSameAsValidate) {
                    return this.displayPictureClause;
                }
                return this.getAttribute("validatePictureClause");
            }
        },

        
        editPictureClause : {
            get : function () {
                if (this.jsonModel.isEditSameAsDisplayPattern) {
                    return this.displayPictureClause;
                }
                return this.getAttribute("editPictureClause");
            }
        },

        
        mandatory : {
            get : function () {
                return this.getAttribute("mandatory");
            },

            set : function (newValue) {
                var oldValue = this.getAttribute("mandatory");
                if (newValue !== undefined && oldValue !== newValue) {
                    if (this.bindNode) {
                        this._setXFAMandatory(newValue);
                    } else {
                        
                        this.jsonModel.mandatory = !!newValue;
                    }
                    
                    this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, "mandatory", oldValue, newValue);
                }
            }
        },

        
        mandatoryMessage : {
            get : function () {
                return this.getAttribute("mandatoryMessage");
            }
        },

        
        validateExpMessage : {
            set : function (message) {
                
                if (this.isValid) {
                    this.jsonModel.validateExpMessage = message;
                } else {
                    this.setAttribute(message, "validateExpMessage");
                }
            },
            get : function () {
                return this.getAttribute("validateExpMessage");
            }
        },

        
        validatePictureClauseMessage : {
            get : function () {
                return this.getAttribute("validatePictureClauseMessage");
            }
        },

        
        validationState : {
            get : function () {
                return this.isValid;
            },
            set : function (newValue) {
                var oldVal = this.isValid;
                if (oldVal != newValue) {
                    this.isValid = newValue;
                    this._triggerOnBridge("elementValidationStatusChanged", this,
                        "validationStatus", oldVal, newValue);
                }
            }
        },
        
        width : {
            get : function () {
                return this.getAttribute("width");
            },

            set : function (newValue) {
                this.jsonModel.width = newValue;
            }
        },
        
        height : {
            get : function () {
                return this.getAttribute("height");
            },

            set : function (newValue) {
                this.jsonModel.height = newValue;
            }
        },
        
        cssClassName : {
            get : function () {
                return this.getAttribute("css");
            }
        }
    });

    Field.addMixins([
        guidelib.model.mixin.AddDependencyMgmt,
        guidelib.model.mixin.ValidationsDisabled
    ]);
}(_, guidelib));


(function (_, guidelib) {

    
    var GuideNumericBox = guidelib.model.GuideNumericBox = guidelib.model.Field.extend({
        msClassName : "guideNumericBox",

        _getTypedValue : function (value) {
            var dataType = this.dataType,
                tmpValue, str, leadD, fracD;

            if (this.checkIfNull(value)) {
                return null;
            }
            switch (dataType) {
            case "integer":
                tmpValue = parseInt(value);
                break;
            case "float":
                tmpValue = parseFloat(value);
                break;
            case "decimal":
                tmpValue = parseFloat(value);
                if (!isNaN(tmpValue)) {
                    str =  tmpValue.toString();
                    leadD = str.indexOf(".");
                    leadD = leadD === -1 ? str.length : leadD;
                    fracD = str.length - leadD - 1;
                    if (fracD > this.fracDigits && this.fracDigits !== -1) {
                        tmpValue = parseFloat(tmpValue.toFixed(this.fracDigits));
                    }
                    if (leadD > this.leadDigits && this.leadDigits !== -1) {
                        return undefined;
                    }
                }
                break;
            }
            if (isNaN(tmpValue)) {
                return undefined;
            }
            return tmpValue;
        },
        _getFormattedValue : function (value) {
            if (_.isUndefined(value) || value === null || value === "") {
                return null;
            }

            var picture = this.jsonModel.displayPictureClause,
                defaultPattern = "zzzzzzzzzzzzzzzzzzzzz.zzzzzzzzzzzzzzz";

            
            try {
                if (picture && this.jsonModel.html5Type !== "number") {
                    
                    return xfalib.ut.PictureFmt.format(value + "", picture, null, true);
                } else {
                    var pattern = (this.jsonModel.html5Type === "number") ? defaultPattern : guidelib.i18n.numberPatterns.numeric;
                    return xfalib.ut.PictureFmt.format(value + "", "num{" + pattern + "}",
                        guideBridge._readRuntimeLocale(), true, true);
                }
            } catch (exception) {
                this.logger().error("Cannot format value " + value + " " + exception);
                
                return value;
            }
        },

        
        _runTotalDigitTest : function () {
            if (this.dataType === "integer") {
                return this.value.toString().length <= this.leadDigits;
            }
            return true;
        },

        
        _runValidations : function (obj) {
            var value = this.value;
            GuideNumericBox._super._runValidations.call(this, obj);
            this._minMaxValidation(value, obj);
            if (value && obj.validFlag && this.leadDigits > -1) {
                obj.validFlag = this._runTotalDigitTest();
                if (!obj.validFlag) {
                    this._errorText = guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.strings.totalDigitMessage, [this.leadDigits]);
                    this._failedTest = this.guideUtil.TOTAL_DIGITS_TEST;
                }
            }
        }
    });
    GuideNumericBox.defineProps({
        
        dataType : {
            get : function () {
                return this.getAttribute("dataType");
            }
        },

        
        leadDigits : {
            get : function () {
                return this.getAttribute("leadDigits");
            }
        },

        
        fracDigits : {
            get : function () {
                return this.getAttribute("fracDigits");
            }
        }
    });

    GuideNumericBox.addMixins([
        guidelib.model.mixin.AddMinMaxValidation
    ]);

})(_, guidelib);



(function (_, guidelib) {
    
    var GuideButton = guidelib.model.GuideButton = guidelib.model.Field.extend({
        msClassName : "guideButton",
        defaultClickExpressions : {
            "moveNext" : "window.guideBridge.setFocus(this.panel.somExpression, 'nextItem', true)",
            "movePrev" : "window.guideBridge.setFocus(this.panel.somExpression, 'prevItem', true)"
        },
        defaultNavigationExpressions : {
            "moveNext" : "this.visible=this.panel.navigationContext.hasNextItem",
            "movePrev" : "this.visible=this.panel.navigationContext.hasPrevItem"
        },

        _collectExpressions : function () {
            GuideButton._super._collectExpressions.apply(this);
            if (this.clickExp) {
                this._compiledScripts["clickExp"] = this._compileExpression(this.clickExp, null);
            } else if (this.targetVersion >= 1.1 && this.defaultClickExpressions[this.type]) {                  
                this.jsonModel.clickExp = this.defaultClickExpressions[this.type];                              
                this._compiledScripts["clickExp"] = this._compileExpression(this.clickExp, null);               
            }
            if (this.navigationChangeExp) {
                this._compiledScripts["navigationChangeExp"] = this._compileExpression(this.navigationChangeExp, null);
            } else if (this.targetVersion >= 1.1 &&  this.defaultNavigationExpressions[this.type]) {
                this.jsonModel.navigationChangeExp = this.defaultNavigationExpressions[this.type];
                this._compiledScripts["navigationChangeExp"] = this._compileExpression(this.navigationChangeExp, null);
            }
        },

    });

    GuideButton.defineProps({
        clickExp : {
            get : function () {
                return this.jsonModel.clickExp;
            }
        },
        navigationChangeExp : {
            get : function () {
                return this.jsonModel.navigationChangeExp;
            }
        },
        
        type : {
            get : function () {
                return this.getAttribute("type");
            }
        }
    });
})(_, guidelib);


(function (_, guidelib) {
    var GuideListFileAttachmentButton = guidelib.model.GuideListFileAttachmentButton = guidelib.model.GuideButton.extend({
        msClassName : "guideListFileAttachmentButton",
        initialize : function () {
            
            if (_.isUndefined(this.jsonModel.clickExp)) {
                this.jsonModel.clickExp = "guideBridge._updateFileListing.call(this,this)";

            }
            GuideListFileAttachmentButton._super.initialize.apply(this, arguments);
        }
    });

})(_, guidelib);

(function (_, guidelib) {
    
    var GuideTextBox = guidelib.model.GuideTextBox = guidelib.model.Field.extend({
        msClassName : "guideTextBox",

        
        _runMinimumLengthTest : function () {
            return this.value.length >= this.minLength;
        },

        
        _runTotalLengthTest : function () {
            return this.value.length === this.length;
        },

        
        _runValidations : function (obj) {
            var value = this.value;
            GuideTextBox._super._runValidations.call(this, obj);

            if (value && obj.validFlag) {

                if (this.length != null) {
                    obj.validFlag = this._runTotalLengthTest();
                    if (!obj.validFlag) {
                        this._errorText = this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.totalLengthMessage, [this.length]);
                        this._failedTest = this.guideUtil.LENGTH_TEST;
                    }
                } else if (this.minLength != null) {
                    obj.validFlag = this._runMinimumLengthTest();
                    if (!obj.validFlag) {
                        this._errorText = this.guideUtil.getLocalizedMessage("", guidelib.i18n.strings.minimumLengthMessage, [this.minLength]);
                        this._failedTest = this.guideUtil.MINIMUM_LENGTH_TEST;
                    }
                }

            }
        },

        _allowEmptyValueString : function () {
            return true;
        }

    });

    GuideTextBox.defineProps({
        
        "multiLine" : {
            get : function () {
                return this.getAttribute("multiLine");
            }
        },

        
        "maxChars" : {
            get : function () {
                return this.getAttribute("maxChars");
            }
        },

        
        "minLength" : {
            get : function () {
                return this.getAttribute("minLength");
            }
        },

        
        "length" : {
            get : function () {
                return this.getAttribute("length");
            }
        },
        
        "allowRichText" : {
            get : function () {
                return this.getAttribute("allowRichText");
            }
        }
    });

}(_, guidelib));


(function (_, guidelib) {
    
    var countriesDialingCodesMap = {
        '441481' : 'Guernsey',
        '441624' : 'Isle of Man',
        '441534' : 'Jersey',
        '1868' : 'Trinidad and Tobago',
        '1473' : 'Grenada',
        '1670' : 'Northern Mariana Islands',
        '1869' : 'Saint Kitts and Nevis',
        '1758' : 'Saint Lucia',
        '1671' : 'Guam',
        "1684" : "American Samoa",
        "1268" : "Antigua and Barbuda",
        "1264" : "Anguilla",
        "1242" : "Bahamas",
        "1246" : "Barbados",
        '1441' : 'Bermuda',
        '1284' : 'British Virgin Islands',
        '1345' : 'Cayman Islands',
        '1787' : 'Puerto Rico',
        '1876' : 'Jamaica',
        '1939' : 'Puerto Rico',
        '1767' : 'Dominica',
        '1809' : 'Dominican Republic',
        '1829' : 'Dominican Republic',
        '1664' : 'Montserrat',
        '1849' : 'Dominican Republic',
        '1340' : 'U.S. Virgin Islands',
        '1784' : 'Saint Vincent and the Grenadines',
        '1649' : 'Turks and Caicos Islands',
        '1721' : 'Sint Maarten',
        "355" : "Albania",
        "213" : "Algeria",
        "376" : "Andorra",
        "244" : "Angola",
        "672" : "Antarctica",
        "374" : "Armenia",
        "297" : "Aruba",
        "994" : "Azerbaijan",
        "973" : "Bahrain",
        "880" : "Bangladesh",
        "375" : "Belarus",
        "501" : "Belize",
        "229" : "Benin",
        '975' : 'Bhutan',
        '591' : 'Bolivia',
        '387' : 'Bosnia and Herzegovina',
        '267' : 'Botswana',
        '246' : 'British Indian Ocean Territory',
        '673' : 'Brunei',
        '359' : 'Bulgaria',
        '226' : 'Burkina Faso',
        '257' : 'Burundi',
        '855' : 'Cambodia',
        '237' : 'Cameroon',
        '238' : 'Cape Verde',
        '236' : 'Central African Republic',
        '235' : 'Chad',
        '269' : 'Comoros',
        '682' : 'Cook Islands',
        '506' : 'Costa Rica',
        '385' : 'Croatia',
        
        '357' : 'Cyprus',
        '420' : 'Czech Republic',
        '243' : 'Democratic Republic of the Congo',
        '253' : 'Djibouti',
        '670' : 'East Timor',
        '593' : 'Ecuador',
        '503' : 'El Salvador',
        '240' : 'Equatorial Guinea',
        '291' : 'Eritrea',
        '372' : 'Estonia',
        '251' : 'Ethiopia',
        '500' : 'Falkland Islands',
        '298' : 'Faroe Islands',
        '679' : 'Fiji',
        '358' : 'Finland',
        '689' : 'French Polynesia',
        '241' : 'Gabon',
        '220' : 'Gambia',
        '995' : 'Georgia',
        '233' : 'Ghana',
        '350' : 'Gibraltar',
        '299' : 'Greenland',
        '502' : 'Guatemala',
        '224' : 'Guinea',
        '245' : 'Guinea-Bissau',
        '592' : 'Guyana',
        '509' : 'Haiti',
        '504' : 'Honduras',
        '852' : 'Hong Kong',
        '354' : 'Iceland',
        '964' : 'Iraq',
        '353' : 'Ireland',
        '972' : 'Israel',
        '225' : 'Ivory Coast',
        '962' : 'Jordan',
        '254' : 'Kenya',
        '686' : 'Kiribati',
        '383' : 'Kosovo',
        '965' : 'Kuwait',
        '996' : 'Kyrgyzstan',
        '856' : 'Laos',
        '371' : 'Latvia',
        '961' : 'Lebanon',
        '266' : 'Lesotho',
        '231' : 'Liberia',
        '218' : 'Libya',
        '423' : 'Liechtenstein',
        '370' : 'Lithuania',
        '352' : 'Luxembourg',
        '853' : 'Macau',
        '389' : 'Macedonia',
        '261' : 'Madagascar',
        '265' : 'Malawi',
        '960' : 'Maldives',
        '223' : 'Mali',
        '356' : 'Malta',
        '692' : 'Marshall Islands',
        '222' : 'Mauritania',
        '230' : 'Mauritius',
        
        '691' : 'Micronesia',
        '373' : 'Moldova',
        '377' : 'Monaco',
        '976' : 'Mongolia',
        '382' : 'Montenegro',
        
        '258' : 'Mozambique',
        '264' : 'Namibia',
        '674' : 'Nauru',
        '977' : 'Nepal',
        '599' : 'Netherlands Antilles',
        '687' : 'New Caledonia',
        '505' : 'Nicaragua',
        '227' : 'Niger',
        '234' : 'Nigeria',
        '683' : 'Niue',
        '850' : 'North Korea',
        '968' : 'Oman',
        '680' : 'Palau',
        '970' : 'Palestine',
        '507' : 'Panama',
        '675' : 'Papua New Guinea',
        '595' : 'Paraguay',
        '351' : 'Portugal',
        '974' : 'Qatar',
        '242' : 'Republic of the Congo',
        '262' : 'Reunion',
        '250' : 'Rwanda',
        
        '290' : 'Saint Helena',
        '590' : 'Saint Martin',
        '508' : 'Saint Pierre and Miquelon',
        '685' : 'Samoa',
        '378' : 'San Marino',
        '239' : 'Sao Tome and Principe',
        '966' : 'Saudi Arabia',
        '221' : 'Senegal',
        '381' : 'Serbia',
        '248' : 'Seychelles',
        '232' : 'Sierra Leone',
        '421' : 'Slovakia',
        '386' : 'Slovenia',
        '677' : 'Solomon Islands',
        '252' : 'Somalia',
        '211' : 'South Sudan',
        '249' : 'Sudan',
        '597' : 'Suriname',
        '268' : 'Swaziland',
        '963' : 'Syria',
        '886' : 'Taiwan',
        '992' : 'Tajikistan',
        '255' : 'Tanzania',
        '228' : 'Togo',
        '690' : 'Tokelau',
        '676' : 'Tonga',
        '216' : 'Tunisia',
        '993' : 'Turkmenistan',
        '688' : 'Tuvalu',
        '256' : 'Uganda',
        '380' : 'Ukraine',
        '971' : 'United Arab Emirates',
        '598' : 'Uruguay',
        '998' : 'Uzbekistan',
        '678' : 'Vanuatu',
        '379' : 'Vatican',
        '681' : 'Wallis and Futuna',
        '212' : 'Western Sahara',
        '967' : 'Yemen',
        '260' : 'Zambia',
        '263' : 'Zimbabwe',
        '60' : 'Malaysia',
        '58' : 'Venezuela',
        '30' : 'Greece',
        '84' : 'Vietnam',
        '44' : 'United Kingdom',
        '45' : 'Denmark',
        '53' : 'Cuba',
        '46' : 'Sweden',
        '52' : 'Mexico',
        '41' : 'Switzerland',
        '40' : 'Romania',
        
        '36' : 'Hungary',
        
        "43" : "Austria",
        '34' : 'Spain',
        '91' : 'India',
        '62' : 'Indonesia',
        '98' : 'Iran',
        '94' : 'Sri Lanka',
        '27' : 'South Africa',
        '95' : 'Myanmar',
        '65' : 'Singapore',
        '39' : 'Italy',
        '82' : 'South Korea',
        "32" : "Belgium",
        '81' : 'Japan',
        '31' : 'Netherlands',
        '20' : 'Egypt',
        "54" : "Argentina",
        "93" : "Afghanistan",
        
        '56' : 'Chile',
        '86' : 'China',
        '51' : 'Peru',
        '63' : 'Philippines',
        '64' : 'Pitcairn',
        '48' : 'Poland',
        '47' : 'Norway',
        '33' : 'France',
        
        '61' : 'Cocos Islands',
        '55' : 'Brazil',
        '92' : 'Pakistan',
        '49' : 'Germany',
        '57' : 'Colombia',
        '66' : 'Thailand',
        '90' : 'Turkey',
        
        '1' : 'Canada',
        
        '7' : 'Russia'
    };

    var GuideTelephone = guidelib.model.GuideTelephone = guidelib.model.GuideTextBox.extend({
        msClassName : "guideTelephone",

        _extractNumericDigits : function (telephoneNumber) {
            var digitArray,
                number = "";
            if (telephoneNumber) {
                digitArray = telephoneNumber.match(/\d+/g);
                if (digitArray) {
                    number = digitArray.join("");
                }
            }
            return number;
        },

        _extractCountryCode : function () {
            var value = this._getValue(),
                number = this._extractNumericDigits(value);
            if (!(number || (value && value.lastIndexOf("+", 0) === 0))) {
                return "";
            }
            for (var countryCode in countriesDialingCodesMap) {
                if (number && number.lastIndexOf(countryCode, 0) === 0) {
                    return countryCode;
                }
            }
            return "";
        },

        _extractPhoneNumber : function () {
            var countryCode = this.countryCode,
                number = this._extractNumericDigits(this._getValue()),
                phoneNumber = "";
            if (number) {
                phoneNumber = number.substr(countryCode.length);
            }
            return phoneNumber;
        }
    });

    GuideTelephone.defineProps({
        countryCode : {
            get : function () {
                return this._extractCountryCode();
            }
        },
        phoneNumber : {
            get : function () {
                return this._extractPhoneNumber();
            }
        }
    });

}(_, guidelib));


(function (_, guidelib) {
    var GuideCheckBox = guidelib.model.GuideCheckBox = guidelib.model.Field.extend({
        msClassName : "guideCheckBox",

        getOnOffValues : function (index) {
            var temp = this.jsonModel.options || [], items = [], on, off;
            if (this.bindNode) {
                on = this.bindNode.getSaveItem(0);
                off = this.bindNode.getSaveItem(1);
            } else {

                if (temp.length == 0) {
                    on = "0";
                } else {
                    on = temp[index].split('=')[0].trim();
                }
                off = "-100";
            }

            items = [on, off];
            return items;
        },

        _setXFAValue : function (value) {
            
            if (value === "" || value === null) {
                this.bindNode.rawValue = this.bindNode.getSaveItem(1);
            } else {
                this.bindNode.rawValue = value;
            }
        },
        _getCustomAssist : function (index) {
            var customAssist, item;

            if (index == null) {

                if (this.bindNode && this.bindNode.assist && this.bindNode.assist.speak && this.bindNode.assist.speak.value) {
                    return this.bindNode.assist.speak.value;
                }
                return null;
            }

            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);
                if (item && item.assist && item.assist.speak && item.assist.speak.value) {
                    customAssist = item.assist.speak.value;
                }
            } else if (this.jsonModel.custom) {

                var custom;
                custom = this.jsonModel.custom || [];
                if (_.isString(custom) && index <= 0) {
                    customAssist = custom;
                } else if (!custom.length == 0) {
                    customAssist = custom[index];
                }
            }
            return customAssist;
        },
        _getToolTip : function (index) {
            var toolTip, item;
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);

                if (item && item.assist && item.assist.speak && item.assist.speak.value) {
                    toolTip = item.assist.toolTip.value;
                }

            } else if (this.jsonModel.shortDescription) {
                toolTip = this.jsonModel.shortDescription;
            }
            return toolTip;
        },
        _getCaption : function (index) {
            var item, caption, option;
            if (index == null) {

                if (this.bindNode && this.bindNode.caption && this.bindNode.caption.value && this.bindNode.caption.value.oneOfChild && this.bindNode.caption.value.oneOfChild.value) {
                    return this.bindNode.caption.value.oneOfChild.value;
                }
                return null;
            }
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);
                if (item.caption && item.caption.value && item.caption.value.oneOfChild && item.caption.value.oneOfChild.value) {
                    caption = item.caption.value.oneOfChild.value;
                }

            } else if (this.jsonModel.options) {
                var options;
                options = this.jsonModel.options || [];
                if (index < 0) {
                    index = 0;
                }
                if (!options.length == 0) {
                    option = options[index];
                    caption = option.split("=")[1];
                }

            }
            return caption;
        },
        _getName : function (index) {
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item && this.bindNode.members.item(index)) {
                
                return this.bindNode.members.item(index).name;
            }
            return null;
        },

        _getScreenReaderText : function (index) {
            var screenReaderText, assistPriority = this._getAssistPriority() || "caption";

            if (this.bindNode) {
                screenReaderText = GuideCheckBox._super._getScreenReaderText.apply(this, [index]);
            } else {
                if (assistPriority == "custom") {
                    screenReaderText = this._getCustomAssist(index) || this._getCaption(index);
                } else if (assistPriority == "caption") {
                    screenReaderText = this._getCaption(index);
                }
            }
            return screenReaderText;
        }

    });

})(_, guidelib);


(function (_, guidelib) {
    var GuideSwitch = guidelib.model.GuideSwitch = guidelib.model.GuideCheckBox.extend({
        msClassName : "guideSwitch",

        initialize : function () {
            
            var uncheckedValue = this.getOnOffValues()[1];
            this.jsonModel["_value"] = this.getOrElse(this.jsonModel, "_value", uncheckedValue);
            GuideSwitch._super.initialize.call(this);
        },

        getOnOffValues : function (index) {
            var options, checkedLabel, uncheckedLabel, items;
            if (this.bindNode) {
                checkedLabel = this.bindNode.getSaveItem(0);
                uncheckedLabel = this.bindNode.getSaveItem(1);
            } else {
                items = this.jsonModel.options;
                
                if (Array.isArray(items) && items.length > 0) {
                    checkedLabel = items[0].split('=')[0].trim();
                } else if (!_.isUndefined(items) && items.length > 0) {
                    checkedLabel = items.split('=')[0].trim();
                } else {
                    checkedLabel = "1";
                }
                if (Array.isArray(items) && items.length > 1) {
                    uncheckedLabel = items[1].split('=')[0].trim();
                } else {
                    uncheckedLabel = "0";
                }
            }
            options = [checkedLabel, uncheckedLabel];
            return options;
        },

        resetData : function () {
            this.value = this.jsonModel["{default}"];
        }
    });
})(_, guidelib);

(function (_, guidelib) {
    var GuideTextDraw = guidelib.model.GuideTextDraw = guidelib.model.Field.extend({
        msClassName : "guideTextDraw",

        
        playJson : function (pJsonModel) {

        },

        _allowEmptyValueString : function () {
            return true;
        }
    });
}(_, guidelib));



(function (_, guidelib) {
    var GuideAdobeSignBlock = guidelib.model.GuideAdobeSignBlock = guidelib.model.GuideTextDraw.extend({
        msClassName : "guideAdobeSignBlock"
    });
}(_, guidelib));

(function (_, guidelib) {
    var GuideScribble = guidelib.model.GuideScribble = guidelib.model.Field.extend({
        msClassName : "guideScribble"
    });
})(_, guidelib);

(function (_, guidelib) {
    var GuidePasswordBox = guidelib.model.GuidePasswordBox = guidelib.model.Field.extend({
        msClassName : "guidePasswordBox",
        
        _getReducedJSON : function () {
            
            
            if (this.submitPassword) {
                return GuidePasswordBox._super._getReducedJSON.call(this);
            }
            
            var whitelistedProperties = ["name", "templateId", "guideNodeClass"],
                reducedJsonObject = {};
            guidelib.model.util.CommonUtils.prototype.returnMinimalJSON(whitelistedProperties, reducedJsonObject, this);
            return reducedJsonObject;
        },

        _preserveLazyValue : function () {
            return !!this.submitPassword && GuidePasswordBox._super._preserveLazyValue.call(this);
        },

        _allowEmptyValueString : function () {
            return true;
        }
    });
    GuidePasswordBox.defineProps({
        submitPassword : {
            get : function () {
                return this.getAttribute("submitPassword");
            }
        }
    });

})(_, guidelib);


(function (_, guidelib) {
    var GuideRadioButton = guidelib.model.GuideRadioButton = guidelib.model.Field.extend({
        msClassName : "guideRadioButton",
        prevOnItem : null,
        initialize : function () {
            
            GuideRadioButton._super.initialize.call(this);
        },

        _postInitialize : function () {
            GuideRadioButton._super._postInitialize.call(this);
            this.prevOnItem = this.getSelectedIndex(this.value);
            if (this.bindNode && this.bindNode.members) {
                for (var i = 0; i < this.bindNode.members.length; i++) {
                    var field = this.bindNode.members.item(i);
                    field.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
                }
            }
        },

        _unloadModel : function () {
            if (this.bindNode && this.bindNode.members) {
                for (var i = 0; i < this.bindNode.members.length; i++) {
                    var field = this.bindNode.members.item(i);
                    field.off(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
                }
            }

            GuideRadioButton._super._unloadModel.call(this);
        },

        
        getItemIdentifier : function (index) {
            if (this.bindNode) {
                return this.bindNode.members.item(index).somExpression;
            } else {
                return index;
            }

        },

        playJson : function (pJsonModel) {
            GuideRadioButton._super.playJson.call(this, pJsonModel);
            this.prevOnItem = this.getSelectedIndex(this.jsonModel._value);
        },

        getOnOffValues : function (index) {
            var temp = this.jsonModel.options || [],
                items = [],
                on,
                off;
            if (this.bindNode) {
                var item = this.bindNode.members.item(index);
                on = item.getSaveItem(0);
                off = item.getSaveItem(1) ? item.getSaveItem(1) : null;
            } else {

                if (temp.length == 0) {
                    on = "0";
                } else {
                    on = temp[index].split('=')[0].trim();
                }
                off = null;
            }

            items = [on, off];
            return items;
        },

        _handleXfaModelChanged : function (event) {
            if (event._property == "rawValue") {
                this.trigger(guidelib.event.GuideModelEvent.VALUE_CHANGED,
                    guidelib.event.GuideModelEvent.createEvent(
                        guidelib.event.GuideModelEvent.VALUE_CHANGED,
                        this,
                        "value",
                        event.target.somExpression,
                        event.newText
                    )
                );
            } else {
                GuideRadioButton._super._handleXfaModelChanged.call(this, event);
            }
        },

        getSelectedIndex : function (value) {
            var index = null;
            if (!_.isEmpty(this.jsonModel.options) && !_.isArray(this.jsonModel.options)) {
                this.jsonModel.options = [this.jsonModel.options];
            }
            var currOption = _.find(this.jsonModel.options, function (opt, i) {
                var items = this.getOnOffValues(i);
                index = i;
                return (items[0] == value);
            }, this);

            if (currOption) {
                return index;
            } else {
                return null;
            }

        },

        

        _triggerDisplayFormatChange : function () {
            if (!this.bindNode) {
                var currValue = this._getValue();
                var currSelected = this.getSelectedIndex(currValue);

                if (this.prevOnItem !== null) {
                    this._triggerEvent(guidelib.event.GuideModelEvent.VALUE_CHANGED, "value", this.prevOnItem, null);
                }
                if (currSelected !== null) {
                    this._triggerEvent(guidelib.event.GuideModelEvent.VALUE_CHANGED, "value", currSelected, this._getFormattedValue(currValue));
                }
                this.prevOnItem = currSelected;
            }
        },
        _getCustomAssist : function (index) {
            var customAssist, item;

            if (index == null) {

                if (this.bindNode && this.bindNode.assist && this.bindNode.assist.speak && this.bindNode.assist.speak.value) {
                    return this.bindNode.assist.speak.value;
                }
                return null;
            }

            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);
                if (item && item.assist && item.assist.speak && item.assist.speak.value) {
                    customAssist = item.assist.speak.value;
                }
            } else if (this.jsonModel.custom) {

                var custom;
                custom = this.jsonModel.custom || [];
                if (_.isString(custom) && index <= 0) {

                    customAssist = custom;
                } else {
                    if (!custom.length == 0) {
                        customAssist = custom[index];
                    }
                }
            }
            return customAssist;
        },
        _getToolTip : function (index) {
            var toolTip, item;
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);

                if (item && item.assist && item.assist.speak && item.assist.speak.value) {
                    toolTip = item.assist.toolTip.value;
                }

            } else if (this.jsonModel.shortDescription) {
                toolTip = this.jsonModel.shortDescription;
            }
            return toolTip;
        },
        _getCaption : function (index) {
            var item, caption, option;
            if (index == null) {

                if (this.bindNode && this.bindNode.caption && this.bindNode.caption.value && this.bindNode.caption.value.oneOfChild && this.bindNode.caption.value.oneOfChild.value) {
                    return this.bindNode.caption.value.oneOfChild.value;
                }
                return null;
            }
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item) {
                item = this.bindNode.members.item(index);
                if (item.caption && item.caption.value && item.caption.value.oneOfChild && item.caption.value.oneOfChild.value) {
                    caption = item.caption.value.oneOfChild.value;
                }

            } else if (this.jsonModel.options) {
                var options;
                options = this.jsonModel.options || [];
                if (index < 0) {
                    index = 0;
                }
                if (!options.length == 0) {
                    option = options[index];
                    caption = option.split("=")[1];
                }

            }
            return caption;
        },
        _getName : function (index) {
            if (this.bindNode && this.bindNode.members && this.bindNode.members.item && this.bindNode.members.item(index)) {
                
                return this.bindNode.members.item(index).name;
            }
            return null;
        },

        _getScreenReaderText : function (index) {
            var screenReaderText, assistPriority = this._getAssistPriority() || "caption";

            if (this.bindNode) {
                screenReaderText = GuideRadioButton._super._getScreenReaderText.apply(this, [index]);
            } else {
                if (assistPriority == "custom") {
                    screenReaderText = this._getCustomAssist(index) || this._getCaption(index);
                } else if (assistPriority == "caption") {
                    screenReaderText = this._getCaption(index);
                }
            }
            return screenReaderText;
        }

    });

})(_, guidelib);


(function (_, guidelib) {
    
    var GuideDatePicker = guidelib.model.GuideDatePicker = guidelib.model.Field.extend({
        msClassName : "guideDatePicker",

        initialize : function () {
            GuideDatePicker._super.initialize.call(this);
            if (_.isEmpty(this.jsonModel._value) && this.jsonModel.defaultToCurrentDate === "true") {
                this._setGuideValue(new Date().toISOString().slice(0, 10));
            }
        },

        _reformatDate : function (value) {
            var intVal = value || this.jsonModel._value,
                retVal = intVal,
                year = null,
                month = null,
                day = null,
                isInvalidDate = xfalib.ut.DateInfo.Parse(value) == null;
            if (isInvalidDate && intVal) {
                
                
                year = intVal.slice(-4);
                month = guidelib.i18n.calendarSymbols.abbrmonthNames.indexOf(intVal.substr(4, 3)) + 1;
                day = intVal.substr(8, 2);
                retVal = year + '-' + (month < 10 ? '0' : '') + month + '-' + day;
            }
            return retVal;
        },

        playJson : function (pJsonModel) {
            this._setGuideValue(this._reformatDate(pJsonModel._value));
        },

        _getTypedValue : function (value) {
            if (value) {
                var parsedValue = xfalib.ut.DateInfo.Parse(value);
                if (parsedValue !== null) {
                    parsedValue = parsedValue.getISODate();
                }
                return parsedValue ? parsedValue : value;
            }
            return null;
        },

        
        _runValidations : function (obj) {
            var value = this.value;
            GuideDatePicker._super._runValidations.call(this, obj);
            this._minMaxValidation(value, obj);
        }
    });

    GuideDatePicker.addMixins([
        guidelib.model.mixin.AddMinMaxValidation
    ]);

})(_, guidelib);


(function (_, guidelib) {
    
    var GuideCaptcha = guidelib.model.GuideCaptcha = guidelib.model.Field.extend({
        msClassName : "guideCaptcha",

        
        showCaptchaError : function (serverErrorMessage) {
            if (_.isEmpty(serverErrorMessage)) {
                serverErrorMessage = guidelib.util.GuideUtil.getLocalizedMessage("", guidelib.i18n.LogMessages["AEM-AF-901-006"]);
            }
            
            this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_CHANGED,
                "validationStatus", false, serverErrorMessage);
        },

        validate : function (errorList) {
            if (_.isUndefined(errorList)) {
                errorList = [];
            }

            if (window.guideBridge.hostName !== "server") {
                if (!this.value) {
                    errorList.push({
                    som : this.somExpression,
                    errorText : this.mandatoryMessage
                });
                    this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_CHANGED,
                                "validationStatus", false, this.mandatoryMessage);
                    return false;
                } else {
                    this._triggerEvent(guidelib.event.GuideModelEvent.ERROR_CHANGED,
                                "validationStatus", true, null);
                }
            }
        }
    });

    GuideCaptcha.defineProps({
        value : {
            get : function () {
                return this.jsonModel._value;
            },
            set : function (value) {
                var oldValue = this.jsonModel._value,
                    newTypedValue;
                this.jsonModel._value = (value === undefined || value === null) ? null : value;
                newTypedValue = this.jsonModel._value;
                this.validate();
                this._triggerOnBridge("elementValueChanged", this, "value", oldValue, newTypedValue);
            }
        },
        captchaService : {
            get : function () {
                return this.getAttribute("captchaService");
            }
        },
        captchaWidget : {
            get : function () {
                return this.getAttribute("captchaService");
            }
        }
    });

}(_, guidelib));



(function (_, guidelib) {

    
    var GuideDropDownList = guidelib.model.GuideDropDownList = guidelib.model.Field.extend({
        msClassName : "guideDropDownList" ,

        _collectExpressions : function () {
            GuideDropDownList._super._collectExpressions.apply(this);
            if (this.optionsExp) {
                this._compiledExpressions["optionsExp"] = this._compileExpression(this.optionsExp, "items");
            }
        },

        _handleXfaModelChanged : function (event) {
            if (event._property === "addItem" || event._property === "clearItems" || event._property === "deleteItem") {
                this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, event._property, event.prevText, event.newText);
            } else {
                GuideDropDownList._super._handleXfaModelChanged.call(this, event);
            }
        },

        _triggerItemsChange : function () {
            var currValue = this.items;
            this.trigger(guidelib.event.GuideModelEvent.ITEMS_CHANGED,
                guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.ITEMS_CHANGED,
                    this,
                    "items",
                    currValue,
                    currValue
                )
            );
        },

        _getItems : function () {
            return this.jsonModel.options;
        },

        _setXFAItems : function (options) {
            var optionsStr = this._getXFAOptionStringFromGuideItems(options);
            var SET_ITEMS_INSERT_MODE_PAIR = 2;
            if (optionsStr) {
                this.bindNode.setItems(optionsStr, SET_ITEMS_INSERT_MODE_PAIR);
            } else {
                this.bindNode.clearItems();
            }
        },

        
        _allowEmptyValueString : function () {
            return true;
        }

    });

    GuideDropDownList.defineProps({

        
        multiSelect : {
            get : function () {
                return this.getAttribute("multiSelect");
            },
            set : function () {
                this.setAttribute("multiSelect");
            }
        },

        optionsExp : {
            get : function () {
                return this.getAttribute("optionsExp");
            }
        },

        
        
        items : {
            get : function () {
                var items = [];
                if (this.bindNode) {
                    var that = this.bindNode;
                    for (var index = 0; index < that.length; index++) {
                        var item = that.getSaveItem(index) + "=" + that.getDisplayItem(index);
                        items.push(item);
                    }
                    return items;
                } else {
                    items  =  this._getItems();
                    if (items && !_.isArray(items)) {
                        return items.split(",");
                    } else {
                        return items;
                    }
                }

            },
            set : function (newValue) {
                var oldValue = this._getItems();
                if (newValue != oldValue) {
                    if (this.bindNode) {
                        this._setXFAItems(newValue);
                    } else {
                        this.jsonModel.options = newValue;
                    }
                    this._triggerItemsChange();
                }
            }
        }
    });

})(_, guidelib);


(function (_, guidelib) {
    var GuideCompositeFieldItem = guidelib.model.GuideCompositeFieldItem = guidelib.model.Field.extend({
        msClassName : "GuideCompositeFieldItem"
    });

})(_, guidelib);

(function (_, guidelib) {
    var GuideImage = guidelib.model.GuideImage = guidelib.model.Scriptable.extend({
        msClassName : "guideImage"
    });

    GuideImage.defineProps({
        value : {
            get : function () {
                if (this.bindNode) {
                    return this.bindNode.rawValue;
                } else {
                    return null;
                }
            }
        }
    });
})(_, guidelib);


(function (_, guidelib) {
    var GuideChart = guidelib.model.GuideChart = guidelib.model.Scriptable.extend({
        msClassName : "guideChart",

        _collectExpressions : function () {
            GuideChart._super._collectExpressions.apply(this);
            this._compiledExpressions["aggregateExp"] = this._compileExpression('guidelib.chartUtils.gatherAxisData(this);', "data");
        }
    });

    GuideChart.defineProps({
        
        data : {
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.contextNode && context.expression
                    && !(context.contextNode === this && context.expression === "aggregateExp")) {
                    this._addDependant(context.contextNode, context.expression);
                }
                return this.jsonModel.data;
            },

            set : function (newValue) {
                var oldValue = this.jsonModel.data;
                this.jsonModel.data = newValue;
                
                this._notifyDependants();
                this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, "data", oldValue, newValue);
            }
        },

        
        width : {
            get : function () {
                return this.getAttribute("width");
            },

            set : function (newValue) {
                this.jsonModel.width = newValue;
            }
        },
        
        height : {
            get : function () {
                return this.getAttribute("height");
            },

            set : function (newValue) {
                this.jsonModel.height = newValue;
            }
        },
        
        xAxisTitle : {
            get : function () {
                return this.getAttribute("xAxisTitle");
            },
            set : function (newValue) {
                this.jsonModel.chartType = newValue;
            }
        },
        
        yAxisTitle : {
            get : function () {
                return this.getAttribute("yAxisTitle");
            },
            set : function (newValue) {
                this.jsonModel.chartType = newValue;
            }
        },
        
        chartType : {
            get : function () {
                return this.getAttribute("chartType");
            },
            set : function (newValue) {
                var oldValue = this.jsonModel.chartType;
                this.jsonModel.chartType = newValue;
                this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_CHANGED, "chartType", oldValue, newValue);
            }
        },
        
        repeatableItem : {
            get : function () {
                return this.getAttribute("repeatableItem");
            },
            set : function (newValue) {
                this.jsonModel.repeatableItem = newValue;
            }
        },
        
        xExp : {
            get : function () {
                return this.getAttribute("xExp");
            },
            set : function (newValue) {
                this.jsonModel.xExp = newValue;
            }
        },
        
        reducerXFunction : {
            get : function () {
                return this.getAttribute("reducerXFunction");
            },
            set : function (newValue) {
                this.jsonModel.reducerXFunction = newValue;
                if (newValue !== 'none') {
                    this.jsonModel.reducerYFunction = 'none';
                }
            }
        },
        
        yExp : {
            get : function () {
                return this.getAttribute("yExp");
            },
            set : function (newValue) {
                this.jsonModel.yExp = newValue;
            }
        },
        
        reducerYFunction : {
            get : function () {
                return this.getAttribute("reducerYFunction");
            },
            set : function (newValue) {
                this.jsonModel.reducerYFunction = newValue;
                if (newValue !== 'none') {
                    this.jsonModel.reducerXFunction = 'none';
                }
            }
        },
        
        innerRadius : {
            get : function () {
                return this.getAttribute("innerRadius");
            },
            set : function (newValue) {
                this.jsonModel.innerRadius = newValue;
            }
        },
        
        lineColor : {
            get : function () {
                return this.getAttribute("lineColor");
            },
            set : function (newValue) {
                this.jsonModel.lineColor = newValue;
            }
        },
        
        pointColor : {
            get : function () {
                return this.getAttribute("pointColor");
            },
            set : function (newValue) {
                this.jsonModel.pointColor = newValue;
            }
        },
        
        areaColor : {
            get : function () {
                return this.getAttribute("areaColor");
            },
            set : function (newValue) {
                this.jsonModel.areaColor = newValue;
            }
        },
        
        tooltipHtml : {
            get : function () {
                return this.getAttribute("tooltipHtml");
            },
            set : function (newValue) {
                this.jsonModel.tooltipHtml = newValue;
            }
        },
        
        showLegends : {
            get : function () {
                return this.getAttribute("showLegends");
            },
            set : function (newValue) {
                this.jsonModel.showLegends = newValue;
            }
        },
        
        legendPosition : {
            get : function () {
                return this.getAttribute("legendPosition");
            },
            set : function (newValue) {
                this.jsonModel.legendPosition = newValue;
            }
        }
    });

    GuideChart.addMixins([
        guidelib.model.mixin.AddDependencyMgmt
    ]);
}(_, guidelib));

(function (_, guidelib) {
    var GuideAdModule = guidelib.model.GuideAdModule = guidelib.model.Scriptable.extend({
        msClassName : "guideAdModule",

        initialize : function () {
            GuideAdModule._super.initialize.call(this);
            this.jsonModel["{default}"] = this.getOrElse(this.jsonModel, "{default}", this.jsonModel._value);
            this.layoutConfigs = [];
            
            if (typeof this.jsonModel.layoutConfig === "string") {
                this.layoutConfigs.push(JSON.parse(this.jsonModel.layoutConfig));
            } else {
                _.each(this.jsonModel.layoutConfig, function (layoutConfig) {
                    this.layoutConfigs.push(JSON.parse(layoutConfig));
                }, this);
            }
        },

        _getTypedValue : function (value) {
            if (_.isUndefined(value) || value === null || value === "") {
                return null;
            }
            return value + "";
        },

        playJson : function (pJsonModel) {
            var olval = this.jsonModel._value;
            this.jsonModel._value = pJsonModel._value;
            this._triggerOnBridge("elementValueChanged", this, "value", olval, this.jsonModel._value);
        }
    });

    GuideAdModule.defineProps({
        
        value : {
            get : function () {
                return this._getTypedValue(this.jsonModel._value);
            },
            set : function (newValue) {
                var oldValue = this._getTypedValue(this.jsonModel._value),
                    newTypedValue = this._getTypedValue(newValue);
                
                if (newTypedValue !== undefined && (newTypedValue !== oldValue)) {
                    if (this.jsonModel._value !== newValue) {
                        this.jsonModel._value = newTypedValue || "";
                    }
                    this._triggerOnBridge("elementValueChanged", this, "value", oldValue, newTypedValue);
                }
            }
        }
    });
}(_, guidelib));

(function (_, guidelib) {
    var GuideAdModuleGroup = guidelib.model.GuideAdModuleGroup = guidelib.model.GuideAdModule.extend({
        msClassName : "guideAdModuleGroup"
    });

}(_, guidelib));


(function (_, guidelib) {

    
    var GuideItemsContainer = guidelib.model.GuideItemsContainer = guidelib.model.Scriptable.extend({
        msClassName : "guideItemsContainer",

        initialize : function () {
            GuideItemsContainer._super.initialize.call(this);
            this._children = [];
            this._nameArray = {};
            this._private = {};
            this._initChildren();
            this._normalizeChildren();
            this._bParentValidationsDisabled = false;
            this._validationsDisabled = false;
        },

        _postInitialize : function () {
            
            
            GuideItemsContainer._super._postInitialize.call(this);
            _.each(this._children, function (childNode) {
                childNode._postInitialize();
            }, this);
        },

        
        validate : function (errorList) {
            var validationStatus = true,
                tempValidationStatus;
            
            if (!this.visible) {
                return true;
            }
            if (_.isUndefined(errorList)) {
                errorList = [];
            }

            var subContainerErrorArray = [],
                arrLen;
            _.each(this.children, function (child) {
                tempValidationStatus = child.validate(subContainerErrorArray);
                if (tempValidationStatus === false) {
                    validationStatus = false;
                }
            }, this);

            tempValidationStatus = GuideItemsContainer._super.validate.call(this, subContainerErrorArray);
            if (tempValidationStatus === false) {
                validationStatus = false;
            }
            arrLen = subContainerErrorArray.length;
            while (arrLen > 0) {
                errorList[errorList.length] = subContainerErrorArray[subContainerErrorArray.length - arrLen];
                arrLen--;
            }
            return validationStatus;
        },

        prepare : function () {
            _.each(this._children, function (childNode) {
                childNode.prepare();
            }, this);
            GuideItemsContainer._super.prepare.call(this);
        },

        syncXFAProps : function () {
            GuideItemsContainer._super.syncXFAProps.apply(this, arguments);
            _.each(this._children, function (childNode) {
                childNode.syncXFAProps();
            });
        },

        _initChildren : function (bLazyInitialization) {
            var panelItems = [],
                jsonModelItemsWithoutRepeatJson = {},
                keyLengthForJsonWithoutRepeat = 0,
                keyLengthJsonItemsOriginal = 0;
            
            
            
            
            
            _.each(this.jsonModel.items, function (item) {
                
                
                
                if (item.templateId && item.templateId.indexOf("GUID") === -1) {
                    jsonModelItemsWithoutRepeatJson[item.templateId] = item;
                }
            });
            keyLengthForJsonWithoutRepeat = _.keys(jsonModelItemsWithoutRepeatJson).length;
            
            keyLengthJsonItemsOriginal = _.keys(this.jsonModel.items || {}).length;
            if (keyLengthForJsonWithoutRepeat > 0 && keyLengthForJsonWithoutRepeat !== keyLengthJsonItemsOriginal) {
                this.jsonModel.items = jsonModelItemsWithoutRepeatJson;
            }
            _.each(this.jsonModel.items,
                function (item) {
                    if (_.isObject(item)) {
                        
                        
                        
                        
                        var panelItemModel = guidelib.model.GuideModelRegistry.prototype.createModel(item);
                        panelItemModel._isItem = true;
                        this._initializeChild(panelItemModel);
                        panelItems.push(panelItemModel);
                    }
                },
                this);
            this._children = panelItems;
        },

        _initializeChild : function (childItem) {
            childItem.parent = this;
        },

        _normalizeChildren : function () {
            this._nameArray = {};
            this._private = {};
            _.each(this.children, function (child) {
                child._index = this._addProperty(child);
                child.getNaked(child._index, guidelib.runtime, null);
            }, this);
        },

        nakedChildReferences : function (nIndex, obj) {
            var i, oNode;
            for (i = 0; i < this._children.length; i++) {
                oNode = this._children[i];
                oNode.getNaked(nIndex, obj, this);
            }
        },
        _getReducedJSON : function (isRepeatable) {
            var reducedJSONChildren,
                that = this,
                index =  0;
            
            reducedJSONChildren = GuideItemsContainer._super._getReducedJSON.call(this);
            reducedJSONChildren.items = {};
            
            
            
            
            _.each(this.jsonModel.items, function (childNode, key) {
                reducedJSONChildren.items[key] = that.items[index]._getReducedJSON(isRepeatable);
                index += 1;
            });
            return reducedJSONChildren;
        },

        _addProperty : function (oValueObject) {
            var sName = oValueObject.getAttribute("name"),
                nIndex = 0;
            
            
            
            this._nameArray[sName] = this._nameArray[sName] || nIndex;
            nIndex = this._nameArray[sName]++;
            if (nIndex === 0) {
                
                
                
                
                this._guide()._createGetterSetter(this, sName, oValueObject);
            }
            return nIndex;
        },

        _getTitle : function () {
            return this.jsonModel["jcr:title"];
        },

        visit : function (callback, context) {
            GuideItemsContainer._super.visit.apply(this, arguments);
            _.each(this._children, function (child, index) {
                child.visit(callback, context);
            });
        },

        playJson : function (pJsonModel) {
            if (pJsonModel) {
                var pJsonItems = _.filter(pJsonModel.items, function (item) {
                    if (_.isObject(item)) {
                        return true;
                    }
                    return false;
                }, this);
                
                _.each(this.items, function (childNode, index) {
                    childNode.playJson(pJsonItems[index]);
                }, this);
                GuideItemsContainer._super.playJson.call(this, pJsonModel);
            }

        },

        _collectValues : function (keyValue) {
            _.each(this._children, function (childNode) {
                childNode._collectValues(keyValue);
            }, this);
        },

        getElement : function (elClassName) {
            var element = _.find(this._children, function (childModel) {
                return childModel.className === elClassName;
            }, this);
            return element;
        },

        
        _unloadModel : function () {
            _.each(this.children, function (child) {
                child._unloadModel();
            }, this);
            GuideItemsContainer._super._unloadModel.call(this);
        },

        _findChildren : function (oSOM, bMultiple) {
            var arr = [],
                elemFound = false;
            _.find(this._children, function (child) {
                if (oSOM === child._escapeQualifiedName()) {
                    arr.push(child._getNakedThis());
                    elemFound = true;
                }
                if (elemFound && !bMultiple) {
                    return true; 
                }
                if (elemFound && oSOM.indexOf("[*]") < 0) {
                    return true; 
                }
            }, this);
            return arr;
        },

        
        resetData : function () {
            _.each(this._children, function (childNode) {
                childNode.resetData();
            }, this);
        },

        
        _changeDescendantsAccess : function (value) {
            _.each(this.items, function (child) {
                child._setParentAccess(value);
                if (child instanceof guidelib.model.GuideItemsContainer) {
                    child._changeDescendantsAccess(value);
                }
            }, this);
        },

        
        _changeContainerAccess : function (value) {
            this._changeDescendantsAccess(value);
        },

        
        _changeDescendantsProperty : function (value, property, leafNodesOnly) {
            _.each(this.items, function (child) {
                if (child instanceof guidelib.model.GuideItemsContainer) {
                    if (!leafNodesOnly) {
                        child[property] = value;
                    }
                    child._changeDescendantsProperty(value, property);
                } else {
                    child[property] = value;
                }
            }, this);
        },

        
        disableAllFields : function () {
            this.enabled = false;
            var property = "enabled";
            this._changeDescendantsProperty(false, property, true);
        }

    });

    GuideItemsContainer.defineProps({
        children : {
            get : function () {
                return (this._children || []).slice(0); 
            },
            set : function (value) {
                this._children = value;
            }
        },

        
        items : {
            get : function () {
                var itemChildren = _.filter(this._children, function (child) {
                    if (child._isItem) {
                        return true;
                    }
                    return false;
                }, this);
                return itemChildren;
            }
        },
        
        _selfOrAncestorIsLazyReference : {
            get : function () {
                if (this._lazyReference) {
                    return true;
                }
                return guidelib.util.GuideUtil._checkIfAncestorIsALazyReference(this);
            }
        },
        _lazyReference : {
            get : function () {
                return !_.isUndefined(this.jsonModel["fragRef"])
                    && !_.isUndefined(this.jsonModel["optimizeRenderPerformance"]);
            }
        }
    });

    GuideItemsContainer.addMixins([
        guidelib.model.mixin.ValidationsDisabled
    ]);

}(_, guidelib));


(function (_, guidelib) {
    var GuideToolbar = guidelib.model.GuideToolbar = guidelib.model.GuideItemsContainer.extend({
        msClassName : "guideToolbar",

        initialize : function () {
            GuideToolbar._super.initialize.call(this);
        },

        execNavigationChangeExpression : function () {
            _.each(this.items, function (childModel) {
                if (childModel.navigationChangeExp) {
                    this._guide().queueExpressions(childModel, "navigationChangeExp");
                }
            }, this);
        }

    });

})(_, guidelib);




(function (_, guidelib) {

    
    var _guideState = guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MODEL_CREATION;
    
    
    var GuideContainerNode = guidelib.model.GuideContainerNode = guidelib.model.GuideItemsContainer.extend({
        msClassName : "guideContainerNode",

        setGuideState : function (guideState) {
            var isStateValid = _.some(guidelib.model.GuideSchema.prototype.GuideStateConstants, function (val) {
                return val === guideState;
            });
            if (isStateValid === true) {
                _guideState = guideState;
            }
        },

        getGuideState : function () {
            return _guideState;
        },

        initialize : function () {
            var configString = "";
            
            guidelib.runtime.guide = this;
            
            guidelib.runtime.errorManager = new guidelib.util.GuideErrorManager();

            this._modelTemplateCacheStore =
                new guidelib.model.util.ModelTemplateCacheStore({modelTemplateJson : this.jsonModel});
            this._guideSchema = new guidelib.model.GuideSchema();
            this.guideLazyUtil = new guidelib.util.GuideLazyUtil();
            this._pendingQueues = {
                calcExp : [],
                valueCommitScript : [],
                enabledExp : [],
                visibleExp : [],
                validateAllExp : [],
                optionsExp : [],
                navigationChangeExp : [],
                summaryExp : [],
                autoSaveStartExp : [],
                aggregateExp : [],
                submitSuccess : [],
                submitError : []
            };
            this._resetExpressionCounters();
            this._currentContext = null;
            GuideContainerNode._super.initialize.call(this);
            this.autoSaveStart = false;
            
            
            this._modelTemplateCacheStore.putModel(this);
            this._postInitialize();
            var xfaHost = this.getOrElse(xfalib, "runtime.xfa.host", null);
            if (xfaHost !== null) {
                xfaHost.on(xfalib.script.XfaModelEvent.FORM_MODEL_REFRESH,
                    function (evnt) {
                        switch (evnt.name) {
                        case xfalib.script.XfaModelEvent.FORM_MODEL_REFRESH:
                            this._triggerEvent(guidelib.event.GuideModelEvent.MODEL_REFRESH, "jsonModel", null, null);
                            break;
                        default:
                        
                        }
                    },
                    this);
            }
        },

        _resetExpressionCounters : function () {
            this._runningExpressionCount = {
                calcExp : {},
                valueCommitScript : {},
                enabledExp : {},
                visibleExp : {},
                validateAllExp : {},
                optionsExp : {},
                navigationChangeExp : {},
                summaryExp : {},
                autoSaveStartExp : {},
                aggregateExp : {},
                submitSuccess : {},
                submitError : {}
            };
        },

        _getReducedJSON : function () {
            
            
            var reducedJSONChildren = guidelib.model.GuideNode.prototype._getReducedJSON.call(this),
                addtionalWhitelistedProperties = ["xdpRef", "xsdRef", "id", "dorTemplateRef", "dorType", "excludeFromDoRIfHidden", "schemaRef", "schemaType"];
            guidelib.model.util.CommonUtils.prototype.returnMinimalJSON(addtionalWhitelistedProperties, reducedJSONChildren, this);
            reducedJSONChildren["rootPanel"] = this["rootPanel"]._getReducedJSON();
            if (this.jsonModel.toolbar) {
                reducedJSONChildren["toolbar"]  = this["toolbar"]._getReducedJSON();
            }
            return reducedJSONChildren;
        },

        _initChildren : function () {
            
            this.rootPanel = guidelib.model.GuideModelRegistry.prototype.createModel(this.jsonModel.rootPanel);
            this._initializeChild(this.rootPanel);
            this._children.push(this.rootPanel);
            
            var instanceManager = guidelib.model.GuideModelRegistry.prototype.createInstanceManager(this.rootPanel);
            this._initializeChild(instanceManager);
            this._children.splice(this._children.indexOf(this.rootPanel), 0, instanceManager);
            instanceManager._manageChild(this.rootPanel);

            if (this.jsonModel.toolbar) {
                this.toolbar = guidelib.model.GuideModelRegistry.prototype.createModel(this.jsonModel.toolbar);
                this._initializeChild(this.toolbar);
                this._children.push(this.toolbar);
            }
        },

        
        _addToExcludeFromDorMap : function (fieldTemplateId, bExcludeFromDor) {
            this._excludeFromDorMap = this._excludeFromDorMap || {};
            this._excludeFromDorMap[fieldTemplateId] = bExcludeFromDor;
        },

        
        _getExcludeFromDorMap : function () {
            var that = this;
            if (!_.isUndefined(that._excludeFromDorMap)) {
                return _.keys(that._excludeFromDorMap).map(function (key) {
                    
                    return key  + "="  + that._excludeFromDorMap[key];
                });
            }
        },

        
        _getSigners : function () {
           var signers = {};
           if (this.enableAdobeSign) {
               var signer,
                  that = this,
                  email,
                  number,
                  countryCode,
                   evalExp = function (fld, type) {
                       var val = null,
                           resolvedField;
                       try {
                           resolvedField = guideBridge._guide.resolveNode(fld);
                           if (resolvedField.className === 'guideTelephone') {
                               if (type === 'countryCode') {
                                   val = resolvedField.countryCode;
                               } else if (type === 'phone') {
                                   val = resolvedField.phoneNumber;
                               }
                           } else {
                               val = resolvedField.value;
                           }
                       } catch (e) {
                           
                       }
                       return val;
                   };
               if (this.signerInfo) {
                   _.each(_.keys(this.signerInfo), function (name) {
                       signer = that.signerInfo[name];
                       if (signer && typeof signer === "object") {
                           email = null;
                           number = null;
                           countryCode = null;
                           if (signer.emailSource === 'form' && signer.email) {
                               email = evalExp(signer.email, 'email');
                           }
                           signers[name] = {};
                           signers[name].email = email ? email : "";
                           if (signer.securityOption === 'PHONE') {
                               if (signer.phoneSource === 'form' && signer.phone) {
                                   number = evalExp(signer.phone, 'phone');
                               }
                               if (signer.countryCodeSource === 'form' && signer.countryCode) {
                                   countryCode = evalExp(signer.countryCode, 'countryCode');
                               }
                               signers[name].phone = {};
                               signers[name].phone.countryCode = countryCode ? countryCode : "";
                               signers[name].phone.number = number ? number : "";
                           }
                       }
                   });
               }
           }

           return signers;
       },

        
        defaultSubmitSuccess : "window.guideBridge._defaultSubmitSuccessHandler($event.data)",

        
        defaultSubmitError : "window.guideBridge._handleServerValidationError($event.data)",

        
        _collectExpressions : function () {
            if (this.autoSaveStartExpression) {
                this._compiledExpressions["autoSaveStartExp"] = this._compileExpression(this.autoSaveStartExpression, "autoSaveStart");
            }

            
            if (!this.submitSuccess) {
                this.jsonModel.submitSuccess = this.defaultSubmitSuccess;
            }
            this._compiledScripts.submitSuccess = this._compileExpression(this.submitSuccess, null);

            if (!this.submitError) {
                this.jsonModel.submitError = this.defaultSubmitError;
            }
            this._compiledScripts.submitError = this._compileExpression(this.submitError, null);
        },

        prepare : function () {
            
            
            if ((this.getGuideState() !== guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MERGE_PROGRESS) && (this.getGuideState() !== guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MODEL_CREATION)) {
                _.each(this._children, function (childNode) {
                    childNode.prepare();
                }, this);
                this.queueExpressions(this, ["autoSaveStartExp"]);
                this.runPendingExpressions();
            }
        },

        runPendingExpressions : function () {
            
            this._runExpressionQueue("calcExp");
            this._runExpressionQueue("enabledExp");
            this._runExpressionQueue("visibleExp");
            this._runExpressionQueue("valueCommitScript");
            this._runExpressionQueue("validateAllExp");
            this._runExpressionQueue("optionsExp");
            this._runExpressionQueue("navigationChangeExp");
            this._runExpressionQueue("summaryExp");
            this._runExpressionQueue("aggregateExp");
            this._runExpressionQueue("submitSuccess");
            this._runExpressionQueue("submitError");
            if (window.guideBridge.hostName !== "server") {
                this._runExpressionQueue("autoSaveStartExp");
            }
            this._resetExpressionCounters();
        },

        _runExpressionQueue : function (expName) {
            var expQueue = this._pendingQueues[expName], node;
            if (expQueue) {
                while (expQueue.length > 0) {
                    node = this._pendingQueues[expName].shift();
                    node.executeExpression(expName);
                }
            }
        },

        queueExpressions : function (node, expressionArray) {
            if (!node || !expressionArray) {
                return;
            }
            if (_.isString(expressionArray)) {
                expressionArray = [expressionArray];
            }
            _.each(expressionArray, function (expression) {
                var expQueue = this._pendingQueues[expression],
                    som = node.somExpression,
                    counters = this._runningExpressionCount[expression];
                counters[som] = counters[som] || 0;
                if (expQueue && expQueue.indexOf(node) < 0 && counters[som] < 10) {
                    expQueue.push(node);
                    counters[som] += 1;
                }
            }, this);
        },

        _createGetterSetter : function (container, name, ref) {
            var iName = "_" + name + "_";
            if (!container.hasOwnProperty(name)) {
                Object.defineProperty(container, name, {
                    get : function () {
                        if (this._private[iName]) {
                            return this._private[iName]._getNakedThis();
                        }
                        return undefined;
                    },
                    set : function (val) {
                        var curRef = this._private[iName];
                        if (_.isObject(curRef)) {
                            curRef[curRef._default] = val;
                        } else {
                            this.logger().warn("AF", "Trying to set unloaded field's model <" + name + ">");
                        }
                    }
                });
            }
            container._private[iName] = ref;
        },

        playJson : function (pJsonModel) {
            this.rootPanel.playJson(pJsonModel.rootPanel);
            if (this.toolbar) {
                this.toolbar.playJson(pJsonModel.toolbar);
            }
        },

        _collectValues : function (keyValue) {
            _.each(this._children, function (childNode) {
                childNode._collectValues(keyValue);
            }, this);
        },

        
        resolveNode : function (somExpression) {
            if (!somExpression || somExpression === "") {
                return;
            }
            var hierarchy = somExpression.split("."),
                componentInModel = null;
            if (hierarchy[0] === "guide[0]") {
                hierarchy.shift();
                componentInModel = this;
            }
            if (hierarchy[0] === this._escapeQualifiedName()) {
                componentInModel = this;
                hierarchy.shift();
            } else if (this.hasOwnProperty(hierarchy[0])) {
                componentInModel = this[hierarchy[0]];
                hierarchy.shift();
            } else if (!componentInModel) {
                componentInModel = this.rootPanel;
            }
            _.each(hierarchy, function (element) {
                if (componentInModel && componentInModel._findChildren) {
                    componentInModel = componentInModel._findChildren(element, false)[0];
                } else {
                    componentInModel = null;
                }
            }, this);
            if (componentInModel == null) {
                
                var relativeName = somExpression;
                componentInModel = this.getOrElse(guidelib.runtime, relativeName, null);
            }
            return componentInModel;
        }
    });

    GuideContainerNode.defineProps({

        submitSuccess : {
            get : function () {
                return this.jsonModel.submitSuccess;
            }
        },

        submitError : {
            get : function () {
                return this.jsonModel.submitError;
            }
        },

        
        "autoSaveStart" : {
            get : function () {
                return this.jsonModel.autoSaveStart;
            },

            set : function (newValue) {
                this.jsonModel.autoSaveStart = newValue;
                if (newValue === true) {
                    delete this._compiledExpressions.autoSaveStartExp;
                    this._triggerOnBridge(window.guideBridge.GUIDE_AUTO_SAVE_START, this);
                }
            }
        },

        
        "enableAutoSave" : {
            set : function (newValue) {
                this.jsonModel.enableAutoSave = newValue;
            },

            get : function () {
                return this.jsonModel.enableAutoSave || false;
            }
        },

        
        "autoSaveStartExpression" : {
            get : function () {
                return this.jsonModel.autoSaveStartExpression;
            }
        },

        
        "autoSaveInfo" : {
            get : function () {
                return this.jsonModel.autoSaveInfo;
            }
        },

        
        "globalMetaInfo" : {
            get : function () {
                return this.jsonModel.globalMetaInfo;
            }
        },

        
        "submissionMetaInfo" : {
            get : function () {
                return this.jsonModel.submissionMetaInfo;
            }
        },

        
        "signerInfo" : {
           get : function () {
               return this.jsonModel.signerInfo;
           }
       },

        "xdpRef" : {
            get : function () {
                return this.jsonModel.xdpRef;
            }
        },

        "dorTemplateRef" : {
            get : function () {
                return this.jsonModel.dorTemplateRef;
            }
        },

        "dorType" : {
            get : function () {
                return this.jsonModel.dorType;
            }
        },

        "actionType" : {
            get : function () {
                return this.jsonModel.actionType;
            }
        },

        "xsdRef" : {
            get : function () {
                return this.jsonModel.xsdRef;
            }
        },

        
        panel : {
            get : function () {
                return this.rootPanel;
            }
        },

        
        print : {
            get : function () {
                if (this.dorType === "generate" && this.jsonModel.view) {
                    return this.jsonModel.view.print;
                }

                return null;
            }
        },

        
        "allLazyChildren" : {
            get : function () {
                return this.jsonModel.allLazyChildren;
            }
        },

        
        "enableAsyncSubmission" : {
            set : function (newValue) {
                this.jsonModel.enableAsyncSubmission = newValue;
            },

            get : function () {
                if (this.jsonModel.enableAsyncSubmission && (this.jsonModel.enableAsyncSubmission === "true" || this.jsonModel.enableAsyncSubmission === true)) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        
        "enableAdobeSign" : {
            get : function () {
                return this.jsonModel._useSignedPdf;
            }
        }
    });
}(_, guidelib));



(function (_, guidelib) {

    
    var GuidePanel = guidelib.model.GuidePanel = guidelib.model.GuideItemsContainer.extend({
        msClassName : "guidePanel",
        defaultExpressions : {
            "summary" : "this.title + (this.instanceIndex > 0 ? ' ' + this.instanceIndex : '')"
        },

        initialize : function () {
            GuidePanel._super.initialize.call(this);
            this._currentItem = null;
            
            this._navigationContext = null;
        },

        _collectExpressions : function () {
            GuidePanel._super._collectExpressions.call(this);
            if (this.completionExp) {
                this._compiledScripts.completionExp = this._compileExpression(this.completionExp, null);
            }
            if (this.jsonModel.summaryExp) {
                this._compiledExpressions.summaryExp = this._compileExpression(this.jsonModel.summaryExp, "summary");
            } else {
                this._compiledExpressions.summaryExp = this._compileExpression(this.defaultExpressions["summary"], "summary");
            }
        },

        _initializeInstanceManager : function (child, index, insertOffset) {
            var instanceManager = guidelib.model.GuideModelRegistry.prototype.createInstanceManager(child);
            this._initializeChild(instanceManager);
            
            this._children.splice(index + insertOffset++, 0, instanceManager);
            instanceManager._manageChild(child);
            
            var bindNode = child._getBindNode(),
                bindNodeInstCount = this.getOrElse(bindNode, "instanceManager.count", 0),
            
                panelInstancesToAdd = Math.max(child.minOccur, bindNodeInstCount) - 1,
                bindNodeOffset = 1,
                addedXfaInstance;
            while (panelInstancesToAdd > 0) {
                
                addedXfaInstance = null;
                if (bindNodeInstCount > 1) {
                    
                    addedXfaInstance = bindNode.instanceManager.instances[bindNodeOffset++];
                }
                instanceManager.addInstance(addedXfaInstance);
                panelInstancesToAdd -= 1;
                insertOffset += 1;
            }
            return insertOffset;
        },

        
        _initChildren : function (bLazyInitialization) {
            GuidePanel._super._initChildren.call(this);
            if (!bLazyInitialization) {
                this._instanceManager = null;
            }
            this._childInitializeGoingOn = true;
            var currentChildren = this.children,
                insertOffset = 0;
            _.each(currentChildren, function (child, index) {
                if (child instanceof guidelib.model.GuidePanel) {
                    insertOffset = this._initializeInstanceManager(child, index, insertOffset);
                }
            }, this);
            if (this.jsonModel.toolbar) {
                var toolbar = guidelib.model.GuideModelRegistry.prototype.createModel(this.jsonModel.toolbar);
                this._initializeChild(toolbar);
                this._children.push(toolbar);
            }
            this._summary = null;
            this._childInitializeGoingOn = false;
        },

        _postInitialize : function () {
            GuidePanel._super._postInitialize.call(this);
            
            this.instanceManager._postInitializeBinding();
        },

        _addChildAt : function (child, childIndex) {
            if (child) {
                this._initializeChild(child);
                this._guide()._modelTemplateCacheStore.putModel(child);
                var newItemIndex = this._getItemsInsertIndex(childIndex - 1);
                var newItems = {};
                var newItemKey = child.id;
                var lastItemIndex = -1;
                _.each(this.jsonModel.items, function (value, key) {
                    if (lastItemIndex == newItemIndex - 1) {
                        newItems[newItemKey] = child.jsonModel;
                    }
                    newItems[key] = value;
                    lastItemIndex++;
                }, this);
                if (lastItemIndex == newItemIndex - 1) {
                    newItems[newItemKey] = child.jsonModel;
                }
                this.jsonModel.items = newItems;
                child._isItem = true;
                this._children.splice(childIndex, 0, child);
                this._normalizeChildren();
                child._postInitialize();
                if (this._guide().getGuideState() >= guidelib.model.GuideSchema.prototype.GuideStateConstants.GUIDE_STATE_MERGE_COMPLETE) {
                    child.prepare();
                }
                
                
                
                if (!(this._lazyReference && this._childInitializeGoingOn)) {
                    this._triggerEvent(guidelib.event.GuideModelEvent.CHILD_CHANGED, "childAdded", null, child);
                }
            }
        },

        
        validate : function (errorList) {
            var markInvalid = false;

            
            if (!this.visible) {
                return true;
            }
            var lazyModelUnloadPending = false;
            
            if (this._lazyReference && this.guideUtil.isLazyJson(this.jsonModel)) {
                var guideDirtyMarker = guidelib.internal.GuideDirtyMarkerAndVisitor,
                    visitMap = guideDirtyMarker.visitMap,
                    modelTemplateCacheStore = this._guide()._modelTemplateCacheStore,
                    guideUtil = guidelib.util.GuideUtil,
                    templateJson,
                    templateId = this.templateId,
                    uniquePrefix;
                
                if (visitMap[templateId] === 0) {
                    if (this._ancestorRepeatable) {
                        uniquePrefix = guideUtil.generateUID();
                    }
                    
                    templateJson = modelTemplateCacheStore._getTemplate(templateId, true);
                    
                    
                    if (!_.isEmpty(templateJson)) {
                        this._embedJson(templateJson.items, uniquePrefix);
                        guidelib.internal.liveDataUtils.playLiveData(this);
                        
                        this.prepare();
                        this._guide().runPendingExpressions();
                        guidelib.internal.liveDataUtils.updateLiveData(); 
                        lazyModelUnloadPending = true;
                    } else {
                        
                        markInvalid = true;
                    }

                }

            }
            var validationResult = GuidePanel._super.validate.call(this, errorList);
            if (lazyModelUnloadPending) {
                
                
                this._unloadLazyReferenceModel(true);
            }
            if (markInvalid === true) {
                validationResult = false;
            }
            return validationResult;
        },

        
        _unloadLazyReferenceModel : function (muteValidation) {
            try {
                if (this._lazyReference) {
                    if (!muteValidation) {
                        var validationStatus = this.validate(),
                            visitMap = guidelib.internal.GuideDirtyMarkerAndVisitor.visitMap;
                        if (validationStatus === false && visitMap[this.id] > 0) {
                            visitMap[this.id] = 0;
                        }
                    }
                    
                    
                    _.each(this.children, function (child) {
                        child._unloadModel(muteValidation);
                        var nIndex = this._children.indexOf(child);
                        
                        this._children.splice(nIndex, 1);
                        var childKey = null;
                        
                        _.each(this.jsonModel.items, function (value, key) {
                            if (value === child.jsonModel) {
                                childKey = key;
                            }
                        }, this);
                        if (childKey) {
                            delete this.jsonModel.items[childKey];
                        }
                        
                        this._normalizeChildren();
                    }, this);
                    
                    this._navigationContext = null;
                    this._currentItem = null;
                }
            } catch (exception) {
                this.logger().error(exception);
            }

        },
        
        _unloadModel : function (muteValidation) {
            var visitMap = guidelib.internal.GuideDirtyMarkerAndVisitor.visitMap;
            _.each(this.children, function (child) {
                if (this._lazyReference && !muteValidation) {
                    var validationStatus = child.validate();
                    if (validationStatus === false) {
                        if (!_.isUndefined(visitMap[this.templateId])) {
                            visitMap[this.templateId] = 0;
                        }
                    }
                }
                child._unloadModel(muteValidation);
            }, this);
            guidelib.model.Scriptable.prototype._unloadModel.call(this);
        },

        _removeChild : function (oChild) {
            oChild._unloadModel();
            var nIndex = this._children.indexOf(oChild);
            this._children.splice(nIndex, 1);
            var childKey = null;
            _.each(this.jsonModel.items, function (value, key) {
                if (value === oChild.jsonModel) {
                    childKey = key;
                }
            }, this);
            if (childKey) {
                delete this.jsonModel.items[childKey];
            }
            this._normalizeChildren();
            this._triggerEvent(guidelib.event.GuideModelEvent.CHILD_CHANGED, "childRemoved", oChild, null);
        },

        
        _embedJson : function (referredJson, uniquePrefix) {
            
            var bIsSuccess = false;
            var clonedJson = JSON.parse(JSON.stringify(referredJson)),
                currentPanelId = this.id,
                referredPanelRoot = null,
                referredPanelRootName = null,
                bindRefPrefix = this.jsonModel.bindRef;
            
            currentPanelId = currentPanelId.slice(0, -2);
            if (referredJson) {
                
                if (this.repeatable || this._ancestorRepeatable) {
                    this.copyObject(referredJson, clonedJson,
                        {
                            transformMaps : {
                                "id" : function (srcValue, options, parentObj) {
                                    return uniquePrefix + "__" + parentObj.templateId;
                                }
                            }
                        }
                    );
                }
                
                
                _.each(clonedJson, function (panelJson, panelName) {
                    if (_.isObject(panelJson)) {
                        bIsSuccess = true;
                        
                        this.jsonModel.items = this.jsonModel.items || {};
                        this.jsonModel.items[panelName] = panelJson;
                        
                        this._guide()._modelTemplateCacheStore._putTemplate(JSON.parse(JSON.stringify(panelJson)));
                    }
                }, this);
                
                this._embedModel();

            }
            if (bIsSuccess === true) {
                
            }
            return bIsSuccess;
        },

        
        _embedModel : function () {
            
            this._initChildren(true);
            
            
            this._guide()._modelTemplateCacheStore.putModel(this);
            
            this._postInitialize();
            
            this._normalizeChildren();
        },

        _getItemsInsertIndex : function (childIndex) {
            var itemIndex = 0;
            _.find(this._children, function (child, index) {
                if (child._isItem) {
                    itemIndex++;
                }
                if (index >= childIndex) {
                    return true; 
                }
            }, this);
            return itemIndex;
        },

        playJson : function (pJsonModel) {
            var playNonPanelItems = {};
            var playPanelItems = {};
            _.each(pJsonModel.items, function (item) {
                if (_.isObject(item)) {
                    if (item.guideNodeClass === "guidePanel" || item.guideNodeClass === "guideTable" || item.guideNodeClass === "guideTableRow") {
                        if (playPanelItems[item.name]) {
                            playPanelItems[item.name].push(item);
                        } else {
                            playPanelItems[item.name] = [item];
                        }
                    } else {
                        if (playNonPanelItems[item.name]) {
                            playNonPanelItems[item.name].push(item);
                        } else {
                            playNonPanelItems[item.name] = [item];
                        }
                    }
                }
            }, this);

            
            var panelIMs = _.filter(this._children, function (child) {
                return child instanceof guidelib.model.GuideInstanceManager;
            }, this);

            _.each(panelIMs, function (instanceManager) {
                var panelName = instanceManager._getInstanceName();
                var newPanelItems = playPanelItems[panelName] || []; 
                var panelInstances = instanceManager._instances.slice(0);
                _.each(panelInstances, function (panelInstance, index) {
                    if (newPanelItems.length > 0) {
                        var panelJson = newPanelItems.shift();
                        panelInstance.playJson(panelJson);
                    } else {
                        instanceManager.removeInstance(index);
                    }
                }, this);
                if (newPanelItems.length > 0) {
                    _.each(newPanelItems, function (paneljson) {
                        var addedInstance = instanceManager.addInstance();
                        if (addedInstance) {
                            addedInstance.playJson(paneljson);
                        }
                    }, this);
                }
            }, this);

            
            _.each(this.items, function (child) {
                if (!(child instanceof guidelib.model.GuidePanel)) {
                    var nonPanelItemName = child.name;
                    var nonPanelItem = playNonPanelItems[nonPanelItemName];
                    if (nonPanelItem && nonPanelItem.length > 0) {
                        child.playJson(nonPanelItem.shift());
                    }
                }
            }, this);

            
            if (this.toolbar) {
                this.toolbar.playJson(pJsonModel.toolbar);
            }
        },
        
        _getReducedJSON : function (isParentRepeatable) {
            var reducedJSONChildren,
                isRepeatable;
            isRepeatable = isParentRepeatable || this.canBeRepeatable;
            reducedJSONChildren = GuidePanel._super._getReducedJSON.call(this, isRepeatable);
            
            
            if (this.jsonModel.toolbar) {
                reducedJSONChildren["toolbar"] = this.toolbar._getReducedJSON();
            }
            return reducedJSONChildren;
        },

        _getRole : function () {
            var guideRole, xfaRole, roleMap;
            
            roleMap = {
                "Table" : "grid",
                "Header Row" : "rowHeader",
                "Body Row" : "rowGroup",
                "Footer Row" : "rowGroup",
                "List" : "list"
            };
            if (this.bindNode) {
                xfaRole = this.getOrElse(this.bindNode.assist && this.bindNode.assist.role, null);
                if (xfaRole) {
                    guideRole = roleMap[xfaRole];
                }
            }
            return guideRole;
        },
        _getAssistPriority : function () {
            return (this.getAttribute("assistPriority") || "description");
        },

        _getScreenReaderText : function () {
            var screenReaderText, assistPriority = this._getAssistPriority();
            if (assistPriority !== "description") {
                screenReaderText = GuidePanel._super._getScreenReaderText.apply(this);
            }
            return screenReaderText;
        },

        execCompletion : function () {
            var complete = true;
            _.find(this.children, function (childModel) {
                
                if (childModel instanceof guidelib.model.GuidePanel && !childModel.execCompletion()) {
                    complete = false;
                    return true;    
                }
            }, this);
            if (complete && this.completionExp) {
                complete = this.executeExpression("completionExp");
            }
            return complete;
        },

        _preserveLazyValue : function () {
            return !this._isXfaNode() && !(this instanceof guidelib.model.RootPanelNode)
                && (this.canBeRepeatable || guidelib.internal.liveDataUtils.isIndexedPath(this.bindRef));
        },

        
        _syncModelAndData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar, updateInstances, recurse) {
            var dataUtils = guidelib.internal.liveDataUtils;
            if (this._preserveLazyValue()) {

                var dataContext = dataUtils._getDataContext(this, bound_indexedXpathSoFar, unBound_indexedXpathSoFar),
                    indexedXpath = dataContext.indexedXpath;

                if (this.canBeRepeatable) {
                    
                    if (_.isFunction(updateInstances) && this.instanceIndex === 0) {
                        updateInstances(dataUtils.getDataInstances(dataContext, this._getDataNodeName()),
                            dataUtils.getParentDataNode(dataContext));
                    }
                    indexedXpath = dataUtils.addIndexToPath(indexedXpath, this.instanceIndex);
                }

                
                if (dataContext.xmlSec === guidelib.internal.liveDataUtils.constants.UNBOUND_TAG) {
                    unBound_indexedXpathSoFar = indexedXpath;
                } else if (dataContext.xmlSec === guidelib.internal.liveDataUtils.constants.BOUND_TAG) {
                    bound_indexedXpathSoFar = indexedXpath;
                }
            }

            if (_.isString(recurse)) {
                
                _.each(this.items, function (item) {
                    if (_.isFunction(item[recurse])) {
                        item[recurse](bound_indexedXpathSoFar, unBound_indexedXpathSoFar);
                    }
                });
            }

            return {
                'bound' : bound_indexedXpathSoFar,
                'unBound' : unBound_indexedXpathSoFar
            };
        },

        _getDataNodeName : function () {
            var bindRef = this.bindRef,
                dataNodeName;
            if (bindRef) {
                dataNodeName = bindRef.substring(bindRef.lastIndexOf("/") + 1);
            } else {
                
                dataNodeName = this.getAttribute("name");
            }
            return dataNodeName;
        },

        _updateLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            var dataUtils = guidelib.internal.liveDataUtils,
                that = this;
            function updateDataInstances(dataNodes, parentNode) {
                var count = that.instanceManager.instanceCount;
                if (dataNodes && (dataNodes.length > count)) {
                    
                    for (var i = count; i < dataNodes.length; ++i) {
                        dataUtils.removeChild(parentNode, that._getDataNodeName(), i);
                    }
                }
            }

            var contextSoFar = this._syncModelAndData(bound_indexedXpathSoFar, unBound_indexedXpathSoFar, updateDataInstances, '_updateLiveData');
        },

        _playLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            var parentArgs = arguments,
                that = this;

            function updateModelInstances(dataNodes, parentNode) {
                
                if (dataNodes && (dataNodes.length < that.instanceManager.instanceCount)) {
                    
                    for (i = Math.max(dataNodes.length, Math.abs(that.minOccur)); i < that.instanceManager.instanceCount; ++i) {
                        that.instanceManager.removeInstance(i);
                    }
                } else if (dataNodes && (dataNodes.length > that.instanceManager.instanceCount)) {
                    
                    var totalInstances = that.maxOccur < 0 ? dataNodes.length : Math.min(dataNodes.length, that.maxOccur);
                    for (i = that.instanceManager.instanceCount; i < totalInstances; ++i) {
                        var addedInstance = that.instanceManager.addInstance();
                        if (addedInstance) {
                            that._playLiveData.apply(addedInstance, parentArgs);
                        }
                    }
                }
            }

            this._syncModelAndData(bound_indexedXpathSoFar, unBound_indexedXpathSoFar, updateModelInstances, '_playLiveData');
        }
    });

    GuidePanel.defineProps({
        
        completionExp : {
            get : function () {
                return this.getAttribute("completionExp");
            }
        },

        completionExpReq : {
            get : function () {
                return this.getAttribute("completionExpReq");
            }
        },

        
        minOccur : {
            get : function () {
                return this.getOrElse(this.jsonModel.minOccur, 1);
            }
        },

        
        maxOccur : {
            get : function () {
                return this.getOrElse(this.jsonModel.maxOccur, 1);
            }
        },
        initialOccur : {
            get : function () {
                return this.getOrElse(this.jsonModel.initialOccur, 1);
            }
        },
        
        repeatable : {
            get : function () {
                return (this.minOccur != 1 || this.maxOccur != 1);
            }
        },

        
        canBeRepeatable : {
            get : function () {
                return (this.maxOccur < 0 || this.maxOccur > 1);
            }
        },
        
        panel : {
            get : function () {
                return this;
            }
        },
        toolbar : {
            get : function () {
                this.getElement("guideToolbar");
            }
        },
        
        instanceManager : {
            get : function () {
                return this._instanceManager;
            }
        },
        instanceIndex : {
            get : function () {
                var context = this._guide()._currentContext;
                if (context && context.managedExp) {
                    this._addDependant(context.contextNode, context.expression);
                }
                return this.instanceManager._instances.indexOf(this);
            }
        },
        
        title : {
            get : function () {
                return this.jsonModel["jcr:title"];
            },
            set : function (value) {
                var oldTitle = this.title;
                if (oldTitle !== value) {
                    this.jsonModel["jcr:title"] = value;
                    this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                        guidelib.event.GuideModelEvent.createEvent(
                            guidelib.event.GuideModelEvent.MODEL_CHANGED,
                            this,
                            "title",
                            oldTitle,
                            value
                        )
                    );
                }
            }
        },
        
        summary : {
            get : function () {
                return this._summary;
            },
            set : function (value) {
                var oldSummary = this._summary;
                if (oldSummary !== value) {
                    this._summary = value;
                    this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                        guidelib.event.GuideModelEvent.createEvent(
                            guidelib.event.GuideModelEvent.MODEL_CHANGED,
                            this,
                            "summary",
                            oldSummary,
                            this._summary
                        )
                    );
                }
            }
        },
        enableLayoutOptimization : {
            get : function () {
                return this.getOrElse(this.jsonModel, "layout.enableLayoutOptimization", false);
            }
        },

        
        isNavigable : {
            get : function () {
                var isNonNavigable = this.getOrElse(this.jsonModel, "layout.nonNavigable", false);
                
                
                if (typeof isNonNavigable === 'string') {
                    return !(isNonNavigable === "true");
                } else {
                    return !isNonNavigable;
                }
            }
        },
        
        _hopsToRootPanel : {
            get : function () {
                return guidelib.util.GuideUtil._countHopsToRootPanel(this);
            }

        },
        
        _ancestorRepeatable : {
            get : function () {
                var parentOrAncestor = this.parent;
                while (parentOrAncestor) {
                    if (parentOrAncestor && parentOrAncestor.repeatable) {
                        return true;
                    }
                    parentOrAncestor = parentOrAncestor.parent;
                }

                return false;
            }
        },

        
        enabled : {
            get : function () {
                return guidelib.model.Scriptable.prototype._getEnabled.call(this);
            },

            set : function (value) {
                var oldValue = this.enabled;
                guidelib.model.Scriptable.prototype._setEnabled.call(this, value);
                if (this._parentAccess && value != oldValue) {
                    this._changeContainerAccess(value);
                }
            }
        },

        
        _hasLazyDescendant : {
            get : function () {
                if (!_.isEmpty(guideBridge._guide.allLazyChildren)) {
                    return true;  
                }
                return false;
            }
        }
    });

    
    GuidePanel.addMixins([
        guidelib.model.mixin.AddNavigationContext,
        guidelib.model.mixin.AddDependencyMgmt
    ]);

})(_, guidelib);


(function (_, guidelib) {
    var RootPanelNode = guidelib.model.RootPanelNode = guidelib.model.GuidePanel.extend({
        msClassName : "rootPanelNode",
        
        _clearInactiveLazyViews : function (panelView) {
            _.each(this.childViews, function (item) {
                item._clearInactiveLazyViews(panelView);
            });
        }

    });
    RootPanelNode.defineProps({
        toolbar : {
            get : function () {
                
                return this.getElement("guideToolbar") || this.parent.toolbar;
            }
        }
    });
})(_, guidelib);

(function (_, guidelib) {
    var GuideTableRow = guidelib.model.GuideTableRow = guidelib.model.GuidePanel.extend({
        msClassName : "guideTableRow"
    });
}(_, guidelib));

(function (_, guidelib) {

    
    var GuideTable = guidelib.model.GuideTable = guidelib.model.GuidePanel.extend({
        msClassName : "guideTable"
    });

    GuideTable.defineProps({
        
        mobileLayout : {
            get : function () {
                return this.jsonModel.layout.mobileLayout;
            }
        },

        columnWidth : {
            get : function () {
                return this.jsonModel.columnWidth;
            }
        }
    });
})(_, guidelib);


(function (_, guidelib) {

    
    var GuideCompositeField = guidelib.model.GuideCompositeField = guidelib.model.GuideItemsContainer.extend({
        msClassName : "guideCompositeField",
        initialize : function () {
            this._uuid = guideBridge._produceUUID();
            GuideCompositeField._super.initialize.call(this);
        },

        _setGuideValue : function (value) {
            if (!_.isEmpty(value)) {
                _.each(this.items, function (item) {
                    if (value.hasOwnProperty(item.name) && _.isFunction(item._setGuideValue)) {
                        item._setGuideValue(value[item.name]);
                    }
                }, this);
            }
        },

        _collectExpressions : function () {
            GuideCompositeField._super._collectExpressions.apply(this);
            if (this.valueCommitScript) {
                
                this._compiledScripts.valueCommitScript = this._compileExpression(this.valueCommitScript, null);
            }
        }
    });

    GuideCompositeField.defineProps({
        valueCommitScript : {
            get : function () {
                return this.getAttribute("valueCommitScript");
            }
        },
        uuid : {
            get : function () {
                return this._uuid;
            },
            set : function (newUuid) {
                if (this._uuid != newUuid) {
                    this._uuid = newUuid;
                }
            }
        }
    });

})(_, guidelib);


(function (_, guidelib) {

    
    var GuideFileUpload = guidelib.model.GuideFileUpload = guidelib.model.GuideCompositeField.extend({
        msClassName : "guideFileUpload",
        _getReducedJSON : function () {
            this._syncModelToAttachments();
            var reducedJSONChildren = GuideFileUpload._super._getReducedJSON.call(this),
                addtionalWhitelistedProperties = ["id", "files"];
            guidelib.model.util.CommonUtils.prototype.returnMinimalJSON(addtionalWhitelistedProperties, reducedJSONChildren, this);
            return reducedJSONChildren;
        },

        _triggerFileListChange : function () {
            var currValue = this._fileList;
            this.trigger(guidelib.event.GuideModelEvent.MODEL_CHANGED,
                guidelib.event.GuideModelEvent.createEvent(
                    guidelib.event.GuideModelEvent.MODEL_CHANGED,
                    this,
                    "fileList",
                    currValue,
                    currValue
                )
            );
        },

        _syncModelToAttachments : function () {
            var files = this.fileAttachment.value || "",
                uniqueNames = guideBridge._makeFileNameUnique();
            this.jsonModel.files =
                _.map(files.split('\n'), function (file, index) {
                    if (!_.isEmpty(file)) {
                        if (uniqueNames && file[0] !== '/') {
                            file = this.uuid + "-" + (index + 1) + "__afAttachment__" + file; 
                        }
                    }
                    return file;
                }, this).join('\n');
        }

    });

    GuideFileUpload.defineProps({
        
        multiSelection : {
            get : function () {
                return this.getAttribute("multiSelection");
            }
        },

        buttonText : {
            get : function () {
                return this.getAttribute("buttonText");
            }
        },

        showComment : {
            get : function () {
                return this.getAttribute("showComment");
            }
        },

        
        fileSizeLimit : {
            get : function () {
                return this.getAttribute("fileSizeLimit");
            }
        },

        fileList : {
            get : function () {
                return this._fileList;
            },

            set : function (newValue) {
                var oldValue = this._fileList;
                var newTypedValue = newValue;
                if (newTypedValue != oldValue) {
                    this._fileList = newTypedValue;
                }
                this._triggerFileListChange();
            }
        },
        value : {
            get : function () {
                this._syncModelToAttachments();
                return this.jsonModel.files;
            }
        }
    });

})(_, guidelib);


(function (_, guidelib) {
    
    var GuideTermsAndConditions = guidelib.model.GuideTermsAndConditions =  guidelib.model.GuideCompositeField.extend({
        msClassName : "guideTermsAndConditions",

        playJson : function (pJsonModel) {
            this.jsonModel.clickStatus = pJsonModel.clickStatus;
            GuideTermsAndConditions._super.playJson.apply(this, arguments);
        },

        _updateLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            this._syncModelAndData(bound_indexedXpathSoFar, unBound_indexedXpathSoFar, '_updateLiveData');
        },

        _playLiveData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar) {
            this._syncModelAndData(bound_indexedXpathSoFar, unBound_indexedXpathSoFar, '_playLiveData');
            if (this.reviewStatus.value === "true") {
                this.clickStatus = "agree";
            } else {
                this.clickStatus = "unreviewed";
            }
        },

        _syncModelAndData : function (bound_indexedXpathSoFar, unBound_indexedXpathSoFar, recurse) {
            if (_.isString(recurse)) {
                var dataContext = guidelib.internal.liveDataUtils._getDataContext(this, bound_indexedXpathSoFar, unBound_indexedXpathSoFar);
                if (dataContext.xmlSec === guidelib.internal.liveDataUtils.constants.BOUND_TAG) {
                    bound_indexedXpathSoFar = dataContext.indexedXpath;
                } else {
                    unBound_indexedXpathSoFar = dataContext.indexedXpath;
                }
                _.each(this.items, function (item) {
                    if (_.isFunction(item[recurse])) {
                        item[recurse](bound_indexedXpathSoFar, unBound_indexedXpathSoFar);
                    }
                });
            }
        }
    });

    GuideTermsAndConditions.defineProps({
        showLink : {
            get : function () {
                return this.getAttribute("showLink");
            }
        },

        
        clickStatus : {
            get : function () {
                return this.getAttribute("clickStatus");
            },
            set : function (status) {
                this.setAttribute(status, "clickStatus");
            }
        },

        showAsPopUp : {
            get : function () {
                return this.getAttribute("showAsPopUp");
            }
        }
    });

})(_, guidelib);

(function ($, guidelib, _) {
    var CommonUtils = guidelib.model.util.CommonUtils = xfalib.ut.Class.extend({
        
        
        returnMinimalJSON : function (whitelistedProperties, reducedJsonObject, that) {
            if (!_.isObject(reducedJsonObject)) {
                reducedJsonObject = {};
            }
            _.each(whitelistedProperties, function (whitelistedProperty) {
                if (!_.isUndefined(that.jsonModel[whitelistedProperty])) {
                    reducedJsonObject[whitelistedProperty] = that.jsonModel[whitelistedProperty] ;

                } else if (!_.isUndefined(that[whitelistedProperty])) {
                    reducedJsonObject[whitelistedProperty] = that[whitelistedProperty];
                }
            });
        }
    });

    CommonUtils.defineProps({
    });
}($, guidelib, _));

(function (_, guidelib) {
    var GuideModelRegistry = guidelib.model.GuideModelRegistry = xfalib.ut.Class.extend({

        _nodeClassToFactoryMap : {

        },

        createModel : function (jsonModel, options) {
            var model = null;
            var guideNodeClassTag = "GuideNode";
            if (jsonModel.guideNodeClass && jsonModel.guideNodeClass.length > 0)     {
                guideNodeClassTag = jsonModel.guideNodeClass.charAt(0).toUpperCase() + jsonModel.guideNodeClass.substr(1);
            }
            var factoryFnName = "create" + guideNodeClassTag ;
            if (jsonModel.guideNodeClass && this._nodeClassToFactoryMap[jsonModel.guideNodeClass]) {
                factoryFnName = this._nodeClassToFactoryMap[jsonModel.guideNodeClass];
            }
            if (this[factoryFnName]) {
                model = this[factoryFnName].call(this, jsonModel, options);
            }

            if (!model && guidelib.model[guideNodeClassTag]) {
                model = new guidelib.model[guideNodeClassTag](this._getOptions(jsonModel, options));
            }

            if (!model) {
                if (jsonModel.items) {
                    model = new guidelib.model.GuideItemsContainer(this._getOptions(jsonModel, options));
                } else {
                    model = new guidelib.model.GuideNode(this._getOptions(jsonModel, options));
                }
            }
            return model;
        },

        _getOptions : function (jsonModel, options) {
            return _.extend({}, options, {"jsonModel" : jsonModel});
        },

        createInstanceManager : function (guidePanelModel) {
            var name =  guidePanelModel.getAttribute("name"),
                imJson = {
                    guideNodeClass : "guideInstanceManager",
                    minOccur : guidePanelModel.minOccur,
                    maxOccur : guidePanelModel.maxOccur,
                    initialOccur : guidePanelModel.initialOccur,
                    instanceTemplateId : guidePanelModel.templateId,
                    name : "_" + name,
                    instanceName : name,
                    templateId : "im_" + guidePanelModel.templateId,
                    id : "im_" + guidePanelModel.id
                };
            return guidelib.model.GuideModelRegistry.prototype.createModel(imJson);
        }
    });
})(_, guidelib);
