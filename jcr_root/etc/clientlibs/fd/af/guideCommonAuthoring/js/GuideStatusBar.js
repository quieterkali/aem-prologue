/*************************************************************************
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
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

(function (window, $, guidelib, _) {

    var afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window;
    var editorWindow = window._afAuthorHook ? window : parent;

    var $statusbar = null,
        initialized = false,
        $statusBarErrorList = null,
        $counter = null,
        timer = null,
        $content = null,
        visible = true,
        nonAlertMsgCount = 0,
        //CurrentStateMap stores the current xdp elements present in the guide which were dragged and dropped
        //PreviousStateMap store the previous xdp elements present in the guide
        xfaSomMapPrevState = {},
        xfaSomMapCurrentState = {},
        statusBar = guidelib.author.statusBar = {
            init : function (id, syncRequired, updatedAsset) {
                var self = this;
                if (initialized === false) {
                    initialized = true;
                    $statusbar = $(id);
                    $statusBarErrorList = $statusbar.find("ul");
                    $statusbar.find(".close").click(this.hideStatusBar);
                    $statusbar.find(".glyphicon-open").click(this.showStatusBar);
                    $counter = $statusbar.find(".counter");
                    $content = $statusbar.find(".panel-body");
                    timer = setInterval(function () { self.refreshStatusBar(); }, 1000);

                    $(".alert_indicator").on("click", this.showStatusBar)
                                         .data("event_added", true);
                    if (syncRequired) {
                        this.syncRequired = true;
                        this.addSyncMessage(updatedAsset);
                    }
                    this.refreshStatusBar();
                }
            },

            destroy : function () {
                clearInterval(timer);
            },

            addSyncMessage : function (updatedAsset) {
                var updateMessage,
                    rebaseMessage,
                    $spanUpdateMessage,
                    $rebaseMessage,
                    $syncAction,
                    self,
                    $li;

                if (updatedAsset === guidelib.author.AuthorUtils.GUIDE_ASSETS.META_TEMPLATE) {
                    updateMessage = "Document of record template used for form has been modified. Click";
                    rebaseMessage = "to apply changes.";
                } else {
                    updateMessage = "The form template(.xdp) has been modified. Click";
                    rebaseMessage = " to rebase the adaptive form.";
                }

                $spanUpdateMessage = $("<span></span>").text(CQ.I18n.getMessage(updateMessage)),
                $rebaseMessage = $("<span></span>").text(CQ.I18n.getMessage(rebaseMessage)),
                $syncAction = $("<a></a>").text(CQ.I18n.getMessage("here")),
                self = this,
                $li = $("<li></li>").addClass("syncMessage")
                                        .appendTo($statusBarErrorList)
                                        .append($spanUpdateMessage)
                                        .append($syncAction)
                                        .append($rebaseMessage);
                $syncAction.one("click", function () {
                    $li.hide();
                    if (updatedAsset === guidelib.author.AuthorUtils.GUIDE_ASSETS.META_TEMPLATE) {
                        guidelib.author.AuthorUtils.syncGuideBranding();
                    } else {
                        guidelib.author.AuthorUtils.syncGuide();
                    }
                    self.syncRequired = false;
                });
            },

            styleAlertIndicator : function (elem) {
                var $this = $(elem),
                    $parent = $this.parent(),
                    $widget,
                    y,
                    x,
                    positionLeft = false,
                    positionOutside = false;
                if ($parent.is(".guideRadioButtonGroup")) {
                    $widget = $parent.find(".guideRadioButtonGroupItems");
                    positionLeft = true;
                } else if ($parent.is(".guideCheckBoxGroup")) {
                    $widget = $parent.find(".guideCheckBoxGroupItems");
                    positionLeft = true;
                } else if ($parent.is(".guideTextDraw") || $parent.is(".guideAdobeSignBlock")) {
                    positionLeft = true;
                    $widget = $parent;
                } else if ($parent.is(".guideButton")) {
                    $widget = $parent.find(".guideFieldWidget button");
                    positionOutside = true;
                } else {
                    $widget = $parent.find(".guideFieldWidget");
                }
                if ($widget.length) {
                    y = $widget.offset().top - $parent.offset().top;
                    x = $widget.offset().left - $parent.offset().left;
                    if (positionLeft === false) {
                        x += $widget.outerWidth();
                    }
                    /*
                     * positionOutside positionLeft      x           final x
                     *     1             1              x1           x1 - 16
                     *     1             0            x1 + w         x1 + w
                     *     0             0            x1 + w         x1 + w - 16
                     *     0             1              x1             x1
                     *
                     * x1 is the x coordinate of widget and w is its width
                     */
                    // based on the above truth table
                    if (positionOutside === positionLeft) {
                        // 16 is the width of alert-indicator image;
                        x -= 16;
                    }
                    $parent.css("position", "relative");
                    $this.css({"top" : y, "left" : x}).show();
                }
            },

            refreshErrorMessages : function () {
                var self = this,
                    len = afWindow.$(".alert_indicator.guideinvalid_indicator").each(function (index, item) {
                        var guideName =  $(this).data("guide-name"),
                            html = guideName + " : " + $(this).data("guide-error"),
                            $li = $statusBarErrorList.find("li.errorMessage").eq(index);

                        self.styleAlertIndicator(this);

                        if (html) {
                            if (!$(this).data("event_added")) {
                                $(this).click(statusBar.showStatusBar)
                                    .data("event_added", true);
                            }
                            if ($li.length === 0) {
                                $li = $("<li></li>").addClass("errorMessage")
                                                    .appendTo($statusBarErrorList)
                                                    .click(statusBar.focusField);
                            }
                            $li.html(html).attr("tabindex", "-1")
                                .attr("data-xfa-som", $(this).data("xfa-som"))
                                .attr("data-guide-name", guideName)
                                .attr("data-guide-id", $(this).data("guide-id"))
                                .attr("data-guide-path", $(this).data("guide-path"))
                                .show();
                        }
                    }).length;
                $statusBarErrorList.find("li.errorMessage").each(function (index, item) {
                    if (index >= len) {
                        $(this).hide();
                    }
                });
                len = len + nonAlertMsgCount;
                len = this.syncRequired === true ? len + 1 : len;
                $counter.html(len);
                // In touch authoring we use notifiers to show error alert message.
                if (Granite && Granite.author) {
                    if (len > 0) {
                        $(guidelib.touchlib.editLayer.constants.SIDE_PANEL_VIEW_ERRORS_TAB_SELECTOR).show();
                        Granite.author.ui.helpers.notify({
                            content : len == 1 ? Granite.I18n.get("This form has 1 error. Refer the error section on the left side.") :
                                Granite.I18n.get("This form has {0} errors. Refer the error section on the left side.", len),
                            type : Granite.author.ui.helpers.NOTIFICATION_TYPES.ERROR
                        });
                    } else {
                        $(guidelib.touchlib.editLayer.constants.SIDE_PANEL_VIEW_ERRORS_TAB_SELECTOR).hide();
                    }
                }
            },

            refreshSomMaps : function () {
                // Walk through all the data-xfa-som
                afWindow.$("div[data-xdp-som]").each(function (index, item) {
                    var xfaSom = $(this).data("xdp-som");
                    if (!xfaSomMapCurrentState.hasOwnProperty(xfaSom)) {
                        xfaSomMapCurrentState[xfaSom] = true;
                    }
                });

                if ($.isEmptyObject(xfaSomMapPrevState)) {
                    xfaSomMapPrevState = $.extend(true, {}, xfaSomMapCurrentState);
                } else {
                    // Get the intersection of map2 and map1 in map1
                    _.each(xfaSomMapPrevState, function (value, key) {
                        if (xfaSomMapPrevState.hasOwnProperty(key)
                                && !xfaSomMapCurrentState.hasOwnProperty(key)) {
                            //TODO: delete is a costly operator, evaluate it
                            delete xfaSomMapPrevState[key];
                            var selector = "li[data-xdp-som='" + key + "']";
                            parent.$(selector).removeClass("cg-treeview-child-added");
                        }
                    });

                    // add the keys of map2 not present in map1 in map1
                    _.each(xfaSomMapCurrentState, function (value, key) {
                        if (xfaSomMapCurrentState.hasOwnProperty(key)
                                && !xfaSomMapPrevState.hasOwnProperty(key)) {
                            xfaSomMapPrevState[key] = true;
                        }
                    });
                }

                // Get the parent window jquery object and find the attribute
                _.each(xfaSomMapPrevState, function (value, key) {
                    var selector = "li[data-xdp-som='" + key + "']";
                    editorWindow.$(selector).addClass("cg-treeview-child-added");
                });

                // delete xfaSomMapCurrentState object
                xfaSomMapCurrentState = {};
            },

            refreshStatusBar : function () {
                this.refreshErrorMessages();
                this.refreshSomMaps();
            },

            focusField : function () {
                var id = $(this).attr("data-guide-id"),
                    fieldPath = $(this).attr("data-guide-path");
                if (Granite && Granite.author) {
                    var editable = window.guidelib.author.editConfigListeners._getEditable(fieldPath);
                    /* Set the focus on the item whose error is clicked*/
                    guidelib.touchlib.utils.setFocusInsideAFWindow(id);
                    // Invoke the overlay click interactions
                    guidelib.touchlib.editLayer.Interactions.onOverlayClick({
                        editable : editable
                    });
                } else {
                    guidelib.author.AuthorUtils.setAuthoringFocus(id);
                    $("#" + id).find("input,select,textarea,button")[0].focus();
                }
            },

            showStatusBar : function () {
                var $alert = $(this),
                    guideName = $alert.data("guide-name");
                if (!visible) {
                    $content.show();
                    $statusbar.find(".glyphicon-open").hide().end().find(".close").show();
                    visible = true;
                }
                if (guideName) {
                    $statusBarErrorList.find("[data-guide-name=" + guideName + "]")[0].focus();
                }
            },

            hideStatusBar : function () {
                if (visible) {
                    $statusbar.find(".close").hide().end().find(".glyphicon-open").show();
                    $content.hide();
                    visible = false;
                }
            },
            addMessage : function (msg) {
                if (msg && msg.length > 0) {
                    var $spanMessage = $('<span style="display:block;"></span>').html(msg);
                    $("<li></li>").addClass("nonAlertMessage")
                        .prependTo($statusBarErrorList)
                        .append($spanMessage);
                    nonAlertMsgCount++;
                }
            }
        };
}(window, $, guidelib, _));
