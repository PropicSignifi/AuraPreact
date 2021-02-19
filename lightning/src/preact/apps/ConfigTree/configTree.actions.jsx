import {
    Config,
    DateTimeConvert,
    Utils,
} from 'components';
import api from './configTree.api';

const buildTree = configItems => {
    const tree = {};
    _.forEach(configItems, configItem => {
        const pathItems = _.chain(configItem.Path__c)
            .split('/')
            .compact()
            .value();

        addToTree(tree, pathItems, configItem);
    });

    return tree.items;
};

const addToTree = (node, pathItems, configItem) => {
    const [pathItem, ...restItems] = pathItems;
    const items = node.items || [];
    const oldItem = _.find(items, ['name', pathItem]);
    if(_.isEmpty(restItems)) {
        if(oldItem) {
            oldItem.tooltip = configItem.Description__c;
            oldItem.path = configItem.Path__c;
            oldItem.type = configItem.Type__c;
            oldItem.values = _.chain(configItem.Values__c)
                .split(';')
                .compact()
                .value();
        }
        else {
            const item = {
                id: _.uniqueId(),
                name: pathItem,
                type: configItem.Type__c,
                tooltip: configItem.Description__c,
                path: configItem.Path__c,
                values: _.chain(configItem.Values__c).split(';').compact().value(),
            };
            items.push(item);
        }
    }
    else {
        if(oldItem) {
            addToTree(oldItem, restItems, configItem);
        }
        else {
            const item = {
                id: _.uniqueId(),
                name: pathItem,
            };
            items.push(item);
            addToTree(item, restItems, configItem);
        }
    }

    node.items = _.sortBy(items, 'name');
};

const init = () => {
    const configItems = Config.getConfigItems();
    const tree = buildTree(configItems);
    return {
        treeData: tree,
        tableData: configItems,
    };
};

const actions = store => ({
    init: (state) => {
        return init();
    },

    onItemSelected: (state, newVal) => {
        return {
            selectedItem: newVal,
            selectedItemVal: null,
        };
    },

    onConfigItemChange: (state, newVal) => {
        return {
            selectedItemVal: newVal,
        };
    },

    saveConfigItem: (state, path, value) => {
        store.setState({
            loading: true,
        });

        const newVal = value !== null ? value : Config.getValue(path);
        const configItems = Config.getConfigItems();
        const configItem = _.find(configItems, ['Path__c', path]);
        if(configItem) {
            configItem.Value__c = newVal;
            let savedVal = newVal;
            if(configItem.Type__c === 'Date') {
                savedVal = DateTimeConvert.toBackendDateValue(savedVal);
            }
            else if(configItem.Type__c === 'DateTime') {
                savedVal = DateTimeConvert.toBackendDatetimeValue(savedVal);
            }
            else {
                savedVal = _.toString(savedVal);
            }

            api.setConfig(path, savedVal).then(data => {
                store.setState({
                    loading: false,
                });

                Utils.toast({
                    variant: 'success',
                    content: 'Config item saved successfully',
                });
            }, Utils.catchError);
        }
    },

    onSearchText: (state, newVal) => {
        return {
            searchText: newVal,
        };
    },

    onDisplayTypeChange: (state, newVal) => {
        return {
            displayType: newVal,
        };
    },

    onClose: state => {
        return {
            newConfigItem: null,
        };
    },

    onSave: state => {
        store.setState({
            loading: true,
        });

        api.addConfigItem(state.newConfigItem).then(data => {
            const configItems = Config.getConfigItems();
            const newConfigItem = {
                Id: data.Id,
                Path__c: state.newConfigItem.path,
                Type__c: state.newConfigItem.type,
                Value__c: state.newConfigItem.value,
                Description__c: state.newConfigItem.description,
                Values__c: _.join(state.newConfigItem.values, ';'),
            };
            configItems.push(newConfigItem);

            const newState = init();

            store.setState(_.assign(newState, {
                loading: false,
                newConfigItem: null,
            }));

            Utils.toast({
                variant: 'success',
                content: 'Config item added successfully',
            });
        });
    },

    onUpdateNewConfigItem: (state, key, value) => {
        return {
            newConfigItem: _.assign({}, state.newConfigItem, {
                [key]: value,
            }),
        };
    },

    deleteConfigItem: (state, path) => {
        Utils.alert({
            header: 'Delete Config Item',
            message: `Do you want to delete ${path}?`,
            onSave: () => {
                store.setState({
                    loading: true,
                });
                api.deleteConfigItem(path).then(data => {
                    const configItems = Config.getConfigItems();
                    _.remove(configItems, configItem => configItem.Path__c === path);

                    const newState = init();

                    store.setState(_.assign(newState, {
                        loading: false,
                    }));

                    Utils.toast({
                        variant: 'success',
                        content: 'Config item removed successfully',
                    });
                });
            },
        });
    },

    openStaticResource: (state, name) => {
        store.setState({
            loading: true,
        });

        Utils.loadStaticResource(name).then(data => {
            store.setState({
                loading: false,
            });

            Utils.openUrl(`/lightning/setup/StaticResources/page?address=%2F${data.id}`);
        });
    },

    onSelect: (state, newVal) => {
        store.setState({
            selected: _.compact(newVal),
        });
    },

    onSelectAction: (state, action) => {
        switch(action) {
            case 'new':
                store.setState({
                    newConfigItem: {},
                });
                break;
            case 'loadSystemConfigs':
                return api.loadSystemConfigs().then(() => {
                    window.location.reload();
                });
            case 'import':
                store.setState({
                    showImportModal: true,
                });
                break;
            case 'export':
                const selectedItems = _.chain(state.tableData)
                    .filter(item => {
                        return _.includes(state.selected, item.Id);
                    })
                    .map(item => _.omit(item, 'Id'))
                    .value();

                Utils.downloadFile(JSON.stringify(selectedItems), 'export.json', 'application/json');
                break;
            default:
                break;
        }
    },

    onSaveImport: state => {
        store.setState({
            loading: true,
            showImportModal: false,
        });

        window.$ActionService.DataLightningExtension.invoke('importConfigItems', {
            items: state.importContent,
        }).then(data => {
            store.setState({
                loading: false,
            });

            window.location.reload();
        });
    },

    onCloseImport: state => {
        store.setState({
            showImportModal: false,
        });
    },

    onImportContentChanged: (state, newVal) => {
        store.setState({
            importContent: newVal,
        });
    },
});

export default actions;
