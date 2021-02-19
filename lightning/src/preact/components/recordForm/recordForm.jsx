import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';
import Spinner from '../spinner/spinner';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import FormActions from '../form/formActions';
import ExpandableSection from '../expandableSection/expandableSection';
import renderField from '../renderField/renderField';
import ComponentField from '../field/componentField';
import FormattedNumber from '../formattedNumber/formattedNumber';
import FormattedDateTime from '../formattedDateTime/formattedDateTime';
import SuggestionBox from '../suggestionBox/suggestionBox';
import Picklist from '../picklist/picklist';
import Button from '../button/button';
import Modal from '../modal/modal';
import Topbar from '../topbar/topbar';
import styles from './styles.less';
import { $require, } from '../modules/modules';

const getLayoutName = (apiName, layoutName) => {
    return _.startsWith(layoutName, `${apiName}-`) ? layoutName : `${apiName}-${layoutName}`;
};

const isValidItem = (item, type) => {
    return item && item.name && item.label;
};

const convertPageLayout = (layout, type, referenceMappings) => {
    const pageLayout = {
        groups: [],
    };

    const layoutSections = type === 'view' ? layout.detailLayoutSections : layout.editLayoutSections;

    _.forEach(layoutSections, layoutSection => {
        const group = {
            detailHeading: false,
            editHeading: false,
            columns: [],
        };

        group.label = layoutSection.heading;
        group.detailHeading = (type === 'view');
        group.editHeading = (type === 'edit');

        for(let i = 0; i < layoutSection.columns; i++) {
            group.columns.push({
                items: [],
            });
        }

        for(let layoutRow of layoutSection.layoutRows) {
            for(let i = 0; i < layoutSection.columns; i++) {
                const layoutItem = layoutRow.layoutItems[i];
                if(layoutItem && layoutItem.label) {
                    const layoutComponent = _.first(layoutItem.layoutComponents);
                    const groupItem = {
                        name: layoutComponent.value,
                        field: layoutComponent.value,
                        label: layoutItem.label,
                        type: _.toUpper(layoutComponent.details.type),
                        tooltip: layoutComponent.details.inlineHelpText,
                        canEdit: layoutComponent.details.updateable,
                        canCreate: layoutComponent.details.createable,
                        canView: true,
                        referenceTypes: _.map(layoutComponent.details.referenceTo, v => {
                            return {
                                label: referenceMappings[v] || v,
                                value: v,
                            };
                        }),
                        options: layoutComponent.details.picklistValues,
                    };

                    if(layoutItem.required) {
                        groupItem.behavior = 'Required';
                    }
                    else if(layoutItem.editableForNew || layoutItem.editableForUpdate) {
                        groupItem.behavior = 'Edit';
                    }
                    else {
                        groupItem.behavior = 'Readonly';
                    }

                    group.columns[i].items.push(groupItem);
                }
                else {
                    group.columns[i].items.push(null);
                }
            }
        }

        pageLayout.groups.push(group);
    });

    return pageLayout;
};

const extractReferenceKeysFromApiLayout = (layout, type) => {
    const layoutSections = type === 'view' ? layout.detailLayoutSections : layout.editLayoutSections;
    return _.chain(layoutSections)
        .flatMap('layoutRows')
        .flatMap('layoutItems')
        .flatMap('layoutComponents')
        .flatMap(cmp => cmp.details.referenceTo)
        .uniq()
        .value();
};

const extractReferenceKeysFromFieldsResult = fieldsData => {
    return _.chain(fieldsData)
        .values()
        .flatMap('referenceTo')
        .uniq()
        .value();
};

const extractFieldNamesFromResourceLayout = layout => {
    return _.chain(_.get(layout, 'groups'))
        .flatMap('columns')
        .flatMap('items')
        .map('name')
        .value();
};

