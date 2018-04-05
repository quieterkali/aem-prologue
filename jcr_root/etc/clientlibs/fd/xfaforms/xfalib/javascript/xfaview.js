(function(_, $, xfalib){

    var HtmlTemplateCache = xfalib.view.util.HtmlTemplateCache = xfalib.ut.Class.extend({
        initialize : function(){
            HtmlTemplateCache._super.initialize.call(this);
            this._cache = {};
            this._hiddenObjPages = [];
        },

        put: function (el) {
            var occurIndex = this.getOrElse(this.xfaUtil().$data(el, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL + "." + xfalib.view.LayoutConst.OCCUR_INDEX, '0');
            if (!this.contains(el.id) || this._cache[el.id][occurIndex] === undefined) {
                this._cache[el.id] = this._cache[el.id] || {};
                this._cache[el.id][occurIndex] = el; // the cache is now 2D, against each el id store a map, indexed by occur index
                this._cacheChildren(el);
            }
        },

        contains : function(elId){
            return (this._cache.hasOwnProperty(elId) && this._cache[elId] !== undefined);
        },

        get : function(elId, lookUpHiddenCache){
            var $nodeDiv = null,
                nodeXfaModel = null,
                partOffsetY = 0,
                $pageDiv,
                $splitPart;

            function stitchNodes() {
                // We need to collect all parts of this node from various pages/occurrences and stitch them together.
                // We start by picking *stitched* children of this part and append them to initially empty $nodeDiv. As we move on to next
                // part, we'll pick only those children which starts from that part(occurIndex:0)
                // Stitching would require modify the extenty of children to add content height of current stitched
                // part and then modify the extenth of currently stitched part to include height of new part. All the children from new part are cloned-appended into
                // current stitch part.

                if (!$nodeDiv) {
                    //do not modify existing node. Work on it's clone and start building from scratch.
                    $nodeDiv = $splitPart.clone();
                    $nodeDiv.children().remove();
                    nodeXfaModel = this.xfaUtil().$data($nodeDiv.get(0), xfalib.view.LayoutConst.XFA_MODEL);
                }
                else {
                    partOffsetY = parseFloat(nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.EXTENT_H]) -
                        parseFloat(this.getOrElse(nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.MARGIN_TOP], 0)) -
                        parseFloat(this.getOrElse(nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.MARGIN_BOTTOM], 0));
                }

                _.each($splitPart.children().get(),
                    function (partChild) {
                        var childId = partChild.id;
                        var childHasSplit = (this.getOrElse(this.xfaUtil().$data(partChild, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL + "." + xfalib.view.LayoutConst.OCCURRENCES, 1) > 1);
                        var isChildFirstSplit = (this.getOrElse(this.xfaUtil().$data(partChild, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL + "." + xfalib.view.LayoutConst.OCCUR_INDEX, 0) == 0);
                        var $childClone = null;
                        if (childHasSplit && !isChildFirstSplit) {
                            //split child would already been handled when it's first part was found.
                            return;
                        }
                        else if (childHasSplit && isChildFirstSplit) {
                            //If this child has split and it is first part of the child split, get the entire stitched child.
                            $childClone = $(this.get(childId, true));
                        }
                        else {
                            $childClone = $(partChild).clone();
                        }
                        var childXfaModel = this.xfaUtil().$data($childClone.get(0), xfalib.view.LayoutConst.XFA_MODEL);
                        if (childXfaModel) {
                            // modify the extenty of child and then append this child clone to current stitch part $nodeDiv
                            childXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.EXTENT_Y] = partOffsetY + parseFloat(this.getOrElse(childXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.EXTENT_Y], 0));
                            $childClone.attr("data-" + xfalib.view.LayoutConst.XFA_MODEL, JSON.stringify(childXfaModel));
                        }
                        $childClone.appendTo($nodeDiv);
                    },
                    this
                );

                // modify the extenth part $nodeDiv
                nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.EXTENT_H] = parseFloat(this.xfaUtil().$data($splitPart.get(0), xfalib.view.LayoutConst.XFA_MODEL)[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.EXTENT_H]) + partOffsetY;
            }

            if(this.contains(elId)) {
                if(_.keys(this._cache[elId]).length === 1) {
                    return this._cache[elId]["0"].cloneNode(true);
                }
                // subform was split into different parts, stitch each part in order of occurIndex
                for (var occurIndex = 0; occurIndex < _.keys(this._cache[elId]).length; ++occurIndex) {
                    $splitPart = $(this._cache[elId][occurIndex]);
                    stitchNodes.call(this);
                }

                if ($nodeDiv && $nodeDiv.get(0)) {
                // update stitched node in cache, after modifying occurrences and occur index to make it appear as unsplit
                    this._cache[elId] = undefined;
                    nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.OCCURRENCES] = "1";
                    nodeXfaModel[xfalib.view.LayoutConst.LAYOUT_MODEL][xfalib.view.LayoutConst.OCCUR_INDEX] = undefined;
                }
            }
            else if(lookUpHiddenCache) {
                for(var i = 0; i < this._hiddenObjPages.length; ++i) {
                    $pageDiv = $(this._hiddenObjPages[i]);
                    $splitPart = $pageDiv.find(this.jqId(elId));
                    if($splitPart && $splitPart.get(0)){
                        stitchNodes.call(this);
                    }
                    this._hiddenObjPages[i] = $pageDiv.get(0); // cache the constructed page dom back in hidden objects array in case page was string as it happens for the first time.
                }
            }

            if ($nodeDiv && $nodeDiv.get(0)) {
                $nodeDiv.attr("data-" + xfalib.view.LayoutConst.XFA_MODEL, JSON.stringify(nodeXfaModel));
                this.put($nodeDiv.get(0));  //put it in the cache.
                return $nodeDiv.get(0).cloneNode(true);
            }
            else {
                return null;
            }
        },

        setHiddenObjPages : function(hiddenPages){
            this._hiddenObjPages = hiddenPages || [];
        },

        _cacheChildren : function(parent){
            var that = this;
            $(parent).children().each(function(){
                //cache xfa sub elements as well.
                if(that.getOrElse(that.xfaUtil().$data(this, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.NODE_TYPE, "").length > 0){
                    that.put(this);
                }
            });
        }
    });
})(_, $, xfalib);
(function(_,xfalib) {
    var Constants = {
        XFA_MODEL : "x",
        NODE_TYPE : "t",
        LAYOUT_MODEL: "l",
        SUBFORM_LAYOUT: "sl",
        EXTENT_X : "x",
        EXTENT_Y : "y",
        EXTENT_W : "w",
        EXTENT_H : "h",
        EXTENT_MIN_H : "nh",
        EXTENT_MIN_W : "nw",
        EXTENT_MAX_H : "xh",
        EXTENT_MAX_W : "xw",
        EXTENT_ACTUAL_H : "ah",
        EXTENT_ACTUAL_W : "aw",
        MARGIN_TOP : "t",
        MARGIN_LEFT : "l",
        MARGIN_BOTTOM : "b",
        MARGIN_RIGHT : "r",

        BORDER_TOP : "bt",
        BORDER_LEFT : "bl",
        BORDER_BOTTOM : "bb",
        BORDER_RIGHT : "br",

        COL_SPAN : "c",
        ROW_SPAN : "rs",
        OCCURRENCES : "o",
        OCCUR_INDEX: "i",
        COLUMN_WIDTHS : "cw",
        PAGE_NUMBER: "pn",
        CAP_PLACEMENT : "p",
        LAYOUT_LEFTRIGHTTOPBOTTOM : "lr",
        LAYOUT_RIGHTLEFTTOPBOTTOM : "rl",
        LAYOUT_TOPBOTTOM : "tb",
        LAYOUT_TABLE : "t",
        LAYOUT_ROW : "r",
        LAYOUT_RIGHTLEFTROW : "rr",
        LAYOUT_DATATABLE : "dt"
    };
    xfalib.view.LayoutConst = Constants;
})(_,xfalib);
(function(_, $, xfalib){
    var LayoutBase = xfalib.view.layout.LayoutBase = xfalib.ut.Class.extend({
        initialize : function(){
            xfalib.ut.Class.prototype.initialize.apply(this, arguments);
            this._layoutManager = this._xfaViewRegistry().layoutManager();
            this.target = this.options.target; //ContainerView instance
            this._positioningCssPropertyX = "left";
            this._positioningCssPropertyY = "top";
        },

        measureSize : function(){
            return xfalib.view.BaseView.prototype.measureSize.apply(this.target, arguments);
        },

        invalidateSize : function(){
            return xfalib.view.BaseView.prototype.invalidateSize.apply(this.target, arguments);
        },

        updateDisplay : function(){
            xfalib.view.BaseView.prototype.updateDisplay.apply(this.target, arguments);
            _.each(this.target._normalizedChildViews(), function(childView, index){
                var extent = {};
                extent[this._positioningCssPropertyX] =  childView.layoutModel.measuredx;
                extent[this._positioningCssPropertyY] =  childView.layoutModel.measuredy;
                this.$css(childView.el, extent);
            }, this);
        },

        _targetPaddingX : function(){
            return this.target._padLeft();
        },

        _targetPaddingY : function(){
            return this.target._padTop();
        },

        $data : xfalib.ut.XfaUtil.prototype.$data,

        $css : xfalib.ut.XfaUtil.prototype.$css,

        _xfaViewRegistry : function() {
            return window.xfaViewRegistry;    //TODO: remove window dependency
        }

    })

})(_, $, xfalib);


(function(_, $, xfalib){
    xfalib.view.layout.PositionLayout = xfalib.view.layout.LayoutBase.extend({
        initialize : function(){
            xfalib.view.layout.LayoutBase.prototype.initialize.apply(this, arguments);
        },

        measureSize : function(){
            var layoutModel = this.target.layoutModel;
            var parentPadLeft = this._targetPaddingX();
            var parentPadTop = this._targetPaddingY();
            var oldExtentW = layoutModel.extentw;
            var oldExtentH = layoutModel.extenth;
            var containerW = 0;
            var containerH = 0;
            _.each(this.target._normalizedChildViews(), function(childView, index){

                childView.layoutModel.measuredx =  parentPadLeft + childView.layoutModel.extentx;
                childView.layoutModel.measuredy =  parentPadTop + childView.layoutModel.extenty;
                if(childView.layoutModel.extentx + childView.layoutModel.extentw > containerW)
                    containerW = childView.layoutModel.extentx + childView.layoutModel.extentw;
                if(childView.layoutModel.extenty + childView.layoutModel.extenth > containerH)
                    containerH = childView.layoutModel.extenty + childView.layoutModel.extenth;
            }, this);

            if(layoutModel.extentactualw < 0){
                var parentExtentW = layoutModel.marginleft + containerW + layoutModel.marginright;
                layoutModel.extentw = parentExtentW;
            }
            if(layoutModel.extentactualh < 0){
                var parentExtentH = layoutModel.margintop + containerH + layoutModel.marginbottom;
                layoutModel.extenth = parentExtentH;
            }

            if(oldExtentW != layoutModel.extentw || oldExtentH != layoutModel.extenth){
                return true;
            }
            else {
                return false;
            }
        }

    })
})(_, $, xfalib);



(function(_, $, xfalib){
    xfalib.view.layout.LeftRightLayout = xfalib.view.layout.LayoutBase.extend({
        initialize : function(){
            xfalib.view.layout.LayoutBase.prototype.initialize.apply(this, arguments);
        },

        measureSize : function(){
            var layoutModel = this.target.layoutModel;
            var parentPadX = this._targetPaddingX();
            var parentPadY = this._targetPaddingY();
            var oldExtentW = layoutModel.extentw;
            var oldExtentH = layoutModel.extenth;
            var parentContentWidth  =  layoutModel.extentw - layoutModel.marginleft - layoutModel.marginright + this._layoutManager.LAYOUT_ERROR_MARGIN;
            if(layoutModel.extentactualw < 0){
                parentContentWidth = 1000000; //Arbitrary limitation for max width. Could be MAX_VALUE, but that may be costly?
            }

            var currentX =  0;//Right of the last element
            var currentLineY = 0;
            var lineHeight = 0; //Line Height for current line
            _.each(this.target._normalizedChildViews(), function(childView, index){
                if(currentX + childView.layoutModel.extentw > parentContentWidth){
                    currentX = 0;
                    currentLineY = currentLineY + lineHeight;
                    lineHeight = 0;
                }
                childView.layoutModel.measuredx =  parentPadX + currentX;
                childView.layoutModel.measuredy = parentPadY + currentLineY;
                if(lineHeight < childView.layoutModel.extenth){
                    lineHeight = childView.layoutModel.extenth;
                }
                //update top variables for second element
                currentX = currentX +  childView.layoutModel.extentw;
            }, this);
            if(layoutModel.extentactualw < 0) {
                var parentExtentW = layoutModel.marginleft + currentX + layoutModel.marginright;
                layoutModel.extentw = parentExtentW;
            }
            if(layoutModel.extentactualh < 0) {
                var parentExtentH = layoutModel.margintop + currentLineY + lineHeight + layoutModel.marginbottom;
                layoutModel.extenth = parentExtentH;
            }

            if(oldExtentW != layoutModel.extentw || oldExtentH != layoutModel.extenth){
                return true;
            }
            else{
                return false;
            }
        }

    })
})(_, $, xfalib);

(function(_, $, xfalib){
    xfalib.view.layout.RightLeftLayout = xfalib.view.layout.LeftRightLayout.extend({
        initialize : function(){
            xfalib.view.layout.LeftRightLayout.prototype.initialize.apply(this, arguments);
            this._positioningCssPropertyX = "right";
            this._positioningCssPropertyY = "top";
        },

        _targetPaddingX : function(){
            return this.target._padRight();
        },

        _targetPaddingY : function(){
            return this.target._padTop();
        }

    })
})(_, $, xfalib);


(function(_, $, xfalib){
    xfalib.view.layout.TopBottomLayout = xfalib.view.layout.LayoutBase.extend({

        measureSize : function(){
            var layoutModel = this.target.layoutModel;
            var parentPadLeft = this._targetPaddingX();
            var parentPadTop = this._targetPaddingY();
            var oldExtentW = layoutModel.extentw;
            var oldExtentH = layoutModel.extenth;
            var containerW = 0;
            var currentLineY  =  0;
            _.each(this.target._normalizedChildViews(), function(childView, index){
                childView.layoutModel.measuredx = parentPadLeft;
                childView.layoutModel.measuredy =  parentPadTop + currentLineY;
                if(childView.layoutModel.extentw > containerW) {
                    containerW = childView.layoutModel.extentw;
                }
                //update currentLineY variables for second element
                currentLineY = currentLineY + childView.layoutModel.extenth;
            }, this);

            if(layoutModel.extentactualw < 0){
                var parentExtentW = layoutModel.marginleft + containerW + layoutModel.marginright;
                layoutModel.extentw = parentExtentW;
            }
            if(layoutModel.extentactualh < 0){
                var parentExtentH = layoutModel.margintop + currentLineY + layoutModel.marginbottom;
                layoutModel.extenth = parentExtentH;
            }

            if(oldExtentW != layoutModel.extentw || oldExtentH != layoutModel.extenth){
                return true;
            }
            else {
                return false;
            }
        }

    })
})(_, $, xfalib);


(function(_, $, xfalib){
    xfalib.view.layout.RowLayout = xfalib.view.layout.LayoutBase.extend({
        initialize : function(){
            xfalib.view.layout.LayoutBase.prototype.initialize.apply(this, arguments);
        },

        measureSize : function(){
            var layoutModel = this.target.layoutModel;
            var lineHeight = 0; //Line Height for current line
            _.each(this.target._normalizedChildViews(), function(childView, index){
//                if(childView.model && childView.model.className == "draw")      //Draw table cells are set to 100% sizes. They can not grow. If moved, they'll overlay border
//                    return;
                if(lineHeight < childView.layoutModel.extenth){
                    lineHeight = childView.layoutModel.extenth;
                }
            }, this);
            //Set extenth for all row cells
            _.each(this.target._normalizedChildViews(), function(childView, index){
                if(childView.layoutModel.extenth != lineHeight){
                    childView.layoutModel.extenth = lineHeight;
                    childView.invalidateDisplay();
                }
            }, this);

            layoutModel.extenth = layoutModel.margintop + lineHeight + layoutModel.marginbottom;

            //in case of rowLayout measure would always return true which means
            // layout algo of table would always be triggered as row does not have enough data to compute if any column width changed
            return true;
        }

    })
})(_, $, xfalib);


(function(_, $, xfalib){
    xfalib.view.layout.DataTableRowLayout = xfalib.view.layout.RowLayout.extend({
        initialize : function(){
            xfalib.view.layout.RowLayout.prototype.initialize.apply(this, arguments);
        },

        measureSize : function(){
            //in case of rowLayout measure would always return true which means
            // layout algo of table would always be triggered as row does not have enough data to compute if any column width changed
            return true;
        },

        updateDisplay : function(){
            xfalib.view.layout.RowLayout.prototype.updateDisplay.apply(this, arguments);
            this.$css(this.target.el, {"position":"relative"});
            _.each(this.target._normalizedChildViews(), function(childView){
                var extent = {};
                extent["position"] =  "relative";
                this.$css(childView.el, extent);
                if(childView.layoutModel.borderleft > 2) {
                    this.$css(childView.el, {"border-left-width":childView.layoutModel.borderleft/2.0});
                }
                if(childView.layoutModel.bordertop > 2) {
                    this.$css(childView.el, { "border-top-width":childView.layoutModel.bordertop/2.0});
                }
                if(childView.layoutModel.borderbottom > 2) {
                    this.$css(childView.el, {"border-bottom-width":childView.layoutModel.borderbottom/2.0});
                }
                if(childView.layoutModel.borderright > 2) {
                    this.$css(childView.el, {"border-right-width":childView.layoutModel.borderright/2.0});
                }
            }, this);

        }
    })
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.layout.RightLeftRowLayout = xfalib.view.layout.RowLayout.extend({
        initialize : function(){
            xfalib.view.layout.RowLayout.prototype.initialize.apply(this, arguments);
            this._positioningCssPropertyX = "right";
            this._positioningCssPropertyY = "top";
        },

        _targetPaddingX : function(){
            return this.target._padRight();
        },

        _targetPaddingY : function(){
            return this.target._padTop();
        }
    })
})(_, $, xfalib);



(function(_, $, xfalib){
    xfalib.view.layout.TableLayout = xfalib.view.layout.LayoutBase.extend({
        initialize : function(){
            xfalib.view.layout.LayoutBase.prototype.initialize.apply(this, arguments);
            this._tableCellGrid = [ [] ];
            this.assignedColWidths = this.getOrElse(this.target.layoutModel.columnwidths, []);
            this._columnWidths = this.assignedColWidths.slice();
        },

        /**
         * Returns the Rows in the table by filtering out rows from all the child views
         * @returns Array containing the child views that are rows
         * @private
         */
        _getRows : function () {
            return _.filter(this.target._normalizedChildViews(), function (childView) {
                if (childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW
                        || childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW) {
                    return true;
                } else {
                    return false;
                }
            }, this);
        },

        measureSize : function () {
            var layoutModel = this.target.layoutModel,
                rowViews = this._getRows();

            this._validCellsInRow(rowViews);

            _.each(rowViews, function(rowView, rowIndex){
                _.each(rowView._normalizedChildViews(), function(cellView){
                    var cellLayout = cellView.layoutModel;
                    var colspan = this.getOrElse(cellLayout.colspan, 1);
                    if(colspan == -1)
                        colspan = this._tableCellGrid.length - cellView.effectiveCellIndex; //if colpan is -1, then set it to remaining grid length
                    var lastCellIndex = cellView.effectiveCellIndex + colspan -1;

                    if(!this._tableCellGrid[lastCellIndex]){
                        var lastNonEmptyColIndex = -1;
                        for(var j = lastCellIndex; j>=0; j-- ){
                            if(this._tableCellGrid[j]){
                                lastNonEmptyColIndex = j;
                                break;
                            }
                        }
                        //lastNonEmptyColIndex can not be -1 here. since it should be at least 0
                        //Now copy fill all previous missing column data with lastNonEmptyCol data
                        for(var k = lastNonEmptyColIndex + 1; k <= lastCellIndex ; k++){
                            this._tableCellGrid[k] = this._tableCellGrid[k-1].splice() ;
                        }
                    }
                    //Now add currentCellView to proper location in cell grid
                    for(var i = cellView.effectiveCellIndex; i <= lastCellIndex;  i++){
                        this._tableCellGrid[i][rowIndex] = cellView;
                    }

                    if(this.assignedColWidths[cellView.effectiveCellIndex] > -1){
                        this._columnWidths[cellView.effectiveCellIndex] = this.assignedColWidths[cellView.effectiveCellIndex];
                        return;
                    }
                    else if(this.getOrElse(cellLayout.colspan, 1) == 1){ // use actual colspan
                        //TODO:check if tableCellIndex maintained properly
                        if(cellLayout.extentw > (this._columnWidths[cellView.effectiveCellIndex] || 0))
                            this._columnWidths[cellView.effectiveCellIndex]  = cellLayout.extentw;
                    }
                }, this);
            }, this);

            //Additional pass to adjust columnWidths for columns with colpsan > 1
            _.each(this._tableCellGrid, function(columnCells, colIndex){
                if(this.assignedColWidths[colIndex] > -1)
                    return;
                var colWidth = this._columnWidths[colIndex];
                _.each(columnCells, function(cellView){
                    var colspan = this.getOrElse(cellView.layoutModel.colspan, "1");
                    if(colspan == -1)
                        colspan = this._tableCellGrid.length - cellView.effectiveCellIndex;
                    //If colspan is one, we have already taken care. if this cell still extends beyond this column, we'll handle it later
                    if( colspan == 1 || ((cellView.effectiveCellIndex + colspan -1) != colIndex))
                        return;
                    //For spanned column, compute the with of the cell that lies in this cloumn.
                    var spannedColWidth = cellView.layoutModel.extentw;
                    for(var l = cellView.effectiveCellIndex; l < colIndex; l++){
                        spannedColWidth = spannedColWidth - this._columnWidths[l];
                    }
                    if(spannedColWidth > this._columnWidths[colIndex])
                        this._columnWidths[colIndex] = spannedColWidth;
                }, this);
            }, this);

            //Now update the final computed extentw for cells and rows.
            //Also update measuredx/y for it's cells
            _.each(rowViews, function(rowView, rowIndex){
                var rowPadX = rowView.layout._targetPaddingX();
                var rowPadY = rowView.layout._targetPaddingY();
                var rowWidth = 0;
                _.each(rowView._normalizedChildViews(), function(cellView){
                    var newCellW = this._computeColumnWidth(cellView);
                    if(newCellW != cellView.layoutModel.extentw){
                        cellView.layoutModel.extentw = newCellW;
                        cellView.invalidateDisplay();
                    }
                    cellView.layoutModel.measuredx = rowPadX + rowWidth;
                    cellView.layoutModel.measuredy = rowPadY;
                    rowWidth = rowWidth + cellView.layoutModel.extentw;
                }, this);
                var newRowWidth = rowView.layoutModel.marginleft + rowWidth + rowView.layoutModel.marginright;
                if(rowView.layoutModel.extentw != newRowWidth){
                    rowView.layoutModel.extentw = newRowWidth;
                    rowView.invalidateDisplay();
                }
            }, this);

            //Now update the final computed extentw for table and measuredx/y for it's children
            var tablePadX = this._targetPaddingX();
            var tablePadY = this._targetPaddingY();
            var parentW = 0;
            var parentH = 0;
            _.each(this.target._normalizedChildViews(), function(childView, childIndex){
                if(childView.layoutModel.extentw > parentW){
                    parentW = childView.layoutModel.extentw;
                }
                childView.layoutModel.measuredx = tablePadX;
                childView.layoutModel.measuredy = tablePadY + parentH;
                parentH = parentH + childView.layoutModel.extenth;
            }, this);

            var oldExtentW = layoutModel.extentw;
            var oldExtentH = layoutModel.extenth;
            layoutModel.extentw = layoutModel.marginleft + parentW + layoutModel.marginright;
            layoutModel.extenth = layoutModel.margintop + parentH + layoutModel.marginbottom;
            if(oldExtentW != layoutModel.extentw || oldExtentH != layoutModel.extenth){
                return true;
            }
            else {
                return false;
            }
        },

        _computeColumnWidth : function(cellView){
            var colspan = this.getOrElse(cellView.layoutModel.colspan, 1);
            if(colspan <0){
                colspan = this._columnWidths.length - cellView.tableCellIndex;
            }
            if(cellView.effectiveCellIndex + colspan -1 >= this._columnWidths.length)
                return cellView.layoutModel.extentw;              //should not be the case ever
            else{
                var colWidth = 0;
                for(var i= cellView.effectiveCellIndex; i <= cellView.effectiveCellIndex + colspan -1; i++){
                    colWidth = colWidth + this._columnWidths[i];
                }
                return colWidth;
            }
        },

        _validCellsInRow : function(rowViews) {
            var hiddenChildIndex;
            var index;
            var count =0;

            _.each(rowViews, function(rowView, rowIndex){
                var ChildViews = rowView.childViews;
                hiddenChildIndex = [];
                _.each(ChildViews,function(vChildView, index){
                       if(vChildView.model.presence != "visible") {
                          hiddenChildIndex.push(index);  // keeps the index of hidden fields
                       }
                  },this);


                  for(i=ChildViews.length-1;i>0;i--) {
                     count = 0;
                     _.each(hiddenChildIndex,function(value,index){ // this is to find the number of hidden elements before the given index.
                         if(value < i) count++;
                     },this);
                     ChildViews[i].effectiveCellIndex = ChildViews[i].tableCellIndex - count ; // to calculate the effective cell index for visible fields.
                  }

            },this);
        },

        //layout related functions
        invalidateSize : function(){
            if(!this._layoutManager.isPendingValidateSize(this.target)){ //check isPending to avoid recursion
                _.each(this.target._normalizedChildViews(), function(childView){
                    if(childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW ||
                        childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW){
                        _.each(childView._normalizedChildViews(), function(cellView){
                           cellView.invalidateSize();
                        }, this);
                        childView.invalidateSize();
                    }
                }, this);
                xfalib.view.layout.LayoutBase.prototype.invalidateSize.apply(this, arguments);
            }
        }

    })
})(_, $, xfalib);



