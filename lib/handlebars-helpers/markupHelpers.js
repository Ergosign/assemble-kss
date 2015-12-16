module.exports.register = function (Handlebars) {
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

};