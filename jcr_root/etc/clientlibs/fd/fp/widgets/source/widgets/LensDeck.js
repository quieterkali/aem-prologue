/*
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2012-2013 Adobe Systems Incorporated
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
 *
 */
/**
 * The <code>CQ.formsearch.LensDeck</code> class provides a deck panel for lenses.
 * @class CQ.formsearch.LensDeck
 * @extends CQ.formsearch.LensContainer
 */
CQ.formsearch.LensDeck = CQ.Ext.extend(CQ.formsearch.LensContainer, {

    /**
     * @private
     */
    lastData: null,

    /**
     * @cfg {Mixed} renderButtonsTo
     * The default {@link CQ.Ext.Component#renderTo renderTo} property for the deck buttons.
     * If undefined the buttons are rendered to same element as the deck.
     */
    renderButtonsTo: null,

    /**
     * @cfg {Boolean} activateFirstLens
     * If true the first added lens will be activated.
     */

    /**
     * @private
     */
    lenses: [],

    /**
     * Creates a new <code>CQ.formsearch.LensDeck</code> instance.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {

        config = CQ.Util.applyDefaults(config, {
            "renderButtonsTo": config.renderTo,
            "border": false,
            "activateFirstLens": true
        });

        CQ.formsearch.LensDeck.superclass.constructor.call(this, config);
    },

    initComponent : function(){
        CQ.formsearch.LensDeck.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event switch
             * Fires when the active lens changes
             * @param {CQ.formsearch.LensDeck} this
             * @param {CQ.formsearch.Lens} oldLens the previously active lens (could be null)
             * @param {CQ.formsearch.Lens} newLens the newly active lens (could be null)
             */
            'switch'
        );
    },

    getCurrentLens: function() {
        return this.activeItem;
    },

    loadData: function(data) {
        data = data.slice(1, data.length);
        this.lastData = data;
        this.activeItem.loadData(data);
        this.doLayout();
        this.activeItem.doLayout();
    },

    getSelection: function() {
        return this.activeItem.getSelection();
    },

    // managing lenses

    /**
     * Adds a new {@link CQ.formsearch.Lens} to this deck. A button to activate
     * the lens will be added to the button bar of the deck.
     * @param {CQ.formsearch.Lens} widget The lens to add
     * @param {String} name The name of the lens. Will also be used for the
     *        {@link CQ.Ext.Button#iconCls iconCls} of the button.
     * @param {Object} buttonConfig The config object of the button
     */
    add: function(widget, name, buttonConfig) {
        try {
            var deck = this;
            buttonConfig = CQ.Util.applyDefaults(buttonConfig, {
                "toggleGroup": "cq-lensdeck", //todo: id
                "enableToggle": true,
                "allowDepress": false,
                "iconCls": name ? name : "",
                "renderTo": widget.renderButtonTo ? widget.renderButtonTo : this.renderButtonsTo,
                "text": widget.buttonText ? widget.buttonText : "",
                "tabTip": widget.text ? widget.text : "",
                "pressed": this.lenses.length == 0, //first lens
                "listeners": {
                    "click": function() {
                        deck.setActiveItem(widget.id);
                        if (deck.lastData && deck.activeItem.loadLastData) {
                            deck.activeItem.loadData(deck.lastData);
                        }
                    }
                }
            });
            var b = new CQ.Ext.Button(buttonConfig);
            widget.lensName = name;
            widget.button = b;
            // default value
            if (typeof widget.loadLastData === "undefined") {
                widget.loadLastData = true;
            }
            CQ.formsearch.LensDeck.superclass.add.call(this, widget);
            this.lenses.push(widget);
        }
        catch (e) {
            //console.log(e.message);
        }

        if (this.activateFirstLens && this.lenses.length == 1) {
            this.setActiveItem(widget.id);
        }
    },

    /**
     * Activates the lens of the given ID. Fires the 'switch' event.
     * @param {String} id The id of the lens to activate
     * @return {Object} The activated lens
     */
    setActiveItem: function(id) {
        var oldLens = this.activeItem;

        for (var i = 0; i < this.lenses.length; i++) {
            if (this.lenses[i].id == id) {
                this.activeItem = this.lenses[i];
                this.activeItem.show();
            }
            else {
                this.lenses[i].hide();
            }
        }

        this.fireSwitch(oldLens, this.activeItem);
        return this.activeItem;
    },

    /**
     * Activates the lens of the given name as set in {@link #add}. Fires the 'switch' event.
     * @param {String} name The name of the lens to activate
     * @return {CQ.formsearch} The activated lens
     */
    setActiveLens: function(name) {
        var oldLens = this.activeItem;

        for (var i = 0; i < this.lenses.length; i++) {
            if (this.lenses[i].lensName == name) {
                // unselect the button for the previously active lens
                if (this.activeItem) {
                    this.activeItem.button.toggle(false);
                }
                this.activeItem = this.lenses[i];
                // select the button for the now active lens
                this.activeItem.button.toggle(true);
                this.activeItem.show();
            }
            else {
                this.lenses[i].hide();
            }
        }

        this.fireSwitch(oldLens, this.activeItem);
        return this.activeItem;
    },

    // private stuff

    /**
     * @private
     */
    fireSwitch: function(oldLens, newLens) {
        this.fireEvent('switch', this, oldLens, newLens);
    }


});

CQ.Ext.reg("formsearchlensdeck", CQ.formsearch.LensDeck);
