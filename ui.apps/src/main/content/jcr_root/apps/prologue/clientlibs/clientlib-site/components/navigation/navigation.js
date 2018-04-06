(function (site, $) {
    'use strict';
    var prologueheader = $(site + " .prologue-header"),
        scroll;
    
    if($(window).scrollTop() > 30) {
        prologueheader.addClass("navbar-sticky");
    }
    
    $(window).scroll(function(){
         
         scroll = $(window).scrollTop();
    if(scroll > 30) {
        prologueheader.addClass("navbar-sticky");
    } else {
        prologueheader.removeClass("navbar-sticky");
    }
});
}('.root',jQuery));