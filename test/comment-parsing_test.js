var chai = require('chai');
var expect = chai.expect;
chai.should();

var grunt = require('grunt');

var kssCommentsParser = require('../lib/kssCommentsParser');

describe("parsing of comments", function()
{

    var sections;
    var createdTestSection;

    beforeEach(function()
    {
        sections = {
            level: 0
        };
    });

    describe('a single line comment', function()
    {
        beforeEach(function()
        {
            var minimalComment = {
                comment: '/* Just a Comment */',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);
        });

        it('should be ignored', function()
        {
            createdTestSection.should.equal(-1);
        });
    });

    describe('a minimal comment', function()
    {
        beforeEach(function()
        {
            var minimalComment = {
                comment: '/*\nTitle \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);
        });

        it('should create a section object', function()
        {
            createdTestSection.should.not.equal(-1);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a srcPath', function()
        {
            createdTestSection.should.have.property('srcPath').and.equal("doesNotExist/pathIsJustForTesting");
        });
    });

    describe('a comment with description', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });
    });

    describe('a comment with multi line description', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3 \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });
    });

    describe('a comment with hbs file as markup', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

    });

    describe('a comment with multiline html as markup', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: <div><p>first line</p>\n<span>second line</span></div>\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("<div><p>first line</p>\n<span>second line</span></div>");
        });

    });

    describe('a comment with one variation class', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class - testdescr \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have a variation', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([{
                variationName:        ".test-class",
                variationDescription: "testdescr",
                variationClass:       ["test-class"]
            }]);
        });
    });

    describe('a comment with multiple variation classes', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n.test-class - testdescr\n.test-class2.test-class--modifier - testdescr2 \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have variations', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([
                {
                    variationName:        ".test-class",
                    variationDescription: "testdescr",
                    variationClass:       ["test-class"]
                },
                {
                    variationName:        ".test-class2.test-class--modifier",
                    variationDescription: "testdescr2",
                    variationClass:       ["test-class2", "test-class--modifier"]
                }
            ]);
        });
    });

    describe('a comment with variation classes and states (hover, focus) in one line', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class2.test-class--modifier - testdescr2\n:focus.test-class3 - focusState \n.test-class2.test-class--modifier:active - testdescr2   \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });
        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });
        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });
        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have variations with states', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([
                {
                    variationName:        ".test-class2.test-class--modifier",
                    variationDescription: "testdescr2",
                    variationClass:       ["test-class2", "test-class--modifier"]
                },
                {
                    variationName:        ":focus.test-class3",
                    variationDescription: "focusState",
                    variationClass:       ["pseudo-class-focus", "test-class3"]
                },
                {
                    variationName:        ".test-class2.test-class--modifier:active",
                    variationDescription: "testdescr2",
                    variationClass:       ["test-class2", "test-class--modifier", "pseudo-class-active"]
                }
            ]);
        });
    });

    describe('a comment with one variation and variation classes with states (hover, focus) in one line', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class - testdescr\n:hover - hoverState\n.test-class2.test-class--modifier - testdescr2\n:focus.test-class3 - focusState \n.test-class2.test-class--modifier:active - testdescr2   \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });
        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });
        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });
        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have variations with states', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([
                {variationName: ".test-class", variationDescription: "testdescr", variationClass: ["test-class"]},
                {variationName: ":hover", variationDescription: "hoverState", variationClass: ["pseudo-class-hover"]},
                {
                    variationName:        ".test-class2.test-class--modifier",
                    variationDescription: "testdescr2",
                    variationClass:       ["test-class2", "test-class--modifier"]
                },
                {
                    variationName:        ":focus.test-class3",
                    variationDescription: "focusState",
                    variationClass:       ["pseudo-class-focus", "test-class3"]
                },
                {
                    variationName:        ".test-class2.test-class--modifier:active",
                    variationDescription: "testdescr2",
                    variationClass:       ["test-class2", "test-class--modifier", "pseudo-class-active"]
                }
            ]);
        });
    });

    describe('a comment with one variation consists of classes and state', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class.test-class2:hover - testdescr \n\n:hover - hoverState\n:focus - focusState   \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });
        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });
        it('should have a multi line description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });
        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have variations with states', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([{
                variationName:        ".test-class.test-class2:hover",
                variationDescription: "testdescr",
                variationClass:       ["test-class", "test-class2", "pseudo-class-hover"]
            }, {
                "variationClass":       ["pseudo-class-hover"],
                "variationDescription": "hoverState",
                "variationName":        ":hover"
            }, {
                "variationClass":       ["pseudo-class-focus"],
                "variationDescription": "focusState",
                "variationName":        ":focus"
            }
            ]);
        });
    });

    describe('a comment with property wrapper-classes', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n\nwrapper-classes: background-dark \n\n\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have a property wrapper-classes', function()
        {
            createdTestSection.should.have.property('properties').to.deep.equal(
                {
                    "wrapper-classes": ["background-dark"]
                }
            );
        });
    });

    describe('a comment with multiple property', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have properties', function()
        {
            createdTestSection.should.have.property('properties').to.deep.equal(
                {
                    "wrapper-classes": ["background-dark", "min-height", "overflow"],
                    "weight":          ["-12"]
                }
            );
        });
    });

    describe('a comment with markup, variations, states and properties', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n.test-class - testdescr\n.test-class2 - testdescr2\n:hover - hoverState\n:focus - focusState \n\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });

        it('should have a markup', function()
        {
            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have variations with states', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([
                {variationName: ".test-class", variationDescription: "testdescr", variationClass: ["test-class"]},
                {variationName: ".test-class2", variationDescription: "testdescr2", variationClass: ["test-class2"]},
                {variationName: ":hover", variationDescription: "hoverState", variationClass: ["pseudo-class-hover"]},
                {variationName: ":focus", variationDescription: "focusState", variationClass: ["pseudo-class-focus"]}
            ]);
        });

        it('should have properties', function()
        {
            createdTestSection.should.have.property('properties').to.deep.equal(
                {
                    "wrapper-classes": ["background-dark", "min-height", "overflow"],
                    "weight":          ["-12"]
                }
            );
        });
    });

    describe('a comment with only title, name and property', function()
    {

        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle  \nWeight: -12 \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a property', function()
        {
            createdTestSection.should.have.property('properties').to.deep.equal(
                {"weight": ["-12"]}
            );
        });
    });

    describe('a comment with angular-markup, variations, states and angular-properties', function()
    {
        beforeEach(function()
        {
            var commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\n\nangular-markup: test.html\n\n.test-class - testdescr\n.test-class2 - testdescr2\n:hover - hoverState\n:focus - focusState \n\nangular-wrapper-markup: test,test\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
            createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);
        });

        it('should have a title', function()
        {
            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function()
        {
            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function()
        {
            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });

        it('should have a angular-markup', function()
        {
            createdTestSection.should.have.property('angularMarkup').and.equal("test.html");
        });

        it('should have variations with states', function()
        {
            createdTestSection.should.have.property('variations').to.deep.equal([
                {variationName: ".test-class", variationDescription: "testdescr", variationClass: ["test-class"]},
                {variationName: ".test-class2", variationDescription: "testdescr2", variationClass: ["test-class2"]},
                {variationName: ":hover", variationDescription: "hoverState", variationClass: ["pseudo-class-hover"]},
                {variationName: ":focus", variationDescription: "focusState", variationClass: ["pseudo-class-focus"]}
            ]);
        });

        it('should have properties', function()
        {
            createdTestSection.should.have.property('properties').to.deep.equal(
                {
                    "angular-wrapper-markup": ["test" , "test"],
                    "wrapper-classes": ["background-dark", "min-height", "overflow"],
                    "weight":          ["-12"]
                }
            );
        });
    });

});
