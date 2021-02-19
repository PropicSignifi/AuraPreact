import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import TableManager from './TableManager';
import createLoadingIndicator from '../busyloading/busyloading';

export default class DynamicTable extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            data: [],
        });

        this.bind([
            'onDataChange',
        ]);

        this.$loadingIndicator = createLoadingIndicator(false);
        this.$table = null;
    }

    componentDidMount() {
        super.componentDidMount();

        this.reloadData(this.prop('query'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(nextProps.query !== this.props.query) {
            this.reloadData(nextProps.query);
        }
    }

    onDataChange(newData) {
        this.setState({
            data: newData,
        }, () => {
            if(_.isFunction(this.prop('onDataLoaded'))) {
                this.prop('onDataLoaded')(newData);
            }
        });
    }

    reloadData(query) {
        this.$loadingIndicator.until(
            window.$ActionService.DataLightningExtension.invoke('runQuery', {
                query,
            }).then(data => {
                this.onDataChange(data);
            })
        );
    }

    reload() {
        this.reloadData(this.prop('query'));
    }

    getTable() {
        return this.$table;
    }

    render(props, state) {
        const [{
            className,
            columns,
            query,
            name,
            children,
        }, rest] = this.getPropValues();

        const LoadingZone = this.$loadingIndicator.Zone;

        return (
            <LoadingZone
            >
                <TableManager
                    ref={ node => this.$table = node }
                    className={ className }
                    name={ name }
                    columns={ columns }
                    keyField="Id"
                    data={ this.state.data }
                    onReload={ () => this.reloadData(query) }
                    onSort={ this.onDataChange }
                    { ...rest }
                    data-type={ this.getTypeName() }
                    data-name={ name }
                >
                    { children }
                </TableManager>
            </LoadingZone>
        );
    }
}

DynamicTable.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    columns: PropTypes.isArray('columns'),
    query: PropTypes.isString('query').demoValue('SELECT Id, Name FROM ACCOUNT LIMIT 10'),
    name: PropTypes.isString('name').required(),
    onDataLoaded: PropTypes.isFunction('onDataLoaded'),
    children: PropTypes.isChildren('children'),
};

DynamicTable.propTypesRest = true;
DynamicTable.displayName = "DynamicTable";
