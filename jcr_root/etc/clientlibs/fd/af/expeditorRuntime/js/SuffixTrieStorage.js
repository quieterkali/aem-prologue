/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
(function () {
    /**
     * TrieStorage stores the variables by creating a suffix trie for the ids of the variables. So if
     * you have these elements
     * a.b.c.b
     * a.b.c
     * a.b
     * a
     * it will store them in a trie as
     * a
     * b
     *   a
     *   c
     *     b
     *       a
     * c
     *   b
     *     a
     * Each node stores the count of its keys. so if count of a node is more than then it means that path from that node
     * to root (in this trie) is not unique.
     *
     * For searching inside the trie, we start from the end of the id and look for that element in the trie. If the
     * count of its keys is 1, we return a match otherwise we keep on going down. This approach will return many false
     * positives, which is intentional since we need to identify the node even if its id changes because it was moved.
     * As in above example we will return a.d.c.b as a match as well.
     *
     * The node structure of the Trie has 3 keys; 'Count', 'Value' and 'Children':
     * Count: The number of occurrences of a particular node.
     * Value: The values describing the node as an element.
     * Children: The hierarchy of the nodes with key as their name.
     */
    var Storage = guidelib.author.TrieStorage = function () {
        this.store = {};
    };

    Storage.prototype.addElement = function (id, element) {
        var root = this.store,
            self = this,
            addedElement;

        root.children = root.children || {};
        addedElement = id.split(".").reverse().reduce(function (currentRoot, nm) {
            currentRoot = currentRoot.children;
            var index = self._getIndex(nm);
            currentRoot[nm] = currentRoot[nm] || {count : 0, children : {}};
            currentRoot[nm].count++;
            if (index > 0) {
                var nmWithoutIndex = self._removeIndexFromName(nm);
                // no need to increase the count of other elements since their index will tell their count.
                // We are never interested in the actual count but to check whether the element is unique or not
                // elements having non-zero index can never be unique
                if (currentRoot[nmWithoutIndex]) {
                    currentRoot[nmWithoutIndex].count++;
                }
                index--;
            }
            return currentRoot[nm];
        }, root);
        addedElement.value = element;
    };

    Storage.prototype._getIndex = function (nm) {
        return +(nm.match(/\[([0-9]+)\]$/) || [0,0])[1];
    };

    /**
     * Beware it will give many false positives
     * @param id
     * @returns {*}
     */
    Storage.prototype.get = function (id) {
        var reverseId = id.split(".").reverse(),
            root = this.store,
            i = 0,
            foundId = "",
            found = false,
            index;
        for (i = 0; i < reverseId.length && !found && root; i++) {
            var nm = reverseId[i];
            foundId = nm + "." + foundId;
            root = root.children[nm];
            index = this._getIndex(nm);
            if (root && root.count === 1 && index === 0) {
                // found a unique suffix of the id, hence stopping the search.
                found = true;
            }
            if (i === reverseId.length && root.value !== undefined) {
                // found at the last node
                found = true;
            }
        }
        if (found) {
            while (root && root.value === undefined) {
                root =  root.children;
                if (!_.isEmpty(root)) {
                    var key = Object.keys(root)[0];
                    foundId = key + "." + foundId;
                    root = root[key];
                } else {
                    if (console) {
                        console.error("Children are absent from trie storage. Invalid construct.");
                    }
                }
            }
            return {
                foundId : foundId.substring(0, foundId.length - 1),
                element : root.value
            };
        }
        return null;
    };

    Storage.prototype.clear = function () {
        this.store = {};
    };

    Storage.prototype.getAll = function () {
        var result = [];
        var root = this.store;
        var stack = [root];
        while (stack.length > 0) {
            var elem = stack.pop();
            if (elem.value) {
                result.push(elem.value);
            } else {
                elem = elem.children;
                for (var prop in elem) {
                    if (elem.hasOwnProperty(prop)) {
                        stack.push(elem[prop]);
                    }
                }
            }
        }
        return result;
    };

    Storage.prototype._removeIndexFromName = function (nm) {
        if (typeof nm === "string") {
            return nm.replace(/\[[0-9]+\]/, "");
        }
    };

    Storage.prototype.getUniqueId = function (id) {
        var reverseId = id.split(".").reverse(),
            uniqueId = "",
            found = false,
            root = this.store,
            store = this.store.children,
            i;
        for (i = 0; i < reverseId.length && !found; i++) {
            var nm = reverseId[i];
            uniqueId = nm + "." + uniqueId;
            var index = this._getIndex(nm);
            root = root.children[nm];
            //checking whether nm is unique or not. Elements having non-zero index can not be unique
            if (root && store[nm].count === 1 && index === 0) {
                found = true;
            }
        }
        //found will always be true here, given that the id exists.
        return uniqueId.substring(0, uniqueId.length - 1);
    };
}());
