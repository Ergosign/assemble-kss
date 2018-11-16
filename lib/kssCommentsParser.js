var path = require('path');

var sectionRegex = /styleguide\s.*(?=\n)/i;

var kssCommentsParser = module.exports;

kssCommentsParser.addSubSectionsToObject = function (subSections, parentSection, kssOptions, pathToRootSection, baseHtmlFileName, sectionRefs) {
  'use strict';

  if (pathToRootSection === null || pathToRootSection === undefined) {
    pathToRootSection = '';
  }

  if (sectionRefs === null || sectionRefs === undefined) {
    sectionRefs = [];
  }

  // test Hack.Hack.Hack
  if (/Hack/.test(subSections[0].trim())) {
    return;
  }
  //check that the section name is valid
  if (subSections[0].length === 0 || subSections[0] === '') {
    return parentSection;
  }

  if (parentSection.sectionTitle !== null && parentSection.sectionTitle !== undefined) {
    // Add the current sections title to the sectionRefs array that holds all section titles
    // up to the root. This is necessary to display the path to the current component in the
    // search results.
    sectionRefs.push(parentSection.sectionTitle);
  }

  // the name of the current section
  // e.g. when the path is: some.path.xyz
  // then the currentName is 'some'
  var currentSectionName = subSections[0].trim();

  // replace whitespace in file names with a dash
  var currentSectionNameWithoutWhitespace = currentSectionName.replace(/ /g, '-');

  if (parentSection.level === 1) {
    if (baseHtmlFileName === null || baseHtmlFileName === undefined) {
      baseHtmlFileName = currentSectionNameWithoutWhitespace + '.html';
    }
  }

  //check if this section name already exists before creating
  if (!parentSection[subSections[0]]) {
    var htmlFilePath;
    var alternativeHtmlFilePath;
    var alternative2HtmlFilePath;
    var destinationPath;
    var sectionRef = 'sectionRef';

    // create a unique identifier for the section. This is possible by appending the names of all
    // parent sections plus the name of the current section.
    for (var i = 0; i < sectionRefs.length; i++) {
      sectionRef = sectionRef + '-' + sectionRefs[i].trim().replace(/ /g, '-').toLowerCase();
    }
    sectionRef = sectionRef + '-' + currentSectionNameWithoutWhitespace;

    if (parentSection.level === 1) {
      // this section is the top level section
      // therefore give the html file the same name as the section
      // example: sectionabc-test/sectionabc-test.html
      htmlFilePath = currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternativeHtmlFilePath = 'alternative-' + currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternative2HtmlFilePath = 'alternative2-' + currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      destinationPath = './' + 'overview-' + currentSectionNameWithoutWhitespace.replace(/\//, '') + '.html';

    } else if (parentSection.level > 1) {
      // otherwise the path for the html file is relative from the root section
      // example: sectionabc-test/some-sub-section/someFinalSection.html
      htmlFilePath = pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternativeHtmlFilePath = 'alternative-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternative2HtmlFilePath = 'alternative2-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';

      destinationPath = './' + 'overview-' + baseHtmlFileName.replace(/\//, '') + '#' + sectionRef;
    }

    parentSection[currentSectionName] = {
      sectionName: currentSectionName,
      level: parentSection.level + 1,
      htmlFile: htmlFilePath,
      alternativeHtmlFile: alternativeHtmlFilePath,
      alternative2HtmlFile: alternative2HtmlFilePath,
      sectionLocation: sectionRefs,
      sectionRef: sectionRef,
      destPath: destinationPath
    };
  }

  // save the path to the root section and pass it to recursive function calls
  if (pathToRootSection === '') {
    // first section
    pathToRootSection = currentSectionNameWithoutWhitespace;
  } else {
    // all subsequent sections must be separated by a slash
    pathToRootSection = pathToRootSection + '_' + currentSectionNameWithoutWhitespace;
  }

  //load this section
  var currentSection = parentSection[currentSectionName];
  //go deeper if required
  if (subSections.length > 1) {
    var remainingSections = subSections.slice(1);
    return kssCommentsParser.addSubSectionsToObject(remainingSections, currentSection, kssOptions, pathToRootSection, baseHtmlFileName, sectionRefs);
  }

  //return this section if there are no children.
  return currentSection;
};

/**
 * split variation string in name and description
 * @param: variations array with string
 * @return Array object {name, description}
 * */
kssCommentsParser.splitVariations = function (variations) {

  var returnArray = [];

  variations.forEach(function (variation) {

    var vName, vDescription;

    // match until " -"
    var classes = variation.match(/(?:(?!\s\-).)*/i);
    if (classes !== null && classes.length > 0) {
      vName = classes[0];
      vName = vName.trim();
    } else {
      return;
    }

    // get description
    vDescription = variation.replace(vName, "");

    if (!vDescription) {
      vDescription = '';
    }
    vDescription = vDescription.replace("-", "").trim();

    // create class(es)
    var vClass = vName.replace(/\./g, ' ').trim();

    //this is a variation and should return the psuedo-classes
    vClass = vClass.replace(/:/, ' pseudo-class-').trim();

    returnArray.push({
      variationName: vName,
      variationDescription: vDescription,
      variationClass: vClass.split(" ")
    });
  });

  return returnArray;

};
/*
 /!**
 * convert state object into variations object
 * *!/
 kssCommentsParser.convertStateToVariation = function (stateObject) {

 return {
 variationName: stateObject.stateName,
 variationDescription: stateObject.stateDescription,
 variationClass: stateObject.stateClass
 };
 };

 /!**
 * prefix modifier state with 'pseudo-class-'
 * *!/
 kssCommentsParser.getStateModifierFrom = function (state) {
 var stateName = state.replace(":", "");
 return "pseudo-class-" + stateName;
 };

 /!**
 * split state string array into array of state objects
 * *!/
 kssCommentsParser.splitStates = function (states) {

 var returnArray = [];

 states.forEach(function (str) {

 var array = str.split("-");

 if (array.length > 1) {
 returnArray.push({
 stateName: array[0].trim(),
 stateDescription: array[1].trim(),
 stateClass: kssCommentsParser.getStateModifierFrom(array[0].trim())
 });
 }
 });
 return returnArray;
 };

 /!**
 * merge array of states objects into array of variations array
 * *!/
 kssCommentsParser.mergeStatesWithVariations = function (variations, states) {

 if (!variations || variations === 'undefined' || variations === null) {
 variations = [];
 }
 if (!states || states === 'undefined' || variations === null) {
 return variations;
 }

 for (var i = 0; i < states.length; i++) {
 variations.push(kssCommentsParser.convertStateToVariation(states[i]));
 }
 return variations;
 };*/

/**
 * split property line into property object of
 * propertyName
 * propertyValue or propertyValues as [] sperated by ,
 * */
kssCommentsParser.addPropertyObject = function (el, properties) {

  var nameValue = el.split(":");

  if (nameValue[0] && nameValue[1]) {

    // use lowercase of name
    var name = nameValue[0].toLowerCase();

    // get values
    var values = nameValue[1].split(",");

    // values seperated by ","
    if (values.length > 0) {
      for (var i = 0; i < values.length; i++) {
        values[i] = values[i].trim();
      }
      //values.map(function(v) {return v.trim(); });

      properties[name.trim()] = values;
    }
  }
};

function _getJSOJNPath (markup, srcPath) {

  var mName = markup.split(".").slice(0, -1).join("."); // remove extension
  mName = mName.replace(/\s*/, "");   //  remove spaces
  var dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
  //var path = dirname + "/" + mName + ".json";
  mName += ".json";

  return path.join(dirname, mName);

  //return path.trim();
}

/**
 * get information of a styleguide comment
 *
 * / *
 * title
 *
 * description
 *
 * Markup: *.hbs || <html>
 *
 * .variations
 *
 * :states
 *
 * property: x, y
 *
 * Styleguide Section.Subsection
 * * /
 *
 * */
kssCommentsParser.getSectionObjectOfKssComment = function (cssCommentPathObject, sections, grunt, kssOptions) {

  var cssComment = cssCommentPathObject.comment;
  var srcPath = cssCommentPathObject.srcPath;

  //check if it is a KSS comment block
  if (sectionRegex.test(cssComment)) {

    //strip out the start and end comment markers
    cssComment = cssComment.replace(/\/\*.*\n?/, "");
    cssComment = cssComment.replace(/\n\*\/.*\n?/, "");

    //put the comment lines in an array
    var cssLines = cssComment.split("\n");

    //use last line as the style information and remove from the array
    var sectionData = cssLines.pop();
    sectionData = sectionData.replace(/styleguide\s/i, "").toLowerCase();

    //create a section object and any required parent objects
    var sectionObject = kssCommentsParser.addSubSectionsToObject(sectionData.split("."), sections, kssOptions);

    if (!sectionObject) {
      return -1;
    }

    sectionObject.srcPath = srcPath;

    //take the title from the first line and removes from array
    var sectionTitle = cssLines.shift().trim();
    sectionObject.sectionTitle = sectionTitle;

    // test if array have more lines
    if (cssLines.length <= 0) {
      return sectionObject;
    }

    //remove empty first and last lines
    if (cssLines[0].length === 0) {
      cssLines.shift();
    }
    if (cssLines.length > 0 && cssLines[cssLines.length - 1].length === 0) {
      cssLines.pop();
    }

    // check if the comment contains markup
    var markupCommentIndex = -1;
    var commentContainsMarkup = cssLines.some(function (element, index) {
      var markupTest = new RegExp("markup:", "i").test(element);
      if (markupTest) {
        markupCommentIndex = index;
        return true;
      }
      //if (element.search(/Markup:/i) === 0) {
      //    markupCommentIndex = index;
      //    return true;
      //}
      return false;
    });

    // check if the comment contains alternative markup
    var alternativeMarkup;
    var commentContainsAlternativeMarkup = cssLines.some(function (element, index) {
      var alternativeMarkupTest = new RegExp("alternative-markup:", "i").test(element);
      if (alternativeMarkupTest) {
        alternativeMarkup = element;
        return true;
      }
      return false;
    });
    var alternativeScss;
    var commentContainsAlternativeScss = cssLines.some(function (element, index) {
      var alternativeScssTest = new RegExp("alternative-scss-file:", "i").test(element);
      if (alternativeScssTest) {
        alternativeScss = element.replace(/alternative-scss-file:/i, '').trim();
        return true;
      }
      return false;
    });
    if (commentContainsAlternativeScss && alternativeScss) {
      var alternativeSrcPath = srcPath.substring(0, srcPath.lastIndexOf("/") + 1);
      sectionObject.alternativeSrcPath = alternativeSrcPath + alternativeScss;
    }

    var alternative2Markup;
    var commentContainsAlternative2Markup = cssLines.some(function (element, index) {
      var alternative2MarkupTest = new RegExp("alternative2-markup:", "i").test(element);
      if (alternative2MarkupTest) {
        alternative2Markup = element;
        return true;
      }
      return false;
    });
    var alternative2Scss;
    var commentContainsAlternative2Scss = cssLines.some(function (element, index) {
      var alternative2ScssTest = new RegExp("alternative2-scss-file:", "i").test(element);
      if (alternative2ScssTest) {
        alternative2Scss = element.replace(/alternative2-scss-file:/i, '').trim();
        return true;
      }
      return false;
    });
    if (commentContainsAlternative2Scss && alternative2Scss) {
      var alternative2SrcPath = srcPath.substring(0, srcPath.lastIndexOf("/") + 1);
      sectionObject.alternative2SrcPath = alternative2SrcPath + alternative2Scss;
    }

    //get the description and remove from the lines
    var descriptionLines = [];//cssLines;
    if (commentContainsMarkup) {
      descriptionLines = cssLines.slice(0, markupCommentIndex);
      cssLines = cssLines.slice(markupCommentIndex);
      //} else {
      //    cssLines = [];
      //}
      descriptionLines = descriptionLines.join('  \n');//2 spaces for a markdown new line ;-)
      descriptionLines = descriptionLines.replace(/^\s+|\s+$/g, '');
      if (descriptionLines !== "") {
        sectionObject.description = descriptionLines.trim();
      }
    }
    //sectionObject.descriptionHTML = descriptionLines.join('<br/>');

    /**
     * variations block
     * **/
      // check if variations are available (start with .)
      // get variations
    var variationsIndexStart = -1;
    var variationsIndexEnd = -1;
    var variations = [];
    var commentContainsVariations = cssLines.some(function (element, index, array) {
      if (element.search(/^(\.|\:)\w+/i) === 0) {   /* ^\..* */
        // found variations start
        if (variationsIndexStart === -1) {
          variationsIndexStart = index;
        }
        // found variations end
        variationsIndexEnd = index;

        variations.push(element);
      }
      if (index === array.length - 1 && variations.length > 0) {
        return true;
      }
      return false;
    });

    var markupLines = -1;

    // get markup above variations
    // remove variations if available
    // leave properties below variations in cssLines
    if (commentContainsVariations) {
      //TODO if variations without markup are allowed: descriptionLines = cssLines.slice(0, variationsIndexStart);

      //var variationLines = cssLines.slice(variationIndexStart, variationIndexEnd);
      markupLines = cssLines.slice(0, variationsIndexStart);

      cssLines = cssLines.slice(variationsIndexEnd + 1);
      sectionObject.variations = kssCommentsParser.splitVariations(variations);
    }

    /**
     * properties block
     * **/
      //load further properties
      // check if line starts with 'propertyName:' (but not 'Markup:', 'Angular-Markup:)
    var propertiesIndexStart = -1;
    var propertiesIndexEnd = -1;
    var properties = {};
    var commentContainsProperties = cssLines.some(function (el, ind, ar) {
      if (el.search(/^([a-zA-Z0-9_-]+(?=:))(?!::)/gi) === 0) {
        if (el.search(/Markup:/i) !== 0 && el.search(/Angular-Markup:/i) !== 0) {
          if (propertiesIndexStart === -1) {
            propertiesIndexStart = ind;
          }
          propertiesIndexEnd = ind;
          kssCommentsParser.addPropertyObject(el, properties);
        }
      }
      if (ind === ar.length - 1 && /*!_.isEmpty(properties)*/ Object.keys(properties).length !== 0) {
        return true;
      }
      return false;
    });

    if (commentContainsProperties) {
      // if comments contains properties and no markup (assumption: no variations)
      if (!commentContainsMarkup) {
        descriptionLines = cssLines.slice(0, propertiesIndexStart);
        descriptionLines = descriptionLines.join('\n');
        descriptionLines = descriptionLines.replace(/^\s+|\s+$/g, '');
        if (descriptionLines !== "") {
          sectionObject.description = descriptionLines.trim();
        }

        // comments contain markup and not already defined by variations
      } else if (markupLines === -1) {
        markupLines = cssLines.slice(0, propertiesIndexStart);
      }
      cssLines = cssLines.slice(propertiesIndexEnd + 1);
      sectionObject.properties = properties;
    }

    // if comments does not contain markup, variations an no properties
    if (!commentContainsMarkup && !commentContainsProperties && !commentContainsVariations) {
      // no properties and no markup but description
      descriptionLines = cssLines;
      descriptionLines = descriptionLines.join('\n');
      if (descriptionLines !== "") {
        sectionObject.description = descriptionLines.trim();
      }
      cssLines = [];
    }

    //load the markup
    if (markupLines === -1) {
      markupLines = cssLines;
    }
    var markup = markupLines.join("\n");

    //test if markup is available
    var markupAvailable = new RegExp("^\s*Markup:\s*", "i").test(markup);
    // test if anuglar-markup is available
    var angularMarkupAvailable = new RegExp("^\s*Angular-Markup:\s*", "i").test(markup);

    var path, data, alternativePath, alternativeData, alternative2Path, alternative2Data;
    var jsonFileName;
    var alternativeJsonFileName, alternative2JsonFileName;
    if (sectionObject.properties && sectionObject.properties['json-file'] && sectionObject.properties['json-file'][0]) {
      jsonFileName = sectionObject.properties['json-file'][0];
    }
    if (sectionObject.properties && sectionObject.properties['alternative-json-file'] && sectionObject.properties['alternative-json-file'][0]) {
      alternativeJsonFileName = sectionObject.properties['alternative-json-file'][0];
    }
    if (sectionObject.properties && sectionObject.properties['alternative2-json-file'] && sectionObject.properties['alternative2-json-file'][0]) {
      alternative2JsonFileName = sectionObject.properties['alternative2-json-file'][0];
    }
    if (markupAvailable) {
      markup = markup.replace(/^\s*Markup:\s*/i, "");
      sectionObject.markup = markup.trim();

      // if markup from hbs file add data context if available
      if (markup.search(/.*\.hbs/gi) === 0) {

        //var mName = markup.replace(/\.hbs\s*/i, ""); // remove extension
        //mName = mName.replace(/\./, "-");  // remove dots
        //mName = mName.replace(/\s*/, "");   //  remove spaces
        //var dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
        //var path = dirname + "/" + mName + ".json";
        //path = path.trim();

        // use json file specified by json-file
        if (jsonFileName) {
          path = _getJSOJNPath(jsonFileName, srcPath);
        } else {
          path = _getJSOJNPath(markup, srcPath);
        }
        if (grunt.file.exists(path)) {
          try {
            data = grunt.file.readJSON(path);

            // webfont hack
            if (data.hasOwnProperty("cssTemplate") &&
              data.hasOwnProperty("fontBaseName") &&
              (data.hasOwnProperty("engine") && data.engine === "fontforge") &&
              data.cssTemplate.hasOwnProperty("template")) {
              delete data.cssTemplate.template;
            }
            if (data) {
              sectionObject.markupContext = data;
              sectionObject.markupContextPath = jsonFileName;
            }
          }
          catch (exception) {
            console.warn("cannot parse json file (" + path + ")");
          }

        }
      }
    } else if (angularMarkupAvailable) {
      var angularMarkup;
      angularMarkup = markup.replace(/^\s*Angular-Markup:\s/i, "");

      var dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
      //get angular Markup from file
      var angularMarkupPath = dirname + "/" + angularMarkup.trim();
      if (grunt.file.exists(angularMarkupPath)) {
        var angularMarkupData;
        try {
          angularMarkupData = grunt.file.read(angularMarkupPath);
          if (angularMarkupData) {
            sectionObject.angularMarkup = angularMarkupData.trim();
            sectionObject.angularMarkupPath = angularMarkup;
          }
        }
        catch (exception) {
          console.warn("cannot parse angularMarkup (" + angularMarkupPath + ")");
        }

      }

      // use json file specified by json-file
      if (jsonFileName) {
        path = _getJSOJNPath(jsonFileName, srcPath);
      } else {
        // read json file depending on angular file name
        path = _getJSOJNPath(angularMarkup, srcPath);
      }
      if (grunt.file.exists(path)) {
        try {
          data = grunt.file.readJSON(path);
          if (data) {
            sectionObject.angularContext = data;
            sectionObject.angularContextPath = jsonFileName;
          }
        }
        catch (exception) {
          console.warn("cannot parse json file of angular (" + path + ")");
        }
      }
    }

    if (commentContainsAlternativeMarkup && alternativeMarkup !== undefined) {
      alternativeMarkup = alternativeMarkup.replace(/^\s*alternative-Markup:\s*/i, "");
      sectionObject.alternativeMarkup = alternativeMarkup.trim();

      // if markup from hbs file add data context if available
      if (alternativeMarkup.search(/.*\.hbs/gi) === 0) {

        // use json file specified by json-file
        if (alternativeJsonFileName) {
          alternativePath = _getJSOJNPath(alternativeJsonFileName, srcPath);
        } else {
          alternativePath = _getJSOJNPath(alternativeMarkup, srcPath);
        }
        if (grunt.file.exists(alternativePath)) {
          try {
            alternativeData = grunt.file.readJSON(alternativePath);

            if (alternativeData) {
              sectionObject.alternativeMarkupContext = alternativeData;
              sectionObject.alternativeMarkupContextPath = alternativeJsonFileName;
            }
          }
          catch (exception) {
            console.warn("cannot parse json file (" + alternativePath + ")");
          }

        }
      }
    }

    if (commentContainsAlternative2Markup && alternative2Markup !== undefined) {
      alternative2Markup = alternative2Markup.replace(/^\s*alternative2-Markup:\s*/i, "");
      sectionObject.alternative2Markup = alternative2Markup.trim();

      // if markup from hbs file add data context if available
      if (alternative2Markup.search(/.*\.hbs/gi) === 0) {

        // use json file specified by json-file
        if (alternative2JsonFileName) {
          alternative2Path = _getJSOJNPath(alternative2JsonFileName, srcPath);
        } else {
          alternative2Path = _getJSOJNPath(alternative2Markup, srcPath);
        }
        if (grunt.file.exists(alternative2Path)) {
          try {
            alternative2Data = grunt.file.readJSON(alternative2Path);

            if (alternative2Data) {
              sectionObject.alternative2MarkupContext = alternative2Data;
              sectionObject.alternativ2eMarkupContextPath = alternative2JsonFileName;
            }
          }
          catch (exception) {
            console.warn("cannot parse json file (" + alternative2Path + ")");
          }

        }
      }
    }

    return sectionObject;
  }
  return -1;
};

kssCommentsParser.convertKccCommentsToSectionObjects = function (inputComments, grunt, kssOptions) {
  var sections = {
    level: 0
  };

  inputComments.forEach(function (cssComment) {
    kssCommentsParser.getSectionObjectOfKssComment(cssComment, sections, grunt, kssOptions);
  });

  return sections;
};
