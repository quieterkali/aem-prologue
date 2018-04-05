(function ($) {
    $.widget("xfaWidget.recaptcha", $.xfaWidget.abstractWidget, {

        g_recaptcha_response : '',

        recaptcha_url : 'https://www.google.com/recaptcha/api.js',

        _widgetName : "Recaptcha",

        render : function () {
            var self = this;
            this.element.append('<div class="g-recaptcha"></div>');
            var gcontainer = $("div.g-recaptcha")[0];
            var widgetId;
            window.successCallback = function (response) {
                self.g_recaptcha_response = response;
                self.tokenChange();
            };

            window.expiredCallback = function () {
                grecaptcha.reset(widgetId);
                self.g_recaptcha_response = '';
                self.tokenChange();
            };

            var gparameters = {
                'sitekey' : this.options.captchaConfigData.rcSitekey,
                'theme' : this.options.captchaConfigData.rcTheme || 'light',
                'type' : this.options.captchaConfigData.rcType || 'image',
                'size' : this.options.captchaConfigData.rcSize || 'normal',
                'callback' : window.successCallback,
                'expired-callback' : window.expiredCallback
            };

            onloadCallbackInternal = function () {
                widgetId = grecaptcha.render(
                gcontainer,
                     gparameters
                );
                return widgetId;
            };

            window.onloadRecaptchaCallback = onloadCallbackInternal;

            var runtimeLocale = this.element.data("locale");

            this.element.append('<script src="' + this.recaptcha_url + '?onload=onloadRecaptchaCallback&render=explicit&hl=' + runtimeLocale + '" async defer></script>');

            return $("div.g-recaptcha");
        },

        tokenChange : function () {
            var tokenData = null, token = this.g_recaptcha_response;
            if (!_.isEmpty(token)) {
                tokenData = {
                    'g_recaptcha_response' : token,
                    'rcCloudServicePath' : this.options.captchaConfigData.rcCloudServicePath
                };
            }
            this.element.trigger({
                type : "tokenChange.captcha",
                token : tokenData
            });
        }
    });
})($);
