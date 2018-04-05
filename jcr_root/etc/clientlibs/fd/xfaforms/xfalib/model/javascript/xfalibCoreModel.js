/*******************************************************************************
 * ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   Copyright 2013 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and are protected by all applicable intellectual property
 *  laws, including trade secret and copyright laws.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 ******************************************************************************/

(function(_,xfalib) {
    var Constants = {
        accessValues : ["open","protected","readOnly","nonInteractive"],
        presenceValues : ["visible", "hidden","inactive","invisible"],
        itemSaveValues : [0,1],
        valueOverrideValues : [0,1],
        oneOfChild : {type: "oneOfChild", min:0, max:1},
        zeroOrMore : {type: "zeroOrMore",min:0, max:Infinity},
        zeroOrOne : {type: "zeroOrOne",min:0, max:1},
        zeroOrTwo : {type: "zeroOrTwo", min:0, max:2},
        zeroOrFour : {type: "zeroOrFour", min:0, max:4},
        oneOrMore : {type: "oneOrMore", min:1, max:Infinity},

        encryptDataOperationValues : ["encrypt", "decrypt"],
        requiredTypeValues : ["optional", "required"],
        dataValues : ["link", "embed"],
        hScrollPolicyValues : ["auto", "off", "on"],
        disableAllValues : ["0", "1"],
        formatTestValues : ["warning", "disabled", "error"],
        nullTestValues : ["disabled", "error", "warning" ],
        scriptTestValues : ["error", "disabled", "warning"],
        afterValues : ["auto", "contentArea", "pageArea", "pageEven", "pageOdd"],
        beforeValues : ["auto", "contentArea", "pageArea", "pageEven", "pageOdd"],
        startNewValues : ["0", "1"],
        circularValues : ["0", "1"],
        handValues : ["even", "left", "right"],
        highlightValues : ["inverted", "none", "outline", "push"],
        activityValues : ["click", "change", "docClose", "docReady", "enter",
            "exit", "full", "indexChange", "initialize",
            "mouseDown", "mouseEnter", "mouseExit", "mouseUp",
            "postExecute", "postOpen", "postPrint", "postSave",
            "postSign", "postSubmit", "preExecute", "preOpen",
            "prePrint", "preSave", "preSign", "preSubmit",
            "ready", "validationState"],
        listenValues : ["refOnly", "refAndDescendents"],
        breakValues : ["close", "open"],
        targetTypeValues : ["auto", "contentArea", "pageArea", "pageEven", "pageOdd"],
        signTypeValues : ["PDF1.3", "PDF1.6"],
        signDataOperationValues : ["sign", "clear", "verify"],
        aspectValues : ["fit", "actual", "height", "none", "width"],
        transferEncodingValues : ["none", "package", "base64"],
        manifestActionValues : ["include", "all", "exclude"],
        traverseDelegateValues : ["0", "1"],
        traverseOperationValues : ["next", "back", "down", "first", "left", "right", "up"],
        slopeValues : ["\\", "/"],
        excludeAllCapsValues : ["0", "1"],
        excludeInitialCapValues : ["0", "1"],
        hyphenateValues : ["0", "1"],
        allowNeutralValues : ["0", "1"],
        markValues : ["default", "check", "circle", "cross", "diamond", "square", "star"],
        shapeValues : ["square", "round"],
        commitOnValues : [ "select", "exit"],
        openValues : ["userControl", "always", "multiSelect", "onEntry" ],
        textEntryValues : ["0", "1"],
        linearTypeValues : ["toRight", "toBottom", "toLeft", "toTop"],
        edgeCapValues : ["square", "butt", "round"],
        strokeValues : ["solid", "dashDot", "dashDotDot", "dashed", "dotted", "embossed", "etched", "lowered", "raised"],
        cornerInvertedValues : ["0", "1"],
        cornerJoinValues : ["square","round"],
        speakDisableValues : ["0", "1"],
        speakPriorityValues : [ "custom", "caption", "name", "toolTip"],
        captionPlacementValues : ["left", "bottom", "inline", "right", "top"],
        orientationValues : ["portrait", "landscape"],
        mediumTrayInValues : ["auto", "delegate", "pageFront"],
        mediumTrayOutValues : ["auto", "delegate"],
        patternTypeValues : ["crossHatch", "crossDiagonal", "diagonalLeft", "diagonalRight", "horizontal", "vertical"],
        keepIntactValues : ["none", "contentArea", "pageArea"],
        keepNextValues : ["none", "contentArea", "pageArea"],
        keepPreviousValues : ["none", "contentArea", "pageArea"],
        passThroughValues : ["0", "1"],
        allowRichTextValues : ["0", "1"],
        multiLineValues : ["1", "0"],
        vScrollPolicyValues : ["auto", "off", "on"],
        kerningModeValues : ["none", "pair"],
        lineThroughValues : ["0", "1", "2"],
        lineThroughPeriodValues : ["all", "word"],
        fontOverlineValues : ["0", "1", "2"],
        fontOverlinePeriodValues : ["all", "word"],
        postureValues : ["normal", "italic"],
        underlineValues : ["0", "1", "2"],
        underlinePeriodValues : ["all", "word"],
        fontWeightValues : ["normal", "bold"],
        checksumValues : ["none", "1mod10", "1mod10_1mod11", "2mod10", "auto"],
        dataPrepValues : ["none", "flateCompress"],
        printCheckDigitValues : ["0", "1"],
        textLocationValues : ["below", "belowEmbedded", "none", "above", "aboveEmbedded"],
        truncateValues : ["0", "1"],
        upsModeValues : ["usCarrier", "internationalCarrier", "secureSymbol", "standardSymbol"],
        mdpPermissionsValues : ["2", "1", "3"],
        mdpSignatureTypeValues : ["filler", "author"],
        connectUsageValues : ["exportAndImport", "exportOnly", "importOnly"],
        radialTypeValues : ["toEdge", "toCenter"],
        credentialServerPolicyValues : ["optional", "required"],
        dateTimeEditPickerValues : ["host", "none"],
        bindMatchValues : ["once", "dataRef", "global", "none"],
        runAtValues : ["client", "both", "server"],
        statelessValues : ["0", "1"],
        executeTypeValues : ["import", "remerge"],
        calcOverrideValues : ["disabled", "error", "ignore", "warning" ],
        embedPDFValues : ["0", "1"],
        submitFormatValues : ["xdp", "formdata", "pdf", "urlencoded", "xfd", "xml" ],
        setRelationValues : ["ordered" , "choice" , "unordered"],
        firstTraversal : "first",
        nextTraversal : "next"

    };
    xfalib.template.Constants = Constants;
})(_,xfalib);
(function(_, xfalib){

var XfaTemplateSchema = {};

var TemplateSchema = xfalib.template.TemplateSchema = xfalib.ut.Class.extend({
    initialize : function() {
        var elem = null;
        XfaTemplateSchema["field"] = elem = this.createElement();
        this.addAttributes(elem,[
                                    ["access",xfalib.template.Constants.accessValues,0],
                                    ["h","measurement",0],
                                    ["w","measurement",0],
                                    ["x","measurement",0],
                                    ["y","measurement",0],
                                    ["presence",xfalib.template.Constants.presenceValues,0],
                                    ["name","string",""],
                                    ["relevant", "string", "" ],
                                    ["locale","string","en_US"]
                                   ]);
        this.addChildren(elem, [
                                    ["items","zeroOrTwo"],
                                    ["extras","zeroOrOne"],
                                    ["desc","zeroOrOne"],
                                    ["event","zeroOrMore"],
                                    ["value","zeroOrOne"],
                                    ["ui","zeroOrOne"],
                                    ["assist","zeroOrOne"],
                                    ["border", "zeroOrOne"]  ,
                                    ["para", "zeroOrOne"]  ,
                                    ["caption", "zeroOrOne"]  ,
                                    ["validate","zeroOrOne"]  ,
                                    ["margin", "zeroOrOne"] ,
                                    ["font", "zeroOrOne"],
                                    ["calculate","zeroOrOne"],
                                    ["format","zeroOrOne"],
                                    ["bindItems","zeroOrMore"]
                                ]);

        XfaTemplateSchema["area"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["x","measurement",0],
            ["y","measurement",0],
            ["relevant", "string", "" ],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["field","zeroOrMore"],
            ["draw","zeroOrMore"],
            ["exclGroup","zeroOrMore"],
            ["instanceManager","zeroOrMore"],
            ["area","zeroOrMore"],
            ["subform","zeroOrMore"],
            ["subformSet","zeroOrMore"]
        ]);

        XfaTemplateSchema["subformSet"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["relation",xfalib.template.Constants.setRelationValues,0],
            ["relevant","string",""],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["bookend","zeroOrOne"],
            ["break","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["extras","zeroOrOne"],
            ["occur","zeroOrOne"],
            ["overflow","zeroOrOne"],
            ["breakAfter","zeroOrMore"],
            ["breakBefore","zeroOrMore"],
            ["instanceManager","zeroOrMore"],
            ["subform","zeroOrMore"],
            ["subformSet","zeroOrMore"]
        ]);

        XfaTemplateSchema["contentArea"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""],
            ["h","measurement",0],
            ["w","measurement",0],
            ["x","measurement",0],
            ["relevant", "string", "" ],
            ["y","measurement",0]
        ]);
        this.addChildren(elem, [
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"]
        ]);

        XfaTemplateSchema["date"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""]
        ]);

        XfaTemplateSchema["decimal"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""],
            ["leadDigits","integer",-1],
            ["fracDigits","integer",2]
        ]);

        XfaTemplateSchema["draw"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["h","measurement",0],
            ["w","measurement",0],
            ["x","measurement",0],
            ["y","measurement",0],
            ["presence",xfalib.template.Constants.presenceValues,0],
            ["name","string",""],
            ["access", xfalib.template.Constants.accessValues, 0],  // TODO : fix schema violation
            ["relevant", "string", "" ],
            ["locale","string","en_US"]

        ]);
        this.addChildren(elem, [
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["value","zeroOrOne"],
            ["ui","zeroOrOne"],
            ["border", "zeroOrOne"]  ,
            ["font", "zeroOrOne"]  ,
            ["para", "zeroOrOne"]  ,
            ["caption", "zeroOrOne"]  ,
            ["assist","zeroOrOne"],
            ["font", "zeroOrOne"],
            ["margin", "zeroOrOne"]
        ]);

        XfaTemplateSchema["exclGroup"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["access",xfalib.template.Constants.accessValues,0],
            ["h","measurement",0],
            ["w","measurement",0],
            ["x","measurement",0],
            ["y","measurement",0],
            ["relevant", "string", "" ],
            ["presence",xfalib.template.Constants.presenceValues,0],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["field","zeroOrMore"],
            ["assist","zeroOrOne"],
            ["border", "zeroOrOne"]  ,
            ["para", "zeroOrOne"]  ,
            ["caption", "zeroOrOne"]  ,
            ["validate","zeroOrOne"],
            ["margin", "zeroOrOne"]
        ]);

        XfaTemplateSchema["float"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""]
        ]);

        XfaTemplateSchema["integer"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""]
        ]);

        XfaTemplateSchema["items"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["save",xfalib.template.Constants.itemSaveValues,0],
            ["presence",xfalib.template.Constants.presenceValues,0],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["text","zeroOrMore"],
            ["integer","zeroOrMore"],
            ["date","zeroOrMore"],
            ["decimal","zeroOrMore"],
            ["float","zeroOrMore"]
        ]);

        XfaTemplateSchema["occur"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["initial","integer",1],
            ["max","integer",1],
            ["min","integer",1]
        ]);
        this.addChildren(elem, [
            ["extras","zeroOrOne"]
        ]);

        XfaTemplateSchema["pageArea"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["relevant", "string", "" ],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["occur","zeroOrOne"],
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["area","zeroOrMore"],
            ["field","zeroOrMore"],
            ["draw","zeroOrMore"],
            ["exclGroup","zeroOrMore"],
            ["instanceManager","zeroOrMore"],
            ["subform","zeroOrMore"],
            ["contentArea","zeroOrMore"]
        ]);



        XfaTemplateSchema["pageSet"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["relevant", "string", "" ],
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["occur","zeroOrOne"],
            ["extras","zeroOrOne"],
            ["pageArea","zeroOrMore"],
            ["pageSet","zeroOrMore"]
        ]);

        XfaTemplateSchema["subform"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["access",xfalib.template.Constants.accessValues,0],
            ["h","measurement",0],
            ["w","measurement",0],
            ["x","measurement",0],
            ["y","measurement",0],
            ["presence",xfalib.template.Constants.presenceValues,0],
            ["name","string",""],
            ["relevant", "string", "" ],
            ["locale","string","en_US"]
        ]);
        this.addChildren(elem, [
            ["occur","zeroOrOne"],
            ["extras","zeroOrOne"],
            ["desc","zeroOrOne"],
            ["pageSet","zeroOrOne"],
            ["variables","zeroOrOne"],
            ["area","zeroOrMore"],
            ["field","zeroOrMore"],
            ["draw","zeroOrMore"],
            ["exclGroup","zeroOrMore"],
            ["instanceManager","zeroOrMore"],
            ["subform","zeroOrMore"],
            ["assist","zeroOrOne"],
            ["border", "zeroOrOne"],
            ["para", "zeroOrOne"],
            ["validate","zeroOrOne"],
            ["subformSet","zeroOrMore"],
            ["bind","zeroOrOne"],
            ["margin", "zeroOrOne"]
        ]);

        XfaTemplateSchema["text"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""],
            ["maxChars","integer",0]
        ]);

        XfaTemplateSchema["exData"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""],
            ["maxLength","integer",-1],
            ["transferEncoding",xfalib.template.Constants.transferEncodingValues,0],
            ["contentType","string","text/plain"]
        ]);


        XfaTemplateSchema["extras"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""]
        ]);
        this.addChildren(elem, [
            ["text","zeroOrMore"],
            ["integer","zeroOrMore"],
            ["date","zeroOrMore"],
            ["decimal","zeroOrMore"],
            ["float","zeroOrMore"],
            ["value", "zeroOrOne"],
            ["extras","zeroOrMore"]
        ]);

        XfaTemplateSchema["desc"] = elem = this.createElement();
        this.addChildren(elem, [
            ["text","zeroOrMore"],
            ["integer","zeroOrMore"],
            ["date","zeroOrMore"],
            ["decimal","zeroOrMore"],
            ["float","zeroOrMore"]
        ]);

        XfaTemplateSchema["variables"] = elem = this.createElement();
        this.addChildren(elem, [
            ["boolean","zeroOrMore"],
            ["date","zeroOrMore"],
            ["dateTime","zeroOrMore"],
            ["decimal","zeroOrMore"],
            ["exData","zeroOrMore"],
            ["float","zeroOrMore"],
            ["image","zeroOrMore"],
            ["integer","zeroOrMore"],
            ["manifest","zeroOrMore"],
            ["script","zeroOrMore"],
            ["script","zeroOrMore"],
            ["time","zeroOrMore"]
        ]);


