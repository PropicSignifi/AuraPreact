import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Table from './table';
import TableHeader from './tableHeader';
import TableConfig from './tableConfig';
import Pagination from '../pagination/pagination';
import Paginator from '../pagination/paginator';
import ButtonIcon from '../buttonIcon/buttonIcon';
import ListEditor from '../listEditor/listEditor';
import Spinner from '../spinner/spinner';
import Expression from '../expression/expression';
import { isEmptyCondition, } from '../expression/expression';
import Modal from '../modal/modal';
import Button from '../button/button';
import Select from '../select/select';
import Utils from '../utils/utils';
import styles from './TableManagerStyles.less';
import schema from './filter.schema';
import { getDataLabel, } from './table';
import Config from '../utils/config';

Config.defineConfig([
    {
        name: 'Table - columns',
        path: '/System/UI/Table/${name}/columns',
        type: Config.Types.Extension,
        description: 'Customise table columns',
    },
    {
        name: 'Table - quick actions',
        path: '/System/UI/Table/${name}/quickActions',
        type: Config.Types.Extension,
        description: 'Customise table quick actions',
    },
]);

const getFilterFields = column => {
    const filterBy = column.filterBy;

    if(_.isArray(filterBy)) {
        return filterBy;
    }
    else if(_.isPlainObject(filterBy)) {
        return [filterBy];
    }
    else if(_.isString(filterBy)) {
        return {
            name: column.name,
            label: getDataLabel(column) || column.name,
            type: filterBy,
        };
    }

    let columnType = column.type;
    if(!columnType && !_.isFunction(column.cell)) {
        columnType = 'String';
    }
    if(columnType) {
        const resource = _.find(schema.resources, resource => _.includes(resource.acceptedTypes, columnType));
        return resource && {
            name: column.name,
            label: getDataLabel(column) || column.name,
            type: resource.name,
        };
    }
};

const getAllFilterFields = columns => {
    const filterFields = _.flatMap(columns, getFilterFields);
    return [
        {
            name: '_rowIndex',
            label: 'Row Index',
            type: 'Number',
            getValue: (item, index) => index + 1,
        },
        ...filterFields,
    ];
};

const buildSchema = columns => {
    const filterFields = getAllFilterFields(columns);
    const resources = _.chain(filterFields)
        .compact()
        .map(field => {
            const res = _.find(schema.resources, ['name', field.type]);
            if(res) {
                return _.assign({}, res, {
                    name: field.name,
                    label: field.label,
                    values: field.values,
                    getValue: field.getValue,
                });
            }
        })
        .compact()
        .value();

    return _.assign({}, schema, {
        resources,
    });
};

const buildFiltersFunc = (filters, filterFields) => {
    if(!filters) {
        return _.constant(true);
    }

    if(filters.action) {
        return (item, index) => {
            const logicFunc = filters.action === 'AND' ? _.every : _.some;
            return logicFunc(filters.conditions, condition => {
                const filtersFunc = buildFiltersFunc(condition, filterFields);
                return filtersFunc(item, index);
            });
        };
    }
    else if(filters.resource) {
        return (item, index) => {
            const filterField = _.find(filterFields, ['name', filters.resource]);
            const a = filterField && _.isFunction(filterField.getValue) ?
                filterField.getValue(item, index) : _.get(item, filters.resource);
            const b = filters.value;
            const operator = _.find(schema.operators, ['name', filters.operator]);
            return operator && operator.execute && operator.execute(a, b);
        };
    }
    else {
        return _.constant(true);
    }
};

const includes = (target, pattern) => {
    if(_.isArray(target)) {
        return _.some(target, item => includes(item, pattern));
    }
    else {
        target = _.toLower(_.toString(target));
        pattern = _.toLower(_.toString(pattern));
        return _.includes(target, pattern);
    }
};

