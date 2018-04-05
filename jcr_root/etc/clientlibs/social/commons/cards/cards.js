/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
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
 */
(function($) {
    window.SCFCards = function(container, options) {
        this.container = $(container);
        var opts = options || {};
        this.cardMargin = opts.cardMargin || 10;
        this.containerPadding = opts.containerPadding || 0;
        this.cardWidth = opts.cardWidth || 154;
        var that = this;
        $(window).resize(function() {
            that.redraw(true);
        });
        this.redraw(false);
    };
    SCFCards.prototype.redraw = function(animate) {
        this.containerWidth = this.container.outerWidth(true);
        this.cards = this.container.find(".scf-card");
        this.columns = Math.floor((this.containerWidth - (2 * this.containerPadding)) / (this.cardWidth +
            (this.cardMargin * 2)));
        this.occupiedWidth = Math.ceil(this.columns * (this.cardWidth + (this.cardMargin * 2)));
        this.newSidePadding = Math.floor((this.containerWidth - this.occupiedWidth) / 2);
        this.container.css({
            "padding-left": this.newSidePadding,
            "padding-right": this.newSidePadding,
            "position": "relative"
        });
        var that = this;
        var columnHeights = [];
        for (var i = 0; i < this.columns; i++) {
            columnHeights[i] = that.newSidePadding;
        }
        var greatestHeight = 0;
        var minHeight = that.newSidePadding;
        this.cards.each(function(cardCount, card) {
            var $card = $(card);
            var top = that.newSidePadding;
            var columnToStack = 0;
            for (var i = 0; i < that.columns; i++) {
                if (columnHeights[i] <= minHeight) {
                    minHeight = columnHeights[i];
                    columnToStack = i;
                    if (cardCount <= that.columns && i >= cardCount) {
                        break;
                    }
                }
            }

            top = columnHeights[columnToStack];
            var left = (columnToStack) * (that.cardWidth + (that.cardMargin * 2)) + that.newSidePadding;

            if (animate) {
                $card.animate({
                    "position": "absolute",
                    "left": left,
                    "top": top
                }, 500);
            } else {
                $card.css({
                    "position": "absolute",
                    "left": left,
                    "top": top
                });
            }

            columnHeights[columnToStack] += $card.outerHeight(true);
            if (columnHeights[columnToStack] > greatestHeight) {
                greatestHeight = columnHeights[columnToStack];
            }
            minHeight = columnHeights[columnToStack];
        });
        this.container.css({
            "display": "block",
            "height": greatestHeight + this.newSidePadding
        });
    };
})($CQ);
