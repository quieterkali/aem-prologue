(function ($) {
    $.widget("xfaWidget.afcaptcha", $.xfaWidget.abstractWidget, {

        _widgetName : "GuideCaptcha",

        captchaImgPath : '',

        captchaStartTime : 0,

        render : function () {
            var self, captchaContainer, content;

            self = this;
            this.element.append('<div class="guide-af-captcha"></div>');
            captchaContainer = $("div.guide-af-captcha");
            this.captchaImgPath = Granite.HTTP.externalize(this.options.captchaConfigData["jcr:path"] + ".captcha.png");

            content = '<input type="hidden" id="afcaptchakey" value=""/>' +
                               '<div>' +
                                   '<div class="afcaptcha-img"><img id="afcaptchaimg" src="' + this.captchaImgPath + '?id=" alt=""></div>' +
                                   '<div class="afcaptcha-input"><input type="text" id="afcaptchaToken"/></div>' +
                                   '<div class="afcaptcha-refresh"><input type="button" class="afcaptcha-refresh-btn" value="Reload"></div>' +
                               '</div>' +
                                '<div class="timer-bar-holder">' +
                                    '<div id="afcaptchatimer" class="afcaptchatimer" style="width: 63px;"></div>' +
                                '</div>';

            captchaContainer.html(content);

            $('.afcaptcha-refresh-btn').click(function () {
                captchaRefresh();
            });

            $('#afcaptchaToken').focusout(function () {
                self.tokenChange();
            });

            var captchaRefresh = function () {
                var captchaKey, captchaImg, captchaKeyElem;

                captchaKey = ("" + Math.random()).substring(3, 8);
                captchaImg = document.getElementById("afcaptchaimg");
                captchaKeyElem = document.getElementById("afcaptchakey");

                captchaImg.src = Granite.HTTP.externalize(self.captchaImgPath + "?id=" + captchaKey);
                captchaKeyElem.value = captchaKey;
                self.captchaStartTime = new Date().getTime();
            };

            var captchaTimer = function () {
                var now = new Date().getTime();
                if ((now - self.captchaStartTime) > 60000) {
                    captchaRefresh();
                }
                var captchaTimerElem = document.getElementById("afcaptchatimer");
                if (!captchaTimerElem) {
                    // captcha has been removed
                    return;
                }
                var width = Math.floor((60000 - (now - self.captchaStartTime)) / 60000 * 64);
                captchaTimerElem.innerHTML = "<div class=\"afcaptchatimer-bar\" style=\"width:" + width + "px;\"></div>";
                setTimeout(captchaTimer, 500);
            };

            captchaTimer();
            return $("div.guide-af-captcha");
        },

        tokenChange : function () {
            var tokenData = null, token = $('#afcaptchaToken').val();
            if (!_.isEmpty(token)) {
                tokenData = {
                    'captchaToken' : token,
                    'captchaKey' : $('#afcaptchakey').val()
                };
            }
            this.element.trigger({
                type : "tokenChange.captcha",
                token : tokenData
            });
        }
    });
})($);
