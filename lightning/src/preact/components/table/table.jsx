import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import FormattedNumber from '../formattedNumber/formattedNumber';
import FormattedDateTime from '../formattedDateTime/formattedDateTime';
import Input from '../input/input';
import { PrimitiveIcon } from '../icon/icon';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Utils from '../utils/utils';
import renderField from '../renderField/renderField';
import KBI from '../utils/kbi';
import styles from './styles.less';

const Sorted = {
    NONE: 'none',
    ASC: 'ascending',
    DESC: 'descending',
};

export const getDataLabel = (column) => {
    if(_.isString(column.header)) {
        return column.header;
    }
    else if(_.isString(column.label)) {
        return column.label;
    }
    else {
        return "";
    }
};

export default class Table extends BaseComponent {
    constructor() {
        super();

        this.state = {
            page: null,
            sorted: null,
            sortedAscending: null,
            inlineEditingIndex: null,
            inlineEditingColumn: null,
            pendingData: null,
            clicked: null,
            expanded: [],
        };

        // inline editing field
        this.$field = null;

        this.$nestedLevels = {};
        this.$showLimitedResizableDivider = false;
    }

    getData() {
        this.$nestedLevels = {};

        if(!this.isTreeGrid()) {
            return this.prop('data');
        }
        else {
            return _.chain(this.prop('data'))
                .flatMap(i => this.getNestedItems(i, 1))
                .value();
        }
    }

    getNestedItems(item, level) {
        const childrenField = this.prop('childrenField');
        const keyField = this.prop('keyField');
        const key = item[keyField];
        this.$nestedLevels[key] = level;

        return _.includes(this.state.expanded, key) ?
        [
            item,
            ...(
                _.chain(item[childrenField])
                .flatMap(i => this.getNestedItems(i, level + 1))
                .value()
            ),
        ]
        :
        [
            item,
        ];
    }

    isTreeGrid() {
        return !!this.prop('childrenField');
    }

