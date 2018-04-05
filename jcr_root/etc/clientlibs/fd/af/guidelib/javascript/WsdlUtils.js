/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
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
 * ***********************************************************************
 */

(function ($, guidelib, _) {

    var errorHandler = function () {
        // dummy handler - there is nothing we can do to end user
    };

    // Counts the number of Array(repeatable) in the output JSON of the WSDL.
    var outputJsonRepeatCount = function (wsdlOutputId, outputJSONObj) {
        var count = 0,
            wsdlOutputHierarchy = wsdlOutputId.split(".");
        if (Array.isArray(outputJSONObj)) {
            count++;
            outputJSONObj = outputJSONObj[0];
        }
        $.each(wsdlOutputHierarchy, function (depth) {
            if (outputJSONObj) {
                outputJSONObj = outputJSONObj[wsdlOutputHierarchy[depth]];
                if (Array.isArray(outputJSONObj)) {
                    count++;
                    outputJSONObj = outputJSONObj[0];
                }
            }
        });
        return count;
    };

    //Traversing to the highest repeatable field in hierarchy as a starting point.
    var outputRepeatAncestor = function (targetNode, repeatCount, targetNameHierarchy) {
        while (repeatCount > 0) {
            if (_.isNull(targetNode.parent)) {
                return targetNode;
            }
            targetNameHierarchy.push(targetNode.name);
            targetNode = targetNode.parent;
            if (targetNode.repeatable) {
                repeatCount--;
            }
        }
        return targetNode;
    };

    /**
     * Extract value of a hierarchy of properties
     * from a nested javascript object.
     * @param {Object} obj Nested javascript object
     * @param {Array|String} props list of properties
     * or dot separated string from root to leaf object
     * @return {Array} return list of values found
     */
    function extractValues(obj, props) {
        // handle easy cases
        if (obj === null || typeof(obj) === "undefined") {
            return [];
        }
        if (typeof(props) == "string") {
            props = props.split(".");
        }
        if (props.length == 0) {
            return [obj];
        }
        var ret = [];
        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
                ret = ret.concat(extractValues(obj[i], props));
            }
            return ret;
        }
        if (!obj.hasOwnProperty(props[0])) {
            return [];
        }
        // handle actual case now

        var key = props[0];
        var remainingKeys = props.slice(1);
        var values = obj[key];
        if (!(values instanceof Array)) {
            values = [values];
        }
        for (var x = 0; x < values.length; x++) {
            ret = ret.concat(extractValues(values[x], remainingKeys));
        }
        return ret;
    }
    //Maps the output JSON(outputJSONObj) to the Model(targetNode)
    var outputJsonMapping = function (wsdlOutputId, targetNode, targetNameHierarchy, outputJSONObj) {
        if (targetNameHierarchy.length === 0) {
            targetNode.value = guidelib.runtime.guide.getOrElse(outputJSONObj, wsdlOutputId, "");
            return;
        }
        var targetName = targetNameHierarchy.pop();
        if (targetNode.repeatable) {
            //Gets respective array for this repeatable field.
            while (typeof outputJSONObj === "object" && !Array.isArray(outputJSONObj)) {
                var argsIndex = wsdlOutputId.indexOf('.');
                outputJSONObj = outputJSONObj[wsdlOutputId.substring(0, argsIndex)] || "";
                wsdlOutputId = wsdlOutputId.substring(argsIndex + 1);
            }
            //Adjust the number of instances to the number of array elements.
            var jsonLength = outputJSONObj.length,
                instanceCount = targetNode.instanceManager.instanceCount;
            while (instanceCount < jsonLength) {
                targetNode.instanceManager.addInstance();
                instanceCount++;
            }
            //Check as "" might occur too for incorrect mappings.
            if (Array.isArray(outputJSONObj)) {
                //Recursive call for every instance with corresponding value.
                $.each(outputJSONObj, function (index) {
                    // if the output from external API call contains more records, than the number
                    // of instances present, return
                    if (index >= targetNode.instanceManager.instanceCount) {
                        return false;
                    }
                    targetNode = targetNode.instanceManager.instances[index];
                    outputJsonMapping(wsdlOutputId, targetNode[targetName], targetNameHierarchy, outputJSONObj[index]);
                });
            }
        } else {
            //Recursive call down the hierarchy.
            outputJsonMapping(wsdlOutputId, targetNode[targetName], targetNameHierarchy, outputJSONObj);
        }
        //Pushing back the hierarchy for next instance if any.
        targetNameHierarchy.push(targetName);
    };

    var populateWsdlOutput = function (wsdlOutput, textStatus, jqXHR) {
        if (wsdlOutput == null || wsdlOutput.length == 0) {
            return;
        }

        var origOutputJSONObj = JSON.parse(wsdlOutput),
            outputMappingObj = this.callbackData;

        /*  For each entry in outputMappingObj, we need to find the corresponding value in responseObj.
         *  wsdlOutputId - wsdlOutput hierarchy, targetNode - field in the form whose value is to be set.
         *  e.g. {ipinfo.ip, txtfield} */
        $.each(outputMappingObj, function (wsdlOutputId, targetNode) {
            /* Gets value in outputJSONObj corresponding to targetNode.
             * First, It counts the number of Array in hierarchy as repeatCount.
             * Next, targetNode is taken to the starting point for traversal.
             * It's the topmost repeatable node in hierarchy.
             * Lastly, The outputJson is mapped to the TargetNode.*/
            var repeatCount = outputJsonRepeatCount(wsdlOutputId, origOutputJSONObj),
                targetNameHierarchy = [],
                targetNode = outputRepeatAncestor(targetNode, repeatCount, targetNameHierarchy);
            outputJsonMapping(wsdlOutputId, targetNode, targetNameHierarchy, origOutputJSONObj);
        });
        window.guideBridge._guide.runPendingExpressions();
    };

    /**
     * Create and set items to dropdown field
     * from wsdl response
     * @this {Object} is of form {callbackData:data}
     */
    function setOptionsCallback(wsdlOutput) {
       var cbData = this.callbackData;
       var wsdlOutputObj = JSON.parse(wsdlOutput);
       var savedValues = extractValues(wsdlOutputObj, cbData.savedValue);
       var displayedValues = extractValues(wsdlOutputObj, cbData.displayedValue);
       var options = [];
       for (var i = 0; i < savedValues.length; i++) {
           options.push(savedValues[i] + "=" + displayedValues[i]);
       }
       cbData.field.items = options;
   }

    function setValueCallback(wsdlOutput) {
        var cbData = this.callbackData;
        var wsdlOutputObj = JSON.parse(wsdlOutput);
        cbData.field.value = extractValues(wsdlOutputObj, cbData.value);
    }

    var DataIntegrationUtils = guidelib.dataIntegrationUtils = {

        setOptionsFromService : function (wsdlInfoObj, jsonInputMapping, jsonOutputMapping) {
            this.executeOperation(wsdlInfoObj, jsonInputMapping, jsonOutputMapping, setOptionsCallback);
            return jsonOutputMapping.field.items;
        },

        setValueFromService : function (wsdlInfoObj, jsonInputMapping, jsonOutputMapping) {
            this.executeOperation(wsdlInfoObj, jsonInputMapping, jsonOutputMapping, setValueCallback);
            return jsonOutputMapping.field.items;
        },

        executeOperation : function (wsdlInfoObj, jsonInputMappingObj, jsonOutputMappingObj, processOutputCallback) {
            // populate operationDetails object
            var successHandler = processOutputCallback || populateWsdlOutput;
            var wsdlInputObj = {};

            /* Iterate through the jsonInputMapping and create the input object.
             * wsdlInputId - wsdlInput hierarchy, targetNode - field in the form whose value is to be retrieved.*/
            $.each(jsonInputMappingObj, function (wsdlInputId, targetNode) {
                var argsHierarchy = wsdlInputId.split("."),
                    wsdlArgObj = wsdlInputObj,
                    argDepth,
                    valueToBeAssigned;

                for (argDepth = 0; argDepth < argsHierarchy.length - 1; argDepth++) {
                    wsdlArgObj[argsHierarchy[argDepth]] = wsdlArgObj[argsHierarchy[argDepth]] || {};
                    wsdlArgObj = wsdlArgObj[argsHierarchy[argDepth]];
                }
                // assign the value of targetNode
                if (typeof targetNode === "object") {
                    valueToBeAssigned = targetNode.value;
                } else {
                    valueToBeAssigned = targetNode;
                }
                wsdlArgObj[argsHierarchy[argDepth]] = valueToBeAssigned;
            });

            var wsdlEndPoint = wsdlInfoObj.wsdlEndPoint,
                operationDetails = {};
            operationDetails.operationName = wsdlInfoObj.operationName;
            operationDetails.input = JSON.stringify(wsdlInputObj);
            operationDetails.port = wsdlInfoObj.port;
            operationDetails.soapActionURI = wsdlInfoObj.soapActionURI;
            operationDetails.namespace = wsdlInfoObj.namespace;
            operationDetails.inputRoot = wsdlInfoObj.inputRoot;
            operationDetails.inputAttr = JSON.stringify(wsdlInfoObj.inputAttr);
            operationDetails.serviceEndPoint = wsdlInfoObj.serviceEndPoint;

            var wsdlServletURL  = guidelib.runtime.guide.jcrPath + ".af.dermis";
            var externalizedWSDLServletURL;
            if (guideBridge != null) {
                externalizedWSDLServletURL = guideBridge._getUrl(wsdlServletURL);
            } else {
                externalizedWSDLServletURL = Granite.HTTP.externalize(wsdlServletURL);
            }

            var invokeData = {};
            if (wsdlInfoObj.wsdlEndPoint) {
                invokeData.functionToExecute = 'invokeWsdlOperation';
                invokeData.wsdlEndPoint = wsdlEndPoint;
                invokeData.operationName = operationDetails.operationName;
                invokeData.input = operationDetails.input;

                if (operationDetails.port) {
                    invokeData.port = operationDetails.port;
                }
                if (operationDetails.soapActionURI) {
                    invokeData.soapActionURI = operationDetails.soapActionURI;
                }
                if (operationDetails.namespace) {
                    invokeData.namespace = operationDetails.namespace;
                }
                if (operationDetails.inputRoot) {
                    invokeData.inputRoot = operationDetails.inputRoot;
                }
                if (operationDetails.inputAttr) {
                    invokeData.inputAttr = operationDetails.inputAttr;
                }
                if (operationDetails.serviceEndPoint) {
                    invokeData.serviceEndPoint = operationDetails.serviceEndPoint;
                }
            } else if (wsdlInfoObj.formDataModelId) {
                invokeData.functionToExecute = 'invokeFDMOperation';
                invokeData.formDataModelId = wsdlInfoObj.formDataModelId;
                invokeData.input = JSON.stringify(wsdlInputObj);
                invokeData.operationName = wsdlInfoObj.operationName;
            }
            invokeData.guideNodePath = guidelib.runtime.guide._currentContext.contextNode.jcrPath;

            $.ajax({
                type : 'POST',
                url : externalizedWSDLServletURL,
                data : invokeData,
                dataType : 'text',
                success : successHandler,
                error : errorHandler,
                context : {callbackData : jsonOutputMappingObj}
            });
        }
    };

    var WsdlUtils = guidelib.wsdlUtils = {
        /**
         *  Internal API, called for invoking webservice and setting items in a drop down
         */
        setOptionsFromWSDL : function (wsdlInfoObj, jsonInputMapping, jsonOutputMapping) {
            DataIntegrationUtils.executeOperation(wsdlInfoObj, jsonInputMapping, jsonOutputMapping, setOptionsCallback);
            return jsonOutputMapping.field.items;
        },

        setValueFromWSDL : function (wsdlInfoObj, jsonInputMapping, jsonOutputMapping) {
            DataIntegrationUtils.executeOperation(wsdlInfoObj, jsonInputMapping, jsonOutputMapping, setValueCallback);
            return jsonOutputMapping.field.items;
        },

        executeWSDLFunction : function (wsdlInfoObj, jsonInputMappingObj, jsonOutputMappingObj) {
            // populate operationDetails object
            DataIntegrationUtils.executeOperation(wsdlInfoObj, jsonInputMappingObj, jsonOutputMappingObj);
        }
    };
}($, guidelib, _));
