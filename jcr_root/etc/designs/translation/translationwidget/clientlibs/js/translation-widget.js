var translationwidget = {};
translationwidget.translationClickHandler = function(anchor_object, event) {
    "use strict";
    if (anchor_object) {
        var originalHref = anchor_object.getAttribute('data-originalhref');
        window.document.location = originalHref;
        event.preventDefault();
        return false;
    }
    return true;
};

translationwidget.translationSelectChangeHandler = function(select_object, event) {
    "use strict";
    event.preventDefault();
    select_object = $.find('.translationwidget_select')[0];
    if (select_object && select_object.selectedOptions && select_object.selectedOptions.length==1) {
        var selectedLanguage = select_object.selectedOptions[0];
        var originalHref = selectedLanguage.getAttribute('data-originalhref');
        var selected_langCode = selectedLanguage.getAttribute('value');
        originalHref = originalHref.replace('language_dummy','language_'+selected_langCode);
        window.document.location = originalHref;
        return false;
    }
    else{
        var translate_btn = $('.translationwidget_translate_button')[0];
        var originalHref = translate_btn.getAttribute('data-originalhref');
        window.document.location = originalHref;
        return false;
    }
    return true;
};

$(document).ready(function() {
    try{
        $('.translationwidget_translation_done_button').click(function(event){
           return translationwidget.translationClickHandler(this, event);
        });
    }catch(e){};

    try{
        $('.translationwidget_translate_button').click(function(event){
           return translationwidget.translationSelectChangeHandler(this, event);
        });
    }catch(e){};

});