//------------------------------------------------------------------------------------------------------------------------------
        XfaTemplateSchema["para"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hAlign","string","left"],
            ["lineHeight","measurement","0pt"],
            ["marginLeft","measurement","0in"],
            ["marginRight","measurement","0in"],
            ["orphans","integer",0],
            ["preserve","string",""],
            ["radixOffset","measurement","0in"],
            ["spaceAbove","measurement","0in"],
            ["spaceBelow","measurement","0in"],
            ["tabDefault","string",""],
            ["tabStops","string",""],
            ["textIndent","measurement","0in"],
            ["vAlign","string","top"],
            ["widows","integer",0],
            ["wordSpacingMaximum","string",""],
            ["wordSpacingMinimum","string",""],
            ["wordSpacingOptimum","string",""]
        ]);

        XfaTemplateSchema["encryptData"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["operation", xfalib.template.Constants.encryptDataOperationValues, 0 ]  ,
            ["target", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["filter", "zeroOrOne"]  ,
            ["manifest", "zeroOrOne"]
        ]);


        XfaTemplateSchema["issuers"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["certificate", "zeroOrMore"]
        ]);


        XfaTemplateSchema["imageEdit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["data", xfalib.template.Constants.dataValues, 1 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["bookend"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["leader", "string", "" ]  ,
            ["trailer", "string", "" ]
        ]);


        XfaTemplateSchema["reason"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name","string",""]
        ]);


        XfaTemplateSchema["passwordEdit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hScrollPolicy", xfalib.template.Constants.hScrollPolicyValues, 0 ]  ,
            ["passwordChar", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["validate"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["disableAll", xfalib.template.Constants.disableAllValues, 0 ]  ,
            ["formatTest", xfalib.template.Constants.formatTestValues, 0 ]  ,
            ["nullTest", xfalib.template.Constants.nullTestValues, 0 ]  ,
            ["scriptTest", xfalib.template.Constants.scriptTestValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["message", "zeroOrOne"]  ,
            ["picture", "zeroOrOne"]  ,
            ["script", "zeroOrOne"]
        ]);


        XfaTemplateSchema["break"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["after", xfalib.template.Constants.afterValues, 0 ]  ,
            ["afterTarget", "string", "" ]  ,
            ["before", xfalib.template.Constants.beforeValues, 0 ]  ,
            ["beforeTarget", "string", "" ]  ,
            ["bookendLeader", "string", "" ]  ,
            ["bookendTrailer", "string", "" ]  ,
            ["overflowLeader", "string", "" ]  ,
            ["overflowTarget", "string", "" ]  ,
            ["overflowTrailer", "string", "" ]  ,
            ["startNew", xfalib.template.Constants.startNewValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["time"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["certificate"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["lockDocument"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);


        XfaTemplateSchema["arc"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["circular", xfalib.template.Constants.circularValues, 0 ]  ,
            ["hand", xfalib.template.Constants.handValues, 0 ]  ,
            ["startAngle", "string", "0" ]  ,
            ["sweepAngle", "string", "360" ]
        ]);
        this.addChildren(elem, [
            ["edge", "zeroOrOne"]  ,
            ["fill", "zeroOrOne"]
        ]);


        XfaTemplateSchema["button"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["highlight", xfalib.template.Constants.highlightValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["event"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["activity", xfalib.template.Constants.activityValues, 0 ]  ,
            ["listen", xfalib.template.Constants.listenValues, 0 ]  ,
            ["name", "string", "" ],
            ["ref", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["encryptData", "oneOfChild"]  ,
            ["execute", "oneOfChild"]  ,
            ["script", "oneOfChild"]  ,
            ["signData", "oneOfChild"]  ,
            ["submit", "oneOfChild"]
        ]);


        XfaTemplateSchema["boolean"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["margin"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["bottomInset", "measurement", "0in" ]  ,
            ["leftInset", "measurement", "0in" ]  ,
            ["rightInset", "measurement", "0in" ]  ,
            ["topInset", "measurement", "0in" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["border"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["break", xfalib.template.Constants.breakValues, 0 ]  ,
            ["hand", xfalib.template.Constants.handValues, 0 ]  ,
            ["presence", xfalib.template.Constants.presenceValues, 0 ]  ,
            ["relevant", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["corner", "zeroOrFour"]  ,
            ["edge", "zeroOrFour"]  ,
            ["extras", "zeroOrOne"]  ,
            ["fill", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["breakAfter"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["leader", "string", "" ]  ,
            ["startNew", xfalib.template.Constants.startNewValues, 0 ]  ,
            ["target", "string", "" ]  ,
            ["targetType", xfalib.template.Constants.targetTypeValues, 0 ]  ,
            ["trailer", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["script", "zeroOrOne"]
        ]);


        XfaTemplateSchema["signature"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.signTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["filter", "zeroOrOne"]  ,
            ["manifest", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["signData"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["operation", xfalib.template.Constants.signDataOperationValues, 0 ]  ,
            ["ref", "string", "" ]  ,
            ["target", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["filter", "zeroOrOne"]  ,
            ["manifest", "zeroOrOne"]
        ]);


        XfaTemplateSchema["image"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["aspect", xfalib.template.Constants.aspectValues, 0 ]  ,
            ["contentType", "string", "" ]  ,
            ["href", "string", "" ]  ,
            ["name", "string", "" ]  ,
            ["transferEncoding", xfalib.template.Constants.transferEncodingValues, 2 ]
        ]);


        XfaTemplateSchema["oids"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["oid", "zeroOrMore"]
        ]);


        XfaTemplateSchema["solid"] = elem = this.createElement();
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["manifest"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["action", xfalib.template.Constants.manifestActionValues, 0 ],
            ["name", "string", "2" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["ref", "zeroOrMore"]
        ]);



        XfaTemplateSchema["traverse"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["delegate", xfalib.template.Constants.traverseDelegateValues, 0 ]  ,
            ["operation", xfalib.template.Constants.traverseOperationValues, 0 ]  ,
            ["ref", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["script", "zeroOrOne"]
        ]);


        XfaTemplateSchema["line"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hand", xfalib.template.Constants.handValues, 0 ]  ,
            ["slope", xfalib.template.Constants.slopeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["edge", "zeroOrOne"]
        ]);


        XfaTemplateSchema["digestMethods"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["digestMethod", "zeroOrMore"]
        ]);


        XfaTemplateSchema["reasons"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["reason", "zeroOrMore"]
        ]);


        XfaTemplateSchema["defaultUi"] = elem = this.createElement();
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["hyphenation"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["excludeAllCaps", xfalib.template.Constants.excludeAllCapsValues, 0 ]  ,
            ["excludeInitialCap", xfalib.template.Constants.excludeInitialCapValues, 0 ]  ,
            ["hyphenate", xfalib.template.Constants.hyphenateValues, 0 ]  ,
            ["ladderCount", "integer", 2 ]  ,
            ["pushCharacterCount", "integer", 3 ]  ,
            ["remainCharacterCount", "integer", 3 ]  ,
            ["wordCharacterCount", "integer", 7 ]
        ]);


        XfaTemplateSchema["rectangle"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hand", xfalib.template.Constants.handValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["corner", "zeroOrFour"]  ,
            ["edge", "zeroOrFour"]  ,
            ["fill", "zeroOrOne"]
        ]);


        XfaTemplateSchema["encryptionMethod"] = elem = this.createElement();


        XfaTemplateSchema["checkButton"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["allowNeutral", xfalib.template.Constants.allowNeutralValues, 0 ]  ,
            ["mark", xfalib.template.Constants.markValues, 0 ]  ,
            ["shape", xfalib.template.Constants.shapeValues, 0 ]  ,
            ["size", "string", "10pt" ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["choiceList"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["commitOn", xfalib.template.Constants.commitOnValues, 0 ]  ,
            ["open", xfalib.template.Constants.openValues, 0 ]  ,
            ["textEntry", xfalib.template.Constants.textEntryValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["oid"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["encoding"] = elem = this.createElement();


        XfaTemplateSchema["ui"] = elem = this.createElement();
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["picture", "zeroOrOne"]  ,
            ["barcode", "oneOfChild"]  ,
            ["button", "oneOfChild"]  ,
            ["checkButton", "oneOfChild"]  ,
            ["choiceList", "oneOfChild"]  ,
            ["dateTimeEdit", "oneOfChild"]  ,
            ["defaultUi", "oneOfChild"]  ,
            ["exObject", "oneOfChild"]  ,
            ["imageEdit", "oneOfChild"]  ,
            ["numericEdit", "oneOfChild"]  ,
            ["passwordEdit", "oneOfChild"]  ,
            ["signature", "oneOfChild"]  ,
            ["textEdit", "oneOfChild"]
        ]);


        XfaTemplateSchema["linear"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.linearTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["edge"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["cap", xfalib.template.Constants.edgeCapValues, 0 ]  ,
            ["presence", xfalib.template.Constants.presenceValues, 0 ]  ,
            ["stroke", xfalib.template.Constants.strokeValues, 0 ]  ,
            ["thickness", "string", "0.5pt" ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["corner"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["inverted", xfalib.template.Constants.cornerInvertedValues, 0 ]  ,
            ["join", xfalib.template.Constants.cornerJoinValues, 0 ]  ,
            ["presence", xfalib.template.Constants.presenceValues, 0 ]  ,
            ["radius", "string", "0in" ]  ,
            ["stroke", xfalib.template.Constants.strokeValues, 0 ]  ,
            ["thickness", "string", "0.05pt" ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["toolTip"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["rid", "string", "" ]
        ]);


        XfaTemplateSchema["speak"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["disable", xfalib.template.Constants.speakDisableValues, 0 ]  ,
            ["priority", xfalib.template.Constants.speakPriorityValues, 0 ]  ,
            ["rid", "string", "" ]
        ]);


        XfaTemplateSchema["caption"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["placement", xfalib.template.Constants.captionPlacementValues, 0 ]  ,
            ["presence", xfalib.template.Constants.presenceValues, 0 ]  ,
            ["reserve", "string", "-1" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["font", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]  ,
            ["para", "zeroOrOne"]  ,
            ["value", "zeroOrOne"]
        ]);


        XfaTemplateSchema["comb"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["numberOfCells", "integer", 0 ]
        ]);


        XfaTemplateSchema["medium"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["imagingBBox", "string", "" ]  ,
            ["long", "string", "0in" ]  ,
            ["orientation", xfalib.template.Constants.orientationValues, 0 ]  ,
            ["short", "string", "0in" ]  ,
            ["stock", "string", "" ]  ,
            ["trayIn", xfalib.template.Constants.mediumTrayInValues, 0 ]  ,
            ["trayOut", xfalib.template.Constants.mediumTrayOutValues, 0 ]
        ]);


        XfaTemplateSchema["ref"] = elem = this.createElement();


        XfaTemplateSchema["pattern"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.patternTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["keep"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["intact", xfalib.template.Constants.keepIntactValues, 0 ]  ,
            ["next", xfalib.template.Constants.keepNextValues, 0 ]  ,
            ["previous", xfalib.template.Constants.keepPreviousValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["digestMethod"] = elem = this.createElement();


        XfaTemplateSchema["signing"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["certificate", "zeroOrMore"]
        ]);


        XfaTemplateSchema["encryption"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["certificate", "zeroOrMore"]
        ]);


        XfaTemplateSchema["subjectDNs"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["subjectDN", "zeroOrMore"]
        ]);


        XfaTemplateSchema["encrypt"] = elem = this.createElement();
        this.addChildren(elem, [
            ["certificate", "zeroOrOne"]
        ]);


        XfaTemplateSchema["value"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["override", xfalib.template.Constants.valueOverrideValues, 0 ]  ,
            ["relevant", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["arc", "oneOfChild"]  ,
            ["boolean", "oneOfChild"]  ,
            ["date", "oneOfChild"]  ,
            ["dateTime", "oneOfChild"]  ,
            ["decimal", "oneOfChild"]  ,
            ["exData", "oneOfChild"]  ,
            ["float", "oneOfChild"]  ,
            ["image", "oneOfChild"]  ,
            ["integer", "oneOfChild"]  ,
            ["line", "oneOfChild"]  ,
            ["rectangle", "oneOfChild"]  ,
            ["text", "oneOfChild"]  ,
            ["time", "oneOfChild"]
        ]);


        XfaTemplateSchema["traversal"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["passThrough", xfalib.template.Constants.passThroughValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["traverse", "zeroOrMore"]
        ]);


        XfaTemplateSchema["textEdit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["allowRichText", xfalib.template.Constants.allowRichTextValues, 0 ]  ,
            ["hScrollPolicy", xfalib.template.Constants.hScrollPolicyValues, 0 ]  ,
            ["multiLine", xfalib.template.Constants.multiLineValues, 1 ]  ,
            ["vScrollPolicy", xfalib.template.Constants.vScrollPolicyValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["comb", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["stipple"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["rate", "integer", 50 ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["font"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["baselineShift", "string", "0in" ]  ,
            ["fontHorizontalScale", "string", "" ]  ,
            ["fontVerticalScale", "string", "" ]  ,
            ["kerningMode", xfalib.template.Constants.kerningModeValues, 0 ]  ,
            ["letterSpacing", "string", "" ]  ,
            ["lineThrough", xfalib.template.Constants.lineThroughValues, 0 ]  ,
            ["lineThroughPeriod", xfalib.template.Constants.lineThroughPeriodValues, 0 ]  ,
            ["overline", xfalib.template.Constants.fontOverlineValues, 0 ]  ,
            ["overlinePeriod", xfalib.template.Constants.fontOverlinePeriodValues, 0 ]  ,
            ["posture", xfalib.template.Constants.postureValues, 0 ]  ,
            ["size", "string", "10pt" ]  ,
            ["typeface", "string", "" ]  ,
            ["underline", xfalib.template.Constants.underlineValues, 0 ]  ,
            ["underlinePeriod", xfalib.template.Constants.underlinePeriodValues, 0 ]  ,
            ["weight", xfalib.template.Constants.fontWeightValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["fill", "zeroOrOne"]
        ]);


        XfaTemplateSchema["barcode"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["charEncoding", "string", "" ]  ,
            ["checksum", xfalib.template.Constants.checksumValues, 0 ]  ,
            ["dataColumnCount", "string", "" ]  ,
            ["dataLength", "string", "" ]  ,
            ["dataPrep", xfalib.template.Constants.dataPrepValues, 0 ]  ,
            ["dataRowCount", "string", "" ]  ,
            ["endChar", "string", "" ]  ,
            ["errorCorrectionLevel", "string", "" ]  ,
            ["moduleHeight", "string", "5mm" ]  ,
            ["moduleWidth", "string", "0.25mm" ]  ,
            ["printCheckDigit", xfalib.template.Constants.printCheckDigitValues, 0 ]  ,
            ["rowColumnRatio", "string", "" ]  ,
            ["startChar", "string", "" ]  ,
            ["textLocation", xfalib.template.Constants.textLocationValues, 0 ]  ,
            ["truncate", xfalib.template.Constants.truncateValues, 0 ]  ,
            ["type", "string", "" ]  ,
            ["upsMode", xfalib.template.Constants.upsModeValues, 0 ]  ,
            ["wideNarrowRatio", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["encrypt", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["assist"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["role", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["speak", "zeroOrOne"]  ,
            ["toolTip", "zeroOrOne"]
        ]);


        XfaTemplateSchema["breakBefore"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["leader", "string", "" ]  ,
            ["startNew", xfalib.template.Constants.startNewValues, 0 ]  ,
            ["target", "string", "" ]  ,
            ["targetType", xfalib.template.Constants.targetTypeValues, 0 ]  ,
            ["trailer", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["script", "zeroOrOne"]
        ]);


        XfaTemplateSchema["format"] = elem = this.createElement();
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["picture", "zeroOrOne"]
        ]);


        XfaTemplateSchema["keyUsage"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["crlSign", "string", "" ]  ,
            ["dataEncipherment", "string", "" ]  ,
            ["decipherOnly", "string", "" ]  ,
            ["digitalSignature", "string", "" ]  ,
            ["encipherOnly", "string", "" ]  ,
            ["keyAgreement", "string", "" ]  ,
            ["keyCertSign", "string", "" ]  ,
            ["keyEncipherment", "string", "" ]  ,
            ["nonRepudiation", "string", "" ]  ,
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);



        XfaTemplateSchema["picture"] = elem = this.createElement();

        XfaTemplateSchema["mdp"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["permissions", xfalib.template.Constants.mdpPermissionsValues, 0 ]  ,
            ["signatureType", xfalib.template.Constants.mdpSignatureTypeValues, 0 ]
        ]);


        XfaTemplateSchema["overflow"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["leader", "string", "" ]  ,
            ["target", "string", "" ]  ,
            ["trailer", "string", "" ]
        ]);


        XfaTemplateSchema["numericEdit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hScrollPolicy", xfalib.template.Constants.hScrollPolicyValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["comb", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["appearanceFilter"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);


        XfaTemplateSchema["filter"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["addRevocationInfo", "string", "" ]  ,
            ["name", "string", "" ],
            ["version", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["appearanceFilter", "zeroOrOne"]  ,
            ["certificates", "zeroOrOne"]  ,
            ["digestMethods", "zeroOrOne"]  ,
            ["encodings", "zeroOrOne"]  ,
            ["encryptionMethods", "zeroOrOne"]  ,
            ["handler", "zeroOrOne"]  ,
            ["lockDocument", "zeroOrOne"]  ,
            ["mdp", "zeroOrOne"]  ,
            ["reasons", "zeroOrOne"]  ,
            ["timeStamp", "zeroOrOne"]
        ]);


        XfaTemplateSchema["renderAs"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["APIVersion", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["svg", "zeroOrOne"]
        ]);


        XfaTemplateSchema["timeStamp"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["server", "string", "" ]  ,
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);


        XfaTemplateSchema["connect"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["connection", "string", "" ]  ,
            ["ref", "string", "" ]  ,
            ["usage", xfalib.template.Constants.connectUsageValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["picture", "zeroOrOne"]
        ]);


        XfaTemplateSchema["dateTime"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["bindItems"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["connection", "string", "" ]  ,
            ["labelRef", "string", "" ]  ,
            ["ref", "string", "" ]  ,
            ["valueRef", "string", "" ]
        ]);


        XfaTemplateSchema["encodings"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["encoding", "zeroOrMore"]
        ]);


        XfaTemplateSchema["radial"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.radialTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["certificates"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["credentialServerPolicy", xfalib.template.Constants.credentialServerPolicyValues, 0 ]  ,
            ["url", "string", "" ]  ,
            ["urlPolicy", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["encryption", "zeroOrOne"]  ,
            ["issuers", "zeroOrOne"]  ,
            ["keyUsage", "zeroOrOne"]  ,
            ["oids", "zeroOrOne"]  ,
            ["signing", "zeroOrOne"]  ,
            ["subjectDNs", "zeroOrOne"]
        ]);


        XfaTemplateSchema["svg"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["height", "string", "" ]  ,
            ["viewBox", "string", "" ]  ,
            ["width", "string", "" ]
        ]);


        XfaTemplateSchema["fill"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["presence", xfalib.template.Constants.presenceValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["color", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["linear", "oneOfChild"]  ,
            ["pattern", "oneOfChild"]  ,
            ["radial", "oneOfChild"]  ,
            ["solid", "oneOfChild"]  ,
            ["stipple", "oneOfChild"]
        ]);


        XfaTemplateSchema["setProperty"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["connection", "string", "" ]  ,
            ["ref", "string", "" ]  ,
            ["target", "string", "" ]
        ]);


        XfaTemplateSchema["encryptionMethods"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["encryptionMethod", "zeroOrMore"]
        ]);


        XfaTemplateSchema["dateTimeEdit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["hScrollPolicy", xfalib.template.Constants.hScrollPolicyValues, 0 ]  ,
            ["picker", xfalib.template.Constants.dateTimeEditPickerValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["border", "zeroOrOne"]  ,
            ["comb", "zeroOrOne"]  ,
            ["extras", "zeroOrOne"]  ,
            ["margin", "zeroOrOne"]
        ]);


        XfaTemplateSchema["message"] = elem = this.createElement();
        this.addChildren(elem, [
            ["text", "zeroOrMore"]
        ]);


        XfaTemplateSchema["color"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["cSpace", "string", "SRGB" ]  ,
            ["value", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]
        ]);


        XfaTemplateSchema["subjectDN"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["delimiter", "string", "" ],
            ["name", "string", "" ]
        ]);


        XfaTemplateSchema["bind"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["match", xfalib.template.Constants.bindMatchValues, 0 ]  ,
            ["ref", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["picture", "zeroOrOne"]
        ]);


        XfaTemplateSchema["handler"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["type", xfalib.template.Constants.requiredTypeValues, 0 ]
        ]);


        XfaTemplateSchema["occur"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["initial", "integer", 1 ]  ,
            ["max", "integer", 1 ]  ,
            ["min", "integer", 1 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["script", "zeroOrOne"]
        ]);

        XfaTemplateSchema["script"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["binding", "string", "" ]  ,
            ["contentType", "string", "" ]  ,
            ["name", "string", "" ],
            ["runAt", xfalib.template.Constants.runAtValues, 0 ]  ,
            ["stateless", xfalib.template.Constants.statelessValues, 0 ]
        ]);

        XfaTemplateSchema["execute"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["connection", "string", "" ]  ,
            ["executeType", xfalib.template.Constants.executeTypeValues, 0 ]  ,
            ["runAt", xfalib.template.Constants.runAtValues, 0 ]
        ]);

        XfaTemplateSchema["calculate"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["override", xfalib.template.Constants.calcOverrideValues, 0 ]
        ]);
        this.addChildren(elem, [
            ["extras", "zeroOrOne"]  ,
            ["message", "zeroOrOne"]  ,
            ["script", "zeroOrOne"]
        ]);

        XfaTemplateSchema["submit"] = elem = this.createElement();
        this.addAttributes(elem,[
            ["embedPDF", xfalib.template.Constants.embedPDFValues, 0 ]  ,
            ["format", xfalib.template.Constants.submitFormatValues, 0 ]  ,
            ["target", "string", "" ]  ,
            ["textEncoding", "string", "" ]  ,
            ["xdpContent", "string", "" ]
        ]);
        this.addChildren(elem, [
            ["encrypt", "zeroOrOne"]  ,
            ["encryptData", "zeroOrMore"]  ,
            ["signData", "zeroOrMore"]
        ]);

    },

    addAttributes: function(element,attrArray) {
        _.each(attrArray, function(elem) {
            element.attributes[elem[0]] = {
                                        type:elem[1],
                                        "default":elem[2]
                                       }
        });
    },

    addChildren: function(element,childrenArray) {
        _.each(childrenArray, function(elem) {
            element.children[elem[0]] = {
                relation : xfalib.template.Constants[elem[1]]
            };
        });
    },

    createElement: function() {
        return {attributes: {},children: {}};
    },

    getDefaultAttribute: function(element,attribute) {
        var elem =  XfaTemplateSchema[element];
        if(!elem)
            return "";
        var attr = elem.attributes[attribute];
        if(!attr)
            return undefined;
        if(attr.type instanceof Array) {
            return attr.type[attr["default"]];
        } else
            return attr["default"];
    },

    hasAttribute: function (element, attribute) {
        var elem = XfaTemplateSchema[element];
        if (!elem) {
            return false;
        }
        return _.has(elem.attributes, attribute);
    },

    getChildren : function(element){
        if(XfaTemplateSchema[element])
            return XfaTemplateSchema[element].children;
        else
            return null;
    },

    _getRelation: function(parent,child) {
       var p = XfaTemplateSchema[parent];
       if(!p)
          return null;
       var c = p.children[child]
       if(c)
           return c.relation;
       return null;
    },

    _getDataType: function(element,attribute) {
        var attr =  XfaTemplateSchema[element].attributes[attribute];
        return attr.type;
    },

    _getOneOfChild: function(element) {
        var res = {};
        _.each(XfaTemplateSchema[element].children,
            function(obj,clas) {
                if(obj.relation.type == "oneOfChild")
                    res[clas] = true
            });
        return res;
    }

});
})(_, xfalib);
/**
 * @package xfalib.ut.Version
 * @import xfalib.ut.Class
 */

(function(_, xfalib){
    var Version = xfalib.ut.Version = xfalib.ut.Class.extend({

        ES4: 1100,
        ES4SP1: 1101,
        P9A: 1102, //added new version for P9A -> not being used but still if we need someday

        current: function() {
            return this.P9A;
        },

        initialize : function(options){
            Version._super.initialize.call(this);
            this._originalVersion = options != null ? options.originalVersion : this.current();
            this._override = options ? options.override : {} ;
            if(!this._override) {
                this._override = {};
            }
        },


        isSame : function(v) {
            return (this._originalVersion == v);
        },

        isAfter: function(v) {
            return (this._originalVersion > v);
        },

        isAfterOrSame : function(v) {
            return this.isAfter(v) || this.isSame(v);
        },

        isPrevious: function(v) {
            return (this._originalVersion < v);
        },

        isPreviousOrSame : function(v) {
            return this.isPrevious(v) || this.isSame(v);
        },

        isOn : function(flag) {
            //function to control if a particular flag is on
            //since it might dependent on version so it is in Version class
           return(this._override[flag]);
        }

    });
})(_, xfalib);
(function(_,xfalib){
    xfalib.script.mixin.AddAssist = {
        propertyDescriptors : {
            "assist" : {
                get : function() {
                    return this.getElement("assist", 0);
                },

                set : function(value) {
                    return this.setElement(value, "assist");
                }
            }
        }
    }
})(_, xfalib);


(function(_,xfalib){
    xfalib.script.mixin.AddBorder = {
        propertyDescriptors : {
            "border" : {
                get : function() {
                    return this.getElement("border", 0);
                },

                set : function(value) {
                    return this.setElement(value, "border");
                }
            }
        }
    }
})(_, xfalib);


(function(_,xfalib){
    xfalib.script.mixin.AddCaption = {
        propertyDescriptors : {
            "caption" : {
                get : function() {
                    return this.getElement("caption", 0);
                },

                set : function(value) {
                    return this.setElement(value, "caption");
                }
            }
        }
    }
})(_, xfalib);


(function(_,xfalib){
    xfalib.script.mixin.AddPresence = {
        propertyDescriptors : {
            "presence" : {
                get : function() {
                    //Avoided getAttribute call to avoid any regression in case something is missing in Template Schema
                    return this.getOrElse(this.jsonModel.presence, xfalib.script.Node.prototype._defaults.presence);
                },
                set : function(sPresence) {
                    var oldPresence = this.jsonModel.presence;
                    this.setAttribute(sPresence, "presence");
                    if (this.jsonModel.presence != oldPresence) {
                        var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                            this,"presence",oldPresence,this.jsonModel.presence);
                        this.trigger(evnt.name,evnt);
                    }
                }
            }
        }
    }
})(_,xfalib);

(function(_,xfalib){
    xfalib.script.mixin.AddXYWH = {
        propertyDescriptors : {
            "h" : {
                get : function() {
                    return this.getOrElse(this.jsonModel.h, xfalib.script.Node.prototype._defaults.h);
                },
                set : function(value) {
                    this.setAttribute(value,"h");
                    var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                               this,"h",value, value);
                    this.trigger(event.name,event);
                }
            },

            "w" : {
                get : function() {
                    return this.getOrElse(this.jsonModel.w, xfalib.script.Node.prototype._defaults.w);
                },
                set : function() {

                }
            },

            "x" : {
                get : function() {
                    return this.getOrElse(this.jsonModel.x, xfalib.script.Node.prototype._defaults.x);
                },
                set : function() {

                }
            },

            "y" : {
                get : function() {
                    return this.getOrElse(this.jsonModel.y, xfalib.script.Node.prototype._defaults.y);
                },
                set : function() {

                }
            }
        }
    }
})(_,xfalib);

(function(_,xfalib){
    xfalib.script.mixin.AddFillColor = {
        propertyDescriptors : {
            "fillColor" : {
                get : function() {
                   return (this.border.fill.color.value == "") ? "255,255,255" : this.border.fill.color.value;
                },

                set : function(color) {
                    if(this.border && this.border.fill && this.border.fill.color) {
                        this.border.fill.presence="visible";
                        this.border.fill.color.value = color;
                    }
                }
            }
        }
    }
})(_,xfalib);
(function(_,xfalib){
    xfalib.script.mixin.AddBorderColor = {
        propertyDescriptors : {
            "borderColor" : {
                get : function() {
                    return this.border.edge.color.value;
                },

                set : function(color) {
                    //TODO: Set border.edge.presence property to visible once Border is implemented
                    this.border.edge.color.value = color ;
                }
            }
        }
    }
})(_, xfalib);

(function(_,xfalib){
    xfalib.script.mixin.AddBorderWidth = {
        propertyDescriptors : {
            "borderWidth" : {
                get : function() {
                    return this.border.edge.thickness;
                },
                set : function(value) {
                    this.border.edge.thickness = value ;
                }
            }
        }
    }
})(_, xfalib);(function(_,xfalib){
    xfalib.script.mixin.AddPara = {
        propertyDescriptors : {
            "para" : {
                get : function() {
                    return this.getElement("para", 0);
                },

                set : function(value) {
                    return this.setElement(value, "para");
                }
            }
        }
    }
})(_, xfalib);


(function(_,xfalib){
    xfalib.script.mixin.AddMargin = {
        propertyDescriptors : {
            "margin" : {
                get : function() {
                    return this.getElement("margin", 0);
                },

                set : function(value) {
                    return this.setElement(value, "margin");
                }
            }
        }
    }
})(_, xfalib);


/**
 * @package xfalib.script.Object
 * @import xfalib.ut.EventClass
 * @fileOverview The file creates the Object Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new class
     * @class Base XFA class. All the other classes are a subclass of this.
     * @constructor
     * @property {string} className represents the name of the class for this object
     */
    var xfaObject = xfalib.script.Object = xfalib.ut.EventClass.extend({
        msClassName : "object",
        initialize : function(){
            //For perf reason, we are computing className at intialize time instead of accessing it via propertyDescriptor
            this.className = this.jsonModel._class || this.msClassName;
        }
    });

})(_, xfalib);
/**
 * @package xfalib.script.XfaList
 * @import xfalib.ut.Class
 */

(function(_, xfalib){
    var XfaList = xfalib.script.XfaList = xfalib.ut.Class.extend({

        initialize : function() {
            XfaList._super.initialize.call(this);
            this.currentIndex = -1;
            this.moArraylist =  new Array();
            this.mParent = this.options.parent;
        },

        item : function(nIndex) {
            if(nIndex <= this.currentIndex)
                return this.moArraylist[nIndex];
            return null;
        },

        _append : function(oParam) {
            this.moArraylist[++this.currentIndex] = oParam;
        },

        append : function(oParam) {
            if(this.mParent && this.mParent instanceof xfalib.script.DOMElement)   {
                var relation = this.mParent._xfa()._templateSchema._getRelation(this.mParent.className,oParam.className);
                switch(relation.type)
                 {
                 case "zeroOrOne":
                 break;
                 case "zeroOrTwo":
                 break;
                 case "zeroOrMore":
                this.mParent._addChild(oParam);
                break;
                 default:

                 }

            }
            this._append(oParam);
        },

        remove : function(oParam) {
            var index = this.moArraylist.indexOf(oParam);
            if(index >= 0) {
                this.moArraylist.splice(index,1);
                this.currentIndex--;
            }
        },

        insert : function(oInsert,oBefore) {
            var index = this.moArraylist.indexOf(oBefore);
            this.currentIndex++;
            if(index <= 0)
                index = this.currentIndex;
            this.moArraylist.splice(index,0,oInsert);
        },

        _concat : function(oList) {
            if(oList == null)
                return;
            for(var i =0; i< oList.length;i++) {
                this._append(oList.item(i));
            }
        },

        namedItem : function(oParam){
            var node = this._find(function(obj) {
                return obj.getAttribute("name") === oParam;
            });
            if(node === undefined) return null;
            return node;
        },

        _find : function(fn) {
            return _.find(this.moArraylist,fn);
        },

        _filter : function(fn) {
            return _.filter(this.moArraylist,fn);
        }
    });

    XfaList.defineProps({
        "length" : {
            get : function() {
                return this.moArraylist.length;
            }
        }
    });
})(_, xfalib);

/**
 * @package xfalib.script.SOMExpression
 * @import xfalib.ut.Class
 */
 
(function(_, xfalib){
    var SOMExpression = xfalib.script.SOMExpression = xfalib.ut.Class.extend({
        initialize : function() {
            SOMExpression._super.initialize.call(this);
            // Format: subformA[n|*]
            // Format: subformA[n|*].[predicate expr]
            // Format: subformA.[predicate expr]
            // predicate expr: boolean expression that may include object references and
            // SOMExpressions

            this._expr = this.options.expression;
            this.scalerMatch = null;
            this.predicate = null;
            this.name = this.options.expression;
            this.index = this.options.defaultOccurrence;
            this._bDefaultIndex = true;
            this._matchCount = 0;

            var arr = this._parseExpression(this.options.expression);
            if (arr == null)
                return;

            if (arr.length == 1)
                this.name = arr[0];
            else if (arr.length == 2) {
                this.name = arr[0];
                if (arr[1] != '') {
                    // Strip brackets
                    var occ = arr[1].substring(1, arr[1].length - 1);
                    if (occ == '*')
                        this.index = '*';
                    else
                        this.index = parseInt(occ);

                    this._bDefaultIndex = false;
                }
            } else if (arr.length == 3) {
                this.name = arr[0];
                if (this.options.ignorePredicate == false) {
                    // Strip brackets
                    this.predicate = arr[2].substring(1, arr[2].length - 1);
                    this.index = '*';
                }
            }
        },

        equals : function(obj) {
          return this.namesEqual(obj) || this.classesEqual(obj);
        },

        evalPredicate : function (obj) {
            // Default: true, indicating obj passes pred expr qualification
            var bPredicateResult = true;

            //TODO: Implement later
            /*
             if (this.predicate != null && obj != null)
             {
             var parser:KParser = new KParser();
             var result:Object = parser.evaluateExpression (this.predicate, obj);
             if (result is Boolean)
             {
             trace ("evalPredicate() on: " + this.predicate + ", result: " + result);
             bPredicateResult = result;
             }
             }
             */
            return bPredicateResult;
        },

        namesEqual : function(obj) {
            if (this.name == obj.getAttribute("name")){
                var bPredResult = this.evalPredicate(obj);

                if (((this.index == '*') || (this.index == obj.index)) && bPredResult == true)
                    return true;

                //
                // If the SOM expression does not have a specific index
                // record a name match with the obj with the lowest index
                //
                if (this._bDefaultIndex && bPredResult)
                {
                    if ((this.scalerMatch == null) || (obj.index < this.scalerMatch.index))
                        this.scalerMatch = obj;
                }
            }
            return false;
        },

        classesEqual : function ( obj){
            var bRet = false;
            var bPredResult = this.evalPredicate(obj);

            if (this.name == "#"+obj.className){
                if (this.index == '*' && bPredResult == true){
                    bRet = true;
                }
                else{
                    if (this.index == obj.mnClassIndex && bPredResult == true)
                        bRet = true;
                    else
                        bRet = false;
                }
            }
            return bRet;
        },

        tagEquals : function (obj) {
            var parent = obj.parent;
            var max;
            if(parent) {
                try {
                    var relation = parent._getRelation(obj);
                    if(relation)
                        max = relation.max;
                }
                catch(e) {
                    this._xfa().Logger.debug("xfa", "incomplete schema.");
                }
            }
            //if this obj is the only possible child of its type then ignore class index.
            return this.name == obj.className && (max == 1 || this.index =='*' || this.index == obj.mnClassIndex)
        },

        _parseExpression : function(sSomExpression) {
            if (sSomExpression == null) {
                return null;
            }

            var arr = [];
            var buf = "";
            var inBrace = 0;
            var bEscape = false;
            for ( var j = 0; j < sSomExpression.length; j++) {
                var s = sSomExpression.charAt(j);
                if (s == "[" && !inBrace) {
                    inBrace++;
                    arr.push(buf);
                    buf = "";
                }
                if (s == "[" && inBrace) {
                    inBrace++;
                    buf += s;
                } else if (s == "]" && inBrace) {
                    --inBrace;
                    buf += s;
                } else if (s == "\\") {
                    bEscape = true;
                } else if (s == "." && !inBrace && !bEscape) {
                    arr.push(buf);
                    buf = "";
                } else {
                    buf += s;
                    bEscape = false;
                }

                if (j == sSomExpression.length - 1)
                    arr.push(buf);
            }
            return arr;
        },

        splitExpression : function(sSomExpression) {
            if (sSomExpression == null)
                return null;

            var arr = [];
            var buf = "";
            var inBrace = 0;
            var bEscape = false;
            for ( var j = 0; j < sSomExpression.length; j++) {
                var s = sSomExpression.charAt(j);
                if (s == "[") {
                    inBrace++;
                    buf += s;
                } else if (s == "]") {
                    --inBrace;
                    buf += s;
                } else if (s == "\\") {
                    bEscape = true;
                    buf += s;
                } else if (s == "." && inBrace == 0 && bEscape == false) {
                    if (buf.length == 0)
                        arr.push(".."); // elipsis
                    else {
                        if (buf.indexOf("#variables") < 0) {
                            arr.push(buf);
                        }
                    }
                    buf = "";
                } else {
                    buf += s;
                    bEscape = false;
                }

                if (j == sSomExpression.length - 1) {
                    if (buf.indexOf("#variables") < 0) {
                        arr.push(buf);
                    }
                }
            }

            if (arr.length == 1)
                return arr;

            var out = [];
            var pattern = /^\[.*\]/;
            for ( var i = 0; i < arr.length; i++) {
                var seg = String(arr[i]);
                if (seg.match(pattern) && i > 0)
                    out.splice(i - 1, 1, arr[i - 1] + "." + seg);
                else
                    out.push(arr[i]);
            }
            return out;
        }

    });

    SOMExpression.defineProps({
        "expression" : {
            get : function() {
                return this._expr;
            },
            set : function(expression) {            	
            	expression = this.validateInput(expression,"string");
                this._expr = expression;
            }
        }
    });

})(_, xfalib);



/**
 * @package xfalib.script.XfaModelEvent
 * @import xfalib.script.Object
 * @fileOverview The file creates the XfaModelEvent Class required for XFA library
 * @version 0.0.1
 */
(function(_,xfalib) {

    var XfaModelEvent = xfalib.script.XfaModelEvent = xfalib.script.Object.extend({
        msClassName: "eventPseudoModel"
    });

    XfaModelEvent.defineProps({
        "prevText" : {
            get : function(){
                return this.jsonModel.prevText;
            }
        },
        "newText" : {
            get : function(){
                return this.jsonModel.newText;
            }
        },
        "fullText": {
            get: function () {
                return this.jsonModel.fullText;
            }
        },
        "name" : {
            get : function(){
                return this.jsonModel.name;
            }
        },
        "keyDown" : {
            get : function(){
                return this.jsonModel.keyDown;
            }
        },
        "modifier" : {
            get : function(){
                return this.jsonModel.modifier;
            }
        },
        "target" : {
            get : function(){
                return this.jsonModel.target;
            }
        },
        "shift" : {
            get : function(){
                return this.jsonModel.shift;
            }
        },
        "change" : {
            get : function(){
                return this.jsonModel.change;
            },
            set : function(value){
                this.jsonModel.change = value;
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,this.target,
                    'change',value,null);
                this.target.trigger(evnt.name,evnt);
            }
        },
        "_property" : {
            get : function(){
                return this.jsonModel._property;
            },

            set : function(value){
                this.jsonModel._property = value;
            }
        }
    });

    XfaModelEvent.createEvent = function(nm,tgt,prop,oldVal,newVal) {
        var evnt = {
            name:nm,
            target:tgt,
            _property:prop,
            prevText:oldVal,
            newText:newVal
        };
        return new XfaModelEvent({"jsonModel" : evnt});
    };

    XfaModelEvent.FORM_MODEL_CHANGED = "formModelChanged";
    XfaModelEvent.RAW_VALUE_CHANGED = "rawValueChanged";
    XfaModelEvent.CHILD_ADDED = "childAdded";
    XfaModelEvent.CHILD_REMOVED = "childRemoved";
    XfaModelEvent.CHILD_MOVED = "childMoved";
    XfaModelEvent.OBJECT_DESTROYED = "objectDestroyed";
    XfaModelEvent.FORM_MODEL_REFRESH = "formModelRefresh";
    XfaModelEvent.DOM_CHANGED = "domChanged";
})(_,xfalib);
/**
 * @package xfalib.script.Layout
 * @import xfalib.script.Class
 */

(function(_, xfalib){
    var Layout = xfalib.script.Layout = xfalib.ut.Class.extend({
        initialize : function(){
            this.pagingManager = null ;
            Layout._super.initialize.call(this);

        },

        _xfa : function() {
            return xfalib.script.Xfa.Instance;
        },

        relayout: function() {
        },

        page: function(node){
            return this.pagingManager.findPage(node.htmlId) + 1;
        },

        pageCount: function() {
            if(this.pagingManager)
                return(this.pagingManager.pageCount());
        },

        absPageCount: function() {
            if(this.pagingManager)
                return(this.pagingManager.pageCount());
        },

        pageContent : function(pageNum, className, bPageArea){
            if(this.pagingManager){
                return this.pagingManager._pageContent(pageNum, className, bPageArea);
            }
            else
                return new xfalib.script.XfaList();
        },

        px2pt: function(px) {
            return px/2;
        },

        pt2inch: function(pt) {
            return pt/72;
        },

        pt2mm: function(pt) {
            return (pt*25.4)/72;
        },

        h: function(node, unit, offset) {
            if(this.pagingManager)    {
                this.pagingManager._makePageForHtmlId(node.htmlId);
                var layout = this.pagingManager.getLayout(node.htmlId);
                if(layout) {
                    var h = this.px2pt(layout.extenth) ;
                    if(unit == "inch" || unit == "in")
                        h = this.pt2inch(h);
                    if(unit == "mm")
                        h = this.pt2mm(h);
                    if(offset != undefined)
                        h= 0;
                    return h;
                }
                else return 0;

            }

        },

        w: function(node, unit, offset) {
            if(this.pagingManager)    {
                this.pagingManager._makePageForHtmlId(node.htmlId);
                var layout = this.pagingManager.getLayout(node.htmlId);
                if(layout)      {
                    var w = this.px2pt(layout.extentw) ;
                    if(unit == "inch" || unit == "in")
                        w = this.pt2inch(w);
                    if(unit == "mm")
                        w = this.pt2mm(w);
                    if(offset != undefined)
                        w= 0;
                    return w ;
                }
                else return 0;

            }
        },

        x: function(node, unit, offset) {
            if(this.pagingManager)    {
                this.pagingManager._makePageForHtmlId(node.htmlId);
                var layout = this.pagingManager.getLayout(node.htmlId);
                if(layout){
                    var x = this.px2pt(layout.extentx) ;
                    if(unit == "inch" || unit == "in")
                        x = this.pt2inch(x);
                    if(unit == "mm")
                        x = this.pt2mm(x);
                    if(offset != undefined)
                        x= 0;
                    return x;
                }
                else return 0;

            }
        },

        y: function(node, unit, offset) {
            if(this.pagingManager)    {
                this.pagingManager._makePageForHtmlId(node.htmlId);
                var layout = this.pagingManager.getLayout(node.htmlId);
                if(layout){
                    var y = this.px2pt(layout.extenty) ;
                    if(unit == "inch" || unit == "in")
                        y = this.pt2inch(y);
                    if(unit == "mm")
                        y = this.pt2mm(y);
                    if(offset != undefined)
                        y= 0;
                    return y;
                }
                else return 0;

            }
        }

    });
    Layout.defineProps({
        "ready" : {
            get : function(){
                return true;
            }
        }
    });
})(_, xfalib);

/**
 * @package xfalib.script.Node
 * @import xfalib.script.Object
 * @import xfalib.script.SOMExpression
 * @import xfalib.script.XfaList
 * @fileOverview The file creates the Node Class required for XFA library
 * @version 0.0.1
 */


(function(_, xfalib){
    var Node = xfalib.script.Node = xfalib.script.Object.extend({
        _defaults : {
            "presence" : "visible"
        },

        initialize : function(){
            Node._super.initialize.call(this);
            /**
             * @private
             * @type xfalib.script.Node
             */
            this.mParent = null;
            /**
             * @private
             * @type string
             */
            this.mnIndex = 0;
            /**
             * @private
             * @type string
             */
            this.mnClassIndex = 0;
        },

        playJson : function(pJsonModel) {
            // tabIndex should be exempted because we are already computing it in _insert Instance
            this.copyObject(pJsonModel, this.jsonModel, {exceptions : ["htmlId", "children","tabIndex"], keepReference : true});
        },

        //TODO: REMOVE this when the actual implementation is available
        saveXML : function() {
            return "";
        },

        //TODO: REMOVE this when the actual implementation is available
        loadXML : function() {
        },

        _computeJsonDiff : function(diff_level){
            var dest = {};
            dest._class = this.className;
            if(this.jsonModel.hasOwnProperty("name")){
                dest.name = this.jsonModel.name;
            }
            var changeFound = false;
            var initialJson = this._xfa()._xfaTemplateCache.getInitialFormDomRef(this.htmlId);
            if(!initialJson)
                initialJson = this._xfa()._xfaTemplateCache.getInitialFormDomRef(this._templateId()) || {};
            var initialPropLength = _.filter(initialJson, function(value, key){
                return key !="extras";
            }, this).length;
            var jsonPropLength = _.filter(this.jsonModel, function(value, key){
                return key !="extras";
            }, this).length;

            if(jsonPropLength != initialPropLength){
                //We need to compare property sizes without 'extra' property since this is not actually part of schema
                changeFound = diff_level===0;   // only need _class and name during submission & restoreFormState
            }

            _.each(this.jsonModel, function(value, key){
                if(key === "_class" || key === "children" || key === "extras" || key == "{default}"){
                    return;
                }
                else {
                    //Note: We are assuming that any key that is present in templateJson would also be there in model json though it's value may be null/undefined
                    if(value !== initialJson[key]){
                        if(_.isArray(value)){
                            xfalib.runtime.xfa.Logger.error("xfa", "key:"+key + " has unexpected array value:"+JSON.stringify(value) + "parent:\n"+ JSON.stringify(src)) ;
                        }
                        else if(_.isObject(value)){
                            xfalib.runtime.xfa.Logger.error("xfa", "key:"+key + " has unexpected object value:"+JSON.stringify(value) + "parent:\n"+ JSON.stringify(src)) ;
                        }
                        else{
                            if (diff_level===0) {   // only need _class and name during submission & restoreFormState, rest will stripped by computeJsonDIff-s
                                dest[key] = value;
                                changeFound = true;
                            }
                        }
                    }
                }
            }, this);

            if (diff_level === 1) {
                if (this._xfa()._templateSchema.hasAttribute(this.className, 'access') &&
                    _.contains(["exclGroup", "field", "subform"], this.className)) {
                    dest.access = this.jsonModel.access;
                    changeFound = true;
                }
                if (this._xfa()._templateSchema.hasAttribute(this.className, 'presence') &&
                    _.contains(["exclGroup", "field", "items", "subform", "draw"], this.className)) {
                    dest.presence = this.jsonModel.presence;
                    changeFound = true;
                }
            }
            return {"changed" : changeFound,
                jsonDifference : dest
            };
        },

        _getSomExpression : function() {
            if (this.mParent == null)
                return "xfa[0]." + this._escapeQualifiedName();
            else
                return this.mParent.somExpression + "." + this._escapeQualifiedName();
        },

        _escapeQualifiedName : function() {
            var name = "#" + this.className,
                index = this.mnClassIndex,
                objName = this.getAttribute("name")
            if (objName.length > 0) {
                name = objName;
                index = this.index;
            }
            var qname = name + "[" + index + "]";
            return qname.replace(/\./, "\\.");
        },

        _xfa : function() {
            return xfalib.script.Xfa.Instance;
        },

        _resetData: function() {

        },

        /**
         * Evaluates the specified SOM expression, beginning with the current XML form
         * object model object, and returns the value of the object specified in the SOM
         * expression
         *
         * @function
         */
        resolveNode : function() {
            var nodes = null;
            if (arguments.length == 1)
                nodes = this._resolveNodesCommon(this, arguments[0], false, true);
            else
                nodes = this._resolveNodesCommon(arguments[0], arguments[1], false,
                    true);

            if (nodes && nodes.length > 0)
                return nodes.item(0);
            else {

                //xfa.Logger.debug("resolveNode for somExpression " + arguments[1]
                //    + " failed");
                return null;
            }
        },

        /**
         * Evaluates the specified SOM expression, beginning with the current XML form
         * object model object, and returns the value of the object specified in the SOM
         * expression
         *
         * @function
         */
        resolveNodes : function() {
            var nodes = null;
            if (arguments.length == 1)
                nodes = this._resolveNodesCommon(this, arguments[0], true, true);
            else
                nodes = this._resolveNodesCommon(arguments[0], arguments[1], true, true);
            return nodes;
        },

        _objInList: function(obj) {
            var list = new xfalib.script.XfaList();
            list._append(obj);
            return list;
        },

        _findProperty: function(oSom) {
            var arr = new xfalib.script.XfaList();
          if(oSom.index == 0) {
              //check whether som is a dynamic property
              if(this.resolveProperties && this.resolveProperties.indexOf(oSom.name) != -1)
                arr._append(this[oSom.name])
          }
          return arr;
        },

        _resolveNodesCommon : function(obj, sSomExpression, bMultiple, bFirst) {
            var arr1 = xfalib.script.SOMExpression.prototype.splitExpression(sSomExpression);
            if(arr1[0] == '$') {
                arr1.splice(0,1,this.somExpression);
                sSomExpression = arr1.join(".");
            }
            if(arr1[0].charAt(0) == '$' || arr1[0] == 'xfa' || arr1[0] == 'this') {
                var root, i = arr1[0].length + 1;
                switch(arr1[0]) {
                    case "xfa":
                    case "$xfa":
                        root = this._xfa();
                        break;
                    case "$template":
                        root = this._xfa().template
                        break;
                    case "$form":
                        root = this._xfa().form;
                        break;
                    case "this":
                        root = this._xfa()._contextNode();
                        break;
                }
                if(arr1.length == 1)
                    return this._objInList(root)
                return this._resolveNodesCommon(root,sSomExpression
                    .substr(i), bMultiple, bFirst);
            }

            var nCurrentIndex = 0;
            // TODO: Do contextNode mumbo jumbo
            if (this._xfa() && (this._xfa()._contextNode() != null))
                nCurrentIndex = this._xfa()._contextNode().index;

            var oChildren = null; // returned as either an array of single object
            var oParent = obj;
            var si = 0;
            var bRootMatch = false;

            //
            // See if the first token of the expression matches this node
            // On the first call the children are checked first
            //
            var oSOM = xfalib.script.XfaModelRegistry.prototype.createSomExpression(arr1[0], obj.index);
            if ((bFirst == false) && (oSOM.equals(obj) || (oSOM.scalerMatch == obj))) {
                bRootMatch = true;
                //
                // found
                //
                if ((arr1.length == 1)) {
                    //
                    // If the expression only has one token then the expression matches
                    // this node
                    //
                    if (!bMultiple) {
                        var list = new xfalib.script.XfaList();
                        list._append(obj);
                        return list;
                    }

                    oParent = obj.parent;
                    if (oParent == null) {
                        oChildren = new xfalib.script.XfaList();
                        oChildren._append(obj);
                        return oChildren;
                    }
                    si = 0;
                } else {
                    //
                    // If the expression has more than one token then start looking for
                    // a match of subsequent tokens with the children of this node.
                    //
                    si = 1;
                    oSOM = xfalib.script.XfaModelRegistry.prototype.createSomExpression(arr1[1], 0);
                }
            } else {
                //
                // Check for match with one of the child nodes
                //
                oSOM = xfalib.script.XfaModelRegistry.prototype.createSomExpression(arr1[0], nCurrentIndex);
            }

            if (obj._isContainerNode()) {
                var bElipsis = false;

                for ( var j = si; j < arr1.length; j++) {
                    if (arr1[j] == "..") {
                        bElipsis = true;
                        j++;
                        if (j == arr1.length)
                            break;
                        oSOM = xfalib.script.XfaModelRegistry.prototype.createSomExpression(arr1[j], 0);
                    }

                    var bLast = ((j + 1) == arr1.length);
                    oChildren = new xfalib.script.XfaList();

                    if (!(oParent instanceof xfalib.script.XfaList)) {
                        var oParentList = new xfalib.script.XfaList();
                        oParentList._append(oParent);
                        oParent = oParentList;
                    }

                    for ( var k = 0; k < oParent.length; k++) {
                        var children,
                            parent = oParent.item(k);
                        if(parent != null && parent._isContainerNode()) {
                            if (bElipsis) {
                                children = parent._findChildrenDeep(oSOM,
                                    bMultiple);
                                bElipsis = false;
                            } else {
                                children = parent._findChildren(oSOM, bMultiple);
                                if(children.length == 0) {
                                    children = parent._findProperty(oSOM);
                                }
                            }
                        }

                        oChildren._concat(children);
                    }

                    if (oChildren.length == 0) {
                        break;
                    }

                    bRootMatch = true;
                    if (bLast == false) {
                        oSOM = xfalib.script.XfaModelRegistry.prototype.createSomExpression(arr1[j + 1], 0);
                        oParent = oChildren;
                    }
                }
            }

            if (oChildren && (oChildren.length != 0)) {
                return oChildren;
            }

            if ((bRootMatch == true) || (obj.parent == null)) {
                if (bFirst == true) {
                    //
                    // Try again attempting to match the current node
                    //
                    return this._resolveNodesCommon(obj, sSomExpression, bMultiple,
                        false);
                }
                if (obj.parent != null)
                    return this._resolveNodesCommon(obj.parent, sSomExpression,
                        bMultiple, false);

                if (bMultiple)
                    return new xfalib.script.XfaList();

                return null;
            } else {
                //
                // try parent
                return this._resolveNodesCommon(obj.parent, sSomExpression, bMultiple,
                    false);
            }
        },

        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a container
         *          Node or not
         */
        _isContainerNode : function() {
            return false;
        },

        _isXFAContainerNode : function() {
            return false;
        },

        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a Field or not
         */
        _isField : function() {
            return false;
        },

        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a subform or
         *          not
         */
        _isSubform : function() {
            return false;
        },

        _isExclusionGroup : function() {
            return false;
        },

        _findChildren : function(oSOM, bMultiple) {
            return null;
        },

        _findChildrenDeep : function(oSOM, bMultiple) {
            return null;
        },

        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a content Node
         *          or not
         */
        _isContent : function() {
            return false;
        },

        _isEventNode : function(){
            return false;
        },

        clone : function() {
            var clonedJson = {};
            this.copyObject(this.jsonModel, clonedJson,{exceptions : ["htmlId"]} );
            var node = xfalib.script.XfaModelRegistry.prototype.createModel(clonedJson);
            return node;
        },

        nakedFieldReferences : function(nIndex, createGetterSetter,obj) {
            return;
        },

        getAttribute: function(name, bPeek) {
            var attrValue = undefined;
            //Bug#3609434 : check only for undefined
            if(name && !_.isUndefined(this.jsonModel[name])) {
                attrValue = this.jsonModel[name];
            }
            else if(bPeek !== false) {
                attrValue = this._getDefaultAttribute(name);
            } else {
                return null;
            }
            if(name == "name" && (_.isUndefined(attrValue) || _.isNull(attrValue))){
                /* LC-8150: If attrName is name and attrValue is undefined or null then we return empty string instead of null.
                * Reason being most of the code assume that every node would have name property
                * */
                attrValue = "";
            }
            return attrValue;
        },

        /*
         * conditions for putting a node in global context
         * 1. It should have a name
         * 2. Its index should match with the index provided
         *                  OR
         * 2. There should not be more than one node with the same name in its normalizedParent Bug#3594282
         */
        getNaked : function(nIndex,createGetterSetter,Obj,scope) {
            var nodeName = this.getOrElse(this.jsonModel, "name", "");
            if ((nodeName != null) && (nodeName.length != 0) && ((scope && scope.moNameArray[nodeName] == 1) || (nIndex == this.index))) {
                //TODO: keep a state whether this node was previously naked or not. If yes do nothing
                var oObject = document[nodeName];
                if ((oObject == null) || (oObject instanceof xfalib.script.Node)) {
                    if(createGetterSetter ){
                        if(Obj._private["_"+nodeName+"_"]==null || Obj._private["_"+nodeName+"_"]==undefined){
                            this._createGetterSetter(Obj, nodeName, this);
                        }
                    }
                    else
                        Obj["_"+nodeName+"_"] = Obj["_"+nodeName+"_"] || this;
                }
            }
        },

        _getNakedThis : function(){
            return this;
        },

        toJSONString : function() {
            return JSON.stringify(this.jsonModel);
        },

        /**
         * @private
         *
         * this function performs initialization for this node.
         */
        _initialize : function() {

        },

        /**
         * @private
         * @function indicate that this is a Form node (~~).
         */
        _isForm : function() {
            return false;
        },

        _destroy : function(oChild) {
            var evnt = xfalib.script.XfaModelEvent.createEvent( xfalib.script.XfaModelEvent.OBJECT_DESTROYED, this,
                'destroy', null, this);
            this.trigger(evnt.name,evnt);
            this.off();
            var prop =  "_"+this.getAttribute("name")+"_";
            if (xfalib.runtime.hasOwnProperty(prop) && typeof xfalib.runtime[prop] != "undefined")
                if (xfalib.runtime[prop].somExpression == this.somExpression)
                    xfalib.runtime[prop] = undefined;
            this._xfa()._xfaTemplateCache.removeModel(this.htmlId);
        },

        _matches : function(oNode) {
            return (oNode != null && this.somExpression == oNode.somExpression);
        },

        _setFocus : function() {
            var evnt = xfalib.script.XfaModelEvent.createEvent( xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this,
                'focus', null, this);
            this.trigger(evnt.name,evnt);
        },

        _templateRef : function(){
            return this._xfa()._xfaTemplateCache.getTemplateRef(this.getOrElse(this.jsonModel, "extras.htmlId", null));
        },

        _templateId : function(){
            return this.getOrElse(this._templateRef(), "extras.htmlId", null);
        },

        _createGetterSetter : function(container,name,obj) {
            var iName = "_" + name + "_";
            if(!container.hasOwnProperty(name)){
                Object.defineProperty(container,name,{
                    get: function() {
                        if(this._private[iName]) {
                            return this._private[iName]._getNakedThis();
                        }
                        return undefined;
                    },
                    set : function(val) {
                        var obj = this._private[iName];
                        obj[obj._default] = val;
                    }
                });
            }
            container._private[iName]=obj;
        },

        _getDefaultAttribute : function(attribute) {
            return this._xfa()._templateSchema.getDefaultAttribute(this.className, attribute);
        },

        _getDefaultElement : function(elName, index, append) {
            var relation = this._xfa()._templateSchema._getRelation(this.className, elName);
            if(relation == xfalib.template.Constants.zeroOrOne || relation == xfalib.template.Constants.oneOfChild ||
                ((relation == xfalib.template.Constants.zeroOrTwo || relation == xfalib.template.Constants.zeroOrFour) && index == 0)){
                var defaultEl = xfalib.script.XfaModelRegistry.prototype.createModel({_class : elName});
                if(defaultEl && append){
                    this._addChild(defaultEl._getNakedThis());
                }
                return defaultEl;
            }
            else
                return null;
        },

        _getDataType: function(attribute) {
            return this._xfa()._templateSchema._getDataType(this.className, attribute);
        },

        _getRelation: function(child) {
            return  this._xfa()._templateSchema._getRelation(this.className,child.className);
        },

        //this function filters the nodes based on a filterFn.
        //this processes not only immediate children but goes recursively through the whole tree
        _filterNodes:function(filterFn) {
            var nodeList = new xfalib.script.XfaList();
            if (this._isContainerNode()) {
                var children = this._getChildren();
                for(var i=0; i< children.length; i++){
                    var n = children.item(i);
                    if(filterFn(n))
                        nodeList._append(n);
                    nodeList._concat(n._filterNodes(filterFn));
                }
            }
            return nodeList;
        },

        getElement: function(className,index, bPeek) {
            index = index || 0;
            var arr = this._findChildren(xfalib.script.XfaModelRegistry.prototype.createSomExpression(className+"["+index+"]"),false);
            if(arr && arr.length >0)
                return arr.item(0);
            else if(!bPeek && (this._getOneOfChild &&  !this._getOneOfChild(true)))
                return this._getDefaultElement(className, index, true);
            else
                return null;
        },

        setElement: function(element, className,index){
            if(_.isNumber(element) || _.isBoolean(element) || _.isDate(element) || _.isString(element)){
                var childNode = this.getElement(className, index);
                if(childNode && childNode._default){
                    childNode[childNode._default] = element;
                }
            }
            return null;
        },

        setAttribute: function(value, attrName){
            this.jsonModel[attrName] = this.validateInput(value, this._getDataType(attrName),this.jsonModel[attrName]);
        },

        /**
         * Return the DataSOMMap after adding an entry in the map for the node. The entry contains the value of the node
         * along with its Data SOM. If there is no Data SOM then return the unmodified map
         * @param map
         * @private
         */
        _getDataSomMap : function(map) {
            return map;
        },

        /**
         * Update the value of the node with the value provided in the input map. The map contains the values of the fields
         * mapped with their DataSOM. The function is empty for all the nodes, except for Field, Subform and Area.
         * @param map
         * @private
         */
        _restoreDataSomMap : function (map) {

        },

        _playDataXML: function(xmlDocument, contextNode) {

        },

        generateDataXML: function(rootNode, contextNode) {

        }

    });

    Node.defineProps({
        "parent" : {
            get : function() {
                return this.mParent;
            },
            set : function(parent) {
                parent = this.validateInput(parent, "object",null);
                this.mParent = parent;
            },
            resolve:true
        },

        "name"  : {
            get : function() {
                return this.getAttribute("name");
            },
            set : function(sName) {
                //sName = this.validateInput(sName, "string");
                //this.jsonModel.name = sName;
            },
            configurable:true
        },

        "nodes" : {
            get : function() {
                if (this._isContainerNode()) {
                    return this._getChildren();
                }
                return new xfalib.script.XfaList();
            }
        },

        "index" : {
            get : function() {
                return this.mnIndex;
            },
            set : function(nIndex) {
                nIndex = this.validateInput(nIndex, "integer",this.mnIndex);
                this.mnIndex = nIndex;
            }
        },

        "somExpression" : {
            get : function() {
                return this._getSomExpression();
            },
            set : function() {
                xfalib.runtime.xfa.Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-006"],["setting SomExpression"])
                throw "unsupported operation";
            }
        },

        "isContainer" : {
            get : function() {
                return this._isXFAContainerNode();
            }
        },

        "htmlId" : {
            get : function(){
                return this.getOrElse(this.jsonModel, "extras.htmlId", null);
            },
            set : function(sHtmlId){
                this.jsonModel.extras = this.jsonModel.extras || {};
                this.jsonModel.extras.htmlId = sHtmlId;
            }
        },

        "isNull" : {
            get : function(){
                return false;
            }
        },

        "all" : {
            get : function(){
                var list = new xfalib.script.XfaList();
                var som = xfalib.script.XfaModelRegistry.prototype.createSomExpression(this.jsonModel.name+"[*]");
                try {
                    if(this.jsonModel.name)  {
                        if(this.parent)
                            return this.parent._findChildrenDeep(som, true);
                        else return list;
                    }
                    else throw "Name undefined" ;
                }
                catch(e)   {
                    console.error("Get operation all requires the node to have a name");
                }


            }
        },

        "extras" :{
            get: function() {
                return this.getElement("extras",0)
            }
        }

    });
})(_, xfalib);


