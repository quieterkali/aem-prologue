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

/**
 * Created with IntelliJ IDEA.
 * User: vdua
 * Date: 1/3/14
 * Time: 7:43 PM
 */
/*anonymous function to handle click of default next and previous navigator*/
(function ($) {
    window.guideBridge.on("elementNavigationChanged",
        function (evntName, evnt) {
            var activePanelSom = evnt.newText,
                activePanel = window.guideBridge.resolveNode(activePanelSom);
            if (activePanel) {
                $("[data-target-guide-content]").text(activePanel.title ? activePanel.title : "");
            }
        });
}($));
