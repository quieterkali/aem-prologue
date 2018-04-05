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
 * @package guidelib.util.Namespace
 * @version 0.0.1
 */

(function (window) {
    this.guidelib = {
        util : {},
        event : {},
        model : {
            util : {},
            mixin : {}
        },
        view : {
            util : {},
            ad : {
                layout : {}
            }
        },
        runtime : {
            _private : {},
            af : {},
            guideContext : {}
        },
        author : {
            instances : {},
            editConfigListeners : {}
        },
        internal : {
            liveModel : {},
            liveXmlUtils : {},
            liveDataUtils : {},
            GuideDirtyMarkerAndVisitor : {}
        }
    };
    // We are using this NS in API  in guideBridge.getSignedDocLink
    window.FD = window.FD || {};
})(window);

