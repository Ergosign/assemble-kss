var KssStateGenerator;
(function () {


    KssStateGenerator = (function () {
        var pseudo_selectors;

        pseudo_selectors = ['hover', 'enabled', 'disabled', 'active', 'visited', 'focus', 'checked'];

        function KssStateGenerator() {
            var idx, idxs, pseudos, replaceRule, rule, stylesheet, _i, _len, _len2, _ref, _ref2, newInlineStyleSheet, newInlineStyleSheetDesktop, linkedStyleSheet;
            pseudos = new RegExp("(\\:" + (pseudo_selectors.join('|\\:')) + ")", "g");

            replaceRule = function (matched, stuff) {
                return matched.replace(/\:/g, '.pseudo-class-');
            };

            //create a new inline style sheet
            var styleEl;
            styleEl = document.getElementById('inline-kss-hack');
            styleEl.innerHTML = "";
            styleEl.type = 'text/css';

            //create a new inline style sheet
            var styleElDesktop;
            styleElDesktop = document.getElementById('inline-kss-hack-desktop');
            styleElDesktop.innerHTML = "";

            newInlineStyleSheet = "";
            newInlineStyleSheetDesktop = "";

            try {
                _ref = document.styleSheets;

                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    stylesheet = _ref[_i];
                    if (stylesheet.ownerNode && stylesheet.ownerNode.id && stylesheet.ownerNode.id === "kss-breakpoint-mobile") {
                        idxs = [];
                        _ref2 = stylesheet.cssRules;
                        for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
                            rule = _ref2[idx];
                            if (rule.type !== CSSRule.STYLE_RULE) {
                                continue;
                            }
                            if (pseudos.test(rule.selectorText) && rule.selectorText.indexOf("-icon") == -1) {
                                var newRule = rule.cssText.replace(pseudos, replaceRule);
                                newInlineStyleSheet += (newRule);
                            }
                            newInlineStyleSheet += (rule.cssText);
                            pseudos.lastIndex = 0;
                        }

                    } else if (stylesheet.ownerNode && stylesheet.ownerNode.id && stylesheet.ownerNode.id === "kss-breakpoint-desktop") {
                        idxs = [];
                        _ref2 = stylesheet.cssRules;
                        for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
                            rule = _ref2[idx];
                            if (rule.type !== CSSRule.STYLE_RULE) {
                                continue;
                            }
                            if (pseudos.test(rule.selectorText) && rule.selectorText.indexOf("-icon") == -1) {
                                var newRule2 = rule.cssText.replace(pseudos, replaceRule);
                                newInlineStyleSheet += (newRule2);
                            }
                            newInlineStyleSheetDesktop += (rule.cssText);
                            pseudos.lastIndex = 0;
                        }
                    }
                }


                var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                var is_ie = navigator.userAgent.toLowerCase().indexOf('trident') > -1;

                if (is_firefox || is_ie) {
                    var images = new RegExp("\.\.\/\.\.\/img\/", "g");
                    var font = new RegExp("\.\.\/font\/", "g");

                    //console.log(newInlineStyleSheet,newInlineStyleSheet.match(images));
                    newInlineStyleSheet = (newInlineStyleSheet.replace(images, "included/img/"));
                    newInlineStyleSheet = (newInlineStyleSheet.replace(font, "included/font/"));

                    newInlineStyleSheetDesktop = (newInlineStyleSheetDesktop.replace(images, "included/img/"));
                    newInlineStyleSheetDesktop = (newInlineStyleSheetDesktop.replace(font, "included/font/"));
                }


                styleEl.innerHTML = newInlineStyleSheet;
                styleElDesktop.innerHTML = newInlineStyleSheetDesktop;


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
