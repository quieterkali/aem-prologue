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

(function (expeditor) {
    
    var BaseComponent = expeditor.component.BaseComponent = expeditor.EventTarget.extend({
        
        init : function (nodeName, ctx, config, componentConfig) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            if (componentConfig) {
                this._componentConfig = componentConfig;
            }
            this.model = ctx.createModel(this.nodeName, componentConfig);
            this.view = ctx.createView(this.nodeName, componentConfig);
            var listener = expeditor.Utils.getOrElse(config, "changelistener", null);
            if (typeof listener === "string") {
                this.changeListener = $.extend({}, expeditor.Utils.getOrElse(window, listener, null));
            }
            
            if (this.model) {
                this.model.bind('change', this.onModelChange, this);
            }
            this.view.bind('change', this.onViewChange, this);
        },

        onModelChange : function () {

        },

        onViewChange : function (e, data) {
            var _data = data || {},
                action = data.action || "Default",
                callbackName = 'onView' + action + "Action";
            if (typeof this[callbackName] === "function") {
                this[callbackName].apply(this, [e,data]);
            }
        },

        getModel : function () {
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
        },

        getView : function () {
            return this.view;
        },

        

        render : function () {
            return this.view.render.apply(this.view, arguments);
        },

        destroy : function (trigger) {
            this.view.destroy();
            this.model.destroy();
            if (trigger !== false) {
                this.trigger("change", {action : "delete"});
            }
        }
    });
})(expeditor);
(function (expeditor) {
    var ContainerComponent = expeditor.component.ContainerComponent = expeditor.component.BaseComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            var config = ctx.getConfig(nodeName);
            this.children = config.children;
            if (this.children == null) {
                throw "Bad Configuration for " + nodeName + ". children not defined";
            }
            this.childComponents = [];
        },

        onChildChange : function (e) {
            var childName = e.target.nodeName;
            var listener = expeditor.Utils.getOrElse(this, "changeListener.on" + childName + "Change", null);
            if (typeof listener === "function") {
                listener.apply(this, [e.target]);
            }
        },

        getChild : function (index, overwrite) {
            if (index > this.children.length) {
                return null;
            }
            if (overwrite || this.childComponents[index] == null) {
                var childComponent = this.createChildComponent(this.children[index], index);
                this.childComponents[index] = childComponent;
            }
            return this.childComponents[index];
        },

        createChildComponent : function (nodeName, index) {
            var config = this.ctx.getConfig(this.nodeName, this._componentConfig);
            var childConfig = expeditor.Utils.getOrElse(config, "extras.component.childConfig", {});
            var childComponent = this.ctx.createComponent(nodeName, childConfig[index]);
            childComponent.bind('change', this.onChildChange, this);
            childComponent.index = index;
            childComponent.parent = this;
            childComponent.view.setParentView(this.view);
            return childComponent;
        },

        loadConfigJsonModel : function () {
            var config = this.ctx.getConfig(this.nodeName);
            var childComponents = this.childComponents || [];
            for (var i = 0; i < childComponents.length; i++) {
                var childComponent = childComponents[i];
                var childJson =  expeditor.Utils.getOrElse(config, "jsonModel." + childComponent.nodeName, null);
                if (childJson != null) {
                    childComponent.setModel(childComponent.getModel().fromJson(childJson));
                    childComponent.trigger("change");
                }
            }
        },
        setModel : function (model) {
            this._super(model);
            var self = this;
            model.items.forEach(function (childModel, index) {
                self.childComponents[index].setModel(childModel);
            });
        },

        getChildOfType : function (type, overwrite) {
            var foundChild = null;
            var index = this.children.indexOf(type);
            if (index >= 0) {
                foundChild = this.getChild(index, overwrite);
            }
            return foundChild;
        },

        isValid : function () {
            return this.childComponents.every(function (obj) {
                return obj.isValid();
            });
        }
    });
})(expeditor);
(function (expeditor) {
    var ListComponent = expeditor.component.ListComponent = expeditor.component.ContainerComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.childComponents = [];
            this.minCount = expeditor.Utils.getOrElse(config, "minCount", 0);
            this.view.minCount = this.minCount;
        },

        addChildComponent : function () {
            var childComponent = this.createChildComponent(this.children[0]);
            this.childComponents.push(childComponent);
            this.model.add(childComponent.getModel());
            return childComponent;
        },

        onViewAddItemAction : function (e, data) {
            var child = this.addChildComponent();
            this.view.setRowContent(data.rownum, child.render());
            this.trigger('change');
        },

        onViewDeleteItemAction : function (e, data) {
            var rowNum = data.rownum;
            this.childComponents.splice(rowNum, 1);
            this.model.remove(rowNum);
            this.trigger('change');
        },

        onViewReorderItemAction : function (e, data) {
            var oldIndex = data.oldIndex,
                newIndex = data.newIndex;
            var child = this.childComponents.splice(oldIndex, 1);
            this.childComponents.splice(newIndex, 0, child[0]);
            this.model.move(oldIndex, newIndex);
            this.trigger('change');
        },

        _updateModel : function () {
            this.model.items = [];
            for (var i = 0; i < this.childComponents.length; i++) {
                this.model.add(this.childComponents[i].getModel());
            }
        },

        getModel : function () {
            this._updateModel();
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
            var children = this.children;
            var childComponentNodeName = children[0];
            this.view.render();
            if (model.items) {
                for (var i = 0; i < model.items.length; i++) {
                    var childComponent = this.createChildComponent(childComponentNodeName);
                    this.childComponents.push(childComponent);
                    childComponent.setModel(model.items[i]);
                    this.view.addNewRow();
                    this.view.setRowContent(i, childComponent.render());
                }
            }
        },

        render : function () {
            var rendered = this._super.apply(this, arguments);
            if ((!this.childComponents || this.childComponents.length == 0) && this.minCount) {
                for (i = 0; i < this.minCount; i++) {
                    this.view.addNewRow(false);
                    this.onViewAddItemAction(null, {rownum : i});
                }
            }
            return rendered;
        }
    });

})(expeditor);
(function (expeditor) {
    var ChoiceComponent = expeditor.component.ChoiceComponent = expeditor.component.ContainerComponent.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            var opts = this.children.map(function (child) {
                var config = ctx.getConfig(child),
                    choice = config.choiceName || child;
                return {
                    value : child,
                    label : choice
                };
            }, this);
            this.view.setOptions(opts);
            var selectedItem = expeditor.Utils.getOrElse(config, "selectedItem", true);
            this.dataType = expeditor.Utils.getOrElse(config, "dataType", 'ANY');
            this.childComponent = null;
            if (selectedItem == true) {
                var firstChild = this.getChild(0);
                this.model.setChoiceModel(firstChild.getModel());
                this.view.setValue(this.model.choiceModel.nodeName);
                this.childComponent = firstChild;
            }
        },

        selectFirstItem : function (value) {
            var child = this.getChild(0);
            if (value !== undefined) {
                child.view.setValue(value);
            }
            this._setChild(this.getChild(0));
            this.view.setValue(this.model.choiceModel.nodeName);
            this.render();
        },

        render : function () {
            var rendered = this.view.render();
            var child = null;
            if (this.childComponent === null) {
                this.view.setContent(null);
            } else {
                this.view.setContent(this.childComponent.render(), this.childComponent.nodeName);
            }
            return rendered;
        },

        getModel : function () {
            return this.model;
        },

        onChildChange : function () {
            this._super.apply(this, arguments);
        },

        _setChild : function (child) {
            this.childComponent = child;
            var model = child === null ? null : child.getModel();
            this.model.setChoiceModel(model);
        },

        _attachChild : function (child) {
            var childExists = this.childComponents.indexOf(child) > -1;
            this._setChild(child);
            if (!childExists) {
                var index = this.children.indexOf(child.nodeName);
                var replaceChild = this.childComponents[index];
                if (replaceChild && replaceChild !== child) {
                    replaceChild.destroy(false);
                }
                this.childComponents[index] = child;
                this.view.children[index] = child.view;
                child.unbind();
                child.bind("change", this.onChildChange, this);
                child.parent = this;
                child.index = index;
                child.view.setParentView(this.view);
            }

        },

        _detachChild : function () {
            var child = this.childComponent;
            child.unbind("change");
            child.parent = null;
            child.index = null;
            child.view.parentView = null;
            this.childComponents[this.childComponents.indexOf(child)] = null;
            this.childComponent = null;
            this.model.setChoiceModel(null);
            return child;
        },

        onViewDefaultAction : function (e, data, trigger) {
            var val = this.view.getValue();
            this._setChild(this.getChildOfType(val));
            this.render();
            if (trigger !== false) {
                this.trigger("change");
            }
        },

        setModel : function (model) {
            this.model = model;
            if (model.choiceModel != null) {
                this.childComponent = this.getChildOfType(model.choiceModel.nodeName);
                this.childComponent.setModel(model.choiceModel);
                this.view.setValue(model.choiceModel.nodeName);
            } else {
                this.childComponent = null;
            }
            this.trigger('change');
            
            this.render();
        },

        getCurrentType : function () {
            return this.dataType;
        },

        isValid : function () {
            if (!this.childComponent) {
                return false;
            }
            return this.childComponent.isValid();
        }

    });
})(expeditor);
(function (expeditor) {
    
    var OperatorSelectorComponent = expeditor.component.ChoiceComponent.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.childType = expeditor.Utils.getOrElse(extraConfig, "childType", null);
            this.choiceFilter = expeditor.Utils.getOrElse(extraConfig, "filter", null);

            this.filter(["ANY", "ANY", "ANY"]);
        },

        isUnaryOperatorSelected : function () {
            if (this.childComponent != null) {
                var selectedOperator = this.childComponent.nodeName;
                var childConfig = this.ctx.getConfig(selectedOperator);
                var operatorType = childConfig.extras.operatorType;
                return operatorType[0].length == 2;
            }
            return false;
        },
        getSelectedOperatorTypes : function () {
            if (this.childComponent == null) {
                return null;
            }
            var config = this.ctx.getConfig(this.childComponent.nodeName);
            return config.extras.operatorType;
        },

        getAllOperatorTypes : function () {
            return this.operators;
        },

        checkType : function () {
            if (this.childComponent == null) {
                return true;
            }
            return this.operatorNames.indexOf(this.childComponent.nodeName) > -1;
        },

        
        filter : function (types) {
            var config,
                self = this,
                operators = [],
                operatorNames = [],
                opts = this.children.filter(function (child) {
                    return !this.choiceFilter || this.choiceFilter.indexOf(child) < 0;
                }, this).filter(function (child) {

                    var op_config = self.ctx.getConfig(child);
                    var operatorTypes = expeditor.Utils.getOrElse(op_config, "extras.operatorType", []);
                    var isCompatible = this._isCompatible(operatorTypes, types);
                    if (isCompatible) {
                        operators = operators.concat(operatorTypes);
                        operatorNames.push(child);
                    }
                    return isCompatible;
                }, this).map(function (child) {
                    config = self.ctx.getConfig(child);
                    var choice = config.choiceName || child;
                    return {
                        value : child,
                        label : choice
                    };
                });
            this.operators = operators;
            this.operatorNames = operatorNames;
            this.view.setOptions(opts);
        },

        _isCompatible : function (operatoryTypes, types) {
            return operatoryTypes.some(function (opSignature) {
                    var i = 0, compatible = true;
                    for (i = 0; i < types.length && compatible; i++) {
                        compatible = compatible && expeditor.Utils.isTypesCompatible(opSignature[i] || 'ANY', types[i]);
                    }
                    return compatible;
                });
        },

        render : function () {
            var rendered = this.view.render(true);
            if (this.childComponent === null) {
                this.view.setContent(null);
            } else {
                this.view.setContent(this.childComponent.render(this.childType), this.childComponent.nodeName);
                this.view._hideOptions();
            }
            return rendered;
        },

        onViewDefaultAction : function () {
            var val = this.view.getValue();
            this.childComponent = this.getChildOfType(val);
            this.model.setChoiceModel(this.childComponent ? this.childComponent.getModel() : null);
            this.render();
            this.view._hideOptions();
            this.trigger("change");
        },

        onViewResetAction : function () {
            this.childComponent = null;
            this.model.setChoiceModel(null);
            this.parent.resetOperator();
        },

        isValid : function () {
            return !!this.childComponent;
        },

        
        removeOperators : function (operatorsList) {
            var newOperatorNames = this.operatorNames.filter(function (op) {
                return (operatorsList.indexOf(op) == -1);
            });
            if (newOperatorNames.length != this.operatorNames.length) {
                var newOperators = [];
                var newOpts = newOperatorNames.map(function (child) {
                    var config = this.ctx.getConfig(child);
                    var operatorTypes = config.extras.operatorType;
                    newOperators = newOperators.concat(operatorTypes);
                    var choice = config.choiceName || child;
                    return {
                        value : child,
                        label : choice
                    };
                }, this);
                this.operators = newOperators;
                this.operatorNames = newOperatorNames;
                this.view.setOptions(newOpts);
            }
        }
    });
    expeditor.component.OperatorSelectorComponent = OperatorSelectorComponent;
})(expeditor);
(function (expeditor) {
    var ExpressionComponent = expeditor.component.ExpressionComponent = expeditor.component.ChoiceComponent.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.returnType = expeditor.Utils.getOrElse(config, "dataType", "ANY");
            this.renderCondition = expeditor.Utils.getOrElse(config, "renderCondition", null);
            this._filterOptionsBasedOnType(this.returnType);
            this.currentType = this.returnType;
            this.extension = expeditor.Utils.getOrElse(config, "extension", null);
            this.selectedItem = expeditor.Utils.getOrElse(config, "selectedItem", true);
            
            if (this.childComponent) {
                this.childComponent.setTypes(this.currentType);
            }
        },

        hide : function (hide) {
            this.view.hide(hide);
        },
        getMetaProps : function () {
            if (this.childComponent && typeof(this.childComponent.getMetaProps) === "function") {
                return this.childComponent.getMetaProps();
            }
        },
        syncMetaProps : function (s) {
            this.metaProps = s;
            if (this.childComponent && typeof(this.childComponent.syncMetaProps) === "function") {
                this.childComponent.syncMetaProps(s);
            }
        },
        setModel : function (model) {
            this.model = model;
            if (model.choiceModel != null) {
                this.childComponent = this.getChildOfType(model.choiceModel.nodeName);
                
                this.childComponent.setTypes(this.currentType);
                this.childComponent.setModel(model.choiceModel);
                this.view.setValue(model.choiceModel.nodeName);
                if (typeof this.childComponent.view.updateView === "function") {
                    var index = this.parent.childComponents.indexOf(this);
                    if (typeof this.parent.view.set === 'function') {
                        this.parent.view.set(index, this.childComponent.view.updateView(model.nested));
                    }
                }
            } else {
                this.childComponent = null;
            }
            this.nested = model.nested;
            this.view.nested = model.nested;
            this.trigger('change');
            
            this.render();
        },

        selectItemOfType : function (type) {
            var child = this.getChildOfType(type);
            this._setChild(child);
            this.view.setValue(this.model.choiceModel.nodeName);
            this.render();
        },

        _filterOptionsBasedOnType : function (type) {
            var config = this.ctx.getConfig(this.nodeName);
            var children = config.children;
            var self = this;
            var opts = children.filter(function (child) {
                var childConfig = this.ctx.getConfig(child);
                var dataType = expeditor.Utils.getOrElse(childConfig, "extras.component.dataType", "ANY");
                var renderCondition = expeditor.Utils.getRenderCondition(this.renderCondition, child, childConfig);
                return renderCondition && expeditor.Utils.getCompatibleTypes(dataType, type) !== "";
            }, this).map(function (child) {
                var childConfig = this.ctx.getConfig(child),
                    choice = childConfig.choiceName || child;
                return {
                    value : child,
                    label : choice
                };
            }, this);
            this.view.setOptions(opts);
            if (opts && opts.length === 1) {
                this.selectItemOfType(opts[0].value);
            }
        },

        validateType : function () {
            if (this.checkType()) {
                this.view.removeError();
            } else {
                var errorTitle = Granite.I18n.get("Type mismatch in the rule.");
                this.view.markError(errorTitle);
            }
        },

        setTypes : function (type) {
            if (!expeditor.Utils.isTypeSame(type, this.currentType)) {
                this.currentType = type;
                this._filterOptionsBasedOnType(type);
                if (this.childComponent && typeof this.childComponent.setTypes === "function") {
                    this.childComponent.setTypes(type);
                }
                this.validateType();
            }
        },

        checkType : function () {
            return this.currentType !== "" && expeditor.Utils.isTypesCompatible(this.currentType, this.getCurrentType());
        },

        getCurrentType : function () {
            if (this.childComponent == null) {
                return this.currentType;
            }
            if (typeof this.childComponent.getCurrentType === "function") {
                return this.childComponent.getCurrentType();
            }
            return "NONE";
        },

        getTypes : function () {
            return this.returnType;
        },

        onChildChange : function (e, data) {
            if (data && data.action === "delete") {
                this._onChildDelete(e.target, data);
            } else {
                this.validateType();
                this.trigger('change');
            }
        },
        _setChild : function (child) {
            this._super.apply(this, arguments);
            if (child && typeof(child.syncMetaProps) === "function") {
                child.syncMetaProps(this.metaProps);
            }
        },
        
        onViewDefaultAction : function (e, data, trigger) {
            this._super.apply(this, [e, data, false]);
            this.syncMetaProps(this.metaProps);
            if (typeof this.childComponent.setTypes === "function") {
                this.childComponent.setTypes(this.currentType);
            }
            if (trigger !== false) {
                this.trigger("change");
            }
        },

        
        onViewDragOverAction : function (e, data) {
            if (data && data.type) {
                var child = this.getChildOfType(data.type);
                child.setTypes(this.getCurrentType());
                if (this.view.children.indexOf(child.view) == -1) {
                    this.view.addChild(child.view);
                }
            }
        },

        render : function () {
            if (this.childComponent &&
                this.childComponent.nodeName === this.extension &&
                this.parent.nodeName === this.extension) {
                return this.childComponent.render();
            } else {
                return this._super.apply(this, arguments);
            }
        },

        _extendExpression : function (expressionName, nested, copyModel, operator, insertBefore) {
            var modelJson = this.getModel().toJson();
            this.childComponent = this.getChildOfType(expressionName, true);
            modelJson.nodeName = this.childComponent.childComponents[0].nodeName;
            var model = expeditor.Utils.ModelFactory.fromJson(modelJson, this.ctx);
            var childModel = this.childComponent.getModel();
            var index = (insertBefore === true) ? 2 : 0;
            childModel.set(index, model);
            if (copyModel) {
                childModel.set((2 - index), copyModel);
            }
            if (!operator) {
                if (this.parent && this.parent.childComponents[1]) {
                    operator = this.parent.childComponents[1].childComponent;
                    if (operator) {
                        operator = operator.nodeName;
                    }
                }
            }
            var operatorComponent = this.childComponent.childComponents[1];
            if (operator && operatorComponent) {
                var child = operatorComponent.getChildOfType(operator);
                if (child) {
                    childModel.items[1].setChoiceModel(child.getModel());
                }
            }
            this.model.setChoiceModel(childModel);
            this.model.nested = nested;
            this.setModel(this.getModel());
            var parent = this.parent,
                gp = parent.parent;
            while (gp && gp instanceof ExpressionComponent) {
                parent = gp.parent;
                gp = parent.parent;
            }
            parent.render();
        },

        _findExpressionToExtend : function () {
            var parent = this,
                child = parent.childComponent;
            while ((parent === this || !parent.nested) && child && child.nodeName === this.extension) {
                parent = child.childComponents[2];
                child = parent.childComponent;
            }
            return parent;
        },

        _getOperator : function () {
            if (this.childComponent.nodeName === this.extension) {
                return this.childComponent.childComponents[1].getModel().copy();
            }
        },

        onViewExtendAction : function (e, data) {
            if (!this.childComponent) {
                this.selectFirstItem();
            } else if (this.extension) {
                var expressionToExtend = this;
                var nested = !!(data && data.nested);
                if (!nested && (!data || !data.wrapAround)) {
                    expressionToExtend = this._findExpressionToExtend();
                }
                expressionToExtend._extendExpression(this.extension, nested, data.copyModel, data.operator, data.insertBefore);
                if (typeof this.view._toggleDeleteOption === 'function') {
                    this.view._toggleDeleteOption(this.childComponent.nodeName != this.extension);
                }
            }
            this.trigger('change');
        },
        _onChildDelete : function (child, data) {
            var replaceChild = expeditor.Utils.getOrElse(data, "replaceChild", null);
            if (replaceChild) {
                
                var currentChildIndex = this.childComponents.indexOf(this.childComponent),
                    nodeName = replaceChild.childComponent.nodeName,
                    index = this.children.indexOf(nodeName),
                    canReplaceChild = index >= 0;
                var childToReplace = replaceChild._detachChild();
                this._detachChild();
                this.childComponents.splice(currentChildIndex);
                if (canReplaceChild) {
                    this._attachChild(childToReplace);
                    this.model.nested = replaceChild.nested;
                    this.setModel(this.getModel());
                } else {
                    this._setChild(null);
                }
                this.parent.render();
            } else {
                
                var index = this.children.indexOf(this.childComponent.nodeName);
                if (index >= 0) {
                    this.childComponents[index] = null;
                }
            }
            this.trigger("change");
        },

        onViewDeleteAction : function (e, data) {
            this.destroy(true);
            this.trigger('change');
        },

        onViewDeleteEntireAction : function (e, data) {
            if (this.selectedItem) {
                this.childComponents[0] = null;
                this.childComponent = this.getChild(0);
                this.model.setChoiceModel(this.childComponent.getModel());
                this.view.setValue(this.childComponent.nodeName);
            } else {
                var nodeName = this.childComponent.nodeName,
                    index = this.children.indexOf(nodeName);
                if (index > -1) {
                    this.childComponents[index] = null;
                }
                this.childComponent = null;
                this.model.setChoiceModel(null);
                this.view.setValue(null);
            }
            this.render();
            this.trigger('change');
        }
    });
})(expeditor);
(function (expeditor) {
    var SequenceComponent = expeditor.component.SequenceComponent = expeditor.component.ContainerComponent.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.childComponents = [];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.getChild(i);
                this.model.set(i, child.getModel());
            }
            var readOnly = expeditor.Utils.getOrElse(config, "readOnly", [-1]);
            if (!(readOnly instanceof Array)) {
                readOnly = [readOnly];
            }
            this.readOnly = readOnly.slice();
        },

        render : function () {
            var i = 0;
            var readOnly = this.readOnly.slice();
            var next = readOnly.shift();
            for (; i < this.childComponents.length; i++) {
                if (next === i && this.childComponents[i].renderReadOnly) {
                    this.view.set(i, this.childComponents[i].renderReadOnly());
                } else {
                    this.view.set(i, this.childComponents[i].render());
                }
            }
            return this.view.render();
        },

        getModel : function () {
            return this.model;
        },

        _isChildReadOnly : function (index) {
            return this.readOnly.indexOf(index) > -1;
        },

        setModel : function (model) {
            this.model = model;
            var i = 0;
            
            if (this.model.items) {
                for (; i < this.model.items.length; i++) {
                    if (!this._isChildReadOnly(i) || !this.childComponents[i].isValid()) {
                        this.childComponents[i].setModel(this.model.items[i]);
                    } else {
                        this.model.set(i, this.childComponents[i].getModel());
                    }
                }
                
                for (i = 0; i < this.model.items.length; i++) {
                    this.view.set(i, this.childComponents[i].render());
                }
            }
            this.trigger('change');
        }
    });
})(expeditor);
(function (expeditor) {
    var RootComponent = expeditor.component.RootComponent = expeditor.component.SequenceComponent.extend({

        validate : function () {
            this.model.setIsValid(this.isValid());
        }

    });
}(expeditor));
(function (expeditor) {
    
    var BinaryExpressionComponent = expeditor.component.BinaryExpressionComponent = expeditor.component.SequenceComponent.extend({
        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.returnType = expeditor.Utils.getOrElse(config, "dataType", "ANY");
            this.enableMetaPropSync = expeditor.Utils.getOrElse(config, "enableMetaPropSync", false);
            this.currentType = this.returnType;
            var defaultOperandTypes = [this.childComponents[0].returnType, this.childComponents[2].returnType];
            var configOperandTypes = expeditor.Utils.getOrElse(config, "operandTypes", null);
            this.isOperandTypesConfigured = configOperandTypes != null;
            this.operandTypes = configOperandTypes || defaultOperandTypes;
            var operand = this.getChild(0);
            operand.returnType = this.operandTypes[0];
            if (operand._filterOptionsBasedOnType) {
                operand._filterOptionsBasedOnType(operand.returnType);
            }
            operand = this.getChild(2);
            operand.returnType = this.operandTypes[1];
            if (operand._filterOptionsBasedOnType) {
                operand._filterOptionsBasedOnType(operand.returnType);
            }
            
            if (this.childComponents[0].selectFirstItem) {
                this.childComponents[0].selectFirstItem();
            }
            if (this.childComponents[2].selectFirstItem) {
                this.childComponents[2].selectFirstItem();
            }
            this._filterOperator([this.returnType].concat(this.operandTypes));
            this._setOperandTypes(this.returnType);
        },

        _syncOperandProps : function () {
            if (this.enableMetaPropSync) {
                expeditor.Utils.syncMetaProps(this);
            }
        },

        _filterOperator : function (types) {
            var operatorComponent = this.childComponents[1];
            operatorComponent.filter(types);
        },

        resetOperator : function () {
            var type = this.parent.currentType || this.returnType;
            this._filterOperator([type].concat(this.operandTypes));
            if (this.isOperandTypesConfigured) {
                var leftOperand = this.childComponents[0],
                    rightOperand = this.childComponents[2];
                leftOperand.setTypes(this.operandTypes[0]);
                rightOperand.setTypes(this.operandTypes[1]);
            } else {
                this._setOperandTypes(type);
            }
        },

        
        setTypes : function (expressionType) {
            if (!expeditor.Utils.isTypeSame(this.currentType, expressionType)) {
                this.currentType = expressionType;
                this._filterOperator([expressionType].concat(this.operandTypes));
                this._setOperandTypes(expressionType);
            }
        },

        checkType : function () {
            return this.currentType != "" && expeditor.Utils.isTypesCompatible(this.currentType, this.getCurrentType());
        },

        _setOperandTypes : function (returnType) {
            var operatorComponent = this.childComponents[1],
                leftOperand = this.childComponents[0],
                rightOperand = this.childComponents[2];
            var operatorTypes = operatorComponent.getSelectedOperatorTypes();
            if (operatorTypes == null || !operatorComponent.checkType()) {
                operatorTypes = operatorComponent.getAllOperatorTypes();
            }
            var operandTypes = this._getOperandTypes(operatorTypes,
                [returnType].concat([leftOperand.getCurrentType(), rightOperand.getCurrentType()]));
            
            if (operandTypes[0] === '' || operandTypes[1] === '') {
                operandTypes = this._getOperandTypes(operatorTypes,
                    [returnType].concat([leftOperand.getTypes(), rightOperand.getTypes()]));
            }
            leftOperand.setTypes(operandTypes[0]);
            rightOperand.setTypes(operandTypes[1]);
        },

        getTypes : function () {
            return this.returnType;
        },
        destroy : function (trigger) {
            this.childComponents.forEach(function (child) {
                if (child) {
                    child.unbind();
                    child.destroy(false);
                }
            });
            this._super.apply(this, arguments);
        },

        _onChildDelete : function (child, data) {
            var deletedChildIndex = child.index,
                otherChild = this.childComponents[2 - deletedChildIndex];
            if (expeditor.Utils.getOrElse(this, "parent.nested" , false)) {
                otherChild.nested = true;
            }
            otherChild.unbind("change");
            otherChild.parent = null;
            data.replaceChild = otherChild;
            this.trigger("change", data);
        },
        onChildChange : function (e, data) {
            this._syncOperandProps();
            if (data.action === "delete") {
                this._onChildDelete(e.target, data);
            } else {
                var nodeChanged = e.target,
                    nodeName = nodeChanged.nodeName,
                    operatorComponent = this.childComponents[1],
                    operatorTypes = operatorComponent.getSelectedOperatorTypes(),
                    returnType;
                if (operatorTypes == null || !operatorComponent.checkType()) {
                    operatorTypes = operatorComponent.getAllOperatorTypes();
                }
                if (operatorComponent && nodeName === operatorComponent.nodeName) {
                    var operatorReturnType = operatorTypes.map(function (type) {
                        return type[0];
                    }).join("|");
                    returnType = expeditor.Utils.getCompatibleTypes(operatorReturnType, this.currentType);
                    this._setOperandTypes(returnType);
                    this.childComponents[2].hide(operatorComponent.isUnaryOperatorSelected());
                } else if (operatorComponent) {
                    
                    
                    var currentOperandNumber = nodeChanged.index,
                        otherOperandNumber = 2 - currentOperandNumber,
                        otherOperand = this.childComponents[otherOperandNumber],
                        currentOperatorType = nodeChanged.getCurrentType(),
                        i = 0,
                        filterType = [this.currentType, "ANY", "ANY"];
                    filterType[currentOperandNumber === 0 ? 1 : 2] = currentOperatorType;
                    filterType[currentOperandNumber === 0 ? 2 : 1] = this.operandTypes[currentOperandNumber == 0 ? 0 : 1] || 'ANY';

                    operatorTypes = operatorComponent.getSelectedOperatorTypes();
                    if (operatorTypes == null || !operatorComponent.checkType()) {
                        operatorTypes = operatorComponent.getAllOperatorTypes();
                    }
                    var operandTypes = this._getOperandTypes(operatorTypes, filterType);
                    if (typeof(otherOperand.setTypes) == "function") {
                        otherOperand.setTypes(operandTypes[otherOperandNumber == 0 ? 0 : 1]);
                    }

                    var finalExpTypeSignature = [this.currentType,
                                                 this.childComponents[0].getCurrentType() || 'ANY',
                                                 operatorComponent.isUnaryOperatorSelected() ? 'ANY' : (this.childComponents[2].getCurrentType() || 'ANY')];
                    operatorComponent.filter(finalExpTypeSignature);
                }
                this.trigger("change");
            }
        },

        getCurrentType : function () {
            var leftType = this.childComponents[0].getCurrentType();
            var rightType = this.childComponents[2].getCurrentType();
            var operatorTypes = this.childComponents[1].getSelectedOperatorTypes();
            if (leftType && leftType.childComponent == null &&
                rightType && rightType.childComponent == null &&
                operatorTypes == null) {
                return this.currentType;
            }
            if (operatorTypes == null) {
                operatorTypes = this.childComponents[1].getAllOperatorTypes();
            }

            var i = 0;
            var returnType = "";
            var returnTypeMap = {};
            for (; i < operatorTypes.length; i++) {
                var opSignature = operatorTypes[i];
                if (expeditor.Utils.isTypesCompatible(leftType, opSignature[1]) &&
                    expeditor.Utils.isTypesCompatible(rightType, opSignature[2] || 'ANY')) {
                    if (opSignature[0] == "ANY") {
                        returnType = "ANY ";
                    }
                    if (returnType != "ANY ") {
                        opSignature[0].split("|").filter(function (type) {
                            return returnTypeMap[type] === undefined;
                        }).forEach(function (type) {
                            returnType += type + "|";
                            returnTypeMap[type] = true;
                        });
                    }
                }
            }
            return expeditor.Utils.chomp(returnType);
        },

        
        _getOperandTypes : function (operatorTypes, requiredTypes) {
            var iter = 0,
                leftTypes = "",
                rightTypes = "",
                rightTypesMap = {},
                leftTypesMap = {};

            requiredTypes = [requiredTypes[0],
                             expeditor.Utils.getCompatibleTypes(requiredTypes[1], this.operandTypes[0]),
                             expeditor.Utils.getCompatibleTypes(requiredTypes[2], this.operandTypes[1])];
            for (; iter < operatorTypes.length && leftTypes !== "ANY" && rightTypes !== "ANY"; iter++) {
                var opSignature = operatorTypes[iter],
                    leftType = opSignature[1],
                    rightType = opSignature[2]  || 'ANY',
                    leftCompatibleTypes = expeditor.Utils.getCompatibleTypes(requiredTypes[1], leftType),
                    rightCompatibleTypes = expeditor.Utils.getCompatibleTypes(requiredTypes[2], rightType),
                    returnCompatibleTypes = expeditor.Utils.getCompatibleTypes(requiredTypes[0], opSignature[0]);
                if (leftCompatibleTypes.length > 0 &&
                    rightCompatibleTypes.length > 0 &&
                    returnCompatibleTypes.length > 0) {
                    if (leftCompatibleTypes == "ANY") {
                        leftTypes = "ANY ";
                    } else if (leftTypes != "ANY ") {
                        leftCompatibleTypes.split("|").filter(function (type) {
                            return leftTypesMap[type] === undefined;
                        }).forEach(function (type) {
                            leftTypes += type + "|";
                            leftTypesMap[type] = true;
                        });
                    }
                    if (rightCompatibleTypes == "ANY") {
                        rightTypes = "ANY ";
                    } else if (rightTypes != "ANY ") {
                        rightCompatibleTypes.split("|").filter(function (type) {
                            return rightTypesMap[type] === undefined;
                        }).forEach(function (type) {
                            rightTypes += type + "|";
                            rightTypesMap[type] = true;
                        });
                    }
                }
            }
            return [expeditor.Utils.chomp(leftTypes), expeditor.Utils.chomp(rightTypes)];
        },

        onViewEnvelopeAction : function (e, data) {
            var copyModel = this.getModel().copy(),
                choiceModel = this.ctx.createModel(this.children[0]);
            var acceptedChildren = this.childComponents[0].children;
            if (acceptedChildren.indexOf(copyModel.nodeName) > -1) {
                choiceModel.setChoiceModel(copyModel);
                this.model.set(0, choiceModel);
                this.childComponents[0].setModel(choiceModel);
                var model = this.childComponents[1].getModel();
                model.setChoiceModel(null);
                this.childComponents[1].setModel(model);
                model = this.childComponents[2].getModel();
                this.model.set(2, this.ctx.createModel(this.children[2]));
                this.childComponents[2].setModel(this.model.get(2));
                this.childComponents[2].selectFirstItem(null);
            }
        },

        
        onViewDeleteContainerAction : function () {
            var childModel = this.childComponents[0].getModel();
            if (childModel.choiceModel == null || childModel.choiceModel.value === null) {
                childModel = this.childComponents[2].getModel();
            }
            var parentModel = this.parent.getModel();
            parentModel.setChoiceModel(childModel.getChoiceModel());
            this.parent.setModel(parentModel);
        },

        
        onViewDeleteAction : function () {
            this.trigger("change", {action : "delete"});
        },

        onViewExtendAction : function () {
            if (this.parent && this.parent.extension && typeof this.parent._extendExpression === 'function') {
                this.parent._extendExpression(this.parent.extension);
            }
        },

        onViewDragStartAction : function (e, data) {
            expeditor.data = expeditor.data || {};
            if (data && data.index != null) {
                expeditor.data.dragCondition = this.childComponents[data.index];
            }
        },

        onViewDragOperatorStartAction : function () {
            expeditor.data = expeditor.data || {};
            expeditor.data.dragOperator = this.childComponents[1];
        },

        onViewDragEndAction : function (e, data) {
            if (expeditor.data) {
                expeditor.data.dragCondition = null;
                expeditor.data.dragOperator = null;
            }
        },
        isValid : function () {
            var operatorComponent = this.childComponents[1];
            if (operatorComponent && operatorComponent.isUnaryOperatorSelected()) {
                return this.childComponents[0].isValid();
            }
            return this._super.apply(this, arguments);
        }
    });

})(expeditor);
(function (expeditor) {
    var SetValueComponent = expeditor.component.SetValueComponent = expeditor.component.SequenceComponent.extend({
        init : function () {
            this._super.apply(this, arguments);
            expeditor.Utils.syncMetaProps(this);
        },
        onChildChange : function (e, data) {
            if (e.target === this.childComponents[0]) {
                this.childComponents[2].setTypes(this.childComponents[0].getCurrentType());
            }
            expeditor.Utils.syncMetaProps(this);
        }
    });
})(expeditor);
(function (expeditor) {

    var MemberExpressionComponent = expeditor.component.MemberExpressionComponent = expeditor.component.SequenceComponent.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.dataType = expeditor.Utils.getOrElse(extraConfig, "dataType", 'ANY');
            this.returnType = this.dataType;
            this.currentType = this.returnType;
            var filter = expeditor.Utils.getOrElse(extraConfig, "propertyFilter.attrs", null);
            this._getPropertyComponent().setTypes(this.currentType);
            if (filter) {
                this._getPropertyComponent().setFilter(filter);
            }
        },

        getMetaProps : function () {
            return {
                type : this.getCurrentType()
            };
        },

        syncMetaProps : function (s) {
            
        },

        getCurrentType : function () {
            return this.currentType;
        },

        setTypes : function (types) {
            this.returnType = types;
            this._getPropertyComponent().setTypes(this.returnType);
            this._getObjectComponent().setTypes(this._getPropertyComponent().getObjectType());
        },

        _getObjectComponent : function () {
            return this.childComponents[2];
        },

        _getPropertyComponent : function () {
            return this.childComponents[0];
        },

        _handleObjectChange : function () {
            var objectComponent = this._getObjectComponent();
            var propertyComponent = this._getPropertyComponent();
            var currentType = objectComponent.getCurrentType();
            propertyComponent.setObjectType(currentType);
        },

        _handlePropertyChange : function () {
            var objectComponent = this._getObjectComponent();
            var propertyComponent = this._getPropertyComponent();
            var selectedProperty = propertyComponent.getSelectedProperty();
            if (selectedProperty && selectedProperty.length > 0) {
                this.currentType = propertyComponent.getCurrentType();
                var objectTypes = this._getTypesHavingProperty(selectedProperty, this.currentType);
                objectComponent.setTypes(objectTypes);
                this.currentType = propertyComponent.getCurrentType();
                this.trigger('change');
            } else {
                objectComponent.setTypes(propertyComponent.getObjectType());
            }
        },

        onChildChange : function (e) {
            var objectComponent = this._getObjectComponent();
            var propertyComponent = this._getPropertyComponent();
            var changedComponent = e.target;
            if (changedComponent === objectComponent) {
                this._handleObjectChange();
            } else if (changedComponent === propertyComponent) {
                this._handlePropertyChange();
            }
        },

        _getTypesHavingProperty : function (propertyName, type) {
            var qualifiedType = {};
            var scope = this.ctx.getScope();
            var allTypes = scope.getAllTypes();
            for (var typeId in allTypes) {
                var vars = allTypes[typeId].vars;
                var propertyType = vars[propertyName] ? vars[propertyName].type : null;
                if (expeditor.Utils.isTypesCompatible(propertyType, type) && this._getPropertyComponent()._matchesFilter(vars[propertyName])) {
                    qualifiedType[typeId] = true;
                }
            }
            return Object.keys(qualifiedType).join("|");
        },

        onViewDeleteAction : function () {
            this.trigger("change", {action : "delete"});
        }
    });

})(expeditor);
(function (expeditor) {
    var TerminalComponent = expeditor.component.TerminalComponent = expeditor.component.BaseComponent.extend({

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.returnType = expeditor.Utils.getOrElse(config, "dataType", "NONE");
            this.validate = expeditor.Utils.getOrElse(config, "validate", true);
            this._isValidType = true;
        },
        syncMetaProps : function (s) {
            if (typeof(this.view.showDatePicker) === "function") {
                var type = expeditor.Utils.getOrElse(s, "type", "");
                var isDateInput = type.split("|").indexOf('DATE FIELD') > -1;
                this.view.showDatePicker(isDateInput);
            }
            if (typeof(this.view.setSuggestions) === "function") {
                var options = expeditor.Utils.getOrElse(s, "options", null);
                this.view.setSuggestions(options);
            }
        },
        onViewDefaultAction : function (e, data) {
            this.model.setValue(this.view.getValue());
            this.trigger('change');
        },

        getModel : function () {
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
            this.view.setValue(this.model.getValue());
        },

        getTypes : function () {
            return this.returnType;
        },

        getCurrentType : function () {
            return this.getTypes();
        },

        setTypes : function (type) {
            this._isValidType = (type == this.getCurrentType());
        },

        checkType : function () {
            return this._isValidType;
        },

        isValid : function () {
            
            if (!this.validate || !this.ctx.config[this.nodeName]) {
                return true;
            }
            return !!(this.model && this.model.getValue() != null);
        }

    });
})(expeditor);
(function (expeditor) {
    var functionNameConfig = {
            rule : "VARIABLE",
            extras : {
                component : {
                    dataType : 'ANY',
                    listingType : 'func'
                },
                view : {
                    placeholder : Granite.I18n.get("Drop function or select here")
                }
            }
        },
        parameterConfig = {
            extras : {
                component : {
                    dataType : 'ANY'
                },
                view : {
                    inline : true,
                    composite : ['COMPONENT','STRING_LITERAL','NUMERIC_LITERAL', 'FUNCTION_CALL', 'DATE_LITERAL']
                }
            }
        };
    var FunctionComponent = expeditor.component.TerminalComponent.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.functionName = this.ctx.createComponent("FUNCTION_NAME", functionNameConfig);
            this.functionName.bind("change", $.proxy(this.functionChanged, this));
            this.parameters = [];
            this.view.setFunctionNameView(this.functionName.view);
        },

        parameterChanged : function (onParameterChange, e) {
            if (typeof onParameterChange === "string") {
                onParameterChange = expeditor.Utils.getOrElse(window, onParameterChange, null);
            }
            if (typeof onParameterChange === "function") {
                onParameterChange.apply(this, [this.parameters, e.target.index]);
            }
        },

        functionChanged : function (e) {
            var node = e.target;
            var model = node.getModel();
            if (model != null) {
                var func = model.getValue(),
                    parameters = [],
                    renderedParams = [];
                var currentValue = expeditor.Utils.getOrElse(this, "model.functionName.id", null);
                var newValue = expeditor.Utils.getOrElse(func, "id", null);
                if (currentValue === newValue) {
                    return;
                }
                this.model.setFunctionName(func);
                if (func !== null) {
                    func.args.forEach(function (arg, index) {
                        var argType = arg.type;
                        argType = argType.replace(/\+$/, "");
                        var paramConfig = $.extend({}, parameterConfig);
                        paramConfig.extras.component.dataType = argType;
                        var parameter = this.ctx.createComponent("EXPRESSION", paramConfig);
                        parameter.index = index;
                        parameter.bind("change", $.proxy(this.parameterChanged, this, arg.parameterChangeListener));
                        parameters.push(parameter);
                        this.model.setParameter(index, parameter.getModel());
                    }, this);
                    this.parameters = parameters;
                    renderedParams = parameters.map(function (param, idx) {
                        return {
                            description : func.args[idx].description,
                            renderedDom : param.render()
                        };
                    });
                }
                this.parameters = parameters;
                this.view.setParameters(renderedParams);
            }
        },

        getModel : function () {
            this.parameters.forEach(function (param, index) {
                this.model.setParameter(index, param.getModel());
            }, this);
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
            var functionName = this.model.getFunctionName(),
                functionModel = this.ctx.createModel("FUNCTION_NAME", functionNameConfig);
            functionModel.setValue(functionName);
            this.functionName.setModel(functionModel);
            var func = this.ctx.getScope().findFunctionById(functionName.id);
            if (func && func.element) {
                functionName = func.element;
            }
            var paramModels = this.model.getParameters(),
                renderedParams = [];
            if (paramModels) {
                paramModels.forEach(function (paramModel, index) {
                    var paramConfig = $.extend({}, parameterConfig);
                    paramConfig.extras.component.dataType = functionName.args[index].type.replace(/\+$/, "");
                    var parameter = this.ctx.createComponent("EXPRESSION", paramConfig);
                    parameter.index = index;
                    parameter.bind("change", $.proxy(this.parameterChanged, this, functionName.args[index].parameterChangeListener));
                    parameter.setModel(paramModel);
                    this.parameters[index] = parameter;
                    renderedParams[index] = {
                        description : functionName.args[index].description,
                        renderedDom : parameter.render()
                    };
                }, this);
                this.view.setParameters(renderedParams);
            }
        },

        setTypes : function (types) {
            this.functionName.setTypes(types);
        },

        render : function () {
            return this.view.render();
        },

        getCurrentType : function () {
            return this.functionName.getCurrentType();
        },

        checkType : function () {
            return this.currentType != "" && expeditor.Utils.isTypesCompatible(this.currentType, this.getCurrentType());
        },

        isValid : function () {
            var valid = !!this.model.getFunctionName();
            valid = valid && this.parameters.every(function (param) {
                return param.isValid();
            });
            return valid;
        }
    });

    expeditor.component.FunctionComponent = FunctionComponent;
})(expeditor);
(function (expeditor) {
    var VariableComponent = expeditor.component.VariableComponent = expeditor.component.TerminalComponent.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.returnType = expeditor.Utils.getOrElse(extraConfig, "dataType", "ANY");
            this.currentType = this.returnType;
            this.listingType = extraConfig.listingType || "var";
            this._filterListingBasedOnType(this.returnType);
        },
        getMetaProps : function () {
            var value = this.model.getValue();
            if (value && value.id) {
                var scope = this.ctx.getScope();
                var variable = scope.findVarById(value.id);
                var options = expeditor.Utils.getOrElse(variable, "element.props.options", null);
                var type = expeditor.Utils.getOrElse(variable, "element.type", "");
                return {
                    type : type,
                    options : options
                };
            }
        },
        _filterListingBasedOnType : function (varTypes) {
            if (this.ctx.getScope()) {
                var availableVars = this.ctx.getScope().findByType(varTypes, this.listingType);
                if (this.extraFilter) {
                    availableVars = availableVars.filter(this.extraFilter);
                }
                var varObj = {};
                if (availableVars && availableVars.length > 0) {
                    for (var i = 0; i < availableVars.length; i++) {
                        var variable = availableVars[i];
                        varObj[variable.getId()] = {
                            displayName : variable.getDisplayName(),
                            type : variable.getType(),
                            displayPath : variable.getDisplayPath(),
                            isDuplicate : variable.isDuplicate()
                        };
                    }
                }
                this.view.setVariables(varObj);
            }
        },

        
        setFilter : function (filter) {
            if (this.extraFilter != filter) {
                this.extraFilter = filter;
                this._filterListingBasedOnType(this.currentType);
            }
        },

        setTypes : function (varTypes) {
            if (expeditor.Utils.isTypeSame(varTypes, this.currentType)) {
                return;
            }
            var compatibleTypes = expeditor.Utils.getCompatibleTypes(varTypes, this.returnType),
                modelVal = this.model.getValue();
            this.currentType = compatibleTypes;
            this._filterListingBasedOnType(compatibleTypes);
            if (modelVal) {
                var modelValDef = this.ctx.getScope().findById(modelVal.id, this.listingType);
                if (modelValDef == null) {
                    
                } else {
                    if (modelVal.id !== modelValDef.foundId) {
                        modelVal.id = modelValDef.foundId;
                    }
                    modelValDef = modelValDef.element;
                    var modelValDefType = modelValDef.type,
                        type = expeditor.Utils.getCompatibleTypes(modelValDefType, this.currentType);
                    if (type.length > 0) {
                        modelVal.type = type;
                    }
                }
            }
        },

        checkType : function () {
            return this.currentType != "" && expeditor.Utils.isTypesCompatible(this.currentType, this.getCurrentType());
        },

        getTypes : function () {
            return this.returnType;
        },

        getCurrentType : function () {
            var model = this.model.getValue();
            return expeditor.Utils.getOrElse(model, "type", this.currentType);
        },

        onViewDefaultAction : function (e, data) {
            var varId = this.view.getValue();
            if (typeof varId === "string" && varId.length > 0) {
                
                var variable = this.ctx.getScope().findById(varId, this.listingType).element;
                var varType = variable.getType();
                var compatibleType = expeditor.Utils.getCompatibleTypes(this.currentType, varType);
                var jsonRep = variable.toJson();
                jsonRep.type = compatibleType;
                this.model.setValue(jsonRep);
            } else {
                this.model.setValue(null);
            }
            this.trigger("change");
        },

        getModel : function () {
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
            var val = model.getValue();
            var valId = val;
            if (val && typeof val === 'object') {
                valId = val.id;
                var variable = this.ctx.getScope().findById(valId, this.listingType);
                if (variable === null) {
                    valId = "__Undefined__:" + (val.displayName || val.name);
                } else if (variable.foundId !== valId) {
                    model.getValue().id = variable.foundId;
                    valId = variable.foundId;
                }
            }
            this.view.setValue(valId);
        },

        renderReadOnly : function () {
            var value = this.model.getValue();
            if (value && value.type) {
                this.setTypes(value.type);
            }
            return this.view.renderReadOnly();
        }
    });
})(expeditor);
(function (expeditor) {
    
    var PropertyListComponent = expeditor.component.PropertyListComponent = expeditor.component.TerminalComponent.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.dataType = expeditor.Utils.getOrElse(extraConfig, "dataType", "ANY");
            this.returnType = this.returnType || this.dataType;
            this.currentType = this.currentType || this.returnType;
            this.objectType = this.objectType || "ANY";
            this.updateProperties();
        },

        getCurrentType : function () {
            return this.currentType;
        },

        setFilter : function (filter) {
            this.filter = filter;
            this.updateProperties();
        },

        setTypes : function (types) {
            this.returnType = types;
            this.updateProperties();
            this.trigger('change');
        },

        _matchesFilter : function (type) {
            if (typeof this.filter === "undefined") {
                return true;
            }
            var filterPropName, propValue, flag = true;
            for (filterPropName in this.filter) {
                if (this.filter.hasOwnProperty(filterPropName)) {
                    propValue = this.filter[filterPropName];
                    flag = flag && type && type[filterPropName] === propValue;
                }
                if (flag === false) {
                    break;
                }
            }
            return flag;
        },

        
        _forEachProperty : function (callback) {
            var scope = this.ctx.getScope();
            var types = scope.getAllTypes();
            var objectType = this.getObjectType();
            var returnType = this.returnType,
                self = this;
            $.each(types, function (typeId, type) {
                if (expeditor.Utils.isTypesCompatible(typeId, objectType)) {
                    var vars = type.vars;
                    $.each(vars, function (varId, varObj) {
                        if (expeditor.Utils.isTypesCompatible(varObj.type, returnType) &&
                            self._matchesFilter(varObj)) {
                            callback(typeId, varId, varObj);
                        }
                    });
                }
            });
        },

        _buildPropertiesToShow : function () {
            var properties = {};
            var self = this;
            var selectedTypes = {};
            this._forEachProperty(function (typeId, varId, varObj) {
                if (properties[varId]) {
                    var newType = varObj.type;
                    var oldType = properties[varId].type;
                    if (oldType.split(",").indexOf(newType) < 0) {
                        oldType += "," + newType;
                    }
                    properties[varId].type = oldType;
                } else {
                    properties[varId] = {
                        name : varId,
                        type : varObj.type,
                        displayName : varId
                    };
                }
                selectedTypes[typeId] = true;
            });
            this.objectType = Object.keys(selectedTypes).join("|");
            return properties;
        },

        updateProperties : function () {
            var propertiesToShow = this._buildPropertiesToShow();
            this.view.setVariables(propertiesToShow);
        },

        _getDefaultCurrentType : function () {
            return this.returnType || this.dataType;
        },

        _getPropertyType : function (val) {
            var propertyTypesMap = {};
            this._forEachProperty(function (typeId, varId, varObj) {
                if (varId == val) {
                    propertyTypesMap[varObj.type] = true;
                }
            });

            return Object.keys(propertyTypesMap).join("|");
        },

        getSelectedProperty : function () {
            return this.view.getValue();
        },

        getObjectType : function () {
            return this.objectType;
        },

        
        setObjectType : function (objectType) {
            if (objectType.indexOf('ANY') > -1 || !objectType || objectType.length < 1) {
                objectType = 'ANY';
            }
            this.objectType = objectType;
            this.updateProperties();
        },

        onViewDefaultAction : function () {
            this._super.apply(this, arguments);
            var val = this.view.getValue();
            if (!val || val.length == 0) {
                this.currentType = this._getDefaultCurrentType();
            } else {
                this.currentType = this._getPropertyType(val);
            }
            this.trigger('change');
        }
    });
})(expeditor);
(function ($, expeditor) {
    var WSDLComponent = expeditor.component.WSDLComponent = expeditor.component.TerminalComponent.extend({

        supportedDataTypes : "STRING|NUMBER|BOOLEAN|DATE",

        init : function (nodeName, ctx, config) {
            this._super.apply(this, arguments);
            this.childComponents = [];
            this.ctx = ctx;
            this.localModel = {};
        },

        
        _getParamList : function (paramArray, resultInputArray, prefix) {
            for (var index = 0; index < paramArray.length; index++) {
                var singleParam = paramArray[index];
                if (singleParam.name) {
                    
                    var finalParam = prefix + singleParam.name;
                    resultInputArray.push(finalParam);
                } else {
                    
                    for (var i in singleParam) {
                        if (singleParam.hasOwnProperty(i)) {
                            var newprefix = prefix + i + ".";
                            this._getParamList(paramArray[index][i], resultInputArray, newprefix);
                        }
                    }
                }
            }
        },

        
        _getInputParamList : function (operationName, inputArray, resultObj) {
            for (var index = 0; index < inputArray.length; index++) {
                var inputObj = inputArray[index];
                
                for (var i in inputObj) {
                    if (inputObj.hasOwnProperty(i)) {
                        
                        if (operationName != i) {
                            
                            resultObj.inputRoot = i;
                        }
                        if (resultObj.namespace == null) {
                            resultObj.namespace = inputObj[i].namespace;
                        }
                        if (resultObj.input == null) {
                            resultObj.input = [];
                        }
                        this._getParamList(inputObj[i].params, resultObj.input, "");
                    }
                }
            }
        },

        _getPropertiesList : function (paramArray, resultArray, resultObjArray, namePrefix, titlePrefix) {
            for (var index = 0; index < paramArray.length; index++) {
                var singleParam = paramArray[index];
                var paramName = namePrefix ? namePrefix + "." + singleParam.name : singleParam.name;
                var paramTitle = titlePrefix ? titlePrefix + "." + singleParam.title : singleParam.title;
                if (singleParam.childDataModel && singleParam.childDataModel.properties) {
                    this._getPropertiesList(singleParam.childDataModel.properties, resultArray, resultObjArray, paramName, paramTitle);
                } else if (singleParam.properties) {
                    this._getPropertiesList(singleParam.properties, resultArray, resultObjArray, paramName, paramTitle);
                } else {
                    resultArray.push(paramName);
                    var type = this.supportedDataTypes;
                    resultObjArray.push({
                        name : paramName,
                        "jcr:title" : paramTitle || paramName,
                        description : singleParam.description,
                        type : type
                    });
                }
            }
        },

        _getFDMParamList : function (schema, resultArray, resultObjArray) {
            if (schema) {
                if (schema.childDataModel && schema.childDataModel.properties) {
                    this._getPropertiesList(schema.childDataModel.properties, resultArray, resultObjArray);
                } else if (schema.properties) {
                    this._getPropertiesList(schema.properties, resultArray, resultObjArray);
                }
            }
        },

        
        _getOutputParamList : function (outputArray, resultObj) {
            for (var index = 0; index < outputArray.length; index++) {
                var outputObj = outputArray[index];
                for (var i in outputObj) {
                    if (resultObj.output == null) {
                        resultObj.output = [];
                    }
                    var prefix = i + ".";
                    this._getParamList(outputObj[i].params, resultObj.output, prefix);
                }
            }
        },

        
        _getWebServiceParamList : function (webServiceParam, resultObj, inputList, outputList) {
            if (webServiceParam.input == null) {
                webServiceParam.input = [];
                webServiceParam.inputModel = [];
            }
            if (webServiceParam.output == null) {
                webServiceParam.output = [];
                webServiceParam.outputModel = [];
            }
            inputList = inputList || expeditor.Utils.getOrElse(this.view.selectedWebService, "input", null);
            outputList = outputList || expeditor.Utils.getOrElse(this.view.selectedWebService, "output", null);

            if (inputList == null) {
                webServiceParam.input = resultObj.input;
            } else {
                _.each(inputList, function (input) {
                    var inputId = expeditor.Utils.getOrElse(input, "id", null) || expeditor.Utils.getOrElse(input, "path", null);
                    if (inputId !== null) {
                        webServiceParam.input.push(inputId);
                        webServiceParam.inputModel.push(input);
                    }
                });
            }

            if (outputList == null) {
                webServiceParam.output = resultObj.output;
            } else {
                _.each(outputList, function (output) {
                    var outputId = expeditor.Utils.getOrElse(output, "id", null);
                    if (outputId !== null) {
                        webServiceParam.output.push(outputId);
                        webServiceParam.outputModel.push(output);
                    }
                });
            }
        },

        
        _getDefaultValue : function (parameter, defaultValue) {
            if (defaultValue == null) {
                return ;
            }
            var defaultValueType = "STRING_LITERAL";
            if (typeof defaultValue == "number") {
                defaultValueType = "NUMERIC_LITERAL";
            }
            var jsonModel = {
                nodeName : 'PARAMETER',
                choice : {
                    nodeName : defaultValueType,
                    value : defaultValue
                }
            },
                choiceModel = expeditor.Utils.ModelFactory.fromJson(jsonModel, this.ctx);
            parameter.setModel(choiceModel);
        },
        
        _updateOutputView : function (webServiceParam, resultObj) {
            for (var outputIndex = 0; resultObj.output && outputIndex < resultObj.output.length; outputIndex++) {
                var webServiceIndex = webServiceParam.output.indexOf(resultObj.output[outputIndex]),
                    outputTitle = resultObj.output[outputIndex],
                    outputType,
                    outputDescription;
                if (webServiceIndex !== -1) {
                    if (!_.isUndefined(webServiceParam.outputModel)) {
                        outputTitle = expeditor.Utils.getOrElse(webServiceParam.outputModel[webServiceIndex], "jcr:title", outputTitle);
                        outputType = this.supportedDataTypes;
                        outputDescription = expeditor.Utils.getOrElse(webServiceParam.outputModel[webServiceIndex], "description", null);
                    }
                    var parameter = new expeditor.component.VariableComponent("COMPONENT", this.ctx, {dataType : outputType});
                    this.view.addNewOutputParam(outputTitle , parameter, outputDescription);
                    
                    this.localModel.outputModel[resultObj.output[outputIndex]] = {
                        title : outputTitle,
                        description : outputDescription,
                        type : outputType
                    };

                    (function (wsdlVariable, localModel, wsdlModel) {
                        parameter.bind('change', function (e) {
                            if (localModel.outputModel == null) {
                                localModel.outputModel = {};
                            }
                            localModel.outputModel[wsdlVariable] = _.extend(localModel.outputModel[wsdlVariable], e.target.model.toJson());
                            wsdlModel.setValue(localModel);
                        });
                    })(resultObj.output[outputIndex], this.localModel, this.model);
                }
            }
        },
        
        operationIndexSelected : function (opIndex, operation) {
            this.resetModels();
            this.view.clearInputParams();
            this.view.clearOutputParams();

            if (opIndex < 0) {
                this.view.hideInputParams();
                this.view.hideOutputParams();
                return;
            }
            var wsdlInfo,
                resultObj = {},
                webServiceParam = {},
                parameter,
                webServiceTitle = expeditor.Utils.getOrElse(this.view.selectedWebService, "jcr:title", null);

            
            if (operation) {
                var formDataModelId = expeditor.Utils.getOrElse(this.view.selectedWebService, "formDataModelId", null),
                    operationName = expeditor.Utils.getOrElse(this.view.selectedWebService, "operation", null);
                resultObj.input = [];
                resultObj.output = [];
                resultObj.name = operation.name;
                resultObj.title = webServiceTitle;
                webServiceParam.inputModel = [];
                webServiceParam.outputModel = [];
                resultObj.operationName = operation.name;
                this._getFDMParamList(operation.schema, resultObj.input, webServiceParam.inputModel);
                this._getFDMParamList(operation.targetSchema, resultObj.output, webServiceParam.outputModel);
                webServiceParam.input = resultObj.input;
                webServiceParam.output = resultObj.output;

                wsdlInfo = {
                    formDataModelId : formDataModelId,
                    operationTitle : resultObj.title,
                    operationName : operationName
                };

            } else {
                resultObj.name = this.wsdlOutputObj[opIndex].name;
                resultObj.soapActionURI = this.wsdlOutputObj[opIndex].soapActionURI;
                resultObj.port = this.wsdlOutputObj[opIndex].port;
                resultObj.serviceEndPoint = this.wsdlOutputObj[opIndex].serviceEndPoint;
                this._getInputParamList(resultObj.name, this.wsdlOutputObj[opIndex].input, resultObj);
                this._getOutputParamList(this.wsdlOutputObj[opIndex].output, resultObj);
                
                this._getWebServiceParamList(webServiceParam, resultObj);

                wsdlInfo = {
                    wsdlEndPoint : this.wsdlEndPoint,
                    webServiceTitle : webServiceTitle,
                    operationName : resultObj.name,
                    soapActionURI : resultObj.soapActionURI,
                    serviceEndPoint : resultObj.serviceEndPoint,
                    namespace : resultObj.namespace,
                    inputRoot : resultObj.inputRoot,
                    port : resultObj.port
                };
            }

            
            this.localModel.inputModel = {};

            for (var inputIndex = 0; resultObj.input && inputIndex < resultObj.input.length; inputIndex++) {
                var webServiceIndex = webServiceParam.input.indexOf(resultObj.input[inputIndex]),
                    inputTitle = resultObj.input[inputIndex],
                    inputDescription,
                    inputType,
                    hiddenInput = false,
                    defaultValue = null;
                if (webServiceIndex !== -1) {
                    if (!_.isUndefined(webServiceParam.inputModel)) {
                        inputTitle = expeditor.Utils.getOrElse(webServiceParam.inputModel[webServiceIndex], "jcr:title", inputTitle);
                        inputDescription = expeditor.Utils.getOrElse(webServiceParam.inputModel[webServiceIndex], "description", null);
                        inputType = this.supportedDataTypes;
                        hiddenInput = expeditor.Utils.getOrElse(webServiceParam.inputModel[webServiceIndex], "hide", false);
                        defaultValue = expeditor.Utils.getOrElse(webServiceParam.inputModel[webServiceIndex], "defaultValue", null);
                    }
                    parameter = this.ctx.createComponent("PARAMETER");
                    if (inputType) {
                        parameter.setTypes(inputType);
                    }
                    this.view.addNewInputParam(inputTitle, parameter, inputDescription);
                    
                    this.localModel.inputModel[resultObj.input[inputIndex]] = {
                        title : inputTitle,
                        description : inputDescription,
                        type : inputType
                    };
                    (function (wsdlVariable, localModel, wsdlModel) {
                        parameter.bind('change', function (e) {
                            if (localModel.inputModel == null) {
                                localModel.inputModel = {};
                            }
                            localModel.inputModel[wsdlVariable] = _.extend(localModel.inputModel[wsdlVariable], e.target.model.toJson());
                            wsdlModel.setValue(localModel);
                        });
                    })(resultObj.input[inputIndex], this.localModel, this.model);
                    
                    this._getDefaultValue(parameter, defaultValue);
                    
                    if (hiddenInput) {
                        $(this.view.inputList).find(".wsdl-param:last").hide();
                    }
                }
            }

            
            this.localModel.outputModel = {};
            this._updateOutputView(webServiceParam, resultObj);

            
            this.localModel.wsdlInfo = wsdlInfo;
            this.model.setValue(this.localModel);
        },

        
        onViewWSDLViewDrawnAction : function (e, data, trigger) {
            if (this.model && (this.model.getValue() != null)) {
                this.localModel = this.model.getValue();
            }

            if (this.model != null &&
                this.model.getValue() != null &&
                this.model.getValue().wsdlInfo != null &&
                this.model.getValue().inputModel != null &&
                this.model.getValue().outputModel != null) {
                
                var wsdlInfo = this.model.getValue().wsdlInfo;
                var endPoint = wsdlInfo.wsdlEndPoint;
                if (wsdlInfo.formDataModelId) {
                    endPoint = wsdlInfo.formDataModelId + ":" + wsdlInfo.operationName;
                }
                this.view.setWSDLEndPoint(endPoint);
                this.view.setOperation(wsdlInfo.operationName);

                
                var inputModel = this.model.getValue().inputModel;
                for (var key in inputModel) {
                    var parameter = this.ctx.createComponent("PARAMETER");
                    var title = key,
                        description,
                        type,
                        model = inputModel[key];
                    if (model) {
                        if (model.nodeName) {
                            var inputParamModel =  expeditor.Utils.ModelFactory.fromJson(model, this.ctx);
                            parameter.setModel(inputParamModel);
                        }
                        type = this.supportedDataTypes;
                        parameter.setTypes(type);
                        title = model.title;
                        description = model.description;
                    }
                    this.view.addNewInputParam(title, parameter, description);

                    (function (wsdlVariable, localModel, wsdlModel) {
                        parameter.bind('change', function (e) {
                            if (localModel.inputModel == null) {
                                localModel.inputModel = {};
                            }
                            localModel.inputModel[wsdlVariable] = _.extend(localModel.inputModel[wsdlVariable], e.target.model.toJson());
                            wsdlModel.setValue(localModel);
                        });
                    })(key, this.localModel, this.model);
                }
                this.view.wsdlinputSection.show();

                
                var outputModel = this.model.getValue().outputModel;

                this._renderOutputViewFromModel(outputModel);

                this.view.wsdlOutputSection.show();
                
                
                this.view.resetInlines();
            }
        },

        _renderOutputViewFromModel : function (outputModel) {
            for (var key in outputModel) {
                var parameter = new expeditor.component.VariableComponent("COMPONENT", this.ctx, {dataType : "STRING|NUMBER|BOOLEAN|DATE"});
                var title = key,
                    description,
                    model = outputModel[key];
                if (model) {
                    if (model.nodeName) {
                        var outputParamModel =  expeditor.Utils.ModelFactory.fromJson(model, this.ctx);
                        parameter.setModel(outputParamModel);
                    }
                    parameter.setTypes(model.type || "");
                    title = model.title;
                    description = model.description;
                }
                this.view.addNewOutputParam(title, parameter, description);

                (function (wsdlVariable, localModel, wsdlModel) {
                        parameter.bind('change', function (e) {
                            if (localModel.outputModel == null) {
                                localModel.outputModel = {};
                            }
                            localModel.outputModel[wsdlVariable] = e.target.model.toJson();
                            wsdlModel.setValue(localModel);
                        });
                    })(key, this.localModel, this.model);
            }
        },

        
        
        
        onViewOperationSelectedAction : function (e, data) {
            this.operationIndexSelected(data.indexClicked);
        },

        
        onWSDLReceived : function (data) {
            if (data == null || data == "") {
                this.onWSDLError();
                return;
            }
            var wsdlOutput = JSON.parse(data);
            this.wsdlOutputObj = wsdlOutput;
            var wsdlOperations = [],serviceIndex = -1;
            if (this.view.selectedWebService !== null) {
                var operationName = expeditor.Utils.getOrElse(this.view.selectedWebService, "operation", null);
            }
            for (var index = 0; index < wsdlOutput.length; index++) {
                wsdlOperations[index] = wsdlOutput[index].name;
                if (operationName != null && wsdlOperations[index] === operationName) {
                    serviceIndex = index;
                }
            }
            this.view.setOperations(wsdlOperations);
            
            if (this.view.selectedWebService !== null) {
                this.view.hideOperationList();
                this.view.operationList.value = serviceIndex + 1;
                this.view.onOperationSelection();
            }
        },

        onFDMOperationReceived : function (data) {
            if (!data) {
                this.onWSDLError();
                return;
            }
            this.view.resetInlines();
            this.view.stopWait();
            this.wsdlOutputObj = data;
            if (this.view.selectedWebService !== null) {
                this.view.wsdlFetched = true;
                this.view.hideOperationList();
                this.operationIndexSelected(null, data);
            }
        },

        
        onWSDLError : function (errorText) {
            var defaultErrorText = "There is a problem with web service request.";
            if (console) {
                if (_.isUndefined(errorText)) {
                    console.log(defaultErrorText);
                } else {
                    console.log(errorText);
                }
            }
            this.view.setWSDLError();
        },

        resetModels : function () {
            this.localModel.inputModel = null;
            this.localModel.outputModel = null;
            this.model.setValue(this.localModel);
        },

        
        
        onViewWSDLClickedAction : function (event, data) {
            var wsdlUrl = data.wsdlEndPoint;
            if (wsdlUrl && wsdlUrl.length > 0) {
                this.resetModels();
                this.wsdlEndPoint = wsdlUrl;
                if (this.view.selectedWebService !== null) {
                    var wsdlUrlMapped = expeditor.Utils.getOrElse(this.view.selectedWebService, "url", null);
                    if (this.view.selectedWebService.formDataModelId) {
                        FormDataModelServiceDelegate.getOperationById(this.view.selectedWebService.formDataModelId, this.view.selectedWebService.operation, this, this.onFDMOperationReceived, this.onWSDLError);
                    } else if (wsdlUrlMapped != null) {
                        expeditor.WSDL.getAllOperations(wsdlUrlMapped, $.proxy(this.onWSDLReceived, this), $.proxy(this.onWSDLError, this));
                    } else {
                        
                        this.onWSDLError("URL is missing from the configuration.");
                    }
                } else {
                    expeditor.WSDL.getAllOperations(wsdlUrl, $.proxy(this.onWSDLReceived, this), $.proxy(this.onWSDLError, this));
                }
            }
        },
        getModel : function () {
            return this.model;
        },

        setModel : function (model) {
            this.model = model;
        },

        isValid : function () {
            return !!this.model.getValue();
        }
    });

})(jQuery, expeditor);
