
(function($){

    function getQueryStringParameter(key, queryString) {
            var url = queryString || location.search;

            key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx control chars
            var match = url.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
            return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }

    function bootstrap() {
        var resourceUrl = getQueryStringParameter("resource"),
            user = getQueryStringParameter("user", resourceUrl) || "admin",
            password = getQueryStringParameter("password", resourceUrl) || "admin",
            runId = getQueryStringParameter("runId", resourceUrl);

        // Hobbes.js test execution request
        // Force login + redirection to testrunner page
        if (runId) {
            $("form #username").val(user);
            $("form #password").val(password);

            $("#login").submit();
        }
    }

    $(window).load(function() {
        bootstrap();
    });

})($);