/**
 * @package xfalib.script.Element
 * @import xfalib.script.Node
 * @fileOverview The file creates the Element Class required for XFA
 *               library
 * @version 0.0.2
 */

(function (_, xfalib) {
    /**
     * @class The class represents all the XFA Objects which can contain other XFA
     *        nodes inside them
     * @extends com.adobe.xfa.scripting.Node
     *
     * @property {Array} children children of the Element
     *
     * @constructor
     * @param {string}
     *            name the name of the node
     *
     * @type {*|void}
     */
    var Element = xfalib.script.Element = xfalib.script.Node.extend({

        initialize: function () {
            Element._super.initialize.call(this);
            this._moChildNodes = [];
            this.mnCurrentIndex = -1;
            this.moNameArray = new Object();
            this.moNormalizedChildren = new Array();
            this._private = {};
            this._initChildren();
        },

        _initChildren: function () {
            var children = new Array();
            var lastCreatedInstanceManager = null;

            if (this.jsonModel.children) {
                var j = 0;
                for (var i = 0; i < this.jsonModel.children.length; i++) {
                    var child = this.jsonModel.children[i];
                    var childModel = xfalib.script.XfaModelRegistry.prototype.createModel(child);
                    if (childModel instanceof xfalib.script.InstanceManager) {
                        lastCreatedInstanceManager = childModel;
                    }
                    else if (childModel instanceof xfalib.script.Subform) {
                        if (lastCreatedInstanceManager != null) {
                            if (lastCreatedInstanceManager.name.length == 0)
                                lastCreatedInstanceManager.name = "_" + childModel.name;
                            lastCreatedInstanceManager._manageChild(childModel);
                        }
                    }
                    if (childModel) {
                        children[j++] = childModel;
                    }
                }
                this.children = children;
            }
        },

        _getChildren: function (child) {
            var parent = this;
            var obj = {"parent": parent};
            var list = new xfalib.script.XfaList(obj);
            for (var i = 0; i < this.moChildNodes.length; i++) {
                list._append(this.moChildNodes[i]._getNakedThis());
            }
            return list;
        },

        /**
         * The functions adds a child to this containerNode
         *
         * @function
         * @param {node}
         *            child The child node to add to this Element
         *
         */
        _addChild: function (child) {
            if (child != null) {
                this._addChildAt(child, this.moChildNodes.length);
            }
        },

        /**
         * @private
         * @function returns true if this is a scopeless container
         *
         */
        scopeless: function () {
            return false;
        },

        //includeDomElement tells whether DOMElement should be escalated to their parent
        appendNormalizedChildren: function (oNormalizedChildren, includeDomElement) {
            var i = 0;
            for (i = 0; i < this.moChildNodes.length; i++) {
                var oChild = this.moChildNodes[i];
                if (oChild != null) {
                    //CQ-102341 : border child of unnamed subform was getting appended to parent subform
                    if(includeDomElement === true || !(oChild instanceof xfalib.script.dom.Border)) {
                        oNormalizedChildren.push(oChild);
                    }
                    var oContainer = oChild;
                    if (oContainer
                        && (oContainer._isContainerNode() && oContainer.scopeless())) {
                        oContainer.appendNormalizedChildren(oNormalizedChildren, false);
                    }
                }
            }
        },

        /**
         * @private
         *
         * adds a dynamic property to this container.
         *
         * @param sName
         *            the name of the property to be added.
         * @param oValueObject
         *            the value of the property that is added.
         * @return the 0 based index of the property name.
         */
        _addProperty: function (sName, oValueObject, createGetterSetter) {
            var nIndex = 0;
            if ((sName != null) && (sName.length > 0)) {
                if (oValueObject == null) {
                    //
                    // just reset it
                    //
                    if (this[sName])
                        this[sName] = null;
                    this.moNameArray[sName] = 0;
                } else {
                    //
                    // add it as a property also keep track of the index
                    //
                    this.moNameArray[sName] = this.moNameArray[sName] || nIndex;
                    nIndex = this.moNameArray[sName]++;
                    if (nIndex == 0 && createGetterSetter) {
                        //
                        // Only put the first instance as a property of the container
                        // don't overwrite non dynamic properties
                        //
                        this._createGetterSetter(this, sName, oValueObject);
                    }
                }
            }
            return nIndex;
        },

        normalizeChildren: function () {
            this.moNormalizedChildren = new Array();
            this.appendNormalizedChildren(this.moNormalizedChildren, true);
            var bScopeless = this.scopeless();

            if (bScopeless) {
                //
                // must scope children in the parent container
                //
                var oParent = this.parent;
                if (oParent != null)
                    oParent.normalizeChildren();
            }

            var i = 0;
            this.moNameArray = new Object();
            for (; i < this.moNormalizedChildren.length; i++) {
                var oChild = this.moNormalizedChildren[i];
                //
                // Set properties and indices based on normalized children
                //
                var createGetterSetter = this._requireGetterSetter(oChild);
                var index = this._addProperty(this.getOrElse(oChild.jsonModel, "name", ""), oChild, createGetterSetter);
                var classIndex = this._addProperty('#' + oChild.className, oChild, false);
                if (!bScopeless) {
                    //
                    // scope indexes relative to this container
                    //
                    oChild.index = index;
                    oChild.mnClassIndex = classIndex;
                }
            }
        },

        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a container
         *          Node or not
         */
        _isContainerNode: function () {
            return true;
        },

        _requireGetterSetter: function (oChild) {
            //Tests whether dynamic getter/setter should be generated for this child which happens for infinite cardinality
            var relation = this._getRelation(oChild);
            return (relation == null || relation.max == Infinity);
        },

        _findChildren: function (oSOM, bMultiple) {
            var arr = new xfalib.script.XfaList();
            var elemFound = false;
            for (var j = 0; j < this.moNormalizedChildren.length; j++) {
                var oChild = this.moNormalizedChildren[j];
                var relation = this._getRelation(oChild);
                if (oSOM.equals(oChild) || (relation && relation.max != Infinity && oSOM.tagEquals(oChild))) {
                    arr._append(oChild._getNakedThis());
                    elemFound = true;
                }
                if (elemFound && !bMultiple)
                    return arr;
                else if (elemFound && oSOM.index != '*')
                    break;
            }

            if (oSOM.scalerMatch != null) {
                if (bMultiple == false) {
                    arr._append(oSOM.scalerMatch._getNakedThis());
                    return arr;
                }
                else {
                    // arr = [];
                    // arr.length = oSOM.scalarMatch;
                }
            }

            return arr;
        },

        /**
         * @private
         *
         * like _findChildren but searches deep for a match
         */
        _findChildrenDeep: function (oSOM, bMultiple) {
            var oObject = this._findChildren(oSOM, bMultiple);
            if (oObject == null || oObject.length == 0) {
                var oChildren = this.children;
                for (var j = 0; j < oChildren.length; j++) {
                    oObject = oChildren[j]._findChildrenDeep(oSOM, bMultiple);
                    if (oObject && oObject.length > 0)
                        break;
                }
            }
            return oObject;
        },

        /**
         * @private
         *
         * get the index of the specified child.
         *
         * @param {com.adobe.xfa.scripting.Node}
         *            oNode the node of which the index is to be found.
         * @return {number} the 0 based index of the node or -1 if not found.
         */
        _getChildIndex: function (oNode) {
            return this.moChildNodes.indexOf(oNode);
        },

        /**
         * @private
         *
         * add specified child to the specified index.
         *
         * @param oNode
         *            the node to be added.
         * @param nINdex
         *            the index where the child will be inserted.
         */
        _addChildAt: function (oNode, nIndex) {
            this.moChildNodes.splice(nIndex, 0, oNode);
            this.jsonModel.children = this.jsonModel.children || [];
            this.jsonModel.children.splice(nIndex, 0, oNode.jsonModel);
            oNode.parent = this;
            this.normalizeChildren();
            this._postAddChild(oNode);
        },

        _postAddChild: function (oNode) {
            oNode._initialize();
            if (oNode instanceof xfalib.script.DOMElement || oNode instanceof xfalib.script.GenericText) {
                oNode.on(xfalib.script.XfaModelEvent.DOM_CHANGED, this);
            }
        },

        _destroy: function (oChild) {
            for (var i = 0; i < this.moChildNodes.length; i++) {
                var child = this.moChildNodes[i];
                if (child != null)
                    child._destroy();
            }
            Element._super._destroy.call(this, oChild);
        },

        _removeAll: function () {
            _.each(this.moChildNodes, function (oChild, index) {
                oChild._destroy();
            });
            this.moChildNodes = [];
            this.jsonModel.children = [];
            this.normalizeChildren();
            //ToDo add event trigger like _remove method if required
        },

        _removeChild: function (oChild) {
            oChild._destroy();
            var nIndex = this.moChildNodes.indexOf(oChild);
            this.moChildNodes.splice(nIndex, 1);
            this.jsonModel.children.splice(nIndex, 1);
            this.normalizeChildren();
            this._postRemoveChild(oChild);
        },

        _postRemoveChild: function (oChild) {
            //do nothing here
        },

        /**
         * @private
         *
         * initialize this Container Node
         */
        _initialize: function () {
            if ((this.moChildNodes == null) || (this.moChildNodes.length == 0)) {
                this.mbInitialized = true;
                return;
            }

            if (this._xfa() == null) {
                throw (xfalib.locale.LogMessages["ALC-FRM-901-003"]);
            }

            // Init this
            if (this.parent == null) {
                this.index = 0;
                //this._xfa()._pushContextNode(this);
            }

            //
            // loop through the controls that are child components of this container
            // copy into array, since moChildNodes may be modified as we initialize
            // InstanceManagers
            //

            var oChildren = this.moChildNodes;
            for (var i = 0; i < oChildren.length; i++) {
                var oNode = oChildren[i];
                if (oNode == null)
                    xfalib.runtime.xfa.Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-004"], [this.getAttribute("name"), i]);
                else
                    oNode._initialize();
            }

            this.mbInitialized = true;

        },

        playJson: function (pJsonModel) {
            /*
             * playJson assumption: The non dom elements should always maintain the structural hierarchy.
             * For dom elements, we support only value and items. rest are ignored.
             */
            Element._super.playJson.call(this, pJsonModel);
            var schemaChildren = this._xfa()._templateSchema.getChildren(this.className);
            _.each(schemaChildren, function (schemaChildProps, schemaChildTag) {
                // if schemaChildTag is a DOMelem other than items,value continue
                if (xfalib.script.dom[schemaChildTag.charAt(0).toUpperCase() + schemaChildTag.substring(1)] !== undefined // TODO : take care of those domElements with 2nd order inheritance
                    && !_.contains(["value", "items"], schemaChildTag)) {
                    return;
                }
                if (this.playJsonForElement(schemaChildTag, pJsonModel)) {   // continue if this childTag has special handling
                    return;
                }

                var relation = schemaChildProps.relation;
                var newJChildren = _.filter(_.compact(pJsonModel.children), function (jChild) {
                    return jChild._class == schemaChildTag;
                }, this);
                var oldMChildren = _.filter(this.moChildNodes, function (mChild) {
                    return mChild.className == schemaChildTag;
                }, this);
                var oneOfChildProcessed = false;

                switch (relation) {
                    case xfalib.template.Constants.zeroOrOne :
                        if (newJChildren.length > 0 && oldMChildren.length == 0) { //Addition
                            var newMChild = xfalib.script.XfaModelRegistry.prototype.createModel(newJChildren[0]);
                            this._addChild(newMChild);
                        }
                        else if (newJChildren.length == 0 && oldMChildren.length > 0) { //removal
                            this._removeChild(oldMChildren[0]);
                        }
                        else if (newJChildren.length > 0 && oldMChildren.length > 0) {
                            oldMChildren[0].playJson(newJChildren[0]);
                        }
                        break;

                    case xfalib.template.Constants.oneOfChild :
                        if (!oneOfChildProcessed && newJChildren.length > 0 && oldMChildren.length > 0) {
                            // For the time being let's assume oneOfChild type can not be modified and can not be added/removed
                            oldMChildren[0].playJson(newJChildren[0]);
                            oneOfChildProcessed = true;
                        }
                        break;

                    default :
                        _.each(oldMChildren, function (oldMChild) {
                            var newJChild = newJChildren.shift();
                            if (newJChild) {
                                oldMChild.playJson(newJChild);
                            }
                            else {
                                this._removeChild(oldMChild);
                            }
                        }, this);
                        if (newJChildren.length > 0) {
                            _.each(newJChildren, function (newJChild) {
                                var newMChild = xfalib.script.XfaModelRegistry.prototype.createModel(newJChild);
                                this._addChild(newMChild);
                            }, this);
                        }
                        break;
                }
            }, this);
        },

        playJsonForElement: function (elName, pJsonModel) {
            return false;
        },


        _computeJsonDiff: function (diff_level) {
            if (diff_level===0 && this._newChild == true) {
                return {
                    "changed": true,
                    "jsonDifference": this.jsonModel
                };
            }
            var diff = Element._super._computeJsonDiff.call(this, diff_level);
            var attrChangeFound = diff.changed;
            var dest = diff.jsonDifference;
            var initialJson = this._xfa()._xfaTemplateCache.getInitialFormDomRef(this.htmlId);
            if (!initialJson) {
                initialJson = this._xfa()._xfaTemplateCache.getInitialFormDomRef(this._templateId()) || {};
            }
            var childChangeFound = false;
            var initialJsonChildren = this.getOrElse(initialJson, "children", []);
            if (this.getOrElse(this.moChildNodes, "length", 0) != this.getOrElse(initialJsonChildren, "length", 0)) {
                childChangeFound = true;
            }
            else {
                childChangeFound = (null != _.find(this.moChildNodes, function (mChild, index) {
                    if ((mChild.className != initialJsonChildren[index]._class) || (mChild.jsonModel.name !== initialJsonChildren[index].name)) {
                        return true;
                    }
                    return false;
                }, this));
            }

            var destChildren = [];
            _.each(this.moChildNodes, function (mChild, index) {
                var childDiff = mChild._computeJsonDiff(diff_level) || {};
                if (!(diff_level>0 && _.isEmpty(childDiff.jsonDifference))) {  // skip if during submission & restoreFormState the childDiff is empty
                    destChildren.push(childDiff.jsonDifference);
                    if (!childChangeFound && childDiff.changed) {
                        childChangeFound = true;
                    }
                }
            }, this);

            if (diff_level>0 && destChildren.length == 0) { // skip if during submission  & restoreFormState no children present
                if (this.jsonModel._class !== 'form') { // except for root subform LC-9317
                    dest = undefined; // must be careful while assigning to jsonDifference, ideally should let it be {}, but this costs bytes in final json
                }
            } else {
                dest.children = destChildren;
            }

            return {"changed": childChangeFound || attrChangeFound,
                jsonDifference: dest
            };
        },

        _getOneOfChild: function (bPeek) {
            try {
                bPeek = typeof bPeek === "undefined" ? false : true;
                if (!this._oneOfChild && bPeek === false) {
                    var children = this._xfa()._templateSchema._getOneOfChild(this.className);
                    this._oneOfChild = _.find(this.moChildNodes, function (child) {
                        return child.className in children;
                    });
                    if (this._oneOfChild)
                        this._oneOfChild = this._oneOfChild._getNakedThis();
                }
                return this._oneOfChild;
            } catch (exception) {
                this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-017"], [exception, "oneOfChild", contextObj.somExpression])
            }
        },

        /**
         * Return the bind child of the current element. getElement API doesn't return the correct value in case of
         * unnamed element inside the current element
         * @returns {*}
         * @private
         */
        _getBinding: function () {
            return _.find(this.moChildNodes, function(child) {
                return child.className === "bind"
            })
        },

        /**
         * Checks whether binding is none or not. Returns false if binding is set to none, otherwise false.
         * @returns {boolean}
         */
        hasDataBinding: function () {
            var bind = this._getBinding();
            //bind = null means use name binding
            return bind == null || bind.match !== "none";
        },

        /**
         * returns dataSom for the current field
         * @returns {*}
         * @private
         */
        _getDataSom: function () {
            return this.getOrElse(this, "extras.FS_EXTRAS.FS_DATA_SOM.value", null);
        },

        /**
         * Returns true if the bindRef for the element points to an attribute otherwise false.
         * @returns {boolean}
         * @private
         */
        _isBindRefAttribute: function () {
            return 1 == this.getOrElse(this, "extras.FS_EXTRAS.IS_ATTRIBUTE.value", 0);
        },

        _convertRefToXPath: function (bindRef) {
            var $regex = /^\$\./,
                $recordRegex = /^\$record\./,
                relative,
                _bindRef,
                somArray;
            if(bindRef.match($recordRegex) != null) {
                relative = false;
                _bindRef = bindRef.replace($recordRegex, "");
            } else {
                relative = true;
                _bindRef = bindRef.replace($regex, "");
            }
            somArray = xfalib.script.SOMExpression.prototype.splitExpression(_bindRef);
            _bindRef = _.reduce(somArray, function (memo, som, indx) {
                var currentSom = xfalib.script.XfaModelRegistry.prototype.createSomExpression(som, 0),
                    index = currentSom.index;
                // index in SOM Expression starts from 0 whereas in xpath it starts from 1
                if(_.isNumber(index)) {
                    index += 1;
                }
                if(indx === somArray.length - 1 && this._isBindRefAttribute()) {
                    // only last part in the bindRef can be attribute
                    return memo + "@" + currentSom.name;
                }
                return memo + currentSom.name + "[" + index + "]/"
            }, "", this);
            //replace the last / if exists with empty string
            _bindRef = _bindRef.replace(/\/$/,"");
            return {
                relative: relative,
                bindRef: _bindRef
            };
        },

        /**
         * Returns the xpath from the bind.dataref property. removes the leading $. from the dataRef.
         * TODO: in some places the dataRef property has $record. Need to discuss that case
         * Moreover this might not be needed if XTG provides DATASOM for the subforms.
         * @returns {*}
         * @private
         */
        _getXpathFromBindRef: function () {
            var bind = this._getBinding(),
                bindRef = this.getAttribute("name"),
                $regex = /^\$\./,
                $recordRegex = /^\$record\./,
                relative = true,
                somArray;
            if(bind != null) {
                if(bind.match === "dataRef") {
                    if(bind.ref.match($recordRegex) != null) {
                        relative = false;
                        bindRef = bind.ref.replace($recordRegex, "");
                    } else {
                        relative = true;
                        bindRef = bind.ref.replace($regex, "");
                    }
                    somArray = xfalib.script.SOMExpression.prototype.splitExpression(bindRef);
                    bindRef = _.reduce(somArray, function (memo, som, indx) {
                        var currentSom = xfalib.script.XfaModelRegistry.prototype.createSomExpression(som, 0),
                            index = currentSom.index;
                        // index in SOM Expression starts from 0 whereas in xpath it starts from 1
                        if(_.isNumber(index)) {
                                index += 1;
                        }
                        if(indx === somArray.length - 1 && this._isBindRefAttribute()) {
                            // only last part in the bindRef can be attribute
                            return memo + "@" + currentSom.name;
                        }
                        return memo + currentSom.name + "[" + index + "]/"
                    }, "", this);
                    //replace the last / if exists with empty string
                    bindRef = bindRef.replace(/\/$/,"");
                    return {
                        relative: relative,
                        bindRef: bindRef
                    };
                } else if (bind.match === "global" && ["field", "exclGroup"].indexOf(this.className) !== -1) {
                    return {
                        relative: "global",
                        bindRef: this.getAttribute("name") + "[1]"
                    };
                } else if(bind.match === "once") { // for fields with patterns
                    return this._getXPathForUseNameBinding();
                }
                // bind.match === null
                return null;
            }
            //use name binding
            /** for unnamed elements, with data binding as use name, we are returning null */
            return this._getXPathForUseNameBinding();
        },

        _getXPathForUseNameBinding: function () {
            var name = this.getAttribute("name"),
                //SOM Index starts from 0 while in XPath it starts from 1
                index = this.index + 1;
            return name === "" ? null
                               : {
                                    relative: true,
                                    bindRef: name + "[" + index + "]"
                                 };
        },

        /**
         * Iterate over every child and add entry for them into the dataSOMMap. See @ Node._getDataSomMap for more details
         * @param map
         * @private
         * if map is not an object it behaves as an identity function
         */
        _getDataSomMap: function(map) {
            if(!_.isObject(map)) {
                return map;
            }
            _.each(this.moChildNodes, function (child) {
                map = child._getDataSomMap(map);
            });
            return map;
        },

        /**
         * Iterate over every child and update their values based on the entries in the map. See @ Node._getDataSomMap
         * for more details
         * @param map
         * @private
         */
        _restoreDataSomMap: function (map) {
            if(!_.isObject(map)) {
                return;
            }
            _.each(this.moChildNodes, function (child) {
                child._restoreDataSomMap(map);
            })
        },

        /**
         * Evaluates the given xpath relative to contextNode or RootNode depending upon the value of xpath.relative
         * In case it is true, xpath is evaluates relative to contextNode otherwise rootNode
         * @param xpath
         * @param contextNode
         * @param rootNode
         * @returns {*}
         * @private
         */
        _getElementsFromXpath: function(xpath, contextNode, rootNode) {
            var nodeIter,
                XMLUtils = xfalib.ut.XMLUtils,
                doc = rootNode instanceof Document ? rootNode : rootNode.ownerDocument;
            if(xpath.relative === false) {
                nodeIter = XMLUtils.evaluateXPath(xpath.bindRef, rootNode, null,
                                    XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            }
            else if(contextNode != null) {
                nodeIter = XMLUtils.evaluateXPath(xpath.bindRef, contextNode, null,
                                    XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            }
            return nodeIter;
        },

        _playDataXML : function (xmlDocument, contextNode, currentBindRef) {
            _.each(this.children, function(child) {
               child._playDataXML(xmlDocument, contextNode, currentBindRef);
            }, this);
        },

        /**
         * Generates the XML by appending the elements in the rootNode
         * @param rootNode The rootNode of the xml. Generally the element that maps to the root of the form
         * @param contextNode Current Node where to insert the elements in case of relative bindings
         */
        generateDataXML: function (rootNode, contextNode) {
            _.each(this.moChildNodes, function(child) {
                child.generateDataXML(rootNode, contextNode);
            });
        },

        /**
         * Returns bindRef relative to parentBindRef. If bindRef is not a child of parentBindRef, returns null
         * otherwise removes the parentBindRef string from the bindRef
         * @param parentBindRef
         * @param bindRef
         * @returns {*}
         * @private
         */
        _getRelativeXPath: function(parentBindRef, bindRef) {
           var regexp = new RegExp("^" + parentBindRef+"/");
           if(bindRef.match(regexp)) {
              return bindRef.replace(regexp,"");
           }
           return null;
        }
    });

    Element.defineProps({
        "children": {
            get: function () {
                var nodes = [];
                for (var i = 0; i < this.moChildNodes.length; i++) {
                    var child = this.moChildNodes[i];
                    if (child != null)
                        nodes.push(child);
                }
                return nodes;
            },
            set: function (moChildren) {
                moChildren = this.validateInput(moChildren, "object", null);
                this.moChildNodes = new Array(moChildren.length);
                this.jsonModel.children = [];
                for (var i = 0; i < moChildren.length; i++) {
                    this.moChildNodes[i] = moChildren[i];
                    this.moChildNodes[i].parent = this;
                    this.jsonModel.children[i] = moChildren[i].jsonModel;
                }
                this.normalizeChildren();
            }
        },

        "oneOfChild": {
            get: function () {
                return this._getOneOfChild();
            }
        },

        moChildNodes: {
            get: function () {
                return this._moChildNodes;
            },
            set: function (value) {
                this._moChildNodes = value;
            }
        }

        /*"borderWidth" : {
         get : function() {
         this._borderWidth = this._borderWidth || "0.6624 px" ;
         return (this._borderWidth);
         },

         set : function(width) {
         //TODO: Set border.edge.presence property to visible once Border is implemented
         this._borderWidth = width ;
         var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
         this,"borderWidth",null,width);
         this.trigger(evnt.name,evnt);
         }
         },      */

    });

})(_, xfalib);


(function (_, xfalib) {
    var GenericText = xfalib.script.GenericText = xfalib.script.Node.extend({
        _default: "value",
        initialize: function () {
            GenericText._super.initialize.call(this);
            this._modelChanged = false;
        },

        setAttribute: function (value, attrName) {
            GenericText._super.setAttribute.call(this, value, attrName);
            this._modelChanged = true;
        },

        _computeJsonDiff: function (diff_level) {
            /*
             * Since we do not maintain initialJson or templateJson for DOM elements, we use this approximate method to compute jsonDiff.
             * This assumes that all attr changes would happen through setAttribute API.
             * seeAlso: DOMElement and NodeValue
             */
            // must pass 'this' node as argument array to computeDomJsonDiff
            return xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, diff_level>0, xfalib.ut.XfaUtil.prototype.computeDomJsonDiff, [this]);
        }

    });

    GenericText.defineProps({
        "value": {
            get: function () {
                return this.jsonModel._value;
            },
            set: function (value) {
                if (value !== this.jsonModel._value) {
                    this._modelChanged = true;
                    var oldVal = this.jsonModel._value
                    this.jsonModel._value = this.validateInput(value, "string", this.jsonModel._value);
                    var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED, this, this.className, oldVal, this.jsonModel._value);
                    this.trigger(event.name, event);
                }
            }
        }
    });

})(_, xfalib);

