/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

(function(){
    if(window.Keyboard == undefined || window.Keyboard == null){
        window.Keyboard = {
            A : 65,B : 66,C : 67,D : 68,E : 69,F : 70,G : 71,H : 72,I : 73,J : 74,K : 75,L : 76,M : 77,N : 78,O : 79,P : 80,
            Q : 81,R : 82,S : 83,T : 84,U : 85,V : 86,W : 87,X : 88,Y : 89,Z : 90,a : 97,b : 98,c : 99,d : 100,e : 101,f : 102,
            g : 103,h : 104,i : 105,j : 106,k : 107,l : 108,m : 109,n : 110,o : 111,p : 112,q : 113,r : 114,s : 115,t : 116,u : 117,
            v : 118,w : 119,x : 120,y : 121,z : 122,Alt : 18,CTRL : 17,SPACE : 32,ENTER : 13,SHIFT : 16,BACKSPACE : 8,DELETE : 46,
            F1 : 112,F2 : 113,F3 : 114,F4 : 115,F5 : 116,F6 : 117,F7 : 118,F8 : 119,F9 : 120,F10 : 121,F11 : 122,F12 : 123,
            ZERO : 48,ONE : 49,TWO : 50,THREE : 51,FOUR : 52,FIVE : 53,SIX : 54,SEVEN : 55,EIGHT : 56,NINE : 57,
            PAGE_UP : 33, PAGE_DOWN : 34};
    }
})();

