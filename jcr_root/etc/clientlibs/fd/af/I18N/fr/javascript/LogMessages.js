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
        "LostInternetConnection" : "Connectivité Internet requise pour la fonctionnalité actuelle. Connectez votre périphérique à Internet.",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "Vous ne disposez pas des droits vous permettant de signer le formulaire rempli. Passez à l’action suivante ou envoyez le formulaire.",
        "VerifyDisabled" : "Vous ne disposez pas des droits vous permettant de vérifier les données indiquées. Passez à l’action suivante ou envoyez le formulaire.",
        "validatingForm" : "Validation en cours...",
        "submittingForm" : "Envoi en cours...",
        "generatingSignAgreement" : "Préparation du document pour la signature",
        "maxValErrorMessage" : "La valeur doit être inférieure ou égale à {0}",
        "exclusiveMaxValErrorMessage" : "La valeur doit être strictement inférieure à {0}",
        "minValErrorMessage" : "La valeur doit être supérieure ou égale à {0}",
        "exclusiveMinValErrorMessage" : "La valeur doit être strictement supérieure à {0}",
        "minimumLengthMessage" : "Le nombre de caractères doit être supérieur ou égal à {0}",
        "totalLengthMessage" : "Le nombre de caractères doit être égal à {0}",
        "totalDigitMessage" : "Le nombre de chiffres doit être inférieur ou égal à {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: Erreur de récupération de l'état du formulaire.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: Connexion au serveur impossible.",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: Une erreur interne s'est produite lors de l'envoi du formulaire.",
        "AEM-AF-901-005"   :   " Ce champ est obligatoire..",
        "AEM-AF-901-006"   :   " Erreur de validation dans le champ.",
        "AEM-AF-901-007"   :   " Champ non renseigné dans le format attendu.",
        "AEM-AF-901-008"   :   " Serveur inaccessible",
        "AEM-AF-901-009"   :   " Erreur lors de l’enregistrement des versions préliminaires",
        "AEM-AF-901-010"   :   "La vérification fonctionne uniquement avec les formulaires adaptatifs XFA.",
        "AEM-AF-901-011"   :   "Echec de restauration de l’état du formulaire.",
        "AEM-AF-901-012"   :   "Echec de récupération de l’état du formulaire.",
        "AEM-AF-901-013"   :   "Adresse électronique de l’utilisateur non définie. Impossible de générer le PDF à signer.",
        "AEM-AF-901-014"   :   "XTitre XDP ou titre du guide non défini. Impossible de générer le PDF à signer.",
        "AEM-AF-901-015"   :   "Erreur lors de l’envoi du guide : ",
        "AEM-AF-901-016"   :   "Aucun champ de signature dans le formulaire. Veuillez continuer.",
        "AEM-AF-901-017"   :   "Echec de l’obtention des données XML du formulaire HTML : ",
        "AEM-AF-901-018"   :   "Signez tous les champs obligatoires.",
        "AEM-AF-901-019"   :   "Signez électroniquement le formulaire.",
        "AEM-AF-901-020"   :   "Envoi du formulaire..."
    };
})(guidelib);
