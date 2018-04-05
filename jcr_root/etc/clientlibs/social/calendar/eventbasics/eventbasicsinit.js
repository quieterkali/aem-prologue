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
 * location: /etc/clientlibs/social/calendar/eventbasics/eventbasicsutils.js
 * category: [cq.social.calendar.eventbasics]
 */

$CQ(function() {
    CQ.soco.calendar.eventbasics.init();
});

CQ.soco.calendar.eventbasics.initDatePickerLocale = function() {
    if ($CQ.datepicker) {
        var defaultLocale = CQ.I18n.getLocale();
        var res = /[\?&]locale=([^&#]*)/.exec(window.location.href);
        var locale = res && res[1] ? window.decodeURIComponent(res[1]) : defaultLocale;
        if (moment.locale() !== locale) {
            moment.locale(locale);
        }
        locale = moment.locale();
        var l = $CQ.datepicker.regional[locale] || $CQ.datepicker.regional[""];
        l.dateFormat = CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat(
            moment.localeData().longDateFormat("L"));
        l.firstDay = moment.localeData().firstDayOfWeek();
        l.dayNames = moment.weekdays();
        l.dayNamesShort = moment.weekdaysShort();
        l.dayNamesMin = moment.weekdaysMin();
        l.monthNames = moment.months();
        l.monthNamesShort = moment.monthsShort();
        l.prevText = CQ.I18n.get("Prev");
        l.nextText = CQ.I18n.get("Next");
        $CQ.datepicker.regional[locale] = l;
        $CQ.datepicker.setDefaults(l);
        return l;
    }
    return {};
};

CQ.soco.calendar.eventbasics.init = function() {
    CQ.soco.calendar.eventbasics.initTimezone();
    $CQ("#scf-event-basics-start-input").datepicker({
        changeMonth: true,
        numberOfMonths: 2,
        onClose: function(selectedDate) {
            $CQ("#scf-event-basics-end > input").datepicker("option", "minDate", selectedDate);
        }
    });
    $CQ("#scf-event-basics-start-input").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());
    $CQ("#scf-event-basics-end-input").datepicker({
        changeMonth: true,
        numberOfMonths: 2,
        onClose: function(selectedDate) {
            $CQ("#scf-event-basics-start > input").datepicker("option", "maxDate", selectedDate);
        }
    });
    $CQ("#scf-event-basics-end-input").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());

    $CQ('#scf-event-basics-isdate').change(function() {
        CQ.soco.calendar.eventbasics.toggleIsDate();
    });
    CQ.soco.calendar.eventbasics.toggleIsDate();

    if (CQ.soco.calendar.eventbasics.startValue && CQ.soco.calendar.eventbasics.startValue instanceof Date) {
        $CQ("#scf-event-basics-start > input").datepicker("setDate", CQ.soco.calendar.eventbasics.startValue);
        $CQ("#scf-event-basics-start-time")
            .val(CQ.soco.calendar.eventbasics.getTimeFromDate(CQ.soco.calendar.eventbasics.startValue));
    }

    if (CQ.soco.calendar.eventbasics.endValue && CQ.soco.calendar.eventbasics.endValue instanceof Date) {
        $CQ("#scf-event-basics-end-input").datepicker("setDate", CQ.soco.calendar.eventbasics.endValue);
        $CQ("#scf-event-basics-end-time")
            .val(CQ.soco.calendar.eventbasics.getTimeFromDate(CQ.soco.calendar.eventbasics.endValue));
    }
    $CQ("#scf-event-basics-start-input").change(function(event) {
        //$CQ("input[name='./start']").val(parseDateString($CQ(event.currentTarget).val()));
        CQ.soco.calendar.eventbasics.setDateandTime("start", $CQ(this));
    });
    $CQ("#scf-event-basics-end-input").change(function(event) {
        CQ.soco.calendar.eventbasics.setDateandTime("end", $CQ(this));
    });

    var autocompleteResponseHandler = function(event, data) {
        if (data && data.content && data.content.length === 0) {
            event.stopPropagation();
            event.preventDefault();
            var self = this;
            setTimeout(function() {
                $CQ(self).autocomplete("search", "");
            }, 100);
        }
    };

    var fixAutocompleteStyles = function(selector) {
        if ($CQ(selector).length) {
            $CQ(selector).data("ui-autocomplete")._renderMenu = function(ul, items) {
                $CQ.ui.autocomplete.prototype._renderMenu(ul, items);
                $CQ(ul).addClass("scf-calendar-autocomplete-menu");
            }
        }
    };

    $CQ("#scf-event-basics-start-time").autocomplete({
        source: CQ.soco.calendar.eventbasics.getTimesForAutoComplete(30),
        minLength: 0,
        response: autocompleteResponseHandler
    }).bind('focus', function() {
        $CQ(this).autocomplete("search");
    });
    fixAutocompleteStyles("#scf-event-basics-start-time");
    $CQ("#scf-event-basics-end-time").autocomplete({
        source: CQ.soco.calendar.eventbasics.getTimesForAutoComplete(30),
        minLength: 0,
        response: autocompleteResponseHandler
    }).bind('focus', function() {
        $CQ(this).autocomplete("search");
    });
    fixAutocompleteStyles("#scf-event-basics-end-time");
    $CQ("#scf-event-basics-start-time").on('autocompletechange', function() {
        CQ.soco.calendar.eventbasics.setDateandTime("start", $CQ(this));
        if (CQ.soco.calendar.eventbasics.getStartTime() && CQ.soco.calendar.eventbasics.getEndTime()) {
            CQ.soco.calendar.eventbasics.adjustEndTime();
        }
    });
    $CQ("#scf-event-basics-end-time").on('autocompletechange', function() {
        CQ.soco.calendar.eventbasics.setDateandTime("end", $CQ(this));
        if (CQ.soco.calendar.eventbasics.getStartTime() && CQ.soco.calendar.eventbasics.getEndTime()) {
            CQ.soco.calendar.eventbasics.adjustEndTime();
        }
    });
};

CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat = function(momentFormat) {
    // Hint:
    //        D->d - day of month (no leading zero)
    //        DD->dd - day of month (two digit)
    //        DDD->o - day of the year (no leading zeros)
    //        DDDD->oo - day of the year (three digit)
    //        dd,ddd->D - day name short
    //        dddd->DD - day name long
    //        M->m - month of year (no leading zero)
    //        MM->mm - month of year (two digit)
    //        MMM->M - month name short
    //        MMMM->MM - month name long
    //        YY->y - year (two digit)
    //        YYYY->yy - year (four digit)
    var convArr = [
        ["DDDD", "oo"],
        ["DDD", "o"],
        ["DD", "dd"],
        ["D", "d"],
        ["dddd", "DD"],
        ["ddd", "D"],
        ["dd", "D"],
        ["MMMM", "MM"],
        ["MMM", "M"],
        ["MM", "mm"],
        ["M", "m"],
        ["YYYY", "yy"],
        ["YY", "y"]
    ];
    var datePickerFormat = String(momentFormat);
    for (var i = 0; i < convArr.length; i++) {
        if (datePickerFormat.indexOf(convArr[i][0]) !== -1) {
            datePickerFormat = datePickerFormat.replace(convArr[i][0], "{" + i + "}");
        }
    }
    for (var i = 0; i < convArr.length; i++) {
        datePickerFormat = datePickerFormat.replace("{" + i + "}", convArr[i][1]);
    }
    return datePickerFormat;
};

CQ.soco.calendar.eventbasics.initTimezone = function(domElement, model) {
    if (!CQ.soco.calendar.eventbasics.timeZones) {
        $CQ.ajax({
            url: SCF.config.urlRoot + "/.timezones.json",
            dataType: "json",
            success: function(data) {
                CQ.soco.calendar.eventbasics.timeZones = data;
                if (domElement && model) {
                    CQ.soco.calendar.hbs.eventbasics.init(domElement, model);
                }
            }
        });
        return false;
    }
    return true;
};

