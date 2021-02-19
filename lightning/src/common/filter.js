(function(window) {
    const filters = {};
    const cache = {};

    // addFilter :: (String, Function) -> _
    const addFilter = (name, filter) => {
        if(name && _.isFunction(filter) && filter.length === 1) {
            filters[name] = filter;
        }
        else {
            throw new Error(`Error when adding filter ${name}`);
        }
    };

    // removeFilter :: String -> _
    const removeFilter = name => {
        delete filters[name];
    };

    // getFilter :: String -> Function
    const getFilter = name => {
        return filters[name];
    };

    // getFilters :: () -> Filters
    const getFilters = () => {
        return filters;
    };

    // parse :: String -> Parsed
    const parse = expression => {
        if(!expression) {
            return expression;
        }

        if(cache[expression]) {
            return cache[expression];
        }
        else {
            const parsed = _.chain(expression).
                split("|").
                map((item, index) => {
                    item = _.trim(item);
                    if(index === 0) {
                        if(window.$Interpolation.isInterpolation(item)) {
                            return {
                                type: "Interpolation",
                                parsed: window.$Interpolation.parse(item),
                            };
                        }
                        else {
                            const parsed = window.$Script.parse(item);
                            return {
                                type: "Script",
                                parsed,
                            };
                        }
                    }
                    else {
                        let parsed = getFilter(item);
                        if(!parsed) {
                            parsed = window.$Script.evaluate(window.$Script.parse(item), window);
                        }

                        return {
                            type: "Filter",
                            parsed,
                        };
                    }
                }).
                value();
            cache[expression] = parsed;
            return cache[expression];
        }
    };

    // evaluateScript :: (Parsed, Context) -> Object
    const evaluateScript = (parsed, context) => {
        return window.$Script.evaluate(parsed, context);
    };

    // evaluateInterpolation :: (Parsed, Context) -> Object
    const evaluateInterpolation = (parsed, context) => {
        return window.$Interpolation.evaluate(parsed, context);
    };

    // evaluate :: (Parsed, Context) -> Object
    const evaluate = (parsed, context) => {
        return _.reduce(parsed, (prev, parsedItem) => {
            switch(parsedItem.type) {
                case 'Script':
                    return evaluateScript(parsedItem.parsed, context);
                case 'Interpolation':
                    return evaluateInterpolation(parsedItem.parsed, context);
                case 'Filter':
                    if(_.isFunction(parsedItem.parsed)) {
                        return parsedItem.parsed.call(null, prev);
                    }
                    else {
                        throw new Error("Invalid filter: " + _.toString(parsedItem.parsed));
                    }
                    break;
                default:
                    throw new Error("Unsupported type: " + parsedItem.type);
            }
        }, null);
    };

    // Add default filters
    addFilter("lowercase", _.toLower);
    addFilter("uppercase", _.toUpper);

    const $Filter = {
        addFilter,
        removeFilter,
        getFilter,
        getFilters,
        parse,
        evaluate,
    };

    window.$Filter = $Filter;
})(window);
