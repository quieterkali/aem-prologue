(function (_, xfalib) {
    var AppearanceFilter = xfalib.script.dom.AppearanceFilter = xfalib.script.GenericText.extend({
        msClassName:"appearanceFilter"
    });

    AppearanceFilter.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Assist = xfalib.script.dom.Assist = xfalib.script.DOMElement.extend({
        msClassName:"assist"
    });

    Assist.defineProps({
        role:{
            get:function () {
                return this.getAttribute("role");
            },
            set:function (value) {
                this.setAttribute(value, "role");
            }
        },
        speak:{
            get:function () {
                return this.getElement("speak", 0);
            },
            set:function (value) {
                this.setElement(value, "speak");
            }
        },
        toolTip:{
            get:function () {
                return this.getElement("toolTip", 0);
            },
            set:function (value) {
                this.setElement(value, "toolTip");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Barcode = xfalib.script.dom.Barcode = xfalib.script.DOMElement.extend({
        msClassName:"barcode"
    });

    Barcode.defineProps({
        charEncoding:{
            get:function () {
                return this.getAttribute("charEncoding");
            },
            set:function (value) {
                this.setAttribute(value, "charEncoding");
            }
        },
        checksum:{
            get:function () {
                return this.getAttribute("checksum");
            },
            set:function (value) {
                this.setAttribute(value, "checksum");
            }
        },
        dataColumnCount:{
            get:function () {
                return this.getAttribute("dataColumnCount");
            },
            set:function (value) {
                this.setAttribute(value, "dataColumnCount");
            }
        },
        dataLength:{
            get:function () {
                return this.getAttribute("dataLength");
            },
            set:function (value) {
                this.setAttribute(value, "dataLength");
            }
        },
        dataPrep:{
            get:function () {
                return this.getAttribute("dataPrep");
            },
            set:function (value) {
                this.setAttribute(value, "dataPrep");
            }
        },
        dataRowCount:{
            get:function () {
                return this.getAttribute("dataRowCount");
            },
            set:function (value) {
                this.setAttribute(value, "dataRowCount");
            }
        },
        endChar:{
            get:function () {
                return this.getAttribute("endChar");
            },
            set:function (value) {
                this.setAttribute(value, "endChar");
            }
        },
        errorCorrectionLevel:{
            get:function () {
                return this.getAttribute("errorCorrectionLevel");
            },
            set:function (value) {
                this.setAttribute(value, "errorCorrectionLevel");
            }
        },
        moduleHeight:{
            get:function () {
                return this.getAttribute("moduleHeight");
            },
            set:function (value) {
                this.setAttribute(value, "moduleHeight");
            }
        },
        moduleWidth:{
            get:function () {
                return this.getAttribute("moduleWidth");
            },
            set:function (value) {
                this.setAttribute(value, "moduleWidth");
            }
        },
        printCheckDigit:{
            get:function () {
                return this.getAttribute("printCheckDigit");
            },
            set:function (value) {
                this.setAttribute(value, "printCheckDigit");
            }
        },
        rowColumnRatio:{
            get:function () {
                return this.getAttribute("rowColumnRatio");
            },
            set:function (value) {
                this.setAttribute(value, "rowColumnRatio");
            }
        },
        startChar:{
            get:function () {
                return this.getAttribute("startChar");
            },
            set:function (value) {
                this.setAttribute(value, "startChar");
            }
        },
        textLocation:{
            get:function () {
                return this.getAttribute("textLocation");
            },
            set:function (value) {
                this.setAttribute(value, "textLocation");
            }
        },
        truncate:{
            get:function () {
                return this.getAttribute("truncate");
            },
            set:function (value) {
                this.setAttribute(value, "truncate");
            }
        },
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        },
        upsMode:{
            get:function () {
                return this.getAttribute("upsMode");
            },
            set:function (value) {
                this.setAttribute(value, "upsMode");
            }
        },
        wideNarrowRatio:{
            get:function () {
                return this.getAttribute("wideNarrowRatio");
            },
            set:function (value) {
                this.setAttribute(value, "wideNarrowRatio");
            }
        },
        encrypt:{
            get:function () {
                return this.getElement("encrypt", 0);
            },
            set:function (value) {
                this.setElement(value, "encrypt");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Bind = xfalib.script.dom.Bind = xfalib.script.DOMElement.extend({
        msClassName:"bind"
    });

    Bind.defineProps({
        match:{
            get:function () {
                return this.getAttribute("match");
            },
            set:function (value) {
                this.setAttribute(value, "match");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        picture:{
            get:function () {
                return this.getElement("picture", 0);
            },
            set:function (value) {
                this.setElement(value, "picture");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var BindItems = xfalib.script.dom.BindItems = xfalib.script.GenericText.extend({
        msClassName:"bindItems"
    });

    BindItems.defineProps({
        connection:{
            get:function () {
                return this.getAttribute("connection");
            },
            set:function (value) {
                this.setAttribute(value, "connection");
            }
        },
        labelRef:{
            get:function () {
                return this.getAttribute("labelRef");
            },
            set:function (value) {
                this.setAttribute(value, "labelRef");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        valueRef:{
            get:function () {
                return this.getAttribute("valueRef");
            },
            set:function (value) {
                this.setAttribute(value, "valueRef");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Bookend = xfalib.script.dom.Bookend = xfalib.script.GenericText.extend({
        msClassName:"bookend"
    });

    Bookend.defineProps({
        leader:{
            get:function () {
                return this.getAttribute("leader");
            },
            set:function (value) {
                this.setAttribute(value, "leader");
            }
        },
        trailer:{
            get:function () {
                return this.getAttribute("trailer");
            },
            set:function (value) {
                this.setAttribute(value, "trailer");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Border = xfalib.script.dom.Border = xfalib.script.DOMElement.extend({
        msClassName:"border"

    });

    Border.defineProps({
        "break":{
            get:function () {
                return this.getAttribute("break");
            },
            set:function (value) {
                this.setAttribute(value, "break");
            }
        },
        hand:{
            get:function () {
                return this.getAttribute("hand");
            },
            set:function (value) {
                this.setAttribute(value, "hand");
            }
        },
        presence:{
            get:function () {
                return this.getAttribute("presence");
            },
            set:function (value) {
                this.setAttribute(value, "presence");
            }
        },
        relevant:{
            get:function () {
                return this.getAttribute("relevant");
            },
            set:function (value) {
                this.setAttribute(value, "relevant");
            }
        },
        corner:{
            get:function () {
                return this.getElement("corner", 0);
            },
            set:function (value) {
                this.setElement(value, "corner");
            }
        },
        edge:{
            get:function () {
                return this.getElement("edge", 0);
            },
            set:function (value) {
                this.setElement(value, "edge");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        fill:{
            get:function () {
                return this.getElement("fill", 0);
            },
            set:function (value) {
                this.setElement(value, "fill");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Break = xfalib.script.dom.Break = xfalib.script.DOMElement.extend({
        msClassName:"break"
    });

    Break.defineProps({
        after:{
            get:function () {
                return this.getAttribute("after");
            },
            set:function (value) {
                this.setAttribute(value, "after");
            }
        },
        afterTarget:{
            get:function () {
                return this.getAttribute("afterTarget");
            },
            set:function (value) {
                this.setAttribute(value, "afterTarget");
            }
        },
        before:{
            get:function () {
                return this.getAttribute("before");
            },
            set:function (value) {
                this.setAttribute(value, "before");
            }
        },
        beforeTarget:{
            get:function () {
                return this.getAttribute("beforeTarget");
            },
            set:function (value) {
                this.setAttribute(value, "beforeTarget");
            }
        },
        bookendLeader:{
            get:function () {
                return this.getAttribute("bookendLeader");
            },
            set:function (value) {
                this.setAttribute(value, "bookendLeader");
            }
        },
        bookendTrailer:{
            get:function () {
                return this.getAttribute("bookendTrailer");
            },
            set:function (value) {
                this.setAttribute(value, "bookendTrailer");
            }
        },
        overflowLeader:{
            get:function () {
                return this.getAttribute("overflowLeader");
            },
            set:function (value) {
                this.setAttribute(value, "overflowLeader");
            }
        },
        overflowTarget:{
            get:function () {
                return this.getAttribute("overflowTarget");
            },
            set:function (value) {
                this.setAttribute(value, "overflowTarget");
            }
        },
        overflowTrailer:{
            get:function () {
                return this.getAttribute("overflowTrailer");
            },
            set:function (value) {
                this.setAttribute(value, "overflowTrailer");
            }
        },
        startNew:{
            get:function () {
                return this.getAttribute("startNew");
            },
            set:function (value) {
                this.setAttribute(value, "startNew");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var BreakAfter = xfalib.script.dom.BreakAfter = xfalib.script.DOMElement.extend({
        msClassName:"breakAfter"
    });

    BreakAfter.defineProps({
        leader:{
            get:function () {
                return this.getAttribute("leader");
            },
            set:function (value) {
                this.setAttribute(value, "leader");
            }
        },
        startNew:{
            get:function () {
                return this.getAttribute("startNew");
            },
            set:function (value) {
                this.setAttribute(value, "startNew");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        targetType:{
            get:function () {
                return this.getAttribute("targetType");
            },
            set:function (value) {
                this.setAttribute(value, "targetType");
            }
        },
        trailer:{
            get:function () {
                return this.getAttribute("trailer");
            },
            set:function (value) {
                this.setAttribute(value, "trailer");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var BreakBefore = xfalib.script.dom.BreakBefore = xfalib.script.DOMElement.extend({
        msClassName:"breakBefore"
    });

    BreakBefore.defineProps({
        leader:{
            get:function () {
                return this.getAttribute("leader");
            },
            set:function (value) {
                this.setAttribute(value, "leader");
            }
        },
        startNew:{
            get:function () {
                return this.getAttribute("startNew");
            },
            set:function (value) {
                this.setAttribute(value, "startNew");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        targetType:{
            get:function () {
                return this.getAttribute("targetType");
            },
            set:function (value) {
                this.setAttribute(value, "targetType");
            }
        },
        trailer:{
            get:function () {
                return this.getAttribute("trailer");
            },
            set:function (value) {
                this.setAttribute(value, "trailer");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Button = xfalib.script.dom.Button = xfalib.script.DOMElement.extend({
        msClassName:"button"
    });

    Button.defineProps({
        highlight:{
            get:function () {
                return this.getAttribute("highlight");
            },
            set:function (value) {
                this.setAttribute(value, "highlight");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Calculate = xfalib.script.dom.Calculate = xfalib.script.DOMElement.extend({
        msClassName:"calculate"
    });

    Calculate.defineProps({
        override:{
            get:function () {
                return this.getAttribute("override");
            },
            set:function (value) {
                this.setAttribute(value, "override");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        message:{
            get:function () {
                return this.getElement("message", 0);
            },
            set:function (value) {
                this.setElement(value, "message");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Caption = xfalib.script.dom.Caption = xfalib.script.DOMElement.extend({
        msClassName:"caption"
    });

    Caption.defineProps({
        placement:{
            get:function () {
                return this.getAttribute("placement");
            },
            set:function (value) {
                this.setAttribute(value, "placement");
            }
        },
        presence:{
            get:function () {
                return this.getAttribute("presence");
            },
            set:function (value) {
                this.setAttribute(value, "presence");
            }
        },
        reserve:{
            get:function () {
                return this.getAttribute("reserve");
            },
            set:function (value) {
                this.setAttribute(value, "reserve");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        font:{
            get:function () {
                return this.getElement("font", 0);
            },
            set:function (value) {
                this.setElement(value, "font");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        },
        para:{
            get:function () {
                return this.getElement("para", 0);
            },
            set:function (value) {
                this.setElement(value, "para");
            }
        },
        value:{
            get:function () {
                return this.getElement("value", 0);
            },
            set:function (value) {
                this.setElement(value, "value");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Certificate = xfalib.script.dom.Certificate = xfalib.script.GenericText.extend({
        msClassName:"certificate"
    });

    Certificate.defineProps({
    });

})(_, xfalib);
(function (_, xfalib) {
    var Certificates = xfalib.script.dom.Certificates = xfalib.script.DOMElement.extend({
        msClassName:"certificates"
    });

    Certificates.defineProps({
        credentialServerPolicy:{
            get:function () {
                return this.getAttribute("credentialServerPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "credentialServerPolicy");
            }
        },
        url:{
            get:function () {
                return this.getAttribute("url");
            },
            set:function (value) {
                this.setAttribute(value, "url");
            }
        },
        urlPolicy:{
            get:function () {
                return this.getAttribute("urlPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "urlPolicy");
            }
        },
        encryption:{
            get:function () {
                return this.getElement("encryption", 0);
            },
            set:function (value) {
                this.setElement(value, "encryption");
            }
        },
        issuers:{
            get:function () {
                return this.getElement("issuers", 0);
            },
            set:function (value) {
                this.setElement(value, "issuers");
            }
        },
        keyUsage:{
            get:function () {
                return this.getElement("keyUsage", 0);
            },
            set:function (value) {
                this.setElement(value, "keyUsage");
            }
        },
        oids:{
            get:function () {
                return this.getElement("oids", 0);
            },
            set:function (value) {
                this.setElement(value, "oids");
            }
        },
        signing:{
            get:function () {
                return this.getElement("signing", 0);
            },
            set:function (value) {
                this.setElement(value, "signing");
            }
        },
        subjectDNs:{
            get:function () {
                return this.getElement("subjectDNs", 0);
            },
            set:function (value) {
                this.setElement(value, "subjectDNs");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var CheckButton = xfalib.script.dom.CheckButton = xfalib.script.DOMElement.extend({
        msClassName:"checkButton"
    });

    CheckButton.defineProps({
        allowNeutral:{
            get:function () {
                return this.getAttribute("allowNeutral");
            },
            set:function (value) {
                this.setAttribute(value, "allowNeutral");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,this,"allowNeutral",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        mark:{
            get:function () {
                return this.getAttribute("mark");
            },
            set:function (value) {
                this.setAttribute(value, "mark");
            }
        },
        shape:{
            get:function () {
                return this.getAttribute("shape");
            },
            set:function (value) {
                this.setAttribute(value, "shape");
            }
        },
        size:{
            get:function () {
                return this.getAttribute("size");
            },
            set:function (value) {
                this.setAttribute(value, "size");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var ChoiceList = xfalib.script.dom.ChoiceList = xfalib.script.DOMElement.extend({
        msClassName:"choiceList"
    });

    ChoiceList.defineProps({
        commitOn:{
            get:function () {
                return this.getAttribute("commitOn");
            },
            set:function (value) {
                this.setAttribute(value, "commitOn");
            }
        },
        open:{
            get:function () {
                return this.getAttribute("open");
            },
            set:function (value) {
                this.setAttribute(value, "open");
            }
        },
        textEntry:{
            get:function () {
                return this.getAttribute("textEntry");
            },
            set:function (value) {
                this.setAttribute(value, "textEntry");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Color = xfalib.script.dom.Color = xfalib.script.DOMElement.extend({
        msClassName:"color"
    });

    Color.defineProps({
        cSpace:{
            get:function () {
                return this.getAttribute("cSpace");
            },
            set:function (value) {
                this.setAttribute(value, "cSpace");
            }
        },
        value:{
            get:function () {
                return this.getAttribute("value");
            },
            set:function (value) {
                this.setAttribute(value, "value");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"color.value",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Comb = xfalib.script.dom.Comb = xfalib.script.GenericText.extend({
        msClassName:"comb"
    });

    Comb.defineProps({
        numberOfCells:{
            get:function () {
                return this.getAttribute("numberOfCells");
            },
            set:function (value) {
                this.setAttribute(value, "numberOfCells");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Connect = xfalib.script.dom.Connect = xfalib.script.DOMElement.extend({
        msClassName:"connect"
    });

    Connect.defineProps({
        connection:{
            get:function () {
                return this.getAttribute("connection");
            },
            set:function (value) {
                this.setAttribute(value, "connection");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        usage:{
            get:function () {
                return this.getAttribute("usage");
            },
            set:function (value) {
                this.setAttribute(value, "usage");
            }
        },
        picture:{
            get:function () {
                return this.getElement("picture", 0);
            },
            set:function (value) {
                this.setElement(value, "picture");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Corner = xfalib.script.dom.Corner = xfalib.script.DOMElement.extend({
        msClassName:"corner"
    });

    Corner.defineProps({
        inverted:{
            get:function () {
                return this.getAttribute("inverted");
            },
            set:function (value) {
                this.setAttribute(value, "inverted");
            }
        },
        join:{
            get:function () {
                return this.getAttribute("join");
            },
            set:function (value) {
                this.setAttribute(value, "join");
            }
        },
        presence:{
            get:function () {
                return this.getAttribute("presence");
            },
            set:function (value) {
                this.setAttribute(value, "presence");
            }
        },
        radius:{
            get:function () {
                return this.getAttribute("radius");
            },
            set:function (value) {
                this.setAttribute(value, "radius");
            }
        },
        stroke:{
            get:function () {
                return this.getAttribute("stroke");
            },
            set:function (value) {
                this.setAttribute(value, "stroke");
            }
        },
        thickness:{
            get:function () {
                return this.getAttribute("thickness");
            },
            set:function (value) {
                this.setAttribute(value, "thickness");
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var DateTimeEdit = xfalib.script.dom.DateTimeEdit = xfalib.script.DOMElement.extend({
        msClassName:"dateTimeEdit"
    });

    DateTimeEdit.defineProps({
        hScrollPolicy:{
            get:function () {
                return this.getAttribute("hScrollPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "hScrollPolicy");
            }
        },
        picker:{
            get:function () {
                return this.getAttribute("picker");
            },
            set:function (value) {
                this.setAttribute(value, "picker");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        comb:{
            get:function () {
                return this.getElement("comb", 0);
            },
            set:function (value) {
                this.setElement(value, "comb");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var DefaultUi = xfalib.script.dom.DefaultUi = xfalib.script.DOMElement.extend({
        msClassName:"defaultUi"
    });

    DefaultUi.defineProps({
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function(_,xfalib){
    var Desc = xfalib.script.dom.Desc = xfalib.script.DOMElement.extend({
        msClassName: "desc"
    });

})(_,xfalib);
(function (_, xfalib) {
    var DigestMethod = xfalib.script.dom.DigestMethod = xfalib.script.GenericText.extend({
        msClassName:"digestMethod"
    });

    DigestMethod.defineProps({
    });

})(_, xfalib);
(function (_, xfalib) {
    var DigestMethods = xfalib.script.dom.DigestMethods = xfalib.script.DOMElement.extend({
        msClassName:"digestMethods"
    });

    DigestMethods.defineProps({
        "type":{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Edge = xfalib.script.dom.Edge = xfalib.script.DOMElement.extend({
        msClassName:"edge"
    });

    Edge.defineProps({
        cap:{
            get:function () {
                return this.getAttribute("cap");
            },
            set:function (value) {
                this.setAttribute(value, "cap");
            }
        },
        presence:{
            get:function () {
                return this.getAttribute("presence");
            },
            set:function (value) {
                this.setAttribute(value, "presence");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"edge.presence",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        stroke:{
            get:function () {
                return this.getAttribute("stroke");
            },
            set:function (value) {
                this.setAttribute(value, "stroke");
            }
        },
        thickness:{
            get:function () {
                return this.getAttribute("thickness");
            },
            set:function (value) {
                this.setAttribute(value, "thickness");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"edge.thickness",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Encoding = xfalib.script.dom.Encoding = xfalib.script.GenericText.extend({
        msClassName:"encoding"
    });

    Encoding.defineProps({
    });

})(_, xfalib);
(function (_, xfalib) {
    var Encodings = xfalib.script.dom.Encodings = xfalib.script.DOMElement.extend({
        msClassName:"encodings"
    });

    Encodings.defineProps({
        "type":{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Encrypt = xfalib.script.dom.Encrypt = xfalib.script.DOMElement.extend({
        msClassName:"encrypt"
    });

    Encrypt.defineProps({
        certificate:{
            get:function () {
                return this.getElement("certificate", 0);
            },
            set:function (value) {
                this.setElement(value, "certificate");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var EncryptData = xfalib.script.dom.EncryptData = xfalib.script.DOMElement.extend({
        msClassName:"encryptData"
    });

    EncryptData.defineProps({
        operation:{
            get:function () {
                return this.getAttribute("operation");
            },
            set:function (value) {
                this.setAttribute(value, "operation");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        filter:{
            get:function () {
                return this.getElement("filter", 0);
            },
            set:function (value) {
                this.setElement(value, "filter");
            }
        },
        manifest:{
            get:function () {
                return this.getElement("manifest", 0);
            },
            set:function (value) {
                this.setElement(value, "manifest");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Encryption = xfalib.script.dom.Encryption = xfalib.script.DOMElement.extend({
        msClassName:"encryption"
    });

    Encryption.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var EncryptionMethod = xfalib.script.dom.EncryptionMethod = xfalib.script.GenericText.extend({
        msClassName:"encryptionMethod"
    });

})(_, xfalib);
(function (_, xfalib) {
    var EncryptionMethods = xfalib.script.dom.EncryptionMethods = xfalib.script.DOMElement.extend({
        msClassName:"encryptionMethods"
    });

    EncryptionMethods.defineProps({
        "type":{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Event = xfalib.script.dom.Event = xfalib.script.DOMElement.extend({
        msClassName:"event"
    });

    Event.defineProps({
        activity:{
            get:function () {
                return this.getAttribute("activity");
            },
            set:function (value) {
                this.setAttribute(value, "activity");
            }
        },
        listen:{
            get:function () {
                return this.getAttribute("listen");
            },
            set:function (value) {
                this.setAttribute(value, "listen");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        encryptData:{
            get:function () {
                return this.getElement("encryptData", 0);
            },
            set:function (value) {
                this.setElement(value, "encryptData");
            }
        },
        execute:{
            get:function () {
                return this.getElement("execute", 0);
            },
            set:function (value) {
                this.setElement(value, "execute");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        },
        signData:{
            get:function () {
                return this.getElement("signData", 0);
            },
            set:function (value) {
                this.setElement(value, "signData");
            }
        },
        submit:{
            get:function () {
                return this.getElement("submit", 0);
            },
            set:function (value) {
                this.setElement(value, "submit");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Execute = xfalib.script.dom.Execute = xfalib.script.GenericText.extend({
        msClassName:"execute"
    });

    Execute.defineProps({
        connection:{
            get:function () {
                return this.getAttribute("connection");
            },
            set:function (value) {
                this.setAttribute(value, "connection");
            }
        },
        executeType:{
            get:function () {
                return this.getAttribute("executeType");
            },
            set:function (value) {
                this.setAttribute(value, "executeType");
            }
        },
        runAt:{
            get:function () {
                return this.getAttribute("runAt");
            },
            set:function (value) {
                this.setAttribute(value, "runAt");
            }
        }
    });

})(_, xfalib);
(function(_,xfalib){
    var Extras = xfalib.script.dom.Extras = xfalib.script.DOMElement.extend({
        msClassName: "extras"
    });

})(_,xfalib);
(function (_, xfalib) {
    var Fill = xfalib.script.dom.Fill = xfalib.script.DOMElement.extend({
        msClassName:"fill"
    });

    Fill.defineProps({
        presence:{
            get:function () {
                return this.getAttribute("presence");
            },
            set:function (value) {
                this.setAttribute(value, "presence");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"fill.presence",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        linear:{
            get:function () {
                return this.getElement("linear", 0);
            },
            set:function (value) {
                this.setElement(value, "linear");
            }
        },
        pattern:{
            get:function () {
                return this.getElement("pattern", 0);
            },
            set:function (value) {
                this.setElement(value, "pattern");
            }
        },
        radial:{
            get:function () {
                return this.getElement("radial", 0);
            },
            set:function (value) {
                this.setElement(value, "radial");
            }
        },
        solid:{
            get:function () {
                return this.getElement("solid", 0);
            },
            set:function (value) {
                this.setElement(value, "solid");
            }
        },
        stipple:{
            get:function () {
                return this.getElement("stipple", 0);
            },
            set:function (value) {
                this.setElement(value, "stipple");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Filter = xfalib.script.dom.Filter = xfalib.script.DOMElement.extend({
        msClassName:"filter"
    });

    Filter.defineProps({
        addRevocationInfo:{
            get:function () {
                return this.getAttribute("addRevocationInfo");
            },
            set:function (value) {
                this.setAttribute(value, "addRevocationInfo");
            }
        },
        version:{
            get:function () {
                return this.getAttribute("version");
            },
            set:function (value) {
                this.setAttribute(value, "version");
            }
        },
        appearanceFilter:{
            get:function () {
                return this.getElement("appearanceFilter", 0);
            },
            set:function (value) {
                this.setElement(value, "appearanceFilter");
            }
        },
        certificates:{
            get:function () {
                return this.getElement("certificates", 0);
            },
            set:function (value) {
                this.setElement(value, "certificates");
            }
        },
        digestMethods:{
            get:function () {
                return this.getElement("digestMethods", 0);
            },
            set:function (value) {
                this.setElement(value, "digestMethods");
            }
        },
        encodings:{
            get:function () {
                return this.getElement("encodings", 0);
            },
            set:function (value) {
                this.setElement(value, "encodings");
            }
        },
        encryptionMethods:{
            get:function () {
                return this.getElement("encryptionMethods", 0);
            },
            set:function (value) {
                this.setElement(value, "encryptionMethods");
            }
        },
        handler:{
            get:function () {
                return this.getElement("handler", 0);
            },
            set:function (value) {
                this.setElement(value, "handler");
            }
        },
        lockDocument:{
            get:function () {
                return this.getElement("lockDocument", 0);
            },
            set:function (value) {
                this.setElement(value, "lockDocument");
            }
        },
        mdp:{
            get:function () {
                return this.getElement("mdp", 0);
            },
            set:function (value) {
                this.setElement(value, "mdp");
            }
        },
        reasons:{
            get:function () {
                return this.getElement("reasons", 0);
            },
            set:function (value) {
                this.setElement(value, "reasons");
            }
        },
        timeStamp:{
            get:function () {
                return this.getElement("timeStamp", 0);
            },
            set:function (value) {
                this.setElement(value, "timeStamp");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Font = xfalib.script.dom.Font = xfalib.script.DOMElement.extend({
        msClassName:"font"
    });

    Font.defineProps({
        baselineShift:{
            get:function () {
                return this.getAttribute("baselineShift");
            },
            set:function (value) {
                this.setAttribute(value, "baselineShift");
            }
        },
        fontHorizontalScale:{
            get:function () {
                return this.getAttribute("fontHorizontalScale");
            },
            set:function (value) {
                this.setAttribute(value, "fontHorizontalScale");
            }
        },
        fontVerticalScale:{
            get:function () {
                return this.getAttribute("fontVerticalScale");
            },
            set:function (value) {
                this.setAttribute(value, "fontVerticalScale");
            }
        },
        kerningMode:{
            get:function () {
                return this.getAttribute("kerningMode");
            },
            set:function (value) {
                this.setAttribute(value, "kerningMode");
            }
        },
        letterSpacing:{
            get:function () {
                return this.getAttribute("letterSpacing");
            },
            set:function (value) {
                this.setAttribute(value, "letterSpacing");
            }
        },
        lineThrough:{
            get:function () {
                return this.getAttribute("lineThrough");
            },
            set:function (value) {
                this.setAttribute(value, "lineThrough");
            }
        },
        lineThroughPeriod:{
            get:function () {
                return this.getAttribute("lineThroughPeriod");
            },
            set:function (value) {
                this.setAttribute(value, "lineThroughPeriod");
            }
        },
        overline:{
            get:function () {
                return this.getAttribute("overline");
            },
            set:function (value) {
                this.setAttribute(value, "overline");
            }
        },
        overlinePeriod:{
            get:function () {
                return this.getAttribute("overlinePeriod");
            },
            set:function (value) {
                this.setAttribute(value, "overlinePeriod");
            }
        },
        posture:{
            get:function () {
                return this.getAttribute("posture");
            },
            set:function (value) {
                this.setAttribute(value, "posture");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this, "font.posture", value, null);
                this.trigger(evnt.name, evnt);
            }
        },
        size:{
            get:function () {
                return this.getAttribute("size");
            },
            set:function (value) {
                this.setAttribute(value, "size");
            }
        },
        typeface:{
            get:function () {
                return this.getAttribute("typeface");
            },
            set:function (value) {
                this.setAttribute(value, "typeface");
            }
        },
        underline:{
            get:function () {
                return this.getAttribute("underline");
            },
            set:function (value) {
                this.setAttribute(value, "underline");
            }
        },
        underlinePeriod:{
            get:function () {
                return this.getAttribute("underlinePeriod");
            },
            set:function (value) {
                this.setAttribute(value, "underlinePeriod");
            }
        },
        weight:{
            get:function () {
                return this.getAttribute("weight");
            },
            set:function (value) {
                this.setAttribute(value, "weight");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        fill:{
            get:function () {
                return this.getElement("fill", 0);
            },
            set:function (value) {
                this.setElement(value, "fill");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Format = xfalib.script.dom.Format = xfalib.script.DOMElement.extend({
        msClassName:"format"
    });

    Format.defineProps({
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        picture:{
            get:function () {
                return this.getElement("picture", 0);
            },
            set:function (value) {
                this.setElement(value, "picture");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Handler = xfalib.script.dom.Handler = xfalib.script.GenericText.extend({
        msClassName:"handler"
    });

    Handler.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Hyphenation = xfalib.script.dom.Hyphenation = xfalib.script.GenericText.extend({
        msClassName:"hyphenation"
    });

    Hyphenation.defineProps({
        excludeAllCaps:{
            get:function () {
                return this.getAttribute("excludeAllCaps");
            },
            set:function (value) {
                this.setAttribute(value, "excludeAllCaps");
            }
        },
        excludeInitialCap:{
            get:function () {
                return this.getAttribute("excludeInitialCap");
            },
            set:function (value) {
                this.setAttribute(value, "excludeInitialCap");
            }
        },
        hyphenate:{
            get:function () {
                return this.getAttribute("hyphenate");
            },
            set:function (value) {
                this.setAttribute(value, "hyphenate");
            }
        },
        ladderCount:{
            get:function () {
                return this.getAttribute("ladderCount");
            },
            set:function (value) {
                this.setAttribute(value, "ladderCount");
            }
        },
        pushCharacterCount:{
            get:function () {
                return this.getAttribute("pushCharacterCount");
            },
            set:function (value) {
                this.setAttribute(value, "pushCharacterCount");
            }
        },
        remainCharacterCount:{
            get:function () {
                return this.getAttribute("remainCharacterCount");
            },
            set:function (value) {
                this.setAttribute(value, "remainCharacterCount");
            }
        },
        wordCharacterCount:{
            get:function () {
                return this.getAttribute("wordCharacterCount");
            },
            set:function (value) {
                this.setAttribute(value, "wordCharacterCount");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var ImageEdit = xfalib.script.dom.ImageEdit = xfalib.script.DOMElement.extend({
        msClassName:"imageEdit"
    });

    ImageEdit.defineProps({
        data:{
            get:function () {
                return this.getAttribute("data");
            },
            set:function (value) {
                this.setAttribute(value, "data");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Issuers = xfalib.script.dom.Issuers = xfalib.script.DOMElement.extend({
        msClassName:"issuers"
    });

    Issuers.defineProps({
        "type":{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Items = xfalib.script.dom.Items = xfalib.script.DOMElement.extend({
        _defaults: {
            "save": "0"
        },

        msClassName: "items",
        initialize: function () {
            Items._super.initialize.call(this);
        },

        _computeJsonDiff: function (diff_level) {

            /*
             * always return <items> - bug#3621898
             * In case of final submission, don't send Items
             */
            return diff_level === 2 ? {
                "changed": false,
                jsonDifference: {}
            } : {
                "changed": true,
                jsonDifference: this.jsonModel
            };
        }

    });

    Items.defineProps({
        "save": {
            get: function () {
                return this.getAttribute("save");
            }
        }
    });

    Items.addMixins([
        xfalib.script.mixin.AddPresence
    ]);
})(_, xfalib);

(function (_, xfalib) {
    var Keep = xfalib.script.dom.Keep = xfalib.script.DOMElement.extend({
        msClassName:"keep"
    });

    Keep.defineProps({
        intact:{
            get:function () {
                return this.getAttribute("intact");
            },
            set:function (value) {
                this.setAttribute(value, "intact");
            }
        },
        next:{
            get:function () {
                return this.getAttribute("next");
            },
            set:function (value) {
                this.setAttribute(value, "next");
            }
        },
        previous:{
            get:function () {
                return this.getAttribute("previous");
            },
            set:function (value) {
                this.setAttribute(value, "previous");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var KeyUsage = xfalib.script.dom.KeyUsage = xfalib.script.GenericText.extend({
        msClassName:"keyUsage"
    });

    KeyUsage.defineProps({
        crlSign:{
            get:function () {
                return this.getAttribute("crlSign");
            },
            set:function (value) {
                this.setAttribute(value, "crlSign");
            }
        },
        dataEncipherment:{
            get:function () {
                return this.getAttribute("dataEncipherment");
            },
            set:function (value) {
                this.setAttribute(value, "dataEncipherment");
            }
        },
        decipherOnly:{
            get:function () {
                return this.getAttribute("decipherOnly");
            },
            set:function (value) {
                this.setAttribute(value, "decipherOnly");
            }
        },
        digitalSignature:{
            get:function () {
                return this.getAttribute("digitalSignature");
            },
            set:function (value) {
                this.setAttribute(value, "digitalSignature");
            }
        },
        encipherOnly:{
            get:function () {
                return this.getAttribute("encipherOnly");
            },
            set:function (value) {
                this.setAttribute(value, "encipherOnly");
            }
        },
        keyAgreement:{
            get:function () {
                return this.getAttribute("keyAgreement");
            },
            set:function (value) {
                this.setAttribute(value, "keyAgreement");
            }
        },
        keyCertSign:{
            get:function () {
                return this.getAttribute("keyCertSign");
            },
            set:function (value) {
                this.setAttribute(value, "keyCertSign");
            }
        },
        keyEncipherment:{
            get:function () {
                return this.getAttribute("keyEncipherment");
            },
            set:function (value) {
                this.setAttribute(value, "keyEncipherment");
            }
        },
        nonRepudiation:{
            get:function () {
                return this.getAttribute("nonRepudiation");
            },
            set:function (value) {
                this.setAttribute(value, "nonRepudiation");
            }
        },
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Linear = xfalib.script.dom.Linear = xfalib.script.DOMElement.extend({
        msClassName:"linear"
    });

    Linear.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var LockDocument = xfalib.script.dom.LockDocument = xfalib.script.GenericText.extend({
        msClassName:"lockDocument"
    });

    LockDocument.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Manifest = xfalib.script.dom.Manifest = xfalib.script.DOMElement.extend({
        msClassName:"manifest"
    });

    Manifest.defineProps({
        action:{
            get:function () {
                return this.getAttribute("action");
            },
            set:function (value) {
                this.setAttribute(value, "action");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Margin = xfalib.script.dom.Margin = xfalib.script.DOMElement.extend({
        msClassName:"margin"
    });

    Margin.defineProps({
        bottomInset:{
            get:function () {
                return this.getAttribute("bottomInset");
            },
            set:function (value) {
                this.setAttribute(value, "bottomInset");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"bottomInset",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        leftInset:{
            get:function () {
                return this.getAttribute("leftInset");
            },
            set:function (value) {
                this.setAttribute(value, "leftInset");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"leftInset",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        rightInset:{
            get:function () {
                return this.getAttribute("rightInset");
            },
            set:function (value) {
                this.setAttribute(value, "rightInset");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"rightInset",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        topInset:{
            get:function () {
                return this.getAttribute("topInset");
            },
            set:function (value) {
                this.setAttribute(value, "topInset");
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                    this,"topInset",value, null);
                this.trigger(evnt.name,evnt);
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Mdp = xfalib.script.dom.Mdp = xfalib.script.GenericText.extend({
        msClassName:"mdp"
    });

    Mdp.defineProps({
        permissions:{
            get:function () {
                return this.getAttribute("permissions");
            },
            set:function (value) {
                this.setAttribute(value, "permissions");
            }
        },
        signatureType:{
            get:function () {
                return this.getAttribute("signatureType");
            },
            set:function (value) {
                this.setAttribute(value, "signatureType");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Medium = xfalib.script.dom.Medium = xfalib.script.GenericText.extend({
        msClassName:"medium"
    });

    Medium.defineProps({
        imagingBBox:{
            get:function () {
                return this.getAttribute("imagingBBox");
            },
            set:function (value) {
                this.setAttribute(value, "imagingBBox");
            }
        },
        "long":{
            get:function () {
                return this.getAttribute("long");
            },
            set:function (value) {
                this.setAttribute(value, "long");
            }
        },
        orientation:{
            get:function () {
                return this.getAttribute("orientation");
            },
            set:function (value) {
                this.setAttribute(value, "orientation");
            }
        },
        "short":{
            get:function () {
                return this.getAttribute("short");
            },
            set:function (value) {
                this.setAttribute(value, "short");
            }
        },
        stock:{
            get:function () {
                return this.getAttribute("stock");
            },
            set:function (value) {
                this.setAttribute(value, "stock");
            }
        },
        trayIn:{
            get:function () {
                return this.getAttribute("trayIn");
            },
            set:function (value) {
                this.setAttribute(value, "trayIn");
            }
        },
        trayOut:{
            get:function () {
                return this.getAttribute("trayOut");
            },
            set:function (value) {
                this.setAttribute(value, "trayOut");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Message = xfalib.script.dom.Message = xfalib.script.DOMElement.extend({
        msClassName:"message"
    });

})(_, xfalib);
(function (_, xfalib) {
    var NumericEdit = xfalib.script.dom.NumericEdit = xfalib.script.DOMElement.extend({
        msClassName:"numericEdit"
    });

    NumericEdit.defineProps({
        hScrollPolicy:{
            get:function () {
                return this.getAttribute("hScrollPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "hScrollPolicy");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        comb:{
            get:function () {
                return this.getElement("comb", 0);
            },
            set:function (value) {
                this.setElement(value, "comb");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Occur = xfalib.script.dom.Occur = xfalib.script.DOMElement.extend({
        msClassName:"occur",
        playJson : function(pJsonModel) {

        }

    });

    Occur.defineProps({
        initial:{
            get:function () {
                return this.getAttribute("initial");
            },
            set:function (value) {
                this.setAttribute(value, "initial");
            }
        },
        max:{
            get:function () {
                return this.getAttribute("max");
            },
            set:function (value) {
                this.setAttribute(value, "max");
            }
        },
        min:{
            get:function () {
                return this.getAttribute("min");
            },
            set:function (value) {
                this.setAttribute(value, "min");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Oid = xfalib.script.dom.Oid = xfalib.script.GenericText.extend({
        msClassName:"oid"
    });

})(_, xfalib);
(function (_, xfalib) {
    var Oids = xfalib.script.dom.Oids = xfalib.script.DOMElement.extend({
        msClassName:"oids"
    });

    Oids.defineProps({
        "type":{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Overflow = xfalib.script.dom.Overflow = xfalib.script.GenericText.extend({
        msClassName:"overflow"
    });

    Overflow.defineProps({
        leader:{
            get:function () {
                return this.getAttribute("leader");
            },
            set:function (value) {
                this.setAttribute(value, "leader");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        trailer:{
            get:function () {
                return this.getAttribute("trailer");
            },
            set:function (value) {
                this.setAttribute(value, "trailer");
            }
        }
    });

})(_, xfalib);
(function(_,xfalib){
    var Para = xfalib.script.dom.Para = xfalib.script.DOMElement.extend({
        msClassName:"para"
    });

    Para.defineProps({
        hAlign : {
            get : function(){
                return this.getAttribute("hAlign");
            },
            set : function(value){
                this.setAttribute(value, "hAlign");
            }
        },

        lineHeight : {
            get : function(){
                return this.getAttribute("lineHeight");
            },
            set : function(value){
                this.setAttribute(value, "lineHeight");
            }
        },

        marginLeft : {
            get : function(){
                return this.getAttribute("marginLeft");
            },
            set : function(value){
                this.setAttribute(value, "marginLeft");
            }
        },

        marginRight : {
            get : function(){
                return this.getAttribute("marginRight");
            },
            set : function(value){
                this.setAttribute(value, "marginRight");
            }
        },

        orphans : {
            get : function(){
                return this.getAttribute("orphans");
            },
            set : function(value){
                this.setAttribute(value, "orphans");
            }
        },

        preserve : {
            get : function(){
                return this.getAttribute("preserve");
            },
            set : function(value){
                this.setAttribute(value, "preserve");
            }
        },

        radixOffset : {
            get : function(){
                return this.getAttribute("radixOffset");
            },
            set : function(value){
                this.setAttribute(value, "radixOffset");
            }
        },

        spaceAbove : {
            get : function(){
                return this.getAttribute("spaceAbove");
            },
            set : function(value){
                this.setAttribute(value, "spaceAbove");
            }
        },

        spaceBelow : {
            get : function(){
                return this.getAttribute("spaceBelow");
            },
            set : function(value){
                this.setAttribute(value, "spaceBelow");
            }
        },

        tabDefault : {
            get : function(){
                return this.getAttribute("tabDefault");
            },
            set : function(value){
                this.setAttribute(value, "tabDefault");
            }
        },

        tabStops : {
            get : function(){
                return this.getAttribute("tabStops");
            },
            set : function(value){
                this.setAttribute(value, "tabStops");
            }
        },

        textIndent : {
            get : function(){
                return this.getAttribute("textIndent");
            },
            set : function(value){
                this.setAttribute(value, "textIndent");
            }
        },

        vAlign : {
            get : function(){
                return this.getAttribute("vAlign");
            },
            set : function(value){
                this.setAttribute(value, "vAlign");
            }
        },

        widows : {
            get : function(){
                return this.getAttribute("widows");
            },
            set : function(value){
                this.setAttribute(value, "widows");
            }
        },

        wordSpacingMaximum : {
            get : function(){
                return this.getAttribute("wordSpacingMaximum");
            },
            set : function(value){
                this.setAttribute(value, "wordSpacingMaximum");
            }
        },

        wordSpacingMinimum : {
            get : function(){
                return this.getAttribute("wordSpacingMinimum");
            },
            set : function(value){
                this.setAttribute(value, "wordSpacingMinimum");
            }
        },

        wordSpacingOptimum : {
            get : function(){
                return this.getAttribute("wordSpacingOptimum");
            },
            set : function(value){
                this.setAttribute(value, "wordSpacingOptimum");
            }
        }
    });

})(_,xfalib);


(function (_, xfalib) {
    var PasswordEdit = xfalib.script.dom.PasswordEdit = xfalib.script.DOMElement.extend({
        msClassName:"passwordEdit"
    });

    PasswordEdit.defineProps({
        hScrollPolicy:{
            get:function () {
                return this.getAttribute("hScrollPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "hScrollPolicy");
            }
        },
        passwordChar:{
            get:function () {
                return this.getAttribute("passwordChar");
            },
            set:function (value) {
                this.setAttribute(value, "passwordChar");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Pattern = xfalib.script.dom.Pattern = xfalib.script.DOMElement.extend({
        msClassName:"pattern"
    });

    Pattern.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Picture = xfalib.script.dom.Picture = xfalib.script.GenericText.extend({
        msClassName:"picture"
    });

    Picture.defineProps({
    });

})(_, xfalib);
(function (_, xfalib) {
    var Radial = xfalib.script.dom.Radial = xfalib.script.DOMElement.extend({
        msClassName:"radial"
    });

    Radial.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Reason = xfalib.script.dom.Reason = xfalib.script.GenericText.extend({
        msClassName:"reason"
    });

})(_, xfalib);
(function (_, xfalib) {
    var Reasons = xfalib.script.dom.Reasons = xfalib.script.DOMElement.extend({
        msClassName:"reasons"
    });

    Reasons.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Ref = xfalib.script.dom.Ref = xfalib.script.GenericText.extend({
        msClassName:"ref"
    });

    Ref.defineProps({
    });

})(_, xfalib);
(function (_, xfalib) {
    var RenderAs = xfalib.script.dom.RenderAs = xfalib.script.DOMElement.extend({
        msClassName:"renderAs"
    });

    RenderAs.defineProps({
        APIVersion:{
            get:function () {
                return this.getAttribute("APIVersion");
            },
            set:function (value) {
                this.setAttribute(value, "APIVersion");
            }
        },
        svg:{
            get:function () {
                return this.getElement("svg", 0);
            },
            set:function (value) {
                this.setElement(value, "svg");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Script = xfalib.script.dom.Script = xfalib.script.GenericText.extend({
        msClassName:"script"
    });

    Script.defineProps({
        binding:{
            get:function () {
                return this.getAttribute("binding");
            },
            set:function (value) {
                this.setAttribute(value, "binding");
            }
        },
        contentType:{
            get:function () {
                return this.getAttribute("contentType");
            },
            set:function (value) {
                this.setAttribute(value, "contentType");
            }
        },
        runAt:{
            get:function () {
                return this.getAttribute("runAt");
            },
            set:function (value) {
                this.setAttribute(value, "runAt");
            }
        },
        stateless:{
            get:function () {
                return this.getAttribute("stateless");
            },
            set:function (value) {
                this.setAttribute(value, "stateless");
            }
        }
    });

})(_, xfalib);
(function(_, xfalib){
    var ScriptObject = xfalib.script.dom.ScriptObject = xfalib.script.dom.Script.extend({
        msClassName: "script",
        initialize : function(){
            ScriptObject._super.initialize.call(this);
            this._scriptInitialized = false;
        },

        _getNakedThis : function(){
            if(!this._scriptInitialized){
                if(this.value){
                    try{
                        var oldScope = null;
                        if(this.parent.parent instanceof xfalib.script.EventContainerNode) {
                            oldScope = this.parent.parent._createNakedReferencesScope();
                        }
                        this._xfa()._pushContextNode(this);
                        with(this.parent.parent) { // the parent subform of script obj.
                            with(xfalib.runtime) {
                                //TODO: possible xss attack
                                (eval("("+this.value+")")).apply(this.parent.parent,[this]); // subform -> self, this -> baseobj / script Obj
                            }
                        }
                    } catch(exception){
                        var som = this._xfa().moContextNodes[0] ? this._xfa().moContextNodes[0].somExpression
                                                                : ""
                        this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-015"],
                                                [exception.message, this.name,
                                                 this._xfa().event.name, som])
                    } finally {
                        if(oldScope != null) {
                            this.parent.parent._resetNakedReferencesScope(oldScope);
                        }
                        this._xfa()._popContextNode();
                    }
                }
                this._scriptInitialized = true;
            }
            return this;
        }

    });
})(_, xfalib);
(function (_, xfalib) {
    var SetProperty = xfalib.script.dom.SetProperty = xfalib.script.GenericText.extend({
        msClassName:"setProperty"
    });

    SetProperty.defineProps({
        connection:{
            get:function () {
                return this.getAttribute("connection");
            },
            set:function (value) {
                this.setAttribute(value, "connection");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Signature = xfalib.script.dom.Signature = xfalib.script.DOMElement.extend({
        msClassName:"signature"
    });

    Signature.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        filter:{
            get:function () {
                return this.getElement("filter", 0);
            },
            set:function (value) {
                this.setElement(value, "filter");
            }
        },
        manifest:{
            get:function () {
                return this.getElement("manifest", 0);
            },
            set:function (value) {
                this.setElement(value, "manifest");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var SignData = xfalib.script.dom.SignData = xfalib.script.DOMElement.extend({
        msClassName:"signData"
    });

    SignData.defineProps({
        operation:{
            get:function () {
                return this.getAttribute("operation");
            },
            set:function (value) {
                this.setAttribute(value, "operation");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        filter:{
            get:function () {
                return this.getElement("filter", 0);
            },
            set:function (value) {
                this.setElement(value, "filter");
            }
        },
        manifest:{
            get:function () {
                return this.getElement("manifest", 0);
            },
            set:function (value) {
                this.setElement(value, "manifest");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Signing = xfalib.script.dom.Signing = xfalib.script.DOMElement.extend({
        msClassName:"signing"
    });

    Signing.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Solid = xfalib.script.dom.Solid = xfalib.script.DOMElement.extend({
        msClassName:"solid"
    });

    Solid.defineProps({
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Speak = xfalib.script.dom.Speak = xfalib.script.GenericText.extend({
        msClassName:"speak"
    });

    Speak.defineProps({
        disable:{
            get:function () {
                return this.getAttribute("disable");
            },
            set:function (value) {
                this.setAttribute(value, "disable");
            }
        },
        priority:{
            get:function () {
                return this.getAttribute("priority");
            },
            set:function (value) {
                this.setAttribute(value, "priority");
            }
        },
        rid:{
            get:function () {
                return this.getAttribute("rid");
            },
            set:function (value) {
                this.setAttribute(value, "rid");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Stipple = xfalib.script.dom.Stipple = xfalib.script.DOMElement.extend({
        msClassName:"stipple"
    });

    Stipple.defineProps({
        rate:{
            get:function () {
                return this.getAttribute("rate");
            },
            set:function (value) {
                this.setAttribute(value, "rate");
            }
        },
        color:{
            get:function () {
                return this.getElement("color", 0);
            },
            set:function (value) {
                this.setElement(value, "color");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var SubjectDN = xfalib.script.dom.SubjectDN = xfalib.script.GenericText.extend({
        msClassName:"subjectDN"
    });

    SubjectDN.defineProps({
        delimiter:{
            get:function () {
                return this.getAttribute("delimiter");
            },
            set:function (value) {
                this.setAttribute(value, "delimiter");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var SubjectDNs = xfalib.script.dom.SubjectDNs = xfalib.script.DOMElement.extend({
        msClassName:"subjectDNs"
    });

    SubjectDNs.defineProps({
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Submit = xfalib.script.dom.Submit = xfalib.script.DOMElement.extend({
        msClassName:"submit"
    });

    Submit.defineProps({
        embedPDF:{
            get:function () {
                return this.getAttribute("embedPDF");
            },
            set:function (value) {
                this.setAttribute(value, "embedPDF");
            }
        },
        format:{
            get:function () {
                return this.getAttribute("format");
            },
            set:function (value) {
                this.setAttribute(value, "format");
            }
        },
        target:{
            get:function () {
                return this.getAttribute("target");
            },
            set:function (value) {
                this.setAttribute(value, "target");
            }
        },
        textEncoding:{
            get:function () {
                return this.getAttribute("textEncoding");
            },
            set:function (value) {
                this.setAttribute(value, "textEncoding");
            }
        },
        xdpContent:{
            get:function () {
                return this.getAttribute("xdpContent");
            },
            set:function (value) {
                this.setAttribute(value, "xdpContent");
            }
        },
        encrypt:{
            get:function () {
                return this.getElement("encrypt", 0);
            },
            set:function (value) {
                this.setElement(value, "encrypt");
            }
        }


    });

})(_, xfalib);
(function (_, xfalib) {
    var Svg = xfalib.script.dom.Svg = xfalib.script.GenericText.extend({
        msClassName:"svg"
    });

    Svg.defineProps({
        height:{
            get:function () {
                return this.getAttribute("height");
            },
            set:function (value) {
                this.setAttribute(value, "height");
            }
        },
        viewBox:{
            get:function () {
                return this.getAttribute("viewBox");
            },
            set:function (value) {
                this.setAttribute(value, "viewBox");
            }
        },
        width:{
            get:function () {
                return this.getAttribute("width");
            },
            set:function (value) {
                this.setAttribute(value, "width");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var TextEdit = xfalib.script.dom.TextEdit = xfalib.script.DOMElement.extend({
        msClassName:"textEdit"
    });

    TextEdit.defineProps({
        allowRichText:{
            get:function () {
                return this.getAttribute("allowRichText");
            },
            set:function (value) {
                this.setAttribute(value, "allowRichText");
            }
        },
        hScrollPolicy:{
            get:function () {
                return this.getAttribute("hScrollPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "hScrollPolicy");
            }
        },
        multiLine:{
            get:function () {
                return this.getAttribute("multiLine");
            },
            set:function (value) {
                this.setAttribute(value, "multiLine");
            }
        },
        vScrollPolicy:{
            get:function () {
                return this.getAttribute("vScrollPolicy");
            },
            set:function (value) {
                this.setAttribute(value, "vScrollPolicy");
            }
        },
        border:{
            get:function () {
                return this.getElement("border", 0);
            },
            set:function (value) {
                this.setElement(value, "border");
            }
        },
        comb:{
            get:function () {
                return this.getElement("comb", 0);
            },
            set:function (value) {
                this.setElement(value, "comb");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        margin:{
            get:function () {
                return this.getElement("margin", 0);
            },
            set:function (value) {
                this.setElement(value, "margin");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var TextNode = xfalib.script.TextNode = xfalib.script.Object.extend({
        msClassName:"textNode"
    });

    TextNode.defineProps({

    })
})(_, xfalib);
(function (_, xfalib) {
    var TimeStamp = xfalib.script.dom.TimeStamp = xfalib.script.GenericText.extend({
        msClassName:"timeStamp"
    });

    TimeStamp.defineProps({
        server:{
            get:function () {
                return this.getAttribute("server");
            },
            set:function (value) {
                this.setAttribute(value, "server");
            }
        },
        type:{
            get:function () {
                return this.getAttribute("type");
            },
            set:function (value) {
                this.setAttribute(value, "type");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var ToolTip = xfalib.script.dom.ToolTip = xfalib.script.GenericText.extend({
        msClassName:"toolTip"
    });

    ToolTip.defineProps({
        rid:{
            get:function () {
                return this.getAttribute("rid");
            },
            set:function (value) {
                this.setAttribute(value, "rid");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Traversal = xfalib.script.dom.Traversal = xfalib.script.DOMElement.extend({
        msClassName:"traversal"
    });

    Traversal.defineProps({
        passThrough:{
            get:function () {
                return this.getAttribute("passThrough");
            },
            set:function (value) {
                this.setAttribute(value, "passThrough");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        }

    });

})(_, xfalib);
(function (_, xfalib) {
    var Traverse = xfalib.script.dom.Traverse = xfalib.script.DOMElement.extend({
        msClassName:"traverse"
    });

    Traverse.defineProps({
        delegate:{
            get:function () {
                return this.getAttribute("delegate");
            },
            set:function (value) {
                this.setAttribute(value, "delegate");
            }
        },
        operation:{
            get:function () {
                return this.getAttribute("operation");
            },
            set:function (value) {
                this.setAttribute(value, "operation");
            }
        },
        ref:{
            get:function () {
                return this.getAttribute("ref");
            },
            set:function (value) {
                this.setAttribute(value, "ref");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Ui = xfalib.script.dom.Ui = xfalib.script.DOMElement.extend({
        msClassName:"ui",

        // TODO : remove these once Sharad merges changes from HMRC
        initialize : function(){
            Ui._super.initialize.call(this);
            for (var i = 0; i < this.moChildNodes.length; ++i) {
                var oNode = this.moChildNodes[i];
                oNode.on(xfalib.script.XfaModelEvent.DOM_CHANGED,this) ;
            }
        },

        handleEvent: function(evnt) {
            this.trigger(evnt.name,evnt);
        },

        _getOneOfChild : function(){
            var oneChild = Ui._super._getOneOfChild.call(this);
            if(oneChild)
                return oneChild;

            var childType = "textEdit";
            if(this.parent){
                var valueChild = this.parent.value.oneOfChild || {className : "text"};
                switch (valueChild.className){
                    case "dateTime" :
                    case "date" :
                    case "time" :
                        childType = "dateTimeEdit";
                        break;
                    case "decimal" :
                    case "float" :
                    case "integer" :
                        childType = "numericEdit";
                        break;
                    case "boolean" :
                        childType = "checkButton";
                        break;
                    case "text" :
                        childType = "textEdit";
                        break;
                    case "image" :
                        childType = "imageEdit";
                        break;
                }
            }
            return this._getDefaultElement(childType, 0, true);
        }

    });

    Ui.defineProps({
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        picture:{
            get:function () {
                return this.getElement("picture", 0);
            },
            set:function (value) {
                this.setElement(value, "picture");
            }
        },
        barcode:{
            get:function () {
                return this.getElement("barcode", 0);
            },
            set:function (value) {
                this.setElement(value, "barcode");
            }
        },
        button:{
            get:function () {
                return this.getElement("button", 0);
            },
            set:function (value) {
                this.setElement(value, "button");
            }
        },
        checkButton:{
            get:function () {
                return this.getElement("checkButton", 0);
            },
            set:function (value) {
                this.setElement(value, "checkButton");
            }
        },
        choiceList:{
            get:function () {
                return this.getElement("choiceList", 0);
            },
            set:function (value) {
                this.setElement(value, "choiceList");
            }
        },
        dateTimeEdit:{
            get:function () {
                return this.getElement("dateTimeEdit", 0);
            },
            set:function (value) {
                this.setElement(value, "dateTimeEdit");
            }
        },
        defaultUi:{
            get:function () {
                return this.getElement("defaultUi", 0);
            },
            set:function (value) {
                this.setElement(value, "defaultUi");
            }
        },
        exObject:{
            get:function () {
                return this.getElement("exObject", 0);
            },
            set:function (value) {
                this.setElement(value, "exObject");
            }
        },
        imageEdit:{
            get:function () {
                return this.getElement("imageEdit", 0);
            },
            set:function (value) {
                this.setElement(value, "imageEdit");
            }
        },
        numericEdit:{
            get:function () {
                return this.getElement("numericEdit", 0);
            },
            set:function (value) {
                this.setElement(value, "numericEdit");
            }
        },
        passwordEdit:{
            get:function () {
                return this.getElement("passwordEdit", 0);
            },
            set:function (value) {
                this.setElement(value, "passwordEdit");
            }
        },
        signature:{
            get:function () {
                return this.getElement("signature", 0);
            },
            set:function (value) {
                this.setElement(value, "signature");
            }
        },
        textEdit:{
            get:function () {
                return this.getElement("textEdit", 0);
            },
            set:function (value) {
                this.setElement(value, "textEdit");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Validate = xfalib.script.dom.Validate = xfalib.script.DOMElement.extend({
        msClassName:"validate"
    });

    Validate.defineProps({
        disableAll:{
            get:function () {
                return this.getAttribute("disableAll");
            },
            set:function (value) {
                this.setAttribute(value, "disableAll");
            }
        },
        formatTest:{
            get:function () {
                return this.getAttribute("formatTest");
            },
            set:function (value) {
                this.setAttribute(value, "formatTest");
            }
        },
        nullTest:{
            get:function () {
                return this.getAttribute("nullTest");
            },
            set:function (value) {
                var oldValue = this.nullTest;
                this.setAttribute(value, "nullTest");
                var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED, this,
                        'nullTest', oldValue, value);
                this.trigger(event.name, event);
            }
        },
        scriptTest:{
            get:function () {
                return this.getAttribute("scriptTest");
            },
            set:function (value) {
                this.setAttribute(value, "scriptTest");
            }
        },
        extras:{
            get:function () {
                return this.getElement("extras", 0);
            },
            set:function (value) {
                this.setElement(value, "extras");
            }
        },
        message:{
            get:function () {
                return this.getElement("message", 0);
            },
            set:function (value) {
                this.setElement(value, "message");
            }
        },
        picture:{
            get:function () {
                return this.getElement("picture", 0);
            },
            set:function (value) {
                this.setElement(value, "picture");
            }
        },
        script:{
            get:function () {
                return this.getElement("script", 0);
            },
            set:function (value) {
                this.setElement(value, "script");
            }
        }
    });

})(_, xfalib);
(function (_, xfalib) {
    var Value = xfalib.script.dom.Value = xfalib.script.DOMElement.extend({
        msClassName: "value",

        _getOneOfChild: function () {
            var oneChild = Value._super._getOneOfChild.call(this);
            if (oneChild)
                return oneChild;

            var childType = "text";
            if (this.parent && (this.parent.className == "field" || this.parent.className == "draw")) {
                /*
                 * Bug:3600246
                 * When checking ui oneOfChild, do not directly use ui.oneOfChild since it would again fallback to value.onOfChild in case value is also missing.
                 * So check json instead and see if ui oneOfChild exist and then only access it.
                 */
                var uiChild = this.xfaUtil().getUiOneOfChildTag(this.parent.jsonModel) ? this.parent.ui.oneOfChild : {className: "text"};
                switch (uiChild.className) {
                    case "numericEdit" :
                        childType = "float";
                        break;
                    case "dateTimeEdit" :
                        childType = "dateTime";
                        break;
                    case "imageEdit" :
                        childType = "image";
                        break;
                    case "textEdit" :
                        if (uiChild.allowRichText) {
                            childType = "exData";
                        }
                        else {
                            childType = "text";
                        }
                        break;
                    case "choiceList" :
                        if (uiChild.open == "multiSelect") {
                            childType = "exData";
                        }
                        else {
                            childType = "text";
                        }
                        break;
                }
            }
            return this._getDefaultElement(childType, 0, true);
        },

        _computeJsonDiff: function (diff_level) {

            //Force all the descendants of value irrespective of submit call
            var diffObj = xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, false, Value._super._computeJsonDiff, [0]);

            //now strip all the EXTRA properties from value if it is final submission  or restoreFormState
            if (diff_level>0 && this.getOrElse(diffObj, 'jsonDifference.children.length', 0)) {
                //believe me this is not that costly as it looks to be as there will be only one child in all the differences and only two keys per child
                var blacklisted = ['extras'];
                diffObj.jsonDifference.children = _.map(diffObj.jsonDifference.children, function (child) {
                    var copy = {};
                    _.each(Object.keys(child), function (key) {
                        if (!_.contains(blacklisted, key)) {
                            copy[key] = child[key];
                        }
                    });
                    return copy;
                }, this);
            }

            //LC-8319 : don't send [] in diffObj.jsonDifference.children
            if (diffObj.jsonDifference && _.every(diffObj.jsonDifference.children, _.isEmpty)) {  // diffObj should have a jsonDifference member
                diffObj.jsonDifference.children = undefined; // scary to use delete due to perf. impact
            }
            return diffObj;
        }

    });

    Value.defineProps({
        override: {
            get: function () {
                return this.getAttribute("override");
            },
            set: function (value) {
                this.setAttribute(value, "override");
            }
        },
        relevant: {
            get: function () {
                return this.getAttribute("relevant");
            },
            set: function (value) {
                this.setAttribute(value, "relevant");
            }
        },
        arc: {
            get: function () {
                return this.getElement("arc", 0);
            },
            set: function (value) {
                this.setElement(value, "arc");
            }
        },
        "boolean": {
            get: function () {
                return this.getElement("boolean", 0);
            },
            set: function (value) {
                this.setElement(value, "boolean");
            }
        },
        "date": {
            get: function () {
                return this.getElement("date", 0);
            },
            set: function (value) {
                this.setElement(value, "date");
            }
        },
        "dateTime": {
            get: function () {
                return this.getElement("dateTime", 0);
            },
            set: function (value) {
                this.setElement(value, "dateTime");
            }
        },
        "decimal": {
            get: function () {
                return this.getElement("decimal", 0);
            },
            set: function (value) {
                this.setElement(value, "decimal");
            }
        },
        exData: {
            get: function () {
                return this.getElement("exData", 0);
            },
            set: function (value) {
                this.setElement(value, "exData");
            }
        },
        "float": {
            get: function () {
                return this.getElement("float", 0);
            },
            set: function (value) {
                this.setElement(value, "float");
            }
        },
        "image": {
            get: function () {
                return this.getElement("image", 0);
            },
            set: function (value) {
                this.setElement(value, "image");
            }
        },
        "integer": {
            get: function () {
                return this.getElement("integer", 0);
            },
            set: function (value) {
                this.setElement(value, "integer");
            }
        },
        line: {
            get: function () {
                return this.getElement("line", 0);
            },
            set: function (value) {
                this.setElement(value, "line");
            }
        },
        rectangle: {
            get: function () {
                return this.getElement("rectangle", 0);
            },
            set: function (value) {
                this.setElement(value, "rectangle");
            }
        },
        "text": {
            get: function () {
                return this.getElement("text", 0);
            },
            set: function (value) {
                this.setElement(value, "text");
            }
        },
        "time": {
            get: function () {
                return this.getElement("time", 0);
            },
            set: function (value) {
                this.setElement(value, "time");
            }
        }
    });

})(_, xfalib);
