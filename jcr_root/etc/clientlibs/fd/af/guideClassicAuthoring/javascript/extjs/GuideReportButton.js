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
 * User: syr
 * Date: 12/24/13
 * Time: 10:53 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @class CQ.wcm.FormReportButton
 * @extends CQ.form.CompositeField
 * The FormReportButton is a specific {@link CQ.form.CompositeField} of the
 * foundation's form start component. The rendered button opens a new document
 * where a report of current form.
 * @constructor
 * Creates a new FormReportButton.
 * @param {Object} config The config object
 * @private
 */
CQ.wcm.GuideReportButton = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor : function (config) {
        var btn = this;
        var completeUrl;
        if (config && config.url) {
            completeUrl = config.url;
        }
        config = CQ.Util.applyDefaults(config, {
            "border" : false,
            "items" : [
                {
                    "xtype" : "panel",
                    "border" : false,
                    "bodyStyle" : "padding:4px",
                    "items" : [
                        {
                            "xtype" : "button",
                            "text" : CQ.I18n.getMessage("View Data..."),
                            "tooltip" : CQ.I18n.getMessage("View data entered using this Adaptive Form"),
                            "handler" : function () {
                                var dialog = btn.findParentByType("dialog");
                                var storePathField = dialog.getField("./storePath");
                                var storePath = storePathField.getValue();
                                var url;
                                if (completeUrl) {
                                    url = CQ.HTTP.externalize(completeUrl);
                                } else {
                                    url = CQ.HTTP.externalize(dialog.form.url + ".af.bulkeditor.jsp?storePath=" + storePath);
                                }
                                var w = CQ.shared.Util.open(url, null, "FormReport");
                                w.focus();
                            }
                        }
                    ]
                }
            ]
        });
        CQ.wcm.GuideReportButton.superclass.constructor.call(this, config);
    },

    initComponent : function () {
        CQ.wcm.GuideReportButton.superclass.initComponent.call(this);
    }

});

CQ.Ext.reg("guidereportbutton", CQ.wcm.GuideReportButton);
