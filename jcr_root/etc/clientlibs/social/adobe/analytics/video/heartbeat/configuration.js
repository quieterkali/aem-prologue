/*
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.

 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
 * terms of the Adobe license agreement accompanying it.  If you have received this file from a
 * source other than Adobe, then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 */

(function() {
    'use strict';

    // Export symbols.
    CQ.Communities.Analytics.VHL.Configuration = {
        PLAYER: {
            NAME: 'AEM Communities Enablement Resource Player',
            VIDEO_ID: 'aemenablement'
        },

        VISITOR_API: {
            MARKETING_CLOUD_ORG_ID: '',
            NAMESPACE: '',
            TRACKING_SERVER: ''
        },

        APP_MEASUREMENT: {
            RSID: '',
            TRACKING_SERVER: ''
        },

        HEARTBEAT: {
            TRACKING_SERVER: 'heartbeats.omtrdc.net',
            JOB_ID: 'j2',
            PUBLISHER: 'adobe',
            CHANNEL: 'Training',
            OVP: 'html',
            SDK: '5'
        }
    };
})();
