/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
(function(_, $CQ, Backbone, Handlebars, SCF) {
    "use strict";

    var SmartTagManager = function(tagField, config, model) {
        this.containerEl = tagField;
        var filterVal = $CQ(tagField).data("tag-filter");
        var filterLimit = $CQ(tagField).data("tag-limit");
        $CQ(tagField).tagit({
            fieldName: name,
            allowSpaces: false,
            placeholderText: CQ.I18n.getMessage("Add a tag"),
            animate: false,
            minLength: 2,
            removeConfirmation: true,
            showAutocompleteOnFocus: false,
            tagSource: function(request, response) {
                $CQ.ajax({
                    url: SCF.config.urlRoot + "/services/tagfilter",
                    data: {
                        term: request.term,
                        tagfilter: filterVal,
                        tagFilterLimit: filterLimit,
                        _charset_: "UTF-8"
                    },
                    dataType: "json",
                    success: function(data) {
                        response($CQ.map(data, function(item) {
                            return {
                                label: item.label,
                                value: item.value,
                                id: item.tagid
                            };
                        }));
                    }
                });
            }
        });

        if (!_.isEmpty(model.get("tags"))) {
            $CQ.each(model.get("tags"), function(index, item) {
                $CQ(tagField).tagit("createTag", item.title, item.tagId, item.value);

            });
        }
    };
    SmartTagManager.prototype.getValue = function() {
        var tags = [];

        $CQ(this.containerEl).find('li').each(function() {
            var _liObj = $(this);
            var _value = _liObj.find("input").attr("value");
            if (!_.isEmpty(_value)) {
                tags.push(_value);
            }
        });

        return tags;
    };
    SmartTagManager.prototype.setValue = function() {};
    SmartTagManager.prototype.focus = function() {
        $CQ(this.el).focus();
    };
    SmartTagManager.prototype.destroy = function() {};



    var TagManager = function(tagField, config, model) {
        var compileTemplates = function(sourceMap) {
            var compiledTemplates = {};
            for (var key in sourceMap) {
                compiledTemplates[key] = Handlebars.compile(sourceMap[key]);
            }
            return compiledTemplates;
        };
        this.modelTags = model.get("tags");
        this.templatesSource = this.defaultTemplates;
        if (config && config.hasOwnProperty("templates")) {
            this.templatesSource = _.extend(this.defaultTemplates, config.templates);
        }
        this.compiledTemplates = compileTemplates(this.templatesSource);
        var el = tagField.get()[0];
        var filterVal = $CQ(el).data("tag-filter");
        var filterLimit = $CQ(el).data("tag-limit");
        var tags = TagManager.tagsByFilterVal[filterVal];
        if (!tags) {
            var that = this;
            $CQ.ajax({
                url: SCF.config.urlRoot + "/services/tagfilter",
                data: {
                    tagfilter: filterVal,
                    tagFilterLimit: filterLimit
                },
                // xhrFields: {
                //     withCredentials: true
                // },
                dataType: "json",
                async: false,
                success: function(data) {
                    tags = data;
                    TagManager.tagsByFilterVal[filterVal] = tags;
                    that.initTagFields(tags, el);
                }
            });
        } else {
            this.initTagFields(tags, el);
        }
    };

    TagManager.prototype.initTagFields = function(tags, field) {
        var tagSelector = $CQ(this.compiledTemplates.inputField(tags));
        this.selectedTags = {};
        var that = this;
        var $field = $CQ(field);
        $field.after(tagSelector);
        var attributes = $field.prop("attributes");
        $CQ.each(attributes, function() {
            tagSelector.attr(this.name, this.value);
        });
        tagSelector.removeAttr("data-attrib");
        var selectedTags = $CQ(this.compiledTemplates.tagsContainer(this.modelTags));

        if (!_.isUndefined(this.modelTags) && this.modelTags !== null && this.modelTags.hasOwnProperty("length")) {
            for (var i = 0; i < this.modelTags.length; i++) {
                this.selectedTags[this.modelTags[i].tagId] = this.modelTags[i];
            }
        }
        tagSelector.after(selectedTags);
        selectedTags.find(".scf-js-remove-tag").click(function(e) {
            var targetTag = $CQ(e.target).closest("[data-attrib]");
            delete that.selectedTags[targetTag.attr("data-attrib")];
            targetTag.remove();
        });
        $field.remove();
        tagSelector.change(function() {
            $CQ(tagSelector).find("option:selected").each(function() {
                var tag = $CQ(this).text();
                var tagId = $CQ(this).val();
                $CQ(this).removeAttr("selected");
                if (tagId in that.selectedTags) {
                    return;
                }
                var selectedTag = $CQ(that.compiledTemplates.tag({
                    "tagid": tagId,
                    "label": tag
                }));
                selectedTags.append(selectedTag);
                that.selectedTags[tagId] = tag;
                selectedTag.find(".scf-js-remove-tag").click(function() {
                    selectedTag.remove();
                    delete that.selectedTags[tagId];
                });
            });
            $CQ($CQ(this).find("option[disabled]")[0]).removeAttr("disabled").attr("selected", "selected").attr("disabled", "disabled");
        });
    };

    TagManager.prototype.getValue = function() {
        var tags = [];
        for (var tagId in this.selectedTags) {
            tags.push(tagId);
        }
        return tags;
    };
    TagManager.prototype.setValue = function() {
        if (tags instanceof Array) {
            for (var i; i < tags.length; i++) {
                var tag = tags[i];
                this.selectedTags[tag.tagId] = tag.title;
            }
        }
    };
    TagManager.prototype.focus = function() {
        $CQ(this.el).focus();
    };
    TagManager.prototype.destroy = function() {};

    TagManager.prototype.defaultTemplates = {
        "inputField": "<select size=\"1\"><option disabled selected>add a tag</option>{{#each this}}<option value=\"{{tagid}}\">{{label}}</option>{{/each}}</select>",
        "tagsContainer": "<ul class=\"scf-horizontal-tag-list\">{{#each this}}<li class=\"scf-selected-tag \" data-attrib=\"{{tagId}}\"><span class=\"scf-js-remove-tag scf-remove-tag\"></span> {{title}}</li>{{/each}}</div>",
        "tag": "<li class=\"scf-selected-tag \"><span class=\"scf-js-remove-tag scf-remove-tag\"></span> {{label}}</li>"
    };

    TagManager.tagsByFilterVal = {};

    SCF.registerFieldType("tags", TagManager);
    SCF.registerFieldType("smarttags", SmartTagManager);
    // Maybe this export can be removed when we transition over totally to SCF
    SCF.TagManager = TagManager;
    SCF.SmartTagManager = SmartTagManager;

})(_, $CQ, Backbone, Handlebars, SCF);
