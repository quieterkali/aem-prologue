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
    var BaseModel = expeditor.model.BaseModel = expeditor.EventTarget.extend({

        init : function (nodeName, ctx) {
            this.nodeName = nodeName;
            this.ctx = ctx;
        },

        
        _visitStart : function (visitor) {
            var fn = visitor["enter" + this.nodeName];

            if (fn) {
                return fn.call(visitor, this);
            } else {
                return false;
            }
        },

        _visitEnd : function (visitor) {
            var fn = visitor["exit" + this.nodeName];

            if (fn) {
                return fn.call(visitor, this);
            } else {
                return false;
            }
        },

        setVersion : function (version) {
            this.version = version;
        },

        accept : function (visitor) {
            this._visitStart(visitor);
            this._visitEnd(visitor);
        },

        validate : function () {

        },

        copy : function () {
            return expeditor.Utils.ModelFactory.fromJson(this.toJson(), this.ctx);
        },

        destroy : function () {
            this.unbind();
        }

    });
})(expeditor);
(function (expeditor) {
    var SequenceModel = expeditor.model.SequenceModel = expeditor.model.BaseModel.extend({
        init : function (nodeName, ctx) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            this.items = [];
        },

        set : function (position, model) {
            this.items[position] = model;
        },

        get : function (position) {
            return this.items[position];
        },

        fromJson : function (jsonObj) {
            this.nodeName = jsonObj.nodeName;
            var jsonItems = jsonObj.items;
            if (jsonItems) {
                this.items = [];
                for (var i = 0; i < jsonItems.length; i++) {
                    var childModel = expeditor.Utils.ModelFactory.fromJson(jsonItems[i], this.ctx);
                    childModel.fromJson(jsonItems[i]);
                    this.items.push(childModel);
                }
            }
            return this;
        },

        toJson : function () {
            var obj = {nodeName : this.nodeName, items : []};
            if (this.items) {
                for (var i = 0; i < this.items.length; i++) {
                    obj.items.push(this.items[i].toJson());
                }
            }
            return obj;
        },

        accept : function (visitor) {
            if (!this._visitStart(visitor)) {
                for (var i = 0; i < this.items.length; i++) {
                    this.items[i].accept(visitor);
                }
            }
            this._visitEnd(visitor);
        },

        validate : function () {
            var valid = true;
            for (var i = 0; i < this.items.length && valid; i++) {
                valid = valid && this.items[i].validate();
            }
            return valid;
        },

        
        fixModel : function (jsonConfig) {
            if (typeof jsonConfig === "object" && jsonConfig !== null) {
                this.items.forEach(function (item) {
                    if (jsonConfig[item.nodeName]) {
                        item.fromJson(jsonConfig[item.nodeName]);
                    }
                });
            }
        }
    });
})(expeditor);
(function (expeditor) {
    var RootModel = expeditor.model.RootModel = expeditor.model.SequenceModel.extend({
        init : function (nodeName, ctx) {
            this._super.apply(this, arguments);
            this.isValid = false;
            this.enabled = true;
        },

        fromJson : function (jsonObj) {
            this._super.apply(this, arguments);
            this.isValid = jsonObj.isValid;
            this.version = jsonObj.version || 0;
            this.enabled = jsonObj.enabled !== undefined ? jsonObj.enabled : true;
            return this;
        },

        toJson : function () {
            var obj = this._super.apply(this, arguments);
            obj.isValid = this.isValid;
            obj.enabled = this.enabled;
            obj.version = this.version;
            return obj;
        },

        setIsValid : function (flag) {
            this.isValid = flag;
        },

        getIsValid : function () {
            return this.isValid;
        },

        getIsEnabled : function () {
            return this.enabled;
        },

        setEnabled : function (flag) {
            this.enabled = flag;
        }
    });
})(expeditor);
(function (expeditor) {
    var ScriptModel = expeditor.model.ScriptModel = expeditor.model.BaseModel.extend({
        init : function () {
            this._super.apply(this, arguments);
            this.script = {
                content : ""
            };
            this.enabled = true;
        },

        setScript : function (script) {
            this.script = script;
            return this;
        },

        toJson : function () {
            return {
                script : $.extend({}, this.script),
                nodeName : this.nodeName,
                version : this.version,
                enabled : this.enabled
            };
        },

        fromJson : function (json) {
            this.script = json.script;
            this.version = json.version || 0;
            this.enabled = json.enabled !== undefined ? json.enabled : true;
            return this;
        },

        getIsValid : function () {
            
            return true;
        },

        getIsEnabled : function () {
            return this.enabled;
        },

        setEnabled : function (flag) {
            this.enabled = flag;
        }
    });
})(expeditor);
(function (expeditor) {
    var parameterConfig = {
        extras : {
            component : {
                dataType : 'ANY'
            },
            view : {
                inline : true
            }
        }
    };
    var FunctionModel = expeditor.model.FunctionModel = expeditor.model.BaseModel.extend({
        init : function (nodeName, ctx, extraConfig) {
            this._super.apply(this, arguments);
            this.parameters = [];
        },

        setFunctionName : function (value) {
            this.functionName = value;
        },

        getFunctionName : function () {
            return this.functionName;
        },

        setParameter : function (index, paramModel) {
            this.parameters[index] = paramModel;
        },

        getParameters : function () {
            return this.parameters;
        },

        getParameter : function (index) {
            return this.parameters[index];
        },

        toJson : function () {
            return {
                nodeName : this.nodeName,
                functionName : this.functionName,
                params : this.parameters.map(function (param) {
                    return param.toJson();
                })
            };
        },

        fromJson : function (json) {
            this.nodeName = json.nodeName;
            this.functionName = json.functionName;
            this.parameters = json.params.map(function (paramJson) {
                var paramConfig = $.extend({}, parameterConfig);
                return this.ctx.createModel("EXPRESSION", paramConfig).fromJson(paramJson);
            }, this);
            return this;
        }
    });
})(expeditor);
(function (expeditor) {
    var ChoiceModel = expeditor.model.ChoiceModel = expeditor.model.BaseModel.extend({
        init : function (nodeName, ctx) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            this.choiceModel = null;
        },

        setChoiceModel : function (m) {
            this.choiceModel = m;
            this.trigger('change');
        },

        getChoiceModel : function () {
            return this.choiceModel;
        },

        fromJson : function (jsonObj) {
            this.nodeName = jsonObj.nodeName;
            if (jsonObj.choice !== null) {
                this.choiceModel = expeditor.Utils.ModelFactory.fromJson(jsonObj.choice, this.ctx);
            } else {
                this.choiceModel = null;
            }
            return this;
        },

        toJson : function () {
            var choice = null;
            if (this.choiceModel !== null) {
                choice = this.choiceModel.toJson();
            }
            return {
                nodeName : this.nodeName,
                choice : choice
            };
        },

        accept : function (visitor) {
            if (!this._visitStart(visitor)) {
                if (this.choiceModel) {
                    this.choiceModel.accept(visitor);
                }
            }
            this._visitEnd(visitor);
        },

        validate : function () {
            return this.choiceModel.validate();
        }
    });
})(expeditor);
(function (expeditor) {
    var ConditionModel = expeditor.model.ConditionModel = expeditor.model.ChoiceModel.extend({
        init : function (nodeName, ctx) {
            this._super.apply(this, arguments);
            this.nested = false;
        },

        fromJson : function (jsonObj) {
            this._super.apply(this, arguments);
            this.nested = jsonObj.nested;
            return this;
        },

        toJson : function () {
            var obj = this._super.apply(this, arguments);
            obj.nested = this.nested;
            return obj;
        }
    });
})(expeditor);
(function (expeditor) {
    var ListModel = expeditor.model.ListModel = expeditor.model.BaseModel.extend({
        init : function (nodeName, ctx) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            this.items = [];
        },

        add : function (model) {
            this.items.push(model);
        },

        remove : function (index) {
            this.items.splice(index, 1);
        },

        move : function (index, newIndex) {
            this.items.splice(newIndex, 0, this.items.splice(index, 1)[0]);
        },

        get : function (index) {
            return this.items[index];
        },

        size : function () {
            return this.items.length;
        },

        set : function (index, model) {
            if (index > -1 && index < this.items.length) {
                this.items[index] = model;
            }
        },

        setItems : function (items) {
            this.items = items;
        },

        clear : function () {
            this.items = [];
        },

        fromJson : function (jsonObj) {
            var jsonItems = jsonObj.items;
            this.nodeName = jsonObj.nodeName;
            this.clear();
            if (jsonItems) {
                for (var i = 0; i < jsonItems.length; i++) {
                    this.add(expeditor.Utils.ModelFactory.fromJson(jsonItems[i], this.ctx));
                }
            }
            return this;
        },

        toJson : function () {
            var obj = {
                nodeName : this.nodeName,
                items : []

            };
            for (var i = 0; i < this.items.length; i++) {
                obj.items.push(this.items[i].toJson());
            }
            return obj;
        },

        validate : function () {
            var isValid = true;
            for (var i = 0; i < this.items.length; i++) {
                isValid = isValid && this.items[i].validate();
            }
            return isValid;
        },

        accept : function (visitor) {
            if (!this._visitStart(visitor)) {
                for (var i = 0; i < this.items.length; i++) {
                    this.items[i].accept(visitor);
                }
            }
            this._visitEnd(visitor);
        }
    });
})(expeditor);
(function (expeditor, $) {
    var TerminalModel = expeditor.model.TerminalModel = expeditor.model.BaseModel.extend({
        init : function (nodeName, ctx) {
            this.nodeName = nodeName;
            this.ctx = ctx;
            this.value = null;
        },

        setValue : function (val) {
            this.value = val;
        },

        fromJson : function (jsonObj) {
            if (typeof jsonObj.value === "object" && jsonObj.value !== null) {
                this.value = $.extend(true, {}, jsonObj.value);
            } else {
                this.value = jsonObj.value;
            }
            return this;
        },

        getValue : function () {
            return this.value;
        },

        toJson : function () {
            return {nodeName : this.nodeName, value : this.getValue()};
        },

        validate : function () {
            return this.value !== null;
        }

    });
})(expeditor, jQuery);
