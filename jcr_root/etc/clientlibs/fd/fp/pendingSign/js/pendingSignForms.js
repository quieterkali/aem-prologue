/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
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
 **************************************************************************/

(function(document, $) {
    var pendingSignGuidePanelMaxHeight = null, pageCount = 1, pendingSignToShow, responsePendingSignGlobal, totalResult = $("#tabs").data("totalresults"),cutPoints=[];
    var pendingSignTemplateString = $("#pendingSignCustomTemplate").html().split('&quote;').join('\"');
    for(var i = 1; i< pendingSignTemplateString.replace(/[\r\t\n]/g, " ").split("\${").length;i++) {
        cutPoints.push((pendingSignTemplateString.replace(/[\r\t\n]/g, " ").split("\${")[i].split("}")[0]));
    }
    var reqCutPoints =  jQuery.unique(cutPoints.toString().split(",")).toString();
    var servletPath = $("#tabs").data("servletpath");
    var urlToGetPendingSign = Granite.HTTP.externalize(servletPath + ".fp.draft.json?func=getPendingSignInstances");
	var urlToCancelPendingSign = Granite.HTTP.externalize(servletPath + ".fp.draft.json?func=cancelAgreement");

    var getPendingSignForms = function(){
        $.ajax({
            type: "GET",
            url: urlToGetPendingSign,
            dataType: "json",
            cache: false,
            data:{
                cutPoints:reqCutPoints
            },
            success: function(response) {
                responsePendingSignGlobal = response.reverse();
                pendingSignToShow = responsePendingSignGlobal;
                $("#pendingSignFormsTitle").text($("#pendingSignFormsTitle").data("pendingsignformstitle")+"("+(responsePendingSignGlobal.length) + ")");
                checkForPendingSignView();
            },
            error:function(){
            }
        });
    };

    $("#morePendingSignForm").click(function() {
        showMorePendingSignForms(pendingSignToShow,pageCount);
    });

    $("#morePendingSignForm").keypress(function(e) {
        var eventCode = e.keyCode || e.charCode || e.which;
        if (eventCode == 13 || eventCode == 32) {
            showMorePendingSignForms(pendingSignToShow, pageCount);
        }
    });

    var showPendingSignForms = function(){
        var pendingSignTextSearchBox = $("#pendingSignTextSearchBox");
        pendingSignTextSearchBox.val("");
        pendingSignTextSearchBox.keyup();
        $("#pendingSignLister").css("display","block");
    };

    $("#pendingSignTextSearchBox").keyup(function(){
        pageCount = 1;
        if($("#pendingSignTextSearchBox").val())
            $("#morePendingSignForm").hide();
        else
            $("#morePendingSignForm").show();
        pendingSignToShow = responsePendingSignGlobal.filter(function(item){ return item.name.toLowerCase().search($("#pendingSignTextSearchBox").val().trim().replace(/ +(?= )/g,'').toLowerCase()) >= 0;});
        showFirstPendingSignFormsPage(pendingSignToShow);
    });

    var showMorePendingSignForms = function(response,pageNumber){
        var pendingSignPanel = $("._FP_pendingSignFormPanel");
        if(pendingSignGuidePanelMaxHeight == null){
            pendingSignGuidePanelMaxHeight = pendingSignPanel.height()+parseInt(pendingSignPanel.css("border-top-width"))+parseInt(pendingSignPanel.css("border-bottom-width"));
            pendingSignPanel.css("max-height",pendingSignGuidePanelMaxHeight);
        }
        var customTemplate = $.parseHTML($("#pendingSignCustomTemplate").html());
        var totalPendingSignForms = response.length, i = (pageNumber-1)*totalResult, j= 0, morePendingSignForms = $("#morePendingSignForm");
        var totalRepeatable = $(customTemplate).find("[data-repeatable=true]").length;
        var customTemplateParent =  $(customTemplate).wrap("<div class='testDiv'></div>").parent();
        var totalRepeatable = $(customTemplateParent).find("[data-repeatable=true]").length;
        var templateToAppend = "";
        while(totalRepeatable--){
            var currentTemplateObj = $($(customTemplateParent).find("[data-repeatable=true]")[totalRepeatable]);
            $(currentTemplateObj).wrap("<div class='currentTemplateParent'></div>");
            var currentTemplateParent = $(currentTemplateObj).parent();
            var currentTemplate = currentTemplateParent.html();
            while(i<totalPendingSignForms && j++ <totalResult ){
                var time = isNaN(new Date(response[i]["jcr:lastModified"])) ? new Date(parseInt(response[i]["jcr:lastModified"])) : new Date(response[i]["jcr:lastModified"]);
                var currentTime = new Date();
                var diffTime = milliSecondsToString(currentTime - time);
                var iconClass = "__FP_iconClass" + i%6;
                var name = response[i].name;
                var firstLetter = name.substring(0,1);
                var desc = response[i].description;
                if(!desc)
                    desc = "";
                response[i].path = Granite.HTTP.externalize(response[i].path);
                var contextPath = Granite.HTTP.externalize("/");
                response[i].contextPath = contextPath.substring(0,contextPath.length-1);
                var pendingSignID = response[i].pendingSignID;
                time.today();
                time.timeNow();
                response[i].Today = time.Today;
                response[i].TimeNow = time.TimeNow;
                response[i].diffTime = diffTime;
                response[i].iconClass = iconClass;
                response[i].firstLetter = firstLetter.toUpperCase();
                response[i].description = desc;
                response[i].renderPath = Granite.HTTP.externalize(response[i]["renderPath"] ? response[i]["renderPath"] : response[i]["path"]);
                var oldUnderscoreTemplateSetting = _.templateSettings.interpolate;
                var oldUnderscoreTemplateEscapeSetting = _.templateSettings.escape;
                _.templateSettings.interpolate = /\$\{(.+?)\}/g;
                _.templateSettings.escape = /\$\{(.+?)\}/g;
                templateToAppend += _.template(currentTemplate,response[i]);
                _.templateSettings.interpolate = oldUnderscoreTemplateSetting;
                _.templateSettings.escape = oldUnderscoreTemplateEscapeSetting;
                i++;
            }
        }
        $($("#__FP_appendPendingSign").find("[data-repeatable]").last().parent()).append(templateToAppend);
        if(totalPendingSignForms < (pageNumber)*totalResult+1){
            morePendingSignForms.hide();
        }
        else{
            morePendingSignForms.show();
            pageCount++;
        }
    };

    var showFirstPendingSignFormsPage = function(response){
        var customTemplate = $.parseHTML($("#pendingSignCustomTemplate").html());
        var morePendingSignForms = $("#morePendingSignForm");
        $("#__FP_appendPendingSign").empty();
        var customTemplateParent =  $(customTemplate).wrap("<div class='testDiv'></div>").parent();
        var totalRepeatable = $(customTemplateParent).find("[data-repeatable=true]").length;
        while(totalRepeatable--){
            var currentTemplateObj = $($(customTemplateParent).find("[data-repeatable=true]")[totalRepeatable]);
            $(currentTemplateObj).wrap("<div class='currentTemplateParent'></div>");
            var currentTemplateParent = $(currentTemplateObj).parent();
            var currentTemplate = currentTemplateParent.html();
            var templateToAppend = "";
            for(var i=0;i<response.length&&i<totalResult;i++){
                var time = isNaN(new Date(response[i]["jcr:lastModified"])) ? new Date(parseInt(response[i]["jcr:lastModified"])) : new Date(response[i]["jcr:lastModified"]);
                var currentTime = new Date();
                var diffTime = milliSecondsToString(currentTime - time);
                var iconClass = "__FP_iconClass" + i%6;
                var name = response[i].name;
                var firstLetter = name.substring(0,1);
                var desc = response[i].description;
                if(!desc)
                    desc = "";
                response[i].path = Granite.HTTP.externalize(response[i].path);
                var contextPath = Granite.HTTP.externalize("/");
                response[i].contextPath = contextPath.substring(0,contextPath.length-1);
                var pendingSignID = response[i].pendingSignID;
                time.today();
                time.timeNow();
                response[i].Today = time.Today;
                response[i].TimeNow = time.TimeNow;
                response[i].diffTime = diffTime;
                response[i].iconClass = iconClass;
                response[i].firstLetter = firstLetter.toUpperCase();
                response[i].description = desc;
                response[i].renderPath = Granite.HTTP.externalize(response[i]["renderPath"] ? response[i]["renderPath"] : response[i]["path"]);
                var oldUnderscoreTemplateSetting = _.templateSettings.interpolate;
                var oldUnderscoreTemplateEscapeSetting = _.templateSettings.escape;
                _.templateSettings.interpolate = /\$\{(.+?)\}/g;
                _.templateSettings.escape = /\$\{(.+?)\}/g;
                templateToAppend += _.template(currentTemplate,response[i]);
                _.templateSettings.interpolate = oldUnderscoreTemplateSetting;
                _.templateSettings.escape = oldUnderscoreTemplateEscapeSetting;
            }
            $(customTemplateParent.find(".currentTemplateParent")).replaceWith(templateToAppend);
        }
        $("#__FP_appendPendingSign").append(($(customTemplateParent).clone()).html());
        if(response.length <= totalResult){
            morePendingSignForms.hide();
        }
        else{
            morePendingSignForms.show();
            pageCount++;
        }
    };

    openPendingSignForm = function(e){
        var path = $(e).attr('path');
        var name = $(e).attr('title');
        var formTarget = (path)+".html";
        window.open(formTarget);
    };

    var checkForPendingSignView = function() {
        if(responsePendingSignGlobal.length == 0){
            $("#__FP_appendPendingSign").empty();
            $("#pendingSignTextSearchBox").hide();
            return;
        }
        showPendingSignForms();
    };

    var milliSecondsToString = function(milliSeconds){
        window.FD.FP.Util.setLocale($("#tabs").data("locale"));
        var seconds = parseInt(milliSeconds/1000);
        var numyears = Math.floor(seconds / 31536000);
        var numdays = Math.floor((seconds % 31536000) / 86400);
        var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
        var yearText   = window.FD.FP.Util.getLocalizedValue(" Years "),
            daysText   = window.FD.FP.Util.getLocalizedValue(" Days "),
            hourText   = window.FD.FP.Util.getLocalizedValue(" Hour "),
            minText    = window.FD.FP.Util.getLocalizedValue(" Minutes "),
            secText    = window.FD.FP.Util.getLocalizedValue(" Seconds "),
            oneMinText = window.FD.FP.Util.getLocalizedValue(" Minute "),
            agoText    = window.FD.FP.Util.getLocalizedValue("Ago");
        if(numyears > 0)
            return numyears + yearText + agoText;
        else if(numdays > 1)
            return numdays + daysText + agoText;
        else if(numdays == 1)
        {
            if(numhours > 0)
                return numdays + daysText + numhours + hourText + agoText;
            else
                return numdays + daysText + agoText;
        }
        else if(numhours > 0)
        {
            if(numminutes > 0)
                return numhours + hourText + numminutes + minText + agoText;
            else
                return numhours + hourText + agoText;
        }
        else if(numminutes > 0)
        {
            if(numminutes > 1)
                return numminutes + minText + agoText;
            else
                return numminutes + oneMinText + agoText;
        }
        else return window.FD.FP.Util.getLocalizedValue("Just now");
    };

    var cancelPendingSign = function(e){
        var pendingSignID = $(e).attr('pendingSignID'),
            confirm = window.confirm(window.FD.FP.Util.getLocalizedValue("Are you sure, you want to cancel this Pending Sign Form ?")),
            formPath = $(e).attr('formPath'),
            errorMessage = window.FD.FP.Util.getLocalizedValue("Error occurred while cancelling the Pending Sign form");
            unableToCancelMessage = window.FD.FP.Util.getLocalizedValue("Unable to cancel the Pending Sign form");
        if(confirm == true){
            $.ajax({
                type:"POST",
                url: urlToCancelPendingSign,
                dataType: 'json',
                async: true,
                cache: false,
                data: {
                    pendingSignID:pendingSignID,
                    formPath:formPath
                },
                complete: function (xhr, status) {
                    if (status === 'error') {
                        alert(errorMessage);
                    } else {
                        if(xhr.responseText === "UNABLE_TO_CANCEL") {
                            alert(unableToCancelMessage);
                        }
                        getPendingSignForms();
                    }
                }
            });
        }
    };

    $(document).on( "click", ".__FP_cancelPendingSign", function(){
        cancelPendingSign(this);
    });

    $(document).on( "keypress", ".__FP_cancelPendingSign", function(e){
        var eventCode = e.keyCode || e.charCode || e.which;
        if(eventCode == 13 || eventCode == 32){
            cancelPendingSign(this);
        }
    });

    $(document).ready(getPendingSignForms());
})(document, jQuery);
