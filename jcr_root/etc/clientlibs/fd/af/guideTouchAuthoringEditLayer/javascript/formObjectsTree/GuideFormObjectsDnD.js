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

(function ($, author, guidetouchlib, undefined) {

    var CONTAINER_NOT_ALLOWED_FOR_INSERTION_TYPE = [guidetouchlib.constants.ROOT_PANEL_TYPE, guidetouchlib.constants.TOOLBAR_TYPE,guidetouchlib.constants.GUIDECONTAINER_TYPE],
        CONTAINER_NOT_ALLOWED_FOR_INSERTION_CSP_TYPE = ["rootPanel", "toolbar", "guideContainer"],
    /*
     * override
     * */
    handleDragStart = function (event) {
        this.$dropTarget = null;
    },
    /*
    * override
    * */
    handleDragEnd = function (event) {
        // if we are inside the tree then only we need to handle the drop
        if ($(event.originalTarget).closest(".sidepanel-tree-component-items").length > 0) {
            var guideContainerPath = $(window._afAuthorHook._getAfWindow().document).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");
            if (this.editableNeighbour && this.editableNeighbour.path !== guideContainerPath) { // not to make insertion directly inside guide container

                var editable = window.guidelib.author.editConfigListeners._getEditable($(event.currentTarget).closest(".sidepanel-tree-item").data("path")),
                    moveAllowed = true;

                //can't insert editable before root panel
                if (guidetouchlib.utils.isEditableOfGivenType(this.editableNeighbour, guidetouchlib.constants.ROOT_PANEL_TYPE)) {
                    if (!guidetouchlib.utils.isEditableOfGivenType(editable, guidetouchlib.constants.TOOLBAR_TYPE) || this.dropLocation === "before") {
                        moveAllowed = false;
                    }
                }

                // is editable insertion allowed inside toolbar
                if (moveAllowed && this.editableNeighbour.getParent().getParent() && guidetouchlib.utils.isEditableOfGivenType(this.editableNeighbour.getParent().getParent(), guidetouchlib.constants.TOOLBAR_TYPE)) {
                    var toolbarEditable = window.guidelib.author.editConfigListeners._getEditable(this.editableNeighbour.getParent().path);
                    moveAllowed = guidetouchlib.utils.isToolbarInsertionAllowed(toolbarEditable, editable);
                }

                //if already toolbar is present in panel we can't insert another one
                if (moveAllowed && guidetouchlib.utils.isEditableOfGivenType(editable, guidetouchlib.constants.TOOLBAR_TYPE)) {
                    var toolbarPath = null;
                    if (guidetouchlib.utils.isEditableOfGivenType(this.editableNeighbour, guidetouchlib.constants.ROOT_PANEL_TYPE)) {
                        toolbarPath = this.editableNeighbour.getParent().path + "/toolbar";
                    } else {
                        toolbarPath = this.editableNeighbour.getParent().getParent().path + "/items/toolbar";
                    }
                    var toolbarEditable = window.guidelib.author.editConfigListeners._getEditable(toolbarPath);
                    if (toolbarEditable) {
                        moveAllowed = false;
                    }
                }
                // if editable and editableNeighbour is same or editableNeighbour is the parent of editable , don't allow the move
                if (editable === this.editableNeighbour) {
                    moveAllowed = false;
                } else if (author.editables.getParent(this.editableNeighbour)) {
                    if (author.editables.getParent(this.editableNeighbour) === editable || author.editables.getParent(author.editables.getParent(this.editableNeighbour)) === editable) {
                        moveAllowed = false;
                    }
                }

                if (moveAllowed) {
                    historyStep = author.history.util.Utils.beginStep();
                    var historyConfig = {
                        "step" : historyStep
                    };
                    var editables = author.selection.getAllSelected();
                    if (editables.length > 1) {   //multiselection drag and drop
                        author.editableHelper.doBulkOperation(author.edit.EditableActions.MOVE.execute, [this.dropLocation, this.editableNeighbour, historyConfig], editables).done(function () {
                            if (historyStep) {
                                author.history.util.Utils.finalizeStep(historyStep);
                                // We need to refresh the whole form after a drag and drop from the tree, User can drag any component to anywhere i.e.
                                // even a checkbox can be dragged parallel to a panel for tabbed layout
                                window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                            }
                        });
                    } else {
                        author.editableHelper.doMove(editable, this.dropLocation, this.editableNeighbour, historyConfig).done(function () {
                            if (historyStep) {
                                author.history.util.Utils.finalizeStep(historyStep);
                                window.guidelib.author.editConfigListeners.REFRESH_GUIDE();
                            }
                        });
                    }
                }
            }
        }

        guidetouchlib.editLayer.editLayerFormObjects.resetDropTarget();
    },

    //editableNeighbour(target editable) is computed along with the droplocation
    //dropLocation gives us the relative position where editable needs to be inserted
    handleDrag = function (event) {

        if (event.currentTarget !== event.originalTarget) {
            var $item = $(event.originalTarget);
            var cssClass = null;
            if (isSidePanelTreeItem($item))  {
                this.$dropTarget = $item.closest('.sidepanel-tree-item-div');
                var position = getRelativePostion(event.pageY, this.$dropTarget.offset().top, this.$dropTarget.height());
                this.editableNeighbour = window.guidelib.author.editConfigListeners._getEditable(this.$dropTarget.closest(".sidepanel-tree-item").data("path"));

                if (guidetouchlib.utils.isContainer(this.editableNeighbour)) {   //if editable is a container then we need to we need to divide it in three parts
                    if (position < 0.25) {   //make sibling before
                        this.dropLocation = "before";
                        cssClass = "topBorder";
                    } else if (position > 0.75) { //make sibling after
                        this.dropLocation = "after";
                        cssClass = "bottomBorder";
                    } else {          //make the child of the container
                        this.dropLocation = "before";   // before the first child
                        cssClass = "highlightDiv";
                        var $childTarget = this.$dropTarget.parent().find('.sidepanel-tree-item').eq(0);   // actual item before which we need to insert
                        if ($childTarget.length) {
                            this.editableNeighbour = window.guidelib.author.editConfigListeners._getEditable($childTarget.closest(".sidepanel-tree-item").data("path"));
                        } else {  // if no child item is present then make a new one
                            this.editableNeighbour = window.guidelib.author.editConfigListeners._getEditable(this.$dropTarget.parent().data('path') + "/items/*");
                        }
                    }
                } else {      //if item is not a container then we need to make the item sibling
                    if (position <= 0.5) {  // make sibling before
                        this.dropLocation = "before";
                        cssClass = "topBorder";
                    } else {    // make sibling after
                        this.dropLocation = "after";
                        cssClass = "bottomBorder";
                    }
                }
            } else if ($item.parent().is(".sidepanel-tree-item.is-parent")) {   // if we are outside div we need to make the sibling after the parent item
                this.$dropTarget = $item.prev();
                this.editableNeighbour = window.guidelib.author.editConfigListeners._getEditable(this.$dropTarget.closest(".sidepanel-tree-item").data("path"));
                var currentEditable = window.guidelib.author.editConfigListeners._getEditable($(event.currentTarget).parent().data("path"));
                //dont't make the sibling of rootpanel,guide container and toolbar except the case when toolbar is being dragged
                if (isContainerInvalid(this.editableNeighbour)
                    && !(guidetouchlib.utils.isEditableOfGivenType(currentEditable, guidetouchlib.constants.TOOLBAR_TYPE)
                    && !guidetouchlib.utils.isEditableOfGivenType(this.editableNeighbour, guidetouchlib.constants.GUIDECONTAINER_TYPE))) {
                    guidetouchlib.editLayer.editLayerFormObjects.resetDropTarget();
                    return;
                }
                cssClass = "highlightDiv";
                this.dropLocation = "after";
            } else {
                guidetouchlib.editLayer.editLayerFormObjects.resetDropTarget();
                return;
            }

            if (this.$dropTarget) {
                guidetouchlib.editLayer.editLayerFormObjects.setDropTarget(this.$dropTarget, cssClass);
            }
        }
    },
    /*
     * override
    * */
    handleDrop = function (event) {
    };

    guidetouchlib.editLayer.GuideFormObjectsDragAndDrop = author.util.extendClass(author.ui.ComponentDragAndDrop, {
        handleDragStart : handleDragStart,
        handleDragEnd : handleDragEnd,
        handleDrag : handleDrag,
        handleDrop : handleDrop
    });

    function getRelativePostion(eventY, offsetTop, height) {
        return (eventY - offsetTop) / height;
    };

    function isSidePanelTreeItem($item) {
        var divItem = $item.closest('.sidepanel-tree-item-div');
        if (divItem.parent().is(".sidepanel-tree-item")) {
            return true;
        }
        return false;
    };

    function isContainerInvalid(editable) {
        return typeof _.find(CONTAINER_NOT_ALLOWED_FOR_INSERTION_TYPE, function (containerType) {
            return containerType === editable.config.type;
        }) !== "undefined" || typeof _.find(CONTAINER_NOT_ALLOWED_FOR_INSERTION_CSP_TYPE, function (containerCspType) {
            var searchExpr = editable.config.csp;
            if (searchExpr != null) {
                return (searchExpr.lastIndexOf(containerCspType) !== -1) && (searchExpr.lastIndexOf(containerCspType) === searchExpr.length - containerCspType.length);
            } else {
                return false;
            }
        }) !== "undefined";
    };

    // register the controller at the dispatcher
    author.ui.dropController.register('GuideFormObject', new  guidetouchlib.editLayer.GuideFormObjectsDragAndDrop());

}(jQuery, Granite.author, window.guidelib.touchlib, this));
