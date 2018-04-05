// jscs:disable requireDotNotation
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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
(function (touchlib) {

    /**
     * Components replaceable with each other are defined here.
     * This is applicable for XFA based adaptive forms only.
     */
    touchlib.replaceComponentTable["guidecheckbox"] = ["guideradiobutton", "guidedropdownlist","guideswitch"];
    touchlib.replaceComponentTable["guideradiobutton"] = ["guidecheckbox", "guidedropdownlist","guideswitch"];
    touchlib.replaceComponentTable["guidedropdownlist"] = ["guidecheckbox", "guideradiobutton","guideswitch"];
    touchlib.replaceComponentTable["guideswitch"] = ["guidecheckbox", "guideradiobutton","guidedropdownlist"];
    touchlib.replaceComponentTable["guidetextbox"] = ["guidenumericbox", "guidepasswordbox"];

}(window.guidelib.touchlib));
