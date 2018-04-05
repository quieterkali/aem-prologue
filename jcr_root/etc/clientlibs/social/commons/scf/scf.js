/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(Backbone, $CQ, _, Handlebars) {
    "use strict";
    var SCF = {
        VERSION: "0.0.1",
        Views: {},
        Models: {},
        Collections: {},
        config: {
            urlRoot: ""
        },
        constants: {
            SOCIAL_SELECTOR: ".social",
            JSON_EXT: ".json",
            URL_EXT: ".social.json",
            TRANSLATE_URL_EXT: ".social.translate.json",
            ANALYTICS_BASE_RESOURCE_TYPE: "social/commons/components/analyticsbase"
        },
        Components: {},
        loadedComponents: {},
        templates: {},
        fieldManagers: {},
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4
    };
    SCF.LOG_LEVEL = SCF.INFO;
    var _logger = {
        debug: function() {
            if (SCF.LOG_LEVEL <= SCF.DEBUG) {
                window.console.debug.apply(window.console, arguments);
            }
        },
        info: function() {
            if (SCF.LOG_LEVEL <= SCF.INFO) {
                window.console.info.apply(window.console, arguments);
            }
        },
        warn: function() {
            if (SCF.LOG_LEVEL <= SCF.WARN) {
                window.console.warn.apply(window.console, arguments);
            }
        },
        error: function() {
            if (SCF.LOG_LEVEL <= SCF.ERROR) {
                window.console.error.apply(window.console, arguments);
            }
        }
    };
    var deepCommentSearch = function(node, regex) {
        var child = node.firstChild;
        var foundNode = null;
        while (child) {
            switch (child.nodeType) {
                case 1:
                    foundNode = deepCommentSearch(child, regex);
                    break;
                case 8:
                    if (child.nodeValue.match(regex)) {
                        return child;
                    }
                    break;
            }
            if (foundNode !== null) {
                break;
            }
            child = child.nextSibling;
        }
        return foundNode;
    };
    SCF.Router = new Backbone.Router();
    Backbone.history.start({
        pushState: true,
        hashChange: false
    });
    SCF.View = Backbone.View.extend({
        initialize: function() {
            this._rendered = false;
            this._childViews = {};
            this._parentView = undefined;
            this._modelReady = false;
            this._sessionReady = false;
            this._renderedChildren = [];
            this._replacementTarget = null;
            this._destroyed = false;
            if (this.$el.html() !== "") {
                this.bindView();
                this._rendered = true;
            }
            this.listenTo(this.model, "model:loaded", function() {
                this._modelReady = true;
                this.render();
            });
            this.listenTo(this.model, "model:cacheFixed", function() {
                this.render();
            });
            if (this.requiresSession && !SCF.Session.isReady()) {
                //SCF.log.debug("%s waiting for session to be ready.", this.cid);
                this.listenTo(SCF.Session, "model:loaded", function(data) {
                    if (!this._sessionReady) {
                        //SCF.log.debug("View: %s got Session ready.", this.cid);
                        this._sessionReady = true;
                        this.render();
                    }
                });
            }
            this._sessionReady = SCF.Session.isReady();
            if (_.isFunction(this.init)) {
                this.init.apply(this, arguments);
            }
            if (SCF.Session.isReady()) {
                this.initContext();
            } else {
                SCF.Session.on("model:loaded", _.bind(this.initContext, this));
            }
        },
        initContext: function() {
            if (_.isUndefined(SCF.Context)) {
                SCF.Context = {};
                var groupNavbarSel = ".scf-js-group-navbar";

                // get site path to be written into SCF.Context and recorded for analytics
                var sitePath = $(".scf-js-site-title").attr("href");
                sitePath = _.isUndefined(sitePath) ? "" : sitePath.substring(0, sitePath.lastIndexOf(".html"));
                this.sitePath = sitePath;
                /*
                 * Populate page level component information into SCF.Context
                 * to be sent with analytics calls. It is particularly important
                 * for events such as post (SCFCreate) or votes (SCFVote) originated
                 * in nested coments or replies (not top level) that do not have
                 * direct access to this information
                 */
                SCF.Context.siteTitle = $(".scf-js-site-title").length !== 0 ? $(".scf-js-site-title").text() : "";
                SCF.Context.sitePath = this.sitePath;
                SCF.Context.groupTitle = $(groupNavbarSel).length !== 0 && !_.isUndefined($(groupNavbarSel).attr("data-group-title")) ? $(groupNavbarSel).data("group-title") : "";
                SCF.Context.groupPath = $(groupNavbarSel).length !== 0 && !_.isUndefined($(groupNavbarSel).attr("data-group-path")) ? $(groupNavbarSel).data("group-path") : "";
                SCF.Context.user = SCF.Session.get("authorizableId");
            }
            if (_.isFunction(this.initAnalytics)) {
                this.initAnalytics.apply(this, arguments);
            }
        },
        getContextForTemplate: function() {
            var context = (this.model !== undefined) ? this.model.toJSON() : this.context;
            return this.getMergedContexts(context);
        },
        getMergedContexts: function(context) {
            if (!_.isObject(context)) {
                context = {};
            }
            context.loggedInUser = SCF.Session.toJSON();
            context.environment = {};
            context.environment.client = true;
            return context;
        },
        appendTo: function(parentElement) {
            if (!this._rendered) {
                this.render();
            }
            $CQ(parentElement).append(this.el);
            this.trigger("view:ready", {
                view: this
            });
        },
        replaceElement: function(replacedElement) {
            if (!this._rendered) {
                this.render();
            }
            if (this._rendered) {
                $CQ(replacedElement).replaceWith(this.$el);
                this._replacementTarget = null;
                this.trigger("view:ready", {
                    view: this
                });
            } else {
                //SCF.log.debug("Attaching replacementTarget: %s", this.cid);
                this._replacementTarget = replacedElement;
            }
        },
        render: function() {
            if (this._destroyed) {
                return;
            }
            var that = this;
            if (!(this._modelReady || this.model._isReady) || (this.requiresSession && !this._sessionReady)) {
                /*
                if (!(this._modelReady || this.model._isReady)) {
                    SCF.log.debug("Skipping render due to Model not ready %s : %s", this.cid, this.model.attributes.resourceType);
                }
                if (this.requiresSession && !this._sessionReady) {
                    SCF.log.debug("Skipping render due to Session not ready %s : %s", this.cid, this.model.attributes.resourceType);
                }
                */
                return this;
            }
            //SCF.log.debug("Rendering %s : %s", this.cid, this.model.attributes.resourceType);
            this.unbindDataFields();
            for (var viewName in this._childViews) {
                this._childViews[viewName].destroy();
                delete this._childViews[viewName];
            }
            this._renderedChildren = [];
            var element = $CQ(this.template(this.getContextForTemplate(), {
                data: {
                    parentView: this
                }
            }));
            //Check if its attached to DOM or rendered
            if (this._rendered || this.$el.parent().length > 0) {
                this.$el.html(element.html());
            } else {
                this.setElement(element);
            }
            //render children
            _.each(this._childViews, function(child) {
                that.renderChildView(child);
            });

            var finishRendering = _.bind(function() {
                this.bindView();
                this._rendered = true;
                if (this.afterRender) {
                    this.afterRender();
                }
                this.trigger("view:rendered", {
                    view: this
                });

            }, this);
            //wait for children to finish rendering and then complete binding the view
            $CQ.when(this._renderedChildren).done(finishRendering);
            if (this._replacementTarget !== null) {
                this.replaceElement(this._replacementTarget);
            }
            return this;
        },
        bindView: function() {
            var that = this;
            this.unbindDataFields();
            this.$("[evt]").not(this.$("[data-scf-component] [evt]")).each(function(idx, trigger) {
                SCF.View.bindEvents(that, $CQ(trigger));
            });
            this.$("[data-attrib]").not(this.$("[data-scf-component] [data-attrib]")).each(function(idx, element) {
                SCF.View.bindDataFields(that, $CQ(element));
            });
            this.$("[data-form]").not(this.$("[data-scf-component] [data-form]")).each(function(idx, element) {
                SCF.View.bindDataForms(that, $CQ(element));
            });
        },
        addChildView: function(childView) {
            //SCF.log.debug("Adding Child View: %s", childView.cid);
            this._childViews[childView.cid] = childView;
            var deferred = $CQ.Deferred();
            this._renderedChildren[childView.cid] = deferred.promise();
            this.listenTo(childView, "view:rendered", function() {
                deferred.resolve();
            });
            this.listenTo(childView, "view:destroyed", function(event) {
                //SCF.log.debug("Parent getting destory command for child view: %s", event.view.cid);
                this.removeChildView(event.view.cid);
            });
            return this;
        },
        getChildView: function(childViewID) {
            return this._childViews[childViewID];
        },
        removeChildView: function(childViewID) {
            if (this._renderedChildren.hasOwnProperty(childViewID)) {
                this._renderedChildren[childViewID].fail();
            }
            if (this._childViews.hasOwnProperty(childViewID)) {
                var childView = this._childViews[childViewID];
                childView.stopListening();
                this.stopListening(childView, "view:rendered");
                this._childViews[childViewID] = undefined;
                delete this._childViews[childViewID];
            }
            return this;
        },
        getChildViews: function() {
            return this._childViews;
        },
        setParent: function(parentView) {
            this._parentView = parentView;
            parentView.addChildView(this);
            return this;
        },
        renderChildView: function(view) {
            //SCF.log.debug("Rendering child view: %s", view.cid);
            view.render();
            var parent = this;
            if (parent.el === null) {
                return;
            }
            var el = null;
            var currentNode = null;
            var targetView = new RegExp("\s*?data-view='" + view.cid + "'");
            if (document.createNodeIterator && NodeFilter && NodeFilter.SHOW_COMMENT) {
                var iter = document.createNodeIterator(parent.el, NodeFilter.SHOW_COMMENT,
                    function(node) {
                        if (node.data.match(targetView)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    },
                    false
                );
                currentNode = iter.nextNode();
                while (currentNode !== null) {
                    el = currentNode;
                    currentNode = iter.nextNode();
                    break;
                }
                view.replaceElement(el);
            } else {
                el = deepCommentSearch(parent.el, targetView);
                view.replaceElement(el);
            }
        },
        getField: function(field) {
            var element = this._fields[field];
            if (element) {
                return element.val();
            }
            return "";
        },
        setField: function(field, data) {
            var element = this._fields[field];
            if (!element) {
                return;
            }
            element.val(data);
        },
        focus: function(field) {
            var element = this._fields[field];
            if (!element) {
                return;
            }
            element.focus();
        },
        getForm: function(form) {
            if (typeof this._forms === 'undefined') {
                return null;
            } else {
                return this._forms[form];
            }
        },
        destroy: function() {
            this.undelegateEvents();
            this.unbindDataFields();
            this.stopListening();
            this.trigger("view:destroyed", {
                view: this
            });
            this._destroyed = true;
            //SCF.log.debug("DESTORYING %s : %s", this.cid, this.model.attributes.resourceType);
        },
        unbindDataFields: function() {
            for (var prop in this._fields) {
                if (this._fields.hasOwnProperty(prop)) {
                    if (_.isFunction(this._fields[prop].destroy)) {
                        this._fields[prop].destroy();
                    }
                }
            }
            this._fields = {};
        },
        log: _logger
    });
    SCF.View.extend = function() {
        var child = Backbone.View.extend.apply(this, arguments);
        var viewName = arguments[0].viewName;
        SCF.Views[viewName] = child;
        return child;
    };

    SCF.Model = Backbone.Model.extend({
        _cachedModels: {},
        _hasLoadedChildren: false,
        parse: function(response) {
            this._parseRelations(response);
            return response;
        },
        addEncoding: function(data) {
            if ((window.FormData) && (data instanceof window.FormData)) {
                data.append("_charset_", "UTF-8");
            }
            if (!data.hasOwnProperty("_charset_")) {
                data._charset_ = "UTF-8";
            }
            return data;
        },
        reload: function(callback) {
            this._isReady = false;
            var url = "";
            var urlFn;
            if (_.isFunction(this.url)) {
                //Need to do this since model.clear will clear the id that is used to construct the url
                url = this.url();
                urlFn = this.url;
            } else {
                //seen code that sets the param as a hardcoded string
                url = this.url;
            }
            this.clear();
            //This.clear clears the id resulting in bad URL so setting the URL for fetch to happen
            if (!_.isEmpty(url)) {
                this.url = url;
            }
            var that = this;
            this.fetch({
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                error: function(model, response) {
                    SCF.log.error("Error fetching model");
                    SCF.log.error(response);
                    model.clear();
                    model._isReady = true;
                    model.trigger("model:loaded", model);
                    if (callback && typeof(callback.error) === "function") {
                        callback.error();
                    }
                },
                success: function(model) {
                    if (urlFn !== undefined) {
                        //resetting the url back to function
                        model.url = urlFn;
                    }
                    model._isReady = true;
                    model.trigger("model:loaded", model);
                    if (callback && typeof(callback.success) === "function") {
                        callback.success();
                    }
                }
            });
        },
        reset: function(attributes, options) {
            this.clear().set(_.clone(this.defaults));
            var attr = this._parseRelations(attributes);
            this.set(attr, options);
            return this;
        },
        initialize: function(attributes) {
            this.listenTo(SCF.Session, "logout:success", function() {
                this.reload();
            });
            this.listenTo(SCF.Session, "login:success", function() {
                this.reload();
            });
        },
        constructor: function(attributes, options) {
            var attr = this._parseRelations(attributes);
            Backbone.Model.apply(this, [attr, options]);
        },
        url: function() {
            var u;
            if (this.urlRoot) {
                u = this.urlRoot + this.id + SCF.constants.URL_EXT;
            } else if (SCF.config.urlRoot) {
                u = SCF.config.urlRoot + this.id + SCF.constants.URL_EXT;
            } else {
                u = this.id + SCF.constants.URL_EXT;
            }
            return u;
        },
        _parseRelations: function(attributes) {
            var makeRelation = _.bind(function(data, key) {
                if (!attributes[key] && !data.path) {
                    attributes[key] = [];
                }
                if (attributes[key] || data.path) {
                    var relative = attributes[key];
                    var ModelKlass, model;
                    if (_.isArray(relative)) {
                        var modelArray = [],
                            idArray = [];
                        _.each(relative, function(rel) {
                            if (_.isObject(rel)) {
                                ModelKlass = !_.isUndefined(SCF.Models[data.model]) ? SCF.Models[data.model] : SCF.Components[rel.resourceType].Model;
                                model = ModelKlass.findLocal(rel.id);
                                if (!model) {
                                    model = ModelKlass.createLocally(rel);
                                } else {
                                    model.reset(rel);
                                }
                                modelArray.push(model);
                            } else if (!_.isEmpty(rel)) {
                                var idFromUrl = rel.substr(SCF.config.urlRoot.length);
                                idFromUrl = idFromUrl.substr(0, idFromUrl.lastIndexOf(SCF.constants.URL_EXT));
                                ModelKlass = SCF.Models[data.model];
                                model = ModelKlass.findLocal("idFromUrl");
                                if (!model) {
                                    model = data.autofetch ? ModelKlass.find(idFromUrl) : new ModelKlass({
                                        url: rel
                                    });
                                }
                                ModelKlass.prototype._cachedModels[idFromUrl] = model;
                                modelArray.push(model);
                            }
                        });
                        var CollectionKlass = SCF.Collections[data.collection] || Backbone.Collection;
                        var collection = new CollectionKlass();
                        collection.model = ModelKlass;
                        collection.parent = this;
                        collection.set(modelArray, {
                            silent: true
                        });
                        attributes[key] = collection;
                    } else if (_.isObject(relative)) {
                        if (_.isUndefined(SCF.Models[data.model]) && _.isUndefined(SCF.Components[relative.resourceType])) {
                            this.log.error("A relation key %s requested model %s but it is not available nor is the component type: %s", key, data.model, relative.resourceType);
                            return;
                        }
                        ModelKlass = SCF.Models[data.model] || SCF.Components[relative.resourceType].Model;
                        model = ModelKlass.findLocal(relative.id) || ModelKlass.createLocally(relative);
                        attributes[key] = model;
                    } else {
                        var url = relative;
                        if (!url) {
                            if (data.path) {
                                if (data.path.substr(0, 1) === "/") {
                                    url = data.path;
                                } else {
                                    url = SCF.config.urlRoot + attributes.id + "/" + data.path + SCF.constants.URL_EXT;
                                }
                            } else {
                                return;
                            }
                        }
                        ModelKlass = SCF.Models[data.model];
                        if (data.autofetch) {
                            model = ModelKlass.find(url, undefined, true);
                        } else {
                            model = ModelKlass.findLocal(url, true) || new ModelKlass({
                                "url": url
                            });
                        }
                        attributes[key] = model;
                    }
                }
            }, this);
            _.each(this.relationships, makeRelation);
            return attributes;
        },
        toJSON: function() {
            var json = Backbone.Model.prototype.toJSON.apply(this);
            _.each(this.relationships, function(config, relation) {

                var relative = json[relation];
                if (relative.length <= 0) {
                    delete json[relation];
                    return;
                }
                if (_.isArray(relative)) {
                    var jsonArray = [];
                    _.each(relative, function(rel) {
                        if (rel instanceof Backbone.Model)
                            jsonArray.push(rel.toJSON());
                        else
                            jsonArray.push(rel);
                    });
                    json[relation] = jsonArray;
                } else if (relative instanceof Backbone.Collection) {
                    json[relation] = relative.toJSON();
                } else if (relative instanceof Backbone.Model) {
                    json[relation] = relative.toJSON();
                }

            });
            return json;
        },
        log: _logger
    });
    SCF.Model.extend = function() {
        var child = Backbone.Model.extend.apply(this, arguments);
        var modelName = arguments[0].modelName;
        SCF.Models[modelName] = child;
        return child;
    };
    SCF.View.bindEvents = function(view, eventTrigger) {
        var eventString = eventTrigger.attr("evt");
        _.each(eventString.split(","), function(value) {
            var parts = value.split("=");
            var evt = $CQ.trim(parts[0]);
            var func = $CQ.trim(parts[1]);
            if (view[func]) {
                var eventHandler = _.bind(view[func], view);
                eventTrigger.off(evt);
                eventTrigger.on(evt, eventHandler);
            }
        });
    };
    SCF.View.bindDataFields = function(view, element) {
        var field = element.attr("data-attrib");
        if (!view._fields) {
            view._fields = {};
        }
        if (!_.isUndefined(view._fields[field])) {
            return;
        }
        var fieldType = element.attr("data-field-type");
        var ManagerKlass = (_.isUndefined(SCF.fieldManagers[fieldType])) ? DefaultFieldType : SCF.fieldManagers[fieldType];
        var manager = new ManagerKlass(element, {}, view.model);
        view._fields[field] = (function() {
            return {
                val: function() {
                    if (arguments.length === 0)
                        return manager.getValue();
                    else
                        return manager.setValue(arguments[0]);
                },
                focus: function() {
                    return manager.focus();
                },
                destroy: function() {
                    if (_.isFunction(manager.destroy)) {
                        manager.destroy();
                    }
                }
            };
        })();
    };
    SCF.View.bindDataForms = function(view, element) {
        var form = element.attr("data-form");
        if (!view._forms) {
            view._forms = {};
        }
        view._forms[form] = new SCFValidator($(element), false);
    };
    SCF.Model.findLocal = function(mid, isUrl) {
        var id = isUrl ? mid.substr(SCF.config.urlRoot.length) : mid;
        if (this.prototype._cachedModels && this.prototype._cachedModels[id]) {
            return this.prototype._cachedModels[id];
        }
    };
    SCF.Model.createLocally = function(attributes) {
        var modelObj = new this.prototype.constructor(attributes);
        modelObj._isReady = true;
        this.prototype._cachedModels[modelObj.get("id")] = modelObj;
        return modelObj;
    };
    SCF.Model.prototype.load = function(mid) {
        if (mid) {
            this.set({
                "id": mid
            }, {
                silent: true
            });
        }
        this.fetch({
            success: function(model) {
                model._isReady = true;
                model.trigger("model:loaded", model);
            },
            xhrFields: {
                withCredentials: true
            }
        });
    };
    SCF.Model.prototype.getConfigValue = function(key) {
        var config = this.get("configuration");
        if (!_.isEmpty(config)) {
            return config[key];
        }
        return null;
    };
    SCF.Model.prototype.destroy = function(options) {
        var model = this;
        this.constructor.prototype._cachedModels[model.get("id")] = undefined;
        model.trigger("destroy", model, model.collection, options);
    };

    SCF.Model.prototype.parseServerError = function(jqxhr, text, error) {
        var errorDetails = $CQ.parseJSON(jqxhr.responseText);
        if (errorDetails.hasOwnProperty("status.code")) {
            errorDetails.status = errorDetails.status || {};
            errorDetails.status.code = errorDetails["status.code"];
            delete errorDetails["status.code"];
        }
        if (errorDetails.hasOwnProperty("status.message")) {
            errorDetails.status = errorDetails.status || {};
            errorDetails.status.message = errorDetails["status.message"];
            delete errorDetails["status.message"];
        }
        return {
            "error": error,
            "details": errorDetails
        };
    };

    SCF.Model.find = function(mid, callback, isUrl) {
        var that = this;
        if (this.prototype._cachedModels && this.prototype._cachedModels[mid]) {
            var model = this.prototype._cachedModels[mid];
            if (_.isFunction(callback)) {
                callback(model);
            }
            return model;
        } else {
            var newModel = new this.prototype.constructor({
                id: mid
            });
            if (isUrl) {
                newModel.url = mid;
            }
            //TODO figure out caching mechanism
            this.prototype._cachedModels[mid] = newModel;
            newModel.fetch({
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                error: function(model, response) {
                    if (response.status === 204 || response.status === 404) {
                        SCF.log.debug("non existing resource");
                        model._isReady = true;
                        model.trigger("model:loaded", model);
                        if (_.isFunction(callback)) {
                            callback(model);
                        }
                    } else {
                        SCF.log.error("Error fetching model");
                        SCF.log.error(response);
                        that.prototype._cachedModels[mid] = undefined;
                    }

                },
                success: function(model) {
                    model._isReady = true;
                    model.trigger("model:loaded", model);
                    if (_.isFunction(callback)) {
                        callback(model);
                    }
                }
            });
            return newModel;
        }
    };
    SCF.Collection = Backbone.Collection.extend({});
    SCF.Collection.extend = function() {
        var child = Backbone.Collection.extend.apply(this, arguments);
        var collectioName = arguments[0].collectioName;
        SCF.Collections[collectioName] = child;
        return child;
    };

    SCF.registerComponent = function(componentName, modelKlass, viewKlass) {
        SCF.Components[componentName] = {
            Model: modelKlass,
            View: viewKlass,
            name: componentName
        };
    };

    SCF.addLoadedComponent = function(resourceType, model, view) {
        if (!SCF.Components[resourceType]) {
            return;
        }
        if (!SCF.loadedComponents[resourceType]) {
            SCF.loadedComponents[resourceType] = {};
        }
        SCF.loadedComponents[resourceType][model.id] = {
            "model": model,
            "view": view
        };
        return SCF.loadedComponents[resourceType][model.id];
    };
    SCF.findTemplate = function(resourceId, templateName, resourceType) {
        if (arguments.length == 2) {
            resourceType = templateName;
            templateName = "";
        }
        var templateKey = resourceType + "/" + templateName;
        if (SCF.templates[templateKey]) {
            return SCF.templates[templateKey];
        }
        var template;
        $CQ.ajax({
            async: false,
            // xhrFields: {
            //  withCredentials: true
            // },
            url: SCF.config.urlRoot + "/services/social/templates" + "?resourceType=" + resourceType + "&ext=hbs&selector=" + templateName
        }).done(function(data, status) {
            if (status == "success") {
                template = Handlebars.compile(data);
                SCF.templates[templateKey] = template;
            }
        });
        return template;
    };

    SCF.log = _logger;

    SCF.registerFieldType = function(fieldType, fieldTypeManager) {
        if (!(_.isFunction(fieldTypeManager.prototype.setValue))) {
            this.log.error("%s does not implement required method, \"setValue\"", fieldType);
            return;
        }
        if (!(_.isFunction(fieldTypeManager.prototype.getValue))) {
            this.log.error("%s does not implement required method, \"getValue\"", fieldType);
            return;
        }
        if (!(_.isFunction(fieldTypeManager.prototype.focus))) {
            this.log.error("%s does not implement required method, \"focus\"", fieldType);
            return;
        }
        if (!(_.isFunction(fieldTypeManager.prototype.destroy))) {
            this.log.error("%s does not implement required method, \"destroy\"", fieldType);
            return;
        }
        this.fieldManagers[fieldType] = fieldTypeManager;
    };

    var DefaultFieldType = function(element, config, model) {
        this.$el = element;
    };

    DefaultFieldType.prototype.setValue = function(val) {
        return this.$el.val(val);
    };
    DefaultFieldType.prototype.getValue = function() {
        return this.$el.val();
    };
    DefaultFieldType.prototype.focus = function() {
        this.$el.focus();
    };
    DefaultFieldType.prototype.destroy = function() {};

    SCF.View.prototype.launchModal = function(element, header, closeCallBack) {
        var modalScreen = $CQ("<div class=\"scf scf-modal-screen\"></div>");
        var modalDialog = $CQ("<div class=\"scf scf-modal-dialog\" style=\"display:none;\">" +
            "<h2 class=\"scf-modal-header\">" + header +
            "</h2><div class=\"scf-modal-close\">X</div></div>");
        var el = element;
        var parent = el.parent();
        modalDialog.append(el);
        el.show();
        var close = function(e) {
            if (SCF.Util.mayCall(e, "preventDefault")) {
                e.preventDefault();
            }
            el.hide();
            parent.append(el);
            modalScreen.remove();
            modalDialog.remove();
            if (_.isFunction(closeCallBack)) {
                closeCallBack();
            }
        };
        modalDialog.find(".scf-modal-close").click(close);
        modalDialog.find(".scf-js-modal-close").click(close);

        $CQ("body").append(modalScreen);
        $CQ("body").append(modalDialog);
        var width = (window.innerWidth - modalDialog.innerWidth()) / 2;
        var height = (window.innerHeight - modalDialog.innerHeight()) / 2;
        modalDialog.css({
            "top": height,
            "left": width
        });
        modalDialog.show();

        return close;
    };
    SCF.View.prototype.overlayTemplate = "<div class=\"scf-overlay\">" +
        "<div class=\"scf-overlay-header btn-toolbar\">" +
        "<button class=\"btn btn-primary scf-ovelay-back-button\" title=\"{{i18n \"Back\"}}\">" +
        "<span class=\"scf-icon-left\"></span>" +
        "</button>" +
        "<h3>{{header}}</h3>" +
        "</div>" +
        "</div>";
    SCF.View.prototype.loadOverlay = function(element, parent, header, closeCallback) {
        var template = Handlebars.compile(this.overlayTemplate);
        var overlay = $CQ(template({
            'header': header
        }));
        var close = function() {
            overlay.remove();
            parent.find(".scf-is-overlay-hidden").each(function() {
                $CQ(this).removeClass("scf-is-overlay-hidden");
            });
            if (closeCallback && _.isFunction(closeCallBack)) {
                closeCallBack();
            }
        };
        parent.children().each(function() {
            $CQ(this).addClass("scf-is-overlay-hidden");
        });
        overlay.append(element);
        parent.append(overlay);
        overlay.find(".scf-ovelay-back-button").click(close);
        return close;
    };
    SCF.View.prototype.errorTemplate = "<h3>{{details.status.message}}</h3>";
    SCF.View.prototype.addErrorMessage = function(element, error) {
        var template = Handlebars.compile(this.errorTemplate);
        var $el = $CQ(element);
        var $errorElement = $CQ(template(error));
        $errorElement.addClass("scf-js-error-message");
        $el.before($errorElement);
    };
    SCF.View.prototype.compileTemplate = function(hbsMarkup) {
        return Handlebars.compile(hbsMarkup);
    };
    SCF.View.prototype.clearErrorMessages = function(element, error) {
        this.$el.find(".scf-js-error-message").remove();
        this.$el.find(".scf-error").removeClass("scf-error");
    };

    SCF.ChildView = SCF.View.extend({
        bindView: function() {},
        bindDataForms: function() {},
        bindDataFields: function() {},
        bindEvents: function() {},
        viewName: "ChildView"
    });

    SCF.Util = {
        // Allows you to pass in an object and see if the funcName is avaiable ot be called,
        // this only does a shallow check for now.
        "mayCall": function(obj, funcName) {
            if (_.isUndefined(obj) || _.isNull(obj)) {
                return false;
            }
            return (obj.hasOwnProperty(funcName) || obj[funcName] !== null) && _.isFunction(obj[funcName]);
        },
        "announce": function(channel, data) {
            $CQ(document).trigger(channel, data);
        },
        "listenTo": function(channel, listener) {
            $CQ(document).on(channel, function(e, data) {
                listener(data);
            });
        },
        "startsWith": function(sourceString, searchString) {
            return sourceString.substr(0, searchString.length) === searchString;
        },
        "getContextPath": function() {
            var URL = CQ.shared.HTTP.getPath();
            var pageExtension = CQ.shared.HTTP.getExtension();
            var urlSplit = URL.split(pageExtension);
            if (urlSplit && urlSplit !== undefined) {
                if (urlSplit.length > 1) {
                    return urlSplit[1];
                } else {
                    return urlSplit[0];
                }
            }
            return "";
        }
    };
    window.SCF = SCF;

})(Backbone, $CQ, _, Handlebars);
