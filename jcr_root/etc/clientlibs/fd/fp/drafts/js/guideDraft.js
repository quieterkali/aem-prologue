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
    var draftPanelMaxHeight = null, pageCount = 1, responseDraftGlobal, draftsToShow, totalResult = $("#tabs").data("totalresults"),cutPoints = [];
    var draftsTemplateString = $("#draftsCustomTemplate").html().split('&quote;').join('\"');
    for(var i = 1; i< draftsTemplateString.replace(/[\r\t\n]/g, " ").split("\${").length;i++) {
        cutPoints.push((draftsTemplateString.replace(/[\r\t\n]/g, " ").split("\${")[i].split("}")[0]));
    }
    var reqCutPoints =  jQuery.unique(cutPoints.toString().split(",")).toString();
    var servletPath = $("#tabs").data("servletpath");
    var urlToGetDrafts = Granite.HTTP.externalize(servletPath+".fp.draft.json?func=getDrafts");
    var urlToDeleteDraft = Granite.HTTP.externalize(servletPath + ".fp.draft.json?func=deleteDraft");
    var getDrafts = function(){
        $.ajax({
            type: "GET",
            url: urlToGetDrafts,
            dataType: "json",
            cache: false,
            data:{
            	cutPoints:reqCutPoints
            },
            success: function(response) {
                responseDraftGlobal = response.reverse();
                draftsToShow = responseDraftGlobal;
                $("#draftsTitle").text($("#draftsTitle").data("draftstitle")+"("+(responseDraftGlobal.length) + ")");
                checkForView();
            },
            error:function(){
            }
        });
    }
    var deleteDraft = function(e){
        var path = $(e).attr('draftID'),
            confirm = window.confirm(window.FD.FP.Util.getLocalizedValue("Are you sure, you want to delete?")),
            errorMessage = window.FD.FP.Util.getLocalizedValue("Error occurred while deletion");
        if(confirm == true){
            $.ajax({
                type:"POST",
                url: urlToDeleteDraft,
                dataType: 'json',
                async: true,
                cache: false,
                data: {
                    path:path
                },
                complete: function (xhr, status) {
                    if (status === 'error') {
                        alert(errorMessage);
                    } else {
                        //send analytics abandon event before loading the drafts again
                        var formPath =  $(e).attr('formPath');
                        var formType = $(e).attr('formType');
                        var formsPathArray = [];
                        if(formType === "af" || formType === "mf"){
                           formsPathArray.push(formPath + "/jcr:content");
                        }
                        if(window.FD && window.FD.FMaddon && window.FD.FMaddon.AFAnalytics && window.FD.FMaddon.AFAnalytics.trackAbandon){
                            window.FD.FMaddon.AFAnalytics.trackAbandon(formsPathArray);
                        }
                        else {
                            window.addEventListener("FD.FMaddon.AFAnalytics:initComplete",function(){
                                window.FD.FMaddon.AFAnalytics.trackAbandon(formsPathArray);
                            });
                        }
                        getDrafts();
                    }
                }
            });
        }
    };

    $("#moreDraft").click(function() {
        showMoreDrafts(draftsToShow,pageCount);
    });

    $("#moreDraft").keypress(function(e) {
        var eventCode = e.keyCode || e.charCode || e.which;
        if (eventCode == 13 || eventCode == 32) {
            showMoreDrafts(draftsToShow, pageCount);
        }
    });

    var showDrafts = function(){
        var draftTextSearchBox = $("#draftTextSearchBox");
        draftTextSearchBox.val("");
        draftTextSearchBox.keyup();
        $("#draftLister").css("display","block");
    }

    $("#draftTextSearchBox").keyup(function(){
        pageCount = 1;
        if($("#draftTextSearchBox").val())
            $("#moreDraft").hide();
        else
            $("#moreDraft").show();
        draftsToShow = responseDraftGlobal.filter(function(item){ return item.name.toLowerCase().search($("#draftTextSearchBox").val().trim().replace(/ +(?= )/g,'').toLowerCase()) >= 0;});
        showFirstPage(draftsToShow);
    });

    var showMoreDrafts = function(response,pageNumber){
        var draftPanel = $(".__FP_draftPanel");
        if(draftPanelMaxHeight == null){
            draftPanelMaxHeight = draftPanel.height()+parseInt(draftPanel.css("border-top-width"))+parseInt(draftPanel.css("border-bottom-width"));
            draftPanel.css("max-height",draftPanelMaxHeight);
        }
        var customTemplate = $.parseHTML($("#draftsCustomTemplate").html());
        var totalDrafts = response.length, i = (pageNumber-1)*totalResult, j= 0, moreDraft = $("#moreDraft");
        var totalRepeatable = $(customTemplate).find("[data-repeatable=true]").length;
        var customTemplateParent =  $(customTemplate).wrap("<div class='testDiv'></div>").parent();
        var totalRepeatable = $(customTemplateParent).find("[data-repeatable=true]").length;
        var templateToAppend = "";
        while(totalRepeatable--){
            var currentTemplateObj = $($(customTemplateParent).find("[data-repeatable=true]")[totalRepeatable]);
            $(currentTemplateObj).wrap("<div class='currentTemplateParent'></div>");
            var currentTemplateParent = $(currentTemplateObj).parent();
            var currentTemplate = currentTemplateParent.html();
            while(i<totalDrafts && j++ <totalResult ){
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
                var draftID = response[i].draftID;
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
        $($("#__FP_appendDrafts").find("[data-repeatable]").last().parent()).append(templateToAppend);
        if(totalDrafts < (pageNumber)*totalResult+1){
            moreDraft.hide();
        }
        else{
            moreDraft.show();
            pageCount++;
        }
    }

    var showFirstPage = function(response){
        var customTemplate = $.parseHTML($("#draftsCustomTemplate").html());
        var moreDraft = $("#moreDraft");
        $("#__FP_appendDrafts").empty();
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
                var draftID = response[i].draftID;
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
        $("#__FP_appendDrafts").append(($(customTemplateParent).clone()).html());
        if(response.length <= totalResult){
            moreDraft.hide();
        }
        else{
            moreDraft.show();
            pageCount++;
        }
    }

    var openDraft = function(e){
        var path = $(e).attr('path');
        var name = $(e).attr('title');
        var formTarget = (path)+".html";
        window.open(formTarget);
    };

    var checkForView = function() {
        if(responseDraftGlobal.length == 0)
        {
            $("#__FP_appendDrafts").empty();
            $("#draftTextSearchBox").hide();
            return;
        }
        showDrafts();
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
    $(document).on( "click", ".__FP_deleteDraft", function(){deleteDraft(this);} );
    $(document).on( "keypress", ".__FP_deleteDraft", function(e){
        var eventCode = e.keyCode || e.charCode || e.which;
        if(eventCode == 13 || eventCode == 32){
            deleteDraft(this);
        }
    });

    $(document).ready(getDrafts());
})(document, jQuery);
