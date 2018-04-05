/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
//------------------------------------------------------------------------------
// Initialize the CQ shared library

CQ.shared.User.lazyInit();

CQ.shared.I18n.init({
    locale: function() { return document.documentElement.lang || CQ.shared.User.getLanguage();},
    urlPrefix: "/libs/cq/i18n/dict."
});
