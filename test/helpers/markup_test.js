var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var Handlebars = require('handlebars');

// Local helpers
require('../../lib/handlebars-helpers/markupHelpers.js').register(Handlebars, {});


describe('the {{markupWithStyle}}', function () {

    var context;

    beforeEach(function () {
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
            markupContext: {
                modifier_class: "btn--grey",
                actionText: "read more",
                actionTarget: "more.html"
            }
        };
    });

    it('should return markup with style', function () {
        var template = Handlebars.compile('{{{markupWithStyle}}}');
        template(context).should.equal('<a class="btn btn--grey" href="more.html">read more</a>');
    });

    it('should use a parameter to replace modidifer class', function () {
        var template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        template(context).should.equal('<a class="btn [test modifier]" href="more.html">read more</a>');
    });

    it('should work with an empty context', function () {
        var template = Handlebars.compile('{{{markupWithStyle}}}');
        context.markupContext = {};
        template(context).should.equal('<a class="btn " href=""></a>');
    });

    it('should work with an empty context but with modidifer', function () {
        var template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context.markupContext = {};
        template(context).should.equal('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', function () {
        var template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        template(context).should.equal('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', function () {
        var template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\' \'[test state]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}} {{stateModifier}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        template(context).should.equal('<a class="btn [test modifier] [test state]" href=""></a>');
    });

});


describe('{{displayMarkupPath}}', function () {

    it('should return empty string', function () {
        var template = Handlebars.compile('{{{displayMarkupPath}}}');
        template(context).should.equal('');
    });

    it('should return empty String', function () {
        context =  {
            markup: '<a href="test">test</a>'
        };

        var template = Handlebars.compile('{{{displayMarkupPath}}}');
        template(context).should.equal('');
    });

    it('should return markupPath', function () {
        context =  {
            srcPath: '/testPath/',
            markup: "test.hbs"
        };

        var template = Handlebars.compile('{{{displayMarkupPath}}}');
        template(context).should.equal('/testPath/test.hbs');
    });

});
