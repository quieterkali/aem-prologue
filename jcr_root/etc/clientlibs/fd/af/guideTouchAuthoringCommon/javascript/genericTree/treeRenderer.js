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

;(function ($, author, channel, window, undefined) {

    var coralClassConstants = window.guidelib.touchlib.constants.coralclass;

    var treeItemTemplate = '<li class="sidepanel-tree-item" data-state="expanded" tabindex="0" data-elementid="\${id}">'  +
        '<div class="sidepanel-tree-item-div">' +
        '<span class="sidepanel-tree-item-button">' +
        '<coral-icon icon="accordionDown" iconsize="XXS"></coral-icon>' +
        '</span>' +
        '<span class="sidepanel-tree-item-label">' +
        '<label class="name" title="\${label}">${label}</label>' +
        '<span>' +
        '</div>' +
        '</li>';

    var searchFieldTemplate = '<div class="sidepanel-tree-searchField coral-Form-fieldwrapper">' +
        '<span class="coral-DecoratedTextfield">' +
        '<i class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search"></i>' +
        '<input class="search-field-template coral-Form-field search coral-Textfield coral-DecoratedTextfield-input" type="text" placeholder="' + Granite.I18n.getMessage("Enter title to find form object(s)") + '" value="">' +
        '<button class="close" is="coral-button" icon="close" iconsize="XS"> </button>' +
        '<button class="down" is="coral-button" icon="accordionDown" iconsize="XS" hidden=""> </button>' +
        '<button class="up" is="coral-button" icon="accordionUp" iconsize="XS" hidden=""> </button>' +
        '</span>' +
        '</div>';

    var templateSettings = {interpolate : /\$\{([\s\S]+?)\}/g};

    var AuthorTreeRenderer = author.ui.TreeRenderer = function (options) {
        this.dom = $("#" + options.treeContainerId);
        this.notSearchable = options.notSearchable;    // Add this to true if search field not required
        this.notAllCollapsable = options.notAllCollapsable; // Add this to true if do not want to add collapse all button
    };

    AuthorTreeRenderer.prototype.setup = function (options) {
        this.componentContext = options.context;
        this.searchHandler = options.searchHandler;
        this.dom.addClass("sidepanel-tree-component");
        this.itemsDom = $("<div class='sidepanel-tree-component-items'></div>");

        if (!this.notSearchable) {
            this.searchResults = [];
            this.currentItem = 0;
            this.searchField = $(searchFieldTemplate);
            this.searchField.find(coralClassConstants.CORAL_BUTTON).addClass(coralClassConstants.CORAL_BUTTON_QUIET);
            this.dom.prepend(this.searchField);
            this.resetSearchField();
        }
        this.dom.append(this.itemsDom);
        this.isExpanded = true;
        this.bindEvents();
    };

    AuthorTreeRenderer.prototype.teardown = function () {
        this.unbindEvents();
        this.dom.empty();
    };

    AuthorTreeRenderer.prototype.resetSearchField = function () {
        this.searchField.find(".up").attr("hidden", "");
        this.searchField.find(".down").attr("hidden", "");
        this.unMarkNodeSearchSelected(this.searchResults[this.currentItem]);
        for (i = 0; i < this.searchResults.length; i++) {
            this.unmarkNodeFound(this.searchResults[i]);
        }
        this.searchResults = [];
        this.currentItem = 0;
        this.previousKey = "";
    };

    AuthorTreeRenderer.prototype.addNodeToTree = function (node, parentElement) {

        if (!parentElement || parentElement.length === 0) {
            parentElement = this.itemsDom;
        }

        var list = parentElement.children("ul");
        if (list.length === 0) {
            parentElement.append('<ul></ul>');
            list = parentElement.children("ul");
        }
        // xss safe HTML paramaters
        node.id = CQ.shared.XSS.getXSSValue(node.id);
        node.label = Granite.I18n.get(CQ.shared.XSS.getXSSValue(node.label));

        var element = $(_.template(treeItemTemplate, node, templateSettings));
        parentElement.addClass("is-parent");
        list.append(element);

        if (parentElement.hasClass('toplevel-element')) {
            element.addClass('firstLevel-element');
        } else {
            parentElement.children("div").find('.sidepanel-tree-item-button')
                .addClass("sidepanel-tree-item-button-isVisible");
        }
        if (parentElement === this.itemsDom) {
            list.addClass("toplevel-list");
            element.addClass("toplevel-element");
            element.find('label.type').remove();
            if (!this.notAllCollapsable) {
                var topContainerElement = element.find('.sidepanel-tree-item-label');
                topContainerElement.find('label').addClass('sidepanel-tree-containeritem-label');
                topContainerElement.append('<label class="sidepanel-tree-expand-buttton" title="EXPAND/COLLAPSE">' + Granite.I18n.getMessage("COLLAPSE ALL") + '</label>');
            }
        }
        this.newNodeAddedToTree(node, element);
        return element;
    };

    // A new node is added to the tree. Add new classes and data attributes to the element
    AuthorTreeRenderer.prototype.newNodeAddedToTree = function (node, element) {
    };

    // A node is being refreshed
    AuthorTreeRenderer.prototype.refreshNodeHTML = function (node, element) {
        element.removeClass('is-parent');
        element.children("div").find('.sidepanel-tree-item-button')
            .css("visibility", "hidden");
        if (element.data("state") === "collapsed") {
            this.expandCollapseItem(element);
        }
    };

    AuthorTreeRenderer.prototype.bindEvents = function (config) {
        var that = this;

        this.dom.on('click.treeItemsContainer', '.sidepanel-tree-item', this.handleItemSelect.bind(this));
        this.dom.on('click.treeItemsContainer', '.sidepanel-tree-item-button', this.handleExpandCollapseButton.bind(this));
        this.dom.on('click.treeItemsContainer', '.sidepanel-tree-expand-buttton', this.expandCollapseAll.bind(this));
        this.dom.on("keydown.treeNavigation", '.sidepanel-tree-component-items', this.keyboardNavigation.bind(this));

        if (!this.notSearchable) {
            this.searchField.find("input").on("change paste keyup", this.handleSearch.bind(this));

            this.searchField.find(".close").on("click", function (e) {
                var searchFieldInput = that.searchField.find("input");
                searchFieldInput[0].value = "";
                searchFieldInput.trigger('change');
            });
            this.searchField.find(".down").on("click", function (e) {
                if (that.searchResults.length > (that.currentItem + 1)) {
                    that.unMarkNodeSearchSelected(that.searchResults[that.currentItem]);
                    that.currentItem += 1;
                    that.setSearchFocus();
                }
            });
            this.searchField.find(".up").on("click", function (e) {
                if (that.currentItem > 0) {
                    that.unMarkNodeSearchSelected(that.searchResults[that.currentItem]);
                    that.currentItem -= 1;
                    that.setSearchFocus();
                }
            });
        }
    };

    /*
    *    Handle keyboard navigation when navigating in tree
    */
    AuthorTreeRenderer.prototype.keyboardNavigation = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 65) {
                event.preventDefault();
                var that = this;
                $treeElements = $(".sidepanel-tree-item:visible").not(".toplevel-element");
                $.each($treeElements, function (index, treeElement) {
                    if (index === 0) {
                        if (!$(treeElement).is(".is-selected")) {
                            that.currentSelectedNode = $(treeElement);
                            that.selectCurrentNodeKeyboardNav();
                        }
                    } else {
                        $(treeElement).addClass('is-selected');
                    }
                });
            }
        }

        if (event.which === 40) { //move to the next node in tree (down arrow)
            event.preventDefault();
            this.findNextKeyboardNav();
            this.selectCurrentNodeKeyboardNav();
            this.setFocusOnItem(this.currentSelectedNode.data("elementid"));
        } else if (event.which === 38) { // move to the previous node in tree (up arrow)
            event.preventDefault();
            this.findPrevKeyboardNav();
            this.selectCurrentNodeKeyboardNav();
            this.setFocusOnItem(this.currentSelectedNode.data("elementid"));
        } else if (event.which === 37) { // for collapsing the current node  (left arrow)
            event.preventDefault();
            var $treeElementSelectedParents = $(".sidepanel-tree-item.is-parent.is-selected:visible").not(".toplevel-element");
            var that = this;
            if ($treeElementSelectedParents.length) {
                $.each($treeElementSelectedParents, function (index, treeElementParent) {
                    if ($(treeElementParent).data("state") === "expanded") {
                        that.expandCollapseItem($(treeElementParent));
                    }
                });
            }
        } else if (event.which === 39) { // for expanding the current node (right arrow)
            event.preventDefault();
            var $treeElementSelectedParents = $(".sidepanel-tree-item.is-parent.is-selected:visible").not(".toplevel-element");
            var that = this;
            if ($treeElementSelectedParents.length) {
                $.each($treeElementSelectedParents, function (index, treeElementParent) {
                    if ($(treeElementParent).data("state") === "collapsed") {
                        that.expandCollapseItem($(treeElementParent));
                    }
                });
            }
        }
    };

    /*
    *   To find the next tree node on pressing down key
    */
    AuthorTreeRenderer.prototype.findNextKeyboardNav = function () {
        var $item = this.currentSelectedNode,
            $childNodes = null,
            $childUlNodes = $item.children("ul");

        if ($childUlNodes && $childUlNodes.length) {
            $childNodes = $childUlNodes.eq(0).children(".sidepanel-tree-item");
        }
        if ($childNodes && $childNodes.length && $item.data("state") === "expanded") {  //next of current node is its first child
            this.currentSelectedNode = $childNodes.eq(0);
        } else if ($item.next().length && $item.next().is(".sidepanel-tree-item")) { // if no child is present then its sibling is next
            this.currentSelectedNode = $item.next();
        } else { //if no child and sibling is present then move to the ancestor node until the sibling of the ancestor is found
            $item = $item.parent().parent();         // direct parent node is <ul>
            while ($item.length && $item.is(".sidepanel-tree-item")) {
                if ($item.next().length) {
                    this.currentSelectedNode = $item.next();
                    break;
                }
                $item = $item.parent().parent();
            }
        }
    };

    /*
    *   To find the prev tree node on pressing up key
    */
    AuthorTreeRenderer.prototype.findPrevKeyboardNav = function () {
        var $item = this.currentSelectedNode,
            $previousSibling = null,
            $childNodes = null,
            $prevChildNode = null,
            $lastChildNode = null,
            $childUlNodes = null,
            $parentNode = $item.parent().parent();

        if ($item.prev() && $item.prev().length && $item.prev().is(".sidepanel-tree-item")) {
            $previousSibling = $item.prev();
            $childUlNodes = $previousSibling.children("ul");
        }

        if ($previousSibling && $previousSibling.length && $childUlNodes && $childUlNodes.length) {
            $childNodes = $childUlNodes.eq($childUlNodes.length - 1).children(".sidepanel-tree-item");
            $lastChildNode = $childNodes.eq($childNodes.length - 1);
        }

        if ($lastChildNode && $lastChildNode.length && $previousSibling.data("state") === "expanded") { //last descendant of the previous sibling is the previous element

            while ($lastChildNode.length) {
                $prevChildNode = $lastChildNode;
                if ($lastChildNode.data("state") === "expanded") {
                    $childUlNodes = $lastChildNode.children("ul");
                    $childNodes = $childUlNodes.eq($childUlNodes.length - 1).children(".sidepanel-tree-item");
                    $lastChildNode = $childNodes.eq($childNodes.length - 1);
                } else {
                    break;
                }
            }
            this.currentSelectedNode = $prevChildNode;
        } else if ($previousSibling && $previousSibling.length && $previousSibling.is(".sidepanel-tree-item")) { //if no descendant of previous sibling is present then previous sibling is previous element
            this.currentSelectedNode = $previousSibling;
        } else if ($parentNode && $parentNode.is(".sidepanel-tree-item") && !$parentNode.is(".toplevel-element")) { //if no previous sibling is present then parent is the previous element
            this.currentSelectedNode = $parentNode;
        }
    };

    AuthorTreeRenderer.prototype.selectCurrentNodeKeyboardNav = function () {
        var $item = this.currentSelectedNode;
        $item.click();
    };

    AuthorTreeRenderer.prototype.firstTreeElement = function () {
        var $item = $(".firstLevel-element.sidepanel-tree-item").eq(0);
        return $item;
    };

    AuthorTreeRenderer.prototype.unbindEvents = function (config) {
        this.dom.off('click.treeItemsContainer', '.sidepanel-tree-item');
        this.dom.off('click.treeItemsContainer', '.sidepanel-tree-item-button');
        this.dom.off("keydown.treeNavigation");
        if (!this.notSearchable) {
            this.searchField.find("input").on("change paste keyup keypress keydown");
            this.searchField.find("button").on("click");
        }
    };

    AuthorTreeRenderer.prototype.handleItemSelect = function (event) {
        event.stopPropagation();
        this.currentSelectedNode = $(event.currentTarget);
        if (!$(event.currentTarget).is('.toplevel-element')) {
            $(event.currentTarget).focus();
            this.deselectAllItems();
            $(event.currentTarget).addClass('is-selected');
        }
    };

    AuthorTreeRenderer.prototype.handleSearch = function (e) {
        var resetButton = this.searchField.find(".close");
        e.preventDefault();
        var value = [];
        value.push(e.currentTarget.value);
        if (this.previousKey !== value[0]) {
            this.resetSearchField();
            this.searchResults = this.searchHandler.apply(this.componentContext, value);
            for (i = 0; i < this.searchResults.length; i++) {
                this.markNodeFound(this.searchResults[i]);
            }
            this.searchField.find(".up").removeAttr("hidden");
            this.searchField.find(".down").removeAttr("hidden");
            this.previousKey = value[0];
        } else if (this.searchResults.length > (this.currentItem + 1)) {
            this.unMarkNodeSearchSelected(this.searchResults[this.currentItem]);
            this.currentItem += 1;
        }
        this.setSearchFocus();
        this.searchField.find("input").focus();
        resetButton.show();
        if (e.currentTarget.value != "") {
            resetButton.show();
        } else {
            this.resetSearchField();
        }
    };

    AuthorTreeRenderer.prototype.handleExpandCollapseButton = function (event) {
        event.stopPropagation();
        this.expandCollapseItem($(event.currentTarget).closest('li'));
    };

    AuthorTreeRenderer.prototype.errorHandler = function () {
        this.dom.empty(); // Append some error message in the dom.
    };

    AuthorTreeRenderer.prototype.deselectAllItems = function () {
        this.dom.find(".sidepanel-tree-item").each(function (i, child) {
            $(child).removeClass("is-selected");
        });
    };

    AuthorTreeRenderer.prototype.expandCollapseItem = function ($item) {
        if (!$item.hasClass('toplevel-element')) {
            var icon = $item.children("div").find(".sidepanel-tree-item-button").children('coral-icon');
            if ($item.data("state") == "expanded") {
                $item.data("state", "collapsed");
                icon.attr("icon", "accordionRight");
                $item.children("ul").toggle("slide");
            } else {
                $item.data("state", "expanded");
                icon.attr("icon", "accordionDown");
                $item.children("ul").toggle("slide");
            }
        }
    };

    AuthorTreeRenderer.prototype.expandCollapseAll = function () {
        var that = this;
        this.dom.find(".sidepanel-tree-item").each(function (i, item) {
            if (that.isExpanded) { // collapsing all items
                if ($(item).data("state") == "expanded") {
                    that.expandCollapseItem($(item)); // collapse this item
                }
            } else { // Expanding all item
                if ($(item).data("state") == "collapsed") {
                    that.expandCollapseItem($(item));  // expand this item
                }
            }
        });
        if (this.isExpanded) {
            this.isExpanded = false;
            this.dom.find(".sidepanel-tree-expand-buttton")[0].innerHTML = Granite.I18n.getMessage("EXPAND ALL");
        } else {
            this.isExpanded = true;
            this.dom.find(".sidepanel-tree-expand-buttton")[0].innerHTML = Granite.I18n.getMessage("COLLAPSE ALL");
        }
    };

    AuthorTreeRenderer.prototype.markNodeSelected = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var item = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        item.addClass("is-selected");
    };

    AuthorTreeRenderer.prototype.markNodeSearchSelected = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var item = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        item.addClass("is-searchSelected");
    };

    AuthorTreeRenderer.prototype.unMarkNodeSearchSelected = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var item = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        item.removeClass("is-searchSelected");
    };

    // Expand all the parent elements of this item if they are collapsed
    AuthorTreeRenderer.prototype.expandCollapseAllParent = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var $item =  this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        if ($item.length && !$item.hasClass('toplevel-element')) {
            var parentElement = $item.parent().closest('li');
            while (!parentElement.hasClass('toplevel-element')) {
                if (parentElement.data("state") === "collapsed") {
                    this.expandCollapseItem(parentElement);
                }
                parentElement = parentElement.parent().closest('li');
            }
        }
    };

    AuthorTreeRenderer.prototype.setFocusOnItem = function (node, searchKey) {
        this.expandCollapseAllParent(node, searchKey);
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var $item =  this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");

        if ($item.length) {
            this.itemsDom.scrollTop($item.offset().top - this.itemsDom.offset().top + this.itemsDom.scrollTop() - window.outerHeight / 3);
        }
    };

    AuthorTreeRenderer.prototype.getNodeDOMElement = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        return this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
    };

    AuthorTreeRenderer.prototype.deleteChildNodes = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var element = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        var list = element.children("ul");
        if (list.length !== 0) {
            list.remove();
        }
    };

    AuthorTreeRenderer.prototype.setSearchFocus = function () {
        if (this.searchResults.length > this.currentItem) {
            this.setFocusOnItem(this.searchResults[this.currentItem]);
            this.markNodeSearchSelected(this.searchResults[this.currentItem]);
        }
    };

    AuthorTreeRenderer.prototype.unsetSearchFocus = function () {
        if (this.searchResults.length > this.currentItem) {
            this.setFocusOnItem(this.searchResults[this.currentItem]);
            this.markNodeSearchSelected(this.searchResults[this.currentItem]);
        }
    };

    AuthorTreeRenderer.prototype.markNodeFound = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        this.expandCollapseAllParent(node);
        var item = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        item.addClass("is-found");
    };

    AuthorTreeRenderer.prototype.unmarkNodeFound = function (node, searchKey) {
        if (searchKey === undefined) {
            searchKey = "elementid";
        }
        var item = this.dom.find(".sidepanel-tree-item[data-" + searchKey + "='" + node + "']");
        item.removeClass("is-found");
    };

}(jQuery, Granite.author, jQuery(document), this));
