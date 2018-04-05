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

(function (window, $, channel, author, guidetouchlib) {

    /**
     * Listener on parent frame to initialize the expression editor library
     */
    channel.on('cq-editor-loaded', function (event) {
        var guideTouchLibConstants = guidetouchlib.constants,
            guideUtil = guidelib.util.GuideUtil,
            authoringConfigJson = window._afAuthorHook._getAfWindow().$(".guideContainerWrapperNode").data("guideAuthoringconfigjson");
        // Initialize the current page path
        guidetouchlib._currentPagePath = author.pageInfo.status.path;

        if (authoringConfigJson && guideUtil.compareVersion(authoringConfigJson[guideTouchLibConstants.FD_VERSION], guideTouchLibConstants.LEGACY_AF_SPEC_VERSION) == 0) {
            //Fallback - as Form would be expected to be migrated before opening in authoring
            migrateAdaptiveForm(guidetouchlib._currentPagePath);
        }
    });

    channel.on('coral-tabview:change.sidepanel-search-autofocus', function (event) {
        var $sidePanel = $("#SidePanel");

        //CUI-5887 : Event triggered before panel content is updated,so a delay is added
        setTimeout(function () {
            var $targetElement = $sidePanel.find("coral-panel:visible").eq(0);
            var $selectedTab = guidetouchlib.currentSelectedTab($targetElement);
            guidetouchlib.focusInputElement($selectedTab);
        }, 500);

    });

    /**
     * Migrate the Adaptive Form in case it is not yet migrated
     */
    function migrateAdaptiveForm(currentPagePath) {
        $.ajax({
            url : Granite.HTTP.externalize("/libs/fd/foundation/gui/content/migration/startmigration.assets.json" + currentPagePath),
            type : "POST",
            cache : false,
            data : {
                "operation" : "migrate"
            },
            success : function (response) {
                //do nothing
            },
            error : function (response) {
                if (console) {
                    console.log("Unable to migrate the form: " + response);
                }
            }
        });
    }
    /**
     * This code is copied from Granite.author.DialogFrame
     * Any changes in that code should reflect here too
     */
    function initializeIndependentDialogListeners() {
        function handleDragStart(e) {
            e.preventDefault();

            var dialog = $(this).addClass('cq-dialog-dragging').closest('.cq-dialog-floating');

            var h = dialog.outerHeight(),
                w = dialog.outerWidth(),
                y = dialog.offset().top + h - e.pageY,
                x = dialog.offset().left + w - e.pageX;

            var parent = dialog.parent();

            parent.on('mousemove.cq-dialog-floating', function (e) {
                dialog.offset({
                    top : e.pageY + y - h,
                    left : e.pageX + x - w
                });
            });

            dialog.one('mouseup', function () {
                dialog.find('.cq-dialog-dragging').removeClass('cq-dialog-dragging');
                parent.off('.cq-dialog-floating');
            });
        }

        channel.on('mousedown.dialogframe', '.cq-dialog-floating .cq-dialog-header', handleDragStart);
    }

    initializeIndependentDialogListeners();

    /**
     * Initialization of Error Manager Class in TOUCH UI
     * @note: Content Frame sets the guide sync message and communicates the same to
     * editor frame via the setters exposed.
     */

    function _initializeErrorManager(addGuideSyncMessage, updatedAsset, errorMessage, additionalErrorMessages) {
        if (guidelib.author.statusBar) {
            var statusBarTemplate = '<div class="panel panel-default">' +
                '<div class="panel-body">' +
                '<ul></ul>' +
                '</div>' +
                '</div>';
            $("#guide_statusbar").remove();
            $("#sidepanel-guide-errors", window.document).append($(statusBarTemplate));
            guidelib.author.statusBar.init("#sidepanel-guide-errors", addGuideSyncMessage, updatedAsset);
            guidelib.author.statusBar.addMessage(errorMessage);
            if (additionalErrorMessages && additionalErrorMessages.length > 0) {
                _.each(additionalErrorMessages, function (errorMsg) {
                    guidelib.author.statusBar.addMessage(errorMsg);
                });
            }
        }
    }

    // lets tell the edit layer to initialize this on setup and tear it during switch of layers
    guidetouchlib.initializers.initializeErrorManager = {

        setUp : function () {
            var self = guidetouchlib.initializers.initializeErrorManager;
            _initializeErrorManager(self.addGuideSyncMessage, self.updatedAsset, self.errorMessage, self.additionalErrorMessages);
        },

        _setAddGuideSyncMessage : function (addGuideSyncMessage) {
            this.addGuideSyncMessage = addGuideSyncMessage;
        },

        _setUpdatedAsset : function (updatedAsset) {
            this.updatedAsset = updatedAsset;
        },

        _setErrorMessage : function (errorMessage) {
            this.errorMessage = errorMessage;
        },

        _addErrorMessage : function (errorMessage) {
            if (!this.additionalErrorMessages) {
                this.additionalErrorMessages = [];
            }
            this.additionalErrorMessages.push(errorMessage);
        },

        isSyncRequired : function () {
            return this.addGuideSyncMessage;
        },

        destroy : function () {
            guidelib.author.statusBar.destroy();
        }
    };

}(window, $, jQuery(document), Granite.author, guidelib.touchlib));

