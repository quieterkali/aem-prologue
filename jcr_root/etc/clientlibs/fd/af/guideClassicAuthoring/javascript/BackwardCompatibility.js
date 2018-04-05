(function (window, $, guidelib) {
    var EditConfigListeners = window.guidelib.author.editConfigListeners;

    window.REFRESH_GUIDE = function (fullRefresh) {
        EditConfigListeners.REFRESH_GUIDE(fullRefresh);
    };

    window.GUIDE_AFTER_INSERT = function () {
        EditConfigListeners.GUIDE_AFTER_INSERT();
    };

    window.REFRESH_PARENT_PANEL = function () {
        EditConfigListeners.REFRESH_PARENT_PANEL();
    };

    window.REFRESH_PANEL_WITH_SCRIBBLE = function () {
        EditConfigListeners.REFRESH_PANEL_WITH_SCRIBBLE();
    };

    /*
     * In case of cq components guide refresh should not be called.
     * It shouldn't be called for guide components as well but since
     * we were doing it till now, continuing the legacy.
     *
     * Now checking whether GUIDE_AFTER_CHILD_INSERT was called after
     * adding a guide component and then only calling refresh guide
     *
     * WE NEED TO RECTIFY THIS SITUATION ASAP.
     */
    window.GUIDE_AFTER_CHILD_INSERT = function (thisEdit, childPath) {
        EditConfigListeners.GUIDE_AFTER_CHILD_INSERT(thisEdit, childPath);
    };

    window.GUIDE_AFTER_DELETE = function () {
        EditConfigListeners.GUIDE_AFTER_DELETE();

    };

    window.GUIDE_CHILD_INSERT = function (thisEdit, childPath) {
        EditConfigListeners.GUIDE_CHILD_INSERT(thisEdit, childPath);
    };

})(window, $, guidelib);
