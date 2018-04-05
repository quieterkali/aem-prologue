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
        "LostInternetConnection" : "目前的功能需要 Internet 连接才能工作。请将您的设备连接到 Internet。",  //Added in AEM 6.0 SP1
        "ESignDisabled" : "已填写表单的签名权限不适用于您。请继续下一操作或提交表单。",
        "VerifyDisabled" : "已填写数据的验证权限不适用于您。请继续下一操作或提交表单。",
        "validatingForm" : "正在验证...",
        "submittingForm" : "正在提交...",
        "generatingSignAgreement" : "正在准备要签名的文档",
        "maxValErrorMessage" : "值必须小于或等于 {0}",
        "exclusiveMaxValErrorMessage" : "值必须小于 {0}",
        "minValErrorMessage" : "值必须大于或等于 {0}",
        "exclusiveMinValErrorMessage" : "值必须大于 {0}",
        "minimumLengthMessage" : "字符数必须大于或等于 {0}",
        "totalLengthMessage" : "字符数必须等于 {0}",
        "totalDigitMessage" : "数字的位数必须小于或等于 {0}",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: 检索表单状态时出错。",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: 无法连接到服务器。",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: 提交表单时遇到内部错误。",
        "AEM-AF-901-005"   :   " 此字段为必填字段。",
        "AEM-AF-901-006"   :   " 字段中存在验证错误。",
        "AEM-AF-901-007"   :   " 字段的填充格式不是预期格式。",
        "AEM-AF-901-008"   :   " 无法访问服务器",
        "AEM-AF-901-009"   :   " 保存草稿时出错",
        "AEM-AF-901-010"   :   "验证仅处理基于 XFA 的自适应表单。",
        "AEM-AF-901-011"   :   "恢复表单状态失败。",
        "AEM-AF-901-012"   :   "检索表单状态失败。",
        "AEM-AF-901-013"   :   "未定义用户电子邮件。无法生成可签名的 PDF。",
        "AEM-AF-901-014"   :   "未定义 XDP 标题或指南标题。无法生成可签名的 PDF。",
        "AEM-AF-901-015"   :   "提交指南时出错: ",
        "AEM-AF-901-016"   :   "表单中没有签名字段。请继续！",
        "AEM-AF-901-017"   :   "从 HTML 表单中获取数据 XML 失败:",
        "AEM-AF-901-018"   :   "请对所有必填字段进行签名",
        "AEM-AF-901-019"   :   "请对表单进行电子签名。",
        "AEM-AF-901-020"   :   "正在提交表单…"
    };
})(guidelib);
