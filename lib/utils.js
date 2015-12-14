var commentBlockRegex = /\/\*(.|\n)*?\*\//gmi;
var sectionRegex = /styleguide\s.*(?=\n)/i;

var utils = module.exports;

utils.findKssCommentsInFile = function (filePath, grunt) {

    var returnArray = [];

    var fileContents = grunt.file.read(filePath);

    fileContents = fileContents.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var commentsFound = commentBlockRegex.exec(fileContents);

    while (commentsFound !== null) {
        returnArray.push({
            comment: commentsFound[0],
            srcPath: filePath
        });
        commentsFound = commentBlockRegex.exec(fileContents);
    }

    return returnArray;

};

utils.findKssCommentsInDirectory = function (directory, sourceMask, grunt) {

    var returnArray = [];

    grunt.file.recurse(directory, function (abspath, rootdir, subdir, filename) {
        if (grunt.file.isDir(abspath)) {
            var directoryArray = utils.findKssCommentsInDirectory(abspath, sourceMask, grunt);
            returnArray = returnArray.concat(directoryArray);
        } else if (grunt.file.isMatch(sourceMask, filename)) {
            var commentsInFile = utils.findKssCommentsInFile(abspath, grunt);
            returnArray = returnArray.concat(commentsInFile);
        }
    });

    return returnArray;
};

utils.addSubSectionsToObject = function (subSections, parentSection) {
    //check that the section name is valid
    if (subSections[0].length === 0 || subSections[0] === '') {
        return parentSection;
    }
    //check if this section name already exists before creating
    if (!parentSection[subSections[0]]) {
        parentSection[subSections[0]] = {
            sectionName: subSections[0],
            level: parentSection.level + 1
        };

    }
    //load this section
    var currentSection = parentSection[subSections[0]];
    //go deeper if required
    if (subSections.length > 1) {
        var remainingSections = subSections.slice(1);
        return utils.addSubSectionsToObject(remainingSections, currentSection);
    }
    //return this section if there are no children.
    return currentSection;
};

/**
 * split variation string in name and description
 * @param: variations array with string
 * @return array: object {name, description}
 * */
utils.splitVariations = function(variations) {

    var returnArray = [];


    variations.forEach(function (variation) {

        var vName, vDescription;

        // get name
        var nameArray = variation.match(/^\.[^\s]+/i);

        if (nameArray != null) {
            vName = nameArray[0];
        } else {
            return;
        }

        // get description
        vDescription = variation.replace(vName, "");
        vDescription.trim();

        returnArray.push({
            variationName: vName,
            variationDescription: vDescription
        });
    });

    return returnArray;

};

utils.getSectionObjectOfKssComment= function (cssCommentPathObject, sections, grunt) {

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
        sectionData = sectionData.replace(/styleguide\s/i, "");


        //create a section object and any required parent objects
        var sectionObject = utils.addSubSectionsToObject(sectionData.split("."), sections);

        sectionObject.srcPath = srcPath;

        //take the title from the first line and removes from array
        sectionObject.sectionTitle = cssLines.shift();

        // test if array have more lines
        if (cssLines.length <= 0){
            return -1;
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
            if (element.search(/Markup:/i) === 0) {
                markupCommentIndex = index;
                return true;
            }
            return false;
        });

        //get the description and remove from the lines
        var descriptionLines = [];//cssLines;
        if (commentContainsMarkup) {
            descriptionLines = cssLines.slice(0, markupCommentIndex);
            cssLines = cssLines.slice(markupCommentIndex);
            //} else {
            //    cssLines = [];
            //}
            descriptionLines = descriptionLines.join('\n');
            descriptionLines = descriptionLines.replace(/^\s+|\s+$/g, '');
            if (descriptionLines !== ""){
                sectionObject.description = descriptionLines.trim();
            }
        }
        //sectionObject.descriptionHTML = descriptionLines.join('<br/>');


        // check if variations are available (start with .)
        // get variations
        var variationsIndexStart = -1;
        var variationsIndexEnd = -1;
        var variations = [];
        var commentContainsVariations = cssLines.some(function (element, index, array) {
            if (element.search(/^\.\w+/i) === 0) {   /* ^\..* */
                // found variations start
                if (variationsIndexStart === -1){
                    variationsIndexStart = index;
                }
                // found variations end
                variationsIndexEnd = index;

                variations.push(element);
            }
            if (index === array.length - 1 && variations.length > 0){
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
            sectionObject.variations = utils.splitVariations(variations);
        }

        //load further properties
        // check if line starts with 'propertyName:' (but not 'Markup:')
        var propertiesIndexStart = -1;
        var propertiesIndexEnd = -1;
        var properties = [];
        var commentContainsProperties = cssLines.some(function (el, ind, ar) {
            if (el.search(/^(\w+(?=:))(?!::)/gi) === 0) {
                if (el.search(/Markup:/i) !== 0) {
                    if (propertiesIndexStart === -1){
                        propertiesIndexStart = ind;
                    }
                    propertiesIndexEnd = ind;
                    properties.push(el);
                }
            }
            if (ind === ar.length - 1 && properties.length > 0){
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
            if (descriptionLines !== ""){
                sectionObject.description = descriptionLines.trim();
            }
            cssLines = [];
        }

        //load the markup
        if (markupLines === -1) {
            markupLines = cssLines;
        }
        var markup = markupLines.join("\n");
        markup = markup.replace(/^\s*Markup:\s*/i, "");

        if (markup !== "") {
            sectionObject.markup = markup.trim();


            // if markup from hbs file add data context if available
            if (markup.search(/.*\.hbs/gi) === 0) {

                //TODO if context path is available us this instead of srcDirectory

                var mName = markup.replace(/\.hbs\s*/i, ""); // remove extension
                mName = mName.replace(/\./, "-");  // remove dots
                mName = mName.replace(/\s*/, "");   //  remove spaces
                var dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
                var path = dirname + "/" + mName + ".json";
                path = path.trim();

                if (grunt.file.exists(path)) {
                    var data = grunt.file.readJSON(path);
                    //var data = JSON.parse(JSON.stringify(cxtFile));
                    sectionObject.markupContext = data;
                }
            }
        }

        //console.log("object: " + JSON.stringify(sectionObject));


        return sectionObject;
    }
    return -1;
};



utils.getSectionObjects = function (foundKssCommentsPath, grunt){
    var sections = {
        level: 0
    };

    foundKssCommentsPath.forEach(function (cssComment) {
        utils.getSectionObjectOfKssComment(cssComment, sections, grunt);
    });
    return sections;
};

