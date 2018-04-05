/*******************************************************************************
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
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 ******************************************************************************/

(function(ns){

    var clientcode = ns.clientCode;
    var server = clientcode + '.tt.omtrdc.net';

    // set the mbox.js parameters here
    window.targetGlobalSettings = {
        "clientCode": clientcode,
        "serverHost": server
    };


})(CQ_Analytics.TestTarget);