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
(function($){
    window.formBridge.connect(
        function(){
            var titleResult = window.formBridge.getFieldProperties("xfa.form..desc.title","value");
            if(titleResult && !titleResult.errors && titleResult.data && titleResult.data[0]){
                $(document).attr('title', titleResult.data[0]);
            }
        }
    );
})($);