const describeLayout = (props) => {
    const {
        sObjectName,
        apiName,
        layoutName,
        recordTypeApiName,
        resourceName,
        layout,
        type,
    } = props;

    if(resourceName || layout) {
        const loadedLayout = layout ? Promise.resolve(layout) : $require(resourceName);
        return loadedLayout.then(layout => {
            const fieldNames = extractFieldNamesFromResourceLayout(layout);

            return window.$ActionService.DataLightningExtension.invoke('describeFields', {
                sObjectName,
                fields: _.join(fieldNames, ';'),
            }).then(fieldInfos => {
                const referenceKeys = extractReferenceKeysFromFieldsResult(fieldInfos);

                return window.$ActionService.DataLightningExtension.invoke('describeObjects', {
                    sObjectNames: _.join(referenceKeys, ';'),
                }).then(referenceMappings => {
                    _.forEach(_.get(layout, 'groups'), group => {
                        _.forEach(group.columns, column => {
                            _.forEach(column.items, item => {
                                const fieldInfo = fieldInfos[item.name];
                                if(!fieldInfo) {
                                    return;
                                }

                                item.field = item.name;
                                item.canView = true;
                                item.canCreate = fieldInfo.createable;
                                item.canEdit = fieldInfo.updateable;
                                if(!fieldInfo.nillable && fieldInfo.type !== 'boolean') {
                                    item.behavior = 'Required';
                                }
                                else if(item.canCreate || item.canEdit) {
                                    item.behavior = 'Edit';
                                }
                                else {
                                    item.behavior = 'Readonly';
                                }
                                item.label = fieldInfo.label;
                                item.type = _.toUpper(fieldInfo.type);
                                item.tooltip = fieldInfo.inlineHelpText;
                                item.options = fieldInfo.picklistValues;
                                item.controllerName = fieldInfo.controllerName;
                                item.referenceTypes = _.map(fieldInfo.referenceTo, v => {
                                    return {
                                        label: referenceMappings[v] || v,
                                        value: v,
                                    };
                                });
                            });
                        });
                    });

                    return layout;
                });
            });
        });
    }
    else if(recordTypeApiName) {
        return Utils.restRequest(this.getPreactContainerName(), {
            url: `/services/data/v44.0/sobjects/${sObjectName}/describe/layouts`,
            method: 'get',
        }).then(({ layouts, recordTypeMappings, }) => {
            const recordTypeMapping = _.find(recordTypeMappings, ['developerName', recordTypeApiName]);
            const layout = _.find(layouts, ['id', _.get(recordTypeMapping, 'layoutId')]);
            if(layout) {
                const referenceKeys = extractReferenceKeysFromApiLayout(layout, type);
                return window.$ActionService.DataLightningExtension.invoke('describeObjects', {
                    sObjectNames: _.join(referenceKeys, ';'),
                }).then(referenceMappings => {
                    return convertPageLayout(layout, type, referenceMappings);
                });
            }
        });
    }
    else if(layoutName) {
        return window.$ActionService.DataLightningExtension.invoke('describe', {
            sObjectName,
            layoutName: getLayoutName(apiName || sObjectName, layoutName),
        });
    }
};