const getSearchByFunction = (column) => {
    if(_.isFunction(column.searchBy)) {
        const searchBy = column.searchBy;
        if(searchBy.length === 1) {
            return (row, searchText) => includes(searchBy(row), searchText);
        }
        else {
            return searchBy;
        }
    }

    if(_.isString(column.searchBy)) {
        return (row, searchText) => includes(_.get(row, column.searchBy), searchText);
    }

    let searchByType = column.type;
    if(!searchByType && !_.isFunction(column.cell)) {
        searchByType = 'String';
    }

    switch(searchByType) {
        case 'Number':
        case 'Currency':
            return (row, searchText) => includes(row[column.name], searchText);
        case 'String':
            return (row, searchText) => includes(row[column.name], searchText);
        default:
            return null;
    }
};

const mergeColumns = (oldColumns, newColumns) => {
    if(!_.isEmpty(newColumns)) {
        const columns = [];

        _.forEach(newColumns, newColumn => {
            const oldColumn = _.find(oldColumns, ['name', newColumn.name]);
            if(!oldColumn && _.size(newColumn) === 1) {
                return;
            }

            const column = _.assign({}, oldColumn, newColumn);
            columns.push(column);
        });

        return columns;
    }
    else {
        return null;
    }
};

export default class TableManager extends BaseComponent {
    constructor() {
        super();

        this.state = {
            currentPage: 1,
            mode: null,
            rangeIndex: 1,
            loading: false,
            searchText: null,
            showFilterSetting: false,
            filters: null,
            editingFilters: null,
            pageSize: null,
            columns: null,
            data: null,
            actions: null,
            select: null,
            selected: [],
        };

        this._rangeSize = null;
        this._leftColumns = null;
        this._restColumns = null;
        this._rightColumns = null;
        this._batchStartIndex = null;
        this._batchEndIndex = null;
        this._lastDataSize = null;
        this._hasNextBatch = false;
        this._fields = {};
        this._lastData = null;
        this._customizedColumns = null;
    }

    getSelect() {
        return _.isNil(this.state.select) ? this.props.select : this.state.select;
    }

    getSelected() {
        // by default, overrideen select mode is set to multiple no matter whether it is single selection or multiple selection
        if(this.state.select === 'multiple') {
            if(this.props.select === 'multiple') {
                return this.props.selected;
            }
            else if(this.props.select === 'single') {
                return _.isNil(this.props.selected) ? [] : [this.props.selected];
            }
            else {
                return this.state.selected;
            }
        }
        else {
            return this.props.selected;
        }
    }

    getOnSelect() {
        if(this.state.select === 'multiple') {
            if(this.props.select === 'multiple') {
                return this.props.onSelect;
            }
            else if(this.props.select === 'single') {
                return selected => {
                    this.props.onSelect(_.first(selected));
                };
            }
            else {
                return selected => {
                    this.setState({
                        selected,
                    });
                };
            }
        }
        else {
            return this.props.onSelect;
        }
    }

    getPageSizeOptions() {
        return _.map(this.prop('pageSizeOptions'), item => {
            return {
                label: _.toString(item),
                value: _.toString(item),
            };
        });
    }

    onPageSizeChange(newVal) {
        this.setState({
            pageSize: newVal,
        });
    }

    getCurrentPage() {
        return this.state.currentPage;
    }

    getPageSize() {
        return this.state.pageSize === null ? this.prop('pageSize') : _.toNumber(this.state.pageSize);
    }

    needPagination() {
        return !!this.prop('pageSize');
    }