(function(_, $, xfalib){

    xfalib.view.layout.DataTableLayout = xfalib.view.layout.TableLayout.extend({

        //for a given id get the list of headers (including row-headers and column-headers)
        //this can be multiple in case we have multiple row/column, or cell spans multiple columns
        //TCH: Table Column Header
        //TRH: Table Row Header
        //TDC: Table Data Cell
        getHeader:function(cellId,dataPresenceTable) {
            // use headers as a Set
            var headers = {};
            _.each(dataPresenceTable, function(row, i) {
                _.each(dataPresenceTable[i], function(column, j) {
                    if(cellId == dataPresenceTable[i][j].substring(4)) {
                        var k, header;
                        for(k=0;k<i;k++) {
                            if(dataPresenceTable[k][j].indexOf("TCH:") == 0) {
                                header = dataPresenceTable[k][j].substring(4);
                                if(!headers.hasOwnProperty(header)) {
                                    headers[header] = true;
                                }
                            }
                        }
                        for(k=0;k<j;k++) {
                            if(dataPresenceTable[i][k].indexOf("TRH:") == 0) {
                                header = dataPresenceTable[i][k].substring(4);
                                if(!headers.hasOwnProperty(header)) {
                                    headers[header] = true;
                                }
                            }
                        }
                    }
                },this);
            },this);
            // convert headers Set into string to be added to headers attribute
            return _.keys(headers).join(" ").trim();
        },


        measureSize: function () {
            //heightTable: contains the height for each row
            //widthTable: contains the width for each cell
            //dataPresenceTable: captures the mapping for header to data cells
            var heightTable = [], widthTable = [], dataPresenceTable = [];

            var layoutModel = this.target.layoutModel;
            //get child of tables which are actually rows
            var rowViews = _.filter(this.target._normalizedChildViews(), function (childView) {
                if (childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW || childView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW)
                    return true;
                else
                    return false;
            }, this);
            this._validCellsInRow(rowViews);

            //identify the number of columns in the table (the first row is the bet to get this as
            // previous row rowspan does not impact it). Add all colspans to get the actual number of columns
            var numColumns = 0;
            _.each(rowViews, function (rowView, rowIndex) {
                _.each(rowView._normalizedChildViews(), function (cellView, cellIndex) {
                    if(rowIndex == 0){
                        numColumns+=this.getOrElse(cellView.layoutModel.colspan, 1);
                    }
                }, this);
                //initilaize the columns to an __empty string, and the end of processing table will not
                //contain any __empty cells
                dataPresenceTable[rowIndex] = [];
                for(var i=0;i<numColumns;i++) {
                    dataPresenceTable[rowIndex][i] = "__empty";
                }
            },this);


            //Populate the dataPresenceTable with the IDs for header and data cell - required to associate the headers
            // with the data cells. Also populate the height tables needed for formatting the table.
            _.each(rowViews, function (rowView, rowIndex) {
                _.each(rowView._normalizedChildViews(), function (cellView, cellIndex) {
                    var cellLayout = cellView.layoutModel;
                    var rowspan = this.getOrElse(cellLayout.rowspan, 1);
                    var colspan = this.getOrElse(cellLayout.colspan, 1);
                    if (colspan == -1) {
                        //if colpan is -1, then set it to remaining grid length
                        colspan = this._tableCellGrid.length - cellView.effectiveCellIndex;
                    }
                    if(rowspan == 1){
                        if(heightTable[rowIndex] == undefined || cellView.layoutModel.extenth > heightTable[rowIndex] ) {
                            heightTable[rowIndex] = cellView.layoutModel.extenth;
                            if(cellView.layoutModel.extenth < cellView.layoutModel.initialh)
                                heightTable[rowIndex] = cellView.layoutModel.initialh;
                        }
                    }
                    var actualColumnIndex = 0;
                    for (var i = 0; i < numColumns; i++) {
                        if(dataPresenceTable[rowIndex][i] == "__empty") {
                            for(var j=0;j<colspan;j++) {
                                for(var k=0;k<rowspan;k++) {
                                    if(cellView.el.nodeName == "TH") {
                                        if(cellView._isPartOfHeaderRow()) {
                                            dataPresenceTable[rowIndex+k][actualColumnIndex+j] = "TCH:"+cellView._id;
                                        } else {
                                            dataPresenceTable[rowIndex+k][actualColumnIndex+j] = "TRH:"+cellView._id;
                                        }
                                    } else {
                                        dataPresenceTable[rowIndex+k][actualColumnIndex+j] = "TDC:"+cellView._id;
                                    }
                                    if(colspan == 1){
                                        if(widthTable[actualColumnIndex] == undefined || cellView.layoutModel.extentw > widthTable[actualColumnIndex] ) {
                                            widthTable[actualColumnIndex] = cellView.layoutModel.extentw;
                                        }
                                    }
                                }
                            }

                            break;
                        } else {
                            actualColumnIndex++;
                        }
                    }
                    layoutModel.extenth = 0;
                    layoutModel.extentw = 0;
                    _.each(heightTable, function(height) {
                        layoutModel.extenth+=height ;
                    });

                    _.each(widthTable, function(width) {
                        layoutModel.extentw+=width;
                    });

                }, this);
            }, this);

            //set the row and cell height from height table to keep all cells symmetric
            //also add the headers attribute to the view
            _.each(rowViews, function (rowView, rowIndex) {
                var rowPadX = rowView.layout._targetPaddingX();
                var rowPadY = rowView.layout._targetPaddingY();
                rowView.layoutModel.extenth =  heightTable[rowIndex];

                //process the info to get row heights, column heights and first cell
                _.each(rowView._normalizedChildViews(), function (cellView, cellIndex) {
                    var headers = this.getHeader(cellView._id,dataPresenceTable);
                    if(headers != "") {
                        cellView.$el.attr('headers', headers);
                    }
                    if(cellView.layoutModel.rowspan == 1) {
                        cellView.layoutModel.extenth =  heightTable[rowIndex]
                            - cellView.layoutModel.bordertop / 2.0
                            - cellView.layoutModel.borderbottom / 2.0;
                        cellView.invalidateDisplay();

                    }

                },this);
            },this);
            return true;
        },

        updateDisplay : function(){
            xfalib.view.layout.TableLayout.prototype.updateDisplay.apply(this, arguments);
            this.$css(this.target.el, {"border-spacing":"0"});
            // LC-3911668 : Safari does not update the display when a DOM change is done in a table:
            if(xfalib.ut.XfaUtil.prototype.isSafari()) {
                this.target.$el.hide().css("height");this.target.$el.show();
            }
        }

    }, this);
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.layout.StaticLayout = xfalib.view.layout.LayoutBase.extend({

        measureSize : function(){
            var growableOffsetH = 0,growableAssignedH,newOffset;
            var initialGrowableBottom = -1;
            var growableView = this.target.growableView;
            var layoutModel = this.target.layoutModel;
            var growF = 0;
            if(!_.isEmpty(growableView)){
              for(var i=0;i<growableView.length;i++) {
                if((growableView[i].layoutModel.extenth - growableView[i].layoutModel.initialh)>0)
                   {
                     growF=i;
                    }
              }

                growableAssignedH = growableView[growF].layoutModel.initialh;
                newOffset = growableView[growF].layoutModel.extenth - growableAssignedH;
                initialGrowableBottom = growableView[growF].layoutModel.extenty + growableAssignedH;

                //bug#3475566, make an exception for first page and render it even if there is no content.
                if(!this.target._forceView() &&
                    growableView[growF].layoutModel.extenth <= (growableView[growF].layoutModel.margintop + growableView[growF].layoutModel.marginbottom)){
                    //All the children of growable subform have either been removed or been hidden. So set it's height to zero as well.
                    growableOffsetH =  - layoutModel.initialh;
                    layoutModel.measureddisplay = "hidden";
                }
                else {
                    if(newOffset > 0 || (!this._xfaViewRegistry().pagingConfig().shrinkPageDisabled &&
                        this.target._formDomRoot().host.numPages > 1)){
                        //If view has overgrown or
                        //pageShrink is enabled and total number of pages are more that one then change the growableOffSet and move everything.
                        growableOffsetH = newOffset;
                        if(newOffset < 0 && this.target instanceof xfalib.view.PageView)  {
                            this.target._formDomRoot().host.pagingManager.autoRenderPage();
                        }
                    }
                    layoutModel.measureddisplay = "block";
                }
            }
            var parentPadLeft = this._targetPaddingX();
            var parentPadTop = this._targetPaddingY();
            var oldExtentH = layoutModel.extenth;
            var containerH = layoutModel.initialh + growableOffsetH;
            _.each(this.target.childViews, function(childView, index){
                childView.layoutModel.measuredx =  parentPadLeft + childView.layoutModel.extentx;
                if(childView.layoutModel.extenty >= initialGrowableBottom){
                    childView.layoutModel.measuredy =  parentPadTop + childView.layoutModel.extenty + growableOffsetH;
                } else {
                    childView.layoutModel.measuredy =  parentPadTop + childView.layoutModel.extenty;
                }
            }, this);

            layoutModel.extenth = containerH;
            if(oldExtentH != layoutModel.extenth){
                return true;
            }
            else {
                return false;
            }
        },

        _getRootView : function(){
            return this._xfaViewRegistry().rootSubformView;
        },

        renderNextPage : function(){
            this._getRootView().renderDeferredPage();
        },

        updateDisplay : function(){
            xfalib.view.layout.LayoutBase.prototype.updateDisplay.apply(this, arguments);
            if(this.getOrElse(this.target, "layoutModel.measureddisplay", "") == "hidden"){
                this.$css(this.target.el, {"display" : "hidden"});
            }
            else {
                this.$css(this.target.el, {"display" : "block"});
            }
        }

    })
})(_, $, xfalib);




(function(_, $, xfalib){
    xfalib.view.layout.SubformSetLayout = xfalib.view.layout.LayoutBase.extend({
        measureSize : function(){
            //Subformset should always return true show that measureSize(0 of parent is called.
            return true;
        },

        invalidateSize : function(){
            if(this.target.parentView){
                this.target.parentView.invalidateSize();
            }
        }

        })
})(_, $, xfalib);




(function(_, $, xfalib){
    xfalib.view.layout.RootSubformLayout = xfalib.view.layout.LayoutBase.extend({
        measureSize : function(){
            return false;
        },

        updateDisplay : function(){
            return;
        }
    })
})(_, $, xfalib);




(function(_, $, xfalib){
    xfalib.view.layout.LayoutManager = xfalib.ut.Class.extend({
        LAYOUT_ERROR_MARGIN : 1,

        initialize : function(){
            xfalib.ut.Class.prototype.initialize.apply(this, arguments);
            this._invalidSizeQ = [];
            this._invalidDisplayQ = [];
            this._validatingSize = false;
            this._validatingDisplay = false;
            this._validationPending = false;
        },

        invalidateSize : function(view){
            if(this._validatingDisplay && view && view instanceof Object){
                xfalib.runtime.xfa.Logger.error("xfaView", "invalidateSize is called while validatingDisplay is running which is an issue. id" + view._id +
                    ", parent id:"+ (view.parentView && (view.parentView instanceof Object)) ? view.parentView._id : view.parentView);
            }

            if(!this._validatingSize && !this._validationPending){
                var that = this;
                this._validationPending = true;
                var timeout = window.setTimeout(function(){
                    that.triggerValidation();
                }, 1);
                xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(timeout);
            }

            var found = this.isPendingValidateSize(view);
            if(!found){
                this._invalidSizeQ.push(view);
            }
        },

        invalidateDisplay : function(view){
            var found = _.find(this._invalidDisplayQ, function(invalidView){
                if(invalidView == view){
                    return true;
                }
            });
            if(!found){
                this._invalidDisplayQ.push(view);
            }
        },

        triggerValidation : function(){
            if(this._validatingSize){
                xfalib.runtime.xfa.Logger.debug("xfaView", "validation is already running");
            }
            this._validationPending = false;
            this._validatingSize = true;
            while(this._invalidSizeQ.length > 0){
                var view = this._invalidSizeQ.shift();
                view._validateSize();
            }
            this._validatingSize = false;
            if (this._xfaViewRegistry().rootSubformView._formDomRoot()._modelInitialize === 'INITIALIZED') {
                this._xfaViewRegistry().rootSubformView._formDomRoot().form.execLayoutReady();
            }

            this._validatingDisplay = true;
            while(this._invalidDisplayQ.length >0){
                var view = this._invalidDisplayQ.shift();
                view._validateDisplay();
            }
            this._validatingDisplay = false;

             if (formBridge && xfalib.globals.highlight)   // highLight newly added fields
                $(formBridge).trigger("xfaLayoutComplete");
        },

        createLayout : function(view){
            var options = {target:view} ;
            if(view instanceof xfalib.view.RootSubformView)
                return new xfalib.view.layout.RootSubformLayout(options);
            else if(view instanceof xfalib.view.PageView )
                return new xfalib.view.layout.StaticLayout(options);
            else if(view instanceof xfalib.view.ContentAreaView)
                return new xfalib.view.layout.TopBottomLayout(options);
            else if(view instanceof xfalib.view.SubformSetView)
                return new xfalib.view.layout.SubformSetLayout(options);
            else if(view.el.nodeName == "TR")
                return new xfalib.view.layout.DataTableRowLayout(options);

            var layout = null;
            switch (view.layoutModel.layout)
            {
                case xfalib.view.LayoutConst.LAYOUT_LEFTRIGHTTOPBOTTOM:
                    layout = new xfalib.view.layout.LeftRightLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTTOPBOTTOM:
                    layout = new xfalib.view.layout.RightLeftLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_TOPBOTTOM:
                    layout = new xfalib.view.layout.TopBottomLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_TABLE:
                    layout = new xfalib.view.layout.TableLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_ROW:
                    layout = new xfalib.view.layout.RowLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW:
                    layout = new xfalib.view.layout.RightLeftRowLayout(options);
                    break;
                case xfalib.view.LayoutConst.LAYOUT_DATATABLE:
                    layout = new xfalib.view.layout.DataTableLayout(options);
                    break;
                default :
                    layout = new xfalib.view.layout.PositionLayout(options);
            }
            return layout;
        },

        isPendingValidateSize : function(view){
            return (this._invalidSizeQ.indexOf(view)  > -1);
        },

        _xfaViewRegistry : function() {
            return window.xfaViewRegistry;    //TODO: remove window dependency
        },
        /*
         * Checks whether any view has any kind of layout activity pending either in measure or update phase.
         */
        isLayoutCycleComplete : function(){
            return !(this._invalidSizeQ.length  > 0 || this._invalidDisplayQ.length > 0);
        }

    })
})(_, $, xfalib);

(function(_, $, xfalib){
    xfalib.view.XfaViewEvent = {
        PRESENCE_CHANGE : "presenceChange",
        EXTENT_CHANGE : "extentChange"
    }
})(_, $, xfalib);

