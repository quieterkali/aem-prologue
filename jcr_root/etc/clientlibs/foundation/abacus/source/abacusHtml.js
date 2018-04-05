/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2011 Adobe Systems Incorporated
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
 *
 */

/**
 * @private
 */
$CQ.extend(abacus, function() {

    /**
     * Return the abacus default value for the given field.
     * @private
     * @param field
     */
    var getAbacusDefaultValue = function(field) {
        var defaultValue = field.defaultValue;

        if (field.enumeration) {
            // enumerations can have multiple default values, checkbox group for example
            defaultValue = [];
            for (var i = 0; i < field.enumeration.length; i++) {
                if (field.enumeration[i].defaultValue) {
                    defaultValue.push(field.enumeration[i].defaultValue);
                }
            }
            if (field.type == "select") {
                defaultValue = new Array(defaultValue);
            }
        }

        return defaultValue;
    };

    return {

        /**
         * initializeAbacus is to be called to wire up the show hide expression
         * to the fields located on the page.
         * @param the show hide expression which to apply to the form field.
         */
        initializeAbacus: function(showHideExpressions) {
            var fields = CQ.shared.Form.getFields();

            // a page may contain multiple forms, keep the fields
            // organized to the form they belong to to create a record
            // for each form such that reset will work on the individual form
            // and not cross talk to other forms
            // bug #38738
            var forms = [];

            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];

                // a collection of bindings that are associated with a form
                var abacusBindings = [];

                // a abacus record one per field
                var abacusRecord = {};

                // jQuery 1.6 doesn't like selectors with a : escape them
                var selector = field.name;
                selector.replace(/^:/, "\\:");

                var dotParts = field.name.split(".");

                // associate the model and binding to a form this is done to
                // support multiple forms on a single page
                //
                var formId = field.node.form.id || "unnamed-form";
                var form = CQ.shared.Form.searchArray(forms, "formId", formId);

                // check to see if the form already has a binding and record
                // if we do then we'll add to it later on, otherwise create
                // a new entry for this form
                if (form == null) {
                    form = {"formId": formId, "abacusBindings": abacusBindings,
                        "abacusRecord": abacusRecord, "node": field.node.form};
                    forms.push(form);
                } else {
                    abacusBindings = form.abacusBindings; // get the form's previous bindings
                    abacusRecord = form.abacusRecord;     // get the form's previous record
                }

                // Build out the top-level object in the record.  The top-level objects are the only
                // things that can have show/hide expressions on them:
                //
                var dotName = dotParts[0];
                if (dotName && !abacusRecord.hasOwnProperty(dotName)) {
                    if (showHideExpressions.hasOwnProperty(dotName)) {
                        abacusRecord[dotName] = {
                            "$available": "return " + showHideExpressions[dotName]
                        };
                        abacusBindings.push({
                            "property": dotName,
                            "targetProp": "available",
                            "selector": "div." + field.selector + ":has(" + field.type + "[name='" + selector + "'])"
                        });
                    } else {
                        abacusRecord[dotName] = { };
                    }
                }

                var object = abacusRecord[dotName];

                // Fill out any other levels, down to the leaf objects:
                //
                for (var j = 1; j < dotParts.length; j++) {
                    dotName = dotParts[j];
                    if (!object.hasOwnProperty(dotName)) {
                        object[dotName] = { };
                    }
                    object = object[dotName];
                }

                // The leaf objects are what actually map to our HTML fields, so add any other info
                // we've collected to them:
                //
                if (field.enumeration) {
                    object["$propertyType"] = "string[]";
                }
                var defaultValue = getAbacusDefaultValue(field);
                if (defaultValue) {
                    object["$value"] = defaultValue;
                }

                // Now for the bindings.  The non-leaf objects bind to entities, while the leaf objects
                // bind to properties.
                //
                var bindings = abacusBindings;
                for (j = 0; j < dotParts.length; j++) {
                    dotName = dotParts[j];
                    if (j < dotParts.length-1) {
                        bindings.push({
                            "entity": dotName,
                            "bind": []
                        });
                        bindings = bindings[bindings.length - 1].bind;
                    } else {
                        bindings.push({
                            "property": dotName,
                            "selector": field.type + "[name='" + selector + "']"
                        });
                    }
                }
            }

            // for each form that's in the array setup a unique
            // abacus record such that each form can reset its own data.
            //
            var options = { data: [], bindings: [] };
            for (i = 0;i < forms.length; i++) {
                form = forms[i];

                // generate a entity with a unique name
                var record = new abacus.Entity(form.abacusRecord, 'record-' + i);
                options.data.push(record);

                // walk through the set of bindings and push them into the uber
                // collection of binding options
                for (j = 0; j < form.abacusBindings.length; j++) {
                    options.bindings.push(form.abacusBindings[j]);
                }

                // each form gets associated with a record store the record so
                // we can reset it if required in the reset handler
                //
                form["record"] = record;

                // this is ugly but required, we need to wrap the client handler in a
                // function to scope the record such that the handler has the correct record
                (function() {
                    var tmpRecord = record;
                    var tmpNode = form["node"];
                    jQuery(tmpNode).find('[type="reset"]').click(function() {
                        tmpRecord.$value({});
                        return false;
                    });
                })();
            }

            // register all form fields into the global abacus space
            // this gives us access to to them, however also has the issue that
            // there can be conflicts if two forms define the same variable.
            jQuery.each(options.data, function(i, aRecord) {
                jQuery.each(aRecord.$properties(), function(i, name) {
                    abacus.register(aRecord[name]);
                });
            });

            jQuery('body').abacusLink(options);
        }
    }
}());