    componentDidMount() {
        super.componentDidMount();

        if(this.isServerPagination()) {
            this.loadDataFromServer(this.getCurrentPage());
        }

        const name = this.prop('name');
        this.setState({
            loading: true,
        });
        Promise.all([
            Config.loadExtension(`/System/UI/Table/${name}/columns`, this.context.globalData),
            Config.loadExtension(`/System/UI/Table/${name}/quickActions`, this.context.globalData),
        ]).then(([columnsResources, quickActionsResources]) => {
            return Promise.all([
                Utils.retrieve(_.last(columnsResources)),
                Utils.retrieve(_.last(quickActionsResources)),
            ]);
        }).then(([columns, quickActions]) => {
            const selectSupportAction = _.find(quickActions, action => _.get(action, 'attributes.select') === 'single' || _.get(action, 'attributes.select') === 'multiple');

            const newQuickActions = _.map(quickActions, action => {
                if(action.disabled === undefined) {
                    const select = _.get(action, 'attributes.select');
                    if(select === 'single') {
                        return _.assign({}, action, {
                            disabled: () => _.size(this.getSelected()) !== 1,
                        });
                    }
                    else if(select === 'multiple') {
                        return _.assign({}, action, {
                            disabled: () => _.size(this.getSelected()) === 0,
                        });
                    }
                    else {
                        return action;
                    }
                }
                else {
                    return action;
                }
            });

            this._customizedColumns = columns;

            const newState = {
                loading: false,
                columns: mergeColumns(this.prop('columns'), this._customizedColumns),
                actions: newQuickActions,
                filters: TableConfig.getFilters(name),
            };

            if(selectSupportAction) {
                newState.select = 'multiple';
            }

            this.setState(newState);
        });
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(nextProps && !_.isEqual(nextProps.data, this.props.data)){
            this._lastData = nextProps.data;
            this.onFilter();
        }

        const fieldNameColumns = this.getFieldNameColumns();
        if(!_.isEmpty(fieldNameColumns)) {
            const fieldNames = _.map(fieldNameColumns, 'fieldName');
            const missingFieldItems = _.filter(nextProps.data, item => {
                return !this._fields[item.id];
            });

            if(!_.isEmpty(missingFieldItems)) {
                window.$ActionService.DataLightningExtension.invoke('batchQueryFields', {
                    ids: _.chain(missingFieldItems).map('id').join(';').value(),
                    fields: _.join(fieldNames, ';'),
                }).then(data => {
                    _.forEach(data, item => {
                        this._fields[item.Id] = item;
                    });

                    this.hydrateFields(nextProps.data);
                });
            }
            else {
                this.hydrateFields(nextProps.data);
            }
        }

        if(nextProps.columns !== this.prop('columns')) {
            this.setState({
                columns: mergeColumns(nextProps.columns, this._customizedColumns),
            });
        }
    }

    hydrateFields(data) {
        const newData = _.map(data, item => {
            return _.assign({}, item, this._fields[item.id]);
        });
        this._lastData = newData;
        this.setState({
            data: newData,
        });
    }

    getBatchSize() {
        return this.prop('batchSize') || 4;
    }

    getBatchEndIndex(batchStartIndex) {
        return batchStartIndex + this.getBatchSize() - 1;
    }

    loadDataFromServer(nextPage, options = {}) {
        let shouldLoad = false;
        if(!this._batchStartIndex && !this._batchEndIndex) {
            this._batchStartIndex = 1;
            this._batchEndIndex = this.getBatchEndIndex(this._batchStartIndex);
            shouldLoad = true;
        }
        else {
            if(nextPage < this._batchStartIndex || nextPage > this._batchEndIndex) {
                const batchSize = this.getBatchSize();
                this._batchStartIndex = _.floor((nextPage - 1) / batchSize) * batchSize + 1;
                this._batchEndIndex = this.getBatchEndIndex(this._batchStartIndex);
                shouldLoad = true;
            }
            else {
                shouldLoad = options.forceLoad;
            }
        }

        if(shouldLoad) {
            const getBatchData = this.prop('getBatchData');
            const pageSize = this.getPageSize();
            const data = getBatchData((this._batchStartIndex - 1) * pageSize, this.getBatchSize() * pageSize, this.state.searchText);
            if(_.isFunction(data.then)) {
                this.setState({
                    loading: true,
                });
                data.then(items => {
                    this.setState({
                        loading: false,
                    }, () => {
                        this.setBatchData(items);
                    });
                }, Utils.catchError);
            }
            else {
                this.setBatchData(data);
            }
        }
    }

    setBatchData(data) {
        const pageSize = this.getPageSize();

        let hasNext = true;
        let items = null;
        if(_.isPlainObject(data)) {
            hasNext = data.hasNext;
            items = data.items;
        }
        else if(_.isArray(data)) {
            const batchTotal = this.getBatchSize() * pageSize;
            hasNext = _.size(data) >= batchTotal;
            items = data;
        }
        else {
            throw new Error('Invalid batch data');
        }

        this._hasNextBatch = hasNext;
        if(!this._hasNextBatch) {
            const pages = _.ceil(_.size(items) / pageSize);
            this._batchEndIndex = this._batchStartIndex + pages - 1;
        }

        this.setValue(items);
    }

