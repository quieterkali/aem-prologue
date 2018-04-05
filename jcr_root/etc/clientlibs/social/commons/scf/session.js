/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
 */
(function($CQ, SCF, _, CQ, Granite) {
    "use strict";
    var LoginView = SCF.View.extend({
        viewName: "Login",
        tagName: "div",
        className: "scf-login",
        init: function() {
            this._isReady = false;
            this.listenTo(this.model, this.model.events.LOGGED_IN_SUCCESS, this.render);
            this.listenTo(this.model, this.model.events.LOGGED_OUT, this.render);
        },
        loginAction: function() {
            if (this.model.get("loggedIn")) {
                this.$el.children(".login-dialog").hide();
                this.logout();
            } else {
                var loginDialog = this.$el.children(".login-dialog").toggle();
                loginDialog.find("input:first").focus();
            }
        },
        logout: function() {
            this.model.logout();
        },
        login: function() {
            var username = this.getField("username");
            var password = this.getField("password");
            if (username === "" || password === "") {
                return;
            }
            this.model.login(username, password);
        }
    });
    var LoginModel = SCF.Model.extend({
        moderatorCheckAttribute: "moderatorCheck",
        events: {
            LOGGED_IN_SUCCESS: "login:success",
            LOGGED_IN_FAIL: "login:failed",
            LOGGED_OUT: "logout:success"
        },
        initialize: function(attributes, options) {
            this._isReady = false;
            if (CQ.shared.User.data === undefined || CQ.shared.User.data === null) {
                //Dont call the currentuser.json if data is available
                this.initUser(options);
            } else {
                this.getLoggedInUser(options);
            }
        },
        defaults: {
            "loggedIn": false
        },
        isReady: function() {
            return this._isReady;
        },
        checkIfModeratorFor: function(resource) {
            var componentList = this.attributes.hasOwnProperty(this.moderatorCheckAttribute) ?
                this.attributes[this.moderatorCheckAttribute] : [];
            return this.attributes.loggedIn && _.contains(componentList, resource);
        },
        checkIfUserCanPost: function(resource) {
            var componentList = this.attributes.hasOwnProperty("mayPost") ?
                this.attributes.mayPost : [];
            return this.attributes.loggedIn && _.contains(componentList, resource);
        },
        setLanguage: function(data) {
            var langFromPreferences = data.preferences &&
                data.preferences.language ?
                data.preferences.language :
                "en";
            var language = document.documentElement.lang || langFromPreferences;
            CQ.shared.I18n.setLocale(language);
        },
        initUser: function(options) {
            var CURRENT_USER_URL = CQ.shared.HTTP.externalize("/libs/granite/security/currentuser" + CQ.shared.HTTP.EXTENSION_JSON + "?props=preferences/language");
            CURRENT_USER_URL = CQ.shared.HTTP.noCaching(CURRENT_USER_URL);
            var that = this;
            $CQ.ajax({
                url: CURRENT_USER_URL,
                type: "GET",
                success: function(result) {
                    that.getLoggedInUser(options, result.home);
                    that.setLanguage(result);
                },
                async: false
            });
        },
        getLoggedInUser: function(options, userPath) {
            var that = this;
            var moderationCheckParameter;
            if (options.hasOwnProperty(LoginModel.moderatorCheckAttribute)) {
                moderationCheckParameter = "?" + LoginModel.moderatorCheckAttribute + "=";
                _.each(options[LoginModel.moderatorCheckAttribute], function(item) {
                    moderationCheckParameter += item + ",";
                });
                moderationCheckParameter = moderationCheckParameter.substring(0, moderationCheckParameter.length - 1);
            }
            var userHomePath = "";
            if (userPath !== undefined) {
                userHomePath = userPath;
            } else if (CQ.shared.User.initialized) {
                userHomePath = CQ.shared.User.data.home;
            } else {
                // AEM user not initialized force it:
                var f = CQ.shared.User.init();
                userHomePath = CQ.shared.User.data.home;
            }

            $CQ.ajax({
                url: SCF.config.urlRoot + "/services/social/getLoggedInUser" + moderationCheckParameter + "&h=" + userHomePath,
                xhrFields: {
                    withCredentials: true
                },
                type: "GET"
            }).done(function(user) {
                if (user.name) {
                    that.set({
                        "loggedIn": true
                    });
                    that.set(user);
                }
                that._isReady = true;
                if (typeof options !== "undefined" && options.silent) {
                    that.trigger("model:loaded", {
                        model: that,
                        silent: true
                    });
                } else {
                    that.trigger("model:loaded", {
                        model: that,
                        silent: false
                    });
                }
            });
        },
        logout: function() {
            var that = this;
            $CQ.ajax({
                url: SCF.config.urlRoot + "/services/social/logout",
                xhrFields: {
                    withCredentials: true
                },
                type: "GET"
            }).always(function() {
                that.clear();
                that.trigger(that.events.LOGGED_OUT);
            });
        },
        login: function(username, password) {
            var that = this;
            $CQ.ajax({
                url: SCF.config.urlRoot + "/libs/login.html/j_security_check",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    j_username: username,
                    j_password: password,
                    j_validate: "true"
                },
                type: "POST"
            }).success(function(loginResult, textStatus, jqXHR, id) {
                var amIAuthenticated = jqXHR.getResponseHeader("Set-Cookie") === null || jqXHR.getResponseHeader("Set-Cookie") !== "";
                if (!amIAuthenticated) {
                    this.trigger(this.events.LOGGED_IN_FAIL, {
                        "user": username
                    });
                } else {
                    that.getLoggedInUser();
                    that.trigger(that.events.LOGGED_IN_SUCCESS, {
                        "user": username
                    });
                }
            });
        }
    });
    LoginModel.moderatorCheckAttribute = "moderatorCheck";
    SCF.LoginView = LoginView;
    SCF.LoginModel = LoginModel;

    SCF.registerComponent("login", SCF.LoginModel, SCF.LoginView);

})($CQ, SCF, _, CQ, Granite);
