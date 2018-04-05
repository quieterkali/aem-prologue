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
//file: bootstrap.js
(function(_, $CQ, Backbone, Handlebars, SCF) {
    "use strict";
    var contextPath = CQ.shared.HTTP.getContextPath();
    SCF.events = SCF.events || {};
    SCF.events.BOOTSTRAP_REQUEST = "scf-bootstrap-request";

    SCF.config.urlRoot = window.location.protocol + "//" + window.location.host;
    if (contextPath !== null && contextPath.length > 0) {
        SCF.config.urlRoot += contextPath;
    }
    var addView = function(component) {
        var model = component.model;
        //If the component type isn't registered do nothing
        if (SCF.Components[component.type]) {
            var templateUsed = component.template ?
                SCF.findTemplate(component.id, component.template, component.type) :
                SCF.findTemplate(component.id, component.type);
            var view = new SCF.Components[component.type].View({
                "model": model,
                el: component.el
            });
            if (component.template) {
                view.template = templateUsed;
            } else {
                SCF.Components[component.type].View.prototype.template = templateUsed;
            }
            view.templateName = component.template || "default";
            view.resource = component.id;
            // Bootstrap was not determining parent views at all which broke updates
            _.each(SCF.loadedComponents, function(typeObject) {
                _.each(typeObject, function(type, id) {
                    if (model.attributes.hasOwnProperty("parentId")) {
                        if (id === model.attributes.parentId) {
                            view.setParent(type.view);
                        }
                    } else if (view._parentView === undefined || view._parentView === null) {
                        // If there isn't a parent ID in the data wire it up via the dom
                        // Search for a parent to this el that is an SCF component, meaning it has
                        // both and ID and a resource type.
                        var $parentEl = view.$el.parents("[data-component-id][data-scf-component]");
                        if ($parentEl && $parentEl.length === 1) {
                            var domParentId = $parentEl.attr("data-component-id");
                            var resourceType = $parentEl.attr("data-scf-component");
                            var parentSCFComponentByResource = SCF.loadedComponents[resourceType];
                            // Check to make sure a component is registered for this type.
                            if (parentSCFComponentByResource !== undefined) {
                                var parentSCFComponent = parentSCFComponentByResource[domParentId];
                                // Make sure the id is registered and it really does have a view.
                                if (parentSCFComponent !== undefined && parentSCFComponent.hasOwnProperty("view")) {
                                    view.setParent(parentSCFComponent.view);
                                }
                            }
                        }
                    }
                });
            });
            if (model.cacheFixed) {
                view.render();
            }
            component.view = view;
        }
    };

    var addModel = function(component) {
        //If the component type isn't registered do nothing
        if (SCF.Components[component.type]) {
            var model;
            var modelHolder = component.modelHolder;
            var ModelKlass = SCF.Components[component.type].Model;
            if (modelHolder.length > 0) {
                var modelText = $CQ(modelHolder[0]).text();
                if (modelText === "") {
                    modelText = modelHolder[0].text;
                }
                var modelJSON = $CQ.parseJSON(modelText);
                component.id = modelJSON.id;
                model = ModelKlass.findLocal(component.id);
                if (!model) {
                    model = SCF.Components[component.type].Model.createLocally(modelJSON);
                }
            } else {
                model = ModelKlass.findLocal(component.id);
                if (!model) {
                    // if we didn't find the model load it based on the ID which is the path to the component.
                    model = SCF.Components[component.type].Model.find(component.id);
                }
            }
            component.model = model;
        }
    };

    // Creates a component based on the scf ID the resource type and an optional template.
    var createComponent = function(id, type, template, $el) {
        // Find the json model on the page.
        var modelHolder = $CQ("script[type='application/json'][id='" + id + "']");
        var component = {
            id: id,
            type: type,
            template: template,
            modelHolder: modelHolder,
            el: $el
        };
        var model = addModel(component);
        var view = addView(component);
        return SCF.addLoadedComponent(type, model, view);
    };
    // A helper method for inspecting a scf component piece of markup and extract some data from it.
    var extractComponentFromElement = function($el) {
        var component = {
            id: $el.attr("data-component-id"),
            type: $el.data("scf-component"),
            template: $el.data("scf-template"),
            modelHolder: $CQ("script[type='application/json'][id='" + $el.attr("data-component-id") + "']"),
            el: $el
        };

        return component;
    };

    var fullBootstrap = function() {
        var $CQcomponents = $CQ("[data-scf-component]");
        var allComponents = [],
            componentsToBoostrap = [];
        // for each component on the page get the meta data.
        $CQcomponents.each(function(idx, el) {
            var component = extractComponentFromElement($(el));
            if (!SCF.loadedComponents[component.type] || !SCF.loadedComponents[component.type][component.id]) {
                componentsToBoostrap.push(component);
            }
            allComponents.push(component);
        });

        // If there were components startup the user model. This gives the user model a bit of head start and reduces flicker on the screen.
        // Allow newly added components to reinvoke the Session model for all the components to ensure
        // The session has alll the component's moderator attributes set correctly. (even thought they
        // live at a page level.)
        if (componentsToBoostrap.length > 0) {
            var options = {};
            options.silent = true;
            options[SCF.LoginModel.moderatorCheckAttribute] = _.map(allComponents, function(item) {
                var dataObj;
                if (item.id.indexOf("/content/usergenerated") === -1) {
                    // If the component itself isn't in usergenerated then we should check it for moderators
                    return item.id;
                }
                try {
                    dataObj = JSON.parse(item.modelHolder.text());
                } catch (e) {
                    // If the component's data can't be turned in JSON just skip it, something
                    // is probably wrong if this is happening.
                    return false;
                }
                if (!(dataObj.hasOwnProperty("sourceComponentId"))) {
                    // If the component doesn't have a sourceComponentId then it's not moderatable,
                    // any tallies for example.
                    return false;
                }
                if (dataObj.sourceComponentId.indexOf("/content/usergenerated") !== -1) {
                    // If the source component is also in user generated then we shouldn't need to check it as the
                    // content parent is where configuration for moderation lives.
                    return false;
                }
                return dataObj.sourceComponentId;

            });
            options[SCF.LoginModel.moderatorCheckAttribute] = _.compact(options[SCF.LoginModel.moderatorCheckAttribute]);
            if (SCF.Session) {
                SCF.Session.getLoggedInUser(options, undefined);
            } else {
                var log = new SCF.LoginModel({}, options);
                SCF.Session = log;
            }
        }


        _.each(componentsToBoostrap, function(component) {
            addModel(component);
        });
        _.each(componentsToBoostrap, function(component) {
            addView(component);
            SCF.addLoadedComponent(component.type, component.model, component.view);
        });
    };

    $CQ(document).ready(fullBootstrap);
    //Sometimes this script could be loaded multiple times
    if (!Backbone.History.started) {
        Backbone.history.start({
            pushState: true,
            hasChange: false
        });
    }
    $(document).on(SCF.events.BOOTSTRAP_REQUEST, fullBootstrap);
    SCF.addComponent = function(el) {
        var $el = $(el);
        if ($el.length === 0) {
            throw "Could not find requested element on page.";
        }
        var component = extractComponentFromElement($el);
        if (component === null) {
            throw "Component is already loaded.";
        }
        if (!component.id) {
            throw "Component does not have a data-component-id attribute, which is required";
        }
        if (!component.type) {
            throw "Component does not have a data-scf-component attribute, which is required.";
        }
        return createComponent(component.id, component.type, component.template, component.el);
    };

    SCF.unloadComponent = function(id, type) {
        var typeList = SCF.loadedComponents[type];
        if (typeList === null) {
            throw "Type " + type + " is not registered with SCF.";
        }
        var component = SCF.loadedComponents[type][id];
        if (component === null || component === undefined) {
            throw "Could not find component with ID: " + id;
        }
        component.view.destroy();
        component.model = null;
        delete SCF.loadedComponents[type][id];
    };
})(_, $CQ, Backbone, Handlebars, SCF);
