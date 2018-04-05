(function (expeditor) {

    var defaults = {
        propSelector : function (jsonModel) {
                var result = {};
                for (var prop in jsonModel) {
                    if (jsonModel.hasOwnProperty(prop) && prop !== "items") {
                        result[prop] = jsonModel[prop];
                    }
                }
                return result;
            }
    };
    var elementDisplayNameMap = {};
    expeditor.TreeProcessor = expeditor.Class.extend({

        init : function (treeJson, propSelector) {
            this.propSelector = typeof propSelector == "function" ? propSelector : defaults.propSelector;
            this.treeJson = treeJson;
            this.flatModel = {};
            this.root = this._parseJSON(this.treeJson);
            elementDisplayNameMap = {};
        },

        _parseJSON : function (jsonModel, parent, isParentCollection) {
            if (!jsonModel) {
                return null;
            }
            displayPath = parent ? parent.displayPath : "";
            var node = $.extend({}, jsonModel);
            node.type = jsonModel.type ? jsonModel.type.toUpperCase() : '';
            var nodeId = node.id;
            node.displayName = jsonModel.displayName == null ? node.name : jsonModel.displayName;
            node.displayPath = displayPath + node.displayName + "/";
            node.type = node.type.split("|")[0].trim(); // we show the first type in the Tree
            if (!elementDisplayNameMap[node.displayName]) {
                elementDisplayNameMap[node.displayName] = node;
            } else {
                var obj = elementDisplayNameMap[node.displayName];
                if (obj.displayName === node.displayName) {
                    node.isDuplicate = true;
                    this.flatModel[node.id] ? this.flatModel[node.id].isDuplicate = true : '';
                    if (!obj.isDuplicate) {
                        obj.isDuplicate = true;
                        this.flatModel[obj.id] ? this.flatModel[obj.id].isDuplicate = true : '';
                    }
                }
            }
            if (!isParentCollection) {
                this.flatModel[nodeId] = this.propSelector(jsonModel);
                this.flatModel[nodeId].displayName = node.displayName;
                this.flatModel[nodeId].displayPath = node.displayPath;
                this.flatModel[nodeId].isDuplicate = node.isDuplicate;
                this.flatModel[nodeId].options = node.options;
                this.flatModel[nodeId].parent = parent ? parent.id : "";
            }
            if (jsonModel.items) { // Composite element
                var items = jsonModel.items;
                var i;
                node.items = [];
                if (items instanceof Array) {
                    for (i = 0; i < items.length; i++) {
                        node.items.push(this._parseJSON(items[i], node));
                    }
                } else if (items instanceof Object) {
                    for (i in items) {
                        if (items.hasOwnProperty(i)) {
                            node.items.push(this._parseJSON(items[i], node));
                        }
                    }
                }
            } else if (jsonModel.item) { // Collection element
                node.item = this._parseJSON(jsonModel.item, node, true);
            }
            if (jsonModel.toolbar) {
                node.toolbar = this._parseJSON(jsonModel.toolbar, node);
            }

            return node;
        },
        getFlatModel : function () {
           return this.flatModel;
       },
        getRoot : function () {
            return this.root;
        }

    });

})(expeditor);
