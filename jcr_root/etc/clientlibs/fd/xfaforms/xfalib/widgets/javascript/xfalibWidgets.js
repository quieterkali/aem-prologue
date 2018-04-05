/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
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




(function(_, $, xfalib){
    xfalib.view.util.TextMetrics = {
        xfaUtil : xfalib.ut.XfaUtil.prototype,
        ERROR_MARGIN : 1,
        $measureEl : null,
        initialize : function(divEl){
            if(!divEl){
                var $div = $(document.createElement("div"));
                $div.id = "textMetrics";
                var divStyles = {};
                divStyles.left = -1000;
                divStyles.top = -1000;
                divStyles.position = "absolute";
                divStyles.visibility = "invisible";
                this.xfaUtil.$css($div.get(0), divStyles);
                this.$measureEl = $div;
                document.body.appendChild(this.$measureEl.get(0));
            }else{
                this.$measureEl = divEl;
            }
        },

        measureExtent : function(text, options){
            text = text + " ";
            if(!this.$measureEl){
                this.initialize();
            }
            options = options || {};
            var textStyles = {};
            var $refEl =  $(options.refEl || "<div/>") ;
            var refEl = $refEl.get(0);
            textStyles.fontSize = $refEl.css("fontSize") || options["font-size"] || options["fontSize"];
            textStyles.fontStyle = $refEl.css("fontStyle") || options["font-style"] || options["fontStyle"];
            textStyles.fontWeight = $refEl.css("fontWeight") || options["font-weight"] || options["fontWeight"];
            textStyles.fontFamily = $refEl.css("fontFamily") || options["font-family"] || options["fontFamily"];
            textStyles.lineHeight = refEl.style.lineHeight || options["line-height"] || options["lineHeight"];
            textStyles.letterSpacing = $refEl.css("letterSpacing") || options["letter-spacing"] || options["letterSpacing"];
            textStyles.whiteSpace =  $refEl.css("whiteSpace") || options["white-space"] || options["whiteSpace"] || "pre-wrap";
            if( $.browser.mozilla && $refEl.is("textarea"))      // for Bug #3621180
                textStyles.whiteSpace = "pre-wrap";
            textStyles.wordBreak =  $refEl.css("wordBreak") || options["word-break"] || options["wordBreak"] || "break-all";
            textStyles.wordWrap =  $refEl.css("wordWrap") || options["word-wrap"] || options["wordWrap"] || "break-word";
            textStyles.width = this._elWidth(refEl, options);
            textStyles.height = this._elHeight(refEl, options);
            textStyles.minWidth = this._elMinWidth(refEl, options);
            textStyles.minHeight = this._elMinHeight(refEl, options);
            textStyles.maxWidth = this._elMaxWidth(refEl, options);
            textStyles.maxHeight = this._elMaxHeight(refEl, options);
            this.xfaUtil.$css(this.$measureEl.get(0), textStyles);
            // for text fields/areas requiring rich text support
            if(options.contentType === "text/html"){
              // retaining for future use . If we use the above property for other rich text
               if(options.skipXSSProtection) {
                 this.$measureEl.html(text);
               } else {
                 this.$measureEl.html(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(text));
               }
            }else {
               this.$measureEl.text(text);
            }
            var measuredWidth =  this.$measureEl.width();
            var measuredHeight =  this.$measureEl.height();

            if(measuredWidth == Math.ceil(options["width"]) || measuredWidth == Math.floor(options["width"])){
                measuredWidth = options["width"];
            }
            else if(options["maxWidth"] > measuredWidth || (measuredWidth > options["minWidth"] > 0 && (options["maxWidth"] || -1) < 0)){
                //complicated, please simplify if below hurts you:  Add error margin if there is scope of further extension of extent
                measuredWidth = measuredWidth +1;
            }

            if(measuredHeight == Math.ceil(options["height"]) || measuredHeight == Math.floor(options["height"])){
                measuredHeight = options["height"];
            }
            else if( $refEl.is("textarea") && (options["maxHeight"] > measuredHeight || (measuredHeight > options["minHeight"] > 0 && (options["maxHeight"] || -1) < 0))){
                measuredHeight = measuredHeight +1;
            }
            this.$measureEl.text("");
            return {width : measuredWidth, height : measuredHeight};
        },

        _elWidth : function(refEl, options){
            if(options["minWidth"] && options["minWidth"] > -1)
                return "auto";
            else if(options["maxWidth"] && options["maxWidth"] > -1)
                return "auto";
            else
                return options["width"] || "auto";
        },

        _elHeight : function(refEl, options){
            // TODO: check for calculations here for floating field and other cases.
            if(options["contentType"] === "text/html")
                return "auto";
            if(!$(refEl).is("textarea"))
                return options["height"] || "auto";
            if(options["minHeight"] && options["minHeight"] > -1)
                return "auto";
            else if(options["maxHeight"] && options["maxHeight"] > -1)
                return "auto";
            else
                return options["height"] || "auto";
        },

        _elMinWidth : function(refEl, options){
            if(options["minWidth"] && options["minWidth"] > -1)
                return options["minWidth"];
            else
                return "0"; //default css value
        },

        _elMinHeight : function(refEl, options){
            if(options["minHeight"] && options["minHeight"] > -1)
                return options["minHeight"];
            else
                return "0"; //default css value
        },

        _elMaxWidth : function(refEl, options){
            if(options["maxWidth"] && options["maxWidth"] > -1)
                return options["maxWidth"];
            else
                return "none"; //default css value
        },

        _elMaxHeight : function(refEl, options){
            if(options["maxHeight"] && options["maxHeight"] > -1)
                return options["maxHeight"];
            else
                return "none"; //default css value
        }
    }
})(_, $, xfalib);
(function($) {

	$.alertBox = {

		verticalOffset: -75,
		horizontalOffset: 0,
		repositionOnResize: true,
		overlayOpacity: 0.01,
		overlayColor: '#FFF',
		draggable: false,
		dialogClass: null,
		imageDirectory: "..",
		images: ["A_Warning_Lg_N.png", "A_Alert2_Lg_N.png", "C_QuestionBubble_Xl_N.png", "A_InfoBlue_32x32_N.png"],

		alert: function(img, message, title, callback) {
			this._show(img, title, message, null, 'OK', function(result) {
				if( callback ) callback(result);
			});
		},

		okCancel: function(img, message, title, callback) {
			this._show(img, title, message, null, 'OK-Cancel', function(result) {
				if( callback ) callback(result);
			});
		},
		yesNo: function(img, message, title, callback) {
			this._show(img, title, message, null, 'Yes-No', function(result) {
				if( callback ) callback(result);
			});
		},

		yesNoCancel: function(img, message, title, callback) {
			this._show(img, title, message, null, 'Yes-No-Cancel', function(result) {
				if( callback ) callback(result);
			});
		},

		_createBox: function(msgBox_message,buttons,callback) {
			var that = this;
			$("#"+msgBox_message).after("<div id='msgBox_panel'>");
			_.each(buttons.split("-"),function(val,i) {
                dispval = xfalib.locale.Strings[val.toLowerCase()] ? xfalib.locale.Strings[val.toLowerCase()] : val;  // keys in loaclization files are in lower-case
                $("#msgBox_panel").append("<input type='button' value='"+dispval+"' id = 'msgBox_"+val+"' class=msgbox_input />");
				$("#msgBox_"+val).click( function() {
					that._hide();
					callback(!i);
				});
				if(!i) $("msgBox_"+val).focus();
			});
		},

		_show: function(img, title, msg, value, type, callback) {

			this._hide();
			this._overlay('show');

			$("BODY").append(
			  '<div id="msgBox_container">' +
			    '<h1 id="msgBox_title"></h1>' +
			    '<div id="msgBox_content">' +
			      '<div id="msgBox_message"></div>' +
				'</div>' +
			  '</div>');

			if( this.dialogClass ) $("#msgBox_container").addClass($.alertBox.dialogClass);

			$("#msgBox_container").css({
				position: 'absolute',
				zIndex: 99999,
				padding: 0,
				margin: 0
			});

			$("#msgBox_title").text(title);
			$("#msgBox_content").addClass("msgBoxType"+img);//css("background-image","url("+this.imageDirectory+ this.images[img]+")");
			msg = xfalib.ut.XfaUtil.prototype.encodeScriptableTags(msg.replace(/\n/g, '<br />'));
            $("#msgBox_message").html(msg);

			$("#msgBox_container").css({
				minWidth: $("#msgBox_container").outerWidth(),
				maxWidth: $("#msgBox_container").outerWidth()
			});

			this._reposition();
			this._maintainPosition(true);

			this._createBox("msgBox_message",type,callback);

			//TODO: Make keyboard input work
			/*$("#msgBox_ok").keypress( function(e) {
				if( e.keyCode == 13 || e.keyCode == 27 ) $("#msgBox_ok").trigger('click');
			});
			$("#msgBox_cancel").keypress( function(e) {
				if( e.keyCode == 13 ) $("#msgBox_ok").trigger('click');
				if( e.keyCode == 27 ) $("#msgBox_cancel").trigger('click');
			});
			$("#msgBox_yes, #msgBox_no").keypress( function(e) {
				if( e.keyCode == 13 ) $("#msgBox_yes").trigger('click');
					if( e.keyCode == 27 ) $("#msgBox_no").trigger('click');
				});*/

		},

		_hide: function() {
			$("#msgBox_container").remove();
			this._overlay('hide');
			this._maintainPosition(false);
		},

		_overlay: function(status) {
			switch( status ) {
				case 'show':
					this._overlay('hide');
					$("BODY").append('<div id="msgBox_overlay"></div>');
					$("#msgBox_overlay").css({
						position: 'absolute',
						zIndex: 99998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background: this.overlayColor,
						opacity: this.overlayOpacity
					});
				break;
				case 'hide':
					$("#msgBox_overlay").remove();
				break;
			}
		},

		_reposition: function() {
            var windowHeight = $(window).height() / xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowWidth = $(window).width() / xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowScrollTop =  $(window).scrollTop() / xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowScrollLeft =  $(window).scrollLeft() / xfalib.ut.XfaUtil.prototype.formScaleFactor,
			    top = ((windowHeight / 2) - ($("#msgBox_container").outerHeight() / 2)) + this.verticalOffset,
			    left = ((windowWidth / 2) - ($("#msgBox_container").outerWidth() / 2)) + this.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;

			// IE6 fix
			if( $.browser.msie && parseInt($.browser.version) <= 6 ) top = top + windowScrollTop;

			$("#msgBox_container").css({
				top: top + windowScrollTop + 'px',
				left:  left + windowScrollLeft + 'px'
			});
			$("#msgBox_overlay").height( $(document).height() );
		},

		_maintainPosition: function(status) {
			if( this.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', this._reposition);
					break;
					case false:
						$(window).unbind('resize', this._reposition);
					break;
				}
			}
		}

	};
})($);/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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


(function(_, $, xfalib){
    xfalib.view.util.HtmlUtil = {
        /*
        * Most of the time it returns undefined while accessing an undefined attribute of a dom element.
        * But some browsers can throw specific exceptions while accessing an attribute which is un-supported for a specific case.
        * This API is to make this behaviour consistent across browsers and return undefined for un-supported attributes.
        * */
        getHTMLSupportedAttr : function($domElement, attr){
           try{
               return $domElement[attr];
            }
           catch (err){
               return undefined;
            }
        }
    }
})(_, $, xfalib);
/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/



(function(_, $, xfalib){
    xfalib.view.util.Styles = {
        xfaUtil : xfalib.ut.XfaUtil.prototype,
        _deviceResolution :  144.0, //DPI
        _in2mmFactor : 25.4,
        _pdfResolution : 72.0 ,
        getStyleForEdge : function (edgeElement, str, cssStyleObj){
            var style = { "raised" : "outset" ,
                "dashDot" : "dashed" ,
                "dashDotDot" : "dashed" ,
                "dashed" : "dashed" ,
                "dotted" : "dotted" ,
                "embossed" : "groove" ,
                "etched" : "inset" ,
                "lowered" : "ridge",
                "solid" : "solid"};
            if(edgeElement && edgeElement.jsonModel.presence != "hidden" && edgeElement.jsonModel.presence !="invisible") {
                cssStyleObj['border'+str+'width'] = this._subPixelValue(this._convertToPx(edgeElement.getAttribute('thickness'))) || "1px";
                if(edgeElement.getElement("color") && edgeElement.getElement("color").getAttribute("value") !="")  {
                    var color =   edgeElement.getElement("color").getAttribute("value");
                    color = "rgb(" + color + ")";
                    cssStyleObj['border'+str+'color']   = color  ;
                }
                else {
                    cssStyleObj['border'+str+'color'] = "rgb(0,0,0)"  ;
                }
                cssStyleObj['border'+str+'style']   = style[edgeElement.getAttribute('stroke')] || "solid" ;
            } else {
                cssStyleObj['border'+str+'width'] =  "0px";
                return 1;
            }

        },

        getStyleForBorder : function (border) {
            if(border) {
                var edge  =  border.getElement('edge', 0, true),
                    edge1 = border.getElement('edge', 1, true),
                    edge2 = border.getElement('edge', 2, true),
                    edge3 = border.getElement('edge', 3, true);
                if(edge || edge1 || edge2 || edge3) {
                    var cssStyleObj = {} ;
                    var e0 = this.getStyleForEdge(edge, "-top-",cssStyleObj);
                    var e1 = this.getStyleForEdge(edge1 || edge,"-right-",cssStyleObj);
                    var e2 = this.getStyleForEdge(edge2|| edge,"-bottom-",cssStyleObj);
                    var e3 = this.getStyleForEdge(edge3 || edge,"-left-",cssStyleObj);
                    if(e0 !=1|| e1 !=1|| e2 !=1|| e3!=1)
                        return cssStyleObj ;
                }
            }
                return null;
        },

        _convertToPx : function(size){
            if(!size)
                return 0;
            size = "" + size;
            var pxSize = size;
            if(size.indexOf("in") >=0){
                pxSize = this._mm2px(parseFloat(size) * this._in2mmFactor);
            }
            else if(size.indexOf("mm") >=0){
                pxSize = this._mm2px(size);
            }
            else if(size.indexOf("cm") >=0){
                pxSize = this._mm2px(parseFloat(size) * 10);
            }
            else if(size.indexOf("pt") >=0){
                pxSize = parseFloat(size) * (this._deviceResolution/this._pdfResolution);
            }
            else if(size.indexOf("px") >=0){
                pxSize = parseFloat(size);
            }
            return pxSize;
        },

        _mm2px : function(mmSize){
            var mmSizeNum = 0;
            if(_.isNumber(mmSize))
                mmSizeNum = mmSize;
            else{
                mmSizeNum = parseFloat(mmSize)
            }
            var mm2in = 1/25.4 ;
            var pxSize = mmSizeNum*mm2in*this._deviceResolution;
            return pxSize;
        },

        _subPixelValue : function(value){
            if(value > 0.01)
                return Math.max(value, 1.0);
            else
                return value;
        }
    }
})(_, $, xfalib);
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
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




(function(_, $, xfalib){
    xfalib.view.util.traversalManager = {

        // compute tabIndex for the provided page
        _computTabIndex : function (pageView) {
            var pageNum = pageView._pageNumber(),
                tabIndex = this._tabIndexBasedOnRange(pageNum);
            this.geographicalOrder = [];
            this._createGeographicalOrder(pageView);
            this._createFinalTraversalOrder(tabIndex); // assign tab index using traversal element and geographicalOrder
            // keep tracks of the last field on the page to get tab index so that handler to render next page can be added on getting focus through tabbing
            this._lastFieldTabbed = null;
        },

        _tabIndexBasedOnRange : function (pageNum) {
            var behaviorConfig = new xfalib.ut.Version(formBridge.userConfig["behaviorConfig"]),
                tabIndexConfig = (behaviorConfig.isOn('mfRangeTabIndex')|| behaviorConfig.isOn('rangeTabIndex')),
                /*assuming single page can not have more than 1000 fields.[index -> 0 to 999]
                  this is also configurable by passing the maximum number of fields allowable in the page
                  in the config parameter */
                maxFieldInPageForTabIndex = tabIndexConfig? parseInt(tabIndexConfig):1000;

            return pageNum * maxFieldInPageForTabIndex;
        },

        // to create geographical order array which will be containing all the views in the geographical order
        _createGeographicalOrder : function (currentView) {
            var sortedChildViewWrapper = this._sortViewGeographically(currentView.childViews);
            _.each(sortedChildViewWrapper, function (wrapper) {
                var currentView = wrapper.view,
                    instanceCheckMap = this._getMapOfInstanceCheck(currentView);
                    isViewEligibleForTabbing = this._isViewEligibleForTabbing(currentView);
                //  If the child view is fieldView, drawView, exclGroupView or subformView then we will push these views in this.geographicalOrder array,
                //  as we need their traverse object during final traversing
                if (((instanceCheckMap.isField && !instanceCheckMap.isChildOfExclGroup) || instanceCheckMap.isSubform || instanceCheckMap.isDraw
                    || instanceCheckMap.isExclGroup) && isViewEligibleForTabbing) {
                    this.geographicalOrder.push({
                        view : currentView,
                        visited : false
                    });
                }
                if (instanceCheckMap.isContainer && isViewEligibleForTabbing) {
                    this._createGeographicalOrder(currentView);
                }
            }, this);
        },

        // to sort provided views in geographical order
        _sortViewGeographically : function (views) {
            var viewsWrapper = [];   // wrapper of view and their geographical reference
            _.each(views, function(view) {
                var position = view.$el.offset(),
                    paddedX = xfalib.ut.XfaUtil.prototype.padString(parseInt(position.left), 5, '0'),
                    marginTop = view._marginTop(),
                    paddedY = position.top - parseFloat(marginTop),
                    positionalReference = parseInt("" + parseInt(paddedY) + paddedX);
                viewsWrapper.push({
                    positionalReference: positionalReference,
                    view: view
                });
            });
            return _.sortBy(viewsWrapper, function(viewWrapper){ return viewWrapper.positionalReference; });
        },

        // Walk through views in geographical order and assign tab index honouring traversal object if present
        _createFinalTraversalOrder : function (tabIndex) {
            var geographicalOrderLength = this.geographicalOrder.length,
                currentWrappedObj = null,
                index = -1,
                traversalIndex = 0,  // index of the element to be traversed
                viewTraversed = 0;  // counter of view traversed

            while (1) {
                if (traversalIndex >= geographicalOrderLength) {
                    traversalIndex = 0;
                }
                currentWrappedObj = this.geographicalOrder[traversalIndex];

                if (!currentWrappedObj || currentWrappedObj.visited) {  // if the wrapped object does not exist or it has been visited move to the next one
                    traversalIndex++;
                } else {
                    currentWrappedObj.visited = true;
                    viewTraversed++;
                    var currentView = currentWrappedObj.view,
                        instanceCheckMap = this._getMapOfInstanceCheck(currentView);
                        currentModel = currentView.model,
                        nextView = null,
                        nextViewSom = null;

                    // get the first traversal of the subform if traversal object is present, else move to the next geographical element
                    // next of the subform will be taken care when we will be finding the next view to be traversed,
                    // as we will be checking if the ancestor contain next before moving to geographically next view
                    if (instanceCheckMap.isSubform) {
                        if (currentModel && currentModel.getTraversalObject()) {
                            // get the first element to be traversed and update traversalIndex
                            nextViewSom = currentModel.getNextTraversalSom(xfalib.template.Constants.firstTraversal);
                            index = this._findViewInGeographicalOrderArray(nextViewSom);
                            traversalIndex = index != -1 ? index : traversalIndex + 1;
                        } else {
                            traversalIndex++;
                        }
                    // get the next traversal for the field/draw if traversal object is present, else move to the next geographical element
                    // update the tabindex for the field
                    } else if (instanceCheckMap.isField || instanceCheckMap.isDraw) {
                        if (instanceCheckMap.isField) {
                            currentView.updateTabIndex(tabIndex);
                            this._lastFieldTabbed = currentView;
                            tabIndex++;
                        }
                        if (currentModel && currentModel.getTraversalObject()) {
                            //get next element to be traversed and update traversalIndex
                            nextViewSom = currentModel.getNextTraversalSom(xfalib.template.Constants.nextTraversal);
                            index = this._findViewInGeographicalOrderArray(nextViewSom);
                            traversalIndex = index != -1 ? index : traversalIndex + 1;
                        } else {
                            traversalIndex = this._findNextViewToBeTraversed(traversalIndex);
                        }
                    // if traversal object present get the next element to be traversed, if first is also present then update tab index of the first element
                    // else look for the traversal element in the children
                    } else if (instanceCheckMap.isExclGroup) {
                        if (currentModel && currentModel.getTraversalObject()) {
                            // get next element to be traversed and update traversalIndex
                            nextViewSom = currentModel.getNextTraversalSom(xfalib.template.Constants.nextTraversal);
                            index = this._findViewInGeographicalOrderArray(nextViewSom);
                            traversalIndex = index != -1 ? index : traversalIndex + 1;
                            // if first is also present assign tab index to that referred child else assign same tab index to all child
                            nextViewSom = currentModel.getNextTraversalSom(xfalib.template.Constants.firstTraversal);
                            tabIndex = this._updateTabIndexOfExclGroupChildren(currentView, tabIndex, nextViewSom);
                        } else {
                            tabIndex = this._updateTabIndexOfExclGroupChildren(currentView, tabIndex);
                            traversalIndex = this._findTraversalInExclGroupChildren(currentView, traversalIndex);
                        }
                    } else {
                        traversalIndex++;
                    }
                }

                // if all the view are traversed, we have assigned tab index to all the views
                if (viewTraversed >= geographicalOrderLength) {
                    this._renderNextPageFuture();
                    break;
                }
            }
        },

        // Check if the nextView is a sibling of the currentView (shares the same parent)
        // if it is not a sibling, check if the parent has a NEXT traversal.
        // if so get the node traversed to else recurse to see if nextView is a sibling of our parent
        // return -1 if the provided next node is sibling of current node or if no ancestor contain next traversal
        // else return index of the next traversal object of parent
        _getParentNextTraversal : function (currentView, nextView, traversalIndex) {
            var parentView = currentView.parentView,
                parentModel = parentView.model,
                nextViewParentModel = nextView.parentView.model,
                traversalObj = null,
                nextIndex = -1;

            if (parentModel && nextViewParentModel && parentModel.somExpression != nextViewParentModel.somExpression) {
                if(parentView && parentView instanceof xfalib.view.SubformView) {
                    if (parentModel.getTraversalObject()) {
                        nextViewSom = parentModel.getNextTraversalSom(xfalib.template.Constants.nextTraversal);
                        nextIndex = this._findViewInGeographicalOrderArray(nextViewSom);
                        if (nextIndex != -1 && !this.geographicalOrder[nextIndex].visited) {
                            return nextIndex;
                        } else {
                            return traversalIndex++;
                        }
                    } else {
                        this._getParentNextTraversal(parentView, nextView, traversalIndex);
                    }
                } else {  // parentView is not a subform so skip up a level and re-check sibling
                    this._getParentNextTraversal(parentView, nextView, traversalIndex);
                }
            } else {
                return -1;  //provided currentView and nextView are sibling
            }
            return traversalIndex++;
        },

        // return the index of the view having provided somExpression in the geographicalOrder array
        _findViewInGeographicalOrderArray : function (somExpression) {
            return _.findIndex(this.geographicalOrder, function (viewWrapper) {
                var currentViewModel = viewWrapper.view.model;
                return (currentViewModel && currentViewModel.somExpression == somExpression);
            });
        },

        // find the next element to be traversed based on the provided traversalIndex
        _findNextViewToBeTraversed : function (traversalIndex) {
            var currentView = this.geographicalOrder[traversalIndex].view,
                index = this._getNextUnvisited(traversalIndex),   //get next unvisited based on geographical location
                nextView = null,
                nextIndex = -1;

            if (index != -1) {
                nextView = this.geographicalOrder[index].view;
                //check if both are sibling and if not find the next of the parent and update traversalIndex
                nextIndex = this._getParentNextTraversal(currentView, nextView, traversalIndex);
                return nextIndex != -1 ? nextIndex : index;
            }
            return traversalIndex++;
        },

        // return the next unvisited node based on geographical location
        // starting from the traversalIndex and wraps around to check all the views
        _getNextUnvisited : function (traversalIndex) {
            var geographicalOrderLength = this.geographicalOrder.length,
                index = 0,
                actualIndex = 0;
            while(index < geographicalOrderLength) {
                actualIndex = (index + traversalIndex) % geographicalOrderLength;
                if(!this.geographicalOrder[actualIndex].visited) {
                    return actualIndex;
                }
                index++;
            }
            return -1;
        },

        // assign same tab index to all the child of exclude group
        // if exclude group contain first traverse object, then the child being referred as first should have less tabindex
        // compared to other child
        _updateTabIndexOfExclGroupChildren : function (exclGroupView, tabIndex, firstChildSom) {
            _.each(exclGroupView.childViews, function(child){
                if (this._isViewEligibleForTabbing(child)) {
                    if(firstChildSom && child.model.somExpression == firstChildSom) {
                        tabIndex++;
                        child.updateTabIndex(tabIndex-1);
                        this._lastFieldTabbed = child;
                    } else {
                        child.updateTabIndex(tabIndex);
                    }
                }
            }, this);
            if (!firstChildSom) {
                this._lastFieldTabbed = exclGroupView.childViews[0];
            }
            return ++tabIndex;
        },

        // find if any child contains next pointer and update traversal index
        // start with the last in the geographical order of the children and find child which have next traversal
        _findTraversalInExclGroupChildren : function (exclGroupView, traversalIndex) {
            var sortedChildView = this._sortViewGeographically(exclGroupView.childViews),
                tempObj = null,
                childView = null,
                childModel = null,
                traversalObj = null,
                nextViewSom = null,
                index = -1;

            sortedChildView.reverse();
            tempObj = _.find(sortedChildView, function(child) {
                childView = child.view;
                childModel = childView.model;
                if(childModel && (traversalObj = childModel.getTraversalObject())) {
                    return traversalObj.length > 0;
                }
            });

            if (tempObj) {
                nextViewSom = tempObj.model.getNextTraversalSom(xfalib.template.Constants.nextTraversal);
                index = this._findViewInGeographicalOrderArray(nextViewSom);
                traversalIndex = index != -1 ? index : traversalIndex + 1;
            } else { // else get next unvisited based on geographical location
                traversalIndex = this._findNextViewToBeTraversed(traversalIndex);
            }
            return traversalIndex;
        },

        // check if the view is initialized and visible
        _isViewEligibleForTabbing : function (view) {
            if (view._initialized && view.$el.css("visibility") != "hidden") {
                return true;
            }
            return false;
        },

        // return map of whethter provided view is instance of the various views
        _getMapOfInstanceCheck : function (view) {
            var instanceCheckMap = {};
            instanceCheckMap.isSubform = view instanceof xfalib.view.SubformView;
            instanceCheckMap.isField = view instanceof xfalib.view.FieldView;
            instanceCheckMap.isDraw = view instanceof xfalib.view.XfaDrawView;
            instanceCheckMap.isExclGroup = view instanceof xfalib.view.ExclGroupView;
            instanceCheckMap.isChildOfExclGroup = view.parentView instanceof xfalib.view.ExclGroupView;
            instanceCheckMap.isContainer = view instanceof xfalib.view.ContainerView;

            return instanceCheckMap;
        },

        // add event handler for rendering next page on tabbing on last field of the page
        _renderNextPageFuture : function () {
            if (this._lastFieldTabbed) {
                this._lastFieldTabbed.$el.one('focusin.traversalManager', function() {
                    var pagingManager = window.formBridge ? window.formBridge.pagingManager() : null;
                    $(window).on( "keyup.traversalManager", function (e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        if (code == 9 && pagingManager && pagingManager.hasMorePages()) {
                            pagingManager.renderNextPage();
                            $(window).off("keyup.traversalManager");
                        }
                    });
                });
            }
        }
    }
})(_, $, xfalib);
/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/



