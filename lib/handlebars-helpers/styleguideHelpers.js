var _ = require('lodash');

module.exports.register = function (Handlebars) {

    /**
     * iterate over all children of root (level 0)
     * */
    Handlebars.registerHelper('eachSectionRoot', function (rootSections, options) {

            var buffer = '';

            if (!options || options === 'undefined' || options === null) {
                return '';
            }

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
     * @return string section with SECTIONNAME and all of her subsection from SECTIONS in buffer obj
     * */
    var _loopSubSection = function (sectionName, sections, options) {

        var buffer = '';

        if (!sectionName && !sections && !options) {
            return '';
        }

        //TODO: I don't understand the logic of this code first if seems to negate the else

        var subSectionKey, subSection;

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

        if (!sections || sections === 'undefined' || !query) {
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
     * Similar to the {#eachSection} helper, however will loop over each modifier
     * @param  {Object} section Supply a section object to loop over its modifiers. Defaults to the current section.
     */
    Handlebars.registerHelper('eachVariation', function (options) {

        var context = this;
        var buffer = '';
        if (!this || !context.variations ) {
            return '';
        }
        context.variations.forEach(function (variation) {

            var newContext = _.merge(context, variation);
            // add modifier_class to markupContext
            if (!newContext.hasOwnProperty('markupContext')) {
                newContext.markupContext = {};
            }

            newContext.markupContext.modifier_class = (variation.variationClass).join(" ");

            buffer += options.fn(newContext);

        });
        return buffer;
    });


};
