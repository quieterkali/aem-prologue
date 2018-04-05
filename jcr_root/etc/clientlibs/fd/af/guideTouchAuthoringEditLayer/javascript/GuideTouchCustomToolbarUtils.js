(function ($, guidetouchlib, channel, ns) {
    // Template on how to add a custom action at tool bar using javascript
    // Commenting as of now, since it is not required
    var guideNonIconActions = {
        //icon: 'coral-Icon--more',
        //text: Granite.I18n.get('More'),
        handler : function (editable, param, target) {
            guidetouchlib.editToolbar.editFunction(editable, param, target);
            return false;
        },
        condition : function (editable) {
            return true;
        },
        isNonMulti : true // means it could be executed when only one editable is selected
    },
    addToolbarButtonAction = {
        icon : 'coral-Icon--addCircle',
        text : Granite.I18n.get('Add Toolbar Button'),
        handler : function (editable, param, target) {
            //get toolbar items editable and then parsys editable, this will always be available
            var itemEditable =  ns.editables.getChildren(ns.editables.getChildren(editable)[0])[0],
                ret;
            ret = ns.edit.ToolbarActions.INSERT.execute.call(itemEditable, itemEditable);
            return ret;
        },
        condition : function (editable) {
            if (editable.type === "fd/af/components/toolbar") {
                return true;
            }
            return false;
        },
        isNonMulti : true // means it could be executed when only one editable is selected
    };

    channel.on('cq-layer-activated', function (ev) {
        // register the toolbar action in initial and edit layer
        if (ev.layer === 'Edit' || ev.layer === 'initial') {
            // we use the editable toolbar and register an additional action
            ns.EditorFrame.editableToolbar.registerAction('nonIconAction', guideNonIconActions);
            ns.EditorFrame.editableToolbar.registerAction('addToolbarButtonAction', addToolbarButtonAction);
        }
    });
})(window.jQuery, window.guidelib.touchlib, jQuery(document), Granite.author);