CQ.soco.calendar.hbs.eventbasics.init = function(domElement, model) {
    CQ.soco.calendar.eventbasics.initDatePickerLocale(model);
    if (!CQ.soco.calendar.eventbasics.initTimezone(domElement, model)) {
        return;
    }
    $el = $CQ(domElement);
    $el.find(".scf-js-event-basics-start-input").datepicker({
        dateFormat: model && model.get("localeDateFormat") ?
            CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat(model.get("localeDateFormat")) : undefined,
        changeMonth: true,
        numberOfMonths: 2,
        beforeShow: function(input, inst) {
            $CQ('#ui-datepicker-div').wrap("<div class='scf-datepicker'></div>");
        },
        onClose: function(selectedDate) {
            $el.find(".scf-js-event-basics-end-input").datepicker("option", "minDate", selectedDate);
        }
    });
    $el.find(".scf-js-event-basics-start-input").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());
    $el.find(".scf-js-event-basics-end-input").datepicker({
        dateFormat: model && model.get("localeDateFormat") ?
            CQ.soco.calendar.hbs.eventbasics.convertMomentToDatePickerFormat(model.get("localeDateFormat")) : undefined,
        changeMonth: true,
        numberOfMonths: 2,
        beforeShow: function(input, inst) {
            $CQ('#ui-datepicker-div').wrap("<div class='scf-datepicker'></div>");
        },
        onClose: function(selectedDate) {
            $el.find(".scf-js-event-basics-start-input").datepicker("option", "maxDate", selectedDate);
        }
    });
    $el.find(".scf-js-event-basics-end-input").datepicker(CQ.soco.calendar.eventbasics.initDatePickerLocale());

    $el.find('.scf-js-event-basics-isdate').change(function() {
        CQ.soco.calendar.eventbasics.toggleIsDate();
    });
    CQ.soco.calendar.eventbasics.toggleIsDate();

    if (CQ.soco.calendar.eventbasics.startValue && CQ.soco.calendar.eventbasics.startValue instanceof Date) {
        $el.find(".scf-js-event-basics-start-input").datepicker("setDate", CQ.soco.calendar.eventbasics.startValue);
        $el.find(".scf-js-event-basics-start-time")
            .val(CQ.soco.calendar.eventbasics.getTimeFromDate(CQ.soco.calendar.eventbasics.startValue));
    }

    if (CQ.soco.calendar.eventbasics.endValue && CQ.soco.calendar.eventbasics.endValue instanceof Date) {
        $el.find(".scf-js-event-basics-end-input").datepicker("setDate", CQ.soco.calendar.eventbasics.endValue);
        $el.find(".scf-js-event-basics-end-time")
            .val(CQ.soco.calendar.eventbasics.getTimeFromDate(CQ.soco.calendar.eventbasics.endValue));
    }
    $el.find(".scf-js-event-basics-start-input").change(function(event) {
        //$CQ("input[name='./start']").val(parseDateString($CQ(event.currentTarget).val()));
        CQ.soco.calendar.eventbasics.setDateandTime("start", $CQ(this));
    });
    $el.find(".scf-js-event-basics-end-input").change(function(event) {
        CQ.soco.calendar.eventbasics.setDateandTime("end", $CQ(this));
    });

    var autocompleteResponseHandler = function(event, data) {
        if (data && data.content && data.content.length === 0) {
            event.stopPropagation();
            event.preventDefault();
            var self = this;
            setTimeout(function() {
                $CQ(self).autocomplete("search", "");
            }, 100);
        }
    };

    var fixAutocompleteStyles = function(selector) {
        if ($el.find(selector).length) {
            $el.find(selector).data("ui-autocomplete")._renderMenu = function(ul, items) {
                $CQ.ui.autocomplete.prototype._renderMenu(ul, items);
                $CQ(ul).addClass("scf-calendar-autocomplete-menu");
            }
        }
    };

    $el.find(".scf-js-event-basics-start-time").autocomplete({
        source: CQ.soco.calendar.eventbasics.getTimesForAutoComplete(30),
        minLength: 0,
        response: autocompleteResponseHandler
    }).bind('focus', function() {
        $CQ(this).autocomplete("search");
    });
    fixAutocompleteStyles(".scf-js-event-basics-start-time");
    $el.find(".scf-js-event-basics-end-time").autocomplete({
        source: CQ.soco.calendar.eventbasics.getTimesForAutoComplete(30),
        minLength: 0,
        response: autocompleteResponseHandler
    }).bind('focus', function() {
        $CQ(this).autocomplete("search");
    });
    fixAutocompleteStyles(".scf-js-event-basics-end-time");

    $el.find(".scf-js-event-basics-start-time").on('autocompletechange', function() {
        CQ.soco.calendar.eventbasics.setDateandTime("start", $CQ(this));
        if (CQ.soco.calendar.eventbasics.getStartTime() && CQ.soco.calendar.eventbasics.getEndTime()) {
            CQ.soco.calendar.eventbasics.adjustEndTime();
        }
    });
    $el.find(".scf-js-event-basics-end-time").on('autocompletechange', function() {
        CQ.soco.calendar.eventbasics.setDateandTime("end", $CQ(this));
        if (CQ.soco.calendar.eventbasics.getStartTime() && CQ.soco.calendar.eventbasics.getEndTime()) {
            CQ.soco.calendar.eventbasics.adjustEndTime();
        }
    });

    $el.find("select.scf-event-timepicker").remove();
    $el.find("input[data-timepicker-type='select']").each(function(i, elem) {
        var timeZone;
        var onTimeZoneChange = function(e) {
            var timeInput = $CQ(e.target).attr("data-for");
            var isStart = timeInput == "scf-js-event-basics-start-time";
            var dateInput = isStart ? "scf-js-event-basics-start-input" : "scf-js-event-basics-end-input";
            var val = $el.find("." + timeInput + "-timezone").val();
            model.set("timezone", val);
        };
        $CQ(this).hide();
        var isStart = $CQ(this).hasClass("scf-js-event-basics-start-time");
        var dateInputClass = isStart ? "scf-js-event-basics-start-input" : "scf-js-event-basics-end-input";
        var timeInputClass = isStart ? "scf-js-event-basics-start-time" : "scf-js-event-basics-end-time";
        var datetime = new Date(Date.parse(CQ.soco.calendar.eventbasics.getDateTime(
            $el.find("." + dateInputClass).val(),
            $el.find("." + timeInputClass).val())));
        var hours = datetime.getHours() > 12 ? (datetime.getHours() - 12) : (datetime.getHours() == 0 ? 12 :
            datetime.getHours());
        var minutes = datetime.getMinutes();

        var onTimepickerChange = function(e) {
            var timeInput = $CQ(e.target).attr("data-for");
            var isStart = timeInput == "scf-js-event-basics-start-time";
            var dateInput = isStart ? "scf-js-event-basics-start-input" : "scf-js-event-basics-end-input";
            var val = $el.find("." + timeInput + "-hours").val() + ":" +
                $el.find("." + timeInput + "-minutes").val() + " " + $el.find("." + timeInput + "-ampm").val();
            $el.find("." + timeInput).val(val);
            CQ.soco.calendar.eventbasics.setDateandTime(isStart ? "start" : "end", $el.find("." + timeInput));
            if (CQ.soco.calendar.eventbasics.getStartTime() && CQ.soco.calendar.eventbasics.getEndTime()) {
                CQ.soco.calendar.eventbasics.adjustEndTime();
                var edt = new Date(Date.parse(CQ.soco.calendar.eventbasics.getDateTime(
                    $el.find(".scf-js-event-basics-end-input").val(),
                    $el.find(".scf-js-event-basics-end-time").val(),
                    $el.find(".scf-event-timepicker-timezone").val())));
                var h = edt.getHours() > 12 ? (edt.getHours() - 12) : (edt.getHours() == 0 ? 12 : edt.getHours());
                var m = edt.getMinutes();
                $el.find(".scf-js-event-basics-end-time-hours option").prop("selected", false).attr("selected", false);
                $el.find(".scf-js-event-basics-end-time-hours option[value='" + (h < 10 ? ("0" + h) : h) + "']")
                    .prop("selected", true).attr("selected", true);
                $el.find(".scf-js-event-basics-end-time-minutes option").prop("selected", false)
                    .attr("selected", false);
                $el.find(".scf-js-event-basics-end-time-minutes option[value='" + (m < 10 ? ("0" + m) : m) + "']")
                    .prop("selected", true).attr("selected", true);
                var am = String($el.find(".scf-js-event-basics-end-time").val()).toUpperCase().indexOf("AM") != -1;
                $el.find(".scf-js-event-basics-end-time-ampm option[value='AM']").prop("selected", am)
                    .attr("selected", am);
                $el.find(".scf-js-event-basics-end-time-ampm option[value='PM']").prop("selected", !am)
                    .attr("selected", !am);
            }
        };

        var hh = $CQ("<select></select>");
        hh.addClass(timeInputClass + "-hours form-control scf-event-timepicker");
        hh.attr("data-for", timeInputClass);
        for (var i = 1; i < 13; i++) {
            var opt = $CQ("<option></option>");
            var val = i < 10 ? ("0" + i) : i;
            opt.attr("value", val);
            opt.text(val);
            if (hours == i) {
                opt.prop("selected", true).attr("selected", true);
            }
            hh.append(opt);
        }
        hh.change(onTimepickerChange);
        var mm = $CQ("<select></select>");
        mm.addClass(timeInputClass + "-minutes form-control scf-event-timepicker");
        mm.attr("data-for", timeInputClass);
        for (var i = 0; i < 60; i++) {
            var opt = $CQ("<option></option>");
            var val = i < 10 ? ("0" + i) : i;
            opt.attr("value", val);
            opt.text(val);
            if (minutes == i) {
                opt.prop("selected", true).attr("selected", true);
            }
            mm.append(opt);
        }
        mm.change(onTimepickerChange);
        var ampm = $CQ("<select><option value='AM'>AM</option><option value='PM'>PM</option></select>");
        ampm.addClass(timeInputClass + "-ampm form-control scf-event-timepicker scf-event-timepicker-ampm");
        ampm.attr("data-for", timeInputClass);
        if (String($CQ(this).val()).toUpperCase().indexOf("AM") != -1) {
            ampm.find("option[value='AM']").prop("selected", true).attr("selected", true);
        } else {
            ampm.find("option[value='PM']").prop("selected", true).attr("selected", true);
        }
        ampm.change(onTimepickerChange);

        if ($CQ(this).attr("data-timepicker-timezone") === "true") {
            timeZone = $CQ("<select></select>");
            timeZone.addClass(timeInputClass +
                "-timezone form-control scf-event-timepicker scf-event-timepicker-timezone");
            timeZone.attr("data-for", timeInputClass);
            timeZone.attr("data-attrib", "timezone");
            timeZone.attr("name", "timezone");
            for (i = 0; i < CQ.soco.calendar.eventbasics.timeZones.length; i++) {
                opt = $CQ("<option></option>");
                val = String(CQ.soco.calendar.eventbasics.timeZones[i].value);
                opt.attr("value", val);
                opt.text(val);
                if (val === String(model.get("timezone"))) {
                    opt.prop("selected", true).attr("selected", true);
                }
                timeZone.append(opt);
            }
            timeZone.change(onTimeZoneChange);
        }

        $CQ(this).after(hh);
        hh.after(mm);
        mm.after(ampm);
        if (timeZone) {
            ampm.after(timeZone);
        }
    });

};
