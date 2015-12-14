var _ = require('lodash');

var assembleKssUtils = require('./utils');
var assembleHandlbarsHelpers = require('./handlebars-helpers/ownKssHelper.js');

module.exports = function (params, callback) {

    var assemble = params.assemble;
    var grunt = params.grunt;
    var pages = assemble.options.pages;
    var options = assemble.options.kss || {};

    //register the required handlebars helpers
    var handlebars = assemble.engine.engine['handlebars'];
    assembleHandlbarsHelpers.register(handlebars);

    //load the options and set defaults
    var rootSrcPath = options.src || 'src/scss';
    var srcMask = options.src_mask;

    options.src_mask = options.src_mask || /.scss/;

    var overviewMarkdownFile = options.overviewMarkdownFile || "documentation/styleguide.md";

    // If the mask is a string, convert it into a RegExp.
    if (!(options.src_mask instanceof RegExp)) {
            options.src_mask = new RegExp(
            '(?:' + options.src_mask.replace(/\./g, '\\.').replace(/\*/g, '.*') + ')$'
        );
    }

    //load each scss file and put the comments string into the styleComments
    var foundKssCommentsPaths = assembleKssUtils.findKssCommentsInDirectory(rootSrcPath, srcMask, grunt);

    //loop through all of the styleComments and create style sections and style-elements
    var sections = assembleKssUtils.getSectionObjects(foundKssCommentsPaths, grunt);

    // in addition to the pages generated from the KSS comments create an index / overview page
    var indexPage = {
        sectionName: "index",
        sectionTitle: "Overview",
        description:  "No overview Markdown file found",
        level: 1
    };

    if (grunt.file.exists(rootSrcPath + overviewMarkdownFile)){
        indexPage.description = grunt.file.read(rootSrcPath + overviewMarkdownFile);
    }
    sections["index"] = indexPage;

    //using the sections array create a set of pages that use the template
   for (var sectionKey in sections) {
       var section = sections[sectionKey];
       if (typeof(section) === 'object') {

           var indexPageTemplateName = options.template;
           var currentPage = {
               data: {
                   layout: indexPageTemplateName
               },
               dest: options.dest + "/" + sectionKey + ".html"
           };

           //merge the page data into the context
           currentPage.data = _.merge(currentPage.data, section);
           currentPage.data.sections = sections;
           pages.push(currentPage);
       }
   }

    callback();

};


module.exports.options = {
    stage: 'assemble:post:pages'
};