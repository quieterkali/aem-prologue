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
(function ($, _) {

    /**
     * <p>GuideBridgeProgressive is a bridge API to communicate to progressive layer.
     * This assumes that guideBridge would have already been loaded.
     * </p>
     * @todo: Have to bring progressive specific events here ?
     **/
    var GuideBridgeProgressive = function () {
        this._progressive = guidelib.runtime.progressive;
    };

    /**
     * Define the methods required for the bridge API of progressive
     */
    _.extend(GuideBridgeProgressive.prototype, {

        /**
         * Retrieves the information related to all sections present in the
         * progressive data capture component.
         * Note: If the service is static, then this API would return all the sections present including completion section, in case
         * of dynamic service, this would give only the first section
         *
         * @return [] Array with each item containing model of section
         */
        getSectionInfo : function () {
            var sections = [];
            if (this._progressive) {
                sections = this._progressive.listOfSections;
            }
            return sections;
        },

        /**
         * Gets the current active section of the progressive data capture component
         */
        getCurrentSection : function () {
            var currentSection = null;
            if (this._progressive) {
                currentSection = this._progressive.currentSection;
            }
            return currentSection;
        },

        navigateSection : function () {
            if (this._progressive) {
                // passing current event target as context
                this._progressive.navigateSection.apply(arguments[0].target, arguments);
            }
        },

        /**
         * Sets Focus on the given section
         * todo: Add support for focusing on a given field
         * @param sectionName
         */
        setFocus : function (sectionName) {
            if (this._progressive) {
                this._progressive.setFocus(sectionName);
            }
        },

        /**
         * todo: Is this function required ?
         * @param key
         * @param config
         *
         * Sample UseCase: To calculate parts of a section ?
         * guideBridge.progressive.registerConfig("calculatePartsOfSectionConfig", {
         *    "calculatePartsOfSectionHandler" : function(section){
         *          // This handler should return an array containing all parts of section
         *          // like this [[part1],[part2],[part3]]
         *    }
         * });
         *
         *
         */
        registerConfig : function (key, config) {
            if (window.guideBridge) {
                window.guideBridge.registerConfig(key, config);
            }
        }
    });

    window.guideBridge.progressive = new GuideBridgeProgressive();

})($, _);