(function(_, $, xfalib){

    var ErrorManager = xfalib.view.util.ErrorManager = xfalib.ut.Class.extend({

        options: {
            warningMessageVisible:false,
            errorMessageVisible: false
        },

        initialize: function () {
            $(window).on("destroy.xfa", function () {
                $("#error-msg").hide();
                $("#warning-msg").hide();
            });
        },

        onFieldEnter: function (jqWidget) {
            var element = jqWidget.element;
            if (jqWidget.option("errorMessage")|| jqWidget.option("warningMessage")) {
                var pos = $(element).offset(),
                    styles = {};
                styles.left = (pos.left * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) + element.width() + 5) + "px";
                styles.top = pos.top * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) + "px";
                if (jqWidget.option("errorMessage")) {
                    jqWidget.$css($("#error-msg").get(0), styles);
                    $("#error-msg").text(jqWidget.option("errorMessage")).show();
                    jqWidget.option("errorMessageVisible",true);
                }
                else if (jqWidget.option("warningMessage")) {
                    jqWidget.$css($("#warning-msg").get(0), styles);
                    $("#warning-msg").text(jqWidget.option("warningMessage")).show();
                    jqWidget.option("warningMessageVisible",true);
                }
            }
        },

        onFieldExit: function (jqWidget) {
            if (jqWidget.option("errorMessageVisible")) {
                $("#error-msg").hide();
                jqWidget.option("errorMessageVisible",false);
            } else if (jqWidget.option("warningMessageVisible")) {
                $("#warning-msg").hide();
                jqWidget.option("warningMessageVisible",false);
            }
        },

        markError: function (jqWidget, msg, type) {
            // assigning role="alert" so that JAWS reads-out the validation message
            if (type != "warning") {
                if ($("#error-msg").length < 1)
                    $("<div id='error-msg' role='alert'></div>").appendTo('body');
                jqWidget.option("errorMessage",msg);
                jqWidget.element.addClass("dataInvalid");
            } else {
                if ($("#warning-msg").length < 1)
                    $("<div id='warning-msg' role='alert'></div>").appendTo('body');
                jqWidget.option("warningMessage",msg);
            }

        },

        clearError: function (jqWidget) {
            this.onFieldExit(jqWidget);
            jqWidget.element.removeClass("dataInvalid");
            jqWidget.option("errorMessage",null);
            jqWidget.option("warningMessage",null);
        }
    });
})(_, $, xfalib);
(function(_,$, xfalib) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype,
        BUFFER_SPC = 20;

    /* template for the clear Button */
    var clearButtonTemplate = '<div class="dp-clear">' +
        '<a></a>' +
        '</div>';

    /* template for the calendar
    * header contains the navigation icons (left and right arrows)
    * and the current caption (which can be date, year or month)
    *
    * monthview displays the grid for showing the dates for a particular
    * month
    *
    * yearview displays all the months of that year
    *
    * yearsetview displays a grid of 16 years. This can be configured
    * through the option: yearsPerView
    *
    */
    var calendarTemplate = '<div class="dp-header">' +
        '<div class="dp-leftnav"></div>' +
        '<div class="dp-caption"></div>' +
        '<div class="dp-rightnav"></div>' +
        '</div>' +
        '<div class="view dp-monthview"></div>' +
        '<div class="view dp-yearview"></div>' +
        '<div class="view dp-yearsetview"></div>';

    /*template for the timer: not implemented yet */
    var watchTemplate = '<div class="dp-header">' +
        '<div class="dp-leftnav"></div>' +
        '<div class="dp-caption"></div>' +
        '<div class="dp-rightnav"></div>' +
        '</div>' +
        '<div class="view dp-monthview"></div>' +
        '<div class="view dp-yearview"></div>' +
        '<div class="view dp-yearsetview"></div>';

    /** default configuration options
     *
     * container: the html element where the datepicker template will be added
     *
     * yearsPerView: number of years to show in the yearset view
     *
     * width: with of the widget
     *
     * viewHeight: Height of the month,year and yearset view. This doesn't include
     *             the height of the header
     *
     * locale: locale information for the locale in which to show the datepicker which comprises of
     *        days: day names to display in the monthview
     *        months: month names to display in the yearview
     *        zero: string representation of zero in the locale. Numbers will be
     *              displayed in that locale only
     *        clearText: Text to display for the reset button
     *        name: name of the locale
     *
     * format: input format for the datepicker (not implemented)
     *
     * pickerType: type of the datetimepicker (date, datetime and time)
     *
     * positioning: element around which datepicker will be displayed. if null then it
     *              will be displayed around the input element
     *
     * showCalendarIcon: to show the Calendar on the right of the text field or not
     */

    var defaults = {
        container: "body",
        yearsPerView: 16,
        width: 433,
        viewHeight: 248,
        locale: {
            days:["S","M","T","W","T","F","S"],
            months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
            zero: "0",
            clearText: "Clear",
            name:"en_US"
        },
        format:"YYYY-MM-DD",
        pickerType:"date",
        positioning: null,
        showCalendarIcon: false
    },
    dates = [31,28,31,30,31,30,31,31,30,31,30,31],
    /*
     *  Actions to perform when clicked on the datepicker buttons
     *  for different views
     *  caption: view to show when clicked on caption
     *           (Year/YearSet/Month/null) null means don't change the view
     *  li: view to show when clicked on date, month or year element
     *  upDown: add(up key) or subtract(down key) current date (for monthview),
     *          month(Year View) or year(YearSetView) with the number provided
     *  key: identifies the key that needs to be changed for that view
     */
    viewAction = {
        Month: {
            caption: 'Year',
            li: null,
            key:"day",
            upDown:7
        },
        Year: {
            caption: "Yearset",
            li: "Month",
            key:"month",
            upDown:3
        },
        Yearset: {
            caption: null,
            li: "Year",
            key:"year",
            upDown:4
        }
    },
    headerClass = "header",

    DateTimePicker = function() {
        this.initialized = false;
    }

    $.extend(DateTimePicker.prototype, {
        /*
         * create the widget using the provided options
         */
        create: function(options) {
            var $dp,self = this,html="",prevNavWidth,nextNavWidth;
            this.options = $.extend({},defaults,options);
            // prevent memory leak since options.positioning holds reference to HTML DOM
            this.options.positioning = null;
            // If width of date-picker exceeds screen width then it'll take up the entire screen width in AF
            if(window.guideBridge && this.options.width > window.innerWidth) {
               this.options.width=window.innerWidth - BUFFER_SPC; // buffer
            }
            if(this.options.pickerType.match(/date/)) {
                html += calendarTemplate;
            }

            if(this.options.pickerType.match(/time/)) {
                html += watchTemplate;
            }

            html += clearButtonTemplate;

            $.extend(this, {
                selectedDay:0,
                selectedMonth:0,
                selectedYear:0,
                currentDay:0,
                currentMonth:0,
                currentYear:0,
                touchSupported : xfalib.ut.TouchUtil.TOUCH_ENABLED,
                _visible:false,
                _defaultView:"Month",
                _keysEnabled:false,
                $dp:$("<div></div>").addClass("datetimepicker")
                                    .width(this.options.width)
                                    .append(html)
                                    .addClass("datePickerTarget")
                                    .appendTo(this.options.container)
                                    .toggleClass("datetimepicker-notouch",this.touchSupported),
                $month: $(".dp-monthview",this.$dp).height(this.options.viewHeight),
                $year: $(".dp-yearview",this.$dp).height(this.options.viewHeight),
                $yearset : $(".dp-yearsetview",this.$dp).height(this.options.viewHeight)
            });
            this.actualWidth = Math.floor(this.$dp.width());
            $('.dp-clear a',this.$dp).bind("click", $.proxy(this._clearDate,this));
            prevNavWidth = $(".dp-leftnav",this.$dp).bind("click",
                                                            function(evnt) {
                                                                self._adjustDate(-1,self.view)
                                                            })
                                                    .outerWidth(true)
            nextNavWidth = $(".dp-rightnav",this.$dp).bind("click",
                                                            function(evnt) {
                                                                self._adjustDate(1,self.view)
                                                            })
                                                     .outerWidth(true)
            this.$caption = $(".dp-caption",this.$dp).width(this.actualWidth - prevNavWidth - nextNavWidth)
                                                     .bind("click",
                                                            function(evnt) {
                                                                if(!self.$caption.hasClass("disabled")) {
                                                                    self._layout(viewAction[self.view].caption);
                                                                }
                                                       });

            // attach click event on entire datePicker popup
            $(this.$dp).on("click",
                function(evnt) {
                    //focus only if the device doesn't support touch
                    // input otherwise on screen keyboard will popup
                    if(!self.touchSupported)
                        self._curInstance.$field.focus();
                });

            $(window).on("touchstart.datetimepicker mousedown.datetimepicker",self._checkWindowClicked);
            this._curInstance = null;
        },

        /*
         * attaches the date picker to the field. This is a one time operation
         * First creates a configuration object and stores it in the field data attributes
         * then attaches event handlers on click, focus (to show the picker) and blur (to hide) events
         */
        _attachField: function($field,options, value) {
            var inst = this._newInst($field,options, value),
                self = this,
                activateField = function(evnt) {
                    var data = xfaUtil.$data(evnt.target,"datetimepicker");
                    if(data.access == false) {
                        return;
                    }
                    if(!self._curInstance)
                         self._activateField(evnt);

                    if(self.options.showCalendarIcon) {
                        if (evnt.type === self.getEvent()) {
                            if (self._iconClicked) {
                                self._iconClicked = false;
                                self._show();
                            } else {
                                self._hide(); // deactivate calendar popup if field/caption is clicked
                                self._curInstance.$field.focus(); // bring back focus in field
                            }
                        }
                    } else {
                        /*show the popup only if
                         1. click/touch event
                         2. focus event in case of non-touch devices and focus is not done using script
                         */
                        if (evnt.type === self.getEvent() || (evnt.type === "focus" && !self.touchSupported && !self.scriptFocus)) {
                            self._show(evnt);
                        }
                    }

                    self._clickedWindow = true;
                    self.scriptFocus = false;
                },
                deactivateField = function(evnt) {
                    //deactivate only if clicked outside window
                    // on touch devices only keyboard or calander should be active at once, touching keyboard should deactivate calendar
                    if (self._clickedWindow && (self.options.showCalendarIcon || !self.touchSupported)) {
                        self._hide();
                        self._deactivateField();
                        self._clickedWindow = true;
                    }
                };
            xfaUtil.$data($field[0],"datetimepicker",inst);

            $field.bind(this.getEvent(),activateField)
                  .focus(activateField)
                  .blur(deactivateField);
            if(options.showCalendarIcon) {
                $("<div/>").addClass("datepicker-calendar-icon")
                    .insertAfter($field)
                    .css({
                        "width": options.iconWidth + "px",
                        "height": options.iconWidth + "px"
                    })
                    .on(this.getEvent(), function (evnt) {
                        self._iconClicked = true;
                        $field.click();
                    });
            }
        },

        _newInst: function($f,options, value) {
            return {
                $field:$f,
                locale: options.locale,
                positioning: options.positioning || $f,
                access:options.access,
                selectedDate:options.value,
                editValue :options.editValue
            }
        },

        /*
         * To check where the click happened, if happened outside the datepicker
         * then hide the picker. This is checked whether any ancestor of clicked target
         * has a class datePickerTarget. This class is added to the attached element as well
         */
        _checkWindowClicked : function(evnt) {
            var self = adobeDateTimePicker;
            if(self._curInstance) {
                // datepickerTarget class depicts that the component is a part of the Date Field
                // and on click of that class, we should not hide the datepicker or fire exit events.
                if(!$(evnt.target).closest(".datePickerTarget").length) {
                    //non-touch devices do not deactivate on blur. Hence needs to be done here
                    if(self.touchSupported) {
                        self._hide()
                        //clicking outside a field doesn't blur the field in IPad. Doing it by script
                        self._curInstance.$field[0].blur()
                        self._deactivateField()
                    } else{
                        self._clickedWindow = true;
                    }
                }
                else {
                    self._clickedWindow = false;
                }
            }
        },

        /*
         * handling of key strokes. All the key strokes prevent the default browser action
         * unless specified otherwise
         * tab: hides the datepicker and perform default browser action
         * escape: hides the datepicker
         * down arrow key: show the picker if it is hidden, or helping in changing the dates
         * up arrow key: navigate the picker upwards by the number specified in actionView.upDown of the current View
         * left arrow key: navigate the picker one unit of that view backward
         * right arrow key: navigate the picker one unit of that view forward
         * shift + up: perform the action that happens on clicking the caption (as specified in actionView.caption)
         * shift + left: perform the action that happens on clicking the left navigation button
         * shift + right: perform the action that happens on clicking the right navigation button
         * space: select the current focussed date.
         */
        _hotKeys: function(evnt) {
            var handled = false, date;
            switch(evnt.keyCode) {
                case 9: //tab
                    adobeDateTimePicker._hide();
                    handled=false;
                    break;
                case 27: //escape
                    adobeDateTimePicker._hide();
                    handled = true;
                    break;
                case 40: //down arrow key
                    if(!this._visible) {
                        this._show();
                        return;
                    }
                    this.$focusedDate.addClass("dp-focus");
                    break;
            }

            if(adobeDateTimePicker._visible && this._keysEnabled) {
                var v = viewAction[this.view].key,
                    updown=viewAction[this.view].upDown;
                switch(evnt.keyCode) {
                    case 32: //select on space
                        this.hotKeyPressed = true;
                        if(this.$focusedDate)
                            this.$focusedDate.trigger("click");
                        this.hotKeyPressed = false;
                        handled = true;
                        break;
                    case 37: //left arrow key
                        if(evnt.shiftKey)
                            $(".dp-leftnav",this.$dp).triggerHandler("click");
                        else
                            this._adjustDate(-1,v);
                        handled = true;
                        break;
                    case 38: //up arrow key
                        if(evnt.shiftKey)
                            this.$caption.triggerHandler("click");
                        else
                            this._adjustDate(-updown,v);
                        handled = true;
                        break;
                    case 39: //right arrow key
                        if(evnt.shiftKey)
                            $(".dp-rightnav",this.$dp).triggerHandler("click");
                        else
                            this._adjustDate(+1,v);
                        handled = true;
                        break;
                    case 40: //down arrow key
                        this._adjustDate(updown,v);
                        handled = true;
                        break;
                    default:
                }
            }
            if(handled) {
                evnt.preventDefault();
            }
        },

        /*
         * show the datepicker.
         */
        _show: function() {
            if(this._curInstance.access == false)
                return;
            this.options.locale = this._curInstance.locale;
            if(!this._visible) {
                var self = this,
                    date = new Date(),
                    val,
                    validDate;
                //Bug#3607735:
                // Date constructor in ipad 5.1 doesn't support "YYYY-MM-DD", hence parsing the date on our own
                validDate = xfalib.ut.DateInfo.ParseIsoString(this._curInstance.selectedDate);
                date = (validDate != null)? validDate.getDate(): new Date();
                this.selectedDay = this.currentDay = date.getDate();
                this.selectedMonth = this.currentMonth = date.getMonth();
                this.selectedYear = this.currentYear = date.getFullYear();
                $('.dp-clear a',this.$dp).text(this.options.locale.clearText);
                this._layout('Month');
                this._position();
                this.$dp.show();
                this._visible = true;
                if (this.options.showCalendarIcon) {
                    this._curInstance.$field.attr('readonly', true);    // when the datepicker is active, deactivate the field
                }
            }

            //   Disabling the focus on ipad  due to a bug where value of
            // date picker is not being set
            // Removing this code will only hamper one use case
            // where on ipad if you click on the calander then
            // the field becomes read only so
            // there is no indication where the current focus is
            // And  if you remove this foucs code all together
            // then what happens is that on desktop MF in iframe the exit event
            // is not getting called hence calander getting remained open even
            // when you click somewhere on window or focus into some other field
            if (this.options.showCalendarIcon  && !this.touchSupported ) {
                this._curInstance.$field.focus(); // field loses focus after being marked readonly, causing blur event not to be fired later
            }
        },

        /*
         * position the datepicker around the positioning element
         * provided in the options
         */
        _position: function() {
            var $elem = this._curInstance.positioning,
                windowScrollX = window.scrollX/ xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowScrollY = window.scrollY/ xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowInnerHeight = window.innerHeight/ xfalib.ut.XfaUtil.prototype.formScaleFactor,
                windowInnerWidth = window.innerWidth/ xfalib.ut.XfaUtil.prototype.formScaleFactor,
                height = $elem.outerHeight(true),
                width  = $elem.outerWidth(true),
                top = $elem.offset().top / xfalib.ut.XfaUtil.prototype.formScaleFactor + height,
                left = $elem.offset().left / xfalib.ut.XfaUtil.prototype.formScaleFactor,
                styles = {"top": (top+"px"), "left": (left+"px")},
                diffBottom = top + this.$dp.outerHeight(true) - windowInnerHeight - windowScrollY,
                newLeft,
                newTop;
            if(diffBottom > 0) {
                //can't appear at the bottom
                //check top
                newTop = top - height - this.$dp.outerHeight(true) - BUFFER_SPC;
                if(newTop < windowScrollY) {
                    //can't appear at the top as well ... the datePicker pop up overlaps the date field
                    newTop = top - diffBottom;
                    // Fix for BUG #3626974
                    if(xfaUtil.isWebkit() && !this.options.showCalendarIcon) {
                        this._curInstance.$field.trigger("onoverlap.datetimepicker");
                    }
                }
                styles.top = newTop + "px";
            }
            if(left + this.$dp.outerWidth(true) > windowScrollX + windowInnerWidth ) {
                //align with the right edge
                newLeft = windowScrollX + windowInnerWidth - this.$dp.outerWidth(true) - BUFFER_SPC;
                styles.left = newLeft + "px";
            }
            xfaUtil.$css(this.$dp.get(0), styles);
            return this;
        },

        /*
         * layout the nextView. if nextView is null return
         *
         */
        _layout: function(nextView) {
            if(nextView == null) {
                this._hide();
            } else {
                if(this.view)
                    this['$'+this.view.toLowerCase()].hide();
                this.view = nextView;
                this.$caption.toggleClass("disabled",!viewAction[this.view].caption);
                this['$'+this.view.toLowerCase()].show();
                this["show"+this.view]();
            }
            return this;
        },

        /*
         * show the month view
         */
        showMonth: function() {
            var self = this,
                maxDay =   this._maxDate(this.currentMonth),
                prevMaxDay = this._maxDate((this.currentMonth + 12)%12),
                day1 = new Date(this.currentYear,this.currentMonth,1).getDay(),
                rowsReq = Math.ceil((day1 + maxDay) / 7) + 1,
                data,display;

            this.tabulateView(
                {
                    caption: this.options.locale.months[this.currentMonth] + ", "+ this._convertNumberToLocale(this.currentYear),
                    header:this.options.locale.days,
                    numRows:rowsReq,
                    numColumns:7,
                    elementAt: function(row,col) {
                        var day = (row-1)*7 + col - day1 + 1;
                        display = self._convertNumberToLocale(day);
                        data = day;
                        if(day < 1) {
                            display = self._convertNumberToLocale(prevMaxDay + day);
                            data = -1
                        }
                        else if(day > maxDay) {
                            display = self._convertNumberToLocale(day-maxDay);
                            data = -1;
                        }
                        return {
                            "data":data,
                            "display": display
                        };
                    }
                });
        },

        /*
         * show the year view
         */
        showYear: function() {
            var self = this,month;
            this.tabulateView(
                {
                    caption: this._convertNumberToLocale(this.currentYear),
                    numRows:4,
                    numColumns:3,
                    elementAt: function(row,col) {
                        month =  row*3 + col;
                        return {
                            "data":month,
                            "display": self.options.locale.months[month]
                        };
                    }
                });
        },

        /*
         * show the year set view
         */
        showYearset: function() {
            var year,self = this;
            this.tabulateView(
                {
                    caption: this._convertNumberToLocale(this.currentYear - this.options.yearsPerView/2) +"-"+this._convertNumberToLocale(this.currentYear - this.options.yearsPerView/2 + this.options.yearsPerView - 1),
                    numRows:4,
                    numColumns:4,
                    elementAt: function(row,col) {
                        year =  self.currentYear - 8 + (row*4 + col);
                        return {
                            "data":year,
                            "display": self._convertNumberToLocale(year)
                        };
                    }
                });
        },

        insertRow :  function(rowNum,rowArray,isHeader,height) {
            var $view = this["$"+this.view.toLowerCase()],
                width = (this.actualWidth)/rowArray.length,
                $row = $("ul",$view).eq(rowNum),
                items,$li,element,$tmp,
                self= this;
            if(!$row.length)
                $row = $("<ul></ul>").appendTo($view).toggleClass(headerClass,isHeader);
            $row.height(height);
            items = $("li",$row).length;
            while(items++ < rowArray.length) {
                $tmp = $("<li></li>").appendTo($row)
                if(!isHeader)
                    $tmp.bind("click", $.proxy(this._selectDate,this));
            }

            _.each(rowArray, function(el,index) {
                $li = $("li",$row).eq(index);
                if(isHeader)
                    $li.text(rowArray[index]);
                else {
                    element = rowArray[index];
                    xfaUtil.$data($li.get(0), "value", element.data);
                    if(self._checkDateIsFocussed(element.data)) {
                        if(self.$focusedDate)
                            self.$focusedDate.removeClass("dp-focus");
                        self.$focusedDate = $li;
                        if(self._keysEnabled)
                            self.$focusedDate.addClass("dp-focus")
                    }
                    $li.toggleClass("dp-selected",self._checkDateIsSelected(element.data))
                        .toggleClass("disabled",element.data == -1).text(element.display)
                        .attr("title",element.data);
                }
                $li.css( {"height":height+"px","width":width+"px","line-height":height+"px"});
            })
            return $row;
        },

        /*
         * creates a tabular view based on the options provided. The options that can be passed are
         * numRows: number of rows that needs rendering
         * numCols: number of columns that needs rendering
         * caption: text for the datepickers caption element
         * header: an array of elements that identifies the header row
         * elementAt: a function(row, column) that returns an object (data: <data>, display: <display>) where
         *            <data> is the value to set for that view when the element at (row,column) is clicked and
         *            <display> is the value that will be visible to the user
         */
        tabulateView : function(options) {
            var r = 0,rows = 0,
                row = [],
                ht =  this.options.viewHeight/options.numRows,
                c;
            this.$caption.text(options.caption);
            if(options.header) {
                this.insertRow(r++,options.header,true,ht);
            }
            while(r < options.numRows) {
                c = 0;
                while(c < options.numColumns) {
                    row[c] = options.elementAt(r,c);
                    c++;
                }
                this.insertRow(r++,row,false,ht);
            }
            rows = $(".dp-"+this.view.toLowerCase()+"view ul:visible").length;
            while(rows > options.numRows) {
                $(".dp-"+this.view.toLowerCase()+"view ul").eq(--rows).hide();
            }
            while(options.numRows > rows) {
                $(".dp-"+this.view.toLowerCase()+"view ul").eq(rows++).show();
            }
        },

        _activateField : function(evnt) {
            this._curInstance = xfaUtil.$data(evnt.target,"datetimepicker");
            this._curInstance.$field.trigger("onfocus1.datetimepicker").addClass("datePickerTarget");
            // Issue LC-7049:
            // datepickerTarget should be added when activate the field and should be removed
            // after the fields gets deactivated.
            if (this.options.showCalendarIcon) {
                this._curInstance.$field.parent().addClass("datePickerTarget");
            }
            //enable hot keys only for non touch devices
            if(!this.touchSupported && !this._keysEnabled) {
                $(window).on("keydown.datetimepicker", $.proxy(this._hotKeys,this));
                this._keysEnabled = true;
            }
        },

        _deactivateField: function() {
            if(this._curInstance) {
                if(this._keysEnabled) {
                    $(window).off("keydown.datetimepicker")
                    this._keysEnabled = false;
                }
                //Bug#3607499: on deactivate check the value in the input box, if that is
                // different than the selected Date, change the selectedDate
                //if (this._curInstance.selectedDate != this._curInstance.$field.val()) {
                //    this._curInstance.selectedDate = this._curInstance.$field.val();
                //}
                this._curInstance.$field.trigger("onfocusout.datetimepicker").removeClass("datePickerTarget");
                // Issue LC-7049:
                // datepickerTarget should be added when activate the field and should be removed
                // after the fields gets deactivated. Otherwise clicking on any other datefield
                // will not hide the existing datepicker
                if (this.options.showCalendarIcon) {
                    this._curInstance.$field.parent().removeClass("datePickerTarget");
                }
                this._curInstance = null;
            }
        },

        _hide: function() {
            if(this._visible) {
                this.$dp.hide();
                this._curInstance.$field.trigger("onclose.datetimepicker");
                this._visible = false;
                if (this.options.showCalendarIcon) {
                    this._curInstance.$field.attr('readonly', false);    // when the datepicker is deactivated, activate the field
                }
            }
        },

        _adjustDate: function(step,view) {
            var maxDate,prevMaxDate;
            switch(view.toLowerCase()) {
                case "day":
                    this.currentDay += step;
                    maxDate = this._maxDate(this.currentMonth)
                    if(this.currentDay < 1) {
                        prevMaxDate =  this._maxDate((this.currentMonth - 1 + 12)%12);
                        this.currentDay = prevMaxDate + this.currentDay;
                        return this._adjustDate(-1,"month");
                    }
                    if(this.currentDay > maxDate) {
                        this.currentDay -= maxDate;
                        return this._adjustDate(+1,"month");
                    }
                    break;
                case "month":
                    this.currentMonth += step;
                    if(this.currentMonth > 11) {
                        this.currentYear++;
                        this.currentMonth = 0;
                    }
                    if(this.currentMonth < 0) {
                        this.currentYear--;
                        this.currentMonth = 11;
                    }
                    break;
                case "year":
                    this.currentYear += step;
                    break;
                case "yearset":
                    this.currentYear += step*this.options.yearsPerView;
                    break;
            }
            this._layout(this.view);
        },

        _checkDateIsSelected: function(data) {
            switch(this.view.toLowerCase()) {
                case "month":
                    return this.currentYear == this.selectedYear && this.currentMonth == this.selectedMonth && data == this.selectedDay;
                case "year":
                    return this.currentYear == this.selectedYear && this.selectedMonth == data;
                case "yearset":
                    return this.selectedYear == data;
            }
        },

        _checkDateIsFocussed: function(data) {
            switch(this.view.toLowerCase()) {
                case "month":
                    return data == this.currentDay;
                case "year":
                    return this.currentMonth == data;
                case "yearset":
                    return this.currentYear == data;
            }
        },

        _convertNumberToLocale : function(number) {
            var zeroCode = this.options.locale.zero.charCodeAt(0);
            number += "";
            var newNumber = [];
            for(var i = 0;i < number.length;i++) {
                newNumber.push(String.fromCharCode(zeroCode + parseInt(number.charAt(i))));
            }
            return newNumber.join("");
        },

        _clearDate: function() {
            var isDateEmpty = this._curInstance.$field.val() ? false : true;
            this.selectedYear
                = this.selectedMonth
                = this.selectedYear
                = -1;
            this._curInstance.selectedDate = "";
            this._curInstance.$field.val("");
            if (!isDateEmpty) {
                this._curInstance.$field.trigger("onvaluechange.datetimepicker", [
                    {selectedDate: ""}
                ]);
            }
            $(".dp-selected",this['$'+this.view.toLowerCase()]).removeClass("dp-selected");
        },

        getEvent : function() {
            return "click";//this.touchSupported ? "touchstart" : "click";
        },

        _pad2: function(m) {
            return m = m < 10 ?"0"+m:m;
        },

        toString : function() {
            return this.selectedYear +"-"+this._pad2(this.selectedMonth + 1)+"-"+this._pad2(this.selectedDay);
        },

        _selectDate : function(evnt) {
            var val = xfaUtil.$data(evnt.target, "value"),
                nextView = viewAction[this.view].li,
                editVal;
            //disabled dates have a value of -1. Do nothing in that case
            if(val == -1)
                return;
            switch(this.view.toLowerCase()) {
                case "month":
                    this.selectedMonth = this.currentMonth;
                    this.selectedYear = this.currentYear;
                    this.selectedDay = val;
                    this._curInstance.selectedDate = this.toString();
                    editVal = this._curInstance.editValue(this.toString());
                    this._curInstance.$field.val(editVal)
                    this._curInstance.$field.trigger("onvaluechange.datetimepicker", [
                        {selectedDate: editVal}
                    ]);
                    $(".dp-selected",this['$'+this.view.toLowerCase()]).removeClass("dp-selected");
                    $(evnt.target).addClass("dp-selected");
                    break;
                case "year":
                    this.currentMonth = val;
                    break;
                case "yearset":
                    this.currentYear = val;
                    break;
            }
            this._layout(nextView);
            //manually focus on the field if clicked on the popup buttons for non-touch device
            if(!this.touchSupported) {
                //No need to focus if selection is made by pressing space.
                if(!this.hotKeyPressed) {
                    this.scriptFocus = true;
                }
            } else if(nextView == null){
                //For touch devices, deactivate the field if a selection is made
                this._deactivateField()
            }
        },

        _leapYear : function() {
            return this.currentYear % 400 == 0 || (this.currentYear % 100 != 0 && this.currentYear % 4 == 0);
        },

        _maxDate : function(m) {
            if(this._leapYear() && m == 1)
                return 29;
            else return dates[m];
        },

        _access: function(val) {
            if(typeof val == "undefined")
                return this.access
            this.access = val;
        },

        _value:function(val) {
            if(typeof val == "undefined")
                return this.$field.val()
            else {
                this.selectedDate = val;
                this.$field.val(this.editValue(val));
            }
        }
    });

    var adobeDateTimePicker = new DateTimePicker();

    $.fn.adobeDateTimePicker = function(options, value) {
        if(!adobeDateTimePicker.initialized) {
            adobeDateTimePicker.create(options);
            adobeDateTimePicker.initialized = true;
        }
        if(typeof options === "object") {
            adobeDateTimePicker._attachField(this, options);
        }
        else if(typeof options === "string") {
            if(arguments.length == 2)
                adobeDateTimePicker["_"+options].apply(xfaUtil.$data(this[0],"datetimepicker"),[value])
            else
                return adobeDateTimePicker["_"+options].apply(xfaUtil.$data(this[0],"datetimepicker"))
        }
        return this;
    }
})(_, $, xfalib);
(function (xfalib) {
    xfalib.ut.TouchUtil = (function () {
        var touchAvailable = !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) ,
            pointerEnabled = !!(window.MSPointerEvent || window.PointerEvent) ,
            POINTER_DOWN_EVENT = "mousedown",
            POINTER_MOVE_EVENT = "mousemove",
            POINTER_UP_EVENT = "mouseup",
            EVENT_TYPE = "MouseEvent";

        if (window.PointerEvent) { //> IE11
            POINTER_DOWN_EVENT = "pointerdown";
            POINTER_MOVE_EVENT = "pointermove";
            POINTER_UP_EVENT = "pointerup";
            EVENT_TYPE = "PointerEvent";

        } else if (window.MSPointerEvent) { // IE10
            POINTER_DOWN_EVENT = "MSPointerDown";
            POINTER_MOVE_EVENT = "MSPointerMove";
            POINTER_UP_EVENT = "MSPointerUp";
            EVENT_TYPE = "MSPointerEvent" ;

        } else if (touchAvailable) {  // other touch devices
            POINTER_DOWN_EVENT = "touchstart";
            POINTER_MOVE_EVENT = "touchmove";
            POINTER_UP_EVENT = "touchend";
            EVENT_TYPE = "TouchEvent";
        }
        return {
            TOUCH_ENABLED: touchAvailable,
            // new MS Pointer Events
            POINTER_EVENT: EVENT_TYPE,
            POINTER_ENABLED: pointerEnabled,
            POINTER_DOWN: POINTER_DOWN_EVENT,
            POINTER_MOVE: POINTER_MOVE_EVENT,
            POINTER_UP: POINTER_UP_EVENT,
            getTouchEvent: function (evt) {
                var target;
                if (pointerEnabled) {
                    target = evt.originalEvent;
                } else if (touchAvailable && evt.originalEvent) {
                    target = evt.originalEvent.touches[0];
                    //if (evt.originalEvent && evt.originalEvent.changedTouches && evt.originalEvent.changedTouches[0]) {
                    //    te = evt.originalEvent.changedTouches[0];
                    //}
                } else {
                    target = evt;
                }
                return target;
            },
            getPointerEvent: function (eventType) {
                var event = null;
                if ((typeof PointerEvent) === "function") {
                    event = new PointerEvent(eventType, {
                        bubbles: true,
                        cancelable: true
                    });
                } else {
                    event = document.createEvent(EVENT_TYPE);
                    event.initEvent(eventType, true, true);
                }
                return event;
            },
            getTouches:function(evt){
                var touches = [];
                if(touchAvailable && evt.originalEvent && evt.originalEvent.touches ){
                    touches = evt.originalEvent.touches;
                }
                return touches;
            }
        };
    })();
})(xfalib);
(function ($) {
    $.widget("xfaWidget.abstractWidget", {

        $userControl: null,

        $data: xfalib.ut.XfaUtil.prototype.$data,

        $css: xfalib.ut.XfaUtil.prototype.$css,

        getOrElse: xfalib.ut.Class.prototype.getOrElse,

        dIndexOf: xfalib.ut.XfaUtil.prototype.dIndexOf,

        btwn: xfalib.ut.XfaUtil.prototype.btwn,

        logger: xfalib.ut.XfaUtil.prototype.getLogger,

        localeStrings: xfalib.ut.XfaUtil.prototype.getLocaleStrings,

        logMsgs: xfalib.ut.XfaUtil.prototype.getLogMessages,

        errorManager: xfalib.ut.XfaUtil.prototype.getErrorManager,

        _widgetName: "abstractWidget",

        // if there are any specific black listed attributes, each widget should define their own
        _blackListedAttributes : ["type"],

        options: {
            name: "",
            value: null,
            commitProperty: "value",
            displayValue: null,
            screenReaderText: null,
            tabIndex: 0,
            role: null,
            paraStyles: null,
            dir: null,
            errorMessage: null,
            warningMessage: null,
            hScrollDisabled: false,
            placeholder:"",
            isValid:true
        },

        getOptionsMap: function () {
            return {
                "tabIndex": function (val) {
                    this.$userControl.attr("tabindex", val);
                },
                "role": function (val) {
                    if (val)
                        this.$userControl.attr("role", val);
                },
                "screenReaderText": function (val) {
                    if (val)
                        this.$userControl.attr("aria-label", val)
                },
                "paraStyles": function (val) {
                    if (val)
                        this.$css(this.$userControl.get(0), val);
                },
                "dir": function (val) {
                    if (val)
                        this.$userControl.attr("dir", this.options.dir);
                },
                "height": function (val) {
                    if (val) {
                        this.$css(this.$userControl[0], {"height": val})
                    }
                },
                "width": function (val) {
                    if (val)
                        this.$css(this.$userControl[0], {"width": val})
                },
                "isValid": function (val) {
                    if(val){
                      this.$userControl.removeAttr("aria-invalid");
                    } else {
                      this.$userControl.attr("aria-invalid",true);
                    }
                },
                "color" : function(value) {
                    if(!_.isEmpty(value)) {
                        var color = "rgb(" + value + ")";
                        this.$css(this.$userControl[0], {"color": color});
                    }
                },
                "font-style" : function (value) {
                    if (!_.isEmpty(value)) {
                        this.$css(this.$userControl[0], {"font-style": value});
                    }
                }
            };
        },

        getEventMap: function () {
            return {
                "focus": xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,
                "blur": xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                "click": xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT
            };
        },

        /**
         * Copies all the attributes from source jquery object to destination jquery object
         * @param $src      source jquery object
         * @param $dest     destination jquery object
         */
        copyAttributesFromSrcToDest : function($src, $dest){
            var that = this;
            // let's get all the attribute from the src element and copy it to dest jquery object
            if($src != null && $src[0] && $src[0].attributes && $dest != null){
                $.each($src[0].attributes, function() {
                    // we don't add the black listed set of attributes
                    if(this.specified && this.value != null && _.isString(this.value) && this.value.length > 0 && that._blackListedAttributes.indexOf(this.name) === -1) {
                        $dest.attr(this.name, this.value);
                    }
                });
            }
        },

        _create: function () {
            this.widgetEventPrefix = "";
            this.element.addClass(this._widgetName);
            this.$userControl = this.render();
            this.optionsHandler = this.getOptionsMap();
            this.eventMap = this.getEventMap();
            this._initializeOptions();
            this._initializeEventHandlers();
            this.errObj = this.errorManager();
            //call it only after render
            // Dirty hack to prevent this being called in Guide
            if (typeof guidelib === "undefined") {
                this.$css(this.$userControl.get(0), {
                    "box-sizing": "border-box",
                    "position": "absolute"
                });
            }
        },

        _initializeEventHandlers: function () {
            xfalib.ut.XfaUtil.prototype.getLogger().debug("xfa", "initialize event handlers for " + this._widgetName);
            _.each(this.eventMap, function (xfaevent, htmlevent) {
                var self = this;
                if (xfaevent) {
                    if (!(xfaevent instanceof  Array)) {
                        xfaevent = [xfaevent];
                    }
                    for (var i = 0; i < xfaevent.length; i++) {
                        xfalib.ut.XfaUtil.prototype.getLogger().debug("xfa", "binding " + htmlevent + " with " + xfaevent[i]);
                        this.$userControl.bind(htmlevent,
                            (function (xfevnt) {
                                return function (evnt) {
                                    xfalib.ut.XfaUtil.prototype.getLogger().debug("xfa", "trigger " + evnt.type +
                                    " xfa-event " + xfevnt);
                                    self._preProcessEvent.apply(self, [xfevnt, evnt]);
                                    //since the fix https://github.com/jquery/jquery/pull/972, Fix for keeping namespace when triggering an event using an Event #972
                                    //we need to clear the namespace and its regular expression of triggering event, as the listeners are registered on un-namespaced events
                                    evnt.namespace = "";
                                    evnt.namespace_re = "";
                                    self._trigger(xfevnt, evnt);
                                    self._postProcessEvent.apply(self, [xfevnt, evnt]);
                                }
                            })(xfaevent[i])
                        )

                    }
                }
            }, this)
        },

        _preProcessEvent: function (xfaevent, htmlevent) {
            if (xfaevent == this.options.commitEvent) {
                this.preProcessCommit(htmlevent);
            }
            switch (xfaevent) {
                case xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT:
                    this.preProcessEnter(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT:
                    this.preProcessExit(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT:
                    this.preProcessChange(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT:
                    this.preProcessClick(htmlevent);
                    break;
            }

        },

        _postProcessEvent: function (xfaevent, htmlevent) {
            if (xfaevent == this.options.commitEvent) {
                this.postProcessCommit(htmlevent);
            }
            switch (xfaevent) {
                case xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT:
                    this.postProcessEnter(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT:
                    this.postProcessExit(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT:
                    this.postProcessChange(htmlevent);
                    break;
                case xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT:
                    this.postProcessClick(htmlevent);
                    break;
            }
        },

        _initializeOptions: function () {
            _.each(this.optionsHandler, function (value, key) {
                if (typeof value === "function")
                    value.apply(this, [this.options[key]]); // TODO: check whether it is needed for initialization or not
            }, this)
        },

        _setOption: function (key, value) {
            if (this.options[key] != value) {
                this.options[ key ] = value;
                if (typeof this.optionsHandler[key] === "function") {
                    this.optionsHandler[key].apply(this, [this.options[key]])
                }
            }
        },

        /**
         * @override
         */
        option: function (key, value) {
            if (arguments.length === 1 &&
                typeof key === "string" &&
                this.options.hasOwnProperty(key) &&
                this.options[key] === undefined) {
                return undefined;
            }
            return $.Widget.prototype.option.apply(this, arguments)
        },

        destroy: function () {
            this.$userControl.removeClass(this._widgetName);
        },


        render: function () {
            var control;
            if (this.element.children().length > 0) {
                control = $(this.element.children().get(0));
            }
            else
                control = this.element;
            control.attr("name", this.options.name)
            return control;
        },


        preProcessCommit: function (evnt) {
            this.options.value = this.getCommitValue();
            xfalib.ut.XfaUtil.prototype.getLogger().debug("xfa", "passing commit value " + this.options.value +
            "to model ");
        },

        getCommitValue: function () {

        },

        preProcessExit: function (evnt) {

        },

        preProcessEnter: function (evnt) {
            //Only focus the enabled widgets
            if (this.options.access === "open") {
                this._showError();
                this.showValue();
            }
        },

        preProcessChange: function (evnt) {

        },

        preProcessClick: function (evnt) {

        },

        postProcessCommit: function (evnt) {
            this.showDisplayValue();
        },

        postProcessExit: function (evnt) {
            //Only for the enabled widgets
            if (this.options.access === "open") {
                this.showDisplayValue();
                this._hideError();
            }
        },

        postProcessEnter: function (evnt) {
        },

        postProcessChange: function (evnt) {

        },

        postProcessClick: function (evnt) {

        },

        showDisplayValue: function () {
            this.$userControl.val(this.options.displayValue)
        },

        /**
         * Checks if the edit value is same as value present in the user control(html form element)
         * @returns {boolean}
         */
        _isValueSame : function(){
            return (((this.options.value === null) && (this.$userControl.val() === "")) || (this.options.value === this.$userControl.val()));
        },

        showValue: function () {
            // May be $userControl doesn't have val(), using it as of now
            // If the value of the field is not same as edit value, only then set the value, this also solves IE bug of cursor
            // moving to the end of field on click
            if(!this._isValueSame()) {
                this.$userControl.val(this.options.value)
            }
        },

        focus: function () {
            var that = this;
            // setTimeout added to fix CQ-51141
            // While using setFocus API in adaptive form, the focus was not being set in TextBox on chrome
            // and also on click of caption of RadioButton/Checkbox, due to fast event execution, hence adding delay during focus.
            setTimeout(function(){
                that.$userControl[0].focus();
            }, 1);
        },

        click: function () {
            this.focus();
            this.$userControl.triggerHandler("click"); // we do not want the exact click as might bubble up to the field.
        },

        /* widget specific code */

        _showError: function () {
            if(this.errObj && _.isFunction(this.errObj.onFieldEnter)) {
                this.errObj.onFieldEnter(this);
            }
        },

        _calculatePaddingForVAlign:function(diff){
           var flagForMoz = $.browser.mozilla && !xfalib.ut.Utilities.isIE11() &&
                              this.options.multiLine,
               vAlignBottomOrTop = this.options.paraStyles &&
                                   (this.options.paraStyles["vertical-align"] == "bottom" ||
                                    this.options.paraStyles["vertical-align"] == "top");

           if(flagForMoz && vAlignBottomOrTop || $.browser.msie && this.options.multiLine) {
              return;
           }
           if (this.options.paraStyles && diff > 0) {
                var vAlign = this.options.paraStyles["vertical-align"];
                if (vAlign == "bottom") {
                    diff = diff - this.options.paraStyles["padding-bottom"];
                    this.$userControl.css("padding-top", diff);
                    this.padding = this.$userControl.css("padding-top");
                }
                else if (vAlign == "top" || (vAlign != "middle" && vAlign == undefined)) {
                    if (this.options.paraStyles["padding-top"])
                        diff = diff - this.options.paraStyles["padding-top"];
                    this.$userControl.css("padding-bottom", diff);
                    this.padding = this.$userControl.css("padding-bottom");
                }
                else if (this.options.multiLine && vAlign == "middle") {
                    var newDiff = diff / 2;
                    newDiff = newDiff - this.options.paraStyles["padding-bottom"];
                    if (this.options.paraStyles["padding-top"])
                        newDiff = newDiff + this.options.paraStyles["padding-top"];
                    this.$userControl.css("padding-top", newDiff);
                }
            }
        },

        _handleVAlignOnExit: function (evnt) {

            if (!this.options.paraStyles) {
                //vAlign has to be handled only if there is paraStyles
                return;
            }
            var value = this.options.displayValue,
                lineHeight = xfalib.view.util.TextMetrics.measureExtent(value, {refEl: this.$userControl.get(0), maxHeight: -1}).height,
                widgetHeight = this.options.height,
                diff = widgetHeight - lineHeight;
            this._calculatePaddingForVAlign(diff);

        },

        _handleVAlignOnEnter: function (evnt) {
            //Only align the enabled widgets
            var flagForIE = $.browser.msie && this.options.multiLine;
            if (this.options.paraStyles && !flagForIE) {
                 var vAlign = this.options.paraStyles["vertical-align"];
                 if (vAlign == "bottom" && this.padding)
                     this.$userControl.css("padding-top", this.padding);
                 else if (vAlign == "top" && this.padding)
                     this.$userControl.css("padding-bottom", this.padding);
            }
        },

        _hideError: function () {
            if(this.errObj && _.isFunction(this.errObj.onFieldExit)) {
                this.errObj.onFieldExit(this);
            }
        },

        markError: function (msg, type) {
            if(this.errObj && _.isFunction(this.errObj.markError)) {
                this.errObj.markError(this, msg, type);
            }
        },

        clearError: function () {
            if(this.errObj && _.isFunction(this.errObj.clearError)) {
                this.errObj.clearError(this);
            }
        },

        getEditValue: function(value) {
            if(this.options.editPattern == null) {
                return value;
            }
            try {
                return xfalib.ut.PictureFmt.format(value, this.options.editPattern);
            } catch(e) {
                return null;
            }
        },

        parseEditValue: function(value) {
            if(this.options.editPattern == null) {
                return value;
            }
            try {
                return xfalib.ut.PictureFmt.parse(value, this.options.editPattern);
            } catch(e) {
                return value;
            }
        }
    });
})($);
(function($) {
    $.widget( "xfaWidget.defaultWidget", $.xfaWidget.abstractWidget, {

        _widgetName: "defaultWidget",

        getOptionsMap: function() {
            var parentOptionsMap = $.xfaWidget.abstractWidget.prototype.getOptionsMap.apply(this,arguments);
            return $.extend({},parentOptionsMap,{
                "access": function(val) {
                    switch(val) {
                        case "open" :
                            this.$userControl.removeAttr("readOnly");
                            this.$userControl.removeAttr("aria-readonly");
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                        case "nonInteractive" :
                        case "protected" :
                            this.$userControl.attr("disabled", "disabled");
                            this.$userControl.attr("aria-disabled", "true");
                            break;
                        case "readOnly" :
                            this.$userControl.attr("readOnly", "readOnly");
                            this.$userControl.attr("aria-readonly", "true");
                            break;
                        default  :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                    }
                },

                "displayValue": function(val) {
                    if(this.options.commitProperty) {
                        if($.browser.mozilla && this.options.commitProperty == "value") {
                            // on submitting form firefox does not remember autocomplete values, if updated through attr()
                            this.$userControl.val(this._displayEmptyStringForIE(this.options.displayValue));
                        } else {
                            this.$userControl.prop(this.options.commitProperty, this._displayEmptyStringForIE(this.options.displayValue));
                            this.$userControl.attr(this.options.commitProperty, this._displayEmptyStringForIE(this.options.displayValue));
                        }
                    } else {
                        this.logger().debug("xfaView", "[DefaultWidget._update], User Control or Commit Property is null");
                    }
                },

                "placeholder": function(value){
                    this.$userControl.attr("placeholder", value);
                }
            });
        },

        _displayEmptyStringForIE: function(value){
            /*CQ-69417: By default "null" is displayed in the comments text box
              "null" values shown in IE */
            return (value == null && xfalib.ut.Utilities.isIE11())?
                                          '':value;
        },

        render : function() {
            var control = $.xfaWidget.abstractWidget.prototype.render.apply(this,arguments)
            this._attachEventHandlers(control)
            return control
        },

        getCommitValue: function() {
            var value = this.$userControl.val();
            if(this.options.hScrollDisabled && !this.options.multiLine)
                var value = xfalib.ut.XfaUtil.prototype.splitStringByWidth(this.$userControl.val(),this.$userControl.width(),this.$userControl.get(0)) ;
            return value;
        },

        _attachEventHandlers: function($control) {
            $control.keydown($.proxy(this._handleKeyDown,this));
            $control.keypress($.proxy(this._handleKeyPress,this));
            $control.on('paste',$.proxy(this._handlePaste,this));
            $control.on('cut',$.proxy(this._handleCut,this));
        },

        _handleKeyDown : function(event){
            if(event.keyCode == 13 || event.charCode == 13 || event.which == 13) // touch devices may return charCode
                event.preventDefault();
        },

        _handleKeyPress : function(event){
            if(event.keyCode == 13 || event.charCode == 13 || event.which == 13) // touch devices may return charCode
                event.preventDefault();
        }
    });
})($);
(function($, _) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    $.widget( "xfaWidget.dateTimeEdit", $.xfaWidget.defaultWidget, {

        _widgetName : "dateTimeEdit",

        getEventMap: function() {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
            if(this._nativeWidget === false) {
                return $.extend({}, parentOptionsMap, {
                    "onfocus1.datetimepicker": xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,
                    "onvaluechange.datetimepicker": xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                    "onfocusout.datetimepicker": xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
                    "onoverlap.datetimepicker": xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT, // Custom Event to fix BUG #3626974
                    "input": xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT, // TODO : add handler for xfa.event.change
                    "focus": null,
                    "blur": null
                })
            } else {
                return $.extend({}, parentOptionsMap, {
                    "change": xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT
                })
            }
        },

        _getAdobeDatePickerOptionsMap : function(parentOptionsMap) {
            return {
                "access" : function (val) {
                    switch (val) {
                        case "open" :
                            this.$userControl.adobeDateTimePicker("access", true);
                            break;
                        case "nonInteractive" :
                        case "protected" :
                        case "readOnly" :
                            this.$userControl.adobeDateTimePicker("access", false);
                            break;
                    }
                    parentOptionsMap.access.apply(this, arguments);
                },
                "displayValue" : function (val) {
                    // set the value in the datepicker plugin
                    this.$userControl.adobeDateTimePicker("value", this.options.value);
                    // show the display value
                    this.showDisplayValue();
                }
            }
        },

        _getNativeDatePickerOptionsMap: function (parentOptionsMap) {
            return {
                "displayValue": function (val) {
                    this.showDisplayValue();
                }
            }
        },


        getOptionsMap: function() {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments),
                datePickerOptions = this._nativeWidget === false ? this._getAdobeDatePickerOptionsMap(parentOptionsMap)
                    : this._getNativeDatePickerOptionsMap(parentOptionsMap),
                commonOptions = {
                    "paraStyles": function (paraStyles) {
                        parentOptionsMap.paraStyles.apply(this, arguments);
                        this._handleVAlignOnExit();
                    },

                    "width": function (val) {
                        parentOptionsMap.width.apply(this, arguments);
                        if (this.options.showCalendarIcon && val) {
                            var effectiveWidth = val > this.options.height ? val - this.options.height : val;
                            this.$userControl.width(effectiveWidth);  // leave space for the cal icon
                        }
                    },

                    "screenReaderText": function (val) {
                        if (val) {
                            this.$userControl.attr("aria-label", val + " , " + xfalib.locale.Strings.dpFormatInst);
                        }
                    }
                };
            return $.extend({},parentOptionsMap,datePickerOptions, commonOptions);
        },

        postProcessExit: function(evnt) {
            $.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
            this._handleVAlignOnExit ();
        },

        preProcessEnter: function(evnt) {
            $.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
            this._handleVAlignOnEnter();
        },

        preProcessChange: function(evnt) {
           //CQ-46332:loss of date value in date-picker , setting the value here or else
           //it gets lost during focus
           if(this._nativeWidget === true){
            this.options.value = this.$userControl.val();
           }
        },

        showDisplayValue: function() {
            if(this._nativeWidget === false) {
                $.xfaWidget.defaultWidget.prototype.showDisplayValue.apply(this, arguments);
            } else {
                this.showValue();
            }
        },


        showValue: function () {
            if (this._nativeWidget == false) {
                this.$userControl.adobeDateTimePicker("value", this.options.value);
            } else {
                $.xfaWidget.defaultWidget.prototype.showValue.apply(this, arguments);
            }
            $.xfaWidget.textField.prototype._selectOnFocusInIE.apply(this, arguments);
        },

        getCommitValue: function() {
            if (this._nativeWidget === false) {
                // LC-3913078 : in case of prefill/default values, model may have a value not in accordance with
                // edit pattern.
                // While sending back value from model -> widget, parsing may fail, forcing get typed value to
                // return undefined, and model not getting updated.
                // So widget will use incorrect value from it's options. This may cause inadvertent side effect
                // if parsing succeeds on default patterns specified in the locale
                var value = this.$userControl.adobeDateTimePicker("value"),
                    parsedValue = this.parseEditValue(value),
                    isNotIsoString = _.isEmpty(xfalib.ut.DateInfo.ParseIsoString(parsedValue)),
                    isNotValidEmptyValue = value !== "" && value !== null;
                // LC-3913078 : only allow correctly parsed values to be committed
                //allowNonIsoValue is always true for AF, where as not defined in MF
                return this.options.allowNonIsoValue || !(isNotValidEmptyValue && isNotIsoString) ? parsedValue : undefined;
            }
            return $.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this, arguments);
        },

        render: function() {
            var self = this,
                textStyle = this.getOrElse(this.$data(this.element.get(0), "xfamodel"), "textstyle", ""),
                $control = $.xfaWidget.abstractWidget.prototype.render.apply(this, arguments),
                $source = $control,
                id,
                existingInlineStyleAttributeValues,
                newInlineStyleAttributeValues,
                combinedInlineStyleAttributeValues;
            existingInlineStyleAttributeValues = this.element.find("input").attr("style") || '';
            this._nativeWidget = true;
            if(this.options.useNativeWidget === false || $control[0].type !== "date") {
                this._nativeWidget = false;
                id = this.element.find("input")[0].id;
                this.element.children().remove();
                $("<div></div>").css({position: "relative", width: "100%", height: "100%"}) // want to fill entire width of containing table cell
                    .append($("<input type='text'/>"))
                    .appendTo(this.element);
                $control = $("input", this.element).
                    attr("style", textStyle).
                    attr("name", this.options.name).
                    attr("id", id).
                    adobeDateTimePicker({
                        positioning: this.element,
                        locale: {
                            months: this.options.months,
                            days: this.options.days,
                            zero: this.options.zero,
                            clearText: this.options.clearText
                        },
                        access: this.options.access,
                        value: this.options.value,
                        showCalendarIcon: this.options.showCalendarIcon,
                        iconWidth: _.min([40, Math.floor(this.options.height)]) - 2,
                        editValue: function (value) {
                            return self.getEditValue(value);
                        }
                    });
            }
            this._attachEventHandlers($control);
            newInlineStyleAttributeValues = this.element.find("input").attr("style") || '';
            //append the previous inlineStyleAttributeValues to newInlineStyleAttributeValues so that the inline styles
            //added from the dialog are applied.
            combinedInlineStyleAttributeValues = newInlineStyleAttributeValues + existingInlineStyleAttributeValues;
            this.element.find("input").attr("style", combinedInlineStyleAttributeValues);
            // only in case of adaptive form, we would copy the attributes back
            if(window.guideBridge) {
                // restore the original attribute back to destination object
                this.copyAttributesFromSrcToDest($source, this.element.find("input"));
            }
            return $control;
        }
    }) ;

})($, _);
(function($) {
$.widget("xfaWidget.numericInput", $.xfaWidget.defaultWidget, {

    _widgetName: "numericInput",

	options : {
		value : null,
		curValue: null,
        pos: 0,
        lengthLimitVisible: true,
        zero:"0",
        decimal:".",
        minus:"-"
	},

    //TODO: to support writing in different locales \d should be replaced by [0-9] for different locales
    _matchArray : {
                    "integer":"^[+-]?{digits}*$",
                    "decimal":"^[+-]?{digits}{leading}({decimal}{digits}{fraction})?$",
                    "float":"^[+-]?{digits}*({decimal}{digits}*)?$"
                  },

    _regex : null,

    _engRegex : null,

    _writtenInLocale : false,

    getOptionsMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "paraStyles": function(paraStyles){
                parentOptionsMap.paraStyles.apply(this,arguments);
                this._handleVAlignOnExit ();
            } ,

            "height": function(val) {
                if(val)   {
                    this.$css(this.$userControl[0],{"height" :val})
                    this._handleVAlignOnExit();    // To Handle the case of expandable Fields
                }
            }

        })
    },

    getEventMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "onKeyInput.numericInput" : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT
        })
    },

    _getDigits: function() {
        var zeroCode = this.options.zero.charCodeAt(0),
            digits = "";
        for(var i = 0;i < 10;i++) {
            digits += String.fromCharCode(zeroCode + i);
        }
        return "["+digits+"]"
    },

    _escape: function(str) {
      return str.replace(".","\\.")
    },

    postProcessExit: function(evnt) {
        $.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
        this._handleVAlignOnExit ();
    },

    preProcessEnter: function(evnt) {
        $.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
        this._handleVAlignOnEnter();
    },

	render : function() {
        var matchStr =  this._matchArray[this.options.dataType];
        if(matchStr) {
            var ld = this.options.leadDigits,
                fd = this.options.fracDigits,
                ldstr = ld && ld != -1 ? "{0,"+ld+"}"
                    : "*",
                fdstr = fd && fd != -1 ? "{0,"+fd+"}"
                    : "*",
                matchStr =  matchStr.replace("{leading}",ldstr)
                                    .replace("{fraction}",fdstr),
                localeStr = matchStr.replace(/{digits}/g,this._getDigits())
                                    .replace("{decimal}",this._escape(this.options.decimal)),
                engStr = matchStr.replace(/{digits}/g,"[0-9]")
                                .replace("{decimal}","\\.")
            this._processValue = !(this._getDigits() == "[0123456789]" && this.options.decimal == ".")
            this._regex = new RegExp(localeStr, "g");
            this._engRegex = new RegExp(engStr, "g");
        }
        return $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments);
    },

    getCommitValue: function() {
        var value = $.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this, arguments)
        if(value.length > 0 && this._processValue && !value.match(this._engRegex)) {
            this._writtenInLocale = true
            value = this._convertValueFromLocale(value);
        } else {
            this._writtenInLocale = false
        }
        if(value && value.length >= this.options.combCells )
            value = value.slice(0,this.options.combCells);
        return value;
    },

    _attachEventHandlers : function($control) {
		$.xfaWidget.defaultWidget.prototype._attachEventHandlers.apply(this,arguments);
	},

    _handleKeyInput : function(event, character, code){
        if(event.ctrlKey && !_.contains(['paste', 'cut'], event.type)) {
            return true;
        }

        $.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this,arguments);
        this.options.lengthLimitVisible = true;

        var val = this.$userControl.prop(this.options.commitProperty) || '',
            pos = xfalib.view.util.HtmlUtil.getHTMLSupportedAttr(this.$userControl[0], "selectionStart") || 0,
            selectionStart = pos,
            selectionEnd = xfalib.view.util.HtmlUtil.getHTMLSupportedAttr(this.$userControl[0], "selectionEnd") || 0,
            combCells = parseInt(this.options.combCells) || 0,
            current,
            change = character;

        if (combCells > 0 ) {
            change = character.substr(0, combCells - val.length + selectionEnd - selectionStart);
        }

        current = val.substr(0, selectionStart) + change + val.substr(selectionEnd);

        if (!(this._regex == null || current.match(this._regex) || current.match(this._engRegex))) {
            event.preventDefault();
            return false;
        }
        if (!_.contains(['keydown', 'cut'], event.type) && combCells && (val.length >= combCells || current.length > combCells) && selectionStart === selectionEnd) {
            event.preventDefault();
            return false;
        }

        this.options.curValue = val;
        this.options.pos = pos;

        if(this.options.hScrollDisabled && !_.contains(['keydown', 'cut'], event.type)) {
            var expectedWidth = xfalib.view.util.TextMetrics.measureExtent(current, {refEl: this.$userControl[0], maxWidth:-1}).width;
            if(!event.ctrlKey && expectedWidth > this.$userControl.width() - 5){
                event.preventDefault();
                this.options.lengthLimitVisible = false;
            }
        }

        this.$userControl.trigger({
            type : "onKeyInput.numericInput",
            originalType : event.type,
            character : character,  // contains the pasted string or pressed key
            keyCode : event.keyCode || 0,
            charCode : event.charCode || 0,
            which : event.which || 0,
            ctrlKey : event.ctrlKey || event.metaKey || false,
            shiftKey : event.shiftKey || false,
            keyDown : false, // This property is available only for list boxes and drop-down lists
            selectionStart: selectionStart,
            selectionEnd: selectionEnd
        });
    },

    _handleKeyDown : function(event){
        if (event) {
            var code = event.charCode || event.which || event.keyCode || 0;
            if(code == 8 || code == 46) // backspace and del
               this._handleKeyInput(event, "", code);
            else if(code == 32) { // suppress space
                event.preventDefault();
                return false;
            }
        }
    },

    _isValidChar: function (character) {
        return character>='0' && character<='9' || character===this.options.decimal || character==='-'
    },

    _handleKeyPress : function(event){
        if (event) {
            var code = event.charCode || event.which || event.keyCode || 0,
                character = String.fromCharCode(code);

            if (event.key // Moz or IE11
                && !_.contains(['MozPrintableKey', 'Subtract', 'Decimal'], event.key)
                && event.key.length != 1) {
                    return true;   // mozilla also generates a keypress, along with keydown, for all keys
            }

            if (this._isValidChar(character))
                this._handleKeyInput(event, character, code);
            else if (!event.ctrlKey){
                event.preventDefault();
                return false;
            }
        }
    },

    _handlePaste : function(event){
        if (event) {
            var pastedChar = undefined;
            if (window.clipboardData && window.clipboardData.getData) { // IE
                pastedChar = window.clipboardData.getData('Text');
            } else if (event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
                pastedChar = event.originalEvent.clipboardData.getData('text/plain');
            }

            if(pastedChar) {
                var allPastedCharsValid = _.every(pastedChar.split(''), function (character) {
                    return this._isValidChar(character);
                }, this);
                if (allPastedCharsValid) {
                    this._handleKeyInput(event, pastedChar, 0);
                }
                else if (!event.ctrlKey) {
                    event.preventDefault();
                    return false;
                }
            }
        }
    },

    _handleCut : function(event) {
        if (event) {
            this._handleKeyInput(event, "", 0);
        }
    },
    // CQ-107886 : added handling for negative values, as for '-', '-3' was getting returned
    _convertValueToLocale: function(val) {
        var zeroCode = this.options.zero.charCodeAt(0);
        return  _.map(val,function(c) {
            if(c == ".") {
                return this.options.decimal;
            } else if(c == "-") {
                return this.options.minus;
            } else {
                return String.fromCharCode(parseInt(c) + zeroCode);
            }
        },this).join("");
    },

    _convertValueFromLocale: function(val) {
        var zeroCode = this.options.zero.charCodeAt(0);
        return  _.map(val,function(c) {
            if(c == this.options.decimal) {
                return ".";
            } else if(c == this.options.minus) {
                return "-";
            } else {
                return (c.charCodeAt(0) - zeroCode).toString();
            }
        },this).join("");
    },

    showValue : function() {
       // if the value is same, don't do anything
       if(!this._isValueSame()){
           if(this.options.value && this._writtenInLocale) {
               this.$userControl.val(this._convertValueToLocale(this.options.value))
           } else {
               this.$userControl.val(this.options.value)
           }
       }
       //IE doesn't show selected text if we focus and set its value all the time so force selection
       $.xfaWidget.textField.prototype._selectOnFocusInIE.apply(this, arguments);
    }
});
})($);(function ($, _) {
    $.widget("xfaWidget.dropDownList", $.xfaWidget.defaultWidget, {            //commitEvent: change; commitProperty: value<Array>

        _widgetName: "dropDownList",

        options: {
            value: [],
            items: [],
            editable: false,
            placeholder: "",
            displayValue: []
        },

        widgetSkeleton: '<select name="" style="" size = "1" role="combobox"><option id="emptyValue" role="option" value="" style="display: none;"></option></select>',
        optionSkeleton: '<option role="option" data-user-option></option>',
        optGroupSkeleton: '<optgroup label=""></optgroup>',
        AF_OPTGROUP_NAME: "afOptGroupName",
        PLACE_HOLDER_STYLE_CLASS : "placeHolder",

        getOptionsMap: function () {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "value": function (val) {
                    if (!_.isArray(val)) {
                        val = [val];
                    }
                    var found = false,
                        that = this;
                    //sync option selection as per new values
                    $("option", this.$userControl).each(function (index) {
                        var selectValue = $(this).val();
                        //Check if this value is present in options value array
                        if (_.contains(val, selectValue)) {
                            $(this).prop("selected", true);
                            found = true;
                        } else {
                            $(this).prop("selected", false);
                            if (this.id === "emptyValue") {
                                $(this).val("").html(that.options.placeholder).hide();
                            }
                        }
                    });
                    //If no value is found then set the emptyValue to true
                    if (val.length == 0 || val[0] == null) {
                        this.$userControl.children("#emptyValue").prop("selected", true);
                    } else if (!found) {
                        this.$userControl.children("#emptyValue").text(val[0]).
                            prop("selected", true).
                            val(_.escape(val[0])).
                            show();
                    }
                    this.$userControl.toggleClass(this.PLACE_HOLDER_STYLE_CLASS, val.length == 0 || val == null);
                },

                "items": function (val) {
                    if (!_.isArray(val)) {
                        val = [val];
                    }

                    var AF_OPTGROUP_NAME = "afOptGroupName";
                    var i, j, optgroupOptions = [], element, $viewOptgroup, $preOptgroup;
                    var viewOptgroups = $("optgroup", this.$userControl);
                    // Removes all options which earlier didn't belong to any optgroup.
                    if (viewOptgroups.length == 0) {
                        // save selected value because when value is set before items in setWidgetOptions
                        // the selected value would get lost in html
                        var selectedOption = this.$userControl.find('[selected]');
                        this.$userControl.children("option[data-user-option]").remove();
                    }
                    for (i = 0, j = 0; j < val.length; j++) {
                        element = val[j];
                        if (element.save != AF_OPTGROUP_NAME) {
                            // Add options to String[] which will be later synced to the optgroup.
                            optgroupOptions.push(element);
                        } else {
                            $viewOptgroup = viewOptgroups[i++];
                            // When optgroup is less than the required optgroups.
                            if (i > viewOptgroups.length) {
                                $viewOptgroup = this.addGroup(element.display);
                            }
                            // Undefined as it may not occur even once when list is purely of options.
                            if (!_.isUndefined($viewOptgroup) && $viewOptgroup.label != element.display) {
                                $viewOptgroup.label = element.display || '';
                            }
                            // Check to skip the first optgroup.
                            if (j != 0) {
                                // Syncs options to the prev optgroup.
                                // Prev optgroup because current optgroup marks the end of options of prev.
                                this.handleOptions($preOptgroup, optgroupOptions);
                                // Clear options of the optgroup for next optgroup.
                                optgroupOptions = [];
                            }
                            $preOptgroup = $viewOptgroup;
                        }
                    }
                    // Removes all extra optgroups.
                    while (i < viewOptgroups.length) {
                        $viewOptgroup = viewOptgroups[i++];
                        this.deleteGroup($viewOptgroup.label);
                    }
                    //Add remaining options to respective optgroup.
                    if (optgroupOptions.length != 0) {
                        this.handleOptions($preOptgroup, optgroupOptions, selectedOption);
                    }

                    //Intentionally left the selection check -> I am relying on the fact that "value" sync event is called after "items" sync.
                },

                "displayValue": function () {
                },
                "placeholder": function(value){
                    // overriding the default handling of place holder options setter
                },
                "access": function (val) {
                    switch (val) {
                        case "open" :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                        case "nonInteractive" :
                        case "protected" :
                        case "readOnly" :
                            this.$userControl.attr("disabled", "disabled");
                            this.$userControl.attr("aria-disabled", "true");
                            break;
                        default  :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                    }
                }
            })
        },

        getEventMap: function () {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "focus": [xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT, xfalib.ut.XfaUtil.prototype.XFA_PREOPEN_EVENT],
                "change": xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT
            })
        },

        render: function () {
            var existingInlineStyleAttributeValues = this.element.find("select").attr("style"),
                newInlineStyleAttributeValues,
                combinedInlineStyleAttributeValues,
                size = 1;

            this.element.addClass(this._widgetName);
            this.element.children().remove();

            var inputName = _.uniqueId("select"),  //Unique Id
                textStyle = this.getOrElse(this.$data(this.element.get(0), "xfamodel"), "textstyle", ""),
                $widgetSkeleton = $(this.widgetSkeleton)
                                    .attr('style', textStyle)
                                    .attr('name', inputName);
            if(this.options.editable) {
                $widgetSkeleton.addClass('combobox');
            }

            if(this.options.items && this.options.items.length>0){
                size = this.options.items.length
            }
            if(this.options.multiSelect) {
                $widgetSkeleton.addClass('multiDropdown');
                $widgetSkeleton.attr('multiple','multiple');
                $widgetSkeleton.attr('size',size);
                $widgetSkeleton.attr('data-multiple-selection',"true");
            }

            var $parEl = $widgetSkeleton;
            _.each(this.options.items, function(item){
                var saveItem = _.isString(item.save) ? item.save.replace(/\"/g, "&quot;") : "";
                if (saveItem === this.AF_OPTGROUP_NAME){ // assuming optgroups appear before options
                    $parEl = $(this.optGroupSkeleton).attr('label', item.display).appendTo($widgetSkeleton);
                } else {
                    $(this.optionSkeleton).val(saveItem).text(item.display).appendTo($parEl);
                }
            },this);

            this.element.append($widgetSkeleton);

            var control = this.element.children().eq(0).attr("name", this.options.name);
            this._attachEventHandlers(control);
            newInlineStyleAttributeValues = this.element.find("select").attr("style");
            //append the previous inlineStyleAttributeValues to newInlineStyleAttributeValues so that the inline styles
            //added from the dialog are applied.
            combinedInlineStyleAttributeValues = newInlineStyleAttributeValues + existingInlineStyleAttributeValues;
            this.element.find("select").attr("style", combinedInlineStyleAttributeValues);
            return control;
        },

        //syncs the options to the optgroup dynamically.
        handleOptions : function ($viewOptgroup, val, selectedOption) {
            //When the list so far consists purely of options.
            if (_.isUndefined($viewOptgroup)) {
                $viewOptgroup = this.$userControl[0];
            }
            var viewOptions = $("option[data-user-option]", $viewOptgroup);
            //Syncs the value of options.
            for (var i = 0, j = 0; i < viewOptions.length && j < val.length; i++, j++) {
                var $viewOption = viewOptions[i];
                var element = val[j];
                if ($viewOption.text != element.display) {
                    $viewOption.text = element.display || '';
                }
                if ($viewOption.value != element.save) {
                    $viewOption.value = element.save || '';
                }
            }
            //Deletes options if count is more than required.
            while (i < viewOptions.length) {
                this.deleteOption(viewOptions[i++])
            }
            //Add options if count is less than required.
            while (j < val.length) {
                this.addOption($viewOptgroup, val[j++], selectedOption);
            }
        },

        addOption : function ($viewOptgroup, element, selectedOption) {
            var $newOption = $(this.optionSkeleton).val(element.save).text(element.display);
            $newOption.appendTo($viewOptgroup);
            if(selectedOption) {
                if(element.save === selectedOption.val() && element.display === selectedOption.text()) {
                    $newOption.prop("selected", true);
                }
            }
            // Since the displayValue is a '\n' separated string of selected values in case of multiSelect,
            // we convert it to an array and check whether that array contains the save value of the element
            var values;
            if (this.options.value && _.isString(this.options.value)) {
                values = this.options.value.split('\n');
            } else if (_.isArray(this.options.value)) {
                // In the case of AF we have value/displayValue as an array
                values = this.options.value
            }
            if (values && values.indexOf(element.save) >= 0) {
                //Hide emptyValue and select the new option.
                this.$userControl.children("#emptyValue").val("").html(this.options.placeholder)
                    .prop("selected", false).hide();
                this.$userControl.find("[value='" + element.save + "']").prop("selected", true);
            }
        },

        deleteOption: function ($viewOption) {
            this.$userControl.find('option[value='+$viewOption.value+']').remove();
        },

        addGroup: function(label) {
            //Creates a optgroup Node.
            var optionGroup = document.createElement("OPTGROUP");
            optionGroup.label = label;
            this.$userControl[0].appendChild(optionGroup);
            return optionGroup;
        },

        deleteGroup: function(label) {
            this.$userControl.children().remove('optgroup[label='+label+']');
        },

        addItem: function (itemValues) {
            var newOption = new Option(itemValues.sDisplayVal || '', itemValues.sSaveVal || '');
            // add role=option to the new option that has been added.
            $(newOption).attr("role", "option");
            this.$userControl[0].add(newOption, null);
            if (itemValues.sSaveVal == this.options.value && itemValues.sDisplayVal == this.options.displayValue) {
                this.$userControl.children("#emptyValue").val("").html("").prop("selected", false).hide();
                this.$userControl.find("option[value=" + this.options.value + "]").prop("selected", true)
            }
        },

        clearItems: function () {
            //Deleting all the options including optGroup except the empty value.
            this.$userControl.children().not("#emptyValue").remove();
        },

        deleteItem: function (nIndex) {
            //check for emptyValue instead of blindly doing + 1
            if (this.$userControl[0].item(0) && this.$userControl[0].item(0).id == "emptyValue")
                nIndex = nIndex + 1;
            //if there is emptyValue element then just delete one index higher
            //this check is must instead of blindly increasing the index by 1 because NWKListBox extends this class and that doesn't maintain emptyValue
            this.$userControl[0].remove(nIndex);
        },

        getCommitValue: function (event) {
            var value = $("option:selected", this.$userControl).map(function () {
                return $(this).val();
            }).get();
            return value;
        },

        showDisplayValue: function () {
        },

        destroy: function () {
            this.element.
                removeClass(this._widgetName).
                children().remove().
                text("");

            // call the base destroy function
            $.xfaWidget.defaultWidget.prototype.destroy.apply(this, arguments);
        },

        _handleKeyDown: function (event) {

            if (event.keyCode == 13) {
                //do nothing
                //just override the return key behaviour and over to defaultWidget for rest of the stuff.
                //return key is intercepted to avoid submission of form which is default behavior of html form element
                //but as a side effect it also stops the closing of drop down only in IE -> probably I should use IE condition but
                // this code works fine in          chrome as well so keeping it that way.
                //watson bug#3675141
            }
            else
                $.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this, arguments);
        },

        // CQ-51462 : focus and commit event (change) happen together hence first selection was modifying the value
        // we do not want focus to modify the value that is about to be committed
        showValue : function() {

        }
    });
})($, _);
(function($){
	$.widget( "xfaWidget.listBox", $.xfaWidget.defaultWidget, {

    _widgetName: "listBoxWidget",

    options : {
        value : [],
        items : [],
        multiSelect : false
    },

    getOptionsMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "width" : function(val) {
                //Bug#3597771. setting the height more than 0.95 brings scrollbar
                this.options.width = val*0.95
                parentOptionsMap.width.apply(this,[this.options.width])
            },
            "access" : function() {},
            "value": function(val) {
                var newValues = this.options.value,
                    self = this,
                    tabSet = false;
                if(!_.isArray(newValues))
                    newValues = [newValues];
                var tabSet
                this.$userControl.children().each(function(){
                    var saveVal = $(this).attr("data-save");

                    // Check if this value is present in options value array
                    if(newValues && _.contains(newValues, saveVal)){
                        $(this).removeClass("item-selectable");
                        $(this).addClass("item-selected");
                        tabSet = true;
                        $(this).attr("tabIndex", self.options.tabIndex);

                        // Set the selected data attribute to true.
                        if (!$.data(this, "_xfaInitialized")) {
                            //Initialized data- attributes parse for once using this call.
                            // Next onward don't use this. Instead use $.data which is cheap/
                            $(this).data();
                            $.data(this, "_xfaInitialized", true); //Mark the element to say that data has been initialized.
                        }
                        $.data(this, "selected", true);

                    }
                    else{
                        $(this).removeClass("item-selected");
                        $(this).addClass("item-selectable");
                        $(this).attr("tabIndex", "-1");
                    }
                });
                if(!tabSet) {
                    $(this.$userControl.children().get(0)).attr("tabIndex", this.options.tabIndex);
                }
            },

            "items" : function(val) {
                if(!_.isArray(val))
                    val = [val];
                var viewItems = this.$userControl.children();

                //if number of items are not same in model and view then balance it
                if((viewItems.length) > val.length){
                    for(var i=viewItems.length; i >  val.length; i--){
                        this.deleteItem(i-1);
                    }
                }
                else if((viewItems.length) < val.length){
                    for(var i=val.length; i > (viewItems.length); i--){
                        this.addItem({sDisplayVal: val[i-1].display, sSaveVal: val[i-1].save});
                    }
                }

                _.each(val, function(element, index){
                    var $viewItem = $(viewItems[index]);
                    if( $viewItem.text() != element.display){
                        $viewItem.text(element.display || '');
                    }

                    if( $viewItem.attr("data-save") != element.save){
                        $viewItem.attr("data-save", element.save || '');
                    }
                });

                //Intentionally left the selection check -> I am relying on the fact that "value" sync event is called after "items" sync.
            },

            "displayValue" : function(){;},

            "tabIndex": function() {
                var selectedItem = this.$userControl.children(".item-selected"),
                    children =this.$userControl.children()
                if(selectedItem.length) {
                    selectedItem.eq(0).attr("tabIndex", this.options.tabIndex);
                }
                else if(children.length > 0) {
                    children.eq(0).attr("tabIndex", this.options.tabIndex);
                }
            }
        })
    },

    getEventMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "listboxenter":xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,
            "listboxexit":xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,
            "listboxchange":xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
            "focus":null,
            "blur":null
        })
    },

    showDisplayValue : function() {
        },

    render : function() {
        this.element.addClass( this._widgetName);
        this.element.children().remove();

        //TODO: add a function for geting textStyle
        var textStyle = this.getOrElse(this.$data(this.element.get(0), "xfamodel"), "textstyle", ""),
            that = this,
            //Bug#3597771 width and height are provided by the view itself.
            listElTemplate =
            '<ol style="position:absolute;<%=textStyle%>" role="listbox">' +
                '<% _.each(items, function(item){ %>' +
                '<% var saveItem = item.save ? item.save.replace(/\"/g,"&quot;"):null %>'+
                    '<li role="option" data-save="<% print(saveItem) %>" data-selected="false"><% print(item.display) %></li>'+
                '<%})%>'+
            '</ol>',
            compiledListElTemplate = _.template(listElTemplate),
            templateOptions = _.extend({
                "textStyle" : textStyle
                }, this.options),
            resolvedListEl = compiledListElTemplate(templateOptions);
        that.element.html(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(resolvedListEl));
        var control = $(that.element.children().get(0)).attr("name",this.options.name);
        this._attachEventHandlers(control);
        return control
    },

    focus: function() {
        if(this.$userControl.children(".item-selected").length > 0) {
            this.$userControl.children(".item-selected")[0].focus();
        }
        else if(this.$userControl.children().length > 0) {
            this.$userControl.children()[0].focus();
        }
    },

    addItem : function(itemValues){
        $("<li></li>")
            .attr("data-save", itemValues.sSaveVal || '')
            .text(itemValues.sDisplayVal || '')
            .appendTo(this.$userControl)
            .click($.proxy(this._handleItemClick, this))
            .focus($.proxy(this._handleItemFocus, this));
    },

    clearItems : function(){
        $(this.$userControl).empty();
    },

    deleteItem : function(nIndex){
        $(this.$userControl).children('li').each(function(index,element){
            if(index==nIndex){
                $(element).off("click").off("focus").remove();
            }
        })
    },


    _attachEventHandlers : function($control){
        var self = this;
        $control.keydown($.proxy(this._hotKeys,this))
            .children().on("mousedown",function() {
                    if(self.inFocus == true) {
                        self.mouseDown = true;
                    }
                })
            .click($.proxy(this._handleItemClick, this))
            .focus($.proxy(this._handleItemFocus, this))
            .blur($.proxy(this._handleFocusOut,this))

    },

     _hotKeys : function(event){
         if(this.options.access != "open")
             return;
         if(this.itemInFocus){
             switch(event.which) {
                 case 38: //arrow up
                     var prevSibling = $(this.itemInFocus).prev();
                     if(prevSibling){
                         this.keyDown = true;
                         prevSibling.focus();
                         this.keyDown = false;
                     }
                     event.preventDefault();
                     break;
                 case 40: //arrow down
                     var nextSibling = $(this.itemInFocus).next();
                     if(nextSibling){
                         this.keyDown = true;
                         nextSibling.focus();
                         this.keyDown = false;
                     }
                     event.preventDefault();
                     break;
                 case 91: //left arrow
                 case 92: //right arrow
                     event.preventDefault();
                     break;
                 case 32:
                     this._toggleItem(this.itemInFocus);
                     event.preventDefault();
                     break;
                 default:
             }
         }
     },

     _toggleItem: function(item) {
         var $item = $(item),
             multiMode = this.options.multiSelect, // && event.ctrlKey ;
             that = this;
             //toggle selected state of this item
             this.$data(item, "selected", !this.$data(item, "selected"));
         var state = this.$data(item, "selected")

         if(!multiMode) {
             var $selectedItem = this.$userControl.children(".item-selected")
             if($selectedItem.length) {
                 this.$data($selectedItem[0],"selected",false)
                 $selectedItem.removeClass("item-selected").addClass("item-selectable")
             }
         }
         $item.toggleClass("item-selectable",!state).
               toggleClass("item-selected",state)

         this.$userControl.trigger("listboxchange");
     },

     getCommitValue: function() {
         var that = this,
             multiMode = this.options.multiSelect;


         return this.$userControl.children().map(function(){
             // intentionally using $this.attr("data-save") instead of $this.data("data")
             return that.$data(this, "selected") ? $(this).attr("data-save") : null;
         }).get();
     },

      _handleItemFocus : function(event){
          if(this.options.access != "open")
              return;
          var item = event.target;
          this.itemInFocus = item;

          // overriding default widgets handleFocus
          if(!(this.keyDown || this.mouseDown)) {        //we do not need to fire focus event if
              this.$userControl.trigger("listboxenter")  // clicked on another li element or pressed a key to move the selectio
          }
          this.mouseDown = false;
          this.inFocus = true;
      },

     _handleItemClick : function(event){
        // Bug#3501811 If clicked onlistbox entry more than once, exit event is not fired
        // Clicking on the same entry does not call focus and hence we were not resetting the state. Doing it in onClick
        if(this.mouseDown == true)
            this.mouseDown = false;
        if(this.options.access != "open")
             return;
        this._toggleItem(event.target)
    },

    _handleFocusOut: function(){
        if(!(this.keyDown || this.mouseDown)) {
            this.$userControl.trigger("listboxexit");
            this.inFocus = false
        }
    },

    destroy: function() {
        this.element.
            removeClass(this._widgetName).
            children().remove().
            text("");

        $.xfaWidget.defaultWidget.prototype.destroy.apply(this, arguments);
    }
});
})($);
(function($) {
    $.widget( "xfaWidget.nwkListBox",  $.xfaWidget.dropDownList, {            //non-webkit listbox

        _widgetName : "nwkListBox",

        options : {
            value : [],
            multiSelect : false
        },

        render : function() {
            var $control = $.xfaWidget.dropDownList.prototype.render.apply(this, arguments);
            if($control){
                $control.children("#emptyValue").remove();
                if(this.options.multiSelect)
                    $control.attr("multiple", "multiple");
            }
            this._updateSelectSize($control);
            return $control;
        },

        addItem : function(itemValues){
            $.xfaWidget.dropDownList.prototype.addItem.apply(this, arguments);
            this._updateSelectSize();
        },

        clearItems : function(){
            $.xfaWidget.dropDownList.prototype.clearItems.apply(this, arguments);
            this._updateSelectSize();
        },

        deleteItem : function(nIndex){
            $.xfaWidget.dropDownList.prototype.deleteItem.apply(this, arguments);
            this._updateSelectSize();
        },

        _updateSelectSize : function($control){
            $control = $control || this.$userControl;
            $control.attr("size", (this.options.items || []).length);
        },

        // Bug#3597771
        // focus and commit event happen together hence first selection was modifying the value
        // we do not want focus to modify the value that is about to be committed
        showValue : function() {

        }

  });
})($);
(function ($) {
    $.widget("xfaWidget.xfaButton", $.xfaWidget.defaultWidget, {            //commitEvent: change; commitProperty: value<Array>

        _widgetName: "xfaButton",

        options: {
            value: null,
            svgCaption: false //option to indicate if button already has an SVG caption
        },

        getOptionsMap: function () {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "access": function (val) {
                    switch (val) {
                        case "open" :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                        case "nonInteractive" :
                        case "protected" :
                        case "readOnly" :
                            this.$userControl.attr("disabled", "disabled");
                            this.$userControl.attr("aria-disabled", "true");
                            break;
                        default  :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                    }
                },
                "value": function () {
                },
                "displayValue": function () {
                },
                "svgCaption": function (val) {
                    if (val) {
                        this.$userControl.removeAttr("value");
                    }
                }
            })
        },

        _attachEventHandlers: function ($control) {
            $control.click(function () {
                this.focus()
            });
        },

        getCommitValue: function () {
            return this.options.value;
        },

        showValue: function () {
        },

        showDisplayValue: function () {
        }
    });
})($);(function ($) {
    $.widget("xfaWidget.XfaCheckBox", $.xfaWidget.defaultWidget, {            //commitEvent: change; commitProperty: value<Array>

        _widgetName: "XfaCheckBox",

        options: {
            value: null,
            state: -1,
            states: 2,
            values: []
        },

        checkedState: false,
        clickPending: false,

        getOptionsMap: function () {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                "access": function (val) {
                    switch (val) {
                        case "open" :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                        case "nonInteractive" :
                        case "protected" :
                        case "readOnly" :
                            this.$userControl.attr("disabled", "disabled");
                            this.$userControl.attr("aria-disabled", "true");
                            break;
                        default  :
                            this.$userControl.removeAttr("disabled");
                            this.$userControl.removeAttr("aria-disabled");
                            break;
                    }
                },

                "displayValue": function (val) {
                    this.$userControl.attr(this.options.commitProperty, this.options.value);
                    this._state(this.dIndexOf(this.options.values, this.options.value));
                    this.$userControl.attr("checked", this.checkedState ? "checked" : null);
                    this.$userControl.prop("checked", this.checkedState ? "checked" : null);
                    //for accessibility
                    this.$userControl.attr("aria-selected", this.checkedState);
                    if (this.options.state == 2)
                        this.$userControl.addClass("neutral");
                    else if (this.options.states == 3)
                        this.$userControl.removeClass("neutral");   // since current state != neutral
                },

                "allowNeutral": function (val) {
                    var intVal = parseInt(val);
                    if (intVal == 0 || intVal == 1) {
                        this.options.states = 2 + intVal;
                    }
                },

                "paraStyles": function (paraStyles) {
                    parentOptionsMap.paraStyles.apply(this, arguments);
                    this._handleVAlignOnExit();
                }
            })
        },

        getEventMap: function () {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this, arguments);
            return $.extend({}, parentOptionsMap, {
                 "xfacheckboxchange" :  xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
                 "xfacheckboxclick" :   xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT,
                 "change": null,
                 "click" : null
               })
        },

        _attachEventHandlers: function ($control) {
            var that = this;
            var focusFunc = function (evnt) {
                if (!that.inFocus) {
                    that.focus();
                    that.inFocus = true;
                }
            }
            var focusOutFunc = function (evnt) {
                that.inFocus = false;
            }
            $control.click(focusFunc).change(focusFunc).blur(focusOutFunc);
            $control.change($.proxy(this._handleChange,this)).click($.proxy(this._handleClick,this));   //LC-5106
        },

        getCommitValue: function () {
            this._state((this.options.state + 1) % this.options.states);
            this.$userControl.attr("checked", this.checkedState ? "checked" : null);
            //for accessibility
            this.$userControl.attr("aria-selected", this.checkedState)
            if (this.options.state == 2) {
                this.$userControl.addClass("neutral");
            }
            else if (this.options.states == 3)
                this.$userControl.removeClass("neutral"); // since current state != neutral

            return this.options.values[this.options.state];
        },

        _handleVAlignOnExit: function (evnt) {
            //--this is being kept empty as no other browser (i.e Mozilla and Chrome) take the padding-bottom or padding-top into account.
            // the only browser to take it into consideration is IE. And moreover the alignment and padding considerations have already been taken into account in
            // calculations in CheckButtonFieldView.js. And on removing the entire function it takes up the _handleVAlignOnExit() of AbstractWidget.

        },

        _handleChange: function (evnt) {
            this.$userControl.trigger("xfacheckboxchange"); //change is always fired
            if(this.clickPending === true) {
              this.clickPending = false;
              this.$userControl.trigger("xfacheckboxclick");
            } else {
                // handling of this.clickPending is added to handle the case when clicked on checkbox/radiobutton label/caption
                this.clickPending = true;
            }
        },

        _handleClick: function (evnt) {
             var isChrome = xfalib.ut.XfaUtil.prototype.detectChrome(),
                 isIE = xfalib.ut.XfaUtil.prototype.detectIE(),
                 userControlType = this.$userControl.attr("type");
             // click will not be fired if the previous state of the radiobutton is 'on'.
             // CQ-103023 : Click Event on Radio Button not working correctly in Chrome 53
             // CQ-103715 : CQ-103715 : Click Event on Check Box not working correctly in Chrome and Firefox, added handling for checkbox also
             // handling of this.clickPending is added to handle the case when clicked on checkbox/radiobutton label/caption
             if(($.browser.mozilla || isChrome) && !isIE && this.clickPending === false && ((userControlType === "radio" && this.checkedState === false) || (userControlType === "checkbox"))) {
               this.clickPending = true;
             }
             else {
                this.$userControl.trigger("xfacheckboxclick");
                this.clickPending = false;
             }
        },

        _state: function (newState) {
            if (newState == undefined)
                return this.options.state;
            else
                this.options.state = newState;
            this.checkedState = (newState == 0 || newState == 2);
        },

        click: function () {
            // trigger change for check box and for radio only if it is not selected
            // otherwise radio button will go in deselected state
            if (this.$userControl.attr("type") !== "radio" || this.options.state !== 0) {
                this.$userControl.trigger("change");
            }
            //we should call only the handler since calling click will trigger change.
            this.$userControl.triggerHandler("click");
        }
    });
})($);
(function($){
    $.widget( "xfaWidget.textField", $.xfaWidget.defaultWidget, {

        _widgetName: "textField",

        options: {
            curValue : null ,
            pos:0,
            lengthLimitVisible: true,
            maxChars:0 ,
            flag:""
        },

        getOptionsMap: function() {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
            return $.extend({},parentOptionsMap,{
                "maxChars": function(maxchars) {
                    if(this._maxCharsReached(this.options.value)) {
                        var value = this.options.value.slice(0,maxchars)
                        this._setOption("value", value);
                        this._setOption("displayValue", value);
                    }

                },

                "multiLine ": function(val) {
                    if(this.options.multiLine)
                        this.$userControl.attr("aria-multiline", "true");
                    else
                        this.$userControl.removeAttr("aria-multiline", "false");
                },

                "height": function(val) {
                    if(val)   {
                        this.$css(this.$userControl[0],{"height" :val})
                        this._handleVAlignOnExit();    // To Handle the case of expandable Fields
                    }
                },

                "paraStyles": function(paraStyles){
                    parentOptionsMap.paraStyles.apply(this,arguments);
                    this._handleVAlignOnExit();
                }

            })
        },

        /*  This function aligns vAlign when:
         1. parastyles is present and the widget contains a value.
         2. During initial rendering if no content present fallback to the previous logic.
         3. Presence of content in widget.
        */
        _handleVAlignOnExit: function(){
             var value = this.options.displayValue,
                 noContentPresent = _.isEmpty(this.$userControl.val() || this.options.displayValue),
                 contentHeight,widgetHeight,diff,tempCSS;

             //the widget doesn't have value as yet but content exists [ Rendering of widget]
             if (!this.options.paraStyles || noContentPresent) {
                //vAlign has to be handled only if there is paraStyles and widget has content
                return;
             }

             // mozilla results in vAlign regression hence made this change only for textarea
             if($(this.element[0]).find("textarea").length >0 && !noContentPresent)  {
               /* measureExtent not returning correct height of content in textarea even with all
                 css values */
               tempCSS={'height':this.$userControl.css('height'),'padding':this.$userControl.css('padding')};
               this.$css(this.$userControl[0],{'height':'1px','padding':'0px'});

               contentHeight = this._getContentHeight();
               this.$css(this.$userControl[0],tempCSS);
               widgetHeight = this.options.height;
               diff = widgetHeight - contentHeight;
               this._calculatePaddingForVAlign(diff);
             } else {
                // widget has no initial content or is a textfield.Proceed as before.
                $.xfaWidget.defaultWidget.prototype._handleVAlignOnExit.apply(this,arguments);
             }
        },

        getEventMap: function() {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
            return $.extend({},parentOptionsMap,{
                "onKeyInput.textField" : xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT
            })
        },

        _maxCharsReached: function(val) {
            return this.options.maxChars
                   && this.options.maxChars!=="0"
                   && val
                   &&  val.length >= this.options.maxChars
        },

        _handleKeyInput : function(event, character, code) {
            if(event.ctrlKey && !_.contains(['paste', 'cut'], event.type)) {
                return true;
            }

            if(!this.options.multiLine) {
                $.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this, arguments);
                character = (code == 13) ? '' : character ;
            }

            var val =  this.$userControl.val(),
                selectionStart = xfalib.view.util.HtmlUtil.getHTMLSupportedAttr(this.$userControl[0], "selectionStart") || 0,
                selectionEnd = xfalib.view.util.HtmlUtil.getHTMLSupportedAttr(this.$userControl[0], "selectionEnd") || 0,
                pos = selectionStart,
                newVal = (val.substr(0, selectionStart) + character + val.substr(selectionEnd)).replace(/\s/g,"&nbsp;");

            if(!this.options.multiLine) { //TODO:looks like a bug
                this.options.lengthLimitVisible = true;
                this.options.curValue = val;
                this.options.pos = pos;
                if(this.options.hScrollDisabled && !_.contains(['keydown', 'cut'], event.type)) {
                    var expectedWidth = xfalib.view.util.TextMetrics.measureExtent(newVal, {refEl: this.$userControl[0], maxWidth:-1}).width;
                    if(!event.ctrlKey && expectedWidth > this.$userControl.width()){   // Why  allowance of 5 required??
                        this.options.lengthLimitVisible = false;
                        event.preventDefault();
                        return false;
                    }
                }
            } else if (this.options.multiLine && this.options.hScrollDisabled) {  // LC-4656 : wait till user input, if it causes an overflow revert to old text
                var $textArea = this.$userControl;
                $textArea.css("padding", "0px 0px 0px");  // TODO : take care of multiline selection & padding later

                // TODO : find a scheme to avoid attaching and detaching listeners, currently $.val() causes 'input' to fire, resulting in an infinite loop
                $textArea.one("input", function () {
                    if ($textArea.prop('scrollHeight') > $textArea.prop('offsetHeight')) {
                        $textArea.val(val)
                                 .prop("selectionStart", selectionEnd)
                                 .prop("selectionEnd", selectionEnd);  // LC-4656 : reset the cursor pos, afterwards
                        character = null;
                        code = 0;
                    }
                });
            }

            if (!_.contains(['keydown', 'cut'], event.type) && this._maxCharsReached(val) && selectionStart === selectionEnd) {
                event.preventDefault();
                return false;
            }

            this.$userControl.trigger({
                type : "onKeyInput.textField",
                originalType : event.type,
                character : character,  // contains the pasted string or pressed key
                keyCode : event.keyCode || 0,
                charCode : event.charCode || 0,
                which : event.which || 0,
                ctrlKey : event.ctrlKey || event.metaKey || false,
                shiftKey : event.shiftKey || false,
                keyDown: false, // This property is available only for list boxes and drop-down lists
                selectionStart: selectionStart,
                selectionEnd: selectionEnd
            });
        },

        _handleKeyDown : function(event){
            if (event) {
                var code = event.charCode || event.which || event.keyCode || 0;
                if(code == 8 || code == 46) // backspace and del
                   this._handleKeyInput(event, "", code);
            }
        },

        _handleKeyPress : function(event){
            if (event) {
                var code = event.charCode || event.which || event.keyCode || 0,
                    character = (code == 13) ? "\n" : String.fromCharCode(code); // modified '\r\n' -> '\n'

                if(event.key // Moz or IE11
                   && !_.contains(['MozPrintableKey','Divide','Multiply','Subtract','Add','Enter','Decimal','Spacebar'],event.key)
                   && event.key.length != 1 ) {
                    return true;   // mozilla also generates a keypress, along with keydown, for all keys
                }

                this._handleKeyInput(event, character, code);
            }
        },

        _handlePaste : function(event){
            if (event) {
                var pastedChar = undefined;
                if (window.clipboardData && window.clipboardData.getData) { // IE
                    pastedChar = window.clipboardData.getData('Text');
                } else if (event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
                    pastedChar = event.originalEvent.clipboardData.getData('text/plain');
                }
                if(pastedChar) {
                    this._handleKeyInput(event, pastedChar, 0);
                }
            }
        },

        _handleCut : function(event) {
            if (event) {
                this._handleKeyInput(event, "", 0);
            }
        },

        postProcessExit: function(evnt) {
            $.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
            if (this.options.multiLine && this.options.hScrollDisabled) {
                return;
            }
            this._handleVAlignOnExit();
        },

        preProcessEnter: function(evnt) {
            $.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
            if(this.options.multiLine && this.options.hScrollDisabled)
                return;
            this._handleVAlignOnEnter();
        },

        /**
         * @brief: Select the given field on focus in Internet Explorer
         *
         */
        _selectOnFocusInIE : function(){
            // if the value is not same only then do selection in IE
            // For Issue: LC-9895, we check if value not same
            if($.browser.msie && !this._isValueSame()) {
                this.$userControl.select();
            }
            else {
                //all other browsers behave like a good boy
            }
        },

        showValue : function() {
            $.xfaWidget.defaultWidget.prototype.showValue.apply(this,arguments);
            //IE doesn't show selected text if we focus and set its value all the time so force selection
            this._selectOnFocusInIE();
        },

        getCommitValue: function() {
            var value = $.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this, arguments);

            if(this._maxCharsReached(value)) {
                value = value.slice(0,this.options.maxChars);
            }

            this.$userControl.val(this.options.value);

            //TODO: ask Sharad whether it is right
            if(this.options.multiLine && this.options.hScrollDisabled)  {
                //var str= this._checkLines(value);
                //if(value != str) {
                    return value;
                //}
            }
            return value;
        },

        /*
        ** returns the contentHeight which needs to be considered for padding for valign,
        ** if no contentHeight is present then fontSize is returned.
        */
        _getContentHeight: function () {
            var contentHeight = Math.ceil(this.$userControl.get(0).scrollHeight);
            return contentHeight ? contentHeight : this.options.fontSize;
        }
    });
})($);
(function($){
	$.widget( "xfaWidget.imageField", $.xfaWidget.defaultWidget, {

    _widgetName:"imageField",

    options: {
        tabIndex: 0,
        "role": "img"
    },

    getEventMap: function () {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this, arguments);
        return $.extend({}, parentOptionsMap, {
            "imagechange": xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT
        })
    },

    getOptionsMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "screenReaderText": function(val) {
                if(val)
                    this.$userControl.attr("alt", val)
            },
            "displayValue": function(val) {
                var widgetValue;
                if (this.options.value) {
                    widgetValue = "data:;base64," + this.options.value;
                } else {
                    widgetValue = "";
                }
                this.$userControl.prop(this.options.commitProperty, widgetValue);
                this.$userControl.attr(this.options.commitProperty, widgetValue);
            },
            "access" : function() {},

            // CQ-85514 : use max-ht & max-wd to honor image's intrinsic ht & wd attributes & prevent distortion
            "height" : function (val) {
                // in case aspect is actual then we need to crop the image, which will be not possible if max height and width are set
                if (val && this.options.aspect != "actual") {
                    this.$css(this.$userControl[0], {"max-height": val});
                }
            },
            "width" : function (val) {
                if (val && this.options.aspect != "actual") {
                    this.$css(this.$userControl[0], {"max-width": val});
                }
            },
            "aspect" : function (val) {
                // value of actual turns off scaling, causing the image to be drawn at its native size,
                // as per xfa spec Adobe implementations crop the image
                if(this.options.aspect == "actual") {
                    var right = this.$userControl.attr("width"),
                        bottom = this.$userControl.attr("height");
                    right = right.indexOf("px") >= 0 ? right : right + "px";
                    bottom = bottom.indexOf("px") >= 0 ? bottom : bottom + "px";
                    this._cropImage("0px", right, bottom, "0px");
                    this.$userControl.removeAttr("height width");
                // value of none indicates no aspect ratio
                // as per xfa spec image is independently scaled in the horizontal and vertical directions to exactly fill the field,
                // which are already set to fill the field
                } else if (this.options.aspect != "none") {
                // A value of fit, which is the default, causes the scale to be such that the image fills as much of the field as possible
                // without overflowing it in either dimension.
                    this.$userControl.attr({"height" : "auto", "width" : "auto"});
                }
            }
        });
    },

    // crop the image using top,right, bottom, left coordiantes of the image
    _cropImage : function (top, right, bottom, left) {
        var clipRect = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
        var clipPathPolygon = "polygon( 0px 0px, 0px " + bottom + "," + right + " " + bottom +"," + right + " 0px)";
        // clip property is deprecated but still supported by all the major browsers
        // clip-path replaces the deprecated clip property but still is not fully supported by all major browser
        this.$userControl.css({"clip" : clipRect, "clip-path" : clipPathPolygon});
    },

    render : function() {
        var self = this;
        if (typeof FileReader !== "undefined") {
            this.reader = new FileReader();
        } else {
            xfalib.ut.XfaUtil.prototype.getLogger().error("Image Field is supported only for HTML5 supported browsers.");
        }
        if (this.element) {
            // change event triggered when new image is selected
            this.$widgetInput = this.element.find("input").on("change.imageField", function() {
                self._handleInputChange();
            }).click(function(event) {
                // to stop bubbling of event from input to widget
                event.stopPropagation();
            });
            this.$widgetImg = this.element.on("click.imageField", function() {
                self._imageClick();
            }).find("img");
        }
        if (this.reader) {
            //load event is triggered each time the reading operation is successfully completed
            this.reader.addEventListener("load", function () {
                self.$widgetImg.attr("src",self.reader.result);
                self.$widgetImg.trigger("imagechange");
            }, false);
        }
        return $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments);
    },

    getCommitValue: function() {
        return this._extractData(this.$userControl.attr("src"));
    },

    // hidden input change handler, input change will be triggered on selecting a new image
    _handleInputChange : function() {
        this._displayImage();
    },

    _imageClick : function(clickEvent) {
        //as the input button is hidden we trigger click explicitly on click of the widget
        this.$widgetInput.trigger("click");
    },

    // removes "data\:.*\;base64," from the image base64 string
    _extractData : function(value) {
        return value.replace(/data\:.*\;base64,/, "");
    },

    // previews image in the imagefield widget
    _displayImage : function() {
        var imageFile = this.$widgetInput.get(0).files ? this.$widgetInput.get(0).files[0] : null;
        if (imageFile && this._isFileOfImageType(imageFile.name)) {
            if (this.reader) {
                //readAsDataURL method is used to read the contents of the specified file, result attribute contains  the data as a URL representing the file's data as a base64 encoded string
                this.reader.readAsDataURL(imageFile);
            }
        }
    },

    // Test for supported image file(jpg,jpeg,png,gif,tif,bmp)
    _isFileOfImageType : function(fileName) {
        if (fileName) {
            return (/\.(jpe?g|png|gif|tif|bmp)$/i.test(fileName));
        }
        return false;
    }
});
})($);
/**
 * Created with IntelliJ IDEA.
 * User: rpandey
 * Date: 12/24/12
 * Time: 8:06 PM
 * To change this template use File | Settings | File Templates.
 */


