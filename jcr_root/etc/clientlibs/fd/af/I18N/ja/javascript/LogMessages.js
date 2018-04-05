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
        "LostInternetConnection" : "現在の機能を使用するには、インターネット接続が必要です。デバイスをインターネットに接続してください。",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "記入済みフォームに署名する権限がありません。次のアクションを続行するか、フォームを送信してください。",
        "VerifyDisabled" : "記入済みデータを確認する権限がありません。次のアクションを続行するか、フォームを送信してください。",
        "validatingForm" : "検証しています...",
        "submittingForm" : "送信しています...",
        "generatingSignAgreement" : "署名用のドキュメントを準備中",
        "maxValErrorMessage" : "値は {0} 以下である必要があります",
        "exclusiveMaxValErrorMessage" : "値は厳密に {0} 以下である必要があります",
        "minValErrorMessage" : "値は {0} 以上である必要があります",
        "exclusiveMinValErrorMessage" : "値は厳密に {0} 以上である必要があります",
        "minimumLengthMessage" : "文字数は {0} 以上である必要があります",
        "totalLengthMessage" : "文字数は {0} である必要があります",
        "totalDigitMessage" : "桁数は {0} 以下である必要があります",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: フォームの状態を取得中にエラーが発生しました。",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: サーバーに接続できません。",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: フォームを送信中に内部エラーが発生しました。",
        "AEM-AF-901-005"   :   " このフィールドは必須フィールドです.",
        "AEM-AF-901-006"   :   " フィールドで検証エラーが発生しました。",
        "AEM-AF-901-007"   :   " フィールドが予期された形式で入力されていません。",
        "AEM-AF-901-008"   :   " サーバーにアクセスできません",
        "AEM-AF-901-009"   :   " ドラフトの保存中にエラーが発生しました",
        "AEM-AF-901-010"   :   "検証は XFA ベースのアダプティブフォームでのみ使用できます。",
        "AEM-AF-901-011"   :   "フォームの状態を復元できませんでした。",
        "AEM-AF-901-012"   :   "フォームの状態を取得できませんでした。",
        "AEM-AF-901-013"   :   "ユーザーの電子メールが定義されていません。署名可能な PDF を作成できません。",
        "AEM-AF-901-014"   :   "XDP タイトルまたはガイドタイトルが未定義です。署名可能な PDF を作成できません。",
        "AEM-AF-901-015"   :   "ガイドを送信中にエラーが発生しました : ",
        "AEM-AF-901-016"   :   "フォーム内に署名フィールドがありません。続行してください。",
        "AEM-AF-901-017"   :   "HTML フォームから XML データを取得できませんでした : ",
        "AEM-AF-901-018"   :   "すべての必須フィールドに署名してください",
        "AEM-AF-901-019"   :   "フォームに e 署名してください。",
        "AEM-AF-901-020"   :   "フォームを送信中..."
    };
})(guidelib);

