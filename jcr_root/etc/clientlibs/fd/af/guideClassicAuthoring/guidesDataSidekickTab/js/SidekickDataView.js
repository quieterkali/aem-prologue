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

(function ($) {
    /*
     * Note: below is shorter version of Class.getOrElse.
     * 1. It is copied primarily for reason that Class.js is runtime lib which is not loaded in cf# parent frame
     * 2. It uses jquery API instead of underscore.js since underscore.js is not available in that frame.
     */

    var getOrElse = function (object, propertyString, defaultValue) {
            var propChain = (propertyString || "").split(".");
            var currObject = object;
            $.each(propChain, function (index, prop) {
                if ($.isPlainObject(currObject)) {
                    currObject = currObject[prop];
                } else {
                    currObject = undefined;
                }
            });

            if (currObject === undefined) {
                return defaultValue;
            } else {
                return currObject;
            }
        },
        restrainChildDragIfParentRepeatable = function (xpathType, $element, dataTreeJsonObject) {
            var pathToParent = xpathType.substring(0, xpathType.lastIndexOf(".items")),
                parentJsonObject = null;
            while (pathToParent) {
                parentJsonObject = getOrElse(
                    dataTreeJsonObject,
                    pathToParent,
                    ""
                );
                if (getOrElse(parentJsonObject, "minOccur", 1) !== 1 || getOrElse(parentJsonObject, "maxOccur", 1) !== 1) {
                    $element.removeClass("cg-draggable");
                    break;
                }
                pathToParent = xpathType.substring(0, pathToParent.lastIndexOf(".items"));
            }
        };

    var draggable = function (el, sGroup, sConfig) {
        this.init(this.generateId(el), sGroup, sConfig);
    };
    CQ.Ext.extend(draggable, CQ.Ext.dd.DD, {
        generateId : function (el) {
            if (!el.id) {
                el.id = "" + new Date().getTime();
            }
            return el.id;
        },
        applyConfig : function () {
            draggable.superclass.applyConfig.apply(this);
            if (this.config.handleEl) {
                this.setHandleElId(this.generateId(this.config.handleEl));
            }
            if (this.config.dragEl) {
                this.setDragElId(this.generateId(this.config.dragEl));
            }
            this.moveOnly = this.config.moveOnly || false;
        },
        b4Drag : function (e) {
            if (this.config.b4Drag) {
                this.config.b4Drag.apply(this, arguments);
            }
            draggable.superclass.b4Drag.apply(this, arguments);
        },
        endDrag : function (e) {
            draggable.superclass.endDrag.apply(this, arguments);
            if (this.config.endDrag) {
                this.config.endDrag.apply(this, arguments);
            }
        }
    });

    $.fn.GuidesDraggable = function (options) {
        this.each(function () {
            new draggable(options.linkedEl || this, options.group || "Adaptive Form", options.config || {});
        });
    };

    var defaults = {
        isLeafNode : function (node) {
            return _.isUndefined(node.items);
        },
        getNodeName : function (node) {
            return node["jcr:title"];
        },
        getNodeId : function (node) {
            return "cf_" + this.getNodeName(node).replace(" ", "_");
        }
    };

    $.fn.treeView = function (options) {

        this.children().remove();
        var authorUtils = window.CQ.WCM.getContentWindow().guidelib.author.AuthorUtils;
        var settings = $.extend({}, defaults, options),
            renderContainer = function (node, xpathType, keyName) {
                settings.manipulateProperties(node);
                var startingElementOrContact = xpathType === "" ? "" : ".",
                    title = $("<span></span>").html(settings.getNodeName.apply(settings, arguments))
                                              .addClass(node.guideNodeClass)
                                              .data("xpathType", xpathType + startingElementOrContact + (keyName === "" ? node.name : keyName))
                                              .addClass("cg-draggable")
                                              .addClass("just-to-copy-som")
                                              .addClass('cg-treeview-leaf')
                                              .data("bindRef", node.bindRef)
                                              .data("assetRef", node.assetRef)
                                              .data("nameOfElement", node.name);
                // if adaptive forms fragment is present, then change the icon
                if (node["fragRef"]) {
                    title.addClass("guideFragment");
                }
                restrainChildDragIfParentRepeatable(xpathType, title, settings.json);
                //x-tool, x-tool toggle x-accordion-hd classes produce the +/- effect, these are cq classes
                var anchor = $("<a> </a>").attr('data-target', settings.getNodeId(node, xpathType, keyName)).addClass("x-tool").addClass("x-tool-toggle").addClass("cg-indicator"),
                    titleInLi = $('<li class="cg-treeview-child cg-treeview-hoverable-li-title x-accordion-hd"> </li>').append(anchor).append(title),
                    liInUl = $('<ul class="cg-treeview-children container"> </ul>').append(titleInLi),
                    elem = $("<div></div>").addClass('cg-treeview-container').append(liInUl),
                    children = $("<ul></ul>").addClass("cg-treeview-children ").appendTo(elem);
                children.addClass("leaf");
                children.attr('id', settings.getNodeId(node, xpathType, keyName));

                _.each(_.keys(node.items), function (key) {
                    if (_.isObject(node["items"][key]) && node.items.hasOwnProperty(key) && typeof node["items"][key]["name"] !== 'undefined')   {
                        var startingItemOrMid = xpathType === "" ? "items." : ".items.",
                            child = $("<li></li>").html(render(node["items"][key], xpathType + startingItemOrMid + key, key))
                                                  .addClass("cg-treeview-child")
                                                  .attr("data-name", node["items"][key]["jcr:title"].toLowerCase())
                                                  .attr("data-xdp-som", node["items"][key]["bindRef"])
                                                  .appendTo(children);
                        if ($($(child).children()).is('span.leaf-attr-or-ele')) {
                            $(child).addClass("cg-treeview-hoverable-li");
                        }
                        $(child).click(function (event) {
                            if ($(this).hasClass("cg-treeview-child-added")) {
                                var xfaSom = $(this).data("xdp-som"),
                                    selector = "div[data-xdp-som='" + xfaSom + "']",
                                    wind = window.CQ.WCM.getContentWindow(),
                                    id = wind.$(selector).data("guide-id"),
                                    widget = wind.$("#" + id).find("input,select,textarea,button")[0];
                                //Checking CQ.WCM.getMode() is returning inconsistent results with cf#. So this fallback implementation.
                                wind.guidelib.author.AuthorUtils.setAuthoringFocus(id); //Use alternate API in authoring for setFocus
                                // case: if static text or not
                                if (widget) {
                                    widget.focus();
                                } else {
                                    wind.$("#" + id).focus();
                                }
                            }
                        });

                    }
                });
                return elem;
            },
            renderLeaf = function (node, xpathType, keyName) {
                settings.manipulateProperties(node);
                var name = settings.getNodeName(node),
                    subtype = settings.getNodeSubtype(settings.json),
                    $el = $("<span></span>").addClass('cg-treeview-leaf')
                                            .addClass(node.guideNodeClass)
                                            .addClass(subtype)
                                            .addClass("just-to-copy-som")
                                            .html(name)
                                            .addClass("cg-draggable")
                                            .addClass("leaf-attr-or-ele")
                                            .data("nameOfElement", node.name)
                                            .data("xpathType", xpathType + "." + keyName)
                                            .data("bindRef", node.bindRef)
                                            .data("assetRef", node.assetRef);
                restrainChildDragIfParentRepeatable(xpathType, $el, settings.json);
                return $el;

            },
            render = function (node, xpathType, keyName) {
                if (settings.isLeafNode(node)) {
                    return renderLeaf(node, xpathType, keyName);
                } else {
                    return renderContainer(node, xpathType, keyName);
                }

            },
            placeholderString = CQ.I18n.getMessage("Search Form Elements"),
            search = $("<div id='search' ></div>").addClass("search")
                                                  .append("<input placeholder='" + placeholderString + "' type='text' />"),
            body = $("<div></div>").addClass("cg-treeview-body")
                                   .append(search)
                                   .append(render(options.json, "", "")),
            diffX,diffY,currX,currY,drag,self = this;
        this.css(
            {
                "position" : "initial",
                "padding-left" : "5px",
                "overflow" : "auto",
                "top" : "-06px",
                "left" : "1px",
                "right" : "15px",
                "background" : "rgb(240, 237, 237)",
                "font" : "normal 11px Tahoma, Arial, Helvetica, sans-serif"
            }
        )//.addClass("cg-treeview cg-treeview-body-expanded")
            .append(body)
            .GuidesDraggable({
                config : {
                    dragEl : self[0],
                    b4Drag : function (evnt) {
                        self.addClass("cg-treeview-move");
                    },
                    endDrag : function (evnt) {
                        self.removeClass("cg-treeview-move");
                    }
                }
            });

        $("input", search).click(function () {
            /*
            * Bug No: LC-4185 Under data section in sidekick, search form element is not working
            * Default click event handler is getting prevented, adding it explicitly here
            */
            this.focus();
        }).keyup(function (event) {
            var val = $(this).val();

            if (val.length > 0) {
                var seclass = "li[data-name*='" + val.trim().toLowerCase() + "']",
                    filterclasses = ".cg-treeview-body " + seclass;
                $(".cg-treeview-body li").hide();
                filterclasses = filterclasses + "," + filterclasses + " li";
                $(filterclasses).show();
                $(filterclasses).parents().show();
            } else {
                $(".cg-treeview-body li").show();
            }
        });

        var $clickedElement;
        var liDrag = CQ.Ext.extend(CQ.wcm.ContentFinderDragZone, {
            group : "Adaptive Form",
            getDragData : function (e) {
                var sourceEl = e.target;
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = CQ.Ext.id();
                    return {
                        ddel : d,
                        sourceEl : sourceEl,
                        repairXY : CQ.Ext.fly(sourceEl).getXY(),
                        xpathType : $(sourceEl).data("xpathType"),
                        cfInstance : settings.cfInstance
                    };
                }
            },

            getRepairXY : function () {
                return this.dragData.repairXY;
            },

            _getUrl : authorUtils._getUrl,

            _getOrderParams : authorUtils._getOrderParams,

            _convertPanelToTable : authorUtils._convertPanelToTable,

            _addTableCellSpecificProp : authorUtils._addTableCellSpecificProp,

            /**
             * This function is used to check if the content dropped on to a table cell
             * is a container, container here means not composite field, but panel, table or table row
             * In future if we add more containers, this function has to be changed.
             * Also, it is invoked only in the case where the item is dropped onto a table cell
             * @param contentObject
             * @private
             */
            _isContainer : authorUtils._isContainer,

            /*
            * This function will strip  items of
            * a panel having "fragRef"
            * As we always get items of the rootPanel of fragRef  in case
            * we encounter this property while creating
            * JSON and HTML so striping off
            * items in tree hierarchy
            * */
            _emptyItemsForFragments : function (jsonModel) {

                if (jsonModel.hasOwnProperty("fragRef")) {
                    jsonModel.items = {};
                }
                _.each(jsonModel.items, function (item, index) {
                    if (item.hasOwnProperty("fragRef")) {
                        item.items = {};
                    } else {
                        // do it recursivly for  all child items
                        this._emptyItemsForFragments(item);
                    }
                }, this);

            },

            notifyDropDT : function (dropTarget, e, data) {
                if (this.isDropAllowed(dropTarget)) {
                    var editComponent = dropTarget.editComponent,
                        wind = window.CQ.WCM.getContentWindow(),
                        isChildOfTable = wind.guidelib.author.AuthorUtils.GuideTableEdit.isChildOfTable(editComponent),
                        insertedBeforeEBName = null,
                        isPanelDroppedOnTableCell = false,
                        nodeKeyName = null,
                        url = null,
                        isDropAllowed = true,
                        orderParams = {};

                    var nodeKeyNameIndex = data.xpathType.lastIndexOf(".") + 1;
                    if (nodeKeyNameIndex == -1) {
                        nodeKeyNameIndex = 0;
                    }
                    // get content finder instance
                    var cfInstance = window[data.cfInstance];
                    var contentObject = getOrElse(
                        cfInstance.dataModelHierarchy.options.json,
                        data.xpathType.substring(0, data.xpathType.lastIndexOf(".")),
                        ""
                        ),
                        // cloning it since we do conversion in case of table
                        // Suppose a valid panel is dropped on to table, then we convert the JSON
                        // Now if the same panel is dropped outside, we many not want it to be a table row, hence cloning it so that the original
                        // object remains intact
                        clonedContentObject = $.extend(true, {}, contentObject);
                    if (_.isEmpty(clonedContentObject)) {
                        clonedContentObject = cfInstance.dataModelHierarchy.options.json;
                    }
                    nodeKeyName = data.xpathType.substring(nodeKeyNameIndex, data.xpathType.length);

                    this._emptyItemsForFragments(clonedContentObject);

                    // In case of table we do separate calculation
                    if (isChildOfTable) {
                        var $tableRow = $(editComponent.element.dom).closest("tr"),
                        // very critical: is this right ? we check for number of cells in header always, no concept of colspan checking
                            numOfCells = $(editComponent.element.dom).closest("table").find("th:not('.tableControlElement')").length,
                            rowIndex = $tableRow.index(),
                            that = this,
                            numOfItemsInJson = 0;
                        // Check if content object is a container
                        if (this._isContainer(clonedContentObject)) {
                            isPanelDroppedOnTableCell = true;
                            _.each(clonedContentObject.items, function (item, index) {
                                if (_.isObject(item) && !that._isContainer(item)) {
                                    that._addTableCellSpecificProp(item);
                                    // Increment the count of items
                                    numOfItemsInJson++;
                                }
                                // we dont support panel inside panel
                                // Since we
                                if (that._isContainer(item)) {
                                    // we dont support drop of panel inside panel into table row
                                    isDropAllowed = false;
                                }
                            });
                            if (isDropAllowed) {
                                this._convertPanelToTable(clonedContentObject);
                            }
                        }
                        if (isPanelDroppedOnTableCell) {
                            if (isDropAllowed) {
                                // If items in json are less than actual cells present in the table row
                                // then we add template cell's
                                if (numOfCells >= numOfItemsInJson) {
                                    var count = numOfCells - numOfItemsInJson;
                                    for (var i = 0; i < count; i++) {
                                        // since we are adding hence +1 to rowIndex is cruicial
                                        clonedContentObject.items["tableItem" + (rowIndex + 1) + count] = wind.guidelib.author.AuthorUtils.GuideTableEdit.CELL_TEMPLATE;
                                    }
                                    editComponent = editComponent.getParentFromDOM();
                                    // Now to get the name of the row, just navigate one level up since the edit component points to field
                                    insertedBeforeEBName = editComponent.path.substring(editComponent.path.lastIndexOf('/') + 1);
                                    orderParams = this._getOrderParams(insertedBeforeEBName, true);
                                    // here edit component refers to table row, hence to go to table, we have to navigate two level's up
                                    url = this._getUrl(editComponent, nodeKeyName);
                                    isChildOfTable = false;
                                } else {
                                    // we done allow drop if items in json are more than existing items present in table row
                                    isDropAllowed = false;
                                    // todo: Refresh of table is done so that the edit rollover is not seen
                                    // todo: Once the edit rollover bug is fixed, this refresh has to be removed
                                    wind.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editComponent.path);
                                    // Lets log a warning to user now
                                    // Show msg of invalid selection
                                    // todo: Think of better string here ?
                                    CQ.Ext.Msg.show({
                                        title : CQ.I18n.getMessage('Drop Not Allowed'),
                                        msg : CQ.I18n.getMessage('Container has more items than items present in current table row. Please add more columns and retry'),
                                        buttons : CQ.Ext.Msg.OK,
                                        icon : CQ.Ext.Msg.ERROR
                                    });
                                }
                            } else {
                                wind.guidelib.author.AuthorUtils.GuideTableEdit.refreshTable(editComponent.path);
                                // Lets log a warning to user now
                                // Show msg of no support for panel inside panel to end user
                                // todo: Think of better string here ?
                                CQ.Ext.Msg.show({
                                    title : CQ.I18n.getMessage('Drop Not Allowed'),
                                    msg : CQ.I18n.getMessage('Dropped container is nested. This is not supported'),
                                    buttons : CQ.Ext.Msg.OK,
                                    icon : CQ.Ext.Msg.ERROR
                                });
                            }
                        }
                    }  else {
                        insertedBeforeEBName = editComponent.path.substring(editComponent.path.lastIndexOf('/') + 1);
                        orderParams = this._getOrderParams(insertedBeforeEBName);
                        url = this._getUrl(editComponent, nodeKeyName);
                    }
                    if (isDropAllowed) {
                        window.setTimeout(function () {
                            $.ajax({
                                type : "POST",
                                url : isChildOfTable ? editComponent.path : url,
                                data : _.extend({
                                    ":operation" : "import",
                                    ":contentType" : "json",
                                    ":content" : JSON.stringify(clonedContentObject),
                                    ":replace" : true,
                                    ":replaceProperties" : true,
                                    "_charset_" : "utf-8"
                                }),
                                async : false
                            }).done(function () {
                                    // In case of table field replace, we need to replace, there is no concept of order
                                    // but in case of panel added inside table cell, we add it after the dropped row
                                    if (isChildOfTable) {
                                        window.CQ.WCM.getContentWindow().REFRESH_GUIDE();
                                    } else {
                                        //For some reason, :operation = import and :order are not working in single call, so making that sequential
                                        $.ajax({
                                            type : "POST",
                                            url : url,
                                            data : orderParams,
                                            async : false
                                        }).done(function () {
                                                window.CQ.WCM.getContentWindow().guidelib.author.instances.lastFocusItemId = window.CQ.WCM.getContentWindow().guidelib.author.AuthorUtils.getHtmlId(url);
                                                window.CQ.WCM.getContentWindow().REFRESH_GUIDE();
                                            }
                                        );
                                    }
                                }
                            );
                        }, 1);
                    }
                    return this;
                }
                return false;
            },

            /**
             * Implements action when this drag zone enters over a drop target.
             * Called by <code>CQ.wcm.EditBase.DropTarget</code> objects.
             * @param {CQ.wcm.EditBase.DropTarget} dropTarget The calling drop target.
             * @see CQ.wcm.EditBase.DropTarget#notifyEnter
             * @private
             */
            notifyEnterDT : function (dropTarget, e, data) {
                if (this.isDropAllowed(dropTarget)) {
                    dropTarget.editComponent.showTarget();
                }
                return '';
            },
            /**
             * Implements action when this drag zone gets over of a drop target.
             * Called by <code>CQ.wcm.EditBase.DropTarget</code> objects.
             * @param {CQ.wcm.EditBase.DropTarget} dropTarget The calling drop target.
             * @see CQ.wcm.EditBase.DropTarget#notifyOver
             * @private
             */
            notifyOverDT : function (dropTarget, e, data) {
                if (this.isDropAllowed(dropTarget)) {
                    return this.dropAllowed;
                } else {
                    return this.dropNotAllowed;
                }
            },

            /**
             * Implements action when this drag zone gets out of a drop target.
             * Called by <code>CQ.wcm.EditBase.DropTarget</code> objects.
             * @param {CQ.wcm.EditBase.DropTarget} dropTarget The calling drop target.
             * @see CQ.wcm.EditBase.DropTarget#notifyOut
             * @private
             */
            notifyOutDT : function (dropTarget, e, data) {
                if (this.isDropAllowed(dropTarget)) {
                    dropTarget.editComponent.hideTarget(true);
                }
                return '';
            },

            /**
             * Returns if drop is allowed on the <code>dropTarget</code> param.
             * @param {CQ.wcm.EditBase.DropTarget} dropTarget The calling drop target.
             * @return {Boolean} True if drop is allowed, else false
             * @private
             */
            isDropAllowed : function (dropTarget) {
                return true;
            },

            onDragCancel : function (e, dropTarget) {
                if (dropTarget && dropTarget.editComponent && dropTarget.editComponent.hideTarget) {
                    dropTarget.editComponent.hideTarget();
                }
            }

        });
        $("span.cg-draggable", body).each(function () {
            new liDrag(new CQ.Ext.Element(this));
        });

        $("a.cg-indicator", body).click(function () {
            var ulTag = $(this).parent().parent();
            $('#' + $(this).data('target')).slideToggle(300);
            ulTag.toggleClass("x-panel-collapsed") ;
        });

        return this;
    };
    $(document).on("click", '#elementPopupClose', function () {
        $("#elementPopoverContainer", "body").toggle("slow");
    });
    $(document).on('dblclick', "span.just-to-copy-som", function (e) {
        e.preventDefault();
        var $elementPopoverContainer, $elementContentContainer;
        if ($("#elementPopoverContainer", "body").length === 0) {
            $elementPopoverContainer = $('<div id="elementPopoverContainer" class="guide-metadata-popover"></div>');
            $elementPopoverContainer.append('<h3 class="guide-metadata-popover-title">' +
                    'Binding Properties &nbsp' +
                    '<button id="elementPopupClose" type="button"' +
                    ' class="close guide-metadata-popover-close"  aria-hidden="true">×</button></h3>')
                .append('<div id="elementContentContainer" class="guide-metadata-popover-content"></div>');
            $elementPopoverContainer.appendTo("body");
        }
        $elementContentContainer = $('#elementContentContainer', "body");
        $elementPopoverContainer = $('#elementPopoverContainer', "body");
        var name = $(this).data("nameOfElement"),
            bindRef = $(this).data("bindRef"),
            assetRef = $(this).data("assetRef"),
            offset = $(this).offset(),
            bindRefData = (assetRef ? ("<strong>AssetRef:&nbsp </strong>" + assetRef + '<br/>') : ("<strong>BindRef:&nbsp </strong>" + bindRef + '<br/>')) +
                '<strong>Name: &nbsp </strong>' + name + '';
        if (bindRefData != $elementContentContainer.html()) {
            $elementPopoverContainer.css({display : 'none'});
        }
        $elementContentContainer.empty();
        $elementContentContainer.html(bindRefData);
        $elementPopoverContainer.css({top : offset.top, left : offset.left + this.offsetWidth / 2});
        $elementPopoverContainer.toggle("slow");
    });
})($CQ);