(function (_, xfalib) {
    var DOMElement = xfalib.script.DOMElement = xfalib.script.Element.extend({
        _default: "value",
        initialize: function () {
            DOMElement._super.initialize.call(this);
            this._normalizePending = true;
            this._childrenInitializePending = true;
            this._childModified = false;
            this._modelChanged = false;
        },

        handleEvent: function (evnt) {
            if (evnt.name == xfalib.script.XfaModelEvent.DOM_CHANGED) {
                evnt._property = this.className + "." + evnt._property;
                this.trigger(evnt.name, evnt);
            }
        },

        _initChildren: function () {
        },

        _initialize: function () {
            //do nothing
        },

        _initChildrenInternal: function () {
            var children = new Array();
            var tempNameContainer = {};
            if (this.jsonModel.children) {
                var j = 0;
                for (var i = 0; i < this.jsonModel.children.length; i++) {
                    var child = this.jsonModel.children[i];
                    var childModel = xfalib.script.XfaModelRegistry.prototype.createModel(child);
                    children[j++] = childModel;
                    childModel.parent = this;
                    childModel.on(xfalib.script.XfaModelEvent.DOM_CHANGED, this);
                    childModel._initialize();
                    if (childModel.name) {
                        var nameIndex = tempNameContainer[childModel.name] || 0;
                        childModel.index = nameIndex;
                        nameIndex++;
                        tempNameContainer[childModel.name] = nameIndex;
                    }
                    if (childModel.className) {
                        var classIndex = tempNameContainer["#" + childModel.className] || 0;
                        childModel.mnClassIndex = classIndex;
                        classIndex++;
                        tempNameContainer["#" + childModel.className] = classIndex;
                    }
                }
                this._moChildNodes = children;
            }
        },

        _getNakedThis: function () {
            if (this._normalizePending) {
                this.normalizeChildren();
                this._normalizePending = false;
            }
            return DOMElement._super._getNakedThis.call(this);
        },

        setAttribute: function (value, attrName) {
            DOMElement._super.setAttribute.call(this, value, attrName);
            this._modelChanged = true;
        },

        _postAddChild: function (oNode) {
            DOMElement._super._postAddChild.call(this, oNode);
//            if(oNode instanceof xfalib.script.DOMElement)
            //        oNode.on(xfalib.script.XfaModelEvent.DOM_CHANGED,this) ;
            this._childModified = true;
            oNode._newChild = true;
        },

        _postRemoveChild: function (oChild) {
            DOMElement._super._postRemoveChild.call(this, oChild);
            this._childModified = true;
        },

        playJson: function (pJsonModel) {
            if (_.contains(["value", "items"], this.className)) {
                xfalib.script.Element.prototype.playJson.call(this, pJsonModel);
            }
        },

        _computeJsonDiff: function (diff_level) {
            if (diff_level) {
                return {
                    "changed": false,
                    "jsonDifference": {}
                };
            } else { // not called during submission
                if (this._newChild) {
                    return {
                        "changed": true,
                        'jsonDifference': this.jsonModel
                    };
                } else {
                    /*
                     * Since we do not maintain initialJson or templateJson for DOM elements, we use this approximate method to compute jsonDiff.
                     * This assumes that all attr changes would happen through setAttribute API.
                     * seeAlso: GenericText and NodeValue
                     */
                    var selfDiff = xfalib.ut.XfaUtil.prototype.computeDomJsonDiff.call(this, this),
                        childrenDiff = [],
                        changed = selfDiff.changed || this._childModified,
                        childChanged = false,
                        jsonDifference = selfDiff.jsonDifference;

                    _.each(this.moChildNodes, function (mChild) {
                            var childDiff = mChild._computeJsonDiff(diff_level) || {};
                            childChanged = childChanged || childDiff.changed;
                            if (childDiff.changed && !_.isEmpty(childDiff.jsonDifference)) {
                                childrenDiff.push(childDiff.jsonDifference);
                            }
                        },
                        this);
                    if (this._childModified || childChanged) {
                        jsonDifference.children = childrenDiff;
                    }

                    return {
                        "changed": changed,
                        "jsonDifference": jsonDifference
                    };
                }
            }
        },

        /**
         * Return the DataSOMMap after adding an entry in the map for the node. The entry contains the value of the node
         * along with its Data SOM. If there is no Data SOM then return the unmodified map
         * @param map
         * @private
         */
        _getDataSomMap : function (map) {
            return map;
        },

        /**
         * Update the value of the node with the value provided in the input map. The map contains the values of the fields
         * mapped with their DataSOM. The function is empty for all the nodes, except for Field, Subform and Area.
         * @param map
         * @private
         */
        _restoreDataSomMap : function (map) {

        },

        _playDataXML: function (rootNode, contextNode) {

        },

        generateDataXML: function (xmlDocument, contextNode) {

        }

    });

    DOMElement.defineProps({
        moChildNodes: {
            get: function () {
                if (this._childrenInitializePending) {
                    this._initChildrenInternal();
                    this._childrenInitializePending = false;
                }
                return this._moChildNodes;
            },
            set: function (value) {
                this._moChildNodes = value;
            }
        }

    });

})(_, xfalib);



/**
 * @package xfalib.script.ContainerNode
 * @import xfalib.script.Element
 * @fileOverview The file creates the Container Element Class required for XFA
 *               library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * @class The class represents all the XFA Objects which can contain other XFA
     *        nodes inside them
     * @extends com.adobe.xfa.scripting.Element
     *
     * @property {Array} children children of the ContainerNode
     *
     * @constructor
     * @param {string}
        *            name the name of the node
     *
     */
    var ContainerNode = xfalib.script.ContainerNode = xfalib.script.Element.extend({
        _isXFAContainerNode : function() {
            return true;
        }

    });

})(_, xfalib);


(function(_,xfalib){
    var EventContainerNode = xfalib.script.EventContainerNode = xfalib.script.ContainerNode.extend({
        _defaults : {
            "access" : "open",
            "event" : {
                "type" : "click" //ideally, this should be activity
            },
            "validate" : {
                "disableAll" : "0",
                "formatTest" : "warning",
                "nullTest" : "disabled",
                "scriptTest" : "error",
                "message" : {
                    "defaultMessage" : {
                        value: xfalib.locale.Strings.validationIssue
                    }
                }
            }
        },

        initialize : function(){
            EventContainerNode._super.initialize.call(this);
            /**
             * @private
             * @type Object
             */
            this.moEvents = {};
            /**
             * marks the event that are fired in the current script execution as true.
             *
             * @private
             * @type Object
             */
            this.mActiveEvents = {};
            this._errorText = null;
            this._mFailedValTest = null;
            this._mFailedValLevel = null; //can be warning or error
            this.dependant = [];
            this.tests= null; //must be overridden by sub classes
            /**
             * @private
             * @type string
             */
            this.mEffectiveAccess = null;
            //Initialize events array
            this._addEvents();
            this._eventListener();

            this._moContext = null;  // will cache the nakedReferences for each EventContainerNode
         },

        // visit this and all child nodes recursively
        _visitAllmoChildren: function (visitor) {
            if (_.isFunction(visitor)) {
                visitor(this);
            }

            _.each(this.moChildNodes, function (child) {
                if (_.isFunction(child._visitAllmoChildren)) {
                    child._visitAllmoChildren(visitor);
                }
            });
        },


        _eventListener :function() {
            for ( var i = 0; i < this.moChildNodes.length; ++i) {
               var oNode = this.moChildNodes[i];
               if(oNode instanceof xfalib.script.DOMElement)
                  oNode.on(xfalib.script.XfaModelEvent.DOM_CHANGED,this) ;
             }
        },

        execInitialize : function() {
            if(!this._isField()){ //Ideally isField check should not be here but a short cut for now since it's the only excption.
                for ( var i = 0; i < this.moChildNodes.length; ++i) {
                    var oNode = this.moChildNodes[i];
                    if(oNode._isEventNode() && oNode.className != "pageSet"){
                        oNode.execInitialize();
                    }
                }
            }
            this.execEvent("initialize");
        },

        execFormReady : function() {
            if(!this._isField()){ //Ideally isField check should not be here but a short cut for now since it's the only excption.
                for ( var i = 0; i < this.moChildNodes.length; ++i) {
                    var oNode = this.moChildNodes[i];
                    if(oNode._isEventNode() && oNode.className != "pageSet"){
                        oNode.execFormReady();
                    }
                }
            }
            this.execEvent("$formready");
        },

        execLayoutReady : function() {
            if(!this._isField()){ //Ideally isField check should not be here but a short cut for now since it's the only excption.
                for ( var i = 0; i < this.moChildNodes.length; ++i) {
                    var oNode = this.moChildNodes[i];
                    if(oNode._isEventNode() && oNode.className != "pageSet"){
                        oNode.execLayoutReady();
                    }
                }
            }
            this.execEvent("$layoutready");
        },

        execCalculate : function() {
            if (!this._xfa().host.calculationsEnabled)
                return true;
            else if(!this._isField()){
                for ( var i = 0; i < this.moChildNodes.length; ++i) {
                    var oNode = this.moChildNodes[i];
                    if(oNode._isEventNode()){
                        oNode.execCalculate();
                    }
                }
            }
           this.execEvent("calculate");
        },

        execValidate : function() {
            if (!this._xfa().host.validationsEnabled)
                return true;
            var valid = true;
            if(!this._isField()){
                for ( var i = 0; i < this.moChildNodes.length; ++i) {
                    var oNode = this.moChildNodes[i];
                    if (oNode._isEventNode()){
                        if(!oNode.execValidate())
                            valid = false;
                    }
                }
            }
            valid = valid && this._validate([]);
            return valid;
        },

        /**
         *
         * creates a scope so that all the nodes accessible from this node
         * are available to the script event and returns the previous scope
         *
         * After executing the script the scope must be reset using _resetNakedReferencesScope
         * Not doing that will result in unstable state and cause serious issues
         *
         * @private
         * @function
         */
        _createNakedReferencesScope : function() {
            var startNode = this,
                currentIndex = this.index,
                oldContext = {};

            //store the old context in order to reset it.
            _.extend(oldContext,xfalib.runtime._private);

            //TODO: optimize to check with lastNakedSubform
            if (this._moContext == null) {
                xfalib.runtime._private = {};
                while (startNode) {
                    startNode.nakedFieldReferences(currentIndex, true, xfalib.runtime);
                    currentIndex = startNode.index;
                    startNode = startNode.parent;
                }
                this._moContext = xfalib.runtime._private;    // just copy ref as we are recreating xfalib.runtime._private
            } else {
                xfalib.runtime._private = this._moContext;
            }
            return oldContext;
        },

        /**
         *
         * The function should be called after executing the script to reset the scope
         * Not doing that will result in unstable state and cause serious issues
         *
         * @private
         * @function
         */
        _resetNakedReferencesScope : function(scope) {
            xfalib.runtime._private = {};
            _.extend(xfalib.runtime._private, scope);
        },

        /**
         * @private
         * @function
         * @param {string} eventName captures the event and sends it to the {@link _eventHandler}
         */
        execEvent : function(eventName, detail) {
            if(typeof this.moEvents[eventName] === "undefined") {
                if(this._xfa().moContextNodes.length == 0) {
                    this._xfa().runCalcAndValidate();
                }
                return true;
            }
            xfalib.runtime.xfa.Logger.debug("xfa", eventName+" fired for "+this.somExpression);
            //use standard event names instead of our home made names to match what pdf returns to user
            var stdEventName = this.xfaUtil()._xtgEventName[eventName] ? this.xfaUtil()._xtgEventName[eventName] : eventName;
            switch(eventName){
                case "change":
                    if (detail===undefined)
                        var $event = new xfalib.script.XfaModelEvent({"jsonModel":{"name":stdEventName,"target":this}});
                    else
                        var $event = new xfalib.script.XfaModelEvent({"jsonModel":{"name":stdEventName,"target":this,
                            "prevText":detail.prevText,"newText":detail.newText,"keyDown":detail.keyDown,
                            "modifier":detail.modifier,"shift":detail.shift,"change":detail.change,"fullText":detail.fullText}});
                    break;
                case "click":
                    if (detail===undefined)
                        var $event = new xfalib.script.XfaModelEvent({"jsonModel":{"name":stdEventName,"target":this}});
                    else
                        var $event = new xfalib.script.XfaModelEvent({"jsonModel":{"name":stdEventName,"target":this,"modifier":detail.modifier,"shift":detail.shift}});
                    break;
                default:
                    var $event = new xfalib.script.XfaModelEvent({"jsonModel":{"name":stdEventName,"target":this}});

            }
            xfalib.runtime.$event = $event;
            this._xfa().event = $event;
            xfalib.runtime.event = xfalib.acrobat.AcroEvent.cloneEvent($event);
            if(this.access == "protected" && eventName!=="calculate" && eventName!== "validate") {
                return;
            }
            if (this.mActiveEvents[eventName]) {
                return;
            }
            this.mActiveEvents[eventName] = true;
            this._xfa()._pushContextNode(this);
            this._xfa().moContextScriptEvent = eventName;

            var oldScope = this._createNakedReferencesScope();

            var temp$ = $;
            $ = this;
            var rValue = this._eventHandler(eventName);
            $ = temp$;
            this.mActiveEvents[eventName] = false;
            this._xfa()._popContextNode();
            this._xfa().moContextScriptEvent = null;

            $event = null;
            if(this._xfa().moContextNodes.length == 0) {
                this._xfa().runCalcAndValidate();
            } else {
                this._resetNakedReferencesScope(oldScope);
            }
            return rValue;
        },

        handleDomEvent: function(evnt) {
            this.trigger(evnt.name,evnt);
        },

        handleEvent : function(event) {
            switch (event.name) {
                case xfalib.script.XfaModelEvent.OBJECT_DESTROYED:
                    return this.removeDependant(event.target);
                case xfalib.script.XfaModelEvent.DOM_CHANGED:
                      this.handleDomEvent(event)
                default:
                    //xfa.Logger.debug("event " + event.name + " not supported");
                    return false;
            }
        },

        addDependant: function(oNode) {
            if(!~this.dependant.indexOf(oNode) && oNode != this)
                this.dependant.push(oNode);
        },

        _addEvents : function() {
            var events = _.filter(this.moChildNodes, function(childModel){
               return childModel.className == "event";
            });
            if (events && events.length > 0) {
                for ( var i = 0; i < events.length; i++) {
                    var event = events[i];
                    // ref was added to support formReady and layoutReady where the event names are available as
                    //$formReady and $layoutReady (check - _xtgEventName in the class: XfaUtil.js).
                    // When we add a style to an element, designer adds a ref value of '$'
                    //which is also the default. In such a scenario the event names become $click, $change, etc. To
                    //handle this for now (without a full implementation of ref) we are removing the $ default value
                    //and setting it as $click -> click, etc. For details on ref:
                    //http://blogs.adobe.com/formfeed/2009/03/xfa_30_event_propagation.html
                    var ref = (event.ref || "");
                    if(ref == "$") ref = "";
                    var type = ref + event.activity;
                    this.moEvents[type] = this.moEvents[type] || [];
                    var eventChild = event.oneOfChild;
                    switch(eventChild.className) {
                        case "script":
                            if(eventChild.value!=null && (eventChild.runAt === "server" || eventChild.value.trim().length >0))
                                this.moEvents[type].push(new xfalib.script.ExecutableScript({"jsonModel" : eventChild.jsonModel}));
                            break;
                        case "submit":
                            this.moEvents[type].push(new xfalib.script.Submit({"jsonModel" : eventChild.jsonModel}));
                            this._xfa()._newSubmitButton(this);  //TODO: What is it
                            break;
                    }
                }
            }

            var calcChild =  _.find(this.moChildNodes, function(childModel){
                return childModel.className == "calculate";
            });
            if(calcChild) {
                var calcScr = _.find(calcChild.moChildNodes, function(childModel){
                    return childModel.className == "script";
                });
                if(calcScr) {
                    this.moEvents["calculate"] = [new xfalib.script.CalculateScript({"jsonModel" : calcScr.jsonModel})];
                }
            }

            var validChild =  _.find(this.moChildNodes, function(childModel){
                return childModel.className == "validate";
            });
            if(validChild) {
                var validScr = _.find(validChild.moChildNodes, function(childModel){
                    return childModel.className == "script";
                });
                if(validScr) {
                    this.moEvents["validate"] = [new xfalib.script.ValidateScript({"jsonModel" : validScr.jsonModel})];
                }
            }

            //is it a good idea to create behaviorConfig at the formbridge or xfalib.runtime level???
            var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);

            //To maintain backward compatibility
            if(behaviorConfig.isOn('dataDependentFloatingField') || behaviorConfig.isOn('mfDataDependentFloatingField')) {
                //this is inserted by server when a draw element contains floating fields.
                var resolveChild = _.find(this.moChildNodes, function(childModel){
                    return childModel.className == "resolve";
                });
                if (resolveChild) {
                    this.moEvents["calculate"] = [];
                    this.moEvents["calculate"].push(new xfalib.script.FloatingFieldScript());
                }
            }
        },

        /**
         * @private
         * @function
         * @param {string} eventName Event Handler function to handle events thrown
         */
        _eventHandler : function(eventName) {
            var rValue = undefined;
            switch (eventName) {
                case "validate":
                    rValue = true;
                    break;
            }
            return rValue;
        },

        _handleDependants: function() {
            for(var i =0;i<this.dependant.length;i++) {
                this._xfa().queueCalcEvent(this.dependant[i]);
            }
        },

        _isEventNode : function(){
            return true;
        },

        removeDependant: function(oNode) {
            this.dependant = _.without(oNode);       //TODO: What is it, no second argument?
        },

        _checkTests: function(sMessages) {
            var valid = true;
            var tests = this.tests || [];
            for(var i = 0;i<tests.length;i++) {
                valid = tests[i].apply(this,arguments);
                if(!valid)
                    break;
            }
            return valid;
        },

        _scriptTest : function(sMessages) {
            var valid = true;
            var valid = this.execEvent("validate");
            if (valid === false) {
                this._mFailedValTest = "scriptTest";
                this._mFailedValLevel  = this.getOrElse(this.validate.scriptTest, this._defaults.validate.scriptTest) ;
                this._errorText = this.validationMessage;
                this._addMessage(sMessages, this._errorText, this._mFailedValLevel);
            }
            return valid;
        },

        _validate : function(sMessages) {
            var oldFailedTest = this._mFailedValTest;
            var oldValid = this._errorText ? false : true;
            this._mFailedValTest = null;
            this._mFailedValLevel = null;
            this._errorText = null;
            var childValid = true;
            if (this._xfa().host.validationsEnabled) {
                for ( var i = 0; i < this.moChildNodes.length; i++) {
                    var childNode = this.moChildNodes[i];
                    if(childNode._isEventNode())
                        childValid = this.moChildNodes[i]._validate(sMessages) && childValid;
                }
                var valid = this._checkTests(sMessages) && childValid;
                if(valid==false) {
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this,"ValidationState",
                        this._mFailedValLevel, this._errorText);
                    this.trigger(evnt.name,evnt);
                    // true indicating that previously this field is not having error
                    // false indicating that now this field is having an error
                } else {
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                        this,"ClearError",null, null);
                    this.trigger(evnt.name,evnt);
                    // false indicating that previously this field is  having error
                    // true indicating that now this field is having an error i.e. error Cleared
                }
                xfalib.ut.XfaUtil.prototype._triggerOnBridge("elementValidationStatusChanged", this, "validationStatus", !valid, valid);
                //TODO: show the error to user.
                if (this._mFailedValTest != oldFailedTest || valid != oldValid)
                    this.execEvent("validationState");
            }
            return valid;
        },

        _addMessage : function(sMessages, sMessage, sSeverity) {
            if (sMessage) {
                var oMessageObject = new Object();
                oMessageObject.message = sMessage;
                oMessageObject.severity = sSeverity;
                oMessageObject.ref = this.somExpression;
                sMessages.push(oMessageObject);
            }
        },

        _calculateEffectiveAccess : function() {
            var parentAccess = this.parent ? this.parent.mEffectiveAccess: "open"
            var newEffAccess = (this.access === "open" && parentAccess)?parentAccess :this.access;
            if(this.mEffectiveAccess != newEffAccess)
            {
                var oldVal = this.mEffectiveAccess;
                this.mEffectiveAccess = newEffAccess;
                this._updateChildrenEffectiveAccess();
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                    this,"access",oldVal,this.mEffectiveAccess);
                this.trigger(evnt.name,evnt);
            }
        },

        _updateChildrenEffectiveAccess : function() {
            if(!this._isField()){ //Ideally isField check should not be here but a short cut for now since it's the only exception.
                _.each(this.moChildNodes, function(elem) {
                    if(elem._isEventNode())
                        elem._calculateEffectiveAccess();
                })
            }
        },

        playJson : function(pJsonModel) {
            //Only handle special properties which has private property in model. Need a review of access property
            if (this._xfa()._templateSchema.hasAttribute(this.className, 'access')) {
                this.access = pJsonModel.access;
            }
            if (this._xfa()._templateSchema.hasAttribute(this.className, 'presence')) {
                this.presence = pJsonModel.presence; //Watson bug 3787002 : presence property changed by server side scrip
            }
            EventContainerNode._super.playJson.call(this, pJsonModel);
        },

        scopeless : function() {
            // TODO: check isArea
            return this.getAttribute("name").length == 0;
        },

        _resetData : function() {
            for ( var i = 0; i < this.moChildNodes.length; i++) {
                var oNode = this.moChildNodes[i];
                oNode._resetData();
            }
        },

        nakedFieldReferences : function(nIndex, createGetterSetter,obj) {
            for ( var i = 0; i < this.moNormalizedChildren.length; i++) {
                var oNode = this.moNormalizedChildren[i];
                if(this._requireGetterSetter(oNode))
                    oNode.getNaked(nIndex, createGetterSetter, obj,this);
            }
        },

        // return the traversal object
        getTraversalObject : function () {
            var children = this.getOrElse(this, "jsonModel.children", null),
                traversalObj = null;
            if(children) {
                traversalObj = _.find(children, function(child){ return child._class == "traversal"; });
            }
            return traversalObj;
        },

        // return NEXT/FIRST traversal object based on the operation(first/next) provided
        getNextTraversalSom : function (operation) {
            var traverse = null,
                traversalRef = null,
                traversalObj = this.getTraversalObject();
            if (traversalObj && (traverse = traversalObj.children)) {
                if (operation == xfalib.template.Constants.firstTraversal) {
                    traversalRef = _.find(traverse, function(child){ return child.operation == xfalib.template.Constants.firstTraversal});
                } else { // only first and next are supported and if no operation is mentioned then it is treated as next
                    traversalRef = _.find(traverse, function(child){ return child.operation != xfalib.template.Constants.firstTraversal});
                }
            }
            // TO DO: add handling for script in reference
            return traversalRef && this.resolveNode(traversalRef.ref) ? this.resolveNode(traversalRef.ref).somExpression : null;
        }

    });

    EventContainerNode.defineProps({
        "validate" : {
            get : function() {
                return this.getElement("validate", 0);
            },
            set : function(val) {
                return this.setElement(val,"validate");
            }
        },

        "errorText" : {
            get : function(){
                return this._errorText || "";
            }
        },

        "validationMessage" : {
            get : function() {
                var m = this.getOrElse(this.validate.message.scriptTest, this._defaults.validate.message.defaultMessage);
                return m.value;
              },
            set : function(val) {
                var nodes = this.validate.message.nodes;
                if(nodes.namedItem("scriptTest") === null) {
                    var node = this._xfa().form.createNode("text","scriptTest");
                    nodes.append(node);
                }
                this.validate.message.scriptTest.value =val;
                this.execValidate() ;
            }

        },

        "access" : {
            get : function() {
                return this.getOrElse(this.jsonModel.access, this._defaults.access);
            },
            set : function(vAccess) {
                vAccess = this.validateInput(vAccess, this._getDataType("access"), this.jsonModel.access);
                if (this.jsonModel.access != vAccess) {
                    this.jsonModel.access = vAccess;
                    this._calculateEffectiveAccess();
                }
            }
        },

        "relevant" : {
            get : function() {
                return this.getAttribute("relevant");
            },
            set : function(val) {
                val = this.validateInput(val, this._getDataType("relevant"), this.jsonModel.relevant) ;
                if (this.getAttribute("relevant") != val) {
                    this.jsonModel.relevant = val;
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                        this,"relevant",null,val);
                    this.trigger(evnt.name,evnt);
                }
            }
        },

        "desc" : {
            get : function() {
                return this.getElement("desc",0)
            }
        }

    });

})(_,xfalib);
/**
 * @package xfalib.script.Content
 * @import xfalib.script.Node	
 * @fileOverview The file creates the Content Node Class required for XFA library
 * @version 0.0.1
 */

//goog.provide('com.adobe.xfa.scripting.Content');
//
//goog.require('com.adobe.xfa.scripting.Node');

(function(_, xfalib){
    var Content = xfalib.script.Content = xfalib.script.Node.extend({
        msClassName: "content",
        /**
         * @private
         * @function
         * @returns {boolean} returns whether the node is an instance of a content Node or not
         */
        _isContent : function() {
            return true;
        }
    });
})(_, xfalib);


/**
 * @package xfalib.script.NodeValue
 * @import xfalib.ut.Class
 */


(function (_, xfalib) {
    var NodeValue = xfalib.script.NodeValue = xfalib.script.Content.extend({

        _default: "value",
        initialize: function () {
            NodeValue._super.initialize.call(this);
            this.jsonModel._value = this.jsonModel._value || null;
            this._initialJsonString = JSON.stringify(this.jsonModel);
            this._modelChanged = false;
        },

        _initialize: function () {
            NodeValue._super._initialize.apply(this, arguments);
            if (this._isFieldDescendant()) {
                this._modelChanged = true;
            }

        },

        /*
         * converts a value into the designated type. null is a valid value
         * for all types. For invalid value it returns undefined
         */
        typedValue: function (val, contentType) {
            if (typeof val === "undefined")
                return undefined;
            if (val === null || val === "")
                return null;
            return val;
        },

        /*
         * returns the typed value. since we never store undefined values
         * it always returns valid value
         */
        getValue: function (contentType, skipTypeCheck) {
            if(skipTypeCheck === true) {
                return this.jsonModel._value;
            }
            return this.typedValue(this.jsonModel._value, contentType);
        },

        _storeValue: function (val, typeVal) {
            this.jsonModel._value = val;
        },

        /*
         * converts val to its typed version and if val is valid stores
         * it.
         * returns whether the new value is different from the old one.
         */
        setValue: function (val, skipTypeCheck) {
            var oldVal = this.jsonModel._value,
                typeVal = this.typedValue(val),
                retVal = false;

            if (skipTypeCheck === true || typeof typeVal !== "undefined") {
                this._storeValue(val, typeVal);
                retVal = this.typedValue(oldVal) !== typeVal;
                this._modelChanged = true;  // LC-5465 : all field's whose value is set is to be reflected in jsonDiff
            }
            return retVal;
        },

        equals: function (oVal) {
            return (this.getValue() === oVal.getValue());
        },

        _computeJsonDiff: function () {
            /*
             * Since we do not maintain initialJson or templateJson for DOM elements, we use this approximate method to compute jsonDiff.
             * Since value API is not as simple as other DOM api, we simply compare old and new json string to check if anything has changed
             * seeAlso: DOMElement and GenericText
             */
            var jsonStr = JSON.stringify(this.jsonModel);
            var changed = (this._initialJsonString != jsonStr);
            var jsonDiff = changed ? this.jsonModel : {_class: this.className, name: this.jsonModel.name};
            if (!changed && this._modelChanged)
                jsonDiff._value = this.jsonModel._value;
            return {
                "changed": this._modelChanged,
                jsonDifference: jsonDiff
            };
        },

        _isFieldDescendant: function () {
            var grandParent = this.getOrElse(this, "parent.parent", null);
            if (grandParent && grandParent.className == "field") {
                return true;
            }
            else {
                return false;
            }

        },

        playJson: function (pJsonModel) {
            if (pJsonModel._value != this.jsonModel._value) {
                this._modelChanged = true;
            }
            NodeValue._super.playJson.apply(this, arguments);
            if (typeof pJsonModel._value == "undefined")
                this.jsonModel._value = null;
        }
    });

    NodeValue.defineProps({
        "presence": {
            get: function () { //i am not sure how to make this property undefined so just removed setters
                return undefined;
            }
        },

        "value": {
            get: function () {
                return this.getValue();
            },

            set: function (sValue) {
                this.setValue(sValue);
                var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED, this, this.className, null, this.value);
                this.trigger(event.name, event);
            }
        }

    });

})(_, xfalib);

/**
 * @package xfalib.script.ImageValue
 * @import xfalib.script.NodeValue
 */

(function (_, xfalib) {
    var ImageValue = xfalib.script.ImageValue = xfalib.script.NodeValue.extend({
        msClassName: "image"
    });
    ImageValue.defineProps({
        "href": {
            get: function () {
                return this.getAttribute("href");
            }
        }
    });
}(_, xfalib));/**
 * @package xfalib.script.TextValue
 * @import xfalib.script.NodeValue
 */

(function(_, xfalib){
    var TextValue = xfalib.script.TextValue = xfalib.script.NodeValue.extend({
        msClassName: "text",
        typedValue : function(val) {
            var tValue = TextValue._super.typedValue.call(this, val);
            if (tValue != null)
                tValue = tValue.toString();
            return tValue;
        }

    });

    TextValue.defineProps({
        "maxChars" : {
            get : function() {
                return this.getOrElse(this.jsonModel.maxChars, "0") ;
            },
            set : function(value) {
                if(value < 0 && value == parseInt(value))
                    value = "0";
                if(value >= 0 && value == parseInt(value))   {
                    this.jsonModel.maxChars = value;
                    value = (value == "0")?"255":value;
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED,
                        this,"maxChars",value, null);
                    this.trigger(evnt.name,evnt);
                }
            }
        }
    })
})(_, xfalib);

/**
 * @package xfalib.script.ExDataValue
 * @import xfalib.script.NodeValue
 */

(function(_, xfalib, $){

    var ExDataValue = xfalib.script.ExDataValue = xfalib.script.NodeValue.extend({
        msClassName: "exData",
        initialize : function(){
            ExDataValue._super.initialize.call(this);
            this._$internalXMLDoc = null;
            this._origTmpltVal = null;
        },

        _computeJsonDiff: function() {
            return {"changed" : true,
                jsonDifference : this.jsonModel
            };
        },

        typedValue: function(val, contentType) {
            //if contentType is not passed -> derive it from contentType attribute
            if(!contentType)
                contentType = this.getAttribute("contentType");
            switch(contentType) {
                case "text/plain":
                    return ExDataValue._super.typedValue.apply(this,[val]);
                case "text/xml":
                    if(val == null || val.length == 0)
                         return null;
                    try {
                        this._$internalXMLDoc = $.parseXML(val);
                    } catch(e) {
                        this._xfa().Logger.error("Invalid XML for the field");
                        return undefined;
                    }
                    //IE 9 supports XMLSerializer
                    return XMLSerializer ? (new XMLSerializer()).serializeToString(this._$internalXMLDoc): val
                case "text/html":
                    if(!(val && xfalib.ut.XfaUtil.prototype.isHTML(val))) {
                        if(this._$internalHTML == null) {
                           this._$internalHTML = $("<body><p></p></body>");
                        }
                        this._$internalHTML.html(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(val));
                    } else {
                        var $val = $(val);
                        this._$internalHTML = $val;
                    }
                    return this._$internalHTML.text();
                default:
                    return ExDataValue._super.typedValue.apply(this,[val]);
            }
        },

        saveXML: function() {
            var prefix = '<?xml version="1.0" encoding="UTF-8"?>' +
                         '<exData contentType="text/html" xmlns="http://www.xfa.org/schema/xfa-template/3.6/">' +
                         '<body xmlns="http://www.w3.org/1999/xhtml" xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">',
                suffix = '</body></exData>',
                strXML = this.jsonValue;

                // TODO : use jQuery or XMLparser to do this more reliably
                if(strXML.indexOf("<body") >=0)
                    strXML = strXML.slice(strXML.indexOf(">", strXML.indexOf("<body"))+1);
                if(strXML.lastIndexOf("</body>") >=0)
                    strXML = strXML.slice(0,strXML.lastIndexOf("</body>"));

           return prefix + strXML + suffix ;
        },

        loadXML: function(strXML) {
        //TODO : add support for other params to loadXML, as of now all calls are equivalent to loadXML(x,true,true)
            var dispValue;
            if(strXML.indexOf("<body") != -1 && strXML.lastIndexOf("</body>") != -1) { // assuming a well formed valid XML string
                dispValue = strXML.slice(strXML.indexOf(">", strXML.indexOf("<body"))+1,strXML.lastIndexOf("</body>")); // get contents within <body> tags
            }
            if(this.getAttribute("contentType") == 'text/html') {
                if(dispValue.indexOf('<span>') != 0) {
                    dispValue = '<span>' + dispValue + '</span>';  // in case of multiple html elements, wrap in a span, else they overlap !!
                }

                var $internalHTML = $('<span>'+ dispValue +'</span>');
                $internalHTML.find("p").eq(0).css('display','inline');
                dispValue = $internalHTML.html();   // get the inner html with all markups

                this.jsonValue = dispValue;
            } else {
                dispValue = '<body>' + dispValue + '</body>';
                this.value = dispValue;
            }
          }
    });

    ExDataValue.defineProps({
        "jsonValue": {  // should use it to circumvent 'typedValue', which strips html tags
            get: function () {
                return this.jsonModel._value;
            },

            set: function (sValue) {
                if(_.isNull(this._origTmpltVal)) {
                    this._origTmpltVal = this.jsonModel._value;
                }
                this._modelChanged = true;  // just to be consistent & safe with 'value'

                if(sValue !== this.jsonModel._value) {
                    this.jsonModel._value = sValue;
                    var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.DOM_CHANGED, this, this.className, null, sValue);
                    this.trigger(event.name, event);
                }
            }
        }
    });
})(_, xfalib, $);

/**
 * @package xfalib.script.IntegerValue
 * @import  xfalib.script.NodeValue
 */

(function(_, xfalib){
    var IntegerValue = xfalib.script.IntegerValue = xfalib.script.NodeValue.extend({
        msClassName: "integer",
        typedValue : function(val) {
            var tValue = IntegerValue._super.typedValue.call(this, val);
            if (tValue != null) {
                tValue = parseInt(tValue);
                if (isNaN(tValue))
                   tValue = undefined;
            }
            return tValue;
        }
    });
})(_, xfalib);
/**
 * @package xfalib.script.DecimalValue
 * @import xfalib.script.NodeValue
 */

(function(_, xfalib){
    var DecimalValue = xfalib.script.DecimalValue = xfalib.script.NodeValue.extend({
        msClassName: "decimal",

        typedValue : function(val) {
            var tValue = DecimalValue._super.typedValue.call(this, val);
            if (tValue) {
                tValue = parseFloat(tValue);
                if (isNaN(tValue))
                    return undefined;
                var str = tValue + '';
                var len = str.length;
                var leadD = str.indexOf(".");
                var fracD = len - leadD - 1;
                if(fracD > this.fracDigits && this.fracDigits != -1)
                    tValue = parseFloat(tValue.toFixed(this.fracDigits));
                if(leadD > this.leadDigits && this.leadDigits != -1)
                    tValue = null;
            }
            return tValue;
        }
    });

    DecimalValue.defineProps({
        "fracDigits" : {
            get : function(){
                return this.getAttribute("fracDigits")
            }
        },

        "leadDigits" : {
            get : function(){
                return this.getAttribute("leadDigits")
            }
        }
    });
})(_, xfalib);


/*
 * @package xfalib.script.FloatValue
 * @import xfalib.script.NodeValue
 */
  

