/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
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
 */
;(function ($, ns, channel, window, undefined) {
    "use strict";

    ns.history.actions.fd.DeleteToolbar = function (path, componentType, insertPath, createParams) {

        // do nothing when created by Granite.author.history.actions.Registry
        if (arguments.length == 0) {
            return;
        }

        // Call super constructor
        ns.history.actions.fd.DefaultAction.call(this, path, insertPath, componentType, createParams);
    };
    ns.util.inherits(ns.history.actions.fd.DeleteToolbar, ns.history.actions.fd.DefaultAction);

    // implements Granite.author.history.Action#undo
    ns.history.actions.fd.DeleteToolbar.prototype.undo = function (cfg) {
      var self = this,
          params = _.extend({}, {
          ":operation" : "import",
          ":contentType" : "json",
          ":replace" : true,
          ":content" : JSON.stringify(self.createParams.state),
          ":replaceProperties" : true
      });
      var response = CQ.shared.HTTP.post(self.path, null, params);
      if (CQ.shared.HTTP.isOk(response)) {
          window.guidelib.author.editConfigListeners.REFRESH_FORM();
          if (window.guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
              window.guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree();
          }
          self.onEditableReady(cfg);
      }
  };

    // implements Granite.author.history.Action#redo
    ns.history.actions.fd.DeleteToolbar.prototype.redo = function (cfg) {
        var self = this,
            params = {};
        params[Granite.Sling.STATUS] = Granite.Sling.STATUS_BROWSER;
        params[Granite.Sling.OPERATION] = Granite.Sling.OPERATION_DELETE;

        var response = CQ.shared.HTTP.post(self.path, null, params);
        if (CQ.shared.HTTP.isOk(response)) {
            window.guidelib.author.editConfigListeners.REFRESH_FORM();
            if (window.guidelib.touchlib.editLayer.editLayerFormObjects.isInitialized()) {
                window.guidelib.touchlib.editLayer.editLayerFormObjects.refreshFormObjectsTree();
            }
            self.onEditableReady(cfg);
        }
    };

    // register action
    ns.history.actions.Registry.register("DeleteToolbar", ns.history.actions.fd.DeleteToolbar);

}(jQuery, Granite.author, jQuery(document), this));