(function(_, $, xfalib){
    xfalib.view.ObjectView = xfalib.ut.EventClass.extend({


        initialize : function(){
            xfalib.ut.EventClass.prototype.initialize.apply(this, arguments);
            this.id = this.options.id;
            this.$el = (this.options.el instanceof $) ? this.options.el : $(this.options.el);
            this.el = this.$el[0];
            this._layoutManager = this._xfaViewRegistry().layoutManager();
        },

        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be prefered to global lookups where possible.
        $: function(selector) {
            return this.$el.find(selector);
        },

        _formDomRoot : function() {
            return xfalib.script.Xfa.Instance; //TODO: Remove singleton dependency
        },

        _bind : function(context, func) {
            return function() {
                return func.apply(context, arguments);
            }
        },

        _xfaViewRegistry : function() {
            return window.xfaViewRegistry;    //TODO: remove window dependency
        },

        _mm2px : function(mmSize){
            return xfalib.view.util.Styles._mm2px(mmSize);
        },

        _convertToPx : function(size){
            return xfalib.view.util.Styles._convertToPx(size);
        },

        getOrElse : xfalib.ut.Class.prototype.getOrElse, //short cut but really needed to avoid duplicate code. May be better way next time.

        jqId: xfalib.ut.XfaUtil.prototype.jqId,

        matchJsonType: xfalib.ut.XfaUtil.prototype.matchJsonType,

        $data : xfalib.ut.XfaUtil.prototype.$data,

        $css : xfalib.ut.XfaUtil.prototype.$css

    });

})(_, $, xfalib);
(function(_, $, xfalib){
    var BaseView = xfalib.view.BaseView =  xfalib.view.ObjectView.extend({

        initialize : function() {
            xfalib.view.ObjectView.prototype.initialize.apply(this, arguments);
            this._id = this.el.id;
            this._initialized = false;
            this.parentView = this.options.parentView;
            this.tableCellIndex = this.options.tableCellIndex || 0;
            this.effectiveCellIndex = 0;
            this.model = null;
            this.layoutModel = null;
            this._invalidSizeFlag = true;
            this._invalidDisplayFlag = true;
            this._resizable = false;
            this.edgePresence = true;
            this.$data(this.el, "xfaView", this);
            if(this._id)
                this.model = this._formDomRoot()._xfaTemplateCache.getModel(this._id);
            if(this.model){
                this.createBorder();
                if(this.model.presence == "visible") {
                    this._initialized = true;
                } else {
                    var that = this;
                    var initHandler = {
                        handleEvent: function(evnt) {
                            if(evnt._property == "presence" && !that._initialized){
                                that._initLayout();
                                if(that._initialized){
                                    that.model.off(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, initHandler);
                                }
                            } else if(that._initialized){
                                //The only case when initHandler can be called even if it's initialized is in case of server side scripts which change presence on server.
                                //but does not call initHandler at that time. So we need to remove initHandler explicitly in next call.
                                that.model.off(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, initHandler);
                            }
                        }
                    };
                    this.model.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, initHandler);
                }
                this.model.on(xfalib.script.XfaModelEvent.DOM_CHANGED, this);


            }

        },

        createBorder : function(){
            var border = this.model.getElement("border",0,true),
                fill,
                color,
                edge;
            if(border){
                if((fill = border.getElement("fill",0,true)) && (color = fill.getElement("color",0,true))
                    && fill.presence!="hidden"
                    && fill.presence !="invisible"
                    ) {
                    color = color.value;
                    if(color == "")
                        color="255,255,255";     // if no color value is specified then fill default color
                    color = "rgb(" + color + ")";
                    $(this.el).css("background-color", color);
                }

                var allEdgeHidden = true,
                index = 0,
                edge;
                while(edge = border.getElement("edge",index,true)) {
                    if(edge.presence!="hidden" &&  edge.presence!="invisible") {
                        allEdgeHidden = false;
                        break;
                    }
                    index++;
                }
                if(border.presence == "visible"
                    && !allEdgeHidden) {
                    var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(border);
                    if(cssStyleObj){
                        this.$css(this.el, cssStyleObj);
                        return;
                    }

                } else {
                    // LC-3910380 : In case border presence or edge presence is invisible or hidden then marking border as none
                    if(border.presence=="hidden"
                        || border.presence=="invisible"
                        || allEdgeHidden){
                            $(this.el).css("border", "none");
                    }
                }
            }
            this.edgePresence = false;
        },

        //generic function to compute css style from the <font> & <para> element of the model
        _getTextStyle : function(referenceModel) {
            var cssStyleObj={};
            var asparaStylesObj = {};

            var fontElement = referenceModel.getElement('font',0,true);
            if(fontElement) {
                cssStyleObj['font-family'] = fontElement.getAttribute('typeface');
                cssStyleObj['font-size']   = this._convertToPx(fontElement.getAttribute('size'));
                cssStyleObj['font-style']  = fontElement.getAttribute('posture');
                cssStyleObj['font-weight'] = fontElement.getAttribute('weight');
                cssStyleObj['text-decoration'] = fontElement.getAttribute('underline') != 0 ? 'underline' : undefined;

                var fill = fontElement.getElement('fill',0,true);
                if(fill) {
                    var color = fill.getElement('color',0,true);
                    var colorValue = color.value;
                    if(colorValue) {
                        cssStyleObj['color'] = 'rgb('+colorValue+')';
                    }
                }
            }

            var para = referenceModel.getElement('para',0,true);
            if(para) {
                if(para.hAlign)  {
                    asparaStylesObj['right']= this._convertToPx(para.marginRight);
                    asparaStylesObj['left']= this._convertToPx(para.marginLeft);
                    asparaStylesObj['overflow']= "hidden";
                    switch(para.hAlign) {
                        case "right":
                            asparaStylesObj['text-align']= "right";
                            break;
                        case "left":
                        case "radix":  //Till now radix is not implemented, it is mapped to the default one i.e left
                            asparaStylesObj['text-align']= "left";
                            break;
                        case "center":
                            asparaStylesObj['text-align']= "center";
                            break;
                        case "justify":
                        case "justifyAll":
                            asparaStylesObj['text-align']= "justify";
                            break;
                    }
                }
                switch(para.vAlign) {
                   case "top":
                       asparaStylesObj['top']= this._convertToPx(para.spaceAbove);
                       break;
                   case "bottom":
                       asparaStylesObj['bottom']= this._convertToPx(para.spaceBelow);
                       break;
                }
                asparaStylesObj['text-indent'] = this._convertToPx(para.textIndent);
            }
            return {fontStyles : cssStyleObj, paraStyles :  asparaStylesObj};
        },

        _convertXFARichToHtml: function(text){
            var value;
            if(text != null)  {
             if(typeof text == 'string' && text[0] != '<') {
                 text = "<span>"+text+"</span>";   // $.replaceWith expects a HTML string
             }

             //--conversion to jQuery obj to handle font-size of span
             var spanText = $(text);
             spanText.find("*").each(function(index, span){
                  if(span.style) {
                      if(span.style.fontSize) {
                        value= xfalib.view.util.Styles._convertToPx(span.style.fontSize)+"px";
                        span.style['font-size'] = span.style.fontSize = value;
                   }
                }
             });

             text= "<span>"+spanText.html()+"</span>";
           }
           return text;
        },

        _initAccessibilityInfo: function() {
            //accessibility info

            if(this.layoutModel.colspan > 1) {
                this.$el.attr("colspan", this.layoutModel.colspan);
            }
            if(this.layoutModel.rowspan > 1) {
                this.$el.attr("rowspan", this.layoutModel.rowspan);
            }

            // TODO - move these table related stuff to table view
            //The below roles are not conflicting with the native accessibility support introduced in DataTables, but
            //not recommended until scripted data element is used (Refer to: http://www.w3.org/TR/aria-in-html/).
            //With the introduction of row-span and row header - the current info is not complete for ARIA-Roles
            //So if native HTML table is being used for render (DataTableLayout, do not add the ARIA-Roles below).
            // - No change required for table as layout for DataTable is  DATA_LAYOUT_TABLE
            // - Do not add accessibility for 'columnheader' or 'gridcell' if node is TH or TR (the check will also avoid the inefficient check)
            // - Do not add the accessibility for 'row' if node is TR
            var nodeName = this.el.nodeName;
            var partOfNativeTable = (nodeName == "TABLE"
                                    || nodeName == "TR"
                                    || nodeName == "TD"
                                    || nodeName == "TH");

            if(!partOfNativeTable) {
                if (this.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_TABLE) {
                    //put grid role
                    this.$el.attr("role", "grid");
                }
                else if (this._isTableHeaderCell()) {
                    this.$el.attr("role", "columnheader");
                }
                else if (this._isTableCell()) {
                    this.$el.attr("role", "gridcell");
                }
                else if (this.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW) {
                    this.$el.attr("role", "row");
                }
                else if (this.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW) {
                    this.$el.attr("role", "row");
                }
            }
            //add role and title to this.$el
            var assist = this.model.getElement("assist", 0, true);
            if(assist && assist.role) {
                //translate XFA roles to HTML5 roles (WAria roles)
                if(assist.role == 'TR' && !partOfNativeTable)
                    this.$el.attr("role", "row");
                else if(assist.role == 'TH'){
                    //do nothing as header info is to be propagated to individual cells
                    //this.$el.attr("role", "row");
                }
                else if(assist.role == 'TF'){
                    //do nothing as header info is to be propagated to individual cells
                    //this.$el.attr("role", "row");
                }
                else if(!partOfNativeTable) {
                    this.$el.attr("role", assist.role);
                }
            }

            if (nodeName === "TABLE") {
                this.$el.attr("aria-label", this._getScreenReaderText());
            }

            // going against xfa spec, on hover show tooltip or speak text or element name, don't show caption as it's already visible
            // assist priority doesn't matter, but selecting none will disable tooltip on hover
            var hoverText = this.getOrElse(assist, "toolTip.value", "") ||
                            this.getOrElse(assist, "speak.value", "")   ||
                            this.getOrElse(this.model, "jsonModel.name", "");

            if (this.getOrElse(assist, "speak.disable", 0) != 1) { // loose compare string value
                this.$el.attr("title", hoverText);
            }

            //add lang parameter
            var lang = this._langFromLocale(this.model.jsonModel.locale);
            if(lang && lang.length > 0){
                this.$el.attr("lang", lang);
            }
        },

        _getScreenReaderText: function(){
        },

        /**
         *
         * @param i
         * @param val
         * @return {String}
         * @private used by XfaDrawView and FieldView
         */
        _adjustTextCoordinate: function(i, val){
            //somehow jquery attr() function cannot read textLength attribute
            var sTextLen = this.getAttribute('textLength');
            if(sTextLen && val && val.length > 2) {
                //remove px
                var textLen = Number(sTextLen.substr(0, sTextLen.length-2));
                var x = Number(val.substr(0, val.length-2));
                //server adjust x for all rtl text content so we need to revert it back for webkit
                x += textLen;
                return x+"px";
            }
        },

        /**
         *
         * @private
         * internal function to extract lang from locale
         */
        _langFromLocale : function(locale) {
            var lang;
            if(locale && locale.length > 0) {
                //locale can be in the form of country_LANG -- en_US
                //Whereas lang attribute of html expects only country code
                var index = locale.indexOf('_');

                if(index != -1){
                    lang = locale.substr(0, index);
                }
                else {
                    lang = locale;
                }

                //leap of faith that lang would be ISO 631 complaint.
            }
            return lang;
        },

        setElement: function(element) {
          this.undelegateEvents();
          this._setElement(element);
          this.delegateEvents();
          return this;
        },

        _setElement: function(el) {
          this.$el = el instanceof $ ? el : $(el);
          this.el = this.$el[0];
        },


        delegateEvents: function(events) {
          var delegateEventSplitter = /^(\S+)\s*(.*)$/;
          events || (events = _.result(this, 'events'));
          if (!events) return this;
          this.undelegateEvents();
          for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) method = this[method];
            if (!method) continue;
            var match = key.match(delegateEventSplitter);
            this.delegate(match[1], match[2], _.bind(method, this));
          }
          return this;
        },

        delegate: function(eventName, selector, listener) {
          this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
          return this;
        },

        undelegateEvents: function() {
          if (this.$el) this.$el.off('.delegateEvents' + this.cid);
          return this;
        },

        _initLayout : function(){
            var presence = this.model ? this.model.presence : "visible";

            if(!this.layoutModel){
                //If layoutmodel has not been initialized, initialize that.
                this._initializeLayoutModel();
            }

            if(this._isPlaceHolderEl() && (presence == "visible" || presence == "invisible")){
                // Currently we are on a placeholder div el (because this element was hidden or inactive). It's time to find the actual element.
                var templateId = (this.model ? this.model._templateId() : this._id) || this._id;
                var actualEl = this._xfaViewRegistry().templateCache().get(templateId, true);
                if(actualEl){
                    // hides the actualEL as the layout is still disturbed, removes the hideElement class on updateDisplay
                    $(actualEl).addClass("hideElement");
                    this.$el.replaceWith(actualEl);
                    this.setElement(actualEl);
                    this.$data(this.el, "xfaView", this);
                    this._initializeLayoutModel(); //need to re-initialize layout model at this point.
                }
                else
                    xfalib.runtime.xfa.Logger.error("xfaView", "Html template could not be found. id:"+this._id+", som:"+this.getOrElse(this.model, "somExpression"));
            }

            if(presence == "visible"){
                var nodeName = "";
                if(this.model){
                    this.model.on(xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED, this);
                    this._initAccessibilityInfo();
                    nodeName = this.model.getAttribute("name");
                }
                // as part of html size reduction, server stopped sending node type and name of the component
                // add classes for the same
                var nodeType = (xfalib.ut.XfaUtil.prototype.$data(this.el, xfalib.view.LayoutConst.XFA_MODEL) ||{})[xfalib.view.LayoutConst.NODE_TYPE];
                if(nodeType)
                    this.$el.addClass(nodeType);
                if(nodeName != null && nodeName.length > 0) {
                    this.$el.addClass(nodeName);
                }
                var extent = this._computeExtent();
                this.$css(this.el, extent);
                this._initialized = true;
            } else{
                //If presence is set to visible then _handlePresenceChange is called as part of sync from subclasses
                // But otherwise we need to explicitlly call _handlePresenceChange here.
                this._handlePresenceChange({newText : presence});
            }
        },

        handleEvent: function(evnt) {
            switch(evnt.name) {
                case xfalib.script.XfaModelEvent.FORM_MODEL_CHANGED:
                    this.handleModelChanged(evnt);
                    break;
                case xfalib.script.XfaModelEvent.DOM_CHANGED:
                    this.handleDomChanged(evnt);
                    break;
                default:
                    /* log an error message */
            }
        },

        handleDomChanged : function(event){
            switch(event._property) {
                case "font.fill.color.value":
                    this._handleFontFillColorValue(event);
                    break;
                case "border.fill.color.value":
                case "textEdit.border.fill.color.value":
                case "numericEdit.border.fill.color.value":
                case "imageEdit.border.fill.color.value":
                case "signature.border.fill.color.value":
                case "dateTimeEdit.border.fill.color.value":
                case "passwordEdit.border.fill.color.value":
                case "choiceList.border.fill.color.value":
                    this._handleBorderFillColorValue(event);
                    break;
                case "border.edge.presence":
                    this._handleBorderEdgePresence(event);
                    break;
                case "border.edge.color.value":
                    this._handleBorderChange(event);
                    break;
                case "border.edge.thickness":
                    this._handleBorderChange(event);
                    break;
                case "border.fill.presence":
                    this._handleBorderFillPresence(event);
                    break;
                case "topInset":
                    this._handleTopInset(event);
                    break;
                case "bottomInset":
                    this._handleBottomInset(event);
                    break;
                case "leftInset":
                    this._handleLeftInset(event);
                    break;
                case "rightInset":
                    this._handleRightInset(event);
                    break;
            }
        },

        handleModelChanged : function(event) {
            if (event._property == "presence") {
                this._handlePresenceChange(event);
            } else if (event._property == "access") {
                this._handleAccessChange(event);
            }else if (event._property == "relevant")  {
                this._handleRelevantChange(event);
            }
        },

        _handleRelevantChange : function(event) {
//				xfa.Logger.debug("[_handlePresenceChange]presence:som"
//						+ event.newText + ":" + this.$el.data("som"));
            switch (event.newText) {
                case "+print":
                case "print" :
                    if(this.model.getAttribute("presence") == "visible")
                        this.el.style.visibility = "hidden" ;
                    break;
                case "-print":
                    if(this.model.getAttribute("presence") == "visible")
                        this.el.style.visibility = "visible";
                    break;
                default:
                    break;
            }
            this.parentView.invalidateSize();
        },

        _handlePresenceChange : function(event) {
//				xfa.Logger.debug("[_handlePresenceChange]presence:som"
//						+ event.newText + ":" + this.$el.data("som"));
            switch (event.newText) {
            case "visible":
                if(this.model.getAttribute("relevant") == "print" || this.model.getAttribute("relevant") == "+print")
                    this.el.style.visibility = "hidden" ;
                else this.el.style.visibility= "inherit";
                break;
            case "invisible":
                this.el.style.visibility = "hidden";
                break;
            case "hidden":
                this.el.style.visibility = "hidden";
                break;
            default:
                this.el.style.visibility= "inherit";
                break;
            }
            this.parentView.invalidateSize();
        },

        _handleRightInset : function(event) {
        },

        _handleBottomInset : function(event) {
            /*var bottomInset = parseFloat(event.prevText) ;
             if(bottomInset)  {
             var extent = this._computeExtent();
             extent["margin-bottom"] =  this._mm2px(25.4* bottomInset) ;
             this.layoutModel.marginbottom = extent["margin-bottom"];
             this._invalidDisplayFlag = true;
             this._validateDisplay();
             var a= this.measureSize();
             this.$css(this.el, extent);
             } */

        },

        _handleLeftInset : function(event) {
        },

        _handleTopInset : function(event) {
        },

        _handleFontFillColorValue : function(event) {

        },

        _handleBorderFillColorValue : function(event) {
            var borderFillColorValue = event.prevText;
            var visibility =  this.model.border.fill.presence ;

            if(borderFillColorValue && visibility != "invisible" && visibility != "hidden")  {
                if(borderFillColorValue.indexOf("rgb") == -1)
                    borderFillColorValue = "rgb(" + borderFillColorValue + ")";

                if (_.contains(["textEdit","numericEdit","imageEdit","signature","dateTimeEdit","choiceList",
                        "passwordEdit"], event._property.substring(0,event._property.indexOf('.')))) {
                    $(this.widget).css("background-color", borderFillColorValue);
                } else if( event._property === "border.fill.color.value") {
                    $(this.el).css("background-color", borderFillColorValue);
                }
            }
        },

        _handleBorderEdgePresence : function(event) {
            var visibility = event.prevText;
            var defaultBorder = "1px solid rgb(0, 0, 0)"
            if(visibility == "hidden" || visibility == "invisible") {
                $(this.el).css("border", "none");
            }
            else {
                var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(this.model.border);
                if(cssStyleObj)
                    this.$css(this.el, cssStyleObj);
                else $(this.el).css("border", defaultBorder);
            }


        },

        _handleBorderChange : function(event) {
            var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(this.model.border);
            if(cssStyleObj)
                this.$css(this.el, cssStyleObj);
        },

        _handleBorderFillPresence : function(event) {
            var borderFillPresence = event.prevText;
            var color = this.model.border.fill.color.value;
            if(borderFillPresence == "hidden" || borderFillPresence == "invisible"){
                $(this.el).css("background-color", "rgb(255,255,255)" )
            }
            else {
                if(color.indexOf("rgb") == -1)
                    color = "rgb(" + color + ")";
                $(this.el).css("background-color", color);
            }
        },

        _fillColor : function(color) {
            $(this.el).css("background-color", color)
        },

        _borderColor : function(color) {
            $(this.el).css("borderColor", color)
        },

        _handleAccessChange : function(event) {

        },

        /*
         * This method calls _initLayout in addition to calling original _syncFormToHtml.
         * This is specially useful when using server side scripts and calls deep sync.
         * If you are sure that object has been initialized call _syncFormToHtml else call this method.
         * Other objects(other than *this*) should always call this method insteadOf internal _syncFormToHtml method.
         */
        syncFormNodeToHtml: function(deepSync){
            if(!this._initialized && this._isPlaceHolderEl()){
                //If this is uninitialized placeHolderEl(in case presence is hidden initially and has not been changed since
                // then we want to attempt an _initLayout to check if presence needs to be handled.
                this._initLayout();
                if(!this._initialized && this._isPlaceHolderEl()){
                    //If this is still placeHolderEl then no point of running a sync
                    return;
                }
            }
            this._syncFormNodeToHtml(deepSync);
        },

        _syncFormNodeToHtml : function(deepSync) {
            // TODO : make sync logic better
            if (this.model) {
                this._handlePresenceChange({newText:this.model.presence})  ;
                //this._handleAccessChange({newText:this.model.mEffAccess})      ;
            }
            this.invalidateSize();
        },

        _initializeLayoutModel : function() {
            //In order to minimize the size of html generated, this layoutmodel is generated in a cryptic way
            //here is the mapping between the cryptic variables and explanatory variables.
            //in the interest of readability, preserving the good readable names

            var lm = this.getOrElse(this.$data(this.el, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL, {})
            var layout = {};
            if(this instanceof xfalib.view.ContainerView && !lm.hasOwnProperty(xfalib.view.LayoutConst.SUBFORM_LAYOUT)){
                layout.layout = "position";
            }
            else if(lm.hasOwnProperty(xfalib.view.LayoutConst.SUBFORM_LAYOUT)) {
                layout.layout = lm[xfalib.view.LayoutConst.SUBFORM_LAYOUT]
            }

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_X))
                layout.extentx = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_X]);
            else
                layout.extentx = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_Y))
                layout.extenty = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_Y]);
            else
                layout.extenty = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_MIN_W))
                layout.extentminw = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_MIN_W]);
            else
                layout.extentminw = -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_MIN_H))
                layout.extentminh = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_MIN_H]);
            else
                layout.extentminh = -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_MAX_W))
                layout.extentmaxw = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_MAX_W]);
            else
                layout.extentmaxw = -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_MAX_H))
                layout.extentmaxh = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_MAX_H]);
            else
                layout.extentmaxh = -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_W))
                layout.extentw = Math.max(this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_W]), layout.extentminw);
            else
                layout.extentw =  Math.max(0, layout.extentminw);

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_H))
                layout.extenth = Math.max(this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_H]), layout.extentminh);
            else
                layout.extenth =  Math.max(0, layout.extentminh);

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_ACTUAL_W))
                layout.extentactualw = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_ACTUAL_W]);
            else
                layout.extentactualw =  -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.EXTENT_ACTUAL_H))
                layout.extentactualh = this._mm2px(lm[xfalib.view.LayoutConst.EXTENT_ACTUAL_H]);
            else
                layout.extentactualh =  -1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.MARGIN_TOP))
                layout.margintop = this._mm2px(lm[xfalib.view.LayoutConst.MARGIN_TOP]);
            else
                layout.margintop = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.MARGIN_RIGHT))
                layout.marginright = this._mm2px(lm[xfalib.view.LayoutConst.MARGIN_RIGHT]);
            else
                layout.marginright = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.MARGIN_BOTTOM))
                layout.marginbottom = this._mm2px(lm[xfalib.view.LayoutConst.MARGIN_BOTTOM]);
            else
                layout.marginbottom = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.MARGIN_LEFT))
                layout.marginleft = this._mm2px(lm[xfalib.view.LayoutConst.MARGIN_LEFT]);
            else
                layout.marginleft = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.BORDER_TOP))
                layout.bordertop = this._mm2px(lm[xfalib.view.LayoutConst.BORDER_TOP]);
            else
                layout.bordertop = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.BORDER_RIGHT))
                layout.borderright = this._mm2px(lm[xfalib.view.LayoutConst.BORDER_RIGHT]);
            else
                layout.borderright = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.BORDER_BOTTOM))
                layout.borderbottom = this._mm2px(lm[xfalib.view.LayoutConst.BORDER_BOTTOM]);
            else
                layout.borderbottom = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.BORDER_LEFT))
                layout.borderleft = this._mm2px(lm[xfalib.view.LayoutConst.BORDER_LEFT]);
            else
                layout.borderleft = 0;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.COL_SPAN))
                layout.colspan = +lm[xfalib.view.LayoutConst.COL_SPAN];
            else
                layout.colspan = 1;

            if (lm.hasOwnProperty(xfalib.view.LayoutConst.ROW_SPAN))
                layout.rowspan = +lm[xfalib.view.LayoutConst.ROW_SPAN];
            else
                layout.rowspan = 1;

            if(lm.hasOwnProperty(xfalib.view.LayoutConst.COLUMN_WIDTHS)){
                var colWidths = lm[xfalib.view.LayoutConst.COLUMN_WIDTHS].split(" ");
                var calcWidths = _.map(colWidths,
                    function(colWidth){
                        return this._mm2px(colWidth);
                    },
                    this);
                layout.columnwidths = calcWidths;
            }

            if(this._isTableCell()){
                var columnWidth = -1;
                var tableLayoutModel = this.parentView.parentView.layoutModel;
                if(tableLayoutModel.columnwidths && tableLayoutModel.columnwidths.length >= this.tableCellIndex)
                    columnWidth = tableLayoutModel.columnwidths[this.tableCellIndex];
                if(columnWidth >= 0){
                    layout.extentw = columnWidth;
                    layout.extentactualw = columnWidth;
                    layout.extentminw = 0;
                    layout.extentmaxw = "none";
                }
            }
            layout.initialh = layout.extenth;
            layout.initialw = layout.extentw;

            if(lm.hasOwnProperty(xfalib.view.LayoutConst.CAP_PLACEMENT))
                layout.captionPlacement = lm[xfalib.view.LayoutConst.CAP_PLACEMENT];

            if(lm.hasOwnProperty(xfalib.view.LayoutConst.PAGE_NUMBER))
                layout.pageNumber = lm[xfalib.view.LayoutConst.PAGE_NUMBER];

            this.layoutModel = layout;
            this.resizable = this.layoutModel.extentactualw < 0 ||  this.layoutModel.extentactualh < 0;
        },

        _computeExtent : function() {
            var extent = {} ;
            extent["margin-left"] = this._marginLeft();
            extent["margin-right"] = this._marginRight();
            extent["margin-top"] = this._marginTop();
            extent["margin-bottom"] = this._marginBottom();
            extent["padding-left"] = this._padLeft();
            extent["padding-right"] = this._padRight();
            extent["padding-top"] = this._padTop();
            extent["padding-bottom"] = this._padBottom();
            extent["border-left-width"] = this._subPixelValue(this.layoutModel.borderleft);
            extent["border-right-width"] = this._subPixelValue(this.layoutModel.borderright);
            extent["border-top-width"] = this._subPixelValue(this.layoutModel.bordertop);
            extent["border-bottom-width"] = this._subPixelValue(this.layoutModel.borderbottom);
            extent["-webkit-box-sizing"] = "border-box";
            extent["-moz-box-sizing"] = "border-box";
            extent["box-sizing"] = "border-box";
            extent["position"] = "absolute";
            return extent;
        },

        _padLeft : function() {
            return this.layoutModel.marginleft
                    - this.layoutModel.borderleft / 2;
        },

        _padRight : function() {
            return this.layoutModel.marginright
                    - this.layoutModel.borderright / 2;
        },

        _padTop : function() {
            return this.layoutModel.margintop - this.layoutModel.bordertop / 2;
        },

        _padBottom : function() {
            return this.layoutModel.marginbottom
                    - this.layoutModel.borderbottom / 2;
        },

        _marginLeft : function() {
            return -this.layoutModel.borderleft / 2;
        },

        _marginRight : function() {
            return -this.layoutModel.borderright / 2;
        },

        _marginTop : function() {
            return -this.layoutModel.bordertop / 2;
        },

        _marginBottom : function() {
            return -this.layoutModel.borderbottom / 2;
        },

        _isTableCell : function(){ //Too long check??? Please shorten it.
            if(this.parentView && this.parentView.layoutModel &&
                (this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW || this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW) &&
                this.parentView.parentView && this.parentView.parentView.layoutModel &&
                this.parentView.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_TABLE){
                  return true;
                }
            return false;
        },

        _isTableHeaderCell : function(){ //Too long check??? Please shorten it.
            if(this.parentView && this.parentView.layoutModel &&
                (this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW || this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW) &&
                this.parentView.model.getElement("assist", 0, true) && this.parentView.model.assist.role == "TH"){
                return true;
            }
            return false;
        },


        //For a given cell identify if the cell is part of header row (THEAD)
        _isPartOfHeaderRow : function(){
            if(this.parentView && this.parentView.layoutModel &&
                (this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_ROW || this.parentView.layoutModel.layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTROW) &&
                this.parentView.el.parentNode.nodeName == "THEAD"){
                return true;
            }
            return false;
        },

        $computeWH : function(){
            //private method but still overridden in SubformSetView
            var extent = {};
            //If the field is not initialized(invisible or hidden), then there is no need to set w/h for el. This would automatically be done during initialization via sync
            extent["width"] = this.layoutModel.extentw + this.layoutModel.borderleft/2 + this.layoutModel.borderright/2;
            extent["height"] = this.layoutModel.extenth + this.layoutModel.bordertop/2 + this.layoutModel.borderbottom/2 ;
            return extent;
        },

        _isPlaceHolderEl : function(){
            return this.$data(this.el, "xfaHiddenPH");
        },

        //layout related functions
        invalidateSize : function(){
            this._invalidSizeFlag = true;
            this._layoutManager.invalidateSize(this);
            this.invalidateDisplay();
        },

        invalidateDisplay : function(){
            this._invalidDisplayFlag = true;
            this._layoutManager.invalidateDisplay(this);
        },

        _validateSize : function(recursive){
            if(this._invalidSizeFlag){
                if(this._initialized){
                    var sizeChanged = this.measureSize();
                    if(sizeChanged)
                       this.parentView.invalidateSize();
                }
                this._invalidSizeFlag = false;
            }
        },

        _validateDisplay : function(recursive){
            if(this._invalidDisplayFlag){
                if(this._initialized){
                    this.updateDisplay();
                    this.trigger("layoutComplete");
                }
                this._invalidDisplayFlag = false;
            }
        },

        measureSize : function(){
            var changed = false;
            if(!this.resizable){
                if(this.layoutModel.extenth != this.layoutModel.initialh){
                    this.layoutModel.extenth = this.layoutModel.initialh;
                    changed = true;
                }
                if(this.layoutModel.extentw != this.layoutModel.initialw){
                    this.layoutModel.extentw = this.layoutModel.initialw;
                    changed = true;
                }
            }
            return changed;
        },

        updateDisplay : function(){
            var extent = this.$computeWH();
            this.$css(this.el, extent);
            $(this.el).removeClass("hideElement");
        },

        _subPixelValue : function(value){
            if(value > 0.01)
                return Math.max(value, 1.0);
            else
                return value;
        },

        /*
         * Return the page number containing this view.
         * Note: page number starts with 1 instead of 0
         */
        _pageNumber : function(){
            //Page number is passed as argument to createView and is available in options
            return this.getOrElse(this, "options.pageNumber", -1);
        }

    });

    Object.defineProperty(BaseView.prototype, "resizable", {
        get : function(){
            return this._resizable;
        },

        set : function(sValue){
            this._resizable = sValue;
        }
    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.XfaDrawView = xfalib.view.BaseView.extend({
        $drawChild : null,

        initialize : function(){
            xfalib.view.BaseView.prototype.initialize.apply(this, arguments);
            this._initLayout();
            this._createAccessibilityInfo();
        },

        handleModelChanged : function(event) {
            switch(event._property) {
                case "rawValue" :
                                if(event.jsonModel.newText) {
                                    this._updateView(event.jsonModel.newText);
                                }
                                break;
                default:
                    xfalib.view.BaseView.prototype.handleModelChanged.apply(this,
                        arguments);
            }
        },

        handleDomChanged : function(event) {
             switch(event._property) {
                 case "value.text" :
                 case "value.exData" :
                                    if(event.jsonModel.newText) {
                                        this._updateView(event.jsonModel.newText);
                                    }
                                    break;
                 case "h" ://--we support computation only on line for now.
                                 if(this.getOrElse(this.model, "value.oneOfChild.className", "") === "line"){
                                     this._computeLineHeight();
                                 }
                                 break;
                 default:
                     xfalib.view.BaseView.prototype.handleDomChanged.apply(this,
                          arguments);
            }
        },

        _handleFontFillColorValue : function(event) {
            if(this.model && this.model.value) {
                var content = this.model.value.oneOfChild;
                var htmlText = content.jsonModel._value;
                if(content.getAttribute('contentType') == 'text/html') {
                    var $internalHTML = $('<span>'+htmlText+'</span>');
                    //change the top level element to span to wrap up all the <p>, because it will cause unnecessary paragraph break
                    //add 'display:inline' style
                    //no null check because jQuery is cool!
                    //ToDo: change all your paragraphs into <span> and add a <br> element between them
                    //this will work for few cases where there is one single paragraph in the text or plain text cases.
                    $internalHTML.find("p").eq(0).css('display','inline');
                    this._updateView($internalHTML[0]);
                }
                else
                    this._updateView(htmlText);
            }
            //now check the rawValue and update view based on that rawValue

        },

        _updateView : function(text) {
              if (this._initialized && this.model) {
                  var value = this.model.getElement('value',0, true);
                  if(value) {
                      var  child = value.oneOfChild;
                      if (["text","exData"].indexOf(child.className) !== -1) {
                          var cssObj = this._getTextStyle(this.model);
                          if (cssObj)
                              this.$css(this.el, cssObj.fontStyles);

                          text = xfalib.ut.XfaUtil.prototype.encodeScriptableTags(this._convertXFARichToHtml(text));
                          this.$el.children().replaceWith(text);
                          if (this.el.children[0] && cssObj) {
                              this.$css(this.el.children[0], cssObj.paraStyles);
                          }
                      }
                      else if (child.className === 'image' && text) {//if draw is of type image
                          this.$el.children()[0].setAttribute('src', 'data:;base64,' + text);
                      }
                  }
            }
        },

        _syncFormNodeToHtml : function(val) {
            //in order to save some bytes
            // we don't send xmlns attributes from server so set it here
            var children = this.$el.children(),
                value = null;
            if(children.length)
            {
                if (children[0].tagName === 'svg')
                {
                    children[0].setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    children[0].setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                    children[0].setAttribute('focusable', 'false'); //LC-7105 LC-5444 svg tabIndex doesn't work so adding focusable as false
                    if(this.getOrElse(this.model, "value.oneOfChild.className", "") === 'line'){
                       var pxHeight = xfalib.view.util.Styles._convertToPx(this.model.h);
                       var svgHeight = xfalib.view.util.Styles._convertToPx(children[0].getAttribute('height'));
                       if(svgHeight && pxHeight != svgHeight) {
                           this._computeLineHeight();
                       }
                    }
                }
            }

            if(this.model){
                value = this.model.getElement('value',0, true);
            }
            if(value) {
                var  child = value.oneOfChild;
                if (child._modelChanged === true) { //no need to check it here as updateview checks it anyway
                    var jsonVal = child.jsonValue || child.value; // call to child.value will use typedVal and strip off html tags : LC-5427
                    if (child.className === "image" && jsonVal == null) {
                        //for images, if the value is undefined or null return the href attribute
                        jsonVal = child.href;
                    }
                    this._updateView(jsonVal);
                } else { //for draw do it for the very first time as well
                    if (child.className === 'image') { //if draw is of type image
                        if (child.value) {
                            this.$el.children()[0].setAttribute('src',
                                'data:;base64,' + child.value);
                        } else {
                            this.$el.children()[0].setAttribute('src', child.href);
                        }
                    }
                }
            }

            xfalib.view.BaseView.prototype._syncFormNodeToHtml.apply(this, arguments);
        },

        _computeLineHeight : function() {   //lc-5463
           //-- computing line height
          var children = this.$el.children();
          var lineNode ={};
          if(children[0]) {
             lineNode = children[0].childNodes[0];
          }
          var pxHeight = xfalib.view.util.Styles._convertToPx(this.model.h);
          if(lineNode) {
             //--transforming the code from other units to pixel and changing its type to Numer for further computation
             var x1 = xfalib.view.util.Styles._convertToPx(lineNode.getAttribute('x1'));
             var x2 = xfalib.view.util.Styles._convertToPx(lineNode.getAttribute('x2'));
             var y1 = xfalib.view.util.Styles._convertToPx(lineNode.getAttribute('y1'));
             var y2 = xfalib.view.util.Styles._convertToPx(lineNode.getAttribute('y2'));

             var slope = (y2-y1)/(x2-x1);
             if(!isFinite(slope)) {
                y2 = y1 +  pxHeight;
                lineNode.setAttribute('y2',String(y2 +'px'));
                children[0].setAttribute('height',String(pxHeight +'px'));
                this.layoutModel.extenth = pxHeight ;
                var cssHeight = {};
                cssHeight['height'] = String(pxHeight +'px');
                this.$css(this.el, cssHeight);
             }
           /*if(slope == 0) {
                x2 = x1 +  pxHeight;
             }
             if(isFinite(slope) && slope != 0) {
                x2 = x1 +  pxHeight * Math.sin(Math.atan(slope)) ;
                y2 = y1 -  pxHeight * Math.cos(Math.atan(slope)) ;
             }*/
            // lineNode.setAttribute('x2',String(x2 +'px'));

          }
        },

        _initLayout : function(){
            xfalib.view.BaseView.prototype._initLayout.apply(this, arguments);
            if(this._initialized){
                var drawType = this.getOrElse(this.$data(this.el, xfalib.view.LayoutConst.XFA_MODEL)[xfalib.view.LayoutConst.NODE_TYPE], "").toLowerCase();

                if(!$.browser.msie){
                    //All supported browser except IE are not able to gracefully handle 1px svg drawings.
                    // The reason for that, they start draw at grid lines and draw .5px on both sides of gridlines.
                    // Some browsers mix half pixel black with white to produce grey but others may not.
                    // To handle this consistently, we upgrade 1px drawings to 2px for non IE browsers.
                    if(drawType == "line"){
                        this.$('line[stroke-width="1px"]').attr("stroke-width", "2px");
                    }
                    else if(drawType == "rectangle"){
                        this.$('path[stroke-width="1px"]').attr("stroke-width", "2px");
                    }
                }

                if($.browser.webkit || $.browser.chrome || xfalib.ut.Utilities.checkMinMozillaVersion(28)){
                    //chrome handles the rtl text element in a different way.
                    //there is a similar function in FieldView
                    this.$('text[direction="rtl"]').attr('text-anchor', 'end');
                }


                this.$drawChild = $(this._findDrawElement());
                if(drawType == "line"){
                    //For very thin lines less than one pixel, to avoid missing lines, their containing div should be 1px minimum in size
                    if(this.layoutModel.extentw > 0.01 && this.layoutModel.extentw < 1.0)
                        this.layoutModel.extentw  = 1.0;
                    if(this.layoutModel.extenth > 0.01 && this.layoutModel.extenth < 1.0)
                        this.layoutModel.extenth = 1.0;
                }
                if(drawType == "rectangle"){
                    //To avoid missing edges of rectangle, their containing div should be *ceil*ed to next integer. Just heuristic/observation
                    this.layoutModel.extentw = Math.ceil(this.layoutModel.extentw);
                    this.layoutModel.extenth  = Math.ceil(this.layoutModel.extenth);
                }
                this._syncFormNodeToHtml(true);
            }
        },

        _createAccessibilityInfo: function() {
            var screenReaderText = this._getScreenReaderText();
            //add alt for img tags...
            if(screenReaderText && this.$drawChild && this.$drawChild.is("img")){
                this.$drawChild.attr("alt", screenReaderText)
            }
            else if(screenReaderText) {
                $(this).attr("aria-label", screenReaderText)
            }

            // check for heading roles
            var role = this.getOrElse(this.model.getElement("assist"), "role", "");
            if (/^H[1-6]$/.test(role)) {
                this.$el.attr("role", "heading").attr("aria-level", role[1]);
            }
        },

        _getScreenReaderText : function(){
            if (this.model) {
                //find speak priority first ---
                var assist = this.model.getElement("assist", 0, true);
                var screenReaderText;

                var priority = "custom";
                var speak;
                var toolTip;

                if(assist ) {
                    //&& assist.speak && assist.speak.priority
                    speak = assist.getElement("speak", 0, true);
                    toolTip = assist.getElement("toolTip", 0, true);
                    if(speak) {
                        priority = speak.getAttribute('priority');
                    }
                }

                if(priority == "custom") {
                    if(speak) {
                        screenReaderText = speak.value;
                    }
                    else if(toolTip) {
                        screenReaderText = toolTip.value; //LC-6805: tooltip is shown as [Object Object] for text objects
                    }
                    else if(this.model.jsonModel.extras) {
                        screenReaderText = this.model.jsonModel.extras.caption;
                    }
                    else {
                        screenReaderText = this.model.jsonModel.name;
                    }
                }
                else if(priority == "toolTip") {
                    if(toolTip) {
                        screenReaderText = toolTip.value;
                    }
                    else if(this.model.jsonModel.extras) {
                        screenReaderText = this.model.jsonModel.extras.caption;
                    }
                    else {
                        screenReaderText = this.model.jsonModel.name;
                    }
                }
                else if(priority == "name") {
                    screenReaderText = this.model.jsonModel.name;
                }
                 return screenReaderText;

            }
        },

        _computeDrawChildExtent : function(){
            var extent = {};
            var drawType = this.getOrElse(this.$data(this.el, xfalib.view.LayoutConst.XFA_MODEL)[xfalib.view.LayoutConst.NODE_TYPE], "").toLowerCase();
            if(drawType == "text"){
                //This is to avoid truncation of svg text when SVG is larger than containing div.
                //In that case we allow SVG to be large upto extent of 120% of the assigned draw extents
                // Each browser handles svg differently. Below fix works for all supported browser and avoid 20% truncation which would handle most common cases.
                // Actual fix would require exact combined svg height/width calculation probably in XTG side.
                extent["width"] = "120%";
                extent["height"]= "120%";
            } else {
                //Required so that draw do not spill out of their parent div.
                extent["width"] = "100%";
                extent["height"]= "100%";
            }
            return extent;
        },

        _findDrawElement : function(){
            var drawEls = this.$el.children();
            if(drawEls.length >0)
                return drawEls.get(0);
        },

        updateDisplay : function(){
            xfalib.view.BaseView.prototype.updateDisplay.apply(this, arguments);
            if(this.$drawChild != null && !this.$drawChild.is("img")) {
                //only set extent if it is not img as img has its own extent
                var drawChildExtent = this._computeDrawChildExtent();
                //do this only if
                if(this.$drawChild.length)
                    this.$css(this.$drawChild.get(0), drawChildExtent);

            }
        }

    });
})(_, $, xfalib);
(function(_, $, xfalib){
    var btwn = xfalib.ut.XfaUtil.prototype.btwn;

    xfalib.view.FieldView =  xfalib.view.BaseView.extend({
        //list of RTL languages
        _rtlLang:{he : "he", ar : "ar"},

        _addOns:{
            "x-scribble-add-on":"ScribbleImageField"
        },
        initialize : function() {
            xfalib.view.BaseView.prototype.initialize.apply(this, arguments);
            this.captionLayoutModel = null;
            this.widgetLayoutModel = null;
            this.jqWidget = null;
            this.commitEvent = this.options.commitEvent;
            this.commitProperty = this.options.commitProperty;
            this.commitTarget = this.options.commitTarget;
            this.isError = false;

            this.caption = this._findCaption();
            this.widget = this._findWidget();
            if (this.widget) {
                this.createBorderForWidget();
                if(this.commitEvent != null) {
                    $(this.widget).on(this.commitEvent,
                        this._bind(this, this.handleCommit));
                }
                $(this.widget).on(xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT,
                    this._bind(this, this.handleClickEvent));
                $(this.widget).on(xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    this._bind(this, this.handleFocusOut));
                $(this.widget).on(xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    this._bind(this, this.handleChangeEvent));
                $(this.widget).on(xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,
                    this._bind(this, this.handleFocusEvent));
                $(this.widget).on("keypress",
                    this._bind(this, this.handleKeyPressEvent));
                $(this.widget).on(xfalib.ut.XfaUtil.prototype.XFA_PREOPEN_EVENT,
                    $.proxy(this.handlePreOpenEvent, this));
            }
            var that = this;
            if(this.caption) {
                this.$css(this.caption,{"cursor":"default"});
                //add presentation role to caption
                $(this.caption).attr("role", "presentation")
            }
            $(this.$el).on("mousedown", $.proxy(this._handleMouseDown,this))
                       .on("click", function(event) {
                            if(that.model.mEffectiveAccess != "open") {
                               return;
                            }
                            //label is clicked click the widget
                            if(!$(event.target).closest(".widget").length) {
                                that.jqWidget.click();
                            }
                        });
            this._initLayout();
        },

        createBorderForWidget : function(){
            if(this.model){
                var ui = this.model.getElement("ui", 0,true);
                var fill,color ;
                if(ui) {
                    var border = ui.oneOfChild.getElement("border", 0,true);
                    if(border && border.presence == "visible") {
                        if(this.caption  && parseInt(this.model.caption.getAttribute("reserve"))!=0  && this.model.parent.className !="exclGroup"){
                            var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(border);
                            if(cssStyleObj)
                                this.$css(this.widget, cssStyleObj);
                        } else if(!this.edgePresence  && this.model.parent.className !="exclGroup") {
                            var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(border);
                            if(cssStyleObj)
                                this.$css(this.widget, cssStyleObj);
                        }
                    }
                    if(border && (fill = border.getElement("fill",0,true)) && (color = fill.getElement("color",0,true))
                        && fill.presence!="hidden"
                        && fill.presence !="invisible"
                       ) {
                        var color = color.value;
                        if(color == "")
                            color="255,255,255";  // if no color value is specified then fill default color
                        color = "rgb(" + color + ")";
                        $(this.widget).css("background-color", color);
                    }
                }
            }
        },


        _handleMouseDown: function(event) {
            if( !$(event.target).closest(".widget").length && xfalib.view.FieldView.prototype.currentFocus == this ) {
                this.clickedOnCaption = true;
            }
        },

        _markAccess : function(access) {
            switch(access) {
                case "open" :
                    $(this.widget).removeClass("widgetreadonly");
                    break;
                case "nonInteractive" :
                case "protected" :
                    $(this.widget).addClass("widgetreadonly");
                    break;
                case "readOnly" :
                    $(this.widget).addClass("widgetreadonly");
                    break;
            }
        },

        _initLayout : function(){
            xfalib.view.BaseView.prototype._initLayout.apply(this, arguments);
            if(this._initialized){
                this._initializeFieldChildLayoutAndExtent();
                this._syncFormNodeToHtml(true);
                this.markMandatory();
                this.$css(this.el, {"z-index": 2});
                if(this.caption){
                    //This is to avoid truncation of svg text when SVG is larger than containing div.
                    //In that case we allow SVG to be large upto extent of 120% of the assigned draw extents
                    // Each browser handles svg differently. Below fix works for all supported browser and avoid 20% truncation which would handle most common cases.
                    // Actual fix would require exact combined svg height/width calculation probably in XTG side.
                    var captionSVG = $(this.caption).children("svg").get(0);
                    if(captionSVG){
                        $(captionSVG).attr('focusable', 'false'); //LC-7105 LC-5444 svg tabIndex doesn't work so adding focusable as false
                        var captionChildExtent = {};
                        captionChildExtent["width"] = "120%";
                        captionChildExtent["height"]= "120%";
                        this.$css(captionSVG, captionChildExtent);
                        if($.browser.webkit || $.browser.chrome || xfalib.ut.Utilities.checkMinMozillaVersion(28)){
                            //chrome handles the rtl text element in a different way.
                            //there is a similar function in XfaDrawView
                            $(captionSVG).children('text[direction="rtl"]').attr('x', this._adjustTextCoordinate);

                        }
                    }
                }
                //Invalidate the tab indexes for the page containing this field when this field is initialized.
                //This would just queue the tabbing computation for this particular page.
                this._xfaViewRegistry().invalidateTabIndex(this._pageNumber());
            }
        },

        handlePreOpenEvent: function(event) {
                this.model.execEvent("preOpen");
        },

        handleFocusEvent: function(event) {
            if(!this.clickedOnCaption) {
                this.model._xfa().setSubformFocus(this.model.parentSubform);
                this.model.execEvent("enter");
            }
            this.clickedOnCaption = false; // reset the state
            xfalib.view.FieldView.prototype._setFocusParam(this);
            if(formBridge) {
                if(formBridge.isAnalyticsEnabled) {   //Only computing when analytics enabled
                    var prevFocus=xfalib.view.FieldView.prototype.prevFocus,
                        currFocus=xfalib.view.FieldView.prototype.currentFocus;
                    if(prevFocus){  //if prevFocus is already null then no need to pass SOM Expression
                        prevFocus=prevFocus.model.somExpression;
                    }
                    if(currFocus){ //if currFocus is already null then no need to pass SOM Expression
                        currFocus=currFocus.model.somExpression;
                    }
                    xfalib.ut.XfaUtil.prototype._triggerOnBridge("elementFocusChanged", this.model, "focus", prevFocus, currFocus);
                }
                formBridge.clickedOnWindow = false;
            }
        },

        handleFocusOut : function(event) {
            if(!this.clickedOnCaption) {
                this.model.execEvent("exit");
            }
            if(formBridge && formBridge.clickedOnWindow === true) {
                xfalib.view.FieldView.prototype._setFocusParam(null);
                formBridge.clickedOnWindow = false;
            }
        },

        _setFocusParam : function(currFocus) {
            xfalib.view.FieldView.prototype.prevFocus = xfalib.ut.Class.prototype.getOrElse(xfalib.view.FieldView.prototype.currentFocus, null);
            //To minimize regression impact as "xfalib.view.FieldView.prototype.currentFocus" is used at all the places in the code
            xfalib.view.FieldView.prototype.currentFocus=currFocus;
        },

        handleKeyPressEvent: function(event) {
            var code = event.charCode || event.which || event.keyCode || 0;
            var character = String.fromCharCode(code);

            if(event.key // Moz or IE11
               && !_.contains(['MozPrintableKey','Divide','Multiply','Subtract','Add','Enter','Decimal','Spacebar'],event.key)
               && event.key.length != 1 ) {
                return true;  // Mozilla throws keypress for non char keys as well
            }

            if(this.character != undefined) { // takes care of cases when xfa.event.change is set by user script
                if(this.character == null) {
                    this.jqWidget.option("value",this.jqWidget.option("curValue"));
                    this.jqWidget.option("displayValue",this.jqWidget.option("curValue"));
                }
                else if(this.character != character) {
                    this.jqWidget.option("value",this.current);
                    this.jqWidget.option("displayValue",this.current);
                    event.preventDefault();
                }
                this.character = undefined;
            }
        },

        _syncFormNodeToHtml : function(deepSync) {
            var pluginOptions = this._createPluginOptions();
            if(!this.jqWidget)
                this.createWidgetPlugin(pluginOptions);
            else {
                _.each(pluginOptions, function(value, key){
                    this.jqWidget.option(key, value);
                }, this);
            }
            this._markAccess(this.model.mEffectiveAccess)
            if(this.model.__errorText)
                this._deferredMarkError();
            xfalib.view.BaseView.prototype._syncFormNodeToHtml.apply(this, arguments);
        },

        handleModelChanged : function(event) {
            if (event._property == this.commitTarget) {
                this._handleValueChange(event);
            }
            else{
                switch(event._property) {
                    case "focus":
                        if(navigator.userAgent.match(/iPad/i) != null)    {
                            var top,left;
                            top = this.jqWidget.$userControl.offset().top ;
                            left = this.jqWidget.$userControl.offset().left;
                            window.scrollTo(left,top) ;
                        }
                        this.jqWidget.focus();
                        break;
                    case "ValidationState" :
                        this._markError(event);
                        break;
                    case "change":
                        this._handleEventChangeProperty(event);
                        break;
                    case "ClearError":
                        this._clearError(event);
                        break;
                    case "fillColor":
                        this._fillColor(event.newText);
                        break;
                    default:
                        xfalib.view.BaseView.prototype.handleModelChanged.apply(this,
                            arguments);
                }

            }
        },

        handleDomChanged :function(event){
            switch(event._property) {
                case "font.fill.color.value":
                    this._handleFontFillColorValue(event.prevText);
                    break;
                case "font.posture":
                    this._handleFontPosture(event.prevText);
                    break;
                case "value.maxChars":
                    this._handleMaxChars(event);
                    break;
                case "caption.font.fill.color.value":
                    this._handleCaptionFontFillColorValue(event);
                    break;
                case "nullTest":
                    this._handleNullTest(event, $(this.widget));
                    break;
                default:
                    xfalib.view.BaseView.prototype.handleDomChanged.apply(this, arguments);
            }
        },

        _handleNullTest: function (event, $target) {
            this._handleMandatory(event.newText, $target);
            this._handleDisabled(event);
        },

        _handleMandatory: function (change, $target) {
            if (_.contains(['disabled', 'warning'], change)) {
                $target.attr('data-mandatory', 'false')
                       .removeClass('widgetMandatoryBorder');
            } else if (change === 'error') {
                $target.attr('data-mandatory', 'true')
                       .toggleClass("widgetMandatoryBorder", xfalib.globals.highlight);
            }
        },

        _handleDisabled: function(event){
           var change = event.newText;
           if (change === 'disabled') {
              this._clearError(event);
           }
        },


        _handleCaptionFontFillColorValue :function(event) {
            var childSvg = this.caption.children[0];
            var fill = "rgb(" + event.prevText + ")" ;

            if(childSvg.tagName == "svg" && childSvg.childNodes) {
              _.each(childSvg.childNodes,function(node,index){
                if(node.tagName == 'text') {
                    this.$css(node,{'fill' : fill});
                }
              },this);
            }
        },

        _handleFontFillColorValue : function (value) {
            this.jqWidget.option("color", value);
        },

        _handleFontPosture : function (value) {
            this.jqWidget.option("font-style", value);
        },

        _handleMaxChars : function(event) {
            var maxchars = event.prevText;
            if(maxchars)
                this.jqWidget.option("maxChars",event.prevText);
        },

        handleCommit : function(event) {
            var resizeRqd = false;
            if(this.resizable && this.jqWidget.option("value") != this.model[this.commitTarget])
                resizeRqd = true;
            this.model[this.commitTarget] = this.jqWidget.option("value");
            if(resizeRqd)
                this.invalidateSize();
        },

        handleChangeEvent : function(changeEvent) {
            var current,
                event = changeEvent.originalEvent,
                maxChars = parseInt(this.jqWidget.option("maxChars") || this.jqWidget.option("combCells")) || 0, // to take care for both text & numeric fields
                val = this.jqWidget.option("curValue") || this.jqWidget.option("displayValue") || '',
                selectionStart = event.selectionStart,
                selectionEnd = event.selectionEnd,
                code = event.charCode || event.keyCode || event.which,
                character = event.character || '',
                change,
                fullText;

            if(event.originalType == "cut") {
                change = "";
                if(val) {
                    current = val.substr(0, selectionStart) + val.substr(selectionEnd);
                    fullText = current;
                }
            } else if(event.originalType == "keydown") {
                change = "";

                if(val) {
                    if (code == 8 || code == 46) {  // backSpace or Del
                        if (selectionStart !== selectionEnd) {
                            current = val.substr(0, selectionStart) + val.substr(selectionEnd);
                        } else {
                            if (code == 8) {  // backspace
                                current = val.substr(0, selectionStart - 1) + val.substr(selectionStart);
                            }
                            if (code == 46) {  // del
                                current = val.substr(0, selectionStart) + val.substr(selectionStart + 1);
                            }
                        }
                    }
                } else {
                    current = val;
                }
                fullText = current;
            }
            else { // keypress or paste
                change = character;
                if (maxChars > 0 ) {
                    if (val.length - (selectionEnd - selectionStart) >= maxChars) {
                        change = "";
                    } else {
                        change = character.substr(0, maxChars - val.length + selectionEnd - selectionStart);
                    }
                }

                if (val) {
                    current = val.substr(0, selectionStart) + change + val.substr(selectionEnd);
                    fullText = val.substr(0, selectionStart) + character + val.substr(selectionEnd);

                } else {
                    current = change;
                    fullText = character;
                }

                if( (maxChars !=0 && current.length  > maxChars) || !this.jqWidget.option("lengthLimitVisible") ) {
                    change = "";
                    current = val;
                }

                // LC-6290 : prevent paste from truncating any of the previous text
                if (event.originalType == "paste" &&
                    ((maxChars != 0 && fullText.length > maxChars) || !this.jqWidget.option("lengthLimitVisible"))) { // TODO : take care of multiline selection later
                    var self = this;
                    self.jqWidget.$userControl.one("input", function () {  // wait till the paste action occurs and then replace with correct value
                        self.jqWidget.$userControl.val(current)
                                                  .prop("selectionStart", selectionEnd) // LC-6290 : reset the cursor pos afterwards
                                                  .prop("selectionEnd", selectionEnd);
                    });
                }
            }

            var detail = {
                prevText:val,
                keycode:code,
                modifier:event.ctrlKey,
                keyDown: event.keyDown,
                shift:event.shiftKey,
                change:change,
                newText:current,
                fullText: fullText
            };
            if(!!change || current != val)
                this.model.execEvent("change", detail);
        },

        handleClickEvent : function(event) {
            var prevValue= this.jqWidget.option("value");
            var detail = {
                keycode:event.which,
                modifier:event.ctrlKey,
                shift:event.shiftKey
            };
            this.model.execEvent("click", detail);
        },

        _handleEventChangeProperty : function(event) {
            this.character = event.prevText;
            var prevValue= this.jqWidget.option("curValue") || this.jqWidget.option("displayValue") || "";
            var pos = this.jqWidget.options.pos ;
            this.current = prevValue.substr(0, pos) + this.character + prevValue.substr(pos);
            //var value = this.jqWidget.option("value") || "" ;
            //var displayValue = this.jqWidget.option("displayValue") || ""   ;

        },

        _handleValueChange : function(event) {
            //xfa.Logger.debug("[FieldView._handleValueChange]value:som"
            //        + event.newText + ":" + this.$el.data("som"));
            var resizeRequired =  (this.jqWidget.option("displayValue") != event.newText) && this.resizable ;
            this.jqWidget.option("value",event.prevText);
            this.jqWidget.option("displayValue",event.newText);
            if(resizeRequired){
                this.invalidateSize();
            }
        },

        _markError : function(evnt) {
            //this.$css(this.widget, "background-color","#D3D3D3");
            $(this.widget).addClass("widgetError");
            this.jqWidget.markError(evnt.newText, evnt.prevText);
            this._updateWidgetOption("isValid",false);
        },

        _deferredMarkError : function() {
            //this.$css(this.widget, "background-color","#D3D3D3");
            if(this.model.mandatory == "error")
                $(this.widget).addClass("widgetError");
            this.jqWidget.markError(this.model.__errorText, this.model.mandatory);
            this._updateWidgetOption("isValid",false);
        },

        _clearError : function(evnt) {
            //this.$css(this.widget, "background-color", "white");
            $(this.widget).removeClass("widgetError");
            this.jqWidget.clearError();
            this._updateWidgetOption("isValid",true);
        },

        // for all fields
        _updateWidgetOption: function(optionName, optionValue){
            this.jqWidget.option(optionName, optionValue);
        },

        _handleAccessChange : function(event) {
            //xfa.Logger.debug("[_handleAccessChange]access:som"
            //        + event.newText + ":" + this.$el.data("som"));
            this.jqWidget.option("access",event.newText);
            if(event.newText != event.prevText)
                this._markAccess(event.newText)
        },

        _findWidget : function() {
            if (this.$el.hasClass("widget"))
                return this.$el.get(0);
            else {
                var widgetList = this.$el.find(".widget");
                if (widgetList.length > 0){
                    return widgetList.get(0);
                }
            }
        },
        _findCaption : function() {
            var captionList = $(".caption", this.$el);
            if (captionList.length > 0){
                return captionList.get(0);
            }
        },

        _getParaStyles : function(){
            var paraStyles = {},para;
            para = this.model.getElement("para", 0, true);
            if(para){
                paraStyles = {
                    "text-align" : para.hAlign,
                    "vertical-align" : para.vAlign,
                    "text-indent" : this._convertToPx(para.textIndent),
                    "padding-left" : this._convertToPx(para.marginLeft),
                    "padding-right" : this._convertToPx(para.marginRight),
                    "padding-top" : this._convertToPx(para.spaceAbove),
                    "padding-bottom" : this._convertToPx(para.spaceBelow)
                };
            }
            return paraStyles;
        },

        _createPluginOptions : function() {
            if(this.model){
                var value = this.model[this.commitTarget] || null;
                var screenReaderText;
                screenReaderText = this._getScreenReaderText();
                var tabIndex = 0;
                if(this.model.jsonModel.extras && this.model.jsonModel.extras.tabIndex) {
                    tabIndex = this.model.jsonModel.extras.tabIndex;
                }

                var lang = this._langFromLocale(this.model._getLocale());
                var direction;

                if(lang && this._rtlLang[lang]){
                    direction = "rtl";
                }

                var paraStyles = this._getParaStyles();
                var widgetModel = this.widgetLayoutModel || this.layoutModel;
                return {
                    "name" : this.model.jsonModel.name+""+this._id,
                    "value" : value,
                    "displayValue": this.model.formattedValue,
                    "commitProperty" : this.commitProperty,
                    "access": this.model.mEffectiveAccess,
                    "platform": this.model._xfa().host.platform,
                    "screenReaderText": screenReaderText,
                    /*"tabIndex": tabIndex,*/
                    "paraStyles" : paraStyles,
                    "dir" : direction,
                    "hScrollDisabled" : !this.resizable && this.model.ui.oneOfChild.hScrollPolicy === "off",
                    "height" : widgetModel.extenth + widgetModel.bordertop/2 + widgetModel.borderbottom/2,
                    "commitEvent" : this.commitEvent
                };
            }

        },

        _getScreenReaderText: function () {
            var screenReaderText = "";
            if (this.model) {
                var assist = this.model.getElement("assist", 0, true);
                if (this.getOrElse(assist, "speak.disable", 0) != 1) { // loose compare string value

                    var priority = this.getOrElse(assist, "speak.priority", "speak"),
                        candidates = {
                            "speak": this.getOrElse(assist, "speak.value", ""),
                            "caption": this.getOrElse(this.model, "jsonModel.extras.caption", ""),
                            "toolTip": this.getOrElse(assist, "toolTip.value", ""),
                            "name": this.getOrElse(this.model, "jsonModel.name", "")
                        };

                    screenReaderText = candidates[priority] ||
                                       candidates["speak"] ||
                                       candidates["caption"] ||
                                       candidates["toolTip"] ||
                                       candidates["name"];
                    // CQ-85183 : going against xfa spec (pg 505) prioritise caption over tooltip
                }
            }
            return screenReaderText;
        },


		_instantiateWidget:function(widgetName,options){
		    if (widgetName && widgetName.length > 0) {
                    try{
                        $(this.widget)[widgetName](options);
                        return this.$data(this.widget, widgetName) ||
                               this.$data(this.widget, "xfaWidget-"+widgetName);
                    } catch(exception) {
                        xfalib.runtime.xfa.Logger.error("xfaView", "exception "+exception.message+" in creating user widget. widget:"+widgetName);
                    }
            }
		},
        _createScribbleWidgetOptions:function(options){
            var initParams = this.getOrElse(this.model.ui,"extras.children",null);
            var geoLocParam = _.find(initParams,function(obj){
	            return obj&&obj.name=="geoLocMandatoryOnIpad";    
            });

            var geoLocMandatoryOnIpad = (geoLocParam&&geoLocParam.value) || ( window.formBridge.userConfig
                                         && window.formBridge.userConfig['scribbleImageFieldConfig']
                                         && window.formBridge.userConfig['scribbleImageFieldConfig'].geoLocMandatoryOnIpad );
            return _.extend({
                              geoLocMandatoryOnIpad:geoLocMandatoryOnIpad
                            },options);
        },
        createWidgetPlugin : function(options) {
            var widgetConfig = this._xfaViewRegistry().widgetConfig();
            var widgetName;
			
            if(widgetConfig){
                    widgetName = _.filter(widgetConfig,
                    function(widgetName, selector){
                        if(this.$el.filter(selector).length >0)
                            return true;
                        else
                            return false;
                    },
                    this)[0];
            } 

            this.jqWidget = this._instantiateWidget(widgetName,options);
			
            if(!this.jqWidget){
                var subtype = null;
                var uiExtrasName = this.getOrElse(this,"model.ui.extras.name",null);
                if(uiExtrasName && uiExtrasName.length >= 2 && uiExtrasName.substr(0, 2) == "x-"){
                    subtype = uiExtrasName;
                }
			    if(subtype && this._addOns.hasOwnProperty(subtype)){
                    widgetName = this._addOns[subtype];
					this.jqWidget = this._instantiateWidget(widgetName,this._createScribbleWidgetOptions(options));
                }    
            }
			
            if(!this.jqWidget){
					this._createDefaultWidgetPlugin(options);
			}
            xfalib.runtime.xfa.Logger.debug("xfaView", "creating user widget. widget:" + this.jqWidget._widgetName
            + " for " + this.model.somExpression);
        },

        _createDefaultWidgetPlugin : function(options) {
            $(this.widget).defaultWidget(options);
            this.jqWidget = this.$data(this.widget, "xfaWidget-defaultWidget");
        },

        markMandatory : function(){
            if(this.model.mandatory== "error")
                if(this.widget)
                    $(this.widget).attr("data-mandatory", "true") ;

        },

        _initializeFieldChildLayoutAndExtent : function() {
            if (this.caption) {
                var cView = _.extend({}, xfalib.view.BaseView.prototype, {
                    el : this.caption,
                    $el : $(this.caption)
                });
                xfalib.view.BaseView.prototype._initializeLayoutModel.apply(cView);  //TODO: handle things when moving layout to formDom
                this.captionLayoutModel = cView.layoutModel;
            }
            if (this.widget && this.caption) {
                var wView = _.extend({}, xfalib.view.BaseView.prototype, {
                    el : this.widget,
                    $el : $(this.widget)
                });
                xfalib.view.BaseView.prototype._initializeLayoutModel.apply(wView);
                this.widgetLayoutModel = wView.layoutModel;
            }
        },

        _getMeasurementOptions : function(){
            var widgetModel = this.widgetLayoutModel || this.layoutModel;
            return ({
               refEl : this.jqWidget.$userControl ? this.jqWidget.$userControl.get(0) : null,
               width : (widgetModel.extentw - widgetModel.marginleft - widgetModel.marginright),
               height : (widgetModel.extenth - widgetModel.margintop - widgetModel.marginbottom),
               minWidth : (widgetModel.extentminw>-1)?(widgetModel.extentminw - widgetModel.marginleft - widgetModel.marginright):widgetModel.extentminw,
               minHeight :(widgetModel.extentminh>-1)?(widgetModel.extentminh - widgetModel.margintop - widgetModel.marginbottom):widgetModel.extentminh,
               maxWidth : (widgetModel.extentmaxw > -1)?(widgetModel.extentmaxw - widgetModel.marginleft - widgetModel.marginright):widgetModel.extentmaxw,
               maxHeight :(widgetModel.extentmaxh > -1)?(widgetModel.extentmaxh - widgetModel.margintop - widgetModel.marginbottom):widgetModel.extentmaxh
            });
        },

        measureSize : function(){
            var resized = false;
            if(this.model && this.model.getElement("para", 0, true))     {
                var spaceAbove = this.model.para.spaceAbove;
                var spaceBelow = this.model.para.spaceBelow;
            }
            if(this.resizable){
                var text = (this.model && this.model[this.commitTarget]!= null)? this.model[this.commitTarget] : "";
                var widgetModel = this.widgetLayoutModel || this.layoutModel;
                var measureOptions = this._getMeasurementOptions();
                var measuredExtent = xfalib.view.util.TextMetrics.measureExtent(text, _.clone(measureOptions));
                if(measureOptions.width != measuredExtent.width || measureOptions.height != measuredExtent.height){
                    resized = true;
                    if(measureOptions.width != measuredExtent.width)
                        widgetModel.extentw = widgetModel.marginleft + measuredExtent.width + widgetModel.marginright;
                    if(measureOptions.height != measuredExtent.height)     {
                        var extraSpace = 0;
                        if(spaceAbove)
                            extraSpace += this._convertToPx(spaceAbove);
                        if(spaceBelow)
                            extraSpace += this._convertToPx(spaceBelow);
                        widgetModel.extenth = widgetModel.margintop + measuredExtent.height + widgetModel.marginbottom + extraSpace;
                    }
                    if(this.caption && this.widget && this.model.caption) {
                        switch(this.model.caption.getAttribute("placement")){
                            case "left":
                            case "right":
                                this.layoutModel.extentw  = this.layoutModel.marginleft + this._getCaptionReservedW() + this.widgetLayoutModel.extentw + this.layoutModel.marginright;
                                this.layoutModel.extenth = this.layoutModel.margintop + Math.max(this._getCaptionReservedH(), this.widgetLayoutModel.extenth) + this.layoutModel.marginbottom;
                                break;
                            case "top":
                            case "bottom":
                                this.layoutModel.extentw = this.layoutModel.marginleft + Math.max(this._getCaptionReservedW(), this.widgetLayoutModel.extentw) + this.layoutModel.marginright     ;
                                this.layoutModel.extenth  = this.layoutModel.margintop + this._getCaptionReservedH() + this.widgetLayoutModel.extenth + this.layoutModel.marginbottom;
                                break;
                        }
                    }
                }
            }
            return resized;
        },

        _getCaptionReservedW: function() {
            if(this.caption && this.model.caption){
                switch(this.model.caption.getAttribute("placement")) {
                    case "left" :
                    case "right" :
                        //in case left and right, "reserve" dictates the width of the caption
                        var reserve = this.model.caption.getAttribute("reserve");
                        return (reserve != "-1" ? this._convertToPx(reserve) : 0);
                        break;
                    case "top" :
                    case "bottom" :
                        return this.captionLayoutModel.extentw;
                        break;
                }
            }
            return 0;
        },

        _getCaptionReservedH: function() {
            if(this.caption && this.model.caption){
                switch(this.model.caption.getAttribute("placement")) {
                    case "left" :
                    case "right" :
                        return this.captionLayoutModel.extenth;
                        break;
                    case "top" :
                    case "bottom" :
                        //in case top and bottom, "reserve" dictates the height of the caption
                        var reserve = this.model.caption.getAttribute("reserve");
                        //CQ-102341 : Layout of older forms got disturbes which had no reserve value. So if no reserve is found the older value i.e this.captionLayoutModel.extenth is returned
                        return (this._isReservePresent(reserve) ? this._convertToPx(reserve) : this.captionLayoutModel.extenth);
                        break;
                }
            }
            return 0;
        },

        _isReservePresent: function(reserve) {
            try {
                return !(reserve == "-1" || parseFloat(reserve.replace(/[^-\d\.]/g, '')) == 0);
            } catch(exception) {
                xfalib.runtime.xfa.Logger.warn("xfa","issue with parseFloat of reserve , reserve value :" + reserve);
                return false;
            }
        },

        _calculateDisplay : function(capExtent,wExtent) {
             wExtent["width"] = this.widgetLayoutModel.extentw + this.widgetLayoutModel.borderleft/2 + this.widgetLayoutModel.borderright/2 ;
             wExtent["height"] = this.widgetLayoutModel.extenth + this.widgetLayoutModel.bordertop/2 + this.widgetLayoutModel.borderbottom/2 ;
             switch(this.model.caption.placement) {
               case "left" :
                  capExtent["left"] = this._padLeft();
                  capExtent["top"] = this._padTop();
                  wExtent["left"] = this._padLeft() + this._getCaptionReservedW();
                  wExtent["top"] = this._padTop();
                  break;
               case "right" :
                  capExtent["right"] = this._padRight();
                  capExtent["top"] = this._padTop();
                  wExtent["right"] = this._padRight() + this._getCaptionReservedW();
                  wExtent["top"] = this._padTop();
                  break;
               case "top" :
                  capExtent["left"] = this._padLeft();
                  capExtent["top"] = this._padTop();
                  wExtent["left"] = this._padLeft();
                  wExtent["top"] = this._padTop() + this._getCaptionReservedH();
                  break;
               case "bottom" :
                  capExtent["left"] = this._padLeft();
                  capExtent["bottom"] = this._padBottom();
                  wExtent["left"] = this._padLeft();
                  wExtent["bottom"] = this._padBottom()  + this._getCaptionReservedH();
                  break;
           }
       },

        updateDisplay : function(){
            xfalib.view.BaseView.prototype.updateDisplay.apply(this, arguments);
            if(this.caption && this.widget){
                var parentPadLeft = this._padLeft();
                var parentPadTop = this._padTop();
                var capExtent = {};
                var wExtent = {};
                capExtent["width"] = this.captionLayoutModel.extentw + this.captionLayoutModel.borderleft/2 + this.captionLayoutModel.borderright/2 ;
                capExtent["height"] = this.captionLayoutModel.extenth + this.captionLayoutModel.bordertop/2 + this.captionLayoutModel.borderbottom/2 ;
                this._calculateDisplay(capExtent,wExtent);
                this.jqWidget.option("width",this.widgetLayoutModel.extentw - this.widgetLayoutModel.marginleft - this.widgetLayoutModel.marginright)
                             .option("height",this.widgetLayoutModel.extenth - this.widgetLayoutModel.marginbottom - this.widgetLayoutModel.margintop)
                this.$css(this.caption, capExtent);
                this.$css(this.widget, wExtent);
            }
            else {
                this.jqWidget.option("width",this.layoutModel.extentw - this.layoutModel.marginleft - this.layoutModel.marginright)
                             .option("height",this.layoutModel.extenth - this.layoutModel.marginbottom - this.layoutModel.margintop)
            }
        },

        updateTabIndex : function(newTabIndex){
            this.jqWidget.option("tabIndex", newTabIndex);
        },

        // CQ-102472 : Overriding BaseView _handleBorderChange, as in case of field with no caption, field border color gets assigned to widget border as no caption and field divs are present
        _handleBorderChange : function(event) {
            if (this.caption || this.model.border.edge.getAttribute("thickness", false)) {
                var cssStyleObj = xfalib.view.util.Styles.getStyleForBorder(this.model.border);
                if(cssStyleObj) {
                    this.$css(this.el, cssStyleObj);
                }
            }
        }

    });
})(_, $, xfalib);