(function(_, xfalib){
    var FloatValue = xfalib.script.FloatValue = xfalib.script.NodeValue.extend({

        msClassName: "float",
        typedValue : function(val) {
            var tValue = FloatValue._super.typedValue.call(this, val);
            if (tValue) {
                tValue = parseFloat(tValue);
                if (isNaN(tValue))
                    return undefined;
                
            }
            return tValue;
        }
    });
})(_, xfalib);/*
 * @package xfalib.script.DateValue
 * @import xfalib.script.NodeValue
 */


(function(_, xfalib){
    var DateValue = xfalib.script.DateValue = xfalib.script.NodeValue.extend({
        msClassName: "date",
        typedValue : function(val) {
            var tValue = DateValue._super.typedValue.call(this, val);
            if (tValue) {
                tValue = xfalib.ut.DateInfo.Parse(tValue);
                if (tValue == null)
                    return undefined;
                tValue = tValue.getISODate();
            }
            return tValue;
        }
    });
})(_, xfalib);/**
 * @package xfalib.script.Form
 * @import xfalib.script.ContainerNode
 */

(function (_, xfalib) {
    /**
     * @class
     * <p>
     * The Form class is the implementation of the top level XFA form object.
     * </p>
     *
     * <p>
     * The form object is accessed from the xfa object as xfa.form
     * </p>
     *
     */
    var DataNode = xfalib.script.DataNode = xfalib.ut.Class.extend({
        initialize : function() {
            this.jsonModel.value = null;
            this.fields = [];
        },

        getId : function () {
            return this.jsonModel.id;
        },

        /**
         * will sync fields having same dataId (same bindref or use global)
         * @param model
         */
        addField : function (model) {
            if (this.fields.length === 0 && model.rawValue != null) { // loose check for null/undef
                this.jsonModel.value = model.rawValue; // initialize dataNode group's value to 1st hierarchically reached field
            } else {
                model.rawValue = this.jsonModel.value;
            }
            this.fields.push(model);
            model.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
        },

        handleEvent : function (evnt) {
            switch (evnt.name) {
                case xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED:
                    this.handleModelChanged(evnt);
                    break;
                default:
                    xfalib.runtime.xfa.Logger.debug("xfa", 'Unexpected  Event  "{0}" thrown in dataNode with id : "{1}" ', [evnt.name, this.jsonModel.id]);
            }
        },

        handleModelChanged : function (event) {
            if (event._property === "rawValue") {
                this._handleValueChange(event);
            }
        },

        _handleValueChange : function (event) {
            this._updateLinkedFieldsValue(event.prevText, event.target);
        },

        /**
         * will update all linked fields to the new value passed in
         * @param newValue
         * @param target
         * @private
         * @memberof DataNode
         */
        _updateLinkedFieldsValue : function (newValue, target) {
            if (newValue !== undefined && newValue != this.jsonModel.value) { // loose type coercion here for int/str
                this.jsonModel.value = newValue;

                _.each(this.fields, function (field) {
                    if (field !== target) {
                        field.off(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this); // remove listeners to prevent event throw storm
                        field.rawValue = newValue;
                        field.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this); // re attach listeners
                    }
                }, this);
            }
        }
    });
})(_, xfalib);
/**
 * @package xfalib.script.ExecutableScript
 * @import xfalib.ut.Class
 */


(function(_, xfalib){
    var ExecutableScript = xfalib.script.ExecutableScript = xfalib.ut.Class.extend({
        _defaults : {
            "runAt" : "client"
        },

        initialize : function(){
            ExecutableScript._super.initialize.call(this);
            this._scriptFn = null;
        },

        execute : function(contextObj, eventName) {
            if(this.runAt == "server") {
                var options = {};
                options.activity = this.xfaUtil()._xtgEventName[eventName] ? this.xfaUtil()._xtgEventName[eventName] : eventName;
                options.contextSom = contextObj.somExpression;
                contextObj._xfa().host.runServerScript(options);
            }
            else {
                return this._executeLocal(contextObj, eventName);
            }
        },

        _executeLocal :  function(contextObj, eventName) {
            try {
                this.script.call(contextObj);      // TODO : The best way will be to use `with` so that eval can also be used without modifying anything
            } catch(exception) {
                contextObj._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-002"],[eventName, contextObj.somExpression,exception.message])
            }
            return undefined;
        }

    });

    ExecutableScript.defineProps({
        "runAt" : {
            get : function(){
                return this.getOrElse(this.jsonModel.runAt, this._defaults.runAt);
            }
        },

        "script" : {
            get : function() {
                if(this._scriptFn == null) {
                    var scriptContent = this.jsonModel._value;
                    try{
                        var content = "with(this) {\n\n with(xfalib.runtime) {\n\n" + scriptContent + "\n\n}\n\n }";
                        this._scriptFn = new Function(content);
                    }catch(exception) {
                        xfalib.runtime.xfa.Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-005"],[exception.message,scriptContent]);
                        this._scriptFn = new Function("");
                    }
                }
                return this._scriptFn;
            }
        }


    });

})(_, xfalib);

/**
 * @package xfalib.script.ValidateScript
 * @import xfalib.script.ExecutableScript
 */

(function(_, xfalib){
    var ValidateScript = xfalib.script.ValidateScript = xfalib.script.ExecutableScript.extend({

        initialize : function() {
            ValidateScript._super.initialize.call(this);
        },

        evalScript: function () {
            with(this){
                with(xfalib.runtime) {
                    var __XFA_evalValidateScriptRetVal__ = eval(arguments[0]); // LC-7319 : variable names passed in 'eval' are overridden due to enclosing 'with'
                }
            }
            return __XFA_evalValidateScriptRetVal__;
        },

        _executeLocal :  function(contextObj, eventName) {
            var rValue = true;
            try {
                if(this.script)
                    rValue = this.evalScript.call(contextObj,this.script);
                if(!rValue)
                    contextObj._xfa().Logger.debug("xfa", xfalib.locale.LogMessages["ALC-FRM-901-014"],[contextObj.somExpression,this.script])
            } catch(exception) {
                contextObj._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-002"],[eventName, contextObj.somExpression,exception.message])
                rValue = true;
            }
            return rValue;
        }

    });

    ValidateScript.defineProps({
        "script" : {
            get : function() {
                return this.jsonModel._value;
            }
        }
    });

})(_, xfalib);
/**
 * @package xfalib.script.CalculateScript
 * @import xfalib.script.ValidateScript
 */
(function(_, xfalib){
    var CalculateScript = xfalib.script.CalculateScript = xfalib.script.ValidateScript.extend({

        _executeLocal :  function(contextObj, eventName) {
            var rValue ;
            if(this.script){
                // pre_process
                contextObj._xfa()._pushCalculateEventNode(contextObj);

                try {
                    contextObj.rawValue = this.evalScript.call(contextObj,this.script)
                } catch(exception) {
                    contextObj._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-002"],[eventName, contextObj.somExpression,exception.message])
                }

                // post_process
                contextObj._xfa()._popCalculateEventNode();
            }
            return rValue;
        }

    });
})(_, xfalib);
/**
 * Created with IntelliJ IDEA.
 * User: rpandey
 * Date: 11/27/13
 * Time: 10:26 AM
 */
/**
 * @package xfalib.script.FloatingFieldScript
 * @import xfalib.script.CalculateScript
 */
(function(_, xfalib){
    var FloatingFieldScript = xfalib.script.FloatingFieldScript = xfalib.script.CalculateScript.extend({
        //Do we really need new class for FloatingFieldScript just for a different error message and a different script

        _executeLocal :  function(contextObj, eventName) {
            if(contextObj._resolveFloatingField){
                // pre_process
                contextObj._xfa()._pushCalculateEventNode(contextObj);

                try {
                    //Call _resolveFloatingField in this context
                    //this hard-coding decouples the server from script function name...
                    //Now it is only at the client side we keep the name of floating fields resolver script
                    this.evalScript.call(contextObj, '_resolveFloatingField()');
                } catch(exception) {
                    contextObj._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-019"],[contextObj.somExpression])
                }

                // post_process
                contextObj._xfa()._popCalculateEventNode();

            }

            return undefined;
        }

    });
})(_, xfalib);
/**
 * @package xfalib.script.Submit
 * @import xfalib.ut.Class
 */

(function(_, xfalib){
    var Submit = xfalib.script.Submit = xfalib.ut.Class.extend({

        initialize : function() {
            Submit._super.initialize.call(this);
        },

        execute : function(obj, eventName) {
            var options = {};
            if(this.target)
                options.action = this.target;
            options.format = this.format;
            options.textEncoding = this.textEncoding;

            formBridge.submitForm(options); //TODO: remove direct dependency on FormBridge
        }

    });

    Submit.defineProps({
        format : {
            get : function(){
                return this.getOrElse(this.jsonModel.format, null);
            }
        },

        target : {
            get : function(){
                return this.getOrElse(this.jsonModel.target, null);
            }
        },

        textEncoding : {
            get : function(){
                return this.getOrElse(this.jsonModel.textEncoding, null);
            }
        }

    });
})(_, xfalib);
/**
 * @package xfalib.script.Field
 * @import xfalib.script.Node
 * @import xfalib.script.XfaModelEvent
 * @fileOverview The file creates the Field Class required for XFA library
 * @version 0.0.1
 */

(function (_, xfalib) {
    /**
     * Creates a new Field class
     *
     * @constructor
     * @param {string}
     *            name the name of the Field
     * @param {string}
     *            rawVal initial value of the Field
     * @property {string} rawVal represents the data value in the node
     * @extends xfalib.script.Node
     */
    var Field = xfalib.script.Field = xfalib.script.EventContainerNode.extend({
        _defaults: {
            "items": {
                "save": "0"
            }
        },

        "_default": "rawValue",
        initialize: function () {
            Field._super.initialize.call(this);
            this.jsonModel["{default}"] = this._getValue();
            this.tests = [this._nullTest, this._formatTest, this._scriptTest];
            if (this.jsonModel.extras && this.jsonModel.extras.dataId)
                this._xfa().createDataNode(this.jsonModel.extras.dataId, this);
            for (var i = 0; i < this.moChildNodes.length; ++i) {
                var oNode = this.moChildNodes[i];
                oNode.on(xfalib.script.XfaModelEvent.DOM_CHANGED, this);
            }
            if (this.jsonModel.id) {
                this._xfa().Logger.debug("xfa", "Added field with id :" + this.jsonModel.id)
                this._xfa()._xfaTemplateCache.idMap[this.jsonModel.id] = this;
            }

            this.editPattern = this.getOrElse(this.jsonModel, "extras.editPatternEx", null);
        },

        playJson: function (pJsonModel) {
            Field._super.playJson.call(this, pJsonModel);

            // update data node cached value
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this,
                'rawValue', this.rawValue, this.formattedValue);
            this.trigger(evnt.name, evnt);
        },

        _setPattern: function (type, patterns, callback) {
            if (patterns && patterns.length) {
                this.jsonModel.extras = this.jsonModel.extras || {};
                _.each(patterns, function (pattern, i) {
                    pattern.locale = pattern.locale || this.locale
                }, this);
                this.jsonModel.extras[type] = patterns;
                return true;
            }
            return false;
        },

        handleDomEvent: function (evnt) {
            switch (evnt._property) {
                case "format.picture":
                    var res = this._setPattern("displayPatternEx",
                        xfalib.ut.PictureUtils.parsePictureClause(evnt.newText));
                    if (res) {
                        this._showDisplayFormat();
                    }
                    break;
                case "validate.picture":
                    var res = this._setPattern("validatePatternEx",
                        xfalib.ut.PictureUtils.parsePictureClause(evnt.newText));
                    if (res) {
                        this._validate([]);
                    }
                default:
                    xfalib.script.EventContainerNode.prototype.handleDomEvent.apply(this,
                        arguments);
            }
        },

        saveXML: function () {
            return this.rawValue;
        },

        loadXML: function (val) {
            //this.rawValue = val;
        },


        addItem: function (sDisplayVal, sSaveVal) {
            //call _getDisplayItems before saving any SaveItems.
            var sItems = this._getSaveItems(true);
            var dItems = this._getDisplayItems(true);

            var saveItem = {
                "_class": "text",
                "_value": sSaveVal === undefined ? sDisplayVal : sSaveVal
            };

            sItems._addChild(xfalib.script.XfaModelRegistry.prototype.createModel(saveItem));

            var displayItem = {
                "_class": "text",
                "_value": sDisplayVal
            };

            dItems._addChild(xfalib.script.XfaModelRegistry.prototype.createModel(displayItem));

            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                this, "addItem", saveItem._value, displayItem._value);
            this.trigger(evnt.name, evnt);
        },

        setItems: function (string, pair) {
            pair = pair === undefined ? 1 : pair;
            var that = this;
            var val = null;
            this.clearItems();
            var array = string.split(',');
            if (pair == 2) {
                array.forEach(function (entry, index) {
                    if (index % 2 == 1) {
                        that.addItem(elem, entry);
                        val = entry;
                    }
                    else
                        elem = entry;
                });
                if (array.length % 2)
                    that.addItem(elem);
                return true;

            }
            else if (pair == 1) {
                array.forEach(function (entry) {
                    that.addItem(entry);
                });
                return true;
            }
            else if (pair > 2)
                return  false;
            return;
        },

        clearItems: function () {
            var sItems = this._getSaveItems(false);
            var dItems = this._getDisplayItems(false);
            if (sItems)
                sItems._removeAll();
            if (dItems)
                dItems._removeAll();
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                this, "clearItems", null, null);
            this.trigger(evnt.name, evnt);
        },

        boundItem: function (sDisplayVal) {
            var dItems = this._getDisplayItems(false);
            var saveValue = null;
            _.find(dItems ? dItems.children : [],
                function (item, index) {
                    if (item.value == sDisplayVal) {
                        saveValue = this.getSaveItem(index); //This should always be present
                        return true;
                    }
                    else
                        return false;
                }, this
            );
            return saveValue;
        },

        getDisplayItem: function (nIndex) {
            var dItems = this._getDisplayItems(true);
            if (nIndex >= 0 && dItems && dItems.children.length > nIndex)
                return dItems.moChildNodes[nIndex].value;
            else
                return undefined; //Don't change
        },

        getSaveItem: function (nIndex) {
            var sItems = this._getSaveItems(true);
            if (nIndex >= 0 && sItems && sItems.children.length > nIndex)
                return sItems.moChildNodes[nIndex].value;
            else
                return undefined; //Don't change
        },

        getItemState: function (nIndex) {
            var itemValue = this.getOrElse(this.getSaveItem(nIndex), this.getDisplayItem(nIndex));
            if (itemValue !== null && itemValue !== undefined) {
                return this.rawValue == itemValue;
            }
            return null; // TODO: return null or false
        },

        setItemState: function (nIndex, bVal) {
            var itemValue = this.getOrElse(this.getSaveItem(nIndex), this.getDisplayItem(nIndex));
            if (itemValue !== null && itemValue !== undefined) {                      //TODO:Is it correct. What about Text and NumericInput?
                if (bVal)
                    this.rawValue = itemValue;
                else if (this.rawValue == itemValue)
                    this.rawValue = null;
            }
        },

        deleteItem: function (nIndex) {
            var sItems = this._getSaveItems(false);
            var dItems = this._getDisplayItems(false);
            if (nIndex >= 0 && sItems && sItems.moChildNodes.length > nIndex) //Check whether negative value of nIndex is a legal value??
                sItems._removeChild(sItems.moChildNodes[nIndex]);
            if (nIndex >= 0 && dItems && dItems.moChildNodes.length > nIndex) //Check whether negative value of nIndex is a legal value??
                dItems._removeChild(dItems.moChildNodes[nIndex]);
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                this, "deleteItem", null, nIndex);
            this.trigger(evnt.name, evnt);
        },

        execValidate: function () {
            return(this._validate([]));
        },

        nakedFieldReferences: function (nIndex, createGetterSetter, obj) {
            return;
        },

        _resetData: function (nIndex, bForce) {
            this.rawValue = this.jsonModel["{default}"];
        },

        _nullTest: function (sMessages) {
            var valid = true;
            var value = this._getValue();
            if ((value == null || value.length == 0) && this.mandatory != "disabled") {
                this._mFailedValTest = "nullTest";
                this._mFailedValLevel = this.mandatory;
                this._errorText = this.mandatoryMessage;
                this._addMessage(sMessages, this._errorText, this._mFailedValLevel);
                valid = false;
            }
            return valid;
        },

        _formatTest: function (sMessages) {
            var valid = true;
            var value = this._getValue();
            if (value)
                value += "";
            var picture = this.getOrElse(this.jsonModel,"extras.validatePatternEx", undefined);
            if (value != null && picture) {
                var retVal = this._formatValue(value, picture, 0);
                if (!retVal) {
                    this._setErrorData("formatTest", this.getOrElse(this.validate.formatTest, this._defaults.validate.formatTest), this.formatMessage);
                    this._addMessage(sMessages, this._errorText, this._mFailedValLevel);
                    valid = false;
                }
            }
            return valid;
        },

        _setErrorData: function (failedTest, failedLevel, errorText) {
            this._mFailedValTest = failedTest;
            this._mFailedValLevel = errorText;
            this._errorText = errorText;
        },

        _getSaveItems: function (createIfReqd) {
            var itemsList = this.
                _findChildren(xfalib.script.XfaModelRegistry.prototype.createSomExpression("items[*]"),
                true)
            var saveItems = itemsList._find(function (item, index) {
                return item.save == 1;
            });
            if (!saveItems && createIfReqd) {
                saveItems = xfalib.script.XfaModelRegistry.prototype.createModel({
                    _class: "items",
                    save: "1",
                    name: "items"
                });
                this._addChild(saveItems);
                var displayItems = itemsList._find(function (item, index) {
                    return item.save == 0;
                });
                saveItems.children = displayItems ? displayItems.moChildNodes : [];
            }
            if (saveItems)
                return saveItems;
            else
                return null;
        },

        _getDisplayItems: function (createIfReqd) {
            var itemsList = this.
                _findChildren(xfalib.script.XfaModelRegistry.prototype.createSomExpression("items[*]"),
                true)
            var displayItems = itemsList._find(function (item, index) {
                return item.save == 0;
            });
            if (!displayItems && createIfReqd) {
                displayItems = xfalib.script.XfaModelRegistry.prototype.createModel({
                    _class: "items",
                    name: "items"
                });
                this._addChild(displayItems);
                var saveItems = itemsList._find(function (item, index) {
                    return item.save == 1;
                });
                displayItems.children = saveItems ? saveItems.moChildNodes : [];
            }
            if (displayItems)
                return displayItems;
            else
                return this._getSaveItems();
        },

        _getValue: function (contentType, skipTypeCheck) {
            return this.value.oneOfChild.getValue(contentType, skipTypeCheck);
        },

        _setValue: function (sVal, skipTypeCheck) {
            return this.value.oneOfChild.setValue(sVal, skipTypeCheck);
        },

        _setHTMLValue: function(htmlStr) {
            // api to set the html value for cm use-case
            this._setValue(htmlStr, true);
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this,
                'rawValue', null, htmlStr);
            this.trigger(evnt.name, evnt);
        },

        _eventHandler: function (eventName) {
            var rValue = undefined;
            switch (eventName) {
                case "calculate":
                    if (this.moEvents["calculate"] && this.moEvents["calculate"].length > 0) {
                        rValue = this.moEvents["calculate"][0].execute(this, "calculate");
                    }
                    break;
                case "validate":
                    if (this.moEvents["validate"] && this.moEvents["validate"].length > 0) {
                        rValue = this.moEvents["validate"][0].execute(this, "validate");
                    } else
                        rValue = true;
                    break;
                default:
                    if (this.moEvents[eventName]) {
                        for (var i = 0; i < this.moEvents[eventName].length; i++) {
                            this.moEvents[eventName][i].execute(this, eventName);
                        }
                    }
            }
            return rValue;
        },

        _isField: function () {
            return true;
        },

        _showDisplayFormat: function () {
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this,
                'rawValue', this.rawValue, this.formattedValue);
            this.trigger(evnt.name, evnt);
        },

        _getDefaultPictureClause: function () {
            return "";
        },

        _formatValue: function (value, picture, force) {
            //testing specifically for only null and zero length string
            if (typeof value == "undefined" || value === null || value === "")
                return null;

            //force is same as bRelaxed , which is true in case of Display and false in case of parsing.
            force = force || false;
            if (picture) {
                var i = 0;
                for (; i < picture.length; i++) {
                    try {
                        var pattern = picture[i].category + "{" + picture[i].mask + "}";
                        return xfalib.ut.PictureFmt.format(value + "", pattern, picture[i].locale, force ,false);
                    } catch (exception) {
                        //continue to next pc
                    }
                }
            }
            if (force) {
                pattern = this._getDefaultPictureClause();
                try {
                    return xfalib.ut.PictureFmt.format(value + "", pattern, this.locale,force,true);
                } catch (exception) {
                    return value;
                }
            }
            return null;
        },

        _parseValue: function (value, picture) {
            if (typeof value === undefined)
                return value;

            if (picture) {
                var i = 0;
                for (; i < picture.length; i++) {
                    try {
                        var pattern = picture[i].category + "{" + picture[i].mask + "}";
                        return xfalib.ut.PictureFmt.parse(value, pattern, picture[i].locale);
                    } catch (exception) {
                        //continue to next pc
                    }
                }
            }
            pattern = this._getDefaultPictureClause();
            try {
                return xfalib.ut.PictureFmt.parse(value, pattern, this.locale);
            } catch (exception) {
                return value;
            }
        },


        _getLocale: function () {
            var obj = this;
            var locale;
            while (!locale && obj) {
                locale = obj.jsonModel.locale;
                obj = obj.parent;
            }
            locale = locale || this._xfa().defaultLocale;
            return locale;
        },

        scopeless: function () {
            return false;
        },

        _computeJsonDiff: function (diff_level) {
            //check bindings -> if it is none then this field is not needed in xml
            if (diff_level>0) {
                var bindElement = this.getElement("bind", 0, true);
                if (bindElement) {
                    if (bindElement.getAttribute("match") === "none" && diff_level === 2) {
                        return {
                            "changed": false,
                            "jsonDifference": {}
                        };
                    }
                }
            }
            return Field._super._computeJsonDiff.call(this, diff_level);
        },

        /**
         * Return the DataSOMMap after adding an entry in the map for the node. The entry contains the value of the node
         * along with its Data SOM. If there is no Data SOM then return the unmodified map
         * @param map
         * @private
         */
        _getDataSomMap : function(map) {
            if(!_.isObject(map)) {
                return map;
            }
            var datasom = this._getDataSom();
            if(datasom !== null) {
                map[datasom] = this.rawValue;
            }
            return map;
        },

        /**
         * Update the value of the node with the value provided in the input map. The map contains the values of the fields
         * mapped with their DataSOM. The function is empty for all the nodes, except for Field, Subform and Area.
         * The function does nothing if the map is not an object
         * @param map {object}
         * @private
         */
        _restoreDataSomMap : function (map) {
            if(!_.isObject(map)) {
                return;
            }
            var datasom = this._getDataSom();
            if (datasom != null && map[datasom] !== undefined) {
                this.rawValue = map[datasom];
            }
        },

        /**
         * Evaluates the given xpath relative to contextNode or RootNode depending upon the value of xpath.relative
         * In case it is true, xpath is evaluates relative to contextNode otherwise rootNode
         * For Fields, the value of xpath.relative can be "global" in which case we need to search the descendants of
         * the rootNode
         * @param xpath
         * @param contextNode
         * @param rootNode
         * @returns {*}
         * @private
         */
        _getElementsFromXpath: function(xpath, contextNode, rootNode) {
            var nodeIter,
                XMLUtils = xfalib.ut.XMLUtils,
                doc = rootNode instanceof Document ? rootNode : rootNode.ownerDocument;
            if(xpath.relative === "global") {
                nodeIter = XMLUtils.evaluateXPath("//"+xpath.bindRef, rootNode, null,
                    XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                return nodeIter;
            }
            return Field._super._getElementsFromXpath.apply(this, arguments);
        },

        _playDataXML: function(xmlDocument, contextNode, currentBindRef) {
            if(this.hasDataBinding()) {
                var xpath = this._getXpathFromBindRef(),
                    dataPattern = this.jsonModel.dataPattern,// TODO : ideally should read from bind.picture.value
                    result, node,
                    logger = this._xfa().Logger;
                if(xpath != null) {
                    result = this._getElementsFromXpath(xpath, contextNode, xmlDocument);
                    if(result != null) {
                        node = result.iterateNext();
                        if(node != null) {
                            var preFillValue = node.textContent;

                            if(_.isString(dataPattern)) {
                                var parsedPattern = xfalib.ut.PictureUtils.parsePictureClause(dataPattern);
                                if(_.isArray(parsedPattern) && parsedPattern.length === 1) {
                                    try {
                                        var isFormatted = xfalib.ut.PictureFmt.formatTest(preFillValue, dataPattern);
                                        if(!isFormatted) {
                                            preFillValue = xfalib.ut.PictureFmt.parse(preFillValue, dataPattern);
                                        }
                                        // note : numeric parse doesn't throw, but returns 0, need to take care of it later
                                    } catch (e) {
                                        // must set value to preserve prefill data on submit
                                        this._setValue(node.textContent, true);  // need to set value without type checking, for numeric field doesn't allow non numeric chars
                                        logger.warn("xfa",
                                            logger.resolveMessage(xfalib.locale.LogMessages["ALC-FRM-901-021"],
                                                [dataPattern, node.textContent, e]));
                                    }
                                } else {
                                    this._setValue(node.textContent, true);
                                    logger.warn("xfa",
                                        logger.resolveMessage(xfalib.locale.LogMessages["ALC-FRM-901-022"],
                                            [dataPattern, node.textContent]));
                                }
                            }
                            // bug in picturefmt numeric parse : cant parse patterns with ( or ), but doesnt throw, returns 0 instead
                            if (_.isString(dataPattern) &&
                                dataPattern.trim().indexOf("num") === 0 &&
                                (preFillValue == 0 && parseFloat(node.textContent.replace(/[^0-9]/g, "")) !== 0)) { // hack: if parser returns 0, and input has any non zero digit then parsing failed
                                this._setValue(node.textContent, true);
                                logger.warn("xfa",
                                    logger.resolveMessage(xfalib.locale.LogMessages["ALC-FRM-901-023"],
                                        [dataPattern, node.textContent]));
                            } else {
                                this._setValue(preFillValue);
                            }
                        }
                    } else {
                        this._resetData();
                    }
                }
            }
        },

        /**
         * Generates the XML by appending the elements in the rootNode
         * @param rootNode The rootNode of the xml. Generally the element that maps to the root of the form
         * @param contextNode Current Node where to insert the elements in case of relative bindings
         */
        generateDataXML: function (rootNode, contextNode) {
            if(this.hasDataBinding()) {
                var xpath = this._getXpathFromBindRef(),
                    relativeXPath, nodeIter, nodeList = [], result, node;
                if(xpath != null) {
                    var element = xpath.relative === false || xpath.relative === "global" ? rootNode : contextNode;
                    element = xfalib.ut.XMLUtils.createElementsFromXPath(xpath.bindRef, element, false);
                    this._appendValueInXMLElement(element);
                }
            }
        },

        _appendValueInXMLElement: function (element) {
            if(element != null) {
                element.textContent = this._getValue(null, true); // LC-3911180 : need to circumvent type check to preserve data
            }
        }

    });

    Field.defineProps({
        "locale": {
            get: function () {
                if (!this._locale)
                    this._locale = this._getLocale();
                return this._locale;
            }
        },

        "multiLine": {
            get: function () {
                return (this.ui.oneOfChild.multiLine == 1);
            }
        },

        "rawValue": {
            get: function () {
                var currentNode = this._xfa().moCalculateEventNode;
                if (currentNode != null) {
                    this.addDependant(currentNode);
                    currentNode.on(xfalib.script.XfaModelEvent.OBJECT_DESTROYED, this);
                }
                return this._getValue(null, this.value.oneOfChild.getAttribute("contentType") === "text/html");
            },
            set: function (oValue) {
                oValue = this.validateInput(oValue, "string");
                if (this.value.oneOfChild.maxChars && this.value.oneOfChild.maxChars !== "0" && oValue && this.value.oneOfChild.maxChars < oValue.length)
                    oValue = oValue.slice(0, this.value.oneOfChild.maxChars);
                var oldval = this._getValue();
                if (this._setValue(oValue, this.value.oneOfChild.getAttribute("contentType") === "text/html")) {
                    this._handleDependants();
                    this._xfa().queueValidateEvent(this);
                }
                if (oldval != oValue)
                    this._showDisplayFormat();
            }
        },

         "font": {
                    get : function() {
                        return  this.getElement("font",0);
                    } ,
                    set :function(value) {
                          this.setElement(value,"font");
                    }
                },

        "fontColor" : {
            get : function () {
                return this.getElement("font", 0).getElement("fill", 0).getElement("color", 0).value;
            },
            set : function (value) {
                this.getElement("font", 0).getElement("fill", 0).getElement("color", 0).value = value;
            }
        },

        "value" : {
            get : function() {
                return  this.getElement("value",0);
            },
            set: function () {}
        },

        //TODO: Note: Below handling should handle both multiSelect and single Selects. Need to verify this.
        "selectedIndex": {
            get: function () {
                var value = this.rawValue;
                var itemSize = this.length;
                if (itemSize >= 0) {
                    for (var i = 0; i < itemSize; i++) {
                        var selected = this.getItemState(i);
                        if (selected)
                            return i;
                    }
                }
                return -1;   //default -1
            },
            set: function (nIndex) {
                nIndex = this.validateInput(nIndex, "string");
                this._setValue(null);
                this.setItemState(nIndex, true);
            }
        },

        "length": {
            get: function () {
                var items = (this._getSaveItems(false) || this._getDisplayItems(false));
                return items ? items.moChildNodes.length : 0;
            }
        },

        "parentSubform": {
            get: function () {
                var temp = this.parent;
                while (temp && temp.className !== "subform")
                    temp = temp.parent;
                return temp;
            }
        },

        "mandatory": {
            get: function () {
                return this.getOrElse(this.validate.nullTest, this._defaults.validate.nullTest);
            },
            set: function (value) {
                if (this.validate) {
                    this.validate.nullTest = value;
                }
            }
        },

        "mandatoryMessage": {
            get: function () {
                var msg = this.getOrElse(this.validate, "message.nullTest", this._defaults.validate.message.defaultMessage);
                return msg.value;
            },
            set: function (val) {
                var nodes = this.validate.message.nodes;
                if (nodes.namedItem("nullTest") === null) {
                    var node = this._xfa().form.createNode("text", "nullTest");
                    nodes.append(node);
                }
                this.validate.message.nullTest.value = val;
                this.execValidate();
            }
        },

        "formatMessage": {
            get: function () {
                var msg = this.getOrElse(this.validate, "message.formatTest", this._defaults.validate.message.defaultMessage);
                return msg.value;
            },
            set: function (val) {
                var nodes = this.validate.message.nodes;
                if (nodes.namedItem("formatTest") === null) {
                    var node = this._xfa().form.createNode("text", "formatTest");
                    nodes.append(node);
                }
                this.validate.message.formatTest.value = val;
                this.execValidate();
            }
        },

        "formattedValue": {
            get: function () {
                return this._formatValue(this._getValue(), this.jsonModel.extras.displayPatternEx, true);
            },
            set: function (val) {
                this.rawValue = this._parseValue(val, this.jsonModel.extras.displayPatternEx);
            }
        },

        "isNull": {
            get: function () {
                if (this._getValue() != null)
                    return false;
                else return true;
            }
        },

        "editValue": {
            get: function () {
                return this._formatValue(this._getValue(), this.jsonModel.extras.editPatternEx, true);
            }
        },

        ui: {
            get: function () {
                return this.getElement("ui", 0);
            },

            set: function (value) {
                this.setElement(value, "ui");
            }
        },

        "items": {
            get: function () {
                return this.getElement("items", 0);
            }
        },

        "calculate": {
            get: function () {
                return this.getElement("calculate", 0);
            }
        },

        "format": {
            get: function () {
                return this.getElement("format", 0);
            }
        }


    });

    Field.addMixins([
        xfalib.script.mixin.AddAssist,
        xfalib.script.mixin.AddCaption,
        xfalib.script.mixin.AddPresence,
        xfalib.script.mixin.AddXYWH,
        xfalib.script.mixin.AddFillColor,
        xfalib.script.mixin.AddBorder,
        xfalib.script.mixin.AddBorderColor,
        xfalib.script.mixin.AddBorderWidth,
        xfalib.script.mixin.AddPara,
        xfalib.script.mixin.AddMargin
    ]);

})(_, xfalib);








/**
 * @package xfalib.script.Draw
 * @import xfalib.script.Node
 * @fileOverview The file creates the Draw Class required for XFA library
 * @version 0.0.1
 */

