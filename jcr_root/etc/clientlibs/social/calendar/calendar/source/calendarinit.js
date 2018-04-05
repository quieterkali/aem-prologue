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
/*
 * location: /etc/clientlibs/social/calendar/calendar/source
 * category: [cq.social.calendar]
 */
/* JS for the Calendar pages */
$CQ(function($) {
    /* 
        Accordions on Calendar detail page
    */

    $.fn.simpleAccordion = function() {

        this.each(function() {
            var accordion = $(this),
                content = accordion.find('.content');

            /* 
                Grab the text of the first paragraph, check the length, 
                and only display the first 150 characters; then append
                the "read more" CTA.
            */

            var readMore = $CQ("<span class='accordion-toggle read-more'>" + CQ.I18n.getMessage("read more") + "</span>").click(function() {
                    accordion.find('.accordion-toggle').toggleClass('expanded');

                    content.toggleClass('expanded');

                    /*
                        On each click, check to see whether the content
                        has the "expanded" class; and animate accordingly. 
                    */
                    if (content.hasClass('expanded')) {
                        content.find('.short').hide();
                        content.children().not('.short').slideDown();
                    } else {
                        content.children().not('.short').slideUp('fast', function() {
                            //Wait until the animation is done before showing the shortened text.
                            content.find('.short').show();
                        });
                    }
                }),
                shortenTarget = content.find("p:first-child"),
                fullText = shortenTarget.text();

            var accordionToggles = accordion.find('.accordion-toggle');
            var readMoreToggles = accordion.find('.accordion-toggle .read-more');

            var isLongText = (fullText.length > 150);

            var shortened = $("<p>").addClass("short");

            content.children().hide();

            if (isLongText) {
                shortened.text(fullText.substring(0, 150)).append(" ...");
                shortened.append(readMore);
            } else {
                // Do not shorten at all
                shortened.text(fullText);
            }

            shortenTarget.before(shortened);


            /*
                Find each "toggle" button and bind it to the 
                click event.  On click, add/remove the "expanded" class
                to the toggle button and the content via the jQuery 
                toggleClass method.
            */
            accordionToggles.each(function() {
                var accordionToggle = $(this);

                accordionToggle.click(function() {
                    accordion.find('.accordion-toggle').toggleClass('expanded');

                    content.toggleClass('expanded');

                    /*
                        On each click, check to see whether the content
                        has the "expanded" class; and animate accordingly. 
                    */
                    if (content.hasClass('expanded')) {
                        content.find('.short').hide();
                        content.children().not('.short').slideDown();
                    } else {
                        content.children().not('.short').slideUp('fast', function() {
                            //Wait until the animation is done before showing the shortened text.
                            content.find('.short').show();
                        });
                    }
                });
            });



        });
    };

    //$('.event-accordion-block').simpleAccordion();

});
