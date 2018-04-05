/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
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
 * ***********************************************************************
 */

/**
 * @package guidelib.model.LiveModel
 * @version 0.0.1
 */

(function ($, _, guideBridge, guidelib) {
    var LiveModel = guidelib.model.LiveModel = xfalib.ut.Class.extend({
        initialize : function () {
            LiveModel._super.initialize.call(this);
            this._crossFragmentFields = {}; // 2 level map: name => { bindRef => abstract model }
            this._dataNodes = {};
        },

        // only called from test framework
        destroy : function () {
            this._crossFragmentFields = {};
            this._dataNodes = {};
        },

        getCrossFragmentFields : function () {
            return this._crossFragmentFields;
        },

        add : function (key, model) {
            if (key) {
                var dn = this._dataNodes[key] || new guidelib.model.DataNode();
                dn.addField(model);
                this._dataNodes[key] = dn;
            }
        },

        isLive : function (key) {
            return _.isString(key) && _.has(this._dataNodes, key);
        },

        remove : function (key, model) {
            if (this.isLive(key)) {
                var dn = this._dataNodes[key];
                dn.removeField(model);
            }
        },

        getAllFieldModels : function (keys) {
            return _.flatten(_.map(keys, function (key) {
                return this._dataNodes[key].getFieldModels();
            }, this));
        },

        resetData : function () {
            // all loaded models in data nodes dataNodes will be reset by the respective fields
            // just need to reset the abstract cross frag fields
            _.each(this._crossFragmentFields, function (fields) {
                _.each(fields, function (abstractField) {
                    abstractField.resetData();
                });
            });
        },

        createDataNodes : function (duplicateBindRefs) {
            _.each(duplicateBindRefs, function (bindRef) {
                this.add(bindRef);
            }, this);
        },

        createCrossFragFields : function (crossFragFields) {
            _.each(crossFragFields, function (field) {
                var effectiveBindRef = field.bindRef || field.name,
                    value = field._value || null,// default value, keep null because js is quirky with operations on undefined
                    absModel = new guidelib.model.AbstractField({
                        'name' : field.name,
                        'bindRef' : field.bindRef,
                        'dataSom' : field.dataSom,
                        'jsonModel' : {
                            '_value' : value,
                            "{default}" : value
                        }
                    });

                if (_.isEmpty(this._crossFragmentFields[field.name])) {
                    this._crossFragmentFields[field.name] = {};
                }
                this._crossFragmentFields[field.name][effectiveBindRef] = absModel;

                this.add(effectiveBindRef, absModel); // unbound globals with same name linked together

            }, this);
        },

        prefillCrossFragFields : function () {
            var dataUtils = guidelib.internal.liveDataUtils;
            if (dataUtils.isLiveDataInitialized()) {
                _.each(this._crossFragmentFields, function (fields, name) {
                    _.each(fields, function (absModel, bindRef) {
                        var dataContext = dataUtils._getDataContext(absModel);
                        // fill value from prefill data or saved lazy live data
                        absModel.value = dataUtils.getDataValue(dataContext.indexedXpath, dataContext.xmlSec);
                    }, this);
                }, this);
            }
        }
    });

    guidelib.internal.liveModel = new LiveModel();
}($, _, window.guideBridge, window.guidelib));