(function($){
    $.widget( "xfaWidget.signatureField", $.xfaWidget.defaultWidget, {

        _widgetName:"signatureField",

        getOptionsMap: function() {
            var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
            return $.extend({},parentOptionsMap,{
                "displayValue": function(val) {},
                "access": function(val) {}
            })
        },

        render : function() {
            var $control = $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments);
            //pessimistic checks
            if($control) {
                $control.attr("readOnly","readonly").attr("disabled", true);
            }
            return $control;
        }
    });
})($);
/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2011-2012 Adobe Systems Incorporated
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
 */
 
/**
 * widget definition for scribbleable field
 */
(function($,xfalib){

 var TouchUtil=xfalib.ut.TouchUtil;
 var ScribbleUtil=(function(){
      return {
          localeString:function(id){
                    return xfalib.ut.XfaUtil.prototype.encodeScriptableTags($.xfaWidget.abstractWidget.prototype.localeStrings()[id])  || id;
          }
      };
 })();
 var DELETE_KEY = 46;
 var ESC_KEY = 27;
 var ENTER_KEY = 13;
/**
 * Scribble class definition, used for drawing on canvas using mouse or touch
 */
function Scribble( canvasID,image,_width,_height, callback) {
    this._callback = callback;
    this.canvasID = canvasID;
    this._lineWidth=5;
    this.canvas = $("#"+canvasID);
    this.context = this.canvas.get(0).getContext("2d"); 
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    this._enabled=true;
    this.context.strokeStyle = "#000000";
    this.canvasBorderWidth = parseInt(this.canvas.css('border-left-width'),10); // assuming top and left borders are same width
    this.context.lineWidth = this._lineWidth;
    this.lastMousePoint = {x:0, y:0};
    
    this.canvas[0].width = _width;// this.canvas.parent().innerWidth();
    this.canvas[0].height = _height;//this.canvas.parent().innerHeight();
    if(!image){
        this.context.fillStyle   = '#ffffff';
        this.context.clearRect(0,0,_width,_height);
    } else {
        this.context.drawImage(image,0,0);
    }
    this.canvas.bind( TouchUtil.POINTER_DOWN, this.onCanvasMouseDown() );
}
Scribble.prototype.setLineWidth=function(w){
    this._lineWidth=w;
};
Scribble.prototype.onCanvasMouseDown = function () {
    var self = this;
    return function(event) {
        if(TouchUtil.getTouches(event).length < 2){
            self.mouseMoveHandler = self.onCanvasMouseMove();
            self.mouseUpHandler = self.onCanvasMouseUp();
            $(document).bind(TouchUtil.POINTER_MOVE, self.mouseMoveHandler );
            $(document).bind(TouchUtil.POINTER_UP, self.mouseUpHandler );
            self.updateMousePosition( event );
            self.updateCanvas( event );
        }
    }
};

Scribble.prototype.onCanvasMouseMove = function () {
    var self = this;
    return function(event) {
        if(TouchUtil.getTouches(event).length < 2){
            self.updateCanvas( event );
            event.preventDefault();
            return false;
        }
    }
};

Scribble.prototype.onCanvasMouseUp = function (event) {
    var self = this;
    return function(event) {
        $(document).unbind(TouchUtil.POINTER_MOVE, self.mouseMoveHandler );
        $(document).unbind(TouchUtil.POINTER_UP, self.mouseUpHandler );
        self.mouseMoveHandler = null;
        self.mouseUpHandler = null;
    }
};

Scribble.prototype.updateMousePosition = function (event) {
    if(!this._enabled) return ;
    var target = TouchUtil.getTouchEvent(event);

    var offset = this.canvas.offset();
    /* In IE>=10 pageX values are incorrect when using zoom
     so calculate them using clientX and scrollLeft */
    this.lastMousePoint.x = target.clientX + $(window).scrollLeft() - offset.left - this.canvasBorderWidth;
    this.lastMousePoint.y = target.clientY + $(window).scrollTop() - offset.top - this.canvasBorderWidth;

};
Scribble.prototype._isInsideCanvas = function(x,y){
    return y>=0 && y<this.canvas[0].height && x>=0 && x < this.canvas[0].width;
};
    Scribble.prototype.updateCanvas = function (event) {
    if(!this._enabled) {
       return;
    }
    var oldX,oldY,dX,dY,canDraw,scaleX,scaleY,cssWidth,cssHeight;
    cssWidth = parseInt(this.canvas[0].style.width,10);
    cssHeight = parseInt(this.canvas[0].style.height,10);
    scaleX =  cssWidth?this.canvas[0].width/cssWidth:1;
    scaleY = cssHeight?this.canvas[0].height/cssHeight:1;

    scaleX /= xfalib.ut.XfaUtil.prototype.formScaleFactor;
    scaleY /= xfalib.ut.XfaUtil.prototype.formScaleFactor;

    oldX = this.lastMousePoint.x*scaleX;
    oldY = this.lastMousePoint.y*scaleY;
   
    this.updateMousePosition( event );

    var newX =  this.lastMousePoint.x*scaleX;
    var newY =  this.lastMousePoint.y*scaleY;

    dX = Math.abs(newX - oldX );
    dY = Math.abs(newY - oldY );

    canDraw = ( dX > 0 || dY > 0 ) && this._isInsideCanvas(oldX,oldY) && this._isInsideCanvas(newX,newY);;

    if(canDraw){
        this.context.beginPath();
        this.context.moveTo( oldX, oldY );
        this.context.lineTo(newX, newY );
        this.context.lineWidth=this._lineWidth;
        this.context.lineCap='round';
        this.context.stroke();
		
        this._callback();
		
    }
};

Scribble.prototype.toString = function () {

    var dataString = this.canvas.get(0).toDataURL("image/png");
    //var index = dataString.indexOf( "," )+1;
    //dataString = dataString.substring( index );

    return dataString;
};
Scribble.prototype.setEnabled=function(enable){
    this._enabled=enable;
};
Scribble.prototype.clear = function () {

    var c = this.canvas[0];
    this.context.clearRect( 0, 0, c.width, c.height );
};


// ImageEdit dialog box
var imageEditDialog=(function(){
  
    // html used to construct dialog box
    var htmlStr=(function(){
         var html=[
             '<div id="iEBox_container" tabindex="0" role="dialog" aria-label="'+ScribbleUtil.localeString("pleaseSignText")+'">',
                  '<div id="iEBox_panel">',
                      '<div  id = "iEBox_Cancel" class="iEBox_button" tabindex="0" role="button" aria-label="'+ScribbleUtil.localeString("cancel")+'" title="'+ScribbleUtil.localeString("cancel")+'" ></div>',
                  '</div>',
                  '<div id="iEBox_content">',
                      '<div id="iEBox_canvases" align=center>',
                          '<div style="display:inline-block;">',
                               '<canvas  id="iEBox_canvas" style="margin:0px;border-bottom:0px;" width="696" height="390" ></canvas>' ,
                               '<fieldset id="iEBox_caption"><legend align="center">'+ScribbleUtil.localeString("pleaseSignText")+'</legend></fieldset>',
                          '</div>',
                          '<canvas id="iEBox_geoCanvasRight" width="0" height="0" ></canvas>',
                          '<div><canvas id="iEBox_geoCanvasBottom" width="0" height="0" ></canvas></div>',
                      '</div>',
                      '<div>',
                          '<div id="iEBox_Brush" class="iEBox_button" tabindex="0"  role="button" aria-label="'+ScribbleUtil.localeString("brushes")+'"  title="'+ScribbleUtil.localeString("brushes")+'"></div>',
                          '<div id="iEBox_Clear" class="iEBox_button" tabindex="0"  role="button" aria-label="'+ScribbleUtil.localeString("clear")+'"  title="'+ScribbleUtil.localeString("clear")+'" ></div>',
                          '<div id="iEBox_Geo" class="iEBox_button" tabindex="0"  role="button" aria-label="'+ScribbleUtil.localeString("geolocation")+'"  title="'+ScribbleUtil.localeString("geolocation")+'" ></div>',
                          '<div id="iEBox_title"></div>',
                          '<div id="iEBox_Ok" class="iEBox_button" tabindex="0"  role="button" aria-label="'+ScribbleUtil.localeString("ok")+'"  title="'+ScribbleUtil.localeString("ok")+'" ></div>',
                      '</div>' ,
                  '</div>' ,
                  '<div id="iEBox_moveframe" ></div>',
                  '<div id="iEBox_brushList" ></div>',
              '</div>'].join("");
           return function(){
              return html;
           };
    });
	
    /**
	 *   
	 */
	
    var dialogObj = {
        verticalOffset: 0, // removing the magic value of -75 since it was not causing any impact
        horizontalOffset: 0,
        repositionOnResize: true,
        overlayOpacity: .75,
        overlayColor: '#CCCCCC',
        draggable: true,
        _brushes:[2,3,4,5,6,7,8,9,10],
		_buttonsEnabled:{},
		_isOpen:false,
        show:function(title,callback){
           this._show(callback);
		   this._buttonsEnabled={Geo:true,Clear:true,Ok:true,Cancel:true,Brush:true};
        },
		setEnabled:function(button,enable){
		    if(this._buttonsEnabled[button]!=enable){
		           this._buttonsEnabled[button]=enable;
				   if(enable){
				       $('#iEBox_'+button).empty('<div style="background:white;width:100%;height:100%;opacity:0.75;"></div>').
				                  removeClass("disable_button");
				   } else {
				       $('#iEBox_'+button).append('<div style="background:white;width:100%;height:100%;opacity:0.75;"></div>').
				                  addClass("disable_button");
				   }
			       
			}
		},
		enableButtons:function(buttons){
		    for(var k in buttons){
				   this.setEnabled(k,buttons[k]);
			}
		},
        toggleBrushList:function(event){
                var that = this;
                if($('#iEBox_brushList').css('display')!='none'){
                    $('#iEBox_brushList').css({display:'none'});
                    return;
                }
                 var tmpFn =  document.onselectstart;
                 document.onselectstart=function(){return false;};
                 $('#iEBox_brushList').css({display:'block',visibility:'hidden'});
                    $('#iEBox_brushList').offset($('#iEBox_Brush').offset());
                    $('#iEBox_brushList').offset({top:$('#iEBox_Brush').offset().top-$('#iEBox_brushList').height()});
                    $('#iEBox_brushList').css({display:'block',visibility:'visible'});
                  //  $('#iEBox_brushList').focus();
                     $('#iEBox_brushList').one('mouseleave',function(event){
                         $('#iEBox_brushList').css({display:'none'});
                          document.onselectstart=tmpFn;
                     });
        },
        _attachCallbacks: function(callback) {
            var that = this;
           _.each("Cancel-Clear-Geo-Ok-Brush".split("-"),function(val,idx){
                    $("#iEBox_"+val).click( function(event) {
				       if(that._buttonsEnabled[val]){
                          event.stopPropagation();
                          callback(val);
				       }
                    });
					$("#iEBox_"+val).keydown( function(event) {
				       if(that._buttonsEnabled[val] && (event.keyCode == ENTER_KEY || event.charCode == ENTER_KEY || event.which == ENTER_KEY) ){
                          event.stopPropagation();
                          callback(val);
				       }
                    });
            });
            _.each($("#iEBox_brushList").children(),function(itm,idx){
                  $(itm).on(TouchUtil.POINTER_UP,function(event){
                         callback("BrushSelect",that._brushes[idx]);
                         $('#iEBox_brushList').css({display:'none'});
                          // $(itm).css({backgroundColor:'#FFFFFF'});
                  });
                  $(itm).on(TouchUtil.POINTER_DOWN,function(event){
                          // $(itm).css({backgroundColor:'#AAAAAA'});
                           event.preventDefault();
                  });
             });
            // capture tab key and escape
			$('#iEBox_container').keydown(function(event){
			   if((event.keyCode == ESC_KEY || event.charCode == ESC_KEY || event.which == ESC_KEY)){
                   event.stopPropagation();
               	   event.preventDefault();
               	   callback("Cancel");
               }
            });

            if(this.draggable){
                this._makeDraggable(TouchUtil.TOUCH_ENABLED);
            }
        },
        _makeDraggable:function(touchEnabled){
              var _isMouseDown=false;
              var _that=this;
              var dX;
              var dY;
              var offsetPos;
              var _mouseMovFun;
              var _mouseUpFun;
              $('#iEBox_panel').on(TouchUtil.POINTER_DOWN,function( event ){
              
                  if(TouchUtil.getTouches(event).length < 2){
                      if($(event.target).is('#iEBox_panel')){
                          $('body').on(TouchUtil.POINTER_MOVE,_mouseMovFun=function( event ){
                              if(TouchUtil.getTouches(event).length < 2 && _isMouseDown){
                                  event.preventDefault();
                                  var evt = TouchUtil.getTouchEvent(event);
                                  var delX = evt.pageX - dX;
                                  var delY = evt.pageY - dY;
                                  $('#iEBox_moveframe').offset({
                                      top: offsetPos.top+delY,
                                      left: offsetPos.left+delX
                                  });
                              }
                          });
                          $('body').on(TouchUtil.POINTER_UP,_mouseUpFun=function(event){
                              if(_isMouseDown){
                                  var offsetMove = $('#iEBox_moveframe').offset();
                                  var topEdge  = $(window).scrollTop();
                                  var bottomEdge = topEdge + $(window).height();
                                  if(offsetMove.top - topEdge < 1){
                                      offsetMove.top = topEdge;
                                  }
                                  if(offsetMove.top - bottomEdge + $('#iEBox_panel').height() > 0 ){
                                      offsetMove.top = bottomEdge - $('#iEBox_panel').height();
                                  }
                                  $('#iEBox_container').offset(offsetMove );
                                  $('#iEBox_moveframe').css({display:'none'}).offset(offsetMove);
                                  _isMouseDown=false;
                                  $('body').off(TouchUtil.POINTER_MOVE,_mouseMovFun);
                                  $('body').off(TouchUtil.POINTER_UP,_mouseUpFun);
                              }
                          });

                          var evt = TouchUtil.getTouchEvent(event);
                          _isMouseDown=true; dX = evt.pageX;dY=evt.pageY;
                          offsetPos = $('#iEBox_container').offset();
                          $('#iEBox_moveframe').css({display:'block'});
                          $('#iEBox_moveframe').offset(offsetPos);
                          $('#iEBox_moveframe').css('width',$('#iEBox_container').css('width'));
                          $('#iEBox_moveframe').css('height',$('#iEBox_container').css('height'));
                      }
                  }
              });
             
        },
        _createBrushes:function(){
               var _that=this;
              _.each(this._brushes,function(val,idx){
                  var divel = document.createElement('DIV');
                  var cnv = document.createElement('CANVAS');
                  var ctx = cnv.getContext('2d');
                  cnv.style.border='1px solid #AAAAAA';
                  cnv.width=TouchUtil.TOUCH_ENABLED?200:100;
                  cnv.height=TouchUtil.TOUCH_ENABLED?40:20;;
                  ctx.lineWidth=val;
                  ctx.beginPath();
                  ctx.moveTo(10,cnv.height/2);
                  ctx.lineTo(cnv.width-10,cnv.height/2);
                  ctx.stroke();
                  divel.appendChild(cnv);
                  $('#iEBox_brushList').append(divel);
               });
        },
		getIsOpen:function(){
		    return dialogObj._isOpen;
		},
		setIsOpen:function(open){
		    dialogObj._isOpen = open;
		},
        _show: function(callback) {
            dialogObj.hide();
            dialogObj._overlay('show');
            
            $("BODY").append(htmlStr());
            dialogObj.setIsOpen(true);
            $('#iEBox_container').focus();
            dialogObj._createBrushes();

            dialogObj._reposition();

            // calculate spacing around canvas area
            // this will be used to find canvas dimensions based on available screen area.
            var container_el = $('#iEBox_container');
            var canvas_el =  $('#iEBox_canvas');
            var container_width = $('#iEBox_container').outerWidth(true);
            var container_height = $('#iEBox_container').outerHeight(true);
            var canvas_width = canvas_el[0].width;
            var canvas_height = canvas_el[0].height;
            dialogObj.canvas_spacing = { x:container_width - canvas_width, y:container_height-canvas_height};

            dialogObj._maintainPosition(true);
            
            dialogObj._attachCallbacks(callback);
        },

        hide: function() {
            $("#iEBox_container").remove();
            this._overlay('hide');
            dialogObj.setIsOpen(false);
            this._maintainPosition(false);
        },
        _overlayResize:function(event) {
            if($("#iEBox_overlay").height()!= $(document).height()){
                $("#iEBox_overlay").height( $(document).height() );
            }

        },
        _disableMove:function(event) {
            event.preventDefault();
        },
        _overlay: function(status) {
            switch( status ) {
                case 'show':
                    this._overlay('hide');
                    $("BODY").append('<div id="iEBox_overlay"></div>');
                    $("#iEBox_overlay").css({
                        position: 'fixed',
                        zIndex: 99997,
                        top: '0px',
                        left: '0px',
                        width: '100%',
                        height: $(document).height(),
                        background: this.overlayColor,
                        opacity: this.overlayOpacity
                    });
                    if(xfalib.ut.XfaUtil.prototype.isSafari()) {
                        $("#iEBox_overlay").on('touchmove', this._disableMove);
                    }
                    $(document).on('scroll',this._overlayResize);
                break;
                case 'hide':
                    if(xfalib.ut.XfaUtil.prototype.isSafari()) {
                        $("#iEBox_overlay").off('touchmove');
                    }
                    $("#iEBox_overlay").remove();
                    $(document).off('scroll',this._overlayResize);
                break;
            }
        },
        /**
         * resize dialog based on available screen area
         */
        _resize:function(){
            // available screen area
            var aWidth = $(window).width();
            var aHeight = $(window).height();

            var sigCnv = $('#iEBox_canvas')[0];
            var bGeoCnv = $('#iEBox_geoCanvasBottom')[0];
            var rGeoCnv = $('#iEBox_geoCanvasRight')[0];

            // calculate amount of width height we need to reduce

            var totalCnvWidth = sigCnv.width + rGeoCnv.width;
            var totalCnvHeight = sigCnv.height + bGeoCnv.height;





            var diffW = totalCnvWidth + dialogObj.canvas_spacing.x - aWidth;
            if(diffW < 0) {
                diffW = 0;
            }
            var diffH = totalCnvHeight + dialogObj.canvas_spacing.y - aHeight;
            if(diffH < 0){
                diffH = 0;
            }

            var newTotalCnvHeight, newTotalCnvWidth;
            if( diffW > 0 || diffH > 0 ){ // does any side need resize

                if(diffH * totalCnvWidth > totalCnvHeight * diffW){ // need to reduce height
                   newTotalCnvHeight = totalCnvHeight - diffH;
                   newTotalCnvWidth = (newTotalCnvHeight * totalCnvWidth)/ totalCnvHeight;
                } else {
                   newTotalCnvWidth = totalCnvWidth - diffW;
                   newTotalCnvHeight = (newTotalCnvWidth * totalCnvHeight)/ totalCnvWidth;
                }

                // distribute evenly the new dimensions


                var newSigCnvWidth   = (newTotalCnvWidth*sigCnv.width)/totalCnvWidth;
                var newSigCnvHeight = (newTotalCnvHeight*sigCnv.height)/totalCnvHeight;

                sigCnv.style.width = newSigCnvWidth + "px";
                sigCnv.style.height = newSigCnvHeight + "px";

                bGeoCnv.style.width = newSigCnvWidth +"px";
                bGeoCnv.style.height = (newTotalCnvHeight - newSigCnvHeight) +"px";

                rGeoCnv.style.width = (newTotalCnvWidth - newSigCnvWidth) +"px";
                rGeoCnv.style.height = newSigCnvHeight + "px";


                $('#iEBox_caption').width(Math.floor(newSigCnvWidth));

            } else {
                sigCnv.style.width =  sigCnv.width + "px";
                sigCnv.style.height = sigCnv.height + "px";

                bGeoCnv.style.width =  bGeoCnv.width + "px";
                bGeoCnv.style.height = bGeoCnv.height + "px";

                rGeoCnv.style.width =  rGeoCnv.width + "px";
                rGeoCnv.style.height = rGeoCnv.height + "px";

                $('#iEBox_caption').width(sigCnv.width);

            }
        },
        _reposition: function() {
            var top = (($(window).height() * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) / 2) - ($("#iEBox_container").outerHeight() / 2)) + dialogObj.verticalOffset;
            var left = (($(window).width() * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) / 2) - ($("#iEBox_container").outerWidth() / 2)) + dialogObj.horizontalOffset;
            if( top < 0 ) top = 0;
            if( left < 0 ) left = 0;

            $("#iEBox_container").css({
                top: top + $(window).scrollTop() * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) + 'px',
                left: left + $(window).scrollLeft() * (1 / xfalib.ut.XfaUtil.prototype.formScaleFactor) + 'px'
            });
            $("#iEBox_container").focus();   // scroll up to the canvas
            $("#iEBox_overlay").height( $(document).height() );
        },
        _maintainDialog:function(){
            dialogObj._resize();
            dialogObj._reposition();
        },
        _maintainPosition: function(status) {
            if(dialogObj.repositionOnResize ) {
                switch(status) {
                    case true:
                        $(window).on('orientationchange', dialogObj._maintainDialog); // also reposition if device is tilted
                    break;
                    case false:
                        $(window).off('orientationchange', dialogObj._maintainDialog);
                    break;
                }
            }
        }
        
    };
    return dialogObj;
})();

