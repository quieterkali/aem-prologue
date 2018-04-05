/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
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
 */
(function ($, ns, document, guidetouchlib, undefined) {

    var utils = guidetouchlib.editLayer.dialogUtils,
        guideEditLayerConstants = guidetouchlib.editLayer.dialogUtils.constants,
        authorUtils = guidelib.author.AuthorUtils,
        dateDisplayPattern = [],
        expressionContent = "with(this) {" +
                        "\n\t\t var _guide_result = eval(\"${expression}\");" +
                        "\n\t\t return _guide_result ;" +
                        "\n\t };";

    //Function to show the coral3 based granite component
    /**
     * Here we can have 3 types of dialogs.
     * 1. A full fledged cq dialog with an editable associated with it as well as an action i.e. path to post the data. General treatment
     * 2. A cq dialog with no editable associated with it and no path to post the data. Setting such dialogs as independentDialog
     * 3. A sub dialog where only cq-dialog-content as well as guide-dialog class is present. Setting such dialogs as subDialog
     * @param $form
     * @returns {*}
     */
    guidetouchlib.editLayer.dialogUtils.getCurrentDialog = function ($form) {

        if ($form.get(0).tagName && $form.get(0).tagName === "FORM") {
            var currentDialogPath = $form.attr("action");
            if (currentDialogPath != null && currentDialogPath != undefined && ns.DialogFrame.currentDialog != null) {
                var currentDialogEditable = ns.DialogFrame.currentDialog.editable;

                if (currentDialogEditable != undefined) {
                    return {
                        editable : {
                            type : currentDialogEditable.type,
                            path : currentDialogEditable.path
                        }
                    };
                } else {
                    // it is dorProperties dialog
                    return {
                        editable : {
                            type : "fd/af/authoring/components/dor/dorProperties",
                            path : ns.ContentFrame.contentURL.replace("html", "") + "/jcr:content/guideContainer/view/print"
                        }
                    };
                }
            } else {
                return {
                    editable : {
                        type : "independentDialog",
                        path : "independentDialog"
                    }
                };
            }
        } else if ($($form.get(0)).hasClass("cq-dialog-content guide-dialog")) {
            return {
                editable : {
                    type : "subDialog",
                    path : "subDialog"
                }
            };
        }
    };

    /**
     * API to select the coral 3 based granite component
     * @param {String} tag                          name of the coral3 tag
     * @param {String} selectorValue                name of the coral 3 based granite component
     * @param {Boolean} [bStartsWith=false]         use the starts with selector when true
     * @param {Boolean} [bWithoutTypeHint=false]    exclude the typeHint from name if true
     * @returns {Object}    Jquery element wrapping the component specified by the selector value
     */
    guidetouchlib.editLayer.dialogUtils.selectElement = function (tag, selectorValue, bStartsWith, bWithoutTypeHint) {
        var $element = null;
        if (bStartsWith) {
            $element = $(tag + "[name^='" + selectorValue + "']");
        } else {
            $element = $(tag + "[name='" + selectorValue + "']");
        }
        if (bWithoutTypeHint) {
            $element = $element.not("[name$='@TypeHint']");
        }
        return $element;
    };

    //Function to show the coral 3 based granite component
    guidetouchlib.editLayer.dialogUtils.showGraniteComponent = function (elem, parentWrapper) {
        var parentTag = $(elem).closest(parentWrapper);
        if ($(parentTag).is("[hidden]")) {
            //jquery based show
            $(parentTag).removeAttr("hidden");
        } else {
            //coral3 api based show
            parentTag.show();
        }
    };

    //Function to hide guide component
    guidetouchlib.editLayer.dialogUtils.hideGraniteComponent = function (elem, parentWrapper) {
        var parentTag = $(elem).closest(parentWrapper); // elem is not jQuery object
        $(parentTag).attr("hidden", "");
    };

    //Function to trigger coral-component:attached event for first time load and reposition tooltip
    guidetouchlib.editLayer.dialogUtils.performInitialDialogModifications = function (dialogType) {
        var dialogWidth = $(guideEditLayerConstants.DIALOG_CLASS_SELECTOR).width() - 50;

        var sidePanel = $(guidetouchlib.editLayer.dialogUtils.constants.TOUCH_SIDE_PANEL_SELECTOR);

        if (sidePanel != null && sidePanel.length > 0 && sidePanel[0].children.length != 0) {
            //Repositioning tooltip moving beyond dialog to left side.
            $(guideEditLayerConstants.CORAL_TOOLTIP).on("coral-overlay:positioned", function (e) {
                $(guideEditLayerConstants.CORAL_TOOLTIP).each(function (i, el) {

                    if ($(el).position().left > dialogWidth || $(el).closest(guideEditLayerConstants.SECTION_FIELDSET).length) {
                        $(el)[0].placement = Coral.Overlay.placement.LEFT;
                        $(el).addClass('afRepostionOverlay');
                        $(el).removeClass(guideEditLayerConstants.CORAL_TOOLTIP_ARROW_RIGHT);
                    }
                });
            });
        }

        //Attaching click event listener on coral-tooltip to avoid the problem of its retention on UI when user clicks on tooltip.
        $(document).on('click', guideEditLayerConstants.CORAL_TOOLTIP, function (e) {
            e.stopPropagation();
            $(this).hide();
        });
    };

    guidetouchlib.editLayer.dialogUtils.getExpression = function (expression) {
        if (expression) {
            try {
                // evaluating the expression/ script entered and transforming it into executable format
                var content = expressionContent.replace(/\${expression}/g, expression.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/(?:\r\n|\r|\n)/g, " "));
                return new Function(content);
            } catch (exception) {
                if (console) {
                    console.log("AF", "Error in compiling expression:" + expression);
                }
            }
        }
    };

    guidetouchlib.editLayer.dialogUtils.getKey = function (event, tagName, name, dialogType) {
        var key = dialogType + "~" + event + "~" + tagName + "[name='" + name + "']";
        return key;
    };

    /*Function to scan dialog data properties and based on af.listeners property to register function based on event*/
    guidetouchlib.editLayer.dialogUtils.registerGenericDynamicEvents = function ($container, dialogType) {
        var eventListenerMap = {};
        //Scan for coral elements having af.listners data property
        $container.find("*").filter(function () {
            for (var property in $(this).data()) {
                if (property.indexOf('af.listeners') == 0) {
                    var event = property.split(".")[2],
                        name = $(this).attr("name"),
                        tagName = $(this).prop("tagName"),
                        tagSelector = tagName + "[name='" + name + "']",
                        key;

                    key = utils.getKey(event, tagName, name, dialogType);

                    //Converting the dynamic behaviour functions and saving in map
                    eventListenerMap[key] = utils.getExpression($(this).data(property));

                    try {
                        if (event === "onload") {
                            var keyName = utils.getKey("onload", tagName, name, dialogType);
                            if (typeof eventListenerMap[keyName] != 'undefined') {
                                Coral.commons.ready($(guidetouchlib.editLayer.dialogUtils.constants.TOUCH_SIDE_PANEL_SELECTOR)[0], function () {
                                    eventListenerMap[keyName].apply(window);
                                });
                            }
                        } else {
                            //everything except onload
                            $(this).off(event, guidetouchlib.editLayer.dialogUtils.applyChangeDynamicEvent)
                                .on(event, {
                                    tagName : tagName,
                                    name : name,
                                    dialogType : dialogType,
                                    eventListenerMap : eventListenerMap,
                                    key : key
                                }, guidetouchlib.editLayer.dialogUtils.applyChangeDynamicEvent);
                        }
                    } catch (error) {
                        if (window.console) {
                            console.log(error);
                        }
                    }
                }
            }
        });
    };

    /**
     * Gets Authoring config json of the field whose properties dialog is open.
     * @return a json object of data-authoringconfigjson value
     */
    guidetouchlib.editLayer.dialogUtils.getCurrentAuthoringConfigJson = function () {
        var currentDialog = ns.DialogFrame.currentDialog;
        if (currentDialog && currentDialog.editable && currentDialog.editable.path) {
            return window._afAuthorHook._getAfWindow()
                       .$("#" + authorUtils.getHtmlId(currentDialog.editable.path))
                       .data("guide-authoringconfigjson");
        }
    };

    guidetouchlib.editLayer.dialogUtils.applyChangeDynamicEvent = function (e) {
        //Applying the listener function for dynamic behaviour.
        var key = utils.getKey(e.type, e.data.tagName, e.data.name, e.data.dialogType);
        if (typeof e.data.eventListenerMap[e.data.key] != 'undefined') {
            e.data.eventListenerMap[e.data.key].apply(window);
        }
    };

}(jQuery, Granite.author, document, window.guidelib.touchlib, this));
