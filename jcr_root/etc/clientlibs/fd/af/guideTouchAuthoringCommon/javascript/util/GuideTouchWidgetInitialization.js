/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
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
 ******************************************************************************/

(function ($, _, author, guidetouchlib, channel, window, undefined) {

    guidetouchlib.utils.initializeWidgets = function ($elem, $) {
        $elem.each(function () {
            var $this = $(this),
                widgetName = $this.attr("data-af-widgetname"),
                isElemInitialized = null;
            if (widgetName) {
                // check if the widget exists in code in content window's jquery
                if ($this[widgetName] != null) {
                    // check if the widget is initialized
                    isElemInitialized = $this.data(widgetName) || $this.data("xfaWidget-" + widgetName);
                    if (!isElemInitialized) {
                        // if not initialized, then initialize it
                        try {
                            var options = $this.data('af-widgetoptions') || {};
                            _.each($this[0].attributes, function (attr) {
                                var nm = attr.name.match(/data-af-widgetoption-([^-]+)$/);
                                if (nm != null && nm.length > 1) {
                                    options[nm[1]] = attr.value;
                                }
                            }, this);
                            $this[widgetName](options);
                        } catch (exception) {
                            if (window.console) {
                                console.log("Unable to parse the initial options of widget " + widgetName +
                                    ". Exception Trace " + exception);
                            }
                        }
                    }
                }
            }
        });
    };

    guidetouchlib.utils.initializeTable = function ($elem, $) {
        $elem.each(function () {
            var $tableElement = $(this),
                headerText = null;
            if (!$tableElement.data("isTouchInitialized")) {
                $tableElement.find("tr td").each(function () {
                    // get the headers associated with cell
                    // note: we always use the first header in mobile layout
                    headerText = $(this).attr("headers");
                    if (headerText != null) {
                        var headerId = headerText.split(" ")[0],
                        // get the header
                            $firstHeader = $tableElement.find("#" + headerId);
                        $(this).attr("guide-data-header", $.trim($firstHeader.text()));
                    }
                });
                $tableElement.data("isTouchInitialized", true);
            }
        });
    };

    function _initializeWidgetInTouch() {
        channel.on("cq-overlays-repositioned.widgets", function () {
            requestAnimationFrame(function () {
                var w = $("iframe")[0].contentWindow;
                if (w.$ != null) {
                    guidetouchlib.utils.initializeWidgets(w.$('[data-af-widgetname]'), w.$);
                    guidetouchlib.utils.initializeTable(w.$('.guideTableNode > table'), w.$);
                }
            });
        });
    }

    // lets tell the edit layer to initialize this on setup and tear it during switch of layers
    guidetouchlib.initializers.initializeWidgetsInTouch = {
        setUp : function () {
            _initializeWidgetInTouch();
        },

        destroy : function () {
            channel.off("cq-overlays-repositioned.widgets");
        }
    };
}(jQuery, _, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
