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


(function ($, _, guidelib) {
    var LayoutBase = guidelib.view.ad.layout.LayoutBase = function (options) {
        this.options = _.extend({}, this.options, options);
        this.initialize.apply(this, arguments);
    };

    _.extend(LayoutBase.prototype, {
        initialize : function () {
        }
    });

    _.extend(LayoutBase, {
        extend : function (props) {
            var child = inherits(this, props);
            child.extend = this.extend;
            return child;
        }
    });

    
    var ctor = function () {};

    
    
    
    function inherits(parent, protoProps, staticProps) {
        var child;
        var _super = parent.prototype;
        
        
        
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () { parent.apply(this, arguments); };
        }

        
        _.extend(child, parent);

        
        
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child._super = parent.prototype;
        child._superClass = parent;

        
        
        if (protoProps) { 
            
            for (var name in protoProps) {
                if (name == "_defaults") {
                    protoProps[name] = _.extend({}, _super[name], protoProps[name]);
                }
                child.prototype[name] = protoProps[name];
            }
        }

        
        if (staticProps) {
            _.extend(child, staticProps);
        }

        
        child.prototype.constructor = child;

        
        child.__super__ = parent.prototype;

        return child;
    };

}($, _, window.guidelib));

(function ($, _, guidelib) {
    var LayoutPlugin = guidelib.view.ad.layout.LayoutPlugin = guidelib.view.ad.layout.LayoutBase.extend({

        layoutName : "",

        initialize : function () {
            this.options = this.options || {};

            
            this.$element = this.options.$element;

            
            this.itemAndTitleArray = this.options.itemAndTitleArray;

            
            this.$container = this.getContainer(this.options.$container);
            this.$container.addClass(this.layoutName);

            
            this.containerId = this.options.containerId;

            this.itemClass = this.layoutName + 'Item';
            this.titleClass = this.layoutName + 'Title';
            this.itemTitleClass = this.layoutName + 'ItemTitle';

            this.$parentNavMenu = this.constructNavMenuContainer();

            this.addItemTitle();
        },

        
        done : function () {

        },

        
        getContainer : function ($optionsContainer) {
            return $optionsContainer;
        },

        
        constructNavMenuContainer : function () {
            var $parentContainer = this.$container.closest('[' + guidelib.util.GuideUtil.DATA_LAYOUT_ITEM_INDEX + ']'),
                parentContainerId,
                $parentListItem,
                itemNavId,
                itemNavContainerId,
                $parentNavMenu,
                $parentModule,
                parentModuleId,
                parentModuleNavContainerId,
                $parentModuleNavMenu;
            
            if ($parentContainer && $parentContainer.length > 0) {
                
                $parentModule = this.$container.parents('.guideAdModule').eq(0);
                if ($parentModule && $parentModule.length === 0) {
                    $parentModule = this.$container.parents('.guideAdModuleGroup').eq(0);
                }
                parentModuleId = $parentModule.data('guide-view-bind');
                parentModuleNavContainerId = parentModuleId + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX;
                $parentModuleNavMenu = $('[data-guide-id="' + parentModuleNavContainerId + '"]');
                parentContainerId = $parentContainer.attr(guidelib.util.GuideUtil.DATA_LAYOUT_ITEM_INDEX);
                itemNavContainerId = parentContainerId + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX;
                itemNavId = parentContainerId + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_SUFFIX;
                $parentNavMenu = $parentModuleNavMenu.find('[data-guide-id="' + itemNavContainerId + '"]');
                if (!($parentNavMenu && $parentNavMenu.length > 0)) {
                    $parentListItem = $parentModuleNavMenu.find('[data-guide-id="' + itemNavId + '"]');
                    $parentNavMenu = $('<ul/>').attr('data-guide-id', itemNavContainerId);
                    $parentNavMenu.addClass('tab-navigators tab-navigators-mobile');
                    $parentListItem.append($parentNavMenu);
                }
            } else { 
                $parentContainer = this.$container.closest('.guideAdModule');
                if ($parentContainer && $parentContainer.length === 0) {
                    $parentContainer = this.$container.closest('.guideAdModuleGroup');
                }
                parentContainerId = $parentContainer.data('guide-view-bind');
                itemNavContainerId = parentContainerId + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_CONTAINER_SUFFIX;
                $parentNavMenu = $('[data-guide-id="' + itemNavContainerId + '"]');
                $parentNavMenu.removeClass('hidden');
            }

            
            if (!($parentNavMenu && $parentNavMenu.length > 0)) {
                $parentNavMenu = undefined;
            }

            return $parentNavMenu;
        },

        
        constructItemTitle : function (itemAndTitle, index) {
            var $itemTitle = $('<' + this.layoutItemTitleType + '/>'),
                $title = itemAndTitle.title,
                $item = itemAndTitle.item,
                adIndex = 'ad-' + index,
                itemContentId = 'itemContent' + adIndex,
                itemTitleId = 'itemTitle' + adIndex;
            $item.addClass(this.itemClass);
            $itemTitle.attr('data-' + this.layoutName + '-id', adIndex);
            $itemTitle.addClass(this.itemTitleClass);
            $itemTitle.attr('tabindex', 0);
            if ($title && $title.length > 0) {
                $itemTitle.append($title.text());
                $title.addClass(this.titleClass);
            } else { 
                var itemHtml = $item.html().replace(/<br>|<p>|<\/p>|<div>|<\/div>/gi, ' ').replace(/ +/g, ' '),
                    itemText = $('<div/>').append(itemHtml).text(),
                    itemWordArray = itemText.split(' '),
                    itemTitleText = "";
                if (itemWordArray) {
                    if (itemWordArray.length > 4) {
                        itemTitleText = itemWordArray[0] + ' ' + itemWordArray[1] + ' ' + itemWordArray[2] + ' ' + itemWordArray[3];
                    } else {
                        itemTitleText = itemText;
                    }
                    $itemTitle.append(itemTitleText);
                }
            }
            $itemTitle.attr('title', $itemTitle.text());
            
            $item.attr('data-' + this.layoutName + '-content-id', adIndex);
            $item.attr(guidelib.util.GuideUtil.DATA_LAYOUT_ITEM_INDEX, this.containerId + adIndex);

            
            $item.attr('id', itemContentId);
            $itemTitle.attr('id', itemTitleId);
            $itemTitle.attr('role', 'tab').attr('aria-controls', itemContentId);
            $item.attr('role', 'tabpanel').attr('aria-labeledby', itemTitleId);

            itemAndTitle.item = $item;

            this.updateNavMenuForItem($item, $itemTitle, adIndex);
            return $itemTitle;
        },

        
        updateNavMenuForItem : function ($item, $itemTitle, adIndex) {
            if (this.$parentNavMenu) {
                var menuListItem = $('<li/>'),
                    menuListItemAnchor = $('<a/>'),
                    titleText = $itemTitle.text(),
                    navId = this.containerId + adIndex,
                    parentListItem,
                    prefixPath = '';
                menuListItem.attr('data-guide-id', navId + guidelib.util.GuideUtil.GUIDE_ITEM_NAV_SUFFIX);
                menuListItem.attr('title', titleText);
                parentListItem = this.$parentNavMenu.parents('li');
                if (parentListItem && parentListItem.length > 0) {
                    var closeseListItemPath = $(parentListItem[0]).data('path');
                    if (closeseListItemPath) {
                        prefixPath = closeseListItemPath;
                    }
                }
                menuListItem.attr('data-path', prefixPath + '/' + navId);
                menuListItemAnchor.attr('data-toggle', 'collapse');
                menuListItemAnchor.attr('data-target', '#guide-mobile-navigator');
                menuListItemAnchor.append(titleText);
                menuListItemAnchor.on('click', function () {
                    
                    menuListItem.siblings().removeClass('active');
                    
                    menuListItem.addClass('active');
                    $itemTitle.click();
                    $('body').animate({
                        scrollTop : $item.offset().top
                    }, 500);
                    $item.focus();
                });
                menuListItem.append(menuListItemAnchor);
                this.$parentNavMenu.append(menuListItem);
            }
        },

        
        constructItemTitleForOneActive : function (itemAndTitle, itemIndex) {
            var $itemTitle = this.constructItemTitle(itemAndTitle, itemIndex);
            if (itemIndex === 0) {
                this.makeItemTitleActive(itemAndTitle.item, $itemTitle);
            } else {
                this.unmarkItemTitleForOneActive(itemAndTitle.item, $itemTitle);
            }
            if (this.handleItemTitleClick) {
                $itemTitle.on('click', {layoutPlugin : this}, this.handleItemTitleClick);
                $itemTitle.keydown(this.handleItemTitleKeyDown);
            }
            return $itemTitle;
        },

        
        handleItemTitleKeyDown : function (event) {
            switch (event.keyCode) {
                case 32: 
                    $(this).trigger("click");
                    break;
            }
        },

        
        constructItemTitleContainer : function () {
            var $itemTitleContainer = $('<' + this.layoutItemTitleContainerType + '/>');
            $itemTitleContainer.addClass(this.layoutName + 'ItemTitleContainer').attr('data-' + this.layoutName + '-id', this.containerId);
            return $itemTitleContainer;
        },

        
        makeItemTitleActive : function ($item, $itemTitle) {
            $item.addClass('active').removeClass('hidden');
            $item.attr('aria-hidden', 'false');
            $itemTitle.addClass('active');
        },

        
        unmarkItemTitleActive : function ($item, $itemTitle) {
            $item.removeClass('active');
            $itemTitle.removeClass('active');
        },

        unmarkItemTitleForOneActive : function ($item, $itemTitle) {
            $item.addClass('hidden');
            $item.attr('aria-hidden', 'true');
            this.unmarkItemTitleActive($item, $itemTitle);
        }
    });
}($, _, window.guidelib));



