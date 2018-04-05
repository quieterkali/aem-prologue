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
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 *************************************************************************/

CQ.Social = CQ.Social || {};
CQ.Communities.Enablement = CQ.Communities.Enablement || {};
CQ.Communities.Enablement.Utils = CQ.Communities.Enablement.Utils || {};
CQ.Communities.Enablement.Utils.guid = (function() {
    "use strict";

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
            s4() + "-" + s4() + s4() + s4();
    };
})();

RegExp.quote = function(str) {
    "use strict";

    return (str.toString()).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};
