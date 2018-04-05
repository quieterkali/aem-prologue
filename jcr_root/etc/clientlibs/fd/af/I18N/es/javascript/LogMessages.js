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
        "LostInternetConnection" : "La funcionalidad actual requiere una conexión a Internet para funcionar. Conecte el dispositivo a Internet.",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "Los privilegios para firmar el formulario rellenado no están disponibles para usted. Continúe con la siguiente acción o envíe el formulario.",
        "VerifyDisabled" : "Los privilegios para verificar los datos rellenados no están disponibles para usted. Continúe con la siguiente acción o envíe el formulario.",
        "validatingForm" : "Validando...",
        "submittingForm" : "Enviando...",
        "generatingSignAgreement" : "Preparando documento para firma",
        "maxValErrorMessage" : "El valor debe ser menor o igual que {0}",
        "exclusiveMaxValErrorMessage" : "El valor debe ser exactamente menor que {0}",
        "minValErrorMessage" : "El valor debe ser mayor o igual que {0}",
        "exclusiveMinValErrorMessage" : "El valor debe ser exactamente mayor que {0}",
        "minimumLengthMessage" : "El número de caracteres debe ser mayor o igual que {0}",
        "totalLengthMessage" : "El número de caracteres debe ser igual que {0}",
        "totalDigitMessage" : "El número de dígitos debe ser menor o igual que {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: Error al recuperar el estado del formulario.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: No se puede conectar con el servidor.",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: Error interno al enviar el formulario.",
        "AEM-AF-901-005"   :   " Este campo es obligatorio.",
        "AEM-AF-901-006"   :   " Error de validación en el campo.",
        "AEM-AF-901-007"   :   " El campo no se ha rellenado en el formato esperado.",
        "AEM-AF-901-008"   :   " No se puede conectar con el servidor",
        "AEM-AF-901-009"   :   " Error al guardar el borrador",
        "AEM-AF-901-010"   :   "La verificación solo funciona con formularios adaptables basados en XFA.",
        "AEM-AF-901-011"   :   "Error al restaurar el estado del formulario.",
        "AEM-AF-901-012"   :   "Error al recuperar el estado del formulario.",
        "AEM-AF-901-013"   :   "Correo electrónico del usuario no definido. No se puede generar un PDF con función de firma.",
        "AEM-AF-901-014"   :   "Título XDP o título de guía no definido. No se puede generar un PDF con función de firma.",
        "AEM-AF-901-015"   :   "Error al enviar la guía: ",
        "AEM-AF-901-016"   :   "No hay un campo de firma en el formulario. Continúe!",
        "AEM-AF-901-017"   :   "Error al obtener datos XML del formulario HTML: ",
        "AEM-AF-901-018"   :   "Firme todos los campos obligatorios",
        "AEM-AF-901-019"   :   "Firme el formulario electrónicamente.",
        "AEM-AF-901-020"   :   "Enviando el formulario..."
    };
})(guidelib);
