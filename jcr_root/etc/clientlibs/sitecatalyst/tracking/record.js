/**
 * Records a user interaction in the a ClientContext store (by default
 * EventDataManager) to be picked up by the used analytics solution for
 * further processing.
 * 
 * @param event
 *            {String} Tracking event name.
 * @param values
 *            {Object} Tracking values.
 * @param collect
 *            {Boolean} Flag which indicates if event and values should be
 *            collected (optional).
 * @param opt
 *            {Object} Tracking options (optional).
 *            
 * @param componentPath
 *            {String} Resource path of component issuing the call (optional).
 *            
 * @returns {Array} An array holding the event and values if <code>collect</code>
 *          is <code>true</code>, otherwise nothing is returned.
 * @since 5.4
 * 
 * @deprecated Use CQ_Analytics.record(options) instead.
 */
function record(event, values, collect, opt, componentPath) {
    var options = {};
    options.event = event;
    options.values = values;
    options.collect = collect;
    options.options = opt;
    options.componentPath = componentPath;
    //backwards compatibility flag
    options.compatibility=true

    //add old record callbacks to after callbacks
    var f = function (callback) {
        return function(options) {
            callback.call(this, options.event, options.values);
            return false;
        };
    };

    for (var i = record.callbacks.length - 1; i >= 0; i--) {
        CQ_Analytics.registerAfterCallback(f(record.callbacks[i]), 150 - i);
        record.callbacks.pop();
    }

    return CQ_Analytics.record(options);
}

record.callbacks = [];