CQ.formsearch.PageController = CQ.Ext.extend(CQ.Ext.Panel, {
    toggleSearchValue: false,

    dummyLocalized: [CQ.I18n.getMessage("Search"),
                     CQ.I18n.getMessage("Close"),
                     CQ.I18n.getMessage("Full Text Search"),
                     CQ.I18n.getMessage("Description"),
                     CQ.I18n.getMessage("Title"),
                     CQ.I18n.getMessage("Author"),
                     CQ.I18n.getMessage("Start Date"),
                     CQ.I18n.getMessage("End Date"),
                     CQ.I18n.getMessage("Full Text Predicate"),
                     CQ.I18n.getMessage("Last Modified Date"),
                     CQ.I18n.getMessage("Tags"),
                     CQ.I18n.getMessage("Results"),
                     CQ.I18n.getMessage("Of"),
                     CQ.I18n.getMessage("Page"),
                     CQ.I18n.getMessage("Forms Portal"),
                     CQ.I18n.getMessage(" Years "),
                     CQ.I18n.getMessage(" Days "),
                     CQ.I18n.getMessage(" Hour "),
                     CQ.I18n.getMessage(" Minutes "),
                     CQ.I18n.getMessage(" Seconds "),
                     CQ.I18n.getMessage(" Minute "),
                     CQ.I18n.getMessage("Ago"),
                     CQ.I18n.getMessage("Draft Forms"),
                     CQ.I18n.getMessage("Pending Sign Forms"),
                     CQ.I18n.getMessage("Submitted Forms"),
                     CQ.I18n.getMessage("Just now"),
                     CQ.I18n.getMessage("Are you sure, you want to delete?"),
                     CQ.I18n.getMessage("Error occurred while deletion"),
                     CQ.I18n.getMessage("Are you sure, you want to cancel this Pending Sign Form"),
                     CQ.I18n.getMessage("Error occurred while cancelling the Pending Sign form"),
                     CQ.I18n.getMessage("Unable to cancel the Pending Sign form"),
                     CQ.I18n.getMessage("Show submitted form"),
                     CQ.I18n.getMessage("Show Pending Sign form"),
                     CQ.I18n.getMessage("Show saved form"),
                     CQ.I18n.getMessage("Get PDF"),
                     CQ.I18n.getMessage("At"),
                     CQ.I18n.getMessage("Delete"),
                     CQ.I18n.getMessage("Cancel"),
                     CQ.I18n.getMessage("Start a new form using this form data")],
    
    constructor: function(config) {
        this.renderFieldsTo = config.renderFieldsTo;
        CQ.formsearch.PageController.superclass.constructor.call(this, config);
    },

    initialize: function () {
        this.setDefaultStates();
        this.bindEvents();
    },

    setDefaultStates: function(){

    },

    toggleSearchPanel: function (value) {
        this.toggleSearchValue= value;
    },

    windowOnResizeEvent: function () {
        var containerHeight = $('.container_forms').height();
        if($('.equal_height')[0]){
            var paddingTop = $('.equal_height').css('padding-top').replace('px', '');
            $(".equal_height").height(containerHeight-paddingTop);
        }
    },
    bindEvents: function () {
        //bind resize window event
        var pageInstance = this;
        $(window).resize(function () {
            pageInstance.windowOnResizeEvent();
        });
        //bind buttons events
        this.bindButtonEvents();

        $(window).keyup(function(event){
            pageInstance.keyUpHandler(event);
        });

    },

    closeSearchPod: function(){
        var parentElement = $("#toggleSearchPanel").parent();
        $("#toggleSearchPanel").removeClass("icon-colapse-open").addClass("icon-colapse");
        $("#toggleSearchPanel").parent().removeClass("search-open __FP_search-open").addClass("search-collapse __FP_search-collapse");
        parentElement.find(".title-search").hide();
        parentElement.find(".open-form").hide();
        $("#formsViewContainer").removeClass("content-form-open").addClass("content-form");
        $("#formsViewContainer").find(".dotted-line-open").removeClass("dotted-line-open").addClass("dotted-line");
        $("#toggleSearchPanel").removeClass("__FP_close-image").addClass("__FP_filter-image").attr("title",window.FD.FP.Util.getLocalizedValue("Search"));
        $(".__FP_semiTransparentBackground").css("display","none");
        $(".search-collapse .__FP_horizontalRuler").css("display","none");
    },


    bindButtonEvents: function () {
        //toggle search panel
        var pageInstance = this;
        $("#toggleSearchPanel").click(function () {
            pageInstance.toggleSearchPanel($(this).hasClass("icon-colapse"));
            var parentElement = $(this).parent();
            if(pageInstance.toggleSearchValue){
                $(this).removeClass("icon-colapse").addClass("icon-colapse-open");
                parentElement.removeClass("search-collapse __FP_search-collapse").addClass("search-open __FP_search-open");
                parentElement.find(".title-search").show();
                parentElement.find(".open-form").show();
                $("#formsViewContainer").removeClass("content-form").addClass("content-form-open");
                $("#formsViewContainer").find(".dotted-line").removeClass("dotted-line").addClass("dotted-line-open");
                $("#toggleSearchPanel").removeClass("__FP_filter-image").addClass("__FP_close-image").attr("title",window.FD.FP.Util.getLocalizedValue("Close"));
                $(".__FP_semiTransparentBackground").css("display","block");
                $(".search-open .__FP_horizontalRuler").css("display","block");
                $("#toggleSearchPanel").focus();
                $(".__FP_search-open").css("margin-left",$(".__FP_querybuilder_form").width()-$(".__FP_search-open").width()-$(".__FP_close-image").width()+2);
            }
            else
            {
                pageInstance.closeSearchPod();
            }
        });
        $("#formSearchBtn").click(function () {
            if(pageInstance.toggleSearchValue){
                $(".__FP_textSearch input").val('');
                CQ.formsearch.Util.getQueryBuilder().submit();
                pageInstance.closeSearchPod();
            }
        });
        $(".__FP_textSearch").keypress(
            function (e) {
                var eventCode = e.which || e.charCode || e.keyCode;
                if(eventCode == Keyboard.ENTER)
                {
                    $('#searchPanel input').not('[type="submit"]').not('[type="checkbox"]').not('[isHidden="true"]').val('');
                    $('#searchPanel input:checkbox').removeAttr('checked');
                    CQ.formsearch.Util.getQueryBuilder().submit();
                    pageInstance.closeSearchPod();
                }
        });
       $("#toggleSearchPanel").parent().keydown(
            function(e){
                var eventCode = e.which || e.charCode || e.keyCode;
                if(eventCode == 27 && $("#toggleSearchPanel").parent().hasClass("__FP_search-open")){
                    $("#toggleSearchPanel").trigger('click');
                    return false;
            }
        });
	    $(".__FP_textSearch input").attr("placeholder",window.FD.FP.Util.getLocalizedValue("Full Text Search"));

       $(document).on("click",".__FP_grid_sort", function(){
            var qb = CQ.formsearch.Util.getQueryBuilder();
            var sortKey = $(this).attr("data-sortKey");
            var currentFormValues = qb.form.getFieldValues();
            var sortState = currentFormValues.sort;
            var newSortState;
            if(sortState == null || !sortState.trim() || sortState == "asc"){
                newSortState = "desc";
            }else{
                newSortState = "asc";
            }
            qb.setHidden("orderby",sortKey);
            qb.setHidden("sort",newSortState);
            qb.submit();
       });
    },
    keyUpHandler: function(event){
        if(event.ctrlKey){
            if(event.keyCode == Keyboard.S && event.altKey){
                $("#toggleSearchPanel").trigger('click');
            }
        }
    }
});
