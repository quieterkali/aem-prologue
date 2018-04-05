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
var defaultConfig = {
    choice : {
        component : 'expeditor.component.ChoiceComponent',
        model : 'expeditor.model.ChoiceModel',
        view : 'expeditor.view.ChoiceView'
    },
    sequence : {
        component : 'expeditor.component.SequenceComponent',
        model : 'expeditor.model.SequenceModel',
        view : 'expeditor.view.SequenceView'
    },
    list : {
        component : 'expeditor.component.ListComponent',
        model : 'expeditor.model.ListModel',
        view : 'expeditor.view.ListView'
    },
    terminal : {
        component : 'expeditor.component.TerminalComponent',
        model : 'expeditor.model.TerminalModel',
        view : 'expeditor.view.TerminalView'
    },
    variable : {
        component : 'expeditor.component.VariableComponent',
        model : 'expeditor.model.TerminalModel',
        view : 'expeditor.view.VariableView'
    }
};

(function (expeditor) {

    var Utils = expeditor.Utils = {

        getCurrentVersion : function () {
            return 1;
        },

        getPrimitiveTypes : function () {
            return ["STRING", "NUMBER", "BOOLEAN", "DATE"];
        },

        chomp : function (str) {
            if (typeof str === "string") {
                return str.replace(/.$/, "");
            }
            return str;
        },

        excerpts : function (code, maxLines) {
            if (typeof code !== "string") {
                return code;
            }
            var lines = code.split("\n"),
                excerpt = code,
                _maxLines = maxLines || 3,
                excerptArray = new Array(_maxLines),
                i;
            if (lines.length > _maxLines) {
                excerptArray[0] = lines[0];
                for (i = 1; i < _maxLines - 1; i++) {
                    excerptArray[i] = ".....";
                }
                excerptArray[_maxLines - 1] = lines[lines.length - 1];
                excerpt = excerptArray.join("\n");
            }
            return excerpt;
        },

        trimString : function (arr) {
            if (typeof arr === "string") {
                return arr.trim();
            }
            if (!(arr instanceof Array)) {
                return arr;
            }
            var newArr = [], index;
            for (index = 0; index < arr.length; index++) {
                var str = arr[index];
                newArr[index] = typeof str === "string" ? str.trim() : str;
            }
            return newArr;
        },

        isPrimitive : function (type) {
            if (type == null || (typeof type !== "string" && !(type instanceof Array))) {
                return false;
            }
            if (!(type instanceof Array)) {
                type = Utils.trimString(type.split("|"))[0];
            }
            return this.getPrimitiveTypes().indexOf(type) > -1;
        },

        filterPrimitiveTypes : function (type) {
            return this.getCompatibleTypes(this.getPrimitiveTypes(), type);
        },

        isTypesCompatible : function (type1, type2) {
            if (type1 == null || type2 == null) {
                return false;
            }
            if (!(type1 instanceof Array)) {
                type1 = type1.split("|").map(function (type) {return type.trim();});
            }
            if (!(type2 instanceof Array)) {
                type2 = type2.split("|").map(function (type) {return type.trim();});
            }
            return type1.indexOf("ANY") > -1 ||
                type2.indexOf("ANY") > -1 ||
                type2.some(function (type) {
                    return type1.indexOf(type) > -1;
                });
        },

        getRenderCondition : function (config, child, childConfig) {
            var condition = Utils.getOrElse(config, child, null);
            if (condition === null) {
                condition = Utils.getOrElse(childConfig, "extras.component.renderCondition", true);
            }
            return condition;
        },

        getCompatibleTypes : function (type1, type2) {
            if (type1 === null || type2 === null) {
                return "";
            }
            if (!(type1 instanceof Array)) {
                type1 = type1.split("|").map(function (type) {return type.trim();});
            }
            if (!(type2 instanceof Array)) {
                type2 = type2.split("|").map(function (type) {return type.trim();});
            }
            var iterType1 = 0,
                result = "";
            if (type1.indexOf("ANY") > -1) {
                return type2.join("|");
            }
            if (type2.indexOf("ANY") > -1) {
                return type1.join("|");
            }
            for (; iterType1 < type1.length; iterType1++) {
                if (type2.indexOf(type1[iterType1]) > -1) {
                    result += type1[iterType1] + "|";
                }
            }
            return result.replace(/\|$/, "");
        },

        isTypeSame : function (type1, type2) {
            if (type1 == null || type2 == null) {
                return false;
            }
            if (type1 === type2) {
                return true;
            }
            if (!(type1 instanceof Array)) {
                type1 = Utils.trimString(type1.split("|"));
            }
            if (!(type2 instanceof Array)) {
                type2 = Utils.trimString(type2.split("|"));
            }
            if (type2.length !== type1.length) {
                return false;
            }
            var iterType1 = 0, isSame = true;
            for (; iterType1 < type1.length && isSame; iterType1++) {
                isSame = isSame && type2.indexOf(type1[iterType1]) > -1;
            }
            return isSame;
        },

        getOrElse : function (obj) {
            var currObject = obj;
            if (arguments.length < 2) {
                return currObject;
            } else if (arguments.length == 2) {
                if (!_.isUndefined(currObject)) {
                    return currObject;
                } else {
                    return _.clone(arguments[1]);
                }
            } else {
                var propChain = (arguments[1] || "").split(".");
                var defaultValue = arguments[2];
                _.each(propChain, function (prop) {
                    if (_.isObject(currObject)) {
                        currObject = currObject[prop];
                    } else {
                        currObject = undefined;
                    }
                }, this);

                if (!_.isUndefined(currObject)) {
                    return currObject;
                } else {
                    return _.clone(defaultValue); //May have to do deep clone in future. TODO: support for conditional clone
                }
            }
        },

        getClassForName : function (className) {
            return Utils.getOrElse(window, className, null);
        },

        launchCustomModal : function (modalType, modalTitle, modalMessage, footer, backgroundEl) {
            var dialog = $("#expeditor-modaltemplate")[0];
            if (modalType == null) {
                modalType = 'error';
            }
            if (footer == null) {
                footer = '<button is="coral-button" variant="primary" coral-close>' + Granite.I18n.get('Close') + '</button>';
            }
            dialog.set({
                header : {innerHTML : modalTitle},
                content : {innerHTML : modalMessage},
                variant : modalType,
                closable : 'on',
                footer : {innerHTML : footer}
            });
            dialog.show();
            if (backgroundEl) {
                var zIndex = Utils.getZIndex(backgroundEl);
                if (dialog.style.zIndex < zIndex) {
                    dialog.style.zIndex = zIndex + 2;
                }
            }
        },

        getActionBarButton : function (title, icon, className) {
            className = className || "";
            return $('<button title="' + title + '" is="coral-Button" icon="' + icon + '" variant="quiet" class="coral-Button--graniteActionBar ' + className + '">' +
                 title +
                '</button>');
        },

        ModelFactory : {
            //TODO : identify how models created with custom configuration will be cloned
            fromJson : function (json, ctx) {
                var model = ctx.createModel(json.nodeName).fromJson(json);
                if (typeof model.fixModel === "function") {
                    var jsonConfig = Utils.getOrElse(ctx.getConfig(json.nodeName), "jsonModel", null);
                    if (jsonConfig != null) {
                        model.fixModel(jsonConfig);
                    }
                }
                return model;
            }
        },

        getChildRules : function (rule) {
            var children = [];
            if (typeof rule !== "string") {
                return children;
            }
            if (rule.match(/\|/)) {
                children = rule.split(/\|/).map(function (option) {
                    return option.trim();
                }).filter(function (option) {
                    return option != null && option.length > 0;
                });
            } // check for list rule
            else if (rule.match(/\+$/)) {
                var child = rule.replace(/\+$/, "").trim();
                children = [child];
            } else if (rule.match(/\*$/)) {
                var child = rule.replace(/\*$/, "").trim();
                children = [child];
            } else { // sequence rule
                children = rule.trim().split(" ").map(function (option) {
                    return option.trim();
                }).filter(function (option) {
                    return option != null && option.length > 0;
                });
            }
            return children;
        },

        _getRuleImpl : function (rule) {
            var config = {};
            var children = this.getChildRules(rule);
            config.children = children;
            // check for choice rule
            if (rule.match(/\|/)) {
                config.impl = $.extend({}, defaultConfig.choice);
            } // check for list rule
            else if (rule.match(/\+$/)) {
                config.impl = $.extend({}, defaultConfig.list);
                config.extras = config.extras || {};
                config.extras.component = {minCount : 1};
            }else if (rule.match(/\*$/)) {
                config.impl = $.extend({}, defaultConfig.list);
                config.extras = config.extras || {};
                config.extras.component = {minCount : 0};
            } else if (rule == "VARIABLE") {
                config.impl = $.extend({}, defaultConfig.variable);
            } else { // sequence rule
                config.impl = $.extend({}, defaultConfig.sequence);
            }
            return config;
        },

        listModelToScript : function (listModel, transformer) {
            transformer.setMode(transformer.MERGE_MODE);
            transformer.setAddCopyrightHeader(false);
            return listModel.items.filter(function (model) {
                return (model.getIsValid() && model.getIsEnabled());
            }).map(function (model) {
                model.accept(transformer);
                return transformer.getScript();
            });
        },

        /**
         * encodes <script> and </script> with &lt;script&gt; and *lt;/script&gt;
         * and also img,video and audio tag respectively
         *
         * other tags are being removed since scripts can be run through
         * <img onerror="script" /> (same for audio and video)
         */
        encodeScriptableTags : function (str) {
            var index;
            if (_.isString(str)) {
                return str.replace(/<(\/?)(script[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(img[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(video[^<>]*)>/gi, '&lt;$1$2&gt;')
                    .replace(/<(\/?)(audio[^<>]*)>/gi, '&lt;$1$2&gt;');
            }
        },

        /**
         *
         * @param rule
         * @param nodeName
         */
        getConfig : function (rule, nodeName, cache) {
            var config;
            if (Utils.getConfig.cache == null) {
                Utils.getConfig.cache = {};
            }
            if (nodeName === undefined || cache === false || !Utils.getConfig.cache.hasOwnProperty(nodeName)) {
                if (typeof rule === "string") {
                    config = this._getRuleImpl(rule);
                } else if (typeof rule === "object") {
                    config = this.getConfig(rule.rule);
                    var prop;
                    for (prop in config.impl) {
                        if (config.impl.hasOwnProperty(prop) && rule[prop] !== undefined) {
                            config.impl[prop] = rule[prop];
                        }
                    }
                    if (config.extras && rule.extras) {
                        for (prop in rule.extras) {
                            if (rule.extras.hasOwnProperty(prop) && config.extras[prop] == undefined) {
                                config.extras[prop] = rule.extras[prop];
                            }
                        }
                    } else {
                        config.extras = $.extend({}, rule.extras);
                    }
                    config.choiceName = Granite.I18n.get(rule.choiceName);
                    config.jsonModel = $.extend({}, rule.jsonModel);
                } else {
                    config = {
                        impl : $.extend({}, defaultConfig.terminal)
                    };
                }
                if (nodeName === undefined || cache === false) {
                    return config;
                }
                Utils.getConfig.cache[nodeName] = config;
            }
            return Utils.getConfig.cache[nodeName];
        },

        capitalizeFirstCharacter : function (str) {
            if (str == null) {
                return null;
            }
            return str[0].toUpperCase() + str.substring(1).toLowerCase();
        },
        getZIndex : function ($el) {
            return $el.parents().map(function (idx, elem) {
                return window.getComputedStyle(elem).getPropertyValue('z-index');                  // return $(elem).css('z-index');
            }).filter(function (idx, z_index) {
                return !isNaN(z_index);
            })[0];
        },

        /**
         * @param component expeditor.component.BaseComponent having
         * at least three children. 1st and 3rd children must implement getMetaProps
         * and syncMetaProps methods. Used to make extra meta props available to lhs, rhs
         */
        syncMetaProps : function (component) {
            component.childComponents[0].syncMetaProps(component.childComponents[2].getMetaProps());
            component.childComponents[2].syncMetaProps(component.childComponents[0].getMetaProps());
        }
    };

    var ExpEditorContext = expeditor.ExpEditorContext = expeditor.Class.extend({
        init : function (config, scope, webServicesConfig) {
            this.config = config;
            this.webServicesConfig = webServicesConfig;
            this.scope = scope;
            Utils.getConfig.cache = {};
        },

        setScope : function (scope) {
            this.scope = scope;
        },

        getScope : function () {
            return this.scope;
        },

        getConfig : function (nodeName, componentConfig) {
            var cachedConfig, finalConfig, prop;
            if (this.config[nodeName]) {
                cachedConfig = Utils.getConfig(this.config[nodeName], nodeName);
                if (typeof componentConfig === "object" && componentConfig !== null) {
                    finalConfig = $.extend(true, {}, cachedConfig, componentConfig);
                } else {
                    finalConfig = cachedConfig;
                }
            } else {
                finalConfig = Utils.getConfig(componentConfig, nodeName, false);
            }
            return finalConfig;
        },

        createComponent : function (nodeName, componentConfig) {
            var _componentConfig = this.getConfig(nodeName, componentConfig),
                componentClassName = _componentConfig.impl.component,
                componentClass = Utils.getClassForName(componentClassName),
                extraConfig = Utils.getOrElse(_componentConfig, "extras.component", null);
            var newComponent =  new componentClass(nodeName, this, extraConfig, componentConfig);
            if (typeof(newComponent.loadConfigJsonModel) == "function") {
                newComponent.loadConfigJsonModel();
            }
            return newComponent;
        },

        createModel : function (nodeName, componentConfig) {
            if (nodeName === "SCRIPTMODEL") {
                return new expeditor.model.ScriptModel(nodeName, this);
            }
            var _componentConfig = this.getConfig(nodeName, componentConfig),
                modelClassName = _componentConfig.impl.model;
            if (modelClassName) {
                var modelClass = Utils.getClassForName(modelClassName);
                if (modelClass) {
                    return new modelClass(nodeName, this, Utils.getOrElse(_componentConfig, "extras.model", null));
                }
            }
        },

        createView : function (nodeName, componentConfig) {
            var _componentConfig = this.getConfig(nodeName, componentConfig),
                viewClassName = _componentConfig.impl.view;
            if (viewClassName) {
                var viewClass = Utils.getClassForName(viewClassName);
                if (viewClass) {
                    return new viewClass(nodeName, this, Utils.getOrElse(_componentConfig, "extras.view", null));
                }
            }
        }
    });

    var EventTarget = expeditor.EventTarget = expeditor.Class.extend({
        init : function () {
        },

        trigger : function (topic, data) {
            var _data = data || {};
            $(this).trigger(topic, _data);
            return this;
        },

        bind : function (topic, fn, scope) {
            $(this).on(topic, $.proxy(fn, scope));
            return this;
        },

        unbind : function (topic) {
            $(this).off(topic);
            return this;
        }
    });

})(expeditor);
