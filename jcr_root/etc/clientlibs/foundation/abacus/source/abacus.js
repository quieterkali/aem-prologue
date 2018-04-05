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

/*global window, Klaas, alert, jQuery, formatters */

var abacus = jQuery.abacus = (function ($) {
	var $modelName = "abacus",
		nInsideConstructor = 0,	// don't want to emit events until the construction is complete.
		eventQueue = [],
		suspendQueueCount = 0,
		eventPrototype,
		registeredObjects = {},
		$m;

	function modelFromJSON(model, json) {
		var prop, t, p, definition;
		for (prop in json) {
			if (json.hasOwnProperty(prop)) {
				p = null;
				definition = {};
				model[prop] = definition;
				t = typeof json[prop];
				switch (typeof json[prop]) {
				case "function":
					break;
				case "object":
					if (json[prop] instanceof Array) {
						definition.$collectionType = {};
						if (json[prop].length > 0) {
							definition.$collectionType.$name = "row";
							modelFromJSON(definition.$collectionType, json[prop][0]);
						}
					} else if (json[prop] instanceof Date) {
						// provide some default masks for date properties
						definition.$style = {editMask: 'MM-D-YYYY', displayMask: 'MMM D, YYYY'};
						definition.$propertyType = "date";

					} else if (json[prop] instanceof String) {
						definition.$propertyType = "string";

					} else if (json[prop] instanceof Number) {
						definition.$propertyType = "number";

					} else if (json[prop] instanceof Boolean) {
						definition.$propertyType = "boolean";

					} else {
						modelFromJSON(definition, json[prop]);
					}
					break;
				case "string":
				case "number":
				case "boolean":
					definition.$propertyType = t;
					break;
				}
			}
		}
	}
	function processQueue() {
		var i, obj, evt, parent, eventToProcess;
		if (suspendQueueCount) {
			return;
		}
		suspendQueueCount += 1;
		try {
			while (eventQueue.length > 0) {
				eventToProcess = eventQueue.shift();
				obj = eventToProcess.obj;
				evt = eventToProcess.evt;
				for (i = 0; i < obj.$listeners.length; i += 1) {
					if (obj.$listeners[i].type === evt.type) {
						obj.$listeners[i].listener(evt);
					}
				}
				if (obj === evt.source) {
					// now bubble up
					parent = evt.source.$parent();
					while (parent) {
						parent.$dispatchEvent(evt);
						parent = parent.$parent();
					}
				}
			}
		} catch (e) {
			suspendQueueCount -= 1;
			$.error(e.toString());
		}
		suspendQueueCount -= 1;
	}
	function NullFormatter() {
		this.set_formatString = function (sMask) {
		};
		this.format = function (sValue) {
			return sValue;
		};
	}

	// TODO: eventually we should stop using the dumb AS formatters and use the ones ported from XFA.
	// Then we have a single formatter class and don't need to figure it out ourselves.
	function getFormatter(mask, sValue) {
		var df;
		// if they haven't included our formatters, then provide
		// default processing
		if (typeof formatters === "undefined") {
			return new NullFormatter();
		}
		if (sValue instanceof Date) {
			df = new formatters.DateFormatter();
		} else if (typeof sValue === "number") {
			if (mask.indexOf("$") !== -1) {
				df = new formatters.CurrencyFormatter();
			} else {
				df = new formatters.NumberBase();
			}
		}
		return df;
	}
	function removeModelClasses($element, bDeep) {
		var i, classes = $element.attr("class").split(" ");
		for (i = 0; i < classes.length; i += 1) {
			if (classes[i] !== "abacus-adapter") {
				if (classes[i].indexOf("abacus-") !== -1) {
					$element.removeClass(classes[i]);
				}
			}
		}
		if (bDeep) {
			$element.find(".abacus-bound").each(
				function () {
					removeModelClasses($(this));
				}
			);
		}
	}
	function propertyEvent(oldValue, newValue) {
		// don't issue change events while Entity instances are being created.
		if (nInsideConstructor === 0) {
			this.$dispatchEvent(new $m.PropertyEvent($m.EventKind.UPDATE, this, oldValue, newValue));
		}
	}
	function synchToData(newJSON) {
		var i,
			rowType = this.$$private.definition.$collectionType,
			oldJSON = this.$$private.json,
			parent = this.$$private.parent;

		newJSON = newJSON || [];

		// delete old values that won't be overwritten
		if (oldJSON) {
			while (oldJSON.length > newJSON.length) {
				i = oldJSON.length - 1;
				if (this[i]) {
					this.$remove(i);
				}
			}
		}
		this.$$private.json = newJSON;

		if (parent) {
			parent.$$private.json[this.$name()] = newJSON;
		}

		for (i = 0; i < this.$$private.json.length; i += 1) {

			if (this[i.toString()]) {
				// overwrite existing value
				this[i].$value(this.$$private.json[i]);
				if (this[i] instanceof $m.Property) {
					if (oldJSON[i] !== this.$$private.json[i]) {
						propertyEvent.call(this[i], oldJSON[i], this.$$private.json[i]);
					}
				}

			} else {
				if (rowType.$propertyType === "entity") {
					this[i] = new $m.Entity(rowType, i.toString(), this.$$private.json[i], this);

				} else if (rowType.$propertyType === "collection") {
					this[i] = new $m.Collection(rowType, i.toString(), this, this.$$private.json[i]);

				} else {
					this[i] = new $m.Property(rowType, i.toString(), this);
				}
			}
		}
		if (this.$$private.definition.$initial) {
			for (i = this.$length(); i < this.$$private.definition.$initial; i += 1) {
				this.$append();
			}
		}

	}
	function jsonValue(prop, parent) {
		if (prop.$isAvailable()) {
			return parent.$$private.json[prop.$name()];
		}
		else {
			return null;
		}
	}
	function setDefaultValue() {
		var startValue, parent = this.$parent();
		if (parent) {
			startValue = jsonValue(this, this.$parent());
		}
		if (this instanceof $m.Property) {
			if (typeof this.$$private.definition.$value !== "undefined" &&
					(startValue === null || typeof startValue === "undefined")) {
				this.$value(this.$$private.definition.$value);
			} else if (typeof startValue === "undefined") {
				this.$value(null);
			}
			propertyEvent.call(this, null, this.$value());
		} else if (this instanceof $m.Entity) {
			startValue = startValue || {};
			this.$value(startValue);
		} else if (this instanceof $m.Collection) {
			synchToData.call(this, startValue || []);
		}
	}
	// Since definitions are JSON, Functions inside definitions can be expressed as:
	// - a function
	// - an array of arguments to pass to a Function constructor
	// - an expression inside a with block that holds context.
	function getFunction(definition, functionName) {
		var functionDef = definition[functionName];
		if (!functionDef) {
			return undefined;
		}
		if (typeof functionDef === "function") {
			return functionDef;
		}
		// convert a string or an array to a function
		// use a fully specified function definition
		if (functionDef instanceof Array && functionDef.length === 2) {
			definition[functionName] = new Function(functionDef[0], functionDef[1]);
		} else {	// assume string
			// If they've provided only a string, assume it's the contents of a with block.
			// It must have a return statement.
			definition[functionName] = new Function("$c", "with ($c) {\n" + functionDef.toString() + "\n}");
		}
		return definition[functionName];
	}
	function isAvailable(newAvailable) {
		var oldAvailable, i;
		if (typeof newAvailable !== "undefined") {
			newAvailable = !!newAvailable;	// type conversion to boolean
			oldAvailable = !this.$$private.$unavailable;
			if (oldAvailable !== newAvailable) {
				propertyEvent.call(this, this.$value(), this.$value());
				this.$$private.$unavailable = !newAvailable;
				// make sure data behaves according to availability
				// if the property is unavailable, we don't want the data to show up
				if (this.$$private.$unavailable) {
					this.$$private.previousData = this.$parent().$$private.json[this.$name()];
					delete this.$parent().$$private.json[this.$name()];
				} else {
					if (typeof (this.$parent().$$private.json[this.$name()]) === "undefined") {
						// pretend we're inside a constructor so that a change event doesn't fire.
						// A change event will fire elsewhere.
						nInsideConstructor += 1;
						if (this.$$private.previousData) {
							this.$value(this.$$private.previousData);
							delete this.$$private.previousData;
						} else {
							setDefaultValue.call(this);
							if (this.$$private.definition.$initial) {
								for (i = this.$length(); i < this.$$private.definition.$initial; i += 1) {
									this.$append();
								}
							}
						}
						nInsideConstructor -= 1;
					}
					$m.Calculator.execCalculate(this);
					$m.Calculator.execValidate(this);
				}
			}
		}
		return !this.$$private.$unavailable;
	}

	function objectType(definition) {
		var p,
			propertyType = definition.$propertyType || (definition.$collectionType ? "collection" : undefined);
		if (!propertyType) {
			for (p in definition) {
				if (definition.hasOwnProperty(p)) {
					if (p.indexOf("$") !== 0) {
						propertyType = "entity";
						break;
					}
				}
			}
			if (!propertyType) {
				propertyType = "string";
			}
		}
		// Make sure that $propertyType is always explicitly specified.
		definition.$propertyType = propertyType;
		return propertyType;
	}
	function EventListener() {
		this.$addEventListener = function (type, listener) {
			this.$listeners.push({type: type, listener: listener});
		};
		this.$dispatchEvent = function (newEvent) {
			$m.queueEvent(this, newEvent);
		};
		this.$removeEventListener = function (type, listener) {
			var i;
			for (i = 0; i < this.$listeners.length; i += 1) {
				if (this.$listeners[i].type === type && this.$listeners[i].listener === listener) {
					this.$listeners.splice(i, 1);
				}
			}
			return true;
		};
	}
	eventPrototype = new EventListener();
	function PropertyBase() {

        this.equals = function(rhs) {
            // if we have a numeric
            if (this.$value == rhs) {
                return true;
            }

            // if we have a string value
            if (this.toString() == rhs) {
                return true;
            }

            return false;
        };
        this.notEquals = function(rhs) {
            return !this.equals(rhs);
        };
		this.toString = function () {
			if (this.$value() === null) {
				return "";
			} else {
				if (this.$propertyType() === "date") {
					return $m.dateToISO(this.$value());
				}
				return this.$value().toString();
			}
		};
		this.$available = function (newFunc) {
			if (typeof newFunc === "undefined") {
				return getFunction(this.$$private.definition, "$available");
			} else {
				// TODO: not sure if we should support adding a calc at runtime...
				this.$$private.definition.$available = newFunc;
			}
		};
		this.$calculate = function (newFunc) {
			if (typeof newFunc === "undefined") {
				return getFunction(this.$$private.definition, "$calculate");
			} else {
				// TODO: not sure if we should support adding a calc at runtime...
				this.$$private.definition.$calculate = newFunc;
			}
		};
		this.valueOf = function () {
			return this.$value();
		};
		this.$isAvailable = function (newAvailable) {
			return isAvailable.call(this, newAvailable);
		};
		this.$isValid = function (newValid) {
			if (typeof newValid !== "undefined") {
				this.$$private.$invalid = !newValid;
			}
			return !this.$$private.$invalid && !this.$$private.missingValue;
		};
		this.$name = function (newName) {
			if (typeof newName !== "undefined") {
				this.$$private.$name = newName;
			}
			return this.$$private.$name || this.$$private.definition.$name;
		};
		this.$parent = function () {
			return this.$$private.parent;		// readonly
		};
		this.$propertyType = function () {
			return this.$$private.definition.$propertyType || "string";
		};
		this.$required = function (newValue) {
			if (typeof newValue !== "undefined") {
				this.$$private.$required = newValue;
			}
			return this.$$private.$required || this.$$private.definition.$required;
		};
		this.$style = function (newStyle) {
			if (typeof newStyle !== "undefined") {
				// TODO: should we change the overrides?  or the root definition?
				if (!this.$$private.definition.$style) {
					this.$$private.definition.$style = {};
				}
				jQuery.extend(this.$$private.definition.$style, newStyle);
			}
			return this.$$private.$style || this.$$private.definition.$style || {};
		};
		this.$validate = function (newFunc) {
			if (typeof newFunc === "undefined") {
				return getFunction(this.$$private.definition, "$validate");
			} else {
				// TODO: not sure if we should support adding a calc at runtime...
				this.$$private.definition.$validate = newFunc;
			}
		};
		this.$value = function (newValue) {
			var oldValue, parent = this.$parent();
			if (typeof newValue === "undefined") {
				$m.Calculator.trackDependency(this);
				return jsonValue(this, parent);
			}
			// we want to work with a primitive value.
			if (newValue !== null) {
				newValue = newValue.valueOf();
			}
			if (newValue !== null) {
				switch (this.$$private.definition.$propertyType) {
				case "number":
					newValue = newValue === "" ? null : +newValue;
					break;

				case "boolean":
					// TODO: Allow null for Boolean?
					newValue = newValue ? true : false;
					break;

				case "date":
					newValue = newValue === "" ? null : new Date(newValue);
					break;

				case "string":
					newValue = newValue === "" ? null : newValue.toString();
					break;

				case "string[]":
					newValue = newValue instanceof Array ? newValue : [newValue];
					break;

				default:
				}
			}
			oldValue = jsonValue(this, parent);
			// use valueOf() so that dates compare well.
			if (!(oldValue === newValue || (oldValue instanceof Date && oldValue.valueOf() === newValue.valueOf()))) {
				parent.$$private.json[this.$name()] = newValue;
				propertyEvent.call(this, oldValue, newValue);

				$m.Calculator.execValidate(this);
			}
		};
	}
	PropertyBase.prototype = eventPrototype;
	function Property(definition, name, parent) {
		this.$listeners = [];

		this.$$private = {$name: name, definition: definition, parent: parent};

		// children of a collection need to be able to return their index inside the collection.
		if (parent && parent instanceof $m.Collection) {
			this.$index = function () {
				return +this.$name();
			};
		}

		setDefaultValue.call(this);
	}
	Property.prototype = new PropertyBase();

	function EntityBase() {
		this.$available = function (newFunc) {
			if (typeof newFunc === "undefined") {
				return getFunction(this.$$private.definition, "$available");
			} else {
				// TODO: not sure if we should support adding a calc at runtime...
				this.$$private.definition.$available = newFunc;
			}
		};

		this.$isAvailable = function (newAvailable) {
			return isAvailable.call(this, newAvailable);
		};
		this.$name = function (newName) {
			if (typeof newName !== "undefined") {
				this.$$private.$name = newName;
			}
			return this.$$private.$name || this.$$private.definition.$name;
		};
		this.$parent = function () {
			return this.$$private.parent;		// readonly
		};
		this.$propertyType = function () {
			return this.$$private.definition.$propertyType || "entity";
		};
		this.$required = function (newValue) {
			if (typeof newValue !== "undefined") {
				this.$$private.$required = newValue;
			}
			return this.$$private.$required || this.$$private.definition.$required;
		};
		//TODO: Does style make sense for an entity?
		this.$style = function (newStyle) {
			if (typeof newStyle !== "undefined") {
				if (!this.$$private.$style) {
					this.$$private.$style = jQuery.extend(this.$$private.definition.$style);
				}
				this.$$private.$style = jQuery.extend(newStyle);
			}
			return this.$$private.$style || this.$$private.definition.$style || {};
		};
		this.$properties = function () {
			var p, properties = [];
			for (p in this) {
				if (this.hasOwnProperty(p)) {
					if (p.charAt(0) !== '$' && p !== "_super") {
						properties.push(p);
					}
				}
			}
			return properties;
		};
		this.valueOf = function () {
			return this.$value();
		};
		this.$value = function (newJSON) {
			var p, propertyType, newProp, definition = this.$$private.definition,	parent = this.$parent();

			if (newJSON) {
				if (!$.isPlainObject(newJSON)) {
					$.error("Expecting " + this.$name() + " Entity value to be a plain object");
				}

				try {
					$m.suspendQueue(true);

					delete this.$$private.json;
					if (parent) {
						this.$$private.json = parent.$$private.json[this.$name()] = newJSON;
					} else {
						this.$$private.json = newJSON;
					}
					for (p in definition) {
						if (definition.hasOwnProperty(p)) {
							if (p.indexOf("$") !== 0) {
								if (this[p]) {
									// set default value should initialize from the value in the parent --
									// if defined.  If not, use a default.
									setDefaultValue.call(this[p]);
								} else {
									propertyType = objectType(definition[p]);
									if (propertyType === "entity") {
										if (!this.$$private.json[p]) {
											this.$$private.json[p] = {};
										}
										newProp = new $m.Entity(definition[p], p, {}, this);

									} else if (propertyType === "collection") {
										if (!this.$$private.json[p]) {
											this.$$private.json[p] = [];
										}
										newProp = new $m.Collection(definition[p], p, this, this.$$private.json[p]);
									} else {
										if (typeof this.$$private.json[p] === "undefined") {
											this.$$private.json[p] = null;
										}
										newProp = new $m.Property(definition[p], p, this);
									}
									this[p] = newProp;
								}
							}
						}
					}
					$m.suspendQueue(false);
				} catch (err) {
					$m.suspendQueue(false);
					$.error(err.toString());
				}
				if (!this.$parent()) {
					$m.Calculator.execAvailable(this);
					$m.Calculator.execCalculate(this);
					$m.Calculator.execValidate(this);
				}

			} else {
				return this.$$private.json || {};
			}
		};
	}
	EntityBase.prototype = eventPrototype;
	function Entity(definition, propertyName, json, parent) {
		nInsideConstructor += 1;

		if (typeof definition !== "object") {
			jQuery.error("entity definition must be an object -- not a primitive");
		}
		this.$listeners = [];
		this.$$private =	{	definition: definition,
								parent: parent || null
							};
		if (propertyName) {
			this.$$private.$name = propertyName;
		}

		// children of a collection need to be able to return their index inside the collection.
		if (parent && parent instanceof $m.Collection) {
			this.$index = function () {
				return +this.$name();
			};
		}
		this.$value(json || {});
		nInsideConstructor -= 1;
		if (!this.$parent()) {
			$m.register(this);
			$m.Calculator.execAvailable(this);
			$m.Calculator.execCalculate(this);
			$m.Calculator.execValidate(this);
			this.$addEventListener($m.EventKind.PROPERTY, $m.Calculator.recalculate);
			this.$addEventListener($m.EventKind.COLLECTION, $m.Calculator.recalculate);
		}
	}
	Entity.prototype = new EntityBase();

	/*
	 * Collections are smart in that they understand what kind of members are contained in the collection.
	 * We can have collections of Entity, Property and by Collection
	 * A collection will keep a prototype instance of the member to be used for schema queries and to use
	 * as the basis for creating new members.
	 * @param definition - the JSON definition of the collection
	 * @param propertyName -- the name of the collection
	 * @param parent - the parent object -- either an Entity or another Collection
	 * @param json - the data storage for this collection. Must be an array object
	 */
	function CollectionBase() {
		this.$append = function (json) {
			var nIndex, newMember, rowType = this.$$private.definition.$collectionType;
			if (typeof json === "undefined") {
				if (rowType.$propertyType === "entity") {
					json = {};
				} else if (rowType.$propertyType === "collection") {
					json = [];
				} else {
					json = null;
				}
			}

			this.$$private.json.push(json);
			nIndex = this.$length() - 1;
			if (rowType.$propertyType === "entity") {
				newMember = new $m.Entity(rowType, nIndex.toString(), this.$$private.json[nIndex], this);

			} else if (rowType.$propertyType === "collection") {
				newMember = new $m.Collection(rowType, nIndex.toString(), this, this.$$private.json[nIndex]);
			} else {
				newMember = new $m.Property(rowType, nIndex.toString(), this);
			}
			// simulate an array by using numeric object properties
			this[nIndex.toString()] = newMember;
			this.$dispatchEvent(new $m.CollectionEvent($m.EventKind.ADD, this, nIndex, -1, [newMember]));
			if (nInsideConstructor === 0) {
				$m.Calculator.execAvailable(newMember);
				$m.Calculator.execCalculate(newMember);
				$m.Calculator.execValidate(newMember);
			}
			return newMember;
		};
		this.$available = function (newFunc) {
			if (typeof newFunc === "undefined") {
				return getFunction(this.$$private.definition, "$available");
			} else {
				// TODO: not sure if we should support adding a calc at runtime...
				this.$$private.definition.$available = newFunc;
			}
		};
		this.$isAvailable = function (newAvailable) {
			return isAvailable.call(this, newAvailable);
		};
		this.$rowName = function () {
			return this.$$private.definition.$collectionType.$name || "row";
		};
		this.$value = function (newJSON) {
			if (newJSON) {
				if (!(newJSON instanceof Array)) {
					jQuery.error("expecting an array to set the value of collection: " + this.$name());
				}
				try {
					$m.suspendQueue(true);
					synchToData.call(this, newJSON);
				} catch (err) {
					$m.suspendQueue(false);
					$.error(err.toString());
				}
				$m.suspendQueue(false);

			} else {
				return this.$$private.json;
			}
		};
		this.$name = function (newName) {
			if (typeof newName !== "undefined") {
				this.$$private.$name = newName;
			}
			return this.$$private.$name || this.$$private.definition.$name;
		};
		this.$parent = function () {
			return this.$$private.parent;		// readonly
		};
		this.$propertyType = function () {
			return "collection";
		};
		this.$length = function (newLength) {
			if (typeof newLength === "undefined") {
				$m.Calculator.trackDependency(this);
			} else {
				while (this.$length() > newLength) {
					this.$remove(this.$length() - 1);
				}
				while (this.$length() < newLength) {
					this.$append();
				}
			}
			return this.$$private.json.length;
		};
		this.$item = function (nOffset) {
			// array of properties
			return this[nOffset.toString()];
		};
		this.$remove = function (nIndex) {
			var deletedRow = this.$item(nIndex), i, len;
			nIndex = +nIndex;// make sure we have an integer.
			this.$$private.json.splice(nIndex, 1);
			delete this[nIndex.toString()];
			// reset the cached index numbers of the rows.
			len = this.$length();
			for (i = nIndex; i < len; i += 1) {
				this[i.toString()] = this[(i + 1).toString()];
				this.$item(i).$name(i.toString());
			}
			delete this[len];
			// dispatch the collection remove event to notify listeners.
			this.$dispatchEvent(new $m.CollectionEvent($m.EventKind.REMOVE, this, nIndex, nIndex, [deletedRow]));

			return deletedRow;
		};
	}
	CollectionBase.prototype = eventPrototype;
	function Collection(definition, propertyName, parent, json) {
		var This = this;
		this.$listeners = [];

		nInsideConstructor += 1;
		this.$$private =	{	$name: propertyName,
								definition: definition,
								parent: parent
							};

		// make sure the definiton of the collection type has a type defined
		// We need the collection type in order to create new rows with the correct type
		objectType(definition.$collectionType);

		function LengthObj(collection) {
			this.valueOf = function () {
				return collection.$length();
			};
		}
		// using a length object will allow us to track dependencies on this collection
		// but bummer that if (collection.length) will always be true.
		// use either if (collection.length.valueOf()) or if (collection.$length())
		this.length = new LengthObj(This);

		// children of a collection need to be able to return their index inside the collection.
		if (parent && parent instanceof $m.Collection) {
			this.$index = function () {
				return +this.$name();
			};
		}

		synchToData.call(this, json);

		nInsideConstructor -= 1;
	}
	Collection.prototype = new CollectionBase();

	$m = {
		register: function (object) {
			if (object instanceof $m.Entity || object instanceof $m.Property || object instanceof $m.Collection) {
				registeredObjects[object.$name()] = object;
			} else {	// assume a plain map: name/value pairs
				$.each(object, function (name, value) {
					registeredObjects[name] = value;
				});
			}
		},

		rename: function (newName) {
			if ((window[newName] && (window[newName] !== $.abacus)) || ($[newName] && ($[newName] !== $.abacus))) {
				throw "Cannot rename package to: " + newName + ".  Naming conflict";
			}
			if (window[$modelName]) {
				window[$modelName] = undefined;
			}
			$modelName = newName;
			window[$modelName] = $.abacus;
		},
		enable: function (bEnable) {
			$m.Calculator.suspendCalcs(!bEnable);
		},
		/**
		 * The Calculator is the object that manages the execution of calculation scripts in the modeall.
		 *
		 */
		Calculator: (function () {
			// private members
			var calcStack = [],
				validateStack = [],
				availableStack = [],
				suspendCalcCount = 1;	// Start with caculations suspended.
										//This way inter-dependent entities can be created without calculation errors
				function pushCalc(obj) {
				if ($.inArray(obj, calcStack) === -1) {
					calcStack.push(obj);
				}
			}
			function pushValidate(obj) {
				if (obj.$value() !== null || !obj.$isValid()) {	// execute validation scripts only for non-null fields.
					if ($.inArray(obj, validateStack) === -1) {
						validateStack.push(obj);
					}
				}
			}
			function pushAvailable(obj) {
				if ($.inArray(obj, availableStack) === -1) {
					availableStack.push(obj);
				}
			}
			function execPending(sType) {
				var context, parent, p, props, i, currentCopy, result,
					retryStack = [],
					phase, RETRY_PHASE = 1,
					method = "$calculate",
					stack = calcStack;
				if (sType === "validate") {
					stack = validateStack;
					method = "$validate";
				} else if (sType === "available") {
					stack = availableStack;
					method = "$available";
				}
				if (suspendCalcCount) {
					return;
				}
				suspendCalcCount += 1;
				for (phase = 0; phase < RETRY_PHASE + 1; phase += 1) {
					while (stack.length > 0) {
						this.currentProperty = stack.shift();

						if (sType === "available" || this.currentProperty.$isAvailable()) {
							context = {};
							context[this.currentProperty.$name()] = this.currentProperty;
							parent = this.currentProperty.$parent();
							while (parent) {
								context[parent.$name()] = parent;
								if (parent instanceof $m.Entity) {
									props = parent.$properties();
									for (i = 0; i < props.length; i += 1) {
										p = props[i];

										// if this object name is already in scope, don't overwrite it.
										if (!context[p]) {
											context[p] = parent[p];
										}
									}
									$.each(registeredObjects, function (key, value) {
										context[key] = value;
									});
								}
								parent = parent.$parent();
								if (parent instanceof $m.Collection) {
									parent = parent.$parent();
								}
							}
							try {
								result = this.currentProperty[method]().call(this.currentProperty, context);
							} catch (err) {
								if (phase === RETRY_PHASE) {
									alert(err.toString());
								} else {
									retryStack.push(this.currentProperty);
									this.currentProperty = null;
								}
							}
							// turn off the current property tracking now so that the events
							// trigged by further processing don't show up as dependents.
							if (this.currentProperty) {
								currentCopy = this.currentProperty;
								this.currentProperty = null;
								if (sType === "calculate") {
									if (typeof result === "undefined") {
										result = null;
									}
									currentCopy.$value(result);
								} else if (sType === "validate") {
									// Store the negative valid property so that the absence of the property means "valid".
									currentCopy.$isValid(result);

									// TODO: eventually we throw this only when the state changes.
									// means we have to start carrying valid state
									if (result || (currentCopy.$value() === null && !currentCopy.$required())) {
										currentCopy.$dispatchEvent(new $m.validEvent($m.EventKind.VALID, currentCopy, currentCopy.$style().caption || ""));
									} else {
										if (!currentCopy.$style().error) {
											currentCopy.$style({error: "Invalid entry"});
										}
										currentCopy.$dispatchEvent(new $m.validEvent($m.EventKind.INVALID, currentCopy, currentCopy.$style().error));
									}
								}
								if (sType === "available") {
									if (typeof result === "undefined") {
										result = false;
									}
									currentCopy.$isAvailable(result);
								}
							}
						}
					}
					// once more try with any calcs that failed the first time around
					stack = retryStack;
				}
				suspendCalcCount -= 1;
			}
			return {	// public interface
				execCalculate: function (obj) {
					this.exec(obj, "calculate");
				},
				execValidate: function (obj) {
					this.checkRequired(obj);

					this.exec(obj, "validate");
				},
				execAvailable: function (obj) {
					this.exec(obj, "available");
				},
				checkRequired: function (obj) {
					var i, props, v;
					// calculate all nested objects
					if (obj instanceof $m.Entity) {
						props = obj.$properties();
						for (i = 0; i < props.length; i += 1) {
							this.checkRequired(obj[props[i]]);
						}
					} else if (obj instanceof $m.Collection) {
						for (i = 0; i < obj.$length(); i += 1) {
							this.checkRequired(obj.$item(i));
						}
					} else {	// Property
						if (obj.$required()) {
							v = obj.$value();
							if (v === null || v === "" || typeof v === "undefined") {
								obj.$$private.missingValue = true;
								if (!obj.$style().error) {
									obj.$style({error: "You must supply a value"});
								}
								obj.$dispatchEvent(new $m.validEvent($m.EventKind.INVALID, obj, obj.$style().error));
							} else {
								obj.$$private.missingValue = false;

								obj.$dispatchEvent(new $m.validEvent($m.EventKind.VALID, obj, obj.$style().caption || ""));
							}
						}
					}
				},
				// exec is a general purpose function that execs either
				// calculations or validations or availability.
				exec: function (obj, sType, bNested) {
					var i, props;
					// calculate all nested objects
					if (obj instanceof $m.Entity) {
						if (obj.$available()) {
							pushAvailable(obj);
						}
						props = obj.$properties();
						for (i = 0; i < props.length; i += 1) {
							this.exec(obj[props[i]], sType, true);
						}
					} else if (obj instanceof $m.Collection) {
						if (obj.$available()) {
							pushAvailable(obj);
						}
						for (i = 0; i < obj.$length(); i += 1) {
							this.exec(obj.$item(i), sType, true);
						}
					} else {	// Property
						if (sType === "calculate") {
							if (!obj.$calculate()) {
								return;
							}
							pushCalc(obj);
						} else if (sType === "validate") {
							if (!obj.$validate()) {
								return;
							}
							pushValidate(obj);
						} else if (sType === "available") {
							if (!obj.$available()) {
								return;
							}
							pushAvailable(obj);
						}
					}
					// bNested prevents us from executing all the pending calcs until the
					// pending list is complete.
					if (!bNested) {
						execPending.call($m.Calculator, sType);
					}
				},
				currentProperty: null,

				suspendCalcs: function (bOn) {
					if (bOn) {
						suspendCalcCount += 1;
					} else {
						if (suspendCalcCount > 0) {
							suspendCalcCount -= 1;
						}
						execPending.call($m.Calculator, "calculate");
						execPending.call($m.Calculator, "validate");
						execPending.call($m.Calculator, "available");
					}
				},

				trackDependency: function (prop) {
					var dependencies;
					// there's no active calculation or we're examining our own value -- nothing to track
					if (!this.currentProperty || prop === this.currentProperty) {
						return;
					}

					dependencies = prop.$$private.dependencies || [];
					prop.$$private.dependencies = dependencies;
					if ($.inArray(this.currentProperty, dependencies) === -1) {
						dependencies.push(this.currentProperty);
					}
				},

				recalculate: function (theEvent) {
					var i, property, dependencies;

					property = theEvent.source;
					dependencies = property.$$private.dependencies || null;
					if (dependencies) {
						for (i = 0; i < dependencies.length; i += 1) {
							if (dependencies[i].$calculate && dependencies[i].$calculate()) {
								pushCalc(dependencies[i]);
							}
							if (dependencies[i].$validate && dependencies[i].$validate()) {
								pushValidate(dependencies[i]);
							}
							if (dependencies[i].$available()) {
								pushAvailable(dependencies[i]);
							}
						}
					}
					// calculate availability first -- unavailable fields don't get calculated/validated
					execPending.call($m.Calculator, "available");
					execPending.call($m.Calculator, "calculate");
					execPending.call($m.Calculator, "validate");
				}
			};
		}()),

		/**
		 * A Property represents a primitive value stored either in an Entity or in a Collection
		 */
		Property: Property,
		Entity: Entity,
		Collection: Collection,
		EntityFromJSON: function (modelName, json) {
			// Build a model definition from sample json data.
			var modelDefinition = {$name: modelName}, newModelInstance;
			modelFromJSON(modelDefinition, json);

			newModelInstance = new $m.Entity(modelDefinition);
			newModelInstance.$value(json);
			return newModelInstance;
		},
		getCount: function () {
			return suspendQueueCount;
		},
		suspendQueue: function (bOn) {
			if (bOn) {
				suspendQueueCount += 1;
			} else {
				suspendQueueCount -= 1;
				if (suspendQueueCount === 0) {
					processQueue();
				}
			}
		},
		queueEvent: function (obj, theEvent) {
			eventQueue.push({obj: obj, evt: theEvent});

			processQueue();
		},
		StyleValidator: function (validatorFunction) {
			this.validate = validatorFunction;
		},
		EventKind: {
			COLLECTION: "collectionChange",
			PROPERTY: "propertyChange",
			VALIDATION: "validationResult",
			ADD: "add",
			REMOVE: "remove",
			REPLACE: "replace",
			UPDATE: "update",
			INVALID: "invalid",
			VALID: "valid"
		},
		PropertyEvent: function (kind, source, oldValue, newValue) {
			this.type = $m.EventKind.PROPERTY;
			this.kind = kind;
			this.source = source;
			this.oldValue = oldValue;
			this.newValue = newValue;
		},
		CollectionEvent: function (kind, src, location, oldLocation, items) {
			this.type = $m.EventKind.COLLECTION;
			this.kind = kind || null;
			this.source = src;
			this.location = location;
			this.oldLocation = oldLocation || -1;
			this.items =  items || null;
		},
		validEvent: function (kind, src, message) {
			this.type = $m.EventKind.VALIDATION;
			this.kind = kind;
			this.field = src.$name();
			this.message = message;
			this.source = src;
		},
		invalidProperties: function (obj) {
			var errors = [], len, item, i;
			if (obj instanceof $m.Entity) {
				$.each(obj.$properties(), function(idx, prop) {
					errors = errors.concat($m.invalidProperties(obj[prop]));
				});
			} else if (obj instanceof $m.Collection) {
				for (i = 0, len = obj.$length(); i < len; i += 1) {
					errors = errors.concat($m.invalidProperties(obj.$item(i)));
				}
			} else if (obj instanceof $m.Property) {
				if (!obj.$isValid()) {
					errors.push(obj);
				}
			}
			return errors;
		},
		getEditValue: function (property) {
			var style = property.$style(),
				sValue = property.$value(),
				df;

			if (typeof sValue === "undefined") {
				return "";
			}

			if (style && style.editMask) {
			// TODO: We'd need some code here to figure out the class of picture format -- date/numeric/text
			// and format accordingly.  For now we handle only dates.
				df = getFormatter(style.editMask, sValue);
				df.set_formatString(style.editMask);
				return df.format(sValue);
			}
			return sValue;
		},
		getDisplayValue: function (property) {
			// TODO: We'd need some code here to figure out the class of picture format -- date/numeric/text
			// and format accordingly.  For now we handle only dates.
			var sValue, style, df;
			if (property.$propertyType() === "string[]") {
				return property.toString();
			}

			sValue = property.valueOf();
			style = property.$style();

			if (typeof sValue === "undefined" || sValue === null) {
				return "";
			}
			if (style && style.displayMask) {
				df = getFormatter(style.displayMask, sValue);

				df.set_formatString(style.displayMask);
				// should be using the edit format to parse...
			//				myPerson.birthDate = DateFormatter.parseDateString(entity._model.getValue(property);
				return df.format(sValue);
			}
			return sValue;
		},
		eventListener: function (observer, srcObj, eventName, fn) {
			var This = this, prop, registered;
			// make a copy of the observer so it's frozen -- won't be modified by what happens in closure scope
			this.observer = {};
			for (prop in observer) {
				if (observer.hasOwnProperty(prop)) {
					if (observer[prop] instanceof Array) {
						this.observer[prop] = observer[prop].slice();
					} else {
						this.observer[prop] = observer[prop];
					}
				}
			}
			function execFunction(theEvent) {
				if (registered) {
					theEvent.data = This.observer;
					fn(theEvent);
				}
			}
			this.remove = function () {
				registered = false;
				srcObj.$removeEventListener(eventName, execFunction);
			};
			this.getObserver = function () {
				return this.observer;
			};
			this.register = function () {
				registered = true;
				srcObj.$addEventListener(eventName, execFunction);
			};
			this.synchronize = function () {
				var currentValue = srcObj.valueOf(), thisEvent;
				// TODO- should have a more explicit event name -- or an event kind
				if (eventName === $m.EventKind.PROPERTY) {
					thisEvent = new $m.PropertyEvent(
						$m.EventKind.UPDATE,
						srcObj,
						currentValue,
						currentValue
					);
					thisEvent.data = This.observer;
					fn(thisEvent);
				}
			};
			this.register();
			return this;
		},
		dateToISO: function (theDate) {
			function pad(num) {
				if (num < 10) {
					return "0" + num;
				} else {
					return num.toString();
				}
			}
			if (theDate === null) {
				return "";
			}

			return theDate.getFullYear().toString() + "-" + pad(theDate.getMonth() + 1) + "-" + pad(theDate.getDate());
		},
		unbind: function (element) {
			var $element = $(element),
				eventData = $.data(element, "eventData"),
				original,
				i;

			removeModelClasses($element);
			if (eventData) {
				if (eventData.adapter) {
					$element[eventData.adapter]("destroy");
					$element.removeClass("abacus-adapter");
				}
				original = eventData.originalContent;
				$.each(original, function (name, value) {
					if (name === "html") {
						$element.html(value);
					} else if (name !== "value") {
						$element.attr(name, value);
					}
				});
				delete eventData.originalContent;
			}
			if (!eventData) {
				eventData = $.data(element, "data-repeat");
				if (eventData) {
					$.removeData(element, "data-repeat");
				}
			}
			if (eventData) {
				// is there an array of elements bound to a collection?
				if (eventData.array) {
					$.each(eventData.array, function (index, element) {
						element.remove();
					});
				}
				if (eventData.repeatContent) {
					removeModelClasses(eventData.repeatContent, true);
					$(element).replaceWith(eventData.repeatContent);
				}
			}
			if (eventData && eventData.events) {
				$.each(eventData.events, function (index, evt) {
					if (evt instanceof $m.eventListener) {
						evt.remove();
					}
				});
			}
			if (eventData && eventData.fields) {
				i = eventData.fields.length;
				while (i) {
					i -= 1;
					if (eventData.fields[i].get(0) === element) {
						eventData.fields.splice(i, 1);
					}
				}
			}
		}

	};
	return $m;
}(jQuery));