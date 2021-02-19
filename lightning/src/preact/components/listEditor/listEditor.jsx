import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import KBI from '../utils/kbi';
import styles from './styles.less';

export default class ListEditor extends BaseComponent {
    constructor() {
        super();

        this.state = {
            page: null,
            clicked: null,
        };
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerPaginated) && _.isFunction(this.context.doPagination)) {
            this.context.registerPaginated(this);
            this.context.doPagination({
                total: _.size(this.prop("data")),
            });
        }
    }

    getClicked() {
        if(_.isNil(this.prop('clickedId'))) {
            return this.state.clicked;
        }
        else {
            return this.prop('clickedId');
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(_.size(this.prop("data")) !== _.size(nextProps.data)) {
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

    getPaginatedRows() {
        if(this.state.page) {
            return _.slice(this.prop("data"), this.state.page.startIndex, this.state.page.startIndex + this.state.page.pageSize);
        }
        else {
            if(this.prop("limit") < 0) {
                return this.prop("data");
            }
            else {
                return _.slice(this.prop("data"), 0, this.prop("limit"));
            }
        }
    }

    updateItem(index, changes) {
        const newData = _.clone(this.prop("data"));
        const updatedItem = _.assign({}, newData[index], changes);
        newData[index] = updatedItem;

        if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(newData);
        }
    }

    getCallbacks(rowContext) {
        return {
            updateItem: this.updateItem.bind(this),
            row: rowContext,
        };
    }

    getRowContext(paginatedRows, rowIndex) {
        const indexInPage = rowIndex;
        const isFirstInPage = rowIndex === 0;
        const isLastInPage = rowIndex === _.size(paginatedRows) - 1;

        const index = this.toIndex(indexInPage);
        const isFirst = index === 0;
        const isLast = index === _.size(this.prop('data')) - 1;

        return {
            indexInPage,
            isFirstInPage,
            isLastInPage,
            index,
            isFirst,
            isLast,
        };
    }

    toIndex(rowIndex) {
        return this.state.page ? this.state.page.startIndex + rowIndex : rowIndex;
    }

    onRowClicked(item, rowIndex, rowContext) {
        const clicked = item[this.prop('keyField')];
        this.setState({
            clicked,
        }, () => {
            if(_.isFunction(this.prop('onRowClicked'))) {
                this.prop('onRowClicked')(item);
            }
        });
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
        const rowContext = this.getRowContext(paginatedRows, newRowIndex);

        this.onRowClicked(row, newRowIndex, rowContext);
    }

    render(props, state) {
        const [{
            className,
            data,
            createEditor,
        }, rest] = this.getPropValues();

        if(!_.isFunction(createEditor)) {
            throw new Error("'createEditor' should be provided as a function");
        }

        const paginatedRows = this.getPaginatedRows();

        return (
            <ul
                className={ window.$Utils.classnames(
                    styles.listEditor,
                    className
                ) }
                onKeyDown={ this.onKeyDown.bind(this) }
                tabIndex="0"
                data-type={ this.getTypeName() }
                { ...rest }
            >
                {
                    _.map(paginatedRows, (item, rowIndex) => {
                        const rowContext = this.getRowContext(paginatedRows, rowIndex);

                        return (
                        <li
                            key={ rowIndex }
                            className={ window.$Utils.classnames(
                            {
                                [styles.clickedRow]: item && item[this.prop('keyField')] === this.getClicked() && this.prop('allowRowIndicator'),
                            }
                            ) }
                            onClick={ this.onRowClicked.bind(this, item, rowIndex, rowContext) }
                        >
                            { createEditor(item, this.getCallbacks(rowContext), this.context) }
                        </li>
                        );
                    })
                }
                {
                    _.isEmpty(paginatedRows) && (
                    <li className={ styles.emptyRow }>
                        No items to display.
                    </li>
                    )
                }
            </ul>
        );
    }
}

ListEditor.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    data: PropTypes.isArray('data').required(),
    createEditor: PropTypes.isFunction('createEditor').required(),
    limit: PropTypes.isNumber('limit').defaultValue(10).demoValue(10).description("Limit the number of rows to be loaded"),
    onValueChange: PropTypes.isFunction('onValueChange'),
    onRowClicked: PropTypes.isFunction('onRowClicked').description("callback when a row is clicked"),
    allowRowIndicator: PropTypes.isBoolean('allowRowIndicator').demoValue(false),
    keyField: PropTypes.isString('keyField').defaultValue('id').demoValue('id'),
    clickedId: PropTypes.isObject('clickedId'),
};

ListEditor.propTypesRest = true;
ListEditor.displayName = "ListEditor";
