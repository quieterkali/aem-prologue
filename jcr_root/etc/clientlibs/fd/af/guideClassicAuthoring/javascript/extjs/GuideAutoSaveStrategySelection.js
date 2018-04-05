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
 * @class CQ.wcm.GuideAutoSaveStrategySelection
 * @extends CQ.wcm.GuideActionTypeSelection
 * The GuideAutoSaveStrategySelection is a specific {@link CQ.form.Selection} to select
 * the strategy for autosave of the guide. After the value has
 * been changed the content of the Strategy Configuration tab is adjusted.
 * @constructor
 * Creates a new GuideAutoSaveStrategySelection.
 * @param {Object} config The config object
 * @private
 */
CQ.wcm.GuideAutoSaveStrategySelection = CQ.Ext.extend(CQ.wcm.GuideActionTypeSelection, {

    defaults : {
        type : "select",
        tabId : "guide_auto_save_strategy_config_panel"
    },

    defaultValue : null,

    defaultOptions : {type : "autoSaveAction",
        guideDataModel : "basic"},

    notifyChange : function (value, loadWidgets) {
        if (value != null) {
            CQ.wcm.GuideAutoSaveStrategySelection.superclass.notifyChange.call(this, value, loadWidgets);
        }
    }

});

CQ.Ext.reg("guideautosavestrategyselection", CQ.wcm.GuideAutoSaveStrategySelection);
