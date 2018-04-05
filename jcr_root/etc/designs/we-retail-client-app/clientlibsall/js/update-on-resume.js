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
(function() {

    'use strict';

    var checkForUpdate = function() {
        // Read ng-app attribute from the html tag to determine appName
        var appName = document.getElementsByTagName('html')[0].getAttribute('ng-app');
        // Add any necessary headers here
        var reqHeaderObject = {};
        var contentUpdater = CQ.mobile.contentUpdate({
            id: appName,
            requestHeaders: reqHeaderObject
        });

        var contentPackageName = document.documentElement.getAttribute("lang");

        // Check for an update
        contentUpdater.isContentPackageUpdateAvailable(contentPackageName,
            function callback(error, isUpdateAvailable) {
                if (error) {
                    // Log the error: do NOT notify
                    return console.error(error);
                }

                if (isUpdateAvailable) {
                    // Confirm if the user would like to update now
                    navigator.notification.confirm('An update is available, would you like to install it now?',
                        function onConfirm(buttonIndex) {
                            if (buttonIndex == 1) {
                                // user selected 'Update'
                                contentUpdater.updateContentPackageByName(contentPackageName,
                                    function callback(error, pathToContent) {
                                        if (error) {
                                            return navigator.notification.alert(error, null, 'Error');
                                        }
                                        // else
                                        console.log('Update complete; reloading app.');
                                        window.location.reload( true );
                                    });
                            }
                            else {
                                // user selected Later
                                // no-op
                            }
                        },
                        'Content Update',       // title
                        ['Update', 'Later'] // button labels
                    );
                }
                else {
                    // App is up to date: log it, do NOT notify
                    return console.log('App is up to date');
                }
            }
        );
    };

    var onResume = function() {
        console.log('App resume event caught: checking for update.');
        checkForUpdate();
    };

    var onDeviceReady = function() {
        console.log('App deviceready event caught: checking for update.');
        // Attach resume listener
        document.addEventListener("resume", onResume, false);
        // ..and check for update
        checkForUpdate();
    };

    // Attach deviceready listener
    document.addEventListener("deviceready", onDeviceReady, false);
})();