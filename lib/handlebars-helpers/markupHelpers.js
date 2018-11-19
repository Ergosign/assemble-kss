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

  /**
   * Outputs the current section's or modifier's markup.
   */
  Handlebars.registerHelper('alternativeMarkupWithStyle', function (modifierText, stateModifierText)
  {
    var context = this;

    if (!context || !context.alternativeMarkup)
    {
      return '';
    }

    if (typeof modifierText === "string")
    {
      if (!this.alternativeMarkupContext)
      {
        this.alternativeMarkupContext = {};
      }
      this.alternativeMarkupContext.modifier_class = modifierText;
    }
    if (typeof stateModifierText === "string")
    {
      if (!this.alternativeMarkupContext)
      {
        this.alternativeMarkupContext = {};
      }
      this.alternativeMarkupContext.stateModifier = stateModifierText;
    }

    var markup = context.alternativeMarkup;
    var markupContext = context.alternativeMarkupContext;

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

  /**
   * Outputs the current section's or modifier's markup.
   */
  Handlebars.registerHelper('alternative2MarkupWithStyle', function (modifierText, stateModifierText)
  {
    var context = this;

    if (!context || !context.alternative2Markup)
    {
      return '';
    }

    if (typeof modifierText === "string")
    {
      if (!this.alternative2MarkupContext)
      {
        this.alternative2MarkupContext = {};
      }
      this.alternative2MarkupContext.modifier_class = modifierText;
    }
    if (typeof stateModifierText === "string")
    {
      if (!this.alternative2MarkupContext)
      {
        this.alternative2MarkupContext = {};
      }
      this.alternative2MarkupContext.stateModifier = stateModifierText;
    }

    var markup = context.alternative2Markup;
    var markupContext = context.alternative2MarkupContext;

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

    /**
     * Returns the path to the alternative markup file.
     */
  Handlebars.registerHelper('displayAlternativeMarkupPath', function ()
  {
    //Get src path by depending scss file path
    var regEx = /[^\/]*$/;
    var path = "";
    if (this.alternativeSrcPath)
    {
      path = this.alternativeSrcPath.replace(regEx, '');
    }
    if (this.alternativeMarkup)
    {
      if (this.alternativeMarkup.indexOf(".hbs") >= 0)
      {
        return path + this.alternativeMarkup;
      }
    }
    return '';
  });

  /**
   * Returns the path to the alternative2 markup file.
   */
  Handlebars.registerHelper('displayAlternative2MarkupPath', function ()
  {
    //Get src path by depending scss file path
    var regEx = /[^\/]*$/;
    var path = "";
    if (this.alternative2SrcPath)
    {
      path = this.alternative2SrcPath.replace(regEx, '');
    }
    if (this.alternative2Markup)
    {
      if (this.alternative2Markup.indexOf(".hbs") >= 0)
      {
        return path + this.alternative2Markup;
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
