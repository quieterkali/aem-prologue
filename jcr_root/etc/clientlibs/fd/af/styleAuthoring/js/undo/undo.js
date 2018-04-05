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

;(function (_, $, style, undefined) {

    var styleConstants = style.constants,
            styleUtils = style.utils,
            manager = styleUtils.history.Manager = styleUtils.history.Manager || {},
            hiddenCssClass = styleConstants.HIDDEN_CLASS,
            undoDataValue = styleConstants.UNDO_CLASS,
            redoDataValue = styleConstants.REDO_CLASS;
    manager.operationActive = false;
    styleUtils.history = styleUtils.history || {};

    /*
    	 * The init method is called after the authoring UI is fully loaded and
    	 * registers events and initializes variables to default.
    	 *
    	 */
    manager.init = function (cfg, assetPath) {
        manager.config = {};
        manager.data = [];
        manager.activeStep = -1;
        if (cfg) {
            manager.config.enabled = cfg.enabled;
            manager.config.maxUndoSteps = cfg.maxUndoSteps;
        } else {
            manager.enabled = true;
            manager.config.maxUndoSteps = 20;
        }
        manager.assetPath = assetPath;
        manager.persistence = styleUtils.history.clientsidePersistence.createLawnchair();

        $('[data-history-control="' + undoDataValue + '"]').click(function () {
            manager.undo();
        });
        $('[data-history-control="' + redoDataValue + '"]').click(function () {
            manager.redo();
        });
        manager.load(style.utils.getLastModifiedTime());
    };

    /*
    	 * Get the configuration for Redo and Undo operations
    	 *
    	 */
    manager.getConfiguration = function () {
        return manager.config;
    };

    /*
    	 * Get the redo/undo data [array]
    	 *
    	 */
    manager.getHistory = function () {
        return manager.data;
    };

    /*
    	 * Marks the operation as active (example dialog open and modified).
    	 * If the operation is active, the undo operation would be disabled.
    	 */
    manager.setOperationActive = function (operationActive) {
        manager.operationActive = operationActive;
        manager.updateUIControls();
    };

    /*
    	 * Add a step/operation to the undo / redo stack
    	 *
    	 */
    manager.addStep = function (data) {
        if (!manager.enabled || manager.operationActive) {
            return;
        }
        if (manager.isHistoryTooBig()) {
            manager.pruneHistory();
        }
        manager.clearRedo(); // Remove all steps behind the active step
        // (Existing redo is invalidated on add)
        manager.data.push(JSON.parse(JSON.stringify(data)));
        manager.activeStep++;
        manager.save();
        manager.updateUIControls();
    };

    /*
    	 * Verify if the redo operation can be performed
    	 */
    manager.canRedo = function () {
        if (manager.operationActive) {
            return false;
        }
        return manager.activeStep < (manager.data.length - 1);
    };

    /*
    	 * Verify if the undo operation can be performed
    	 */
    manager.canUndo = function () {
        if (manager.operationActive) {
            return false;
        }
        return manager.activeStep > -1;
    };

    /*
    	 * Clear the redo operation
    	 * e.g. an edit operation (add step) after an undo.
    	 */
    manager.clearRedo = function (data) {
        var clearStart = manager.activeStep + 1, numStepsToRemove = manager.data.length - clearStart, removedSteps = [];
        if (manager.canRedo()) {
            removedSteps = manager.data.splice(clearStart, numStepsToRemove);
        }
        manager.updateUIControls();
        return removedSteps;
    };

    /*
    	 * Verify if the history stack is full
    	 */
    manager.isHistoryTooBig = function () {
        return (manager.data.length > manager.config.maxUndoSteps);
    };

    /*
    	 * Prune the history to remove items which are exceeding the maxUndoSteps
    	 *
    	 */
    manager.pruneHistory = function () {
        var numStepsToRemove;
        if (manager.isHistoryTooBig()) {
            numStepsToRemove = manager.data.length - manager.config.maxUndoSteps;
            manager.data.splice(0, numStepsToRemove);
            manager.activeStep -= numStepsToRemove;
        }
        manager.updateUIControls();
    };

    /*
    	 * Perform a redo operation - dispatches an event with data from stack
    	 */
    manager.redo = function () {
        if (manager.canRedo()) {
            manager.activeStep += 1;
            var data = manager.data[manager.activeStep];
            $(document).trigger("style-action-redo", data);
        }
    };

    /*
         * Perform a undo operation - dispatches an event with data from stack
    	 */
    manager.undo = function () {
        if (manager.canUndo()) {
            var data = manager.data[manager.activeStep];
            manager.activeStep -= 1;
            $(document).trigger("style-action-undo", data);
        }
    };

    /*
    	 * Update the history to persistence
    	 */
    manager.updatePersistence = function () {
        manager.save();
        manager.updateUIControls();
    };

    /*
         * Toggles UI control buttons based on undoable/redoable status.
         */
    manager.updateUIControls = function () {
        $('[data-history-control="' + undoDataValue + '"]').toggleClass(
                hiddenCssClass, !manager.canUndo());
        $('[data-history-control="' + redoDataValue + '"]').toggleClass(
                hiddenCssClass, !manager.canRedo());
    };

    //  ------------- PERSISTENCE -------------

    /*
    	 * Serializes the undo history to a JSON-compatible object.
    	 *
    	 * @return {Object} The JSON-compatible object representing the undo history
    	 */
    manager.serialize = function () {
        var stepCnt = manager.data.length, data = {
            "a" : manager.activeStep,
            "s" : stepCnt
            // "pv": self.pageVersion, //To do...
            // "pe": self.edited
        }, stepToProcess;

        for (var i = 0; i < stepCnt; i++) {
            stepToProcess = manager.data[i];
            data["s" + i] = JSON.stringify(stepToProcess);
        }
        return data;
    };

    /**
    	 * Deserializes the undo history from a JSON-compatible object that was
    	 * created by {@link #serialize}.
    	 *
    	 * @param {Object}
    	 *            data The JSON compatible object to deserialize from
    	 */
    manager.deserialize = function (data) {
        var stepCnt, stepToProcess, step;

        try {
            manager.activeStep = parseInt(data.a);
            // self.pageVersion = data["pv"];
            manager.data.length = 0;
            stepCnt = data.s;

            for (var i = 0; i < stepCnt; i++) {
                stepToProcess = data["s" + i];
                manager.data.push(JSON.parse(stepToProcess));
            }
        } catch (e) {
            if (console) {
                console.log("Error deserializing:", e);
            }
        }
    };

    /*
    	 * Save the history data into client side persistence
    	 *
    	 */
    manager.save = function () {
        var serializedHistory;
        serializedHistory = encodeURIComponent(JSON.stringify(manager.serialize()));
        if (manager.assetPath && serializedHistory) {
            manager.persistence.save({
                key : manager.assetPath,
                undoHistory : serializedHistory,
                modifiedTime : manager.modifiedTime
            });
        }
    };

    /*
         * Clear the data in client side persistence
    	 *
    	 */
    manager.clear = function () {
        // TODO
    };

    /*
    	 * Load the history data from client side persistence
    	 */
    manager.load = function (modifiedTime) {
        var serializedHistoryObject;
        manager.persistence.get(manager.assetPath, function (pageData) {
            if (pageData && pageData.undoHistory) {

                if (pageData.modifiedTime != modifiedTime) {
                    manager.persistence.remove(manager.assetPath, function () {
                        //nothing for now..
                    });
                } else {
                    manager.clear();
                    serializedHistoryObject = JSON.parse(decodeURIComponent(pageData.undoHistory));
                    manager.deserialize(serializedHistoryObject);
                    manager.updateUIControls();
                }
            }
        });
    };

}(window._, $, window.guidelib.touchlib.style));
