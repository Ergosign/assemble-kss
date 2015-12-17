module.exports.register = function (Handlebars) {

    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('markupWithStyle', function (modifierText) {

        var context = this;

        if (!context || !context.markup) {
            return '';
        }

        if (typeof modifierText === "string") {
            if (!this.markupContext) {
                this.markupContext = {};
            }
            this.markupContext.modifier_class = modifierText;
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


    Handlebars.registerHelper('displayMarkupPath', function () {
        if (this.markup) {
            if (this.markup.indexOf(".hbs") >= 0) {
                return "(" + this.markup + ")";
            }
        }
        return '';
    });

};