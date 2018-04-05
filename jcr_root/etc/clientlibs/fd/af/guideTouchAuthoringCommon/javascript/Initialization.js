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

(function (window, $, channel, author, guidetouchlib) {
    var _superCalculateSearchPaths = author.calculateSearchPaths;
    /**
     * Calculates the search paths.
     * Overriding this function for forms editor, since in case of forms the hierarchy of editable can be deeply nested.
     * Hence checking if cfg is forms specific, then the CSP Array calculation is done differently
     * and for other components we follow the normal path.
     *
     * @param cfg   Configuration of component from Server(Legacy CQ Logic)
     */
    author.calculateSearchPaths = function (cfg) {
            var searchExpr = cfg.csp ? cfg.csp : cfg,
                cspParts = (searchExpr || '').split('/'),
                searchPaths = [],
                bIsCSPBuiltFromEditableTemplate = ((searchExpr && searchExpr.indexOf("|") === -1) ? true : false),
                segments = [],
                i, start, end,
                isFormsComponent = false,
                checkIfConfigIsAdaptiveForm = function (searchExpr) {
                    // note: Any new resource type should be added if not inherited from below mentioned strings
                    // even if not done, there wouldn't be any crash but the performance in authoring may slow down
                    // check if it is a field
                    if (searchExpr.lastIndexOf("guidefield") === searchExpr.length - "guidefield".length
                            // check if it is for image
                        || searchExpr.lastIndexOf("guideimage") === searchExpr.length - "guideimage".length
                            // check if it is a toolbar
                        || searchExpr.lastIndexOf("toolbar") === searchExpr.length - "toolbar".length
                            // check if it is a panel
                        || searchExpr.lastIndexOf("panel") === searchExpr.length - "panel".length
                            // check if it is a root panel
                        || searchExpr.lastIndexOf("rootPanel") === searchExpr.length - "rootPanel".length
                            // check if it is a guide container
                        || searchExpr.lastIndexOf("guideContainer") === searchExpr.length - "guideContainer".length
                            // this is for the parsys which we create for every layout
                        || searchExpr.lastIndexOf("new") === searchExpr.length - "new".length
                            // this is for grid fluid layout
                        || searchExpr.lastIndexOf("gridFluidLayout") === searchExpr.length - "gridFluidLayout".length) {
                        return true;
                    }
                    return false;
                },
                /**
                 * Internal function that multiplies the given paths array with the names.
                 * @param {Array} paths array of paths
                 * @param {Array} names array of names
                 * @return {Array} the product
                 * @note: Any changes in multiply API in AEM's code should also change here
                 */
                multiply = function (paths, names) {
                    var tmp = [],
                        i, j, tmpPath;
                    for (i = 0; i < paths.length; i++) {
                        for (j = 0; j < names.length; j++) {
                            tmpPath = paths[i];
                            if (tmpPath.length > 0) {
                                tmpPath += "/";
                            }
                            tmpPath += names[j];
                            tmp.push(tmpPath);
                        }
                    }
                    return tmp;
                };
            if (searchExpr) {
                isFormsComponent = checkIfConfigIsAdaptiveForm(searchExpr);
            }
            // in case of new CSP design path for cases where form is created from editable template
            // we would need to fall back to legacy logic
            if (!isFormsComponent || bIsCSPBuiltFromEditableTemplate) {
                return _superCalculateSearchPaths(cfg);
            }
            for (i = 0; i < cspParts.length; i++) {
                if (cspParts[i].length > 0) {
                    segments.push(cspParts[i].split('|'));
                }
            }
            if (segments.length > 0) {
                start = 0;
                end = segments.length;
                searchPaths = segments[start];
                for (i = start + 1; i < end; i++) {
                    searchPaths = multiply(searchPaths, segments[i]);
                }
                // adding in the end since in the design mode a user can edit the component and that is saved with
                // full hierarchical path and that should take priority
                searchPaths = searchPaths.concat(multiply(segments[start], segments[end - 1]));
            }
            return searchPaths;
        };
}(window, $, jQuery(document), Granite.author, guidelib.touchlib));

