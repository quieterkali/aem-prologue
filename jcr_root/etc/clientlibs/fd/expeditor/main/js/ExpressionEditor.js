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
(function ($, graniteJquery, document) {
    var eeContext,
        codeEditor,
        treeComponent,
        summaryTreeComponent,
        functionsComponent,
        summaryView,
        rbScope,
        currentComponent,
        ruleTitle = "",
        defaults,
        clipBoard,
        lastRuleMode,
        supportedEvents,
        functionsDefaults = {
            objectPanel : '#functionsPanel',
            objectTree : '#functionsTree'
        },
        editableRootNodePos = -1,
        oldScriptContents = null,
        mode,
        navigationTreeDefaults = {
            objectPanel : '#objectNavigationPanel',
            objectTree : '#objectNavigationTree',
            searchKey : ["displayName", "type", "name"],
            showStatus : true
        },
        ruleBuilderDisabledTemplate = '<div style="text-align:center;">' +
            '<div>' +
            Granite.I18n.get('The Visual Editor is disabled because you modified the rule in the Code Editor.') +
            '</div>' +
            '<div>' +
            Granite.I18n.get('To enable it again, clear the rule from the Code Editor and switch to the Visual Editor.') +
            '</div>' +
            '</div>',
        getLocalStorageValue = function (cookieName) {
            var cookieRegex = new RegExp("(?:(?:^|.*;\\s*)" + cookieName + "\\s*\\=\\s*([^;]*).*$)|^.*$");
            return document.cookie.replace(cookieRegex, "$1");
        },
        setLocalStorageValue = function (key, value) {
            if (typeof key === "string" && key.length > 0 &&
                typeof value === "string" && value.length > 0) {
                document.cookie = (key + "=" + value);
            }
        };
    expeditor.ExpressionEditor = expeditor.EventTarget.extend({
        _codeEditorEnabled : function () {
            return !(expeditor.Utils.getOrElse(this, "options.codeEditorConfig.disabled", false));
        },
        _getCurrentComponent : function () {
            return currentComponent;
        },

        _getTreeComponent : function () {
            return treeComponent;
        },

        getContext : function () {
            return eeContext;
        },

        _getCodeEditor : function () {
            return codeEditor;
        },

        getMode : function () {
            return mode;
        },

        writeScript : function (txt) {
            this._getCodeEditor().insertText(txt);
        },

        _getLastRuleMode : function () {
            return lastRuleMode;
        },

        _setLastRuleMode : function (mode) {
            lastRuleMode = mode;
            setLocalStorageValue(this.options.useLocalStorageForDefaultMode, "" + mode);
        },

        init : function (options) {
            // adaptTo is part of Granite.$.fn.adaptTo
            // in case of classic authoring, since everything is in customer frame and there can be a custom jquery loaded by customer
            // Hence, explicitly using the namespaced jquery
            clipBoard = graniteJquery(window).adaptTo("foundation-clipboard");
            this.options = $.extend({}, defaults, options);
            var treeConfig;
            if (typeof this.options.treeConfig === "object") {
                this.options.treeConfig.draggable = true;
                this.options.treeConfig.nodeType = 'COMPONENT';
                treeComponent = new expeditor.component.TreeComponent(this.options.treeConfig, this);
                $("#exp-toggle-sidepanel-button, #exp-toggle-navigationpanel-button").on('click', function () {
                    $($(this).data("target")).toggleClass('is-closed');
                    $(this).toggleClass("active");
                });
                treeComponent.bind("modelloaded", function (e, model) {
                    if (!rbScope) {
                        rbScope = new expeditor.rb.RBScope({
                            varStorage : this.options.variableStorage
                        });
                        rbScope.addTypes(this.options.typesConfig || {});
                    } else {
                        rbScope.clearVars();
                    }
                    rbScope.addVars(model.getFlatModel());
                    eeContext.setScope(rbScope);
                    if (typeof this.options.onTreeModelLoad === 'function') {
                        this.options.onTreeModelLoad.apply(this, [model]);
                    }
                    this.trigger("load");
                }, this);
            }
            if (typeof this.options.navigationTreeConfig === 'object') {
                var _options = $.extend({}, navigationTreeDefaults, this.options.navigationTreeConfig);
                summaryTreeComponent = new expeditor.component.TreeComponent(_options, this);
            }
            if (typeof this.options.functionsConfig === "object") {
                this.options.functionsConfig = $.extend({}, functionsDefaults, this.options.functionsConfig);
                this.options.functionsConfig.nodeType = 'FUNCTION_CALL';
                functionsComponent = new expeditor.component.TreeListComponent(this.options.functionsConfig, this);
                functionsComponent.bind("modelloaded", function (e, model) {
                    if (!rbScope) {
                        rbScope = new expeditor.rb.RBScope({
                            varStorage : this.options.variableStorage
                        });
                        rbScope.addTypes(this.options.typesConfig || {});
                    }
                    rbScope.addFunctions(model.getFlatModel());
                    eeContext.setScope(rbScope);
                    this.trigger("load");
                }, this);
            }
            $("#codeeditor").children().remove();
            eeContext = new expeditor.ExpEditorContext(this.options.config,null,this.options.webServicesConfig);
            this.options.transformer.setContext(eeContext);
            summaryView = new expeditor.SummaryView('#rule-summary');
            summaryView.bind('change:selection', this._selectionChanged, this);
            summaryView.bind('change:delete', this._handleRuleDeletion, this);
            summaryView.bind("change:edit", this._editRuleButtonClicked, this);

            codeEditor = new expeditor.CodeEditor(this.options.codeEditorConfig, eeContext);
            supportedEvents = expeditor.Utils.getOrElse(this, "options.codeEditorConfig.toolbar.event.options" , null);
            codeEditor.setCopyrightHeader(this.options.transformer.getCopyrightHeader());
            var self = this;
            codeEditor.onScriptModified(function (ce, script) {
                if (script.trim() === "") {
                    self._setRuleBuilderEnabled(true);
                } else {
                    self._setRuleBuilderEnabled(false);
                }
            });
            if (typeof this.options.summaryTransformer === "function") {
                this.summaryTransformer = new this.options.summaryTransformer(eeContext);
            }
            treeComponent.render();
            summaryTreeComponent.render();
            $('#save-reorder-button').hide();
            $('#close-reorder-button').hide();
            $('#save-reorder-button').on('click', $.proxy(this._reorderRuleSave, this));
            $('#close-reorder-button').on('click', $.proxy(this._reorderRuleCancel, this));
            $('#edit-rule-button').on('click', $.proxy(this._editRuleButtonClicked, this));
            $('#copy-rule-button').on('click', $.proxy(this._copyRuleButtonClicked, this));
            $('#paste-rule-button').on('click', $.proxy(this._pasteRuleButtonClicked, this));
            $('#delete-rule-button').on('click', $.proxy(this._deleteRule, this));
            $('#disable-rule-button').on('click', $.proxy(this._enableOrDisableRule, this, false));
            $('#enable-rule-button').on('click', $.proxy(this._enableOrDisableRule, this, true));
            $('#create-rule-button').on('click', $.proxy(this._createNewRule, this));
            $('#reorder-rule-button').on('click', $.proxy(this._reorderRule, this));
            $('.exp-Cancel-Button').on('click', $.proxy(this._cancelClicked, this));
            $('.exp-Save-Button').on('click', $.proxy(this._saveClicked, this));
            $('.exp-Close-Button').on('click', $.proxy(this._closeClicked, this));
            $('.exp-Help-Button').on('click', $.proxy(this.launchHelpTour, this));
            $('.launch-code-editor').on('click',
                $.proxy(this._toggleEditorTabs, this, expeditor.ExpressionEditor.CODE_EDITOR));
            $('.launch-visual-editor').on('click',
                $.proxy(this._toggleEditorTabs, this, expeditor.ExpressionEditor.VISUAL_EDITOR));
            this._initializeResizableSidePanel();
            var defaultMode = +this.options.defaultMode;
            if (typeof this.options.useLocalStorageForDefaultMode === "string" &&
                this.options.useLocalStorageForDefaultMode.length > 0) {
                var cookieValue = getLocalStorageValue(this.options.useLocalStorageForDefaultMode);
                if (cookieValue.length > 0) {
                    defaultMode = +cookieValue;
                }
            }
            this._setLastRuleMode(defaultMode);

        },

        _toggleEditorTabs : function (nMode) {
            var iconIndex = nMode === expeditor.ExpressionEditor.CODE_EDITOR ? 1 : 0,
                icons = $(".rulebuilder-tabs > .editor-toolbar-icon"),
                iconToShow = icons.eq(iconIndex),
                iconToHide = icons.eq(1 - iconIndex);
            mode = nMode;

            iconToShow.show();
            iconToHide.hide();
            if (mode === expeditor.ExpressionEditor.CODE_EDITOR) {
                this._showCodeEditor();
            }
            $(".rulebuilder-pane").toggle(mode === expeditor.ExpressionEditor.VISUAL_EDITOR);
            $(".codeeditor-pane").toggle(mode === expeditor.ExpressionEditor.CODE_EDITOR);
            $("#expeditor-Popover").hide();
        },

        updateCodeEditorToolbar : function (toolbarConfig) {
            codeEditor.updateToolbar(toolbarConfig);
            supportedEvents = toolbarConfig.event.options;

        },

        setCodeEditorHintOptions : function (object) {
            codeEditor.setHintOptions(object);
        },

        _initializeResizableSidePanel : function () {
            var resizeEl = $("#resize-sidepanel"),
                container = $(".exp-sidepanel, .summaryviewtree");

            var startX, startWidth;

            var doDrag = function (e) {
                    container.width((startWidth + e.clientX - startX) + 'px');
                },
                stopDrag = function () {
                    $(document).off("mousemove.expeditor");
                    $(document).off("mouseup.expeditor");
                };

            resizeEl.on('mousedown', function (e) {
                startX = e.clientX;
                startWidth = container.width();
                $(document).on('mousemove.expeditor', doDrag);
                $(document).on('mouseup.expeditor', stopDrag);
            });

        },

        updateHandlers : function (options) {
            if (typeof options === "object" && options !== null) {
                if (options.saveHandler) {
                    this.options.saveHandler = options.saveHandler;
                }
                if (options.launchHelpHandler) {
                    this.options.launchHelpHandler = options.launchHelpHandler;
                }
                if (options.onTreeModelLoad) {
                    this.options.onTreeModelLoad = options.onTreeModelLoad;
                }
                if (options.treeConfig) {
                    this.options.treeConfig = $.extend({}, this.options.treeConfig, options.treeConfig);
                    treeComponent.setConfig(this.options.treeConfig);
                }
                if (options.navigationTreeConfig) {
                    this.options.navigationTreeConfig = $.extend({}, this.options.navigationTreeConfig, options.navigationTreeConfig);
                    summaryTreeComponent.setConfig(this.options.navigationTreeConfig);
                }
                if (options.functionsConfig) {
                    this.options.functionsConfig = $.extend({}, this.options.functionsConfig, options.functionsConfig);
                    functionsComponent.setConfig(this.options.functionsConfig);
                }
            }
        },

        updateTitle : function (path, title) {
            //Trim and remove '/' from the very end if any.
            var path = path.trim().replace(/\/$/, "");
            $(".exp-main-heading > span").text(path);
            ruleTitle = title;
        },

        updateInfoBar : function (description) {
            var descEl = $("#expeditor-info-bar");
            descEl.show();
            descEl.children("span").html(description);
        },

        _handleRuleDeletion : function (e, data) {
            var deletedRules = data.deletedRules;
            if (deletedRules && deletedRules.length > 0) {
                for (var i = 0; i < deletedRules.length; i++) {
                    // assuming deletedRules is sorted
                    this.listModel.remove(deletedRules[i] - i);
                }
                if (typeof this.options.saveHandler === "function") {
                    this.options.saveHandler();
                }
                this._writeSummary(this._getSummary(this.listModel), false);
            }
        },

        _updateRulesOrder : function (data) {
            var newItems = [];
            for (var i = 0; i < data.indices.length; i++) {
                newItems.push(this.listModel.get(data.indices[i]));
            }
            this.listModel.clear();
            this.listModel.setItems(newItems);
            this._writeSummary(this._getSummary(this.listModel), false);
            if (typeof this.options.saveHandler === "function") {
                this.options.saveHandler();
            }
        },

        _selectionChanged : function (e, data) {
            var selectedIndices = data.selectedIndices;
            var anyScriptSelected = selectedIndices.some(function (n) {
                var model = this.listModel.get(n);
                return model.nodeName == 'SCRIPTMODEL';
            }, this);

            // hide buttons when code editor is disabled and
            // at least one script is selected
            var showButtons = this._codeEditorEnabled() || !anyScriptSelected;

            var showDeleteButton = data.selections >= 1 && showButtons;
            var showEditButton = data.selections == 1 && showButtons;
            var showCopyButton = data.selections == 1 && showButtons;
            var showCreateButton = data.selections == 0;
            var showReorderButton = data.selections == 0;

            $('#delete-rule-button').toggleClass('hide-button', !showDeleteButton);
            $('#edit-rule-button').toggleClass('hide-button', !showEditButton);
            $('#copy-rule-button').toggleClass('hide-button', !showCopyButton);
            $('#reorder-rule-button').toggleClass('hide-button', !showCreateButton);
            $('#create-rule-button').toggleClass('hide-button', !showReorderButton);
            var enabled = expeditor.Utils.getOrElse(data, "selectedItems.0.dataset.enabled", null);
            var showDisableButton = (data.selections === 1 && enabled === "true" || data.selections > 1) && showButtons;
            var showEnableButton = (data.selections === 1 && enabled === "false" || data.selections > 1) && showButtons;
            $('#disable-rule-button').toggleClass('hide-button', !showDisableButton);
            $('#enable-rule-button').toggleClass('hide-button', !showEnableButton);
        },

        _copyRuleButtonClicked : function (e, data) {
            var rowIndex = summaryView.getSelectedRuleIndex()[0];
            var modelToCopy = this.listModel.get(rowIndex);
            clipBoard.set("expeditor-modelcopy", modelToCopy.toJson());
            summaryView.clearSelection();
            editableRootNodePos = -1;
            $("#paste-rule-button").show();
        },

        _pasteRuleButtonClicked : function (e, data) {
            var modelJson = clipBoard.get("expeditor-modelcopy");
            var model = expeditor.Utils.ModelFactory.fromJson(modelJson, eeContext);
            if (model.nodeName === 'SCRIPTMODEL') {
                model.script.field = codeEditor.getToolbarValue("field");
            }
            this.listModel.add(model);
            var summary = this._getSummary(this.listModel);
            if (summary != null) {
                this._writeSummary(summary);
            }
            editableRootNodePos = -1;
            if (typeof this.options.saveHandler === "function") {
                this.options.saveHandler(model);
            }
        },

        _editRuleButtonClicked : function (e, data) {
            if (data && data.index != null) {
                editableRootNodePos = data.index;
            } else {
                editableRootNodePos = summaryView.getSelectedRuleIndex()[0];
            }
            var listItems = summaryView.listView.items.getAll(),
                selectedItem = listItems[editableRootNodePos],
                modelToEdit = this.listModel.get(editableRootNodePos);

            oldScriptContents = expeditor.Utils.getOrElse(modelToEdit, "script.content", null);
            $(".exp-editmode-heading").text(selectedItem.title);
            this._showRule(modelToEdit);
        },

        _deleteRule : function (e) {
            summaryView.deleteRule();
        },

        _enableOrDisableRule : function (enable) {
            var selectedItemsIndex = summaryView.getSelectedRuleIndex();
            var listModel = this.listModel;
            if (selectedItemsIndex) {
                selectedItemsIndex.forEach(function (index) {
                    var ruleModel = listModel.get(index);
                    if (ruleModel.getIsValid()) {
                        ruleModel.setEnabled(enable);
                    }
                });
                if (typeof this.options.saveHandler === "function") {
                    this.options.saveHandler();
                }
                this._writeSummary(this._getSummary(this.listModel), false);
            }
        },

        _closeClicked : function (e) {
            if (typeof this.options.closeHandler === "function") {
                this.options.closeHandler();
            }
            $(window).off('resize', this.onWindowResize);
        },

        launchHelpTour : function () {
            if (typeof this.options.launchHelpHandler === "function") {
                this.options.launchHelpHandler(true);
            }
        },

        _setEditMode : function (editMode) {
            $('#exp-main-container').toggleClass('exp-mode-edit', editMode);
            $(".expeditor-header").toggleClass('coral--dark', !editMode);
            $("#expeditor-controls").toggleClass('coral--dark', !editMode);
        },

        /**
         * Returns the html summary content. The arguments are not used now, but are
         * kept for future use. We can optimize to generate part of summary for
         * add cases
         * @param model
         * @param noReset
         * @returns {*}
         * @private
         */
        _getSummary : function (model, noReset) {

            if (this.listModel) {
                if (noReset !== true) {
                    // need to create a new transformer, since it keeps a counter
                    // globally and we need to reset that counter
                    this.summaryTransformer = new this.options.summaryTransformer(eeContext);
                }
                this.summaryTransformer.setMode(this.summaryTransformer.HTML_MODE);
                var self = this;
                // appending the script inside RULES, so as to prevent any modifications
                // in the SummaryView for now
                var summary = this.listModel.items.map(function (model) {
                    model.copy().accept(self.summaryTransformer);
                    return self.summaryTransformer.getScript();
                });
                // summary += "</div>";
                return summary;
            }
            return null;
        },

        _writeSummary : function (summary) {
            $('#edit-rule-button').addClass('hide-button');
            $('#copy-rule-button').addClass('hide-button');
            $('#delete-rule-button').addClass('hide-button');// hide delete button
            $('#disable-rule-button').addClass('hide-button');
            $('#enable-rule-button').addClass('hide-button');
            $('#reorder-rule-button').removeClass('hide-button');
            $('#create-rule-button').removeClass('hide-button');
            summaryView.write(summary);
        },

        _doSave : function () {
            this._setEditMode(false);
            var model = this._getCurrentModel();
            if (model.nodeName === "SCRIPTMODEL") {
                var currentScriptContents = expeditor.Utils.getOrElse(model, "script.content", null);
                if (!_.isEmpty(currentScriptContents) &&
                   oldScriptContents != currentScriptContents) {
                    model.setVersion(expeditor.Utils.getCurrentVersion()); // any change in code editor will trigger a version upgrade
                }
                this._setLastRuleMode(expeditor.ExpressionEditor.CODE_EDITOR);
            } else {
                model.setVersion(expeditor.Utils.getCurrentVersion()); // any change in code editor will trigger a version upgrade
                this._setLastRuleMode(expeditor.ExpressionEditor.VISUAL_EDITOR);
            }
            if (editableRootNodePos !== -1) {
                this.listModel.set(editableRootNodePos, model);
            } else {
                this.listModel.add(model);
            }
            var summary = this._getSummary(this.listModel); // TODO : this._getSummary(model)
            if (summary != null) {
                this._writeSummary(summary);
            }
            editableRootNodePos = -1;

            // TODO : Implement this destroy API to prevent memory leaks
            //currentComponent.destroy();
            if (typeof this.options.saveHandler === "function") {
                this.options.saveHandler(model);
            }
        },

        _showSaveConfirmationDialog : function () {
            var self = this;
            var message = '<p>' + Granite.I18n.get("This rule is incomplete, and will not be executed on the form.") + '</p>',
                footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Cancel') + '</button>' +
                        '<button id="close-incomplete-button" is="coral-button" variant="primary" coral-close>' + Granite.I18n.get('Save Rule') + '</button>';

            expeditor.Utils.launchCustomModal("warning", Granite.I18n.get("Incomplete Rule"), message, footer, $('#exp-main-container'));
            $("#close-incomplete-button").one('click', function () {
                self._doSave();
            });
        },

        _saveClicked : function () {
            var model = this._getCurrentModel();
            var isModelValid = model.getIsValid();
            if (isModelValid) {
                this._doSave();
            } else {
                this._showSaveConfirmationDialog();
            }
        },

        _cancelClicked : function () {
            this._setEditMode(false);
            codeEditor.reset();
            currentComponent = null;
        },

        _showRule : function (model) {
            codeEditor.reset();
            currentComponent = null;
            $("#rulebuilder").removeAttr("data-enabled");
            if (model == null) {
                var defaultMode = this._getLastRuleMode();
                this._toggleEditorTabs(defaultMode);
            } else if (model.nodeName === "SCRIPTMODEL") {
                codeEditor.setModel(model);
                this._toggleEditorTabs(expeditor.ExpressionEditor.CODE_EDITOR);
            } else {
                this._toggleEditorTabs(expeditor.ExpressionEditor.VISUAL_EDITOR);

            }
            this._setRuleBuilderEnabled(model == null || model.nodeName !== "SCRIPTMODEL", model);
            this._setEditMode(true);

        },

        _createNewRule : function () {
            oldScriptContents = null;
            this._showRule();
            editableRootNodePos = -1;
            summaryView.clearSelection();
            this._updateRuleName();
        },

        _reorderRule : function (e) {
            if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.target) {
                $(e.currentTarget.dataset.target).addClass('is-closed');
            }
            this._showReorderActions();
            summaryView.renderReorderView(this._getSummary(this.listModel), this._codeEditorEnabled());
        },

        _reorderRuleSave : function () {
            var indices = summaryView.getUpdatedIndices();
            this._updateRulesOrder({indices : indices});
            this._hideReorderActions();
        },

        _reorderRuleCancel : function () {
            this._hideReorderActions();
            this._writeSummary(this._getSummary(this.listModel), false);
        },

        _showReorderActions : function () {
            $('#create-rule-button').addClass('hide-button');
            $('#exp-toggle-navigationpanel-button').addClass('hide-button');
            $('#save-reorder-button').show();
            $('#close-reorder-button').show();
            var model = clipBoard.get("expeditor-modelcopy");
            if (model) {
                $('#paste-rule-button').hide();
            }
        },

        _hideReorderActions : function () {
            $('#create-rule-button').removeClass('hide-button');
            $('#exp-toggle-navigationpanel-button').removeClass('hide-button');
            var model = clipBoard.get("expeditor-modelcopy");
            if (model) {
                $('#paste-rule-button').show();
            }
            $('#save-reorder-button').hide();
            $('#close-reorder-button').hide();
        },

        _updateRuleName : function (title) {
            title = title || ruleTitle;
            $(".exp-editmode-heading").text(title);
        },

        setConfig : function (config) {
            eeContext.config = config;
            expeditor.Utils.getConfig.cache = {};
        },

        setTreeConfig : function (config) {
            treeComponent.setModelJson(config);
            summaryTreeComponent.setModelJson(config);
        },

        _getCurrentModel : function () {
            var model = codeEditor.getModel();
            if (model != null && model.script.content.trim() !== "") {
                return model;
            }
            if (currentComponent != null) {
                currentComponent.validate();
                return currentComponent.getModel();
            }
            return null;
        },

        _setRuleBuilderEnabled : function (enabled, model) {
            var $ruleBuilder = $("#rulebuilder");
            if (!enabled && $ruleBuilder.attr("data-enabled") !== "false") {
                $ruleBuilder.empty().append($(ruleBuilderDisabledTemplate));
                $ruleBuilder.attr("data-enabled", "false");
            } else if (enabled && $ruleBuilder.attr("data-enabled") !== "true") {
                $ruleBuilder.attr("data-enabled", "true");
                currentComponent = eeContext.createComponent("ROOT");
                if (model) {
                    currentComponent.setModel(model.copy());
                    $("#expeditor-info-bar").show();
                } else {
                    $("#expeditor-info-bar").hide();
                }
                $ruleBuilder.empty().append(currentComponent.render());
            }
        },

        _showCodeEditor : function () {
            var model = this._getCurrentModel();
            var summary = "";
            if (this.summaryTransformer && model != null) {
                this.summaryTransformer.setMode(this.summaryTransformer.PLAIN_TEXT_MODE);
                model.accept(this.summaryTransformer);
                var script = this.summaryTransformer.getScript();
                summary = " * " + script.content + "\n *";
            }
            codeEditor.show(model, this.options.transformer, summary, this.options.codeEditorConfig);
        },

        _setJsonModel : function (jsonModel) {
            this.listModel = new expeditor.model.ListModel('RULES', eeContext);
            if (typeof jsonModel === "object" && jsonModel != null) {
                this.listModel = this.listModel.fromJson(jsonModel);
                var summary = this._getSummary(this.listModel);
                if (summary != null) {
                    this._writeSummary(summary, false);
                }
            } else {
                this._writeSummary([], false);
            }
            return this;
        },

        show : function (jsonModel) {
            if (treeComponent) {
                treeComponent.render();
            }
            if (summaryTreeComponent) {
                summaryTreeComponent.render();
            }
            if (functionsComponent) {
                functionsComponent.render();
            }
            codeEditor.reset();
            currentComponent = null;
            this._setJsonModel(jsonModel);
            var model = clipBoard.get("expeditor-modelcopy");
            if (model) {
                var eventName = model.eventName;
                if (model.nodeName === 'SCRIPTMODEL') {
                    eventName = model.script.event;
                }
                if (supportedEvents && supportedEvents.indexOf(eventName) > -1) {
                    $("#paste-rule-button").show();
                } else {
                    $("#paste-rule-button").hide();
                }
            } else {
                $("#paste-rule-button").hide();
            }
            this._hideReorderActions();
            $(window).resize(this.onWindowResize);
            return this;
        },

        /**
         * Returns an Array of Scripts transformed by the provided transformer
         * The Caller will have to merge the scripts as per their requirement
         * @returns {null|Array}
         */
        getScript : function () {
            if (!this.listModel) {
                return null;
            }
            var transformer = this.options.transformer;
            return expeditor.Utils.listModelToScript(this.listModel, transformer);
        },

        getJson : function () {
            if (this.listModel == null) {
                return null;
            }
            return this.listModel.toJson();
        },

        highlightSummaryTreeNode : function (path) {
            summaryTreeComponent.view.setFocusToNode(null, {path : path});
        },

        onWindowResize : function () {
            var sidepanel = $(".exp-sidepanel, .summaryviewtree"),
                width = $(window).width();
            if (width < 1024) {
                if (!sidepanel.hasClass("small")) {
                    sidepanel.addClass("is-closed");
                    $("#exp-toggle-sidepanel-button").removeClass("active");
                    $("#exp-toggle-navigationpanel-button").removeClass("active");
                }
                sidepanel.addClass('small');
            } else {
                sidepanel.removeClass('small');
            }
        }
    });
    expeditor.ExpressionEditor.VISUAL_EDITOR = 1;
    expeditor.ExpressionEditor.CODE_EDITOR = 2;
    defaults = {
        transformer : new expeditor.rb.ToJsTransformer(),
        defaultMode : expeditor.ExpressionEditor.VISUAL_EDITOR,
        useLocalStorageForDefaultMode : ""
    };

    /**
     * @todo: When moving to coral 3 components inside expression editor,
     * remove this part of code.
     */
    $('#exp-main-container').on('click', function (e) {
        // on click of outside the overlay, hide it
        var overlays = $('#exp-main-container').find("coral-overlay.expeditor-customoverlay");
        for (var i = 0; i < overlays.length; i++) {
            var overlay = overlays[i];
            // overlay.target is DOM element in exp editor(probably since we use Coral.Overlay) whereas otherwise it is a selector
            if (overlay.open && !overlay.contains(e.target) && !(overlay.target && typeof overlay.target.contains === "function" && overlay.target.contains(e.target))) {
                overlay.open = false;
            }
        }
    });
}(jQuery, window.Granite.$, document));
