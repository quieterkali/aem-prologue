/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2011 Adobe Systems Incorporated
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

/*global $, jQuery, formatters */
/**
 * @private
 */
(function ($) {
	$.fn.abacusLink = function (options) {
		var $m, synchCollection, synchElement, synchFunctions = [], fieldGroups = [];

		/*
		 * fieldGroups are sets of like-named fields that participate in a multi-select list.
		 * For this to work, the fields are bound to a property of type: string[].
		 * Normally we'd expect these fields to be check boxes, but it also works if they're text fields.
		 * We need to track these groups during binding in order to keep them in groups.
		 * The groups are then used when assigning values -- either making an array from the fields in the
		 * group or else assigning fields from an array of strings.
		 */
		function getFieldGroup(element, vProperty) {
			var returnGroup,
				sName = element.attr("name");

			$.each(fieldGroups, function (index, group) {
				if (group.name === sName && vProperty === group.property) {
					returnGroup = group;
				}
			});
			if (!returnGroup) {
				returnGroup = {name: sName, property: vProperty, elements: []};
				fieldGroups.push(returnGroup);
			}
			returnGroup.elements.push(element);
			return returnGroup.elements;
		}
		/*
		 * If an entity or property have been removed, remove any nested properties
		 * from the fieldGroup list
		 * The source parameter may be a collection event or a Collection or an Entity or a Property
		 *
		 */
		function checkGroups(source) {
			var i, len;
			if (source instanceof $m.Entity) {
				$.each(source.$properties(), function (index, child) {checkGroups(source[child]);});
			} else if (source instanceof $m.Collection) {
				len = Collection.$length();
				for (i = 0; i < len; i += 1) {
					checkGroups(Collection.$item(i));
				}
			} else if (source instanceof $m.Property) {
				if (source.$propertyType() === "string[]") {
					// if this property is being removed and is in our list,
					// then also clear it from the list.
					for (i = fieldGroups.length - 1; i >= 0; i -= 1) {
						if (group.property === source) {
							fieldGroups.splice(i, 1);
						}
					}
				}
			} else if (source.kind && source.kind === $m.EventKind.REMOVE) {
				// source is a collection remove event
				for (i = 0; i < source.items.length; i += 1) {
					checkGroups(source.items[i]);
				}
			}
		}
		function hasProperty(entity, property) {
			if (entity instanceof $m.Collection) {
				return (entity.$rowName() === property);
			}
			return (entity[property] ? true : false);
		}

		// find the entity that defines a property
		function locateEntity(entities, sName) {
			var j, testEntity;
			for (j = entities.length; j > 0; j -= 1) {
				testEntity = entities[j - 1];
				if (hasProperty(testEntity, sName)) {
					return testEntity;
				}
				if (testEntity.$name() === sName) {
					return testEntity;
				}
				if (testEntity.$parent() instanceof $m.Collection) {
					// see if the name matches the collection type
					if (testEntity.$parent().$rowName() === sName) {
						return testEntity;
					}
				}
			}
			// returns undefined if not found
			return undefined;
		}

		// figure out something about an object reference -- does it quack like a selector?
		// or more specifically -- make sure it's not a model object
		function isSelector(obj) {
			if (obj.jquery) {
				return true;
			}
			if (obj instanceof $m.Collection) {
				return false;
			}

			if (obj.$model) {
				return false;
			}
			return (typeof obj === "string");
		}

		function resolveSelector(selector, contextNode) {
			var result;
			if (selector.jquery) {
				return selector;
			}
			if (contextNode) {
				result = contextNode.find(selector);

				if (result.length === 0 && contextNode.is(selector)) {
					result = contextNode;
				}
				return result;
			}
			return $(selector);
		}

		function isField(node) {
			var sTag = node.get(0).tagName;
			// We used to use: node.is("input") etc. but it was much slower.
			return sTag === "INPUT" || sTag === "SELECT" || sTag === "TEXTAREA";
		}

		function substitute(sContent, sExpression, entities) {
			var sValue, entity;
			sExpression = sExpression.replace(/\+\{|\}/g, "");

			entity = locateEntity(entities, sExpression);
			if (!entity) {
				return sContent;
			}
			if (entity instanceof $m.Property) {
				sValue = $m.getDisplayValue(entity);
			} else {
				sValue = $m.getDisplayValue(entity[sExpression]);
			}
			return sContent.replace("+{" + sExpression + "}", sValue.toString());
		}

		function assignProperty(theEvent) {
			var observer = {}, aProperties, j, sContent, target, htmlInput, targetProp, eventData, arrayValue;
			jQuery.extend(observer, theEvent.data);

			target = observer.targetObject;
			targetProp = observer.targetProperty;
			if (target instanceof $m.Entity) {
				htmlInput = $(theEvent.currentTarget);
				if (targetProp.$propertyType() === "string[]") {
					// if the property is an array, then the array value will be the aggregate of all the
					// same-named fields that are bound to the Property
					// Most likely this is a group of checkboxes
					// Could also be a <select multiple> which has an array value.
					eventData = $.data(theEvent.currentTarget, "eventData");
					arrayValue = [];
					$.each(eventData.fields, function (index, element) {
						var field = element.get(0),
							sValue = element.val();

						switch (field.tagName) {
						case "INPUT":
							switch (element.attr("type")) {
							case "checkbox":
							case "radio":
								if (element.prop("checked")) {
									arrayValue.push(sValue);
								}
								break;
							default:
								if (sValue !== "") {
									arrayValue.push(sValue);
								}
								break;
							}
							break;
						case "SELECT":
							if (element.attr("multiple") === "multiple") {
								arrayValue = sValue;
							} else {
								if (sValue !== "") {
									arrayValue.push(sValue);
								}
							}
							break;
						case "TEXTAREA":
							if (sValue !== "") {
								arrayValue.push(sValue);
							}
							break;
						}
					});
					targetProp.$value(arrayValue);
				} else {	// not bound to an array
					if (htmlInput.attr("type") === "checkbox") {
						targetProp.$value(htmlInput.prop("checked"));
					} else {
						targetProp.$value(theEvent.newValue);
					}
				}
			} else if (target instanceof $m.Collection) {
				// when a collection, the property is an offset
				target.$item(targetProp).$value(theEvent.newValue);

			} else {
				if ((targetProp === "data-bind-value" || targetProp === "value") && isField(target)) {
					if (theEvent.source.$propertyType() === "string[]") {
						// if the source is an array, then the array value will be the aggregate of all the
						// same-named fields that are bound to the Property
						// Most likely this is a group of checkboxes
						// Could also be a <select multiple> which has an array value.
						eventData = $.data(target.get(0), "eventData");
						arrayValue = theEvent.source.$value() || [];
						$.each(eventData.fields, function (index, element) {
							var field = element.get(0);

							switch (field.tagName) {
							case "INPUT":
								switch (element.attr("type")) {
								case "checkbox":
								case "radio":
									element.prop("checked", jQuery.inArray(element.val(), arrayValue) !== -1);
									break;
								default:
									element.val(index >= arrayValue.length ? "" : arrayValue[index]);
									break;
								}
								break;
							case "SELECT":
								if (element.attr("multiple") === "multiple") {
									element.val(arrayValue);
								} else {
									element.val(index >= arrayValue.length ? "" : arrayValue[index]);
								}
								break;
							case "TEXTAREA":
								element.val(index >= arrayValue.length ? "" : arrayValue[index]);
								break;
							}
						});
					} else {
						// value is special -- assume this is for an <input> or <select> element.
						if (target.attr("type") === "checkbox") {
							target.prop("checked", theEvent.source.$value());
						}
						if (target.attr("type") === "radio") {
							// Assume all radio buttons in the same group are bound to the same property.
							// Check the radio button that matches the property value
							target.prop("checked", target.val() === theEvent.source.$value());

						} else if (target.attr("type") !== "button") {
							// don't synchronize a button value.
							// TODO maybe eventually we'll synchronize the button value to the style.caption
							// .val() assignment handles both
							target.val($m.getDisplayValue(theEvent.source));

						}
					}
				} else if (targetProp === "available") {
                    // based on availability, either remove or restore the bound element to the DOM
                    var evtData = target.data("eventData");
                    if (theEvent.source.$isAvailable()) {
                        evtData.availableAnchor.empty().after(target);
                    } else {
                        //CQ5-34399: when detaching fields replace with hidden field to assist server side validation
                        evtData.availableAnchor.append('<input name=":fieldhidden" type="hidden" value="' + target.find(":input").attr("name") + '">');
                        target.detach();
                    }
				} else if (targetProp !== "data-bind") {
					// for data-bind do nothing.  This is just binding without substituting content.
					// Useful in cases where a button needs to be bound to context in the model.

					sContent = $.data(target.get(0), "eventData").originalContent[targetProp] || "";
					aProperties = sContent.match(/\+\{[^}]*\}/g) || [];
					if (aProperties.length > 0) {
						for (j = 0; j < aProperties.length; j += 1) {
							sContent = substitute(sContent, aProperties[j], observer.entities);
						}
					} else {
						sContent = $m.getDisplayValue(theEvent.source, theEvent.property);
						if (sContent === undefined) {
							sContent = "";
						}
					}
					// Substitute out any data-bind- prefix in order to assign the actual property.
					targetProp = targetProp.replace(/data\-bind\-/, "");
					if (targetProp === "html") {
						target.html(sContent);

					} else {
						target.attr(targetProp, sContent);
					}
				}
			}
		}

		function cloneAdapterData(dst, src) {
			var eventData = $.data(src.get(0), "eventData"),
				options = {};
			jQuery.extend(options, eventData);
			delete options.source;
			delete options.widgetAssigned;
			dst.abacusUIAdapter(options);
		}
		/**
		 * Clone a prototype section of HTML, also cloning any model adapters that are
		 * bound to the source HTML.  Any elements that have a model adapter will have a class
		 * definition: "abacus-adapter".
		 * @param source: the source HTML to clone.
		 */
		function cloneWithAdapters(source) {
			// get a list of all adapters bound to descendents of the start element
			var srcAdapters = source.find(".abacus-adapter"),
			// unfortunately, jquery '.find' doesn't include the start element.
			// Process it separately.
				bSrcHasAdapter = source.hasClass("abacus-adapter"),
				i = 0,
				newNode = source.clone();

			if (bSrcHasAdapter) {
				cloneAdapterData(newNode, source);
			}
			if (srcAdapters.length > 0) {
				newNode.find(".abacus-adapter").each(
					function () {
						cloneAdapterData($(this), $(srcAdapters[i]));
						i += 1;
					}
				);
			}
			return newNode;
		}
		/**
		 * This function sets up a binding:
		 * targetObj[targetProp] = srcObj[srcProp];
		 * @param srcObj -- either a model class or a selector pointing to an
		 *					<input> or <select> element
		 * @param srcProp -- the property of the source object that we're synching from
		 * @param targetObj -- the object we're populating
		 * @param targetProp -- the object property to be populated
		 * @param contextNode -- used when we're binding into a repeating structure
		 * @param entities -- The set of entities that are curently in scope.
		 */
		function bindProperty(srcObj, srcProp, targetObj, targetProp, contextNode, entities) {
			contextNode = contextNode || null;

			var eventListener,
				vPlaceholder,
				resolved,
				eventData,
				callback,
				observer = {targetObject:	targetObj,
							targetProperty: targetProp,
							contextNode:	contextNode,
							entities:		entities
							};


			// if the source is a selector, then we'll assume it's going to resolve to an <input>
			// or <select>. use the change event to propagate changes
			if (isSelector(srcObj)) {
				// resolve the selector in the context of the context node.
				resolved = resolveSelector(srcObj, contextNode);
				if (resolved.length > 0 && !isField(resolved)) {
					$.error("Expected the source object to resolve to an INPUT or SELECT, not a: " + resolved.get(0).tagName);
				}
				resolved.addClass("abacus-bound");
				if (targetProp instanceof $m.Property && targetProp.$propertyType() === "string[]") {
					// If we have multiple same-named fields bound to an array property, then the property
					// value will be an array with one element for each field.
					resolved.each(function (index, element) {
						$.data(element, "eventData").fields = getFieldGroup($(element), targetProp);
					});
				}
				resolved.change(observer,
					function (theEvent) {
						theEvent.oldValue = theEvent.prevValue;
						if (theEvent.target.type === "checkbox") {
							theEvent.newValue = theEvent.target.checked;
						} else {
							theEvent.newValue = $(theEvent.target).val();
						}
						theEvent.property = "value";
						// IE will throw the change event when we programatically assign an input element value.
						// This is a problem, because we're often assigning a formatted 'display value', and
						// we don't want that value going back into the model.
						// These events seem to be characterized by a type=="focusout"
						// For a normal interactive event we get type=="beforedeactivate"
                        if (theEvent.type && theEvent.type !== "focusout") {
                            assignProperty(theEvent);
						}
					});

			} else if (srcObj instanceof $m.Collection) {
				return new $m.eventListener(
					observer,
					srcObj,
					$m.EventKind.COLLECTION,
					synchCollection
				);
			} else if (srcObj instanceof $m.Entity || srcObj instanceof $m.Property) {
				resolveSelector(targetObj, contextNode).each(function (index, element) {
					observer.targetObject = $(element);
					observer.targetObject.addClass("abacus-bound");
					eventData = $.data(observer.targetObject.get(0), "eventData");
					callback = (eventData && eventData.callback) ? eventData.callback : assignProperty;
					eventListener = new $m.eventListener(
						observer,
						srcProp || srcObj,
						$m.EventKind.PROPERTY,
						callback
					);
					if (!eventData) {
						eventData = { events: [eventListener] };
						$.data(observer.targetObject.get(0), "eventData", eventData);
					} else {
						if (!eventData.events) {
							eventData.events = [eventListener];

						} else {
							eventData.events.push(eventListener);
						}
					}
					if (isField(observer.targetObject)) {
						// Could be bound to a property or an entity
						eventData.source = srcProp || srcObj;
						// When binding to an <input>/<select> element, see if there's a widget
						// adapter bound.
						// Calling assignAdapter() will bind a type-sensitive widget
						// e.g. a datepicker for date fields.
						if (eventData.assignAdapter) {
							eventData.assignAdapter();
						}
					}
					// assigning embedded properties: +{propName}
					if (!eventData.originalContent) {
						eventData.originalContent = {};
					}
					if (targetProp === "html") {
						eventData.originalContent.html = observer.targetObject.html();
					} else {
						eventData.originalContent[targetProp] =
							observer.targetObject.attr('data-bind-' + targetProp);
						if (!eventData.originalContent[targetProp]) {
							eventData.originalContent[targetProp] = observer.targetObject.attr(targetProp);
						}
					}
					if (targetProp === "available") {
						// placeholder is an element we deposit into the DOM to
						// anchor the position of the repeating elements.
						// we need the anchor because the collection could be empty to begin with
						vPlaceholder = $('<div class="abacus-availableAnchor" style="display:none"/>');
						eventData.availableAnchor = vPlaceholder;
						// insert the available placeholder before the target element
						observer.targetObject.before(vPlaceholder);
					}

					return eventListener;
				});
			}
		}

		/**
		 * applyBindings will recursively apply binding specifications to link UI elements to model
		 * properties.
		 * @param bindingDefs -- an array of binding specifications.  Individual bindings
		 * might include nested arrays of binding specs.
		 * @param startEntities -- an array of model.Entity definitions that are in scope of this operation.
		 * @param contextNode -- if this binding is being applied recursively, we need to make sure
		 * that the binding is applied in the correct context -- e.g. could be a binding applied in
		 * the context of a repeating row.  Selectors are applied in context.
		 */
		function applyBindings(bindingDefs, startEntities, context) {
			var entity,
				i,
				j,
				k,
				properties,
				binding,
				newBinding,
				theEvent,
				property,
				selector,
				thisEntity,
				vRepeat,
				repeatData,
				node,
				entities,
				vElements,
				vPlaceholder,
				contextNode,
				eventListener,
				parts,
				targetProp,
				bTwoWay;

			startEntities = startEntities || [];

			if (!bindingDefs[bindingDefs.length - 1]) {
				// for the odd case in IE where the syntax [a,b,]
				// will add an empty object to the end of the array
				bindingDefs.splice(bindingDefs.length - 1, 1);
			}
			for (i = 0; i < bindingDefs.length; i += 1) {
				// slice() will make a copy of the array  This way if the entities array gets
				// extended in the loop, the new entities aren't included for subsequent bindings
				entities = startEntities.slice();
				contextNode = context;
				binding = bindingDefs[i];
				if (binding.entity) {
					// look up the specified entity in the context of the entity array
					// For it to be a valid entity reference, it needs match one of the entities
					// or be a child of one of the entities
					entity = undefined;
					// binding can be specified as A.B
					parts = binding.entity.split(".");
					for (j = 0; j < parts.length; j += 1) {
						entity = locateEntity(entities, parts[j]);
						if (entity === undefined) {
							// TODO: With better bookkeeping we might be able to get rid of this option
							if (!options.allowUnresolvedReferences) {
								jQuery.error("property: " + parts[j] + " could not be resolved");
							}
						}
						if (entity !== undefined) {
							// We have either an entity from the array or else a child of one of the
							// entities.
							if (entity.$name() !== parts[j]) {
								// if a child, get a reference and add it to the list
								entity = entity[parts[j]];
								entities.push(entity);
							}
						}
					}
					// When we encounter an entity definition, we want to make all
					// selector references relative to that entity.
					if (binding.selector) {
						contextNode = resolveSelector(binding.selector, contextNode);
					}
					if (contextNode.length === 0) {
						// until we can resolve a context node, we can't bind anything.
						// This situation can happen when there are multiple calls to
						// bindModel() and the same binding definitions are used to populate
						// different parts of the ui with different entity definitions.
						// So we ignore the current entity and try again with the children.
						if (binding.bind && binding.bind.length > 0) {
							applyBindings(binding.bind, entities, context);
						}
						continue;
					}
				} else {
					// no new entity specified.  Keep working with the entity references
					// already in place.
					entity = entities[entities.length - 1];
				}

				if (entity instanceof $m.Collection && binding.selector) {
					// we're binding UI to a (repeating) collection
					vElements = resolveSelector(binding.selector, contextNode);
					if (!vElements || vElements.length === 0) {
						jQuery.error(binding.selector + " did not resolve to any elements");
					}
					for (k = 0; k < vElements.length; k += 1) {
						// build a binding definition that we can store with the repeating
						// element.  This binding definition will be used when we clone the
						// repeating element and repeat the binding process for the new UI.
						// We remove the entity and selector references, since we don't need to
						// re-resolve them when we clone more instances
						if (vElements.length === 1) {
							vRepeat = vElements;
						} else {
							vRepeat = $(vElements.get(k));
						}
						newBinding = jQuery.extend(true, {}, binding);
						delete newBinding.entity;
						delete newBinding.selector;
						// placeholder is an element we deposit into the DOM to
						// anchor the position of the repeating elements.
						// we need the anchor because the collection could be empty to begin with
						vPlaceholder = $('<div class="abacus-repeater" style="display:none"/>');
						// don't use jQuery replaceWith(), because it won't preserve data
//						vRepeat.replaceWith(vPlaceholder);
						vRepeat.after(vPlaceholder);
						vRepeat.detach();
						repeatData = {
							repeatContent: vRepeat,
							bindingDef: [newBinding],
							array: [],
							collection: entity
						};
						// Set up the element bound to the collection as a prototype instance
						// used to clone more instances bound to the collection.
						$.data(vPlaceholder.get(0), "data-repeat", repeatData);
						// bind the element to the repeating collection
						eventListener = bindProperty(entity, "repeat", vPlaceholder, "repeat", contextNode, entities);
						repeatData.events = [eventListener];

						// synchronize existing instances
						// since we're set up to synchronize on collection change events,
						// use an artificial event to synchronize here.
						for (j = 0; j < entity.$length(); j += 1) {
							theEvent = {};
							theEvent.data = {targetObject: vPlaceholder, entities: entities};
							theEvent.kind = $m.EventKind.ADD;
							theEvent.items = [entity.$item(j)];
							synchCollection(theEvent);
						}
						if (vPlaceholder.parent().get(0).tagName === "SELECT") {
							// If we've just finished updating the definition of a <select>
							// element, let's re-synch with the model so that the current
							// value displays correctly.
							synchElement(vPlaceholder.parent());
						}
					}
					continue;	// to next binding definition
				} else if (!binding.property) {
					// If there are no properties to bind, then simply
					// recurse down to process nested bindings
					if (binding.bind && binding.bind.length > 0) {
						applyBindings(binding.bind, entities, contextNode);
					}
					continue;	// to next binding definition
				}
				// in the case where we are binding the label of a tab or accordion,
				// there could be properties that do not have a match
				// in the html markup.
				selector = binding.selector;
				if (selector === undefined) {
					selector = contextNode;
				}
				node = resolveSelector(selector, contextNode);
				properties = binding.property.split(",");
				for (k = 0; k < properties.length; k += 1) {
					property = properties[k];
					thisEntity = locateEntity(entities, property);
					if (thisEntity === undefined) {
						if (options.allowUnresolvedReferences) {
							continue;
						} else {
							jQuery.error("property: " + property + " not found in any entities");
						}
					}
					if (thisEntity[property]) {
						property = thisEntity[property];
					} else {	// property
						property = thisEntity;
					}
					if (node.length > 0) {
						targetProp = binding.targetProp;
						if (!targetProp) {
							// supply a default property --
							// for fields it is "value" for all other nodes it's "html" (the content)
							if (isField(node)) {
								targetProp = "value";
							} else {
								targetProp = "html";
							}
						}
						bindProperty(thisEntity, property, node, targetProp, contextNode, entities);
						bTwoWay = binding.twoWay;
						// if we're binding to a field value, and twoWay isn't specified, then default to bidirectional.
						if (typeof binding.twoWay === "undefined" && isField(node) && targetProp === "value") {
							bTwoWay = true;
						}
						if (bTwoWay) {
							bindProperty(selector, targetProp, thisEntity, property, contextNode, null);
						}
					}
				}
				// Perform an initial synchronization.
				synchElement(node);

				// recurse down to process nested bindings
				if (binding.bind && binding.bind.length > 0) {
					applyBindings(binding.bind, entities, contextNode);
				}
			}
		}
		function bindModelToMarkup(bindingDefs, startEntities, context) {
			// here is where we do the bulk of the work in binding markup to model
			applyBindings(bindingDefs, startEntities, context);
			if (fieldGroups.length > 0) {
				// If we've got some multi-select groups in the current bindings, then make sure we
				// clean them up if the properties get removed along the way.
				$.each(startEntities, function (index, entity) {
					entity.$addEventListener($m.EventKind.COLLECTION, checkGroups);
				});
			}
			// During binding we'll establish connections between model properties/collections and the markup
			// Now we need to apply the state of the model to the markup
			// We defer this processing because in the case of marking content as available, we have to remove
			// content from the DOM -- which if we did it at binding time would prevent further binding.
			$.each(synchFunctions, function (index, fn) {fn();});
			synchFunctions = [];
		}
		/**
		 * When a model collection changes, update the UI accordingly.
		 * @param theEvent -- a collection change event.
		 */
		synchCollection = function (theEvent) {
			var entities, observer = theEvent.data, vRow, newNode, refNode, theCollection, vNodeToRemove, repeatData;
			vRow = observer.targetObject;
			repeatData = $.data(vRow.get(0), "data-repeat");

			// Find the prototype repeating element.
			switch (theEvent.kind) {
			case $m.EventKind.ADD:
				// retrieve all the entity references that are in context of this reference
				// grab a copy of the entities array so we don't inadvertently modify the original
				entities = observer.entities.slice();
				entities.push(theEvent.items[0]);

				theCollection = repeatData.array;
				// TODO Assume append for now.
				newNode = cloneWithAdapters(repeatData.repeatContent);
				refNode = vRow;
				if (theCollection.length > 0) {
					refNode = theCollection[theCollection.length - 1];
				}
				refNode.after(newNode);
				bindModelToMarkup(repeatData.bindingDef, entities, newNode);
				theCollection.push(newNode);
				break;
			case $m.EventKind.REMOVE:
				vNodeToRemove = repeatData.array[theEvent.location];
				// unbind everything associated with this fragment of the DOM
				destroyBindings(vNodeToRemove);
				vNodeToRemove.remove();
				repeatData.array.splice(theEvent.location, 1);
				break;
			case $m.EventKind.REPLACE:
			case $m.EventKind.UPDATE:
				break;
			}
		};

		/**
		 * make sure the current element is up-to-date with values from the model
		 * @param node the element to synchronize
		 */

		synchElement = function (node) {
			var selected, storedEvents, j;
			if (node.length > 0) {
				selected = $.data(node.get(0), "eventData");
				storedEvents = selected && selected.events ? selected.events : [];
				for (j = 0; j < storedEvents.length; j += 1) {
					synchFunctions.push(storedEvents[j].synchronize);
				}
			}
		};

		function destroyBindings(root) {
			$(root).find(".abacus-bound,.abacus-adapter").each(function (index, element) {
				$m.unbind(element);

			});
			// we reverse the order of results so that nested repeats get unbound before their parent
			$($(root).find(".abacus-repeater").get().reverse()).each(function (index, element) {
				$m.unbind(element);
			});
		}
		// TODO: I don't think this really works to bind to more than one place in the
		// markup. So either make it work or don't use "each". Just process the first.
		this.each(function () {
			$m = $.abacus;
			var models;
			if (options === "destroy") {
				fieldGroups = [];
				destroyBindings(this);
			} else {
				// The abacus model is inert until explicitly enabled
				$m.enable(true);

				if (!options.bindings) {
					// Scan source for bindings
					// and populate options.bindings
					options.bindings = [];
					$(this).abacusBindings(options.bindings);
				}
				models = options.data instanceof Array ? options.data : [options.data];
				bindModelToMarkup(options.bindings, models, $(this));
			}
		});
	};
}(jQuery));
