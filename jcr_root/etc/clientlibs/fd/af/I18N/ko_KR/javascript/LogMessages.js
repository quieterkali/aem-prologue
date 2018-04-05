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
        "LostInternetConnection" : "현재 기능이 작동하려면 인터넷 연결이 필요합니다. 장치를 인터넷에 연결하십시오." , //Added in AEM 6.0 SP1
        "ESignDisabled" : "입력된 양식에 로그인할 수 있는 권한이 없습니다. 다음 동작을 계속하거나 양식을 제출하십시오.",
        "VerifyDisabled" : "입력된 데이터를 확인할 수 있는 권한이 없습니다. 다음 동작을 계속하거나 양식을 제출하십시오.",
        "validatingForm" : "확인하는 중...",
        "submittingForm" : "제출하는 중...",
        "generatingSignAgreement" : "서명을 위한 문서 준비",
        "maxValErrorMessage" : "해당 값은 {0}보다 작거나 같아야 합니다",
        "exclusiveMaxValErrorMessage" : "해당 값은 반드시 {0}보다 작아야 합니다",
        "minValErrorMessage" : "해당 값은 {0}보다 크거나 같아야 합니다",
        "exclusiveMinValErrorMessage" : "해당 값은 반드시 {0}보다 커야 합니다",
        "minimumLengthMessage" : "문자 수는 {0}보다 크거나 같아야 합니다",
        "totalLengthMessage" : "문자 수는 {0}와(과) 같아야 합니다",
        "totalDigitMessage" : "숫자의 자릿수는 {0}보다 작거나 같아야 합니다",
        "formAlreadySigned" : "The Form has been signed.",
        "formAlreadySubmitted" : "The Form has been submitted."
    };
    guidelib.i18n.LogMessages = {
        "AEM-AF-901-001"   :   "[AEM-AF-901-001]: 양식 상태를 검색하는 중 오류가 발생했습니다.",
        "AEM-AF-901-003"   :   "[AEM-AF-901-003]: 서버에 연결할 수 없습니다.",
        "AEM-AF-901-004"   :   "[AEM-AF-901-004]: 양식을 제출하는 중 내부 오류가 발생했습니다.",
        "AEM-AF-901-005"   :   " 이 필드는 필수 입력 필드입니다.",
        "AEM-AF-901-006"   :   " 필드에 유효성 확인 오류가 있습니다.",
        "AEM-AF-901-007"   :   " 필드가 적절하지 않은 형식으로 입력되었습니다.",
        "AEM-AF-901-008"   :   " 서버에 연결할 수 없습니다.",
        "AEM-AF-901-009"   :   " 초안을 저장하는 중 오류가 발생했습니다.",
        "AEM-AF-901-010"   :   "XFA 기반 적응형 양식으로만 작업을 확인하십시오.",
        "AEM-AF-901-011"   :   "양식 상태를 복구하지 못했습니다.",
        "AEM-AF-901-012"   :   "양식 상태를 검색하지 못했습니다.",
        "AEM-AF-901-013"   :   "사용자 이메일이 정의되지 않았습니다. 서명 가능한 PDF를 생성할 수 없습니다.",
        "AEM-AF-901-014"   :   "XDP 제목 또는 안내서 제목이 정의되지 않았습니다. 서명 가능한 PDF를 생성할 수 없습니다.",
        "AEM-AF-901-015"   :   "다음 안내서를 제출하는 중 오류 발생:",
        "AEM-AF-901-016"   :   "양식에 서명 필드가 없습니다. 계속 진행하십시오.",
        "AEM-AF-901-017"   :   "다음 HTML 양식으로부터 데이터 XML를 가져오지 못함:",
        "AEM-AF-901-018"   :   "모든 필수 필드에 서명하십시오.",
        "AEM-AF-901-019"   :   "양식에 전자 서명하십시오.",
        "AEM-AF-901-020"   :   "양식을 제출하는 중…"
    };
})(guidelib);
