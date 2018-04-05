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
(function ($) {
    var toolbarTemplate = '<div id="codeeditor-toolbar"></div>"',
        toolbarDropDownTemplate = '<label for="event-select"><h6 class="coral-Heading coral-Heading--6">${title}</h6></label>',
        scriptPadTemplate = '<textarea spellcheck="false" ></textarea>',
        scriptDivTemplate = '<div class="scriptarea">' +
            '</div>',
        defaults = {
            codeEditorID : "#codeeditor"
        },
        tabify = function (text, shiftTab) {
            var regex = shiftTab ? /^[\s]{4}/ : /^/,
                replacement = shiftTab ? "" : "    ",
                lines = text.split("\n");
            return {
                text : lines.map(function (line) {
                    return line.replace(regex, replacement);
                }).join("\n"),
                lines : lines.length
            };
        };

    expeditor.CodeEditor = expeditor.Class.extend({
        init : function (options, eeContext) {
            var _options = $.extend({}, defaults, options);
            this.ctx = eeContext;
            this.context = {};
            this.hintOptions = {};
            this.lintOptions = {
                expr : true //Suppress warnings for statements with no assignments and function calls
            };
            this.placeholder = $(_options.codeEditorID);
            this._disabled = _options.disabled;
            if (_options.toolbar) {
                this._addToolbar();
                this.toolbarTypes = {};
                var toolbar = _options.toolbar, toolName, tool;
                for (toolName in toolbar) {
                    if (toolbar.hasOwnProperty(toolName)) {
                        tool = toolbar[toolName];
                        var fnToCreateTool = "_add" + expeditor.Utils.capitalizeFirstCharacter(tool.type);
                        if (typeof this[fnToCreateTool] === "function") {
                            this[fnToCreateTool](tool, toolName);
                            this.toolbarTypes[toolName] = tool.type;
                        } else {
                            console.error("Invalid Configuration");
                        }
                    }
                }
            }
            this._addScriptEditor();
        },

        onScriptModified : function (onScriptModified) {
            if (typeof onScriptModified === "function") {
                this.onScriptModified = onScriptModified;
            }
        },

        setCopyrightHeader : function (copyright) {
            this.copyRightHeader = copyright;
        },

        _addToolbar : function () {
            this.toolbar = $(toolbarTemplate).appendTo(this.placeholder);
            this.toolbarButtons = {};
        },

        updateToolbar : function (toolbar) {
            if (toolbar === undefined) {
                return;
            }
            var toolName, tool, existingTool;
            for (toolName in toolbar) {
                if (toolbar.hasOwnProperty(toolName) && this.toolbarButtons[toolName]) {
                    tool = toolbar[toolName];
                    existingTool = this.toolbarButtons[toolName];
                    var fnToCreateTool = "_update" + expeditor.Utils.capitalizeFirstCharacter(this.toolbarTypes[toolName]);
                    if (typeof this[fnToCreateTool] === "function") {
                        this[fnToCreateTool](tool, existingTool);
                    } else {
                        console.error("Invalid Configuration");
                    }
                }
            }
        },

        setHintOptions : function (hintOptions) {
            this.hintOptions = hintOptions;
            if (this.scriptPad) {
                this.scriptPad.setOption("hintOptions", this.hintOptions);
            }
        },

        getToolbarValue : function (toolName) {
            if (this.toolbarButtons.hasOwnProperty(toolName)) {
                return this.toolbarButtons[toolName].value;
            }
            return null;
        },

        _updateHidden : function (updateConfig, tool) {
            tool.value = updateConfig.value;
            this.setValue("script." + name, updateConfig.value);
        },

        _addHidden : function (config, name) {
            this.toolbarButtons[name] = {
                type : config.type,
                value : config.value
            };
            this.setValue("script." + name, config.value);
        },

        _updateDropdown : function (updateConfig, tool) {
            tool.items.clear();
            var options = updateConfig.options,
                iter = 0;
            if (!(options instanceof Array)) {
                options = [options];
            }
            for (; iter < options.length; iter++) {
                var option = options[iter],
                    value = typeof option === "object" ? option.value : option,
                    display = option.display || value;
                tool.items.add({
                    "value" : value,
                    content : {
                        innerHTML : display
                    }
                });
            }
        },

        _addDropdown : function (config, name) {
            var htmlContent = $(_.template(toolbarDropDownTemplate, {title : Granite.I18n.get(config.title)})),
                select = new Coral.Select().set({
                    name : "Select",
                    placeholder : "Choose an item"
                }),
                options = config.options || [],
                iter = 0;
            select.id = "event-select";
            htmlContent.append(select);
            if (!(options instanceof Array)) {
                options = [options];
            }
            for (; iter < options.length; iter++) {
                var option = options[iter],
                    value = typeof option === "object" ? option.value : option,
                    display = option.display || value;
                select.items.add({
                    value : value,
                    content : {
                        innerHTML : Granite.I18n.get(display)
                    }
                });
            }
            if (options.length > 0) {
                option = options[0];
                value = typeof option === "object" ? option.value : option;
                select.value = value;
                this.setValue("script." + name, value);
            }
            select.on("change", (function (nodeName, self, onChange) {
                return function (evnt) {
                    self.setValue("script." + nodeName, this.value);
                    var listener = expeditor.Utils.getOrElse(onChange, "listener", null);
                    var context = expeditor.Utils.getOrElse(onChange, "context", window);
                    if (typeof listener == "function") {
                        listener.apply(context, [self]);
                    }
                };
            }(name, this, config.onChange)));
            this.toolbarButtons[name] = select;
            htmlContent.appendTo(this.toolbar);
        },

        _addButton : function (config) {

        },

        getValue : function (keyName) {
            return expeditor.Utils.getOrElse(this.context, keyName, null);
        },

        setValue : function (key, value) {
            var keys = key.split("."),
                currentKey = keys.shift(),
                obj = this.context;
            while (keys.length > 0 && typeof obj == "object") {
                if (typeof obj[currentKey] === "undefined") {
                    obj[currentKey] = {};
                }
                obj = obj[currentKey];
                currentKey = keys.shift();
            }
            if (typeof obj === "object") {
                if (typeof obj[currentKey] !== "object") {
                    obj[currentKey] = value;
                    return true;
                }
            }
            return false;
        },

        enableToolbar : function (flag) {
            this.toolbar.toggle(flag);
        },

        _addScriptEditor : function () {
            var self = this;
            var scriptDiv = $(scriptDivTemplate);
            var editButton = expeditor.Utils.getActionBarButton(Granite.I18n.get('Edit Code'), 'edit', 'edit-codeeditor');
            editButton.prop("disabled", this._disabled);
            scriptDiv.append(editButton);
            editButton.click(function (evnt) {
                var message = '<p>' + Granite.I18n.get("A Rule cannot be edited in the Visual Editor after its code has been edited. ") + '</p>',
                    footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Cancel') + '</button>' +
                        '<button id="editcode-button" is="coral-button" variant="primary" coral-close>' + Granite.I18n.get('Edit') + '</button>';
                expeditor.Utils.launchCustomModal("warning", Granite.I18n.get("Edit Code"), message, footer, self.placeholder);
                $("#editcode-button").one('click', function () {
                    var textArea = self.scriptPad;
                    if (self.copyRightHeader) {
                        textArea.setValue(textArea.getValue().replace(self.copyRightHeader, ""));
                    }
                    if (self.onScriptModified) {
                        self.onScriptModified.call(window, self, textArea.getValue());
                    }
                    self.readOnly(false);
                    self.model = self.ctx.createModel("SCRIPTMODEL");
                    self.model.setVersion(expeditor.Utils.getCurrentVersion());
                    self.context.script = self.context.script || {};
                    self.context.script.content = textArea.getValue();
                });
            });
            var options = $.extend({}, CodeMirror.defaults, {
                readOnly : "nocursor",
                mode : {name : "javascript", globalVars : true},
                theme : "default expeditor",
                extraKeys : {
                    "Ctrl-F" : "find",
                    "Alt-F" : "findPersistent",
                    "Ctrl-G" : "findPersistent",
                    "Ctrl-Shift-G" : "findPersistent",
                    "Ctrl-Space" : "autocomplete"
                },
                foldGutter : true,
                gutters : ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
                lineNumbers : true,
                lineWrapping : true,
                autoCloseBrackets : true,
                continueComments : true,
                matchBrackets : true,
                lint : this.lintOptions,
                hintOptions : this.hintOptions
            });
            var scriptPad = $(scriptPadTemplate).appendTo(scriptDiv);
            this.scriptDiv = scriptDiv.appendTo(this.placeholder);
            this.scriptPad = CodeMirror.fromTextArea(scriptPad[0], options);
            this.scriptPad.on("change", function (textarea, event) {
                if (!event || event.origin !== "setValue") {
                    self.context.script.content = textarea.getValue();
                    if (self.onScriptModified) {
                        self.onScriptModified.call(window, self, textarea.getValue());
                    }
                }
            });

            /* To show suggestion whenever the editor text is changed*/
            this.scriptPad.on("inputRead", function (cm, object) {
                if (!cm.state.completionActive && object.text[0].trim() !== "") {
                    CodeMirror.commands.autocomplete(cm);
                }
            });
            this.readOnly(true);
        },

        setScript : function (script) {
            this.scriptPad.setValue(script);
            var that = this;
            setTimeout(function () {
                that.scriptPad.refresh();
            }, 0);
        },

        getModel : function () {
            if (this.model) {
                return this.model.setScript(this.context.script);
            }
            return null;
        },

        setModel : function (model) {
            if (model) {
                if (model.nodeName === "SCRIPTMODEL") {
                    this.model = model.copy();
                    this.context.script = this.model.script;
                    this.readOnly(false);
                }
            }
        },

        /**
         * Makes the Code Editor readonly if flag is set to true
         * If _disabled property is set in code editor, then it doesn't honor the `flag`
         * and always makes the code editor readOnly.
         * @param flag makes the code editor readonly if true, otherwise not.
         */
        readOnly : function (flag) {
            flag = this._disabled || flag;
            this.scriptDiv.find(".edit-codeeditor").toggle(flag);
            this.enableToolbar(!flag);
            if (flag) {
                this.scriptPad.setOption("readOnly", "nocursor");
            } else {
                this.scriptPad.setOption("readOnly", false);
            }
            this.scriptPad.setOption("styleActiveLine", !flag);
            this.scriptPad.setOption("lint", !flag && this.lintOptions);
        },

        show : function (model, transformer, comment, config) {
            if (model === null) {
                model = this.ctx.createModel("SCRIPTMODEL");
            }
            if (model.nodeName === "SCRIPTMODEL") {
                this.model = model.copy();
                this.context.script = this.model.script;
                this.readOnly(false);
            } else if (transformer) {
                transformer.setMode(transformer.CODE_EDITOR_MODE);
                transformer.setAddCopyrightHeader(true);
                if (comment) {
                    transformer.setCopyrightMessage(comment);
                }
                this.setCopyrightHeader(transformer.getCopyrightHeader());
                model.accept(transformer);
                this.context.script = transformer.getScript();
                this.model = null;
                this.readOnly(true);
            }
            for (var btnName in this.toolbarButtons) {
                if (this.toolbarButtons.hasOwnProperty(btnName)) {
                    var btn = this.toolbarButtons[btnName];
                    if (this.toolbarButtons[btnName].type === "hidden") {
                        this.context.script[btnName] = this.toolbarButtons[btnName].value;
                    } else if (this.context.script.hasOwnProperty(btnName)) {
                        btn.value = this.context.script[btnName];
                        if (!_.isEmpty(btn.value) && !_.isEmpty(config)) {
                            this.setValue("script." + btnName, btn.value);
                            var listener = expeditor.Utils.getOrElse(config.toolbar.event.onChange, "listener", null);
                            var context = expeditor.Utils.getOrElse(config.toolbar.event.onChange, "context", window);
                            if (typeof listener == "function") {
                                listener.apply(context, [this]);
                            }
                        }
                    }
                }
            }
            this.setScript(this.context.script.content);
        },

        reset : function () {
            this.scriptPad.setValue("");
            this.model = null;
            this.context = {};
            this.readOnly(true);
        },

        /**
         * Inserts text at current location in code editor
         * when code editor is editable
         */
        insertText : function (text) {
            if (this.scriptPad.getOption('readOnly') === false) {
                this.scriptPad.replaceSelection(text);
                this.scriptPad.focus();
            }
        }
    });
}(jQuery));
