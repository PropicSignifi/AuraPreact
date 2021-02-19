import {
    Utils,
} from 'components';

const api = {
    setConfig: (path, value) => {
        return window.$ActionService.DataLightningExtension.invoke('setConfig', {
            path,
            value,
        });
    },

    addConfigItem: item => {
        if(item.values && _.isString(item.values)) {
            item.values = _.chain(item.values).split(';').compact().value();
        }

        return window.$ActionService.DataLightningExtension.invoke('addConfigItem', {
            item: JSON.stringify(item),
        });
    },

    deleteConfigItem: path => {
        return window.$ActionService.DataLightningExtension.invoke('removeConfigItem', {
            path,
        });
    },

    loadSystemConfigs: () => {
        return window.$ActionService.DataLightningExtension.invoke('registerConfigs', {});
    },
};

export default api;
