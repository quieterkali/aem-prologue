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

    // Since we need to override the existing edit layer of AEM in touch authoring
    // Hence, keeping the name same as AEM Touch Edit Layer
    var guideEditLayerConstants = guidetouchlib.editLayer.constants,
        _superSidePanelSetUp = author.edit.CONFIG.sidePanel.setUp;

    guidetouchlib.editLayer.setPropertiesTabWidth = function () {
        /* Set the initial width of the properties tab
        *  92 is coming from 3.5 rem (navigators width) + 2rem margin on left and right multiplied by 16
        * */
        $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find("." + guideEditLayerConstants.GUIDE_SIDE_PANEL_PROPERTIES_CLASS).css("width", author.ui.SidePanel.getWidth() - 92);
        $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_OBJECTS_ID).css("width", author.ui.SidePanel.getWidth() - 92);

        /* Use this event to resize the properties and objects tab width based on side panel width when sidepanel re-sizes.*/
        channel.on("cq-sidepanel-resized", function () {
            $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_OBJECTS_ID).css("width", author.ui.SidePanel.getWidth() - 92);
            $(guideEditLayerConstants.SIDE_PANEL_EDIT_SELECTOR).find("." + guideEditLayerConstants.GUIDE_SIDE_PANEL_PROPERTIES_CLASS).css("width", author.ui.SidePanel.getWidth() - 92);
        });
        // Add Empty dialog Message
        author.DialogFrame.addEmptyDialogMessage();
    };

    function setUpSidePanel() {
        // call the super method first
        _superSidePanelSetUp.apply(this);

        function addAdaptiveFormTabsToSidePanel() {
            $(guideEditLayerConstants.SIDE_PANEL_VIEW_ERRORS_TAB_SELECTOR).hide();
            // Initialize the form hierarchies
            guidetouchlib.editLayer.editLayerFormObjects.initializeFormObjectsTree();
            guidetouchlib.editLayer.editLayerDataObjects.initializeDataObjectsTree();
            guidetouchlib.editLayer.setPropertiesTabWidth();
            // Making the First Tab Active
            $("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_OBJECTS_ID).find("coral-tab")[0].click();
            guidetouchlib.focusInputElement($("#" + guideEditLayerConstants.GUIDE_SIDE_PANEL_OBJECTS_ID).find("coral-panel").eq(0));
        }

        // on set-up, it is not necessary that dom is ready, hence the check
        // todo: touch platform has to think of deffered event framework, like $.ready, until lets keep this
        if (document.readyState !== 'complete') {
            $(document).ready(function () {
                addAdaptiveFormTabsToSidePanel();
            });
        } else {
            addAdaptiveFormTabsToSidePanel();
        }
    }

    var _superSidePanelTearDown = author.edit.CONFIG.sidePanel.tearDown;
    function tearDownSidePanel() {
        // Teardown the form hierarchies
        guidetouchlib.editLayer.editLayerFormObjects.teardownFormObjectsTree();
        guidetouchlib.editLayer.editLayerDataObjects.teardownDataObjectsTree();
        if (_superSidePanelTearDown) {
            _superSidePanelTearDown.apply(this, [arguments]);
        }
    }
    /**
     * @const Default configuration
     */
    guidetouchlib.editLayer.CONFIG = $.extend({}, author.edit.CONFIG, {
        sidePanel : {
            setUp    :   setUpSidePanel,
            tearDown :    tearDownSidePanel
        },
        toolbarConstructor :     guidetouchlib.editToolbar,
        interactions : guidetouchlib.editLayer.Interactions
    });

    var _superSetUp = author.edit.Layer.prototype.setUp;
    /**
     * Will be called when the layer gets deactivated
     */
    function setUp() {
        // set the dialog loading mode for forms editor
        author.DialogFrame.dialogMode = "sidePanel";
        // Call super tearDown
        // Clean the overlays
        _superSetUp.apply(this, [arguments]);

        /**
         * If reload is not called, only then set up form editor.
         * This is done since reload is a async call. After location reload,
         * this part of code executes, and a flickering effect is seen in the screen.
         * This flag is used to purely check if reload is called or not. Ideally, this flag
         * should not be used anywhere else in the code.
         */
        if (!guidetouchlib._isReloadCalled) {
            // On set-up initialize the AF authoring specific things
            guidetouchlib.utils.registerKeyboardHotkeys();

            // All the AF Listeners are present in guidelib.touchlib.initializers
            guidetouchlib.utils._setUpFormEditor.apply(this);
        }
    }

    var _superTearDown = author.edit.Layer.prototype.tearDown;
    /**
     * Will be called when the layer gets deactivated
     */
    function tearDown() {
        // reset the dialog loading mode back to normal
        author.DialogFrame.dialogMode = "auto";
        // Call super tearDown
        // Clean the overlays
        _superTearDown.apply(this, [arguments]);
        // Destroy the authoring specific things
        guidetouchlib.utils.unregisterKeyboardHotkeys();

        // All the AF Listeners are present in guidelib.touchlib.initializers
        guidetouchlib.utils._destroyFormEditor.apply(this);

    }

    /**
     * @class The Guide Edit Layer class
     * @extends author.edit.Layer
     */
    var guideEditLayer = guidetouchlib.editLayer.GuideEditLayer = author.util.extendClass(author.edit.Layer, {

        /**
         * @inheritDoc
         */
        config : guidetouchlib.editLayer.CONFIG,

        setUp : setUp,
        /**
         * @override
         */
        tearDown : tearDown
    });

    // expose to namespace (in case to provide further inheritance)
    guidetouchlib.editLayer.GuideEditLayer = guideEditLayer;

}(jQuery, window.Granite.author, window.guidelib.touchlib, jQuery(document), this));
