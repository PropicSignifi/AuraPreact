import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import PageHeader from '../pageHeader/pageHeader';
import Picklist from '../picklist/picklist';
import ButtonMenu from '../menu/buttonMenu';
import ButtonStateful from '../buttonStateful/buttonStateful';
import TableManager from '../table/TableManager';
import Button from '../button/button';
import { Icon, } from '../icon/icon';
import { getDataLabel, } from '../table/table';
import Spinner from '../spinner/spinner';
import Utils from '../utils/utils';
import Illustration from '../illustration/illustration';
import styles from './styles.less';

import { Observable, Subject, } from 'rxjs';

export default class ItemManager extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            filteredData: null,
            mode: null,
            loadedItem: null,
            loading: false,
            expanded: true,
        });

        this._lastData = null;
    }

    getLoadedItem() {
        return this.state.loadedItem || this.prop('clickedItem');
    }

    getClickedId() {
        const item = this.getLoadedItem();
        return item && item[this.prop('keyField')];
    }

    componentDidUpdate() {
        super.componentDidUpdate();

        const data = this.prop('data');
        if(this.prop('autofocus') &&
            this.getMode() === 'List' &&
            data !== this._lastData &&
            !_.isEmpty(data)) {
            this.onRowClicked(_.first(data));
        }

        this._lastData = data;
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.debounceTime(200).switchMap(item => {
                this.setState({
                    loading: true,
                });
                return Observable.fromPromise(this.loadItem(item))
                    .catch(error => {
                        Utils.catchError(error);

                        return Observable.of(null);
                    });
            }).subscribe(data => {
                this.setState({
                    loading: false,
                }, () => {
                    this.setClickedItem(data);
                });
            });
        }

        this.onGlobalKeyDown = e => {
            if(e.ctrlKey && e.keyCode === 77) {
                // Ctrl + M
                this.setState({
                    expanded: !this.state.expanded,
                });

                e.preventDefault();
            }
        };

        document.addEventListener('keydown', this.onGlobalKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onGlobalKeyDown);
    }

    setClickedItem(item) {
        if(_.isFunction(this.prop('onRowClicked'))) {
            this.prop('onRowClicked')(item);
        } else {
            this.setState({
                loadedItem: item,
            });
        }
    }

    onMenuItemSelected(newVal) {
        if(_.isFunction(this.prop('onMenuItemSelected'))) {
            this.prop('onMenuItemSelected')(newVal);
        }
    }

    createActions() {
        const menuItems = this.prop('menuItems');

        if(menuItems) {
            return (
                <ButtonMenu
                    variant="border-filled"
                    menuAlignment="right"
                    iconName="ctc-utility:a_down"
                    iconSize="medium"
                    name="actions"
                    onSelect={ this.onMenuItemSelected.bind(this) }
                >
                    { menuItems }
                </ButtonMenu>
            );
        }
    }

    setView(newView) {
        if(_.isFunction(this.prop('onViewChange'))) {
            this.prop('onViewChange')(newView);
        }
    }

    createHeaderText() {
        const data = this.state.filteredData || this.prop('data');
        const size = _.size(data);
        return size === 1 ? `${size} item` : `${size} items`;
    }

    onFilter(newData) {
        this.setState({
            filteredData: newData,
        });
    }

    createListItemEditor(item) {
        if(_.isFunction(this.prop('renderItemSummary'))) {
            return (
                <div className={ window.$Utils.classnames(
                    `slds-p-around_medium slds-border_bottom ${styles.listItem}`
                    ) }>
                    {
                        this.prop('renderItemSummary')(item)
                    }
                </div>
            );
        }
    }

    getMode() {
        return this.state.mode || this.prop('mode');
    }

    onModeChange(newVal) {
        if(_.isFunction(this.prop('onModeChange'))) {
            this.prop('onModeChange')(newVal);
            this.setClickedItem(null);
        }
        else {
            this.setState({
                mode: newVal,
            }, () => {
                this.setClickedItem(null);
            });
        }
    }

    loadItem(item) {
        if(_.isFunction(this.prop('loadItem'))) {
            const p = this.prop('loadItem')(item);
            if(!_.isFunction(p.then)) {
                return Promise.resolve(p);
            }
            else {
                return p;
            }
        }
        else {
            return Promise.resolve(item);
        }
    }

    onRowClicked(item) {
        this.subject.next(item);
    }

    renderSortedInfo(sortedColumn) {
        if(sortedColumn && this.getMode() === 'List') {
            const label = getDataLabel(sortedColumn);
            const iconName = sortedColumn.sorted === 'ascending' ? 'utility:arrowup' : 'utility:arrowdown';
            return (
                <div className={ window.$Utils.classnames(
                    "slds-text-title_caps",
                    "slds-grid slds-grid_vertical-align-center",
                    "slds-p-vertical_x-small slds-p-left_medium",
                    "slds-border_bottom",
                    styles.sortedInfo
                    ) }>
                    { label }
                    <Icon
                        className="slds-m-left_x-small"
                        iconName={ iconName }
                        size="x-small"
                        variant="default"
                    >
                    </Icon>
                </div>
            );
        }
    }

    renderMainView(viewClassName) {
        const [{
            className,
            name,
            iconName,
            iconClass,
            title,
            views,
            view,
            columns,
            data,
            modes,
            mode,
            pageSize,
            onReload,
        }, rest] = this.getPropValues();

        const sortedColumn = _.find(columns, column => column.sorted === 'ascending' || column.sorted === 'descending');

        return (
            <div className={ viewClassName }>
                <PageHeader
                    className={
                        window.$Utils.classnames(
                            {
                                [styles.listViewBackground]: this.getMode() === 'List',
                            },
                            styles.pageHeader
                        )
                    }
                    iconName={ iconName }
                    iconClass={ iconClass }
                    title={ title }
                    actions={ this.createActions() }>
                    <Picklist
                        name="views"
                        label="List Views"
                        variant="label-removed"
                        type="link"
                        popupClass="slds-width_min-content"
                        required="true"
                        options={ views }
                        value={ view }
                        onValueChange={ this.setView.bind(this) }
                    ></Picklist>
                </PageHeader>
                <TableManager
                    { ...rest }
                    tableClassName="slds-table_cell-buffer"
                    tableHeaderClassName={
                        window.$Utils.classnames(
                            "slds-p-top_none slds-border_bottom slds-p-bottom_small slds-p-horizontal_medium ",
                            {
                                [styles.listViewBackground]: this.getMode() === 'List',
                            },
                            styles.tableHeader
                        )
                    }
                    paginatorClassName="slds-p-around_medium"
                    name={ name }
                    header={ this.createHeaderText() }
                    top={ this.renderSortedInfo(sortedColumn) }
                    customisedActions={ this.prop('customisedActions') }
                    columns={ columns }
                    data={ data }
                    modes={ modes }
                    mode={ this.getMode() }
                    onModeChange={ this.onModeChange.bind(this) }
                    pageSize={ pageSize }
                    onReload={ onReload }
                    onFilter={ this.onFilter.bind(this) }
                    allowRowIndicator="true"
                    clickedId={ this.getClickedId() }
                    onRowClicked={ this.onRowClicked.bind(this) }
                    createListItemEditor={ this.createListItemEditor.bind(this) }
                    style={ this.getMode() === 'List' ? 'compact' : 'standard' }
                >
                </TableManager>
            </div>
        );
    }

    getCallbacks() {
        return {
            back: this.onCancelItemDetail.bind(this),
        };
    }

    renderItemDetail() {
        if(this.getLoadedItem()) {
            return this.prop('renderItemDetail')(this.getLoadedItem(), this.getCallbacks());
        }
        else {
            return this.getMode() === 'List' && (
                <Illustration
                    className="slds-m-around_medium"
                    variant="large"
                    type="no_content"
                >
                </Illustration>
            );
        }
    }

    onCancelItemDetail() {
        this.setClickedItem(null);
    }

    onSwitchExpanded(newVal) {
        this.setState({
            expanded: newVal,
        });
    }

    render(props, state) {
        const mode = this.getMode();
        if(window.$Utils.isNonDesktopBrowser() || mode === 'Table') {
            return (
                <div
                    className={ `${styles.rootStyle} ${props.className}` }
                    data-type={ this.getTypeName() }
                    data-name={ this.prop('name') }
                >
                    {
                        state.loading ?
                        <Spinner variant="brand" size="medium" container="with" alternativeText="loading"></Spinner>
                        : null
                    }
                    <div className={ !this.getLoadedItem() ? 'slds-hide': '' }>
                        <div className="slds-p-around_medium slds-border_bottom slds-grid">
                            <Button variant="tertiary" label="Back" onClick={ this.onCancelItemDetail.bind(this) }></Button>
                        </div>
                        <div className="">
                            { this.renderItemDetail() }
                        </div>
                    </div>
                    {
                        this.renderMainView(this.getLoadedItem() ? 'slds-hide' : '')
                    }
                </div>
            );
        }
        else {
            return (
                <div
                    className={ `${styles.rootStyle} ${props.className}` }
                    data-type={ this.getTypeName() }
                    data-name={ this.prop('name') }
                >
                    {
                        state.loading ?
                        <Spinner variant="brand" size="medium" container="with" alternativeText="loading"></Spinner>
                        : null
                    }
                    {
                        mode === 'List' && _.isFunction(this.prop('renderItemDetail')) ?
                        <div className="slds-grid">
                            <div className={ window.$Utils.classnames(
                                `slds-col slds-size_1-of-4`,
                                `slds-grid ${styles.listViewBackground}`,
                                {
                                    [styles.collapsed]: !this.state.expanded,
                                    [styles.listView]: this.state.expanded,
                                }
                                ) }>
                                <div className={ window.$Utils.classnames(
                                    'slds-col',
                                    {
                                        'slds-hide': !this.state.expanded,
                                    }
                                    ) }>
                                    { this.renderMainView() }
                                </div>
                                <ButtonStateful
                                    className={ styles.separator }
                                    iconNameWhenOn="utility:left"
                                    iconNameWhenHover="utility:left"
                                    iconNameWhenOff="utility:right"
                                    iconSize="x-small"
                                    state={ this.state.expanded }
                                    onClick={ this.onSwitchExpanded.bind(this) }
                                >
                                </ButtonStateful>
                            </div>
                            <div className="slds-col slds-shrink">
                                { this.renderItemDetail() }
                            </div>
                        </div>
                        :
                        this.renderMainView()
                    }
                </div>
            );
        }
    }
}

