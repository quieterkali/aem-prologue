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
        "LostInternetConnection" : "La funzione corrente richiede una connessione Internet. Collegate il dispositivo a Internet.",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "L'utente non è autorizzato a firmare il modulo compilato. Procedi all'azione successiva o invia il modulo.",
        "VerifyDisabled" : "L'utente non è autorizzato a verificare i dati forniti. Procedi all'azione successiva o invia il modulo.",
        "validatingForm" : "Convalida in corso...",
        "submittingForm" : "Invio in corso...",
        "generatingSignAgreement" : "Preparazione del documento per la firma",
        "maxValErrorMessage" : "Il valore deve essere inferiore o uguale a {0}",
        "exclusiveMaxValErrorMessage" : "Il valore deve essere rigorosamente inferiore a {0}",
        "minValErrorMessage" : "Il valore deve essere superiore o uguale a {0}",
        "exclusiveMinValErrorMessage" : "Il valore deve essere rigorosamente superiore a {0}",
        "minimumLengthMessage" : "Il numero di caratteri deve essere superiore o uguale a {0}",
        "totalLengthMessage" : "Il numero di caratteri deve essere uguale a {0}",
        "totalDigitMessage" : "Il numero di cifre deve essere inferiore o uguale a {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: Errore nel recupero dello stato del modulo.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: Impossibile collegarsi al server.",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: Errore interno durante l'invio del modulo.",
        "AEM-AF-901-005"   :   " Questo campo è obbligatorio.",
        "AEM-AF-901-006"   :   " Errore di convalida nel campo.",
        "AEM-AF-901-007"   :   " Campo non compilato nel formato previsto.",
        "AEM-AF-901-008"   :   " Server  non disponibile.",
        "AEM-AF-901-009"   :   " Si è verificato un errore durante il salvataggio della bozza",
        "AEM-AF-901-010"   :   "La verifica funziona solo con moduli adattivi basati su XFA.",
        "AEM-AF-901-011"   :   "Impossibile ripristinare lo stato del modulo.",
        "AEM-AF-901-012"   :   "Impossibile recuperare lo stato del modulo.",
        "AEM-AF-901-013"   :   "Indirizzo e-mail utente non definito. Impossibile generare il PDF da firmare.",
        "AEM-AF-901-014"   :   "Titolo XDP o titolo Guida non definito. Impossibile generare il PDF da firmare.",
        "AEM-AF-901-015"   :   "Errore durante l'invio della guida: ",
        "AEM-AF-901-016"   :   "Nessun campo per firma nel modulo. Continuate.",
        "AEM-AF-901-017"   :   "Impossibile ottenere i dati XML dal modulo HTML: ",
        "AEM-AF-901-018"   :   "Firmate tutti i campi obbligatori",
        "AEM-AF-901-019"   :   "Apponete la firma elettronica al modulo.",
        "AEM-AF-901-020"   :   "Invio del modulo..."
    };
})(guidelib);
