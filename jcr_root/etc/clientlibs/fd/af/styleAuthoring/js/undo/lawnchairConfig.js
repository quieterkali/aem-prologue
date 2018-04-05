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

;(function ($, ns, channel, window, undefined) {
    ns.history = ns.history || {};
    ns.history.clientsidePersistence = (function () {
        var self = {};

        /**
        		 * The default options to the Lawnchair persistence module
        		 * @type Object
        		 * @private
        		 */
        var lawnchairDefaults = {
            'adapter' : (window.indexedDB !== undefined) ? 'indexed-db' : 'dom' // Use indexed-db where available
        };

        /**
        		 * The namespace of authoring-specific clientside data stores
        		 * @type String
        		 * @private
        		 */
        var namespace = "styling";

        /**
        		 * Configure and create an instance of a Lawnchair persistence module
        		 * @param {Object} config A Lawnchair configuration {name, adapter, record}
        		 * @param {Function} [callback] Callback on Lawnchair creation
        		 * @returns {Object} The Lawnchair persistence instance
        		 */
        self.createLawnchair = function (config, callback) {
            var cb = (callback) ? callback : new Function(),
            cf = $.extend(lawnchairDefaults, config);

            // Prefix store name with namespace
            if (cf.name) {
                cf.name = namespace + '.' + cf.name;
            }

            return new Lawnchair(cf, cb);
        };

        return self;
    }());

}(jQuery, window.guidelib.touchlib.style.utils, jQuery(document), this));
