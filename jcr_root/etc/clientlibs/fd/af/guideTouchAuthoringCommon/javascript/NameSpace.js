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
(function (window) {
    //We are adding util and view in guidelib namespace from content frame.
    // These must not be added in editor frame in this namespace.
    var namespace = {
        touchlib : {
            // Any object should go here
            editLayer : {
                constants : {},
                dialogUtils : {},
                dialogEventHandlers : {},
                dorOverlay : {}
            },
            template : {
                initial : {},
                structure : {}
            },
            previewLayer : {
            },
            styleLayer : {
                vars : {}
            },
            designLayer : {
            },
            expEditor : {
            },
            style : {
                constants : {},
                utils : {},
                assetLibrary : {
                    utils : {},
                    ui : {},
                    constants : {},
                    vars : {},
                    history : {
                        manager : {}
                    }
                }
            },
            theme : {
                constants : {},
                utils : {},
                vars : {}
            },
            initializers : {
            },
            constants : {},
            utils : {},
            components : {},
            dataObjectsTree : {},
            replaceComponentTable : {}
        },
        author : {
            editConfigListeners : {},
            instances : {},
            formInfo : {}
        }
    };
    window.guidelib = namespace;
})(window);