(function ($, _, guidelib) {
    var AnchorLayoutPlugin = guidelib.view.ad.layout.AnchorLayoutPlugin = guidelib.view.ad.layout.LayoutPlugin.extend({
        layoutName : "adAnchor",
        layoutItemTitleType : "a",
        layoutItemTitleContainerType : "ul",

        initialize : function (options) {
            
            this.mergeWithParent = this.options.mergeWithParent || true;
            AnchorLayoutPlugin._super.initialize.call(this, options);
        },

        addItemTitle : function () {
            var $itemTitleContainer = this.constructItemTitleContainer(),
                titleClassSelector = '.' + this.titleClass,
                dataUidAttr = 'data-' + this.layoutName + '-uid';
            
            this.$container.attr('data-' + this.layoutName + '-content-id', 'ad-' + this.containerId);

            _.each(this.itemAndTitleArray, function (itemAndTitle, itemIndex) {
                var $item = itemAndTitle.item,
                    $itemTitle = this.constructItemTitle(itemAndTitle, itemIndex),
                    itemUid =  this.containerId + 'data-' + itemIndex + '-val-' + $itemTitle.html(),
                    $itemAnchor,
                    $title;
                $item.attr(dataUidAttr, itemUid);
                $itemTitle.attr('href', '#' + itemUid);
                $itemTitle.wrap('<li/>');
                if (this.$titles) {
                    $title = $(this.$titles[itemIndex]);
                } else {
                    $title = $item.find(titleClassSelector);
                }
                $itemAnchor = $('<a/>').attr('name', itemUid);
                if ($title && $title.length > 0) {
                    $title.before($itemAnchor);
                } else {
                    $item.prepend($itemAnchor);
                }
                $itemTitleContainer.append($itemTitle.parent());
            }, this);

            if (this.mergeWithParent) {
                var $parentAnchorItem = this.$container.closest('[' + dataUidAttr + ']'),
                    $anchorList,
                    uidCondition,
                    $parentAnchor;
                if ($parentAnchorItem && $parentAnchorItem.length > 0) {
                    $anchorList = this.$element.siblings('.' + this.layoutName + 'ItemTitleContainer');
                    uidCondition = '[href="#' + $parentAnchorItem.attr(dataUidAttr) + '"]';
                    $parentAnchor = $anchorList.find(uidCondition);
                    if ($parentAnchor && $parentAnchor.length > 0) {
                        $parentAnchor.parent().append($itemTitleContainer);
                    }
                } else {
                    
                    this.$element.before($itemTitleContainer);
                }
            } else {
                this.$container.before($itemTitleContainer);
            }
        }
    });
}($, _, window.guidelib));


