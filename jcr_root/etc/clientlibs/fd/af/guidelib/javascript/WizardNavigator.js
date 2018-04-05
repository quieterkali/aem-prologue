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

/*handle click of default next and previous navigator*/
$(function ($) {
    var getPanelSom = function (panelId) {
            var panel = window.guideBridge._resolveId(panelId);
            if (panel === undefined || panel === null) {
                return "";
            }
            return panel.somExpression;
        },
        pointerup_evnt = xfalib.ut.TouchUtil.POINTER_UP;

    if (pointerup_evnt === "touchend") {
        // touchend happens before blur, hence the value of the current
        // focused field is not committed and setFocus API receives the old
        // value. So as a hack we are using mouseup instead of touchend to
        // make sure that the value gets committed
        pointerup_evnt = "mouseup";
    }
    $('body').on(pointerup_evnt, '[data-guide-wizard-nav]', function () {
        var $this = $(this),
            options = $this.data("guide-wizard-nav");
        if (_.isObject(options)) {//case of all the options, get som expression out of id
            options.somExpression = getPanelSom(options.panelId);
        } else { //case where its value of somId
            var somExpr = getPanelSom(options),
                navType = $(this).data("guide-wizard-nav-type");
            options = {somExpression : somExpr, focusOption : navType, runCompletionScript : true};
        }
        window.guideBridge.setFocus(options);
    });

    window.guideBridge.on("elementNavigationChanged",
        function (evntName, evnt) {
            var activePanelSom = evnt.newText,
                activePanel = window.guideBridge._guideView.getView(activePanelSom),
                scrollDirection,
                scrollStep,
                scrollPos,
                list,
                $listElements;
            if (activePanel instanceof guidelib.view.GuidePanelView) {
                $listElements = activePanel.parentView.$element.find('[id*="' + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX + '"]');
                if (!_.isUndefined($listElements) && !_.isNull($listElements) && $listElements.length > 0) {
                    list = $listElements.eq(0);
                    if (_.isUndefined(list.data("guideNavScrollPos"))) {
                        list.data("guideNavScrollPos", 0);
                    }
                    scrollPos = list.data("guideNavScrollPos");
                    //Find index among the visible panels
                    var parentChildViews = activePanel.parentView.childViews,
                        iterator,
                        navPos = 0;
                    for (iterator = 0; iterator < parentChildViews.length; iterator++) {
                        if (activePanel === parentChildViews[iterator]) {
                            break;
                        }
                        if (parentChildViews[iterator]._model.visible) {
                            navPos = navPos + 1;
                        }
                    }
                    if (navPos > scrollPos) {
                        scrollDirection = "right";
                    } else {
                        scrollDirection = "left";
                    }
                    scrollStep = Math.abs(navPos - scrollPos);
                    guidelib.util.GuideUtil.navScroll(list, scrollDirection, scrollStep, '[id*="' + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_SUFFIX + '"]:not(.hidden)');
                }
            }
        });
});
