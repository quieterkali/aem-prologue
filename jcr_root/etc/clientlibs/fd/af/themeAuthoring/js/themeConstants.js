/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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
    /*
    *   Theme editor specific constants
    *
    */
;(function (window, _, $, constants) {
    //Note: Form path is used by pageInfo and requires absolute path
    //TODO: Identify if overlay has been done, and update automatically by passing this info
    //      from the server
    constants.DEFAULT_CONFIGURED_FORM = "/libs/fd/af/themes/default"; //path for default form
    constants.ROOT_PANEL_SELECTOR = ".guideRootPanel"; //path for default form
    constants.ASSETS_RELATIVE_PATH = "../assets";
    constants.TYPEKIT_CONFIG = ".fdtheme-typekitConfig";
    constants.SAVE_THEME_ERROR_MESSAGE = "Unable to save the theme to the server.";
    constants.OBJECT_HIERARCHY_CONTAINER_CLASS = "objHierarchyContainer";
    constants.THEME_PATH_SELECTOR = ".theme-path";
    constants.THEME_PATH_DATA_ATTRIBUTE = "data-theme-path";
}(this, window._, $, window.guidelib.touchlib.theme.constants));