(function (_, xfalib, $) {
    /**
     * Creates a new Draw class
     *
     * @constructor
     * @param {string}
     *            name the name of the Draw
     * @extends com.adobe.xfa.scripting.Node
     */
    var Draw = xfalib.script.Draw = xfalib.script.EventContainerNode.extend({

        _setValue: xfalib.script.Field.prototype._setValue,

        _getValue: xfalib.script.Field.prototype._getValue,

        _getFieldById: function (fieldId) {

            if (this._xfa()._xfaTemplateCache.idMap.hasOwnProperty(fieldId)) {
                //xtg uses just the name of the field to find the actual context node
                //this is a quick and dirty way to ensure index affinity
                //just to be in sync with XTG, I am using the same implementation as XFALayoutTextResolver class
                var field = this._xfa()._xfaTemplateCache.idMap[fieldId];
                var resolvedField = null;

                var bQuit = false;
                var index = 0;
                //TODO : Can we have problem in context object setting while doing index affine resolutions ?
                while (!bQuit)
                {
                    var som = field.name + '[' + index + ']';
                    //this will be done in the context of _resolveFloatingField
                    var probField = this.resolveNode(som);
                    if (!_.isEmpty(probField)) {
                        if (probField.jsonModel.id === field.jsonModel.id) {
                            bQuit = true;
                            resolvedField = probField;
                        }
                        else {
                            //keep looking
                        }
                    }
                    else { //this will not be used very often in fact I kept it just for completeness...
                        bQuit = true;
                        var nodeName = this;
                        //vdua suggests to use xfa.form..nodeName instead of _filterNodes.
                        //it takes care of index affinity also which is a bit unpredictable
                        //Let's try this in next iteration
                        var contextNodes = this._xfa().form._filterNodes(function (n) {
                            return n.name == nodeName;
                        });

                        var occurrenceToLookFor = 0;

                        for (var i = 0; i < contextNodes.length; i++) {
                            if (contextNodes.item(i) == this) {
                                occurrenceToLookFor = i;
                                break;
                            }
                        }

                        var floatingFieldNodes = this._xfa().form._filterNodes(function (n) {
                            return n.name == field.name;
                        });

                        var occurrence = 0;
                        var foundAtLeastOneMatch = false;
                        var indexOfFirstFound = 0;

                        for (var j = 0; j < floatingFieldNodes.length; j++) {
                            var probField = floatingFieldNodes.item(j);
                            if (probField.jsonModel.id == field.jsonModel.id) {
                                if (!foundAtLeastOneMatch)
                                    indexOfFirstFound = j;
                                foundAtLeastOneMatch = true;
                                if (occurrenceToLookFor == occurrence)
                                    return probField;
                                occurrence++;
                            }
                        }

                        if (foundAtLeastOneMatch)
                            return floatingFieldNodes.item(indexOfFirstFound);
                    }
                    index++;
                }
                return resolvedField;
            }
            else
                return null;
        },

        _computeJsonDiff: function (diff_level) {
            return xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, diff_level === 2, xfalib.script.Node.prototype._computeJsonDiff, arguments);
        },

        playJson : function(pJsonModel) {
            //Do not do any playJson for draw children. It should not impact floating fields.
            xfalib.script.Node.prototype.playJson.apply(this, arguments);
        },

        _playDataXML: function () {

        },

        generateDataXML: function (rootNode, contextNode) {

        },

        _resolveFloatingField: function () {
            //Can we somehow store embeds and html text in Draw object and compute it over and over again
            //may we need another NodeValue type to handle it????

            if (this.value) {
                var content = this.value.oneOfChild;
                if (content.getAttribute('contentType') === 'text/html') {
                    if(_.isNull(content._origTmpltVal)){
                        content._origTmpltVal = content.jsonValue; // save original template info containing the embed tags
                    }
                    var isTextEmbeds = false,
                        that = this,
                        htmlText = content._origTmpltVal,
                        $internalHTML = $('<span>' + htmlText + '</span>');
                    //change the top level element to span to wrap up all the <p>, because it will cause unnecessary paragraph break

                    //no null check because jQuery is cool!
                    $internalHTML.find("p").eq(0).css('display', 'inline');

                    $internalHTML.find('[xfa\\:embed]').each(function (index, span) {
                        isTextEmbeds = true;
                        var $span = $(span);
                        var embed = $span.attr('xfa:embed');
                        var embedType = $span.attr('xfa:embedType');
                        var embedMode = $span.attr('xfa:embedMode');
                        if (embed && embed.length > 1 && embed[0] == '#') {
                            embed = embed.substr(1);
                            //resolve Node will take care of index affinity here
                            var field = (embedType == 'uri') ? that._getFieldById(embed) : that.resolveNode(embed);
                            if (field) {
                                if (embedMode === 'raw') {
                                    if (field.rawValue == null)
                                        $span.replaceWith(field.rawValue);
                                    else
                                        $span.replaceWith($.parseHTML(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(field.rawValue.toString())));
                                }
                                else
                                    $span.replaceWith(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(field.formattedValue.toString()));
                            }
                            else {
                                that._xfa().Logger.debug("xfa", "referred field with id " + embed + " doesn't exist.");
                                $span.remove();
                            }
                        }
                        else {
                            that._xfa().Logger.debug("xfa", "referred field with invalid id " + embed + " doesn't exist.");
                            $span.remove();
                        }
                    });

                    //isTextEmbeds is set to true if there is any embedded text field.
                    if (isTextEmbeds) {
                        content.jsonValue = "<span>" + $internalHTML.html() + "</span>";
                        // pages may not yet be rendered, but initialize called due to "initial count" of rpt. SF
                        // record updated value to be applied in _syncFormNodeToHtml during pg. render
                    }
                }
            }
        },

        scopeless: function () { //[LC-8801] DOM Properties of draw gets incorrectly attached
            return false;
        },

        _eventHandler: function (eventName) {
            //want to handle only calculate event that too in case of draw text
            if (this.ui && this.ui.oneOfChild && this.ui.oneOfChild.className == 'textEdit') {
                var rValue = undefined;
                switch (eventName) {
                    case "calculate":
                        if (this.moEvents["calculate"] && this.moEvents["calculate"].length > 0) {
                            this.moEvents["calculate"][0].execute(this, "calculate");
                        }
                        break;
                    default :
                        return Draw._super._eventHandler.call(this);
                }
                return rValue;
            }
            else
                return Draw._super._eventHandler.call(this);

        },

        /**
         * Return the DataSOMMap after adding an entry in the map for the node. The entry contains the value of the node
         * along with its Data SOM. If there is no Data SOM then return the unmodified map
         * @param map
         * @private
         */
        _getDataSomMap: function (map) {
            return map;
        },

        /**
         * Update the value of the node with the value provided in the input map. The map contains the values of the fields
         * mapped with their DataSOM. The function is empty for all the nodes, except for Field, Subform and Area.
         * @param map
         * @private
         */
        _restoreDataSomMap : function (map) {

        }
    });

    Draw.defineProps({
        "rawValue": {
            get: function () {
                return this._getValue();
            },
            set: function (sValue) {
                var oldval = this._getValue();
                sValue = this.validateInput(sValue, "string");
                this._setValue(sValue);
                var event = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this, 'rawValue', null, sValue);
                this.trigger(event.name, event);
            }
        },

        ui: {
            get: function () {
                return this.getElement("ui", 0);
            },

            set: function (value) {
                this.setElement(value, "ui");
            }
        },

        "font": {
            get: function () {
                return  this.getElement("font", 0);
            },
            set: function (value) {
                this.setElement(value, "font");
            }
        },

        "value": {
            get: function () {
                return  this.getElement("value", 0);
            },
            set: function (val) {
                this.setElement(val, "value");
            }
        },

        "desc": {
            get: function () {
                return this.getElement("desc", 0)
            }
        }
    });

    Draw.addMixins([
        xfalib.script.mixin.AddAssist,
        xfalib.script.mixin.AddCaption,
        xfalib.script.mixin.AddXYWH,
        xfalib.script.mixin.AddPresence,
        xfalib.script.mixin.AddBorder,
        xfalib.script.mixin.AddPara,
        xfalib.script.mixin.AddMargin
    ]);

})(_, xfalib, $);





/**
 * @package xfalib.script.DateTimeField
 * @import xfalib.script.Field
 * @fileOverview The file creates the Date Time Field Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new Date Time Field class
     *
     * @constructor
     * @param {string}
        *            name the name of the Field
     * @param {string}
        *            rawVal initial value of the Field
     * @property {string} rawVal represents the data value in the node
     * @extends com.adobe.xfa.scripting.Node
     */
    var DateTimeField = xfalib.script.DateTimeField = xfalib.script.Field.extend({
        _getDefaultPictureClause: function() {
            //watson bug#3672364 and 3672367.
            //Start reading calendar picture format from the localeset.
            if(this.value.oneOfChild.className === "date")
                return "date{"+this._xfa()._getLocaleSymbols(this.locale,"datePatterns").med+"}";
            else
                return "";
        },

        _setValue: function (sVal, skipTypeCheck) {
            var isEditPatternDefined = this.editPattern && this.editPattern.length > 0,
                isNotIsoString = _.isEmpty(xfalib.ut.DateInfo.ParseIsoString(sVal));

            if(!_.isEmpty(sVal) && isEditPatternDefined && isNotIsoString) { //  LC-3913078 in case edit pattern is present, it'll be parsed by the widget during input and return an iso date string.
                return false;
            } else {
                return DateTimeField._super._setValue.call(this, sVal, skipTypeCheck);
            }
        }
    });
})(_, xfalib);
/**
 * @package xfalib.script.NumericField
 * @import xfalib.script.Field
 * @fileOverview The file creates the Numeric Field Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new Numeric Field class
     *
     * @constructor
     * @param {string}
        *            name the name of the Field
     * @param {string}
        *            rawVal initial value of the Field
     * @property {string} rawVal represents the data value in the node
     * @extends com.adobe.xfa.scripting.Node
     */
    var NumericField = xfalib.script.NumericField = xfalib.script.Field.extend({
         _getDefaultPictureClause: function() {
            return "num{"+this._xfa()._getLocaleSymbols(this.locale,"numberPatterns").numeric+"}";
         }
    });
})(_, xfalib);
/**
 * @package xfalib.script.ButtonField
 * @import xfalib.script.Field
 * @fileOverview The file creates the Button Field Class required for XFA
 *               library
 * @version 0.0.1
 */

(function (_, xfalib) {
    var ButtonField = xfalib.script.ButtonField = xfalib.script.Field.extend({
        _computeJsonDiff: function (diff_level) {
            //we don't want button to appear in final submit, but for restoreFormState
            return xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, diff_level === 2, ButtonField._super._computeJsonDiff, arguments);
        }
    });
})(_, xfalib);

/**
 * @package xfalib.script.CheckButtonField
 * @import xfalib.script.Field
 */
/**
 * @fileOverview The file creates the CheckButton Field Class required for XFA
 *               library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new CheckButtonField Field class
     *
     * @constructor
     * @param {string}
        *            name the name of the Field
     * @param {string}
        *            rawVal initial value of the Field
     * @property {string} rawVal represents the data value in the node
     * @extends com.adobe.xfa.scripting.Node
     */
    var CheckButtonField = xfalib.script.CheckButtonField = xfalib.script.Field.extend({
        initialize : function(){
            CheckButtonField._super.initialize.call(this);
            this._on = 0;
            this._off = 1;
            this._neutral = 2;
        },

        addItem : function(sDisplayVal, sSaveVal) {
            if (this.length == this._getMaxItems())
                return;
            CheckButtonField._super.addItem.call(this, sDisplayVal, sSaveVal);
        },

        _getMaxItems : function(){
            return this._allowNeutral() ? 3 : 2;
        },

        _allowNeutral : function(){
            return this.ui.oneOfChild.allowNeutral == 1 ? true : false;
        },

        _handleDependants : function() {
            CheckButtonField._super._handleDependants.call(this);
            if (this.parent._isExclusionGroup()) {
                this.parent._handleSelectChild(this);
            }
        }

    });
})(_, xfalib);
/**
 * @package xfalib.script.ChoiceListField
 * @import xfalib.script.Field
 */
/**
 * @fileOverview The file creates the ChoiceList Field Class required for XFA
 *               library
 * @version 0.0.1
 */


(function(_, xfalib, $){
    /**
     * Creates a new ChoiceList Field class
     *
     * @constructor
     * @param {string}
        *            name the name of the Field
     * @param {string}
        *            rawVal initial value of the Field
     * @property {string} rawVal represents the data value in the node
     * @extends com.adobe.xfa.scripting.Node
     */
    var ChoiceListField = xfalib.script.ChoiceListField = xfalib.script.Field.extend({

        _convertValueToXml: function(val) {
           if(val == null || val.length == 0)
                return null
           var xml = "<"+this.name+">"
           _.each((val+"").split("\n"),function(value) {
               if(value && value.length > 0)
                    xml +="<value>"+value+"</value>"
            })
            xml += "</"+this.name+">"
            return xml
        },

        _getText: function(xml,sep,$) {
            var recText = function(obj,arr) {
                if(obj.children().length) {
                    obj.children().map(function(indx,child) {
                        recText($(child),arr);
                    })
                } else {
                    arr.push(obj.text());
                }
            };
            var arr = [];
            recText($($.parseXML(xml)),arr);
            return arr.join(sep);
        },

        _convertXmlToValue: function($xml) {
            if($xml == null)
                return null;
            return this._getText($xml,"\n",$);
        },

        _getValue : function() {
            var value = ChoiceListField._super._getValue.apply(this, this._multiSelect() ? ["text/xml"] : []);
            if(this._multiSelect())
                return this._convertXmlToValue(value);
            else
                return value
        },

        _setValue : function(sVal) {
            if(this._multiSelect())
                sVal = this._convertValueToXml(sVal);
            return ChoiceListField._super._setValue.apply(this,[sVal]);
        },

        getItemState : function(nIndex) {
            if (this._multiSelect() !== false) {
                var saveValue = this.getSaveItem(nIndex);
                if(saveValue!== null && saveValue!== undefined){
                    saveValue = ""+saveValue;
                    var valueArray = (this.rawValue + "").split("\n");
                    var currentValIndex = this.xfaUtil().dIndexOf(valueArray,saveValue);
                    return currentValIndex >= 0;
                } else
                    return null; // TODO: return null or false
            } else {
                return ChoiceListField._super.getItemState.call(this, nIndex);
            }

        },

        _showDisplayFormat : function() {
                    var displayValue = this.getDisplayItem(this._selectedLastIndex());
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,this,
                        'rawValue',this.rawValue,displayValue);
                    this.trigger(evnt.name,evnt);
                },

        _selectedLastIndex :function() {
             var value = this.rawValue;
             var itemSize = this.length;
             var lastVal;
             if(itemSize >=0){
             for (var i=0; i< itemSize; i++) {
                    var selected = this.getItemState(i);
                    if(selected)
                       lastVal=i;
               }
             }
             if(lastVal != "undefined")return lastVal;
                   return -1;
             },

        _multiSelect : function(){
            return this.ui.oneOfChild.open == "multiSelect" ? true : false;
        },



        setItemState : function(nIndex, bVal) {
            if (this._multiSelect() !== false) {
                var saveValue = this.getSaveItem(nIndex);
                if(saveValue !== null && saveValue !== undefined) {
                    saveValue = ""+saveValue;
                    var valueArray = (this.rawValue + "").split("\n");
                    var currentValIndex = this.xfaUtil().dIndexOf(valueArray,saveValue); /*item value is typed so converting it to string for matching */
                    if(bVal && currentValIndex < 0) {
                        var saveItems = this._getSaveItems().children
                        var newValArray = _.reduce(saveItems,function(memo,item) {
                                if(this.xfaUtil().dIndexOf(valueArray,item.value) >= 0 || item.value == saveValue)
                                    memo.push(item.value);
                                return memo
                        },[],this)
                        valueArray = newValArray;
                    }
                    else if(!bVal && currentValIndex >=0)
                        valueArray.splice(currentValIndex, 1)
                    this.rawValue = valueArray.join("\n");
                }
            } else {
                ChoiceListField._super.setItemState.call(this, nIndex, bVal);
            }
        },

        _playDataXML: function (xmlDocument, contextNode, currentBindRef) {
            var xpath = this._getXpathFromBindRef(),
                value, nodeIter, node;
            if(xpath != null) {
                if(this._multiSelect()) {
                    // in case of multiselect the value is xml and hence needs special processing
                    nodeIter = this._getElementsFromXpath(xpath, contextNode, xmlDocument);
                    var node = nodeIter.iterateNext();
                    if(node != null) {
                        value = new XMLSerializer().serializeToString(node);
                        ChoiceListField._super._setValue.apply(this,[value]);
                        //todo: If we move processing of data xml before view
                        //generation then showDisplayFormat call will not be needed.
                        this._showDisplayFormat();
                    }
                } else {
                    ChoiceListField._super._playDataXML.apply(this, [xmlDocument, contextNode, currentBindRef]);
                }
            }
            this._playItems(xmlDocument, contextNode);
        },

        _playItems: function (xmlDocument, contextNode) {
            var bindItems = this.getElement("#bindItems[0]");
            if (bindItems != null) {
                var connection = bindItems.connection;
                if (connection == null || connection.length == 0) {
                    var ref = bindItems.ref;
                    if (ref != null && ref.length > 0) {
                        var xpath = this._convertRefToXPath(ref);
                        if (xpath != null) {
                            var itemNodes = this._getElementsFromXpath(xpath, contextNode, xmlDocument);
                            if (itemNodes != null) {
                                this.clearItems();
                                var itemNode = itemNodes.iterateNext();
                                var xmlUtils = xfalib.ut.XMLUtils;
                                while (itemNode != null) {
                                    //TODO: support valueRef/labelRef with xPath having more than one element
                                    // and valueRef/labelRef pointing to an attribute
                                    var valueNodeResult = xmlUtils.evaluateXPath(bindItems.valueRef, itemNode, null,
                                        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                                    if (valueNodeResult != null) {
                                        var labelNodeResult = valueNodeResult;
                                        if (bindItems.labelRef) {
                                            labelNodeResult = xmlUtils.evaluateXPath(bindItems.labelRef, itemNode, null,
                                                XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                                        }
                                        var valueNode = valueNodeResult.iterateNext();
                                        if(valueNode != null) {
                                            var labelNode = labelNodeResult ? labelNodeResult.iterateNext() : null;
                                            if(labelNode == null) {
                                                labelNode = valueNode;
                                                this._xfa().Logger.warn("xfa",
                                                        "labelRef doesn't exist for [" + this.somExpression + ","
                                                        + bindItems.ref + "," + bindItems.labelRef + "]");
                                            }
                                            this.addItem(labelNode.textContent,
                                                valueNode.textContent);
                                        } else {
                                            this._xfa().Logger.error("xfa",
                                                    "valueRef doesn't exist for [" + this.somExpression + ","
                                                        + bindItems.ref + "," + bindItems.labelRef + "]");
                                        }
                                    } else {
                                        this._xfa().Logger.error("xfa", "valueRef points to an invalid xml element "
                                            + bindItems.valueRef);
                                    }

                                    itemNode = itemNodes.iterateNext();
                                }
                            }
                        }
                    }
                } else {
                    this._xfa().Logger.warn("xfa", "connection in bindItems is not supported in Formset");
                }
            }
        },

        _appendValueInXMLElement: function (element) {
            if(!this._multiSelect()) {
                ChoiceListField._super._appendValueInXMLElement.apply(this,[element]);
            } else {
                // need to remove the old choices before appending the new ones
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                var xmlValue = this.value.oneOfChild.getValue("text/xml"),
                    xmlDoc, nodeIter, node, importedNode, addedChild;
                if(xmlValue != null && xmlValue != "") {
                    xmlDoc = $.parseXML(xmlValue);
                    nodeIter = xfalib.ut.XMLUtils.evaluateXPath("*", xmlDoc.documentElement, null,
                                                                    XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    node = nodeIter.iterateNext();
                    while(node != null) {
                        importedNode = element.ownerDocument.importNode(node, false);
                        addedChild = element.appendChild(importedNode);
                        addedChild.textContent = node.textContent;
                        node = nodeIter.iterateNext();
                    }
                }
            }
        }
    });
})(_, xfalib, $);
/**
 * @package xfalib.script.Subform
 * @import xfalib.script.ContainerNode
 * @fileOverview The file creates the Subform Class required for XFA library
 * @class The class represents a subform in the XFA Dom
 * @version 0.0.1
 */
(function(_,xfalib){
    var Subform = xfalib.script.Subform = xfalib.script.EventContainerNode.extend({
        initialize: function() {
            Subform._super.initialize.call(this);
            this._instanceManager = null;
            this.mnInstanceIndex = 0;
            this.tests= [this._scriptTest];
        },

        _isSubform : function() {
            return true;
        },

        getInvalidObjects : function() {
            var list = new xfalib.script.XfaList();
            var sMessages = new Array();
            this._validate(sMessages);
            for ( var i = 0; i < sMessages.length; i++) {
                list._append(sMessages[i].ref);
            }
            return list;
        },

        _eventHandler : function(eventName) {
            var rValue = undefined;
            switch (eventName) {
                case "validate":
                    if(this.moEvents["validate"] && this.moEvents["validate"].length >0){
                        rValue = this.moEvents["validate"][0].execute(this, "validate");
                    }else
                        rValue = true;
                    break;
                default:
                if (this.moEvents[eventName]) {
                    for ( var i = 0; i < this.moEvents[eventName].length; i++) {
                        this.moEvents[eventName][i].execute(this, eventName);
                    }
                }
            }
            return rValue;
        },

        _nullTest : function(value,sMessages) {
            return true;
        },

        _requireGetterSetter : function(oChild){
            if(oChild.className == "pageSet")
                return true;
            else
                return Subform._super._requireGetterSetter.call(this, oChild);
        },

        _postAddChild : function(oNode){
            if(oNode.instanceManager){
                // clear all cached contexts in EventContainerNode-s
                xfalib.runtime.xfa._clearAllMoContexts();

                this._xfa()._xfaTemplateCache.putModel(oNode, oNode.instanceManager._instanceTemplate());
                if(this.mEffectiveAccess){
                    oNode._calculateEffectiveAccess();
                }
                oNode._initialize();
                if (this.mbInitialized) {
                    // oNode.execEvent("initialize");
                    oNode.execCalculate();
                }

                // internalDispatchEvent(CollectionEventKind.ADD, oNode, index);

                // if (this.hasEventListener("change"))
                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.CHILD_ADDED,this,"child",null,oNode);
                this.trigger(evnt.name,evnt);
            }
            else {
                //do nothing --- Let's face it You might call this function for other things besides subform e.x. items (see _getDisplayItems())
                Subform._super._postAddChild.call(this, oNode);
            }
        },

        _postRemoveChild : function(oChild){
            if(oChild.instanceManager){
                // clear all cached contexts in EventContainerNode-s
                xfalib.runtime.xfa._clearAllMoContexts();

                var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.CHILD_REMOVED,this,"child", oChild, null);
                this.trigger(evnt.name,evnt);
            }
            else {
                Subform._super._postRemoveChild.call(this, oChild);
            }
        },

        playJsonForElement : function(elName, pJsonModel){
            if(elName == "instanceManager"){
                var newJChildren = _.filter(_.compact(pJsonModel.children), function (jChild) {
                    return this.xfaUtil().isRepeatabeEl(jChild._class) || jChild._class == "instanceManager";
                }, this);
                var oldMChildren = _.filter(this.moChildNodes, function(mChild){
                    return  this.xfaUtil().isRepeatabeEl(mChild.className)  || mChild.className == "instanceManager" ;
                }, this);

                var lastIM = null;
                _.each(oldMChildren, function(oldMChild){
                    //If oldMChild has any remaining IM then newJChildren must have at least one IM left
                    if(oldMChild.className == "instanceManager" && newJChildren[0]._class == "instanceManager"){
                        newJChildren.shift();
                    }
                    else if(oldMChild.className == "instanceManager" && this.xfaUtil().isRepeatabeEl(newJChildren[0]._class)){
                        while(this.xfaUtil().isRepeatabeEl(newJChildren[0]._class)){
                            var addedSf =lastIM.addInstance();
                            addedSf.playJson(newJChildren.shift());
                        }
                        newJChildren.shift(); // This must be instanceManager for next subform
                    }
                    else if(this.xfaUtil().isRepeatabeEl(oldMChild.className ) && (newJChildren[0] == null || newJChildren[0]._class == "instanceManager")){
                        lastIM.removeInstance(oldMChild.instanceIndex);
                    }
                    else {
                        //oldMChild.className == "subform" && newJChildren[0]._class == "subform"
                        oldMChild.playJson(newJChildren.shift());
                    }

                    if(oldMChild.className == "instanceManager" )
                        lastIM = oldMChild;

                }, this);
                while(newJChildren.length > 0){
                    var newJSF = newJChildren.shift();
                    var addedSF = lastIM.addInstance();
                    if (addedSF) {
                        addedSF.playJson(newJSF);
                    }
                }
                return true;
            } else if (this.xfaUtil().isRepeatabeEl(elName)) {
                return true;
            } else if (elName === "variables") {
                return true;  // LC-9508: don't playJson for variables
            } else {
                return Subform._super.playJsonForElement.call(this, elName, pJsonModel);
            }
        },

        _getXPathForUseNameBinding: function () {
            if(this.instanceManager._isRepeatable()) {
                var name = this.getAttribute("name");
                return name === "" ? null
                                   : {
                                        relative: true,
                                        bindRef: name + "[*]"
                                     };
            } else {
                return Subform._super._getXPathForUseNameBinding.apply(this);
            }
        },

        _playDataXML: function(xmlDocument, contextNode, currentBindRef) {
            if(this.parent.className === "form") {
                return Subform._super._playDataXML.apply(this,[xmlDocument,contextNode, currentBindRef]);
            }
            var xpath = this._getXpathFromBindRef(),
                relativeXPath, nodeIter, nodeList = [], node, count, instance;
            if(xpath == null) {
               Subform._super._playDataXML.apply(this,[xmlDocument,contextNode, currentBindRef]);
            } else {
                // The first instance will take care of the rest of the instances.
                if(this.instanceIndex === 0) {
                    nodeIter = this._getElementsFromXpath(xpath, contextNode, xmlDocument);
                    if (nodeIter != null) {
                        node = nodeIter.iterateNext();
                        while (node) {
                            nodeList.push(node);
                            node = nodeIter.iterateNext();
                        }
                        node = nodeList.shift();
                        count = 0;
                        while (node != null) {
                            if (count > this.instanceManager.count - 1) {
                                instance = this.instanceManager.addInstance();
                            } else {
                                instance = this.instanceManager.instances[count];
                            }
                            Subform._super._playDataXML.apply(instance, [xmlDocument, node, xpath]);
                            node = nodeList.shift();
                            count++;
                        }
                        while (count < this.instanceManager.count) {
                            if (this.instanceManager.count === this.instanceManager.min) {
                                instance = this.instanceManager.instances[count];
                                Subform._super._playDataXML.apply(instance, [xmlDocument, null, xpath]);
                                count++;
                            } else {
                                this.instanceManager.removeInstance(count);
                            }
                        }
                    }
                }
            }
        },

        /**
         * Generates the XML by appending the elements in the rootNode
         * @param rootNode The rootNode of the xml. Generally the element that maps to the root of the form
         * @param contextNode Current Node where to insert the elements in case of relative bindings
         */
        generateDataXML: function(rootNode, contextNode) {
            if(this.parent.className === "form") {
                return Subform._super.generateDataXML.apply(this,[rootNode,contextNode]);
            }
            var xpath = this._getXpathFromBindRef(),
                xmlUtils = xfalib.ut.XMLUtils,
                parentElement, element, childElement, childXPath, childXPathParts,
                childElementName, childElementIndex;
            if(xpath == null) {
                Subform._super.generateDataXML.apply(this,[rootNode,contextNode]);
            } else {
                element = xpath.relative === false ? rootNode : contextNode;
                parentElement = xmlUtils.createElementsFromXPath(xpath.bindRef, element, true);
                childXPath = _.last(xpath.bindRef.split("/"));
                childXPathParts = xmlUtils._getElementNameAndIndexFromXPathPart(childXPath);
                childElementName = childXPathParts.name;
                childElementIndex = childXPathParts.index;
                //TODO: * doesn't gaurantees that the element can be repeated in schema. But we have no choice for now
                if(childElementIndex === "*") {
                    if(this.instanceIndex === 0) {
                        // For repeatable subforms the first child does the processing for all the siblings

                        // cache all existing children
                        var existingInstances = parentElement.hasChildNodes() ? parentElement.childNodes : null;

                        // filter out current repeatable ones
                        if (!_.isEmpty(existingInstances)) {
                            existingInstances = _.filter(existingInstances, function (child) { return child.nodeName === childElementName; });
                        }

                        _.each(this.instanceManager.instances, function (instance) {
                            var index = instance.instanceIndex + 1,
                                childElement = xmlUtils.findOrCreateElement(childElementName + "[" + index + "]",
                                    parentElement);
                            Subform._super.generateDataXML.apply(instance,[rootNode, childElement]);
                        }, this);

                        if(!_.isEmpty(existingInstances)) {
                            // remove the left over ones, caused if one deletes an instance.
                            // since we are regenerating xml, no need to worry about order, remaining SFs will update their data from the xml's top elems
                            for(var i = this.instanceManager.count; i < existingInstances.length; ++i) {
                                parentElement.removeChild(existingInstances[i]);
                            }
                        }
                        // But this will have a side effect in case of any other repeatable subform mapping to the same xpath LC-3911518
                    }
                } else {
                    childElement = xmlUtils.findOrCreateElement(childElementName +"[" + childElementIndex + "]",
                        parentElement);
                    Subform._super.generateDataXML.apply(this,[rootNode, childElement]);
                }
            }
        },

        _getDataSomMap : function (dataSomMap) {
            if(!this.instanceManager || !this.instanceManager._isRepeatable()) {
                return Subform._super._getDataSomMap.apply(this,arguments)
            }
            return dataSomMap;
        },

        _restoreDataSomMap: function(map) {
            if(!this.instanceManager || !this.instanceManager._isRepeatable()) {
                Subform._super._restoreDataSomMap.apply(this,arguments)
            }
        }
    });

    Subform.defineProps({
        "locale": {
            get: function() {
                var obj = this;
                var locale;
                while(!locale && obj) {
                    locale = obj.jsonModel.locale;
                    obj = obj.parent;
                }
                locale = locale || "en-US"; //TODO: read from jsp
                return locale;
            }
        },

        "instanceIndex":
        {
            get : function() {
                return this.mnInstanceIndex;
            }
        },

        "instanceManager": {
            get: function() {
                return this._instanceManager;
            },
            resolve:true
        },

        "occur": {
            get: function() {
                return this.instanceManager.occur;
            },
            resolve:true
        },

        "pageSet": {
            get: function(){
                return this.getElement("pageSet", 0, true);
            }
        },

        "variables": {
            get : function() {
                return  this.getElement("variables",0);
            } ,
            set :function(value) {
                this.setElement(value,"variables");
            }
        }
    });

    Subform.addMixins([
        xfalib.script.mixin.AddAssist,
        xfalib.script.mixin.AddPresence,
        xfalib.script.mixin.AddXYWH,
        xfalib.script.mixin.AddFillColor,
        xfalib.script.mixin.AddBorder,
        xfalib.script.mixin.AddBorderColor,
        xfalib.script.mixin.AddBorderWidth,
        xfalib.script.mixin.AddPara,
        xfalib.script.mixin.AddMargin
    ]);

})(_,xfalib);
/**
 * @package xfalib.script.ContentArea
 * @import xfalib.script.ContainerNode
 * @fileOverview The file creates the ContentArea Class required for XFA library
 * @version 0.0.1
 */

(function (_, xfalib) {
    /**
     * Creates a new ContentArea class
     *
     * @class The class represents a subform in the XFA Dom
     * @param {string}
     *            name the name of the node
     * @extends com.adobe.xfa.scripting.ContainerNode
     */
    var ContentArea = xfalib.script.ContentArea = xfalib.script.ContainerNode.extend({
        _computeJsonDiff: function (diff_level) {
            return xfalib.ut.XfaUtil.prototype.partialStripOrCall.call(this, diff_level, ContentArea._super._computeJsonDiff);
        }
    });

    ContentArea.addMixins([
        xfalib.script.mixin.AddXYWH
    ]);

})(_, xfalib);

/**
 * @package xfalib.script.PageArea
 * @import xfalib.script.ContainerNode
 * @fileOverview The file creates the PageArea Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new PageArea class
     *
     * @class The class represents a subform in the XFA Dom
     * @param {string}
        *            name the name of the node
     * @extends com.adobe.xfa.scripting.ContainerNode
     */
    var PageArea = xfalib.script.PageArea = xfalib.script.EventContainerNode.extend({
        execEvent : function(eventName) {
            return undefined;
        },

        playJsonForElement: xfalib.script.Subform.prototype.playJsonForElement,

        _computeJsonDiff: function (diff_level) {
            return xfalib.ut.XfaUtil.prototype.partialStripOrCall.call(this, diff_level, PageArea._super._computeJsonDiff);
        }
    });

    PageArea.defineProps({
        "access" : {
            get : function() {  //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.access, this._defaults.access);
            }
        },


        "presence" : {
            get : function() { //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.presence, this._defaults.presence);
            }
        }
    });
})(_, xfalib);




/**
 * @package xfalib.script.PageSet
 * @import xfalib.script.ContainerNode
 * @fileOverview The file creates the PageSet Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new PageSet class
     *
     * @class The class represents a subform in the XFA Dom
     * @param {string}
        *            name the name of the node
     * @extends com.adobe.xfa.scripting.ContainerNode
     */
    var PageSet = xfalib.script.PageSet = xfalib.script.EventContainerNode.extend({
        execEvent : function(eventName) {
            return undefined;
        },

        _computeJsonDiff: function (diff_level) {
            return xfalib.ut.XfaUtil.prototype.partialStripOrCall.call(this, diff_level, PageSet._super._computeJsonDiff);
        },

        playJsonForElement: function (elName, pJsonModel) {
            if(elName === "pageArea") { // LC-3642518 : allow data-merge on master page
                var newJChildren = _.filter(_.compact(pJsonModel.children), function (jChild) {
                    return jChild._class === "pageArea";
                }, this);
                var oldMChildren = _.filter(this.moChildNodes, function (mChild) {
                    return mChild.className === "pageArea";
                }, this);

                _.each(oldMChildren, function (oldMChild) {
                    var idPattern = new RegExp("^" + oldMChild.jsonModel.id + "(?:_ID)*$"); // look for an id value, followed by zero or more "_ID" suffixes
                    _.each(newJChildren, function (newJChild) {
                        if (oldMChild.name && oldMChild.name == newJChild.name && idPattern.test(newJChild.id)) { // match name as well as id, to account for mystery xtg master pg id gen logic
                            try {
                                oldMChild.playJson(newJChild); // may throw an exception, say for 0-instance fields on master pg. Say expected an inst.man but found null
                            } catch (exception) {
                                xfalib.runtime.xfa.Logger.error("xfa", "Exception during DataMerge on fields in master page. ",
                                                                [exception, oldMChild," PlayJSON on", newJChild]);
                            }
                        }
                    }, this);
                }, this);

                return true;
            } else {
                return PageSet._super.playJsonForElement.call(this, elName, pJsonModel);
            }
        }
    });

    PageSet.defineProps({
        "access" : {
            get : function() {  //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.access, this._defaults.access);
            }
        },

        "presence" : {
            get : function() { //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.presence, this._defaults.presence);
            }
        }

    });
})(_, xfalib);
/**
 * @fileOverview The file creates the SubformSet Class required for XFA library
 * @class The class represents a SubformSet in the XFA Dom
 * @version 0.0.1
 */
(function(_,xfalib){
    var SubformSet = xfalib.script.SubformSet = xfalib.script.Subform.extend({
        initialize: function() {
            SubformSet._super.initialize.call(this);
            this.tests = null;
        },

        execEvent : function(eventName) {
            return undefined;
        }

    });

    SubformSet.defineProps({
        "access": {
            get: function () {  //i am not sure how to make this property undefined so just removed setters for now
                return this.getOrElse(this.jsonModel.access, this._defaults.access);
            }

            //TODO : Add setter to delegate to children

        },

        "presence": {
            get: function () { //i am not sure how to make this property undefined so just removed setters for now
                return this.getOrElse(this.jsonModel.presence, this._defaults.presence);
            }

            //TODO : Add setter to delegate to children
        }

    });
})(_,xfalib);/**
 * @fileOverview The file creates the Area Class required for XFA library
 * @class The class represents a Area in the XFA Dom
 * @version 0.0.1
 */
(function(_,xfalib){
    var Area = xfalib.script.Area = xfalib.script.EventContainerNode.extend({
        execEvent : function(eventName) {
            return undefined;
        },

        playJsonForElement : xfalib.script.Subform.prototype.playJsonForElement

    });

    Area.defineProps({
        "access" : {
            get : function() {  //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.access, this._defaults.access);
            }
        },

        "presence" : {
            get : function() { //i am not sure how to make this property undefined so just removed setters
                return this.getOrElse(this.jsonModel.presence, this._defaults.presence);
            }
        }

    });

    Area.addMixins([
        xfalib.script.mixin.AddXYWH
    ]);

})(_,xfalib);/**
 * @fileOverview The file creates the Variables Class required for XFA library
 * @class The class represents a Variables in the XFA Dom
 * @version 0.0.1
 */