(function ($, _, guidelib) {
    var CardLayoutPlugin = guidelib.view.ad.layout.CardLayoutPlugin = guidelib.view.ad.layout.LayoutPlugin.extend({
        layoutName : "adCard",
        layoutItemTitleType : "div",
        layoutColumns : 2,

        initialize : function (options) {
            
            if (this.options.layoutColumns && this.options.layoutColumns !== null) {
                this.layoutColumns = parseInt(this.options.layoutColumns);
            }
            CardLayoutPlugin._super.initialize.call(this, options);
        },

        addItemTitle : function () {
            _.each(this.itemAndTitleArray, function (itemAndTitle, itemIndex) {
                var $itemTitle = this.constructItemTitle(itemAndTitle, itemIndex);
                itemAndTitle.item.prepend($itemTitle);
            }, this);
        },

        expandCard : function (event) {
            var context = event.data.context,
                $this = $(this),
                $cardItem = $this.closest('.' + context.itemClass);
            $this.toggleClass('adCardCollapse');
            $cardItem.toggleClass('adCardFull');
        },

        getExpandCard : function () {
            var $expand = $('<div/>').addClass('adCardExpand').on('click', {context : this}, this.expandCard),
                $expandShade = $('<div/>').addClass('adCardShade'),
                $expandIcon = $('<div/>').addClass('adCardIcon');
            $expand.append($expandShade, $expandIcon);
            return $expand;
        },

        done : function () {
            var parentCard = this.$container.parents('.' + this.layoutName);
            
            if (!(parentCard && parentCard.length > 0)) {
                var $expand = this.getExpandCard(),
                    $cardContainer = this.itemAndTitleArray[0].item.closest('.' + this.layoutName);
                
                $cardContainer.find('.' + this.itemClass).append($expand);

                if (this.layoutColumns > 1) {
                    var $cardDesktopContainer = $('<div/>').addClass('adCardDesktop').attr('data-adCardCol', this.layoutColumns),
                        divColArray = [],
                        itemList;

                    for (var i = 0; i < this.layoutColumns; i++) {
                        var $divCol = $('<div/>').attr('data-adCardColNum', i);
                        divColArray.push($divCol);
                    }

                    itemList = $cardContainer.children('.' + this.itemClass);
                    _.each(itemList, function (item, itemIndex) {
                        var $item = $(item),
                            colIndex = itemIndex % this.layoutColumns;
                        divColArray[colIndex].append($item.clone(true));
                        $item.addClass('adCardMobile');
                    }, this);

                    for (i = 0; i < this.layoutColumns; i++) {
                        $cardDesktopContainer.append(divColArray[i]);
                    }

                    $cardContainer.append($cardDesktopContainer);
                }
            }
        }
    });
}($, _, window.guidelib));


