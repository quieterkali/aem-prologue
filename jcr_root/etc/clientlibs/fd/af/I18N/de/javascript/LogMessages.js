/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2014 Adobe Systems Incorporated
 *  All Rights Reserved.
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
 **************************************************************************/

(function (guidelib) {
    guidelib.i18n.strings = {
        "LostInternetConnection" : "Für die aktuelle Funktion ist eine Internet-Verbindung erforderlich. Verbinden Sie Ihr Gerät mit dem Internet.",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "Die Berechtigungen zum Signieren des ausgefüllten Formulars sind für Sie nicht verfügbar. Fahren Sie mit der nächsten Aktion fort oder senden Sie das Formular.",
        "VerifyDisabled" : "Die Berechtigungen zum Verifizieren der ausgefüllten Daten sind für Sie nicht verfügbar. Fahren Sie mit der nächsten Aktion fort oder senden Sie das Formular.",
        "validatingForm" : "Wird überprüft...",
        "submittingForm" : "Wird gesendet...",
        "generatingSignAgreement" : "Dokument wird für die Signatur vorbereitet",
        "maxValErrorMessage" : "Der Wert muss kleiner als oder gleich {0} sein",
        "exclusiveMaxValErrorMessage" : "Der Wert muss kleiner sein als {0}",
        "minValErrorMessage" : "Der Wert muss größer als oder gleich {0} sein",
        "exclusiveMinValErrorMessage" : "Der Wert muss größer sein als {0}",
        "minimumLengthMessage" : "Die Anzahl der Zeichen muss größer als oder gleich {0} sein",
        "totalLengthMessage" : "Die Anzahl der Zeichen muss gleich {0} sein",
        "totalDigitMessage" : "Die Anzahl der Ziffern muss kleiner als oder gleich {0} sein",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: Fehler beim Abrufen des Formularstatus.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: Verbindung zum Server kann nicht hergestellt werden.",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: Beim Übermitteln des Formulars ist ein interner Fehler aufgetreten.",
        "AEM-AF-901-005"   :   " Dieses Feld ist erforderlich.",
        "AEM-AF-901-006"   :   " Überprüfungsfehler im Feld.",
        "AEM-AF-901-007"   :   " Feld wurde nicht im erwarteten Format ausgefüllt.",
        "AEM-AF-901-008"   :   " Verbindung zum Server kann nicht hergestellt werden",
        "AEM-AF-901-009"   :   " Fehler beim Speichern des Entwurfs",
        "AEM-AF-901-010"   :   "Die Überprüfung funktioniert nur bei XFA-basierten adaptiven Formularen.",
        "AEM-AF-901-011"   :   "Formularstatus konnte nicht wiederhergestellt werden.",
        "AEM-AF-901-012"   :   "Formularstatus konnte nicht abgerufen werden.",
        "AEM-AF-901-013"   :   "E-Mail-Adresse des Benutzers nicht definiert. Signierbare PDF kann nicht erstellt werden.",
        "AEM-AF-901-014"   :   "XDP-Titel oder Handbuchtitel nicht definiert. Signierbare PDF kann nicht erstellt werden.",
        "AEM-AF-901-015"   :   "Fehler beim Übermitteln des Handbuchs: ",
        "AEM-AF-901-016"   :   "Kein Signaturfeld im Formular. Fahren Sie fort!",
        "AEM-AF-901-017"   :   "Daten-XML konnte nicht aus HTML-Formular abgerufen werden: ",
        "AEM-AF-901-018"   :   "Signieren Sie sämtliche Pflichtfelder",
        "AEM-AF-901-019"   :   "Signieren Sie das Formular elektronisch.",
        "AEM-AF-901-020"   :   "Formular wird übermittelt..."
    };
})(guidelib);
