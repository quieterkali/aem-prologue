/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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

(function ($) {
    $.widget("xfaWidget.richTextField", $.xfaWidget.textField, {

        _widgetName : "richTextField",

        _richTextWidget : null,

        getOptionsMap : function () {
            var parentOptionsMap = $.xfaWidget.textField.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "value" : function (val) {
                    if (this._richTextWidget) {
                        this._richTextWidget.setRichTextEditorContent(val);
                    }
                },
                "access" : function (val) {
                    switch (val) {
                        case "open":
                            if (this._richTextWidget) {
                                this._richTextWidget.editor.enable();
                                this._richTextWidget.$toolbar.removeClass("hideToolbar");
                            }
                            break;
                        case "readOnly":
                            if (this._richTextWidget) {
                                this._richTextWidget.editor.disable();
                                this._richTextWidget.$toolbar.addClass("hideToolbar");
                            }
                            break;
                    }
                }
            });
        },

        getEventMap : function () {
            // in case of IE browsers, focus event is delayed, hence adding activate method for content editable
            if (xfalib.ut.XfaUtil.prototype.isIE()) {
                var parentOptionsMap = $.xfaWidget.textField.prototype.getEventMap.apply(this, arguments);
                return $.extend({}, parentOptionsMap, {
                    "activate.richTextField" : xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT
                });
            } else {
                return $.xfaWidget.textField.prototype.getEventMap.apply(this, arguments);
            }
        },

        render : function () {
            var $richTextWidget = this.element.find("div.richTextWidget").eq(0);
            $richTextWidget.children().remove();
            $richTextWidget.append(this.options.value);
            return $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments);
        },

        getCommitValue : function () {
            var value = "";
            if (this._richTextWidget) {
                value = this._richTextWidget.getRichTextEditorContent();
            }
            return value;
        },

        preProcessEnter : function (evnt) {
            $.xfaWidget.textField.prototype.preProcessEnter.apply(this, arguments);
            var $richTextDiv = this.$userControl.find("div.richTextWidget").eq(0);
            if (window.Form === undefined || window.Form.rte === undefined) {
                /* Forms RTE is part of Forms Addon package only. Dont do anything if addon is not installed.*/
                return;
            } else if (this._richTextWidget === null) {
                this._initializeRTEToolbar();
                this._richTextWidget = new window.Form.rte.RichTextEditor({
                    selector : $richTextDiv.attr("id"),
                    toolbar : window.Form.rte.RichTextEditor.AFToolbar,
                    data : this.options.value,
                    locale : $richTextDiv.data("locale")
                });
                var that = this;
                this._richTextWidget.editor.on("blur:composer", function () {
                    that.$userControl.trigger("blur");
                });
            }
        },

        _initializeRTEToolbar : function () {
            window.Form.rte.RichTextEditor.AFToolbar = window.Form.rte.RichTextEditor.AFToolbar || {
                defaultMode : 'basic',
                toolbars : {
                    basic : {
                        layout : [
                            {
                                items : [Form.rte.Commands.HEADER]
                            },
                            {
                                items : [Form.rte.Commands.BOLD, Form.rte.Commands.ITALIC, Form.rte.Commands.UNDERLINE]
                            },
                            {
                                command : 'lists',
                                icon : 'list',
                                type : 'popover',
                                placement : 'bottom',
                                items : [Form.rte.Commands.INSERT_UNORDERED_LIST,
                                    Form.rte.Commands.INSERT_ORDERED_LIST,
                                    Form.rte.Commands.INSERT_LOWERCASE_ALPHABET_LIST]
                            },
                            {
                                title : 'FullScreen',
                                command : Form.rte.Commands.MODE,
                                value : Form.rte.ToolbarMode.FULL,
                                icon : 'resize-full'
                            }
                        ],
                        floating : true
                    },
                    full : {
                        layout : [
                            {
                                items : [Form.rte.Commands.BOLD, Form.rte.Commands.ITALIC, Form.rte.Commands.UNDERLINE]
                            },
                            {
                                items : [Form.rte.Commands.SUPERSCIPT, Form.rte.Commands.SUBSCRIPT]
                            },
                            {
                                items : [
                                    Form.rte.Commands.HEADER, Form.rte.Commands.FONT_FAMILY, Form.rte.Commands.LINE_HEIGHT, Form.rte.Commands.FORE_COLOR, Form.rte.Commands.HILITE_COLOR, Form.rte.Commands.LINK
                                ]
                            },
                            {
                                items : [Form.rte.Commands.INSERT_UNORDERED_LIST, Form.rte.Commands.INSERT_ORDERED_LIST, Form.rte.Commands.INSERT_LOWERCASE_ALPHABET_LIST
                                ]
                            },
                            {
                                title : 'Basic View',
                                command : Form.rte.Commands.MODE,
                                value : Form.rte.ToolbarMode.BASIC,
                                icon : 'resize-small',
                                selected : true
                            }
                        ]
                    }
                }
            };
        }
    });

})($);
