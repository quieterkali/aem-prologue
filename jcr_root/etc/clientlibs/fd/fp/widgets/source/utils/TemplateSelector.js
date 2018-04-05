/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
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
 *
 */
CQ.formsearch.templateSelector = function (checkbox, value) {
    var tab = checkbox.findParentByType('panel'),
        filters,
        i;
    if (tab) {
        filters = tab.findByType('textarea');
        if (value == "gridView") {
            for (i = 0; i < filters.length; i++) {
                if(filters[i].name.toString().indexOf("grid") != -1){
                	filters[i].show();
                	filters[i].label.removeClass('hideLabel');
                }
                else{
                    filters[i].hide();
                    filters[i].label.addClass('hideLabel');
                }
            }
        } else if(value == "cardView") {
            for (i = 0; i < filters.length; i++) {
                if(filters[i].name.toString().indexOf("card") != -1){
                	filters[i].show();
                	filters[i].label.removeClass('hideLabel');
                }
                else{
                    filters[i].hide();
                    filters[i].label.addClass('hideLabel');
                }
            }
        } else if(value == "panelView") {
            for (i = 0; i < filters.length; i++) {
                if(filters[i].name.toString().indexOf("panel") != -1){
                	filters[i].show();
                	filters[i].label.removeClass('hideLabel');
                }
                else{
                    filters[i].hide();
                    filters[i].label.addClass('hideLabel');
                }
            }
        }
    }
};
