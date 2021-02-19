(function(window) {
    const FUNCTION_REGEX = /function\s?\w*\((.*)\)/;

    /*
     * Convert computed properties into a list
     */
    // normalizeComputedProperties :: ComputedProperties -> [ComputedProperty]
    const normalizeComputedProperties = computedProperties => {
        return _.chain(computedProperties).
            map((func, name) => {
                const result = new RegExp(FUNCTION_REGEX).exec(func.toString());
                if(!result) {
                    throw new Error("Invalid computed property functions for: " + name);
                }
                const params = _.chain(result[1]).
                    split(",").
                    map(_.trim).
                    value();
                return {
                    name,
                    params,
                    func,
                };
            }).
            value();
    };

    /*
     * Convert computed properties to list of computed properties mapped by attribute name
     */
    // convertComputedProperties :: ComputedProperties -> Result
    const convertComputedProperties = computedProperties => {
        const list = normalizeComputedProperties(computedProperties);
        const result = {};
        _.each(list, computedProperty => {
            _.each(computedProperty.params, param => {
                if(!result[param]) {
                    result[param] = [];
                }
                const watchers = result[param];
                watchers.push(computedProperty);
            });
        });

        return result;
    };

    /*
     * Computed properties are like:
     * {
     *     name: function(param1, param2) { ... },
     *     ...
     * }
     */
    // getComputedChangeHandlers :: (Component, String, ComputedProperties) -> ChangeHandlers
    const getComputedChangeHandlers = (cmp, rootName, computedProperties) => {
        const watchers = convertComputedProperties(computedProperties);
        return _.chain(watchers).
            mapValues((list, param) => {
                return function() {
                    _.each(list, item => {
                        const args = _.map(item.params, p => p && cmp.get('v.' + p));
                        const data = item.func.apply(null, args);
                        if(window.$Utils.isPromise(data)) {
                            data.then($A.getCallback(function(asyncData) {
                                cmp.set('v.' + rootName + '.' + item.name, asyncData);
                            }));
                        }
                        else {
                            cmp.set('v.' + rootName + '.' + item.name, data);
                        }
                    });
                };
            }).
            value();
    };

    const $Computed = {
        getComputedChangeHandlers,
    };

    window.$Computed = $Computed;
})(window);
