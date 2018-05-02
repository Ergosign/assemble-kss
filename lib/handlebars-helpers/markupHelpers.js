module.exports.register = function (Handlebars)
{

    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('markupWithStyle', function (modifierText, stateModifierText)
    {

        var context = this;

        if (!context || !context.markup)
        {
            return '';
        }

        if (typeof modifierText === "string")
        {
            if (!this.markupContext)
            {
                this.markupContext = {};
            }
            this.markupContext.modifier_class = modifierText;
        }
        if (typeof stateModifierText === "string")
        {
            if (!this.markupContext)
            {
                this.markupContext = {};
            }
            this.markupContext.stateModifier = stateModifierText;
        }

        var markup = context.markup;
        var markupContext = context.markupContext;

        var template;

        if (markup.search(/.*\.hbs/gi) === 0)
        {
            var mName = markup.replace(".hbs", "");
            template = Handlebars.compile('{{> "' + mName + '"}}');
        } else
        {
            template = Handlebars.compile(markup);
        }

        var html = template(markupContext);
        html = html.trim();

        return html;
    });

    Handlebars.registerHelper('displayMarkupPath', function ()
    {
        //Get src path by depending scss file path
        var regEx = /[^\/]*$/;
        var path = "";
        if (this.srcPath)
        {
            path = this.srcPath.replace(regEx, '');
        }
        if (this.markup)
        {
            if (this.markup.indexOf(".hbs") >= 0)
            {
                return path + this.markup;
            }
        }
        if (this.angularMarkupPath)
        {
            if (this.angularMarkupPath.indexOf(".html") >= 0)
            {
                return path + this.angularMarkupPath;
            }
        }
        return '';
    });

    Handlebars.registerHelper('displayContextPath', function ()
    {
        //Get src path by depending scss file path
        var regEx = /[^\/]*$/;
        var path = "";
        if (this.srcPath)
        {
            path = this.srcPath.replace(regEx, '');
        }
        if (this.markupContextPath)
        {
            if (this.markupContextPath.indexOf(".json") >= 0)
            {
                return path + this.markupContextPath;
            }
        }
        if (this.angularContextPath)
        {
            if (this.angularContextPath.indexOf(".json") >= 0)
            {
                return path + this.angularContextPath;
            }
        }
        return '';
    });

    Handlebars.registerHelper('prefixWithSrcPath', function (suffix,options){

        if (!this.srcPath)
        {
            return '';
        }

        //Get src path by depending scss file path
        var regEx = /[^\/]*$/;
        var path = this.srcPath.replace(regEx, '');
        return path + '/' + suffix;

    });

};
