/*!************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2011 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
(function(a){window[a.namespacePrefix+"s7sdkJSONResponse"]=function(b,d){var c=a.Callback.pending[d].shift();if(c.status==a.IS.STATUS_CANCELLED){return}c.status=a.IS.STATUS_SUCCESS;c.onSuccess(b,c.context);c.cleanUp()};window.s7jsonError=function(b,d){var c=a.Callback.pending[d].shift();if(c.status==a.IS.STATUS_CANCELLED){return}c.status=a.IS.STATUS_ERROR;c.onError(b);c.cleanUp()}})(s7getCurrentNameSpace());