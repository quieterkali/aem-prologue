/*
 *  Copyright 2016 Adobe Systems Incorporated
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function(pushImpl, undefined) {

    'use strict';

    /**
     * Called when a notification has been acknowledged by the user.
     * @param {object} notificationData - raw data from the notification
     */
    var notificationAcknowledged = function(notificationData) {
        console.log("[we-retail] push notification acknowledged by the user");
        // Use the ADB plugin to record that the push was read
        if (window.ADB) {
            var trackingData = {
                deliveryId: notificationData.deliveryId,
                broadlogId: notificationData.broadlogId,
                action: "2"
            };
            console.log("[we-retail] sending tracking data to ADB: " + JSON.stringify(trackingData));
            window.ADB.trackAction("tracking", trackingData);
        }
    };

    /**
     * Called when a notification is received by the app, but before it has been acknowledged
     * by the user.
     * @param {object} notificationData - raw data from the notification
     */
    var weRetailNotificationHandler = function(notificationData) {
        console.log("[we-retail] push notification received");
        pushImpl.genericNotificationHandler(notificationData, notificationAcknowledged);
    };

    /**
     * Custom logic for handling deep links in the app.
     * @param {string} linkPath - path to link to
     */
    var weRetailDeepLinkHandler = function(linkPath) {
        console.log("[we-retail] deep link received: [" + linkPath + "]");
        pushImpl.genericDeepLinkHandler(linkPath);
    };

    /**
     * Initialize the Push Notification mechanism.
     */
    var initializePushNotifications = function() {
        console.log('[we-retail] initializing push notifications');
        pushImpl.initialize({
            notificationHandler: weRetailNotificationHandler,
            deepLinkHandler: weRetailDeepLinkHandler
        });
    };

    var onDeviceReady = function() {
        initializePushNotifications();
    };

    // Attach deviceready listener
    document.addEventListener("deviceready", onDeviceReady, false);

})(CQ.mobile.push);
