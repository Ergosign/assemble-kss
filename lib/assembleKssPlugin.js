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
 * Get a formatted date string from the given date
 * in a german date format (e.g.: '01.01.1970').
 */
function formattedDateAsString (date) {
  var options = {year: 'numeric', month: 'numeric', day: 'numeric'};

  return date.toLocaleDateString('de-DE', options);
}

/**
 * sort sections object by weight
 * @param dict: sections object
 * @return sorted sections object
 * */
function sortOnWeight (dict) {

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

/**
 * In order to render the styleguide examples in an iframe they must be written
 * to separate html files. This means each section and subsection must be in its
 * own html file. This method generates the necessary html files recursively for
 * all subsections (and nested subsections) for the given section.
 * @param sectionKey The key of the section that should be written to an html file (as well as its subsections)
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param options The assemble kss options (json object) as defined in Gruntfile.js
 * @param pages List of pages that will be rendered by assemble
 */
function createHtmlIframeFilesForSection (sectionKey, section, options, pages) {
  'use strict';

  // index page does not need to
  // be rendered in an iframe
  if (sectionKey !== 'index') {

    // create html file for the given section
    var firstPage = {
      data: {
        layout: options.templateIframe
      },
      dest: options.dest + "/" + section.htmlFile,
    };

    // merge the page data into the context
    firstPage.data = _.merge(firstPage.data, section);

    pages.push(firstPage);

    // recursively create html files for all subsections
    createHtmlIframeFilesForSubsections(section, options, pages);
  }
}

/**
 * Recursive function that creates html files for each of the given sections subsections.
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param options The assemble kss options (json object) as defined in Gruntfile.js
 * @param pages List of pages that will be rendered by assemble
 */
function createHtmlIframeFilesForSubsections (section, options, pages) {
  'use strict';

  for (var subSectionKey in section) {
    var subSection = section[subSectionKey];

    // Iterate over all properties of a section object. Subsections are stored under their
    // name. Therefore the only way to find out if the current property contains a section
    // is to check if its an object and has a property 'sectionName'.
    if (typeof(subSection) === 'object' && subSection.sectionName !== undefined) {

      // generate an html page for the current subsection
      var subSectionPage = {
        data: {
          layout: options.templateIframe
        },
        dest: options.dest + "/" + subSection.htmlFile,
      };

      // merge the page data into the context
      subSectionPage.data = _.merge(subSectionPage.data, subSection);

      pages.push(subSectionPage);

      // recursively create html files for all subsections
      createHtmlIframeFilesForSubsections(subSection, options, pages);
    }
  }
}

/**
 * Creates an html file for the given section.
 * @param sectionData The data specific to the section that is written to an html file.
 * @param sectionName The name of the section that is written to an html file.
 * @param allSections The array containing all sections (not only the current section and its subsections) This is necessary to create
 * the navigation bar.
 * @param parentSectionName The name of the parent section. Necessary to detect which navigation item must be active when this page
 * is displayed.
 * @param options The assemble kss options (json object) as defined in Gruntfile.js
 * @param grunt The grunt options as defined in Gruntfile.js
 * @param pages The assemble.options.pages array that contains all the pages that should be rendered to files.
 */
function createHtmlFileForSection (sectionData, sectionName, navBarItems, parentSectionName, options, grunt, pages) {
  'use strict';

  var filePath = '/' + sectionName.toLowerCase() + '.html';
  var buildDate = formattedDateAsString(new Date());

  var indexPageTemplateName = options.template;
  var currentPage = {
    data: {
      layout: indexPageTemplateName
    },
    dest: options.dest + filePath
  };

  // add build date to data so that it
  // can be displayed in the styleguide
  sectionData.buildDate = buildDate;

  //merge the page data into the context
  currentPage.data = _.merge(currentPage.data, sectionData);
  currentPage.data.navBarItems = navBarItems;
  currentPage.data.subSections = sectionData;
  currentPage.data.parentSectionName = parentSectionName;

  var generate = true;
  //check if modified
  if (options.onlyModified && grunt.file.exists(currentPage.dest) && currentPage.data.srcPath && grunt.file.exists(currentPage.data.srcPath)) {
    var sourceStats = fs.statSync(currentPage.data.srcPath);
    var destStats = fs.statSync(currentPage.dest);
    if (sourceStats.mtime <= destStats.mtime) {
      generate = false;
    }
  }

  if (generate) {
    pages.push(currentPage);

    if (options.templateIframe !== undefined) {
      // only generate html files for iframes if iframe layout specified
      createHtmlIframeFilesForSection(sectionName, sectionData, options, pages);
    }
  }
}

/**
 * Check if the given object is a section in the style guide.
 * @param object The object to test
 * @returns true if the given object is a section in the style guide and false if not.
 */
function isSection (object) {
  return typeof(object) === 'object' && object.sectionName !== undefined;
}

/**
 * Get a list that holds all information necessary to display the navigation bar.
 * The list contains of first level navigation items and nested second level navigation items.
 * @param sections All sections of the style guide but with all information like markup, description and so
 * on that are not necessary to build the navigation. This function will use this list and comprise it to
 * only hold the information that is necessary to display the navigation.
 * @returns An object representing the navigation bar. The object has the following properties:
 * {
 *   "someFirstLevelNavigationItem": {
 *      sectionTitle: string,
 *      sectionName: string,
 *      level: number,
 *      "someSecondLevelNavigationItem": {
   *      sectionTitle: string,
   *      sectionName: string,
   *      level: number,
 *      }
 *   }
 * }
 */
function getListOfNavBarItems (sections) {
  var navBarItems = {};

  for (var sectionKey in sections) {
    var section = sections[sectionKey];
    var subSections = [];

    if (isSection(section)) {
      var firstLevelNavItem = {
        sectionName: section.sectionName,
        sectionTitle: section.sectionTitle,
        level: section.level,
        subSections: subSections
      };

      for (var subSectionKey in section) {
        var subSection = section[subSectionKey];

        if (isSection(subSection) && subSection.level === 2) {
          var secondLevelNavItem = {
            sectionName: subSection.sectionName,
            sectionTitle: subSection.sectionTitle,
            level: subSection.level
          };

          firstLevelNavItem.subSections.push(secondLevelNavItem);
        }
      }
      navBarItems[sectionKey] = firstLevelNavItem;
    }
  }
  console.log(JSON.stringify(navBarItems, null, 4));
  return navBarItems;
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

  var overviewMarkdownFile = options.overviewMarkdownFile || rootSrcPath + "/documentation/styleguide.md";

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
  var pageSections = kssCommentsParser.convertKccCommentsToSectionObjects(foundComments, grunt);

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

  // write a file containing all sections and their data. This file is used by the search.
  grunt.file.write(options.dataDestination + '/search-index.json', JSON.stringify(sections, null, 4));

  var navBarItems = getListOfNavBarItems(sections);

  for (var sectionKey in sections) {
    var section = sections[sectionKey];

    if (sectionKey === 'index') {

      // create html file for the index page
      createHtmlFileForSection(section, sectionKey, navBarItems, sectionKey, options, grunt, pages);
    }
    else if (typeof(section) === 'object' && section.sectionName !== undefined) {
      // now only create pages for each second level page (e.g. not for first level like Building Blocks
      // but for second level like Entry Field (each control on a separate page)
      for (var subSectionKey in section) {
        var subSection = section[subSectionKey];
        if (typeof(subSection) === 'object' && subSection.sectionName !== undefined) {
          createHtmlFileForSection(subSection, subSectionKey, navBarItems, sectionKey, options, grunt, pages);
        }
      }
    }
  }
  callback();

};

module.exports.options = {
  stage: 'assemble:post:pages'
};