export default class RecordForm extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            pageLayout: null,
            countries: [],
            baseData: {},
            data: {},
            references: {},
            loading: false,
            pageLayoutFound: true,
        });

        this.$items = {};
        this.$form = null;
        this.$controllerChangeListeners = [];
    }

    setForm(node) {
        this.$form = node;
    }

    initRecordForm(props) {
        const {
            sObjectName,
            record,
            recordId
        } = props;

        this.setState({
            loading: true,
        });

        Promise.all([
            describeLayout(props),
            Utils.execute({
                meta: {
                    picklist: {
                        '@gObjectType': 'Client',
                        '@gFieldName': 'countryCode',
                        label: '',
                        value: '',
                    },
                },
            }),
        ]).then(([pageLayout, result]) => {
            const countries = _.map(result.meta.picklist, item => {
                const [ countryCode, ] = _.split(item.value, '-');
                return {
                    label: item.label,
                    value: _.toNumber(_.trim(countryCode)),
                };
            });

            const loadNames = record => {
                const idList = _.chain(record)
                    .keys()
                    .filter(key => this.$items[key] && this.$items[key].type === 'REFERENCE')
                    .map(key => record[key])
                    .compact()
                    .value();

                return window.$ActionService.DataLightningExtension.invoke('getNames', {
                    idList: _.join(idList, ','),
                }).then(nameList => {
                    const newRecord = {};
                    _.forEach(_.keys(record), key => {
                        const value = record[key];
                        if(this.$items[key] && this.$items[key].type === 'REFERENCE') {
                            const index = _.indexOf(idList, value);
                            if(index >= 0) {
                                newRecord[key] = {
                                    label: nameList[index],
                                    value,
                                };
                            }
                        }
                        else {
                            newRecord[key] = value;
                        }
                    });

                    this.setState({
                        pageLayout,
                        countries,
                        loading: false,
                        data: newRecord,
                        baseData: newRecord,
                        pageLayoutFound: !!pageLayout,
                    });
                });
            };

            let passedRecord = null;
            if(record) {
                passedRecord = record;
            }
            else {
                passedRecord = {
                    Id: recordId,
                };
            }

            _.chain(pageLayout && pageLayout.groups)
                .flatMap('columns')
                .flatMap('items')
                .filter(item => isValidItem(item, this.prop('type')))
                .forEach(item => {
                    this.$items[item.name] = item;
                })
                .value();

            if(passedRecord.Id) {
                return window.$ActionService.DataLightningExtension.invoke('loadRecord', {
                    id: passedRecord.Id,
                    fields: _.join(_.keys(this.$items), ','),
                }).then(data => {
                    loadNames(data);
                });
            }
            else {
                return window.$ActionService.DataLightningExtension.invoke('loadRecordDefaults', {
                    sObjectName,
                }).then(data => {
                    _.forEach(_.keys(this.$items), key => {
                        const fieldName = _.toLower(key);
                        if(data[fieldName]) {
                            passedRecord[key] = data[fieldName];
                        }
                    });
                    loadNames(passedRecord);
                });
            }
        }, Utils.catchError);
    }

    componentDidMount() {
        super.componentDidMount();

        this.initRecordForm(this.props);
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(this.props.sObjectName !== nextProps.sObjectName ||
            this.props.apiName !== nextProps.apiName ||
            this.props.layoutName !== nextProps.layoutName ||
            this.props.recordTypeApiName !== nextProps.recordTypeApiName ||
            this.props.resourceName !== nextProps.resourceName ||
            this.props.type !== nextProps.type ||
            !_.isEqual(this.props.record, nextProps.record) ||
            this.props.recordId !== nextProps.recordId) {
            Utils.runUntil(() => {
                this.initRecordForm(nextProps);
            }, () => {
                return !this.state.loading;
            });
        }
    }

    reset() {
        this.initRecordForm(this.props);
    }

    getData() {
        return this.prop('value') || this.state.data;
    }

    onTileValueChange(key, newVal) {
        const oldData = this.getData();
        let newData = _.assign({}, oldData, {
            [key]: newVal,
        });
        if(_.isFunction(this.prop('onTileValueChange'))) {
            const result = this.prop('onTileValueChange')(newData, oldData, key);
            if(_.isPlainObject(result)) {
                newData = result;
            }
        }

        for(const controllerChangeListener of this.$controllerChangeListeners) {
            const controllerName = controllerChangeListener.controllerName;
            if(newData[controllerName] !== oldData[controllerName]) {
                controllerChangeListener.listener(newData[controllerName]);
            }
        }

        this.setState({
            data: newData,
        }, () => {
            window.$Utils.markUnsaved(true, 'Record Form', () => {
                return this.save();
            });
            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')(_.assign({}, this.getData(), this.state.data));
            }
        });
    }

    getSuggestions(referenceTypes, searchText) {
        if(_.isEmpty(referenceTypes) || _.size(searchText) < 2) {
            return Promise.resolve([]);
        }

        return window.$ActionService.DataLightningExtension.invoke('searchReference', {
            referenceTypes: _.join(_.map(referenceTypes, type => _.isString(type) ? type : type.value), ','),
            searchText,
        }).then(data => data, Utils.catchError);
    }

    onReferenceTypeChange(key, newVal) {
        this.setState({
            references: _.assign({}, this.state.references, {
                [key]: newVal,
            }),
        });
    }

    renderReferenceLink({ id, label, value, placeholder, }) {
        return (
            <a className="slds-input slds-combobox__input" onClick={ () => Utils.openSObject(value.value) }>
                { label }
            </a>
        );
    }

    renderReferenceSuggestionBox(tile, props) {
        if(_.size(tile.referenceTypes) === 1) {
            return (
                <SuggestionBox
                    { ...props }
                    renderSelectedLabel={ this.renderReferenceLink.bind(this) }
                    getSuggestions={ this.getSuggestions.bind(this, tile.referenceTypes) }
                >
                </SuggestionBox>
            );
        }
        else {
            const referenceTypes = this.state.references[props.name] ? [this.state.references[props.name]] : [];
            const referenceType = _.find(tile.referenceTypes, ['value', this.state.references[props.name]]);
            const placeholder = referenceType ? `Search ${referenceType.label}...` : '';

            return (
                <SuggestionBox
                    { ...props }
                    getSuggestions={ this.getSuggestions.bind(this, referenceTypes) }
                    placeholder={ placeholder }
                    minLetters="2"
                    addonBeforeClassName={ !props.value && styles.referencePicklistAddon }
                    addonBefore={ !props.value && (
                    <Picklist
                        name={ `${props.name}-picklist` }
                        label={ `${props.label} Picklist` }
                        variant="label-removed"
                        placeholder="-- Select --"
                        options={ _.sortBy(tile.referenceTypes, 'label') }
                        width="medium"
                        value={ this.state.references[props.name] }
                        onValueChange={ this.onReferenceTypeChange.bind(this, props.name) }
                    >
                    </Picklist>
                    ) }
                >
                </SuggestionBox>
            );
        }
    }

    renderReadonlyTile(tile, defaultProps, children) {
        return (
            <ComponentField
                { ...defaultProps }
            >
                {
                    defaultProps.renderHTML ?
                    <div dangerouslySetInnerHTML={ { __html: (_.isEmpty(children) ? defaultProps.value : children) } }></div>
                    :
                    (_.isEmpty(children) ? defaultProps.value : children)
                }
            </ComponentField>
        );
    }

    renderTileInView(tile, defaultProps, container) {
        if(tile.renderTypeInView) {
            return renderField(tile.renderTypeInView, defaultProps, container);
        }

        switch(tile.type) {
            case 'TEXT':
            case 'STRING':
                return this.renderReadonlyTile(tile, defaultProps);
            case 'BOOLEAN':
            case 'CHECKBOX':
                return renderField('Input', _.assign({}, defaultProps, {
                    type: 'checkbox-big',
                    checkStyle: 'label',
                    disabled: true,
                }), container);
            case 'CURRENCY':
                return this.renderReadonlyTile(tile, defaultProps, (
                    <FormattedNumber
                        type="currency"
                        value={ defaultProps.value }
                    >
                    </FormattedNumber>
                ));
            case 'DATE':
                return this.renderReadonlyTile(tile, defaultProps, (
                    <FormattedDateTime
                        type="date"
                        value={ defaultProps.value }
                    >
                    </FormattedDateTime>
                ));
            case 'DATETIME':
                return this.renderReadonlyTile(tile, defaultProps, (
                    <FormattedDateTime
                        type="datetime"
                        value={ defaultProps.value }
                    >
                    </FormattedDateTime>
                ));
            case 'TIME':
                return this.renderReadonlyTile(tile, defaultProps, (
                    <FormattedDateTime
                        type="time"
                        value={ defaultProps.value }
                    >
                    </FormattedDateTime>
                ));
            case 'EMAIL':
            case 'NUMBER':
            case 'INTEGER':
            case 'DOUBLE':
            case 'PERCENT':
            case 'PHONE':
            case 'PICKLIST':
            case 'COMBOBOX':
            case 'TEXTAREA':
            case 'URL':
            case 'MULTIPICKLIST':
                return this.renderReadonlyTile(tile, defaultProps);
            case 'REFERENCE':
                return this.renderReadonlyTile(tile, defaultProps, (
                    <div>{ defaultProps.value && defaultProps.value.label }</div>
                ));
            default:
                return null;
        }
    }

    getQualifiedFieldName(name) {
        if(this.prop('resourceName') || this.prop('layout')) {
            return name;
        }
        else {
            const prefix = Utils.getNamespacePrefix();
            if((name.endsWith('__c') || name.endsWith('__r')) && !name.startsWith(prefix)) {
                return prefix + name;
            }
            else {
                return name;
            }
        }
    }

    renderTileInEdit(tile, defaultProps, container) {
        if(tile.renderTypeInEdit) {
            return renderField(tile.renderTypeInEdit, defaultProps, container);
        }

        const configurer = this.prop('recordId') ? {
            fieldInfo: {
                sObjectName: this.prop('sObjectName'),
                fieldName: this.getQualifiedFieldName(tile.name),
                recordId: this.prop('recordId'),
            },
        } : null;

        if(tile.controllerName) {
            configurer.fieldInfo.onControllerFieldChanged = (key, listener) => {
                const old = _.find(this.$controllerChangeListeners, ['key', key]);
                if(old) {
                    old.controllerName = tile.controllerName;
                    old.listener = listener;
                }
                else {
                    this.$controllerChangeListeners.push({
                        key,
                        listener,
                        controllerName: tile.controllerName,
                    });
                }
            };
        }

        switch(tile.type) {
            case 'TEXT':
            case 'STRING':
                return renderField('Input', _.assign({}, defaultProps, {
                }), container);
            case 'BOOLEAN':
            case 'CHECKBOX':
                return renderField('Input', _.assign({}, defaultProps, {
                    type: 'checkbox-big',
                    checkStyle: 'label',
                }), container);
            case 'CURRENCY':
                return renderField('InputCurrency', _.assign({}, defaultProps, {
                }), container);
            case 'DATE':
                return renderField('DatePicker', _.assign({}, defaultProps, {
                }), container);
            case 'DATETIME':
                return renderField('DatetimePicker', _.assign({}, defaultProps, {
                    startTime: 0,
                    endTime: 23.5 * 60,
                    interval: 30,
                }), container);
            case 'TIME':
                return renderField('TimePicker', _.assign({}, defaultProps, {
                }), container);
            case 'EMAIL':
                return renderField('InputEmail', _.assign({}, defaultProps, {
                }), container);
            case 'NUMBER':
            case 'INTEGER':
            case 'DOUBLE':
                return renderField('Input', _.assign({}, defaultProps, {
                    type: 'number',
                }), container);
            case 'PERCENT':
                return renderField('InputPercent', _.assign({}, defaultProps, {
                }), container);
            case 'PHONE':
                return renderField('InputPhone', _.assign({}, defaultProps, {
                    countries: this.state.countries,
                }), container);
            case 'PICKLIST':
                return renderField('Picklist', _.assign({}, defaultProps, {
                    options: tile.options,
                    configurer,
                }), container);
            case 'COMBOBOX':
                return renderField('Combobox', _.assign({}, defaultProps, {
                    values: _.map(tile.options, option => option.value),
                }), container);
            case 'TEXTAREA':
                return renderField('Textarea', _.assign({}, defaultProps, {
                }), container);
            case 'URL':
                return renderField('InputUrl', _.assign({}, defaultProps, {
                }), container);
            case 'MULTIPICKLIST':
                return renderField('Picklist', _.assign({}, defaultProps, {
                    select: 'multiple',
                    options: tile.options,
                    configurer,
                    value: _.chain(this.getData()[tile.name])
                        .split(';')
                        .compact()
                        .value(),
                    onValueChange: newVal => {
                        this.onTileValueChange(tile.name, _.join(newVal, ';'));
                    },
                }), container);
            case 'REFERENCE':
                return this.renderReferenceSuggestionBox(tile, defaultProps);
            default:
                return null;
        }
    }

    renderTile(tile) {
        if(isValidItem(tile, this.prop('type'))) {
            const data = this.getData();

            const defaultProps = _.assign({
                name: tile.name,
                label: tile.label,
                tooltip: tile.tooltip,
                required: tile.behavior === 'Required',
                disabled: tile.behavior === 'Readonly' || this.prop('disabled'),
                value: data[tile.name],
                onValueChange: this.onTileValueChange.bind(this, tile.name),
            }, tile.renderConfig);

            let comp = null;
            if(_.isFunction(this.prop('renderField'))) {
                comp = this.prop('renderField')(tile, _.assign({}, defaultProps));
            }

            if(!comp) {
                if(this.prop('type') === 'edit' && !defaultProps.disabled) {
                    comp = this.renderTileInEdit(tile, defaultProps, data);
                }
                else {
                    comp = this.renderTileInView(tile, defaultProps, data);
                }
            }

            return comp;
        }
    }

    renderGroup(group) {
        const columns = group.columns;
        const numOfColumns = _.size(columns);
        const max = _.chain(columns)
            .map(column => _.size(column.items))
            .max()
            .value();

        const tiles = [];
        for(let i = 0; i < max; i++) {
            for(let j = 0; j < numOfColumns; j++) {
                const column = columns[j];
                const item = column.items[i];
                tiles.push(this.renderTile(item));
            }
        }

        const type = this.prop('type');
        const showHeading = (type === 'edit' && group.editHeading) || (type === 'view' && group.detailHeading);
        if(!_.isEmpty(_.compact(tiles))) {
            if(showHeading) {
                return (
                    <ExpandableSection
                        className="slds-m-top_medium"
                        title={ group.label }
                        expandable="false"
                        expanded="true"
                    >
                        <FormGroup className="slds-m-horizontal_xx-small">
                            {
                                _.map(tiles, tile => {
                                    return (
                                    <FormTile size={ `1-of-${numOfColumns}` }>
                                        { tile }
                                    </FormTile>
                                    );
                                })
                            }
                        </FormGroup>
                    </ExpandableSection>
                );
            }
            else {
                return (
                    <FormGroup className={ this.prop('groupClassName') || 'slds-m-horizontal_xx-small' }>
                        {
                            _.map(tiles, tile => {
                                return (
                                <FormTile size={ `1-of-${numOfColumns}` }>
                                    { tile }
                                </FormTile>
                                );
                            })
                        }
                    </FormGroup>
                );
            }
        }
    }

    save() {
        const msg = this.$form.validate();
        if(!_.isEmpty(msg)) {
            return false;
        }

        this.onSave();

        return true;
    }

    validate() {
        return this.$form.validate();
    }

    // Force an update operation on the record by specifying the id
    updateRecord(id) {
        const data = this.getData();
        if(id) {
            data.Id = id;
        }

        return this.onSave(data);
    }

    onSave(input) {
        const data = input || this.getData();
        const record = {};
        _.forEach(_.keys(data), key => {
            const value = data[key];

            const item = this.$items[key];
            if(data.Id) {
                if(item && !item.canEdit) {
                    return;
                }
            }
            else {
                if(item && !item.canCreate) {
                    return;
                }
            }
            if(item && item.type === 'REFERENCE') {
                if(value) {
                    record[key] = value.value;
                }
                else {
                    record[key] = null;
                }
            }
            else if(item && item.type === 'DATE') {
                if(value) {
                    record[key] = moment(value).format('YYYY-MM-DD');
                }
                else {
                    record[key] = null;
                }
            }
            else {
                record[key] = value;
            }
        });

        const proceed = record => {
            this.setState({
                loading: true,
            });
            const recordToBeSaved = _.chain(record)
                .toPairs()
                .map(([key, value]) => {
                    return [this.getQualifiedFieldName(key), value];
                })
                .fromPairs()
                .value();
            return window.$ActionService.DataLightningExtension.invoke('saveRecord', {
                record: JSON.stringify(recordToBeSaved),
                sObjectName: this.prop('sObjectName'),
            }).then(data => {
                this.onClose();

                const newData = _.assign({}, this.getData(), {
                    Id: data.Id,
                });
                this.setState({
                    baseData: newData,
                    data: newData,
                    loading: false,
                });

                window.$Utils.markUnsaved(false);

                return data;
            }, error => {
                Utils.catchError(error);
                this.setState({
                    loading: false,
                });
                return null;
            });
        };

        if(_.isFunction(this.prop('onSave'))) {
            return this.prop('onSave')(record, proceed);
        }
        else {
            return proceed(record);
        }
    }

    onCancel() {
        this.setState({
            data: this.state.baseData,
        }, () => {
            window.$Utils.markUnsaved(false);
            if(_.isFunction(this.prop('onCancel'))){
                this.prop('onCancel')();
            }
        });
    }

    isDirty() {
        return this.state.data !== this.state.baseData;
    }

    onClose() {
        if(this.prop('variant') === 'modal' && _.isFunction(this.prop('onClose'))) {
            window.$Utils.markUnsaved(false);
            this.prop('onClose')();
        }
    }

    renderFooter() {
        const [{
            onSave,
            onSaveText,
            onCancel,
            onCancelText,
            actions,
        }, rest] = this.getPropValues();

        return this.prop('type') === 'edit' && !this.prop('hideButtons') && [
            <Button
                label={ onCancelText }
                variant="tertiary"
                onClick={ this.onCancel.bind(this) }
            >
            </Button>,
            ...(actions || []),
            <Button
                label={ onSaveText }
                variant="save"
                type="submit"
                onClick={ () => this.onSave() }
            >
            </Button>,
        ];
    }

    renderForm() {
        const footer = this.renderFooter();

        return (
            <Form name={ this.prop('name') } ref={ node => this.setForm(node) }>
                {
                    _.map(_.get(this.state.pageLayout, 'groups'), this.renderGroup.bind(this))
                }
                {
                    !this.state.pageLayoutFound && (
                        <div className="slds-text-title_caps">
                            No valid page layout found
                        </div>
                    )
                }
                { this.prop('children') }
                {
                    !_.isEmpty(footer) && this.prop('variant') !== 'modal' && (
                    <FormActions>
                        <div className="slds-col_bump-left">
                            { footer }
                        </div>
                    </FormActions>
                    )
                }
            </Form>
        );
    }

    render(props, state) {
        const [{
            className,
            name,
            variant,
            header,
            reloadable,
            visible,
            children,
        }, rest] = this.getPropValues();

        if(variant === 'modal') {
            return (
                <Modal
                    header={ header }
                    footer={ this.renderFooter() }
                    loading={ this.state.loading }
                    visible={ visible }
                    onClose={ this.onClose.bind(this) }
                    data-type={ this.getTypeName() }
                    data-name={ name }
                    { ...rest }
                >
                    { this.renderForm() }
                </Modal>
            );
        }
        else {
            return (
                <div
                    className={ window.$Utils.classnames(
                    "slds-is-relative",
                    className
                    ) }
                    data-type={ this.getTypeName() }
                    data-name={ name }
                    { ...rest }
                >
                    {
                        this.state.loading && (
                        <Spinner></Spinner>
                        )
                    }
                    {
                        header && (
                        reloadable ?
                        <Topbar
                            className="slds-p-top_none"
                            onReload={ () => this.reset() }
                        >
                            { header }
                        </Topbar>
                        :
                        <div className="slds-p-around_medium slds-m-bottom_medium slds-border_bottom slds-text-align_center slds-text-heading_medium">
                            { header }
                        </div>
                        )
                    }
                    { this.renderForm() }
                </div>
            );
        }
    }
}

