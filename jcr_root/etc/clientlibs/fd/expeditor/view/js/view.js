/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/


(function (expeditor, $) {

    var defaultOptions = {
        data : {},
        pageSize : 10,
        itemRenderer : function (key, val) {
               return {
                   value : key,
                   content : {
                      innerHTML : val
                  }
               };
           },
        matcher : function (term) {
               var self = this;
               return function (key, val) {
                   return (val + "").toLowerCase().indexOf((term + "").toLowerCase()) > -1;
               };
           }
    },
    SCROLL_BOTTOM_EVENT = "coral-selectlist:scrollbottom";

    
    var LazySelectList = expeditor.view.LazySelectList = expeditor.EventTarget.extend({

        init : function (options) {
            this.options = $.extend({}, defaultOptions, options);
            this._data = this.options.data;
            this.el = new Coral.SelectList();
            this.$el = $(this.el);
            this.$el.data("lazyList", this);

            this._attachEventHandlers();
            this._filteredKeys = this._keys();
            this._startPos = 0;
            this._pageSize = this.options.pageSize;
            this._appendNextPage();
        },

        _attachEventHandlers : function () {
            this.el.on(SCROLL_BOTTOM_EVENT, $.proxy(this._handleScrollBottom, this));
        },

        _handleScrollBottom : function (e) {
            this._appendNextPage();
        },

        _clearItems : function () {
            this.el.items.clear();
        },

        _keys : function () {
            return Object.keys(this._data);
        },

        _createItem : function (key) {
            return this.options.itemRenderer(key, this._data[key]);
        },

        _appendItem : function (key) {
            this.el.items.add(this._createItem(key));
        },

        _appendNextPage : function (pos) {
            pos = pos || this._startPos;
            var newKeys = this._filteredKeys.slice(pos, pos + this._pageSize);
            this._startPos = this._startPos + newKeys.length;
            newKeys.forEach(this._appendItem, this);
        },

        
        _matcher : function (term) {
            var self = this;
            var userFn = this.options.matcher(term);
            return function (key) {
                return userFn(key, self._data[key]);
            };
        },

        
        filter : function (term) {
            this._clearItems();
            this._startPos = 0;
            var matcherFn = this._matcher(term);
            this._filteredKeys = this._keys().filter(matcherFn);
            this._appendNextPage();
        },

        
        domEl : function () {
            return this.el;
        },

        
        setData : function (data) {
            this._data = data;
            this.filter("");
        }

    });

})(expeditor, jQuery);
(function (expeditor) {
    var notificationTimeout = 0;
    var alertEl = null;
    var BaseView = expeditor.view.BaseView = expeditor.EventTarget.extend({
        init : function (nodeName, ctx, viewConfig) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            this.viewConfig = viewConfig || {};
        },

        markError : function (errorTitle) {
            this.addClass("error", errorTitle);
        },

        removeError : function () {
            this.removeClass("error");
        },

        setParentView : function (view) {
            this.parentView = view;
            this.parentView.addChild(this);
        },

        addChild : function (child) {
            this.children = this.children || [];
            this.children.push(child);
        },

        addClass : function (css, errorTitle) {
            if (this.placeholder) {
                this.placeholder.addClass(css);
                this.placeholder.attr("title", errorTitle);
            }
        },

        removeClass : function (css) {
            if (this.placeholder) {
                this.placeholder.removeClass(css);
            }
        },

        destroy : function () {
            if (this.placeholder) {
                this.placeholder.remove();
            }
            this.unbind();
        },

        showNotification : function (errorMessage, errorHeaderMessage) {
            
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
                notificationTimeout = 0;
            }

            if (alertEl == null) {
                alertEl = new Coral.Alert();
                alertEl.hide();
                alertEl.on('click', function () {
                    this.hide();
                });
                $(".exp-wizard").append(alertEl);
            }
            alertEl.set({
                variant : "error",
                header : {
                    innerHTML : errorHeaderMessage || Granite.I18n.get("ERROR")
                },
                content : {
                    innerHTML : errorMessage
                }
            });
            alertEl.show();
            notificationTimeout = setTimeout(function () {
                if (alertEl) {
                    alertEl.hide();
                }
            }, 5000);
        }
    });
})(expeditor);
(function (expeditor) {
    var FunctionView = expeditor.view.FunctionView = expeditor.view.BaseView.extend({

        init : function () {
            this._super.apply(this, arguments);
            this.functionNameView = null;
            this.parameters = null;
        },

        setParentView : function (view) {
            this._super.apply(this, arguments);
            
            
            this.functionNameView.setParentView(view);
        },

        _hasOption : function (option) {
            return this.functionNameView && this.functionNameView._hasOption(option);
        },

        setValue : function (value, trigger) {
            if (this.functionNameView) {
                this.functionNameView.setValue(value);
                if (trigger) {
                    this.functionNameView.trigger('change');
                }
            }
        },

        setFunctionNameView : function (fnNameView) {
            this.functionNameView = fnNameView;
            this.functionNameView.parentView = this.parentView;
            if (this.functionNameDiv) {
                var fnView = fnNameView.render();
                if (fnView.length > 1) {
                    this.selectList = $(fnView[1]);
                    fnView = $(fnView[0]);
                }
                this.functionNameDiv.html(fnView);
            }
        },

        setParameters : function (parameters) {
            this.parameters = parameters;
            if (this.parametersDiv) {
                this.parametersDiv.empty();
                this.parametersDiv.append("<div class='input-label coral-Heading coral-Heading--6'>" + Granite.I18n.get("INPUT") + "</div>");
                if (parameters != null) {
                    if (!(parameters instanceof Array)) {
                        parameters = [parameters];
                    }
                    parameters.forEach(function (param) {
                        this.parametersDiv.append('<div class="param-description">' + param.description + '</div>');
                        this.parametersDiv.append(param.renderedDom);
                    }, this);
                    if (parameters.length > 0) {
                        this.parametersDiv.show();
                        return;
                    }
                }
                this.parametersDiv.hide();
            }
        },

        render : function () {
            if (!this.placeholder) {
                var placeholder = $('<div></div>"').addClass(this.nodeName);
                var functionNameDiv = $('<div></div>"').addClass("FunctionName").appendTo(placeholder);
                if (this.functionNameView) {
                    var fnView = this.functionNameView.render();
                    if (fnView.length > 1) {
                        this.selectList = $(fnView[1]);
                        fnView = $(fnView[0]);
                    }
                    functionNameDiv.html(fnView);
                }
                this.functionNameDiv = functionNameDiv;
                var parametersDiv = $('<div></div>').addClass("Parameters").appendTo(placeholder);
                if (this.parameters && this.parameters.length > 0) {
                    parametersDiv.append("<div class='input-label coral-Heading coral-Heading--6'>INPUT</div>");
                    this.parameters.forEach(function (param) {
                        parametersDiv.append('<div class="param-description">' + param.description + '</div>');
                        parametersDiv.append(param.renderedDom);
                    }, this);
                } else {
                    parametersDiv.hide();
                }
                var self = this;
                this.parametersDiv = parametersDiv;
                placeholder.children(".FunctionName").on('click', function (e) {
                    if (self.parentView) {
                        self.parentView.trigger('toggleList', {target : this});
                        e.stopPropagation();
                    }
                });
                this.placeholder = placeholder;
            }
            if (this.parentView instanceof expeditor.view.ExpressionView) {
                return $([this.placeholder[0], this.selectList[0]]);
            }
            return this.placeholder;
        }
    });
})(expeditor);
(function (expeditor) {
    var SequenceView = expeditor.view.SequenceView = expeditor.view.BaseView.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.numCells = 0;
            this.cells = [];
            this.cellsContent = [];
            var breaks = expeditor.Utils.getOrElse(config, "breaks", [-1]);
            if (!(breaks instanceof Array)) {
                breaks = [breaks];
            }
            this.breaks = breaks.slice();
            var heading = expeditor.Utils.getOrElse(config, "heading", [-1]);
            if (!(heading instanceof Array)) {
                heading = [heading];
            }
            this.heading = heading;
        },

        set : function (position, element) {
            this.cellsContent[position] = element;
            if (this.placeholder) {
                this.cells[position].find('> *').detach();
                this.cells[position].append(element);
            }
            this.numCells = this.cellsContent.length;
        },

        _renderContent : function (position) {
            if (this.cellsContent[position]) {
                this.cells[position].append(this.cellsContent[position]);
            }
        },

        render : function () {
            if (!this.placeholder) {
                this.placeholder = $('<div class="sequence-view ' + this.nodeName + '"></div>');
                this.cells = [];
                var breaks = this.breaks.slice(),
                    heading = this.heading.slice();
                var nextBreak = breaks.shift(),
                    nextHeading = heading.shift();
                for (var i = 0; i < this.numCells; i++) {
                    this.cells[i] = $('<div class="sequence-view-cell"></div>');
                    this.placeholder.append(this.cells[i]);
                    if (nextBreak === i && i < this.numCells) {
                        this.cells[i].addClass("sequence-view-separator");
                        nextBreak = breaks.shift();
                    }
                    if (nextHeading === i && i < this.numCells) {
                        this.cells[i].addClass("sequence-view-heading");
                        nextHeading = heading.shift();
                    }
                    this._renderContent(i);
                }
            }
            return this.placeholder;
        }
    });
})(expeditor);
(function () {
    var INSERT_AFTER_CLASS = "insertAfter",
        INSERT_BEFORE_CLASS = "insertBefore";
    var AndOrExpressionView = expeditor.view.AndOrExpressionView = expeditor.view.SequenceView.extend({

        set : function (position, content) {
            if (position != 1 && content) {
                if (this.cells[position]) {
                    this.cells[position].detach();
                    if (!content.hasClass("sequence-view-cell")) {
                        this.cells[position] = $('<div class="sequence-view-cell">' +
                            '<coral-icon icon="dragHandle" class="u-coral-openHand"></coral-icon>' +
                            '</div>');
                        var self = this;
                        this._addDragEventHandlers(position);
                        this.cells[position].append(content);

                    } else {
                        this.cells[position] = content;
                    }
                    if (position == 2) {
                        this.cells[1].after(this.cells[position]);
                    } else {
                        this.cells[1].before(this.cells[position]);
                    }
                    if (this.placeholder && this.placeholder.length > 1) {
                        this.placeholder = this.cells[0].add(this.cells[1]).add(this.cells[2]);
                    }
                    this.cellsContent[position] = content;
                } else {
                    this._super.apply(this, arguments);
                }
            } else {
                this._super.apply(this, arguments);
            }
        },

        _addStatement : function () {
            if (this.parentView) {
                this.parentView.trigger("change", {action : "Extend"});
                this.extension.hide();
            }
        },

        _hideAddConditionButton : function () {
            $(".andor-options").hide();
        },

        _deleteStatement : function () {
            this.parentView.trigger("change", {action : "Delete"});
            this._disableExtension();
        },

        _enableExtension : function () {
            var options = $('<div class="andor-options"></div>');
            var addConditionButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Add Condition'), 'addCircle')
                .on('click', $.proxy(this._addStatement, this));
            this.extension = options.append(addConditionButton);
            var deleteButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Delete'), 'delete')
                .on('click', $.proxy(this._deleteStatement, this));
            this.extension.append(deleteButton);
            this.placeholder.append(this.extension);
            this.placeholder.on('click', function (e) {
                if ($(this).children().has(e.target).length == 0) {
                    options.toggle();
                    e.stopImmediatePropagation();
                }
            });
            $(document).off('click', this._hideAddConditionButton);
            $(document).on('click', this._hideAddConditionButton);
        },

        destroy : function () {
            this._super.apply(this, arguments);
            $(document).off('click', this._hideAddConditionButton);
        },

        _disableExtension : function () {
            if (this.extension) {
                this.extension.hide();
            }
        },

        updateView : function (nested) {
            if (this.placeholder) {
                var gp = this.parentView.parentView;
                if (!(gp instanceof AndOrExpressionView)) {
                    nested = true;
                }
                if (!nested && this.placeholder.hasClass("sequence-view")) {
                    this.placeholder = this.placeholder.children();
                } else if (nested && this.placeholder.length > 1) {
                    var placeholder = $('<div class="sequence-view ' + Granite.I18n.get(this.nodeName) + '"></div>');
                    placeholder.append(this.placeholder);
                    this.placeholder = placeholder;
                }
            }
            return this.placeholder;
        },

        _addDragEventHandlers : function (index) {
            if (this.cells && this.cells.length > index) {
                var self = this;
                var dragIcon = this.cells[index].children("coral-icon");
                dragIcon.on('mousedown', function () {
                    self.cells[index].attr("draggable", "true");
                });
                dragIcon.on('mouseup', function () {
                    self.cells[index].removeAttr("draggable");
                });
                this.cells[index].on('dragstart', function (e) {
                    $(this).addClass("drop-disabled");
                    var operatorView = this.previousSibling ||
                        expeditor.Utils.getOrElse(this, "parentElement.parentElement.previousSibling", null) ||
                        this.nextSibling;
                    if (operatorView) {
                        $(operatorView).addClass("drop-disabled");
                        $(operatorView).trigger("drag-operator");
                    }
                    self.trigger('change', {action : 'DragStart', index : index});
                    expeditor.isConditionDragged = true;
                    e.stopImmediatePropagation();
                });

                this.cells[index].on('dragend', function (e) {
                    $(".drop-disabled").removeClass("drop-disabled");
                    self.cells[index].removeAttr("draggable");
                    $("." + INSERT_BEFORE_CLASS).removeClass(INSERT_BEFORE_CLASS);
                    $("." + INSERT_AFTER_CLASS).removeClass(INSERT_AFTER_CLASS);
                    expeditor.isConditionDragged = false;
                });

                this.cells[index].on("dragover", function (e) {
                    if (!$(this).hasClass("drop-disabled") && expeditor.isConditionDragged && expeditor.data && expeditor.data.dragCondition) {
                        var clientY = e.clientY || e.originalEvent.clientY,
                            targetHeight = e.target.clientHeight;
                        var rect = e.target.getBoundingClientRect();
                        if ((rect.top + targetHeight / 2) < clientY) {
                            $(this).removeClass(INSERT_BEFORE_CLASS);
                            $(this).addClass(INSERT_AFTER_CLASS);
                        } else {
                            $(this).removeClass(INSERT_AFTER_CLASS);
                            $(this).addClass(INSERT_BEFORE_CLASS);
                        }
                        return false;
                    }
                });
                this.cells[index].on("dragleave", function (e) {
                    $(this).removeClass(INSERT_AFTER_CLASS);
                    $(this).removeClass(INSERT_BEFORE_CLASS);
                });
                this.cells[index].on("drop", function (e) {
                    if (expeditor.data && expeditor.data.dragCondition) {
                        var nested = false;
                        var conditionComponent = expeditor.data.dragCondition;
                        self.trigger('change', {action : 'DragStart', index : index});
                        var condition = expeditor.data.dragCondition;
                        var childIndex = conditionComponent.parent.childComponents.indexOf(conditionComponent);
                        if (conditionComponent.parent.childComponents[2 - childIndex] === condition) {
                            nested = expeditor.Utils.getOrElse(conditionComponent, "parent.parent.nested", false);
                            condition = condition.parent.parent;
                        }
                        var model = conditionComponent.model.copy();
                        var operator = expeditor.data.dragOperator;
                        if (operator && operator.childComponent) {
                            operator = operator.childComponent.nodeName;
                        }
                        var insertBefore = $(this).hasClass(INSERT_BEFORE_CLASS);
                        conditionComponent.onViewDeleteAction();
                        condition.view._addStatement(null, nested, model, operator, insertBefore, condition.nested);
                        $(".drop-disabled").addClass("drop-disabled");
                    }
                    e.stopImmediatePropagation();
                });
            }
        },

        render : function () {
            if (!this.placeholder) {
                var placeholder = this._super.apply(this, arguments);
                var dragIcon = new Coral.Icon().set({icon : "dragHandle"});
                $(dragIcon).addClass("u-coral-openHand");
                this.cells[0].prepend(dragIcon);
                this.cells[2].prepend(dragIcon.cloneNode());
                var self = this;
                this._addDragEventHandlers(0);
                this._addDragEventHandlers(2);
                this.cells[1].on("drag-operator", function (e) {
                    self.trigger('change', {action : 'DragOperatorStart'});
                });
                
                var gp = this.parentView.parentView;
                if (gp && gp instanceof AndOrExpressionView && !this.parentView.nested) {
                    this.placeholder = placeholder.children();
                }
                if (!this.extension && gp && gp instanceof AndOrExpressionView) {
                    this._enableExtension();
                }
            }
            return this.placeholder;
        }
    });
}());
(function (expeditor) {
    var closeButtonHTML = '<button type="button" class="coral-MinimalButton member-exp-close-btn hide-member-exp-close-btn" title=' + Granite.I18n.get("Close") + ' >' +
                          '<coral-icon icon="close" size="XS" class="coral-MinimalButton-icon"></coral-icon>' +
                          '</button>';
    var MemberExpressionView = expeditor.view.MemberExpressionView = expeditor.view.SequenceView.extend({
        render : function () {
            if (!this.placeholder) {
                var $closeIcon = $(closeButtonHTML);
                $closeIcon.on('click', $.proxy(function (e) {
                    e.stopPropagation();
                    $closeIcon.addClass('hide-member-exp-close-btn');
                    this.parentView.trigger('showdefault');
                }, this));

                this._super.apply(this, arguments)
                    .append($closeIcon)
                    .on('click', function (e) {
                        e.stopPropagation();
                        $closeIcon.removeClass('hide-member-exp-close-btn');
                    });
            }
            this.placeholder.addClass("member-epression");
            return this.placeholder;
        }
    });

    $(document).on('click', function (e) {
        $(".member-epression").children("button.member-exp-close-btn")
        .addClass('hide-member-exp-close-btn');
    });

})(expeditor);
(function (expeditor) {
    var DoubleView = expeditor.view.DoubleView = expeditor.view.SequenceView.extend({
        init : function () {
            this._super.apply(this, arguments);
            this.numCells = 2;
        }
    });
})(expeditor);
(function (expeditor) {
    var optionsTemplate = '<div class="binary-expression-selectlist">' +
                            '<button class="coral-Button"><coral-icon icon="close" size="XS"></coral-icon></button>' +
                            '</div>';
    var BinaryExpressionView = expeditor.view.BinaryExpressionView = expeditor.view.SequenceView.extend({
        render : function () {
            if (!this.placeholder) {
                this.placeholder = $('<div class="BINARY_EXPRESSION"></div>');
                this.table = $('<table frame=box  ></table>');
                this.placeholder.append(this.table);
                this.row = $('<tr></tr>');
                this.table.append(this.row);
                this.cells = [];
                for (var i = 0; i < this.numCells; i++) {
                    this.cells[i] = $('<td class="bin-exp-table-cell" ></td>');
                    this.row.append(this.cells[i]);
                    if (this.cellsContent[i]) {
                        this.cells[i].append(this.cellsContent[i]);
                    }
                }
                var addButton = $('<td class="bin-exp-table-cell" ><div class="envelopeButton">' + Granite.I18n.get("Extend Expression") + '</div></td>');
                this.row.append(addButton);
                addButton.children(".envelopeButton").on('click', $.proxy(this.onAddClicked, this));
                this.selectList = $(optionsTemplate);
                this.selectList.find("button").on("click", $.proxy(this.onDeleteClicked, this));
                this.placeholder.prepend(this.selectList);
                var self = this;
                this.placeholder.on("click", function (e) {
                    var tbody = $(this).find(".choice-model,.extended-choice-model");
                    tbody = tbody.has($(e.target));
                    var icon = self.selectList.find("button"),
                        addIcon = addButton.children(".envelopeButton");
                    if (!tbody || tbody.length === 0) {
                        icon.toggle();
                        addIcon.toggle();
                        e.stopImmediatePropagation();
                    }
                });
            }
            this.parentView.trigger("hideoptions");
            return this.placeholder;
        },

        onAddClicked : function (e) {
            this.trigger('change', {action : 'Envelope'});
        },

        onDeleteClicked : function (e) {
            this.trigger('change', {action : 'DeleteContainer'});
        }
    });

})(expeditor);

