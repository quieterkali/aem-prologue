(function (guidetouchlib, window) {

    guidetouchlib.components.bindRef = guidetouchlib.components.bindRef || {};

    /**
     * Constants for bindRefTree and bindRefSelector component
     * @type {Object}
     */
    guidetouchlib.components.bindRef.constants = {
        SIDE_PANEL_BINDREF_TREE_CONTAINER_ID : "guideBindRefTreeContainer",
        SIDE_PANEL_BINDREF_SELECTOR  : ".js-SidePanel-content--bindRef",
        SIDE_PANEL_BINDREF_SELECTOR_PATH : "/libs/fd/af/content/editors/form/jcr:content/sidepanels/bindRef.html",
        SIDE_PANEL_BINDREF_TREE_SELECTOR : ".js-SidePanel-content--bindRefTree",
        SIDE_PANEL_BINDREF_SUBMIT_SELECTOR : '.afBindRefSidePanelSubmit',
        SIDE_PANEL_BINDREF_CANCEL_SELECTOR : '.afBindRefSidePanelCancel',
        SIDE_PANEL_EDIT_SELECTOR  : ".js-SidePanel-content--edit"
    };

}(window.guidelib.touchlib, this));
