(function(window) {
    const dataProducers = {};

    const dataCache = {};

    // isValidDataProducer :: Object -> Boolean
    const isValidDataProducer = dataProducer => {
        return _.isObject(dataProducer) && _.isFunction(dataProducer.produce);
    };

    // String -> String
    const getDataCacheKey = name => {
        return name;
    };

    // addDataProducer :: (String, Object) -> _
    const addDataProducer = (name, dataProducer) => {
        if(_.isString(name) && isValidDataProducer(dataProducer)) {
            dataProducers[name] = dataProducer;
        }
        else {
            throw new Error("Invalid data producer");
        }
    };

    // removeDataProducer :: String -> _
    const removeDataProducer = name => {
        delete dataProducers[name];
    };

    // getDataProducer :: String -> Object
    const getDataProducer = name => dataProducers[name];

    // getDataProducers :: () -> [Object]
    const getDataProducers = () => dataProducers;

    // resolveData :: (String, [Object], Resolve) -> _
    const resolveData = (name, data, resolve) => {
        dataCache[name] = data;
        resolve(_.cloneDeep(data));
    };

    // produce :: String -> Promise []
    const produce = name => {
        return new Promise((resolve, reject) => {
            const dataProducer = getDataProducer(name);
            if(dataProducer) {
                const key = getDataCacheKey(name);
                if(dataCache[key]) {
                    resolve(_.cloneDeep(dataCache[key]));
                }
                else {
                    const data = dataProducer.produce();
                    if(window.$Utils.isPromise(data)) {
                        data.then(d => {
                            resolveData(name, d, resolve);
                        });
                    }
                    else {
                        resolveData(name, data, resolve);
                    }
                }
            }
            else {
                resolve([]);
            }
        });
    };

    // Add sample data producer
    addDataProducer("dataProducers", {
        produce: function() {
            return [
                {
                    label: "- Select -",
                    value: "",
                },
                ..._.chain(Object.keys(dataProducers)).
                sortBy(_.identity).
                map(name => {
                    return {
                        label: name,
                        value: name,
                    };
                }).
                value()];
        },
    });

    addDataProducer("preact-apps", {
        produce: function() {
            return _.chain(window.PreactStore.getComponentNames()).
                map(name => {
                    return {
                        label: name,
                        value: name,
                    };
                }).
                value();
        },
    });

    const $DataProducer = {
        addDataProducer,
        removeDataProducer,
        getDataProducer,
        getDataProducers,
        produce,
    };

    window.$DataProducer = $DataProducer;
})(window);