/**
 * class definition for GeoLocationQueryRequest
 * encapsulated success and error handlers 
 */
function GeoLocQuery(){}
GeoLocQuery.prototype={
    init:function(success,failure){
        this._successHandler = success;
        this._errorHandler = failure;
        this._active=true;
        return this;
    },
    _handleSuccess:function(data){
        this._successHandler(data); 
    },
    _handleError:function(err){
        this._errorHandler(err);   
    },
    query:function(){
         _that=this;
         navigator.geolocation.getCurrentPosition(function(pos){
          if(_that._active){
             _that._handleSuccess(pos);
          }
          _that._active=false;
       },function(err){
          if(_that._active){
             _that._handleError(err);
          }
          _that._active=false;
       },{timeout:10000});
    },
    cancel:function(){
        _that._active=false;
    }

};
// GeoLocQuery definition ends here

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		return output;
 
	}
 
	
 
};

/**
 * Utility Singleton for handling PNG Data
 */
var PNGUtil=(function(){
    var slf={
   _LC_Scribble_MetaDataKey:"LC_SCIBBLE_METADATA",
           _isPng:function(b64data){
               return  b64data && b64data.replace(/\s+/g, "").indexOf("iVBORw0KGgo") == 0;   // LC-5711 : trim any leading WhiteSpace
               // TODO :  base64 encoding may have white spaces even between the magic numbers !! Think of a better way to stop stripping white spaces repeatedly in PNGUtil, and cache the result
           },
           _update_crc:function(crc,data){
               var c = crc;
               var n;
               for(n=0;n<data.length;n++){
                  c = this._XOR(slf._crc_table[(this._XOR(c,data.charCodeAt(n))&0xff)>>>0],(c>>>8));
               }
               return c;
           },
		   _XOR:function(a,b){
		       return (a^b)>>>0;
		   },
           _U32Int2Str:function(n){
                return String.fromCharCode((n>>>24)&0xFF)+String.fromCharCode((n>>>16)&0xFF)+String.fromCharCode((n>>>8)&0xFF)+String.fromCharCode(n>>>0&0xFF);
            },
           _init_crc_table:function(){
               var c=0;
               var n,k;
               slf._crc_table=[];
               for(n=0;n<256;n++){
                   c = n;
                   for(k=0;k<8;k++){
                      if(((c&1)>>>0)>0){
                          c = slf._XOR(0xedb88320 , (c>>>1));
                      } else {
                          c = c>>>1;
                      }
                   }
                   slf._crc_table[n]=c;
                }
           },
           _CRC:function(data){
                if(!this._crc_table) this._init_crc_table();
                return this._XOR(this._update_crc(0xffffffff,data) , 0xffffffff);
          },
          _prepareTextChunk:function(content,pad){
              // pad the data appropriately                      
               var len = content.length;
               var lenStr = slf._U32Int2Str(len);
               var chunkType="tEXt";
               var checkSumStr = slf._U32Int2Str(slf._CRC(chunkType+content));
               return lenStr+chunkType+content+checkSumStr;
           },
        _start:function(str){
           slf._startTime = new Date().getTime();
           slf._startFun=str;
        },
        _end:function(){
           var str = "Time "+slf._startFun+": "+(new Date().getTime()-slf._startTime);
          //  $('BODY').append("<p>"+str+"</p><br/>");
        },
        _readU32Int:function(ctx){
            var val=0;
            var d=ctx.d;
            val=((d.charCodeAt(ctx.p++)<<24)|(d.charCodeAt(ctx.p++)<<16)|(d.charCodeAt(ctx.p++)<<8)|(d.charCodeAt(ctx.p++)))>>>0;
             return val;
        },
       _readChunkType:function(ctx){
          var d = ctx.d;
          var str = d[ctx.p++]+d[ctx.p++]+d[ctx.p++]+d[ctx.p++];
          return str;
       },
        _makeReadOnly:function(b64data){
      slf._start("_makeReadOnly");
      // assume a valid png image encoded in base64;
      var bindata = slf._atob(b64data.replace(/\s+/g, '')); // remove white spaces that might have been inserted
      var pngctx={p:0,d:bindata};
      pngctx.p+=8;// skip pngheader
      // read IHDR
      var size = slf._readU32Int(pngctx);
      slf._readChunkType(pngctx); //IHDR
      pngctx.p+=size; //Data
      slf._readU32Int(pngctx);//CRC
      var metadataChunk = slf._prepareTextChunk(slf._LC_Scribble_MetaDataKey+String.fromCharCode(0)+"true");
      var newdata = pngctx.d.substring(0,pngctx.p)+metadataChunk+pngctx.d.substring(pngctx.p);
      var ret= slf._btoa(newdata);
      slf._end();
      return ret;
   },
   _atob:function(inp){
      if(window.atob){ return atob(inp); }
	  return Base64.decode(inp);
   },
   _btoa:function(inp){
      if(window.btoa){ return btoa(inp); }
	  return Base64.encode(inp);
   },
   _isReadOnly:function(b64data){
    slf._start("_isReadOnly");
       if(slf._isPng(b64data)){
           var testStr = slf._LC_Scribble_MetaDataKey+String.fromCharCode(0)+"true";
           var bindata = slf._atob(b64data.replace(/\s+/g, '')); // strip white spaces
           var pngctx={p:0,d:bindata};
           pngctx.p+=8;// skip header
           while(pngctx.p<pngctx.d.length){
               var size = slf._readU32Int(pngctx);
               var type = slf._readChunkType(pngctx);
               if(type=="tEXt"){
                   if(pngctx.d.indexOf(testStr,pngctx.p)==pngctx.p){
                       slf._end();
                       return true;
                   }
                  
              }
              pngctx.p+=size;
              slf._readU32Int(pngctx);// 
          }// while end
       }
       slf._end();
       return false;
   }
    };
    return slf;
})();

