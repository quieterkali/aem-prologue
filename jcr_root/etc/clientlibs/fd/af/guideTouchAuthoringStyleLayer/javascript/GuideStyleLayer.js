/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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

;(function ($, author, guidetouchlib, channel, window, undefined) {

    var styleLayer = guidetouchlib.styleLayer,
        guideStyleLayerConstants = styleLayer.constants,
        commonStyle = guidetouchlib.style,
        _superSetUp = author.edit.Layer.prototype.setUp,

        initializeSidePanel = function () {
            commonStyle.initializeVars(); // Initialize common variables shared with theme and inline style layer
            commonStyle.vars.cssPropertyName = "cq:cssClass";   // Name of the property where css Class Name will be saved
            commonStyle.vars.jsonPropertyName = guideStyleLayerConstants.GUIDE_STYLE_PROPERTY_NAME; // Name of the property where JSON will be saved
            commonStyle.vars.cssStylePropertyName = "cssStyle"; // Name of the property where generated CSS will be saved
            commonStyle.vars.currentEditable = undefined;
            commonStyle.vars.currentSelectedOverlayTarget = undefined;
            styleLayer.currentMode = guideStyleLayerConstants.GUIDE_STYLE_SELECTOR_MODE;
            styleLayer.isCopyModeEnabled = false; //Flag to govern if copy mode is enabled. i.e. you are pasting element styles.
            /* This is to initialize the JSON with a similar structure of theme*/
            styleLayer.utils.initializeJSON();

            author.ui.SidePanel.showContent(guideStyleLayerConstants.GUIDE_STYLE_SIDE_PANEL);
            /* Initialize the form objects tree in the style layer*/
            styleLayer.styleLayerFormObjects.initializeStyleLayerObjectsTree();
            /* Initialize the overlays in the style layer*/
            styleLayer.overlays.initializeStyleOverlays();
            /* Get the all stylable Configs JSON*/
            styleLayer.utils.getStylableConfigJSON();
            /* Register event handlers */
            styleLayer.ui.registerEventHandlers();
            // Make sure the sidepanel is open
            author.ui.SidePanel.open(true);
            // Register KeyBoard Events
            commonStyle.registerKeyboardHotkeys();
            //register handler for Redo/Undo
            commonStyle.utils.registerUndoRedoEvents();
            //register handler for view CSS button
            commonStyle.registerViewCSSHandler();
            //register handler for error success simulation.
            commonStyle.registerErrorSimulationEvents();
        };

    function setUp() {
        // Call super tearDown
        // Clean the overlays
        _superSetUp.apply(this, [arguments]);
        // check for other history controls(core) and hide it
        // todo: this code has to be removed later
        $("[data-history-control=undo]").toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, true);
        $("[data-history-control=redo]").toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, true);

        if (!styleLayer.GuideStyleLayer.isSidePanelLoaded) {
            author.ui.SidePanel.loadContent({
                selector : guideStyleLayerConstants.GUIDE_STYLE_SIDE_PANEL_SELECTOR,
                path : guideStyleLayerConstants.GUIDE_STYLE_SIDE_PANEL_PATH
            }).then(function () {
                styleLayer.GuideStyleLayer.isSidePanelLoaded = true;
                /* Initialize Style Layer variables */
                initializeSidePanel();
                var doc = window._afAuthorHook._getAfWindow().document,
                    guidePath = $(doc).find(guidelib.author.AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path");

                // Initialize this Redo/Undo Manager once , No need to setup this again if the layer is switched
                commonStyle.utils.history.Manager.init(undefined, guidePath);

                guidetouchlib.initializers.onContentFrameLoad.setUp();
                guidetouchlib.utils._setUpFormEditor();
            });
        } else {
            /* Initialize Style Layer variables */
            initializeSidePanel();
            // restore the earlier state of button before switch of layer
            $('[data-history-control="' + guideStyleLayerConstants.GUIDE_STYLE_LAYER_REDO + '"]').toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, false);
            $('[data-history-control="' + guideStyleLayerConstants.GUIDE_STYLE_LAYER_UNDO + '"]').toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, false);
        }
        $(guideStyleLayerConstants.GUIDE_STYLE_MODE_SWITCH_SELECTOR).prop("checked", false);
        $(guideStyleLayerConstants.GUIDE_STYLE_MODE_SWITCH_SELECTOR).removeClass("hide");
    }

    function tearDown() {
        styleLayer.utils.exitCopyMode();
        styleLayer.overlays.tearDownOverlays();
        styleLayer.overlays.removeStyleOverlays();
        styleLayer.overlays.removeComponentOverlays();
        styleLayer.styleLayerFormObjects.teardownStyleLayerObjectsTree();
        styleLayer.stylableConfigs.teardownStylableConfigsTree();
        styleLayer.utils.tearDownPropertySheet();
        // Register KeyBoard Events
        commonStyle.unregisterKeyboardHotkeys();

        guidetouchlib.initializers.onContentFrameLoad.destroy();
        // hide the current style layer undo and redo buttons
        // todo: this is a temp fix has to be removed layer
        $('[data-history-control="' + guideStyleLayerConstants.GUIDE_STYLE_LAYER_REDO + '"]').toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, true);
        $('[data-history-control="' + guideStyleLayerConstants.GUIDE_STYLE_LAYER_UNDO + '"]').toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, true);
        // restore the core undo/redo state of buttons
        $("[data-history-control=undo]").toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, false);
        $("[data-history-control=redo]").toggleClass(guideStyleLayerConstants.GUIDE_STYLE_LAYER_HIDDEN_CLASS, false);
        $(guideStyleLayerConstants.GUIDE_STYLE_MODE_SWITCH_SELECTOR).prop("checked", false);
        $(guideStyleLayerConstants.GUIDE_STYLE_MODE_SWITCH_SELECTOR).addClass("hide");
    }

    /**
     * @const Default configuration
     */
    styleLayer.CONFIG = {
        name : "Style",
        iconClass : "coral-Icon--brush",
        title : Granite.I18n.get("Style", "title of Style layer")
    };

    /**
     * * @class The Guide Style Layer class
     * */
    var guideStyleLayer = styleLayer.GuideStyleLayer = author.util.extendClass(author.Layer, {
        /**
         * @constructor
         *
         */
        /**
         * @inheritDoc
         */
        config : styleLayer.CONFIG,

        /**
         * @override
         */
        isAvailable : function () {
            return true;
        },

        /**
         * @override
         */
        setUp : function () {
            setUp();
        },
        /**
         * @override
         */
        tearDown : function () {
            tearDown();
        }
    });

}(jQuery, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
