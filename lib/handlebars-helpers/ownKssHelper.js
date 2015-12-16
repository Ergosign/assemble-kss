module.exports.register = function (Handlebars) {
    Handlebars.registerHelper('eachSectionRoot', function (rootSections, options) {

            var buffer = '';

            if (!rootSections || rootSections.level > 0) {
                return '';
            }

            for (var key in rootSections) {

                var section = rootSections[key];
                if (typeof(section) === 'object') {
                    buffer += options.fn(section);
                }

            }

            return buffer;
        }
    );

    /**
     * Equivalent to "if the current reference is X". e.g:
     *
     * {{#ifReference 'base.headings'}}
     *    IF CURRENT REFERENCE IS base.headings ONLY
     *   {{else}}
     *    ANYTHING ELSE
     * {{/ifReference}}
     */
    Handlebars.registerHelper('ifReferenceOfSection', function (sectionName, options) {
        return (this.section && sectionName === this.section) ? options.fn(this) : options.inverse(this);
    });


    /**
     * Loop over a section query. If a number is supplied, will convert into
     * a query for all children and descendants of that reference.
     * @param  {Mixed} query The section query
     */
    Handlebars.registerHelper('eachSectionQuery', function (query, options) {
        var buffer = '',
            sections;

        sections = this;
        if (!sections && !sections.hasOwnProperty(query)) {
            return '';
        }

        for (var key in sections) {

            var subSection = sections[key];
            if (typeof(subSection) === 'object') {
                buffer += options.fn(subSection);
            }
        }

        return buffer;
    });


    /**
     * @return string section with SECTIONNAME and all of her subsection from SECTIONS in buffer obj
     * */
    var _loopSubSection = function (sectionName, sections, options) {

        var buffer = '';

        if (!sections /*&& sections.hasOwnProperty(sectionName) */ && !options) {
            return '';
        }

        //TODO: I don't understand the logic of this code first if seems to negate the else

        var subSectionKey,subSection;

        // go in the subsection with key: sectionName
        if (sections.hasOwnProperty(sectionName)) {
            var section = sections[sectionName];

            if (typeof(section) === 'object') {
                // is actually a section
                if (section.hasOwnProperty('level')) {

                    // add top level subsection
                    buffer += options.fn(section);

                    for (subSectionKey in section) {
                        subSection = section[subSectionKey];

                        if (typeof(subSection) === 'object') {
                            // ad all subsections
                            buffer += _loopSubSection(subSection.sectionName, subSection, options);
                        }
                    }
                }
            }
            // already in the right section
        } else if (sections.sectionName === sectionName) {

            if (typeof(sections) === 'object') {
                // is actually a section
                if (sections.hasOwnProperty('level')) {
                    // add top level subsection
                    buffer += options.fn(sections);

                    for (subSectionKey in sections) {
                        subSection = sections[subSectionKey];

                        if (typeof(subSection) === 'object') {
                            // ad all subsections
                            buffer += _loopSubSection(subSection.sectionName, subSection, options);
                        }
                    }
                }
            }
        }

        return buffer;
    };


    /**
     * Loop over a section query. If a number is supplied, will convert into
     * a query for all children and descendants of that reference.
     * @param  {Mixed} query The section query
     */
    Handlebars.registerHelper('eachSubSectionQuery', function (query, sections, options) {

        // if parentSection not available
        if (typeof options === 'undefined' || options === null) {
            options = sections;
            sections = this;
        }

        var buffer = '';


        if (!sections) {
            return '';
        }

        buffer += _loopSubSection(query, sections, options);

        return buffer;
    });


    /**
     * Takes a range of numbers that the current section's depth/level must be within.
     *
     * Equivalent to "if the current section is X levels deep". e.g:
     *
     * {{#ifLevel 1}}
     *    ROOT ELEMENTS ONLY
     *   {{else}}
     *    ANYTHING ELSE
     * {{/ifLevel}}
     */
    Handlebars.registerHelper('ifLevel', function (lowerBound, upperBound, options) {
        // If only 1 parameter is passed, upper bound is the same as lower bound.
        if (typeof options === 'undefined' || options === null) {
            options = upperBound;
            upperBound = lowerBound;
        }
        return (this.level && this.level >= lowerBound && this.level <= upperBound) ? options.fn(this) : options.inverse(this);
    });


    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('markupEscaped', function (options) {

        if (!this) {
            return '';
        }

        // replace modifier class with placeholder
        if (this.markupContext) {
            this.markupContext.modifier_class = "[modifier_class]";
        } else {
            this.markupContext = {modifier_class: "[modifier_class]"};
        }

        var template;

        if (this.markup.search(/.*\.hbs/gi) === 0) {
            var mName = this.markup.replace(".hbs", "");
            template = Handlebars.compile('{{> "' + mName + '"}}');
        } else {
            template = Handlebars.compile(this.markup);
        }
        return Handlebars.Utils.escapeExpression(template(this.markupContext));
    });


    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('markupWithStyle', function (context, options) {

        if (typeof options === 'undefined' || options === null) {
            options = context;
            context = this;
        }

        if (!context || !context.markup) {
            return '';
        }


        var markup = context.markup;
        var markupContext = context.markupContext;

        var template;

        if (markup.search(/.*\.hbs/gi) === 0) {
            var mName = markup.replace(".hbs", "");
            template = Handlebars.compile('{{> "' + mName + '"}}');
        } else {
            template = Handlebars.compile(markup);
        }
        return template(markupContext);
    });


    /**
     * Similar to the {#eachSection} helper, however will loop over each modifier
     * @param  {Object} section Supply a section object to loop over its modifiers. Defaults to the current section.
     */
    Handlebars.registerHelper('eachVariation', function (options) {
        var buffer = '',
            variations;

        if (!this && !this.variations) {
            return '';
        }

        variations = this.variations;

        var l = variations.length;
        for (var i = 0; i < l; i++) {
            // merge variation into this context
            this.variationName = variations[i].variationName;
            this.variationDescription = variations[i].variationDescription;
            var modifier = this.variationName.replace(/^./, "");

            // add modifier_class to markupContext
            if (!this.hasOwnProperty('markupContext')) {
                this.markupContext = {modifier_class: modifier};
            } else {
                this.markupContext.modifier_class = modifier;
            }

            buffer += options.fn(this);

        }
        return buffer;
    });



};