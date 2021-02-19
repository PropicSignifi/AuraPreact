import { h, render, Component } from 'preact';
import {
    FlatPanel,
    Tree,
    Form,
    FormGroup,
    FormTile,
    FormActions,
    Button,
    ButtonIcon,
    Spinner,
    Input,
    Illustration,
    RadioGroup,
    TableManager,
    FormattedDateTime,
    Modal,
    Picklist,
    ButtonMenu,
    MenuItem,
    Textarea,

    renderField,
    createStore,
    Provider,
    connect,
    Config,
    Utils,
} from 'components';
import api from './configTree.api';
import actions from './configTree.actions';
import styles from './configTree.less';

const newStore = () => createStore({
    treeData: [],
    tableData: [],
    selectedItem: null,
    selectedItemVal: null,
    loading: false,
    searchText: null,
    displayType: 'tree',
    newConfigItem: null,
    selected: [],
    showImportModal: false,
    importContent: null,
});

const prettyJSON = str => {
    try {
        if(_.isString(str)) {
            return JSON.stringify(JSON.parse(str), null, 4);
        }
        else {
            return JSON.stringify(str, null, 4);
        }
    }
    catch(e) {
        Utils.catchError(e);
    }
};

const compactJSON = str => {
    try {
        return JSON.stringify(JSON.parse(str));
    }
    catch(e) {
        Utils.catchError(e);
    }
};

const typeOptions = _.chain(Config.Types)
    .values()
    .map(value => {
        return {
            label: value,
            value,
        };
    })
    .sortBy('label')
    .value();

const renderEditor = (item, val, onConfigItemChange) => {
    const defaultProps = {
        name: item.path,
        label: item.path,
        tooltip: item.tooltip,
        disabled: _.includes(item.path, '[Readonly]'),
        value: val === null ? Config.getValue(item.path) : val,
        onValueChange: onConfigItemChange,
    };

    switch(item.type) {
        case 'Boolean':
            return renderField('Input', _.assign({}, defaultProps, {
                type: 'checkbox-big',
                checkStyle: 'label',
            }));
        case 'Integer':
        case 'Long':
            return renderField('Integer', _.assign({}, defaultProps));
        case 'Double':
        case 'Decimal':
            return renderField('Number', _.assign({}, defaultProps));
        case 'Date':
            return renderField('DatePicker', _.assign({}, defaultProps));
        case 'DateTime':
            return renderField('DatetimePicker', _.assign({}, defaultProps));
        case 'Picklist':
            return renderField('Enum', _.assign({}, defaultProps, {
                values: item.values,
            }));
        case 'MultiPicklist':
            return renderField('Picklist', _.assign({}, defaultProps, {
                select: 'multiple',
                options: _.map(item.values, value => {
                    return {
                        label: value,
                        value,
                    };
                }),
                value: _.chain(defaultProps.value).split(';').compact().value(),
                onValueChange: newVal => defaultProps.onValueChange(_.join(newVal, ';')),
            }));
        case 'JSON':
            return renderField('Textarea', _.assign({}, defaultProps, {
                auto: true,
                value: prettyJSON(defaultProps.value),
                onValueChange: newVal => defaultProps.onValueChange(compactJSON(newVal)),
            }));
        case 'Password':
            return renderField('Input', _.assign({}, defaultProps, {
                type: 'password',
            }));
        default:
            return renderField('Input', _.assign({}, defaultProps));
    }
};

const filterTree = (tree, searchText) => {
    if(!searchText) {
        return tree;
    }
    else {
        if(_.isArray(tree)) {
            return _.chain(tree)
                .map(item => filterTree(item, searchText))
                .compact()
                .value();
        }

        if(_.includes(_.toLower(tree.name), _.toLower(searchText)) || _.includes(_.toLower(tree.description), _.toLower(searchText))) {
            return tree;
        }
        else if(_.isEmpty(tree.items)){
            return null;
        }
        else {
            const children = filterTree(tree.items, searchText);

            if(_.isEmpty(children)) {
                return null;
            }
            else {
                return _.assign({}, tree, {
                    items: children,
                });
            }
        }
    }
};

const displayTypeOptions = [
    {
        label: 'Config Tree',
        value: 'tree',
    },
    {
        label: 'Config Table',
        value: 'table',
    },
    {
        label: 'Definitions',
        value: 'definitions',
    },
];

let lastEditedIndex = null;