RecordForm.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    groupClassName: PropTypes.isString('groupClassName'),
    name: PropTypes.isString('name').required(),
    sObjectName: PropTypes.isString('sObjectName').required().demoValue('Task'),
    apiName: PropTypes.isString('apiName').demoValue('Task'),
    layoutName: PropTypes.isString('layoutName').demoValue('Task Layout').description('Load the record form layout from the layout name'),
    renderField: PropTypes.isFunction('renderField'),
    onSave: PropTypes.isFunction('onSave'),
    onSaveText: PropTypes.isString('onSaveText').defaultValue('Save').demoValue('Save'),
    onCancel: PropTypes.isFunction('onCancel'),
    onCancelText: PropTypes.isString('onCancelText').defaultValue('Cancel').demoValue('Cancel'),
    actions: PropTypes.isArray('actions'),
    visible: PropTypes.isBoolean('visible').defaultValue(true).demoValue(true),
    onClose: PropTypes.isFunction('onClose'),
    value: PropTypes.isObject('value'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    onTileValueChange: PropTypes.isFunction('onTileValueChange'),
    header: PropTypes.isString('header').demoValue('Header'),
    variant: PropTypes.isString('variant').values([
        'base',
        'modal'
    ]).defaultValue('base').demoValue('base'),
    type: PropTypes.isString('type').values([
        'edit',
        'view'
    ]).defaultValue('edit').demoValue('edit'),
    record: PropTypes.isObject('record').description('initial record values'),
    recordId: PropTypes.isString('recordId').demoValue(''),
    recordTypeApiName: PropTypes.isString('recordTypeApiName').demoValue('').description('Load the record form layout from the record type the layout is bound to'),
    resourceName: PropTypes.isString('resourceName').demoValue('').description('Load the record form layout from the static resource json file'),
    layout: PropTypes.isObject('layout').description('The layout for the record form'),
    hideButtons: PropTypes.isBoolean('hideButtons').demoValue(false),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    reloadable: PropTypes.isBoolean('reloadable').demoValue(false),
    children: PropTypes.isChildren('children'),
};

RecordForm.propTypesRest = true;
RecordForm.displayName = "RecordForm";
