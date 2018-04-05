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
(function(_, $CQ, Backbone, Handlebars, SCF) {
    "use strict";

    // select user
    var initUserSelector = function(el_selector, path, dropDown) {
        var $el = $CQ(el_selector);
        // userlist node needs to be next to ugc node
        var base_url = path;
        $el.autocomplete({
            source: function(request, response) {
                var searchString = $CQ(el_selector).val();
                var filterObject = {
                    "operation": "CONTAINS",
                    "./@rep:principalName": searchString
                };
                filterObject = [filterObject];
                var filterGivenName = {
                    "operation": "like",
                    "profile/@givenName": searchString
                };
                filterObject.push(filterGivenName);
                var filterFamilyName = {
                    "operation": "like",
                    "profile/@familyName": searchString
                };
                filterObject.push(filterFamilyName);
                filterObject = JSON.stringify(filterObject);

                var url = base_url + ".social.0.20.json";
                url = CQ.shared.HTTP.addParameter(url, "filter", filterObject);
                url = CQ.shared.HTTP.addParameter(url, "type", "users");
                url = CQ.shared.HTTP.addParameter(url, "fromPublisher", "true");
                url = CQ.shared.HTTP.addParameter(url, "_charset_", "utf-8");
                url = CQ.shared.HTTP.addParameter(url, "groupId", "community-members");
                $.get(url, function(data) {
                    var users = data.items;
                    $el.data("lastQueryResult", users);
                    response(users);
                });
            },
            minLength: 3,
            change: function(event, ui) {
                dropDown.model.set("composedForValid", dropDown.validateUser($el.val()));
            },
            select: function(event, ui) {
                dropDown.model.set("composedForValid", true);
                $CQ(this).val(ui.item.authorizableId);
                return false;
            },
            setvalue: function(value) {
                this.element.val(value);
                this.input.val(value);
                $CQ(this).val(value);
            }
        }).data("uiAutocomplete")._renderItem = function(ul, item) {
            if (item.avatarUrl) {
                return $CQ("<li></li>").append(
                        "<a><img src='" + item.avatarUrl + "' width='30' height='30'/>&nbsp;" + item.name + "</a>")
                    .data("item.autocomplete", item).appendTo(ul);
            } else {
                return $CQ("<li></li>").append("<a>" + item.name + "</a>").data("item.autocomplete", item).appendTo(ul);
            }
        };
    };

    var UserDropDown = function(inputEl, config, model) {
        this.$el = $CQ(inputEl);
        this.model = model;
        this.config = config;
        this.modelId = this.model.get("forumId");
        if (_.isEmpty(this.modelId)) {
            this.modelId = this.model.get("id");
        }
        initUserSelector($CQ(inputEl), this.modelId + "/userlist", this);
    };

    var isUserInList = function(userList, userName) {
        for (var user in userList) {
            if (userList[user].authorizableId === userName) {
                return true;
            }
        }
        return false;
    };

    UserDropDown.prototype.validateUser = function(userName) {
        var isValid = false;

        // Check to see if the user is blank
        if (userName.trim().length === 0)
            return true;

        // First, check last (cached) search, if it exists
        if (this.$el.data("lastQueryResult")) {
            if (isUserInList(this.$el.data("lastQueryResult"), userName)) {
                isValid = true;
            }
        }
        // Next, perform a query and check to see if we find a match
        if (!isValid) {
            var users = this.searchUsers(userName);
            isValid = isUserInList(users, userName);
        }
        return isValid;
    };

    UserDropDown.prototype.searchUsers = function(userName) {
        var base_url = this.modelId + "/userlist";
        var url = base_url + ".social.0.20.json?search=" + userName + "&showUsers=true";
        var users;
        $.get(url, function(data) {
            users = data.items;
        });
        users = users || [];
        return users;
    };

    UserDropDown.prototype.getValue = function() {
        return this.$el.val();
    };

    UserDropDown.prototype.setValue = function() {
        // Some model prop
        this.$el.autocomplete().setValue(this.model.get("author").id);
    };

    UserDropDown.prototype.focus = function() {
        $CQ(this.el).focus();
    };

    UserDropDown.prototype.destroy = function() {
        if (this.$el.data('autocomplete') || this.$el.data('lastQueryResult')) {
            this.$el.autocomplete("destroy");
        }
    };

    SCF.registerFieldType("userdropdown", UserDropDown);
    SCF.UserDropDown = UserDropDown;
})(_, $CQ, Backbone, Handlebars, SCF);
