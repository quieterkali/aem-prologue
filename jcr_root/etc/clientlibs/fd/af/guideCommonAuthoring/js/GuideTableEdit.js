// jscs:disable requireDotNotation
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

(function (window, $, guidelib) {

    var sCreateContextMenu = true,
        RESOURCE_TYPE_TABLE = "fd/af/components/table",
        RESOURCE_TYPE_TABLE_ROW = "fd/af/components/tableRow",
        SELECTION_CONSTANT = {
            WITHIN_ROW : 1,
            WITHIN_COL : 2,
            OTHERS : 4
        },
        HEADER_ITEM_TEMPLATE = {
            "jcr:primaryType" : "nt:unstructured",
            "_value" : "Header",
            "guideNodeClass" : "guideTextDraw",
            "sling:resourceType" : "fd/af/components/guidetextdraw",
            "guideComponentType" : "true"
        },
        ROW_ITEM_TEMPLATE = {
            "jcr:primaryType" : "nt:unstructured",
            "hideTitle" : "true",
            "guideNodeClass" : "guideTextBox",
            // done to solve accessibility
            "jcr:title" : "Text box",
            "sling:resourceType" : "fd/af/components/guidetextbox",
            "guideComponentType" : "true"
        },
        COLSPAN_ONE_TEMPLATE = {
            "colspan" : 1
        },
        ROW_TEMPLATE = {
            "jcr:primaryType" : "nt:unstructured",
            "sling:resourceType" : RESOURCE_TYPE_TABLE_ROW ,
            "guideComponentType" : "true",
            "guideNodeClass" : "guideTableRow",
            "layout" : {
                "jcr:primaryType" : "nt:unstructured",
                "sling:resourceType" : "fd/af/layouts/table/rowLayout",
                "nonNavigable" : "{Boolean}true"
            }
        },
        CONSTANT_TABLE = {
            // Context Menu Specific Constants
            CONTEXT_MENU_ADD_TEXT : Granite.I18n.get("Add"),
            CONTEXT_MENU_ADD_ROW_TEXT : Granite.I18n.get("Add Row"),
            CONTEXT_MENU_ADD_COLUMN_TEXT : Granite.I18n.get("Add Column"),
            CONTEXT_MENU_DELETE_TEXT : Granite.I18n.get("Delete"),
            CONTEXT_MENU_DELETE_ROW_TEXT : Granite.I18n.get("Delete Row"),
            CONTEXT_MENU_DELETE_COLUMN_TEXT : Granite.I18n.get("Delete Column"),
            CONTEXT_MENU_EDIT_TEXT : Granite.I18n.get("Edit"),
            CONTEXT_MENU_EDIT_RULES_TEXT : Granite.I18n.get("Edit Rules"),
            CONTEXT_MENU_MOVE_UP_TEXT : Granite.I18n.get("Move Up"),
            CONTEXT_MENU_MOVE_DOWN_TEXT : Granite.I18n.get("Move Down"),
            CONTEXT_MENU_CLASS : "tableContextMenu",
            CONTEXT_MENU_ADD_CLASS : "tableContextMenuAdd",
            CONTEXT_MENU_DELETE_CLASS : "tableContextMenuDelete",
            CONTEXT_MENU_EDIT_CLASS : "tableContextMenuEdit",
            CONTEXT_MENU_EDIT_RULES_CLASS : "tableContextMenuEditRules",
            CONTEXT_MENU_MOVE_UP_CLASS : "tableContextMenuMoveUp",
            CONTEXT_MENU_MOVE_DOWN_CLASS : "tableContextMenuMoveDown",
            CONTEXT_MENU_WRAPPER : "guideContainerWrapperNode",
            // CSS Classes for controls associated with table during authoring
            TABLE_CONTROL_ELEMENT_CLASS : "tableControlElement",
            TABLE_CONTROL_ROW_CLASS : "tableControl",
            // Done to highlight a particular cell to support highlight of all cells present in a row if clicked on tableControlElement
            TABLE_SELECTED_ITEM_CLASS : "tableSelectedItem",
            // Constants to associate the initial name of nodes created during authoring
            ROW_NAME_PREFIX : "Row",
            TABLE_CELL_NAME_PREFIX : "headerItem",
            TABLE_ROW_CLASS : "guideTableRowNode",
            TABLE_ARROW_DOWN_CLASS : "guideTableArrowDown",
            TABLE_HEADER_CLASS : "guideTableHeader"
        },
        editableWindow = window.parent._afAuthorHook ? window.parent._afAuthorHook._getEditorWindow() : window,
        editConfigListener = editableWindow.guidelib.author.editConfigListeners;

    checkIfConsecutive = function (arr) {
        var sortedArr = _.sortBy(arr),
            index = 0,
            isConsecutive = true;
        // Walk through the array and check for the difference
        for (index = 1; index < sortedArr.length; index++) {
            if (sortedArr[index] !== sortedArr[index - 1] + 1) {
                isConsecutive = false;
                break;
            }
        }
        return isConsecutive;
    };

    $.fn.guideContextMenu = function (settings) {
        return this.each(function () {
            // Open context menu
            $(this).click(function (e) {
                // check if the element clicked in on a col, then hide edit in drop down menu
                // we don't support edit of columns in a table
                if ($(e.target).parents("." + CONSTANT_TABLE.TABLE_CONTROL_ROW_CLASS).length > 0) {
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_EDIT_CLASS).hide();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_EDIT_RULES_CLASS).hide();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).hide();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).hide();
                    // Changing text to Add/Delete column
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS).show().find("a").eq(0).html(CONSTANT_TABLE.CONTEXT_MENU_ADD_COLUMN_TEXT);
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS).show().find("a").eq(0).html(CONSTANT_TABLE.CONTEXT_MENU_DELETE_COLUMN_TEXT);
                } else {
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_EDIT_CLASS).show();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_EDIT_RULES_CLASS).show();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).show();
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).show();
                    // Changing text to Add/Delete Row
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS).find("a").eq(0).html(CONSTANT_TABLE.CONTEXT_MENU_ADD_ROW_TEXT);
                    $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS).find("a").eq(0).html(CONSTANT_TABLE.CONTEXT_MENU_DELETE_ROW_TEXT);
                }
                // We don't support addition and deletion of header row
                var $row = $(e.target).closest("." + CONSTANT_TABLE.TABLE_ROW_CLASS),
                    // todo: if tbody is removed in authoring, please change this code
                    $rowTbody = $row.closest("tbody");
                if ($row.length > 0) {
                    if ($row.hasClass(CONSTANT_TABLE.TABLE_HEADER_CLASS)) {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS).hide();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS).hide();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).hide();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).hide();
                    } else {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS).show();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS).show();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).show();
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).show();
                    }
                    // In case the selected row is last, don't show move down text in the context menu
                    if ($rowTbody.is(":last-child")) {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).hide();
                    } else {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).show();
                    }
                    // In case the selected row is first
                    /// todo: here there is a strong assumption that number of header rows in table can be only 1
                    if ($rowTbody.prev().is("thead")) {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).hide();
                    } else {
                        $(settings.menuSelector).find("." + CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).show();
                    }

                }

                //open menu
                $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position : "absolute",
                        left : getLeftLocation(e),
                        top : getTopLocation(e)
                    })
                    .off('click')
                    .on('click', function (e) {
                        $(this).hide();
                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);
                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                        // don't bubble up
                        return false;
                    });

                // don't bubble up the event
                return false;
            });

            //make sure menu closes on click outside context menu
            $('html').click(function (e) {
                if ($("." + CONSTANT_TABLE.CONTEXT_MENU_CLASS).has(e.target).length === 0) {
                    $(settings.menuSelector).hide();
                }
            });
        });

        /**
         * Get left location of event to position the context menu
         * @param e
         * @returns {*}
         */
        function getLeftLocation(e) {
            //Returns the horizontal coordinate of the event relative to whole document
            var mouseWidth = e.pageX,
                pageWidth = $(window).width(),
                menuWidth = $(settings.menuSelector).width();

            // opening menu would pass the side of the page
            if (mouseWidth + menuWidth > pageWidth
                && menuWidth < mouseWidth) {
                return mouseWidth - menuWidth;
            }
            return mouseWidth;
        }

        /**
         * Get top location of event to position the context menu
         * @param e
         * @returns {*}
         */
        function getTopLocation(e) {
            //Returns the vertical coordinate of the event relative to whole document
            var mouseHeight = e.pageY;
            var pageHeight = $(window).height();
            var menuHeight = $(settings.menuSelector).height();

            // opening menu would pass the bottom of the page
            if (mouseHeight + menuHeight > pageHeight
                && menuHeight < mouseHeight) {
                return mouseHeight - menuHeight;
            }
            return mouseHeight;
        }

    };

    /**
     * This Class defines the basic authoring abilities that a table support.
     * To use this class, create an instance of it by passing the table id which one want's to author
     *
     * @type {Function}
     */
    var GuideTableEdit = guidelib.author.AuthorUtils.GuideTableEdit = function (tableId) {
        var $tableControlSpan = $("<span/>").addClass("glyphicon glyphicon-circle-arrow-down " + CONSTANT_TABLE.TABLE_ARROW_DOWN_CLASS),
            $tableControlSpanClone = $tableControlSpan.clone(),
            editRowPath = null,
            editColPath = null,
            $controlRowCell = null,
            $controlColCell = null,
            allCells = null,
            that = this,
            // context menu settings required by the context menu plugin
            contextMenuSettings = {
                menuSelector : "." + CONSTANT_TABLE.CONTEXT_MENU_CLASS,
                menuSelected : function (invokedOn, selectedMenu) {
                    // get the parent
                    var $tableCell = invokedOn.parent(),
                        numOfCols = 0;
                    // if row is clicked
                    if ($tableCell.is($controlRowCell)) {
                        // handle table row operations
                        // Find the number of columns present in the current selected row
                        numOfCols = $tableCell.parents("table").find("th:not(.tableControlElement)").length;
                        that.handleAuthoringRowOperations(selectedMenu, editRowPath, numOfCols);
                    } else if ($tableCell.is($controlColCell)) {
                        // handle column operations
                        that.handleAuthoringColumnOperations(selectedMenu, editColPath, $controlColCell);
                    }
                }
            };

        // Initialize the table
        this.initialize(tableId);
        // Find all the cells in the table
        allCells = this.element.find("td, th");

        // First show/hide table controls(these controls are used during authoring)
        // Now we show the tale controls always during authoring
        that.hideTableControl(allCells);

        // listener for click on cell
        allCells.click(function () {
            var el = $(this),
                pos = el.index(),
                colSpan = 0,
                $header = null;

            // Remove the selected item class since there is a new selection
            allCells.removeClass(CONSTANT_TABLE.TABLE_SELECTED_ITEM_CLASS);

            // get the control cell of the cell clicked
            // todo: if row span is supported, make changes here too
            $controlRowCell = el.parent().find("th, td").eq(0);
            // check if the cell clicked has a colspan
            if (el.attr("colspan") > 1) {
                // in case of colspan enabled, we highlight the last header of that merged cell
                $header = $("#" + el.attr("headers").split(" ").slice(-1)[0]);
            } else {
                //note: here we depende on server for headers
                $header = $("#" + el.attr("headers"));
            }
            if ($header.length > 0) {

                $controlColCell = allCells.filter(":nth-child(" + ($header.index() + 1) + ")").eq(0);
                editColPath = $header.attr("data-editpath");
            } else {
                // case when we click the control element
                $controlColCell = allCells.filter(":nth-child(" + (pos + 1) + ")").eq(0);
                editColPath = allCells.filter(":nth-child(" + (pos + 1) + ")").eq(1).attr("data-editpath");
            }

            // Set edit row path and edit column path of the cell clicked
            editRowPath = el.parent().attr("data-editpath");

            // the clicked cell can either be a control row cell, control col cell or a simple cell
            if (el.is($controlRowCell)) {
                that.enableControls($controlRowCell, $tableControlSpan, contextMenuSettings, el, allCells, true);
            } else if (el.is($controlColCell)) {
                that.enableControls($controlColCell, $tableControlSpanClone, contextMenuSettings, el, allCells, true);
                // so that row gets sufficient width
                // this is a workaround
                $tableControlSpan.css({
                    "visibility" : "hidden"
                });
                $controlRowCell.append($tableControlSpan);
            } else {
                that.enableControls($controlRowCell, $tableControlSpan, contextMenuSettings, el, allCells, false);
                that.enableControls($controlColCell, $tableControlSpanClone, contextMenuSettings, el, allCells, false);
            }
        });

        // If clicked outside table cell, hide the table authoring HTML code
        $('html').click(function (e) {
            // Check if the parent of current target is a div
            // if target is not a child of table, then remove the table control element
            if (that.element.has(e.target).length === 0) {
                // check if any button or any other element of CQ Dialog is not clicked, only then remove it
                if ($(e.target).closest(".x-window-body").length === 0 && $(e.target).is("button") !== true) {
                    //allCells.filter("." + CONSTANT_TABLE.TABLE_CONTROL_ELEMENT_CLASS).hide();
                    //that.element.find("." + CONSTANT_TABLE.TABLE_CONTROL_ELEMENT_CLASS).empty();
                    that.element.filter("tr").removeClass(CONSTANT_TABLE.TABLE_SELECTED_ITEM_CLASS);
                    allCells.filter("." + CONSTANT_TABLE.TABLE_CONTROL_ELEMENT_CLASS).find("." + CONSTANT_TABLE.TABLE_ARROW_DOWN_CLASS).remove();
                    allCells.removeClass(CONSTANT_TABLE.TABLE_SELECTED_ITEM_CLASS);
                    // hide the table control row
                    //that.element.find("." + CONSTANT_TABLE.TABLE_CONTROL_ROW_CLASS).hide();
                }
            }
        });
    };

    GuideTableEdit.SELECTION_CONSTANT = SELECTION_CONSTANT;
    GuideTableEdit.COLSPAN_ONE_TEMPLATE = COLSPAN_ONE_TEMPLATE;
    GuideTableEdit.CONSTANT_TABLE = CONSTANT_TABLE;
    GuideTableEdit.ROW_ITEM_TEMPLATE = ROW_ITEM_TEMPLATE;
    GuideTableEdit.RESOURCE_TYPE_TABLE = RESOURCE_TYPE_TABLE;
    GuideTableEdit.RESOURCE_TYPE_TABLE_ROW = RESOURCE_TYPE_TABLE_ROW;

    /**
     * Creating basic prototype required for table authoring utility
     */
    _.extend(GuideTableEdit.prototype, {

        /**
         * Initializes the table based on the html id passed
         * @param tableId
         */
        initialize : function (tableId) {
            this.element = $("#" + tableId);
            this.createTableContextMenu();
        },
        /**
         * Handles table column authoring utilities
         * Note: As of now, only ADD, DELETE Operations are supported on table column
         * @param selectedMenu      Menu selected by the user in the context menu
         * @param editColPath       Content path of the cell click
         * @param $controlColCell   Control Cell clicked by the user
         */
        handleAuthoringColumnOperations : function (selectedMenu, editColPath, $controlColCell) {
            var colIndex = 0,
                tableControlRowSelector = "tr:not(." + CONSTANT_TABLE.TABLE_CONTROL_ROW_CLASS + ")",
                $selectedMenu = selectedMenu.parent(),
                rowPathMap = null;
            // If clicked on delete, invoke delete operation
            if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editColPath);
                GuideTableEdit.deleteCol(editable, $controlColCell);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editColPath);
                GuideTableEdit.addCol(editable, $controlColCell);
            }
        },

        /**
         * Handles table row authoring utilities
         * Note: As of now, only ADD, DELETE, EDIT Operations are supported on table row
         * @param selectedMenu      Menu selected by the user in the context menu
         * @param editRowPath       Content path of the cell click
         */
        handleAuthoringRowOperations : function (selectedMenu, editRowPath, numOfCols) {
            var $selectedMenu = selectedMenu.parent();
            if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_EDIT_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editRowPath);
                CQ.wcm.EditBase.showDialog(editable, CQ.wcm.EditBase.EDIT);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_EDIT_RULES_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editRowPath);
                editConfigListener.showExpressionEditor.apply(editable);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS)) {
                GuideTableEdit.deleteRow(editRowPath);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS)) {
                // Generate the template using the editable
                var editable = window.guidelib.author.editConfigListeners._getEditable(editRowPath);
                GuideTableEdit.addRow(editable);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editRowPath);
                GuideTableEdit.moveRowUp(editable);
            } else if ($selectedMenu.hasClass(CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS)) {
                var editable = window.guidelib.author.editConfigListeners._getEditable(editRowPath);
                GuideTableEdit.moveRowDown(editable);
            }
        },

        /**
         * This function enables the table controls during authoring
         *
         * @param controlElement                control Element associated
         * @param spanElement                   Span Element present inside control which holds the icon for table authoring
        * @param contextMenuSettingsForSpan     Context Menu Setting required for the span inside control element
         * @param clickedCell                   Clicked Cell during authoring(can be control row, control col or normal cell)
         * @param allCells                      Represents all the cells present inside the table
         * @param allowSpanClick                Do we want to allow click on span(Useful when a user directly clicks on a control cell and to highlight the selected row/column)
         */
        enableControls : function (controlElement, spanElement, contextMenuSettingsForSpan, clickedCell, allCells, allowSpanClick) {
            if (spanElement.css("visibility") === "hidden") {
                //reset back to visible state
                spanElement.css("visibility", "visible");
                if (controlElement.has(spanElement)) {
                    // if span element is present remove it
                    controlElement.empty();
                }
            }
            // Attach context menu to the control span
            spanElement.guideContextMenu(contextMenuSettingsForSpan);
            // Append that to the table row/col cell
            // Add click listeneres for $controlRowCell and $controlColCell
            controlElement.append(spanElement)
                    .click($.proxy(this.handleTableControlElementClick, this, spanElement, clickedCell, allCells, allowSpanClick));
        },

        /**
         * Utility to hide table authoring operations.
         * For eg: If one clicks outside the table, we would remove the border present outside the table
         * If a tableControlElement is clicked, we would want to highlight the associated row/column
         * @param allCells      Represent all the cells present inside the table
         */
        hideTableControl : function (allCells) {
            // First empty all selection on table control(remove span)
            allCells.filter("." + CONSTANT_TABLE.TABLE_CONTROL_ELEMENT_CLASS).empty();
            // Then show all the table control
            allCells.filter("." + CONSTANT_TABLE.TABLE_CONTROL_ELEMENT_CLASS).show();

            // Show the table control row
            this.element.find(".tableControl").show();
        },

        /**
         *
         * If a table control element is clicked, we highligh all cells of row/column
         *
         * @param $tableControlSpan     Span(holds icon) associated with the table control element
         * @param cell                  Cell clicked
         * @param allCells              All Cells present inside table
        * @param allowSpanClick         Do we support click on span, to highligh the row/column
         * @param event                 Event objec associated the click
         */
        handleTableControlElementClick : function ($tableControlSpan, cell, allCells, allowSpanClick, event) {
            var $el = $(event.target),
                cellIndex = null,
                bRowSelected;
            if (allowSpanClick || !$el.is($tableControlSpan)) {
                // Add blue background to the selected item
                cellIndex = $el.index();
                bRowSelected = $el.parent().hasClass("tableControl");
                if (!bRowSelected) {
                    cell.closest("tr").find("th, td:not(.tableControlElement)").addClass(CONSTANT_TABLE.TABLE_SELECTED_ITEM_CLASS);
                } else {
                    var header = allCells.filter(":nth-child(" + (cellIndex + 1) + "):not(.tableControlElement)").eq(0).attr("id");
                    allCells.filter(function () {
                        var id = $(this).attr("headers");
                        if (id) {
                            return id.indexOf(header) > -1;
                        }
                    }).addClass(CONSTANT_TABLE.TABLE_SELECTED_ITEM_CLASS);
                }

            }
        },

        /**
         * Create table context menu
         */
        createTableContextMenu : function () {
            if (sCreateContextMenu) {
                this.$tableContextMenu = $("<ul/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_CLASS + " dropdown-menu")
                    .attr("role", "menu")
                    .css({
                        "display" : "none",
                        "z-index" : "10000"
                    });
                // todo: write table utility
                this.$tableContextMenu.append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_ADD_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_ADD_TEXT)
                        )
                    ).append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_DELETE_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_DELETE_TEXT)
                        )
                    ).append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_EDIT_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_EDIT_TEXT)
                        )
                    ).append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_EDIT_RULES_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_EDIT_RULES_TEXT)
                        )
                    ).append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_MOVE_UP_TEXT)
                        )
                    ).append(
                        $("<li/>").addClass(CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_CLASS).append(
                            $("<a/>").attr("href", "#").attr("tabindex", "-1").append(CONSTANT_TABLE.CONTEXT_MENU_MOVE_DOWN_TEXT)
                        )
                    );
                sCreateContextMenu = false;
                $("." + CONSTANT_TABLE.CONTEXT_MENU_WRAPPER).after(this.$tableContextMenu);
            }

        }
    });

    /**
     * Check if given path is child of table
     * @param path
     * @returns {boolean}
     */
    GuideTableEdit.isChildOfTable = function (editable) {
        var editableDom = guidelib.author.AuthorUtils._getEditableDom(editable);
        if (!editableDom) {
            var parentEditable = Granite.author.editables.getParent(editable);
            if (parentEditable.type == "fd/af/components/table") {
                return true;
            }
            editableDom = guidelib.author.AuthorUtils._getEditableDom(parentEditable);
        }
        return $(editableDom).closest("table").length > 0;
    };

    GuideTableEdit.isHeaderCell = function (editable) {
        return $(guidelib.author.AuthorUtils._getEditableDom(editable)).parents("thead").length == 1;
    };

    GuideTableEdit.isTableRow = function (editable) {
        return $(guidelib.author.AuthorUtils._getEditableDom(editable)).is("tr");
    };

    /**
     * Both UI, call their respective dialogs.
     * Touch UI, in addition to this, handles history services.
     * @param editable
     */
    GuideTableEdit.deleteRow = function (editable) {
        editConfigListener.deleteRow(editable);
    };

    /**
     * Classic UI calls deleteColHandler directly, whereas
     * Touch UI, in addition to this, handles history services.
     * @param editable
     * @param $controlColCell
     *
     */
    GuideTableEdit.deleteCol = function (editable, $controlColCell) {
        editConfigListener.deleteCol(editable, $controlColCell);
    };

    GuideTableEdit.deleteColHandler = function (editable, $controlColCell, historyOfTable) {
        var tableControlRowSelector = "tr:not(." + CONSTANT_TABLE.TABLE_CONTROL_ROW_CLASS + ")",
            rowPathMap = null,
            colIndex = editConfigListener.getTableColIndex(editable, $controlColCell),
            header = $(guidelib.author.AuthorUtils._getEditableDom(editable)).closest("table").find(tableControlRowSelector).eq(0).find("th").eq(colIndex),
            headerValue = header.attr("id");
        // Get the row path by iterating
        // walk through all tr and get path
        rowPathMap = $(guidelib.author.AuthorUtils._getEditableDom(editable)).closest("table").find(tableControlRowSelector).map(function () {
            var path = null,
                colSpan = 1;
            $(this).children().each(function () {
                var id = $(this).attr("headers");
                if (id) {
                    if (id.indexOf(headerValue) > -1) {
                        path = $(this).attr("data-editpath");
                        colSpan = $(this).attr("colspan");
                        return;
                    }
                }
            });
            return {
                "path" : path === null ? $(this).find("th").eq(colIndex).attr('data-editpath') : path,
                "colSpan" : colSpan
            };
        });

        if (_.isObject(rowPathMap) && !_.isEmpty(rowPathMap)) {
            // todo: check if header/footer row is there or not in this file
            editConfigListener.deleteColumnHandler(rowPathMap, editable.path, historyOfTable);
        }
    };

    /**
     * Classic UI calls addRowHandler directly, whereas
     * Touch UI, in addition to this, handles history services.
     * @param editable
     */
    GuideTableEdit.addRow = function (editable) {
        editConfigListener.addRow(editable);
    };
    GuideTableEdit.addRowHandler = function (editable) {
        // Insert row after the selected parent
        var tableParentPath = editable.getParentPath(),
            numOfCols = $(editable.dom ? editable.dom : editable.element.dom).parents("table").find("th:not(.tableControlElement)").length,
            selectedNodeName = editable.path.substr(editable.path.lastIndexOf("/") + 1),
            newNodePath = tableParentPath + "/" + CONSTANT_TABLE.ROW_NAME_PREFIX + new Date().getTime(),
            params = {},
            orderParams = {},
            templateJson = _.extend({"items" : {}}, ROW_TEMPLATE),
            response = null;
        // Dynamically create names for the table item so that submission of table is correct
        for (var i = 0; i < numOfCols; i++) {
            templateJson["items"]["tableItem" + (new Date().getTime() + (i + 1))] = _.extend({}, ROW_ITEM_TEMPLATE);
        }
        // Now extend the params object to create a new object
        params = _.extend(params, {
            ":operation" : "import",
            ":contentType" : "json",
            ":replace" : true,
            ":content" : JSON.stringify(templateJson),
            ":replaceProperties" : true
        });
        // First create a node and let the sling post node creation algorithm decide the name
        //params["@CopyFrom"] = contentPath;

        // Specify the Order
        orderParams[CQ.Sling.ORDER] = "after " + selectedNodeName ;
        response = CQ.shared.HTTP.post(newNodePath, null, params);
        var isAdded = CQ.shared.HTTP.isOk(response);
        if (isAdded) {
            //For some reason, :operation = import and :order are not working in single call, so making that sequential
            response = CQ.shared.HTTP.post(newNodePath, null, orderParams);
            isAdded = CQ.shared.HTTP.isOk(response);
            if (isAdded) {
                this.refreshTable(editable.path);
            }
        }
        return isAdded;
    };

    /**
     * Classic UI calls moveRowUpHandler directly, whereas
     * Touch UI, in addition to this, handles history services.
     * @param editable
     */
    GuideTableEdit.moveRowUp = function (editable) {
        editConfigListener.moveRowUp(editable);
    };
    /**
     * Moves the current row(contentPath) specified up the hierarchy
     * @param contentPath
     */
    GuideTableEdit.moveRowUpHandler = function (editable) {
        // Insert row after the selected parent
        var $rowTbody = $(editable.dom ? editable.dom.parent() : editable.element.dom),
        // In authoring, we have each tr inside tbody, hence the code
            $prevTableRow = $rowTbody.prev().find("tr"),
            prevTableRowPath = $prevTableRow.attr("data-editpath"),
            selectedNodeName = prevTableRowPath.substring(prevTableRowPath.lastIndexOf("/") + 1),
            orderParams = {},
            response = null;

        // Specify the Order
        orderParams[CQ.Sling.ORDER] = "before " + selectedNodeName ;
        response = CQ.shared.HTTP.post(editable.path, null, orderParams);
        var isMovedSuccess = CQ.shared.HTTP.isOk(response);
        if (isMovedSuccess) {
            GuideTableEdit.refreshTable(editable.path);
        }
        return isMovedSuccess;
    };

    /**
     * Classic UI calls moveRowDownHandler directly, whereas
     * Touch UI, in addition to this, handles history services.
     * @param editable
     */
    GuideTableEdit.moveRowDown = function (editable) {
        editConfigListener.moveRowDown(editable);
    };
    /**
     * Moves the current row(contentPath) specified down the hierarchy
     * @param contentPath
     */
    GuideTableEdit.moveRowDownHandler = function (editable) {
        // Insert row after the selected parent
        var $rowTbody = $(editable.dom ? editable.dom.parent() : editable.element.dom),
        // In authoring, we have each tr inside tbody, hence the code
            $prevTableRow = $rowTbody.next().find("tr"),
            prevTableRowPath = $prevTableRow.attr("data-editpath"),
            selectedNodeName = prevTableRowPath.substring(prevTableRowPath.lastIndexOf("/") + 1),
            orderParams = {},
            response = null;

        // Specify the Order
        orderParams[Granite.Sling.ORDER] = "after " + selectedNodeName ;
        response = CQ.shared.HTTP.post(editable.path, null, orderParams);
        var isMovedSuccess = CQ.shared.HTTP.isOk(response);
        if (isMovedSuccess) {
            GuideTableEdit.refreshTable(editable.path);
        }
        return isMovedSuccess;
    };

    /**
     * Classic UI calls addColHandler directly, whereas
     * Touch UI, in addition to this, handles history services.
     * @param editable
     * @param $controlColCell
     */
    GuideTableEdit.addCol = function (editable, $controlColCell) {
        editConfigListener.addCol(editable, $controlColCell);
    };

    GuideTableEdit.addColHandler = function (editable, $controlColCell) {
        var editableDom = $(guidelib.author.AuthorUtils._getEditableDom(editable)),
            tableControlRowSelector = "tr:not(." + CONSTANT_TABLE.TABLE_CONTROL_ROW_CLASS + ")",
            colIndex = editConfigListener.getTableColIndex(editable, $controlColCell),
            header = editableDom.closest("table").find(tableControlRowSelector).eq(0).find("th").eq(colIndex),
            headerValue = header.attr("id"),
            rowPathMap = null;
        // Get the row path by iterating
        rowPathMap = editableDom.closest("table").find(tableControlRowSelector).map(function () {
            var dataEditPath = null,
                template = null,
                colSpan = 1;
            $(this).children().each(function () {
                var id = $(this).attr("headers");
                if (id) {
                    if (id.indexOf(headerValue) > -1) {
                        dataEditPath = $(this).attr("data-editpath");
                        colSpan = $(this).attr("colspan");
                        return;
                    }
                }
            });

            return {
                "path" : $(this).attr('data-editpath'),
                // if we don't have data edit path, then this is a header row
                "copyFromCellPath" : dataEditPath === null ? $(this).find("th").eq(colIndex).attr('data-editpath') : dataEditPath,
                "template" : dataEditPath === null ? HEADER_ITEM_TEMPLATE : ROW_ITEM_TEMPLATE,
                "colSpan" : colSpan
            };
        });
        return GuideTableEdit._addColInternal(colIndex, rowPathMap, editable.path, editableDom);
    };

    GuideTableEdit._addColInternal = function (colIndex, rowPathMap, editColPath, $headerCell) {
        if (_.isObject(rowPathMap) && !_.isEmpty(rowPathMap)) {
            // todo: check if header/footer row is there or not in this file
            var rowPath = null,
                isColumnItemCreated = false,
                that = this,
                params = {},
                cellPath = null,
                nodeName = null,
                response = null;
            // Walk through the row path array and create a table item
            _.each(rowPathMap, function (rowMap, index) {
                rowPath = rowMap.path + "/items/" + CONSTANT_TABLE.TABLE_CELL_NAME_PREFIX + new Date().getTime();
                if (rowMap.colSpan == 1) {
                    // Reset params first
                    params = {};
                    // Now create an object at this path
                    // First create a node and let the sling post node creation algorithm decide the name
                    params[":content"] = JSON.stringify(rowMap.template);
                    // Now extend the params object to create a new object
                    params = _.extend(params, {
                        ":operation" : "import",
                        ":contentType" : "json",
                        ":replace" : true,
                        ":replaceProperties" : true
                    });
                    response = CQ.shared.HTTP.post(rowPath, null, params);
                    isColumnItemCreated = CQ.shared.HTTP.isOk(response);
                    //Ordering to add column in right position.
                    if (isColumnItemCreated) {
                        // Get the item after which we have to add the cell
                        cellPath = $headerCell.closest("table").find("tr:not(.tableControl)").eq(index).children().eq(colIndex).attr("data-editpath");
                        nodeName = cellPath.substring(cellPath.lastIndexOf("/") + 1);
                        params = {};
                        params[Granite.Sling.ORDER] = window.guidelib.author.AuthorUtils.INSERT_AFTER + " " + nodeName;
                        response = CQ.shared.HTTP.post(rowPath, null, params);
                        isColumnItemCreated = CQ.shared.HTTP.isOk(response);
                    }
                } else {
                    params = {
                        "colspan" : parseInt(rowMap.colSpan) + 1,
                        ":replaceProperties" : true
                    };
                    response = CQ.shared.HTTP.post(rowMap.copyFromCellPath, null, params);
                    isColumnItemCreated = CQ.shared.HTTP.isOk(response);
                }
            });
            if (isColumnItemCreated) {
                guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editColPath);
            }
            return isColumnItemCreated;
        }
    };

    GuideTableEdit.isFirstRow = function (editable) {
        var $rowTbody = $(editable.dom ? editable.dom.parent() : editable.element.dom);
        return $rowTbody.prev().is("thead");
    };

    GuideTableEdit.isLastRow = function (editable) {
        var $rowTbody = $(editable.dom ? editable.dom.parent() : editable.element.dom);
        return $rowTbody.is(":last-child");
    };

    /**
     * Refresh Table Editable after any authoring operation(ADD, DELETE, EDIT)
     * @param path
     */
    GuideTableEdit.refreshTable = function (path) {
        // done so that we can support nested tables in future
        var editConfigListeners = window.guidelib.author.editConfigListeners,
            editable = editConfigListeners._getEditable(path),
            parentEditable = Granite.author.editables.getParent(editable);
        // if creation success, refresh the parent of table
        if (parentEditable != null) {
            var parentEditableDom = parentEditable.dom ? parentEditable.dom : parentEditable.element.dom;
            if (parentEditableDom != null && parentEditableDom.length > 0) {
                var $table = parentEditableDom.closest("table").parent(),
                // get the parent path
                    parentTablePath = $table.attr("data-editpath");
                // use the path to get table editable
                if (parentTablePath != null) {
                    parentEditable = editConfigListeners._getEditable(parentTablePath);
                }
            }
            // refresh parent rendition
            if (parentEditable != null) {
                parentEditable.refresh();
            }
        } else {
            editConfigListener.REFRESH_GUIDE();
        }
        // only in touch authoring
        if (window.Granite && window.Granite.author) {
            // update the form object hierarchy by checking if initialized
            if (guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
                guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree(parentEditable.path);
            }
        }
    };

    /**
     * Template of cell
     * @type {{jcr:primaryType: string, hideTitle: string, guideNodeClass: string, jcr:title: string, sling:resourceType: string, guideComponentType: string}}
     */
    GuideTableEdit.CELL_TEMPLATE = ROW_ITEM_TEMPLATE;

    /**
     * This function hides "Cut, Delete, Add" Context Menu options
     * from a table cell
     */
    GuideTableEdit.hideTableCellContextMenuOptions = function () {
        var intId = setInterval(function () {
            var guideEditables = window.guidelib.author.editConfigListeners._getEditables();
            _.each(guideEditables, function (item) {
                if (item.path.substr(item.path.lastIndexOf("/") + 1) !== "guideContainer") {
                    if (item.enableContextMenu) {
                        if (guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(item)) {
                            item.addElementEventListener(item.element.dom, "contextmenu", guidelib.author.AuthorUtils.GuideTableEdit.handleContextMenu, true, item);
                            clearInterval(intId);
                        }
                    }
                }
            });
        }, 1000);
    };

    /**
     * This function hides the table row editable
     * Not using hide, it is even hiding child editables
     * from a table cell
     */
    GuideTableEdit.hideTableRowEditable = function (tableRowEditable) {
        var $placeHolderElement = null,
            $element = null;
        // Hide table row editables
        if (tableRowEditable.dialog && (tableRowEditable.dialog.indexOf("tableRow") > -1 || tableRowEditable.dialog.indexOf("tableHeader") > -1)) {
            // Hide the edit bars
            var clsPath = tableRowEditable.getClsPath("cq-placeholder");
            $placeHolderElement = $("." + clsPath);
            $element = $(tableRowEditable.getEl().dom);
            if ($placeHolderElement) {
                $placeHolderElement.css({
                    position : "absolute",
                    top : -1000,
                    left : -1000
                });
            }
            if ($element) {
                $element.css({
                    position : "absolute",
                    top : -1000,
                    left : -1000
                });
            }
        }
    };

    GuideTableEdit._checkIfValidSelection =  function (selectedItems) {

        // walk through the selected items and get an array of jquery objects
        var $selectedItems = _.map(selectedItems, function (item, index) {
                return $(item.dom || item.element.dom).closest("td");
            }),
            cellIndexArr = [],
            $table = $selectedItems[0].closest("table"),
            state = SELECTION_CONSTANT.OTHERS,
            // now check if all cells belong to the same row
            $row = $selectedItems[0].parent(),
            allItemsNotInSameRow = _.some($selectedItems, function (item) {
                // note: we don't support merge on header row
                // note: we only support merging in consecutive cells
                cellIndexArr.push(item.index());
                return !item.closest("tr").is($row) && !item.is("th");
            }),
            allItemsNotInSameCol = null;
        // if items are not in same row, check if they are present in same column
        if (allItemsNotInSameRow) {
            var index = $selectedItems[0].index(),
                selector = "tr td:nth-child(" + (index + 1) + ")",
                allCells = $table.find(selector);
            allItemsNotInSameCol = _.some($selectedItems, function (item) {
                return _.filter(allCells, function (cellItem) {
                    return item.is(cellItem);
                }).length === 0;
            });
            if (!allItemsNotInSameCol) {
                state = SELECTION_CONSTANT.WITHIN_COL;
            }
        } else {
            // if items are present in same row, check if they are consecutive
            // Sum of elements should be equal to cell count
            if (checkIfConsecutive(cellIndexArr)) {
                state = SELECTION_CONSTANT.WITHIN_ROW;
            }
        }
        return state;

    };

    /**
     * This function disables Delete, cut and new on table cells
     * @param e
     */
    GuideTableEdit.handleContextMenu =  function (e) {
        // Get the linked edit component
        var component = this.element.linkedEditComponent,
            editable = this;
        // if there is no context, return
        if (!component) {
            return;
        }
        // if the menu component is not there, built it
        if (!component.menuComponent) {
            component.menuComponent = new CQ.Ext.menu.Menu({
                defaults : {
                    scope : component
                },
                "items" : component.menu.items
            });
        }
        var menu = component.menuComponent;
        // Using CQ.I18n for localization perspective
        // Issue: LC-3911301
        var optsDisabled = [menu.find('text', CQ.I18n.getMessage("Cut")), menu.find('text', CQ.I18n.getMessage("New..."))],
            optsVisible = [menu.find('text', CQ.I18n.getMessage("Merge")), menu.find('text', CQ.I18n.getMessage("Split Cells"))],
            optsInVisible = [menu.find('text', CQ.I18n.getMessage("Delete")), menu.find('text', CQ.I18n.getMessage("Paste"))];

        // Disable the options not require for items present inside table cell
        // show the merge option in context menu
        CQ.Ext.each(optsDisabled, function (opt) {
            if (opt && opt.length > 0) {
                opt[0].setDisabled(true);
            }
        });
        CQ.Ext.each(optsVisible, function (opt) {
            if (opt && opt.length > 0) {
                opt[0].setVisible(true);
            }
        });
        // Note: done so that merge is visible
        // this is not correct solution, but a workaround
        CQ.Ext.each(optsInVisible, function (opt) {
            if (opt && opt.length > 0) {
                opt[0].setVisible(false);
            }
        });
    };

})(window, $, guidelib);

