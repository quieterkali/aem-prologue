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
(function () {
    CQ.Ext.override(
        CQ.wcm.EditRollover,
        {
            /**
             * Call the originally defined observe function
             * for the EditRollover  or perform the
             * visibility observation depending upon the path of the EditRollOver
             * @private
             */
            observe : function (originalFunction) {
                return function () {
                    this.observeElementVisibility();
                    originalFunction.apply(this);
                };
            }(CQ.wcm.EditRollover.prototype.observe),

            /**
             * Base the visibility of the EditRollover on
             * the visibility of the element which the
             * EditRollover represents editing upon
             */
            observeElementVisibility : function () {
                if ((!this.hidden && !this.elementHidden) && (!jQuery(this.element.dom).is(":visible"))) {
                    this.hide();
                } else if ((this.hidden) && jQuery(this.element.dom).is(":visible")) {
                    this.show();
                }
            },

            /**
             * Overridden the refreshParent function so that the parent Panel gets refreshed.
             * First getParent() changes the context to the first parent i.e. items node and
             * the next getParent() changes the context to parent panel.
             */
            refreshParent : function () {
                if (this.path) {
                    try {
                        var ITEMS_SUBPATH = "/items",
                            componentPath = this.path,
                            forwardSlashLastIndex = componentPath.lastIndexOf("/");
                        if (componentPath.indexOf("guideContainer") > -1 && componentPath.substring(forwardSlashLastIndex - ITEMS_SUBPATH.length, forwardSlashLastIndex) == ITEMS_SUBPATH) {
                            var itemsNode = this.getParent();
                            if (itemsNode) {
                                var parentPanel = itemsNode.getParent();
                                if (parentPanel) {
                                    parentPanel.refresh();
                                    return;
                                }
                            }
                        } else {
                            // if the component is not of Adaptive Forms, then the RefreshParent of CQ is called.
                            CQ.wcm.EditBase.refreshParent();
                        }
                    } catch (e) {
                        this.logger().log("Error in Refreshing Parent", e);
                    }
                }
            }
        }
    );

    /*
     * Override the observe method of CQ.wcm.EditBar adding
     * an observeWidth (implemented in 5.5) and
     * observe visibility to support hiding and
     * showing of editables
     */
    CQ.Ext.override(
        CQ.wcm.EditBar,
        {
            /**
             * Call the originally defined observe function for
             * the EditBar
             * along with visibility and width observations
             * @private
             */
            observe : function (originalFunction) {
                return function () {
                    this.observeVisibility();
                    originalFunction.apply(this);
                    // hide table row and table header
                    if (this.path.substr(this.path.lastIndexOf("/") + 1) !== "guideContainer") {
                        guidelib.author.AuthorUtils.GuideTableEdit.hideTableRowEditable(this);
                    }
                };
            }(CQ.wcm.EditBar.prototype.observe),

            /**
             * Base the visibility of the EditBar on the
             * visibility of the
             * element which the EditBar represents editing upon
             */
            observeVisibility : function () {
                if (this.isVisible() && (!jQuery(this.element.dom).is(":visible"))) {
                    this.hide();
                } else if ((!this.isVisible()) && jQuery(this.element.dom).is(":visible")) {
                    this.show();
                }
            },

            /**
             * Overridden the refreshParent function so that the parent Panel gets refreshed.
             * First getParent() changes the context to the first parent i.e. items node and
             * the next getParent() changes the context to parent panel.
             */
            refreshParent : function () {
                if (this.path) {
                    try {
                        var ITEMS_SUBPATH = "/items",
                            componentPath = this.path,
                            forwardSlashLastIndex = componentPath.lastIndexOf("/");
                        if (componentPath.indexOf("guideContainer") > -1 && componentPath.substring(forwardSlashLastIndex - ITEMS_SUBPATH.length, forwardSlashLastIndex) == ITEMS_SUBPATH) {
                            var itemsNode = this.getParent();
                            if (itemsNode) {
                                var parentPanel = itemsNode.getParent();
                                if (parentPanel) {
                                    parentPanel.refresh();
                                    return;
                                }
                            }
                        } else {
                            // if the component is not of Adaptive Forms, then the RefreshParent of CQ is called.
                            CQ.wcm.EditBase.refreshParent();
                        }
                    } catch (e) {
                        this.logger().log("Error in Refreshing Parent", e);
                    }
                }
            }
        }
    );
})();