$(document).on('click', function (e) {
    var icon = $(".binary-expression-selectlist").find("button"),
        addIcon = $(".envelopeButton");
    icon.hide();
    addIcon.hide();
});
(function (expeditor) {
    var template = '<div class="terminal-view"></div>';
    var inputFieldWrapperTemplate = "<div class='term-view-container' ></div>";
    var enteredValue = '<div class="value-entered coral-Select-button"></div>';
    
    var TerminalView = expeditor.view.TerminalView = expeditor.view.BaseView.extend({
        removeSelectionButtonTemplate : function () {
            return '<button class="coral-MinimalButton remove-selection" type="button" title=' + Granite.I18n.get("Delete") + '>' +
                        '<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>' +
                    '</button>';
        },

        getValue : function () {
            return this.value;
        },

        setValue : function (val) {
            var self = this;
            this.value = val;
            if (this.inputctrl) {
                this.inputctrl.value = val;
                Coral.commons.nextFrame(function () {
                    self._hideField();
                });
            }
        },
        updateDatePickerVisibility : function (obj) {
            $(obj).toggle(this.datePickerVisible);
        },
        updateSuggestions : function (obj) {
            obj = $(obj).get(0); 
            var self = this;
            var hasSuggestions = Object.keys(this.suggestions || {}).length > 0;
            this._enableSuggestion(hasSuggestions, obj);
            obj.items.clear();
            if (this.suggestions) {
                for (var x in this.suggestions) {
                    obj.items.add({
                        value : x,
                        content : {
                            innerHTML : this.suggestions[x]
                        }
                    });
                }
            }
            Coral.commons.nextFrame(function () {
                if (hasSuggestions && (!self.value || !self.suggestions.hasOwnProperty(self.value))) {
                    obj.value = '';
                } else {
                    obj.value = self.value || ''; 
                }
                if (self.inputFieldWrapper) {
                    var labelText = self._getLabelText(obj.value || "");
                    self.inputFieldWrapper.siblings(".value-entered")
                                          .children('span').html(labelText);
                }
            });
        },
        _enableSuggestion : function (enable, obj) {
            if (obj) {
                obj.forceSelection = enable;
                $(obj).toggleClass("terminal-view-hide-suggestions", !enable);
            }
        },
        showDatePicker : function (show) {
            this.datePickerVisible = !!show;
            if (this.datePickerControl) {
                this.updateDatePickerVisibility(this.datePickerControl);
            }
            if (this.selectListDatePicker) {
                this.updateDatePickerVisibility(this.selectListDatePicker);
            }

        },
        setSuggestions : function (suggestions) {
            suggestions = suggestions || {};
            this.suggestions = suggestions ;
            if (this.inputctrl) {
                this.updateSuggestions(this.inputctrl);
            }
            if (this.selectListInput) {
                this.updateSuggestions(this.selectListInput);
            }
        },

        render : function (viewtype) {
            if (!this.placeholder) {
                this.placeholder = $(template).addClass(this.nodeName);
                this._createView(this.placeholder, viewtype);
                var self = this;
            }
            if (this.parentView instanceof expeditor.view.ExpressionView) {
                return $([this.placeholder[0], this.selectList]);
            } else {
                return this.placeholder;
            }
        },

        onFieldValueChange : function (e) {
            this.value = this.inputctrl.value;
            this.trigger('change');
        },

        addInputField : function (inputType, phText) {
            var self = this;
            var fieldWrapper = $(inputFieldWrapperTemplate);
            var input = new Coral.Autocomplete().set({
                multiple : false,
                placeholder : this.viewConfig.placeholder ? Granite.I18n.get(this.viewConfig.placeholder) : Granite.I18n.get('Please enter some text here'),
                className : "terminalview-input expression-selectlist"
            });
            this.updateSuggestions(input);
            $(input).on('change', function (e) {
                self.inputctrl.value = input.value;
                self.onFieldValueChange();
                self.parentView.trigger("hideoptions");
                self.parentView.trigger("toggleList", {target : e.target, hide : true});
                e.stopImmediatePropagation();
                self._hideField();
            }).on('click', function () {
                return false;
            });

            this.selectListInput = input;
            this.selectListDatePicker = this._createDatePicker();
            this.updateDatePickerVisibility(this.selectListDatePicker);
            fieldWrapper.append(input);
            fieldWrapper.append(this.selectListDatePicker);
            return fieldWrapper;
        },
        _getLabelText : function (inputValue) {
            return expeditor.Utils.getOrElse(this.suggestions, inputValue, inputValue);
        },
        _hideField : function () {
            var self = this;
            var input = $(this.inputctrl);
            var inputFieldWrapper = $(this.inputFieldWrapper);
            if (!input.val()) {
                return;
            }
            var inputValue = input[0].value + "";
            var labelText = this._getLabelText(input[0].value || "");
            inputFieldWrapper.addClass("value-entered-input");
            var label = inputFieldWrapper.siblings(".value-entered");
            if (label.length > 0) {
                label.children("span").html(labelText);
                label.children(".remove-selection").hide();
                return;
            }

            label = $(enteredValue).html($('<span>' + labelText + '</span>'));
            label.on("click", function (e) {
                var valueLabel = $(this),
                    input = $(self.inputctrl);
                var button = valueLabel.siblings(".remove-selection");
                if (!button || button.length == 0) {
                    var removeButton = $(self.removeSelectionButtonTemplate());
                    removeButton.addClass("LITERAL");
                    removeButton.on("click", function (e) {
                        inputFieldWrapper.removeClass("value-entered-input");
                        input.val("");
                        self.value = null;
                        inputFieldWrapper.siblings(".value-entered").remove();
                        $(this).hide();
                        self.trigger("change");
                        self.parentView.trigger("showdefault");
                        label = null;
                        e.stopPropagation();
                    });
                    removeButton.insertAfter(valueLabel);
                } else {
                    button.show();
                }
                $(document).one("click", function (e) {
                    if ($(self.placeholder).has(e.target).length == 0) {
                        var removeButton = $(self.placeholder).find(".remove-selection");
                        if (removeButton) {
                            removeButton.hide();
                        }
                    }
                });
                $(this).addClass("is-highlighted");
            });
            label.insertAfter(inputFieldWrapper);
            self.parentView.trigger("hideoptions");
        },
        _createInputView : function (el) {
            var self = this;
            var phtext = this.viewConfig.placeholder ? Granite.I18n.get(this.viewConfig.placeholder) : Granite.I18n.get('Please enter some text here');
            var inputType = this.viewConfig.inputType ? this.viewConfig.inputType : 'text';
            var input = this.inputctrl = new Coral.Autocomplete().set({
                multiple : false,
                placeholder : phtext,
                className : "terminalview-input expression-selectlist"
            });
            this.updateSuggestions(input);
            this.inputFieldWrapper = $(inputFieldWrapperTemplate);
            this.datePickerControl = this._createDatePicker();
            this.updateDatePickerVisibility(this.datePickerControl);
            this.inputFieldWrapper.append(input);
            this.inputFieldWrapper.append(this.datePickerControl);
            $(input).on('change', function (e) {
                self._hideField();
                self.onFieldValueChange();
            });
            this.selectList = this.addInputField(inputType, phtext);
            $(input).click($.proxy(this._toggleList, this));

            el.append(this.inputFieldWrapper);
            if (this.value) {
                Coral.commons.nextFrame(function () {
                   input.value = self.value;
                   self._hideField();
               });
            }

        },
        _onDateSelect : function (datepicker, e) {
            var self = this;
            if (datepicker.value) {
                this.setValue(datepicker.value);
                this.selectListInput.value = datepicker.value;
                this.onFieldValueChange();
                this.parentView.trigger("hideoptions");
                self.parentView.trigger("toggleList", {target : e.target, hide : true});
                e.stopImmediatePropagation();

            }
        },
        _createDatePicker : function () {
            var datepicker = new Coral.Datepicker().set({
                valueFormat : "YYYY-MM-DD",
                displayFormat : "YYYY-MM-DD"
            });
            $(datepicker).on('change', $.proxy(this._onDateSelect, this, datepicker));
            return datepicker;
        },

        _createTextView : function (el) {
            var content = this.viewConfig.placeholder == null ? Granite.I18n.get(this.nodeName) : Granite.I18n.get(this.viewConfig.placeholder);
            var cssClass = this.viewConfig.cssClass || "";
            el.text(content);
            el.addClass(cssClass);
        },

        _createEmptyView : function (el) {

        },
        
        _toggleList : function (e) {
            if (this.parentView) {
                this.parentView.trigger('toggleList', {target : e.currentTarget});
                e.stopPropagation();
            }
        },
        _createOperatorView : function (el) {
            var content = Granite.I18n.get(this.viewConfig.placeholder) || Granite.I18n.get(this.nodeName),
                cssClass = this.viewConfig.cssClass;
            var placeholderText = $("<span class='operator-placeholder'>" + content + "</span>");
            var displayText = $("<span class='operator-display'></span>");
            if (cssClass) {
                displayText.addClass(cssClass);
            } else {
                displayText.text(content);
            }
            displayText.hide();
            el.append(displayText);
            el.append(placeholderText);
            this.parentView.placeholder.addClass("is-focused");
            var self = this;
            el.on('click', function (e) {
                placeholderText.show();
                displayText.hide();
                var operator = $(this);
                var button = operator.children(".remove-selection");
                if (!button || button.length == 0) {
                    var removeButton = $(self.removeSelectionButtonTemplate());
                    removeButton.addClass("OPERATOR");
                    removeButton.on("click", function (e) {
                        operator.removeClass("operator-highlighted");
                        self.parentView.trigger("showdefault");
                        self.parentView.trigger("change", {action : "Reset"});
                        $(this).hide();
                    });
                    operator.append(removeButton);
                } else {
                    button.show();
                }
                $(this).addClass("operator-highlighted");
                self._toggleList(e);
            });
        },

        _createView : function (el, viewtype) {
            var type = this.viewConfig.type || viewtype || "Text";
            var fn = "_create" + expeditor.Utils.capitalizeFirstCharacter(type) + "View";
            this[fn].call(this, el);
        }
    });

    $(document).on("click", function (e) {
        var operator = $(".OPERATOR.choice-model");
        operator.removeClass("is-focused");
        operator.find(".terminal-view").removeClass("operator-highlighted");
        var removeButton = operator.find(".remove-selection");
        if (removeButton) {
            removeButton.hide();
        }
        operator.find(".operator-placeholder").hide();
        operator.find(".operator-display").show();
    });
})(expeditor);
(function (expeditor) {
    var txtDefaultPlaceholder = Granite.I18n.get("Drop object or select here"),
    componentTemplate = "<span>" +
        '<button class="coral-Button coral-Select-button coral-MinimalButton coral-Button--quiet no-selection" variant="quiet"' +
        'tabindex="-1">' +
        '<span class="variable-path"><span></span></span>' +
        '<coral-button-label>' + txtDefaultPlaceholder + '</coral-button-label>' +
        '<span class="variable-type"></span>' +
        '</button>' +
        "</span>";
    var selectListTemplate = '<ul class="coral-SelectList expression-selectlist"></ul>',
        selectListItemTemplate = '<li class="coral-SelectList-item coral-SelectList-item--option"></li>';
    var VariableView = expeditor.view.VariableView = expeditor.view.TerminalView.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.nodeName = nodeName;
            this.vars = {};
            this.defaultDisplayValue = Granite.I18n.get(expeditor.Utils.getOrElse(this, "viewConfig.placeholder" , txtDefaultPlaceholder));
        },
        
        setSuggestions : function (s) {
        },
        
        _matcher : function (term) {
            var lowerCaseTerm = (term + "").toLowerCase();
            return function (key, val) {
                return (val.displayName + "").toLowerCase().indexOf(lowerCaseTerm) > -1;
            };
        },
        
        _itemRenderer : function (key, val) {
            var item = val.displayName + "<span class='type'>" + val.type.split("|")[0] + "</span>";
            if (val.isDuplicate) {
                item = "<span class='path' title='" + val.displayPath + "'><span>" + val.displayPath + "</span></span>" + item;
            }
            return {
                value : key,
                title : val.displayName,
                content : {
                    innerHTML : item
                },
                selected : key == this.value
            };
        },
        _updateOptions : function (vars) {
            if (this.lazySelectList) { 
                this.lazySelectList.setData(vars);
            }
            var displayValue = this.defaultDisplayValue,
                displayPath, type;
            if (this._isUndefined(this.value))  {
                this._markUndefined();
            } else {
                if (this.value != null) {
                    var oldVar = this.vars[this.value],
                        currentVar = vars ? vars[this.value] : null,
                        oldDisplayValue = "";
                    if (oldVar != null) {
                        oldDisplayValue = oldVar.displayName;
                    }
                    displayValue = expeditor.Utils.getOrElse(currentVar, "displayName", oldDisplayValue);
                    displayPath = expeditor.Utils.getOrElse(currentVar, "displayPath", '');
                    type = expeditor.Utils.getOrElse(currentVar, "type", '');
                    if (this.component) {
                        this.component.find(".no-selection").removeClass("no-selection").addClass("selection");
                    }
                }
                this._showDisplayText(displayValue, displayPath, type);
            }
            this.vars = vars;
        },

        _isUndefined : function (val) {
            return val && (val.indexOf("__Undefined__") == 0);
        },

        _extractDisplayName : function (undefinedVarId) {
            return undefinedVarId.substring("__Undefined__:".length);
        },

        _hasOption : function (option) {
            return this.vars.hasOwnProperty(option);
        },

        _markUndefined : function () {
            if (this.placeholder) {
                var displayName =  this._extractDisplayName(this.value);
                var displayText = displayName ? (Granite.I18n.get("Undefined Variable") + " :" + displayName) : "";
                this.selectButton.removeClass("no-selection").addClass("selection").addClass("undefined-variable");
                this._showDisplayText(displayText, displayText,
                    Granite.I18n.get("undefined"), Granite.I18n.get("A variable is undefined when it no longer exists. Check if it has been renamed or deleted."));
                if (this.parentView) {
                    this.parentView.trigger("hideoptions");
                }
            }
        },

        _showDisplayText : function (displayValue, displayPath, type, displayTitle) {
            if (this.component) {
                var selectButton = this.component.find("coral-button-label");
                selectButton.text(displayValue);
                if (!displayTitle) {
                    displayTitle = displayValue;
                }
                selectButton.attr("title", displayTitle);
                displayPath = displayPath ? displayPath : "";
                type = type ? type.split("|")[0] : "";
                var pathEl = this.component.find(".variable-path");
                if (displayPath === '') {
                    pathEl.addClass("visibility-hidden");
                } else {
                    pathEl.removeClass("visibility-hidden");
                    pathEl.attr("title", displayPath);
                    pathEl.children("span").text(displayPath);
                }
                this.component.find(".variable-type").text(type);
            }
        },

        setVariables : function (vars) {
            this._updateOptions(vars);
        },

        setValue : function (val, trigger) {
            if (this.value === val) {
                return;
            }
            this.value = val;
            if (this._isUndefined(val)) {
                this._markUndefined();
                return;
            } else if (this.placeholder) {
                this.placeholder.find(".undefined-variable")
                    .removeClass("undefined-variable");
            }
            if (val && typeof val === 'object') {
                this.value = val.id;
                val = val.id;
            } else if (typeof val === 'string') {
                this.value = val;
            }
            if (this.placeholder) {
                if (this.value) {
                    var obj = this.vars[this.value];
                    if (obj) {
                        var displayName = obj.displayName;
                        var displayPath = obj.displayPath;
                        var type = obj.type;
                        if (displayName) {
                            this.selectButton.removeClass("no-selection").addClass("selection");
                            this._showDisplayText(displayName, displayPath, type);
                            if (this.parentView) {
                                this.parentView.trigger("hideoptions");
                            }
                        }
                    }
                } else {
                    this.selectButton.removeClass("selection").addClass("no-selection");
                    this._showDisplayText(this.defaultDisplayValue);
                    if (this.parentView) {
                        this.parentView.trigger("showoptions");
                    }
                }
            }
            $(document).trigger('focusTreeNode', {id : val});
            if (trigger) {
                this.trigger('change');
            }
        },

        onFieldValueChange : function (e) {
            var displayPath, type;
            if (!this.selectList.selectedItem || this.value === this.selectList.selectedItem.value) {
                return;
            }
            this.value = this.selectList.selectedItem.value;
            var obj = this.vars[this.value];
            if (!this._isUndefined(this.value)) {
                this.placeholder.find(".undefined-variable")
                    .removeClass("undefined-variable");
            }
            if (obj) {
                displayName = obj.displayName;
                displayPath = obj.displayPath;
                type = obj.type;
            }
            if (displayName) {
                this.selectButton.removeClass("no-selection").addClass("selection");
                this._showDisplayText(displayName, displayPath, type);
                if (this.parentView) {
                    this.parentView.trigger("hideoptions");
                }
                this.trigger('change');
            }
            $(document).trigger('focusTreeNode', {id : this.value});
        },

        _onCloseClick : function (evnt) {
            var $select = this.component.find(".coral-Select-button");
            $select.removeClass("undefined-variable");
            if (this.parentView) {
                this.parentView.trigger("showdefault");
            }
            this.value = null;
            if (this.selectList && this.selectList.selectedItem) {
                this.selectList.selectedItem.selected = false;
            }
            $select.removeClass("selection")
                .removeClass("is-highlighted")
                .addClass("no-selection")
                .find("coral-button-label")
                .html(this.defaultDisplayValue);
            this.component.find(".remove-selection").remove();
            evnt.stopImmediatePropagation();
            this.trigger("change");
        },

        renderReadOnly : function () {
            this.render();
            if (this.placeholder) {
                this.placeholder.off();
                this.placeholder.find("*").off();
                var self = this;
                var selectButton = this.component.find(".coral-Select-button");
                selectButton.addClass("read-only");
                var component = this.placeholder;
                selectButton.on('click', function (e) {
                    $(this).addClass("is-highlighted");
                    $(document).one("click", function (e) {
                        if (component.has(e.target).length == 0) {
                            selectButton.removeClass("is-highlighted");
                        }
                    });
                    $(document).trigger('focusTreeNode', {id : self.getValue()});
                    e.stopImmediatePropagation();
                });
            }
            return this.placeholder;
        },
        _createView : function (el) {
            var component = this.component = $(componentTemplate);
            this.lazySelectList = new expeditor.view.LazySelectList({
                itemRenderer : $.proxy(this._itemRenderer, this),
                matcher : this._matcher
            });
            this.selectList = this.lazySelectList.domEl();
            this.selectList.on('coral-selectlist:change', $.proxy(this.onFieldValueChange, this));

            var self = this;
            var selectButton = component.find(".coral-Select-button");
            selectButton.on("click", function (e) {
                var target = $(this);
                if (target.hasClass("selection")) {
                    var button = component.find(".remove-selection");
                    if (!button || button.length == 0) {
                        button = $(self.removeSelectionButtonTemplate());
                        button.addClass("VARIABLE");
                        component.append(button);
                        button.on("click", $.proxy(self._onCloseClick, self));
                    } else {
                        button.show();
                    }
                    if (selectButton.hasClass("undefined-variable")) {
                        button.addClass("undefined-variable");
                    } else {
                        button.removeClass("undefined-variable");
                        button.removeClass("undefined-variable");
                    }
                    $(document).one("click", function (e) {
                        if (component.has(e.target).length == 0) {
                            var removeButton = selectButton.siblings(".remove-selection");
                            if (removeButton) {
                                removeButton.hide();
                            }
                            selectButton.removeClass("is-highlighted");
                        }
                    });
                    $(document).trigger('focusTreeNode', {id : self.getValue()});
                    selectButton.addClass("is-highlighted");
                }
            });

            this.selectButton = selectButton;
            this._updateOptions(this.vars);

            var that = this;
            component.find(".coral-Select-button").on("dragover", function (evnt) {
                var field = expeditor.runtime.dragField,
                    dropAllowed = field != null && that.vars.hasOwnProperty(field);
                if (dropAllowed) {
                    that._showDisplayText(Granite.I18n.get("Drop here"));
                    $(this).addClass("is-draggedOver");
                    evnt.stopImmediatePropagation();
                }
                return !dropAllowed;
            }).on("drop", function (e) {
                var id = e.originalEvent.dataTransfer.getData("text");
                id = id ? id.split(",")[0] : "";
                if (that.vars.hasOwnProperty(id)) {
                    that.setValue(id, true);
                    if (that.parentView) {
                        that.parentView.trigger("hideoptions");
                    }
                    $(this).removeClass("is-draggedOver");
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }).on("dragleave", function () {
                $(this).removeClass("is-draggedOver");
                that.setValue(that.value);
            });
            el.addClass("VARIABLE");
            el.append(component);
            if (!(this.parentView instanceof expeditor.view.ExpressionView)) {
                var selectListComponent = new expeditor.view.CustomSelectList({
                    target : component[0]
                });
                component.append(selectListComponent.render());
                selectListComponent.setOptionsList(this.selectList);
                this.placeholder.find(".coral-Select-button").on("click", function (e) {
                    selectListComponent.toggleVisibility(this);
                    e.stopPropagation();
                });
                this.selectListComponent = selectListComponent;
            }
            el.click($.proxy(this._toggleList, this));
        }

    });
})(expeditor);
(function (expeditor) {
    var list_item = "<button is='coral-button' variant='quiet' icon='dragHandle' class='reorder-button' coral-table-roworder></button>" +
            "<div class='list-item-content'></div>" +
            "<div class='list-item-options'></div>",
    list_item_selector = ".list-view-item",
    list_item_content = ".list-item-content",
    list_item_options = ".list-item-options",
    txtAdd =  Granite.I18n.get("Add");

    ListView = expeditor.view.ListView = expeditor.view.BaseView.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.numRows = 0;
            this.buttonText = Granite.I18n.get(expeditor.Utils.getOrElse(config, "buttonText", txtAdd));
        },

        setRowContent : function (rownum, htmlelement) {
            var placeholder = this.listView;
            var row = placeholder.items.getAll()[rownum];
            row = $(row);
            row = row.children(list_item_content);
            row.html('');
            row.append(htmlelement);
        },

        addNewRow : function () {
            var listView = this.listView;
            var newrow = listView.items.add({
                innerHTML : list_item
            });
            newrow = $(newrow).addClass("list-view-item").attr('data-rowindex', this.numRows);
            var deleteButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Delete'), 'delete');
            deleteButton.on('click', $.proxy(this.onDeleteClick, this));
            newrow.children(list_item_options).append(deleteButton);
            var self = this;
            newrow.children("div").on('click', function (e) {
                var child = $(this).find(".list-item-content").children();
                if (child.has(e.target).length == 0) {
                    self._toggleListItemOptions($(this).parent());
                }
            });
            this.numRows++;
            if (this.numRows > this.minCount) {
                this.placeholder.addClass("multiple_items");
            }
        },

        onAddClick : function () {
            this.addNewRow();
            this.trigger('change', {action : 'AddItem', rownum : (this.numRows - 1)});
        },

        onDeleteClick : function (e) {
            var rowToDelete = $(e.target).closest(list_item_selector);
            var rowNum = rowToDelete[0].sectionRowIndex;
            rowToDelete.remove();
            this.placeholder.find(list_item_options).hide();
            this.trigger('change', {action : 'DeleteItem', rownum : (rowNum)});
            this.numRows--;
            if (this.numRows <= this.minCount) {
                this.placeholder.removeClass("multiple_items");
            }
        },

        _onListItemReorder : function (e) {
            if (e.originalEvent && e.originalEvent.detail) {
                var movedRow = e.originalEvent.detail.row;
                if (movedRow) {
                    var oldIndex = parseInt(movedRow.dataset.rowindex),
                        newIndex = movedRow.sectionRowIndex;
                    this.trigger('change', {action : 'ReorderItem', oldIndex : oldIndex, newIndex : newIndex});
                    var index = 0;
                    this.listView.items.getAll().forEach(function (item) {
                        item.dataset.rowindex = index++;
                    });
                }
            }
        },

        _toggleListItemOptions : function (list_item) {
            if (list_item.closest(".list-view").hasClass("multiple_items")) {
                list_item.find(list_item_options).toggle();
            }
        },

        render : function () {
            if (!this.placeholder) {
                
                this.listView = new Coral.Table().set({
                    orderable : true
                });
                var placeholder = this.placeholder = $('<div class="list-view ' + this.nodeName + '"></div>');
                placeholder.append(this.listView);
                var row = $('<div class="list-view-extension"></div>');
                var addbutton = expeditor.Utils.getActionBarButton(this.buttonText, 'addCircle');
                addbutton.on('click', $.proxy(this.onAddClick, this));
                row.append(addbutton);
                placeholder.append(row);
                placeholder.on("coral-table:roworder", $.proxy(this._onListItemReorder, this));
            }
            return this.placeholder;
        }
    });
})(expeditor);