    getClicked() {
        if(_.isNil(this.prop('clickedId'))) {
            return this.state.clicked;
        }
        else {
            return this.prop('clickedId');
        }
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerPaginated) && _.isFunction(this.context.doPagination)) {
            this.context.registerPaginated(this);
            this.context.doPagination({
                total: _.size(this.getData()),
            });
        }

        document.addEventListener('mousemove', e => {
            if(this._thElem && this._thElemNext) {
                const width = this._startOffset + (e.pageX - this._pageX);
                const widthNext = this._startOffsetNext - (e.pageX - this._pageX);
                if(width < this._minWidth || widthNext < this._minWidthNext) {
                    return e.preventDefault();
                }
                this._thElem.style.width = width + 'px';
                this._thElemNext.style.width = widthNext + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            this._thElem = undefined;
            this._thElemNext = undefined;
        });
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(_.size(this.getData()) !== _.size(nextProps.data)) {
            if(_.isFunction(this.context.doPagination)) {
                this.context.doPagination({
                    total: _.size(nextProps.data),
                });
            }
        }
    }

    setPage(page) {
        this.setState({
            page,
        });
    }

    getColumns() {
        const columns = this.prop("columns");
        const leftColumns = _.filter(columns, ['float', 'left']);
        const rightColumns = _.filter(columns, ['float', 'right']);
        const restColumns = _.filter(columns, column => column.float !== 'left' && column.float !== 'right');
        return [
            ...leftColumns,
            ...restColumns,
            ...rightColumns,
        ];
    }

    getPaginatedRows() {
        if(this.state.page) {
            return _.slice(this.getData(), this.state.page.startIndex, this.state.page.startIndex + _.toInteger(this.state.page.pageSize));
        }
        else {
            if(this.prop("limit") < 0) {
                return this.getData();
            }
            else {
                return _.slice(this.getData(), 0, this.prop("limit"));
            }
        }
    }

    /**
     * Update the item at the index with the changes
     */
    updateItem(index, changes) {
        this.updateItems([index], [changes]);
    }

    /**
     * Update the items at the index list with the list of changes
     */
    updateItems(indexList, changesList) {
        this._updateItems(indexList, changesList, false);
    }

    _updateItems(indexList, changesList, pending) {
        const newData = _.clone(pending ? this.state.pendingData : this.getData());
        _.forEach(indexList, (index, idx) => {
            const changes = changesList[idx];
            newData[index] = _.assign({}, newData[index], changes);
        });

        this._setValue(newData, pending);
    }

    /**
     * Delete the item at the index
     */
    deleteItem(index) {
        this.deleteItems([index]);
    }

    /**
     * Delete the items at the index list
     */
    deleteItems(indexList) {
        this._deleteItems(indexList, false);
    }

    _deleteItems(indexList, pending) {
        const data = pending ? this.state.pendingData : this.getData();
        const newData = _.reject(data, (item, index) => {
            return _.includes(indexList, index);
        });

        this._setValue(newData, pending);
    }

    /**
     * Insert item at the index
     */
    insertItem(index, item) {
        this.insertItems(index, [item]);
    }

    /**
     * Insert items at the index
     */
    insertItems(index, items) {
        this._insertItems(index, items, false);
    }

    _insertItems(index, items, pending) {
        const data = pending ? this.state.pendingData : this.getData();
        const newData = [
            ...(_.slice(data, 0, index)),
            ...items,
            ...(_.slice(data, index)),
        ];

        this._setValue(newData, pending);
    }

    /**
     * Append item
     */
    appendItem(item) {
        this.appendItems([item]);
    }

    /**
     * Append items
     */
    appendItems(items) {
        this._appendItems(items, false);
    }

    _appendItems(items, pending) {
        const data = pending ? this.state.pendingData : this.getData();
        const newData = [
            ...data,
            ...items,
        ];

        this._setValue(newData, pending);
    }

    /**
     * Set all the data
     */
    setValue(newData) {
        this._setValue(newData, false);
    }

    _setValue(newData, pending) {
        if(pending) {
            this.setState({
                pendingData: newData,
            });
        }
        else {
            if(_.isFunction(this.prop("onValueChange"))) {
                this.prop("onValueChange")(newData);
            }
        }
    }

    _getItem(index, pending) {
        if(pending) {
            return this.state.pendingData && this.state.pendingData[index];
        }
        else {
            return this.getData()[index];
        }
    }

    getCellDefaultValue(item, column) {
        const value = _.get(item, column.name);

        return _.isUndefined(value) || _.isNull(value) ? "" : _.toString(value);
    }

    getDataLabel(column) {
        return getDataLabel(column);
    }

    getCellRenderer(item, rowIndex, column, rowContext) {
        const value = item[column.name];

        if(column.type === 'Currency') {
            return (
                <div className="slds-truncate">
                    <FormattedNumber type="currency" value={ value }></FormattedNumber>
                </div>
            );
        }
        else if(column.type === 'Date') {
            return (
                <div className="slds-truncate">
                    <FormattedDateTime type="date" value={ value }></FormattedDateTime>
                </div>
            );
        }
        else if(column.type === 'DateTime') {
            return (
                <div className="slds-truncate">
                    <FormattedDateTime type="datetime" value={ value }></FormattedDateTime>
                </div>
            );
        }
        else if(_.isFunction(column.cell)) {
            return column.cell(item, this.getCellCallbacks(rowContext), this.context);
        }
        else {
            return (
                <div className="slds-truncate" title={ this.getCellDefaultValue(item, column) }>
                    { this.getCellDefaultValue(item, column) }
                </div>
            );
        }
    }

    getEditableCellRenderer(item, rowIndex, column, rowContext) {
        item = this._getItem(this.toIndex(rowIndex), true);
        const value = item[column.name];
        const callbacks = this.getEditorCallbacks(rowContext);

        if(_.isFunction(column.editor)) {
            return column.editor(item, callbacks, this.context);
        }
        else {
            return renderField(column.type || 'String', _.assign({}, column.editorConfig, {
                name: column.name,
                label: this.getDataLabel(column),
                variant: 'label-removed',
                ref: node => {
                    callbacks.setField(node);
                },
                value,
                onValueChange: newVal => {
                    callbacks.updateItem(callbacks.row.index, {
                        [column.name]: newVal,
                    });
                },
                disabled: rowContext.disabled,
                readonly: rowContext.readonly,
            }));
        }
    }

    cancelInlineEditing() {
        this.setState({
            inlineEditingIndex: null,
            inlineEditingColumn: null,
        });
    }

    saveInlineEditing() {
        Utils.delay(() => {
            if(this.$field) {
                const errorMessage = this.$field.getErrorMessage();
                if(errorMessage) {
                    return;
                }
            }

            this.setState({
                inlineEditingIndex: null,
                inlineEditingColumn: null,
            }, () => {
                this.setValue(this.state.pendingData);
            });
        }, 50);
    }

    getCellCallbacks(rowContext) {
        return {
            appendItem: this.appendItem.bind(this),
            appendItems: this.appendItems.bind(this),
            insertItem: this.insertItem.bind(this),
            insertItems: this.insertItems.bind(this),
            updateItem: this.updateItem.bind(this),
            updateItems: this.updateItems.bind(this),
            deleteItem: this.deleteItem.bind(this),
            deleteItems: this.deleteItems.bind(this),
            setValue: this.setValue.bind(this),
            row: rowContext,
        };
    }

    getEditorCallbacks(rowContext) {
        return {
            appendItem: item => {
                this._appendItems([item], true);
            },

            appendItems: items => {
                this._appendItems(items, true);
            },

            insertItem: (index, item) => {
                this._insertItems(index, [item], true);
            },

            insertItems: (index, items) => {
                this._insertItems(index, items, true);
            },

            updateItem: (index, changes) => {
                this._updateItems([index], [changes], true);
            },

            updateItems: (indexList, changesList) => {
                this._updateItems(indexList, changesList, true);
            },

            deleteItem: index => {
                this._deleteItems([index], true);
            },

            deleteItems: indexList => {
                this._deleteItems(indexList, true);
            },

            setValue: newData => {
                this._setValue(newData, true);
            },

            setField: node => {
                this.$field = node;
            },

            row: rowContext,
        };
    }

    isCellEditing(item, rowIndex, column, rowContext) {
        return this.state.inlineEditingIndex === rowIndex &&
            this.state.inlineEditingColumn &&
            this.state.inlineEditingColumn.name === column.name &&
            this.isCellEditable(item, rowIndex, column, rowContext);
    }

    isCellEditable(item, rowIndex, column, rowContext) {
        const callbacks = this.getEditorCallbacks(rowContext);

        if(_.isFunction(column.editable)) {
            return column.editable(item, callbacks, this.context);
        }
        else {
            return column.editable || _.isFunction(column.editor);
        }
    }

    onExpandTreeGridRow(item) {
        if(!this.isTreeGrid()) {
            return;
        }

        const key = item[this.prop('keyField')];
        if(_.includes(this.state.expanded, key)) {
            this.setState({
                expanded: _.without(this.state.expanded, key),
            });
        }
        else {
            this.setState({
                expanded: [
                    ...(this.state.expanded),
                    key,
                ],
            });
        }
    }

    renderCell(item, rowIndex, column, rowContext, columnIndex) {
        const showExpander = this.isTreeGrid() && columnIndex === 0;

        if(this.isCellEditing(item, rowIndex, column, rowContext)) {
            return (
                <td
                    scope="row"
                    data-label={ this.getDataLabel(column) }
                    className={ column.cellClass }
                >
                    <div className={ window.$Utils.classnames(
                        'slds-grid slds-grid_vertical',
                        styles.inlineEditing
                        ) }>
                        <div>
                            {
                                this.getEditableCellRenderer(item, rowIndex, column, rowContext)
                            }
                        </div>
                        <div className="slds-grid">
                            <ButtonIcon
                                className="slds-col_bump-left"
                                iconName="ctc-utility:a_tick"
                                variant="bare"
                                size="small"
                                onMouseDown={ e => this.saveInlineEditing() }
                                alternativeText="Save">
                            </ButtonIcon>
                            <ButtonIcon
                                className="slds-m-left_small"
                                iconName="ctc-utility:a_clear"
                                variant="bare"
                                size="small"
                                onMouseDown={ e => this.cancelInlineEditing() }
                                alternativeText="Cancel">
                            </ButtonIcon>
                        </div>
                    </div>
                </td>
            );
        }
        else {
            return (
                <td
                    scope="row"
                    data-label={ this.getDataLabel(column) }
                    className={ window.$Utils.classnames(
                        column.cellClass,
                        {
                            'slds-tree__item': showExpander,
                        }
                    ) }
                    onDblClick={ e => this.onInlineEdit(item, rowIndex, column, rowContext) }
                    onClick={ this.onExpandTreeGridRow.bind(this, item) }
                >
                    {
                        showExpander && (
                        <button
                            className={ window.$Utils.classnames(
                            "slds-button slds-button_icon slds-button_icon slds-button_icon-x-small slds-m-right_x-small",
                            {
                                'slds-is-disabled': _.isEmpty(item[this.prop('childrenField')]),
                            }
                            ) }
                            aria-hidden="true"
                            tabindex="-1"
                        >
                            <PrimitiveIcon
                                variant="bare"
                                className="slds-button__icon slds-button__icon_small"
                                iconName="utility:chevronright"
                            >
                            </PrimitiveIcon>
                            <span className="slds-assistive-text"></span>
                        </button>
                        )
                    }
                    {
                        this.isCellEditable(item, rowIndex, column, rowContext) ?
                        <div className="slds-grid slds-grid_vertical-align-center">
                            {
                                this.getCellRenderer(item, rowIndex, column, rowContext)
                            }
                            <ButtonIcon
                                variant="bare"
                                className="slds-m-left_medium"
                                iconName="utility:edit"
                                alternativeText="Edit"
                                onClick={ e => this.onInlineEdit(item, rowIndex, column, rowContext)   }
                            >
                            </ButtonIcon>
                        </div>
                        :
                        this.getCellRenderer(item, rowIndex, column, rowContext)
                    }
                </td>
            );
        }
    }

    onInlineEdit(item, rowIndex, column, rowContext) {
        if(this.isCellEditable(item, rowIndex, column, rowContext)) {
            this.setState({
                inlineEditingIndex: rowIndex,
                inlineEditingColumn: column,
                pendingData: this.getData(),
            });
        }
    }

    toIndex(rowIndex) {
        return this.state.page ? this.state.page.startIndex + rowIndex : rowIndex;
    }

    getNumOfColumns() {
        return _.size(this.getColumns()) + (this.prop("select") === 'none' ? 0 : 1);
    }

    isTableSortable() {
        return _.some(this.prop("columns"), ["sortable", true]);
    }

    isExpanded(item) {
        switch(this.prop("expand")) {
            case 'single':
                return item[this.prop("keyField")] === this.prop("expanded");
            case 'multiple':
                return _.includes(this.prop("expanded"), item[this.prop("keyField")]);
            default:
                return false;
        }
    }

    renderExpander(item, rowIndex, rowContext) {
        const configurer = this.prop('configurer');
        if(configurer && _.isFunction(configurer.createExpander)) {
            if(this.isExpanded(item)) {
                return [
                    <tr key={ `${this.toIndex(rowIndex)}-expander` } className={ styles.rowExpander }>
                        <td colspan={ this.getNumOfColumns() } className={ styles.content }>
                            { configurer.createExpander(item) }
                        </td>
                    </tr>,
                    <tr key={ `${this.toIndex(rowIndex)}-expander-hidden` } className={ styles.rowExpanderHidden }/>
                ];
            }
        }

        return [];
    }

    onRowClicked(item, rowIndex, rowContext) {
        if(!this.prop('allowRowIndicator')) {
            return;
        }

        const clicked = item[this.prop('keyField')];
        this.setState({
            clicked,
        }, () => {
            if(_.isFunction(this.prop('onRowClicked'))) {
                this.prop('onRowClicked')(item);
            }
        });
    }

    renderRow(item, rowIndex, rowContext) {
        if(item) {
            const keyField = this.prop('keyField');
            const key = item[keyField];

            return [
                <tr
                    key={ this.toIndex(rowIndex) }
                    className={ window.$Utils.classnames(
                    {
                        [styles.clickedRow]: this.getClicked() === item[this.prop('keyField')] && this.prop('allowRowIndicator'),
                    }
                    ) }
                    onClick={ this.onRowClicked.bind(this, item, rowIndex, rowContext) }
                    aria-expanded={ !!_.includes(this.state.expanded, key) }
                    aria-level={ this.$nestedLevels[key] }
                >
                    { this.getSelectField(item) }
                    {
                        _.map(this.getColumns(), (column, columnIndex) => this.renderCell(item, rowIndex, column, rowContext, columnIndex))
                    }
                </tr>,
                ...this.renderExpander(item, rowIndex, rowContext)
            ];
        }
        else {
            return (
                <tr key={ this.toIndex(rowIndex) }>
                </tr>
            );
        }
    }

    getSelectAllFieldValue() {
        if(this.prop("select") === 'multiple') {
            return _.size(this.getData()) === _.size(this.prop("selected")) && !_.isEmpty(this.prop("selected"));
        }

        return false;
    }

    handleSelectAll(newVal) {
        if(this.prop("select") === 'multiple') {
            const selected = newVal ?
                _.chain(this.getData()).
                    map(this.prop('keyField')).
                    value()
                : [];

            this.notifyOnSelect(selected);
        }
    }

    notifyOnSelect(selected) {
        if(_.isFunction(this.prop("onSelect"))) {
            this.prop("onSelect")(selected);
        }
    }

    shouldNarrowSelectField() {
        return window.$Utils.isDesktopScreenSize();
    }

    getSelectAllFieldRaw() {
        return (
            <Input type="checkbox" variant="label-hidden" name="selectAll" label="Select All" value={ this.getSelectAllFieldValue() } onValueChange={ newVal => this.handleSelectAll(newVal) }></Input>
        );
    }

    getSelectAllField() {
        if(this.prop("select") === 'multiple') {
            return (
                <th style={ this.shouldNarrowSelectField() && this.prop('selectColumnStyle')}>
                    { this.getSelectAllFieldRaw() }
                </th>
            );
        }
        else if(this.prop("select") === 'single') {
            return (
                <th style={ this.shouldNarrowSelectField() && this.prop('selectColumnStyle')}>
                </th>
            );
        }
        else {
            return null;
        }
    }

    getSelectFieldValue(item) {
        const key = item[this.prop('keyField')];
        if(this.prop("select") === 'multiple') {
            return _.includes(this.prop("selected"), key);
        }
        else if(this.prop("select") === 'single') {
            return this.prop("selected") === key;
        }
    }

    handleSelect(newVal, item) {
        const key = item[this.prop('keyField')];
        let selected = this.prop("selected");
        if(this.prop("select") === 'multiple') {
            if(newVal) {
                selected = [...(selected || []), key];
            }
            else {
                selected = _.without(selected, key);
            }
        }
        else if(this.prop('select') === 'single') {
            selected = key;
        }

        this.notifyOnSelect(selected);
    }

    getSelectField(item) {
        if(this.prop("select") === 'multiple') {
            return (
                <td style={ this.shouldNarrowSelectField() && this.prop('selectColumnStyle')}>
                    <Input type="checkbox" variant="label-hidden" name="select" label="Select" value={ this.getSelectFieldValue(item) } onValueChange={ newVal => this.handleSelect(newVal, item) }></Input>
                </td>
            );
        }
        else if(this.prop("select") === 'single') {
            return (
                <td style={ this.shouldNarrowSelectField() && this.prop('selectColumnStyle')}>
                    <Input type="radio" variant="label-hidden" name="select" label="Select" value={ this.getSelectFieldValue(item) } onValueChange={ newVal => this.handleSelect(newVal, item) }></Input>
                </td>
            );
        }
        else {
            return null;
        }
    }

    getColumnSorted(column) {
        if(this.state.sorted === null && column.sorted) {
            return column.sorted;
        }

        if(this.state.sorted !== column.name) {
            return Sorted.NONE;
        }

        return this.state.sortedAscending ? Sorted.ASC : Sorted.DESC;
    }

    renderHeaderCellLabel(column) {
        if(_.isString(column.header)) {
            return (
                <div className="slds-truncate" title={ column.header }>{ column.header }</div>
            );
        }
        else if(_.isFunction(column.header)) {
            return column.header(this.context);
        }
    }

    sortColumn(column) {
        if(this.getColumnSorted(column) === Sorted.DESC) {
            this.sortColumnBy(column, true);
        }
        else {
            this.sortColumnBy(column, false);
        }
    }

    getSortByFunction(column) {
        if(_.isFunction(column.sortBy)) {
            return column.sortBy;
        }

        switch(column.sortBy) {
            case 'Number':
                return row => _.parseInt(_.get(row, column.name));
            case 'String':
                return row => _.toString(_.get(row, column.name));
            default:
                return row => _.toString(_.get(row, column.name));
        }
    }

    sortColumnBy(column, isAscending) {
        let sortedData;
        if (column.sortBy === 'Alphanumeric') {
            sortedData = _(this.getData())
                .sort(function (a, b) {
                    return _.get(a, column.name).localeCompare(_.get(b, column.name), undefined, {numeric: true});
                })
                .value();
        } else {
            sortedData = _.sortBy(this.getData(), this.getSortByFunction(column));
        }
        sortedData = isAscending ? sortedData : _.reverse(sortedData);

        this.setState({
            sorted: column.name,
            sortedAscending: isAscending,
        }, () => this.notifyOnSort(sortedData));
    }

    notifyOnSort(sortedData) {
        if(_.isFunction(this.prop("onSort"))) {
            this.prop("onSort")(sortedData);
        }
        else if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(sortedData);
        }
    }

    renderHeaderCellUI(column, columnIndex) {
        let elements = [];
        if(column.sortable) {
            if(_.isString(column.header)) {
                elements = [
                    <a className="slds-th__action slds-text-link_reset" role="button" tabindex="0" onClick={ e => this.sortColumn(column) }>
                        <span className="slds-assistive-text">Sort by: </span>
                        { this.renderHeaderCellLabel(column) }
                        <div className="slds-icon_container">
                            <PrimitiveIcon iconName="utility:arrowdown" variant="default" size="x-small" className="slds-is-sortable__icon"></PrimitiveIcon>
                        </div>
                    </a>,
                    <span className="slds-assistive-text" aria-live="assertive" aria-atomic="true">Sorted { this.getColumnSorted(column) }</span>
                ];
            }
            else {
                elements = [
                    this.renderHeaderCellLabel(column),
                    <a className="slds-th__action slds-text-link_reset" role="button" tabindex="0" onClick={ e => this.sortColumn(column) }>
                        <span className="slds-assistive-text">Sort by { column.name } </span>
                        <div className="slds-icon_container">
                            <PrimitiveIcon iconName="utility:arrowdown" variant="default" size="x-small" className="slds-is-sortable__icon"></PrimitiveIcon>
                        </div>
                    </a>,
                    <span className="slds-assistive-text" aria-live="assertive" aria-atomic="true">Sorted { this.getColumnSorted(column) }</span>
                ];
            }
        }
        else {
            elements = [this.renderHeaderCellLabel(column)];
        }

        if(this.prop("resizable")) {
            const canResize = columnIndex !== _.size(this.getColumns()) - 1;
            const min = column.minWidth || 50;
            const max = column.maxWidth || 1000;

            elements.push(
                <div className="slds-resizable" onMouseDown={ e => canResize && this.onResizeStart(e, column, columnIndex) } onMouseOver={ e => canResize && this.onResizeHover(e, column, columnIndex) }>
                    <input type="range" min={ min } max={ max } className="slds-resizable__input slds-assistive-text"></input>
                    <span className="slds-resizable__handle">
                        <span className={ `slds-resizable__divider ${styles.cancelEvent}` }></span>
                    </span>
                </div>
            );
        }

        return elements;
    }

    initializeThWidths(thElems) {
        _.each(thElems, function(thElem) {
            if(!thElem.style.width) {
                thElem.style.width = thElem.offsetWidth + "px";
            }
        });
    }

    onResizeStart(e, column, columnIndex) {
        const target = e.currentTarget;
        if(columnIndex >= 0) {
            const root = this.base;
            const thElems = root.querySelectorAll(":scope>thead>tr>th");
            this.initializeThWidths(thElems);
            const selectedIndex = this.prop("select") === 'none' ? columnIndex : columnIndex + 1;
            this._pageX = e.pageX;
            this._thElem = thElems[selectedIndex];
            this._thElemNext = thElems[selectedIndex + 1];
            this._minWidth = _.parseInt(this._thElem.querySelector(".slds-resizable__input").getAttribute("min"));
            this._minWidthNext = _.parseInt(this._thElemNext.querySelector(".slds-resizable__input").getAttribute("min"));
            this._startOffset = this._thElem.offsetWidth;
            this._startOffsetNext = this._thElemNext.offsetWidth;
        }
    }

    onResizeHover(e, column, columnIndex) {
        const target = e.currentTarget;
        if(columnIndex >= 0 && this.$showLimitedResizableDivider) {
            const root = this.base;
            const dividers = root.querySelectorAll(":scope>thead>tr>th .slds-resizable__divider");
            const bodyHeight = root.offsetHeight;
            _.each(dividers, function(divider) {
                divider.style.height = bodyHeight + "px";
            });
        }
    }

    renderHeaderCell(column, columnIndex) {
        const headerStyle = {};
        if(column.minWidth) {
            headerStyle.minWidth = column.minWidth + 'px';
        }

        return (
            <th
                aria-sort={ this.getColumnSorted(column) }
                scope="col"
                className={ window.$Utils.classnames(
                styles.thCell,
                {
                    'slds-is-sortable': column.sortable,
                    'slds-is-sorted slds-is-sorted_desc': this.getColumnSorted(column) === Sorted.DESC,
                    'slds-is-sorted slds-is-sorted_asc': this.getColumnSorted(column) === Sorted.ASC,
                },
                column.headerClass
                ) }
                style={ headerStyle }
                data-name={ column.name }
            >
                { this.renderHeaderCellUI(column, columnIndex) }
            </th>
        );
    }

    getRowContext(paginatedRows, rowIndex, disabled, readonly) {
        const indexInPage = rowIndex;
        const isFirstInPage = rowIndex === 0;
        const isLastInPage = rowIndex === _.size(paginatedRows) - 1;

        const index = this.toIndex(indexInPage);
        const isFirst = index === 0;
        const isLast = index === _.size(this.getData()) - 1;

        return {
            indexInPage,
            isFirstInPage,
            isLastInPage,
            index,
            isFirst,
            isLast,
            disabled,
            readonly,
        };
    }

    onKeyDown(e) {
        const paginatedRows = this.getPaginatedRows();
        let newRowIndex = _.findIndex(paginatedRows, row => row[this.prop('keyField')] === this.getClicked());
        if(e.keyCode === KBI.KeyCodes.Up) {
            e.preventDefault();
            newRowIndex -= 1;
            newRowIndex = newRowIndex < 0 ? 0 : newRowIndex;
        }
        else if(e.keyCode === KBI.KeyCodes.Down) {
            e.preventDefault();
            const size = _.size(paginatedRows);
            newRowIndex += 1;
            newRowIndex = newRowIndex > size - 1 ? size - 1 : newRowIndex;
        }

        const row = paginatedRows[newRowIndex];
        const rowContext = this.getRowContext(paginatedRows, newRowIndex, this.prop('disabled'), this.prop('readonly'));

        this.onRowClicked(row, newRowIndex, rowContext);
    }

    renderTable(props, state, applyClass) {
        const [{
            className,
            variant,
            data,
            columns,
            disabled,
            readonly,
        }, rest] = this.getPropValues();

        const paginatedRows = this.getPaginatedRows();

        return (
            <table className={ window.$Utils.classnames(
                'slds-table slds-table_bordered',
                {
                    'slds-table_cell-buffer': variant === 'default',
                    'slds-table_cell-buffer slds-table_striped': variant === 'striped',
                    'slds-max-medium-table_stacked-horizontal': variant === 'responsive',
                    'slds-table_fixed-layout': this.isTableSortable() || this.prop("resizable"),
                    'slds-table_custom-resizable': this.prop("resizable"),
                    'slds-tree slds-table_tree': this.isTreeGrid(),
                },
                styles.table,
                applyClass && className,
                ) }
                tabIndex="0"
                onKeyDown={ this.onKeyDown.bind(this) }
                data-type={ this.getTypeName() }
                { ...rest }>
                <thead>
                    <tr className="slds-text-title_caps">
                        { this.getSelectAllField() }
                        {
                            _.map(this.getColumns(), (column, columnIndex) => this.renderHeaderCell(column, columnIndex))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        _.flatMap(paginatedRows, (row, rowIndex) => this.renderRow(row, rowIndex, this.getRowContext(paginatedRows, rowIndex, disabled, readonly)))
                    }
                    {
                        _.isEmpty(paginatedRows) && (
                        <tr className={ styles.emptyTable }>
                            <td colspan={ this.getNumOfColumns() } className={ styles.emptyRow }>
                                No items to display.
                            </td>
                        </tr>
                        )
                    }
                </tbody>
            </table>
        );
    }

    render(props, state) {
        const select = this.prop('select');
        const showSelectAll = (select === 'multiple' && window.$Utils.isNonDesktopBrowser());
        if(showSelectAll) {
            return (
                <div className={ this.prop('className') }>
                    {
                        <div className="slds-grid slds-grid_vertical-align-center slds-m-right_small">
                            <div className="slds-col_bump-left slds-m-right_small"> Select/Deselct All:</div>
                            { this.getSelectAllFieldRaw() }
                        </div>
                    }
                    { this.renderTable(props, state, false) }
                </div>
            );
        }
        else {
            return this.renderTable(props, state, true);
        }
    }
}