/**
 * JQuery widget definition starts here
 */
$.widget( "xfaWidget.ScribbleImageField", $.xfaWidget.imageField, {

    _widgetName:"ScribbleImageField",
    _geoLocQuery:null,
   _emptyImageVal:null,// should be null, but for now
   _extraInfo:null,
   _defaultStatus:"&nbsp;",
   _enforceGeoLoc:!!navigator.userAgent.match(/iPad/i),
   _sigCanvasWidth:696,
   _sigCanvasHeight:390,
   _geoCanvId:null,
    _geoLocAtBottom:false,
   _geoCanvasHeight:100,
   _geoCanvasWidth:696,
   
    _is_readonly:false,
	
    options: {
        tabIndex: 0,
        "role": "img"
    },

    getOptionsMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "displayValue": function(val) {
                if(this.options.commitProperty) {
                    if(!val){
                        this._displayValue(this._extractData(this._createEmptyImageData()));
                        this.$userControl.addClass("emptyScribble");
                        this._is_readonly=false;
                    } else {
                        this.$userControl.removeClass("emptyScribble");
                        if(PNGUtil._isPng(val)){
                            var widgetValue = "data:image/png;base64,"+this.options.value;
                        }else {
                            var widgetValue = "data:;base64," + this.options.value;
                        }
                        this._setValue(widgetValue);
                    }
                }
            }
        })
    },

    getEventMap: function() {
        var parentOptionsMap = $.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
        return $.extend({},parentOptionsMap,{
            "scribblefocus":xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,
            "click":null,
            "scribbleclick":xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT,
            "change":null,
            "scribblechange":xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,
            "blur":null,
            "scribbleclose":xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT
        })
    },

	/**
	 * This function achieves following
	 * 1. Calculate dimensions of canvases to be used
	 * 2. Findout if right or bottom canvas is to be used for geo location
	 */

	 aspectRatioToBeUsed :function(){
        var aspectRatio ;
        if(this.options.aspectRatio && parseFloat(this.options.aspectRatio) > 0){
           aspectRatio = 1/parseFloat(this.options.aspectRatio);  //--in MF ratio is computed as height/width instead of width/height
        } else {
           var imgEl = this.element.children("img"),
               width = imgEl.attr('width'),
               height = imgEl.attr('height'),
               fieldWidth,
               fieldHeight;

           if(width){
              fieldWidth = parseInt(width,10);
           } else {
              fieldWidth = imgEl.width();
           }
           if(height){
              fieldHeight = parseInt(height,10);
           } else {
              fieldHeight = imgEl.height();
           }
           aspectRatio = fieldHeight/fieldWidth;
        }
	    return aspectRatio;
	 },

    _setUpCanvas:function(){
        var aspectRatio ;
		aspectRatio = this.aspectRatioToBeUsed();
       
        // max width, height of generated image
        var maxWidth = 640;
        var maxHeight = 480;
        
        // width of field scaled to fit max image size
        var scaledWidth;
        var scaledHeight;
        
        
		// approx pixels required for rendering geo loc info in 12pt Arial font 
		var approxGeoLocWidth=250;
		var approxGeoLocHeight=84;
        
        scaledWidth = maxWidth;
        scaledHeight = maxWidth*aspectRatio;
        if(scaledHeight>maxHeight){
            scaledHeight = maxHeight;
            scaledWidth = maxHeight/aspectRatio;
        }
        
        // set canvas dimensions
        if(aspectRatio>=1){
			this._geoCanvId='iEBox_geoCanvasBottom';
            this._geoLocAtBottom=true;
          
			
             this._geoCanvasWidth = scaledWidth;
			 // limit height to 30% of full height;
			 this._geoCanvasHeight=Math.min(approxGeoLocHeight,scaledHeight/3);
             this._sigCanvasWidth = scaledWidth;
             this._sigCanvasHeight= scaledHeight-(this._enforceGeoLoc?this._geoCanvasHeight:0);
        } else {
			this._geoCanvId='iEBox_geoCanvasRight';
            this._geoLocAtBottom=false;
           
			
            this._geoCanvasHeight = scaledHeight;
			// limit width to 30% of full width;
			this._geoCanvasWidth=Math.min(approxGeoLocWidth,scaledWidth/3);
            this._sigCanvasHeight= scaledHeight;
            this._sigCanvasWidth= scaledWidth-(this._enforceGeoLoc?this._geoCanvasWidth:0);
        }
       
    },

   render : function() {
       var geoLocMandatoryOnIpad = this.options.geoLocMandatoryOnIpad;
       if(typeof(geoLocMandatoryOnIpad)!="undefined"){
           this._enforceGeoLoc= this._enforceGeoLoc && (/^(true|1)$/i).test($.trim(geoLocMandatoryOnIpad));
       }
       this._wgtId="wid"+~~(Math.random()*2000)+"_"+new Date().getTime();

       var $control = $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments)

       if(this.options.value || this.options.value != this._emptyImageVal){
          this._is_readonly=!!PNGUtil._isReadOnly(this.options.value);
       }
   
       if(this._is_readonly){
          $control.after("<div id='"+this._wgtId+"' class='sc_popUpMenu'></div>");
       } else {
          $control.after("<div id='"+this._wgtId+"' style='display:none;' class='sc_popUpMenu'></div>");
       }
	   
	   this._setUpCanvas();
       return $control;
    },

   click: function() {
        this.focus();
        var tmpEl = this.element.length?this.element[0]:this.element;
        if(this.options.access != "open")
          return;
       if (TouchUtil.POINTER_ENABLED || TouchUtil.TOUCH_ENABLED) {
           // simulate a click event
           tmpEl.dispatchEvent(TouchUtil.getPointerEvent(TouchUtil.POINTER_DOWN));
           tmpEl.dispatchEvent(TouchUtil.getPointerEvent(TouchUtil.POINTER_UP));
        }
        else {
              this.$userControl.triggerHandler("click");
        }
   },

    _attachEventHandlers:function($control){
	     if(TouchUtil.POINTER_ENABLED || TouchUtil.TOUCH_ENABLED){
            this._attachTouchEventHandlers($control);
         } else {
            this._attachMouseEventHandlers($control);
         }
         $control.keydown($.proxy(this._handleKeyDown,this));
    },
	_attachEventHandlerForCrossIcon:function($control){
	    var _that = this;
	    $control.mouseenter(function(event){
             if(_that.options.access != "open")
                    return;
             event.stopPropagation();
             if(_that._is_readonly){
                $('#'+_that._wgtId).css({display:'block'});
                var bodyMoveHandler;
                $('body').on('mousemove',bodyMoveHandler=function(event){
                    if(event.target!=$('#'+_that._wgtId)[0]&&event.target!=_that.$userControl[0]){
                        $('#'+_that._wgtId).css({display:'none'});
                         $('body').off('mousemove',bodyMoveHandler);
                    }
                });
              }
       });

       setTimeout(function(){ $("#"+_that._wgtId).click($.proxy(_that._onCrossClick,_that));},50);  
	},
    _attachTouchEventHandlers:function($control){
        var _timer,_that=this;
        var tmpEl = this.element.length?this.element[0]:this.element;
       tmpEl.addEventListener(TouchUtil.POINTER_DOWN,function(event){
           if(_that.options.access != "open")
              return;
             event.preventDefault();
           _timer = setTimeout(function(){
                _timer=0;
               _that._onCrossClick(event);
            },1000);
        });
       tmpEl.addEventListener(TouchUtil.POINTER_UP,function(event){
            if(_that.options.access != "open")
                return;
            event.preventDefault();
            if(_timer){
               clearTimeout(_timer);
               _that._onImageClick(event);
            } 
        });
		
	   if(TouchUtil.POINTER_ENABLED){
		     this._attachEventHandlerForCrossIcon($control);
			 setTimeout(function(){ $("#"+_that._wgtId).on(TouchUtil.POINTER_UP,function(event){
			        event.stopPropagation();
			 });},50);
	   }
    },

    _attachMouseEventHandlers:function($control){
         var _timer=0,_that=this,_hoverTimer=0;
        $control.dblclick(function(event){
            if(_that.options.access != "open")
                return;
           event.preventDefault();event.stopPropagation();
           if(_timer.val){
             clearTimeout(_timer);_timer =0;
           }
           _that._onCrossClick(event);
        }).click(function(event){
           _that.$userControl.trigger("scribbleclick",event);
           if(_that.options.access != "open")
                return;
           event.preventDefault();
           event.stopPropagation();
           if(_timer){
              clearTimeout(_timer);_timer=0;
            } else {
              _timer = setTimeout(function(){
                 _timer=0;
                 _that._onImageClick(event);
              },500);
            }
       });
	   
	   this._attachEventHandlerForCrossIcon($control);
       
    },

    _onCrossClick:function(event){
        if(!this._is_readonly) return;
        this.$userControl.trigger("scribblefocus",event);
        this.$userControl.trigger("scribbleclick",event);
        event.stopPropagation();
        $.alertBox.yesNo(null,
         this.localeStrings().clearSignatureConfirm,
         this.localeStrings().clearSignature,
         $.proxy(this._removeSigConfirmationHandler,this));
     },

     _removeSigConfirmationHandler:function(isYes){
        if(isYes){
           this._saveValue(this._emptyImageVal);
           this._displayValue(this._extractData(this._createEmptyImageData()));
           this.$userControl.addClass("emptyScribble").trigger("scribbleclose",{});
           this._is_readonly=false;
        }
     },

    _createEmptyImageData:function(){
         if(!this._emptyImageData){
            var emptyCanvasObj = document.createElement('canvas');
            emptyCanvasObj.style.width=this._sigCanvasWidth+'px';
            emptyCanvasObj.style.height=this._sigCanvasHeight+'px';
            emptyCanvasObj.width=this._sigCanvasWidth;
            emptyCanvasObj.height=this._sigCanvasHeight;
            var ctx = emptyCanvasObj.getContext('2d');
            ctx.fillStyle='#ffffff';
            ctx.clearRect(0,0,this._sigCanvasWidth,this._sigCanvasHeight);
            this._emptyImageData = emptyCanvasObj.toDataURL("image/png");
         }
         return this._emptyImageData;
     },

    getCommitValue: function() {
        return this.options.value
    },

    _saveValue:function(val){
        this.options.value=val;
        this.$userControl.trigger('scribblechange');
    },

    _displayValue:function(val){
        if(this.options.commitProperty) {
            //hardcode the widget VALUE by unknown image type
            if(val){
              var widgetValue = "data:image/png;base64,"+val;
                this._setValue(widgetValue);
            }
        }
        else
            this.logger().debug("xfaView","[DefaultWidget._update], User Control or Commit Property is null" );
    },

    _doOk:function(){
        var mainCanvas = document.createElement('CANVAS');
        var geoCnv = $('#'+this._geoCanvId)[0];
        var sigCnv = $('#iEBox_canvas')[0];
        var ctx = mainCanvas.getContext('2d');
       
        if(geoCnv.width>0&&geoCnv.height>0){
            
            if(this._geoLocAtBottom){
                mainCanvas.width=sigCnv.width;
                mainCanvas.height =sigCnv.height+geoCnv.height;
                ctx.drawImage(sigCnv,0,0);
                ctx.drawImage(geoCnv,0,sigCnv.height);
            } else {
                mainCanvas.width=sigCnv.width+geoCnv.width;
                mainCanvas.height =sigCnv.height;
                ctx.drawImage(sigCnv,0,0);
                ctx.drawImage(geoCnv,sigCnv.width,0);
            }
        } else {
             mainCanvas.width=sigCnv.width;
             mainCanvas.height =sigCnv.height;
             ctx.drawImage(sigCnv,0,0);
        }
        imageEditDialog.hide();
        var newdata = mainCanvas.toDataURL("image/png");//(this.myScribbleHandle||"").toString();
        
         var val,val1;
         if((val=/*=*/this._extractData(newdata))){
         //  val1 = PNGUtil._makeReadOnly(val);
            val = PNGUtil._makeReadOnly(val);
            this._saveValue(val);   
            this._is_readonly=true;       
          }
          this._geoLocQuery&&this._geoLocQuery.cancel();// cancel current geo loc request;
        this.$userControl.trigger("scribbleclose")
    },
    _handleOk:function(){
        if(this._enforceGeoLoc){
           this._geoLocQuery = new GeoLocQuery().init($.proxy(function(data){
               this._geoQuerySuccessHandler(data);
               this._doOk();
           },this),$.proxy(this._geoQueryErrorHandler,this));
           this._geoLocQuery.query();
           this._showMessage(this.localeStrings().fetchGeoLocation);
        } else {
          this._doOk();
        }
    },

    _handleCancel:function(){
         imageEditDialog.hide();
         this._geoLocQuery&&this._geoLocQuery.cancel();// cancel current geo loc request;
        this.$userControl.trigger("scribbleclose")
    },

    _handleClear:function(){
        this.myScribbleHandle.setEnabled(true);
        this._is_readonly=false;
        this._makeReadOnly(this._is_readonly);
        $('#iEBox_canvas')[0].width=this._sigCanvasWidth;
         $('#iEBox_caption').width(this._sigCanvasWidth);
		$('#iEBox_canvas')[0].height=this._sigCanvasHeight;
		var geoCanv = $('#'+this._geoCanvId)[0];
        imageEditDialog.enableButtons({Ok:false,Clear:false});
        geoCanv.width=0;
        geoCanv.height=0;
        imageEditDialog._resize();
        this._geoLocQuery&&this._geoLocQuery.cancel();// cancel current geo loc request;
    },
    _makeReadOnly:function(readonly){
       imageEditDialog.enableButtons({Ok:false,Clear:false,Geo:!readonly,Brush:!readonly});
       if(readonly){
		   $('#iEBox_canvas').css({border:'1px solid gray'});
           $('#iEBox_caption').css({display:'none'});

       }
       this._defaultStatus = "&nbsp;";
       this._showMessage(this._defaultStatus);
    },

    _showMessage:function(msg){
        var _that = this;
        if(this._msgTimeout) { clearTimeout(this._msgTimeout); this._msgTimeout=0; }
         $("#iEBox_title").replaceWith('<div id="iEBox_title">'+msg+'</div>');
         this._msgTimeout = window.setTimeout(function(){
             $("#iEBox_title").replaceWith('<div id="iEBox_title">'+_that._defaultStatus+'</div>');
         },15000);
    },

    _geoQueryErrorHandler:function(err){
        this._showMessage(this.localeStrings().errorFetchGeoLocation);
    },

	_getLogMessage:function(key){
		     return this.logMsgs()[key]||key;
	},

    _handleGeo:function(){
          // initiate geolocation 
       if(navigator.geolocation){
           this._geoLocQuery = new GeoLocQuery().init($.proxy(this._geoQuerySuccessHandler,this),$.proxy(this._geoQueryErrorHandler,this));
           this._geoLocQuery.query();
           this._showMessage(this.localeStrings().fetchGeoLocation);
       } else {
           this.logger().debug("xfaView",this._getLogMessage("ALC-FRM-901-011"));
       }
    },

    // This Function is used to fetch the geolocation.
    calculateGeolocation: function(){
      this._handleGeo();
    },

    _handleBrushSelect:function(w){
        if(this.myScribbleHandle&&!this._is_readonly) {
            this.myScribbleHandle.setLineWidth(w);
        }
    },

    _handleBrush:function(evt){
        imageEditDialog.toggleBrushList(evt);
    },
	_handleKeyDown:function(event){
		if(event.keyCode == ENTER_KEY || event.charCode == ENTER_KEY || event.which == ENTER_KEY) { // touch devices may return charCode
		    event.preventDefault();
		    this._onImageClick(event);
		} else if(event.keyCode == DELETE_KEY || event.charCode == DELETE_KEY || event.which == DELETE_KEY) {
		    this._onCrossClick(event);
		}
    },
    _dialogCallback:function(button_val,arg1){
           // add back on click handler
         //  this.$userControl.click($.proxy(this._onImageClick, this));
                     
           switch(button_val){
               case "Ok":
               this._handleOk();
               break;
               case "Cancel":
               this._handleCancel();
               break;
               case "Clear":
               this._handleClear();
               break;
               case "Geo":
               this.calculateGeolocation();
               break;
               case "BrushSelect":
               this._handleBrushSelect(arg1);
               break;
               case "Brush":
               this._handleBrush(arg1);
               break;
              
           }
    },

    _geoQuerySuccessHandler:function(data){
        this._renderPosition(data);
    },

	_fitGeoLocText:function(latStr,longStr,timeStr,ctx,maxWidth,maxHeight){
	    var fontSize=12;
		ctx.font="bold "+fontSize+"pt Arial";
		var width = Math.max(ctx.measureText(latStr).width,ctx.measureText(longStr).width,ctx.measureText(timeStr).width);
		var lineHeight = ctx.measureText("m").width*1.5;
		while((width>maxWidth||3*lineHeight>maxHeight)&&fontSize>1){
		    fontSize--;
		    ctx.font="bold "+fontSize+"pt Arial";
		    width = Math.max(ctx.measureText(latStr).width,ctx.measureText(longStr).width,ctx.measureText(timeStr).width);
		    lineHeight = ctx.measureText("m").width*1.5;
		}
		return {width:width,lineHeight:lineHeight,fontSize:fontSize};
	},

    _renderPosition:function(position){
        if(position&&position.coords){
         this._showMessage("&nbsp;");
            var latStr = this.localeStrings().latitude+": " + position.coords.latitude;
            var longStr = this.localeStrings().longitude+": " + position.coords.longitude;
            var dateObj = new Date();
            var tZone = (dateObj.getTimezoneOffset()/60*-1);
            
            var timeStr = this.localeStrings().time+": "+(dateObj.getMonth()+1)+"/"+dateObj.getDate()+"/"+dateObj.getFullYear()+" "+dateObj.getHours()+":"+dateObj.getMinutes()+":"+dateObj.getSeconds()+((tZone>0)?" +":" ")+(tZone);
            var canvasObj  = $('#'+this._geoCanvId)[0];
			var sigCanvas = $('#iEBox_canvas')[0];
			var dummyCanvas = document.createElement('canvas');
            if(canvasObj){
			   var ctx = canvasObj.getContext('2d');
			   ctx.font="bold 12pt Arial";

			   canvasObj.width=this._geoCanvasWidth;
               canvasObj.height=this._geoCanvasHeight;
			   var layout = this._fitGeoLocText(latStr,longStr,timeStr,ctx,canvasObj.width,canvasObj.height);
               var aspectRatio ;
     		   aspectRatio = this.aspectRatioToBeUsed();
			   if(!this._enforceGeoLoc){
			       if(this._geoLocAtBottom){
                     dummyCanvas.height = this._sigCanvasHeight-canvasObj.height;
                     dummyCanvas.width = dummyCanvas.height/aspectRatio;
                   } else {
                     dummyCanvas.width = this._sigCanvasWidth-canvasObj.width;
					 dummyCanvas.height = dummyCanvas.width*aspectRatio;
				   }
				   // move drawn signature to a temporary canvas and scale it to new dimension
                   dummyCanvas.getContext('2d').drawImage(sigCanvas,0,0,dummyCanvas.width,dummyCanvas.height);
                   if(this._geoLocAtBottom){
                     sigCanvas.height = dummyCanvas.height;
                     sigCanvas.getContext('2d').drawImage(dummyCanvas,(sigCanvas.width-dummyCanvas.width)/2,0);
                   } else {
                     sigCanvas.width = dummyCanvas.width;
                     sigCanvas.getContext('2d').drawImage(dummyCanvas,0,(sigCanvas.height-dummyCanvas.height)/2);
                   }
                   $('#iEBox_caption').width(sigCanvas.width);
				   imageEditDialog.enableButtons({Clear:true});
			   }
			      
			   var fwidth = layout.width;
               var fheight = layout.lineHeight;
			   var bottomMargin=2;
               ctx.fillStyle='#555555';
               ctx.font="bold "+layout.fontSize+"pt Arial";
               ctx.fillText(latStr,0,canvasObj.height-2*fheight-bottomMargin);
               ctx.fillText(longStr,0,canvasObj.height-fheight-bottomMargin);
               ctx.fillText(timeStr,0,canvasObj.height-bottomMargin);
			   
			   imageEditDialog._resize();
            }
        }
    },
    _scribbleCallback:function(){
       imageEditDialog.enableButtons({Clear:true,Ok:true});  //  enable clear and ok buttons
    },
    _onImageClick:function(){
       if(!imageEditDialog.getIsOpen()){
           var _that = this;
           imageEditDialog.show("&nbsp;",$.proxy(this._dialogCallback, this));
           if(!this._enforceGeoLoc){
               $('#iEBox_Geo').css({display:'inline-block'});
           }
           var image = new Image();
           image.onload=function(){
               _that.myScribbleHandle = new Scribble("iEBox_canvas",image,image.width,image.height,$.proxy(_that._scribbleCallback,_that));
               _that.myScribbleHandle.setEnabled(!_that._is_readonly);
               $('#iEBox_caption').width(image.width);
               $('#iEBox_container').css({display:'table'});
               imageEditDialog._resize();
               imageEditDialog._reposition();      // recalculate position, so that the values are updated, esp. in iPad
           }
           if(!this.options.value||this.options.value==this._emptyImageVal){
               this._is_readonly=false;
               this.$userControl.addClass("emptyScribble");
               image.src = this._createEmptyImageData();
           } else {
               this.$userControl.removeClass("emptyScribble");
               if(PNGUtil._isPng(this.options.value)){
                   this._is_readonly = !!PNGUtil._isReadOnly(this.options.value);
			       image.src = "data:image/png;base64,"+this.options.value;//this.createBl _that.$userControl.attr(_that.options.commitProperty);
               } else {
                   image.src = "data:;base64," + this.options.value;//this.createBl _that.$userControl.attr(_that.options.commitProperty);
		       }
           }
           this._makeReadOnly(this._is_readonly);
       }
    },

    _extractData:function(datauri){
        var idx;
        if(datauri!=null&&datauri.length>0&&datauri.indexOf("data:")==0){
            if((idx=datauri.indexOf(","))>0){
                return datauri.substr(idx+1);
            }
        }
    },

    _setValue:function(val){
        this.$userControl.prop(this.options.commitProperty, val);
        this.$userControl.attr(this.options.commitProperty, val);
        if(this._dummyImg){
            this._dummyImg.setAttribute(this.options.commitProperty,val);
        }
    }
});
 //hack for IOS5 touch bug
  $(function(){
         $('body').bind('touchstart', function(e) {});
  });
  
})($,xfalib);
(function ($) {

    var _defaults = {
        placeHolderText : "Enter comments here"
    };

    var AdobeFileAttachment = function (element, options) {
        this.options = options;
        this.$elementFileUploadBtn = [];
        this.$elementFileList = [];
        this.$element = $(element);
        this.$parent = this.$element.parent();
    };

    var isBrowserIE9OrIE10 = ($.browser.msie && ($.browser.version === '9.0' || $.browser.version === '10.0')),
        fileLabelsCount = 0;


    AdobeFileAttachment.prototype = {
        _fileIframeName : "guide-fu-iframe",
        _addFile : "Add File",

        clear: function () {
            this.$element.val('');
            this.$elementFileList.empty();
        },

        destroy: function () {
            this.$fileDomElements = $.map(this.$fileDomElements, function(item){
                // since item can be null or object, doing this check
                if(_.isObject(item) && item.val().length === 0) {
                    //TODO: remove item from dom, since there is a memory leak
                    return item;
                }
            });
            this.values = [];
            if(isBrowserIE9OrIE10){
                if(_.last(this.$fileDomElements) == null){
                    this.cloneFileInputAndUpdateIdForIE9();
                } else {
                    this.updateLabelForAttr(_.last(this.$fileDomElements).attr("id"));
                }
            }
            this.$element.trigger("change.fileupload");
        },

        _setUrl : function(url, index){
            this.$elementFileList.find("span.guide-fu-fileName").eq(index).data("key", url);
        },

        _getUrl : function(index) {
            return this.$elementFileList.find("span.guide-fu-fileName").eq(index).data("key");
        },
        getSetFilePathAndReturnNamePathMap: function(valueList) {

            var mapOfObjectsHavingTempPathAndFileNames = {},
                $temp,
                tempPath;

            $.each(this.$elementFileList.children(), function ( index, childLiElement) {
                $temp = $(childLiElement).find("span.guide-fu-fileName");
                tempPath = $temp.data("key");
                if(!tempPath && valueList && valueList[index]) {
                    $temp.data("key", valueList[index]);
                }
                mapOfObjectsHavingTempPathAndFileNames[$temp.html()] = tempPath || $temp.data("key");
            });
            return mapOfObjectsHavingTempPathAndFileNames;
        },


        value : function(value) {
            if(!_.isUndefined(value)) {
                var _self = this,
                    comments = this.comment(),
                    isChange = false,
                    oldUrls = {};
                // Cache the url before deletion
                this.$elementFileList.children().find("span.guide-fu-fileName").each(function(){
                    var url = $(this).data("key");
                    if(!_.isUndefined(url)){
                        var fileName = url.substring(url.lastIndexOf("/") + 1);
                        oldUrls[fileName] = url;
                    }
                });
                this.$elementFileList.empty();
                if(value != null) {
                    var arr = value.split("\n");
                    // Update the value array with the file
                    this.values = _.map(arr, function(fileName, index){
                        // Check if file Name is a path, if yes get the last part after "/"
                        var slash = fileName.lastIndexOf("/"),
                            fileUrl = fileName,
                            fileUploadUrl = null;
                        if(slash !== -1) {
                            // Store the cached url here
                            fileUrl = fileUploadUrl = fileName;
                            fileName = fileName.substring(slash + 1);
                            // case: when you click on save second time
                            if((_.isObject(_self.$fileDomElements[index]) && _self.$fileDomElements[index].val().length > 0) || _.isString(_self.$fileDomElements[index])){
                                isChange = true;
                                _self.$fileDomElements[index] = null;
                            } else if(_self.$fileDomElements[index] !== null) { // create a dummy file dom for the cached value
                                 isChange = true;
                                _self.$fileDomElements.splice(index, 0, null);
                            }
                        } else if (oldUrls[fileName]) {
                            fileUploadUrl = oldUrls[fileName];
                        }
                        _self.showFileList(fileName, comments[index], fileUploadUrl);
                        return fileUrl;
                    });
                    if(isChange){
                        this.$element.trigger("change.fileupload");
                    }
                } else {
                    if(_.isArray(this.values) && this.values.length !== 0){
                        this.destroy();
                    }
                }
            }
            else {
                return this.values;
            }
        },

        fileAttachment: function(){
            return this.values;
        },

        comment : function(value){
            var _self = this,
                $elem = null,
                comments;
            if (!_.isUndefined(value)) {
                if(value != null) {
                    comments = value.split("\n");
                    $elem = this.$elementFileList.find('div.guide-fu-comment');
                    $elem.each(function(index){
                        $(this).html(comments[index]);
                    });
                }
            }
            else {
                $elem = this.$elementFileList.find('div.guide-fu-comment');
                comments = [];
                $elem.each(function(){
                    comments.push($(this).html());
                });
                return comments;
            }
        },

        multiSelect : function(value){
            if(value !== undefined)
                this.options.multiSelect = value;
            else
                return this.options.multiSelect;
        },

        fileSizeLimit : function(value){
            if(value !== undefined)
                this.options.fileSizeLimit = value;
            else
                return this.options.fileSizeLimit;
        },

        access : function(value){
            if(value == "readOnly") {
                this.$element.attr("disabled", "disabled");
                //for readOnly hide the delete icon in file list
                $(this.$parent).addClass('guide-fu-disabled');
            }
            else if(value == "open") {
                this.$element.removeAttr("disabled");
                $(this.$parent).removeClass('guide-fu-disabled');
            }
        },

        fileList : function(value) {
            var filtered,
                _self = this;
            if(value !== undefined){
                this.$fileDomElements = [];
                _.each(value, function(item, index){
                    if((_.isObject(item) && (isBrowserIE9OrIE10 || item.val().length > 0)) || (_.isString(item))){
                         // check if index is within the length
                         // this is written for delete case
                         // if item is a string, then it should be set null
                         if(_.isString(item)){
                             item = null;
                         }
                         _self.$fileDomElements[index] = item;
                    }
                });
                filtered = this.$fileDomElements;
                // In case of IE9, get the last element of fileDom and update the id for label
                if(isBrowserIE9OrIE10 && value !== null){
                    // Case: if it is single select, and then we do a restore and then after attaching another file we click save
                    if(_.last(this.$fileDomElements) == null){
                        this.cloneFileInputAndUpdateIdForIE9();
                    } else {
                        this.updateLabelForAttr(_.last(this.$fileDomElements).attr("id"));
                    }
                }
            }
            else {
                // here filtered is a new array
                // A new array is returned over here so that the user of this API doesn't try to change the widget array directly
                filtered = $.map(this.$fileDomElements, function(item, index){
                    if(!item) {
                        return _self._getUrl(index);
                    } else if((item[0].files && item[0].files.length !== 0)
                            || (_self.options.multiSelect || item[0].value.length > 0)) {
                        return item;
                    }
                });
            }
            return filtered;
        },

        // file preview html
        fileItemPreview: function(){
            return $("<span></span>").addClass("guide-fu-filePreview glyphicon glyphicon-ok");
        },

        // force flag indicates that forcefully set the dom but don't update the options
        buttonText: function (value, force) {
            if (value !== undefined) {
                if(!force)
                    this.options.buttonText = value;
                this.$elementFileUploadBtn.find('span.guide-fu-label').html(value);
            } else {
                return this.options.buttonText;
            }
        },

        // To change the icon of the button, the user should customize the class
        btnIcon: function () {
            return $("<span></span>").addClass("guide-fu-icon glyphicon glyphicon-folder-open");
        },

        btnLabel: function(){
            return $("<span></span>").addClass("guide-fu-label").html(this.options.buttonText);
        },

        fileItemList: function(){
            return this.$parent.find(this.options.fileItemListClass);
        },

        getNewCommentElementSummary : function(text){
            return $("<div title='Click to edit' tabindex='0'></p>").addClass("guide-fu-comment").text(text || _defaults.placeHolderText);
        },

        getNewCommentElement : function(text){
            return $("<div contenteditable='true' tabindex='0'></div>").addClass("guide-fu-comment").text(text || "");
        },

        fileItem: function(fileName, comment, fileUrl){
            var $fileItem = $("<li></li>").addClass("guide-fu-fileItem");
            var nameWithoutMarker = xfalib.ut.Utilities._getNameWithoutMarker(fileName);
            var $elem = $("<span tabindex='0'></span>").addClass("guide-fu-fileName").attr("aria-label", nameWithoutMarker).text(nameWithoutMarker).appendTo($fileItem).keypress(function(e) {
                if (e.keyCode === 13 || e.charCode === 32) {
                    $(e.target).click();
                }
            }).click($.proxy(this.handleFilePreview, this));
            if(this.options.disablePreview) {
               $elem.addClass('non-preview-fileName');
            }
            if(fileUrl != null){
                $elem.attr("data-key", fileUrl);
            }
            $("<span tabindex='0'></span>").addClass("guide-fu-fileClose close").attr("role", "button").attr("aria-label", xfalib.locale.Strings.FileCloseAccessText + nameWithoutMarker).text("x").appendTo($fileItem).keypress(function(e) {
                if (e.keyCode === 13 || e.charCode === 32) {
                    $(e.target).click();
                }
            })
                .click($.proxy(this.handleClick, this));

            this.fileItemPreview().appendTo($fileItem);

            if(this.options.showComment){
                this.getNewCommentElementSummary(comment).appendTo($fileItem).focus($.proxy(this.handleCommentClick, this)).click($.proxy(this.handleCommentClick, this));
            }
            return $fileItem;
        },

        toggleFileUploadBtn: function(){
            if(this.options.multiSelect) {
                // Change the look of file upload button
                if(this.$elementFileList.children().length > 0){
                    // Change the text
                    this.buttonText(this._addFile, true);
                    // Change the icon too
                    this.$elementFileUploadBtn.find('span.guide-fu-icon').removeClass("glyphicon-folder-open").addClass("glyphicon-plus");
                } else {
                    this.buttonText(this.options.buttonText);
                    this.$elementFileUploadBtn.find('span.guide-fu-icon').removeClass("glyphicon-plus").addClass("glyphicon-folder-open");
                }
            }
        },

        showInvalidSize: function(fileName){
            var that = this;
            var IS_IPAD = navigator.userAgent.match(/iPad/i) !== null,
                IS_IPHONE = (navigator.userAgent.match(/iPhone/i) !== null);
            if(IS_IPAD || IS_IPHONE){
                setTimeout(function() {
                  that.invalidMessage(that,fileName);
                }, 0);
            }
            else {
               this.invalidMessage(this,fileName);
            }
        },

        invalidMessage: function(refObj,fileName){
           alert(xfalib.ut.LocalizationUtil.prototype.getLocalizedMessage("",xfalib.locale.Strings["FileSizeGreater"] ,[fileName , refObj.options.fileSizeLimit]));
        },

        /***
         * Finds the value in the array, if the value is a url then it uses the filename in the url to search for the text
         * This is done since our model stores the URL too in case of draft restore or clicking on save in guide
         * @param text
         * @returns {number}
         * @private
         */
        _getIndexOfText : function(text){
            var index = -1;
            _.find(this.values, function(value, iter){
                // if value is a url, then compare with last
                var tempValue = value;
                if(tempValue.match(/\//g) && tempValue.match(/\//g).length > 1){
                    tempValue =  value.substring(value.lastIndexOf("/")+1);
                    tempValue = xfalib.ut.Utilities._getNameWithoutMarker(tempValue);
                }
                if(tempValue === text){
                    index = iter;
                    // this is to just break the loop
                    return value;
                }
            });
            return index;
        },


        /**
         * This event listener gets called on click of close button in file upload
         *
         * @param event
         */
        handleClick: function(event){

            var $elem = $(event.target),
                text = $elem.prev().text(),
                index = this._getIndexOfText(text),
                url = $elem.prev().data("key");
            if (index != -1) {
                this.values.splice(index, 1);
                this.$fileDomElements.splice(index, 1);
                if (isBrowserIE9OrIE10) {
                    this.cloneFileInputAndUpdateIdForIE9();
                }
                if (url != null) {
                    // remove the data so that others don't use this url
                    $elem.prev().removeData("key");
                }
            }
            // Remove the dom from view
            //All bound events and jQuery data associated with the element are also removed
            $elem.parent().remove();
            // trigger the change event to update the value
            this.$element.trigger("change.fileupload");
            // Set the focus on file upload button after click of close
            this.$elementFileUploadBtn.focus();

        },

        // this function maintains a map for
        handleFilePreview: function(event){
            if(!this.options.disablePreview) {
                var $elem = $(event.target),
                    text = $elem.text(),
                    index = this._getIndexOfText(text),
                    fileDom = null,
                    fileName = null,
                    fileUrl = null,
                    timeStamp = new Date().getTime();

                // for draft usecase, if text contains "/" in it, it means the file is already uploaded
                // text should contain the path, assuming that the fileUrl is stored in data element

                if(index != -1){
                    // Store the url of file as data
                    if(!_.isUndefined($elem.data("key")))
                        fileUrl = $elem.data("key");

                    if(fileUrl)  {
                        //prepend context path if not already appended
                        if (!(fileUrl.lastIndexOf(this.options._getUrl, 0) === 0)) {
                            fileUrl =  this.options._getUrl + fileUrl;
                        }
                        this.previewFile.apply(this, [null, {"fileUrl" : fileUrl}]);
                    } else {
                        fileDom = this.$fileDomElements[index];
                        fileName = timeStamp + "-" + this.values[index];
                        fileUrl=  this.$element[this.options.uploaderPluginName]("uploadFile", {
                            'fileName' : fileName,
                            'fileDom' : fileDom,
                            '_filePath': this.options._filePath,
                            '_fileIframeName': this.options._fileIframeName,
                            '_uuidGenerator': this.options._uuidGenerator,
                            '_getUrl': this.options._getUrl
                        });

                        $elem.data("key", fileUrl);
                    }
                }
            }
        },

        previewFile: function(event){
            var url = null;
            if(_.isUndefined(arguments[1]))
                url = this.$element[this.options.uploaderPluginName]("getFileUrl");
            else
                url = arguments[1].fileUrl;
            var lastIndex = url.lastIndexOf('/');
            //to make sure url has a slash '/'
            if(lastIndex >= 0) {
                //encode the filename after last slash to ensure the handling of special characters
                url = url.substr(0, lastIndex) +'/'+ encodeURIComponent(url.substr(lastIndex + 1));
            }
            window.open(url,'','scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');
        },

        resetIfNotMultiSelect: function(){
            if(!this.options.multiSelect){
                // Reset the value and file array
                this.values = [];
                //this.comments = [];
            }
        },

        showFileList: function(fileName, comment, fileUrl){
            if(!this.options.multiSelect || fileName == null || _.isUndefined(fileName)) {
                // if not multiselect, remove all the children of file list
                this.$elementFileList.empty();
            }

            // Add the file item
            // On click of close, remove the element and update the model
            // handle on click of preview button
            if(fileName != null) {
                this.$fileItem = this.$elementFileList.append(this.fileItem(fileName, comment, fileUrl));
            }
        },

        /**
         * Handles the click on comment field
         *
         * TODO: Implement show/hide behaviour instead of replaceWith
         * This may be cause problem during bubble up of event
         *
         * @param event
         */
        handleCommentClick : function(event){
            var $commentElem = null,
                $elem = $(event.target);
            if ($elem.text() === _defaults.placeHolderText) {
                $commentElem = this.getNewCommentElement()
            } else {
                $commentElem = this.getNewCommentElement($(event.target).text());
            }
            $elem.replaceWith($commentElem);
            // register the event again
            if(isBrowserIE9OrIE10){
                $commentElem.focus().focusout($.proxy(this.handleCommentBlur, this));
            } else {
                $commentElem.focus().blur($.proxy(this.handleCommentBlur, this));
            }
        },

        handleCommentBlur : function(event){
            var $commentSummaryElem = null,
                $elem = $(event.target);
            if ($elem.text() === _defaults.placeHolderText) {
                $commentSummaryElem = this.getNewCommentElementSummary();
            } else {
                $commentSummaryElem = this.getNewCommentElementSummary($(event.target).text());
            }
            $elem.replaceWith($commentSummaryElem);
            $commentSummaryElem.focus($.proxy(this.handleCommentClick,this)).click($.proxy(this.handleCommentClick,this));
            // Add a div with the html
            this.$element.trigger("change.fileupload");
        },

        handleChange: function (evnt) {
            var currFileName = '',
                fileNames = '',
                $elem = $(evnt.target),
                files = $elem[0].files;
            // Initially set the invalid flag to false
            this.isInvalid = false;
            this.resetIfNotMultiSelect();
            // Iterate through all the files
            if(isBrowserIE9OrIE10) { // IE9 doesn't support FileList, hence files variable is undefined
                currFileName = $elem.val().split("\\").pop();
                //update the last element of array
                if(this.$fileDomElements.length > 0){
                    this.$fileDomElements[this.$fileDomElements.length - 1] = $elem;
                }
                this.cloneFileInputAndUpdateIdForIE9();

                // In case of IE9, only do this
                if(_.isUndefined(files)){
                    this.showFileList(currFileName);
                    this.values.push(currFileName);
                    // trigger the change event to update the value
                    this.$element.trigger("change.fileupload");
                }
            }
            if(!_.isUndefined(files)) {
                _.each(files, function (file) {
                    currFileName = file.name.split("\\").pop();
                    // Now size is in MB
                    var size = file.size / 1024 / 1024;
                    // set the invalidsize flag
                    if ((size > parseFloat(this.options.fileSizeLimit))) {
                        this.isInvalid = true;
                        fileNames = currFileName + "," + fileNames;
                    }

                    // if the file is not invalid, show it and push it to internal array
                    if (!this.isInvalid) {
                        this.showFileList(currFileName);
                        this.values.push(currFileName);
                    } else {
                        // Remove the last element from the array
                        this.$fileDomElements.splice(-1, 1);
                        // in case of IE10, create one extra element
                        if(isBrowserIE9OrIE10){
                            this.cloneFileInputAndUpdateIdForIE9();
                        }
                    }

                    // trigger the change event to update the value
                    this.$element.trigger("change.fileupload");
                }, this);
            }

            if(this.isInvalid) {
                this.showInvalidSize(fileNames.substring(0, fileNames.lastIndexOf(',')));
            }
        },

        cloneFileInputAndUpdateIdForIE9 : function(){
            var elem = _.last(this.$fileDomElements),
                elemExists = elem != null,
                elemHasValue = elemExists && elem.val().length > 0,
                elemId = null,
                selector = null;
            // the user has clicked on cancel on the browse dialog and clone only if not multiSelect
            if(!elemExists || (elemHasValue && this.options.multiSelect)) {
                elem = this.$element.clone();
                if(isBrowserIE9OrIE10){
                    elemId = this.$element.attr("id") + (++fileLabelsCount);
                    elem.attr("id", elemId);
                    elem.css({
                        'position' : 'absolute',
                        'top' : '-2000px',
                        'left': '-2000px'
                    });
                    elem.appendTo('body');
                    this.updateLabelForAttr(elemId);
                }
                elem.change($.proxy(this.handleChange, this));
                this.$fileDomElements.push(elem);
            }
            // Case: if it is not multiselect and if the first file dom element is null
            // this case would hit when we restore a single select file attachment and attach a new file
            if(!this.options.multiSelect && this.$fileDomElements[0] === null){
                //Splice null out of it, since we are attaching a new file
                this.$fileDomElements.splice(0, 1);
            }
            // if the browser is not IE9, then click it
            if(!isBrowserIE9OrIE10) {
                elem.click();
            }
            return true;
        },

        /**
         * In case of IE9, get the last element of fileDom and update the id for label
         *
         * @param fileInputId
         */
        updateLabelForAttr : function(fileInputId){
            this.$label.attr("for" , fileInputId);
        },

        createLabelForFileInput : function (fileInputId){
            if(isBrowserIE9OrIE10) {
                this.$label = $("<label></label>").addClass("guide-fu-attach-button button")
                        .text(this.options.buttonText)
                        .attr('for',fileInputId);
                this.$elementFileUploadBtn.replaceWith(this.$label);
                this.$label.parent().attr("tabindex", 0).attr("role", "button").attr("aria-label", this.options.screenReaderText || "");
            }
        },


        constructor: function () {
            // Initialize the self instance
            var _self = this,
                isFirst = true;
            //jquery instance of file upload button
            this.$elementFileUploadBtn = this.$parent.find(this.options.buttonClass);
            this.$elementFileUploadBtn.attr("aria-label", this.options.screenReaderText || "");
            if(isBrowserIE9OrIE10){
                this.elementId = this.$element.attr("id");
                this.createLabelForFileInput(this.$element.attr("id"));
            }

            // html for file list
            this.$elementFileList = $(this.fileItemList());
            // Initialize the value and file(Refer FileList class mdn)
            this.values = [];
            // List of dom elements of input type file
            this.$fileDomElements = [];
            this.$fileDomElements.push(this.$element);

            var flag = false,
                $currElem = null;

            $(document).mousedown(function(e) {
                $currElem = $(e.target);
            });
            // Enter key should result in click of button
            this.$elementFileUploadBtn
                .keypress(function(e) {
                    if (e.keyCode === 13 || e.charCode === 32) {
                        _self.$elementFileUploadBtn.click();
                    }
                })
                .focus(function(){
                    _self.$element.trigger("focus.fileupload");
                })
                .click($.proxy(this.cloneFileInputAndUpdateIdForIE9, this))
                .blur(function(event){
                    // Check if the currElem does not belong to the fileItemList
                    if(!flag && $currElem!= null && $currElem.closest(".guide-fu-fileItemList").length <=0){
                        _self.$element.trigger("focusout.fileupload");
                    }
                    flag = false;
                });
            //Initialize the filePreview Plugin
            this.$element[this.options.uploaderPluginName]({
                iframeContainer: this.options.iframeContainer,
                _filePath: this.options._filePath,
                _uuidGenerator: this.options._uuidGenerator,
                _getUrl: this.options._getUrl

            });
            // Getting input file value
            // listening on fileuploaded event
            this.$element.change($.proxy(this.handleChange, this))
                .on("adobeFileUploader.fileUploaded", $.proxy(this.previewFile, this));
        }
    };

    $.fn.adobeFileAttachment = function (option, value) {
        var get = '',
            element = this.each(function () {
                // in case of input type file
                if ($(this).attr('type') === 'file') {
                    var $this = $(this),
                        data = $this.data('adobeFileAttachment'),
                        options = $.extend({}, AdobeFileAttachment.prototype.defaults, typeof option === 'object' && option);

                    // Save the adobeFileAttachment data in jquery
                    if (!data) {
                        $this.data('adobeFileAttachment', (data = new AdobeFileAttachment(this, options)));
                        data.constructor();
                    }

                    // code to get and set an option
                    if (typeof option === 'string') {
                        get = data[option](value);
                    }
                }
            });

        if (typeof get !== 'undefined') {
            return get;
        } else {
            return element;
        }
    };

    // fileSizeLimit is in MB, default value is 2MB
    AdobeFileAttachment.prototype.defaults = {
        'buttonText': 'Attach',
        'multiSelect': false,
        'fileSizeLimit': 2,
        'uploaderPluginName': "adobeFileUploader"

    };

})($);
(function($) {
    var xfaUtil = xfalib.ut.XfaUtil.prototype;
    $.widget( "xfaWidget.fileUpload", $.xfaWidget.abstractWidget, {

        _widgetName:"fileUpload",
        _superPrototype : $.xfaWidget.abstractWidget.prototype,
        getOptionsMap: function(){
            var parentOptionsMap = this._superPrototype.getOptionsMap.apply(this,arguments),
                newMap = $.extend({},parentOptionsMap, $.extend({}, this.options, {
                    "value" : function(value) {
                        this.$userControl.adobeFileAttachment("value", value);
                    },
                    "fileList": function(value){
                        this.$userControl.adobeFileAttachment("fileList", value);
                    },
                    "comment" : function(value){
                        this.$userControl.adobeFileAttachment("comment", value);
                    },
                    // "access" can be either open or readonly
                    "access" : function(value){
                        this.$userControl.adobeFileAttachment("access", value);
                    }

                }));

            return newMap;

        },
        // TODO: Will need to remove this functions
        //  will be tracked by LC-391200

        _initializeOptions: function () {
            _.each(this.optionsHandler, function (value, key) {
                // overriding the behaviour of _initializeOptions
                // only for _uuidGenerator
                // as we font want getUUID to be called at render time
                if (typeof value === "function" && key !== '_uuidGenerator' ) {
                        value.apply(this, [this.options[key]])
                }
            }, this)
        },

        _getFileList: function(){
            return this.$userControl.adobeFileAttachment("fileList");
        },

        _getComment: function(){
            return this.$userControl.adobeFileAttachment("comment");
        },
        _getFileNamePathMap: function (pathList) {
            return this.$userControl.adobeFileAttachment("getSetFilePathAndReturnNamePathMap", pathList);
        },
        getEventMap: function() {
            var parentEventMap = this._superPrototype.getEventMap.apply(this, arguments),
                newMap = $.extend({}, parentEventMap,
                    {
                        "change" : null,
                        "focusout.fileupload" : xfaUtil.XFA_EXIT_EVENT,
                        "focus.fileupload" : xfaUtil.XFA_ENTER_EVENT,
                        "change.fileupload" : xfaUtil.XFA_CHANGE_EVENT
                    });
            return newMap;
        },
        render: function() {
            var $el = this._superPrototype.render.apply(this,arguments);
            $el.adobeFileAttachment(this.getOptionsMap());
            return $el;
        },
        showDisplayValue: function() {
             //since value can't be set in file element input, leaving this fn empty
        },
        showValue: function() {
            //since value can't be set in file element input, leaving this fn empty
        },
        getCommitValue: function() {
            this.options.fileList = this._getFileList();
            this.options.comment = this._getComment();
            return this.$userControl.adobeFileAttachment("value");
        }
    });
})($);

/**
 * Adobe FilePreview Widget Plugin
 *
 * Options expected by file preview is the url
 *
 * Options Required Are:
 *
 *  iframeName: Name of the Iframe
 *  iframeContainer: Container of the iframe(eg Body)
 *  fileUploadPath: Path where the file is to be uploaded
 *  fileUploadServlet: Servlet where the file is to be uploaded
 *
 */
(function ($) {
    // global iframe dom element
    var $iframe = null;
    // since there is only iframe for the preview of all file attachments
    // this map is added in the closure scope
    // map contains the url(key) vs fileDomElement(value)
    // it helps avoids the race condition
    var fileMap = {};

    var AdobeFileUploader = function (element, options) {
        this.options = options;
        this.$element = $(element);
    };

    AdobeFileUploader.prototype = {

        _fileIframeName: "guide-fu-iframe",

        _filePath: "/tmp/fd/mf",

        _iframeContainer: "body#formBody",


        fileIframe: function (name) {
            return $("<iframe></iframe>").attr({
                style: "display:none",
                name: name
            });
        },

        uploadFile: function (fileObject) {
            var multiple = false,
                fileName = null,
                actionUrl = null,
                fileUploadPath = fileObject.fileUploadPath,
                uuid;

            if (!fileUploadPath) {
                uuid = fileObject._uuidGenerator();
            }

            // if uuid exists only then upload the file in the current  instance
            if (_.isObject(fileObject) && (fileUploadPath || uuid)) {
                var fileDom = fileObject.fileDom,
                    $form = null;
                fileName = fileObject.fileName;
                multiple = fileObject.multiple;
                if(!fileUploadPath) {
                    fileUploadPath = this.options.fileUploadPath + "/" + uuid;
                }
                if (fileDom !== null) {
                    //prepend contextpath
                    actionUrl = fileObject._getUrl + fileUploadPath;
                    if (!multiple) {
                        if (!(fileUploadPath.lastIndexOf(fileObject._getUrl, 0) === 0)) {
                            this.fileUrl = fileObject._getUrl + fileUploadPath + "/" + fileName;
                        } else {
                            this.fileUrl = fileUploadPath + "/" + fileName;
                        }
                    } else {
                        this.fileUrl = actionUrl;
                    }
                    // done to solve issue LC-5835
                    // TODO: Rather than creating form again, create once and use it again to avoid memory leak
                    $form = $("<form method='post' enctype='multipart/form-data'/>")
                        .css({ 'position' : 'absolute',
                            'top' : '-1000px',
                            'bottom' : '-1000px',
                            'visibility' : 'hidden'
                        })
                        .attr({ action: actionUrl,
                            target: this.options.iframeName
                        })
                        .appendTo('body');
                    if (multiple) {
                        _.each(fileDom, function (fileDomElement, index) {
                            if(fileDomElement !== null)
                                $(fileDomElement[0]).attr('name', fileName[index]).appendTo($form);
                        }, this);
                    } else {
                        fileDom.attr('name', fileName).appendTo($form);
                    }
                    /* UseCase: Suppose the fileName is in other language, on click of fileName, it tries to upload the file
                     so that it could be preview, this change would ensure that the file is properly previewed supporting
                     the given UTF-8 charset */
                    $("<input type='hidden' name='_charset_' value='UTF-8'/>").appendTo($form);
                    if (!multiple) {
                        fileMap[this.fileUrl] = this.$element;
                        $iframe.on("load", ($.proxy(this.handleIframeLoad, this)));
                    } else {
                        $iframe.on("load", ($.proxy(this.handleIframeLoadMultiple, this)));
                    }
                    setTimeout(function(){
                        // Adding lag for submit to get executed properly to avoid race condition
                        // Done to solve Issue(LC-9306)
                        $form.submit();
                    }, 0);
                }
            }
            return this.fileUrl;
        },

        handleIframeLoadMultiple: function () {
            this.$element.trigger("adobeFileUploader.multipleFileUploaded");
            $iframe.off("load");
        },

        getFileUrl: function () {
            return this.fileUrl;
        },

        getUrlFromIframeContents: function () {
            //TODO :if the information from the server will change this section has to be changed too
            var selector = this.options.iframeContainer + " iframe[name='" + this.options.iframeName + "']",
                temp = $(selector).contents().find("#ChangeLog").text().split("br", 2)[1];
            temp = temp.substring(temp.indexOf("created") + 9, temp.indexOf(";<"));
            temp = temp.substring(0, temp.length - 2);
            var index = temp.indexOf("/jcr:content");
            if (index !== -1)
                temp = temp.substring(0, index);
            return temp;
        },

        handleIframeLoad: function () {
            // this logic is written to avoid race condition in between preview of files
            // for eg: if a user clicks on one preview button(request sent) and before the response comes, the user clicks on other button
            // then one window would open with undefined url and other with the required url
            // to avoid race condition, the url is taken from the content loaded in iframe and checked in the map to get the element associated with it
            var url = this.getUrlFromIframeContents();

            //prepend context path
            url = this.options._getUrl + url;
            if (url in fileMap) {
                fileMap[url].trigger("adobeFileUploader.fileUploaded");
                $iframe.off("load");
            }
        },

        initialize: function () {
            // Put iframe inside the iframe container
            // On the load of iframe, display the contents of file
            // since there is only one iframe for all the file attachments, there may be race condition
            if ($iframe == null) {
                $iframe = this.fileIframe(this.options.iframeName).appendTo(this.options.iframeContainer);
            }
        }
    };

    $.fn.adobeFileUploader = function (option, value) {
        var get = '',
            element = this.each(function () {
                // in case of input type file
                if ($(this).attr('type') === 'file') {
                    var $this = $(this),
                        data = $this.data('adobeFileUploader'),
                        options = $.extend({}, AdobeFileUploader.prototype.defaults(option, value), typeof option === 'object' && option);

                    // Save the adobeFileAttachment data in jquery
                    if (!data) {
                        $this.data('adobeFileUploader', (data = new AdobeFileUploader(this, options)));
                        data.initialize();
                    }

                    // code to get and set an option
                    if (typeof option === 'string') {
                        get = data[option](value);
                    }
                }
            });

        if (typeof get !== 'undefined') {
            return get;
        } else {
            return element;
        }
    };


    AdobeFileUploader.prototype.defaults = function (options,value)  {
        var propertyObject = {};
        if(typeof options == 'object') {
            propertyObject._fileIframeName = options.iframeContainer;
            propertyObject._filePath = options._filePath;
            propertyObject.actionUrl = options.actionUrl;
            propertyObject._getUrl = options._getUrl;
        }
        if(typeof  value == 'object') {
            propertyObject._fileIframeName = value._iframeContainer;
            propertyObject._filePath = value._filePath;
            propertyObject.actionUrl = value.actionUrl;
            propertyObject._getUrl = options._getUrl;
        }
        return {
            'fileUploadPath': propertyObject._filePath || AdobeFileUploader.prototype._filePath,
            'iframeName': AdobeFileUploader.prototype._fileIframeName,
            'fileUploadServlet': propertyObject._filePath || AdobeFileUploader.prototype._filePath,
            'iframeContainer': propertyObject._iframeContainer || AdobeFileUploader.prototype._iframeContainer,
            '_getUrl': propertyObject._getUrl || ""
        };
    };

})($);
