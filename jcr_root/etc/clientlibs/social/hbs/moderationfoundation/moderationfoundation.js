/*
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
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function($) {
    "use strict";

    // @polyfill IE <button type="submit">'s form attribute
    if (navigator.userAgent.match(/.*?(Trident|Edge)/)) {
        $(document).on("click", "button[type=submit]", function(e) {
            var formId = this.getAttribute("form");

            if (formId) {
                e.preventDefault();

                var form = document.getElementById(formId);

                if (form) {
                    var event = document.createEvent("Event");
                    event.initEvent("submit", true, true);
                    form.dispatchEvent(event);
                }
            }
        });
    }

    // @polyfill IE, FF, Chrome, Safari <button type=reset>'s form attribute
    $(document).on("click", "button[type=reset]", function(e) {
        var formId = this.getAttribute("form");
        if (formId) {
            e.preventDefault();

            var form = document.getElementById(formId);
            if (form) {
                // Using `reset()` is the most reliable approach to reset the form.
                // It will trigger cancelable `reset` event, unlike `submit()`.
                // For IE, you have to use `reset()` otherwise the form is not reseted.
                // For other UAs, triggering `reset` event is enough.
                form.reset();
            }
        }
    });

    // @polyfill IE11 ES6 Array.prototype.find
    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisObject) {
            var item;
            Array.prototype.some.call(this, function(v) {
                if (callback.apply(thisObject, arguments)) {
                    item = v;
                    return true;
                }
                return false;
            });
            return item;
        };
    }

    // @polyfill IE11
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
})(Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/

Granite = window.Granite || {};
Granite.UI = Granite.UI || {};
Granite.UI.Foundation = Granite.UI.Foundation || {};

(function(document, $, History) {
    "use strict";

    History.options.transformHash = false; // See GRANITE-3027

    // GRANITE-10247
    // Since there is `cui-contentloaded` event wrapper at coral2.js,
    // we have to skip triggering `foundation-contentloaded` event during document ready to avoid double event.
    // Once we remove Coral2 from the system, then we can use the following code again.
    /*var doc = $(document);
    
    doc.on("ready", function(e) {
        doc.trigger("foundation-contentloaded");
    });*/
})(document, Granite.$, History);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, Granite, $) {
    "use strict";

    Granite.UI.Foundation.Utils = Granite.UI.Foundation.Utils || (function() {
        var existingScripts = [];

        var removeEl = function(newContent, selector, comparator, existings) {
            existings = existings || $(selector);
            var nonExistings = [];

            newContent.find(selector).each(function() {
                var item = this;
                var match = existings.is(function() {
                    return comparator(this, item);
                });

                if (match) {
                    $(item).remove();
                } else {
                    nonExistings.push($(item).detach()[0]);
                }
            });

            return $(nonExistings);
        };

        /**
         * Merge array2 into array1.
         * @ignore
         * 
         * @returns array1
         */
        var mergeScript = function(array1, array2) {
            if (array1.length === 0) {
                Array.prototype.push.apply(array1, array2);
                return array1;
            }

            $.each(array2, function() {
                var a2 = this;
                var match = array1.some(function(a1) {
                    return a1.src === a2.src;
                });

                if (!match) {
                    array1.push(a2);
                }
            });
            return array1;
        };

        /**
         * Includes the given scripts to the head. The script will be included in ordered-async manner.
         * @ignore
         */
        var includeScripts = function(scripts, head) {
            var deferreds = [];

            $.each(scripts, function() {
                var script = this;
                var s = document.createElement("script");

                var deferred = $.Deferred();
                deferreds.push(deferred);

                $(s).one("load error", function() {
                    deferred.resolve();
                });
                s.async = false;
                s.src = script.src;
                head.appendChild(s);
            });

            return $.when.apply(null, deferreds);
        };

        return {
            everyReverse: function(array, callback, thisArg) {
                for (var i = array.length - 1; i >= 0; i--) {
                    if (!callback.call(thisArg, array[i], i, array)) {
                        return false;
                    }
                }
                return true;
            },

            debounce: function(func, wait, immediate) {
                // See http://davidwalsh.name/javascript-debounce-function
                var timeout;

                return function() {
                    var context = this;
                    var args = arguments;
                    var later = function() {
                        timeout = null;

                        if (!immediate) {
                            func.apply(context, args);
                        }
                    };
                    var callNow = immediate && !timeout;

                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);

                    if (callNow) {
                        func.apply(context, args);
                    }
                };
            },

            processHtml: function(html, selector, callback, avoidMovingExisting) {
                var container;
                if (html.jquery) {
                    container = html;
                } else {
                    // jQuery will remove the script if we use $(html) straight away, so use innerHTML to a container instead.
                    // Using a container also handle non single element html string.
                    var div = document.createElement("div");
                    div.innerHTML = html;
                    container = $(div);
                }

                // remove all the script and css files from the new content if they are already loaded

                var remainingScripts = removeEl(container, "script[src]", function(oldEl, newEl) {
                    return oldEl.src === newEl.src;
                }, $(mergeScript(existingScripts, $("script[src]"))));

                var remainingStyles = removeEl(container, "link[rel=stylesheet]", function(oldEl, newEl) {
                    return oldEl.href === newEl.href;
                });

                var head = $("head");

                if (!avoidMovingExisting) {
                    // move existing css files to the head. See GRANITE-2503, GRANITE-2676
                    head.append($("link[rel=stylesheet]", document.body));

                    // initial page may contain scripts in the body, so remove it to prevent double loading when it's content is injected again.
                    $("script[src]", document.body).remove();
                }

                // move all the remaining script and css files to the head. See GRANITE-2498, GRANITE-3642
                var promise = includeScripts(remainingScripts, head[0]);
                head.append(remainingStyles);

                if (callback) {
                    setTimeout(function() {
                        promise.done(callback);
                    }, 0);
                }

                // at this point, no more link[rel=stylesheet] and script[src] in the body


                var content = container.find(selector);

                if (html.jquery) {
                    if (selector) {
                        return content.length ? content : container;
                    } else {
                        return container;
                    }
                } else {
                    if (selector) {
                        return content.length ? content[0].outerHTML : container[0].innerHTML;
                    } else {
                        return container[0].innerHTML;
                    }
                }
            }
        };
    })();
})(window, document, Granite, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    Granite.UI.Foundation.Registry = Granite.UI.Foundation.Registry || (function() {
        var map = new Map();

        return {
            register: function(name, config) {
                if (map.has(name)) {
                    map.get(name).push(config);
                } else {
                    map.set(name, [config]);
                }
            },

            get: function(name) {
                if (map.has(name)) {
                    return map.get(name);
                } else {
                    return [];
                }
            }
        };
    })();

    Granite.UI.Foundation.Registry.register("foundation.adapters", {
        type: "foundation-registry",
        selector: $(window),
        adapter: function() {
            return Granite.UI.Foundation.Registry;
        }
    });
})(window, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(Granite, $) {
    "use strict";

    Granite.UI.Foundation.Adapters = Granite.UI.Foundation.Adapters || (function() {
        var registry = Granite.UI.Foundation.Registry;

        var adapters = function() {
            return registry.get("foundation.adapters");
        };

        return {
            register: function(type, selector, adapter) {
                var config = {
                    type: type,
                    selector: selector,
                    adapter: adapter
                };

                registry.register("foundation.adapters", config);
            },

            has: function(type) {
                return adapters().some(function(config) {
                    return config.type === type;
                });
            },

            get: function(type) {
                var results = [];
                adapters().forEach(function(config) {
                    if (config.type === type) {
                        results.push(config);
                    }
                });

                return results;
            },

            adapt: function(object, type) {
                if (!object || !type) return;

                var $el = $(object);

                var config;
                Granite.UI.Foundation.Utils.everyReverse(adapters(), function(c) {
                    if (c.type === type && $el.is(c.selector)) {
                        config = c;
                        return false;
                    }
                    return true;
                });

                if (!config) return;

                var key = "foundation.adapters.internal.adapters." + config.type;
                var cache = $el.data(key);

                if (cache && cache.config === config) {
                    return cache.instance;
                }

                var instance = config.adapter(object);
                $el.data(key, {
                    config: config,
                    instance: instance
                });

                return instance;
            }
        };
    })();

    $.fn.adaptTo = $.fn.adaptTo || function(type) {
        return Granite.UI.Foundation.Adapters.adapt(this[0], type);
    };
})(Granite, Granite.$);



