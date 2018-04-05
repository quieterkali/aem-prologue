/*
 * **********************************************************************
 *  ADOBE CONFIDENTIAL
 *  __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 *  **********************************************************************
 */

(function (window, $, guidelib) {
    guidelib.util.AdUtil = {
        descriptionPlugin : function () {
            if (_.isFunction($.prototype.tooltip)) {
                $(this).find('[data-description]').tooltip({
                    title : function () {
                        //using browser native 'decodeURIComponent' as that is what is used for encoding in CM
                        return decodeURIComponent($(this).data('description'));
                    },
                    placement : 'top',
                    html : true
                });
            }
        },

        applyLayouts : function (options) {
            var strategies = [];
            strategies.push(new guidelib.view.ad.layout.DelimiterLayoutStrategy(options));
            strategies.push(new guidelib.view.ad.layout.ContainerLayoutStrategy(options));
            _.each(strategies, function (strategy, index) {
                strategy.done();
                strategies[index] = null;
            });
        },

        applyDescriptionPlugin : function () {
            $('.guideAdModule, .guideAdModuleGroup').one('mouseenter', guidelib.util.AdUtil.descriptionPlugin);
        }
    };
}(window, $, guidelib));
