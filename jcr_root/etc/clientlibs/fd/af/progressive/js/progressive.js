// jscs:disable requireDotNotation
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

(function ($, guidelib) {
    var pageBreaks  = [];

    var PROGRESSIVE_CONSTANTS = {
        PDC_SELECTOR : ".pdc",
        PDC_SECTION_SELECTOR : ".pdcSection",
        PDC_SECTION_SUFFIX : "_guide_section",
        DATA_PDC_ALL_SECTION_INFO : "guide-progressive-allsections-info",
        DATA_PDC_SECTION_INFO : "guide-progressive-section-info",
        PDC_SECTION_CONTAINER : "data-guide-progressive-section-container",
        PDC_SECTION_FIELD_CONTAINER_SELECTOR : ".sectionFieldContainer",
        PDC_CONTROLS : "data-guide-progressive-controls",
        PDC_SECTION_TITLE_SELECTOR : ".sectionTitle",
        PDC_SECTION_REPEATABLE_CONTROLS_SELECTOR : ".pdcRepeatableControls",
        PDC_SECTION_TITLE_CONTAINER_SELECTOR : ".sectionTitleContainer",
        PDC_TITLE_SELECTOR : ".pdcTitle",
        PDC_OFFSET_SELECTOR : "data-guide-progressive-offset",
        NAVIGATE : {
            NEXT_PART_WITHIN_SECTION : "nextSectionPart",
            PREV_PART_WITHIN_SECTION : "prevSectionPart",
            NEXT_SECTION : "nextSection",
            PREV_SECTION : "prevSection"
        }
    };

    var progressive = guidelib.runtime.progressive = {
        completionButton : {},
        heightBuffer : 25,
        fieldHeightBuffer : 10,
        PROGRESSIVE_CONSTANTS : PROGRESSIVE_CONSTANTS,
        domTemplateCacheStore : {

            domTemplateCache : {},

            // expects that the model is already in the dom
            addDomTemplate : function (model, $dom) {
                // get id and add it to cache
                var cacheStore = guidelib.runtime.progressive.domTemplateCacheStore.domTemplateCache,
                    domTemplate = (($dom && $dom.length > 0) ? $dom : guidelib.runtime.progressive._getProgressiveDomFromModel(model));
                // This is now supported by Firefox as of FireFox 11
                cacheStore[model.sectionId] = domTemplate.get(0).outerHTML;
            },

            getDomTemplate : function (model) {
                var template = null;
                if (model) {
                    template = guidelib.runtime.progressive.domTemplateCacheStore.domTemplateCache[model.sectionId];
                }
                return template;
            }
        },

        /**
         * Creating a view based on given arguments
         * @param $el
         * @param model
         * @param parentView
         * @param viewClass
         * @returns {viewClass|*}
         */
        createBindView : function ($el, model, parentView, viewClass) {
            var createdView,
                options = {
                    'element' : $el,
                    'model' : model,
                    'parentView' : parentView
                };
            createdView =  new viewClass(options);
            createdView.postInitialize();
            return createdView;
        },

        /**
         * All sections would be available if the service which gave the content
         * is static
         * @private
         */
        _checkIfSectionsAvailableAndReturnJson : function ($container) {
            var pdcAllSectionInfoSelector = "[data-" + PROGRESSIVE_CONSTANTS.DATA_PDC_ALL_SECTION_INFO + "]",
                pdcSectionInfoSelector = "[data-" + PROGRESSIVE_CONSTANTS.DATA_PDC_SECTION_INFO + "]",
                $pdcSection = $container ? $container.find(pdcSectionInfoSelector).addBack(pdcSectionInfoSelector) : $(pdcSectionInfoSelector),
                $pdcContainer = $container ? $container.find(pdcAllSectionInfoSelector).addBack(pdcAllSectionInfoSelector) : $(pdcAllSectionInfoSelector);
            // If all section info has empty string, then we look for
            if ($pdcContainer.length > 0 && $pdcContainer.data(PROGRESSIVE_CONSTANTS.DATA_PDC_ALL_SECTION_INFO).length > 0) {
                return $pdcContainer.data(PROGRESSIVE_CONSTANTS.DATA_PDC_ALL_SECTION_INFO);
            } else if ($pdcSection.length > 0) {
                // Now check if there is atleast one section if not all section, this should be the case
                return $pdcSection.data(PROGRESSIVE_CONSTANTS.DATA_PDC_SECTION_INFO);
            } else {
                // Now
                return null;
            }
        },

        _checkIfSectionAlreadyCreated : function (sectionJson) {
            if (_.isArray(sectionJson)) {
                _.each(sectionJson, function (jsonObject) {
                    // we have only section
                    return _.find(guidelib.runtime.progressive.listOfSections, function (section) {
                        if (section.id === jsonObject.id) {
                            section.playJson(jsonObject);
                        }
                    });
                });
            }  else if (_.isObject(sectionJson)) {
                // we have only section
                return _.find(guidelib.runtime.progressive.listOfSections, function (section) {
                    return section.id === sectionJson.id;
                });
            }

        },

        _getClassNameFromJson : function (jsonObject) {
            var guideNodeClassTag = "GuideNode";
            // In case of repeatable panel, we create progressiveRepeatableSection
            if (jsonObject.repeatablePanelId) {
                guideNodeClassTag = "GuideProgressiveRepeatableSectionManager";
            } else if (jsonObject.guideNodeClass && jsonObject.guideNodeClass.length > 0)     {
                guideNodeClassTag = jsonObject.guideNodeClass.charAt(0).toUpperCase() + jsonObject.guideNodeClass.substr(1);
            }
            return guideNodeClassTag;
        },

        /**
         * If Section Json is an array
         * @param sectionJson
         * @private
         */
        _initializeSectionModelAndPlayJson : function (sectionJson) {
            var progressive = guidelib.runtime.progressive,
                className = null,
                model = null,
                curSection = null;
            progressive.listOfSections = progressive.listOfSections || [];
            // Check if model is present, if yes, then play json
            // If model is not created, we create it
            if (_.isArray(sectionJson)) {
                _.each(sectionJson, function (jsonObject) {
                    // safe check: if string, then convert it into object
                    if (_.isString(jsonObject)) {
                        jsonObject = JSON.parse(jsonObject);
                    }
                    // check if model created, if it is created, then play json
                    model = _.find(guidelib.runtime.progressive.listOfSections, function (section) {
                        if (section.sectionId === jsonObject.id) {
                            section.playJson(jsonObject);
                            return true;
                        }
                    });
                    if (!model) {
                        // Create the model and push it
                        progressive.listOfSections.push(new guidelib.model[progressive._getClassNameFromJson(jsonObject)]({"jsonModel" : jsonObject}));
                    }
                });
                // todo: check if this logic is correct, how to find the current section?
                if (progressive.listOfSections.length > 0) {
                    // return the last section always
                    curSection = progressive.listOfSections[0];
                }

            }  else if (_.isObject(sectionJson)) {
                // we have only section
                model = _.find(guidelib.runtime.progressive.listOfSections, function (section) {
                    if (section.sectionId === sectionJson.id) {
                        // Play json on model
                        section.playJson(sectionJson);
                        return true;
                    }
                });
                if (!model) {
                    // we have only section
                    progressive.listOfSections.push(new guidelib.model[progressive._getClassNameFromJson(sectionJson)]({"jsonModel" : sectionJson}));
                }
                if (!model && progressive.listOfSections.length > 0) {
                    // return the last section always
                    curSection = progressive.listOfSections[progressive.listOfSections.length - 1];
                } else if (model) {
                    // Update the current section to be the model found
                    curSection = model;
                }
            }

            return curSection;
        },

        /**
         * Load the current progressive section
         * @todo: Have to make this function, short and simple
         */
        loadProgressive : function () {
            var progressive = guidelib.runtime.progressive,
                // based on service type, it could be json of entire sections or just one section
                sectionJson = progressive._checkIfSectionsAvailableAndReturnJson();
            //Previous section HTML stack
            progressive.prevSections = progressive.prevSections || [];
            // Check if all sections are available
            // There can be two types of service, in case of static service we bring the entire sections from server
            // in case of dynamic service we bring the json of only one service
            if (sectionJson) {
                // Initialize the current section
                progressive.currentSection = progressive._initializeSectionModelAndPlayJson(sectionJson);
                // Add the current section in template cache store
                progressive.domTemplateCacheStore.addDomTemplate(progressive.currentSection);
                //bind the views for current rendered pdc Section
                progressive.bindViews(progressive.currentSection);
                // todo: have to remove this
                // Adding it to custom context property to be in sync with draft usecase
                // Need a cleaner way to do this
                progressive.addSectionInfo(progressive.currentSection);

            }
            // todo: why is this getting cloned
            //var $pdcSection = $(PROGRESSIVE_CONSTANTS.PDC_SECTION_SELECTOR).clone(); //as this is a rendered element, keeping a cloned copy
            //if ($pdcSection && $pdcSection.length > 0) {
            //store current pdc section HTML with current section.
            //guidelib.runtime.progressive.currentSection = $pdcSection[0];
            //bind the views for current rendered pdc Section
            //guidelib.runtime.progressive.bindViews();
            //guidelib.runtime.progressive.addSectionInfo($pdcSection);
            //}
            //todo: this has to be changed. we need to read enable-auto-save from json and not html.
            var enableAutoSave =  $(".pdc").data("enable-auto-save");
            if (enableAutoSave && window.guideBridge) {
                window.guideBridge.setEnabledAutoSave(enableAutoSave);
            } else {
                window.guideBridge.setEnabledAutoSave(false);
            }

        },

        // todo: have to clean this code
        // added model temporarily
        addSectionInfo : function (sectionModel) {
            var guideProgressiveSectionInfo = JSON.stringify(sectionModel.jsonModel),
                // This parameter(fetchedFromService) it purely used to check if restore from json has occurred
                // todo: change this logic later
                fetchedFromService = sectionModel.fetchedFromService;

            if (fetchedFromService && guideProgressiveSectionInfo) {
                if (window.guideBridge) {
                    // todo: should we store sections in
                    window.guideBridge.customContextProperty = window.guideBridge.customContextProperty || {};
                    window.guideBridge.customContextProperty.sections = window.guideBridge.customContextProperty.sections || [];
                    window.guideBridge.customContextProperty.sections.push(guideProgressiveSectionInfo);
                }
            }
        },

        /**
         * Bind the views (fields, repeatable panel) for the current section HTML.
         */
        bindViews : function (sectionModel) {
            var progressive = guidelib.runtime.progressive,
                childView = null,
                oneActive = true,
                $parentEl = progressive._getProgressiveDomFromModel(sectionModel),
                // we use the same view layer always for both section and completion section
                // todo: May be later we would to have use the node class to get the view class
                viewClass = sectionModel.isRepeatable ? guidelib.view['GuideProgressiveRepeatableSectionView'] : guidelib.view['GuideProgressiveSectionView'] ,
                parentView = null; //guidelib.runtime.progressive.createBindView($parentEl, sectionModel, null, viewClass);
            if (sectionModel.isRepeatable) {
                //model undefined or null in case of zero instance
                if (sectionModel._instances != null) {
                    // Empty all the repeatable, since we are going to render it fresh with latest ids
                    $(".pdcRepeatable").remove();
                    //populating and adding HTML for each instance of repeatable panel
                    _.each(sectionModel._instances, function (sectionInstance) {
                        // todo: removing this as of now, remove it later
                        //$(".pdcRepeatable").remove();
                        // Add this instance to repeatable map
                        childView = guidelib.runtime.progressive.addRepeatable(sectionInstance); //create view for each repeatable panel
                        // Update the child views
                        //that.childViews.push(childView);
                        //that._model._addToRepeatableMap(modelInstance);
                        if (oneActive) {
                            // todo: Have to make this logic more generic?
                            // As of now we don't have any container to hold all repeatables
                            // While making the first instance active adjust the height of progressive section container
                            var $section = childView.$element.closest("[" + PROGRESSIVE_CONSTANTS.PDC_SECTION_CONTAINER + "]"),
                                $pdc = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR),
                                //$repeatableControl = $pdc.find(PROGRESSIVE_CONSTANTS.PDC_SECTION_REPEATABLE_CONTROLS_SELECTOR),
                                $pdcTitle = $(PROGRESSIVE_CONSTANTS.PDC_TITLE_SELECTOR),
                                $pdcControls = $pdc.find("[" + PROGRESSIVE_CONSTANTS.PDC_CONTROLS + "]");

                            // Also add scroll bar CSS to data-guide-progressive-section-container
                            // to prevent overlay of repeatable panels inside section
                            $section.css("overflow", "auto");
                            // todo: added 40 since the next button is placed as absolute, have to fix this?
                            $section.height($pdc.outerHeight(true) - $pdcTitle.outerHeight(true) - $pdcControls.outerHeight(true) - 40);
                            //childView.$element.removeClass("browse"); // Remove bro
                            oneActive = false; //let first repeatable panel HTML be visible
                        } else {
                            childView.$element.removeClass('active'); //mark rest of the repeatable panel HTML invisible
                        }
                    });
                }
            } else {
                parentView = guidelib.runtime.progressive.createBindView($parentEl, sectionModel, null, viewClass);
            }
            //setting the current section parent view
            guidelib.runtime.progressive.parentView = parentView;
            //Adjust fields according to available height in section
            guidelib.runtime.progressive.fitToHeight();
        },

        deleteRepeatable : function (panelId) {
            // todo: remove from HTMl also, this should be in view layer
            // As of now this is no parent view, hence delegating the responsibility to progressive layer
            $('#' + panelId).remove();
        },

        /**
         * Handle various repeatable panel specific actions - add, remove, browse, back
         */
        handleRepeatable : function () {
            var $this = $(this),
                // todo: have to change this, add it as relative selector
                $nextButton = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR).find('[data-guide-progressive-nav="next"]'),
                $prevButton = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR).find('[data-guide-progressive-nav="prev"]'),
                type = $this.data('guide-repeatable');
            if ('add' === type) {
                //insert a model instance of repeatable panel
                var panelId = $this.data('guide-id'),
                    index = $this.data('guide-index'),
                    insertedInstance = null,
                    panelModel = guideBridge._resolveId(panelId),
                    panelInstanceManager;
                // Set the active Instance index
                progressive.currentSection.activeInstanceIndex = index || 0;
                if (index == 0) {
                    if (panelModel) { //case where the instance of panel having same id as its templateId was removed
                        panelInstanceManager = progressive.currentSection.instanceManager;
                    } else {
                        //getting the instance manager directly
                        panelInstanceManager = guideBridge._resolveId("im_" + panelId);
                    }
                    insertedInstance = progressive.currentSection.insertInstance(0);// panelInstanceManager.insertInstance(0);
                } else {
                    insertedInstance = progressive.currentSection.insertInstance(panelModel.instanceIndex + 1); //panelModel.instanceManager.insertInstance(panelModel.instanceIndex + 1);
                }
            } else if ('remove' === type) {
                //remove the model instance of repeatable panel
                var panelId = $this.data('guide-id'),
                    panelModel = guideBridge._resolveId(panelId);
                progressive.currentSection.removeInstance(panelModel);
            } else if ('browse' === type) {
                $this.addClass('hidden'); //hiding browse button
                // Show the addZero button in browse mode
                $('[data-guide-repeatable="add"].addZero').css('display', 'inline-block'); // hiding on click of activate
                $('[data-guide-repeatable="back"]').removeClass('hidden'); // showing back button
                $('.pdcSection').find('.pdcRepeatable').addClass('browse'); //adjust css to show summary / titles of all repeatable panels with add, remove controls
            } else if ('back' === type) {
                //hide the back button, and add repeatable controls
                //the padding needs to be restored to 20px - so remove class: pdcActiveRepeatableControl
                $('[data-guide-repeatable="back"]').addClass('hidden'); //hiding back button
                $('.pdcSection').find('.pdcRepeatableControls').removeClass('hidden');
                $('.pdcSection').find('.sectionTitleContainer').removeClass('pdcActiveRepeatableControl');

                //$('[data-guide-repeatable="browse"]').removeClass('hidden'); //showing browse button
                $('[data-guide-repeatable="add"].addZero').css('display', 'inline-block'); // hiding on click of back
                $('.pdcSection').find('.pdcRepeatable.active').removeClass('active'); //unmark the previously active panel
                $('.pdcSection').find('.pdcRepeatable').addClass('browse');
                $('.pdcSection').find('.progressiveSectionTitle').removeClass('hidden');
                //$('.pdcSection').find('.pdcRepeatable').removeClass('browse'); //adjust css to show the previously active repeatable panel
                //if($('.pdcSection').find('.pdcRepeatable.active').length === 0){
                // Make it atleast one panel active
                //    $('.pdcSection').find('.pdcRepeatable').addClass("active");
                //}
                // todo: have to write similar logic for next button
                progressive._hidePreviousButton($prevButton);
                $nextButton.removeClass("hidden");
            } else if ('activate' === type) {
                $prevButton.addClass("hidden");
                $nextButton.addClass("hidden");
                var panelId = $this.data('guide-id');
                $('[data-guide-repeatable="back"]').removeClass('hidden'); //hiding back button
                //remove repeatable controls
                // and the padding needs to be removed to remove extra spacing between heading and items
                $('.pdcSection').find('.pdcRepeatableControls').addClass('hidden');
                $('.pdcSection').find('.sectionTitleContainer').addClass('pdcActiveRepeatableControl');
                $('.pdcSection').find('.progressiveSectionTitle').addClass('hidden');
                $('[data-guide-repeatable="add"].addZero').hide(); // hiding on click of activate
                //$('[data-guide-repeatable="browse"]').removeClass('hidden'); //showing browse button
                $('.pdcSection').find('.pdcRepeatable').removeClass('browse'); //adjust css to show active repeatable panel
                $('.pdcSection').find('.pdcRepeatable.active').removeClass('active'); //unmark the previously active panel
                $('#' + panelId).addClass('active'); //make the clicked (title of panel), the active panel
                progressive.currentSection.activeInstance = panelId;
                guidelib.runtime.progressive.fitToHeight(); //adjust the panel fields to fit in the available panel height
            }
        },

        _getProgressiveDomFromCache : function (model) {
            return $(progressive.domTemplateCacheStore.getDomTemplate(model));
        },

        _getProgressiveDomFromModel : function (model, repeatableInstance) {
            var $dom = null;
            if (model) {
                var selector = "#" + model.sectionId + PROGRESSIVE_CONSTANTS.PDC_SECTION_SUFFIX;
                $dom = $(selector);
            }
            // fallback to template cache store
            // We cache the entire section html in cache store
            if ($dom == null || $dom.length === 0) {
                // todo: may be we can optimize this step, by storing the jquery object and not html
                // todo: This would purely depend on parse vs dom creation time tradeoffs being with memory and time
                // Currently, we store html of the section and not jquery object(Hence parse happens always)
                $dom = progressive._getProgressiveDomFromCache(model);
                progressive._addSectionToContainerAndCreateView(model, $dom);
            }
            // In case the current model is repeatable, then we use the repeatable id to return the html
            if (model.isRepeatable && repeatableInstance) {
                // If there is no instance, then we return the section itself
                if (model.activeInstance) {
                    // todo: if there is no instance then
                    $dom = $dom.find("#" + model.activeInstance.instance.id);
                }
            }
            return $dom;
        },

        /**
         * Responsible for creating view of newly added model instance of repeatable panel
         * @param model - newly added model instance of repeatable panel
         * @param parentView
         * @returns {viewClass}
         */
        addRepeatable : function (model) {
            var progressive = guidelib.runtime.progressive,
                viewClass = guidelib.view['GuideProgressiveRepeatableSectionView'],
                index = model.instanceIndex, //instance index of the newly inserted model of repeatable panel
                options = {
                    // todo: check if this is correct
                    'element' : progressive._getProgressiveDomFromCache(progressive.currentSection).find(".pdcRepeatable").clone(), //clone the HTML from the cached template HTML of the section
                    'model' : model,
                    'parentView' : null
                },
                repeatableView =  new viewClass(options),
                browseRepeatables = $('.pdcSection').find('.pdcRepeatable.browse'), //for determining whether the section with repeatable panels was open in browse mode
                activeRepeatable = $('.pdcSection').find('.pdcRepeatable.active'); //for determining if the section with repeatable panels had one of the repeatable panel fields visible
            repeatableView.handleRepeatableProgressivePanel(); //updating HTML with model instance id

            // todo: make this code independent of html
            if (index === 0) { //case of instance added with index 0, that is the first appearing instance
                if ($('.pdcSection').find('.pdcRepeatable').get(0)) { //case where some instances are already there
                    $('.pdcSection').find('.pdcRepeatable').eq(0).before(repeatableView.$element); //adding the instance HTML before all the instances
                } else { //case where this is the first instance of the repeatable panel
                    // And append the new element
                    $('.pdcSection').append(repeatableView.$element); //adding the instance HTML to pdcSection
                }
            } else { //case where it is inserted or added after some instance already there
                $('.pdcSection').find('.pdcRepeatable').eq(index - 1).after(repeatableView.$element); //adding the instance HTML after the previous instance
            }
            repeatableView.postInitialize(); //Initializing all the childViews (guideFields) for the instance
            //In case of first instance, let it be active
            //activeRepeatable && activeRepeatable.length === 0 && browseRepeatables && browseRepeatables.length === 0
            //else the following
            if (activeRepeatable && activeRepeatable.length > 0) {
                //if the section was displayed in active mode, unmarking the newly added instance HTML to be visible
                repeatableView.$element.removeClass('active');
            }
            // When adding panel for the first time always show in browse mode to keep
            // behaviour consistent across all instances of repeatable panels
            if (browseRepeatables && browseRepeatables.length >= 0) {
                //if the section was displayed in browse mode, marking the newly added instance HTML to show its title/summary
                //show just the title / summary of newly created repeatable panel
                repeatableView.$element.addClass('browse');
            }
            return repeatableView;
        },

        /**
         * Incharge of setting up completion button, and the script which needs to bextecuted on its click.
         */
        setCompletionButton : function () {
            var $completionButton = $('[data-guide-progressive-completion]');
            if (guidelib.runtime.progressive.completionButton.completionButtonText) {
                $completionButton.text(guidelib.runtime.progressive.completionButton.completionButtonText);
            }
            $completionButton.on('click', function (event) {
                if (guidelib.runtime.progressive.completionButton.completionScript) {
                    var successFunction = new Function(guidelib.runtime.progressive.completionButton.completionSuccessScript),
                        errorFunction = new Function(guidelib.runtime.progressive.completionButton.completionFailureScript),
                        successHandler = function () {
                            try {
                                successFunction.apply(window.guideBridge);
                            } catch (e) {
                                window.guideBridge._guide.logger().log("Invalid completionSuccessScript" + e);
                            }
                            guidelib.runtime.progressive.action.apply(this);
                        },
                        errorHandler = function () {
                            try {
                                errorFunction.apply(window.guideBridge);
                            } catch (e) {
                                window.guideBridge._guide.logger().log("Invalid completionFailureScript" + e);

                                this.logger().error("Invalid completionFailureScript" + e);
                            }
                            guidelib.runtime.progressive.failureAction.apply(this);
                        },
                        clickFunction = new Function('options', guidelib.runtime.progressive.completionButton.completionScript),
                        options = {context : this, success : successHandler, error : errorHandler};
                    clickFunction.apply(window.guideBridge, [options]);
                }
            });
        },

        action : function () {
            var $this = $(this),
                $controlsContainer = $this.closest('[data-guide-progressive-controls]'),
                $sectionContainer = $controlsContainer.siblings("[" + PROGRESSIVE_CONSTANTS.PDC_SECTION_CONTAINER + "]");
            $controlsContainer.addClass('hidden');
            $sectionContainer.find('[data-guide-progressive-completion-message="before"]').addClass('hidden');
            $sectionContainer.find('[data-guide-progressive-completion-message="after"]').removeClass('hidden');
        },

        failureAction : function () {
            var $this = $(this),
                $afterCompletionMessageDiv,
                $controlsContainer = $this.closest('[data-guide-progressive-controls]'),
                $sectionContainer = $controlsContainer.siblings("[" + PROGRESSIVE_CONSTANTS.PDC_SECTION_CONTAINER + "]");
            $sectionContainer.find('[data-guide-progressive-completion-message="before"]').addClass('hidden');
            $sectionContainer.find('[data-guide-progressive-completion-message="after"]').removeClass('hidden');
            $afterCompletionMessageDiv = $sectionContainer.find('[data-guide-progressive-completion-message="after"]');
            $afterCompletionMessageDiv[0].text('There was issue in completing the form. Please try again later.');

        },

        markFieldNeutral : function ($field) {
            //Makes the current section field neither visible nor hidden
            $field.removeClass('pdcCurrentPanelField').removeClass('pdcFieldHide');
        },

        markFieldVisible : function ($field) {
            //Makes the current section field visible
            $field.addClass('pdcCurrentPanelField').removeClass('pdcFieldHide');
        },

        markFieldHidden : function ($field) {
            //Makes the current section field hidden
            $field.removeClass('pdcCurrentPanelField').addClass('pdcFieldHide');
        },

        /**
         * For identifying fields which should be marked hidden because of a hidden
         * parent panel.
         */
        isFieldVisible : function (fieldModel) {
            var parent;
            if (fieldModel == undefined || fieldModel.visible == false) {
                return false;
            }
            parent = fieldModel.parent;
            while (parent) {
                if (parent.visible == false) {
                    return false;
                }
                parent = parent.parent;
            }
            return true;
        },

        fitToHeight : function (navType, $prevButton, $nextButton) {
            var currentSection = progressive.currentSection,
                isRepeatable = currentSection.isRepeatable;
            if (isRepeatable) {
                // In case of removal of instance, active instance would be undefined
                currentSection = progressive.currentSection.activeInstance;
            }
            // If no navigation specified, then move within section
            // Also, may be in case of zero sections, current section would be undefined
            if (!navType && currentSection) {
                // Ask section to navigate within its parts
                // todo: During navigate, we should send model also
                currentSection._triggerEvent(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, "navigateWithinSection",
                    null, null);
            }
            // In case of repeatable section, we directly move to next section once validations are passed
            if ((isRepeatable) || (navType === "next" && currentSection.isLastPart) || (navType === "prev" && currentSection.isFirstPart)) {
                if (navType === "next") {
                    return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.NEXT_SECTION;
                } else if (navType === "prev") {
                    return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.PREV_SECTION;
                }
            } else if (navType === 'next' || navType === "prev") {
                // Ask section to navigate within its parts
                currentSection._triggerEvent(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, "navigateWithinSection",
                    null, navType);
                if (navType === "next") {
                    //since next was clicked, make previous button available
                    $prevButton.removeClass('hidden');
                    return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.NEXT_PART_WITHIN_SECTION;
                } else {
                    //since previous was clicked, make next button available
                    $nextButton.removeClass('hidden');
                    return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.PREV_PART_WITHIN_SECTION;
                }
            }
            //return true to switch sections
            // May hit in case of completion section since we don't have field container for completion section
            if (navType === "next") {
                return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.NEXT_SECTION;
            } else if (navType === "prev") {
                return progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.PREV_SECTION;
            }
        },

        /**
         * Responsible for rendering last section in case of restoring progressive data capture or
         * previous from restored progressive data capture. This function extracts the information
         * of the last section  from the passed in json data and makes an ajax call with this information as data.
         */
        renderLastSection : function () {
            var lastSectionInfo = null;
            if (window.guideBridge.customContextProperty.sections && window.guideBridge.customContextProperty.sections.length > 0) {
                var sectionsLength = window.guideBridge.customContextProperty.sections.length,
                    prevSectionInfo = window.guideBridge.customContextProperty.sections[sectionsLength - 1];
                if (prevSectionInfo != null) {
                    lastSectionInfo = {lastSectionInfo : ((_.isObject(prevSectionInfo)) ? JSON.stringify(prevSectionInfo) : prevSectionInfo)};
                }
            }
            //passing guidelib.runtime.progressive.setAndRenderCurrentSection as success handler
            guidelib.runtime.progressive.getProgressiveSection(lastSectionInfo, guidelib.runtime.progressive.setAndRenderCurrentSection);
        },

        /**
         * Fetch the section HTML from server
         * @param data
         * @param successHandler
         */
        getProgressiveSection : function (data, successHandler) {
            var pdcPath = $('[data-guide-progressive-path]').data('guide-progressive-path');
            //call changed from GET to POST to handle large data
            $.ajax({
                url : guideBridge._getUrl(pdcPath + ".progressive.pdcSection.html"),
                type : "POST",
                async : false,
                cache : false,
                data : data,
                success : successHandler,
                error : function (response) {
                    window.guideBridge._guide.logger().log("Error: " + response);
                }
            });
        },

        /**
         * Sets the given html element as current section and renders it by creating view.
         */
        setAndRenderCurrentSection : function (sectionModel, $response) {
            var currentSection = progressive.currentSection;
            // First add the section to html and create view
            // Add the new html to dom and create the view
            if (sectionModel && sectionModel != null) {
                //cloning the current section, so the rendering does not impact the template
                //caching template of current section obtained from server / HTML stack
                progressive.currentSection = sectionModel;
            }
            if ($response && $response.length > 0) {
                // This will also remove event listeners jquery data etc from the element
                // todo: may be this should solve handleVisibleChange for child views
                progressive._getProgressiveDomFromModel(currentSection).remove();
                progressive._addSectionToContainerAndCreateView(sectionModel, $response);
            }
            var $section = progressive._getProgressiveDomFromModel(sectionModel),
            // todo: have to change this code
                $nextButton = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR).find('[data-guide-progressive-nav="next"]'),
                $prevButton = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR).find('[data-guide-progressive-nav="prev"]'),
                $actionButton = $(PROGRESSIVE_CONSTANTS.PDC_SELECTOR).find('[data-guide-progressive-completion]'),
                $completion = $section.find("data-guide-progressive-section-completion"),
                isCompletion = false;
            $prevButton.removeClass('hidden');
            $nextButton.removeClass('hidden');
            $actionButton.addClass('hidden');

            if ($section && $section.find("[data-guide-progressive-section-completion]").length > 0) {
                isCompletion = true;
            } else if ($completion && $completion.length > 0) {
                isCompletion = true;
            }

            if (isCompletion) {
                guidelib.runtime.progressive.completionButton = $section.data("guide-progressive-section-info");
                guidelib.runtime.progressive.setCompletionButton();
                $actionButton.removeClass('hidden');
                $nextButton.addClass('hidden');
            }
        },

        _deleteSectionFromView : function (sectionModel) {
            var $element = progressive._getProgressiveDomFromModel(sectionModel),
                view = $element.data("guideView");
            delete view;
        },

        _addSectionToContainerAndCreateView : function (sectionModel, $section) {
            // todo: better way to do this
            var sectionContainerSelector = "[" + PROGRESSIVE_CONSTANTS.PDC_SECTION_CONTAINER + "]",
                pdcSelector = PROGRESSIVE_CONSTANTS.PDC_SELECTOR,
                $sectionContainer = $(pdcSelector).find(sectionContainerSelector);
            // Empty the section container
            if ($sectionContainer.length > 0) {
                // Now remove the HTML
                $sectionContainer.empty();
                //cloning the current section, so the rendering does not impact the template
                //caching template of current section obtained from server / HTML stack
                $sectionContainer.html($section);
                // Now add template to cache store
                progressive.domTemplateCacheStore.addDomTemplate(sectionModel, $section);
                // Bind view
                guidelib.runtime.progressive.bindViews(sectionModel);
            }
        },

        /***
         * Logically this code should call validate of current section and that based on the number of parts would validate each field
         * @param $controlsContainer
         * @returns {{errorList: Array, fieldValue: Array}}
         * @todo: Should validate in case of repeatable panel validate all fields present inside all instances of repeatable panel ?
         * As of now it validates only field present inside current active part
         * @private
         */
        _validate : function () {
            // skip if invisible already  handled by Field's model
            // and section does not have a model so no handling needed here
            var currentSection = progressive.currentSection,
            // todo: as of now hardcoding, make it better later
                currentActivePart = currentSection.activePart,
                errorFound = false,
                errorlist = [],
                fieldVal = [];
            // In case of repeatability we validate all instance if the current section is repeatable
            if (currentSection.isRepeatable) {
                // In case of zero instances, we don't need to validate on click of next
                //if(currentSection._instances[currentSection.activeInstanceIndex]){
                //    currentActivePart = currentSection._instances[currentSection.activeInstanceIndex].activePart;
                //}
                // todo: any better way to do this ?
                // We stop if we get any error, and return that
                _.some(currentSection._instances, function (item) {
                    if (!errorFound) {
                        _.some(item._parts, function (part) {
                            if (!errorFound) {
                                _.some(part, function (model, id) {
                                    var error = [];
                                    if (model) {
                                        window.guideBridge.validate(error, model.somExpression, true);
                                        if (model.value) {
                                            fieldVal.push({field : model.name, value : model.value});
                                        }
                                        if (error.length > 0) {
                                            currentActivePart = item;
                                            errorlist.push(error[0]);
                                            errorFound = true;
                                            return;
                                        }
                                    }
                                });
                            } else {
                                return;
                            }
                        });
                    } else {
                        return;
                    }
                });
            } else {
                _.each(currentActivePart, function (model, id) {
                    var error = [];
                    if (model) {
                        window.guideBridge.validate(error, model.somExpression, true);
                        if (model.value) {
                            fieldVal.push({field : model.name, value : model.value});
                        }
                        if (error.length > 0) {
                            errorlist.push(error[0]);
                        }
                    }
                });
            }
            return {
                instance : currentActivePart,
                errorList : errorlist,
                fieldValue : fieldVal
            };
        },

        _triggerOnBridge : function (eventName, target, property, oldVal, newVal) {
            if (window.guideBridge) {
                window.guideBridge.trigger(eventName,
                    guidelib.event.GuideModelEvent.createEvent(eventName, target, property,
                        oldVal, newVal));
            }
        },

        _getSection : function (name) {
            // Search for the name in the list of sections
            return _.find(progressive.listOfSections, function (item) {
                return item.sectionName === name;
            });
        },

        _getAndRenderSection : function (data, state) {
            var successHandler = function (response) {
                var progressive = guidelib.runtime.progressive,
                    sectionJson = null,
                    $response = $(response),
                    sectionModel = null;
                // todo: be careful may be the section is already available
                if (progressive.currentSection) {
                    //pushing template of current section
                    progressive.prevSections.push(progressive.currentSection);
                }
                // Get the json from the response
                sectionJson = progressive._checkIfSectionsAvailableAndReturnJson($response);
                // Create the model from the response
                if (sectionJson) {
                    sectionModel = progressive._initializeSectionModelAndPlayJson(sectionJson);
                    // trigger on bridge that we are moving to next section
                    // todo: what to send instead of null, there is no concept of som for a section
                    progressive._triggerOnBridge("pdcNavigationChanged", progressive.currentSection,
                        state , progressive.currentSection, sectionModel);
                    progressive.addSectionInfo(sectionModel);
                    // Now render the current section
                    progressive.setAndRenderCurrentSection(sectionModel, $response);
                }

            };
            guidelib.runtime.progressive.getProgressiveSection(data, successHandler);
        },
        /**
         * Sets Focus at the given section name
         * @todo: To add support for som expression of field to set focus
         * @param name
         */
        setFocus : function (name) {
            // Check if the name of the current section doesn't match the given parameter
            var section = progressive._getSection(name),
                data = {
                "currentSectionId" : section.sectionId,
                // to tell render the current section passed
                "renderCurrentSection" : true
            };
            // Since we are setting focus to new section there is no state as such
            // todo: can there be state when we set focus on a section ?
            progressive._getAndRenderSection(data, null);
        },

        _hidePreviousButton : function ($prevButton) {
            // Hide the previous button logic
            if (window.guideBridge.customContextProperty && window.guideBridge.customContextProperty.sections && window.guideBridge.customContextProperty.sections.length === 1) {
                // We hide the previous button only if the current active part is 0
                if (progressive.currentSection.isRepeatable) {
                    // check for the active part of the current active instance
                    // todo: current active part will always be 0
                    // Even if there is no active instance
                    if (progressive.currentSection.activeInstance == null || progressive.currentSection.activeInstance.currentActivePart === 0) {
                        $prevButton.addClass('hidden');
                    } else {
                        $prevButton.removeClass("hidden");
                    }
                } else {
                    // if not repeatable, then check
                    if (progressive.currentSection.currentActivePart === 0) {
                        $prevButton.addClass('hidden');
                    } else {
                        $prevButton.removeClass("hidden");
                    }
                }
            } else {
                // else always show the previous button
                $prevButton.removeClass("hidden");
            }
        },

        _hideNextButton : function ($nextButton) {
            // todo: have to add Hide the next button logic
        },

        /**
         * Responsible for navigating between sections.
         */
        navigateSection : function () {
            var progressive = guidelib.runtime.progressive,
                $this = $(this),
                nav = $this.data('guide-progressive-nav'),
                $controlsContainer = $this.closest('[data-guide-progressive-controls]'),
                $nextButton = $controlsContainer.find('[data-guide-progressive-nav="next"]'),
                $prevButton = $controlsContainer.find('[data-guide-progressive-nav="prev"]'),
                state = null,
                // we only validate on click of next
                errorFieldValueObject = nav === "next" ? progressive._validate() : null,
                errorList = errorFieldValueObject ? errorFieldValueObject.errorList : null,
                activeInstance = errorFieldValueObject ? errorFieldValueObject.instance : null,
                fieldVal = errorFieldValueObject ? errorFieldValueObject.fieldValue : null;
            if (errorList && errorList.length > 0) { //case of erroneous data fill
                if (progressive.currentSection.isRepeatable) {
                    // Also set focus on the section, since we can also be in browse mode in case of repeatable panel
                    // Ask section to navigate within its parts
                    // todo: If we support validating all instances, this event handler has to be changed
                    activeInstance._triggerEvent(guidelib.event.GuideModelEvent.NAVIGATE_SECTION, "navigateWithinSection",
                        null, null);
                    // Now reset the active instance
                    progressive.currentSection.activeInstance = activeInstance.instance.id;
                    var $element = progressive._getProgressiveDomFromModel(progressive.currentSection, true),
                        $pdc = $element.parents(".pdc"),
                        $pdcSection = $pdc.find(".pdcSection");
                    // todo: this logic has to be moved
                    // Hide unwanted elements
                    $pdc.find('[data-guide-repeatable="back"]').removeClass('hidden'); //hiding back button
                    $pdc.find('[data-guide-repeatable="add"].addZero').hide(); // hiding on click of activate
                    // We show only that element where error has occurred
                    $pdcSection.find('.pdcRepeatable').removeClass('browse'); //adjust css to show active repeatable panel
                    $pdcSection.find('.pdcRepeatable.active').removeClass('active'); //unmark the previously active panel
                    // add class active to current element
                    $element.addClass("active");
                    // hide next and previous button
                    $nextButton.addClass("hidden");
                    $prevButton.addClass("hidden");
                }
                // Set focus on the first invalid field
                guideBridge.setFocus(errorList[0].som);
                return;
            }
            // Now fit to height since this will also hide and unhide fields
            state = guidelib.runtime.progressive.fitToHeight(nav, $prevButton, $nextButton);

            if (state == progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.NEXT_SECTION) {
                var data = {
                    "currentSectionId" : progressive.currentSection.sectionId,
                    "sectionFieldValue" : fieldVal
                };

                guidelib.runtime.progressive._getAndRenderSection(data, state);
            } else if (state == progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.PREV_SECTION) {
                //Previous Section 'prev'
                //remove current section info from customProperty
                if (window.guideBridge.customContextProperty.sections && window.guideBridge.customContextProperty.sections.length > 0) {
                    window.guideBridge.customContextProperty.sections.pop();
                }
                // Store the current section
                var currentSection = progressive.currentSection;
                //check if previous section is available in HTML stack
                if (guidelib.runtime.progressive.prevSections && guidelib.runtime.progressive.prevSections.length > 0) {
                    guidelib.runtime.progressive.setAndRenderCurrentSection(guidelib.runtime.progressive.prevSections.pop());
                } else { // check if previous section is available in section info stack
                    // todo: use model here
                    guidelib.runtime.progressive.renderLastSection();
                }
                // Since progressive current section is updated with prev section, let other hearing on this know about it
                // todo: check for arguments
                progressive._triggerOnBridge("pdcNavigationChanged", currentSection,
                    state , currentSection, progressive.currentSection);
            } else if (state === progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.NEXT_PART_WITHIN_SECTION || state === progressive.PROGRESSIVE_CONSTANTS.NAVIGATE.PREV_PART_WITHIN_SECTION) {
                // Since progressive current section is updated with prev section, let other hearing on this know about it
                progressive._triggerOnBridge("pdcNavigationChanged", progressive.currentSection,
                    state , progressive.currentSection, progressive.currentSection);
            }
            progressive._hidePreviousButton($prevButton);
        }
    };

    // Using the touchstart event in IPAD and IPHONE to solve the issue of click event not getting triggered
    // It's also quicker, the touch responds much faster than click for some reason.
    var ua = navigator.userAgent,
        event = (ua.match(/(iPad|iPhone)/)) ? "touchstart" : "click";

    // todo: if possible remove the use of delegated events later
    $(document).on('click', 'button[data-guide-progressive-action]', guidelib.runtime.progressive.action);
    $(document).on(event, '[data-guide-repeatable]', guidelib.runtime.progressive.handleRepeatable);
    $(window).on('load', guidelib.runtime.progressive.loadProgressive);
}($, window.guidelib));
