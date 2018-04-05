/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright <year> Adobe Systems Incorporated
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

    // TABLE LAYOUT PLUGIN
    // ============

    $(document).on('panelRemoved.af', '.guideTableNode', function (e, $childRemoved, index) {
        // this plugin is specific to a layout
        // one can also check the layout based on CSS class set and perform things accordingly
        // prevent the bubbling up of the event
        e.stopPropagation();
        // this would work only in runtime
        var $bodyRows = $(e.target).find("tr.guideTableRowNode:not(.guideTableHeader)");
        // Set focus to first child
        if (index > 1) {
            // set focus on prev row since index is greater than 1
            var $prevRow = $bodyRows.eq(index - 1);
            guidelib.util.GuideUtil.setFocusOnFirstItemOfTableRow($prevRow);
        } else if (index == 1) {
            var $nextRow = $bodyRows.eq(1);
            // may there is only one row which has got deleted, hence check if next row actually exists
            if ($nextRow.length > 0) {
                guidelib.util.GuideUtil.setFocusOnFirstItemOfTableRow($nextRow);
            }
        }
    });

}($));