Table.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'default',
        'striped',
        'responsive',
    ]).defaultValue('striped').demoValue('striped'),
    data: PropTypes.isArray('data').defaultValue([]),
    keyField: PropTypes.isString('keyField').defaultValue('id').demoValue('id'),
    columns: PropTypes.isArray('columns').required().shape({
        name: PropTypes.isString('name').required(),
        type: PropTypes.isString('type').values([
            'String',
            'Currency',
            'Date',
            'DateTime',
        ]).defaultValue('String'),
        header: PropTypes.isObject('header'),
        headerClass: PropTypes.isString('headerClass'),
        label: PropTypes.isString('label'),
        cell: PropTypes.isFunction('cell'),
        cellClass: PropTypes.isString('cellClass'),
        editor: PropTypes.isFunction('editor').description('Render the inline editor'),
        editable: PropTypes.isObject('editable').description('If true, use default inline editor specified by type, if editor is not specified'),
        editorConfig: PropTypes.isObject('editorConfig').description('Render config passed to the default inline editor'),
        sortable: PropTypes.isBoolean('sortable'),
        sortBy: PropTypes.isObject('sortBy').description('sortBy could be a string indicating the type(String/Number) or a function(list of functions) that receives one arguments'),
        sorted: PropTypes.isString('sorted').values([
            'none',
            'ascending',
            'descending',
        ]).defaultValue('none'),
        minWidth: PropTypes.isNumber('minWidth').description('min width when resizing'),
        float: PropTypes.isString('float').values([
            'left',
            'right',
        ]).description('decide where the columns float in the table'),
        searchBy: PropTypes.isObject('searchBy').description('searchBy is a flexible property to help with table searching'),
        filterBy: PropTypes.isObject('filterBy').description('filterBy is a flexible property to help with table filtering'),
        locked: PropTypes.isBoolean('locked').description('column is always displayed in the table'),
        fieldName: PropTypes.isString('fieldName').description('mapped field name in sobject'),
    }),
    limit: PropTypes.isNumber('limit').defaultValue(10).demoValue(10).description("Limit the number of rows to be loaded"),
    select: PropTypes.isString('select').values([
        'none',
        'single',
        'multiple',
    ]).defaultValue('none').demoValue('none'),
    expand: PropTypes.isString('expand').values([
        'none',
        'single',
        'multiple',
    ]).defaultValue('none').demoValue('none'),
    configurer: PropTypes.isObject('configurer').shape({
        createExpander: PropTypes.isFunction('createExpander'),
    }),
    resizable: PropTypes.isBoolean('resizable').demoValue(false),
    disabled: PropTypes.isBoolean('disabled').defaultValue(false).demoValue(false),
    readonly: PropTypes.isBoolean('readonly').defaultValue(false).demoValue(false),
    selected: PropTypes.isObject('selected'),
    expanded: PropTypes.isObject('expanded'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    onSelect: PropTypes.isFunction('onSelect').description("notify with the key fields of the selected rows"),
    onSort: PropTypes.isFunction('onSort').description("callback when the table data is sorted"),
    clickedId: PropTypes.isObject('clickedId'),
    onRowClicked: PropTypes.isFunction('onRowClicked').description("callback when a row is clicked"),
    allowRowIndicator: PropTypes.isBoolean('allowRowIndicator').demoValue(false),
    childrenField: PropTypes.isString('childrenField'),
    selectColumnStyle: PropTypes.isString('selectColumnStyle').defaultValue('width: 2rem; padding-left: 0.8rem; padding-right: 0.8rem;'),
};

Table.propTypesRest = true;
Table.displayName = "Table";
