var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var Handlebars = require('handlebars');

// Local helpers
require('../../lib/handlebars-helpers/styleguideHelpers.js').register(Handlebars, {});


describe('Styleguide Helper Tests', function () {

    var context;

    beforeEach(function () {

        context = {};
    });


    describe('{{#eachSectionRoot rootSections options}} {{/eachSectionRoot}}', function () {

        it('should return empty String', function () {
            var template = Handlebars.compile('{{#eachSectionRoot }} {{sectionName}} {{/eachSectionRoot}}');
            template(context).should.equal('');
        });

        it('should return empty String', function () {
            var undefinedSection;
            context['sections'] = undefinedSection;
            var template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            template(context).should.equal('');
        });

        it('should return empty String', function () {
            var subSections = {
                level: 1
            };

            context['sections'] = subSections;
            var template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            template(context).should.equal('');
        });

        it('should return empty String', function () {
            var emptySections = {
                level: 0
            };
            context['sections'] = emptySections;
            var template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            template(context).should.equal('');
        });

        it('should return output for 1 subsections', function () {
            var testSection = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionDescription: "more items"
                }
            };

            context['sections'] = testSection;
            var template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
            template(context).should.equal("Overview, more items\n");
        });

        it('should return output for 2 subsections', function () {
            var testSection = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionDescription: "more items"
                },
                Controls: {
                    level: 1,
                    sectionName: "Controls",
                    sectionDescription: "control items"
                }
            };

            context['sections'] = testSection;
            var template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
            template(context).should.equal("Overview, more items\nControls, control items\n");
        });

    });

    //TODO ifREferenceOfSection is never true in our context
    /*describe('{{#ifReferenceOfSection sectionName options}} {{/ifReferenceOfSection}}', function () {

     beforeEach(function () {

     context = {
     level: 0,
     index: {
     level: 1,
     sectionName: "Overview",
     sectionDescription: "more items"
     }
     };
     });

     it('should return empty String', function () {
     var template = Handlebars.compile('{{#ifReferenceOfSection notdefined }} true {{/ifReferenceOfSection}}');
     template(context).should.equal('');
     });

     it('should return empty String', function () {

     context['sectionName'] = 'Overview';

     var template = Handlebars.compile('{{#ifReferenceOfSection sectionName}} true {{/ifReferenceOfSection}}');
     template(context).should.equal('');
     });
     });
     */


    describe('{{#eachSubSectionQuery query sections options}} {{/eachSectionQuery}}', function () {

        beforeEach(function () {
            var testSections = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionTitle: "index",
                    sectionDescription: "more items"
                },
                Fonts: {
                    level: 2,
                    sectionName: "Fonts",
                    sectionTitle: "Fonts",
                    sectionDescription: "font descr",
                    WebFonts: {
                        level: 2,
                        sectionName: "Webfonts",
                        sectionTitle: "Webfonts",
                        sectionDescripton: "webfonts descr"
                    }
                },
                Controls: {
                    level: 1,
                    sectionName: "Controls",
                    sectionTitle: "Contorls",
                    sectionDescription: "control items",
                    Button: {
                        level: 2,
                        sectionName: "Button",
                        sectionTitle: "Button",
                        sectionDescription: "button descr",
                        ButtonSmall: {
                            level: 3,
                            sectionTitle: "ButtonSmall",
                            sectionName: "ButtonSmall",
                            sectionDescription: "ButtonSmall"
                        }
                    },
                    Dropdown: {
                        level: 2,
                        sectionName: "Dropdown",
                        sectionTitle: "Dropdown",
                        sectionDescription: "dropdown desrc"
                    }
                }
            };
            context['sections'] = testSections;
        });

        it('should return empty String', function () {

            var template = Handlebars.compile('{{#eachSubSectionQuery "NamenotInList" sections}} {{sectionName}} {{/eachSubSectionQuery}}');
            template(context).should.equal("");
        });

        it('should return empty String', function () {

            var template = Handlebars.compile('{{#eachSubSectionQuery "index" sectionsNotAvailable}} {{sectionName}} {{/eachSubSectionQuery}}');
            template(context).should.equal("");
        });

        it('should return Section Overview', function () {

            var template = Handlebars.compile('{{#eachSubSectionQuery "index" sections}} {{sectionName}} {{/eachSubSectionQuery}}');
            template(context).should.equal(" Overview ");
        });

        it('should return Font Section with one subsections', function () {

            var template = Handlebars.compile('{{#eachSubSectionQuery "Fonts" sections}} {{sectionName}}\n{{/eachSubSectionQuery}}');
            template(context).should.equal(" Fonts\n Webfonts\n");
        });

        it('should return Controls Section with all subsections', function () {

            var template = Handlebars.compile('{{#eachSubSectionQuery "Controls" sections}} {{sectionName}}\n{{/eachSubSectionQuery}}');
            template(context).should.equal(" Controls\n Button\n ButtonSmall\n Dropdown\n");
        });

    });

    describe('{{#ifLevel lowerBound upperBound options}} {{/ifLevel}}', function () {

        it('should return empty string', function () {

            var section = {
                level: 0
            };

            var template = Handlebars.compile('{{#ifLevel "0" "1"}} {{sectionName}} {{/ifLevel}}');
            template(section).should.equal('');
        });

        it('should return sectionName', function () {

            var section = {
                level: 1,
                sectionName: "Control"
            };

            var template = Handlebars.compile('{{#ifLevel "1"}} {{sectionName}} {{/ifLevel}}');
            template(section).should.equal(' Control ');
        });

        it('should return sectionName', function () {

            var section = {
                level: 2,
                sectionName: "Control"
            };

            var template = Handlebars.compile('{{#ifLevel "1" "2"}} {{sectionName}} {{/ifLevel}}');
            template(section).should.equal(' Control ');
        });

    });

    describe('{{#eachVariation}} {{/eachVariation}}', function () {

        it('should return empty String (no context)', function () {

            var template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
            template({}).should.equal('');
        });

        it('should return empty String (no variations in context)', function () {

            var template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
            template(context).should.equal('');
        });

        it('should return one variation)', function () {

            context['variations'] = [
                {
                    variationName: ".test-class",
                    variationDescription: "testmodifier",
                    variationClass: "test-class"
                }
            ];

            var template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}} {{/eachVariation}}');
            template(context).should.equal(' .test-class,testmodifier,test-class ');
        });

        it('should return two variation)', function () {

            context['variations'] = [
                {
                    variationName: ".test-class",
                    variationDescription: "testmodifier",
                    variationClass: "test-class"
                },
                {
                    variationName: ".test-class2",
                    variationDescription: "testmodifier2",
                    variationClass: "test-class2"
                }
            ];

            var template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}}\n {{/eachVariation}}');
            template(context).should.equal(' .test-class,testmodifier,test-class\n .test-class2,testmodifier2,test-class2\n');
        });

        it('should return two variation)', function () {

            context['variations'] = [
                {
                    variationName: ".test-class",
                    variationDescription: "testmodifier",
                    variationClass: "test-class"
                },
                {
                    variationName: ".test-class2",
                    variationDescription: "testmodifier2",
                    variationClass: "test-class2"
                }
            ];

            var template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}}\n {{/eachVariation}}');
            template(context).should.equal(' .test-class,testmodifier,test-class\n .test-class2,testmodifier2,test-class2\n');
        });

    });

});