(function(_, $, xfalib){
    xfalib.view.CheckButtonFieldView = xfalib.view.FieldView.extend({
       
        initialize : function(){
            xfalib.view.FieldView.prototype.initialize.apply(this, arguments);
        },

        _createDefaultWidgetPlugin :  function(options){
            if(this.model){
                options.size =  this.model.ui.oneOfChild.size;
                options.state = this.model.selectedIndex;
                options.states = this.model.ui.oneOfChild.allowNeutral == "1" ? 3:2;  // #bug=3650920, typeof allowNeutral is string
                $(this.widget).XfaCheckBox(options);
                this.jqWidget = this.$data(this.widget, "xfaWidget-XfaCheckBox");
            }
            else{
                xfalib.view.FieldView.prototype._createDefaultWidgetPlugin.apply(this, [options]);
            }
        },

        /*
        //Note: The screenreader text for exclusion group should not behave differently, and should be aligned to PDF.
        //Reference: CQ-81875 (AEM Forms show radio button name included with tooltip)
        _getScreenReaderText: function() {
            var screenReaderText =  xfalib.view.FieldView.prototype._getScreenReaderText.apply(this),
                screenReaderTextParent;
            if(this.model.parent && this.model.parent._isExclusionGroup()) {
                screenReaderTextParent = this.parentView._getScreenReaderText();
                if(screenReaderTextParent) {
                    screenReaderTextParent = screenReaderTextParent + " " ;
                    if(screenReaderText) {
                        screenReaderText= screenReaderTextParent  +   screenReaderText;
                    } else {
                        screenReaderText = screenReaderTextParent;
                    }
                }
            }
                return  screenReaderText ;

        },
        */
        _handleMouseDown: function(event) {
            if(xfalib.view.FieldView.prototype.currentFocus == this) {
                this.clickedOnCaption = true;
            }
        },

        createBorderForWidget : function(){
        },

        handleChangeEvent : function(event) {
            if(this.model.parent.className == "exclGroup") {
                this.model.parent.execEvent("change");
            }
            this.model.execEvent("change");
        },

        handleClickEvent : function() {
            if(this.model.parent.className == "exclGroup") {
                this.model.parent.execEvent("click");
            }
            this.model.execEvent("click");
        },

        handleDomChanged :function(event){
            switch(event._property) {
                case "allowNeutral":
                    this._handleAllowNeutral(event);
                    break;
                default:
                    xfalib.view.FieldView.prototype.handleDomChanged.apply(this, arguments);
            }
        },

         _calculateDisplay : function(capExtent,wExtent) {
               var size = this._getWidgetReserved();  //-- we are changing the calculations from caption-centric to a widget centric
               this.widgetLayoutModel.extentw = this.widgetLayoutModel.extenth = size;
               var parentExtent = {};
               var paraField = this.model.getElement("para")
               if(paraField)
                 var vAlignWidget = paraField.getAttribute("vAlign");
               parentExtent["width"] = this.layoutModel.extentw + this.layoutModel.borderleft/2 + this.layoutModel.borderright/2 ;
               parentExtent["height"] = this.layoutModel.extenth + this.layoutModel.bordertop/2 + this.layoutModel.borderbottom/2 ;
               wExtent["width"] = this.widgetLayoutModel.extentw + this.widgetLayoutModel.borderleft/2 + this.widgetLayoutModel.borderright/2 ;
               wExtent["height"] = this.widgetLayoutModel.extenth + this.widgetLayoutModel.bordertop/2 + this.widgetLayoutModel.borderbottom/2 ;
               var topBottomPadding = (this.layoutModel.extenth-(this.widgetLayoutModel.extenth + this.captionLayoutModel.extenth))/2;

               switch(vAlignWidget) { // setting the vAlign of the widget equal to its parent. (i.e field)
                 case "bottom":
                        wExtent["bottom"]= this._padBottom();
                        break;
                  case "middle":
                        wExtent["top"] = (this.layoutModel.extenth-size)/2;
                        break;
                  case "top":
                  default:
                        wExtent["top"]= this._padTop();
               }

               switch(this.model.caption.placement) {
                    case "right" :
                        capExtent["left"] = this._padLeft() + size;
                        capExtent["top"] = this._padTop();
                        wExtent["left"] = this._padLeft()
                        break;
                    case "left" :
                        capExtent["right"] = this._padRight() + size;
                        capExtent["top"] = this._padTop();
                        wExtent["right"] = this._padRight();
                        break;
                    case "bottom" :
                        capExtent["left"] = this._padLeft();
                        capExtent["top"] = this._padTop()+ size + topBottomPadding;
                        wExtent["left"] = this._padLeft();
                        wExtent["bottom"]= undefined;
                        wExtent["top"] = this._padTop() + topBottomPadding ;
                        break;
                    case "top" :
                        capExtent["left"] = this._padLeft();
                        capExtent["bottom"] =this._padBottom()+ size + topBottomPadding;
                        wExtent["top"]= undefined;
                        wExtent["left"] = this._padLeft();
                        wExtent["bottom"] = this._padBottom()+ topBottomPadding;
                        break;
               }

               if(capExtent["width"]<(parentExtent["width"] - wExtent["width"])) {
                   switch(this.model.caption.placement) {
                       case "right" :
                           capExtent["left"] =  parentExtent["width"]-capExtent["width"] ;
                           break;
                       case "left" :
                           capExtent["right"] = undefined;
                           capExtent["left"] = this._padLeft();
                           wExtent["right"] = undefined;
                           wExtent["left"] = this._padLeft()+capExtent["width"];
                           break;
                   }
               }
               if(capExtent["height"]<(parentExtent["height"] - wExtent["height"])) {
                   switch(this.model.caption.placement) {
                       case "bottom" :
                           capExtent["top"] = parentExtent["height"]-capExtent["height"];
                           break;
                       case "top" :
                           capExtent["bottom"] = parentExtent["height"]-capExtent["height"];
                           break;
                   }
               }

         },


        _getWidgetReserved: function() {
            if(this.widget ){
                 var size = this.model.ui.oneOfChild.getAttribute("size");
                 return (size != "-1" ? this._convertToPx(size) : 0);
            }
        },

        _handleAllowNeutral : function(event) {
            if(event.prevText) {
                if(event.prevText == "0" && this.model.getItemState(2)) {  // if button was in neutral,
                    this.model.setItemState(1, true);   // set it to off, while disabling allowNeutral
                }
                this.jqWidget.option("allowNeutral", event.prevText);
            }
        },

        _createPluginOptions : function(){
                var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(this, arguments);
            if(this.model) {
                //TODO: used _getDisplayItems. Internal API
                var vItems = _.map(
                    this.model._getDisplayItems() ? this.model._getDisplayItems().moChildNodes: [],
                    function(item, index){
                        return item.value;
                    }, this);
                vOptions.values = vItems;

                if(this.model.parent && this.model.parent._isExclusionGroup()) {
                    //push atleast one of these
                    vOptions.name = this.model.parent.name+""+this.parentView._id;
                }
            }
            return vOptions;
        }
    });

    Object.defineProperty(xfalib.view.CheckButtonFieldView.prototype, "resizable", {
        get : function(){
            return false;
        },

        set : function(sValue){
            //Do Nothing
        }
    });

})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.TextFieldView = xfalib.view.FieldView.extend({
        _createPluginOptions : function() {
            var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(this,
                    arguments);
            vOptions.multiLine = false;
            if (this.model) {
                var ui = this.model.getElement('ui', 0, true);
                var uiChild;

                if(ui) {
                    uiChild = ui.oneOfChild;
                    if(uiChild) {
                        vOptions.multiLine = uiChild.getAttribute("multiLine") == 0 ? false : true;
                    }
                }

                var value = this.model.getElement("value", 0, true);
                if(value) {
                    var valueChild = value.oneOfChild;
                    if(valueChild) {
                        var maxChars = valueChild.getAttribute("maxChars");
                        //note : maxChars/ numberOfCells as zero should be treated as undefined/no restriction
                        vOptions.maxChars = this.getOrElse(maxChars, undefined);
                    }
                }

                if(!vOptions.maxChars){
                    //note : numberOfCells as zero should be treated as undefined/no restriction
                    if(uiChild) {
                        var comb = uiChild.getElement("comb", 0, true);
                        if(comb) {
                            vOptions.maxChars = comb.getAttribute('numberOfCells');
                        }
                    }
                }
                if (!vOptions.fontSize) {
                    var font = this.model.getElement("font", 0, true);
                    if (font) {
                        vOptions.fontSize = this._convertToPx(font.size);
                    }
                }
            }
            return vOptions;
        },

        _createDefaultWidgetPlugin : function(options) {
            $(this.widget).textField(options);
            this.jqWidget = this.$data(this.widget, "xfaWidget-textField");
        },

        _richTextSupport: function(){
           return(this.getOrElse(this.model, "value.oneOfChild.className", null) === "exData"? true:false);
        },

        createWidgetPlugin : function(options) {
            //cm-usecase: adding class to enable rich text widget registration against the class
            if(this._richTextSupport()) {
                this.$el.addClass('richtextsupport');
        }
            xfalib.view.FieldView.prototype.createWidgetPlugin.call(this,
                options);
        },


        _getMeasurementOptions : function() {
           var measureOptions = xfalib.view.FieldView.prototype._getMeasurementOptions.apply(this, arguments);
           // adding this option to check for fields requiring rich text support.
           measureOptions.contentType = this._richTextSupport() ? "text/html":"text/plain";
           measureOptions.skipXSSProtection = $(this.widget).data('skipXSSProtection');
           return measureOptions;
        },

        _getParaStyles : function(){
            var paraStyles = {},para;
            para = this.model.getElement("para", 0, true);
            if(para){
                paraStyles = xfalib.view.FieldView.prototype._getParaStyles.apply(this, arguments);
                paraStyles['line-height']= parseFloat(para.lineHeight)>0? this._convertToPx(para.lineHeight)+"px":"normal";
            }
            return paraStyles;
        }

    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.DateTimeFieldView = xfalib.view.FieldView.extend({

        _createDefaultWidgetPlugin : function(options) {
            if (this.model /*&& xfa.host.platform !== "iPad"*/) {
                $(this.widget).dateTimeEdit(options);
                this.jqWidget = this.$data(this.widget, "xfaWidget-dateTimeEdit");
            } else {
                xfalib.view.FieldView.prototype._createDefaultWidgetPlugin.apply(this,[options]);
            }
        },

        _createPluginOptions : function(){
            var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(this, arguments);
            if(this.model) {
                var locale = this.model.locale;
                vOptions.days = this.model._xfa()._getLocaleSymbols(locale,"calendarSymbols.abbrdayNames");
                vOptions.months = this.model._xfa()._getLocaleSymbols(locale,"calendarSymbols.monthNames");
                vOptions.zero = this.model._xfa()._getLocaleSymbols(locale,"numberSymbols.zero");
                vOptions.clearText = xfalib.locale.Strings.clearText;
                vOptions.$clickable = this.$el;
                vOptions.useNativeWidget = false;
                var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]);
                vOptions.showCalendarIcon = !behaviorConfig.isOn('mfDisableCalendarIcon');

                var editPattern = this.getOrElse(this.model, "ui.picture.value", null);
                if (editPattern) {
                    var parsedPattern = xfalib.ut.PictureUtils.parsePictureClause(editPattern);
                    if (_.isEmpty(parsedPattern) || _.isArray(parsedPattern) && parsedPattern.length > 1) {
                        editPattern = null; // for now fall back to default patterns in case of unsupported / multiple patterns
                        // TODO : make a array of the parsed objects and iter over them in abstract widget : parseEditValue
                    }
                }

                vOptions.editPattern = editPattern;
            }
            return vOptions;
        },

        handleChangeEvent: function(event) {
            //TODO: pass on the correct data
            var detail = {
                newText:null,
                keycode:null,
                modifier:null,
                keyDown:false,
                shift:false,
                change: null
            };
            this.model.execEvent("change", detail);
        }
    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.ImageFieldView = xfalib.view.FieldView.extend({

        _createDefaultWidgetPlugin : function(options) {
            $(this.widget).imageField(options);
            this.jqWidget = this.$data(this.widget, "xfaWidget-imageField");
        },

        _createPluginOptions : function() {
            var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(
                    this, arguments);
            var imageObj = this.getOrElse(this, "model.value.image", null);
            if (imageObj) {
                vOptions.aspect = imageObj.getAttribute("aspect");
            }
            return vOptions;
        },

        initialize : function() {
            xfalib.view.FieldView.prototype.initialize.apply(this, arguments);
        },

        handleChangeEvent : function(changeEvent) {
           this.model.execEvent("change");
        }
    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.ButtonFieldView = xfalib.view.FieldView.extend({
        handleCommit : function(event){
            // xfa.Logger.debug("[ButtonFieldView.handleCommit]som" +
            // this.$el.data("som"));
            // do Nothing
        },

        handleClickEvent : function(event) {
            if(this.jqWidget.option("access") == "open") {
                xfalib.view.FieldView.prototype._setFocusParam(this);
                xfalib.view.FieldView.prototype.handleClickEvent.apply(this,arguments);
                xfalib.ut.XfaUtil.prototype._triggerOnBridge("elementButtonClicked", this.model, "click", this.model.somExpression);
            }
        },

        _handleKeyDown : function(event) {

        },

        handleDomChanged :function(event){
            switch(event._property) {
               case "caption.value.text":
                     this._handleCaptionValueChange(event.newText);
                     break;
               default:
                     xfalib.view.FieldView.prototype.handleDomChanged.apply(this,
                     arguments);
            }
        },

        _handleCaptionValueChange : function(text) {
             var  child = {};
             var caption = this.model.getElement('caption',0, true);
             var value = caption.getElement('value',0, true);

             if(value) {
                 child = value.oneOfChild;
                 if (["text","exData"].indexOf(child.className) !== -1) {
                    var cssObj = this._getTextStyle(caption);
                    if(cssObj) {
                        this.$css(this.caption, cssObj.fontStyles);
                    }
                    this.$css(this.caption, {'display':'table'}); // using this to utilise the css property vertical-align to account for vAlign
                    text=xfalib.ut.XfaUtil.prototype.encodeScriptableTags(this._convertXFARichToHtml(text));
                    $(this.caption.children[0]).replaceWith(text);
                    if(this.caption.children[0] && cssObj) {
                        this.$css(this.caption.children[0], cssObj.paraStyles);
                    }
                 }
             }
        },

        _getTextStyle : function(caption){
            var cssObj=xfalib.view.BaseView.prototype._getTextStyle.apply(this,[caption]);
            var para = caption.getElement('para',0,true);
            if(cssObj && para && para.vAlign) {
               cssObj.paraStyles['vertical-align']= para.vAlign;
               cssObj.paraStyles['display'] = 'table-cell';
            }
            return cssObj;
        },

        _createPluginOptions : function() {
            var pluginOptions = xfalib.view.FieldView.prototype._createPluginOptions.call(this);
            var paraStyles = null;
            if(this.model.getElement("caption", 0, true) && this.model.caption.getElement("para", 0, true)){
                var para = this.model.caption.para;
                paraStyles = {
                    "text-align" : para.hAlign,
                    "vertical-align" : para.vAlign,
                    "text-indent" : this._convertToPx(para.textIndent),
                    "padding-left" : this._convertToPx(para.marginLeft),
                    "padding-right" : this._convertToPx(para.marginRight),
                    "padding-top" : this._convertToPx(para.spaceAbove),
                    "padding-bottom" : this._convertToPx(para.spaceBelow)
                };
            }
            pluginOptions["paraStyles"] = paraStyles;
            pluginOptions["svgCaption"] = this.caption != null;
            return pluginOptions;
        },

        _createDefaultWidgetPlugin :  function(options){
            if(this.model){
                $(this.widget).xfaButton(options);
                this.jqWidget = this.$data(this.widget, "xfaWidget-xfaButton");
            }
            else{
                xfalib.view.FieldView.prototype._createDefaultWidgetPlugin.apply(this, [options]);
            }
        }

    });
})(_, $, xfalib);(function(_, $, xfalib){
    xfalib.view.NumericFieldView = xfalib.view.FieldView.extend({
        _matchArray : { "integer":"^[+-]?\\d*$", "decimal":"^[+-]?\\dld(\\.\\dfd)?$", "float":"^[+-]?\\d*(\\.\\d*)?$" },
        _createPluginOptions : function() {
            var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(
                    this, arguments);
            if (this.model) {
                vOptions.dataType = this.model.value.oneOfChild.className ;
                vOptions.leadDigits = this.model.value.oneOfChild.leadDigits;
                vOptions.fracDigits = this.model.value.oneOfChild.fracDigits;
                vOptions.zero = this.model._xfa()._getLocaleSymbols(this.model.locale,"numberSymbols.zero");
                vOptions.decimal = this.model._xfa()._getLocaleSymbols(this.model.locale,"numberSymbols.decimal");
                //note : numberOfCells as zero should be treated as undefined/no restriction
                var uiChild = this.model.ui.oneOfChild;
                if(uiChild != null && uiChild.getElement("comb", 0, true) != null)
                    vOptions.combCells = this.model.ui.oneOfChild.comb.numberOfCells || undefined;
            }
            return vOptions;
        },

        _createDefaultWidgetPlugin : function(options) {
            if (this.model) {
                $(this.widget).numericInput(options);
                this.jqWidget = this.$data(this.widget, "xfaWidget-numericInput");
            } else {
                xfalib.view.FieldView.prototype._createDefaultWidgetPlugin.apply(this,
                        [options]);
            }
        },

        handleCommit : function(event) {
            var _regex = null;
            var temp = this.jqWidget.option("value") + "";

            var ld = this.model.value.oneOfChild.leadDigits;
            var fd = this.model.value.oneOfChild.fracDigits;

            var matchStr = this._matchArray[this.model.value.oneOfChild.className];

            ld = (ld !== undefined && ~ld) ? "{0,"+ld+"}" : "*";
            fd = (fd !== undefined && ~fd) ? "{0,"+fd+"}" : "*";
            matchStr = matchStr.replace("ld", ld);
            matchStr = matchStr.replace("fd", fd);
            _regex = new RegExp(matchStr, "g");

            if (temp.match(_regex)) // if we need to keep this new	entered value
                xfalib.view.FieldView.prototype.handleCommit.apply(this, arguments);
            else
                 this.jqWidget.option("value",this.model[this.commitTarget]);
        }
    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.ChoiceListFieldView = xfalib.view.FieldView.extend({

        initialize: function () {
            xfalib.view.FieldView.prototype.initialize.apply(this, arguments);
            this._prevSelection = null;
        },

        _valueToArray: function(value) {
            var valueArray;
            if(value != null)
                valueArray = value.split("\n");
            else
                valueArray = [null];
            return valueArray;
        },

        _handleValueChange : function(event){
            //xfa.Logger.debug("[ChoiceListFieldView._handleValueChange]value:som" + event.newText + ":" + this.$el.data("som"));
            var prevText = this.jqWidget.option("displayValue");
            if (_.isArray(prevText)) {
                prevText = prevText.join("\n");
            }
            this._prevSelection = prevText;

            this.jqWidget.option("value",this._valueToArray(event.prevText));
            this.jqWidget.option("displayValue",this._valueToArray(event.newText));
        },

        handleCommit : function(event){
            //xfa.Logger.debug("[ChoiceListFieldView.handleCommit]som" + this.$el.data("som"));
            var val = this.jqWidget.option("value");
            if(_.isArray(val)){
                val = val.join("\n");
            }
            this.model[this.commitTarget] = val;
        },

        _createDefaultWidgetPlugin :  function(options){
            if(this.model)
            {
                if(this.model.ui.oneOfChild.open == 'always' || this.model.ui.oneOfChild.open == 'multiSelect'){
					//do role setting --
                    $(this).attr("role", "listbox"); //find a better place to do this
                    if($.browser.msie || $.browser.mozilla){
                        $(this.widget).nwkListBox(options);
                        this.jqWidget = this.$data(this.widget, "xfaWidget-nwkListBox");
                    }
                    else {
                        $(this.widget).listBox(options);
                        this.jqWidget = this.$data(this.widget, "xfaWidget-listBox");
                    }
                }
                else{
                    $(this.widget).dropDownList(options);
                    this.jqWidget = this.$data(this.widget, "xfaWidget-dropDownList");
                }
            }
            else{
                xfalib.view.FieldView.prototype._createDefaultWidgetPlugin.apply(this, [options]);
            }
        },

        _createPluginOptions : function(){
            var vOptions =  xfalib.view.FieldView.prototype._createPluginOptions.apply(this, arguments);
            if(vOptions.value!=null && !_.isArray(vOptions.value))
            {
                if(_.isString(vOptions.value))
                    vOptions.value = vOptions.value.split("\n");
                else
                    vOptions.value = [vOptions.value]; //convert new value to array
            }
            if(this.model)
            {
                var that = this;
                vOptions.editable =  (this.model.ui.oneOfChild.textEntry == '1');
                vOptions.multiSelect =  (this.model.ui.oneOfChild.open == 'multiSelect');
                var vItems = _.map(this.model._getDisplayItems() ? this.model._getDisplayItems().moChildNodes : [],
                    function(item, index){
                        var saveItem =  that.model.getSaveItem(index);
                        var displayItem = that.model.getDisplayItem(index);
                        return {
                            "save" : saveItem,
                            "display" : displayItem
                        };
                    }
                );
                vOptions.items = vItems;
            }
            return vOptions;
        },
        
        handleModelChanged : function(event) {
            if (event._property == "addItem") {
                this._handleAddItem(event);
            }
            if (event._property == "clearItems") {
                    this._handleClearItems(event);
            }
            if (event._property == "deleteItem") {
                this._handleDeleteItem(event);
        }
            else
                xfalib.view.FieldView.prototype.handleModelChanged.apply(this,
                        arguments);
        },

        handleChangeEvent : function(event) {
            var newValue =  this.jqWidget.option("displayValue");
            if(_.isArray(newValue)) {
                newValue = newValue.join("\n"); // return a string
            }
            var detail = {
                newText:newValue,
                prevText: this._prevSelection,
                keycode:event.which,
                modifier:event.ctrlKey,
                keyDown:event.which===40,
                shift:event.shiftKey,
                change: newValue
            };
            this.model.execEvent("change", detail);
        },
        
        _handleAddItem : function(event) {
        	var itemValues = {
        			sDisplayVal:event.newText,
        			sSaveVal:event.prevText
                };
        	this.jqWidget.addItem(itemValues);
            },
        
        _handleClearItems : function(event) {
        	this.jqWidget.clearItems();
            },
                   
        _handleDeleteItem : function(event) {
        	this.jqWidget.deleteItem(event.newText);
        }

    });
})(_, $, xfalib);
(function(_, $, xfalib){

    xfalib.view.ContainerView = xfalib.view.BaseView.extend({
        initialize : function() {
            xfalib.view.BaseView.prototype.initialize.apply(this, arguments);
            this.layoutTemplate = {};
            this.childViews = [];
            this.layout = null;
            this._initLayout();
        },

        _initLayout : function(){
            xfalib.view.BaseView.prototype._initLayout.apply(this, arguments);
            if(this._initialized){
                this._processLayoutTemplate();
                this.layout = this._layoutManager.createLayout(this);
                if (this.model) {
                    this.model.on(xfalib.script.XfaModelEvent.CHILD_ADDED,this);
                    this.model.on(xfalib.script.XfaModelEvent.CHILD_REMOVED,this);
                    this.model.on(xfalib.script.XfaModelEvent.CHILD_MOVED,this);
                }
                this._syncFormNodeToHtml(true);
            }
        },

        _processLayoutTemplate : function(){
            var xfaTemplateCache = this._formDomRoot()._xfaTemplateCache;
            var htmlTemplateCache = this._xfaViewRegistry().templateCache();
            var that = this;
            var initialFormNode = xfaTemplateCache.getInitialFormDomRef(this._id);
            if(!initialFormNode){
                this.layoutTemplate.hasTemplate = false;
                return;
            } else
                this.layoutTemplate.hasTemplate = true;

            this.$elchildren().each(function() {
                var iChildNode = xfaTemplateCache.getInitialFormDomRef(this.id);
                if(!iChildNode)
                    return;

                var partBegin = true,
                    partSplit = false,
                    partEnd = true;
                var occurrences = that.getOrElse(that.$data(this, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL+"."+xfalib.view.LayoutConst.OCCURRENCES, 1); //occurrences
                var currentOccurence = that.getOrElse(that.$data(this, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.LAYOUT_MODEL+"."+xfalib.view.LayoutConst.OCCUR_INDEX, 0); //occurIndex
                if(currentOccurence != 0){
                    //The part has been split and currentOccurance is not zero. That means this element does not start in the parent layout.
                    partBegin = false; // not really used anywhere
                }
                if((occurrences - currentOccurence) > 1){
                    //This means that this element layout has been split into multiple parts and this part is not last part.
                    partSplit = true;
                    partEnd = false;
                }
                var childTemplateId = xfaTemplateCache.getTemplateRef(iChildNode.extras.htmlId).extras.htmlId;
                that.$data(this, "templateId", childTemplateId); // Set the templateId as actual id may change.
                if(xfalib.ut.XfaUtil.prototype.isTableHF(iChildNode)){
                    //A super hack for #3468407 till we support leader/trailer. For Table Header/Footer we may not have IM before it. So handle exclusively till we fix it
                    that.layoutTemplate[iChildNode.extras.htmlId] = {hasFirstPartBegin : partBegin, hasLastPartOverflow : partSplit};
                }
                else if(iChildNode && that.getOrElse(that.$data(this, xfalib.view.LayoutConst.XFA_MODEL), xfalib.view.LayoutConst.NODE_TYPE ,"").toLowerCase() == "subform"){
                    var instanceIndex = -1;
                    var sfIM = null;
                    var found = _.find(initialFormNode.children, function(initChild){
                        if(that.matchJsonType(initChild, "instanceManager")){
                            sfIM = initChild;
                            instanceIndex = -1;
                            return false;
                        }
                        else {
                            instanceIndex = instanceIndex + 1;
                            if(initChild == iChildNode)
                                return true;
                            else
                                return false;
                        }
                    });
                    if(found){
                        // if repeatable put in cache, along with current occurIndex for later stitching
                        if(iChildNode.extras.htmlId == childTemplateId && sfIM && (parseInt(that.getOrElse(sfIM.max, xfalib.script.Occur.prototype._defaults.max)) < 0 ||
                            parseInt(that.getOrElse(sfIM.min, xfalib.script.Occur.prototype._defaults.min )) < parseInt(that.getOrElse(sfIM.max, xfalib.script.Occur.prototype._defaults.max )))){
                            htmlTemplateCache.put(this.cloneNode(true));
                        }
                        var isLastChild = true;
                        var childIndex = initialFormNode.children.indexOf(iChildNode);
                        if(initialFormNode.children.length > childIndex +1 &&
                            that.matchJsonType(initialFormNode.children[childIndex + 1], "subform")){
                            isLastChild = false;
                        }
                        instanceIndex = instanceIndex + currentOccurence/1000;  // hack, assume at most 1000 instances of a rpt. SF.
                                                                               // the decimal part is used to judge the overflowed part which has split over multiple pages
                        that.layoutTemplate[childTemplateId] = !_.isEmpty(that.layoutTemplate[childTemplateId]) ? that.layoutTemplate[childTemplateId] : {
                            id: childTemplateId,
                            start : instanceIndex,
                            end : instanceIndex,
                            hasFirstPartBegin : partBegin,
                            hasLastPartOverflow : partSplit
                        };
                        that.layoutTemplate[childTemplateId].end = isLastChild && partEnd ? -1 : instanceIndex;
                        that.layoutTemplate[childTemplateId].hasLastPartOverflow = partSplit;
                    }
                } else {
                    that.layoutTemplate[childTemplateId] = {hasFirstPartBegin : partBegin, hasLastPartOverflow : partSplit};
                }
            }) ;
        },

        _syncFormNodeToHtml: function(deepSync){
            var that = this;
            var htmlTemplateCache = this._xfaViewRegistry().templateCache();
            var oldIdToChildViews = {};
            var newIdToChildViews = {};
            var cellIndex = 0;
            var lastSibling = null;

            //cache the old child views against their IDs
            _.each(this.childViews, function(childView){
                oldIdToChildViews[childView.el.id] = childView;
            }, this);

            _.each(this.getOrElse(this, "model.children", []),
                function(childModel){
                    if(!this._validateLayoutTemplate(childModel))
                        return;
                    var cTemplateId = childModel._templateId();
                    var id = childModel.htmlId;
                    var childEl = this.$elchildren(that.jqId(id))[0];
                    if(!childEl && (!newIdToChildViews.hasOwnProperty(cTemplateId) && !oldIdToChildViews.hasOwnProperty(cTemplateId))){
                        childEl = this.$elchildren(that.jqId(cTemplateId))[0];
                    }
                    if(!childEl){
                        if(!this._isHidden(childModel)){
                            var htmlTmplt = htmlTemplateCache.get(cTemplateId, true);
                            if(!htmlTmplt){
                                xfalib.runtime.xfa.Logger.error("xfaView", "Html template could not be found. cTemplateId:"+cTemplateId+", som:"+childModel.somExpression);
                                return;
                            }
                            else{
                                childEl = htmlTmplt;
                            }
                        }
                        else {
                            var xfaHiddenPH = $("<div/>");
                            if(childModel instanceof xfalib.script.Draw){
                                xfaHiddenPH.addClass("draw");
                            }
                            else if(childModel instanceof xfalib.script.Field){
                                xfaHiddenPH.addClass("field");
                            }
                            childEl = xfaHiddenPH.get(0);
                            //TODO: below way of finding nodetype is not always true and may break hidden objects. We will need robust way to get node type that can be used by XfaViewRegistry.nodeTyperegistry.
                            //But for current implementation it would work as we care only about container node types.
                            var elNodeType = childModel.className.toLowerCase();
                            this.$data(childEl, "xfaHiddenPH", true);
                            var xfaModelObj = {};
                            xfaModelObj[xfalib.view.LayoutConst.NODE_TYPE] = elNodeType;
                            this.$data(childEl, xfalib.view.LayoutConst.XFA_MODEL, xfaModelObj);
                        }
                    }
                    childEl.id = childModel.htmlId;

                    this.$data(childEl,"templateId", cTemplateId); //Required for nested template ELs
                    var view = null;
                    if(oldIdToChildViews.hasOwnProperty(childEl.id)) {
                        view = oldIdToChildViews[childEl.id];
                        if(lastSibling && lastSibling.model instanceof xfalib.script.Subform && lastSibling.model.instanceManager._isRepeatable())
                            lastSibling.$el.after(view.$el); //The repeatable subform might have moved using moveInstance. So position it after it's sibling.
                        if(deepSync)
                            view.syncFormNodeToHtml(deepSync); //Sync existing views only if deepSync is requested
                    } else {
                        view = this._createChild(childEl, cellIndex, lastSibling);
                    }
                    cellIndex = cellIndex + (view.layoutModel.colspan || 1); //Add the colspan or one
                    newIdToChildViews[childModel.htmlId] = view;
                    lastSibling = view;
                }, this
            );

            this.childViews = [];
            if (!this.$el.is(":empty")) {
                this.$elchildren().each(function() {
                    if(newIdToChildViews.hasOwnProperty(this.id))
                        that.childViews.push(newIdToChildViews[this.id]);
                    else {
                         xfalib.runtime.xfa.Logger.log("xfaView",5,"removing element as no corresponding form dom node found. id:" + this.id + ", parent id:"+ that._id);
                        $(this).remove();
                    }
                }) ;
            }
            xfalib.view.BaseView.prototype._syncFormNodeToHtml.apply(this, arguments);   //sync other props before layout
        },

        _createChild : function(childEl, cellIndex, previousSibling){
            var view = this._xfaViewRegistry().createView(childEl, {
                    parentView: this,
                    tableCellIndex : cellIndex,
                    pageNumber: this._pageNumber()
                });
//            if(this.resizable || view._isPlaceHolderEl()){
//                //We also need to call layoutContainer for the cases where the object is initially hidden even if parent is not resizable
//                // since we do not have el for hidden object as yet,. TODO: optimize it.
//                view.on(xfalib.view.XfaViewEvent.EXTENT_CHANGE +" "+ window.xfalib.view.XfaViewEvent.PRESENCE_CHANGE,
//                    this._layoutContainer, this);
//            }
            if(this.$el.find(view.$el).length < 1){
                if(previousSibling)
                    previousSibling.$el.after(view.$el);        //Push the element after the sibling
                else
                    this.$el.prepend(view.$el);      //push the element at the begining of parent if no sibling is found,\.
            }
            return view;
        },

        _validateLayoutTemplate : function(childModel){
            var cTemplateId = childModel._templateId();
            if(xfalib.ut.XfaUtil.prototype.isTableHF(childModel)){
                //A super hack for #3468407 till we support leader/trailer. For table Header/Footer, templateId would be this same htmlId.
                cTemplateId = childModel.htmlId;
            }
            if(!this._isPaintable(childModel))
                return false;
            if(this.layoutTemplate.hasTemplate){
                var xfaTemplateCache = this._formDomRoot()._xfaTemplateCache;
                var iChildJson = xfaTemplateCache.getInitialFormDomRef(childModel.htmlId); //find the t0 version of this child
                if(!this.layoutTemplate.hasOwnProperty(cTemplateId) && !this._isHidden(iChildJson))
                    return false; // Here because the page has been split and this childModel is rendered in different page
                else if(!this.layoutTemplate.hasOwnProperty(cTemplateId) && this._isHidden(iChildJson)){
                    //if this child may not present in layout template if it was hidden at t0 becase for hidden containers layout is not generated.
                    //So we need to put extra effort to check if this hidden object fits layout template of this view.
                    var valid = this._validateHiddenChildLayout(childModel);
                    if(valid){
                        //if found validated, cache it for future. Also hidden part are automatically stitched into one part, so hasLastPartOverflow would false
                        this.layoutTemplate[cTemplateId] = {hasFirstPartBegin: true, hasLastPartOverflow : false};
                    }
                    return valid;
                }
                else if(childModel instanceof xfalib.script.Subform &&
                    (childModel.instanceIndex < Math.floor(this.layoutTemplate[cTemplateId].start) ||
                    (childModel.instanceIndex > this.layoutTemplate[cTemplateId].end && this.layoutTemplate[cTemplateId].end > -1))){
                    return false;   //This subform is not in the range of Instances handled by this page. Lying either in earlier or next pages.
                }
            }
            return true;
        },

        _validateHiddenChildLayout : function(childModel){
            if(!childModel.parent)
                return false;       //can happen only for rootsubformview as child model
            var siblings = childModel.parent.children;
            if(siblings && siblings.indexOf(childModel) > 0){
                var childIndex = siblings.indexOf(childModel);
                var lastPaintableSibling = null;
                for(var lastIndex = childIndex-1; lastIndex >=0; lastIndex--){
                    var lastSibling = siblings[lastIndex];
                    if(lastSibling instanceof xfalib.script.InstanceManager){
                        var instanceTemplate = lastSibling._instanceTemplate();
                        var templateId = this.getOrElse(instanceTemplate, "extras.htmlId", null);
                        if(this.layoutTemplate[templateId] != null){
                            if(this.layoutTemplate[templateId].end == -1 && !this.layoutTemplate[templateId].hasLastPartOverflow){
                                //Last layout part of last instance of this IM was here at t0.
                                //So hidden object should come on this page. Else on another page.
                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            continue;   //IM of this hidden sf?.
                    }
                    else if(!this._isPaintable(lastSibling)){
                        continue;
                    }
                    else{
                        lastPaintableSibling = lastSibling;
                        break;
                    }
                }
                if(!lastPaintableSibling){
                    //This hidden child model is first paintable child of this. If this layout element is first part of this model layout
                    // Then hidden child should be painted in this page/view. Else in other view.
                    if(this.getOrElse(this.layoutModel, "occurIndex", 0) == 0)
                        return true;
                    else
                        return false;
                }
                else {
                    //Else if *last part of last paintable sibling* of this hidden node belong to this layout template then this hidden node would also belong here.
                    var lastSiblingValid = this._validateLayoutTemplate(lastPaintableSibling);
                    if(lastSiblingValid){
                        var lastSiblingTemplateId = lastPaintableSibling._templateId();
                        if(!this.layoutTemplate[lastSiblingTemplateId].hasLastPartOverflow)
                            return true;
                        else
                            return false;
                    }
                    else{
                        return false;
                    }
                }
            }
        },

        handleEvent: function(evnt) {
            switch(evnt.name) {
                case xfalib.script.XfaModelEvent.CHILD_ADDED:
                    this.handleChildAdded(evnt);
                    break;
                case xfalib.script.XfaModelEvent.CHILD_REMOVED:
                    this.handleChildRemoved(evnt);
                    break;
                case xfalib.script.XfaModelEvent.CHILD_MOVED:
                    this.handleChildMoved(evnt);
                    break;
                default:
                    xfalib.view.BaseView.prototype.handleEvent.apply(this, arguments);
            }
        },

        handleDomChanged :function(event){
            switch(event._property) {
                default:
                    xfalib.view.BaseView.prototype.handleDomChanged.apply(this,
                        arguments);
            }
        },

        handleModelChanged : function(event) {
            if (event._property == "fillColor") {
                this._fillColor(event.newText);
            }
            else if (event._property == "borderColor") {
                this._borderColor(event.newText);
            }
            /*else if (event._property == "borderWidth") {
                this._borderWidth(event.newText);
            }     */
            else
                xfalib.view.BaseView.prototype.handleModelChanged.apply(this,
                    arguments);
        },

        /*_borderWidth : function(width) {
            $(this.el).css("borderWidth", width)
        },          */

        handleChildAdded : function(event) {
            var addedChild  = event.newText;
            var childTemplateId = addedChild._templateId();
            if(!this.layoutTemplate.hasTemplate || (this.layoutTemplate.hasOwnProperty(childTemplateId) && addedChild.instanceIndex >=  this.layoutTemplate[childTemplateId].start &&
                (this.layoutTemplate[childTemplateId].end < 0 || addedChild.instanceIndex <= this.layoutTemplate[childTemplateId].end))){
                //If added child resides in the range supported by this view, sync it.
                this._syncFormNodeToHtml(false);
            }
            else
                xfalib.runtime.xfa.Logger.debug( "xfaView","This instanceManager has no child in this layout template. This would be handled in other part of splitted subform. el id:"+this._id);
        },

        handleChildMoved : function(event) {
            this._syncFormNodeToHtml(true);
        },

        handleChildRemoved : function(event) {
            var removedChild = event.prevText;
            /*
             * Note/Hack: To get the templateId of removedChild, we can not simply ask child._templateId() as this would return template Id of only those
              * nodes which are still connected to xfa dom. Since remove child is disconnected from xfa, we are asking template Id of this from it's instanceManage
              * which is still there. A workaround for now.
             */
            var childTemplateId = removedChild.instanceManager._instanceTemplate().extras.htmlId;
            if(!this.layoutTemplate.hasTemplate || (this.layoutTemplate.hasOwnProperty(childTemplateId) &&
                (this.layoutTemplate[childTemplateId].end < 0 || removedChild.instanceIndex <= this.layoutTemplate[childTemplateId].end))){
                //If the removed child has instanceIndex less than the end range then there is potential for relayout of this page. So syn it.
                this._syncFormNodeToHtml(false);
            }
            else
                xfalib.runtime.xfa.Logger.debug( "xfaView","This instanceManager has no child in this layout template. This would be handled in other part of splitted subform. el id:"+this._id);
        },

        destroy : function() {
          //TODO: Implement and call destroy method
        },

        _isAnonymous : function() {
            return false;
        },

        _normalizedChildViews : function() {
            var normalizedChildViews = [];
            _.foldl(this.childViews, function(memo, childView, index){
                if(childView instanceof xfalib.view.ContainerView && childView._isAnonymous()){
                    _.each(childView._normalizedChildViews(), function(normalizedChild){
                        memo.push(normalizedChild);
                    });
                }
                else if(!this._isHidden(childView.model)){
                    memo.push(childView);
                }
                return memo;
            }, normalizedChildViews, this);
            return normalizedChildViews;
        },

        _isHidden : function(model){
            //model can be a Node object or simply a json
            if(model && (model.presence == "hidden" || model.presence == "inactive"))
                return true;
            else
                return false;
        },

        _isPaintable : function(model){
            //can this model have visual representation
            if(model && model.isContainer && model.className != "variables")
                return true;
            else
                return false;
        },

        measureSize : function(){
            if(this.layout)
                return this.layout.measureSize();
            else
                return false;
        },

        invalidateSize : function(){
            if(this.layout)
                return this.layout.invalidateSize();
        },

        updateDisplay : function(){
            if(this.layout)
                return this.layout.updateDisplay();
        },

        $elchildren : function(id) {
            return this.$el.children(id);
        }


    });
})(_, $, xfalib);
(function(_, $, xfalib){
    //Intermediate hierarchy to extract out common code for PageView/ContentAreaView/RootSubformView
    xfalib.view.LayoutContainerView = xfalib.view.ContainerView.extend({
        initialize : function(){
            this.growableView = []; // Element that can grow beyond boundary. Current assumption is that there can be only one such element in ContentArea/PageArea
            xfalib.view.ContainerView.prototype.initialize.apply(this, arguments);
        },

        _syncFormNodeToHtml: function(deepSync){
            if(this.childViews == null || this.childViews.length == 0){
                this.childViews = [];
                var that = this;
                var cellIndex = 0;
                if (!this.$el.is(":empty")) {
                    this.childViews = this.$el.children().map(function() {
                        var childView = that._xfaViewRegistry().createView(this, {
                            parentView: that,
                            tableCellIndex : cellIndex,
                            pageNumber: that._pageNumber()
                        });
                        cellIndex = cellIndex + (childView.layoutModel.colspan || 1); //Add the colspan or one
                        if(that._isGrowableView(childView)) {
                            that.growableView.push(childView);
                        }
                        return childView;
                    }).get();
                }
            } else {
                _.each(this.childViews, function(childView){
                    childView.syncFormNodeToHtml(deepSync);
                }, this);
            }
            xfalib.view.BaseView.prototype._syncFormNodeToHtml.apply(this, arguments);   //sync other props before layput
        },

        _isGrowableView :function(childView){
            return false;
        },

        _forceView: function() {
            //this function is to dictate whether the view is forced
            //will be used to force the render of first page at least.
            return false;
        }

    });
})(_, $, xfalib);

(function(_, $, xfalib){
    var SubformView = xfalib.view.SubformView = xfalib.view.ContainerView.extend({
    });

    Object.defineProperty(SubformView.prototype, "resizable", {
        get : function(){
            if(this._resizable)
                return true;
            var layout = this.layoutModel.layout;
            if(layout == xfalib.view.LayoutConst.LAYOUT_LEFTRIGHTTOPBOTTOM || layout == xfalib.view.LayoutConst.LAYOUT_RIGHTLEFTTOPBOTTOM || layout == xfalib.view.LayoutConst.LAYOUT_TOPBOTTOM)
                return true;
            else
                return false;
        },

        set : function(sValue){
            this._resizable = sValue;
        }
    });

})(_, $, xfalib);(function(_, $, xfalib){
    var SubformSetView = xfalib.view.SubformSetView = xfalib.view.ContainerView.extend({
        initialize : function() {
            xfalib.view.ContainerView.prototype.initialize.apply(this, arguments);
        },

        _isAnonymous : function() {
            return true;
        },

        $computeWH : function(){
            var extent = {};
            return extent;
        },

        _computeExtent : function() {
            //mark the position of the subformset as transparent
            var extent = xfalib.view.ContainerView.prototype._computeExtent.apply(this, arguments);
            extent['position'] = 'static';
            return extent
        }
    });
})(_, $, xfalib);(function(_, $, xfalib){
    xfalib.view.ContentAreaView = xfalib.view.LayoutContainerView.extend({
        _isGrowableView :function(childView){
            return (childView.model === this._formDomRoot().form.children[0]); // Is root subform of the form dom
        },

        _initializeLayoutModel : function(){
            xfalib.view.LayoutContainerView.prototype._initializeLayoutModel.apply(this, arguments);
            //Special handling for enabling shrink page functionality. We'll treat contentArea as TopBotton flowable subform.Bug#3608773
            this.layoutModel.extentactualh = -1;
            this.resizable = true;
        }

    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.PageView = xfalib.view.LayoutContainerView.extend({

        initialize : function() {
            xfalib.view.LayoutContainerView.prototype.initialize.apply(this, arguments);
            /* Flag indicating that the tabbing computation for this Page would be redone */
            this._tabComputePending = false;
        },

        _initLayout : function(){
            xfalib.view.LayoutContainerView.prototype._initLayout.apply(this, arguments);
            if(this._initialized){
                /* When a Page View is initialized, immediately mark it for tab compute*/
                this.invalidateTabIndex();
            }
        },

        _forceView: function() {
            //this function is to dictate whether the view is forced
            //will be used to force the render of first page at least.
            return this._pageNumber() == 1;
        },

        _isGrowableView :function(childView){
            return (childView instanceof xfalib.view.ContentAreaView);
        },

        _pageNumber : function(){
            /* Return the page number that was sent from server. Page Number starts with 1.*/
            if(this.layoutModel){
                return this.layoutModel.pageNumber;
            }
            return -1;
        },

        _computeExtent : function(){
            var extent = xfalib.view.LayoutContainerView.prototype._computeExtent.apply(this, arguments);
            extent["position"] = "relative";
            extent["margin-left"] = "auto";               //We need to mark page margins to auto to adjust pages with different master page layout
            extent["margin-right"] = "auto";
            extent["margin-bottom"] = 10;
            extent["margin-top"] = this._pageNumber() == 1 ? 0 : 10 ;
            return extent;
        },

        /*
         * Marks/Queues the Page for re-compute of tab indexes. Re-computation would automatically be fired
         * asynchronously.
         */
        invalidateTabIndex : function(forceCompute) {
            if(!this._tabComputePending || forceCompute){
                /*
                 * Tab compute invalidation sets the tabComputePending flag to true and then fires actual computation async
                 * way in-order for cases where simultaneous in-validations may occur multiple times for different
                 * fields or repeatable subform of the same page. In those cases, we want to compute tab indexes only once when
                 * everything is done.
                 * Another thing, if there is any layout computation pending in layout manager, we defer the tab computation till
                 * that is complete since x,y can change in those cases.
                 **/
                this._tabComputePending = true;
                var that = this;
                xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(
                    window.setTimeout(function(){
                        if(!that._layoutManager.isLayoutCycleComplete()){
                            //layout cycle running so do a force invalidation to defer tab computation to next cycle
                            that.invalidateTabIndex(true);
                        }
                        else{
                            that._computeTabIndex();
                        }
                    }, 1)
                );
            }
        },

        _computeTabIndex : function () {
            this._tabComputePending = false;
            xfalib.view.util.traversalManager._computTabIndex(this);
        }

    });
})(_, $, xfalib);
(function (_, $, xfalib) {
    xfalib.view.RootSubformView = xfalib.view.LayoutContainerView.extend({
        initialize: function () {
            var pagingConfig = this._xfaViewRegistry().pagingConfig();
            this.$el = (this.options.el instanceof $) ? this.options.el : $(this.options.el);
            //make paging default
            if (pagingConfig.pagingDisabled) {
                _.each(this.options.restOfThePages, function (pageEl) {
                    var pageView = this._xfaViewRegistry().createView($(pageEl), {parentView: this});
                    this.$el.append(pageEl);
                    this.childViews = this.childViews || [];
                    this.childViews.push(pageView);
                }, this);

            }
            else if (this.options && this.options.restOfThePages) {
                //do nothing, just mark rest of the pages as deferred pages
                this._deferredPages = this.options.restOfThePages;
            }

            this.totPages = this.getOrElse(this, "options.restOfThePages.length", 0) + 1;  // todo: fix this when initial count is present
//            console.profile("P1");
            xfalib.view.LayoutContainerView.prototype.initialize.apply(this, arguments);
//            console.profileEnd();

            //Bug#3670373: a custom event is triggered after the first page is loaded.
            var _triggerXfaFirstPgLayoutComplete = function () {
                this.childViews[0].off('layoutComplete', _triggerXfaFirstPgLayoutComplete);
                $(window).trigger('xfaFirstPgLayoutComplete');
                this._xfaViewRegistry().scaleForm();
            };
            this.childViews[0].on('layoutComplete', _triggerXfaFirstPgLayoutComplete, this);

            //accessibility
            //add form role to rootSubformView
            this.$el.attr("role", "form");

            //also add lang attribute in it
            //leap of faith -- getting the rootsubform of the form model and then set the lang attribute
            if (xfalib.runtime.form.children[0] && xfalib.runtime.form.children[0].jsonModel && xfalib.runtime.form.children[0].locale) {
                //add lang parameter
                var lang = this._langFromLocale(xfalib.runtime.form.children[0].locale);

                if (lang && lang.length > 0) {
                    this.$el.attr("lang", lang);
                }
            }

        },

        _computeExtent: function () {
            return {};
        },

        renderDeferredPage: function () {
            //assert(userConfig && userConfig.pagingConfig && userConfig.pagingConfig.pagingEnabled);
            if (this.hasMoreDeferredPages()) {                              //just make sure we have more than 10 bytes
                //create dom here
                var nextPageEl = $(this._deferredPages.shift());
                var nextPageView = this._xfaViewRegistry().createView(nextPageEl, {parentView: this});
                this.$el.append(nextPageEl);
                this.childViews = this.childViews || [];
                this.childViews.push(nextPageView);
                xfalib.ut.XfaUtil.prototype._triggerOnBridge("elementPageRendered", xfalib.runtime.xfa.form.form1, "nextPage", this.childViews.length-1, this.childViews.length);
                //this.childViews.length-1 is the page number till which form is already rendered
                //this.childViews.length indicates the page number of current page rendered
                //if(window.highlight)
                //    highlightFields();
                return nextPageView;
            }
            return null;
        },

        hasMoreDeferredPages: function () {
            return (this.getOrElse(this._deferredPages, []).length > 0);
        }
    });
})(_, $, xfalib);
(function(_, $, xfalib){
    xfalib.view.ExclGroupView = xfalib.view.ContainerView.extend({
        initialize : function(){
            xfalib.view.ContainerView.prototype.initialize.apply(this, arguments);
            $(this.$el).on(xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT,
                                         $.proxy(this.handleClickEvent,this));
        },

        handleClickEvent : function() {
            //this.model.execEvent("click");
        },

        _getScreenReaderText : xfalib.view.FieldView.prototype._getScreenReaderText,

        _initLayout : function(){
            xfalib.view.ContainerView.prototype._initLayout.apply(this, arguments);
            if(this._initialized){
                this.markMandatory();
                this.$el.attr("role", "radiogroup"); //add role
            }
        },

        markMandatory : function(){
            if(this.model.mandatory== "error")
                if(this.$el)
                    this.$el.attr("data-mandatory", "true") ;
        },

        handleModelChanged : function(event) {
            switch (event._property) {
                case "ValidationState":
                    this._markError(event);
                    break;
                case "ClearError":
                    this._clearError(event);
                    break;
                default:
                    xfalib.view.ContainerView.prototype.handleModelChanged.apply(this, arguments);
            }
        },

        handleDomChanged: function (event) {
            switch (event._property) {
                case "nullTest":
                    xfalib.view.FieldView.prototype._handleNullTest.call(this, event, this.$el.closest('.exclgroup'));
                    break;
                default:
                    xfalib.view.ContainerView.prototype.handleDomChanged.apply(this, arguments);
            }
        },

        _handleMandatory: xfalib.view.FieldView.prototype._handleMandatory,
        _handleDisabled: xfalib.view.FieldView.prototype._handleDisabled,

        _markError : function(evnt) {
            this.$el.addClass("widgetError");
        },

        _clearError : function(evnt) {
            this.$el.removeClass("widgetError");
        }
    });
})(_, $, xfalib);
/**
 * Created with IntelliJ IDEA.
 * User: rpandey
 * Date: 12/24/12
 * Time: 8:14 PM
 * To change this template use File | Settings | File Templates.
 */
(function(_, $, xfalib){
    xfalib.view.SignatureFieldView = xfalib.view.FieldView.extend({
        _createPluginOptions : function() {
            var vOptions = xfalib.view.FieldView.prototype._createPluginOptions.apply(this,
                arguments);
            return vOptions;
        },

        _createDefaultWidgetPlugin : function(options) {
            $(this.widget).signatureField(options);
            this.jqWidget = this.$data(this.widget, "xfaWidget-signatureField");
        }

    });
})(_, $, xfalib);(function (_, $, xfalib) {

    xfalib.view.PagingManager = xfalib.view.ObjectView.extend({

        initialize: function () {
            xfalib.view.ObjectView.prototype.initialize.call(this);
            this.autoRenderPageHandler = null;
            this._autoPageRenderPending = false;
        },

        renderNextPage: function () {
            var that = this;
            var pageView = this._getRootView().renderDeferredPage();
            if (pageView) {
                pageView.on("layoutComplete",
                    function (event) {
                        that.trigger("newPageRender");
                        this._xfaViewRegistry().scaleForm();
                    }
                );
            }
            return pageView;

        },

        autoRenderPage: function () {
            if (this.autoRenderPageHandler) {
                //Ideally autoRenderPageHandler should be postponed till all running layout/display validation cycles are finished and
                //there is no pending layout validation. For now we are doing it in next script cycle/setTimeout.
                var autoRenderHandler = this.autoRenderPageHandler;
                xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(window.setTimeout(autoRenderHandler, 1));
                this._autoPageRenderPending = false;
            }
            else {
                this._autoPageRenderPending = true;
            }
        },

        setAutoRenderPageHandler: function (value) {
            if (this.autoRenderPageHandler != value) {
                this.autoRenderPageHandler = value;
                if (this.autoRenderPageHandler && this._autoPageRenderPending) {
                    this.autoRenderPage();
                }
            }
        },

        hasMorePages: function () {
            return this._getRootView().hasMoreDeferredPages();
        },

        _getRootView: function () {
            return this._xfaViewRegistry().rootSubformView;
        },

        pageCount: function () {
            return (this._getRootView().totPages || 1);
        },

        _makePage: function (pageNum) {
            if (pageNum > this.pageCount()) {
                pageNum = this.pageCount();
            }
            if (pageNum > this.currentPage()) {
                var extPageCounts = pageNum - this.currentPage();
                for (var i = 0; i < extPageCounts; i++) {
                    this.renderNextPage();
                }
            }
            return true;
        },

        currentPage: function () {
            var b = this._getRootView().childViews;
            if (xfalib.view.FieldView.prototype.currentFocus) {
                var a = $(xfalib.view.FieldView.prototype.currentFocus.el).parents(".page")[0];
                //TODO: Try to do without for Loop
                for (i = 0; i < b.length; i++)
                    if (b[i].el == a)
                        return i;
            }
            return 0;
        },

        pageDown: function () {
            if (this._getRootView().hasMoreDeferredPages()) {
                var pageView = this.renderNextPage();
                this._pageDown(pageView);

            }
            else
                this._pageDown();


        },


        _pageDown: function (pageView) {
            var nextPage = this.currentPage() + 1;
            var a = $($(".page")[nextPage]);
            window.scrollTo(0, a.offset().top);
            pageView.off("layoutComplete",
                function (event) {
                    that._pageDown();
                }
            );
        },

        _makePageForHtmlId: function (htmlId, callback, context) {
            if (htmlId == null)
                return false;
            var nodeSelector = this.jqId(htmlId);
            var rootView = this._getRootView();
            var nodeElArray = rootView.$el.find(nodeSelector);
            if (nodeElArray.length > 0) {
                if (callback)
                    callback.apply(context);
                return true;
            }


            var pageFound = false;
            while (this.hasMorePages()) {
                var view = rootView.renderDeferredPage();
                if (view.$el.find(nodeSelector).length > 0) {
                    if (callback)
//LC-4424 We are sending the event layoutComplete that the layout is complete from our view point but the
// browser has not yet painted the page( Chrome) and hence the focus is coming at the wrong place.
                        view.on("layoutComplete", function () {
                            xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(
                                window.setTimeout(function () {
                                    callback.apply(context);
                                })
                            );
                        });
                    pageFound = true;
                    break;
                }
            }
            if (pageFound)
                return true;
            else
                return false;
        },

        findPage: function (htmlId) {
            if (htmlId == null)
                return false;
            var nodeSelector = this.jqId(htmlId);
            var rootView = this._getRootView();
            var i = 0;
            for (; i < rootView.childViews.length; i++) {
                var nodeElArray = $(rootView.childViews[i].el).find(nodeSelector);
                if (nodeElArray.length > 0) {
                    return i;
                }
            }
            while (this.hasMorePages()) {
                rootView.renderDeferredPage();
                var nodeElArray = $(rootView.childViews[i].el).find(nodeSelector);
                if (nodeElArray.length > 0) {
                    return i;
                }
                i++;
            }
        },

        getLayout: function (htmlId) {
            if (htmlId == null)
                return false;
            var nodeSelector = this.jqId(htmlId);
            var rootView = this._getRootView();
            var el = rootView.$el.find(nodeSelector);
            if (el.get(0)) {
                var layout = this.getOrElse(this.$data(el.get(0), "xfaView"), {});
                return layout.layoutModel;
            }
            else return null;

        },

        _pageContent: function (pageNum, className, bPageArea) {
            bPageArea = bPageArea || false;
            this._makePage(pageNum);
            var pageView = this._getRootView().childViews[pageNum];
            var contentList = new xfalib.script.XfaList();
            if (pageView.model && (!className || className == "pageArea")) {
                contentList._append(pageView.model);
            }
            if (!bPageArea) {
                for (var pv in pageView.childViews) {
                    if (pageView.childViews[pv] instanceof  xfalib.view.ContentAreaView) {
                        contentList._concat(this.$pageContent(pageView.childViews[pv], className, bPageArea));   //Rather than passing the pageArea, we are passing only contentArea
                        // so that it returns all non-pageArea content nodes
                    }

                }
                return contentList;
            }
            contentList._concat(this.$pageContent(pageView, className, bPageArea));
            return contentList;
        },

        $nodeContent: function (node, className, bPageArea) {
            //process child nodes
            var contentList = new xfalib.script.XfaList();
            if (node) {
                _.each(node.children, function (nodeChild) {
                    if (!className && nodeChild.isContainer) {
                        contentList._append(nodeChild);
                    }
                    else if (nodeChild.className == className) {
                        contentList._append(nodeChild);
                    }

                    if (nodeChild.isContainer) {
                        var nodeChildContentList = this.$nodeContent(nodeChild, className, bPageArea);
                        contentList._concat(nodeChildContentList);
                    }
                }, this);
            }
            return contentList;
        },

        $pageContent: function (view, className, bPageArea) {

            var contentList = new xfalib.script.XfaList();
            //process child nodes
            if (bPageArea && view instanceof xfalib.view.ContentAreaView)
                return contentList;      // Breaking the recursion here, so that it will return only pageArea content nodes
            _.each(view.childViews, function (childView) {
                if (childView.model) {
                    var childModel = childView.model;
                    if (!className && childModel.isContainer) {
                        contentList._append(childModel);
                    }
                    else if (childModel.className == className) {
                        contentList._append(childModel);
                    }
                }
                //Time to recurse

                if (childView._isPlaceHolderEl() && childView.model) {
                    //For hidden views that have never been initialized, we would want to return all contained nodes since we stitch
                    //hidden node together in first page.
                    contentList._concat(this.$nodeContent(childView.model, className, bPageArea));
                }
                else {
                    contentList._concat(this.$pageContent(childView, className, bPageArea));
                }

            }, this);
            return contentList;
        }

    });
})(_, $, xfalib);
(function(_, $, xfalib){

        xfalib.view.DataTableView = xfalib.view.ContainerView.extend({

        $elchildren : function(id) {
            return this.$el.children().children(id);
        },

        _getScreenReaderText: xfalib.view.FieldView.prototype._getScreenReaderText

        });
})(_, $, xfalib);
(function(_, $, xfalib){
    var root = window;
    root.xfaViewRegistry = (function(){
        var _templateCache = new xfalib.view.util.HtmlTemplateCache();
        var _layoutManager = new xfalib.view.layout.LayoutManager();
        var xfaUtil = xfalib.ut.XfaUtil.prototype;

        var _viewTypeRegistry = {
            BaseView : xfalib.view.BaseView,
            FieldView : xfalib.view.FieldView,
            NumericFieldView : xfalib.view.NumericFieldView,
            ChoiceListFieldView : xfalib.view.ChoiceListFieldView,
            ObjectView : xfalib.view.ObjectView,
            SubformView : xfalib.view.SubformView,
            SubformSetView : xfalib.view.SubformSetView,
            PageView : xfalib.view.PageView,
            ContentAreaView : xfalib.view.ContentAreaView,
            RootSubformView : xfalib.view.RootSubformView,
            ContainerView : xfalib.view.ContainerView,
            ButtonFieldView : xfalib.view.ButtonFieldView,
            CheckButtonFieldView : xfalib.view.CheckButtonFieldView,
            TextFieldView : xfalib.view.TextFieldView,
            SignatureFieldView : xfalib.view.SignatureFieldView,
            ImageFieldView : xfalib.view.ImageFieldView,
            XfaDrawView : xfalib.view.XfaDrawView,
            DateTimeFieldView: xfalib.view.DateTimeFieldView,
            ExclGroupView: xfalib.view.ExclGroupView,
            DataTableView: xfalib.view.DataTableView
        };

        var _defaultDraw = {
            view : _viewTypeRegistry.XfaDrawView
        };

        var _defaultField = {
            view : _viewTypeRegistry.FieldView,
            widgetTemplate : null,
            viewInitConfig : {
                commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                commitProperty : "value",
                commitTarget : "rawValue"
            }
        };
        var _defaultContainer = {
            view : _viewTypeRegistry.ContainerView
        };
        var _defaultDataTable = {
            view : _viewTypeRegistry.DataTableView
        };

        var _nodeTypeRegistry = {
            //Containers
            "area" :    _defaultContainer,
            "contentarea" : {view : _viewTypeRegistry.ContentAreaView},
            "exclgroup" : {view : _viewTypeRegistry.ExclGroupView},
            "page" : {view : _viewTypeRegistry.PageView},
            "subform" : {view : _viewTypeRegistry.SubformView},
            "subformset" : {view : _viewTypeRegistry.SubformSetView},
            "rootsubform" : {view : _viewTypeRegistry.RootSubformView},

            //Fields
            "textfield" : {
                view : _viewTypeRegistry.TextFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "signaturefield" : {
                view : _viewTypeRegistry.SignatureFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "textareafield" : {
                view : _viewTypeRegistry.TextFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "numericfield" : {
                view : _viewTypeRegistry.NumericFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "imagefield" : {
                view : _viewTypeRegistry.ImageFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    commitProperty : "src",
                    commitTarget : "rawValue"
                }
            },
            "datefield" : {
                view : _viewTypeRegistry.DateTimeFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "timefield" : _defaultField,
            "datetimefield" : _defaultField,
            "passwordfield" : _defaultField,
            "buttonfield" : {
                view : _viewTypeRegistry.ButtonFieldView,
                viewInitConfig : {
                    commitEvent : null,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "submitfield" : _defaultDraw,
            "radiofield" : {
                view : _viewTypeRegistry.CheckButtonFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "checkboxfield" : {
                view : _viewTypeRegistry.CheckButtonFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            },
            "choicelist" : {
                view : _viewTypeRegistry.ChoiceListFieldView,
                viewInitConfig : {
                    commitEvent : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    commitProperty : "value",
                    commitTarget : "rawValue"
                }
            }
        };


        return {
            viewTypeRegistry : _viewTypeRegistry,
            rootSubformView : null,
            nodeTypeRegistry : _nodeTypeRegistry,
            _userConfig : null,

            widgetConfig : function(){
                if(this._userConfig && this._userConfig["widgetConfig"]){
                    return this._userConfig["widgetConfig"];
                }
            },

            pagingConfig : function(){
                if(this._userConfig && this._userConfig["pagingConfig"]){
                    return this._userConfig["pagingConfig"];
                }
                var shrinkPageDisabledValue = false;
                if(this._userConfig && this._userConfig["behaviorConfig"]){
                    //TODO: Create a generic method somewhere in FormBridge?
                    var version = new xfalib.ut.Version(this._userConfig["behaviorConfig"]);
                    if(version.isPreviousOrSame(version.ES4))
                        shrinkPageDisabledValue = true;
                }

                return {
                    pagingDisabled : false,
                    shrinkPageDisabled : shrinkPageDisabledValue
                };
            },

            lookUpView : function(options){
                options = options || {};

                if(options.dataTable)
                    return _defaultDataTable;
                var nodeTypeView = this.nodeTypeRegistry[options.nodeType];
                if(nodeTypeView)
                    return nodeTypeView;

                if(options.field)
                    return _defaultField;
                else if(options.draw)
                    return _defaultDraw;
                else
                    return _defaultContainer;
            },

            createView : function(htmlDomNode, options){
                var $htmlDomNode = $(htmlDomNode);
                var nodeType = (xfaUtil.$data($htmlDomNode.get(0), xfalib.view.LayoutConst.XFA_MODEL) ||{})[xfalib.view.LayoutConst.NODE_TYPE];
                var isField = $htmlDomNode.hasClass("field");
                var isDraw = $htmlDomNode.hasClass("draw");
                var isDataTable = ($htmlDomNode.prop("tagName") == "TABLE");
                var isDataTableRow = ($htmlDomNode.prop("tagName") == "TR");
                var isDataTableCell = ($htmlDomNode.prop("tagName") == "TD" || $htmlDomNode.prop("tagName") == "TH" );
                var viewOptions = {
                    "nodeType" : nodeType,
                    "field" : isField,
                    "draw" : isDraw,
                    "dataTable" : isDataTable,
                    "dataTableRow" : isDataTableRow,
                    "dataTableCell" : isDataTableCell
                };
                var viewConfig = this.lookUpView(viewOptions);
                var initParam =  _.extend(
                    {el:htmlDomNode},
                    viewConfig["viewInitConfig"],
                    options
                );
                var viewInstance =  new viewConfig["view"](initParam);
                return viewInstance;
            },

            /**
             * Clears the template cache. The API is needed to clear the cache when
             * unloading one form and loading another form in Form Set.
             */
            clearTemplateCache: function () {
                _templateCache = new xfalib.view.util.HtmlTemplateCache();
            },

            /**
             * Clears the Layout Manager. The API is needed to unload the layout Manager
             * when unloading one form and loading another form in Form Set.
             */
            resetLayoutManager : function () {
              _layoutManager = new xfalib.view.layout.LayoutManager();
            },

            /**
             * The function is used to destroy the resources held by the object.
             * This function is called when the form is destroyed.
             */
            destroy: function () {
                _templateCache = undefined;
                _layoutManager = undefined;
            },

            templateCache : function(){
                return _templateCache;
            },

            layoutManager : function(){
                return _layoutManager;
            },


            /*
             * look ups the formWidth value in behaviourConfig; and if browser supports scaling, enforce that width by scaling the form
             */
            scaleForm: function () {
                var formWidth = this._userConfig["viewportWidth"];
                if (formWidth) {
                    var timeout = window.setTimeout(function () {     // wait for enough time to let layout complete
                        formWidth = parseInt(formWidth);
                        var pageMaxWidth = 0;
                        $(".page").each(function (i, obj) {
                            var tmpWidth = parseInt($(obj).width());
                            if (tmpWidth > pageMaxWidth)
                                pageMaxWidth = tmpWidth;
                        });
                        var width = pageMaxWidth,
                            height = parseInt($("body").height()),
                            scaleFactor = xfalib.ut.XfaUtil.prototype.formScaleFactor = formWidth / width,
                            transformValue = "scale(" + scaleFactor + ")",
                            marginHeight = height - scaleFactor * height,
                            marginWidth = width - scaleFactor * width,
                            scaleStyles = {
                                "-webkit-transform": transformValue, /* Saf3.1+, Chrome */
                                "-moz-transform": transformValue, /* FF3.5+ */
                                "-ms-transform": transformValue, /* IE9 */
                                "transform": transformValue,
                                "-webkit-transform-origin": "0 0",
                                "-moz-transform-origin": "0 0",
                                "-ms-transform-origin": "0 0",
                                "transform-origin": "0 0",
                                /* below two values are based on total heuristics. best combination to get thing working cross browser:
                                 *  In few browsers, after scaling there is blank space on bottom so margin-bottom is used with negative value.
                                 *  margin right is required for removing space on right in few browser, after scaling.
                                 *  And interestingly, formulae for both are different, not my mistake- total heuristics.
                                 *  IE still has space left in bottom&right in scaled down version but works good in scale up version.
                                 *  New, step would be to make these values per browser type. But common for now.
                                 * */
                                "margin-bottom": Math.min(0, -1 * marginHeight),
                                "margin-right": -1 * marginWidth
                            }
                        $("body").css(scaleStyles);
                        $(".page").css("margin", 0);
                        /*dispatch event so that toolbar and other widths can be re-computed.*/
                        $(window.formBridge).trigger("xfaFormScale");
                    }, 100);
                    xfalib.ut.XfaUtil.prototype.clearTimeoutOnDestroy(timeout);
                }
            },

            /*
             * Invalidates tab indexes for given page number. Note that page number starts with one.
             */
            invalidateTabIndex : function(pageNum){
                if(pageNum > -1 && this.rootSubformView && this.rootSubformView.childViews ){
                    var pageView = this.rootSubformView.childViews[pageNum -1];
                    if(pageView){
                        pageView.invalidateTabIndex();
                    }
                }
            }
        };
    })();

    root.xfaViewRegistry.initializeView = function(firstPageHtmlStr, restOfThePages){
        var viewStartTime = Date.now();
        var $formHtml = $(firstPageHtmlStr);
        var options = {};
        options.restOfThePages = restOfThePages;
        var pagingManager = new xfalib.view.PagingManager();
        xfalib.runtime.xfa.host.pagingManager = pagingManager;
        xfalib.runtime.xfa.$layout.pagingManager = pagingManager;
        window.xfaViewRegistry.rootSubformView = window.xfaViewRegistry.createView($formHtml, options);
        xfalib.runtime.xfa.host.on(xfalib.script.XfaModelEvent.FORM_MODEL_REFRESH,{
            handleEvent: function(evnt) {
                switch(evnt.name) {
                    case xfalib.script.XfaModelEvent.FORM_MODEL_REFRESH:
                        window.xfaViewRegistry.rootSubformView.syncFormNodeToHtml(true);
                        break;
                    default:
                    /* log an error message */
                }
            }
        });
        //TODO: move this to Logger
        formBridge.viewTime = Date.now()-viewStartTime;
        xfalib.runtime.xfa.Logger.debug("xfaView","################ total time to create view:"+formBridge.viewTime);
        return $formHtml;
    };

    root.xfaViewRegistry.initializeModel = function(xfaJson, xfaDataMergeDorm, xfalocaleset, xfarendercontext) {
        //read renderContext and other xfa specific node and push it
        xfalib.runtime.renderContext = xfarendercontext;

        if(xfalib.ut.XfaUtil.prototype.getOrElse(xfalib.runtime, "customPropertyMap.xmlOnClient", "0") === "1") {
            if(xfalib.runtime.renderContext.data) {
                formBridge.playDataXML({
                    xmlDocument : xfalib.runtime.renderContext.data
                });
            }
        }
        //read localeset as well
        xfaJson.localeSet = xfalocaleset;

        //Create Xfa Node
        xfalib.script.XfaModelRegistry.prototype.createModel(xfaJson);       //TODO: Handle window dependency

        if(xfalib.runtime.xfa.Logger.isLogEnabled("xfa", xfalib.ut.Logger.prototype.TRACE)){
            xfalib.runtime.xfa.Logger.trace("xfa","################ t0 xfadom:\n" + JSON.stringify(xfaJson));
        }

        var hasRestoreState = false;
        if (window.formBridge != undefined) {
            var localStorage = window.formBridge._getStorage();
            if (localStorage && localStorage.xfaDom) {
                xfaJson = JSON.parse(localStorage.xfaDom);
                if(xfaJson) {
                    hasRestoreState = true;
                    if(xfalib.runtime.xfa.Logger.isLogEnabled("xfa", xfalib.ut.Logger.prototype.TRACE)){
                        xfalib.runtime.xfa.Logger.trace("xfa","################ restore xfadom:\n" + JSON.stringify(xfaJson));
                    }
                    xfalib.runtime.xfa.host.playJson(xfaJson);
                }
            }
            var xmlStorage = window.formBridge._getXmlStorage();
            if(xmlStorage) {
                xfalib.runtime.xfa.Logger.trace("xfa","################ restore xml:\n" + xmlStorage);
                try {
                    xfalib.runtime.xfa.host.playDataXml(xmlStorage);
                } catch(exception) {
                    xfalib.runtime.xfa.Logger.error("xfa", "restoring xml failed ")
                    if(_.isFunction(formBridge.xmlStorage.error)) {
                        var resObj = formBridge._getResultObject();
                        resObj.addMessage(2, exception, null);
                        formBridge.xmlStorage.error.apply(formBridge.xmlStorage.context, [resObj])
                        //to ensure that success handler is not called after form render from FormBridge._xfaInitialized
                        formBridge.xmlStorage.success = null;
                    }
                }
            }
        }
        if( xfalib.ut.XfaUtil.prototype.getOrElse(xfalib.runtime, "customPropertyMap.xmlOnClient", "0") !== "1") {
            if(!hasRestoreState && xfaDataMergeDorm){
                if(xfalib.runtime.xfa.Logger.isLogEnabled("xfa", xfalib.ut.Logger.prototype.TRACE)){
                    xfalib.runtime.xfa.Logger.trace("xfa","################ restore xfadom:\n" + JSON.stringify(xfaDataMergeDorm));
                }
                xfalib.runtime.xfa.host.playJson(xfaDataMergeDorm);
            }
        }
        if( xfalib.ut.XfaUtil.prototype.getOrElse(xfalib.runtime, "customPropertyMap.destroyOnExit", "0") === "1") {
            $(window).on("beforeunload.xfa", function () {
                formBridge.destroyForm(true);
            });
        }
    };

    root.xfaViewRegistry.initializeFormOnDomReady = function() {
        $(function($){
            try {
                var initStart = Date.now();
                //initialize Acrobat specific scripts
                new xfalib.acrobat.Acrobat();
                if(xfalib.runtime.xfa) {
                    xfalib.runtime.xfa.form._initialize(true);
                    $(window).trigger("XfaInitialized");
                }
                formBridge.modelInitTime = Date.now()-initStart;
                xfalib.view.FieldView.prototype.currentFocus = null;
                $(window).on("mousedown.xfa", function() {
                    formBridge.clickedOnWindow = true;
                });
            } catch(e) {
                xfalib.runtime.xfa.Logger.error("xfa","error in form._initialize");
                if(e.stack){
                    xfalib.runtime.xfa.Logger.error("xfa", e.stack);
                }
            }
        });
    };

    //TODO: Put below call at proper place
    window._initializeXfaLoading = function (xfaJson, xfaDataMergeDorm, xfalocaleset, xfarendercontext, fileAttachmentMap) {
        window.formBridge._postExternalMessage({name : "_formdomstart"});

        var xfaModelLoadStart = Date.now();
        var xfaViewRegistry = window.xfaViewRegistry;

        //read internal css and attach it to head
        //excuse m
        if($('#formLoadingDiv').data('internalcss')) {
            var internalcss = $('#formLoadingDiv').data('internalcss'),
                styleTag = '<style id="mfstyle" type="text/css">'+internalcss+'</style>';
            //insert internal css before the first style element.
            if($('head>style:first').length > 0)
                $('head>style:first').before(styleTag);
            else if($('head').length > 0)
                $('head').append(styleTag);
            else if($('body').length > 0)
                $('body').prepend(styleTag);
            else if($('html').length > 0)
                $('html').prepend(styleTag);
            else
                $('#formLoadingDiv').prepend(styleTag);
        }

        xfaViewRegistry.initializeModel(xfaJson, xfaDataMergeDorm, xfalocaleset, xfarendercontext);

        window.formBridge._postExternalMessage({name : "_layoutstart"});
        xfaViewRegistry._userConfig = window.formBridge.userConfig;
        //TODO: move this to Logger
        formBridge.modelTime = Date.now()-xfaModelLoadStart;
        xfalib.runtime.xfa.Logger.debug("xfaView","################ total time to load xfa model:"+ formBridge.modelTime);

        var xfahtmldom =  $('#formLoadingDiv').data('xfahtmldom');
        var xfaresthtmldom = $('#formLoadingDiv').data('xfaresthtmldom');
        var xfahiddenobjdom = $('#formLoadingDiv').data('xfahiddenobjdom');

        xfalib.runtime.xfa.Logger.trace("xfaView","################ xfahtmldom:\n" + xfahtmldom);
        xfalib.runtime.xfa.Logger.trace("xfaView","################ xfaresthtmldom:\n" + xfaresthtmldom);
        xfalib.runtime.xfa.Logger.trace("xfaView","################ xfahiddenobjdom:\n <a>" + xfahiddenobjdom + "</a>");

        xfaViewRegistry.templateCache().setHiddenObjPages(xfahiddenobjdom); //cache the pages with hidden object layout
        $('#formLoadingDiv').replaceWith(xfaViewRegistry.initializeView( xfahtmldom, xfaresthtmldom));

        xfalib.runtime.xfa.Logger.debug("xfaView","################ total time to load xfa model + view:"+(Date.now()-xfaModelLoadStart));
        window.formBridge._postExternalMessage({name : "_layoutend"});

        xfaViewRegistry.initializeFormOnDomReady();

        // Restore attachments
        // We are setting this which is passed by file attachment plugin to  the fileUpload widget
        // as options.value and then widget creation takes place
        if(xfalib.runtime) {
            xfalib.runtime.fileAttachment = fileAttachmentMap;
        }

    };

})(_, $, xfalib);