(function (expeditor) {
    var RootView = expeditor.view.RootView = expeditor.view.ListView.extend({

    });
})(expeditor);

(function (expeditor) {
    var txtSelectItem = Granite.I18n.get("Select Item"),
        template =
            '<div class="choice-model u-coral-clearFix">' +
                '<div class="choice-view u-coral-clearFix">' +
                    '<div class="child-choice-name" tabindex="0"></div>' +
                    '<div class="coral-Icon coral-Icon--chevronDown coral-Icon--sizeXS"></div>' +
                '</div>' +
            '<div>',
        selectedChildTemplate = '<div class="child-selected-view"></div>',
        ChoiceView = expeditor.view.ChoiceView = expeditor.view.BaseView.extend({

            init : function (nodeName, ctx, config) {
                this._super.apply(this, arguments);
                this.nodeName = nodeName;
                this.isHidden = false;
                this.inline = expeditor.Utils.getOrElse(config, "inline", false);
                
                this.defaultPlaceholderInline = expeditor.Utils.getOrElse(config, "defaultPlaceholderInline", false);
                this.placeholderText = this._getDefaultElement(Granite.I18n.get(
                    expeditor.Utils.getOrElse(config, "placeholder", txtSelectItem)));
                this.hideChild = expeditor.Utils.getOrElse(config, "hideChild", false);
                this.hideOptions = expeditor.Utils.getOrElse(config, "hideOptions", false);
                this.renderOptionList = expeditor.Utils.getOrElse(config, "renderOptionList", false);
                this.bindShowDefault = expeditor.Utils.getOrElse(config, "bindShowDefault", true);
                this.bind("hideoptions", this._hideOptions, this)
                    .bind("showoptions", this._showOptions, this)
                    .bind("toggleList", $.proxy(this._toggleSelectList, this));
                if (this.bindShowDefault) {
                    this.bind("showdefault", this._showDefault, this);
                }
            },

            
            _hideOptions : function (unbindClick) {
                if (this.placeholder) {
                    this.placeholder.children(".choice-view").children(".coral-Icon--chevronDown").hide();
                    if (unbindClick === true) {
                        this.placeholder.unbind("click").children(".choice-view").unbind("click");
                        this.unbind("toggleList");
                        if (this.$choiceNameDiv) {
                            this.$choiceNameDiv.unbind("click");
                        }
                        if (this.placeholderText) {
                            this.placeholderText.unbind("click");
                        }
                    }
                }
            },

            hide : function (flag) {
                this.isHidden = flag;
                if (this.placeholder) {
                    this.placeholder.toggle(!this.isHidden);
                }
            },
            _showOptions : function () {
                $(this.selectListOverlay).removeClass("empty-list");
                this.placeholder.children(".choice-view").children(".coral-Icon--chevronDown").show();
            },

            _showDefault : function () {
                this.setContent(null);
                this._showOptions();
            },

            _toggleSelectList : function (e, data) {
                if (this.renderOptionList) {
                    this.parentView.trigger('toggleList', {target : data.target});
                } else if (this.selectListOverlay) {
                    var isEmpty = $(this.selectListOverlay).hasClass("empty-list");
                    
                    this.selectListOverlay.open = !(isEmpty || this.selectListOverlay.open);
                }
            },

            onSelectionMade : function (e) {
                if (e.target && e.target.selectedItem) {
                    this.value = e.target.selectedItem.value;
                    if (this.$choiceNameDiv) {
                        this.$choiceNameDiv.text(e.target.selectedItem.textContent);
                    }
                    var items = this.selectList.items.getAll();
                    if (!items || items.length < 2) {
                        $(this.selectListOverlay).addClass("empty-list");
                    } else {
                        $(this.selectListOverlay).removeClass("empty-list");
                    }
                    if (this.selectListOverlay) {
                        if (e.preventHide) {
                            this.selectListOverlay.open = true;
                        } else {
                            this.selectListOverlay.open = false;
                        }
                    }
                    if (this.hideOptions) {
                        this._hideOptions();
                    }
                    if (this.placeholder) {
                        var choiceView = this.placeholder.find(".choice-view");
                        if (this.choiceCSS) {
                            choiceView.removeClass(this.choiceCSS);
                        }
                        this.choiceCSS = "choice-" + this.value;
                        choiceView.addClass(this.choiceCSS);
                    }
                    this.trigger('change');
                }
            },

            getValue : function () {
                return this.value;
            },

            setValue : function (val) {
                this.value = val;
                if (this.selectList) {
                    if (this.selectList.selectedItem) {
                        this.selectList.selectedItem.selected = false;
                    }
                    var selectedItem = this.selectList.items.getAll()
                        .filter(function (item) {
                            return item.value === val;
                        });
                    if (selectedItem && selectedItem.length > 0) {
                        selectedItem = selectedItem[0];
                    }
                    var displayValue = selectedItem ? selectedItem.textContent : '';
                    if (selectedItem) {
                        var items = this.selectList.items.getAll();
                        if (!items || items.length < 2) {
                            $(this.selectListOverlay).addClass("empty-list");
                        } else {
                            $(this.selectListOverlay).removeClass("empty-list");
                        }
                    }
                    if (this.$choiceNameDiv) {
                        this.$choiceNameDiv.text(displayValue);
                    }
                }
            },

            _getDefaultElement : function (text) {
                return $('<div class="choice-view-default" tabindex="0">' + text + '</div>');
            },

            setContent : function (htmlelement) {
                this.htmlelement = htmlelement;
                if (this.placeholder) {
                    this.$contentDiv.find('> *').detach();
                    if (htmlelement) {
                        this.$contentDiv.append(htmlelement);
                        this.placeholder.children(".choice-view").removeClass("default");
                        if (this.inline && this.$choiceNameDiv) {
                            this.$choiceNameDiv.remove();
                        }
                        if (this.hideOptions) {
                            this._hideOptions();
                        }
                    } else {
                        if (this.defaultPlaceholderInline && this.$choiceNameDiv) {
                            this.$choiceNameDiv.append(this.placeholderText);
                        } else {
                            this.$contentDiv.append(this.placeholderText);
                        }
                        this.placeholder.children(".choice-view").addClass("default");
                        this._showOptions();
                    }
                }
            },

            
            render : function (makeSelectable) {
                if (!this.placeholder) {
                    var $placeholder = $(template);
                    $placeholder.addClass(this.nodeName);
                    $placeholder.toggleClass("choice-model-inline", this.inline);
                    this.$choiceNameDiv = $placeholder.find(".child-choice-name");
                    if (this.isHidden) {
                        $placeholder.hide();
                    }
                    if (this.renderOptionList) {
                        $(this.selectList).addClass("expression-selectlist");
                    }
                    var choiceView = $placeholder.children(".choice-view");
                    var btn = choiceView.children(".coral-Icon");
                    var self = this;
                    var elements = btn.add(this.$choiceNameDiv)
                                      .add(this.placeholderText);
                    this.selectList = new Coral.SelectList();
                    
                    this.selectListOverlay = new Coral.Overlay();
                    $(this.selectListOverlay).addClass("expeditor-customoverlay");
                    this.selectListOverlay.focusOnShow = Coral.mixin.overlay.focusOnShow.ON;
                    this.selectListOverlay.returnFocus = Coral.mixin.overlay.returnFocus.ON;
                    this.selectListOverlay.on('coral-overlay:open', function () {
                        var selectedItem = self.selectList.items.getFirstSelected();
                        if (!selectedItem || selectedItem.length == 0) {
                            selectedItem = self.selectList.items.getAll()[0];
                        }
                        Coral.commons.nextFrame(function () {
                            selectedItem.trigger("mouseenter");
                            selectedItem.focus();
                        });
                    });
                    this.selectListOverlay.target = btn[0];
                    this._updateOptions(this.selectList, this.options);
                    this.selectListOverlay.appendChild(this.selectList);
                    $placeholder.append(this.selectListOverlay);
                    if (makeSelectable) {
                        elements = choiceView;
                    }
                    elements.on('click keydown', function (e) {
                        
                        if (e.type === 'click' || (e.type === 'keydown' && (e.which === 38 || e.which === 40))) {
                            if (self.renderOptionList) {
                                self.parentView.trigger('toggleList', {target : e.target});
                            } else {
                                var target = e.target;
                                if (self.$choiceNameDiv) {
                                    target = self.$choiceNameDiv[0];
                                } else if (choiceView && choiceView.hasClass("default")) {
                                    target = choiceView[0];
                                }
                                self.selectListOverlay.target = target;
                                self.selectListOverlay.placement = Coral.Overlay.placement.BOTTOM;
                                self.selectListOverlay.alignAt = Coral.Overlay.align.LEFT_BOTTOM;
                                self.selectListOverlay.alignMy = Coral.Overlay.align.LEFT_TOP;
                                self.selectListOverlay.offset = -1;
                                self.selectListOverlay.open = !self.selectListOverlay.open;
                            }
                            return false;
                        }
                    });
                    this.selectList.on('coral-selectlist:change', $.proxy(this.onSelectionMade, this));
                    var $contentDiv = $(selectedChildTemplate);
                    if (this.inline) {
                        this.$choiceNameDiv.before($contentDiv);
                        if (!this.defaultPlaceholderInline) {
                            this.$choiceNameDiv.remove();
                        }
                        this.$choiceNameDiv = null;
                    } else {
                        $placeholder.append($contentDiv);
                    }
                    if (this.hideChild) {
                        $contentDiv.hide();
                    }
                    this.$contentDiv = $contentDiv;
                    this.placeholder = $placeholder;
                    if (this.value) {
                        this.setValue(this.value);
                    }
                }
                if (this.renderOptionList) {
                    return $([this.placeholder[0], this.selectList]);
                }
                return this.placeholder;
            },

            _updateOptions : function (select, options) {
                if (options && options.length > 0) {
                    options.forEach(function (option) {
                        select.items.add({
                            value : option.value,
                            content : {
                                innerHTML : Granite.I18n.get(option.label)
                            }
                        });
                    });
                    $(this.selectListOverlay).removeClass("empty-list");
                } else {
                    $(this.selectListOverlay).addClass("empty-list");
                }
            },

            setOptions : function (ops) {
                this.options = ops;
                if (this.placeholder) {
                    this.selectList.items.clear();
                    this._updateOptions(this.selectList, ops);
                }
            }
        });
})(expeditor);
(function (expeditor) {

    var template = '<div class="choice-model u-coral-clearFix">' +
                        '<div class="choice-view u-coral-clearFix">' +
                            '<div class="coral-Icon coral-Icon--chevronDown coral-Icon--sizeXS"></div>' +
                        '</div>' +
                    '<div>',
        selectedChildTemplate = '<div class="child-selected-view"></div>',
    ExpressionView = expeditor.view.ExpressionView = expeditor.view.ChoiceView.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.compositeOptions = expeditor.Utils.getOrElse(config, "composite", []);
            this.hidden = false;
            if (!(this.compositeOptions instanceof Array)) {
                this.compositeOptions = [this.compositeOptions];
            }
        },

        hide : function (hide) {
            this.hidden = hide;
            if (this.placeholder) {
                this.placeholder.toggle(!this.hidden);
            }
        },

        _toggleSelectList : function (event, data) {
            this.selectListView.toggleVisibility(data.target, data.hide);
        },

        onSelectChange : function () {
            this._super();
            if (this.placeholder) {
                var select = $(this.placeholder.find('select')[0]);
                select.css({display : ((this.value == 'NUMERIC_BINARY_EXPRESSION') ? 'none' : 'block')});
            }
        },

        setValue : function (val) {
            this._super(val);
            if (this.placeholder) {
                var select = $(this.placeholder.find('select')[0]);
                select.css({display : ((this.value == 'NUMERIC_BINARY_EXPRESSION') ? 'none' : 'block')});
            }
        },

        _updateOptions : function (select, options) {
            select = this.selectListView;
            var composite = this.compositeOptions;
            if (this.selectList) {
                this.selectList.items.clear();
            }
            if (select) {
                if (options && options.length > 0) {
                    options.forEach(function (option) {
                        if (composite.indexOf(option.value) > -1) {
                            option.composite = true;
                        }
                        select.addOption(option);
                    });
                    $(select.placeholder).removeClass("empty-list");
                } else {
                    $(select.placeholder).addClass("empty-list");
                }
            }
        },

        _showOptions : function () {
            this.selectListView.setOptionsList(this.selectList);
            this._updateOptions(this.selectListView, this.options);
            this.selectListView.hideHeaderAndSearchField();
            this.placeholder.children(".choice-view").children(".coral-Icon--chevronDown").show();
        },

        setOptions : function (ops) {
            this.options = ops;
            if (this.placeholder) {
                this._updateOptions(this.selectListView, ops);
            }
        },

        setContent : function (htmlelement, nodeName) {
            var childList;
            if (htmlelement && htmlelement.length > 0) {
                childList = $(htmlelement[1]);
                childList.detach();
                htmlelement = $(htmlelement[0]);
                this._hideOptions();
            }
            this._super.apply(this, arguments);
            var selectList = this.selectListView;
            if (childList && childList.length > 0) {
                selectList.setOptionsList(childList);
            }
            if (this.compositeOptions.indexOf(nodeName) > -1) {
                this.options.forEach(function (opt) {
                    if (opt.value === nodeName) {
                        selectList.updateHeaderAndSearchField(opt.label);
                    }
                });
            }
        },

        render : function () {
            
            if (!this.placeholder) {
                var self = this;
                var $placeholder = $(template);
                $placeholder.toggleClass("choice-model-inline", this.inline);
                this.selectListView = new expeditor.view.CustomSelectList({
                    target : $placeholder[0]
                });
                $placeholder.append(this.selectListView.render());
                this.selectList = this.selectListView.getSelectListElement();
                this.selectListView.bind('showDefault', function () {
                    self._showDefault();
                });
                var choiceView = $placeholder.children(".choice-view"),
                    btn = choiceView.children(".coral-Icon");
                $placeholder.addClass(this.nodeName);
                this._updateOptions(this.selectListView, this.options);
                btn.add(this.placeholderText)
                    .on("click keydown", function (e) {
                        
                        if (e.type === 'click' || (e.type === 'keydown' && (e.which === 38 || e.which === 40))) {
                            var target = e.target;
                            if (choiceView.hasClass("default")) {
                                target = choiceView[0];
                            }
                            self.selectListView.toggleVisibility(target);
                            e.stopImmediatePropagation();
                        }
                    });
                var defaultText = this.placeholderText.text();
                choiceView.add(this.placeholderText).on("dragover", function (evnt) {
                    var field = expeditor.runtime.dragField,
                        type = expeditor.runtime.dragType,
                        dropAllowed;
                    if (field && type) {
                        dropAllowed = self.options.some(function (option) {
                            return option.value == type;
                        });
                        if (dropAllowed) {
                            self.trigger("change", {action : "DragOver", type : type});
                            var child = _.find(self.children, function (child) {
                                return child.nodeName == type;
                            });
                            dropAllowed = child && child._hasOption(field);
                            if (dropAllowed) {
                                choiceView.addClass("is-draggedOver");
                                self.placeholderText.text(Granite.I18n.get("Drop here"));
                            }
                        }
                    }
                    return !dropAllowed;
                }).on("drop", function (e) {
                    var data = e.originalEvent.dataTransfer.getData("text");
                    var id, type;
                    if (data) {
                        data = data.split(",");
                        id = data[0];
                        type = data[1];
                    }
                    if (type && id) {
                        self.setValue(type);
                        self.trigger('change');
                        var child = _.find(self.children, function (child) {
                            return child.nodeName == type;
                        });
                        if (child) {
                            child.setValue(id, true);
                        }
                        choiceView.removeClass("is-draggedOver");
                        self.placeholderText.text(defaultText);
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }).on("dragleave", function () {
                    choiceView.removeClass("is-draggedOver");
                    self.placeholderText.text(defaultText);
                });
                this.selectListView.bind('coral-selectlist:change', $.proxy(this.onSelectionMade, this));
                var $contentDiv = $(selectedChildTemplate);
                $placeholder.find(".choice-view").prepend($contentDiv);
                this.$contentDiv = $contentDiv;
                this.placeholder = $placeholder;
                this.placeholder.toggle(!this.hidden);
            }
            return this.placeholder;
        }
    });
})(expeditor);
(function () {
    var addConditionTemplate = '<div class="choice-model-extension"></div>',
        optionsDiv = '<div class="addOr-statement-options"></div>';
    var ConditionView = expeditor.view.ConditionView = expeditor.view.ChoiceView.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.inline = true;
            this.isExtensionVisible = true;
            this.$extension = null;
        },

        _getOperator : function (condition) {
            
            return condition.children[1].children[1];
        },

        _getSecondOperand : function (condition) {
            
            return condition.children[1].children[2];
        },

        _addStatement : function (e, nested, copyModel, operator, insertBefore, wrapAround) {
            this.trigger("change", {action : "Extend", nested : nested, copyModel : copyModel, operator : operator, insertBefore : insertBefore, wrapAround : wrapAround});
        },

        _addNestedStatement : function () {
            this.trigger("change", {action : "Extend", nested : true});
        },

        _deleteStatement : function () {
            this.trigger("change", {action : "DeleteEntire"});
        },

        
        _addExtension : function () {
            this.$extension = $(addConditionTemplate);
            var addButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Add Condition'), 'addCircle', 'add-statement-button')
                .click($.proxy(this._addStatement, this));
            this.$extension.append(addButton);
            var deleteButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Delete'), 'delete', 'delete-statement-button')
                .click($.proxy(this._deleteStatement, this));
            this.$extension.append(deleteButton);
            this.$extension.appendTo(this.placeholder);
            this.$extension.toggle(this.isExtensionVisible);
            return this;
        },

        _toggleDeleteOption : function (show) {
            if (this.$extension) {
                var deleteButton = this.$extension.find(".delete-statement-button");
                if (show) {
                    deleteButton.show();
                } else {
                    deleteButton.hide();
                }
            }
        },

        _toggleStatementOptions : function (target) {
            target.find(".addOr-statement-options").toggle();
        },

        onDeleteClick : function (event) {
            
            this.trigger("change", {action : "Delete"});
        },

        setContent : function (htmlelement) {
            if (htmlelement) {
                this._super.apply(this, arguments);
                this._toggleDeleteOption(true);
            } else if (this.placeholder) {
                this.$contentDiv.find('> *').detach();
                this._toggleDeleteOption(false);
            }
        },

        render : function () {
            if (!this.placeholder) {
                this._super.apply(this, arguments);
                this._hideOptions();
                if (!this.viewConfig.extension || this.parentView.nodeName !== this.viewConfig.extension) {
                    this._addExtension();
                } else if (this.viewConfig.deleteOption) {
                    var options = $(optionsDiv),
                        removeButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Delete'), 'delete'),
                        addButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Add Condition'), 'addCircle');
                    addButton.on('click', $.proxy(this._addNestedStatement, this));
                    options.append(addButton);
                    removeButton.on('click', $.proxy(this.onDeleteClick, this));
                    options.append(removeButton);
                    this.placeholder.append(options);
                    var self = this;
                    this.placeholder.on('click', function (e) {
                        var child = $(this).children(".choice-view").children(".child-selected-view");
                        if (child.has(e.target).length == 0) {
                            self._toggleStatementOptions($(this));
                        }
                    });
                }
            }
            return this.placeholder;
        },

        disableExtension : function () {
            this.isExtensionVisible = false;
            if (this.$extension) {
                this.$extension.toggle(this.isExtensionVisible);
            }
        },

        enableExtension : function () {
            if (!this.$extension) {
                this._addExtension();
            }
            this.isExtensionVisible = true;
            this.$extension.toggle(this.isExtensionVisible);
        },

        showExtension : function () {
            if (this.$extension) {
                this.$extension.toggle(true);
            }
        }
    });
}());
(function ($, expeditor) {
    var txtWsdl = Granite.I18n.get("Select"),
        txtOperationHelp = Granite.I18n.get("Select Operation"),
        txtInput = Granite.I18n.get("INPUT"),
        txtInputHelp = Granite.I18n.get("Select the objects to be used as input for these variables"),
        txtOutput = Granite.I18n.get("OUTPUT"),
        txtOutputHelp = Granite.I18n.get("Select the column of the table to display the output."),
        txtWsdlErrorTitle = Granite.I18n.get("Error"),
        txtWsdlError = Granite.I18n.get("There was some error in setting up Web Service");

    var list_item = "<div class='list-view-item' ></div>",
        list_item_selector = ".list-view-item",
        wsdl_Margin = '<div class="wsdl-margin"></div>',
        wsdl_param = '<div class="wsdl-param"></div>',
        wsdl_param_div = '<div class="wsdl-param-title"></div>',
        wsdl_param_desc = '<div class="wsdl-param-desc"></div>',

        wsdl_inputs_div = '<div class="wsdl-inputs-list wsdl-common wsdl-input-width"> </div>',
        wsdl_input_title = '<span class="wsdl-title coral-Heading coral-Heading--6">' + txtInput + '</span><hr class="wsdl-hr">',
        wsdl_input_help = '<span class="wsdl-helping-text wsdl-margin">' + txtInputHelp + '</span>',

        wsdl_outputs_div = '<div class="wsdl-inputs-list wsdl-common wsdl-output-width"> </div>',
        wsdl_output_title = '<span class="wsdl-title coral-Heading coral-Heading--6">' +  txtOutput + ' </span><hr class="wsdl-hr">',
        wsdl_output_help = '<span class="wsdl-helping-text wsdl-margin">' + txtOutputHelp + '</span>';

    var WSDLView = expeditor.view.WSDLView = expeditor.view.BaseView.extend({
        init : function (nodeName) {
            this._super.apply(this, arguments);
            this.prevWsdlUrl = "";
            this.prevOperation = "";
            this.wsdlFetched = false;
        },

        
        setWSDLEndPoint : function (wsdlEndPoint) {
            this.prevWsdlUrl = wsdlEndPoint;
            this.selectedWebService = this.wsdlServiceMap && this.wsdlServiceMap[wsdlEndPoint] ? this.wsdlServiceMap[wsdlEndPoint] : null;
            if (this.selectedWebService !== null) {
                wsdlEndPoint = expeditor.Utils.getOrElse(this.selectedWebService, "jcr:title", null);
            }
            this.wsdlendpoint.value = wsdlEndPoint;
        },

        
        setOperation : function (operation) {
            if (this.selectedWebService !== null) {
                this.hideOperationList();
            } else {
                var singleOperation = {content : {innerHTML : operation}, value : 0};
                this.operationList.items.add(singleOperation);
                this.operationList.show();
            }

            
            $(this.operationList).find('.coral-DecoratedTextfield-input')[0].value = operation;
            this.prevOperation = "0";
            
            $(this.operationList).find('.coral-Autocomplete-trigger')[0].onclick = $.proxy(this.onOperationButtonClick, this);
        },

        
        
        setOperations : function (wsdlOperations) {
            this.wsdlFetched = true;

            
            $(this.operationList).find('.coral-Autocomplete-trigger')[0].onclick = null;
            
            this.operationList.value = "";

            this.stopWait();

            this.clearOperationList();
            if (wsdlOperations.length > 0) {
                this.operationList.show();
            }

            for (var index = 0; index < wsdlOperations.length; index++) {
                
                var singleOperation = {content : {innerHTML : wsdlOperations[index]}, value : index + 1};
                this.operationList.items.add(singleOperation);
            }
        },

        setWSDLError : function () {
            this.showNotification(txtWsdlError, txtWsdlErrorTitle);
            this.stopWait();
        },

        
        startWait : function () {
            var wrapperElement = $("#exp-main-container").get(0);
            Granite.author.ui.helpers.wait(wrapperElement);
        },

        
        stopWait : function () {
            Granite.author.ui.helpers.clearWait();
        },

        
        
        
        onOperationButtonClick : function () {
            
            if (this.wsdlFetched == false) {
                var value = this.wsdlendpoint.value;
                if (this.selectedWebService) {
                    value = this.selectedWebService.url || this.selectedWebService.id;
                }
                this.trigger('change', {action : 'WSDLClicked',wsdlEndPoint : value});
                this.startWait();
            }
        },

        
        
        updateWSDLUrl : function (wsdlEndPoint) {
            
            var wsdlUrl = wsdlEndPoint.trim();
            if (wsdlUrl && wsdlUrl.length && (this.prevWsdlUrl != wsdlUrl)) {
                this.clearAllLists();
                this.setWSDLEndPoint(wsdlUrl);
                this.trigger('change', {action : 'WSDLClicked', wsdlEndPoint : wsdlUrl});
                this.startWait();
            }
        },

        
        
        onOperationSelection : function (event) {
            
            var newValue = this.operationList.value;
            if (newValue === this.prevOperation) {
                return;
            }
            this.prevOperation = newValue;
            this.wsdlinputSection.show();
            this.wsdlOutputSection.show();
            var actualIndex = parseInt(newValue) - 1;
            this.trigger('change', {action : 'OperationSelected', indexClicked : actualIndex});
        },

        
        _filterOperationList : function (pattern) {
            pattern = pattern ? pattern.toLowerCase() : "";
            var groups = this.servicesList.groups.getAll();
            groups.forEach(function (group) {
                var show = false;
                var items = group.items.getAll();
                if (group.label && group.label.toLowerCase().indexOf(pattern) >= 0) {
                    show = true;
                    items.forEach(function (item) {
                        item.show();
                    });
                } else {
                    var hitCount = 0;
                    items.forEach(function (item) {
                        if (item.textContent && item.textContent.toLowerCase().indexOf(pattern) >= 0) {
                            item.show();
                            hitCount++;
                        } else {
                            item.hide();
                        }
                    });
                    show = (hitCount > 0);
                }
                if (show) {
                    group.show();
                } else {
                    group.hide();
                }
            });
        },

        render : function () {
            if (!this.placeholder) {
                var placeholder =  $('<div class="list-view ' + Granite.I18n.get(this.nodeName) + '" ></div>');
                this.placeholder = placeholder;
                placeholder.html('');
                var row = $(list_item);
                placeholder.append(row);

                var wrapper = $('<div class="wsdl-operation-list-wrapper"></div>')[0];
                
                var wsdlendpoint = new Coral.Textfield().set({
                    placeholder : txtWsdl,
                    variant : "quiet"
                });
                this.wsdlServiceMap = {};
                this.wsdlendpoint = wsdlendpoint;
                wrapper.append(wsdlendpoint);

                var button = new Coral.Button().set({
                    icon : 'chevronDown',
                    variant : 'quiet',
                    iconSize : "XS"
                });
                wrapper.append(button);
                row.append(wrapper);
                var self = this;
                
                var selectListOverlay = new Coral.Overlay();
                selectListOverlay.target = wrapper;
                selectListOverlay.focusOnShow = Coral.mixin.overlay.focusOnShow.ON;
                selectListOverlay.returnFocus = Coral.mixin.overlay.returnFocus.ON;
                selectListOverlay.placement = Coral.Overlay.placement.BOTTOM;
                selectListOverlay.alignAt = Coral.Overlay.align.LEFT_BOTTOM;
                selectListOverlay.alignMy = Coral.Overlay.align.LEFT_TOP;
                var selectList = new Coral.SelectList();
                selectListOverlay.appendChild(selectList);
                wrapper.append(selectListOverlay);
                wsdlendpoint.on('focus', function () {
                    selectListOverlay.open = true;
                });
                $(wsdlendpoint).on('paste keyup keypress keydown', function (e) {
                    self._filterOperationList(this.value);
                    if (e.type == 'keydown' && e.which === 40) {
                        selectListOverlay.open = true;
                        Coral.commons.nextFrame(function () {
                            var item = selectList.querySelector("coral-selectlist-item:not([hidden])");
                            if (item) {
                                item.focus();
                                item.trigger("mouseenter");
                            }
                        });
                    }
                });

                $(wsdlendpoint).on('blur', function (e) {
                    Coral.commons.nextFrame(function () {
                        var activeElement = document.activeElement;
                        if (!wrapper.contains(activeElement)) {
                            self.updateWSDLUrl(self.wsdlendpoint.value);
                            selectListOverlay.open = false;
                        }
                    });
                });
                selectList.on('coral-selectlist:change', function () {
                    if (selectList.selectedItem) {
                        selectListOverlay.open = false;
                        self.updateWSDLUrl(selectList.selectedItem.value);
                    }
                });
                _.each(this.ctx.webServicesConfig, function (serviceConfig) {
                    
                    
                    if (serviceConfig && serviceConfig.items && serviceConfig.items.length > 0) {
                        var groupTitle = serviceConfig.title;
                        var group = selectList.groups.add({
                            label : groupTitle
                        });
                        _.each(serviceConfig.items, function (config) {
                            var id = config.id,
                                title = expeditor.Utils.getOrElse(config, "jcr:title", null);
                            if (title != null) {
                                var singleWSDL = {
                                    value : id,
                                    content : {
                                        innerHTML : title
                                    }
                                };
                                group.items.add(singleWSDL);
                            }
                            self.wsdlServiceMap[id] = config;
                        });
                    }
                }, this);
                this.servicesList = selectList;
                
                var operationList = new Coral.Autocomplete().set({
                    placeholder : txtOperationHelp,
                    match : 'startswith'
                });

                $(operationList).addClass("wsdl-operation-list-wrapper");
                this.operationList = operationList;
                row.append(operationList);
                operationList.on('change', $.proxy(this.onOperationSelection, this));
                this.hideOperationList();

                
                var wsdlinputSection = $(wsdl_inputs_div);
                this.wsdlinputSection = wsdlinputSection;
                row.append(wsdlinputSection);
                var InputTitle = $(wsdl_input_title);
                wsdlinputSection.append(InputTitle);
                var inputHelp = $(wsdl_input_help);
                wsdlinputSection.append(inputHelp);
                var inputList = $(wsdl_Margin);
                wsdlinputSection.append(inputList);
                this.inputList = inputList;
                this.wsdlinputSection.hide();

                
                var wsdlOutputSection = $(wsdl_outputs_div);
                this.wsdlOutputSection = wsdlOutputSection;
                row.append(wsdlOutputSection);
                var OutputTitle = $(wsdl_output_title);
                wsdlOutputSection.append(OutputTitle);
                var outputHelp = $(wsdl_output_help);
                wsdlOutputSection.append(outputHelp);
                var outputList = $(wsdl_Margin);
                wsdlOutputSection.append(outputList);
                this.outputList = outputList;
                this.wsdlOutputSection.hide();

                
                this.trigger('change', {action : 'WSDLViewDrawn'});
            }
            return this.placeholder;
        },

        
        addNewInputParam : function (title, parameter, description) {
            var paramTitle = $(wsdl_param_div);
            paramTitle.append(title);
            var param = $(wsdl_param);
            param.append(paramTitle);
            if (description) {
                var paramDesc = $(wsdl_param_desc);
                paramDesc.text("(" + description + ")");
                param.append(paramDesc);
            }
            param.append(parameter.render());
            this.inputList.append(param);
        },

        
        addNewOutputParam : function (title, parameter, description, removeOutputRoot) {
            
            
            
            var displayTitle = title;
            if (removeOutputRoot) {
                displayTitle = title.substring(title.indexOf(".") + 1);
            }

            var paramTitle = $(wsdl_param_div);
            paramTitle.append(displayTitle);
            var param = $(wsdl_param);
            param.append(paramTitle);
            if (description) {
                var paramDesc = $(wsdl_param_desc);
                paramDesc.text("(" + description + ")");
                param.append(paramDesc);
            }
            param.append(parameter.render());
            this.outputList.append(param);
        },
        
        
        clearAllLists : function () {
            this.prevOperation = "";
            this.clearOperationList();
            this.hideOperationList();
            this.clearInputParams();
            this.hideInputParams();
            this.clearOutputParams();
            this.hideOutputParams();
        },
        clearOperationList : function () {
            this.operationList.items.clear();
        },
        clearInputParams : function () {
            this.inputList.children().remove();
        },
        clearOutputParams : function () {
            this.outputList.children().remove();
        },
        hideOperationList : function () {
            this.operationList.hide();
        },
        hideInputParams : function () {
            this.wsdlinputSection.hide();
        },
        hideOutputParams : function () {
            this.wsdlOutputSection.hide();
        },
        
        
        resetInlines : function () {
            $(this.operationList).css('display', 'inline-block');
            this.wsdlinputSection.css('display', 'inline-block');
            this.wsdlOutputSection.css('display', 'inline-block');
        }
    });
})(jQuery, expeditor);