(function ($, _, guidelib) {
    var AccordionLayoutPlugin = guidelib.view.ad.layout.AccordionLayoutPlugin = guidelib.view.ad.layout.LayoutPlugin.extend({
        layoutName : "adAccordion",
        layoutItemTitleType : "div",

        addItemTitle : function () {
            _.each(this.itemAndTitleArray, function (itemAndTitle, itemIndex) {
                var $item = itemAndTitle.item,
                    $itemTitle;
                
                if ($item.is('li')) {
                    $item.wrapInner('<div />');
                    $item = $item.children('div');
                    itemAndTitle.item = $item;
                }
                $itemTitle = this.constructItemTitleForOneActive(itemAndTitle, itemIndex);
                $item.before($itemTitle);
            }, this);
        },

        handleItemTitleClick : function (event) {
            var $itemTitle = $(this),
                layoutPlugin = event.data.layoutPlugin,
                dataAttrtName = 'data-' + layoutPlugin.layoutName.toLowerCase() + '-content-id',
                dataAttrValue = $itemTitle.data(layoutPlugin.layoutName.toLowerCase() + '-id'),
                $itemContainer = $itemTitle.parent(),
                $item = $itemContainer.children('[' + dataAttrtName + '="' + dataAttrValue + '"]'),
                $prevActiveItemTitle,
                $prevActiveItem;
            if (!$itemTitle.hasClass('active')) {
                if ($itemContainer.is("li")) {
                    $itemContainer = $itemContainer.parent().children(); 
                }
                $prevActiveItem = $itemContainer.children('.active[' + dataAttrtName + ']'); 
                $prevActiveItemTitle = $itemContainer.children('.active'); 
                layoutPlugin.unmarkItemTitleForOneActive($prevActiveItem, $prevActiveItemTitle);
                layoutPlugin.makeItemTitleActive($item, $itemTitle);
            } else {
                $itemTitle.removeClass('active');
                $item.toggleClass('hidden');
            }
        }
    });
}($, _, window.guidelib));


