(function () {
    var selectors = [],
        beautifier = [],
        util = {
            getIndexByType: function (elem) {
                var parent = elem.parent();
                if (!parent) return 1;
                var siblings = parent.children(elem.prop('tagName'));
                return siblings.index(elem);
            },
            getClassNameArray: function (elem) {
                var classnames = elem.prop('className'),
                    blacklist = ['abs'];
                if (!classnames || classnames.length === 0) return [];
                return classnames.split(' ').filter(function (className) {
                    if (blacklist.indexOf(className) >= 0) return false;
                    return true;
                });
            },
            concat: function (prefix, postfix) {
                if (postfix) return prefix + ' ' + postfix;
                return prefix;
            },
            attrCheck: function (str) {
                return function (current) {
                    var attr = current.attr(str),
                        tagName = current.prop('tagName').toLowerCase();
                    if (attr) return tagName + '[' + str + '="' + attr + '"]';
                };
            },
            getSelector: function (current, start, selector) {
                // do not go further if nothing, document or body is reached
                if (current.length === 0) return selector;
                if (current.get(0) === document) return selector;
                if (current.prop('tagName') === 'BODY') return selector;

                var parent = current.parent(),
                    recursiveResult;
                // check if already unique
                if (parent.find(selector).length === 1) {
                    recursiveResult = util.getSelector(parent, start, selector);
                    if (recursiveResult) return recursiveResult;
                }
                for (var i = 0; i < selectors.length; i++) {
                    var evalulate = selectors[i],
                        result = evalulate(current, start),
                        newSelector = util.concat(result, selector);
                    if (!result) continue;
                    if (parent.find(newSelector).length === 1) {
                        recursiveResult = util.getSelector(parent, start, newSelector);
                        if (recursiveResult) return recursiveResult;
                    } else if (current !== start) {
                        return;
                    }
                }
            },
        };

    /*
     * Add selectors to the list
     * A selector function should return a possible selector (or null, if no approprate selector found)
     * The order of the evaluators is equal to their priority. The first evaluator is used first
     * If the result selector is not unique, the next selector will be used
     */
    (function () {
        // for the first element, check for tagName. Is sufficient for many cases
        selectors.push(function (current, start) {
            if (current === start) return current.prop('tagName').toLowerCase();
        });

        // check if the element has a io-ox-* class. This is quite unique and should be used if possible
        selectors.push(function (current) {
            var classnames = util.getClassNameArray(current);
            for (var i = 0; i < classnames.length; i++) {
                var name = classnames[i];
                if (/^io-ox-.*$/.test(name)) return '.' + name;
            }
        });

        // check, if one of those data-* attributes is present and use them (used by toolbars, dropdowns etc. )
        selectors.push(util.attrCheck('data-action'), util.attrCheck('data-value'), util.attrCheck('data-section'), util.attrCheck('data-name'));

        // check, if an element with a role has a class, which makes the element unique related to it's siblings
        // if not, check if the role is unique
        selectors.push(function (current) {
            // check for classes if has role
            var attr = current.attr('role');
            if (!attr) return;
            var classnames = util.getClassNameArray(current);
            for (var i = 0; i < classnames.length; i++) {
                var siblings = current.siblings('.' + classnames[i]);
                if (siblings.length === 0) return '.' + classnames[i];
            }
            if (!classnames.length) return;
            return '.' + classnames.join('.');
        }, util.attrCheck('role'));

        // if an element is inside a dropdown, it should also use that selector, because .dropdown.open is usually unique
        selectors.push(function (current) {
            if (current.hasClass('dropdown open')) return '.dropdown.open';
        });

        // select a classname, which makes the element unique related to it's siblings
        selectors.push(function (current) {
            var classnames = util.getClassNameArray(current);
            for (var i = 0; i < classnames.length; i++) {
                var siblings = current.siblings('.' + classnames[i]);
                if (siblings.length === 0) return '.' + classnames[i];
            }
        });

        // extensionpoints sometimes use data-extion-id. That is also quite unique
        selectors.push(util.attrCheck('data-extension-id'));

        // last but not least, check with a nth-of-type selector, which is a fallback and should always work
        selectors.push(function (current) {
            var tagName = current.prop('tagName').toLowerCase(),
                nthOfType = util.getIndexByType(current) + 1;
            if (!tagName || tagName.length === 0) return;
            return tagName + ':nth-of-type(' + nthOfType + ')';
        });
    }());

    (function () {
        // add io-ox-* class, if inside window container
        beautifier.push(function (selector, elem) {
            if (/\.io-ox-/.test(selector)) return;
            var window = elem.closest('.window-container');
            if (!window.length) return;
            var classnames = util.getClassNameArray(window);
            for (var i = 0; i < classnames.length; i++) {
                if (/\io-ox-/.test(classnames[i])) {
                    var newSelector = util.concat('.' + classnames[i], selector);
                    if ($(newSelector).length === 1) return newSelector;
                }
            }
        });

        // add data-app-name if inside window container and has no io-ox-* class
        beautifier.push(function (selector, elem) {
            if (/\.io-ox-/.test(selector)) return;
            var window = elem.closest('.window-container');
            if (!window.length) return;
            var tagName = window.prop('tagName').toLowerCase(),
                dataAppName = window.attr('data-app-name');
            selector = util.concat(tagName + '[data-app-name="' + dataAppName + '"]', selector);
            if ($(selector).length === 1) return selector;
        });

        // add .dropdown.open if inside dropdown
        beautifier.push(function (selector, elem) {
            if (/\.dropdown\.open/.test(selector)) return;
            var dropdownContainer = elem.closest('.dropdown.open');
            if (!dropdownContainer.length) return;
            selector = util.concat('.dropdown.open', selector);
            if ($(selector).length === 1) return selector;
        });

    })();

    window.getCSSPath = function (elem) {
        elem = $(elem);
        var selector = util.getSelector(elem, elem);
        if (selector) {
            for (var i = 0; i < beautifier.length; i++) {
                var beautify = beautifier[i],
                    result = beautify(selector, elem);
                if (result) selector = result;
            }
        }
        return selector;
    };

})();
