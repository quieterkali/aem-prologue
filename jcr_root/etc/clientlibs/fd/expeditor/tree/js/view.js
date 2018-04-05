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


(function (expeditor) {

    var treeItemTemplate = '<li data-elementid="\${id}" data-elementname="\${name}" data-type="\${type}">' +
                                '<div class="tree-item">' +
                                    '<div class="drag-element" data-elementid="\${id}" data-path="\${path}">' +
                                        '<coral-icon size="S" icon="\${icon}" class="tree-item-icon"></coral-icon>' +
                                        '<label class="name" title="\${displayName}">${displayName}</label>' +
                                    '</div>' +
                                '</div>' +
                            '</li>';

    var searchFieldTemplate = '<div class="coral-Form-fieldwrapper tree-searchfield">' +
                                '<span class="coral-DecoratedTextfield">' +
                                    '<coral-icon icon="search" size="XS" class="coral-DecoratedTextfield-icon"></coral-icon>' +
                                    '<input class="coral-Form-field search coral-Textfield coral-DecoratedTextfield-input" type="text" ' +
                                    'placeholder="' + Granite.I18n.get("Enter keyword(s)") + '" value="">' +
                                    '<button class="search-cancel" is="coral-Button" variant="quiet" type="button" ' +
                                        'autocomplete="off" title="' + Granite.I18n.get("clear") + '" data-iconsize="XS">' +
                                        '<coral-icon size="XS" icon="close"></coral-icon>' +
                                    '</button>' +
                                    '<button class="search-next" is="coral-Button" variant="quiet" type="button" ' +
                                        'autocomplete="off" title="' + Granite.I18n.get("Next") + '" data-iconsize="XS">' +
                                        '<coral-icon size="XS" icon="chevronDown"></coral-icon>' +
                                    '</button>' +
                                    '<button class="search-previous" is="coral-Button" variant="quiet" type="button" ' +
                                        'autocomplete="off" title="' + Granite.I18n.get("Previous") + '" data-iconsize="XS">' +
                                        '<coral-icon size="XS" icon="chevronUp"></coral-icon>' +
                                    '</button>' +
                                '</span>' +
                            '</div>';

    var templateSettings = {interpolate : /\$\{([\s\S]+?)\}/g},
        _compiledTemplate = _.template(treeItemTemplate, null, templateSettings);
    
    

    var STATE_COLLAPSED = "collapsed",
        STATE_EXPANDED = "expanded",
        COLLAPSE_ALL = Granite.I18n.get("COLLAPSE ALL"),
        EXPAND_ALL = Granite.I18n.get("EXPAND ALL");

    var TreeView = expeditor.view.TreeView = expeditor.EventTarget.extend({

        init : function (options, expressionEditor) {
            this.root = null;
            this.panelId = options.objectPanel;
            this.treePanelId = options.objectTree;
            this.searchKey = options.searchKey;
            this.expressionEditor = expressionEditor;
            this.showStatus = options.showStatus;
            this.draggable = options.draggable;
            this.nodeType = options.nodeType;
            this.setConfig(options);
        },

        setConfig : function (options) {
            this.dragDataHandler = options.dragDataHandler;
            this.enableDrag = (this.dragDataHandler && typeof this.dragDataHandler === 'function');
            this.dblClickHandler = options.dblClickHandler;
            this.onfieldSwitch = options.onfieldSwitch || {};
            this.onfieldSwitch.typesNotAllowed = this.onfieldSwitch.typesNotAllowed || [];
            this.defaultTypes = options.defaultTypes || [];
        },

        _getRootTemplate : function () {
            return '<div class="tree"></div>';
        },
        _enableDrag : function (elements) {
            var self = this;
            elements.on('dragstart', function (e) {
                e.stopPropagation();
                var dataTransfer = e.originalEvent.dataTransfer,
                    element = e.currentTarget,
                    dragData = self.dragDataHandler($(element).data("elementid"));
                expeditor.runtime.dragField = dragData;
                expeditor.runtime.dragType = self.nodeType;
                dataTransfer.setData("text", expeditor.runtime.dragField + "," + self.nodeType);
                $(element).children('.tree-item').addClass("is-disabled");
            }).on("dragend", function (e) {
                e.stopPropagation();
                var element = e.currentTarget;
                $(element).children('.tree-item').removeClass("is-disabled");
                expeditor.runtime.dragField = null;
            });
        },

        _addChild : function (parent, newNode) {
            if (!parent || parent.length === 0) {
                parent = this.root;
            }
            var isParentRoot = parent === this.root;
            var list = parent.children("ul");
            if (list.length === 0) {
                if (!isParentRoot && !parent.hasClass("firstlevel-element")) {
                    parent.prepend('<coral-icon class="tree-expand-icon"  icon="chevronDown" size="XS" ></coral-icon>');
                }
                parent.append('<ul></ul>');
                list = parent.children("ul");
            }
            var element = $(_compiledTemplate(newNode));
            var item = element.children(".tree-item");
            if (this.draggable) {
                var dragIcon = $('<coral-icon icon="dragHandle" class="drag-icon"></coral-icon>');
                item.append(dragIcon)
                    .attr("draggable", true)
                    .addClass("tree-draggable u-coral-openHand");
            }
            if (this.defaultTypes.indexOf(newNode.type) > -1) {
                element.addClass("default-tree-element"); 
            }
            if (this.showStatus) {
                var title = newNode.status == "invalid" ? Granite.I18n.get('One or more erroneous rule(s) on this object') : (
                    newNode.status == "valid" ? Granite.I18n.get('One or more rule(s) on this object') : '');
                item.append($("<div class='tree-item-status " + newNode.status + "' title='" + title + "'></div>"));
            }
            var types = expeditor.Utils.getOrElse(this, 'onfieldSwitch.typesNotAllowed', null);
            if (types && types.indexOf(newNode.type) > 0) {
                element.addClass("click-disabled");
            }
            parent.addClass("parent");
            list.append(element);
            if (this.onfieldSwitch.handler &&
                typeof this.onfieldSwitch.handler === 'function' &&
                this.onfieldSwitch.typesNotAllowed.indexOf(newNode.type) < 0) {
                element.find(".drag-element").on('click', $.proxy(function (e) {
                    e.stopPropagation();
                    this.onfieldSwitch.handler($(e.currentTarget).data('path'));
                }, this));
            }
            if (isParentRoot) {
                list.addClass("firstlevel-list");
                element.addClass("firstlevel-element");
                var expandCollapseAll = $("<label></label>").addClass("tree-expand-collapse-all")
                    .attr("title", Granite.I18n.get("EXPAND/COLLAPSE"))
                    .text(COLLAPSE_ALL).appendTo(element.find(".drag-element"));
                element.data("state", STATE_EXPANDED);
                var self = this;
                expandCollapseAll.on('click', function () {
                    var isCollapsed = element.data('state') == STATE_COLLAPSED;
                    self.root.find('li:not(.default-tree-element) > ul').toggle(isCollapsed);
                    self._updateIcon(self.root.find('li:not(.default-tree-element) > .tree-expand-icon'), !isCollapsed);
                    if (!isCollapsed) {
                        $(this).text(EXPAND_ALL);
                        element.data("state", STATE_COLLAPSED);
                    } else {
                        $(this).text(COLLAPSE_ALL);
                        element.data("state", STATE_EXPANDED);
                    }
                });
            }
            return element;
        },
        _isNodeCollapsed : function (treeNode) {
            this._isIconCollapsed($(treeNode).children('coral-icon'));
        },
        addNodeToTree : function (node, parent) {
            var _parent = parent || this.root;
            return this._addChild(_parent, node);
        },

        render : function () {
            var that = this;
            if (!this.searchField) {
                this.searchField = $(searchFieldTemplate);
                var resetButton = this.searchField.find(".search-cancel"),
                    previousButton = this.searchField.find(".search-previous"),
                    nextButton = this.searchField.find(".search-next"),
                    buttons = resetButton.add(previousButton)
                        .add(nextButton);
                this.searchField.find("input").on("change paste keyup keypress keydown", function (e) {
                    var value = $(this).val();
                    if (e.type === "keyup" && !(e.keyCode === 40 || e.keyCode === 38)) {
                        if (value === "") {
                            that.resetHandler();
                        }else if (value === that.currentSearchKey) {
                            that.focusNextSearchResult();
                        } else {
                            that.currentSearchKey = value;
                            that.trigger('search', {searchBy : that.searchKey, key : value});
                        }
                    }else if (e.type === "keydown" && e.keyCode == 40) {
                        that.focusNextSearchResult();
                    } else if (e.type === "keydown" && e.keyCode === 38) {
                        that.focusPreviousSearchResult();
                    }
                    if ($(this).val() != "") {
                        buttons.css("display", "inline-block");
                    } else {
                        buttons.hide();
                    }
                    this.focus();
                });

                resetButton.on("click", $.proxy(this.resetHandler, this));
                previousButton.on('click', $.proxy(this.focusPreviousSearchResult, this));
                nextButton.on('click', $.proxy(this.focusNextSearchResult, this));
                $(this.panelId).prepend(this.searchField);
            }
            if (!this.root) {
                this.root = $(this._getRootTemplate());
                $(this.treePanelId).empty().append(this.root);
            }
            if (this.enableDrag) {
                this.setFocusNodeListener();
            }
            return this.root;
        },

        
        resetHandler : function () {
            $(this.treePanelId).show();
            this.searchField.find("input").val("");
            this.searchField.find(".search-previous").hide();
            this.searchField.find(".search-next").hide();
            this.root.find(".is-focusedSearch").removeClass("is-focusedSearch");
            this.root.find(".is-searchResult").removeClass("is-searchResult");
            this.currentSearchKey = null;
            this.currentSearchResult = null;
            this.currentSearchIndex = -1;
        },

        setFocusNodeListener : function () {
            $(document).off('focusTreeNode')
                .on('focusTreeNode', $.proxy(this.setFocusToNode, this));
        },

        
        empty : function () {
            if (this.root) {
                this.root.empty();
            }
        },

        filterNodesById : function (ids) {
            this.currentSearchResult = ids || [];
            var self = this;
            self.root.find(".is-searchResult").removeClass("is-searchResult");
            this.currentSearchResult.forEach(function (id) {
                var node = self.root.find(".drag-element[data-elementid='" + id + "']");
                node.parent().addClass("is-searchResult");
            });
            this.currentSearchIndex = 0;
            this.setFocusToNode(null, {id : ids[0], type : 'Search'});
        },

        focusNextSearchResult : function () {
            if (!this.currentSearchResult) {
                return;
            }
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.currentSearchResult.length ;
            this.setFocusToNode(null, {id : this.currentSearchResult[this.currentSearchIndex], type : 'Search'});
        },

        focusPreviousSearchResult : function () {
            if (!this.currentSearchResult) {
                return;
            }
            this.currentSearchIndex = (this.currentSearchIndex + this.currentSearchResult.length - 1) % this.currentSearchResult.length;
            this.setFocusToNode(null, {id : this.currentSearchResult[this.currentSearchIndex], type : 'Search'});
        },

        _updateIcon : function (iconNode, collapse) {
            $(iconNode).prop('icon', collapse ? "chevronRight" : "chevronDown");
        },

        _isIconCollapsed : function (iconNode) {
            return $(iconNode).prop("icon") == "chevronRight";
        },

        _getElementFromIcon : function (icon) {
            return $(icon).siblings('ul');
        },
        addListeners : function () {
            this._addExpandCollapseListener();
            var self = this;
            var elements =  this.root.find("li:not(.firstlevel-element)");
            if (self.enableDrag) {
                this._enableDrag(elements);
            }
            if (this.dblClickHandler) {
                elements.on('dblclick', $.proxy(function (e) {
                    e.stopPropagation();
                    this.dblClickHandler($(e.currentTarget).data('elementid'));
                }, this));
            }
        },
        _toggleNode : function (icon) {
            var isCollapsed = this._isIconCollapsed(icon);
            this._updateIcon(icon, !isCollapsed);
            this._getElementFromIcon(icon).toggle(isCollapsed);
        },
        _addExpandCollapseListener : function () {
            var self = this;
            this.root.find("li:not(.default-tree-element) > .tree-expand-icon").on('click', function (e) {
                self._toggleNode(this);
            });
        },

        setFocusToNode : function (e, data) {
            var focusedNodeName = "focused" + (data.type || "") + "Node";
            var focusCssClass = "is-focused" + (data.type || "");
            if (this[focusedNodeName]) {
                this[focusedNodeName].removeClass(focusCssClass);
            }
            var dragEl;
            if (data.id) {
                dragEl = this.root.find(".drag-element[data-elementid='" + data.id + "']");
            } else {
                dragEl = this.root.find(".drag-element[data-path='" + data.path + "']");
            }
            this[focusedNodeName] = dragEl.parent();
            var parent = this[focusedNodeName].closest(".parent");
            while (parent.length > 0) {
                var expCollapseIcon = parent.children(".tree-expand-icon")[0];
                if (expCollapseIcon) {
                    if (this._isIconCollapsed(expCollapseIcon)) {
                        this._toggleNode(expCollapseIcon);
                    }
                }
                parent = parent.parent().closest(".parent");
            }
            if (this[focusedNodeName].length > 0) {
                var node = this[focusedNodeName][0];
                if (node.scrollIntoViewIfNeeded) {
                    node.scrollIntoViewIfNeeded();
                } else {
                    node.scrollIntoView();
                }
            }
            this[focusedNodeName].addClass(focusCssClass);
        }
    });
})(expeditor);

(function (expeditor) {
    var treeItemTemplate = _.template('<li data-elementid="<%=element.id%>">' +
            '<div class="drag-element" draggable="true" data-elementid="<%=element.id%>">' +
                '<% displayProps.forEach(function (propName) { %>' +
                    '<label class="<%=propName%>" title="<%=element[propName]%>"><%=element[propName]%></label>' +
                '<% }); %>' +
            '</div>' +
        '</li>');
    var TreeListView = expeditor.view.TreeListView = expeditor.view.TreeView.extend({

        addNodeToTree : function (element, parent, displayProps) {
            var htmlElement = $(treeItemTemplate({
                element : element,
                displayProps : displayProps
            }));
            this._enableDrag(htmlElement);
            return this.root.append(htmlElement);
        },

        _getRootTemplate : function () {
            return '<ul class="tree-list"></ul>';
        },

        addExpandCollapseListener : function () {

        },

        setFocusNodeListener : function () {
            
        }
    });
})(expeditor);