(function ($, _, guidelib) {
    var TabLayoutPlugin = guidelib.view.ad.layout.TabLayoutPlugin = guidelib.view.ad.layout.LayoutPlugin.extend({
        layoutName : "adTabbed",
        layoutItemTitleType : "li",
        layoutItemTitleContainerType : "ul",

        addItemTitle : function () {
            var $itemTitleContainer = this.constructItemTitleContainer(),
                $itemTitleScrollerDiv = $('<div/>'),
                $leftScroll = $('<div/>').addClass('adTabScroller adTabLeft').attr('data-guide-nav-scroll', 'left'),
                $rightScroll = $('<div/>').addClass('adTabScroller adTabRight').attr('data-guide-nav-scroll', 'right');
            
            this.$container.attr('data-' + this.layoutName + '-content-id', 'ad-' + this.containerId);

            _.each(this.itemAndTitleArray, function (itemAndTitle, itemIndex) {
                var $itemTitle = this.constructItemTitleForOneActive(itemAndTitle, itemIndex);
                $itemTitleContainer.append($itemTitle);
            }, this);
            $itemTitleScrollerDiv.append($leftScroll).append($itemTitleContainer).append($rightScroll);
            this.$container.before($itemTitleScrollerDiv);
        },

        
        getContainer : function ($optionsContainer) {
            if (!$optionsContainer.is('ul') && !$optionsContainer.is('ol') && this.itemAndTitleArray && this.itemAndTitleArray.length > 0) {
                var firstItem = this.itemAndTitleArray[0].item[0],
                    $itemParent = $(firstItem).parent(),
                    allChildren = $itemParent.children(),
                    filteredList = [],
                    addToFilterList = false;
                _.each(allChildren, function (containerChild) {
                    if (firstItem == containerChild) {
                        addToFilterList = true;
                    }
                    if (addToFilterList) {
                        filteredList.push(containerChild);
                    }
                });
                return $(filteredList).wrapAll('<div />').parent();
            }
            return $optionsContainer;
        },

        handleItemTitleClick : function (event) {
            var $itemTitle = $(this);
            if (!$itemTitle.hasClass('active')) {
                var layoutPlugin = event.data.layoutPlugin,
                    dataAttrtName = 'data-' + layoutPlugin.layoutName.toLowerCase() + '-content-id',
                    dataAttrValueItem = $itemTitle.data(layoutPlugin.layoutName.toLowerCase() + '-id'),
                    $itemTitleContainer = $itemTitle.parent(layoutPlugin.layoutItemTitleContainerType),
                    dataAttrValueItemContainer = $itemTitleContainer.data(layoutPlugin.layoutName.toLowerCase() + '-id'),
                    $itemContainer = $itemTitleContainer.parent().siblings('[' + dataAttrtName + '="ad-' + dataAttrValueItemContainer + '"]'),
                    $item = $itemContainer.children('[' + dataAttrtName + '="' + dataAttrValueItem + '"]'),
                    list,
                    scrollPos,
                    navPos,
                    scrollDirection,
                    scrollStep;
                layoutPlugin.unmarkItemTitleForOneActive($itemContainer.children('.active'), $itemTitleContainer.children('.active'));
                layoutPlugin.makeItemTitleActive($item, $itemTitle);
                list = $itemTitleContainer.eq(0);
                if (_.isUndefined(list.data("guideNavScrollPos"))) {
                    list.data("guideNavScrollPos", 0);
                }
                scrollPos = list.data("guideNavScrollPos");
                
                navPos = parseInt($itemTitle.data('adtabbedId').substr(3));
                if (navPos > scrollPos) {
                    scrollDirection = "right";
                } else {
                    scrollDirection = "left";
                }
                scrollStep = Math.abs(navPos - scrollPos);
                guidelib.util.GuideUtil.navScroll(list, scrollDirection, scrollStep, '.adTabbedItemTitle');
                guidelib.util.GuideUtil.showHideNavScroll();
            }
        },

        done : function () {
            var parentCard = this.$container.parents('.' + this.layoutName);
            
            if (!(parentCard && parentCard.length > 0)) {
                guidelib.util.GuideUtil.showHideNavScroll();
            }
        }
    });
}($, _, window.guidelib));


