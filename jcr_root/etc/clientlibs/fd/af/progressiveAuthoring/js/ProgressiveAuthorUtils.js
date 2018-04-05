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

(function ($) {
    progressive =  {
        authorUtils : {
            //this API is used to set the value of serviceName Field that is hidden based on the option selected by the author.
            setValueOfStrategyName : function () {
                var guideServicePathField = this.getField("./guideStrategyPath"),
                    selectedIndex = guideServicePathField.comboBox.selectedIndex;
                if (selectedIndex < 0) {
                    selectedIndex = 0;
                }
                var selectedOption = guideServicePathField.options[selectedIndex];
                this.getField("./strategyName").setValue(selectedOption.strategyName);
            },

            //this function is used to post the default progressive ordering created for the progressive data capture component at the path
            //specified in the dialog
            defaultOrderingGeneratorHandler : function () {
                var dialog = this.findParentByType('dialog'),
                    strategyJcrPathField = dialog.getField('./strategyJcrPath'),
                    defaultPDCOrderPath = strategyJcrPathField.getValue(),
                    guideRefField = dialog.getField('./guideRef'),
                    guideRef = guideRefField.getValue();
                if (defaultPDCOrderPath != null && defaultPDCOrderPath.length > 0 && guideRef != null && guideRef.length > 0) {
                    var guidePath = (dialog.getField('./guideRef').getValue() || '').replace('/content/dam/formsanddocuments', '/content/forms/af'),
                        pdcOrderGenUrl = CQ.HTTP.externalize(guidePath) + '/jcr:content/guideContainer.progressive.defaultorder',
                        defaultOrderJson = CQ.HTTP.eval(pdcOrderGenUrl),
                        response = CQ.HTTP.get(CQ.HTTP.externalize(defaultPDCOrderPath + ".3.json")),
                        isContentPresent = false,
                        isContentPDC = false,
                        obj = null;
                    if (defaultOrderJson) {
                        if (CQ.HTTP.isOk(response)) {
                            obj = JSON.parse(response.responseText);
                            // If we find another object, this means there is content present
                            // hence notify the user to delete it
                            _.each(obj, function (item) {
                                    if (_.isObject(item)) {
                                        isContentPresent = true;
                                        // May have to change the logic here if any change in node structure of PDC
                                        if (item.guideNodeClass === "guideProgressiveSection") {
                                            isContentPDC = true;
                                        }
                                    }
                                });
                        }
                        if (isContentPDC) {
                            CQ.Ext.Msg.confirm(
                                CQ.I18n.getMessage("Delete Content"),
                                CQ.I18n.getMessage("Do you want to delete the existing content present in Adaptive Form View ordering path?"),
                                    function (btnId) {
                                        if (btnId == "yes") {
                                            response = CQ.HTTP.post(defaultPDCOrderPath, null, {':operation' : 'delete'});
                                            if (CQ.HTTP.isOk(response)) {
                                                isContentPresent = false;
                                                importAndSetPath();
                                            }
                                        }
                                    }, this);
                        }
                        function importAndSetPath() {
                                // Now let's import the new structure
                                response = CQ.HTTP.post(defaultPDCOrderPath, null, {':operation' : 'import', ':contentType' : 'json', ':content' : JSON.stringify(defaultOrderJson), ':replace' : true, ':replaceProperties' : true, '_charset_' : 'utf-8'});
                                if (CQ.HTTP.isOk(response)) {
                                    // If response if ok, lets set the pdc order path in the container dialog
                                    dialog.getField('./strategyJcrPath').setValue([defaultPDCOrderPath]);
                                    CQ.Notification.notify(CQ.I18n.getMessage("Success"), CQ.I18n.getMessage("Default Form View ordering configuration generated"));
                                }
                            }

                        // lets check if any content present in the path
                        // if no content is present only then upload
                        if (!isContentPresent) {
                            importAndSetPath();
                        } else if (!isContentPDC) {
                            CQ.Notification.notify(CQ.I18n.getMessage("Error"), CQ.I18n.getMessage("Delete the existing content present in Adaptive Form View ordering path"));
                        }

                    } else {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Invalid Adaptive Form Path Value"),
                            CQ.I18n.getMessage("Please enter a valid value in Adaptive Form Path Field and retry."), this);
                    }
                } else {
                    if (guideRef.length <= 0) {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Adaptive Form Path Value Missing"),
                            CQ.I18n.getMessage("Please enter the value of Adaptive Form Path Field and retry."), this);
                    } else {
                        CQ.Ext.Msg.alert(
                            CQ.I18n.getMessage("Adaptive Form View Ordering Path Value Missing"),
                            CQ.I18n.getMessage("Please enter the value of Adaptive Form View Ordering Path Field and retry."), this);
                    }
                }
            }

        }
    };
})(window.jQuery);