ItemManager.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    iconName: PropTypes.isString('iconName').demoValue('ctc-standard:people'),
    iconClass: PropTypes.isString('iconClass').demoValue('slds-background_blue'),
    title: PropTypes.isString('title').demoValue('Items'),
    views: PropTypes.isArray('views').required(),
    view: PropTypes.isString('view'),
    onViewChange: PropTypes.isFunction('onViewChange'),
    menuItems: PropTypes.isArray('menuItems'),
    onMenuItemSelected: PropTypes.isFunction('onMenuItemSelected'),
    columns: PropTypes.isArray('columns').defaultValue([]),
    data: PropTypes.isArray('data').defaultValue([]),
    onValueChange: PropTypes.isFunction('onValueChange'),
    mode: PropTypes.isString('mode').values([
        'Table',
        'List',
    ]).defaultValue('Table').demoValue('Table'),
    modes: PropTypes.isArray('modes').defaultValue([
        'Table',
        'List',
    ]),
    onModeChange: PropTypes.isFunction('onModeChange'),
    pageSize: PropTypes.isNumber('pageSize').defaultValue(10).demoValue(10),
    onReload: PropTypes.isFunction('onReload'),
    clickedItem: PropTypes.isObject('clickedItem'),
    onRowClicked: PropTypes.isFunction('onRowClicked'),
    renderItemSummary: PropTypes.isFunction('renderItemSummary'),
    renderItemDetail: PropTypes.isFunction('renderItemDetail'),
    keyField: PropTypes.isString('keyField').defaultValue('id'),
    loadItem: PropTypes.isFunction('loadItem'),
    autofocus: PropTypes.isBoolean('autofocus').demoValue(false),
    customisedActions: PropTypes.isArray('customisedActions'),
};

ItemManager.propTypesRest = true;
ItemManager.displayName = "ItemManager";