(function ($, _, guidelib) {
    var LayoutStrategy = guidelib.view.ad.layout.LayoutStrategy = guidelib.view.ad.layout.LayoutBase.extend({

        layoutStrategy : "",

        initialize : function (options) {
            this.options = this.options || {};

            
            this.$element = this.options.$element;

            
            this.layoutConfigs = this.getStrategyLayoutConfigs(this.options.layoutConfigs || []);

            this.layoutInstances = [];
        },

        getStrategyLayoutConfigs : function (layoutConfigArray) {
            var strategyLayoutConfigs = [];
            _.each(layoutConfigArray, function (layoutConfig) {
                if (layoutConfig.layoutStrategy === this.layoutStrategy) {
                    strategyLayoutConfigs.push(layoutConfig);
                }
            }, this);
            return strategyLayoutConfigs;
        },

        applyLayoutConfig : function (layoutConfig, itemAndTitleArray, $container, containerId) {
            if (layoutConfig && layoutConfig.layoutName) {
                var layoutPlugin = eval(layoutConfig.layoutName),
                    layoutInstance;
                if (layoutPlugin) {
                    layoutInstance = new layoutPlugin({
                                        $element : this.$element,
                                        itemAndTitleArray : itemAndTitleArray,
                                        $container : $container,
                                        containerId : containerId,
                                        layoutColumns : layoutConfig.layoutColumns
                                    });
                    this.layoutInstances.push(layoutInstance);
                }
            }
        },

        done : function () {
            _.each(this.layoutInstances, function (layoutInstance, instanceIndex) {
                layoutInstance.done();
                this.layoutInstances[instanceIndex] = null;
            }, this);
        }
    });
}($, _, window.guidelib));

(function ($, _, guidelib) {
    var DelimiterLayoutStrategy = guidelib.view.ad.layout.DelimiterLayoutStrategy = guidelib.view.ad.layout.LayoutStrategy.extend({

        layoutStrategy : "adDelimiterStrategy",
        
        standardDelimiters : ["h1", "h2", "h3", "h4", "h5", "h6"],

        standardLevels : ["first", "second", "third"],

        initialize : function (options) {

            DelimiterLayoutStrategy._super.initialize.call(this, options);

            
            this.delimiterSelectors = this.extractConfigDelimiters();

            if (this.layoutConfigs && this.layoutConfigs.length > 0) {
                this.applyLayouts(0, this.$element, 0);
            }
        },

        extractConfigDelimiters : function () {
            var prependStandardDelimiters = false,
                delimiters = [];
            _.each(this.layoutConfigs, function (layoutConfig) {
                var delimiter = layoutConfig.itemDelimiter;
                if ((this.standardLevels.indexOf(layoutConfig.layoutType) > -1 && !delimiter)
                    || this.standardDelimiters.indexOf(delimiter) > -1) {
                    prependStandardDelimiters = true;
                } else if (delimiter) {
                    
                    delimiters.push(delimiter);
                }
            }, this);
            if (prependStandardDelimiters) {
                delimiters = [].concat(this.standardDelimiters).concat(delimiters);
            }
            return delimiters;
        },

        getDelimiterLayoutConfig : function (delimiter, delimiterEncounter) {
            var delimiterLayoutConfig;
            _.each(this.layoutConfigs, function (layoutConfig) {
                _.each(this.standardLevels, function (standardLevel, index) {
                    if ((!layoutConfig.itemDelimiter && layoutConfig.layoutType === standardLevel && delimiterEncounter === index)
                            || (layoutConfig.itemDelimiter && layoutConfig.itemDelimiter === delimiter)) {
                        delimiterLayoutConfig = layoutConfig;
                    }
                }, this);
            }, this);
            return delimiterLayoutConfig;
        },

        
        applyLayouts : function (delimiterIndex, $element, delimiterEncounter) {
            var delimiter,
                itemAndTitleArray = [],
                $itemDelimiters,
                $items = [],
                $container = $element,
                layoutConfig,
                containerId;
            
            if (delimiterIndex >= this.delimiterSelectors.length) {
                return;
            }
            delimiter = this.delimiterSelectors[delimiterIndex];
            $itemDelimiters = $element.find(delimiter);
            
            if ($itemDelimiters && $itemDelimiters.length === 0) {
                return this.applyLayouts(delimiterIndex + 1, $element, delimiterEncounter);
            }

            layoutConfig = this.getDelimiterLayoutConfig(delimiter, delimiterEncounter);

            
            $itemDelimiters.each(function (index, itemDelimiter) {
                var $itemDelimiter = $(itemDelimiter),
                    $itemElements = $itemDelimiter.nextUntil(delimiter),
                    $item,
                    $title = $itemDelimiter;
                
                $itemElements.splice(0, 0, itemDelimiter);
                $itemElements.wrapAll('<div />');
                $item = $itemElements.parent();
                $items.push($item);
                if (layoutConfig && layoutConfig.titleSelector) {
                    var $titles = $item.find(layoutConfig.titleSelector);
                    if ($titles && $titles.length > 0) {
                        $title = $($titles[0]);
                    }
                }
                itemAndTitleArray.push({item : $item, title : $title});
            });

            if (layoutConfig) {
                containerId = layoutConfig.layoutType + '-' + delimiter;
                this.applyLayoutConfig(layoutConfig, itemAndTitleArray, $container, containerId);
            }

            _.each($items, function ($item) {
                this.applyLayouts(delimiterIndex + 1, $item, delimiterEncounter + 1);
            }, this);
        }
    });
}($, _, window.guidelib));

