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

    var afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        editConfigListener = window.guidelib.author.editConfigListeners;

    // Edit Panel CLASS DEFINITION
    // ====================

    var GuidePanelEdit = function (element) {
        this.element = afWindow.$(element);
        this.path = this.element.data("path");
    };

    //addPanel functionality
    // ============================
    GuidePanelEdit.prototype.addPanel = function () {
        guidelib.author.AuthorUtils.addChildPanel(this.path);
    };

    // panel child drag-drop
    // ================================

    GuidePanelEdit.prototype.reorderItems = function () {
        var $navContainer = this.element;
        $navContainer.sortable({
            containment : $navContainer,
            update : function (event, ui) {
                var params = {};
                var dragItem = ui.item.data("path");
                var dragItemSibling =  ui.item.next().data("path");
                var dragItemSiblingName  =  null;
                if (dragItemSibling) {
                    dragItemSiblingName = dragItemSibling.substring(dragItemSibling.lastIndexOf('/') + 1);
                    params[CQ.Sling.ORDER] = "before " + dragItemSiblingName ;
                } else {
                    dragItemSibling = ui.item.prev().data("path");
                    dragItemSiblingName = dragItemSibling.substring(dragItemSibling.lastIndexOf('/') + 1);
                    params[CQ.Sling.ORDER] = "after " + dragItemSiblingName ;
                }
                var serverResponse = CQ.utils.HTTP.post(dragItem, null, params, this);
                editConfigListener.REFRESH_GUIDE();
            }
        });
    };

    // Panel Edit
    // ================================

    GuidePanelEdit.prototype.editPanel = function () {
        var panelPath = this.path;
        var $panelEl = this.element;
        var panelEditable = CQ.WCM.getEditable(panelPath);
        CQ.wcm.EditBase.showDialog(panelEditable, CQ.wcm.EditBase.EDIT);
    };

    // Panel Delete
    // ================================

    GuidePanelEdit.prototype.deletePanel = function () {
        var panelPath = this.path;
        var $panelEl = this.element;
        var panelEditable = CQ.WCM.getEditable(panelPath);
        panelEditable.removeParagraph();
    };

    // Panel Edit Menu
    // ================================
    GuidePanelEdit.prototype.editToolbar = function () {
        var panelPath = this.path;
        var $panelEl = this.element;
        var panelEditable = CQ.WCM.getEditable(panelPath);
        panelEditable.addElementEventListener($panelEl.get(0), "click", panelEditable.handleContextMenu, true, panelEditable);
    };

    // GuidePanelEdit PLUGIN DEFINITION
    // =====================

    $.fn.guidePanelEdit = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('guide.guidePanelEdit');

            if (!data) {
                $this.data('guide.guidePanelEdit', (data = new GuidePanelEdit(this)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.guidePanelEdit.Constructor = GuidePanelEdit;

    // GuidePanelEdit DATA-API
    // ============

    //addPanel API
    $(document).on('click.guide.guidePanelEdit.addPanel.data-api', '[data-guide-panel-edit="addPanel"]', function (e) {
        e.preventDefault();
        var parentPanelSelector = $(this).data("guidePanelEditParent");
        var parentPanel = $(parentPanelSelector).get(0) || $(this).closest("guidePanel").get(0);
        $(parentPanel).guidePanelEdit('addPanel');
    });

    //reorderItems API
    $(afWindow).on('load', function () {
        var fn = function (e, parent) {
            $(parent).find('[data-guide-panel-edit="reorderItems"]').each(function () {
                $(this).guidePanelEdit('reorderItems');
            });
        };
        fn(null, document);
        $(window).on("guideDomModified", fn);
    });

    $(document).on('click.guide.guidePanelEdit.editPanel.data-api', '[data-guide-panel-edit="editPanel"]', function (e) {
        e.preventDefault();
        var parentPanelSelector = $(this).data("guidePanelEditParent");
        var parentPanel = $(parentPanelSelector).get(0) || $(this).closest("guidePanel").get(0);
        $(parentPanel).guidePanelEdit('editPanel');
    });

    $(document).on('click.guide.guidePanelEdit.deletePanel.data-api', '[data-guide-panel-edit="deletePanel"]', function (e) {
        e.preventDefault();
        var parentPanelSelector = $(this).data("guidePanelEditParent");
        var parentPanel = $(parentPanelSelector).get(0) || $(this).closest("guidePanel").get(0);
        $(parentPanel).guidePanelEdit('deletePanel');
    });

    $(document).on('click.guide.guidePanelEdit.editToolbar.data-api', '[data-guide-panel-edit="editToolbar"]', function (e) {
        e.preventDefault();
        var parentPanelSelector = $(this).data("guidePanelEditParent");
        var parentPanel = $(parentPanelSelector).get(0) || $(this).closest("guidePanel").get(0);
        $(parentPanel).guidePanelEdit('editToolbar');
    });

})(window.jQuery);