/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-collection adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-collection",
        selector: ".foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                append: function(items) {
                    collection.append(items);
                    collection.trigger("foundation-contentloaded");
                },

                clear: function() {
                    collection.find(".foundation-collection-item").remove();
                }
            };
        }
    });
})(window, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-selections adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-selections",
        selector: ".foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                count: function() {
                    return collection.find(".foundation-selections-item").length;
                },

                clear: function(suppressEvent) {
                    var length = collection.find(".foundation-selections-item").removeClass("foundation-selections-item").length;

                    if (!suppressEvent && length) {
                        collection.trigger("foundation-selections-change");
                    }

                    return this;
                },

                select: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) return;

                    item.toggleClass("foundation-selections-item", true);
                    collection.trigger("foundation-selections-change");
                },

                deselect: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) return;

                    item.toggleClass("foundation-selections-item", false);
                    collection.trigger("foundation-selections-change");
                }
            };
        }
    });
})(window, Granite.$);


/*
  ADOBE CONFIDENTIAL

  Copyright 2014 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    /**
     * Default implementation of foundation-toggleable adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: ".foundation-toggleable",
        adapter: function(el) {
            var toggleable = $(el);

            return {
                isOpen: function() {
                    return toggleable.attr("hidden") === undefined;
                },

                show: function(anchor) {
                    toggleable.removeAttr("hidden");
                    toggleable.trigger("foundation-toggleable-show");
                },

                hide: function() {
                    toggleable.attr("hidden", "");
                    toggleable.trigger("foundation-toggleable-hide");
                }
            };
        }
    });
})(window, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2014 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, $) {
    "use strict";

    var cache = new Map();

    function resolveToggleable(control) {
        var src = control.data("foundationToggleableControlSrc");
        var targetSelector = control.data("foundationToggleableControlTarget");

        if (src) {
            if (cache.has(src)) {
                var el = cache.get(src);
                el.appendTo(document.body);
                return $.Deferred().resolve(el).promise();
            }

            return $.ajax({
                url: src,
                cache: false
            }).then(function(html) {
                var el = $(html)
                    .on("foundation-toggleable-hide", function(e) {
                        var target = $(e.target);

                        requestAnimationFrame(function() {
                            target.detach();
                        });
                    })
                    .appendTo(document.body)
                    .trigger("foundation-contentloaded");

                cache.set(src, el);
                return el;
            });
        }

        var el;
        if (targetSelector) {
            el = $(targetSelector);
        } else {
            el = control.closest(".foundation-toggleable");
        }

        return $.Deferred().resolve(el).promise();
    }

    $(document).on("click", ".foundation-toggleable-control", function(e) {
        e.preventDefault();
        var control = $(this);

        resolveToggleable(control).then(function(toggleable) {
            var api = toggleable.adaptTo("foundation-toggleable");
            var action = control.data("foundationToggleableControlAction");

            // @coral Workaround: Use rAF here to wait for Coral3 component upgrade
            requestAnimationFrame(function() {
                if (action === undefined) {
                    // Do a toggle
                    if (api.isOpen()) {
                        action = "hide";
                    } else {
                        action = "show";
                    }
                }

                if (action === "show") {
                    if (control.data("foundationToggleableControlNesting") === "hide") {
                        var parentAPI = control.closest(".foundation-toggleable").adaptTo("foundation-toggleable");
                        if (parentAPI) {
                            parentAPI.hide();
                        }
                    }

                    api.show(control[0]);
                } else if (action === "hide") {
                    api.hide();
                }
            });
        });
    });
})(document, Granite.$);

/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".foundation-mode-change", function(e) {
        e.preventDefault();

        var button = $(this);
        var mode = button.data("foundationModeValue");
        var group = button.data("foundationModeGroup");

        button.trigger("foundation-mode-change", [mode, group]);
    });

})(document, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2015 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, $) {
    "use strict";

    $(document).on("foundation-mode-change", function(e, mode, group) {
        $(".foundation-mode-switcher").each(function() {
            var el = $(this);
            var elGroup = el.data("foundationModeSwitcherGroup");

            if (elGroup !== group) return;

            el.children(".foundation-mode-switcher-item").each(function() {
                var item = $(this);
                var itemMode = item.data("foundationModeSwitcherItemMode");
                item.toggleClass("foundation-mode-switcher-item-active", itemMode === mode);
            });
        });
    });
})(document, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(document, window, $) {
    "use strict";

    $(document).on("foundation-mode-change", function(e, mode, group) {
        if (mode !== "default" && mode !== "edit") return;

        $(".foundation-layout-form").each(function() {
            var el = $(this);

            if (group === el.data("foundationModeGroup")) {
                var edit = mode === "edit";
                el.toggleClass("foundation-layout-form-mode-edit", edit).toggleClass("foundation-layout-form-mode-default", !edit);
            }
        });
    });
})(document, window, Granite.$);



/*
  ADOBE CONFIDENTIAL

  Copyright 2015 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, $) {
    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: ".foundation-layout-panel-rail.foundation-toggleable",
        adapter: function(el) {
            var rail = $(el);

            return {
                isOpen: function() {
                    return el.classList.contains("foundation-layout-panel-rail-active");
                },
                show: function(anchor) {
                    el.classList.add("foundation-layout-panel-rail-active");
                    rail.trigger("foundation-toggleable-show");
                },
                hide: function() {
                    el.classList.remove("foundation-layout-panel-rail-active");

                    rail.find("> coral-panelstack > coral-panel.foundation-layout-panel-rail-panel[selected]")
                        .prop("selected", false)
                        .trigger("foundation-toggleable-hide");

                    rail.trigger("foundation-toggleable-hide");
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: "coral-panel.foundation-layout-panel-rail-panel.foundation-toggleable",
        adapter: function(el) {
            var panel = $(el);

            return {
                isOpen: function() {
                    return el.selected && panel.closest(".foundation-layout-panel-rail").adaptTo("foundation-toggleable").isOpen();
                },
                show: function(anchor) {
                    var prevSelectionEl = panel.parent("coral-panelstack")[0].selectedItem;

                    el.selected = true;
                    var rail = panel.closest(".foundation-layout-panel-rail").addClass("foundation-layout-panel-rail-active");

                    if (prevSelectionEl) {
                        $(prevSelectionEl).trigger("foundation-toggleable-hide");
                    }

                    panel.trigger("foundation-toggleable-show");
                    rail.trigger("foundation-toggleable-show");
                },
                hide: function() {
                    el.selected = false;
                    var rail = panel.closest(".foundation-layout-panel-rail").removeClass("foundation-layout-panel-rail-active");

                    panel.trigger("foundation-toggleable-hide");
                    rail.trigger("foundation-toggleable-hide");
                }
            };
        }
    });

    var loadedKey = "foundation-layout-panel-rail-panel.internal.loaded";

    $(document).on("foundation-toggleable-show", "coral-panel.foundation-layout-panel-rail-panel", function(e) {
        var src = this.dataset.foundationLayoutPanelRailPanelSrc;

        if (!src) {
            return;
        }

        var panel = $(this);

        if (panel.data(loadedKey)) {
            return;
        }

        panel.data(loadedKey, true);

        $.ajax({
                url: src,
                cache: false
            }).done(function(html) {
                var parser = $(window).adaptTo("foundation-util-htmlparser");

                parser.parse(html).then(function(fragment) {
                    $(panel[0].content).html("").append(fragment);
                    panel.trigger("foundation-contentloaded");
                });
            })
            .fail(function() {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Something went wrong.");

                var ui = $(window).adaptTo("foundation-ui");
                ui.alert(title, message, "error");
            });
    });
})(window, document, Granite.$);



/*
  ADOBE CONFIDENTIAL

  Copyright 2015 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, document, $) {
    "use strict";

    $(document).on("coral-cyclebutton:change", ".granite-toggleable-control", function(e) {
        var control = $(this);
        var selectedEl = e.originalEvent.detail.selection;

        var action = selectedEl.dataset.graniteToggleableControlAction;

        if (action === "navigate") {
            window.location.href = selectedEl.dataset.graniteToggleableControlHref;
            return;
        }

        var targetSelector = selectedEl.dataset.graniteToggleableControlTarget;

        if (!targetSelector) {
            return;
        }

        var el = $(targetSelector);
        var api = el.adaptTo("foundation-toggleable");

        // @coral Workaround: Use rAF here to wait for Coral3 component upgrade
        requestAnimationFrame(function() {
            if (action === undefined) {
                // Do a toggle
                if (api.isOpen()) {
                    action = "hide";
                } else {
                    action = "show";
                }
            }

            if (action === "show") {
                api.show(control[0]);
            } else if (action === "hide") {
                api.hide();
            }
        });
    });
})(window, document, Granite.$);


/*
 ADOBE CONFIDENTIAL

 Copyright 2016 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

(function(window, document, navigator) {

    // Chrome has a memory leak which can be prevented by clearing the document before leaving the page
    // See also https://code.google.com/p/chromium/issues/detail?id=270000

    var isChrome = window.chrome && /Google/.test(navigator.vendor) && !/OPR|Edge/.test(navigator.userAgent);
    if (isChrome) {
        window.addEventListener('unload', function() {
            document.documentElement.innerHTML = '';
        });
    }

})(window, document, navigator);
