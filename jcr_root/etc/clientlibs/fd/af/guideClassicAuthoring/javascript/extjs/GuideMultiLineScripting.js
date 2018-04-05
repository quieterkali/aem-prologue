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

CQ.wcm.GuideMultiLineScripting = CQ.Ext.extend(CQ.Ext.Panel, {

    /**
     * @private
     * @type CQ.Ext.form.TextArea
     */
    displayText : null,

    /**
     * @private
     * @type CQ.Ext.form.TextArea
     */
    editField : null,

    /**
     * @private
     * @type CQ.Ext.Button
     */
    onCompletionButton : null,

    /**
       * @private
       * @type CQ.Ext.Button
     */
    editButton : null,
    clearButton : null,

    constructor : function (config) {
            config = config || {};
            var configDefaults = {
                layout : 'form',
                border : true,
                bodyBorder : false
            };
            CQ.Util.applyDefaults(config, configDefaults);
            CQ.wcm.GuideMultiLineScripting.superclass.constructor.call(this, config);
            this.show();
        },

    initComponent : function () {
        CQ.wcm.GuideMultiLineScripting.superclass.initComponent.call(this);

        // The multiline text area has to be shown on focus of the displayText. Since on switching
        // between panels focus shifts to the first editable field of the panel, this dummy field
        // was essential to prevent the multiline text area from showing up.
        this.dummyTextArea = new CQ.Ext.form.TextArea({
             style : {
                 height : "0px",
                 width : "0px",
                 position : "absolute",
                 display : "none"
             }
         });
        this.add(this.dummyTextArea);

        this.displayText = new CQ.Ext.form.TextArea({
            name : this.name,
            fieldDescription : this.fieldDescription,
            fieldLabel : this.text,
            autoscroll : "false",
            readOnly : "true",
            style : {
                height : "18px",
                paddingTop : "0px",
                paddingRight : "6px",
                paddingBottom : "0px",
                width : "93%",
                overflow : "hidden"
            },
            listeners : {
                loadcontent : this.handleKeyPressAndClickEvents
            }
        });
        this.add(this.displayText);

        this.editButton = new CQ.Ext.Button({
            iconCls : "guides-action-edit guides-common-actions",
            template : new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
            buttonAlign : "right",
            listeners : {
                click : {
                    scope : this,
                    fn : this.showMultiLineTextArea
                }
            },
            style : {
                  position : "absolute",
                  right : "0px",
                  top : "15px"
              }
        });
        this.add(this.editButton);

        /**
         *text area where actual editing would occur
         */
        this.editField = new CQ.Ext.form.TextArea({
            name : "",
            autoscroll : "true",
            hidden : true,
            fieldLabel : this.text,
            fieldDescription : this.fieldDescription,
            style : {
                paddingRight : '6px',
                width : "94%",
                height : "100px",
                resize : "vertical",
                whiteSpace : "nowrap"
            },
            listeners : {
                loadcontent : function () {
                    /**
                     *initially when dialog is rendered it should always show the display text area not the edit field
                     *@listener for loading of multi-field
                    */
                    var panel = this.findParentByType('panel');
                    this.hide();
                    panel.displayText.show();
                    panel.editButton.show();
                    panel.onCompletionButton.hide();
                    panel.clearButton.hide();
                }
            }
        });
        this.add(this.editField);

        this.onCompletionButton = new CQ.Ext.Button({
            iconCls : "guides-action-accept guides-common-actions",
            template : new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
            hidden : true,
            style : {
                  position : "absolute",
                  right : "0px",
                  top : "12px"
              },
            listeners : {
                  click : {
                      scope : this,
                      fn : this.updateDisplayTextAndHideMultiLineTextArea
                  }
              }
        });
        this.add(this.onCompletionButton);

    },

    /**
     *to handle the enter and space keypress events (keyboard)
     * and mouse click. Haven't used focus since on tabbing the multi-line editor would open
     *@private
     */
    handleKeyPressAndClickEvents : function () {
        var panel = this.findParentByType('panel');
        this.removeClass("x-form-disabled");
        $(this.el.dom).bind('keypress', function (event) {
            var code = event.charCode || event.which || event.keyCode || 0;
            if (code == 13 || code == 32) { // 13 for enter and 32 for space
                panel.onFocusOnDisplayText();
            }
        }).click(function () {
             panel.onFocusOnDisplayText();
         });
    },

    onFocusOnDisplayText : function () {
        this.removeClass("x-form-focus");
        this.showMultiLineTextArea();
    },

    /**
     * Saves the xTypes value in the field that will be sent to the server.
     * This must be called beforesubmit event
     */
    saveValue : function () {
        if (this.editField.isVisible()) {
            this.updateDisplayTextAndHideMultiLineTextArea();
        }
    },

    /**
     *to show the display Text after editing is complete
     @private
     */
    updateDisplayTextAndHideMultiLineTextArea : function () {
         var value = this.editField.getValue();
         this.displayText.setValue(value);
         this.hideMultiLineTextArea();
     },

    /**
     *to show the editor when clicked on the edit button
     *@private
     */
    showMultiLineTextArea : function () {
         this.editField.setValue(this.displayText.getValue());
         this.editField.show();
         this.editField.focus();
         this.onCompletionButton.show();
         this.displayText.hide();
         this.editButton.hide();
     },

    /**
     *to hide the edit Text Area after editing is complete
     @private
     */
    hideMultiLineTextArea : function () {
         this.editField.hide();
         this.onCompletionButton.hide();
         this.displayText.show();
         this.editButton.show();
     }

});

// register xtype
CQ.Ext.reg('guideMultiLineScriptArea', CQ.wcm.GuideMultiLineScripting);
