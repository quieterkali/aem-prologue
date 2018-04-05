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
(function(Handlebars, moment, SCF, $CQ, _, CQ) {
    "use strict";

    var slingInclude = function(path, templateName, resourceType) {
        var html = "";
        var params = {
            resourcePath: path
        };
        if (resourceType) {
            SCF.log.warn("Forcing resource type is not supported when sling including on the client side");
        }
        if (templateName) {
            params.selector = templateName;
        }
        var urlToFetch = SCF.config.urlRoot + path;
        urlToFetch += templateName ? "." + templateName + ".html" : ".html";
        $CQ.ajax({
            async: false,
            // xhrFields: {
            //  withCredentials: true
            // },
            url: urlToFetch
        }).done(function(data, status) {
            if (status == "success") {
                html = data;
            }
        });
        return new Handlebars.SafeString(html);
    };
    Handlebars.registerHelper("include", function(context, options) {


        if (arguments.length === 1) {
            options = context;
            context = undefined;
        }
        var parentView = options.data.parentView;
        var getModelName = function(viewName) {
            if (!viewName) {
                return undefined;
            }
            var idx = viewName.lastIndexOf("View");
            if (idx !== -1) {
                return viewName.substr(0, idx) + "Model";
            } else {
                return viewName + "Model";
            }
        };
        var bindModelView = _.isUndefined(options.hash.bind) ? true : options.hash.bind;
        var viewName = options.hash.view;
        var templateName = options.hash.template;
        var resourceType = options.hash.resourceType;
        var path = options.hash.path;
        var modelName = options.hash.model || getModelName(viewName);
        var viewObj, modelObj, ViewKlass, ModelKlass, id, component;


        if (_.isObject(context)) {
            resourceType = resourceType || context.resourceType;
            component = SCF.Components[resourceType];
            if ((_.isUndefined(component)) && (resourceType.match(/^(\/apps)|(\/libs)/))) {
                var baseType = resourceType.substring(6);
                component = SCF.Components[baseType];
            }
            var cTemplate;

            id = context.id;
            if (!id) {
                var url = context.url;
                if (!url) {
                    SCF.log.warn("No resource id found for context: ");
                    SCF.log.warn(context);
                }
                var idFromUrl = url.substr(SCF.config.urlRoot.length);
                idFromUrl = idFromUrl.substr(0, idFromUrl.lastIndexOf(SCF.constants.URL_EXT));
                id = idFromUrl;
            }

            if (templateName) {
                cTemplate = SCF.findTemplate(id, templateName, resourceType);
            } else {
                cTemplate = SCF.findTemplate(id, resourceType);
            }

            var getViewKlass = function() {
                //use an SCF.ChildView if the template being included belongs to the same component and rendering the same resource
                if (parentView.model.get("resourceType") === resourceType && parentView.model.id === id) {
                    return SCF.ChildView;
                }
                return component ? component.View : undefined;
            };

            ViewKlass = viewName ? SCF.Views[viewName] : getViewKlass();
            ViewKlass = bindModelView ? ViewKlass : undefined;
            ModelKlass = modelName ? SCF.Models[modelName] : component ? component.Model : undefined;
            ModelKlass = bindModelView ? ModelKlass : undefined;

            if (!ViewKlass && !cTemplate) {
                if (id) {
                    return slingInclude(id, templateName, resourceType);
                }
                SCF.log.error("No view or template found for " + resourceType + " and template " + templateName);
                return "";
            }


            if (!ViewKlass && cTemplate) {
                return new Handlebars.SafeString(cTemplate(SCF.View.prototype.getMergedContexts(context)));
            }


            if (ViewKlass && !cTemplate) {
                SCF.log.error("No template found for " + resourceType + " and template " + templateName);
                return "";
            }

            if (!ModelKlass || !id) {
                viewObj = new ViewKlass({
                    "context": context
                });
            } else {
                modelObj = ModelKlass.findLocal(id);
                if (!modelObj) {
                    modelObj = ModelKlass.createLocally(context);
                }
                if (modelObj.isNew()) {
                    modelObj.load(id);
                }
                viewObj = new ViewKlass({
                    model: modelObj
                });

            }
            if (templateName && cTemplate) {
                viewObj.template = cTemplate;
            } else if (cTemplate) {
                ViewKlass.prototype.template = cTemplate;
            }

        } else {

            var isPathAbsolute = path ? path.slice(0, 1) === "/" : false;
            if (!context && !isPathAbsolute) {
                SCF.log.error("Must provide context path when including " + resourceType);
                return "";
            }

            id = isPathAbsolute ? path : context + "/" + path;

            if (resourceType) {
                component = SCF.Components[resourceType];
            }
            if (bindModelView && (component || (viewName && modelName))) {
                ViewKlass = !component ? SCF.Views[viewName] : component.View;
                ModelKlass = !component ? SCF.Models[modelName] : component.Model;
            }

            if (ViewKlass && ModelKlass) {
                var isUrl = id.indexOf("http://") === 0;
                modelObj = ModelKlass.find(id, undefined, isUrl);
                viewObj = new ViewKlass({
                    "model": modelObj
                });
                if (templateName) {
                    viewObj.template = SCF.findTemplate(id, templateName, resourceType);
                } else if (typeof viewObj.template === "undefined") {
                    SCF.log.info("Getting default template for " + resourceType);
                    viewObj.template = SCF.findTemplate(id, resourceType, resourceType);
                }
            } else {
                return slingInclude(id, templateName, resourceType);
            }
        }
        viewObj.setParent(parentView);
        if (!ViewKlass.prototype.template && viewObj.template && ViewKlass != SCF.ChildView) {
            ViewKlass.prototype.template = SCF.findTemplate(modelObj.get("id"), resourceType);

        }
        viewObj.templateName = templateName || "default";
        viewObj.resource = id;
        return new Handlebars.SafeString("<!-- data-view='" + viewObj.cid + "'-->");
    });

    Handlebars.registerHelper("equals", function(lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper("lastPath", function(context, options) {
        var idx = context.lastIndexOf("/");
        return context.slice(idx + 1);
    });

    Handlebars.registerHelper("pretty-time", function(context, options) {
        if (!context) {
            return "";
        }
        var time = new Date(context);
        var now = new Date();
        var diff = now.getTime() - time.getTime();
        var second = 1000;
        var minute = second * 60;
        var hour = minute * 60;
        var day = hour * 24;
        moment.locale(CQ.shared.I18n.getLocale());
        // max days ago before switching to actual date. If not passed in then hardcoding as 60.
        var days_cutoff = options.hash.daysCutoff ? options.hash.daysCutoff : 60;
        if (diff < minute) {
            time = Math.round(diff / second) + "";
            if (time == 1) {
                return new Handlebars.SafeString(CQ.I18n.get("{0} second ago", time));
            }
            return new Handlebars.SafeString(CQ.I18n.get("{0} seconds ago", time));
        } else if (diff < hour) {
            time = Math.round(diff / minute);
            if (time == 1) {
                return new Handlebars.SafeString(CQ.I18n.get("{0} minute ago", time));
            }
            return new Handlebars.SafeString(CQ.I18n.get("{0} minutes ago", time));
        } else if (diff < day) {
            time = Math.round(diff / hour);
            if (time == 1) {
                return new Handlebars.SafeString(CQ.I18n.get("{0} hour ago", time));
            }
            return new Handlebars.SafeString(CQ.I18n.get("{0} hours ago", time));
        } else if (diff < day * days_cutoff) {
            time = Math.round(diff / day);
            if (time == 1) {
                return new Handlebars.SafeString(CQ.I18n.get("{0} day ago", time));
            }
            return new Handlebars.SafeString(CQ.I18n.get("{0} days ago", time));
        } else {
            return new Handlebars.SafeString(moment(time).format(CQ.I18n.get("MMM DD YYYY, h:mm A", null, "moment.js, communities moderation")));
        }
    });

    Handlebars.registerHelper("pages", function(context, options) {
        var pageInfo = context;

        if (pageInfo.hasOwnProperty("selectedPage") && pageInfo.hasOwnProperty("totalPages") && pageInfo.hasOwnProperty("pageSize") && pageInfo.hasOwnProperty("basePageURL")) {
            var output = "";
            if (pageInfo.totalPages <= 1) {
                return output;
            }
            var pageSize = Math.abs(pageInfo.pageSize);
            var pageSign = (pageInfo.orderReversed) ? "-" : "";
            var currentPage = pageInfo.selectedPage;

            var leftLimit = currentPage;
            if ((leftLimit - 2) > 0 && pageInfo.totalPages > 5) {
                leftLimit = leftLimit - 2;
            }

            if (pageInfo.totalPages <= 5) {
                leftLimit = 1;
            } else {
                if (pageInfo.totalPages - currentPage < 2) {
                    leftLimit = pageInfo.totalPages - 4;
                }
            }
            var rightLimit = leftLimit + 5;
            if (rightLimit > pageInfo.totalPages) {
                rightLimit = pageInfo.totalPages + 1;
            }

            for (var i = leftLimit; i < rightLimit; i++) {
                pageInfo.pageNumber = i;
                pageInfo.currentPageUrl = pageInfo.basePageURL + "." + ((i - 1) * pageSize) + "." + pageSign + pageSize + ".html";
                pageInfo.currentPage = i == pageInfo.selectedPage;
                pageInfo.suffix = ((i - 1) * pageSize) + "." + pageSign + pageSize;
                output += options.fn(pageInfo);
            }
            return output;
        } else {
            return "";
        }
    });

    Handlebars.registerHelper("loadmore", function(context, options) {
        var pageInfo = context.pageInfo;
        var items = context.items;
        if (!context.totalSize || !pageInfo) {
            return "";
        }
        if (!(!_.isUndefined(pageInfo.selectedPage) && context.totalSize && pageInfo.pageSize)) {
            return "";
        }
        if (context.totalSize <= 0) {
            return "";
        }
        var info = {};
        info.suffix = pageInfo.nextSuffix;
        var remaining = this.totalSize;
        if (!_.isUndefined(items)) {
            remaining = remaining - items.length;
        }
        if (remaining === 0) {
            return "";
        }
        var url = pageInfo.nextPageURL;
        if (!_.isUndefined(url) && url.indexOf(".json", url.length - 5) !== -1) {
            url = url.substr(0, url.length - 5);
            url += ".html";
        }
        info.remaining = remaining;
        info.moreURL = url;
        return options.fn(info);
    });

    Handlebars.registerHelper("dateUtil", function(context, options) {
        var date = context;
        var format = options.hash.format;
        var timezone = options.hash.timezone;
        if (!date || typeof date != "number") {
            date = new Date().getTime();
        } else {
            date = new Date(date);
        }
        format = format.replace(/y/g, "Y"); // replace java "yyyy" with moment "YYYY"
        format = format.replace(/\bdd\b/gi, "DD"); // replace java "dd" with moment "DD"
        format = format.replace(/\bd\b/gi, "D"); // replace java "d" with moment "D"
        format = format.replace(/\bEEEE\b/gi, "dddd");
        moment.locale(CQ.shared.I18n.getLocale());

        if (timezone && moment.tz) {
            return new Handlebars.SafeString(moment.tz(date, timezone).format(format));
        }

        return new Handlebars.SafeString(moment(date).format(format));
    });

    Handlebars.registerHelper("i18n", function(context, options) {
        if (arguments.length > 1) {
            var i18nArgs = _.rest(arguments);
            return CQ.I18n.get(context, i18nArgs);
        } else {
            return CQ.I18n.get(context);
        }
    });

    Handlebars.registerHelper("xss-htmlAttr", function(context, options) {
        //encodeForHTMLAttr
        var $div = $CQ("div");
        $div.attr("data-xss", context);
        var cleaned = $div.attr("data-xss");
        return CQ.shared.XSS.getXSSValue(cleaned);
        // if (!context) {
        //     return "";
        // }
        // return new Handlebars.SafeString(context.toString().replace(/\./g, '-'));
    });
    Handlebars.registerHelper("xss-jsString", function(context, options) {
        //encodeForJSString
        return CQ.shared.XSS.getXSSValue(context);
    });
    Handlebars.registerHelper("xss-html", function(context, options) {
        //encodeForHTML
        return $CQ("<div/>").text(context).html();
    });
    Handlebars.registerHelper("xss-validHref", function(context, options) {
        //getValidHref
        return encodeURI(context);
    });
    Handlebars.registerHelper("dom-id", function(context, options) {
        if (!context) {
            return "";
        }
        var domId = $CQ.trim(context);
        domId = domId.replace(/\./g, "-");
        domId = domId.replace(/\//g, "-");
        domId = domId.replace(/:/g, "-");
        return domId;
    });
    Handlebars.registerHelper("abbreviate", function(context, options) {

        if (!context) {
            return "";
        }
        var maxWords = options.hash.maxWords;
        var maxLength = options.hash.maxLength;
        var safeString = options.hash.safeString;
        var ctx = $CQ.trim(context);
        var initialLength = ctx.length;

        var words = ctx.substring(0, maxLength).split(" ");
        var abb = words.slice(0, words.length > maxWords ? maxWords : words.length).join(" ");
        var abbContent = initialLength != abb.length && options.fn ? options.fn(this) : "";
        if (safeString) {
            return new Handlebars.SafeString(abb) + abbContent;
        }
        return abb + abbContent;
    });

    Handlebars.registerHelper("includeClientLib", function(context, options) {
        // This helper only works on the server side.
        return "";
    });

    Handlebars.registerHelper("if-wcm-mode", function(context, options) {
        // This helper only works on the server side.
        return "";
    });

    Handlebars.registerHelper("getContextPath", function(context, options) {
        var contextPath = "";
        if (Granite && Granite.HTTP.getContextPath()) {
            contextPath = Granite.HTTP.getContextPath();
        }
        return contextPath;
    });

})(Handlebars, moment, SCF, $CQ, _, CQ);
