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
    var headerHTML = "<tr is='coral-table-row'>" +
                        "<th is='coral-table-headercell'><coral-checkbox coral-table-select></th>" +
                       "<th is='coral-table-headercell' class='title-cell'>" + Granite.I18n.get("Title") + "</div>" +
                       "<th is='coral-table-headercell' class='summary-cell'>" + Granite.I18n.get("Content") + "</div>" +
                       "<th is='coral-table-headercell'></div>" +
                       "<th is='coral-table-headercell' class='status-cell'>" + Granite.I18n.get("Status") + "</div>" +
                   "</tr>",
        reorderHeaderHTML = "<tr is='coral-table-row'>" +
            "<th is='coral-table-headercell' class='title-cell'>" +
			Granite.I18n.get("Title") + "</div>" +
			"<th is='coral-table-headercell' class='summary-cell'>" +
			Granite.I18n.get("Content") + "</div>" +
			"<th is='coral-table-headercell' class='status-cell'>" +
			Granite.I18n.get("Status") + "</div>" +
			"<th is='coral-table-headercell' class='reorder-cell'>" +
			"</div>" + "</tr>",
		reorderEventContainerHTML = "<div class='reorder-table-container'>" + "</div>",
        iconHTML = '<coral-icon icon="chevronDown" size="XS" class="expandIcon"></coral-icon>',
        errorMsg = Granite.I18n.get("This is an incomplete rule and will not execute or perform any action on the form."),
        emptySummaryMessage = "<div class='empty-msg' >" + Granite.I18n.get("There are no rules on this object right now.") +
            "<br/>" + Granite.I18n.get("Use the ") +
            "<span class='empty-msg-create' >" + Granite.I18n.get("Create") + "</span>" +
            " " + Granite.I18n.get("button to add one.") + "</div>";
    var SummaryView = expeditor.SummaryView = expeditor.EventTarget.extend({
        init : function (el, ruleEditorEnabled) {
            this.el = el;
            this.$el = $(el);
        },
        _renderBlank : function () {
            this.$el.html(emptySummaryMessage);
        },
        _createRow : function (title, summaryHtml, isvalid, enabled, idx) {
            var encodedSummary = expeditor.Utils.encodeScriptableTags(summaryHtml);
            var status = "";
            var icon = new Coral.Icon().set({
                size : 'XS'
            });
            $(icon).addClass("summary-rule-icon");
            if (!isvalid) {
                icon.icon = "alert";
                status = Granite.I18n.get("Incomplete");
            } else if (!enabled) {
                icon.icon = "exclude";
                status = Granite.I18n.get("Disabled");
            } else {
                icon.icon = "check";
                status = Granite.I18n.get("Enabled");
            }
            return "<td is='coral-table-cell'><coral-checkbox coral-table-rowselect/></td>" +
                "<td is='coral-table-cell' class='title-cell'>" + title + "</td>" +
                "<td is='coral-table-cell' class='summary-cell'>" + encodedSummary + "</td>" +
                "<td is='coral-table-cell' class='expand-collapse-cell'>" + iconHTML + "</td>" +
                "<td is='coral-table-cell' class='status-cell' title='" + (isvalid ? "" : errorMsg) + "'>" + icon.outerHTML + status + "</td>";
        },

        _createReorderRow : function (title, summaryHtml, isvalid, enabled, idx) {
            var encodedSummary = expeditor.Utils.encodeScriptableTags(summaryHtml);
            var status = "";
            var icon = new Coral.Icon().set({
                size : 'XS'
            });
            $(icon).addClass("summary-rule-icon");
            if (!isvalid) {
                icon.icon = "alert";
                status = Granite.I18n.get("Incomplete");
            } else if (!enabled) {
                icon.icon = "exclude";
                status = Granite.I18n.get("Disabled");
            } else {
                icon.icon = "check";
                status = Granite.I18n.get("Enabled");
            }
            return "<td is='coral-table-cell' class='title-cell'>" + title + "</td>" +
                "<td is='coral-table-cell' class='summary-cell'>" + encodedSummary + "</td>" +
                "<td is='coral-table-cell' class='status-cell' title='" + (isvalid ? "" : errorMsg) + "'>" + icon.outerHTML + status + "</td>" +
                "<td is='coral-table-cell'>" +
                    "<button is='coral-button' variant='minimal' icon='dragHandle' coral-table-roworder></button>" +
                "</td>";
        },
        /**
         * Write/append at a particular position, the html in the view.
         * NOTE : Doesn't supports the other parameters as of now
         * @param html HTML to write
         * @param appendMode if true, the html will be added at the position specified otherwise, it
         *                   will replace the current html with the provided one.
         * @param position position to append the html at. If -1, appended at bottom. The parameter is ignored if
         *                 append Mode is false
         */
        write : function (summaryArray, appendMode, position) {
            var    numberOfItems = summaryArray.length;
            this.$el.empty();
            var self = this;
            if (numberOfItems < 1) {
                this.listView = null;
                this._renderBlank();
            } else {
                /*In Coral 3, listview is achieved through Table component
                 instead of CardView as used in Coral 2*/
                var listView = new Coral.Table();
                this.listView = listView;
                var el = this.$el;
                el.append(listView);
                /*Add handlers on next animation frame so table head has time to exist(for IE, Firefox)*/
                Coral.commons.ready(listView, function () {
                    var head = new Coral.Table.Head().set({
                        innerHTML : headerHTML
                    });
                    listView.querySelector("table").appendChild(head);
                    summaryArray.map(function (summaryObj, idx) {
                        var item = listView.items.add({
                            innerHTML : self._createRow(summaryObj.title, summaryObj.content, summaryObj.isvalid, summaryObj.enabled, idx),
                            title : summaryObj.title
                        });
                        item.setAttribute('data-node-index', idx);
                        if (summaryObj.isvalid) {
                            item.setAttribute('data-enabled', summaryObj.enabled);
                        }
                    });
                    listView.on('coral-table:change', $.proxy(self._onSelectionChange, self));
                    el.find(".expandIcon").on('click', function (e) {
                        var $bodyRow = $(this).closest(".coral-Table-row");
                        self._toggleRow($bodyRow);
                    });
                    /*Add handlers on next animation frame so table cells has time to exist(for IE, Firefox)*/
                    Coral.commons.ready(listView, function () {
                        el.find('.coral-Table-cell.summary-cell').on('click', function () {
                            var $bodyRow = $(this).parent();
                            self._toggleRow($bodyRow);
                        });
                        el.find(".title-cell").on('click', function (e) {
                            var row = $(e.target).closest("tr");
                            var index = parseInt(row.data("node-index"));
                            self.trigger("change:edit", {index : index});
                        });
                    });
                    listView.selectable = true;
                    listView.orderable = false;
                    listView.multiple = true;
                });
            }
        },

        populateReorderViewData : function (e1, eventArray, summaryArray, isCodeEditorEnabled) {
            for (var i = 0; i < eventArray.length; i++) {
                var reorderEventContainer = $(reorderEventContainerHTML);
                var reorderRuleTable = new Coral.Table();
                var reorderScriptTable = new Coral.Table();
                $(reorderRuleTable).addClass("reordered-rule-table");
                $(reorderScriptTable).addClass("reordered-script-table");
                reorderRuleTable.orderable = true;
                if (isCodeEditorEnabled) {
                    reorderScriptTable.orderable = true;
                }
                for (var j = 0; j < summaryArray.length; j++) {
                    var item;
                    if (summaryArray[j].eventName == eventArray[i]) {
                        if (summaryArray[j].isScript) {
                            item = reorderScriptTable.items.add({
                                innerHTML : this._createReorderRow(summaryArray[j].title, summaryArray[j].content, summaryArray[j].isvalid, summaryArray[j].enabled, summaryArray[j].index),
                                title : summaryArray[j].title
                            });
                        } else {
                            item = reorderRuleTable.items.add({
                                innerHTML : this._createReorderRow(summaryArray[j].title, summaryArray[j].content, summaryArray[j].isvalid, summaryArray[j].enabled, summaryArray[j].index),
                                title : summaryArray[j].title
                            });
                        }
                    }
                    if (item) {
                        item.setAttribute('data-node-index', summaryArray[j].index);
                        $(item).addClass("reordered-table-row");
                        if (summaryArray[j].isvalid) {
                            item.setAttribute('data-enabled', summaryArray[j].enabled);
                        }
                    }
                }
                reorderEventContainer.append(reorderRuleTable);
                reorderEventContainer.append(reorderScriptTable);
                e1.append(reorderEventContainer);
            }
        },

        renderReorderView : function (summaryArray, isCodeEditorEnabled, appendMode, position) {
            var numberOfItems = summaryArray.length;
            var eventArray = [];
            for (var i = 0; i < numberOfItems; i++) {
                if (!eventArray) {
                    eventArray.push(summaryArray[i].eventName);
                } else if (eventArray.indexOf(summaryArray[i].eventName) === -1) {
                    eventArray.push(summaryArray[i].eventName);
                }
            }
            this.$el.empty();
            var self = this;
            if (numberOfItems < 1) {
                this.listView = null;
                this._renderBlank();
            } else if (eventArray) {
                var reorderEventContainer = $(reorderEventContainerHTML);
                var el = this.$el;
                var headerTable = new Coral.Table();
                var head = new Coral.Table.Head().set({
                    innerHTML : reorderHeaderHTML
                });
                headerTable.querySelector("table").appendChild(head);
                e1 = el.append(headerTable);
                self.populateReorderViewData(e1, eventArray, summaryArray, isCodeEditorEnabled);
            }
        },

        _toggleRow : function ($bodyRow) {
            var isExpanded = $bodyRow.hasClass('expanded-row');
            var $chevronIcon = $bodyRow.find('.expandIcon');
            $bodyRow.toggleClass('expanded-row', !isExpanded);
            $chevronIcon.toggleClass('coral-Icon--chevronDown', isExpanded);
            $chevronIcon.toggleClass('coral-Icon--chevronUp', !isExpanded);
        },

        _onSelectionChange : function (e) {
            this.trigger('change:selection', {selections : this.listView.selectedItems.length,
                                              selectedIndices : this.listView.selectedItems.map(function (ruleRow) {
                                                  return $(ruleRow).data('node-index');
                                              }),
                                              selectedItems : this.listView.selectedItems});
        },
        deleteRule : function () {
            var self = this;
            var ruleTitles = this.listView.selectedItems.map(function (ruleRow, idx) {
                    return '<div class="rule-title" >' + ruleRow.title + '</div>';
                });
            var rulesToDelete = ruleTitles.length;
            var message = '<p>';
            if (rulesToDelete > 1) {
                message = message + Granite.I18n.get("Are you sure you want to delete the following rules?");
            } else {
                message = message + Granite.I18n.get("Are you sure you want to delete the following rule?");
            }
            message = message + ruleTitles.join('') + '</p>';
            var footer = '<button is="coral-button" coral-close>' + Granite.I18n.get('Cancel') + '</button>' +
                    '<button id="deleterules-button" is="coral-button" variant="warning" coral-close>' + Granite.I18n.get('Delete') + '</button>';
            expeditor.Utils.launchCustomModal("warning", Granite.I18n.get('Delete Rule'), message, footer, this.$el);
            $("#deleterules-button").one('click', function () {
                self._onDeleteConfirmation();
            });
        },
        _onDeleteConfirmation  : function () {
            var selections = this.listView.selectedItems;
            var deletedRules = [];
            if (selections) {
                for (var i = 0; i < selections.length; i++) {
                    var itemIndex = $(selections[i]).data('node-index');
                    deletedRules.push(itemIndex);
                }
                this.trigger('change:delete', {deletedRules : deletedRules});
            }
        },

        getSelectedRuleIndex : function () {
            var selections = this.listView.selectedItems;
            var index = [];
            selections.forEach(function (item) {
                index.push($(item).data("node-index"));
            });
            return index;
        },

        getUpdatedIndices : function () {
            var items = $("#rule-summary").find(".reordered-table-row");
            var itemIndex;
            var indices = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    itemIndex = $(items.get(i)).data('node-index');
                    indices.push(itemIndex);
                }
            }
            return indices;
        },

        clearSelection : function () {
            if (this.listView) {
                this.listView.selectedItems.forEach(function (item) {
                    item.selected = false;
                });
            }
        }
    });
}($));
