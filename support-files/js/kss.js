(function () {

    var KssStateGenerator = (function () {

        var _addRules = function (rules) {
            var idx, _len2, rule, pseudos, replaceRule;
            pseudos = new RegExp("(\\:" + (pseudo_selectors.join('|\\:')) + ")", "g");

            replaceRule = function (matched, stuff) {
                return matched.replace(/\:/g, '.pseudo-class-');
            };

            var newInlineStyleSheet = "";

            for (idx = 0, _len2 = rules.length; idx < _len2; idx++) {
                rule = rules[idx];
                if (rule.type !== CSSRule.STYLE_RULE) {
                    newInlineStyleSheet += _addRules(rule);
                }
                if (pseudos.test(rule.selectorText) && rule.selectorText.indexOf("-icon") == -1) {
                    var newRule = rule.cssText.replace(pseudos, replaceRule);
                    newInlineStyleSheet += (newRule);
                }
                newInlineStyleSheet += (rule.cssText);
                pseudos.lastIndex = 0;
            }
            return newInlineStyleSheet;
        };


        var pseudo_selectors;

        pseudo_selectors = ['hover', 'enabled', 'disabled', 'active', 'visited', 'focus', 'checked'];

        function KssStateGenerator() {
            var  idxs, stylesheet, _i, _len, _ref, _ref2, newInlineStyleSheet;

            //create a new inline style sheet
            var styleEl;
            styleEl = document.getElementById('inline-kss-hack');
            styleEl.type = 'text/css';

            newInlineStyleSheet = "";

            try {
                _ref = document.styleSheets;

                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    stylesheet = _ref[_i];
                    if (stylesheet.href && stylesheet.href.indexOf(document.domain) >= 0 && stylesheet.href.indexOf("styles.css") >= 0) {
                        idxs = [];
                        _ref2 = stylesheet.cssRules;
                        newInlineStyleSheet += _addRules(_ref2);
                    }
                }

                var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                var is_ie = navigator.userAgent.toLowerCase().indexOf('trident') > -1;

                if (is_firefox || is_ie) {
                    var images = new RegExp("\.\.\/img\/", "g");
                    var font = new RegExp("\.\.\/font\/", "g");

                    //console.log(newInlineStyleSheet,newInlineStyleSheet.match(images));
                    newInlineStyleSheet = (newInlineStyleSheet.replace(images, "included/img/"));
                    newInlineStyleSheet = (newInlineStyleSheet.replace(font, "included/font/"));
                }

                styleEl.innerHTML = newInlineStyleSheet;


            } catch (_error) {
                console.log("Error processing pseudo classes: " + _error)
            }

        }

        return KssStateGenerator;

    })();

    new KssStateGenerator;

}).call(this);

var KssShowHideMarkup = function (target) {
    var markupObject = $(target).parents('.kss-modifier__wrapper').find('.kss-markup');
    $(markupObject[0]).toggleClass('markup-collapsed');
};