const columns = [
    {
        name: 'Path__c',
        header: 'Path',
        type: 'String',
        locked: true,
    },
    {
        name: 'Type__c',
        header: 'Type',
        type: 'String',
    },
    {
        name: 'Description__c',
        header: 'Description',
        type: 'String',
    },
    {
        name: 'link_to_static_resource',
        header: 'Link to Static Resource',
        cell: (item, callbacks, context) => {
            if(item.Type__c === 'Extension') {
                const names = _.chain(item.Value__c)
                    .trim()
                    .split(';')
                    .value();

                return (
                    <div className="slds-grid">
                        {
                            _.map(names, name => {
                                return (
                                <a onClick={ () => context.boundActions.openStaticResource(name) } className="slds-m-horizontal_x-small">
                                    { name }
                                </a>
                                );
                            })
                        }
                    </div>
                );
            }
        },
    },
    {
        name: 'Value__c',
        header: 'Value',
        cell: (item, callbacks, context) => {
            if(item.Type__c === 'Date') {
                return (
                    <FormattedDateTime type="date" value={ Config.getValue(item.Path__c) }></FormattedDateTime>
                );
            }
            else if(item.Type__c === 'DateTime') {
                return (
                    <FormattedDateTime type="datetime" value={ Config.getValue(item.Path__c) }></FormattedDateTime>
                );
            }
            else if(item.Type__c === 'Password') {
                return (
                    <span>******</span>
                );
            }
            else {
                return (
                    <div className="slds-truncate">
                        { _.toString(Config.getValue(item.Path__c)) }
                    </div>
                );
            }
        },
        editor: (item, callbacks, context) => {
            let val = item.Value__c;
            if(item.Type__c === 'Boolean') {
                val = val === 'true';
            }

            return renderEditor({
                path: item.Path__c,
                tooltip: item.Description__c,
                type: item.Type__c,
                values: _.chain(item.Values__c).split(';').compact().value(),
            }, val, newVal => {
                lastEditedIndex = callbacks.row.index;
                callbacks.updateItem(callbacks.row.index, {
                    Value__c: _.toString(newVal),
                });
            });
        },
        searchBy: 'Value__c',
        filterBy: 'String',
    },
    {
        name: 'actions',
        header: 'Actions',
        cell: (item, callbacks, context) => {
            return !_.includes(item.Path__c, '[Readonly]') && (
                <ButtonIcon
                    iconName="ctc-utility:a_delete"
                    iconClass="slds-icon-text-error"
                    variant="bare"
                    size="large"
                    onClick={ e => context.boundActions.deleteConfigItem(item.Path__c) }
                    alternativeText="Delete">
                </ButtonIcon>
            );
        },
    }
];

const configDefColumns = [
    {
        name: 'name',
        header: 'Name',
        type: 'String',
        locked: true,
    },
    {
        name: 'path',
        header: 'Config Path',
        type: 'String',
    },
    {
        name: 'type',
        header: 'Type',
        type: 'String',
    },
    {
        name: 'description',
        header: 'Description',
        cell: (item, callbacks, context) => {
            return (
                <div className={ styles.previewText }>
                    { item.description }
                </div>
            );
        },
        searchBy: 'description',
        filterBy: 'String',
    },
];