(function (_, xfalib) {
    var Variables = xfalib.script.Variables = xfalib.script.ContainerNode.extend({
        _initChildren: function () {
            var children = new Array();
            if (this.jsonModel.children) {
                var j = 0;
                for (var i = 0; i < this.jsonModel.children.length; i++) {
                    var child = this.jsonModel.children[i];
                    var childModel = xfalib.script.XfaModelRegistry.prototype.createNodeValue(child);
                    if (childModel) {
                        children[j++] = childModel;
                    }
                }
                this.children = children;
            }
        },

        _computeJsonDiff: function (diff_level) {
            // don't need variables for submission, but need them for replay on restoreFormState
            return xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, diff_level === 2, Variables._super._computeJsonDiff, arguments);
        },

        scopeless: function () {
            return ((this.name || "").length == 0);
        },

        /**
         * Return the DataSOMMap after adding an entry in the map for the node. The entry contains the value of the node
         * along with its Data SOM. If there is no Data SOM then return the unmodified map
         * @param map
         * @private
         */
        _getDataSomMap: function (map) {
            return map;
        },

        /**
         * Update the value of the node with the value provided in the input map. The map contains the values of the fields
         * mapped with their DataSOM. The function is empty for all the nodes, except for Field, Subform and Area.
         * @param map
         * @private
         */
        _restoreDataSomMap : function (map) {

        }

    });

    Variables.defineProps({
        "presence": {
            get: function () { //i am not sure how to make this property undefined so just removed setters
                return undefined;
            },
            set: function () {
            }
        }

    });
})(_, xfalib);
/**
 * @package xfalib.script.Occur
 * @import xfalib.ut.Class
 * @fileOverview The file creates the Occur Class required by InstanceManager
 *               for XFA library
 * @version 0.0.1
 */


(function(_, xfalib){
    /**
     * Creates a new Occur object
     *
     * @class The class represents the Occur Object
     * @constructor
     * @param {number}
        *            initial Initial occurrence of the subform managed by parent
     *            InstanceManager
     * @param {number}
        *            max Maximum occurrence of the subform managed by parent
     *            InstanceManager
     * @param {number}
        *            min Minimum occurrence of the subform managed by parent
     *            InstanceManager
     * @property {number} initial Initial occurrence of the subform managed by
     *           parent InstanceManager
     * @property {number} max Maximum occurrence of the subform managed by parent
     *           InstanceManager
     * @property {number} min Minimum occurrence of the subform managed by parent
     *           InstanceManager
     */
    var Occur = xfalib.script.Occur = xfalib.ut.Class.extend({
        _defaults : {
            "min" : "1",
            "max" : "1",
            "initial" : "1"
        },
        msClassName: "occur"

    });

    Occur.defineProps({
        initial:{
            get: function() {
                return parseInt(this.getOrElse(this.jsonModel.initial, this._defaults.initial));
            }
        },

        min: {
            get: function() {
                return parseInt(this.getOrElse(this.jsonModel.min, this._defaults.min));
            },
            set: function(nMin) {
            	this.jsonModel.min = nMin + "";
            }
        },

        max: {
            get: function() {
                return parseInt(this.getOrElse(this.jsonModel.max, this.min));
            },
            set: function(nMax) {
            	this.jsonModel.max = nMax + "";
            }
        },

        playJson : function(pJsonModel) {

        }

    })
})(_, xfalib);
/**
 * @package xfalib.script.InstanceManager
 * @import xfalib.script.Node
 * @import xfalib.script.Occur
 * @fileOverview The file creates the InstanceManager Class required for XFA
 *               library
 * @class The class represents a Instance Manager to manage multiple instance of
 *        subforms
 * @version 0.0.1
 */

(function (_, xfalib) {

    var InstanceManager = xfalib.script.InstanceManager = xfalib.script.Node.extend(
        {
            msClassName: "instanceManager",
            initialize: function () {
                InstanceManager._super.initialize.call(this);
                this._occur = new xfalib.script.Occur({"jsonModel": this.jsonModel});
                this.moChildrenCreated = [];
                this.mnCurrent = 0;
                this.mbStandalone = false;
            },

            _instanceTemplate: function () {
                var parent = this.parent;
                if (this._templateRef() == null || parent == null || parent._templateRef() == null || parent._templateRef().children == null)
                    return null;
                var tmpltParent = parent._templateRef();
                var imIndex = tmpltParent.children.indexOf(this._templateRef());
                if (imIndex < 0 || tmpltParent.children.length < imIndex + 2)
                    return null;
                else
                    return tmpltParent.children[imIndex + 1];
            },

            _isRepeatable: function () {
                var max;
                return ((max = +this.max) < 0 || +this.min < max);
            },

            _isInstanceManager: function () {
                return true;
            },

            /**
             * @private
             *
             * Manage a child instance that was created.
             *
             * @param oCreatedChild
             *        the child to be managed.
             */


            _manageChild: function (oCreatedChild, nIndex) {
                oCreatedChild._instanceManager = this;
                if (nIndex === undefined) {
                    this.moChildrenCreated.splice(this.mnCurrent, 0, oCreatedChild);
                    oCreatedChild.mnInstanceIndex = this.mnCurrent++;
                }
                else {
                    this.moChildrenCreated.splice(nIndex, 0, oCreatedChild);
                    oCreatedChild.mnInstanceIndex = nIndex;
                    this.mnCurrent++;
                    for (var i = nIndex + 1; i < this.moChildrenCreated.length; i++)
                        this.moChildrenCreated[i].mnInstanceIndex = i;
                }
            },

            _computeJsonDiff: function (diff_level) {
                //we don't need InstanceManager for final submission if there is only one instance, and it's not a repeatable SF
                // but need it for maintaining hierarchy in restoreFormState
                return xfalib.ut.XfaUtil.prototype.stripOrCall.call(this, diff_level === 2 && (!this._isRepeatable() && this.moChildrenCreated.length <= 1), InstanceManager._super._computeJsonDiff, arguments);
            },

            /*
             * add an instance of the repeatable subform.
             */
            addInstance: function () {
                return this._insertInstance();
            },

            _insertInstance: function (nIndex, oChildAdded) {
                if ((+this.max >= 0) && (+this.max == this.count)) //TODO : discuss whether to use private variables or not
                    return null;
                if (nIndex !== undefined && nIndex > +this.count)
                    return null;

                if (oChildAdded === undefined) {
                    var sfTemplate = this._instanceTemplate();
                    //
                    // needs to add an instance to the model
                    //
                    if (sfTemplate == null)
                        return null;
                    var clonedJson = {};
                    var uniquePrefix = this.xfaUtil().generateUID();
                    this.copyObject(sfTemplate, clonedJson,
                        {
                            exceptions: ["htmlId"],
                            transformMaps: {
                                "dataId": function (srcValue, options) {
                                    return uniquePrefix + "_" + srcValue;
                                }
                            }
                        }
                    );
                    oChildAdded = xfalib.script.XfaModelRegistry.prototype.createModel(clonedJson);
                }
                if (oChildAdded != null) {
                    //
                    // first add the child to the list of managed children
                    //
                    oChildAdded._newChild = true
                    this._manageChild(oChildAdded, nIndex);
                    //
                    //TODO: If not standalone mode, add the new item to the parent container as well. Understanding standalone mode
                    //
                    if (this.mbStandalone == true) {
                        if (nIndex !== undefined)
                            oChildAdded.index = nIndex;
                        else
                            oChildAdded.index = this.mnCurrent;
                        oChildAdded.parent = this.parent;
                    } else {
                        var oParentContainer = this.parent;
                        if (oParentContainer != null) {
                            if (this.mnCurrent > 1 && nIndex!==0) {
                                //
                                // If we already had children get the index of first
                                // child in the parent container
                                //
                                nIndex = nIndex !== undefined ? nIndex : this.mnCurrent - 1;
                                var nInsertionIndex = oParentContainer
                                    ._getChildIndex(this.moChildrenCreated[nIndex - 1]);
                                nInsertionIndex++;
                                oParentContainer._addChildAt(oChildAdded,
                                    nInsertionIndex);
                            } else {
                                //
                                // If this is the first child, add it just after the
                                // instance manager
                                //
                                oParentContainer._addChildAt(oChildAdded,
                                        oParentContainer._getChildIndex(this) + 1);
                            }

                        }
                    }
                    if (_.contains(['INITIALIZED', 'INITIALIZING'], this._xfa()._modelInitialize)) {
                        try {
                            oChildAdded.execInitialize();
                            this._xfa().form.execCalculate();
                        } catch (ex) {
                            this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-013"], ["addInstance"]);
                        }
                    }
                    return oChildAdded;
                }
                return null;
            },

            insertInstance: function (nIndex) {
                return this._insertInstance(nIndex);
            },


            moveInstance: function (sIndex, dIndex) {
                if ((+this.max >= 0) && dIndex >= +this.count || sIndex >= +this.count || sIndex == dIndex) //TODO : discuss whether to use private variables or not
                    return null;
                var tIndex;
                var oParentContainer = this.parent;
                var oChild = this.moChildrenCreated[sIndex];
                tsIndex = dIndex < sIndex ? sIndex + 1 : sIndex;
                tdIndex = dIndex > sIndex ? dIndex + 1 : dIndex;
                this.max++;
                var newChild = this._insertInstance(tdIndex);
                this.max--;
                newChild.playJson(oChild.jsonModel);
                if (oParentContainer != null) {
                    var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.CHILD_MOVED, oParentContainer, "child", null, null);
                    oParentContainer.trigger(evnt.name, evnt);
                }
                this.removeInstance(tsIndex);
            },


            /*
             * add an instance of the repeatable subform.
             */
            removeInstance: function (index) {
                //
                // don't remove any more than the minimum
                //
                if (this.count == 0 || this.min == this.count)
                    return;

                if (index >= +this.count)
                    return;
                //
                // needs to remove an instance to the model
                //
                var oChild = this.moChildrenCreated[index];
                this.moChildrenCreated.splice(index, 1);
                this.mnCurrent--;
                for (var i = index; i < this.moChildrenCreated.length; i++)
                    this.moChildrenCreated[i].mnInstanceIndex = i;

                var parent = oChild.parent;
                parent._removeChild(oChild);

                if (_.contains(['INITIALIZED', 'INITIALIZING'], this._xfa()._modelInitialize)) {
                    try {
                        this._xfa().form.execCalculate();
                    } catch (ex) {
                        this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-013"], ["removeInstance"]);
                    }
                }
            },

            /*
             * empty function since there is no data associated with IM
             */
            resetData: function () {

            },

            setInstances: function (num) {
                this.count = num;
            },
            /*
             *
             */
            getNaked: function (nIndex, createGetterSetter, Obj, scope) {
                if (this.getAttribute("name").length > 0 && this.getAttribute("name") != "_")
                    InstanceManager._super.getNaked.apply(this, arguments);
            },

            playJson: function (pJsonModel) {

            }
        }
    );
    InstanceManager.defineProps({
        "min": {
            get: function () {
                return this.occur.min + "";
            },
            set: function (nMin) {
                this.occur.min = nMin;
            }
        },
        "max": {
            get: function () {
                return this.occur.max + "";
            },
            set: function (nMax) {
                this.occur.max = nMax;
            }
        },

        "occur": {
            get: function () {
                return this._occur;
            }
        },
        // This API is used in adaptive form
        "instances": {
            get: function() {
                return _.extend([], this.moChildrenCreated);
            }
        },

        "count": {
            get: function () {
                return this.moChildrenCreated.length + "";
            },
            set: function (value) {
                if (value == parseInt(value))
                    value = parseInt(value);
                else return;
                var count = +this.count,
                    tvalue = Math.abs(value - count),
                    max = +this.max,
                    min = +this.min;
                //Bug#3544368 value > max condition will only hold if max is positive (if max == -1
                // there is no limit on the upper count )
                if ((max > 0 && value > max) || value < min || value == count)
                    return;
                if (value > count) {
                    for (var i = 0; i < tvalue; i++)
                        this._insertInstance();
                }
                if (value < count) {
                    for (var i = 0; i < tvalue; i++)
                        this.removeInstance(--count);
                }
            }
        }
    })
})(_, xfalib);

/**
 * @package xfalib.script.ExclusionGroup
 * @import xfalib.script.ContainerNode
 * @fileOverview The file creates the ExclusionGroup Class required for XFA
 *               library
 * @version 0.0.1
 */

(function(_, xfalib){
    /**
     * Creates a new ExclusionGroup class
     *
     * @class The class represents a ExclusionGroup in the XFA Dom
     * @param {string}
        *            name the name of the node
     * @extends com.adobe.xfa.scripting.ContainerNode
     */
    var ExclusionGroup = xfalib.script.ExclusionGroup = xfalib.script.EventContainerNode.extend({

        initialize : function(){
            ExclusionGroup._super.initialize.call(this);
            this.tests= [this._nullTest,this._scriptTest];
        },

        _getOnChild: function(otherChild) {
            return _.find(this.moChildNodes, function(child) {
                 return child.className == "field" && child.selectedIndex == 0 && child != otherChild
            })
        },

        _eventHandler : function(eventName) {
            var rValue = undefined;
            switch(eventName) {
                case "calculate":
                    if(this.moEvents["calculate"] && this.moEvents["calculate"].length >0){
                        rValue = this.moEvents["calculate"][0].execute(this, "calculate");
                    }
                    break;
                case "validate":
                    if(this.moEvents["validate"] && this.moEvents["validate"].length >0){
                        rValue = this.moEvents["validate"][0].execute(this, "validate");
                    }else
                        rValue = true;
                    break;
                default:
                    if (this.moEvents[eventName]) {
                        for ( var i = 0; i < this.moEvents[eventName].length; i++) {
                            this.moEvents[eventName][i].execute(this, eventName);
                        }
                    }
//                    ExclusionGroup._super._eventHandler.call(this, eventName);  //TODO: Why this is required?
            }
            return rValue
        },

        _handleSelectChild : function(child) {
            var oldVal = this.rawValue,
                evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED,
                                                                this,"ClearError",null, null),
                onChild = this._getOnChild(child);

            this.trigger(evnt.name,evnt);

            if (child.selectedIndex == 0) {
                if(onChild)
                    onChild.setItemState(0,false);
                this._handleDependants();
            } else if (child._matches(onChild)) {
                 this._handleDependants();
            }
        },

        selectedMember : function() {
            var currentNode = this._xfa().moCalculateEventNode;
            if (currentNode != null) {
                this.addDependant(currentNode);
            }
            return this._getOnChild();
        },

        _isExclusionGroup : function() {
            return true;
        },

        _getValue : function() {
            var onChild = this._getOnChild()
            return onChild ? onChild._getValue() : null;
        },

        _nullTest : function(sMessages) {
            var valid = true;
            var value = this._getValue();
            if (value == null && this.mandatory != "disabled") {
                this._mFailedValTest = "nullTest";
                this._mFailedValLevel = this.mandatory;
                this._errorText = this.mandatoryMessage;
                this._addMessage(sMessages, this._errorText, this._mFailedValLevel);
                valid = false;
            }
            return valid;
        },

        _getElementsFromXpath: xfalib.script.Field.prototype._getElementsFromXpath,

        /**
         * Exclusion Group can have two types of prefill xml. Long format and short format . In case of Long format,
         * the value of each of  the children of exclusion group is present and hence we need to iterate the children to
         * prefill the value. For short format the textContent is the value of the Exclusion Group
         *
         * The difference between the short and Long format is that in short Format, there are no children of Exclusion
         * Group in xml.
         * @param xmlDocument
         * @param contextNode
         * @param currentBindRef
         * @private
         */
        _playDataXML: function(xmlDocument, contextNode, currentBindRef) {
            var xpath = this._getXpathFromBindRef(),
                nodeIter;
            if(xpath != null) {
                nodeIter = this._getElementsFromXpath(xpath, contextNode, xmlDocument);
                if(nodeIter != null) {
                    var node = nodeIter.iterateNext();
                    if(node != null) {
                        // node has further element childs then iterate over them otherwise set the content as its rawValue
                        if(node.childElementCount > 0) {
                            ExclusionGroup._super._playDataXML.apply(this, [xmlDocument, node, currentBindRef]);
                        } else {
                            this.rawValue = node.textContent;
                        }
                    }
                } else {
                    this._resetData();
                }
            }
        },

        generateDataXML: xfalib.script.Field.prototype.generateDataXML,

        _appendValueInXMLElement: xfalib.script.Field.prototype._appendValueInXMLElement
    });

    ExclusionGroup.defineProps({
        "rawValue" : {
            get : function() {
                var currentNode = this._xfa().moCalculateEventNode;
                if (currentNode != null) {
                    this.addDependant(currentNode);
                    // The children should not register the
                    // calculateNode as dependent on them, else the
                    // calculate event for calculateNode will be called
                    // multiple times.
                    this._xfa()._popCalculateEventNode();
                }

                var val = this._getValue();

                if (currentNode != null)
                    this._xfa()._pushCalculateEventNode(currentNode);

                return val;
            },
            set : function(oValue) {
            	var sMessages = new Array(),
                    onChild = this._getOnChild(),
                    oldVal = onChild ? onChild._getValue() : null

                oValue = this.validateInput(oValue, "string");
                if (oldVal === oValue)
                    return;
                if (onChild) {
                    onChild.setItemState(0, false);
                }
                onChild = _.find(this.moChildNodes, function(child) {
                                    return child.className == "field" &&
                                           child.getOrElse(child.getSaveItem(0), child.getDisplayItem(0)) == oValue
                                })
                if (onChild)
                    onChild.rawValue = oValue;
                this._handleDependants();
                this._xfa().queueValidateEvent(this);
            }
        },

        "mandatory" : {
            get : function() {
                return this.getOrElse(this.validate.nullTest, this._defaults.validate.nullTest);
            },
            set: function (value) {
                if(this.validate){
                    this.validate.nullTest = value;
                }
            }
        },

        "members" : {
            get : function() {
                var list = new xfalib.script.XfaList();
                this.moChildNodes.filter(function(elem) {
                    return elem._isField();
                }).map(function(elem1){
                    list._append(elem1);
                });
                return list;
            }
        },

        "isNull":{
            get : function() {
               if(this._getValue() != null)return false;
               else return true;
            }
        },

        "mandatoryMessage" : {
            get : function() {
                var m = this.getOrElse(this.validate.message.nullTest,this._defaults.validate.message.defaultMessage);
                return m.value;
            }
        }
    });

    ExclusionGroup.addMixins([
        xfalib.script.mixin.AddAssist,
        xfalib.script.mixin.AddCaption,
        xfalib.script.mixin.AddPresence,
        xfalib.script.mixin.AddXYWH,
        xfalib.script.mixin.AddFillColor,
        xfalib.script.mixin.AddBorder,
        xfalib.script.mixin.AddBorderColor,
        xfalib.script.mixin.AddPara,
        xfalib.script.mixin.AddMargin
    ]);

})(_, xfalib);
/**
 * @package xfalib.script.Model
 * @import xfalib.script.Node
 */

(function(_, xfalib){
    var Model = xfalib.script.Model = xfalib.script.Element.extend({
        msClassName: "model",

        createNode : function(sClassName,sName,sNamespace) {    //TODO: looks incomplete
            sName = (typeof sName != 'undefined')?sName:"";
            sNamespace = (typeof sNamespace != 'undefined')?sNamespace:"";
            var jsonModel = {};
            jsonModel._class = sClassName;
            jsonModel.name = sName;
            var node = xfalib.script.XfaModelRegistry.prototype.createModel(jsonModel);
            return node;
        }
    });
})(_, xfalib);

/**
 * @package xfalib.script.Form
 * @import xfalib.script.ContainerNode
 */

(function (_, xfalib) {
    /**
     * @class
     * <p>
     * The Form class is the implementation of the top level XFA form object.
     * </p>
     *
     * <p>
     * The form object is accessed from the xfa object as xfa.form
     * </p>
     *
     */
    var Form = xfalib.script.Form = xfalib.script.EventContainerNode.extend({
        _getRootSubform: function () {
            return this.children[0];
        },

        _initialize: function () {
            this._xfa()._modelInitialize = 'INITIALIZING';
            var rootSubform = this._getRootSubform();
            rootSubform._initialize();
            //
            // Call all initialization then
            // calculations
            // scripts to execute
            //
            var pgSets = rootSubform.resolveNodes("#pageSet[*]");
            function execOnPgSets (execFuncname) {
                for(var i=0; i < pgSets.length; ++i) {
                    pgSets.item(i)[execFuncname]();
                }
            }

            rootSubform.execFormReady();
            execOnPgSets("execFormReady");
            rootSubform.execInitialize();
            execOnPgSets("execInitialize");
            rootSubform.execLayoutReady();
            execOnPgSets("execLayoutReady");
            rootSubform.execCalculate();
            this._xfa()._modelInitialize = 'INITIALIZED';
        },

        playJson: function (pJsonModel) {
            this._getRootSubform().playJson(pJsonModel.children[0]);
        },

        /**
         * @private
         * @function indicate that this is a Form node (~~).
         */
        _isForm: function () {
            return true;
        },

        execCalculate: function () {
            return this._getRootSubform().execCalculate();
        },

        execInitialize: function () {
            this._getRootSubform().execInitialize();
        },

        execFormReady: function () {
            this._getRootSubform().execFormReady();
        },

        execLayoutReady: function () {
            this._getRootSubform().execLayoutReady();
        },

        execValidate: function () {
            return this._getRootSubform().execValidate();
        },

        /**
         * remerge the data with the form model
         */
        remerge: function () {
            this._getRootSubform()._bind();
        },

        /**
         * recalculate this form model
         */
        recalculate: function (bool) {
            var xf = this._xfa();
            if (xf.host.calculationsEnabled) {
                if (xf.calculateRunning)
                    return;
                if (bool) {
                    this.execCalculate();
                    this.execFormReady();
                } else {
                    xf.runCalcs()
                }
            }
        },

        _computeJsonDiff: function (diff_level) {
            var diff = Form._super._computeJsonDiff.call(this, diff_level);
            diff.jsonDifference["versionNS"] = this.jsonModel["versionNS"];
            return { "changed": true,
                "jsonDifference": diff.jsonDifference
            };
        },

        createNode: xfalib.script.Model.prototype.createNode

    });
})(_, xfalib);
/**
 * @package xfalib.script.Host
 * @import xfalib.script.Node
 * @fileOverview The file creates the Host Class required for XFA library
 * @version 0.0.1
 */

(function(_, xfalib, $){
    /**
     * @class The class represents the Host Object
     * @extends com.adobe.xfa.scripting.Node
     * @property {string} appType the application type of the host
     * @property {number} currentPage Page number of the form that is being
     *           displayed
     * @property {number} numPages total number of pages in the form
     * @property {name} name name of the application
     * @property {number} platform OS platform on which the application is running
     * @property {number} title title of the document
     * @property {number} version version number of the current application
     */
    var Host = xfalib.script.Host = xfalib.script.Node.extend({
        msClassName: "hostPseudoModel",
        initialize : function(){
            Host._super.initialize.call(this);
            this.jsonModel.name = "";
            this.mPageNumber = 0;
            this.pagingManager = null ;
            this.mCalculationsEnabled = true;
            this.mValidataionsEnabled = true;
            this.mNumPages = "";
            this.dataBrowser = [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {		// for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Internet Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                { 		// for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ];
        },

        _searchVersion : function(data,srch) {
            var index = data.indexOf(srch);
            if (index == -1) return;
            var spcIndex = data.indexOf(" ",index);
            if(spcIndex == -1)
                return data.substring(index+srch.length+1);
            return data.substring(index+srch.length+1,spcIndex);
        },

        _browserDetect : function() {
            var data = this.dataBrowser;
            for (var i=0;i<data.length;i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                var versionSearchString = data[i].versionSearch || data[i].identity;
                var version = this._searchVersion(navigator.userAgent,versionSearchString) || this._searchVersion(navigator.appVersion,versionSearchString) || "an unknown version";
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity+" "+version;
                }
                else if (dataProp)
                    return data[i].identity+" "+version;
            }
        },

        /**
         * The function displays a dialog box on the screen. <br />
         * <b>TO DO</b><br />
         * <ul>
         * <li> The function doesn't supports icons as of now. Needs adding support for
         * that.</li>
         * <li> The dialog uses the default styling (provided by google). Need to change
         * that too. </li>
         * </ul>
         *
         * @function
         * @param {string}
            *            message The message to display
         * @param {string}
            *            title The title to appear in the dialog's window title
         * @param {number}
            *            type The icon to display: '0' (Error (default)), '1' (Warning),
         *            '2' (Question), and '3' (Status).
         * @param {number}
            *            buttons The buttons to display: '0' (OK (default)), '1' (OK,
         *            Cancel), '2' (Yes, No), and '3' (Yes, No, Cancel).
         */
        messageBox : function(message, title, type, buttons) {
            return (this._messageBox(message,title,type,buttons,null));
        },

        _messageBox : function(message, title, type, buttons,callback) {
            title = title || "";
            buttons = buttons || 0;
            var img =["Error","Warning","Question","Status"];
            var imgType = "";
            if(type!=undefined)
                imgType =  "[ " + img[type] + " ]  ";
            message = imgType  +  title + "\n\r" + message ;

            switch (buttons) {
                case 0:
                    alert(message);
                    return 1 ;
                case 1:
                    var a = confirm(message);
                    if(a==true)
                        return 1;
                    else return 2;
                case 2:
                    var a = confirm(message);
                    this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-009"]) ;
                    if(a==true)
                        return 4;
                    else return 3;

                case 3:
                    this._xfa().Logger.error("xfa", xfalib.locale.LogMessages["ALC-FRM-901-010"]);
                    return 0;
            }
        },

        /**
         * The function displays the next page of the document (if one exists)
         *
         * @function
         */
        pageDown : function() {
            if (this.currentPage != this.numPages -1 ) {
                if(this.pagingManager)
                    this.pagingManager.pageDown();
            }
        },

        /**
         * The function displays the previous page of the document (if one exists)
         *
         * @function
         */
        pageUp : function() {
            if (this.currentPage != 0)  {
                var prevPage = this.currentPage - 1;
                var a = $($(".page")[prevPage])  ;
                window.scrollTo(0,a.offset().top) ;
            }
        },

        gotoURL: function(url, bNewFrame) {
            /*if(!$("a#gotourl").length)
                $("<a id='gotourl'></a>").appendTo('body');
            $("a#gotourl").attr("href",url)[0].click();
            //$("a").click();     */
            if(url.search("http") == -1)
                url = "http://" + url ;
            if(bNewFrame != true) {
                window.open(url) ;
            }
            else
                window.location = url;
        },

        resetData : function() {
            if(arguments.length)
                _.each(arguments,function(som) {
                    var node = this._xfa().resolveNode(som);
                    if(node)
                        node._resetData();
                },this)
            else {
                this._xfa().form._resetData();
            }
        },

        setFocus : function(som) {
            if(navigator.userAgent.match(/iPad/i) != null && this._xfa().moContextScriptEvent == 'change') {
            // LC-4663 : setFocus was shifting focus, before keypress was visible in browser.
            // Currently iPad doesnt support calling focus() from within setTimeout, so disabling the functionality.
                this._setFocus(som); // don't queue focus events, fire it immediately
            } else {
                this._xfa().queueFocusEvent(this, som);
            }
        },

         _setFocus : function(som) {
                    var node = som;
                    if(typeof som == "string")
                        node = this._xfa().resolveNode(som);
                    if(node != null){
                       if(this.pagingManager){
                            if(navigator.userAgent.match(/iPad/i) != null && this._xfa().moContextScriptEvent == 'change') {
                                this.pagingManager._makePageForHtmlId(node.htmlId); // LC-4663 : just render, not setFocus
                            } else {
                                this.pagingManager._makePageForHtmlId(node.htmlId,node._setFocus,node);  // for all other events set the focus
                            }
                        }
                    }
                    return node;
        },

         getFocus : function() {
                          if(xfalib.view.FieldView.prototype.currentFocus)
                            return(xfalib.view.FieldView.prototype.currentFocus.model);
                          else
                            return null;
                        } ,

        playDataXml: function (xmlDocument) {
            var rootElement;
            if(_.isUndefined(document.evaluate)) {
                // need to do it here since XPathResult is also undefined in IE
                wgxpath.install();
            }
            if(_.isString(xmlDocument)) {
                this._xfa().Logger.info("xfa", "xmlDocument is of type string. converting it to document");
                xmlDocument = $.parseXML(xmlDocument);
            }
            rootElement = xfalib.ut.XMLUtils.getXFARootFormElementFromXML(xmlDocument);
            this._xfa().form._playDataXML(rootElement, rootElement, "");
        },

        playJson : function(xfaJsonModel) {
            var formDom =  _.find(xfaJsonModel.children,
                function(child){
                    return child._class == "form";
                }
            );
            this._xfa().form.playJson(formDom);
            var evnt = xfalib.script.XfaModelEvent.createEvent(xfalib.script.XfaModelEvent.FORM_MODEL_REFRESH,
                this,"jsonModel",null,this._xfa().form.jsonModel);
            this.trigger(evnt.name,evnt);
        },

        runServerScript : function(options) {
            options = options|| {};
            var xfaDiff = this._xfa()._computeJsonDiff(0).jsonDifference;
            var xfaDomString = JSON.stringify(xfaDiff);
           //clone the object to avoid polluting the context
            var params = _.extend({
                    formDom: xfaDomString,
                    packet: 'form'
                },
                options,
                xfalib.runtime.renderContext);

            var serverScriptSuccessHandler = function(result){
                this.playJson(result); //result will be a JSON object so just play it.
            };

            if(options.contextSom && options.activity)
            {
                var that = this;
                window.formBridge._invokeAtServer({
                    data: params,
                    success:_.bind(serverScriptSuccessHandler,this),
                    error: function(xhr,txtStatus,errorThrown) {
                        var msg
                        switch(xhr.status) {
                            case 0:
                                msg = xfalib.locale.LogMessages["ALC-FRM-901-008"];
                                this._xfa().Logger.error("xfa", msg + " " + xhr.statusText);
                                break;
                            default:
                                msg = xfalib.locale.LogMessages["ALC-FRM-901-001"];
                                this._xfa().Logger.error("xfa", msg + " " + xhr.statusText);
                                break;
                        }
                        that.messageBox(msg);
                    }
                });
            }
        },

        _validate : function(options) {
            var _options = options || {},
                valMessages = _options.valMessages || [];
            var valid = this._xfa().form._validate(valMessages);
            if(valid)
                return true;

            var errors = "";
            var warnings = "";

            for(var i=0; i < valMessages.length; i++)
            {
                var msg = null;
                if(msg = valMessages[i])
                {
                    if(msg.severity == "error") {
                        errors = errors + msg.message + "\r\n";
                    }
                    if(msg.severity == "warning"){
                        warnings = warnings + msg.message + "\r\n";
                    }
                }
            }
            if(errors)
            {
                var that = this;
                var msg = "  The form could not be submitted because "+valMessages.length +" errors were found"
                if($("#wb-main-in").length){
                    if(!$("#xfa-errorMessages").length){
                        $("#wb-main-in").prepend("<div id ='xfa-errorMessages'></div>");
                    }
                    $("#xfa-errorMessages").empty().text(msg).append("<ul id='xfa-errorList'></ul>");
                    _.each(valMessages,function(elem) {
                        $("<a></a>").appendTo($("<li></li>").appendTo('#xfa-errorList'))
                                         .text(elem.message)
                                          .click(
                                                function() {
                                                    return that.setFocus(elem.ref);
                                                });
                    })
                    if(valMessages.length ==0)
                        $("#xfa-errorMessages").hide();
                    else
                        $("#xfa-errorMessages").show();
                }
                this.setFocus(valMessages[0].ref);
                return false;
            }
            else if(warnings)
            {
                this.messageBox(warnings, xfalib.locale.Strings.warning, 1, 0);   //TODO :Should  be ok/cancel
                return true;
            }
        },

        /**
         * Helper function for currentDateTime
         *
         * @function
         */
        _padzero : function(n) {
            return n < 10 ? '0' + n : n;
        },

        /**
         * Helper function for currentDateTime
         *
         * @function
         */
        _pad2zeros : function(n) {
            if (n < 100) {
                n = '0' + n;
            }
            if (n < 10) {
                n = '0' + n;
            }
            return n;
        },

        /**
        * The function Returns current date and time in [m]m/[d]d/yy [H]H:[M]M (A|P)M format
        *
        * @function
        */
        currentDateTime : function() {
            var now = new Date(),
                    curYear = now.getFullYear() +'',
                    curMonth = now.getMonth()+1 +'',
                    curDate = now.getDate() +'',
                    curHour = now.getHours() +'',
                    curMin = now.getMinutes() +'',
                    curSec = now.getSeconds() +'';

            return (curYear + this._padzero(curMonth) + this._padzero(curDate) + 'T' +
                    this._padzero(curHour) + this._padzero(curMin) + this._padzero(curSec));
        },

        /**
         * Helper function for currentDateTime
         *
         * @function
         */
        _toISOString : function(d) {
            return d.getUTCFullYear() + '-' +  this._padzero(d.getUTCMonth() + 1) + '-' +
                this._padzero(d.getUTCDate()) + 'T' + this._padzero(d.getUTCHours()) + ':' +
                this._padzero(d.getUTCMinutes()) + ':' + this._padzero(d.getUTCSeconds()) + '.' + this._pad2zeros(d.getUTCMilliseconds()) + 'Z';
        },

        /**
         * The function Returns current date and time in ISO 8601 format
         *
         * @function
         */
        _currentDateTime : function() {
            var now = new Date();
            return(this._toISOString(now));
        }

    });

    Host.platforms = [["Win","Windows"],["Mac"],["iPhone","iPhone/iPod"],["iPad"],["Linux"],["Unknown"]];

    Host.defineProps({
        "appType" : {
            get : function() {
                return "HTML 5";
            }
        },

        "currentPage" : {
            get : function() {
                if(this.pagingManager)
                    return(this.pagingManager.currentPage());
            },
            set : function(page) {
                var currentPage = 0,
                    lastPage = 0;
                page = parseInt(page);
                if(this.pagingManager) {
                    currentPage = this.pagingManager.currentPage();
                    lastPage = this.pagingManager.pageCount();
                }

                if(page < 0)
                    page = 0;
                else if(page >= lastPage)
                    page =  (lastPage > 0) ? lastPage -1 : 0;

                var $pages = $(".page");

                if( page > $pages.length-1 ) {  // not all pages rendered yet
                    if(this.pagingManager) {
                        while(this.pagingManager.hasMorePages() && currentPage <= page){
                            this.pagingManager.renderNextPage();
                            currentPage++;
                        }
                    }
                    $pages = $(".page");   // select newly rendered pages
                }

                var a = $($pages[page]);
                window.scrollTo(0,a.offset().top) ;
            }
        },

        "name" : {
            get : function() {
                return this._browserDetect();
            }
        },

        "variation" : {
            get : function() {

            }
        },

        "numPages" : {
            get : function() {
                if(this.pagingManager)
                    return(this.pagingManager.pageCount());
            }
        },

        "platform" : {
            get : function() {
                var arr = Host.platforms;
                if (!this.mPlatform) {
                    for(var i = 0;i<arr.length;i++)
                          if(~navigator.platform.indexOf(arr[i][0]))
                                break;
                    i = i == arr.length ? i - 1 :i;
                    this.mPlatform =  arr[i][arr[i].length-1];
                }
                return this.mPlatform
            }
        },

        "title" : {
            get : function() {
                return document.title;
            },
            set : function(title) {
            	title = this.validateInput(title, "string");
                document.title = title;
            },
            enumerable : true
        },

        "version" : {
            get : function() {
                return "1.0";
            }
        },


        "calculationsEnabled" : {
            get : function() {
                return this.mCalculationsEnabled;
            },
            set : function(sCalculationsEnabled) {
            	//sCalculationsEnabled = this.validateInput(sCalculationsEnabled, "string");
                var sOriginalValue = this.mCalculationsEnabled;
                this.mCalculationsEnabled = sCalculationsEnabled;
                if (!sCalculationsEnabled) {
                    //this.xfa._rootSubform._clearMessages(); TODO: Clear Calculation messages
                } else if (sCalculationsEnabled && (sOriginalValue == false)) {
                    this._xfa().form.execCalculate();
                }
            }
        },

        "validationsEnabled" : {
            get : function() {
                return this.mValidataionsEnabled;
            },
            set : function(sValidationsEnabled) {
            	//sValidationsEnabled = this.validateInput(sValidationsEnabled, "string");
                var sOriginalValue = this.mValidataionsEnabled;
                this.mValidataionsEnabled = sValidationsEnabled;
                if (!sValidationsEnabled) {
                    //this.xfa._rootSubform._clearMessages(); TODO: Clear Validation messages
                } else if (sValidationsEnabled && (sOriginalValue == false)) {
                    this._xfa().form._validate();
                }
            }
        }

    });
})(_, xfalib, $);







(function (_, $, xfalib) {
    var XfaTemplateCache = xfalib.script.XfaTemplateCache = xfalib.ut.Class.extend({

        initialize: function () {
            XfaTemplateCache._super.initialize.call(this);
            this._lastID = (new Date()).getTime(); //TODO: Get a better scheme
            this._nodeCache = {};        // live cache
            this._t0JsonNodeCache = {}; // initial cache
            this.idMap = {};           //--map to get the field instance of the corresponding field-id

            var jsonString = JSON.stringify(this.options.initialFormDom), //We create copy of initial form dom via JSON api instead of this.copyObject since that is fast
                initialFormDomCopy = JSON.parse(jsonString),    //Create copy of initial form dom to guard against future modifications
                formDomTemplate = {};   //Copy holding formDomTemplate

            this.copyObject(initialFormDomCopy, formDomTemplate, {"exceptions": ["children"]});
            //Generate template
            this._processTemplate(formDomTemplate, initialFormDomCopy, false);
            var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);
            //To maintain backward compatibility
            if (behaviorConfig.isOn('stripInitialFormDom') || behaviorConfig.isOn('mfStripInitialFormDom')) {
                xfalib.ut.XfaUtil.prototype.stripObject(this._t0JsonNodeCache[initialFormDomCopy.extras.htmlId].initialRef,
                                                        ['_class', 'name', 'htmlId', 'presence', 'min', 'max']);
            }
        },

        getTemplateRef: function (htmlId) {
            if (this._nodeCache.hasOwnProperty(htmlId))
                return this._nodeCache[htmlId].templateRef;
            else if (this._t0JsonNodeCache.hasOwnProperty(htmlId))
                return this._t0JsonNodeCache[htmlId].templateRef;
            else
                return null;
        },

        getInitialFormDomRef: function (htmlId) {
            if (this._t0JsonNodeCache.hasOwnProperty(htmlId))
                return this._t0JsonNodeCache[htmlId].initialRef;
            else
                return null;
        },

        getModel: function (htmlId) {
            if (this._nodeCache.hasOwnProperty(htmlId))
                return this._nodeCache[htmlId].model;
            else
                return null;
        },

        putModel: function (model, jsonTemplate) {
            this._processModel(jsonTemplate, model);
        },

        removeModel: function (htmlId) {
            if (this._nodeCache.hasOwnProperty(htmlId))
                delete this._nodeCache[htmlId];
        },

        _processTemplate: function (jsonTemplate, jsonModel, canRepeat) {
            var templateId = null;
            if (this.getOrElse(jsonTemplate, "extras.htmlId", null) == null) {
                jsonTemplate.extras = jsonTemplate.extras || {};
                jsonTemplate.extras.htmlId = "CL_" + (++this._lastID);
                templateId = jsonTemplate.extras.htmlId;
            }
            if (this.getOrElse(jsonModel, "extras.htmlId", null) == null) {
                jsonModel.extras = jsonModel.extras || {};
                if (templateId != null)
                    jsonModel.extras.htmlId = templateId;
                else
                    jsonModel.extras.htmlId = "CL_" + (++this._lastID);
            }
            this._t0JsonNodeCache[jsonModel.extras.htmlId] = {templateRef: jsonTemplate, initialRef: jsonModel};

            if (!canRepeat && !_.contains(["area", "pageSet", "pageArea", "subform", "subformSet", "contentArea", "exclGroup", "form"], jsonModel._class)) {
                //Process it's child only if that can repeat or it can have paintable children. This is badly written check. Need to re-code this.
                return;
            }

            var lastIM = null;
            var lastChildSF = false;
            var childTemplateIndex = -1;
            _.each(jsonModel.children,
                function (childNode, i) {
                    if (this.matchJsonType(childNode, "instanceManager")) {
                        lastIM = childNode;
                    }

                    if (!lastChildSF) {   //If last child was not subform then increase template index
                        childTemplateIndex = childTemplateIndex + 1;
                    } else if (!this.xfaUtil().isRepeatabeEl(childNode._class)) { //Else increase template index only for non-subform
                        childTemplateIndex = childTemplateIndex + 1;
                    }

                    var childRepeat = canRepeat;
                    if (this.xfaUtil().isRepeatabeEl(childNode._class)) {
                        childRepeat = childRepeat || parseInt(this.getOrElse(lastIM, "max", xfalib.script.Occur.prototype._defaults.max)) < 0 ||
                            (parseInt(this.getOrElse(lastIM, "min", xfalib.script.Occur.prototype._defaults.min)) < parseInt(this.getOrElse(lastIM, "max", xfalib.script.Occur.prototype._defaults.max)));
                        lastChildSF = true;
                    }
                    else
                        lastChildSF = false;

                    jsonTemplate.children = jsonTemplate.children || [];
                    var childTemplate = jsonTemplate.children[childTemplateIndex];
                    if (!childTemplate) {
                        childTemplate = {
                            _class: childNode._class,
                            name: childNode.name,
                            extras: childNode.extras || {}
                        };
                        if (childRepeat) { //For repeatable child copy all properties
                            this.copyObject(childNode, childTemplate, {exceptions: ["children"], keepReference: false});
                        }
                        jsonTemplate.children.push(childTemplate);
                    }
                    this._processTemplate(childTemplate, childNode, childRepeat);
                }, this);
        },

        _processModel: function (jsonTemplate, model) {
            if (model.htmlId == null) {
                model.htmlId = "CL_" + (++this._lastID);
            }
            this._nodeCache[model.htmlId] = {templateRef: jsonTemplate, model: model};
            var childTemplateIndex = -1;
            var lastChildSF = false;
            _.each(model.children,
                function (childNode, i) {
                    if (!lastChildSF) {   //If last child was not subform then increase template index
                        childTemplateIndex = childTemplateIndex + 1;
                    } else if (!(childNode instanceof xfalib.script.Subform)) { //Else increase template index only for non-subform
                        childTemplateIndex = childTemplateIndex + 1;
                    }

                    lastChildSF = childNode instanceof xfalib.script.Subform;

                    var childTemplate = jsonTemplate.children ? jsonTemplate.children[childTemplateIndex] : undefined
                    if (childTemplate)
                        this._processModel(childTemplate, childNode);
                }, this);
        },

        matchJsonType: xfalib.ut.XfaUtil.prototype.matchJsonType

    });

})(_, $, xfalib);
/**
 * @package xfalib.script.Xfa
 * @import xfalib.script.Model
 * @import xfalib.ut.Logger
 * @import xfalib.script.Host
 * @import xfalib.script.XfaModelEvent
 * @fileOverview The file creates the XFA Class required for XFA library
 * @version 0.0.1
 */

