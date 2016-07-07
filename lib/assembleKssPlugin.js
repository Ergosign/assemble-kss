var _ = require('lodash');
var fs = require('fs');

var commentsFinder = require('./commentsFinder');
var kssCommentsParser = require('./kssCommentsParser');
var assembleHandlbarsHelpers = [
    require('./handlebars-helpers/styleguideHelpers.js'),
    require('./handlebars-helpers/markupHelpers.js'),
    require('./handlebars-helpers/teaserHelpers.js')
];


/**
 * sort sections object by weight
 * @param dict: sections object
 * @return sorted sections object
 * */
function sortOnWeight(dict) {

    var tempDict = {};
    var sorted = [];
    var weight = 0;


    for (var key in dict) {

        var section = dict[key];
        var sectionWeight = 0;

        if (typeof(section) === 'object' && section.hasOwnProperty('level')) {

            if (section.hasOwnProperty('properties') && section.properties.hasOwnProperty('weight')) {
                sectionWeight = section.properties.weight[0];
            }
            section = sortOnWeight(section);

            sorted[sorted.length] = {s: section, k: key, w: sectionWeight};
        } else {
            //sorted[sorted.length] = {s: section, w: sectionWeight};
            tempDict[key] = dict[key];
        }
    }
    // sort array by weight
    sorted.sort(function (a, b) {
        return a.w - b.w;
    });


    for (var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i].k] = sorted[i].s;
    }

    return tempDict;
}


module.exports = function (params, callback) {

    var assemble = params.assemble;
    var grunt = params.grunt;
    var pages = assemble.options.pages;
    var options = assemble.options.kss || {};

    //register the required handlebars helpers
    var handlebars = assemble.engine.engine['handlebars'];
    assembleHandlbarsHelpers.forEach(function (helper) {
        helper.register(handlebars);
    });

    //load the options and set defaults
    var rootSrcPath = options.src || 'src/scss';
    var srcMask = options.src_mask;

    options.src_mask = options.src_mask || /.scss/;

    var overviewMarkdownFile = options.overviewMarkdownFile || rootSrcPath+"/documentation/styleguide.md";

    // If the mask is a string, convert it into a RegExp.
    if (!(options.src_mask instanceof RegExp)) {
        options.src_mask = new RegExp(
            '(?:' + options.src_mask.replace(/\./g, '\\.').replace(/\*/g, '.*') + ')$'
        );
    }

    //load each scss file and put the comments string into the styleComments
    var foundComments = commentsFinder.findCommentsInDirectory(rootSrcPath, srcMask, grunt);

    var sections = {};
    //loop through all of the styleComments and create style sections and style-elements
    var pageSections = kssCommentsParser.convertKccCommentsToSectionObjects(foundComments,grunt);

    // in addition to the pages generated from the KSS comments create an index / overview page
    var indexPage = {
        sectionName: "index",
        sectionTitle: "Overview",
        description: "No overview Markdown file found",
        level: 1
    };

    if (grunt.file.exists(overviewMarkdownFile)) {
        indexPage.description = grunt.file.read(overviewMarkdownFile);
        indexPage.srcPath = overviewMarkdownFile;
    }
    // add overview as first
    sections["index"] = indexPage;

    // sort pageSections by weight
    pageSections = sortOnWeight(pageSections);
    // and append to sections (overview on top)
    _.extend(sections, pageSections);

    //using the sections array create a set of pages that use the template
    for (var sectionKey in sections) {
        var section = sections[sectionKey];
        if (typeof(section) === 'object') {

            var indexPageTemplateName = options.template;
            var currentPage = {
                data: {
                    layout: indexPageTemplateName
                },
                dest: options.dest + "/" + sectionKey.toLowerCase() + ".html"
            };

            //merge the page data into the context
            currentPage.data = _.merge(currentPage.data, section);
            currentPage.data.sections = sections;

            var generate = true;
            //check if modified
            if (options.onlyModified &&  grunt.file.exists(currentPage.dest) && currentPage.data.srcPath && grunt.file.exists(currentPage.data.srcPath)){
                var sourceStats = fs.statSync(currentPage.data.srcPath);
                var destStats = fs.statSync(currentPage.dest);
                if (sourceStats.mtime<=destStats.mtime){
                    generate = false;
                }
            }

            if (generate){
                pages.push(currentPage);
            }
        }
    }

    callback();

};


module.exports.options = {
    stage: 'assemble:post:pages'
};