const ConfigTree = connect([
    "treeData",
    "tableData",
    "selectedItem",
    "selectedItemVal",
    "loading",
    "searchText",
    "displayType",
    "newConfigItem",
    "selected",
    "showImportModal",
    "importContent",
], actions, {
    name: 'ConfigTree',
    componentDidMount: function() {
        this.boundActions.init();
    },
})(
    ({
        treeData,
        tableData,
        selectedItem,
        selectedItemVal,
        loading,
        searchText,
        displayType,
        newConfigItem,
        selected,
        showImportModal,
        importContent,

        onItemSelected,
        onConfigItemChange,
        saveConfigItem,
        onSearchText,
        onDisplayTypeChange,
        onClose,
        onSave,
        onUpdateNewConfigItem,
        onSelect,
        onSelectAction,
        onSaveImport,
        onCloseImport,
        onImportContentChanged,
    }) => (
        <FlatPanel
            className={ styles.rootPanel }
            header="Config"
            style="brand"
        >
            <div className="slds-is-relative">
                {
                    loading && (
                    <Spinner></Spinner>
                    )
                }
                <div className="slds-align_absolute-center slds-p-around_medium">
                    <RadioGroup
                        label="Display Type"
                        name="displayType"
                        variant="label-removed"
                        style="select"
                        options={ displayTypeOptions }
                        value={ displayType }
                        onValueChange={ onDisplayTypeChange }
                    >
                    </RadioGroup>
                </div>
                <div className={ window.$Utils.classnames(
                    "slds-grid slds-size_1-of-1",
                    {
                        'slds-hide': displayType !== 'tree',
                    }
                    ) }>
                    <div className={ `slds-col ${styles.treePanel}` }>
                        <Input
                            type="search"
                            className="slds-m-bottom_medium"
                            label="Search"
                            name="search"
                            variant="label-removed"
                            value={ searchText }
                            onValueChange={ onSearchText }
                        >
                        </Input>
                        <Tree
                            data={ filterTree(treeData, searchText) }
                            selected={ selectedItem && selectedItem.id }
                            onSelect={ onItemSelected }
                        >
                        </Tree>
                    </div>
                    <div className="slds-box slds-col slds-m-horizontal_medium">
                        {
                            selectedItem && selectedItem.path ?
                            <Form name="configEditForm">
                                <FormGroup>
                                    <FormTile>
                                        {
                                            renderEditor(selectedItem, selectedItemVal, onConfigItemChange)
                                        }
                                    </FormTile>
                                </FormGroup>
                                <FormActions>
                                    <div className="slds-col_bump-left">
                                        <Button
                                            label="Save"
                                            variant="save"
                                            onClick={ () => saveConfigItem(selectedItem.path, selectedItemVal) }
                                        >
                                        </Button>
                                    </div>
                                </FormActions>
                            </Form>
                            :
                            <Illustration
                                className={ `slds-m-around_medium ${styles.illustration}` }
                                type="no_content"
                            >
                            </Illustration>
                        }
                    </div>
                </div>
                <TableManager
                    className={ displayType !== 'table' ? 'slds-hide': '' }
                    header="Config Items"
                    name="system_configItemsTable"
                    data={ tableData }
                    columns={ columns }
                    pageSize="10"
                    keyField="Id"
                    select="multiple"
                    selected={ selected }
                    onSelect={ onSelect }
                    onValueChange={ newVal => {
                        if(lastEditedIndex !== null) {
                            const item = newVal[lastEditedIndex];
                            saveConfigItem(item.Path__c, item.Value__c);
                        }
                    } }
                >
                    <div className="slds-col_bump-left">
                        <ButtonMenu
                            label="Actions"
                            variant="primary"
                            menuAlignment="bottom-right"
                            iconName="ctc-utility:a_up"
                            iconSize="medium"
                            name="actionsMenu"
                            onSelect={ onSelectAction }
                        >
                            <MenuItem label="New" value="new"></MenuItem>
                            <MenuItem label="Load System Configs" value="loadSystemConfigs"></MenuItem>
                            <MenuItem label="Import" value="import"></MenuItem>
                            <MenuItem label="Export" value="export"></MenuItem>
                        </ButtonMenu>
                    </div>
                </TableManager>
                <TableManager
                    className={ displayType !== 'definitions' ? 'slds-hide': '' }
                    header="Config Definitions"
                    name="system_configDefinitionsTable"
                    data={ _.sortBy(Config.getConfigDefinitions(), 'name') }
                    columns={ configDefColumns }
                    pageSize="10"
                    keyField="name"
                >
                </TableManager>
                <Modal
                    header="New Config Item"
                    visible={ !!newConfigItem }
                    onClose={ onClose }
                    footer={ (
                    <div>
                        <Button label="Cancel" variant="tertiary" onClick={ onClose }></Button>
                        <Button label="Save" variant="primary" type="submit" onClick={ onSave }></Button>
                    </div>
                    ) }
                >
                    <Form name="newConfigItem">
                        <FormGroup>
                            <FormTile>
                                <Input
                                    label="Path"
                                    name="path"
                                    required="true"
                                    value={ newConfigItem && newConfigItem.path }
                                    onValueChange={ newVal => onUpdateNewConfigItem('path', newVal) }
                                >
                                </Input>
                            </FormTile>
                            <FormTile>
                                <Picklist
                                    label="Type"
                                    name="type"
                                    options={ typeOptions }
                                    value={ newConfigItem && newConfigItem.type }
                                    onValueChange={ newVal => onUpdateNewConfigItem('type', newVal) }
                                >
                                </Picklist>
                            </FormTile>
                            <FormTile>
                                <Input
                                    label="Value"
                                    name="value"
                                    value={ newConfigItem && newConfigItem.value }
                                    onValueChange={ newVal => onUpdateNewConfigItem('value', newVal) }
                                >
                                </Input>
                            </FormTile>
                            <FormTile>
                                <Input
                                    label="Description"
                                    name="description"
                                    value={ newConfigItem && newConfigItem.description }
                                    onValueChange={ newVal => onUpdateNewConfigItem('description', newVal) }
                                >
                                </Input>
                            </FormTile>
                            <FormTile>
                                <Input
                                    label="Values"
                                    name="values"
                                    value={ newConfigItem && newConfigItem.values }
                                    onValueChange={ newVal => onUpdateNewConfigItem('values', newVal) }
                                >
                                </Input>
                            </FormTile>
                        </FormGroup>
                    </Form>
                </Modal>
                <Modal
                    header="Import Config Items"
                    visible={ showImportModal }
                    footer={ (
                    <div>
                        <Button label="Cancel" variant="tertiary" onClick={ onCloseImport }></Button>
                        <Button label="Import" variant="primary" type="submit" onClick={ onSaveImport }></Button>
                    </div>
                    ) }
                >
                    <Form name="importConfigItems">
                        <FormGroup>
                            <FormTile>
                                <Textarea
                                    label="Config Items JSON"
                                    name="content"
                                    required="true"
                                    value={ importContent }
                                    onValueChange={ onImportContentChanged }
                                >
                                </Textarea>
                            </FormTile>
                        </FormGroup>
                    </Form>
                </Modal>
            </div>
        </FlatPanel>
    )
);

export default ({ preactContainer, }) => {
    return (
        <Provider store={ newStore() }>
            <ConfigTree preactContainer={ preactContainer }></ConfigTree>
        </Provider>
    );
};