(function (_, xfalib) {
    /**
     * @class The class represents the XFA Object
     * @extends com.adobe.xfa.scripting.Model
     * @property {com.adobe.xfa.scripting.Host} host Object of the host class
     */
    var Xfa = xfalib.script.Xfa = xfalib.script.Model.extend({
        msClassName: "xfa",
        initialize: function () {
            xfalib.runtime.xfa = this;                           //TODO: Handle anithing being used before super
            xfalib.runtime["$xfa"] = this;
            this.$layout = this.layout = new xfalib.script.Layout({"jsonModel": {}});
            var logConf = window.formBridge.registerConfig("LoggerConfig").data || {};
            var renderContextCopy = {};
            this.copyObject(xfalib.runtime.renderContext, renderContextCopy, {"exceptions": ["data"]})
            xfalib.runtime.xfa.Logger = new xfalib.ut.Logger({
                "jsonModel": logConf,
                logServiceProxy: this.getOrElse(window.formBridge.userConfig["submitServiceProxyConfig"], "logServiceProxy", ""),
                renderContext: renderContextCopy,
                contextPath: window.formBridge.userConfig["contextPath"]
            });
            xfalib.runtime.xfa.ErrorManager = this.getOrElse(window.formBridge.userConfig["errorConfig"],new xfalib.view.util.ErrorManager)
            xfalib.script.Xfa.Instance = this;          //TODO: Singleton reqd?
            this._submitButtons = [];
            this._modelInitialize = 'UNINITIALIZED'; // can be set to 'INITIALIZED' or ''INITIALIZING'
            this.moContextNodes = [];
            this.moCalculateEventStack = [];
            this.moCalculateEventNode = null;
            this.host = new xfalib.script.Host();
            xfalib.runtime["$host"] = this.host;
            this.countError = 0;
            this.dataNodes = {};
            this._templateSchema = new xfalib.template.TemplateSchema();
            this.moContextScriptEvent = null; // will hold current event for which script is executing
            this.Queue = {"calc": [], "calcindex": 0, "validate": [], "validateindex": 0, calcCount: {},
                "setfocus": [], "setfocusindex": 0};

            // to clear all _moContext-s cached in eventContainerNode-s, after subform.addInstance or subform.removeInstance
            xfalib.runtime.xfa._clearAllMoContexts = function () {
                function clearMoContextVisitor(target) {
                    if (target instanceof xfalib.script.EventContainerNode) {
                        target._moContext = null;
                    }
                }
                xfalib.runtime.xfa.form._getRootSubform()._visitAllmoChildren(clearMoContextVisitor);
            };

            //Create Form Child
            var formJson = _.find(this.jsonModel.children, function (child) {
                return child._class == "form";
            });
            this._xfaTemplateCache = new xfalib.script.XfaTemplateCache({initialFormDom: formJson});

            //We call Super later at this stage since we need to initialize few variables which are required while initializing children
            Xfa._super.initialize.call(this);

            //get the child from children models that are already created.
            this.form = _.find(this.children, function (child) {
                return child._isForm();
            });
            this._xfaTemplateCache.putModel(this.form,
                this._xfaTemplateCache.getTemplateRef(this.getOrElse(formJson, "extras.htmlId", {}))
            );

            //Note: since we do not support template currently, we workarond by pointing template node to form node which would have similar structure in most cases.
            xfalib.runtime['$template'] = this.template = xfalib.runtime['$form'] = this.form;
            xfalib.runtime['template'] = xfalib.runtime['form'] = this.form;

            //Create Config Child. Notice that it is not XFA Node model, just a json child for now.
            this.config = _.find(this.jsonModel.children, function (child) {
                return child._class == "config";
            });
            xfalib.runtime['$config'] = this.config;

            //Create localeSet Child. Notice that it is not XFA Node model, just a json child for now.
            this.localeSet = this.jsonModel.localeSet;
            this.defaultLocale = "en_US"; //TODO: read from jsp

            //Once everything is set up, now is the time to set parent access
            this.form._calculateEffectiveAccess();
            this.calculateRunning = false;
            this.validateRunning = false;
            this.versionConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);
        },

        /**
         * Evaluates the specified SOM expression, beginning with the current XML form
         * object model object, and returns the value of the object specified in the SOM
         * expression
         * @Overrides
         * @function
         */
        resolveNode: function () {
            if (arguments.length == 1)
                return Xfa._super.resolveNode.call(this, this._contextNode() || this, arguments[0]);
            else
                return Xfa._super.resolveNode.call(this, arguments[0], arguments[1]);
        },

        /**
         * Evaluates the specified SOM expression, beginning with the current XML form
         * object model object, and returns the value of the object specified in the SOM
         * expression
         * @Overrides
         * @function
         */
        resolveNodes: function () {
            if (arguments.length == 1)
                return Xfa._super.resolveNodes.call(this, this._contextNode(), arguments[0]);
            else
                return Xfa._super.resolveNodes.call(this, arguments[0], arguments[1]);
        },

        _newSubmitButton: function (elem) {
            if (!~this._submitButtons.indexOf(elem))     //TODO: What is this. Add a comment
                this._submitButtons.push(elem);
        },

        _hideSubmitButtons: function (elem) {
            for (var i = 0; i < this._submitButtons.length; i++) {
                this._submitButtons[i].presence = "hidden";
            }
        },

        /**
         * The function pushes a new Calculate Event Node into the Calculate Stack
         * @function
         * @param {com.adobe.xfa.scripting.Node} node current context node
         * @private
         */
        _pushCalculateEventNode: function (node) {
            this.moCalculateEventStack.push(node);
            this.moCalculateEventNode = node;
        },

        /**
         * The function pushes a new XFA Node in the current context
         * @function
         * @param {com.adobe.xfa.scripting.Node} node current context node
         * @private
         */
        _pushContextNode: function (node) {
            this.moContextNodes.push(node);
        },

        /**
         * The function pops Calculate Event Node from the stack of context nodes
         * @function
         * @private
         */
        _popCalculateEventNode: function () {
            this.moCalculateEventStack.pop();
            this.moCalculateEventNode = null;
        },

        /**
         * The function pops a XFA Node from the stack of context nodes
         * @function
         * @private
         */
        _popContextNode: function () {
            this.moContextNodes.pop();
        },

        _contextNode: function () {
            var len = this.moContextNodes.length;
            if (len > 0)
                return this.moContextNodes[len - 1]
            return null;
        },

        _isXFAContainerNode: function () {
            return true;
        },

        _getSomExpression: function () {
            return this.getAttribute("name") + "[" + this.index + "]";
        },

        _getLocaleSymbols: function (locale, symbol) {
            var ret = null;
            var newSymbol = "locales." + locale + "." + symbol;
            ret = this.getOrElse(this.localeSet, newSymbol, xfalib.ut.XfaUtil.prototype.getDefaultLocaleProperty(symbol));
            if (!ret) {
                xfalib.runtime.xfa.Logger.error("xfa", "unable to find " + symbol + " for locale " + locale + "in localeSet");
            }
            return ret;
        },

        setSubformFocus: function (subform) {
            var oldSubform = this.currentSubform;
            this.currentSubform = subform;
            var views = [];
            if (oldSubform) {
                var pSubform = subform;
                while (pSubform) {
                    views.push(pSubform);
                    pSubform = pSubform.parent;
                }
                while (oldSubform && views.indexOf(oldSubform) == -1) {
                    oldSubform.execEvent("exit");
                    oldSubform = oldSubform.parent;
                }
            }
        },

        createDataNode: function (id, model) {
            if (id) {
                var dn = this.dataNodes[id] || xfalib.script.XfaModelRegistry.prototype.createDataNode(id);
                dn.addField(model);
                this.dataNodes[id] = dn;
            }
        },

        queueCalcEvent: function (oListener) {
            if (!this.host.calculationsEnabled)
                return;
            var q = this.Queue["calc"];
            var som = oListener.somExpression;
            for (var i = 0; i < q.length; i++) {
                var item = q[i];
                if (oListener == item) {
                    if (i < this.Queue.calcindex) {
                        if (this.Queue.calcCount[som] === 10)
                            return;
                    }
                    else
                        return;
                }
            }
            this.Queue.calcCount[som] = this.Queue.calcCount[som] || 0;
            this.Queue.calcCount[som]++;
            q.push(oListener);
        },

        queueValidateEvent: function (oNode) {
            if (!this.host.validationsEnabled)
                return;
            if (!~this.Queue["validate"].indexOf(oNode))
                this.Queue["validate"].push(oNode);
        },

        queueFocusEvent: function (context, som) {
            this.Queue["setfocus"].push({'context': context, 'som': som});
        },

        runQueue: function (queue, evnt) {
            if (queue !== "calc" && queue !== "validate")
                return;
            if (queue == "calc" && !this.host.calculationsEnabled)
                return;
            if (queue == "validate" && !this.host.validationsEnabled)
                return;
            var Q = this.Queue[queue];
            var ind = this.Queue[queue + "index"];
            for (var i = ind; i < Q.length; i++) {
                this.Queue[queue + "index"]++;
                if (evnt === "validate") {
                    Q[i]._validate([]);
                }
                else {
                    Q[i].execEvent(evnt);
                }
            }
        },

        runCalcAndValidate: function () {
            this._pushContextNode(this.form);
            this.runCalcs();
            this.runValidates();
            this.runSetFocuses();
            this.Queue["calc"] = [];
            this.Queue.calcindex = 0;
            this.Queue.calcCount = {};
            this.Queue["validate"] = [];
            this.Queue.validateindex = 0;
            this.Queue["setfocus"] = [];
            this.Queue.setfocusindex = 0;
            this._popContextNode();
        },

        runCalcs: function (start) {
            if (typeof start != "undefined" && start === "true")
                this.Queue.calcindex = 0;
            this.calculateRunning = true;
            this.runQueue("calc", "calculate");
            this.calculateRunning = false;
        },

        runValidates: function () {
            this.validateRunning = true;
            this.runQueue("validate", "validate")
            this.validateRunning = false;
        },

        runSetFocuses: function () {
            var Q = this.Queue["setfocus"];
            index = this.Queue["setfocusindex"];
            for (var i = index; i < Q.length; i++) {
                this.Queue["setfocusindex"]++;
                var som = Q[i]['som'],
                    node = som,
                    context = Q[i]['context'];
                if (typeof som == "string")
                    node = context._xfa().resolveNode(som);
                if (node != null) {
                    if (context.pagingManager) {
                        if (navigator.userAgent.match(/iPad/i) == null) {
                            xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(
                                setTimeout(function () {
                                    context.pagingManager._makePageForHtmlId(node.htmlId, node._setFocus, node);
                                })
                            );  // just give browser enough time to register the keypress
                        } else {
                            context.pagingManager._makePageForHtmlId(node.htmlId, node._setFocus, node); // $.focus() doesn't work inside setTimeout in iPad
                        }
                    }
                }
            }
        },

        _computeJsonDiff: function (diff_level) {
            var formDiff = this.form._computeJsonDiff(diff_level);
            var dest = {
                _class: this.className,
                name: "xfa",
                versionNS: this.jsonModel.versionNS,
                children: [formDiff.jsonDifference]
            };

            return { "changed": true,
                "jsonDifference": dest
            };
        }
    });

    Xfa._defaultLocale = {
        "calendarSymbols": {
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "abbrmonthNames": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "abbrdayNames": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "meridiemNames": ["AM", "PM"],
            "eraNames": ["BC", "AD"]
        },
        "datePatterns": {
            "full": "EEEE D MMMM YYYY",
            "long": "D MMMM YYYY",
            "med": "DD-MMM-YY",
            "short": "DD/MM/YY"
        },
        "timePatterns": {
            "full": "h:MM:SS A Z",
            "long": "h:MM:SS A Z",
            "med": "h:MM:SS A",
            "short": "h:MM A"
        },
        "dateTimeSymbols": "GyMdkHmsSEDFwWahKzZ",
        "numberPatterns": {
            "numeric": "z,zz,zz9.zzz",
            "currency": "$ z,zz,zz9.99",
            "percent": "z,zz,zz9%"
        },
        "numberSymbols": {
            "decimal": ".",
            "grouping": ",",
            "percent": "%",
            "minus": "-",
            "zero": "0"
        },
        "currencySymbols": {
            "symbol": "$",
            "isoname": "USD",
            "decimal": "."
        },
        "typefaces": {}
    }
})(_, xfalib);
/**
 * @package xfalib.script.XfaModelRegistry
 * @import xfalib.ut.Class
 */
(function(_, xfalib){
    var XfaModelRegistry = xfalib.script.XfaModelRegistry = xfalib.ut.Class.extend({

        _classToFactoryMap : {
            "script" : "createScript",
            "exclGroup" : "createExclusionGroup",

            "arc" : "createNodeValue",
            "boolean": "createNodeValue",
            "date": "createNodeValue",
            "dateTime": "createNodeValue",
            "decimal": "createNodeValue",
            "exData": "createNodeValue",
            "float": "createNodeValue",
            "image": "createNodeValue",
            "integer": "createNodeValue",
            "line": "createNodeValue",
            "rectangle": "createNodeValue",
            "text": "createNodeValue",
            "time": "createNodeValue"

        },

        createModel : function(jsonModel){
            var model = null;
            var elClass = jsonModel._class.charAt(0).toUpperCase() + jsonModel._class.substr(1);
            var factoryFnName = "create" + elClass ;
            if(this._classToFactoryMap[jsonModel._class]){
                factoryFnName = this._classToFactoryMap[jsonModel._class];
            }
            if(this[factoryFnName])
                model = this[factoryFnName].call(this, jsonModel);


            if(!model && xfalib.script.dom[elClass]){
                model = new xfalib.script.dom[elClass]({"jsonModel" : jsonModel});
            }

            if(!model) {
                model = new xfalib.script.Node({"jsonModel" : jsonModel});
            }
            return model;
        },

        createXfa : function(json){
            return new xfalib.script.Xfa({"jsonModel" : json});
        },

        createForm : function(json){
            return new xfalib.script.Form({"jsonModel" : json});
        },

        createConfig : function(json){
            return json;      //No seperate model API for config for now
        },

        createTextField : function(field) {
            return new xfalib.script.Field({"jsonModel" : field});
        },

        createImageField : function(field) {
            return new xfalib.script.Field({"jsonModel" : field});
        },

        createDateTimeField : function(field) {
            return new xfalib.script.DateTimeField({"jsonModel" : field});
        },

        createNumericField : function(field) {
            return new xfalib.script.NumericField({"jsonModel" : field});
        },

        createChoiceListField : function(field) {
            return new xfalib.script.ChoiceListField({"jsonModel" : field});
        },

        createButtonField : function(field) {
            return new xfalib.script.ButtonField({"jsonModel" : field});
        },

        createCheckButtonField : function(field) {
            return new xfalib.script.CheckButtonField({"jsonModel" : field});
        },

        createTextDraw : function(draw) {
            return new xfalib.script.Draw({"jsonModel" : draw});
        },

        createInstanceManager : function(oInstanceManager) {
            return new xfalib.script.InstanceManager({"jsonModel" : oInstanceManager});
        },

        createPageSet: function(vPageSet) {
            return new xfalib.script.PageSet({"jsonModel" : vPageSet});
        },

        createPageArea: function(vPageArea) {
            return new xfalib.script.PageArea({"jsonModel" : vPageArea});
        },

        createContentArea: function(vContentArea) {
            return new xfalib.script.ContentArea({"jsonModel" : vContentArea});
        },

        createExclusionGroup : function(exclGroup) {
            return new xfalib.script.ExclusionGroup({"jsonModel" : exclGroup});
        },

        createSubform: function(vSubform) {
            return new xfalib.script.Subform({"jsonModel" : vSubform});
        },

        createArea: function(vArea) {
            return new xfalib.script.Area({"jsonModel" : vArea});
        },

        createSubformSet: function(vSubformSet) {
            return new xfalib.script.SubformSet({"jsonModel" : vSubformSet});
        },

        createVariables: function(vVariables) {
            return new xfalib.script.Variables({"jsonModel" : vVariables});
        },

        createScript: function(vScript) {
            if(vScript._parentClass && vScript._parentClass == "variables"){
                return new xfalib.script.dom.ScriptObject({"jsonModel" : vScript});
            }
            else {
                return new xfalib.script.dom.Script({"jsonModel" : vScript});
            }
        },

        createField : function(field) {
            var t = null;
            var childType = this.getOrElse(this.xfaUtil().getUiOneOfChildTag(field), "").toLowerCase();
            switch (childType) {
                case "datetimeedit":
                    t =this.createDateTimeField(field)
                    break;
                case "textedit":
                    t = this.createTextField(field);
                    break;
                case "imageedit":
                    t = this.createImageField(field);
                    break;
                case "numericedit":
                    t = this.createNumericField(field);
                    break;
                case "choicelist":
                    t = this.createChoiceListField(field);
                    break;
                case "button":
                    t = this.createButtonField(field);
                    break;
                case "checkbutton":
                    t = this.createCheckButtonField(field);
                    break;
                default:
                    //xfa.Logger.warn("unknown uiType for the field " + field.ui.type + " <"
                    //    + field.name + "> Creating a TextField instead");
                    t = this.createTextField(field);
                    break;
            }
            return t;
        },

        createDraw : function(draw) {
            var t = null;
            var childType = this.getOrElse(this.xfaUtil().getUiOneOfChildTag(draw), "").toLowerCase();
            switch (childType) {
                case "textedit":
                    t = this.createTextDraw(draw);
                    break;
                default:
                    //xfa.Logger.warn("unknown uiType for the draw " + draw.ui.type + " <"
                    //    + draw.name + "> Creating a Static Text instead");
                    t = this.createTextDraw(draw);
                    break;
            }
            return t;
        },

        createSomExpression : function(sExpression, nDefaultOccurrence, bIgnorePredicate) {
            var options = {
                expression : sExpression,
                defaultOccurrence : nDefaultOccurrence,
                ignorePredicate : bIgnorePredicate
            }
            return new xfalib.script.SOMExpression(options);
        },

        createValue: function(valueJson) {
            return new xfalib.script.dom.Value({"jsonModel" : valueJson});
        },

        createNodeValue : function(valueJson) {
            //ToDo : this is a stop grap measure till we find a way to handle default valueJson
            valueJson = valueJson || {_class: "", rawValue: ""};
            var valType = valueJson._class.toLowerCase();
            switch (valType) {
                case "text":
                    return new xfalib.script.TextValue({"jsonModel" : valueJson});
                case "integer":
                    return new xfalib.script.IntegerValue({"jsonModel" : valueJson});
                case "decimal":
                	return new xfalib.script.DecimalValue({"jsonModel" : valueJson});
                case "float":
                    return new xfalib.script.FloatValue({"jsonModel" : valueJson}); 
                case "exdata":
                    return new xfalib.script.ExDataValue({"jsonModel" : valueJson});
                case "date":
                    return new xfalib.script.DateValue({"jsonModel" : valueJson});
                case "image":
                    return new xfalib.script.ImageValue({"jsonModel" : valueJson});
                case "script":
                    return this.createScript(valueJson);
                default:
                    //xfa.Logger.warn("unknown value type " + valueJson.type + " for element <"
                    //    + this.name + ">");
                    return new xfalib.script.NodeValue({"jsonModel" : valueJson});
            }
        },

        createDataNode: function(id) {
            return new xfalib.script.DataNode({"jsonModel" : {"id":id}});
        }

    });

})(_, xfalib);
(function(_, xfalib){
    var App = xfalib.acrobat.App =  xfalib.ut.Class.extend({
        initialize : function() {
            App._super.initialize.call(this);
            xfalib.runtime.app = this;
            this._version = window.formBridge.getBridgeVersion();

        },

        alert: function(cMsg) {
            return window.alert(cMsg);
        },

        beep: function(nType) {

        },


        execDialog: function(dialog) {

        },

        launchURL: function(url, bNewFrame) {
            if(url.search("http") == -1)
                url = "http://" + url ;
            if(bNewFrame != true) {
                window.open(url) ;
            }
            else
                window.location = url;
        },

        setTimeOut: function(cExpr, nMilliseconds) {
            try {
                var fn = new Function(this._within(cExpr));
                return window.setTimeout(function() {
                     fn.call(xfalib.runtime.Document);
                }, nMilliseconds);
            } catch(ex) {
                console.log(ex);
            }
        },

        setInterval: function(cExpr, nMilliseconds) {
            try {
                var fn = new Function(this._within(cExpr));
                return window.setInterval(function() {
                    fn.call(xfalib.runtime.Document);
                }, nMilliseconds);
            } catch(ex) {
                console.log(ex);
            }
        },

        clearTimeOut: function(oTime) {
            window.clearTimeout(oTime);
        },

        clearInterval: function(oInterval) {
            window.clearInterval(oInterval);
        },

        eval: function(script) {
            window.eval(this._within(script));
        },

        _within: function(script){
            var string  =   "try {\n" +
                                "with(xfalib.runtime.Document) {\n" +
                                    "with(xfalib.runtime) {\n" +
                                        script +"\n" +
                                    "}\n" +
                                "}\n" +
                            "} catch(ex) {\n" +
                                "console.log(ex)\n" +
                            "}";
            return string;
        }

    });

    App.defineProps({
        "activeDocs" : {
            get : function() {
                return ([]);
            }
        },

        "calculate" : {
            get : function() {
                return (true);
            }
        },

        "constants" : {
            get : function() {
                return ({align:{}});
            }
        },

        "focusRect" : {
            get : function() {
                return (true);
            }
        },

        "formsVersion" : {
            get : function() {
                return (this._version);
            }
        },

        "fromPDFConverters" : {
            get : function() {
                return ([]);
            }
        },

        "fs" : {
            get : function() {
                return ({isFullScreen: false});
            }
        },

        "fullscreen" : {
            get : function() {
                return (false);
            }
        },

        "language" : {
            get : function() {
                if(navigator.language.substr(0,2) === "en")
                    return ("ENU");
                return ("ENU");
            }
        },

        "platform" : {
            get : function() {
                if(navigator.appVersion.indexOf("Win") != -1)
                    return ("WIN");
                if(navigator.appVersion.indexOf("Mac") != -1)
                    return ("MAC");
                return ("UNIX");
            }
        },

        "viewerType" : {
            get : function() {
                return ("Exchange-Pro");
            }
        },

        "viewerVariation" : {
            get : function() {
                return ("Full");
            }
        },

        "viewerVersion" : {
            get : function() {
                return (this._version);
            }
        }
    })

})(_, xfalib);

(function(_, xfalib){
    var Console = xfalib.acrobat.Console =  xfalib.ut.Class.extend({
        initialize : function(bRegister) {
            Console._super.initialize.call(this);
            if(bRegister)
                xfalib.runtime.console = this;
        },

        println: function() {
            //add this method to insert console where 'console' is not supported
        }
    });

})(_, xfalib);

(function(_, xfalib){
    var Acrobat = xfalib.acrobat.Acrobat =  xfalib.ut.Class.extend({
        initialize : function() {
            Acrobat._super.initialize.call(this);
            //initialize App object
            new xfalib.acrobat.App();
            //insert println inside console object
            if(typeof(console) != "undefined") {
                if(console.log)
                    console.println = console.log;
                else {
                    //register empty method
                    var con = new xfalib.acrobat.Console();
                    console.println = con.println;
                }
            }
            else {
                new xfalib.acrobat.Console(true);
            }
        }
    });

})(_, xfalib);

/**
 * Created with IntelliJ IDEA.
 * User: vdua
 * Date: 21/5/13
 * Time: 5:56 PM
 * To change this template use File | Settings | File Templates.

 /**
 * @package xfalib.script.XfaModelEvent
 * @import xfalib.script.Object
 * @fileOverview The file creates the XfaModelEvent Class required for XFA library
 * @version 0.0.1
 */
(function(_,xfalib) {

    var Field = xfalib.acrobat.Field = xfalib.ut.Class.extend({
        initialize : function() {
            Field._super.initialize.call(this);
            this._xfaField = xfalib.script.Xfa.Instance.resolveNode("xfa.form."+this.jsonModel.somExpression);
        },

        signatureInfo : function() {
            throw {message:"signatureInfo is not supported"}
        },

        setFocus: function() {
            xfalib.script.Xfa.Instance.host.setFocus(this.jsonModel.somExpression);
        }
    });

    Field.defineProps({

    })
})(_,xfalib);
/**
 * @package xfalib.script.XfaModelEvent
 * @import xfalib.script.Object
 * @fileOverview The file creates the XfaModelEvent Class required for XFA library
 * @version 0.0.1
 */
(function(_,xfalib) {

    var Doc = xfalib.acrobat.Doc = xfalib.ut.Class.extend({

        getURL: function() {
            return window.location.href;
        },

        resetForm: function(fieldArray) {
            if(!(fieldArray instanceof Array)) {
                fieldArray = [fieldArray];
            }
            this.xfa.host.resetData.apply(this.xfa.host,fieldArray);
        },

        submitForm: function() {
            this.xfa.Logger.error("xfa",xfalib.locale.LogMessages["ALC-FRM-901-006"],["submitForm"]);
        },

        getField: function(som) {
            return new xfalib.acrobat.Field({"jsonModel" : {"somExpression": som}});
        },

        importDataObject: function() {
            throw {message:"importDataObject is not supported"}
        }

    });

    Doc.defineProps({
        "xfa" : {
            get: function() {
                return xfalib.script.Xfa.Instance;
            }
        }

    })

    xfalib.runtime.Document = new xfalib.acrobat.Doc({jsonModel:{}});

})(_,xfalib);
/**
 * @package xfalib.script.XfaModelEvent
 * @import xfalib.script.Object
 * @fileOverview The file creates the XfaModelEvent Class required for XFA library
 * @version 0.0.1
 */
(function(_,xfalib) {

    var AcroEvent = xfalib.acrobat.AcroEvent = xfalib.script.XfaModelEvent.extend({
        msClassName: "acroEvent",
        initialize : function() {
            xfalib.script.XfaModelEvent._super.initialize.call(this);
            this.jsonModel.target = xfalib.runtime.Document;
        }
    });

    AcroEvent.cloneEvent = function(xfaModelEvent) {
        var copy = xfaModelEvent.copyObject(xfaModelEvent.jsonModel, {},{"exceptions":["target"]});
        return new AcroEvent({"jsonModel" : copy});
    };

})(_,xfalib);