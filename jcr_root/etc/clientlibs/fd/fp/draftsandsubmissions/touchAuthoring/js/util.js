
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
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

 /*
 *CQ-4197108 : Multiple selection has been introduced and as the last values are not changed but the all and empty has been removed, 
 *this client libs populate the selection dropdown if there was empty or all in the last configuration
 */

(function($, channel){
  channel.on("foundation-contentloaded", function(e) {
    //on init this will initialized the dialog fields accordingly
    var displayOption = $('[name = "./displayOptions"]').get(0);
      Coral.commons.ready(displayOption ,function(e) {
          if(displayOption.selectedItems.length == 0) {
              $('coral-select-item[value = "draftOnly"]').attr('selected','true');
              $('coral-select-item[value = "submittedOnly"]').attr('selected','true')
          }
      });
   });
})(Granite.$, jQuery(document));