    getEndPageIndex() {
        if(this._hasNextBatch) {
            return null;
        }
        else {
            return this._batchEndIndex;
        }
    }

    getData() {
        return this.state.data || this.prop('data');
    }

    refreshTable() {
        const data = this.getData();
        this.setValue([...data]);
    }

    setValue(newData) {
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newData);
        }

        const size = _.size(newData);
        if(this.isServerPagination() && size !== this._lastDataSize) {
            this.loadDataFromServer(this.getCurrentPage(), { forceLoad: true });
        }

        this._lastDataSize = size;
    }

    setCurrentPage(page) {
        this.setState({
            currentPage: page.page,
        }, () => {
            if(this.isServerPagination()) {
                this.loadDataFromServer(page.page);
            }

            if(_.isFunction(this.prop('onPageChanged'))) {
                this.prop('onPageChanged')(page);
            }
        });
    }

    switchToMode(mode) {
        if(_.isFunction(this.prop('onModeChange'))) {
            this.setState({
                currentPage: 1,
            }, () => {
                this.prop('onModeChange')(mode);
            });
        }
        else {
            this.setState({
                mode,
                currentPage: 1,
            });
        }
    }

    switchToTable() {
        this.switchToMode('Table');
    }

    switchToList() {
        this.switchToMode('List');
    }

    canSwitchToMode(mode) {
        return _.includes(this.prop('modes'), mode) && this.getMode() !== mode;
    }

    getMode() {
        if(this.state.mode === null) {
            let mode = this.prop('mode');
            if(!mode && _.isFunction(this.prop('createListItemEditor')) &&
                window.$Utils.isNonDesktopBrowser() &&
                _.includes(this.prop('modes'), 'List')) {
                mode = 'List';
            }
            else if(!mode) {
                mode = 'Table';
            }

            return mode;
        }
        else {
            return this.state.mode;
        }
    }

    isShowingInList() {
        return this.getMode() === 'List';
    }

    createActions() {
        let actions = [];
        if(!_.isEmpty(this.prop('customisedActions'))){
            actions = [...this.prop('customisedActions'), ...actions];
        }

        if(_.isFunction(this.prop('createListItemEditor'))) {
            if(this.canSwitchToMode('Table')) {
                actions.push(
                    (
                        <ButtonIcon
                            variant="border-filled"
                            iconName="utility:table"
                            size="medium"
                            alternativeText="Show In Table"
                            onClick={ this.switchToTable.bind(this) }
                        >
                        </ButtonIcon>
                    )
                );
            }
            else if(this.canSwitchToMode('List')){
                actions.push(
                    (
                        <ButtonIcon
                            variant="border-filled"
                            iconName="utility:list"
                            size="medium"
                            alternativeText="Show In List"
                            onClick={ this.switchToList.bind(this) }
                        >
                        </ButtonIcon>
                    )
                );
            }
        }

        if(this.hasColumnScroller()) {
            if(this.canScrollColumnsLeft()) {
                actions.push(
                    (
                        <ButtonIcon
                            variant="border-filled"
                            iconName="ctc-utility:a_left"
                            size="medium"
                            alternativeText="Scroll Columns Left"
                            onClick={ this.scrollColumnsLeft.bind(this) }
                        >
                        </ButtonIcon>
                    )
                );
            }
            if(this.canScrollColumnsRight()) {
                actions.push(
                    (
                        <ButtonIcon
                            variant="border-filled"
                            iconName="ctc-utility:a_right"
                            size="medium"
                            alternativeText="Scroll Columns Right"
                            onClick={ this.scrollColumnsRight.bind(this) }
                        >
                        </ButtonIcon>
                    )
                );
            }
        }

        if(this.getMode() === 'Table' && this.prop('filterable') && !this.isServerPagination()) {
            actions.push(
                (
                    <ButtonIcon
                        variant="border-filled"
                        iconName="utility:filterList"
                        size="medium"
                        alternativeText="Filter"
                        onClick={ this.openFilterSetting.bind(this) }
                    >
                    </ButtonIcon>
                )
            );
        }

        return actions;
    }

    openFilterSetting() {
        this.setState({
            showFilterSetting: true,
            editingFilters: _.cloneDeep(this.state.filters),
        });
    }

    canScrollColumnsLeft() {
        return this.state.rangeIndex > 1;
    }

    canScrollColumnsRight() {
        return this.state.rangeIndex < _.ceil(_.size(this._restColumns) / this._rangeSize);
    }

    scrollColumnsLeft() {
        this.setState({
            rangeIndex: this.state.rangeIndex - 1,
        });
    }

    scrollColumnsRight() {
        this.setState({
            rangeIndex: this.state.rangeIndex + 1,
        });
    }

    isServerPagination() {
        return _.isFunction(this.prop('getBatchData'));
    }

    createPaginatedContent(data) {
        if(this.isServerPagination()) {
            return this.createServerPaginatedContent(data);
        }
        else {
            return this.createClientPaginatedContent(data);
        }
    }

    getFilteredData() {
        const searchText = this.state.searchText;

        let data = this._lastData || this.prop('data');

        if(!this.isServerPagination() && searchText !== null && searchText !== '') {
            const searchByFilters = _.chain(this.getColumns())
                .map(getSearchByFunction)
                .compact()
                .value();

            data = _.filter(data, item => {
                return _.reduce(searchByFilters, (prev, filter) => {
                    return prev || filter(item, searchText);
                }, false);
            });
        }

        const filterFields = getAllFilterFields(this.getColumns());
        const filters = this.state.filters;
        const filtersFunc = buildFiltersFunc(filters, filterFields);

        return _.filter(data, filtersFunc);
    }

    createPageSizeOptions() {
        return (
            <Select
                className="slds-m-left_x-small"
                name="pageSize"
                label="Page Size"
                variant="label-removed"
                options={ this.getPageSizeOptions() }
                value={ this.getPageSize() }
                onValueChange={ this.onPageSizeChange.bind(this) }
            >
            </Select>
        );
    }

    createPagination() {
        // Hide the paginator only when the size of data is less than the original page size
        const hasLessData = _.size(this.getData()) < this.prop('pageSize');
        const hidePaginator = this.isServerPagination() ? (this._batchStartIndex === 1 && hasLessData) : hasLessData;
        const pageSize = this.getPageSize();
        const children = this.prop('children');

        if(hidePaginator && !_.isEmpty(children)) {
            return (
                <div className={ window.$Utils.classnames(
                    'slds-m-top_medium slds-grid slds-wrap',
                    this.prop('paginatorClassName')
                    ) }>
                    { children }
                </div>
            );
        }
        else {
            return (
                <div className={ window.$Utils.classnames(
                    'slds-m-top_medium slds-grid slds-wrap',
                    {
                        'slds-hide': hidePaginator,
                    },
                    this.prop('paginatorClassName')
                    ) }>
                    {
                        this.isServerPagination() ?
                        <Paginator
                            pageSize={ pageSize }
                            currentPage={ this.getCurrentPage() }
                            onPageChanged={ this.setCurrentPage.bind(this) }
                            total="-1"
                            endPageIndex={ this.getEndPageIndex() }
                            autoHide="false"
                        ></Paginator>
                        :
                        <Paginator
                            pageSize={ pageSize }
                            currentPage={ this.getCurrentPage() }
                            onPageChanged={ this.setCurrentPage.bind(this) }
                            autoHide="false"
                        ></Paginator>
                    }
                    { this.createPageSizeOptions() }
                    { children }
                </div>
            );
        }
    }

    createServerPaginatedContent(data) {
        const [{
            tableClassName,
            name,
            children,
        }, rest] = this.getPropValues();

        const pageOffset = this.getCurrentPage() - this._batchStartIndex;
        const pageSize = this.getPageSize();
        const paginatedData = _.slice(data, pageOffset * pageSize, (pageOffset + 1) * pageSize);

        if(this.isShowingInList()) {
            return (
                <div>
                    <ListEditor
                        className={ tableClassName }
                        data={ paginatedData }
                        limit={ pageSize }
                        createEditor={ this.prop('createListItemEditor') || _.noop }
                        onValueChange={ this.setValue.bind(this) }
                        { ...rest }
                    >
                    </ListEditor>
                    { this.createPagination() }
                </div>
            );
        }
        else {
            return (
                <div>
                    <Table
                        className={ tableClassName }
                        variant="responsive"
                        data={ paginatedData }
                        columns={ this.renderColumns() }
                        resizable="true"
                        limit={ pageSize }
                        onValueChange={ this.setValue.bind(this) }
                        { ...rest }
                        select={ this.getSelect() }
                        selected={ this.getSelected() }
                        onSelect={ this.getOnSelect() }
                    >
                    </Table>
                    { this.createPagination() }
                </div>
            );
        }
    }

    createClientPaginatedContent(data) {
        const [{
            tableClassName,
            name,
            children,
        }, rest] = this.getPropValues();

        const pageSize = this.getPageSize();

        if(this.isShowingInList()) {
            return (
                <Pagination>
                    <ListEditor
                        className={ tableClassName }
                        data={ data }
                        limit={ pageSize }
                        createEditor={ this.prop('createListItemEditor') || _.noop }
                        onValueChange={ this.setValue.bind(this) }
                        { ...rest }
                    >
                    </ListEditor>
                    { this.createPagination() }
                </Pagination>
            );
        }
        else {
            return (
                <Pagination>
                    <Table
                        className={ tableClassName }
                        variant="responsive"
                        data={ data }
                        columns={ this.renderColumns() }
                        resizable="true"
                        limit={ pageSize }
                        onValueChange={ this.setValue.bind(this) }
                        { ...rest }
                        select={ this.getSelect() }
                        selected={ this.getSelected() }
                        onSelect={ this.getOnSelect() }
                    >
                    </Table>
                    { this.createPagination() }
                </Pagination>
            );
        }
    }

    createUnpaginatedContent(data) {
        const [{
            name,
            tableClassName,
            children,
        }, rest] = this.getPropValues();

        if(this.isShowingInList()) {
            return [
                <ListEditor
                    className={ tableClassName }
                    data={ data }
                    createEditor={ this.prop('createListItemEditor') || _.noop }
                    onValueChange={ this.setValue.bind(this) }
                    { ...rest }
                >
                </ListEditor>,
                children && (
                    <div className="slds-m-top_medium slds-grid slds-wrap">
                        { children }
                    </div>
                ),
            ];
        }
        else {
            return [
                <Table
                    className={ tableClassName }
                    variant="responsive"
                    data={ data }
                    columns={ this.renderColumns() }
                    resizable="true"
                    onValueChange={ this.setValue.bind(this) }
                    { ...rest }
                    select={ this.getSelect() }
                    selected={ this.getSelected() }
                    onSelect={ this.getOnSelect() }
                >
                </Table>,
                children && (
                    <div className="slds-m-top_medium slds-grid slds-wrap">
                        { children }
                    </div>
                ),
            ];
        }
    }

    hasColumnScroller() {
        return !!this.prop('maxColumns');
    }

    renderColumns() {
        const columns = this.getRenderedColumns();
        if(this.hasColumnScroller()) {
            return [
                ...this._leftColumns,
                ...(_.slice(this._restColumns, (this.state.rangeIndex - 1) * this._rangeSize, this.state.rangeIndex * this._rangeSize)),
                ...this._rightColumns,
            ];
        }
        else {
            return columns;
        }
    }

    getColumns() {
        return this.state.columns || this.prop('columns');
    }

    getRenderedColumns() {
        return TableConfig.renderColumns(this.prop('name'), this.getColumns());
    }

    getFieldNameColumns() {
        return _.filter(this.getRenderedColumns(), col => !!col.fieldName);
    }

    calculateRangeSize() {
        const maxColumns = this.prop('maxColumns');
        if(maxColumns) {
            const columns = this.getRenderedColumns();
            this._leftColumns = _.filter(columns, ['float', 'left']);
            this._rightColumns = _.filter(columns, ['float', 'right']);
            this._restColumns = _.filter(columns, column => column.float !== 'left' && column.float !== 'right');
            this._rangeSize = maxColumns - _.size(this._leftColumns) - _.size(this._rightColumns);
        }
    }

    onFilterChange(newVal) {
        this.setState({
            editingFilters: newVal,
        });
    }

    onCancelFilter() {
        this.setState({
            showFilterSetting: false,
        });
    }

    setFilters(filters) {
        TableConfig.setFilters(this.prop('name'), filters);

        this.setState({
            showFilterSetting: false,
            filters: filters,
        }, () => {
            this.onFilter();
        });
    }

    getFilters() {
        return this.state.filters;
    }

    onSaveFilter() {
        this.setFilters(this.state.editingFilters);
    }

    onSearch(searchText) {
        this.setState({
            searchText,
        }, () => {
            if(this.isServerPagination()) {
                this.loadDataFromServer(1, {
                    forceLoad: true,
                });
            }

            this.onFilter();
        });
    }

    onFilter() {
        if(_.isFunction(this.prop('onFilter'))) {
            const data = this.getFilteredData();
            this.prop('onFilter')(data);
        }
    }

    render(props, state) {
        const [{
            className,
            tableHeaderClassName,
            tableClassName,
            name,
            header,
            top,
            onReload,
            children,
            headerVisible,
            style,
        }, rest] = this.getPropValues();

        const columns = this.getColumns();
        this.calculateRangeSize();

        const tableSchema = buildSchema(columns);
        const data = this.getFilteredData();
        const quickActionsContext = {
            data,
            selected: this.getSelected(),
        };

        return (
            <div
                className={ window.$Utils.classnames(
                "slds-grid",
                className
                ) }
                data-type={ this.getTypeName() }
                data-name={ name }
            >
                <div className={ window.$Utils.classnames(
                    'slds-is-relative slds-col',
                    {
                        'slds-hide': window.$Utils.isNonDesktopBrowser() && this.state.showFilterSetting,
                    }
                    ) }>
                    {
                        state.loading ?
                        <Spinner variant="brand" size="medium" container="with" alternativeText="loading"></Spinner>
                        : null
                    }
                    {
                        headerVisible &&
                        <TableHeader
                            className={ tableHeaderClassName }
                            name={ name }
                            columns={ columns }
                            actions={ this.createActions() }
                            quickActions={ this.state.actions }
                            quickActionsContext={ quickActionsContext }
                            onValueChange={ !this.isShowingInList() ? this.refreshTable.bind(this) : null } onReload={ onReload }
                            onSearch={ this.prop('searchable') ? this.onSearch.bind(this) : null }
                            style={ style }
                        >
                            <div className="slds-grid slds-grid_vertical-align-center">
                                { header }
                                { isEmptyCondition(this.state.filters) ? '' : `(Filtered: ${_.size(data)} ${_.size(data) === 1 ? 'Result' : 'Results'})` }
                            </div>
                        </TableHeader>
                    }
                    { top }
                    {
                        this.needPagination() ?
                        this.createPaginatedContent(data)
                        :
                        this.createUnpaginatedContent(data)
                    }
                </div>
                <Modal
                    visible={ this.state.showFilterSetting && !window.$Utils.isNonDesktopBrowser() }
                    header="Table Filters"
                    footer={
                        <div>
                            <Button
                                variant="tertiary"
                                label="Cancel"
                                onClick={ this.onCancelFilter.bind(this) }
                            >
                            </Button>
                            <Button
                                variant="save"
                                label="Save"
                                onClick={ this.onSaveFilter.bind(this) }
                            >
                            </Button>
                        </div>
                    }
                    onClose={ this.onCancelFilter.bind(this) }
                    >
                    <Expression
                        className="slds-m-horizontal_small"
                        variant="label-removed"
                        value={ this.state.editingFilters }
                        onValueChange={ this.onFilterChange.bind(this) }
                        schema={ tableSchema }
                        type="filter"
                        label="Filters"
                        actionLabel="Matching"
                        actionAndLabel="All of these filters"
                        actionOrLabel="Any of these filters"
                        addConditionButtonLabel="Add Filter"
                        addGroupButtonLabel="Add Group"
                        resourceLabel="Column Field"
                    >
                    </Expression>
                </Modal>
                {
                    this.state.showFilterSetting && window.$Utils.isNonDesktopBrowser() && (
                        <div className={ window.$Utils.classnames(
                            'slds-grid slds-grid_vertical slds-m-top_small slds-p-bottom_small',
                            styles.filter
                            ) }>
                            <div className={ `slds-p-around_small slds-border_bottom slds-grid ${styles.expressionFooter}` }>
                                <Button
                                    variant="tertiary"
                                    label="Cancel"
                                    onClick={ this.onCancelFilter.bind(this) }
                                >
                                </Button>
                                <Button
                                    className="slds-col_bump-left"
                                    variant="save"
                                    label="Save"
                                    onClick={ this.onSaveFilter.bind(this) }
                                >
                                </Button>
                            </div>
                            <Expression
                                className="slds-m-horizontal_small"
                                variant="label-removed"
                                value={ this.state.editingFilters }
                                onValueChange={ this.onFilterChange.bind(this) }
                                schema={ tableSchema }
                                type="filter"
                                label="Filters"
                                actionLabel="Matching"
                                actionAndLabel="All of these filters"
                                actionOrLabel="Any of these filters"
                                addConditionButtonLabel="Add Filter"
                                addGroupButtonLabel="Add Group"
                                resourceLabel="Column Field"
                            >
                            </Expression>
                        </div>
                    )
                }
            </div>
        );
    }
}

