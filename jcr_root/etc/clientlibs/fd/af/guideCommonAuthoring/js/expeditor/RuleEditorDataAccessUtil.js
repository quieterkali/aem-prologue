/*******************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 ******************************************************************************/

(function (guidelib, expeditor) {

    var afWindow = window._afAuthorHook ? window._afAuthorHook._getAfWindow() : window,
        AuthorUtils = guidelib.author.AuthorUtils;

    var RuleEditorDataAccessUtil = guidelib.author.RuleEditorDataAccessUtil = {

        MIGRATION_SERVLET_PATH : "/libs/fd/foundation/gui/content/migration/startmigration.assets.json",
        GUIDE_PROPERTY_PROVIDER_PATH : "/libs/fd/af/components/info.json",

        /**
         * Returns jquery deferred of fetching custom function config
         */
        fetchFunctionsConfig : function () {
            return $.ajax({
                type : "GET",
                url : Granite.HTTP.externalize(this.GUIDE_PROPERTY_PROVIDER_PATH),
                dataType : "json",
                data : {
                    type : 'customfunction',
                    guideContainerPath : guidelib.author.AuthorUtils.getGuideContainerPath()
                },
                async : true
            }).then(function (data) {
                    return data;
                });
        },

        cachedFetchFunctionsConfig : function () {
            var self = this;
            if (this.customFunctionConfig) {
                return $.when(this.customFunctionConfig);
            } else {
                return this.fetchFunctionsConfig().then(function (data) {
                    self.customFunctionConfig = data;
                    return self.customFunctionConfig;
                });
            }
        },

        fetchWebServicesConfig : function () {
            var deferred = $.Deferred();
            $.ajax({
                type : "GET",
                url : afWindow.$(AuthorUtils.GUIDE_CONTAINER_SELECTOR).data('path') + ".af.dermis",
                dataType : "json",
                data : {
                    functionToExecute : 'getAllServices'
                }
            }).done(function (data) {
                deferred.resolve(data);
            }).fail(function () {
                deferred.resolve([]);
            });
            return deferred;
        },

        cachedFetchWebServicesConfig : function () {
            var self = this;
            if (this.webServicesConfig) {
                return $.when(this.webServicesConfig);
            } else {
                return $.when(
                        this.fetchWebServicesConfig()
                    ).then(function (webServices) {
                        self.webServicesConfig = webServices;
                        return self.webServicesConfig;
                    });
            }
        },

        fetchFieldData : function (path) {
            return $.get(path + '.2.json', {"_" : $.now()}).then(function (data) {
                return data;
            });
        },

        fetchTreeJson : function () {
            var requestPath = afWindow.$(AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path") + ".expjson";
            return $.get(
                requestPath,
                {"_" : $.now()}
            ).then(function (data) {
                    return data;
                });
        },

        migrateComponent : function (fieldpath) {
            var guideContainerFormRelativePath = "/jcr:content/" + AuthorUtils.getGuideContainerPath();
            var formPath = afWindow.$(AuthorUtils.GUIDE_CONTAINER_SELECTOR).data("path").slice(0, -1 * guideContainerFormRelativePath.length);
            return $.post(
                RuleEditorDataAccessUtil.MIGRATION_SERVLET_PATH + formPath,
                {
                    "operation" : "migrate",
                    "forcedMigrationComponentPath" : fieldpath
                }
            ).then(function (data) {
                    return data;
                });
        }
    };

}(guidelib, expeditor));
