var commentBlockRegex = /\/\*(.|\n)*?\*\//gmi;

var commentsFinder = module.exports;

commentsFinder.findKssCommentsInFile = function (filePath, grunt) {

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

commentsFinder.findCommentsInDirectory = function (directory, sourceMask, grunt) {

    var returnArray = [];

    grunt.file.recurse(directory, function (abspath, rootdir, subdir, filename) {
        if (grunt.file.isDir(abspath)) {
            var directoryArray = commentsFinder.findCommentsInDirectory(abspath, sourceMask, grunt);
            returnArray = returnArray.concat(directoryArray);
        } else if (grunt.file.isMatch(sourceMask, filename)) {
            var commentsInFile = commentsFinder.findKssCommentsInFile(abspath, grunt);
            returnArray = returnArray.concat(commentsInFile);
        }
    });

    return returnArray;
};




