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
 * category: [cq.soco.calendar]
 */

(function(CQ, $CQ) {
    "use strict";
    CQ.soco = CQ.soco || {};
    CQ.soco.calendar = CQ.soco.calendar || {};
    CQ.soco.calendar.utils = CQ.soco.calendar.utils || {};
    CQ.soco.calendar.events = CQ.soco.calendar.events || {};
    var localEvents = {};
    localEvents.CLEAR = "lcl.cq.soco.events.clear";
    CQ.soco.calendar.events.NEWEVENTSFETCHED = "newEventFetch";
    CQ.soco.calendar.events.DAYCLICK = "dayClicked";
    CQ.soco.calendar.events.EVENTSDELETED = "eventsDeleted";
    CQ.soco.calendar.events.EVENTSMODIFIED = "eventsModified";
    // IE8 doesn't support .toISOString()
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    if (!Date.prototype.toISOString) {
        (function() {
            function pad(number) {
                var r = String(number);
                if (r.length === 1) {
                    r = '0' + r;
                }
                return r;
            }
            Date.prototype.toISOString = function() {
                return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) + 'Z';
            };
        }());
    }

    CQ.soco.calendar.utils.padZero = function(num) {
        return (num >= 0 && num < 10) ? "0" + num : num + "";
    };

    CQ.soco.calendar.utils.eventMap = function(obj) {
        var events = new Array();

        var eventIter = function(eveObject) {
            $CQ.each(eveObject, function(index, val) {
                if (typeof val === 'object') {
                    if (val && val['jcr:primaryType'] && val['jcr:primaryType'] == 'cq:CalendarEvent') {
                        var eventObject = new Object();
                        $CQ.each(val, function(key, value) {
                            if (key == "jcr:title") {
                                eventObject["title"] = value;
                            } else if (key == "isDate") {
                                eventObject["allDay"] = value;
                            } else {
                                eventObject[key] = value;
                            }
                        });
                        events.push(eventObject);
                    } else {
                        eventIter(val);
                    }
                }
            });
        };
        eventIter(obj);
        return events;
    };


    //Construct eventSource Array for the full calendar
    CQ.soco.calendar.utils.eventSources = function(url, selector) {
        var eventSource = new Array();
        var fn = CQ.soco.calendar.utils.getEventsFunction(url, selector);
        var obj = new Object();
        obj["events"] = fn;
        eventSource.push(obj);
        return eventSource;
    }

    CQ.soco.calendar.utils.deleteEvent = function(path, onlyThis, selector) {
        var url = path;
        var http = CQ.HTTP ? CQ.HTTP : CQ.shared.HTTP;
        url = url + ".social.deleteevent" + ".html";
        url = http.addParameter(url,
            CQ.Sling.STATUS, CQ.Sling.STATUS_BROWSER);
        if (onlyThis) {
            url = http.addParameter(url, ":deleteFromRecurrence", "");
        }

        var posting = $CQ.post(url);
        posting.done(function(data) {
            $CQ('#' + selector).parent().trigger(CQ.soco.calendar.events.EVENTSDELETED);
            $CQ('#' + selector).remove();
        });
    };


    CQ.soco.calendar.utils.getEventsFunction = function(url, selector) {
        return function(start, end, callback) {

            var postOptions = {
                "1_orderby": "@start",
                "2_orderby": "path",
                "1_orderby.sort": "desc",
                "_charset_": "utf-8",
                "event.from": start.toISOString().substring(0, 10),
                "event.to": end.toISOString().substring(0, 10),
                "group.p.or": "true",
                "p.acls": "true",
                "p.hits": "full",
                "p.limit": "0",
                "p.nodedepth": "1",
                "p.offset": "0",
                "type": "cq:CalendarEvent"
            };

            if (typeof url === 'string') {
                postOptions["group.1_path"] = url;
            } else {
                // If its not string, then it must be an array
                $CQ.each(url, function(key, value) {
                    var indexKey = "group." + (key + 1) + "_path";
                    postOptions[indexKey] = value;
                });
            }

            $CQ.post('/bin/querybuilder.json', postOptions,

                function(data) {
                    $CQ('.fc-widget-content').removeClass('pressed');
                    if (data && data.success && data.hits && data.hits.length >= 1) {
                        var events = [];
                        events = CQ.soco.calendar.utils.eventMap(data);
                        callback(events);
                        selector.trigger(CQ.soco.calendar.events.NEWEVENTSFETCHED, [data.hits]);
                        return;
                    } else {
                        callback();
                        $CQ('.fc-day').removeClass('highlight');
                    }
                    selector.trigger(CQ.soco.calendar.events.NEWEVENTSFETCHED, []);
                }, "json");
        }
    };

    CQ.soco.calendar.utils.invokeFullCalendar = function(divTarget, url) {
        var _cal = $CQ(divTarget).fullCalendar({
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },

            buttonText: {
                prev: '<img src="/etc/designs/geometrixx-outdoors/images/soco/mini-calendar-nav-left.png">',
                next: '<img src="/etc/designs/geometrixx-outdoors/images/soco/mini-calendar-nav-right.png">'
            },

            eventSources: CQ.soco.calendar.utils.eventSources(url, $CQ(divTarget)),

            dayNamesShort: [
                'Su',
                'Mo',
                'Tu',
                'We',
                'Th',
                'Fr',
                'Sa'
            ],

            dayClick: function(date, view) {
                //$CQ('.fc-widget-content').removeClass('pressed');
                if ($CQ(this).hasClass('pressed')) {
                    $CQ(this).removeClass('pressed');
                    //Sending the date and a bool value to indicate whether to filter events or not
                    $CQ(divTarget).trigger(CQ.soco.calendar.events.DAYCLICK, [date, false]);
                } else {
                    $CQ(this).addClass('pressed');
                    //Sending the date and a bool value to indicate whether to filter events or not
                    $CQ(divTarget).trigger(CQ.soco.calendar.events.DAYCLICK, [date, true]);
                }
            },

            eventRender: function(event, element) {
                //$CQ('.fc-day').removeClass('highlight');
                $CQ(element).empty();
                var date = event.start;
                var endDate = event.end;
                //Multi-day event highlight
                var diff = endDate ? moment(endDate).diff(moment(date), 'day', false) : 0;
                if ($CQ(".fc-day" + date.getDate()).length > 0) {
                    date = date.getDate();
                    for (var i = 0; i <= diff; i++) {
                        $CQ(".fc-day" + (date + i)).addClass('highlight');
                    }
                } else {
                    for (var i = 0; i <= diff; i++) {
                        var tempDate = new Date(date);
                        tempDate.setDate(tempDate.getDate() + i);
                        var tempDate = tempDate.getFullYear() + '-' + CQ.soco.calendar.utils.padZero(tempDate.getMonth() + 1) + "-" + CQ.soco.calendar.utils.padZero(tempDate.getDate());
                        $CQ(".fc-day[data-date = " + tempDate + "]").addClass('highlight');
                    }
                }
            }

        });
        return _cal;
    };

    CQ.soco.calendar.utils.addEventHTML = function(selector, path) {
        var response = CQ.shared.HTTP.get(path + ".html");
        selector.append(response.body);
    };

    CQ.soco.calendar.utils.createEventList = function(selector, events, empty) {
        if (empty) {
            $CQ(selector).empty();
        }
        if (events && events.length > 0) {
            $CQ.each(events, function(key, event) {
                CQ.soco.calendar.utils.addEventHTML(selector, event["jcr:path"]);
            });
        }
    };

    CQ.soco.calendar.utils.createFullEventList = function(selector, url) {
        var start = new Date(); //Some date in the past
        start = new Date(start.setFullYear(start.getFullYear() - 10));
        var end = new Date();
        var handlerFn = function(data) {
            if (data && data.hits) {
                CQ.soco.calendar.utils.createEventList($CQ(selector), data.hits, true);
            }
        }
        CQ.soco.calendar.utils.getEventDetails(start, end, url, handlerFn);
    }

    CQ.soco.calendar.utils.filterEventList = function(selector, data, filter) {
        var date = moment(data);
        if (filter) {
            $CQ.each($CQ(selector).children(), function(key, value) {
                var data_startDate = moment($CQ(value).attr("data-startdate"));
                var data_endDate = moment($CQ(value).attr("data-enddate"));
                var diff = ((date.diff(data_startDate, 'day', false) >= 0) && (date.diff(data_endDate, 'day', false) <= 0));
                if (!diff) {
                    $CQ(value).hide();
                } else {
                    $CQ(value).show();
                }
            });
        } else {
            $CQ.each($CQ(selector).children(), function(key, value) {
                $CQ(value).show();
            });
        }
    }

    CQ.soco.calendar.utils.getEventDetails = function(start, end, url, hanlder) {
        var postOptions = {
            "1_orderby": "@start",
            "2_orderby": "path",
            "_charset_": "utf-8",
            "1_orderby.sort": "desc",
            "event.from": start.toISOString().substring(0, 10),
            "event.to": end.toISOString().substring(0, 10),
            "group.p.or": "true",
            "p.acls": "true",
            "p.hits": "full",
            "p.limit": "0",
            "p.nodedepth": "1",
            "p.offset": "0",
            "type": "cq:CalendarEvent"
        };

        if (typeof url === 'string') {
            postOptions["group.1_path"] = url;
        } else {
            // If its not string, then it must be an array
            $CQ.each(url, function(key, value) {
                var indexKey = "group." + (key + 1) + "_path";
                postOptions[indexKey] = value;
            });
        }

        $CQ.post('/bin/querybuilder.json', postOptions,

            function(data) {
                if (data && data.success && data.hits && data.hits.length >= 1) {
                    if (hanlder && typeof hanlder === 'function') {
                        hanlder(data);
                    }
                    //$CQ(CQ.soco.calendar.utils).trigger(CQ.soco.calendar.events.NEWEVENTSFETCHED, [data.hits]);
                }
            }, "json");
    };
})(CQ, $CQ);
