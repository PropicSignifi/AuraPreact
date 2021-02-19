import StorageProviders from './storage.data';

const getStorageProvider = providerName => {
    const provider = _.find(StorageProviders, ['name', providerName]);
    if(!provider) {
        throw new Error('Invalid storage provider name');
    }

    return provider;
};

const load = (providerName, key, defaultValue) => {
    const provider = getStorageProvider(providerName);
    const storageKey = provider.getKey(key);
    const content = window.localStorage.getItem(storageKey);

    if(provider.type === 'JSON') {
        if(!content) {
            return defaultValue;
        }

        try {
            return JSON.parse(content);
        }
        catch(e) {
            return defaultValue;
        }
    }
    else {
        return content || defaultValue;
    }
};

const save = (providerName, key, value) => {
    const provider = getStorageProvider(providerName);
    const storageKey = provider.getKey(key);

    let content = null;
    if(provider.type === 'JSON') {
        content = JSON.stringify(value);
    }
    else {
        content = _.toString(value);
    }

    window.localStorage.setItem(storageKey, content);
};

const Storage = {
    load,
    save,
};

window.$Storage = Storage;

export default Storage;
