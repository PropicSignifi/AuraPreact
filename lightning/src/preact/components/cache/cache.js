import Storage from '../storage/storage';

const loadCache = key => {
    return Storage.load('Cache', key, {});
};

const saveCache = (key, cache) => {
    return Storage.save('Cache', key, cache || {});
};

const getKey = (state, globalKey, keyProvider) => {
    let key = null;
    if(_.isFunction(keyProvider)) {
        key = keyProvider(state);
    }
    key = key ? globalKey + '.' + key : globalKey;

    return key;
};

export default (globalKey, fields, keyProvider) => {
    let lastState = null;

    return {
        onStateInit: state => {
            const newState = _.assign({}, state);
            const key = getKey(state, globalKey, keyProvider);
            const cache = loadCache(key);
            _.each(fields, field => {
                const val = _.get(cache, field) || _.get(state, field);
                _.set(newState, field, val);
            });
            lastState = newState;

            return newState;
        },

        onStateUpdate: state => {
            let changed = false;
            _.each(fields, field => {
                const val = _.get(state, field);
                if(_.get(lastState, field) !== val) {
                    changed = true;
                    _.set(lastState, field, val);
                }
            });

            window.setTimeout(() => {
                const key = getKey(state, globalKey, keyProvider);
                const cache = loadCache(key);
                _.each(fields, field => {
                    const val = _.get(lastState, field);
                    _.set(cache, field, val);
                });
                saveCache(cache);
            }, 0);

            return state;
        },
    };
};
