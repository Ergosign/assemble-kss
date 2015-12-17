module.exports.register = function (Handlebars) {
    Handlebars.registerHelper('isTeaser', function (options) {
        var currentSectionHeader = this.sectionTitle;

        var matchTeaser = currentSectionHeader.search(/Teaser/i);
        var matchSize = currentSectionHeader.search(/\[.*\]/i);

        if (matchTeaser !== -1 && matchSize !== -1) {
            return options.fn(this);
        }

        return options.inverse(this);
    });


    Handlebars.registerHelper('inclTeaserSize', function (teaserSize, options) {
        var currentSectionHeader = this.sectionTitle;
        if (!currentSectionHeader) {
            return options.inverse(this);
        }

        var matchTeaser = currentSectionHeader.search(/Teaser/i);
        var matchSize = currentSectionHeader.search(/\[.*\]/i);

        if (matchTeaser !== -1 && matchSize !== -1) {
            var sizesString = currentSectionHeader.match(/\[.*\]/i);
            /* better but does not work: \[([^]]+)\] */

            if (sizesString === 'undefined') {
                return options.inverse(this);
            }

            sizesString = sizesString.join(" ");
            sizesString = sizesString.replace("[", "");
            sizesString = sizesString.replace("]", "");

            var splitFileNameArray = sizesString.split(',');

            var match = splitFileNameArray.some(function (value, index, array) {
                if (value.search(teaserSize) === 0) {
                    return true;
                }
                return false;
            });

            if (match) {
                return options.fn(this);
            }
        }

        return options.inverse(this);
    });

};