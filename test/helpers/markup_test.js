var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var Handlebars = require('handlebars');

var helpers = path.join.bind(__dirname, '../../lib/handlebars-helpers');

// Local helpers
require('../../lib/handlebars-helpers/markupHelpers.js').register(Handlebars, {});


var options = {
    assets: 'assets/'
};

describe('Markup With Style', function() {

    describe('{{markupWithStyle context}}', function() {

        it('should return markup with style', function() {
            var source = '{{markupWithStyle context options}}';

            var context = {
                markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
                markupContext: {
                    modifier_class: "btn--grey",
                    actionText: "read more",
                    actionTarget: "more.html"
                }
            };
            var template = Handlebars.compile(source);
            var returnedHTML = template(context);
            var expectedHTML = Handlebars.Utils.escapeExpression('<a class="btn btn--grey" href="more.html">read more</a>');
            returnedHTML.should.equal(expectedHTML);
        });
    });
});


describe('Markup Escaped', function() {

    describe('{{markupEscaped context}}', function() {

        it('should return markup with style', function() {
            var source = '{{markupEscaped context options}}';

            var context = {
                markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
                markupContext: {
                    modifier_class: "btn--grey",
                    actionText: "read more",
                    actionTarget: "more.html"
                }
            };
            var template = Handlebars.compile(source);
            var returnedHTML = template(context);
            var expectedHTML = Handlebars.Utils.escapeExpression('<a class="btn [modifier_class]" href="more.html">read more</a>');
            expectedHTML = Handlebars.Utils.escapeExpression(expectedHTML);
            returnedHTML.should.equal(expectedHTML);

        });
    });
});