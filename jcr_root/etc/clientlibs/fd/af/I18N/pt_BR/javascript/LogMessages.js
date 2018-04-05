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
        "LostInternetConnection" : "O recurso atual precisa de uma conexão com a Internet. Conecte seu dispositivo à Internet.",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "Os privilégios para assinar um formulário preenchido não estão disponíveis para você. Passe para a próxima ação ou envie o formulário.",
        "VerifyDisabled" : "Os privilégios para verificar os dados preenchidos não estão disponíveis para você. Passe para a próxima ação ou envie o formulário.",
        "validatingForm" : "Validando...",
        "submittingForm" : "Enviando...",
        "generatingSignAgreement" : "Preparing document for signature",
        "maxValErrorMessage" : "O valor deve ser menor que ou igual a {0}",
        "exclusiveMaxValErrorMessage" : "O valor deve ser estritamente menor que {0}",
        "minValErrorMessage" : "O valor deve ser maior que ou igual a {0}",
        "exclusiveMinValErrorMessage" : "O valor deve ser estritamente maior que {0}",
        "minimumLengthMessage" : "O número de caracteres deve ser maior que ou igual a {0}",
        "totalLengthMessage" : "O número de caracteres deve ser igual a {0}",
        "totalDigitMessage" : "O número de dígitos deve ser menor que ou igual a {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: Erro ao recuperar o status do formulário.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: Não foi possível se conectar ao servidor",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: Encontrou um erro interno ao enviar o formulário.",
        "AEM-AF-901-005"   :   " Este Campo é obrigatório.",
        "AEM-AF-901-006"   :   " Há um erro de validação no campo.",
        "AEM-AF-901-007"   :   " O campo não foi preenchido dentro do formato esperado.",
        "AEM-AF-901-008"   :   " Servidor incomunicável",
        "AEM-AF-901-009"   :   " Erro ao salvar o rascunho",
        "AEM-AF-901-010"   :   "A verificação funciona apenas com formulários adaptáveis baseados em XFA.",
        "AEM-AF-901-011"   :   "Falha ao restaurar estado do formulário.",
        "AEM-AF-901-012"   :   "Falha ao recuperar estado do formulário.",
        "AEM-AF-901-013"   :   "E-mail do usuário não definido. Não é possível gerar PDF assinável.",
        "AEM-AF-901-014"   :   "Título do XDP ou do Guia não definido. Não é possível gerar PDF assinável.",
        "AEM-AF-901-015"   :   "Erro ao enviar o guia: ",
        "AEM-AF-901-016"   :   "Nenhum campo de assinatura no formulário. Continue!",
        "AEM-AF-901-017"   :   "Falha ao obter XML de dados do formulário HTML: ",
        "AEM-AF-901-018"   :   "Assine todos os campos obrigatórios",
        "AEM-AF-901-019"   :   "Assine o formulário eletronicamente.",
        "AEM-AF-901-020"   :   "Enviando formulário..."
    };
})(guidelib);
