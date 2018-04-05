/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
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
 */
;(function ($, ns, channel, window, document, undefined) {

    /**
     * Requests the tour to be pre-loaded
     *
     * @event Document#cq-preload-tour
     */

    /**
     * Requests the tour to be shown
     *
     * @event Document#cq-show-tour
     */

    /**
     * @type {Object}
     */
    ns.Tour = (function () {

        /**
         * @fires Document#cq-preload-tour
         * @fires Document#cq-show-tour
         */
        channel.on("cq-editor-loaded", function () {
            // tour gets shown based on user preference
            channel.trigger("cq-preload-tour");
            channel.trigger("cq-show-tour");
        });

        /**
         * @fires Document#cq-show-tour
         */
        channel.on("mouseenter touchstart", ".launch-tour", $.throttle(10000, function () {
            // Predictive loading before "click"
            channel.trigger($.Event("cq-preload-tour", {
                // tour gets shown whatever the user preference is
                forceLoading : true
            }));
        }));

        /**
         * @fires Document#cq-show-tour
         */
        channel.on("click", ".launch-tour", function () {
            channel.trigger("cq-show-tour");
        });

        return self;
    }());

}(jQuery, Granite.author, jQuery(document), this, document));