(function (expeditor, $) {

    var header = '<coral-selectlist-item class="coral3-SelectList-item selectlist-header">' +
                    '<i class="coral-Icon coral-Icon--accordionLeft"></i>' +
                    '<span></span>' +
                '</coral-selectlist-item>',
        searchField = '<coral-selectlist-item class="coral3-SelectList-item selectlist-searchfield">' +
                            '<span class="coral-DecoratedTextfield">' +
                            '<i class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search"></i>' +
                            '<input type="text" class="coral-DecoratedTextfield-input coral-Textfield" placeholder="' + Granite.I18n.get("Filter Objects") + '">' +
                            '<button type="button" class="coral-DecoratedTextfield-button coral-MinimalButton clearsearch-button">' +
                            '<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>' +
                            '</button>' +
                            '</span>' +
                        '</coral-selectlist-item>',
        selectListItemTemplate = '<coral-selectlist-item class="coral3-SelectList-item"></coral-selectlist-item>',
        compositeOptionIcon = '<i class="coral-Icon coral-Icon--accordionRight selectlist-expandicon"></i>',
        selectListEl = '.expression-selectlist',
    CustomSelectList = expeditor.view.CustomSelectList = expeditor.EventTarget.extend({

        init : function (options) {
            this.options = options;
        },

        onOptionSelected : function (e) {
            var item = e.target.selectedItem;
            if (item) {
                var composite = (item.dataset.composite === "true");
                if (!composite) {
                    this.toggleVisibility();
                }
                this.trigger($.Event('coral-selectlist:change', {
                    target : {
                        selectedItem : item
                    },
                    preventHide : true
                }));
                this.placeholder.open = composite;
            }
            return false;
        },

        addOption : function (option, index) {
            if (this.selectList && this.selectList instanceof Coral.SelectList && this.selectList.items) {
                var item = $(selectListItemTemplate).attr("data-label", option.label)
                                                    .attr("data-value", option.value)
                                                    .attr("data-composite", option.composite)
                                                    .html(option.label);
                item[0].value = option.value;
                if (option.type) {
                    item.prepend("<span class='type'>" + option.type.split("|")[0] + "</span>");
                }

                if (option.composite) {

                    function expandOption() {
                        var selectedItem = item[0];
                        that.saveAndClearSelectList();
                        that.updateHeaderAndSearchField(option.label);
                        that.trigger($.Event('coral-selectlist:change', {
                            target : {
                                selectedItem : selectedItem
                            },
                            preventHide : true
                        }));
                        return false;
                    }
                    var expandIcon = $(compositeOptionIcon);
                    var that = this;

                    expandIcon.on('click', function (e) {
                        expandOption();
                    });

                    item.on('keydown', function (e) {
                        
                        if (e.which === 39) {
                            expandOption();
                        }
                    });
                    item.append(expandIcon);
                }
                var items = this.selectList.items,
                    length = items.length;
                if (index && index < length) {
                    item.add(item, items[index]);
                } else {
                    items.add(item[0]);
                }
            }
        },

        render : function () {
            if (!this.placeholder) {
                var self = this;
                this.placeholder = new Coral.Overlay();
                $(this.placeholder).addClass("expeditor-customoverlay");
                this.placeholder.target = this.options.target;
                this.placeholder.focusOnShow = Coral.mixin.overlay.focusOnShow.OFF;
                this.placeholder.returnFocus = Coral.mixin.overlay.returnFocus.OFF;
                this.placeholder.off('focusout');
                this.selectList = new Coral.SelectList();
                this.selectList.on("coral-selectlist:change", $.proxy(this.onOptionSelected, this));
                this.header = $(header).on('click', function () {
                    self.setPreviousOptions();
                    return false;
                });
                $(this.placeholder).addClass("custom-selectlist");
                $(this.placeholder).append(this.header);

                this.searchField = $(searchField).on('click', function () {
                        return false;
                    });
                $(this.placeholder).append(this.searchField);
                this.clearSearchButton = this.searchField.find(".clearsearch-button")
                    .on('click', function () {
                        self.clearSearch();
                        return false;
                    });

                this.searchField.find("input").on('change paste keyup keypress keydown', function (e) {
                    if (e.which === 38 || e.which === 40) {
                        
                        var visibleItems = self.selectList.items.getAll();
                        visibleItems = visibleItems[0];
                        if (visibleItems) {
                            Coral.commons.nextFrame(function () {
                                visibleItems.trigger("mouseenter");
                                visibleItems.focus();
                            });
                        }
                        e.preventDefault();
                    } else {
                        var select = self.selectList;
                        var value = $(this).val();
                        var lazyList = $(select).data("lazyList");
                        if (lazyList) {
                            lazyList.filter(value);
                            if (!value || value === "") {
                                self.clearSearchButton.hide();
                            } else {
                                self.clearSearchButton.show();
                            }
                        }
                    }
                    e.stopImmediatePropagation();
                });
            }

            this.placeholder.appendChild(this.selectList);
            return this.placeholder;
        },

        getSelectList : function () {
            return this.selectList;
        },

        clearOptions : function () {
            var options = this.selectList.items.clear();
        },

        saveAndClearOptions : function () {
            this.previousOptions = this.selectList;
            $(this.previousOptions).detach();
        },

        setPreviousOptions : function () {
            if (this.previousSelectList) {
                var options = this.selectList;
                $(options).detach();
                this.selectList = this.previousSelectList;
                this.placeholder.appendChild(this.previousSelectList);
                this.previousSelectList = null;
            }
            this.header.hide();
            this.searchField.hide();
            this.trigger('showDefault');
            Coral.commons.nextFrame($.proxy(this.setFocusToList, this));
        },

        saveAndClearSelectList : function () {
            this.previousSelectList = this.selectList;
            $(this.previousOptions).detach();
        },

        setOptionsList : function (list) {
            if (list) {
                if (list.length > 0) {
                    list = list[0];
                }
                $(this.selectList).detach();
                this.selectList = list;
                $(this.selectList).on('keydown', function (e) {
                    
                    if (e.which === 37) {
                        self.setPreviousOptions();
                        return false;
                    }
                });
                $(this.selectList).addClass("expression-selectlist");
                var self = this;
                if (this.selectList instanceof Coral.SelectList) {
                    this.selectList.on('coral-selectlist:change', function (e) {
                        self.placeholder.open = false;
                    });
                    this.searchField.addClass("visible");
                    this.searchField.show();
                    this.searchField.find("input").focus();
                } else {
                    this.searchField.removeClass("visible");
                    this.searchField.hide();
                }
                this.placeholder.appendChild(list);
            }
        },

        getSelectListElement : function () {
            return this.selectList;
        },

        updateHeaderAndSearchField : function (header, placeholder) {
            this.header.show()
                .find("span").html(header);
            placeholder = placeholder ? Granite.I18n.get(placeholder) : Granite.I18n.get("Filter Objects");
            this.searchField.find("input").attr("placeholder", placeholder);
        },

        hideHeaderAndSearchField : function (header, placeholder) {
            this.header.hide();
            this.searchField.removeClass("visible");
            this.searchField.hide();
        },

        clearSearch : function () {
            this.searchField.find("input")
                .val("")
                .trigger('change');
        },

        toggleVisibility : function (target, hide) {
            if (target) {
                this.placeholder.target = target;
                this.placeholder.placement = Coral.Overlay.placement.BOTTOM;
                this.placeholder.alignAt = Coral.Overlay.align.LEFT_BOTTOM;
                this.placeholder.alignMy = Coral.Overlay.align.LEFT_TOP;
                this.placeholder.offset = -1;
            }
            this.clearSearch();
            if (hide) {
                this.placeholder.open = false;
            } else {
                this.placeholder.open = !this.placeholder.open;
            }
            Coral.commons.nextFrame($.proxy(this.setFocusToList, this));
        },

        setFocusToList : function () {
            if (this.placeholder.open) {
                var searchField = this.searchField;
                if (searchField.hasClass("visible")) {
                    searchField.find("input").focus();
                } else if (this.selectList.items && this.selectList.items.getFirstSelected) {
                    var selectedItem = this.selectList.items.getFirstSelected();
                    if (!selectedItem || selectedItem.length == 0) {
                        selectedItem = this.selectList.items.getAll()[0];
                    }
                    selectedItem.trigger("mouseenter");
                    selectedItem.focus();
                }
            }
        }
    });

})(expeditor, jQuery);