(function ($, _, guidelib) {
    var ContainerLayoutStrategy = guidelib.view.ad.layout.ContainerLayoutStrategy = guidelib.view.ad.layout.LayoutStrategy.extend({

        layoutStrategy : "adContainerStrategy",

        initialize : function (options) {
            ContainerLayoutStrategy._super.initialize.call(this, options);
            _.each(this.layoutConfigs, this.applyLayouts, this);
        },

        applyLayouts : function (layoutConfig, layoutConfigIndex) {
            var containerSelector,
                containerSelectorLevel,
                titleSelectors,
                itemSelector,
                containerArray;

            
            containerSelector = layoutConfig.containerSelector || 'ol,ul';

            
            containerSelectorLevel = (layoutConfig.containerSelectorLevel ? parseInt(layoutConfig.containerSelectorLevel) : layoutConfig.containerSelectorLevel) || 0;

            
            titleSelectors = this.getTitleSelectors(layoutConfig.titleSelector);

            
            itemSelector = layoutConfig.itemSelector || 'li';

            
            containerArray = this.getContainers(containerSelector, containerSelectorLevel);

            _.each(containerArray, function ($container, containerIndex) {
                var $items = $container.children(itemSelector),
                    itemAndTitleArray = [],
                    containerId;
                _.each($items, function (item, itemIndex) {
                    var $item = $(item),
                        $title = this.getTitle($(item), titleSelectors);
                    itemAndTitleArray.push({item : $item, title : $title});
                }, this);
                containerId = layoutConfigIndex + '-' + containerIndex;
                this.applyLayoutConfig(layoutConfig, itemAndTitleArray, $container, containerId);
            }, this);
        },

        
        getTitleSelectors : function (titleSelector) {
            var titleSelectors = [];
            if (titleSelector) {
                titleSelectors.push(titleSelector);
            }
            titleSelectors.push('h1');
            titleSelectors.push('h2');
            titleSelectors.push('h3');
            titleSelectors.push('h4');
            titleSelectors.push('h5');
            titleSelectors.push('h6');
            return titleSelectors;
        },

        
        getTitle : function ($item, titleSelectors) {
            var $candidateTitles = [],
                $title;
            for (var i = 0; i < titleSelectors.length; i++) {
                $candidateTitles = $item.find(titleSelectors[i]);
                if ($candidateTitles.length > 0) {
                    $title = $($candidateTitles[0]);
                    break;
                }
            }
            return $title;
        },

        
        getContainers : function (containerSelector, containerSelectorLevel) {
            var $itemContainers = this.$element.find(containerSelector),
                containerArray = [];
            
            $itemContainers.each(function (itemIndex, itemContainer) {
                var $itemContainer = $(itemContainer),
                    $itemContainerParents = $itemContainer.parents(containerSelector);
                
                if (containerSelectorLevel < 0 || ($itemContainerParents.length === containerSelectorLevel)) {
                    containerArray.push($itemContainer);
                }
            });
            return containerArray;
        }
    });
}($, _, window.guidelib));