TableManager.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    tableClassName: PropTypes.isString('tableClassName').demoValue(''),
    tableHeaderClassName: PropTypes.isString('tableHeaderClassName').demoValue(''),
    paginatorClassName: PropTypes.isString('paginatorClassName').demoValue(''),
    name: PropTypes.isString('name').required(),
    header: PropTypes.isObject('header'),
    top: PropTypes.isObject('top'),
    data: PropTypes.isArray('data').defaultValue([]),
    columns: PropTypes.isArray('columns').required(),
    pageSize: PropTypes.isNumber('pageSize').defaultValue(10).demoValue(10),
    onValueChange: PropTypes.isFunction('onValueChange'),
    onReload: PropTypes.isFunction('onReload'),
    createListItemEditor: PropTypes.isFunction('createListItemEditor'),
    children: PropTypes.isChildren('children'),
    headerVisible: PropTypes.isBoolean('headerVisible').defaultValue(true).demoValue(true),
    maxColumns: PropTypes.isNumber('maxColumns'),
    batchSize: PropTypes.isNumber('batchSize').description('The number of pages of a batch data load'),
    getBatchData: PropTypes.isFunction('getBatchData').description('Get table data from server'),
    mode: PropTypes.isString('mode').values([
        'Table',
        'List',
    ]).demoValue('Table'),
    modes: PropTypes.isArray('modes').defaultValue([
        'Table',
        'List',
    ]),
    onModeChange: PropTypes.isFunction('onModeChange'),
    style: PropTypes.isString('style').values([
        'standard',
        'compact',
    ]).defaultValue('standard').demoValue('standard'),
    onFilter: PropTypes.isFunction('onFilter'),
    searchable: PropTypes.isBoolean('searchable').defaultValue(true).demoValue(true),
    filterable: PropTypes.isBoolean('filterable').defaultValue(true).demoValue(true),
    pageSizeOptions: PropTypes.isArray('pageSizeOptions').defaultValue([
        5,
        10,
        25,
        50,
    ]),
    customisedActions: PropTypes.isArray('customisedActions'),
    onPageChanged: PropTypes.isFunction('onPageChanged'),
};

TableManager.propTypesRest = true;
TableManager.displayName = "TableManager";
