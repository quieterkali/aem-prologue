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
        "LostInternetConnection" : "目前的功能需要 Internet 連線才能使用。請將您的裝置連線至 Internet。",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "簽署已填寫表單的權限不適用。請繼續下一個動作或提交表單。",
        "VerifyDisabled" : "驗證已填寫資料的權限不適用。請繼續下一個動作或提交表單。",
        "validatingForm" : "正在驗證...",
        "submittingForm" : "正在提交...",
        "generatingSignAgreement" : "準備要簽署的文件",
        "maxValErrorMessage" : "值必須小於或等於 {0}",
        "exclusiveMaxValErrorMessage" : "值必須小於 {0}",
        "minValErrorMessage" : "值必須大於或等於 {0}",
        "exclusiveMinValErrorMessage" : "值必須大於 {0}",
        "minimumLengthMessage" : "字元的數量必須多過或等於 {0}",
        "totalLengthMessage" : "字元的數量必須等於 {0}",
        "totalDigitMessage" : "數字的數量必須少過或等於 {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: 從狀態擷取時發生錯誤。",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: 無法連線至伺服器。",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: 提交表單時發生內部錯誤。",
        "AEM-AF-901-005"   :   " 此欄位為必要欄位。",
        "AEM-AF-901-006"   :   " 欄位驗證錯誤。",
        "AEM-AF-901-007"   :   " 欄位無法以預期格式填入。",
        "AEM-AF-901-008"   :   " 無法連接到伺服器",
        "AEM-AF-901-009"   :   " 儲存草稿時發生錯誤",
        "AEM-AF-901-010"   :   "僅有 XFA 式的自適應表單才能進行驗證。",
        "AEM-AF-901-011"   :   "無法復原表單狀態。",
        "AEM-AF-901-012"   :   "無法擷取表單狀態。",
        "AEM-AF-901-013"   :   "未定義的使用者電子郵件。無法產生可簽署的 PDF。",
        "AEM-AF-901-014"   :   "未定義的 XDP 標題或指南標題。無法產生可簽署的 PDF。",
        "AEM-AF-901-015"   :   "提交指南時發生錯誤:",
        "AEM-AF-901-016"   :   "表單中沒有簽署欄位。請繼續！",
        "AEM-AF-901-017"   :   "無法從 HTML 表單中取得 XML 資料:",
        "AEM-AF-901-018"   :   "請簽署所有必要欄位",
        "AEM-AF-901-019"   :   "請以電子方式簽署此表單。",
        "AEM-AF-901-020"   :   "提交表單…"
    };
})(guidelib);
