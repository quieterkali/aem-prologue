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
    var submittedGuidePanelMaxHeight = null, pageCount = 1, submittedGuideToShow, responseSubmittedGlobal, totalResult = $("#tabs").data("totalresults"),cutPoints=[];
    var submitTemplateString = $("#submissionsCustomTemplate").html().split('&quote;').join('\"');
    for(var i = 1; i< submitTemplateString.replace(/[\r\t\n]/g, " ").split("\${").length;i++) {
        cutPoints.push((submitTemplateString.replace(/[\r\t\n]/g, " ").split("\${")[i].split("}")[0]));
    }
    var reqCutPoints =  jQuery.unique(cutPoints.toString().split(",")).toString();
    var servletPath = $("#tabs").data("servletpath");
    var urlToSubmit = Granite.HTTP.externalize(servletPath + ".fp.draft.json?func=getSubmittedForms");
    var urlToDelete = Granite.HTTP.externalize(servletPath + ".fp.draft.json?func=deleteSubmissionInternal");

    var getSubmissions = function(){
        $.ajax({
            type: "GET",
            url: urlToSubmit,
            dataType: "json",
            cache: false,
            data:{
                cutPoints:reqCutPoints
            },
            success: function(response) {
                responseSubmittedGlobal = response.reverse();
                submittedGuideToShow = responseSubmittedGlobal;
                $("#submittedGuideTitle").text($("#submittedGuideTitle").data("submissiontitle")+"("+(responseSubmittedGlobal.length) + ")");
                checkForSubmittedView();
            },
            error:function(){
            }
        });
    };

    $("#moreSubmittedGuide").click(function() {
        showMoreSubmittedGuide(submittedGuideToShow,pageCount);
    });

    $("#moreSubmittedGuide").keypress(function(e) {
        var eventCode = e.keyCode || e.charCode || e.which;
        if (eventCode == 13 || eventCode == 32) {
            showMoreSubmittedGuide(submittedGuideToShow, pageCount);
        }
    });

    var showSubmittedForms = function(){
        var submittedGuideTextSearchBox = $("#submittedGuideTextSearchBox");
        submittedGuideTextSearchBox.val("");
        submittedGuideTextSearchBox.keyup();
        $("#submittedGuideLister").css("display","block");
    };

    $("#submittedGuideTextSearchBox").keyup(function(){
        pageCount = 1;
        if($("#submittedGuideTextSearchBox").val())
            $("#moreSubmittedGuide").hide();
        else
            $("#moreSubmittedGuide").show();
        submittedGuideToShow = responseSubmittedGlobal.filter(function(item){ return item.name.toLowerCase().search($("#submittedGuideTextSearchBox").val().trim().replace(/ +(?= )/g,'').toLowerCase()) >= 0;});
        showFirstSubmittedGuidePage(submittedGuideToShow);
    });

    var showMoreSubmittedGuide = function(response,pageNumber){
        var submittedGuidePanel = $(".__FP_submittedFormPanel");
        if(submittedGuidePanelMaxHeight == null){
            submittedGuidePanelMaxHeight = submittedGuidePanel.height()+parseInt(submittedGuidePanel.css("border-top-width"))+parseInt(submittedGuidePanel.css("border-bottom-width"));
            submittedGuidePanel.css("max-height",submittedGuidePanelMaxHeight);
        }
        var customTemplate = $.parseHTML($("#submissionsCustomTemplate").html());
        var totalSubmits = response.length, i = (pageNumber-1)*totalResult, j= 0, moreSubmissions = $("#moreSubmittedGuide");
        var totalRepeatable = $(customTemplate).find("[data-repeatable=true]").length;
        var customTemplateParent =  $(customTemplate).wrap("<div class='testDiv'></div>").parent();
        var totalRepeatable = $(customTemplateParent).find("[data-repeatable=true]").length;
        var templateToAppend = "";
        while(totalRepeatable--){
            var currentTemplateObj = $($(customTemplateParent).find("[data-repeatable=true]")[totalRepeatable]);
            $(currentTemplateObj).wrap("<div class='currentTemplateParent'></div>");
            var currentTemplateParent = $(currentTemplateObj).parent();
            var currentTemplate = currentTemplateParent.html();
            while(i<totalSubmits && j++ <totalResult ){
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
                var submitID = response[i].submitID;
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
        $($("#__FP_appendSubmits").find("[data-repeatable]").last().parent()).append(templateToAppend);
        if(totalSubmits < (pageNumber)*totalResult+1){
            moreSubmissions.hide();
        }
        else{
            moreSubmissions.show();
            pageCount++;
        }
    };

    var showFirstSubmittedGuidePage = function(response){
        $(".__FP_eachSubmittedGuideLink").remove();
        var moreSubmittedGuide = $("#moreSubmittedGuide");
        var customTemplate = $.parseHTML($("#submissionsCustomTemplate").html());
        var moreSubmittedGuide = $("#moreSubmittedGuide");
        $("#__FP_appendSubmits").empty();
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
                var submitID = response[i].submitID;
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
        $("#__FP_appendSubmits").append(($(customTemplateParent).clone()).html());
        if(response.length <= totalResult){
            moreSubmittedGuide.hide();
        }
        else{
            moreSubmittedGuide.show();
            pageCount++;
        }
    };

    openSubmittedGuide = function(e){
        var path = $(e).attr('path');
        var name = $(e).attr('title');
        var formTarget = (path)+".html";
        window.open(formTarget);
    };

    var checkForSubmittedView = function() {
        if(responseSubmittedGlobal.length == 0){
            $("#__FP_appendSubmits").empty();
            $("#submittedGuideTextSearchBox").hide();
            return;
        }
        showSubmittedForms();
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

    var deleteSubmission = function(e){
        var submitID = $(e).attr('submitID'),
            confirm = window.confirm(window.FD.FP.Util.getLocalizedValue("Are you sure, you want to delete?")),
            errorMessage = window.FD.FP.Util.getLocalizedValue("Error occurred while deletion");
        if(confirm == true){
            $.ajax({
                type:"POST",
                url: urlToDelete,
                dataType: 'json',
                async: true,
                cache: false,
                data: {
                    submitID:submitID
                },
                complete: function (xhr, status) {
                    if (status === 'error') {
                        alert(errorMessage);
                    } else {
                        getSubmissions();
                    }
                }
            });
        }
    };

    $(document).on( "click", ".__FP_deleteSubmission", function(){
        deleteSubmission(this);
    });

    $(document).on( "keypress", ".__FP_deleteSubmission", function(e){
        var eventCode = e.keyCode || e.charCode || e.which;
        if(eventCode == 13 || eventCode == 32){
            deleteSubmission(this);
        }
    });

    $(document).ready(getSubmissions());
})(document, jQuery);
