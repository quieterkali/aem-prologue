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
(function($) {
    $(function() {

        $('.cq-social-user-state-toggle-form').each(function() {

            // register form submit listeners for every user state toggle button instance
            var form = $(this);
            var action = form.attr('action');
            action = action.replace('.html', '');
            action += ".json";

            var resource = form.children('input[name=r]').val();
            var stateprovider = form.children('input[name=sp]').val();
            var needapproval = form.children('input[name=na]').val();
            var statusdiv = form.children('.status');
            var submitButton = form.children('input[type=submit]');

            form.submit(function() {

                var currentState = $(this).children('input[name=cs]').val();
                statusdiv.addClass('loading');

                $.ajax({
                    dataType: "json",
                    type: "POST",
                    url: action,
                    data: "cs=" + currentState + "&r=" + resource + "&na=" + needapproval,
                    success: function(msg) {
                        statusdiv.removeClass('loading');
                        if (CQ && CQ.I18n) {
                            statusdiv.html(CQ.I18n.getVarMessage(msg.message));
                            submitButton.val(CQ.I18n.getVarMessage(msg.label));
                        } else {
                            statusdiv.html(msg.message);
                            submitButton.val(msg.label);
                        }
                        submitButton.attr("disabled", true);
                    },
                    error: function(req, status, error) {
                        statusdiv.removeClass('loading');
                        statusdiv.html(status);
                    }
                });

                return false;

            });

            // determine the current toggle state for every user state toggle button instance
            $.ajax({
                dataType: "json",
                type: "GET",
                url: CQ.shared.HTTP.noCaching(action),
                data: "r=" + resource + "&sp=" + stateprovider,
                success: function(msg) {
                    if (msg === null) return;

                    var state = msg.state;
                    var label = msg.label;

                    submitButton.removeClass("toggled");
                    submitButton.removeClass("untoggled");
                    submitButton.removeClass("transition");
                    submitButton.attr("disabled", false);

                    submitButton.addClass(state.toLowerCase());
                    if (CQ && CQ.I18n) {
                        submitButton.val(CQ.I18n.getVarMessage(label));
                    } else {
                        submitButton.val(label);
                    }
                    if ("TRANSITION" == state) {
                        submitButton.attr("disabled", true);
                    }
                },
                error: function(req, status, error) {
                    statusdiv.html(status);
                }
            });
        });
    });
})(window.$CQ || window.$ || (function() {
    throw new Error("jQuery is not defined");
}()));
