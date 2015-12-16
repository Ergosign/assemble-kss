var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var grunt = require('grunt');

var kssCommentsParser = require('../lib/kssCommentsParser');

describe("parsing of comments", function () {

    var sections;

    beforeEach(function () {
        sections = {
            level: 0
        };
    });

    describe('a single line comment', function () {

        var minimalComment;

        beforeEach(function () {
            minimalComment = {
                comment: '/* Just a Comment */',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
        });

        it('should be ignored', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);

            createdTestSection.should.equal(-1);
        });
    });


    describe('a minimal comment', function () {

        var minimalComment;

        beforeEach(function () {
            minimalComment = {
                comment: '/*\nTitle \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
        });

        it('should create a section object', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);

            createdTestSection.should.not.equal(-1);
        });

        it('should have a title', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);

            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);

            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a srcPath', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(minimalComment, sections, grunt);

            createdTestSection.should.have.property('srcPath').and.equal("doesNotExist/pathIsJustForTesting");
        });
    });


    describe('a comment with description', function () {

        var commentWithDescription;

        beforeEach(function () {
            commentWithDescription = {
                comment: '/*\nTitle\nA Test Description \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
        });

        it('should have a title', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('sectionTitle').and.equal("Title");
        });

        it('should have a sectionName', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('sectionName').and.equal("testSection");
        });

        it('should have a description', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('description').and.equal("A Test Description");
        });
    });

    describe('a comment with multi line description', function () {

        var commentWithDescription;

        beforeEach(function () {
            commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3 \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
        });

        it('should have a multi line description', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('description').and.equal("A Test Description\nDescription Line 2\nLine 3");
        });
    });


    describe('a comment with variatoin', function () {

        var commentWithDescription;

        beforeEach(function () {
            commentWithDescription = {
                comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class - testdescr \nStyleguide testSection \n*/',
                srcPath: "doesNotExist/pathIsJustForTesting"
            };
        });

        it('should have a markup', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('markup').and.equal("test.hbs");
        });

        it('should have a variation', function () {

            var createdTestSection = kssCommentsParser.getSectionObjectOfKssComment(commentWithDescription, sections, grunt);

            createdTestSection.should.have.property('variations').and.equal([ {variationName: ".test-class", variationDescription: "testdescr" }]);
        });
    });

});