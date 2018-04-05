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
 * @package guidelib.model.GuideDirtyMarkerAndVisitor
 * @version 0.0.1
 */

(function ($, _, guideBridge, guidelib) {
    var GuideDirtyMarkerAndVisitor = guidelib.internal.GuideDirtyMarkerAndVisitor = {
        /**
         * Iterates over list and adds the non existing element to map
         * and assigns it value
         * @param list
         * @param map
         * @param value
         */
        addToExistingMapIfNotFound : function (list, map, value) {
            _.each(list, function (key) {
                if (_.isUndefined(map[key])) {
                    map[key] = value;
                }
            });
            return map;
        },
        /**
         * Return a list of dirty children
         * @returns {Array}
         * @private
         */
        _flattenDirtyPanelToList : function () {
            var csv = this.flattenDirtyPanelMapToCSV();
            if (csv.length > 0) {
                return csv.split(",");
            }
        },
        /**
         * If any dirty element then save it to CSV
         */
        flattenDirtyPanelMapToCSV : function () {
            var listOfDirtyPanels = "";
            _.each(_.keys(this.visitMap), function (key, index) {
                if (this.visitMap[key] === 0) {
                    listOfDirtyPanels += key + ",";
                }
            }, this);
            if (listOfDirtyPanels.length > 0) {
                // strip last ,
                listOfDirtyPanels = listOfDirtyPanels.substring(0, listOfDirtyPanels.length - 1);
            }
            return listOfDirtyPanels;
        },
        /**
         * Creates a map with a list and initializes them with value
         * @param list
         * @param value
         * @returns {{}}
         */
        _createMapFromFromList : function (list, value) {
            var map = {};
            _.each(list, function (key, index) {
                map[key] = value;
            });
            return map;
        },
        /**
         * This method finds and marks dirty all the lazy children that were dependant of global field's value
         * @param mapOfLazyChildren
         * @param listOfIdsOfDependents
         * @private
         */
        _findAndMarkDirty : function (mapOfLazyChildren, listOfIdsOfDependents) {
            var listOfLazyChildren = _.keys(mapOfLazyChildren);

            _.each(listOfIdsOfDependents, function (depenId, index) {
                var longestPrefixLenSoFar = 0,
                    currentPrefixLen = 0,
                    nearestLazyId = null,
                    i;
                // find hierarchically closest field by matching longest som prefix
                for (i = 0; i < listOfLazyChildren.length; ++i) {
                    currentPrefixLen = guidelib.util.GuideUtil.commonPrefixLen(depenId, listOfLazyChildren[i]);
                    if (longestPrefixLenSoFar < currentPrefixLen) {
                        longestPrefixLenSoFar = currentPrefixLen;
                        nearestLazyId = listOfLazyChildren[i];
                    }
                }
                //  Mark dirty
                if (longestPrefixLenSoFar > 0) {
                    mapOfLazyChildren[nearestLazyId] = 0;
                }
            });
        },
        /**
         * Iterates a map and finds the first occurrence of value found in any key
         * @param map
         * @param value
         */
        _iterateMapAndReturnKeyOnValueFound : function (map, value) {
            var keyToReturn;
            _.each(_.keys(map), function (key, index) {
                if (map[key] === value) {
                    keyToReturn =  key;
                }
            });
            return keyToReturn;
        },
        /**
         * Updates the value of the key in map by one if present otherwise puts the key with value zero
         * @param map
         * @param key
         * @returns {*}
         */
        _updateCountOrInsert : function (map, key) {
            if (_.isUndefined(map[key])) {
                map[key] = 0;
            } else {
                map[key]++;
            }

            return map;
        }
    };
    // need to save the map while save and restore - will do it in getGuideState
    GuideDirtyMarkerAndVisitor.visitMap = {};

}($, _, window.guideBridge, window.guidelib));
